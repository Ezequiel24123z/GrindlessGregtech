<#
.SYNOPSIS
  Procedural 16x16 pixel art for the two UHV gate and edge controller faces (UHV-B7) of Gregtech Grindless: the warp gate and
  the baseline astrometer.

.DESCRIPTION
  Every pixel is drawn by this script (palettes and small routines); nothing is copied or edited from GregTech Modern or any
  other mod. Output is deterministic. Same method and steel bezel as Build-UHVProximaGroundTextures.ps1.

  Writes (under pack/kubejs/assets/grindless/textures/):
    block/multiblock/<machine>/overlay_front.png, overlay_front_active.png(+.mcmeta), overlay_front_active_emissive.png(+.mcmeta)
      for warp_gate and baseline_astrometer

  Warp gate: a ring seen edge-on round a dark gap; working, a violet-white shimmer fills the ring and sweeps (4 frames, frametime 4).
  Baseline astrometer: a dish on a mast looking up at two stars; working, the dish scans and the stars blink.
  The *_emissive layer holds only the glow and the lamp.

  Conventions: transparent background, outer 1 px ring of the faces empty, every pixel fully opaque or fully transparent, none pure
  black, emissive layer a subset of the colour layer. The final check fails the run (non-zero exit) if a written file breaks one.

  Run from the repo root:
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-UHVGateTextures.ps1

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
$problems = New-Object System.Collections.Generic.List[string]
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

# The window is x4..11, y4..9.
function New-Face {
    param([string]$Kind, [int]$Frame, [bool]$Active)
    $c = New-Bezel
    $e = New-Canvas
    for ($y = 4; $y -le 9; $y++) { for ($x = 4; $x -le 11; $x++) { Set-Px $c $x $y $Pit } }
    switch ($Kind) {
        'gate' {
            # the ring edge-on: a pale steel hoop (x4..11, y4..9) round a dark gap; working, a shimmer sweeps the gap
            for ($x = 4; $x -le 11; $x++) { Set-Px $c $x 4 (Hex 'A8A4C0'); Set-Px $c $x 9 (Hex '5A5670') }
            for ($y = 4; $y -le 9; $y++) { Set-Px $c 4 $y (Hex '8A86A4'); Set-Px $c 11 $y (Hex '5A5670') }
            foreach ($p in @(@(4, 4), @(11, 4), @(4, 9), @(11, 9))) { Set-Px $c $p[0] $p[1] (Hex 'C8C4E0') }
            if ($Active) {
                for ($y = 5; $y -le 8; $y++) {
                    for ($x = 5; $x -le 10; $x++) {
                        if ((($x + $y + $Frame) % 4) -eq 0) { Set-Both $c $e $x $y (Hex 'D8B8FF') }
                        elseif ((($x + $y + $Frame) % 4) -eq 2) { Set-Both $c $e $x $y (Hex '8A5AE0') }
                    }
                }
            }
            else { Set-Px $c 7 6 (Hex '2A2640'); Set-Px $c 8 7 (Hex '2A2640') }
        }
        default {
            # the astrometer: a mast (x7..8, rows 7..9) under a dish tilting up (rows 5..6); two stars in the dark sky
            for ($y = 7; $y -le 9; $y++) { Set-Px $c 7 $y (Hex '8A8E96'); Set-Px $c 8 $y (Hex '6A6E76') }
            for ($x = 5; $x -le 10; $x++) { Set-Px $c $x 9 (Hex '5A4C42') }
            $tilt = $(if ($Active) { $Frame % 4 } else { 1 })
            for ($x = 5; $x -le 10; $x++) {
                $y = 6 - [int][Math]::Floor((($x - 5) * ($tilt - 1)) / 5.0 + 0.5)
                if ($y -lt 4) { $y = 4 }
                if ($y -gt 7) { $y = 7 }
                Set-Px $c $x $y (Hex 'D0D4DC')
                Set-Px $c $x ($y + 1) (Hex '7A808C')
            }
            Set-Px $c 5 4 (Hex 'E8E0A0'); Set-Px $c 10 5 (Hex 'A0C8E8')
            if ($Active) {
                if (($Frame % 2) -eq 0) { Set-Both $c $e 5 4 (Hex 'FFF4B0') } else { Set-Both $c $e 10 5 (Hex 'B8E0FF') }
                Set-Both $c $e (6 + ($Frame % 4)) 9 (Hex '7AE0FF')
            }
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
    @{ Kind = 'gate'; Dir = 'block/multiblock/warp_gate' },
    @{ Kind = 'astrometer'; Dir = 'block/multiblock/baseline_astrometer' }
)
foreach ($k in $kinds) {
    $idle = New-Face $k.Kind 0 $false
    Out-Tex $idle.C "$($k.Dir)/overlay_front.png"
    $col = @(); $emi = @()
    for ($f = 0; $f -lt $Frames; $f++) { $a = New-Face $k.Kind $f $true; $col += , $a.C; $emi += , $a.E }
    Out-Tex (Join-Frames $col) "$($k.Dir)/overlay_front_active.png" $FrameTime
    Out-Tex (Join-Frames $emi) "$($k.Dir)/overlay_front_active_emissive.png" $FrameTime
}

# ---------------------------------------------------------------- check
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
foreach ($k in $kinds) {
    $png = @{}
    foreach ($n in 'overlay_front', 'overlay_front_active', 'overlay_front_active_emissive') { $png[$n] = Read-Png (Join-Path $OutRoot ("$($k.Dir)/$n.png" -replace '/', '\')) }
    foreach ($n in $png.Keys) { Test-Pixels $png[$n] "$($k.Dir)/$n" }
    $col = $png['overlay_front_active']; $em = $png['overlay_front_active_emissive']
    for ($i = 0; $i -lt $col.P.Length; $i++) { if ($em.P[$i] -ne 0 -and $em.P[$i] -ne $col.P[$i]) { $problems.Add("$($k.Dir): emissive differs from colour at $i") } }
    for ($f = 0; $f -lt $Frames - 1; $f++) {
        $same = $true
        for ($i = 0; $i -lt 256; $i++) { if ($col.P[$f * 256 + $i] -ne $col.P[($f + 1) * 256 + $i]) { $same = $false; break } }
        if ($same) { $problems.Add("$($k.Dir): frame $f repeats frame $($f + 1)") }
    }
}
$src = Get-Content -LiteralPath (Join-Path $RepoRoot 'pack\kubejs\startup_scripts\grindless\uhv\gate.js') -Raw
foreach ($k in $kinds) { $m = ($k.Dir -split '/')[-1]; if ($src -notmatch "name: '$m'") { $problems.Add("$($k.Dir): no machine $m in uhv/gate.js") } }
if ($problems.Count -gt 0) { $problems | Select-Object -First 20 | ForEach-Object { Write-Error $_ -ErrorAction Continue }; exit 1 }

Write-Host "$ScriptName wrote $($written.Count) files"
if ($Credits) {
    foreach ($w in $written) { Write-Host "| pack/kubejs/assets/grindless/textures/$w | drawn procedurally by tools/assets/$ScriptName | ours |" }
}
