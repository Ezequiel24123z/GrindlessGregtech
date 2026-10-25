<#
.SYNOPSIS
  Procedural 16x16 pixel art for the small Steam multiblock family (GTL idea, docs/investigacion/leisure.md 4.2 -
  idea only, no code/textures copied, licence unclear): forge hammer, compressor, alloy smelter, mixer, chemical bath
  and ore washer. GregTech style: bevels, top-left light, every pixel fully opaque or transparent.

.DESCRIPTION
  Every pixel is drawn by this script (palettes + char maps + a few small routines); nothing is copied or edited from
  GregTech Modern or any other mod. Output is deterministic: re-running overwrites the same bytes.

  One shared family frame (riveted-bronze bezel, brass plate, a recessed window) with a different working icon per
  machine inside the window, so all six read as one family (same bronze/iron ramp as the Steam Blast Furnace / Coke
  Battery faces, tools/assets/Build-SteamContentTextures.ps1: bronze and brass, riveted iron, warm light) while
  staying tellable apart at a glance.

  Writes (under pack/kubejs/assets/grindless/textures/):
    block/multiblock/steam_forge_hammer/overlay_front.png, overlay_front_active.png(+.mcmeta), overlay_front_active_emissive.png(+.mcmeta)
    block/multiblock/steam_compressor/...      (same three)
    block/multiblock/steam_alloy_smelter/...   (same three)
    block/multiblock/steam_mixer/...           (same three)
    block/multiblock/steam_chemical_bath/...   (same three)
    block/multiblock/steam_ore_washer/...      (same three)

  Run from the repo root (PowerShell 5.1 blocks unsigned scripts by default; this bypass only affects that process):
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-SteamSmallFamilyTextures.ps1
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-SteamSmallFamilyTextures.ps1 -Only hammer,compressor
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-SteamSmallFamilyTextures.ps1 -Credits

  Casing every controller sits on (startup_scripts/grindless/steam/small_family.js): gtceu:block/casings/solid/
  machine_casing_bronze_plated_bricks (GTM's steam machine casing, the same as every other Grindless steam multiblock).

.PARAMETER Only
  Subset of: hammer, compressor, smelter, mixer, bath, washer. Default: all six.
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
    for ($i = 0; $i -lt $Rows.Count; $i++) { if ($Rows[$i].Length -ne $W) { throw "${Name}: row $i has $($Rows[$i].Length) chars, expected $W (got '$($Rows[$i])')" } }
}

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
#  SHARED FAMILY PALETTE AND FRAME
#  Bronze Y/y/u/U/W/O and riveted iron A/B/C/D/E/F: the same ramp as the Steam Blast Furnace / Coke Battery faces
#  (Build-SteamContentTextures.ps1), so the whole steam family reads as one look. Plus the shared red/green status
#  lamp (q/Q/r idle red L/l, active green q/Q/r) and small per-icon accents: heat (h/m/k), teal liquid (t), pale
#  foam/bubble (p), water blue (b).
#
#  Every machine gets: a riveted-bronze bezel (1,1)-(14,14), a brass plate, a recessed window (3,3)-(12,12) that
#  holds the working icon (8x8, local 0,0 = absolute WIN_X0,WIN_Y0 = 4,4), and a 1x2 status lamp at (13,11)-(13,12)
#  in the brass plate - dull red idle, green active.
# ============================================================================================
$FamPal = New-Pal @'
Y=F6DC94 y=E0B45C u=B98A3E U=8B6430 W=5C401E O=36250F
A=C3CAD3 B=98A1AD C=717A87 D=4D5461 E=333944 F=21252D
q=4CFF7A Q=CFFFD8 r=19B84A L=B23A2C l=7E2A20
h=FFF3C8 m=FFB03A k=B8401A
t=3FA7A7 p=EAF7F2 b=6FB7E8
'@
$WIN_X0 = 4
$WIN_Y0 = 4

