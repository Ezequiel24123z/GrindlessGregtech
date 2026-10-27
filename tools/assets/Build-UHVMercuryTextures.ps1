<#
.SYNOPSIS
  Procedural 16x16 pixel art for UHV on Mercury's ground (package UHV-B2) of Gregtech Grindless: the seven items and the regolith
  excavator and solar vapour furnace controller faces.

.DESCRIPTION
  Every pixel is drawn by this script (maps, palettes and small routines); nothing is copied or edited from GregTech Modern or any
  other mod. Output is deterministic. Same method and steel bezel as the earlier sets (Build-UHVTranscuriumTextures.ps1).

  Writes (under pack/kubejs/assets/grindless/textures/):
    item/mercury_regolith.png, stripped_mercury_regolith.png, excavator_bucket_drum.png, regolith_crucible_lining.png,
         silicon_monoxide_dust.png, alumina_calcia_residue.png, iron_tube.png
    block/multiblock/regolith_excavator/overlay_front.png, overlay_front_active.png(+.mcmeta), overlay_front_active_emissive.png(+.mcmeta)
    block/multiblock/solar_vapour_furnace/ the same three files

  Excavator face: a bezel round a window with the two bucket drums; working (4 frames, frametime 4), the scoops turn in opposite
  directions and the run lamp is green. Furnace face: a bezel round the vacuum chamber window; working, the focal spot glows white
  and its heat shimmers outward through orange and red, and the condenser plates either side catch a pale glow.
  The *_emissive layer holds only the glow and the lamp.

  Conventions (faces): transparent background, outer 1 px ring empty, every pixel fully opaque or fully transparent, none pure black,
  emissive layer a subset of the colour layer. The final check fails the run (non-zero exit) if a written face breaks one.

  Run from the repo root:
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-UHVMercuryTextures.ps1

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

function Out-Map {
    param([string]$Name, [string[]]$Map, $Pal)
    $c = New-Canvas
    Write-Map $c 0 0 $Map $Pal
    Out-Tex $c "item/$Name.png"
}

# ---------------------------------------------------------------- items

# loose rock: a few chunks (L lit, M body, D shade, K outline) with a speckle (S) of sulfur or graphite
$rockMap = @(
    '................',
    '................',
    '.....KKK........',
    '....KLMDK..KKK..',
    '....KMMDK.KLMDK.',
    '.....KDK..KMDDK.',
    '..KKK.....KKKK..',
    '.KLMDK.KKKK.....',
    '.KMMDKKLLMDK....',
    '.KKDKKLMSMDDK...',
    '....KLMMMMDDK.KK',
    '...KLMMMSMDDKKLK',
    '...KMSMMMMDDKKDK',
    '....KKKKKKKKK.KK',
    '................',
    '................'
)
Out-Map 'mercury_regolith' $rockMap (New-Palette 'K=2C2A28 L=8E8880 M=6A645C D=48443E S=C8B048')
Out-Map 'stripped_mercury_regolith' $rockMap (New-Palette 'K=3A3632 L=B8B0A4 M=948C80 D=6E675E S=5A5650')

# a heap of powder
$dustMap = @(
    '................',
    '................',
    '................',
    '................',
    '.......KK.......',
    '......KLLK......',
    '.....KLLMMK.....',
    '....KLLMMMDK....',
    '....KLMMSMDK....',
    '...KLLMMMDDDK...',
    '..KLLMSMMMDDDK..',
    '..KLMMMMMSDDDK..',
    '.KLLMMMMMDDDDDK.',
    '.KKKKKKKKKKKKKK.',
    '................',
    '................'
)
Out-Map 'silicon_monoxide_dust' $dustMap (New-Palette 'K=2E2A22 L=B0A68C M=8C8470 D=5E584A S=6E6656')
Out-Map 'alumina_calcia_residue' $dustMap (New-Palette 'K=4A4438 L=FAF6EC M=E2DACA D=B4AA94 S=CEC4AE')

# the bucket drum, end on: a steel cylinder (L/M/D) ringed with dark scoops (T) on rims (S)
$drumMap = @(
    '................',
    '....KKKKKKKK....',
    '...KLLLLWLLLK...',
    '..KSLLWWLLLLSK..',
    '..KSMMMMMMMMSK..',
    '.KTKMMMMMMMMKTK.',
    '.KTKMDDDDDDMKTK.',
    '..KSMMMMMMMMSK..',
    '.KTKMMMMMMMMKTK.',
    '.KTKMDDDDDDMKTK.',
    '..KSMMMMMMMMSK..',
    '..KSDDDDDDDDSK..',
    '...KDDDDDDDDK...',
    '....KKKKKKKK....',
    '................',
    '................'
)
Out-Map 'excavator_bucket_drum' $drumMap (New-Palette 'K=22262C W=E4ECF4 L=B4BEC8 M=8A949E D=5C646E S=6A6458 T=3E3A34')

