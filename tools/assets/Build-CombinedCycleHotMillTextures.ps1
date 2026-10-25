<#
.SYNOPSIS
  Procedural 16x16 pixel art for two EV controller faces of Gregtech Grindless: the combined-cycle plant and the hot strip
  mill (GregTech style: bevels, top-left light, selective outlines, every pixel fully opaque or fully transparent).

.DESCRIPTION
  Every pixel is drawn by this script (palettes + char maps + small routines); nothing is copied or edited from GregTech
  Modern or any other mod. Output is deterministic: re-running overwrites the same bytes. Same method, palettes (neutral
  steel, EV purple accents, stainless steel, state lamp), window frame and checks as the EV set (Build-EVTextures.ps1);
  the helpers are copied so that script stays untouched.

  Writes (under pack/kubejs/assets/grindless/textures/):
    block/multiblock/combined_cycle_plant/overlay_front.png, overlay_front_active.png(+.mcmeta), overlay_front_active_emissive.png(+.mcmeta)
    block/multiblock/hot_strip_mill/...    (same three)

  combined_cycle_plant: inside the dark window, a small gas turbine seen from the side on the left (a steel casing that
  tapers from the tall intake to the exhaust nozzle, the combustor's flame core glowing through a port on its axis) blows
  its hot exhaust right into a tall heat-recovery boiler (two rows of water tubes, light blue between stainless headers,
  with the hot gas lane between them) that carries a short stack on its roof; a purple EV power cable leaves the turbine
  along the floor and goes out through the right wall. The base strip carries purple hazard stripes and the state lamp.
  8 frames, frametime 3: the flame flickers orange-yellow, waves of heat run from the exhaust through the boiler (warming
  the tubes they pass), steam puffs rise out of the stack and fade as the wind takes them, and two power pulses run
  along the cable. Idle: dark combustor port, cold boiler, dull cable, no steam, red lamp.

  hot_strip_mill: inside the dark window, a hot strip runs left to right through two rolling stands (each one a pair of
  round work rolls above and below the strip, pressed down by a spindle from a drive with a purple light), then under a
  water spray header whose droplets fall onto it while small steam puffs rise from the spray zone; over the runout table
  the strip cools from glowing yellow-orange to dull grey. Purple stripes and the state lamp on the base strip. 8 frames,
  frametime 2: a hot glow pattern scrolls along the strip, a glint turns round every roll (the upper rolls one way, the
  lower ones the other, as the strip pulls them), water runs along the header, droplets fall and splash, steam rises and
  fades, and the drive lights pulse in turn. Idle: dim red / dark grey strip, no water, dark drives, red lamp.

  The steam is never emissive. The *_emissive layers only hold the flame, the hot gas, the hot strip, the purple lights,
  pulses and stripes and the green lamp.

  Run from the repo root (PowerShell 5.1 blocks unsigned scripts by default; this bypass only affects that process):
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-CombinedCycleHotMillTextures.ps1
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-CombinedCycleHotMillTextures.ps1 -Only plant,mill
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-CombinedCycleHotMillTextures.ps1 -Credits

  Overlay conventions (same as GregTech Modern's workable casings and as the steam, LV, MV, HV and EV sets): transparent
  background, details only on the overlay, animated variants are vertical 16x(16*n) strips with a .png.mcmeta,
  *_emissive layers hold only the pixels that glow (identical to the colour layer). Every pixel is fully opaque or
  fully transparent. The outer 1 px ring is always left empty so the casing shows around the face.
  Both faces are drawn for gtceu:block/casings/solid/machine_casing_stable_titanium (gtceu:stable_machine_casing); each
  one has its own dark frame, so it also reads on other casings.

.PARAMETER Only
  Subset of: plant (combined_cycle_plant), mill (hot_strip_mill). Default: both.
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
foreach ($id in $Only) { if (@('plant', 'mill') -notcontains $id) { throw "Unknown -Only id '$id' (expected: plant, mill)" } }

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

# Neutral steel ramp shared by every overlay (lit -> dark), the same one as the LV, MV, HV and EV sets.
$SteelSpec = 'A=D3D3D3 B=B0B0B0 C=8E8E8E D=707070 E=565656 F=404040 G=2F2F2F H=222222 I=161616 J=0D0D0D'
# EV tier purple, lit -> dark (stripes, lamps, pulses).
$PurpleSpec = 'a=F3E4FF b=D6B0FF c=B07AF0 d=8A4CD0 e=5C2E9C f=381C64 g=1C0E36'
# Clean stainless steel (cooler and brighter than the neutral steel), lit -> dark: tube headers and the spray header.
$StainSpec = '0=F7FAFF 1=DCE5F0 2=B8C6D8 3=8E9DB2 4=667690 5=465470 6=2C364C'
# State lamp: green while working (M..P), red while idle (Q..S).
$LampSpec = 'M=E2FFE4 N=62FF86 O=22C257 P=0C6B2E Q=FF5A48 R=B52D22 S=5E1511'

# Frame shared by the EV faces with a free-form window: 1 px empty ring, steel bezel, dark window x3..13 y3..12, base strip y13.
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

# Base strip (y13) of both faces, as on the platinum plant: purple hazard stripes x3..9 (lit and emissive while working)
# and the state lamp x11..13 (green and pulsing while working, red while idle).
function Draw-BaseStrip {
    param($C, $E, $P, [bool]$Active, [int]$T)
    foreach ($x in 3..9) {
        if (($x % 4) -lt 2) {
            if ($Active) { Set-Both $C $E $x 13 $P['c'] } else { Set-Px $C $x 13 $P['e'] }
        } else { Set-Px $C $x 13 $P['g'] }
    }
    if ($Active) {
        $core = if (($T % 4) -lt 2) { 'M' } else { 'N' }
        Set-Both $C $E 11 13 $P[$core]; Set-Both $C $E 12 13 $P['N']; Set-Both $C $E 13 13 $P['O']
    } else {
        Set-Px $C 11 13 $P['Q']; Set-Px $C 12 13 $P['R']; Set-Px $C 13 13 $P['S']
    }
}

# ============================================================================================
#  COMBINED-CYCLE PLANT - controller face (stable titanium casing)
#  a gas turbine (x3..7, axis y9) blowing its exhaust across the gap at x8 into a heat-recovery boiler (x9..13, y7..11)
#  with a short stack on its roof (x12..13, y5..6); the steam drifts over the top of the window (y3..4), the purple
#  power cable runs along the floor (y12) and the base strip (y13) carries the stripes and the lamp
# ============================================================================================
# h..k flame (white-hot -> deep orange) and l..n hot gas (orange-red -> dark red): one heat ramp; L the cold combustor
# port; p..s water in the tubes (light blue, lit -> dark); t..w steam (bright -> faded, never emissive).
$CcPal = New-Pal ($SteelSpec + ' ' + $PurpleSpec + ' ' + $StainSpec + ' ' + $LampSpec + ' ' + @'
h=FFFBE0 i=FFE45C j=FFAA2E k=E86A1A l=C8461C m=9E2E16 n=6A1E12 L=2E2624
p=CDEFFF q=8ED0F4 r=5BA4D8 s=3A74A8
t=F2F4F6 u=C6CBD1 v=959BA3 w=6E7378
'@)

$CcHeat = 'hijklmn'                 # heat ramp, hottest first
$CcGasBase = @(2, 3, 4, 5, 6)       # resting tones along the hot gas path x8..12 (it cools on its way through the boiler)

# Turbine (drawn from x3, y7): the tall intake on the left tapering to the exhaust nozzle at x7; the combustor port on the
# axis (x5..6, y9) is drawn by the frame.
$CcTurbine = @(
    'BA...',
    'BCAA.',
    'CD..C',
    'DEEE.',
    'EF...'
)
# Heat-recovery boiler (drawn from x9, y7): roof, two rows of water tubes between stainless headers (y8, y10) with the
# hot gas lane between them (y9, open to the exhaust on the left, drawn by the frame), floor.
$CcBoiler = @(
    'BAABC',
    '2pqr4',
    '....E',
    '2qrs4',
    'DEEEF'
)
# Short stack on the boiler roof (drawn from x12, y5).
$CcStack = @(
    'AC',
    'CE'
)
# A steam puff by age ("x,y,tone;..."; x relative to the stack column it leaves): it rises out of the stack, then the wind
# takes it to the left over the boiler and the turbine while it fades. It lives a whole loop, so two are always out.
$CcPuff = @(
    '0,4,t',
    '0,3,t;-1,4,u',
    '-1,3,t;-2,4,u',
    '-2,3,u;-3,4,v',
    '-3,3,u;-4,4,w',
    '-4,3,v',
    '-5,3,v',
    '-6,3,w'
)

function New-CombinedCycleFrame {
    param([bool]$Active, [int]$T = 0)
    $c = New-Canvas; $e = New-Canvas
    $P = $CcPal
    Write-Map $c 0 0 $WindowBase $P

    # ---- gas turbine; the flame core flickers through the combustor port (white-hot to orange towards the turbine)
    Write-Map $c 3 7 $CcTurbine $P
    foreach ($fx in 5, 6) {
        if ($Active) {
            $n = Get-Noise $fx 9 $T 17
            $idx = $(if ($n -lt 90) { 0 } elseif ($n -lt 190) { 1 } else { 2 }) + ($fx - 5)
            Set-Both $c $e $fx 9 $P[[string]$CcHeat[$idx]]
        } else { Set-Px $c $fx 9 $P['L'] }
    }

    # ---- heat-recovery boiler and its stack
    Write-Map $c 9 7 $CcBoiler $P
    Write-Map $c 12 5 $CcStack $P

    if ($Active) {
        # hot gas: across the gap (x8) and through the lane (x9..12), two waves of heat 4 cells apart; a wave warms the
        # water tubes above and below it as it passes
        $wave = $T % 4
        for ($i = 0; $i -lt 5; $i++) {
            $idx = $CcGasBase[$i]
            if ($i -eq $wave -or $i -eq ($wave + 4)) {
                $idx = Get-ClampInt ($idx - 2) 0 6
                if ($i -ge 2) { foreach ($y in 8, 10) { Set-Px $c (8 + $i) $y (Mix (Get-Px $c (8 + $i) $y) $P['k'] 0.4) } }
            }
            Set-Both $c $e (8 + $i) 9 $P[[string]$CcHeat[$idx]]
        }
        # steam puffs: one out of each stack column in turn, half a loop apart (not emissive)
        for ($k = 0; $k -lt 2; $k++) {
            $age = (($T - 4 * $k) % 8 + 8) % 8
            if ($age -ge $CcPuff.Count) { continue }
            foreach ($cell in $CcPuff[$age].Split(';')) {
                $q = $cell.Split(',')
                Set-Px $c (12 + $k + [int]$q[0]) ([int]$q[1]) $P[$q[2]]
            }
        }
    } else {
        # cold boiler: dull tubes, an empty gas lane
        foreach ($y in 8, 10) { foreach ($x in 10..12) { Set-Px $c $x $y (Shade (Get-Px $c $x $y) 0.6) } }
        foreach ($x in 9..12) { Set-Px $c $x 9 $P['H'] }
    }

    # ---- purple power cable from under the turbine along the floor (y12) and out through the right wall; two pulses
    #      (with a dimmer tail) run along it, half a loop apart
    foreach ($x in 3..13) { Set-Px $c $x 12 $P[$(if ($Active) { 'e' } else { 'f' })] }
    if ($Active) {
        foreach ($off in 0, 8) {
            $pos = (2 * $T + $off) % 16
            if ($pos -ge 1 -and $pos -le 11) { Set-Both $c $e (2 + $pos) 12 $P['d'] }
            if ($pos -le 10) { Set-Both $c $e (3 + $pos) 12 $P['b'] }
        }
    }

    Draw-BaseStrip $c $e $P $Active $T
    Sync-Emissive $c $e
    return @{ Color = $c; Emi = $e }
}

# ============================================================================================
#  HOT STRIP MILL - controller face (stable titanium casing)
#  two rolling stands (x3..5 and x7..9: a drive at y3, its spindle at y4..5, the upper work roll y6..8 and the lower one
#  y10..12), the strip along y9 from wall to wall, a spray header (x10..13, y4) with its nozzles (x11, x13 on y5) over the
#  runout table (x10..13, y10..12); droplets fall in the nozzle columns and steam rises in the columns between them
# ============================================================================================
# h..m the strip from white-hot to dull red, n..o cooled steel greys; p/q water; t..v steam (never emissive); K roll glint.
$MillPal = New-Pal ($SteelSpec + ' ' + $PurpleSpec + ' ' + $StainSpec + ' ' + $LampSpec + ' ' + @'
h=FFF6C8 i=FFD24A j=FF9E2A k=E86420 l=B83A18 m=7A2A1E
n=6E6864 o=4A4644
p=CDEFFF q=8ED0F4
t=F2F4F6 u=C6CBD1 v=959BA3
K=F4F8FF
'@)

# A work roll seen end-on (3x3): lit top-left, corners darker than the edges (the bottom-right one almost lost in the
# window) so it reads round, the dark roll neck in the middle.
$MillRoll = @(
    'DAE',
    'BGD',
    'FEH'
)
# Its rim, clockwise from the top-left corner: a glint walks round it while the roll turns.
$MillRim = @(@(0, 0), @(1, 0), @(2, 0), @(2, 1), @(2, 2), @(1, 2), @(0, 2), @(0, 1))
$MillStandX = @(3, 7)
$MillGlow = @('h', 'i', 'j', 'i')       # glow pattern scrolled along the hot strip (x3..9)
$MillCooling = @('j', 'k', 'm', 'n')    # the strip under the sprays (x10..13): glowing -> dull grey
$MillTable = @(
    'CHCH',
    'DEEF',
    'F..F'
)
$MillSteam = @('t', 't', 'u', 'v')      # a steam puff by age, from the strip (y8) up to y5

function New-HotStripMillFrame {
    param([bool]$Active, [int]$T = 0)
    $c = New-Canvas; $e = New-Canvas
    $P = $MillPal
    Write-Map $c 0 0 $WindowBase $P

    # ---- the two rolling stands
    for ($s = 0; $s -lt 2; $s++) {
        $x0 = $MillStandX[$s]
        # drive (y3) with its purple light (the two drives pulse in turn), spindle down to the upper roll (y4..5)
        Set-Px $c $x0 3 $P['D']; Set-Px $c ($x0 + 2) 3 $P['F']
        if ($Active) {
            $lit = (([int][Math]::Floor($T / 2) + $s) % 2) -eq 0
            Set-Both $c $e ($x0 + 1) 3 $P[$(if ($lit) { 'b' } else { 'd' })]
        } else { Set-Px $c ($x0 + 1) 3 $P['f'] }
        Set-Px $c ($x0 + 1) 4 $P['C']; Set-Px $c ($x0 + 1) 5 $P['D']
        Write-Map $c $x0 6 $MillRoll $P
        Write-Map $c $x0 10 $MillRoll $P
        if ($Active) {
            # where the rolls bite the strip they catch its glow
            Set-Px $c ($x0 + 1) 8 (Mix (Get-Px $c ($x0 + 1) 8) $P['j'] 0.35)
            Set-Px $c ($x0 + 1) 10 (Mix (Get-Px $c ($x0 + 1) 10) $P['j'] 0.35)
            # the strip pulls the upper roll anticlockwise and the lower one clockwise; stand 2 runs a quarter turn ahead
            $ph = $T + 2 * $s
            $up = $MillRim[(8 - ($ph % 8)) % 8]; $dn = $MillRim[$ph % 8]
            Set-Px $c ($x0 + $up[0]) (6 + $up[1]) $P['K']
            Set-Px $c ($x0 + $dn[0]) (10 + $dn[1]) $P['K']
        }
    }

    # ---- spray header fed from the ceiling (x11, y3), its bar (y4) and nozzles (y5); the runout table under the sprays
    Set-Px $c 11 3 $P['3']
    $hdr = '1223'
    for ($i = 0; $i -lt 4; $i++) { Set-Px $c (10 + $i) 4 $P[[string]$hdr[$i]] }
    Set-Px $c 11 5 $P['4']; Set-Px $c 13 5 $P['4']
    Write-Map $c 10 10 $MillTable $P

    # ---- the strip (y9): a glow pattern scrolls along it through the stands, then it cools under the sprays to dull grey
    for ($x = 3; $x -le 13; $x++) {
        if ($Active) {
            $tone = if ($x -le 9) { $MillGlow[((($x - $T) % 4) + 4) % 4] } else { $MillCooling[$x - 10] }
            if ($x -le 11) { Set-Both $c $e $x 9 $P[$tone] } else { Set-Px $c $x 9 $P[$tone] }
        } else {
            Set-Px $c $x 9 $P[$(if ($x -le 9) { 'm' } else { 'o' })]
        }
    }

    if ($Active) {
        # water runs along the header towards the far nozzle
        Set-Px $c (10 + ($T % 4)) 4 $P['p']
        # droplets: two per nozzle column, falling one row a frame; where they splash the strip below darkens for a frame
        for ($k = 0; $k -lt 2; $k++) {
            $dx = 11 + 2 * $k
            foreach ($lag in 0, 2) {
                $ph = ($T + $k + $lag) % 4
                if ($ph -lt 3) { Set-Px $c $dx (6 + $ph) $P['q'] }
                else {
                    Set-Px $c $dx 8 $P['p']
                    if ($dx -eq 11) { Set-Both $c $e 11 9 $P['l'] } else { Set-Px $c 13 9 $P['o'] }
                }
            }
        }
        # steam puffs rise from the strip in the columns between the nozzles and fade (not emissive)
        for ($k = 0; $k -lt 2; $k++) {
            $age = ($T + 2 * $k) % 4
            Set-Px $c (10 + 2 * $k) (8 - $age) $P[$MillSteam[$age]]
        }
    }

    Draw-BaseStrip $c $e $P $Active $T
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

if (Test-Want 'plant') { Out-Overlay 'block/multiblock/combined_cycle_plant' ${function:New-CombinedCycleFrame} 3 }
if (Test-Want 'mill') { Out-Overlay 'block/multiblock/hot_strip_mill' ${function:New-HotStripMillFrame} 2 }

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
        Write-Host ("| ``pack/kubejs/assets/grindless/textures/$rel`` | Generated with tools/assets/$ScriptName (procedural pixel art, original) by the combined-cycle and hot mill agent, 2026-10-25 | the pack's licence (pending; proposed CC BY-SA 4.0) |")
    }
}
if ($problems -gt 0) { exit 1 }
