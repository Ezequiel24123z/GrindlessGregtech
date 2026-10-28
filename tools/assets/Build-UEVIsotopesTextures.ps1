<#
.SYNOPSIS
  Procedural 16x16 pixel art for the UEV calutron controller face and the four isotope items of Gregtech Grindless.

.DESCRIPTION
  Every pixel is drawn by this script (palettes and small routines); nothing is copied or edited from GregTech Modern or any
  other mod. Output is deterministic. Same method and steel bezel as Build-UHVTranscuriumTextures.ps1.

  Writes (under pack/kubejs/assets/grindless/textures/):
    block/multiblock/calutron/overlay_front.png, overlay_front_active.png(+.mcmeta), overlay_front_active_emissive.png(+.mcmeta)
    item/ca48_oven_charge.png, plutonium_oxide_target.png, irradiated_plutonium_target.png, plutonium_244_target.png

  Calutron face: a steel bezel round a window onto the racetrack, a half ring of the magnet; idle, the ion beam is dark. Working
  (4 frames, frametime 4), a violet ion bunch runs round the arc and the collector pocket glows; the run lamp is green.
  The *_emissive layer holds only the glow and the lamp.
  Items: a platinum-foil disc with a pale calcium pellet; a zircaloy rod holding grey-pink oxide pellets; the same rod glowing
  after irradiation; an aluminium foil with a red-pink plutonium deposit.

  Conventions: transparent background, outer 1 px ring empty, every pixel fully opaque or fully transparent, none pure black,
  emissive layer a subset of the colour layer. The final check fails the run (non-zero exit) if a written file breaks one.

  Run from the repo root:
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-UEVIsotopesTextures.ps1

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
$Dir = 'block/multiblock/calutron'
$Items = @('ca48_oven_charge', 'plutonium_oxide_target', 'irradiated_plutonium_target', 'plutonium_244_target')

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

function Set-Both {
    param($C, $E, [int]$X, [int]$Y, [int]$Argb)
    Set-Px $C $X $Y $Argb; Set-Px $E $X $Y $Argb
}

$Lit = Hex 'B0B0B0'; $Mid = Hex '707070'; $Dark = Hex '404040'; $Deep = Hex '222222'; $Pit = Hex '161616'
$LampOn = Hex '62FF86'; $LampOff = Hex '0C6B2E'

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

# the racetrack arc, clockwise from the left of the window: window x4..11, y4..9
$Arc = @(@(4, 9), @(4, 8), @(4, 7), @(4, 6), @(5, 5), @(6, 4), @(7, 4), @(8, 4), @(9, 4), @(10, 5), @(11, 6), @(11, 7), @(11, 8), @(11, 9))

function New-Face {
    param([int]$Frame, [bool]$Active)
    $c = New-Bezel
    $e = New-Canvas
    for ($y = 4; $y -le 9; $y++) { for ($x = 4; $x -le 11; $x++) { Set-Px $c $x $y $Pit } }
    foreach ($p in $Arc) { Set-Px $c $p[0] $p[1] (Hex '2C2A44') }
    # the collector pocket at the foot of the arc
    Set-Px $c 8 9 (Hex '3A3C4C'); Set-Px $c 7 9 (Hex '3A3C4C')
    if ($Active) {
        $beam = @((Hex 'F0E0FF'), (Hex 'B484F0'), (Hex '6C3CC0'))
        for ($k = 0; $k -lt 3; $k++) {
            $p = $Arc[($Frame * 3 + $k) % $Arc.Count]
            Set-Both $c $e $p[0] $p[1] $beam[$k]
        }
        Set-Both $c $e 7 9 (Hex '78E0F0'); Set-Both $c $e 8 9 (Hex '3CA8C8')
    }
    Set-Px $c 7 12 $(if ($Active) { $LampOn } else { $LampOff })
    Set-Px $c 8 12 $(if ($Active) { $LampOn } else { $LampOff })
    if ($Active) { Set-Px $e 7 12 $LampOn; Set-Px $e 8 12 $LampOn }
    for ($i = 0; $i -lt 16; $i++) { foreach ($p in @(@($i, 0), @($i, 15), @(0, $i), @(15, $i))) { Set-Px $c $p[0] $p[1] 0; Set-Px $e $p[0] $p[1] 0 } }
    return @{ C = $c; E = $e }
}

