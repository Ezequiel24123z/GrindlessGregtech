<#
.SYNOPSIS
  Procedural 16x16 pixel art for the AE2 network's EV step of Gregtech Grindless (GregTech style: top-left light,
  selective outlines).

.DESCRIPTION
  Every pixel is drawn by this script (palettes + small shading routines); nothing is copied or edited from GregTech
  Modern, AE2, GCYR or any other mod. Output is deterministic: re-running overwrites the same bytes.

  Writes (under pack/kubejs/assets/grindless/textures/):
    item/martian_quantum_seed.png(+.mcmeta)  (the Martian half of an Earth-Mars entangled AE2 pair, animated)

  It is the Martian sibling of the Lunar Quantum Seed (tools/assets/Build-MoonTextures.ps1, item/lunar_quantum_seed.png):
  the same sealed ampoule, so the two read as one family, but under a cap of rusty Martian rock, with the ender pearl in
  the red-orange glow of rare-earth ions (merrillite's europium glows red) instead of the pale helium-3 light.

  Run from the repo root (PowerShell 5.1 blocks unsigned scripts by default; this bypass only affects that process):
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-AE2InterplanetaryTextures.ps1
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-AE2InterplanetaryTextures.ps1 -Credits

  Conventions (same as the other item sets): transparent background, every pixel fully opaque or fully transparent, no
  pure black, animated textures are vertical 16x(16*n) strips with a .png.mcmeta.

.PARAMETER OutRoot
  Textures root. Default: <repo>/pack/kubejs/assets/grindless/textures
.PARAMETER Credits
  Also print the CREDITS.md "Assets" table rows for the files written.
#>
[CmdletBinding()]
param(
    [string]$OutRoot = '',
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

# --- Martian quantum seed: the Martian half of an Earth-Mars entangled AE2 pair (merrillite, an ender pearl and helium-3,
# made only on Mars). A sealed glass ampoule under a cap of rusty Martian basalt: a teal pearl floats in the red-orange glow
# of rare-earth ions, and two sparks circle it always on opposite sides (the entangled pair); the glow breathes.
# 8 frames, frametime 3.
#   K..O  the cap, oxidized basalt lit -> dark; k = a dark grain, y = an iron-oxide speck
#   a..e  the glass rim, lit -> dark (a warm cast from the glow inside)
#   f..j  the rare-earth glow, brightest around the pearl -> deepest on the shaded side
#   p..t  the ender pearl, lit -> dark
#   w     the glass reflection; u, x the sparks (violet, the ender pearl's colour) and their trails
$MarsSeedPal = New-Pal @'
K=D99A6C L=B8714A M=8F4E33 N=6A3524 O=48231A k=5A2C1E y=E8B24E
a=FFF6EE b=F2D6C6 c=D8A994 d=AE7766 e=7E4E44
f=FFF1D2 g=FFD08A h=FFA65A i=E8743A j=C2502C
p=86F6DA q=34CBA6 r=19937C s=0F6155 t=093C35
w=FFFFFF u=A27CFF x=D2BEFF
'@
$SeedCx = 8.0; $SeedCy = 10.0; $SeedR = 4.9

function New-MartianSeedFrame {
    param([int]$T)
    $c = New-Canvas
    $P = $MarsSeedPal
    # cap of Martian basalt (lit top-left, dark grains and an iron-oxide speck) over the sealed neck
    $cap = @(@(1, 6, 9), @(2, 5, 10), @(3, 5, 10))
    foreach ($row in $cap) {
        for ($x = $row[1]; $x -le $row[2]; $x++) {
            $tone = Get-SpanTone $x $row[1] $row[2]
            if ($row[0] -eq 3) { $tone = Get-ClampInt ($tone + 1) 0 4 }
            $col = $P[@('K', 'L', 'M', 'N', 'O')[$tone]]
            $n = Get-Noise $x $row[0] 0 59
            if ($n -gt 220) { $col = $P['k'] } elseif ($n -lt 18 -and $tone -le 2) { $col = $P['y'] }
            Set-Px $c $x $row[0] $col
        }
    }
    Set-Px $c 7 4 $P['b']; Set-Px $c 8 4 $P['d']
    # the bulb: glass rim lit from the top-left, the glow brighter around the pearl, the pearl itself
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
        } else {
            # the glow: brightest around the pearl, deeper towards the glass and on the shaded side
            $tone = if ($r -lt 2.7) { $(if ($breath) { 'f' } else { 'g' }) } elseif ($r -lt 3.3) { 'g' } else { 'h' }
            if ($r -ge 3.3 -and ($dx + $dy) -gt 1.5) { $tone = 'i' }
            if ($r -ge 3.3 -and ($dx + $dy) -gt 3.6) { $tone = 'j' }
            Set-Px $c $x $y $P[$tone]
        }
    } }
    # a reflection on the glass, top-left inside the rim
    Set-Px $c 5 7 $P['w']; Set-Px $c 6 6 $P['a']
    # the entangled pair: two violet sparks on opposite sides of the pearl, an eighth of a turn per frame, each with a paler
    # trail. They turn the other way round from the lunar seed's, so the two seeds never look like the same frames tinted.
    $ang = - [Math]::PI * 2 * (($T % 8) / 8.0) + [Math]::PI / 4
    foreach ($k in 0, 1) {
        $a = $ang + $k * [Math]::PI
        $sx = [int][Math]::Floor($SeedCx + 3.05 * [Math]::Cos($a)); $sy = [int][Math]::Floor($SeedCy + 3.05 * [Math]::Sin($a))
        $ta = $a + [Math]::PI / 4
        $tx = [int][Math]::Floor($SeedCx + 3.05 * [Math]::Cos($ta)); $ty = [int][Math]::Floor($SeedCy + 3.05 * [Math]::Sin($ta))
        if ($tx -ne $sx -or $ty -ne $sy) { Set-Px $c $tx $ty $P['x'] }
        Set-Px $c $sx $sy $P['u']
    }
    Add-Outline $c -LitArgb (Hex '7A3E2A') -ShadeArgb (Hex '3A1A12')
    return $c
}

# ============================================================================================
#  BUILD
# ============================================================================================
$seedFrames = @(); for ($f = 0; $f -lt 8; $f++) { $seedFrames += New-MartianSeedFrame $f }
Out-Tex (Join-Frames $seedFrames) 'item/martian_quantum_seed.png' 3

# ============================================================================================
#  VERIFY what was written (size, binary alpha, no pure black, mcmeta vs frames, an animation that really animates)
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
        if ($seen.Count -lt 4) { $msgs += "only $($seen.Count) distinct frames out of $n" }
    }
    if ($msgs.Count -gt 0) { $problems++; Write-Warning "$rel : $($msgs -join '; ')" }
}

Write-Host "written $($written.Count) files under $OutRoot ($problems with warnings)"
foreach ($rel in $written) { Write-Host "  $rel" }

if ($Credits) {
    Write-Host ''
    foreach ($rel in $written) {
        Write-Host ("| ``pack/kubejs/assets/grindless/textures/$rel`` | Generated with tools/assets/$ScriptName (procedural pixel art, original) by the ae2-interplanetary agent, 2026-10-25 | the pack's licence (pending; proposed CC BY-SA 4.0) |")
    }
}
