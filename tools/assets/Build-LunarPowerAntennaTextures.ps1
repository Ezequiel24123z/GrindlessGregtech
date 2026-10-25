<#
.SYNOPSIS
  Procedural 16x16 pixel art for the lunar power and the deep space antenna of the EV era of Gregtech Grindless: the controller faces
  of the Lunar Solar Array and of the Deep Space Antenna (GregTech style: bevels, top-left light, every pixel fully opaque or fully
  transparent). The array's field is built from the EV Tripod Drill's Solar Wing Panel (grindless:solar_wing_panel), whose textures
  belong to that package.

.DESCRIPTION
  Every pixel is drawn by this script (palettes + char maps + small routines); nothing is copied or edited from GregTech Modern,
  GregTech Leisure, TerraFirmaGreg or any other mod (the array is made like TFG's large solar panel, an idea only: docs/eras/ev.md).
  Output is deterministic: re-running overwrites the same bytes (the ground's grain comes from Get-Noise, a hash of the position,
  not from a random generator). Same method, neutral steel ramp, EV purple and checks as the other EV faces (Build-EVTextures.ps1,
  Build-EVFoundationTextures.ps1) and the generator array (Build-GeneratorArrayTextures.ps1); the helpers are copied so those
  scripts stay untouched.

  Writes (under pack/kubejs/assets/grindless/textures/):
    block/multiblock/lunar_solar_array/overlay_front.png, overlay_front_active.png(+.mcmeta), overlay_front_active_emissive.png(+.mcmeta)
    block/multiblock/deep_space_antenna/overlay_front.png, overlay_front_active.png(+.mcmeta), overlay_front_active_emissive.png(+.mcmeta)

  Both faces share one EV control panel: a steel bezel around a recessed window on the black lunar sky, the window's lit floor edge
  and a recessed base strip that carries the EV purple lights and the status lamp.
    Lunar Solar Array   the sun in the window's top-left corner over a navy PV panel tilted towards it (a titanium frame, silver
                        busbars) on two titanium legs over grey regolith; a cable runs down the left leg into the base strip, which
                        carries three purple power LEDs, the cable's inlet light and the lamp. 8 frames, frametime 3: the sun glows
                        and its rays pulse, a glint sweeps across the cells, beads of power run down the cable and the power spreads
                        from the inlet to the LEDs. Idle is the lunar night: a dull grey sun, a dull panel, dark LEDs, red lamp.
    Deep Space Antenna  the far side of the Moon (no Earth in the sky): a titanium dish seen from the side, pointing up and right
                        at a tiny red-orange Mars in the window's far corner, its feed horn on a boom at the focus; the base strip
                        carries purple EV stripes, the data LED and the lamp. 8 frames, frametime 3: radio wave arcs leave Mars one
                        after another and close in on the dish, the feed horn glows when one arrives, the data LED blinks and two
                        stars twinkle. Idle: a dark dish, no arcs, dark data LED, red lamp.

  Run from the repo root (PowerShell 5.1 blocks unsigned scripts by default; this bypass only affects that process):
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-LunarPowerAntennaTextures.ps1
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-LunarPowerAntennaTextures.ps1 -Preview C:\path\lunar-power.png -Casing C:\path\casing.png
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-LunarPowerAntennaTextures.ps1 -Credits

  Overlay conventions (GTM's workable casings, as every other set): transparent background, details only on the overlay, animated
  variants are vertical 16x(16*n) strips with a .png.mcmeta, *_emissive layers hold only the pixels that glow (identical to the colour
  layer). The outer 1 px ring is always left empty so the casing shows around the face. Both faces are drawn for
  grindless:sintered_regolith (block/sintered_regolith.png), the brick every structure of the lunar base is built from.

.PARAMETER OutRoot
  Textures root. Default: <repo>/pack/kubejs/assets/grindless/textures
.PARAMETER Preview
  Also write a review sheet (nearest neighbour, x6) to this PNG, which must be outside the repository (it is never shipped): for each
  face, the face on the casing (idle, every active frame with its emissive layer, a dark-room view); the two controllers in a 3x3 wall
  of casing, idle and working.
.PARAMETER Casing
  Optional 16x16 PNG used as the casing in the preview. Default: the sintered regolith bricks (block/sintered_regolith.png under
  OutRoot); if that file is missing too, a plain warm grey plate drawn by code.
.PARAMETER Credits
  Also print the CREDITS.md "Assets" table rows for the files written.
#>
[CmdletBinding()]
param(
    [string]$OutRoot = '',
    [string]$Preview = '',
    [string]$Casing = '',
    [switch]$Credits
)
$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'Pixel.Lib.ps1')

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
if ($Casing) { $Casing = $ExecutionContext.SessionState.Path.GetUnresolvedProviderPathFromPSPath($Casing) }

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

