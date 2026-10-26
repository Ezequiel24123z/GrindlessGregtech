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

$frame = @(
    '................',
    '.FFFFFFFFFFFFFD.',
    '.FKKKKKKKKKKKKD.',
    '.FKaaaaaaaaaaKD.',
    '.FKaaaaaaaaaaKD.',
    '.FKaaaaaaaaaaKD.',
    '.FKaaaaaaaaaaKD.',
    '.FKaaaaaaaaaaKD.',
    '.FKaaaaaaaaaaKD.',
    '.FKaaaaaaaaaaKD.',
    '.FKaaaaaaaaaaKD.',
    '.FKaaaaaaaaaaKD.',
    '.FKKKKKKKKKKKKD.',
    '.FHHHHHHHHHHHHD.',
    '.DDDDDDDDDDDDDD.',
    '................'
)

# Plume sampler: a dark bay with a pale-blue plume fanning up from a point; the plume glows when it runs.
$dir = Join-Path $OutRoot 'block\multiblock\plume_sampler'
$pal = New-Palette 'F=B9BEC4 D=474B52 K=181A1E H=5E5F66 a=16222E T=A9C4D6 W=9FF0FF'
foreach ($active in @($false, $true)) {
    $c = New-Canvas
    Write-Map $c 0 0 $frame $pal
    Set-Px $c 8 11 $pal['T']
    foreach ($p in @(@(8, 10), @(7, 9), @(9, 9), @(7, 8), @(9, 8), @(6, 7), @(10, 7), @(6, 6), @(10, 6), @(5, 5), @(11, 5))) { Set-Px $c $p[0] $p[1] $pal['T'] }
    $e = New-Canvas
    if ($active) {
        foreach ($p in @(@(8, 10), @(7, 9), @(9, 9), @(7, 8), @(9, 8), @(6, 7), @(10, 7))) { Set-Px $c $p[0] $p[1] $pal['W']; Set-Px $e $p[0] $p[1] $pal['W'] }
    }
    Save-Overlay $dir $c $e $active
}

# Ring seismometer: a dark window with a ring-wave trace across it; the trace glows when it runs.
$dir = Join-Path $OutRoot 'block\multiblock\ring_seismometer'
$pal = New-Palette 'F=B9BEC4 D=474B52 K=181A1E H=5E5F66 a=1E1B22 T=C9A66B W=FFE08A'
$wave = @(@(3, 7), @(4, 6), @(5, 5), @(6, 6), @(7, 7), @(8, 8), @(9, 7), @(10, 6), @(11, 5), @(12, 6))
foreach ($active in @($false, $true)) {
    $c = New-Canvas
    Write-Map $c 0 0 $frame $pal
    foreach ($p in $wave) { Set-Px $c $p[0] $p[1] $pal['T'] }
    $e = New-Canvas
    if ($active) {
        foreach ($p in $wave) { Set-Px $c $p[0] $p[1] $pal['W']; Set-Px $e $p[0] $p[1] $pal['W'] }
    }
    Save-Overlay $dir $c $e $active
}
