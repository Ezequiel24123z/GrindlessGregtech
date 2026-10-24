# gg-collect.ps1 - collects logs/crash reports/exported files from an instance into the results folder.
. (Join-Path $PSScriptRoot 'gg-common.ps1')

function Save-GGInstanceResults {
    param([string]$Instance, [string]$Dest)
    New-Item -ItemType Directory -Force -Path $Dest | Out-Null
    if (-not (Test-Path -LiteralPath $Instance)) { return }
    $logs = Join-Path $Instance 'logs'
    if (Test-Path $logs) {
        $latest = Join-Path $logs 'latest.log'
        if (Test-Path $latest) { Copy-GGSharedFile $latest (Join-Path $Dest 'logs\latest.log') }
        $debug = Join-Path $logs 'debug.log'
        if (Test-Path $debug) {
            $len = (Get-Item -LiteralPath $debug).Length
            if ($len -le 25MB) { Copy-GGSharedFile $debug (Join-Path $Dest 'logs\debug.log') }
            else { Copy-GGSharedFile $debug (Join-Path $Dest 'logs\debug.tail.log') 5MB }
        }
        $kjs = Join-Path $logs 'kubejs'
        if (Test-Path $kjs) {
            foreach ($f in @(Get-ChildItem $kjs -Filter *.log -File -ErrorAction SilentlyContinue)) {
                Copy-GGSharedFile $f.FullName (Join-Path $Dest ('logs\kubejs\' + $f.Name))
            }
        }
    }
    $crash = Join-Path $Instance 'crash-reports'
    if (Test-Path $crash) {
        foreach ($f in @(Get-ChildItem $crash -File -ErrorAction SilentlyContinue)) {
            Copy-GGSharedFile $f.FullName (Join-Path $Dest ('crash-reports\' + $f.Name))
        }
    }
    foreach ($f in @(Get-ChildItem $Instance -Filter 'hs_err_pid*.log' -File -ErrorAction SilentlyContinue)) {
        Copy-GGSharedFile $f.FullName (Join-Path $Dest ('hs_err\' + $f.Name))
    }
    $exp = Join-Path $Instance 'kubejs\exported'
    if (Test-Path $exp) { Copy-GGTree $exp (Join-Path $Dest 'kubejs-exported') }
    $mods = @(Get-GGModList $Instance)
    if ($mods.Count -gt 0) { [IO.File]::WriteAllLines((Join-Path $Dest 'mods.txt'), [string[]]$mods) }
    $props = Join-Path $Instance 'server.properties'
    if (Test-Path $props) {
        $txt = (Read-GGSharedText $props) -replace '(?m)^rcon\.password=.*$', 'rcon.password=<redacted>'
        [IO.File]::WriteAllText((Join-Path $Dest 'server.properties'), $txt)
    }
}

function New-GGResultsZip {
    param([string]$ResultsDir, [string]$ZipPath)
    if (Test-Path -LiteralPath $ZipPath) { Remove-Item -LiteralPath $ZipPath -Force }
    [IO.Compression.ZipFile]::CreateFromDirectory($ResultsDir, $ZipPath, [IO.Compression.CompressionLevel]::Optimal, $false)
}

# One-line root cause of a crash report: for Forge "mod loading" crashes the per-mod failure messages
# ("-- MOD x --" / "Failure message:"), otherwise the description plus the first exception line.
function Get-GGCrashHint {
    param([string]$File)
    $lines = @()
    try { $lines = @((Read-GGSharedText $File) -split "`r?`n") } catch { return '' }
    $desc = ''
    $fails = @()
    for ($i = 0; $i -lt $lines.Count; $i++) {
        $l = $lines[$i]
        if (-not $desc -and $l -match '^Description:\s*(.+)$') { $desc = $Matches[1] }
        if ($l -match '^-- MOD (\S+) --') {
            $mod = $Matches[1]
            $end = [math]::Min($i + 12, $lines.Count)
            for ($j = $i + 1; $j -lt $end; $j++) {
                if ($lines[$j] -match '^\s*Failure message:\s*(.*)$') {
                    $msg = $Matches[1].Trim()
                    $k = $j + 1
                    while ($k -lt $lines.Count -and $lines[$k] -match '^\t\t\S') { $msg += '; ' + $lines[$k].Trim(); $k++ }
                    $fails += ('{0}: {1}' -f $mod, $msg)
                    break
                }
            }
        }
    }
    if ($fails.Count -gt 0) { return ($desc + ' -> ' + (($fails | Select-Object -First 6) -join ' | ')) }
    $exc = ''
    foreach ($l in $lines) {
        if ($l.Trim() -and $l -notmatch '^(\s*at |---- |//|Time:|Description:)') { $exc = $l.Trim(); break }
    }
    return ($desc + ' -> ' + $exc)
}

# Counts KubeJS script errors/warnings from logs\kubejs\*.log (call inside a stage; writes kubejs-errors.txt).
# Error headlines look like "[12:00:00] [ERROR] ! file.js#3: message"; "!   at ..." lines are stack frames.
function Invoke-GGKubeJsCheck {
    param([string]$Instance, [string]$Dest)
    $dir = Join-Path $Instance 'logs\kubejs'
    $out = @()
    $parts = @()
    $first = @()
    $errTotal = 0
    $recipeWarn = 0
    $seen = 0
    $errRx = [regex]'^\[[^\]]*\]\s+\[ERROR\]\s+!\s+(?!\s*at\s)(.*)$'
    $warnRx = [regex]'^\[[^\]]*\]\s+\[WARN\]\s+(.*)$'
    $benignWarn = [regex]'KubeJS. server\.log may not contain everything|You can still see the full log'
    foreach ($t in @('startup', 'server', 'client')) {
        $f = Join-Path $dir "$t.log"
        if (-not (Test-Path $f)) { continue }
        $seen++
        $e = 0; $w = 0
        $out += "== $t.log =="
        foreach ($line in ((Read-GGSharedText $f) -split "`r?`n")) {
            $m = $errRx.Match($line)
            if ($m.Success) {
                $e++
                $out += $line
                if ($first.Count -lt 3) { $first += ("{0}: {1}" -f $t, $m.Groups[1].Value) }
                continue
            }
            $m = $warnRx.Match($line)
            if ($m.Success -and -not $benignWarn.IsMatch($line)) {
                $w++
                $out += $line
                if ($m.Groups[1].Value -match 'Error parsing recipe|Failed to') { $recipeWarn++ }
            }
        }
        $errTotal += $e
        $parts += ("{0} {1}E/{2}W" -f $t, $e, $w)
    }
    [IO.File]::WriteAllLines((Join-Path $Dest 'kubejs-errors.txt'), [string[]]$out, (New-Object Text.UTF8Encoding($false)))
    if ($seen -eq 0) { Set-GGStage 'SKIP' 'no logs\kubejs logs (KubeJS not loaded?)'; return }
    $summary = ($parts -join ', ')
    if ($errTotal -gt 0 -or $recipeWarn -gt 0) {
        $f1 = ($first -join ' | ')
        if ($f1.Length -gt 240) { $f1 = $f1.Substring(0, 240) + '...' }
        Set-GGStage 'WARN' ("{0} error(s), {1} recipe warning(s) [{2}] {3}" -f $errTotal, $recipeWarn, $summary, $f1)
    } else {
        Set-GGStage 'PASS' ("no KubeJS script errors [{0}]" -f $summary)
    }
}
