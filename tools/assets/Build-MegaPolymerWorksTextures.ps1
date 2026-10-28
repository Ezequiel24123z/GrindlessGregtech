<#
.SYNOPSIS
  Controller face of the MV Polymer Works (gtceu:polymer_works, package MEGA-2): block/multiblock/polymer_works/overlay_front.png,
  overlay_front_active.png and overlay_front_active_emissive.png. Procedural pixel art, original.
.PARAMETER Credits
  Also print the CREDITS.md "Assets" table rows for the files written.
.EXAMPLE
  powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-MegaPolymerWorksTextures.ps1 -Credits
#>
[CmdletBinding()]
param([string]$OutRoot = '', [switch]$Credits)
$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'Pixel.Lib.ps1')
if (-not $OutRoot) { $OutRoot = Join-Path $PSScriptRoot '..\..\pack\kubejs\assets\grindless\textures' }

$dir = Join-Path $OutRoot 'block\multiblock\polymer_works'
$written = New-Object System.Collections.Generic.List[string]

# A steel door with a glass reactor window and a flat sheet slot below; the window's liquid and the slot glow pale teal when it runs.
$pal = New-Palette 'F=B9C3CE D=474D57 K=181A1E M=8D97A3 Z=D6DEE8 V=3F4A5A C=3F9C8E P=9FE3D4 H=5E6670'
foreach ($active in @($false, $true)) {
    $c = New-Canvas
    Write-Map $c 0 0 @(
        '................',
        '.FFFFFFFFFFFFFD.',
        '.FKKKKKKKKKKKKD.',
        '.FKZZZZZZZZZZKD.',
        '.FKMVVVVVVVVMKD.',
        '.FKMVHHHHHHVMKD.',
        '.FKMVHHHHHHVMKD.',
        '.FKMVHHHHHHVMKD.',
        '.FKMVHCCCCHVMKD.',
        '.FKMVHCCCCHVMKD.',
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
        foreach ($y in @(5, 6, 7)) { for ($x = 6; $x -le 9; $x++) { Set-Px $c $x $y $pal['P']; Set-Px $e $x $y $pal['P'] } }
        foreach ($x in 4..11) { Set-Px $c $x 12 $pal['C']; Set-Px $e $x 12 $pal['C'] }
        $name += '_active'
        Save-Png $e (Join-Path $dir ($name + '_emissive.png'))
        $written.Add("block/multiblock/polymer_works/$($name)_emissive.png")
    }
    Save-Png $c (Join-Path $dir ($name + '.png'))
    $written.Add("block/multiblock/polymer_works/$name.png")
}
$written | ForEach-Object { Write-Host "wrote $_" }

if ($Credits) {
    foreach ($rel in $written) {
        Write-Output ('| `pack/kubejs/assets/grindless/textures/' + $rel + '` | Generated with tools/assets/Build-MegaPolymerWorksTextures.ps1 (procedural pixel art, original) by the MEGA-2 agent, 2026-10-28 | the pack''s licence (pending; proposed CC BY-SA 4.0) |')
    }
}
