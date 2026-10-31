<#
.SYNOPSIS
  Original procedural 16x16 OpV-B3b controller faces and spent Li-6 shield.
#>
[CmdletBinding()]
param([string]$OutRoot = '', [switch]$Credits)
$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'Pixel.Lib.ps1')
if (-not $OutRoot) { $OutRoot = Join-Path $PSScriptRoot '..\..\pack\kubejs\assets\grindless\textures' }
$steel = New-Palette 'L=B8C8D0 M=607078 D=303C48 P=181C28 C=C89058 V=6088A0 B=6098FF S=A4B070'
function Face {
    param([int]$Kind, [int]$Frame, [bool]$Active)
    $c = New-Canvas
    $e = New-Canvas
    Set-Rect $c 1 1 14 14 $steel['D']
    Set-Rect $c 2 2 12 12 $steel['M']
    Set-Rect $c 3 3 10 8 $steel['P']
    for ($i = 1; $i -le 14; $i++) { Set-Px $c $i 1 $steel['L']; Set-Px $c 1 $i $steel['L'] }
    if ($Kind -eq 0) {
        Set-Rect $c 4 6 8 2 $steel['V']
        foreach ($x in 5, 8, 11) { Set-Rect $c $x 4 1 6 $steel['C'] }
    } elseif ($Kind -eq 1) {
        Write-Map $c 4 4 @('..SSSS..', '.SLLDDS.', '.SL..DS.', '.SD..DS.', '.SDDDDS.', '..SSSS..') $steel
    } else {
        Write-Map $c 4 4 @('..CCCC..', '.CVVVVC.', 'CV....VC', 'CV....VC', '.CVVVVC.', '..CCCC..') $steel
    }
    if ($Active) {
        $x = 4 + 2 * $Frame
        Set-Px $c $x 7 $steel['B']; Set-Px $e $x 7 $steel['B']
        Set-Px $c ($x + 1) 7 $steel['L']; Set-Px $e ($x + 1) 7 $steel['L']
        Set-Px $c 12 12 (Hex '70FF90'); Set-Px $e 12 12 (Hex '70FF90')
    } else { Set-Px $c 12 12 (Hex '286040') }
    return @($c, $e)
}
$names = @('jet_beam_line', 'spallation_target_station', 'antiproton_decelerator')
for ($kind = 0; $kind -lt 3; $kind++) {
    $dir = Join-Path $OutRoot ('block\multiblock\' + $names[$kind])
    $idle = Face $kind 0 $false
    Save-Png $idle[0] (Join-Path $dir 'overlay_front.png')
    $frames = @(); $glow = @()
    for ($i = 0; $i -lt 4; $i++) { $face = Face $kind $i $true; $frames += $face[0]; $glow += $face[1] }
    Save-Png (Join-Frames $frames) (Join-Path $dir 'overlay_front_active.png')
    Save-Png (Join-Frames $glow) (Join-Path $dir 'overlay_front_active_emissive.png')
    Save-Mcmeta (Join-Path $dir 'overlay_front_active.png.mcmeta') 4
    Save-Mcmeta (Join-Path $dir 'overlay_front_active_emissive.png.mcmeta') 4
}
$item = New-Canvas
Write-Map $item 3 2 @('..LLLLLL..', '.LSSSSSDL.', 'LSSSSSSSDL', 'LSSDDSSSDL', 'LSDPPDSSDL', 'LSDPPDSSDL', 'LSSDDSSSDL', 'LSSSSSSSDL', 'LSSSSSSSDL', '.DDDDDDD..', '..DDDDDD..') $steel
Save-Png $item (Join-Path $OutRoot 'item\spent_li6_shield.png')
if ($Credits) {
    Write-Output '| OpV-B3b controller faces and spent Li-6 shield | Original procedural pixel art, Build-OpVAntimatterCygnusTextures.ps1 | Project licence |'
}
Write-Output 'OpV-B3b textures: 3 animated controller faces, 1 item.'
