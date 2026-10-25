<#
.SYNOPSIS
  Procedural 16x16 pixel art for the EV Sealed Dome of Gregtech Grindless (GregTech style: bevels, top-left light, every pixel
  fully opaque or fully transparent).

.DESCRIPTION
  Every pixel is drawn by this script (palettes + char maps + small routines); nothing is copied or edited from GregTech Modern,
  GregTech Leisure or any other mod. Output is deterministic: re-running overwrites the same bytes. Same method, neutral steel ramp,
  EV window frame, purple accents and checks as the EV faces (Build-EVTextures.ps1) and the generator array
  (Build-GeneratorArrayTextures.ps1); the helpers are copied so those scripts stay untouched.

  Writes (under pack/kubejs/assets/grindless/textures/):
    block/multiblock/sealed_dome/overlay_front.png, overlay_front_active.png(+.mcmeta), overlay_front_active_emissive.png(+.mcmeta)

  The face is the EV window frame with the greenhouse behind its window: a small dome of tempered glass (lit along its upper-left
  edge) standing on a strip of dark soil, an LED bar under its cap and three young plants growing in the soil (a bush, a stalk and a
  sprout). The base strip carries the purple EV stripes and the status lamp. 8 frames, frametime 4: the LEDs shimmer and light the
  top of the dome, the leaves sway by a pixel, O2 bubbles rise from the leaves between the plants and a glint slides over the
  glass. Idle: dark LEDs, dimmer plants, no bubbles and the red lamp.

  Run from the repo root (PowerShell 5.1 blocks unsigned scripts by default; this bypass only affects that process):
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-SealedDomeTextures.ps1
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-SealedDomeTextures.ps1 -Preview C:\path\sealed_dome.png -Casing pack\kubejs\assets\grindless\textures\block\sintered_regolith.png
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-SealedDomeTextures.ps1 -Credits

  Overlay conventions (GTM's workable casings, as every other set): transparent background, details only on the overlay, animated
  variants are vertical 16x(16*n) strips with a .png.mcmeta, *_emissive layers hold only the pixels that glow (identical to the colour
  layer). The outer 1 px ring is always left empty so the casing shows around the face.
  Drawn for grindless:block/sintered_regolith, the calm grey-brown lunar brick of the dome's ring (the controller's
  workableCasingModel, startup_scripts/grindless/ev/sealed_dome.js); the face has its own dark frame, so it reads on any casing.

.PARAMETER OutRoot
  Textures root. Default: <repo>/pack/kubejs/assets/grindless/textures
.PARAMETER Preview
  Also write a review sheet (nearest neighbour, x6) to this PNG: the face on the casing (idle, every active frame with its emissive
  layer, a dark-room view) and the controller in a 3x3 wall of casing, idle and working. Preview only: never shipped.
.PARAMETER Casing
  Optional 16x16 PNG used as the casing in the preview (for example pack/kubejs/assets/grindless/textures/block/sintered_regolith.png).
  Without it, a plain grey-brown brick drawn by code is used.
.PARAMETER Credits
  Also print the CREDITS.md "Assets" table rows for the files written.
#>
[CmdletBinding()]
param(
    [string]$OutRoot = '',
    [string]$Preview = '',
    [string]$Casing = '',
    [switch]$Credits
)
$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'Pixel.Lib.ps1')

if (-not $OutRoot) { $OutRoot = Join-Path $PSScriptRoot '..\..\pack\kubejs\assets\grindless\textures' }
$OutRoot = [System.IO.Path]::GetFullPath($OutRoot)
$ScriptName = Split-Path -Leaf $PSCommandPath

