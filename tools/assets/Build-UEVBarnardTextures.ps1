<#
.SYNOPSIS
  Procedural 16x16 pixel art for the Barnard core drill and carbonyl refinery controller faces and the 4 items of the UEV-B3 package, of Gregtech Grindless.

.DESCRIPTION
  Every pixel is drawn by this script (palettes and small routines); nothing is copied or edited from GregTech Modern or any
  other mod. Output is deterministic. Same method and steel bezel as Build-UEVMegabarTextures.ps1.

  Writes (under pack/kubejs/assets/grindless/textures/):
    block/multiblock/barnard_core_drill/overlay_front.png, overlay_front_active.png(+.mcmeta), overlay_front_active_emissive.png(+.mcmeta)
    block/multiblock/carbonyl_refinery/ the same three
    item/<name>.png for each item in $items below

  Drill face: a bit in a bore; working (4 frames) it turns and sparks. Refinery face: a retort window; working (4 frames) a pale
  carbonyl vapour rises. The *_emissive layer holds only the glow and the lamp.

  Conventions: transparent background, outer 1 px ring of the face empty, every pixel fully opaque or fully transparent, none pure
  black, emissive layer a subset of the colour layer. The final check fails the run (non-zero exit) if a written file breaks one.

  Run from the repo root:
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-UEVBarnardTextures.ps1

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

function Finish-Face {
    param($C, $E, [bool]$Active)
    $lamp = if ($Active) { $LampOn } else { $LampOff }
    Set-Px $C 7 12 $lamp; Set-Px $C 8 12 $lamp
    if ($Active) { Set-Px $E 7 12 $LampOn; Set-Px $E 8 12 $LampOn }
    for ($i = 0; $i -lt 16; $i++) { foreach ($p in @(@($i, 0), @($i, 15), @(0, $i), @(15, $i))) { Set-Px $C $p[0] $p[1] 0; Set-Px $E $p[0] $p[1] 0 } }
    return @{ C = $C; E = $E }
}

# drill: a bore (x6..9, y4..9) with the bit's teeth; the bit's cutting edge shifts a pixel a frame, sparks at the bottom
function New-DrillFace {
    param([int]$Frame, [bool]$Active)
    $c = New-Bezel; $e = New-Canvas
    for ($y = 4; $y -le 9; $y++) { for ($x = 6; $x -le 9; $x++) { Set-Px $c $x $y $Pit } }
    $steel = Hex 'C8E8F4'; $shade = Hex '7AA8C0'
    foreach ($y in 4, 5, 6) { Set-Px $c 7 $y $steel; Set-Px $c 8 $y $shade }
    $off = if ($Active) { $Frame % 2 } else { 0 }
    foreach ($y in 7, 8) {
        $x0 = 6 + (($y + $off) % 2)
        Set-Px $c $x0 $y $steel; Set-Px $c ($x0 + 2) $y $shade
    }
    if ($Active) {
        $spark = @((Hex 'FF8C2A'), (Hex 'FFB050'), (Hex 'FFE090'), (Hex 'FFFFFF'))[$Frame % 4]
        foreach ($x in 6, 9) { Set-Both $c $e $x 9 $spark }
        Set-Both $c $e (7 + ($Frame % 2)) 9 $spark
    }
    return Finish-Face $c $e $Active
}

# refinery: a retort window (x4..11, y4..9), a pale vapour column rising; static it holds a dim level
function New-RetortFace {
    param([int]$Frame, [bool]$Active)
    $c = New-Bezel; $e = New-Canvas
    for ($y = 4; $y -le 9; $y++) { for ($x = 4; $x -le 11; $x++) { Set-Px $c $x $y $Pit } }
    $liquid = Hex '5A5A66'
    foreach ($x in 5, 6, 7, 8, 9, 10) { Set-Px $c $x 9 $liquid }
    if ($Active) {
        $vap = @((Hex 'C8D8E8'), (Hex 'A8BCD0'), (Hex '8CA4BC'))
        for ($k = 0; $k -lt 5; $k++) {
            $y = 8 - (($k + $Frame) % 5)
            $x = 6 + (($k * 2 + $Frame) % 4)
            Set-Both $c $e $x $y $vap[$k % 3]
        }
    }
    else {
        foreach ($x in 6, 9) { Set-Px $c $x 8 (Hex '3A3A46') }
    }
    return Finish-Face $c $e $Active
}

