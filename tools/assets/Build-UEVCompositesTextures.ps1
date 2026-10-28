<#
.SYNOPSIS
  Procedural 16x16 pixel art for the UEV nitride magnet works, SiC fibre plant and CVI furnace controller faces, and the 19 items of the
  UEV-A5 package, of Gregtech Grindless.

.DESCRIPTION
  Every pixel is drawn by this script (palettes and small routines); nothing is copied or edited from GregTech Modern or any
  other mod. Output is deterministic. Same method and steel bezel as Build-UEVElectronBeamTextures.ps1.

  Writes (under pack/kubejs/assets/grindless/textures/):
    block/multiblock/nitride_magnet_works/overlay_front.png, overlay_front_active.png(+.mcmeta), overlay_front_active_emissive.png(+.mcmeta)
    block/multiblock/sic_fibre_plant/ and block/multiblock/cvi_furnace/ the same three files
    item/<name>.png for each item in $items below (six shapes, each tinted by one base colour)

  Magnet face: a bezel round a window with a horseshoe magnet; working (4 frames, frametime 4), a field line runs between the poles.
  Fibre face: a spinneret with three threads; working, the threads draw down a pixel per frame.
  CVI face: a retort with a preform; working, the gas shimmers up through it and the preform warms.
  The *_emissive layer holds only the glow and the lamp.

  Conventions: transparent background, outer 1 px ring of the faces empty, every pixel fully opaque or fully transparent, none pure
  black, emissive layer a subset of the colour layer. The final check fails the run (non-zero exit) if a written file breaks one.

  Run from the repo root:
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-UEVCompositesTextures.ps1

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
    if ($Kind -eq 'magnet') {
        # a horseshoe: poles at x5 and x10 (y5..7), the yoke along y8; red north, blue south
        for ($y = 5; $y -le 7; $y++) { Set-Px $c 5 $y (Hex 'D84A3A'); Set-Px $c 10 $y (Hex '3A6AD8') }
        for ($x = 5; $x -le 10; $x++) { Set-Px $c $x 8 (Hex '9AA0AC') }
        if ($Active) {
            $fx = 6 + $Frame
            Set-Both $c $e $fx 6 (Hex 'FFF0B0')
            Set-Both $c $e (15 - $fx) 7 (Hex 'C8E0FF')
        }
    }
    elseif ($Kind -eq 'fibre') {
        # the spinneret plate at the top (y4), three threads down
        for ($x = 5; $x -le 10; $x++) { Set-Px $c $x 4 (Hex '8A90A0') }
        foreach ($x in 6, 8, 10) {
            for ($y = 5; $y -le 8; $y++) { Set-Px $c $x $y (Hex '5A5A64') }
            if ($Active) { Set-Both $c $e $x (5 + ($Frame % 4)) (Hex 'FF9A3A') }
        }
        if (-not $Active) { foreach ($x in 6, 8, 10) { Set-Px $c $x 5 (Hex '8A6A4A') } }
    }
    else {
        # a retort (x5..10, y5..9) with a preform grid inside
        for ($y = 5; $y -le 9; $y++) { Set-Px $c 5 $y (Hex '8A7A68'); Set-Px $c 10 $y (Hex '8A7A68') }
        for ($x = 5; $x -le 10; $x++) { Set-Px $c $x 9 (Hex '8A7A68') }
        foreach ($y in 6, 8) { for ($x = 6; $x -le 9; $x++) { Set-Px $c $x $y (Hex '4A4A56') } }
        foreach ($x in 7, 9) { for ($y = 6; $y -le 8; $y++) { Set-Px $c $x $y (Hex '4A4A56') } }
        if ($Active) {
            $gy = 8 - ($Frame % 4)
            foreach ($x in 6, 8) { Set-Both $c $e $x $gy (Hex 'FFB060') }
            Set-Both $c $e 7 7 (Hex 'FF6A2A')
        }
    }
    Set-Px $c 7 12 $(if ($Active) { $LampOn } else { $LampOff })
    Set-Px $c 8 12 $(if ($Active) { $LampOn } else { $LampOff })
    if ($Active) { Set-Px $e 7 12 $LampOn; Set-Px $e 8 12 $LampOn }
    for ($i = 0; $i -lt 16; $i++) { foreach ($p in @(@($i, 0), @($i, 15), @(0, $i), @(15, $i))) { Set-Px $c $p[0] $p[1] 0; Set-Px $e $p[0] $p[1] 0 } }
    return @{ C = $c; E = $e }
}

