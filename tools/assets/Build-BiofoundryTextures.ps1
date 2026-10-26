<#
.SYNOPSIS
  Procedural 16x16 pixel art for the LuV biofoundry's controller face of Gregtech Grindless (GregTech style: bevels, top-left
  light, every pixel fully opaque or fully transparent).

.DESCRIPTION
  Every pixel is drawn by this script (palettes + a char map + small routines); nothing is copied or edited from GregTech
  Modern or any other mod. Output is deterministic: re-running overwrites the same bytes (the foam's shimmer comes from
  Get-Noise, a hash of position and frame, not from a random generator). Same method, steel bezel and lamp ramp as the IV
  faces (Build-HotCellTextures.ps1, Build-NaquadahPlantTextures.ps1), whose helpers are copied so those scripts stay
  untouched, and the hot cell's checks: no frame repeats the next one, no hole inside the panel, and light only where the face
  has lights.

  Writes (under pack/kubejs/assets/grindless/textures/):
    block/multiblock/biofoundry/overlay_front.png, overlay_front_active.png(+.mcmeta), overlay_front_active_emissive.png(+.mcmeta)

  The face is a culture port of the biofoundry (gtceu:biofoundry), the sealed sterile hall that runs GTM's sterile culture
  chain: a round sealed porthole into one of its fermenter columns, set in a dark steel plate inside the steel bezel. The
  porthole's flange is clean stainless steel (lit at the top left, in shade at the bottom right) with four bolts at the
  plate's corners; through the glass, a headspace over the culture, with a glint at its top left. Under the porthole, a
  control strip: the violet UV lamp (the hall's UV ceiling), the four-cell growth bar and the green run lamp.
  8 frames, frametime 4: the vessel holds a living green culture under a layer of foam that shimmers; three streams of
  bubbles rise out of step from the sparger at the bottom, one pixel a frame with a little wobble, flash as they burst in the
  foam and two of them throw a droplet into the headspace; the growth bar fills one cell every two frames and starts again
  (each loop a batch); the UV and run lamps are lit. Idle: the vessel holds clear sterile medium in the UV light, pale cyan
  under a violet headspace, without foam or bubbles, the growth bar is empty and both lamps are dark.

  The *_emissive layer only holds the foam, the bubbles, their bursts and droplets, the lit bar cells and the two lamps.

  Run from the repo root (PowerShell 5.1 blocks unsigned scripts by default; this bypass only affects that process):
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-BiofoundryTextures.ps1
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-BiofoundryTextures.ps1 -Only biofoundry -Credits

  Overlay conventions (GTM's workable casings, as every other set): transparent background, details only on the overlay,
  animated variants are vertical 16x(16*n) strips with a .png.mcmeta, *_emissive layers hold only the pixels that glow
  (identical to the colour layer). Every pixel is fully opaque or fully transparent and none is pure black. The outer 1 px
  ring is always left empty so the casing shows around the face. Drawn for gtceu:block/casings/cleanroom/plascrete (GTM's
  plascrete, the biofoundry's workableCasingModel), a pale grey: the face is a whole dark panel inside the ring, so the
  porthole, its flange and the strip read on it, and it also reads on darker casings. The final check fails the run (non-zero
  exit) if a written file breaks one of these rules.

.PARAMETER Only
  Subset of: biofoundry (comma-separated, also as one string with -File). Default: everything.
.PARAMETER OutRoot
  Textures root. Default: <repo>/pack/kubejs/assets/grindless/textures
.PARAMETER Credits
  Also print the CREDITS.md "Assets" table rows for the files written.
#>
[CmdletBinding()]
param(
    [string]$OutRoot = '',
    [string[]]$Only = @(),
    [switch]$Credits
)
$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'Pixel.Lib.ps1')

# `powershell -File ... -Only a,b` delivers "a,b" as one string: split it so both calling styles work.
$Only = @($Only | ForEach-Object { $_ -split '[,;\s]+' } | Where-Object { $_ })
$Known = @('biofoundry')
foreach ($id in $Only) { if ($Known -notcontains $id) { throw "Unknown -Only id '$id' (expected: $($Known -join ', '))" } }

if (-not $OutRoot) { $OutRoot = Join-Path $PSScriptRoot '..\..\pack\kubejs\assets\grindless\textures' }
$OutRoot = [System.IO.Path]::GetFullPath($OutRoot)
$ScriptName = Split-Path -Leaf $PSCommandPath

function Test-Want { param([string]$Id) return ($Only.Count -eq 0 -or $Only -contains $Id) }

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

# Deterministic 0..255 hash of (x, y, frame, salt): shimmer without a random generator.
function Get-Noise {
    param([long]$X, [long]$Y, [long]$T = 0, [long]$Salt = 0)
    $h = (($X * 73856093L) -bxor ($Y * 19349663L) -bxor ($T * 83492791L) -bxor ($Salt * 2654435761L)) % 1000003L
    if ($h -lt 0) { $h = -$h }
    return [int](($h * 7919L) % 256L)
}

# Ramps shared with the earlier sets: neutral steel (lit -> dark) and the state lamp (green M..P, red Q..S).
$SteelSpec = 'A=D3D3D3 B=B0B0B0 C=8E8E8E D=707070 E=565656 F=404040 G=2F2F2F H=222222 I=161616 J=0D0D0D'
$LampSpec = 'M=E2FFE4 N=62FF86 O=22C257 P=0C6B2E Q=FF5A48 R=B52D22 S=5E1511'

# ============================================================================================
#  BIOFOUNDRY - controller face (GTM's plascrete)
#  the steel bezel around a dark steel plate (G); the porthole's flange, a 10 px ring (x3..12 y2..11), lit (A) at the top
#  left, B at the sides and in shade (C) at the bottom right, with a bolt (B) at each corner of its square; the glass inside
#  it (x4..11 y3..10): the headspace (y3..4) with the glint (f), the culture's surface (y5) and the culture (y6..10, the
#  sparger at the bottom); the control strip under it (recess I, y12): the UV lamp (4,12), the growth bar (x6..9) and the
#  run lamp (11,12), over a lit lip (E, y13)
# ============================================================================================
#   glass: f glint (both states). The vessel is a cylinder lit from the front: every tone is a step darker on the glass's
#   leftmost and rightmost pixel of its row, so the light flange stands clear of the medium
#   idle, clear sterile medium in the UV light: h i j the violet headspace (lit -> dark), s the pale cyan meniscus, t u v w x
#   the medium from the surface down to the sparger, drifting to violet blue at the bottom
#   active, the living culture: K L a the headspace, T U the foam (two tones, shimmering), V W X Y Z the culture from the
#   surface down; b a rising bubble, p a bubble bursting in the foam, d a droplet thrown into the headspace
#   strip: l the UV lamp off (lit: r), g the run lamp off (lit: N), y a growth cell off (lit: O, the newest one N)
$BfPal = New-Pal ($SteelSpec + ' ' + $LampSpec + ' ' + @'
f=E6F6FA
h=7A6CC2 i=6A5CB2 j=5A4CA0
s=96CEDE t=7EBACE u=6EA8C4 v=6096B8 w=5584AC x=4B72A0 m=6096B8
K=3C6249 L=33563F a=2A4835
T=B0E084 U=D0F2A6
V=72CA48 W=5EB43C X=4C9E34 Y=3E862C Z=326E26
b=EAFFD6 p=F8FFEE d=B4E894
l=4A3A72 r=C8A0FF
g=24502F
y=22402C
'@)

# The static panel: bezel, plate, flange, bolts, the glass's zones (h the headspace, s the surface, m the medium; the frame
# code paints them in both states), the strip and its lip.
$BfBase = @(
    '................',
    '.CDDDDDDDDDDDDE.',
    '.DGBGGAAAAGGBGF.',
    '.DGGAAfhhhBBGGF.',
    '.DGGAfhhhhhBGGF.',
    '.DGAssssssssBGF.',
    '.DGAmmmmmmmmBGF.',
    '.DGBmmmmmmmmCGF.',
    '.DGBmmmmmmmmCGF.',
    '.DGGBmmmmmmCGGF.',
    '.DGGBCmmmmCCGGF.',
    '.DGBGGCCCCGGBGF.',
    '.DGIlIyyyyIgIGF.',
    '.DGEEEEEEEEEEGF.',
    '.EFFFFFFFFFFFFG.',
    '................'
)
Assert-Map 'BfBase' $BfBase

# Ramps (lit -> dark) of each zone, idle and working, and the depth of each row in its ramp (the edge adds a step).
$BfHeadIdle = 'hij'; $BfHeadCulture = 'KLa'
$BfMediumIdle = 'tuvwx'; $BfMediumCulture = 'VWXYZ'
$BfDepth = @{ 3 = 0; 4 = 1; 6 = 0; 7 = 1; 8 = 1; 9 = 2; 10 = 3 }
$BfSurfaceY = 5
$BfUvLamp = @(4, 12)
$BfRunLamp = @(11, 12)
$BfBarX0 = 6; $BfBarY = 12; $BfBarCells = 4
# Lit growth cells per frame: one more every two frames, then a new batch.
$BfBar = @(1, 1, 2, 2, 3, 3, 4, 4)
# The bubble streams: one path each, a step per frame from the sparger up to the foam ('b' rising, 'p' bursting in the foam,
# 'd' a droplet in the headspace; $null: nothing in that frame), and the frame the stream starts at. The three streams start
# out of step, so one to three bubbles are in the culture in every frame.
$BfStreams = @(
    @{ Phase = 0; Path = @(@(7, 10, 'b'), @(7, 9, 'b'), @(6, 8, 'b'), @(6, 7, 'b'), @(7, 6, 'b'), @(7, 5, 'p'), @(7, 4, 'd'), $null) },
    @{ Phase = 3; Path = @(@(10, 9, 'b'), @(10, 8, 'b'), @(9, 7, 'b'), @(10, 6, 'b'), @(10, 5, 'p'), $null, $null, $null) },
    @{ Phase = 6; Path = @(@(5, 9, 'b'), @(5, 8, 'b'), @(4, 7, 'b'), @(5, 6, 'b'), @(6, 5, 'p'), @(6, 4, 'd'), $null, $null) }
)

# 1 on the glass's leftmost and rightmost pixel of a row (the glint counts as glass), 0 inside.
function Get-BfEdge {
    param([int]$X, [int]$Y)
    $row = $BfBase[$Y]
    $glass = 'fhsm'
    if ($glass.IndexOf([string]$row[$X - 1]) -lt 0 -or $glass.IndexOf([string]$row[$X + 1]) -lt 0) { return 1 }
    return 0
}

function New-BiofoundryFrame {
    param([bool]$Active, [int]$T = 0)
    $c = New-Canvas; $e = New-Canvas
    $P = $BfPal
    Write-Map $c 0 0 $BfBase $P
    $f = $T % 8

    # ---- behind the glass: the headspace and the medium (clear in the UV light when idle, the culture while working), lit in
    # the middle and a step darker at the edges; the meniscus of the idle medium (the foam is drawn below)
    $head = if ($Active) { $BfHeadCulture } else { $BfHeadIdle }
    $medium = if ($Active) { $BfMediumCulture } else { $BfMediumIdle }
    for ($y = 0; $y -lt 16; $y++) {
        for ($x = 0; $x -lt 16; $x++) {
            $ch = [string]$BfBase[$y][$x]
            $ramp = if ($ch -eq 'h') { $head } elseif ($ch -eq 'm') { $medium } else { $null }
            if ($null -ne $ramp) {
                $k = [Math]::Min($ramp.Length - 1, $BfDepth[$y] + (Get-BfEdge $x $y))
                Set-Px $c $x $y $P[[string]$ramp[$k]]
            } elseif ($ch -eq 's' -and -not $Active) {
                Set-Px $c $x $y $P[$(if ((Get-BfEdge $x $y) -eq 1) { 't' } else { 's' })]
            }
        }
    }
    if (-not $Active) { return @{ Color = $c; Emi = $e } }

    # ---- the foam on the culture's surface: two tones shimmering frame by frame, the darker one at the edges
    for ($x = 0; $x -lt 16; $x++) {
        if ([string]$BfBase[$BfSurfaceY][$x] -ne 's') { continue }
        $tone = if ((Get-BfEdge $x $BfSurfaceY) -eq 0 -and (Get-Noise $x $BfSurfaceY $T 41) -lt 112) { 'U' } else { 'T' }
        Set-Both $c $e $x $BfSurfaceY $P[$tone]
    }

    # ---- the bubbles: each stream one step further per frame
    foreach ($s in $BfStreams) {
        $step = $s.Path[($f + $s.Phase) % 8]
        if ($null -eq $step) { continue }
        Set-Both $c $e $step[0] $step[1] $P[[string]$step[2]]
    }

    # ---- the growth bar (the newest cell brightest) and the two lamps
    for ($k = 0; $k -lt $BfBar[$f]; $k++) {
        $tone = if ($k -eq ($BfBar[$f] - 1)) { 'N' } else { 'O' }
        Set-Both $c $e ($BfBarX0 + $k) $BfBarY $P[$tone]
    }
    Set-Both $c $e $BfUvLamp[0] $BfUvLamp[1] $P['r']
    Set-Both $c $e $BfRunLamp[0] $BfRunLamp[1] $P['N']

    Sync-Emissive $c $e
    return @{ Color = $c; Emi = $e }
}

# Where light may come from: the foam row, every step of the bubble streams, the growth bar and the two lamps (the check below
# holds the emissive layer to these pixels, so the glass, the culture, the flange and the steel never glow).
$BfGlowZone = New-Object 'System.Collections.Generic.HashSet[int]'
for ($x = 0; $x -lt 16; $x++) { if ([string]$BfBase[$BfSurfaceY][$x] -eq 's') { [void]$BfGlowZone.Add($BfSurfaceY * 16 + $x) } }
foreach ($s in $BfStreams) { foreach ($step in $s.Path) { if ($null -ne $step) { [void]$BfGlowZone.Add($step[1] * 16 + $step[0]) } } }
for ($k = 0; $k -lt $BfBarCells; $k++) { [void]$BfGlowZone.Add($BfBarY * 16 + $BfBarX0 + $k) }
foreach ($l in @($BfUvLamp, $BfRunLamp)) { [void]$BfGlowZone.Add($l[1] * 16 + $l[0]) }
# every bubble step must be inside the glass, or it would be drawn on the flange or the plate
foreach ($s in $BfStreams) {
    foreach ($step in $s.Path) {
        if ($null -eq $step) { continue }
        $ch = [string]$BfBase[$step[1]][$step[0]]
        if ('hsm'.IndexOf($ch) -lt 0) { throw "bubble step ($($step[0]),$($step[1])) is outside the glass ('$ch')" }
    }
}

# ============================================================================================
#  BUILD
# ============================================================================================
$BfDir = 'block/multiblock/biofoundry'
$BfFrameTime = 4

function Out-Overlay {
    param([string]$Dir, $Builder, [int]$FrameTime)
    $frames = @(); $emis = @()
    for ($f = 0; $f -lt 8; $f++) { $r = & $Builder $true $f; $frames += $r.Color; $emis += $r.Emi }
    $idle = & $Builder $false 0
    Out-Tex $idle.Color "$Dir/overlay_front.png"
    Out-Tex (Join-Frames $frames) "$Dir/overlay_front_active.png" $FrameTime
    Out-Tex (Join-Frames $emis) "$Dir/overlay_front_active_emissive.png" $FrameTime
}

if (Test-Want 'biofoundry') { Out-Overlay $BfDir ${function:New-BiofoundryFrame} $BfFrameTime }

# ============================================================================================
#  VERIFY what was written: exact sizes (the idle face 16x16, the strips 16x128), binary alpha, no pure black, the .mcmeta
#  frametime, frames that really differ (each one from the next, the loop seam included, and at least 4 distinct), the empty
#  casing ring around a panel without holes, and an emissive layer inside the colour layer, lit in every frame and only on
#  the foam, the bubbles, the growth bar and the lamps
# ============================================================================================
$problems = 0
foreach ($rel in $written) {
    $path = Join-Path $OutRoot ($rel -replace '/', '\')
    $msgs = @()
    if ($rel.EndsWith('.mcmeta')) {
        $ft = 0
        try { $ft = [int]((Get-Content -LiteralPath $path -Raw | ConvertFrom-Json).animation.frametime) } catch { $msgs += 'unreadable .mcmeta' }
        if ($ft -ne $BfFrameTime) { $msgs += "frametime $ft (expected $BfFrameTime)" }
        if ($msgs.Count -gt 0) { $problems++; Write-Warning "$rel : $($msgs -join '; ')" }
        continue
    }
    $img = Read-Png $path
    $nf = [int][Math]::Floor($img.H / 16)
    $strip = Test-Path -LiteralPath ($path + '.mcmeta')
    if ($img.W -ne 16 -or ($img.H % 16) -ne 0) { $msgs += "bad size $($img.W)x$($img.H)" }
    elseif ($strip -and $nf -ne 8) { $msgs += "animation is $($img.W)x$($img.H) (expected 16x128, 8 frames)" }
    elseif (-not $strip -and $nf -ne 1) { $msgs += "static face is $($img.W)x$($img.H) (expected 16x16)" }
    $opaque = 0; $black = 0; $partial = 0
    foreach ($px in $img.P) {
        $alpha = ($px -shr 24) -band 255
        if ($alpha -ne 0 -and $alpha -ne 255) { $partial++; continue }
        if ($alpha -eq 255) {
            $opaque++
            if (($px -band 0xFFFFFF) -eq 0) { $black++ }
        }
    }
    if ($partial -gt 0) { $msgs += "$partial partially transparent px" }
    if ($opaque -eq 0) { $msgs += 'fully transparent' }
    if ($black -gt 0) { $msgs += "$black pure-black px" }
    $emissive = $rel -like '*_emissive.png'
    if ($strip) {
        $keys = @(); for ($f = 0; $f -lt $nf; $f++) { $keys += (($img.P[($f * 256)..($f * 256 + 255)]) -join ',') }
        $distinct = @($keys | Select-Object -Unique).Count
        if ($distinct -lt 4) { $msgs += "only $distinct distinct frames out of $nf" }
        if (-not $emissive) {
            for ($f = 0; $f -lt $nf; $f++) { if ($keys[$f] -eq $keys[($f + 1) % $nf]) { $msgs += "frame $f repeats in frame $(($f + 1) % $nf)" } }
        }
    }
    # the casing's outer 1 px ring stays visible in every frame; inside it the colour layers are a whole panel
    $ring = 0; $holes = 0
    for ($f = 0; $f -lt $nf; $f++) { for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
        $on = (($img.P[($f * 16 + $y) * 16 + $x] -shr 24) -band 255) -ne 0
        if ($x -lt 1 -or $y -lt 1 -or $x -gt 14 -or $y -gt 14) { if ($on) { $ring++ } }
        elseif (-not $emissive -and -not $on) { $holes++ }
    } } }
    if ($ring -gt 0) { $msgs += "$ring opaque px in the casing ring" }
    if ($holes -gt 0) { $msgs += "$holes transparent px inside the panel" }
    # an emissive layer may only contain pixels that exist, identical, in the colour layer, only where light comes from, and
    # every frame has a glow
    if ($emissive) {
        $colorPath = Join-Path $OutRoot (($rel -replace '_emissive\.png$', '.png') -replace '/', '\')
        $color = Read-Png $colorPath
        if ($color.H -ne $img.H) { $msgs += 'emissive strip height differs from the colour strip' }
        else {
            $stray = 0; $outside = 0
            for ($i = 0; $i -lt $img.P.Length; $i++) {
                if ((($img.P[$i] -shr 24) -band 255) -eq 0) { continue }
                if ($img.P[$i] -ne $color.P[$i]) { $stray++ }
                if (-not $BfGlowZone.Contains($i % 256)) { $outside++ }
            }
            if ($stray -gt 0) { $msgs += "$stray emissive px not present in the colour layer" }
            if ($outside -gt 0) { $msgs += "$outside emissive px outside the foam, the bubbles, the bar and the lamps" }
        }
        for ($f = 0; $f -lt $nf; $f++) {
            $lit = 0
            for ($i = $f * 256; $i -lt ($f + 1) * 256; $i++) { if ((($img.P[$i] -shr 24) -band 255) -ne 0) { $lit++ } }
            if ($lit -eq 0) { $msgs += "emissive frame $f is empty" }
        }
    }
    if ($msgs.Count -gt 0) { $problems++; Write-Warning "$rel : $($msgs -join '; ')" }
}

Write-Host "written $($written.Count) files under $OutRoot ($problems with warnings)"
foreach ($rel in $written) {
    $hash = (Get-FileHash -Algorithm SHA256 -LiteralPath (Join-Path $OutRoot ($rel -replace '/', '\'))).Hash.Substring(0, 16).ToLowerInvariant()
    Write-Host "  $rel  sha256:$hash"
}

if ($problems -gt 0) { throw "$problems file(s) failed the texture checks (see the warnings above)" }

if ($Credits) {
    Write-Host ''
    foreach ($rel in $written) {
        Write-Host ("| ``pack/kubejs/assets/grindless/textures/$rel`` | Generated with tools/assets/$ScriptName (procedural pixel art, original) by the biofoundry agent, 2026-10-26 | the pack's licence (pending; proposed CC BY-SA 4.0) |")
    }
}
