<#
.SYNOPSIS
  Procedural 16x16 pixel art for the HV Syngas and Shift Plant of Gregtech Grindless (GregTech style: bevels, top-left light,
  selective outlines).

.DESCRIPTION
  Every pixel is drawn by this script (palettes + char maps + small shading routines); nothing is copied or edited from GregTech
  Modern or any other mod. Output is deterministic: re-running overwrites the same bytes. Same method, ramps and checks as
  Build-HVTextures.ps1 (whose helpers are copied here so that script stays untouched): neutral steel bezel, HV orange accents,
  clean stainless steel for the vessels.

  Writes (under pack/kubejs/assets/grindless/textures/):
    block/multiblock/syngas_plant/overlay_front.png, overlay_front_active.png(+.mcmeta), overlay_front_active_emissive.png(+.mcmeta)
    item/shift_catalyst.png

  The face shows the plant as the multiblock builds it, left to right: the gasifier (a refractory-lined vessel with a coal bed burning
  behind its window and a band of Kanthal coils), the two shift drums of iron-chromium catalyst held apart by frames, and the tall
  CO2 absorber with a sight glass of amine where the gas bubbles up; a header pipe runs over all three, and the base carries hazard
  stripes, one lamp per gas (CO amber, hydrogen blue, CO2 pale) and the state lamp. 8 frames, frametime 3: the bed flickers, the coil
  band glows, a bead of gas runs along the header, the catalyst shimmers, bubbles rise in the absorber and the lamps blink. Idle:
  embers, cold coils and catalyst, still liquid, red lamp.

  Run from the repo root (PowerShell 5.1 blocks unsigned scripts by default; this bypass only affects that process):
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-SyngasTextures.ps1
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-SyngasTextures.ps1 -Only plant -Preview C:\path\syngas.png

  Overlay conventions (GTM's workable casings, as every other set): transparent background, details only on the overlay, animated
  variants are vertical 16x(16*n) strips with a .png.mcmeta, *_emissive layers hold only the pixels that glow (identical to the colour
  layer). Every pixel is fully opaque or fully transparent. The outer 1 px ring is always left empty so the casing shows around the face.
  Drawn for gtceu:block/casings/solid/machine_casing_clean_stainless_steel (gtceu:clean_machine_casing, hv/syngas_plant.js).

.PARAMETER Only
  Subset of: plant, catalyst. Default: everything.
.PARAMETER OutRoot
  Textures root. Default: <repo>/pack/kubejs/assets/grindless/textures
.PARAMETER Preview
  Also write a review sheet (x8, nearest neighbour) to this PNG: the face on a stand-in clean stainless casing (idle, every active frame
  with its emissive layer, a dark-room view) and the catalyst next to the two HV catalysts. Preview only: never shipped.
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

# Ramps shared with the HV set: neutral steel (lit -> dark), HV orange, clean stainless steel, state lamp.
$SteelSpec = 'A=D3D3D3 B=B0B0B0 C=8E8E8E D=707070 E=565656 F=404040 G=2F2F2F H=222222 I=161616 J=0D0D0D'
$OrangeSpec = 'a=FFF1C8 b=FFC857 c=FF9A1E d=E4600F e=A8340A f=5C1A08 g=2C0E05'
$StainSpec = '0=F7FAFF 1=DCE5F0 2=B8C6D8 3=8E9DB2 4=667690 5=465470 6=2C364C'
$LampSpec = 'M=E2FFE4 N=62FF86 O=22C257 P=0C6B2E Q=FF5A48 R=B52D22 S=5E1511'

# Frame shared with the HV faces: 1 px empty ring, steel bezel, dark window x3..13 y3..12, base strip y13.
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
#  SYNGAS AND SHIFT PLANT - controller face (clean stainless casing)
#  left to right: gasifier (x3..6), shift drums (x7..9), a gap with the bottom pipe (x10), CO2 absorber (x11..13); header on y3
# ============================================================================================
$SynPal = New-Pal ($SteelSpec + ' ' + $OrangeSpec + ' ' + $StainSpec + ' ' + $LampSpec + ' ' + @'
k=9A5A42 l=5E3326
m=B5562E n=7E3518 o=4A1E0C p=7FC27A q=3E6B3A
r=9ED8E8 s=5FA9C2 t=2E6E86 u=E8FBFF
v=FFB347 w=6FD0FF x=E6F2FF
'@)

# Static parts drawn over the window ('.' leaves the window as it is). k/l refractory brick, 0..6 stainless, D/E frames.
$SynBase = @(
    '................',
    '................',
    '................',
    '.....333333324..',
    '...3235....3.5..',
    '...3lk5....3.5..',
    '...3..5....3.5..',
    '...3..5....3.5..',
    '...3..5D4E.3.5..',
    '...3..5....3.5..',
    '...3..5....3.5..',
    '...3..5....3.5..',
    '...6HH6...4566..',
    '................',
    '................',
    '................'
)
Assert-Map 'SynBase' $SynBase

$SynHeat = @('g', 'f', 'e', 'd', 'c', 'b', 'a')   # heat index 0..6, dark -> white-hot
# shift drums: [x, y] of the shell pixels (lit left, shaded right) and of the catalyst window, per drum (upper y4..7, lower y9..12)
$SynDrums = @(@{ Top = 4; Bottom = 7 }, @{ Top = 9; Bottom = 12 })

function New-SyngasFrame {
    param([bool]$Active, [int]$T = 0)
    $c = New-Canvas; $e = New-Canvas
    $P = $SynPal
    Write-Map $c 0 0 $WindowBase $P
    Write-Map $c 0 0 $SynBase $P

    # ---- gasifier: the coal bed behind the window (x4..5, y6..11), hottest at the grate
    foreach ($y in 6..11) { foreach ($x in 4, 5) {
        if ($Active) {
            $hv = 1 + ($y - 6)                           # 1 at the top .. 6 at the grate
            $n = Get-Noise $x $y $T 3
            if ($n -lt 70) { $hv -= 1 } elseif ($n -gt 200) { $hv += 1 }
            if ($y -le 7 -and (Get-Noise $x $y $T 9) -gt 150) { $hv -= 1 }
            Set-Both $c $e $x $y $P[$SynHeat[(Get-ClampInt $hv 0 6)]]
        } else {
            $hv = 0
            if (($x -eq 4 -and $y -eq 11) -or ($x -eq 5 -and $y -eq 10)) { $hv = 2 } elseif ($x -eq 5 -and $y -eq 11) { $hv = 1 }
            Set-Px $c $x $y $P[$SynHeat[$hv]]
        }
    } }
    # the Kanthal coil band through the shell (y8, both walls)
    foreach ($x in 3, 6) {
        if ($Active) { Set-Both $c $e $x 8 $P[$(if ((($T + $x) % 4) -lt 2) { 'b' } else { 'c' })] } else { Set-Px $c $x 8 $P['e'] }
    }
    # ash under the grate
    if ($Active -and (($T % 4) -eq 1)) { Set-Px $c 4 12 $P['D'] }

    # ---- header (y3, x5..10): a bead of gas runs from the gasifier outlet towards the absorber
    if ($Active) {
        $bx = 5 + ($T % 8)
        if ($bx -le 10) { Set-Both $c $e $bx 3 $P['b'] }
    }

    # ---- shift drums (x7..9): shell, iron-chromium catalyst behind a slot (x8), a shimmer of heat when working
    foreach ($d in $SynDrums) {
        $top = $d.Top; $bot = $d.Bottom
        Set-Px $c 7 $top $P['3']; Set-Px $c 8 $top $P['2']; Set-Px $c 9 $top $P['4']
        Set-Px $c 7 $bot $P['4']; Set-Px $c 8 $bot $P['5']; Set-Px $c 9 $bot $P['6']
        foreach ($y in ($top + 1)..($bot - 1)) {
            Set-Px $c 7 $y $P['3']; Set-Px $c 9 $y $P['5']
            $cat = if ((($y + $top) % 3) -eq 0) { 'p' } elseif ((($y + $top) % 3) -eq 1) { 'm' } else { 'n' }
            if ($Active) {
                $warm = ((($T + $y) % 4) -eq 0)
                if ($warm) { Set-Both $c $e 8 $y $P['d'] } else { Set-Px $c 8 $y $P[$cat] }
            } else {
                $cold = if ($cat -eq 'p') { 'q' } else { 'o' }
                Set-Px $c 8 $y $P[$cold]
            }
        }
    }

    # ---- absorber (x11..13): sight glass of amine (x12, y6..11) under a gas space (y4..5); bubbles rise while it works
    foreach ($y in 4, 5) { Set-Px $c 12 $y $P['t'] }
    foreach ($y in 6..11) {
        $liq = if ($y -eq 6) { 'r' } elseif ($y -le 8) { 's' } else { 't' }
        if (-not $Active) { $liq = if ($y -eq 6) { 's' } else { 't' } }
        Set-Px $c 12 $y $P[$liq]
    }
    if ($Active) {
        foreach ($k in 0, 4) {
            $by = 11 - (($T + $k) % 8)
            if ($by -ge 6) { Set-Px $c 12 $by $P['u'] }
        }
        # the scrubbed gas leaves through the top flange
        if (($T % 4) -lt 2) { Set-Px $c 12 3 $P['1'] }
    }

    # ---- base strip (y13): hazard stripes x3..6, a lamp per gas (CO x8, hydrogen x9, CO2 x10), state lamp x12..13
    foreach ($x in 3..6) {
        if (($x % 2) -eq 1) {
            if ($Active) { Set-Both $c $e $x 13 $P['c'] } else { Set-Px $c $x 13 $P['e'] }
        } else { Set-Px $c $x 13 $P['g'] }
    }
    Set-Px $c 7 13 $P['H']; Set-Px $c 11 13 $P['H']
    $gas = @(@(8, 'v'), @(9, 'w'), @(10, 'x'))
    for ($k = 0; $k -lt 3; $k++) {
        $col = $P[[string]$gas[$k][1]]
        if ($Active) {
            $lit = if ((($T + 2 * $k) % 4) -lt 2) { $col } else { Shade $col 0.8 }
            Set-Both $c $e $gas[$k][0] 13 $lit
        } else { Set-Px $c $gas[$k][0] 13 (Shade $col 0.4) }
    }
    if ($Active) {
        $core = if (($T % 4) -lt 2) { 'M' } else { 'N' }
        Set-Both $c $e 12 13 $P[$core]; Set-Both $c $e 13 13 $P['O']
    } else { Set-Px $c 12 13 $P['Q']; Set-Px $c 13 13 $P['R'] }

    Sync-Emissive $c $e
    return @{ Color = $c; Emi = $e }
}

# --- the shift catalyst: a heap of 2x2 pellets in a steel cup (the cup and heap of the HV catalysts, Build-HVTextures.ps1), dark
#     magnetite and rust-red iron oxide with a few green chromium oxide beads, a brick-red band on the cup
$CatSteel = @((Hex 'F2F6FA'), (Hex 'C8D3E0'), (Hex '9AA9BC'), (Hex '6D7D95'), (Hex '48587A'))
$PelMagnetite = @((Hex '8C8A90'), (Hex '5E5B63'), (Hex '3E3B42'), (Hex '26242A'))
$PelRust = @((Hex 'E08A5A'), (Hex 'B85E34'), (Hex '86401E'), (Hex '55260F'))
$PelChromia = @((Hex 'A6E39E'), (Hex '6FB766'), (Hex '468A40'), (Hex '2A5A27'))

function New-ShiftCatalyst {
    $c = New-Canvas
    $band = @((Hex 'F08A6A'), (Hex 'C0472A'), (Hex '6E2212'))
    # cup: rim (y8), band (y9), body (y10..11), foot (y12)
    foreach ($x in 3..12) { Set-Px $c $x 8 $CatSteel[(Get-SpanTone $x 3 12)] }
    foreach ($x in 4..11) {
        $t = Get-SpanTone $x 4 11
        Set-Px $c $x 9 $(if ($t -le 1) { $band[0] } elseif ($t -eq 2) { $band[1] } else { $band[2] })
    }
    foreach ($y in 10..11) { foreach ($x in 4..11) { Set-Px $c $x $y $CatSteel[(Get-ClampInt ((Get-SpanTone $x 4 11) + 1) 0 4)] } }
    foreach ($x in 5..10) { Set-Px $c $x 12 $CatSteel[(Get-ClampInt ((Get-SpanTone $x 5 10) + 2) 0 4)] }
    # heap: 2 + 3 + 4 beads (2x2, lit from the top-left); two of them chromium green
    $balls = @(@(6, 2), @(8, 2), @(5, 4), @(7, 4), @(9, 4), @(4, 6), @(6, 6), @(8, 6), @(10, 6))
    $green = @(1, 6)
    for ($bi = 0; $bi -lt $balls.Count; $bi++) {
        $bx = $balls[$bi][0]; $by = $balls[$bi][1]
        $ramp = if ($green -contains $bi) { $PelChromia } elseif (((Get-Noise $bx $by 0 5) % 3) -eq 0) { $PelRust } else { $PelMagnetite }
        $tones = @(@(0, 0, 0), @(1, 0, 1), @(0, 1, 2), @(1, 1, 3))
        foreach ($q in $tones) { Set-Px $c ($bx + $q[0]) ($by + $q[1]) $ramp[$q[2]] }
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

if (Test-Want 'plant') { Out-Overlay 'block/multiblock/syngas_plant' ${function:New-SyngasFrame} 3 }
if (Test-Want 'catalyst') { Out-Tex (New-ShiftCatalyst) 'item/shift_catalyst.png' }

# ============================================================================================
#  VERIFY what was written (size, binary alpha, no pure black, mcmeta vs frames, empty casing ring, emissive subset,
#  animation that really animates) - the checks of Build-HVTextures.ps1
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
    if ($rel -like 'block/*') {
        $nf = [int]($img.H / 16)
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
    # a bevelled stand-in of the clean stainless casing (the panel of Build-HVPreview.ps1)
    function New-StandInStainless {
        $c = New-Canvas 16 16
        $pal = New-Palette 'a=DDE1E6 b=CFD4DA c=BFC5CC d=6B727B e=98A0A9 f=868E98 l=A2AAB3 m=B2B9C1'
        for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
            $ch = 'c'
            if ($y -le 2) { $ch = 'b' } elseif ($y -ge 13) { $ch = 'f' }
            if ($x -le 1 -and $y -gt 2 -and $y -lt 13) { $ch = 'a' } elseif ($x -ge 14 -and $y -gt 2 -and $y -lt 13) { $ch = 'e' }
            if ($y -eq 3 -or $y -eq 12 -or $y -eq 15) { $ch = 'd' }
            if ($x -ge 4 -and $x -le 11 -and $y -ge 4 -and $y -le 11) { $ch = if (($x % 3) -eq 1) { 'm' } else { 'l' } }
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
    $casing = New-StandInStainless
    $tiles = New-Object System.Collections.Generic.List[object]
    $dir = Join-Path $OutRoot 'block\multiblock\syngas_plant'
    $idle = Read-Png (Join-Path $dir 'overlay_front.png')
    $act = Read-Png (Join-Path $dir 'overlay_front_active.png')
    $emi = Read-Png (Join-Path $dir 'overlay_front_active_emissive.png')
    $tiles.Add((Merge-On $casing $idle))
    for ($f = 0; $f -lt 8; $f++) { $tiles.Add((Merge-On (Merge-On $casing (Get-Frame $act $f)) (Get-Frame $emi $f))) }
    $tiles.Add((Get-Dark $casing (Get-Frame $act 0) (Get-Frame $emi 0)))
    foreach ($item in 'shift_catalyst', 'hydrotreating_catalyst', 'reforming_catalyst') {
        $p = Join-Path $OutRoot "item\$item.png"
        if (Test-Path -LiteralPath $p) {
            $bg = New-Canvas 16 16
            for ($i = 0; $i -lt 256; $i++) { $bg.P[$i] = Hex '8B8B8B' }
            $tiles.Add((Merge-On $bg (Read-Png $p)))
        }
    }
    $scale = 8; $gap = 4
    $sheet = New-Canvas (($tiles.Count) * (16 * $scale + $gap) + $gap) (16 * $scale + 2 * $gap)
    for ($i = 0; $i -lt $sheet.P.Length; $i++) { $sheet.P[$i] = Hex '202428' }
    for ($t = 0; $t -lt $tiles.Count; $t++) {
        $x0 = $gap + $t * (16 * $scale + $gap)
        for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
            $v = $tiles[$t].P[$y * 16 + $x]
            if (($v -band 0xFF000000) -eq 0) { continue }
            Set-Rect $sheet ($x0 + $x * $scale) ($gap + $y * $scale) $scale $scale $v
        } }
    }
    Save-Png $sheet ([System.IO.Path]::GetFullPath($Preview))
    Write-Host "preview: $Preview (idle, 8 active frames with emissive, dark room, then the catalysts)"
}

if ($Credits) {
    Write-Host ''
    foreach ($rel in $written) {
        Write-Host ("| ``pack/kubejs/assets/grindless/textures/$rel`` | Generated with tools/assets/$ScriptName (procedural pixel art, original) by the gas plant agent, 2026-10-24 | the pack's own (pending; proposed CC BY-SA 4.0) |")
    }
}