# the crucible lining: a ceramic cup (L/D walls, W rim highlight) with its dark hollow (I)
$cupMap = @(
    '................',
    '................',
    '..KKKKKKKKKKKK..',
    '..KWWLLLLLLLDK..',
    '..KLKKKKKKKKDK..',
    '..KLKIIIIIIKDK..',
    '..KLKIIIIIIKDK..',
    '..KLLKIIIIKLDK..',
    '...KLKIIIIKDK...',
    '...KLLKKKKLDK...',
    '...KLLLLLLLDK...',
    '....KLLLLLDK....',
    '....KDDDDDDK....',
    '.....KKKKKK.....',
    '................',
    '................'
)
Out-Map 'regolith_crucible_lining' $cupMap (New-Palette 'K=4A4032 W=FFF8E8 L=E6DCC4 D=B0A27E I=6E5E44')

# the iron tube, lying diagonally, its open end (H) at the bottom left
$tubeMap = @(
    '................',
    '..........KK....',
    '.........KWGK...',
    '........KWGGDK..',
    '.......KWGGGDK..',
    '......KWGGGDK...',
    '.....KWGGGDK....',
    '....KWGGGDK.....',
    '...KWGGGDK......',
    '..KWGGGDK.......',
    '..KGGGDK........',
    '..KEHEK.........',
    '..KEEK..........',
    '...KK...........',
    '................',
    '................'
)
Out-Map 'iron_tube' $tubeMap (New-Palette 'K=2A2C30 W=E8ECF0 G=A8AEB4 D=6E747A E=8A9096 H=2E3034')

# ---------------------------------------------------------------- controller faces

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

# the 12 cells round a 2x2 hub at (x, y)..(x+1, y+1), clockwise from the top left
function Get-Rim {
    param([int]$X, [int]$Y)
    return @(@(($X - 1), ($Y - 1)), @($X, ($Y - 1)), @(($X + 1), ($Y - 1)), @(($X + 2), ($Y - 1)), @(($X + 2), $Y), @(($X + 2), ($Y + 1)),
        @(($X + 2), ($Y + 2)), @(($X + 1), ($Y + 2)), @($X, ($Y + 2)), @(($X - 1), ($Y + 2)), @(($X - 1), ($Y + 1)), @(($X - 1), $Y))
}

