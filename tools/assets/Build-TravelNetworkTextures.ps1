<#
.SYNOPSIS
  Procedural 16x16 pixel art for IV-B5, travel and network, of Gregtech Grindless (GregTech style: top-left light, selective
  outlines).

.DESCRIPTION
  Every pixel is drawn by this script (palettes + small shading routines); nothing is copied or edited from GregTech Modern, AE2,
  GCYR or any other mod. Output is deterministic: re-running overwrites the same bytes.

  Writes (under pack/kubejs/assets/grindless/textures/):
    item/venusian_quantum_seed.png(+.mcmeta)   the Venusian half of an Earth-Venus entangled AE2 pair (animated)
    item/hermean_quantum_seed.png(+.mcmeta)    the Hermean half of an Earth-Mercury entangled AE2 pair (animated)
    block/machines/rtg/overlay_top.png         the RTG cell's heat-source cap, idle
    block/machines/rtg/overlay_top_active.png(+.mcmeta) and overlay_top_active_emissive.png(+.mcmeta)   the cap's vents glowing
    block/machines/rtg/overlay_side.png, overlay_back.png   the radiator fins

  The two seeds are siblings of the Lunar and Martian Quantum Seeds (Build-MoonTextures.ps1, Build-AE2InterplanetaryTextures.ps1): the
  same sealed ampoule with the teal ender pearl and the two violet sparks of the entangled pair, under a cap of the planet's ground.
    Venus    a cap of ochre Venusian regolith with sulfur specks; the pearl floats in a pale yellow glow crossed by cloud bands that
             drift round it (Venus's clouds circle the planet in four days); the sparks turn the Moon's way, an eighth of a turn ahead.
    Mercury  a cap of dark grey Hermean rock with graphite glints; the glow is the Sun's glare, and a day-night terminator sweeps across
             it (Mercury's long day); the sparks turn the Martian way, an eighth of a turn ahead.
  The RTG cell is a GTM single-block generator on the EV hull (GTM's generator model adds the energy-out marker on the front):
    top      a round steel cap over the plutonium heat source with a radiation trefoil and four vents; while it runs the vents glow a
             dull red-orange (the pellet is hot, not burning) and the glow breathes (4 frames, frametime 8)
    side, back  six titanium radiator fins between a root bar and a top bar

  Run from the repo root (PowerShell 5.1 blocks unsigned scripts by default; this bypass only affects that process):
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-TravelNetworkTextures.ps1
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-TravelNetworkTextures.ps1 -Only seeds -Credits

  Conventions (same as the other sets): transparent background, every pixel fully opaque or fully transparent, no pure black,
  animated textures are vertical 16x(16*n) strips with a .png.mcmeta.

.PARAMETER OutRoot
  Textures root. Default: <repo>/pack/kubejs/assets/grindless/textures
.PARAMETER Only
  Subset of: seeds, rtg. Default: everything.
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
$Want = @($Only | ForEach-Object { $_ -split ',' } | ForEach-Object { $_.Trim().ToLowerInvariant() } | Where-Object { $_ -ne '' })
function Test-Want { param([string]$Name) return ($Want.Count -eq 0 -or $Want -contains $Name) }

$written = New-Object System.Collections.Generic.List[string]
function Out-Tex {
    param($Canvas, [string]$Rel, [int]$FrameTime = 0)
    $path = Join-Path $OutRoot ($Rel -replace '/', '\')
    $dir = Split-Path -Parent $path
    if (-not (Test-Path -LiteralPath $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
    # an editor, indexer or virus scanner can hold a file for a moment: retry the write a few times
    for ($try = 1; $try -le 6; $try++) {
        try { Save-Png $Canvas $path; if ($FrameTime -gt 0) { Save-Mcmeta ($path + '.mcmeta') $FrameTime }; break }
        catch [System.IO.IOException] { if ($try -eq 6) { throw }; Start-Sleep -Milliseconds (250 * $try) }
    }
    $written.Add($Rel)
    if ($FrameTime -gt 0) { $written.Add($Rel + '.mcmeta') }
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

# Deterministic 0..255 hash of (x, y, frame, salt): grain without a random generator.
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

# ============================================================================================
#  QUANTUM SEEDS: the sealed ampoule of the seed family, with the planet's cap and glow
# ============================================================================================
#   K..O  the cap, lit -> dark; k = a dark grain, y = a bright speck
#   a..e  the glass rim, lit -> dark
#   f..j  the glow, brightest around the pearl -> deepest on the shaded side
#   p..t  the ender pearl, lit -> dark
#   w     the glass reflection; u, x the sparks (violet, the ender pearl's colour) and their trails
$SeedCx = 8.0; $SeedCy = 10.0; $SeedR = 4.9

# Venus: ochre regolith with sulfur specks, a pale sulfur-yellow cloud glow
$VenusSeedPal = New-Pal @'
K=D8B57C L=BC9459 M=96713F N=70512C O=4C361D k=5C4224 y=EEDC5A
a=FFFBEA b=F2E4C2 c=D8C496 d=AE9A6A e=7C6A44
f=FFFBE0 g=FFEFA8 h=F6D676 i=DDB24E j=B58A32
p=86F6DA q=34CBA6 r=19937C s=0F6155 t=093C35
w=FFFFFF u=A27CFF x=D2BEFF
'@

# Mercury: dark grey rock with graphite glints, the Sun's white glare and the night side
$MercurySeedPal = New-Pal @'
K=B4B4BA L=939399 M=727279 N=55555C O=3A3A40 k=2C2C32 y=D6DAE6
a=FFFFFF b=E6E8EE c=C2C6D0 d=8E94A2 e=5E6474
f=FFFDF2 g=FFF0C4 h=F4DC94 i=4E4A60 j=34303F
p=86F6DA q=34CBA6 r=19937C s=0F6155 t=093C35
w=FFFFFF u=A27CFF x=D2BEFF
'@

# $Planet: 'venus' or 'mercury'. $Dir: +1 the Moon's way round, -1 the Martian way.
function New-PlanetSeedFrame {
    param([int]$T, [string]$Planet)
    $c = New-Canvas
    $P = if ($Planet -eq 'venus') { $VenusSeedPal } else { $MercurySeedPal }
    $salt = if ($Planet -eq 'venus') { 73 } else { 89 }
    # the cap of the planet's ground (lit top-left, dark grains and bright specks) over the sealed neck
    $cap = @(@(1, 6, 9), @(2, 5, 10), @(3, 5, 10))
    foreach ($row in $cap) {
        for ($x = $row[1]; $x -le $row[2]; $x++) {
            $tone = Get-SpanTone $x $row[1] $row[2]
            if ($row[0] -eq 3) { $tone = Get-ClampInt ($tone + 1) 0 4 }
            $col = $P[@('K', 'L', 'M', 'N', 'O')[$tone]]
            $n = Get-Noise $x $row[0] 0 $salt
            if ($n -gt 218) { $col = $P['k'] } elseif ($n -lt 20 -and $tone -le 2) { $col = $P['y'] }
            Set-Px $c $x $row[0] $col
        }
    }
    Set-Px $c 7 4 $P['b']; Set-Px $c 8 4 $P['d']
    $breath = (($T % 8) -lt 4)
    for ($y = 4; $y -le 15; $y++) { for ($x = 2; $x -le 13; $x++) {
        $dx = ($x + 0.5) - $SeedCx; $dy = ($y + 0.5) - $SeedCy
        $r = [Math]::Sqrt($dx * $dx + $dy * $dy)
        if ($r -gt $SeedR) { continue }
        if ($r -ge ($SeedR - 0.95)) {
            $lit = - ($dx + $dy) / ([Math]::Max($r, 0.01) * 1.4142)
            $tone = if ($lit -gt 0.55) { 'a' } elseif ($lit -gt 0.1) { 'b' } elseif ($lit -gt -0.45) { 'c' } elseif ($lit -gt -0.8) { 'd' } else { 'e' }
            Set-Px $c $x $y $P[$tone]
        } elseif ($r -le 2.0) {
            $lit = - ($dx + $dy) / 1.4142
            $tone = if ($lit -gt 1.1) { 'p' } elseif ($lit -gt 0.2) { 'q' } elseif ($lit -gt -0.7) { 'r' } elseif ($lit -gt -1.3) { 's' } else { 't' }
            Set-Px $c $x $y $P[$tone]
        } elseif ($Planet -eq 'venus') {
            # the cloud glow: brightest around the pearl, with two darker bands that drift down one row every other frame
            $tone = if ($r -lt 2.7) { $(if ($breath) { 'f' } else { 'g' }) } elseif ($r -lt 3.3) { 'g' } else { 'h' }
            $band = (($y + [Math]::Floor($T / 2)) % 4)
            if ($band -eq 0 -and $r -ge 2.4) { $tone = $(if ($tone -eq 'h') { 'i' } else { 'h' }) }
            if ($r -ge 3.3 -and ($dx + $dy) -gt 2.4) { $tone = 'j' }
            Set-Px $c $x $y $P[$tone]
        } else {
            # the Sun's glare on the day side and the dark night side: the terminator sweeps from left to right over the loop
            $term = -3.6 + 7.2 * (($T % 8) / 7.0)
            $day = ($dx -gt $term)
            if ($day) {
                $tone = if ($r -lt 2.7) { $(if ($breath) { 'f' } else { 'g' }) } elseif ($r -lt 3.3) { 'g' } else { 'h' }
            } else {
                $tone = if ($r -lt 3.0) { 'i' } else { 'j' }
            }
            Set-Px $c $x $y $P[$tone]
        }
    } }
    # a reflection on the glass, top-left inside the rim
    Set-Px $c 5 7 $P['w']; Set-Px $c 6 6 $P['a']
    # the entangled pair: two violet sparks on opposite sides of the pearl, an eighth of a turn per frame, each with a paler trail;
    # Venus turns the Moon's way and Mercury the Martian way, both an eighth of a turn ahead, so no seed shares another's frames
    $dir = if ($Planet -eq 'venus') { 1.0 } else { -1.0 }
    $ang = $dir * [Math]::PI * 2 * (($T % 8) / 8.0) + [Math]::PI / 8
    foreach ($k in 0, 1) {
        $a = $ang + $k * [Math]::PI
        $sx = [int][Math]::Floor($SeedCx + 3.05 * [Math]::Cos($a)); $sy = [int][Math]::Floor($SeedCy + 3.05 * [Math]::Sin($a))
        $ta = $a - $dir * [Math]::PI / 4
        $tx = [int][Math]::Floor($SeedCx + 3.05 * [Math]::Cos($ta)); $ty = [int][Math]::Floor($SeedCy + 3.05 * [Math]::Sin($ta))
        if ($tx -ne $sx -or $ty -ne $sy) { Set-Px $c $tx $ty $P['x'] }
        Set-Px $c $sx $sy $P['u']
    }
    if ($Planet -eq 'venus') { Add-Outline $c -LitArgb (Hex '7A6034') -ShadeArgb (Hex '3A2C16') }
    else { Add-Outline $c -LitArgb (Hex '4E4E58') -ShadeArgb (Hex '24242A') }
    return $c
}

# ============================================================================================
#  RTG CELL: overlays for GTM's generator model on the EV hull
# ============================================================================================
#   A..D  steel of the cap, lit -> dark;  Y/Z the trefoil's yellow, lit and shaded;  T the trefoil's dark blades
#   g     a cold vent;  F..J  titanium fins, lit -> dark, R the gap between fins
#   1..3  the hot vents (dull red-orange, breathing)
$RtgPal = New-Pal @'
A=E2E6EC B=B4BAC4 C=838A96 D=525866 E=383C46
Y=F2D23C Z=C8A42A T=2E2A26
g=2C2F36
F=EEF2F6 G=C9CFD8 H=98A0AC I=6C7482 J=474E5A R=30343C
1=FF9A3C 2=E86A28 3=B44A1E
'@

# the radiation trefoil, 9x9, drawn by its geometry on a yellow disc: a dot, and three blades 54 degrees wide pointing up-left,
# up-right and down, with a gap ring between them and the dot
function Get-TrefoilCell {
    param([int]$X, [int]$Y)
    $dx = ($X + 0.5) - 4.5; $dy = 4.5 - ($Y + 0.5)
    $r = [Math]::Sqrt($dx * $dx + $dy * $dy)
    if ($r -gt 4.6) { return '' }
    if ($r -lt 1.0) { return 'T' }
    if ($r -ge 1.8 -and $r -le 3.9) {
        $deg = [Math]::Atan2($dy, $dx) * 180.0 / [Math]::PI
        if ($deg -lt 0) { $deg += 360.0 }
        foreach ($center in 30.0, 150.0, 270.0) {
            $d = [Math]::Abs($deg - $center)
            if ($d -gt 180.0) { $d = 360.0 - $d }
            if ($d -le 27.0) { return 'T' }
        }
    }
    return $(if (($dx + $dy) -gt 0) { 'Y' } else { 'Z' })
}

# the top: a round cap of steel lit from the top-left, the trefoil plate in the middle, and four vents at N, E, S and W. The cap is 13
# pixels wide (2..14) around the centre of pixel 8, so the 9x9 trefoil (4..12) sits exactly in it.
# $Hot: 0 idle (cold vents), 1..3 the glow level of the vents. $EmissiveOnly: only the hot vents (the emissive layer).
function New-RtgTop {
    param([int]$Hot, [switch]$EmissiveOnly)
    $c = New-Canvas
    $P = $RtgPal
    $cx = 8.5; $cy = 8.5
    if (-not $EmissiveOnly) {
        for ($y = 1; $y -le 15; $y++) { for ($x = 1; $x -le 15; $x++) {
            $dx = ($x + 0.5) - $cx; $dy = ($y + 0.5) - $cy
            $r = [Math]::Sqrt($dx * $dx + $dy * $dy)
            if ($r -gt 6.45) { continue }
            $lit = - ($dx + $dy) / ([Math]::Max($r, 0.01) * 1.4142)
            $tone = if ($lit -gt 0.45) { 'A' } elseif ($lit -gt -0.2) { 'B' } elseif ($lit -gt -0.7) { 'C' } else { 'D' }
            Set-Px $c $x $y $P[$tone]
        } }
        for ($j = 0; $j -lt 9; $j++) { for ($i = 0; $i -lt 9; $i++) {
            $t = Get-TrefoilCell $i $j
            if ($t -ne '') { Set-Px $c (4 + $i) (4 + $j) $P[$t] }
        } }
    }
    # four vents through the cap's rim: 2-pixel radial slots, cold or glowing
    $vents = @(@(8, 2), @(8, 3), @(8, 13), @(8, 14), @(2, 8), @(3, 8), @(13, 8), @(14, 8))
    foreach ($v in $vents) {
        if ($Hot -gt 0) { Set-Px $c $v[0] $v[1] $P[[string]$Hot] }
        elseif (-not $EmissiveOnly) { Set-Px $c $v[0] $v[1] $P['g'] }
    }
    return $c
}

# a side: six titanium fins (two pixels each, lit edge and body) over dark gaps, between a root bar and a top bar
function New-RtgFins {
    $c = New-Canvas
    $P = $RtgPal
    for ($x = 2; $x -le 13; $x++) {
        Set-Px $c $x 2 $(if ($x -le 7) { $P['G'] } else { $P['H'] })
        Set-Px $c $x 13 $(if ($x -le 7) { $P['H'] } else { $P['I'] })
    }
    for ($y = 3; $y -le 12; $y++) {
        for ($x = 2; $x -le 13; $x++) {
            $k = $x - 2
            if (($k % 2) -eq 0) {
                $tone = if ($y -eq 3) { 'F' } elseif ($y -le 7) { 'G' } else { 'H' }
            } else {
                $tone = if ($y -ge 11) { 'J' } else { 'R' }
            }
            Set-Px $c $x $y $P[$tone]
        }
    }
    Set-Px $c 2 2 $P['F']; Set-Px $c 13 13 $P['J']
    return $c
}

# ============================================================================================
#  BUILD
# ============================================================================================
if (Test-Want 'seeds') {
    foreach ($planet in 'venus', 'mercury') {
        $frames = @(); for ($f = 0; $f -lt 8; $f++) { $frames += New-PlanetSeedFrame $f $planet }
        $file = if ($planet -eq 'venus') { 'item/venusian_quantum_seed.png' } else { 'item/hermean_quantum_seed.png' }
        Out-Tex (Join-Frames $frames) $file 3
    }
}

if (Test-Want 'rtg') {
    Out-Tex (New-RtgTop 0) 'block/machines/rtg/overlay_top.png'
    $hot = @(3, 2, 1, 2)
    $active = @(); $emissive = @()
    foreach ($h in $hot) { $active += New-RtgTop $h; $emissive += New-RtgTop $h -EmissiveOnly }
    Out-Tex (Join-Frames $active) 'block/machines/rtg/overlay_top_active.png' 8
    Out-Tex (Join-Frames $emissive) 'block/machines/rtg/overlay_top_active_emissive.png' 8
    Out-Tex (New-RtgFins) 'block/machines/rtg/overlay_side.png'
    Out-Tex (New-RtgFins) 'block/machines/rtg/overlay_back.png'
}

# ============================================================================================
#  VERIFY what was written (size, binary alpha, no pure black, mcmeta vs frames, an animation that really animates, an emissive
#  layer that only lights pixels of its colour layer)
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
        $seen = @{}
        for ($f = 0; $f -lt $n; $f++) { $seen[(($img.P[($f * 256)..($f * 256 + 255)]) -join ',')] = 1 }
        if ($seen.Count -lt 3) { $msgs += "only $($seen.Count) distinct frames out of $n" }
    }
    if ($rel.EndsWith('_emissive.png')) {
        $colorPath = $path -replace '_emissive\.png$', '.png'
        $col = Read-Png $colorPath
        for ($i = 0; $i -lt $img.P.Length; $i++) {
            if (((($img.P[$i] -shr 24) -band 255) -ne 0) -and ($img.P[$i] -ne $col.P[$i])) { $msgs += 'emissive pixel outside its colour layer'; break }
        }
    }
    if ($msgs.Count -gt 0) { $problems++; Write-Warning "$rel : $($msgs -join '; ')" }
}

Write-Host "written $($written.Count) files under $OutRoot ($problems with warnings)"
foreach ($rel in $written) { Write-Host "  $rel" }

if ($Credits) {
    Write-Host ''
    foreach ($rel in $written) {
        Write-Host ("| ``pack/kubejs/assets/grindless/textures/$rel`` | Generated with tools/assets/$ScriptName (procedural pixel art, original) by the travel-and-network agent (IV-B5), 2026-10-25 | the pack's licence (pending; proposed CC BY-SA 4.0) |")
    }
}
if ($problems -gt 0) { exit 1 }
