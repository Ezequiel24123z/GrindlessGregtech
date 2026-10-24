<#
.SYNOPSIS
  Review sheet for the Moon textures (x8, nearest neighbour). Preview only: nothing here is shipped.

.DESCRIPTION
  Reads the PNGs written by Build-MoonTextures.ps1 (and, for comparison, the earlier drills and samples) and lays them out
  for review:
    - the lunar drill's face composited over the casing it was drawn for (idle, every active frame with its emissive
      layer), the raw layers on a checker (transparency check), the emissive layer alone on black, a "dark room" view
      (casing and colour layer dimmed, emissive layer at full brightness, as in a dark cave), a 3x3 wall so the face can
      be judged among its neighbours, and a casing strip with the same face on four casings (clean stainless, solid
      steel, heatproof, frost proof aluminium), because the controller has to read on whichever one the multiblock uses;
    - the drill family, idle and working, each face on its own casing (steam, LV, MV, HV and the lunar drill), at x8
      and at 1x, 2x and 3x as it shows in the world: the family has to change shape, not only colour (docs/viaje.md);
    - the lunar vein samples (frame alone, then frame + core tinted with the colours of the lunar veins, as the game draws
      them) next to the Earth vein sample with the same tints, and the lunar quantum seed (every frame of its animation)
      beside the HV bit the lunar drill drills with, each at x8 on a dark background plus 2x and 1x on a vanilla-slot grey.

  The casings are only context. Pass -StainlessCasing / -SteelCasing / -HeatproofCasing / -FrostproofCasing /
  -BronzeCasing with any 16x16 PNG (e.g. GTM's machine_casing_clean_stainless_steel.png, machine_casing_solid_steel.png,
  machine_casing_heatproof.png, machine_casing_frost_proof.png and machine_casing_bronze_plated_bricks.png extracted from
  the jar, kept OUTSIDE the repo), and -Regolith with any 16x16 lunar block (e.g. GCYR's moon_stone.png) for the ground
  the drill stands on in the family row. Without them flat stand-ins drawn by code are used.

  Run:
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-MoonPreview.ps1 -Out <png> `
      [-StainlessCasing <png>] [-SteelCasing <png>] [-HeatproofCasing <png>] [-FrostproofCasing <png>] `
      [-BronzeCasing <png>] [-Regolith <png>] [-Scale 8] [-Section drill,family,items]
#>
[CmdletBinding()]
param(
    [string]$TexRoot = '',
    [string]$Out = '',
    [string]$StainlessCasing = '',
    [string]$SteelCasing = '',
    [string]$HeatproofCasing = '',
    [string]$FrostproofCasing = '',
    [string]$BronzeCasing = '',
    [string]$Regolith = '',
    [int]$Scale = 8,
    [string[]]$Section = @()
)
$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'Pixel.Lib.ps1')

# `powershell -File ... -Section a,b` delivers "a,b" as one string: split it so both calling styles work.
$Section = @($Section | ForEach-Object { $_ -split '[,;\s]+' } | Where-Object { $_ })

if (-not $TexRoot) { $TexRoot = Join-Path $PSScriptRoot '..\..\pack\kubejs\assets\grindless\textures' }
$TexRoot = [System.IO.Path]::GetFullPath($TexRoot)
if (-not $Out) { $Out = Join-Path (Get-Location).Path 'moon-assets.png' }

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

# The game draws a tinted item layer as greys x tint colour: frame (layer 0) + core (layer 1) x vein colour.
function Get-Tinted {
    param($Frame, $Core, [int]$Tint)
    $c = Copy-Canvas $Frame
    $rgb = Get-Rgba $Tint
    for ($i = 0; $i -lt 256; $i++) {
        $p = $Core.P[$i]
        if ((($p -shr 24) -band 255) -eq 0) { continue }
        $q = Get-Rgba $p
        $c.P[$i] = ConvertTo-Argb ([int]($q[0] * $rgb[0] / 255)) ([int]($q[1] * $rgb[1] / 255)) ([int]($q[2] * $rgb[2] / 255)) 255
    }
    return $c
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
function New-StandInBronze { return (New-StandInPanel 'a=E0A050 b=D08E40 c=B87A34 d=5E3A18 e=8E5A24 f=7A4C1E l=6A4422 m=7E5228') }

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

function New-StandInRegolith {
    $c = New-Canvas 16 16
    for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
        $v = 150 + ((($x * 7 + $y * 13) * 37) % 29) - 14
        $c.P[$y * 16 + $x] = ConvertTo-Argb $v $v ($v - 4) 255
    } }
    return $c
}

