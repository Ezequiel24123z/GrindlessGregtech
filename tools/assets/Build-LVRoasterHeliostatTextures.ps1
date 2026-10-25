<#
.SYNOPSIS
  Procedural 16x16 pixel art for the LV "more reinforced" content: the Sulfide Roaster and the Heliostat Tower.

.DESCRIPTION
  Same method as Build-LVTextures.ps1 (Pixel.Lib.ps1: palettes, char maps, small shading routines, deterministic PNG writer);
  every pixel is drawn here, nothing is copied or edited from GregTech Modern or any other mod. Re-running writes the same bytes.

  Writes (under pack/kubejs/assets/grindless/textures/):
    block/multiblock/sulfide_roaster/overlay_front.png, overlay_front_active.png(+.mcmeta), overlay_front_active_emissive.png(+.mcmeta)
    block/multiblock/heliostat_tower/...   (same three)
    block/heliostat/mirror_top.png         the silvered face of the heliostat mirror (model block/heliostat/mirror.json, uv 1..15)
    block/heliostat/mirror_frame.png       its steel: panel edge (rows 0-1), the backing truss, the post and the foot
    item/contact_catalyst.png              vanadium contact catalyst: the pack's catalyst-charge look, an LV steel cup of
                                           yellow-orange vanadium pellets with a few pale diatomite ones

  Run from the repo root:
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-LVRoasterHeliostatTextures.ps1
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-LVRoasterHeliostatTextures.ps1 -Only roaster,catalyst

  Overlay conventions (GTM workable casings): transparent background and outer ring, details only on the overlay, animated
  variants are vertical 16x(16*n) strips with a .png.mcmeta, *_emissive layers hold only the pixels that glow (identical to the
  colour layer). Every pixel is fully opaque or fully transparent.

  Context the overlays were drawn for:
    sulfide_roaster  ->  gtceu:block/casings/solid/machine_casing_heatproof
    heliostat_tower  ->  gtceu:block/casings/solid/machine_casing_solid_steel

.PARAMETER Only
  Subset of: roaster, heliostat, mirror, catalyst. Default: everything.
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

$Only = @($Only | ForEach-Object { $_ -split '[,;\s]+' } | Where-Object { $_ })

if (-not $OutRoot) { $OutRoot = Join-Path $PSScriptRoot '..\..\pack\kubejs\assets\grindless\textures' }
$OutRoot = [System.IO.Path]::GetFullPath($OutRoot)
$ScriptName = Split-Path -Leaf $PSCommandPath

function Test-Want { param([string]$Id) return ($Only.Count -eq 0 -or $Only -contains $Id) }

