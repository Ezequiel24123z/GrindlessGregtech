<#
.SYNOPSIS
  Procedural 16x16 pixel art for the Mercury package of the IV era of Gregtech Grindless (IV-B2): the controller faces of the
  Mercury vein drill, the Mercury solar works, the Mercury solar field and the interferometer, and the three data orbs of the
  interferometer (GregTech style: bevels, top-left light, 3-5 tones per material, every pixel fully opaque or fully transparent).

.DESCRIPTION
  Every pixel is drawn by this script (palettes + char maps + small routines); nothing is copied or edited from GregTech Modern,
  GCYR or any other mod (the data orb is our own drawing, not GTM's Data Orb). Output is deterministic: re-running overwrites the
  same bytes (frost and shimmer come from Get-Noise, a hash of position and frame, never from a random generator). Same method,
  steel bezel and lamp ramp as the IV faces (Build-HeavyWaterPlantTextures.ps1), whose helpers are copied so that script stays
  untouched; the drill bit is drawn by Draw-Helix, the drill bits' shader, copied from Build-EVTextures.ps1.

  Writes (under pack/kubejs/assets/grindless/textures/):
    block/multiblock/<machine>/overlay_front.png, overlay_front_active.png(+.mcmeta), overlay_front_active_emissive.png(+.mcmeta)
      for mercury_vein_drill, mercury_solar_works, mercury_solar_field and interferometer (8 frames, frametime 4)
    item/lunar_vlbi_recording.png, item/outer_system_chart.png, item/sagittarius_a_star_signal.png

  Mercury vein drill (gtceu:mercury_vein_drill), drawn for grindless:hermean_heat_shield_brick: a steel panel with a round window
    onto the tungstensteel bit, dark blue-grey, bitten into the rock; the day/night lamp pair, a sun (an orange plus) and a moon
    (a pale blue crescent); and the liquid-nitrogen frost gauge, a pale cyan glass tube along the foot. Working: the helix turns an
    eighth of a turn per frame, the point glints hot and throws sparks, frost flickers on the gauge and a puff of cold vapour pops
    over it, the sun lamp is lit and the moon lamp blinks once a loop. Idle: the bit still, no frost, both lamps dark.
  Mercury solar works (gtceu:mercury_solar_works), drawn for GTM's robust tungstensteel machine casing: a heavy sight port in a
    tungstensteel bezel onto the focal furnace, a crucible on the hearth with the charge where the focus lands and two thin sun
    rays from the heliostats coming in from the port's top corners; under it the glass evaporation bell and two lamps (focus,
    bell). Working: the spot breathes white -> yellow under its halo, a bright pulse runs down each ray while the rest shimmers,
    the focus lamp is lit. Idle: a dark port onto the cold crucible and its dull charge, no rays, lamps dark.
  Mercury solar field (gtceu:mercury_solar_field), drawn for the heat-shield brick: a control panel with a thin-film panel icon
    (indigo gallium arsenide in 3 px strips parted by a silver busbar, the look of block/iv/thin_film_cells.png, tilted
    towards the sun on a leg and a strut), the sun lamp and a vertical power bar. Working: the sun lamp is lit, the bar fills from
    the bottom with its top cell brightest, then the full bar pulses, and a glint sweeps across the film. Idle: the lamp off and
    the bar empty.
  Interferometer (gtceu:interferometer), drawn for the heat-shield brick: two dish glyphs over the correlator screen (dark
    green-black glass in a raised steel bezel) and the status lamp. Working: the interference fringes, a packet of bright and dark
    bands, scroll one pixel a frame and sharpen as the correlation builds up, a trace blip runs along the bottom of the screen and
    the lamp is lit. Idle: the screen at rest, a dim graticule and a flat trace.
  The *_emissive layers only hold what glows: the drill's hot point, its sparks and the lit lamps; the works' spot, its halo, the
  rays and the focus lamp; the field's sun lamp, the lit bar cells and the glint; the interferometer's lit fringes, the trace and
  the lamp.

  Data orbs (the interferometer's recordings and charts): a glassy blue-violet crystal sphere lit from the top left, with a pale
  caustic on its far side, held in a small steel cradle. The three share one silhouette (checked) and differ in their mark:
    lunar_vlbi_recording       a pale grey crescent Moon, the rest of its disc in earthshine;
    outer_system_chart         banded orange Jupiter with its red spot and four asteroid dots of the belt;
    sagittarius_a_star_signal  a ring of orange-gold light around a dark shadow, brightest along the bottom (the 2022 Event
                               Horizon Telescope image), and a faint radio wave front.

  Run from the repo root (PowerShell 5.1 blocks unsigned scripts by default; this bypass only affects that process):
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-IVMercuryTextures.ps1
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-IVMercuryTextures.ps1 -Only drill,items -Credits
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-IVMercuryTextures.ps1 -Preview C:\path\iv-mercury.png

  Overlay conventions (GTM's workable casings, as every other set): transparent background, details only on the overlay,
  animated variants are vertical 16x(16*n) strips with a .png.mcmeta, *_emissive layers hold only the pixels that glow
  (identical to the colour layer of the same frame). Every pixel is fully opaque or fully transparent and none is pure black.
  The outer 1 px ring is always left empty so the casing shows around the face; inside it each face is a whole panel with its
  own dark board, so it reads on the pale heat-shield brick as well as on the dark tungstensteel. The final check fails the run
  (non-zero exit) if a written file breaks one of these rules.

.PARAMETER Only
  Subset of: drill, works, field, interferometer, items (comma-separated, also as one string with -File). Default: everything.
.PARAMETER OutRoot
  Textures root. Default: <repo>/pack/kubejs/assets/grindless/textures
.PARAMETER Preview
  Also write a review sheet to this PNG, which must be outside the repository (it is never shipped). The sheet is x8, nearest
  neighbour. For each face, on its casing (block/hermean_heat_shield_brick.png for the three brick machines, a robust
  tungstensteel stand-in drawn here for the works): idle, the 8 working frames and a dark room; then the raw colour layer on a
  checker around the emissive layer alone, frame by frame; then a 3x3 wall with the face in the middle, idle and working, at x8,
  x2 and x1. Last, the three orbs at x8 on slot grey and on a dark slot, and at x2 and x1.
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
$Known = @('drill', 'works', 'field', 'interferometer', 'items')
foreach ($id in $Only) { if ($Known -notcontains $id) { throw "Unknown -Only value '$id' (expected: $($Known -join ', '))" } }

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

# A set of pixel indices (y * 16 + x) from a list of @(x, y) pairs: where a face may glow.
function New-Zone {
    param($Points)
    $z = New-Object 'System.Collections.Generic.HashSet[int]'
    foreach ($p in $Points) { [void]$z.Add($p[1] * 16 + $p[0]) }
    return ,$z
}

# --- Draw-Helix: the drill bits' shader (copied from Build-EVTextures.ps1, which copied it from Build-HVTextures.ps1) -------
# A cone or cylinder lit from the top left, with a helix: the phase turns the flutes, so a quarter or an eighth per frame spins it.
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

# Ramps shared with the IV faces: neutral steel (lit -> dark: the bezels and boards) and the state lamp (green M..P, red Q..S).
$SteelSpec = 'A=D3D3D3 B=B0B0B0 C=8E8E8E D=707070 E=565656 F=404040 G=2F2F2F H=222222 I=161616 J=0D0D0D'
$LampSpec = 'M=E2FFE4 N=62FF86 O=22C257 P=0C6B2E Q=FF5A48 R=B52D22 S=5E1511'
# The sun lamp of the drill and the field, a small plus: u core and v rays while off, U core and Y rays while lit (orange).
$SunLampSpec = 'u=6E4A28 v=4E3520 U=FFE9A8 Y=FF9C34'
$SunGlyph = @(@(0, -1, 'v', 'Y'), @(-1, 0, 'v', 'Y'), @(0, 0, 'u', 'U'), @(1, 0, 'v', 'Y'), @(0, 1, 'v', 'Y'))

function Set-SunLamp {
    param($C, $E, [int]$Cx, [int]$Cy, $P)
    foreach ($g in $SunGlyph) { Set-Both $C $E ($Cx + $g[0]) ($Cy + $g[1]) $P[[string]$g[3]] }
}
function Get-SunPoints { param([int]$Cx, [int]$Cy) return @($SunGlyph | ForEach-Object { , @(($Cx + $_[0]), ($Cy + $_[1])) }) }

# ============================================================================================
#  MERCURY VEIN DRILL - controller face (grindless:hermean_heat_shield_brick, pale)
#  the round window (ring x2..10 y2..10) onto the tungstensteel bit (5 px wide on x4..8 from row 3, tapering on rows 7..8 to its
#  point at 6,9, bitten into the rock of rows 8..9), the sun lamp (plus around 12,3) and the moon lamp (a crescent at x12..13
#  y6..8), and the liquid-nitrogen frost gauge along the foot (a glass tube x3..12 y12..13 between two steel caps, LN2 up to x9)
# ============================================================================================
#   window: w inside, x glass glint     rock: t lit, r body, s shade, i an iridosmine fleck
#   gauge: L / l LN2 (top, bottom), e / f the empty glass, z / y frost (white, pale)     moon lamp: n limb, o tips (lit: V, W)
#   the bit's hot tip and its sparks: 1 white-yellow, 2 yellow, 3 orange, 4 deep orange
$DrSpec = @'
w=1A1D28 x=8A9CBE
t=7C766E r=5E5852 s=46413C i=C8D6E6
L=C4F1F7 l=86D3E0 e=2C4450 f=20323C z=F4FDFF y=CBEFF7
n=3C4C60 o=2E3A4A V=E2F1FF W=A3CBEE
1=FFF9E0 2=FFE08C 3=FFB24C 4=F0782A
'@
$DrPal = New-Pal ($SteelSpec + ' ' + $LampSpec + ' ' + $SunLampSpec + ' ' + $DrSpec)

$DrBase = @(
    '................',
    '.CDDDDDDDDDDDDE.',
    '.DGGBBBCCGGGvGF.',
    '.DGBwwwwwDGvuvF.',
    '.DBxwwwwwwDGvGF.',
    '.DBxwwwwwwEGGGF.',
    '.DCwwwwwwwEGnoF.',
    '.DCwwwwwwwEGnGF.',
    '.DCtwwwwwsFGnoF.',
    '.DGDtrrisFGGGGF.',
    '.DGGEFFFFGGGGGF.',
    '.DGGGGGGGGGGGGF.',
    '.DBLLLLLLLeeeEF.',
    '.DClllllllfffFF.',
    '.EFFFFFFFFFFFFG.',
    '................'
)
Assert-Map 'DrBase' $DrBase

# the bit: tungstensteel, dark blue-grey (spec, light, mid, dark, darkest), 5 px wide on column 6, tapering from row 7 to its
# point on row 9, where it bites into the rock
$DrBitRamp = @((Hex 'ACB2D0'), (Hex '8389AC'), (Hex '60668A'), (Hex '464B6A'), (Hex '31354C'))
$DrBitX = 6.5; $DrBitTip = 10.0; $DrBitPitch = 8.0; $DrBitStarts = 2.0
$DrTip = @(6, 9)                                            # the point, in the rock
$DrInside = @($DrTip[1] * 16 + $DrTip[0])                   # the pixels the bit may cover: the window's inside (w and x) and its point
for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) { if ('wx'.Contains([string]$DrBase[$y][$x])) { $DrInside += ($y * 16 + $x) } } }
$DrHot = @(@(5, 9), @(7, 9))                                # the rock on both sides of the point, heated by it
$DrSparks = @(@(4, 8), @(8, 8))
$DrTipSeq = '21321231'                                      # the point's glow, frame by frame (glow letters)
$DrSun = @(12, 3)
$DrMoon = @(@(12, 6, 'V'), @(13, 6, 'W'), @(12, 7, 'V'), @(12, 8, 'V'), @(13, 8, 'W'))
$DrMoonFrame = 5                                            # the moon lamp blinks once a loop
$DrFrostX0 = 3; $DrFrostX1 = 9                              # the LN2 part of the gauge, where frost forms
$DrPuffX = @(4, 7, 5, 8, 3, 6, 9, 5)                        # a puff of cold vapour over the gauge, one per frame

