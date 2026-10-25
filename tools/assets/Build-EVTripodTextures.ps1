<#
.SYNOPSIS
  Procedural 16x16 pixel art for the EV Tripod Drill of Gregtech Grindless (GregTech style: bevels, top-left light, selective
  outlines).

.DESCRIPTION
  Every pixel is drawn by this script (palettes + char maps + small shading routines); nothing is copied or edited from
  GregTech Modern, GCYR or any other mod. Output is deterministic: re-running overwrites the same bytes. The helpers below are
  copies of the ones in Build-MoonTextures.ps1 (that script stays untouched).

  Writes (under pack/kubejs/assets/grindless/textures/):
    block/multiblock/ev_tripod/overlay_front.png, overlay_front_active.png(+.mcmeta), overlay_front_active_emissive.png(+.mcmeta)
    block/ev_tripod/wing_cells.png         top of grindless:solar_wing_panel (silicon cells, tiles into one wing)
    block/ev_tripod/wing_frame.png         its titanium frame (edges and underside; the edges show rows 6 to 8)

  Run from the repo root (PowerShell 5.1 blocks unsigned scripts by default; this bypass only affects that process):
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-EVTripodTextures.ps1
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-EVTripodTextures.ps1 -Only drill

  Overlay conventions (same as GregTech Modern's workable casings and as the other sets): transparent background, details only
  on the overlay, animated variants are vertical 16x(16*n) strips with a .png.mcmeta, *_emissive layers hold only the pixels
  that glow (identical to the colour layer). Every pixel is fully opaque or fully transparent. The outer 1 px ring of an overlay
  is always left empty so the casing shows around the face.

  The tripod (gtceu:ev_vein_drill, startup_scripts/grindless/ev/tripod.js) uses GTM's stable titanium casing
  (gtceu:block/casings/solid/machine_casing_stable_titanium); the face has its own dark sky and bezel, so it reads on any casing.

.PARAMETER Only
  Subset of: drill, wing. Default: everything.
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
    $dir = Split-Path -Parent $path
    if (-not (Test-Path -LiteralPath $dir)) { New-Item -ItemType Directory -Path $dir | Out-Null }
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

# An emissive pixel only counts while the colour layer still shows it: drops the ones a later draw covered.
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

# Neutral steel ramp of every overlay bezel (lit -> dark), the same one as the other sets.
$SteelSpec = 'A=D3D3D3 B=B0B0B0 C=8E8E8E D=707070 E=565656 F=404040 G=2F2F2F H=222222 I=161616 J=0D0D0D'
# Titanium, a cool grey with a lilac cast (GTM's stable titanium casing), lit -> dark.
$TitaniumSpec = '0=F4EFF8 1=D8CDE2 2=B7A9C6 3=968AA7 4=74698A 5=544B69 6=37304A'
# EV tier violet, lit -> dark: the power the wings feed in.
$VioletSpec = 'a=F4DEFF b=D79BFF c=B062F2 d=8337C4 e=5A1F8C'
# Liquid nitrogen frost and boil-off, lit -> dark.
$FrostSpec = 'f=F4FFFF g=C2F5FF h=82DDF5 i=41A9D6 j=1F6E9C'
# Silicon cells of the wings.
$CellSpec = 'm=B4D4FF n=4F7FDC o=2A4D9E p=17306E'

# ============================================================================================
#  EV TRIPOD DRILL - controller face
#  the tripod on the Moon, as the multiblock is built (ev/tripod.js): a titanium body raised high with an EV violet band, two
#  blue solar wings off its top corners, a short mast with the state beacon, two splayed front legs on sintered brick footpads
#  (the back leg hides behind the drill string) and the string going down into a brick collar in grey regolith. While it
#  works the string turns, liquid nitrogen boils off around the hole in white puffs and the cooled cutter glows cold cyan
#  (the Lunar Drill's glowed hot orange: this one drills cooled). Black sky with stars, the Earth and a red dot: Mars, the
#  tripod's next site. Rounded bezel, like the Lunar Drill: the drills that leave the Earth.
# ============================================================================================
$TripodPal = New-Pal ($SteelSpec + ' ' + $TitaniumSpec + ' ' + $VioletSpec + ' ' + $FrostSpec + ' ' + $CellSpec + ' ' + @'
q=0B0E17
s=E8F6FF t=5AA0F0 u=2A5CB0 v=8A94A8 w=F4F8FF l=E0643A
x=CFCFC6 y=ABABA3 z=8A8A83 T=6B6B65 U=4E4E49 V=34342F W=2A2924 X=7C786A
K=B89C7C L=917759 N=6B5640
Y=62FF86 Z=22C257 r=FF5A48 k=B52D22
'@)

$TripodBase = @(
    '................',
    '..CDDDDDDDDDDE..',
    '.CqqqqqqqqqqqqE.',
    '.DqqqqqqqqqqqqF.',
    '.DqqqqqqqqqqqqF.',
    '.DqqqqqqqqqqqqF.',
    '.DqqqqqqqqqqqqF.',
    '.DqqqqqqqqqqqqF.',
    '.DqqqqqqqqqqqqF.',
    '.DqqqqqqqqqqqqF.',
    '.DqqqqqqqqqqqqF.',
    '.DqqqqqqqqqqqqF.',
    '.DyyyyyyyyyyyyF.',
    '.EzzzzzzzzzzzzG.',
    '..EFFFFFFFFFFG..',
    '................'
)
Assert-Map 'TripodBase' $TripodBase

$TiRamp = @('0', '1', '2', '3', '4', '5', '6')
# Liquid nitrogen boil-off: white puffs that rise and spread from the hole, 4 steps each side.
$PuffL = @(@(6, 11), @(6, 10), @(5, 10), @(6, 9))
$PuffR = @(@(9, 11), @(9, 10), @(10, 10), @(9, 9))

function New-TripodFrame {
    param([bool]$Active, [int]$T = 0)
    $c = New-Canvas; $e = New-Canvas
    $P = $TripodPal
    Write-Map $c 0 0 $TripodBase $P

    # sky: the Earth (top right, lit from the top-left), Mars (the red dot) and a few stars, clear of the wings and the mast
    Set-Px $c 11 2 $P['s']; Set-Px $c 12 2 $P['t']; Set-Px $c 11 3 $P['t']; Set-Px $c 12 3 $P['u']
    Set-Px $c 3 2 $P['l']
    $stars = @(@(5, 2, 'w'), @(10, 3, 'v'), @(2, 3, 'v'), @(13, 7, 'v'))
    for ($k = 0; $k -lt $stars.Count; $k++) {
        $s = $stars[$k]; $col = $s[2]
        if ($Active -and ((($T + 2 * $k) % 8) -eq 0)) { $col = if ($col -eq 'v') { 'w' } else { 'v' } }
        Set-Px $c $s[0] $s[1] $P[$col]
    }

    # regolith: lit surface row (y12) and a darker row (y13), grainy; the tripod's shadow falls to the bottom-right
    for ($x = 2; $x -le 13; $x++) {
        $n = Get-Noise $x 12 0 41
        $top = if ($n -lt 90) { 'x' } elseif ($n -lt 200) { 'y' } else { 'z' }
        if ($x -ge 10 -and $x -le 11) { $top = if ($n -lt 120) { 'z' } else { 'T' } }
        Set-Px $c $x 12 $P[$top]
        $n2 = Get-Noise $x 13 0 42
        $bot = if ($n2 -lt 110) { 'z' } elseif ($n2 -lt 210) { 'T' } else { 'U' }
        Set-Px $c $x 13 $P[$bot]
    }
    Set-Px $c 4 13 $P['W']; Set-Px $c 5 13 $P['X']

    # sintered brick footpads under the front legs and the collar around the drill string
    Set-Px $c 2 12 $P['K']; Set-Px $c 3 12 $P['L']
    Set-Px $c 12 12 $P['L']; Set-Px $c 13 12 $P['N']
    Set-Px $c 5 12 $P['K']; Set-Px $c 6 12 $P['L']; Set-Px $c 9 12 $P['L']; Set-Px $c 10 12 $P['N']

    # front legs (titanium): splayed from the body's bottom corners to their feet, the lit left one and the shaded right one
    Set-Px $c 5 8 $P['1']; Set-Px $c 4 9 $P['2']; Set-Px $c 3 10 $P['2']
    Set-Px $c 2 11 $P['1']; Set-Px $c 3 11 $P['3']
    Set-Px $c 10 8 $P['4']; Set-Px $c 11 9 $P['4']; Set-Px $c 12 10 $P['5']
    Set-Px $c 12 11 $P['3']; Set-Px $c 13 11 $P['5']

    # the raised body (x5..10, y4..7): titanium, rounded by the span shading, lit on top, with the EV violet band (y6)
    for ($y = 4; $y -le 7; $y++) { for ($x = 5; $x -le 10; $x++) {
        $tone = (Get-SpanTone $x 5 10) + 1
        if ($y -eq 4) { $tone -= 1 } elseif ($y -eq 7) { $tone += 1 }
        $n = Get-Noise $x $y 0 43
        if ($n -lt 40) { $tone -= 1 } elseif ($n -gt 225) { $tone += 1 }
        Set-Px $c $x $y $P[$TiRamp[(Get-ClampInt $tone 0 6)]]
    } }
    for ($x = 5; $x -le 10; $x++) {
        $band = if ($x -le 6) { 'b' } elseif ($x -le 8) { 'c' } else { 'd' }
        Set-Px $c $x 6 $P[$band]
    }

    # solar wings off the top corners of the body (x2..4 and x11..13, y4..5): lit bevel on the top-left, cells darkening away
    $wing = @('nnn', 'oop')
    for ($j = 0; $j -lt 2; $j++) { for ($i = 0; $i -lt 3; $i++) {
        Set-Px $c (2 + $i) (4 + $j) $P[[string]$wing[$j][$i]]
        Set-Px $c (11 + $i) (4 + $j) (Shade $P[[string]$wing[$j][$i]] 0.82)
    } }

    # short mast on the body (x7..8, y3) with the state beacon on top (y2)
    Set-Px $c 7 3 $P['1']; Set-Px $c 8 3 $P['3']
    if ($Active) {
        $core = if (($T % 4) -lt 2) { 'Y' } else { 'Z' }
        Set-Both $c $e 7 2 $P[$core]; Set-Both $c $e 8 2 $P['Z']
    } else { Set-Px $c 7 2 $P['r']; Set-Px $c 8 2 $P['k'] }

    # drill string (x7..8): turning bands while it works; raised with the cutter above the hole while idle
    $bottom = if ($Active) { 11 } else { 10 }
    for ($y = 8; $y -le $bottom; $y++) {
        $lit = (($y + $T) % 2) -eq 0
        Set-Px $c 7 $y $P[$(if ($lit) { '1' } else { '2' })]
        Set-Px $c 8 $y $P[$(if ($lit) { '3' } else { '4' })]
    }
    if ($Active) {
        # the cooled cutter in the hole glows cold; liquid nitrogen boils off in white puffs that rise and spread
        Set-Both $c $e 7 12 $P[$(if (($T % 2) -eq 0) { 'g' } else { 'h' })]
        Set-Both $c $e 8 12 $P[$(if (($T % 2) -eq 0) { 'h' } else { 'i' })]
        $tones = @('f', 'f', 'g', 'h')
        $pl = $PuffL[$T % 4]; Set-Px $c $pl[0] $pl[1] $P[$tones[$T % 4]]
        $pr = $PuffR[($T + 2) % 4]; Set-Px $c $pr[0] $pr[1] $P[$tones[($T + 2) % 4]]
        # the wings feed the body (emissive violet), one side at a time; a glint runs over the cells
        if (($T % 4) -lt 2) { Set-Both $c $e 5 5 $P['a'] } else { Set-Both $c $e 10 5 $P['b'] }
        $gl = $T % 4
        Set-Px $c (2 + [Math]::Min($gl, 2)) (4 + [Math]::Max(0, $gl - 2)) $P['m']
        Set-Px $c (11 + [Math]::Min($gl, 2)) (4 + [Math]::Max(0, $gl - 2)) (Shade $P['m'] 0.9)
    } else {
        Set-Px $c 7 11 $P['1']; Set-Px $c 8 11 $P['3']
        Set-Px $c 7 12 $P['V']; Set-Px $c 8 12 $P['W']
    }
    Sync-Emissive $c $e
    return @{ Color = $c; Emi = $e }
}

# ============================================================================================
#  SOLAR WING PANEL - grindless:solar_wing_panel
#  top: 2x2 silicon cells of 7x7 px with a 1 px titanium busbar gap after each (x/y 7 and 15), so nine panels tile into one
#  wing with a regular grid; each cell lit on its top-left edge, a soft sheen and a few darker crystal grains.
#  frame: brushed titanium with a darker rim; the panel's edges show its rows 6 to 8 (the model's plate is 3 px thick).
# ============================================================================================
$WingPal = New-Pal ($TitaniumSpec + ' ' + $CellSpec + ' k=0E1D44')

function New-WingCells {
    $c = New-Canvas
    $P = $WingPal
    for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
        $gx = ($x % 8) -eq 7; $gy = ($y % 8) -eq 7
        if ($gx -or $gy) {
            $tone = if ($gx -and $gy) { '4' } elseif ($gy) { '2' } else { '3' }
            Set-Px $c $x $y $P[$tone]
            continue
        }
        $cx = $x % 8; $cy = $y % 8
        $n = Get-Noise $x $y 0 51
        $col = 'o'
        if ($cx -eq 0 -or $cy -eq 0) { $col = 'n' }
        elseif ($cx + $cy -eq 6 -or $cx + $cy -eq 7) { $col = 'n' }
        elseif ($cx -ge 5 -and $cy -ge 5) { $col = 'p' }
        if ($n -gt 236) { $col = 'k' } elseif ($n -lt 10 -and $col -eq 'o') { $col = 'p' }
        Set-Px $c $x $y $P[$col]
    } }
    return $c
}

