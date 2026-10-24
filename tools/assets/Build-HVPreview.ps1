<#
.SYNOPSIS
  Review sheet for the HV-era textures (x8, nearest neighbour). Preview only: nothing here is shipped.

.DESCRIPTION
  Reads the PNGs written by Build-HVTextures.ps1 and lays them out for review:
    - each overlay composited over the casing it was drawn for (idle, every active frame with its emissive layer),
      the raw layers on a checker (transparency check), the emissive layer alone on black, a "dark room" view
      (casing and colour layer dimmed, emissive layer at full brightness, as in a dark cave), a 3x3 wall so the face
      can be judged among its neighbours, and a casing strip with the same face on four casings (clean stainless,
      solid steel, heatproof, frost proof aluminium) because the controllers have to read on whichever one the multiblock
      uses. HV has no titanium, so the stable titanium casing is not in the strip any more;
    - the End key next to the void and flat keys it belongs with, the two catalysts, and the drill bits as a tier
      progression (bronze, steel, vanadium steel, stainless steel), each at x8 on a dark background plus 2x and 1x on a
      vanilla-slot grey.

  The casings are only context. Pass -StainlessCasing / -SteelCasing / -HeatproofCasing / -FrostproofCasing with any
  16x16 PNG (e.g. GTM's machine_casing_clean_stainless_steel.png, machine_casing_solid_steel.png,
  machine_casing_heatproof.png and machine_casing_frost_proof.png extracted from the jar, kept OUTSIDE the repo).
  Without them flat stand-ins drawn by code are used.

  Run:
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-HVPreview.ps1 -Out <png> `
      [-StainlessCasing <png>] [-SteelCasing <png>] [-HeatproofCasing <png>] [-FrostproofCasing <png>] `
      [-Scale 8] [-Section refinery,reformer,drill,greenhouse,items]
#>
[CmdletBinding()]
param(
    [string]$TexRoot = '',
    [string]$Out = '',
    [string]$StainlessCasing = '',
    [string]$SteelCasing = '',
    [string]$HeatproofCasing = '',
    [string]$FrostproofCasing = '',
    [int]$Scale = 8,
    [string[]]$Section = @()
)
$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'Pixel.Lib.ps1')

# `powershell -File ... -Section a,b` delivers "a,b" as one string: split it so both calling styles work.
$Section = @($Section | ForEach-Object { $_ -split '[,;\s]+' } | Where-Object { $_ })

if (-not $TexRoot) { $TexRoot = Join-Path $PSScriptRoot '..\..\pack\kubejs\assets\grindless\textures' }
$TexRoot = [System.IO.Path]::GetFullPath($TexRoot)
if (-not $Out) { $Out = Join-Path (Get-Location).Path 'hv-assets.png' }

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

