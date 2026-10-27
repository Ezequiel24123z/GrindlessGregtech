<#
.SYNOPSIS
    UV B3: the penetrator probe (a printed frame around a GPHS module, an HPGe spectrometer and a melt head).
.EXAMPLE
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-UVPlutoIcesTextures.ps1 -Credits
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

# the penetrator, nose down: tail fins (F), the printed lattice frame (L) with the spectrometer window (S), the GPHS module glowing
# through its vents (R), the copper melt head (M) at the tip
$probeMap = @(
    '......FKKF......',
    '.....FKLLKF.....',
    '....FKLLLLKF....',
    '......KLLK......',
    '......KSSK......',
    '......KSHK......',
    '......KLLK......',
    '......KRRK......',
    '......KROK......',
    '......KRRK......',
    '......KLLK......',
    '......KMMK......',
    '......KMNK......',
    '.......MM.......',
    '.......NN.......',
    '................'
)
$probePal = New-Palette 'K=26292E F=5A6068 L=9AA3AD S=3C6E8F H=A8E0FF R=B8401E O=FF9A3C M=B8733A N=E8A86A'
$c = New-Canvas
Write-Map $c 0 0 $probeMap $probePal
Save-Png $c (Join-Path $itemDir 'penetrator_probe.png')
$written.Add('item/penetrator_probe.png')

Write-Host "written $($written.Count) files under $OutRoot"
foreach ($rel in $written) { Write-Host "  $rel" }

if ($Credits) {
    Write-Host ''
    foreach ($rel in $written) {
        Write-Host ("| ``pack/kubejs/assets/grindless/textures/$rel`` | Generated with tools/assets/$ScriptName (procedural pixel art, original) by the uv-b3-pluto-ices agent, 2026-10-28 | the pack's licence (pending; proposed CC BY-SA 4.0) |")
    }
}
