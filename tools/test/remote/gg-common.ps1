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
        RunId        = ''
        RunDir       = ''
        ResultsDir   = ''
        RunLog       = ''
        Stages       = (New-Object System.Collections.ArrayList)
        HasLock      = $false
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
    param([int]$Preferred)
    for ($p = $Preferred; $p -lt ($Preferred + 100); $p++) {
        $l = $null
        try {
            $l = New-Object Net.Sockets.TcpListener([Net.IPAddress]::Loopback, $p)
            $l.Start(); $l.Stop()
            return $p
        } catch { if ($l) { try { $l.Stop() } catch {} } }
    }
    throw "no free TCP port near $Preferred"
}

# ---------------------------------------------------------------- process helpers

function Stop-GGTree {
    param([int]$ProcessId)
    try { & taskkill.exe /T /F /PID $ProcessId 2>&1 | Out-Null } catch {}
    $global:LASTEXITCODE = 0
}

# Kills JVMs left behind by a crashed earlier run. Anchored on our own D: subfolders only, so the
# user's launchers/instances (C:\...) are never matched.
function Stop-GGOrphans {
    $rx = '(?i)D:[\\/]+GregtechGrindless[\\/]+(runs|hmc|cache|sync)[\\/]'
    $procs = @(Get-CimInstance Win32_Process -ErrorAction SilentlyContinue | Where-Object {
            $_.ProcessId -ne $PID -and $_.CommandLine -and ($_.Name -match '^(java|javaw|headlessmc-launcher-windows-x64)\.exe$') -and ($_.CommandLine -match $rx)
        })
    foreach ($p in $procs) {
        Write-GGLog ("killing orphan {0} pid {1}" -f $p.Name, $p.ProcessId) 'WARN'
        Stop-GGTree $p.ProcessId
    }
    return $procs.Count
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

# ---------------------------------------------------------------- global lock (one JVM at a time)

function Get-GGLockInfo {
    $p = $global:GG.LockPath
    if (-not (Test-Path -LiteralPath $p)) { return $null }
    try {
        $o = (Read-GGSharedText $p) | ConvertFrom-Json
        if ($o -and $o.pid) { return $o }
    } catch {}
    return [pscustomobject]@{ pid = 0; corrupt = $true; runId = '?'; updated = '' }
}

function Test-GGLockStale {
    param($Info)
    $p = $global:GG.LockPath
    if (-not $Info) { return $true }
    if ($Info.corrupt) {
        try { return (((Get-Date) - (Get-Item -LiteralPath $p).LastWriteTime).TotalMinutes -gt 5) } catch { return $true }
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
    $now = [datetime]::UtcNow.ToString('o')
    $o = [ordered]@{
        pid       = $PID
        runId     = $global:GG.RunId
        started   = $global:GG.LockStarted
        updated   = $now
        procStart = $me.StartTime.ToUniversalTime().ToString('o')
        host      = $env:COMPUTERNAME
    }
    return (ConvertTo-Json -InputObject $o)
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
    param([int]$MaxWaitMin = 120)
    New-Item -ItemType Directory -Force -Path $global:GG.Runs | Out-Null
    $p = $global:GG.LockPath
    $ticket = [IO.Path]::Combine($global:GG.RunDir, '.waiting')
    $deadline = (Get-Date).AddMinutes($MaxWaitMin)
    $lastMsg = [datetime]::MinValue
    $global:GG.LockStarted = [datetime]::UtcNow.ToString('o')
    try {
        while ($true) {
            try { [IO.File]::WriteAllText($ticket, [datetime]::UtcNow.ToString('o')) } catch {}
            $earlier = @(Get-GGEarlierWaiters)
            if ($earlier.Count -eq 0) {
                $fs = $null
                try {
                    $fs = New-Object IO.FileStream($p, [IO.FileMode]::CreateNew, [IO.FileAccess]::Write, ([IO.FileShare]::ReadWrite -bor [IO.FileShare]::Delete))
                    $bytes = (New-Object Text.UTF8Encoding($false)).GetBytes((New-GGLockBody))
                    $fs.Write($bytes, 0, $bytes.Length)
                    $fs.Dispose(); $fs = $null
                    $global:GG.HasLock = $true
                    $global:GG.LastBeat = Get-Date
                    return
                } catch [IO.IOException], [UnauthorizedAccessException] {
                    if ($fs) { $fs.Dispose() }
                    $info = Get-GGLockInfo
                    if (Test-GGLockStale $info) {
                        $again = Get-GGLockInfo
                        if ($again -and $info -and ([string]$again.runId -eq [string]$info.runId) -and ([int]$again.pid -eq [int]$info.pid)) {
                            Write-GGLog ("removing stale lock (owner pid {0}, run {1}, updated {2})" -f $info.pid, $info.runId, $info.updated) 'WARN'
                            Remove-Item -LiteralPath $p -Force -ErrorAction SilentlyContinue
                        }
                        continue
                    }
                }
            }
            $holder = Get-GGLockInfo
            if ((Get-Date) -gt $deadline) { throw "timed out after $MaxWaitMin min waiting for the test-PC lock (held by run $($holder.runId), pid $($holder.pid))" }
            if (((Get-Date) - $lastMsg).TotalSeconds -ge 60) {
                $lastMsg = Get-Date
                if ($earlier.Count -gt 0) {
                    Write-GGLog ("queued behind {0} earlier run(s) ({1}); lock held by run {2}" -f $earlier.Count, ($earlier -join ', '), $holder.runId)
                } else {
                    Write-GGLog ("waiting for lock held by run {0} (pid {1}, since {2})" -f $holder.runId, $holder.pid, $holder.started)
                }
            }
            Start-Sleep -Seconds 15
        }
    } finally {
        Remove-Item -LiteralPath $ticket -Force -ErrorAction SilentlyContinue
    }
}

function Update-GGLock {
    if (-not $global:GG.HasLock) { return }
    if (((Get-Date) - $global:GG.LastBeat).TotalSeconds -lt 30) { return }
    $global:GG.LastBeat = Get-Date
    try { [IO.File]::WriteAllText($global:GG.LockPath, (New-GGLockBody), (New-Object Text.UTF8Encoding($false))) } catch {}
}

function Exit-GGLock {
    if (-not $global:GG.HasLock) { return }
    try {
        $info = Get-GGLockInfo
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
