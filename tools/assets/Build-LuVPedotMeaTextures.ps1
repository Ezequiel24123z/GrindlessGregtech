<#
.SYNOPSIS
    LuV D2-MEA: the PEDOT:PSS microelectrode array (a pale sapphire chip, a grid of gold electrode pads coated in dark blue
    polymer, gold tracks running to a contact edge). Light from the top left.
.EXAMPLE
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-LuVPedotMeaTextures.ps1 -Credits
.PARAMETER OutRoot
    Texture root; defaults to pack/kubejs/assets/grindless/textures.
.PARAMETER Credits
    Print one CREDITS.md row per written file.
#>
[CmdletBinding()]
param(
    [string]$OutRoot = '',
    [switch]$Credits
)
$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'Pixel.Lib.ps1')
$ScriptName = Split-Path -Leaf $PSCommandPath
if (-not $OutRoot) { $OutRoot = Join-Path $PSScriptRoot '..\..\pack\kubejs\assets\grindless\textures' }
$itemDir = Join-Path $OutRoot 'item'
$written = New-Object System.Collections.Generic.List[string]

# K outline, S sapphire chip (lit W, shaded D), P polymer film, p polymer highlight, G gold pad/track, g gold highlight
$map = @(
    '................',
    '.KKKKKKKKKKKKKK.',
    '.KWSSSSSSSSSSSK.',
    '.KSPPSPPSPPSPSK.',
    '.KSPpPSPpPSPpSK.',
    '.KSSSSSSSSSSSSK.',
    '.KSPPSPPSPPSPSK.',
    '.KSPpPSPpPSPpSK.',
    '.KSSSSSSSSSSSDK.',
    '.KSPPSPPSPPSPDK.',
    '.KSPpPSPpPSPpDK.',
    '.KSSSSSSSSSSDDK.',
    '.KSPPSPPSPPSPDK.',
    '.KSPpPSPpPSPpDK.',
    '.KKKKKKKKKKKKKK.',
    '.GgGgGgGgGgGgGg.'
)
$pal = New-Palette 'K=1B2536 W=E6F0FA S=A9C4E3 D=6D88AD P=1E3A6E p=4A74C0 G=C99A2E g=F2D06B'
$c = New-Canvas
Write-Map $c 0 0 $map $pal
Save-Png $c (Join-Path $itemDir 'pedot_microelectrode_array.png')
$written.Add('item/pedot_microelectrode_array.png')

Write-Host "written $($written.Count) files under $OutRoot"
foreach ($rel in $written) { Write-Host "  $rel" }

if ($Credits) {
    Write-Host ''
    foreach ($rel in $written) {
        Write-Host ("| ``pack/kubejs/assets/grindless/textures/$rel`` | Generated with tools/assets/$ScriptName (procedural pixel art, original) by the d2-mea agent, 2026-11-03 | the pack's licence (MIT) |")
    }
}
