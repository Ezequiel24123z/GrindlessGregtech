<#
.SYNOPSIS
  Procedural 16x16 pixel art for UHV's Dyson swarm (package UHV-B3) of Gregtech Grindless: the two items and the swarm segment foundry,
  swarm control station and solar probe bay controller faces.

.DESCRIPTION
  Every pixel is drawn by this script (small routines and palettes); nothing is copied or edited from GregTech Modern or any other mod.
  Output is deterministic. Same method and steel bezel as the earlier sets (Build-UHVMercuryTextures.ps1).

  Writes (under pack/kubejs/assets/grindless/textures/):
    item/sodium_potassium_heat_pipe.png, item/solar_probe.png
    block/multiblock/swarm_segment_foundry/overlay_front.png, overlay_front_active.png(+.mcmeta), overlay_front_active_emissive.png(+.mcmeta)
    block/multiblock/swarm_control_station/ the same three files
    block/multiblock/solar_probe_bay/ the same three files

  Foundry face: a bezel round a window with the gantry rail and its head over a blue film panel; working (4 frames, frametime 4), the
  head travels along the rail welding with a cyan spark. Station face: the Sun in the window ringed by swarm segments; working, the Sun
  glows and the segments circle it. Bay face: the launch rail climbing to the Sun in the window's corner; working, the Sun glows and the
  probe rides the rail towards it with a hot trail. The *_emissive layer holds only the glow and the lamp.

  Conventions (faces): transparent background, outer 1 px ring empty, every pixel fully opaque or fully transparent, none pure black,
  emissive layer a subset of the colour layer. The final check fails the run (non-zero exit) if a written face breaks one.

  Run from the repo root:
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-UHVSwarmTextures.ps1

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

$RepoRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..'))
if (-not $OutRoot) { $OutRoot = Join-Path $RepoRoot 'pack\kubejs\assets\grindless\textures' }
$OutRoot = [System.IO.Path]::GetFullPath($OutRoot)
$ScriptName = Split-Path -Leaf $PSCommandPath
$FrameTime = 4
$Frames = 4

