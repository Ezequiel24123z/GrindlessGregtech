<#
.SYNOPSIS
  Procedural 16x16 pixel art for the UXV accretion disk skimmer, FRC former and BZ dynamo controller faces and the strand coil item of Gregtech Grindless (package UXV-B3).

.DESCRIPTION
  Every pixel is drawn by this script (palettes and small routines); nothing is copied or edited from GregTech Modern or any
  other mod. Output is deterministic. Same method and steel bezel as Build-UXVCygnusLiftTextures.ps1.

  Writes (under pack/kubejs/assets/grindless/textures/):
    block/multiblock/accretion_disk_skimmer/overlay_front.png, overlay_front_active.png(+.mcmeta), overlay_front_active_emissive.png(+.mcmeta)
    block/multiblock/frc_former/ the same three files
    block/multiblock/bz_dynamo/ the same three files
    item/strand_coil.png

  Skimmer face: a shallow dish with a throat; working, plasma beads run down into the throat.
  Former face: a tube ringed with coils; working, a bright plasmoid pulse runs along the tube.
  Dynamo face: a torus round a jet column; working, the jet pulses up and down.
  Coil item: a steel former wound in teal strand, one turn lit.
  The *_emissive layer holds only the glow and the lamp.

  Conventions: transparent background, outer 1 px ring of a face empty, every pixel fully opaque or fully transparent, none pure
  black, emissive layer a subset of the colour layer. The final check fails the run (non-zero exit) if a written file breaks one.

  Run from the repo root:
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-UXVCygnusDiskTextures.ps1

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

function New-Face {
    param([string]$Kind, [int]$Frame, [bool]$Active)
    $c = New-Bezel
    $e = New-Canvas
    for ($y = 4; $y -le 9; $y++) { for ($x = 4; $x -le 11; $x++) { Set-Px $c $x $y $Pit } }
    if ($Kind -eq 'dish') {
        # a shallow dish rim on y4 narrowing to a throat at y9
        $rim = Hex 'C8B070'
        foreach ($x in 4..11) { Set-Px $c $x 4 $rim }
        Set-Px $c 5 5 $rim; Set-Px $c 10 5 $rim
        Set-Px $c 6 6 $rim; Set-Px $c 9 6 $rim
        Set-Px $c 6 8 (Hex '8090A0'); Set-Px $c 9 8 (Hex '8090A0')
        Set-Px $c 6 9 (Hex '8090A0'); Set-Px $c 9 9 (Hex '8090A0')
        if ($Active) {
            $b = @((Hex 'FF7020'), (Hex 'FFA040'), (Hex 'FFD070'), (Hex 'FFF0B0'))[$Frame % 4]
            $by = @(5, 6, 7, 9)[$Frame % 4]
            Set-Both $c $e (7 - [int]($Frame -lt 2)) $by $b
            Set-Both $c $e (8 + [int]($Frame -lt 2)) $by $b
            Set-Both $c $e 7 ($by + 1 - 2 * [int]($by -ge 9)) $b
        }
    }
    elseif ($Kind -eq 'tube') {
        # a tube on y6/y7 with a coil ring over it at x5, x7, x9, x11
        $coil = Hex 'C08040'
        foreach ($x in 4..11) { Set-Px $c $x 6 (Hex '2A2A44'); Set-Px $c $x 7 (Hex '2A2A44') }
        foreach ($x in 5, 7, 9, 11) { foreach ($y in 4, 5, 8, 9) { Set-Px $c $x $y $coil } }
        if ($Active) {
            $a = @((Hex 'FF40C0'), (Hex 'FF70D8'), (Hex 'FFA0E8'), (Hex 'FFE0F8'))[$Frame % 4]
            Set-Both $c $e (4 + $Frame * 2) 6 $a; Set-Both $c $e (5 + $Frame * 2) 6 $a
            Set-Both $c $e (4 + $Frame * 2) 7 $a; Set-Both $c $e (5 + $Frame * 2) 7 $a
        }
    }
    else {
        # a torus (ellipse ring) round a central jet column
        $ring = Hex '9090B0'
        foreach ($x in 5..10) { Set-Px $c $x 8 $ring }
        foreach ($x in 4, 11) { Set-Px $c $x 7 $ring }
        foreach ($x in 5, 10) { Set-Px $c $x 9 $ring }
        foreach ($x in 6..9) { Set-Px $c $x 9 $ring }
        Set-Px $c 7 5 (Hex '303050'); Set-Px $c 8 5 (Hex '303050'); Set-Px $c 7 6 (Hex '303050'); Set-Px $c 8 6 (Hex '303050'); Set-Px $c 7 7 (Hex '303050'); Set-Px $c 8 7 (Hex '303050')
        if ($Active) {
            $j = @((Hex '40A0FF'), (Hex '70C0FF'), (Hex 'A8E0FF'), (Hex 'F0FFFF'))[$Frame % 4]
            $top = @(7, 6, 5, 4)[$Frame % 4]
            foreach ($y in $top..7) { Set-Both $c $e 7 $y $j; Set-Both $c $e 8 $y $j }
            Set-Both $c $e 4 7 $j; Set-Both $c $e 11 7 $j
        }
    }
    Set-Px $c 7 12 $(if ($Active) { $LampOn } else { $LampOff })
    Set-Px $c 8 12 $(if ($Active) { $LampOn } else { $LampOff })
    if ($Active) { Set-Px $e 7 12 $LampOn; Set-Px $e 8 12 $LampOn }
    for ($i = 0; $i -lt 16; $i++) { foreach ($p in @(@($i, 0), @($i, 15), @(0, $i), @(15, $i))) { Set-Px $c $p[0] $p[1] 0; Set-Px $e $p[0] $p[1] 0 } }
    return @{ C = $c; E = $e }
}

