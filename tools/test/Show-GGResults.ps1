# Show-GGResults.ps1 - prints the concise summary of a harness run (also usable on an old OutDir):
#   powershell -NoProfile -ExecutionPolicy Bypass -File tools\test\Show-GGResults.ps1 -OutDir <dir> [-Strict] [-ShowWarnings]
# Exit code: 0 = PASS, 1 = FAIL (or WARN stages / unexpected ERROR lines with -Strict).
#
# Implementation note: plain .NET calls are used instead of Join-Path/Test-Path/Get-ChildItem on purpose;
# on some agent shells those cmdlets cost 40 ms - 1 s per call, which made the summary take 15+ s.
[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)][string]$OutDir,
    [int]$TopErrors = 15,
    [switch]$ShowWarnings,
    [switch]$Strict,
    [string]$AllowlistPath
)

$ErrorActionPreference = 'Stop'
[Threading.Thread]::CurrentThread.CurrentCulture = [Globalization.CultureInfo]::InvariantCulture
if (-not $AllowlistPath) { $AllowlistPath = [IO.Path]::Combine($PSScriptRoot, 'log-allowlist.txt') }

function J([string]$a, [string]$b) { return [IO.Path]::Combine($a, $b) }
function FExists([string]$p) { return [IO.File]::Exists($p) }
function DExists([string]$p) { return [IO.Directory]::Exists($p) }
function Files([string]$dir, [string]$pattern, [bool]$recurse) {
    if (-not [IO.Directory]::Exists($dir)) { return @() }
    $opt = [IO.SearchOption]::TopDirectoryOnly
    if ($recurse) { $opt = [IO.SearchOption]::AllDirectories }
    return @([IO.Directory]::GetFiles($dir, $pattern, $opt))
}
function Cut([string]$s, [int]$n) { if ($s.Length -gt $n) { return $s.Substring(0, $n) + '...' } else { return $s } }
function Read-Json([string]$p) {
    if (-not [IO.File]::Exists($p)) { return $null }
    try { return (ConvertFrom-Json ([IO.File]::ReadAllText($p, [Text.Encoding]::UTF8))) } catch { return $null }
}

$lines = New-Object 'System.Collections.Generic.List[string]'
$ellipsis = [string][char]0x2026
$sectionRx = [string][char]0xA7 + '.'      # Minecraft colour codes (section sign + one char)
function Emit {
    param([string]$Text = '')
    # keep the summary plain ASCII (agent shells use legacy code pages)
    $t = [regex]::Replace($Text.Replace($ellipsis, '...'), $sectionRx, '')
    $t = [regex]::Replace($t, '[^\x09\x20-\x7E]', '?')
    $lines.Add($t)
    [Console]::Out.WriteLine($t)
}

$allow = New-Object 'System.Collections.Generic.List[regex]'
if (FExists $AllowlistPath) {
    foreach ($l in [IO.File]::ReadAllLines($AllowlistPath)) {
        $t = $l.Trim()
        if ($t.Length -gt 0 -and -not $t.StartsWith('#')) {
            try { $allow.Add((New-Object Text.RegularExpressions.Regex($t))) } catch { [Console]::Error.WriteLine("bad allowlist regex skipped: $t") }
        }
    }
}

$resDir = J $OutDir 'results'
$meta = Read-Json (J $resDir 'meta.json')
$req = Read-Json (J $OutDir 'request.json')
$localStages = @(Read-Json (J $OutDir 'local-stages.json'))
$remoteStages = @(Read-Json (J $resDir 'stages.json'))
$allStages = New-Object System.Collections.ArrayList
foreach ($s in $localStages) { if ($s -and $s.name -ne 'download') { [void]$allStages.Add($s) } }
foreach ($s in $remoteStages) { if ($s) { [void]$allStages.Add($s) } }
foreach ($s in $localStages) { if ($s -and $s.name -eq 'download') { [void]$allStages.Add($s) } }

