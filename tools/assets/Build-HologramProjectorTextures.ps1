<#
.SYNOPSIS
  Procedural 16x16 pixel art for the Hologram Projector (grindless:hologram_projector), the Steam Age multiblock helper of
  Gregtech Grindless (GregTech style: bevels, top-left light, selective outlines).

.DESCRIPTION
  Every pixel is drawn by this script (palettes + char maps); nothing is copied or edited from GregTech Modern, StructureLib or any
  other mod. Output is deterministic: re-running overwrites the same bytes.

  Writes (under pack/kubejs/assets/grindless/textures/):
    item/hologram_projector.png          a 16x64 strip of 4 frames
    item/hologram_projector.png.mcmeta   frametime 4

  A bronze Steam Age box with a pressure dial and two rivets, a dark steel lens housing on top with a cyan lens, a beam that widens
  out of the lens, and a cube of light floating above it: the hologram, its edges bright and its three visible faces tinted like lit
  glass. A bright scan line runs down the cube over the four frames and the beam flickers.

  Run from the repo root (PowerShell 5.1 blocks unsigned scripts by default; this bypass only affects that process):
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-HologramProjectorTextures.ps1
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-HologramProjectorTextures.ps1 -Credits

.PARAMETER OutRoot
  Textures root. Default: <repo>/pack/kubejs/assets/grindless/textures
.PARAMETER Credits
  Also print the CREDITS.md "Assets" table rows for the files written.
#>
[CmdletBinding()]
param(
    [string]$OutRoot = '',
    [switch]$Credits
)
$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'Pixel.Lib.ps1')

if (-not $OutRoot) { $OutRoot = Join-Path $PSScriptRoot '..\..\pack\kubejs\assets\grindless\textures' }
$OutRoot = [System.IO.Path]::GetFullPath($OutRoot)
$ScriptName = Split-Path -Leaf $PSCommandPath

