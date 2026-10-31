<#
.SYNOPSIS
  Procedural 16x16 pixel art for the three OpV replication controller faces and the items of package OpV-R2 of Gregtech Grindless.

.DESCRIPTION
  Every pixel is drawn by this script (palettes and small routines); nothing is copied or edited from GregTech Modern or any
  other mod. Output is deterministic. Same method and steel bezel as Build-OpVFieldPressTextures.ps1.

  Writes (under pack/kubejs/assets/grindless/textures/):
    block/multiblock/<machine>/overlay_front.png, overlay_front_active.png(+.mcmeta), overlay_front_active_emissive.png(+.mcmeta)
      for debris_harvester, replication_refinery and von_neumann_foundry;
    item/<id>.png for metal_debris_fraction, carbonyl_iron_nickel, ffc_pellet and spent_graphite_anode.

  Harvester face: a scoop arm sweeping grains into a hopper. Refinery face: a carbonyl column beside a salt bath, bubbles rising.
  Foundry face: a probe seed between two gantry arms, a weld glow running over it.
  The *_emissive layer holds only the glow and the lamp.

  Conventions: transparent background, outer 1 px ring of the face empty, every pixel fully opaque or fully transparent, none pure
  black, emissive layer a subset of the colour layer. The final check fails the run (non-zero exit) if a written file breaks one.

  Run from the repo root:
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-OpVReplicationTextures.ps1

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

# harvester: a hopper at the bottom, an arm with a scoop sweeping over it; working, grains drift down the window
$Faces['debris_harvester'] = {
    param($c, $e, $f, $act)
    $steel = Hex 'A8B0B8'; $grain = Hex 'C8A878'
    foreach ($x in 5..10) { Set-Px $c $x 9 $steel }
    foreach ($y in 4..6) { Set-Px $c 4 $y $steel }
    $sx = if ($act) { 5 + ($f % 4) } else { 5 }
    foreach ($x in 4..$sx) { Set-Px $c $x 6 $steel }
    Set-Px $c $sx 7 $steel; Set-Px $c ($sx + 1) 7 $steel
    foreach ($p in @(@(8, 8), @(9, 8), @(10, 8))) { Set-Px $c $p[0] $p[1] $grain }
    if ($act) {
        $glow = @((Hex 'FFD070'), (Hex 'FFE8A0'), (Hex 'FFF8D0'), (Hex 'FFC850'))[$f % 4]
        foreach ($k in 0..2) { $gy = 4 + (($f + $k * 2) % 5); Set-Both $c $e (6 + $k * 2) $gy $glow }
    }
}

# refinery: a pipe column on the left, a salt bath on the right; working, bubbles rise in the column and the bath glows
$Faces['replication_refinery'] = {
    param($c, $e, $f, $act)
    $pipe = Hex '9098A8'; $salt = Hex 'D8D0C0'
    foreach ($y in 4..9) { Set-Px $c 5 $y $pipe; Set-Px $c 7 $y $pipe }
    foreach ($y in 4..8) { Set-Px $c 6 $y (Hex '3C4C60') }
    foreach ($x in 9..11) { foreach ($y in 7..9) { Set-Px $c $x $y $salt } }
    Set-Px $c 8 9 $pipe
    if ($act) {
        $glow = @((Hex '70E8FF'), (Hex '98F0FF'), (Hex 'C0F8FF'), (Hex '80ECFF'))[$f % 4]
        Set-Both $c $e 6 (8 - ($f % 5)) $glow
        Set-Both $c $e 6 (4 + (($f + 2) % 5)) $glow
        foreach ($x in 9..11) { if ((($x + $f) % 2) -eq 0) { Set-Both $c $e $x 7 (Hex 'FFB060') } }
    }
}

# foundry: a seed probe (diamond) in the middle, a gantry arm on each side; working, a weld glow runs over the seed
$Faces['von_neumann_foundry'] = {
    param($c, $e, $f, $act)
    $steel = Hex 'A8B0B8'; $seed = Hex '70B0C8'
    foreach ($y in 4..9) { Set-Px $c 4 $y $steel; Set-Px $c 11 $y $steel }
    foreach ($x in 5..6) { Set-Px $c $x 5 $steel }
    foreach ($x in 9..10) { Set-Px $c $x 5 $steel }
    foreach ($p in @(@(7, 6), @(8, 6), @(6, 7), @(7, 7), @(8, 7), @(9, 7), @(7, 8), @(8, 8))) { Set-Px $c $p[0] $p[1] $seed }
    if ($act) {
        $glow = @((Hex 'FFFFFF'), (Hex 'FFE880'), (Hex 'FFD050'), (Hex 'FFF4B0'))[$f % 4]
        $wx = 6 + ($f % 4)
        Set-Both $c $e $wx 7 $glow
        Set-Both $c $e 5 6 $glow; Set-Both $c $e 10 6 $glow
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

# a heap of grains of one colour
function New-Heap {
    param([int]$Base, [int]$Spark)
    $c = New-Canvas 16 16
    foreach ($row in 0..7) {
        $y = 12 - $row
        $half = [Math]::Max(1, 6 - $row)
        for ($x = 8 - $half; $x -le 7 + $half; $x++) { Set-Px $c $x $y (Shade $Base (0.78 + 0.04 * $row + 0.02 * (($x * 5 + $y * 3) % 5))) }
    }
    foreach ($p in @(@(6, 7), @(9, 9), @(8, 6))) { Set-Px $c $p[0] $p[1] $Spark }
    Add-Outline $c
    return $c
}

# item/metal_debris_fraction.png: rusty grey grains
Out-Tex (New-Heap (Hex '8C7C70') (Hex 'C8B8A8')) 'item/metal_debris_fraction.png'

# item/carbonyl_iron_nickel.png: bright silver-grey powder
Out-Tex (New-Heap (Hex 'B8C0C8') (Hex 'F0F4F8')) 'item/carbonyl_iron_nickel.png'

# item/ffc_pellet.png: a pressed pale-brown disc with a ring
$pel = New-Canvas 16 16
for ($y = 4; $y -le 11; $y++) {
    for ($x = 3; $x -le 12; $x++) {
        $dx = $x - 7.5; $dy = ($y - 7.5) * 1.25
        if ($dx * $dx + $dy * $dy -le 20) { Set-Px $pel $x $y (Shade (Hex 'B09878') (1.2 - 0.05 * ($x - 3) - 0.03 * ($y - 4))) }
    }
}
foreach ($x in 5..10) { Set-Px $pel $x 7 (Hex '705840') }
Add-Outline $pel
Out-Tex $pel 'item/ffc_pellet.png'

# item/spent_graphite_anode.png: a dull grey rod, worn thin in the middle
$an = New-Canvas 16 16
for ($y = 2; $y -le 13; $y++) {
    $half = if ($y -ge 6 -and $y -le 9) { 1 } else { 2 }
    for ($x = 8 - $half; $x -le 7 + $half; $x++) { Set-Px $an $x $y (Shade (Hex '585C60') (1.25 - 0.1 * ($x - 5) - 0.01 * $y)) }
}
foreach ($p in @(@(6, 3), @(9, 12), @(7, 7))) { Set-Px $an $p[0] $p[1] (Hex '8C9094') }
Add-Outline $an
Out-Tex $an 'item/spent_graphite_anode.png'

$Items = @('metal_debris_fraction', 'carbonyl_iron_nickel', 'ffc_pellet', 'spent_graphite_anode')

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