function New-Item16 {
    param([string]$Name)
    $c = New-Canvas
    switch ($Name) {
        'ca48_oven_charge' {
            $pt = @((Hex 'E4E8EC'), (Hex 'B4BCC4'), (Hex '7C848C'))
            for ($y = 3; $y -le 12; $y++) { for ($x = 3; $x -le 12; $x++) {
                $d = [Math]::Max([Math]::Abs(2 * $x - 15), [Math]::Abs(2 * $y - 15))
                if ($d -le 9) { Set-Px $c $x $y $(if ($x + $y -lt 13) { $pt[0] } elseif ($x + $y -lt 17) { $pt[1] } else { $pt[2] }) }
            } }
            Set-Rect $c 6 6 4 4 (Hex 'D8D0B0'); Set-Rect $c 7 7 2 2 (Hex 'F0E8CC')
        }
        'plutonium_oxide_target' {
            Set-Rect $c 7 2 2 12 (Hex '9AA0A4'); Set-Rect $c 7 2 1 12 (Hex 'C4C8CC'); Set-Rect $c 6 2 4 1 (Hex '70767C'); Set-Rect $c 6 13 4 1 (Hex '70767C')
            for ($y = 4; $y -le 11; $y += 2) { Set-Rect $c 7 $y 2 1 (Hex 'A08894') }
        }
        'irradiated_plutonium_target' {
            Set-Rect $c 7 2 2 12 (Hex '8A8E90'); Set-Rect $c 6 2 4 1 (Hex '5C6064'); Set-Rect $c 6 13 4 1 (Hex '5C6064')
            for ($y = 4; $y -le 11; $y += 2) { Set-Rect $c 7 $y 2 1 (Hex '78E8F8') }
            Set-Px $c 6 7 (Hex '3C9CC0'); Set-Px $c 9 8 (Hex '3C9CC0')
        }
        default {
            Set-Rect $c 3 3 10 10 (Hex 'C4C8CE'); Set-Rect $c 3 3 10 1 (Hex 'E4E8EE'); Set-Rect $c 3 12 10 1 (Hex '8C9096')
            Set-Rect $c 5 5 6 6 (Hex 'C04860'); Set-Rect $c 6 6 4 4 (Hex 'E0708A'); Set-Px $c 7 7 (Hex 'F4A0B4')
        }
    }
    return $c
}

$idle = New-Face 0 $false
Out-Tex $idle.C "$Dir/overlay_front.png"
$col = @(); $emi = @()
for ($f = 0; $f -lt $Frames; $f++) { $a = New-Face $f $true; $col += , $a.C; $emi += , $a.E }
Out-Tex (Join-Frames $col) "$Dir/overlay_front_active.png" $FrameTime
Out-Tex (Join-Frames $emi) "$Dir/overlay_front_active_emissive.png" $FrameTime
foreach ($i in $Items) { Out-Tex (New-Item16 $i) "item/$i.png" }

# self-check: ring empty, alpha 0 or 255, nothing pure black, emissive a subset of the colour layer, no two frames alike
$problems = New-Object System.Collections.Generic.List[string]
$names = @("$Dir/overlay_front", "$Dir/overlay_front_active", "$Dir/overlay_front_active_emissive") + ($Items | ForEach-Object { "item/$_" })
$png = @{}
foreach ($n in $names) {
    $c = Read-Png (Join-Path $OutRoot ("$n.png" -replace '/', '\'))
    $png[$n] = $c
    $solid = 0
    for ($y = 0; $y -lt $c.H; $y++) {
        for ($x = 0; $x -lt $c.W; $x++) {
            $v = $c.P[$y * $c.W + $x]; $a = ($v -shr 24) -band 255
            $ring = ((($x % 16) -eq 0) -or (($x % 16) -eq 15) -or (($y % 16) -eq 0) -or (($y % 16) -eq 15))
            if ($a -ne 0 -and $a -ne 255) { $problems.Add("${n}: partial alpha at $x,$y") }
            if ($a -eq 255 -and ($v -band 0xFFFFFF) -eq 0) { $problems.Add("${n}: pure black at $x,$y") }
            if ($ring -and $a -ne 0) { $problems.Add("${n}: ring pixel at $x,$y") }
            if ($a -eq 255) { $solid++ }
        }
    }
    if ($solid -eq 0) { $problems.Add("${n}: empty") }
}
$cl = $png["$Dir/overlay_front_active"]; $em = $png["$Dir/overlay_front_active_emissive"]
for ($i = 0; $i -lt $cl.P.Length; $i++) { if ($em.P[$i] -ne 0 -and $em.P[$i] -ne $cl.P[$i]) { $problems.Add("emissive differs from colour at $i") } }
for ($f = 0; $f -lt $Frames - 1; $f++) {
    $same = $true
    for ($i = 0; $i -lt 256; $i++) { if ($cl.P[$f * 256 + $i] -ne $cl.P[($f + 1) * 256 + $i]) { $same = $false; break } }
    if ($same) { $problems.Add("frame $f repeats frame $($f + 1)") }
}
if ($problems.Count -gt 0) { $problems | Select-Object -First 20 | ForEach-Object { Write-Error $_ -ErrorAction Continue }; exit 1 }

Write-Host "$ScriptName wrote $($written.Count) files"
if ($Credits) {
    foreach ($w in $written) { Write-Host "| pack/kubejs/assets/grindless/textures/$w | drawn procedurally by tools/assets/$ScriptName | ours |" }
}
