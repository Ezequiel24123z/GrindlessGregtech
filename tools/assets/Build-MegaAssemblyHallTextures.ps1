<#
.SYNOPSIS
  Controller face of the ZPM Assembly Hall (gtceu:assembly_hall, package MEGA-7): block/multiblock/assembly_hall/overlay_front.png,
  overlay_front_active.png and overlay_front_active_emissive.png. Procedural pixel art, original.
.PARAMETER Credits
  Also print the CREDITS.md "Assets" table rows for the files written.
.EXAMPLE
  powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-MegaAssemblyHallTextures.ps1 -Credits
#>
[CmdletBinding()]
param([string]$OutRoot = '', [switch]$Credits)
$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'Pixel.Lib.ps1')
if (-not $OutRoot) { $OutRoot = Join-Path $PSScriptRoot '..\..\pack\kubejs\assets\grindless\textures' }

$dir = Join-Path $OutRoot 'block\multiblock\assembly_hall'
$written = New-Object System.Collections.Generic.List[string]

# A steel door with a conveyor slot and a robot arm over it; the arm joint and the belt lights glow magenta when it runs.
$pal = New-Palette 'F=B9C3CE D=474D57 K=181A1E M=8D97A3 Z=D6DEE8 V=3F4A5A C=B04CC8 P=E6A0F2 H=5E6670'
foreach ($active in @($false, $true)) {
    $c = New-Canvas
    Write-Map $c 0 0 @(
        '................',
        '.FFFFFFFFFFFFFD.',
        '.FKKKKKKKKKKKKD.',
        '.FKZZZZZZZZZZKD.',
        '.FKMVVVVVVVVMKD.',
        '.FKMVHHHMHHVMKD.',
        '.FKMVHHHMHHVMKD.',
        '.FKMVHMMMHHVMKD.',
        '.FKMVHCHHHHVMKD.',
        '.FKMVHHHHHHVMKD.',
        '.FKMVVVVVVVVMKD.',
        '.FKKKKKKKKKKKKD.',
        '.FKMHCHCHCHMKKD.',
        '.FHHHHHHHHHHHHD.',
        '.DDDDDDDDDDDDDD.',
        '................'
    ) $pal
    $e = New-Canvas
    $name = 'overlay_front'
    if ($active) {
        Set-Px $c 6 8 $pal['P']; Set-Px $e 6 8 $pal['P']
        foreach ($x in @(6, 8, 10)) { Set-Px $c $x 12 $pal['P']; Set-Px $e $x 12 $pal['P'] }
        $name += '_active'
        Save-Png $e (Join-Path $dir ($name + '_emissive.png'))
        $written.Add("block/multiblock/assembly_hall/$($name)_emissive.png")
    }
    Save-Png $c (Join-Path $dir ($name + '.png'))
    $written.Add("block/multiblock/assembly_hall/$name.png")
}
$written | ForEach-Object { Write-Host "wrote $_" }

if ($Credits) {
    foreach ($rel in $written) {
        Write-Output ('| `pack/kubejs/assets/grindless/textures/' + $rel + '` | Generated with tools/assets/Build-MegaAssemblyHallTextures.ps1 (procedural pixel art, original) by the MEGA-7 agent, 2026-10-28 | the pack''s licence (pending; proposed CC BY-SA 4.0) |')
    }
}