# bezel + brass plate + recessed window lining; the icon area (4,4)-(11,11) is left untouched ('.') for the icon
$FrameBase = @(
    '................',
    '.UUUUUUUUUUUUUU.',
    '.UyyyyyyyyyyyyU.',
    '.UyWWWWWWWWWWyU.',
    '.UyW........WyU.',
    '.UyW........WyU.',
    '.UyW........WyU.',
    '.UyW........WyU.',
    '.UyW........WyU.',
    '.UyW........WyU.',
    '.UyW........WyU.',
    '.UyW........WyU.',
    '.UyWWWWWWWWWWyU.',
    '.UyyyyyyyyyyyyU.',
    '.UUUUUUUUUUUUUU.',
    '................'
)
Assert-Map 'FrameBase' $FrameBase

function New-Frame {
    $c = New-Canvas; $e = New-Canvas
    Write-Map $c 0 0 $FrameBase $FamPal
    # four corner rivets on the bezel
    foreach ($p in @(@(1, 1), @(14, 1), @(1, 14), @(14, 14))) { Set-Px $c $p[0] $p[1] $FamPal['U'] }
    return @{ Color = $c; Emi = $e }
}

# status lamp overwrites two brass-plate pixels just right of the window: dull red idle, pulsing green active
function Paint-Lamp {
    param($c, $e, [bool]$Active, [int]$T)
    if (-not $Active) {
        Set-Px $c 13 11 $FamPal['L']; Set-Px $c 13 12 $FamPal['l']
        return
    }
    $core = if (($T % 2) -eq 0) { 'Q' } else { 'q' }
    Set-Both $c $e 13 11 $FamPal[$core]
    Set-Both $c $e 13 12 $FamPal['q']
}

# ============================================================================================
#  ICONS (8x8, local coords; absolute = local + WIN_X0/WIN_Y0). Each paints $c/$e in place.
# ============================================================================================

# FORGE HAMMER: a ram (col 3-4) over an anvil (rows 5-7). Idle: ram up, anvil cold. Active: ram strikes down,
# sparks at contact.
function Paint-Hammer {
    param($c, $e, [bool]$Active, [int]$T)
    for ($y = 5; $y -le 7; $y++) { for ($x = 1; $x -le 6; $x++) { Set-Px $c ($WIN_X0 + $x) ($WIN_Y0 + $y) $FamPal['C'] } }
    Set-Px $c ($WIN_X0 + 1) ($WIN_Y0 + 5) $FamPal['B']; Set-Px $c ($WIN_X0 + 6) ($WIN_Y0 + 5) $FamPal['B']
    $ramY = if ($Active) { @(0, 1, 2, 3, 3, 2, 1, 0)[$T % 8] } else { 0 }
    for ($y = 0; $y -le $ramY; $y++) { Set-Px $c ($WIN_X0 + 3) ($WIN_Y0 + $y) $FamPal['E']; Set-Px $c ($WIN_X0 + 4) ($WIN_Y0 + $y) $FamPal['D'] }
    if ($Active -and $ramY -ge 3) {
        Set-Both $c $e ($WIN_X0 + 2) ($WIN_Y0 + 4) $FamPal['m']
        Set-Both $c $e ($WIN_X0 + 5) ($WIN_Y0 + 4) $FamPal['m']
        Set-Both $c $e ($WIN_X0 + 3) ($WIN_Y0 + 4) $FamPal['h']
        Set-Both $c $e ($WIN_X0 + 4) ($WIN_Y0 + 4) $FamPal['h']
    }
}

# COMPRESSOR: two steel pistons (left/right) pressing a bronze plate between them. Idle: pistons apart. Active:
# they close in, the plate flashes bright brass when fully compressed.
function Paint-Compressor {
    param($c, $e, [bool]$Active, [int]$T)
    for ($y = 0; $y -le 7; $y++) {
        Set-Px $c ($WIN_X0 + 0) ($WIN_Y0 + $y) $FamPal['C']; Set-Px $c ($WIN_X0 + 1) ($WIN_Y0 + $y) $FamPal['B']
        Set-Px $c ($WIN_X0 + 6) ($WIN_Y0 + $y) $FamPal['B']; Set-Px $c ($WIN_X0 + 7) ($WIN_Y0 + $y) $FamPal['C']
    }
    $gap = if ($Active) { @(3, 2, 1, 0, 0, 1, 2, 3)[$T % 8] } else { 3 }
    $left = 2 + (3 - $gap); $right = 5 - (3 - $gap)
    for ($x = $left; $x -le $right; $x++) { Set-Px $c ($WIN_X0 + $x) ($WIN_Y0 + 3) $FamPal['y']; Set-Px $c ($WIN_X0 + $x) ($WIN_Y0 + 4) $FamPal['u'] }
    if ($Active -and $gap -eq 0) {
        for ($x = 2; $x -le 5; $x++) { Set-Both $c $e ($WIN_X0 + $x) ($WIN_Y0 + 3) $FamPal['Y'] }
    }
}

