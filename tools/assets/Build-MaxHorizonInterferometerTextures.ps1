<#
.SYNOPSIS
  Procedural 16x16 pixel art for the two casings of the MAX horizon interferometer (package XP-V1b) of Gregtech Grindless.

.DESCRIPTION
  Every pixel is drawn by this script; nothing is copied or edited from GregTech Modern or any other mod. Output is deterministic.
  Same method and Era.Lib MAX finish as Build-MaxSynchroniserTextures.ps1.

  Writes (under pack/kubejs/assets/grindless/textures/):
    block/max/test_mass_enclosure_casing.png   steel vacuum shell with a window onto a suspended test mass
    block/max/laser_link_casing.png            dark housing with a beam window; the beam runs edge to edge

  Conventions: every block pixel opaque, none pure black. The final check fails the run (non-zero exit) if a file breaks one.

  Run from the repo root:
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-MaxHorizonInterferometerTextures.ps1

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

$written = New-Object System.Collections.Generic.List[string]
function Out-Tex {
    param($Canvas, [string]$Rel)
    $path = Join-Path $OutRoot ($Rel -replace '/', '\')
    $dir = Split-Path -Parent $path
    if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir | Out-Null }
    for ($try = 1; $try -le 6; $try++) {
        try { Save-Png $Canvas $path; break }
        catch [System.IO.IOException] { if ($try -eq 6) { throw }; Start-Sleep -Milliseconds (250 * $try) }
    }
    $written.Add($Rel)
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

function New-EnclosureCasing {
    $c = New-Canvas 16 16
    $shell = Hex '6C7684'; $edge = Hex '262B33'; $vac = Hex '10141C'; $rim = Hex 'A8B4C4'
    $mass = Hex 'D8E4F0'; $massDark = Hex '7E90A8'; $wire = Hex '8896AA'
    for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
        $col = Get-Tone $shell $x $y 801
        if ($x -eq 0 -or $y -eq 0 -or $x -eq 15 -or $y -eq 15) { $col = $edge }
        Set-Px $c $x $y $col
    } }
    # vacuum window, rimmed
    for ($y = 3; $y -le 12; $y++) { for ($x = 3; $x -le 12; $x++) {
        $isRim = ($x -eq 3 -or $x -eq 12 -or $y -eq 3 -or $y -eq 12)
        Set-Px $c $x $y $(if ($isRim) { $rim } else { $vac })
    } }
    # two suspension wires and the test mass hanging between them
    foreach ($x in 6, 9) { for ($y = 4; $y -le 6; $y++) { Set-Px $c $x $y $wire } }
    Set-Rect $c 6 7 4 4 $mass
    for ($i = 6; $i -le 9; $i++) { Set-Px $c $i 10 $massDark; Set-Px $c 9 ($i + 1) $massDark }
    Set-Px $c 9 7 $rim
    return $c
}

function New-LinkCasing {
    $c = New-Canvas 16 16
    $core = Hex '3A3F4C'; $edge = Hex '1E2128'; $frame = Hex '8A92A2'
    $beamHot = Hex 'FF8C8C'; $beam = Hex 'D83A3A'; $glass = Hex '2A1216'
    for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
        $col = Get-Tone $core $x $y 811
        if ($x -eq 0 -or $y -eq 0 -or $x -eq 15 -or $y -eq 15) { $col = $edge }
        Set-Px $c $x $y $col
    } }
    # beam window: a framed slot across the whole width, so neighbours line up
    for ($x = 0; $x -lt 16; $x++) {
        Set-Px $c $x 5 $frame; Set-Px $c $x 10 $frame
        Set-Px $c $x 6 $glass; Set-Px $c $x 9 $glass
        Set-Px $c $x 7 $beam; Set-Px $c $x 8 $beam
    }
    for ($x = 0; $x -lt 16; $x += 3) { Set-Px $c $x 7 $beamHot }
    # collimator bolts above and below
    foreach ($p in @(@(3, 2), @(12, 2), @(3, 13), @(12, 13))) { Set-Px $c $p[0] $p[1] $frame }
    return $c
}

Out-Tex (New-EnclosureCasing) 'block/max/test_mass_enclosure_casing.png'
Out-Tex (New-LinkCasing) 'block/max/laser_link_casing.png'

$problems = New-Object System.Collections.Generic.List[string]
$seen = @{}
foreach ($rel in $written) {
    $png = Read-Png (Join-Path $OutRoot ($rel -replace '/', '\'))
    foreach ($v in $png.P) {
        if ((($v -shr 24) -band 255) -ne 255) { $problems.Add("${rel}: block must be fully opaque"); break }
        if (($v -band 0xFFFFFF) -eq 0) { $problems.Add("${rel}: pure black"); break }
    }
    $k = $png.P -join ','
    if ($seen.ContainsKey($k)) { $problems.Add("${rel}: identical to $($seen[$k])") } else { $seen[$k] = $rel }
}
if ($problems.Count -gt 0) { $problems | ForEach-Object { Write-Error $_ -ErrorAction Continue }; exit 1 }

Write-Host "$ScriptName wrote $($written.Count) files"
if ($Credits) {
    foreach ($w in $written) { Write-Host "| pack/kubejs/assets/grindless/textures/$w | drawn procedurally by tools/assets/$ScriptName | ours |" }
}
