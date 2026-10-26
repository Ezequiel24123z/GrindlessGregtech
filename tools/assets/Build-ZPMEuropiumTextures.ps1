[CmdletBinding()]
param([string]$OutRoot = '')
$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'Pixel.Lib.ps1')
if (-not $OutRoot) { $OutRoot = Join-Path $PSScriptRoot '..\..\pack\kubejs\assets\grindless\textures' }

function Save-Overlay {
    param([string]$Dir, $C, $E, [bool]$Active)
    for ($i = 0; $i -lt $E.P.Length; $i++) {
        if ($E.P[$i] -ne 0 -and $E.P[$i] -ne $C.P[$i]) { throw "emissive pixel $i of $Dir is not in the colour layer" }
    }
    $name = 'overlay_front'
    if ($Active) { $name += '_active' }
    Save-Png $C (Join-Path $Dir ($name + '.png'))
    if ($Active) { Save-Png $E (Join-Path $Dir ($name + '_emissive.png')) }
}

# Europium reductor: a Jones column (zinc amalgam bed, silver-grey) over a violet-pink europium bath; the bath glows when it runs.
$dir = Join-Path $OutRoot 'block\multiblock\europium_reductor'
$pal = New-Palette 'F=B9BEC4 D=474B52 K=181A1E M=8D939B Z=C9CED6 V=7A3F8E W=C46FD0 P=F2B8F5 H=5E5F66'
foreach ($active in @($false, $true)) {
    $c = New-Canvas
    Write-Map $c 0 0 @(
        '................',
        '.FFFFFFFFFFFFFD.',
        '.FKKKKKKKKKKKKD.',
        '.FKZZZZZZZZZZKD.',
        '.FKMMMMMMMMMMKD.',
        '.FKZZZZZZZZZZKD.',
        '.FKMMMMMMMMMMKD.',
        '.FKKKKKKKKKKKKD.',
        '.FKHHHHHHHHHHKD.',
        '.FKVVVVVVVVVVKD.',
        '.FKVVVVVVVVVVKD.',
        '.FKVVVVVVVVVVKD.',
        '.FKKKKKKKKKKKKD.',
        '.FHHHHHHHHHHHHD.',
        '.DDDDDDDDDDDDDD.',
        '................'
    ) $pal
    $e = New-Canvas
    if ($active) {
        for ($x = 3; $x -le 12; $x++) { Set-Px $c $x 10 $pal['W']; Set-Px $e $x 10 $pal['W'] }
        foreach ($x in @(4, 7, 10)) { Set-Px $c $x 9 $pal['P']; Set-Px $e $x 9 $pal['P'] }
    }
    Save-Overlay $dir $c $e $active
}