function New-DrillFrame {
    param([bool]$Active, [int]$T = 0)
    $c = New-Canvas; $e = New-Canvas
    $P = $DrPal
    Write-Map $c 0 0 $DrBase $P
    $f = $T % 8

    # ---- the bit (still when idle): the helix advances an eighth of a turn per frame
    $bit = New-Canvas
    $phase = 0.0
    if ($Active) { $phase = $f / 8.0 }
    Draw-Helix $bit $DrBitRamp $DrBitX $DrBitTip 2.0 3.0 7.0 2.0 7.5 $DrBitPitch $DrBitStarts 1.2 $phase
    foreach ($i in $DrInside) { if ($bit.P[$i] -ne 0) { $c.P[$i] = $bit.P[$i] } }
    if (-not $Active) { return @{ Color = $c; Emi = $e } }

    # ---- the hot point glints, the rock beside it glows in turn and a spark jumps off every other frame
    Set-Both $c $e $DrTip[0] $DrTip[1] $P[[string]$DrTipSeq[$f]]
    Set-Both $c $e $DrHot[$f % 2][0] $DrHot[$f % 2][1] $P['4']
    if (($f % 4) -eq 0) { Set-Both $c $e $DrSparks[0][0] $DrSparks[0][1] $P['3'] }
    if (($f % 4) -eq 2) { Set-Both $c $e $DrSparks[1][0] $DrSparks[1][1] $P['3'] }

    # ---- day: the sun lamp is lit; the moon lamp blinks once a loop
    Set-SunLamp $c $e $DrSun[0] $DrSun[1] $P
    if ($f -eq $DrMoonFrame) { foreach ($m in $DrMoon) { Set-Both $c $e $m[0] $m[1] $P[[string]$m[2]] } }

    # ---- frost flickers on the LN2 and a puff of cold vapour pops over the gauge
    for ($x = $DrFrostX0; $x -le $DrFrostX1; $x++) {
        $n = Get-Noise $x 12 $f 31
        if ($n -gt 200) { Set-Px $c $x 12 $P['z'] } elseif ($n -lt 36) { Set-Px $c $x 12 $P['y'] }
    }
    Set-Px $c $DrPuffX[$f] 11 $P['y']
    if (($f % 2) -eq 0) { Set-Px $c $DrPuffX[$f] 12 $P['z'] }

    Sync-Emissive $c $e
    return @{ Color = $c; Emi = $e }
}
$DrZone = New-Zone (@(, $DrTip) + $DrHot + $DrSparks + (Get-SunPoints $DrSun[0] $DrSun[1]) + @($DrMoon | ForEach-Object { , @($_[0], $_[1]) }))

