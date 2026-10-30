<#
.SYNOPSIS
  Procedural 16x16 pixel art for the UXV stellar elevator, plasma mass filter and stellar condensation tower controller faces of Gregtech Grindless (package UXV-B2).

.DESCRIPTION
  Every pixel is drawn by this script (palettes and small routines); nothing is copied or edited from GregTech Modern or any
  other mod. Output is deterministic. Same method and steel bezel as Build-UXVSpinDepositionTextures.ps1.

  Writes (under pack/kubejs/assets/grindless/textures/):
    block/multiblock/stellar_elevator/overlay_front.png, overlay_front_active.png(+.mcmeta), overlay_front_active_emissive.png(+.mcmeta)
    block/multiblock/plasma_mass_filter/ the same three files
    block/multiblock/stellar_condensation_tower/ the same three files

  Elevator face: a funnel narrowing upward; working (4 frames, frametime 4) a plasma bead climbs the funnel.
  Filter face: a coil ring round a bore; working, three coloured beads sweep and split by mass.
  Tower face: a column of seven trays; working, the glow steps up the column.
  The *_emissive layer holds only the glow and the lamp.

  Conventions: transparent background, outer 1 px ring of the face empty, every pixel fully opaque or fully transparent, none pure
  black, emissive layer a subset of the colour layer. The final check fails the run (non-zero exit) if a written file breaks one.

  Run from the repo root:
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-UXVCygnusLiftTextures.ps1

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
    if ($Kind -eq 'lift') {
        # a funnel: wide at the bottom (y9), narrow at the top (y4), steel walls
        $wall = Hex 'B8C0C8'
        foreach ($row in 0..5) {
            $y = 9 - $row
            $half = [Math]::Max(1, 4 - [int][Math]::Floor($row * 0.6))
            Set-Px $c (8 - $half) $y $wall; Set-Px $c (7 + $half) $y $wall
        }
        if ($Active) {
            $bead = @((Hex '3080FF'), (Hex '60A0FF'), (Hex '98C8FF'), (Hex 'E0F0FF'))[$Frame % 4]
            $by = @(9, 8, 6, 4)[$Frame % 4]
            Set-Both $c $e 7 $by $bead; Set-Both $c $e 8 $by $bead
            Set-Both $c $e 7 ($by + 1 - 2 * [int]($by -ge 9)) $bead
        }
    }
    elseif ($Kind -eq 'filter') {
        # a coil ring of four dots round a bore, a beam along y6/y7
        $coil = Hex 'C08040'
        foreach ($x in 5, 7, 9, 11) { Set-Px $c $x 4 $coil; Set-Px $c $x 9 $coil }
        foreach ($x in 4..11) { Set-Px $c $x 6 (Hex '2A2A44'); Set-Px $c $x 7 (Hex '2A2A44') }
        if ($Active) {
            $a = @((Hex 'FF6040'), (Hex 'FFA060'), (Hex 'FFD080'), (Hex 'FFFFFF'))[$Frame % 4]
            $b = @((Hex '40C0FF'), (Hex '60E0FF'), (Hex '90F0FF'), (Hex 'D0FFFF'))[$Frame % 4]
            Set-Both $c $e (4 + $Frame * 2) 6 $a
            Set-Both $c $e (11 - $Frame * 2) 7 $b
            Set-Both $c $e (5 + $Frame) (5 - [int]($Frame -gt 1)) $a
            Set-Both $c $e (10 - $Frame) (8 + [int]($Frame -gt 1)) $b
        }
    }
    else {
        # seven trays one over the other with a column on the left and a draw-off on the right
        $tray = Hex 'A0A8B0'
        foreach ($y in 4, 5, 6, 7, 8, 9) { Set-Px $c 5 $y (Hex '506070'); Set-Px $c 10 $y (Hex '506070') }
        foreach ($y in 4, 6, 8) { foreach ($x in 6..9) { Set-Px $c $x $y $tray } }
        if ($Active) {
            $glow = @((Hex 'FF8020'), (Hex 'FFA040'), (Hex 'FFC870'), (Hex 'FFF0C0'))[$Frame % 4]
            $gy = @(9, 8, 6, 4)[$Frame % 4]
            foreach ($x in 6..9) { Set-Both $c $e $x $gy $glow }
            Set-Both $c $e 10 $gy $glow
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

$Dirs = @('block/multiblock/stellar_elevator', 'block/multiblock/plasma_mass_filter', 'block/multiblock/stellar_condensation_tower')
$Kinds = @('lift', 'filter', 'tower')
for ($m = 0; $m -lt $Dirs.Count; $m++) {
    $idle = New-Face $Kinds[$m] 0 $false
    Out-Tex $idle.C "$($Dirs[$m])/overlay_front.png"
    $col = @(); $emi = @()
    for ($f = 0; $f -lt $Frames; $f++) { $a = New-Face $Kinds[$m] $f $true; $col += , $a.C; $emi += , $a.E }
    Out-Tex (Join-Frames $col) "$($Dirs[$m])/overlay_front_active.png" $FrameTime
    Out-Tex (Join-Frames $emi) "$($Dirs[$m])/overlay_front_active_emissive.png" $FrameTime
}

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
