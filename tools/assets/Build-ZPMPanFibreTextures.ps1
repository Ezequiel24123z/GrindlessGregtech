[CmdletBinding()]
param([string]$OutRoot = '')
$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'Pixel.Lib.ps1')
if (-not $OutRoot) { $OutRoot = Join-Path $PSScriptRoot '..\..\pack\kubejs\assets\grindless\textures' }

# A hank of fibre: parallel strands, banded by two shades. The palette tells the stage apart.
function Save-Hank {
    param([string]$Name, [string]$Spec)
    $c = New-Canvas
    $pal = New-Palette $Spec
    for ($x = 3; $x -le 12; $x++) {
        $shade = if ($x % 2 -eq 0) { $pal['A'] } else { $pal['B'] }
        for ($y = 2; $y -le 13; $y++) { Set-Px $c $x $y $shade }
    }
    foreach ($x in 3..12) { Set-Px $c $x 2 $pal['E']; Set-Px $c $x 13 $pal['E'] }
    foreach ($y in 5..6) { foreach ($x in 3..12) { Set-Px $c $x $y $pal['T'] } }
    foreach ($y in 9..10) { foreach ($x in 3..12) { Set-Px $c $x $y $pal['T'] } }
    Save-Png $c (Join-Path $OutRoot ('item\' + $Name + '.png'))
}

# PAN precursor fibre: white-grey acrylic strands tied with a blue-grey band.
Save-Hank 'pan_precursor_fibre' 'A=ECEDEF B=C9CCD2 E=8E939C T=6F7F96'
# Stabilised PAN fibre: oxidised, so a rust-brown to near-black ladder polymer.
Save-Hank 'stabilised_pan_fibre' 'A=4B3226 B=2E1F18 E=1A110D T=7A4A30'
