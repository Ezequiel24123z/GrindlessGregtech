<#
.SYNOPSIS
  Gregtech Grindless automated test harness - LOCAL entry point.

.DESCRIPTION
  1. tools\Update-PackIndex.ps1 (normalizes pack text files to UTF-8 no BOM + LF, then packwiz refresh)
  2. zips pack\ + tools\test\overlay\   3. uploads to the home test PC
  4. runs the remote scripts over ssh (one Minecraft JVM globally, 1G/4G heap, no available-RAM launch floor;
     a shared native time budget of at most 600 seconds, then bounded shutdown)
  5. downloads results.zip and prints a concise PASS/FAIL summary (see Show-GGResults.ps1).

  Run it with:
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\test\Invoke-GGTest.ps1 -Suite server ...

  NOTE: with -File, PowerShell cannot bind comma-separated arrays (-Commands 'a','b' arrives as ONE string).
  Separate several -Commands / -WaitForLog items with ';;' instead, or use -CommandsFile (one command per line).
  A -WaitForLog item may carry its own timeout: 'regex@@90' (seconds, default -WaitTimeoutSec).
  Client suite: -ClientRenderer mesa (default) runs the REAL client mod set on real LWJGL + Mesa llvmpipe software
  OpenGL; -ClientRenderer stub uses HeadlessMC's LWJGL stub (Embeddium, ModernFix and GTM's LDLib all fail under it:
  fallback for small packs only; by default it drops Embeddium from the test client, see -ClientExclude).
  Server suite: after "Done" the harness waits -SettleSec (default 15, 0 = off) before RCON/-Commands, longer while a
  datapack reload (e.g. the one Additional Placements triggers) is still running, so it cannot wipe what a test starts.
  Exit code: 0 PASS, 1 FAIL, 2 harness/infrastructure problem (no results).

.PARAMETER Backend
  Where the remote runner executes: azure (Linux VM, alias grindless-vm), home (Windows bench PC) or local (this
  machine, no ssh). Default: $env:GG_BACKEND, else Default in tools\test\backends.psd1. -RemoteHost/-RemoteBase
  override the backend's host and base. See docs\testing\usage.md.

.PARAMETER ShowBackend
  Print the resolved backend (GGBACKEND|name|transport|os|host|base|...) and exit 0 without running anything.

.PARAMETER SlotMinFreeGb
  Deprecated and ignored for compatibility. Available RAM does not gate slot acquisition or JVM launch.

.EXAMPLE
  Invoke-GGTest.ps1 -Suite server -Commands 'kubejs custom_command gg_ping' -WaitForLog 'GGTEST\|PING\|PASS'

.EXAMPLE
  Invoke-GGTest.ps1 -Suite both -Flat
#>
[CmdletBinding()]
param(
    [ValidateSet('server', 'client', 'both')][string]$Suite = 'server',
    [string[]]$Commands,
    [string]$CommandsFile,
    [string[]]$WaitForLog,
    [ValidateRange(1, 180)][int]$WaitTimeoutSec = 120,
    [switch]$Flat,
    [string]$Seed = 'GregtechGrindless',
    [switch]$KeepServerRunning,
    [string]$OutDir,
    [string]$PackDir,
    [string]$OverlayDir,
    [switch]$SkipRefresh,
    [ValidateRange(1, 420)][int]$BootTimeoutSec = 420,
    [ValidateRange(1, 60)][int]$CommandTimeoutSec = 60,
    [ValidateRange(1, 600)][int]$ClientTimeoutSec = 600,
    [ValidateRange(1, 600)][int]$NativeTimeoutSec = 600,
    [ValidateRange(1, 15)][int]$LockWaitMin = 5,
    [ValidateRange(1, 1)][int]$Slots = 1,
    [double]$SlotMinFreeGb = 0,
    [ValidateRange(0, 60)][int]$SettleSec = 15,
    [string]$ServerXms = '1G',
    [string]$ServerXmx = '4G',
    [string]$ClientXms = '1G',
    [string]$ClientXmx = '4G',
    [string[]]$ServerProp,
    [ValidateSet('mesa', 'stub')][string]$ClientRenderer = 'mesa',
    [string[]]$ClientExclude,
    [switch]$Strict,
    [switch]$ShowWarnings,
    [string]$Backend,
    [switch]$ShowBackend,
    [string]$RemoteHost,
    [string]$RemoteBase,
    [string]$PackwizExe
)

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
. (Join-Path (Join-Path $PSScriptRoot 'remote') 'gg-resource-policy.ps1')
if ($PSBoundParameters.ContainsKey('SlotMinFreeGb')) {
    Write-Warning '-SlotMinFreeGb is deprecated and ignored; available RAM does not gate slot acquisition or JVM launch'
}
[Threading.Thread]::CurrentThread.CurrentCulture = [Globalization.CultureInfo]::InvariantCulture
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

# Plain .NET calls instead of Join-Path/Test-Path/Get-ChildItem: on some agent shells those cmdlets cost
# 40 ms - 1 s per call. Console output goes through [Console]::Out for the same reason (Write-Host ~0.3 s/call).
function J([string]$a, [string]$b) { return [IO.Path]::Combine($a, $b.Replace([char]92, [IO.Path]::DirectorySeparatorChar)) }
function FExists([string]$p) { return [IO.File]::Exists($p) }
function DExists([string]$p) { return [IO.Directory]::Exists($p) }

