<#
.SYNOPSIS
  Procedural 16x16 pixel art for the road to the first rocket of Gregtech Grindless (MV Engine Test Stand, HV Composite Autoclave and
  their parts), GregTech style: bevels, top-left light, selective outlines.

.DESCRIPTION
  Every pixel is drawn by this script (palettes + char maps + small shading routines); nothing is copied or edited from GregTech
  Modern, GCYR or any other mod. Output is deterministic: re-running overwrites the same bytes.

  Writes (under pack/kubejs/assets/grindless/textures/):
    block/multiblock/engine_test_stand/overlay_front.png, overlay_front_active.png(+.mcmeta), overlay_front_active_emissive.png(+.mcmeta)
    block/multiblock/composite_autoclave/  (the same three)
    item/qualified_power_thruster.png, item/untested_rocket_motor.png, item/ablative_heat_shield_tile.png,
    item/composite_overwrapped_tank.png

  Run from the repo root (PowerShell 5.1 blocks unsigned scripts by default; this bypass only affects that process):
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-LaunchRoadTextures.ps1
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-LaunchRoadTextures.ps1 -Only stand,items

  Overlay conventions (same as GregTech Modern's workable casings and as the steam to HV sets): transparent background,
  details only on the overlay, animated variants are vertical 16x(16*n) strips with a .png.mcmeta, *_emissive layers hold only
  the pixels that glow (identical to the colour layer). Every pixel is fully opaque or fully transparent. The outer 1 px ring is
  always left empty so the casing shows around the face.

  The test stand is MV (aluminium frost-proof casing, gtceu:block/casings/solid/machine_casing_frost_proof): MV blue accents like the
  MV set. The autoclave is HV (clean stainless steel casing, gtceu:block/casings/solid/machine_casing_clean_stainless_steel): HV
  orange accents and stainless like the HV set.

.PARAMETER Only
  Subset of: stand, autoclave, items. Default: everything.
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
# MV tier blue, lit -> dark (the MV set's): panel stripes, telemetry lights.
$BlueSpec = 'a=E4FBFF b=8FE8FF c=3CC4F0 d=1E8FD0 e=1560A0 f=0C3A6A g=071F3C'
# HV tier orange, lit -> dark (the HV set's): stripes, heat.
$OrangeSpec = 'a=FFF1C8 b=FFC857 c=FF9A1E d=E4600F e=A8340A f=5C1A08 g=2C0E05'
# Clean stainless steel, lit -> dark (the HV set's).
$StainSpec = '0=F7FAFF 1=DCE5F0 2=B8C6D8 3=8E9DB2 4=667690 5=465470 6=2C364C'

# Frame shared by both faces: 1 px empty ring, steel bezel, dark window x3..13 y3..10, a plate row (y11) and a two-row panel
# (y12..13) for the stripes and the state lamp (the layout of the MV vein drill).
$PanelBase = @(
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
    '.DDDDDDDDDDDDDF.',
    '.DGGGGGGGGGGGGF.',
    '.DGGGGGGGGGGGGF.',
    '.EFFFFFFFFFFFFG.',
    '................'
)
Assert-Map 'PanelBase' $PanelBase

# Frame of the autoclave face: the window runs down to y12 (the door is round and tall), one strip row (y13) for the stripes and
# the state lamp (the layout of the HV refinery and reformer).
$DoorBase = @(
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
Assert-Map 'DoorBase' $DoorBase

# ============================================================================================
#  ENGINE TEST STAND - controller face (aluminium frost-proof casing, MV)
#  the stand seen from the front, as the multiblock is built (launch_road/engine_test_stand.js), against the test site's dusk sky:
#  the run tank on top (RP-1 half
#  amber, LOX half frosted, a seam between them), the feed line down to the engine, two aluminium truss legs standing in a
#  firebrick flame bucket, the engine mount and its copper bell hanging between them. Firing: a kerolox plume with shock diamonds
#  walking down it hits the bucket, exhaust billows out of the trench on both sides, the telemetry lights on the legs blink.
#  Idle: a cold bell, an empty bucket, the lamp red. Blue striped panel and the state lamp along the base (MV).
# ============================================================================================
$StandPal = New-Pal ($SteelSpec + ' ' + $BlueSpec + ' ' + @'
0=EAF6FF 1=C2DDEE 2=8FB5CE 3=6790AC 4=49708C 5=335168
h=E2FFE4 i=62FF86 j=22C257 k=0C6B2E
r=FF5A48 s=B52D22 t=5E1511
u=FFFBE6 v=FFE07A w=FFA43A x=E2601E
K=EFEFEF L=C4C4C4 M=9A9A9A
N=B4583A O=8A3E28 P=5E2A1C
Q=E7A877 R=B87245 S=7E4A28
T=E6C46A U=B28E3C V=DDF2FF W=A9CFE6
l=232E40 m=2B384C n=344358
'@)

$StandLegL = @(@(4, 4, '1'), @(4, 5, '3'), @(4, 6, '1'), @(4, 7, '3'), @(4, 8, '1'), @(4, 9, '3'))
$StandLegR = @(@(12, 4, '2'), @(12, 5, '4'), @(12, 6, '2'), @(12, 7, '4'), @(12, 8, '2'), @(12, 9, '4'))
# The test site behind the stand, at dusk: darkest at the top, lighter towards the horizon (y3..9 of the window).
$StandSky = @('l', 'l', 'l', 'm', 'm', 'n', 'n')
# Exhaust puffs leaving the trench: three steps out and up, one per frame, the right side two frames behind the left.
$PuffL = @(@(6, 9), @(5, 9), @(5, 8))
$PuffR = @(@(10, 9), @(11, 9), @(11, 8))
$PuffTone = @('K', 'L', 'M')

function New-StandFrame {
    param([bool]$Active, [int]$T = 0)
    $c = New-Canvas; $e = New-Canvas
    $P = $StandPal
    Write-Map $c 0 0 $PanelBase $P
    for ($y = 3; $y -le 9; $y++) { for ($x = 3; $x -le 13; $x++) { Set-Px $c $x $y $P[$StandSky[$y - 3]] } }

    # base panel: blue stripes (x2..8) and the state lamp (x10..13), the MV drill's layout
    for ($y = 12; $y -le 13; $y++) {
        for ($x = 2; $x -le 8; $x++) {
            if ((($x + $y) % 4) -lt 2) {
                $blue = if ($Active) { @('c', 'd')[$y - 12] } else { @('e', 'f')[$y - 12] }
                if ($Active) { Set-Both $c $e $x $y $P[$blue] } else { Set-Px $c $x $y $P[$blue] }
            } else { Set-Px $c $x $y $P['g'] }
        }
        Set-Px $c 9 $y $P['G']
    }
    if ($Active) {
        $core = if (($T % 4) -lt 2) { 'h' } else { 'i' }
        $lens = @("${core}iij", 'jjkk')
        for ($j = 0; $j -lt 2; $j++) { for ($i = 0; $i -lt 4; $i++) { Set-Both $c $e (10 + $i) (12 + $j) $P[[string]$lens[$j][$i]] } }
    } else {
        $lens = @('rrss', 'sstt')
        for ($j = 0; $j -lt 2; $j++) { for ($i = 0; $i -lt 4; $i++) { Set-Px $c (10 + $i) (12 + $j) $P[[string]$lens[$j][$i]] } }
    }

    # flame bucket (y10): firebrick floor, grainy; the trench under the bell glows while the plume hits it
    for ($x = 3; $x -le 13; $x++) {
        $n = Get-Noise $x 10 0 5
        $tone = if ($n -lt 80) { 'N' } elseif ($n -lt 190) { 'O' } else { 'P' }
        Set-Px $c $x 10 $P[$tone]
    }

    # run tank (y3, x5..11): rounded aluminium ends, the RP-1 half amber, the LOX half frosted, a dark seam between
    $tank = '3TTEVW4'
    for ($i = 0; $i -lt 7; $i++) { Set-Px $c (5 + $i) 3 $P[[string]$tank[$i]] }
    Set-Px $c 6 3 $P[$(if ($Active) { 'T' } else { 'U' })]

    # legs in the bucket and the braces up to the tank
    foreach ($px in $StandLegL) { Set-Px $c $px[0] $px[1] $P[[string]$px[2]] }
    foreach ($px in $StandLegR) { Set-Px $c $px[0] $px[1] $P[[string]$px[2]] }
    Set-Px $c 5 4 $P['2']; Set-Px $c 11 4 $P['4']

    # feed line (x8, y4), the chamber on its mount (y5) and the copper bell (y6..7)
    Set-Px $c 8 4 $P['C']
    $chamber = 'BCE'
    for ($i = 0; $i -lt 3; $i++) { Set-Px $c (7 + $i) 5 $P[[string]$chamber[$i]] }
    $bellUp = 'QRS'; $bellDn = 'QRRSS'
    for ($i = 0; $i -lt 3; $i++) { Set-Px $c (7 + $i) 6 $P[[string]$bellUp[$i]] }
    for ($i = 0; $i -lt 5; $i++) { Set-Px $c (6 + $i) 7 $P[[string]$bellDn[$i]] }

    if ($Active) {
        # the throat glows through the bell
        Set-Both $c $e 8 6 $P[$(if (($T % 2) -eq 0) { 'w' } else { 'x' })]
        # kerolox plume (y8..9): a bright core, a shock diamond walking down it, the edges flickering
        $diamondTop = (($T % 2) -eq 0)
        Set-Both $c $e 7 8 $P['v']; Set-Both $c $e 9 8 $P['w']
        Set-Both $c $e 8 8 $P[$(if ($diamondTop) { 'u' } else { 'v' })]
        Set-Both $c $e 7 9 $P['w']; Set-Both $c $e 9 9 $P['x']
        Set-Both $c $e 8 9 $P[$(if ($diamondTop) { 'v' } else { 'u' })]
        if (($T % 4) -lt 2) { Set-Both $c $e 6 9 $P['x'] } else { Set-Both $c $e 10 9 $P['x'] }
        # the plume hits the bucket: the floor under it glows
        $hit = @('x', $(if (($T % 2) -eq 0) { 'v' } else { 'w' }), 'w', $(if (($T % 2) -eq 0) { 'w' } else { 'v' }), 'x')
        for ($i = 0; $i -lt 5; $i++) { Set-Both $c $e (6 + $i) 10 $P[$hit[$i]] }
        # exhaust billows out of the trench on both sides (smoke, not emissive)
        $pl = $T % 4
        if ($pl -lt 3) { Set-Px $c $PuffL[$pl][0] $PuffL[$pl][1] $P[$PuffTone[$pl]] }
        $pr = ($T + 2) % 4
        if ($pr -lt 3) { Set-Px $c $PuffR[$pr][0] $PuffR[$pr][1] $P[$PuffTone[$pr]] }
        # telemetry lights on the leg tops, one side at a time
        if (($T % 4) -lt 2) { Set-Both $c $e 4 4 $P['b'] } else { Set-Both $c $e 12 4 $P['b'] }
        # the frost on the LOX half glints
        if (($T % 8) -lt 4) { Set-Px $c 9 3 $P['a'] }
    } else {
        # a cold engine: the bell's inside is dark, a last wisp over the bucket
        Set-Px $c 8 6 $P['S']
        Set-Px $c 8 8 $P['F']
    }
    Sync-Emissive $c $e
    return @{ Color = $c; Emi = $e }
}

# ============================================================================================
#  COMPOSITE AUTOCLAVE - controller face (clean stainless steel casing, HV)
#  the round door of a horizontal pressure vessel, as the multiblock is built (launch_road/composite_autoclave.js): a stainless door
#  lit from the top-left inside a darker locking ring with eight lugs, a round viewport in the middle. Curing: the viewport glows
#  with the heaters inside, the nitrogen lamp (blue) on the top-left pulses as the vessel holds pressure, the stripes light up.
#  Idle: a dark viewport, the nitrogen lamp off, the lamp red. Hazard stripes and the state lamp along the base (HV).
# ============================================================================================
$ClavePal = New-Pal ($SteelSpec + ' ' + $OrangeSpec + ' ' + $StainSpec + ' ' + @'
M=E2FFE4 N=62FF86 O=22C257 P=0C6B2E Q=FF5A48 R=B52D22 S=5E1511
w=9EE3FF x=3A9AD8 y=1D4F7A
'@)

$DoorCx = 8.5; $DoorCy = 8.0; $DoorR = 4.85; $RingIn = 3.85; $PortR = 1.7
$DoorHeat = @('g', 'f', 'e', 'd', 'c', 'b', 'a')

function New-ClaveFrame {
    param([bool]$Active, [int]$T = 0)
    $c = New-Canvas; $e = New-Canvas
    $P = $ClavePal
    Write-Map $c 0 0 $DoorBase $P

    for ($y = 3; $y -le 12; $y++) { for ($x = 3; $x -le 13; $x++) {
        $dx = ($x + 0.5) - $DoorCx; $dy = ($y + 0.5) - $DoorCy
        $r = [Math]::Sqrt($dx * $dx + $dy * $dy)
        if ($r -gt $DoorR) { continue }
        # light from the top-left: +1 on the lit side, -1 on the shaded side
        $lit = - ($dx + $dy) / ([Math]::Max($r, 0.01) * 1.4142)
        if ($r -ge $RingIn) {
            # the locking ring: darker steel, eight lugs (one every 45 degrees) catch the light
            $ang = [Math]::Atan2($dy, $dx)
            $k = [Math]::Round($ang / ([Math]::PI / 4))
            $lug = [Math]::Abs($ang - $k * [Math]::PI / 4) -lt 0.2
            if ($lug) { $tone = if ($lit -gt 0) { 'A' } else { 'C' } }
            else { $tone = if ($lit -gt 0.45) { 'C' } elseif ($lit -gt -0.45) { 'D' } else { 'F' } }
            Set-Px $c $x $y $P[$tone]
        } elseif ($r -gt $PortR) {
            # the door face: stainless, brighter towards the top-left
            $v = $lit * ($r / $RingIn)
            $tone = if ($v -gt 0.55) { '0' } elseif ($v -gt 0.15) { '1' } elseif ($v -gt -0.25) { '2' } elseif ($v -gt -0.6) { '3' } else { '4' }
            Set-Px $c $x $y $P[$tone]
        } else {
            # the viewport: the heaters inside glow while it cures, dark glass otherwise
            if ($Active) {
                $hv = 4 - [int][Math]::Floor($r * 1.4)
                $n = Get-Noise $x $y $T 17
                if ($n -lt 70) { $hv -= 1 } elseif ($n -gt 200) { $hv += 1 }
                Set-Both $c $e $x $y $P[$DoorHeat[(Get-ClampInt $hv 1 6)]]
            } else {
                Set-Px $c $x $y $P[$(if ($lit -gt 0.6) { 'F' } else { 'H' })]
            }
        }
    } }
    # the viewport's rim, darker than the door
    Set-Px $c 7 6 $P['4']; Set-Px $c 10 9 $P['5']

    # nitrogen lamp (top-left corner of the window): pulses blue while the vessel is under pressure
    if ($Active) {
        $pulse = if (($T % 4) -lt 2) { 'w' } else { 'x' }
        Set-Both $c $e 3 3 $P[$pulse]
    } else { Set-Px $c 3 3 $P['y'] }

    # base strip (y13): hazard stripes x3..9, state lamp x11..13
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
#  ITEMS
# ============================================================================================
# --- qualified power thruster: a ducted thruster (dark intake ring with a fan hub, an aluminium body shaded as a cylinder, a short
# nozzle) with a green "passed" tag on a string: the tag is what the static fire adds.
$ThrusterPal = New-Pal ($SteelSpec + ' ' + @'
0=EAF6FF 1=C2DDEE 2=8FB5CE 3=6790AC 4=49708C
n=8CF29A o=34B94E p=1C6E2E q=F4FFF2 l=D9C9A0
'@)
$RampAlu = @('0', '1', '2', '3', '4')

function New-QualifiedThruster {
    $c = New-Canvas
    $P = $ThrusterPal
    # intake ring (y2..3) with the fan hub inside
    foreach ($x in 4..9) { Set-Px $c $x 2 $P[$(if ($x -lt 7) { 'D' } else { 'E' })] }
    foreach ($x in 4..9) { Set-Px $c $x 3 $P['G'] }
    Set-Px $c 6 3 $P['B']; Set-Px $c 7 3 $P['C']
    # body (y4..9): a cylinder of aluminium with a seam
    foreach ($y in 4..9) { foreach ($x in 4..9) {
        $tone = Get-SpanTone $x 4 9
        if ($y -eq 7) { $tone = Get-ClampInt ($tone + 1) 0 4 }
        Set-Px $c $x $y $P[$RampAlu[$tone]]
    } }
    # nozzle (y10..12), narrowing, then the dark exhaust
    foreach ($x in 5..8) { Set-Px $c $x 10 $P[$RampAlu[(Get-ClampInt ((Get-SpanTone $x 5 8) + 1) 0 4)]] }
    foreach ($x in 5..8) { Set-Px $c $x 11 $P[@('C', 'D', 'E', 'F')[$x - 5]] }
    Set-Px $c 6 12 $P['G']; Set-Px $c 7 12 $P['H']
    Add-Outline $c
    # the tag: a string from the body to a green tag with a white tick (drawn after the outline, with its own dark edge)
    Set-Px $c 10 5 $P['l']; Set-Px $c 11 6 $P['l']
    $tag = @('oop', 'nop', 'oqp', 'qop', 'opp')
    for ($j = 0; $j -lt 5; $j++) { for ($i = 0; $i -lt 3; $i++) { Set-Px $c (11 + $i) (7 + $j) $P[[string]$tag[$j][$i]] } }
    Set-Px $c 13 8 $P['q']
    foreach ($y in 7..11) { Set-Px $c 14 $y $P['p'] }
    foreach ($x in 11..13) { Set-Px $c $x 12 $P['p'] }
    return $c
}

# --- untested rocket motor: an injector plate on top, the combustion chamber wrapped in gold Kapton foil, a dark throat and a
# copper bell flaring down; a red "remove before flight" tag hangs from the chamber (it has not fired yet).
$MotorPal = New-Pal ($SteelSpec + ' ' + @'
h=FFF2A8 i=F2C443 j=D49A24 k=9E6616 l=5E3A0C
Q=E7A877 R=B87245 S=7E4A28 T=4E2C18
q=FF6A55 r=D42D24 s=8E1A16 t=FFFFFF u=D9C9A0
'@)
$GoldRamp = @('h', 'i', 'j', 'k', 'l')
$CopperRamp = @('Q', 'Q', 'R', 'S', 'T')

function New-UntestedMotor {
    $c = New-Canvas
    $P = $MotorPal
    # injector plate and mount (y1..2)
    foreach ($x in 6..9) { Set-Px $c $x 1 $P[@('B', 'A', 'C', 'D')[$x - 6]] }
    foreach ($x in 5..10) { Set-Px $c $x 2 $P[@('C', 'B', 'B', 'C', 'D', 'E')[$x - 5]] }
    # chamber (y3..6): gold Kapton foil, crinkled
    foreach ($y in 3..6) { foreach ($x in 5..10) {
        $tone = Get-SpanTone $x 5 10
        $n = Get-Noise $x $y 0 3
        if ($n -lt 50) { $tone -= 1 } elseif ($n -gt 215) { $tone += 1 }
        Set-Px $c $x $y $P[$GoldRamp[(Get-ClampInt $tone 0 4)]]
    } }
    # throat (y7)
    Set-Px $c 7 7 $P['D']; Set-Px $c 8 7 $P['F']
    # bell (y8..13), flaring; the inside shows at the mouth
    $bell = @(@(7, 8, 8), @(6, 9, 9), @(6, 9, 10), @(5, 10, 11), @(5, 10, 12), @(4, 11, 13))
    foreach ($b in $bell) {
        for ($x = $b[0]; $x -le $b[1]; $x++) { Set-Px $c $x $b[2] $P[$CopperRamp[(Get-SpanTone $x $b[0] $b[1])]] }
    }
    foreach ($x in 6..9) { Set-Px $c $x 13 $P['T'] }
    Add-Outline $c
    # remove-before-flight tag on a string from the chamber
    Set-Px $c 4 4 $P['u']; Set-Px $c 3 5 $P['u']
    $tag = @('qrs', 'ttt', 'rrs', 'ttt', 'rss')
    for ($j = 0; $j -lt 5; $j++) { for ($i = 0; $i -lt 3; $i++) { Set-Px $c (1 + $i) (6 + $j) $P[[string]$tag[$j][$i]] } }
    foreach ($y in 6..10) { Set-Px $c 0 $y $P['s'] }
    return $c
}

# --- ablative heat shield tile: a square tile with a pale glass-fibre rim, bevelled, and a dark honeycomb ablator inside (the cells
# filled with charred resin, the honeycomb walls a shade lighter), lit from the top-left.
$TilePal = New-Pal @'
a=E9EEDD b=C9D2BC c=A2AD95 d=767F6C e=4E5648
k=6B5A4A l=54473A m=3E342B n=2C251F o=1C1814
'@
$TileCells = @(
    'lmmnlmmnlm',
    'mnnmlnnmln',
    'lmmnlmmnlm',
    'nlmmnlmmnl',
    'mlnnmlnnml',
    'nlmmnlmmnl',
    'lmmnlmmnlm',
    'mnnmlnnmln',
    'lmmnlmmnlm',
    'nlmmnlmmnl'
)

function New-HeatShieldTile {
    $c = New-Canvas
    $P = $TilePal
    # rim (x2..13, y2..13), bevelled: lit top and left edges, shaded bottom and right
    foreach ($x in 2..13) { Set-Px $c $x 2 $P['a']; Set-Px $c $x 13 $P['d'] }
    foreach ($y in 3..12) { Set-Px $c 2 $y $P['b']; Set-Px $c 13 $y $P['d'] }
    Set-Px $c 13 2 $P['c']; Set-Px $c 2 13 $P['c']
    # the honeycomb (x3..12, y3..12); the cells darken towards the bottom-right
    Write-Map $c 3 3 $TileCells $P
    foreach ($y in 3..12) { foreach ($x in 3..12) {
        if (($x + $y) -ge 21) { Set-Px $c $x $y (Shade (Get-Px $c $x $y) 0.8) }
    } }
    # a few lighter walls catch the light on the top-left
    Set-Px $c 3 3 $P['k']; Set-Px $c 4 3 $P['k']; Set-Px $c 3 4 $P['k']
    Add-Outline $c -LitArgb (Hex '5C6352') -ShadeArgb (Hex '2A2E26')
    return $c
}

# --- composite overwrapped tank: a capsule standing up, stainless domes top and bottom, a valve on top, and the body wrapped in
# yellow para-aramid with a diagonal weave, shaded as a cylinder.
$CopvPal = New-Pal ($StainSpec + ' ' + @'
h=FFF4B0 i=F3D45A j=D9AE2E k=A97F18 l=6E520E
'@)
$KevlarRamp = @('h', 'i', 'j', 'k', 'l')
$StainRamp = @('0', '1', '2', '4', '5')

function New-CopvTank {
    $c = New-Canvas
    $P = $CopvPal
    # valve on top
    Set-Px $c 7 0 $P['2']; Set-Px $c 8 0 $P['4']
    Set-Px $c 7 1 $P['1']; Set-Px $c 8 1 $P['3']
    # top dome (y2..3), bottom dome (y13..14)
    foreach ($x in 6..9) { Set-Px $c $x 2 $P[$StainRamp[(Get-SpanTone $x 6 9)]] }
    foreach ($x in 5..10) { Set-Px $c $x 3 $P[$StainRamp[(Get-SpanTone $x 5 10)]] }
    foreach ($x in 5..10) { Set-Px $c $x 13 $P[$StainRamp[(Get-ClampInt ((Get-SpanTone $x 5 10) + 1) 0 4)]] }
    foreach ($x in 6..9) { Set-Px $c $x 14 $P[$StainRamp[(Get-ClampInt ((Get-SpanTone $x 6 9) + 2) 0 4)]] }
    # body (y4..12): para-aramid weave, cylinder shading plus a diagonal stripe every 3 px
    foreach ($y in 4..12) { foreach ($x in 4..11) {
        $tone = Get-SpanTone $x 4 11
        if ((($x + $y) % 3) -eq 0) { $tone += 1 }
        if ($y -eq 4 -or $y -eq 12) { $tone += 1 }
        Set-Px $c $x $y $P[$KevlarRamp[(Get-ClampInt $tone 0 4)]]
    } }
    Add-Outline $c
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

if (Test-Want 'stand') { Out-Overlay 'block/multiblock/engine_test_stand' ${function:New-StandFrame} 2 }
if (Test-Want 'autoclave') { Out-Overlay 'block/multiblock/composite_autoclave' ${function:New-ClaveFrame} 4 }
if (Test-Want 'items') {
    Out-Tex (New-QualifiedThruster) 'item/qualified_power_thruster.png'
    Out-Tex (New-UntestedMotor) 'item/untested_rocket_motor.png'
    Out-Tex (New-HeatShieldTile) 'item/ablative_heat_shield_tile.png'
    Out-Tex (New-CopvTank) 'item/composite_overwrapped_tank.png'
}

# ============================================================================================
#  VERIFY what was written (size, binary alpha, no pure black, mcmeta vs frames, empty casing ring, emissive subset, animation
#  that really animates)
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
    if ($msgs.Count -gt 0) { $problems++; Write-Warning "$rel : $($msgs -join '; ')" }
}

Write-Host "written $($written.Count) files under $OutRoot ($problems with warnings)"
foreach ($rel in $written) { Write-Host "  $rel" }

if ($Credits) {
    Write-Host ''
    foreach ($rel in $written) {
        Write-Host ("| ``pack/kubejs/assets/grindless/textures/$rel`` | Generated with tools/assets/$ScriptName (procedural pixel art, original) by the launch road agent, 2026-10-24 | the pack's own (pending; proposed CC BY-SA 4.0) |")
    }
}
