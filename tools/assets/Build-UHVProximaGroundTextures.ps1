<#
.SYNOPSIS
  Procedural 16x16 pixel art for the two UHV Proxima ground controller faces, three items and two blocks of the UHV-B5 package,
  of Gregtech Grindless.

.DESCRIPTION
  Every pixel is drawn by this script (palettes and small routines); nothing is copied or edited from GregTech Modern or any
  other mod. Output is deterministic. Same method and steel bezel as the earlier sets (Build-UHVProximaLifeTextures.ps1).

  Writes (under pack/kubejs/assets/grindless/textures/):
    block/multiblock/<machine>/overlay_front.png, overlay_front_active.png(+.mcmeta), overlay_front_active_emissive.png(+.mcmeta)
      for cold_trap_drill and biomining_heap
    item/<name>.png for leached_tailings, urea and cold_trap_coring_head
    block/uhv/<name>.png for biocemented_regolith and proxima_base_casing (all faces; fully opaque)

  Cold-trap drill: a derrick (frame legs, crown, top drive) over the drill string, ice under the regolith; working (4 frames,
    frametime 4), the string turns and a cold glint runs along the ice.
  Biomining heap: a heap of regolith on its liner under a white drip line; working, a drop runs along the line and the bacteria
    glow green on the heap.
  The *_emissive layer holds only the glow and the lamp.

  Conventions: transparent background, outer 1 px ring of the faces empty, every pixel fully opaque or fully transparent, none pure
  black, emissive layer a subset of the colour layer; blocks fully opaque. The final check fails the run (non-zero exit) if a written
  file breaks one.

  Run from the repo root:
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-UHVProximaGroundTextures.ps1

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