$script:Wall = [Diagnostics.Stopwatch]::StartNew()
$stamp = (Get-Date).ToString('yyyyMMdd-HHmmss')
$rand = ([guid]::NewGuid().ToString('N')).Substring(0, 3)
$runId = "$stamp-$Suite-$rand"
$localIsWin = [Environment]::OSVersion.Platform -eq [PlatformID]::Win32NT
$sshExe = 'ssh'; $scpExe = 'scp'; $psExe = 'pwsh'
if ($localIsWin) { $sshExe = 'ssh.exe'; $scpExe = 'scp.exe'; $psExe = 'powershell.exe' }

# ------------------------------------------------------------ backend (tools/test/backends.psd1)
# Precedence: -Backend > $env:GG_BACKEND > Default. An optional, untracked backends.local.psd1 next to it (or the file
# named by $env:GG_BACKENDS_LOCAL) overrides single keys per backend, e.g. a larger VM's MemoryMax.
$beCfg = Import-PowerShellDataFile (J $PSScriptRoot 'backends.psd1')
$beLocalPath = $env:GG_BACKENDS_LOCAL
if (-not $beLocalPath) { $beLocalPath = J $PSScriptRoot 'backends.local.psd1' }
$beLocal = $null
if (FExists $beLocalPath) { $beLocal = Import-PowerShellDataFile $beLocalPath }
if ($beLocal -and $beLocal.Default) { $beCfg.Default = $beLocal.Default }
if (-not $Backend) { $Backend = $env:GG_BACKEND }
if (-not $Backend) { $Backend = $beCfg.Default }
if (-not $beCfg.Backends.ContainsKey($Backend)) {
    throw ("unknown backend '{0}' (known: {1}; see tools/test/backends.psd1)" -f $Backend, (($beCfg.Backends.Keys | Sort-Object) -join ', '))
}
$be = @{} + $beCfg.Backends[$Backend]
if ($beLocal -and $beLocal.Backends -and $beLocal.Backends.ContainsKey($Backend)) {
    foreach ($k in $beLocal.Backends[$Backend].Keys) { $be[$k] = $beLocal.Backends[$Backend][$k] }
}
$beTransport = [string]$be.Transport
if (@('ssh', 'local') -notcontains $beTransport) { throw "backend '$Backend': Transport must be ssh or local, not '$beTransport'" }
$beOs = [string]$be.Os
if ($beTransport -eq 'local') { $beOs = $(if ($localIsWin) { 'windows' } else { 'linux' }) }
if (@('windows', 'linux') -notcontains $beOs) { throw "backend '$Backend': Os must be windows or linux, not '$beOs'" }
if (@($be.Suites) -notcontains $Suite -or ($beOs -eq 'linux' -and $Suite -ne 'server')) {
    throw ("backend '{0}' ({1}) does not run -Suite {2}; the client suite needs the Windows bench: -Backend home" -f $Backend, $beOs, $Suite)
}
if ($beTransport -eq 'ssh' -and -not $RemoteHost) { $RemoteHost = [string]$be.Host }
if ($beTransport -eq 'ssh' -and -not $RemoteHost) { throw "backend '$Backend' has no Host" }
if (-not $RemoteBase) {
    if ($beTransport -eq 'local') {
        $RemoteBase = $env:GG_BASE
        if (-not $RemoteBase) { $RemoteBase = $(if ($localIsWin) { [string]$be.BaseWindows } else { [string]$be.BaseLinux }) }
    } else { $RemoteBase = [string]$be.Base }
}
if (-not $RemoteBase) { throw "backend '$Backend' has no Base" }
$beMemoryMax = $env:GG_MEMORY_MAX
if (-not $beMemoryMax) { $beMemoryMax = [string]$be.MemoryMax }
$beMemorySwapMax = [string]$be.MemorySwapMax
foreach ($v in @($beMemoryMax, $beMemorySwapMax)) {
    if ($v -and $v -notmatch '^[0-9]+[KMGT]?$|^infinity$') { throw "backend '$Backend': invalid memory value '$v' (use e.g. 6500M)" }
}

