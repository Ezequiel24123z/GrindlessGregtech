<#
.SYNOPSIS
  Procedural 16x16 pixel art for the EV era of Gregtech Grindless (GregTech style: bevels, top-left light, selective outlines).

.DESCRIPTION
  Every pixel is drawn by this script (palettes + char maps + small shading routines); nothing is copied or edited
  from GregTech Modern or any other mod. Output is deterministic: re-running overwrites the same bytes.

  Writes (under pack/kubejs/assets/grindless/textures/):
    block/multiblock/platinum_plant/overlay_front.png, overlay_front_active.png(+.mcmeta), overlay_front_active_emissive.png(+.mcmeta)
    block/multiblock/ev_vein_drill/...     (same three)
    item/platinum_electrode.png
    item/tungsten_steel_drill_bit.png

  Run from the repo root (PowerShell 5.1 blocks unsigned scripts by default; this bypass only affects that process):
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-EVTextures.ps1
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-EVTextures.ps1 -Only plant,electrode

  Overlay conventions (same as GregTech Modern's workable casings and as the steam, LV, MV and HV sets): transparent
  background, details only on the overlay, animated variants are vertical 16x(16*n) strips with a .png.mcmeta,
  *_emissive layers hold only the pixels that glow (identical to the colour layer). Every pixel is fully opaque or
  fully transparent. The outer 1 px ring is always left empty so the casing shows around the face.

  Casings the faces were drawn for (context only, see Build-EVPreview.ps1; every face has its own dark frame, so
  it also reads on the other casings):
    platinum_plant ->  gtceu:block/casings/solid/machine_casing_inert_ptfe       (gtceu:inert_machine_casing, docs/eras/ev.md)
    ev_vein_drill  ->  gtceu:block/casings/solid/machine_casing_stable_titanium  (gtceu:stable_machine_casing, docs/eras/ev.md)

  The bit shares one small shader with the steam, MV and HV drill bits (Draw-Helix, copied from Build-HVTextures.ps1 so
  that script stays untouched): a cone and cylinder lit from the top-left with a helical thread.

.PARAMETER Only
  Subset of: plant, drill, electrode, bit. Default: everything.
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

# Neutral steel ramp shared by every overlay (lit -> dark), the same one as the LV, MV and HV sets: GTM's own overlays use
# neutral greys over its casings, so the faces stay in the same family. EV is told apart by its purple accents (a..g).
$SteelSpec = 'A=D3D3D3 B=B0B0B0 C=8E8E8E D=707070 E=565656 F=404040 G=2F2F2F H=222222 I=161616 J=0D0D0D'
# EV tier purple, lit -> dark (stripes, lamps, pulses).
$PurpleSpec = 'a=F3E4FF b=D6B0FF c=B07AF0 d=8A4CD0 e=5C2E9C f=381C64 g=1C0E36'
# Clean stainless steel (cooler and brighter than the neutral steel), lit -> dark: glass walls.
$StainSpec = '0=F7FAFF 1=DCE5F0 2=B8C6D8 3=8E9DB2 4=667690 5=465470 6=2C364C'
# State lamp: green while working (M..P), red while idle (Q..S).
$LampSpec = 'M=E2FFE4 N=62FF86 O=22C257 P=0C6B2E Q=FF5A48 R=B52D22 S=5E1511'
# Tungsten steel (GregTech's is a blue-violet grey, 0x6464A0), lit -> dark: derrick legs and girders.
$TungstenSpec = 'T=E6E6FA U=BCBCE6 V=9494CC W=6C6CA8 X=4A4A80 Y=2E2E56'

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
#  PLATINUM PLANT - controller face (inert PTFE casing); the era's flagship
#  a glass electrolysis cell in the middle with two platinum electrodes dipping into aqua regia (bubbles rising,
#  platinum sponge on the floor), an acid vat on each side (nitric on the left, hydrochloric on the right) feeding it
#  through titanium-flanged pipes, a stainless pipe under all three, purple hazard stripes and a state lamp along the base
# ============================================================================================
$PlatPal = New-Pal ($SteelSpec + ' ' + $PurpleSpec + ' ' + $StainSpec + ' ' + $LampSpec + ' ' + @'
h=FFFFFF i=FBF6DC j=E6DDB0 k=B8AE78 l=7E7550
K=F9E9FF L=ECC8FA m=DCA0F0 n=AB6FC6 o=6B3C86
p=E4F48A q=BDD44C r=93AC36 s=6C8426 t=44571A
u=FFE08A v=FFB43C w=E08A1E x=A9600F y=6B3A0A
7=B4F0DA 8=78D0B2 9=4EA68C z=2F7A66 Z=1C4E40
V=E8F8C8 W=FFF6B8
'@)

$PlatNitric = 'pqrst'     # yellow-green, surface -> floor
$PlatAqua = 'uvwxy'       # orange-gold
$PlatHcl = '789zZ'        # teal
$PlatPipe = '32m32323m34' # stainless pipe along y12, x3..13, with titanium couplings at x5 and x11
$PlatGlints = @(@(7, 6), @(9, 8), @(8, 10))   # glint centres on the electrodes and in the cell: 3 sites, 3 frames each

function New-PlatinumPlantFrame {
    param([bool]$Active, [int]$T = 0)
    $c = New-Canvas; $e = New-Canvas
    $P = $PlatPal
    Write-Map $c 0 0 $WindowBase $P

    # acid vats: nitric (x3..4) and hydrochloric (x12..13), cap at y5, an empty row, the liquid from its surface (y7) down
    $vatRamp = @($PlatNitric, $PlatHcl); $vatX = @(3, 12)
    for ($v = 0; $v -lt 2; $v++) {
        $ramp = $vatRamp[$v]; $x0 = $vatX[$v]
        Set-Px $c $x0 5 $P[$(if ($v -eq 0) { 'B' } else { 'D' })]
        Set-Px $c ($x0 + 1) 5 $P[$(if ($v -eq 0) { 'C' } else { 'E' })]
        foreach ($i in 0, 1) { Set-Px $c ($x0 + $i) 6 $P['H'] }
        for ($y = 7; $y -le 11; $y++) {
            for ($i = 0; $i -lt 2; $i++) {
                $col = $P[[string]$ramp[(Get-ClampInt (($y - 7) + $i) 0 4)]]
                if (-not $Active) { $col = Shade $col 0.5 }
                if ($Active -and $y -eq 7) { Set-Both $c $e ($x0 + $i) $y $col } else { Set-Px $c ($x0 + $i) $y $col }
            }
        }
    }

    # electrolysis cell: glass walls (x5 lit, x11 shaded), cap at y4, interior x6..10: two empty rows, aqua regia from y7
    $cap = 'DCBBBCE'
    for ($i = 0; $i -lt 7; $i++) { Set-Px $c (5 + $i) 4 $P[[string]$cap[$i]] }
    for ($y = 5; $y -le 11; $y++) {
        Set-Px $c 5 $y $P['2']
        Set-Px $c 11 $y $P['4']
    }
    # feed pipes from the vats through the cell walls (y6)
    foreach ($x in 4, 5) { Set-Px $c $x 6 $P[$(if ($x -eq 4) { 'm' } else { 'K' })] }
    foreach ($x in 11, 12) { Set-Px $c $x 6 $P[$(if ($x -eq 11) { 'K' } else { 'n' })] }
    foreach ($y in 5, 6) { foreach ($x in 6..10) { Set-Px $c $x $y $P['H'] } }
    for ($y = 7; $y -le 10; $y++) {
        for ($x = 6; $x -le 10; $x++) {
            $col = $P[[string]$PlatAqua[(Get-ClampInt (($y - 7) + $(if ($x -ge 9) { 1 } else { 0 })) 0 4)]]
            if (-not $Active) { $col = Shade $col 0.5 }
            # the top two rows glow; the electrodes (x7, x9) are drawn over them, so those pixels are not emissive
            if ($Active -and $y -le 8 -and $x -ne 7 -and $x -ne 9) { Set-Both $c $e $x $y $col } else { Set-Px $c $x $y $col }
        }
    }
    # platinum sponge on the floor of the cell (y11)
    $sponge = @('l', 'k', 'j', 'l', 'k')
    for ($i = 0; $i -lt 5; $i++) {
        $col = $P[$sponge[$i]]
        if (-not $Active) { $col = Shade $col 0.6 }
        Set-Px $c (6 + $i) 11 $col
    }

    # platinum electrodes (x7 lit, x9 cream) from the cap down into the liquid (seen through it, so tinted); terminals stick out above the cap
    foreach ($rx in 7, 9) {
        $tone = if ($Active) { $(if ($rx -eq 7) { 'h' } else { 'i' }) } else { $(if ($rx -eq 7) { 'j' } else { 'k' }) }
        foreach ($y in 5..6) { Set-Px $c $rx $y $P[$tone] }
        foreach ($y in 7..8) {
            $liquid = $P[[string]$PlatAqua[(Get-ClampInt (($y - 7) + $(if ($rx -ge 9) { 1 } else { 0 })) 0 4)]]
            Set-Px $c $rx $y (Mix $P[$tone] $liquid 0.3)
        }
        Set-Px $c $rx 3 $P[$(if ($Active) { 'h' } else { 'B' })]
        if ($Active) { Set-Both $c $e $rx 9 $P['W'] } else { Set-Px $c $rx 9 $P['k'] }
    }

    # power wires from the electrode terminals out to the corners (y3), the pulse runs in along both of them
    $wireL = @(@(3, 3), @(4, 3), @(5, 3), @(6, 3))
    $wireR = @(@(13, 3), @(12, 3), @(11, 3), @(10, 3))
    foreach ($px in ($wireL + $wireR)) { Set-Px $c $px[0] $px[1] $P['E'] }

    # pipe under the three vessels (y12) and the strip below it (y13): stripes x3..9, state lamp x11..13
    for ($i = 0; $i -lt 11; $i++) { Set-Px $c (3 + $i) 12 $P[[string]$PlatPipe[$i]] }
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

    if ($Active) {
        # the power pulse (purple, with a dimmer tail) runs in along the wires to the terminals
        $k = $T % 4; $tailK = ($T + 3) % 4
        foreach ($wire in @($wireL, $wireR)) {
            Set-Both $c $e $wire[$tailK][0] $wire[$tailK][1] $P['d']
            Set-Both $c $e $wire[$k][0] $wire[$k][1] $P['c']
        }
        # acid runs through the feed pipes into the cell (nitric from the left, hydrochloric from the right)
        Set-Both $c $e (4 + ($T % 2)) 6 $P['p']
        Set-Both $c $e (12 - ($T % 2)) 6 $P['7']
        # bubbles rise from the electrode tips: one up the middle, one on the side that swaps every four frames; the 4th
        # frame of each 4-frame cycle the bubble has popped
        $side = if ((($T + 2) % 8) -lt 4) { 6 } else { 10 }
        if ($k -lt 3) { Set-Both $c $e 8 (9 - $k) $P['h'] }
        if ((($T + 2) % 4) -lt 3) { Set-Both $c $e $side (9 - (($T + 2) % 4)) $P['W'] }
        # a glint skims the surface; fumes wisp up inside the cell (not emissive)
        $skim = @(6, 8, 10, 8)[$T % 4]
        Set-Both $c $e $skim 7 $P['W']
        $fume = @(@(8, 6), @(8, 5), @(10, 6), @(6, 5))[$T % 4]
        Set-Px $c $fume[0] $fume[1] $P['V']
        # current runs down the electrodes (the right one two frames behind)
        Set-Both $c $e 7 (5 + ($T % 4)) $P['W']
        Set-Both $c $e 9 (5 + (($T + 2) % 4)) $P['W']
        # sponge twinkle
        Set-Both $c $e (6 + ($T % 4)) 11 $P['h']
        # two light beads run along the titanium pipe (path of 16 cells, 11 of them visible), half a loop apart
        foreach ($off in 0, 8) {
            $pos = (2 * $T + $off) % 16
            if ($pos -lt 11) { Set-Both $c $e (3 + $pos) 12 $P['a'] }
        }
        # platinum glints: three sites, each a 3-frame sparkle (a dim point, the full cross, a dim point again)
        for ($k = 0; $k -lt 3; $k++) {
            $age = (($T - 3 * $k) % 8 + 8) % 8
            if ($age -gt 2) { continue }
            $gx = $PlatGlints[$k][0]; $gy = $PlatGlints[$k][1]
            if ($age -eq 1) {
                foreach ($d in @(@(-1, 0), @(1, 0), @(0, -1), @(0, 1))) { Set-Both $c $e ($gx + $d[0]) ($gy + $d[1]) $P['W'] }
                Set-Both $c $e $gx $gy $P['h']
            } else { Set-Both $c $e $gx $gy $P['W'] }
        }
    }
    Sync-Emissive $c $e
    return @{ Color = $c; Emi = $e }
}

# ============================================================================================
#  EV VEIN DRILL - controller face (stable titanium casing)
#  a tall tungsten steel derrick (a vertical mast flaring into an A-frame, girders between the legs) around a dark top
#  drive, a tungsten steel bit biting into End stone rich in ore; purple power cable along the top and a drilling-mud
#  hose, purple stripes and a state lamp at the base
# ============================================================================================
$EvDrillPal = New-Pal ($SteelSpec + ' ' + $PurpleSpec + ' ' + $LampSpec + ' ' + $TungstenSpec + ' ' + @'
K=F6F6FF L=C4C4F0 m=9494D4 n=6464A0 o=3C3C70
p=F3F0B6 q=DAD596 r=BAB474 s=8F8A52 t=5E5A33
u=FFB347 v=3B2468 w=FFFFFF z=D6B84A
x=8A5A2E y=B07A44
'@)

$EvDrillBase = @(
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
Assert-Map 'EvDrillBase' $EvDrillBase

# Derrick legs (x, y, tone): straight up to y6, then flaring out to the corners; light on the lit left leg, darker on the right.
$EvLegL = @(@(5, 3, 'U'), @(5, 4, 'V'), @(5, 5, 'U'), @(5, 6, 'V'), @(4, 7, 'U'), @(4, 8, 'V'), @(3, 9, 'U'), @(3, 10, 'V'))
$EvLegR = @(@(11, 3, 'W'), @(11, 4, 'X'), @(11, 5, 'W'), @(11, 6, 'X'), @(12, 7, 'W'), @(12, 8, 'X'), @(13, 9, 'W'), @(13, 10, 'X'))
# Girders between the legs.
$EvGirders = @(@(6, 6, 'V'), @(10, 6, 'X'), @(5, 8, 'V'), @(6, 8, 'W'), @(10, 8, 'W'), @(11, 8, 'X'))
# Power cable (right) and mud hose (left), 8 cells each: out of the top drive, along the top bezel, down the wall.
$EvCable = @(@(10, 2), @(11, 2), @(12, 2), @(13, 2), @(13, 3), @(13, 4), @(13, 5), @(13, 6))
$EvHose = @(@(6, 2), @(5, 2), @(4, 2), @(3, 2), @(3, 3), @(3, 4), @(3, 5), @(3, 6))
# Top drive (x6..10, y3..4): dark housing, the purple window is at (8,4).
$EvTopDrive = @(
    'BAAAC',
    'CD.DE'
)
# Bit (y7..9), axis x = 8: first column and tones per row (K spec, L light, m mid, n dark, o darker).
$EvBitRows = @(@(6, 'LKmno'), @(7, 'Lmo'), @(8, 'n'))

function New-EvDrillFrame {
    param([bool]$Active, [int]$T = 0)
    $c = New-Canvas; $e = New-Canvas
    $P = $EvDrillPal
    Write-Map $c 0 0 $EvDrillBase $P

    # base plate: purple stripes (x2..8) and the state lamp (x10..13)
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

    # derrick: legs and girders
    foreach ($px in $EvLegL) { Set-Px $c $px[0] $px[1] $P[[string]$px[2]] }
    foreach ($px in $EvLegR) { Set-Px $c $px[0] $px[1] $P[[string]$px[2]] }
    foreach ($px in $EvGirders) { Set-Px $c $px[0] $px[1] $P[[string]$px[2]] }

    # power cable and mud hose
    foreach ($px in $EvCable) { Set-Px $c $px[0] $px[1] $P['E'] }
    foreach ($px in $EvHose) { Set-Px $c $px[0] $px[1] $P['F'] }

    # top drive: the window shows a purple light that pulses while it turns
    for ($j = 0; $j -lt 2; $j++) { for ($i = 0; $i -lt 5; $i++) {
        $ch = [string]$EvTopDrive[$j][$i]
        if ($ch -ne '.') { Set-Px $c (6 + $i) (3 + $j) $P[$ch] }
    } }
    $win = if ($Active) { if (($T % 2) -eq 0) { 'b' } else { 'c' } } else { 'f' }
    if ($Active) { Set-Both $c $e 8 4 $P[$win] } else { Set-Px $c 8 4 $P[$win] }
    if ($Active) {
        # the cable pulse and the mud slugs start at the top drive
        $head = $EvCable[$T % 8]; $tail = $EvCable[($T + 7) % 8]
        Set-Both $c $e $head[0] $head[1] $P['b']
        Set-Both $c $e $tail[0] $tail[1] $P['d']
        $slug = $EvHose[(7 - ($T % 8))]
        Set-Px $c $slug[0] $slug[1] $P['y']
        $slug2 = $EvHose[((7 - ($T % 8)) + 4) % 8]
        Set-Px $c $slug2[0] $slug2[1] $P['x']
        # beacons on the leg tops swap every other frame
        if (($T % 4) -lt 2) { Set-Both $c $e 5 3 $P['b'] } else { Set-Both $c $e 11 3 $P['b'] }
    }

    # drill string (x7..9, y5..6): the lit band swaps rows every frame while it turns; a purple light runs down it
    $up = @('B', 'C', 'E'); $dn = @('C', 'D', 'F')
    $swap = $Active -and (($T % 2) -eq 1)
    for ($i = 0; $i -lt 3; $i++) {
        Set-Px $c (7 + $i) 5 $P[$(if ($swap) { $dn[$i] } else { $up[$i] })]
        Set-Px $c (7 + $i) 6 $P[$(if ($swap) { $up[$i] } else { $dn[$i] })]
    }
    if ($Active) { Set-Both $c $e 8 (5 + ($T % 2)) $P['c'] }

    # bit: tungsten steel, lit left edge; a spec glint walks around the cone while it turns
    for ($r = 0; $r -lt 3; $r++) {
        $row = $EvBitRows[$r]
        for ($i = 0; $i -lt $row[1].Length; $i++) { Set-Px $c ($row[0] + $i) (7 + $r) $P[[string]$row[1][$i]] }
    }
    if ($Active) {
        $phase = $T % 4
        Set-Px $c (6 + $phase) 7 $P['K']
        Set-Px $c (7 + (($phase + 1) % 3)) 8 $P['K']
    }

    # End stone rock rich in ore: scheelite (orange), platinum (white), sulphides (brass) and violet tungstate flecks
    $rock = @(
        @(4, 9, 'r'), @(5, 9, 'u'), @(6, 9, 'q'), @(7, 9, 'p'), @(9, 9, 'p'), @(10, 9, 'w'), @(11, 9, 'q'), @(12, 9, 's'),
        @(4, 10, 's'), @(5, 10, 'r'), @(6, 10, 'z'), @(7, 10, 'q'), @(8, 10, 'q'), @(9, 10, 'u'), @(10, 10, 'r'), @(11, 10, 'v'), @(12, 10, 't')
    )
    foreach ($px in $rock) { Set-Px $c $px[0] $px[1] $P[[string]$px[2]] }

    if ($Active) {
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
        # a platinum fleck flashes into a star every fourth frame
        if (($T % 4) -eq 1) {
            foreach ($d in @(@(-1, 0), @(1, 0), @(0, -1), @(0, 1))) { Set-Both $c $e (10 + $d[0]) (9 + $d[1]) $P['a'] }
            Set-Both $c $e 10 9 $P['w']
        }
    }
    Sync-Emissive $c $e
    return @{ Color = $c; Emi = $e }
}

# ============================================================================================
#  ITEMS
# ============================================================================================
# --- Draw-Helix: shared shader of the steam, MV, HV and EV drill bits (copied from Build-HVTextures.ps1) -----------------
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

# GregTech's tungsten steel is a blue-violet grey (0x6464A0): spec, light, mid, dark, darkest.
$RampTungstenSteel = @((Hex 'F2F2FF'), (Hex 'C4C4F0'), (Hex '9494D4'), (Hex '6464A0'), (Hex '3C3C70'))

# One step above the titanium bit: wider and longer, three broad flutes.
function New-TungstenSteelBit {
    $c = New-Canvas
    Draw-Helix $c $RampTungstenSteel 8.0 14.7 3.6 8.5 10.5 2.4 13.6 16.0 3.0 0.95 0.0
    Add-Outline $c -LitArgb (Hex '55559A') -ShadeArgb (Hex '1A1A38')
    return $c
}

# --- platinum electrode: the graphite electrode's diagonal rod (lower-left -> upper-right, a 4 px band per row lit from the
# top-left) in platinum, with a titanium core showing at the cut end, a titanium collar and a titanium threaded nipple ------
# ramps: 0 gloss, 1 light, 2 mid, 3 dark, 4 darkest
$RampPlatinum = @((Hex 'FFFFFF'), (Hex 'F7F2C8'), (Hex 'DDD392'), (Hex 'A69B60'), (Hex '635B38'))
$RampTitanium = @((Hex 'F9E9FF'), (Hex 'ECC8FA'), (Hex 'DCA0F0'), (Hex 'AB6FC6'), (Hex '6B3C86'))

function New-PlatinumElectrode {
    $c = New-Canvas
    $R = $RampPlatinum; $Ti = $RampTitanium
    # body rows y4..12: x_left = 14 - y, so every row shifts one pixel and the tones run along the axis
    for ($y = 4; $y -le 12; $y++) {
        $xl = 14 - $y
        $tones = if ($y -ge 5 -and $y -le 9) { @(1, 0, 3, 4) } elseif ($y -eq 11) { @(1, 0, 3, 4) } else { @(1, 2, 3, 4) }
        for ($i = 0; $i -lt 4; $i++) { Set-Px $c ($xl + $i) $y $R[$tones[$i]] }
    }
    # cut end (y13): the titanium core; shoulder collar (y3) and threaded nipple (y2, y1): titanium
    foreach ($i in 0..3) { Set-Px $c (1 + $i) 13 $Ti[@(1, 2, 3, 4)[$i]] }
    foreach ($i in 0..3) { Set-Px $c (11 + $i) 3 $Ti[@(0, 1, 2, 3)[$i]] }
    foreach ($i in 0..2) { Set-Px $c (12 + $i) 2 $Ti[@(2, 3, 4)[$i]] }
    foreach ($i in 0..2) { Set-Px $c (13 + $i) 1 $Ti[@(1, 2, 3)[$i]] }
    Add-Outline $c
    # a four-point platinum sparkle beside the rod
    foreach ($d in @(@(-1, 0), @(1, 0), @(0, -1), @(0, 1))) { Set-Px $c (5 + $d[0]) (4 + $d[1]) (Hex 'FFF6B8') }
    Set-Px $c 5 4 (Hex 'FFFFFF')
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

if (Test-Want 'plant') { Out-Overlay 'block/multiblock/platinum_plant' ${function:New-PlatinumPlantFrame} 3 }
if (Test-Want 'drill') { Out-Overlay 'block/multiblock/ev_vein_drill' ${function:New-EvDrillFrame} 2 }
if (Test-Want 'electrode') { Out-Tex (New-PlatinumElectrode) 'item/platinum_electrode.png' }
if (Test-Want 'bit') { Out-Tex (New-TungstenSteelBit) 'item/tungsten_steel_drill_bit.png' }

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
