<#
.SYNOPSIS
  Static progression validation for Gregtech Grindless: recipe dump on the test server + reachability.

.DESCRIPTION
  1. Uploads pack\ and a minimal overlay (just gg_dump.js) to the home PC with tools\test\Invoke-GGTest.ps1, starts a
     clean server, runs `kubejs custom_command gg_dump`, and retrieves kubejs\exported\*.json.
  2. Runs tools\analysis\reachability.mjs (Node >= 18) on that dump with the tiers\<Tier>.json config.
  3. Prints the report (PASS/FAIL per target and blocking chain) and saves it in out\<date>-<Tier>\.

  Exit code: 0 = PASS, 1 = there's a FAIL/WARN in the analysis, 2 = tool failure (dump, Node, data).

.PARAMETER Tier       Tier name (tiers\<Tier>.json): steam, lv, mv, hv... or next/<tier> for the next version's prepared
                      layer (tiers\next\<tier>.json, not yet active).
.PARAMETER SkipDump   Doesn't start the server: reuses -DumpDir or, if missing, the latest dump (out\latest.txt).
.PARAMETER DumpDir    Folder with recipes.json, tags.json, items.json, machines.json, veins.json, info.json.
.PARAMETER OutDir     Output folder (default tools\analysis\out\<date>-<Tier>).
.PARAMETER NodeExe    Path to node.exe. If missing: $env:GG_NODE, node from PATH (>= 18), tools\analysis\.work\node, and as
                      a last resort, downloads a portable Node LTS (official zip) to tools\analysis\.work\node.
.PARAMETER Pass       both (default: gate, auto, and the era rule), gate (gate only), auto (auto generation only),
                      eras (era rule only: nothing from an era needs a resource from a later era), or obtain
                      (audit of what is never obtained, using tiers\obtain.json if the tier has no "obtain" section;
                      besides the text and JSON it also leaves report-<Tier>.md). With -Tier obtain the step is always obtain.
.PARAMETER Dimension  Dimension where the factory is: all (default: every one in the tier's `contexts`, e.g. Overworld,
                      Flat, and Void), or an id such as grindless:flat. Changes the collector's air and the fluid deposits.
