<#
.SYNOPSIS
    LuV D2-GERMANIUM: the germanium boule (a grey-metallic single crystal, tapered cone and flat top) and the germanium wafer
    (a round polished disc with a flat). Light from the top left.
.EXAMPLE
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-LuVGermaniumTextures.ps1 -Credits
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

# boule: dark outline (K), lit left (W), body (G), shaded right (D), the seed neck at the bottom
$bouleMap = @(
    '................',
    '....KKKKKKKK....',
    '...KWWGGGGGDK...',
    '...KWGGGGGDDK...',
    '...KWGGGGGDDK...',
    '...KWGGGGGDDK...',
    '...KWGGGGGDDK...',
    '...KWGGGGGDDK...',
    '...KWGGGGGDDK...',
    '....KWGGGGDK....',
    '....KWGGGDDK....',
    '.....KWGGDK.....',
    '......KWGDK.....',
    '.......KGK......',
    '.......KDK......',
    '........K.......'
)
$bouleSheen = @(
    '................',
    '................',
    '....SS..........',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................'
)
$bouleSheen[2] = '....S...........'
$bPal = New-Palette 'K=23272D W=D5DBE2 G=9CA6B2 D=5F6975 S=FFFFFF'
$c = New-Canvas
Write-Map $c 0 0 $bouleMap $bPal
Write-Map $c 0 0 $bouleSheen $bPal
Save-Png $c (Join-Path $itemDir 'germanium_boule.png')
$written.Add('item/germanium_boule.png')

# wafer: round polished disc, a little from above, with the flat at the bottom
$waferMap = @(
    '................',
    '................',
    '.....KKKKKK.....',
    '...KKWWWGGGKK...',
    '..KWWSGGGGGGGK..',
    '..KWGGGGGGGGDK..',
    '.KWGGGGGGGGGDDK.',
    '.KWGGGGGGGGGDDK.',
    '.KWGGGGGGGGGDDK.',
    '.KWGGGGGGGGGDDK.',
    '.KGGGGGGGGGDDDK.',
    '..KGGGGGGGDDDK..',
    '..KKGGGGGDDDKK..',
    '....KKKKKKKK....',
    '................',
    '................'
)
$wPal = New-Palette 'K=23272D W=E4E9EE S=FFFFFF G=8E99A6 D=566170'
$c = New-Canvas
Write-Map $c 0 0 $waferMap $wPal
Save-Png $c (Join-Path $itemDir 'germanium_wafer.png')
$written.Add('item/germanium_wafer.png')

Write-Host "written $($written.Count) files under $OutRoot"
foreach ($rel in $written) { Write-Host "  $rel" }

if ($Credits) {
    Write-Host ''
    foreach ($rel in $written) {
        Write-Host ("| ``pack/kubejs/assets/grindless/textures/$rel`` | Generated with tools/assets/$ScriptName (procedural pixel art, original) by the d2-germanium agent, 2026-11-03 | the pack's licence (MIT) |")
    }
}
