<#
.SYNOPSIS
  Procedural 16x16 pixel art for the UXV ejecta knot sweeper and annihilation laser works controller faces, and three items, of Gregtech Grindless (package UXV-B5).

.DESCRIPTION
  Every pixel is drawn by this script (palettes and small routines); nothing is copied or edited from GregTech Modern or any
  other mod. Output is deterministic. Same method and steel bezel as Build-UXVVelaPastaTextures.ps1.

  Writes (under pack/kubejs/assets/grindless/textures/):
    block/multiblock/<machine>/overlay_front.png, overlay_front_active.png(+.mcmeta), overlay_front_active_emissive.png(+.mcmeta)
    for ejecta_knot_sweeper and annihilation_laser_works;
    item/moderated_ps_cell.png, item/spent_ti44_core.png, item/ejecta_ti_fraction_dust.png.

  Sweeper face: a scoop mouth over a hopper; working, grains stream down into the collector.
  Laser works face: a source over a long cavity ending in a nose; working, a pulse runs down the cavity and the nose flares.
  The *_emissive layer holds only the glow and the lamp.

  Conventions: transparent background, outer 1 px ring of the face empty, every pixel fully opaque or fully transparent, none pure
  black, emissive layer a subset of the colour layer. The final check fails the run (non-zero exit) if a written file breaks one.

  Run from the repo root:
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-UXVCasATextures.ps1

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
    if ($Kind -eq 'sweep') {
        # a coil mouth ring over a hopper that narrows into the collector
        $ring = Hex 'C08040'; $wall = Hex 'A8B0B8'
        foreach ($x in 4..11) { Set-Px $c $x 4 $ring }
        foreach ($row in 0..3) {
            $y = 5 + $row
            $half = [Math]::Max(1, 3 - $row)
            Set-Px $c (8 - $half) $y $wall; Set-Px $c (7 + $half) $y $wall
        }
        foreach ($x in 6..9) { Set-Px $c $x 9 (Hex '6888A8') }
        if ($Active) {
            $grain = @((Hex 'FFD080'), (Hex 'FFB860'), (Hex 'FFE8A8'), (Hex 'FFC878'))[$Frame % 4]
            $gy = 5 + ($Frame % 4)
            Set-Both $c $e 7 $gy $grain; Set-Both $c $e 8 ($gy - 1 + [int]($Frame -eq 0)) $grain
        }
    }
    else {
        # a source block on the left, a cavity along the window, a flared nose on the right
        $cav = Hex '8098B0'; $src = Hex 'D8D060'
        foreach ($y in 6, 7) { foreach ($x in 6..10) { Set-Px $c $x $y $cav } }
        foreach ($y in 5..8) { foreach ($x in 4, 5) { Set-Px $c $x $y $src } }
        foreach ($p in @(@(11, 5), @(11, 8), @(11, 6), @(11, 7))) { Set-Px $c $p[0] $p[1] (Hex 'C8D0D8') }
        if ($Active) {
            $glow = @((Hex 'C070FF'), (Hex 'D8A0FF'), (Hex 'F0D8FF'), (Hex 'FFFFFF'))[$Frame % 4]
            $gx = 6 + $Frame
            Set-Both $c $e $gx 6 $glow; Set-Both $c $e $gx 7 $glow
            if ($Frame -eq 3) { Set-Both $c $e 11 6 $glow; Set-Both $c $e 11 7 $glow }
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

$Dirs = @('block/multiblock/ejecta_knot_sweeper', 'block/multiblock/annihilation_laser_works')
$Kinds = @('sweep', 'laser')
for ($m = 0; $m -lt $Dirs.Count; $m++) {
    $idle = New-Face $Kinds[$m] 0 $false
    Out-Tex $idle.C "$($Dirs[$m])/overlay_front.png"
    $col = @(); $emi = @()
    for ($f = 0; $f -lt $Frames; $f++) { $a = New-Face $Kinds[$m] $f $true; $col += , $a.C; $emi += , $a.E }
    Out-Tex (Join-Frames $col) "$($Dirs[$m])/overlay_front_active.png" $FrameTime
    Out-Tex (Join-Frames $emi) "$($Dirs[$m])/overlay_front_active_emissive.png" $FrameTime
}

# item/moderated_ps_cell.png: a pale-blue solid-neon cell with a violet core
$cell = New-Canvas 16 16
$neon = Hex 'A8D8F0'
for ($y = 3; $y -le 12; $y++) { for ($x = 3; $x -le 12; $x++) { Set-Px $cell $x $y (Shade $neon (1.15 - 0.03 * ($x + $y - 6))) } }
foreach ($y in 6..9) { foreach ($x in 6..9) { Set-Px $cell $x $y (Hex 'B060F0') } }
foreach ($x in 3..12) { Set-Px $cell $x 3 (Hex 'E8F4FF') }
Add-Outline $cell
Out-Tex $cell 'item/moderated_ps_cell.png'

# item/spent_ti44_core.png: a dull grey tungsten capsule, its end cap cracked
$core = New-Canvas 16 16
$cap = Hex '787C84'
for ($y = 2; $y -le 13; $y++) { foreach ($x in 6..9) { Set-Px $core $x $y (Shade $cap (1.2 - 0.06 * ($x - 6) - 0.01 * $y)) } }
foreach ($x in 5, 10) { foreach ($y in 4..11) { Set-Px $core $x $y (Hex '505358') } }
foreach ($p in @(@(7, 2), @(8, 3), @(7, 4))) { Set-Px $core $p[0] $p[1] (Hex '2C2E32') }
Add-Outline $core
Out-Tex $core 'item/spent_ti44_core.png'

# item/ejecta_ti_fraction_dust.png: a heap of silver-orange grains
$dust = New-Canvas 16 16
$heap = Hex 'C8B090'
foreach ($row in 0..7) {
    $y = 12 - $row
    $half = [Math]::Max(1, 6 - $row)
    for ($x = 8 - $half; $x -le 7 + $half; $x++) { Set-Px $dust $x $y (Shade $heap (0.8 + 0.05 * $row + 0.02 * (($x * 7 + $y * 3) % 5))) }
}
foreach ($p in @(@(6, 6), @(9, 8), @(8, 5))) { Set-Px $dust $p[0] $p[1] (Hex 'F0D8B0') }
Add-Outline $dust
Out-Tex $dust 'item/ejecta_ti_fraction_dust.png'

# self-check: alpha 0 or 255, nothing pure black, ring empty (faces), emissive a subset of the colour layer, no two frames alike
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
foreach ($Dir in $Dirs) {
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
foreach ($it in 'moderated_ps_cell', 'spent_ti44_core', 'ejecta_ti_fraction_dust') {
    Test-Pixels (Read-Png (Join-Path $OutRoot "item\$it.png")) "item/$it" $false
}
if ($problems.Count -gt 0) { $problems | Select-Object -First 20 | ForEach-Object { Write-Error $_ -ErrorAction Continue }; exit 1 }

Write-Host "$ScriptName wrote $($written.Count) files"
if ($Credits) {
    foreach ($w in $written) { Write-Host "| pack/kubejs/assets/grindless/textures/$w | drawn procedurally by tools/assets/$ScriptName | ours |" }
}
