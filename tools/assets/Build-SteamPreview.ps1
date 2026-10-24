<#
.SYNOPSIS
  Review sheet for the steam-era textures (x8, nearest neighbour). Preview only: nothing here is shipped.

.DESCRIPTION
  Reads the PNGs written by Build-SteamTextures.ps1 and lays them out for review:
    - controller overlays composited over a bronze casing (idle, every active frame with its emissive layer,
      the raw emissive strips) so the "transparent background, details only on the overlay" rule can be judged;
    - every item at x8 on a dark background plus 1x and 2x on a vanilla-slot grey;
    - the vein sample (frame + grayscale core) tinted with a few example vein colours, as the game's item tint does.

  The casing is only context. Pass -Casing with any 16x16 PNG (e.g. GTM's machine_casing_bronze_plated_bricks.png
  extracted from the jar, kept OUTSIDE the repo). Without it a flat stand-in drawn by code is used.

  Run:  powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-SteamPreview.ps1 -Out <png> [-Casing <png>]
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
if (-not $Out) { $Out = Join-Path (Get-Location).Path 'steam-assets.png' }

# ---------------------------------------------------------------- helpers
function Get-Frame {
    param($Strip, [int]$Index)
    $f = New-Canvas $Strip.W $Strip.W
    [Array]::Copy($Strip.P, $Index * $Strip.W * $Strip.W, $f.P, 0, $Strip.W * $Strip.W)
    return $f
}

function Get-FrameCount { param($Strip) return [int]($Strip.H / $Strip.W) }

# alpha-over compositing: returns a new canvas = Src over Dst
function Merge-Over {
    param($Dst, $Src)
    $o = Copy-Canvas $Dst
    for ($i = 0; $i -lt $Src.P.Length; $i++) {
        $s = $Src.P[$i]
        $a = ($s -shr 24) -band 255
        if ($a -eq 0) { continue }
        if ($a -eq 255) { $o.P[$i] = $s; continue }
        $d = Get-Rgba $o.P[$i]; $c = Get-Rgba $s
        $t = $a / 255.0
        $o.P[$i] = ConvertTo-Argb (Get-Clamp ($d[0] + ($c[0] - $d[0]) * $t)) (Get-Clamp ($d[1] + ($c[1] - $d[1]) * $t)) (Get-Clamp ($d[2] + ($c[2] - $d[2]) * $t)) 255
    }
    return $o
}

function New-Solid { param([int]$Argb, [int]$W = 16, [int]$H = 16) $c = New-Canvas $W $H; for ($i = 0; $i -lt $c.P.Length; $i++) { $c.P[$i] = $Argb }; return $c }

function New-Checker {
    $c = New-Canvas 16 16
    $a = Hex '3C4048'; $b = Hex '4A4F58'
    for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) { $c.P[$y * 16 + $x] = if ((($x + $y) % 2) -eq 0) { $a } else { $b } } }
    return $c
}

# Vanilla inventory slot look: dark top/left, white bottom/right, 8b8b8b body.
function New-Slot {
    param([int]$Size)
    $c = New-Solid (Hex '8B8B8B') $Size $Size
    for ($i = 0; $i -lt $Size; $i++) {
        Set-Px $c $i 0 (Hex '373737'); Set-Px $c 0 $i (Hex '373737')
        Set-Px $c $i ($Size - 1) (Hex 'FFFFFF'); Set-Px $c ($Size - 1) $i (Hex 'FFFFFF')
    }
    return $c
}

function Read-Tex {
    param([string]$Rel)
    $p = Join-Path $TexRoot $Rel
    if (Test-Path -LiteralPath $p) { return (Read-Png $p) }
    return $null
}

# Stand-in bronze plate (only used when no -Casing is given).
function New-StandInCasing {
    $pal = New-Palette 'a=C99665 b=BB8E53 c=AB854C d=A47B41 e=93713B f=866732 g=775B28'
    $rows = @('aaaaaaaaaaaaaabc', 'abbbbbbbbbbbbcfg', 'abccccccccccdefg', 'abccccccccccdefg', 'abccccccccccdefg', 'abccccccccccdefg',
              'abccccccccccdefg', 'abccccccccccdefg', 'abccccccccccdefg', 'abccccccccccdefg', 'abccccccccccdefg', 'abccccccccccdefg',
              'abccccccccccdefg', 'abddddddddddeefg', 'acfffffffffffffg', 'cggggggggggggggg')
    $c = New-Canvas 16 16
    Write-Map $c 0 0 $rows $pal
    return $c
}

# ---------------------------------------------------------------- load
$casingCv = $null
if ($Casing -and (Test-Path -LiteralPath $Casing)) { $casingCv = Read-Png $Casing; $casingNote = 'casing: ' + (Split-Path -Leaf $Casing) + ' (context only, not shipped)' }
else { $casingCv = New-StandInCasing; $casingNote = 'casing: flat stand-in drawn by code' }

