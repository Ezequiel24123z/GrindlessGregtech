<#
.SYNOPSIS
  Procedural 16x16 pixel art for the four MV universal factories (GTL idea, docs/research/leisure.md 4.2 - idea only,
  reimplemented: no GTL/GTLCore code or texture copied, licence unclear): processing, assembly, separation and mixing.
  GregTech style: bevels, top-left light, every pixel fully opaque or transparent.

.DESCRIPTION
  Every pixel is drawn by this script (palettes + char maps + a few small routines); nothing is copied or edited from
  GregTech Modern, GregTech Leisure or any other mod. Output is deterministic: re-running overwrites the same bytes.

  One shared family frame (a dark steel factory hall whose top edge is a sawtooth roof with three skylights that glow MV
  blue while working, a recessed window and a base strip with blue dashes and the red/green state lamp) with a different
  working icon per machine inside the window, so all four read as one family (the neutral steel ramp and the MV blue of
  Build-MVTextures.ps1, the look of the MV vein drill and the engine test stand) while staying tellable apart at a glance.

  Writes (under pack/kubejs/assets/grindless/textures/):
    block/multiblock/universal_processing_factory/overlay_front.png, overlay_front_active.png(+.mcmeta), overlay_front_active_emissive.png(+.mcmeta)
    block/multiblock/universal_assembly_factory/...    (same three)
    block/multiblock/universal_separation_factory/...  (same three)
    block/multiblock/universal_mixing_factory/...      (same three)

  Run from the repo root (PowerShell 5.1 blocks unsigned scripts by default; this bypass only affects that process):
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-LeisureFactoriesTextures.ps1
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-LeisureFactoriesTextures.ps1 -Only processing,mixing
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-LeisureFactoriesTextures.ps1 -Credits

  Casing every controller sits on (startup_scripts/grindless/mv/leisure_factories.js): gtceu:block/casings/solid/
  machine_casing_frost_proof (GTM's aluminium frost-proof machine casing, the one of the MV vein drill and the engine test
  stand). The dark hall reads well on its light grey-blue plating; the casing shows around the face and above the roof.

.PARAMETER Only
  Subset of: processing, assembly, separation, mixing. Default: all four.
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
$KnownIds = @('processing', 'assembly', 'separation', 'mixing')
foreach ($id in $Only) { if ($KnownIds -notcontains $id) { throw "Unknown -Only id '$id' (expected: $($KnownIds -join ', '))" } }

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

# ============================================================================================
#  SHARED FAMILY PALETTE AND FRAME
#  Neutral steel A-J and MV blue a-g: the ramps of Build-MVTextures.ps1 (MV vein drill, engine test stand), so the
#  factories sit in the MV family. The state lamp is the MV one: green h-k while working, red r-t while idle.
#
#  Every machine gets: a dark steel hall (walls x1/x14, floor y14) whose top edge is a sawtooth factory roof (y1-y4:
#  three teeth lit from the top-left, each with a skylight column at x5/x9/x13 that is dull blue glass idle and glows
#  while working, a light sweeping across them), a recessed window x3..13 y5..12 (shadow column x2) that holds the
#  working icon (11x8, local 0,0 = absolute WIN_X0,WIN_Y0 = 3,5), and a base strip y13 with blue dashes (x3..9) and the
#  state lamp (x11..13).
# ============================================================================================
$SteelSpec = 'A=D3D3D3 B=B0B0B0 C=8E8E8E D=707070 E=565656 F=404040 G=2F2F2F H=222222 I=161616 J=0D0D0D'
$BlueSpec = 'a=E4FBFF b=8FE8FF c=3CC4F0 d=1E8FD0 e=1560A0 f=0C3A6A g=071F3C'
$LampSpec = 'h=E2FFE4 i=62FF86 j=22C257 k=0C6B2E r=FF5A48 s=B52D22 t=5E1511'
$FamPal = New-Pal ($SteelSpec + ' ' + $BlueSpec + ' ' + $LampSpec)
$WIN_X0 = 3
$WIN_Y0 = 5
$SKYLIGHTS = @(5, 9, 13)