# ============================================================================================
#  MERCURY SOLAR WORKS - controller face (GTM's robust tungstensteel machine casing, dark blue-grey)
#  a heavy sight port (frame x2..13 y2..10 with rounded inner corners) onto the focal furnace: a crucible on the hearth (rim x5..10
#  on row 7, body x6..9 on row 8; the charge at 7..8,7 where the focus lands) and the two sun rays from the heliostats, coming in
#  from the port's top corners (4,3 -> 6,5 and 11,3 -> 9,5) to a halo over the charge (7..8,6). Under the port: the glass
#  evaporation bell (x3..6 y11..13) and two lamps in a recess (focus 10,12 and bell 12,12)
# ============================================================================================
#   tungstensteel 0 (highlight) .. 5 (deepest)     port: k inside, h hearth     crucible: c lit, d body, m shade; q the cold charge
#   bell: g glass, j glass in shade, p inside     lamps: b recess, l focus lamp off (lit: N), a bell lamp off (amber)
#   (k, h and the crucible are the only letters that change between idle and working: dark when idle, lit by the focus when working)
#   the focus: W white-hot, X pale yellow, Y yellow, Z deep yellow, V orange, U deep orange
$TsSpec = '0=B6B8DA 1=9496BE 2=7678A2 3=5C5E84 4=46486A 5=34364F'
$WkCommonSpec = @'
q=4A2E26 g=C4E4F0 j=86AFC2 p=22303A b=22233A l=1E4029 a=4A3418
W=FFFFF4 X=FFF2C0 Y=FFDE78 Z=FFBE48 V=F2963A U=C8682A
'@
$WkWorkSpec = 'k=2C1C1C h=4C3026 c=E0A46A d=A45E36 m=5E3624'
# idle: the port is dark but the cold crucible on its hearth stays readable (ceramic greys, the charge a dull ore red)
$WkIdleSpec = 'k=262433 h=4A4446 c=B4ACA8 d=8A827E m=625B58'
$WkPalOn = New-Pal ($LampSpec + ' ' + $TsSpec + ' ' + $WkCommonSpec + ' ' + $WkWorkSpec)
$WkPalOff = New-Pal ($LampSpec + ' ' + $TsSpec + ' ' + $WkCommonSpec + ' ' + $WkIdleSpec)

$WkBase = @(
    '................',
    '.12222222222223.',
    '.20111111111124.',
    '.212kkkkkkkk334.',
    '.21kkkkkkkkkk34.',
    '.21kkkkkkkkkk34.',
    '.21kkkkkkkkkk34.',
    '.21kkcdqqdmkk34.',
    '.21kkkcddmkkk34.',
    '.213hhhhhhhh434.',
    '.22444444444444.',
    '.255gg555bbbb54.',
    '.25gppj55blba54.',
    '.25122355222254.',
    '.34444444444445.',
    '................'
)
Assert-Map 'WkBase' $WkBase

$WkSpot = @(@(7, 7), @(8, 7))                               # the charge, where the focus lands
$WkHalo = @(@(7, 6), @(8, 6))                               # the glow over it, where the rays meet
$WkRayL = @(@(4, 3), @(5, 4), @(6, 5))                      # from the port's top-left corner down to the halo
$WkRayR = @(@(11, 3), @(10, 4), @(9, 5))                    # from the top-right corner
$WkLamp = @(10, 12)                                         # the focus lamp (the bell lamp at 12,12 stays dark)
$WkFocus = 'WXYZVU'                                         # the focus ramp, white -> deep orange
$WkBreath = @(0, 0, 1, 2, 3, 2, 1, 1)                       # the spot breathes white -> yellow -> white (index into $WkFocus)

function New-SolarWorksFrame {
    param([bool]$Active, [int]$T = 0)
    $c = New-Canvas; $e = New-Canvas
    $P = if ($Active) { $WkPalOn } else { $WkPalOff }
    Write-Map $c 0 0 $WkBase $P
    if (-not $Active) { return @{ Color = $c; Emi = $e } }   # idle: a dark port, a cold charge, no rays, lamps dark
    $f = $T % 8

    # ---- the focal spot breathes white -> yellow; the halo over it stays two steps dimmer
    $s = $WkBreath[$f]
    foreach ($pt in $WkSpot) { Set-Both $c $e $pt[0] $pt[1] $P[[string]$WkFocus[$s]] }
    foreach ($pt in $WkHalo) { Set-Both $c $e $pt[0] $pt[1] $P[[string]$WkFocus[$s + 2]] }

    # ---- the rays shimmer: a bright pulse runs down each one towards the spot (the right ray half a cycle behind), the rest
    # flickers a step either way
    foreach ($ray in @(@($WkRayL, ($f % 4)), @($WkRayR, (($f + 2) % 4)))) {
        for ($i = 0; $i -lt $ray[0].Count; $i++) {
            $pt = $ray[0][$i]
            $ch = 'Y'
            if ($i -eq $ray[1]) { $ch = 'W' }
            else {
                $n = Get-Noise $pt[0] $pt[1] $f 11
                if ($n -gt 200) { $ch = 'X' } elseif ($n -lt 50) { $ch = 'Z' }
            }
            Set-Both $c $e $pt[0] $pt[1] $P[$ch]
        }
    }

    # ---- the focus lamp is lit
    Set-Both $c $e $WkLamp[0] $WkLamp[1] $P['N']

    Sync-Emissive $c $e
    return @{ Color = $c; Emi = $e }
}
$WkZone = New-Zone ($WkSpot + $WkHalo + $WkRayL + $WkRayR + @(, $WkLamp))

