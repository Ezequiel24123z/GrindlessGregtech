<#
.SYNOPSIS
  Procedural 16x16 pixel art for the steam era of Gregtech Grindless (GregTech-style: bevels, top-left light, selective outlines).

.DESCRIPTION
  Every pixel is drawn by this script (palettes + char maps + small shading routines); nothing is copied or edited
  from GregTech Modern or any other mod. Output is deterministic: re-running overwrites the same bytes.

  Writes (under pack/kubejs/assets/grindless/textures/):
    block/multiblock/steam_vein_drill/overlay_front.png, overlay_front_active.png(+.mcmeta), overlay_front_active_emissive.png(+.mcmeta)
    block/multiblock/steam_greenhouse/overlay_front.png, overlay_front_active.png(+.mcmeta), overlay_front_active_emissive.png(+.mcmeta)
    item/bronze_drill_bit.png, item/steel_drill_bit.png, item/empty_vein_probe.png
    item/vein_sample_frame.png (layer0, untinted), item/vein_sample_core.png (layer1, grayscale, tinted by the game)
    item/void_key.png, item/flat_key.png

  Run from the repo root (PowerShell 5.1 blocks unsigned scripts by default; this bypass only affects that process):
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-SteamTextures.ps1
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-SteamTextures.ps1 -Only drill,keys

  Overlay conventions (same as GregTech Modern's workable casings): transparent background, details only on the
  overlay, animated variants are vertical 16x(16*n) strips with a .png.mcmeta, *_emissive layers hold only the
  pixels that glow. Every pixel is fully opaque or fully transparent (no anti-aliasing).

  Drill bits and the drill inside the controller window share one small shader (Draw-Helix): a vertical cone or
  cylinder lit from the top-left with a helical thread, quantised to a 5-tone ramp. The window drill spins by
  advancing the thread phase one quarter turn per frame.

.PARAMETER Only
  Subset of: drill, greenhouse, bits, probe, sample, keys. Default: everything.
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

if (-not $OutRoot) { $OutRoot = Join-Path $PSScriptRoot '..\..\pack\kubejs\assets\grindless\textures' }
$OutRoot = [System.IO.Path]::GetFullPath($OutRoot)
$ScriptName = Split-Path -Leaf $PSCommandPath

function Test-Want { param([string]$Id) return ($Only.Count -eq 0 -or $Only -contains $Id) }

$written = New-Object System.Collections.Generic.List[string]
function Out-Tex {
    param($Canvas, [string]$Rel, [int]$FrameTime = 0)
    $p = Join-Path $OutRoot ($Rel -replace '/', '\')
    Save-Png $Canvas $p
    $written.Add($Rel)
    if ($FrameTime -gt 0) { Save-Mcmeta ($p + '.mcmeta') $FrameTime; $written.Add($Rel + '.mcmeta') }
}

function Assert-Map {
    param([string]$Name, [string[]]$Rows, [int]$W = 16, [int]$H = 16)
    if ($Rows.Count -ne $H) { throw "${Name}: expected $H rows, got $($Rows.Count)" }
    for ($i = 0; $i -lt $Rows.Count; $i++) { if ($Rows[$i].Length -ne $W) { throw "${Name}: row $i has $($Rows[$i].Length) chars, expected $W" } }
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

function Get-ClampInt { param([int]$V, [int]$Lo, [int]$Hi) return [Math]::Max($Lo, [Math]::Min($Hi, $V)) }

# Ray-shaded vertical body, tip down, axis at x = $Xc, light from the top-left-front.
#   axial 0..TipLen   cone from the point up to $RadBody
#   ..BodyLen         cylinder of radius $RadBody carrying the helical thread (pitch = px per turn, $Starts = number of flutes,
#                     $Amp = relief strength; a long pitch with several starts gives slanted flutes at this tiny size)
#   ..BodyLen+1       one dark groove row (shoulder)
#   ..TotalLen        smooth shank of radius $RadShank
# $Phase is the thread phase in pattern periods (animating it makes the drill spin). Pixels are fully opaque or skipped.
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

# ============================================================================================
#  STEAM VEIN DRILL - controller face
#  gauge (x1-5) | feed pipe (x6-9) | pressure lamp (x10-14) over a steel-bezelled shaft window (y6-14)
# ============================================================================================
$DrillPal = New-Palette @'
Y=F0D890 y=D9AD50 u=B08630 U=7E5820 W=54381A O=2E1F0C
A=CBCFD6 B=A4A9B2 C=7D838D E=5A5F69 F=3C4048 G=262930
0=0D0F12 1=14171B 2=1C2026
f=F4EBD0 g=D9CBA6 h=A89874 p=3A2A14 n=FF4A3A
l=7E2A20 L=A33A2C k=4A1812
q=4CFF7A Q=C8FFD0 r=19B84A R=0B6A2C
b=F2A854 c=D97E22
5=DCE2E8 6=AEB6C0 7=7A828E
'@
$RampWindowBit = @((Hex 'FFE0A8'), (Hex 'F5B25A'), (Hex 'DC8428'), (Hex 'B0601A'), (Hex '7A3E12'))

$DrillBase = @(
    '................',
    '..yYu.WyuW.yYu..',
    '.yffgUWYyWyLlkU.',
    '.YfpgUWuUWYllkU.',
    '.ugghUWyuWulkkU.',
    '..UUW.WyuW.UUW..',
    '.ABBBBWyuWBBBBC.',
    '.B000000000000E.',
    '.B011111111112E.',
    '.B011111111112E.',
    '.B011111111112E.',
    '.B011111111112E.',
    '.B011111111112E.',
    '.B022222222222E.',
    '.CuuFFuuFFuuFFF.',
    '................'
)
Assert-Map 'DrillBase' $DrillBase

function New-DrillFrame {
    param([bool]$Active, [int]$T = 0)
    $c = New-Canvas; $e = New-Canvas
    Write-Map $c 0 0 $DrillBase $DrillPal
    $P = $DrillPal

    # gauge needle: pivot (3,3). Idle rests low-left, active shivers high-right.
    if (-not $Active) { Set-Px $c 2 4 $P['n'] }
    else {
        $tips = @(@(4, 2), @(4, 2), @(4, 3), @(4, 2), @(4, 2), @(3, 2), @(4, 2), @(4, 2))
        $tip = $tips[$T % 8]
        Set-Px $c $tip[0] $tip[1] $P['n']
    }

    # pressure lamp lens (11..13, 2..4): dim red idle (in the base map), green when working (+ emissive)
    if ($Active) {
        $core = if (($T % 4) -lt 2) { 'Q' } else { 'q' }
        $lens = @("${core}qr", 'qqr', 'qrR')
        for ($j = 0; $j -lt 3; $j++) { for ($i = 0; $i -lt 3; $i++) {
            $col = $P[[string]$lens[$j][$i]]
            Set-Px $c (11 + $i) (2 + $j) $col; Set-Px $e (11 + $i) (2 + $j) $col
        } }
    }

    # side pistons: heads at y8-9, rods slide 0..3 px; the two sides run half a cycle apart
    $strokeL = @(0, 1, 2, 3, 3, 2, 1, 0); $strokeR = @(3, 2, 1, 0, 0, 1, 2, 3)
    $lenL = 1; $lenR = 1
    if ($Active) { $lenL = $strokeL[$T % 8]; $lenR = $strokeR[$T % 8] }
    foreach ($pist in @(@(3, $lenL), @(11, $lenR))) {
        $headX = $pist[0]; $len = $pist[1]
        Set-Px $c $headX 8 $P['C']; Set-Px $c ($headX + 1) 8 $P['E']
        Set-Px $c $headX 9 $P['E']; Set-Px $c ($headX + 1) 9 $P['F']
        for ($yy = 10; $yy -lt (10 + $len); $yy++) { Set-Px $c $headX $yy $P['A']; Set-Px $c ($headX + 1) $yy $P['B'] }
        Set-Px $c $headX (10 + $len) $P['C']; Set-Px $c ($headX + 1) (10 + $len) $P['F']
    }

    # chuck, then the conical helical bit; one quarter turn of thread per frame when working
    Write-Map $c 6 7 @('BACE') $P
    $phase = if ($Active) { ($T % 4) * 0.25 } else { 0.0 }
    Draw-Helix $c $RampWindowBit 8.0 14.2 3.4 5.8 5.8 3.4 6.0 12.0 3.0 0.70 $phase

    if ($Active) {
        # the tip glows with friction (colour + emissive) and throws sparks
        $glow = if (($T % 2) -eq 0) { @('b', 'Y', 'Y', 'b') } else { @('Y', 'b', 'b', 'Y') }
        $tipPx = @(@(7, 12), @(8, 12), @(7, 13), @(8, 13))
        for ($i = 0; $i -lt 4; $i++) {
            $col = $P[$glow[$i]]; Set-Px $c $tipPx[$i][0] $tipPx[$i][1] $col; Set-Px $e $tipPx[$i][0] $tipPx[$i][1] $col
        }
        $sparks = @(
            @(@(6, 13, 'y'), @(9, 12, 'Y')),
            @(@(9, 13, 'Y'), @(6, 12, 'y')),
            @(@(5, 13, 'y'), @(10, 13, 'y')),
            @(@(10, 12, 'Y'), @(6, 13, 'Y'))
        )
        foreach ($sp in $sparks[$T % 4]) {
            $col = $P[[string]$sp[2]]; Set-Px $c $sp[0] $sp[1] $col; Set-Px $e $sp[0] $sp[1] $col
        }
        # exhaust puffs: each piston vents a rising wisp (4 frames) right after it bottoms out
        $puff = @(
            @(,@(0, 0, '6')),
            @(@(0, 0, '7'), @(0, -1, '5')),
            @(@(0, -1, '7'), @(0, -2, '5')),
            @(@(0, -2, '7'), @(0, -3, '6'))
        )
        # (column x, base y, first frame of the puff)
        foreach ($vent in @(@(2, 12, 4), @(13, 12, 0))) {
            $k = (($T - $vent[2]) % 8 + 8) % 8
            if ($k -lt 4) {
                foreach ($d in $puff[$k]) { Set-Px $c $vent[0] ($vent[1] + $d[1]) $P[[string]$d[2]] }
            }
        }
    }
    return @{ Color = $c; Emi = $e }
}

# ============================================================================================
#  STEAM GREENHOUSE - controller face
#  brass-framed glass pane with a sapling, sprinkler nozzle, soil bed; valve + riser on a pipe, LED in the frame
# ============================================================================================
$GhPal = New-Palette @'
Y=F0D890 y=D9AD50 u=B08630 U=7E5820 W=54381A O=2E1F0C
a=0B1F24 b=0F2B30 c=15393D d=1D4A4C m=2B6063 M=3E8283
e=B8F060 f=78D043 g=45A634 h=2A7A2A i=185224
j=A8733B k=7C5126 n=523216
o=7A5230 p=5A3A20 q=3A2412
r=E6FBFF s=A5E3EE t=6BB8C9
v=DDF6FF w=7CC8F0 x=3F8CD0
R=FF7B5C S=D4412D T=8E2318
L=A33A2C l=7E2A20 z=4A1812
G=4CFF7A Q=C8FFD0 H=19B84A
'@

$GhBase = @(
    '................',
    '.YyyyyyyyyyyyyY.',
    '.yaaaaaaaaaauaU.',
    '.yaaaaaaaaaaaaU.',
    '.ybbbbbbbbbbbbU.',
    '.ybbbbbbbbbbbbU.',
    '.ybbbbbbbbbbbbU.',
    '.yccccccccccccU.',
    '.yccccccccccccU.',
    '.yopooopooooopU.',
    '.ypqpppqppppqpU.',
    '.YUUUUUUUUUUlzY.',
    '..WRSTW....yu...',
    '.uYuUuYyyyyyyYu.',
    '.WUUUUUUUUUUUUW.',
    '................'
)
Assert-Map 'GhBase' $GhBase

function New-GreenhouseFrame {
    param([bool]$Active, [int]$T = 0)
    $c = New-Canvas; $e = New-Canvas
    Write-Map $c 0 0 $GhBase $GhPal
    $P = $GhPal

    # rivets on the brass frame
    foreach ($rv in @(@(5, 1, 'Y'), @(10, 1, 'Y'), @(1, 4, 'Y'), @(1, 8, 'Y'), @(14, 4, 'u'), @(14, 8, 'u'), @(5, 11, 'u'), @(9, 11, 'u'))) {
        Set-Px $c $rv[0] $rv[1] $P[[string]$rv[2]]
    }
    # grass tufts on the soil
    Set-Px $c 5 9 $P['h']; Set-Px $c 6 9 $P['g']; Set-Px $c 9 9 $P['g']; Set-Px $c 10 9 $P['h']

    # humid steam: two pale wisps drift across the glass behind the plant (1.5 px per frame = 12 px per 8-frame loop)
    if ($Active) {
        $shift = [int][Math]::Floor(1.5 * ($T % 8))
        foreach ($wisp in @(@(8, 0, 'm', 'M'), @(7, 6, 'M', 'm'))) {
            Set-Px $c (2 + (($shift + $wisp[1]) % 12)) $wisp[0] $P[[string]$wisp[2]]
            Set-Px $c (2 + (($shift + $wisp[1] + 1) % 12)) $wisp[0] $P[[string]$wisp[3]]
        }
    }

    # sapling canopy with sway (the two upper rows lean, the lower rows stay planted)
    $sw3 = @(0, 1, 1, 1, 0, -1, -1, -1); $sw4 = @(0, 0, 1, 0, 0, 0, -1, 0)
    $o3 = 0; $o4 = 0
    if ($Active) { $o3 = $sw3[$T % 8]; $o4 = $sw4[$T % 8] }
    $canopy = @(
        @(3, 6, 'fefg', $o3), @(4, 5, 'fefggh', $o4), @(5, 4, 'ffgfghhi', 0), @(6, 5, 'ghghhi', 0)
    )
    foreach ($row in $canopy) {
        $leafRow = $row[2]
        for ($i = 0; $i -lt $leafRow.Length; $i++) {
            $ch = [string]$leafRow[$i]
            Set-Px $c ($row[1] + $i + $row[3]) $row[0] $P[$ch]
            if ($Active -and $ch -eq 'e' -and ((($T + $i + $row[0]) % 4) -lt 2)) { Set-Px $e ($row[1] + $i + $row[3]) $row[0] $P['e'] }
        }
    }
    Set-Px $c 6 7 $P['g']; Set-Px $c 9 7 $P['h']
    Set-Px $c 7 7 $P['j']; Set-Px $c 8 7 $P['k']; Set-Px $c 7 8 $P['k']; Set-Px $c 8 8 $P['n']

    # glass glints, drawn last so they sit in front of the plant
    Set-Px $c 3 5 $P['s']; Set-Px $c 4 4 $P['r']; Set-Px $c 5 3 $P['s']
    Set-Px $c 2 7 $P['t']; Set-Px $c 3 6 $P['t']
    if ($Active -and ($T % 8) -ge 3 -and ($T % 8) -le 4) { Set-Px $c 4 3 $P['s']; Set-Px $c 3 4 $P['s'] }

    if ($Active) {
        # drip from the nozzle at (12,2): bulge, fall, splash on the soil
        $drip = @(
            @(,@(12, 3, 'x')),
            @(,@(12, 4, 'w')),
            @(,@(12, 5, 'v')),
            @(,@(12, 6, 'v')),
            @(,@(12, 7, 'w')),
            @(,@(12, 8, 'x')),
            @(@(11, 8, 'w'), @(13, 8, 'w'), @(12, 9, 'q')),
            @(,@(12, 9, 'q'))
        )
        foreach ($d in $drip[$T % 8]) { Set-Px $c $d[0] $d[1] $P[[string]$d[2]] }
        # status LED in the frame (also emissive)
        Set-Px $c 12 11 $P['G']; Set-Px $e 12 11 $P['G']
        Set-Px $c 13 11 $P['H']; Set-Px $e 13 11 $P['H']
    }
    return @{ Color = $c; Emi = $e }
}

# ============================================================================================
#  ITEMS
# ============================================================================================
# ramps: spec, light, mid, dark, darkest
$RampBronze = @((Hex 'FFE0A8'), (Hex 'F5B25A'), (Hex 'DC8428'), (Hex 'B0601A'), (Hex '7A3E12'))
$RampSteel  = @((Hex 'F2F6FA'), (Hex 'C8D3E0'), (Hex '9AA9BC'), (Hex '6D7D95'), (Hex '48587A'))

# Vertical twist bit: smooth shank, shoulder groove, helical flutes, conical tip.
function New-DrillBit {
    param($Ramp, [double]$TipLen, [double]$Pitch, [double]$Starts, [double]$Amp, [int]$OutlineLit, [int]$OutlineShade)
    $c = New-Canvas
    Draw-Helix $c $Ramp 8.0 14.7 3.0 $TipLen 10.5 2.0 13.6 $Pitch $Starts $Amp 0.0
    Add-Outline $c -LitArgb $OutlineLit -ShadeArgb $OutlineShade
    return $c
}

# --- glass sampling probe ------------------------------------------------------------------
$ProbePal = New-Palette @'
1=FFE2AE 2=F0AE5C 3=D4802A 4=A25414 5=683410
GW=F6FBFF GL=D6E8F8 GM=9CC0E6 GD=5F8DC4 GB=3E6AA5
'@
$RampProbeCap = @($ProbePal['1'], $ProbePal['2'], $ProbePal['3'], $ProbePal['4'], $ProbePal['5'])

# Shared body of the empty probe and the sample frame: bronze cap with knob on an 8 px glass vial whose interior
# (x5..10, y5..12) is transparent and whose bottom is rounded glass. $Extras adds glints that only the empty
# probe shows (the sample's core would hide them).
function New-ProbeBody {
    param([bool]$Extras = $false)
    $c = New-Canvas
    $cap = $RampProbeCap
    foreach ($x in 6..9) { Set-Px $c $x 1 $cap[(Get-SpanTone $x 6 9)] }
    foreach ($x in 5..10) { Set-Px $c $x 2 $cap[(Get-SpanTone $x 5 10)] }
    foreach ($x in 4..11) { Set-Px $c $x 3 $cap[(Get-SpanTone $x 4 11)] }
    foreach ($x in 4..11) { Set-Px $c $x 4 $cap[(Get-ClampInt ((Get-SpanTone $x 4 11) + 1) 0 4)] }
    foreach ($y in 5..12) { Set-Px $c 4 $y $ProbePal['GL']; Set-Px $c 11 $y $ProbePal['GD'] }
    Set-Px $c 4 5 $ProbePal['GM']; Set-Px $c 11 5 $ProbePal['GB']
    # rounded glass bottom
    $bottom = @(@(13, 'GL', 'GM', 'GM', 'GD', 'GD', 'GB'), @(14, '', 'GM', 'GD', 'GD', 'GB', ''))
    foreach ($row in $bottom) {
        for ($i = 1; $i -le 6; $i++) { if ($row[$i] -ne '') { Set-Px $c (4 + $i) $row[0] $ProbePal[$row[$i]] } }
    }
    # the interior is shielded from the outline pass with a marker, then cleared
    $marker = Hex 'FF00FF'
    foreach ($y in 5..12) { foreach ($x in 5..10) { Set-Px $c $x $y $marker } }
    Add-Outline $c
    foreach ($y in 5..12) { foreach ($x in 5..10) { Set-Px $c $x $y 0 } }
    # glass highlights on the left inner wall (kept by the sample frame: the core never covers x5)
    Set-Px $c 5 5 $ProbePal['GL']
    foreach ($y in 6..10) { Set-Px $c 5 $y $ProbePal['GW'] }
    Set-Px $c 5 11 $ProbePal['GL']
    if ($Extras) {
        Set-Px $c 9 6 $ProbePal['GL']; Set-Px $c 9 7 $ProbePal['GL']; Set-Px $c 10 10 $ProbePal['GM']; Set-Px $c 10 11 $ProbePal['GM']
    }
    return $c
}

# Core footprint inside the vial: x6..10, y6..12 (x5 stays free for the glass highlight).
$CoreRows = @(
    '..C..',
    '.BAC.',
    'BACDD',
    'ABDCE',
    'BCADE',
    'CDEEF',
    'DEEFF'
)
$CorePal = New-Palette 'A=F2F2F2 B=D6D6D6 C=B4B4B4 D=8C8C8C E=666666 F=424242'

function New-VeinCore {
    $c = New-Canvas
    Write-Map $c 6 6 $CoreRows $CorePal
    return $c
}

# --- keys -------------------------------------------------------------------------------------
$VoidMetal = @((Hex 'B6A8EA'), (Hex '7B66BF'), (Hex '4F3F8F'), (Hex '33275E'), (Hex '1E1740'))
$FlatMetal = @((Hex 'F4F7FB'), (Hex 'CBD4E0'), (Hex '9CAABD'), (Hex '6F7F96'), (Hex '4B5A73'))

function New-Key {
    param($Metal, [string]$Kind)
    $c = New-Canvas
    # bow: 10x7 rounded ring, 6x3 hole
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
            Set-Px $c $x $y $Metal[(Get-ClampInt $tone 0 4)]
        }
    }
    # collar + shaft
    foreach ($x in 6..9) { Set-Px $c $x 8 $Metal[(Get-SpanTone $x 6 9)] }
    foreach ($y in 9..14) {
        foreach ($x in 7..8) {
            $tone = Get-SpanTone $x 7 8
            if ($y -eq 12) { $tone = Get-ClampInt ($tone + 2) 0 4 }
            Set-Px $c $x $y $Metal[$tone]
        }
    }
    # bit: C-shaped, two teeth (rows 10-11 and 13-14) joined by the shaft side (row 12)
    $bitRows = @(@(10, 9, 13), @(11, 9, 13), @(12, 9, 10), @(13, 9, 13), @(14, 9, 13))
    if ($Kind -eq 'flat') {
        $layer = @{ 10 = (Hex '9BE35F'); 11 = (Hex '5FB83A'); 12 = (Hex '90623A'); 13 = (Hex '6E4929'); 14 = (Hex 'A3A7AE') }
        $rim = 1.12
    } else {
        $layer = @{ 10 = (Hex '3C2E78'); 11 = (Hex '2A2056'); 12 = (Hex '231A48'); 13 = (Hex '1C143A'); 14 = (Hex '160F2E') }
        $rim = 1.45
    }
    foreach ($row in $bitRows) {
        for ($x = $row[1]; $x -le $row[2]; $x++) {
            $col = $layer[$row[0]]
            if ($x -eq $row[1] -and $row[0] -ne 12) { $col = Shade $col $rim }
            if ($x -eq $row[2]) { $col = Shade $col 0.78 }
            Set-Px $c $x $row[0] $col
        }
    }
    if ($Kind -eq 'flat') {
        Set-Px $c 11 13 (Hex '8A5E36'); Set-Px $c 12 14 (Hex '7C8088'); Set-Px $c 10 14 (Hex '8E929A')
        Set-Px $c 12 10 (Hex 'B8F27E')
    } else {
        Set-Px $c 11 10 (Hex 'FFFFFF'); Set-Px $c 13 11 (Hex 'A6F0FF'); Set-Px $c 10 12 (Hex 'D6A8FF')
        Set-Px $c 12 13 (Hex 'FFFFFF'); Set-Px $c 9 14 (Hex 'A6F0FF'); Set-Px $c 13 14 (Hex 'D6A8FF')
    }
    # the bow hole is shielded from the outline pass
    $marker = Hex 'FF00FF'
    foreach ($y in 3..5) { foreach ($x in 5..10) { Set-Px $c $x $y $marker } }
    Add-Outline $c
    foreach ($y in 3..5) { foreach ($x in 5..10) { Set-Px $c $x $y 0 } }
    return $c
}

# ============================================================================================
#  BUILD
# ============================================================================================
if (Test-Want 'drill') {
    $frames = @(); $emis = @()
    for ($t = 0; $t -lt 8; $t++) { $f = New-DrillFrame $true $t; $frames += $f.Color; $emis += $f.Emi }
    $idle = New-DrillFrame $false 0
    Out-Tex $idle.Color 'block/multiblock/steam_vein_drill/overlay_front.png'
    Out-Tex (Join-Frames $frames) 'block/multiblock/steam_vein_drill/overlay_front_active.png' 3
    Out-Tex (Join-Frames $emis) 'block/multiblock/steam_vein_drill/overlay_front_active_emissive.png' 3
}
if (Test-Want 'greenhouse') {
    $frames = @(); $emis = @()
    for ($t = 0; $t -lt 8; $t++) { $f = New-GreenhouseFrame $true $t; $frames += $f.Color; $emis += $f.Emi }
    $idle = New-GreenhouseFrame $false 0
    Out-Tex $idle.Color 'block/multiblock/steam_greenhouse/overlay_front.png'
    Out-Tex (Join-Frames $frames) 'block/multiblock/steam_greenhouse/overlay_front_active.png' 4
    Out-Tex (Join-Frames $emis) 'block/multiblock/steam_greenhouse/overlay_front_active_emissive.png' 4
}
if (Test-Want 'bits') {
    Out-Tex (New-DrillBit $RampBronze 5.5 10.0 2.0 0.78 (Hex '86481A') (Hex '3A1C08')) 'item/bronze_drill_bit.png'
    Out-Tex (New-DrillBit $RampSteel 6.0 12.0 3.0 0.80 (Hex '55627C') (Hex '232B40')) 'item/steel_drill_bit.png'
}
if (Test-Want 'probe') { Out-Tex (New-ProbeBody $true) 'item/empty_vein_probe.png' }
if (Test-Want 'sample') {
    Out-Tex (New-ProbeBody $false) 'item/vein_sample_frame.png'
    Out-Tex (New-VeinCore) 'item/vein_sample_core.png'
}
if (Test-Want 'keys') {
    Out-Tex (New-Key $VoidMetal 'void') 'item/void_key.png'
    Out-Tex (New-Key $FlatMetal 'flat') 'item/flat_key.png'
}

# ============================================================================================
#  VERIFY what was written (size, binary alpha, no pure black, grayscale core, mcmeta vs frames)
# ============================================================================================
$problems = 0
foreach ($rel in $written) {
    if ($rel.EndsWith('.mcmeta')) { continue }
    $path = Join-Path $OutRoot ($rel -replace '/', '\')
    $img = Read-Png $path
    $msgs = @()
    if ($img.W -ne 16 -or ($img.H % 16) -ne 0) { $msgs += "bad size $($img.W)x$($img.H)" }
    $opaque = 0; $black = 0; $gray = $true
    foreach ($px in $img.P) {
        $alpha = ($px -shr 24) -band 255
        if ($alpha -ne 0 -and $alpha -ne 255) { $msgs += 'partial alpha'; break }
        if ($alpha -eq 255) {
            $opaque++
            $q = Get-Rgba $px
            if ($q[0] -eq 0 -and $q[1] -eq 0 -and $q[2] -eq 0) { $black++ }
            if ($q[0] -ne $q[1] -or $q[1] -ne $q[2]) { $gray = $false }
        }
    }
    if ($opaque -eq 0) { $msgs += 'fully transparent' }
    if ($black -gt 0) { $msgs += "$black pure-black px" }
    if ($rel -like '*vein_sample_core.png' -and -not $gray) { $msgs += 'core is not grayscale' }
    if (Test-Path -LiteralPath ($path + '.mcmeta')) {
        $n = [int]($img.H / 16)
        if ($n -lt 4 -or $n -gt 8) { $msgs += "animation has $n frames (expected 4-8)" }
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
        Write-Host ("| ``pack/kubejs/assets/grindless/textures/$rel`` | Generated with tools/assets/$ScriptName (procedural pixel art, original) by the assets agent, 2026-10-24 | the pack's own (pending; proposed CC BY-SA 4.0) |")
    }
}
