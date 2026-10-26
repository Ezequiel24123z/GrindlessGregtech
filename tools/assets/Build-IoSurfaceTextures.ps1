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

# Fumarole condenser: four condenser bands from hot (top) to cold (bottom) beside a sulfur collector pipe.
$dir = Join-Path $OutRoot 'block\multiblock\fumarole_condenser'
$pal = New-Palette 'F=A7ADA3 D=474C47 K=171A18 a=FF8A3D b=B8521E c=E8B060 d=9A7034 e=9FC7C4 f=5E8584 g=D8ECFF h=8FAACB P=6E6A3A Y=FFE03A S=F2D34A'
foreach ($active in @($false, $true)) {
    $c = New-Canvas
    Write-Map $c 0 0 @(
        '................',
        '.FFFFFFFFFFFFFD.',
        '.FKKKKKKKKKKPKD.',
        '.FKaaaaaaaaKPKD.',
        '.FKbKbKbKbKKPKD.',
        '.FKKKKKKKKKKPKD.',
        '.FKccccccccKPKD.',
        '.FKdKdKdKdKKPKD.',
        '.FKKKKKKKKKKPKD.',
        '.FKeeeeeeeeKPKD.',
        '.FKfKfKfKfKKPKD.',
        '.FKKKKKKKKKKPKD.',
        '.FKggggggggKPKD.',
        '.FKhKhKhKhKKPKD.',
        '.DDDDDDDDDDDDDD.',
        '................'
    ) $pal
    $e = New-Canvas
    if ($active) {
        for ($y = 2; $y -le 13; $y++) { Set-Px $c 12 $y $pal['Y']; Set-Px $e 12 $y $pal['Y'] }
        foreach ($xy in @(@(4,5), @(8,5), @(6,8), @(10,8), @(4,11), @(8,11))) {
            Set-Px $c $xy[0] $xy[1] $pal['S']; Set-Px $e $xy[0] $xy[1] $pal['S']
        }
        for ($x = 3; $x -le 10; $x++) { Set-Px $e $x 3 $pal['a'] }
    }
    Save-Overlay $dir $c $e $active
}

# Volcanic intake: a pinwheel turbine disc over a lava-red heat grille; the gaps glow from the magma when it runs.
$dir = Join-Path $OutRoot 'block\multiblock\volcanic_intake'
$pal = New-Palette 'F=BDB38A D=5C553C K=1E1B14 M=8E8A80 B=D6D6CF H=5E5A52 G=4A4540 u=241A18 L=5A1E16 r=D9471E O=FF6A22 Q=FFA040'
foreach ($active in @($false, $true)) {
    $c = New-Canvas
    Write-Map $c 0 0 @(
        '................',
        '.FFFFFFFFFFFFFD.',
        '.FKKKKMMMMKKKKD.',
        '.FKKKMuBuuMKKKD.',
        '.FKKMuuBuuuMKKD.',
        '.FKKMuuHHBBMKKD.',
        '.FKKMBBHHuuMKKD.',
        '.FKKMuuuBuuMKKD.',
        '.FKKKMuuBuMKKKD.',
        '.FKKKKMMMMKKKKD.',
        '.FGGGGGGGGGGGGD.',
        '.FGLLLLGGLLLLGD.',
        '.FGGGGGGGGGGGGD.',
        '.FGLLLLGGLLLLGD.',
        '.DDDDDDDDDDDDDD.',
        '................'
    ) $pal
    $e = New-Canvas
    if ($active) {
        for ($y = 0; $y -lt 16; $y++) {
            for ($x = 0; $x -lt 16; $x++) {
                $i = $y * 16 + $x
                $v = 0
                if ($c.P[$i] -eq $pal['u']) { $v = $pal['r'] }
                elseif ($c.P[$i] -eq $pal['L']) { if ((($x + $y) % 3) -eq 0) { $v = $pal['Q'] } else { $v = $pal['O'] } }
                if ($v -ne 0) { Set-Px $c $x $y $v; Set-Px $e $x $y $v }
            }
        }
    }
    Save-Overlay $dir $c $e $active
}
