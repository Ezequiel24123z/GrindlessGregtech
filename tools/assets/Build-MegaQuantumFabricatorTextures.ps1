<#
.SYNOPSIS
  Controller face of the UHV Quantum Fabricator (gtceu:quantum_fabricator, package MEGA-9): block/multiblock/quantum_fabricator/
  overlay_front.png, overlay_front_active.png and overlay_front_active_emissive.png, and the field ring casing block
  (grindless:field_ring_casing): block/uhv/field_ring_casing.png. Procedural pixel art, original.
.PARAMETER Credits
  Also print the CREDITS.md "Assets" table rows for the files written.
.EXAMPLE
  powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-MegaQuantumFabricatorTextures.ps1 -Credits
#>
[CmdletBinding()]
param([string]$OutRoot = '', [switch]$Credits)
$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'Pixel.Lib.ps1')
if (-not $OutRoot) { $OutRoot = Join-Path $PSScriptRoot '..\..\pack\kubejs\assets\grindless\textures' }

$dir = Join-Path $OutRoot 'block\multiblock\quantum_fabricator'
$written = New-Object System.Collections.Generic.List[string]

# Controller: a dark door with a ring of field coils round a core; the core and the ring lights glow violet when it runs.
$pal = New-Palette 'F=B9C3CE D=474D57 K=181A1E M=8D97A3 Z=D6DEE8 V=3F4A5A H=5E6670 C=8C4CE6 P=D2A0FF'
foreach ($active in @($false, $true)) {
    $c = New-Canvas
    Write-Map $c 0 0 @(
        '................',
        '.FFFFFFFFFFFFFD.',
        '.FKKKKKKKKKKKKD.',
        '.FKZZZZZZZZZZKD.',
        '.FKMVVVVVVVVMKD.',
        '.FKMVHHCCHHVMKD.',
        '.FKMVHCKKCHVMKD.',
        '.FKMVCKKKKCVMKD.',
        '.FKMVCKKKKCVMKD.',
        '.FKMVHCKKCHVMKD.',
        '.FKMVHHCCHHVMKD.',
        '.FKMVVVVVVVVMKD.',
        '.FKKKKKKKKKKKKD.',
        '.FHHHHHHHHHHHHD.',
        '.DDDDDDDDDDDDDD.',
        '................'
    ) $pal
    $e = New-Canvas
    $name = 'overlay_front'
    if ($active) {
        foreach ($p in @(@(7, 7), @(8, 7), @(7, 8), @(8, 8), @(7, 5), @(8, 5), @(7, 10), @(8, 10), @(5, 7), @(5, 8), @(10, 7), @(10, 8))) {
            Set-Px $c $p[0] $p[1] $pal['P']; Set-Px $e $p[0] $p[1] $pal['P']
        }
        $name += '_active'
        Save-Png $e (Join-Path $dir ($name + '_emissive.png'))
        $written.Add("block/multiblock/quantum_fabricator/$($name)_emissive.png")
    }
    Save-Png $c (Join-Path $dir ($name + '.png'))
    $written.Add("block/multiblock/quantum_fabricator/$name.png")
}

# Field ring casing: a UHV-grey plate with a violet field coil running round it.
$p = New-Palette 'F=B9C3CE D=474D57 K=181A1E M=8D97A3 V=3F4A5A C=8C4CE6 P=D2A0FF'
$c = New-Canvas
Write-Map $c 0 0 @(
    'FFFFFFFFFFFFFFFD',
    'FMMMMMMMMMMMMMMD',
    'FMVVVVVVVVVVVVMD',
    'FMVCCCCCCCCCCVMD',
    'FMVCKKKKKKKKCVMD',
    'FMVCKVVVVVVKCVMD',
    'FMVCKVKKKKVKCVMD',
    'FMVCKVKPPKVKCVMD',
    'FMVCKVKPPKVKCVMD',
    'FMVCKVKKKKVKCVMD',
    'FMVCKVVVVVVKCVMD',
    'FMVCKKKKKKKKCVMD',
    'FMVCCCCCCCCCCVMD',
    'FMVVVVVVVVVVVVMD',
    'FMMMMMMMMMMMMMMD',
    'DDDDDDDDDDDDDDDD'
) $p
$rel = 'block/uhv/field_ring_casing.png'
Save-Png $c (Join-Path $OutRoot ($rel.Replace('/', '\')))
$written.Add($rel)

$written | ForEach-Object { Write-Host "wrote $_" }

if ($Credits) {
    foreach ($rel in $written) {
        Write-Output ('| `pack/kubejs/assets/grindless/textures/' + $rel + '` | Generated with tools/assets/Build-MegaQuantumFabricatorTextures.ps1 (procedural pixel art, original) by the MEGA-9 agent, 2026-10-28 | the pack''s licence (pending; proposed CC BY-SA 4.0) |')
    }
}