# casing + colour layer frame + emissive layer frame, as the game shows an active machine
function Get-Lit {
    param($Casing, $Act, $Emi, [int]$Index)
    $comp = Merge-Over $Casing (Get-Frame $Act $Index)
    if ($Emi -and (Get-FrameCount $Emi) -gt $Index) { $comp = Merge-Over $comp (Get-Frame $Emi $Index) }
    return $comp
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

# ---------------------------------------------------------------- stand-in casings (only used without -StainlessCasing etc.)
# a bevelled solid casing: light rim top/left, dark rim bottom/right, a recessed panel in the middle.
# palette keys: a lit rim, b top rim, c face, d groove, e shade rim, f bottom rim, l panel, m panel stripe
function New-StandInPanel {
    param([string]$Spec)
    $c = New-Canvas 16 16
    $pal = New-Palette $Spec
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

function New-StandInSteel { return (New-StandInPanel 'a=85807B b=79756F c=6D6963 d=3D3934 e=56524D f=4A4641 l=34373C m=464A50') }
function New-StandInStainless { return (New-StandInPanel 'a=DDE1E6 b=CFD4DA c=BFC5CC d=6B727B e=98A0A9 f=868E98 l=A2AAB3 m=B2B9C1') }
function New-StandInAluminium { return (New-StandInPanel 'a=D2DEE8 b=C4D2DE c=B3C3D1 d=65798B e=8A9DAF f=788CA0 l=93A6B8 m=A3B5C5') }

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

function Get-Context {
    param([string]$Path, [scriptblock]$StandIn, [string]$Label)
    if ($Path -and (Test-Path -LiteralPath $Path)) { return @{ Canvas = (Read-Png $Path); Note = (Split-Path -Leaf $Path) } }
    return @{ Canvas = (& $StandIn); Note = "$Label stand-in drawn by code" }
}

$ctxStain = Get-Context $StainlessCasing { New-StandInStainless } 'stainless casing'
$ctxSteel = Get-Context $SteelCasing { New-StandInSteel } 'steel casing'
$ctxHeat = Get-Context $HeatproofCasing { New-StandInHeatproof } 'heatproof casing'
$ctxAlu = Get-Context $FrostproofCasing { New-StandInAluminium } 'frost proof casing'

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
$H = 4200
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
Draw-Label 'Gregtech Grindless - HV era textures (review sheet, x8 nearest neighbour)' $margin $y $true
$y += 22
Draw-Label ('Context (not shipped): ' + $ctxStain.Note + ' | ' + $ctxSteel.Note + ' | ' + $ctxHeat.Note + ' | ' + $ctxAlu.Note + '. Top-left light. Emissive layers added on top for the lit state.') $margin $y $false $true
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
            Draw-Canvas (Get-Lit $casing $act $emi $i) $x $script:y $S
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
    # + the same face on four casings (idle on top, active f2 below)
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
    $stripX = 975
    $tiles = @($ctxStain.Canvas, $ctxSteel.Canvas, $ctxHeat.Canvas, $ctxAlu.Canvas)
    for ($k = 0; $k -lt 4; $k++) {
        if ($idle) { Draw-Canvas (Merge-Over $tiles[$k] $idle) ($stripX + $k * 68) $script:y 4 }
        if ($act) { Draw-Canvas (Get-Lit $tiles[$k] $act $emi 2) ($stripX + $k * 68) ($script:y + 68) 4 }
    }
    Draw-Label 'casings: stainless | steel | heat | alu' $stripX ($script:y + 136) $false $true
    Draw-Label 'dark room (emissive at full brightness) | 3x3 wall: idle, active f2' $margin ($script:y + 48 * 3 + 1) $false $true
    $script:y += 48 * 3 + 24
}

if (Test-Section 'refinery') { Draw-Overlay-Section 'Refinery (controller face)' 'multiblock/refinery' $ctxStain 'clean stainless steel casing' }
if (Test-Section 'reformer') { Draw-Overlay-Section 'Reformer (controller face)' 'multiblock/reformer' $ctxStain 'clean stainless steel casing' }
if (Test-Section 'drill') { Draw-Overlay-Section 'HV Vein Drill (controller face)' 'multiblock/hv_vein_drill' $ctxStain 'clean stainless steel casing' }
if (Test-Section 'greenhouse') { Draw-Overlay-Section 'HV Greenhouse (controller face)' 'multiblock/hv_greenhouse' $ctxStain 'clean stainless steel casing' }

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

function Draw-Item-Row {
    param([string]$Title, [string[]]$Names)
    Draw-Label $Title $margin $script:y $true
    $script:y += $labelH + 4
    $x = $margin
    foreach ($name in $Names) {
        $c = Read-Tex "item/$name.png"
        if (-not $c) { Draw-Label "(missing $name)" $x $script:y; $x += $T + 62; continue }
        Draw-Item $c $name $x $script:y
        $x += $T + 62
    }
    $script:y += $T + 26
}

if (Test-Section 'items') {
    Draw-Item-Row 'Keys  -  item/end_key.png beside the void and flat keys it belongs with   (x8 on dark | 2x and 1x on a vanilla slot)' @('void_key', 'flat_key', 'end_key')
    Draw-Item-Row 'Catalysts  -  item/hydrotreating_catalyst.png (cobalt, molybdenum, silica) and item/reforming_catalyst.png (platinum on silica)' @('hydrotreating_catalyst', 'reforming_catalyst')
    Draw-Item-Row 'Drill bits  -  item/stainless_steel_drill_bit.png (the HV bit: HV has no titanium) after the bronze, steel and vanadium steel bits' @('bronze_drill_bit', 'steel_drill_bit', 'vanadium_steel_drill_bit', 'stainless_steel_drill_bit')
}
$g.Dispose()

$outDir = Split-Path -Parent $Out
if ($outDir -and -not (Test-Path -LiteralPath $outDir)) { New-Item -ItemType Directory -Force -Path $outDir | Out-Null }
$crop = New-Object System.Drawing.Bitmap($W, [Math]::Min($H, $script:y + $margin), [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g2 = [System.Drawing.Graphics]::FromImage($crop)
$g2.DrawImage($sheet, 0, 0, (New-Object System.Drawing.Rectangle(0, 0, $crop.Width, $crop.Height)), [System.Drawing.GraphicsUnit]::Pixel)
$g2.Dispose()
$crop.Save($Out, [System.Drawing.Imaging.ImageFormat]::Png)
$crop.Dispose(); $sheet.Dispose()
Write-Host "preview written: $Out ($W x $($script:y + $margin))"
