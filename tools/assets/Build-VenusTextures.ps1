<#
.SYNOPSIS
  Procedural 16x16 pixel art for the three controller faces of IV's Venus package (IV-B1) of Gregtech Grindless: the
  Pressurized Vein Drill, the Venus Heat Engine and the Venus Acid Works (GregTech style: bevels, top-left light, every pixel
  fully opaque or fully transparent).

.DESCRIPTION
  Every pixel is drawn by this script (palettes + char maps + small routines); nothing is copied or edited from GregTech Modern
  or any other mod. Output is deterministic: re-running overwrites the same bytes (the flicker comes from Get-Noise, a hash of
  position and frame, not from a random generator). Same method, steel bezel, lamp ramp, IV blue and checks as the uranium
  cycle's faces (Build-UraniumCycleTextures.ps1, itself after the fission reactor's); the helpers are copied so the other scripts
  stay untouched.

  Writes (under pack/kubejs/assets/grindless/textures/):
    block/multiblock/pressurized_vein_drill/overlay_front.png, overlay_front_active.png(+.mcmeta), overlay_front_active_emissive.png(+.mcmeta)
    block/multiblock/venus_heat_engine/...    (same three)
    block/multiblock/venus_acid_works/...     (same three)

  pressurized_vein_drill (gtceu:pressurized_vein_drill, on GTM's inert PTFE casing): the front of the sealed, pressure-rated
  housing round the drill string, for Venus (92 bar of CO2 at 737 K under sulfuric acid clouds) and Mars (dust). A round
  pressure hatch, a raised steel ring lit from the top left with eight dark bolt heads, holds a porthole onto the drill string;
  a round pressure dial with a red zone on its right edge stands at the top right, a thermometer under it, and two lamps (run
  and seal) sit in a dark slot at the top left. 8 frames, frametime 4: a warm orange glow (the hot drill string, Venus's heat)
  breathes through the porthole, white-hot in the middle, while the string turns (the dark flight of its screw runs down it one
  row a frame); the needle stands high and trembles at the edge of the red zone; the thermometer's hot column stands near the
  top and flickers a row; the run lamp is lit green and the seal lamp IV blue. Idle: dark glass with a glint and the string at
  rest, the needle on its stop, an empty thermometer over a dull bulb, both lamps dark. Unlike the EV tripod's face (a tripod
  over open ground under the stars), it is a closed door: no sky, no legs, the heat seen through glass.

  venus_heat_engine (gtceu:venus_heat_engine, on GTM's robust tungstensteel casing): a Stirling-style engine standing on the hot
  plate it takes its heat from. At the top left, the radiator fins of the cold head (the chimney up into the clouds) over the
  displacer's cylinder; at the right, the flywheel (the gearbox), a thick rim with a brass crank pin; the output lamp under it;
  across the bottom, the hot plate with its heat-exchanger grille. 8 frames, frametime 4: the grille's slots glow red-orange from
  below (hottest at the bottom) and flicker, with a hotter breath running along them; the flywheel turns an eighth a frame,
  clockwise; the displacer rises and falls in step with the crank and the gas under it glows; the electric-blue output lamp
  blinks (two frames lit, two dark). Idle: a dull red grille, a cold bore, the wheel at rest and the lamp dark.

  venus_acid_works (gtceu:venus_acid_works, on GTM's inert PTFE casing): it cracks the clouds' sulfuric acid into water and
  oxygen over a platinum gauze. At the left, a tall sight glass of pale yellow acid under its vapour (the decomposer); a stub
  (the PTFE duct) carries the vapour into the catalyst box at the top right, where the woven platinum gauze is stretched (a
  silvery cross-hatch: the wire on top swaps at every crossing); under it the water line runs down to a blue lamp and the oxygen
  line to a pale cyan one. 8 frames, frametime 4: three bubbles rise through the acid out of step and break at its surface, the
  gauze glows a dull orange (the hot catalyst) and flickers, a pulse runs down each line and both lamps are lit. Idle: still
  acid, a silver gauze and dark lamps.

  The *_emissive layers only hold the porthole, the thermometer and the lit lamps (drill); the hot gas, the grille's slots and
  the output lamp (engine); and the gauze and the two lamps (acid works). The hatch, the dial, the flywheel, the acid, the
  bubbles, the lines and the steel never glow.

  Run from the repo root (PowerShell 5.1 blocks unsigned scripts by default; this bypass only affects that process):
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-VenusTextures.ps1
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-VenusTextures.ps1 -Only drill,works -Credits
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-VenusTextures.ps1 -Preview C:\path\venus.png -PtfeCasing C:\path\machine_casing_inert_ptfe.png -TungstenCasing C:\path\machine_casing_robust_tungstensteel.png

  Overlay conventions (GTM's workable casings, as every other set): transparent background, details only on the overlay,
  animated variants are vertical 16x(16*n) strips with a .png.mcmeta, *_emissive layers hold only the pixels that glow
  (identical to the colour layer). Every pixel is fully opaque or fully transparent and none is pure black. The outer 1 px ring
  is always left empty so the casing shows around the face. Drawn for gtceu:block/casings/solid/machine_casing_inert_ptfe (the
  drill and the acid works; a dark grey plate in GTM 7.5.3) and gtceu:block/casings/solid/machine_casing_robust_tungstensteel
  (the engine; a blue-grey plate); each face has its own dark frame, so it also reads on other casings. The final check fails
  the run (non-zero exit) if a written file breaks one of these rules, if a frame repeats the next one, if the panel has a hole,
  or if light comes from anywhere but the face's lights.

.PARAMETER Only
  Subset of: drill (pressurized_vein_drill), engine (venus_heat_engine), works (venus_acid_works); comma-separated, also as one
  string with -File. Default: all three.
.PARAMETER OutRoot
  Textures root. Default: <repo>/pack/kubejs/assets/grindless/textures
.PARAMETER Preview
  Also write a review sheet (x8, nearest neighbour) to this PNG, which must be outside the repository (it is never shipped). Per
  face, three rows: on its own casing, the idle face, the 8 working frames with their emissive layer and a dark room, then idle
  and working on the other casing and on a pale plate; the raw colour layers on a checker (transparency check); the emissive
  layer alone, on black. Then one row with each face working next to the existing faces nearest to it (read from OutRoot), and
  3x3 walls of each face's casing, idle and working, at x4 and x1.
.PARAMETER PtfeCasing
  Optional 16x16 PNG used as the drill's and the acid works' casing in the preview (GTM's machine_casing_inert_ptfe.png,
  extracted from the jar and kept outside the repository). Without it a dark grey stand-in drawn by code is used. Context only:
  never written anywhere.
.PARAMETER TungstenCasing
  The same for the heat engine (GTM's machine_casing_robust_tungstensteel.png); without it a blue-grey stand-in is used.
.PARAMETER Credits
  Also print the CREDITS.md "Assets" table rows for the files written.
#>
[CmdletBinding()]
param(
    [string]$OutRoot = '',
    [string[]]$Only = @(),
    [string]$Preview = '',
    [string]$PtfeCasing = '',
    [string]$TungstenCasing = '',
    [switch]$Credits
)
$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'Pixel.Lib.ps1')

# `powershell -File ... -Only a,b` delivers "a,b" as one string: split it so both calling styles work.
$Only = @($Only | ForEach-Object { $_ -split '[,;\s]+' } | Where-Object { $_ })
$Known = @('drill', 'engine', 'works')
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
if ($PtfeCasing) {
    $PtfeCasing = $ExecutionContext.SessionState.Path.GetUnresolvedProviderPathFromPSPath($PtfeCasing)
    if (-not (Test-Path -LiteralPath $PtfeCasing)) { throw "-PtfeCasing not found: $PtfeCasing" }
}
if ($TungstenCasing) {
    $TungstenCasing = $ExecutionContext.SessionState.Path.GetUnresolvedProviderPathFromPSPath($TungstenCasing)
    if (-not (Test-Path -LiteralPath $TungstenCasing)) { throw "-TungstenCasing not found: $TungstenCasing" }
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

# Index into a ramp that repeats every $N cells (PowerShell's % keeps the sign of a negative operand).
function Get-Wrap { param([int]$V, [int]$N) return ((($V % $N) + $N) % $N) }

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

# Ramps shared with the earlier sets: neutral steel (lit -> dark) and the state lamp (green M..P, red Q..S).
$SteelSpec = 'A=D3D3D3 B=B0B0B0 C=8E8E8E D=707070 E=565656 F=404040 G=2F2F2F H=222222 I=161616 J=0D0D0D'
$LampSpec = 'M=E2FFE4 N=62FF86 O=22C257 P=0C6B2E Q=FF5A48 R=B52D22 S=5E1511'
# IV accent (GTM writes IV in blue), white -> deep: the same ramp as the fission reactor's Cherenkov glow and the leach field.
$IvBlueSpec = 'a=EAFAFF b=BDEBFF c=8FD8FF d=63C2FF e=3FA9FF f=2C86E6 g=2164C2'

# ============================================================================================
#  PRESSURIZED VEIN DRILL - controller face (GTM's inert PTFE casing)
#  a round pressure hatch (outer ring x2..10 y5..13, centre 6,9) with eight bolts on its rim and a porthole in the middle (glass
#  x4..8 y7..11, a 21 px disc) through which the drill string (x6) is seen; a round pressure dial at the top right (face
#  x9..13 y2..5, pivot 11,4, red zone on its right edge), a thermometer under it (cap 12,7, tube x12 y8..11, bulb x11..13
#  y12..13) and two lamps in a dark slot at the top left (3,3 run and 5,3 seal)
# ============================================================================================
#   hatch: the steel ramp, as a raised ring lit from the top left (outer edge A..E, inner lip C on the shaded side, B on the lit
#          side); k a bolt head
#   porthole, idle: n dark glass, o glint, q the drill string at rest
#   dial: w face, x shaded face, r red zone, u pivot, v needle
#   thermometer: t empty tube, y the bulb, dull (idle)
#   lamps off: s run (lit: N), z seal (lit: c)
#   heat, white-hot -> deep red (the porthole, the thermometer): 1 .. 7
$DrillHeatSpec = '1=FFF6D2 2=FFDC8A 3=FFB45A 4=F48A32 5=D2621E 6=9E4016 7=6A2810'
$DrillPal = New-Pal ($SteelSpec + ' ' + $LampSpec + ' ' + $IvBlueSpec + ' ' + $DrillHeatSpec + ' ' + @'
k=3A3734
n=1A1D20 o=56616B q=2C2D2F
w=EDE9DB x=B9B4A2 r=D04434 u=3E3936 v=2A2626
t=454A50 y=5A2216
s=1E4029 z=14243A
'@)

$DrillBase = @(
    '................',
    '.CDDDDDDDDDDDDE.',
    '.DIIIIIGGGwwwGF.',
    '.DIsIzIGGwwwwrF.',
    '.DGGGGGGGwwuwrF.',
    '.DGGAAkABGxxxGF.',
    '.DGkBCCCBkGGGGF.',
    '.DABCoqnBCDGCGF.',
    '.DAConqnnBDGtGF.',
    '.DkCnnqnnBkGtGF.',
    '.DBCnnqnnBDGtGF.',
    '.DBCCnqnBCEGtGF.',
    '.DGkCBBBCkGyyyF.',
    '.DGGDEkEEGGyyyF.',
    '.EFFFFFFFFFFFFG.',
    '................'
)
Assert-Map 'DrillBase' $DrillBase

$DrillHeat = '1234567'
$DrillGlassCx = 6; $DrillGlassCy = 9
# The porthole's 21 pixels with their resting heat (an index into $DrillHeat): white-hot in the middle, deep orange at the rim.
$DrillRing = @{ 0 = 0; 1 = 1; 2 = 2; 4 = 3; 5 = 4 }
$DrillGlass = New-Object System.Collections.Generic.List[object]
for ($y = $DrillGlassCy - 2; $y -le $DrillGlassCy + 2; $y++) { for ($x = $DrillGlassCx - 2; $x -le $DrillGlassCx + 2; $x++) {
    $d2 = ($x - $DrillGlassCx) * ($x - $DrillGlassCx) + ($y - $DrillGlassCy) * ($y - $DrillGlassCy)
    if ($DrillRing.ContainsKey($d2)) { $DrillGlass.Add(@($x, $y, $DrillRing[$d2])) }
} }
$DrillStringX = 6
# The glow breathes (steps dimmer): one slow pulse per loop.
$DrillPulse = @(0, 0, 1, 2, 2, 1, 1, 0)
# The needle's tip, one pixel next to the pivot (the two make the hand). 0 rests on the stop (no pressure); 4 is at the red zone.
$DrillNeedle = @(
    @(, @(10, 4)),
    @(, @(10, 3)),
    @(, @(11, 3)),
    @(, @(12, 3)),
    @(, @(12, 4))
)
$DrillNeedleRun = @(2, 3, 3, 4, 3, 3, 2, 3)              # working: the needle stands high and trembles
$DrillThermoX = 12; $DrillThermoY0 = 8; $DrillThermoY1 = 11
$DrillThermoTop = @(9, 9, 8, 8, 9, 8, 8, 9)              # the liquid's top row while working
# The bulb: x, y and its heat (an index into $DrillHeat), lit at its top left.
$DrillBulb = @(@(11, 12, 1), @(12, 12, 2), @(13, 12, 3), @(11, 13, 2), @(12, 13, 3), @(13, 13, 4))
$DrillLampRun = @(3, 3); $DrillLampSeal = @(5, 3)

function New-DrillFrame {
    param([bool]$Active, [int]$T = 0)
    $c = New-Canvas; $e = New-Canvas
    $P = $DrillPal
    Write-Map $c 0 0 $DrillBase $P
    $f = $T % 8

    if ($Active) {
        # ---- the porthole: the hot chamber glows and breathes; the drill string turns in the middle, hotter than the glow around
        #      it, with the dark flight of its screw running down one row a frame
        foreach ($g in $DrillGlass) {
            $tone = $g[2] + $DrillPulse[$f]
            if ($g[0] -eq $DrillStringX) {
                if ((Get-Wrap ($g[1] - ($DrillGlassCy - 2) - $f) 4) -eq 0) { $tone += 2 } else { $tone -= 1 }
            } else {
                $n = Get-Noise $g[0] $g[1] $T 31
                if ($n -lt 40) { $tone-- } elseif ($n -gt 215) { $tone++ }
            }
            Set-Both $c $e $g[0] $g[1] $P[[string]$DrillHeat[(Get-ClampInt $tone 0 ($DrillHeat.Length - 1))]]
        }
        # ---- the thermometer: the hot column stands near the top and trembles a row
        for ($y = $DrillThermoTop[$f]; $y -le $DrillThermoY1; $y++) {
            Set-Both $c $e $DrillThermoX $y $P[$(if ($y -eq $DrillThermoTop[$f]) { '2' } else { '3' })]
        }
        foreach ($b in $DrillBulb) { Set-Both $c $e $b[0] $b[1] $P[[string]$DrillHeat[$b[2]]] }
        # ---- the lamps: run and seal
        Set-Both $c $e $DrillLampRun[0] $DrillLampRun[1] $P['N']
        Set-Both $c $e $DrillLampSeal[0] $DrillLampSeal[1] $P['c']
    }

    # ---- the dial: the needle rests on its stop when idle and stands high, trembling, while working
    $pos = if ($Active) { $DrillNeedleRun[$f] } else { 0 }
    foreach ($px in $DrillNeedle[$pos]) { Set-Px $c $px[0] $px[1] $P['v'] }

    Sync-Emissive $c $e
    return @{ Color = $c; Emi = $e }
}

# Where light may come from: the porthole, the thermometer and the two lamps (the hatch, the dial and the steel never glow).
$DrillGlowZone = New-Object 'System.Collections.Generic.HashSet[int]'
foreach ($g in $DrillGlass) { [void]$DrillGlowZone.Add($g[1] * 16 + $g[0]) }
for ($y = $DrillThermoY0; $y -le $DrillThermoY1; $y++) { [void]$DrillGlowZone.Add($y * 16 + $DrillThermoX) }
foreach ($b in $DrillBulb) { [void]$DrillGlowZone.Add($b[1] * 16 + $b[0]) }
foreach ($l in @($DrillLampRun, $DrillLampSeal)) { [void]$DrillGlowZone.Add($l[1] * 16 + $l[0]) }

# ============================================================================================
#  VENUS HEAT ENGINE - controller face (GTM's robust tungstensteel casing)
#  a Stirling-style engine on its hot plate: the cold head's radiator fins (x2..6 y2..5) over the displacer cylinder (walls x2
#  and x6, bore x3..5 y6..9), the flywheel at the right (a thick rim x7..13 y2..8 around a dark 3x3 core, hub 10,5) on its
#  post (10,9), the output lamp (x12..13 y8..9) and the hot plate (top bar y10) with its heat-exchanger grille (fins at even
#  x, slots at odd x, y11..13)
# ============================================================================================
#   radiator and cylinder, flywheel rim, post and plate: the steel ramp; H the flywheel's core, j the cool gas in the bore; k the
#   brass crank pin
#   grille slots, idle: h warm (rows 12..13), i dim (row 11)
#   output lamp off: z, Y its highlight (lit: IV blue b, d and f)
#   heat, white-hot -> deep red (the hot gas under the displacer, the grille): 1 .. 7
$EngineHeatSpec = '1=FFE9B8 2=FFC266 3=FF8E3A 4=F0602A 5=C83E1E 6=8E2A16 7=5C1C12'
$EnginePal = New-Pal ($SteelSpec + ' ' + $LampSpec + ' ' + $IvBlueSpec + ' ' + $EngineHeatSpec + ' ' + @'
j=1F2731 k=D8A646
h=5C1E14 i=3E1610
z=14243A Y=2A4A6E
'@)

$EngineBase = @(
    '................',
    '.CDDDDDDDDDDDDE.',
    '.DABBBCGGBBBGGF.',
    '.DICCDIGBDDDCGF.',
    '.DABBBCBDHHHEEF.',
    '.DICCDIBDHHHEEF.',
    '.DCjjjEBDHHHEEF.',
    '.DCjjjEGCEEEEGF.',
    '.DCjjjEGGEEEYzF.',
    '.DCjjjEGGGDGzzF.',
    '.DABBBBBBBBBBCF.',
    '.DDiDiDiDiDiDiF.',
    '.DEhEhEhEhEhEhF.',
    '.DFhFhFhFhFhFhF.',
    '.EFFFFFFFFFFFFG.',
    '................'
)
Assert-Map 'EngineBase' $EngineBase

$EngineHeat = '1234567'
$EngineHubX = 10; $EngineHubY = 5
# The crank pin's eight places on the rim, clockwise from the top (relative to the hub), and the arm from the hub towards it.
$EnginePins = @(@(0, -3), @(2, -2), @(3, 0), @(2, 2), @(0, 3), @(-2, 2), @(-3, 0), @(-2, -2))
$EngineArms = @(
    @(@(0, -1), @(0, -2)),
    @(, @(1, -1)),
    @(@(1, 0), @(2, 0)),
    @(, @(1, 1)),
    @(@(0, 1), @(0, 2)),
    @(, @(-1, 1)),
    @(@(-1, 0), @(-2, 0)),
    @(, @(-1, -1))
)
$EngineCrankIdle = 1                                     # at rest the pin stands at the upper right
$EngineBoreX0 = 3; $EngineBoreX1 = 5; $EngineBoreY0 = 6; $EngineBoreY1 = 9
$EnginePiston = @(6, 6, 7, 8, 9, 9, 8, 7)                # the displacer's row, in step with the crank (top on frame 0)
$EnginePistonIdle = 8
$EngineSlotX = @(3, 5, 7, 9, 11, 13); $EngineGrilleY0 = 11; $EngineGrilleY1 = 13
$EngineLamp = @(@(12, 8, 'b'), @(13, 8, 'd'), @(12, 9, 'd'), @(13, 9, 'f'))

function New-EngineFrame {
    param([bool]$Active, [int]$T = 0)
    $c = New-Canvas; $e = New-Canvas
    $P = $EnginePal
    Write-Map $c 0 0 $EngineBase $P
    $f = $T % 8

    # ---- the flywheel: the crank arm runs from the hub to the brass pin on the rim, a short stub on the other side; it turns
    #      an eighth a frame, clockwise
    $k = if ($Active) { $f } else { $EngineCrankIdle }
    $stub = $EngineArms[$k][0]
    Set-Px $c ($EngineHubX - $stub[0]) ($EngineHubY - $stub[1]) $P['D']
    foreach ($v in $EngineArms[$k]) { Set-Px $c ($EngineHubX + $v[0]) ($EngineHubY + $v[1]) $P['C'] }
    Set-Px $c $EngineHubX $EngineHubY $P['B']
    Set-Px $c ($EngineHubX + $EnginePins[$k][0]) ($EngineHubY + $EnginePins[$k][1]) $P['k']

    # ---- the displacer: a lit bar in the bore; while working, the gas under it glows (hottest next to the plate)
    $py = if ($Active) { $EnginePiston[$f] } else { $EnginePistonIdle }
    Set-Px $c $EngineBoreX0 $py $P['A']
    for ($x = $EngineBoreX0 + 1; $x -le $EngineBoreX1; $x++) { Set-Px $c $x $py $P[$(if ($x -eq $EngineBoreX1) { 'C' } else { 'B' })] }
    if ($Active) {
        for ($y = $py + 1; $y -le $EngineBoreY1; $y++) { for ($x = $EngineBoreX0; $x -le $EngineBoreX1; $x++) {
            $tone = 2 + ($EngineBoreY1 - $y)
            if ($x -eq $EngineBoreX1) { $tone++ }
            Set-Both $c $e $x $y $P[[string]$EngineHeat[(Get-ClampInt $tone 0 ($EngineHeat.Length - 1))]]
        } }
    }

    # ---- the grille: the slots glow from below (hottest at the bottom) and flicker; a hotter breath runs along them, left to
    #      right, one slot a frame (frames 6 and 7 rest)
    if ($Active) {
        for ($s = 0; $s -lt $EngineSlotX.Count; $s++) {
            $x = $EngineSlotX[$s]
            for ($y = $EngineGrilleY0; $y -le $EngineGrilleY1; $y++) {
                $tone = 1 + ($EngineGrilleY1 - $y)
                if ($s -eq $f) { $tone-- }
                $n = Get-Noise $x $y $T 47
                if ($n -lt 36) { $tone-- } elseif ($n -gt 219) { $tone++ }
                Set-Both $c $e $x $y $P[[string]$EngineHeat[(Get-ClampInt $tone 0 ($EngineHeat.Length - 1))]]
            }
        }
        # ---- the output lamp blinks: two frames lit, two dark
        if (($f % 4) -lt 2) { foreach ($l in $EngineLamp) { Set-Both $c $e $l[0] $l[1] $P[$l[2]] } }
    }

    Sync-Emissive $c $e
    return @{ Color = $c; Emi = $e }
}

# Where light may come from: the bore, the grille's slots and the output lamp (the fins, the flywheel and the steel never glow).
$EngineGlowZone = New-Object 'System.Collections.Generic.HashSet[int]'
for ($y = $EngineBoreY0; $y -le $EngineBoreY1; $y++) { for ($x = $EngineBoreX0; $x -le $EngineBoreX1; $x++) { [void]$EngineGlowZone.Add($y * 16 + $x) } }
foreach ($x in $EngineSlotX) { for ($y = $EngineGrilleY0; $y -le $EngineGrilleY1; $y++) { [void]$EngineGlowZone.Add($y * 16 + $x) } }
foreach ($l in $EngineLamp) { [void]$EngineGlowZone.Add($l[1] * 16 + $l[0]) }

# ============================================================================================
#  VENUS ACID WORKS - controller face (GTM's inert PTFE casing)
#  a tall sight glass at the left (frame x2..6 y2..13, glass x3..5 y3..12: vapour over pale yellow acid, surface on row 5),
#  a stub (7,4) carrying the vapour into the catalyst box at the top right (frame x8..13 y2..7) with its platinum gauze (a
#  woven 4x4 mesh, x9..12 y3..6), and the two outlets under it: the water line (x9 y8..10) to the blue lamp (x9..10 y11..12)
#  and the oxygen line (x12 y8..10) to the pale cyan lamp (x12..13 y11..12)
# ============================================================================================
#   sight glass: h vapour, i a wisp in it; acid j surface glint, k lit, l body, m shaded; o a bubble
#   gauze: p wire on top, q wire underneath (they swap at every crossing), s a hole; glowing (working): t hot spot, u wire on top,
#   v wire underneath
#   lines: L water, K oxygen; lamps off: x water, y oxygen, X and Z their highlights; water lit: IV blue d e f g; oxygen lit: U V W
$WorksPal = New-Pal ($SteelSpec + ' ' + $LampSpec + ' ' + $IvBlueSpec + ' ' + @'
h=262620 i=3A3826
j=FFF8CC k=F2E38E l=DCCA66 m=B5A146
o=FFFFF0
p=E9ECF0 q=AEB4BD s=1C1E22
t=F8BE78 u=E2924A v=B4652C
L=5E7A90 K=A8B4BC
x=0E2140 X=1E3A66 y=123A40 Z=2A5A60
U=F6FFFF V=C9F7FF W=94E2F0
'@)

$WorksBase = @(
    '................',
    '.CDDDDDDDDDDDDE.',
    '.DCBBBDGCBBBBDF.',
    '.DChhhEGCpspsEF.',
    '.DChihECCsqsqEF.',
    '.DCjkkEGCpspsEF.',
    '.DCkllEGCsqsqEF.',
    '.DCkllEGDEEEEFF.',
    '.DCkllEGGLGGKGF.',
    '.DCkllEGGLGGKGF.',
    '.DCkllEGGLGGKGF.',
    '.DCklmEGGXxGZyF.',
    '.DClmmEGGxxGyyF.',
    '.DDEEEFGGGGGGGF.',
    '.EFFFFFFFFFFFFG.',
    '................'
)
Assert-Map 'WorksBase' $WorksBase

$WorksSurfaceY = 5; $WorksBottomY = 12
# Each bubble: its column and its phase. It rises a row a frame from the bottom and breaks at the surface on its eighth frame.
$WorksBubbles = @(@(3, 0), @(4, 5), @(5, 2))
$WorksMeshX0 = 9; $WorksMeshX1 = 12; $WorksMeshY0 = 3; $WorksMeshY1 = 6
$WorksLines = @(@(9, 'e', 0), @(12, 'V', 2))              # column, pulse letter, phase (the oxygen half a beat behind)
$WorksLineY0 = 8; $WorksLineY1 = 10
$WorksWaterLamp = @(@(9, 11, 'd'), @(10, 11, 'e'), @(9, 12, 'f'), @(10, 12, 'g'))
$WorksOxygenLamp = @(@(12, 11, 'U'), @(13, 11, 'V'), @(12, 12, 'V'), @(13, 12, 'W'))

function New-WorksFrame {
    param([bool]$Active, [int]$T = 0)
    $c = New-Canvas; $e = New-Canvas
    $P = $WorksPal
    Write-Map $c 0 0 $WorksBase $P
    $f = $T % 8

    if ($Active) {
        # ---- the acid boils: three bubbles rise out of step and break at the surface
        foreach ($b in $WorksBubbles) {
            $k = ($f + $b[1]) % 8
            if ($k -lt 7) { Set-Px $c $b[0] ($WorksBottomY - $k) $P['o'] } else { Set-Px $c $b[0] $WorksSurfaceY $P['o'] }
        }
        # ---- the gauze glows a dull orange (the wire on top a step brighter); a few crossings flicker hotter or dimmer
        for ($y = $WorksMeshY0; $y -le $WorksMeshY1; $y++) { for ($x = $WorksMeshX0; $x -le $WorksMeshX1; $x++) {
            if ((($x + $y) % 2) -ne 0) { continue }
            $tone = if (($x % 2) -eq 1) { 1 } else { 2 }
            $n = Get-Noise $x $y $T 53
            if ($n -lt 34) { $tone-- } elseif ($n -gt 221) { $tone++ }
            Set-Both $c $e $x $y $P[[string]'tuv'[(Get-ClampInt $tone 0 2)]]
        } }
        # ---- the products: a pulse runs down each line into its lamp (then the line rests a frame), and both lamps are lit
        foreach ($ln in $WorksLines) {
            $row = Get-Wrap ($f + $ln[2]) ($WorksLineY1 - $WorksLineY0 + 2)
            if ($WorksLineY0 + $row -le $WorksLineY1) { Set-Px $c $ln[0] ($WorksLineY0 + $row) $P[$ln[1]] }
        }
        foreach ($l in ($WorksWaterLamp + $WorksOxygenLamp)) { Set-Both $c $e $l[0] $l[1] $P[$l[2]] }
    }

    Sync-Emissive $c $e
    return @{ Color = $c; Emi = $e }
}

# Where light may come from: the gauze and the two lamps (the acid, the bubbles, the lines and the steel never glow).
$WorksGlowZone = New-Object 'System.Collections.Generic.HashSet[int]'
for ($y = $WorksMeshY0; $y -le $WorksMeshY1; $y++) { for ($x = $WorksMeshX0; $x -le $WorksMeshX1; $x++) { [void]$WorksGlowZone.Add($y * 16 + $x) } }
foreach ($l in ($WorksWaterLamp + $WorksOxygenLamp)) { [void]$WorksGlowZone.Add($l[1] * 16 + $l[0]) }

# ============================================================================================
#  BUILD
# ============================================================================================
$DrillDir = 'block/multiblock/pressurized_vein_drill'
$EngineDir = 'block/multiblock/venus_heat_engine'
$WorksDir = 'block/multiblock/venus_acid_works'
$FrameTime = 4
$GlowZones = @{}
$GlowZones[$DrillDir] = $DrillGlowZone
$GlowZones[$EngineDir] = $EngineGlowZone
$GlowZones[$WorksDir] = $WorksGlowZone

function Out-Overlay {
    param([string]$Dir, $Builder, [int]$FrameTime)
    $frames = @(); $emis = @()
    for ($f = 0; $f -lt 8; $f++) { $r = & $Builder $true $f; $frames += $r.Color; $emis += $r.Emi }
    $idle = & $Builder $false 0
    Out-Tex $idle.Color "$Dir/overlay_front.png"
    Out-Tex (Join-Frames $frames) "$Dir/overlay_front_active.png" $FrameTime
    Out-Tex (Join-Frames $emis) "$Dir/overlay_front_active_emissive.png" $FrameTime
}

if (Test-Want 'drill') { Out-Overlay $DrillDir ${function:New-DrillFrame} $FrameTime }
if (Test-Want 'engine') { Out-Overlay $EngineDir ${function:New-EngineFrame} $FrameTime }
if (Test-Want 'works') { Out-Overlay $WorksDir ${function:New-WorksFrame} $FrameTime }

# ============================================================================================
#  VERIFY what was written: exact sizes (the idle face 16x16, the strips 16x128), binary alpha, no pure black, the .mcmeta
#  frametime, frames that really differ (each one from the next, the loop seam included, and at least 4 distinct), the empty
#  casing ring around a panel without holes (so the casing always shows around the face), and an emissive layer inside the
#  colour layer, lit in every frame and only where the face has lights
# ============================================================================================
$problems = 0
foreach ($rel in $written) {
    $path = Join-Path $OutRoot ($rel -replace '/', '\')
    $msgs = @()
    if ($rel.EndsWith('.mcmeta')) {
        $ft = 0
        try { $ft = [int]((Get-Content -LiteralPath $path -Raw | ConvertFrom-Json).animation.frametime) } catch { $msgs += 'unreadable .mcmeta' }
        if ($ft -ne $FrameTime) { $msgs += "frametime $ft (expected $FrameTime)" }
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
    if ($opaque -eq $img.P.Length) { $msgs += 'fully opaque (the casing would not show)' }
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
    # an emissive layer may only contain pixels that exist, identical, in the colour layer, only where the face has lights, and
    # every frame has a glow
    if ($emissive) {
        $zone = $GlowZones[($rel -replace '/[^/]+$', '')]
        $colorPath = Join-Path $OutRoot (($rel -replace '_emissive\.png$', '.png') -replace '/', '\')
        $color = Read-Png $colorPath
        if ($null -eq $zone) { $msgs += 'no glow zone for this face' }
        elseif ($color.H -ne $img.H) { $msgs += 'emissive strip height differs from the colour strip' }
        else {
            $stray = 0; $outside = 0
            for ($i = 0; $i -lt $img.P.Length; $i++) {
                if ((($img.P[$i] -shr 24) -band 255) -eq 0) { continue }
                if ($img.P[$i] -ne $color.P[$i]) { $stray++ }
                if (-not $zone.Contains($i % 256)) { $outside++ }
            }
            if ($stray -gt 0) { $msgs += "$stray emissive px not present in the colour layer" }
            if ($outside -gt 0) { $msgs += "$outside emissive px outside the face's lights" }
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
    # A stand-in casing drawn here, used when no casing PNG is given: a plate with a lit rim, a groove and a recessed middle panel
    # shaded from its top left corner. Letters: a lit edge, b rim, c shaded rim, d groove and shadow, e panel lit, f panel shaded.
    function New-StandInCasing {
        param([string]$Spec)
        $pal = New-Pal $Spec
        $c = New-Canvas
        for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
            $ch = 'b'
            if ($x -eq 15 -or $y -eq 15) { $ch = 'd' }
            elseif ($x -eq 0 -or $y -eq 0) { $ch = 'a' }
            elseif ($x -ge 4 -and $x -le 11 -and $y -ge 4 -and $y -le 11) { $ch = if (($x + $y) -le 15) { 'e' } else { 'f' } }
            elseif ($x -eq 3 -or $y -eq 3 -or $x -eq 12 -or $y -eq 12) { $ch = 'd' }
            elseif ($x -ge 13 -or $y -ge 13) { $ch = 'c' }
            $c.P[$y * 16 + $x] = $pal[$ch]
        } }
        return $c
    }
    # the casing a face is drawn for: GTM's texture when its path is given (its first 16x16 frame), otherwise the stand-in
    function Get-CasingTile {
        param([string]$Path, $StandIn)
        if (-not $Path) { return $StandIn }
        $img = Read-Png $Path
        if ($img.W -ne 16 -or ($img.H % 16) -ne 0) { throw "casing $Path is $($img.W)x$($img.H) (expected 16x16 or a 16-wide strip)" }
        return (Get-Frame $img 0)
    }
    # GTM 7.5.3's inert PTFE casing is a dark grey plate and its robust tungstensteel casing a blue-grey one; the pale plate shows
    # how the faces read on a light casing
    $ptfe = Get-CasingTile $PtfeCasing (New-StandInCasing 'a=4A4A4A b=3E3E3E c=303030 d=1E1E1E e=474747 f=363636')
    $tung = Get-CasingTile $TungstenCasing (New-StandInCasing 'a=A2B2C6 b=8A96B4 c=6E7A98 d=42525E e=8C94B6 f=6C7892')
    $pale = New-StandInCasing 'a=F2F2F2 b=DCDCDC c=C6C6C6 d=9E9E9E e=E4E4E4 f=D0D0D0'
    $checker = New-Canvas
    for ($i = 0; $i -lt 256; $i++) { $checker.P[$i] = if (((($i % 16) + [int][Math]::Floor($i / 16)) % 2) -eq 0) { Hex '3C4048' } else { Hex '4A4F58' } }
    $night = New-Canvas
    for ($i = 0; $i -lt 256; $i++) { $night.P[$i] = Hex '0A0B0D' }

    # each face with its own casing, the other casings it is also shown on, and the existing faces it must not be mistaken for
    $faces = @()
    if (Test-Want 'drill') { $faces += [pscustomobject]@{ Dir = $DrillDir; Own = $ptfe; Others = @($tung, $pale); Near = @('ev_tripod', 'lunar_drill', 'fission_reactor') } }
    if (Test-Want 'engine') { $faces += [pscustomobject]@{ Dir = $EngineDir; Own = $tung; Others = @($ptfe, $pale); Near = @('combined_cycle_plant', 'generator_array', 'atmosphere_processor') } }
    if (Test-Want 'works') { $faces += [pscustomobject]@{ Dir = $WorksDir; Own = $ptfe; Others = @($tung, $pale); Near = @('platinum_plant', 'extraction_cascade', 'heavy_water_plant') } }
    foreach ($fc in $faces) {
        $dir = Join-Path $OutRoot ($fc.Dir -replace '/', '\')
        $fc | Add-Member -NotePropertyName Idle -NotePropertyValue (Read-Png (Join-Path $dir 'overlay_front.png'))
        $fc | Add-Member -NotePropertyName Act -NotePropertyValue (Read-Png (Join-Path $dir 'overlay_front_active.png'))
        $fc | Add-Member -NotePropertyName Emi -NotePropertyValue (Read-Png (Join-Path $dir 'overlay_front_active_emissive.png'))
        $lit = @(); for ($f = 0; $f -lt 8; $f++) { $lit += (Merge-On (Get-Frame $fc.Act $f) (Get-Frame $fc.Emi $f)) }
        $fc | Add-Member -NotePropertyName Lit -NotePropertyValue $lit
    }

    $k = 8; $gap = 16; $cell = 16 * $k + $gap
    $sheet = New-Canvas ($gap + 14 * $cell + $gap) ($gap + $faces.Count * 3 * $cell + $gap + $cell + $gap + 48 * 4 + $gap)
    $bgRow = New-Object 'int[]' $sheet.W
    $bg = Hex '1E2126'
    for ($i = 0; $i -lt $sheet.W; $i++) { $bgRow[$i] = $bg }
    for ($y = 0; $y -lt $sheet.H; $y++) { [Array]::Copy($bgRow, 0, $sheet.P, $y * $sheet.W, $sheet.W) }

    # per face, three rows. 1: on its casing, idle, the 8 working frames with their emissive layer and a dark room; then, after
    # a gap, idle and working (frame 2) on the other two casings. 2: the raw colour layer on a checker (the empty ring shows).
    # 3: the emissive layer alone, on black.
    $y0 = $gap
    foreach ($fc in $faces) {
        Add-Blit $sheet (Merge-On $fc.Own $fc.Idle) $gap $y0 $k
        Add-Blit $sheet (Merge-On $checker $fc.Idle) $gap ($y0 + $cell) $k
        for ($f = 0; $f -lt 8; $f++) {
            $x0 = $gap + (1 + $f) * $cell
            Add-Blit $sheet (Merge-On $fc.Own $fc.Lit[$f]) $x0 $y0 $k
            Add-Blit $sheet (Merge-On $checker (Get-Frame $fc.Act $f)) $x0 ($y0 + $cell) $k
            Add-Blit $sheet (Merge-On $night (Get-Frame $fc.Emi $f)) $x0 ($y0 + 2 * $cell) $k
        }
        Add-Blit $sheet (Get-Dark $fc.Own (Get-Frame $fc.Act 0) (Get-Frame $fc.Emi 0)) ($gap + 9 * $cell) $y0 $k
        $x0 = $gap + 10 * $cell + $gap
        foreach ($o in $fc.Others) {
            Add-Blit $sheet (Merge-On $o $fc.Idle) $x0 $y0 $k
            Add-Blit $sheet (Merge-On $o $fc.Lit[2]) ($x0 + $cell) $y0 $k
            $x0 += 2 * $cell
        }
        $y0 += 3 * $cell
    }

    # one row: each face working (frame 2) on its casing, followed by the existing faces nearest to it, on the same casing
    $y0 += $gap
    $x0 = $gap
    foreach ($fc in $faces) {
        Add-Blit $sheet (Merge-On $fc.Own $fc.Lit[2]) $x0 $y0 $k
        $x0 += $cell
        foreach ($nb in $fc.Near) {
            $nd = Join-Path $OutRoot ('block\multiblock\' + $nb)
            if (-not (Test-Path -LiteralPath (Join-Path $nd 'overlay_front_active.png'))) { continue }
            $na = Read-Png (Join-Path $nd 'overlay_front_active.png')
            $ne = Read-Png (Join-Path $nd 'overlay_front_active_emissive.png')
            Add-Blit $sheet (Merge-On (Merge-On $fc.Own (Get-Frame $na 2)) (Get-Frame $ne 2)) $x0 $y0 $k
            $x0 += $cell
        }
        $x0 += $gap
    }

    # last row: a 3x3 wall of each face's casing, idle and working, at x4, then the same walls at x1 (as seen from a few blocks)
    $y0 += $cell + $gap
    $x0 = $gap
    foreach ($fc in $faces) {
        Add-Blit $sheet (New-Wall $fc.Own $fc.Idle) $x0 $y0 4; $x0 += 48 * 4 + $gap
        Add-Blit $sheet (New-Wall $fc.Own $fc.Lit[2]) $x0 $y0 4; $x0 += 48 * 4 + $gap
    }
    foreach ($fc in $faces) {
        Add-Blit $sheet (New-Wall $fc.Own $fc.Idle) $x0 $y0 1
        Add-Blit $sheet (New-Wall $fc.Own $fc.Lit[2]) $x0 ($y0 + 48 + $gap) 1
        $x0 += 48 + $gap
    }

    $pdir = Split-Path -Parent $Preview
    if ($pdir -and -not (Test-Path -LiteralPath $pdir)) { New-Item -ItemType Directory -Force -Path $pdir | Out-Null }
    $bmp = ConvertTo-Bitmap $sheet
    try { $bmp.Save($Preview, [System.Drawing.Imaging.ImageFormat]::Png) } finally { $bmp.Dispose() }
    $ptfeNote = if ($PtfeCasing) { Split-Path -Leaf $PtfeCasing } else { 'a dark grey stand-in for the PTFE casing' }
    $tungNote = if ($TungstenCasing) { Split-Path -Leaf $TungstenCasing } else { 'a blue-grey stand-in for the tungstensteel casing' }
    Write-Host "preview: $Preview (x$k on $ptfeNote and $tungNote; per face: idle, 8 working frames, dark room, then the other casings; raw layer on a checker; emissive alone; the nearest existing faces; 3x3 walls at x4 and x1)"
}

if ($problems -gt 0) { throw "$problems file(s) failed the texture checks (see the warnings above)" }

if ($Credits) {
    Write-Host ''
    foreach ($rel in $written) {
        Write-Host ("| ``pack/kubejs/assets/grindless/textures/$rel`` | Generated with tools/assets/$ScriptName (procedural pixel art, original) by the assets agent, 2026-10-25 | the pack's licence (pending; proposed CC BY-SA 4.0) |")
    }
}
