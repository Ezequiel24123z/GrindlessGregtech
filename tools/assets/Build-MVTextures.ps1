<#
.SYNOPSIS
  Procedural 16x16 pixel art for the MV era of Gregtech Grindless (GregTech style: bevels, top-left light, selective outlines).

.DESCRIPTION
  Every pixel is drawn by this script (palettes + char maps + small shading routines); nothing is copied or edited
  from GregTech Modern or any other mod. Output is deterministic: re-running overwrites the same bytes.

  Writes (under pack/kubejs/assets/grindless/textures/):
    block/multiblock/mv_vein_drill/overlay_front.png, overlay_front_active.png(+.mcmeta), overlay_front_active_emissive.png(+.mcmeta)
    block/multiblock/mv_greenhouse/...     (same three)
    block/multiblock/ore_plant/...         (same three)
    block/multiblock/biorefinery/...       (same three)
    item/vanadium_steel_drill_bit.png

  Run from the repo root (PowerShell 5.1 blocks unsigned scripts by default; this bypass only affects that process):
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-MVTextures.ps1
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-MVTextures.ps1 -Only plant,bit

  Overlay conventions (same as GregTech Modern's workable casings and as the steam and LV sets): transparent
  background, details only on the overlay, animated variants are vertical 16x(16*n) strips with a .png.mcmeta,
  *_emissive layers hold only the pixels that glow (identical to the colour layer). Every pixel is fully opaque or
  fully transparent. The outer 1 px ring is always left empty so the casing shows around the face.

  Casings the faces were drawn for (context only, see Build-MVPreview.ps1; every face has its own dark frame, so
  it also reads on the other casings):
    mv_vein_drill  ->  gtceu:block/casings/solid/machine_casing_frost_proof            (aluminium)
    mv_greenhouse  ->  gtceu:block/casings/solid/machine_casing_clean_stainless_steel  (stainless steel)
    ore_plant      ->  gtceu:block/casings/solid/machine_casing_solid_steel            (solid steel, as in docs/eras/mv.md)
    biorefinery    ->  gtceu:block/casings/solid/machine_casing_solid_steel            (solid steel, as in docs/eras/mv.md)

  The bit shares one small shader with the steam drill bits (Draw-Helix, copied from Build-SteamTextures.ps1 so
  that script stays untouched): a cone and cylinder lit from the top-left with a helical thread.

.PARAMETER Only
  Subset of: drill, greenhouse, plant, bio, bit. Default: everything.
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

# Neutral steel ramp shared by every overlay (lit -> dark), the same one as the LV set: GTM's own overlays use neutral
# greys over its casings, so the faces stay in the same family. MV is told apart by its blue accents (a..g below).
$SteelSpec = 'A=D3D3D3 B=B0B0B0 C=8E8E8E D=707070 E=565656 F=404040 G=2F2F2F H=222222 I=161616 J=0D0D0D'
# MV tier blue, lit -> dark (lamps, trim, arcs).
$BlueSpec = 'a=E4FBFF b=8FE8FF c=3CC4F0 d=1E8FD0 e=1560A0 f=0C3A6A g=071F3C'

# ============================================================================================
#  MV VEIN DRILL - controller face (aluminium casing)
#  aluminium derrick (A-frame truss) around a stainless top drive, a vanadium-steel bit biting into ore rock;
#  blue striped panel and a state lamp along the base
# ============================================================================================
$DrillPal = New-Pal ($SteelSpec + ' ' + $BlueSpec + ' ' + @'
0=EAF6FF 1=C2DDEE 2=8FB5CE 3=6790AC 4=49708C 5=335168
K=F3ECFB L=D3C4E8 M=B59FCC N=8570A2 O=5E4C78
l=6A6E78 m=50545E n=3A3D45 o=E8A04A p=FFD27A q=B8F0FF
u=FFE56A v=F7A81B w=C26A0F
h=E2FFE4 i=62FF86 j=22C257 k=0C6B2E
r=FF5A48 s=B52D22 t=5E1511
'@)

$DrillBase = @(
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
Assert-Map 'DrillBase' $DrillBase

# Aluminium truss legs (x, y, tone): the lit left leg alternates light/mid, the right leg mid/dark, so each reads as a lattice.
$DrillLegL = @(@(5, 5, '1'), @(5, 6, '3'), @(4, 7, '1'), @(4, 8, '3'), @(3, 9, '1'), @(3, 10, '3'))
$DrillLegR = @(@(11, 5, '3'), @(11, 6, '5'), @(12, 7, '3'), @(12, 8, '5'), @(13, 9, '3'), @(13, 10, '5'))
# Power cable (x, y), 8 cells = one pulse per frame: out of the top drive, along the top, down the right wall.
$DrillCable = @(@(11, 3), @(12, 3), @(13, 3), @(13, 4), @(13, 5), @(13, 6), @(13, 7), @(13, 8))
# Top drive (stainless, x6..10, y3..4); the blue window is at (8,4).
$DrillTopDrive = @(
    'BAABD',
    'CD.DE'
)
# Bit (y7..9), axis x = 8: first column, width and tones per row (K spec, L light, M mid, N dark, O darker).
$DrillBitRows = @(@(6, 'LKMNO'), @(7, 'LMO'), @(8, 'N'))

function New-MvDrillFrame {
    param([bool]$Active, [int]$T = 0)
    $c = New-Canvas; $e = New-Canvas
    $P = $DrillPal
    Write-Map $c 0 0 $DrillBase $P

    # base plate: blue striped panel (x2..8) and the state lamp (x10..13)
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

    # derrick: truss legs and the cross brace behind the string
    foreach ($px in $DrillLegL) { Set-Px $c $px[0] $px[1] $P[[string]$px[2]] }
    foreach ($px in $DrillLegR) { Set-Px $c $px[0] $px[1] $P[[string]$px[2]] }
    Set-Px $c 6 6 $P['2']; Set-Px $c 10 6 $P['4']

    # MV power cable from the top drive down the right wall; a blue pulse runs along it while working
    foreach ($px in $DrillCable) { Set-Px $c $px[0] $px[1] $P['E'] }
    if ($Active) {
        $head = $DrillCable[$T % 8]; $tail = $DrillCable[($T + 7) % 8]
        Set-Both $c $e $head[0] $head[1] $P['b']
        Set-Both $c $e $tail[0] $tail[1] $P['d']
    }

    # top drive: the window shows a blue light that pulses while it turns
    for ($j = 0; $j -lt 2; $j++) { for ($i = 0; $i -lt 5; $i++) {
        $ch = [string]$DrillTopDrive[$j][$i]
        if ($ch -ne '.') { Set-Px $c (6 + $i) (3 + $j) $P[$ch] }
    } }
    $win = if ($Active) { if (($T % 2) -eq 0) { 'b' } else { 'c' } } else { 'f' }
    if ($Active) { Set-Both $c $e 8 4 $P[$win] } else { Set-Px $c 8 4 $P[$win] }

    # drill string (x7..9, y5..6): the lit band swaps rows every frame while it turns
    $up = @('B', 'C', 'E'); $dn = @('C', 'D', 'F')
    $swap = $Active -and (($T % 2) -eq 1)
    for ($i = 0; $i -lt 3; $i++) {
        Set-Px $c (7 + $i) 5 $P[$(if ($swap) { $dn[$i] } else { $up[$i] })]
        Set-Px $c (7 + $i) 6 $P[$(if ($swap) { $up[$i] } else { $dn[$i] })]
    }

    # bit: vanadium steel, lit left edge; a spec glint walks around the cone while it turns
    for ($r = 0; $r -lt 3; $r++) {
        $row = $DrillBitRows[$r]
        for ($i = 0; $i -lt $row[1].Length; $i++) { Set-Px $c ($row[0] + $i) (7 + $r) $P[[string]$row[1][$i]] }
    }
    if ($Active) {
        $phase = $T % 4
        Set-Px $c (6 + $phase) 7 $P['K']
        Set-Px $c (7 + (($phase + 1) % 3)) 8 $P['K']
    }

    # ore rock: mounds at y9 either side of the tip, floor at y10, a few ore flecks
    $rock = @(
        @(4, 9, 'l'), @(5, 9, 'l'), @(6, 9, 'm'), @(7, 9, 'n'), @(9, 9, 'n'), @(10, 9, 'm'), @(11, 9, 'm'), @(12, 9, 'n'),
        @(4, 10, 'm'), @(5, 10, 'o'), @(6, 10, 'l'), @(7, 10, 'm'), @(8, 10, 'n'), @(9, 10, 'm'), @(10, 10, 'q'), @(11, 10, 'n'), @(12, 10, 'n'),
        @(11, 9, 'p')
    )
    foreach ($px in $rock) { Set-Px $c $px[0] $px[1] $P[[string]$px[2]] }

    if ($Active) {
        # derrick beacons on the leg tops swap every other frame (emissive)
        if (($T % 4) -lt 2) { Set-Both $c $e 5 5 $P['b'] } else { Set-Both $c $e 11 5 $P['b'] }
        # the contact point glows and throws sparks over the rock (emissive)
        Set-Both $c $e 8 9 $P[$(if (($T % 2) -eq 0) { 'u' } else { 'v' })]
        Set-Both $c $e 8 10 $P[$(if (($T % 2) -eq 0) { 'w' } else { 'v' })]
        $sparks = @(
            @(@(7, 9, 'u'), @(10, 8, 'v')),
            @(@(9, 9, 'u'), @(6, 8, 'v')),
            @(@(6, 9, 'u'), @(9, 8, 'v')),
            @(@(10, 9, 'v'), @(7, 8, 'u'))
        )
        foreach ($sp in $sparks[$T % 4]) { Set-Both $c $e $sp[0] $sp[1] $P[[string]$sp[2]] }
    }
    Sync-Emissive $c $e
    return @{ Color = $c; Emi = $e }
}

# ============================================================================================
#  MV GREENHOUSE - controller face (stainless casing)
#  three grow lamps over a glass pane with a tree, sugar cane and a berry bush; a CO2 pipe runs along the base and
#  up the right edge, with nozzles that puff gas into the pane
# ============================================================================================
$GhPal = New-Pal ($SteelSpec + ' ' + $BlueSpec + ' ' + @'
1=1B2530 2=1A2C38 3=183644 4=17404F 5=164A5A
6=9A3FA0 7=63399A 8=543C9A 9=473F96 0=3C4390
l=C8F26A m=7DCB3A n=45A030 o=2A7428 p=17481F
q=E8455F r=9C2440
s=8A5A2E t=6A4220 u=4A2C14
v=7A5230 w=5A3A20 x=3A2412
K=D8F58A L=9ADB4A M=5FA832
N=E24A3B O=F6EBDD
Q=FFF2FB R=FF8FE0 S=C84AB0 T=7A2F6E U=4A3A50
V=F2F8FF W=C9DCEC X=9DB6CE
Y=EEFFD6 Z=B6FF84
h=E2FFE4 i=62FF86 j=22C257 k=0C6B2E
y=FF5A48 z=B52D22
'@)

$GhBase = @(
    '................',
    '.CDDDDDDDDDDDDE.',
    '.DGGGGGGGGGGGGF.',
    '.DG..........DF.',
    '.DG..........DF.',
    '.DG..........DF.',
    '.DG..........DF.',
    '.DG..........DF.',
    '.DG..........DF.',
    '.DG..........DF.',
    '.DG..........DF.',
    '.DG..........DF.',
    '.DDDDDDDDDDDDDF.',
    '.DGGGGGGGGGGGGF.',
    '.EFFFFFFFFFFFFG.',
    '................'
)
Assert-Map 'GhBase' $GhBase

# Plant pixels (x, y, colour, 1 = leans with the sway, 0 = planted).
$GhTree = @(@(4, 6, 'm', 1), @(3, 7, 'n', 1), @(4, 7, 'm', 1), @(5, 7, 'o', 1), @(3, 8, 'o', 0), @(4, 8, 'n', 0), @(5, 8, 'p', 0), @(4, 9, 's', 0))
$GhCane = @(@(6, 6, 'L', 1), @(7, 6, 'K', 1), @(8, 6, 'M', 1), @(7, 7, 'L', 0), @(8, 7, 'K', 0), @(7, 8, 'K', 0), @(8, 8, 'L', 0), @(7, 9, 'M', 0), @(8, 9, 'M', 0))
$GhBush = @(@(10, 7, 'n', 0), @(9, 8, 'q', 0), @(10, 8, 'n', 0), @(11, 8, 'o', 0), @(9, 9, 'p', 0), @(10, 9, 'q', 0), @(11, 9, 'p', 0))
# CO2 path the flow light follows: along the base pipe (y12, x6..13), then up the riser (x13, y11..4).
$GhFlow = @()
foreach ($x in 6..13) { $GhFlow += , @($x, 12) }
foreach ($y in 11..4) { $GhFlow += , @(13, $y) }

function New-MvGreenhouseFrame {
    param([bool]$Active, [int]$T = 0)
    $c = New-Canvas; $e = New-Canvas
    $P = $GhPal
    Write-Map $c 0 0 $GhBase $P

    # glass y5..9: unlit cold teal, or flooded by the grow lamps (pink at the top, violet-blue below)
    $bgIdle = @('1', '2', '3', '4', '5'); $bgOn = @('6', '7', '8', '9', '0')
    for ($y = 5; $y -le 9; $y++) { for ($x = 3; $x -le 12; $x++) {
        Set-Px $c $x $y $P[$(if ($Active) { $bgOn[$y - 5] } else { $bgIdle[$y - 5] })]
    } }
    foreach ($x in 3..12) { Set-Px $c $x 4 $P['G'] }

    # lamp rail (y3) with three lamp housings; emitters (y4) and the light they throw (y5)
    $rail = @('D', 'B', 'C', 'E', 'B', 'C', 'E', 'B', 'C', 'F')
    for ($i = 0; $i -lt 10; $i++) { Set-Px $c (3 + $i) 3 $P[$rail[$i]] }
    $lamps = @(4, 7, 10)
    for ($k = 0; $k -lt 3; $k++) {
        $lx = $lamps[$k]
        if ($Active) {
            $flick = (($T + 2 * $k) % 4) -lt 2
            Set-Both $c $e $lx 4 $P[$(if ($flick) { 'Q' } else { 'R' })]
            Set-Both $c $e ($lx + 1) 4 $P['R']
            Set-Both $c $e $lx 5 $P['S']; Set-Both $c $e ($lx + 1) 5 $P['S']
        } else {
            Set-Px $c $lx 4 $P['U']; Set-Px $c ($lx + 1) 4 $P['T']
        }
    }
    if ($Active) {
        # the first glass row of each gap between lamps glows too
        foreach ($x in @(3, 6, 9, 12)) { Set-Both $c $e $x 5 $P['6'] }
    }

    # soil y10..11
    $soil = @('vwvvwvwvvw', 'wxwwxwxwwx')
    for ($j = 0; $j -lt 2; $j++) { for ($i = 0; $i -lt 10; $i++) { Set-Px $c (3 + $i) (10 + $j) $P[[string]$soil[$j][$i]] } }

    # plants: unlit they sit a little darker; the sway pushes the upper rows one pixel sideways in the working loop
    $sw = @(0, 1, 1, 1, 0, -1, -1, -1)
    $o = 0; if ($Active) { $o = $sw[$T % 8] }
    foreach ($plant in @($GhTree, $GhCane, $GhBush)) {
        foreach ($px in $plant) {
            $col = $P[[string]$px[2]]
            if (-not $Active) { $col = Shade $col 0.78 }
            Set-Px $c ($px[0] + $px[3] * $o) $px[1] $col
        }
    }

    # CO2 riser along the right edge (x13) with collars, and the two nozzles that poke into the pane
    for ($y = 3; $y -le 11; $y++) { Set-Px $c 13 $y $P[$(if (($y % 2) -eq 0) { 'B' } else { 'D' })] }
    Set-Px $c 13 5 $P['A']; Set-Px $c 13 9 $P['A']; Set-Px $c 13 3 $P['C']
    Set-Px $c 12 7 $P['C']; Set-Px $c 12 9 $P['C']
    # base pipe (y12..13, x5..13): flange, couplings, blue label band
    for ($x = 5; $x -le 13; $x++) { Set-Px $c $x 12 $P['B']; Set-Px $c $x 13 $P['C'] }
    Set-Px $c 5 12 $P['A']; Set-Px $c 5 13 $P['B']
    Set-Px $c 9 12 $P['E']; Set-Px $c 9 13 $P['F']; Set-Px $c 12 12 $P['E']; Set-Px $c 12 13 $P['F']
    foreach ($x in 6..7) {
        if ($Active) { Set-Both $c $e $x 12 $P['c']; Set-Both $c $e $x 13 $P['d'] } else { Set-Px $c $x 12 $P['e']; Set-Px $c $x 13 $P['f'] }
    }
    # status LEDs
    if ($Active) { Set-Both $c $e 3 13 $P['i']; Set-Both $c $e 4 13 $P['j'] } else { Set-Px $c 3 13 $P['y']; Set-Px $c 4 13 $P['z'] }

    # glass glints on the left edge of the pane
    Set-Px $c 3 6 $P['B']; Set-Px $c 3 7 $P['C']

    if ($Active) {
        # light running through the CO2 pipe: two beads, half a loop apart (emissive)
        $n = $GhFlow.Count
        $beads = @((($T * 2) % $n), ((($T * 2) + [int]($n / 2)) % $n))
        foreach ($k in $beads) { Set-Both $c $e $GhFlow[$k][0] $GhFlow[$k][1] $P['b'] }
        # gas puffs drift left from the nozzles and fade; the second nozzle runs two frames behind
        $tones = @('W', 'X', 'X')
        foreach ($nz in @(@(7, 0), @(9, 2))) {
            $k = ($T + 4 - $nz[1]) % 4
            if ($k -lt 3) { Set-Px $c (11 - $k) $nz[0] $P[$tones[$k]] }
        }
        # one growth sparkle per frame over the plants, and the lit tree top (emissive)
        $sp = @(@(4, 6), @(10, 7), @(7, 6), @(5, 7), @(11, 8), @(8, 6), @(3, 8), @(9, 8))
        $s = $sp[$T % 8]
        Set-Both $c $e $s[0] $s[1] $P['Y']
        Set-Both $c $e (4 + $o) 6 $P['m']
    }
    Sync-Emissive $c $e
    return @{ Color = $c; Emi = $e }
}

# ============================================================================================
#  ORE PLANT - controller face (solid steel casing); the era's flagship
#  a three-station hall, left to right: crusher (two toothed rollers), wash basin, furnace; a belt of light along the floor
# ============================================================================================
$PlantPal = New-Pal ($SteelSpec + ' ' + $BlueSpec + ' ' + @'
n=A07850 m=7A5A3C l=523A26 k=3A2A1C
w=C8F6FF x=7FE0F0 y=2FB4D0 z=1B7C98 v=0E4A66 u=072C44
1=FFF4B0 2=FFD24A 3=FF9A1E 4=E4600F 5=A8340A 6=5C1A08 7=3A0F06
'@)

$PlantBase = @(
    '................',
    '.CDDDDDDDDDDDDE.',
    '.DGGGGGGGGGGGGF.',
    '.IIIIIIIIIIIIII.',
    '.IIIIIIIIIIIIII.',
    '.IIIIIIIIIIIIII.',
    '.IIIIIIIIIIIIII.',
    '.IIIIIIIIIIIIII.',
    '.IIIIIIIIIIIIII.',
    '.IIIIIIIIIIIIII.',
    '.IIIIIIIIIIIIII.',
    '.IIIIIIIIIIIIII.',
    '.IIIIIIIIIIIIII.',
    '.GGGGGGGGGGGGGG.',
    '.EFFFFFFFFFFFFG.',
    '................'
)
Assert-Map 'PlantBase' $PlantBase

# One toothed roller seen from the side across the 5-px bay: 4 rows (teeth, lit body, shaded body, teeth). $TopX / $BotX
# are the columns carrying a tooth on the top / bottom edge, $Glint the column of the highlight sliding along the body.
function Draw-Roller {
    param($C, $P, [int]$Y0, $TopX, $BotX, [int]$Glint)
    foreach ($x in 1..5) { Set-Px $C $x ($Y0 + 1) $P['B']; Set-Px $C $x ($Y0 + 2) $P['D'] }
    foreach ($x in $TopX) { Set-Px $C $x $Y0 $P['A'] }
    foreach ($x in $BotX) { Set-Px $C $x ($Y0 + 3) $P['C'] }
    if ($Glint -ge 1) { Set-Px $C $Glint ($Y0 + 1) $P['A'] }
}

$PlantHeat = @('7', '6', '5', '4', '3', '2', '1')

function New-PlantFrame {
    param([bool]$Active, [int]$T = 0)
    $c = New-Canvas; $e = New-Canvas
    $P = $PlantPal
    Write-Map $c 0 0 $PlantBase $P

    # pillars between the stations
    foreach ($y in 3..12) { Set-Px $c 6 $y $P['E']; Set-Px $c 10 $y $P['E'] }
    Set-Px $c 6 3 $P['D']; Set-Px $c 10 3 $P['D']

    # --- station 1: crusher (x1..5): ore hopper on top, then two toothed rollers whose teeth mesh over a row of ore
    foreach ($y in 3..12) { foreach ($x in 1..5) { Set-Px $c $x $y $P['G'] } }
    Set-Px $c 1 3 $P['D']; Set-Px $c 5 3 $P['E']
    $ore = @('n', 'm', 'l', 'm')
    for ($i = 0; $i -lt 3; $i++) { Set-Px $c (2 + $i) 3 $P[$ore[(($i + $(if ($Active) { $T } else { 0 })) % 4)]] }
    $odd = @(1, 3, 5); $even = @(2, 4)
    $ph = 0; $gl1 = 0; $gl2 = 0
    if ($Active) {
        $ph = [int][Math]::Floor($T / 2) % 2                # the teeth step one column every two frames
        $sweep = @(1, 2, 3, 4, 5, 4, 3, 2)
        $gl1 = $sweep[$T % 8]; $gl2 = $sweep[($T + 4) % 8]  # the highlights slide in opposite phase
    }
    $topX = if ($ph -eq 0) { $odd } else { $even }
    $botX = if ($ph -eq 0) { $even } else { $odd }
    Draw-Roller $c $P 4 $topX $botX $gl1
    Draw-Roller $c $P 9 $topX $botX $gl2
    # ore squeezed in the row between the rollers, in the pockets of the upper teeth
    foreach ($x in $topX) { Set-Px $c $x 8 $P[$(if ($x -eq 3) { 'n' } else { 'm' })] }

    # --- station 2: wash basin (x7..9): inlet pipe on top, water below
    Set-Px $c 7 3 $P['C']; Set-Px $c 8 3 $P['B']; Set-Px $c 9 3 $P['D']
    for ($y = 5; $y -le 12; $y++) { for ($x = 7; $x -le 9; $x++) {
        if ($Active) {
            $ch = if ($y -eq 5) { if ($x -eq (9 - ($T % 4))) { 'w' } else { 'x' } } elseif ($y -le 7) { 'x' } elseif ($y -le 10) { 'y' } else { 'z' }
            if ($y -le 7) { Set-Both $c $e $x $y $P[$ch] } else { Set-Px $c $x $y $P[$ch] }
        } else {
            Set-Px $c $x $y $P[$(if ($y -eq 5) { 'z' } elseif ($y -le 8) { 'v' } else { 'u' })]
        }
    } }
    if ($Active) {
        # a drip from the inlet, bubbles rising and a speck of ore being washed (bubbles emissive)
        Set-Px $c 8 4 $P[$(if (($T % 2) -eq 0) { 'x' } else { 'w' })]
        $bx = @(8, 9, 7)
        for ($k = 0; $k -lt 3; $k++) { $by = 12 - (($T + 3 * $k) % 8); Set-Both $c $e $bx[$k] $by $P['w'] }
        Set-Px $c 7 (6 + 2 * ($T % 4)) $P['u']
    }

    # --- station 3: furnace (x11..14): chimney cap, then a glow that runs from dark brick (top) to white-yellow (bottom)
    $capTones = @('E', 'F', 'F', 'G')
    for ($i = 0; $i -lt 4; $i++) { Set-Px $c (11 + $i) 3 $P[$capTones[$i]] }
    $baseHeat = if ($Active) { @(1, 2, 2, 3, 3, 3, 4, 5, 5) } else { @(0, 0, 0, 1, 1, 1, 1, 1, 2) }
    for ($r = 0; $r -lt 9; $r++) {
        $y = 4 + $r
        for ($x = 11; $x -le 14; $x++) {
            $h = $baseHeat[$r]
            if ($Active) {
                $n = Get-Noise $x $y $T 7
                if ($n -lt 64) { $h -= 1 } elseif ($n -gt 200) { $h += 1 }
                if ($n -gt 248 -and $r -ge 5) { $h = 6 }
            }
            if ($x -eq 11 -or $x -eq 14) { $h -= 1 }
            $h = Get-ClampInt $h 0 6
            $col = $P[$PlantHeat[$h]]
            if ($Active) { Set-Both $c $e $x $y $col } else { Set-Px $c $x $y $col }
        }
    }
    if ($Active) {
        # smoke drifting along the chimney cap
        Set-Px $c (11 + ($T % 4)) 3 $P['C']; Set-Px $c (11 + (($T + 3) % 4)) 3 $P['D']
    } else {
        Set-Px $c 12 10 $P['4']; Set-Px $c 13 11 $P['4']
    }

    # --- lintel lamps, one per station
    $lampX = @(3, 8, 12)
    $lampOn = @('2', 'b', '3')
    for ($k = 0; $k -lt 3; $k++) {
        if ($Active -and ((($T + $k) % 4) -ne 3)) { Set-Both $c $e $lampX[$k] 2 $P[$lampOn[$k]] }
        else { Set-Px $c $lampX[$k] 2 $P['E'] }
    }

    # --- belt along the floor (y13): dashes of light that run left to right through the three stations
    for ($x = 1; $x -le 14; $x++) {
        if ($Active) { if ((($x - $T + 8) % 4) -eq 0) { Set-Both $c $e $x 13 $P['b'] } }
        else { if (($x % 4) -eq 2) { Set-Px $c $x 13 $P['f'] } }
    }
    Sync-Emissive $c $e
    return @{ Color = $c; Emi = $e }
}

# ============================================================================================
#  BIOREFINERY - controller face (solid steel casing)
#  a distillation column in the middle: four fluid bands (pale lime, green, amber, brown) with a tap on each side at
#  every band, a condenser cap on top and a flame under the reboiler; bubbles rise, taps drip
# ============================================================================================
$BioPal = New-Pal ($SteelSpec + ' ' + $BlueSpec + ' ' + @'
l=F4FFC0 m=DDF78F n=BCE45E o=92C23C p=5F8F26
q=C6F58A r=8EDB4C s=5CBE34 t=3A9A2A u=226C20
v=FFE9A8 w=FFC85A x=F2A02E y=CC7420 z=8A4A14
1=E8B070 2=C07C34 3=94581C 4=663A10 5=3E220A
6=FFF4B0 7=FFD24A 8=FF9A1E 9=E4600F 0=A8340A
K=5C1A08 L=F4FFE8
h=E2FFE4 i=62FF86 j=22C257 k=0C6B2E
Y=FF5A48 Z=B52D22
'@)

$BioBase = @(
    '................',
    '.CDDDDDDDDDDDDE.',
    '.DGGGGGGGGGGGGF.',
    '.DG..........DF.',
    '.DG..........DF.',
    '.DG..........DF.',
    '.DG..........DF.',
    '.DG..........DF.',
    '.DG..........DF.',
    '.DG..........DF.',
    '.DG..........DF.',
    '.DG..........DF.',
    '.DDDDDDDDDDDDDF.',
    '.DGGGGGGGGGGGGF.',
    '.EFFFFFFFFFFFFG.',
    '................'
)
Assert-Map 'BioBase' $BioBase

# Fluid ramps (0 spec, 1 light, 2 base, 3 dark, 4 darker), top fraction to bottom fraction.
$BioFluids = @('lmnop', 'qrstu', 'vwxyz', '12345')
$BioBands = @(@(4, 2), @(6, 2), @(8, 2), @(10, 1))   # first row, rows

function New-BioFrame {
    param([bool]$Active, [int]$T = 0)
    $c = New-Canvas; $e = New-Canvas
    $P = $BioPal
    Write-Map $c 0 0 $BioBase $P

    # column rails (x5 lit, x10 shaded), flanged at every tap
    for ($y = 4; $y -le 10; $y++) { Set-Px $c 5 $y $P['C']; Set-Px $c 10 $y $P['E'] }
    foreach ($b in $BioBands) { Set-Px $c 5 $b[0] $P['B']; Set-Px $c 10 $b[0] $P['D'] }

    # fluid bands inside the column (x6..9): the top row of a band is lighter, the left column lit, the right in shade
    for ($k = 0; $k -lt 4; $k++) {
        $ramp = $BioFluids[$k]
        for ($j = 0; $j -lt $BioBands[$k][1]; $j++) {
            $y = $BioBands[$k][0] + $j
            for ($x = 6; $x -le 9; $x++) {
                $idx = 2
                if ($j -eq 0 -and $BioBands[$k][1] -gt 1) { $idx -= 1 }
                if ($x -eq 6) { $idx -= 1 } elseif ($x -eq 9) { $idx += 1 }
                $idx = Get-ClampInt $idx 0 4
                if (-not $Active) { $col = Shade $P[[string]$ramp[$idx]] 0.55 } else { $col = $P[[string]$ramp[$idx]] }
                # the lighter half of each band glows
                if ($Active -and $idx -le 1) { Set-Both $c $e $x $y $col } else { Set-Px $c $x $y $col }
            }
        }
    }

    # condenser cap (y3) and its exhaust pipe to the right
    $cap = @('B', 'A', 'B', 'C', 'D', 'E')
    for ($i = 0; $i -lt 6; $i++) { Set-Px $c (5 + $i) 3 $P[$cap[$i]] }
    Set-Px $c 11 3 $P['D']; Set-Px $c 12 3 $P['E']
    if ($Active -and (($T % 2) -eq 0)) { Set-Px $c 7 3 $P['C'] }

    # reboiler (y11): steel base with a flame slit
    foreach ($x in 5..10) { Set-Px $c $x 11 $P[$(if ($x -eq 5) { 'D' } elseif ($x -eq 10) { 'F' } else { 'E' })] }
    $flame = @('6', '7', '8', '9', '0')
    foreach ($x in 6..9) {
        if ($Active) {
            $n = Get-Noise $x 11 $T 5
            $idx = 2 + $(if ($n -lt 70) { 1 } elseif ($n -gt 190) { -1 } else { 0 })
            if ($n -gt 246) { $idx = 0 }
            Set-Both $c $e $x 11 $P[$flame[(Get-ClampInt $idx 0 4)]]
        } else {
            Set-Px $c $x 11 $P[$(if ($x -eq 7) { '0' } else { 'K' })]
        }
    }

    # taps: left (pipe x4, spout x3, lit) and right (pipe x11, spout x12, shaded), one per band, in the band's colour
    for ($k = 0; $k -lt 4; $k++) {
        $y = $BioBands[$k][0]
        $ramp = $BioFluids[$k]
        Set-Px $c 4 $y $P['C']; Set-Px $c 11 $y $P['D']
        $lc = $P[[string]$ramp[1]]; $rc = $P[[string]$ramp[2]]
        if (-not $Active) { $lc = Shade $lc 0.55; $rc = Shade $rc 0.55 }
        if ($Active) { Set-Both $c $e 3 $y $lc; Set-Both $c $e 12 $y $rc } else { Set-Px $c 3 $y $lc; Set-Px $c 12 $y $rc }
        if ($Active) {
            # each tap forms a drop under its spout in turn, from the top tap down; the right side runs one frame behind
            $drip = $k * 2
            if (($T % 8) -eq $drip) { Set-Both $c $e 3 ($y + 1) $P[[string]$ramp[0]] }
            if (($T % 8) -eq (($drip + 1) % 8)) { Set-Both $c $e 12 ($y + 1) $P[[string]$ramp[0]] }
        }
    }

    if ($Active) {
        # bubbles climbing the column (emissive): eight steps from the reboiler to the surface, the last one hidden (popped)
        $bx = @(7, 9, 6, 8)
        for ($k = 0; $k -lt 4; $k++) { $by = 10 - (($T + 2 * $k) % 8); if ($by -ge 4) { Set-Both $c $e $bx[$k] $by $P['L'] } }
    }

    # base plate: blue striped panel (x3..8) and the state lamp (x10..12)
    for ($y = 12; $y -le 13; $y++) {
        for ($x = 3; $x -le 8; $x++) {
            if ((($x + $y) % 4) -lt 2) {
                $blue = if ($Active) { @('c', 'd')[$y - 12] } else { @('e', 'f')[$y - 12] }
                if ($Active) { Set-Both $c $e $x $y $P[$blue] } else { Set-Px $c $x $y $P[$blue] }
            } else { Set-Px $c $x $y $P['g'] }
        }
    }
    if ($Active) {
        Set-Both $c $e 11 13 $P['i']; Set-Both $c $e 12 13 $P['j']; Set-Both $c $e 11 12 $P['h']; Set-Both $c $e 12 12 $P['i']
    } else {
        Set-Px $c 11 12 $P['Y']; Set-Px $c 12 12 $P['Z']; Set-Px $c 11 13 $P['Z']; Set-Px $c 12 13 $P['K']
    }
    Sync-Emissive $c $e
    return @{ Color = $c; Emi = $e }
}

# ============================================================================================
#  ITEM: vanadium steel drill bit
# ============================================================================================
# Same shader as the steam drill bits (copied from Build-SteamTextures.ps1): a vertical cone/cylinder lit from the
# top-left with a helical thread, quantised to a 5-tone ramp. Pixels are fully opaque or skipped.
function Draw-Helix {
    param($Canvas, $Ramp, [double]$Xc, [double]$TipY, [double]$RadBody, [double]$TipLen, [double]$BodyLen,
          [double]$RadShank, [double]$TotalLen, [double]$Pitch, [double]$Starts, [double]$Amp, [double]$Phase = 0.0)
    $lightX = -0.62; $lightZ = 0.50
    for ($y = 0; $y -lt $Canvas.H; $y++) {
        for ($x = 0; $x -lt $Canvas.W; $x++) {
            $axial = $TipY - ($y + 0.5)
            $perp = ($x + 0.5) - $Xc
            if ($axial -lt -0.2 -or $axial -gt $TotalLen) { continue }
            $zone = 'thread'
            if ($axial -le $TipLen) { $rad = $RadBody * [Math]::Max(0.0, $axial) / $TipLen }
            elseif ($axial -le $BodyLen) { $rad = $RadBody }
            elseif ($axial -le ($BodyLen + 1.0)) { $rad = $RadBody; $zone = 'groove' }
            else { $rad = $RadShank; $zone = 'shank' }
            if ([Math]::Abs($perp) -gt ($rad + 0.1)) { continue }
            $radSafe = [Math]::Max($rad, 0.5)
            $across = [Math]::Max(-$radSafe, [Math]::Min($radSafe, $perp))
            $depth = [Math]::Sqrt([Math]::Max(0.0, $radSafe * $radSafe - $across * $across))
            $diffuse = [Math]::Max(0.0, ($across / $radSafe) * $lightX + ($depth / $radSafe) * $lightZ)
            $tone = 0.18 + 0.78 * $diffuse
            if ($zone -eq 'thread') {
                $theta = [Math]::Asin([Math]::Max(-1.0, [Math]::Min(1.0, $across / $radSafe)))
                $turn = $Starts * ($axial / $Pitch + $theta / (2 * [Math]::PI)) + $Phase
                $s = $turn - [Math]::Floor($turn)
                $ridge = 0.5 - 0.5 * [Math]::Cos(2 * [Math]::PI * $s)
                $tone += $Amp * ($ridge - 0.5)
            } elseif ($zone -eq 'groove') { $tone = $tone * 0.72 }
            $idx = if ($tone -ge 0.78) { 0 } elseif ($tone -ge 0.60) { 1 } elseif ($tone -ge 0.42) { 2 } elseif ($tone -ge 0.26) { 3 } else { 4 }
            Set-Px $Canvas $x $y $Ramp[$idx]
        }
    }
}

# GTM's vanadium steel is a lavender grey (0xB59FCC) with a near-black secondary: spec, light, mid, dark, darkest.
$RampVanadiumSteel = @((Hex 'F3ECFB'), (Hex 'D3C4E8'), (Hex 'B59FCC'), (Hex '8570A2'), (Hex '4F3F68'))

function New-VanadiumSteelBit {
    $c = New-Canvas
    # a step up from the steel bit: a touch wider, a longer tip and three broad flutes (pitch 14)
    Draw-Helix $c $RampVanadiumSteel 8.0 14.7 3.2 7.0 10.5 2.2 13.6 14.0 3.0 0.85 0.0
    Add-Outline $c -LitArgb (Hex '6A5688') -ShadeArgb (Hex '241A33')
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

if (Test-Want 'drill') { Out-Overlay 'block/multiblock/mv_vein_drill' ${function:New-MvDrillFrame} 2 }
if (Test-Want 'greenhouse') { Out-Overlay 'block/multiblock/mv_greenhouse' ${function:New-MvGreenhouseFrame} 4 }
if (Test-Want 'plant') { Out-Overlay 'block/multiblock/ore_plant' ${function:New-PlantFrame} 3 }
if (Test-Want 'bio') { Out-Overlay 'block/multiblock/biorefinery' ${function:New-BioFrame} 4 }
if (Test-Want 'bit') { Out-Tex (New-VanadiumSteelBit) 'item/vanadium_steel_drill_bit.png' }

# ============================================================================================
#  VERIFY what was written (size, binary alpha, no pure black, mcmeta vs frames, empty casing ring, emissive subset,
#  animation that really animates)
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
        Write-Host ("| ``pack/kubejs/assets/grindless/textures/$rel`` | Generada con tools/assets/$ScriptName (pixel art procedural, original) por agente de assets, 2026-10-24 | la del pack (pendiente; propuesta CC BY-SA 4.0) |")
    }
}
