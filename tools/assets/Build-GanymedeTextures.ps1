<#
.SYNOPSIS
  Procedural 16x16 pixel art for the two controller faces of LuV's Ganymede package (LuV-B9) of Gregtech Grindless: the
  Gravitational Wave Detector and the Coilgun Launcher (GregTech style: bevels, top-left light, every pixel fully opaque or
  fully transparent).

.DESCRIPTION
  Every pixel is drawn by this script (palettes + char maps + small routines); nothing is copied or edited from GregTech Modern
  or any other mod. Output is deterministic: re-running overwrites the same bytes (the detector's baseline noise comes from
  Get-Noise, a hash of position and frame, not from a random generator). Same method, steel bezel, lamp ramp and checks as the
  LuV-A3 faces (Build-LuVCryogenicsTextures.ps1, Build-HTSMagnetWorksTextures.ps1); the helpers are copied so the other
  scripts stay untouched.

  Writes (under pack/kubejs/assets/grindless/textures/):
    block/multiblock/gravitational_wave_detector/overlay_front.png, overlay_front_active.png(+.mcmeta),
      overlay_front_active_emissive.png(+.mcmeta)
    block/multiblock/coilgun_launcher/...  (same three)

  gravitational_wave_detector (gtceu:gravitational_wave_detector, on GTM's frost-proof casing): a laser interferometer's readout.
  An L of two equal beam lines meets at the beam splitter in the lower left: the laser feeds it from the left, one arm runs up
  to a sapphire test mass at the top, the other runs right to a second test mass, and the photodetector sits under the
  splitter, at the dark port. Inside the L, a small strain display (dark glass, recessed). Under the right arm, the event lamp
  (amber) and the run lamp (green). 8 frames, frametime 3: the arms hold the laser light (a brighter glint runs from the
  splitter to both test masses), and the display sweeps a chirp from left to right: a small, slow wiggle that grows and
  quickens into the merger's peak and rings down (GW150914's 35 -> 250 Hz chirp, drawn at the display's eight columns). At the
  merger the peak flashes white and the event lamp lights; then the trace fades to an afterglow. The photodetector's
  brightness follows the trace at the sweep head. Idle: grey vacuum tubes, a dull splitter, a dark laser and photodetector, a
  flat dim baseline and both lamps dark.

  coilgun_launcher (gtceu:coilgun_launcher, on GTM's robust tungstensteel casing): the launcher's breech, seen down the barrel.
  A round dark bore, ringed by four coil windings that alternate copper and superconductor (the far ones smaller and a step
  darker, as the barrel recedes); a rivet in each top corner, the run lamp in the lower left corner and the capacitor bank's
  three-step charge indicator (amber) in the lower right one. 8 frames, frametime 2: a shot. The coils energise one after the
  other from the outer ring to the bore (blue-white, the ring behind each one fading), the bore flashes as the slug passes
  and fades; the charge indicator drains as the shot fires and refills over the last frames, all three cells brighter once
  full. The run lamp is lit. Idle: cold copper and superconductor rings, a dark bore, the charge indicator and the lamp dark.

  The *_emissive layers only hold the beam lines, the splitter, the laser, the photodetector, the display's trace and the lit
  lamps (detector); and the energised rings, the bore's flash, the charge cells and the run lamp (launcher). The test masses,
  the coils at rest, the rivets and the steel never glow.

  Run from the repo root (PowerShell 5.1 blocks unsigned scripts by default; this bypass only affects that process):
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-GanymedeTextures.ps1
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-GanymedeTextures.ps1 -Only detector -Credits
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-GanymedeTextures.ps1 -Preview C:\path\luv-b9.png -FrostCasing C:\path\machine_casing_frost_proof.png -TungstenCasing C:\path\machine_casing_robust_tungstensteel.png

  Overlay conventions (GTM's workable casings, as every other set): transparent background, details only on the overlay,
  animated variants are vertical 16x(16*n) strips with a .png.mcmeta, *_emissive layers hold only the pixels that glow
  (identical to the colour layer). Every pixel is fully opaque or fully transparent and none is pure black. The outer 1 px ring
  is always left empty so the casing shows around the face. Drawn for gtceu:block/casings/solid/machine_casing_frost_proof (the
  detector; GTM's pale icy-blue aluminium bricks) and gtceu:block/casings/solid/machine_casing_robust_tungstensteel (the
  launcher; a dark blue-grey plate); each face has its own dark frame inside a light steel bezel, so it also reads on other
  casings. The final check fails the run (non-zero exit) if a written file breaks one of these rules, if a frame repeats the
  next one, if the panel has a hole, or if light comes from anywhere but the face's lights.

.PARAMETER Only
  Subset of: detector (gravitational_wave_detector), launcher (coilgun_launcher); comma-separated, also as one string with
  -File. Default: both.
.PARAMETER OutRoot
  Textures root. Default: <repo>/pack/kubejs/assets/grindless/textures
.PARAMETER Preview
  Also write a review sheet (x8, nearest neighbour) to this PNG, which must be outside the repository (it is never shipped). Per
  face, three rows: on its own casing, the idle face, the 8 working frames with their emissive layer and a dark room, then idle
  and working on the other face's casing and on a dark plate; the raw colour layers on a checker (transparency check); the
  emissive layer alone, on black. Then one row with each face working next to the existing faces nearest to it (read from
  OutRoot), and 3x3 walls of each face's casing, idle and working, at x4 and x1.
.PARAMETER FrostCasing
  Optional 16x16 PNG used as the detector's casing in the preview (GTM's machine_casing_frost_proof.png, extracted from the jar
  and kept outside the repository). Without it an icy-blue stand-in drawn by code is used. Context only: never written
  anywhere.
.PARAMETER TungstenCasing
  The same for the launcher (GTM's machine_casing_robust_tungstensteel.png); without it a dark blue-grey stand-in is used.
.PARAMETER Credits
  Also print the CREDITS.md "Assets" table rows for the files written.
#>
[CmdletBinding()]
param(
    [string]$OutRoot = '',
    [string[]]$Only = @(),
    [string]$Preview = '',
    [string]$FrostCasing = '',
    [string]$TungstenCasing = '',
    [switch]$Credits
)
$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'Pixel.Lib.ps1')

# `powershell -File ... -Only a,b` delivers "a,b" as one string: split it so both calling styles work.
$Only = @($Only | ForEach-Object { $_ -split '[,;\s]+' } | Where-Object { $_ })
$Known = @('detector', 'launcher')
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
if ($FrostCasing) {
    $FrostCasing = $ExecutionContext.SessionState.Path.GetUnresolvedProviderPathFromPSPath($FrostCasing)
    if (-not (Test-Path -LiteralPath $FrostCasing)) { throw "-FrostCasing not found: $FrostCasing" }
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
#  GRAVITATIONAL WAVE DETECTOR - controller face (GTM's frost-proof machine casing)
#  a laser interferometer: the beam splitter (3,12) fed by the laser (2,12); the arms run up (x3, y3..11) to a sapphire test
#  mass (x2..4, y2) and right (y12, x4..12) to the other (x13, y11..13); the photodetector (3,13) under the splitter; the strain
#  display inside the L (rims: top y2 and left x5 in shadow, bottom y10 lit; glass x6..13 y3..9, baseline y6); the event
#  (9,13) and run (11,13) lamps under the right arm
# ============================================================================================
#   test masses (polished sapphire), lit -> dark: o p q
#   arms (vacuum tubes) at rest: l; splitter glass: u; laser housing: r; photodetector: m
#   display: v glass, g the dim baseline (the trace at rest)
#   lamps: k event off (lit: 7), n run off (lit: N)
# The laser's light, white-hot -> deep red (1..5); the display's trace, white -> deep amber (6..9).
$LaserSpec = '1=FFE6E0 2=FF8A72 3=E8483A 4=A82A22 5=6A1A16'
$TraceSpec = '6=FFF4D6 7=FFC867 8=E68A2E 9=9C561C'
$GwCommonSpec = @'
o=B4DCFF p=5E9EE2 q=3462A2
l=7A8794 u=C4DCE6 r=6A2A24 m=3C3048
v=12222A g=2F5B55
k=4A3414 n=1E4029
'@
$GwPal = New-Pal ($SteelSpec + ' ' + $LampSpec + ' ' + $LaserSpec + ' ' + $TraceSpec + ' ' + $GwCommonSpec)

# The whole idle face: bezel, test masses, arms, splitter, laser, photodetector, display and lamps. The working frames draw
# the same map and paint the light and the trace over it.
$GwBase = @(
    '................',
    '.CDDDDDDDDDDDDE.',
    '.DopqIIIIIIIIIF.',
    '.DGlGIvvvvvvvvF.',
    '.DGlGIvvvvvvvvF.',
    '.DGlGIvvvvvvvvF.',
    '.DGlGIggggggggF.',
    '.DGlGIvvvvvvvvF.',
    '.DGlGIvvvvvvvvF.',
    '.DGlGIvvvvvvvvF.',
    '.DGlGEEEEEEEEEF.',
    '.DGlGGGGGGGGGoF.',
    '.DrulllllllllpF.',
    '.DGmGGGGGkGnGqF.',
    '.EFFFFFFFFFFFFG.',
    '................'
)
Assert-Map 'GwBase' $GwBase

$GwSplitter = @(3, 12); $GwLaser = @(2, 12); $GwPhotodiode = @(3, 13)
$GwEventLamp = @(9, 13); $GwRunLamp = @(11, 13)
$GwArmLength = 9                                             # both arms: the k-th pixel from the splitter is (3, 12-k) and (3+k, 12)
$GwScreenX0 = 6; $GwScreenY0 = 3; $GwScreenW = 8; $GwScreenH = 7; $GwBaseline = 6
# The chirp, one sample per display column (rows above the baseline are negative): a small slow wiggle, growing and
# quickening into the merger's peak (column 6), then the ringdown.
$GwChirp = @(0, -1, 0, 1, -2, 2, -3, 1)
$GwPeakColumn = 6
# How many columns the sweep has drawn in each frame: it reaches the peak in frame 6 (the merger) and holds in frame 7 (the
# afterglow).
$GwReveal = @(2, 3, 4, 5, 6, 7, 8, 8)
$GwMergerFrame = 6; $GwAfterglowFrame = 7
$GwEventFrames = @(6, 7)

# The trace as pixels per column: the sample, then the joins to its neighbours (each join's rows split between its two
# columns, the first half to the left one), so the trace zig-zags without gaps. Third value: 1 = sample, 0 = join.
$GwTrace = @()
for ($i = 0; $i -lt $GwChirp.Count; $i++) { $GwTrace += , @($i, $GwChirp[$i], 1) }
for ($i = 1; $i -lt $GwChirp.Count; $i++) {
    $a = $GwChirp[$i - 1]; $b = $GwChirp[$i]
    $n = [Math]::Abs($b - $a); if ($n -le 1) { continue }
    $s = [Math]::Sign($b - $a)
    $left = [int][Math]::Floor(($n - 1) / 2)
    for ($k = 1; $k -lt $n; $k++) {
        $col = if ($k -le $left) { $i - 1 } else { $i }
        $GwTrace += , @($col, ($a + $s * $k), 0)
    }
}
foreach ($tr in $GwTrace) { if ([Math]::Abs($tr[1]) -gt 3) { throw "GwTrace: row offset $($tr[1]) leaves the display" } }

function New-DetectorFrame {
    param([bool]$Active, [int]$T = 0)
    $c = New-Canvas; $e = New-Canvas
    $P = $GwPal
    Write-Map $c 0 0 $GwBase $P
    # idle: grey tubes, a dull splitter, a flat dim baseline; nothing glows
    if (-not $Active) { return @{ Color = $c; Emi = $e } }
    $f = $T % 8

    # ---- the arms hold the light; a brighter glint runs from the splitter out to both test masses
    $glint = $f + 1
    for ($k = 1; $k -le $GwArmLength; $k++) {
        $tone = if ($k -eq $glint) { $P['2'] } else { $P['3'] }
        Set-Both $c $e 3 (12 - $k) $tone
        Set-Both $c $e (3 + $k) 12 $tone
    }
    Set-Both $c $e $GwLaser[0] $GwLaser[1] $P['2']
    Set-Both $c $e $GwSplitter[0] $GwSplitter[1] $P['1']

    # ---- the display: the swept columns hold the trace (the newest column brightest), the rest the noisy dim baseline
    $shown = $GwReveal[$f]
    $head = $shown - 1
    for ($col = 0; $col -lt $GwScreenW; $col++) {
        $x = $GwScreenX0 + $col
        for ($y = $GwScreenY0; $y -lt ($GwScreenY0 + $GwScreenH); $y++) { Set-Px $c $x $y $P['v'] }
        if ($col -lt $shown) { continue }
        $dy = 0
        $n = Get-Noise $col 7 $T 61
        if ($n -lt 40) { $dy = -1 } elseif ($n -gt 215) { $dy = 1 }
        Set-Px $c $x ($GwBaseline + $dy) $P['g']
    }
    # ($tr, not $t: PowerShell names are case-insensitive and $T is the frame number)
    foreach ($tr in $GwTrace) {
        if ($tr[0] -ge $shown) { continue }
        if ($f -eq $GwAfterglowFrame) { $tone = if ($tr[2] -eq 1) { '8' } else { '9' } }
        elseif ($tr[0] -eq $head) { $tone = if ($tr[2] -eq 1) { '6' } else { '7' } }
        else { $tone = if ($tr[2] -eq 1) { '7' } else { '8' } }
        if ($f -eq $GwMergerFrame -and $tr[0] -eq $GwPeakColumn -and $tr[2] -eq 1) { $tone = '6' }
        Set-Both $c $e ($GwScreenX0 + $tr[0]) ($GwBaseline + $tr[1]) $P[$tone]
    }

    # ---- the photodetector at the dark port follows the strain under the sweep head (dim in the afterglow)
    $amp = [Math]::Abs($GwChirp[$head])
    $pd = if ($f -eq $GwAfterglowFrame) { '4' } else { [string]('4321'[(Get-ClampInt $amp 0 3)]) }
    Set-Both $c $e $GwPhotodiode[0] $GwPhotodiode[1] $P[$pd]

    # ---- the lamps: run lit while working; the event lamp lights at the merger and stays through the afterglow
    Set-Both $c $e $GwRunLamp[0] $GwRunLamp[1] $P['N']
    if ($GwEventFrames -contains $f) { Set-Both $c $e $GwEventLamp[0] $GwEventLamp[1] $P['7'] }

    Sync-Emissive $c $e
    return @{ Color = $c; Emi = $e }
}

# Where light may come from: the arms, the splitter, the laser, the photodetector, the display's glass and the two lamps (the
# check below holds the emissive layer to these pixels, so the test masses, the rims and the steel never glow).
$GwGlowZone = New-Object 'System.Collections.Generic.HashSet[int]'
for ($k = 1; $k -le $GwArmLength; $k++) { [void]$GwGlowZone.Add((12 - $k) * 16 + 3); [void]$GwGlowZone.Add(12 * 16 + 3 + $k) }
for ($y = $GwScreenY0; $y -lt ($GwScreenY0 + $GwScreenH); $y++) { for ($x = $GwScreenX0; $x -lt ($GwScreenX0 + $GwScreenW); $x++) { [void]$GwGlowZone.Add($y * 16 + $x) } }
foreach ($l in @($GwSplitter, $GwLaser, $GwPhotodiode, $GwEventLamp, $GwRunLamp)) { [void]$GwGlowZone.Add($l[1] * 16 + $l[0]) }

# ============================================================================================
#  COILGUN LAUNCHER - controller face (GTM's robust tungstensteel casing)
#  the breech seen down the barrel: four coil rings round the bore, centred on (7.5, 7.5) and filling the board (ring 4, the
#  nearest, at distance 5..6; ring 3 at 4..5; ring 2 at 3..4; ring 1 at 2..3; the bore inside 2), each ring lit at its top left
#  and shaded at its bottom right; in the corners left over, a rivet at the top left and top right, the run lamp (2,13) and the
#  charge indicator's three steps at the bottom right ((13,13); (12,13), (13,12); (11,13), (12,12), (13,11))
# ============================================================================================
#   copper rings (4 and 2; the far one a step darker), lit -> dark: a b c h
#   superconductor rings (3 and 1; dark violet NbTi), lit -> dark: d e f j
#   bore: w deep shadow (top left), x depth, z the far wall catching light (bottom right)
#   charge cells off: k (lit: 7, all three 6 once full); run lamp off: n (lit: N)
# The energised coil's glow, white -> deep blue (1..5); the capacitor bank's amber (6, 7).
$ArcSpec = '1=F2FCFF 2=A6E2FF 3=5DB4FF 4=3874D2 5=274894'
$ChargeSpec = '6=FFE7A6 7=FFB43C'
$CgCommonSpec = @'
a=F2A86A b=CB7A41 c=94532B h=6B3A1F
d=9C8EC4 e=716698 f=4D446E j=362F50
w=0F131C x=1C2332 z=36435C
k=3E2C10 n=1E4029
'@
$CgPal = New-Pal ($SteelSpec + ' ' + $LampSpec + ' ' + $ArcSpec + ' ' + $ChargeSpec + ' ' + $CgCommonSpec)

$CgBase = @(
    '................',
    '.CDDDDDDDDDDDDE.',
    '.DBGGGaaaaGGGBF.',
    '.DGGaaddddabGGF.',
    '.DGaddbbbbeebGF.',
    '.DGadbeeefcecGF.',
    '.DadbeewwffhfcF.',
    '.DadbewwxxjhfcF.',
    '.DadbewxxzjhfcF.',
    '.DadbffxzjjhfcF.',
    '.DGaecfjjjhfcGF.',
    '.DGbeehhhhffckF.',
    '.DGGbcffffcckkF.',
    '.DnGGGccccGkkkF.',
    '.EFFFFFFFFFFFFG.',
    '................'
)
Assert-Map 'CgBase' $CgBase

# Every ring pixel and bore pixel: x, y, ring (1..4, 0 = bore) and side (0 lit, 1 middle, 2 shaded), from its distance to the
# centre and which side of the anti-diagonal it lies on. The map's letters must agree (the check right below).
$CgRingLetters = @{ 1 = 'efj'; 2 = 'bch'; 3 = 'def'; 4 = 'abc' }
$CgPixels = @()
for ($y = 2; $y -le 13; $y++) { for ($x = 2; $x -le 13; $x++) {
    $d = [Math]::Sqrt(($x - 7.5) * ($x - 7.5) + ($y - 7.5) * ($y - 7.5))
    if ($d -ge 6) { continue }
    $ring = if ($d -lt 2) { 0 } else { [int][Math]::Floor($d) - 1 }
    $s = ($x - 7.5) + ($y - 7.5)
    $side = if ($s -le -2) { 0 } elseif ($s -ge 2) { 2 } else { 1 }
    if ($ring -gt 0) {
        $want = [string]$CgRingLetters[$ring][$side]
        if ([string]$CgBase[$y][$x] -cne $want) { throw "CgBase: ($x,$y) is '$($CgBase[$y][$x])', ring $ring wants '$want'" }
    } elseif ('wxz'.IndexOf([string]$CgBase[$y][$x]) -lt 0) { throw "CgBase: ($x,$y) should be bore (w, x or z)" }
    $CgPixels += , @($x, $y, $ring, $side)
} }

# The shot, frame by frame: the ring that is energised (4 outer -> 1 inner; 0 = the bore flashes; -1 = none) and the ring
# behind it, still fading; then the charge level (0..3).
$CgHot = @(4, 3, 2, 1, 0, -1, -1, -1)
$CgFade = @(-1, 4, 3, 2, 1, 0, -1, -1)
$CgCharge = @(2, 1, 0, 0, 0, 1, 2, 3)
$CgChargeCells = @(@(13, 13, 1), @(12, 13, 2), @(13, 12, 2), @(11, 13, 3), @(12, 12, 3), @(13, 11, 3))
$CgRunLamp = @(2, 13)

function New-LauncherFrame {
    param([bool]$Active, [int]$T = 0)
    $c = New-Canvas; $e = New-Canvas
    $P = $CgPal
    Write-Map $c 0 0 $CgBase $P
    # idle: cold coils, a dark bore and dark cells
    if (-not $Active) { return @{ Color = $c; Emi = $e } }
    $f = $T % 8

    # ---- the coils energise from the outer ring in; the ring behind fades. The bore flashes as the slug passes (its far wall
    #      and middle white, its shadowed rim a step dimmer) and fades in the next frame.
    foreach ($px in $CgPixels) {
        $ring = $px[2]; $side = $px[3]
        $tone = -1
        if ($ring -eq $CgHot[$f]) { $tone = $side }
        elseif ($ring -eq $CgFade[$f]) { $tone = 2 + $side }
        if ($tone -lt 0) { continue }
        if ($ring -eq 0 -and $CgBase[$px[1]][$px[0]] -ceq 'w') { $tone++ }
        Set-Both $c $e $px[0] $px[1] $P[[string]('12345'[(Get-ClampInt $tone 0 4)])]
    }

    # ---- the capacitor bank: drains as the shot fires, refills over the last frames (all three cells brighter once full)
    $level = $CgCharge[$f]
    foreach ($cell in $CgChargeCells) {
        if ($cell[2] -gt $level) { continue }
        $tone = if ($level -eq 3) { '6' } else { '7' }
        Set-Both $c $e $cell[0] $cell[1] $P[$tone]
    }

    # ---- the run lamp is lit while working
    Set-Both $c $e $CgRunLamp[0] $CgRunLamp[1] $P['N']

    Sync-Emissive $c $e
    return @{ Color = $c; Emi = $e }
}

# Where light may come from: the four rings, the bore, the charge cells and the run lamp (the rivets and the steel never glow).
$CgGlowZone = New-Object 'System.Collections.Generic.HashSet[int]'
foreach ($px in $CgPixels) { [void]$CgGlowZone.Add($px[1] * 16 + $px[0]) }
foreach ($cell in $CgChargeCells) { [void]$CgGlowZone.Add($cell[1] * 16 + $cell[0]) }
[void]$CgGlowZone.Add($CgRunLamp[1] * 16 + $CgRunLamp[0])

# ============================================================================================
#  BUILD
# ============================================================================================
$GwDir = 'block/multiblock/gravitational_wave_detector'
$CgDir = 'block/multiblock/coilgun_launcher'
$FrameTimes = @{}
$FrameTimes[$GwDir] = 3
$FrameTimes[$CgDir] = 2
$GlowZones = @{}
$GlowZones[$GwDir] = $GwGlowZone
$GlowZones[$CgDir] = $CgGlowZone

function Out-Overlay {
    param([string]$Dir, $Builder, [int]$FrameTime)
    $frames = @(); $emis = @()
    for ($f = 0; $f -lt 8; $f++) { $r = & $Builder $true $f; $frames += $r.Color; $emis += $r.Emi }
    $idle = & $Builder $false 0
    Out-Tex $idle.Color "$Dir/overlay_front.png"
    Out-Tex (Join-Frames $frames) "$Dir/overlay_front_active.png" $FrameTime
    Out-Tex (Join-Frames $emis) "$Dir/overlay_front_active_emissive.png" $FrameTime
}

if (Test-Want 'detector') { Out-Overlay $GwDir ${function:New-DetectorFrame} $FrameTimes[$GwDir] }
if (Test-Want 'launcher') { Out-Overlay $CgDir ${function:New-LauncherFrame} $FrameTimes[$CgDir] }

# ============================================================================================
#  VERIFY what was written: exact sizes (the idle face 16x16, the strips 16x128), binary alpha, no pure black, the .mcmeta
#  frametime, frames that really differ (each one from the next, the loop seam included, and at least 4 distinct), the empty
#  casing ring around a panel without holes (so the casing always shows around the face), and an emissive layer inside the
#  colour layer, lit in every frame and only where the face has lights
# ============================================================================================
$problems = 0
foreach ($rel in $written) {
    $path = Join-Path $OutRoot ($rel -replace '/', '\')
    $faceDir = ($rel -replace '/[^/]+$', '')
    $msgs = @()
    if ($rel.EndsWith('.mcmeta')) {
        $ft = 0
        try { $ft = [int]((Get-Content -LiteralPath $path -Raw | ConvertFrom-Json).animation.frametime) } catch { $msgs += 'unreadable .mcmeta' }
        if ($ft -ne $FrameTimes[$faceDir]) { $msgs += "frametime $ft (expected $($FrameTimes[$faceDir]))" }
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
        $zone = $GlowZones[$faceDir]
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
    # GTM 7.5.3's frost-proof casing is pale icy-blue aluminium and its robust tungstensteel casing a dark blue-grey plate; the
    # dark plate shows how the faces read on a neutral dark casing
    $frost = Get-CasingTile $FrostCasing (New-StandInCasing 'a=BED7E3 b=A5C6D6 c=8FB7CC d=526E73 e=A5C6D6 f=8FB7CC')
    $tung = Get-CasingTile $TungstenCasing (New-StandInCasing 'a=6A7486 b=525C6E c=444C5C d=262B36 e=58627A f=465062')
    $darkPlate = New-StandInCasing 'a=4A4A4A b=3E3E3E c=303030 d=1E1E1E e=474747 f=363636'
    $checker = New-Canvas
    for ($i = 0; $i -lt 256; $i++) { $checker.P[$i] = if (((($i % 16) + [int][Math]::Floor($i / 16)) % 2) -eq 0) { Hex '3C4048' } else { Hex '4A4F58' } }
    $night = New-Canvas
    for ($i = 0; $i -lt 256; $i++) { $night.P[$i] = Hex '0A0B0D' }

    # each face with its own casing, the other casings it is also shown on, and the existing faces it must not be mistaken for
    $faces = @()
    if (Test-Want 'detector') { $faces += [pscustomobject]@{ Dir = $GwDir; Own = $frost; Others = @($tung, $darkPlate); Near = @('interferometer', 'helium_refrigerator', 'hts_magnet_works') } }
    if (Test-Want 'launcher') { $faces += [pscustomobject]@{ Dir = $CgDir; Own = $tung; Others = @($frost, $darkPlate); Near = @('hts_magnet_works', 'mercury_solar_works', 'fission_reactor') } }
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
    # a gap, idle and working (the merger / a mid-shot frame) on the other two casings. 2: the raw colour layer on a checker
    # (the empty ring shows). 3: the emissive layer alone, on black.
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
        Add-Blit $sheet (Get-Dark $fc.Own (Get-Frame $fc.Act 6) (Get-Frame $fc.Emi 6)) ($gap + 9 * $cell) $y0 $k
        $x0 = $gap + 10 * $cell + $gap
        foreach ($o in $fc.Others) {
            Add-Blit $sheet (Merge-On $o $fc.Idle) $x0 $y0 $k
            Add-Blit $sheet (Merge-On $o $fc.Lit[6]) ($x0 + $cell) $y0 $k
            $x0 += 2 * $cell
        }
        $y0 += 3 * $cell
    }

    # one row: each face working (frame 6) on its casing, followed by the existing faces nearest to it, on the same casing
    $y0 += $gap
    $x0 = $gap
    foreach ($fc in $faces) {
        Add-Blit $sheet (Merge-On $fc.Own $fc.Lit[6]) $x0 $y0 $k
        $x0 += $cell
        foreach ($nb in $fc.Near) {
            $nd = Join-Path $OutRoot ('block\multiblock\' + $nb)
            if (-not (Test-Path -LiteralPath (Join-Path $nd 'overlay_front_active.png'))) { continue }
            $na = Read-Png (Join-Path $nd 'overlay_front_active.png')
            $ne = Read-Png (Join-Path $nd 'overlay_front_active_emissive.png')
            Add-Blit $sheet (Merge-On (Merge-On $fc.Own (Get-Frame $na 1)) (Get-Frame $ne 1)) $x0 $y0 $k
            $x0 += $cell
        }
        $x0 += $gap
    }

    # last row: a 3x3 wall of each face's casing, idle and working, at x4, then the same walls at x1 (as seen from a few blocks)
    $y0 += $cell + $gap
    $x0 = $gap
    foreach ($fc in $faces) {
        Add-Blit $sheet (New-Wall $fc.Own $fc.Idle) $x0 $y0 4; $x0 += 48 * 4 + $gap
        Add-Blit $sheet (New-Wall $fc.Own $fc.Lit[6]) $x0 $y0 4; $x0 += 48 * 4 + $gap
    }
    foreach ($fc in $faces) {
        Add-Blit $sheet (New-Wall $fc.Own $fc.Idle) $x0 $y0 1
        Add-Blit $sheet (New-Wall $fc.Own $fc.Lit[6]) $x0 ($y0 + 48 + $gap) 1
        $x0 += 48 + $gap
    }

    $pdir = Split-Path -Parent $Preview
    if ($pdir -and -not (Test-Path -LiteralPath $pdir)) { New-Item -ItemType Directory -Force -Path $pdir | Out-Null }
    $bmp = ConvertTo-Bitmap $sheet
    try { $bmp.Save($Preview, [System.Drawing.Imaging.ImageFormat]::Png) } finally { $bmp.Dispose() }
    $frostNote = if ($FrostCasing) { Split-Path -Leaf $FrostCasing } else { 'an icy-blue stand-in for the frost-proof casing' }
    $tungNote = if ($TungstenCasing) { Split-Path -Leaf $TungstenCasing } else { 'a dark blue-grey stand-in for the robust tungstensteel casing' }
    Write-Host "preview: $Preview (x$k on $frostNote and $tungNote; per face: idle, 8 working frames, dark room, then the other casings; raw layer on a checker; emissive alone; the nearest existing faces; 3x3 walls at x4 and x1)"
}

if ($problems -gt 0) { throw "$problems file(s) failed the texture checks (see the warnings above)" }

if ($Credits) {
    Write-Host ''
    foreach ($rel in $written) {
        Write-Host ("| ``pack/kubejs/assets/grindless/textures/$rel`` | Generated with tools/assets/$ScriptName (procedural pixel art, original) by the LuV Ganymede agent (LuV-B9), 2026-10-26 | the pack's licence (pending; proposed CC BY-SA 4.0) |")
    }
}
