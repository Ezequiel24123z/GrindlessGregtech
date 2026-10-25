<#
.SYNOPSIS
  Procedural 16x16 pixel art for the LV era of Gregtech Grindless (GregTech style: bevels, top-left light, selective outlines).

.DESCRIPTION
  Every pixel is drawn by this script (palettes + char maps + small shading routines); nothing is copied or edited
  from GregTech Modern or any other mod. Output is deterministic: re-running overwrites the same bytes.

  Writes (under pack/kubejs/assets/grindless/textures/):
    block/multiblock/lv_vein_drill/overlay_front.png, overlay_front_active.png(+.mcmeta), overlay_front_active_emissive.png(+.mcmeta)
    block/multiblock/lv_greenhouse/...                 (same three)
    block/multiblock/submerged_arc_furnace/...         (same three)
    block/machines/creature_simulator/...              (same three; single-block machine, sits on the GTM tiered hull)
    item/graphite_electrode.png
    item/blank_creature_model.png
    item/creature_model_base.png (layer0, untinted) + item/creature_model_core.png (layer1, grayscale, tinted per mob)

  Run from the repo root (PowerShell 5.1 blocks unsigned scripts by default; this bypass only affects that process):
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-LVTextures.ps1
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-LVTextures.ps1 -Only drill,models

  Overlay conventions (same as GregTech Modern's workable casings and as the steam set): transparent background,
  details only on the overlay, animated variants are vertical 16x(16*n) strips with a .png.mcmeta, *_emissive layers
  hold only the pixels that glow (identical to the colour layer). Every pixel is fully opaque or fully transparent.

  Context the overlays were drawn for (not shipped, see Build-LVPreview.ps1):
    lv_vein_drill, lv_greenhouse  ->  gtceu:block/casings/solid/machine_casing_solid_steel
    submerged_arc_furnace         ->  gtceu:block/casings/solid/machine_casing_heatproof
    creature_simulator            ->  gtceu:block/casings/voltage/lv/side (the LV machine hull)

.PARAMETER Only
  Subset of: drill, greenhouse, arc, simulator, electrode, models. Default: everything.
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
    $p = Join-Path $OutRoot ($Rel -replace '/', '\')
    # an editor, indexer or virus scanner can hold a file for a moment: retry the write a few times
    for ($try = 1; $try -le 6; $try++) {
        try { Save-Png $Canvas $p; if ($FrameTime -gt 0) { Save-Mcmeta ($p + '.mcmeta') $FrameTime }; break }
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

# Neutral steel ramp shared by every LV overlay (lit -> dark). GTM's own overlays use neutral greys over its warm casings,
# so the same neutral ramp (not a blue-tinted steel) keeps these faces in the same family.
$SteelSpec = 'A=D3D3D3 B=B0B0B0 C=8E8E8E D=707070 E=565656 F=404040 G=2F2F2F H=222222 I=161616 J=0D0D0D'

# ============================================================================================
#  LV VEIN DRILL - controller face (steel casing)
#  derrick window: electric top-drive motor, drill string and a steel bit biting into ore rock;
#  hazard tape + status lamp along the base
# ============================================================================================
$DrillExtra = @'
Y=F7C61B y=FFE456 u=B98608 k=1B1810
P=FFC983 Q=E98B3C R=B25F24 S=6E3716 p=FFE6C0
r=FF5A48 s=B52D22 t=5E1511
g=E2FFE4 h=62FF86 i=22C257 j=0C6B2E
v=B8F0FF w=47B8F2 x=1D6DB4
n=7A766D m=5E5B54 l=46443F o=9A958A
'@
$DrillPal = New-Palette ($SteelSpec + ' ' + $DrillExtra)

$DrillBase = @(
    '................',
    '.CDDDDDDDDDDDDE.',
    '.DGGGGGGGGGGGGF.',
    '.DGHIIIIIIIIIDF.',
    '.DGHIIIIIIIIIDF.',
    '.DGHIIIIIIIIIDF.',
    '.DGHIIIIIIIIIDF.',
    '.DGHIIIIIIIIIDF.',
    '.DGHIIIIIIIIIDF.',
    '.DGHIIIIIIIIIDF.',
    '.DGHIIIIIIIIIDF.',
    '.DDDDDDDDDDDDDF.',
    '.DGGGGGGGGGGGGF.',
    '.DGGGGGGGGGGGGF.',
    '.EFFFFFFFFFFFFG.',
    '................'
)
Assert-Map 'DrillBase' $DrillBase

# Top-drive motor (x5..11, y3..5): steel end bells around three copper windings with dark gaps.
$DrillMotor = @(
    'CPSPSPD',
    'DQSQSQE',
    'ERSRSRF'
)
# Bit (y7..9), axis x = 8: first column and width per row; tone index per pixel into A..F (spec, light, mid, dark, darker, darkest).
$DrillBitRows = @(@(6, 5), @(7, 3), @(8, 1))
$DrillBitTone = @(@(1, 2, 2, 3, 4), @(1, 2, 4), @(3))
# Glint that runs over the windings while the motor turns (x, y per frame).
$DrillGlint = @(@(6, 3), @(6, 4), @(6, 5), @(10, 5), @(10, 4), @(10, 3), @(6, 4), @(10, 4))

function Draw-DrillWindow {
    param($C, $P, [bool]$Active, [int]$T)
    # faint derrick rails along the inner walls
    foreach ($y in 3..8) { Set-Px $C 4 $y $P['G']; Set-Px $C 12 $y $P['G'] }
    # top-drive motor and the string it turns
    Write-Map $C 5 3 $DrillMotor $P
    Set-Px $C 7 6 $P['B']; Set-Px $C 8 6 $P['C']; Set-Px $C 9 6 $P['E']
    # bit: lit left edge; a bright glint walks around the cone while it turns
    $phase = if ($Active) { $T % 4 } else { 0 }
    $ramp = 'ABCDEF'
    for ($r = 0; $r -lt 3; $r++) {
        for ($i = 0; $i -lt $DrillBitRows[$r][1]; $i++) {
            Set-Px $C ($DrillBitRows[$r][0] + $i) (7 + $r) $P[[string]$ramp[$DrillBitTone[$r][$i]]]
        }
    }
    Set-Px $C (6 + $phase) 7 $P['A']
    Set-Px $C (7 + (($phase + 1) % 3)) 8 $P['B']
    # ore rock: mounds at y9 either side of the tip, floor at y10
    $rock = @(
        @(4, 9, 'o'), @(5, 9, 'n'), @(6, 9, 'm'), @(7, 9, 'H'), @(9, 9, 'H'), @(10, 9, 'n'), @(11, 9, 'm'), @(12, 9, 'l'),
        @(4, 10, 'n'), @(5, 10, 'Q'), @(6, 10, 'm'), @(7, 10, 'l'), @(8, 10, 'G'), @(9, 10, 'l'), @(10, 10, 'm'), @(11, 10, 'v'), @(12, 10, 'l')
    )
    foreach ($px in $rock) { Set-Px $C $px[0] $px[1] $P[[string]$px[2]] }
}

function New-DrillFrame {
    param([bool]$Active, [int]$T = 0)
    $c = New-Canvas; $e = New-Canvas
    $P = $DrillPal
    Write-Map $c 0 0 $DrillBase $P

    # hazard tape along the base (x2..8, y12..13): diagonal bands, bevelled top to bottom
    for ($y = 12; $y -le 13; $y++) {
        for ($x = 2; $x -le 8; $x++) {
            $ch = if ((($x + $y) % 4) -lt 2) { @('Y', 'u')[$y - 12] } else { 'k' }
            Set-Px $c $x $y $P[$ch]
        }
        Set-Px $c 9 $y $P['G']
    }

    # status lamp (x10..13, y12..13): red idle, green + emissive when working
    if ($Active) {
        $core = if (($T % 4) -lt 2) { 'g' } else { 'h' }
        $lens = @("${core}hhi", 'iijj')
        for ($j = 0; $j -lt 2; $j++) { for ($i = 0; $i -lt 4; $i++) {
            Set-Both $c $e (10 + $i) (12 + $j) $P[[string]$lens[$j][$i]]
        } }
    } else {
        $lens = @('rrss', 'sstt')
        for ($j = 0; $j -lt 2; $j++) { for ($i = 0; $i -lt 4; $i++) { Set-Px $c (10 + $i) (12 + $j) $P[[string]$lens[$j][$i]] } }
    }

    Draw-DrillWindow $c $P $Active $T

    if ($Active) {
        # glint over the windings and a stray arc at the motor terminals
        $gl = $DrillGlint[$T % 8]
        Set-Px $c $gl[0] $gl[1] $P['p']
        if (($T % 4) -eq 1) { Set-Both $c $e 11 3 $P['v'] }
        if (($T % 4) -eq 3) { Set-Both $c $e 5 5 $P['w'] }
        # contact point glows with friction and throws sparks over the rock (emissive)
        Set-Both $c $e 8 10 $P[$(if (($T % 2) -eq 0) { 'y' } else { 'Y' })]
        Set-Both $c $e 8 9 $P[$(if (($T % 2) -eq 0) { 'Y' } else { 'y' })]
        $sparks = @(
            @(@(6, 9, 'y'), @(10, 8, 'Y')),
            @(@(10, 9, 'y'), @(6, 8, 'Y')),
            @(@(7, 9, 'Y'), @(9, 9, 'y')),
            @(@(5, 8, 'y'), @(11, 8, 'y'))
        )
        foreach ($sp in $sparks[$T % 4]) { Set-Both $c $e $sp[0] $sp[1] $P[[string]$sp[2]] }
    }
    Sync-Emissive $c $e
    return @{ Color = $c; Emi = $e }
}

# ============================================================================================
#  LV GREENHOUSE - controller face (steel casing)
#  steel-framed glass pane: grow-lamp bar on top, sapling / flower / mushroom / vine over a soil bed
# ============================================================================================
$GhExtra = @'
a=1B2530 b=1A2C38 c=183644 d=17404F e=164A5A
Y=F7C61B k=1B1810
K=4F3590 L=45418F M=3A4F8F N=33618A O=2E7285
f=C8F26A g=7DCB3A h=45A030 i=2A7428 j=17481F
p=FFA3C0 q=E8455F r=9C2440 y=FFE066 z=E8A92B
m=E24A3B n=A82A24 W=F6EBDD X=CDBA98
s=8A5A2E t=6A4220 u=4A2C14 o=7A5230
Q=FFF2FB R=FF8FE0 S=C84AB0 T=7A2F6E U=4A3A50
V=8668D0 Z=6A52B2
1=E2FFE4 2=62FF86 3=22C257 4=0C6B2E
5=FF5A48 6=B52D22 7=5E1511
8=EEFFD6 9=B6FF84
'@
$GhPal = New-Palette ($SteelSpec + ' ' + $GhExtra)

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

# Plant pixels (x, y, colour, swings with the sway: 1 = leans, 0 = planted).
$GhSapling = @(@(4, 6, 'f', 1), @(3, 7, 'g', 1), @(4, 7, 'f', 1), @(5, 7, 'h', 1), @(3, 8, 'h', 0), @(4, 8, 'g', 0), @(5, 8, 'i', 0), @(4, 9, 'o', 0))
$GhFlower = @(@(7, 6, 'p', 1), @(8, 6, 'p', 1), @(6, 7, 'q', 1), @(7, 7, 'y', 1), @(8, 7, 'q', 1), @(7, 8, 'h', 0), @(6, 9, 'g', 0), @(7, 9, 'i', 0), @(8, 9, 'g', 0))
$GhMushroom = @(@(10, 7, 'm', 0), @(9, 8, 'm', 0), @(10, 8, 'W', 0), @(11, 8, 'n', 0), @(10, 9, 'X', 0))
$GhVine = @(@(12, 5, 'h', 0), @(12, 6, 'g', 0), @(11, 6, 'h', 0), @(12, 7, 'h', 0), @(12, 8, 'g', 0), @(12, 9, 'i', 0))

function New-GreenhouseFrame {
    param([bool]$Active, [int]$T = 0)
    $c = New-Canvas; $e = New-Canvas
    $P = $GhPal
    Write-Map $c 0 0 $GhBase $P

    # glass interior x3..12, y5..9: unlit (cold teal) or flooded with the grow lamp's violet light
    $bgIdle = @('a', 'b', 'c', 'd', 'e'); $bgOn = @('K', 'L', 'M', 'N', 'O')
    for ($y = 5; $y -le 9; $y++) { for ($x = 3; $x -le 12; $x++) {
        Set-Px $c $x $y $P[$(if ($Active) { $bgOn[$y - 5] } else { $bgIdle[$y - 5] })]
    } }

    # lamp housing (y3) and LED bar (y4)
    foreach ($x in 3..12) { Set-Px $c $x 3 $P[@('C', 'D', 'D', 'D', 'D', 'D', 'D', 'D', 'D', 'E')[$x - 3]] }
    Set-Px $c 3 4 $P['E']; Set-Px $c 12 4 $P['F']
    $chips = @(4, 6, 9, 11)
    for ($x = 4; $x -le 11; $x++) {
        if ($Active) {
            $isChip = $chips -contains $x
            $bright = if (($T % 2) -eq 0) { @(4, 9) -contains $x } else { @(6, 11) -contains $x }
            $col = if ($isChip -and $bright) { 'Q' } elseif ($isChip) { 'R' } else { 'S' }
            Set-Both $c $e $x 4 $P[$col]
        } else {
            Set-Px $c $x 4 $P[$(if ($chips -contains $x) { 'U' } else { 'F' })]
        }
    }
    # soil bed y10..11
    $soil = @('sotsssotso', 'tutttutttu')
    for ($j = 0; $j -lt 2; $j++) { for ($i = 0; $i -lt 10; $i++) { Set-Px $c (3 + $i) (10 + $j) $P[[string]$soil[$j][$i]] } }

    # plants: unlit they sit a little darker; sway pushes the upper rows one pixel sideways in the working loop
    $sw = @(0, 1, 1, 1, 0, -1, -1, -1)
    $o = 0; if ($Active) { $o = $sw[$T % 8] }
    foreach ($plant in @($GhSapling, $GhFlower, $GhMushroom, $GhVine)) {
        foreach ($px in $plant) {
            $col = $P[[string]$px[2]]
            if (-not $Active) { $col = Shade $col 0.78 }
            Set-Px $c ($px[0] + $px[3] * $o) $px[1] $col
        }
    }

    # glass glints on the left edge of the pane
    Set-Px $c 3 5 $P['B']; Set-Px $c 3 6 $P['C']

    if ($Active) {
        # light cone under the chips (shimmering), only where bare glass shows
        foreach ($cx in $chips) {
            if ((Get-Px $c $cx 5) -eq $P['K']) { Set-Both $c $e $cx 5 $P['V'] }
            if ((($cx + $T) % 3) -eq 0 -and (Get-Px $c $cx 6) -eq $P['L']) { Set-Both $c $e $cx 6 $P['Z'] }
        }
        # growth sparkles over the plants (emissive)
        $sp = @(
            @(@(4, 5), @(10, 6)), @(,@(7, 5)), @(@(5, 6), @(11, 5)), @(@(8, 5), @(3, 7)),
            @(@(4, 5), @(9, 6)), @(,@(7, 5)), @(@(5, 6), @(10, 5)), @(@(8, 5), @(3, 6))
        )
        foreach ($s in $sp[$T % 8]) { Set-Both $c $e $s[0] $s[1] $P['8'] }
        # plant tips catch the light
        Set-Both $c $e (4 + $o) 6 $P['f']
        Set-Both $c $e (7 + $o) 6 $P['p']; Set-Both $c $e (8 + $o) 6 $P['p']
    }

    # base plate: hazard dashes + status LEDs
    foreach ($x in 3..8) { Set-Px $c $x 13 $P[$(if (($x % 4) -lt 2) { 'Y' } else { 'k' })] }
    if ($Active) {
        Set-Both $c $e 11 13 $P['2']; Set-Both $c $e 12 13 $P['3']
        # the lamp's light spills over the top of the glass: those bare-glass pixels glow in the dark
        for ($y = 5; $y -le 6; $y++) { for ($x = 3; $x -le 12; $x++) {
            $px = Get-Px $c $x $y
            if ($px -eq $P['K'] -or $px -eq $P['L']) { Set-Px $e $x $y $px }
        } }
    }
    else { Set-Px $c 11 13 $P['6']; Set-Px $c 12 13 $P['7'] }
    Sync-Emissive $c $e
    return @{ Color = $c; Emi = $e }
}

# ============================================================================================
#  SUBMERGED ARC FURNACE - controller face (heat-proof casing)
#  copper bus bar, three graphite electrodes in steel clamps, dipping into a glowing bath
# ============================================================================================
$SafExtra = @'
P=FFC983 Q=E98B3C R=B25F24 S=6E3716
a=6E7686 b=4A505C c=2F333C d=1E2128
1=FFF7C2 2=FFE066 3=FFB02E 4=F07A12 5=C4470C 6=8A2A0A 7=4A1608 8=2A100A
9=E8F6FF w=8FD0FF x=3C8EE0
e=7A2A10 f=A8400F
g=E2FFE4 h=62FF86 i=22C257 j=0C6B2E
r=FF5A48 s=B52D22 t=5E1511
'@
$SafPal = New-Palette ($SteelSpec + ' ' + $SafExtra)

$SafBase = @(
    '................',
    '.CDDDDDDDDDDDDE.',
    '.DGGGGGGGGGGGGF.',
    '.DGIIIIIIIIIIDF.',
    '.DGIIIIIIIIIIDF.',
    '.DGIIIIIIIIIIDF.',
    '.DGIIIIIIIIIIDF.',
    '.DGIIIIIIIIIIDF.',
    '.DGIIIIIIIIIIDF.',
    '.DGIIIIIIIIIIDF.',
    '.DGIIIIIIIIIIDF.',
    '.DGIIIIIIIIIIDF.',
    '.DDDDDDDDDDDDDF.',
    '.DGGGGGGGGGGGGF.',
    '.EFFFFFFFFFFFFG.',
    '................'
)
Assert-Map 'SafBase' $SafBase

$SafElectrodeX = @(4, 7, 10)   # left column of each 2 px wide electrode

function New-ArcFrame {
    param([bool]$Active, [int]$T = 0)
    $c = New-Canvas; $e = New-Canvas
    $P = $SafPal
    Write-Map $c 0 0 $SafBase $P

    # copper bus bar (y3) feeding three steel clamps (y4)
    foreach ($x in 3..12) { Set-Px $c $x 3 $P[$(if ($x -le 4) { 'Q' } elseif ($x -ge 12) { 'S' } else { 'R' })] }

    # bath y9..11 (x3..12): molten and flickering when working, a dark crust with a few embers when cold
    $ramp = @('1', '2', '3', '4', '5', '6')
    for ($y = 9; $y -le 11; $y++) {
        for ($x = 3; $x -le 12; $x++) {
            $n = Get-Noise $x $y $T 3
            if ($Active) {
                $idx = $y - 9 + 2
                if ($n -lt 70) { $idx += 1 } elseif ($n -gt 200) { $idx -= 1 }
                if ($n -gt 250) { $idx = 0 }
                if ($x -eq 3 -or $x -eq 12) { Set-Px $c $x $y $P['7'] } else { Set-Both $c $e $x $y $P[$ramp[(Get-ClampInt $idx 0 5)]] }
            } else {
                $col = if ($n -gt 238) { 'f' } elseif ($n -gt 216) { 'e' } elseif ($y -eq 9) { '7' } else { '8' }
                Set-Px $c $x $y $P[$col]
            }
        }
    }

    # clamps, graphite electrodes (y5..8, left light / right dark) and what the arc does to them
    $live = $SafElectrodeX[$T % 3]
    foreach ($ex in $SafElectrodeX) {
        Set-Px $c $ex 4 $P['C']; Set-Px $c ($ex + 1) 4 $P['E']
        for ($y = 5; $y -le 7; $y++) { Set-Px $c $ex $y $P['b']; Set-Px $c ($ex + 1) $y $P['c'] }
        Set-Px $c $ex 5 $P['a']
        if ($Active) {
            Set-Px $c ($ex + 1) 7 $P['6']
            $hot = ($ex -eq $live)
            Set-Both $c $e $ex 8 $P[$(if ($hot) { '1' } else { '3' })]
            Set-Both $c $e ($ex + 1) 8 $P[$(if ($hot) { '2' } else { '5' })]
            # arc between tip and bath: the live electrode crackles white-blue, the others only glow
            if ($hot) {
                Set-Both $c $e $ex 9 $P['9']; Set-Both $c $e ($ex + 1) 9 $P['9']
                $side = if ($ex -eq 4) { 6 } elseif ($ex -eq 10) { 9 } elseif (($T % 2) -eq 0) { 6 } else { 9 }
                Set-Both $c $e $side 9 $P['w']
                Set-Both $c $e ($ex + ($T % 2)) 10 $P['1']
            } else {
                Set-Both $c $e $ex 9 $P['2']; Set-Both $c $e ($ex + 1) 9 $P['3']
            }
        } else {
            Set-Px $c $ex 8 $P['c']; Set-Px $c ($ex + 1) 8 $P['d']
        }
    }
    # a stray spark rising from the bath
    if ($Active) {
        $sx = 3 + (($T * 5) % 10)
        if (-not ($SafElectrodeX | Where-Object { $sx -eq $_ -or $sx -eq ($_ + 1) })) { Set-Both $c $e $sx 8 $P['2'] }
    }

    # base plate: vent slits and the status LED
    foreach ($x in @(3, 5, 7, 9)) { Set-Px $c $x 13 $P['I'] }
    if ($Active) { Set-Both $c $e 12 13 $P['h'] } else { Set-Px $c 12 13 $P['s'] }
    Sync-Emissive $c $e
    return @{ Color = $c; Emi = $e }
}

# ============================================================================================
#  CREATURE SIMULATOR - single-block machine front (sits on the LV hull)
#  scan screen with a blocky mob hologram, VU meter on the right, pad, status LED and a card slot
# ============================================================================================
$SimExtra = @'
a=DFFBFF b=8FEAFF c=4FC6EE d=2793C4 e=186A94 f=0E4562 g=0A2C40
1=78D6F0 2=3FB4DE 3=2385B4
k=E6FFFF
r=FF5A48 s=B52D22 t=5E1511
l=E2FFE4 m=62FF86 n=22C257 o=0C6B2E
'@
$SimPal = New-Palette ($SteelSpec + ' ' + $SimExtra)

$SimBase = @(
    '................',
    '................',
    '..CDDDDDDDDDDF..',
    '..DHHHHHHHHHHF..',
    '..DHIIIIIIIIIF..',
    '..DHIIIIIIIIIF..',
    '..DHIIIIIIIIIF..',
    '..DHIIIIIIIIIF..',
    '..DHIIIIIIIIIF..',
    '..DHIIIIIIIIIF..',
    '..DHIIIIIIIIIF..',
    '..DEEEEEEEEEEF..',
    '..DGGGGGGGGGGF..',
    '..EFFFFFFFFFFG..',
    '................',
    '................'
)
Assert-Map 'SimBase' $SimBase

# 7x7 blocky mob: H head, o eye holes, T torso, A arms, L legs
$MobRows = @(
    '.HHHHH.',
    '.HoHoH.',
    '.HHHHH.',
    'ATTTTTA',
    'ATTTTTA',
    '.LL.LL.',
    '.LL.LL.'
)

function New-SimFrame {
    param([bool]$Active, [int]$T = 0)
    $c = New-Canvas; $e = New-Canvas
    $P = $SimPal
    Write-Map $c 0 0 $SimBase $P

    $scanY = 3 + ($T % 8)
    for ($j = 0; $j -lt 7; $j++) {
        $y = 4 + $j
        for ($i = 0; $i -lt 7; $i++) {
            $ch = [string]$MobRows[$j][$i]
            if ($ch -eq '.' -or $ch -eq 'o') { continue }
            $x = 4 + $i
            if ($Active) {
                $tone = switch ($ch) { 'H' { 'b' } 'T' { 'c' } 'A' { 'c' } default { 'd' } }
                if (($y % 2) -eq 1) { $tone = switch ($tone) { 'b' { '1' } 'c' { '2' } default { '3' } } }
                if ($y -eq $scanY) { $tone = 'a' }
                Set-Both $c $e $x $y $P[$tone]
            } else {
                Set-Px $c $x $y $P[$(if ($ch -eq 'H') { 'f' } else { 'g' })]
            }
        }
    }

    if ($Active) {
        # scan beam across the whole screen with a faint trail above it
        for ($x = 3; $x -le 11; $x++) {
            $cur = Get-Px $c $x $scanY
            if ($cur -eq $P['I'] -or $cur -eq $P['H']) { Set-Both $c $e $x $scanY $P['k'] }
            if ($scanY -gt 3) {
                $above = Get-Px $c $x ($scanY - 1)
                if ($above -eq $P['I']) { Set-Both $c $e $x ($scanY - 1) $P['f'] }
            }
        }
        # segmented VU meter (x12): four slots, 1-4 of them lit from the bottom, level changes every frame
        $level = 1 + ((Get-Noise 1 1 $T 9) % 4)
        for ($k = 0; $k -lt 4; $k++) {
            $y = 10 - 2 * $k
            if ($k -lt $level) { Set-Both $c $e 12 $y $P[@('c', 'c', 'b', 'a')[$k]] } else { Set-Px $c 12 $y $P['f'] }
        }
        # emitter pad lit
        foreach ($x in 5..10) { Set-Both $c $e $x 11 $P['c'] }
        Set-Both $c $e 7 11 $P['a']; Set-Both $c $e 8 11 $P['a']
        # LED
        Set-Both $c $e 3 12 $P['m']
    } else {
        foreach ($k in 0..3) { Set-Px $c 12 (10 - 2 * $k) $P['g'] }
        foreach ($x in 5..10) { Set-Px $c $x 11 $P['D'] }
        Set-Px $c 3 12 $P['s']
    }
    # buttons and card slot on the control strip
    Set-Px $c 5 12 $P['C']; Set-Px $c 6 12 $P['D']
    foreach ($x in 8..12) { Set-Px $c $x 12 $P['I'] }
    Sync-Emissive $c $e
    return @{ Color = $c; Emi = $e }
}

# ============================================================================================
#  ITEMS
# ============================================================================================
# --- graphite electrode: diagonal rod (lower-left -> upper-right), a 4 px band per row lit from the top-left, threaded nipple ----
# ramp: 0 gloss, 1 light, 2 mid, 3 dark, 4 darkest
$RampGraphite = @((Hex 'C2C9D6'), (Hex '737B8B'), (Hex '4F5562'), (Hex '353944'), (Hex '23262E'))

function New-GraphiteElectrode {
    $c = New-Canvas
    $R = $RampGraphite
    # body rows y4..12: x_left = 14 - y, so every row shifts one pixel and the tones run along the axis
    for ($y = 4; $y -le 12; $y++) {
        $xl = 14 - $y
        $tones = if ($y -ge 5 -and $y -le 9) { @(1, 0, 3, 4) } elseif ($y -eq 11) { @(1, 0, 3, 4) } else { @(1, 2, 3, 4) }
        for ($i = 0; $i -lt 4; $i++) { Set-Px $c ($xl + $i) $y $R[$tones[$i]] }
    }
    # flat end face (y13) and shoulder ring (y3)
    foreach ($i in 0..3) { Set-Px $c (1 + $i) 13 $R[@(2, 3, 4, 4)[$i]] }
    foreach ($i in 0..3) { Set-Px $c (11 + $i) 3 $R[@(0, 1, 2, 3)[$i]] }
    # threaded nipple (3 px): groove then ridge
    foreach ($i in 0..2) { Set-Px $c (12 + $i) 2 $R[@(3, 4, 4)[$i]] }
    foreach ($i in 0..2) { Set-Px $c (13 + $i) 1 $R[@(1, 2, 3)[$i]] }
    Add-Outline $c -LitArgb (Hex '1E2128') -ShadeArgb (Hex '0D0E12')
    return $c
}

# --- creature model chip: untinted frame (layer0) + grayscale mob core (layer1, tinted per creature) --------------------
$ModelPal = New-Palette 'A=E4E8EE B=B9C0CB C=8D95A3 D=667080 E=48505E F=323945 G=22272F H=15181D W=F0F2F5 X=C9CDD4 Y=9AA0AA Z=6F7580 M=E6B84A N=B98B2A O=7A5718 R=FF5A48 S=B52D22 T=5E1511 d=10161C c=1A222B b=26313C'

# Card body x3..13, y1..12; screen interior x4..12, y2..10; contacts y13..14. $Blank = ghost silhouette + red LED.
function New-ModelBase {
    param([bool]$Blank = $false)
    $c = New-Canvas
    $P = $ModelPal
    # body: thin bevelled frame (lit top/left, shaded bottom/right)
    for ($y = 1; $y -le 12; $y++) {
        for ($x = 3; $x -le 13; $x++) {
            $tone = 'D'
            if ($y -eq 1 -or $x -eq 3) { $tone = 'C' } elseif ($y -eq 12 -or $x -eq 13) { $tone = 'F' }
            Set-Px $c $x $y $P[$tone]
        }
    }
    # chamfered top-right corner
    Set-Px $c 13 1 0; Set-Px $c 12 1 0; Set-Px $c 13 2 0
    # screen (recessed): dark glass, shadowed top/left edge, soft reflection
    for ($y = 2; $y -le 10; $y++) { for ($x = 4; $x -le 12; $x++) {
        if ($x -eq 12 -and $y -le 2) { continue }
        Set-Px $c $x $y $P[$(if ($y -eq 2 -or $x -eq 4) { 'd' } else { 'c' })]
    } }
    foreach ($px in @(@(5, 3), @(6, 3), @(5, 4))) { Set-Px $c $px[0] $px[1] $P['b'] }
    # projector line the mob stands on
    foreach ($x in 5..11) { Set-Px $c $x 10 $P['E'] }
    # bottom frame: LED socket and a label slot
    Set-Px $c 4 11 $P[$(if ($Blank) { 'S' } else { 'G' })]
    foreach ($x in 7..12) { Set-Px $c $x 11 $P['E'] }
    # gold contacts
    foreach ($x in @(5, 7, 9, 11)) { Set-Px $c $x 13 $P['M']; Set-Px $c $x 14 $P['N'] }
    Add-Outline $c -LitArgb (Hex '1E232B') -ShadeArgb (Hex '0D1015')
    if ($Blank) {
        # ghost of the mob: every other pixel of the silhouette, waiting for data
        for ($j = 0; $j -lt 7; $j++) { for ($i = 0; $i -lt 7; $i++) {
            $ch = [string]$MobRows[$j][$i]
            if ($ch -ne '.' -and $ch -ne 'o' -and ((($i + $j) % 2) -eq 0)) { Set-Px $c (5 + $i) (3 + $j) $P['D'] }
        } }
    }
    return $c
}

function New-ModelCore {
    $c = New-Canvas
    $gray = @{ H = (Hex 'F4F4F4'); T = (Hex 'D2D2D2'); A = (Hex 'B4B4B4'); L = (Hex '969696') }
    for ($j = 0; $j -lt 7; $j++) {
        $y = 3 + $j
        for ($i = 0; $i -lt 7; $i++) {
            $ch = [string]$MobRows[$j][$i]
            if ($ch -eq '.' -or $ch -eq 'o') { continue }
            $v = $gray[$ch]
            if (($y % 2) -eq 0) { $v = Shade $v 0.88 }
            Set-Px $c (5 + $i) $y $v
        }
    }
    # status LED lit
    Set-Px $c 4 11 (Hex 'FFFFFF')
    return $c
}

# ============================================================================================
#  BUILD
# ============================================================================================
function Out-Overlay {
    param([string]$Dir, $Builder, [int]$FrameTime)
    $frames = @(); $emis = @()
    for ($t = 0; $t -lt 8; $t++) { $f = & $Builder $true $t; $frames += $f.Color; $emis += $f.Emi }
    $idle = & $Builder $false 0
    Out-Tex $idle.Color "$Dir/overlay_front.png"
    Out-Tex (Join-Frames $frames) "$Dir/overlay_front_active.png" $FrameTime
    Out-Tex (Join-Frames $emis) "$Dir/overlay_front_active_emissive.png" $FrameTime
}

if (Test-Want 'drill') { Out-Overlay 'block/multiblock/lv_vein_drill' ${function:New-DrillFrame} 2 }
if (Test-Want 'greenhouse') { Out-Overlay 'block/multiblock/lv_greenhouse' ${function:New-GreenhouseFrame} 4 }
if (Test-Want 'arc') { Out-Overlay 'block/multiblock/submerged_arc_furnace' ${function:New-ArcFrame} 3 }
if (Test-Want 'simulator') { Out-Overlay 'block/machines/creature_simulator' ${function:New-SimFrame} 3 }
if (Test-Want 'electrode') { Out-Tex (New-GraphiteElectrode) 'item/graphite_electrode.png' }
if (Test-Want 'models') {
    Out-Tex (New-ModelBase $true) 'item/blank_creature_model.png'
    Out-Tex (New-ModelBase $false) 'item/creature_model_base.png'
    Out-Tex (New-ModelCore) 'item/creature_model_core.png'
}

# ============================================================================================
#  VERIFY what was written (size, binary alpha, no pure black, grayscale core, mcmeta vs frames, emissive subset)
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
    if ($rel -like '*creature_model_core.png' -and -not $gray) { $msgs += 'core is not grayscale' }
    if (Test-Path -LiteralPath ($path + '.mcmeta')) {
        $n = [int]($img.H / 16)
        if ($n -lt 4 -or $n -gt 8) { $msgs += "animation has $n frames (expected 4-8)" }
    }
    # block overlays keep the casing's outer ring of pixels visible
    if ($rel -like 'block/*') {
        $ring = if ($rel -like 'block/machines/*') { 2 } else { 1 }
        $nf = [int]($img.H / 16)
        for ($f = 0; $f -lt $nf; $f++) { for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
            if ($x -lt $ring -or $y -lt $ring -or $x -ge (16 - $ring) -or $y -ge (16 - $ring)) {
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
    # the tinted core may only draw where the frame has pixels
    if ($rel -like '*creature_model_core.png') {
        $basePath = Join-Path $OutRoot 'item\creature_model_base.png'
        if (Test-Path -LiteralPath $basePath) {
            $base = Read-Png $basePath
            for ($i = 0; $i -lt $img.P.Length; $i++) {
                if ((($img.P[$i] -shr 24) -band 255) -ne 0 -and (($base.P[$i] -shr 24) -band 255) -eq 0) { $msgs += 'core pixel outside the frame'; break }
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
        Write-Host ("| ``pack/kubejs/assets/grindless/textures/$rel`` | Generated with tools/assets/$ScriptName (procedural pixel art, original) by the assets agent, 2026-10-24 | the pack's own (pending; proposed CC BY-SA 4.0) |")
    }
}
