<#
.SYNOPSIS
    UV B1: the Neptunian and Plutonian quantum seed ampoules and Pluto's sky disc (GCYR ships no Pluto sky texture).
.EXAMPLE
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-UVTravelTextures.ps1 -Credits
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
$skyDir = Join-Path $OutRoot 'sky'
$written = New-Object System.Collections.Generic.List[string]

# the seed ampoule (same shape as ZPM B1's): a glass vial with a cap of the place's matter
$seedMap = @(
    '................',
    '.....KKKKKK.....',
    '....KCCCCCCK....',
    '....KCCDDCCK....',
    '.....KKKKKK.....',
    '.....KGGGGK.....',
    '....KGGHHGGK....',
    '...KGGHSSHGGK...',
    '...KGHSSSSHGK...',
    '...KGHSSSSHGK...',
    '...KGGHSSHGGK...',
    '....KGGHHGGK....',
    '.....KGGGGK.....',
    '......KKKK......',
    '................',
    '................'
)
$seeds = @(
    # Neptune: deep blue gas; Pluto: nitrogen ice, pale tan with a rust cap
    @{ Name = 'neptunian_quantum_seed'; Pal = 'K=0C1A4A C=3E66D8 D=1E3C96 G=B8C4CC H=EAF2F7 S=4F7BFF' },
    @{ Name = 'plutonian_quantum_seed'; Pal = 'K=3A2416 C=B07A52 D=7A4A2C G=B8C4CC H=EAF2F7 S=E6D3BA' }
)
foreach ($s in $seeds) {
    $c = New-Canvas
    Write-Map $c 0 0 $seedMap (New-Palette $s.Pal)
    Save-Png $c (Join-Path $itemDir ($s.Name + '.png'))
    $written.Add('item/' + $s.Name + '.png')
}

# Pluto seen from orbit: a pale disc with the darker Cthulhu region and the bright heart-shaped plain
$plutoMap = @(
    '................',
    '.....AAAAAA.....',
    '...AABBBBBBAA...',
    '..ABBBBBBBBBBA..',
    '..ABBBBBBBHHBA..',
    '.ABBBBBBBHHHHBA.',
    '.ABBBBBBBHHHHBA.',
    '.ADDDBBBBHHHHBA.',
    '.ADDDDBBBBHHBBA.',
    '.ADDDDDBBBBHBBA.',
    '.AADDDDBBBBBBBA.',
    '..ADDDBBBBBBBA..',
    '..AABBBBBBBBAA..',
    '...AABBBBBBAA...',
    '.....AAAAAA.....',
    '................'
)
$skyPal = New-Palette 'A=8A7462 B=C9B39A D=5E3A26 H=F2EBDF'
$sky = New-Canvas
Write-Map $sky 0 0 $plutoMap $skyPal
Save-Png $sky (Join-Path $skyDir 'pluto.png')
$written.Add('sky/pluto.png')

Write-Host "written $($written.Count) files under $OutRoot"
foreach ($rel in $written) { Write-Host "  $rel" }

if ($Credits) {
    Write-Host ''
    foreach ($rel in $written) {
        Write-Host ("| ``pack/kubejs/assets/grindless/textures/$rel`` | Generated with tools/assets/$ScriptName (procedural pixel art, original) by the uv-b1-travel agent, 2026-10-27 | the pack's licence (pending; proposed CC BY-SA 4.0) |")
    }
}
