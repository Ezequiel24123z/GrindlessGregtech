<#
.SYNOPSIS
  Procedural 16x16 pixel art for the MAX membrane line controller face, of Gregtech Grindless (package MAX-B1).

.DESCRIPTION
  Every pixel is drawn by this script; nothing is copied or edited from GregTech Modern or any other mod. Output is deterministic.
  Same method and steel bezel as Build-OpVTetronOpticsTextures.ps1.

  Writes (under pack/kubejs/assets/grindless/textures/):
    block/multiblock/membrane_line/overlay_front.png, overlay_front_active.png(+.mcmeta), overlay_front_active_emissive.png(+.mcmeta)

  Face: a film web threaded over three rollers; working (4 frames, frametime 4) a bright patch of film travels along the web and the
  middle roller's CVD glow pulses. The *_emissive layer holds only the glow and the lamp.

  Conventions: transparent background, outer 1 px ring of the face empty, every pixel fully opaque or fully transparent, none pure
  black, emissive layer a subset of the colour layer. The final check fails the run (non-zero exit) if a written file breaks one.

  Run from the repo root:
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-MaxMembraneLineTextures.ps1

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

# the three rollers (centre x, y) and the web path the bright patch follows, left to right along the film
$Rollers = @(@(5, 5), @(8, 7), @(11, 5))
$Web = @(@(4, 6), @(6, 6), @(7, 6), @(9, 6), @(10, 6), @(12, 6))
$WebPath = @(@(5, 6), @(7, 6), @(8, 6), @(9, 6))

function New-Face {
    param([int]$Frame, [bool]$Active)
    $c = New-Bezel
    $e = New-Canvas
    for ($y = 4; $y -le 9; $y++) { for ($x = 4; $x -le 11; $x++) { Set-Px $c $x $y $Pit } }
    $film = Hex 'C8D8E8'; $roller = Hex '8090A0'; $cold = Hex '507090'
    # film web along y 6, a roller under each end and one above the middle
    for ($x = 4; $x -le 11; $x++) { Set-Px $c $x 6 $film }
    foreach ($r in $Rollers) { Set-Px $c $r[0] $r[1] $roller; Set-Px $c ($r[0] + 1) $r[1] $roller }
    foreach ($x in 4, 5, 10, 11) { Set-Px $c $x 8 $cold }
    if ($Active) {
        $glow = Hex 'FFB060'; $patch = Hex 'FFF8D0'
        $x = 4 + ($Frame * 2)
        Set-Both $c $e $x 6 $patch
        Set-Both $c $e ($x + 1) 6 $patch
        Set-Both $c $e 8 (7 + ($Frame % 2)) $glow
        Set-Both $c $e 7 (7 + ($Frame % 2)) $glow
    }
    Set-Px $c 7 12 $(if ($Active) { $LampOn } else { $LampOff })
    Set-Px $c 8 12 $(if ($Active) { $LampOn } else { $LampOff })
    if ($Active) { Set-Px $e 7 12 $LampOn; Set-Px $e 8 12 $LampOn }
    for ($i = 0; $i -lt 16; $i++) { foreach ($p in @(@($i, 0), @($i, 15), @(0, $i), @(15, $i))) { Set-Px $c $p[0] $p[1] 0; Set-Px $e $p[0] $p[1] 0 } }
    return @{ C = $c; E = $e }
}

$Dir = 'block/multiblock/membrane_line'
$idle = New-Face 0 $false
Out-Tex $idle.C "$Dir/overlay_front.png"
$col = @(); $emi = @()
for ($f = 0; $f -lt $Frames; $f++) { $a = New-Face $f $true; $col += , $a.C; $emi += , $a.E }
Out-Tex (Join-Frames $col) "$Dir/overlay_front_active.png" $FrameTime
Out-Tex (Join-Frames $emi) "$Dir/overlay_front_active_emissive.png" $FrameTime

$problems = New-Object System.Collections.Generic.List[string]
function Test-Pixels {
    param($Png, [string]$Name)
    for ($y = 0; $y -lt $Png.H; $y++) {
        for ($x = 0; $x -lt $Png.W; $x++) {
            $v = $Png.P[$y * $Png.W + $x]; $a = ($v -shr 24) -band 255
            $onRing = ((($x % 16) -eq 0) -or (($x % 16) -eq 15) -or (($y % 16) -eq 0) -or (($y % 16) -eq 15))
            if ($a -ne 0 -and $a -ne 255) { $problems.Add("${Name}: partial alpha at $x,$y") }
            if ($a -eq 255 -and ($v -band 0xFFFFFF) -eq 0) { $problems.Add("${Name}: pure black at $x,$y") }
            if ($onRing -and $a -ne 0) { $problems.Add("${Name}: ring pixel at $x,$y") }
        }
    }
}
$png = @{}
foreach ($n in 'overlay_front', 'overlay_front_active', 'overlay_front_active_emissive') { $png[$n] = Read-Png (Join-Path $OutRoot ("$Dir/$n.png" -replace '/', '\')) }
foreach ($n in $png.Keys) { Test-Pixels $png[$n] "$Dir/$n" }
$cl = $png['overlay_front_active']; $em = $png['overlay_front_active_emissive']
for ($i = 0; $i -lt $cl.P.Length; $i++) { if ($em.P[$i] -ne 0 -and $em.P[$i] -ne $cl.P[$i]) { $problems.Add("${Dir}: emissive differs from colour at $i") } }
for ($f = 0; $f -lt $Frames - 1; $f++) {
    $same = $true
    for ($i = 0; $i -lt 256; $i++) { if ($cl.P[$f * 256 + $i] -ne $cl.P[($f + 1) * 256 + $i]) { $same = $false; break } }
    if ($same) { $problems.Add("${Dir}: frame $f repeats frame $($f + 1)") }
}
if ($problems.Count -gt 0) { $problems | Select-Object -First 20 | ForEach-Object { Write-Error $_ -ErrorAction Continue }; exit 1 }

Write-Host "$ScriptName wrote $($written.Count) files"
if ($Credits) {
    foreach ($w in $written) { Write-Host "| pack/kubejs/assets/grindless/textures/$w | drawn procedurally by tools/assets/$ScriptName | ours |" }
}
