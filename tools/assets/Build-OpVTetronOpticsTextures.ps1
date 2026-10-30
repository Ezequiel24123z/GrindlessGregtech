<#
.SYNOPSIS
  Procedural 16x16 pixel art for the OpV tetron fab and gamma optics works controller faces and the items of the OpV-B1 package, of
  Gregtech Grindless.

.DESCRIPTION
  Every pixel is drawn by this script (palettes and small routines); nothing is copied or edited from GregTech Modern or any
  other mod. Output is deterministic. Same method and steel bezel as Build-UXVShequidMntTextures.ps1.

  Writes (under pack/kubejs/assets/grindless/textures/):
    block/multiblock/<machine>/overlay_front.png, overlay_front_active.png(+.mcmeta), overlay_front_active_emissive.png(+.mcmeta)
      for tetron_fab and gamma_optics_works
    item/<name>.png for each item in $items below (shapes tinted by one base colour)

  Tetron face: two nanowires joined by a superconducting backbone (an H); working (4 frames, frametime 4) the four wire ends light in
  turn, the parity readout going round the tetron. Gamma face: a Laue lens seen end on, a ring of eight Ge and GaAs tiles round the
  focal spot; working, opposite tiles diffract in turn and the focal spot moves. The *_emissive layer holds only the glow and the lamp.

  Conventions: transparent background, outer 1 px ring of the face empty, every pixel fully opaque or fully transparent, none pure
  black, emissive layer a subset of the colour layer. The final check fails the run (non-zero exit) if a written file breaks one.

  Run from the repo root:
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-OpVTetronOpticsTextures.ps1

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

# the four wire ends of the tetron, in readout order (clockwise from the top left)
$Ends = @(@(5, 5), @(10, 5), @(10, 8), @(5, 8))
# the Laue lens: eight tiles clockwise from the top left (tile k and k + 4 face each other) and the four focal-spot pixels
$Tiles = @(@(6, 4), @(9, 4), @(11, 6), @(11, 7), @(9, 9), @(6, 9), @(4, 7), @(4, 6))
$Spot = @(@(7, 6), @(8, 6), @(8, 7), @(7, 7))

