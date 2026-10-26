<#
.SYNOPSIS
  Procedural 16x16 pixel art for the controller faces of the LuV asteroid belt machines (LuV-B5) of Gregtech Grindless
  (GregTech style: bevels, top-left light, every pixel fully opaque or fully transparent).

.DESCRIPTION
  Every pixel is drawn by this script (palettes + a char map + small routines); nothing is copied or edited from GregTech
  Modern or any other mod. Output is deterministic: re-running overwrites the same bytes (shimmer and glints come from
  Get-Noise, a hash of position and frame, not from a random generator). Same method, steel bezel and lamp ramp as the HTS
  magnet works (Build-HTSMagnetWorksTextures.ps1), whose helpers are copied so that script stays untouched, and the same
  checks: no frame repeats the next one, no hole inside the panel, and light only where the face has lights.

  Writes (under pack/kubejs/assets/grindless/textures/), for each of
  block/multiblock/harpoon_anchor_drill/, block/multiblock/asteroid_processor/ and block/multiblock/optical_miner/:
    overlay_front.png, overlay_front_active.png(+.mcmeta), overlay_front_active_emissive.png(+.mcmeta)

  harpoon_anchor_drill (gtceu:harpoon_anchor_drill, on grindless:block/luv/asteroid_regolith_casing): the low spider rig seen
  from the front. A three-jaw chuck holds the drill bit, which runs down to a carbide tip; on each side a harpoon gun barrel
  with its barbed harpoon fired into the rock, and under the bit a four-cell depth bar between the run (green) and anchor (cyan)
  lamps. 8 frames, frametime 4: the chuck's jaws turn round it and the flutes spiral down the bit, the tip glows hot, the depth
  bar fills a cell every two frames and both lamps are lit. Idle: the chuck still, the tip cold, the bar empty, lamps dark.
  The *_emissive layer holds only the tip, the lit bar cells and the two lamps.

  asteroid_processor (gtceu:asteroid_processor, on gtceu:block/casings/solid/machine_casing_solid_steel): the Mond carbonyl
  column's panel. A pressure gauge and a red valve wheel at the top, a sight glass on the carbonyl gas line, the decomposer's
  heater coil under it, and a horseshoe magnet (the magnetic separator) between the run (green) and heater (amber) lamps.
  8 frames, frametime 4: the needle trembles high on the dial, pulses of gas run right along the sight glass, the coil glows
  and shimmers, a fleck of metal hops between the magnet's poles and both lamps are lit. Idle: the needle at rest low on the
  dial, the glass dark, the coil cold, the lamps dark.
  The *_emissive layer holds only the gas line, the heater coil and the two lamps.

  optical_miner (gtceu:optical_miner, on grindless:block/luv/asteroid_regolith_casing): concentrated sunlight on a bagged
  boulder. A lens at the top; under it a gold Kapton bag holding a rough boulder, with a clear film window on top; to the right
  the cold trap's frosted tube, piped to the bag; the run (green) and cold trap (cyan) lamps below. 8 frames, frametime 4:
  the lens glows with sunlight, two rays converge through the film onto the boulder with a glint running down each, the focus
  is white-hot over an orange-hot spot that breathes, frost glints on the cold trap and both lamps are lit. Idle: the lens
  pale and dim, no rays, the boulder cold, the lamps dark.
  The *_emissive layer holds only the lens, the rays, the film, the focus and the two lamps.

  Run from the repo root (PowerShell 5.1 blocks unsigned scripts by default; this bypass only affects that process):
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-AsteroidBeltTextures.ps1
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-AsteroidBeltTextures.ps1 -Only drill,processor,miner -Credits
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-AsteroidBeltTextures.ps1 -Preview C:\path\belt-preview.png

  Overlay conventions (GTM's workable casings, as every other set): transparent background, details only on the overlay,
  animated variants are vertical 16x(16*n) strips with a .png.mcmeta, *_emissive layers hold only the pixels that glow
  (identical to the colour layer). Every pixel is fully opaque or fully transparent and none is pure black. The outer 1 px
  ring is always left empty so the casing shows around the face; each face has its own dark steel frame, so it reads on the
  dark brown regolith brick and on GTM's light steel casing alike. The final check fails the run (non-zero exit) if a written
  file breaks one of these rules.

.PARAMETER Only
  Subset of: drill, processor, miner (comma-separated, also as one string with -File). Default: everything.
.PARAMETER OutRoot
  Textures root. Default: <repo>/pack/kubejs/assets/grindless/textures
.PARAMETER Preview
  Also write a review sheet to this PNG, which must be outside the repository (it is never shipped). The sheet is x8, nearest
  neighbour. One row per face on its casing (the regolith brick from the repository; a stand-in plate for GTM's solid steel
  casing, which is not in the repository): idle, every active frame with its emissive layer, and a dark-room view; then a row
  with the emissive layers alone; last, a 3x3 wall of each face, idle and working, at x2.
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
$Known = @('drill', 'processor', 'miner')
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

# Deterministic 0..255 hash of (x, y, frame, salt): shimmer without a random generator.
function Get-Noise {
    param([long]$X, [long]$Y, [long]$T = 0, [long]$Salt = 0)
    $h = (($X * 73856093L) -bxor ($Y * 19349663L) -bxor ($T * 83492791L) -bxor ($Salt * 2654435761L)) % 1000003L
    if ($h -lt 0) { $h = -$h }
    return [int](($h * 7919L) % 256L)
}

# Picks a tone from a ramp string ('1234' = lit -> deep), clamped to the ramp.
function Get-Tone {
    param($Pal, [string]$Ramp, [int]$Index)
    return $Pal[[string]$Ramp[(Get-ClampInt $Index 0 ($Ramp.Length - 1))]]
}

function Add-Zone {
    param($Zone, [int]$X, [int]$Y)
    [void]$Zone.Add($Y * 16 + $X)
}

# Ramps shared with the earlier sets: neutral steel (lit -> dark) and the state lamp (green M..P, red Q..S).
$SteelSpec = 'A=D3D3D3 B=B0B0B0 C=8E8E8E D=707070 E=565656 F=404040 G=2F2F2F H=222222 I=161616 J=0D0D0D'
$LampSpec = 'M=E2FFE4 N=62FF86 O=22C257 P=0C6B2E Q=FF5A48 R=B52D22 S=5E1511'

# ============================================================================================
#  HARPOON ANCHOR DRILL - controller face (the asteroid regolith brick)
#  two harpoon gun barrels (x2..3 and x12..13, y3..8) with their muzzles (y9) and barbed harpoons (y10..11, points inward);
#  the chuck (x5..10 y3..8, corners cut) round the bit's centre (x7..8 y5..6); the drill bit (x7..8 y9..11) and its carbide
#  tip (y12); the depth bar (x6..9 y13) between the run (3,13) and anchor (12,13) lamps
# ============================================================================================
#   barrels (dark HSS-S): t lit, v shaded, w muzzle
#   harpoons (tungsten carbide): h lit, i shaded
#   chuck: a lit rim (top, left), b face, c shaded rim (right, bottom), j jaw; bit centre z lit, y shaded
#   bit: k lit flute, l shaded flute, x groove; m tip at rest (working, it glows 1..4)
#   depth bar: d cell off (lit: X); lamps: n run off (lit: N), o anchor off (lit: W)
$HdSpec = @'
t=7C7790 v=4E4A5E w=2A2833
h=C7CBD3 i=767A84
a=CDD1D7 b=959AA2 c=5C6068 j=373A40 z=E4E8EC y=4C5056
k=AEB3BA l=6A6F77 x=3A3E45 m=8B8F98
d=27303A X=B9F4FF
n=1E4029 o=1C3A44 W=6EE8FF
1=FFF6D2 2=FFD27A 3=FF9C34 4=CF5A1C
'@
$HdPal = New-Pal ($SteelSpec + ' ' + $LampSpec + ' ' + $HdSpec)
$HdBase = @(
    '................',
    '.CDDDDDDDDDDDDE.',
    '.DGGGGGGGGGGGGF.',
    '.DtvGGaaaaGGtvF.',
    '.DtvGabbbbcGtvF.',
    '.DtvGabzzbcGtvF.',
    '.DtvGabzybcGtvF.',
    '.DtvGabbbbcGtvF.',
    '.DtvGGccccGGtvF.',
    '.DwwGGGklGGGwwF.',
    '.DhiGGGklGGGihF.',
    '.DGhGGGklGGGhGF.',
    '.DGGGGGmmGGGGGF.',
    '.DGnGHddddHGoGF.',
    '.EFFFFFFFFFFFFG.',
    '................'
)
Assert-Map 'HdBase' $HdBase

# The chuck's face round the bit centre, clockwise from its top-left corner (12 pixels); three jaws sit 4 pixels apart.
$HdJawRing = @(@(6, 4), @(7, 4), @(8, 4), @(9, 4), @(9, 5), @(9, 6), @(9, 7), @(8, 7), @(7, 7), @(6, 7), @(6, 6), @(6, 5))
$HdTip = @(@(7, 12), @(8, 12))
$HdBar = @(@(6, 13), @(7, 13), @(8, 13), @(9, 13))
$HdRunLamp = @(3, 13); $HdAnchorLamp = @(12, 13)

function New-HarpoonDrillFrame {
    param([bool]$Active, [int]$T = 0)
    $c = New-Canvas; $e = New-Canvas
    $P = $HdPal
    Write-Map $c 0 0 $HdBase $P
    $f = $T % 8
    # the chuck turns one pixel a frame (a jaw takes the next one's place every 4 frames: the loop has no jump)
    $turn = if ($Active) { $f % 4 } else { 0 }
    foreach ($k in @(0, 4, 8)) { $px = $HdJawRing[($k + $turn) % 12]; Set-Px $c $px[0] $px[1] $P['j'] }
    # the flutes: a groove that zigzags down the bit and runs downward while it turns
    $phase = if ($Active) { $f } else { 0 }
    for ($y = 9; $y -le 11; $y++) {
        if ((($y + $phase) % 2) -eq 0) { Set-Px $c 7 $y $P['x']; Set-Px $c 8 $y $P['l'] }
        else { Set-Px $c 7 $y $P['k']; Set-Px $c 8 $y $P['x'] }
    }
    if (-not $Active) { return @{ Color = $c; Emi = $e } }

    # ---- the tip: hot from cutting, shimmering between white-hot and orange
    for ($i = 0; $i -lt $HdTip.Count; $i++) {
        $px = $HdTip[$i]
        $n = Get-Noise $px[0] $px[1] $T 41
        Set-Both $c $e $px[0] $px[1] (Get-Tone $P '1234' ($i + ($n % 3)))
    }
    # ---- the depth bar: one cell more every two frames
    $cells = 1 + [int][Math]::Floor($f / 2)
    for ($i = 0; $i -lt $cells; $i++) { Set-Both $c $e $HdBar[$i][0] $HdBar[$i][1] $P['X'] }
    # ---- the lamps: run and anchor (the harpoons hold) lit while working
    Set-Both $c $e $HdRunLamp[0] $HdRunLamp[1] $P['N']
    Set-Both $c $e $HdAnchorLamp[0] $HdAnchorLamp[1] $P['W']

    Sync-Emissive $c $e
    return @{ Color = $c; Emi = $e }
}

$HdGlowZone = New-Object 'System.Collections.Generic.HashSet[int]'
foreach ($px in ($HdTip + $HdBar)) { Add-Zone $HdGlowZone $px[0] $px[1] }
foreach ($l in @($HdRunLamp, $HdAnchorLamp)) { Add-Zone $HdGlowZone $l[0] $l[1] }

# ============================================================================================
#  ASTEROID PROCESSOR - controller face (GTM's solid steel machine casing)
#  the pressure gauge (x3..7 y3..7, hub 5,5), the valve wheel (x9..13 y3..7, hub 11,5), the gas line's sight glass (x3..12
#  y8), the decomposer's heater coil (x3..12 y9), the horseshoe magnet (x6..9 y10..12, poles at y10) between the run (3,12)
#  and heater (12,12) lamps
# ============================================================================================
#   gauge: g dial, h hub, k needle (rim from the steel ramp: B lit, D shaded)
#   valve wheel: w lit rim (top, left), x shaded rim (right, bottom), s spokes
#   gas line: q dark glass (working, gas pulses 5..7); heater: u, v coil turns at rest (working, they glow 1..4)
#   magnet: m lit red, r shaded red, t silver poles; f a fleck of nickel
#   lamps: n run off (lit: N), L heater off (lit: K)
$PrSpec = @'
g=ECE6CF h=3A3836 k=C62C1F
w=E0473A x=8E2219 s=A9ADB2
q=1C262C u=4E3427 v=35251C
m=D8402F r=8B1F16 t=D9DDE2 f=BFC4C9
n=1E4029 L=4A3416 K=FFB43A
1=FFF1B8 2=FFC24C 3=F07D22 4=B4440F
5=EAF8FF 6=A9D6EA 7=5E8EA4
'@
$PrPal = New-Pal ($SteelSpec + ' ' + $LampSpec + ' ' + $PrSpec)
$PrBase = @(
    '................',
    '.CDDDDDDDDDDDDE.',
    '.DGGGGGGGGGGGGF.',
    '.DGGBBBGGGwwwGF.',
    '.DGBgggDGwGsGxF.',
    '.DGBghgDGwshsxF.',
    '.DGBgggDGwGsGxF.',
    '.DGGDDDGGGxxxGF.',
    '.DGqqqqqqqqqqGF.',
    '.DGuvuvuvuvuvGF.',
    '.DGGGGtGGtGGGGF.',
    '.DGGGGmGGrGGGGF.',
    '.DGnGGmmrrGGLGF.',
    '.DGGGGGGGGGGGGF.',
    '.EFFFFFFFFFFFFG.',
    '................'
)
Assert-Map 'PrBase' $PrBase

$PrNeedleIdle = @(4, 6)
# working, the needle trembles high on the dial
$PrNeedle = @(@(5, 4), @(6, 4), @(6, 5), @(6, 4))
# the fleck of nickel hops between the poles
$PrFleck = @(@(7, 10), @(8, 10), @(8, 11), @(7, 11))
$PrGasY = 8; $PrHeatY = 9; $PrX0 = 3; $PrX1 = 12
$PrRunLamp = @(3, 12); $PrHeatLamp = @(12, 12)

function New-AsteroidProcessorFrame {
    param([bool]$Active, [int]$T = 0)
    $c = New-Canvas; $e = New-Canvas
    $P = $PrPal
    Write-Map $c 0 0 $PrBase $P
    $f = $T % 8
    if (-not $Active) {
        Set-Px $c $PrNeedleIdle[0] $PrNeedleIdle[1] $P['k']
        return @{ Color = $c; Emi = $e }
    }

    # ---- the gauge and the magnet: the needle high and trembling, a fleck of metal between the poles
    $nd = $PrNeedle[$f % 4]; Set-Px $c $nd[0] $nd[1] $P['k']
    $fl = $PrFleck[$f % 4]; Set-Px $c $fl[0] $fl[1] $P['f']

    # ---- the gas line: pulses of carbonyl gas running right, one pixel a frame, four apart (the loop has no jump)
    for ($x = $PrX0; $x -le $PrX1; $x++) {
        $d = ((($x - $PrX0) - $f) % 4 + 4) % 4
        $tone = if ($d -eq 0) { 0 } elseif ($d -eq 3) { 1 } else { 2 }
        Set-Both $c $e $x $PrGasY (Get-Tone $P '567' $tone)
    }
    # ---- the heater coil: alternate turns a step apart, shimmering
    for ($x = $PrX0; $x -le $PrX1; $x++) {
        $tone = 1 + (($x - $PrX0) % 2)
        $n = Get-Noise $x $PrHeatY $T 23
        if ($n -lt 60) { $tone-- } elseif ($n -gt 205) { $tone++ }
        Set-Both $c $e $x $PrHeatY (Get-Tone $P '1234' $tone)
    }
    # ---- the lamps: run and heater lit while working
    Set-Both $c $e $PrRunLamp[0] $PrRunLamp[1] $P['N']
    Set-Both $c $e $PrHeatLamp[0] $PrHeatLamp[1] $P['K']

    Sync-Emissive $c $e
    return @{ Color = $c; Emi = $e }
}

$PrGlowZone = New-Object 'System.Collections.Generic.HashSet[int]'
for ($x = $PrX0; $x -le $PrX1; $x++) { Add-Zone $PrGlowZone $x $PrGasY; Add-Zone $PrGlowZone $x $PrHeatY }
foreach ($l in @($PrRunLamp, $PrHeatLamp)) { Add-Zone $PrGlowZone $l[0] $l[1] }

# ============================================================================================
#  OPTICAL MINER - controller face (the asteroid regolith brick)
#  the lens (x4..11 y3..5), the two rays (y6..8) converging through the bag's film window (x7..8 y9) onto the boulder's focus
#  (x7..8 y10..11); the gold bag (x5..10 y9..13) round the boulder; the cold trap (x12..13 y5..12) piped to the bag at
#  (11,11); the run (3,13) and cold trap (12,13) lamps
# ============================================================================================
#   lens: e lit rim, l glint, f body, i shaded rim (working, the body and glint glow 1..2)
#   bag (gold Kapton): b lit, c shaded, g clear film window (working, it carries the rays)
#   boulder: k lit rock, o shaded rock, j bag interior (working, the focus glows 1..5)
#   cold trap: p frosted lit side, s shaded side, y frost glint
#   lamps: n run off (lit: N), w cold trap off (lit: W)
$OmSpec = @'
e=DDF2FF l=F5FBFF f=9CC8E0 i=5F8CA8
b=E8B84A c=9A6A22 g=E3DDC6
k=7C7066 o=4C443D j=2B2521
p=D2E8F4 s=8DAEC3 y=F7FDFF
n=1E4029 w=1C3A44 W=6EE8FF
1=FFFFF2 2=FFF3A6 3=FFD452 4=F59A2E 5=C2611C
'@
$OmPal = New-Pal ($SteelSpec + ' ' + $LampSpec + ' ' + $OmSpec)
$OmBase = @(
    '................',
    '.CDDDDDDDDDDDDE.',
    '.DGGGGGGGGGGGGF.',
    '.DGGGeeeeeeGGGF.',
    '.DGGelfffffiGGF.',
    '.DGGGiiiiiiGBDF.',
    '.DGGGGGGGGGGpsF.',
    '.DGGGGGGGGGGpsF.',
    '.DGGGGGGGGGGpsF.',
    '.DGGGGbggbGGpsF.',
    '.DGGGbjkkjcGpsF.',
    '.DGGGbkkkocEpsF.',
    '.DGGGbjoojcGDEF.',
    '.DGnGGccccGGwGF.',
    '.EFFFFFFFFFFFFG.',
    '................'
)
Assert-Map 'OmBase' $OmBase

# Each ray from the lens down to the film window (the last pixel); a glint runs down both, one pixel a frame.
$OmRayL = @(@(5, 6), @(6, 7), @(7, 8), @(7, 9))
$OmRayR = @(@(10, 6), @(9, 7), @(8, 8), @(8, 9))
$OmLens = @(@(6, 4), @(7, 4), @(8, 4), @(9, 4), @(10, 4))
$OmGlint = @(5, 4)
$OmFocus = @(@(7, 10), @(8, 10))
$OmHot = @(@(7, 11), @(8, 11))
# the focus breathes (negative = brighter)
$OmBreath = @(0, -1, -1, 0, 0, 1, 1, 0)
$OmTrap = @(); for ($y = 6; $y -le 11; $y++) { $OmTrap += , @(12, $y) }
$OmRunLamp = @(3, 13); $OmColdLamp = @(12, 13)

function New-OpticalMinerFrame {
    param([bool]$Active, [int]$T = 0)
    $c = New-Canvas; $e = New-Canvas
    $P = $OmPal
    Write-Map $c 0 0 $OmBase $P
    if (-not $Active) { return @{ Color = $c; Emi = $e } }
    $f = $T % 8
    $sun = '12345'

    # ---- frost glints on the cold trap: at most one a frame
    $n = Get-Noise $f 7 $T 61
    $spark = $OmTrap[$n % $OmTrap.Count]
    if ($n -lt 190) { Set-Px $c $spark[0] $spark[1] $P['y'] }

    # ---- the lens: full of sunlight, shimmering
    Set-Both $c $e $OmGlint[0] $OmGlint[1] $P['1']
    foreach ($px in $OmLens) {
        $tone = [int]((Get-Noise $px[0] $px[1] $T 67) -gt 170)
        Set-Both $c $e $px[0] $px[1] (Get-Tone $P $sun $tone)
    }
    # ---- the rays: pale sunlight (paler than the gold bag), a white glint running down each one
    $g = $f % 4
    foreach ($ray in @($OmRayL, $OmRayR)) {
        for ($k = 0; $k -lt $ray.Count; $k++) {
            $tone = if ($k -eq $g) { 0 } else { 1 }
            Set-Both $c $e $ray[$k][0] $ray[$k][1] (Get-Tone $P $sun $tone)
        }
    }
    # ---- the focus: white-hot where the rays meet, an orange-hot spot under it, breathing
    foreach ($px in $OmFocus) { Set-Both $c $e $px[0] $px[1] (Get-Tone $P $sun (1 + $OmBreath[$f])) }
    foreach ($px in $OmHot) { Set-Both $c $e $px[0] $px[1] (Get-Tone $P $sun (3 + $OmBreath[$f])) }
    # ---- the lamps: run and cold trap lit while working
    Set-Both $c $e $OmRunLamp[0] $OmRunLamp[1] $P['N']
    Set-Both $c $e $OmColdLamp[0] $OmColdLamp[1] $P['W']

    Sync-Emissive $c $e
    return @{ Color = $c; Emi = $e }
}

$OmGlowZone = New-Object 'System.Collections.Generic.HashSet[int]'
foreach ($px in ($OmRayL + $OmRayR + $OmLens + $OmFocus + $OmHot)) { Add-Zone $OmGlowZone $px[0] $px[1] }
foreach ($l in @($OmGlint, $OmRunLamp, $OmColdLamp)) { Add-Zone $OmGlowZone $l[0] $l[1] }

# ============================================================================================
#  BUILD
# ============================================================================================
$HdDir = 'block/multiblock/harpoon_anchor_drill'
$PrDir = 'block/multiblock/asteroid_processor'
$OmDir = 'block/multiblock/optical_miner'
$FrameTime = 4
$GlowZones = @{}
$GlowZones[$HdDir] = $HdGlowZone
$GlowZones[$PrDir] = $PrGlowZone
$GlowZones[$OmDir] = $OmGlowZone

function Out-Overlay {
    param([string]$Dir, $Builder, [int]$FrameTime)
    $frames = @(); $emis = @()
    for ($f = 0; $f -lt 8; $f++) { $r = & $Builder $true $f; $frames += $r.Color; $emis += $r.Emi }
    $idle = & $Builder $false 0
    Out-Tex $idle.Color "$Dir/overlay_front.png"
    Out-Tex (Join-Frames $frames) "$Dir/overlay_front_active.png" $FrameTime
    Out-Tex (Join-Frames $emis) "$Dir/overlay_front_active_emissive.png" $FrameTime
}

if (Test-Want 'drill') { Out-Overlay $HdDir ${function:New-HarpoonDrillFrame} $FrameTime }
if (Test-Want 'processor') { Out-Overlay $PrDir ${function:New-AsteroidProcessorFrame} $FrameTime }
if (Test-Want 'miner') { Out-Overlay $OmDir ${function:New-OpticalMinerFrame} $FrameTime }

# ============================================================================================
#  VERIFY what was written: exact sizes (the idle face 16x16, the strips 16x128), binary alpha, no pure black, the .mcmeta
#  frametime, frames that really differ (each one from the next, the loop seam included, and at least 4 distinct), the empty
#  casing ring around a panel without holes, and an emissive layer inside the colour layer, lit in every frame and only where
#  the face has lights
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
    # a flat plate with a soft bevel (lit top and left edges, shaded bottom and right): the solid steel casing's stand-in
    function New-StandInPlate {
        param([string]$Spec)
        $pal = New-Pal $Spec
        $c = New-Canvas
        for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
            $ch = 'c'
            if ($x -eq 0 -or $y -eq 0) { $ch = 'a' }
            elseif ($x -eq 15 -or $y -eq 15) { $ch = 'e' }
            elseif ($x -eq 1 -or $y -eq 1) { $ch = 'b' }
            elseif ($x -eq 14 -or $y -eq 14) { $ch = 'd' }
            $c.P[$y * 16 + $x] = $pal[$ch]
        } }
        return $c
    }
    function Get-Frame { param($Strip, [int]$Index) $f = New-Canvas 16 16; [Array]::Copy($Strip.P, $Index * 256, $f.P, 0, 256); return $f }
    function Merge-On { param($Dst, $Src) $o = Copy-Canvas $Dst; Merge-Canvas $o $Src; return $o }
    function Get-Dimmed { param($C, [double]$K) $o = Copy-Canvas $C; for ($i = 0; $i -lt $o.P.Length; $i++) { if ($o.P[$i] -ne 0) { $o.P[$i] = Shade $o.P[$i] $K } }; return $o }
    # the casing and the colour layer at a quarter of their light, the emissive layer at full light: a dark room
    function Get-Dark { param($Base, $Col, $Emi) return (Merge-On (Get-Dimmed (Merge-On $Base $Col) 0.25) $Emi) }
    function New-Wall {
        param($Casing, $Face)
        $w = New-Canvas 48 48
        for ($j = 0; $j -lt 3; $j++) { for ($i = 0; $i -lt 3; $i++) { Merge-Canvas $w $Casing (16 * $i) (16 * $j) } }
        Merge-Canvas $w $Face 16 16
        return $w
    }
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

    $regolith = Read-Png (Join-Path $OutRoot 'block\luv\asteroid_regolith_casing.png')
    $steel = New-StandInPlate 'a=C4C7CA b=B4B8BC c=A3A7AB d=8A8E92 e=6E7276'
    $night = New-Canvas
    for ($i = 0; $i -lt 256; $i++) { $night.P[$i] = Hex '0A0B0D' }
    $faces = @(@($HdDir, $regolith), @($PrDir, $steel), @($OmDir, $regolith))

    $k = 8; $gap = 16; $cell = 16 * $k + $gap
    $sheet = New-Canvas ($gap + 10 * $cell) ($gap + 4 * $cell + 48 * 2 + $gap)
    $bgRow = New-Object 'int[]' $sheet.W
    $bg = Hex '1E2126'
    for ($i = 0; $i -lt $sheet.W; $i++) { $bgRow[$i] = $bg }
    for ($y = 0; $y -lt $sheet.H; $y++) { [Array]::Copy($bgRow, 0, $sheet.P, $y * $sheet.W, $sheet.W) }

    $r = 0
    foreach ($fc in $faces) {
        $dir = Join-Path $OutRoot ($fc[0] -replace '/', '\')
        if (-not (Test-Path -LiteralPath (Join-Path $dir 'overlay_front.png'))) { $r++; continue }
        $cs = $fc[1]
        $idle = Read-Png (Join-Path $dir 'overlay_front.png')
        $act = Read-Png (Join-Path $dir 'overlay_front_active.png')
        $emi = Read-Png (Join-Path $dir 'overlay_front_active_emissive.png')
        $y0 = $gap + $r * $cell
        Add-Blit $sheet (Merge-On $cs $idle) $gap $y0 $k
        for ($f = 0; $f -lt 8; $f++) { Add-Blit $sheet (Merge-On $cs (Merge-On (Get-Frame $act $f) (Get-Frame $emi $f))) ($gap + (1 + $f) * $cell) $y0 $k }
        Add-Blit $sheet (Get-Dark $cs (Get-Frame $act 0) (Get-Frame $emi 0)) ($gap + 9 * $cell) $y0 $k
        # row 4: the emissive layers alone, frame 0 of each face
        Add-Blit $sheet (Merge-On $night (Get-Frame $emi 0)) ($gap + $r * $cell) ($gap + 3 * $cell) $k
        # last row: a 3x3 wall, idle and working, at x2
        $wx = $gap + $r * (2 * 96 + 2 * $gap)
        $wy = $gap + 4 * $cell
        Add-Blit $sheet (New-Wall $cs $idle) $wx $wy 2
        Add-Blit $sheet (New-Wall $cs (Merge-On (Get-Frame $act 0) (Get-Frame $emi 0))) ($wx + 96 + $gap) $wy 2
        $r++
    }

    $pdir = Split-Path -Parent $Preview
    if ($pdir -and -not (Test-Path -LiteralPath $pdir)) { New-Item -ItemType Directory -Force -Path $pdir | Out-Null }
    $bmp = ConvertTo-Bitmap $sheet
    try { $bmp.Save($Preview, [System.Drawing.Imaging.ImageFormat]::Png) } finally { $bmp.Dispose() }
    Write-Host "preview: $Preview (x$k; each face on its casing: idle, 8 working frames, dark room; the emissive layers alone; 3x3 walls at x2)"
}

if ($problems -gt 0) { throw "$problems file(s) failed the texture checks (see the warnings above)" }

if ($Credits) {
    Write-Host ''
    foreach ($rel in $written) {
        Write-Host ("| ``pack/kubejs/assets/grindless/textures/$rel`` | Generated with tools/assets/$ScriptName (procedural pixel art, original) by the asteroid belt agent (LuV-B5), 2026-10-26 | the pack's licence (pending; proposed CC BY-SA 4.0) |")
    }
}
