# gg-common.ps1 - shared helpers for the Gregtech Grindless test harness.
# Runs on the home test PC (Windows PowerShell 5.1). Dot-sourced by the other remote scripts.
# Only touches D:\GregtechGrindless\ (override with $env:GG_BASE).

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
try { [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12 } catch {}
# The PC is es-ES: force invariant formatting/parsing so numbers and dates are predictable.
[Threading.Thread]::CurrentThread.CurrentCulture = [Globalization.CultureInfo]::InvariantCulture
[Threading.Thread]::CurrentThread.CurrentUICulture = [Globalization.CultureInfo]::InvariantCulture
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

if (-not $global:GG) {
    $base = $env:GG_BASE
    if (-not $base) { $base = 'D:\GregtechGrindless' }
    $global:GG = @{
        Base         = $base
        Tools        = Join-Path $base 'tools'
        Cache        = Join-Path $base 'cache'
        Sync         = Join-Path $base 'sync'
        Hmc          = Join-Path $base 'hmc'
        Runs         = Join-Path $base 'runs'
        Incoming     = Join-Path $base 'incoming'
        LockPath     = Join-Path (Join-Path $base 'runs') '.lock'
        LockStaleMin = 60
        RampSec      = 40
        PollSec      = 15
        RunId        = ''
        RunDir       = ''
        ResultsDir   = ''
        RunLog       = ''
        Stages       = (New-Object System.Collections.ArrayList)
        HasLock      = $false
        Slot         = -1
        Slots        = 2
        ReserveGb    = 0.0
        JvmStarted   = ''
        LockStarted  = ''
        SlotOthers   = @()
        SlotFree     = $null
        LastBeat     = [datetime]::MinValue
        StageStatus  = 'PASS'
        StageDetail  = ''
    }
}

$cs = @'
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Net.Sockets;
using System.Text;

// Child process with stdout/stderr drained on background threads into files, stdin kept open.
public class GGProc
{
    public Process P;
    private StreamWriter outW;
    private StreamWriter errW;
    private readonly object lk = new object();

    public int Id { get { return P.Id; } }
    public bool HasExited { get { return P.HasExited; } }
    public int ExitCode { get { return P.ExitCode; } }

    public static GGProc Start(string file, string args, string workDir, string outPath, string errPath, string[] env)
    {
        GGProc g = new GGProc();
        ProcessStartInfo psi = new ProcessStartInfo(file, args);
        psi.WorkingDirectory = workDir;
        psi.UseShellExecute = false;
        psi.CreateNoWindow = true;
        psi.RedirectStandardInput = true;
        psi.RedirectStandardOutput = true;
        psi.RedirectStandardError = true;
        psi.StandardOutputEncoding = Encoding.UTF8;
        psi.StandardErrorEncoding = Encoding.UTF8;
        if (env != null)
        {
            foreach (string kv in env)
            {
                int i = kv.IndexOf('=');
                if (i > 0) psi.EnvironmentVariables[kv.Substring(0, i)] = kv.Substring(i + 1);
            }
        }
        g.outW = new StreamWriter(new FileStream(outPath, FileMode.Create, FileAccess.Write, FileShare.ReadWrite | FileShare.Delete), new UTF8Encoding(false));
        g.errW = new StreamWriter(new FileStream(errPath, FileMode.Create, FileAccess.Write, FileShare.ReadWrite | FileShare.Delete), new UTF8Encoding(false));
        g.P = new Process();
        g.P.StartInfo = psi;
        g.P.OutputDataReceived += delegate(object s, DataReceivedEventArgs e)
        {
            if (e.Data != null) { lock (g.lk) { try { g.outW.WriteLine(e.Data); g.outW.Flush(); } catch (Exception) { } } }
        };
        g.P.ErrorDataReceived += delegate(object s, DataReceivedEventArgs e)
        {
            if (e.Data != null) { lock (g.lk) { try { g.errW.WriteLine(e.Data); g.errW.Flush(); } catch (Exception) { } } }
        };
        g.P.Start();
        g.P.BeginOutputReadLine();
        g.P.BeginErrorReadLine();
        return g;
    }

    public void WriteLine(string s)
    {
        byte[] b = new UTF8Encoding(false).GetBytes(s + "\n");
        P.StandardInput.BaseStream.Write(b, 0, b.Length);
        P.StandardInput.BaseStream.Flush();
    }

    public bool WaitForExit(int ms)
    {
        bool r = P.WaitForExit(ms);
        if (r) P.WaitForExit(); // flushes the async readers
        return r;
    }

    public void CloseLogs()
    {
        lock (lk)
        {
            try { outW.Dispose(); } catch (Exception) { }
            try { errW.Dispose(); } catch (Exception) { }
        }
    }
}

// Incremental reader for a log file another process is writing (shared read, returns complete new lines).
public class GGTail
{
    private readonly string path;
    private long pos;
    private string carry = "";
    private Decoder dec = new UTF8Encoding(false).GetDecoder();

    public GGTail(string p) { path = p; }

    public List<string> ReadNew()
    {
        List<string> lines = new List<string>();
        if (!File.Exists(path)) return lines;
        using (FileStream fs = new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.ReadWrite | FileShare.Delete))
        {
            long len = fs.Length;
            if (len < pos) { pos = 0; carry = ""; dec = new UTF8Encoding(false).GetDecoder(); }
            if (len == pos) return lines;
            fs.Seek(pos, SeekOrigin.Begin);
            byte[] buf = new byte[len - pos];
            int total = 0;
            while (total < buf.Length)
            {
                int n = fs.Read(buf, total, buf.Length - total);
                if (n <= 0) break;
                total += n;
            }
            pos += total;
            char[] chars = new char[dec.GetCharCount(buf, 0, total)];
            int cn = dec.GetChars(buf, 0, total, chars, 0);
            string text = carry + new string(chars, 0, cn);
            int start = 0;
            while (true)
            {
                int nl = text.IndexOf('\n', start);
                if (nl < 0) break;
                string line = text.Substring(start, nl - start);
                if (line.EndsWith("\r")) line = line.Substring(0, line.Length - 1);
                lines.Add(line);
                start = nl + 1;
            }
            carry = text.Substring(start);
        }
        return lines;
    }

    // Flushes the unterminated last line (call once the writer has stopped).
    public string Remainder()
    {
        string r = carry;
        carry = "";
        return r;
    }
}

