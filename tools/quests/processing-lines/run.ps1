<#
.SYNOPSIS
  Regenerates the Processing Lines charts and the Power tab, and checks them (docs/quests.md, sections 17 and 18).

.DESCRIPTION
  1. pl-gen.mjs: the chapters, the group line and the linter's roots (a dry run without -Write: counts and layout only).
  2. With -Dump: pl-check.mjs checks every arrow, and every number of the Power tab, against that recipe dump.
  3. With -Write: the linter on the charts (item ids and tags against the dump, if given) and on the whole book.
  4. With -Write and -Preview: one PNG per chart (Render-QuestPreview.ps1).
  Reports and previews go to -OutDir (default: out\ next to this script, ignored by git).

.PARAMETER Dump     The kubejs-exported folder of a gg_dump run (test-runs\<run>\results\server\kubejs-exported).
.PARAMETER NodeExe  node.exe. Default: $env:GG_NODE, node on PATH, tools\analysis\.work\node\node.exe.

.EXAMPLE
  powershell -NoProfile -ExecutionPolicy Bypass -File tools\quests\processing-lines\run.ps1 -Dump <kubejs-exported> -Write -Preview
#>
param(
    [string]$Dump,
    [switch]$Write,
    [switch]$Preview,
    [string]$OutDir,
    [string]$NodeExe
)
$ErrorActionPreference = 'Stop'
$here = $PSScriptRoot
$repo = (Resolve-Path (Join-Path $here '..\..\..')).Path
if (-not $OutDir) { $OutDir = Join-Path $here 'out' }

function Find-Node {
    $candidates = @()
    if ($NodeExe) { $candidates += $NodeExe }
    if ($env:GG_NODE) { $candidates += $env:GG_NODE }
    $cmd = Get-Command node.exe -ErrorAction SilentlyContinue
    if ($cmd) { $candidates += $cmd.Source }
    $candidates += (Join-Path $repo 'tools\analysis\.work\node\node.exe')
    foreach ($c in $candidates) { if ($c -and (Test-Path $c)) { return $c } }
    throw 'node.exe not found: pass -NodeExe or set GG_NODE'
}
$node = Find-Node
$failed = 0

$gen = @((Join-Path $here 'pl-gen.mjs'))
if (-not $Write) { $gen += '--dry' }
& $node @gen
if ($LASTEXITCODE -ne 0) { $failed++ }

if ($Dump) {
    $Dump = (Resolve-Path $Dump).Path
    [void](New-Item -ItemType Directory -Force $OutDir)
    & $node (Join-Path $here 'pl-check.mjs') --dump $Dump --out (Join-Path $OutDir 'check-report.md')
    if ($LASTEXITCODE -ne 0) { $failed++ }
}

if ($Write) {
    $book = Join-Path $repo 'pack\config\ftbquests\quests\chapters'
    $charts = ((Get-ChildItem $book -Filter 'pl_*.snbt' | ForEach-Object { $_.BaseName }) + @('power')) -join ','
    Push-Location $repo
    try {
        $lint = @('tools\quests\lint.mjs', '--chapter', $charts)
        if ($Dump) { $lint += @('--items', (Join-Path $Dump 'items.json'), '--tags', (Join-Path $Dump 'tags.json')) }
        & $node @lint
        if ($LASTEXITCODE -ne 0) { $failed++ }
        & $node tools\quests\lint.mjs --quiet
        if ($LASTEXITCODE -ne 0) { $failed++ }
        if ($Preview) {
            & powershell -NoProfile -ExecutionPolicy Bypass -File tools\quests\Render-QuestPreview.ps1 -Chapter $charts -OutDir (Join-Path $OutDir 'preview') -NodeExe $node
            if ($LASTEXITCODE -ne 0) { $failed++ }
        }
    } finally {
        Pop-Location
    }
}
exit $(if ($failed) { 1 } else { 0 })