$S = $Scale
$T = 16 * $S            # tile size
$gap = 8
$margin = 14
$labelH = 18
$bg = [System.Drawing.Color]::FromArgb(255, 30, 34, 40)

$font = New-Object System.Drawing.Font('Segoe UI', 9)
$fontB = New-Object System.Drawing.Font('Segoe UI Semibold', 11)
$brushT = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 220, 226, 235))
$brushD = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 140, 150, 165))

# sheet size (fixed layout, see below)
$W = 1260
$H = 1500
$sheet = New-Object System.Drawing.Bitmap($W, $H, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [System.Drawing.Graphics]::FromImage($sheet)
$g.Clear($bg)
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half

function Draw-Canvas {
    param($Canvas, [int]$X, [int]$Y, [int]$Sc)
    $bmp = ConvertTo-Bitmap $Canvas
    $dest = New-Object System.Drawing.Rectangle($X, $Y, ($Canvas.W * $Sc), ($Canvas.H * $Sc))
    $g.DrawImage($bmp, $dest, 0, 0, $Canvas.W, $Canvas.H, [System.Drawing.GraphicsUnit]::Pixel)
    $bmp.Dispose()
}

function Draw-Label { param([string]$Text, [int]$X, [int]$Y, [bool]$Bold = $false, [bool]$Dim = $false)
    $f = if ($Bold) { $fontB } else { $font }
    $b = if ($Dim) { $brushD } else { $brushT }
    $g.DrawString($Text, $f, $b, [single]$X, [single]$Y)
}

$y = $margin
Draw-Label 'Gregtech Grindless - steam era textures (review sheet, x8 nearest neighbour)' $margin $y $true
$y += 22
Draw-Label ($casingNote + '. Top-left light. Overlays composited over the casing; emissive layers added on top for the lit state.') $margin $y $false $true
$y += 26

# ---------------------------------------------------------------- controller overlays
function Draw-Overlay-Section {
    param([string]$Title, [string]$Dir)
    $idle = Read-Tex "block/multiblock/$Dir/overlay_front.png"
    $act = Read-Tex "block/multiblock/$Dir/overlay_front_active.png"
    $emi = Read-Tex "block/multiblock/$Dir/overlay_front_active_emissive.png"
    $script:y += 0
    Draw-Label "$Title  -  block/multiblock/$Dir" $margin $script:y $true
    $script:y += $labelH + 4

    # row 1: idle composite + active composite frames (with emissive)
    $x = $margin
    if ($idle) { Draw-Canvas (Merge-Over $casingCv $idle) $x $script:y $S } else { Draw-Label '(missing overlay_front)' $x $script:y }
    Draw-Label 'idle' $x ($script:y + $T + 1) $false $true
    $x += $T + $gap + 10
    if ($act) {
        $n = Get-FrameCount $act
        for ($i = 0; $i -lt $n; $i++) {
            $f = Get-Frame $act $i
            $comp = Merge-Over $casingCv $f
            if ($emi -and (Get-FrameCount $emi) -gt $i) { $comp = Merge-Over $comp (Get-Frame $emi $i) }
            Draw-Canvas $comp $x $script:y $S
            Draw-Label ("active f$i") $x ($script:y + $T + 1) $false $true
            $x += $T + $gap
        }
    }
    $script:y += $T + 20

    # row 2: raw layers on a checker (transparency check): idle raw, active raw, emissive raw on dark
    $x = $margin
    $chk = New-Checker
    if ($idle) { Draw-Canvas (Merge-Over $chk $idle) $x $script:y 4 }
    $x += 16 * 4 + $gap + 10
    if ($act) {
        $n = Get-FrameCount $act
        for ($i = 0; $i -lt $n; $i++) { Draw-Canvas (Merge-Over $chk (Get-Frame $act $i)) $x $script:y 4; $x += 16 * 4 + 4 }
    }
    $x += 14
    $dark = New-Solid (Hex '0A0B0D')
    if ($emi) {
        $n = Get-FrameCount $emi
        for ($i = 0; $i -lt $n; $i++) { Draw-Canvas (Merge-Over $dark (Get-Frame $emi $i)) $x $script:y 4; $x += 16 * 4 + 4 }
    }
    Draw-Label 'raw layers (checker = transparent) | emissive layer alone on black' $margin ($script:y + 16 * 4 + 1) $false $true
    $script:y += 16 * 4 + 22
}

Draw-Overlay-Section 'Steam Vein Drill (controller face)' 'steam_vein_drill'
Draw-Overlay-Section 'Steam Greenhouse (controller face)' 'steam_greenhouse'

# ---------------------------------------------------------------- items
$itemNames = @('bronze_drill_bit', 'steel_drill_bit', 'empty_vein_probe', 'void_key', 'flat_key')
Draw-Label 'Items  -  item/*.png   (x8 on dark | 2x and 1x on a vanilla slot)' $margin $y $true
$y += $labelH + 4
$x = $margin
$darkItem = New-Solid (Hex '2B2F36')
$slot2 = New-Slot 36
$slot1 = New-Slot 20
foreach ($name in $itemNames) {
    $c = Read-Tex "item/$name.png"
    if (-not $c) { Draw-Label "(missing $name)" $x $y; $x += $T + 60; continue }
    Draw-Canvas (Merge-Over $darkItem $c) $x $y $S
    Draw-Canvas $slot2 ($x + $T + 6) $y 1
    Draw-Canvas $c ($x + $T + 6 + 2) ($y + 2) 2
    Draw-Canvas $slot1 ($x + $T + 6 + 8) ($y + 44) 1
    Draw-Canvas $c ($x + $T + 6 + 10) ($y + 46) 1
    Draw-Label $name $x ($y + $T + 1) $false $true
    $x += $T + 62
    if ($x + $T + 60 -gt $W) { $x = $margin; $y += $T + 22 }
}
$y += $T + 26

# ---------------------------------------------------------------- vein sample: frame + tinted core
Draw-Label 'Vein sample  -  item/vein_sample_frame.png (layer0, untinted) + item/vein_sample_core.png (layer1, grayscale, tinted per vein)' $margin $y $true
$y += $labelH + 4
$frame = Read-Tex 'item/vein_sample_frame.png'
$core = Read-Tex 'item/vein_sample_core.png'
if ($frame -and $core) {
    $x = $margin
    Draw-Canvas (Merge-Over $darkItem $frame) $x $y $S; Draw-Label 'frame alone' $x ($y + $T + 1) $false $true; $x += $T + $gap
    $coreView = New-Solid (Hex '2B2F36'); Draw-Canvas (Merge-Over $coreView $core) $x $y $S; Draw-Label 'core alone (gray)' $x ($y + $T + 1) $false $true; $x += $T + $gap
    $tints = @(
        @('iron',     'D8AF93'), @('copper', 'E07A3A'), @('gold',   'FFD84A'), @('lapis', '3A63D0'),
        @('redstone', 'E23B2E'), @('coal',   '55555B'), @('emerald','3DDC84')
    )
    foreach ($tint in $tints) {
        $tc = Get-Rgba (Hex $tint[1])
        $tinted = Copy-Canvas $core
        for ($i = 0; $i -lt $tinted.P.Length; $i++) {
            $p = $tinted.P[$i]
            if ((($p -shr 24) -band 255) -eq 0) { continue }
            $q = Get-Rgba $p
            $tinted.P[$i] = ConvertTo-Argb ([int][Math]::Floor($q[0] * $tc[0] / 255.0)) ([int][Math]::Floor($q[1] * $tc[1] / 255.0)) ([int][Math]::Floor($q[2] * $tc[2] / 255.0)) 255
        }
        $comp = Merge-Over $frame $tinted
        if ($x + $T -gt $W) { $x = $margin; $y += $T + 22 }
        # small ones: x8 only for the first three tints, the rest at x4 + slot previews
        Draw-Canvas (Merge-Over $darkItem $comp) $x $y $S
        Draw-Canvas $slot2 ($x + $T + 4) $y 1
        Draw-Canvas $comp ($x + $T + 6) ($y + 2) 2
        Draw-Canvas $slot1 ($x + $T + 12) ($y + 44) 1
        Draw-Canvas $comp ($x + $T + 14) ($y + 46) 1
        Draw-Label ($tint[0] + ' #' + $tint[1]) $x ($y + $T + 1) $false $true
        $x += $T + 50
    }
    $y += $T + 26
}
$g.Dispose()

$outDir = Split-Path -Parent $Out
if ($outDir -and -not (Test-Path -LiteralPath $outDir)) { New-Item -ItemType Directory -Force -Path $outDir | Out-Null }
# crop to used height
$crop = New-Object System.Drawing.Bitmap($W, [Math]::Min($H, $y + $margin), [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g2 = [System.Drawing.Graphics]::FromImage($crop)
$g2.DrawImage($sheet, 0, 0, (New-Object System.Drawing.Rectangle(0, 0, $crop.Width, $crop.Height)), [System.Drawing.GraphicsUnit]::Pixel)
$g2.Dispose()
$crop.Save($Out, [System.Drawing.Imaging.ImageFormat]::Png)
$crop.Dispose(); $sheet.Dispose()
Write-Host "preview written: $Out ($W x $($y + $margin))"