# The window is x4..11, y4..9.
function New-Face {
    param([string]$Kind, [int]$Frame, [bool]$Active)
    $c = New-Bezel
    $e = New-Canvas
    for ($y = 4; $y -le 9; $y++) { for ($x = 4; $x -le 11; $x++) { Set-Px $c $x $y $Pit } }
    switch ($Kind) {
        'drill' {
            # regolith on row 8, the ice under it (x6..9, row 9); frame legs at x4 and x11, the crown and top drive on row 4,
            # the drill string x7..8 from row 5 into the ice
            for ($x = 4; $x -le 11; $x++) { Set-Px $c $x 8 (Hex '5A5048'); Set-Px $c $x 9 (Hex '4A423C') }
            for ($x = 6; $x -le 9; $x++) { Set-Px $c $x 9 (Hex '8AB0C8') }
            for ($y = 4; $y -le 7; $y++) { Set-Px $c 4 $y (Hex '6A5A7A'); Set-Px $c 11 $y (Hex '6A5A7A') }
            for ($x = 5; $x -le 10; $x++) { Set-Px $c $x 4 (Hex '7A6A8A') }
            Set-Px $c 7 4 (Hex 'A0A4AC'); Set-Px $c 8 4 (Hex 'A0A4AC')
            for ($y = 5; $y -le 8; $y++) {
                $band = $false
                if ($Active) { $band = ((($y + $Frame) % 4) -eq 0) } else { $band = ($y -eq 6) }
                $tone = $(if ($band) { Hex 'C8CCD4' } else { Hex '7A8088' })
                Set-Px $c 7 $y $tone; Set-Px $c 8 $y (Shade $tone 0.8)
            }
            if ($Active) {
                Set-Both $c $e (6 + $Frame) 9 (Hex 'C8F4FF')
                Set-Both $c $e 5 7 (Hex '60C0FF')
            }
            else { Set-Px $c 5 7 (Hex '2A4A5A') }
        }
        default {
            # the heap: the liner on row 9, regolith rows 6..8 narrowing upwards; the PTFE drip line on row 4 with its emitters
            for ($x = 4; $x -le 11; $x++) { Set-Px $c $x 9 (Hex '4A4E52') }
            for ($x = 4; $x -le 11; $x++) { Set-Px $c $x 8 (Hex '6A5A4E') }
            for ($x = 5; $x -le 10; $x++) { Set-Px $c $x 7 (Hex '7A6A5A') }
            for ($x = 6; $x -le 9; $x++) { Set-Px $c $x 6 (Hex '8A7A68') }
            Set-Px $c 6 8 (Hex '5A4C42'); Set-Px $c 9 7 (Hex '6A5A4E')
            for ($x = 4; $x -le 11; $x++) { Set-Px $c $x 4 (Hex 'D8D8D0') }
            foreach ($x in 5, 8, 10) { Set-Px $c $x 5 (Hex '9A9A94') }
            if ($Active) {
                Set-Both $c $e (4 + 2 * $Frame) 4 (Hex '80D8FF')
                Set-Both $c $e (6 + $Frame) 6 (Hex '7AE04A')
                Set-Both $c $e (8 - $Frame + 2) 8 (Hex '5AC03A')
            }
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

$kinds = @(
    @{ Kind = 'drill'; Dir = 'block/multiblock/cold_trap_drill' },
    @{ Kind = 'heap'; Dir = 'block/multiblock/biomining_heap' }
)
foreach ($k in $kinds) {
    $idle = New-Face $k.Kind 0 $false
    Out-Tex $idle.C "$($k.Dir)/overlay_front.png"
    $col = @(); $emi = @()
    for ($f = 0; $f -lt $Frames; $f++) { $a = New-Face $k.Kind $f $true; $col += , $a.C; $emi += , $a.E }
    Out-Tex (Join-Frames $col) "$($k.Dir)/overlay_front_active.png" $FrameTime
    Out-Tex (Join-Frames $emi) "$($k.Dir)/overlay_front_active_emissive.png" $FrameTime
}

# ---------------------------------------------------------------- items

# a small pile of powder (H body, D shade)
$pileMap = @(
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '.......KK.......',
    '......KHHK......',
    '.....KHHDHK.....',
    '....KHDHHHDK....',
    '...KHHHHDHHHK...',
    '..KHDHHHHHHDHK..',
    '.KKKKKKKKKKKKKK.',
    '................',
    '................',
    '................'
)
# a heap of prills (W lit grains, H body)
$prillMap = @(
    '................',
    '................',
    '................',
    '................',
    '................',
    '.......KK.......',
    '......KWHK......',
    '.....KHWHWK.....',
    '....KWHHWHHK....',
    '...KHWHWHHWHK...',
    '..KWHHWHHWHWHK..',
    '.KHWHWHHWHHWHWK.',
    '.KKKKKKKKKKKKKK.',
    '................',
    '................',
    '................'
)
# a coring head: the shank (T), the naquadah alloy barrel (W lit, N body, D shade, M a marking), carbide teeth (C)
$headMap = @(
    '................',
    '......KKKK......',
    '......KTTK......',
    '......KTTK......',
    '....KKKKKKKK....',
    '....KWNNNNDK....',
    '....KWNNNNDK....',
    '....KWNMMNDK....',
    '....KWNNNNDK....',
    '....KWNNNNDK....',
    '....KWNNNNDK....',
    '....KKKKKKKK....',
    '....KCCCCCCK....',
    '....KC.CC.CK....',
    '.....C....C.....',
    '................'
)

$items = @(
    @{ Name = 'leached_tailings'; Map = $pileMap; Pal = (New-Palette 'K=3A3632 H=9A9288 D=6E665E') },
    @{ Name = 'urea'; Map = $prillMap; Pal = (New-Palette 'K=8A8C90 W=F8F8F4 H=D8DAD4') },
    @{ Name = 'cold_trap_coring_head'; Map = $headMap; Pal = (New-Palette 'K=24222A T=A0A4AC W=B8A8C8 N=6A5A7A D=4A3E58 M=E0C040 C=C8CCD0') }
)
foreach ($it in $items) {
    foreach ($row in $it.Map) { if ($row.Length -ne 16) { throw "$($it.Name): a map row is $($row.Length) wide" } }
    if ($it.Map.Count -ne 16) { throw "$($it.Name): the map is $($it.Map.Count) rows" }
    $c = New-Canvas
    Write-Map $c 0 0 $it.Map $it.Pal
    Out-Tex $c "item/$($it.Name).png"
}

# ---------------------------------------------------------------- blocks (all faces, fully opaque)

# a fixed grain for the regolith: three tones by a small integer hash
function Get-Grain {
    param([int]$X, [int]$Y, [int]$Base, [int]$Seed)
    $h = (($X * 7 + $Y * 13 + ($X * $Y) % 5 + $Seed) % 7)
    if ($h -eq 0) { return (Shade $Base 1.18) }
    if ($h -eq 3) { return (Shade $Base 0.82) }
    return $Base
}

# biocemented regolith: grey-brown grains bound by pale calcite veins
function New-Biocement {
    $c = New-Canvas
    $base = Hex '7A6E62'; $calcite = Hex 'E4DED2'
    for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
        $col = Get-Grain $x $y $base 0
        if ((($x + 2 * $y) % 11) -eq 0 -or (((3 * $x + $y) % 13) -eq 0 -and ($y % 3) -ne 0)) { $col = $calcite }
        Set-Px $c $x $y $col
    } }
    return $c
}

# Proxima base casing: a naquadah alloy frame (bevelled), a flare shield face (black composite with streaks) over a band of biocement,
# rivets in the corners
function New-BaseCasing {
    $c = New-Canvas
    $frame = Hex '6A5A7A'; $face = Hex '2E2A30'; $streak = Hex '4A4450'; $band = Hex '7A6E62'; $rivet = Hex 'D0D4DC'
    for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
        $col = $frame
        if ($x -eq 0 -or $y -eq 0) { $col = Hex 'B8B0C4' }
        elseif ($x -eq 15 -or $y -eq 15) { $col = Hex '3A3444' }
        elseif ($x -ge 2 -and $x -le 13 -and $y -ge 2 -and $y -le 13) {
            if ($y -ge 11) { $col = Get-Grain $x $y $band 2 }
            elseif ((($x + $y) % 5) -eq 0) { $col = $streak }
            else { $col = $face }
        }
        Set-Px $c $x $y $col
    } }
    foreach ($p in @(@(2, 2), @(13, 2), @(2, 13), @(13, 13))) { Set-Px $c $p[0] $p[1] $rivet }
    for ($x = 2; $x -le 13; $x++) { Set-Px $c $x 10 (Hex '8A8090') }
    return $c
}

