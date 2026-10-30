<#
.SYNOPSIS
  Procedural 16x16 pixel art for the OpV field-frozen press controller face and the items of package OpV-A3 of Gregtech Grindless.

.DESCRIPTION
  Every pixel is drawn by this script (palettes and small routines); nothing is copied or edited from GregTech Modern or any
  other mod. Output is deterministic. Same method and steel bezel as Build-UXVCasATextures.ps1.

  Writes (under pack/kubejs/assets/grindless/textures/):
    block/multiblock/field_frozen_press/overlay_front.png, overlay_front_active.png(+.mcmeta), overlay_front_active_emissive.png(+.mcmeta);
    item/<id>.png for field_canned_stack, field_frozen_billet, spent_field_can (line 3) and aln_powder, aln_kerf, aln_boule, aln_wafer,
    algan_epi_wafer, algan_patterned_wafer (line 45).

  Press face: a ram over a platen between two coil bars; working, field lines pulse across the gap and the ram comes down.
  The *_emissive layer holds only the field glow and the lamp.

  Conventions: transparent background, outer 1 px ring of the face empty, every pixel fully opaque or fully transparent, none pure
  black, emissive layer a subset of the colour layer. The final check fails the run (non-zero exit) if a written file breaks one.

  Run from the repo root:
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-OpVFieldPressTextures.ps1

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
    param([int]$Frame, [bool]$Active)
    $c = New-Bezel
    $e = New-Canvas
    for ($y = 4; $y -le 9; $y++) { for ($x = 4; $x -le 11; $x++) { Set-Px $c $x $y $Pit } }
    # coil bars on both sides, the platen at the bottom, the ram hanging from the top (lower when working)
    $coil = Hex 'C08040'; $steel = Hex 'A8B0B8'; $ram = Hex '8890A0'
    foreach ($y in 4..9) { Set-Px $c 4 $y $coil; Set-Px $c 11 $y $coil }
    foreach ($x in 5..10) { Set-Px $c $x 9 $steel }
    $ramY = if ($Active) { 4 + [int]($Frame -ge 2) } else { 4 }
    foreach ($x in 6..9) { Set-Px $c $x $ramY $ram }
    if ($ramY -gt 4) { foreach ($x in 7, 8) { Set-Px $c $x 4 (Hex '5C6470') } }
    # the canned stack on the platen
    foreach ($x in 6..9) { Set-Px $c $x 8 (Hex '7C6A90') }
    if ($Active) {
        $glow = @((Hex '60E0FF'), (Hex '90F0FF'), (Hex 'C8F8FF'), (Hex '78E8FF'))[$Frame % 4]
        $ly = 6 + ($Frame % 2)
        foreach ($x in 5..10) { if ((($x + $Frame) % 2) -eq 0) { Set-Both $c $e $x $ly $glow } }
        Set-Both $c $e 4 (5 + $Frame) $glow; Set-Both $c $e 11 (8 - $Frame) $glow
    }
    # run lamp under the window
    Set-Px $c 7 12 $(if ($Active) { $LampOn } else { $LampOff })
    Set-Px $c 8 12 $(if ($Active) { $LampOn } else { $LampOff })
    if ($Active) { Set-Px $e 7 12 $LampOn; Set-Px $e 8 12 $LampOn }
    # nothing may sit on the outer ring
    for ($i = 0; $i -lt 16; $i++) { foreach ($p in @(@($i, 0), @($i, 15), @(0, $i), @(15, $i))) { Set-Px $c $p[0] $p[1] 0; Set-Px $e $p[0] $p[1] 0 } }
    return @{ C = $c; E = $e }
}

$Dir = 'block/multiblock/field_frozen_press'
$idle = New-Face 0 $false
Out-Tex $idle.C "$Dir/overlay_front.png"
$col = @(); $emi = @()
for ($f = 0; $f -lt $Frames; $f++) { $a = New-Face $f $true; $col += , $a.C; $emi += , $a.E }
Out-Tex (Join-Frames $col) "$Dir/overlay_front_active.png" $FrameTime
Out-Tex (Join-Frames $emi) "$Dir/overlay_front_active_emissive.png" $FrameTime

# a vertical can: body x 5..10, y 3..12, with end caps
function New-Can {
    param([int]$Body, [int]$Band, [bool]$Dented)
    $c = New-Canvas 16 16
    for ($y = 3; $y -le 12; $y++) { for ($x = 5; $x -le 10; $x++) { Set-Px $c $x $y (Shade $Body (1.2 - 0.07 * ($x - 5) - 0.01 * $y)) } }
    foreach ($x in 5..10) { Set-Px $c $x 3 (Shade $Body 1.35); Set-Px $c $x 12 (Shade $Body 0.7) }
    foreach ($x in 5..10) { Set-Px $c $x 7 $Band; Set-Px $c $x 8 (Shade $Band 0.8) }
    if ($Dented) { foreach ($p in @(@(9, 4), @(10, 5), @(6, 10), @(7, 11))) { Set-Px $c $p[0] $p[1] (Shade $Body 0.5) } }
    Add-Outline $c
    return $c
}

# item/field_canned_stack.png: a bright tungsten can with a rhenium band and a violet lamina edge showing at the seam
$can = New-Can (Hex '9AA0A8') (Hex 'B8A090') $false
foreach ($x in 6..9) { Set-Px $can $x 5 (Hex '8A70B0') }
Out-Tex $can 'item/field_canned_stack.png'