# Deterministic 0..255 hash of (x, y, frame, salt): grain without a random generator.
function Get-Noise {
    param([long]$X, [long]$Y, [long]$T = 0, [long]$Salt = 0)
    $h = (($X * 73856093L) -bxor ($Y * 19349663L) -bxor ($T * 83492791L) -bxor ($Salt * 2654435761L)) % 1000003L
    if ($h -lt 0) { $h = -$h }
    return [int](($h * 7919L) % 256L)
}

# The char a 16x16 map holds at (x, y), '.' outside it.
function Get-MapChar {
    param([string[]]$Rows, [int]$X, [int]$Y)
    if ($X -lt 0 -or $Y -lt 0 -or $Y -ge $Rows.Count -or $X -ge $Rows[$Y].Length) { return '.' }
    return [string]$Rows[$Y][$X]
}

# Neutral steel ramp shared by every overlay (lit -> dark), the same one as the LV to EV sets: the bezels.
$SteelSpec = 'A=D3D3D3 B=B0B0B0 C=8E8E8E D=707070 E=565656 F=404040 G=2F2F2F H=222222 I=161616 J=0D0D0D'
# EV tier purple, lit -> dark (the same as Build-EVTextures.ps1): power LEDs, beads, stripes.
$PurpleSpec = 'a=F3E4FF b=D6B0FF c=B07AF0 d=8A4CD0 e=5C2E9C f=381C64 g=1C0E36'
# State lamp: green while working (M..P), red while idle (Q..S).
$LampSpec = 'M=E2FFE4 N=62FF86 O=22C257 P=0C6B2E Q=FF5A48 R=B52D22 S=5E1511'
# Titanium as the array builds it: a light blue-grey, lit -> dark (panel frames, legs, the dish).
$TitaniumSpec = '0=F4F7FA 1=DCE3EA 2=C2CCD7 3=A3AEBC 4=828D9D 5=626C7C 6=454D5A'
# Monocrystalline silicon cells, deep navy: sheen -> darkest (never black).
$CellSpec = 'k=4467B0 l=2E4E92 m=243F7C n=1B3166 o=152752 p=101D40'
# Silver busbars: joint, bar, shaded bar.
$BusSpec = 'r=E4EAF1 s=B3BECB t=8893A2'
# The lunar sky (black even by day, a hint of blue so it is never pure black) and its stars.
$SkySpec = 'q=0B0E17 v=8A94A8 w=F4F8FF'
# Grey lunar regolith seen through the window (lit -> the deepest shadow).
$GroundSpec = 'K=B4B4AB L=9C9C94 T=82827B U=66665F Y=4C4C47'

