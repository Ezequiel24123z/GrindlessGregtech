<#
.SYNOPSIS
  Procedural 16x16 pixel art for the five UHV Proxima life controller faces and the fifteen items of the UHV-B4 package, of
  Gregtech Grindless.

.DESCRIPTION
  Every pixel is drawn by this script (palettes and small routines); nothing is copied or edited from GregTech Modern or any
  other mod. Output is deterministic. Same method and steel bezel as the earlier sets (Build-UHVCrystalsTextures.ps1).

  Writes (under pack/kubejs/assets/grindless/textures/):
    block/multiblock/<machine>/overlay_front.png, overlay_front_active.png(+.mcmeta), overlay_front_active_emissive.png(+.mcmeta)
      for xenoflora_rover_bay, sample_receiving_facility, xenobotany_greenhouse, xenobiochem_plant, radiotrophic_vat
    item/<name>.png for the fifteen items of startup_scripts/grindless/uhv/proxima_life.js

  Rover bay: a rover on its pad; working (4 frames, frametime 4), its headlight is on and a beacon runs along the pad.
  Receiving facility: an airlock door between two walls; working, the violet sterilising light sweeps across the door.
  Greenhouse: dark red crops on a soil bed; working, the lamps glow and the crops sway.
  Xenobiochemistry plant: two columns and a reactor; working, bubbles rise through the amber lysate.
  Radiotrophic vat: a black fungus mat behind the flare window; working, a flare flickers across the window.
  The *_emissive layer holds only the glow and the lamp.

  Conventions: transparent background, outer 1 px ring of the faces empty, every pixel fully opaque or fully transparent, none pure
  black, emissive layer a subset of the colour layer. The final check fails the run (non-zero exit) if a written file breaks one.

  Run from the repo root:
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-UHVProximaLifeTextures.ps1

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
        'rover' {
            # the pad on row 9; the rover's body x5..9, y6..7, a mast at x8 and wheels on row 8
            for ($x = 4; $x -le 11; $x++) { Set-Px $c $x 9 (Hex '3A3C44') }
            for ($x = 5; $x -le 9; $x++) { Set-Px $c $x 6 (Hex 'A0A6B2'); Set-Px $c $x 7 (Hex '6A707C') }
            Set-Px $c 6 6 (Hex '3A4A8A'); Set-Px $c 7 6 (Hex '3A4A8A')
            Set-Px $c 8 5 (Hex '8A909C'); Set-Px $c 8 4 (Hex '8A909C')
            foreach ($x in 5, 7, 9) { Set-Px $c $x 8 (Hex '2A2C32') }
            if ($Active) {
                Set-Both $c $e 10 6 (Hex 'FFF0B0')
                Set-Both $c $e 11 6 (Hex 'C8B070')
                Set-Both $c $e (4 + 2 * $Frame) 9 (Hex 'FFB040')
            }
            else { Set-Px $c 10 6 (Hex '5A5440') }
        }
        'facility' {
            # two airlock walls at x5 and x10, a door between them (x6..9)
            for ($y = 4; $y -le 9; $y++) { Set-Px $c 5 $y (Hex '8A9098'); Set-Px $c 10 $y (Hex '8A9098') }
            for ($y = 5; $y -le 9; $y++) { for ($x = 6; $x -le 9; $x++) { Set-Px $c $x $y (Hex '4A5A6A') } }
            Set-Px $c 8 7 (Hex 'C8A040')
            if ($Active) {
                for ($y = 5; $y -le 9; $y++) { Set-Both $c $e (6 + $Frame) $y (Hex 'B080FF') }
                Set-Both $c $e 7 4 (Hex 'FFB020'); Set-Both $c $e 8 4 (Hex 'FFB020')
            }
            else { Set-Px $c 7 4 (Hex '6A4A1A'); Set-Px $c 8 4 (Hex '6A4A1A') }
        }
        'greenhouse' {
            # the soil bed on row 9, crops at x5, 7, 9, 11 up to row 6; the lamps on row 4
            for ($x = 4; $x -le 11; $x++) { Set-Px $c $x 9 (Hex '5A3A22') }
            foreach ($x in 5, 7, 9) {
                $sway = 0
                if ($Active -and ((($x + $Frame) % 2) -eq 0)) { $sway = 1 }
                Set-Px $c $x 8 (Hex '4A0E1C'); Set-Px $c $x 7 (Hex '6A1426'); Set-Px $c ($x + $sway) 6 (Hex '8A1A2E')
            }
            foreach ($x in 5, 6, 9, 10) {
                if ($Active) { Set-Both $c $e $x 4 (Hex 'FF6A4A') } else { Set-Px $c $x 4 (Hex '5A2A22') }
            }
            if ($Active) { Set-Both $c $e (4 + 2 * $Frame) 5 (Hex 'C83A3A') }
        }
        'plant' {
            # two PTFE columns at x4..5 and x10..11; the reactor x7..8, y5..9 with amber lysate
            for ($y = 4; $y -le 9; $y++) {
                foreach ($x in 4, 5, 10, 11) { Set-Px $c $x $y (Hex 'D8D8D0') }
                Set-Px $c 6 $y (Hex '7A8088'); Set-Px $c 9 $y (Hex '7A8088')
            }
            for ($y = 5; $y -le 9; $y++) { Set-Px $c 7 $y (Hex '8A6A3A'); Set-Px $c 8 $y (Hex '8A6A3A') }
            if ($Active) {
                for ($y = 5; $y -le 9; $y++) { Set-Both $c $e 7 $y (Hex 'C89A4A'); Set-Px $c 8 $y (Hex 'B08440') }
                Set-Both $c $e 8 (9 - $Frame) (Hex 'FFE0A0')
            }
        }
        default {
            # the vat: the fungus mat (rows 8..9), the flare window above it
            for ($x = 4; $x -le 11; $x++) { Set-Px $c $x 9 (Hex '262224'); Set-Px $c $x 8 (Hex '3A3236') }
            foreach ($x in 5, 8, 10) { Set-Px $c $x 7 (Hex '2E282C') }
            for ($x = 4; $x -le 11; $x++) { Set-Px $c $x 4 (Hex '5A6A7A') }
            if ($Active) {
                for ($x = 4; $x -le 11; $x++) { Set-Both $c $e $x 4 (Hex 'FF9A3A') }
                $fx = 4 + 2 * $Frame
                Set-Both $c $e $fx 5 (Hex 'FFE0A0'); Set-Both $c $e ($fx + 1) 6 (Hex 'FFC060')
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
    @{ Kind = 'rover'; Dir = 'block/multiblock/xenoflora_rover_bay' },
    @{ Kind = 'facility'; Dir = 'block/multiblock/sample_receiving_facility' },
    @{ Kind = 'greenhouse'; Dir = 'block/multiblock/xenobotany_greenhouse' },
    @{ Kind = 'plant'; Dir = 'block/multiblock/xenobiochem_plant' },
    @{ Kind = 'vat'; Dir = 'block/multiblock/radiotrophic_vat' }
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

# the rover: a sensor mast (L lens), a lit body (W, H, D) with its betavoltaic panel (P), three wheels (T, G hub)
$roverMap = @(
    '................',
    '................',
    '..........KK....',
    '..........KL....',
    '...........K....',
    '...KKKKKKKKKKK..',
    '..KWWWWWWWWWWDK.',
    '..KHPPPPHHHHHDK.',
    '..KHPPPPHHHHHDK.',
    '..KDDDDDDDDDDDK.',
    '..KKKKKKKKKKKKK.',
    '..TTT..TTT..TTT.',
    '..TGT..TGT..TGT.',
    '..TTT..TTT..TTT.',
    '................',
    '................'
)
# a heap of leaves (L lit, H body, D shade)
$heapMap = @(
    '................',
    '................',
    '................',
    '................',
    '.......LL.......',
    '.....LLHHL......',
    '....LHHHHHL.....',
    '...LHHDHHHHL....',
    '..LHHHHHDHHHL...',
    '..HHDHHHHHHDHL..',
    '.KHHHHDHHHHHHHK.',
    '.KDHHHHHHDHHHDK.',
    '..KKKKKKKKKKKK..',
    '................',
    '................',
    '................'
)
# a mushroom: the cap (C) with spots (P), the stem (T)
$mushroomMap = @(
    '................',
    '................',
    '.....KKKKKK.....',
    '...KKCCPCCCKK...',
    '..KCCCCCCPCCCK..',
    '.KCCPCCCCCCCPCK.',
    '.KCCCCCCCCCCCCK.',
    '.KKKKKKKKKKKKKK.',
    '......KTTK......',
    '......KTTK......',
    '......KTTK......',
    '.....KTTTTK.....',
    '.....KKKKKK.....',
    '................',
    '................',
    '................'
)
# a sealed sample vial: the cap (C), glass (G, W the lit side), the liquid (L, D)
$vialMap = @(
    '................',
    '......KKKK......',
    '......KCCK......',
    '......KCCK......',
    '.....KKKKKK.....',
    '.....KWGGGK.....',
    '.....KWGGGK.....',
    '.....KWLLLK.....',
    '.....KWLLLK.....',
    '.....KWLDLK.....',
    '.....KWLLLK.....',
    '.....KWLLDK.....',
    '.....KLLLLK.....',
    '......KKKK......',
    '................',
    '................'
)
# a small pile of powder
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
# a flexible sheet seen from above (W lit edge, H face, D shade, E the cut edge)
$sheetMap = @(
    '................',
    '................',
    '................',
    '......KKKKKKKKK.',
    '.....KWHHHHHHDK.',
    '....KWHDHHHHDK..',
    '...KWHHHHDHDK...',
    '..KWHHDHHHDK....',
    '.KWHHHHHHDK.....',
    '.KEEEEEEEEK.....',
    '.KKKKKKKKKK.....',
    '................',
    '................',
    '................',
    '................',
    '................'
)
# a riveted panel (R rivets, W lit frame, D shaded frame) with the black composite face (M, N streaks)
$panelMap = @(
    '................',
    '................',
    '..KKKKKKKKKKKK..',
    '..KRWWWWWWWWRK..',
    '..KWMMMMMMMMDK..',
    '..KWMNMMMMNMDK..',
    '..KWMMMNNMMMDK..',
    '..KWMMMMMMMMDK..',
    '..KWMNMMMMNMDK..',
    '..KWMMMNNMMMDK..',
    '..KWMMMMMMMMDK..',
    '..KRDDDDDDDDRK..',
    '..KKKKKKKKKKKK..',
    '................',
    '................',
    '................'
)
# a DNA chip: two strands (A, B) crossing with rungs (G) on a green board (C), pins (P) below
$cassetteMap = @(
    '................',
    '................',
    '..KKKKKKKKKKKK..',
    '..KCCCCCCCCCCK..',
    '..KCACCCCCCBCK..',
    '..KCCACCCCBCCK..',
    '..KCCCAGGBCCCK..',
    '..KCCCCABCCCCK..',
    '..KCCCCBACCCCK..',
    '..KCCCBGGACCCK..',
    '..KCCBCCCCACCK..',
    '..KCBCCCCCCACK..',
    '..KCCCCCCCCCCK..',
    '..KKKKKKKKKKKK..',
    '...P.P.P.P.P....',
    '................'
)
# a culture flask: glass neck (G) over the dark red algae (L, D)
$flaskMap = @(
    '................',
    '......KKKK......',
    '......KGGK......',
    '......KGGK......',
    '......KGGK......',
    '.....KGGGGK.....',
    '.....KLLLLK.....',
    '....KLLDLLLK....',
    '....KLLLLDLK....',
    '...KLDLLLLLLK...',
    '...KLLLLDLLLK...',
    '..KLLLDLLLLDLK..',
    '..KLLLLLLLLLLK..',
    '..KKKKKKKKKKKK..',
    '................',
    '................'
)
# a petri dish: rim (G), medium (M), colonies (C)
$petriMap = @(
    '................',
    '................',
    '................',
    '....KKKKKKKK....',
    '..KKGGGGGGGGKK..',
    '.KGMMMMCMMMMMGK.',
    '.KGMCCMMMMCMMGK.',
    '.KGMMMMMCCMMMGK.',
    '.KGMCMMMMMMCMGK.',
    '..KKGGGGGGGGKK..',
    '...KKKKKKKKKK...',
    '................',
    '................',
    '................',
    '................',
    '................'
)

$items = @(
    @{ Name = 'proxima_rover'; Map = $roverMap; Pal = (New-Palette 'K=2E3038 W=C8CCD4 H=9AA0AC D=5A606C P=3A4A8A L=FF5A3A T=26282E G=6A6E78') },
    @{ Name = 'xeno_biomass'; Map = $heapMap; Pal = (New-Palette 'K=2A0A10 L=8A1A2A H=5A0E1C D=3A0812') },
    @{ Name = 'xeno_mushroom'; Map = $mushroomMap; Pal = (New-Palette 'K=2A1418 C=7A2A5A P=E0B0D0 T=D8C8B0') },
    @{ Name = 'melanised_biomass'; Map = $heapMap; Pal = (New-Palette 'K=161214 L=4A4048 H=2E282C D=221E20') },
    @{ Name = 'sterilised_flora_extract'; Map = $vialMap; Pal = (New-Palette 'K=3A3C44 C=8A6A4A W=F0F4F8 G=C8D8E0 L=9A3A3A D=6A2A2A') },
    @{ Name = 'sterilised_ice_organics'; Map = $vialMap; Pal = (New-Palette 'K=3A3C44 C=4A6A8A W=F0F4F8 G=C8D8E0 L=C89A5A D=8A6A3A') },
    @{ Name = 'melanin_extract'; Map = $pileMap; Pal = (New-Palette 'K=1E1A1C H=3A3236 D=2A2428') },
    @{ Name = 'melanin_chitosan_composite'; Map = $sheetMap; Pal = (New-Palette 'K=1E1A1C W=8A7A6A H=4A3E36 D=2E2622 E=5A4A3E') },
    @{ Name = 'flare_shield_panel'; Map = $panelMap; Pal = (New-Palette 'K=24262C R=D0D4DC W=9AA0B0 M=2E2A30 N=4A4450 D=5A6070') },
    @{ Name = 'far_red_gene_cassette'; Map = $cassetteMap; Pal = (New-Palette 'K=2A2E38 C=3A6A3A A=E04050 B=40A0E0 G=F0E060 P=C8B060') },
    @{ Name = 'engineered_far_red_algae'; Map = $flaskMap; Pal = (New-Palette 'K=3A3C44 G=D0E0E8 L=6A1A2A D=9A2A3A') },
    @{ Name = 'cladosporium_culture'; Map = $petriMap; Pal = (New-Palette 'K=6A7480 G=D0DCE4 M=E8D8A8 C=3A3A2A') },
    @{ Name = 'chromobacterium_culture'; Map = $petriMap; Pal = (New-Palette 'K=6A7480 G=D0DCE4 M=E8D8A8 C=6A2A9A') },
    @{ Name = 'sphingomonas_culture'; Map = $petriMap; Pal = (New-Palette 'K=6A7480 G=D0DCE4 M=E8D8A8 C=E0A020') },
    @{ Name = 'sporosarcina_culture'; Map = $petriMap; Pal = (New-Palette 'K=6A7480 G=D0DCE4 M=C8B080 C=F8F8F4') }
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
