<#
.SYNOPSIS
  Procedural 16x16 pixel art for the UHV MBE reactor and photonic foundry controller faces, and the nine items of the UHV-A4
  package, of Gregtech Grindless.

.DESCRIPTION
  Every pixel is drawn by this script (palettes and small routines); nothing is copied or edited from GregTech Modern or any
  other mod. Output is deterministic. Same method and steel bezel as the earlier sets (Build-UHVCrystalsTextures.ps1).

  Writes (under pack/kubejs/assets/grindless/textures/):
    block/multiblock/mbe_reactor/overlay_front.png, overlay_front_active.png(+.mcmeta), overlay_front_active_emissive.png(+.mcmeta)
    block/multiblock/photonic_foundry/ the same three files
    item/qcl_superlattice_wafer.png, implanted_ln_wafer.png, lnoi_wafer.png, gst_target.png, spent_gst_target.png,
    item/pcm_photonic_die.png, quantum_memory_chip.png, sic_epi_wafer.png, implanted_sic_wafer.png

  MBE face: a bezel round a vacuum window: the substrate on its manipulator at the top, four effusion cells at the bottom and the
  cryoshroud on both sides. Working (4 frames, frametime 4), the substrate glows, the cells are lit and their beams climb a
  pixel per frame towards it; the run lamp is green.
  Foundry face: a bezel round a clean-room window: the wafer bonder on the left, the sputter target on the right, filter lamps
  along the top. Working (4 frames, frametime 4), the bonder ram comes down a pixel per frame and the argon plasma under the
  target flickers. The *_emissive layer holds only the glow and the lamp.

  Conventions: transparent background, outer 1 px ring of the faces empty, every pixel fully opaque or fully transparent, none pure
  black, emissive layer a subset of the colour layer. The final check fails the run (non-zero exit) if a written file breaks one.

  Run from the repo root:
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-UHVPhotonicsTextures.ps1

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

# the four effusion cells (x, colour of the beam) and the path each beam climbs, one pixel per frame, from y8 up to y5
$Cells = @(
    @{ X = 5; Beam = 'B48CFF'; Path = @(@(5, 8), @(6, 7), @(6, 6), @(7, 5)) },
    @{ X = 7; Beam = '5AA8FF'; Path = @(@(7, 8), @(7, 7), @(7, 6), @(7, 5)) },
    @{ X = 8; Beam = 'F0F4FF'; Path = @(@(8, 8), @(8, 7), @(8, 6), @(8, 5)) },
    @{ X = 10; Beam = 'FFE060'; Path = @(@(10, 8), @(9, 7), @(9, 6), @(8, 5)) }
)