# The EV control panel both faces share: a steel bezel, a recessed window x3..13, y3..11 on the black lunar sky (q) with the bezel's
# shadow on its top and left inner edges, the window's lit floor edge (y12) and a recessed base strip (y13) for the lights.
$EvPanel = @(
    '................',
    '.CDDDDDDDDDDDDE.',
    '.DGGGGGGGGGGGGF.',
    '.DGqqqqqqqqqqqF.',
    '.DGqqqqqqqqqqqF.',
    '.DGqqqqqqqqqqqF.',
    '.DGqqqqqqqqqqqF.',
    '.DGqqqqqqqqqqqF.',
    '.DGqqqqqqqqqqqF.',
    '.DGqqqqqqqqqqqF.',
    '.DGqqqqqqqqqqqF.',
    '.DGqqqqqqqqqqqF.',
    '.DDDDDDDDDDDDDF.',
    '.DGGGGGGGGGGGGF.',
    '.EFFFFFFFFFFFFG.',
    '................'
)
Assert-Map 'EvPanel' $EvPanel

# ============================================================================================
#  LUNAR SOLAR ARRAY - controller face (sintered regolith)
#  the sun in the window's top-left corner (its centre sits behind the corner); a navy PV panel tilted towards it (a parallelogram:
#  titanium top and left frame, three rows of cells, silver busbars slanting with the panel, a shaded bottom frame; it runs on past
#  the right wall like the rest of the field) on two titanium legs over grey regolith, its shadow on the ground to the right. A
#  cable runs down the left leg, through the window's floor, into the base strip: purple power LEDs at x4, x6 and x10, the cable's
#  inlet light at x8 and the lamp at x12..13.
# ============================================================================================
#   h..j the sun (white-hot, yellow, orange limb), u its rays; x..z the sun at night; W/X the glint (core, halo)
$SolarPal = New-Pal ($SteelSpec + ' ' + $PurpleSpec + ' ' + $LampSpec + ' ' + $TitaniumSpec + ' ' + $CellSpec + ' ' + $BusSpec + ' ' +
    $SkySpec + ' ' + $GroundSpec + ' ' + @'
h=FFFBEA i=FFE07A j=FFB43C u=FFF1BC
x=6E717B y=50535C z=3A3D45
W=F2F8FF X=8FB4EC
'@)

# The panel and its legs (drawn over the window). Each row of the panel starts one pixel further left than the one above.
$SolarScene = @(
    '................',
    '................',
    '................',
    '................',
    '................',
    '..........0111..',
    '.........1mmsm..',
    '........1mmsmm..',
    '.......1nnsnns..',
    '......24444444..',
    '........3...4...',
    '................',
    '................',
    '................',
    '................',
    '................'
)
Assert-Map 'SolarScene' $SolarScene

# The sun: a quarter disc in the corner (day), a dull grey disc (night); its rays east, south-east and south (inner, outer pixel).
$SunDay = @('hhi', 'hij', 'ij.')
$SunNight = @('xxy', 'xyz', 'yz.')
$SunRays = @(
    @(@(7, 3), @(8, 3)),
    @(@(6, 6), @(7, 7)),
    @(@(3, 7), @(3, 8))
)
$SolarStars = @(@(12, 3, 'w'), @(9, 4, 'v'), @(5, 9, 'v'))
# The cable from the panel's bottom frame down the left leg and through the window's floor; the inlet light is at (8, 13).
$SolarCable = @(@(8, 9), @(8, 10), @(8, 11), @(8, 12))

function New-SolarArrayFrame {
    param([bool]$Active, [int]$T = 0)
    $c = New-Canvas; $e = New-Canvas
    $P = $SolarPal
    Write-Map $c 0 0 $EvPanel $P
    # at night (idle) the whole landscape is dim
    $dim = $(if ($Active) { 1.0 } else { 0.6 })

    foreach ($s in $SolarStars) { Set-Px $c $s[0] $s[1] $P[$s[2]] }

    # regolith (y11): lit to the left, the panel's shadow under and right of it
    for ($x = 3; $x -le 13; $x++) {
        $n = Get-Noise $x 11 0 51
        if ($x -ge 7) { $ch = $(if ($n -lt 110) { 'U' } else { 'T' }) } else { $ch = $(if ($n -lt 120) { 'K' } else { 'L' }) }
        Set-Px $c $x 11 (Shade $P[$ch] $dim)
    }

    # the panel and its legs; the cable in the ground and through the window's floor
    for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
        $ch = Get-MapChar $SolarScene $x $y
        if ($ch -eq '.') { continue }
        Set-Px $c $x $y (Shade $P[$ch] $dim)
    } }
    Set-Px $c 8 11 $P['F']; Set-Px $c 8 12 $P['E']

    # the sun
    $disc = $(if ($Active) { $SunDay } else { $SunNight })
    for ($j = 0; $j -lt 3; $j++) { for ($i = 0; $i -lt 3; $i++) {
        $ch = [string]$disc[$j][$i]
        if ($ch -eq '.') { continue }
        if ($Active) { Set-Both $c $e (3 + $i) (3 + $j) $P[$ch] } else { Set-Px $c (3 + $i) (3 + $j) $P[$ch] }
    } }

    if ($Active) {
        # the rays pulse: short for two frames, long for two
        $long = (($T % 4) -ge 2)
        foreach ($ray in $SunRays) {
            Set-Both $c $e $ray[0][0] $ray[0][1] $P[$(if ($long) { 'i' } else { 'u' })]
            if ($long) { Set-Both $c $e $ray[1][0] $ray[1][1] $P['u'] }
        }
        # a glint sweeps across the cells: a short band along the busbars' slant moving right, then a pause
        if ($T -le 5) {
            $gx = 8 + $T
            foreach ($g in @(@(($gx + 2), 6, 'X'), @(($gx + 1), 7, 'W'), @($gx, 8, 'X'))) {
                $ch = Get-MapChar $SolarScene $g[0] $g[1]
                if ($ch -eq 'm' -or $ch -eq 'n' -or $ch -eq 's') { Set-Both $c $e $g[0] $g[1] $P[$g[2]] }
            }
        }
        # a bead of power runs down the cable with a dimmer tail
        $k = $T % 4
        $b = $SolarCable[$k]; Set-Both $c $e $b[0] $b[1] $P['b']
        if ($k -ge 1) { $b = $SolarCable[$k - 1]; Set-Both $c $e $b[0] $b[1] $P['d'] }
    }

    # base strip (y13): sockets, the three power LEDs and the inlet, the lamp
    foreach ($x in 3, 5, 7, 9, 11) { Set-Px $c $x 13 $P['I'] }
    if ($Active) {
        # the power spreads from the inlet (as the bead arrives) to the LEDs next to it, then to the far one
        $phase = $T % 4
        $bright = @()
        if ($phase -eq 0) { $bright = @(8) } elseif ($phase -eq 1) { $bright = @(6, 10) } elseif ($phase -eq 2) { $bright = @(4) }
        foreach ($x in 4, 6, 8, 10) { Set-Both $c $e $x 13 $P[$(if ($bright -contains $x) { 'a' } else { 'd' })] }
        Set-Both $c $e 13 13 $P['N']; Set-Px $c 12 13 $P['O']
    } else {
        foreach ($x in 4, 6, 10) { Set-Px $c $x 13 $P['f'] }
        Set-Px $c 8 13 $P['E']
        Set-Px $c 13 13 $P['R']; Set-Px $c 12 13 $P['S']
    }

    Sync-Emissive $c $e
    return @{ Color = $c; Emi = $e }
}

