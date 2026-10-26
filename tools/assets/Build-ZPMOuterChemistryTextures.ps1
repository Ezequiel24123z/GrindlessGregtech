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

# Methane pyrolyser: a tall glass-dark column of molten metal (silver-orange) with rising bubbles that glow when it runs.
$pal = New-Palette 'F=B9BEC4 D=474B52 K=181A1E M=8D939B O=C87A32 Y=F0B060 B=FFE9B0'
New-Front (Join-Path $OutRoot 'block\multiblock\methane_pyrolyser') @(
    '................',
    '.FFFFFFFFFFFFFD.',
    '.FKKKKKKKKKKKKD.',
    '.FKKKKKMMKKKKKD.',
    '.FKKKKKKKKKKKKD.',
    '.FKKKKKMMKKKKKD.',
    '.FKKKKKKKKKKKKD.',
    '.FKKKKYYYYKKKKD.',
    '.FKKKKYOOYKKKKD.',
    '.FKKKKYOOYKKKKD.',
    '.FKKKKYOOYKKKKD.',
    '.FKKKKYYYYKKKKD.',
    '.FKKKKKKKKKKKKD.',
    '.FMMMMMMMMMMMMD.',
    '.DDDDDDDDDDDDDD.',
    '................') $pal {
    param($c, $e)
    foreach ($p in @(@(7,8),@(8,9),@(7,10),@(8,4),@(7,6))) { Set-Px $c $p[0] $p[1] $pal['B']; Set-Px $e $p[0] $p[1] $pal['B'] }
}

# Vent bioreactor: a plascrete porthole onto a dark vessel with a pipe loop; a teal-green culture glow when it runs.
$pal = New-Palette 'F=C8CCC8 D=4E524E K=14201C M=9BA29C G=2F7A5E T=7FE3B8 W=E8FFF4'
New-Front (Join-Path $OutRoot 'block\multiblock\vent_bioreactor') @(
    '................',
    '.FFFFFFFFFFFFFD.',
    '.FMMMMMMMMMMMMD.',
    '.FMKKKKKKKKKKMD.',
    '.FMKKKGGGGKKKMD.',
    '.FMKKGGGGGGKKMD.',
    '.FMKKGGGGGGKKMD.',
    '.FMKKGGGGGGKKMD.',
    '.FMKKKGGGGKKKMD.',
    '.FMKKKKKKKKKKMD.',
    '.FMMMMMMMMMMMMD.',
    '.FKKKKKGGKKKKKD.',
    '.FKKKKKGGKKKKKD.',
    '.FMMMMMMMMMMMMD.',
    '.DDDDDDDDDDDDDD.',
    '................') $pal {
    param($c, $e)
    foreach ($p in @(@(6,5),@(7,5),@(8,5),@(9,5),@(6,6),@(7,6),@(8,6),@(9,6),@(6,7),@(7,7),@(8,7),@(9,7),@(7,4),@(8,4),@(7,8),@(8,8))) {
        Set-Px $c $p[0] $p[1] $pal['T']; Set-Px $e $p[0] $p[1] $pal['T']
    }
    foreach ($p in @(@(7,6),@(8,6))) { Set-Px $c $p[0] $p[1] $pal['W']; Set-Px $e $p[0] $p[1] $pal['W'] }
}

# Aerogel works: a titanium autoclave door with a round pale-blue window on a smoky cloud that glows when it runs.
$pal = New-Palette 'F=B7B0C2 D=494554 K=1B1A24 M=8F89A0 S=6C7C9A A=BFD9F2 W=F4FBFF'
New-Front (Join-Path $OutRoot 'block\multiblock\aerogel_works') @(
    '................',
    '.FFFFFFFFFFFFFD.',
    '.FKKKKKKKKKKKKD.',
    '.FKKKSSSSSSKKKD.',
    '.FKKSKKKKKKSKKD.',
    '.FKSKKKKKKKKSKD.',
    '.FKSKKKKKKKKSKD.',
    '.FKSKKKKKKKKSKD.',
    '.FKSKKKKKKKKSKD.',
    '.FKKSKKKKKKSKKD.',
    '.FKKKSSSSSSKKKD.',
    '.FKKKKKKKKKKKKD.',
    '.FMMMMMMMMMMMMD.',
    '.FMMMMMMMMMMMMD.',
    '.DDDDDDDDDDDDDD.',
    '................') $pal {
    param($c, $e)
    for ($y = 4; $y -le 9; $y++) { for ($x = 5; $x -le 10; $x++) { Set-Px $c $x $y $pal['A']; Set-Px $e $x $y $pal['A'] } }
    foreach ($p in @(@(6,5),@(7,5),@(6,6))) { Set-Px $c $p[0] $p[1] $pal['W']; Set-Px $e $p[0] $p[1] $pal['W'] }
}