$written = New-Object System.Collections.Generic.List[string]
function Out-Tex {
    param($Canvas, [string]$Rel, [int]$FrameTime = 0)
    $p = Join-Path $OutRoot ($Rel -replace '/', '\')
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

function Set-Both {
    param($C, $E, [int]$X, [int]$Y, [int]$Argb)
    Set-Px $C $X $Y $Argb; Set-Px $E $X $Y $Argb
}

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

# Neutral steel ramp of the LV overlays (same letters and values as Build-LVTextures.ps1: lit -> dark).
$SteelSpec = 'A=D3D3D3 B=B0B0B0 C=8E8E8E D=707070 E=565656 F=404040 G=2F2F2F H=222222 I=161616 J=0D0D0D'

# The panel every LV controller face shares: a steel frame with a recessed window x3..12, y3..11 and a base strip at y13.
$PanelBase = @(
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
Assert-Map 'PanelBase' $PanelBase

# ============================================================================================
#  SULFIDE ROASTER - controller face (heat-proof casing)
#  a sight glass into the roaster: the off-gas duct along the top, a bubbling fluidised bed of glowing ore, the tuyere grate with
#  its air jets under it; on the base strip the acid level of the contact tower and the status LED
# ============================================================================================
$RoExtra = @'
1=FFF7C2 2=FFE066 3=FFB02E 4=F07A12 5=C4470C 6=8A2A0A 7=4A1608 8=2A100A
e=7A2A10 f=A8400F
9=E8F6FF w=8FD0FF x=3C8EE0 v=1F3A52
Y=F2E14A y=C9B52A u=7E7016
k=8E8A6A m=6C6950
h=62FF86 i=22C257 s=B52D22 t=5E1511
'@
$RoPal = New-Palette ($SteelSpec + ' ' + $RoExtra)

function New-RoasterFrame {
    param([bool]$Active, [int]$T = 0)
    $c = New-Canvas; $e = New-Canvas
    $P = $RoPal
    Write-Map $c 0 0 $PanelBase $P

    # off-gas duct along the top of the window (y3): a steel pipe with two flanges, the gas leaving to the right
    foreach ($x in 3..12) { Set-Px $c $x 3 $P[$(if ($x -eq 5 -or $x -eq 10) { 'B' } else { 'D' })] }
    Set-Px $c 12 3 $P['E']
    # freeboard (y4): warm haze over the bed while it works, cold and dark when it stops
    foreach ($x in 3..12) {
        if ($Active) {
            $n = Get-Noise $x 4 $T 11
            Set-Px $c $x 4 $P[$(if ($n -gt 200) { 'k' } elseif ($n -gt 120) { '7' } else { '8' })]
        } else { Set-Px $c $x 4 $P['J'] }
    }

    # the bed (y5..9): bubbling ore glowing orange to deep red with depth; a dark crust with embers when cold
    $ramp = @('1', '2', '3', '4', '5', '6')
    for ($y = 5; $y -le 9; $y++) {
        for ($x = 3; $x -le 12; $x++) {
            $n = Get-Noise $x $y $T 5
            if ($Active) {
                $idx = $y - 5 + 1
                if ($n -lt 60) { $idx += 1 } elseif ($n -gt 205) { $idx -= 1 }
                if ($x -eq 3 -or $x -eq 12) { Set-Px $c $x $y $P['7'] } else { Set-Both $c $e $x $y $P[$ramp[(Get-ClampInt $idx 0 5)]] }
            } else {
                $col = if ($n -gt 240) { 'f' } elseif ($n -gt 220) { 'e' } elseif ($y -eq 5) { '7' } else { '8' }
                Set-Px $c $x $y $P[$col]
            }
        }
    }
    if ($Active) {
        # bubbles: each column's bubble rises one row per frame and bursts at the surface into the haze
        foreach ($b in @(@(4, 0), @(7, 3), @(10, 5), @(6, 6))) {
            $bx = $b[0]; $by = 9 - (($T + $b[1]) % 6)
            if ($by -ge 5) { Set-Both $c $e $bx $by $P['1'] } else { Set-Both $c $e $bx 4 $P['2'] }
        }
    }

    # tuyere grate (y10): steel bars between nozzles; the air jets blue-white while the blowers run
    for ($x = 3; $x -le 12; $x++) {
        if (($x % 2) -eq 0) { Set-Px $c $x 10 $P['C'] }
        elseif ($Active) { Set-Both $c $e $x 10 $P[$(if (((($x + $T) % 4)) -lt 2) { '9' } else { 'w' })] }
        else { Set-Px $c $x 10 $P['H'] }
    }
    # air plenum (y11)
    for ($x = 3; $x -le 12; $x++) {
        if ($Active -and ((Get-Noise $x 11 $T 7) -gt 196)) { Set-Px $c $x 11 $P['x'] } else { Set-Px $c $x 11 $P['v'] }
    }

    # base strip (y13): acid level of the contact tower (fills while it works) and the status LED
    Set-Px $c 3 13 $P['F']; Set-Px $c 9 13 $P['F']
    $level = if ($Active) { 1 + ($T % 5) } else { 0 }
    for ($i = 0; $i -lt 5; $i++) {
        $x = 4 + $i
        if ($i -lt $level) { Set-Px $c $x 13 $P[$(if ($i -eq ($level - 1)) { 'Y' } else { 'y' })] } else { Set-Px $c $x 13 $P['u'] }
    }
    if ($Active) { Set-Both $c $e 12 13 $P['h']; Set-Px $c 11 13 $P['i'] } else { Set-Px $c 12 13 $P['s']; Set-Px $c 11 13 $P['t'] }
    Sync-Emissive $c $e
    return @{ Color = $c; Emi = $e }
}

# ============================================================================================
#  HELIOSTAT TOWER - controller face (solid steel casing)
#  the field computer's screen: the sun crossing a day sky, the tower with its glowing receiver, two banks of mirrors on the
#  ground sending their rays up; at night (idle) a dark sky with stars and a cold receiver. Base strip: steam gauge and LED.
# ============================================================================================
$HeExtra = @'
a=3F8FDC b=5AA4E6 c=78B8EE d=9ACCF2 g=BEE0F6
n=0F1A30 o=13213B p=17283F q=1B2F48 r=1F3651 z=C8D2E8
1=FFFCE6 2=FFEB8A 3=FFC93C
4=FFF6E0 5=FFC266 6=FF8A2B 7=7A3A14
8=FFF4B8 9=E8D488
w=E4F6FF x=9AD6F6 X=5C8FB2 Z=33485A
l=4A4636 L=34312A
W=F2F4F7 V=AEB4BE
h=62FF86 i=22C257 s=B52D22 t=5E1511
'@
$HePal = New-Palette ($SteelSpec + ' ' + $HeExtra)

# the sun's path across the screen, one 2x2 disc per frame (left -> right, highest at noon)
$HeSunPath = @(@(3, 6), @(4, 5), @(5, 4), @(6, 3), @(8, 3), @(9, 4), @(10, 5), @(11, 6))
# light rays from the two mirror banks to the receiver (left bank x3..5, right bank x10..12)
$HeRays = @(@(5, 9), @(6, 8), @(6, 7), @(10, 9), @(9, 8), @(9, 7))

function New-HeliostatFrame {
    param([bool]$Active, [int]$T = 0)
    $c = New-Canvas; $e = New-Canvas
    $P = $HePal
    Write-Map $c 0 0 $PanelBase $P

    # sky (y3..9): day ramp (deep blue at the top, pale at the horizon) or night with a few stars
    $day = @('a', 'b', 'b', 'c', 'c', 'd', 'g'); $night = @('n', 'n', 'o', 'o', 'p', 'q', 'r')
    for ($y = 3; $y -le 9; $y++) { for ($x = 3; $x -le 12; $x++) {
        Set-Px $c $x $y $P[$(if ($Active) { $day[$y - 3] } else { $night[$y - 3] })]
    } }
    if (-not $Active) { foreach ($s in @(@(4, 4), @(10, 3), @(12, 6), @(5, 7))) { Set-Px $c $s[0] $s[1] $P['z'] } }

    # the sun (emissive): a 2x2 disc with a warm rim
    if ($Active) {
        $sp = $HeSunPath[$T % 8]
        Set-Both $c $e $sp[0] $sp[1] $P['1']; Set-Both $c $e ($sp[0] + 1) $sp[1] $P['2']
        Set-Both $c $e $sp[0] ($sp[1] + 1) $P['2']; Set-Both $c $e ($sp[0] + 1) ($sp[1] + 1) $P['3']
    }

    # ground (y10..11) and the two mirror banks on it
    for ($x = 3; $x -le 12; $x++) { Set-Px $c $x 10 $P['l']; Set-Px $c $x 11 $P['L'] }
    foreach ($mx in @(3, 4, 5, 10, 11, 12)) {
        if ($Active) {
            $glint = ((($mx + $T) % 3) -eq 0)
            Set-Both $c $e $mx 10 $P[$(if ($glint) { 'w' } else { 'x' })]
        } else { Set-Px $c $mx 10 $P['Z'] }
        Set-Px $c $mx 11 $P[$(if ($Active) { 'X' } else { 'G' })]
    }

    # the rays (emissive, shimmering) - drawn before the tower so the tower stays in front
    if ($Active) {
        for ($i = 0; $i -lt $HeRays.Count; $i++) {
            $r = $HeRays[$i]
            Set-Both $c $e $r[0] $r[1] $P[$(if (((($i + $T) % 3)) -eq 0) { '8' } else { '9' })]
        }
    }

    # the tower (x7..8): lattice shaft y7..11, receiver y5..6, mast y4
    for ($y = 7; $y -le 11; $y++) {
        Set-Px $c 7 $y $P[$(if (($y % 2) -eq 0) { 'B' } else { 'D' })]
        Set-Px $c 8 $y $P[$(if (($y % 2) -eq 0) { 'E' } else { 'F' })]
    }
    Set-Px $c 7 4 $P['C']
    if ($Active) {
        $hot = @('4', '5', '5', '6')
        for ($i = 0; $i -lt 4; $i++) {
            $px = 7 + ($i % 2); $py = 5 + [int][Math]::Floor($i / 2)
            $k = ($i + $T) % 4
            Set-Both $c $e $px $py $P[$hot[$k]]
        }
    } else {
        Set-Px $c 7 5 $P['7']; Set-Px $c 8 5 $P['G']; Set-Px $c 7 6 $P['F']; Set-Px $c 8 6 $P['H']
    }

    # base strip (y13): steam gauge (x4..8) and the status LED
    Set-Px $c 3 13 $P['F']; Set-Px $c 9 13 $P['F']
    $fill = if ($Active) { 2 + ($T % 4) } else { 0 }
    for ($i = 0; $i -lt 5; $i++) { Set-Px $c (4 + $i) 13 $P[$(if ($i -lt $fill) { 'W' } else { 'E' })] }
    if ($Active) { Set-Px $c (3 + $fill) 13 $P['V'] }
    if ($Active) { Set-Both $c $e 12 13 $P['h']; Set-Px $c 11 13 $P['i'] } else { Set-Px $c 12 13 $P['s']; Set-Px $c 11 13 $P['t'] }
    Sync-Emissive $c $e
    return @{ Color = $c; Emi = $e }
}

# ============================================================================================
#  HELIOSTAT MIRROR - block textures for block/heliostat/mirror.json
#  mirror_top: the panel seen from above (the model shows uv 1..15): a steel rim and four silvered facets with the sky in them
#  mirror_frame: rows 0-1 are the panel edge, the rest the backing truss / post / foot steel
# ============================================================================================
$MiPal = New-Palette ($SteelSpec + ' ' + 'm=EEF9FF n=CDEBFA o=A9D9F3 p=88C4E8 q=6CA9D4 W=FFFFFF')

function New-MirrorTop {
    $c = New-Canvas
    $P = $MiPal
    $glass = @('m', 'n', 'o', 'p', 'q')
    for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
        if ($x -eq 0 -or $y -eq 0 -or $x -eq 15 -or $y -eq 15) { Set-Px $c $x $y $P['F']; continue }
        if ($x -eq 1 -or $y -eq 1) { Set-Px $c $x $y $P['C']; continue }
        if ($x -eq 14 -or $y -eq 14) { Set-Px $c $x $y $P['E']; continue }
        # facet seams at x=7 and y=7 (with a lit edge just after them)
        if ($x -eq 7 -or $y -eq 7) { Set-Px $c $x $y $P['F']; continue }
        $fx = if ($x -lt 7) { $x - 2 } else { $x - 8 }
        $fy = if ($y -lt 7) { $y - 2 } else { $y - 8 }
        $tone = Get-ClampInt ([int][Math]::Floor(($fx + $fy) / 2)) 0 4
        $col = $P[$glass[$tone]]
        # one glint streak per facet (the sky's brightest part), and the facet's lit top-left corner
        if (($fx - $fy) -eq 1 -and $fx -le 3) { $col = $P['W'] }
        if ($fx -eq 0 -and $fy -eq 0) { $col = $P['W'] }
        Set-Px $c $x $y $col
    } }
    return $c
}

function New-MirrorFrame {
    $c = New-Canvas
    $P = $MiPal
    for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
        $col = 'D'
        if ($y -eq 0) { $col = 'B' } elseif ($y -eq 1) { $col = 'E' }
        elseif ($x -eq 0 -or $y -eq 2) { $col = 'C' } elseif ($x -eq 15 -or $y -eq 15) { $col = 'F' }
        elseif (($x - 2) -eq ($y - 2) -or ($x + $y) -eq 17) { $col = 'C' }
        elseif (($x - 2) -eq ($y - 1) -or ($x + $y) -eq 18) { $col = 'E' }
        Set-Px $c $x $y $P[$col]
    } }
    foreach ($r in @(@(3, 4), @(12, 4), @(3, 13), @(12, 13))) { Set-Px $c $r[0] $r[1] $P['A']; Set-Px $c ($r[0] + 1) ($r[1] + 1) $P['F'] }
    return $c
}