# ============================================================================================
#  MERCURY SOLAR FIELD - controller face (grindless:hermean_heat_shield_brick, pale)
#  a control panel: a thin-film panel icon tilted towards the sun (x2..9 y2..13: every two columns the panel climbs one row; each
#  column reads down the frame, a 3 px strip of gallium arsenide, the silver busbar, a second 3 px strip and the frame, so strips
#  and busbar climb along the panel, the look of block/iv/thin_film_cells.png) on a leg (6,12..13) and a strut (8,11..13); the
#  sun lamp (plus around 12,3) and a vertical power bar (recess x12..13 y6..13, seven cells on rows 7..13, filling from the bottom)
# ============================================================================================
#   panel frame: tungstensteel 0..5     film: l cells, m sheen, n sheen core, t busbar, s busbar glint (block/iv/thin_film_frame.png's
#   and thin_film_cells.png's colours, lifted two steps so the icon reads on the pale brick)     glint: w head, x trail
#   bar: o off, b lit, c brightest
$FdSpec = @'
0=BDBDE4 1=9A9ACA 2=7E7EB0 3=646494 4=4E4E7A 5=3A3A5E
l=3E3076 m=52419A n=6B58BC s=DCE0EA t=A2A8BC
w=F2EEFF x=B9AEF0
o=3C3424 b=FFC94A c=FFF1B8
'@
$FdPal = New-Pal ($SteelSpec + ' ' + $LampSpec + ' ' + $SunLampSpec + ' ' + $FdSpec)

$FdBase = @(
    '................',
    '.CDDDDDDDDDDDDE.',
    '.DGGGGGG12GGvGF.',
    '.DGGGG11l4GvuvF.',
    '.DGG11mll4GGvGF.',
    '.D01llnll4GGGGF.',
    '.D1llmllt4GGIIF.',
    '.D1lllstl4GGooF.',
    '.D1lttllm4GGooF.',
    '.D1tllllm4GGooF.',
    '.D1llllm45GGooF.',
    '.D1lll442GGGooF.',
    '.D1l442G2GGGooF.',
    '.D34GG3G3GGGooF.',
    '.EFFFFFFFFFFFFG.',
    '................'
)
Assert-Map 'FdBase' $FdBase

$FdSun = @(12, 3)
$FdCellPts = @()                                            # the film and the busbar: where the glint may run
for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) { if ('lmnst'.Contains([string]$FdBase[$y][$x])) { $FdCellPts += , @($x, $y) } } }
$FdBarX = @(12, 13); $FdBarY0 = 7; $FdBarY1 = 13            # the bar's cells, one per row, cell 0 at the bottom
$FdLevel = @(1, 2, 3, 4, 5, 6, 7, 7)                        # lit cells, frame by frame: it fills, then the full bar pulses
$FdGlint = @(9, 10, 11, 12, 13, 14, 15, 16)                 # the glint's diagonal (x + y), frame by frame

function New-SolarFieldFrame {
    param([bool]$Active, [int]$T = 0)
    $c = New-Canvas; $e = New-Canvas
    $P = $FdPal
    Write-Map $c 0 0 $FdBase $P
    if (-not $Active) { return @{ Color = $c; Emi = $e } }   # idle: the lamp off and the bar empty
    $f = $T % 8

    # ---- the sun lamp is lit
    Set-SunLamp $c $e $FdSun[0] $FdSun[1] $P

    # ---- the bar fills from the bottom, its top cell brightest; full, it pulses (the whole bar flashes on the last frame)
    $level = $FdLevel[$f]
    for ($i = 0; $i -lt $level; $i++) {
        $y = $FdBarY1 - $i
        $ch = 'b'
        if ($i -eq $level - 1 -or $f -eq 7) { $ch = 'c' }
        foreach ($x in $FdBarX) { Set-Both $c $e $x $y $P[$ch] }
    }

    # ---- a glint sweeps across the film along its sheen (x + y constant), from the top-left corner to the bottom-right one
    $g = $FdGlint[$f]
    foreach ($pt in $FdCellPts) {
        $d = $pt[0] + $pt[1]
        if ($d -eq $g) { Set-Both $c $e $pt[0] $pt[1] $P['w'] }
        elseif ($d -eq $g - 1) { Set-Both $c $e $pt[0] $pt[1] $P['x'] }
    }

    Sync-Emissive $c $e
    return @{ Color = $c; Emi = $e }
}
$FdZonePts = @(Get-SunPoints $FdSun[0] $FdSun[1]) + $FdCellPts
for ($y = $FdBarY0; $y -le $FdBarY1; $y++) { foreach ($x in $FdBarX) { $FdZonePts += , @($x, $y) } }
$FdZone = New-Zone $FdZonePts

# ============================================================================================
#  INTERFEROMETER - controller face (grindless:hermean_heat_shield_brick, pale)
#  two dish glyphs over the correlator screen (bowls x2..6 and x8..12 on rows 2..3, masts on row 4, feet on row 5) and the
#  status lamp at 13,3; the screen (dark green-black glass x3..12 y7..12 in a raised steel bezel x2..13 y6..13): interference
#  fringes on rows 7..11, the trace on row 12
# ============================================================================================
#   dishes: a lit rim, b bowl, c shade, d mast, e foot     screen: 0 dark glass, 1..5 the phosphor (dim -> bright), g glass glint
#   lamp: l off (lit: N)
$IfSpec = @'
a=EEF0F4 b=C4C8D0 c=8E949E d=6A707A e=505660
0=0B1A12 1=133220 2=1F5A34 3=3C9C5C 4=86EAA4 5=D8FFE6 g=1E3A2A
l=1E4029
'@
$IfPal = New-Pal ($SteelSpec + ' ' + $LampSpec + ' ' + $IfSpec)

$IfBase = @(
    '................',
    '.CDDDDDDDDDDDDE.',
    '.DaGGGcGaGGGcGF.',
    '.DGabcGGGabcGlF.',
    '.DGGdGGGGGdGGGF.',
    '.DGeeeGGGeeeGGF.',
    '.DBBBBBBBBBBBDF.',
    '.DCg000000000EF.',
    '.DC0000000000EF.',
    '.DC0000000000EF.',
    '.DC0000000000EF.',
    '.DC0000000000EF.',
    '.DC0000000000EF.',
    '.DDFFFFFFFFFFFF.',
    '.EFFFFFFFFFFFFG.',
    '................'
)
Assert-Map 'IfBase' $IfBase

