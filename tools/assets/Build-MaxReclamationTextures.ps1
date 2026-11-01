<#
.SYNOPSIS
  Procedural 16x16 pixel art for the MAX segment reclamation works controller face and its reclamation_bay_casing (package MX-S4) of Gregtech Grindless.

.DESCRIPTION
  Every pixel is drawn by this script; nothing is copied or edited from GregTech Modern or any other mod. Output is deterministic.
  Same method and steel bezel as Build-MaxFurnaceTextures.ps1.

  Writes (under pack/kubejs/assets/grindless/textures/):
    block/multiblock/segment_reclamation_works/overlay_front.png, overlay_front_active.png(+.mcmeta), overlay_front_active_emissive.png(+.mcmeta)
    block/max/reclamation_bay_casing.png

  Face: a mirror segment held in a cradle. Working (4 frames, frametime 4) the cut line sweeps across it and the seven part streams light
  up one by one below. The casing is a grey bay plate with a yellow-black docking strip and a row of rivets.

  Conventions: transparent background, outer 1 px ring empty, every pixel fully opaque or fully transparent, none pure black, emissive
  layer a subset of the colour layer. The final check fails the run (non-zero exit) if a written file breaks one.

  Run from the repo root:
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-MaxReclamationTextures.ps1

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
$EraName = 'max'; . (Join-Path $PSScriptRoot 'Era.Lib.ps1')

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

function Get-Noise {
    param([int]$X, [int]$Y, [int]$Salt)
    $v = [int64]($X * 73856093) -bxor [int64]($Y * 19349663) -bxor [int64]($Salt * 83492791)
    return [int]([Math]::Abs($v) % 1000)
}

function Get-Tone {
    param([int]$Argb, [int]$X, [int]$Y, [int]$Salt)
    $f = 1.2 - 0.035 * ($X + $Y)
    $n = Get-Noise $X $Y $Salt
    if ($n -lt 110) { $f *= 0.86 } elseif ($n -gt 900) { $f *= 1.14 }
    return (Shade $Argb $f)
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

# the seven part streams, one lit column each (x = 4, 5, 6, 7, 8, 9, 10 on row 10)
$Streams = @('A8D0E8', 'E0E8F0', '88A0C0', 'C89048', 'B8B8C8', '58C078', 'E8D060')

function New-Face {
    param([int]$Frame, [bool]$Active)
    $c = New-Bezel
    $e = New-Canvas
    for ($y = 4; $y -le 10; $y++) { for ($x = 4; $x -le 11; $x++) { Set-Px $c $x $y $Pit } }
    # the cradle and the held mirror segment
    $cradle = Hex '8A8E96'; $mirror = Hex 'C8D4E0'; $facet = Hex '7C8894'
    foreach ($x in 4..11) { Set-Px $c $x 8 $cradle }
    foreach ($p in @(@(6, 5), @(7, 5), @(8, 5), @(9, 5), @(5, 6), @(6, 6), @(7, 6), @(8, 6), @(9, 6), @(10, 6), @(6, 7), @(7, 7), @(8, 7), @(9, 7))) { Set-Px $c $p[0] $p[1] $mirror }
    foreach ($p in @(@(7, 6), @(8, 7))) { Set-Px $c $p[0] $p[1] $facet }
    $dim = $null
    for ($i = 0; $i -lt 7; $i++) {
        $col = Hex $Streams[$i]
        if ($Active -and ($i -le ($Frame * 2))) { Set-Both $c $e (4 + $i) 10 $col } else { Set-Px $c (4 + $i) 10 (Shade $col 0.45) }
    }
    if ($Active) {
        $cut = Hex 'FF5040'
        $x = 5 + ($Frame * 2)
        foreach ($y in 4..7) { Set-Both $c $e $x $y $cut }
        Set-Both $c $e $x 9 $cut
    }
    $lamp = $(if ($Active) { $LampOn } else { $LampOff })
    Set-Px $c 7 12 $lamp; Set-Px $c 8 12 $lamp
    if ($Active) { Set-Px $e 7 12 $LampOn; Set-Px $e 8 12 $LampOn }
    for ($i = 0; $i -lt 16; $i++) { foreach ($p in @(@($i, 0), @($i, 15), @(0, $i), @(15, $i))) { Set-Px $c $p[0] $p[1] 0; Set-Px $e $p[0] $p[1] 0 } }
    return @{ C = $c; E = $e }
}

function New-Casing {
    # grey bay plate, a yellow-black docking strip across the middle, rivets at the corners
    $plate = Hex '666C74'; $yellow = Hex 'D8B038'; $black = Hex '2A2C30'; $edge = Hex '34383E'; $rivet = Hex '9AA0A8'
    $c = New-Canvas 16 16
    for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
        $col = Get-Tone $plate $x $y 731
        if ($y -ge 6 -and $y -le 9) { $col = $(if ((($x + $y) % 4) -lt 2) { Shade $yellow (1.1 - 0.02 * $x) } else { $black }) }
        if ($x -eq 0 -or $y -eq 0 -or $x -eq 15 -or $y -eq 15) { $col = $edge }
        Set-Px $c $x $y $col
    } }
    foreach ($p in @(@(2, 2), @(13, 2), @(2, 13), @(13, 13))) { Set-Px $c $p[0] $p[1] $rivet }
    return $c
}

$Dir = 'block/multiblock/segment_reclamation_works'
$idle = New-Face 0 $false
Out-Tex $idle.C "$Dir/overlay_front.png"
$col = @(); $emi = @()
for ($f = 0; $f -lt $Frames; $f++) { $a = New-Face $f $true; $col += , $a.C; $emi += , $a.E }
Out-Tex (Join-Frames $col) "$Dir/overlay_front_active.png" $FrameTime
Out-Tex (Join-Frames $emi) "$Dir/overlay_front_active_emissive.png" $FrameTime
Out-Tex (New-Casing) 'block/max/reclamation_bay_casing.png'

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
Test-Pixels (Read-Png (Join-Path $OutRoot 'block\max\reclamation_bay_casing.png')) 'block/max/reclamation_bay_casing' $false
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
