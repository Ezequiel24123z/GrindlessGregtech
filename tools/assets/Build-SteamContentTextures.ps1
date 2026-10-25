<#
.SYNOPSIS
  Procedural 16x16 pixel art for the Steam Age additions of the journey plan (docs/journey.md): the Steam Blast Furnace
  and the By-product Coke Battery. GregTech style: bevels, top-left light, every pixel fully opaque or transparent.

.DESCRIPTION
  Every pixel is drawn by this script (palettes + char maps + a few small routines); nothing is copied or edited from
  GregTech Modern or any other mod. Output is deterministic: re-running overwrites the same bytes.

  Writes (under pack/kubejs/assets/grindless/textures/):
    block/multiblock/steam_blast_furnace/overlay_front.png, overlay_front_active.png(+.mcmeta), overlay_front_active_emissive.png(+.mcmeta)
    block/multiblock/coking_battery/...   (same three)

  Run from the repo root (PowerShell 5.1 blocks unsigned scripts by default; this bypass only affects that process):
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-SteamContentTextures.ps1
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-SteamContentTextures.ps1 -Only blast
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-SteamContentPreview.ps1 -Out C:\path\steam-content.png

  Steam palette, like the drill and greenhouse faces: bronze and brass, riveted iron, warm light. Overlay conventions
  (GTM's workable casings): transparent background, the outer 1 px ring left empty so the casing shows around the face,
  `_active` is a vertical strip of 8 frames with a .png.mcmeta, `_emissive` holds only pixels that glow and that the colour
  layer has, identical.

  Casings the faces sit on (the controllers' base textures in startup_scripts/grindless/steam/):
    steam_blast_furnace  ->  gtceu:block/casings/solid/machine_primitive_bricks   (firebricks: the controller is in the bosh)
    coking_battery       ->  gtceu:block/casings/solid/machine_coke_bricks        (coke oven bricks: it is a chamber door)

.PARAMETER Only
  Subset of: blast, battery. Default: both.
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

function Set-Both {
    param($C, $E, [int]$X, [int]$Y, [int]$Argb)
    Set-Px $C $X $Y $Argb; Set-Px $E $X $Y $Argb
}

# Deterministic 0..255 hash of (x, y, frame, salt): flicker without a random generator.
function Get-Noise {
    param([long]$X, [long]$Y, [long]$T = 0, [long]$Salt = 0)
    $h = (($X * 73856093L) -bxor ($Y * 19349663L) -bxor ($T * 83492791L) -bxor ($Salt * 2654435761L)) % 1000003L
    if ($h -lt 0) { $h = -$h }
    return [int](($h * 7919L) % 256L)
}

# ============================================================================================
#  STEAM BLAST FURNACE - controller face (on firebricks)
#  blast gauge (x1-5) and blast valve wheel (x10-14) on the bronze bustle main (y2-4); two bronze tuyere stocks drop
#  along the sides (x1-2, x13-14); in the middle a riveted cast-iron tap door with a peep window on the melt (x5-10,
#  y8-10) and the tap hole with its iron runner below (x6-9, y12-14); status lamp at the bottom right.
# ============================================================================================
$BfPal = New-Pal @'
Y=F6DC94 y=E0B45C u=B98A3E U=8B6430 W=5C401E O=36250F
A=C3CAD3 B=98A1AD C=717A87 D=4D5461 E=333944 F=21252D
f=F3ECD6 g=CBBE9C n=E0362A
1=FFF6D2 2=FFE07A 3=FFB03A 4=EA6E1C 5=B8401A 6=742410 7=46190C
q=4CFF7A Q=CFFFD8 r=19B84A L=B23A2C l=7E2A20
'@

$BfBase = @(
    '................',
    '..uYu......uYu..',
    '.uffgUWYyWu.y.U.',
    '.YfffWWuuWYyOyW.',
    '.ugggWOUUOu.y.W.',
    '..UWW......UWU..',
    '.uU.BAAAAAAB.uW.',
    '.yUBCEEEEEECDuW.',
    '.WOAE777777BDWO.',
    '.yUBE777777BDuW.',
    '.yUAE777777BDuW.',
    '.UWBCBBBBBBCDWO.',
    '....DDDFFDDD.Ll.',
    '......CF7D...ll.',
    '................',
    '................'
)
Assert-Map 'BfBase' $BfBase

function New-BlastFrame {
    param([bool]$Active, [int]$T = 0)
    $c = New-Canvas; $e = New-Canvas
    Write-Map $c 0 0 $BfBase $BfPal
    $P = $BfPal

    # gauge needle, pivot (3,3): idle it rests low-left; working it stands high-right and shivers with the blast
    Set-Px $c 3 3 $P['n']
    if (-not $Active) { Set-Px $c 2 4 $P['n'] }
    else {
        $tips = @(@(4, 2), @(4, 2), @(4, 3), @(4, 2), @(4, 2), @(4, 2), @(4, 3), @(4, 2))
        $tip = $tips[$T % 8]; Set-Px $c $tip[0] $tip[1] $P['n']
    }

    # peep window on the melt (x5-10, y8-10): a dark crust with two embers when idle, a churning melt when working
    if (-not $Active) {
        Set-Px $c 7 9 $P['6']; Set-Px $c 9 8 $P['6']; Set-Px $c 6 10 $P['5']
    } else {
        for ($y = 8; $y -le 10; $y++) {
            for ($x = 5; $x -le 10; $x++) {
                # hotter in the middle of the window and on the lower rows (the melt pool), plus a per-frame flicker
                $heat = 150 - 22 * [Math]::Abs($x - 7.5) + 18 * ($y - 8) + ((Get-Noise $x $y $T 11) - 128) * 0.45
                $k = if ($heat -ge 150) { '1' } elseif ($heat -ge 118) { '2' } elseif ($heat -ge 86) { '3' } else { '4' }
                Set-Both $c $e $x $y $P[$k]
            }
        }
        # a spark climbs the window every other frame
        $sparkY = @(10, 9, 8, 8, 10, 9, 8, 8)[$T % 8]
        $sparkX = @(6, 6, 7, 7, 9, 9, 8, 8)[$T % 8]
        if (($T % 4) -lt 3) { Set-Both $c $e $sparkX $sparkY $P['1'] }
    }

    # the tap hole and the runner: cold slag when idle, a molten stream when working (it pulses down the runner)
    if ($Active) {
        $flow = @('2', '3', '2', '1', '2', '3', '2', '1')
        Set-Both $c $e 7 12 $P['3']; Set-Both $c $e 8 12 $P['4']
        Set-Both $c $e 7 13 $P[$flow[$T % 8]]
        Set-Both $c $e 7 14 $P[$flow[($T + 2) % 8]]
        Set-Both $c $e 8 14 $P[@('4', '3', '4', '5', '4', '3', '4', '5')[$T % 8]]
    }

    # status lamp (x13-14, y12-13): dull red when idle, green when working
    if ($Active) {
        $core = if (($T % 4) -lt 2) { 'Q' } else { 'q' }
        Set-Both $c $e 13 12 $P[$core]; Set-Both $c $e 14 12 $P['q']
        Set-Both $c $e 13 13 $P['q']; Set-Both $c $e 14 13 $P['r']
    }
    return @{ Color = $c; Emi = $e }
}

# ============================================================================================
#  BY-PRODUCT COKE BATTERY - controller face (on coke oven bricks)
#  a chamber door: two riveted iron buckstays (x1-2, x13-14) hold a luted cast-iron door (x4-11, y2-13) shut with two
#  latch bars and brass catches; the leveller hole at the top. When the chamber is coking, the luting seams around the door
#  glow (the coke behind it is white-hot) and the leveller hole flickers. Status lamp at the bottom of the right buckstay.
# ============================================================================================
$CbPal = New-Pal @'
A=D2D0C8 B=A9A69E C=817E77 D=5E5B55 E=423F3B F=2C2A27
Y=F2D48A y=D9A84E u=AE7E36 U=7E5A26 W=553B18
1=FFF3C8 2=FFD36A 3=FF9E36 4=E05A18 5=A63414 6=5E1C0C
q=4CFF7A Q=CFFFD8 r=19B84A L=B23A2C l=7E2A20
'@

$CbBase = @(
    '................',
    '.BD.66666666.CE.',
    '.AD6DDDDDDDD6CE.',
    '.BD6DCCFFCCE6CE.',
    '.BD6DCCCCCCE6CE.',
    '.BDBBBBYuBBBBBE.',
    '.BDEEEEUWEEEEEE.',
    '.AD6DCCCCCCE6CE.',
    '.BD6DCBCCBCE6CE.',
    '.BD6DCCCCCCE6CE.',
    '.BDBBBBYuBBBBBE.',
    '.BDEEEEUWEEEEEE.',
    '.AD6DCCCCCCE6LL.',
    '.BD6EEEEEEEE6ll.',
    '.BD.66666666.CE.',
    '................'
)
Assert-Map 'CbBase' $CbBase

function New-BatteryFrame {
    param([bool]$Active, [int]$T = 0)
    $c = New-Canvas; $e = New-Canvas
    Write-Map $c 0 0 $CbBase $CbPal
    $P = $CbPal

    # rivets down the buckstays (the lamp sits at the bottom of the right one)
    foreach ($ry in @(3, 8, 13)) { Set-Px $c 1 $ry $P['A'] }
    foreach ($ry in @(3, 8)) { Set-Px $c 14 $ry $P['C'] }
    # catches: a lit edge on the brass knobs
    Set-Px $c 7 5 $P['Y']; Set-Px $c 7 10 $P['Y']

    if ($Active) {
        # luting seams around the door: the glow breathes (period 4) and a brighter wave runs round the door (period 8)
        $seam = New-Object System.Collections.Generic.List[object]
        for ($x = 4; $x -le 11; $x++) { $seam.Add(@($x, 1)) }
        for ($y = 2; $y -le 13; $y++) { if ($y -ne 5 -and $y -ne 6 -and $y -ne 10 -and $y -ne 11) { $seam.Add(@(12, $y)) } }
        for ($x = 11; $x -ge 4; $x--) { $seam.Add(@($x, 14)) }
        for ($y = 13; $y -ge 2; $y--) { if ($y -ne 5 -and $y -ne 6 -and $y -ne 10 -and $y -ne 11) { $seam.Add(@(3, $y)) } }
        $n = $seam.Count
        $base = @('4', '3', '4', '5')[$T % 4]
        for ($i = 0; $i -lt $n; $i++) {
            $px = $seam[$i]
            $wave = (($i - [int]($T * $n / 8)) % $n + $n) % $n
            $k = if ($wave -lt 2) { '2' } elseif ($wave -lt 4) { '3' } else { $base }
            Set-Both $c $e $px[0] $px[1] $P[$k]
        }
        # leveller hole: white-hot coke flickering through it
        $hole = @(@('1', '2'), @('2', '1'), @('2', '2'), @('1', '1'))
        Set-Both $c $e 7 3 $P[$hole[$T % 4][0]]; Set-Both $c $e 8 3 $P[$hole[$T % 4][1]]
        # status lamp
        $core = if (($T % 4) -lt 2) { 'Q' } else { 'q' }
        Set-Both $c $e 13 12 $P[$core]; Set-Both $c $e 14 12 $P['q']
        Set-Both $c $e 13 13 $P['q']; Set-Both $c $e 14 13 $P['r']
    } else {
        # cold: the seams show the dull red of the bricks' heat only at the bottom corners
        Set-Px $c 3 13 $P['5']; Set-Px $c 12 2 $P['5']
    }
    return @{ Color = $c; Emi = $e }
}

# ============================================================================================
#  BUILD
# ============================================================================================
if (Test-Want 'blast') {
    $frames = @(); $emis = @()
    for ($t = 0; $t -lt 8; $t++) { $f = New-BlastFrame $true $t; $frames += $f.Color; $emis += $f.Emi }
    $idle = New-BlastFrame $false 0
    Out-Tex $idle.Color 'block/multiblock/steam_blast_furnace/overlay_front.png'
    Out-Tex (Join-Frames $frames) 'block/multiblock/steam_blast_furnace/overlay_front_active.png' 3
    Out-Tex (Join-Frames $emis) 'block/multiblock/steam_blast_furnace/overlay_front_active_emissive.png' 3
}
if (Test-Want 'battery') {
    $frames = @(); $emis = @()
    for ($t = 0; $t -lt 8; $t++) { $f = New-BatteryFrame $true $t; $frames += $f.Color; $emis += $f.Emi }
    $idle = New-BatteryFrame $false 0
    Out-Tex $idle.Color 'block/multiblock/coking_battery/overlay_front.png'
    Out-Tex (Join-Frames $frames) 'block/multiblock/coking_battery/overlay_front_active.png' 4
    Out-Tex (Join-Frames $emis) 'block/multiblock/coking_battery/overlay_front_active_emissive.png' 4
}

# ============================================================================================
#  VERIFY what was written (size, binary alpha, no pure black, 8-frame strips that really animate, empty casing ring,
#  emissive pixels present and identical in the colour layer)
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
            for ($i = 0; $i -lt $img.P.Length; $i++) {
                if ((($img.P[$i] -shr 24) -band 255) -ne 0 -and $img.P[$i] -ne $color.P[$i]) { $msgs += 'emissive pixel not present in colour layer'; break }
            }
        }
    }
    if ($msgs.Count -gt 0) { $problems++; Write-Warning "$rel : $($msgs -join '; ')" }
}

Write-Host "written $($written.Count) files under $OutRoot ($problems with warnings)"
foreach ($rel in $written) { Write-Host "  $rel" }
if ($problems -gt 0) { exit 1 }

if ($Credits) {
    Write-Host ''
    foreach ($rel in $written) {
        Write-Host ("| ``pack/kubejs/assets/grindless/textures/$rel`` | Generated with tools/assets/$ScriptName (procedural pixel art, original) by the steam content agent, 2026-10-24 | the pack's own (pending; proposed CC BY-SA 4.0) |")
    }
}
