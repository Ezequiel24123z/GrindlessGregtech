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

# Gas giant siphon: a pale-gold cloud deck with a tether line dropping into it; the cloud glows when it runs.
$dir = Join-Path $OutRoot 'block\multiblock\gas_giant_siphon'
$pal = New-Palette 'F=B9BEC4 D=474B52 K=181A1E H=5E5F66 a=D9B873 T=E8E4D8 W=FFE7A0'
foreach ($active in @($false, $true)) {
    $c = New-Canvas
    Write-Map $c 0 0 $frame $pal
    for ($y = 3; $y -le 11; $y++) { Set-Px $c 8 $y $pal['T'] }
    $e = New-Canvas
    if ($active) {
        for ($x = 3; $x -le 12; $x++) { Set-Px $c $x 11 $pal['W']; Set-Px $e $x 11 $pal['W'] }
        foreach ($x in @(4, 7, 11)) { Set-Px $c $x 9 $pal['W']; Set-Px $e $x 9 $pal['W'] }
    }
    Save-Overlay $dir $c $e $active
}

# Isotope column: frosted blue-white glass over a pipe core; the core glows cold when it runs.
$dir = Join-Path $OutRoot 'block\multiblock\isotope_column'
$pal = New-Palette 'F=B9BEC4 D=474B52 K=181A1E H=5E5F66 a=2B4F6E T=9CC3DC W=7FE7FF'
foreach ($active in @($false, $true)) {
    $c = New-Canvas
    Write-Map $c 0 0 $frame $pal
    for ($y = 3; $y -le 11; $y++) { Set-Px $c 7 $y $pal['T']; Set-Px $c 8 $y $pal['T'] }
    $e = New-Canvas
    if ($active) {
        for ($y = 3; $y -le 11; $y++) { Set-Px $c 7 $y $pal['W']; Set-Px $c 8 $y $pal['W']; Set-Px $e 7 $y $pal['W']; Set-Px $e 8 $y $pal['W'] }
    }
    Save-Overlay $dir $c $e $active
}

# Ring harvester: a dark ring plane with ice bands; the melt band glows when it runs.
$dir = Join-Path $OutRoot 'block\multiblock\ring_harvester'
$pal = New-Palette 'F=B9BEC4 D=474B52 K=181A1E H=5E5F66 a=1E1B22 T=C7D3DA W=B5F0FF'
foreach ($active in @($false, $true)) {
    $c = New-Canvas
    Write-Map $c 0 0 $frame $pal
    foreach ($y in @(5, 7, 9)) { for ($x = 3; $x -le 12; $x++) { Set-Px $c $x $y $pal['T'] } }
    $e = New-Canvas
    if ($active) {
        for ($x = 3; $x -le 12; $x++) { Set-Px $c $x 7 $pal['W']; Set-Px $e $x 7 $pal['W'] }
    }
    Save-Overlay $dir $c $e $active
}
