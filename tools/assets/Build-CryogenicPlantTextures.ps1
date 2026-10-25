<#
.SYNOPSIS
  Procedural 16x16 pixel art for the EV Cryogenic Plant of Gregtech Grindless (GregTech style: bevels, top-left light, selective
  outlines): the controller face and the Night-Sky Radiator block.

.DESCRIPTION
  Every pixel is drawn by this script (palettes + small shading routines); nothing is copied or edited from GregTech Modern or any
  other mod. Output is deterministic: re-running overwrites the same bytes. Same method, ramps and checks as Build-SyngasTextures.ps1
  (whose helpers are copied here so that script stays untouched): neutral steel bezel, clean stainless vessels, cold blues.

  Writes (under pack/kubejs/assets/grindless/textures/):
    block/multiblock/cryogenic_plant/overlay_front.png, overlay_front_active.png(+.mcmeta), overlay_front_active_emissive.png(+.mcmeta)
    block/night_sky_radiator_top.png, block/night_sky_radiator_side.png, block/night_sky_radiator_bottom.png

  The face shows the cold box: on the left a vacuum-jacketed dewar with a sight glass, on the right the heat exchanger coil of the
  pipe core, a header pipe from the coil to the dewar on top, and a base strip with frost-hazard stripes, one lamp per liquid (oxygen
  blue, nitrogen white, helium pale yellow) and the state lamp. 8 frames, frametime 3: liquid fills the glass and ripples, bubbles of
  boil-off rise, a cold bead runs through the coil and along the header, frost sparkles on the coil and the lamps blink. Idle: an
  empty glass with a rim of frost, a dull coil, red lamp.

  The radiator is a white-coated aluminium panel with three ammonia heat pipes (top), the panel's edge over an aluminium honeycomb
  core with the heat pipe ends (side) and the darker backing with the manifold (bottom). Calm, so twelve of them read as one wing.

  Run from the repo root (PowerShell 5.1 blocks unsigned scripts by default; this bypass only affects that process):
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-CryogenicPlantTextures.ps1
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-CryogenicPlantTextures.ps1 -Only plant -Preview C:\path\cryo.png

  Overlay conventions (GTM's workable casings, as every other set): transparent background, details only on the overlay, animated
  variants are vertical 16x(16*n) strips with a .png.mcmeta, *_emissive layers hold only the pixels that glow (identical to the colour
  layer). Every pixel is fully opaque or fully transparent. The outer 1 px ring is always left empty so the casing shows around the face.
  Drawn for gtceu:block/casings/solid/machine_casing_frost_proof (gtceu:frostproof_machine_casing, ev/cryogenic_plant.js). The radiator
  faces are full blocks: every pixel opaque.

.PARAMETER Only
  Subset of: plant, radiator. Default: everything.
.PARAMETER OutRoot
  Textures root. Default: <repo>/pack/kubejs/assets/grindless/textures
.PARAMETER Preview
  Also write a review sheet (x8, nearest neighbour) to this PNG: the face on a stand-in frost-proof casing (idle, every active frame
  with its emissive layer, a dark-room view), the three radiator faces and a 2x3 wing of radiator tops. Preview only: never shipped.
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

function Get-ClampInt { param([int]$V, [int]$Lo, [int]$Hi) return [Math]::Max($Lo, [Math]::Min($Hi, $V)) }

# Sets a pixel on the colour layer and on the emissive layer (the emissive layer may only hold what the colour layer holds).
function Set-Both {
    param($C, $E, [int]$X, [int]$Y, [int]$Argb)
    Set-Px $C $X $Y $Argb; Set-Px $E $X $Y $Argb
}

# An emissive pixel only counts while the colour layer still shows it: drops the ones a later draw covered.
function Sync-Emissive {
    param($C, $E)
    $dropped = 0
    for ($i = 0; $i -lt $E.P.Length; $i++) { if ($E.P[$i] -ne 0 -and $E.P[$i] -ne $C.P[$i]) { $E.P[$i] = 0; $dropped++ } }
    if ($dropped -gt 0) { Write-Verbose "Sync-Emissive: $dropped emissive pixel(s) covered by a later draw" }
}

# Deterministic 0..255 hash of (x, y, frame, salt): flicker without a random generator.
function Get-Noise {
    param([long]$X, [long]$Y, [long]$T = 0, [long]$Salt = 0)
    $h = (($X * 73856093L) -bxor ($Y * 19349663L) -bxor ($T * 83492791L) -bxor ($Salt * 2654435761L)) % 1000003L
    if ($h -lt 0) { $h = -$h }
    return [int](($h * 7919L) % 256L)
}

# Ramps shared with the HV and EV sets: neutral steel (lit -> dark), clean stainless steel, state lamp.
$SteelSpec = 'A=D3D3D3 B=B0B0B0 C=8E8E8E D=707070 E=565656 F=404040 G=2F2F2F H=222222 I=161616 J=0D0D0D'
$StainSpec = '0=F7FAFF 1=DCE5F0 2=B8C6D8 3=8E9DB2 4=667690 5=465470 6=2C364C'
$LampSpec = 'M=E2FFE4 N=62FF86 O=22C257 P=0C6B2E Q=FF5A48 R=B52D22 S=5E1511'

# Frame shared with the HV faces: 1 px empty ring, steel bezel, dark window x3..13 y3..12, base strip y13.
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
#  CRYOGENIC PLANT - controller face (frost-proof casing)
#  left to right: dewar (x3..7, sight glass x4..6 y5..11), a gap (x8), heat exchanger coil (x9..13); header on y3; base strip y13
# ============================================================================================
$CryoPal = New-Pal ($SteelSpec + ' ' + $StainSpec + ' ' + $LampSpec + ' ' + @'
r=9ED8E8 s=5FA9C2 t=2E6E86 u=F4FBFF
w=6FD0FF x=E6F2FF y=3C8FD0 z=1F5C96
v=FFF1A8
'@)

# the coil of the heat exchanger, in flow order: inlet from the header at the top right, four runs joined at alternate ends, outlet
# at the bottom left
$CoilPath = New-Object System.Collections.Generic.List[object]
$CoilPath.Add(@(12, 4))
foreach ($x in 13..9) { $CoilPath.Add(@($x, 5)) }
$CoilPath.Add(@(9, 6))
foreach ($x in 9..13) { $CoilPath.Add(@($x, 7)) }
$CoilPath.Add(@(13, 8))
foreach ($x in 13..9) { $CoilPath.Add(@($x, 9)) }
$CoilPath.Add(@(9, 10))
foreach ($x in 9..13) { $CoilPath.Add(@($x, 11)) }
$CoilPath.Add(@(13, 12))

function New-CryoFrame {
    param([bool]$Active, [int]$T = 0)
    $c = New-Canvas; $e = New-Canvas
    $P = $CryoPal
    Write-Map $c 0 0 $WindowBase $P

    # ---- header (y3, x4..12): flanges at both ends; a cold bead runs from the coil back to the dewar
    foreach ($x in 4..12) { Set-Px $c $x 3 $P['3'] }
    Set-Px $c 4 3 $P['2']; Set-Px $c 12 3 $P['2']
    if ($Active) {
        $bx = 12 - ($T % 8)
        if ($bx -ge 5) { Set-Both $c $e $bx 3 $P['x'] }
    }

    # ---- dewar (x3..7, y4..12): stainless shell, lit on the left; sight glass x4..6, y5..11
    Set-Px $c 3 4 $P['3']; Set-Px $c 4 4 $P['2']; Set-Px $c 5 4 $P['1']; Set-Px $c 6 4 $P['2']; Set-Px $c 7 4 $P['4']
    foreach ($y in 5..11) { Set-Px $c 3 $y $P['2']; Set-Px $c 7 $y $P['5'] }
    Set-Px $c 3 12 $P['4']; foreach ($x in 4..6) { Set-Px $c $x 12 $P['5'] }; Set-Px $c 7 12 $P['6']
    if ($Active) {
        # the level breathes between y8 and y9; the surface ripples; boil-off bubbles rise through the liquid
        $surface = if ((($T -shr 2) % 2) -eq 0) { 9 } else { 8 }
        foreach ($y in 5..11) { foreach ($x in 4..6) {
            if ($y -lt $surface) {
                # vapour over the liquid: dark, with a little frost on the glass
                if ((Get-Noise $x $y $T 11) -gt 215) { Set-Px $c $x $y $P['t'] }
            } elseif ($y -eq $surface) {
                $rip = if ((($x + $T) % 3) -eq 0) { 'x' } else { 'w' }
                Set-Both $c $e $x $y $P[$rip]
            } else {
                $deep = if ($y -ge 11) { 'z' } elseif ($y -ge 10) { 'y' } else { 'w' }
                Set-Both $c $e $x $y $P[$deep]
            }
        } }
        foreach ($k in 0, 3) {
            $by = 11 - (($T + $k) % 4)
            if ($by -gt $surface) { Set-Both $c $e 5 $by $P['x'] }
        }
    } else {
        # empty and cold: a rim of frost at the bottom of the glass
        foreach ($x in 4..6) { Set-Px $c $x 11 $P['t'] }
        Set-Px $c 5 10 $P['t']
    }

    # ---- heat exchanger coil (x9..13, y4..12)
    for ($i = 0; $i -lt $CoilPath.Count; $i++) {
        $px = $CoilPath[$i][0]; $py = $CoilPath[$i][1]
        if ($Active) {
            $tone = if (($py % 4) -eq 1) { '2' } else { '3' }
            $n = Get-Noise $px $py $T 5
            if ($n -gt 225) { $tone = 'u' } elseif ($n -gt 170) { $tone = 'r' }
            Set-Px $c $px $py $P[$tone]
        } else {
            Set-Px $c $px $py $P[$(if (($py % 4) -eq 1) { '3' } else { '4' })]
        }
    }
    if ($Active) {
        # the cold bead: two pixels a frame apart along the coil, four positions per frame
        $step = [int]($CoilPath.Count / 8)
        $head = ($T * $step) % $CoilPath.Count
        Set-Both $c $e $CoilPath[$head][0] $CoilPath[$head][1] $P['x']
        $tail = ($head + $CoilPath.Count - 1) % $CoilPath.Count
        Set-Both $c $e $CoilPath[$tail][0] $CoilPath[$tail][1] $P['w']
    }

    # ---- base strip (y13): frost-hazard stripes x3..6, a lamp per liquid (oxygen x8, nitrogen x9, helium x10), state lamp x12..13
    foreach ($x in 3..6) {
        if (($x % 2) -eq 1) {
            if ($Active) { Set-Px $c $x 13 $P['r'] } else { Set-Px $c $x 13 $P['s'] }
        } else { Set-Px $c $x 13 $P['t'] }
    }
    Set-Px $c 7 13 $P['H']; Set-Px $c 11 13 $P['H']
    $liquids = @(@(8, 'w'), @(9, 'x'), @(10, 'v'))
    for ($k = 0; $k -lt 3; $k++) {
        $col = $P[[string]$liquids[$k][1]]
        if ($Active) {
            $lit = if ((($T + 2 * $k) % 4) -lt 2) { $col } else { Shade $col 0.8 }
            Set-Both $c $e $liquids[$k][0] 13 $lit
        } else { Set-Px $c $liquids[$k][0] 13 (Shade $col 0.4) }
    }
    if ($Active) {
        $core = if (($T % 4) -lt 2) { 'M' } else { 'N' }
        Set-Both $c $e 12 13 $P[$core]; Set-Both $c $e 13 13 $P['O']
    } else { Set-Px $c 12 13 $P['Q']; Set-Px $c 13 13 $P['R'] }

    Sync-Emissive $c $e
    return @{ Color = $c; Emi = $e }
}

# ============================================================================================
#  NIGHT-SKY RADIATOR - a full block: white thermal coating on top, honeycomb edge on the sides, backing and manifold below
# ============================================================================================
$RadPal = New-Pal @'
a=F6F9FB b=E9EEF2 c=DFE6EC d=C9D2DA e=B6C1CB f=A3AFBA g=8E9AA6 h=7B8794 i=687482 j=56616E k=444E5A
p=CBD6E0 q=9FAAB6 m=B3BEC9 n=6F7B88
'@
$RadPipes = @(3, 8, 12)

function New-RadiatorTop {
    $c = New-Canvas
    $P = $RadPal
    for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
        $ch = if ((Get-Noise $x $y 0 21) -gt 200) { 'c' } else { 'b' }
        Set-Px $c $x $y $P[$ch]
    } }
    # the heat pipes under the coating: a slightly darker channel with a lit edge on its left
    foreach ($px in $RadPipes) {
        foreach ($y in 1..14) { Set-Px $c $px $y $P['d']; Set-Px $c ($px - 1) $y $P['a'] }
        Set-Px $c $px 1 $P['e']; Set-Px $c $px 14 $P['e']
    }
    # aluminium frame of the panel: lit top and left, shaded bottom and right
    foreach ($i in 0..15) { Set-Px $c $i 0 $P['e']; Set-Px $c 0 $i $P['e']; Set-Px $c $i 15 $P['g']; Set-Px $c 15 $i $P['g'] }
    Set-Px $c 0 0 $P['d']; Set-Px $c 15 15 $P['h']; Set-Px $c 15 0 $P['f']; Set-Px $c 0 15 $P['f']
    # four fasteners near the corners
    foreach ($q in @(@(1, 1), @(14, 1), @(1, 14), @(14, 14))) { Set-Px $c $q[0] $q[1] $P['f'] }
    return $c
}

