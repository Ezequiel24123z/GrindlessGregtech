<#
.SYNOPSIS
    LuV D2-TAPE: the six stages of the HTS tape between the rolled nickel-tungsten tape and the coated conductor: textured, seeded,
    barrier, buffered, coated and capped. A tape ribbon curls diagonally across the icon; each stage adds a layer colour. Light from the top left.
.EXAMPLE
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-LuVHtsTapeTextures.ps1 -Credits
.PARAMETER OutRoot
    Texture root; defaults to pack/kubejs/assets/grindless/textures.
.PARAMETER Credits
    Print one CREDITS.md row per written file.
#>
[CmdletBinding()]
param(
    [string]$OutRoot = '',
    [switch]$Credits
)
$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'Pixel.Lib.ps1')
$ScriptName = Split-Path -Leaf $PSCommandPath
if (-not $OutRoot) { $OutRoot = Join-Path $PSScriptRoot '..\..\pack\kubejs\assets\grindless\textures' }
$itemDir = Join-Path $OutRoot 'item'
$written = New-Object System.Collections.Generic.List[string]

# K outline, L lit edge, B body, D shaded edge, A layer stripe (the stage's film), S sheen
$ribbonMap = @(
    '..........KKKK..',
    '........KKLLLBK.',
    '.......KLLBBBBDK',
    '......KLBBABBDDK',
    '.....KLBBAABDDK.',
    '....KLBBAABDDK..',
    '...KLBBAABDDK...',
    '..KLBBAABDDK....',
    '.KLBBAABDDK.....',
    'KLBBAABDDK......',
    'KBBAABDDK.......',
    'KBAABDDK........',
    'KAABDDK.........',
    '.KDDK...........',
    '..KK............',
    '................'
)

$stages = [ordered]@{
    # cube-textured Ni-W: a bright metallic grain, no film yet
    'textured_nickel_tungsten_tape' = 'K=262A30 L=E4E8EC B=A8B0B8 D=626C76 A=C9D2DA S=FFFFFF'
    # Y2O3 seed, YSZ barrier, CeO2 cap: three pale ceramic films
    'seeded_tape'                  = 'K=262A30 L=F1EBD5 B=D8CDA6 D=8A8157 A=EFE2B4 S=FFFFFF'
    'barrier_tape'                 = 'K=262A30 L=EDE6CF B=CDBF98 D=7D7552 A=D8C277 S=FFFFFF'
    'buffered_tape'                = 'K=262A30 L=EDE6CF B=C9BF98 D=7D7552 A=E3D18A S=FFFFFF'
    # the cuprate: black-green superconducting film
    'coated_tape'                  = 'K=1B1D20 L=6E8277 B=2F3B36 D=171D1A 
A=4C6A5C S=C7E0D2'
    # silver cap: a bright mirror layer
    'capped_tape'                  = 'K=262A30 L=FFFFFF B=D3D9DF D=858E98 A=F2F5F8 S=FFFFFF'
}
foreach ($name in $stages.Keys) {
    $pal = New-Palette ($stages[$name] -replace '\s+', ' ')
    $c = New-Canvas
    Write-Map $c 0 0 $ribbonMap $pal
    Set-Px $c 11 2 $pal['S']
    Save-Png $c (Join-Path $itemDir ($name + '.png'))
    $written.Add('item/' + $name + '.png')
}

Write-Host "written $($written.Count) files under $OutRoot"
foreach ($rel in $written) { Write-Host "  $rel" }

if ($Credits) {
    Write-Host ''
    foreach ($rel in $written) {
        Write-Host ("| ``pack/kubejs/assets/grindless/textures/$rel`` | Generated with tools/assets/$ScriptName (procedural pixel art, original) by the d2-tape agent, 2026-11-03 | the pack's licence (MIT) |")
    }
}
