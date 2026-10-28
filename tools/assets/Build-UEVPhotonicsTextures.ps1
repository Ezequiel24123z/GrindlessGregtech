<#
.SYNOPSIS
  Procedural 16x16 pixel art for the UEV SNSPD foundry, van der Waals stacker and photonic integration hall controller faces, and the
  29 items of the UEV-A6 package, of Gregtech Grindless.

.DESCRIPTION
  Every pixel is drawn by this script (palettes and small routines); nothing is copied or edited from GregTech Modern or any
  other mod. Output is deterministic. Same method and steel bezel as the earlier sets (Build-UEVElectronBeamTextures.ps1).

  Writes (under pack/kubejs/assets/grindless/textures/):
    block/multiblock/snspd_foundry/overlay_front.png, overlay_front_active.png(+.mcmeta), overlay_front_active_emissive.png(+.mcmeta)
    block/multiblock/vdw_stacker/ and block/multiblock/photonic_integration_hall/ the same three files
    item/<name>.png for each item in $items below (six shapes, each tinted by one base colour)

  SNSPD foundry face: a cold window with a nanowire meander; working (4 frames, frametime 4) a photon pulse runs along the wire.
  Stacker face: a window with a stack of thin layers; working, a new layer settles on the stack each frame.
  Hall face: a window with a waveguide bus and a chip; working, a light pulse runs along the waveguide into the chip.
  The *_emissive layer holds only the glow and the lamp.

  Conventions: transparent background, outer 1 px ring of the faces empty, every pixel fully opaque or fully transparent, none pure
  black, emissive layer a subset of the colour layer. The final check fails the run (non-zero exit) if a written file breaks one.

  Run from the repo root:
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-UEVPhotonicsTextures.ps1

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
    if ($Kind -eq 'snspd') {
        # a meander: rows y5, y7, y9 joined at alternating ends; the pulse is one bright pixel on the path
        $path = @()
        for ($x = 4; $x -le 11; $x++) { $path += , @($x, 5) }
        $path += , @(11, 6)
        for ($x = 11; $x -ge 4; $x--) { $path += , @($x, 7) }
        $path += , @(4, 8)
        for ($x = 4; $x -le 11; $x++) { $path += , @($x, 9) }
        foreach ($p in $path) { Set-Px $c $p[0] $p[1] (Hex '4A78B8') }
        if ($Active) {
            $n = $path.Count
            for ($k = 0; $k -lt 3; $k++) {
                $p = $path[($Frame * 6 + $k * 2) % $n]
                Set-Both $c $e $p[0] $p[1] (Hex 'D8F0FF')
            }
        }
    }
    elseif ($Kind -eq 'stack') {
        # five thin layers (y5..9), alternating tones; active: layers light up one more per frame
        for ($i = 0; $i -lt 5; $i++) {
            $col = if ($i % 2 -eq 0) { Hex '8AA0B0' } else { Hex '5A6C7C' }
            for ($x = 5; $x -le 10; $x++) { Set-Px $c $x (9 - $i) $col }
        }
        if ($Active) {
            for ($i = 0; $i -le $Frame; $i++) { for ($x = 5; $x -le 10; $x++) { Set-Both $c $e $x (9 - $i) (Hex '7CE8C8') } }
        }
    }
    else {
        # a waveguide bus along y7 into a chip (x9..11, y5..9)
        for ($x = 4; $x -le 8; $x++) { Set-Px $c $x 7 (Hex '6A80A8') }
        for ($y = 5; $y -le 9; $y++) { for ($x = 9; $x -le 11; $x++) { Set-Px $c $x $y (Hex '3A5A4A') } }
        Set-Px $c 10 7 (Hex '8AC8A0')
        if ($Active) {
            Set-Both $c $e (4 + $Frame) 7 (Hex 'FFF0A0')
            Set-Both $c $e (5 + $Frame) 7 (Hex 'FFD060')
            if ($Frame -ge 3) { Set-Both $c $e 10 7 (Hex 'FFF0A0'); Set-Both $c $e 9 6 (Hex 'FFD060'); Set-Both $c $e 11 8 (Hex 'FFD060') }
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
    @{ Kind = 'snspd'; Dir = 'block/multiblock/snspd_foundry' },
    @{ Kind = 'stack'; Dir = 'block/multiblock/vdw_stacker' },
    @{ Kind = 'hall'; Dir = 'block/multiblock/photonic_integration_hall' })
foreach ($k in $kinds) {
    $idle = New-Face $k.Kind 0 $false
    Out-Tex $idle.C "$($k.Dir)/overlay_front.png"
    $col = @(); $emi = @()
    for ($f = 0; $f -lt $Frames; $f++) { $a = New-Face $k.Kind $f $true; $col += , $a.C; $emi += , $a.E }
    Out-Tex (Join-Frames $col) "$($k.Dir)/overlay_front_active.png" $FrameTime
    Out-Tex (Join-Frames $emi) "$($k.Dir)/overlay_front_active_emissive.png" $FrameTime
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
    @('fz_silicon_boule', 'vial', 'B8C0D0'), @('fz_silicon_wafer', 'wafer', 'A8B4C8'), @('oxidised_wafer', 'wafer', 'C8B0D0'),
    @('sdd_implanted_wafer', 'wafer', 'D09A9A'), @('sdd_annealed_wafer', 'wafer', 'D8B8A0'),
    @('sin_coated_wafer', 'wafer', '8AA0C8'), @('sin_lithographed_wafer', 'wafer', '7A90C0'), @('sin_etched_wafer', 'wafer', '6A88B8'), @('annealed_sin_chip', 'chip', '7AA0D0'),
    @('wsi_wafer', 'wafer', '7A8AA0'), @('wsi_nanowire_wafer', 'wafer', '6A7A98'), @('snspd_die', 'chip', '5A78C0'),
    @('borazine_ampoule', 'vial', 'E0E8F0'), @('hbn_copper_foil', 'foil', 'C89A70'), @('hbn_film', 'foil', 'E8ECF4'), @('annealed_hbn_film', 'foil', 'F4F8FC'),
    @('hbn_emitter_chip', 'chip', 'B8D8F0'),
    @('electropolished_copper_foil', 'foil', 'E0A878'), @('graphene_copper_foil', 'foil', '8A7A70'), @('pmma_graphene_foil', 'foil', 'A09A90'),
    @('pmma_graphene_film', 'foil', 'B0B4B8'), @('graphene_film', 'foil', '484850'), @('encapsulated_graphene', 'foil', '687088'), @('graphene_modulator', 'chip', '5A6A88'),
    @('seven_n_indium', 'ingot', 'B0B8D8'), @('inas_qd_wafer', 'wafer', 'A06A5A'), @('micropillar_wafer', 'wafer', 'C0805A'),
    @('waveguide_circuit', 'chip', '7AC0A8'), @('quantum_photonic_chip', 'chip', 'C8A8F0')
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
