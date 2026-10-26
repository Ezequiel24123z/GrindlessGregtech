<#
.SYNOPSIS
Records one work package's cost and outcome as a CSV row outside the repository.

.DESCRIPTION
Reads the package's sessions from the local Copilot session store (read-only, tools\metrics\measure.mjs), counts the package's
commits and changed files between -Base and -Head, and appends one row to -Csv. Prints that row's summary in one line.
Primary metrics derived from the CSV: AIU per accepted package, tokens per package, rejection rate, repeated context
(cache_read / input), native runs without a named doubt, integration conflicts per batch.

.PARAMETER Package    Work package id (e.g. ZPM-B1).
.PARAMETER Session    Copilot session ids of the package (orchestrator turns for it, the worker, its subagents share the id).
.PARAMETER Base       Commit the package branched from. -Head defaults to HEAD.
.PARAMETER Outcome    accepted | rejected | escalated.
.PARAMETER Repairs    Repair attempts used (0-2).
.PARAMETER Tests      Tests run, e.g. "T0x3;T1:gg_test_x".
.PARAMETER NativeRunsWithoutDoubt  Native runs that had no stated doubt (should be 0).
.PARAMETER Conflicts  Merge conflicts this package caused at integration.
.PARAMETER ManualFix  Set when a human or another agent had to correct the result.
.PARAMETER Store      Session store. Default: $env:USERPROFILE\.copilot\session-store.db.
.PARAMETER Csv        Default: $env:LOCALAPPDATA\GrindlessMetrics\packages.csv (never inside the repo).

.EXAMPLE
powershell -NoProfile -ExecutionPolicy Bypass -File tools\metrics\Measure-Package.ps1 -Package ZPM-B1 -Session 1234abcd -Base 15a7f85 -Outcome accepted -Repairs 0 -Tests 'T0x2'
#>
param(
    [Parameter(Mandatory = $true)][string]$Package,
    [Parameter(Mandatory = $true)][string[]]$Session,
    [Parameter(Mandatory = $true)][string]$Base,
    [string]$Head = 'HEAD',
    [Parameter(Mandatory = $true)][ValidateSet('accepted', 'rejected', 'escalated')][string]$Outcome,
    [ValidateRange(0, 2)][int]$Repairs = 0,
    [string]$Tests = '',
    [int]$NativeRunsWithoutDoubt = 0,
    [int]$Conflicts = 0,
    [switch]$ManualFix,
    [string]$Store = (Join-Path $env:USERPROFILE '.copilot\session-store.db'),
    [string]$Csv = (Join-Path $env:LOCALAPPDATA 'GrindlessMetrics\packages.csv'),
    [string]$NodeExe
)
$ErrorActionPreference = 'Stop'
$repo = Split-Path -Parent (Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path))

$node = @($NodeExe, $env:GG_NODE, (Get-Command node.exe -ErrorAction SilentlyContinue | ForEach-Object Source), (Join-Path $repo 'tools\analysis\.work\node\node.exe')) |
    Where-Object { $_ -and (Test-Path $_) } | Select-Object -First 1
if (-not $node) { throw 'node.exe (>= 22.13) not found: pass -NodeExe or set GG_NODE' }
if (-not (Test-Path $Store)) { throw "session store not found: $Store" }

$json = & $node --no-warnings (Join-Path $repo 'tools\metrics\measure.mjs') --db $Store --sessions ($Session -join ',')
if ($LASTEXITCODE -ne 0) { throw "measure.mjs failed: $json" }
$m = $json | ConvertFrom-Json
$t = $m.total

$commits = [int](git -C $repo rev-list --count "$Base..$Head")
$files = @(git -C $repo diff --name-only "$Base...$Head").Count

$inv = [Globalization.CultureInfo]::InvariantCulture
$row = [pscustomobject]@{
    date = (Get-Date).ToString('s'); package = $Package; outcome = $Outcome; sessions = ($Session -join ' ')
    models = ($m.models -join ' '); api_calls = $t.calls; subagent_calls = $t.subagentCalls
    input_tokens = $t.input; cache_read_tokens = $t.cacheRead; output_tokens = $t.output; max_context = $t.maxInput
    aiu = ([double]$t.aiu).ToString($inv); model_minutes = ([math]::Round($t.ms / 60000, 1)).ToString($inv)
    commits = $commits; files_changed = $files; tests = $Tests; repairs = $Repairs
    native_runs_without_doubt = $NativeRunsWithoutDoubt; conflicts = $Conflicts; manual_fix = [bool]$ManualFix
}
New-Item -ItemType Directory -Force (Split-Path -Parent $Csv) | Out-Null
$row | Export-Csv -Path $Csv -Append -NoTypeInformation -Encoding UTF8
if ($t.calls -eq 0) { Write-Output "warning: no usage rows for these sessions in $Store" }
Write-Output ("{0} {1}: {2} AIU, {3} calls, max context {4}, {5} commits, {6} files -> {7}" -f $Package, $Outcome, $t.aiu, $t.calls, $t.maxInput, $commits, $files, $Csv)
