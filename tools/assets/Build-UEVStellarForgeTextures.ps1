<#
.SYNOPSIS
  Controller face of the UEV Stellar Forge (gtceu:stellar_forge, package UEV-M2): block/multiblock/stellar_forge/overlay_front.png,
  overlay_front_active.png and overlay_front_active_emissive.png. Procedural pixel art, original.
.PARAMETER Credits
  Also print the CREDITS.md "Assets" table rows for the files written.
.EXAMPLE
  powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-UEVStellarForgeTextures.ps1 -Credits
#>
[CmdletBinding()]
param([string]$OutRoot = '', [switch]$Credits)
$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'Pixel.Lib.ps1')
if (-not $OutRoot) { $OutRoot = Join-Path $PSScriptRoot '..\..\pack\kubejs\assets\grindless\textures' }

$dir = Join-Path $OutRoot 'block\multiblock\stellar_forge'
$written = New-Object System.Collections.Generic.List[string]

# A dark furnace door with a ring around a star; the star and the ring glow hot white-green when it runs.
$pal = New-Palette 'F=8C939F D=5E6570 K=1E2226 M=3A4049 G=1E9E3C P=B8F5C6 H=2A2E36 W=F2FFF5'
foreach ($active in @($false, $true)) {
    $c = New-Canvas
    Write-Map $c 0 0 @(
        '................',
        '.FFFFFFFFFFFFFD.',
        '.FKKKKKKKKKKKKD.',
        '.FKMMMMMMMMMMKD.',
        '.FKMKKGGGGKKMKD.',
        '.FKMKGKKKKGKMKD.',
        '.FKMGKKKKKKGMKD.',
        '.FKMGKKGGKKGMKD.',
        '.FKMGKKGGKKGMKD.',
        '.FKMGKKKKKKGMKD.',
        '.FKMKGKKKKGKMKD.',
        '.FKMKKGGGGKKMKD.',
        '.FKMMMMMMMMMMKD.',
        '.FHHHHHHHHHHHHD.',
        '.DDDDDDDDDDDDDD.',
        '................'
    ) $pal
    $e = New-Canvas
    $name = 'overlay_front'
    if ($active) {
        foreach ($p in @(@(7, 7), @(8, 7), @(7, 8), @(8, 8))) { Set-Px $c $p[0] $p[1] $pal['W']; Set-Px $e $p[0] $p[1] $pal['W'] }
        foreach ($p in @(@(6, 4), @(7, 4), @(8, 4), @(9, 4), @(5, 5), @(10, 5), @(4, 6), @(11, 6), @(4, 9), @(11, 9), @(5, 10), @(10, 10), @(6, 11), @(7, 11), @(8, 11), @(9, 11))) {
            Set-Px $c $p[0] $p[1] $pal['P']; Set-Px $e $p[0] $p[1] $pal['P']
        }
        $name += '_active'
        Save-Png $e (Join-Path $dir ($name + '_emissive.png'))
        $written.Add("block/multiblock/stellar_forge/$($name)_emissive.png")
    }
    Save-Png $c (Join-Path $dir ($name + '.png'))
    $written.Add("block/multiblock/stellar_forge/$name.png")
}
$written | ForEach-Object { Write-Host "wrote $_" }

if ($Credits) {
    foreach ($rel in $written) {
        Write-Output ('| `pack/kubejs/assets/grindless/textures/' + $rel + '` | Generated with tools/assets/Build-UEVStellarForgeTextures.ps1 (procedural pixel art, original) by the UEV-M agent | the pack''s licence (pending; proposed CC BY-SA 4.0) |')
    }
}