// Minimal Source RCON client. Vanilla reads exactly one packet per read(): never pipeline packets.
public class GGRcon : IDisposable
{
    private TcpClient client;
    private NetworkStream stream;
    private int nextId = 100;

    public static GGRcon Connect(string host, int port, string password, int timeoutMs)
    {
        GGRcon r = new GGRcon();
        r.client = new TcpClient();
        r.client.NoDelay = true;
        IAsyncResult ar = r.client.BeginConnect(host, port, null, null);
        if (!ar.AsyncWaitHandle.WaitOne(timeoutMs))
        {
            r.client.Close();
            throw new IOException("RCON connect timeout");
        }
        r.client.EndConnect(ar);
        r.client.SendTimeout = timeoutMs;
        r.client.ReceiveTimeout = timeoutMs;
        r.stream = r.client.GetStream();
        int id = r.nextId++;
        r.Send(id, 3, password);
        while (true)
        {
            int rid, type; string body;
            r.Read(out rid, out type, out body);
            if (rid == -1) throw new IOException("RCON bad password");
            if (rid == id) break;
        }
        return r;
    }

    private void Send(int id, int type, string body)
    {
        byte[] x = Encoding.UTF8.GetBytes(body);
        MemoryStream m = new MemoryStream();
        BinaryWriter w = new BinaryWriter(m);
        w.Write((int)(10 + x.Length));
        w.Write(id);
        w.Write(type);
        w.Write(x);
        w.Write((short)0);
        w.Flush();
        byte[] a = m.ToArray();
        stream.Write(a, 0, a.Length);
        stream.Flush();
    }

    private byte[] ReadExact(int n)
    {
        byte[] b = new byte[n];
        int o = 0;
        while (o < n)
        {
            int r = stream.Read(b, o, n - o);
            if (r <= 0) throw new IOException("RCON connection closed");
            o += r;
        }
        return b;
    }

    private void Read(out int id, out int type, out string body)
    {
        int len = BitConverter.ToInt32(ReadExact(4), 0);
        if (len < 10 || len > 1024 * 1024) throw new IOException("RCON bad packet length " + len);
        byte[] b = ReadExact(len);
        id = BitConverter.ToInt32(b, 0);
        type = BitConverter.ToInt32(b, 4);
        body = Encoding.UTF8.GetString(b, 8, len - 10);
    }

    // Replies longer than 4096 bytes arrive as several packets; an unknown-type packet sent after the
    // first reply packet acts as an end-of-reply sentinel (the server answers strictly in order).
    public string Command(string cmd, int timeoutMs)
    {
        client.ReceiveTimeout = timeoutMs;
        int id = nextId++;
        int sentinel = nextId++;
        Send(id, 2, cmd);
        StringBuilder sb = new StringBuilder();
        bool gotFirst = false;
        while (true)
        {
            int rid, type; string body;
            Read(out rid, out type, out body);
            if (rid == sentinel) break;
            if (rid == id)
            {
                sb.Append(body);
                if (!gotFirst)
                {
                    gotFirst = true;
                    Send(sentinel, 100, "");
                }
            }
        }
        return sb.ToString();
    }

    public void Dispose()
    {
        try { if (client != null) client.Close(); } catch (Exception) { }
    }
}
'@
if (-not ('GGProc' -as [type])) { Add-Type -TypeDefinition $cs -Language CSharp }

# ---------------------------------------------------------------- logging / stages

function Write-GGLog {
    param([string]$Message, [string]$Level = 'INFO')
    $clean = ($Message -replace '[^\x09\x20-\x7E]', '?')
    $line = '{0} [{1}] {2}' -f (Get-Date).ToString('HH:mm:ss'), $Level, $clean
    [Console]::Out.WriteLine($line)
    if ($global:GG.RunLog) { try { [IO.File]::AppendAllText($global:GG.RunLog, $line + "`r`n") } catch {} }
}

function Save-GGStages {
    if (-not $global:GG.ResultsDir) { return }
    try {
        $arr = @($global:GG.Stages | ForEach-Object { $_ })
        $json = ConvertTo-Json -InputObject $arr -Depth 5
        [IO.File]::WriteAllText((Join-Path $global:GG.ResultsDir 'stages.json'), $json, (New-Object Text.UTF8Encoding($false)))
    } catch {}
}

function Add-GGStage {
    param([string]$Name, [string]$Status, [double]$Seconds, [string]$Detail = '')
    $secs = [math]::Round($Seconds, 1)
    $entry = [ordered]@{ name = $Name; status = $Status; seconds = $secs; detail = $Detail }
    [void]$global:GG.Stages.Add($entry)
    $d = $Detail
    if ($d.Length -gt 300) { $d = $d.Substring(0, 300) + '...' }
    Write-GGLog ("STAGE {0,-14} {1,-5} {2,7}s  {3}" -f $Name, $Status, $secs, $d)
    Save-GGStages
}