$written = New-Object System.Collections.Generic.List[string]
function Out-Tex {
    param($Canvas, [string]$Rel)
    $path = Join-Path $OutRoot ($Rel -replace '/', '\')
    # an editor, indexer or virus scanner can hold a file for a moment: retry the write a few times
    for ($try = 1; $try -le 6; $try++) {
        try { Save-Png $Canvas $path; break }
        catch [System.IO.IOException] { if ($try -eq 6) { throw }; Start-Sleep -Milliseconds (250 * $try) }
    }
    $written.Add($Rel)
}

function Assert-Map {
    param([string]$Name, [string[]]$Rows, [int]$W, [int]$H)
    if ($Rows.Count -ne $H) { throw "${Name}: expected $H rows, got $($Rows.Count)" }
    for ($i = 0; $i -lt $Rows.Count; $i++) { if ($Rows[$i].Length -ne $W) { throw "${Name}: row $i has $($Rows[$i].Length) chars, expected $W" } }
}

# Like New-Palette, but a repeated letter is an error instead of a silent overwrite.
function New-Pal {
    param([string]$Spec)
    $pal = New-Object 'System.Collections.Generic.Dictionary[string,int]' ([System.StringComparer]::Ordinal)
    foreach ($tok in ($Spec -split '\s+')) {
        if ($tok -eq '') { continue }
        $kv = $tok -split '=', 2
        if ($pal.ContainsKey($kv[0])) { throw "Palette letter '$($kv[0])' defined twice" }
        $pal[$kv[0]] = Hex $kv[1]
    }
    return $pal
}

# ============================================================================================
#  PALETTE
# ============================================================================================
# bronze body (light from the top left), dark steel lens housing, cyan glass and hologram
$Pal = New-Pal @'
L=FFD98A M=E8A64A N=C9822F D=95561A E=6A3A10
r=FFE9B8 R=7A4514
w=F4EEDC n=B3261E
k=4E5560 K=2E333B s=8A939F
g=CFFFFF G=46D9F2 j=1E8FB0
h=8FF6FF u=63D3EA v=3BA9C6 x=26819E S=F2FFFF
b=3FC4E0 B=9AF4FF
'@

# ============================================================================================
#  ITEM
# ============================================================================================
# The cube: front square x4..8 y2..6, back square x6..10 y0..4, joined at the corners (only the visible edges), its three visible
# faces tinted like lit glass: top 'u', front 'v', right side 'x'.
$CubeRows = @(
    '......hhhhh.....',
    '.....huuuhh.....',
    '....hhhhhxh.....',
    '....hvvvhxh.....',
    '....hvvvhxh.....',
    '....hvvvhh......',
    '....hhhhh.......'
)
Assert-Map 'CubeRows' $CubeRows 16 7

# The beam (row 7, '*' takes the frame's beam colour) and the projector (rows 8-15): a lens in a dark steel housing on a bronze
# box with a cream pressure dial (red needle) and two rivets.
$BodyRows = @(
    '.....*****......',
    '.....kgGjk......',
    '....KksssKK.....',
    '..LLLLLLLLLLM...',
    '..LwwMMMMMMrN...',
    '..MwnMMMMMMMN...',
    '..MMMMMMMMMRD...',
    '..NDDDDDDDDDE...',
    '................'
)
Assert-Map 'BodyRows' $BodyRows 16 9

function New-ProjectorFrame {
    param([int]$Frame)
    $c = New-Canvas
    # the body first, outlined; the hologram and the beam are light, so they get no outline
    $body = New-Canvas
    $rows = @($BodyRows | ForEach-Object { $_ -replace '\*', '.' })
    Write-Map $body 0 7 $rows $Pal
    Add-Outline $body
    Merge-Canvas $c $body

    # beam: bright on even frames, dimmer on odd ones
    $beam = if (($Frame % 2) -eq 0) { $Pal['B'] } else { $Pal['b'] }
    for ($x = 5; $x -le 9; $x++) { Set-Px $c $x 7 $beam }
    # the cube, with a bright scan line on one row per frame
    $scan = @(0, 2, 4, 6)[$Frame]
    for ($y = 0; $y -lt $CubeRows.Count; $y++) {
        for ($x = 0; $x -lt 16; $x++) {
            $ch = [string]$CubeRows[$y][$x]
            if ($ch -eq '.') { continue }
            $col = $Pal[$ch]
            if ($y -eq $scan) { $col = $Pal['S'] }
            Set-Px $c $x $y $col
        }
    }
    return $c
}

$frames = @()
for ($f = 0; $f -lt 4; $f++) { $frames += , (New-ProjectorFrame $f) }
Out-Tex (Join-Frames $frames) 'item/hologram_projector.png'
Save-Mcmeta (Join-Path $OutRoot 'item\hologram_projector.png.mcmeta') 4
$written.Add('item/hologram_projector.png.mcmeta')

# ============================================================================================
#  VERIFY what was written (a 16x64 strip, binary alpha, no pure black, every frame drawn and different from the others)
# ============================================================================================
$problems = 0
foreach ($rel in $written) {
    if ($rel -like '*.mcmeta') { continue }
    $path = Join-Path $OutRoot ($rel -replace '/', '\')
    $img = Read-Png $path
    $msgs = @()
    if ($img.W -ne 16 -or $img.H -ne 64) { $msgs += "bad size $($img.W)x$($img.H) (expected a 16x64 strip)" }
    $black = 0
    $sigs = @()
    for ($f = 0; $f -lt 4; $f++) {
        $opaque = 0
        $sig = New-Object System.Text.StringBuilder
        for ($i = 0; $i -lt 256; $i++) {
            $px = $img.P[$f * 256 + $i]
            $alpha = ($px -shr 24) -band 255
            if ($alpha -ne 0 -and $alpha -ne 255) { $msgs += "partial alpha in frame $f"; break }
            if ($alpha -eq 255) {
                $opaque++
                $q = Get-Rgba $px
                if ($q[0] -eq 0 -and $q[1] -eq 0 -and $q[2] -eq 0) { $black++ }
            }
            [void]$sig.Append($px).Append(',')
        }
        if ($opaque -lt 60) { $msgs += "frame $f has only $opaque opaque pixels" }
        $sigs += $sig.ToString()
    }
    if ($black -gt 0) { $msgs += "$black pure-black px" }
    if (@($sigs | Select-Object -Unique).Count -ne 4) { $msgs += 'two frames are identical' }
    if (-not (Test-Path -LiteralPath ($path + '.mcmeta'))) { $msgs += 'no .mcmeta for the strip' }
    if ($msgs.Count -gt 0) { $problems++; Write-Warning "$rel : $($msgs -join '; ')" }
}

Write-Host "written $($written.Count) files under $OutRoot ($problems with warnings)"
foreach ($rel in $written) { Write-Host "  $rel" }

if ($Credits) {
    Write-Host ''
    foreach ($rel in $written) {
        Write-Host ("| ``pack/kubejs/assets/grindless/textures/$rel`` | Generated with tools/assets/$ScriptName (procedural pixel art, original) by the projector agent, 2026-10-25 | the pack's licence (pending; proposed CC BY-SA 4.0) |")
    }
}
if ($problems -gt 0) { exit 1 }