function New-RadiatorSide {
    $c = New-Canvas
    $P = $RadPal
    for ($x = 0; $x -lt 16; $x++) {
        Set-Px $c $x 0 $P['a']                                 # the coated face's edge, catching the light
        Set-Px $c $x 1 $P['b']; Set-Px $c $x 2 $P['c']
        Set-Px $c $x 3 $P['e']                                 # face sheet
        foreach ($y in 4..11) {                               # honeycomb core: fins and the gaps between them
            $ch = if (($x % 2) -eq 0) { 'm' } else { 'h' }
            if ($y -eq 4 -and ($x % 2) -eq 0) { $ch = 'p' }
            Set-Px $c $x $y $P[$ch]
        }
        Set-Px $c $x 12 $P['f']                                # back sheet
        Set-Px $c $x 13 $P['g']; Set-Px $c $x 14 $P['h']       # backing
        Set-Px $c $x 15 $P['i']
    }
    # the ends of the three heat pipes, through the core
    foreach ($px in $RadPipes) {
        Set-Px $c $px 6 $P['q']; Set-Px $c $px 7 $P['q']
        Set-Px $c ($px - 1) 6 $P['d']; Set-Px $c ($px - 1) 7 $P['e']
        Set-Px $c ($px + 1) 6 $P['i']; Set-Px $c ($px + 1) 7 $P['j']
        Set-Px $c $px 8 $P['n']
    }
    return $c
}

