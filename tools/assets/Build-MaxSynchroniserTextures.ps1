<#
.SYNOPSIS
  Procedural 16x16 pixel art for the MAX ergoregion synchroniser controller face and its driver ring casing (package MX-S2) of Gregtech Grindless.

.DESCRIPTION
  Every pixel is drawn by this script; nothing is copied or edited from GregTech Modern or any other mod. Output is deterministic.
  Same method and steel bezel as Build-MaxFurnaceTextures.ps1.

  Writes (under pack/kubejs/assets/grindless/textures/):
    block/multiblock/ergoregion_synchroniser/overlay_front.png, overlay_front_active.png(+.mcmeta), overlay_front_active_emissive.png(+.mcmeta)
    block/max/driver_ring_casing.png

  Face: a ring around a dark bore. Working (4 frames, frametime 4) two opposite beads race round the ring in lock-step and the core pulses.
  Casing: warm copper drive bands on a dark core, seamless.

  Conventions: transparent background, outer 1 px ring empty, every pixel fully opaque or fully transparent, none pure black, emissive
  layer a subset of the colour layer. The final check fails the run (non-zero exit) if a written file breaks one.

  Run from the repo root:
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-MaxSynchroniserTextures.ps1

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

# the 12 cells of a ring of radius ~3 around the bore centre (7.5, 6.5), in running order
$Ring = @(@(7, 3), @(8, 3), @(10, 4), @(11, 5), @(11, 7), @(10, 9), @(8, 10), @(7, 10), @(5, 9), @(4, 7), @(4, 5), @(5, 4))

function New-Face {
    param([int]$Frame, [bool]$Active)
    $c = New-Bezel
    $e = New-Canvas
    for ($y = 4; $y -le 9; $y++) { for ($x = 5; $x -le 10; $x++) { Set-Px $c $x $y $Pit } }
    $steel = Hex '6E8CB0'
    foreach ($p in $Ring) { Set-Px $c $p[0] $p[1] $steel }
    if ($Active) {
        $glow = Hex '8CE8FF'; $hot = Hex 'FFF0A0'
        foreach ($k in 0, 1, 6, 7) { $p = $Ring[($Frame * 3 + $k) % 12]; Set-Both $c $e $p[0] $p[1] $glow }
        foreach ($p in @(@(7, 6), @(8, 6), @(7, 7), @(8, 7))) { Set-Both $c $e $p[0] $p[1] $(if (($Frame % 2) -eq 0) { $hot } else { $glow }) }
    }
    $lamp = $(if ($Active) { $LampOn } else { $LampOff })
    Set-Px $c 7 12 $lamp; Set-Px $c 8 12 $lamp
    if ($Active) { Set-Px $e 7 12 $LampOn; Set-Px $e 8 12 $LampOn }
    for ($i = 0; $i -lt 16; $i++) { foreach ($p in @(@($i, 0), @($i, 15), @(0, $i), @(15, $i))) { Set-Px $c $p[0] $p[1] 0; Set-Px $e $p[0] $p[1] 0 } }
    return @{ C = $c; E = $e }
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

function New-Casing {
    $c = New-Canvas 16 16
    $core = Hex '4A3A32'; $wind = Hex 'D8905A'; $edge = Hex '2A1E1A'
    for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
        $col = Get-Tone $core $x $y 741
        if ($x % 4 -ne 0 -and $y % 5 -ne 0 -and $x -ge 2 -and $x -le 13) { $col = Get-Tone $wind $x $y 742 }
        if ($x -eq 0 -or $y -eq 0 -or $x -eq 15 -or $y -eq 15) { $col = $edge }
        Set-Px $c $x $y $col
    } }
    return $c
}

$Dir = 'block/multiblock/ergoregion_synchroniser'
$idle = New-Face 0 $false
Out-Tex $idle.C "$Dir/overlay_front.png"
$col = @(); $emi = @()
for ($f = 0; $f -lt $Frames; $f++) { $a = New-Face $f $true; $col += , $a.C; $emi += , $a.E }
Out-Tex (Join-Frames $col) "$Dir/overlay_front_active.png" $FrameTime
Out-Tex (Join-Frames $emi) "$Dir/overlay_front_active_emissive.png" $FrameTime
Out-Tex (New-Casing) 'block/max/driver_ring_casing.png'

$problems = New-Object System.Collections.Generic.List[string]
function Test-Pixels {
    param($Png, [string]$Name, [bool]$NeedEmptyRing, [bool]$NeedSolid)
    $opaque = 0
    for ($y = 0; $y -lt $Png.H; $y++) {
        for ($x = 0; $x -lt $Png.W; $x++) {
            $v = $Png.P[$y * $Png.W + $x]; $a = ($v -shr 24) -band 255
            $onRing = ((($x % 16) -eq 0) -or (($x % 16) -eq 15) -or (($y % 16) -eq 0) -or (($y % 16) -eq 15))
            if ($a -ne 0 -and $a -ne 255) { $problems.Add("${Name}: partial alpha at $x,$y") }
            if ($a -eq 255) { $opaque++ }
            if ($a -eq 255 -and ($v -band 0xFFFFFF) -eq 0) { $problems.Add("${Name}: pure black at $x,$y") }
            if ($NeedEmptyRing -and $onRing -and $a -ne 0) { $problems.Add("${Name}: ring pixel at $x,$y") }
        }
    }
    if ($NeedSolid -and $opaque -ne $Png.W * $Png.H) { $problems.Add("${Name}: block must be fully opaque") }
}
$png = @{}
foreach ($n in 'overlay_front', 'overlay_front_active', 'overlay_front_active_emissive') { $png[$n] = Read-Png (Join-Path $OutRoot ("$Dir/$n.png" -replace '/', '\')) }
foreach ($n in $png.Keys) { Test-Pixels $png[$n] "$Dir/$n" $true $false }
Test-Pixels (Read-Png (Join-Path $OutRoot 'block\max\driver_ring_casing.png')) 'block/max/driver_ring_casing' $false $true
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