$IfScreen = @(3, 7, 12, 12)                                 # x0, y0, x1, y1 of the glass
$IfFringeY1 = 11                                            # fringes on rows 7..11, the trace on row 12
$IfPeriod = 4.0                                             # px per fringe; they scroll one px a frame to the right
$IfSharp = @(0.40, 0.50, 0.60, 0.70, 0.80, 0.90, 1.00, 1.00) # fringe contrast, frame by frame: the correlation builds up
$IfEnvSlope = 0.11                                          # the fringe packet fades this much per px away from the middle
$IfToneAt = @(0.15, 0.32, 0.52, 0.74, 0.90)                 # brightness thresholds of the phosphor tones 1..5
$IfLamp = @(13, 3)

function Get-FringeTone { param([double]$V) $t = 0; foreach ($th in $IfToneAt) { if ($V -ge $th) { $t++ } }; return $t }

function New-InterferometerFrame {
    param([bool]$Active, [int]$T = 0)
    $c = New-Canvas; $e = New-Canvas
    $P = $IfPal
    Write-Map $c 0 0 $IfBase $P
    if (-not $Active) {
        # idle: the screen at rest, a dim graticule (dots every 3 px on rows 7 and 11) and the flat trace across its middle;
        # the lamp off
        for ($x = $IfScreen[0]; $x -le $IfScreen[2]; $x++) {
            if ((($x - $IfScreen[0]) % 3) -eq 0) { Set-Px $c $x 7 $P['2']; Set-Px $c $x 11 $P['2'] }
            Set-Px $c $x 9 $P['3']
        }
        return @{ Color = $c; Emi = $e }
    }
    $f = $T % 8

    # ---- the fringes: bright and dark bands in a packet that fades towards the edges, scrolling right and sharpening
    for ($x = $IfScreen[0]; $x -le $IfScreen[2]; $x++) {
        $u = $x - $IfScreen[0]
        $pack = 1.0 - $IfEnvSlope * [Math]::Abs($u - ($IfScreen[2] - $IfScreen[0]) / 2.0)
        $v = $pack * (0.5 + 0.5 * $IfSharp[$f] * [Math]::Cos(2 * [Math]::PI * ($u - $f) / $IfPeriod))
        for ($y = $IfScreen[1]; $y -le $IfFringeY1; $y++) {
            $vy = $v
            if ($y -eq $IfScreen[1] -or $y -eq $IfFringeY1) { $vy = $v * 0.82 }
            $tone = Get-FringeTone $vy
            if ($tone -ge 2) { Set-Both $c $e $x $y $P[[string]$tone] } else { Set-Px $c $x $y $P[[string]$tone] }
        }
    }

    # ---- the trace: a dim baseline with a bright blip running right
    $ty = $IfScreen[3]
    for ($x = $IfScreen[0]; $x -le $IfScreen[2]; $x++) { Set-Px $c $x $ty $P['1'] }
    $bx = $IfScreen[0] + 1 + $f
    Set-Both $c $e ($bx - 1) $ty $P['3']; Set-Both $c $e $bx $ty $P['5']; Set-Both $c $e ($bx + 1) $ty $P['3']

    # ---- the status lamp is lit
    Set-Both $c $e $IfLamp[0] $IfLamp[1] $P['N']

    Sync-Emissive $c $e
    return @{ Color = $c; Emi = $e }
}
$IfZonePts = @(, $IfLamp)
for ($y = $IfScreen[1]; $y -le $IfScreen[3]; $y++) { for ($x = $IfScreen[0]; $x -le $IfScreen[2]; $x++) { $IfZonePts += , @($x, $y) } }
$IfZone = New-Zone $IfZonePts

# ============================================================================================
#  DATA ORBS - the interferometer's recordings and charts: one orb, three marks
#  a glassy blue-violet crystal sphere (11 px across, centred on 7,6) lit from the top left, darker towards its rim, with the
#  light it focuses showing as a pale caustic on the far side, held in a small steel cradle (claws on rows 9..11, a ring on row
#  12, a foot on row 13). The outline is drawn before the mark, so the three keep one silhouette; each mark is a 5x5 picture in
#  the middle of the glass (x5..9 y4..8) plus a few pixels of its own, always inside the sphere.
# ============================================================================================
#   glass: 0 spec, 1 light, 2 light-mid, 3 mid, 4 dark, 5 deep, h caustic     cradle: a spec, b light, m mid, n dark, o darkest
$OrbSpec = '0=F2F0FF 1=B4AEF4 2=8C84E6 3=6A5ED0 4=4C40A8 5=32287A h=9C94F0 a=EEF1F6 b=C2C8D2 m=949CAA n=68707E o=474E5A'
$OrbPal = New-Pal $OrbSpec
$OrbCx = 7; $OrbCy = 6; $OrbR = 5.5
$OrbSpecular = @(@(4, 3), @(5, 3), @(4, 4))                # the window's reflection, on the lit side
$CradleMap = @(
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '..b.........n...',
    '..mb.......mn...',
    '...mb.....mn....',
    '....mbabmnn.....',
    '.....nmmno......',
    '................',
    '................'
)
Assert-Map 'CradleMap' $CradleMap

function Test-InOrb { param([int]$X, [int]$Y) return ((($X - $OrbCx) * ($X - $OrbCx) + ($Y - $OrbCy) * ($Y - $OrbCy)) -le ($OrbR * $OrbR)) }

# The bare orb: glass, cradle and outline (no mark yet).
function New-OrbBase {
    $c = New-Canvas
    $P = $OrbPal
    for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
        if (-not (Test-InOrb $x $y)) { continue }
        $nx = ($x - $OrbCx) / $OrbR; $ny = ($y - $OrbCy) / $OrbR
        $r2 = $nx * $nx + $ny * $ny
        $nz = [Math]::Sqrt([Math]::Max(0.0, 1.0 - $r2))
        $t = 0.34 + 0.40 * (-0.55 * $nx - 0.62 * $ny + 0.56 * $nz)
        $tone = if ($t -ge 0.70) { 1 } elseif ($t -ge 0.56) { 2 } elseif ($t -ge 0.42) { 3 } elseif ($t -ge 0.28) { 4 } else { 5 }
        if ($r2 -gt 0.80) { $tone = [Math]::Min(5, $tone + 1) }     # the rim darkens
        $ch = [string]$tone
        # the light the sphere focuses lands on its far side, just inside the rim
        if ((0.62 * $nx + 0.70 * $ny) -gt 0.40 -and $r2 -gt 0.30 -and $r2 -le 0.80) { $ch = 'h' }
        Set-Px $c $x $y $P[$ch]
    } }
    Write-Map $c 0 0 $CradleMap $P
    Add-Outline $c
    foreach ($s in $OrbSpecular) { Set-Px $c $s[0] $s[1] $P['0'] }
    return $c
}