$blocks = @(
    @{ Name = 'biocemented_regolith'; Canvas = (New-Biocement) },
    @{ Name = 'proxima_base_casing'; Canvas = (New-BaseCasing) }
)
foreach ($b in $blocks) { Out-Tex $b.Canvas "block/uhv/$($b.Name).png" }

# self-check: alpha 0 or 255, nothing pure black; on the faces: ring empty, emissive a subset of the colour layer, no two frames alike;
# blocks fully opaque; every item and block registered by the startup script
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
foreach ($b in $blocks) {
    $png = Read-Png (Join-Path $OutRoot ("block\uhv\$($b.Name).png"))
    Test-Pixels $png "block/uhv/$($b.Name)" $false
    $opaque = 0; foreach ($v in $png.P) { if ((($v -shr 24) -band 255) -eq 255) { $opaque++ } }
    if ($opaque -ne 256) { $problems.Add("block/uhv/$($b.Name): block must be fully opaque ($opaque of 256)") }
}
$src = Get-Content -LiteralPath (Join-Path $RepoRoot 'pack\kubejs\startup_scripts\grindless\uhv\proxima_ground.js') -Raw
foreach ($it in $items) { if ($src -notmatch "(?m)^\s+$($it.Name)\s*:\s*\{\s*stack") { $problems.Add("item/$($it.Name): drawn here but not registered by uhv/proxima_ground.js") } }
foreach ($b in $blocks) { if ($src -notmatch "grindless:block/uhv/$($b.Name)'") { $problems.Add("block/uhv/$($b.Name): not referenced by uhv/proxima_ground.js") } }
foreach ($k in $kinds) { $m = ($k.Dir -split '/')[-1]; if ($src -notmatch "name: '$m'") { $problems.Add("$($k.Dir): no machine $m in uhv/proxima_ground.js") } }
if ($problems.Count -gt 0) { $problems | Select-Object -First 20 | ForEach-Object { Write-Error $_ -ErrorAction Continue }; exit 1 }

Write-Host "$ScriptName wrote $($written.Count) files"
if ($Credits) {
    foreach ($w in $written) { Write-Host "| pack/kubejs/assets/grindless/textures/$w | drawn procedurally by tools/assets/$ScriptName | ours |" }
}
