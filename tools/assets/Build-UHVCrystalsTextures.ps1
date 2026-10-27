<#
.SYNOPSIS
  Procedural 16x16 pixel art for the UHV nuclear clock lab and crystal growth furnace controller faces, and the four items of the
  UHV-A2 package, of Gregtech Grindless.

.DESCRIPTION
  Every pixel is drawn by this script (palettes and small routines); nothing is copied or edited from GregTech Modern or any
  other mod. Output is deterministic. Same method and steel bezel as the earlier sets (Build-UHVTranscuriumTextures.ps1).

  Writes (under pack/kubejs/assets/grindless/textures/):
    block/multiblock/nuclear_clock_lab/overlay_front.png, overlay_front_active.png(+.mcmeta), overlay_front_active_emissive.png(+.mcmeta)
    block/multiblock/crystal_growth_furnace/ the same three files
    item/vuv_frequency_comb.png, item/vuv_caf2_optic.png, item/iridium_crucible.png, item/worn_iridium_crucible.png

  Lab face: a bezel round a vacuum window over an optical table; idle, the Th:CaF2 crystal is dim violet. Working (4 frames,
  frametime 4), the crystal glows and a VUV pulse runs along the beam through it; the run lamp is green.
  Furnace face: a bezel round a furnace window: induction coils on both sides, an iridium crucible on the hearth. Working (4 frames,
  frametime 4), the coils glow in turn, the melt is orange and the hot boule is pulled up out of it a pixel per frame.
  The *_emissive layer holds only the glow and the lamp.

  Conventions: transparent background, outer 1 px ring of the faces empty, every pixel fully opaque or fully transparent, none pure
  black, emissive layer a subset of the colour layer. The final check fails the run (non-zero exit) if a written file breaks one.

  Run from the repo root:
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-UHVCrystalsTextures.ps1

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
    if ($Kind -eq 'lab') {
        # the optical table along the bottom of the window; the crystal at x7..8, y5..7 in its mount; the beam on row 6
        for ($x = 4; $x -le 11; $x++) { Set-Px $c $x 9 (Hex '3A3E48') }
        Set-Px $c 7 8 (Hex '5A5E68'); Set-Px $c 8 8 (Hex '5A5E68')
        if ($Active) {
            $beam = Hex '6A3CC8'; $pulse = Hex 'C8A0FF'
            foreach ($x in 4, 5, 6, 9, 10, 11) { Set-Both $c $e $x 6 $beam }
            $px = @(4, 5, 6, 9)[$Frame % 4]
            Set-Both $c $e $px 6 $pulse
            for ($y = 5; $y -le 7; $y++) { Set-Both $c $e 7 $y (Hex 'F0DCFF'); Set-Both $c $e 8 $y (Hex 'C8A8F0') }
        }
        else {
            for ($y = 5; $y -le 7; $y++) { Set-Px $c 7 $y (Hex '4A3A6A'); Set-Px $c 8 $y (Hex '3A2E54') }
        }
    }
    else {
        # induction coils at x4 and x11; the crucible on the hearth (x6..9, y8..9); the pull rod down column 8
        $crucible = Hex 'C4C8D2'
        Set-Px $c 6 8 $crucible; Set-Px $c 9 8 $crucible
        for ($x = 6; $x -le 9; $x++) { Set-Px $c $x 9 $crucible }
        if ($Active) {
            for ($y = 4; $y -le 9; $y++) {
                foreach ($x in 4, 11) {
                    if ((($y + $Frame) % 2) -eq 0) { Set-Both $c $e $x $y (Hex 'FF8C2A') } else { Set-Px $c $x $y (Hex '9A4A1A') }
                }
            }
            Set-Both $c $e 7 8 (Hex 'FFB040'); Set-Both $c $e 8 8 (Hex 'FFB040')
            # the boule grows from the melt: 1 to 4 pixels tall
            $top = 7 - $Frame
            for ($y = $top; $y -le 7; $y++) { Set-Both $c $e 7 $y (Hex 'FFE8A0'); Set-Both $c $e 8 $y (Hex 'F0C878') }
            for ($y = 4; $y -lt $top; $y++) { Set-Px $c 8 $y (Hex 'A0A4AC') }
        }
        else {
            for ($y = 4; $y -le 9; $y++) { Set-Px $c 4 $y (Hex '7A4A22'); Set-Px $c 11 $y (Hex '7A4A22') }
            Set-Px $c 7 8 (Hex '5A3A2A'); Set-Px $c 8 8 (Hex '5A3A2A')
            for ($y = 4; $y -le 7; $y++) { Set-Px $c 8 $y (Hex 'A0A4AC') }
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

$kinds = @(@{ Kind = 'lab'; Dir = 'block/multiblock/nuclear_clock_lab' }, @{ Kind = 'furnace'; Dir = 'block/multiblock/crystal_growth_furnace' })
foreach ($k in $kinds) {
    $idle = New-Face $k.Kind 0 $false
    Out-Tex $idle.C "$($k.Dir)/overlay_front.png"
    $col = @(); $emi = @()
    for ($f = 0; $f -lt $Frames; $f++) { $a = New-Face $k.Kind $f $true; $col += , $a.C; $emi += , $a.E }
    Out-Tex (Join-Frames $col) "$($k.Dir)/overlay_front_active.png" $FrameTime
    Out-Tex (Join-Frames $emi) "$($k.Dir)/overlay_front_active_emissive.png" $FrameTime
}

# ---------------------------------------------------------------- items

# the comb: a laser module (K outline, H housing, S shade, L violet lens, G status lamp) over its spectrum of teeth (V, v) on a baseline (U)
$combMap = @(
    '................',
    '................',
    '..KKKKKKKKKKKK..',
    '..KHHHHHHHHHSK..',
    '..KHLLHHHHHHSK..',
    '..KHLLHHHGGHSK..',
    '..KSSSSSSSSSSK..',
    '..KKKKKKKKKKKK..',
    '................',
    '...V...V...V....',
    '...V.V.V.V.V.v..',
    '...V.V.V.V.V.v..',
    '..UUUUUUUUUUUUU.',
    '................',
    '................',
    '................'
)
$combPal = New-Palette 'K=2A2E38 H=8A90A0 S=5A6070 L=B48CFF G=62FF86 V=C8A0FF v=7A50D0 U=4A3A6A'
# the optic: a round CaF2 window, lit on the top left (W), shaded on the bottom right (D)
$opticMap = @(
    '................',
    '................',
    '.....KKKKKK.....',
    '....KWWCCCCK....',
    '...KWCCCCCCDK...',
    '..KWCCCCCCCCDK..',
    '..KWCCCCCCCCDK..',
    '..KCCCCCCCCCDK..',
    '..KCCCCCCCCCDK..',
    '..KCCCCCCCCDDK..',
    '..KCCCCCCCCDDK..',
    '...KCCCCCCDDK...',
    '....KCDDDDDK....',
    '.....KKKKKK.....',
    '................',
    '................'
)
$opticPal = New-Palette 'K=4A3A6A W=FCFAFF C=D8D0F4 D=A898D0'
# the crucible: an open iridium cup seen from a little above (I the dark inside, H the wall, W the lit edge, D the shaded edge)
$crucibleMap = @(
    '................',
    '................',
    '................',
    '...KKKKKKKKKK...',
    '..KWIIIIIIIIDK..',
    '..KWHIIIIIIHDK..',
    '..KWHHHHHHHHDK..',
    '..KWHHHHHHHHDK..',
    '...KWHHHHHHDK...',
    '...KWHHHHHHDK...',
    '...KWHHHHHHDK...',
    '....KWHHHHDK....',
    '....KKKKKKKK....',
    '................',
    '................',
    '................'
)
$cruciblePal = New-Palette 'K=3A3C44 W=F0F2F6 H=C4C8D2 D=8A8E9A I=2C2E36'
# the worn crucible: duller metal, oxide crust (O) on the rim and pits (P) in the wall
$wornMap = @(
    '................',
    '................',
    '................',
    '...KKKKKKKKKK...',
    '..KWIIOIIIOIDK..',
    '..KWHIIOOIIHDK..',
    '..KWHHPHHHHHDK..',
    '..KWHHHHHPHHDK..',
    '...KHHPHHHHDK...',
    '...KWHHHHPHDK...',
    '...KWHPHHHHDK...',
    '....KWHHHPDK....',
    '....KKKKKKKK....',
    '................',
    '................',
    '................'
)
$wornPal = New-Palette 'K=34302C W=C8C4BC H=9A968E D=6A665E I=3A2418 O=B8642A P=4E4A44'

$items = @(
    @{ Name = 'vuv_frequency_comb'; Map = $combMap; Pal = $combPal },
    @{ Name = 'vuv_caf2_optic'; Map = $opticMap; Pal = $opticPal },
    @{ Name = 'iridium_crucible'; Map = $crucibleMap; Pal = $cruciblePal },
    @{ Name = 'worn_iridium_crucible'; Map = $wornMap; Pal = $wornPal }
)
foreach ($it in $items) {
    foreach ($row in $it.Map) { if ($row.Length -ne 16) { throw "$($it.Name): a map row is $($row.Length) wide" } }
    if ($it.Map.Count -ne 16) { throw "$($it.Name): the map is $($it.Map.Count) rows" }
    $c = New-Canvas
    Write-Map $c 0 0 $it.Map $it.Pal
    Out-Tex $c "item/$($it.Name).png"
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
foreach ($k in $kinds) {
    $png = @{}
    foreach ($n in 'overlay_front', 'overlay_front_active', 'overlay_front_active_emissive') { $png[$n] = Read-Png (Join-Path $OutRoot ("$($k.Dir)/$n.png" -replace '/', '\')) }
    foreach ($n in $png.Keys) { Test-Pixels $png[$n] "$($k.Dir)/$n" $true }
    $col = $png['overlay_front_active']; $em = $png['overlay_front_active_emissive']
    for ($i = 0; $i -lt $col.P.Length; $i++) { if ($em.P[$i] -ne 0 -and $em.P[$i] -ne $col.P[$i]) { $problems.Add("$($k.Dir): emissive differs from colour at $i") } }
    for ($f = 0; $f -lt $Frames - 1; $f++) {
        $same = $true
        for ($i = 0; $i -lt 256; $i++) { if ($col.P[$f * 256 + $i] -ne $col.P[($f + 1) * 256 + $i]) { $same = $false; break } }
        if ($same) { $problems.Add("$($k.Dir): frame $f repeats frame $($f + 1)") }
    }
}
foreach ($it in $items) {
    $png = Read-Png (Join-Path $OutRoot ("item\$($it.Name).png"))
    Test-Pixels $png "item/$($it.Name)" $false
    $opaque = 0; foreach ($v in $png.P) { if ((($v -shr 24) -band 255) -eq 255) { $opaque++ } }
    if ($opaque -lt 40) { $problems.Add("item/$($it.Name): only $opaque opaque pixels") }
}
if ($problems.Count -gt 0) { $problems | Select-Object -First 20 | ForEach-Object { Write-Error $_ -ErrorAction Continue }; exit 1 }

Write-Host "$ScriptName wrote $($written.Count) files"
if ($Credits) {
    foreach ($w in $written) { Write-Host "| pack/kubejs/assets/grindless/textures/$w | drawn procedurally by tools/assets/$ScriptName | ours |" }
}
