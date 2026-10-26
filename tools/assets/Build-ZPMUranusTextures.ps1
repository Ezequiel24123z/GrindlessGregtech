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

# Ice-giant siphon: a dark bay with a teal tether line dropping to a scoop; the tether glows when it runs.
$dir = Join-Path $OutRoot 'block\multiblock\ice_giant_siphon'
$pal = New-Palette 'F=B9BEC4 D=474B52 K=181A1E H=5E5F66 a=102228 T=5FB7BF W=8CF3F0'
$line = @(@(8, 3), @(8, 4), @(8, 5), @(8, 6), @(8, 7), @(8, 8))
$scoop = @(@(7, 9), @(8, 9), @(9, 9), @(7, 10), @(9, 10))
foreach ($active in @($false, $true)) {
    $c = New-Canvas
    Write-Map $c 0 0 $frame $pal
    foreach ($p in ($line + $scoop)) { Set-Px $c $p[0] $p[1] $pal['T'] }
    $e = New-Canvas
    if ($active) {
        foreach ($p in ($line + $scoop)) { Set-Px $c $p[0] $p[1] $pal['W']; Set-Px $e $p[0] $p[1] $pal['W'] }
    }
    Save-Overlay $dir $c $e $active
}

# Slurry separator: a dark window with three stacked cyclone bars; the bars glow when it runs.
$dir = Join-Path $OutRoot 'block\multiblock\slurry_separator'
$pal = New-Palette 'F=B9BEC4 D=474B52 K=181A1E H=5E5F66 a=1B1A22 T=A98FD6 W=E1C8FF'
$bars = @()
foreach ($y in @(4, 7, 10)) { foreach ($x in 4..11) { $bars += , @($x, $y) } }
foreach ($active in @($false, $true)) {
    $c = New-Canvas
    Write-Map $c 0 0 $frame $pal
    foreach ($p in $bars) { Set-Px $c $p[0] $p[1] $pal['T'] }
    $e = New-Canvas
    if ($active) {
        foreach ($p in $bars) { Set-Px $c $p[0] $p[1] $pal['W']; Set-Px $e $p[0] $p[1] $pal['W'] }
    }
    Save-Overlay $dir $c $e $active
}

# Flyby probe bay: a dark window with a launch rail rising diagonally to a probe; the probe glows when it runs.
$dir = Join-Path $OutRoot 'block\multiblock\flyby_probe_bay'
$pal = New-Palette 'F=B9BEC4 D=474B52 K=181A1E H=5E5F66 a=14202C T=7FA6D8 W=C4DEFF'
$rail = @(@(4, 10), @(5, 9), @(6, 8), @(7, 7), @(8, 6), @(9, 5), @(10, 4))
foreach ($active in @($false, $true)) {
    $c = New-Canvas
    Write-Map $c 0 0 $frame $pal
    foreach ($p in $rail) { Set-Px $c $p[0] $p[1] $pal['T'] }
    $e = New-Canvas
    if ($active) {
        foreach ($p in @(@(9, 5), @(10, 4), @(10, 5), @(9, 4))) { Set-Px $c $p[0] $p[1] $pal['W']; Set-Px $e $p[0] $p[1] $pal['W'] }
    }
    Save-Overlay $dir $c $e $active
}