function Get-Context {
    param([string]$Path, [scriptblock]$StandIn, [string]$Label)
    if ($Path -and (Test-Path -LiteralPath $Path)) {
        $cv = Read-Png $Path
        if ($cv.H -gt $cv.W) { $cv = Get-Frame $cv 0 }
        return @{ Canvas = $cv; Note = (Split-Path -Leaf $Path) }
    }
    return @{ Canvas = (& $StandIn); Note = "$Label stand-in drawn by code" }
}

$ctxStain = Get-Context $StainlessCasing { New-StandInStainless } 'stainless casing'
$ctxSteel = Get-Context $SteelCasing { New-StandInSteel } 'steel casing'
$ctxHeat = Get-Context $HeatproofCasing { New-StandInHeatproof } 'heatproof casing'
$ctxAlu = Get-Context $FrostproofCasing { New-StandInAluminium } 'frost proof casing'
$ctxBronze = Get-Context $BronzeCasing { New-StandInBronze } 'bronze casing'
$ctxRegolith = Get-Context $Regolith { New-StandInRegolith } 'regolith'

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
Draw-Label 'Gregtech Grindless - the Moon (end of HV): textures (review sheet, x8 nearest neighbour)' $margin $y $true
$y += 22
Draw-Label ('Context (not shipped): ' + $ctxStain.Note + ' | ' + $ctxSteel.Note + ' | ' + $ctxHeat.Note + ' | ' + $ctxAlu.Note + ' | ' + $ctxBronze.Note + ' | ' + $ctxRegolith.Note + '. Top-left light. Emissive layers added on top for the lit state.') $margin $y $false $true
$y += 26

# ---------------------------------------------------------------- overlay section
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

if (Test-Section 'drill') { Draw-Overlay-Section 'Lunar Drill (controller face)' 'multiblock/lunar_drill' $ctxStain 'clean stainless steel casing' }

# ---------------------------------------------------------------- the drill family: shape changes era by era
if (Test-Section 'family') {
    Draw-Label 'The drill family  -  steam, LV, MV, HV and the lunar drill, each on its own casing (idle above, working f2 below; x8, then 3x, 2x and 1x)' $margin $y $true
    $y += $labelH + 4
    $family = @(
        @('steam_vein_drill', $ctxBronze.Canvas, 'steam: bronze tower'),
        @('lv_vein_drill', $ctxSteel.Canvas, 'LV: steel lattice'),
        @('mv_vein_drill', $ctxAlu.Canvas, 'MV: aluminium tower'),
        @('hv_vein_drill', $ctxStain.Canvas, 'HV: stainless derrick'),
        @('lunar_drill', $ctxStain.Canvas, 'Moon: lander drill')
    )
    $x = $margin
    $colW = $T + 48 + 32 + 16 + 3 * $gap + 6
    foreach ($fm in $family) {
        $idle = Read-Tex "block/multiblock/$($fm[0])/overlay_front.png"
        $act = Read-Tex "block/multiblock/$($fm[0])/overlay_front_active.png"
        $emi = Read-Tex "block/multiblock/$($fm[0])/overlay_front_active_emissive.png"
        if (-not $idle -or -not $act) { Draw-Label "(missing $($fm[0]))" $x $y; $x += $colW; continue }
        $iComp = Merge-Over $fm[1] $idle
        $aComp = Get-Lit $fm[1] $act $emi 2
        Draw-Canvas $iComp $x $y $S
        Draw-Canvas $aComp $x ($y + $T + 6) $S
        $sx = $x + $T + $gap
        foreach ($pair in @(@($iComp, 0), @($aComp, ($T + 6)))) {
            Draw-Canvas $pair[0] $sx ($y + $pair[1]) 3
            Draw-Canvas $pair[0] ($sx + 48 + $gap) ($y + $pair[1]) 2
            Draw-Canvas $pair[0] ($sx + 48 + 32 + 2 * $gap) ($y + $pair[1]) 1
        }
        Draw-Label $fm[2] $x ($y + 2 * $T + 8) $false $true
        $x += $colW
    }
    $y += 2 * $T + 30
    # the lunar drill among regolith blocks: the multiblock stands on the Moon
    $ld = Read-Tex 'block/multiblock/lunar_drill/overlay_front_active.png'
    $le = Read-Tex 'block/multiblock/lunar_drill/overlay_front_active_emissive.png'
    if ($ld) {
        $wall = New-Canvas 80 48
        for ($j = 0; $j -lt 3; $j++) { for ($i = 0; $i -lt 5; $i++) {
            $tile = if ($j -eq 2 -or $i -eq 0 -or $i -eq 4) { $ctxRegolith.Canvas } else { $ctxStain.Canvas }
            if ($j -eq 1 -and $i -eq 2) { $tile = Get-Lit $ctxStain.Canvas $ld $le 2 }
            for ($yy = 0; $yy -lt 16; $yy++) { for ($xx = 0; $xx -lt 16; $xx++) { $wall.P[($j * 16 + $yy) * 80 + $i * 16 + $xx] = $tile.P[$yy * 16 + $xx] } }
        } }
        Draw-Canvas $wall $margin $y 4
        Draw-Canvas (Get-Dimmed $wall 0.55) ($margin + 80 * 4 + 16) $y 4
        Draw-Label 'the working lunar drill in a stainless wall over regolith (daylight | shade)' $margin ($y + 48 * 4 + 2) $false $true
        $y += 48 * 4 + 24
    }
}

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