# Marks: a 5x5 picture drawn at x5..9 y4..8 ('.' keeps the glass) and extra pixels @(x, y, letter), all inside the sphere.
#   Moon: a pale grey crescent, its lit limb on the left (A limb, B body, C horn tips), and the rest of the disc in earthshine (D)
$MoonMark = @{
    Spec = 'A=EEEEE8 B=C6C6C0 C=96968F D=3A3466'
    Rows = @('.ABC.', 'ABDDD', 'ABDDD', 'ABDDD', '.BBC.')
    Extra = @()
}
#   Jupiter: cream zones (P lit, Q shade) and orange belts (R lit, S mid, T shade) with the red spot (K); the belt's asteroids (d)
$JupiterMark = @{
    Spec = 'P=F6E4BC Q=D2B282 R=EDA45A S=C87A36 T=9A5626 K=C44A2A d=DDD4C4'
    Rows = @('.PPQ.', 'RRSST', 'PPPQQ', 'RKSST', '.PQQ.')
    Extra = @(@(3, 7, 'd'), @(11, 5, 'd'), @(10, 9, 'd'), @(4, 5, 'd'))
}
#   Sagittarius A*: the shadow (k, its inner corners q so it reads round) inside a ring of orange-gold light, dim at the top (E,
#   F), brighter down the sides (G, H) and brightest along the bottom (I, J), as in the 2022 Event Horizon Telescope image; a faint
#   radio wave front (r) arcs past it towards the top right
$HoleMark = @{
    Spec = 'E=9C4420 F=C8642A G=E28A34 H=F4B048 I=FFD878 J=FFF4C8 k=180C1E q=5C2A1A r=9EB2F2'
    Rows = @('.EFE.', 'EqkqG', 'FkkkG', 'GqkqH', '.IJI.')
    Extra = @(@(9, 2, 'r'), @(10, 3, 'r'), @(11, 4, 'r'), @(11, 5, 'r'))
}
$MarkOrigin = @(5, 4)

function New-DataOrb {
    param($Mark)
    $c = New-OrbBase
    $P = New-Pal $Mark.Spec
    for ($j = 0; $j -lt $Mark.Rows.Count; $j++) {
        $row = $Mark.Rows[$j]
        for ($i = 0; $i -lt $row.Length; $i++) {
            $ch = [string]$row[$i]
            if ($ch -eq '.') { continue }
            $x = $MarkOrigin[0] + $i; $y = $MarkOrigin[1] + $j
            if (-not (Test-InOrb $x $y)) { throw "mark pixel $x,$y is outside the orb" }
            Set-Px $c $x $y $P[$ch]
        }
    }
    foreach ($px in $Mark.Extra) {
        if (-not (Test-InOrb $px[0] $px[1])) { throw "mark pixel $($px[0]),$($px[1]) is outside the orb" }
        Set-Px $c $px[0] $px[1] $P[[string]$px[2]]
    }
    return $c
}

# ============================================================================================
#  BUILD
# ============================================================================================
$FrameTime = 4
$McmetaText = "{`n  `"animation`": {`n    `"frametime`": $FrameTime`n  }`n}`n"   # Save-Mcmeta's bytes, as every face of the pack
$Faces = [ordered]@{
    'drill'          = @{ Dir = 'block/multiblock/mercury_vein_drill'; Builder = ${function:New-DrillFrame}; Zone = $DrZone; Casing = 'brick'
                          Glow = 'the hot point, its sparks and the lamps' }
    'works'          = @{ Dir = 'block/multiblock/mercury_solar_works'; Builder = ${function:New-SolarWorksFrame}; Zone = $WkZone; Casing = 'robust'
                          Glow = 'the focal spot, its halo, the rays and the lamp' }
    'field'          = @{ Dir = 'block/multiblock/mercury_solar_field'; Builder = ${function:New-SolarFieldFrame}; Zone = $FdZone; Casing = 'brick'
                          Glow = 'the lamp, the bar and the glint' }
    'interferometer' = @{ Dir = 'block/multiblock/interferometer'; Builder = ${function:New-InterferometerFrame}; Zone = $IfZone; Casing = 'brick'
                          Glow = 'the screen and the lamp' }
}
$Items = [ordered]@{
    'lunar_vlbi_recording'      = $MoonMark
    'outer_system_chart'        = $JupiterMark
    'sagittarius_a_star_signal' = $HoleMark
}

function Out-Overlay {
    param([string]$Dir, $Builder)
    $frames = @(); $emis = @()
    for ($f = 0; $f -lt 8; $f++) { $r = & $Builder $true $f; $frames += $r.Color; $emis += $r.Emi }
    $idle = & $Builder $false 0
    Out-Tex $idle.Color "$Dir/overlay_front.png"
    Out-Tex (Join-Frames $frames) "$Dir/overlay_front_active.png" $FrameTime
    Out-Tex (Join-Frames $emis) "$Dir/overlay_front_active_emissive.png" $FrameTime
}

foreach ($id in $Faces.Keys) { if (Test-Want $id) { Out-Overlay $Faces[$id].Dir $Faces[$id].Builder } }
if (Test-Want 'items') { foreach ($name in $Items.Keys) { Out-Tex (New-DataOrb $Items[$name]) "item/$name.png" } }

# ============================================================================================
#  VERIFY what was written: sizes (16x16 faces and items, 16x128 strips), binary alpha, no pure black, the .mcmeta bytes; on the
#  faces the empty casing ring around a panel without holes, 8 different active frames (none repeats another, the loop seam
#  included), an idle face that is not the first active frame, and an emissive layer that only holds pixels of the colour layer
#  of the same frame, only where the face has lights, lit in every frame; items neither empty nor fully opaque, the three orbs on
#  one silhouette and with three different marks
# ============================================================================================
function Get-AlphaMask { param($Img) return (($Img.P | ForEach-Object { if ((($_ -shr 24) -band 255) -ne 0) { '1' } else { '0' } }) -join '') }
function Get-FrameKey { param($Img, [int]$F) return (($Img.P[($F * 256)..($F * 256 + 255)]) -join ',') }

