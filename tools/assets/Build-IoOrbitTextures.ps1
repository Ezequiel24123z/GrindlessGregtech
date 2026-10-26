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

function Set-Glow {
    param($C, $E, [int]$X, [int]$Y, $V)
    Set-Px $C $X $Y $V; Set-Px $E $X $Y $V
}

# Flux-tube tether: a copper-wound reel on its stand pays out a thin wire from its side over a sheave and down into Jupiter's plasma torus; a small
# hollow-cathode emitter under the reel closes the circuit. Working, current pulses down the wire, the cathode fires a violet plume
# and the torus sparks where the wire meets it. Light grey frame for the station truss casing.
$dir = Join-Path $OutRoot 'block\multiblock\flux_tube_tether'
$pal = New-Palette 'F=C3C8CE D=5A6068 K=0D1220 M=8C939C w=B87333 v=7A4A22 H=D4D8DD A=2A2E35 S=6E747C G=7E858E W=A9AEB8 E=9AA0A8 e=666C74 o=1C1E26 t=3A2450 u=271A3A V=B79CFF Z=EDE4FF c=7FE6FF p=9B7BFF P=6A5CE0 q=D2B8FF'
foreach ($active in @($false, $true)) {
    $c = New-Canvas
    Write-Map $c 0 0 @(
        '................',
        '.FFFFFFFFFFFFFD.',
        '.FKKMMMKKKKKKKD.',
        '.FKMwvwMKKKKKKD.',
        '.FMwvHvwMKGGKKD.',
        '.FMvHAHvMWGGKKD.',
        '.FMwvHvwMKKWKKD.',
        '.FKMwvwMKKKWKKD.',
        '.FKKMMMKKKKWKKD.',
        '.FKKKSKKKKKWKKD.',
        '.FEEEoKKKKKWKKD.',
        '.FeeeoKKKKKWKKD.',
        '.FtututtututtuD.',
        '.FuutuuutuuutuD.',
        '.DDDDDDDDDDDDDD.',
        '................'
    ) $pal
    $e = New-Canvas
    if ($active) {
        Set-Glow $c $e 9 5 $pal['Z']
        for ($y = 6; $y -le 11; $y++) {
            if (($y % 3) -eq 1) { Set-Glow $c $e 11 $y $pal['Z'] } else { Set-Glow $c $e 11 $y $pal['V'] }
        }
        Set-Glow $c $e 5 10 $pal['c']; Set-Glow $c $e 5 11 $pal['c']
        Set-Glow $c $e 6 10 $pal['p']; Set-Glow $c $e 6 11 $pal['p']
        Set-Glow $c $e 7 10 $pal['P']; Set-Glow $c $e 7 11 $pal['P']
        Set-Glow $c $e 11 12 $pal['Z']
        Set-Glow $c $e 10 12 $pal['q']; Set-Glow $c $e 12 12 $pal['q']; Set-Glow $c $e 11 13 $pal['q']
    }
    Save-Overlay $dir $c $e $active
}

# Sulfur-iodine plant: a reaction column with a violet iodine band at the top, a yellow sulfur band in the middle and the HI section,
# fed by a pipe on the left, a hydrogen outlet and lamp on the right, over a vertical-slot heat grille on the volcanic heat. Working,
# the grille glows, the HI section glows and bubbles, and the hydrogen lamp lights. Darker grey frame for the radiation vault casing.
$dir = Join-Path $OutRoot 'block\multiblock\sulfur_iodine_plant'
$pal = New-Palette 'F=6C7178 D=2E3136 K=141619 S=8E939A I=8A4CB4 i=5E2E80 Y=E8C531 y=B0921E L=3E2A36 P=8C7E62 n=2F4A33 G=4A4D52 h=2A1A14 N=6CFF8A l=D86A4A b=FFD8A8 O=FF8A30 Q=FFC060 r=D9471E'
foreach ($active in @($false, $true)) {
    $c = New-Canvas
    Write-Map $c 0 0 @(
        '................',
        '.FFFFFFFFFFFFFD.',
        '.FKKKKSSSSKKKKD.',
        '.FKKKSIIIISPPKD.',
        '.FKPKSiiiiSKPKD.',
        '.FKPKSLLLLSKPKD.',
        '.FKPKSYYYYSKPKD.',
        '.FKPKSyyyySKPKD.',
        '.FKPPSLLLLSKPKD.',
        '.FKKKSLLLLSKnKD.',
        '.FKKKSSSSSSKKKD.',
        '.FGGGGGGGGGGGGD.',
        '.FGhGhhGGhhGhGD.',
        '.FGhGhhGGhhGhGD.',
        '.DDDDDDDDDDDDDD.',
        '................'
    ) $pal
    $e = New-Canvas
    if ($active) {
        for ($y = 0; $y -lt 16; $y++) {
            for ($x = 0; $x -lt 16; $x++) {
                $i = $y * 16 + $x
                $v = 0
                if ($c.P[$i] -eq $pal['h']) { if ($y -eq 13) { $v = $pal['O'] } elseif ((($x + $y) % 2) -eq 0) { $v = $pal['Q'] } else { $v = $pal['r'] } }
                elseif ($c.P[$i] -eq $pal['L']) { $v = $pal['l'] }
                if ($v -ne 0) { Set-Glow $c $e $x $y $v }
            }
        }
        foreach ($xy in @(@(7,5), @(8,8), @(6,9), @(9,9))) { Set-Glow $c $e $xy[0] $xy[1] $pal['b'] }
        Set-Glow $c $e 12 9 $pal['N']
    }
    Save-Overlay $dir $c $e $active
}
