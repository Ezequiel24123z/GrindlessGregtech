<#
.SYNOPSIS
  Review sheet for the small Steam multiblock family faces (x8, nearest neighbour). Preview only: nothing here is
  shipped.

.DESCRIPTION
  Reads the PNGs written by Build-SteamSmallFamilyTextures.ps1 and lays them out per machine: the idle face and the
  8 working frames over the bronze-plated-bricks casing, then the 8 emissive frames alone. The casing is only
  context; pass -Casing with any 16x16 PNG (e.g. GTM's machine_casing_bronze_plated_bricks.png extracted from the
  jar, kept OUTSIDE the repo) or a code-drawn stand-in is used.

  Run:  powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-SteamSmallFamilyPreview.ps1 -Out <png>
#>
[CmdletBinding()]
param(
    [string]$TexRoot = '',
    [string]$Out = '',
    [string]$Casing = '',
    [int]$Scale = 8
)
$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'Pixel.Lib.ps1')

if (-not $TexRoot) { $TexRoot = Join-Path $PSScriptRoot '..\..\pack\kubejs\assets\grindless\textures' }
$TexRoot = [System.IO.Path]::GetFullPath($TexRoot)
if (-not $Out) { $Out = Join-Path (Get-Location).Path 'steam-small-family-assets.png' }

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

# bronze-plated-bricks stand-in: courses of 4 px with offset joints, mortar lines
function New-BronzeBricks {
    $c = New-Canvas 16 16
    $l = Hex 'D8B06A'; $m = Hex 'BE9450'; $d = Hex '9A7438'; $mo = Hex '6E5020'
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

$casingImg = if ($Casing -and (Test-Path -LiteralPath $Casing)) { Read-Png $Casing } else { New-BronzeBricks }

$machines = @(
    @{ Name = 'Steam Forge Hammer'; Dir = 'steam_forge_hammer' },
    @{ Name = 'Steam Compressor'; Dir = 'steam_compressor' },
    @{ Name = 'Steam Alloy Smelter'; Dir = 'steam_alloy_smelter' },
    @{ Name = 'Steam Mixer'; Dir = 'steam_mixer' },
    @{ Name = 'Steam Chemical Bath'; Dir = 'steam_chemical_bath' },
    @{ Name = 'Steam Ore Washer'; Dir = 'steam_ore_washer' }
)

$S = $Scale
$T = 16 * $S
$gap = 6
$margin = 12
$labelH = 20
$cols = 9
$W = $margin * 2 + $cols * ($T + $gap)
$blockH = $labelH + ($T + $gap) * 2
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
    Draw-Tile (Merge-Over $casingImg $idle) $margin $yy $T
    for ($f = 0; $f -lt 8; $f++) { Draw-Tile (Merge-Over $casingImg (Get-Frame $act $f)) ($margin + ($f + 1) * ($T + $gap)) $yy $T }
    $yy += $T + $gap
    $dark = New-Canvas 16 16; for ($i = 0; $i -lt 256; $i++) { $dark.P[$i] = Hex '101216' }
    for ($f = 0; $f -lt 8; $f++) { Draw-Tile (Merge-Over $dark (Get-Frame $emi $f)) ($margin + ($f + 1) * ($T + $gap)) $yy $T }
    $y0 += $blockH
}

$g.Dispose()
$sheet.Save($Out, [System.Drawing.Imaging.ImageFormat]::Png)
$sheet.Dispose()
Write-Host "preview written to $Out"