# hall + roof; the skylights (e/f/g, dark glass) are repainted while working, the strip (y13) is painted by Paint-Strip
$FrameBase = @(
    '................',
    '....B...B...B...',
    '...BCe.BCe.BCe..',
    '..BCDfBCDfBCDf..',
    '.BCDDgCDDgCDDgE.',
    '.DGIIIIIIIIIIIF.',
    '.DGIIIIIIIIIIIF.',
    '.DGIIIIIIIIIIIF.',
    '.DGIIIIIIIIIIIF.',
    '.DGIIIIIIIIIIIF.',
    '.DGIIIIIIIIIIIF.',
    '.DGIIIIIIIIIIIF.',
    '.DGIIIIIIIIIIIF.',
    '.DGGGGGGGGGGGGF.',
    '.EFFFFFFFFFFFFG.',
    '................'
)
Assert-Map 'FrameBase' $FrameBase

function New-Frame {
    $c = New-Canvas; $e = New-Canvas
    Write-Map $c 0 0 $FrameBase $FamPal
    return @{ Color = $c; Emi = $e }
}

# Skylights: dull glass idle; lit glass while working, with a bright glint that sweeps left to right (period 4).
function Paint-Roof {
    param($c, $e, [bool]$Active, [int]$T)
    if (-not $Active) { return }
    for ($k = 0; $k -lt 3; $k++) {
        $x = $SKYLIGHTS[$k]
        $top = if (($T % 4) -eq $k) { 'a' } else { 'b' }
        Set-Both $c $e $x 2 $FamPal[$top]
        Set-Both $c $e $x 3 $FamPal['c']
        Set-Both $c $e $x 4 $FamPal['c']
    }
}

# Base strip (y13): blue dashes x3..9 (lit while working) and the state lamp x11..13 (red idle, pulsing green active).
function Paint-Strip {
    param($c, $e, [bool]$Active, [int]$T)
    foreach ($x in 3..9) {
        if (($x % 4) -lt 2) {
            if ($Active) { Set-Both $c $e $x 13 $FamPal['c'] } else { Set-Px $c $x 13 $FamPal['e'] }
        } else { Set-Px $c $x 13 $FamPal['g'] }
    }
    if ($Active) {
        $core = if (($T % 4) -lt 2) { 'h' } else { 'i' }
        Set-Both $c $e 11 13 $FamPal[$core]; Set-Both $c $e 12 13 $FamPal['i']; Set-Both $c $e 13 13 $FamPal['j']
    } else {
        Set-Px $c 11 13 $FamPal['r']; Set-Px $c 12 13 $FamPal['s']; Set-Px $c 13 13 $FamPal['t']
    }
}

# Icon helpers: local window coordinates (0..10, 0..7) -> absolute.
function Set-Icon {
    param($c, [int]$X, [int]$Y, [int]$Argb)
    Set-Px $c ($WIN_X0 + $X) ($WIN_Y0 + $Y) $Argb
}
function Set-IconBoth {
    param($c, $e, [int]$X, [int]$Y, [int]$Argb)
    Set-Both $c $e ($WIN_X0 + $X) ($WIN_Y0 + $Y) $Argb
}
# Draws a local char map ('.' = leave the pixel alone).
function Write-Icon {
    param($c, [int]$X0, [int]$Y0, [string[]]$Rows, $Pal)
    Write-Map $c ($WIN_X0 + $X0) ($WIN_Y0 + $Y0) $Rows $Pal
}

# ============================================================================================
#  ICONS (11x8, local coords; absolute = local + WIN_X0/WIN_Y0). Each paints $c/$e in place.
# ============================================================================================

