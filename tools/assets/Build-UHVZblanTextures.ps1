<#
.SYNOPSIS
    UHV A10: the ZBLAN preform (a fluoride glass rod, its core a shade deeper than the cladding).
.EXAMPLE
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-UHVZblanTextures.ps1 -Credits
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

# the preform, lying diagonally: dark outline (K), pale cladding glass (G) lit on the top left (W), the core (C) along the axis,
# the shaded underside (D) and the polished end face (E) at the bottom right
$preformMap = @(
    '................',
    '..........KK....',
    '.........KWGK...',
    '........KWGGDK..',
    '.......KWGCGDK..',
    '......KWGCGDK...',
    '.....KWGCGDK....',
    '....KWGCGDK.....',
    '...KWGCGDK......',
    '..KWGCGDK.......',
    '..KGCGDK........',
    '..KECEK.........',
    '..KEEK..........',
    '...KK...........',
    '................',
    '................'
)
$preformPal = New-Palette 'K=2A3440 W=F4FAFF G=C8DCEA D=8AA4B8 C=9AE4FF E=B0D0E4'
$c = New-Canvas
Write-Map $c 0 0 $preformMap $preformPal
Save-Png $c (Join-Path $itemDir 'zblan_preform.png')
$written.Add('item/zblan_preform.png')

Write-Host "written $($written.Count) files under $OutRoot"
foreach ($rel in $written) { Write-Host "  $rel" }

if ($Credits) {
    Write-Host ''
    foreach ($rel in $written) {
        Write-Host ("| ``pack/kubejs/assets/grindless/textures/$rel`` | Generated with tools/assets/$ScriptName (procedural pixel art, original) by the uhv-a10-zblan agent, 2026-10-27 | the pack's licence (pending; proposed CC BY-SA 4.0) |")
    }
}