# item/spent_field_can.png: the same can, dull and dented, the seam cut open
$spent = New-Can (Hex '6C7078') (Hex '806C60') $true
foreach ($x in 6..9) { Set-Px $spent $x 3 (Hex '3A3C40') }
Out-Tex $spent 'item/spent_field_can.png'

# item/field_frozen_billet.png: a dark violet bar with cyan field lines frozen along it
$billet = New-Canvas 16 16
$bv = Hex '4C3C70'
for ($y = 5; $y -le 10; $y++) { for ($x = 2; $x -le 13; $x++) { Set-Px $billet $x $y (Shade $bv (1.25 - 0.05 * ($y - 5) - 0.01 * $x)) } }
foreach ($x in 2..13) { if (($x % 3) -ne 0) { Set-Px $billet $x 7 (Hex '58D0F0') } }
foreach ($x in 3..12) { if (($x % 4) -eq 1) { Set-Px $billet $x 9 (Hex '48B0D8') } }
Add-Outline $billet
Out-Tex $billet 'item/field_frozen_billet.png'

# item/aln_powder.png: a heap of cream-white grains
$pow = New-Canvas 16 16
$heap = Hex 'E8E0C8'
foreach ($row in 0..7) {
    $y = 12 - $row
    $half = [Math]::Max(1, 6 - $row)
    for ($x = 8 - $half; $x -le 7 + $half; $x++) { Set-Px $pow $x $y (Shade $heap (0.78 + 0.04 * $row + 0.02 * (($x * 5 + $y * 3) % 5))) }
}
foreach ($p in @(@(6, 7), @(9, 9), @(8, 6))) { Set-Px $pow $p[0] $p[1] (Hex 'FFFAEC') }
Add-Outline $pow
Out-Tex $pow 'item/aln_powder.png'

# item/aln_kerf.png: three thin cream slivers from the saw
$kerf = New-Canvas 16 16
$sl = Hex 'D8CCA8'
foreach ($k in 0..2) {
    $x0 = 3 + 3 * $k
    for ($i = 0; $i -le 7; $i++) { Set-Px $kerf ($x0 + [int]($i / 3)) (4 + $i + $k) (Shade $sl (1.15 - 0.05 * $i)) }
}
Add-Outline $kerf
Out-Tex $kerf 'item/aln_kerf.png'

# item/aln_boule.png: a pale amber boule, rounded top, a darker growth ring
$boule = New-Canvas 16 16
$amb = Hex 'D8B878'
for ($y = 3; $y -le 13; $y++) {
    $half = if ($y -le 4) { 2 + ($y - 3) } else { 4 }
    for ($x = 8 - $half; $x -le 7 + $half; $x++) { Set-Px $boule $x $y (Shade $amb (1.25 - 0.06 * ($x - 4) - 0.01 * $y)) }
}
foreach ($x in 4..11) { Set-Px $boule $x 9 (Shade $amb 0.75) }
Add-Outline $boule
Out-Tex $boule 'item/aln_boule.png'

# a wafer disc of radius 6 around (7.5, 7.5)
function New-Wafer {
    param([int]$Base)
    $c = New-Canvas 16 16
    for ($y = 1; $y -le 14; $y++) {
        for ($x = 1; $x -le 14; $x++) {
            $dx = $x - 7.5; $dy = $y - 7.5
            if ($dx * $dx + $dy * $dy -le 36) { Set-Px $c $x $y (Shade $Base (1.2 - 0.03 * ($x + $y - 2))) }
        }
    }
    foreach ($x in 6..9) { Set-Px $c $x 13 (Shade $Base 0.6) }
    return $c
}

# item/aln_wafer.png: a pale cream disc
$w = New-Wafer (Hex 'E0D8C0')
Add-Outline $w
Out-Tex $w 'item/aln_wafer.png'

# item/algan_epi_wafer.png: the disc under a green-gold epitaxial sheen
$epi = New-Wafer (Hex 'B8C890')
foreach ($p in @(@(5, 5), @(6, 4), @(10, 7), @(9, 9))) { Set-Px $epi $p[0] $p[1] (Hex 'E8F0B0') }
Add-Outline $epi
Out-Tex $epi 'item/algan_epi_wafer.png'

# item/algan_patterned_wafer.png: the epi disc with a grid of gates
$pat = New-Wafer (Hex 'A8B880')
for ($y = 4; $y -le 11; $y++) { for ($x = 4; $x -le 11; $x++) { if ((($x % 3) -eq 1) -or (($y % 3) -eq 1)) { Set-Px $pat $x $y (Hex '5C6C48') } } }
Add-Outline $pat
Out-Tex $pat 'item/algan_patterned_wafer.png'

$Items = @('field_canned_stack', 'spent_field_can', 'field_frozen_billet', 'aln_powder', 'aln_kerf', 'aln_boule', 'aln_wafer', 'algan_epi_wafer', 'algan_patterned_wafer')

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
foreach ($it in $Items) { Test-Pixels (Read-Png (Join-Path $OutRoot "item\$it.png")) "item/$it" $false }
if ($problems.Count -gt 0) { $problems | Select-Object -First 20 | ForEach-Object { Write-Error $_ -ErrorAction Continue }; exit 1 }

Write-Host "$ScriptName wrote $($written.Count) files"
if ($Credits) {
    foreach ($w in $written) { Write-Host "| pack/kubejs/assets/grindless/textures/$w | drawn procedurally by tools/assets/$ScriptName | ours |" }
}
