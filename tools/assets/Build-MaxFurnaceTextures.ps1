<#
.SYNOPSIS
  Procedural 16x16 pixel art for the MAX cluster-light furnace controller face and the nsc_planetesimal item (package MAX-R1) of Gregtech Grindless.

.DESCRIPTION
  Every pixel is drawn by this script; nothing is copied or edited from GregTech Modern or any other mod. Output is deterministic.
  Same method and steel bezel as Build-MaxInterferometerTextures.ps1.

  Writes (under pack/kubejs/assets/grindless/textures/):
    block/multiblock/cluster_light_furnace/overlay_front.png, overlay_front_active.png(+.mcmeta), overlay_front_active_emissive.png(+.mcmeta)
    item/nsc_planetesimal.png

  Face: a hearth bowl with a focused beam. Working (4 frames, frametime 4) the beam pulses and the bloom in the bowl glows. The item is a
  grey, cratered rock with one molten vein.

  Conventions: transparent background, outer 1 px ring empty, every pixel fully opaque or fully transparent, none pure black, emissive
  layer a subset of the colour layer. The final check fails the run (non-zero exit) if a written file breaks one.

  Run from the repo root:
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-MaxFurnaceTextures.ps1

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
    $dir = Split-Path -Parent $path
    if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir | Out-Null }
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

function New-Face {
    param([int]$Frame, [bool]$Active)
    $c = New-Bezel
    $e = New-Canvas
    for ($y = 4; $y -le 9; $y++) { for ($x = 4; $x -le 11; $x++) { Set-Px $c $x $y $Pit } }
    $bowl = Hex '8A6A50'
    foreach ($x in 5..10) { Set-Px $c $x 9 $bowl }
    foreach ($y in 7..8) { Set-Px $c 4 $y $bowl; Set-Px $c 11 $y $bowl }
    $beam = Hex '7098C8'
    foreach ($y in 4..6) { Set-Px $c 7 $y $beam; Set-Px $c 8 $y $beam }
    if ($Active) {
        $glow = Hex 'FFD870'; $halo = Hex 'FF8040'
        $len = 4 + ($Frame % 3)
        foreach ($y in 4..$len) { Set-Both $c $e 7 $y $glow; Set-Both $c $e 8 $y $glow }
        foreach ($x in 5..10) { Set-Both $c $e $x 8 $halo }
        Set-Both $c $e (6 + ($Frame % 4)) 7 $glow
    }
    $lamp = $(if ($Active) { $LampOn } else { $LampOff })
    Set-Px $c 7 12 $lamp; Set-Px $c 8 12 $lamp
    if ($Active) { Set-Px $e 7 12 $LampOn; Set-Px $e 8 12 $LampOn }
    for ($i = 0; $i -lt 16; $i++) { foreach ($p in @(@($i, 0), @($i, 15), @(0, $i), @(15, $i))) { Set-Px $c $p[0] $p[1] 0; Set-Px $e $p[0] $p[1] 0 } }
    return @{ C = $c; E = $e }
}

function New-Rock {
    $c = New-Canvas
    $body = Hex '6E6A66'; $light = Hex '9A948C'; $shade = Hex '48443F'; $crater = Hex '2E2B28'; $vein = Hex 'E8782C'
    for ($y = 2; $y -le 13; $y++) {
        for ($x = 2; $x -le 13; $x++) {
            $dx = $x - 7.5; $dy = $y - 7.5
            if (($dx * $dx + $dy * $dy) -le 28) { Set-Px $c $x $y $body }
        }
    }
    foreach ($p in @(@(5, 4), @(6, 3), @(7, 3), @(4, 5), @(5, 5), @(6, 4))) { Set-Px $c $p[0] $p[1] $light }
    foreach ($p in @(@(10, 12), @(11, 11), @(12, 10), @(9, 12), @(11, 12), @(12, 11))) { Set-Px $c $p[0] $p[1] $shade }
    foreach ($p in @(@(9, 5), @(10, 5), @(9, 6), @(5, 9), @(6, 9), @(5, 10))) { Set-Px $c $p[0] $p[1] $crater }
    foreach ($p in @(@(4, 11), @(5, 11), @(6, 10), @(7, 9), @(8, 8), @(9, 8), @(10, 7), @(11, 7))) { Set-Px $c $p[0] $p[1] $vein }
    return $c
}

$Dir = 'block/multiblock/cluster_light_furnace'
$idle = New-Face 0 $false
Out-Tex $idle.C "$Dir/overlay_front.png"
$col = @(); $emi = @()
for ($f = 0; $f -lt $Frames; $f++) { $a = New-Face $f $true; $col += , $a.C; $emi += , $a.E }
Out-Tex (Join-Frames $col) "$Dir/overlay_front_active.png" $FrameTime
Out-Tex (Join-Frames $emi) "$Dir/overlay_front_active_emissive.png" $FrameTime
Out-Tex (New-Rock) 'item/nsc_planetesimal.png'

$problems = New-Object System.Collections.Generic.List[string]
function Test-Pixels {
    param($Png, [string]$Name, [bool]$Ring)
    for ($y = 0; $y -lt $Png.H; $y++) {
        for ($x = 0; $x -lt $Png.W; $x++) {
            $v = $Png.P[$y * $Png.W + $x]; $a = ($v -shr 24) -band 255
            $onRing = ((($x % 16) -eq 0) -or (($x % 16) -eq 15) -or (($y % 16) -eq 0) -or (($y % 16) -eq 15))
            if ($a -ne 0 -and $a -ne 255) { $problems.Add("${Name}: partial alpha at $x,$y") }
            if ($a -eq 255 -and ($v -band 0xFFFFFF) -eq 0) { $problems.Add("${Name}: pure black at $x,$y") }
            if ($Ring -and $onRing -and $a -ne 0) { $problems.Add("${Name}: ring pixel at $x,$y") }
        }
    }
}
$png = @{}
foreach ($n in 'overlay_front', 'overlay_front_active', 'overlay_front_active_emissive') { $png[$n] = Read-Png (Join-Path $OutRoot ("$Dir/$n.png" -replace '/', '\')) }
foreach ($n in $png.Keys) { Test-Pixels $png[$n] "$Dir/$n" $true }
Test-Pixels (Read-Png (Join-Path $OutRoot 'item\nsc_planetesimal.png')) 'item/nsc_planetesimal' $true
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
