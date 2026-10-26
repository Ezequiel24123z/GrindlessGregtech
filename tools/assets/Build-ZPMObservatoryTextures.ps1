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

# Neutrino observatory: a dark vessel ringed by photomultiplier dots; a blue flash glows in the water when it runs.
$dir = Join-Path $OutRoot 'block\multiblock\neutrino_observatory'
$pal = New-Palette 'F=B9BEC4 D=474B52 K=181A1E H=5E5F66 a=0F1B2B T=3C6E9A W=7FD0FF'
foreach ($active in @($false, $true)) {
    $c = New-Canvas
    Write-Map $c 0 0 $frame $pal
    foreach ($x in @(4, 6, 9, 11)) { foreach ($y in @(4, 10)) { Set-Px $c $x $y $pal['T'] } }
    $e = New-Canvas
    if ($active) {
        foreach ($p in @(@(7, 6), @(8, 7), @(7, 8), @(6, 7), @(8, 9))) { Set-Px $c $p[0] $p[1] $pal['W']; Set-Px $e $p[0] $p[1] $pal['W'] }
    }
    Save-Overlay $dir $c $e $active
}

# Deep space network: a dish face with a feed horn in the middle; the horn and a signal arc glow when it runs.
$dir = Join-Path $OutRoot 'block\multiblock\deep_space_network'
$pal = New-Palette 'F=B9BEC4 D=474B52 K=181A1E H=5E5F66 a=1B2026 T=8E98A4 W=A8F2C0'
foreach ($active in @($false, $true)) {
    $c = New-Canvas
    Write-Map $c 0 0 $frame $pal
    for ($x = 4; $x -le 11; $x++) { Set-Px $c $x 10 $pal['T'] }
    foreach ($p in @(@(5, 9), @(10, 9), @(6, 8), @(9, 8))) { Set-Px $c $p[0] $p[1] $pal['T'] }
    Set-Px $c 7 7 $pal['T']; Set-Px $c 8 7 $pal['T']
    $e = New-Canvas
    if ($active) {
        Set-Px $c 7 7 $pal['W']; Set-Px $c 8 7 $pal['W']; Set-Px $e 7 7 $pal['W']; Set-Px $e 8 7 $pal['W']
        foreach ($p in @(@(5, 5), @(7, 4), @(9, 4), @(11, 5))) { Set-Px $c $p[0] $p[1] $pal['W']; Set-Px $e $p[0] $p[1] $pal['W'] }
    }
    Save-Overlay $dir $c $e $active
}

# Kuiper survey telescope: a round mirror with a spider and a secondary; the starfield glows when it runs.
$dir = Join-Path $OutRoot 'block\multiblock\kuiper_survey_telescope'
$pal = New-Palette 'F=B9BEC4 D=474B52 K=181A1E H=5E5F66 a=10121C T=5F7FA8 W=FFF4C2'
foreach ($active in @($false, $true)) {
    $c = New-Canvas
    Write-Map $c 0 0 $frame $pal
    for ($x = 4; $x -le 11; $x++) { Set-Px $c $x 7 $pal['T'] }
    for ($y = 4; $y -le 10; $y++) { Set-Px $c 7 $y $pal['T'] }
    $e = New-Canvas
    if ($active) {
        foreach ($p in @(@(4, 4), @(10, 5), @(5, 9), @(11, 10), @(9, 4))) { Set-Px $c $p[0] $p[1] $pal['W']; Set-Px $e $p[0] $p[1] $pal['W'] }
    }
    Save-Overlay $dir $c $e $active
}
