<#
.SYNOPSIS
  Review sheet for the LV-era textures (x8, nearest neighbour). Preview only: nothing here is shipped.

.DESCRIPTION
  Reads the PNGs written by Build-LVTextures.ps1 and lays them out for review:
    - each overlay composited over the casing / hull it was drawn for (idle, every active frame with its emissive
      layer), the raw layers on a checker (transparency check), the emissive layer alone on black, a "dark room" view
      (casing and colour layer dimmed, emissive layer at full brightness, as in a dark cave) and a 3x3 wall so the
      face can be judged among its neighbours;
    - every item at x8 on a dark background plus 2x and 1x on a vanilla-slot grey;
    - the creature model frame + grayscale core tinted with a few example creature colours, as the item tint does.

  The casings are only context. Pass -SteelCasing / -HeatproofCasing / -LvHull with any 16x16 PNG (e.g. GTM's
  machine_casing_solid_steel.png, machine_casing_heatproof.png and casings/voltage/lv/side.png extracted from the jar,
  kept OUTSIDE the repo). Without them flat stand-ins drawn by code are used.

  Run:
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-LVPreview.ps1 -Out <png> `
      [-SteelCasing <png>] [-HeatproofCasing <png>] [-LvHull <png>] [-Scale 8] [-Section drill,greenhouse,arc,simulator,items,models]
#>
[CmdletBinding()]
param(
    [string]$TexRoot = '',
    [string]$Out = '',
    [string]$SteelCasing = '',
    [string]$HeatproofCasing = '',
    [string]$LvHull = '',
    [int]$Scale = 8,
    [string[]]$Section = @()
)
$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'Pixel.Lib.ps1')

# `powershell -File ... -Section a,b` delivers "a,b" as one string: split it so both calling styles work.
$Section = @($Section | ForEach-Object { $_ -split '[,;\s]+' } | Where-Object { $_ })

if (-not $TexRoot) { $TexRoot = Join-Path $PSScriptRoot '..\..\pack\kubejs\assets\grindless\textures' }
$TexRoot = [System.IO.Path]::GetFullPath($TexRoot)
if (-not $Out) { $Out = Join-Path (Get-Location).Path 'lv-assets.png' }

function Test-Section { param([string]$Id) return ($Section.Count -eq 0 -or $Section -contains $Id) }

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

# RGB * factor on every opaque pixel (night view)
function Get-Dimmed {
    param($C, [double]$Factor)
    $o = Copy-Canvas $C
    for ($i = 0; $i -lt $o.P.Length; $i++) { if ((($o.P[$i] -shr 24) -band 255) -ne 0) { $o.P[$i] = Shade $o.P[$i] $Factor } }
    return $o
}

# same tile repeated 3x3, with $Center composited over the middle one
function New-Wall {
    param($Tile, $Center)
    $w = New-Canvas 48 48
    for ($j = 0; $j -lt 3; $j++) { for ($i = 0; $i -lt 3; $i++) {
        $t = if ($i -eq 1 -and $j -eq 1) { Merge-Over $Tile $Center } else { $Tile }
        for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) { $w.P[($j * 16 + $y) * 48 + $i * 16 + $x] = $t.P[$y * 16 + $x] } }
    } }
    return $w
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

# ---------------------------------------------------------------- stand-in casings (only used without -SteelCasing etc.)
function New-StandInSteel {
    $c = New-Canvas 16 16
    $pal = New-Palette 'a=85807B b=79756F c=6D6963 d=3D3934 e=56524D f=4A4641 k=2B2D31 l=34373C m=464A50'
    for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
        $ch = 'c'
        if ($y -le 2) { $ch = 'b' } elseif ($y -ge 13) { $ch = 'f' }
        if ($x -le 1 -and $y -gt 2 -and $y -lt 13) { $ch = 'a' } elseif ($x -ge 14 -and $y -gt 2 -and $y -lt 13) { $ch = 'e' }
        if ($y -eq 3 -or $y -eq 12 -or $y -eq 15) { $ch = 'd' }
        if ($x -ge 4 -and $x -le 11 -and $y -ge 4 -and $y -le 11) { $ch = if (($x % 3) -eq 1) { 'm' } else { 'l' } }
        $c.P[$y * 16 + $x] = $pal[$ch]
    } }
    return $c
}

function New-StandInHeatproof {
    $c = New-Canvas 16 16
    $pal = New-Palette 'a=7A997E b=6C8B6D c=92B89F e=4A6143 f=546F50'
    for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
        $ch = if ((($x * 3 + $y * 5) % 7) -lt 3) { 'a' } else { 'b' }
        if (($y % 8) -eq 0) { $ch = 'c' } elseif (($y % 8) -eq 7) { $ch = 'e' }
        if ($x -eq 15) { $ch = 'f' }
        $c.P[$y * 16 + $x] = $pal[$ch]
    } }
    return $c
}

function New-StandInHull {
    $c = New-Canvas 16 16
    $pal = New-Palette 'a=6D6963 b=635F59 c=79756F d=3D3934 e=85807B f=4A4641'
    for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
        $ch = if ((($x + $y) % 6) -lt 3) { 'a' } else { 'b' }
        if ($y -eq 0 -or $y -eq 15 -or $x -eq 0 -or $x -eq 15) { $ch = 'd' }
        elseif ($y -eq 1 -or $x -eq 1) { $ch = 'e' } elseif ($y -eq 14 -or $x -eq 14) { $ch = 'f' }
        $c.P[$y * 16 + $x] = $pal[$ch]
    } }
    return $c
}

function Get-Context {
    param([string]$Path, [scriptblock]$StandIn, [string]$Label)
    if ($Path -and (Test-Path -LiteralPath $Path)) { return @{ Canvas = (Read-Png $Path); Note = (Split-Path -Leaf $Path) } }
    return @{ Canvas = (& $StandIn); Note = "$Label stand-in drawn by code" }
}

$ctxSteel = Get-Context $SteelCasing { New-StandInSteel } 'steel casing'
$ctxHeat = Get-Context $HeatproofCasing { New-StandInHeatproof } 'heatproof casing'
$ctxHull = Get-Context $LvHull { New-StandInHull } 'LV hull'

# ---------------------------------------------------------------- sheet
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

$W = [Math]::Max(1260, 2 * $margin + 9 * ($T + $gap) + 30)
$H = 3600
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
Draw-Label 'Gregtech Grindless - LV era textures (review sheet, x8 nearest neighbour)' $margin $y $true
$y += 22
Draw-Label ('Context (not shipped): ' + $ctxSteel.Note + ' | ' + $ctxHeat.Note + ' | ' + $ctxHull.Note + '. Top-left light. Emissive layers added on top for the lit state.') $margin $y $false $true
$y += 26

# ---------------------------------------------------------------- overlay sections
function Draw-Overlay-Section {
    param([string]$Title, [string]$Dir, $Context, [string]$ContextName)
    $casing = $Context.Canvas
    $idle = Read-Tex "block/$Dir/overlay_front.png"
    $act = Read-Tex "block/$Dir/overlay_front_active.png"
    $emi = Read-Tex "block/$Dir/overlay_front_active_emissive.png"
    Draw-Label "$Title  -  block/$Dir   (on $ContextName)" $margin $script:y $true
    $script:y += $labelH + 4

    # row 1: idle composite + active composite frames (with emissive)
    $x = $margin
    if ($idle) { Draw-Canvas (Merge-Over $casing $idle) $x $script:y $S } else { Draw-Label '(missing overlay_front)' $x $script:y }
    Draw-Label 'idle' $x ($script:y + $T + 1) $false $true
    $x += $T + $gap + 10
    if ($act) {
        $n = Get-FrameCount $act
        for ($i = 0; $i -lt $n; $i++) {
            $comp = Merge-Over $casing (Get-Frame $act $i)
            if ($emi -and (Get-FrameCount $emi) -gt $i) { $comp = Merge-Over $comp (Get-Frame $emi $i) }
            Draw-Canvas $comp $x $script:y $S
            Draw-Label ("active f$i") $x ($script:y + $T + 1) $false $true
            $x += $T + $gap
        }
    }
    $script:y += $T + 20

    # row 2: raw layers on a checker (transparency check), emissive layer alone on black
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

    # row 3: dark-room view (casing and colour layer dimmed, emissive at full brightness) + 3x3 wall (idle, active frame 2)
    $x = $margin
    $dim = 0.30
    $night = Get-Dimmed $casing $dim
    if ($idle) { Draw-Canvas (Merge-Over $night (Get-Dimmed $idle $dim)) $x $script:y 4 }
    $x += 16 * 4 + $gap + 10
    if ($act) {
        $n = Get-FrameCount $act
        for ($i = 0; $i -lt $n; $i++) {
            $comp = Merge-Over $night (Get-Dimmed (Get-Frame $act $i) $dim)
            if ($emi -and (Get-FrameCount $emi) -gt $i) { $comp = Merge-Over $comp (Get-Frame $emi $i) }
            Draw-Canvas $comp $x $script:y 4
            $x += 16 * 4 + 4
        }
    }
    $x += 14
    if ($idle) { Draw-Canvas (New-Wall $casing $idle) $x $script:y 3; $x += 48 * 3 + 12 }
    if ($act) {
        $f = Get-Frame $act 2
        if ($emi) { $f = Merge-Over $f (Get-Frame $emi 2) }
        Draw-Canvas (New-Wall $casing $f) $x $script:y 3
    }
    Draw-Label 'dark room (emissive at full brightness) | 3x3 wall: idle, active f2' $margin ($script:y + 48 * 3 + 1) $false $true
    $script:y += 48 * 3 + 24
}

if (Test-Section 'drill') { Draw-Overlay-Section 'LV Vein Drill (controller face)' 'multiblock/lv_vein_drill' $ctxSteel 'solid steel casing' }
if (Test-Section 'greenhouse') { Draw-Overlay-Section 'LV Greenhouse (controller face)' 'multiblock/lv_greenhouse' $ctxSteel 'solid steel casing' }
if (Test-Section 'arc') { Draw-Overlay-Section 'Submerged Arc Furnace (controller face)' 'multiblock/submerged_arc_furnace' $ctxHeat 'heatproof casing' }
if (Test-Section 'simulator') { Draw-Overlay-Section 'Creature Simulator (single-block front)' 'machines/creature_simulator' $ctxHull 'LV machine hull' }

# ---------------------------------------------------------------- items
$darkItem = New-Solid (Hex '2B2F36')
$slot2 = New-Slot 36
$slot1 = New-Slot 20

function Draw-Item {
    param($Canvas, [string]$Name, [int]$X, [int]$Y0)
    Draw-Canvas (Merge-Over $darkItem $Canvas) $X $Y0 $S
    Draw-Canvas $slot2 ($X + $T + 6) $Y0 1
    Draw-Canvas $Canvas ($X + $T + 6 + 2) ($Y0 + 2) 2
    Draw-Canvas $slot1 ($X + $T + 6 + 8) ($Y0 + 44) 1
    Draw-Canvas $Canvas ($X + $T + 6 + 10) ($Y0 + 46) 1
    Draw-Label $Name $X ($Y0 + $T + 1) $false $true
}

function Get-Tinted {
    param($Core, [string]$Hex)
    $tc = Get-Rgba (Hex $Hex)
    $t = Copy-Canvas $Core
    for ($i = 0; $i -lt $t.P.Length; $i++) {
        $p = $t.P[$i]
        if ((($p -shr 24) -band 255) -eq 0) { continue }
        $q = Get-Rgba $p
        $t.P[$i] = ConvertTo-Argb ([int][Math]::Floor($q[0] * $tc[0] / 255.0)) ([int][Math]::Floor($q[1] * $tc[1] / 255.0)) ([int][Math]::Floor($q[2] * $tc[2] / 255.0)) 255
    }
    return $t
}

if (Test-Section 'items') {
    Draw-Label 'Items  -  item/*.png   (x8 on dark | 2x and 1x on a vanilla slot)' $margin $y $true
    $y += $labelH + 4
    $x = $margin
    foreach ($name in @('graphite_electrode', 'blank_creature_model')) {
        $c = Read-Tex "item/$name.png"
        if (-not $c) { Draw-Label "(missing $name)" $x $y; $x += $T + 62; continue }
        Draw-Item $c $name $x $y
        $x += $T + 62
    }
    $y += $T + 26
}

if (Test-Section 'models') {
    Draw-Label 'Creature model  -  item/creature_model_base.png (layer0, untinted) + item/creature_model_core.png (layer1, grayscale, tinted per creature)' $margin $y $true
    $y += $labelH + 4
    $base = Read-Tex 'item/creature_model_base.png'
    $core = Read-Tex 'item/creature_model_core.png'
    if ($base -and $core) {
        $x = $margin
        Draw-Canvas (Merge-Over $darkItem $base) $x $y $S; Draw-Label 'frame alone' $x ($y + $T + 1) $false $true; $x += $T + $gap
        Draw-Canvas (Merge-Over $darkItem $core) $x $y $S; Draw-Label 'core alone (gray)' $x ($y + $T + 1) $false $true; $x += $T + $gap
        $tints = @(
            @('untinted', 'FFFFFF'), @('skeleton', 'C8CCD4'), @('spider', 'B23A3A'), @('slime', '6AD65A'),
            @('sheep', 'F2F2F2'), @('cow', 'A9703F'), @('chicken', 'F2D45A'), @('enderman', 'B26CF0')
        )
        foreach ($tint in $tints) {
            $comp = Merge-Over $base (Get-Tinted $core $tint[1])
            if (($x + $T + 50) -gt $W) { $x = $margin; $y += $T + 26 }
            Draw-Item $comp ($tint[0] + ' #' + $tint[1]) $x $y
            $x += $T + 62
            if (($x + $T + 50) -gt $W) { $x = $margin; $y += $T + 26 }
        }
        $y += $T + 26
    }
}
$g.Dispose()

$outDir = Split-Path -Parent $Out
if ($outDir -and -not (Test-Path -LiteralPath $outDir)) { New-Item -ItemType Directory -Force -Path $outDir | Out-Null }
$crop = New-Object System.Drawing.Bitmap($W, [Math]::Min($H, $y + $margin), [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g2 = [System.Drawing.Graphics]::FromImage($crop)
$g2.DrawImage($sheet, 0, 0, (New-Object System.Drawing.Rectangle(0, 0, $crop.Width, $crop.Height)), [System.Drawing.GraphicsUnit]::Pixel)
$g2.Dispose()
$crop.Save($Out, [System.Drawing.Imaging.ImageFormat]::Png)
$crop.Dispose(); $sheet.Dispose()
Write-Host "preview written: $Out ($W x $($y + $margin))"