$repoRoot = [IO.Path]::GetFullPath((J (J $PSScriptRoot '..') '..'))
if (-not $PackDir) { $PackDir = J $repoRoot 'pack' }
if (-not $OverlayDir) { $OverlayDir = J $PSScriptRoot 'overlay' }
if (-not $OutDir) {
    $outRoot = $env:GG_OUT_ROOT
    if (-not $outRoot -and $localIsWin) { $outRoot = 'C:\Users\EzequielC\.copilot\session-state\52ba6327-e548-48e7-aa57-41c2373d41c2\files\test-runs' }
    if (-not $outRoot) { $outRoot = J (J (J $HOME '.cache') 'grindless') 'test-runs' }
    $OutDir = J $outRoot "$stamp-$Suite"
    # several runs started in the same second (concurrent agents) must not share one output folder
    if (DExists $OutDir) { $OutDir = "$OutDir-$rand" }
}
if (-not $PackwizExe) {
    $PackwizExe = 'C:\Users\EzequielC\.copilot\session-state\52ba6327-e548-48e7-aa57-41c2373d41c2\files\tools\packwiz\packwiz.exe'
    if (-not (FExists $PackwizExe)) {
        $cmd = Get-Command packwiz -ErrorAction SilentlyContinue
        if ($cmd) { $PackwizExe = $cmd.Source }
    }
}
$remoteFwd = $RemoteBase.Replace('\', '/').TrimEnd('/')
$remoteWin = $RemoteBase.TrimEnd('\')
$remoteRunner = 'test PC'
if ($beTransport -eq 'local') { $remoteRunner = 'local runner' } elseif ($beOs -eq 'linux') { $remoteRunner = "test VM ($RemoteHost)" }
if ($ShowBackend) {
    # dry run: print the resolved backend and stop; touches no bench
    [Console]::Out.WriteLine(("GGBACKEND|{0}|transport={1}|os={2}|host={3}|base={4}|suite={5}|memoryMax={6}|memorySwapMax={7}" -f `
        $Backend, $beTransport, $beOs, $RemoteHost, $RemoteBase, $Suite, $(if ($beMemoryMax) { $beMemoryMax } else { 'auto' }), $(if ($beMemorySwapMax) { $beMemorySwapMax } else { 'auto' })))
    exit 0
}
$PackDir = [IO.Path]::GetFullPath($PackDir)
$OverlayDir = [IO.Path]::GetFullPath($OverlayDir)
$OutDir = [IO.Path]::GetFullPath($OutDir)
[void][IO.Directory]::CreateDirectory($OutDir)

# ------------------------------------------------------------ helpers
$script:LStages = New-Object System.Collections.ArrayList
$script:LStatus = 'PASS'
$script:LDetail = ''

function Write-Step([string]$Message) {
    [Console]::Out.WriteLine(('{0} [local] {1}' -f [datetime]::Now.ToString('HH:mm:ss'), $Message))
}

function Set-LocalStage([string]$Status = 'PASS', [string]$Detail = '') { $script:LStatus = $Status; $script:LDetail = $Detail }

function Save-LocalStages {
    $json = ConvertTo-Json -InputObject @($script:LStages.ToArray()) -Depth 4
    [IO.File]::WriteAllText((J $OutDir 'local-stages.json'), $json, (New-Object Text.UTF8Encoding($false)))
}

function Invoke-LocalStage {
    param([string]$StageName, [scriptblock]$StageBody)
    $script:LStatus = 'PASS'; $script:LDetail = ''
    $__sw = [Diagnostics.Stopwatch]::StartNew()
    $__ok = $true
    try {
        $null = & $StageBody
    } catch {
        $script:LStatus = 'FAIL'
        $script:LDetail = $_.Exception.Message
        $__ok = $false
    }
    $secs = [math]::Round($__sw.Elapsed.TotalSeconds, 1)
    [void]$script:LStages.Add([ordered]@{ name = $StageName; status = $script:LStatus; seconds = $secs; detail = $script:LDetail })
    Save-LocalStages
    Write-Step ("{0,-5} {1} ({2}s) {3}" -f $script:LStatus, $StageName, $secs, $script:LDetail)
    return $__ok
}

function Invoke-NativeCapture {
    param([string]$File, [string]$Arguments, [string]$WorkDir)
    $psi = New-Object Diagnostics.ProcessStartInfo($File, $Arguments)
    if ($WorkDir) { $psi.WorkingDirectory = $WorkDir }
    $psi.UseShellExecute = $false
    $psi.RedirectStandardOutput = $true
    $psi.RedirectStandardError = $true
    $psi.CreateNoWindow = $true
    $p = [Diagnostics.Process]::Start($psi)
    $so = $p.StandardOutput.ReadToEndAsync()
    $se = $p.StandardError.ReadToEndAsync()
    $p.WaitForExit()
    return [pscustomobject]@{ Code = $p.ExitCode; Out = $so.Result; Err = $se.Result }
}

$sshOpts = '-o BatchMode=yes -o ConnectTimeout=20 -o ServerAliveInterval=30 -o ServerAliveCountMax=40'

function Invoke-SshCapture {
    param([string]$RemoteCommand)
    return (Invoke-NativeCapture $sshExe ("$sshOpts $RemoteHost `"$RemoteCommand`"") $null)
}

# Streams a process's output (stdout live, then stderr) to the console and a log file; returns the exit code.
function Invoke-StreamProcess {
    param([string]$File, [string]$Arguments, [string]$LogPath, [hashtable]$Environment)
    $psi = New-Object Diagnostics.ProcessStartInfo($File, $Arguments)
    $psi.UseShellExecute = $false
    $psi.RedirectStandardOutput = $true
    $psi.RedirectStandardError = $true
    $psi.CreateNoWindow = $true
    if ($Environment) { foreach ($k in $Environment.Keys) { $psi.EnvironmentVariables[$k] = [string]$Environment[$k] } }
    $log = New-Object IO.StreamWriter($LogPath, $false, (New-Object Text.UTF8Encoding($false)))
    $log.AutoFlush = $true
    try {
        $p = [Diagnostics.Process]::Start($psi)
        $se = $p.StandardError.ReadToEndAsync()
        while ($null -ne ($line = $p.StandardOutput.ReadLine())) {
            [Console]::Out.WriteLine($line)
            $log.WriteLine($line)
        }
        $p.WaitForExit()
        foreach ($line in ($se.Result -split "`r?`n" | Where-Object { $_ })) {
            [Console]::Out.WriteLine($line)
            $log.WriteLine($line)
        }
        return $p.ExitCode
    } finally { $log.Dispose() }
}

# Streams the remote command output (stderr merged by cmd) to the console and a log file; returns the exit code.
function Invoke-SshStream {
    param([string]$RemoteCommand, [string]$LogPath)
    if (-not $localIsWin) { return (Invoke-StreamProcess $sshExe "$sshOpts $RemoteHost `"$RemoteCommand`"" $LogPath) }
    $inner = "ssh.exe $sshOpts $RemoteHost `"$RemoteCommand`""
    $psi = New-Object Diagnostics.ProcessStartInfo('cmd.exe', ('/S /C "' + $inner + ' 2>&1"'))
    $psi.UseShellExecute = $false
    $psi.RedirectStandardOutput = $true
    $psi.CreateNoWindow = $true
    $log = New-Object IO.StreamWriter($LogPath, $false, (New-Object Text.UTF8Encoding($false)))
    $log.AutoFlush = $true
    try {
        $p = [Diagnostics.Process]::Start($psi)
        while ($null -ne ($line = $p.StandardOutput.ReadLine())) {
            [Console]::Out.WriteLine($line)
            $log.WriteLine($line)
        }
        $p.WaitForExit()
        return $p.ExitCode
    } finally { $log.Dispose() }
}

function Invoke-Scp {
    param([string[]]$Arguments)
    $a = @('-o', 'BatchMode=yes', '-o', 'ConnectTimeout=20') + $Arguments
    $prev = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'
    try {
        $out = & $scpExe @a 2>&1 | ForEach-Object { "$_" }
        $code = $LASTEXITCODE
    } finally { $ErrorActionPreference = $prev }
    if ($code -ne 0) { throw ("scp failed ({0}): {1}" -f $code, ($out -join ' ')) }
}

function Split-Multi {
    param([string[]]$Items)
    $r = New-Object System.Collections.ArrayList
    foreach ($i in @($Items)) {
        if ($null -eq $i) { continue }
        foreach ($p in ($i -split ';;')) {
            foreach ($q in ($p -split "`r?`n")) { $t = $q.Trim(); if ($t) { [void]$r.Add($t) } }
        }
    }
    return @($r.ToArray())
}

# Verifies, with plain hashing, that pack.toml/index.toml match the files on disk (what packwiz-installer will
# check on the PC). Returns the list of problems; catches a stale index locally instead of after the upload.
function Test-PackIndexFresh {
    param([string]$Dir)
    $problems = New-Object System.Collections.ArrayList
    $newHasher = {
        param([string]$fmt)
        switch ($fmt.ToLowerInvariant()) {
            'sha256' { return [Security.Cryptography.SHA256]::Create() }
            'sha1' { return [Security.Cryptography.SHA1]::Create() }
            'sha512' { return [Security.Cryptography.SHA512]::Create() }
            'md5' { return [Security.Cryptography.MD5]::Create() }
            default { return $null }
        }
    }
    $hashFile = {
        param([string]$path, [string]$fmt)
        $h = & $newHasher $fmt
        if (-not $h) { return $null }
        return (($h.ComputeHash([IO.File]::ReadAllBytes($path)) | ForEach-Object { $_.ToString('x2') }) -join '')
    }
    $packToml = [IO.File]::ReadAllText((J $Dir 'pack.toml'))
    $im = [regex]::Match($packToml, '(?ms)^\[index\]\s*(.*?)(?=^\[|\z)')
    if (-not $im.Success) { [void]$problems.Add('pack.toml has no [index] table'); return @($problems.ToArray()) }
    $get = { param([string]$block, [string]$key) $m = [regex]::Match($block, '(?m)^\s*' + [regex]::Escape($key) + '\s*=\s*"([^"]*)"'); if ($m.Success) { $m.Groups[1].Value } else { '' } }
    $idxName = & $get $im.Groups[1].Value 'file'
    $idxFmt = & $get $im.Groups[1].Value 'hash-format'
    $idxHash = & $get $im.Groups[1].Value 'hash'
    if (-not $idxName) { $idxName = 'index.toml' }
    $idxPath = J $Dir $idxName
    if (-not (FExists $idxPath)) { [void]$problems.Add("$idxName is missing"); return @($problems.ToArray()) }
    $actual = & $hashFile $idxPath $idxFmt
    if ($actual -and $idxHash -and ($actual -ne $idxHash.ToLowerInvariant())) { [void]$problems.Add("pack.toml [index] hash does not match $idxName") }

    $idx = [IO.File]::ReadAllText($idxPath)
    $parts = [regex]::Split($idx, '(?m)^\[\[files\]\]\s*$')
    $defaultFmt = & $get $parts[0] 'hash-format'
    if (-not $defaultFmt) { $defaultFmt = 'sha256' }
    for ($i = 1; $i -lt $parts.Count; $i++) {
        $file = & $get $parts[$i] 'file'
        $hash = & $get $parts[$i] 'hash'
        $fmt = & $get $parts[$i] 'hash-format'
        if (-not $fmt) { $fmt = $defaultFmt }
        if (-not $file) { continue }
        $path = J $Dir $file.Replace('/', [IO.Path]::DirectorySeparatorChar)
        if (-not (FExists $path)) { [void]$problems.Add("$file is in the index but missing on disk"); continue }
        $h = & $hashFile $path $fmt
        if ($h -and $hash -and ($h -ne $hash.ToLowerInvariant())) { [void]$problems.Add("$file changed since the last refresh") }
    }
    return @($problems.ToArray())
}

function Add-ZipDirectory {
    param($Zip, [string]$Dir, [string]$Prefix)
    $root = $Dir.TrimEnd('\', '/')
    $count = 0
    foreach ($full in [IO.Directory]::GetFiles($root, '*', [IO.SearchOption]::AllDirectories)) {
        $rel = $full.Substring($root.Length + 1)
        if ($rel -match '(^|[\\/])\.git([\\/]|$)' -or $rel -match '(^|[\\/])(Thumbs\.db|\.DS_Store)$') { continue }
        $entry = $Zip.CreateEntry($Prefix + '/' + $rel.Replace('\', '/'), [IO.Compression.CompressionLevel]::Optimal)
        $lw = [IO.File]::GetLastWriteTime($full)
        if ($lw.Year -lt 1980) { $lw = New-Object DateTime(1980, 1, 1) }
        $entry.LastWriteTime = $lw
        $in = New-Object IO.FileStream($full, [IO.FileMode]::Open, [IO.FileAccess]::Read, ([IO.FileShare]::ReadWrite -bor [IO.FileShare]::Delete))
        try {
            $out = $entry.Open()
            try { $in.CopyTo($out) } finally { $out.Dispose() }
        } finally { $in.Dispose() }
        $count++
    }
    return $count
}

# ------------------------------------------------------------ request
$cmdList = New-Object System.Collections.ArrayList
foreach ($c in (Split-Multi $Commands)) { [void]$cmdList.Add($c) }
if ($CommandsFile) {
    if (-not (FExists $CommandsFile)) { throw "CommandsFile not found: $CommandsFile" }
    foreach ($l in [IO.File]::ReadAllLines($CommandsFile)) { $t = $l.Trim(); if ($t -and -not $t.StartsWith('#')) { [void]$cmdList.Add($t) } }
}
$waitList = New-Object System.Collections.ArrayList
foreach ($w in (Split-Multi $WaitForLog)) {
    $pat = $w; $to = $WaitTimeoutSec
    if ($w -match '^(.*)@@(\d+)$') { $pat = $Matches[1]; $to = [int]$Matches[2] }
    try { [void][regex]::new($pat) } catch { throw "invalid -WaitForLog regex '$pat': $($_.Exception.Message)" }
    [void]$waitList.Add([ordered]@{ pattern = $pat; timeoutSec = $to })
}
if ($Suite -eq 'client' -and ($cmdList.Count -gt 0 -or $waitList.Count -gt 0)) {
    Write-Step 'NOTE: -Commands/-WaitForLog only apply to the server suite; ignored for -Suite client'
}
if ($KeepServerRunning) { Write-Step 'NOTE: -KeepServerRunning is not supported; the server is always stopped' }

# -ClientRenderer mesa (default): the real client mod set on real LWJGL + Mesa llvmpipe software OpenGL.
# -ClientRenderer stub: HeadlessMC's -lwjgl stub; its glFenceSync returns 0, which crashes Embeddium
# (MinecraftClientMixin.postRender: "Failed to create fence object"; no config switch exists), so unless
# -ClientExclude is given the stub mode drops ONLY Embeddium from the TEST client (never from the pack).
if ($ClientRenderer -eq 'stub' -and -not $PSBoundParameters.ContainsKey('ClientExclude')) {
    $ClientExclude = '^embeddium[-_+0-9]'
}
$clientExcludeList = @(Split-Multi $ClientExclude | Where-Object { $_ -ne 'none' })
foreach ($rx in $clientExcludeList) {
    try { [void][regex]::new($rx) } catch { throw "invalid -ClientExclude regex '$rx': $($_.Exception.Message)" }
}

$gitCommit = ''; $gitDirty = $null
try {
    $g = Invoke-NativeCapture 'git' 'rev-parse HEAD' $repoRoot
    if ($g.Code -eq 0) { $gitCommit = $g.Out.Trim() }
    # only what the run ships: the pack, the overlay and the harness scripts
    $g = Invoke-NativeCapture 'git' 'status --porcelain -- pack tools/test' $repoRoot
    if ($g.Code -eq 0) { $gitDirty = [bool]$g.Out.Trim() }
} catch {}

$request = [ordered]@{
    runId             = $runId
    suite             = $Suite
    backend           = $Backend
    os                = $beOs
    commit            = $gitCommit
    dirty             = $gitDirty
    commands          = @($cmdList.ToArray())
    waitForLog        = @($waitList.ToArray())
    flat              = [bool]$Flat
    seed              = $Seed
    bootTimeoutSec    = $BootTimeoutSec
    commandTimeoutSec = $CommandTimeoutSec
    clientTimeoutSec  = $ClientTimeoutSec
    nativeTimeoutSec  = $NativeTimeoutSec
    waitTimeoutSec    = $WaitTimeoutSec
    serverXms         = $ServerXms
    serverXmx         = $ServerXmx
    clientXms         = $ClientXms
    clientXmx         = $ClientXmx
    serverProps       = @(Split-Multi $ServerProp)
    clientRenderer    = $ClientRenderer
    clientExclude     = @($clientExcludeList)
    lockWaitMin       = $LockWaitMin
    slots             = $Slots
    settleSec         = $SettleSec
    createdUtc        = [datetime]::UtcNow.ToString('o')
}
Assert-GGResourceRequest ([pscustomobject]$request)
$requestJson = ConvertTo-Json -InputObject $request -Depth 6
[IO.File]::WriteAllText((J $OutDir 'request.json'), $requestJson, (New-Object Text.UTF8Encoding($false)))

Write-Step ("run {0}: backend={1} ({2}) suite={3} flat={4} commands={5} waitForLog={6}" -f $runId, $Backend, $beOs, $Suite, [bool]$Flat, $cmdList.Count, $waitList.Count)
Write-Step "out dir: $OutDir"

$zipPath = J $OutDir 'upload.zip'
$remoteScriptsHash = ''
$script:OomHit = $false

# ------------------------------------------------------------ stages
$ok = Invoke-LocalStage 'refresh' {
    if (-not (FExists (J $PackDir 'pack.toml'))) { throw "pack not found: $(J $PackDir 'pack.toml') (the pack is not created yet?)" }
    if ($SkipRefresh) { Set-LocalStage 'SKIP' 'skipped (-SkipRefresh)'; return }
    if (-not (FExists $PackwizExe)) { throw "packwiz not found ($PackwizExe); pass -PackwizExe, or -SkipRefresh when the committed index is fresh" }
    # tools\Update-PackIndex.ps1 normalizes pack text files (UTF-8 no BOM, LF) and then runs `packwiz refresh`
    $upd = [IO.Path]::GetFullPath((J (J $PSScriptRoot '..') 'Update-PackIndex.ps1'))
    if (FExists $upd) {
        $how = 'Update-PackIndex'
        $r = Invoke-NativeCapture $psExe ("-NoProfile -ExecutionPolicy Bypass -File `"$upd`" -PackDir `"$PackDir`" -Packwiz `"$PackwizExe`"") $repoRoot
    } else {
        $how = 'packwiz refresh'
        $r = Invoke-NativeCapture $PackwizExe 'refresh' $PackDir
    }
    $txt = (($r.Out + "`n" + $r.Err) -split "[`r`n]+" | Where-Object { $_.Trim() })
    if ($r.Code -ne 0) {
        $tail = (($txt | Select-Object -Last 4) -join ' | ')
        throw ("{0} failed (exit {1}): {2}" -f $how, $r.Code, $tail)
    }
    $norm = ($txt | Where-Object { $_ -match 'Normalized' } | Select-Object -First 1)
    $last = ($txt | Select-Object -Last 1)
    $detail = [string]$last
    if ($norm -and $norm -ne $last) { $detail = "$norm | $last" }
    Set-LocalStage 'PASS' $detail
}

if ($ok) {
    $ok = Invoke-LocalStage 'package' {
        $bad = @(Test-PackIndexFresh $PackDir)
        if ($bad.Count -gt 0) {
            $hint = 'the pack changed while the harness was running; run it again'
            if ($SkipRefresh) { $hint = 'run again without -SkipRefresh' }
            throw ("pack index is stale ({0} problem(s)): {1}{2} - {3}" -f $bad.Count, (($bad | Select-Object -First 6) -join '; '), $(if ($bad.Count -gt 6) { '; ...' } else { '' }), $hint)
        }
        if (FExists $zipPath) { [IO.File]::Delete($zipPath) }
        $fs = [IO.File]::Open($zipPath, [IO.FileMode]::CreateNew)
        $zip = New-Object IO.Compression.ZipArchive($fs, [IO.Compression.ZipArchiveMode]::Create)
        try {
            $np = Add-ZipDirectory $zip $PackDir 'pack'
            $no = 0
            if (DExists $OverlayDir) { $no = Add-ZipDirectory $zip $OverlayDir 'overlay' }
            $e = $zip.CreateEntry('request.json')
            $w = New-Object IO.StreamWriter($e.Open(), (New-Object Text.UTF8Encoding($false)))
            $w.Write($requestJson); $w.Dispose()
        } finally { $zip.Dispose(); $fs.Dispose() }
        $mb = [math]::Round(([IO.FileInfo]$zipPath).Length / 1MB, 2)
        Set-LocalStage 'PASS' ("{0} pack file(s) + {1} overlay file(s), {2} MB" -f $np, $no, $mb)
    }
}

if ($ok) {
    $ok = Invoke-LocalStage 'upload' {
        $remoteDir = J $PSScriptRoot 'remote'
        $names = New-Object System.Collections.ArrayList
        $sha = [Security.Cryptography.SHA1]::Create()
        $all = ''
        foreach ($f in (@([IO.Directory]::GetFiles($remoteDir, '*.ps1')) + @([IO.Directory]::GetFiles($remoteDir, '*.sh')) | Sort-Object)) {
            [void]$names.Add([IO.Path]::GetFileName($f))
            $h = (($sha.ComputeHash([IO.File]::ReadAllBytes($f)) | ForEach-Object { $_.ToString('x2') }) -join '')
            $all += [IO.Path]::GetFileName($f) + ':' + $h + ';'
        }
        if ($names.Count -eq 0) { throw "no remote scripts in $remoteDir" }
        $script:remoteScriptsHash = (($sha.ComputeHash([Text.Encoding]::UTF8.GetBytes($all)) | ForEach-Object { $_.ToString('x2') }) -join '').Substring(0, 10)
        $h = $script:remoteScriptsHash
        if ($beTransport -eq 'local') {
            # same layout as a remote bench: <base>/tools/remote/<hash>/ (renamed into place) and <base>/incoming/<runId>.zip
            $rroot = J (J $RemoteBase 'tools') 'remote'
            $rdirL = J $rroot $h
            [void][IO.Directory]::CreateDirectory((J $RemoteBase 'incoming'))
            $how = 'scripts already in place'
            if (-not (DExists $rdirL) -or @($names | Where-Object { -not (FExists (J $rdirL $_)) }).Count -gt 0) {
                $tmpL = J $rroot ('{0}.up{1}' -f $h, ([guid]::NewGuid().ToString('N')).Substring(0, 6))
                [void][IO.Directory]::CreateDirectory($tmpL)
                foreach ($n in $names) { [IO.File]::Copy((J $remoteDir $n), (J $tmpL $n), $true) }
                try { [IO.Directory]::Move($tmpL, $rdirL) } catch {
                    if (-not (DExists $rdirL)) { [IO.Directory]::CreateDirectory($rdirL) | Out-Null }
                    foreach ($n in $names) { [IO.File]::Copy((J $tmpL $n), (J $rdirL $n), $true) }
                    [IO.Directory]::Delete($tmpL, $true)
                }
                $how = "{0} script(s) copied" -f $names.Count
            }
            [IO.File]::Copy($zipPath, (J (J $RemoteBase 'incoming') "$runId.zip"), $true)
            Set-LocalStage 'PASS' ("zip copied, {0} (remote scripts {1})" -f $how, $h)
            return
        }
        $rdir = "$remoteWin\tools\remote\$h"
        $rdirL = "$remoteFwd/tools/remote/$h"
        if ($beOs -eq 'linux') {
            $cmdMk = "mkdir -p $remoteFwd/incoming $remoteFwd/tools/remote && echo GGOK && ls -1 $rdirL 2>/dev/null"
            $cmdLs = "ls -1 $rdirL"
        } else {
            $cmdMk = "mkdir $remoteWin\incoming 2>nul & mkdir $remoteWin\tools\remote 2>nul & echo GGOK & dir /b $rdir 2>nul"
            $cmdLs = "dir /b $rdir"
        }
        $mk = Invoke-SshCapture $cmdMk
        if ($mk.Out -notmatch 'GGOK') { throw ("cannot reach the {0} over ssh ({1}): {2}" -f $remoteRunner, $mk.Code, (($mk.Err + ' ' + $mk.Out).Trim())) }
        $present = @($mk.Out -split "[`r`n]+" | ForEach-Object { $_.Trim().ToLowerInvariant() } | Where-Object { $_ -and $_ -ne 'ggok' })
        $missing = @($names | Where-Object { $present -notcontains $_.ToLowerInvariant() })
        $how = "scripts already on the $remoteRunner"
        if ($missing.Count -gt 0 -and $present.Count -gt 0) {
            # directory exists but is incomplete (interrupted upload): fill it in place
            Push-Location $remoteDir
            try { Invoke-Scp (@($names.ToArray()) + @("${RemoteHost}:$remoteFwd/tools/remote/$h/")) } finally { Pop-Location }
            $how = "{0} script(s) uploaded" -f $names.Count
        } elseif ($missing.Count -gt 0) {
            # Upload into a private directory and rename it into place: the final directory only ever appears
            # complete, and several runs uploading the same scripts at once cannot trip over each other.
            $tmpLeaf = '{0}.up{1}' -f $h, ([guid]::NewGuid().ToString('N')).Substring(0, 6)
            if ($beOs -eq 'linux') {
                $cmdMkt = "mkdir -p $remoteFwd/tools/remote/$tmpLeaf && echo GGOK"
                $cmdFin = "mv -T $remoteFwd/tools/remote/$tmpLeaf $rdirL 2>/dev/null || rm -rf $remoteFwd/tools/remote/$tmpLeaf; echo GGOK; ls -1 $rdirL"
            } else {
                $cmdMkt = "mkdir $remoteWin\tools\remote\$tmpLeaf & echo GGOK"
                $cmdFin = "ren $remoteWin\tools\remote\$tmpLeaf $h 2>nul || rmdir /s /q $remoteWin\tools\remote\$tmpLeaf & echo GGOK & dir /b $rdir"
            }
            $mkt = Invoke-SshCapture $cmdMkt
            if ($mkt.Out -notmatch 'GGOK') { throw ("cannot create the upload directory on the {0}: {1}" -f $remoteRunner, (($mkt.Err + ' ' + $mkt.Out).Trim())) }
            Push-Location $remoteDir
            try { Invoke-Scp (@($names.ToArray()) + @("${RemoteHost}:$remoteFwd/tools/remote/$tmpLeaf/")) } finally { Pop-Location }
            $fin = Invoke-SshCapture $cmdFin
            if ($fin.Out -notmatch 'GGOK') { throw ("cannot finish the script upload on the {0}: {1}" -f $remoteRunner, (($fin.Err + ' ' + $fin.Out).Trim())) }
            $have = @($fin.Out -split "[`r`n]+" | ForEach-Object { $_.Trim().ToLowerInvariant() })
            $still = @($names | Where-Object { $have -notcontains $_.ToLowerInvariant() })
            # the directory may have been created by a run that fills it the old way (mkdir + copy): give it a moment
            for ($w = 0; $still.Count -gt 0 -and $w -lt 10; $w++) {
                Start-Sleep -Seconds 3
                $chk = Invoke-SshCapture $cmdLs
                $have = @($chk.Out -split "[`r`n]+" | ForEach-Object { $_.Trim().ToLowerInvariant() })
                $still = @($names | Where-Object { $have -notcontains $_.ToLowerInvariant() })
            }
            if ($still.Count -gt 0) { throw ("scripts are not complete on the {0} after the upload (missing: {1})" -f $remoteRunner, ($still -join ', ')) }
            $how = "{0} script(s) uploaded" -f $names.Count
        }
        Push-Location $OutDir
        try { Invoke-Scp @('upload.zip', "${RemoteHost}:$remoteFwd/incoming/$runId.zip") } finally { Pop-Location }
        Set-LocalStage 'PASS' ("zip uploaded, {0} (remote scripts {1})" -f $how, $script:remoteScriptsHash)
    }
}

if ($ok) {
    Write-Step "running on the $remoteRunner (streaming remote log; waits for the single global Minecraft slot, regardless of available RAM) ..."
    $remoteLog = J $OutDir 'remote-output.log'
    $sw = [Diagnostics.Stopwatch]::StartNew()
    $code = -1
    # Linux runners start through gg-linux-run.sh: a transient systemd scope caps the run's memory (MemoryMax).
    $memEnv = ''
    if ($beMemoryMax) { $memEnv += " GG_MEMORY_MAX=$beMemoryMax" }
    if ($beMemorySwapMax) { $memEnv += " GG_MEMORY_SWAP_MAX=$beMemorySwapMax" }
    try {
        if ($beTransport -eq 'local') {
            $rdirL = J (J (J $RemoteBase 'tools') 'remote') $remoteScriptsHash
            $envL = @{ GG_BASE = $RemoteBase }
            if ($beMemoryMax) { $envL.GG_MEMORY_MAX = $beMemoryMax }
            if ($beMemorySwapMax) { $envL.GG_MEMORY_SWAP_MAX = $beMemorySwapMax }
            if ($localIsWin) {
                $code = Invoke-StreamProcess 'powershell.exe' ("-NoProfile -ExecutionPolicy Bypass -File `"{0}`" -RunId {1}" -f (J $rdirL 'Run-GGTest.ps1'), $runId) $remoteLog $envL
            } else {
                $code = Invoke-StreamProcess 'bash' ("`"{0}`" {1}" -f (J $rdirL 'gg-linux-run.sh'), $runId) $remoteLog $envL
            }
        } elseif ($beOs -eq 'linux') {
            $rcmd = "GG_BASE=$remoteFwd$memEnv bash $remoteFwd/tools/remote/$remoteScriptsHash/gg-linux-run.sh $runId 2>&1"
            $code = Invoke-SshStream $rcmd $remoteLog
        } else {
            $rcmd = "powershell -NoProfile -ExecutionPolicy Bypass -File $remoteWin\tools\remote\$remoteScriptsHash\Run-GGTest.ps1 -RunId $runId"
            $code = Invoke-SshStream $rcmd $remoteLog
        }
    } catch { Write-Step ("remote stream failed: " + $_.Exception.Message) }
    Write-Step ("remote runner finished (exit {0}) after {1:N0}s" -f $code, $sw.Elapsed.TotalSeconds)
    # gg-linux-run.sh prints GGOOM|... when the kernel OOM-killed something in the run's scope
    $oomLine = $null
    if (FExists $remoteLog) { $oomLine = [IO.File]::ReadAllLines($remoteLog) | Where-Object { $_ -like 'GGOOM|*' } | Select-Object -First 1 }
    if ($oomLine) {
        [void](Invoke-LocalStage 'memory' { throw "the run hit its memory ceiling and was OOM-killed: $oomLine" })
        $script:OomHit = $true
    }
}

if ($ok) {
    $dl = Invoke-LocalStage 'download' {
        if ($beTransport -eq 'local') {
            $src = J (J (J $RemoteBase 'runs') $runId) 'results.zip'
            if (-not (FExists $src)) { throw "results.zip not found ($src)" }
            [IO.File]::Copy($src, (J $OutDir 'results.zip'), $true)
        } else {
            Push-Location $OutDir
            try {
                if (FExists (J $OutDir 'results.zip')) { [IO.File]::Delete((J $OutDir 'results.zip')) }
                Invoke-Scp @("${RemoteHost}:$remoteFwd/runs/$runId/results.zip", 'results.zip')
            } finally { Pop-Location }
        }
        $dest = J $OutDir 'results'
        if (DExists $dest) { [IO.Directory]::Delete($dest, $true) }
        [IO.Compression.ZipFile]::ExtractToDirectory((J $OutDir 'results.zip'), $dest)
        $mb = [math]::Round(([IO.FileInfo](J $OutDir 'results.zip')).Length / 1MB, 2)
        Set-LocalStage 'PASS' ("results.zip {0} MB" -f $mb)
    }
    if (-not $dl) {
        # best effort: at least fetch the remote runner log
        if ($beTransport -eq 'local') {
            try { [IO.File]::Copy((J (J (J $RemoteBase 'runs') $runId) 'run.log'), (J $OutDir 'remote-run.log'), $true) } catch {}
        } else {
            try { Push-Location $OutDir; Invoke-Scp @("${RemoteHost}:$remoteFwd/runs/$runId/run.log", 'remote-run.log') } catch {} finally { Pop-Location }
        }
    }
}

[Console]::Out.WriteLine('')
$showArgs = @{ OutDir = $OutDir }
if ($Strict) { $showArgs.Strict = $true }
if ($ShowWarnings) { $showArgs.ShowWarnings = $true }
& (J $PSScriptRoot 'Show-GGResults.ps1') @showArgs
$final = $LASTEXITCODE
if (-not $ok -or $script:OomHit -or -not (FExists (J (J $OutDir 'results') 'stages.json'))) { $final = 2 }
Write-Step ("total wall time {0:N0}s" -f $script:Wall.Elapsed.TotalSeconds)
exit $final