# ============================================================================================
#  ITEMS
# ============================================================================================
# --- contact catalyst: the pack's catalyst-charge look (a heap of 2x2 pellets in a cup, as the HV refinery catalysts), here an
#     LV steel cup with an orange band and yellow-orange vanadium pellets with a few pale diatomite ones -------------------------
$CatSteel = @((Hex 'D3D3D3'), (Hex 'B0B0B0'), (Hex '8E8E8E'), (Hex '707070'), (Hex '565656'))
$CatBand = @((Hex 'FFB648'), (Hex 'E07A1A'), (Hex '8A440E'))
$PelVanadium = @((Hex 'FFE38A'), (Hex 'F2B640'), (Hex 'D07F22'), (Hex '8E4A14'))
$PelDiatomite = @((Hex 'F3EEDC'), (Hex 'DDD3B6'), (Hex 'B8AC88'), (Hex '8A7E5E'))

# 0 = lit edge, 1 = light, 2..4 = darker towards the right (light from the top-left)
function Get-SpanTone {
    param([int]$X, [int]$X0, [int]$X1)
    $frac = ($X - $X0 + 0.5) / ($X1 - $X0 + 1)
    if ($frac -lt 0.22) { return 1 }
    elseif ($frac -lt 0.45) { return 0 }
    elseif ($frac -lt 0.62) { return 2 }
    elseif ($frac -lt 0.85) { return 3 }
    else { return 4 }
}

