<#
.SYNOPSIS
  Procedural 16x16 pixel art for the three MV Leisure utility multiblocks of Gregtech Grindless: the advanced multi smelter,
  the lava furnace and the weather controller (GregTech style: bevels, top-left light, selective outlines).

.DESCRIPTION
  Every pixel is drawn by this script (palettes + char maps + small shading routines); nothing is copied, traced or edited from
  GregTech Leisure, GregTech Modern or any other mod (GTL is a source of ideas only, docs/research/leisure.md 4.2). Output is
  deterministic: re-running overwrites the same bytes. Same method, ramps and checks as Build-MVTextures.ps1 and
  Build-SyngasTextures.ps1 (whose helpers are copied here so those scripts stay untouched): neutral steel bezel, MV blue accents.

  Writes (under pack/kubejs/assets/grindless/textures/):
    block/multiblock/advanced_multi_smelter/overlay_front.png, overlay_front_active.png(+.mcmeta), overlay_front_active_emissive.png(+.mcmeta)
    block/multiblock/lava_furnace/...         (the same three)
    block/multiblock/weather_controller/...   (the same three)

  Advanced multi smelter (drawn for gtceu:block/casings/solid/machine_casing_heatproof, the pale Invar casing): a wide furnace
  mouth under a lintel with three crucibles side by side, each with a different melt (a mixed batch), a band of copper heating
  coils under the sill, MV blue batch lights on the lintel, MV stripes and the state lamp at the base. 8 frames, frametime 3: the
  coils glow orange-yellow and flicker turn by turn, the three melts shimmer (copper orange, gold yellow, white-hot), flecks of
  vapour rise, the chamber breathes dull red, a light runs along the batch lights and the lamp blinks green. Idle: black mouth,
  solid metal in the crucibles, cold dull-copper coils, batch lights off and a red lamp.

  Lava furnace (drawn for machine_casing_solid_steel): a heavy riveted hearth door with a handle, a recessed window behind two
  grate bars over a pool of lava, and an inlet pipe that comes in from the top and drips into the pool. No electricity, so no
  lamp and no blue: the lava is the state. 8 frames, frametime 4: the pool churns (its rows flowing against each other), a crest
  runs along the surface, bubbles rise and burst, and a bead swells at the nozzle, falls and splashes. Idle: dark red and black
  crust with a few faint embers.

  Weather controller (drawn for machine_casing_solid_steel): a cloud-seeding console with a small sky display, an MV blue
  barometer bar and the state lamp. 8 frames, frametime 2: a pale cloud with rain falling from it, a yellow lightning strike
  (one frame, with an afterglow on the next one) that lights the sky, the barometer falling before the strike and rising after
  it, and a blinking green lamp. Idle: a grey cloud on a dark screen, the barometer dim and a red lamp.

  Run from the repo root (PowerShell 5.1 blocks unsigned scripts by default; this bypass only affects that process):
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-LeisureUtilityTextures.ps1
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-LeisureUtilityTextures.ps1 -Only smelter,lava -Preview C:\path\leisure.png
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-LeisureUtilityTextures.ps1 -Credits

  Overlay conventions (GTM's workable casings, as every other set): transparent background, details only on the overlay, animated
  variants are vertical 16x(16*n) strips with a .png.mcmeta, *_emissive layers hold only the pixels that glow (identical to the colour
  layer). Every pixel is fully opaque or fully transparent. The outer 1 px ring is always left empty so the casing shows around the face.
  The casings come from startup_scripts/grindless/mv/leisure_utility.js (workableCasingModel).

.PARAMETER Only
  Subset of: smelter, lava, weather. Default: all three.
.PARAMETER OutRoot
  Textures root. Default: <repo>/pack/kubejs/assets/grindless/textures
.PARAMETER Preview
  Also write a review sheet (x8, nearest neighbour) to this PNG: one row per face, on a stand-in of its casing drawn by code (idle,
  every active frame with its emissive layer, a dark-room view, the emissive layer alone on black) and then on the other casing.
  Preview only: never shipped, never write it under pack/.
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
foreach ($id in $Only) { if (@('smelter', 'lava', 'weather') -notcontains $id) { throw "Unknown -Only id '$id' (use smelter, lava, weather)" } }

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
    for ($i = 0; $i -lt $Rows.Count; $i++) { if ($Rows[$i].Length -ne $W) { throw "${Name}: row $i has $($Rows[$i].Length) chars, expected $W (got '$($Rows[$i])')" } }
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

# Draws a char map with its own small palette (like Write-Map, '.' leaves the pixel), optionally on the emissive layer too.
function Write-MapBoth {
    param($C, $E, [int]$X0, [int]$Y0, [string[]]$Rows, $Pal, [bool]$Glow)
    for ($j = 0; $j -lt $Rows.Count; $j++) { for ($i = 0; $i -lt $Rows[$j].Length; $i++) {
        $ch = [string]$Rows[$j][$i]
        if ($ch -eq '.') { continue }
        if ($Glow) { Set-Both $C $E ($X0 + $i) ($Y0 + $j) $Pal[$ch] } else { Set-Px $C ($X0 + $i) ($Y0 + $j) $Pal[$ch] }
    } }
}

# Ramps shared with the MV set: neutral steel (lit -> dark), MV blue, state lamp (green M..P, red Q..S), heat (white-hot -> ember).
$SteelSpec = 'A=D3D3D3 B=B0B0B0 C=8E8E8E D=707070 E=565656 F=404040 G=2F2F2F H=222222 I=161616 J=0D0D0D'
$BlueSpec = 'a=E4FBFF b=8FE8FF c=3CC4F0 d=1E8FD0 e=1560A0 f=0C3A6A g=071F3C'
$LampSpec = 'M=E2FFE4 N=62FF86 O=22C257 P=0C6B2E Q=FF5A48 R=B52D22 S=5E1511'
$HeatSpec = '1=FFF8DC 2=FFE27A 3=FFB238 4=F2801C 5=C8500E 6=842A0A 7=4A1608'

# The state lamp of the electric faces (2 px on the base strip): red when idle, green blinking while it works.
function Draw-StateLamp {
    param($C, $E, $P, [int]$X, [int]$Y, [bool]$Active, [int]$T)
    if ($Active) {
        if (($T % 4) -lt 2) { Set-Both $C $E $X $Y $P['M']; Set-Both $C $E ($X + 1) $Y $P['N'] }
        else { Set-Both $C $E $X $Y $P['N']; Set-Both $C $E ($X + 1) $Y $P['O'] }
    } else { Set-Px $C $X $Y $P['Q']; Set-Px $C ($X + 1) $Y $P['R'] }
}

# ============================================================================================
#  ADVANCED MULTI SMELTER - controller face (heatproof Invar casing)
#  a lintel with three batch lights over a wide furnace mouth (x3..12, y3..8) holding three crucibles, a lit sill (y9), the heating
#  coil band (x3..12, y10..11), a plate and the base strip (MV stripes x2..9, state lamp x12..13)
# ============================================================================================
$SmeltPal = New-Pal ($SteelSpec + ' ' + $BlueSpec + ' ' + $LampSpec + ' ' + $HeatSpec + ' ' + @'
k=7C716A l=5C534D m=3F3834 n=A88068
p=FFC27A q=FF8C3A r=D85A1E s=FFF2A0 t=FFD24A u=E8A21E v=FFFFF4 w=FFF0B8 x=FFD88C
y=7A4A30 z=7C6A3A h=5E6068
K=BC8A62 L=8E5C3C T=52301E
'@)

# Static parts. Mouth: H shadow under the lintel and on the left inner wall, I chamber, G right inner wall; B lit sill.
$SmeltBase = @(
    '................',
    '.CDDDDDDDDDDDDE.',
    '.DBBBBBBBBBBBBF.',
    '.DCHHHHHHHHHHEF.',
    '.DCHIIIIIIIIGEF.',
    '.DCHIIIIIIIIGEF.',
    '.DCHIIIIIIIIGEF.',
    '.DCHIIIIIIIIGEF.',
    '.DCHIIIIIIIIGEF.',
    '.DCBBBBBBBBBBEF.',
    '.DGHHHHHHHHHHGF.',
    '.DGHHHHHHHHHHGF.',
    '.DEEEEEEEEEEEEF.',
    '.DGGGGGGGGGGGGF.',
    '.EFFFFFFFFFFFFG.',
    '................'
)
Assert-Map 'SmeltBase' $SmeltBase

# Crucibles (2x3, left column x): melt ramp (spec, lit, shade) when hot, solid metal when cold: copper, gold, iron.
$SmeltCrucibles = @(
    @{ X = 4; Hot = @('p', 'q', 'r'); Cold = 'y' },
    @{ X = 7; Hot = @('s', 't', 'u'); Cold = 'z' },
    @{ X = 10; Hot = @('v', 'w', 'x'); Cold = 'h' }
)
# Melt shimmer: (left, right) ramp indexes per phase; the phase of each crucible is offset so they never shimmer together.
$SmeltShimmer = @(@(0, 1), @(1, 0), @(1, 2), @(2, 1))

function New-SmelterFrame {
    param([bool]$Active, [int]$T = 0)
    $c = New-Canvas; $e = New-Canvas
    $P = $SmeltPal
    Write-Map $c 0 0 $SmeltBase $P

    # ---- chamber (x4..11, y4..8): black when cold; a dull red glow that breathes while the coils are hot
    if ($Active) {
        foreach ($y in 4..8) { foreach ($x in 4..11) {
            $h = if ((Get-Noise $x $y $T 5) -gt 222) { 6 } else { 7 }
            Set-Both $c $e $x $y $P[[string]$h]
        } }
    }

    # ---- three graphite crucibles on the hearth (y6 melt, y7..8 body lit from the left); a different melt in each
    for ($k = 0; $k -lt 3; $k++) {
        $cr = $SmeltCrucibles[$k]; $x0 = $cr.X
        Set-Px $c $x0 7 $P[$(if ($Active) { 'n' } else { 'k' })]; Set-Px $c ($x0 + 1) 7 $P['l']
        Set-Px $c $x0 8 $P['l']; Set-Px $c ($x0 + 1) 8 $P['m']
        if ($Active) {
            $pair = $SmeltShimmer[($T + 3 * $k) % 4]
            Set-Both $c $e $x0 6 $P[[string]$cr.Hot[$pair[0]]]
            Set-Both $c $e ($x0 + 1) 6 $P[[string]$cr.Hot[$pair[1]]]
            # a fleck of vapour leaves the melt and fades on its way up
            $s = ($T - (3 * $k + 1) + 16) % 8
            $fx = $x0 + (($k + 1) % 2)
            if ($s -eq 0) { Set-Both $c $e $fx 5 $P[[string]$cr.Hot[0]] } elseif ($s -eq 1) { Set-Both $c $e $fx 4 $P[[string]$cr.Hot[2]] }
        } else {
            Set-Px $c $x0 6 $P[$cr.Cold]; Set-Px $c ($x0 + 1) 6 (Shade $P[$cr.Cold] 0.75)
        }
    }

    # ---- heating coil band (x3..12, y10..11): '/' turns of wire (2 px lit and mid, 1 px gap); dull copper when cold,
    #      orange-yellow when hot, every turn flickering on its own and a brighter turn running along the band
    foreach ($y in 10, 11) { foreach ($x in 3..12) {
        $ph = ($x + $y) % 3
        if ($Active) {
            $turn = [int][Math]::Floor(($x + $y) / 3)
            $h = @(2, 3, 5)[$ph]
            $n = Get-Noise $turn 1 $T 17
            if ($n -lt 70) { $h += 1 } elseif ($n -gt 210) { $h -= 1 }
            if (($turn % 4) -eq ($T % 4)) { $h -= 1 }
            Set-Both $c $e $x $y $P[[string](Get-ClampInt $h 1 7)]
        } else { Set-Px $c $x $y $P[@('K', 'L', 'T')[$ph]] }
    } }

    # ---- batch lights on the lintel, one over each crucible (MV blue): all lit while working, a brighter one running along
    for ($k = 0; $k -lt 3; $k++) {
        $x = $SmeltCrucibles[$k].X
        if ($Active) {
            if (([Math]::Floor($T / 2) % 4) -eq $k) { Set-Both $c $e $x 2 $P['a']; Set-Both $c $e ($x + 1) 2 $P['b'] }
            else { Set-Both $c $e $x 2 $P['c']; Set-Both $c $e ($x + 1) 2 $P['d'] }
        } else { Set-Px $c $x 2 $P['f']; Set-Px $c ($x + 1) 2 $P['g'] }
    }

    # ---- base strip (y13): MV stripes x2..9 and the state lamp x12..13
    foreach ($x in 2..9) {
        if ((($x - 2) % 4) -lt 2) { if ($Active) { Set-Both $c $e $x 13 $P['d'] } else { Set-Px $c $x 13 $P['f'] } }
        else { Set-Px $c $x 13 $P['g'] }
    }
    Draw-StateLamp $c $e $P 12 13 $Active $T

    Sync-Emissive $c $e
    return @{ Color = $c; Emi = $e }
}

# ============================================================================================
#  LAVA FURNACE - controller face (solid steel casing)
#  a heavy hearth door (bevel lit top/left, rivets in the corners, a handle on the lower band) with a recessed window (x4..11,
#  y5..10) behind two grate bars (x6, x9): chamber y5..6, lava pool y7..10; the inlet pipe comes in from the top (x7..8)
# ============================================================================================
$LavaPal = New-Pal ($SteelSpec + ' ' + @'
k=FFF8C8 l=FFDA4A m=FFA21E n=F2700E o=C8400A p=8A2208
q=4E1A10 r=2C100C s=6A2414 t=8C3618
u=3A1610 v=2A120E
'@)
$LavaRamp = @('k', 'l', 'm', 'n', 'o', 'p')    # hottest -> darkest
$LavaOpen = @(4, 5, 7, 8, 10, 11)              # window columns between the grate bars

# Static parts: pipe (x7..8, y1..4) with its flange on the door's top bevel (y2) and its shadow (x9), rivets (B), the handle on
# the lower band (brackets G, grip y12) and its shadow (y13).
$LavaBase = @(
    '................',
    '.CDDDDDBCDDDDDE.',
    '.DCCCCBABECCCDF.',
    '.DCBEEEBDGEEBFF.',
    '.DCHHHHCEHHHHFF.',
    '.DCHIIEIIEIIDFF.',
    '.DCHIIEIIEIIDFF.',
    '.DCHIIEIIEIIDFF.',
    '.DCHIIEIIEIIDFF.',
    '.DCHIIEIIEIIDFF.',
    '.DCHIIEIIEIIDFF.',
    '.DCCCCCCCCCCCFF.',
    '.DCBEGBABCGEBFF.',
    '.DDFFFFHHHHFFFF.',
    '.EFFFFFFFFFFFFG.',
    '................'
)
Assert-Map 'LavaBase' $LavaBase

# Bubbles: column and start frame; each rises for three frames, bursts at the surface and throws a spatter up.
$LavaBubbles = @(@{ X = 5; P = 1 }, @{ X = 10; P = 5 })

function New-LavaFrame {
    param([bool]$Active, [int]$T = 0)
    $c = New-Canvas; $e = New-Canvas
    $P = $LavaPal
    Write-Map $c 0 0 $LavaBase $P

    foreach ($x in $LavaOpen) {
        if ($Active) {
            # chamber lit from below by the pool (not emissive: only the lava and the drip glow)
            Set-Px $c $x 5 $P['v']; Set-Px $c $x 6 $P['u']
            # the pool churns: the rows flow against each other and the pattern wraps every 8 frames
            foreach ($y in 7..10) {
                $dir = if (($y % 2) -eq 1) { 1 } else { -1 }
                $key = ((($x - 4 - $dir * $T) % 8) + 8) % 8
                $idx = $y - 6
                $u = Get-Noise $key $y 0 23
                if ($u -lt 64) { $idx -= 1 } elseif ($u -gt 196) { $idx += 1 }
                Set-Both $c $e $x $y $P[$LavaRamp[(Get-ClampInt $idx 0 5)]]
            }
            # a crest heaves along the surface
            if ((((($x - $T) % 4) + 4) % 4) -eq 0) { Set-Both $c $e $x 6 $P['n'] }
        } else {
            # cooling crust: dark red skin over black, a few faint embers
            foreach ($y in 7..10) {
                $ch = if ($y -eq 7) { 'q' } else { 'r' }
                $u = Get-Noise $x $y 0 29
                if ($u -gt 228) { $ch = 't' } elseif ($u -gt 190) { $ch = 's' } elseif ($y -gt 7 -and $u -lt 56) { $ch = 'q' }
                Set-Px $c $x $y $P[$ch]
            }
        }
    }

    if ($Active) {
        foreach ($b in $LavaBubbles) {
            $s = ($T - $b.P + 8) % 8
            $bx = $b.X
            if ($s -eq 0) { Set-Both $c $e $bx 10 $P['l'] }
            elseif ($s -eq 1) { Set-Both $c $e $bx 9 $P['l'] }
            elseif ($s -eq 2) { Set-Both $c $e $bx 8 $P['k'] }
            elseif ($s -eq 3) { Set-Both $c $e $bx 7 $P['k']; Set-Both $c $e $bx 6 $P['m'] }
            elseif ($s -eq 4) { Set-Both $c $e $bx 5 $P['n'] }
        }
        # the inlet drips (x8): the nozzle lip glows, a bead swells, falls, splashes into the pool and the ripple spreads
        $s = $T % 8
        Set-Both $c $e 8 5 $P['p']
        if ($s -eq 1) { Set-Both $c $e 8 5 $P['n'] }
        elseif ($s -eq 2) { Set-Both $c $e 8 5 $P['l'] }
        elseif ($s -eq 3) { Set-Both $c $e 8 6 $P['l'] }
        elseif ($s -eq 4) { Set-Both $c $e 8 7 $P['k']; Set-Both $c $e 7 6 $P['m'] }
        elseif ($s -eq 5) { Set-Both $c $e 7 7 $P['k'] }
    }

    Sync-Emissive $c $e
    return @{ Color = $c; Emi = $e }
}

# ============================================================================================
#  WEATHER CONTROLLER - controller face (solid steel casing)
#  a sky display (x3..12, y3..11) with a cloud (x4..11, y4..7) and its rain (y8..11), a lit lower lip (y12), then the control
#  strip (y13): MV blue barometer bar x3..9 and the state lamp x12..13
# ============================================================================================
$WxPal = New-Pal ($SteelSpec + ' ' + $BlueSpec + ' ' + $LampSpec + ' ' + @'
k=16243A l=1C3050 m=243C62 n=10151C
h=2C4674 i=36548A j=4064A0
v=A8E2FF w=5A9AD2
x=FFF8B0 y=FFD23A
'@)

$WxBase = @(
    '................',
    '.CDDDDDDDDDDDDE.',
    '.DGGGGGGGGGGGGF.',
    '.DGnnnnnnnnnnGF.',
    '.DGnnnnnnnnnnGF.',
    '.DGnnnnnnnnnnGF.',
    '.DGnnnnnnnnnnGF.',
    '.DGnnnnnnnnnnGF.',
    '.DGnnnnnnnnnnGF.',
    '.DGnnnnnnnnnnGF.',
    '.DGnnnnnnnnnnGF.',
    '.DGnnnnnnnnnnGF.',
    '.DDDDDDDDDDDDDF.',
    '.DGHHHHHHHGGGGF.',
    '.EFFFFFFFFFFFFG.',
    '................'
)
Assert-Map 'WxBase' $WxBase

# Cloud icon (o spec, p body, q shade, r underside) and its three lightings.
$WxCloud = @(
    '...oo...',
    '.oopppq.',
    'oppppppq',
    '.rrrrrr.'
)
Assert-Map 'WxCloud' $WxCloud 8 4
$WxCloudDay = New-Pal 'o=F4F8FC p=D0DAE6 q=A2B0C2 r=76849A'
$WxCloudFlash = New-Pal 'o=FFFFF4 p=EEF2F8 q=C8D2E0 r=FFE89A'
$WxCloudIdle = New-Pal 'o=6C727A p=52585F q=3E434A r=33373D'

$WxRain = @(@{ X = 5; P = 0 }, @{ X = 7; P = 2 }, @{ X = 9; P = 1 }, @{ X = 11; P = 3 })   # columns and phases (period 4)
$WxStrike = 5                                                                               # the frame of the lightning
$WxBolt = @(@(8, 8, 'x'), @(7, 9, 'x'), @(7, 10, 'y'), @(8, 10, 'x'), @(7, 11, 'x'))
$WxAfterglow = @(@(8, 8, 'y'), @(7, 9, 'y'), @(7, 10, 'y'), @(8, 10, 'y'), @(7, 11, 'y'))
$WxBaro = @(6, 5, 5, 4, 3, 2, 3, 5)                                                        # barometer cells lit per frame (of 7)

function New-WeatherFrame {
    param([bool]$Active, [int]$T = 0)
    $c = New-Canvas; $e = New-Canvas
    $P = $WxPal
    Write-Map $c 0 0 $WxBase $P
    $strike = $Active -and ($T -eq $WxStrike)

    # ---- sky: a storm gradient while it works (brighter in the strike frame), dark glass when idle
    if ($Active) {
        foreach ($y in 3..11) { foreach ($x in 3..12) {
            $band = if ($y -le 5) { 0 } elseif ($y -le 8) { 1 } else { 2 }
            $ch = if ($strike) { @('h', 'i', 'j')[$band] } else { @('k', 'l', 'm')[$band] }
            Set-Both $c $e $x $y $P[$ch]
        } }
    }

    # ---- cloud (x4..11, y4..7)
    $cloudPal = if (-not $Active) { $WxCloudIdle } elseif ($strike) { $WxCloudFlash } else { $WxCloudDay }
    Write-MapBoth $c $e 4 4 $WxCloud $cloudPal $Active

    if ($Active) {
        # ---- rain: four columns, one drop each (head and tail), 1 px per frame
        foreach ($r in $WxRain) {
            $hy = 8 + (($T + $r.P) % 4)
            Set-Both $c $e $r.X $hy $P['v']
            if ($hy -gt 8) { Set-Both $c $e $r.X ($hy - 1) $P['w'] }
        }
        # ---- lightning: the strike, then its afterglow
        $bolt = if ($strike) { $WxBolt } elseif ($T -eq ($WxStrike + 1)) { $WxAfterglow } else { @() }
        foreach ($px in $bolt) { Set-Both $c $e $px[0] $px[1] $P[[string]$px[2]] }
    }

    # ---- barometer (x3..9, y13): falls before the strike, rises after it; the head cell is the brightest
    $lvl = if ($Active) { $WxBaro[$T % 8] } else { 3 }
    for ($i = 0; $i -lt 7; $i++) {
        $x = 3 + $i
        if ($Active) {
            if ($i -lt $lvl) { Set-Both $c $e $x 13 $P[$(if ($i -eq ($lvl - 1)) { 'b' } else { 'c' })] } else { Set-Px $c $x 13 $P['f'] }
        } else { Set-Px $c $x 13 $P[$(if ($i -lt $lvl) { 'e' } else { 'g' })] }
    }
    Draw-StateLamp $c $e $P 12 13 $Active $T

    Sync-Emissive $c $e
    return @{ Color = $c; Emi = $e }
}

# ============================================================================================
#  BUILD
# ============================================================================================
function Out-Overlay {
    param([string]$Dir, $Builder, [int]$FrameCount, [int]$FrameTime)
    $frames = @(); $emis = @()
    for ($f = 0; $f -lt $FrameCount; $f++) { $r = & $Builder $true $f; $frames += $r.Color; $emis += $r.Emi }
    $idle = & $Builder $false 0
    Out-Tex $idle.Color "$Dir/overlay_front.png"
    Out-Tex (Join-Frames $frames) "$Dir/overlay_front_active.png" $FrameTime
    Out-Tex (Join-Frames $emis) "$Dir/overlay_front_active_emissive.png" $FrameTime
}

if (Test-Want 'smelter') { Out-Overlay 'block/multiblock/advanced_multi_smelter' ${function:New-SmelterFrame} 8 3 }
if (Test-Want 'lava') { Out-Overlay 'block/multiblock/lava_furnace' ${function:New-LavaFrame} 8 4 }
if (Test-Want 'weather') { Out-Overlay 'block/multiblock/weather_controller' ${function:New-WeatherFrame} 8 2 }

# ============================================================================================
#  VERIFY what was written: size (16x16, or a 16x(16*n) strip with n 4..8 and a .mcmeta whose frametime is 2..4), binary alpha,
#  no pure black, an empty casing ring in every frame, animation that really animates, and an emissive strip with the colour
#  strip's size and frametime whose every pixel is the colour layer's pixel (and glows in every frame)
# ============================================================================================
function Get-FrameTime {
    param([string]$Path)
    return [int]((Get-Content -Raw -LiteralPath $Path | ConvertFrom-Json).animation.frametime)
}

$problems = 0
foreach ($rel in $written) {
    if ($rel.EndsWith('.mcmeta')) { continue }
    $path = Join-Path $OutRoot ($rel -replace '/', '\')
    $img = Read-Png $path
    $msgs = @()
    $animated = Test-Path -LiteralPath ($path + '.mcmeta')
    if ($img.W -ne 16 -or $img.H -lt 16 -or ($img.H % 16) -ne 0) { $msgs += "bad size $($img.W)x$($img.H)" }
    elseif (-not $animated -and $img.H -ne 16) { $msgs += "static texture is $($img.W)x$($img.H), expected 16x16" }
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
    $n = [int]($img.H / 16)
    if ($animated) {
        if ($n -lt 4 -or $n -gt 8) { $msgs += "animation has $n frames (expected 4-8)" }
        $ft = Get-FrameTime ($path + '.mcmeta')
        if ($ft -lt 2 -or $ft -gt 4) { $msgs += "frametime $ft (expected 2-4)" }
        if ($rel -notlike '*_emissive.png') {
            $seen = @{}
            for ($f = 0; $f -lt $n; $f++) { $seen[(($img.P[($f * 256)..($f * 256 + 255)]) -join ',')] = 1 }
            if ($seen.Count -lt 4) { $msgs += "only $($seen.Count) distinct frames out of $n" }
        } else {
            for ($f = 0; $f -lt $n; $f++) {
                $lit = 0
                for ($i = $f * 256; $i -lt ($f + 1) * 256; $i++) { if ((($img.P[$i] -shr 24) -band 255) -ne 0) { $lit++ } }
                if ($lit -eq 0) { $msgs += "emissive frame $f is empty" }
            }
        }
    }
    if ($rel -like 'block/*') {
        for ($f = 0; $f -lt $n; $f++) { for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
            if ($x -lt 1 -or $y -lt 1 -or $x -ge 15 -or $y -ge 15) {
                if ((($img.P[($f * 16 + $y) * 16 + $x] -shr 24) -band 255) -ne 0) { $msgs += "opaque pixel in the casing ring (frame $f, $x,$y)"; $f = $n; $y = 16; break }
            }
        } } }
    }
    if ($rel -like '*_active_emissive.png') {
        $colorPath = Join-Path $OutRoot (($rel -replace '_emissive\.png$', '.png') -replace '/', '\')
        $color = Read-Png $colorPath
        if ($color.W -ne $img.W -or $color.H -ne $img.H) { $msgs += 'emissive strip size differs from the colour strip' }
        else {
            for ($i = 0; $i -lt $img.P.Length; $i++) {
                if ((($img.P[$i] -shr 24) -band 255) -ne 0 -and $img.P[$i] -ne $color.P[$i]) { $msgs += "emissive pixel $i is not the colour layer's pixel"; break }
            }
        }
        if ((Test-Path -LiteralPath ($colorPath + '.mcmeta')) -and $animated) {
            if ((Get-FrameTime ($colorPath + '.mcmeta')) -ne (Get-FrameTime ($path + '.mcmeta'))) { $msgs += 'emissive frametime differs from the colour strip' }
        } else { $msgs += 'colour strip or emissive strip has no .mcmeta' }
    }
    if ($msgs.Count -gt 0) { $problems++; Write-Warning "$rel : $($msgs -join '; ')" }
}

Write-Host "written $($written.Count) files under $OutRoot ($problems with warnings)"
foreach ($rel in $written) { Write-Host "  $rel" }

# ============================================================================================
#  PREVIEW (optional, never shipped)
# ============================================================================================
if ($Preview) {
    $previewPath = [System.IO.Path]::GetFullPath($Preview)
    $packRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..\pack')).TrimEnd('\') + '\'
    if ($previewPath.StartsWith($packRoot, [System.StringComparison]::OrdinalIgnoreCase)) { throw "-Preview must not write under pack/ ($previewPath)" }

    # bevelled stand-ins of the two casings: light rim top/left, dark rim bottom/right, a recessed panel in the middle
    # (keys: a lit rim, b top rim, c face, d groove, e shade rim, f bottom rim, l panel, m panel stripe)
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
    $heatproof = New-StandInPanel 'a=DCD7C6 b=CFCAB8 c=C1BCA9 d=7B7663 e=A6A18E f=97927F l=B2AD99 m=C2BDA9'
    $steel = New-StandInPanel 'a=85807B b=79756F c=6D6963 d=3D3934 e=56524D f=4A4641 l=34373C m=464A50'

    function Get-Frame { param($Strip, [int]$Index) $f = New-Canvas 16 16; [Array]::Copy($Strip.P, $Index * 256, $f.P, 0, 256); return $f }
    function Merge-On { param($Dst, $Src) $o = Copy-Canvas $Dst; Merge-Canvas $o $Src; return $o }
    function Get-Dark {
        param($Base, $Col, $Emi)
        $o = Merge-On $Base $Col
        for ($i = 0; $i -lt $o.P.Length; $i++) { $o.P[$i] = Shade $o.P[$i] 0.25 }
        return (Merge-On $o $Emi)
    }
    $night = New-Canvas 16 16
    for ($i = 0; $i -lt 256; $i++) { $night.P[$i] = Hex '0A0B0D' }

    $faces = @(
        @{ Dir = 'advanced_multi_smelter'; Own = $heatproof; Other = $steel },
        @{ Dir = 'lava_furnace'; Own = $steel; Other = $heatproof },
        @{ Dir = 'weather_controller'; Own = $steel; Other = $heatproof }
    )
    $rows = New-Object System.Collections.Generic.List[object]
    foreach ($fc in $faces) {
        $dir = Join-Path $OutRoot "block\multiblock\$($fc.Dir)"
        if (-not (Test-Path -LiteralPath (Join-Path $dir 'overlay_front_active_emissive.png'))) { continue }
        $idle = Read-Png (Join-Path $dir 'overlay_front.png')
        $act = Read-Png (Join-Path $dir 'overlay_front_active.png')
        $emi = Read-Png (Join-Path $dir 'overlay_front_active_emissive.png')
        $n = [int]($act.H / 16)
        $tiles = New-Object System.Collections.Generic.List[object]
        $tiles.Add((Merge-On $fc.Own $idle))
        for ($f = 0; $f -lt $n; $f++) { $tiles.Add((Merge-On (Merge-On $fc.Own (Get-Frame $act $f)) (Get-Frame $emi $f))) }
        # dark room and emissive alone: the frame that glows the most
        $best = 0; $bestCount = -1
        for ($f = 0; $f -lt $n; $f++) {
            $cnt = 0; for ($i = $f * 256; $i -lt ($f + 1) * 256; $i++) { if ($emi.P[$i] -ne 0) { $cnt++ } }
            if ($cnt -gt $bestCount) { $best = $f; $bestCount = $cnt }
        }
        $tiles.Add((Get-Dark $fc.Own (Get-Frame $act $best) (Get-Frame $emi $best)))
        $tiles.Add((Merge-On $night (Get-Frame $emi $best)))
        $tiles.Add((Merge-On $fc.Other $idle))
        $tiles.Add((Merge-On (Merge-On $fc.Other (Get-Frame $act 0)) (Get-Frame $emi 0)))
        $rows.Add($tiles)
    }
    if ($rows.Count -eq 0) { throw 'Nothing to preview: no overlay of this set found under the textures root' }

    $scale = 8; $gap = 4; $cell = 16 * $scale + $gap
    $cols = 0; foreach ($r in $rows) { $cols = [Math]::Max($cols, $r.Count) }
    $sheet = New-Canvas ($cols * $cell + $gap) ($rows.Count * $cell + $gap)
    $bg = Hex '202428'
    for ($i = 0; $i -lt $sheet.P.Length; $i++) { $sheet.P[$i] = $bg }
    for ($r = 0; $r -lt $rows.Count; $r++) { for ($t = 0; $t -lt $rows[$r].Count; $t++) {
        $x0 = $gap + $t * $cell; $y0 = $gap + $r * $cell
        $tile = $rows[$r][$t]
        for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
            $v = $tile.P[$y * 16 + $x]
            if (($v -band 0xFF000000) -eq 0) { continue }
            for ($j = 0; $j -lt $scale; $j++) {
                $o = ($y0 + $y * $scale + $j) * $sheet.W + $x0 + $x * $scale
                for ($i = 0; $i -lt $scale; $i++) { $sheet.P[$o + $i] = $v }
            }
        } }
    } }
    Save-Png $sheet $previewPath
    Write-Host "preview: $previewPath (one row per face: idle, every active frame with its emissive layer, dark room, emissive alone, then idle and frame 0 on the other casing)"
}

if ($Credits) {
    Write-Host ''
    foreach ($rel in $written) {
        Write-Host ("| ``pack/kubejs/assets/grindless/textures/$rel`` | Generated with tools/assets/$ScriptName (procedural pixel art, original) by the Leisure utility agent, 2026-10-25 | the pack's licence (pending; proposed CC BY-SA 4.0) |")
    }
}

if ($problems -gt 0) { exit 1 }