# ============================================================================================
#  DEEP SPACE ANTENNA - controller face (sintered regolith)
#  the far side of the Moon, so no Earth in the sky: a tiny red-orange Mars in the window's far top-right corner; at the lower left a
#  titanium dish seen from the side, its rim a straight edge facing up and right at Mars and its bowl bulging behind, the upper tip
#  catching the light; a boom from the middle of the dish to the feed horn at the focus; a short mount on a pad over the regolith,
#  the dish's shadow on the ground to its right. Base strip: purple EV stripes, the data LED (x10) and the lamp (x12..13).
#  The radio arcs are drawn as rings around Mars, only on the side facing the feed; each one lives four frames and arrives at the
#  feed on the fifth, when the next one leaves Mars.
# ============================================================================================
#   r..t Mars (lit, mid, dark, as on the Mars chart); h..k the radio arcs and the feed glow (bright -> dim); l the data LED off
$AntennaPal = New-Pal ($SteelSpec + ' ' + $PurpleSpec + ' ' + $LampSpec + ' ' + $TitaniumSpec + ' ' + $SkySpec + ' ' + $GroundSpec + ' ' + @'
r=E2683A s=B5481F t=7E2C12
h=EAF8FF i=A6DAFF j=5EA8F0 k=2E68B8 l=1A3150
'@)

# Mars, the dish (rim 1/0, bowl 2..5 darkening away from the light), the boom (E) and the feed horn (2), the mount and its pad.
$AntennaScene = @(
    '................',
    '................',
    '................',
    '............rs..',
    '............st..',
    '................',
    '....0...2.......',
    '....21.E........',
    '...3321.........',
    '....4321........',
    '....E5432.......',
    '...CDE..........',
    '................',
    '................',
    '................',
    '................'
)
Assert-Map 'AntennaScene' $AntennaScene

$MarsCentre = @(13.0, 4.0)
$FeedPx = @(8, 6)
$BoomPx = @(7, 7)
# the arcs face the feed: the direction from Mars to the feed's centre, and half the angle they span
$ArcAim = [Math]::Atan2(($FeedPx[1] + 0.5) - $MarsCentre[1], ($FeedPx[0] + 0.5) - $MarsCentre[0])
$ArcHalfSpan = 45.0 * [Math]::PI / 180.0
$ArcTone = @('k', 'j', 'j', 'i')
$AntennaStars = @(@(4, 4, 'w'), @(7, 3, 'v'), @(11, 9, 'v'))

# One radio arc: the window pixels about Radius from Mars's centre, on the side that faces the feed.
function Add-RadioArc {
    param($C, $E, [double]$Radius, [int]$Argb)
    for ($y = 3; $y -le 11; $y++) { for ($x = 3; $x -le 13; $x++) {
        $dx = ($x + 0.5) - $MarsCentre[0]; $dy = ($y + 0.5) - $MarsCentre[1]
        $d = [Math]::Sqrt($dx * $dx + $dy * $dy)
        if ([Math]::Abs($d - $Radius) -ge 0.5) { continue }
        $diff = [Math]::Atan2($dy, $dx) - $ArcAim
        while ($diff -gt [Math]::PI) { $diff -= 2 * [Math]::PI }
        while ($diff -lt -[Math]::PI) { $diff += 2 * [Math]::PI }
        if ([Math]::Abs($diff) -gt $ArcHalfSpan) { continue }
        Set-Both $C $E $x $y $Argb
    } }
}

function New-DeepSpaceAntennaFrame {
    param([bool]$Active, [int]$T = 0)
    $c = New-Canvas; $e = New-Canvas
    $P = $AntennaPal
    Write-Map $c 0 0 $EvPanel $P

    # stars; while it listens two of them twinkle, each on its own frame
    foreach ($s in $AntennaStars) {
        $col = $s[2]
        if ($Active -and (($s[0] -eq 7 -and $T -eq 2) -or ($s[0] -eq 11 -and $T -eq 6))) { $col = 'w' }
        Set-Px $c $s[0] $s[1] $P[$col]
    }

    # regolith (y11): lit, with the dish's shadow to the right of its pad
    for ($x = 3; $x -le 13; $x++) {
        $n = Get-Noise $x 11 0 53
        if ($x -ge 6 -and $x -le 9) { $ch = $(if ($n -lt 110) { 'U' } else { 'T' }) } else { $ch = $(if ($n -lt 120) { 'K' } else { 'L' }) }
        Set-Px $c $x 11 $P[$ch]
    }

    # the radio arcs come first, so Mars, the dish and the feed cover them
    $arrival = $false
    if ($Active) {
        foreach ($born in 0, 4) {
            $age = (($T - $born) % 8 + 8) % 8
            if ($age -le 3) { Add-RadioArc $c $e (1.5 + $age) $P[$ArcTone[$age]] }
            elseif ($age -eq 4) { $arrival = $true }
        }
    }

    # Mars, the dish, the boom and the feed (the dish is dark while the antenna is off)
    for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
        $ch = Get-MapChar $AntennaScene $x $y
        if ($ch -eq '.') { continue }
        $col = $P[$ch]
        if (-not $Active -and $ch -match '[0-6C-E]') { $col = Shade $col 0.6 }
        Set-Px $c $x $y $col
    } }
    if ($Active) {
        # the feed horn glows as an arc arrives and fades on the next frame; the boom carries it to the dish
        if ($arrival) { Set-Both $c $e $FeedPx[0] $FeedPx[1] $P['h']; Set-Both $c $e $BoomPx[0] $BoomPx[1] $P['j'] }
        elseif (($T % 4) -eq 1) { Set-Both $c $e $FeedPx[0] $FeedPx[1] $P['i'] }
    }

    # base strip (y13): purple EV stripes (x3..8), the data LED (x10) between sockets, the lamp (x12..13)
    for ($x = 3; $x -le 8; $x++) { Set-Px $c $x 13 $P[$(if ((($x - 3) % 3) -eq 2) { 'g' } else { 'd' })] }
    foreach ($x in 9, 11) { Set-Px $c $x 13 $P['I'] }
    if ($Active) {
        # the data LED blinks as each arc is written: bright on arrival, dimmer on the next frame
        $ph = $T % 4
        if ($ph -eq 0) { Set-Both $c $e 10 13 $P['h'] } elseif ($ph -eq 1) { Set-Both $c $e 10 13 $P['i'] } else { Set-Px $c 10 13 $P['l'] }
        Set-Both $c $e 13 13 $P['N']; Set-Px $c 12 13 $P['O']
    } else {
        Set-Px $c 10 13 $P['l']
        Set-Px $c 13 13 $P['R']; Set-Px $c 12 13 $P['S']
    }

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

