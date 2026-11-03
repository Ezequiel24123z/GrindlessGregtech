<#
.SYNOPSIS
  Procedural 16x16 pixel art for the two items of the D4-UIV-MAINFRAME package (compute module and comb-fed tensor core) of Gregtech Grindless.

.DESCRIPTION
  Every pixel is drawn by the shared era library (tools/assets/Era.Lib.ps1); nothing is copied or edited from GregTech Modern or any
  other mod. Output is deterministic. Same method as Build-UIVMainframeTextures.ps1.

  Writes (under pack/kubejs/assets/grindless/textures/): item/<name>.png for each item in $items below.

  Run from the repo root:
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-UIVMainframeModuleTextures.ps1

.PARAMETER OutRoot
  Textures root. Default: <repo>/pack/kubejs/assets/grindless/textures
.PARAMETER Credits
  Also print the CREDITS.md "Assets" table rows for the files written.
#>
[CmdletBinding()]
param(
    [string]$OutRoot = '',
    [switch]$Credits
)
$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'Pixel.Lib.ps1')
$EraName = 'uiv'; . (Join-Path $PSScriptRoot 'Era.Lib.ps1')

$RepoRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..'))
if (-not $OutRoot) { $OutRoot = Join-Path $RepoRoot 'pack\kubejs\assets\grindless\textures' }
$OutRoot = [System.IO.Path]::GetFullPath($OutRoot)
$ScriptName = Split-Path -Leaf $PSCommandPath

$written = New-Object System.Collections.Generic.List[string]
$items = @(
    @('photonic_compute_module', 'wafer', 'A8B8E8'),
    @('comb_fed_tensor_core', 'disk', '60C8E0')
)
foreach ($it in $items) {
    $c = New-EraLegacyItem $EraName $it[0] $it[1] $it[2]
    if (-not $c) { throw "$($it[0]): no era body for kind $($it[1])" }
    $rel = "item/$($it[0]).png"
    Save-Png $c (Join-Path $OutRoot ($rel -replace '/', '\'))
    $written.Add($rel)
}

$problems = New-Object System.Collections.Generic.List[string]
foreach ($it in $items) {
    $p = Read-Png (Join-Path $OutRoot ("item\$($it[0]).png"))
    $opaque = 0
    for ($i = 0; $i -lt $p.P.Length; $i++) {
        $v = $p.P[$i]; $a = ($v -shr 24) -band 255
        if ($a -ne 0 -and $a -ne 255) { $problems.Add("item/$($it[0]): partial alpha at $i") }
        if ($a -eq 255) { $opaque++; if (($v -band 0xFFFFFF) -eq 0) { $problems.Add("item/$($it[0]): pure black at $i") } }
    }
    if ($opaque -lt 40) { $problems.Add("item/$($it[0]): only $opaque opaque pixels") }
}
if ($problems.Count -gt 0) { $problems | Select-Object -First 20 | ForEach-Object { Write-Error $_ -ErrorAction Continue }; exit 1 }

Write-Host "$ScriptName wrote $($written.Count) files"
if ($Credits) {
    foreach ($w in $written) { Write-Host "| pack/kubejs/assets/grindless/textures/$w | drawn procedurally by tools/assets/$ScriptName | ours |" }
}
