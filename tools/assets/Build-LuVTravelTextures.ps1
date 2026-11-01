[CmdletBinding()]
param([string]$OutRoot = '')
# LuV B1: the cryogenic fuel tank's column textures (an original frost-white tank with blue cryogenic bands; GCYR's own tanks are not copied).
$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'Pixel.Lib.ps1')
if (-not $OutRoot) { $OutRoot = Join-Path $PSScriptRoot '..\..\pack\kubejs\assets\grindless\textures' }
$dir = Join-Path $OutRoot 'block\luv'
$pal = New-Palette 'W=E8F1F8 L=C9D9E6 M=9DB4C7 D=5E7487 K=2C3A48 B=3E8FD8 C=8FD3FF F=F7FBFF Y=FFD25A Z=1E2834'

$side = New-Canvas
Write-Map $side 0 0 @(
    'KDDDDDDDDDDDDDDK',
    'DMLLLLLLLLLLLLMD',
    'DLWWWFWWWWWWWWLD',
    'DLWWWFWWWWWWWWLD',
    'DBBBBBBBBBBBBBBD',
    'DCCCCCCCCCCCCCCD',
    'DLWWWFWWWWWWYWLD',
    'DLWWWFWWWWWWYWLD',
    'DLWWWFWWWWWWWWLD',
    'DLWWWFWWWWWWWWLD',
    'DCCCCCCCCCCCCCCD',
    'DBBBBBBBBBBBBBBD',
    'DLWWWFWWWWWWWWLD',
    'DLWWWFWWWWWWWWLD',
    'DMLLLLLLLLLLLLMD',
    'KDDDDDDDDDDDDDDK'
) $pal
Save-Png $side (Join-Path $dir 'cryogenic_fuel_tank_side.png')

$end = New-Canvas
Write-Map $end 0 0 @(
    'KDDDDDDDDDDDDDDK',
    'DMMMMMMMMMMMMMMD',
    'DMLLLLLLLLLLLLMD',
    'DMLWWWWWWWWWWLMD',
    'DMLWBBBBBBBBWLMD',
    'DMLWBCCCCCCBWLMD',
    'DMLWBCKKKKCBWLMD',
    'DMLWBCKDDKCBWLMD',
    'DMLWBCKDDKCBWLMD',
    'DMLWBCKKKKCBWLMD',
    'DMLWBCCCCCCBWLMD',
    'DMLWBBBBBBBBWLMD',
    'DMLWWWWWWWWWWLMD',
    'DMLLLLLLLLLLLLMD',
    'DMMMMMMMMMMMMMMD',
    'KDDDDDDDDDDDDDDK'
) $pal
Save-Png $end (Join-Path $dir 'cryogenic_fuel_tank_end.png')

# block/luv/cryogenic_fuel_tank: the block's own texture id (what its model path resolves to): the tank seen from the side, with
# domed caps and bands, on a dark casing backdrop Z (opaque).
$icon = New-Canvas
Write-Map $icon 0 0 @(
    'ZZZZZZKKKKZZZZZZ',
    'ZZZZKKLLLLKKZZZZ',
    'ZZZKLWWFWWWLKZZZ',
    'ZZZKLWWFWWWMKZZZ',
    'ZZZKBBBBBBBBKZZZ',
    'ZZZKCCCCCCCCKZZZ',
    'ZZZKLWWFWWYMKZZZ',
    'ZZZKLWWFWWWMKZZZ',
    'ZZZKLWWFWWWMKZZZ',
    'ZZZKCCCCCCCCKZZZ',
    'ZZZKBBBBBBBBKZZZ',
    'ZZZKLWWFWWWMKZZZ',
    'ZZZKMWWFWWWDKZZZ',
    'ZZZZKDMMMMDKZZZZ',
    'ZZZZZKKDDKKZZZZZ',
    'ZZZZZZZZZZZZZZZZ'
) $pal
Save-Png $icon (Join-Path $dir 'cryogenic_fuel_tank.png')