Out-Overlay 'block/multiblock/lunar_solar_array' ${function:New-SolarArrayFrame} 3
Out-Overlay 'block/multiblock/deep_space_antenna' ${function:New-DeepSpaceAntennaFrame} 3

# ============================================================================================
#  VERIFY what was written. Every file: binary alpha, no pure black. Plain block textures (none today): 16x16 and fully opaque.
#  Overlays: 16 px wide, height a multiple of 16, a .mcmeta for every strip, 4-8 frames with at least 4 distinct ones for the colour strips, the casing
#  ring empty in every frame, the emissive strip a subset of the colour strip.
# ============================================================================================
$problems = 0
foreach ($rel in $written) {
    if ($rel.EndsWith('.mcmeta')) { continue }
    $path = Join-Path $OutRoot ($rel -replace '/', '\')
    $img = Read-Png $path
    $msgs = @()
    $overlay = $rel -like 'block/multiblock/*'
    if ($overlay) {
        if ($img.W -ne 16 -or ($img.H % 16) -ne 0) { $msgs += "bad size $($img.W)x$($img.H)" }
    } elseif ($img.W -ne 16 -or $img.H -ne 16) { $msgs += "bad size $($img.W)x$($img.H) (expected 16x16)" }
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
    if ($black -gt 0) { $msgs += "$black pure-black px" }
    if ($opaque -eq 0) { $msgs += 'fully transparent' }
    if (-not $overlay -and $opaque -ne $img.P.Length) { $msgs += "block texture is not fully opaque ($opaque of $($img.P.Length) px)" }
    $nf = [int][Math]::Floor($img.H / 16)
    if (Test-Path -LiteralPath ($path + '.mcmeta')) {
        if ($nf -lt 4 -or $nf -gt 8) { $msgs += "animation has $nf frames (expected 4-8)" }
        if ($rel -notlike '*_emissive.png') {
            $seen = @{}
            for ($f = 0; $f -lt $nf; $f++) { $seen[(($img.P[($f * 256)..($f * 256 + 255)]) -join ',')] = 1 }
            if ($seen.Count -lt 4) { $msgs += "only $($seen.Count) distinct frames out of $nf" }
        }
    } elseif ($nf -gt 1) { $msgs += "a $nf-frame strip without its .mcmeta" }
    if ($overlay) {
        for ($f = 0; $f -lt $nf; $f++) { for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
            if ($x -lt 1 -or $y -lt 1 -or $x -ge 15 -or $y -ge 15) {
                if ((($img.P[($f * 16 + $y) * 16 + $x] -shr 24) -band 255) -ne 0) { $msgs += "opaque pixel in the casing ring (frame $f, $x,$y)"; $f = $nf; $y = 16; break }
            }
        } } }
    }
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

