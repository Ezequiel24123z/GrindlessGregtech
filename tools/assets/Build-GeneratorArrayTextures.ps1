<#
.SYNOPSIS
  Procedural 16x16 pixel art for the LV Generator Array of Gregtech Grindless (GregTech style: bevels, top-left light, every
  pixel fully opaque or fully transparent).

.DESCRIPTION
  Every pixel is drawn by this script (palettes + char maps + small routines); nothing is copied or edited from GregTech Modern,
  GregTech Leisure or any other mod. The multiblock is an idea from GregTech Leisure (docs/research/leisure.md, idea only: no code
  or textures). Output is deterministic: re-running overwrites the same bytes. Same method, neutral steel ramp, LV panel and checks
  as the other LV faces (Build-LVTextures.ps1, Build-LVRoasterHeliostatTextures.ps1; the helpers are copied so those scripts stay
  untouched).

  Writes (under pack/kubejs/assets/grindless/textures/):
    block/multiblock/generator_array/overlay_front.png, overlay_front_active.png(+.mcmeta), overlay_front_active_emissive.png(+.mcmeta)

  The face is the LV controller panel with the generator hall behind its window: two stacks of copper-wound generator units (two
  units per stack, a steel end bell on top and a flange between them) on either side of a lightning bolt, all of them standing on a
  copper bus bar that leaves through the right wall. The base strip carries one LED per unit and the status lamp. 8 frames,
  frametime 3: the units fire one after another, clockwise around the bolt (the firing unit's winding glows, throws a spark at the
  bolt and lights its LED), a charge runs down the bolt and strikes the bus, beads of power run along the bus towards the wall and
  a glint turns over the windings. Idle: dull bolt, dark LEDs and the red lamp.

  Run from the repo root (PowerShell 5.1 blocks unsigned scripts by default; this bypass only affects that process):
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-GeneratorArrayTextures.ps1
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-GeneratorArrayTextures.ps1 -Preview C:\path\generator_array.png -Casing C:\path\machine_casing_solid_steel.png
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-GeneratorArrayTextures.ps1 -Credits

  Overlay conventions (GTM's workable casings, as every other set): transparent background, details only on the overlay, animated
  variants are vertical 16x(16*n) strips with a .png.mcmeta, *_emissive layers hold only the pixels that glow (identical to the colour
  layer). The outer 1 px ring is always left empty so the casing shows around the face.
  Drawn for gtceu:block/casings/solid/machine_casing_solid_steel (the controller's workableCasingModel).

.PARAMETER OutRoot
  Textures root. Default: <repo>/pack/kubejs/assets/grindless/textures
.PARAMETER Preview
  Also write a review sheet (nearest neighbour, x6) to this PNG: the face on the casing (idle, every active frame with its emissive
  layer, a dark-room view) and the controller in a 3x3 wall of casing, idle and working. Preview only: never shipped.
.PARAMETER Casing
  Optional 16x16 PNG used as the casing in the preview (for example GTM's machine_casing_solid_steel.png extracted from the jar and
  kept outside the repo). Without it, a plain steel plate drawn by code is used.
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

if (-not $OutRoot) { $OutRoot = Join-Path $PSScriptRoot '..\..\pack\kubejs\assets\grindless\textures' }
$OutRoot = [System.IO.Path]::GetFullPath($OutRoot)
$ScriptName = Split-Path -Leaf $PSCommandPath

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

# An emissive pixel only counts while the colour layer still shows it: drops the ones a later draw covered.
function Sync-Emissive {
    param($C, $E)
    $dropped = 0
    for ($i = 0; $i -lt $E.P.Length; $i++) { if ($E.P[$i] -ne 0 -and $E.P[$i] -ne $C.P[$i]) { $E.P[$i] = 0; $dropped++ } }
    if ($dropped -gt 0) { Write-Verbose "Sync-Emissive: $dropped emissive pixel(s) covered by a later draw" }
}

# Neutral steel ramp shared by every LV overlay (same letters and values as Build-LVTextures.ps1: lit -> dark).
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
#  GENERATOR ARRAY - controller face (solid steel casing)
#  two stacks of generator units (x3..4 and x11..12, y3..10) around a lightning bolt (x6..9, y3..10), a copper bus bar on the
#  floor of the window (y11) that leaves through the right wall, and on the base strip one LED per unit plus the status lamp
# ============================================================================================
# Q..T copper windings (lit -> darkest), p glint; a..d the live bolt (charge, lit edge, core, shade); k..m the bolt at rest;
# n/o an energised winding, e an unlit unit LED, v the spark; h/i the green lamp, s/t the red one.
$GaPal = New-Pal ($SteelSpec + ' ' + @'
Q=E98B3C R=B25F24 S=6E3716 T=4A2410 p=FFE6C0
a=FFFBE6 b=FFF1A8 c=FFD83A d=E0A010
k=8C7A3A l=6E6040 m=4F4528
n=FFC24A o=E8901E e=5E4310
v=E8F8FF
h=62FF86 i=22C257 s=B52D22 t=5E1511
'@)

# One stack: a steel end bell, the upper unit (winding, slot, winding), the flange between the units and the lower unit; it stands
# on the bus bar. Lit column on the left, as everything else.
$GaStack = @(
    'BE',
    'QS',
    'ST',
    'QS',
    'CF',
    'QS',
    'ST',
    'QS'
)
$GaStackX = @(3, 11)

# The bolt (drawn from x6, y3): 0 lit edge, 1 core, 2 shade; its tip (x6, y10) strikes the bus bar.
$GaBolt = @(
    '..01',
    '.012',
    '012.',
    '0112',
    '.012',
    '.12.',
    '02..',
    '2...'
)
$GaBoltLive = @('b', 'c', 'd')
$GaBoltRest = @('k', 'l', 'm')

# The four units in firing order, clockwise around the bolt: [stack x, slot row, gap column the spark jumps across].
$GaUnits = @(@(3, 5, 5), @(11, 5, 10), @(11, 9, 10), @(3, 9, 5))

function New-GeneratorArrayFrame {
    param([bool]$Active, [int]$T = 0)
    $c = New-Canvas; $e = New-Canvas
    $P = $GaPal
    Write-Map $c 0 0 $PanelBase $P

    # ---- the two stacks of generator units
    foreach ($x0 in $GaStackX) { Write-Map $c $x0 3 $GaStack $P }

    # ---- copper bus bar along the floor of the window (y11), into the right wall (x13)
    foreach ($x in 3..13) { Set-Px $c $x 11 $P[$(if ($x -eq 3) { 'Q' } elseif ($x -eq 13) { 'S' } else { 'R' })] }

    # ---- the bolt: dull at rest; live, with a charge running down it, while the array works
    for ($j = 0; $j -lt $GaBolt.Count; $j++) {
        for ($i = 0; $i -lt 4; $i++) {
            $ch = [string]$GaBolt[$j][$i]
            if ($ch -eq '.') { continue }
            $tone = [int]$ch
            if ($Active) {
                $col = $GaBoltLive[$tone]
                if ($j -eq ($T % 8) -and $tone -lt 2) { $col = 'a' }
                Set-Both $c $e (6 + $i) (3 + $j) $P[$col]
            } else { Set-Px $c (6 + $i) (3 + $j) $P[$GaBoltRest[$tone]] }
        }
    }

    $firing = [int][Math]::Floor($T / 2) % 4
    if ($Active) {
        # the firing unit: its slot glows and, on the first of its two frames, a spark jumps the gap towards the bolt
        $u = $GaUnits[$firing]
        Set-Both $c $e $u[0] $u[1] $P['n']; Set-Both $c $e ($u[0] + 1) $u[1] $P['o']
        if (($T % 2) -eq 0) { Set-Both $c $e $u[2] $u[1] $P['v'] }
        # a glint turns with the rotors: up the left stack, down the right one
        Set-Px $c 3 (@(10, 8, 6, 4)[$T % 4]) $P['p']
        Set-Px $c 11 (@(4, 6, 8, 10)[$T % 4]) $P['p']
        # beads of power run along the bus towards the wall; the bolt's charge flashes where it strikes
        for ($k = 0; $k -lt 3; $k++) {
            $bx = 3 + ($T % 4) + 4 * $k
            if ($bx -le 12) { Set-Both $c $e $bx 11 $P['o'] }
        }
        if (($T % 8) -eq 7) { Set-Both $c $e 6 11 $P['a'] }
    }

    # ---- base strip (y13): one LED per unit between dark sockets (x4, 6, 8, 10) and the status lamp (x11..12)
    foreach ($x in 3, 5, 7, 9) { Set-Px $c $x 13 $P['I'] }
    for ($k = 0; $k -lt 4; $k++) {
        $lx = 4 + 2 * $k
        if ($Active) { Set-Both $c $e $lx 13 $P[$(if ($k -eq $firing) { 'b' } else { 'd' })] } else { Set-Px $c $lx 13 $P['e'] }
    }
    if ($Active) { Set-Both $c $e 12 13 $P['h']; Set-Px $c 11 13 $P['i'] } else { Set-Px $c 12 13 $P['s']; Set-Px $c 11 13 $P['t'] }

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

Out-Overlay 'block/multiblock/generator_array' ${function:New-GeneratorArrayFrame} 3

# ============================================================================================
#  VERIFY what was written (size, binary alpha, no pure black, mcmeta vs frames, empty casing ring, emissive subset,
#  animation that really animates) - the checks of the MV and HV sets
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
    $nf = [int]($img.H / 16)
    for ($f = 0; $f -lt $nf; $f++) { for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
        if ($x -lt 1 -or $y -lt 1 -or $x -ge 15 -or $y -ge 15) {
            if ((($img.P[($f * 16 + $y) * 16 + $x] -shr 24) -band 255) -ne 0) { $msgs += "opaque pixel in the casing ring (frame $f, $x,$y)"; $f = $nf; $y = 16; break }
        }
    } } }
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
    # a plain bevelled steel plate standing in for the solid steel casing when no -Casing is given
    function New-StandInSteel {
        $c = New-Canvas 16 16
        $pal = New-Palette 'a=8C8882 b=7C7872 c=6E6A64 d=5A5650 e=46423D f=36332F'
        for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
            $ch = 'b'
            if ($x -eq 0 -or $y -eq 0) { $ch = 'a' } elseif ($x -eq 15 -or $y -eq 15) { $ch = 'e' }
            elseif ($y -eq 3 -or $y -eq 12) { $ch = 'f' } elseif ($x -ge 3 -and $x -le 12 -and $y -ge 4 -and $y -le 11) { $ch = $(if (($x % 4) -eq 3) { 'e' } else { 'd' }) }
            elseif ($y -le 2) { $ch = 'c' }
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
    $casingTex = if ($Casing) { Read-Png ([System.IO.Path]::GetFullPath($Casing)) } else { New-StandInSteel }
    $dir = Join-Path $OutRoot 'block\multiblock\generator_array'
    $idle = Read-Png (Join-Path $dir 'overlay_front.png')
    $act = Read-Png (Join-Path $dir 'overlay_front_active.png')
    $emi = Read-Png (Join-Path $dir 'overlay_front_active_emissive.png')
    $tiles = New-Object System.Collections.Generic.List[object]
    $tiles.Add((Merge-On $casingTex $idle))
    for ($f = 0; $f -lt 8; $f++) { $tiles.Add((Merge-On (Merge-On $casingTex (Get-Frame $act $f)) (Get-Frame $emi $f))) }
    $tiles.Add((Get-Dark $casingTex (Get-Frame $act 0) (Get-Frame $emi 0)))

    # 1x sheet: the tiles in a row, and under them the controller in a 3x3 wall of casing, idle and working
    $gap = 2
    $sw = $gap + $tiles.Count * (16 + $gap); $sh = $gap + 16 + $gap + 48 + $gap
    $sheet = New-Canvas $sw $sh
    for ($i = 0; $i -lt $sheet.P.Length; $i++) { $sheet.P[$i] = Hex '202428' }
    function Put-Tile { param($Tile, [int]$X0, [int]$Y0) for ($y = 0; $y -lt 16; $y++) { [Array]::Copy($Tile.P, $y * 16, $sheet.P, ($Y0 + $y) * $sw + $X0, 16) } }
    for ($t = 0; $t -lt $tiles.Count; $t++) { Put-Tile $tiles[$t] ($gap + $t * (16 + $gap)) $gap }
    $wy = $gap + 16 + $gap
    $k = 0
    foreach ($center in @($tiles[0], $tiles[1])) {
        $wx = $gap + $k * (48 + 2 * $gap)
        for ($j = 0; $j -lt 3; $j++) { for ($i = 0; $i -lt 3; $i++) {
            $tile = if ($i -eq 1 -and $j -eq 1) { $center } else { $casingTex }
            Put-Tile $tile ($wx + 16 * $i) ($wy + 16 * $j)
        } }
        $k++
    }
    # nearest-neighbour upscale, one scaled row at a time
    $scale = 6
    $big = New-Canvas ($sw * $scale) ($sh * $scale)
    $row = New-Object 'int[]' ($sw * $scale)
    for ($y = 0; $y -lt $sh; $y++) {
        for ($x = 0; $x -lt $sw; $x++) { $v = $sheet.P[$y * $sw + $x]; for ($s = 0; $s -lt $scale; $s++) { $row[$x * $scale + $s] = $v } }
        for ($s = 0; $s -lt $scale; $s++) { [Array]::Copy($row, 0, $big.P, ($y * $scale + $s) * $big.W, $big.W) }
    }
    Save-Png $big ([System.IO.Path]::GetFullPath($Preview))
    Write-Host "preview: $Preview (idle, 8 active frames with emissive, dark room, then a 3x3 wall idle and working)"
}

if ($Credits) {
    Write-Host ''
    foreach ($rel in $written) {
        Write-Host ("| ``pack/kubejs/assets/grindless/textures/$rel`` | Generated with tools/assets/$ScriptName (procedural pixel art, original) by the generator array agent, 2026-10-25 | the pack's licence (pending; proposed CC BY-SA 4.0) |")
    }
}
if ($problems -gt 0) { exit 1 }
