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

# Naquadria magnet works: a cryostat door with a winding drum behind a frost-grey window; the drum's turns glow naquadria green-red when it runs.
$dir = Join-Path $OutRoot 'block\multiblock\naquadria_magnet_works'
$pal = New-Palette 'F=B9C3CE D=474D57 K=181A1E M=8D97A3 Z=D6DEE8 V=3F4A5A W=E5484D P=F9A8AA H=5E6670'
foreach ($active in @($false, $true)) {
    $c = New-Canvas
    Write-Map $c 0 0 @(
        '................',
        '.FFFFFFFFFFFFFD.',
        '.FKKKKKKKKKKKKD.',
        '.FKZZZZZZZZZZKD.',
        '.FKMMMMMMMMMMKD.',
        '.FKKKKKKKKKKKKD.',
        '.FKVVVVVVVVVVKD.',
        '.FKHHHHHHHHHHKD.',
        '.FKVVVVVVVVVVKD.',
        '.FKHHHHHHHHHHKD.',
        '.FKVVVVVVVVVVKD.',
        '.FKKKKKKKKKKKKD.',
        '.FKMMMMMMMMMMKD.',
        '.FHHHHHHHHHHHHD.',
        '.DDDDDDDDDDDDDD.',
        '................'
    ) $pal
    $e = New-Canvas
    if ($active) {
        foreach ($y in @(7, 9)) { for ($x = 3; $x -le 12; $x++) { Set-Px $c $x $y $pal['W']; Set-Px $e $x $y $pal['W'] } }
        foreach ($x in @(4, 8, 11)) { Set-Px $c $x 7 $pal['P']; Set-Px $e $x 7 $pal['P'] }
    }
    Save-Overlay $dir $c $e $active
}

# HTS insert: a rod of dark steel with a light-blue HTS coil section and a red URhNq2 winding.
$pal = New-Palette 'D=474D57 K=181A1E M=8D97A3 Z=D6DEE8 B=6FB6E8 C=3F8FC9 W=E5484D P=F9A8AA'
$c = New-Canvas
Write-Map $c 0 0 @(
    '................',
    '.....DDDDDD.....',
    '....DMZZZZMD....',
    '....DMZZZZMD....',
    '...DKBBBBBBKD...',
    '...DKCBCBCBKD...',
    '...DKBBBBBBKD...',
    '..DKWWWWWWWWKD..',
    '..DKPWPWPWPWKD..',
    '..DKWWWWWWWWKD..',
    '...DKBBBBBBKD...',
    '...DKCBCBCBKD...',
    '...DKBBBBBBKD...',
    '....DMZZZZMD....',
    '.....DDDDDD.....',
    '................'
) $pal
Save-Png $c (Join-Path $OutRoot 'item\hts_insert.png')
