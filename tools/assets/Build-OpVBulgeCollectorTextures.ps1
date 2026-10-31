<#
.SYNOPSIS
  Procedural 16x16 pixel art for the two OpV collector controller faces and the two items of package OpV-R3 of Gregtech Grindless.

.DESCRIPTION
  Every pixel is drawn by this script (palettes and small routines); nothing is copied or edited from GregTech Modern or any
  other mod. Output is deterministic. Same method and steel bezel as Build-OpVReplicationTextures.ps1.

  Writes (under pack/kubejs/assets/grindless/textures/):
    block/multiblock/<machine>/overlay_front.png, overlay_front_active.png(+.mcmeta), overlay_front_active_emissive.png(+.mcmeta)
      for collector_node_works and bulge_collector;
    item/<id>.png for si_ribbon and pv_collector_film.

  Works face: a conveyor carrying a film under a deposition head. Collector face: a dish with a coil spine, light rays falling in.
  The *_emissive layer holds only the glow and the lamp.

  Conventions: transparent background, outer 1 px ring of the face empty, every pixel fully opaque or fully transparent, none pure
  black, emissive layer a subset of the colour layer. The final check fails the run (non-zero exit) if a written file breaks one.

  Run from the repo root:
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-OpVBulgeCollectorTextures.ps1

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

# the window x4..11, y4..9 is cleared to pit black; $Draw fills it, then the lamp and the empty ring are added
function New-Face {
    param([int]$Frame, [bool]$Active, [scriptblock]$Draw)
    $c = New-Bezel
    $e = New-Canvas
    for ($y = 4; $y -le 9; $y++) { for ($x = 4; $x -le 11; $x++) { Set-Px $c $x $y $Pit } }
    & $Draw $c $e $Frame $Active
    Set-Px $c 7 12 $(if ($Active) { $LampOn } else { $LampOff })
    Set-Px $c 8 12 $(if ($Active) { $LampOn } else { $LampOff })
    if ($Active) { Set-Px $e 7 12 $LampOn; Set-Px $e 8 12 $LampOn }
    for ($i = 0; $i -lt 16; $i++) { foreach ($p in @(@($i, 0), @($i, 15), @(0, $i), @(15, $i))) { Set-Px $c $p[0] $p[1] 0; Set-Px $e $p[0] $p[1] 0 } }
    return @{ C = $c; E = $e }
}

$Faces = [ordered]@{}

# works: a belt along the bottom of the window carrying a film, a deposition head above it; working, the film slides and the head glows
$Faces['collector_node_works'] = {
    param($c, $e, $f, $act)
    $steel = Hex 'A8B0B8'; $film = Hex '3C5CA8'
    foreach ($x in 4..11) { Set-Px $c $x 9 $steel }
    foreach ($x in 7..8) { foreach ($y in 4..5) { Set-Px $c $x $y $steel } }
    Set-Px $c 7 6 $steel; Set-Px $c 8 6 $steel
    $fx = if ($act) { 4 + ($f % 4) } else { 4 }
    foreach ($x in $fx..($fx + 3)) { Set-Px $c $x 8 $film }
    if ($act) {
        $glow = @((Hex 'FFE070'), (Hex 'FFF0A0'), (Hex 'FFFFD8'), (Hex 'FFD058'))[$f % 4]
        Set-Both $c $e 7 7 $glow; Set-Both $c $e 8 7 $glow
        if (($f % 2) -eq 0) { Set-Both $c $e (5 + ($f % 4) * 2) 8 (Hex '70A8FF') }
    }
}

# collector: a dish (bowl) with a coil spine standing in it; working, rays fall into the dish and the coil pulses
$Faces['bulge_collector'] = {
    param($c, $e, $f, $act)
    $steel = Hex 'A8B0B8'; $coil = Hex 'C87838'
    foreach ($p in @(@(4, 7), @(5, 8), @(6, 9), @(7, 9), @(8, 9), @(9, 9), @(10, 8), @(11, 7))) { Set-Px $c $p[0] $p[1] $steel }
    foreach ($y in 5..8) { Set-Px $c 7 $y $coil; Set-Px $c 8 $y $coil }
    if ($act) {
        $ray = @((Hex 'FFF8C0'), (Hex 'FFE880'), (Hex 'FFFFE8'), (Hex 'FFD860'))[$f % 4]
        foreach ($k in 0..2) { $ry = 4 + (($f + $k * 2) % 4); Set-Both $c $e (5 + $k * 3) $ry $ray }
        $pulse = @((Hex 'FFB060'), (Hex 'FFD090'), (Hex 'FFE8B8'), (Hex 'FFC078'))[$f % 4]
        Set-Both $c $e 7 6 $pulse; Set-Both $c $e 8 7 $pulse
    }
}