foreach ($face in @(@('barnard_core_drill', 'New-DrillFace'), @('carbonyl_refinery', 'New-RetortFace'))) {
    $Dir = "block/multiblock/$($face[0])"
    $idle = & $face[1] 0 $false
    Out-Tex $idle.C "$Dir/overlay_front.png"
    $col = @(); $emi = @()
    for ($f = 0; $f -lt $Frames; $f++) { $a = & $face[1] $f $true; $col += , $a.C; $emi += , $a.E }
    Out-Tex (Join-Frames $col) "$Dir/overlay_front_active.png" $FrameTime
    Out-Tex (Join-Frames $emi) "$Dir/overlay_front_active_emissive.png" $FrameTime
}

# ---------------------------------------------------------------- items

function Shade {
    param([string]$Rgb, [double]$F)
    $r = [Convert]::ToInt32($Rgb.Substring(0, 2), 16); $g = [Convert]::ToInt32($Rgb.Substring(2, 2), 16); $b = [Convert]::ToInt32($Rgb.Substring(4, 2), 16)
    if ($F -ge 1) { $f = $F - 1; $r += (255 - $r) * $f; $g += (255 - $g) * $f; $b += (255 - $b) * $f }
    else { $r *= $F; $g *= $F; $b *= $F }
    '{0:X2}{1:X2}{2:X2}' -f [Math]::Max(8, [Math]::Min(255, [int]$r)), [Math]::Max(8, [Math]::Min(255, [int]$g)), [Math]::Max(8, [Math]::Min(255, [int]$b))
}
function New-Tint {
    param([string]$Rgb)
    New-Palette ("K=$(Shade $Rgb 0.35) W=$(Shade $Rgb 1.5) H=$Rgb D=$(Shade $Rgb 0.65)")
}

$shapes = @{
    dust = @(
        '................', '................', '................', '................',
        '.......KK.......', '......KWWK......', '.....KWHHDK.....', '....KWHHHHDK....',
        '...KWHHHHHHDK...', '..KWHHHHHHHDDK..', '.KWHHHHHHHHHDDK.', '.KKKKKKKKKKKKKK.',
        '................', '................', '................', '................')
    disk = @(
        '................', '................', '.....KKKKKK.....', '....KWWHHHDK....',
        '...KWHHHHHHDK...', '..KWHHKKKKHHDK..', '..KWHHK..KHHDK..', '..KWHHK..KHHDK..',
        '..KWHHKKKKHHDK..', '...KWHHHHHDDK...', '....KDDDDDDK....', '.....KKKKKK.....',
        '................', '................', '................', '................')
    chunk = @(
        '................', '................', '................', '.....KKKK.......',
        '....KWWHHK.KK...', '...KWHHHHDKWDK..', '..KWHHHHHHDHHDK.', '..KWHHHHHHHHHDK.',
        '..KHHHHHHHHHDDK.', '...KDHHHHHHDDK..', '....KKDDDDDKK...', '......KKKKK.....',
        '................', '................', '................', '................')
}
$items = @(
    @('barnard_residue', 'chunk', '8A6E5A'), @('crude_ammonium_perrhenate', 'dust', 'B8A890'),
    @('ammonium_perrhenate', 'dust', 'EEEAE0'), @('rhenium_pellet', 'disk', '9AA0AE')
)
foreach ($it in $items) {
    $map = $shapes[$it[1]]
    foreach ($row in $map) { if ($row.Length -ne 16) { throw "$($it[0]): a map row is $($row.Length) wide" } }
    if ($map.Count -ne 16) { throw "$($it[0]): the map is $($map.Count) rows" }
    $c = New-Canvas
    Write-Map $c 0 0 $map (New-Tint $it[2])
    Out-Tex $c "item/$($it[0]).png"
}

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
foreach ($face in 'barnard_core_drill', 'carbonyl_refinery') {
    $Dir = "block/multiblock/$face"
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
foreach ($it in $items) {
    $p = Read-Png (Join-Path $OutRoot ("item\$($it[0]).png"))
    Test-Pixels $p "item/$($it[0])" $false
    $opaque = 0; foreach ($v in $p.P) { if ((($v -shr 24) -band 255) -eq 255) { $opaque++ } }
    if ($opaque -lt 40) { $problems.Add("item/$($it[0]): only $opaque opaque pixels") }
}
if ($problems.Count -gt 0) { $problems | Select-Object -First 20 | ForEach-Object { Write-Error $_ -ErrorAction Continue }; exit 1 }

Write-Host "$ScriptName wrote $($written.Count) files"
if ($Credits) {
    foreach ($w in $written) { Write-Host "| pack/kubejs/assets/grindless/textures/$w | drawn procedurally by tools/assets/$ScriptName | ours |" }
}