# PROCESSING: a steel gear (the factory's gearbox core) beside a press: crosshead, ram with a punch head, a plate on the
# bed. Idle: ram up, plate cold. Active: the gear turns (four tooth phases, period 4), the ram strikes once per loop and
# the plate glows and throws sparks while it is pressed, then cools as the ram lifts.
$ProcPal = New-Pal ($SteelSpec + ' ' + @'
u=FFF4C2 v=FFC53A w=F07A12 x=A8400A
'@)
$GEAR_N = 8
$GEAR_CX = 2.0            # local; its left tooth tips sit on the window's shadow column (local x -1)
$GEAR_CY = 3.0
$GEAR_BODY = 2.5
$GEAR_TOOTH = 3.5
$GEAR_TOOTH_WIDTH = 0.3   # cos threshold: higher = narrower teeth

function Paint-Gear {
    param($c, [int]$Step)
    $P = $ProcPal
    $phase = ($Step / 4.0) * (2 * [Math]::PI / $GEAR_N)
    for ($y = 0; $y -le 6; $y++) { for ($x = -1; $x -le 5; $x++) {
        $dx = $x - $GEAR_CX; $dy = $y - $GEAR_CY
        $r = [Math]::Sqrt($dx * $dx + $dy * $dy)
        $tooth = [Math]::Cos($GEAR_N * ([Math]::Atan2($dy, $dx) - $phase)) -gt $GEAR_TOOTH_WIDTH
        if (-not (($r -le $GEAR_BODY) -or ($tooth -and $r -le $GEAR_TOOTH))) { continue }
        $s = $dx + $dy
        $tone = if ($r -lt 0.5) { 'G' } elseif ($r -le 1.0) { 'E' } elseif ($s -le -2.5) { 'A' } elseif ($s -le -0.5) { 'B' } elseif ($s -le 1.5) { 'C' } elseif ($s -le 3.0) { 'D' } else { 'E' }
        Set-Icon $c $x $y $P[$tone]
    } }
}

function Paint-Processing {
    param($c, $e, [bool]$Active, [int]$T)
    $P = $ProcPal
    Paint-Gear $c $(if ($Active) { ($T + 2) % 4 } else { 2 })
    # press, one pixel clear of the gear: crosshead (y0), ram (x8..9) with its punch head (x7..10), plate (y5) on the bed (y6..7)
    Write-Icon $c 7 0 @('BBCD') $P
    Write-Icon $c 6 6 @('CDDDE', 'EFFFF') $P
    $stroke = if ($Active) { @(0, 0, 1, 3, 3, 2, 1, 0)[$T % 8] } else { 0 }
    for ($y = 1; $y -le $stroke; $y++) { Set-Icon $c 8 $y $P['C']; Set-Icon $c 9 $y $P['E'] }
    Write-Icon $c 7 (1 + $stroke) @('ABCE') $P
    if ($Active -and $stroke -eq 3) {
        $hot = @('w', 'u', 'v', 'w')
        for ($i = 0; $i -lt 4; $i++) { Set-IconBoth $c $e (7 + $i) 5 $P[$hot[$i]] }
        $spark = if (($T % 2) -eq 0) { @('u', 'v') } else { @('v', 'u') }
        Set-IconBoth $c $e 6 4 $P[$spark[0]]; Set-IconBoth $c $e 6 3 $P[$spark[1]]
    } elseif ($Active -and $stroke -eq 2) {
        Write-Icon $c 7 5 @('CwxD') $P
        Set-IconBoth $c $e 8 5 $P['w']
    } else {
        Write-Icon $c 7 5 @('BBCD') $P
    }
}

# ASSEMBLY: an orange robot arm on a green circuit board (the factory's gantry core). Idle: arm parked, tool up, board LEDs
# off. Active: the arm walks its tool along the board, dips to solder twice per loop (a white-hot spark), the LEDs blink.
$AsmPal = New-Pal ($SteelSpec + ' ' + $BlueSpec + ' ' + @'
L=6CC777 M=46A055 N=2F7A3C O=1D4F27
U=F2D27A V=B8913A
W=FFD27A X=F29A2E Y=C26A14
u=FFFBE6 v=FFE07A
'@)
# board: green with light pads (L), gold pads and traces (U/V), a chip (H) and the LED (c, repainted every frame), gold
# edge-connector fingers along the bottom
$AsmBoard = @(
    'NMMLMMMMLMN',
    'NUUMMHHMMcN',
    'OUVUVUVUVUO'
)

function Paint-Assembly {
    param($c, $e, [bool]$Active, [int]$T)
    $P = $AsmPal
    Write-Icon $c 0 5 $AsmBoard $P
    # steel base, then the lower arm (orange, 2 px) up to the elbow
    Write-Icon $c 0 4 @('CDE') $P
    Write-Icon $c 0 0 @('.WX', 'WXY', 'XY.', 'XY.') $P
    $wx = if ($Active) { @(5, 5, 6, 7, 8, 8, 7, 6)[$T % 8] } else { 4 }
    $down = $Active -and (($T % 8) -eq 1 -or ($T % 8) -eq 5)
    # forearm from the elbow to the wrist (y0..1), wrist joint, tool
    for ($x = 2; $x -lt $wx; $x++) { Set-Icon $c $x 0 $P['W']; Set-Icon $c $x 1 $P['Y'] }
    Set-Icon $c $wx 0 $P['C']; Set-Icon $c $wx 1 $P['E']
    $tipY = if ($down) { 4 } else { 3 }
    for ($y = 2; $y -le $tipY; $y++) { Set-Icon $c $wx $y $P['B'] }
    Set-Icon $c $wx $tipY $P['A']
    if ($down) {
        Set-IconBoth $c $e $wx 5 $P['u']
        Set-IconBoth $c $e ($wx - 1) 4 $P['v']; Set-IconBoth $c $e ($wx + 1) 4 $P['v']
    }
    # board LED
    if ($Active) {
        $led = if (($T % 4) -lt 2) { 'b' } else { 'c' }
        Set-IconBoth $c $e 9 6 $P[$led]
    } else { Set-Icon $c 9 6 $P['f'] }
}

# SEPARATION: one murky feed comes down from the roof into a spinning drum (the factory's steel pipe core) and leaves as
# three clean fractions (red, amber, pale cyan) that drip into three bins. Idle: no flow, drum still, bins dim. Active: the
# drum's bands run (period 4), the feed flickers, drops fall from the three nozzles and the bin surfaces glow.
$SepPal = New-Pal ($SteelSpec + ' ' + @'
m=9A8660 n=6A5A40
R=FF7A5E S=C2402E Y=FFD65A Z=C8901C W=D8F8FF X=7CC8DC
'@)
$SepBins = @(@(1, 'R', 'S'), @(5, 'Y', 'Z'), @(9, 'W', 'X'))

function Paint-Separation {
    param($c, $e, [bool]$Active, [int]$T)
    $P = $SepPal
    # feed pipe from the roof (y0) and the drum (y1..3, x1..9)
    Write-Icon $c 4 0 @('FmF') $P
    Write-Icon $c 1 1 @('BAAAAAAAC', 'C.......E', 'DEEEEEEEF') $P
    $phase = if ($Active) { $T % 4 } else { 0 }
    for ($x = 2; $x -le 8; $x++) {
        $tone = if ((($x + $phase) % 4) -lt 2) { 'C' } else { 'E' }
        Set-Icon $c $x 2 $P[$tone]
    }
    if ($Active) { Set-Icon $c 5 0 $P[$(if (($T % 2) -eq 0) { 'm' } else { 'n' })] }
    # three bins (x0..2, x4..6, x8..10; y5..6) on steel feet (y7), a nozzle drop above each (the middle one out of step)
    for ($k = 0; $k -lt 3; $k++) {
        $b = $SepBins[$k]
        $x = $b[0]
        $top = $P[[string]$b[1]]; $low = $P[[string]$b[2]]
        for ($i = -1; $i -le 1; $i++) {
            if ($Active) { Set-IconBoth $c $e ($x + $i) 5 $top } else { Set-Icon $c ($x + $i) 5 (Shade $top 0.72) }
            Set-Icon $c ($x + $i) 6 $low
        }
        Write-Icon $c ($x - 1) 7 @('DEF') $P
        if ($Active -and ((($T + $k) % 2) -eq 0)) { Set-IconBoth $c $e $x 4 $top }
    }
}

# MIXING: a glass vat (the factory's glass core) of violet liquid with a motor, a shaft and an impeller. Idle: flat surface,
# impeller still. Active: the impeller turns, the surface dips into a vortex round the shaft, two swirl highlights run
# round the impeller and a bubble rises.
$MixPal = New-Pal ($SteelSpec + ' ' + @'
p=E8F6FF q=9FC4D8
K=E6C8FF L=C98AF5 M=9B55D8 N=6E30A8
'@)

function Paint-Mixing {
    param($c, $e, [bool]$Active, [int]$T)
    $P = $MixPal
    # motor (y0), glass walls (x1, x9; y1..6), bottom (y7)
    Write-Icon $c 4 0 @('BCE') $P
    for ($y = 1; $y -le 6; $y++) { Set-Icon $c 1 $y $P['p']; Set-Icon $c 9 $y $P['q'] }
    Write-Icon $c 1 7 @('DEEEEEEEF') $P
    # liquid x2..8, y3..6; while stirring the surface dips on both sides of the shaft
    $rows = @('L', 'M', 'M', 'N')
    for ($y = 3; $y -le 6; $y++) { for ($x = 2; $x -le 8; $x++) { Set-Icon $c $x $y $P[$rows[$y - 3]] } }
    if ($Active) { Set-Icon $c 4 3 $P['I']; Set-Icon $c 6 3 $P['I'] }
    # shaft and impeller
    for ($y = 1; $y -le 4; $y++) { Set-Icon $c 5 $y $P['C'] }
    $blade = if ($Active) { @(2, 1, 0, 1)[$T % 4] } else { 2 }
    for ($x = 5 - $blade; $x -le 5 + $blade; $x++) { Set-Icon $c $x 5 $P['B'] }
    Set-Icon $c 5 5 $P['D']
    if ($Active) {
        # two swirl highlights half a loop apart run round the impeller (one step per frame); a bubble rises up the right side
        $swirl = @(@(7, 4), @(6, 4), @(4, 4), @(3, 4), @(2, 5), @(3, 6), @(5, 6), @(7, 6))
        foreach ($k in @(($T % 8), (($T + 4) % 8))) { Set-IconBoth $c $e $swirl[$k][0] $swirl[$k][1] $P['K'] }
        Set-IconBoth $c $e 8 (6 - ($T % 4)) $P['K']
    }
}

# ============================================================================================
#  BUILD
# ============================================================================================
$MACHINES = @(
    @{ Id = 'processing'; Dir = 'universal_processing_factory'; Paint = ${function:Paint-Processing} },
    @{ Id = 'assembly'; Dir = 'universal_assembly_factory'; Paint = ${function:Paint-Assembly} },
    @{ Id = 'separation'; Dir = 'universal_separation_factory'; Paint = ${function:Paint-Separation} },
    @{ Id = 'mixing'; Dir = 'universal_mixing_factory'; Paint = ${function:Paint-Mixing} }
)

$idleFaces = @{}
foreach ($mc in $MACHINES) {
    if (-not (Test-Want $mc.Id)) { continue }
    $frames = @(); $emis = @()
    for ($t = 0; $t -lt 8; $t++) {
        $f = New-Frame
        Paint-Roof $f.Color $f.Emi $true $t
        & $mc.Paint $f.Color $f.Emi $true $t
        Paint-Strip $f.Color $f.Emi $true $t
        Sync-Emissive $f.Color $f.Emi
        $frames += $f.Color; $emis += $f.Emi
    }
    $idle = New-Frame
    & $mc.Paint $idle.Color $idle.Emi $false 0
    Paint-Strip $idle.Color $idle.Emi $false 0
    $idleFaces[$mc.Id] = $idle.Color

    Out-Tex $idle.Color ('block/multiblock/' + $mc.Dir + '/overlay_front.png')
    Out-Tex (Join-Frames $frames) ('block/multiblock/' + $mc.Dir + '/overlay_front_active.png') 3
    Out-Tex (Join-Frames $emis) ('block/multiblock/' + $mc.Dir + '/overlay_front_active_emissive.png') 3
}

# ============================================================================================
#  VERIFY what was written (size, binary alpha, no pure black, 8-frame strips that really animate, empty casing ring,
#  emissive pixels present and identical in the colour layer) and that the idle faces really differ from each other
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
        if ($n -ne 8) { $msgs += "animation has $n frames (expected 8)" }
        if ($rel -notlike '*_emissive.png') {
            $seen = @{}
            for ($f = 0; $f -lt $n; $f++) { $seen[(($img.P[($f * 256)..($f * 256 + 255)]) -join ',')] = 1 }
            if ($seen.Count -lt 4) { $msgs += "only $($seen.Count) distinct frames out of $n" }
        }
    }
    $nf = [int]($img.H / 16)
    for ($f = 0; $f -lt $nf; $f++) { for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
        if ($x -lt 1 -or $y -lt 1 -or $x -ge 15 -or $y -ge 15) {
            if ((($img.P[($f * 16 + $y) * 16 + $x] -shr 24) -band 255) -ne 0) { $msgs += "opaque pixel in the casing ring (frame $f, $x,$y)"; $f = $nf; $y = 16; break }
        }
    } } }
    if ($rel -like '*_active_emissive.png') {
        $color = Read-Png (Join-Path $OutRoot (($rel -replace '_emissive\.png$', '.png') -replace '/', '\'))
        if ($color.H -ne $img.H) { $msgs += 'emissive strip height differs from the colour strip' }
        else {
            $lit = 0
            for ($i = 0; $i -lt $img.P.Length; $i++) {
                if ((($img.P[$i] -shr 24) -band 255) -eq 0) { continue }
                $lit++
                if ($img.P[$i] -ne $color.P[$i]) { $msgs += 'emissive pixel not present in colour layer'; break }
            }
            if ($lit -eq 0) { $msgs += 'emissive layer is empty' }
        }
    }
    if ($msgs.Count -gt 0) { $problems++; Write-Warning "$rel : $($msgs -join '; ')" }
}

# the family shares its frame, so the icons alone must tell the four apart: every pair of idle faces differs in many pixels,
# and outside the window (x2..13, y5..12) the four idle faces are the same pixels
$ids = @($idleFaces.Keys | Sort-Object)
for ($i = 0; $i -lt $ids.Count; $i++) { for ($j = $i + 1; $j -lt $ids.Count; $j++) {
    $a = $idleFaces[$ids[$i]]; $b = $idleFaces[$ids[$j]]
    $diff = 0; $frameDiff = 0
    for ($k = 0; $k -lt $a.P.Length; $k++) {
        if ($a.P[$k] -eq $b.P[$k]) { continue }
        $diff++
        $x = $k % 16; $y = [Math]::Floor($k / 16)
        if (-not ($x -ge 2 -and $x -le 13 -and $y -ge $WIN_Y0 -and $y -le ($WIN_Y0 + 7))) { $frameDiff++ }
    }
    Write-Verbose "idle faces $($ids[$i]) / $($ids[$j]): $diff px differ"
    if ($diff -lt 24) { $problems++; Write-Warning "idle faces of $($ids[$i]) and $($ids[$j]) differ in only $diff px" }
    if ($frameDiff -gt 0) { $problems++; Write-Warning "idle faces of $($ids[$i]) and $($ids[$j]) differ in $frameDiff px outside the window" }
} }

Write-Host "written $($written.Count) files under $OutRoot ($problems with warnings)"
foreach ($rel in $written) { Write-Host "  $rel" }
if ($problems -gt 0) { exit 1 }

if ($Credits) {
    Write-Host ''
    foreach ($rel in $written) {
        Write-Host ("| ``pack/kubejs/assets/grindless/textures/$rel`` | Generated with tools/assets/$ScriptName (procedural pixel art, original) by the universal factories agent, 2026-10-25 | the pack's licence (pending; proposed CC BY-SA 4.0) |")
    }
}