if (Test-Section 'items') {
    # the two lunar veins with the display tints of veins_moon.json, and GTM's own ilmenite colour (too dark for a tint)
    $tints = @(@('6E6A5E', 'ilmenite_moon'), @('8E8E86', 'regolith_moon'), @('2B2A24', 'GTM ilmenite colour'))
    foreach ($set in @(@('lunar_vein_sample_frame', 'lunar_vein_sample_core', 'Lunar vein samples  -  item/lunar_vein_sample_frame.png (untinted) + item/lunar_vein_sample_core.png (tinted per vein, as the game draws them)'),
                       @('vein_sample_frame', 'vein_sample_core', 'The Earth vein sample they belong with (item/vein_sample_frame + item/vein_sample_core), same tints'))) {
        $fr = Read-Tex "item/$($set[0]).png"; $co = Read-Tex "item/$($set[1]).png"
        Draw-Label $set[2] $margin $y $true
        $y += $labelH + 4
        $x = $margin
        if ($fr) { Draw-Item $fr ($set[0] -replace '_frame$', ' (frame)') $x $y; $x += $T + 62 }
        if ($fr -and $co) {
            foreach ($tn in $tints) { Draw-Item (Get-Tinted $fr $co (Hex $tn[0])) $tn[1] $x $y; $x += $T + 62 }
        }
        $y += $T + 26
    }
    # the quantum seed is animated: frame 0 at x8 with the slot views, then every frame at x4
    $seed = Read-Tex 'item/lunar_quantum_seed.png'
    Draw-Label 'Lunar quantum seed  -  item/lunar_quantum_seed.png (+ .mcmeta: 8 frames, frametime 3), and the HV bit the lunar drill drills with (dry)' $margin $y $true
    $y += $labelH + 4
    $x = $margin
    if ($seed) {
        Draw-Item (Get-Frame $seed 0) 'lunar_quantum_seed (f0)' $x $y
        $x += $T + 62
        $n = Get-FrameCount $seed
        for ($i = 0; $i -lt $n; $i++) {
            $fx = $x + ($i % 4) * (16 * 4 + 4); $fy = $y + [Math]::Floor($i / 4) * (16 * 4 + 4)
            Draw-Canvas (Merge-Over $darkItem (Get-Frame $seed $i)) $fx $fy 4
        }
        $x += 4 * (16 * 4 + 4) + 20
    } else { Draw-Label '(missing lunar_quantum_seed)' $x $y; $x += $T + 62 }
    $bit = Read-Tex 'item/stainless_steel_drill_bit.png'
    if ($bit) { Draw-Item $bit 'stainless_steel_drill_bit' $x $y }
    $y += $T + 26
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
