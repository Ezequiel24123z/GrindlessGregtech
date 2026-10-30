<#
.SYNOPSIS
  Procedural 16x16 pixel art for the UXV pasta extractor, phase sorter, draw bench, laminator and polar cap tap controller faces of Gregtech Grindless (package UXV-B4).

.DESCRIPTION
  Every pixel is drawn by this script (palettes and small routines); nothing is copied or edited from GregTech Modern or any
  other mod. Output is deterministic. Same method and steel bezel as Build-UXVCygnusLiftTextures.ps1.

  Writes (under pack/kubejs/assets/grindless/textures/):
    block/multiblock/<machine>/overlay_front.png, overlay_front_active.png(+.mcmeta), overlay_front_active_emissive.png(+.mcmeta)
    for pasta_extractor, pasta_phase_sorter, pasta_draw_bench, pasta_laminator and polar_cap_tap.

  Extractor face: a funnel throat over a cage; working, a bead climbs it.
  Sorter face: an arc over five bins; working, a bead sweeps the arc and drops into the bins in turn.
  Draw bench face: a strand across the window; working, a bright spot runs along it.
  Laminator face: a crosshead over a bed; working, the ram drops and rises.
  Tap face: a mast with a vented crown; working, sparks climb the mast.
  The *_emissive layer holds only the glow and the lamp.

  Conventions: transparent background, outer 1 px ring of the face empty, every pixel fully opaque or fully transparent, none pure
  black, emissive layer a subset of the colour layer. The final check fails the run (non-zero exit) if a written file breaks one.

  Run from the repo root:
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-UXVVelaPastaTextures.ps1

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
    if ($Kind -eq 'extract') {
        # a funnel: wide at the top (y4), narrow at the bottom (y9), over a cage bar
        $wall = Hex 'B8C0C8'
        foreach ($row in 0..4) {
            $y = 4 + $row
            $half = [Math]::Max(1, 4 - [int][Math]::Floor($row * 0.7))
            Set-Px $c (8 - $half) $y $wall; Set-Px $c (7 + $half) $y $wall
        }
        foreach ($x in 5..10) { Set-Px $c $x 9 (Hex '6888A8') }
        if ($Active) {
            $bead = @((Hex 'E0A0FF'), (Hex 'D080FF'), (Hex 'C060FF'), (Hex 'F0D0FF'))[$Frame % 4]
            $by = @(8, 7, 6, 5)[$Frame % 4]
            Set-Both $c $e 7 $by $bead; Set-Both $c $e 8 $by $bead
        }
    }
    elseif ($Kind -eq 'sort') {
        # five bins along the bottom under a coil arc
        $bin = Hex '6888A8'; $coil = Hex 'C08040'
        foreach ($i in 0..4) { $x = 4 + $i * 2; Set-Px $c $x 9 $bin; Set-Px $c $x 8 $bin }
        foreach ($p in @(@(4, 6), @(5, 5), @(6, 4), @(7, 4), @(8, 4), @(9, 4), @(10, 5), @(11, 6))) { Set-Px $c $p[0] $p[1] $coil }
        if ($Active) {
            $arc = @(@(5, 5), @(7, 4), @(9, 4), @(10, 5))[$Frame % 4]
            $glow = @((Hex 'FFB060'), (Hex 'FFD090'), (Hex 'FFE8B8'), (Hex 'FFFFFF'))[$Frame % 4]
            Set-Both $c $e $arc[0] $arc[1] $glow
            Set-Both $c $e (4 + [int]$Frame * 2) 7 $glow
        }
    }
    elseif ($Kind -eq 'draw') {
        # a strand across the window between two capstans
        $strand = Hex '8098B0'
        foreach ($x in 4..11) { Set-Px $c $x 6 $strand; Set-Px $c $x 7 $strand }
        foreach ($x in 6, 9) { foreach ($y in 4, 5, 8, 9) { Set-Px $c $x $y (Hex '98A0A8') } }
        if ($Active) {
            $glow = @((Hex '40E0FF'), (Hex '70F0FF'), (Hex 'A0F8FF'), (Hex 'E0FFFF'))[$Frame % 4]
            $gx = 4 + $Frame * 2
            Set-Both $c $e $gx 6 $glow; Set-Both $c $e ($gx + 1) 7 $glow
        }
    }
    elseif ($Kind -eq 'lam') {
        # a crosshead over a bed, two columns, a ram between
        $col = Hex '708098'
        foreach ($y in 4..9) { Set-Px $c 4 $y $col; Set-Px $c 11 $y $col }
        foreach ($x in 5..10) { Set-Px $c $x 4 (Hex 'A0A8B0'); Set-Px $c $x 9 (Hex 'A0A8B0') }
        $drop = @(0, 1, 2, 1)[$Frame % 4]
        foreach ($y in 5..(5 + $drop)) { Set-Px $c 7 $y (Hex '787878'); Set-Px $c 8 $y (Hex '787878') }
        if ($Active) {
            $glow = @((Hex 'FFA040'), (Hex 'FFC060'), (Hex 'FFE090'), (Hex 'FFC060'))[$Frame % 4]
            Set-Both $c $e 7 (6 + $drop) $glow; Set-Both $c $e 8 (6 + $drop) $glow
        }
    }
    else {
        # a mast with a vented crown over a broad base
        $mast = Hex '98A0B0'
        foreach ($y in 5..8) { Set-Px $c 7 $y $mast; Set-Px $c 8 $y $mast }
        foreach ($x in 6, 9) { Set-Px $c $x 4 (Hex 'C07038') }
        foreach ($x in 5..10) { Set-Px $c $x 9 (Hex '707888') }
        if ($Active) {
            $spark = @((Hex 'FFFF60'), (Hex 'FFFFA0'), (Hex 'FFFFD0'), (Hex 'FFFFFF'))[$Frame % 4]
            $sy = @(8, 7, 6, 5)[$Frame % 4]
            Set-Both $c $e 6 $sy $spark; Set-Both $c $e 9 ($sy - 1) $spark
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

$Dirs = @('block/multiblock/pasta_extractor', 'block/multiblock/pasta_phase_sorter', 'block/multiblock/pasta_draw_bench', 'block/multiblock/pasta_laminator', 'block/multiblock/polar_cap_tap')
$Kinds = @('extract', 'sort', 'draw', 'lam', 'tap')
for ($m = 0; $m -lt $Dirs.Count; $m++) {
    $idle = New-Face $Kinds[$m] 0 $false
    Out-Tex $idle.C "$($Dirs[$m])/overlay_front.png"
    $col = @(); $emi = @()
    for ($f = 0; $f -lt $Frames; $f++) { $a = New-Face $Kinds[$m] $f $true; $col += , $a.C; $emi += , $a.E }
    Out-Tex (Join-Frames $col) "$($Dirs[$m])/overlay_front_active.png" $FrameTime
    Out-Tex (Join-Frames $emi) "$($Dirs[$m])/overlay_front_active_emissive.png" $FrameTime
}

# item/lasagna_electrode.png: a gold plate with two wire strands wound across it
$el = New-Canvas 16 16
$plate = Hex 'D0B870'; $strand = Hex '5878C8'
for ($y = 2; $y -le 13; $y++) { for ($x = 3; $x -le 12; $x++) { Set-Px $el $x $y (Shade $plate (1.2 - 0.035 * ($x + $y))) } }
foreach ($y in 5, 6, 9, 10) { for ($x = 3; $x -le 12; $x++) { Set-Px $el $x $y (Shade $strand (1.15 - 0.03 * $x)) } }
foreach ($x in 7, 8) { for ($y = 0; $y -le 1; $y++) { Set-Px $el $x $y (Hex 'F8ECB0') } }
Add-Outline $el
$ItemOut = 'item/lasagna_electrode.png'
Save-Png $el (Join-Path $OutRoot $ItemOut)
$written.Add($ItemOut)

# self-check: alpha 0 or 255, nothing pure black, ring empty, emissive a subset of the colour layer, no two frames alike
$problems = New-Object System.Collections.Generic.List[string]
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
foreach ($Dir in $Dirs) {
    $png = @{}
    foreach ($n in 'overlay_front', 'overlay_front_active', 'overlay_front_active_emissive') { $png[$n] = Read-Png (Join-Path $OutRoot ("$Dir/$n.png" -replace '/', '\')) }
    foreach ($n in $png.Keys) { Test-Pixels $png[$n] "$Dir/$n" }
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
