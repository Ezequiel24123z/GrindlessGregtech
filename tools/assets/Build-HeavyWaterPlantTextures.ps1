<#
.SYNOPSIS
  Procedural 16x16 pixel art for the IV heavy-water plant's controller face of Gregtech Grindless (GregTech style: bevels,
  top-left light, every pixel fully opaque or fully transparent).

.DESCRIPTION
  Every pixel is drawn by this script (palettes + a char map + small routines); nothing is copied or edited from GregTech
  Modern or any other mod. Output is deterministic: re-running overwrites the same bytes (the shimmer comes from Get-Noise, a
  hash of position and frame, not from a random generator). Same method, steel bezel and lamp ramp as the IV faces
  (Build-FissionReactorTextures.ps1, Build-HotCellTextures.ps1), whose helpers are copied so those scripts stay untouched, and
  the same checks: no frame repeats the next one, no hole inside the panel, and light only where the face has lights.

  Writes (under pack/kubejs/assets/grindless/textures/):
    block/multiblock/heavy_water_plant/overlay_front.png, overlay_front_active.png(+.mcmeta), overlay_front_active_emissive.png(+.mcmeta)

  The face is the plant's mimic panel (gtceu:heavy_water_plant), the kind on a control-room board: on the dark steel board
  stand the short cold tower in cool blue and the tall hot tower in warm orange, joined at mid-height by two thin pipe lines
  (the H2S loop through the bridge of titanium pipe casings). At the right stands the slim grey vacuum column of the finishing
  step, with a drop of heavy water (pale cyan) under it. Above the cold tower, a row of two mode lamps (1 exchange,
  2 finishing). 8 frames, frametime 4: gas rises through both towers, a cold bubble one pixel a frame and a brighter warm
  streak two pixels a frame in the hot tower. A warm pulse runs along the upper line from the hot tower to the cold one, and a
  cold pulse runs back along the lower line. The drop glows and breathes, and once a loop a droplet falls into it from the
  column. Mode lamp 1 is lit. Idle: dim towers, no flow, a dull drop and both lamps dark.

  The *_emissive layer only holds the bubbles and streaks, the pulses on the lines, the drop with its droplet and the lit lamp.

  Run from the repo root (PowerShell 5.1 blocks unsigned scripts by default; this bypass only affects that process):
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-HeavyWaterPlantTextures.ps1
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-HeavyWaterPlantTextures.ps1 -Only heavy_water_plant -Credits
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-HeavyWaterPlantTextures.ps1 -Preview C:\path\hwp-preview.png

  Overlay conventions (GTM's workable casings, as every other set): transparent background, details only on the overlay,
  animated variants are vertical 16x(16*n) strips with a .png.mcmeta, *_emissive layers hold only the pixels that glow
  (identical to the colour layer). Every pixel is fully opaque or fully transparent and none is pure black. The outer 1 px
  ring is always left empty so the casing shows around the face. Drawn for gtceu:block/casings/solid/machine_casing_inert_ptfe
  (GTM's chemically inert PTFE machine casing, the plant's workableCasingModel); the face has its own dark frame, so it also
  reads on other casings. The final check fails the run (non-zero exit) if a written file breaks one of these rules.

.PARAMETER Only
  Subset of: heavy_water_plant (comma-separated, also as one string with -File). Default: everything.
.PARAMETER OutRoot
  Textures root. Default: <repo>/pack/kubejs/assets/grindless/textures
.PARAMETER Preview
  Also write a review sheet to this PNG, which must be outside the repository (it is never shipped). The sheet is x8, nearest
  neighbour. Rows: the face on a light grey inert-casing stand-in (a flat plate with a soft bevel), idle, then every active
  frame with its emissive layer, then a dark-room view; the same on a dark grey stand-in; the emissive layer alone; and the raw
  colour layer on a checker. Last row: a 3x3 wall, idle and working, on both stand-ins, and the same walls at x2 and x1 (how
  the face reads from a few blocks away).
.PARAMETER Credits
  Also print the CREDITS.md "Assets" table rows for the files written.
#>
[CmdletBinding()]
param(
    [string]$OutRoot = '',
    [string[]]$Only = @(),
    [string]$Preview = '',
    [switch]$Credits
)
$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'Pixel.Lib.ps1')

