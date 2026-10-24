<#
.SYNOPSIS
  Procedural 16x16 pixel art for the HV era of Gregtech Grindless (GregTech style: bevels, top-left light, selective outlines).

.DESCRIPTION
  Every pixel is drawn by this script (palettes + char maps + small shading routines); nothing is copied or edited
  from GregTech Modern or any other mod. Output is deterministic: re-running overwrites the same bytes.

  Writes (under pack/kubejs/assets/grindless/textures/):
    block/multiblock/refinery/overlay_front.png, overlay_front_active.png(+.mcmeta), overlay_front_active_emissive.png(+.mcmeta)
    block/multiblock/reformer/...          (same three)
    block/multiblock/hv_vein_drill/...     (same three)
    block/multiblock/hv_greenhouse/...     (same three)
    item/end_key.png
    item/hydrotreating_catalyst.png, item/reforming_catalyst.png
    item/titanium_drill_bit.png            (not in the brief: the HV drill's bit needs a texture, see docs/eras/hv.md)

  Run from the repo root (PowerShell 5.1 blocks unsigned scripts by default; this bypass only affects that process):
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-HVTextures.ps1
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-HVTextures.ps1 -Only refinery,keys

  Overlay conventions (same as GregTech Modern's workable casings and as the steam, LV and MV sets): transparent
  background, details only on the overlay, animated variants are vertical 16x(16*n) strips with a .png.mcmeta,
  *_emissive layers hold only the pixels that glow (identical to the colour layer). Every pixel is fully opaque or
  fully transparent. The outer 1 px ring is always left empty so the casing shows around the face.

  Casings the faces were drawn for (context only, see Build-HVPreview.ps1; every face has its own dark frame, so
  it also reads on the other casings):
    refinery       ->  gtceu:block/casings/solid/machine_casing_clean_stainless_steel  (gtceu:clean_machine_casing, docs/eras/hv.md)
    reformer       ->  gtceu:block/casings/solid/machine_casing_clean_stainless_steel  (gtceu:clean_machine_casing, docs/eras/hv.md)
    hv_vein_drill  ->  gtceu:block/casings/solid/machine_casing_stable_titanium        (titanium family casing)
    hv_greenhouse  ->  gtceu:block/casings/solid/machine_casing_stable_titanium        (titanium family casing)

  The bit shares one small shader with the steam and MV drill bits (Draw-Helix, copied from Build-MVTextures.ps1 so
  that script stays untouched): a cone and cylinder lit from the top-left with a helical thread.

.PARAMETER Only
  Subset of: refinery, reformer, drill, greenhouse, keys, catalysts, bit. Default: everything.
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

# Cylinder shading across a horizontal span. Returns a ramp index: 0 spec, 1 light, 2 mid, 3 dark, 4 darkest.
function Get-SpanTone {
    param([int]$X, [int]$X0, [int]$X1)
    $frac = ($X - $X0 + 0.5) / ($X1 - $X0 + 1)
    if ($frac -lt 0.22) { return 1 }
    elseif ($frac -lt 0.45) { return 0 }
    elseif ($frac -lt 0.62) { return 2 }
    elseif ($frac -lt 0.85) { return 3 }
    else { return 4 }
}

# Neutral steel ramp shared by every overlay (lit -> dark), the same one as the LV and MV sets: GTM's own overlays use
# neutral greys over its casings, so the faces stay in the same family. HV is told apart by its orange accents (a..g).
$SteelSpec = 'A=D3D3D3 B=B0B0B0 C=8E8E8E D=707070 E=565656 F=404040 G=2F2F2F H=222222 I=161616 J=0D0D0D'
# HV tier orange, lit -> dark (stripes, lamps, heat).
$OrangeSpec = 'a=FFF1C8 b=FFC857 c=FF9A1E d=E4600F e=A8340A f=5C1A08 g=2C0E05'
# Clean stainless steel (cooler and brighter than the neutral steel), lit -> dark.
$StainSpec = '0=F7FAFF 1=DCE5F0 2=B8C6D8 3=8E9DB2 4=667690 5=465470 6=2C364C'
# State lamp: green while working (M..P), red while idle (Q..S).
$LampSpec = 'M=E2FFE4 N=62FF86 O=22C257 P=0C6B2E Q=FF5A48 R=B52D22 S=5E1511'

# Frame shared by the faces with a free-form window: 1 px empty ring, steel bezel, dark window x3..13 y3..12.
$WindowBase = @(
    '................',
    '.CDDDDDDDDDDDDE.',
    '.DGGGGGGGGGGGGF.',
    '.DGIIIIIIIIIIIF.',
    '.DGIIIIIIIIIIIF.',
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
Assert-Map 'WindowBase' $WindowBase

# ============================================================================================
#  REFINERY - controller face (clean stainless casing); the era's flagship
#  a tall stainless column with three flanged trays, a tap pair on each (one fraction colour per tray, lightest on
#  top), standing on a wide reactor whose furnace window glows; vent steam on top, hazard stripes and a state lamp
#  along the base
# ============================================================================================
$RefPal = New-Pal ($SteelSpec + ' ' + $OrangeSpec + ' ' + $StainSpec + ' ' + $LampSpec + ' ' + @'
h=EAFFFF i=FFE27A j=FF9A2A
'@)

$RefFrac = @('h', 'i', 'j')         # gas, naphtha, light oil: top tap pair to bottom tap pair
$RefTapY = @(4, 6, 8)
$RefHeat = @('g', 'f', 'e', 'd', 'c', 'b', 'a')   # furnace heat index 0..6, dark -> white-hot

function New-RefineryFrame {
    param([bool]$Active, [int]$T = 0)
    $c = New-Canvas; $e = New-Canvas
    $P = $RefPal
    Write-Map $c 0 0 $WindowBase $P

    # column (x7..9): cap, three tap rows (plain body) with a dark flange row between them, a flared skirt at the foot
    $cap = '204'; $body = '104'; $flange = 'D435E'; $skirt = '21035'
    for ($i = 0; $i -lt 3; $i++) { Set-Px $c (7 + $i) 3 $P[[string]$cap[$i]] }
    foreach ($y in 4..7) {
        if (($y % 2) -eq 0) { for ($i = 0; $i -lt 3; $i++) { Set-Px $c (7 + $i) $y $P[[string]$body[$i]] } }
        else { for ($i = 0; $i -lt 5; $i++) { Set-Px $c (6 + $i) $y $P[[string]$flange[$i]] } }
    }
    for ($i = 0; $i -lt 5; $i++) { Set-Px $c (6 + $i) 8 $P[[string]$skirt[$i]] }
    if ($Active) {
        # the furnace heats the foot of the column: the skirt glows
        $glow = @('d', 'c', $(if (($T % 2) -eq 0) { 'b' } else { 'a' }), 'c', 'd')
        for ($i = 0; $i -lt 5; $i++) { Set-Both $c $e (6 + $i) 8 $P[$glow[$i]] }
        # vent steam over the cap
        if (($T % 4) -lt 2) { Set-Px $c 8 2 $P['C'] } else { Set-Px $c 9 2 $P['D'] }
    }

    # tap pairs: pipes in steel tinted by the fraction they carry, a lamp in the colour of the fraction at each end, drops under the lamps
    for ($k = 0; $k -lt 3; $k++) {
        $y = $RefTapY[$k]
        $left = if ($y -eq 8) { 2 } else { 3 }
        $col = $P[$RefFrac[$k]]
        for ($x = 4; $x -le (3 + $left); $x++) { Set-Px $c $x $y (Mix $P['B'] $col $(if ($x -eq 4) { 0.5 } else { 0.22 })) }
        for ($x = (13 - $left); $x -le 12; $x++) { Set-Px $c $x $y (Mix $P['D'] $col $(if ($x -eq 12) { 0.5 } else { 0.22 })) }
        if ($Active) {
            $lampL = if ((($T + 2 * $k) % 4) -lt 2) { $col } else { Shade $col 0.78 }
            $lampR = if ((($T + 2 * $k + 1) % 4) -lt 2) { $col } else { Shade $col 0.78 }
            Set-Both $c $e 3 $y $lampL; Set-Both $c $e 13 $y $lampR
            $drip = $k * 2
            if (($T % 8) -eq $drip) { Set-Both $c $e 3 ($y + 1) $col }
            if (($T % 8) -eq ($drip + 1)) { Set-Both $c $e 13 ($y + 1) $col }
        } else {
            $dim = Shade $col 0.4
            Set-Px $c 3 $y $dim; Set-Px $c 13 $y $dim
        }
    }

    # reactor: roof (x4..12), side pillars and two struts, a furnace window in three panes (x4..5, x7..9, x11..12)
    $roof = 'DCBBBBBCE'
    for ($i = 0; $i -lt 9; $i++) { Set-Px $c (4 + $i) 9 $P[[string]$roof[$i]] }
    foreach ($y in 10..12) {
        Set-Px $c 3 $y $P['B']; Set-Px $c 13 $y $P['E']
        Set-Px $c 6 $y $P['D']; Set-Px $c 10 $y $P['E']
    }
    $rowHeat = @(2, 3, 4)
    foreach ($y in 10..12) { foreach ($x in @(4, 5, 7, 8, 9, 11, 12)) {
        if ($Active) {
            $hv = $rowHeat[$y - 10]
            if ($x -ge 7 -and $x -le 9) { $hv += 1 }
            $n = Get-Noise $x $y $T 11
            if ($n -lt 70) { $hv -= 1 } elseif ($n -gt 190) { $hv += 1 }
            if ($n -gt 246 -and $y -eq 12) { $hv = 6 }
            $col = $P[$RefHeat[(Get-ClampInt $hv 0 6)]]
            Set-Both $c $e $x $y $col
        } else {
            $hv = 0
            if (($x -eq 8 -and $y -eq 12) -or ($x -eq 5 -and $y -eq 12)) { $hv = 2 }
            elseif (($x -eq 9 -and $y -eq 12) -or ($x -eq 12 -and $y -eq 11)) { $hv = 1 }
            Set-Px $c $x $y $P[$RefHeat[$hv]]
        }
    } }

    # base strip (y13): hazard stripes x3..9, state lamp x11..13
    foreach ($x in 3..9) {
        if (($x % 4) -lt 2) {
            if ($Active) { Set-Both $c $e $x 13 $P['c'] } else { Set-Px $c $x 13 $P['e'] }
        } else { Set-Px $c $x 13 $P['g'] }
    }
    if ($Active) {
        $core = if (($T % 4) -lt 2) { 'M' } else { 'N' }
        Set-Both $c $e 11 13 $P[$core]; Set-Both $c $e 12 13 $P['N']; Set-Both $c $e 13 13 $P['O']
    } else {
        Set-Px $c 11 13 $P['Q']; Set-Px $c 12 13 $P['R']; Set-Px $c 13 13 $P['S']
    }
    Sync-Emissive $c $e
    return @{ Color = $c; Emi = $e }
}

# ============================================================================================
#  REFORMER - controller face (clean stainless casing)
#  a vertical vessel: inlet pipe on top, a bed of catalyst pellets with platinum glints behind the glass, heating coils
#  down both sides, and three outlet nozzles at the foot (one lamp each) over a hazard strip and the state lamp
# ============================================================================================
$RfmPal = New-Pal ($SteelSpec + ' ' + $OrangeSpec + ' ' + $StainSpec + ' ' + $LampSpec + ' ' + @'
h=EAFFFF i=FFE27A j=FF9A2A
p=E9DFC4 q=C9BE9E r=9A8F74 s=6A604C t=443D30 u=1A1712
w=FFFFFF x=FFF2A8
'@)

# Catalyst bed (x5..11, y5..10): two beds of pellets (light, mid and dark specks) with a perforated support grate between.
$RfmBed = @(
    'rqspsrq',
    'srqrtqr',
    'qsrpsrq',
    'CDCDCDC',
    'rpqsrtq',
    'srsqrsp'
)
$RfmGlints = @(@(6, 6), @(10, 7), @(7, 9))       # glint centres: 3 sites, 3 frames each, 3 frames apart

function New-ReformerFrame {
    param([bool]$Active, [int]$T = 0)
    $c = New-Canvas; $e = New-Canvas
    $P = $RfmPal
    Write-Map $c 0 0 $WindowBase $P

    # vessel shell: side pillars (x3 lit, x13 shaded), domes top and bottom
    foreach ($y in 5..10) { Set-Px $c 3 $y $P['2']; Set-Px $c 13 $y $P['4'] }
    $domeTop = '4321234'; $domeBot = '3444456'
    for ($i = 0; $i -lt 7; $i++) { Set-Px $c (5 + $i) 4 $P[[string]$domeTop[$i]]; Set-Px $c (5 + $i) 11 $P[[string]$domeBot[$i]] }

    # catalyst bed behind the glass (x5..11, y5..10)
    Write-Map $c 5 5 $RfmBed $P
    if (-not $Active) {
        # a cold bed: everything one step darker
        foreach ($y in 5..10) { foreach ($x in 5..11) { Set-Px $c $x $y (Shade (Get-Px $c $x $y) 0.7) } }
    }

    # heating coils down both sides of the bed
    foreach ($y in 5..10) {
        if ($Active) {
            $litL = ((($y + $T) % 4) -lt 2); $litR = ((($y + $T + 2) % 4) -lt 2)
            if ($litL) { Set-Both $c $e 4 $y $P['c'] } else { Set-Px $c 4 $y $P['e'] }
            if ($litR) { Set-Both $c $e 12 $y $P['c'] } else { Set-Px $c 12 $y $P['e'] }
        } else {
            Set-Px $c 4 $y $P[$(if ($y -eq 8) { 'e' } else { 'f' })]; Set-Px $c 12 $y $P[$(if ($y -eq 6) { 'e' } else { 'f' })]
        }
    }

    # inlet pipe along the top (y3) into the dome: lamp, pipe, valve wheel
    $inlet = '23133'
    for ($i = 0; $i -lt 5; $i++) { Set-Px $c (4 + $i) 3 $P[[string]$inlet[$i]] }
    $lampIn = $P['i']
    if ($Active) {
        Set-Both $c $e 3 3 $lampIn
        Set-Both $c $e (4 + ($T % 4)) 3 $P['b']     # a bead of feed runs towards the vessel
    } else { Set-Px $c 3 3 (Shade $lampIn 0.4) }

    # outlet nozzles (y12) and the strip below (y13): stripes, outlet lamps at x5, x8, x11, state lamp at x12..13
    foreach ($x in 5, 8, 11) { Set-Px $c $x 12 $P['4'] }
    $outs = @(@(5, 'j'), @(8, 'i'), @(11, 'h'))
    for ($k = 0; $k -lt 3; $k++) {
        $col = $P[[string]$outs[$k][1]]
        if ($Active) {
            $lit = if ((($T + 2 * $k) % 4) -lt 2) { $col } else { Shade $col 0.8 }
            Set-Both $c $e $outs[$k][0] 13 $lit
        } else { Set-Px $c $outs[$k][0] 13 (Shade $col 0.4) }
    }
    foreach ($x in 3, 4, 6, 7, 9, 10) {
        if (($x -eq 3) -or ($x -eq 6) -or ($x -eq 9)) {
            if ($Active) { Set-Both $c $e $x 13 $P['c'] } else { Set-Px $c $x 13 $P['e'] }
        } else { Set-Px $c $x 13 $P['g'] }
    }
    if ($Active) {
        $core = if (($T % 4) -lt 2) { 'M' } else { 'N' }
        Set-Both $c $e 12 13 $P[$core]; Set-Both $c $e 13 13 $P['O']
    } else { Set-Px $c 12 13 $P['Q']; Set-Px $c 13 13 $P['R'] }

    if ($Active) {
        # platinum glints: three sites, each a 3-frame sparkle (a dim point, the full cross, a dim point again)
        for ($k = 0; $k -lt 3; $k++) {
            $age = (($T - 3 * $k) % 8 + 8) % 8
            if ($age -gt 2) { continue }
            $gx = $RfmGlints[$k][0]; $gy = $RfmGlints[$k][1]
            if ($age -eq 1) {
                foreach ($d in @(@(-1, 0), @(1, 0), @(0, -1), @(0, 1))) { Set-Both $c $e ($gx + $d[0]) ($gy + $d[1]) $P['x'] }
                Set-Both $c $e $gx $gy $P['w']
            } else { Set-Both $c $e $gx $gy $P['x'] }
        }
    }
    Sync-Emissive $c $e
    return @{ Color = $c; Emi = $e }
}

# ============================================================================================
#  HV VEIN DRILL - controller face (stable titanium casing)
#  a derrick whose truss legs alternate stainless and titanium, around a dark top drive, a titanium bit biting into
#  End stone with ore flecks; orange power cable and a drilling-mud hose, hazard stripes and a state lamp at the base
# ============================================================================================
$HvDrillPal = New-Pal ($SteelSpec + ' ' + $OrangeSpec + ' ' + $StainSpec + ' ' + $LampSpec + ' ' + @'
K=FBEAFF L=EDC6FA m=DCA0F0 n=AD6FC8 o=6A3C86
T=F2D4FF U=C896E0 V=9A5FB8 W=6E3F8A
p=F3F0B6 q=DAD596 r=BAB474 s=8F8A52 t=5E5A33
u=8C5BD0 v=3B2468 w=FFFFFF
x=8A5A2E y=B07A44
'@)

$HvDrillBase = @(
    '................',
    '.CDDDDDDDDDDDDE.',
    '.DGGGGGGGGGGGGF.',
    '.DGIIIIIIIIIIIF.',
    '.DGIIIIIIIIIIIF.',
    '.DGIIIIIIIIIIIF.',
    '.DGIIIIIIIIIIIF.',
    '.DGIIIIIIIIIIIF.',
    '.DGIIIIIIIIIIIF.',
    '.DGIIIIIIIIIIIF.',
    '.DGIIIIIIIIIIIF.',
    '.DDDDDDDDDDDDDF.',
    '.DGGGGGGGGGGGGF.',
    '.DGGGGGGGGGGGGF.',
    '.EFFFFFFFFFFFFG.',
    '................'
)
Assert-Map 'HvDrillBase' $HvDrillBase

# Truss legs (x, y, tone): stainless and titanium alternate, light on the lit left leg, darker on the right one.
$HvLegL = @(@(5, 5, '1'), @(5, 6, 'T'), @(4, 7, '1'), @(4, 8, 'T'), @(3, 9, '1'), @(3, 10, 'T'))
$HvLegR = @(@(11, 5, '3'), @(11, 6, 'V'), @(12, 7, '3'), @(12, 8, 'V'), @(13, 9, '3'), @(13, 10, 'V'))
# Power cable (right) and mud hose (left), 8 cells each: out of the top drive, along the top, down the wall.
$HvCable = @(@(11, 3), @(12, 3), @(13, 3), @(13, 4), @(13, 5), @(13, 6), @(13, 7), @(13, 8))
$HvHose = @(@(5, 3), @(4, 3), @(3, 3), @(3, 4), @(3, 5), @(3, 6), @(3, 7), @(3, 8))
# Top drive (x5..11, y3..4): dark housing, the orange window is at (8,4).
$HvTopDrive = @(
    'DBAAABD',
    'ECD.DCE'
)
# Bit (y7..9), axis x = 8: first column and tones per row (K spec, L light, m mid, n dark, o darker).
$HvBitRows = @(@(6, 'LKmno'), @(7, 'Lmo'), @(8, 'n'))

function New-HvDrillFrame {
    param([bool]$Active, [int]$T = 0)
    $c = New-Canvas; $e = New-Canvas
    $P = $HvDrillPal
    Write-Map $c 0 0 $HvDrillBase $P

    # base plate: hazard stripes (x2..8) and the state lamp (x10..13)
    for ($y = 12; $y -le 13; $y++) {
        for ($x = 2; $x -le 8; $x++) {
            if ((($x + $y) % 4) -lt 2) {
                $col = if ($Active) { @('c', 'd')[$y - 12] } else { @('e', 'f')[$y - 12] }
                if ($Active) { Set-Both $c $e $x $y $P[$col] } else { Set-Px $c $x $y $P[$col] }
            } else { Set-Px $c $x $y $P['g'] }
        }
        Set-Px $c 9 $y $P['G']
    }
    if ($Active) {
        $core = if (($T % 4) -lt 2) { 'M' } else { 'N' }
        $lens = @("${core}NNO", 'OOPP')
        for ($j = 0; $j -lt 2; $j++) { for ($i = 0; $i -lt 4; $i++) { Set-Both $c $e (10 + $i) (12 + $j) $P[[string]$lens[$j][$i]] } }
    } else {
        $lens = @('QQRR', 'RRSS')
        for ($j = 0; $j -lt 2; $j++) { for ($i = 0; $i -lt 4; $i++) { Set-Px $c (10 + $i) (12 + $j) $P[[string]$lens[$j][$i]] } }
    }

    # derrick: truss legs and the cross brace behind the string
    foreach ($px in $HvLegL) { Set-Px $c $px[0] $px[1] $P[[string]$px[2]] }
    foreach ($px in $HvLegR) { Set-Px $c $px[0] $px[1] $P[[string]$px[2]] }
    Set-Px $c 6 6 $P['2']; Set-Px $c 10 6 $P['4']

    # power cable (orange pulse) and mud hose (a brown slug) from the top drive down the side walls
    foreach ($px in $HvCable) { Set-Px $c $px[0] $px[1] $P['E'] }
    foreach ($px in $HvHose) { Set-Px $c $px[0] $px[1] $P['F'] }

    # top drive: the window shows an orange light that pulses while it turns
    for ($j = 0; $j -lt 2; $j++) { for ($i = 0; $i -lt 7; $i++) {
        $ch = [string]$HvTopDrive[$j][$i]
        if ($ch -ne '.') { Set-Px $c (5 + $i) (3 + $j) $P[$ch] }
    } }
    $win = if ($Active) { if (($T % 2) -eq 0) { 'b' } else { 'c' } } else { 'f' }
    if ($Active) { Set-Both $c $e 8 4 $P[$win] } else { Set-Px $c 8 4 $P[$win] }
    if ($Active) {
        # the cable pulse and the mud slugs start inside the top drive, so they are drawn over it
        $head = $HvCable[$T % 8]; $tail = $HvCable[($T + 7) % 8]
        Set-Both $c $e $head[0] $head[1] $P['b']
        Set-Both $c $e $tail[0] $tail[1] $P['d']
        $slug = $HvHose[(7 - ($T % 8))]
        Set-Px $c $slug[0] $slug[1] $P['y']
        $slug2 = $HvHose[((7 - ($T % 8)) + 4) % 8]
        Set-Px $c $slug2[0] $slug2[1] $P['x']
        # crown beacons on the top drive corners swap every other frame
        if (($T % 4) -lt 2) { Set-Both $c $e 5 3 $P['b'] } else { Set-Both $c $e 11 3 $P['b'] }
    }

    # drill string (x7..9, y5..6): the lit band swaps rows every frame while it turns
    $up = @('B', 'C', 'E'); $dn = @('C', 'D', 'F')
    $swap = $Active -and (($T % 2) -eq 1)
    for ($i = 0; $i -lt 3; $i++) {
        Set-Px $c (7 + $i) 5 $P[$(if ($swap) { $dn[$i] } else { $up[$i] })]
        Set-Px $c (7 + $i) 6 $P[$(if ($swap) { $up[$i] } else { $dn[$i] })]
    }

    # bit: titanium, lit left edge; a spec glint walks around the cone while it turns
    for ($r = 0; $r -lt 3; $r++) {
        $row = $HvBitRows[$r]
        for ($i = 0; $i -lt $row[1].Length; $i++) { Set-Px $c ($row[0] + $i) (7 + $r) $P[[string]$row[1][$i]] }
    }
    if ($Active) {
        $phase = $T % 4
        Set-Px $c (6 + $phase) 7 $P['K']
        Set-Px $c (7 + (($phase + 1) % 3)) 8 $P['K']
    }

    # End stone rock: mounds at y9 either side of the tip, floor at y10, violet and platinum flecks
    $rock = @(
        @(4, 9, 'r'), @(5, 9, 'q'), @(6, 9, 'r'), @(7, 9, 'p'), @(9, 9, 'p'), @(10, 9, 'q'), @(11, 9, 'u'), @(12, 9, 's'),
        @(4, 10, 's'), @(5, 10, 'w'), @(6, 10, 'r'), @(7, 10, 'q'), @(8, 10, 'q'), @(9, 10, 'r'), @(10, 10, 'v'), @(11, 10, 's'), @(12, 10, 't')
    )
    foreach ($px in $rock) { Set-Px $c $px[0] $px[1] $P[[string]$px[2]] }

    if ($Active) {
        # derrick beacons on the leg tops swap every other frame (emissive)
        if (($T % 4) -lt 2) { Set-Both $c $e 5 5 $P['b'] } else { Set-Both $c $e 11 5 $P['b'] }
        # the contact point glows and throws sparks over the rock (emissive)
        Set-Both $c $e 8 9 $P[$(if (($T % 2) -eq 0) { 'b' } else { 'a' })]
        Set-Both $c $e 8 10 $P[$(if (($T % 2) -eq 0) { 'c' } else { 'a' })]
        $sparks = @(
            @(@(7, 9, 'b'), @(10, 8, 'a')),
            @(@(9, 9, 'b'), @(6, 8, 'a')),
            @(@(6, 9, 'b'), @(9, 8, 'a')),
            @(@(10, 9, 'a'), @(7, 8, 'b'))
        )
        foreach ($sp in $sparks[$T % 4]) { Set-Both $c $e $sp[0] $sp[1] $P[[string]$sp[2]] }
    }
    Sync-Emissive $c $e
    return @{ Color = $c; Emi = $e }
}

# ============================================================================================
#  HV GREENHOUSE - controller face (stable titanium casing)
#  three warm full-spectrum lamps over a glass pane with a tree, wheat and pumpkins; irrigation nozzles on the lamp rail
#  drip into the pane and a CO2 pipe runs along the base and up the right edge
# ============================================================================================
$HgPal = New-Pal ($SteelSpec + ' ' + $OrangeSpec + ' ' + $LampSpec + ' ' + @'
1=1B2530 2=1A2C38 3=183644 4=17404F 5=164A5A
6=D9B556 7=7A6538 8=4F4430 9=3A3226 0=2B261E
l=C8F26A m=7DCB3A n=45A030 o=2A7428 p=17481F
s=8A5A2E t=6A4220 u=4A2C14
v=7A5230 w=5A3A20 x=3A2412
h=F8E888 i=DCC04E j=A8902E k=8FA83C
q=FFC25A r=F08A24 y=C0601A z=7E3A10 Z=4C8C2A
T=C8F4FF U=6CC8F0
V=F2F8FF W=C9DCEC X=9DB6CE
Y=FFFBD0
'@)

$HgBase = @(
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
Assert-Map 'HgBase' $HgBase

# Plant pixels (x, y, colour, 1 = leans with the sway, 0 = planted).
$HgTree = @(@(4, 6, 'm', 1), @(3, 7, 'n', 1), @(4, 7, 'm', 1), @(5, 7, 'o', 1), @(3, 8, 'o', 0), @(4, 8, 'n', 0), @(5, 8, 'p', 0), @(4, 9, 's', 0))
$HgWheat = @(@(6, 6, 'i', 1), @(7, 6, 'h', 1), @(8, 6, 'i', 1), @(6, 7, 'j', 1), @(7, 7, 'i', 1), @(8, 7, 'j', 1),
             @(7, 8, 'k', 0), @(6, 9, 'k', 0), @(7, 9, 'k', 0), @(8, 9, 'k', 0))
$HgPumpkin = @(@(9, 7, 'n', 0), @(10, 7, 'Z', 0), @(11, 7, 'm', 0), @(9, 8, 'q', 0), @(10, 8, 'r', 0), @(11, 8, 'r', 0),
               @(9, 9, 'r', 0), @(10, 9, 'y', 0), @(11, 9, 'z', 0))
# CO2 path the flow light follows: along the base pipe (y12, x6..13), then up the riser (x13, y11..4).
$HgFlow = @()
foreach ($x in 6..13) { $HgFlow += , @($x, 12) }
foreach ($y in 11..4) { $HgFlow += , @(13, $y) }

function New-HvGreenhouseFrame {
    param([bool]$Active, [int]$T = 0)
    $c = New-Canvas; $e = New-Canvas
    $P = $HgPal
    Write-Map $c 0 0 $HgBase $P

    # glass y5..9: unlit cold teal, or lit warm by the lamps (the light pools under each lamp and fades downwards)
    $bgIdle = @('1', '2', '3', '4', '5'); $bgOn = @('7', '8', '9', '0', '0')
    for ($y = 5; $y -le 9; $y++) { for ($x = 3; $x -le 12; $x++) {
        Set-Px $c $x $y $P[$(if ($Active) { $bgOn[$y - 5] } else { $bgIdle[$y - 5] })]
    } }
    foreach ($x in 3..12) { Set-Px $c $x 4 $P['G'] }

    # lamp rail (y3) with three lamp housings; emitters (y4) and the light they throw (y5); nozzles between the lamps
    $rail = @('D', 'B', 'C', 'E', 'B', 'C', 'E', 'B', 'C', 'F')
    for ($i = 0; $i -lt 10; $i++) { Set-Px $c (3 + $i) 3 $P[$rail[$i]] }
    $lamps = @(4, 7, 10)
    for ($k = 0; $k -lt 3; $k++) {
        $lx = $lamps[$k]
        if ($Active) {
            $flick = (($T + 2 * $k) % 4) -lt 2
            Set-Both $c $e $lx 4 $P[$(if ($flick) { 'a' } else { 'b' })]
            Set-Both $c $e ($lx + 1) 4 $P['b']
            Set-Both $c $e $lx 5 $P['6']; Set-Both $c $e ($lx + 1) 5 $P['6']
        } else {
            Set-Px $c $lx 4 $P['E']; Set-Px $c ($lx + 1) 4 $P['F']
        }
    }
    foreach ($x in 6, 9) { Set-Px $c $x 4 $P['E'] }

    # soil y10..11
    $soil = @('vwvvwvwvvw', 'wxwwxwxwwx')
    for ($j = 0; $j -lt 2; $j++) { for ($i = 0; $i -lt 10; $i++) { Set-Px $c (3 + $i) (10 + $j) $P[[string]$soil[$j][$i]] } }

    # plants: unlit they sit a little darker; the sway pushes the upper rows one pixel sideways in the working loop
    $sw = @(0, 1, 1, 1, 0, -1, -1, -1)
    $o = 0; if ($Active) { $o = $sw[$T % 8] }
    foreach ($plant in @($HgTree, $HgWheat, $HgPumpkin)) {
        foreach ($px in $plant) {
            $col = $P[[string]$px[2]]
            if (-not $Active) { $col = Shade $col 0.78 }
            Set-Px $c ($px[0] + $px[3] * $o) $px[1] $col
        }
    }

    # CO2 riser along the right edge (x13) with collars, and the two nozzles that poke into the pane
    for ($y = 3; $y -le 11; $y++) { Set-Px $c 13 $y $P[$(if (($y % 2) -eq 0) { 'B' } else { 'D' })] }
    Set-Px $c 13 5 $P['A']; Set-Px $c 13 9 $P['A']; Set-Px $c 13 3 $P['C']
    Set-Px $c 12 7 $P['C']; Set-Px $c 12 9 $P['C']
    # base pipe (y12..13, x5..13): flange, couplings, orange label band
    for ($x = 5; $x -le 13; $x++) { Set-Px $c $x 12 $P['B']; Set-Px $c $x 13 $P['C'] }
    Set-Px $c 5 12 $P['A']; Set-Px $c 5 13 $P['B']
    Set-Px $c 9 12 $P['E']; Set-Px $c 9 13 $P['F']; Set-Px $c 12 12 $P['E']; Set-Px $c 12 13 $P['F']
    foreach ($x in 6..7) {
        if ($Active) { Set-Both $c $e $x 12 $P['c']; Set-Both $c $e $x 13 $P['d'] } else { Set-Px $c $x 12 $P['e']; Set-Px $c $x 13 $P['f'] }
    }
    # status LEDs
    if ($Active) { Set-Both $c $e 3 13 $P['N']; Set-Both $c $e 4 13 $P['O'] } else { Set-Px $c 3 13 $P['Q']; Set-Px $c 4 13 $P['R'] }

    # glass glints on the left edge of the pane
    Set-Px $c 3 6 $P['B']; Set-Px $c 3 7 $P['C']

    if ($Active) {
        # light running through the CO2 pipe: two beads, half a loop apart (emissive)
        $n = $HgFlow.Count
        $beads = @((($T * 2) % $n), ((($T * 2) + [int]($n / 2)) % $n))
        foreach ($k in $beads) { Set-Both $c $e $HgFlow[$k][0] $HgFlow[$k][1] $P['b'] }
        # gas puffs drift left from the nozzles and fade; the second nozzle runs two frames behind
        $tones = @('W', 'X', 'X')
        foreach ($nz in @(@(7, 0), @(9, 2))) {
            $k = ($T + 4 - $nz[1]) % 4
            if ($k -lt 3) { Set-Px $c (11 - $k) $nz[0] $P[$tones[$k]] }
        }
        # irrigation drops fall from the two nozzles on the rail, the second one two frames behind
        foreach ($nz in @(@(6, 0), @(9, 2))) {
            $k = ($T + 4 - $nz[1]) % 4
            if ($k -lt 3) { Set-Px $c $nz[0] (5 + $k) $P[$(if ($k -eq 2) { 'U' } else { 'T' })] }
        }
        # one growth sparkle per frame over the plants, and the lit tree top (emissive)
        $sp = @(@(4, 6), @(10, 7), @(7, 6), @(5, 7), @(11, 8), @(8, 6), @(3, 8), @(9, 8))
        $s = $sp[$T % 8]
        Set-Both $c $e $s[0] $s[1] $P['Y']
        Set-Both $c $e (4 + $o) 6 $P['m']
    }
    Sync-Emissive $c $e
    return @{ Color = $c; Emi = $e }
}

# ============================================================================================
#  ITEMS
# ============================================================================================
# --- Draw-Helix: shared shader of the steam, MV and HV drill bits (copied from Build-MVTextures.ps1) -------------------
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

# GTM's titanium is a pink-lilac metal (0xDCA0F0): spec, light, mid, dark, darkest.
$RampTitanium = @((Hex 'F9E9FF'), (Hex 'ECC8FA'), (Hex 'DCA0F0'), (Hex 'AB6FC6'), (Hex '6B3C86'))

# One step above the vanadium bit: a touch longer, same three broad flutes.
function New-TitaniumBit {
    $c = New-Canvas
    Draw-Helix $c $RampTitanium 8.0 14.7 3.2 7.5 10.5 2.2 13.6 14.0 3.0 0.9 0.0
    Add-Outline $c -LitArgb (Hex '8B58A8') -ShadeArgb (Hex '34183F')
    return $c
}

# --- End key: the void and flat keys' silhouette (bow, collar, shaft, C-shaped bit) in End stone, with an eye of ender in
# the bow and a bit that shows the End: stone over obsidian over the void.
$EndStone = @((Hex 'F3F4CC'), (Hex 'DEE0A4'), (Hex 'C2C586'), (Hex '98995F'), (Hex '62633C'))
$EyePal = New-Palette 'D=0B3A30 G=1F8A5C L=6BF08A W=E4FFD8 K=06201A'
$EyeRows = @(
    'DGGGGD',
    'GWKKLG',
    'DGGGGD'
)

function New-EndKey {
    $c = New-Canvas
    $metal = $EndStone
    # bow: 10x7 rounded ring; the 6x3 hole is filled by the eye below. End stone is grainy: a few pixels step a tone.
    $bow = @(@(1, 5, 10), @(2, 4, 11), @(3, 3, 12), @(4, 3, 12), @(5, 3, 12), @(6, 4, 11), @(7, 5, 10))
    foreach ($row in $bow) {
        $y = $row[0]
        for ($x = $row[1]; $x -le $row[2]; $x++) {
            if ($y -ge 3 -and $y -le 5 -and $x -ge 5 -and $x -le 10) { continue }
            $diag = ($x - 7.5) + ($y - 4.0)
            $tone = [int][Math]::Round(2 + 0.3 * $diag)
            if ($y -eq 2 -and $x -ge 5 -and $x -le 10) { $tone += 1 }
            if ($y -eq 6 -and $x -ge 5 -and $x -le 10) { $tone -= 1 }
            if ($x -eq 4 -and $y -ge 3 -and $y -le 5) { $tone += 1 }
            if ($x -eq 11 -and $y -ge 3 -and $y -le 5) { $tone -= 1 }
            $n = Get-Noise $x $y 0 5
            if ($n -lt 36) { $tone += 1 } elseif ($n -gt 222) { $tone -= 1 }
            Set-Px $c $x $y $metal[(Get-ClampInt $tone 0 4)]
        }
    }
    Write-Map $c 5 3 $EyeRows $EyePal
    # collar + shaft
    foreach ($x in 6..9) { Set-Px $c $x 8 $metal[(Get-SpanTone $x 6 9)] }
    foreach ($y in 9..14) {
        foreach ($x in 7..8) {
            $tone = Get-SpanTone $x 7 8
            if ($y -eq 12) { $tone = Get-ClampInt ($tone + 2) 0 4 }
            $n = Get-Noise $x $y 0 5
            if ($n -lt 30) { $tone = Get-ClampInt ($tone + 1) 0 4 }
            Set-Px $c $x $y $metal[$tone]
        }
    }
    # bit: C-shaped, two teeth (rows 10-11 and 13-14) joined by the shaft side (row 12): End stone, obsidian, void
    $bitRows = @(@(10, 9, 13), @(11, 9, 13), @(12, 9, 10), @(13, 9, 13), @(14, 9, 13))
    $layer = @{ 10 = (Hex 'EEF0B6'); 11 = (Hex 'D2D494'); 12 = (Hex 'B2B572'); 13 = (Hex '3A2A62'); 14 = (Hex '1B1236') }
    foreach ($row in $bitRows) {
        for ($x = $row[1]; $x -le $row[2]; $x++) {
            $col = $layer[$row[0]]
            if ($x -eq $row[1] -and $row[0] -ne 12) { $col = Shade $col 1.12 }
            if ($x -eq $row[2]) { $col = Shade $col 0.78 }
            Set-Px $c $x $row[0] $col
        }
    }
    Set-Px $c 12 10 (Hex 'A8F79A'); Set-Px $c 13 13 (Hex 'D6A8FF'); Set-Px $c 11 14 (Hex 'A8F79A')
    Add-Outline $c
    return $c
}

# --- catalyst charges: a heap of 2x2 pellets in a steel cup, a coloured band on the cup (blue: cobalt-molybdenum, gold: platinum) ---
$CatSteel = @((Hex 'F2F6FA'), (Hex 'C8D3E0'), (Hex '9AA9BC'), (Hex '6D7D95'), (Hex '48587A'))

# pellet balls, lit from the top-left: highlight, light, mid, dark
$PelCobalt = @((Hex '8EA2FF'), (Hex '5C74F0'), (Hex '3A4FD0'), (Hex '232F94'))
$PelMoly = @((Hex 'D8D8F4'), (Hex 'B4B4DC'), (Hex '8A8AB8'), (Hex '5E5E8E'))
$PelSilica = @((Hex 'F4F6FA'), (Hex 'DDE1EA'), (Hex 'B8BFCC'), (Hex '8D96A6'))
$PelIvory = @((Hex 'E6DCC0'), (Hex 'CDC2A4'), (Hex 'A39878'), (Hex '766C52'))
$PelPlat = @((Hex 'FFFFFF'), (Hex 'FFFFD8'), (Hex 'E8E3A8'), (Hex 'B5AE70'))

function New-Catalyst {
    param($Pellets, $Band, [int]$Platinum)
    # $Pellets: ball ramps, picked per ball by hash (the last one is the bright metal); $Band: 3 tones of the cup's band
    # (light, mid, dark); $Platinum: how many of the top beads are forced to the bright metal, with a sparkle beside the heap
    $c = New-Canvas
    # cup: rim (y8), coloured band (y9), body (y10..11) and a narrower foot (y12)
    foreach ($x in 3..12) { Set-Px $c $x 8 $CatSteel[(Get-SpanTone $x 3 12)] }
    foreach ($x in 4..11) {
        $t = Get-SpanTone $x 4 11
        Set-Px $c $x 9 $(if ($t -le 1) { $Band[0] } elseif ($t -eq 2) { $Band[1] } else { $Band[2] })
    }
    foreach ($y in 10..11) { foreach ($x in 4..11) { Set-Px $c $x $y $CatSteel[(Get-ClampInt ((Get-SpanTone $x 4 11) + 1) 0 4)] } }
    foreach ($x in 5..10) { Set-Px $c $x 12 $CatSteel[(Get-ClampInt ((Get-SpanTone $x 5 10) + 2) 0 4)] }
    # heap: 2 + 3 + 4 beads (2x2, lit from the top-left), the rows settling into one another
    $balls = @(@(6, 2), @(8, 2), @(5, 4), @(7, 4), @(9, 4), @(4, 6), @(6, 6), @(8, 6), @(10, 6))
    $bright = @(1, 3, 6, 4) | Select-Object -First $Platinum
    for ($bi = 0; $bi -lt $balls.Count; $bi++) {
        $bx = $balls[$bi][0]; $by = $balls[$bi][1]
        $ramp = $Pellets[(Get-Noise $bx $by 0 7) % $Pellets.Count]
        if ($bright -contains $bi) { $ramp = $Pellets[$Pellets.Count - 1] }
        $tones = @(@(0, 0, 0), @(1, 0, 1), @(0, 1, 2), @(1, 1, 3))
        foreach ($q in $tones) { Set-Px $c ($bx + $q[0]) ($by + $q[1]) $ramp[$q[2]] }
    }
    if ($Platinum -gt 0) {
        # a four-point sparkle above the heap
        foreach ($d in @(@(-1, 0), @(1, 0), @(0, -1), @(0, 1))) { Set-Px $c (12 + $d[0]) (3 + $d[1]) (Hex 'FFF6B8') }
        Set-Px $c 12 3 (Hex 'FFFFFF')
    }
    Add-Outline $c -LitArgb (Hex '55627C') -ShadeArgb (Hex '232B40')
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

if (Test-Want 'refinery') { Out-Overlay 'block/multiblock/refinery' ${function:New-RefineryFrame} 3 }
if (Test-Want 'reformer') { Out-Overlay 'block/multiblock/reformer' ${function:New-ReformerFrame} 4 }
if (Test-Want 'drill') { Out-Overlay 'block/multiblock/hv_vein_drill' ${function:New-HvDrillFrame} 2 }
if (Test-Want 'greenhouse') { Out-Overlay 'block/multiblock/hv_greenhouse' ${function:New-HvGreenhouseFrame} 4 }
if (Test-Want 'keys') { Out-Tex (New-EndKey) 'item/end_key.png' }
if (Test-Want 'catalysts') {
    Out-Tex (New-Catalyst @($PelCobalt, $PelCobalt, $PelMoly, $PelSilica) @((Hex '8FA4FF'), (Hex '4057DC'), (Hex '1F2B7A')) 0) 'item/hydrotreating_catalyst.png'
    Out-Tex (New-Catalyst @($PelIvory, $PelIvory, $PelPlat) @((Hex 'FFE98A'), (Hex 'D9A92A'), (Hex '7A5A10')) 3) 'item/reforming_catalyst.png'
}
if (Test-Want 'bit') { Out-Tex (New-TitaniumBit) 'item/titanium_drill_bit.png' }

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
        Write-Host ("| ``pack/kubejs/assets/grindless/textures/$rel`` | Generada con tools/assets/$ScriptName (pixel art procedural, original) por agente de assets, 2026-10-24 | la del pack (pendiente; propuesta CC BY-SA 4.0) |")
    }
}
