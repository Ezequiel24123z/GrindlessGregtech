<#
.SYNOPSIS
T0: the local, deterministic precheck. No Minecraft, no SSH, no network. Run it before every commit of a package.

.DESCRIPTION
Runs, in this order (each one's full output goes to -OutDir\<check>.log, ignored by git):
  static    tools\analysis\check-static.mjs: every KubeJS script loads and runs its callbacks in Node (syntax errors included),
            en_us -> es_es lang parity, and every registered machine, recipe type and grindless: item has both names.
  quests    tools\quests\lint.mjs on the whole book (errors fail; warnings are counted).
  zones     tools\test\Get-GGTestZone.ps1 -Validate (no overlapping test bands, listed tests exist).
  order     tools\analysis\script-order.mjs --check: every script's `// priority:` header follows the deterministic load order (unstamped = notice).
  tooltips  tools\analysis\tooltip-lint.mjs: every multiblock controller's tooltips (count, length, es_es parity) against tooltip_lint.json.
  analysis  tools\analysis\test\run.mjs, the Node suite (about 70 s; the slowest check).
Prints one line per check and at most 30 lines in total. Exit 0 = PASS, 1 = a check failed, 2 = tool failure (no Node).

.PARAMETER Skip     Checks to leave out, e.g. -Skip analysis for a quick loop (the package's final T0 runs all of them).
.PARAMETER NodeExe  node (>= 18). Default: $env:GG_NODE, node on PATH, tools\analysis\.work\node\node.exe. Never downloads.
.PARAMETER OutDir   Full logs. Default: tools\.check-fast (ignored by git).

.EXAMPLE
powershell -NoProfile -ExecutionPolicy Bypass -File tools\Check-Fast.ps1
.EXAMPLE
pwsh tools/Check-Fast.ps1      # Linux, macOS and the GitHub Actions T0 job (.github/workflows/t0.yml)
#>
param(
    [string[]]$Skip = @(),
    [string]$NodeExe,
    [string]$OutDir
)
$ErrorActionPreference = 'Stop'
$Checks = @('static', 'quests', 'zones', 'order', 'tooltips', 'analysis')
# -File passes "-Skip a,b" as one string: split it, and treat an unknown name as a usage error (2), not a failed check (1).
$Skip = @($Skip | ForEach-Object { $_ -split ',' } | ForEach-Object { $_.Trim() } | Where-Object { $_ })
$unknown = @($Skip | Where-Object { $Checks -notcontains $_ })
if ($unknown.Count) { Write-Output "T0 TOOL FAILURE: unknown check(s) in -Skip: $($unknown -join ', ') (known: $($Checks -join ', '))"; exit 2 }
$repo = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
if (-not $OutDir) { $OutDir = Join-Path $repo 'tools/.check-fast' }
New-Item -ItemType Directory -Force $OutDir | Out-Null
$MaxLines = 30

function Find-Node {
    $candidates = @()
    if ($NodeExe) { $candidates += $NodeExe }
    if ($env:GG_NODE) { $candidates += $env:GG_NODE }
    foreach ($n in @('node.exe', 'node')) { $cmd = Get-Command $n -CommandType Application -ErrorAction SilentlyContinue | Select-Object -First 1; if ($cmd) { $candidates += $cmd.Source } }
    $candidates += (Join-Path $repo 'tools/analysis/.work/node/node.exe')
    foreach ($c in $candidates) { if ($c -and (Test-Path $c)) { return $c } }
    return $null
}

$node = Find-Node
if (-not $node) { Write-Output 'T0 TOOL FAILURE: node not found (pass -NodeExe or set GG_NODE)'; exit 2 }

# Each check: a command and a function that turns its output into (info, detail lines).
function Invoke-Check([string]$name, [scriptblock]$cmd) {
    $log = Join-Path $OutDir "$name.log"
    $sw = [Diagnostics.Stopwatch]::StartNew()
    $prev = $ErrorActionPreference; $ErrorActionPreference = 'Continue'
    try {
        $out = @(& $cmd 2>&1 | ForEach-Object { "$_" })
        $code = $LASTEXITCODE
    }
    catch {
        # a script-terminating error in the check itself (e.g. malformed zones.json) is a tool failure, reported like any other
        $out = @("tool failure: $($_.Exception.Message -replace '\s+', ' ')")
        $code = 2
    }
    $ErrorActionPreference = $prev
    $out | Set-Content -Path $log -Encoding UTF8
    return [pscustomobject]@{ Name = $name; Code = $code; Out = $out; Secs = [int]$sw.Elapsed.TotalSeconds; Log = $log }
}

$results = @()
$total = [Diagnostics.Stopwatch]::StartNew()
Push-Location $repo
try {
    if ($Skip -notcontains 'static') {
        $r = Invoke-Check 'static' { & $node 'tools/analysis/check-static.mjs' }
        $r | Add-Member Info (($r.Out | Where-Object { $_ -match '^(ok|FAIL) ' }) -replace '^(ok|FAIL)\s+', '' -join '; ')
        $r | Add-Member Detail @($r.Out | Where-Object { $_ -match '^(FAIL |     )' })
        $results += $r
    }
    if ($Skip -notcontains 'quests') {
        $r = Invoke-Check 'quests' { & $node 'tools/quests/lint.mjs' }
        $r | Add-Member Info (@($r.Out | Where-Object { $_ -match '^total:' }) -join '' -replace '^total:\s*', '')
        $r | Add-Member Detail @($r.Out | Where-Object { $_ -match '^\s+ERROR|^lint failed' })
        $results += $r
    }
    if ($Skip -notcontains 'zones') {
        $r = Invoke-Check 'zones' { & (Join-Path $repo 'tools/test/Get-GGTestZone.ps1') -Validate }
        $r | Add-Member Info ($(if ($r.Code -eq 0) { $r.Out -join '' } else { "$($r.Out.Count) problems" }))
        $r | Add-Member Detail @($(if ($r.Code -ne 0) { $r.Out }))
        $results += $r
    }
    if ($Skip -notcontains 'order') {
        $r = Invoke-Check 'order' { & $node 'tools/analysis/script-order.mjs' '--check' }
        $r | Add-Member Info (($r.Out | Where-Object { $_ -match '^(ok script-order|NOTICE)' }) -replace '^ok script-order:\s*', '' -join '; ')
        $r | Add-Member Detail @($r.Out | Where-Object { $_ -match '^FAIL ' })
        $results += $r
    }
    if ($Skip -notcontains 'tooltips') {
        $r = Invoke-Check 'tooltips' { & $node 'tools/analysis/tooltip-lint.mjs' }
        $r | Add-Member Info (($r.Out | Where-Object { $_ -match '^(ok|FAIL) ' }) -replace '^(ok|FAIL)\s+tooltips:\s*', '' -join '; ')
        $r | Add-Member Detail @($r.Out | Where-Object { $_ -match '^\s+(NEW|STALE) ' })
        $results += $r
    }
    if ($Skip -notcontains 'analysis') {
        $r = Invoke-Check 'analysis' { & $node 'tools/analysis/test/run.mjs' '--test-reporter=tap' }
        $count = { param($k) (@($r.Out | Where-Object { $_ -match "^# $k \d+" }) -join '' -replace "^# $k ", '') }
        $r | Add-Member Info ("$(& $count 'pass') pass, $(& $count 'fail') fail, $(& $count 'skipped') skipped")
        $r | Add-Member Detail @($r.Out | Where-Object { $_ -match '^\s*not ok ' } | ForEach-Object { $_.Trim() })
        $results += $r
    }
}
finally { Pop-Location }

$failed = @($results | Where-Object { $_.Code -ne 0 })
$lines = New-Object System.Collections.Generic.List[string]
foreach ($r in $results) { $lines.Add(('{0,-4} {1,-8} {2,3}s  {3}' -f $(if ($r.Code -eq 0) { 'ok' } else { 'FAIL' }), $r.Name, $r.Secs, $r.Info)) }
if ($Skip.Count) { $lines.Add("skipped: $($Skip -join ', ')") }
if ($failed.Count -eq 0) {
    $lines.Add("T0 PASS in $([int]$total.Elapsed.TotalSeconds)s")
    $lines | ForEach-Object { Write-Output $_ }
    exit 0
}
$room = $MaxLines - $lines.Count - 1
foreach ($r in $failed) {
    $detail = @($r.Detail | Where-Object { $_ })
    if ($detail.Count -eq 0) { $detail = @($r.Out | Select-Object -Last 3) }
    foreach ($d in $detail) {
        if ($room -le 1) { break }
        $text = "$($r.Name): $($d.Trim())"
        if ($text.Length -gt 200) { $text = $text.Substring(0, 197) + '...' }
        $lines.Add($text); $room--
    }
}
$lines.Add("T0 FAIL ($($failed.Name -join ', ')): full logs in $OutDir")
$lines | Select-Object -First $MaxLines | ForEach-Object { Write-Output $_ }
if (@($failed | Where-Object { $_.Code -eq 2 }).Count) { exit 2 }
exit 1