.PARAMETER Explain    Prints the full derivation of targets whose id/name contains this text.
.PARAMETER Detail     Prints the derivation of every target.
.PARAMETER PackDir    Pack to upload (default the repo's; passed through as-is to Invoke-GGTest.ps1).
.PARAMETER DumpTimeoutSec  Deadline for the GGTEST|dump|DONE marker after running the command (default 240).
.PARAMETER LockWaitMin     Minutes to wait for the home PC's lock (only one JVM at a time).

.EXAMPLE
  powershell -NoProfile -ExecutionPolicy Bypass -File tools\analysis\Invoke-Reachability.ps1 -Tier steam
.EXAMPLE
  powershell -NoProfile -ExecutionPolicy Bypass -File tools\analysis\Invoke-Reachability.ps1 -Tier steam -SkipDump -Explain drill
.EXAMPLE
  powershell -NoProfile -ExecutionPolicy Bypass -File tools\analysis\Invoke-Reachability.ps1 -Tier obtain -SkipDump -DumpDir <dump>
#>
param(
    [Parameter(Mandatory = $true)][string]$Tier,
    [switch]$SkipDump,
    [string]$DumpDir,
    [string]$OutDir,
    [string]$NodeExe,
    [ValidateSet('both', 'gate', 'auto', 'eras', 'obtain')][string]$Pass = 'both',
    [string]$Dimension = 'all',
    [string]$Explain,
    [switch]$Detail,
    [string]$PackDir,
    [int]$DumpTimeoutSec = 240,
    [int]$LockWaitMin = 120
)

$ErrorActionPreference = 'Stop'
$Here = Split-Path -Parent $MyInvocation.MyCommand.Path
$Repo = (Resolve-Path (Join-Path $Here '..\..')).Path
$Work = Join-Path $Here '.work'
$OutRoot = Join-Path $Here 'out'
$Analyzer = Join-Path $Here 'reachability.mjs'
$Harness = Join-Path $Repo 'tools\test\Invoke-GGTest.ps1'
$DumpScript = Join-Path $Repo 'tools\test\overlay\kubejs\server_scripts\gg_dump.js'
$MinNodeMajor = 18
# tier name usable in paths: next/hv -> next-hv
$TierName = $Tier -replace '[\\/]', '-'

function Write-Step([string]$msg) { Write-Host ("[reachability] " + $msg) -ForegroundColor Cyan }
function Fail([string]$msg, [int]$code = 2) { Write-Host ("[reachability] ERROR: " + $msg) -ForegroundColor Red; exit $code }

function Get-NodeMajor([string]$exe) {
    try {
        $v = (& $exe --version 2>$null | Select-Object -First 1)
        if ($v -match '^v(\d+)\.') { return [int]$Matches[1] }
    } catch { }
    return 0
}

function Install-PortableNode([string]$dest) {
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    Write-Step 'No Node >= 18 found: downloading a portable Node LTS (official zip from nodejs.org)'
    $index = Invoke-RestMethod -Uri 'https://nodejs.org/dist/index.json'
    $entry = $index | Where-Object { $_.lts -and ($_.files -contains 'win-x64-zip') } | Select-Object -First 1
    if (-not $entry) { Fail 'nodejs.org has no LTS win-x64-zip available' }
    $ver = $entry.version
    $name = "node-$ver-win-x64"
    New-Item -ItemType Directory -Force -Path $Work | Out-Null
    $zip = Join-Path $Work "$name.zip"
    Invoke-WebRequest -Uri "https://nodejs.org/dist/$ver/$name.zip" -OutFile $zip -UseBasicParsing
    $sums = (Invoke-WebRequest -Uri "https://nodejs.org/dist/$ver/SHASUMS256.txt" -UseBasicParsing).Content -split "`n"
    $line = $sums | Where-Object { $_ -match ([regex]::Escape("$name.zip") + '\s*$') } | Select-Object -First 1
    if (-not $line) { Fail "SHASUMS256.txt doesn't list $name.zip" }
    $expected = ($line -split '\s+')[0].ToLower()
    $actual = (Get-FileHash -Algorithm SHA256 -Path $zip).Hash.ToLower()
    if ($expected -ne $actual) { Remove-Item $zip -Force; Fail "$name.zip's SHA256 doesn't match" }
    $tmp = Join-Path $Work 'node-extract'
    if (Test-Path $tmp) { Remove-Item $tmp -Recurse -Force }
    Expand-Archive -Path $zip -DestinationPath $tmp -Force
    if (Test-Path $dest) { Remove-Item $dest -Recurse -Force }
    Move-Item -Path (Join-Path $tmp $name) -Destination $dest
    Remove-Item $tmp -Recurse -Force
    Remove-Item $zip -Force
    return (Join-Path $dest 'node.exe')
}

function Resolve-Node {
    $candidates = @()
    if ($NodeExe) { $candidates += $NodeExe }
    if ($env:GG_NODE) { $candidates += $env:GG_NODE }
    $cmd = Get-Command node.exe -ErrorAction SilentlyContinue
    if ($cmd) { $candidates += $cmd.Source }
    $candidates += (Join-Path $Work 'node\node.exe')
    foreach ($c in $candidates) {
        if ($c -and (Test-Path $c) -and ((Get-NodeMajor $c) -ge $MinNodeMajor)) { return $c }
    }
    if ($NodeExe) { Fail "the Node given in -NodeExe doesn't exist or is older than v$MinNodeMajor" }
    return (Install-PortableNode (Join-Path $Work 'node'))
}

function Test-DumpDir([string]$dir) {
    foreach ($f in 'recipes.json', 'items.json', 'tags.json') {
        if (-not (Test-Path (Join-Path $dir $f))) { return $false }
    }
    return $true
}

function Invoke-Dump([string]$runDir) {
    if (-not (Test-Path $Harness)) { Fail "$Harness doesn't exist" }
    if (-not (Test-Path $DumpScript)) { Fail "$DumpScript doesn't exist" }
    $overlay = Join-Path $Work "overlay-$TierName"
    if (Test-Path $overlay) { Remove-Item $overlay -Recurse -Force }
    New-Item -ItemType Directory -Force -Path (Join-Path $overlay 'kubejs\server_scripts') | Out-Null
    New-Item -ItemType Directory -Force -Path (Join-Path $overlay 'kubejs\exported') | Out-Null
    Copy-Item $DumpScript (Join-Path $overlay 'kubejs\server_scripts\gg_dump.js')
    # kubejs/exported must exist for the test bench to pick up what the dump writes.
    New-Item -ItemType File -Force -Path (Join-Path $overlay 'kubejs\exported\.keep') | Out-Null

    $harnessOut = Join-Path $runDir 'harness'
    $hargs = @(
        '-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', $Harness,
        '-Suite', 'server', '-OverlayDir', $overlay, '-OutDir', $harnessOut,
        '-Commands', 'kubejs custom_command gg_dump',
        '-WaitForLog', ('GGTEST\|dump\|(DONE|FAIL)@@' + $DumpTimeoutSec),
        '-LockWaitMin', $LockWaitMin
    )
    if ($PackDir) { $hargs += @('-PackDir', $PackDir) }
    Write-Step 'Dump: clean server on the home PC (startup + export; 2-5 min, waits if another test is running)'
    # Out-Host: the test bench's output is shown but isn't mixed into this function's return value.
    & powershell.exe @hargs | Out-Host
    $code = $LASTEXITCODE

    $exported = Join-Path $harnessOut 'results\server\kubejs-exported'
    if (-not (Test-DumpDir $exported)) {
        Fail ("the test bench finished with code $code and didn't leave the dump in $exported; check " +
            (Join-Path $harnessOut 'summary.txt'))
    }
    if ($code -ne 0) {
        Write-Host ("[reachability] WARNING: Invoke-GGTest.ps1 exited with code $code, but the dump is complete (see " +
            (Join-Path $harnessOut 'summary.txt') + ')') -ForegroundColor Yellow
    }
    $dest = Join-Path $runDir 'dump'
    if (Test-Path $dest) { Remove-Item $dest -Recurse -Force }
    Copy-Item $exported $dest -Recurse
    return $dest
}

function Remove-OldRuns([int]$keep) {
    if (-not (Test-Path $OutRoot)) { return }
    $old = Get-ChildItem $OutRoot -Directory | Sort-Object Name -Descending | Select-Object -Skip $keep
    foreach ($d in $old) { Remove-Item $d.FullName -Recurse -Force }
}

# --- main (not run when dot-sourced, to use only the functions) ---
if ($MyInvocation.InvocationName -eq '.') { return }

try { [Console]::OutputEncoding = [System.Text.Encoding]::UTF8; $OutputEncoding = [System.Text.Encoding]::UTF8 } catch { }

if (-not (Test-Path $Analyzer)) { Fail "$Analyzer doesn't exist" }
if (-not (Test-Path (Join-Path $Here "tiers\$Tier.json"))) { Fail "tiers\$Tier.json doesn't exist (available tiers: $((Get-ChildItem (Join-Path $Here 'tiers') -Filter *.json).BaseName -join ', '))" }
if (-not $OutDir) { $OutDir = Join-Path $OutRoot ((Get-Date -Format 'yyyyMMdd-HHmmss') + '-' + $TierName) }
New-Item -ItemType Directory -Force -Path $OutDir | Out-Null

$node = Resolve-Node
Write-Step ("Node: $node (" + (& $node --version) + ')')

if ($SkipDump) {
    if (-not $DumpDir) {
        $latest = Join-Path $OutRoot 'latest.txt'
        if (-not (Test-Path $latest)) { Fail 'with -SkipDump, -DumpDir is required (there is no previous dump in out\latest.txt)' }
        $DumpDir = (Get-Content $latest -Raw).Trim()
    }
    if (-not (Test-DumpDir $DumpDir)) { Fail "$DumpDir doesn't contain recipes.json, items.json, and tags.json" }
    Write-Step "Reusing the dump from $DumpDir"
} else {
    $DumpDir = Invoke-Dump $OutDir
    New-Item -ItemType Directory -Force -Path $OutRoot | Out-Null
    Set-Content -Path (Join-Path $OutRoot 'latest.txt') -Value $DumpDir -Encoding UTF8
}

$report = Join-Path $OutDir "report-$TierName.txt"
$aargs = @($Analyzer, '--tier', $Tier, '--dump', $DumpDir, '--pass', $Pass, '--dimension', $Dimension, '--out', $report, '--json', (Join-Path $OutDir "report-$TierName.json"))
if ($Pass -eq 'obtain' -or $Tier -eq 'obtain') { $aargs += @('--md', (Join-Path $OutDir "report-$TierName.md")) }
if ($Explain) { $aargs += @('--explain', $Explain) }
if ($Detail) { $aargs += '--verbose' }
Write-Step "Analysis: $Tier ($Pass)"
& $node @aargs
$code = $LASTEXITCODE
Remove-OldRuns 6
Write-Step ("Report: $report (code ${code}: " + $(if ($code -eq 0) { 'PASS' } elseif ($code -eq 1) { 'FAIL' } else { 'error' }) + ')')
exit $code
