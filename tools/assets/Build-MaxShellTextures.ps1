<#
.SYNOPSIS
  Procedural 16x16 pixel art for the MAX mirror shell controller face (package MAX-G1) of Gregtech Grindless.

.DESCRIPTION
  Every pixel is drawn by this script; nothing is copied or edited from GregTech Modern or any other mod. Output is deterministic.
  Same method and steel bezel as Build-MaxGeneArkTextures.ps1.

  Writes (under pack/kubejs/assets/grindless/textures/):
    block/multiblock/mirror_shell/overlay_front.png, overlay_front_active.png(+.mcmeta), overlay_front_active_emissive.png(+.mcmeta)

  Face: a round mirror seen from inside with a dark hole in the middle and a ring of light round it. Working (4 frames, frametime 4) the
  ring brightens and a wave crest runs round it. The *_emissive layer holds only the glow and the lamp.

  Conventions: transparent background, outer 1 px ring empty, every pixel fully opaque or fully transparent, none pure black, emissive
  layer a subset of the colour layer. The final check fails the run (non-zero exit) if a written file breaks one.

  Run from the repo root:
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-MaxShellTextures.ps1

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

$Lit = Hex 'B0B0B0'; $Mid = Hex '707070'; $Dark = Hex '404040'; $Deep = Hex '222222'; $Pit = Hex '161C24'
$LampOn = Hex 'FFC862'; $LampOff = Hex '6B4A0C'

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

# the ring round the hole: the 12 cells at distance 3 from the centre (7.5, 6.5) of the window x 3-12, y 3-10, clockwise from the top
$Ring = @(@(7, 3), @(8, 3), @(10, 4), @(11, 6), @(11, 7), @(10, 9), @(8, 10), @(7, 10), @(5, 9), @(4, 7), @(4, 6), @(5, 4))

function New-Face {
    param([int]$Frame, [bool]$Active)
    $c = New-Bezel
    $e = New-Canvas
    for ($y = 3; $y -le 10; $y++) { for ($x = 3; $x -le 12; $x++) { Set-Px $c $x $y $Pit } }
    $mirror = Hex '9CB4C8'; $edge = Hex '4A6078'; $hole = Hex '0A0C12'
    foreach ($p in $Ring) { Set-Px $c $p[0] $p[1] $mirror }
    foreach ($p in @(@(6, 5), @(9, 5), @(6, 8), @(9, 8))) { Set-Px $c $p[0] $p[1] $edge }
    for ($y = 6; $y -le 7; $y++) { for ($x = 7; $x -le 8; $x++) { Set-Px $c $x $y $hole } }
    if ($Active) {
        $glow = Hex 'FFE6A0'; $halo = Hex 'E89C38'
        $i = ($Frame * 3) % 12
        $j = ($i + 6) % 12
        Set-Both $c $e $Ring[$i][0] $Ring[$i][1] $glow
        Set-Both $c $e $Ring[($i + 1) % 12][0] $Ring[($i + 1) % 12][1] $halo
        Set-Both $c $e $Ring[$j][0] $Ring[$j][1] $halo
        Set-Both $c $e $Ring[($j + 1) % 12][0] $Ring[($j + 1) % 12][1] $glow
    }
    $lamp = $(if ($Active) { $LampOn } else { $LampOff })
    Set-Px $c 7 12 $lamp; Set-Px $c 8 12 $lamp
    if ($Active) { Set-Px $e 7 12 $LampOn; Set-Px $e 8 12 $LampOn }
    for ($i = 0; $i -lt 16; $i++) { foreach ($p in @(@($i, 0), @($i, 15), @(0, $i), @(15, $i))) { Set-Px $c $p[0] $p[1] 0; Set-Px $e $p[0] $p[1] 0 } }
    return @{ C = $c; E = $e }
}

$Dir = 'block/multiblock/mirror_shell'
$idle = New-Face 0 $false
Out-Tex $idle.C "$Dir/overlay_front.png"
$col = @(); $emi = @()
for ($f = 0; $f -lt $Frames; $f++) { $a = New-Face $f $true; $col += , $a.C; $emi += , $a.E }
Out-Tex (Join-Frames $col) "$Dir/overlay_front_active.png" $FrameTime
Out-Tex (Join-Frames $emi) "$Dir/overlay_front_active_emissive.png" $FrameTime

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
if ($problems.Count -gt 0) { $problems | Select-Object -First 20 | ForEach-Object { Write-Error $_ -ErrorAction Continue }; exit 1 }

Write-Host "$ScriptName wrote $($written.Count) files"
if ($Credits) {
    foreach ($w in $written) { Write-Host "| pack/kubejs/assets/grindless/textures/$w | drawn procedurally by tools/assets/$ScriptName | ours |" }
}
