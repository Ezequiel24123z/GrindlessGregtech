<#
.SYNOPSIS
  OpV-D2 procedural 16x16 controller overlays and local intermediate items.
.DESCRIPTION
  Original pixel art through Pixel.Lib.ps1; no external assets. The integrator credits this generator.
#>
[CmdletBinding()]
param([string]$OutRoot = '')
$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'Pixel.Lib.ps1')
if (-not $OutRoot) { $OutRoot = Join-Path $PSScriptRoot '..\..\pack\kubejs\assets\grindless\textures' }
$steel = Hex '8C9BA8'
$dark = Hex '303B50'
$copper = Hex 'B98760'
$glow = Hex '95E8D9'
foreach ($name in 'strangelet_vault', 'strangelet_distiller') {
    $base = New-Canvas
    Set-Rect $base 1 1 14 14 $dark
    Set-Rect $base 2 2 12 1 $steel
    Set-Rect $base 2 2 1 12 $steel
    if ($name -eq 'strangelet_vault') {
        foreach ($y in 4, 7, 10) { Set-Rect $base 4 $y 8 1 $copper }
        Set-Rect $base 6 4 4 7 (Hex '506880')
    } else {
        Set-Rect $base 3 6 10 4 (Hex '506880')
        foreach ($x in 4, 7, 10) { Set-Rect $base $x 4 1 8 $copper }
    }
    $dir = Join-Path $OutRoot ('block\multiblock\' + $name)
    Save-Png $base (Join-Path $dir 'overlay_front.png')
    $frames = @()
    $emissive = @()
    foreach ($f in 0..3) {
        $c = Copy-Canvas $base
        $e = New-Canvas
        $x = 5 + $f
        $y = if ($name -eq 'strangelet_vault') { 9 - $f } else { 7 }
        Set-Rect $c $x $y 2 2 $glow
        Set-Rect $e $x $y 2 2 $glow
        Set-Px $c 12 12 $glow
        Set-Px $e 12 12 $glow
        $frames += $c
        $emissive += $e
    }
    $active = Join-Path $dir 'overlay_front_active.png'
    $light = Join-Path $dir 'overlay_front_active_emissive.png'
    Save-Png (Join-Frames $frames) $active
    Save-Png (Join-Frames $emissive) $light
    Save-Mcmeta ($active + '.mcmeta') 4
    Save-Mcmeta ($light + '.mcmeta') 4
}
$items = @('lead_208_dust', 'pb208_ion_source', 'fed_strangelet', 'grown_strangelet', 'strangelet_tailings', 'negative_strangelet_residue')
foreach ($name in $items) {
    $c = New-Canvas
    $colour = switch ($name) {
        'lead_208_dust' { Hex '8892A6' }
        'pb208_ion_source' { Hex 'B0BCD0' }
        'fed_strangelet' { Hex '76C7C0' }
        'grown_strangelet' { Hex '9DDDD4' }
        'strangelet_tailings' { Hex 'A3AD65' }
        'negative_strangelet_residue' { Hex 'D383AA' }
    }
    Set-Rect $c 4 4 8 8 $dark
    Set-Rect $c 5 5 6 6 $colour
    Set-Rect $c 5 5 4 1 (Shade $colour 1.25)
    Set-Rect $c 5 5 1 4 (Shade $colour 1.25)
    Set-Rect $c 7 10 4 1 (Shade $colour 0.65)
    if ($name -eq 'pb208_ion_source') {
        Set-Rect $c 6 2 4 2 $steel
        Set-Rect $c 6 12 4 2 $steel
    }
    Save-Png $c (Join-Path $OutRoot ('item\' + $name + '.png'))
}
Write-Output 'OpV-D2: 16 procedural texture and animation files written.'
