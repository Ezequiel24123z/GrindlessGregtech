<#
.SYNOPSIS
  Controller face of the HV Coil Chemical Plant (gtceu:coil_chemical_plant, package MEGA-3): block/multiblock/coil_chemical_plant/overlay_front.png,
  overlay_front_active.png and overlay_front_active_emissive.png. Procedural pixel art, original.
.PARAMETER Credits
  Also print the CREDITS.md "Assets" table rows for the files written.
.EXAMPLE
  powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-MegaCoilChemicalPlantTextures.ps1 -Credits
#>
[CmdletBinding()]
param([string]$OutRoot = '', [switch]$Credits)
$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'Pixel.Lib.ps1')
if (-not $OutRoot) { $OutRoot = Join-Path $PSScriptRoot '..\..\pack\kubejs\assets\grindless\textures' }

$dir = Join-Path $OutRoot 'block\multiblock\coil_chemical_plant'
$written = New-Object System.Collections.Generic.List[string]

# A white PTFE door with a window onto a coil ring around a reactor vessel; the coil turns and a status lamp glow orange when it runs.
$pal = New-Palette 'F=E8ECEF D=8A9299 K=1E2226 M=B4BBC2 Z=F7F9FA V=3A4652 C=C8703A P=F2B27A H=5A6670 G=6FA8A0'
foreach ($active in @($false, $true)) {
    $c = New-Canvas
    Write-Map $c 0 0 @(
        '................',
        '.FFFFFFFFFFFFFD.',
        '.FKKKKKKKKKKKKD.',
        '.FKZZZZZZZZZZKD.',
        '.FKMVVVVVVVVMKD.',
        '.FKMCCCCCCCCMKD.',
        '.FKMVHGGGGHVMKD.',
        '.FKMCHGGGGHCMKD.',
        '.FKMVHGGGGHVMKD.',
        '.FKMCCCCCCCCMKD.',
        '.FKMVVVVVVVVMKD.',
        '.FKKKKKKKKKKKKD.',
        '.FKMMMKKKKMMMKD.',
        '.FHHHHHHHHHHHHD.',
        '.DDDDDDDDDDDDDD.',
        '................'
    ) $pal
    $e = New-Canvas
    $name = 'overlay_front'
    if ($active) {
        foreach ($y in @(5, 9)) { for ($x = 4; $x -le 11; $x++) { Set-Px $c $x $y $pal['P']; Set-Px $e $x $y $pal['P'] } }
        foreach ($x in 6..9) { Set-Px $c $x 12 $pal['C']; Set-Px $e $x 12 $pal['C'] }
        $name += '_active'
        Save-Png $e (Join-Path $dir ($name + '_emissive.png'))
        $written.Add("block/multiblock/coil_chemical_plant/$($name)_emissive.png")
    }
    Save-Png $c (Join-Path $dir ($name + '.png'))
    $written.Add("block/multiblock/coil_chemical_plant/$name.png")
}
$written | ForEach-Object { Write-Host "wrote $_" }

if ($Credits) {
    foreach ($rel in $written) {
        Write-Output ('| `pack/kubejs/assets/grindless/textures/' + $rel + '` | Generated with tools/assets/Build-MegaCoilChemicalPlantTextures.ps1 (procedural pixel art, original) by the MEGA-3 agent, 2026-10-28 | the pack''s licence (pending; proposed CC BY-SA 4.0) |')
    }
}