function New-RadiatorBottom {
    $c = New-Canvas
    $P = $RadPal
    for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
        $ch = if ((Get-Noise $x $y 0 23) -gt 205) { 'i' } else { 'h' }
        Set-Px $c $x $y $P[$ch]
    } }
    # the manifold across the middle (y7..8) that feeds the three heat pipes, on two brackets
    foreach ($x in 1..14) { Set-Px $c $x 7 $P['m']; Set-Px $c $x 8 $P['n'] }
    Set-Px $c 1 7 $P['q']; Set-Px $c 14 8 $P['j']
    foreach ($bx in 3, 12) { foreach ($y in 6, 9) { Set-Px $c $bx $y $P['g'] } }
    foreach ($px in $RadPipes) { Set-Px $c $px 6 $P['n']; Set-Px $c $px 9 $P['j'] }
    # edges
    foreach ($i in 0..15) { Set-Px $c $i 0 $P['g']; Set-Px $c 0 $i $P['g']; Set-Px $c $i 15 $P['j']; Set-Px $c 15 $i $P['j'] }
    Set-Px $c 0 0 $P['f']; Set-Px $c 15 15 $P['k']
    return $c
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

if (Test-Want 'plant') { Out-Overlay 'block/multiblock/cryogenic_plant' ${function:New-CryoFrame} 3 }
if (Test-Want 'radiator') {
    Out-Tex (New-RadiatorTop) 'block/night_sky_radiator_top.png'
    Out-Tex (New-RadiatorSide) 'block/night_sky_radiator_side.png'
    Out-Tex (New-RadiatorBottom) 'block/night_sky_radiator_bottom.png'
}