$written = New-Object System.Collections.Generic.List[string]
function Out-Tex {
    param($Canvas, [string]$Rel, [int]$FrameTime = 0)
    $path = Join-Path $OutRoot ($Rel -replace '/', '\')
    # an editor, indexer or virus scanner can hold a file for a moment: retry the write a few times
    for ($try = 1; $try -le 6; $try++) {
        try { Save-Png $Canvas $path; if ($FrameTime -gt 0) { Save-Mcmeta ($path + '.mcmeta') $FrameTime }; break }
        catch [System.IO.IOException] { if ($try -eq 6) { throw }; Start-Sleep -Milliseconds (250 * $try) }
    }
    $written.Add($Rel)
    if ($FrameTime -gt 0) { $written.Add($Rel + '.mcmeta') }
}

function Assert-Map {
    param([string]$Name, [string[]]$Rows, [int]$W = 16, [int]$H = 16)
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

# Sets a pixel on the colour layer and on the emissive layer (the emissive layer may only hold what the colour layer holds).
function Set-Both {
    param($C, $E, [int]$X, [int]$Y, [int]$Argb)
    Set-Px $C $X $Y $Argb; Set-Px $E $X $Y $Argb
}

# An emissive pixel only counts while the colour layer still shows it: drops the ones a later draw covered
# (-Verbose lists how many, to catch a glow that was covered by accident).
function Sync-Emissive {
    param($C, $E)
    $dropped = 0
    for ($i = 0; $i -lt $E.P.Length; $i++) { if ($E.P[$i] -ne 0 -and $E.P[$i] -ne $C.P[$i]) { $E.P[$i] = 0; $dropped++ } }
    if ($dropped -gt 0) { Write-Verbose "Sync-Emissive: $dropped emissive pixel(s) covered by a later draw" }
}

# Neutral steel ramp shared by every overlay (same letters and values as Build-EVTextures.ps1: lit -> dark).
$SteelSpec = 'A=D3D3D3 B=B0B0B0 C=8E8E8E D=707070 E=565656 F=404040 G=2F2F2F H=222222 I=161616 J=0D0D0D'
# EV tier purple, lit -> dark (stripes, LEDs).
$PurpleSpec = 'a=F3E4FF b=D6B0FF c=B07AF0 d=8A4CD0 e=5C2E9C f=381C64 g=1C0E36'
# Clean stainless steel (cooler and brighter than the neutral steel), lit -> dark: the dome's glass.
$StainSpec = '0=F7FAFF 1=DCE5F0 2=B8C6D8 3=8E9DB2 4=667690 5=465470 6=2C364C'
# State lamp: green while working (M..P), red while idle (Q..S).
$LampSpec = 'M=E2FFE4 N=62FF86 O=22C257 P=0C6B2E Q=FF5A48 R=B52D22 S=5E1511'

# Frame shared by the EV faces with a free-form window: 1 px empty ring, steel bezel, dark window x3..13 y3..12.
$WindowBase = @(
    '................',
    '.CDDDDDDDDDDDDE.',
    '.DGGGGGGGGGGGGF.',
    '.DGIIIIIIIIIIIF.',
    '.DGIIIIIIIIIIIF.',
    '.DGIIIIIIIIIIIF.',
    '.DGIIIIIIIIIIIF.',
    '.DGIIIIIIIIIIIF.',
    '.DGIIIIIIIIIIIF.',
    '.DGIIIIIIIIIIIF.',
    '.DGIIIIIIIIIIIF.',
    '.DGIIIIIIIIIIIF.',
    '.DGIIIIIIIIIIIF.',
    '.DGGGGGGGGGGGGF.',
    '.EFFFFFFFFFFFFG.',
    '................'
)
Assert-Map 'WindowBase' $WindowBase

# ============================================================================================
#  SEALED DOME - controller face (sintered regolith brick)
#  a glass dome (x3..13, y4..10) on a strip of dark soil (y11..12): an LED bar under its cap (y5), three young plants growing in
#  the soil with a free column between each two (x6, x10) where the O2 bubbles rise; purple stripes and the state lamp at the base
# ============================================================================================
# k..o leaves and stems (lit -> dark); p..s soil (lit -> dark); t the dark glass inside the dome, u/v the LED light pooling under
# the cap; x/y the LEDs switched off; z/K an O2 bubble (core, rim); w the glint on the glass.
$SdPal = New-Pal ($SteelSpec + ' ' + $PurpleSpec + ' ' + $StainSpec + ' ' + $LampSpec + ' ' + @'
k=D6F57E l=9CD84C m=66B43C n=408A30 o=2C6428
p=6C4C30 q=523823 r=3B2818 s=2B1C11
t=1E2534 u=3D3563 v=2D2B4A
x=4E4664 y=393350
z=C6F6FF K=8FDDEB
w=FFFFFF
'@)

# The window's contents, drawn from (3, 3): '.' keeps the dark window. The dome's rim is 1 px of glass lit along its upper-left
# arc (0, 1) and shaded on its lower-right one (4, 5); t is the inside of the dome; two rows of soil under it, lit from the top.
$SdDome = @(
    '...........',
    '...01123...',
    '..0ttttt3..',
    '.0ttttttt4.',
    '.0ttttttt4.',
    '1ttttttttt4',
    '1ttttttttt5',
    '2ttttttttt5',
    'pqppqpqpqqq',
    'rsrrsrsrrss'
)
Assert-Map 'SdDome' $SdDome 11 10

# The rim of the dome, bottom-left -> over the cap -> bottom-right: the path of the glint.
$SdRim = @(@(3, 10), @(3, 9), @(3, 8), @(4, 7), @(4, 6), @(5, 5), @(6, 4), @(7, 4), @(8, 4), @(9, 4), @(10, 4), @(11, 5), @(12, 6),
           @(12, 7), @(13, 8), @(13, 9), @(13, 10))

# Plant pixels (x, y, colour, 1 = the tip that leans with the sway, 0 = planted). Lit from the top-left like everything else.
$SdBush = @(@(5, 7, 'k', 1), @(4, 8, 'k', 0), @(5, 8, 'l', 0), @(4, 9, 'm', 0), @(5, 9, 'o', 0), @(5, 10, 'n', 0))
$SdStalk = @(@(8, 6, 'k', 1), @(7, 7, 'l', 0), @(8, 7, 'm', 0), @(8, 8, 'm', 0), @(9, 8, 'n', 0), @(7, 9, 'l', 0), @(8, 9, 'n', 0),
             @(8, 10, 'n', 0))
$SdSprout = @(@(12, 8, 'k', 1), @(11, 9, 'l', 0), @(12, 9, 'm', 0), @(11, 10, 'n', 0))
# The sway (one 8-frame loop) and the bubble columns between the plants: [x, frame offset].
$SdSway = @(0, 1, 1, 0, 0, -1, -1, 0)
$SdBubbles = @(@(6, 0), @(10, 2))

# A pixel of the dome's inside (where a swaying leaf may go).
function Test-SdInside {
    param([int]$X, [int]$Y)
    if ($X -lt 3 -or $X -gt 13 -or $Y -lt 3 -or $Y -gt 12) { return $false }
    return ([string]$SdDome[$Y - 3][$X - 3] -eq 't')
}

function New-SealedDomeFrame {
    param([bool]$Active, [int]$T = 0)
    $c = New-Canvas; $e = New-Canvas
    $P = $SdPal
    Write-Map $c 0 0 $WindowBase $P
    Write-Map $c 3 3 $SdDome $P

    # ---- the LED bar under the cap (y5, x6..10, deeper purple at its ends): a highlight runs along it while it works, and its
    #      light pools under the cap
    for ($x = 6; $x -le 10; $x++) {
        $end = ($x -eq 6 -or $x -eq 10)
        if ($Active) { Set-Both $c $e $x 5 $P[$(if ($end) { 'c' } elseif ((($x + $T) % 4) -eq 0) { 'a' } else { 'b' })] }
        else { Set-Px $c $x 5 $P[$(if ($end) { 'y' } else { 'x' })] }
    }
    if ($Active) {
        foreach ($x in 5..11) { Set-Px $c $x 6 $P[$(if ($x -eq 5 -or $x -eq 11) { 'v' } else { 'u' })] }
        foreach ($x in 6..10) { Set-Px $c $x 7 $P['v'] }
    }

    # ---- the plants: dimmer while the LEDs are off; the leaf tips lean with the sway (never onto the glass)
    $o = 0; if ($Active) { $o = $SdSway[$T % 8] }
    foreach ($plant in @($SdBush, $SdStalk, $SdSprout)) {
        foreach ($px in $plant) {
            $col = $P[[string]$px[2]]
            if (-not $Active) { $col = Shade $col 0.75 }
            $x = $px[0] + $px[3] * $o
            if (-not (Test-SdInside $x $px[1])) { $x = $px[0] }
            Set-Px $c $x $px[1] $col
        }
    }

    if ($Active) {
        # ---- O2 bubbles rise between the plants (one column two frames behind the other) and burst in the light under the cap
        foreach ($b in $SdBubbles) {
            $k = ($T + $b[1]) % 4
            if ($k -lt 3) { Set-Both $c $e $b[0] (9 - $k) $P[$(if ($k -eq 0) { 'K' } else { 'z' })] }
        }
        # ---- a glint slides over the glass, from the bottom-left over the cap to the bottom-right
        $g = $SdRim[(2 * $T + 1) % $SdRim.Count]
        Set-Px $c $g[0] $g[1] $P['w']
    }

    # ---- base strip (y13): purple stripes x3..9, the state lamp x11..13
    foreach ($x in 3..9) {
        if (($x % 4) -lt 2) {
            if ($Active) { Set-Both $c $e $x 13 $P['c'] } else { Set-Px $c $x 13 $P['e'] }
        } else { Set-Px $c $x 13 $P['g'] }
    }
    if ($Active) {
        $core = if (($T % 4) -lt 2) { 'M' } else { 'N' }
        Set-Both $c $e 11 13 $P[$core]; Set-Both $c $e 12 13 $P['N']; Set-Both $c $e 13 13 $P['O']
    } else {
        Set-Px $c 11 13 $P['Q']; Set-Px $c 12 13 $P['R']; Set-Px $c 13 13 $P['S']
    }

    Sync-Emissive $c $e
    return @{ Color = $c; Emi = $e }
}

# ============================================================================================
#  BUILD
# ============================================================================================
function Out-Overlay {
    param([string]$Dir, $Builder, [int]$FrameTime)
    $frames = @(); $emis = @()
    for ($f = 0; $f -lt 8; $f++) { $r = & $Builder $true $f; $frames += $r.Color; $emis += $r.Emi }
    $idle = & $Builder $false 0
    Out-Tex $idle.Color "$Dir/overlay_front.png"
    Out-Tex (Join-Frames $frames) "$Dir/overlay_front_active.png" $FrameTime
    Out-Tex (Join-Frames $emis) "$Dir/overlay_front_active_emissive.png" $FrameTime
}

Out-Overlay 'block/multiblock/sealed_dome' ${function:New-SealedDomeFrame} 4

# ============================================================================================
#  VERIFY what was written (size, binary alpha, no pure black, mcmeta vs frames, empty casing ring, emissive subset,
#  animation that really animates) - the checks of the EV set
# ============================================================================================
$problems = 0
foreach ($rel in $written) {
    if ($rel.EndsWith('.mcmeta')) { continue }
    $path = Join-Path $OutRoot ($rel -replace '/', '\')
    $img = Read-Png $path
    $msgs = @()
    if ($img.W -ne 16 -or ($img.H % 16) -ne 0) { $msgs += "bad size $($img.W)x$($img.H)" }
    $opaque = 0; $black = 0
    foreach ($px in $img.P) {
        $alpha = ($px -shr 24) -band 255
        if ($alpha -ne 0 -and $alpha -ne 255) { $msgs += 'partial alpha'; break }
        if ($alpha -eq 255) {
            $opaque++
            if (($px -band 0xFFFFFF) -eq 0) { $black++ }
        }
    }
    if ($opaque -eq 0) { $msgs += 'fully transparent' }
    if ($black -gt 0) { $msgs += "$black pure-black px" }
    $n = [int][Math]::Floor($img.H / 16)
    if (Test-Path -LiteralPath ($path + '.mcmeta')) {
        if ($n -lt 4 -or $n -gt 8) { $msgs += "animation has $n frames (expected 4-8)" }
        $meta = [System.IO.File]::ReadAllText($path + '.mcmeta')
        if ($meta -notmatch '"frametime"\s*:\s*[1-9]') { $msgs += 'mcmeta without a frametime' }
        if ($rel -notlike '*_emissive.png') {
            $seen = @{}
            for ($f = 0; $f -lt $n; $f++) { $seen[(($img.P[($f * 256)..($f * 256 + 255)]) -join ',')] = 1 }
            if ($seen.Count -lt 4) { $msgs += "only $($seen.Count) distinct frames out of $n" }
        }
    } elseif ($n -gt 1) { $msgs += "a $n-frame strip without its .mcmeta" }
    for ($f = 0; $f -lt $n; $f++) { for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
        if ($x -lt 1 -or $y -lt 1 -or $x -ge 15 -or $y -ge 15) {
            if ((($img.P[($f * 16 + $y) * 16 + $x] -shr 24) -band 255) -ne 0) { $msgs += "opaque pixel in the casing ring (frame $f, $x,$y)"; $f = $n; $y = 16; break }
        }
    } } }
    # an emissive layer may only contain pixels that exist, identical, in the colour layer
    if ($rel -like '*_active_emissive.png') {
        $colorPath = Join-Path $OutRoot (($rel -replace '_emissive\.png$', '.png') -replace '/', '\')
        $color = Read-Png $colorPath
        if ($color.H -ne $img.H) { $msgs += 'emissive strip height differs from the colour strip' }
        else {
            for ($i = 0; $i -lt $img.P.Length; $i++) {
                if ((($img.P[$i] -shr 24) -band 255) -ne 0 -and $img.P[$i] -ne $color.P[$i]) { $msgs += 'emissive pixel not present in colour layer'; break }
            }
        }
    }
    if ($msgs.Count -gt 0) { $problems++; Write-Warning "$rel : $($msgs -join '; ')" }
}

Write-Host "written $($written.Count) files under $OutRoot ($problems with warnings)"
foreach ($rel in $written) { Write-Host "  $rel" }

# ============================================================================================
#  PREVIEW (optional, never shipped)
# ============================================================================================
if ($Preview) {
    # a plain grey-brown brick wall standing in for the sintered regolith when no -Casing is given: two courses, the lower one
    # offset by half a brick, each brick lit on its top-left and with its mortar joint on the bottom-right
    function New-StandInRegolith {
        $c = New-Canvas 16 16
        $pal = New-Palette 'a=A29C90 b=868074 c=67625A d=48443E'
        for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
            $bx = if ($y -lt 8) { $x % 8 } else { ($x + 4) % 8 }
            $by = $y % 8
            $ch = 'b'
            if ($bx -eq 7 -or $by -eq 7) { $ch = 'd' } elseif ($bx -eq 6 -or $by -eq 6) { $ch = 'c' } elseif ($bx -eq 0 -or $by -eq 0) { $ch = 'a' }
            $c.P[$y * 16 + $x] = $pal[$ch]
        } }
        return $c
    }
    function Get-Frame { param($Strip, [int]$Index) $f = New-Canvas 16 16; [Array]::Copy($Strip.P, $Index * 256, $f.P, 0, 256); return $f }
    function Merge-On { param($Dst, $Src) $o = Copy-Canvas $Dst; Merge-Canvas $o $Src; return $o }
    function Get-Dark {
        param($Base, $Col, $Emi)
        $o = Merge-On $Base $Col
        for ($i = 0; $i -lt $o.P.Length; $i++) { $o.P[$i] = Shade $o.P[$i] 0.25 }
        return (Merge-On $o $Emi)
    }
    $casingTex = if ($Casing) { Read-Png ([System.IO.Path]::GetFullPath($Casing)) } else { New-StandInRegolith }
    $dir = Join-Path $OutRoot 'block\multiblock\sealed_dome'
    $idle = Read-Png (Join-Path $dir 'overlay_front.png')
    $act = Read-Png (Join-Path $dir 'overlay_front_active.png')
    $emi = Read-Png (Join-Path $dir 'overlay_front_active_emissive.png')
    $tiles = New-Object System.Collections.Generic.List[object]
    $tiles.Add((Merge-On $casingTex $idle))
    for ($f = 0; $f -lt 8; $f++) { $tiles.Add((Merge-On (Merge-On $casingTex (Get-Frame $act $f)) (Get-Frame $emi $f))) }
    $tiles.Add((Get-Dark $casingTex (Get-Frame $act 0) (Get-Frame $emi 0)))

    # 1x sheet: the tiles in a row, and under them the controller in a 3x3 wall of casing, idle and working
    $gap = 2
    $sw = $gap + $tiles.Count * (16 + $gap); $sh = $gap + 16 + $gap + 48 + $gap
    $sheet = New-Canvas $sw $sh
    for ($i = 0; $i -lt $sheet.P.Length; $i++) { $sheet.P[$i] = Hex '202428' }
    function Put-Tile { param($Tile, [int]$X0, [int]$Y0) for ($y = 0; $y -lt 16; $y++) { [Array]::Copy($Tile.P, $y * 16, $sheet.P, ($Y0 + $y) * $sw + $X0, 16) } }
    for ($t = 0; $t -lt $tiles.Count; $t++) { Put-Tile $tiles[$t] ($gap + $t * (16 + $gap)) $gap }
    $wy = $gap + 16 + $gap
    $k = 0
    foreach ($center in @($tiles[0], $tiles[1])) {
        $wx = $gap + $k * (48 + 2 * $gap)
        for ($j = 0; $j -lt 3; $j++) { for ($i = 0; $i -lt 3; $i++) {
            $tile = if ($i -eq 1 -and $j -eq 1) { $center } else { $casingTex }
            Put-Tile $tile ($wx + 16 * $i) ($wy + 16 * $j)
        } }
        $k++
    }
    # nearest-neighbour upscale and save through GDI+: the sheet is never shipped, so it needs neither the byte-exact writer nor its
    # read-back check, which take minutes on a sheet this size
    $scale = 6
    $fmt = [System.Drawing.Imaging.PixelFormat]::Format32bppArgb
    $small = ConvertTo-Bitmap $sheet
    $big = New-Object System.Drawing.Bitmap -ArgumentList ($sw * $scale), ($sh * $scale), $fmt
    $gfx = [System.Drawing.Graphics]::FromImage($big)
    $gfx.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
    $gfx.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half
    $gfx.DrawImage($small, 0, 0, $sw * $scale, $sh * $scale)
    $gfx.Dispose(); $small.Dispose()
    $previewPath = [System.IO.Path]::GetFullPath($Preview)
    $previewDir = Split-Path -Parent $previewPath
    if ($previewDir -and -not (Test-Path -LiteralPath $previewDir)) { New-Item -ItemType Directory -Force -Path $previewDir | Out-Null }
    $big.Save($previewPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $big.Dispose()
    Write-Host "preview: $Preview (idle, 8 active frames with emissive, dark room, then a 3x3 wall idle and working)"
}

if ($Credits) {
    Write-Host ''
    foreach ($rel in $written) {
        Write-Host ("| ``pack/kubejs/assets/grindless/textures/$rel`` | Generated with tools/assets/$ScriptName (procedural pixel art, original) by the sealed dome agent, 2026-10-25 | the pack's licence (pending; proposed CC BY-SA 4.0) |")
    }
}
if ($problems -gt 0) { exit 1 }
