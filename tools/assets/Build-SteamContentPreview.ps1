<#
.SYNOPSIS
  Review sheet for the Steam Blast Furnace and By-product Coke Battery faces (x8, nearest neighbour). Preview only:
  nothing here is shipped.

.DESCRIPTION
  Reads the PNGs written by Build-SteamContentTextures.ps1 and lays them out per machine:
    - the idle face and the 8 working frames over the controller's casing, then the 8 emissive frames alone;
    - a 3x3 wall: the working face in the middle of eight casing tiles, as it sits in the structure.
  The casings are only context. Pass -Firebricks / -CokeBricks with any 16x16 PNG (e.g. GTM's machine_primitive_bricks.png
  and machine_coke_bricks.png extracted from the jar, kept OUTSIDE the repo); without them stand-ins drawn by code are used.

  Run:  powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-SteamContentPreview.ps1 -Out <png>
#>
[CmdletBinding()]
param(
    [string]$TexRoot = '',
    [string]$Out = '',
    [string]$Firebricks = '',
    [string]$CokeBricks = '',
    [int]$Scale = 8
)
$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'Pixel.Lib.ps1')

if (-not $TexRoot) { $TexRoot = Join-Path $PSScriptRoot '..\..\pack\kubejs\assets\grindless\textures' }
$TexRoot = [System.IO.Path]::GetFullPath($TexRoot)
if (-not $Out) { $Out = Join-Path (Get-Location).Path 'steam-content-assets.png' }

function Get-Frame {
    param($Strip, [int]$Index)
    $f = New-Canvas 16 16
    [Array]::Copy($Strip.P, $Index * 256, $f.P, 0, 256)
    return $f
}

function Merge-Over {
    param($Dst, $Src)
    $o = Copy-Canvas $Dst
    for ($i = 0; $i -lt $Src.P.Length; $i++) { if ((($Src.P[$i] -shr 24) -band 255) -ne 0) { $o.P[$i] = $Src.P[$i] } }
    return $o
}

# brick wall stand-in: courses of 4 px with offset joints, mortar lines, a little top-left light per brick
function New-Bricks {
    param([string]$Light, [string]$Mid, [string]$Dark, [string]$Mortar)
    $c = New-Canvas 16 16
    $l = Hex $Light; $m = Hex $Mid; $d = Hex $Dark; $mo = Hex $Mortar
    for ($y = 0; $y -lt 16; $y++) {
        for ($x = 0; $x -lt 16; $x++) {
            $row = [int][Math]::Floor($y / 4)
            $off = if (($row % 2) -eq 0) { 0 } else { 4 }
            $bx = ($x + $off) % 8
            $by = $y % 4
            if ($by -eq 3 -or $bx -eq 7) { $col = $mo }
            elseif ($by -eq 0 -or $bx -eq 0) { $col = $l }
            elseif ($by -eq 2 -or $bx -eq 6) { $col = $d }
            else { $col = $m }
            $c.P[$y * 16 + $x] = $col
        }
    }
    return $c
}

function Get-Casing {
    param([string]$Path, $StandIn)
    if ($Path -and (Test-Path -LiteralPath $Path)) { return (Read-Png $Path) }
    return $StandIn
}

$machines = @(
    @{ Name = 'Steam Blast Furnace (on firebricks)'; Dir = 'steam_blast_furnace'
       Casing = (Get-Casing $Firebricks (New-Bricks 'E8DCC0' 'D2C2A0' 'B8A47E' '8A7A62')) },
    @{ Name = 'By-product Coke Battery (on coke oven bricks)'; Dir = 'coking_battery'
       Casing = (Get-Casing $CokeBricks (New-Bricks '8A4A34' '6E3826' '552A1C' '3A2018')) }
)

$S = $Scale
$T = 16 * $S
$gap = 6
$margin = 12
$labelH = 20
$cols = 9
$W = $margin * 2 + $cols * ($T + $gap)
$blockH = $labelH + ($T + $gap) * 2 + 3 * $T + $gap * 3
$H = $margin * 2 + $machines.Count * $blockH

$sheet = New-Object System.Drawing.Bitmap($W, $H, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [System.Drawing.Graphics]::FromImage($sheet)
$g.Clear([System.Drawing.Color]::FromArgb(255, 30, 34, 40))
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half
$font = New-Object System.Drawing.Font('Segoe UI Semibold', 11)
$brush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 220, 226, 235))

function Draw-Tile {
    param($Canvas, [int]$X, [int]$Y, [int]$Size)
    $bmp = ConvertTo-Bitmap $Canvas
    $g.DrawImage($bmp, $X, $Y, $Size, $Size)
    $bmp.Dispose()
}

$y0 = $margin
foreach ($mc in $machines) {
    $g.DrawString($mc.Name, $font, $brush, $margin, $y0)
    $idle = Read-Png (Join-Path $TexRoot "block\multiblock\$($mc.Dir)\overlay_front.png")
    $act = Read-Png (Join-Path $TexRoot "block\multiblock\$($mc.Dir)\overlay_front_active.png")
    $emi = Read-Png (Join-Path $TexRoot "block\multiblock\$($mc.Dir)\overlay_front_active_emissive.png")
    $yy = $y0 + $labelH
    Draw-Tile (Merge-Over $mc.Casing $idle) $margin $yy $T
    for ($f = 0; $f -lt 8; $f++) { Draw-Tile (Merge-Over $mc.Casing (Get-Frame $act $f)) ($margin + ($f + 1) * ($T + $gap)) $yy $T }
    $yy += $T + $gap
    $dark = New-Canvas 16 16; for ($i = 0; $i -lt 256; $i++) { $dark.P[$i] = Hex '101216' }
    for ($f = 0; $f -lt 8; $f++) { Draw-Tile (Merge-Over $dark (Get-Frame $emi $f)) ($margin + ($f + 1) * ($T + $gap)) $yy $T }
    $yy += $T + $gap
    # 3x3 wall at the frame 0, scaled to fit three tiles of the sheet
    for ($wy = 0; $wy -lt 3; $wy++) {
        for ($wx = 0; $wx -lt 3; $wx++) {
            $tile = if ($wx -eq 1 -and $wy -eq 1) { Merge-Over $mc.Casing (Get-Frame $act 0) } else { $mc.Casing }
            Draw-Tile $tile ($margin + $wx * $T) ($yy + $wy * $T) $T
        }
    }
    for ($wy = 0; $wy -lt 3; $wy++) {
        for ($wx = 0; $wx -lt 3; $wx++) {
            $tile = if ($wx -eq 1 -and $wy -eq 1) { Merge-Over $mc.Casing $idle } else { $mc.Casing }
            Draw-Tile $tile ($margin + (3 * $T + $gap * 2) + $wx * $T) ($yy + $wy * $T) $T
        }
    }
    $y0 += $blockH
}

$g.Dispose()
$sheet.Save($Out, [System.Drawing.Imaging.ImageFormat]::Png)
$sheet.Dispose()
Write-Host "preview written to $Out"