# Runs the body as a stage. The body may call Set-GGStage to report WARN/SKIP and a detail string;
# an exception marks the stage FAIL. Returns $true unless the stage failed. The body runs in the
# caller's dynamic scope, so locals here use unusual names to avoid shadowing the caller's variables.
function Invoke-GGStage {
    param([string]$StageName, [scriptblock]$StageBody)
    $global:GG.StageStatus = 'PASS'
    $global:GG.StageDetail = ''
    $__sw = [Diagnostics.Stopwatch]::StartNew()
    Write-GGLog "STAGE-START $StageName"
    try {
        $null = & $StageBody
        Add-GGStage $StageName $global:GG.StageStatus $__sw.Elapsed.TotalSeconds $global:GG.StageDetail
        return ($global:GG.StageStatus -ne 'FAIL')
    } catch {
        $__msg = $_.Exception.Message
        # plain `throw "text"` failures are expected stage failures; only unexpected exceptions get a script location
        if ($_.Exception.GetType().FullName -ne 'System.Management.Automation.RuntimeException' -and $_.InvocationInfo -and $_.InvocationInfo.ScriptLineNumber) {
            Write-GGLog ("  at {0}:{1}" -f (Split-Path -Leaf $_.InvocationInfo.ScriptName), $_.InvocationInfo.ScriptLineNumber) 'ERROR'
        }
        Add-GGStage $StageName 'FAIL' $__sw.Elapsed.TotalSeconds $__msg
        return $false
    }
}

function Set-GGStage {
    param([string]$Status = 'PASS', [string]$Detail = '')
    $global:GG.StageStatus = $Status
    $global:GG.StageDetail = $Detail
}

# ---------------------------------------------------------------- generic file helpers

function Read-GGSharedText {
    param([string]$Path)
    if (-not (Test-Path -LiteralPath $Path)) { return '' }
    $fs = New-Object IO.FileStream($Path, [IO.FileMode]::Open, [IO.FileAccess]::Read, ([IO.FileShare]::ReadWrite -bor [IO.FileShare]::Delete))
    try {
        $sr = New-Object IO.StreamReader($fs, [Text.Encoding]::UTF8)
        return $sr.ReadToEnd()
    } finally { $fs.Dispose() }
}

