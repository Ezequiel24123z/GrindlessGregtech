[CmdletBinding()]
param([string]$OutRoot = '')
$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'Pixel.Lib.ps1')
if (-not $OutRoot) { $OutRoot = Join-Path $PSScriptRoot '..\..\pack\kubejs\assets\grindless\textures' }
$dir = Join-Path $OutRoot 'block\multiblock\orbital_solar_station'
$pal = New-Palette 'B=9AAFC2 D=344351 K=101B30 P=234A92 C=577DCC W=DDEAFF Y=FFE193 O=FFB354 G=64FFC3 R=B23D47'
foreach ($active in @($false, $true)) {
    $c = New-Canvas
    Write-Map $c 0 0 @(
        '................',
        '.BBBBBBBBBBBBBD.',
        '.BKKKKKKKKKKKKD.',
        '.BKKKKKKYKKKKKD.',
        '.BKKKKKYYYKKKKD.',
        '.BKKKKKKYKKKKKD.',
        '.BKPPPPBBPPPPKD.',
        '.BKPCPCBBPCPCKD.',
        '.BKPPPPBBPPPPKD.',
        '.BKPCPCBBPCPCKD.',
        '.BKKKKKBBKKKKKD.',
        '.BKKKKKBBKKKKKD.',
        '.BDDDDDDDDDDDDD.',
        '.BGKGKGKKKKKRKD.',
        '.DDDDDDDDDDDDDD.',
        '................'
    ) $pal
    $e = New-Canvas
    if ($active) {
        foreach ($xy in @(@(8,3), @(7,4), @(8,4), @(9,4), @(8,5))) {
            Set-Px $c $xy[0] $xy[1] $pal['Y']; Set-Px $e $xy[0] $xy[1] $pal['Y']
        }
        foreach ($x in @(2,4,6,12)) { Set-Px $c $x 13 $pal['G']; Set-Px $e $x 13 $pal['G'] }
    } else {
        foreach ($x in @(2,4,6)) { Set-Px $c $x 13 $pal['D'] }
        foreach ($xy in @(@(8,3), @(7,4), @(8,4), @(9,4), @(8,5))) { Set-Px $c $xy[0] $xy[1] $pal['O'] }
    }
    $name = 'overlay_front'
    if ($active) { $name += '_active' }
    Save-Png $c (Join-Path $dir ($name + '.png'))
    if ($active) { Save-Png $e (Join-Path $dir ($name + '_emissive.png')) }
}