# `powershell -File ... -Only a,b` delivers "a,b" as one string: split it so both calling styles work.
$Only = @($Only | ForEach-Object { $_ -split '[,;\s]+' } | Where-Object { $_ })
$Known = @('heavy_water_plant')
foreach ($id in $Only) { if ($Known -notcontains $id) { throw "Unknown -Only id '$id' (expected: $($Known -join ', '))" } }

$RepoRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..'))
if (-not $OutRoot) { $OutRoot = Join-Path $RepoRoot 'pack\kubejs\assets\grindless\textures' }
$OutRoot = [System.IO.Path]::GetFullPath($OutRoot)
$ScriptName = Split-Path -Leaf $PSCommandPath

if ($Preview) {
    $Preview = $ExecutionContext.SessionState.Path.GetUnresolvedProviderPathFromPSPath($Preview)
    if ($Preview.StartsWith($RepoRoot.TrimEnd('\') + '\', [System.StringComparison]::OrdinalIgnoreCase)) {
        throw "-Preview must point outside the repository (the review sheet is never shipped): $Preview"
    }
}

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

function Get-ClampInt { param([int]$V, [int]$Lo, [int]$Hi) return [Math]::Max($Lo, [Math]::Min($Hi, $V)) }

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
# The heavy water's glow, white -> deep teal (pale cyan, so the drop never reads as the cold tower's blue). The drop's core rests
# on 2, swells to 1 and ebbs to 3; its highlight is a step brighter, its shaded side one or two steps dimmer (the shimmer pushes
# those a step either way, down to 5 at most) and its three corners stay on 6, which rounds the drop on the dark board.
$DropGlowSpec = '1=EEFFFC 2=AEF5EC 3=72DED8 4=44B6BA 5=2C8A93 6=24585E'
# The gas: a cold bubble (head, tail) and the hot tower's warm streak (head, tail). The pulses on the lines take the tones of
# the tower they leave.
$GasSpec = 'v=E6F7FF w=9CD3F7 x=FFF5C8 y=FFC566'

# ============================================================================================
#  HEAVY-WATER PLANT - controller face (GTM's chemically inert PTFE machine casing)
#  a mimic panel: the mode lamps (recess x3..5 y2..4, lamps at 3,3 and 5,3, lit lip y4) over the cold tower (x3..5 y6..11),
#  the hot tower (x8..10 y3..11), the two lines of the H2S loop between them (x6..7, y7 and y9), the vacuum column (x12..13
#  y4..8, its outlet on the foot row) and the drop of heavy water under it (tip 12,10; body x11..13 y11..13), with the gap at
#  12,9 where the droplet falls
# ============================================================================================
#   cold tower: a cap, b lit side, c body (where the bubbles rise), d shaded side, e foot
#   hot tower:  f cap, g lit side, h body (where the streak rises), i shaded side, j foot
#   (the two tower ramps are the only letters that change between idle and working: dim when idle, backlit when working)
#   lines of the H2S loop: p upper, q lower (a step darker, further from the light)
#   vacuum column (tungstensteel pipe casing, neutral grey): m cap, n lit side, o shaded side, k foot (its outlet)
#   heavy-water drop, idle (dull): r highlight, s body, t shade, u deep, z the corners
#   lamps: l off (lit: N)
$HwCommonSpec = @'
p=B7BDC5 q=959BA4
m=D9DDE2 n=AAB1B9 o=747B84 k=4C535B
r=7E9C9C s=5E7C7D t=476162 u=354A4B z=2B3A3B
l=1E4029
'@
$HwWorkSpec = @'
a=BEE2FC b=6FAAE2 c=3E7DC2 d=2A578F e=1D3D66
f=FFCD96 g=F49C4C h=D4662E i=9C401F j=6B2A15
'@
$HwIdleSpec = @'
a=6E8193 b=4B6680 c=35506D d=273B53 e=1D2B3D
f=957461 g=7F5B45 h=6B4533 i=4F3125 j=37231A
'@
$HwPalOn = New-Pal ($SteelSpec + ' ' + $LampSpec + ' ' + $DropGlowSpec + ' ' + $GasSpec + ' ' + $HwCommonSpec + ' ' + $HwWorkSpec)
$HwPalOff = New-Pal ($SteelSpec + ' ' + $LampSpec + ' ' + $DropGlowSpec + ' ' + $GasSpec + ' ' + $HwCommonSpec + ' ' + $HwIdleSpec)

# The whole idle face: bezel, lamp recess and lip, the two towers, the lines, the column and the drop. The working frames draw
# the same map with the backlit tower ramp and add what moves.
$HwBase = @(
    '................',
    '.CDDDDDDDDDDDDE.',
    '.DGIIIGGGGGGGGF.',
    '.DGlIlGGffgGGGF.',
    '.DGEEEGGghiGmnF.',
    '.DGGGGGGghiGnoF.',
    '.DGaabGGghiGnoF.',
    '.DGbcdppghiGnoF.',
    '.DGbcdGGghiGkkF.',
    '.DGbcdqqghiGGGF.',
    '.DGbcdGGghiGsGF.',
    '.DGeeeGGjjjzrtF.',
    '.DGGGGGGGGGssuF.',
    '.DGGGGGGGGGzuzF.',
    '.EFFFFFFFFFFFFG.',
    '................'
)
Assert-Map 'HwBase' $HwBase

$HwColdX = 4; $HwColdY0 = 7; $HwColdY1 = 10                 # the cold tower's body column, top and bottom rows (cap 6, foot 11)
$HwHotX = 9; $HwHotY0 = 4; $HwHotY1 = 10                    # the hot tower's body column (cap 3, foot 11)
$HwLineX0 = 6; $HwLineX1 = 7                                # the bridge between the towers
$HwLineUp = 7; $HwLineDown = 9                              # upper line: hot -> cold (leftwards); lower line: cold -> hot
$HwDrip = @(12, 9)                                          # where the droplet hangs between the column's outlet and the drop
$HwLamps = @(@(3, 3), @(5, 3))                              # modes 1 (exchange) and 2 (finishing)
# The drop: x, y, steps dimmer than its core (negative = brighter): the tip, the highlight just under it, the body and the shaded
# right side. Its three corners (upper left, lower left and lower right) stay at the dimmest tone whatever the breath: they
# round the drop on the dark board.
$HwDrop = @(@(12, 10, 0), @(12, 11, -1), @(13, 11, 1), @(11, 12, 0), @(12, 12, 0), @(13, 12, 2), @(12, 13, 2))
$HwDropRim = @(@(11, 11), @(11, 13), @(13, 13))
# The drop breathes (negative = brighter): it ebbs, takes the droplet (frame $HwDripFrame) and swells.
$HwPulse = @(0, 1, 1, 0, 0, -1, -1, 0)
$HwDripFrame = 4
# Each line carries a pulse every four frames (it enters, crosses, leaves, then the line rests a frame); the lower line runs half
# a cycle behind the upper one, so one of them is always moving.
$HwLinePhase = @{ Up = 0; Down = 2 }

function New-HeavyWaterFrame {
    param([bool]$Active, [int]$T = 0)
    $c = New-Canvas; $e = New-Canvas
    $P = if ($Active) { $HwPalOn } else { $HwPalOff }
    Write-Map $c 0 0 $HwBase $P
    if (-not $Active) { return @{ Color = $c; Emi = $e } }   # idle: the map is the whole face
    $f = $T % 8
    $glow = '123456'

    # ---- the cold tower: a bubble rises one pixel a frame through its body (bottom to top in four frames), a dimmer tail under it
    $hy = $HwColdY1 - ($f % 4)
    Set-Both $c $e $HwColdX $hy $P['v']
    if ($hy + 1 -le $HwColdY1) { Set-Both $c $e $HwColdX ($hy + 1) $P['w'] }

    # ---- the hot tower: a warm streak rises two pixels a frame (bottom to top in four frames): a bright head and a golden tail
    $hy = $HwHotY1 - 2 * ($f % 4)
    Set-Both $c $e $HwHotX $hy $P['x']
    if ($hy + 1 -le $HwHotY1) { Set-Both $c $e $HwHotX ($hy + 1) $P['y'] }

    # ---- the H2S loop: the upper line carries gas from the hot tower to the cold one (warm), the lower one brings it back (cold)
    foreach ($ln in @(@($HwLineUp, $HwLineX1, $HwLineX0, 'x', 'y', $HwLinePhase.Up), @($HwLineDown, $HwLineX0, $HwLineX1, 'v', 'w', $HwLinePhase.Down))) {
        $ly = $ln[0]; $in = $ln[1]; $out = $ln[2]; $head = $P[[string]$ln[3]]; $tail = $P[[string]$ln[4]]
        switch (($f + $ln[5]) % 4) {
            0 { Set-Both $c $e $in $ly $head }
            1 { Set-Both $c $e $out $ly $head; Set-Both $c $e $in $ly $tail }
            2 { Set-Both $c $e $out $ly $tail }
        }
    }

    # ---- the heavy water: the drop glows and breathes (its shaded side shimmers a step now and then; the tip and the highlight
    # hold the shape, the corners stay dim), and once a loop a droplet hangs under the column's outlet
    $core = 1 + $HwPulse[$f]
    foreach ($d in $HwDrop) {
        $tone = $core + $d[2]
        if ($d[2] -gt 0) {
            $n = Get-Noise $d[0] $d[1] $T 67
            if ($n -lt 36) { $tone-- } elseif ($n -gt 219) { $tone++ }
        }
        Set-Both $c $e $d[0] $d[1] $P[[string]$glow[(Get-ClampInt $tone 0 ($glow.Length - 2))]]
    }
    foreach ($d in $HwDropRim) { Set-Both $c $e $d[0] $d[1] $P[[string]$glow[$glow.Length - 1]] }
    if ($f -eq $HwDripFrame) { Set-Both $c $e $HwDrip[0] $HwDrip[1] $P['2'] }

    # ---- the mode lamps: mode 1 (exchange) lit while working; mode 2 stays dark
    Set-Both $c $e $HwLamps[0][0] $HwLamps[0][1] $P['N']

    Sync-Emissive $c $e
    return @{ Color = $c; Emi = $e }
}

# Where light may come from: the body columns of both towers, the two lines, the drop and its droplet, and the two lamps (the
# check below holds the emissive layer to these pixels, so the towers' sides, the column and the steel never glow).
$HwGlowZone = New-Object 'System.Collections.Generic.HashSet[int]'
for ($y = $HwColdY0; $y -le $HwColdY1; $y++) { [void]$HwGlowZone.Add($y * 16 + $HwColdX) }
for ($y = $HwHotY0; $y -le $HwHotY1; $y++) { [void]$HwGlowZone.Add($y * 16 + $HwHotX) }
foreach ($ly in @($HwLineUp, $HwLineDown)) { for ($x = $HwLineX0; $x -le $HwLineX1; $x++) { [void]$HwGlowZone.Add($ly * 16 + $x) } }
foreach ($d in $HwDrop) { [void]$HwGlowZone.Add($d[1] * 16 + $d[0]) }
foreach ($d in $HwDropRim) { [void]$HwGlowZone.Add($d[1] * 16 + $d[0]) }
[void]$HwGlowZone.Add($HwDrip[1] * 16 + $HwDrip[0])
foreach ($l in $HwLamps) { [void]$HwGlowZone.Add($l[1] * 16 + $l[0]) }

# ============================================================================================
#  BUILD
# ============================================================================================
$HwDir = 'block/multiblock/heavy_water_plant'
$HwFrameTime = 4

function Out-Overlay {
    param([string]$Dir, $Builder, [int]$FrameTime)
    $frames = @(); $emis = @()
    for ($f = 0; $f -lt 8; $f++) { $r = & $Builder $true $f; $frames += $r.Color; $emis += $r.Emi }
    $idle = & $Builder $false 0
    Out-Tex $idle.Color "$Dir/overlay_front.png"
    Out-Tex (Join-Frames $frames) "$Dir/overlay_front_active.png" $FrameTime
    Out-Tex (Join-Frames $emis) "$Dir/overlay_front_active_emissive.png" $FrameTime
}

if (Test-Want 'heavy_water_plant') { Out-Overlay $HwDir ${function:New-HeavyWaterFrame} $HwFrameTime }

# ============================================================================================
#  VERIFY what was written: exact sizes (the idle face 16x16, the strips 16x128), binary alpha, no pure black, the .mcmeta
#  frametime, frames that really differ (each one from the next, the loop seam included, and at least 4 distinct), the empty
#  casing ring around a panel without holes, and an emissive layer inside the colour layer, lit in every frame and only on
#  the bubbles, the lines, the drop and the lamps
# ============================================================================================
$problems = 0
foreach ($rel in $written) {
    $path = Join-Path $OutRoot ($rel -replace '/', '\')
    $msgs = @()
    if ($rel.EndsWith('.mcmeta')) {
        $ft = 0
        try { $ft = [int]((Get-Content -LiteralPath $path -Raw | ConvertFrom-Json).animation.frametime) } catch { $msgs += 'unreadable .mcmeta' }
        if ($ft -ne $HwFrameTime) { $msgs += "frametime $ft (expected $HwFrameTime)" }
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
                if (-not $HwGlowZone.Contains($i % 256)) { $outside++ }
            }
            if ($stray -gt 0) { $msgs += "$stray emissive px not present in the colour layer" }
            if ($outside -gt 0) { $msgs += "$outside emissive px outside the bubbles, the lines, the drop and the lamps" }
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

# ============================================================================================
#  PREVIEW (optional, never shipped)
# ============================================================================================
if ($Preview -and $written.Count -gt 0) {
    # a flat plate with a soft bevel (lit top and left edges, shaded bottom and right): the stand-in casings
    function New-StandInPlate {
        param([string]$Spec)
        $pal = New-Pal $Spec
        $c = New-Canvas
        for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
            $ch = 'c'
            if ($x -eq 0 -or $y -eq 0) { $ch = 'a' }
            elseif ($x -eq 15 -or $y -eq 15) { $ch = 'e' }
            elseif ($x -eq 1 -or $y -eq 1) { $ch = 'b' }
            elseif ($x -eq 14 -or $y -eq 14) { $ch = 'd' }
            $c.P[$y * 16 + $x] = $pal[$ch]
        } }
        return $c
    }
    function Get-Frame { param($Strip, [int]$Index) $f = New-Canvas 16 16; [Array]::Copy($Strip.P, $Index * 256, $f.P, 0, 256); return $f }
    function Merge-On { param($Dst, $Src) $o = Copy-Canvas $Dst; Merge-Canvas $o $Src; return $o }
    function Get-Dimmed { param($C, [double]$K) $o = Copy-Canvas $C; for ($i = 0; $i -lt $o.P.Length; $i++) { if ($o.P[$i] -ne 0) { $o.P[$i] = Shade $o.P[$i] $K } }; return $o }
    # the casing and the colour layer at a quarter of their light, the emissive layer at full light: a dark room
    function Get-Dark { param($Base, $Col, $Emi) return (Merge-On (Get-Dimmed (Merge-On $Base $Col) 0.25) $Emi) }
    # a 3x3 wall of casing with the controller on the middle block
    function New-Wall {
        param($Casing, $Face)
        $w = New-Canvas 48 48
        for ($j = 0; $j -lt 3; $j++) { for ($i = 0; $i -lt 3; $i++) { Merge-Canvas $w $Casing (16 * $i) (16 * $j) } }
        Merge-Canvas $w $Face 16 16
        return $w
    }
    # paints a canvas into the sheet, each pixel as a Scale x Scale square
    function Add-Blit {
        param($Sheet, $Tex, [int]$X0, [int]$Y0, [int]$Scale)
        $row = New-Object 'int[]' $Scale
        for ($y = 0; $y -lt $Tex.H; $y++) { for ($x = 0; $x -lt $Tex.W; $x++) {
            $v = $Tex.P[$y * $Tex.W + $x]
            if (($v -band 0xFF000000) -eq 0) { continue }
            for ($s = 0; $s -lt $Scale; $s++) { $row[$s] = $v }
            for ($s = 0; $s -lt $Scale; $s++) { [Array]::Copy($row, 0, $Sheet.P, ($Y0 + $y * $Scale + $s) * $Sheet.W + $X0 + $x * $Scale, $Scale) }
        } }
    }

    $ptfe = New-StandInPlate 'a=DCDCDC b=CECECE c=C4C4C4 d=AEAEAE e=8F8F8F'
    $darkPlate = New-StandInPlate 'a=4C4C4C b=444444 c=3B3B3B d=2D2D2D e=1F1F1F'
    $checker = New-Canvas
    for ($i = 0; $i -lt 256; $i++) { $checker.P[$i] = if (((($i % 16) + [int][Math]::Floor($i / 16)) % 2) -eq 0) { Hex '3C4048' } else { Hex '4A4F58' } }
    $night = New-Canvas
    for ($i = 0; $i -lt 256; $i++) { $night.P[$i] = Hex '0A0B0D' }

    $dir = Join-Path $OutRoot ($HwDir -replace '/', '\')
    $idle = Read-Png (Join-Path $dir 'overlay_front.png')
    $act = Read-Png (Join-Path $dir 'overlay_front_active.png')
    $emi = Read-Png (Join-Path $dir 'overlay_front_active_emissive.png')
    $lit = @(); for ($f = 0; $f -lt 8; $f++) { $lit += (Merge-On (Get-Frame $act $f) (Get-Frame $emi $f)) }

    $k = 8; $gap = 16; $cell = 16 * $k + $gap
    $rows = 4
    $wallW = 48 * $k + $gap
    $sheet = New-Canvas ($gap + 10 * $cell) ($gap + $rows * $cell + 48 * $k + $gap)
    $bgRow = New-Object 'int[]' $sheet.W
    $bg = Hex '1E2126'
    for ($i = 0; $i -lt $sheet.W; $i++) { $bgRow[$i] = $bg }
    for ($y = 0; $y -lt $sheet.H; $y++) { [Array]::Copy($bgRow, 0, $sheet.P, $y * $sheet.W, $sheet.W) }

    # rows 1-2: idle, the 8 working frames and a dark room, on the light and the dark stand-in; row 3: the emissive layer alone;
    # row 4: the raw colour layer (idle and frames) on a checker, so the empty ring shows
    $r = 0
    foreach ($cs in @($ptfe, $darkPlate)) {
        $y0 = $gap + $r * $cell
        Add-Blit $sheet (Merge-On $cs $idle) $gap $y0 $k
        for ($f = 0; $f -lt 8; $f++) { Add-Blit $sheet (Merge-On $cs $lit[$f]) ($gap + (1 + $f) * $cell) $y0 $k }
        Add-Blit $sheet (Get-Dark $cs (Get-Frame $act 0) (Get-Frame $emi 0)) ($gap + 9 * $cell) $y0 $k
        $r++
    }
    $y0 = $gap + 2 * $cell
    for ($f = 0; $f -lt 8; $f++) { Add-Blit $sheet (Merge-On $night (Get-Frame $emi $f)) ($gap + (1 + $f) * $cell) $y0 $k }
    $y0 = $gap + 3 * $cell
    Add-Blit $sheet (Merge-On $checker $idle) $gap $y0 $k
    for ($f = 0; $f -lt 8; $f++) { Add-Blit $sheet (Merge-On $checker (Get-Frame $act $f)) ($gap + (1 + $f) * $cell) $y0 $k }

    # row 5: a 3x3 wall idle and working on the light stand-in at x8, then the same walls on both stand-ins at x2 and x1
    $wy = $gap + $rows * $cell
    Add-Blit $sheet (New-Wall $ptfe $idle) $gap $wy $k
    Add-Blit $sheet (New-Wall $ptfe $lit[0]) ($gap + $wallW) $wy $k
    $sx = $gap + 2 * $wallW
    $sc = 0
    foreach ($cs in @($ptfe, $darkPlate)) {
        Add-Blit $sheet (New-Wall $cs $idle) ($sx + $sc * (2 * 96 + 2 * $gap)) $wy 2
        Add-Blit $sheet (New-Wall $cs $lit[0]) ($sx + $sc * (2 * 96 + 2 * $gap) + 96 + $gap) $wy 2
        Add-Blit $sheet (New-Wall $cs $idle) ($sx + $sc * (2 * 96 + 2 * $gap)) ($wy + 96 + $gap) 1
        Add-Blit $sheet (New-Wall $cs $lit[0]) ($sx + $sc * (2 * 96 + 2 * $gap) + 96 + $gap) ($wy + 96 + $gap) 1
        $sc++
    }

    $pdir = Split-Path -Parent $Preview
    if ($pdir -and -not (Test-Path -LiteralPath $pdir)) { New-Item -ItemType Directory -Force -Path $pdir | Out-Null }
    $bmp = ConvertTo-Bitmap $sheet
    try { $bmp.Save($Preview, [System.Drawing.Imaging.ImageFormat]::Png) } finally { $bmp.Dispose() }
    Write-Host "preview: $Preview (x$k; on a light and a dark inert-casing stand-in: idle, 8 working frames, dark room; the emissive layer alone; the raw layer on a checker; 3x3 walls at x8, x2 and x1)"
}

if ($problems -gt 0) { throw "$problems file(s) failed the texture checks (see the warnings above)" }

if ($Credits) {
    Write-Host ''
    foreach ($rel in $written) {
        Write-Host ("| ``pack/kubejs/assets/grindless/textures/$rel`` | Generated with tools/assets/$ScriptName (procedural pixel art, original) by the heavy-water plant agent, 2026-10-25 | the pack's licence (pending; proposed CC BY-SA 4.0) |")
    }
}