# ALLOY SMELTER: a small crucible with a melt pool. Idle: cold crust with one ember. Active: the melt churns and a
# drop falls every few frames.
function Paint-Smelter {
    param($c, $e, [bool]$Active, [int]$T)
    for ($y = 4; $y -le 7; $y++) { for ($x = 1; $x -le 6; $x++) { Set-Px $c ($WIN_X0 + $x) ($WIN_Y0 + $y) $FamPal['E'] } }
    Set-Px $c ($WIN_X0 + 1) ($WIN_Y0 + 4) $FamPal['D']; Set-Px $c ($WIN_X0 + 6) ($WIN_Y0 + 4) $FamPal['D']
    if (-not $Active) {
        Set-Px $c ($WIN_X0 + 3) ($WIN_Y0 + 6) $FamPal['k']
        return
    }
    for ($y = 5; $y -le 6; $y++) {
        for ($x = 2; $x -le 5; $x++) {
            $heat = 150 + ((Get-Noise $x $y $T 31) - 128) * 0.7
            $k = if ($heat -ge 190) { 'h' } elseif ($heat -ge 140) { 'm' } else { 'k' }
            Set-Both $c $e ($WIN_X0 + $x) ($WIN_Y0 + $y) $FamPal[$k]
        }
    }
    if (($T % 4) -eq 0) { Set-Both $c $e ($WIN_X0 + 3) ($WIN_Y0 + 7) $FamPal['m'] }
}

# MIXER: a vat with a central shaft and rotating paddle blades. Idle: blades at rest. Active: blades turn, a ripple
# of brass highlight crosses the surface.
function Paint-Mixer {
    param($c, $e, [bool]$Active, [int]$T)
    for ($y = 4; $y -le 7; $y++) { for ($x = 0; $x -le 7; $x++) { Set-Px $c ($WIN_X0 + $x) ($WIN_Y0 + $y) $FamPal['C'] } }
    for ($y = 0; $y -le 3; $y++) { Set-Px $c ($WIN_X0 + 3) ($WIN_Y0 + $y) $FamPal['D']; Set-Px $c ($WIN_X0 + 4) ($WIN_Y0 + $y) $FamPal['E'] }
    $angles = @(@(1, 5), @(6, 5)), @(@(2, 4), @(5, 6)), @(@(3, 4), @(4, 6)), @(@(2, 6), @(5, 4))
    $blade = if ($Active) { $angles[$T % 4] } else { $angles[0] }
    foreach ($p in $blade) { Set-Px $c ($WIN_X0 + $p[0]) ($WIN_Y0 + $p[1]) $FamPal['y'] }
    if ($Active) {
        $ripple = @(2, 3, 4, 5)[$T % 4]
        Set-Both $c $e ($WIN_X0 + $ripple) ($WIN_Y0 + 4) $FamPal['Y']
    }
}

# CHEMICAL BATH: a tank of teal liquid. Idle: still, no bubbles. Active: a rotating set of bubbles rises (emissive).
function Paint-Bath {
    param($c, $e, [bool]$Active, [int]$T)
    for ($y = 2; $y -le 7; $y++) {
        Set-Px $c ($WIN_X0 + 0) ($WIN_Y0 + $y) $FamPal['C']; Set-Px $c ($WIN_X0 + 7) ($WIN_Y0 + $y) $FamPal['C']
        for ($x = 1; $x -le 6; $x++) { Set-Px $c ($WIN_X0 + $x) ($WIN_Y0 + $y) $FamPal['t'] }
    }
    Set-Px $c ($WIN_X0 + 3) ($WIN_Y0 + 0) $FamPal['u']; Set-Px $c ($WIN_X0 + 3) ($WIN_Y0 + 1) $FamPal['u']
    if (-not $Active) { return }
    $bub = @(@(2, 6), @(4, 5), @(5, 4), @(2, 3), @(4, 6), @(5, 2), @(2, 5), @(4, 4))
    for ($i = 0; $i -lt 3; $i++) {
        $p = $bub[($T + $i * 3) % 8]
        Set-Both $c $e ($WIN_X0 + $p[0]) ($WIN_Y0 + $p[1]) $FamPal['p']
    }
}

