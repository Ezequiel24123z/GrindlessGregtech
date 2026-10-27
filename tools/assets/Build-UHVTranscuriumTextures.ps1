<#
.SYNOPSIS
  Procedural 16x16 pixel art for the UHV high flux reactor and transuranium facility controller faces of Gregtech Grindless.

.DESCRIPTION
  Every pixel is drawn by this script (palettes and small routines); nothing is copied or edited from GregTech Modern or any
  other mod. Output is deterministic. Same method and steel bezel as the earlier sets (Build-UVThoriumTextures.ps1).

  Writes (under pack/kubejs/assets/grindless/textures/):
    block/multiblock/high_flux_reactor/overlay_front.png, overlay_front_active.png(+.mcmeta), overlay_front_active_emissive.png(+.mcmeta)
    block/multiblock/transuranium_facility/ the same three files

  Reactor face: a dark steel bezel round a pool window; idle, the water is dark blue and the core unlit. Working (4 frames,
  frametime 4), the core glows Cherenkov blue and the glow pulses outward through the pool; the run lamp is green.
  Facility face: a bezel round a glovebox window with two glove ports; idle, the ion-exchange column is dark. Working (4 frames,
  frametime 4), the column glows teal and a pale bubble rises through it; the run lamp is green.
  The *_emissive layer holds only the glow and the lamp.

  Conventions: transparent background, outer 1 px ring empty, every pixel fully opaque or fully transparent, none pure black,
  emissive layer a subset of the colour layer. The final check fails the run (non-zero exit) if a written file breaks one.

  Run from the repo root:
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-UHVTranscuriumTextures.ps1

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

function New-Face {
    param([string]$Kind, [int]$Frame, [bool]$Active)
    $c = New-Bezel
    $e = New-Canvas
    for ($y = 4; $y -le 9; $y++) { for ($x = 4; $x -le 11; $x++) { Set-Px $c $x $y $Pit } }
    if ($Kind -eq 'reactor') {
        # the pool fills the window; the core sits at x7..8, y6..7
        $water = Hex '0E2440'
        for ($y = 4; $y -le 9; $y++) { for ($x = 4; $x -le 11; $x++) { Set-Px $c $x $y $water } }
        if ($Active) {
            $glow = @((Hex 'E6F4FF'), (Hex '8CC8FF'), (Hex '3C8CF0'), (Hex '1E50B4'))
            for ($y = 4; $y -le 9; $y++) {
                for ($x = 4; $x -le 11; $x++) {
                    $d = [Math]::Max([Math]::Abs(2 * $x - 15), [Math]::Abs(2 * $y - 13))
                    $ring = [int][Math]::Floor($d / 2)
                    if ($ring -eq 0) { Set-Both $c $e $x $y $glow[0]; continue }
                    # the glow pulses outward: one ring bright per frame
                    if ($ring -le 3 -and (($ring + 4 - $Frame) % 4) -eq 1) { Set-Both $c $e $x $y $glow[[Math]::Min($ring, 3)] }
                    elseif ($ring -eq 1) { Set-Both $c $e $x $y $glow[2] }
                }
            }
        }
        else {
            foreach ($p in @(@(7, 6), @(8, 6), @(7, 7), @(8, 7))) { Set-Px $c $p[0] $p[1] (Hex '2A3A50') }
        }
    }
    else {
        # the glovebox window: two glove ports on the left, the ion-exchange column at x9..10
        foreach ($g in @(@(5, 5), @(5, 8))) {
            Set-Px $c $g[0] $g[1] (Hex '3A3428'); Set-Px $c ($g[0] + 1) $g[1] (Hex '3A3428')
            Set-Px $c $g[0] ($g[1] - 1) (Hex '5A5040'); Set-Px $c ($g[0] + 1) ($g[1] - 1) (Hex '5A5040')
        }
        if ($Active) {
            $teal = @((Hex '1E8C78'), (Hex '3CC8A8'))
            for ($y = 4; $y -le 9; $y++) { Set-Both $c $e 9 $y $teal[0]; Set-Both $c $e 10 $y $teal[1] }
            $by = 9 - ($Frame % 4) - 1
            Set-Both $c $e 9 $by (Hex 'C8FFF0'); Set-Both $c $e 10 ($by + 1) (Hex 'A0F0DC')
        }
        else {
            for ($y = 4; $y -le 9; $y++) { Set-Px $c 9 $y (Hex '1C3430'); Set-Px $c 10 $y (Hex '24403A') }
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

$kinds = @(@{ Kind = 'reactor'; Dir = 'block/multiblock/high_flux_reactor' }, @{ Kind = 'facility'; Dir = 'block/multiblock/transuranium_facility' })
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
