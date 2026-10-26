<#
.SYNOPSIS
  Procedural 16x16 pixel art for the controller faces of the LuV Europa multiblocks (LuV-B8) of Gregtech Grindless: the
  cryobot and the algae bioreactor (GregTech style: bevels, top-left light, every pixel fully opaque or fully transparent).

.DESCRIPTION
  Every pixel is drawn by this script (palettes + char maps + small routines); nothing is copied or edited from GregTech
  Modern or any other mod. Output is deterministic: re-running overwrites the same bytes (the ice's frost and the culture's
  shimmer come from Get-Noise, a hash of position and frame, not from a random generator). Same method, steel bezel, lamp
  ramp, helpers and checks as the biofoundry's face (Build-BiofoundryTextures.ps1), copied so that script stays untouched:
  no frame repeats the next one, no hole inside the panel, and light only where the face has lights.

  Writes (under pack/kubejs/assets/grindless/textures/):
    block/multiblock/cryobot/overlay_front.png, overlay_front_active.png(+.mcmeta), overlay_front_active_emissive.png(+.mcmeta)
    block/multiblock/algae_bioreactor/overlay_front.png, overlay_front_active.png(+.mcmeta),
      overlay_front_active_emissive.png(+.mcmeta)

  Cryobot (gtceu:cryobot), the melt-probe winch station on Europa's ice: a tall borehole window under the tether spool, with a
  depth gauge and the status lamp at its right. Through the window, the ice shell in strata (frosty white at the top, deeper
  blue below), the slushy ice-ocean interface and the dark ocean under it. The probe is a short steel cylinder on its tether.
  8 frames, frametime 4: the spool turns, the probe sinks one row a frame from the ice into the ocean, leaving a borehole of
  meltwater behind it where bubbles rise; its RTG-heated melt head glows white-hot with an orange-red halo; the depth gauge
  lights one more cell a frame; the status lamp is lit. Idle: the probe parked at the top of the ice, its head dark, the
  gauge empty and the lamp dark.

  Algae bioreactor (gtceu:algae_bioreactor): three vertical glass photobioreactor tubes between four LED grow-light strips,
  under a lamp hood and over the bottom manifold, with a control strip below (grow-light indicator, harvest bar, run lamp).
  8 frames, frametime 4: the tubes hold a green culture that shimmers; bubbles rise in each tube out of step, wobbling between
  the tube's two columns and bursting at the surface; the LED strips glow pink with warm white every third row; the harvest
  bar fills one cell every two frames and starts again; the indicator and run lamps are lit. Idle: clear pale medium in the
  tubes, the LEDs dark, the bar empty and both lamps dark.

  The *_emissive layers only hold the probe's hot head, the lit gauge cells and the lamp (cryobot), and the LED strips, the
  lit bar cells and the two lamps (algae bioreactor).

  Run from the repo root (PowerShell 5.1 blocks unsigned scripts by default; this bypass only affects that process):
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-EuropaTextures.ps1
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-EuropaTextures.ps1 -Only cryobot -Credits

  Overlay conventions (GTM's workable casings, as every other set): transparent background, details only on the overlay,
  animated variants are vertical 16x(16*n) strips with a .png.mcmeta, *_emissive layers hold only the pixels that glow
  (identical to the colour layer). Every pixel is fully opaque or fully transparent and none is pure black. The outer 1 px
  ring is always left empty so the casing shows around the face. Drawn for grindless:block/luv/sulfur_concrete_casing (both
  machines' workableCasingModel), a bright yellow ochre: each face is a whole dark panel inside the ring, so the window, the
  tubes and the lamps read on it. The final check fails the run (non-zero exit) if a written file breaks one of these rules.

.PARAMETER Only
  Subset of: cryobot, algae_bioreactor (comma-separated, also as one string with -File). Default: everything.
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
$Known = @('cryobot', 'algae_bioreactor')
foreach ($id in $Only) { if ($Known -notcontains $id) { throw "Unknown -Only id '$id' (expected: $($Known -join ', '))" } }

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

# ============================================================================================
#  CRYOBOT - controller face (sulfur concrete)
#  the steel bezel around a dark steel plate (G); the tether spool (y2: flanges B and C at x3 and x9, the wound tether s/w
#  between them); the borehole window under it (v, x3..9 y3..12): the ice shell in strata (y3..7), the slushy ice-ocean
#  interface (y8) and the ocean (y9..12); the depth gauge (cells y at x12 y3..10, ticks C at x11) and the status lamp (g at
#  12,12); the lit lip (E, y13)
# ============================================================================================
#   window: a c e i j the ice strata from the frosty surface down, k the slushy interface, n p q u the ocean from the
#   interface down (v stands for the window in the map and is always painted over)
#   spool: s w the tether wraps (dark, lit; they swap every frame while the winch pays out)
#   borehole: m meltwater, b a rising bubble; the tether is C, the probe's body B C E (lit -> shade, darker than the ice)
#   melt head: d dark (idle), h white-hot point, t its orange halo, x the red melt glow under it
#   gauge: y a cell off (lit: l, the newest z); g the status lamp off (lit: N)
$CbPal = New-Pal ($SteelSpec + ' ' + $LampSpec + ' ' + @'
a=E2F2FC c=C4E0F4 e=A6CCEA i=8AB6E0 j=6E9ED4 k=4E7CB8
n=24406E p=1E3660 q=182C52 u=142446
v=A6CCEA
s=8A8A96 w=CACAD4
m=5C98C6 b=E0F6FF
d=5A3A34 h=FFE48C t=FF7A2E x=D8461E
y=1C3440 l=6ED8F4 z=D6FAFF
g=24502F
'@)

$CbBase = @(
    '................',
    '.CDDDDDDDDDDDDE.',
    '.DGBsssssCGGGGF.',
    '.DGvvvvvvvGCyGF.',
    '.DGvvvvvvvGGyGF.',
    '.DGvvvvvvvGCyGF.',
    '.DGvvvvvvvGGyGF.',
    '.DGvvvvvvvGCyGF.',
    '.DGvvvvvvvGGyGF.',
    '.DGvvvvvvvGCyGF.',
    '.DGvvvvvvvGGyGF.',
    '.DGvvvvvvvGGGGF.',
    '.DGvvvvvvvGGgGF.',
    '.DGEEEEEEEEEEGF.',
    '.EFFFFFFFFFFFFG.',
    '................'
)
Assert-Map 'CbBase' $CbBase

# The window's layer on each row, the rows of ice (the frost speckle and the meltwater only live there), the probe's column
# and the head's row per frame (one row lower a frame; idle: parked at the top), the gauge and the lamp.
$CbLayer = @{ 3 = 'a'; 4 = 'c'; 5 = 'e'; 6 = 'i'; 7 = 'j'; 8 = 'k'; 9 = 'n'; 10 = 'p'; 11 = 'q'; 12 = 'u' }
$CbWinX0 = 3; $CbWinX1 = 9; $CbWinY0 = 3; $CbWinY1 = 12
$CbIceY1 = 8
$CbProbeX = 6
$CbParkedTip = 5
$CbTipY = @(5, 6, 7, 8, 9, 10, 11, 12)
$CbSpoolX0 = 4; $CbSpoolX1 = 8; $CbSpoolY = 2
$CbGaugeX = 12; $CbGaugeY0 = 3; $CbGaugeCells = 8
$CbLamp = @(12, 12)
$CbFrost = Hex 'F4FBFF'

function New-CryobotFrame {
    param([bool]$Active, [int]$T = 0)
    $c = New-Canvas; $e = New-Canvas
    $P = $CbPal
    Write-Map $c 0 0 $CbBase $P
    $f = $T % 8

    # ---- the tether spool: the wraps swap every frame while it pays out
    $turn = if ($Active) { $f } else { 0 }
    for ($x = $CbSpoolX0; $x -le $CbSpoolX1; $x++) {
        Set-Px $c $x $CbSpoolY $P[$(if ((($x + $turn) % 2) -eq 0) { 'w' } else { 's' })]
    }

    # ---- the window: ice strata with a static frost speckle, the interface and the ocean; the window's side columns are a
    # step darker so the window reads as a deep shaft
    for ($y = $CbWinY0; $y -le $CbWinY1; $y++) {
        for ($x = $CbWinX0; $x -le $CbWinX1; $x++) {
            $col = $P[$CbLayer[$y]]
            if ($y -lt $CbIceY1 -and (Get-Noise $x $y 0 7) -lt 34) { $col = Mix $col $CbFrost 0.45 }
            if ($x -eq $CbWinX0 -or $x -eq $CbWinX1) { $col = Shade $col 0.84 }
            Set-Px $c $x $y $col
        }
    }

    $tip = if ($Active) { $CbTipY[$f] } else { $CbParkedTip }
    $top = $tip - 2

    if ($Active) {
        # ---- the borehole behind the probe: meltwater through the ice, the tether down its middle, and two bubbles rising
        for ($y = $CbWinY0; $y -lt $top; $y++) {
            if ($y -le $CbIceY1) { Set-Px $c ($CbProbeX - 1) $y $P['m']; Set-Px $c ($CbProbeX + 1) $y $P['m'] }
            Set-Px $c $CbProbeX $y $P['C']
        }
        $side = $f % 2
        $bubbles = @(
            @(($CbProbeX - 1 + 2 * $side), ($top - 1 - $side)),
            @(($CbProbeX + 1 - 2 * $side), ($top - 3 - ($f % 3)))
        )
        foreach ($bb in $bubbles) { if ($bb[1] -ge $CbWinY0) { Set-Px $c $bb[0] $bb[1] $P['b'] } }
    }

    # ---- the probe's body (two rows, lit at the left)
    for ($y = $top; $y -lt $tip; $y++) {
        Set-Px $c ($CbProbeX - 1) $y $P['B']; Set-Px $c $CbProbeX $y $P['C']; Set-Px $c ($CbProbeX + 1) $y $P['E']
    }

    if (-not $Active) {
        Set-Px $c $CbProbeX $tip $P['d']
        return @{ Color = $c; Emi = $e }
    }

    # ---- the hot melt head: the white-hot point, its halo and the melt glow under it
    Set-Both $c $e $CbProbeX $tip $P['h']
    Set-Both $c $e ($CbProbeX - 1) $tip $P['t']
    Set-Both $c $e ($CbProbeX + 1) $tip $P['t']
    if ($tip + 1 -le $CbWinY1) { Set-Both $c $e $CbProbeX ($tip + 1) $P['x'] }

    # ---- the depth gauge (one more cell a frame, the newest brightest) and the status lamp
    for ($k = 0; $k -le $f; $k++) {
        Set-Both $c $e $CbGaugeX ($CbGaugeY0 + $k) $P[$(if ($k -eq $f) { 'z' } else { 'l' })]
    }
    Set-Both $c $e $CbLamp[0] $CbLamp[1] $P['N']

    Sync-Emissive $c $e
    return @{ Color = $c; Emi = $e }
}

# Where light may come from: the head's path (the probe's three columns from the first head row to the window's bottom), the
# gauge and the lamp.
$CbGlowZone = New-Object 'System.Collections.Generic.HashSet[int]'
foreach ($ty in $CbTipY) {
    foreach ($dx in @(-1, 0, 1)) { [void]$CbGlowZone.Add($ty * 16 + $CbProbeX + $dx) }
    if ($ty + 1 -le $CbWinY1) { [void]$CbGlowZone.Add(($ty + 1) * 16 + $CbProbeX) }
}
for ($k = 0; $k -lt $CbGaugeCells; $k++) { [void]$CbGlowZone.Add(($CbGaugeY0 + $k) * 16 + $CbGaugeX) }
[void]$CbGlowZone.Add($CbLamp[1] * 16 + $CbLamp[0])
# the probe must stay inside the window, and the gauge needs a cell per frame
foreach ($ty in @($CbTipY + $CbParkedTip)) {
    if (($ty - 2) -lt $CbWinY0 -or $ty -gt $CbWinY1) { throw "cryobot head row $ty puts the probe outside the window" }
}
if ($CbTipY.Count -ne $CbGaugeCells) { throw "cryobot: $($CbTipY.Count) frames but $CbGaugeCells gauge cells" }
for ($k = 0; $k -lt $CbGaugeCells; $k++) {
    if ([string]$CbBase[$CbGaugeY0 + $k][$CbGaugeX] -ne 'y') { throw "cryobot gauge cell $k is not on a 'y' pixel of the map" }
}

# ============================================================================================
#  ALGAE BIOREACTOR - controller face (sulfur concrete)
#  the steel bezel around a dark steel plate (G); the lamp hood (y2) and the bottom manifold (y11) across x3..12; between
#  them four LED strips (L at x3, x6, x9, x12) and three glass tubes two columns wide (x4..5, x7..8, x10..11): the headspace
#  (h, y3) over the medium (t, y4..10); the control strip (recess I, y12): the grow-light indicator (4,12), the harvest bar
#  (x6..9) and the run lamp (11,12), over the lit lip (E, y13)
# ============================================================================================
#   tubes: each is a cylinder lit from the left, so the right column is a step darker
#   idle, clear medium: h k the headspace (lit, shade), t u the medium (lit, shade)
#   active, the culture: K T the headspace, U V W X Y Z the culture from the brightest (shimmer) down; b a rising bubble,
#   o a bubble bursting at the surface
#   LEDs: L a strip off; lit: f pink grow light, r warm white (every third row)
#   strip: l the grow-light indicator off (lit: f), y a harvest cell off (lit: O, the newest N), g the run lamp off (lit: N)
$AbPal = New-Pal ($SteelSpec + ' ' + $LampSpec + ' ' + @'
h=D0ECE8 k=B0D4D0 t=B8DCD6 u=98C2BE
K=A4D498 T=82B478
U=8EDC62 V=72CA48 W=5EB43C X=4C9E34 Y=3E862C Z=326E26
b=E4FFD0 o=F6FFEC
L=46384A f=FF8CC6 r=FFF0DA
l=4A2A3E y=22402C g=24502F
'@)

$AbBase = @(
    '................',
    '.CDDDDDDDDDDDDE.',
    '.DGABBBBBBBBCGF.',
    '.DGLhhLhhLhhLGF.',
    '.DGLttLttLttLGF.',
    '.DGLttLttLttLGF.',
    '.DGLttLttLttLGF.',
    '.DGLttLttLttLGF.',
    '.DGLttLttLttLGF.',
    '.DGLttLttLttLGF.',
    '.DGLttLttLttLGF.',
    '.DGBCCCCCCCCDGF.',
    '.DGIlIyyyyIgIGF.',
    '.DGEEEEEEEEEEGF.',
    '.EFFFFFFFFFFFFG.',
    '................'
)
Assert-Map 'AbBase' $AbBase

# The tubes' columns (lit, shade), the depth of each culture row in its ramp (the shade column adds a step), the LED strips,
# the strip's lamps and the harvest bar.
$AbTubes = @(@(4, 5), @(7, 8), @(10, 11))
$AbHeadY = 3; $AbCultY0 = 4; $AbCultY1 = 10
$AbCulture = 'VWXYZ'
$AbDepth = @{ 4 = 0; 5 = 0; 6 = 1; 7 = 1; 8 = 2; 9 = 2; 10 = 3 }
$AbLedX = @(3, 6, 9, 12); $AbLedY0 = 3; $AbLedY1 = 10
$AbGrowLamp = @(4, 12)
$AbRunLamp = @(11, 12)
$AbBarX0 = 6; $AbBarY = 12; $AbBarCells = 4
# Lit harvest cells per frame: one more every two frames, then a new batch.
$AbBar = @(1, 1, 2, 2, 3, 3, 4, 4)
# The bubble path in a tube (0: its lit column, 1: its shade column), a step per frame from the bottom to the surface ('b'
# rising, 'o' bursting; $null: nothing in that frame), and the frame each tube starts at, so the three are out of step.
$AbPath = @(@(0, 10, 'b'), @(0, 9, 'b'), @(1, 8, 'b'), @(1, 7, 'b'), @(0, 6, 'b'), @(0, 5, 'b'), @(1, 4, 'o'), $null)
$AbPhase = @(0, 3, 5)

function New-AlgaeBioreactorFrame {
    param([bool]$Active, [int]$T = 0)
    $c = New-Canvas; $e = New-Canvas
    $P = $AbPal
    Write-Map $c 0 0 $AbBase $P
    $f = $T % 8
    if (-not $Active) {
        # the clear medium: the map already holds the lit columns; the shade columns a step darker
        foreach ($tube in $AbTubes) {
            Set-Px $c $tube[1] $AbHeadY $P['k']
            for ($y = $AbCultY0; $y -le $AbCultY1; $y++) { Set-Px $c $tube[1] $y $P['u'] }
        }
        return @{ Color = $c; Emi = $e }
    }

    # ---- the culture: headspace, then the ramp down the tube, shade column a step darker, and a shimmer that lifts a few
    # pixels a step every frame
    foreach ($tube in $AbTubes) {
        for ($side = 0; $side -lt 2; $side++) {
            $x = $tube[$side]
            Set-Px $c $x $AbHeadY $P[$(if ($side -eq 0) { 'K' } else { 'T' })]
            for ($y = $AbCultY0; $y -le $AbCultY1; $y++) {
                $k = [Math]::Min($AbCulture.Length - 1, $AbDepth[$y] + $side)
                $tone = [string]$AbCulture[$k]
                if ((Get-Noise $x $y $T 53) -lt 56) { $tone = if ($k -eq 0) { 'U' } else { [string]$AbCulture[$k - 1] } }
                Set-Px $c $x $y $P[$tone]
            }
        }
    }

    # ---- the bubbles: each tube one step further per frame, out of step
    for ($i = 0; $i -lt $AbTubes.Count; $i++) {
        $step = $AbPath[($f + $AbPhase[$i]) % 8]
        if ($null -eq $step) { continue }
        Set-Px $c $AbTubes[$i][$step[0]] $step[1] $P[[string]$step[2]]
    }

    # ---- the LED strips: pink grow light, warm white every third row
    foreach ($x in $AbLedX) {
        for ($y = $AbLedY0; $y -le $AbLedY1; $y++) { Set-Both $c $e $x $y $P[$(if (($y % 3) -eq 0) { 'r' } else { 'f' })] }
    }

    # ---- the harvest bar (the newest cell brightest), the grow-light indicator and the run lamp
    for ($k = 0; $k -lt $AbBar[$f]; $k++) {
        Set-Both $c $e ($AbBarX0 + $k) $AbBarY $P[$(if ($k -eq ($AbBar[$f] - 1)) { 'N' } else { 'O' })]
    }
    Set-Both $c $e $AbGrowLamp[0] $AbGrowLamp[1] $P['f']
    Set-Both $c $e $AbRunLamp[0] $AbRunLamp[1] $P['N']

    Sync-Emissive $c $e
    return @{ Color = $c; Emi = $e }
}

# Where light may come from: the LED strips, the harvest bar and the two lamps (never the tubes, the culture or the steel).
$AbGlowZone = New-Object 'System.Collections.Generic.HashSet[int]'
foreach ($x in $AbLedX) { for ($y = $AbLedY0; $y -le $AbLedY1; $y++) { [void]$AbGlowZone.Add($y * 16 + $x) } }
for ($k = 0; $k -lt $AbBarCells; $k++) { [void]$AbGlowZone.Add($AbBarY * 16 + $AbBarX0 + $k) }
foreach ($l in @($AbGrowLamp, $AbRunLamp)) { [void]$AbGlowZone.Add($l[1] * 16 + $l[0]) }
# every bubble step must be inside a tube's medium, and every LED pixel on an 'L' of the map
foreach ($tube in $AbTubes) {
    foreach ($step in $AbPath) {
        if ($null -eq $step) { continue }
        $ch = [string]$AbBase[$step[1]][$tube[$step[0]]]
        if ($ch -ne 't') { throw "bubble step ($($tube[$step[0]]),$($step[1])) is outside the tube ('$ch')" }
    }
}
foreach ($x in $AbLedX) {
    for ($y = $AbLedY0; $y -le $AbLedY1; $y++) { if ([string]$AbBase[$y][$x] -ne 'L') { throw "LED ($x,$y) is not on an 'L' of the map" } }
}

# ============================================================================================
#  BUILD
# ============================================================================================
$CbDir = 'block/multiblock/cryobot'
$AbDir = 'block/multiblock/algae_bioreactor'
$FrameTime = 4
$GlowZones = @{ $CbDir = $CbGlowZone; $AbDir = $AbGlowZone }

function Out-Overlay {
    param([string]$Dir, $Builder, [int]$FrameTime)
    $frames = @(); $emis = @()
    for ($f = 0; $f -lt 8; $f++) { $r = & $Builder $true $f; $frames += $r.Color; $emis += $r.Emi }
    $idle = & $Builder $false 0
    Out-Tex $idle.Color "$Dir/overlay_front.png"
    Out-Tex (Join-Frames $frames) "$Dir/overlay_front_active.png" $FrameTime
    Out-Tex (Join-Frames $emis) "$Dir/overlay_front_active_emissive.png" $FrameTime
}

if (Test-Want 'cryobot') { Out-Overlay $CbDir ${function:New-CryobotFrame} $FrameTime }
if (Test-Want 'algae_bioreactor') { Out-Overlay $AbDir ${function:New-AlgaeBioreactorFrame} $FrameTime }

# ============================================================================================
#  VERIFY what was written: exact sizes (the idle face 16x16, the strips 16x128), binary alpha, no pure black, the .mcmeta
#  frametime, frames that really differ (each one from the next, the loop seam included, and at least 4 distinct), the empty
#  casing ring around a panel without holes, and an emissive layer inside the colour layer, lit in every frame and only
#  where the face has lights
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
        $zone = $GlowZones[$rel.Substring(0, $rel.LastIndexOf('/'))]
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

if ($problems -gt 0) { throw "$problems file(s) failed the texture checks (see the warnings above)" }

if ($Credits) {
    Write-Host ''
    foreach ($rel in $written) {
        Write-Host ("| ``pack/kubejs/assets/grindless/textures/$rel`` | Generated with tools/assets/$ScriptName (procedural pixel art, original) by the Europa agent (LuV-B8), 2026-10-26 | the pack's licence (pending; proposed CC BY-SA 4.0) |")
    }
}
