<#
.SYNOPSIS
  Procedural 16x16 pixel art for the two controller faces of LuV's cryogenics package (LuV-A3) of Gregtech Grindless: the
  Helium Refrigerator and the Coated Conductor Line (GregTech style: bevels, top-left light, every pixel fully opaque or fully
  transparent).

.DESCRIPTION
  Every pixel is drawn by this script (palettes + char maps + small routines); nothing is copied or edited from GregTech Modern
  or any other mod. Output is deterministic: re-running overwrites the same bytes (the frost's twinkle and the furnace's flicker
  come from Get-Noise, a hash of position and frame, not from a random generator). Same method, steel bezel, lamp ramp and checks
  as the IV faces (Build-HeavyWaterPlantTextures.ps1, Build-VenusTextures.ps1, after the fission reactor's); the helpers are
  copied so the other scripts stay untouched.

  Writes (under pack/kubejs/assets/grindless/textures/):
    block/multiblock/helium_refrigerator/overlay_front.png, overlay_front_active.png(+.mcmeta), overlay_front_active_emissive.png(+.mcmeta)
    block/multiblock/coated_conductor_line/...  (same three)

  helium_refrigerator (gtceu:helium_refrigerator, on GTM's frost-proof casing): the Claude-cycle refrigerator's mimic panel. At the
  left stands the cold box, a tall column whose window shows the plate heat exchangers over a pool of liquid helium. The helium
  loop leaves it at the top, runs through the first turbo-expander (a wheel on the top run), down the right run through the
  second (a wheel on that run) and back along the bottom run into the pool. Under the loop, the run lamp (green) and the helium
  lamp (pale cyan). 8 frames, frametime 4: both expander wheels spin (a bar of two blades through the hub, an eighth of a turn a
  frame, the second wheel two steps behind the first), a pale cyan pulse of helium runs round the loop two pixels a frame
  (lighting each wheel's hub as it passes) and lands in the pool, which glows, breathes and brightens as it lands; the frosted
  shell twinkles; the run lamp is lit and the helium lamp blinks as the pulse lands. Idle: a grey, unfrosted cold box with dark
  exchangers and a dull pool, a dark loop, both wheels at rest and the lamps dark.

  coated_conductor_line (gtceu:coated_conductor_line, on GTM's clean stainless steel casing): the reel-to-reel tape line. Two
  reels stand at the bottom, the payoff reel (warm grey nickel-tungsten tape) at the left and the take-up reel (blue-grey coated
  tape) at the right; the tape rises from the payoff reel over a guide roller, runs right through the annealing furnace (an
  orange segment between its housings) and the deposition chamber (a pale PTFE box with the laser head over it), and comes down
  over the second roller to the take-up reel. The run lamp (green) and the laser lamp (magenta) sit at the top corners. 8
  frames, frametime 4: both reels turn (a notch runs round each pack, an eighth of a turn a frame), marks move along the tape a
  pixel a frame (pale on the substrate, blue-grey once coated), the furnace glows orange and flickers, and the pulsed laser
  fires every four frames: a violet flash leaves the head, enters the chamber's port, and a magenta plume blooms over the tape
  and fades. The run lamp is lit and the laser lamp blinks with each shot. Idle: still reels and tape, a dark furnace and
  chamber, lamps dark.

  The *_emissive layers only hold the loop's pulse (line pixels and hubs), the pool and the lit lamps (refrigerator); and the
  furnace, the laser column (head, port, plume, deposition spot) and the lit lamps (line). The wheels, the reels, the tape, the
  frost and the steel never glow.

  Run from the repo root (PowerShell 5.1 blocks unsigned scripts by default; this bypass only affects that process):
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-LuVCryogenicsTextures.ps1
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-LuVCryogenicsTextures.ps1 -Only refrigerator -Credits
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-LuVCryogenicsTextures.ps1 -Preview C:\path\luv-a3.png -FrostCasing C:\path\machine_casing_frost_proof.png -StainlessCasing C:\path\machine_casing_clean_stainless_steel.png

  Overlay conventions (GTM's workable casings, as every other set): transparent background, details only on the overlay,
  animated variants are vertical 16x(16*n) strips with a .png.mcmeta, *_emissive layers hold only the pixels that glow
  (identical to the colour layer). Every pixel is fully opaque or fully transparent and none is pure black. The outer 1 px ring
  is always left empty so the casing shows around the face. Drawn for gtceu:block/casings/solid/machine_casing_frost_proof (the
  refrigerator; GTM's pale icy-blue aluminium bricks) and gtceu:block/casings/solid/machine_casing_clean_stainless_steel (the
  line; a pale lavender-grey plate); each face has its own dark frame, so it also reads on other casings. The final check fails
  the run (non-zero exit) if a written file breaks one of these rules, if a frame repeats the next one, if the panel has a hole,
  or if light comes from anywhere but the face's lights.

.PARAMETER Only
  Subset of: refrigerator (helium_refrigerator), line (coated_conductor_line); comma-separated, also as one string with -File.
  Default: both.
.PARAMETER OutRoot
  Textures root. Default: <repo>/pack/kubejs/assets/grindless/textures
.PARAMETER Preview
  Also write a review sheet (x8, nearest neighbour) to this PNG, which must be outside the repository (it is never shipped). Per
  face, three rows: on its own casing, the idle face, the 8 working frames with their emissive layer and a dark room, then idle
  and working on the other face's casing and on a dark plate; the raw colour layers on a checker (transparency check); the
  emissive layer alone, on black. Then one row with each face working next to the existing faces nearest to it (read from
  OutRoot), and 3x3 walls of each face's casing, idle and working, at x4 and x1.
.PARAMETER FrostCasing
  Optional 16x16 PNG used as the refrigerator's casing in the preview (GTM's machine_casing_frost_proof.png, extracted from the
  jar and kept outside the repository). Without it an icy-blue stand-in drawn by code is used. Context only: never written
  anywhere.
.PARAMETER StainlessCasing
  The same for the line (GTM's machine_casing_clean_stainless_steel.png); without it a lavender-grey stand-in is used.
.PARAMETER Credits
  Also print the CREDITS.md "Assets" table rows for the files written.
#>
[CmdletBinding()]
param(
    [string]$OutRoot = '',
    [string[]]$Only = @(),
    [string]$Preview = '',
    [string]$FrostCasing = '',
    [string]$StainlessCasing = '',
    [switch]$Credits
)
$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'Pixel.Lib.ps1')

# `powershell -File ... -Only a,b` delivers "a,b" as one string: split it so both calling styles work.
$Only = @($Only | ForEach-Object { $_ -split '[,;\s]+' } | Where-Object { $_ })
$Known = @('refrigerator', 'line')
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
if ($StainlessCasing) {
    $StainlessCasing = $ExecutionContext.SessionState.Path.GetUnresolvedProviderPathFromPSPath($StainlessCasing)
    if (-not (Test-Path -LiteralPath $StainlessCasing)) { throw "-StainlessCasing not found: $StainlessCasing" }
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

# V mod N, always in 0..N-1 (PowerShell's % keeps the sign of V).
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

# The eight places round a hub, clockwise from the top (relative to it): the wheels' rims and the reels' packs.
$Ring = @(@(0, -1), @(1, -1), @(1, 0), @(1, 1), @(0, 1), @(-1, 1), @(-1, 0), @(-1, -1))

# ============================================================================================
#  HELIUM REFRIGERATOR - controller face (GTM's frost-proof machine casing)
#  a mimic panel: the cold box (x3..6: cap y3, shell sides x3 and x6, window x4..5 with the plate exchangers on y4..8, the
#  headspace on y9 and the liquid helium pool on y10..11, foot y12), the helium loop (top run y4 x7..12, right run x12 y4..11,
#  bottom run y11 x7..12) with the first turbo-expander on the top run (hub 9,4) and the second on the right run (hub 12,8),
#  and the run (9,13) and helium (11,13) lamps under the loop
# ============================================================================================
#   cold box shell: a cap, c cap's right end, b lit side, d shaded side, f foot; y a frost sparkle
#   window: h exchanger plate, i gap between plates, w headspace, q the pool when idle (working, it glows: 1..5)
#   loop: l the line
#   (the shell, the window and the line are the letters that change between idle and working: grey and dark when idle, frosted
#   and backlit when working)
#   expander wheels (titanium): u rim lit, x rim mid, v rim shade, k hub; z the leading blade, e the trailing one (icy, so the
#   bar reads against the dark rim)
#   lamps: n run off (lit: N), o helium off (lit: 2)
# The liquid helium's glow, white -> deep cyan. The pulse's head is 1 and its tail 3; the pool's surface rests on 2, its body on
# 3 and its far corner on 4, and the breath and the landing push them a step brighter or dimmer.
$HeliumSpec = '1=F2FFFF 2=C6F5FF 3=8FE0F2 4=5CBAD6 5=3A8BAA'
$HrCommonSpec = @'
u=6E7A86 x=56616C v=414A54 k=C9D2DA z=E2EEF6 e=A9B8C4
q=3E5560
n=1E4029 o=1C3A42
y=F4FBFF
'@
$HrWorkSpec = @'
a=E6F3FC c=9FBACF b=C6DCEC d=7896AE f=5A768D
h=A8DDF2 i=3E6683 w=223A50
l=6F8A9E
'@
$HrIdleSpec = @'
a=A3ADB5 c=737D86 b=8B959E d=5D666F f=474F57
h=4F6170 i=2C3742 w=1F2830
l=525C66
'@
$HrPalOn = New-Pal ($SteelSpec + ' ' + $LampSpec + ' ' + $HeliumSpec + ' ' + $HrCommonSpec + ' ' + $HrWorkSpec)
$HrPalOff = New-Pal ($SteelSpec + ' ' + $LampSpec + ' ' + $HeliumSpec + ' ' + $HrCommonSpec + ' ' + $HrIdleSpec)

# The whole idle face but the blades: bezel, cold box, loop, wheels and lamps. The frame code draws the blades (parked when idle)
# and, while working, what moves and glows.
$HrBase = @(
    '................',
    '.CDDDDDDDDDDDDE.',
    '.DGGGGGGGGGGGGF.',
    '.DGaaacGuuxGGGF.',
    '.DGbhhdlukvllGF.',
    '.DGbiidGxvvGlGF.',
    '.DGbhhdGGGGGlGF.',
    '.DGbiidGGGGuuxF.',
    '.DGbhhdGGGGukvF.',
    '.DGbwwdGGGGxvvF.',
    '.DGbqqdGGGGGlGF.',
    '.DGbqqdllllllGF.',
    '.DGffffGGGGGGGF.',
    '.DGGGGGGGnGoGGF.',
    '.EFFFFFFFFFFFFG.',
    '................'
)
Assert-Map 'HrBase' $HrBase

$HrGlow = '12345'
$HrWheelA = @(9, 4); $HrWheelB = @(12, 8)                    # the two turbo-expanders' hubs
$HrParkA = 0; $HrParkB = 2                                   # at rest: the first wheel's bar upright, the second's level
$HrLagB = 6                                                  # the second wheel runs two steps behind the first
# The helium's way round the loop, 16 steps: out of the cold box's top, through the first wheel's hub, down the right run
# through the second's, back along the bottom run, then two steps hidden in the cold box (14: it lands in the pool, 15: it
# rises through the exchangers). The pulse's head is on step 2f and its tail on the step before.
$HrLoop = @(
    @(7, 4), @(9, 4), @(11, 4), @(12, 4), @(12, 5), @(12, 6), @(12, 8), @(12, 10),
    @(12, 11), @(11, 11), @(10, 11), @(9, 11), @(8, 11), @(7, 11), @(-1, -1), @(-1, -1)
)
$HrLandStep = 14
# The pool: x, y, its tone at rest (0-based in $HrGlow). The deeper pixels shimmer a step now and then.
$HrPool = @(@(4, 10, 1), @(5, 10, 2), @(4, 11, 2), @(5, 11, 3))
# The pool breathes (negative = brighter); on frame 7 the pulse lands and brightens it a step more.
$HrBreath = @(0, 1, 1, 0, 0, -1, -1, 0)
$HrRunLamp = @(9, 13); $HrHeliumLamp = @(11, 13)
$HrHeliumLampFrames = @(7, 0)                                # lit as the pulse lands and the frame after

# where the frost may twinkle: the cap, the shaded side and the foot of the shell (on the lit side it would not show)
$HrFrost = @()
for ($x = 3; $x -le 6; $x++) { $HrFrost += , @($x, 3) }
for ($y = 4; $y -le 11; $y++) { $HrFrost += , @(6, $y) }
for ($x = 3; $x -le 6; $x++) { $HrFrost += , @($x, 12) }

function New-RefrigeratorFrame {
    param([bool]$Active, [int]$T = 0)
    $c = New-Canvas; $e = New-Canvas
    $P = if ($Active) { $HrPalOn } else { $HrPalOff }
    Write-Map $c 0 0 $HrBase $P
    $f = $T % 8

    # ---- the turbo-expanders: a bar of two blades through the hub (the leading blade bright, the trailing one a step dimmer); it
    #      turns an eighth a frame, clockwise, the second wheel two steps behind the first
    $ka = if ($Active) { $f } else { $HrParkA }
    $kb = if ($Active) { ($f + $HrLagB) % 8 } else { $HrParkB }
    foreach ($w in @(@($HrWheelA, $ka), @($HrWheelB, $kb))) {
        $hub = $w[0]; $k = [int]$w[1]
        $o = $Ring[$k]; Set-Px $c ($hub[0] + $o[0]) ($hub[1] + $o[1]) $P['z']
        $o = $Ring[($k + 4) % 8]; Set-Px $c ($hub[0] + $o[0]) ($hub[1] + $o[1]) $P['e']
    }
    if (-not $Active) { return @{ Color = $c; Emi = $e } }   # idle: the map and the parked blades are the whole face

    # ---- the frost twinkles: at most one sparkle a frame on the shell
    $n = Get-Noise $f 5 $T 43
    if ($n -lt 200) { $s = $HrFrost[$n % $HrFrost.Count]; Set-Px $c $s[0] $s[1] $P['y'] }

    # ---- the helium pulse runs round the loop two steps a frame: a dimmer tail, then the head (a hub lights as it passes)
    $step = (2 * $f) % 16
    $tail = $HrLoop[(Get-Wrap ($step - 1) 16)]; $head = $HrLoop[$step]
    Set-Both $c $e $tail[0] $tail[1] $P['3']
    Set-Both $c $e $head[0] $head[1] $P['1']
    $land = ($step -eq $HrLandStep)

    # ---- the pool glows and breathes, and brightens a step as the pulse lands
    foreach ($d in $HrPool) {
        $tone = $d[2] + $HrBreath[$f]
        if ($land) { $tone-- }
        if ($d[2] -ge 2) {
            $n = Get-Noise $d[0] $d[1] $T 71
            if ($n -lt 36) { $tone-- } elseif ($n -gt 219) { $tone++ }
        }
        Set-Both $c $e $d[0] $d[1] $P[[string]$HrGlow[(Get-ClampInt $tone 0 ($HrGlow.Length - 1))]]
    }

    # ---- the lamps: run lit while working; the helium lamp blinks as the pulse lands
    Set-Both $c $e $HrRunLamp[0] $HrRunLamp[1] $P['N']
    if ($HrHeliumLampFrames -contains $f) { Set-Both $c $e $HrHeliumLamp[0] $HrHeliumLamp[1] $P['2'] }

    Sync-Emissive $c $e
    return @{ Color = $c; Emi = $e }
}

# Where light may come from: the loop's line pixels and the two hubs, the pool and the two lamps (the check below holds the
# emissive layer to these pixels, so the cold box, the exchangers, the blades, the frost and the steel never glow).
$HrGlowZone = New-Object 'System.Collections.Generic.HashSet[int]'
for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) { if ($HrBase[$y][$x] -ceq 'l') { [void]$HrGlowZone.Add($y * 16 + $x) } } }
foreach ($h in @($HrWheelA, $HrWheelB)) { [void]$HrGlowZone.Add($h[1] * 16 + $h[0]) }
foreach ($d in $HrPool) { [void]$HrGlowZone.Add($d[1] * 16 + $d[0]) }
foreach ($l in @($HrRunLamp, $HrHeliumLamp)) { [void]$HrGlowZone.Add($l[1] * 16 + $l[0]) }

# ============================================================================================
#  COATED CONDUCTOR LINE - controller face (GTM's clean stainless steel casing)
#  the tape line seen from the front: the laser head (x7..9 y2..3, its emitter at 8,3), the annealing furnace (x5..6: housing
#  y4 and y8, heaters y5 and y7, the tape through it on y6), the deposition chamber (x7..9 y4..8: the port at 8,4, the plume at
#  8,5, the deposition spot on the tape at 8,6, under it 8,7), the tape (up x4 y7..8 from the payoff reel, over the roller at
#  4,6, along y6, over the roller at 11,6, down x11 y7..8 to the take-up reel), the two reels (5x5 at x2..6 and x9..13,
#  y9..13, hubs 4,11 and 11,11) and the run (3,3) and laser (12,3) lamps
# ============================================================================================
#   laser head: j lit, k shade, e emitter off (working, it flashes: 6..9)
#   furnace: s housing top, g housing bottom, h heater off (working, the heaters and the tape between them glow: 1..5)
#   chamber (PTFE): w lit wall, x shaded wall, y base, p port off, v the dark inside (working, the laser column glows: 6..9)
#   tape: t nickel-tungsten substrate, T its mark; u coated tape, U its mark; m the guide rollers
#   reels: r flange lit, q flange shade, a the payoff reel's pack (substrate), c the take-up reel's pack (coated), i hub; the
#   notch that turns with the pack is F
#   lamps: n run off (lit: N), o laser off (lit: 7)
# The annealing furnace's heat, white-hot -> deep red, and the pulsed laser's light, white-magenta -> deep violet.
$HeatSpec = '1=FFE6B0 2=FFB45A 3=F07A2A 4=B84A1C 5=6E2C14'
$PlumeSpec = '6=FFE2FB 7=FF86E6 8=CF4BE0 9=7E36C2'
$CcPal = New-Pal ($SteelSpec + ' ' + $LampSpec + ' ' + $HeatSpec + ' ' + $PlumeSpec + ' ' + @'
j=C3C8D0 k=6B717B e=3A2448
s=A69C92 g=5E554E h=4A2C20
w=C9C6DA x=7F7C94 y=5C596E p=3A3050 v=1E1B28
t=B5AE9F T=E2DCCF u=7E869A U=B0B8CC m=D0D4DA
r=9EA4AE q=5E646E a=B9AE98 c=8E98B0 i=DCE0E6
n=1E4029 o=4A1E44
'@)

# The whole idle face but the reels' notches: bezel, laser head, furnace, chamber, tape, rollers, reels and lamps.
$CcBase = @(
    '................',
    '.CDDDDDDDDDDDDE.',
    '.DGGGGGjjkGGGGF.',
    '.DGnGGGjekGGoGF.',
    '.DGGGsswpxGGGGF.',
    '.DGGGhhwvxGGGGF.',
    '.DGGmttttuumGGF.',
    '.DGGthhwvxGuGGF.',
    '.DGGtggyyyGuGGF.',
    '.DGrrrGGGGrrrGF.',
    '.DraaaqGGrcccqF.',
    '.DraiaqGGrcicqF.',
    '.DraaaqGGrcccqF.',
    '.DGqqqGGGGqqqGF.',
    '.EFFFFFFFFFFFFG.',
    '................'
)
Assert-Map 'CcBase' $CcBase

$CcReelA = @(4, 11); $CcReelB = @(11, 11)                   # the reels' hubs
$CcParkA = 1; $CcParkB = 5                                  # at rest, the notches stand at the upper right and lower left
$CcLagB = 4                                                 # the take-up reel's notch runs half a turn from the payoff's
# The tape's way from the payoff reel to the take-up reel, 12 steps (a whole number of mark spacings, so the marks loop
# seamlessly): up the left side, over the roller, along the furnace and the chamber, over the second roller and down. Kinds:
# t substrate, m roller (never marked), s the deposition spot (the laser's), u coated.
$CcTape = @(
    @(4, 8, 't'), @(4, 7, 't'), @(4, 6, 'm'), @(5, 6, 't'), @(6, 6, 't'), @(7, 6, 't'),
    @(8, 6, 's'), @(9, 6, 'u'), @(10, 6, 'u'), @(11, 6, 'm'), @(11, 7, 'u'), @(11, 8, 'u')
)
$CcMarkEvery = 4
# The furnace: its heaters (rows 5 and 7) and the tape between them (row 6); x5 is the lit side, x6 a step dimmer.
$CcFurnaceX0 = 5; $CcFurnaceX1 = 6; $CcFurnaceY0 = 5; $CcFurnaceY1 = 7; $CcFurnaceTapeY = 6
# The laser column: emitter, port, plume, deposition spot, under the tape. One shot every four frames: the flash leaves the
# head, enters the port, the plume blooms over the spot and fades ('' = dark).
$CcBeam = @(@(8, 3), @(8, 4), @(8, 5), @(8, 6), @(8, 7))
$CcShot = @(
    @('6', '7', '9', '8', ''),
    @('8', '6', '6', '7', '9'),
    @('9', '8', '7', '6', '8'),
    @('9', '9', '8', '7', '')
)
$CcRunLamp = @(3, 3); $CcLaserLamp = @(12, 3)

function New-LineFrame {
    param([bool]$Active, [int]$T = 0)
    $c = New-Canvas; $e = New-Canvas
    $P = $CcPal
    Write-Map $c 0 0 $CcBase $P
    $f = $T % 8

    # ---- the reels: a notch turns with each pack, an eighth a frame, clockwise
    $ka = if ($Active) { $f } else { $CcParkA }
    $kb = if ($Active) { ($f + $CcLagB) % 8 } else { $CcParkB }
    foreach ($r in @(@($CcReelA, $ka), @($CcReelB, $kb))) {
        $o = $Ring[[int]$r[1]]; Set-Px $c ($r[0][0] + $o[0]) ($r[0][1] + $o[1]) $P['F']
    }
    if (-not $Active) { return @{ Color = $c; Emi = $e } }   # idle: still reels and tape, nothing glows

    # ---- the tape runs: a mark every four steps moves a pixel a frame towards the take-up reel (pale on the substrate,
    #      blue-grey once coated)
    for ($i = 0; $i -lt $CcTape.Count; $i++) {
        $pt = $CcTape[$i]
        if ($pt[2] -eq 'm' -or $pt[2] -eq 's') { continue }
        if ((Get-Wrap ($i - $f) $CcMarkEvery) -eq 0) { Set-Px $c $pt[0] $pt[1] $P[$(if ($pt[2] -eq 't') { 'T' } else { 'U' })] }
    }

    # ---- the annealing furnace: the heaters glow orange, the tape between them a step hotter, the shaded side a step dimmer, and
    #      each pixel flickers a step now and then
    for ($y = $CcFurnaceY0; $y -le $CcFurnaceY1; $y++) { for ($x = $CcFurnaceX0; $x -le $CcFurnaceX1; $x++) {
        $tone = 1 + ($x - $CcFurnaceX0)
        if ($y -eq $CcFurnaceTapeY) { $tone-- }
        $n = Get-Noise $x $y $T 59
        if ($n -lt 40) { $tone-- } elseif ($n -gt 215) { $tone++ }
        Set-Both $c $e $x $y $P[[string]'12345'[(Get-ClampInt $tone 0 4)]]
    } }

    # ---- the pulsed laser: one shot every four frames down the column, the plume blooming over the deposition spot
    $shot = $CcShot[$f % 4]
    for ($j = 0; $j -lt $CcBeam.Count; $j++) {
        if ($shot[$j] -ne '') { Set-Both $c $e $CcBeam[$j][0] $CcBeam[$j][1] $P[$shot[$j]] }
    }

    # ---- the lamps: run lit while working; the laser lamp blinks with each shot
    Set-Both $c $e $CcRunLamp[0] $CcRunLamp[1] $P['N']
    if (($f % 4) -lt 2) { Set-Both $c $e $CcLaserLamp[0] $CcLaserLamp[1] $P['7'] }

    Sync-Emissive $c $e
    return @{ Color = $c; Emi = $e }
}

# Where light may come from: the furnace, the laser column and the two lamps (the reels, the tape outside the furnace, the
# rollers, the chamber's walls and the steel never glow).
$CcGlowZone = New-Object 'System.Collections.Generic.HashSet[int]'
for ($y = $CcFurnaceY0; $y -le $CcFurnaceY1; $y++) { for ($x = $CcFurnaceX0; $x -le $CcFurnaceX1; $x++) { [void]$CcGlowZone.Add($y * 16 + $x) } }
foreach ($b in $CcBeam) { [void]$CcGlowZone.Add($b[1] * 16 + $b[0]) }
foreach ($l in @($CcRunLamp, $CcLaserLamp)) { [void]$CcGlowZone.Add($l[1] * 16 + $l[0]) }

# ============================================================================================
#  BUILD
# ============================================================================================
$HrDir = 'block/multiblock/helium_refrigerator'
$CcDir = 'block/multiblock/coated_conductor_line'
$FrameTime = 4
$GlowZones = @{}
$GlowZones[$HrDir] = $HrGlowZone
$GlowZones[$CcDir] = $CcGlowZone

function Out-Overlay {
    param([string]$Dir, $Builder, [int]$FrameTime)
    $frames = @(); $emis = @()
    for ($f = 0; $f -lt 8; $f++) { $r = & $Builder $true $f; $frames += $r.Color; $emis += $r.Emi }
    $idle = & $Builder $false 0
    Out-Tex $idle.Color "$Dir/overlay_front.png"
    Out-Tex (Join-Frames $frames) "$Dir/overlay_front_active.png" $FrameTime
    Out-Tex (Join-Frames $emis) "$Dir/overlay_front_active_emissive.png" $FrameTime
}

if (Test-Want 'refrigerator') { Out-Overlay $HrDir ${function:New-RefrigeratorFrame} $FrameTime }
if (Test-Want 'line') { Out-Overlay $CcDir ${function:New-LineFrame} $FrameTime }

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
    # GTM 7.5.3's frost-proof casing is pale icy-blue aluminium and its clean stainless steel casing a pale lavender-grey plate;
    # the dark plate shows how the faces read on a dark casing
    $frost = Get-CasingTile $FrostCasing (New-StandInCasing 'a=BED7E3 b=A5C6D6 c=8FB7CC d=526E73 e=A5C6D6 f=8FB7CC')
    $stain = Get-CasingTile $StainlessCasing (New-StandInCasing 'a=EAEAFA b=C7C7D7 c=A5A5B5 d=808090 e=D7D7E7 f=B9B9C9')
    $darkPlate = New-StandInCasing 'a=4A4A4A b=3E3E3E c=303030 d=1E1E1E e=474747 f=363636'
    $checker = New-Canvas
    for ($i = 0; $i -lt 256; $i++) { $checker.P[$i] = if (((($i % 16) + [int][Math]::Floor($i / 16)) % 2) -eq 0) { Hex '3C4048' } else { Hex '4A4F58' } }
    $night = New-Canvas
    for ($i = 0; $i -lt 256; $i++) { $night.P[$i] = Hex '0A0B0D' }

    # each face with its own casing, the other casings it is also shown on, and the existing faces it must not be mistaken for
    $faces = @()
    if (Test-Want 'refrigerator') { $faces += [pscustomobject]@{ Dir = $HrDir; Own = $frost; Others = @($stain, $darkPlate); Near = @('cryogenic_plant', 'tritium_removal_facility', 'heavy_water_plant') } }
    if (Test-Want 'line') { $faces += [pscustomobject]@{ Dir = $CcDir; Own = $stain; Others = @($frost, $darkPlate); Near = @('hot_strip_mill', 'fuel_fabrication_plant', 'extraction_cascade') } }
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
    # a gap, idle and working (frame 1) on the other two casings. 2: the raw colour layer on a checker (the empty ring shows).
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
        Add-Blit $sheet (Get-Dark $fc.Own (Get-Frame $fc.Act 1) (Get-Frame $fc.Emi 1)) ($gap + 9 * $cell) $y0 $k
        $x0 = $gap + 10 * $cell + $gap
        foreach ($o in $fc.Others) {
            Add-Blit $sheet (Merge-On $o $fc.Idle) $x0 $y0 $k
            Add-Blit $sheet (Merge-On $o $fc.Lit[1]) ($x0 + $cell) $y0 $k
            $x0 += 2 * $cell
        }
        $y0 += 3 * $cell
    }

    # one row: each face working (frame 1) on its casing, followed by the existing faces nearest to it, on the same casing
    $y0 += $gap
    $x0 = $gap
    foreach ($fc in $faces) {
        Add-Blit $sheet (Merge-On $fc.Own $fc.Lit[1]) $x0 $y0 $k
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
        Add-Blit $sheet (New-Wall $fc.Own $fc.Lit[1]) $x0 $y0 4; $x0 += 48 * 4 + $gap
    }
    foreach ($fc in $faces) {
        Add-Blit $sheet (New-Wall $fc.Own $fc.Idle) $x0 $y0 1
        Add-Blit $sheet (New-Wall $fc.Own $fc.Lit[1]) $x0 ($y0 + 48 + $gap) 1
        $x0 += 48 + $gap
    }

    $pdir = Split-Path -Parent $Preview
    if ($pdir -and -not (Test-Path -LiteralPath $pdir)) { New-Item -ItemType Directory -Force -Path $pdir | Out-Null }
    $bmp = ConvertTo-Bitmap $sheet
    try { $bmp.Save($Preview, [System.Drawing.Imaging.ImageFormat]::Png) } finally { $bmp.Dispose() }
    $frostNote = if ($FrostCasing) { Split-Path -Leaf $FrostCasing } else { 'an icy-blue stand-in for the frost-proof casing' }
    $stainNote = if ($StainlessCasing) { Split-Path -Leaf $StainlessCasing } else { 'a lavender-grey stand-in for the clean stainless steel casing' }
    Write-Host "preview: $Preview (x$k on $frostNote and $stainNote; per face: idle, 8 working frames, dark room, then the other casings; raw layer on a checker; emissive alone; the nearest existing faces; 3x3 walls at x4 and x1)"
}

if ($problems -gt 0) { throw "$problems file(s) failed the texture checks (see the warnings above)" }

if ($Credits) {
    Write-Host ''
    foreach ($rel in $written) {
        Write-Host ("| ``pack/kubejs/assets/grindless/textures/$rel`` | Generated with tools/assets/$ScriptName (procedural pixel art, original) by the LuV cryogenics agent (LuV-A3), 2026-10-26 | the pack's licence (pending; proposed CC BY-SA 4.0) |")
    }
}
