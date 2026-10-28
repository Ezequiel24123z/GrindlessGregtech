<#
.SYNOPSIS
  Procedural 16x16 pixel art for the UEV nebula collector, interstellar dust lab and pulsar timing station controller faces and the items of the
  UEV-B2 package of Gregtech Grindless.

.DESCRIPTION
  Every pixel is drawn by this script; nothing is copied or edited from GregTech Modern or any other mod. Output is deterministic.
  Same method and steel bezel as Build-UEVEarthOrbitTextures.ps1.

  Writes (under pack/kubejs/assets/grindless/textures/):
    block/multiblock/<nebula_collector|interstellar_dust_lab|pulsar_timing_station>/:
      overlay_front.png, overlay_front_active.png(+.mcmeta), overlay_front_active_emissive.png(+.mcmeta)
    item/<name>.png for each item in $items below (six shapes, each tinted by one base colour)

  Collector face: a ring (the scoop) with gas dots; working, the dots stream toward the ring.
  Dust lab face: a grain over a dish; working, a scan line sweeps across it.
  Pulsar face: a star with two beams; working, the beams sweep round.
  The *_emissive layer holds only the glow and the lamp.

  Run from the repo root:
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-UEVAlphaCentauriTextures.ps1

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
    if ($Kind -eq 'scoop') {
        # a ring with gas dots on the left; active: the dots move toward the ring frame by frame
        foreach ($p in @(@(8, 4), @(9, 4), @(7, 5), @(10, 5), @(7, 8), @(10, 8), @(8, 9), @(9, 9), @(7, 6), @(7, 7), @(10, 6), @(10, 7))) { Set-Px $c $p[0] $p[1] (Hex '8A6AC8') }
        $x = 4 + $Frame
        if ($Active) { Set-Both $c $e $x 5 (Hex 'B0E0FF'); Set-Both $c $e $x 8 (Hex 'B0E0FF'); Set-Both $c $e ($x + 1) 6 (Hex 'FFFFFF') }
        else { Set-Px $c 4 5 (Hex '4A78B8'); Set-Px $c 5 8 (Hex '4A78B8'); Set-Px $c 6 6 (Hex '4A78B8') }
    }
    elseif ($Kind -eq 'dust') {
        # a grain above a dish; active: a scan line sweeps across the grain
        foreach ($p in @(@(7, 5), @(8, 5), @(6, 6), @(7, 6), @(8, 6), @(9, 6), @(7, 7), @(8, 7))) { Set-Px $c $p[0] $p[1] (Hex 'A88868') }
        for ($x = 5; $x -le 10; $x++) { Set-Px $c $x 9 (Hex '4A6A88') }
        if ($Active) { $sx = 5 + $Frame; foreach ($y in 5, 6, 7) { Set-Both $c $e $sx $y (Hex 'FFB0F0') } }
    }
    else {
        # a star in the middle with two beams; active: the beams turn through four positions
        $b = @(@(@(4, 6), @(11, 6)), @(@(5, 4), @(10, 9)), @(@(8, 4), @(7, 9)), @(@(11, 4), @(4, 9)))
        $f = if ($Active) { $Frame } else { 0 }
        foreach ($p in @(@(7, 6), @(8, 6), @(7, 7), @(8, 7))) { Set-Px $c $p[0] $p[1] (Hex 'E8F0FF') }
        foreach ($p in $b[$f]) { Set-Px $c $p[0] $p[1] (Hex '6A88C8'); if ($Active) { Set-Both $c $e $p[0] $p[1] (Hex 'A8D0FF') } }
        if ($Active) { Set-Both $c $e 7 6 (Hex 'FFFFFF') }
    }
    Set-Px $c 7 12 $(if ($Active) { $LampOn } else { $LampOff })
    Set-Px $c 8 12 $(if ($Active) { $LampOn } else { $LampOff })
    if ($Active) { Set-Px $e 7 12 $LampOn; Set-Px $e 8 12 $LampOn }
    for ($i = 0; $i -lt 16; $i++) { foreach ($p in @(@($i, 0), @($i, 15), @(0, $i), @(15, $i))) { Set-Px $c $p[0] $p[1] 0; Set-Px $e $p[0] $p[1] 0 } }
    return @{ C = $c; E = $e }
}

$kinds = @(
    @{ Kind = 'scoop'; Dir = 'block/multiblock/nebula_collector' },
    @{ Kind = 'dust'; Dir = 'block/multiblock/interstellar_dust_lab' },
    @{ Kind = 'pulsar'; Dir = 'block/multiblock/pulsar_timing_station' })
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
    wafer = @(
        '................', '................', '................', '.....KKKKKK.....',
        '...KKWWWWHHKK...', '..KWWHHHHHHDDK..', '..KWHHHHHHHDDK..', '..KWHHHHHHHDDK..',
        '..KWHHHHHHHDDK..', '..KKDHHHHHDDKK..', '....KKDDDDKK....', '......KKKK......',
        '................', '................', '................', '................')
    chip = @(
        '................', '................', '..K.K.K.K.K.K...', '.KKKKKKKKKKKKKK.',
        '.KWWWWWWWWWHDK..', '.KWHHHHHHHHHDK..', '.KWHHKKKKHHHDK..', '.KWHHKHHKHHHDK..',
        '.KWHHKKKKHHHDK..', '.KWHHHHHHHHHDK..', '.KKKKKKKKKKKKK..', '..K.K.K.K.K.K...',
        '................', '................', '................', '................')
    foil = @(
        '................', '................', '..KKKKKKKKKKKK..', '.KWWWWWWWWWWHDK.',
        '.KWHHHHHHHHHHDK.', '.KWHHHHHHHHHHDK.', '.KWHHHHHHHHHHDK.', '.KWHHHHHHHHHHDK.',
        '.KWHHHHHHHHHHDK.', '.KWHHHHHHHHHHDK.', '.KDDDDDDDDDDDDK.', '..KKKKKKKKKKKK..',
        '................', '................', '................', '................')
    vial = @(
        '................', '......KKKK......', '.....KWHHDK.....', '......KKKK......',
        '.....KWHHDK.....', '.....KWHHDK.....', '....KWHHHHDK....', '....KWHHHHDK....',
        '....KWHHHHDK....', '....KWHHHHDK....', '....KDHHHHDK....', '.....KDDDDK.....',
        '......KKKK......', '................', '................', '................')
}
$items = @(
    @('superhydride_scoop_coil', 'chip', '8A6AC8'), @('dust_laden_aerogel', 'wafer', 'C8D8E8'), @('extracted_grains', 'dust', 'A88868'),
    @('demineralised_grains', 'dust', 'C8A878'), @('fe60_record', 'foil', 'C86848'), @('silicate_residue', 'dust', '9A9088'),
    @('pulsar_timing_data', 'foil', '6A88C8'), @('alpha_coronal_field_map', 'foil', 'E8A848'),
    @('teos_flask', 'vial', 'D8E8D8'), @('silica_sol', 'vial', 'C8D8F0'), @('silica_wet_gel', 'vial', 'B8C8E0'), @('silica_aged_gel', 'vial', 'A8B8D8')
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