# ------------------------------------------------------------ log analysis
$levelRx = [regex]'^\[[^\]]*\]\s+\[(?:[^\]/]*/)?(ERROR|FATAL|WARN)\]'
$tsRx = [regex]'^\[[0-9A-Za-z:. ]+\]\s*'
$frameRx = [regex]'\](?::| !)\s+at\s'                        # stack frames logged line by line (KubeJS/Rhino)
$kubejsRx = [regex]'\[KubeJS (Server|Startup|Client)/\]'     # reported in the KUBEJS section instead
$ggRx = 'GGTEST|'

function Test-Allowed([string]$line, [string]$norm) {
    foreach ($rx in $allow) { if ($rx.IsMatch($norm) -or $rx.IsMatch($line)) { return $true } }
    return $false
}

# Returns the issues of one log and collects GGTEST| markers in the same pass. ERROR/FATAL headlines get up to
# 3 following continuation lines (multi-line messages, first exception line) appended after ' // '.
function Get-LogIssues {
    param([string]$Path, [bool]$SkipKubeJsLogger, $GgList, $GgSeen)
    $r = @{ Errors = @{}; ErrorTotal = 0; Allowed = 0; Warns = @{}; WarnTotal = 0 }
    $all = [IO.File]::ReadAllLines($Path)
    $n = $all.Length
    for ($i = 0; $i -lt $n; $i++) {
        $line = $all[$i]
        $ix = $line.IndexOf($ggRx)
        if ($ix -ge 0) {
            $g = $line.Substring($ix + 7).Trim()
            if (-not $GgSeen.ContainsKey($g)) { $GgSeen[$g] = $true; $GgList.Add($g) }
        }
        $m = $levelRx.Match($line)
        if (-not $m.Success) { continue }
        if ($frameRx.IsMatch($line)) { continue }
        if ($SkipKubeJsLogger -and $kubejsRx.IsMatch($line)) { continue }
        $norm = $tsRx.Replace($line, '')
        if (Test-Allowed $line $norm) { $r.Allowed++; continue }
        if ($m.Groups[1].Value -eq 'WARN') {
            $r.WarnTotal++
            if ($r.Warns.ContainsKey($norm)) { $r.Warns[$norm]++ } else { $r.Warns[$norm] = 1 }
        } else {
            $key = $norm
            $extra = 0
            for ($j = $i + 1; $j -lt $n -and $extra -lt 3; $j++) {
                $c = $all[$j]
                if ($c.Length -eq 0 -or $c.StartsWith('[') -or $c -match '^\s*at ' -or $c -match '^\s*\.\.\. \d+ more') { break }
                $key += ' // ' + $c.Trim()
                $extra++
            }
            $r.ErrorTotal++
            if ($r.Errors.ContainsKey($key)) { $r.Errors[$key]++ } else { $r.Errors[$key] = 1 }
        }
    }
    return $r
}

# One-line root cause of a crash report (Forge mod-loading failures list each "-- MOD x --" failure message).
function Get-CrashSummary {
    param([string]$File)
    if (([IO.FileInfo]$File).Length -eq 0) { return '(empty report: HeadlessMC kills the game while it is being written; see logs/latest.log)' }
    $lines = [IO.File]::ReadAllLines($File)
    $desc = ''
    $fails = New-Object System.Collections.ArrayList
    for ($i = 0; $i -lt $lines.Length; $i++) {
        $l = $lines[$i]
        if (-not $desc -and $l -match '^Description:\s*(.+)$') { $desc = $Matches[1] }
        if ($l -match '^-- MOD (\S+) --') {
            $mod = $Matches[1]
            $end = [math]::Min($i + 12, $lines.Length)
            for ($j = $i + 1; $j -lt $end; $j++) {
                if ($lines[$j] -match '^\s*Failure message:\s*(.*)$') {
                    $msg = $Matches[1].Trim()
                    $k = $j + 1
                    while ($k -lt $lines.Length -and $lines[$k] -match '^\t\t\S') { $msg += '; ' + $lines[$k].Trim(); $k++ }
                    [void]$fails.Add(("{0}: {1}" -f $mod, $msg))
                    break
                }
            }
        }
    }
    if ($fails.Count -gt 0) { return ($desc + ' -> ' + (($fails | Select-Object -First 6) -join ' | ')) }
    $exc = ''
    foreach ($l in $lines) { if ($l.Trim() -and $l -notmatch '^(\s*at |---- |//|Time:|Description:)') { $exc = $l.Trim(); break } }
    return ($desc + ' -> ' + $exc)
}

