<#
.SYNOPSIS
  Procedural 16x16 pixel art for the OpV Kugelblitz forge and Hawking collector controller faces, and three items, of Gregtech Grindless (package OpV-D3).

.DESCRIPTION
  Every pixel is drawn by this script (palettes and small routines); nothing is copied or edited from GregTech Modern or any
  other mod. Output is deterministic. Same method and steel bezel as Build-UXVCasATextures.ps1.

  Writes (under pack/kubejs/assets/grindless/textures/):
    block/multiblock/<machine>/overlay_front.png, overlay_front_active.png(+.mcmeta), overlay_front_active_emissive.png(+.mcmeta)
    for kugelblitz_forge and hawking_collector;
    item/gamma_pump_charge.png, item/kugelblitz_seed.png, item/evaporated_core_shell.png.

  Forge face: four lens arms converging on a point; working, a violet pulse runs in and the point flares.
  Collector face: a ring round a core; working, an amber glow circles the ring.
  The *_emissive layer holds only the glow and the lamp.

  Conventions: transparent background, outer 1 px ring of the face empty, every pixel fully opaque or fully transparent, none pure
  black, emissive layer a subset of the colour layer. The final check fails the run (non-zero exit) if a written file breaks one.

  Run from the repo root:
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-OpVKugelblitzTextures.ps1

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
    if ($Kind -eq 'forge') {
        # four lens arms (glass-blue) converging on the focus point in the middle of the window
        $arm = Hex '88B8D8'
        foreach ($p in @(@(4, 4), @(5, 5), @(11, 4), @(10, 5), @(4, 9), @(5, 8), @(11, 9), @(10, 8))) { Set-Px $c $p[0] $p[1] $arm }
        Set-Px $c 7 6 (Hex 'F0F0FF'); Set-Px $c 8 7 (Hex 'F0F0FF')
        if ($Active) {
            $glow = @((Hex 'C070FF'), (Hex 'D8A0FF'), (Hex 'F0D8FF'), (Hex 'FFFFFF'))[$Frame % 4]
            $o = 2 - ($Frame % 3)
            foreach ($p in @(@(6, 5), @(9, 5), @(6, 8), @(9, 8))) {
                $px = $p[0] + [int][Math]::Sign(7.5 - $p[0]) * ($Frame % 2); $py = $p[1] + [int][Math]::Sign(6.5 - $p[1]) * ($Frame % 2)
                Set-Both $c $e $px $py $glow
            }
            if ($Frame -eq 3) { Set-Both $c $e 7 7 $glow; Set-Both $c $e 8 6 $glow }
        }
    }
    else {
        # a ring of absorber plate round a dark core; working, an amber spark circles the ring
        $ring = Hex 'A89078'
        foreach ($p in @(@(6, 4), @(7, 4), @(8, 4), @(9, 4), @(5, 5), @(10, 5), @(4, 6), @(11, 6), @(4, 7), @(11, 7), @(5, 8), @(10, 8), @(6, 9), @(7, 9), @(8, 9), @(9, 9))) { Set-Px $c $p[0] $p[1] $ring }
        foreach ($p in @(@(7, 6), @(8, 6), @(7, 7), @(8, 7))) { Set-Px $c $p[0] $p[1] (Hex '3A2A4A') }
        if ($Active) {
            $spark = @((Hex 'FFB030'), (Hex 'FFD060'), (Hex 'FFE8A0'), (Hex 'FFC040'))[$Frame % 4]
            $path = @(@(7, 4), @(10, 5), @(11, 7), @(8, 9))
            $q = $path[$Frame % 4]
            Set-Both $c $e $q[0] $q[1] $spark
            $r = $path[($Frame + 2) % 4]
            Set-Both $c $e $r[0] $r[1] (Hex 'FF8020')
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

$Dirs = @('block/multiblock/kugelblitz_forge', 'block/multiblock/hawking_collector')
$Kinds = @('forge', 'collector')
for ($m = 0; $m -lt $Dirs.Count; $m++) {
    $idle = New-Face $Kinds[$m] 0 $false
    Out-Tex $idle.C "$($Dirs[$m])/overlay_front.png"
    $col = @(); $emi = @()
    for ($f = 0; $f -lt $Frames; $f++) { $a = New-Face $Kinds[$m] $f $true; $col += , $a.C; $emi += , $a.E }
    Out-Tex (Join-Frames $col) "$($Dirs[$m])/overlay_front_active.png" $FrameTime
    Out-Tex (Join-Frames $emi) "$($Dirs[$m])/overlay_front_active_emissive.png" $FrameTime
}

# item/gamma_pump_charge.png: a violet-white capsule with a bright cell in the middle
$charge = New-Canvas 16 16
$cap = Hex '9078C0'
for ($y = 3; $y -le 12; $y++) { foreach ($x in 5..10) { Set-Px $charge $x $y (Shade $cap (1.2 - 0.05 * ($x - 5) - 0.01 * $y)) } }
foreach ($y in 6..9) { foreach ($x in 7..8) { Set-Px $charge $x $y (Hex 'F4F0FF') } }
foreach ($x in 5..10) { Set-Px $charge $x 3 (Hex 'D8D0F0'); Set-Px $charge $x 12 (Hex '584878') }
Add-Outline $charge
Out-Tex $charge 'item/gamma_pump_charge.png'

# item/kugelblitz_seed.png: a small white-hot point in a dark sphere
$seed = New-Canvas 16 16
$sphere = Hex '484058'
for ($y = 2; $y -le 13; $y++) {
    for ($x = 2; $x -le 13; $x++) {
        $dx = $x - 7.5; $dy = $y - 7.5
        if (($dx * $dx + $dy * $dy) -le 20) { Set-Px $seed $x $y (Shade $sphere (1.25 - 0.04 * ($x + $y - 8))) }
    }
}
foreach ($p in @(@(7, 7), @(8, 7), @(7, 8), @(8, 8))) { Set-Px $seed $p[0] $p[1] (Hex 'FFFFFF') }
foreach ($p in @(@(6, 7), @(9, 8), @(7, 6), @(8, 9))) { Set-Px $seed $p[0] $p[1] (Hex 'D0C0FF') }
Add-Outline $seed
Out-Tex $seed 'item/kugelblitz_seed.png'

# item/evaporated_core_shell.png: a hollow grey shell, cracked open
$shell = New-Canvas 16 16
$wall = Hex '908C88'
for ($y = 2; $y -le 13; $y++) {
    for ($x = 2; $x -le 13; $x++) {
        $dx = $x - 7.5; $dy = $y - 7.5; $r = $dx * $dx + $dy * $dy
        if ($r -le 22 -and $r -ge 9) { Set-Px $shell $x $y (Shade $wall (1.2 - 0.04 * ($x + $y - 8))) }
        elseif ($r -lt 9) { Set-Px $shell $x $y (Hex '2C2A30') }
    }
}
foreach ($p in @(@(9, 2), @(9, 3), @(10, 4), @(11, 4))) { Set-Px $shell $p[0] $p[1] (Hex '3C3A40') }
Add-Outline $shell
Out-Tex $shell 'item/evaporated_core_shell.png'

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
foreach ($it in 'gamma_pump_charge', 'kugelblitz_seed', 'evaporated_core_shell') {
    Test-Pixels (Read-Png (Join-Path $OutRoot "item\$it.png")) "item/$it" $false
}
if ($problems.Count -gt 0) { $problems | Select-Object -First 20 | ForEach-Object { Write-Error $_ -ErrorAction Continue }; exit 1 }

Write-Host "$ScriptName wrote $($written.Count) files"
if ($Credits) {
    foreach ($w in $written) { Write-Host "| pack/kubejs/assets/grindless/textures/$w | drawn procedurally by tools/assets/$ScriptName | ours |" }
}