function New-ContactCatalyst {
    $c = New-Canvas
    # cup: rim (y8), orange band (y9), body (y10..11), rivets on the body, a narrower foot (y12)
    foreach ($x in 3..12) { Set-Px $c $x 8 $CatSteel[(Get-SpanTone $x 3 12)] }
    foreach ($x in 4..11) {
        $t = Get-SpanTone $x 4 11
        Set-Px $c $x 9 $(if ($t -le 1) { $CatBand[0] } elseif ($t -eq 2) { $CatBand[1] } else { $CatBand[2] })
    }
    foreach ($y in 10..11) { foreach ($x in 4..11) { Set-Px $c $x $y $CatSteel[(Get-ClampInt ((Get-SpanTone $x 4 11) + 1) 0 4)] } }
    Set-Px $c 5 10 $CatSteel[0]; Set-Px $c 10 10 $CatSteel[2]
    foreach ($x in 5..10) { Set-Px $c $x 12 $CatSteel[(Get-ClampInt ((Get-SpanTone $x 5 10) + 2) 0 4)] }
    # heap: 2 + 3 + 4 pellets (2x2, lit from the top-left); two of them are the pale carrier
    $balls = @(@(6, 2), @(8, 2), @(5, 4), @(7, 4), @(9, 4), @(4, 6), @(6, 6), @(8, 6), @(10, 6))
    $pale = @(2, 7)
    $tones = @(@(0, 0, 0), @(1, 0, 1), @(0, 1, 2), @(1, 1, 3))
    for ($bi = 0; $bi -lt $balls.Count; $bi++) {
        $ramp = if ($pale -contains $bi) { $PelDiatomite } else { $PelVanadium }
        foreach ($q in $tones) { Set-Px $c ($balls[$bi][0] + $q[0]) ($balls[$bi][1] + $q[1]) $ramp[$q[2]] }
    }
    Add-Outline $c -LitArgb (Hex '5A4A3A') -ShadeArgb (Hex '2A2018')
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

if (Test-Want 'roaster') { Out-Overlay 'block/multiblock/sulfide_roaster' ${function:New-RoasterFrame} 3 }
if (Test-Want 'heliostat') { Out-Overlay 'block/multiblock/heliostat_tower' ${function:New-HeliostatFrame} 4 }
if (Test-Want 'mirror') {
    Out-Tex (New-MirrorTop) 'block/heliostat/mirror_top.png'
    Out-Tex (New-MirrorFrame) 'block/heliostat/mirror_frame.png'
}
if (Test-Want 'catalyst') { Out-Tex (New-ContactCatalyst) 'item/contact_catalyst.png' }

# ============================================================================================
#  VERIFY what was written (size, binary alpha, no pure black, mcmeta vs frames, overlay ring, emissive subset)
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
    }
    # controller overlays keep the casing's outer ring of pixels visible; the mirror's block textures are full
    if ($rel -like 'block/multiblock/*') {
        $nf = [int]($img.H / 16)
        for ($f = 0; $f -lt $nf; $f++) { for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
            if ($x -lt 1 -or $y -lt 1 -or $x -ge 15 -or $y -ge 15) {
                if ((($img.P[($f * 16 + $y) * 16 + $x] -shr 24) -band 255) -ne 0) { $msgs += "opaque pixel in the casing ring (frame $f, $x,$y)"; $f = $nf; $y = 16; break }
            }
        } } }
    }
    if ($rel -like 'block/heliostat/*' -and $opaque -ne 256) { $msgs += "block texture is not fully opaque ($opaque px)" }
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
        Write-Host ("| ``pack/kubejs/assets/grindless/textures/$rel`` | Generated with tools/assets/$ScriptName (procedural pixel art, original) by the LV content agent, 2026-10-24 | the pack's own (pending; proposed CC BY-SA 4.0) |")
    }
}
if ($problems -gt 0) { exit 1 }