$Dirs = @('block/multiblock/accretion_disk_skimmer', 'block/multiblock/frc_former', 'block/multiblock/bz_dynamo')
$Kinds = @('dish', 'tube', 'torus')
for ($m = 0; $m -lt $Dirs.Count; $m++) {
    $idle = New-Face $Kinds[$m] 0 $false
    Out-Tex $idle.C "$($Dirs[$m])/overlay_front.png"
    $col = @(); $emi = @()
    for ($f = 0; $f -lt $Frames; $f++) { $a = New-Face $Kinds[$m] $f $true; $col += , $a.C; $emi += , $a.E }
    Out-Tex (Join-Frames $col) "$($Dirs[$m])/overlay_front_active.png" $FrameTime
    Out-Tex (Join-Frames $emi) "$($Dirs[$m])/overlay_front_active_emissive.png" $FrameTime
}

# the strand coil item: a ring of teal turns round a steel former; the corners stay clear
$item = New-Canvas
$steel = Hex 'A8B0B8'; $steelDk = Hex '606870'
$teal = @((Hex '20B8A8'), (Hex '38D8C8'), (Hex '108878'))
for ($y = 0; $y -lt 16; $y++) {
    for ($x = 0; $x -lt 16; $x++) {
        $d = [Math]::Sqrt([Math]::Pow($x - 7.5, 2) + [Math]::Pow($y - 7.5, 2))
        if ($d -le 3.0) { Set-Px $item $x $y $(if (($x + $y) % 2 -eq 0) { $steel } else { $steelDk }) }
        elseif ($d -le 6.6) { Set-Px $item $x $y $teal[(($x * 2 + $y) % 3)] }
    }
}
foreach ($p in @(@(7, 7), @(8, 7), @(7, 8), @(8, 8))) { Set-Px $item $p[0] $p[1] $Deep }
Out-Tex $item 'item/strand_coil.png'

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
$coilPng = Read-Png (Join-Path $OutRoot 'item\strand_coil.png')
Test-Pixels $coilPng 'item/strand_coil' $false
if ((($coilPng.P[0] -shr 24) -band 255) -ne 0) { $problems.Add('item/strand_coil: corner is not transparent') }
$opaque = 0; foreach ($v in $coilPng.P) { if ((($v -shr 24) -band 255) -eq 255) { $opaque++ } }
if ($opaque -lt 20) { $problems.Add("item/strand_coil: only $opaque opaque pixels") }
if ($problems.Count -gt 0) { $problems | Select-Object -First 20 | ForEach-Object { Write-Error $_ -ErrorAction Continue }; exit 1 }

Write-Host "$ScriptName wrote $($written.Count) files"
if ($Credits) {
    foreach ($w in $written) { Write-Host "| pack/kubejs/assets/grindless/textures/$w | drawn procedurally by tools/assets/$ScriptName | ours |" }
}
