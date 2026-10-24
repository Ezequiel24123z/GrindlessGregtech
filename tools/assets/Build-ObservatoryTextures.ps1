<#
.SYNOPSIS
  Procedural 16x16 pixel art for the observatory family (Steam to MV) of Gregtech Grindless (GregTech style: bevels,
  top-left light, selective outlines).

.DESCRIPTION
  Every pixel is drawn by this script (palettes, char maps and small shading routines); nothing is copied or edited
  from GregTech Modern or any other mod. Output is deterministic: re-running overwrites the same bytes.

  Writes (under pack/kubejs/assets/grindless/textures/):
    block/multiblock/steam_observatory/    overlay_front.png, overlay_front_active.png(+.mcmeta), overlay_front_active_emissive.png(+.mcmeta)
    block/multiblock/optical_observatory/  the same three
    block/multiblock/radio_telescope/      the same three
    item/lunar_chart_draft.png      Steam: an inked parchment sketch of the Moon
    item/photographic_plate.png     LV: a glass plate with a silver emulsion
    item/lunar_map.png              LV: a printed photographic map of the Moon on a grid
    item/lunar_ephemeris.png        LV: a printed sheet of tables with a Moon phase in the corner
    item/lunar_landing_chart.png    MV: a radio plot, green radar contours on a dark plot with the landing ellipse in red

  The family changes shape and parts with the era, not only colour (docs/viaje.md), and so do the faces:
    Steam  a brass telescope behind an arched brass window, pointed at the Moon; a clockwork gear and an oil lamp
    LV     a steel dome with an open slit, the refractor in it; a red darkroom safelight, the plate being exposed, a state lamp
    MV     an aluminium dish under a cloudy sky catching radar echoes, its pedestal, an oscilloscope with the echo, a state lamp
  and the charts go parchment draft -> printed map -> radio plot.

  Run from the repo root (PowerShell 5.1 blocks unsigned scripts by default; this bypass only affects that process):
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-ObservatoryTextures.ps1
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-ObservatoryTextures.ps1 -Only steam,charts

  Overlay conventions (same as GregTech Modern's workable casings and the earlier sets): transparent background, details
  only on the overlay, animated variants are vertical 16x(16*8) strips with a .png.mcmeta, *_emissive layers hold only
  the pixels that glow (identical to the colour layer). Every pixel is fully opaque or fully transparent. The outer 1 px
  ring is always left empty so the casing shows around the face. Each face is drawn for the casing of its multiblock
  (observatory/machines.js): bronze plated bricks, solid steel and frost-proof aluminium.

.PARAMETER Only
  Subset of: steam, optical, radio, charts. Default: everything.
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

# An emissive pixel only counts while the colour layer still shows it: drops the ones a later draw covered.
function Sync-Emissive {
    param($C, $E)
    $dropped = 0
    for ($i = 0; $i -lt $E.P.Length; $i++) { if ($E.P[$i] -ne 0 -and $E.P[$i] -ne $C.P[$i]) { $E.P[$i] = 0; $dropped++ } }
    if ($dropped -gt 0) { Write-Verbose "Sync-Emissive: $dropped emissive pixel(s) covered by a later draw" }
}

# Deterministic 0..255 hash of (x, y, frame, salt): flicker and grain without a random generator.
function Get-Noise {
    param([long]$X, [long]$Y, [long]$T = 0, [long]$Salt = 0)
    $h = (($X * 73856093L) -bxor ($Y * 19349663L) -bxor ($T * 83492791L) -bxor ($Salt * 2654435761L)) % 1000003L
    if ($h -lt 0) { $h = -$h }
    return [int](($h * 7919L) % 256L)
}

# Neutral steel ramp shared by every overlay (lit -> dark), the same one as the LV to HV sets.
$SteelSpec = 'A=D3D3D3 B=B0B0B0 C=8E8E8E D=707070 E=565656 F=404040 G=2F2F2F H=222222 I=161616 J=0D0D0D'
# State lamp: green while working (M..P), red while idle (Q..S), as in the LV to HV sets.
$LampSpec = 'M=E2FFE4 N=62FF86 O=22C257 P=0C6B2E Q=FF5A48 R=B52D22 S=5E1511'
# The night sky, its stars and the Moon, shared by the three faces.
$SkySpec = 'q=0A1027 r=111A3A s=1A2850 v=7E89A6 w=F2F6FF m=FBF6E0 n=DED7B8 o=A9A189'

# ============================================================================================
#  CLOCKWORK OBSERVATORY (Steam) - controller face, on bronze plated bricks
#  an arched brass window on the night sky; a brass telescope rises across it to the Moon on a brass column; under the sill
#  the clockwork gear of the drive and an oil lamp. Working: the gear turns, the stars twinkle, the lamp burns.
# ============================================================================================
$SteamPal = New-Pal ($SteelSpec + ' ' + $SkySpec + ' ' + @'
a=FFF1BE b=F4D27C c=DDAE4F d=B6852C e=835C19 f=4C3410 g=2B1C07
k=FFF7D0 l=FFC447 p=E8761A t=5A3410
'@)

$SteamBase = @(
    '................',
    '....cccccccc....',
    '...cqqqqqqqqd...',
    '..cqqqqqqqqqqd..',
    '..cqqqqqqqqqqd..',
    '..crrrrrrrrrrd..',
    '..crrrrrrrrrrd..',
    '..csssssssssse..',
    '..csssssssssse..',
    '..deeeeeeeeeef..',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................'
)
Assert-Map 'SteamBase' $SteamBase

# the gear of the clock drive, 5x5 around (5,12): two phases (teeth on the axes / on the diagonals) alternate as it turns
$GearA = @('..b..', '.cdd.', 'bdfdb', '.dde.', '..d..')
$GearB = @('b...b', '.cdd.', '.dfd.', '.dde.', 'd...d')

function New-SteamObsFrame {
    param([bool]$Active, [int]$T = 0)
    $c = New-Canvas; $e = New-Canvas
    $P = $SteamPal
    Write-Map $c 0 0 $SteamBase $P

    # stars: twinkle while the drive runs; fewer and dimmer when idle
    $stars = @(@(4, 3), @(7, 2), @(12, 5), @(11, 7), @(9, 7), @(3, 5), @(10, 5))
    for ($k = 0; $k -lt $stars.Count; $k++) {
        $s = $stars[$k]
        if ($Active) {
            if ((($T + 2 * $k) % 8) -lt 2) { Set-Both $c $e $s[0] $s[1] $P['w'] } else { Set-Px $c $s[0] $s[1] $P['v'] }
        } elseif (($k % 2) -eq 0) {
            Set-Px $c $s[0] $s[1] $P['v']
        }
    }

    # the Moon, up and to the right, where the telescope points
    if ($Active) {
        Set-Both $c $e 10 2 $P['m']; Set-Both $c $e 11 2 $P['n']; Set-Both $c $e 10 3 $P['n']; Set-Both $c $e 11 3 $P['o']
    } else {
        Set-Px $c 10 2 $P['n']; Set-Px $c 11 2 $P['o']; Set-Px $c 10 3 $P['o']; Set-Px $c 11 3 $P['o']
    }

    # the brass column of the mount, from the sill to the middle of the tube
    Set-Px $c 6 8 $P['e']; Set-Px $c 6 7 $P['d']; Set-Px $c 7 8 $P['f']

    # the tube: two pixels wide, from the eyepiece (lower left) to the objective (upper right); lit on its upper-left edge
    for ($y = 8; $y -ge 4; $y--) {
        $x = 3 + (8 - $y)
        Set-Px $c $x $y $P['b']; Set-Px $c ($x + 1) $y $P['d']
    }
    Set-Px $c 2 8 $P['e']
    Set-Px $c 8 3 $P['a']; Set-Px $c 9 3 $P['c']; Set-Px $c 9 4 $P['e']

    # under the sill: the gear of the clock drive (turning while it works) and the oil lamp
    $gear = if ($Active -and (($T % 4) -ge 2)) { $GearB } else { $GearA }
    Write-Map $c 3 10 $gear $P
    # lamp: brass cap, glass, brass foot
    Set-Px $c 10 10 $P['c']; Set-Px $c 11 10 $P['d']; Set-Px $c 12 10 $P['e']
    for ($y = 11; $y -le 13; $y++) { Set-Px $c 10 $y $P['d']; Set-Px $c 12 $y $P['e']; Set-Px $c 11 $y $P['t'] }
    Set-Px $c 10 14 $P['d']; Set-Px $c 11 14 $P['e']; Set-Px $c 12 14 $P['f']
    if ($Active) {
        $tip = if (($T % 2) -eq 0) { 'k' } else { 'l' }
        Set-Both $c $e 11 11 $P[$tip]
        Set-Both $c $e 11 12 $P['l']
        Set-Both $c $e 11 13 $P['p']
    }
    # a short steam pipe from the gear to the lamp (the drive is wound by steam)
    Set-Px $c 8 12 $P['d']; Set-Px $c 9 12 $P['e']

    Sync-Emissive $c $e
    return @{ Color = $c; Emi = $e }
}

# ============================================================================================
#  OPTICAL OBSERVATORY (LV) - controller face, on solid steel
#  a framed night sky with a silver dome on its drum; the refractor's tube rises out of the open slit towards the stars;
#  along the bottom a red darkroom safelight, the plate holder where the Moon builds up while the plate is exposed, and the
#  state lamp. Working: the stars twinkle, the safelight pulses, the plate fills in, the lamp is green.
# ============================================================================================
$OpticalPal = New-Pal ($SteelSpec + ' ' + $LampSpec + ' ' + $SkySpec)
$DomeRamp = @('A', 'B', 'C', 'D', 'E', 'F')
# the image on the plate, darkest -> brightest as the exposure goes on (8 steps, then a fresh plate)
$PlateRamp = @('J', 'I', 'H', 'G', 'F', 'o', 'n', 'm')

$OpticalBase = @(
    '................',
    '.GGGGGGGGGGGGGG.',
    '.GqqqqqqqqqqqqG.',
    '.GqqqqqqqqqqqqG.',
    '.GrrrrrrrrrrrrG.',
    '.GrrrrrrrrrrrrG.',
    '.GrrrrrrrrrrrrG.',
    '.GssssssssssssG.',
    '.GssssssssssssG.',
    '.GssssssssssssG.',
    '.GssssssssssssG.',
    '.GssssssssssssG.',
    '.GHHHHHHHHHHHHG.',
    '.FFFFFFFFFFFFFF.',
    '.GGGGGGGGGGGGGG.',
    '................'
)
Assert-Map 'OpticalBase' $OpticalBase

function New-OpticalObsFrame {
    param([bool]$Active, [int]$T = 0)
    $c = New-Canvas; $e = New-Canvas
    $P = $OpticalPal
    Write-Map $c 0 0 $OpticalBase $P

    # stars around the dome
    $stars = @(@(3, 3), @(5, 2), @(10, 2), @(12, 4), @(2, 7), @(13, 8), @(4, 5))
    for ($k = 0; $k -lt $stars.Count; $k++) {
        $s = $stars[$k]
        if ($Active) {
            if ((($T + 2 * $k) % 8) -lt 2) { Set-Both $c $e $s[0] $s[1] $P['w'] } else { Set-Px $c $s[0] $s[1] $P['v'] }
        } elseif (($k % 2) -eq 1) {
            Set-Px $c $s[0] $s[1] $P['v']
        }
    }

    # the dome: a silver hemisphere centred at (8, 9.5), radius 4.6, shaded as a sphere lit from the top-left
    for ($y = 4; $y -le 9; $y++) { for ($x = 3; $x -le 12; $x++) {
        $dx = ($x + 0.5) - 8.0; $dy = ($y + 0.5) - 9.5
        $r2 = ($dx * $dx + $dy * $dy) / (4.6 * 4.6)
        if ($r2 -gt 1.0) { continue }
        $nz = [Math]::Sqrt(1.0 - $r2)
        $lit = (- $dx / 4.6) * 0.62 + (- $dy / 4.6) * 0.5 + $nz * 0.6
        $tone = if ($lit -gt 0.92) { 0 } elseif ($lit -gt 0.7) { 1 } elseif ($lit -gt 0.48) { 2 } elseif ($lit -gt 0.25) { 3 } else { 4 }
        if ($r2 -gt 0.8) { $tone = Get-ClampInt ($tone + 1) 0 5 }
        Set-Px $c $x $y $P[$DomeRamp[$tone]]
    } }
    # the drum under the dome, with a door, standing on the ground line
    for ($y = 10; $y -le 11; $y++) { for ($x = 4; $x -le 11; $x++) {
        $tone = if ($x -le 5) { 'C' } elseif ($x -ge 10) { 'F' } else { 'D' }
        Set-Px $c $x $y $P[$tone]
    } }
    Set-Px $c 7 11 $P['I']; Set-Px $c 8 11 $P['J']; Set-Px $c 7 10 $P['H']; Set-Px $c 8 10 $P['I']
    # the open slit down the dome and the tube rising out of it, the objective catching the light at its top
    for ($y = 5; $y -le 9; $y++) { Set-Px $c 7 $y $P['I']; Set-Px $c 8 $y $P['J'] }
    for ($y = 3; $y -le 6; $y++) { Set-Px $c 7 $y $P['C']; Set-Px $c 8 $y $P['E'] }
    Set-Px $c 7 2 $P['A']; Set-Px $c 8 2 $P['C']
    if ($Active) { Set-Both $c $e 7 2 $P['w'] }

    # bottom strip: safelight (x2..3), plate holder (x5..10), state lamp (x12..13)
    if ($Active) {
        $glow = if (($T % 4) -lt 2) { 'Q' } else { 'R' }
        Set-Both $c $e 2 13 $P[$glow]; Set-Both $c $e 3 13 $P['R']
        Set-Both $c $e 12 13 $P['M']; Set-Both $c $e 13 13 $P['N']
    } else {
        Set-Px $c 2 13 $P['S']; Set-Px $c 3 13 $P['S']
        Set-Px $c 12 13 $P['Q']; Set-Px $c 13 13 $P['R']
    }
    Set-Px $c 5 13 $P['C']; Set-Px $c 10 13 $P['E']
    for ($x = 6; $x -le 9; $x++) { Set-Px $c $x 13 $P['J'] }
    if ($Active) {
        # the Moon builds up on the plate as it is exposed; the darkest steps are not a glow yet
        $step = $T % 8
        $pts = @(@(7, 13, $step), @(8, 13, [Math]::Max(0, $step - 1)), @(6, 13, [Math]::Max(0, $step - 3)))
        foreach ($pt in $pts) {
            $tone = $P[$PlateRamp[$pt[2]]]
            if ((Get-Lum $tone) -ge 60) { Set-Both $c $e $pt[0] $pt[1] $tone } else { Set-Px $c $pt[0] $pt[1] $tone }
        }
    }
    Sync-Emissive $c $e
    return @{ Color = $c; Emi = $e }
}

# ============================================================================================
#  RADIO TELESCOPE (MV) - controller face, on frost-proof aluminium
#  a white dish on its pedestal under a cloudy night sky (radio goes through cloud), the feed on its strut at the focus;
#  radar echoes come back to it as blue arcs; at the bottom an oscilloscope with the echo running across and the state
#  lamp. Working: the arcs close in on the feed, the echo blip runs, the lamp is green.
# ============================================================================================
$RadioPal = New-Pal ($SteelSpec + ' ' + $LampSpec + ' ' + 'q=0A1027 r=111A3A s=1A2850 v=7E89A6 w=F2F6FF' + ' ' + @'
W=F6F9FC X=DCE3EC Y=B9C3D0 Z=909BAA
a=E2F0FF b=A9D1FF c=5FA2F0 d=2F6BC4 e=1A417E
k=3A4560 l=2A3350
u=D4FFE0 x=55F27E y=1F8A3E z=0C2E18
'@)

$RadioBase = @(
    '................',
    '.HHHHHHHHHHHHHH.',
    '.HqqqqqqqqqqqqH.',
    '.HqqqqqqqqqqqqH.',
    '.HrrrrrrrrrrrrH.',
    '.HrrrrrrrrrrrrH.',
    '.HssssssssssssH.',
    '.HssssssssssssH.',
    '.HssssssssssssH.',
    '.HssssssssssssH.',
    '.HssssssssssssH.',
    '.HHHHHHHHHHHHHH.',
    '................',
    '................',
    '................',
    '................'
)
Assert-Map 'RadioBase' $RadioBase

$DishC = @(6.5, 7.6)          # dish centre
$DishU = @(0.7071, -0.7071)   # where it points: up and to the right
$DishV = @(0.7071, 0.7071)    # across the dish
$DishFocus = @(9.6, 4.5)

function New-RadioFrame {
    param([bool]$Active, [int]$T = 0)
    $c = New-Canvas; $e = New-Canvas
    $P = $RadioPal
    Write-Map $c 0 0 $RadioBase $P

    # clouds drifting across the sky (radio does not care)
    $cloud = @(@(3, 3), @(4, 3), @(5, 2), @(6, 2), @(7, 3), @(11, 6), @(12, 6), @(12, 5), @(13, 6), @(3, 9), @(4, 9))
    foreach ($pt in $cloud) { Set-Px $c $pt[0] $pt[1] $P['k'] }
    Set-Px $c 5 3 $P['l']; Set-Px $c 6 3 $P['l']; Set-Px $c 12 7 $P['l']
    Set-Px $c 9 2 $P['v']; Set-Px $c 13 3 $P['v']

    # radar echoes: arcs around the feed on the sky side, closing in while it works
    if ($Active) {
        $r1 = 2.0 + ((7 - $T) % 4) * 1.0
        foreach ($rad in @($r1, $r1 + 4.0)) {
            for ($y = 2; $y -le 10; $y++) { for ($x = 2; $x -le 14; $x++) {
                $dx = ($x + 0.5) - $DishFocus[0]; $dy = ($y + 0.5) - $DishFocus[1]
                $d = [Math]::Sqrt($dx * $dx + $dy * $dy)
                if ([Math]::Abs($d - $rad) -gt 0.5) { continue }
                $ang = [Math]::Atan2(-$dy, $dx) * 180 / [Math]::PI
                if ($ang -lt -20 -or $ang -gt 100) { continue }
                $tone = if ($rad -lt 4) { 'b' } else { 'c' }
                Set-Both $c $e $x $y $P[$tone]
            } }
        }
    }

    # the dish: an ellipse across the pointing direction. It is a bowl seen from the front: a bright rim, the inner wall
    # under the upper-left rim in its own shadow and the lower-right inner wall catching the light
    for ($y = 2; $y -le 11; $y++) { for ($x = 1; $x -le 12; $x++) {
        $dx = ($x + 0.5) - $DishC[0]; $dy = ($y + 0.5) - $DishC[1]
        $s = $dx * $DishV[0] + $dy * $DishV[1]
        $t = $dx * $DishU[0] + $dy * $DishU[1]
        $q = ($s * $s) / (4.3 * 4.3) + ($t * $t) / (1.9 * 1.9)
        if ($q -gt 1.0) { continue }
        if ($q -gt 0.6) {
            $tone = if ($s -lt -0.8) { 'W' } elseif ($s -lt 1.6) { 'X' } else { 'Z' }
        } else {
            $tone = if ($s -lt -1.0) { 'Z' } elseif ($s -lt 0.8) { 'Y' } else { 'X' }
        }
        Set-Px $c $x $y $P[$tone]
    } }
    # the strut from the middle of the dish to the feed at the focus, and the feed itself (blue)
    Set-Px $c 7 7 $P['E']; Set-Px $c 8 6 $P['D']; Set-Px $c 9 5 $P['C']
    if ($Active) { Set-Both $c $e 10 4 $P['a']; Set-Both $c $e 11 4 $P['c']; Set-Both $c $e 10 5 $P['c'] } else { Set-Px $c 10 4 $P['d']; Set-Px $c 11 4 $P['e']; Set-Px $c 10 5 $P['e'] }

    # pedestal down to the base
    Set-Px $c 6 10 $P['C']; Set-Px $c 7 10 $P['E']
    Set-Px $c 6 11 $P['D']; Set-Px $c 7 11 $P['F']
    Set-Px $c 5 12 $P['B']; Set-Px $c 6 12 $P['C']; Set-Px $c 7 12 $P['D']; Set-Px $c 8 12 $P['E']

    # oscilloscope (x9..14, y12..14) with the echo, and the state lamp (x2..3)
    for ($x = 9; $x -le 14; $x++) { Set-Px $c $x 12 $P['G'] }
    for ($y = 13; $y -le 14; $y++) { Set-Px $c 9 $y $P['G']; for ($x = 10; $x -le 14; $x++) { Set-Px $c $x $y $P['z'] } }
    if ($Active) {
        for ($x = 10; $x -le 14; $x++) { Set-Both $c $e $x 14 $P['y'] }
        $bx = 10 + ($T % 5)
        if ($bx -le 14) { Set-Both $c $e $bx 13 $P['u']; Set-Both $c $e $bx 14 $P['x'] }
        Set-Both $c $e 2 13 $P['M']; Set-Both $c $e 3 13 $P['N']; Set-Both $c $e 2 14 $P['O']; Set-Both $c $e 3 14 $P['P']
    } else {
        for ($x = 10; $x -le 14; $x++) { Set-Px $c $x 14 $P['z'] }
        Set-Px $c 2 13 $P['Q']; Set-Px $c 3 13 $P['R']; Set-Px $c 2 14 $P['R']; Set-Px $c 3 14 $P['S']
    }
    Sync-Emissive $c $e
    return @{ Color = $c; Emi = $e }
}

# ============================================================================================
#  CHARTS - parchment draft (Steam) -> printed map and tables (LV) -> radio plot (MV)
# ============================================================================================
$ChartPal = New-Pal ($SkySpec + ' ' + @'
P=F3E2B8 Q=E6CF9A R=CDB077 S=A88A55 K=4A3220 L=7A5A38
W=F7F7F2 X=E4E4DC Y=C9C9BE Z=A9B6C8 G=8E8E8E H=5A5A5A I=2C2C2C
a=E9ECF0 b=C4CAD3 c=8F99A8 d=3B4252
u=7CFFA0 x=3FD06A y=1F7A3E z=0E3A1E
T=FF4A3A U=B22A20
g=8FB7D6 h=4F7BA0 i=24384E j=101C2A
'@)

# a sheet with ragged parchment edges (draft) or straight printed edges, x2..13, y2..13
function New-Sheet {
    param([string]$Fill, [string]$Edge, [bool]$Ragged)
    $c = New-Canvas
    $P = $ChartPal
    for ($y = 2; $y -le 13; $y++) { for ($x = 2; $x -le 13; $x++) {
        if ($Ragged) {
            $n = Get-Noise $x $y 0 11
            $border = ($x -eq 2 -or $x -eq 13 -or $y -eq 2 -or $y -eq 13)
            if ($border -and $n -lt 70) { continue }
        }
        $tone = $Fill
        if ($x -ge 12 -or $y -ge 12) { $tone = $Edge }
        Set-Px $c $x $y $P[$tone]
    } }
    return $c
}

function New-DraftChart {
    $c = New-Sheet 'P' 'Q' $true
    $P = $ChartPal
    # stains and the curl of old paper
    foreach ($pt in @(@(3, 11), @(4, 12), @(11, 3), @(12, 4))) { Set-Px $c $pt[0] $pt[1] $P['R'] }
    Set-Px $c 13 13 $P['S']
    # the Moon in sepia ink: a hand-drawn circle, maria hatched in, two rayed craters
    for ($y = 3; $y -le 12; $y++) { for ($x = 3; $x -le 12; $x++) {
        $dx = ($x + 0.5) - 8.0; $dy = ($y + 0.5) - 8.0
        $r = [Math]::Sqrt($dx * $dx + $dy * $dy)
        if ([Math]::Abs($r - 4.1) -lt 0.55) { Set-Px $c $x $y $P['L'] }
        elseif ($r -lt 3.6) {
            # maria: hatched patches on the upper left and the middle
            $mare = (($dx + 1.2) * ($dx + 1.2) + ($dy + 1.0) * ($dy + 1.0) -lt 2.6) -or (($dx - 0.8) * ($dx - 0.8) + ($dy - 0.6) * ($dy - 0.6) -lt 1.3)
            if ($mare -and ((($x + $y) % 2) -eq 0)) { Set-Px $c $x $y $P['K'] }
        }
    } }
    Set-Px $c 9 10 $P['K']; Set-Px $c 10 11 $P['L']; Set-Px $c 6 11 $P['L']
    Add-Outline $c -LitArgb (Hex '8A6A3E') -ShadeArgb (Hex '4E3A1E')
    return $c
}

function New-PhotoPlate {
    $c = New-Canvas
    $P = $ChartPal
    # a glass plate seen slightly from above: pale glass edge, dark emulsion, a silver sheen across it
    for ($y = 3; $y -le 12; $y++) { for ($x = 3; $x -le 12; $x++) {
        $edge = ($x -eq 3 -or $x -eq 12 -or $y -eq 3 -or $y -eq 12)
        if ($edge) {
            $tone = if ($x -eq 3 -or $y -eq 3) { 'g' } else { 'h' }
        } else {
            $tone = if ((($x + $y) % 7) -eq 0) { 'h' } elseif ($x + $y -lt 12) { 'i' } else { 'j' }
        }
        Set-Px $c $x $y $P[$tone]
    } }
    # silver sheen: a diagonal band
    foreach ($pt in @(@(5, 9), @(6, 8), @(7, 7), @(8, 6), @(9, 5), @(6, 9), @(7, 8))) { Set-Px $c $pt[0] $pt[1] $P['b'] }
    Set-Px $c 8 7 $P['a']
    Add-Outline $c -LitArgb (Hex '3B5368') -ShadeArgb (Hex '182430')
    return $c
}

function New-LunarMap {
    $c = New-Sheet 'W' 'X' $false
    $P = $ChartPal
    # a printed grid (pale blue) and a thin printed frame
    for ($i = 3; $i -le 12; $i++) {
        foreach ($g in @(5, 10)) { Set-Px $c $g $i $P['Z']; Set-Px $c $i $g $P['Z'] }
    }
    for ($i = 3; $i -le 12; $i++) { Set-Px $c $i 3 $P['G']; Set-Px $c 3 $i $P['G'] }
    # the photographic Moon: lit half with grey maria and crater rims, the terminator, the night side
    for ($y = 4; $y -le 12; $y++) { for ($x = 4; $x -le 12; $x++) {
        $dx = ($x + 0.5) - 8.5; $dy = ($y + 0.5) - 8.5
        $r = [Math]::Sqrt($dx * $dx + $dy * $dy)
        if ($r -gt 3.9) { continue }
        if ($dx -gt 1.6) { Set-Px $c $x $y $P['H']; continue }
        $tone = 'Y'
        if ($dx -gt 0.6) { $tone = 'G' }
        $mare = (($dx + 1.3) * ($dx + 1.3) + ($dy + 1.1) * ($dy + 1.1) -lt 1.8) -or (($dx + 0.2) * ($dx + 0.2) + ($dy - 1.3) * ($dy - 1.3) -lt 1.1)
        if ($mare) { $tone = 'G' }
        if ($r -lt 0.8 -and $dx -lt 0) { $tone = 'X' }
        Set-Px $c $x $y $P[$tone]
    } }
    Set-Px $c 6 6 $P['W']; Set-Px $c 7 11 $P['H']
    Add-Outline $c -LitArgb (Hex '9A9A92') -ShadeArgb (Hex '4A4A44')
    return $c
}

function New-Ephemeris {
    $c = New-Sheet 'W' 'X' $false
    $P = $ChartPal
    # a dog-eared corner
    Set-Px $c 13 2 0; Set-Px $c 12 2 0; Set-Px $c 13 3 0; Set-Px $c 12 3 $P['Y']
    # header band and a Moon phase in the corner
    for ($x = 3; $x -le 9; $x++) { Set-Px $c $x 3 $P['d'] }
    Set-Px $c 11 4 $P['n']; Set-Px $c 11 5 $P['o']; Set-Px $c 10 4 $P['o']; Set-Px $c 10 5 $P['H']
    # rows of printed figures: dark ticks with gaps, two columns
    for ($y = 5; $y -le 12; $y += 2) {
        for ($x = 3; $x -le 12; $x++) {
            if ($x -eq 7) { continue }
            if ($y -eq 5 -and $x -ge 9) { continue }
            $n = Get-Noise $x $y 0 5
            $tone = if ($n -lt 150) { 'I' } elseif ($n -lt 215) { 'H' } else { $null }
            if ($null -ne $tone) { Set-Px $c $x $y $P[$tone] }
        }
    }
    for ($y = 5; $y -le 12; $y++) { Set-Px $c 7 $y $P['Y'] }
    Add-Outline $c -LitArgb (Hex '9A9A92') -ShadeArgb (Hex '4A4A44')
    return $c
}

function New-LandingChart {
    $c = New-Sheet 'a' 'b' $false
    $P = $ChartPal
    # the plot area: dark, with tick marks on its border like a plotter sheet
    for ($y = 3; $y -le 12; $y++) { for ($x = 3; $x -le 12; $x++) { Set-Px $c $x $y $P['z'] } }
    foreach ($t in @(5, 8, 11)) { Set-Px $c $t 2 $P['c']; Set-Px $c 2 $t $P['c'] }
    # radar contours: rings of terrain height around a flat sea, drawn in phosphor green
    for ($y = 3; $y -le 12; $y++) { for ($x = 3; $x -le 12; $x++) {
        $dx = ($x + 0.5) - 8.0; $dy = ($y + 0.5) - 7.6
        $wob = 0.45 * [Math]::Sin(($x * 1.7) + ($y * 0.9))
        $r = [Math]::Sqrt($dx * $dx * 0.8 + $dy * $dy) + $wob
        if ([Math]::Abs($r - 4.2) -lt 0.45) { Set-Px $c $x $y $P['x'] }
        elseif ([Math]::Abs($r - 2.6) -lt 0.4) { Set-Px $c $x $y $P['y'] }
    } }
    # boulder echoes (bright dots) outside the flat ground
    foreach ($pt in @(@(4, 4), @(11, 5), @(4, 11), @(11, 11), @(10, 3))) { Set-Px $c $pt[0] $pt[1] $P['u'] }
    # the landing ellipse in red at the centre of the flat sea
    foreach ($pt in @(@(7, 7), @(8, 7), @(9, 8), @(8, 9), @(7, 9), @(6, 8))) { Set-Px $c $pt[0] $pt[1] $P['T'] }
    Set-Px $c 7 8 $P['U']; Set-Px $c 8 8 $P['U']
    Add-Outline $c -LitArgb (Hex '6E7888') -ShadeArgb (Hex '2C3340')
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

if (Test-Want 'steam') { Out-Overlay 'block/multiblock/steam_observatory' ${function:New-SteamObsFrame} 4 }
if (Test-Want 'optical') { Out-Overlay 'block/multiblock/optical_observatory' ${function:New-OpticalObsFrame} 4 }
if (Test-Want 'radio') { Out-Overlay 'block/multiblock/radio_telescope' ${function:New-RadioFrame} 3 }
if (Test-Want 'charts') {
    Out-Tex (New-DraftChart) 'item/lunar_chart_draft.png'
    Out-Tex (New-PhotoPlate) 'item/photographic_plate.png'
    Out-Tex (New-LunarMap) 'item/lunar_map.png'
    Out-Tex (New-Ephemeris) 'item/lunar_ephemeris.png'
    Out-Tex (New-LandingChart) 'item/lunar_landing_chart.png'
}

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
        Write-Host ("| ``pack/kubejs/assets/grindless/textures/$rel`` | Generada con tools/assets/$ScriptName (pixel art procedural, original) por el agente del observatorio, 2026-10-24 | la del pack (pendiente; propuesta CC BY-SA 4.0) |")
    }
}