function New-Face {
    param([string]$Kind, [int]$Frame, [bool]$Active)
    $c = New-Bezel
    $e = New-Canvas
    for ($y = 4; $y -le 9; $y++) { for ($x = 4; $x -le 11; $x++) { Set-Px $c $x $y $Pit } }
    if ($Kind -eq 'tetron') {
        $wire = Hex 'A0B8D0'; $backbone = Hex 'D8C070'; $endOff = Hex '507090'
        for ($x = 5; $x -le 10; $x++) { Set-Px $c $x 5 $wire; Set-Px $c $x 8 $wire }
        foreach ($y in 6, 7) { Set-Px $c 7 $y $backbone; Set-Px $c 8 $y $backbone }
        foreach ($p in $Ends) { Set-Px $c $p[0] $p[1] $endOff }
        if ($Active) {
            $glow = Hex 'FF70D0'; $halo = Hex 'B060FF'
            $p = $Ends[$Frame % 4]
            Set-Both $c $e $p[0] $p[1] $glow
            $q = $Ends[($Frame + 3) % 4]
            Set-Both $c $e $q[0] $q[1] $halo
            Set-Both $c $e (7 + ($Frame % 2)) (6 + [Math]::Floor($Frame / 2)) (Hex 'FFF0A0')
        }
    }
    elseif ($Kind -eq 'gamma') {
        $ge = Hex '90A0B8'; $gaas = Hex '806A98'; $spotOff = Hex '505868'
        for ($i = 0; $i -lt $Tiles.Count; $i++) { $p = $Tiles[$i]; Set-Px $c $p[0] $p[1] $(if ($i % 2 -eq 0) { $ge } else { $gaas }) }
        foreach ($p in $Spot) { Set-Px $c $p[0] $p[1] $spotOff }
        if ($Active) {
            $glow = Hex 'FFE070'
            foreach ($k in $Frame, ($Frame + 4)) { $p = $Tiles[$k % 8]; Set-Both $c $e $p[0] $p[1] $glow }
            $p = $Spot[$Frame % 4]
            Set-Both $c $e $p[0] $p[1] (Hex 'F0F8FF')
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

$Dirs = @('block/multiblock/tetron_fab', 'block/multiblock/gamma_optics_works')
$Kinds = @('tetron', 'gamma')
for ($m = 0; $m -lt $Dirs.Count; $m++) {
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
    die = @(
        '................', '................', '...KKKKKKKKKK...', '...KWWWWWWWWK...',
        '...KWHHHHHHDK...', '...KWHWHHWHDK...', '...KWHHHHHHDK...', '...KWHWHHWHDK...',
        '...KWHHHHHHDK...', '...KWHWHHWHDK...', '...KWHHHHHHDK...', '...KDDDDDDDDK...',
        '...KKKKKKKKKK...', '................', '................', '................')
    tile = @(
        '................', '................', '................', '...KKKKKKKKKK...',
        '...KWWWWWWWHK...', '...KWHHHHHHDK...', '...KWHWHHHHDK...', '...KWHHWHHHDK...',
        '...KWHHHWHHDK...', '...KWHHHHWHDK...', '...KWHHHHHHDK...', '...KHDDDDDDDK...',
        '...KKKKKKKKKK...', '................', '................', '................')
    bent = @(
        '................', '................', '................', '..KK........KK..',
        '..KWK......KHK..', '..KWHKK..KKHDK..', '...KWHHKKHHDK...', '...KWWHHHHHDK...',
        '....KWWHHHDK....', '.....KKDDDK.....', '.......KK.......', '................',
        '................', '................', '................', '................')
    frame = @(
        '................', '................', '.....KKKKKK.....', '....KWWWWWHK....',
        '...KWKKKKKKDK...', '...KWK....KDK...', '...KWK.KK.KDK...', '...KWK.KK.KDK...',
        '...KWK....KDK...', '...KHKKKKKKDK...', '....KHDDDDDK....', '.....KKKKKK.....',
        '................', '................', '................', '................')
    disc = @(
        '................', '................', '.....KKKKKK.....', '....KWWWWWHK....',
        '...KWWHHHHHDK...', '...KWHHHHHHDK...', '...KWHHHHHHDK...', '...KWHHHHHHDK...',
        '...KWHHHHHHDK...', '...KHHHHHHDDK...', '....KHDDDDDK....', '.....KKKKKK.....',
        '................', '................', '................', '................')
    stack = @(
        '................', '................', '................', '..KKKKKKKKKKKK..',
        '..KWWWWWWWWWHK..', '..KDDDDDDDDDDK..', '..KWHHHHHHHHDK..', '..KDDDDDDDDDDK..',
        '..KWHHHHHHHHDK..', '..KDDDDDDDDDDK..', '..KWHHHHHHHHDK..', '..KKKKKKKKKKKK..',
        '................', '................', '................', '................')
    card = @(
        '................', '................', '..KKKKKKKKKKK...', '..KWWWWWWWWHK...',
        '..KWHHHHHHHDK...', '..KWHKHHHHHDK...', '..KWHKHHHHHDK...', '..KWHHKHHHHDK...',
        '..KWHHHKKKKDK...', '..KWHHHHHHHDK...', '..KDDDDDDDDDK...', '..KKKKKKKKKKK...',
        '.....K...K......', '................', '................', '................')
    puck = @(
        '................', '................', '................', '....KKKKKKKK....',
        '...KWWWWWWWHK...', '..KWHHHHHHHHDK..', '..KWHHHDDHHHDK..', '..KWHHHDDHHHDK..',
        '..KDHHHHHHHHDK..', '...KDDDDDDDDK...', '...KKKKKKKKKK...', '................',
        '................', '................', '................', '................')
}
$items = @(
    @('bumped_tetron_die', 'die', 'B8A0D0'), @('bonded_tetron_die', 'chip', 'A0B0C8'),
    @('tested_tetron_die', 'chip', '80D0B0'), @('failed_tetron_die', 'die', '8A6A5A'),
    @('bent_ge_tile', 'bent', '8890A8'), @('gaas_laue_tile', 'tile', '6A5A80'),
    @('aligned_laue_frame', 'frame', '9AA0A8'), @('rejected_laue_tile', 'tile', '8A6A5A'),
    @('superpolished_sic_blank', 'disc', '5A6A60'), @('wc_sic_multilayer', 'stack', '7080A0'),
    @('mirror_metrology_record', 'card', '60A0D0'), @('wc_sputter_target', 'puck', '707880'),
    @('rejected_gamma_mirror', 'disc', '8A6A5A')
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