function New-Face {
    param([string]$Kind, [int]$Frame, [bool]$Active)
    $c = New-Bezel
    $e = New-Canvas
    for ($y = 4; $y -le 9; $y++) { for ($x = 4; $x -le 11; $x++) { Set-Px $c $x $y $Pit } }
    if ($Kind -eq 'excavator') {
        # grey regolith along the bottom of the window, two drums (hubs at x4..5 and x10..11, y6..7) with three scoops each
        for ($x = 4; $x -le 11; $x++) { Set-Px $c $x 9 (Hex '5E5850') }
        $steel = Hex '8A949E'; $scoop = Hex 'C8CED4'; $rim = Hex '4C545C'
        $drums = @(@{ X = 4; Y = 6; Dir = 1 }, @{ X = 10; Y = 6; Dir = -1 })
        foreach ($d in $drums) {
            Set-Rect $c $d.X $d.Y 2 2 $steel
            $cells = Get-Rim $d.X $d.Y
            $turn = if ($Active) { $Frame } else { 0 }
            for ($i = 0; $i -lt 12; $i++) {
                $p = $cells[$i]
                if ($p[0] -lt 3 -or $p[0] -gt 12) { continue }
                $k = (($i - $d.Dir * $turn) % 4 + 4) % 4
                Set-Px $c $p[0] $p[1] $(if ($k -eq 0) { $scoop } else { $rim })
            }
        }
        if ($Active) {
            # thrown regolith between the drums, one grain per frame
            $grains = @(@(7, 5), @(8, 4), @(7, 6), @(8, 7))
            Set-Px $c $grains[$Frame][0] $grains[$Frame][1] (Hex 'A09888')
        }
    }
    else {
        # the chamber window: the crucible (x6..9, y7..9), the condenser plates at x4 and x11, the focal spot above the crucible
        Set-Rect $c 6 8 4 2 (Hex '6E5E44')
        Set-Px $c 6 7 (Hex 'B0A27E'); Set-Px $c 9 7 (Hex 'B0A27E')
        if ($Active) {
            $heat = @((Hex 'FFFCE8'), (Hex 'FFD25A'), (Hex 'FF8C28'), (Hex 'C83C14'))
            Set-Both $c $e 7 7 $heat[0]; Set-Both $c $e 8 7 $heat[0]
            for ($y = 4; $y -le 6; $y++) {
                for ($x = 5; $x -le 10; $x++) {
                    $d = [Math]::Max([Math]::Abs(2 * $x - 15) - 1, 2 * (7 - $y) - 1)
                    $ring = [int][Math]::Ceiling($d / 2)
                    if ($ring -lt 1 -or $ring -gt 3) { continue }
                    # the shimmer: one ring brighter per frame
                    $tone = if ((($ring + $Frame) % 4) -eq 0) { $ring - 1 } else { $ring }
                    Set-Both $c $e $x $y $heat[[Math]::Min($tone, 3)]
                }
            }
            $plate = if (($Frame % 2) -eq 0) { Hex 'D8E8F0' } else { Hex 'A8C4D4' }
            for ($y = 4; $y -le 8; $y++) { Set-Both $c $e 4 $y $plate; Set-Both $c $e 11 $y $plate }
        }
        else {
            for ($y = 4; $y -le 8; $y++) { Set-Px $c 4 $y (Hex '3A4650'); Set-Px $c 11 $y (Hex '3A4650') }
            Set-Px $c 7 7 (Hex '4A4032'); Set-Px $c 8 7 (Hex '4A4032')
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

$kinds = @(@{ Kind = 'excavator'; Dir = 'block/multiblock/regolith_excavator' }, @{ Kind = 'furnace'; Dir = 'block/multiblock/solar_vapour_furnace' })
foreach ($k in $kinds) {
    $idle = New-Face $k.Kind 0 $false
    Out-Tex $idle.C "$($k.Dir)/overlay_front.png"
    $col = @(); $emi = @()
    for ($f = 0; $f -lt $Frames; $f++) { $a = New-Face $k.Kind $f $true; $col += , $a.C; $emi += , $a.E }
    Out-Tex (Join-Frames $col) "$($k.Dir)/overlay_front_active.png" $FrameTime
    Out-Tex (Join-Frames $emi) "$($k.Dir)/overlay_front_active_emissive.png" $FrameTime
}

# self-check: ring empty, alpha 0 or 255, nothing pure black, emissive a subset of the colour layer, no two frames alike
$problems = New-Object System.Collections.Generic.List[string]
foreach ($k in $kinds) {
    $png = @{}
    foreach ($n in 'overlay_front', 'overlay_front_active', 'overlay_front_active_emissive') { $png[$n] = Read-Png (Join-Path $OutRoot ("$($k.Dir)/$n.png" -replace '/', '\')) }
    foreach ($n in $png.Keys) {
        $c = $png[$n]
        for ($y = 0; $y -lt $c.H; $y++) {
            for ($x = 0; $x -lt $c.W; $x++) {
                $v = $c.P[$y * $c.W + $x]; $a = ($v -shr 24) -band 255
                $ring = ((($x % 16) -eq 0) -or (($x % 16) -eq 15) -or (($y % 16) -eq 0) -or (($y % 16) -eq 15))
                if ($a -ne 0 -and $a -ne 255) { $problems.Add("$($k.Dir)/${n}: partial alpha at $x,$y") }
                if ($a -eq 255 -and ($v -band 0xFFFFFF) -eq 0) { $problems.Add("$($k.Dir)/${n}: pure black at $x,$y") }
                if ($ring -and $a -ne 0) { $problems.Add("$($k.Dir)/${n}: ring pixel at $x,$y") }
            }
        }
    }
    $col = $png['overlay_front_active']; $em = $png['overlay_front_active_emissive']
    for ($i = 0; $i -lt $col.P.Length; $i++) { if ($em.P[$i] -ne 0 -and $em.P[$i] -ne $col.P[$i]) { $problems.Add("$($k.Dir): emissive differs from colour at $i") } }
    for ($f = 0; $f -lt $Frames - 1; $f++) {
        $same = $true
        for ($i = 0; $i -lt 256; $i++) { if ($col.P[$f * 256 + $i] -ne $col.P[($f + 1) * 256 + $i]) { $same = $false; break } }
        if ($same) { $problems.Add("$($k.Dir): frame $f repeats frame $($f + 1)") }
    }
}
if ($problems.Count -gt 0) { $problems | Select-Object -First 20 | ForEach-Object { Write-Error $_ -ErrorAction Continue }; exit 1 }

Write-Host "$ScriptName wrote $($written.Count) files"
if ($Credits) {
    foreach ($w in $written) { Write-Host "| pack/kubejs/assets/grindless/textures/$w | drawn procedurally by tools/assets/$ScriptName | ours |" }
}