$written = New-Object System.Collections.Generic.List[string]
function Out-Tex {
    param($Canvas, [string]$Rel, [int]$Time = 0)
    $path = Join-Path $OutRoot ($Rel -replace '/', '\')
    for ($try = 1; $try -le 6; $try++) {
        try { Save-Png $Canvas $path; if ($Time -gt 0) { Save-Mcmeta ($path + '.mcmeta') $Time }; break }
        catch [System.IO.IOException] { if ($try -eq 6) { throw }; Start-Sleep -Milliseconds (250 * $try) }
    }
    $written.Add($Rel)
    if ($Time -gt 0) { $written.Add($Rel + '.mcmeta') }
}

# ---------------------------------------------------------------- items

# The heat pipe, lying diagonally (bottom left to top right along x + y = 15): a tungsten steel tube 5 px across (K outline, L lit, M
# body, D shade), its open end at the bottom left showing the molybdenum wick (W) round the NaK (N), radiator fins (F) at the top right.
$pipe = New-Canvas
$K = Hex '26282E'; $L = Hex 'A8B0BC'; $M = Hex '78808C'; $D = Hex '4C525C'
$W = Hex '9C8C78'; $N = Hex 'D8D0A0'; $F = Hex 'C4CCD6'
for ($y = 0; $y -lt 16; $y++) {
    for ($x = 0; $x -lt 16; $x++) {
        $p = $x + $y - 15; $a = $x - $y
        $fin = ($a -ge 3 -and $a -le 9 -and ($a % 2) -eq 1)
        if ([Math]::Abs($a) -gt 11) { continue }
        if ([Math]::Abs($p) -gt 2) {
            if ($fin -and [Math]::Abs($p) -le 4) { Set-Px $pipe $x $y $(if ([Math]::Abs($p) -eq 4) { $D } else { $F }) }
            continue
        }
        if ([Math]::Abs($p) -eq 2 -or [Math]::Abs($a) -ge 10) { Set-Px $pipe $x $y $K; continue }
        if ($a -le -8) { Set-Px $pipe $x $y $(if ($p -eq 0) { $N } else { $W }); continue }
        Set-Px $pipe $x $y $(if ($p -lt 0) { $L } elseif ($p -eq 0) { $M } else { $D })
    }
}
Out-Tex $pipe 'item/sodium_potassium_heat_pipe.png'

# The solar probe: a white carbon-carbon heat shield (disc, S shade at its lower right) facing the Sun at the top left, the gold-foiled
# body (G, C shade) behind it with two blue solar wings (B) and a magnetometer boom (R) trailing to the bottom right.
$probe = New-Canvas
$Ko = Hex '2A2A30'; $Wh = Hex 'ECE8E0'; $Sh = Hex 'B8B2A6'
$G = Hex 'D4A838'; $C = Hex 'A07820'; $B = Hex '2E4E9E'; $Bl = Hex '5A7CC8'; $R = Hex '8C9098'
Set-Rect $probe 7 7 6 6 $Ko
Set-Rect $probe 8 8 4 4 $G
Set-Px $probe 11 10 $C; Set-Px $probe 10 11 $C; Set-Px $probe 11 11 $C
Set-Rect $probe 13 8 2 3 $B; Set-Px $probe 13 8 $Bl
Set-Rect $probe 8 13 3 2 $B; Set-Px $probe 8 13 $Bl
Set-Px $probe 13 13 $R; Set-Px $probe 14 14 $R
for ($y = 0; $y -lt 16; $y++) {
    for ($x = 0; $x -lt 16; $x++) {
        $d2 = ($x - 6) * ($x - 6) + ($y - 6) * ($y - 6)
        if ($d2 -gt 30) { continue }
        if ($d2 -gt 20) { Set-Px $probe $x $y $Ko; continue }
        Set-Px $probe $x $y $(if (($x + $y) -ge 14) { $Sh } else { $Wh })
    }
}
Out-Tex $probe 'item/solar_probe.png'

# ---------------------------------------------------------------- controller faces

function Set-Both {
    param($C, $E, [int]$X, [int]$Y, [int]$Argb)
    Set-Px $C $X $Y $Argb; Set-Px $E $X $Y $Argb
}

$Lit = Hex 'B0B0B0'; $Mid = Hex '707070'; $Dark = Hex '404040'; $Deep = Hex '222222'; $Pit = Hex '161616'
$LampOn = Hex '62FF86'; $LampOff = Hex '0C6B2E'

# The steel bezel: x1..14, y1..14, bevelled from the top left, with a dark panel inside and a lamp under the window.
function New-Bezel {
    $c = New-Canvas
    Set-Rect $c 1 1 14 14 $Dark
    for ($i = 1; $i -le 14; $i++) {
        Set-Px $c $i 1 $Lit; Set-Px $c 1 $i $Lit
        Set-Px $c $i 14 $Deep; Set-Px $c 14 $i $Deep
    }
    Set-Rect $c 2 2 12 12 $Mid
    Set-Rect $c 3 3 10 8 $Deep
    Set-Rect $c 3 11 10 3 $Dark
    return $c
}

# the 12 cells round a 2x2 hub at (x, y)..(x+1, y+1), clockwise from the top left
function Get-Rim {
    param([int]$X, [int]$Y)
    return @(@(($X - 1), ($Y - 1)), @($X, ($Y - 1)), @(($X + 1), ($Y - 1)), @(($X + 2), ($Y - 1)), @(($X + 2), $Y), @(($X + 2), ($Y + 1)),
        @(($X + 2), ($Y + 2)), @(($X + 1), ($Y + 2)), @($X, ($Y + 2)), @(($X - 1), ($Y + 2)), @(($X - 1), ($Y + 1)), @(($X - 1), $Y))
}

function New-Face {
    param([string]$Kind, [int]$Frame, [bool]$Active)
    $c = New-Bezel
    $e = New-Canvas
    for ($y = 4; $y -le 9; $y++) { for ($x = 4; $x -le 11; $x++) { Set-Px $c $x $y $Pit } }
    if ($Kind -eq 'foundry') {
        # the gantry rail (y4), a blue film panel on the deck (y8..9) and the head (2 px wide, y5..6) with its nozzle (y7)
        for ($x = 4; $x -le 11; $x++) { Set-Px $c $x 4 (Hex '8A949E') }
        for ($x = 4; $x -le 11; $x++) { Set-Px $c $x 8 (Hex '3A5AA8'); Set-Px $c $x 9 (Hex '24386E') }
        $hx = if ($Active) { @(4, 6, 8, 10)[$Frame] } else { 7 }
        Set-Rect $c $hx 5 2 2 (Hex 'C8A040')
        Set-Px $c $hx 7 (Hex '6C727A')
        if ($Active) {
            Set-Both $c $e ($hx + 1) 7 (Hex 'E8FFFF')
            Set-Both $c $e ($hx + 1) 8 (Hex '7CF0FF')
        }
        else { Set-Px $c ($hx + 1) 7 (Hex '6C727A') }
    }
    elseif ($Kind -eq 'station') {
        # the Sun as a 2x2 hub at x7..8, y6..7, the swarm on the 12 cells round it: three segments, one in four cells
        $sun = if ($Active) { Hex 'FFE68A' } else { Hex '8A5A24' }
        for ($y = 6; $y -le 7; $y++) { for ($x = 7; $x -le 8; $x++) { if ($Active) { Set-Both $c $e $x $y $sun } else { Set-Px $c $x $y $sun } } }
        $cells = Get-Rim 7 6
        $turn = if ($Active) { $Frame } else { 0 }
        for ($i = 0; $i -lt 12; $i++) {
            $p = $cells[$i]
            $k = (($i - $turn) % 4 + 4) % 4
            if ($k -ne 0) { continue }
            if ($Active) { Set-Both $c $e $p[0] $p[1] (Hex 'C8E4FF') } else { Set-Px $c $p[0] $p[1] (Hex '5A6470') }
        }
        if ($Active) {
            # the receiver beam: a laser line from the swarm down to the deck under the window, flickering
            $beam = if (($Frame % 2) -eq 0) { Hex 'FF6A5A' } else { Hex 'FF9A7A' }
            Set-Both $c $e 4 9 $beam; Set-Both $c $e 11 9 $beam
        }
    }
    else {
        # the Sun in the top right corner (x10..11, y4..5) and the launch rail climbing to it from the bottom left
        $sun = if ($Active) { Hex 'FFD25A' } else { Hex '7A4E1E' }
        for ($y = 4; $y -le 5; $y++) { for ($x = 10; $x -le 11; $x++) { if ($Active) { Set-Both $c $e $x $y $sun } else { Set-Px $c $x $y $sun } } }
        $rail = @(@(4, 9), @(5, 9), @(6, 8), @(7, 8), @(8, 7), @(9, 6))
        foreach ($r in $rail) { Set-Px $c $r[0] $r[1] (Hex '5C646E') }
        $stops = @(@(5, 8), @(6, 7), @(8, 6), @(9, 5))
        $s = if ($Active) { $stops[$Frame] } else { @(5, 8) }
        Set-Px $c $s[0] $s[1] (Hex 'ECE8E0')
        if ($Active -and $Frame -gt 0) {
            # the probe's heat shield glows hotter as it nears the Sun; its trail behind it
            $prev = $stops[$Frame - 1]
            Set-Both $c $e $prev[0] $prev[1] (Hex 'FF8C28')
            Set-Both $c $e $s[0] $s[1] $(if ($Frame -eq 3) { Hex 'FFF4D0' } else { Hex 'FFE0A0' })
        }
    }
    # run lamp under the window
    Set-Px $c 7 12 $(if ($Active) { $LampOn } else { $LampOff })
    Set-Px $c 8 12 $(if ($Active) { $LampOn } else { $LampOff })
    if ($Active) { Set-Px $e 7 12 $LampOn; Set-Px $e 8 12 $LampOn }
    # nothing may sit on the outer ring
    for ($i = 0; $i -lt 16; $i++) { foreach ($p in @(@($i, 0), @($i, 15), @(0, $i), @(15, $i))) { Set-Px $c $p[0] $p[1] 0; Set-Px $e $p[0] $p[1] 0 } }
    return @{ C = $c; E = $e }
}

$kinds = @(
    @{ Kind = 'foundry'; Dir = 'block/multiblock/swarm_segment_foundry' },
    @{ Kind = 'station'; Dir = 'block/multiblock/swarm_control_station' },
    @{ Kind = 'bay'; Dir = 'block/multiblock/solar_probe_bay' }
)
foreach ($k in $kinds) {
    $idle = New-Face $k.Kind 0 $false
    Out-Tex $idle.C "$($k.Dir)/overlay_front.png"
    $col = @(); $emi = @()
    for ($f = 0; $f -lt $Frames; $f++) { $a = New-Face $k.Kind $f $true; $col += , $a.C; $emi += , $a.E }
    Out-Tex (Join-Frames $col) "$($k.Dir)/overlay_front_active.png" $FrameTime
    Out-Tex (Join-Frames $emi) "$($k.Dir)/overlay_front_active_emissive.png" $FrameTime
}

# self-check: ring empty, alpha 0 or 255, nothing pure black, emissive a subset of the colour layer, no two frames alike
$problems = New-Object System.Collections.Generic.List[string]
foreach ($k in $kinds) {
    $png = @{}
    foreach ($n in 'overlay_front', 'overlay_front_active', 'overlay_front_active_emissive') { $png[$n] = Read-Png (Join-Path $OutRoot ("$($k.Dir)/$n.png" -replace '/', '\')) }
    foreach ($n in $png.Keys) {
        $c = $png[$n]
        for ($y = 0; $y -lt $c.H; $y++) {
            for ($x = 0; $x -lt $c.W; $x++) {
                $v = $c.P[$y * $c.W + $x]; $a = ($v -shr 24) -band 255
                $ring = ((($x % 16) -eq 0) -or (($x % 16) -eq 15) -or (($y % 16) -eq 0) -or (($y % 16) -eq 15))
                if ($a -ne 0 -and $a -ne 255) { $problems.Add("$($k.Dir)/${n}: partial alpha at $x,$y") }
                if ($a -eq 255 -and ($v -band 0xFFFFFF) -eq 0) { $problems.Add("$($k.Dir)/${n}: pure black at $x,$y") }
                if ($ring -and $a -ne 0) { $problems.Add("$($k.Dir)/${n}: ring pixel at $x,$y") }
            }
        }
    }
    $col = $png['overlay_front_active']; $em = $png['overlay_front_active_emissive']
    for ($i = 0; $i -lt $col.P.Length; $i++) { if ($em.P[$i] -ne 0 -and $em.P[$i] -ne $col.P[$i]) { $problems.Add("$($k.Dir): emissive differs from colour at $i") } }
    for ($f = 0; $f -lt $Frames - 1; $f++) {
        $same = $true
        for ($i = 0; $i -lt 256; $i++) { if ($col.P[$f * 256 + $i] -ne $col.P[($f + 1) * 256 + $i]) { $same = $false; break } }
        if ($same) { $problems.Add("$($k.Dir): frame $f repeats frame $($f + 1)") }
    }
}
if ($problems.Count -gt 0) { $problems | Select-Object -First 20 | ForEach-Object { Write-Error $_ -ErrorAction Continue }; exit 1 }

Write-Host "$ScriptName wrote $($written.Count) files"
if ($Credits) {
    foreach ($w in $written) { Write-Host "| pack/kubejs/assets/grindless/textures/$w | drawn procedurally by tools/assets/$ScriptName | ours |" }
}