foreach ($name in $Faces.Keys) {
    $dir = "block/multiblock/$name"
    $idle = New-Face 0 $false $Faces[$name]
    Out-Tex $idle.C "$dir/overlay_front.png"
    $col = @(); $emi = @()
    for ($f = 0; $f -lt $Frames; $f++) { $a = New-Face $f $true $Faces[$name]; $col += , $a.C; $emi += , $a.E }
    Out-Tex (Join-Frames $col) "$dir/overlay_front_active.png" $FrameTime
    Out-Tex (Join-Frames $emi) "$dir/overlay_front_active_emissive.png" $FrameTime
}

# item/si_ribbon.png: a coiled silver-grey strip
$rib = New-Canvas 16 16
foreach ($y in 3..12) {
    $x0 = 2 + (($y * 3) % 5)
    foreach ($x in $x0..($x0 + 7)) { Set-Px $rib $x $y (Shade (Hex 'B4BCC8') (0.8 + 0.03 * (($x + $y) % 7))) }
}
foreach ($p in @(@(5, 4), @(9, 8), @(7, 11))) { Set-Px $rib $p[0] $p[1] (Hex 'F0F4FC') }
Add-Outline $rib
Out-Tex $rib 'item/si_ribbon.png'

# item/pv_collector_film.png: a dark blue sheet with a pale grid and busbars
$film = New-Canvas 16 16
for ($y = 2; $y -le 13; $y++) {
    for ($x = 2; $x -le 13; $x++) {
        $col = if ((($x % 4) -eq 1) -or (($y % 4) -eq 1)) { Hex '8CA8E0' } else { Shade (Hex '2C3C78') (0.85 + 0.04 * (($x * 3 + $y) % 5)) }
        Set-Px $film $x $y $col
    }
}
foreach ($y in 2..13) { Set-Px $film 13 $y (Hex 'D8D8E0') }
Add-Outline $film
Out-Tex $film 'item/pv_collector_film.png'

$Items = @('si_ribbon', 'pv_collector_film')

# self-check: alpha 0 or 255, nothing pure black, ring empty (face), emissive a subset of the colour layer, no two frames alike
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
foreach ($name in $Faces.Keys) {
    $dir = "block/multiblock/$name"
    $png = @{}
    foreach ($n in 'overlay_front', 'overlay_front_active', 'overlay_front_active_emissive') { $png[$n] = Read-Png (Join-Path $OutRoot ("$dir/$n.png" -replace '/', '\')) }
    foreach ($n in $png.Keys) { Test-Pixels $png[$n] "$dir/$n" $true }
    $cl = $png['overlay_front_active']; $em = $png['overlay_front_active_emissive']
    for ($i = 0; $i -lt $cl.P.Length; $i++) { if ($em.P[$i] -ne 0 -and $em.P[$i] -ne $cl.P[$i]) { $problems.Add("${dir}: emissive differs from colour at $i") } }
    for ($f = 0; $f -lt $Frames - 1; $f++) {
        $same = $true
        for ($i = 0; $i -lt 256; $i++) { if ($cl.P[$f * 256 + $i] -ne $cl.P[($f + 1) * 256 + $i]) { $same = $false; break } }
        if ($same) { $problems.Add("${dir}: frame $f repeats frame $($f + 1)") }
    }
}
foreach ($it in $Items) { Test-Pixels (Read-Png (Join-Path $OutRoot "item\$it.png")) "item/$it" $false }
if ($problems.Count -gt 0) { $problems | Select-Object -First 20 | ForEach-Object { Write-Error $_ -ErrorAction Continue }; exit 1 }

Write-Host "$ScriptName wrote $($written.Count) files"
if ($Credits) {
    foreach ($w in $written) { Write-Host "| pack/kubejs/assets/grindless/textures/$w | drawn procedurally by tools/assets/$ScriptName | ours |" }
}
