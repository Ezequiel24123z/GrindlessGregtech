<#
.SYNOPSIS
  Procedural 16x16 pixel art for the UHV SiC device fab and solar array fab controller faces, and the six items of the UHV-A5
  package, of Gregtech Grindless.

.DESCRIPTION
  Every pixel is drawn by this script (palettes and small routines); nothing is copied or edited from GregTech Modern or any
  other mod. Output is deterministic. Same method and steel bezel as the earlier sets (Build-UHVPhotonicsTextures.ps1).

  Writes (under pack/kubejs/assets/grindless/textures/):
    block/multiblock/sic_device_fab/overlay_front.png, overlay_front_active.png(+.mcmeta), overlay_front_active_emissive.png(+.mcmeta)
    block/multiblock/solar_array_fab/ the same three files
    item/sic_boule.png, sic_wafer.png, sic_device_wafer.png, imm_epi_wafer.png, imm_film.png, cerium_coverglass.png

  SiC fab face: a bezel round a furnace window: the induction coil on both sides, the graphite crucible at the bottom and the seed
  crystal on its rod at the top. Working (4 frames, frametime 4), the coil turns glow in alternation, the charge in the crucible
  glows and a shimmer of vapour crosses towards the seed; the run lamp is green.
  Array fab face: a bezel round a clean-room window: filter lamps along the top, a solar panel on the bed and the lamination press
  above it. Working (4 frames, frametime 4), the platen comes down a pixel per frame and a glint runs along the cells. The
  *_emissive layer holds only the glow and the lamp.

  Conventions: transparent background, outer 1 px ring of the faces empty, every pixel fully opaque or fully transparent, none pure
  black, emissive layer a subset of the colour layer. The final check fails the run (non-zero exit) if a written file breaks one.

  Run from the repo root:
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-UHVPowerDevicesTextures.ps1

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
    if ($Kind -eq 'sic') {
        # the induction coil on columns 4 and 11; the seed rod (x7..8, y4) and the seed (x6..9, y5); the crucible (x6..9, y8..9)
        for ($y = 4; $y -le 9; $y++) {
            foreach ($x in 4, 11) {
                if ($Active -and ((($y + $Frame) % 2) -eq 0)) { Set-Both $c $e $x $y (Hex 'FF8A3A') } else { Set-Px $c $x $y (Hex '8A5A3A') }
            }
        }
        Set-Px $c 7 4 (Hex '8A8E98'); Set-Px $c 8 4 (Hex '8A8E98')
        for ($x = 6; $x -le 9; $x++) { Set-Px $c $x 5 (Hex '4A9A8A'); Set-Px $c $x 9 (Hex '4A4A50') }
        if ($Active) {
            for ($x = 6; $x -le 9; $x++) { Set-Both $c $e $x 8 (Hex 'FFB060') }
            # the vapour shimmer crosses row 7 and climbs row 6
            Set-Both $c $e (6 + $Frame) 7 (Hex 'FFE0A0')
            Set-Both $c $e (9 - $Frame) 6 (Hex '9AD8C8')
        }
        else {
            for ($x = 6; $x -le 9; $x++) { Set-Px $c $x 8 (Hex '5A5A62') }
        }
    }
    else {
        # filter lamps along y4; the panel on the bed (y9: cells with silver fingers); the press platen (x5..10) on its rod (x7..8)
        for ($x = 4; $x -le 11; $x += 2) { Set-Px $c $x 4 (Hex '8A9098') }
        for ($x = 4; $x -le 11; $x++) { Set-Px $c $x 9 $(if (($x % 2) -eq 0) { Hex '8A90A8' } else { Hex '1E2A6A' }) }
        $low = $(if ($Active) { 5 + $Frame } else { 5 })
        for ($y = 5; $y -lt $low; $y++) { Set-Px $c 7 $y (Hex 'B8BCC4'); Set-Px $c 8 $y (Hex 'B8BCC4') }
        for ($x = 5; $x -le 10; $x++) { Set-Px $c $x $low (Hex 'D8DCE4') }
        if ($Active) {
            for ($x = 5; $x -le 11; $x += 2) { Set-Both $c $e $x 4 (Hex 'E8F4FF') }
            Set-Both $c $e (5 + 2 * $Frame) 9 (Hex '6AA0FF')
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

$kinds = @(@{ Kind = 'sic'; Dir = 'block/multiblock/sic_device_fab' }, @{ Kind = 'array'; Dir = 'block/multiblock/solar_array_fab' })
foreach ($k in $kinds) {
    $idle = New-Face $k.Kind 0 $false
    Out-Tex $idle.C "$($k.Dir)/overlay_front.png"
    $col = @(); $emi = @()
    for ($f = 0; $f -lt $Frames; $f++) { $a = New-Face $k.Kind $f $true; $col += , $a.C; $emi += , $a.E }
    Out-Tex (Join-Frames $col) "$($k.Dir)/overlay_front_active.png" $FrameTime
    Out-Tex (Join-Frames $emi) "$($k.Dir)/overlay_front_active_emissive.png" $FrameTime
}

# ---------------------------------------------------------------- items

# A round wafer with a flat at the bottom: K outline, W lit edge, D shaded edge; every B cell is replaced by $Fill (x, y) -> palette char.
$WaferBase = @(
    '................',
    '.....KKKKKK.....',
    '...KKWWWWWWKK...',
    '..KWWBBBBBBBDK..',
    '..KWBBBBBBBBDK..',
    '.KWBBBBBBBBBBDK.',
    '.KWBBBBBBBBBBDK.',
    '.KWBBBBBBBBBBDK.',
    '.KWBBBBBBBBBBDK.',
    '.KWBBBBBBBBBBDK.',
    '.KWBBBBBBBBBBDK.',
    '..KBBBBBBBBBDK..',
    '..KDBBBBBBBDDK..',
    '...KKDDDDDDKK...',
    '................',
    '................'
)
# A square die or slice: K outline (x2..13, y2..13), W lit top-left edge, D shaded bottom-right edge; B cells go through $Fill.
$DieBase = @(
    '................',
    '................',
    '..KKKKKKKKKKKK..',
    '..KWWWWWWWWWWK..',
    '..KWBBBBBBBBDK..',
    '..KWBBBBBBBBDK..',
    '..KWBBBBBBBBDK..',
    '..KWBBBBBBBBDK..',
    '..KWBBBBBBBBDK..',
    '..KWBBBBBBBBDK..',
    '..KWBBBBBBBBDK..',
    '..KWBBBBBBBBDK..',
    '..KDDDDDDDDDDK..',
    '..KKKKKKKKKKKK..',
    '................',
    '................'
)
function Get-FilledMap {
    param([string[]]$Base, [scriptblock]$Fill)
    $out = @()
    for ($y = 0; $y -lt $Base.Count; $y++) {
        $row = ''
        for ($x = 0; $x -lt $Base[$y].Length; $x++) {
            $ch = $Base[$y][$x]
            if ($ch -eq 'B') { $row += [string](& $Fill $x $y) } else { $row += [string]$ch }
        }
        $out += $row
    }
    return , $out
}

# A boule standing on end: K outline, T its top face, W lit side, D shaded side; B cells go through $Fill.
$BouleBase = @(
    '................',
    '.....KKKKKK.....',
    '....KTTTTTTK....',
    '....KKTTTTKK....',
    '....KWBBBBDK....',
    '....KWBBBBDK....',
    '....KWBBBBDK....',
    '....KWBBBBDK....',
    '....KWBBBBDK....',
    '....KWBBBBDK....',
    '....KWBBBBDK....',
    '....KWBBBBDK....',
    '....KWBBBBDK....',
    '....KDDDDDDK....',
    '.....KKKKKK.....',
    '................'
)

$items = @(
    # a teal 4H-SiC crystal with a few growth facets (G)
    @{ Name = 'sic_boule'; Pal = 'K=1E3A38 W=9AD8C8 D=2E6A60 B=4A9A8A T=7ACCBA G=B8F0E0'
        Map = (Get-FilledMap $BouleBase { param($x, $y) if (($y -eq 6 -and $x -eq 8) -or ($y -eq 10 -and $x -eq 7)) { 'G' } else { 'B' } }) },
    # the polished wafer: plain teal with a glint (G) across it
    @{ Name = 'sic_wafer'; Pal = 'K=1E3A38 W=9AD8C8 D=2E6A60 B=4A9A8A G=B8F0E0'
        Map = (Get-FilledMap $WaferBase { param($x, $y) if (($x + $y) -eq 10 -and $x -ge 4 -and $x -le 7) { 'G' } else { 'B' } }) },
    # the device wafer: a grid of dies (L street lines) with a silver pad (A) each
    @{ Name = 'sic_device_wafer'; Pal = 'K=1E3A38 W=9AD8C8 D=2E6A60 B=4A9A8A L=2E6A60 A=D8DCE4'
        Map = (Get-FilledMap $WaferBase { param($x, $y) if (($x % 3) -eq 0 -or ($y % 3) -eq 0) { 'L' } elseif (($x % 3) -eq 1 -and ($y % 3) -eq 1) { 'A' } else { 'B' } }) },
    # a grey GaAs wafer under three junctions: GaInP (R), GaAs (G), InGaAs (I)
    @{ Name = 'imm_epi_wafer'; Pal = 'K=2A2C34 W=B0B4C0 D=4A4E5A R=C86A3A G=7A7A9A I=4A3A6A'
        Map = (Get-FilledMap $WaferBase { param($x, $y) if ($y -le 5) { 'R' } elseif ($y -le 8) { 'G' } else { 'I' } }) },
    # a dark blue film with silver fingers (F) and a busbar along the top
    @{ Name = 'imm_film'; Pal = 'K=0E1430 W=4A5AA0 D=101A40 B=1E2A6A F=C8CCD8'
        Map = (Get-FilledMap $DieBase { param($x, $y) if ($y -eq 4 -or ($x % 3) -eq 0) { 'F' } else { 'B' } }) },
    # a pale, faintly yellow glass pane with a glint (G)
    @{ Name = 'cerium_coverglass'; Pal = 'K=7A8A80 W=F4FAF0 D=A8B8A8 B=DCE8D4 G=FFFFF4'
        Map = (Get-FilledMap $DieBase { param($x, $y) if ((($x + $y) -eq 10 -or ($x + $y) -eq 11) -and $x -ge 5 -and $x -le 8) { 'G' } else { 'B' } }) }
)
foreach ($it in $items) {
    foreach ($row in $it.Map) { if ($row.Length -ne 16) { throw "$($it.Name): a map row is $($row.Length) wide" } }
    if ($it.Map.Count -ne 16) { throw "$($it.Name): the map is $($it.Map.Count) rows" }
    $c = New-Canvas
    Write-Map $c 0 0 $it.Map (New-Palette $it.Pal)
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