$sides = @()
foreach ($s in @('server', 'client')) { if (DExists (J $resDir $s)) { $sides += $s } }

$mainIssues = @{}   # latest.log per side
$kjsIssues = @{}    # logs\kubejs\*.log
$crashes = @()
$hsErr = @()
$ggLines = New-Object 'System.Collections.Generic.List[string]'
$ggSeen = @{}
foreach ($side in $sides) {
    $sd = J $resDir $side
    $latest = J $sd 'logs\latest.log'
    if (FExists $latest) { $mainIssues["$side/latest.log"] = Get-LogIssues $latest $true $ggLines $ggSeen }
    foreach ($kf in (Files (J $sd 'logs\kubejs') '*.log' $false)) {
        $kjsIssues["$side/kubejs/" + [IO.Path]::GetFileName($kf)] = Get-LogIssues $kf $false $ggLines $ggSeen
    }
    foreach ($c in (Files (J $sd 'crash-reports') '*' $false)) {
        $crashes += [pscustomobject]@{ Side = $side; Name = [IO.Path]::GetFileName($c); Info = (Get-CrashSummary $c) }
    }
    foreach ($c in (Files (J $sd 'hs_err') '*' $false)) { $hsErr += ("$side/" + [IO.Path]::GetFileName($c)) }
}

$errTotal = 0; $warnTotal = 0
foreach ($k in $mainIssues.Keys) { $errTotal += $mainIssues[$k].ErrorTotal; $warnTotal += $mainIssues[$k].WarnTotal }
$kjsErrTotal = 0; $kjsWarnTotal = 0
foreach ($k in $kjsIssues.Keys) { $kjsErrTotal += $kjsIssues[$k].ErrorTotal; $kjsWarnTotal += $kjsIssues[$k].WarnTotal }

# GGTEST convention: a marker line with a PASS or FAIL field ("GGTEST|suite|check|FAIL (detail)") is a test result.
$ggPassN = 0; $ggFailLines = New-Object System.Collections.ArrayList
foreach ($g in $ggLines) {
    if ($g -match '(^|\|)(FAIL|ERROR)(\b|$)') { [void]$ggFailLines.Add($g) } elseif ($g -match '(^|\|)PASS(\b|$)') { $ggPassN++ }
}
if ($ggPassN -gt 0 -or $ggFailLines.Count -gt 0) {
    $st = 'PASS'
    $detail = "$ggPassN PASS"
    if ($ggFailLines.Count -gt 0) { $st = 'FAIL'; $detail = "$ggPassN PASS, $($ggFailLines.Count) FAIL: " + (Cut ([string]$ggFailLines[0]) 160) }
    $stage = [pscustomobject]@{ name = 'ggtest-checks'; status = $st; seconds = 0; detail = $detail }
    $di = -1
    for ($i = 0; $i -lt $allStages.Count; $i++) { if ($allStages[$i].name -eq 'download') { $di = $i } }
    if ($di -ge 0) { $allStages.Insert($di, $stage) } else { [void]$allStages.Add($stage) }
}