function New-Face {
    param([string]$Kind, [int]$Frame, [bool]$Active)
    $c = New-Bezel
    $e = New-Canvas
    for ($y = 4; $y -le 9; $y++) { for ($x = 4; $x -le 11; $x++) { Set-Px $c $x $y $Pit } }
    if ($Kind -eq 'mbe') {
        # the cryoshroud on columns 4 and 11; the manipulator rod down column 7..8 to the substrate at y4; the cells on row 9
        for ($y = 4; $y -le 9; $y++) { Set-Px $c 4 $y (Hex '3A5A6A'); Set-Px $c 11 $y (Hex '3A5A6A') }
        foreach ($cell in $Cells) { Set-Px $c $cell.X 9 (Hex '6A6E78') }
        if ($Active) {
            for ($x = 6; $x -le 9; $x++) { Set-Both $c $e $x 4 (Hex 'FF9A3A') }
            foreach ($cell in $Cells) {
                Set-Both $c $e $cell.X 9 (Hex $cell.Beam)
                $p = $cell.Path[$Frame % 4]
                Set-Both $c $e $p[0] $p[1] (Hex $cell.Beam)
            }
            # frost on the cryoshroud glints down the wall
            Set-Px $c 4 (5 + $Frame) (Hex '9AD8F0'); Set-Px $c 11 (8 - $Frame) (Hex '9AD8F0')
        }
        else {
            for ($x = 6; $x -le 9; $x++) { Set-Px $c $x 4 (Hex '5A4A5A') }
        }
    }
    else {
        # filter lamps along y4; the bonder (frame x4..6, ram down column 5, chuck on row 9); the sputter target (x9..11, y5)
        for ($x = 4; $x -le 11; $x += 2) { Set-Px $c $x 4 (Hex '8A9098') }
        for ($x = 4; $x -le 6; $x++) { Set-Px $c $x 9 (Hex '8A8E98') }
        for ($x = 9; $x -le 11; $x++) { Set-Px $c $x 5 (Hex '6A5A70') }
        for ($x = 9; $x -le 11; $x++) { Set-Px $c $x 9 (Hex '5A5E68') }
        if ($Active) {
            for ($x = 5; $x -le 11; $x += 2) { Set-Both $c $e $x 4 (Hex 'E8F4FF') }
            $low = 5 + $Frame
            for ($y = 5; $y -le $low; $y++) { Set-Px $c 5 $y (Hex 'B8BCC4') }
            Set-Px $c 4 $low (Hex 'D8DCE4'); Set-Px $c 6 $low (Hex 'D8DCE4')
            for ($y = 6; $y -le 8; $y++) {
                for ($x = 9; $x -le 11; $x++) {
                    if ((($x + $y + $Frame) % 2) -eq 0) { Set-Both $c $e $x $y (Hex 'D070FF') } else { Set-Px $c $x $y (Hex '6A2A90') }
                }
            }
        }
        else {
            Set-Px $c 5 5 (Hex 'B8BCC4'); Set-Px $c 4 5 (Hex 'D8DCE4'); Set-Px $c 6 5 (Hex 'D8DCE4')
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

$kinds = @(@{ Kind = 'mbe'; Dir = 'block/multiblock/mbe_reactor' }, @{ Kind = 'foundry'; Dir = 'block/multiblock/photonic_foundry' })
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

$items = @(
    # InP under hundreds of InGaAs (S) / AlInAs (T) layers: fine horizontal stripes
    @{ Name = 'qcl_superlattice_wafer'; Pal = 'K=2E2238 W=C8B8E0 D=5A4A70 S=8A6AB0 T=B89A50'
        Map = (Get-FilledMap $WaferBase { param($x, $y) if ($y % 2) { 'S' } else { 'T' } }) },
    # pale lithium niobate with a buried row of helium bubbles (H)
    @{ Name = 'implanted_ln_wafer'; Pal = 'K=5A5040 W=FAF4E4 D=B8AE96 B=E4DCC4 H=8ACCE8'
        Map = (Get-FilledMap $WaferBase { param($x, $y) if ($y -eq 8 -and ($x % 2) -eq 0) { 'H' } else { 'B' } }) },
    # grey silicon carrying the LN film (L) with two bright waveguides (G)
    @{ Name = 'lnoi_wafer'; Pal = 'K=2A2E38 W=B8C0D0 D=4A5060 B=6A7080 L=E4DCC4 G=FFF8E0'
        Map = (Get-FilledMap $WaferBase { param($x, $y) if ($y -eq 6 -or $y -eq 9) { 'G' } elseif ($y -ge 4 -and $y -le 11) { 'L' } else { 'B' } }) },
    # a GST disc (B, with grain G) bonded to a copper backing plate (K, W, D)
    @{ Name = 'gst_target'; Pal = 'K=7A4022 W=D88A50 D=A05A30 B=5A5C64 G=7A7C86'
        Map = (Get-FilledMap $WaferBase { param($x, $y) if ((($x * 3 + $y * 5) % 7) -eq 0) { 'G' } else { 'B' } }) },
    # the same target eroded into a racetrack groove (R) round the middle
    @{ Name = 'spent_gst_target'; Pal = 'K=7A4022 W=D88A50 D=A05A30 B=5A5C64 G=7A7C86 R=2E3036'
        Map = (Get-FilledMap $WaferBase { param($x, $y) $d = [math]::Sqrt([math]::Pow($x - 7.5, 2) + [math]::Pow($y - 7.5, 2)); if ($d -ge 2.6 -and $d -le 3.9) { 'R' } elseif ((($x * 3 + $y * 5) % 7) -eq 0) { 'G' } else { 'B' } }) },
    # an LNOI die: waveguides (G) across, GST cells (P) where the columns cross them
    @{ Name = 'pcm_photonic_die'; Pal = 'K=2A2E38 W=B8C0D0 D=4A5060 B=8A8270 G=FFF8E0 P=4A3A6A'
        Map = (Get-FilledMap $DieBase { param($x, $y) if ($y -eq 5 -or $y -eq 8 -or $y -eq 11) { if ($x -eq 5 -or $x -eq 9) { 'P' } else { 'G' } } else { 'B' } }) },
    # a pink Eu:YSO slice with the stored light (L) in its middle
    @{ Name = 'quantum_memory_chip'; Pal = 'K=6A3A50 W=FCE4EE D=C08AA0 B=E8B8CC L=FF5A8A'
        Map = (Get-FilledMap $DieBase { param($x, $y) if (($x -eq 7 -or $x -eq 8) -and ($y -eq 7 -or $y -eq 8)) { 'L' } else { 'B' } }) },
    # a teal silicon carbide wafer with its drift layer (E) on top
    @{ Name = 'sic_epi_wafer'; Pal = 'K=1E3A38 W=9AD8C8 D=2E6A60 B=4A9A8A E=6AC0AE'
        Map = (Get-FilledMap $WaferBase { param($x, $y) if ($y -le 6) { 'E' } else { 'B' } }) },
    # the same wafer peppered with implanted aluminium (A)
    @{ Name = 'implanted_sic_wafer'; Pal = 'K=1E3A38 W=9AD8C8 D=2E6A60 B=4A9A8A E=6AC0AE A=D8DCE4'
        Map = (Get-FilledMap $WaferBase { param($x, $y) if ((($x + $y) % 3) -eq 0 -and ($y % 2) -eq 1) { 'A' } elseif ($y -le 6) { 'E' } else { 'B' } }) }
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
