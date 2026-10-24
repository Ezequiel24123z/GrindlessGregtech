<#
.SYNOPSIS
  Procedural 16x16 pixel art for the Moon (end of the HV era) of Gregtech Grindless (GregTech style: bevels, top-left
  light, selective outlines).

.DESCRIPTION
  Every pixel is drawn by this script (palettes + char maps + small shading routines); nothing is copied or edited
  from GregTech Modern, GCYR or any other mod. Output is deterministic: re-running overwrites the same bytes.

  Writes (under pack/kubejs/assets/grindless/textures/):
    block/multiblock/lunar_drill/overlay_front.png, overlay_front_active.png(+.mcmeta), overlay_front_active_emissive.png(+.mcmeta)
    item/lunar_vein_sample_frame.png       (layer 0 of grindless:vein_sample_<id> for the veins of veins_moon.json, untinted)
    item/lunar_vein_sample_core.png        (layer 1: greys only, tinted with the colour of each vein)
    item/lunar_quantum_seed.png(+.mcmeta)  (the Moon's half of an Earth-Moon entangled AE2 pair, animated)

  Run from the repo root (PowerShell 5.1 blocks unsigned scripts by default; this bypass only affects that process):
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-MoonTextures.ps1
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-MoonTextures.ps1 -Only drill,seed

  Overlay conventions (same as GregTech Modern's workable casings and as the steam to HV sets): transparent background,
  details only on the overlay, animated variants are vertical 16x(16*n) strips with a .png.mcmeta, *_emissive layers
  hold only the pixels that glow (identical to the colour layer). Every pixel is fully opaque or fully transparent. The
  outer 1 px ring is always left empty so the casing shows around the face.

  The lunar drill (gtceu:lunar_drill) uses GTM's clean stainless steel casing like the rest of HV
  (gtceu:block/casings/solid/machine_casing_clean_stainless_steel); the face has its own dark sky and bezel, so it also
  reads on the other casings (see Build-MoonPreview.ps1).

.PARAMETER Only
  Subset of: drill, sample, seed. Default: everything.
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

# An emissive pixel only counts while the colour layer still shows it: drops the ones a later draw covered
# (-Verbose lists how many, to catch a glow that was covered by accident).
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

# Cylinder shading across a horizontal span. Returns a ramp index: 0 spec, 1 light, 2 mid, 3 dark, 4 darkest.
function Get-SpanTone {
    param([int]$X, [int]$X0, [int]$X1)
    $frac = ($X - $X0 + 0.5) / ($X1 - $X0 + 1)
    if ($frac -lt 0.22) { return 1 }
    elseif ($frac -lt 0.45) { return 0 }
    elseif ($frac -lt 0.62) { return 2 }
    elseif ($frac -lt 0.85) { return 3 }
    else { return 4 }
}

# Neutral steel ramp shared by every overlay (lit -> dark), the same one as the LV to HV sets.
$SteelSpec = 'A=D3D3D3 B=B0B0B0 C=8E8E8E D=707070 E=565656 F=404040 G=2F2F2F H=222222 I=161616 J=0D0D0D'
# HV tier orange, lit -> dark (the Moon is the end of HV): power pulses, the hot cutter.
$OrangeSpec = 'a=FFF1C8 b=FFC857 c=FF9A1E d=E4600F e=A8340A f=5C1A08 g=2C0E05'
# Clean stainless steel (cooler and brighter than the neutral steel), lit -> dark: HV has no titanium, so the lander's
# frame, legs and mast are stainless.
$StainSpec = '0=F7FAFF 1=DCE5F0 2=B8C6D8 3=8E9DB2 4=667690 5=465470 6=2C364C'
# State lamp: green while working (M..P), red while idle (Q..S).
$LampSpec = 'M=E2FFE4 N=62FF86 O=22C257 P=0C6B2E Q=FF5A48 R=B52D22 S=5E1511'

# ============================================================================================
#  LUNAR DRILL - controller face
#  the lander seen on the Moon, as the multiblock is built (moon/lunar_drill.js): a gold-foil body on a stainless deck, a
#  short mast with the state beacon on top, solar wings on booms either side, splayed legs on footpads (the third, back
#  leg hides behind the drill string), and the string going down from the belly into grey regolith with dark ilmenite
#  grains; black sky with stars and the Earth. A rounded bezel (corners cut) instead of the square one of the earlier
#  drills: the first drill that leaves the Earth.
# ============================================================================================
$LunarPal = New-Pal ($SteelSpec + ' ' + $OrangeSpec + ' ' + $StainSpec + ' ' + $LampSpec + ' ' + @'
h=FFF2A8 i=F2C443 j=D49A24 k=9E6616 l=5E3A0C
m=B4D4FF n=4F7FDC o=2A4D9E p=17306E
q=0B0E17
s=E8F6FF t=5AA0F0 u=2A5CB0
v=8A94A8 w=F4F8FF
x=CFCFC6 y=ABABA3 z=8A8A83 T=6B6B65 U=4E4E49 V=34342F
W=2A2924 X=7C786A
'@)

$LunarBase = @(
    '................',
    '..CDDDDDDDDDDE..',
    '.CqqqqqqqqqqqqE.',
    '.DqqqqqqqqqqqqF.',
    '.DqqqqqqqqqqqqF.',
    '.DqqqqqqqqqqqqF.',
    '.DqqqqqqqqqqqqF.',
    '.DqqqqqqqqqqqqF.',
    '.DqqqqqqqqqqqqF.',
    '.DqqqqqqqqqqqqF.',
    '.DqqqqqqqqqqqqF.',
    '.DqqqqqqqqqqqqF.',
    '.DyyyyyyyyyyyyF.',
    '.EzzzzzzzzzzzzG.',
    '..EFFFFFFFFFFG..',
    '................'
)
Assert-Map 'LunarBase' $LunarBase

$GoldRamp = @('h', 'i', 'j', 'k', 'l')
# Dust grains thrown from the hole: ballistic arcs (no air on the Moon), 4 steps each side.
$DustL = @(@(6, 11), @(6, 10), @(5, 10), @(5, 11))
$DustR = @(@(9, 11), @(9, 10), @(10, 10), @(10, 11))

function New-LunarDrillFrame {
    param([bool]$Active, [int]$T = 0)
    $c = New-Canvas; $e = New-Canvas
    $P = $LunarPal
    Write-Map $c 0 0 $LunarBase $P

    # sky: a few stars and the Earth (lit from the top-left like everything else), clear of the wings and the mast
    Set-Px $c 11 2 $P['s']; Set-Px $c 12 2 $P['t']; Set-Px $c 11 3 $P['t']; Set-Px $c 12 3 $P['u']
    $stars = @(@(3, 3, 'w'), @(5, 2, 'v'), @(10, 4, 'v'), @(13, 4, 'v'))
    for ($k = 0; $k -lt $stars.Count; $k++) {
        $s = $stars[$k]; $col = $s[2]
        if ($Active -and ((($T + 2 * $k) % 8) -eq 0)) { $col = if ($col -eq 'v') { 'w' } else { 'v' } }
        Set-Px $c $s[0] $s[1] $P[$col]
    }

    # regolith: lit surface row (y12) and a darker row (y13), grainy; the lander's shadow falls to the bottom-right;
    # a small crater and dark ilmenite grains
    for ($x = 2; $x -le 13; $x++) {
        $n = Get-Noise $x 12 0 21
        $top = if ($n -lt 90) { 'x' } elseif ($n -lt 200) { 'y' } else { 'z' }
        if ($x -ge 9 -and $x -le 12) { $top = if ($n -lt 120) { 'z' } else { 'T' } }
        Set-Px $c $x 12 $P[$top]
        $n2 = Get-Noise $x 13 0 22
        $bot = if ($n2 -lt 110) { 'z' } elseif ($n2 -lt 210) { 'T' } else { 'U' }
        Set-Px $c $x 13 $P[$bot]
    }
    Set-Px $c 3 13 $P['W']; Set-Px $c 4 13 $P['X']; Set-Px $c 11 13 $P['W']; Set-Px $c 12 12 $P['V']

    # legs and footpads (stainless): the lit left leg, the shaded right one
    Set-Px $c 5 9 $P['1']; Set-Px $c 4 10 $P['2']
    Set-Px $c 2 11 $P['2']; Set-Px $c 3 11 $P['1']; Set-Px $c 4 11 $P['3']
    Set-Px $c 10 9 $P['3']; Set-Px $c 11 10 $P['4']
    Set-Px $c 11 11 $P['2']; Set-Px $c 12 11 $P['3']; Set-Px $c 13 11 $P['4']

    # body: stainless deck (y5) over a gold-foil hull (y6..8), crinkled
    Set-Px $c 6 5 $P['1']; Set-Px $c 7 5 $P['0']; Set-Px $c 8 5 $P['2']; Set-Px $c 9 5 $P['4']
    for ($y = 6; $y -le 8; $y++) { for ($x = 6; $x -le 9; $x++) {
        $tone = (Get-SpanTone $x 6 9)
        if ($tone -eq 0) { $tone = 1 }
        if ($y -eq 8) { $tone += 1 }
        $n = Get-Noise $x $y 0 31
        if ($n -lt 50) { $tone -= 1 } elseif ($n -gt 215) { $tone += 1 }
        Set-Px $c $x $y $P[$GoldRamp[(Get-ClampInt $tone 0 4)]]
    } }

    # solar wings on booms (x2..4 and x11..13, y5..7): a lit bevel on the top and left edges, cells darkening to the
    # bottom-right
    $wing = @('nnn', 'noo', 'nop')
    for ($j = 0; $j -lt 3; $j++) { for ($i = 0; $i -lt 3; $i++) {
        Set-Px $c (2 + $i) (5 + $j) $P[[string]$wing[$j][$i]]
        Set-Px $c (11 + $i) (5 + $j) (Shade $P[[string]$wing[$j][$i]] 0.82)
    } }
    Set-Px $c 5 6 $P['2']; Set-Px $c 10 6 $P['4']

    # short mast on the deck (x7..8, y3..4) with the state beacon on top (y2)
    Set-Px $c 7 3 $P['1']; Set-Px $c 8 3 $P['3']; Set-Px $c 7 4 $P['2']; Set-Px $c 8 4 $P['4']
    if ($Active) {
        $core = if (($T % 4) -lt 2) { 'M' } else { 'N' }
        Set-Both $c $e 7 2 $P[$core]; Set-Both $c $e 8 2 $P['O']
    } else { Set-Px $c 7 2 $P['Q']; Set-Px $c 8 2 $P['R'] }

    # drill string (x7..8): turning bands while it works; raised with the bit above the ground while idle
    $bottom = if ($Active) { 11 } else { 10 }
    for ($y = 9; $y -le $bottom; $y++) {
        $lit = (($y + $T) % 2) -eq 0
        Set-Px $c 7 $y $P[$(if ($lit) { 'B' } else { 'C' })]
        Set-Px $c 8 $y $P[$(if ($lit) { 'D' } else { 'E' })]
    }
    if ($Active) {
        # the cutter is in the hole: hole edges dark, the contact point glows, regolith grains fly in arcs
        Set-Px $c 6 12 $P['U']; Set-Px $c 9 12 $P['V']
        Set-Px $c 7 12 $P['0']; Set-Px $c 8 12 $P['3']
        Set-Both $c $e 7 13 $P[$(if (($T % 2) -eq 0) { 'b' } else { 'c' })]
        Set-Both $c $e 8 13 $P[$(if (($T % 2) -eq 0) { 'c' } else { 'd' })]
        $tones = @('x', 'x', 'y', 'z')
        $l = $DustL[$T % 4]; Set-Px $c $l[0] $l[1] $P[$tones[$T % 4]]
        $r = $DustR[($T + 2) % 4]; Set-Px $c $r[0] $r[1] $P[$tones[($T + 2) % 4]]
        # the booms carry the solar power into the hull (emissive), one side at a time; a glint runs over the panels
        if (($T % 4) -lt 2) { Set-Both $c $e 5 6 $P['b'] } else { Set-Both $c $e 10 6 $P['b'] }
        $gl = $T % 4
        Set-Px $c (2 + [Math]::Min($gl, 2)) (5 + [Math]::Max(0, $gl - 2)) $P['m']
        Set-Px $c (11 + [Math]::Min($gl, 2)) (5 + [Math]::Max(0, $gl - 2)) (Shade $P['m'] 0.9)
    } else {
        Set-Px $c 7 11 $P['1']; Set-Px $c 8 11 $P['3']
    }
    Sync-Emissive $c $e
    return @{ Color = $c; Emi = $e }
}

# ============================================================================================
#  ITEMS
# ============================================================================================
# --- lunar vein sample: the vein sample's sealed sibling (a stainless capsule with a gold seal band instead of the bronze
# cap and glass bottom) holding a layered regolith core. Two layers like the vein sample: the frame is drawn untinted,
# the core in greys only so the game tints it with the colour of each vein; the core only paints inside the frame's
# window, which is transparent in the frame layer.
$CapsulePal = New-Pal ($StainSpec + ' ' + @'
h=FFF2A8 i=F2C443 j=D49A24 k=9E6616 l=5E3A0C
W=F6FBFF L=D6E8F8
'@)
$RampCapsule = @($CapsulePal['0'], $CapsulePal['1'], $CapsulePal['2'], $CapsulePal['4'], $CapsulePal['5'])
$RampSeal = @($CapsulePal['h'], $CapsulePal['i'], $CapsulePal['j'], $CapsulePal['k'], $CapsulePal['l'])

function New-LunarSampleFrame {
    $c = New-Canvas
    $st = $RampCapsule
    # valve knob, cap and the gold seal band under it
    foreach ($x in 7..8) { Set-Px $c $x 1 $st[(Get-SpanTone $x 7 8)] }
    foreach ($x in 5..10) { Set-Px $c $x 2 $st[(Get-SpanTone $x 5 10)] }
    foreach ($x in 4..11) { Set-Px $c $x 3 $st[(Get-SpanTone $x 4 11)] }
    foreach ($x in 4..11) { Set-Px $c $x 4 $RampSeal[(Get-SpanTone $x 4 11)] }
    # side rails around the window (x5..10, y5..11) and a rounded stainless bottom cap
    foreach ($y in 5..11) { Set-Px $c 4 $y $st[1]; Set-Px $c 11 $y $st[3] }
    foreach ($x in 4..11) { Set-Px $c $x 12 $st[(Get-ClampInt ((Get-SpanTone $x 4 11) + 1) 0 4)] }
    foreach ($x in 5..10) { Set-Px $c $x 13 $st[(Get-ClampInt ((Get-SpanTone $x 5 10) + 1) 0 4)] }
    foreach ($x in 6..9) { Set-Px $c $x 14 $st[(Get-ClampInt ((Get-SpanTone $x 6 9) + 2) 0 4)] }
    # the window is shielded from the outline pass with a marker, then cleared
    $marker = Hex 'FF00FF'
    foreach ($y in 5..11) { foreach ($x in 5..10) { Set-Px $c $x $y $marker } }
    Add-Outline $c
    foreach ($y in 5..11) { foreach ($x in 5..10) { Set-Px $c $x $y 0 } }
    # glass highlight down the left inner wall (the core never covers x5)
    Set-Px $c 5 5 $CapsulePal['L']
    foreach ($y in 6..10) { Set-Px $c 5 $y $CapsulePal['W'] }
    Set-Px $c 5 11 $CapsulePal['L']
    return $c
}

# Core footprint inside the window: x6..10, y6..11 (y5 stays empty: the headspace of the capsule). A drive-tube core: a lit
# top surface, a dark stratum in the middle and a darker one at the bottom, rounded by the light from the left.
$LunarCoreRows = @(
    'BABBC',
    'ABBCD',
    'DDEEE',
    'BBCCD',
    'ABCDD',
    'DEEFF'
)
$CorePal = New-Palette 'A=F2F2F2 B=D6D6D6 C=B4B4B4 D=8C8C8C E=666666 F=424242'

function New-LunarSampleCore {
    $c = New-Canvas
    Write-Map $c 6 6 $LunarCoreRows $CorePal
    return $c
}

# --- lunar quantum seed: the Moon's half of an Earth-Moon entangled AE2 pair (an ender pearl sealed with helium-3, made only
# on the Moon). A sealed glass ampoule under a cap of sintered regolith: a teal pearl floats in the pale glow of the gas,
# and two sparks circle it always on opposite sides (the entangled pair); the glow breathes. 8 frames, frametime 3.
$SeedPal = New-Pal @'
K=E4E4DC L=C2C2BA M=9C9C95 N=74746E O=50504B k=62625C
a=F6FCFF b=D2EAF8 c=A2C8E4 d=6E9CC4 e=4A729E
f=EEFEFF g=C8F6FF h=A0E8F8 i=6FD3EA j=4CB4D2
p=86F6DA q=34CBA6 r=19937C s=0F6155 t=093C35
w=FFFFFF u=A27CFF x=D2BEFF
'@
$SeedCx = 8.0; $SeedCy = 10.0; $SeedR = 4.9

function New-QuantumSeedFrame {
    param([int]$T)
    $c = New-Canvas
    $P = $SeedPal
    # cap of sintered regolith (lit top-left, a few dark grains) over the sealed neck
    $cap = @(@(1, 6, 9), @(2, 5, 10), @(3, 5, 10))
    foreach ($row in $cap) {
        for ($x = $row[1]; $x -le $row[2]; $x++) {
            $tone = Get-SpanTone $x $row[1] $row[2]
            if ($row[0] -eq 3) { $tone = Get-ClampInt ($tone + 1) 0 4 }
            $col = $P[@('K', 'L', 'M', 'N', 'O')[$tone]]
            if ((Get-Noise $x $row[0] 0 41) -gt 215) { $col = $P['k'] }
            Set-Px $c $x $row[0] $col
        }
    }
    Set-Px $c 7 4 $P['b']; Set-Px $c 8 4 $P['d']
    # the bulb: glass rim lit from the top-left, the gas glowing brighter around the pearl, the pearl itself
    $breath = (($T % 8) -lt 4)
    for ($y = 4; $y -le 15; $y++) { for ($x = 2; $x -le 13; $x++) {
        $dx = ($x + 0.5) - $SeedCx; $dy = ($y + 0.5) - $SeedCy
        $r = [Math]::Sqrt($dx * $dx + $dy * $dy)
        if ($r -gt $SeedR) { continue }
        if ($r -ge ($SeedR - 0.95)) {
            $lit = - ($dx + $dy) / ([Math]::Max($r, 0.01) * 1.4142)
            $tone = if ($lit -gt 0.55) { 'a' } elseif ($lit -gt 0.1) { 'b' } elseif ($lit -gt -0.45) { 'c' } elseif ($lit -gt -0.8) { 'd' } else { 'e' }
            Set-Px $c $x $y $P[$tone]
        } elseif ($r -le 2.0) {
            $lit = - ($dx + $dy) / 1.4142
            $tone = if ($lit -gt 1.1) { 'p' } elseif ($lit -gt 0.2) { 'q' } elseif ($lit -gt -0.7) { 'r' } elseif ($lit -gt -1.3) { 's' } else { 't' }
            Set-Px $c $x $y $P[$tone]
        } else {
            # the gas: brightest around the pearl, deeper towards the glass and on the shaded side
            $tone = if ($r -lt 2.7) { $(if ($breath) { 'f' } else { 'g' }) } elseif ($r -lt 3.3) { 'g' } else { 'h' }
            if ($r -ge 3.3 -and ($dx + $dy) -gt 1.5) { $tone = 'i' }
            if ($r -ge 3.3 -and ($dx + $dy) -gt 3.6) { $tone = 'j' }
            Set-Px $c $x $y $P[$tone]
        }
    } }
    # a reflection on the glass, top-left inside the rim
    Set-Px $c 5 7 $P['w']; Set-Px $c 6 6 $P['a']
    # the entangled pair: two violet sparks (the ender pearl's colour) on opposite sides of the pearl, an eighth of a
    # turn per frame, each with a paler trail
    $ang = [Math]::PI * 2 * (($T % 8) / 8.0) - [Math]::PI / 4
    foreach ($k in 0, 1) {
        $a = $ang + $k * [Math]::PI
        $sx = [int][Math]::Floor($SeedCx + 3.05 * [Math]::Cos($a)); $sy = [int][Math]::Floor($SeedCy + 3.05 * [Math]::Sin($a))
        $ta = $a - [Math]::PI / 4
        $tx = [int][Math]::Floor($SeedCx + 3.05 * [Math]::Cos($ta)); $ty = [int][Math]::Floor($SeedCy + 3.05 * [Math]::Sin($ta))
        if ($tx -ne $sx -or $ty -ne $sy) { Set-Px $c $tx $ty $P['x'] }
        Set-Px $c $sx $sy $P['u']
    }
    Add-Outline $c -LitArgb (Hex '3E5E7E') -ShadeArgb (Hex '1A2A3C')
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

if (Test-Want 'drill') { Out-Overlay 'block/multiblock/lunar_drill' ${function:New-LunarDrillFrame} 2 }
if (Test-Want 'sample') {
    Out-Tex (New-LunarSampleFrame) 'item/lunar_vein_sample_frame.png'
    Out-Tex (New-LunarSampleCore) 'item/lunar_vein_sample_core.png'
}
if (Test-Want 'seed') {
    $seedFrames = @(); for ($f = 0; $f -lt 8; $f++) { $seedFrames += New-QuantumSeedFrame $f }
    Out-Tex (Join-Frames $seedFrames) 'item/lunar_quantum_seed.png' 3
}

# ============================================================================================
#  VERIFY what was written (size, binary alpha, no pure black, mcmeta vs frames, empty casing ring, emissive subset,
#  animation that really animates, grey core that only paints inside the frame's window)
# ============================================================================================
$problems = 0
foreach ($rel in $written) {
    if ($rel.EndsWith('.mcmeta')) { continue }
    $path = Join-Path $OutRoot ($rel -replace '/', '\')
    $img = Read-Png $path
    $msgs = @()
    if ($img.W -ne 16 -or ($img.H % 16) -ne 0) { $msgs += "bad size $($img.W)x$($img.H)" }
    $opaque = 0; $black = 0; $gray = $true
    foreach ($px in $img.P) {
        $alpha = ($px -shr 24) -band 255
        if ($alpha -ne 0 -and $alpha -ne 255) { $msgs += 'partial alpha'; break }
        if ($alpha -eq 255) {
            $opaque++
            $q = Get-Rgba $px
            if ($q[0] -eq 0 -and $q[1] -eq 0 -and $q[2] -eq 0) { $black++ }
            if ($q[0] -ne $q[1] -or $q[1] -ne $q[2]) { $gray = $false }
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
    # block overlays keep the casing's outer 1 px ring visible
    if ($rel -like 'block/*') {
        $nf = [int]($img.H / 16)
        for ($f = 0; $f -lt $nf; $f++) { for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
            if ($x -lt 1 -or $y -lt 1 -or $x -ge 15 -or $y -ge 15) {
                if ((($img.P[($f * 16 + $y) * 16 + $x] -shr 24) -band 255) -ne 0) { $msgs += "opaque pixel in the casing ring (frame $f, $x,$y)"; $f = $nf; $y = 16; break }
            }
        } } }
    }
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
    # a tinted core is greys only and paints only where its frame is transparent
    if ($rel -like '*_sample_core.png') {
        if (-not $gray) { $msgs += 'core is not grayscale' }
        $framePath = Join-Path $OutRoot (($rel -replace '_core\.png$', '_frame.png') -replace '/', '\')
        $frame = Read-Png $framePath
        for ($i = 0; $i -lt 256; $i++) {
            if ((($img.P[$i] -shr 24) -band 255) -ne 0 -and (($frame.P[$i] -shr 24) -band 255) -ne 0) { $msgs += "core covers a frame pixel ($($i % 16),$([int][Math]::Floor($i / 16)))"; break }
        }
    }
    if ($msgs.Count -gt 0) { $problems++; Write-Warning "$rel : $($msgs -join '; ')" }
}

Write-Host "written $($written.Count) files under $OutRoot ($problems with warnings)"
foreach ($rel in $written) { Write-Host "  $rel" }

if ($Credits) {
    Write-Host ''
    foreach ($rel in $written) {
        Write-Host ("| ``pack/kubejs/assets/grindless/textures/$rel`` | Generada con tools/assets/$ScriptName (pixel art procedural, original) por agente de assets, 2026-10-24 | la del pack (pendiente; propuesta CC BY-SA 4.0) |")
    }
}
