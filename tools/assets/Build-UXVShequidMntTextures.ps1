<#
.SYNOPSIS
  Procedural 16x16 pixel art for the UXV SHeQUID works and MNT collider controller faces and the 2 items of the UXV-A6 package, of Gregtech Grindless.

.DESCRIPTION
  Every pixel is drawn by this script (palettes and small routines); nothing is copied or edited from GregTech Modern or any
  other mod. Output is deterministic. Same method and steel bezel as Build-UXVSpinDepositionTextures.ps1.

  Writes (under pack/kubejs/assets/grindless/textures/):
    block/multiblock/shequid_works/overlay_front.png, overlay_front_active.png(+.mcmeta), overlay_front_active_emissive.png(+.mcmeta)
    block/multiblock/mnt_collider/ the same three files
    item/<name>.png for each item in $items below (shapes tinted by one base colour)

  SHeQUID face: a superconducting ring with two Josephson junctions (top and bottom); working (4 frames, frametime 4) a blue current
  pulse runs round the ring. MNT face: two beams from the left and right meet at a collision point; working, the beams advance and a
  green spray of recoils grows out of the point. The *_emissive layer holds only the glow and the lamp.

  Conventions: transparent background, outer 1 px ring of the face empty, every pixel fully opaque or fully transparent, none pure
  black, emissive layer a subset of the colour layer. The final check fails the run (non-zero exit) if a written file breaks one.

  Run from the repo root:
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-UXVShequidMntTextures.ps1

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

# the ring of the SHeQUID: the cells of an 8x6 loop round the window (clockwise from the top left)
$Ring = @(@(5, 4), @(6, 4), @(7, 4), @(8, 4), @(9, 4), @(10, 4), @(10, 5), @(10, 6), @(10, 7), @(10, 8), @(10, 9), @(9, 9), @(8, 9), @(7, 9), @(6, 9), @(5, 9), @(5, 8), @(5, 7), @(5, 6), @(5, 5))

function New-Face {
    param([string]$Kind, [int]$Frame, [bool]$Active)
    $c = New-Bezel
    $e = New-Canvas
    for ($y = 4; $y -le 9; $y++) { for ($x = 4; $x -le 11; $x++) { Set-Px $c $x $y $Pit } }
    if ($Kind -eq 'squid') {
        $wire = Hex 'B8C0C8'; $junction = Hex 'D8A850'
        foreach ($p in $Ring) { Set-Px $c $p[0] $p[1] $wire }
        foreach ($p in @(@(7, 4), @(8, 4), @(8, 9), @(7, 9))) { Set-Px $c $p[0] $p[1] $junction }
        if ($Active) {
            $glow = @((Hex '3080FF'), (Hex '60A0FF'), (Hex '98C8FF'), (Hex 'E0F0FF'))
            for ($i = 0; $i -lt 4; $i++) {
                $p = $Ring[($Frame * 5 + $i) % $Ring.Count]
                Set-Both $c $e $p[0] $p[1] $glow[$i]
            }
        }
    }
    else {
        # two beams meeting at the centre (x7-8, y6-7)
        $beam = Hex '7A6AB0'; $target = Hex 'C0A070'
        foreach ($x in 5, 6) { Set-Px $c $x 6 $beam; Set-Px $c $x 7 $beam }
        foreach ($x in 9, 10) { Set-Px $c $x 6 $beam; Set-Px $c $x 7 $beam }
        foreach ($x in 7, 8) { foreach ($y in 6, 7) { Set-Px $c $x $y $target } }
        if ($Active) {
            $pulse = @((Hex '8040FF'), (Hex 'A070FF'), (Hex 'C8A8FF'), (Hex 'FFFFFF'))[$Frame % 4]
            $spray = @((Hex '30B060'), (Hex '48D878'), (Hex '78F0A0'), (Hex 'C0FFD8'))[$Frame % 4]
            Set-Both $c $e (5 + [Math]::Min($Frame, 1)) 6 $pulse
            Set-Both $c $e (10 - [Math]::Min($Frame, 1)) 7 $pulse
            for ($i = 0; $i -le $Frame; $i++) {
                Set-Both $c $e 7 (5 - [Math]::Min($i, 1)) $spray
                Set-Both $c $e 8 (8 + [Math]::Min($i, 1)) $spray
            }
            Set-Both $c $e (7 + ($Frame % 2)) (6 + ($Frame % 2)) $spray
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

$Dirs = @('block/multiblock/shequid_works', 'block/multiblock/mnt_collider')
$Kinds = @('squid', 'mnt')
for ($m = 0; $m -lt 2; $m++) {
    $idle = New-Face $Kinds[$m] 0 $false
    Out-Tex $idle.C "$($Dirs[$m])/overlay_front.png"
    $col = @(); $emi = @()
    for ($f = 0; $f -lt $Frames; $f++) { $a = New-Face $Kinds[$m] $f $true; $col += , $a.C; $emi += , $a.E }
    Out-Tex (Join-Frames $col) "$($Dirs[$m])/overlay_front_active.png" $FrameTime
    Out-Tex (Join-Frames $emi) "$($Dirs[$m])/overlay_front_active_emissive.png" $FrameTime
}

# ---------------------------------------------------------------- items

# one base colour -> a palette: K outline, W lit, H body, D shade
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
    chip = @(
        '................', '................', '..K..K..K..K....', '.KKKKKKKKKKKK...',
        '.KWWWWWWWWHDK...', '.KWHHHHHHHHDK...', 'KKWHHKKKKHHDKK..', '.KWHHKHHKHHDK...',
        'KKWHHKKKKHHDKK..', '.KWHHHHHHHHDK...', '.KDDDDDDDDDDK...', '.KKKKKKKKKKKK...',
        '..K..K..K..K....', '................', '................', '................')
    dust = @(
        '................', '................', '................', '................',
        '.......KK.......', '......KWWK......', '.....KWHHDK.....', '....KWHHHHDK....',
        '...KWHHHHHHDK...', '..KWHHHHHHHDDK..', '.KWHHHHHHHHHDDK.', '.KKKKKKKKKKKKKK.',
        '................', '................', '................', '................')
}
$items = @(
    @('weak_link_cell', 'chip', 'A8C8E0'), @('mnt_thermal_ions', 'dust', '60D8C8')
)
foreach ($it in $items) {
    $map = $shapes[$it[1]]
    foreach ($row in $map) { if ($row.Length -ne 16) { throw "$($it[0]): a map row is $($row.Length) wide" } }
    if ($map.Count -ne 16) { throw "$($it[0]): the map is $($map.Count) rows" }
    $c = New-Canvas
    Write-Map $c 0 0 $map (New-Tint $it[2])
    Out-Tex $c "item/$($it[0]).png"
}

# self-check: alpha 0 or 255, nothing pure black; on the faces: ring empty, emissive a subset of the colour layer, no two frames alike
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
