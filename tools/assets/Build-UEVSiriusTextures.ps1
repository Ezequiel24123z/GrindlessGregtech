<#
.SYNOPSIS
  Procedural 16x16 pixel art for the white dwarf spectrograph, degenerate harvester and containment works controller faces of the UEV-B4 package, of Gregtech Grindless.

.DESCRIPTION
  Every pixel is drawn by this script (palettes and small routines); nothing is copied or edited from GregTech Modern or any
  other mod. Output is deterministic. Same method and steel bezel as Build-UEVBarnardTextures.ps1.

  Writes (under pack/kubejs/assets/grindless/textures/):
    block/multiblock/white_dwarf_spectrograph/overlay_front.png, overlay_front_active.png(+.mcmeta), overlay_front_active_emissive.png(+.mcmeta)
    block/multiblock/degenerate_harvester/ the same three
    block/multiblock/containment_works/ the same three

  Spectrograph face: a slit and a spectrum band; working (4 frames) a dark absorption line sweeps across it. Harvester face: a pale dense
  core in a ring; working (4 frames) it pulses and a cold ring turns. Containment face: a sealed pellet between two clamps; working
  (4 frames) the field lines close around it. The *_emissive layer holds only the glow and the lamp.

  Conventions: transparent background, outer 1 px ring of the face empty, every pixel fully opaque or fully transparent, none pure
  black, emissive layer a subset of the colour layer. The final check fails the run (non-zero exit) if a written file breaks one.

  Run from the repo root:
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-UEVSiriusTextures.ps1

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

function Finish-Face {
    param($C, $E, [bool]$Active)
    $lamp = if ($Active) { $LampOn } else { $LampOff }
    Set-Px $C 7 12 $lamp; Set-Px $C 8 12 $lamp
    if ($Active) { Set-Px $E 7 12 $LampOn; Set-Px $E 8 12 $LampOn }
    for ($i = 0; $i -lt 16; $i++) { foreach ($p in @(@($i, 0), @($i, 15), @(0, $i), @(15, $i))) { Set-Px $C $p[0] $p[1] 0; Set-Px $E $p[0] $p[1] 0 } }
    return @{ C = $C; E = $E }
}

# spectrograph: a spectrum band (x4..11, y5..8) from violet to red; an absorption line sweeps across when working
function New-SpectrumFace {
    param([int]$Frame, [bool]$Active)
    $c = New-Bezel; $e = New-Canvas
    for ($y = 4; $y -le 9; $y++) { for ($x = 4; $x -le 11; $x++) { Set-Px $c $x $y $Pit } }
    $band = @((Hex '7A4AE0'), (Hex '4A7AE0'), (Hex '4AC8E0'), (Hex '4AE08A'), (Hex 'C8E04A'), (Hex 'E0A04A'), (Hex 'E0644A'), (Hex 'C84A4A'))
    $dim = @((Hex '40286E'), (Hex '28406E'), (Hex '286E78'), (Hex '286E48'), (Hex '6E7828'), (Hex '78582A'), (Hex '78382A'), (Hex '6E2828'))
    for ($i = 0; $i -lt 8; $i++) {
        foreach ($y in 5, 6, 7, 8) {
            if ($Active) { Set-Both $c $e (4 + $i) $y $band[$i] } else { Set-Px $c (4 + $i) $y $dim[$i] }
        }
    }
    if ($Active) {
        $x = 4 + (($Frame * 2) % 8)
        foreach ($y in 5, 6, 7, 8) { Set-Px $c $x $y $Pit; Set-Px $e $x $y 0 }
    }
    return Finish-Face $c $e $Active
}

# harvester: a pale core (x7..8, y6..7) in a ring of casing; working it pulses and cold-loop specks turn around it
function New-CoreFace {
    param([int]$Frame, [bool]$Active)
    $c = New-Bezel; $e = New-Canvas
    for ($y = 4; $y -le 9; $y++) { for ($x = 5; $x -le 10; $x++) { Set-Px $c $x $y $Pit } }
    $ring = Hex '5C7C8C'
    foreach ($p in @(@(6, 4), @(7, 4), @(8, 4), @(9, 4), @(6, 9), @(7, 9), @(8, 9), @(9, 9), @(5, 5), @(5, 6), @(5, 7), @(5, 8), @(10, 5), @(10, 6), @(10, 7), @(10, 8))) { Set-Px $c $p[0] $p[1] $ring }
    $core = if ($Active) { @((Hex 'FFFFFF'), (Hex 'E8F0FF'), (Hex 'C8DCFF'), (Hex 'E8F0FF'))[$Frame % 4] } else { Hex '8C9CB4' }
    foreach ($p in @(@(7, 6), @(8, 6), @(7, 7), @(8, 7))) { if ($Active) { Set-Both $c $e $p[0] $p[1] $core } else { Set-Px $c $p[0] $p[1] $core } }
    if ($Active) {
        $cold = Hex '7AE0FF'
        $orbit = @(@(6, 5), @(9, 5), @(9, 8), @(6, 8))
        $q = $orbit[$Frame % 4]; Set-Both $c $e $q[0] $q[1] $cold
        $q = $orbit[($Frame + 2) % 4]; Set-Both $c $e $q[0] $q[1] $cold
    }
    return Finish-Face $c $e $Active
}