function New-WingFrame {
    $c = New-Canvas
    $P = $WingPal
    for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
        # brushed: the grain runs along x, a tone per row with a little noise
        $n = Get-Noise ([int]($x / 4)) $y 0 61
        $tone = if ($n -lt 70) { 1 } elseif ($n -lt 200) { 2 } else { 3 }
        if ($x -eq 0 -or $y -eq 0) { $tone = 1 }
        if ($x -eq 15 -or $y -eq 15) { $tone = 4 }
        # the edge band the panel's sides show (rows 6..8): lit top, dark bottom
        if ($y -eq 6) { $tone = [Math]::Min($tone, 1) } elseif ($y -eq 8) { $tone = [Math]::Max($tone, 4) }
        Set-Px $c $x $y $P[[string]$tone]
    } }
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

if (Test-Want 'drill') { Out-Overlay 'block/multiblock/ev_tripod' ${function:New-TripodFrame} 2 }
if (Test-Want 'wing') {
    Out-Tex (New-WingCells) 'block/ev_tripod/wing_cells.png'
    Out-Tex (New-WingFrame) 'block/ev_tripod/wing_frame.png'
}

# ============================================================================================
#  VERIFY what was written (size, binary alpha, no pure black, mcmeta vs frames, empty casing ring on the overlays, emissive
#  subset, animation that really animates, opaque block textures)
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
    if ($rel -like 'block/multiblock/*') {
        # overlays keep the casing's outer 1 px ring visible
        $nf = [int]($img.H / 16)
        for ($f = 0; $f -lt $nf; $f++) { for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
            if ($x -lt 1 -or $y -lt 1 -or $x -ge 15 -or $y -ge 15) {
                if ((($img.P[($f * 16 + $y) * 16 + $x] -shr 24) -band 255) -ne 0) { $msgs += "opaque pixel in the casing ring (frame $f, $x,$y)"; $f = $nf; $y = 16; break }
            }
        } } }
    } elseif ($opaque -ne $img.P.Length) {
        # a block texture of its own is fully opaque
        $msgs += "$($img.P.Length - $opaque) transparent px in a block texture"
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
        Write-Host ("| ``pack/kubejs/assets/grindless/textures/$rel`` | Generated with tools/assets/$ScriptName (procedural pixel art, original) by the ev-tripod agent, 2026-10-25 | the pack's own (pending; proposed CC BY-SA 4.0) |")
    }
}
if ($problems -gt 0) { exit 1 }
