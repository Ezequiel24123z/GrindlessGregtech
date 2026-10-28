<#
.SYNOPSIS
  Controller face of the IV Smelting Complex (gtceu:smelting_complex, package MEGA-5): block/multiblock/smelting_complex/overlay_front.png,
  overlay_front_active.png and overlay_front_active_emissive.png. Procedural pixel art, original.
.PARAMETER Credits
  Also print the CREDITS.md "Assets" table rows for the files written.
.EXAMPLE
  powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-MegaSmeltingComplexTextures.ps1 -Credits
#>
[CmdletBinding()]
param([string]$OutRoot = '', [switch]$Credits)
$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'Pixel.Lib.ps1')
if (-not $OutRoot) { $OutRoot = Join-Path $PSScriptRoot '..\..\pack\kubejs\assets\grindless\textures' }

$dir = Join-Path $OutRoot 'block\multiblock\smelting_complex'
$written = New-Object System.Collections.Generic.List[string]

# A furnace mouth (hot half, glowing orange when running) over a frost vent (cold half, glowing blue), joined by a steel bridge.
$pal = New-Palette 'F=B7B3C4 D=4A4658 K=1B1A22 M=8A869B Z=D3D0DE V=3E3B4D H=5D5A6C R=7A3A2A A=F0A53C W=3F7FD0 B=8FC0FF'
foreach ($active in @($false, $true)) {
    $c = New-Canvas
    Write-Map $c 0 0 @(
        '................',
        '.FFFFFFFFFFFFFD.',
        '.FKKKKKKKKKKKKD.',
        '.FKRRRRRRRRRRKD.',
        '.FKRVVVVVVVVRKD.',
        '.FKRVKKKKKKVRKD.',
        '.FKRVKKKKKKVRKD.',
        '.FKRRRRRRRRRRKD.',
        '.FKMMMMMMMMMMKD.',
        '.FKZZZZZZZZZZKD.',
        '.FKZVVVVVVVVZKD.',
        '.FKZVHVHVHVHZKD.',
        '.FKZZZZZZZZZZKD.',
        '.FHHHHHHHHHHHHD.',
        '.DDDDDDDDDDDDDD.',
        '................'
    ) $pal
    $e = New-Canvas
    $name = 'overlay_front'
    if ($active) {
        foreach ($y in @(5, 6)) { foreach ($x in 6..11) { Set-Px $c $x $y $pal['A']; Set-Px $e $x $y $pal['A'] } }
        foreach ($x in @(6, 8, 10, 12)) { Set-Px $c $x 11 $pal['B']; Set-Px $e $x 11 $pal['B'] }
        foreach ($x in @(5, 7, 9, 11)) { Set-Px $c $x 11 $pal['W']; Set-Px $e $x 11 $pal['W'] }
        $name += '_active'
        Save-Png $e (Join-Path $dir ($name + '_emissive.png'))
        $written.Add("block/multiblock/smelting_complex/$($name)_emissive.png")
    }
    Save-Png $c (Join-Path $dir ($name + '.png'))
    $written.Add("block/multiblock/smelting_complex/$name.png")
}
$written | ForEach-Object { Write-Host "wrote $_" }

if ($Credits) {
    foreach ($rel in $written) {
        Write-Output ('| `pack/kubejs/assets/grindless/textures/' + $rel + '` | Generated with tools/assets/Build-MegaSmeltingComplexTextures.ps1 (procedural pixel art, original) by the MEGA-5 agent, 2026-10-28 | the pack''s licence (pending; proposed CC BY-SA 4.0) |')
    }
}