# ------------------------------------------------------------ verdict
$failedN = 0; $warnedN = 0
foreach ($s in $allStages) { if ($s.status -eq 'FAIL') { $failedN++ } elseif ($s.status -eq 'WARN') { $warnedN++ } }
$verdict = 'PASS'
if ($failedN -gt 0 -or $allStages.Count -eq 0) { $verdict = 'FAIL' }
if ($crashes.Count -gt 0 -or $hsErr.Count -gt 0) { $verdict = 'FAIL' }
$strictReasons = @()
if ($Strict -and $verdict -eq 'PASS') {
    if ($warnedN -gt 0) { $strictReasons += "$warnedN WARN stage(s)" }
    if ($errTotal -gt 0) { $strictReasons += "$errTotal non-allowlisted ERROR line(s)" }
    if ($kjsErrTotal -gt 0) { $strictReasons += "$kjsErrTotal KubeJS error(s)" }
    if ($strictReasons.Count -gt 0) { $verdict = 'FAIL' }
}

function Get-Top($table, [int]$n) {
    $a = New-Object System.Collections.ArrayList
    foreach ($e in $table.GetEnumerator()) { [void]$a.Add([pscustomobject]@{ Key = $e.Key; Value = [int]$e.Value }) }
    return @($a | Sort-Object Value -Descending | Select-Object -First $n)
}

# ------------------------------------------------------------ print
$bar = ('=' * 14)
Emit "$bar GGTEST RESULT: $verdict $bar"
if ($meta) {
    Emit ("suite={0}  pack='{1} {2}'  MC {3}  Forge {4}  run={5}" -f $meta.suite, $meta.pack, $meta.packVersion, $meta.minecraft, $meta.forge, $meta.runId)
} elseif ($req) {
    Emit ("suite={0}  run={1}  (no remote results)" -f $req.suite, $req.runId)
}
if ($req) {
    $fl = @()
    if ($req.flat) { $fl += 'flat world' } else { $fl += 'normal world' }
    $fl += "seed=$($req.seed)"
    $fl += "commands=$(@($req.commands).Count)"
    $fl += "waitForLog=$(@($req.waitForLog).Count)"
    if ($req.suite -ne 'server') { $fl += "client renderer=$($req.clientRenderer)" }
    if ($req.suite -ne 'client' -and $null -ne $req.settleSec) { $fl += "settle=$($req.settleSec)s" }
    if ($req.slots) { $fl += "slots=$($req.slots)" }
    Emit ('options: ' + ($fl -join ', '))
}
Emit "out: $OutDir"
Emit ''
Emit 'STAGES'
foreach ($st in $allStages) {
    $secs = '{0,7:N1}s' -f [double]$st.seconds
    Emit ("  {0,-5} {1,-15} {2} {3}" -f $st.status, $st.name, $secs, (Cut ([string]$st.detail) 260))
}
if ($strictReasons.Count -gt 0) { Emit ("  FAIL  strict          -> " + ($strictReasons -join ', ')) }

if ($ggLines.Count -gt 0) {
    Emit ''
    Emit ("GGTEST lines ({0}: {1} PASS, {2} FAIL)" -f $ggLines.Count, $ggPassN, $ggFailLines.Count)
    $n = 0
    foreach ($g in $ggFailLines) { Emit ('  GGTEST|' + (Cut ([string]$g) 240) + '   <== FAIL') }
    foreach ($g in $ggLines) {
        if ($ggFailLines.Contains($g)) { continue }
        $n++
        if ($n -gt 80) { Emit "  ... ($($ggLines.Count - 80) more in the logs)"; break }
        Emit ('  GGTEST|' + (Cut $g 240))
    }
}

Emit ''
if ($crashes.Count -gt 0 -or $hsErr.Count -gt 0) {
    Emit 'CRASH REPORTS'
    foreach ($c in $crashes) { Emit ("  {0}/{1}: {2}" -f $c.Side, $c.Name, (Cut $c.Info 500)) }
    foreach ($h in $hsErr) { Emit "  JVM crash log: $h" }
} else {
    Emit 'CRASH REPORTS: none'
}