$faceByDir = @{}
foreach ($id in $Faces.Keys) { $faceByDir[$Faces[$id].Dir] = $Faces[$id] }
$problems = 0
foreach ($rel in $written) {
    $path = Join-Path $OutRoot ($rel -replace '/', '\')
    $msgs = @()
    if ($rel.EndsWith('.mcmeta')) {
        if ([System.IO.File]::ReadAllText($path) -ne $McmetaText) { $msgs += "not the pack's frametime $FrameTime .mcmeta" }
        if ($msgs.Count -gt 0) { $problems++; Write-Warning "$rel : $($msgs -join '; ')" }
        continue
    }
    $img = Read-Png $path
    $isFace = $rel -like 'block/multiblock/*'
    $emissive = $rel -like '*_emissive.png'
    $strip = ($rel -like '*_active.png') -or $emissive
    $nf = if ($strip) { 8 } else { 1 }
    if ($img.W -ne 16 -or $img.H -ne 16 * $nf) { $msgs += "size $($img.W)x$($img.H) (expected 16x$(16 * $nf))" }
    $opaque = 0; $black = 0; $partial = 0
    foreach ($px in $img.P) {
        $alpha = ($px -shr 24) -band 255
        if ($alpha -ne 0 -and $alpha -ne 255) { $partial++; continue }
        if ($alpha -eq 255) { $opaque++; if (($px -band 0xFFFFFF) -eq 0) { $black++ } }
    }
    if ($partial -gt 0) { $msgs += "$partial partially transparent px" }
    if ($black -gt 0) { $msgs += "$black pure-black px" }
    if ($opaque -eq 0) { $msgs += 'fully transparent' }
    if ($msgs.Count -eq 0 -and $isFace) {
        $face = $faceByDir[($rel -replace '/[^/]+$', '')]
        # the casing's outer 1 px ring stays visible in every frame; inside it the colour layers are a whole panel
        $ring = 0; $holes = 0
        for ($f = 0; $f -lt $nf; $f++) { for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
            $on = (($img.P[($f * 16 + $y) * 16 + $x] -shr 24) -band 255) -ne 0
            if ($x -lt 1 -or $y -lt 1 -or $x -gt 14 -or $y -gt 14) { if ($on) { $ring++ } }
            elseif (-not $emissive -and -not $on) { $holes++ }
        } } }
        if ($ring -gt 0) { $msgs += "$ring opaque px in the casing ring" }
        if ($holes -gt 0) { $msgs += "$holes transparent px inside the panel" }
        if ($strip -and -not $emissive) {
            $keys = @(); for ($f = 0; $f -lt $nf; $f++) { $keys += (Get-FrameKey $img $f) }
            for ($f = 0; $f -lt $nf; $f++) { for ($g = $f + 1; $g -lt $nf; $g++) { if ($keys[$f] -eq $keys[$g]) { $msgs += "active frame $f repeats as frame $g" } } }
            $idle = Read-Png (Join-Path $OutRoot (($rel -replace '_active\.png$', '.png') -replace '/', '\'))
            if ((Get-FrameKey $idle 0) -eq $keys[0]) { $msgs += 'the idle face is the first active frame' }
        }
        if ($emissive) {
            $color = Read-Png (Join-Path $OutRoot (($rel -replace '_emissive\.png$', '.png') -replace '/', '\'))
            $stray = 0; $outside = 0
            for ($i = 0; $i -lt $img.P.Length; $i++) {
                if ((($img.P[$i] -shr 24) -band 255) -eq 0) { continue }
                if ($i -ge $color.P.Length -or $img.P[$i] -ne $color.P[$i]) { $stray++ }
                if (-not $face.Zone.Contains($i % 256)) { $outside++ }
            }
            if ($stray -gt 0) { $msgs += "$stray emissive px not in the colour layer of their frame" }
            if ($outside -gt 0) { $msgs += "$outside emissive px outside $($face.Glow)" }
            $keys = @()
            for ($f = 0; $f -lt $nf; $f++) {
                $lit = 0
                for ($i = $f * 256; $i -lt ($f + 1) * 256; $i++) { if ((($img.P[$i] -shr 24) -band 255) -ne 0) { $lit++ } }
                if ($lit -eq 0) { $msgs += "emissive frame $f is empty" }
                $keys += (Get-FrameKey $img $f)
            }
            $distinct = @($keys | Select-Object -Unique).Count
            if ($distinct -lt 4) { $msgs += "only $distinct distinct emissive frames" }
        }
    }
    if ($msgs.Count -eq 0 -and -not $isFace -and $opaque -eq $img.P.Length) { $msgs += 'item icon is fully opaque (no transparent background)' }
    if ($msgs.Count -gt 0) { $problems++; Write-Warning "$rel : $($msgs -join '; ')" }
}

# the orbs: one silhouette, three different marks
$orbRels = @($Items.Keys | ForEach-Object { "item/$_.png" } | Where-Object { $written -contains $_ })
if ($orbRels.Count -gt 1) {
    $orbs = @{}
    foreach ($rel in $orbRels) { $orbs[$rel] = Read-Png (Join-Path $OutRoot ($rel -replace '/', '\')) }
    $mask0 = Get-AlphaMask $orbs[$orbRels[0]]
    for ($i = 1; $i -lt $orbRels.Count; $i++) {
        if ((Get-AlphaMask $orbs[$orbRels[$i]]) -ne $mask0) { $problems++; Write-Warning "$($orbRels[$i]) : silhouette differs from $($orbRels[0])" }
        for ($j = 0; $j -lt $i; $j++) {
            if (($orbs[$orbRels[$i]].P -join ',') -eq ($orbs[$orbRels[$j]].P -join ',')) { $problems++; Write-Warning "$($orbRels[$i]) : identical to $($orbRels[$j])" }
        }
    }
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
    function New-Flat { param([int]$Argb) $c = New-Canvas; for ($i = 0; $i -lt 256; $i++) { $c.P[$i] = $Argb }; return $c }
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
    # A stand-in for GTM's robust tungstensteel machine casing (drawn here for the review only, never shipped): a dark blue-grey
    # plate with a bevel, a recessed middle panel and four bolts.
    function New-RobustStandIn {
        $pal = New-Pal 'a=62627E b=56566F c=4A4A62 d=3E3E52 e=30303F f=74749A'
        $c = New-Canvas
        for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
            $ch = 'c'
            if ($x -eq 15 -or $y -eq 15) { $ch = 'e' } elseif ($x -eq 0 -or $y -eq 0) { $ch = 'a' }
            elseif ($x -eq 14 -or $y -eq 14) { $ch = 'd' } elseif ($x -eq 1 -or $y -eq 1) { $ch = 'b' }
            elseif (($x -eq 3 -or $y -eq 3) -and $x -le 12 -and $y -le 12) { $ch = 'd' }
            elseif (($x -eq 12 -or $y -eq 12) -and $x -ge 3 -and $y -ge 3) { $ch = 'b' }
            if (($x -eq 2 -or $x -eq 13) -and ($y -eq 2 -or $y -eq 13)) { $ch = 'f' }
            $c.P[$y * 16 + $x] = $pal[$ch]
        } }
        return $c
    }

    $brickPath = Join-Path $OutRoot 'block\hermean_heat_shield_brick.png'
    if (Test-Path -LiteralPath $brickPath) { $brick = Read-Png $brickPath }
    else { Write-Warning 'preview: block/hermean_heat_shield_brick.png not found, a flat pale plate stands in'; $brick = New-Flat (Hex 'DAD3C5') }
    $casings = @{ brick = $brick; robust = (New-RobustStandIn) }
    $checker = New-Canvas
    for ($i = 0; $i -lt 256; $i++) { $checker.P[$i] = if (((($i % 16) + [int][Math]::Floor($i / 16)) % 2) -eq 0) { Hex '3C4048' } else { Hex '4A4F58' } }
    $night = New-Flat (Hex '0A0B0D')
    $slot = New-Flat (Hex '8B8B8B')
    $darkSlot = New-Flat (Hex '2A2D33')

    $k = 8; $gap = 16; $cell = 16 * $k + $gap; $wallRow = 48 * $k + $gap
    $faceIds = @($Faces.Keys | Where-Object { Test-Want $_ })
    $withItems = Test-Want 'items'
    $height = $gap + $faceIds.Count * (2 * $cell + $wallRow)
    if ($withItems) { $height += $cell + 32 + $gap }
    $sheet = New-Canvas ($gap + 10 * $cell) $height
    $bgRow = New-Object 'int[]' $sheet.W
    $bg = Hex '1E2126'
    for ($i = 0; $i -lt $sheet.W; $i++) { $bgRow[$i] = $bg }
    for ($y = 0; $y -lt $sheet.H; $y++) { [Array]::Copy($bgRow, 0, $sheet.P, $y * $sheet.W, $sheet.W) }

    $y0 = $gap
    foreach ($id in $faceIds) {
        $face = $Faces[$id]
        $cs = $casings[$face.Casing]
        $dir = Join-Path $OutRoot ($face.Dir -replace '/', '\')
        $idle = Read-Png (Join-Path $dir 'overlay_front.png')
        $act = Read-Png (Join-Path $dir 'overlay_front_active.png')
        $emi = Read-Png (Join-Path $dir 'overlay_front_active_emissive.png')
        $lit = @(); for ($f = 0; $f -lt 8; $f++) { $lit += (Merge-On (Get-Frame $act $f) (Get-Frame $emi $f)) }
        # row 1: idle, the 8 working frames and a dark room, on the casing; row 2: the raw colour layer (idle, then frame 0) on a
        # checker around the emissive layer alone, frame by frame
        Add-Blit $sheet (Merge-On $cs $idle) $gap $y0 $k
        for ($f = 0; $f -lt 8; $f++) { Add-Blit $sheet (Merge-On $cs $lit[$f]) ($gap + (1 + $f) * $cell) $y0 $k }
        Add-Blit $sheet (Get-Dark $cs (Get-Frame $act 0) (Get-Frame $emi 0)) ($gap + 9 * $cell) $y0 $k
        $y1 = $y0 + $cell
        Add-Blit $sheet (Merge-On $checker $idle) $gap $y1 $k
        for ($f = 0; $f -lt 8; $f++) { Add-Blit $sheet (Merge-On $night (Get-Frame $emi $f)) ($gap + (1 + $f) * $cell) $y1 $k }
        Add-Blit $sheet (Merge-On $checker (Get-Frame $act 0)) ($gap + 9 * $cell) $y1 $k
        # row 3: a 3x3 wall of the casing, idle and working, at x8, then the same walls at x2 and x1
        $y2 = $y1 + $cell
        Add-Blit $sheet (New-Wall $cs $idle) $gap $y2 $k
        Add-Blit $sheet (New-Wall $cs $lit[0]) ($gap + 48 * $k + $gap) $y2 $k
        $sx = $gap + 2 * (48 * $k + $gap)
        Add-Blit $sheet (New-Wall $cs $idle) $sx $y2 2
        Add-Blit $sheet (New-Wall $cs $lit[0]) ($sx + 96 + $gap) $y2 2
        Add-Blit $sheet (New-Wall $cs $idle) $sx ($y2 + 96 + $gap) 1
        Add-Blit $sheet (New-Wall $cs $lit[0]) ($sx + 48 + $gap) ($y2 + 96 + $gap) 1
        $y0 = $y2 + $wallRow
    }
    if ($withItems) {
        # the three orbs at x8 on slot grey and on a dark slot, then at x2 (the usual GUI scale) on slot grey
        $orbTex = @($Items.Keys | ForEach-Object { Read-Png (Join-Path $OutRoot "item\$_.png") })
        for ($i = 0; $i -lt $orbTex.Count; $i++) {
            Add-Blit $sheet (Merge-On $slot $orbTex[$i]) ($gap + $i * $cell) $y0 $k
            Add-Blit $sheet (Merge-On $darkSlot $orbTex[$i]) ($gap + (3 + $i) * $cell) $y0 $k
            Add-Blit $sheet (Merge-On $slot $orbTex[$i]) ($gap + 6 * $cell + $i * (32 + $gap)) $y0 2
            Add-Blit $sheet (Merge-On $darkSlot $orbTex[$i]) ($gap + 6 * $cell + $i * (32 + $gap)) ($y0 + 32 + $gap) 2
            Add-Blit $sheet (Merge-On $slot $orbTex[$i]) ($gap + 6 * $cell + $i * (32 + $gap)) ($y0 + 2 * (32 + $gap)) 1
        }
    }

    $pdir = Split-Path -Parent $Preview
    if ($pdir -and -not (Test-Path -LiteralPath $pdir)) { New-Item -ItemType Directory -Force -Path $pdir | Out-Null }
    $bmp = ConvertTo-Bitmap $sheet
    try { $bmp.Save($Preview, [System.Drawing.Imaging.ImageFormat]::Png) } finally { $bmp.Dispose() }
    Write-Host "preview: $Preview (x$k; per face: idle, 8 working frames and a dark room on its casing; the raw layer on a checker around the emissive layer alone; 3x3 walls at x8, x2 and x1; then the orbs at x8 and x2)"
}

if ($problems -gt 0) { throw "$problems file(s) failed the texture checks (see the warnings above)" }

if ($Credits) {
    Write-Host ''
    foreach ($rel in $written) {
        Write-Host ("| ``pack/kubejs/assets/grindless/textures/$rel`` | Generated with tools/assets/$ScriptName (procedural pixel art, original) by the assets agent, 2026-10-25 | the pack's licence (pending; proposed CC BY-SA 4.0) |")
    }
}