# ORE WASHER: a round mesh drum. Idle: still. Active: the mesh pattern shifts (spins) and one water droplet flies
# off a different side each frame.
function Paint-Washer {
    param($c, $e, [bool]$Active, [int]$T)
    $ring = @('3,1', '4,1', '2,2', '5,2', '1,3', '6,3', '1,4', '6,4', '1,5', '6,5', '2,6', '5,6', '3,7', '4,7')
    foreach ($s in $ring) { $p = $s -split ','; Set-Px $c ($WIN_X0 + [int]$p[0]) ($WIN_Y0 + [int]$p[1]) $FamPal['B'] }
    for ($y = 2; $y -le 6; $y++) { for ($x = 2; $x -le 5; $x++) { Set-Px $c ($WIN_X0 + $x) ($WIN_Y0 + $y) $FamPal['D'] } }
    $mesh = if ($Active) { $T % 2 } else { 0 }
    for ($y = 2; $y -le 6; $y++) { for ($x = 2; $x -le 5; $x++) { if ((($x + $y + $mesh) % 2) -eq 0) { Set-Px $c ($WIN_X0 + $x) ($WIN_Y0 + $y) $FamPal['E'] } } }
    if (-not $Active) { return }
    $drops = @(@(0, 2), @(7, 4), @(0, 5), @(7, 1), @(0, 1), @(7, 6), @(0, 6), @(7, 2))
    $p = $drops[$T % 8]
    Set-Both $c $e ($WIN_X0 + $p[0]) ($WIN_Y0 + $p[1]) $FamPal['b']
}

# ============================================================================================
#  BUILD
# ============================================================================================
$MACHINES = @(
    @{ Id = 'hammer'; Dir = 'steam_forge_hammer'; Paint = ${function:Paint-Hammer} },
    @{ Id = 'compressor'; Dir = 'steam_compressor'; Paint = ${function:Paint-Compressor} },
    @{ Id = 'smelter'; Dir = 'steam_alloy_smelter'; Paint = ${function:Paint-Smelter} },
    @{ Id = 'mixer'; Dir = 'steam_mixer'; Paint = ${function:Paint-Mixer} },
    @{ Id = 'bath'; Dir = 'steam_chemical_bath'; Paint = ${function:Paint-Bath} },
    @{ Id = 'washer'; Dir = 'steam_ore_washer'; Paint = ${function:Paint-Washer} }
)

foreach ($mc in $MACHINES) {
    if (-not (Test-Want $mc.Id)) { continue }
    $frames = @(); $emis = @()
    for ($t = 0; $t -lt 8; $t++) {
        $f = New-Frame
        & $mc.Paint $f.Color $f.Emi $true $t
        Paint-Lamp $f.Color $f.Emi $true $t
        $frames += $f.Color; $emis += $f.Emi
    }
    $idle = New-Frame
    & $mc.Paint $idle.Color $idle.Emi $false 0
    Paint-Lamp $idle.Color $idle.Emi $false 0

    Out-Tex $idle.Color ('block/multiblock/' + $mc.Dir + '/overlay_front.png')
    Out-Tex (Join-Frames $frames) ('block/multiblock/' + $mc.Dir + '/overlay_front_active.png') 3
    Out-Tex (Join-Frames $emis) ('block/multiblock/' + $mc.Dir + '/overlay_front_active_emissive.png') 3
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
        Write-Host ("| ``pack/kubejs/assets/grindless/textures/$rel`` | Generated with tools/assets/$ScriptName (procedural pixel art, original) by the small steam family agent, 2026-10-25 | the pack's own (pending; proposed CC BY-SA 4.0) |")
    }
}