Emit ''
Emit ("KUBEJS: {0} error(s), {1} warning(s) in logs\kubejs\*.log (after allowlist; stack frames not counted)" -f $kjsErrTotal, $kjsWarnTotal)
foreach ($k in ($kjsIssues.Keys | Sort-Object)) {
    $e = $kjsIssues[$k]
    if ($e.ErrorTotal -eq 0) { continue }
    Emit ("  {0}: {1} error(s)" -f $k, $e.ErrorTotal)
    foreach ($t in (Get-Top $e.Errors 8)) { Emit ("    x{0} {1}" -f $t.Value, (Cut $t.Key 220)) }
}

Emit ''
Emit ("ERROR/FATAL lines in latest.log not in allowlist: {0}  (+{1} WARN)   allowlist: {2}" -f $errTotal, $warnTotal, [IO.Path]::GetFileName($AllowlistPath))
$agg = @{}
foreach ($k in $mainIssues.Keys) { foreach ($e in $mainIssues[$k].Errors.GetEnumerator()) { if ($agg.ContainsKey($e.Key)) { $agg[$e.Key] += $e.Value } else { $agg[$e.Key] = $e.Value } } }
foreach ($t in (Get-Top $agg $TopErrors)) { Emit ("  x{0} {1}" -f $t.Value, (Cut $t.Key 380)) }
if ($agg.Count -gt $TopErrors) { Emit ("  ... {0} more distinct ERROR line(s)" -f ($agg.Count - $TopErrors)) }
if ($ShowWarnings) {
    $aggW = @{}
    foreach ($k in $mainIssues.Keys) { foreach ($e in $mainIssues[$k].Warns.GetEnumerator()) { if ($aggW.ContainsKey($e.Key)) { $aggW[$e.Key] += $e.Value } else { $aggW[$e.Key] = $e.Value } } }
    Emit ''
    Emit 'Top WARN lines (latest.log)'
    foreach ($t in (Get-Top $aggW $TopErrors)) { Emit ("  x{0} {1}" -f $t.Value, (Cut $t.Key 220)) }
}

foreach ($side in $sides) {
    $exp = J $resDir "$side\kubejs-exported"
    $ef = @(Files $exp '*' $true)
    if ($ef.Count -gt 0) {
        Emit ''
        Emit ("kubejs/exported ({0}): {1} file(s)" -f $side, $ef.Count)
        $i = 0
        foreach ($f in $ef) {
            $i++
            if ($i -gt 10) { break }
            Emit ("  {0} ({1:N0} bytes)" -f $f.Substring($exp.Length + 1), ([IO.FileInfo]$f).Length)
        }
    }
}

Emit ''
$wall = ''
if ($meta) { $wall = "remote wall {0:N0}s" -f [double]$meta.seconds }
Emit "$bar $verdict  $wall  (details: $resDir) $bar"
Emit "GGTEST-VERDICT|$verdict|$OutDir"

try {
    [IO.File]::WriteAllLines((J $OutDir 'summary.txt'), [string[]]$lines.ToArray(), (New-Object Text.UTF8Encoding($false)))
    $sum = [ordered]@{
        verdict = $verdict; strictReasons = $strictReasons; stages = @($allStages)
        errorLines = $errTotal; warnLines = $warnTotal; kubejsErrors = $kjsErrTotal; kubejsWarnings = $kjsWarnTotal
        crashReports = @($crashes | ForEach-Object { $_.Side + '/' + $_.Name }); hsErr = $hsErr
        ggtestPass = $ggPassN; ggtestFail = @($ggFailLines.ToArray()); ggtest = @($ggLines)
    }
    [IO.File]::WriteAllText((J $OutDir 'summary.json'), (ConvertTo-Json -InputObject $sum -Depth 6), (New-Object Text.UTF8Encoding($false)))
} catch { [Console]::Error.WriteLine("could not write summary files: $($_.Exception.Message)") }

if ($verdict -eq 'PASS') { exit 0 } else { exit 1 }
