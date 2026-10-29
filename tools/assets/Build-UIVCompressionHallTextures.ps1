<#
.SYNOPSIS
  Controller face of the UIV Neutronium Compression Hall (gtceu:neutronium_compression_hall, package UIV-M2): block/multiblock/neutronium_compression_hall/
  overlay_front.png, overlay_front_active.png and overlay_front_active_emissive.png. Procedural pixel art, original.
.PARAMETER Credits
  Also print the CREDITS.md "Assets" table rows for the files written.
.EXAMPLE
  powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-UIVCompressionHallTextures.ps1 -Credits
#>
[CmdletBinding()]
param([string]$OutRoot = '', [switch]$Credits)
$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'Pixel.Lib.ps1')
if (-not $OutRoot) { $OutRoot = Join-Path $PSScriptRoot '..\..\pack\kubejs\assets\grindless\textures' }

$dir = Join-Path $OutRoot 'block\multiblock\neutronium_compression_hall'
$written = New-Object System.Collections.Generic.List[string]

# A dark press face: two jaws close on a small bright pellet; the pellet and the jaw edges glow blue-white when it runs.
$pal = New-Palette 'F=8C939F D=5E6570 K=1E2226 M=3A4049 J=6A7380 B=3C8CE6 W=EAF4FF H=2A2E36'
foreach ($active in @($false, $true)) {
    $c = New-Canvas
    Write-Map $c 0 0 @(
        '................',
        '.FFFFFFFFFFFFFD.',
        '.FKKKKKKKKKKKKD.',
        '.FKMMMMMMMMMMKD.',
        '.FKMJJJJJJJJMKD.',
        '.FKMJMMMMMMJMKD.',
        '.FKMKKKKKKKKMKD.',
        '.FKMKKKKKKKKMKD.',
        '.FKMKKKKKKKKMKD.',
        '.FKMKKKKKKKKMKD.',
        '.FKMJMMMMMMJMKD.',
        '.FKMJJJJJJJJMKD.',
        '.FKMMMMMMMMMMKD.',
        '.FHHHHHHHHHHHHD.',
        '.DDDDDDDDDDDDDD.',
        '................'
    ) $pal
    $e = New-Canvas
    $name = 'overlay_front'
    if ($active) {
        foreach ($p in @(@(7, 7), @(8, 7), @(7, 8), @(8, 8))) { Set-Px $c $p[0] $p[1] $pal['W']; Set-Px $e $p[0] $p[1] $pal['W'] }
        foreach ($p in @(@(6, 6), @(9, 6), @(6, 9), @(9, 9), @(7, 6), @(8, 6), @(7, 9), @(8, 9), @(6, 7), @(6, 8), @(9, 7), @(9, 8))) {
            Set-Px $c $p[0] $p[1] $pal['B']; Set-Px $e $p[0] $p[1] $pal['B']
        }
        $name += '_active'
        Save-Png $e (Join-Path $dir ($name + '_emissive.png'))
        $written.Add("block/multiblock/neutronium_compression_hall/$($name)_emissive.png")
    }
    Save-Png $c (Join-Path $dir ($name + '.png'))
    $written.Add("block/multiblock/neutronium_compression_hall/$name.png")
}
$written | ForEach-Object { Write-Host "wrote $_" }

if ($Credits) {
    foreach ($rel in $written) {
        Write-Output ('| `pack/kubejs/assets/grindless/textures/' + $rel + '` | Generated with tools/assets/Build-UIVCompressionHallTextures.ps1 (procedural pixel art, original) by the UIV-M2 agent | the pack''s licence (pending; proposed CC BY-SA 4.0) |')
    }
}