# containment works: a sealed pellet (x7..8, y6..7) between two clamps (x4..5 and x10..11); working the field lines close around it
function New-SealFace {
    param([int]$Frame, [bool]$Active)
    $c = New-Bezel; $e = New-Canvas
    for ($y = 4; $y -le 9; $y++) { for ($x = 4; $x -le 11; $x++) { Set-Px $c $x $y $Pit } }
    $clamp = Hex 'A0A8B8'; $clampShade = Hex '646C7C'
    foreach ($y in 5, 6, 7, 8) { Set-Px $c 4 $y $clamp; Set-Px $c 5 $y $clampShade; Set-Px $c 10 $y $clampShade; Set-Px $c 11 $y $clamp }
    $pellet = if ($Active) { Hex 'FFB0F0' } else { Hex '8C5C84' }
    foreach ($p in @(@(7, 6), @(8, 6), @(7, 7), @(8, 7))) { if ($Active) { Set-Both $c $e $p[0] $p[1] $pellet } else { Set-Px $c $p[0] $p[1] $pellet } }
    if ($Active) {
        $field = Hex 'B07AFF'
        $top = 5; $bot = 8
        foreach ($x in 6, 7, 8, 9) {
            if ((($x + $Frame) % 2) -eq 0) { Set-Both $c $e $x $top $field } else { Set-Both $c $e $x $bot $field }
        }
    }
    return Finish-Face $c $e $Active
}

foreach ($face in @(@('white_dwarf_spectrograph', 'New-SpectrumFace'), @('degenerate_harvester', 'New-CoreFace'), @('containment_works', 'New-SealFace'))) {
    $Dir = "block/multiblock/$($face[0])"
    $idle = & $face[1] 0 $false
    Out-Tex $idle.C "$Dir/overlay_front.png"
    $col = @(); $emi = @()
    for ($f = 0; $f -lt $Frames; $f++) { $a = & $face[1] $f $true; $col += , $a.C; $emi += , $a.E }
    Out-Tex (Join-Frames $col) "$Dir/overlay_front_active.png" $FrameTime
    Out-Tex (Join-Frames $emi) "$Dir/overlay_front_active_emissive.png" $FrameTime
}

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
foreach ($face in 'white_dwarf_spectrograph', 'degenerate_harvester', 'containment_works') {
    $Dir = "block/multiblock/$face"
    $png = @{}
    foreach ($n in 'overlay_front', 'overlay_front_active', 'overlay_front_active_emissive') { $png[$n] = Read-Png (Join-Path $OutRoot ("$Dir/$n.png" -replace '/', '\')) }
    foreach ($n in $png.Keys) { Test-Pixels $png[$n] "$Dir/$n" $true }
    $cl = $png['overlay_front_active']; $em = $png['overlay_front_active_emissive']
    for ($i = 0; $i -lt $cl.P.Length; $i++) { if ($em.P[$i] -ne 0 -and $em.P[$i] -ne $cl.P[$i]) { $problems.Add("${Dir}: emissive differs from colour at $i") } }
    for ($f = 0; $f -lt $Frames - 1; $f++) {
        $same = $true
        for ($i = 0; $i -lt 256; $i++) { if ($cl.P[$f * 256 + $i] -ne $cl.P[($f + 1) * 256 + $i]) { $same = $false; break } }
        if ($same) { $problems.Add("${Dir}: frame $f repeats frame $($f + 1)") }
    }
}
if ($problems.Count -gt 0) { $problems | Select-Object -First 20 | ForEach-Object { Write-Error $_ -ErrorAction Continue }; exit 1 }

Write-Host "$ScriptName wrote $($written.Count) files"
if ($Credits) {
    foreach ($w in $written) { Write-Host "| pack/kubejs/assets/grindless/textures/$w | drawn procedurally by tools/assets/$ScriptName | ours |" }
}