$kinds = @(
    @{ Kind = 'magnet'; Dir = 'block/multiblock/nitride_magnet_works' },
    @{ Kind = 'fibre'; Dir = 'block/multiblock/sic_fibre_plant' },
    @{ Kind = 'cvi'; Dir = 'block/multiblock/cvi_furnace' })
foreach ($k in $kinds) {
    $idle = New-Face $k.Kind 0 $false
    Out-Tex $idle.C "$($k.Dir)/overlay_front.png"
    $col = @(); $emi = @()
    for ($f = 0; $f -lt $Frames; $f++) { $a = New-Face $k.Kind $f $true; $col += , $a.C; $emi += , $a.E }
    Out-Tex (Join-Frames $col) "$($k.Dir)/overlay_front_active.png" $FrameTime
    Out-Tex (Join-Frames $emi) "$($k.Dir)/overlay_front_active_emissive.png" $FrameTime
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
    ingot = @(
        '................', '................', '................', '................',
        '................', '...KKKKKKKKKK...', '..KWWWWWWWWHDK..', '.KWHHHHHHHHHDDK.',
        '.KWHHHHHHHHHDDK.', '.KKKKKKKKKKKKKK.', '................', '................',
        '................', '................', '................', '................')
    mould = @(
        '................', '................', '....KKKKKKKK....', '...KWWWWWWHDK...',
        '...KWHKKKKHDK...', '...KWHK..KHDK...', '...KWHK..KHDK...', '...KWHK..KHDK...',
        '...KWHK..KHDK...', '...KWHKKKKHDK...', '...KWHHHHHHDK...', '...KKKKKKKKKK...',
        '................', '................', '................', '................')
    disk = @(
        '................', '................', '.....KKKKKK.....', '....KWWHHHDK....',
        '...KWHHHHHHDK...', '..KWHHKKKKHHDK..', '..KWHHK..KHHDK..', '..KWHHK..KHHDK..',
        '..KWHHKKKKHHDK..', '...KWHHHHHDDK...', '....KDDDDDDK....', '.....KKKKKK.....',
        '................', '................', '................', '................')
    tube = @(
        '................', '................', '....KKKKKKKK....', '...KWWHHHHDDK...',
        '...KWHHHHHHDK...', '...KWHHHHHHDK...', '...KWHHHHHHDK...', '...KWHHHHHHDK...',
        '...KWHHHHHHDK...', '...KWHHHHHHDK...', '...KWHHHHHHDK...', '....KDDDDDDK....',
        '.....KKKKKK.....', '................', '................', '................')
}
$items = @(
    @('tantalum_pentoxide_dust', 'dust', 'E8E4D8'), @('hftac_blend_dust', 'dust', '6A6A74'), @('hftac_dust', 'dust', '5A5E78'),
    @('hftacn_crude_dust', 'dust', '8A7A5A'), @('hftacn_powder', 'dust', 'B49A5A'), @('hftacn_heating_element', 'tube', 'C8A460'),
    @('carbonyl_iron_powder', 'dust', '9AA0A8'), @('reduced_iron_powder', 'dust', 'B8BCC4'), @('strain_annealed_fe16n2_powder', 'dust', '7A8AA8'),
    @('polydimethylsilane_dust', 'dust', 'E4E8E0'), @('polycarbosilane_dust', 'dust', 'D8D0B0'),
    @('green_sic_fibre', 'disk', '88A068'), @('cured_sic_fibre', 'disk', '7A8A6A'), @('sic_fibre', 'disk', '4A4E58'), @('bn_coated_sic_fibre', 'disk', 'D8DCE4'),
    @('sic_fibre_preform', 'mould', '5A5E68'), @('coated_w_wire', 'tube', 'B8B0A0'), @('w_fibre_preform', 'mould', '8A8478'),
    @('ffkm_seal', 'disk', '2E2E36')
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
    $png = Read-Png (Join-Path $OutRoot ("item\$($it[0]).png"))
    Test-Pixels $png "item/$($it[0])" $false
    $opaque = 0; foreach ($v in $png.P) { if ((($v -shr 24) -band 255) -eq 255) { $opaque++ } }
    if ($opaque -lt 40) { $problems.Add("item/$($it[0]): only $opaque opaque pixels") }
}
if ($problems.Count -gt 0) { $problems | Select-Object -First 20 | ForEach-Object { Write-Error $_ -ErrorAction Continue }; exit 1 }

Write-Host "$ScriptName wrote $($written.Count) files"
if ($Credits) {
    foreach ($w in $written) { Write-Host "| pack/kubejs/assets/grindless/textures/$w | drawn procedurally by tools/assets/$ScriptName | ours |" }
}
