<#
.SYNOPSIS
  Review sheet for the observatory textures (x8, nearest neighbour). Preview only: nothing here is shipped.

.DESCRIPTION
  Reads the PNGs written by Build-ObservatoryTextures.ps1 and lays them out for review:
    - one row per controller face (Clockwork Observatory, Optical Observatory, Radio Telescope): the idle face on its
      casing, the eight active frames on the casing with the emissive layer on top, frame 0 in a "dark room" (casing and
      colour dimmed, emissive at full brightness) and the emissive layer alone on black;
    - the family row: the three working faces side by side on their casings, at x8 and as a 3x3 wall at x3, so the
      family can be judged changing shape and parts from era to era (docs/viaje.md);
    - the charts, from the parchment draft to the radio plot, at x8 on a dark background and at 2x and 1x on a
      vanilla-slot grey.

  The casings are only context. Pass -BronzeCasing / -SteelCasing / -FrostproofCasing with any 16x16 PNG (e.g. GTM's
  machine_casing_bronze_plated_bricks.png, machine_casing_solid_steel.png and machine_casing_frost_proof.png extracted
  from the jar, kept OUTSIDE the repo). Without them flat stand-ins drawn by code are used.

  Run:
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-ObservatoryPreview.ps1 -Out <png> `
      [-BronzeCasing <png>] [-SteelCasing <png>] [-FrostproofCasing <png>] [-Scale 8]
#>
[CmdletBinding()]
param(
    [string]$TexRoot = '',
    [string]$Out = '',
    [string]$BronzeCasing = '',
    [string]$SteelCasing = '',
    [string]$FrostproofCasing = '',
    [int]$Scale = 8
)
$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'Pixel.Lib.ps1')

if (-not $TexRoot) { $TexRoot = Join-Path $PSScriptRoot '..\..\pack\kubejs\assets\grindless\textures' }
$TexRoot = [System.IO.Path]::GetFullPath($TexRoot)
if (-not $Out) { $Out = Join-Path (Get-Location).Path 'observatory-assets.png' }

function Get-Frame {
    param($Strip, [int]$Index)
    $f = New-Canvas $Strip.W $Strip.W
    [Array]::Copy($Strip.P, $Index * $Strip.W * $Strip.W, $f.P, 0, $Strip.W * $Strip.W)
    return $f
}

function Merge-Over {
    param($Dst, $Src)
    $o = Copy-Canvas $Dst
    for ($i = 0; $i -lt $Src.P.Length; $i++) { if ((($Src.P[$i] -shr 24) -band 255) -ne 0) { $o.P[$i] = $Src.P[$i] } }
    return $o
}

function Get-Dimmed {
    param($C, [double]$F)
    $o = Copy-Canvas $C
    for ($i = 0; $i -lt $o.P.Length; $i++) { if ((($o.P[$i] -shr 24) -band 255) -ne 0) { $o.P[$i] = Shade $o.P[$i] $F } }
    return $o
}

function New-Flat {
    param([string]$Base, [string]$Line)
    $c = New-Canvas
    for ($i = 0; $i -lt 256; $i++) { $c.P[$i] = Hex $Base }
    for ($i = 0; $i -lt 16; $i++) { Set-Px $c $i 0 (Hex $Line); Set-Px $c 0 $i (Hex $Line); Set-Px $c $i 15 (Shade (Hex $Line) 0.6); Set-Px $c 15 $i (Shade (Hex $Line) 0.6) }
    return $c
}

function Get-Casing {
    param([string]$Path, [string]$Base, [string]$Line)
    if ($Path -and (Test-Path -LiteralPath $Path)) {
        $c = Read-Png $Path
        if ($c.W -ne 16) { throw "casing $Path is not 16 px wide" }
        if ($c.H -gt 16) { $c = Get-Frame $c 0 }
        return $c
    }
    return (New-Flat $Base $Line)
}

$Sheet = $null
function New-Sheet {
    param([int]$W, [int]$H)
    $script:Sheet = New-Canvas $W $H
    $bg = Hex '202428'
    $p = $script:Sheet.P
    for ($i = 0; $i -lt $p.Length; $i++) { $p[$i] = $bg }
}

function Put {
    param($C, [int]$X0, [int]$Y0, [int]$S)
    $dst = $script:Sheet.P; $dw = $script:Sheet.W
    for ($y = 0; $y -lt $C.H; $y++) { for ($x = 0; $x -lt $C.W; $x++) {
        $p = $C.P[$y * $C.W + $x]
        if ((($p -shr 24) -band 255) -eq 0) { continue }
        $base = ($Y0 + $y * $S) * $dw + $X0 + $x * $S
        for ($j = 0; $j -lt $S; $j++) { $row = $base + $j * $dw; for ($i = 0; $i -lt $S; $i++) { $dst[$row + $i] = $p } }
    } }
}

function Put-Fill {
    param([int]$X0, [int]$Y0, [int]$W, [int]$H, [string]$Color)
    Set-Rect $script:Sheet $X0 $Y0 $W $H (Hex $Color)
}

$faces = @(
    @{ Dir = 'block/multiblock/steam_observatory'; Casing = (Get-Casing $BronzeCasing 'A8743A' 'D6A060') },
    @{ Dir = 'block/multiblock/optical_observatory'; Casing = (Get-Casing $SteelCasing '6E6E6E' '9A9A9A') },
    @{ Dir = 'block/multiblock/radio_telescope'; Casing = (Get-Casing $FrostproofCasing 'A9B3BF' 'D2DAE2') }
)
$charts = @('lunar_chart_draft', 'photographic_plate', 'lunar_map', 'lunar_ephemeris', 'lunar_landing_chart')

$cell = 16 * $Scale
$gap = 8
$cols = 12
$width = $gap + $cols * ($cell + $gap)
$rowH = $cell + $gap
$height = $gap + 3 * $rowH + ($cell + $gap) + (16 * 3 * 3 + $gap) + $rowH + 2 * $gap
New-Sheet $width $height

$y = $gap
foreach ($f in $faces) {
    $idle = Read-Png (Join-Path $TexRoot "$($f.Dir)/overlay_front.png")
    $act = Read-Png (Join-Path $TexRoot "$($f.Dir)/overlay_front_active.png")
    $emi = Read-Png (Join-Path $TexRoot "$($f.Dir)/overlay_front_active_emissive.png")
    $x = $gap
    Put (Merge-Over $f.Casing $idle) $x $y $Scale
    $x += $cell + $gap
    for ($k = 0; $k -lt 8; $k++) {
        $fr = Merge-Over (Merge-Over $f.Casing (Get-Frame $act $k)) (Get-Frame $emi $k)
        Put $fr $x $y $Scale
        $x += $cell + $gap
    }
    $dark = Merge-Over (Get-Dimmed (Merge-Over $f.Casing (Get-Frame $act 0)) 0.25) (Get-Frame $emi 0)
    Put $dark $x $y $Scale
    $x += $cell + $gap
    Put-Fill $x $y $cell $cell '000000'
    Put (Get-Frame $emi 0) $x $y $Scale
    $y += $rowH
}

# family row: the three working faces at x8, then each as a 3x3 wall at x3 (frame 2)
$x = $gap
foreach ($f in $faces) {
    $act = Read-Png (Join-Path $TexRoot "$($f.Dir)/overlay_front_active.png")
    $emi = Read-Png (Join-Path $TexRoot "$($f.Dir)/overlay_front_active_emissive.png")
    Put (Merge-Over (Merge-Over $f.Casing (Get-Frame $act 2)) (Get-Frame $emi 2)) $x $y $Scale
    $x += $cell + $gap
}
$y += $cell + $gap
$x = $gap
foreach ($f in $faces) {
    $act = Read-Png (Join-Path $TexRoot "$($f.Dir)/overlay_front_active.png")
    for ($j = 0; $j -lt 3; $j++) { for ($i = 0; $i -lt 3; $i++) {
        $tile = if ($i -eq 1 -and $j -eq 1) { Merge-Over $f.Casing (Get-Frame $act 2) } else { $f.Casing }
        Put $tile ($x + $i * 48) ($y + $j * 48) 3
    } }
    $x += 3 * 48 + $gap
}
$y += 16 * 3 * 3 + $gap

# the charts: x8 on dark, then 2x and 1x on slot grey
$x = $gap
foreach ($n in $charts) {
    $c = Read-Png (Join-Path $TexRoot "item/$n.png")
    Put $c $x $y $Scale
    $x += $cell + $gap
}
foreach ($n in $charts) {
    $c = Read-Png (Join-Path $TexRoot "item/$n.png")
    Put-Fill $x $y 36 36 '8B8B8B'
    Put $c ($x + 2) ($y + 2) 2
    Put-Fill $x ($y + 40) 18 18 '8B8B8B'
    Put $c ($x + 1) ($y + 41) 1
    $x += 40 + $gap
}

Save-Png $Sheet $Out
Write-Host "preview written to $Out ($($Sheet.W)x$($Sheet.H))"