# ============================================================================================
#  VERIFY what was written (size, binary alpha, no pure black, mcmeta vs frames, empty casing ring on the overlays, fully opaque
#  block faces, emissive subset, animation that really animates) - the checks of Build-SyngasTextures.ps1
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
            $q = Get-Rgba $px
            if ($q[0] -eq 0 -and $q[1] -eq 0 -and $q[2] -eq 0) { $black++ }
        }
    }
    if ($opaque -eq 0) { $msgs += 'fully transparent' }
    if ($black -gt 0) { $msgs += "$black pure-black px" }
    if (Test-Path -LiteralPath ($path + '.mcmeta')) {
        $n = [int]($img.H / 16)
        if ($n -lt 4 -or $n -gt 8) { $msgs += "animation has $n frames (expected 4-8)" }
        if ($rel -notlike '*_emissive.png') {
            $seen = @{}
            for ($f = 0; $f -lt $n; $f++) { $seen[(($img.P[($f * 256)..($f * 256 + 255)]) -join ',')] = 1 }
            if ($seen.Count -lt 4) { $msgs += "only $($seen.Count) distinct frames out of $n" }
        }
    }
    if ($rel -like 'block/multiblock/*') {
        $nf = [int]($img.H / 16)
        for ($f = 0; $f -lt $nf; $f++) { for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
            if ($x -lt 1 -or $y -lt 1 -or $x -ge 15 -or $y -ge 15) {
                if ((($img.P[($f * 16 + $y) * 16 + $x] -shr 24) -band 255) -ne 0) { $msgs += "opaque pixel in the casing ring (frame $f, $x,$y)"; $f = $nf; $y = 16; break }
            }
        } } }
    } elseif ($opaque -ne $img.P.Length) {
        $msgs += "block face with $($img.P.Length - $opaque) transparent px (must be fully opaque)"
    }
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
    # a bevelled stand-in of GTM's frost-proof casing (light blue-grey aluminium)
    function New-StandInFrostproof {
        $c = New-Canvas 16 16
        $pal = New-Palette 'a=E3E9EF b=D3DBE3 c=C3CDD7 d=7A8794 e=A3AFBB f=8F9BA8 l=B5C0CB m=C6D0DA'
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
    function Get-Frame { param($Strip, [int]$Index) $f = New-Canvas 16 16; [Array]::Copy($Strip.P, $Index * 256, $f.P, 0, 256); return $f }
    function Merge-On { param($Dst, $Src) $o = Copy-Canvas $Dst; Merge-Canvas $o $Src; return $o }
    function Get-Dark {
        param($Base, $Col, $Emi)
        $o = Merge-On $Base $Col
        for ($i = 0; $i -lt $o.P.Length; $i++) { $o.P[$i] = Shade $o.P[$i] 0.25 }
        return (Merge-On $o $Emi)
    }
    $tiles = New-Object System.Collections.Generic.List[object]
    $dir = Join-Path $OutRoot 'block\multiblock\cryogenic_plant'
    if (Test-Path -LiteralPath (Join-Path $dir 'overlay_front.png')) {
        $casing = New-StandInFrostproof
        $idle = Read-Png (Join-Path $dir 'overlay_front.png')
        $act = Read-Png (Join-Path $dir 'overlay_front_active.png')
        $emi = Read-Png (Join-Path $dir 'overlay_front_active_emissive.png')
        $tiles.Add((Merge-On $casing $idle))
        for ($f = 0; $f -lt 8; $f++) { $tiles.Add((Merge-On (Merge-On $casing (Get-Frame $act $f)) (Get-Frame $emi $f))) }
        $tiles.Add((Get-Dark $casing (Get-Frame $act 0) (Get-Frame $emi 0)))
    }
    foreach ($face in 'top', 'side', 'bottom') {
        $p = Join-Path $OutRoot "block\night_sky_radiator_$face.png"
        if (Test-Path -LiteralPath $p) { $tiles.Add((Read-Png $p)) }
    }
    $scale = 8; $gap = 4
    $wing = $null
    $top = Join-Path $OutRoot 'block\night_sky_radiator_top.png'
    if (Test-Path -LiteralPath $top) {
        # a wing seen from above: 2 radiators across, 3 deep
        $t = Read-Png $top
        $wing = New-Canvas 32 48
        for ($j = 0; $j -lt 3; $j++) { for ($i = 0; $i -lt 2; $i++) { Merge-Canvas $wing $t ($i * 16) ($j * 16) } }
    }
    $wingW = if ($wing) { 32 * 4 + $gap } else { 0 }
    $sheetH = [Math]::Max(16 * $scale, $(if ($wing) { 48 * 4 } else { 0 })) + 2 * $gap
    $sheet = New-Canvas (($tiles.Count) * (16 * $scale + $gap) + $gap + $wingW) $sheetH
    for ($i = 0; $i -lt $sheet.P.Length; $i++) { $sheet.P[$i] = Hex '202428' }
    for ($t2 = 0; $t2 -lt $tiles.Count; $t2++) {
        $x0 = $gap + $t2 * (16 * $scale + $gap)
        for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
            $v = $tiles[$t2].P[$y * 16 + $x]
            if (($v -band 0xFF000000) -eq 0) { continue }
            Set-Rect $sheet ($x0 + $x * $scale) ($gap + $y * $scale) $scale $scale $v
        } }
    }
    if ($wing) {
        $x0 = $gap + $tiles.Count * (16 * $scale + $gap)
        for ($y = 0; $y -lt 48; $y++) { for ($x = 0; $x -lt 32; $x++) { Set-Rect $sheet ($x0 + $x * 4) ($gap + $y * 4) 4 4 $wing.P[$y * 32 + $x] } }
    }
    Save-Png $sheet ([System.IO.Path]::GetFullPath($Preview))
    Write-Host "preview: $Preview (idle, 8 active frames with emissive, dark room, the radiator top, side and bottom, a 2x3 wing at x4)"
}

if ($Credits) {
    Write-Host ''
    foreach ($rel in $written) {
        Write-Host ("| ``pack/kubejs/assets/grindless/textures/$rel`` | Generated with tools/assets/$ScriptName (procedural pixel art, original) by the cryogenic plant agent, 2026-10-25 | the pack's licence (pending; proposed CC BY-SA 4.0) |")
    }
}
