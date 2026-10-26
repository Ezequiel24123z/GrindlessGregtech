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

function Save-Item {
    param([string]$Name, [string[]]$Map, $Pal)
    $c = New-Canvas
    Write-Map $c 0 0 $Map $Pal
    Save-Png $c (Join-Path $OutRoot ('item\' + $Name + '.png'))
}

# ---- items -------------------------------------------------------------------------------------------------------------------
# nitrogen-doped CVD plate: the pale cyan diamond wafer with a violet tint (the nitrogen)
$pal = New-Palette 'D=2A5C70 L=BFF4FF M=7FD8EC S=4CA9C4 W=FFFFFF V=9B7FD9'
Save-Item 'nitrogen_doped_cvd_plate' @(
    '................',
    '................',
    '....DDDDDDDD....',
    '...DLLLLLLLLD...',
    '..DLWLLLLMMMMD..',
    '..DLLLLLVVMMSD..',
    '..DLLLLVVVMMSD..',
    '..DLLLMVVMMMSD..',
    '..DLLMMMMMMSSD..',
    '..DLMMMMMMSSSD..',
    '..DMMMMMMSSSSD..',
    '...DSSSSSSSSD...',
    '....DDDDDDDD....',
    '................',
    '................',
    '................') $pal

# NV chip: a small dark diamond chip with one violet-pink glowing vacancy centre
$pal = New-Palette 'D=1E3F4D L=A8EEFA M=6CCBE0 S=3A93AD G=C46FD0 P=F2B8F5 K=15262E'
Save-Item 'nv_diamond_chip' @(
    '................',
    '................',
    '................',
    '....DDDDDDDD....',
    '...DLLLLLLMMD...',
    '...DLLLLLMMMD...',
    '...DLLLPGMMMD...',
    '...DLLLGGMMSD...',
    '...DLLMMMMSSD...',
    '...DLMMMMSSSD...',
    '...DSSSSSSSSD...',
    '....DDDDDDDD....',
    '....K......K....',
    '................',
    '................',
    '................') $pal

# silicon-28 boule: a grey-blue crystal cylinder with a cone at the top
$pal = New-Palette 'D=2B3340 L=C9D3E0 M=8E9BB0 S=5C6A82 W=FFFFFF'
Save-Item 'silicon_28_boule' @(
    '................',
    '.......DD.......',
    '......DLLD......',
    '.....DLWLMD.....',
    '.....DLLMMD.....',
    '....DDLLMMDD....',
    '....DLLLMMSD....',
    '....DLWLMMSD....',
    '....DLLLMMSD....',
    '....DLLMMSSD....',
    '....DLLMMSSD....',
    '....DLMMMSSD....',
    '....DMMMSSSD....',
    '....DSSSSSSD....',
    '.....DDDDDD.....',
    '................') $pal

# silicon-28 wafer: a round grey-blue disc with a flat edge
$pal = New-Palette 'D=2B3340 L=D5DEEA M=9AA7BD S=65738C W=FFFFFF'
Save-Item 'silicon_28_wafer' @(
    '................',
    '................',
    '.....DDDDDD.....',
    '...DDLLLLLLDD...',
    '..DLLWLLLLMMMD..',
    '..DLLLLLLMMMMD..',
    '.DLLLLLLMMMMMSD.',
    '.DLLLLLMMMMMSSD.',
    '.DLLLLMMMMMSSSD.',
    '.DLLLMMMMMSSSSD.',
    '..DLMMMMMSSSSD..',
    '..DDMMMSSSSSDD..',
    '...DDDSSSSDDD...',
    '.....DDDDDD.....',
    '................',
    '................') $pal

# donor qubit wafer: the wafer with a 3x3 grid of phosphorus donors (orange), one glowing
$pal = New-Palette 'D=2B3340 L=D5DEEA M=9AA7BD S=65738C O=E8913A Y=FFD27A'
Save-Item 'donor_qubit_wafer' @(
    '................',
    '................',
    '.....DDDDDD.....',
    '...DDLLLLLLDD...',
    '..DLLLLLLLMMMD..',
    '..DLOLLOLLOMMD..',
    '.DLLLLLLLMMMMSD.',
    '.DLLLLLLMMMMSSD.',
    '.DLOLLOLMMOSSSD.',
    '.DLLLLMMMMMSSSD.',
    '..DLMMMMMMSSSD..',
    '..DDMOMMOSOSDD..',
    '...DDDSSSSDDD...',
    '.....DDDDDD.....',
    '................',
    '................') $pal

# ---- machines ----------------------------------------------------------------------------------------------------------------
function New-Front {
    param([string]$Dir, [string[]]$Map, $Pal, [scriptblock]$Glow)
    foreach ($active in @($false, $true)) {
        $c = New-Canvas
        Write-Map $c 0 0 $Map $Pal
        $e = New-Canvas
        if ($active) { & $Glow $c $e }
        Save-Overlay $Dir $c $e $active
    }
}

# Diamond lattice fab: a microwave cavity (waveguide, grey) over a plasma ball that glows pale cyan when it runs.
$pal = New-Palette 'F=B9BEC4 D=474B52 K=181A1E M=8D939B Z=C9CED6 C=7FD8EC W=E8FFFF G=3A6B7A'
New-Front (Join-Path $OutRoot 'block\multiblock\diamond_lattice_fab') @(
    '................',
    '.FFFFFFFFFFFFFD.',
    '.FKKKKKKKKKKKKD.',
    '.FKZZZZZZZZZZKD.',
    '.FKMMMMMMMMMMKD.',
    '.FKKKKGGGGKKKKD.',
    '.FKKGGGGGGGGKKD.',
    '.FKKGGGGGGGGKKD.',
    '.FKKGGGGGGGGKKD.',
    '.FKKKKGGGGKKKKD.',
    '.FKMMMMMMMMMMKD.',
    '.FKZZZZZZZZZZKD.',
    '.FKKKKKKKKKKKKD.',
    '.FMMMMMMMMMMMMD.',
    '.DDDDDDDDDDDDDD.',
    '................') $pal {
    param($c, $e)
    foreach ($p in @(@(6,6),@(7,6),@(8,6),@(9,6),@(5,7),@(6,7),@(7,7),@(8,7),@(9,7),@(10,7),@(6,8),@(7,8),@(8,8),@(9,8),@(7,5),@(8,5),@(7,9),@(8,9))) {
        Set-Px $c $p[0] $p[1] $pal['C']; Set-Px $e $p[0] $p[1] $pal['C']
    }
    foreach ($p in @(@(7,7),@(8,7))) { Set-Px $c $p[0] $p[1] $pal['W']; Set-Px $e $p[0] $p[1] $pal['W'] }
}

# Ion implanter: a long beam tube (dark) with a magnet ring (orange coil) and a violet beam that glows when it runs.
$pal = New-Palette 'F=B9BEC4 D=474B52 K=181A1E M=8D939B O=C87A32 Y=F0B060 V=B06FE0 P=F2B8F5'
New-Front (Join-Path $OutRoot 'block\multiblock\ion_implanter') @(
    '................',
    '.FFFFFFFFFFFFFD.',
    '.FKKKKKKKKKKKKD.',
    '.FMMMMMMMMMMMMD.',
    '.FKKKKOYKKKKKKD.',
    '.FKKKKOYKKKKKKD.',
    '.FKKKKKKKKKKKKD.',
    '.FKKKKKKKKKKKKD.',
    '.FKKKKOYKKKKKKD.',
    '.FKKKKOYKKKKKKD.',
    '.FMMMMMMMMMMMMD.',
    '.FKKKKKKKKKKKKD.',
    '.FKKKKKKKKKKKKD.',
    '.FMMMMMMMMMMMMD.',
    '.DDDDDDDDDDDDDD.',
    '................') $pal {
    param($c, $e)
    for ($x = 2; $x -le 13; $x++) { Set-Px $c $x 6 $pal['V']; Set-Px $e $x 6 $pal['V'] }
    for ($x = 2; $x -le 13; $x += 3) { Set-Px $c $x 7 $pal['P']; Set-Px $e $x 7 $pal['P'] }
}

# Qubit fab: a cryostat's gold plates in stages over a cold blue mixing chamber that glows when it runs.
$pal = New-Palette 'F=9FB4C6 D=3C4A58 K=141B22 M=7C93A8 G=D9B44A H=8A6F1F B=3E7CC4 C=8FE0FF'
New-Front (Join-Path $OutRoot 'block\multiblock\qubit_fab') @(
    '................',
    '.FFFFFFFFFFFFFD.',
    '.FKKKKKKKKKKKKD.',
    '.FKGGGGGGGGGGKD.',
    '.FKKKKHKKHKKKKD.',
    '.FKKGGGGGGGGKKD.',
    '.FKKKKHKKHKKKKD.',
    '.FKKKGGGGGGKKKD.',
    '.FKKKKHKKHKKKKD.',
    '.FKKKKGGGGKKKKD.',
    '.FKKKKBBBBKKKKD.',
    '.FKKKKBBBBKKKKD.',
    '.FKKKKKKKKKKKKD.',
    '.FMMMMMMMMMMMMD.',
    '.DDDDDDDDDDDDDD.',
    '................') $pal {
    param($c, $e)
    for ($x = 6; $x -le 9; $x++) { foreach ($y in 10, 11) { Set-Px $c $x $y $pal['C']; Set-Px $e $x $y $pal['C'] } }
}