# ============================================================================================
#  PREVIEW (optional, never shipped)
# ============================================================================================
if ($Preview) {
    # a plain bevelled warm grey plate standing in for the sintered regolith bricks when no casing PNG is found
    function New-StandInRegolith {
        $c = New-Canvas 16 16
        $pal = New-Palette 'a=A09B90 b=827D73 c=7A756C e=645F57 f=46423C'
        for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
            $ch = 'b'
            if ($x -eq 0 -or $y -eq 0) { $ch = 'a' } elseif ($x -eq 15 -or $y -eq 15) { $ch = 'f' }
            elseif ($x -eq 14 -or $y -eq 14) { $ch = 'e' } elseif ((($x + 2 * $y) % 7) -eq 0) { $ch = 'c' }
            $c.P[$y * 16 + $x] = $pal[$ch]
        } }
        return $c
    }
    function Get-Frame { param($Strip, [int]$Index) $f = New-Canvas 16 16; [Array]::Copy($Strip.P, $Index * 256, $f.P, 0, 256); return $f }
    function Merge-On { param($Dst, $Src) $o = Copy-Canvas $Dst; Merge-Canvas $o $Src; return $o }
    function Get-Dark {
        param($Base, $Col, $Emi)
        $o = Merge-On $Base $Col
        for ($i = 0; $i -lt $o.P.Length; $i++) { $o.P[$i] = Shade $o.P[$i] 0.25 }
        return (Merge-On $o $Emi)
    }
    $casingPath = $(if ($Casing) { $Casing } else { Join-Path $OutRoot 'block\sintered_regolith.png' })
    if (Test-Path -LiteralPath $casingPath) { $casingTex = Read-Png $casingPath }
    elseif ($Casing) { throw "-Casing not found: $Casing" }
    else { Write-Host "preview: $casingPath not found, a plain stand-in plate is used as the casing"; $casingTex = New-StandInRegolith }

    # per face: idle, the 8 active frames with their emissive layer, a dark room (casing and colour at 25 %, emissive at full)
    $faceRows = New-Object System.Collections.Generic.List[object]
    $walls = New-Object System.Collections.Generic.List[object]
    foreach ($dirRel in 'block/multiblock/lunar_solar_array', 'block/multiblock/deep_space_antenna') {
        $dir = Join-Path $OutRoot ($dirRel -replace '/', '\')
        $idle = Read-Png (Join-Path $dir 'overlay_front.png')
        $act = Read-Png (Join-Path $dir 'overlay_front_active.png')
        $emi = Read-Png (Join-Path $dir 'overlay_front_active_emissive.png')
        $tiles = New-Object System.Collections.Generic.List[object]
        $tiles.Add((Merge-On $casingTex $idle))
        for ($f = 0; $f -lt 8; $f++) { $tiles.Add((Merge-On (Merge-On $casingTex (Get-Frame $act $f)) (Get-Frame $emi $f))) }
        $tiles.Add((Get-Dark $casingTex (Get-Frame $act 0) (Get-Frame $emi 0)))
        $faceRows.Add($tiles)
        $walls.Add($tiles[0]); $walls.Add($tiles[1])
    }
    # 1x sheet: a row of tiles per face; the two controllers in a 3x3 wall of casing (solar idle and working, antenna idle and
    # working)
    $gap = 2
    $sw = [Math]::Max(($gap + 10 * (16 + $gap)), ($gap + 4 * (48 + 2 * $gap)))
    $sh = $gap + 2 * (16 + $gap) + (48 + 2 * $gap)
    $sheet = New-Canvas $sw $sh
    for ($i = 0; $i -lt $sheet.P.Length; $i++) { $sheet.P[$i] = Hex '202428' }
    function Put-Tile { param($Tile, [int]$X0, [int]$Y0) for ($y = 0; $y -lt $Tile.H; $y++) { [Array]::Copy($Tile.P, $y * $Tile.W, $sheet.P, ($Y0 + $y) * $sw + $X0, $Tile.W) } }
    $y0 = $gap
    foreach ($tiles in $faceRows) {
        for ($t = 0; $t -lt $tiles.Count; $t++) { Put-Tile $tiles[$t] ($gap + $t * (16 + $gap)) $y0 }
        $y0 += 16 + $gap
    }
    for ($k = 0; $k -lt $walls.Count; $k++) {
        $wx = $gap + $k * (48 + 2 * $gap)
        for ($j = 0; $j -lt 3; $j++) { for ($i = 0; $i -lt 3; $i++) {
            $tile = $(if ($i -eq 1 -and $j -eq 1) { $walls[$k] } else { $casingTex })
            Put-Tile $tile ($wx + 16 * $i) ($y0 + 16 * $j)
        } }
    }
    # nearest-neighbour upscale, one scaled row at a time
    $scale = 6
    $big = New-Canvas ($sw * $scale) ($sh * $scale)
    $row = New-Object 'int[]' ($sw * $scale)
    for ($y = 0; $y -lt $sh; $y++) {
        for ($x = 0; $x -lt $sw; $x++) { $v = $sheet.P[$y * $sw + $x]; for ($s = 0; $s -lt $scale; $s++) { $row[$x * $scale + $s] = $v } }
        for ($s = 0; $s -lt $scale; $s++) { [Array]::Copy($row, 0, $big.P, ($y * $scale + $s) * $big.W, $big.W) }
    }
    # the sheet is saved through GDI+ (fast; its bytes do not need to be reproducible, it is never shipped)
    $pdir = Split-Path -Parent $Preview
    if ($pdir -and -not (Test-Path -LiteralPath $pdir)) { New-Item -ItemType Directory -Force -Path $pdir | Out-Null }
    $bmp = ConvertTo-Bitmap $big
    try { $bmp.Save($Preview, [System.Drawing.Imaging.ImageFormat]::Png) } finally { $bmp.Dispose() }
    Write-Host "preview: $Preview (per face: idle, 8 active frames with emissive, dark room; 3x3 walls: solar idle and working, antenna idle and working)"
}

if ($Credits) {
    Write-Host ''
    foreach ($rel in $written) {
        Write-Host ("| ``pack/kubejs/assets/grindless/textures/$rel`` | Generated with tools/assets/$ScriptName (procedural pixel art, original) by the lunar power and antenna agent, 2026-10-25 | the pack's licence (pending; proposed CC BY-SA 4.0) |")
    }
}
if ($problems -gt 0) { exit 1 }
