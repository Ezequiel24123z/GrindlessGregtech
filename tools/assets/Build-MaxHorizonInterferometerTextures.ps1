<#
.SYNOPSIS
  Procedural 16x16 pixel art for the controller face and two casings of the MAX horizon interferometer (package XP-V1b) of Gregtech Grindless.

.DESCRIPTION
  Every pixel is drawn by this script; nothing is copied or edited from GregTech Modern or any other mod. Output is deterministic.
  Same method and Era.Lib MAX finish as Build-MaxSynchroniserTextures.ps1.

  Writes (under pack/kubejs/assets/grindless/textures/):
    block/multiblock/horizon_interferometer/overlay_front.png, overlay_front_active.png(+.mcmeta), overlay_front_active_emissive.png(+.mcmeta)
                                               steel bezel, two laser arms meeting at a beam splitter; working: pulses run both arms
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

$Lit = Hex 'B0B0B0'; $Mid = Hex '707070'; $Dark = Hex '404040'; $Deep = Hex '222222'; $Pit = Hex '161616'
$LampOn = Hex '62FF86'; $LampOff = Hex '0C6B2E'

function Set-Both { param($C, $E, [int]$X, [int]$Y, [int]$Argb) Set-Px $C $X $Y $Argb; Set-Px $E $X $Y $Argb }

# Controller face: steel bezel around a dark window showing an L of two laser arms that meet at a beam splitter.
function New-Face {
    param([int]$Frame, [bool]$Active)
    $c = New-Canvas; $e = New-Canvas
    Set-Rect $c 1 1 14 14 $Dark
    for ($i = 1; $i -le 14; $i++) { Set-Px $c $i 1 $Lit; Set-Px $c 1 $i $Lit; Set-Px $c $i 14 $Deep; Set-Px $c 14 $i $Deep }
    Set-Rect $c 2 2 12 12 $Mid
    Set-Rect $c 3 3 10 8 $Deep
    Set-Rect $c 3 11 10 3 $Dark
    Set-Rect $c 4 4 8 6 $Pit
    $arm = Hex '8A3030'; $split = Hex 'C8D4E4'; $mirror = Hex '7098C8'
    foreach ($x in 4..11) { Set-Px $c $x 8 $arm }
    foreach ($y in 4..8) { Set-Px $c 5 $y $arm }
    Set-Px $c 5 8 $split; Set-Px $c 6 8 $split; Set-Px $c 5 7 $split
    Set-Px $c 11 8 $mirror; Set-Px $c 11 7 $mirror; Set-Px $c 5 4 $mirror; Set-Px $c 6 4 $mirror
    if ($Active) {
        $beam = Hex 'FF8C8C'; $hot = Hex 'FFF0A0'
        $x = 7 + ($Frame * 2) % 5; Set-Both $c $e $x 8 $beam; Set-Both $c $e ($x + 1) 8 $beam
        $y = 7 - ($Frame * 2) % 4; Set-Both $c $e 5 $y $beam
        foreach ($q in @(@(5, 8), @(6, 8), @(5, 7))) { Set-Both $c $e $q[0] $q[1] $(if (($Frame % 2) -eq 0) { $hot } else { $beam }) }
    }
    $lamp = $(if ($Active) { $LampOn } else { $LampOff })
    Set-Px $c 7 12 $lamp; Set-Px $c 8 12 $lamp
    if ($Active) { Set-Px $e 7 12 $LampOn; Set-Px $e 8 12 $LampOn }
    for ($i = 0; $i -lt 16; $i++) { foreach ($q in @(@($i, 0), @($i, 15), @(0, $i), @(15, $i))) { Set-Px $c $q[0] $q[1] 0; Set-Px $e $q[0] $q[1] 0 } }
    return @{ C = $c; E = $e }
}

$FaceDir = 'block/multiblock/horizon_interferometer'
$idle = New-Face 0 $false
Out-Tex $idle.C "$FaceDir/overlay_front.png"
$col = @(); $emi = @()
for ($f = 0; $f -lt 4; $f++) { $a = New-Face $f $true; $col += , $a.C; $emi += , $a.E }
Out-Tex (Join-Frames $col) "$FaceDir/overlay_front_active.png" 4
Out-Tex (Join-Frames $emi) "$FaceDir/overlay_front_active_emissive.png" 4
Out-Tex (New-EnclosureCasing) 'block/max/test_mass_enclosure_casing.png'
Out-Tex (New-LinkCasing) 'block/max/laser_link_casing.png'

$problems = New-Object System.Collections.Generic.List[string]
$seen = @{}
foreach ($rel in ($written | Where-Object { $_ -like 'block/max/*' })) {
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
