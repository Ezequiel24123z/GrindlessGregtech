<#
.SYNOPSIS
  Controller face of the EV Ore Refinery (gtceu:ore_refinery, package MEGA-4): block/multiblock/ore_refinery/overlay_front.png,
  overlay_front_active.png and overlay_front_active_emissive.png. Procedural pixel art, original.
.PARAMETER Credits
  Also print the CREDITS.md "Assets" table rows for the files written.
.EXAMPLE
  powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-MegaOreRefineryTextures.ps1 -Credits
#>
[CmdletBinding()]
param([string]$OutRoot = '', [switch]$Credits)
$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'Pixel.Lib.ps1')
if (-not $OutRoot) { $OutRoot = Join-Path $PSScriptRoot '..\..\pack\kubejs\assets\grindless\textures' }

$dir = Join-Path $OutRoot 'block\multiblock\ore_refinery'
$written = New-Object System.Collections.Generic.List[string]

# A titanium door: an ore hopper on top, a grinding drum with teeth below it and a trough of water at the foot; the drum's teeth,
# the hopper's slot and the water glow amber and blue when it runs.
$pal = New-Palette 'F=B7B3C4 D=4A4658 K=1B1A22 M=8A869B Z=D3D0DE V=3E3B4D H=5D5A6C T=7B5A3A A=F0A53C W=3F7FD0 B=8FC0FF'
foreach ($active in @($false, $true)) {
    $c = New-Canvas
    Write-Map $c 0 0 @(
        '................',
        '.FFFFFFFFFFFFFD.',
        '.FKKKKKKKKKKKKD.',
        '.FKZZZZZZZZZZKD.',
        '.FKMZVVVVVVZMKD.',
        '.FKMMVHHHHVMMKD.',
        '.FKKMMVVVVMMKKD.',
        '.FKMVVVVVVVVMKD.',
        '.FKMVTHTHTHVMKD.',
        '.FKMVHTHTHTVMKD.',
        '.FKMVVVVVVVVMKD.',
        '.FKKKKKKKKKKKKD.',
        '.FKMMMMMMMMMMKD.',
        '.FHHHHHHHHHHHHD.',
        '.DDDDDDDDDDDDDD.',
        '................'
    ) $pal
    $e = New-Canvas
    $name = 'overlay_front'
    if ($active) {
        foreach ($x in 6..9) { Set-Px $c $x 5 $pal['A']; Set-Px $e $x 5 $pal['A'] }
        foreach ($y in @(8, 9)) { foreach ($x in 6..11) { if ((($x + $y) % 2) -eq 0) { Set-Px $c $x $y $pal['A']; Set-Px $e $x $y $pal['A'] } } }
        foreach ($x in 3..12) { Set-Px $c $x 12 $pal['W']; Set-Px $e $x 12 $pal['W'] }
        foreach ($x in @(5, 8, 11)) { Set-Px $c $x 12 $pal['B']; Set-Px $e $x 12 $pal['B'] }
        $name += '_active'
        Save-Png $e (Join-Path $dir ($name + '_emissive.png'))
        $written.Add("block/multiblock/ore_refinery/$($name)_emissive.png")
    }
    Save-Png $c (Join-Path $dir ($name + '.png'))
    $written.Add("block/multiblock/ore_refinery/$name.png")
}
$written | ForEach-Object { Write-Host "wrote $_" }

if ($Credits) {
    foreach ($rel in $written) {
        Write-Output ('| `pack/kubejs/assets/grindless/textures/' + $rel + '` | Generated with tools/assets/Build-MegaOreRefineryTextures.ps1 (procedural pixel art, original) by the MEGA-4 agent, 2026-10-28 | the pack''s licence (pending; proposed CC BY-SA 4.0) |')
    }
}