# Copies a file even if another process (the JVM) still has it open for writing.
function Copy-GGSharedFile {
    param([string]$Source, [string]$Dest, [long]$TailBytes = 0)
    $dir = Split-Path -Parent $Dest
    if (-not (Test-Path -LiteralPath $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
    $in = New-Object IO.FileStream($Source, [IO.FileMode]::Open, [IO.FileAccess]::Read, ([IO.FileShare]::ReadWrite -bor [IO.FileShare]::Delete))
    try {
        if ($TailBytes -gt 0 -and $in.Length -gt $TailBytes) { [void]$in.Seek(-$TailBytes, [IO.SeekOrigin]::End) }
        $out = New-Object IO.FileStream($Dest, [IO.FileMode]::Create, [IO.FileAccess]::Write, [IO.FileShare]::Read)
        try { $in.CopyTo($out) } finally { $out.Dispose() }
    } finally { $in.Dispose() }
}

function Copy-GGTree {
    param([string]$Source, [string]$Dest, [string[]]$ExcludeDirs = @(), [string[]]$ExcludeFiles = @())
    New-Item -ItemType Directory -Force -Path $Dest | Out-Null
    $rc = @($Source, $Dest, '/E', '/NFL', '/NDL', '/NJH', '/NJS', '/NP', '/R:2', '/W:1', '/MT:8')
    if ($ExcludeDirs.Count -gt 0) { $rc += '/XD'; $rc += $ExcludeDirs }
    if ($ExcludeFiles.Count -gt 0) { $rc += '/XF'; $rc += $ExcludeFiles }
    & robocopy.exe @rc | Out-Null
    $code = $LASTEXITCODE
    $global:LASTEXITCODE = 0
    if ($code -ge 8) { throw "robocopy failed ($code): $Source -> $Dest" }
}

function Remove-GGTree {
    param([string]$Path)
    if (-not (Test-Path -LiteralPath $Path)) { return }
    for ($i = 0; $i -lt 3; $i++) {
        try { Remove-Item -LiteralPath $Path -Recurse -Force -ErrorAction Stop; return } catch { Start-Sleep -Milliseconds 700 }
    }
    # last resort for deep trees / read-only files
    $empty = Join-Path $global:GG.Runs '.empty'
    New-Item -ItemType Directory -Force -Path $empty | Out-Null
    & robocopy.exe $empty $Path /MIR /NFL /NDL /NJH /NJS /NP /R:1 /W:1 | Out-Null
    $global:LASTEXITCODE = 0
    Remove-Item -LiteralPath $Path -Recurse -Force -ErrorAction SilentlyContinue
}

function Get-GGDirSizeMB {
    param([string]$Path)
    if (-not (Test-Path -LiteralPath $Path)) { return 0 }
    $s = (Get-ChildItem -LiteralPath $Path -Recurse -File -Force -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
    if (-not $s) { return 0 }
    return [math]::Round($s / 1MB, 1)
}

function Get-GGFile {
    param([string]$Url, [string]$Dest, [long]$MinBytes = 1024)
    if ((Test-Path -LiteralPath $Dest) -and ((Get-Item -LiteralPath $Dest).Length -ge $MinBytes)) { return $false }
    $dir = Split-Path -Parent $Dest
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
    $part = "$Dest.part"
    $last = $null
    for ($i = 1; $i -le 3; $i++) {
        try {
            Write-GGLog "download $Url (attempt $i)"
            Invoke-WebRequest -Uri $Url -OutFile $part -UseBasicParsing -TimeoutSec 600
            if ((Get-Item -LiteralPath $part).Length -lt $MinBytes) { throw "downloaded file too small" }
            Move-Item -LiteralPath $part -Destination $Dest -Force
            return $true
        } catch {
            $last = $_.Exception.Message
            Remove-Item -LiteralPath $part -Force -ErrorAction SilentlyContinue
            Start-Sleep -Seconds (3 * $i)
        }
    }
    throw "download failed: $Url : $last"
}

# Minimal pack.toml reader (name + [versions]).
function Read-GGPackToml {
    param([string]$Path)
    $res = @{ name = ''; version = ''; mc = ''; forge = ''; neoforge = ''; fabric = ''; quilt = '' }
    $section = ''
    foreach ($line in [IO.File]::ReadAllLines($Path)) {
        $t = $line.Trim()
        if ($t -match '^\[\[?([^\]]+)\]\]?\s*$') { $section = $Matches[1].Trim(); continue }
        if ($t -match '^([A-Za-z0-9_.-]+)\s*=\s*"([^"]*)"') {
            $k = $Matches[1]; $v = $Matches[2]
            if ($section -eq '') {
                if ($k -eq 'name') { $res.name = $v }
                if ($k -eq 'version') { $res.version = $v }
            } elseif ($section -eq 'versions') {
                switch ($k) {
                    'minecraft' { $res.mc = $v }
                    'forge' { $res.forge = $v }
                    'neoforge' { $res.neoforge = $v }
                    'fabric' { $res.fabric = $v }
                    'quilt' { $res.quilt = $v }
                }
            }
        }
    }
    return $res
}

function Get-GGJava17 {
    $c = @()
    foreach ($root in @('C:\Program Files\Eclipse Adoptium', 'C:\Program Files\Java', 'C:\Program Files\Microsoft')) {
        if (Test-Path $root) {
            $c += @(Get-ChildItem $root -Directory -Filter 'jdk-17*' -ErrorAction SilentlyContinue | Sort-Object Name -Descending | ForEach-Object { Join-Path $_.FullName 'bin\java.exe' })
        }
    }
    foreach ($j in $c) { if (Test-Path $j) { return $j } }
    throw 'Java 17 not found under C:\Program Files\Eclipse Adoptium'
}

function Get-GGFreePort {
    param([int]$Preferred, [int]$Count = 100)
    for ($p = $Preferred; $p -lt ($Preferred + $Count); $p++) {
        $l = $null
        try {
            $l = New-Object Net.Sockets.TcpListener([Net.IPAddress]::Loopback, $p)
            $l.Start(); $l.Stop()
            return $p
        } catch { if ($l) { try { $l.Stop() } catch {} } }
    }
    throw "no free TCP port near $Preferred"
}

# Server / RCON ports of this run. Every concurrent run holds a different slot, and each slot owns its own window of
# ports (slot 0: 25565 and 25575 as always, slot 1: 25585 and 25595, ...), so two runs can never pick the same port.
function Get-GGSlotPort {
    param([ValidateSet('server', 'rcon')][string]$Kind)
    $slot = [math]::Max(0, [int]$global:GG.Slot)
    $base = 25565 + (20 * $slot)
    if ($Kind -eq 'rcon') { $base += 10 }
    return (Get-GGFreePort $base 10)
}

# Java -Xmx style size ("7G", "4096M") in GB.
function ConvertTo-GGGb {
    param([string]$Text, [double]$Default = 0)
    if ($Text -match '^\s*(\d+(?:\.\d+)?)\s*([kKmMgG]?)') {
        $n = [double]::Parse($Matches[1], [Globalization.CultureInfo]::InvariantCulture)
        switch ($Matches[2].ToUpperInvariant()) {
            'G' { return $n }
            'M' { return ($n / 1024) }
            'K' { return ($n / 1048576) }
            default { return ($n / 1073741824) }
        }
    }
    return $Default
}

# ---------------------------------------------------------------- process helpers

function Stop-GGTree {
    param([int]$ProcessId)
    try { & taskkill.exe /T /F /PID $ProcessId 2>&1 | Out-Null } catch {}
    $global:LASTEXITCODE = 0
}

# ---- JVMs of runs that are gone ---------------------------------------------------------------------------------
# A JVM belongs to a run when its command line names the run: client side (HeadlessMC and the game it starts) and
# packwiz-installer carry ...\runs\<RunId>\..., the server JVM carries -Dgg.run=<RunId> (its other arguments are
# relative). Only JVMs of runs that are not active are ever killed, so the JVM of the other slot is always safe.

function Get-GGManagedProcesses {
    return @(Get-CimInstance Win32_Process -ErrorAction SilentlyContinue | Where-Object {
            $_.ProcessId -ne $PID -and $_.CommandLine -and ($_.Name -match '^(java|javaw|headlessmc-launcher-windows-x64)\.exe$')
        })
}

function Get-GGRunIdOfCommandLine {
    param([string]$CommandLine)
    $m = [regex]::Match($CommandLine, '(?i)-Dgg\.run=([A-Za-z0-9][A-Za-z0-9._-]*)')
    if ($m.Success) { return $m.Groups[1].Value }
    $m = [regex]::Match($CommandLine, '(?i)[\\/]runs[\\/]+([A-Za-z0-9][A-Za-z0-9._-]*)(?=[\\/"\s]|$)')
    if ($m.Success) { return $m.Groups[1].Value }
    return ''
}

# Which of the given processes are orphans? ProtectRunIds = this run plus every active holder. A process that is ours
# (D:\GregtechGrindless\runs|hmc|cache|sync in its command line) but names no run (e.g. the Forge installer) is only an
# orphan when nobody else is active (Alone), like the old one-lock behaviour.
function Select-GGOrphans {
    param($Procs, [string]$BaseRx, [string[]]$ProtectRunIds, [bool]$Alone)
    foreach ($p in @($Procs)) {
        $cl = [string]$p.CommandLine
        $owner = Get-GGRunIdOfCommandLine $cl
        if (-not $owner -and $cl -notmatch $BaseRx) { continue }
        if ($owner) {
            if ($ProtectRunIds -contains $owner) { continue }
        } elseif (-not $Alone) { continue }
        $p
    }
}

function Get-GGBaseRegex {
    $b = [regex]::Escape($global:GG.Base.TrimEnd('\', '/'))
    return ('(?i)' + ($b -replace '\\\\', '[\\/]+') + '[\\/]+(runs|hmc|cache|sync)[\\/]')
}

# Kills the JVMs of runs that are no longer active. Anchored on our own D: subfolders / run ids only, so the user's
# launchers/instances (C:\...) are never matched.
function Stop-GGOrphans {
    $others = @(Get-GGActiveSlots | Where-Object { [string]$_.Info.runId -ne [string]$global:GG.RunId })
    if (@($others | Where-Object { $_.Info.corrupt }).Count -gt 0) {
        Write-GGLog 'orphan sweep skipped: a slot file could not be read (it may be rewritten right now)' 'WARN'
        return 0
    }
    $protect = @([string]$global:GG.RunId) + @($others | ForEach-Object { [string]$_.Info.runId })
    $targets = @(Select-GGOrphans (Get-GGManagedProcesses) (Get-GGBaseRegex) $protect ($others.Count -eq 0))
    foreach ($p in $targets) {
        $owner = Get-GGRunIdOfCommandLine ([string]$p.CommandLine)
        if (-not $owner) { $owner = '?' }
        Write-GGLog ("killing orphan {0} pid {1} (run {2})" -f $p.Name, $p.ProcessId, $owner) 'WARN'
        Stop-GGTree $p.ProcessId
    }
    return $targets.Count
}

# Kills what is left of ONE run (this run at the end of a suite, or a dead slot holder).
function Stop-GGRunProcesses {
    param([string]$RunId)
    if (-not $RunId -or $RunId -eq '?') { return 0 }
    $n = 0
    foreach ($p in @(Get-GGManagedProcesses)) {
        if ((Get-GGRunIdOfCommandLine ([string]$p.CommandLine)) -eq $RunId) {
            Write-GGLog ("killing leftover {0} pid {1} of run {2}" -f $p.Name, $p.ProcessId, $RunId) 'WARN'
            Stop-GGTree $p.ProcessId
            $n++
        }
    }
    return $n
}

# Named OS mutex around a resource that concurrent runs share (tool downloads, Forge install, a packwiz sync dir).
function Invoke-GGExclusive {
    param([string]$Name, [scriptblock]$Body, [int]$TimeoutSec = 3600)
    $m = New-Object Threading.Mutex($false, ('Global\GGHarness-' + ($Name -replace '[^A-Za-z0-9_.-]', '_')))
    $held = $false
    $sw = [Diagnostics.Stopwatch]::StartNew()
    $said = $false
    try {
        while (-not $held) {
            try { $held = $m.WaitOne(15000) } catch [Threading.AbandonedMutexException] { $held = $true }
            if ($held) { break }
            if (-not $said) { Write-GGLog ("waiting for exclusive access to '{0}' (another run is using it)" -f $Name); $said = $true }
            Update-GGLock
            if ($sw.Elapsed.TotalSeconds -gt $TimeoutSec) { throw "timed out after ${TimeoutSec}s waiting for exclusive access to '$Name'" }
        }
        & $Body
    } finally {
        if ($held) { try { $m.ReleaseMutex() } catch {} }
        $m.Dispose()
    }
}

# Runs a short-lived tool to completion with output captured to files. Returns the exit code.
function Invoke-GGTool {
    param([string]$File, [string]$Arguments, [string]$WorkDir, [string]$LogBase, [int]$TimeoutSec = 600, [string[]]$Env = $null, [string]$Label = '')
    $out = "$LogBase.out.log"; $err = "$LogBase.err.log"
    $g = [GGProc]::Start($File, $Arguments, $WorkDir, $out, $err, $Env)
    $sw = [Diagnostics.Stopwatch]::StartNew()
    $lastBeat = 0
    while (-not $g.WaitForExit(2000)) {
        if ($sw.Elapsed.TotalSeconds -gt $TimeoutSec) {
            Stop-GGTree $g.Id
            [void]$g.WaitForExit(10000)
            $g.CloseLogs()
            throw "$Label timed out after ${TimeoutSec}s"
        }
        if ($sw.Elapsed.TotalSeconds - $lastBeat -ge 30) {
            $lastBeat = $sw.Elapsed.TotalSeconds
            Write-GGLog ("  ...{0} running {1}s" -f $Label, [int]$sw.Elapsed.TotalSeconds)
            Update-GGLock
        }
    }
    $code = $g.ExitCode
    $g.CloseLogs()
    return $code
}

# ---------------------------------------------------------------- slot semaphore (at most N Minecraft JVMs at once)
#
# A slot is a file created with CreateNew by the run that holds it: runs\.lock (slot 0, the historical single lock,
# same JSON fields as ever) and runs\.lock.1, runs\.lock.2, ... Holders heartbeat their file (Update-GGLock); a file is
# stale when its owner is gone or silent for LockStaleMin, and the next waiter reclaims it (and kills the dead run's JVMs).
# Rules for taking a slot (evaluated by one waiter at a time, see the FIFO tickets below):
#   - at most min(own -Slots, -Slots of every active holder) runs at once; a holder written by an older harness version
#     (no "v" field) assumes it is alone, so it counts as exclusive;
#   - the lowest free index below -Slots is used; the index also selects the run's server/RCON port window;
#   - a run that would overlap another one needs free RAM >= MinFreeGb, where the RAM that runs still starting their
#     JVM have yet to allocate (reserveGb, absorbed over RampSec after the JVM starts) is already subtracted.

function Get-GGSlotPath {
    param([int]$Index)
    if ($Index -le 0) { return (Join-Path $global:GG.Runs '.lock') }
    return (Join-Path $global:GG.Runs ('.lock.{0}' -f $Index))
}

function Get-GGLockInfo {
    param([string]$Path)
    if (-not $Path) { $Path = $global:GG.LockPath }
    if (-not [IO.File]::Exists($Path)) { return $null }
    try {
        $o = (Read-GGSharedText $Path) | ConvertFrom-Json
        if ($o -and $o.pid) { return $o }
    } catch {
        if (-not [IO.File]::Exists($Path)) { return $null }
    }
    return [pscustomobject]@{ pid = 0; corrupt = $true; runId = '?'; updated = '' }
}

function Test-GGLockStale {
    param($Info, [string]$Path)
    if (-not $Path) { $Path = $global:GG.LockPath }
    if (-not $Info) { return $true }
    if ($Info.corrupt) {
        try { return (((Get-Date) - (Get-Item -LiteralPath $Path).LastWriteTime).TotalMinutes -gt 5) } catch { return $true }
    }
    $inv = [Globalization.CultureInfo]::InvariantCulture
    $rt = [Globalization.DateTimeStyles]::RoundtripKind
    try {
        $upd = [datetime]::Parse([string]$Info.updated, $inv, $rt).ToUniversalTime()
        if (([datetime]::UtcNow - $upd).TotalMinutes -gt $global:GG.LockStaleMin) { return $true }
    } catch { return $true }
    $proc = Get-Process -Id ([int]$Info.pid) -ErrorAction SilentlyContinue
    if (-not $proc) { return $true }
    try {
        $locked = [datetime]::Parse([string]$Info.procStart, $inv, $rt).ToUniversalTime()
        if ([math]::Abs(($proc.StartTime.ToUniversalTime() - $locked).TotalSeconds) -gt 5) { return $true } # PID reused
    } catch {}
    return $false
}

function New-GGLockBody {
    $me = Get-Process -Id $PID
    $o = [ordered]@{
        v          = 2
        pid        = $PID
        runId      = $global:GG.RunId
        started    = $global:GG.LockStarted
        updated    = [datetime]::UtcNow.ToString('o')
        procStart  = $me.StartTime.ToUniversalTime().ToString('o')
        host       = $env:COMPUTERNAME
        slot       = [int]$global:GG.Slot
        slots      = [int]$global:GG.Slots
        reserveGb  = [double]$global:GG.ReserveGb
        jvmStarted = [string]$global:GG.JvmStarted
    }
    return (ConvertTo-Json -InputObject $o)
}

# Rewrites the heartbeat/state of this run's slot file (temp file + Replace, so readers never see half a file).
function Save-GGLockFile {
    $p = $global:GG.LockPath
    $body = New-GGLockBody
    $utf8 = New-Object Text.UTF8Encoding($false)
    $tmp = Join-Path $global:GG.Runs ('.slot-{0}.tmp' -f $PID)
    try {
        [IO.File]::WriteAllText($tmp, $body, $utf8)
        [IO.File]::Replace($tmp, $p, [NullString]::Value)
    } catch {
        Remove-Item -LiteralPath $tmp -Force -ErrorAction SilentlyContinue
        try { [IO.File]::WriteAllText($p, $body, $utf8) } catch {}
    }
}

function Get-GGActiveSlots {
    # Reclaims stale slot files (killing the JVMs of the dead run) and returns the active holders.
    $active = @()
    if (-not [IO.Directory]::Exists($global:GG.Runs)) { return $active }
    foreach ($f in [IO.Directory]::GetFiles($global:GG.Runs, '.lock*')) {
        $name = [IO.Path]::GetFileName($f)
        $idx = -1
        if ($name -eq '.lock') { $idx = 0 } elseif ($name -match '^\.lock\.(\d{1,2})$') { $idx = [int]$Matches[1] }
        if ($idx -lt 0) { continue }
        $info = Get-GGLockInfo $f
        if (-not $info) { continue }
        if (Test-GGLockStale $info $f) {
            $again = Get-GGLockInfo $f
            if ($again -and ([string]$again.runId -eq [string]$info.runId) -and ([int]$again.pid -eq [int]$info.pid)) {
                Write-GGLog ("removing stale slot {0} (owner pid {1}, run {2}, updated {3})" -f $idx, $info.pid, $info.runId, $info.updated) 'WARN'
                Remove-Item -LiteralPath $f -Force -ErrorAction SilentlyContinue
                [void](Stop-GGRunProcesses ([string]$info.runId))
            }
            continue
        }
        $active += [pscustomobject]@{ Index = $idx; Path = $f; Info = $info }
    }
    return @($active)
}

# RAM a new JVM can get right now: Windows "Available" memory (free + reusable standby cache, what Task Manager shows as
# Available). The bare free list (Win32_OperatingSystem.FreePhysicalMemory) is only ~7 GB on this 32 GB PC even when it is idle.
function Get-GGFreeRamGb {
    try {
        $perf = Get-CimInstance Win32_PerfFormattedData_PerfOS_Memory -ErrorAction Stop
        if ($perf -and $perf.AvailableMBytes) { return [math]::Round([double]$perf.AvailableMBytes / 1024, 1) }
    } catch {}
    try { return [math]::Round((Get-CimInstance Win32_OperatingSystem -ErrorAction Stop).FreePhysicalMemory / 1MB, 1) } catch { return 999.0 }
}

# How many runs may be active at once, given the holders that already are.
function Get-GGSlotLimit {
    param($Others, [int]$Slots)
    $limit = $Slots
    foreach ($h in @($Others)) {
        if (-not $h.Info.v) { $limit = 1; continue }
        $n = 0
        try { $n = [int]$h.Info.slots } catch {}
        if ($n -gt 0 -and $n -lt $limit) { $limit = $n }
    }
    return $limit
}

# RAM that the other holders are still going to allocate: their declared reserve until their JVM has been up RampSec.
function Get-GGPendingRamGb {
    param($Others)
    $inv = [Globalization.CultureInfo]::InvariantCulture
    $rt = [Globalization.DateTimeStyles]::RoundtripKind
    $sum = 0.0
    foreach ($h in @($Others)) {
        $r = 0.0
        try { $r = [double]$h.Info.reserveGb } catch {}
        if ($r -le 0) { continue }
        $factor = 1.0
        if ($h.Info.jvmStarted) {
            try {
                $age = ([datetime]::UtcNow - [datetime]::Parse([string]$h.Info.jvmStarted, $inv, $rt).ToUniversalTime()).TotalSeconds
                $factor = [math]::Max(0.0, 1.0 - ($age / [double]$global:GG.RampSec))
            } catch { $factor = 0.0 }
        }
        $sum += $r * $factor
    }
    return $sum
}

# Can a new run start now? Returns @{ Index; Reason; Free; Pending }; Index -1 = no (Reason says why).
function Get-GGSlotDecision {
    param($Active, [int]$Slots, [double]$MinFreeGb)
    $active = @($Active)
    $who = (@($active | ForEach-Object { 'slot {0}: run {1} (pid {2}, since {3})' -f $_.Index, $_.Info.runId, $_.Info.pid, $_.Info.started }) -join '; ')
    $limit = Get-GGSlotLimit $active $Slots
    if ($active.Count + 1 -gt $limit) { return @{ Index = -1; Reason = ("all {0} slot(s) busy - {1}" -f $limit, $who) } }
    $used = @($active | ForEach-Object { [int]$_.Index })
    $idx = -1
    for ($i = 0; $i -lt $Slots; $i++) { if ($used -notcontains $i) { $idx = $i; break } }
    if ($idx -lt 0) { return @{ Index = -1; Reason = ("no free slot below {0} - {1}" -f $Slots, $who) } }
    $free = $null
    $pending = 0.0
    if ($active.Count -gt 0 -and $MinFreeGb -gt 0) {
        $free = Get-GGFreeRamGb
        $pending = Get-GGPendingRamGb $active
        $eff = [math]::Round($free - $pending, 1)
        if ($eff -lt $MinFreeGb) {
            return @{ Index = -1; Reason = ("waiting for RAM: {0} GB available - {1} GB still to be allocated by starting runs = {2} GB, {3} GB needed to share the PC - {4}" -f $free, [math]::Round($pending, 1), $eff, $MinFreeGb, $who) }
        }
    }
    return @{ Index = $idx; Reason = ''; Free = $free; Pending = $pending }
}

# FIFO fairness: waiting runs keep a runs\<id>\.waiting ticket fresh (touched every poll); a run only tries to take
# the lock when no earlier (older RunId) run holds a fresh ticket. Dead waiters stop touching theirs (45 s).
function Get-GGEarlierWaiters {
    $mine = $global:GG.RunId
    $res = @()
    foreach ($d in [IO.Directory]::GetDirectories($global:GG.Runs)) {
        $name = [IO.Path]::GetFileName($d)
        if ([string]::CompareOrdinal($name, $mine) -ge 0) { continue }
        $t = [IO.Path]::Combine($d, '.waiting')
        if (-not [IO.File]::Exists($t)) { continue }
        if (([datetime]::Now - [IO.File]::GetLastWriteTime($t)).TotalSeconds -gt 45) { continue }
        $res += $name
    }
    return $res
}

function Enter-GGLock {
    param([int]$MaxWaitMin = 120, [int]$Slots = 2, [double]$MinFreeGb = 9, [double]$ReserveGb = 0)
    New-Item -ItemType Directory -Force -Path $global:GG.Runs | Out-Null
    if ($Slots -lt 1) { $Slots = 1 }
    $global:GG.Slots = $Slots
    $global:GG.ReserveGb = $ReserveGb
    $global:GG.JvmStarted = ''
    $global:GG.SlotOthers = @()
    $global:GG.SlotFree = $null
    $ticket = [IO.Path]::Combine($global:GG.RunDir, '.waiting')
    $deadline = (Get-Date).AddMinutes($MaxWaitMin)
    $lastMsg = [datetime]::MinValue
    $global:GG.LockStarted = [datetime]::UtcNow.ToString('o')
    try {
        while ($true) {
            try { [IO.File]::WriteAllText($ticket, [datetime]::UtcNow.ToString('o')) } catch {}
            $earlier = @(Get-GGEarlierWaiters)
            $why = ''
            if ($earlier.Count -eq 0) {
                $dec = Get-GGSlotDecision @(Get-GGActiveSlots) $Slots $MinFreeGb
                if ($dec.Index -ge 0) {
                    $path = Get-GGSlotPath $dec.Index
                    $global:GG.Slot = $dec.Index
                    $fs = $null
                    $created = $false
                    try {
                        $fs = New-Object IO.FileStream($path, [IO.FileMode]::CreateNew, [IO.FileAccess]::Write, ([IO.FileShare]::ReadWrite -bor [IO.FileShare]::Delete))
                        $bytes = (New-Object Text.UTF8Encoding($false)).GetBytes((New-GGLockBody))
                        $fs.Write($bytes, 0, $bytes.Length)
                        $fs.Dispose(); $fs = $null
                        $created = $true
                    } catch [IO.IOException], [UnauthorizedAccessException] {
                        if ($fs) { $fs.Dispose() }
                        $global:GG.Slot = -1
                        $why = 'lost a race for the slot, retrying'
                    }
                    if ($created) {
                        $global:GG.LockPath = $path
                        $global:GG.HasLock = $true
                        $global:GG.LastBeat = Get-Date
                        # two runs may have taken different slots in the same instant: re-check the limits
                        $others = @(Get-GGActiveSlots | Where-Object { [int]$_.Index -ne [int]$dec.Index })
                        if ($others.Count + 1 -le (Get-GGSlotLimit $others $Slots)) {
                            $global:GG.SlotOthers = @($others | ForEach-Object { [string]$_.Info.runId })
                            $global:GG.SlotFree = $dec.Free
                            return
                        }
                        Remove-Item -LiteralPath $path -Force -ErrorAction SilentlyContinue
                        $global:GG.HasLock = $false
                        $global:GG.Slot = -1
                        $global:GG.LockPath = Get-GGSlotPath 0
                        $why = 'slot limit exceeded by a concurrent start, retrying'
                        Start-Sleep -Seconds (Get-Random -Minimum 2 -Maximum 6)
                        continue
                    }
                } else {
                    $why = [string]$dec.Reason
                }
            }
            if ((Get-Date) -gt $deadline) {
                $detail = $why
                if ($earlier.Count -gt 0) { $detail = 'queued behind ' + ($earlier -join ', ') }
                throw "timed out after $MaxWaitMin min waiting for a test-PC slot ($detail)"
            }
            if (((Get-Date) - $lastMsg).TotalSeconds -ge 60) {
                $lastMsg = Get-Date
                if ($earlier.Count -gt 0) {
                    $holders = (@(Get-GGActiveSlots | ForEach-Object { 'run {0}' -f $_.Info.runId }) -join ', ')
                    Write-GGLog ("queued behind {0} earlier run(s) ({1}); slots held by {2}" -f $earlier.Count, ($earlier -join ', '), $holders)
                } else {
                    Write-GGLog ("waiting for a slot: {0}" -f $why)
                }
            }
            Start-Sleep -Milliseconds ([int]($global:GG.PollSec * 1000))
        }
    } finally {
        Remove-Item -LiteralPath $ticket -Force -ErrorAction SilentlyContinue
    }
}

function Update-GGLock {
    if (-not $global:GG.HasLock) { return }
    if (((Get-Date) - $global:GG.LastBeat).TotalSeconds -lt 30) { return }
    $global:GG.LastBeat = Get-Date
    Save-GGLockFile
}

# Tells the other runs how much RAM this run is going to need: ReserveGb (its JVM's expected footprint; 0 once no JVM
# will start any more) and whether a JVM of this run is up (True = one just started, False = it stopped).
function Set-GGSlotState {
    param($ReserveGb = $null, $JvmStarted = $null)
    if ($null -ne $ReserveGb) { $global:GG.ReserveGb = [double]$ReserveGb }
    if ($null -ne $JvmStarted) {
        if ($JvmStarted) { $global:GG.JvmStarted = [datetime]::UtcNow.ToString('o') } else { $global:GG.JvmStarted = '' }
    }
    if ($global:GG.HasLock) {
        $global:GG.LastBeat = Get-Date
        Save-GGLockFile
    }
}

function Exit-GGLock {
    if (-not $global:GG.HasLock) { return }
    try {
        $info = Get-GGLockInfo $global:GG.LockPath
        if ($info -and ([int]$info.pid -eq $PID)) { Remove-Item -LiteralPath $global:GG.LockPath -Force -ErrorAction SilentlyContinue }
    } catch {}
    $global:GG.HasLock = $false
}

# ---------------------------------------------------------------- misc

function Remove-GGOldRuns {
    param([int]$Keep = 3)
    if (-not (Test-Path $global:GG.Runs)) { return }
    $dirs = @(Get-ChildItem $global:GG.Runs -Directory -ErrorAction SilentlyContinue | Where-Object { $_.Name -ne $global:GG.RunId } | Sort-Object LastWriteTime -Descending)
    $done = @($dirs | Where-Object { Test-Path (Join-Path $_.FullName 'results.zip') })
    $i = 0
    foreach ($d in $done) {
        $i++
        if ($i -gt $Keep) { Write-GGLog "cleanup old run $($d.Name)"; Remove-GGTree $d.FullName }
    }
    foreach ($d in $dirs) { # abandoned runs (never produced results) older than a day
        if (((Get-Date) - $d.LastWriteTime).TotalHours -gt 24 -and -not (Test-Path (Join-Path $d.FullName 'results.zip'))) { Remove-GGTree $d.FullName }
    }
    if (Test-Path $global:GG.Incoming) {
        Get-ChildItem $global:GG.Incoming -File -ErrorAction SilentlyContinue | Where-Object { ((Get-Date) - $_.LastWriteTime).TotalHours -gt 12 } | Remove-Item -Force -ErrorAction SilentlyContinue
    }
    # uploaded script versions (tools\remote\<hash>): drop the ones unused for 3 days
    $scripts = Join-Path $global:GG.Tools 'remote'
    if (Test-Path $scripts) {
        $current = Split-Path -Leaf $PSScriptRoot
        Get-ChildItem $scripts -Directory -ErrorAction SilentlyContinue | Where-Object { $_.Name -ne $current -and ((Get-Date) - $_.LastWriteTime).TotalDays -gt 3 } | ForEach-Object { Remove-GGTree $_.FullName }
    }
}
