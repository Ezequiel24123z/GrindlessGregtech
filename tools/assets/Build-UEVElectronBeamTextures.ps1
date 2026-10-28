<#
.SYNOPSIS
  Procedural 16x16 pixel art for the UEV electron beam furnace and single-crystal foundry controller faces, and the 33 items of the
  UEV-A4 package, of Gregtech Grindless.

.DESCRIPTION
  Every pixel is drawn by this script (palettes and small routines); nothing is copied or edited from GregTech Modern or any
  other mod. Output is deterministic. Same method and steel bezel as the earlier sets (Build-UHVCrystalsTextures.ps1).

  Writes (under pack/kubejs/assets/grindless/textures/):
    block/multiblock/electron_beam_furnace/overlay_front.png, overlay_front_active.png(+.mcmeta), overlay_front_active_emissive.png(+.mcmeta)
    block/multiblock/single_crystal_foundry/ the same three files
    item/<name>.png for each item in $items below (six shapes, each tinted by one base colour)

  Furnace face: a bezel round a vacuum window: a hearth with a metal button under an electron gun. Working (4 frames, frametime 4),
  a blue beam sweeps across the hearth and the button glows white-hot.
  Foundry face: a bezel round a furnace window with a ceramic mould on a water-cooled chill plate. Working (4 frames, frametime 4),
  the shell is orange and the single crystal grows up the mould a pixel per frame.
  The *_emissive layer holds only the glow and the lamp.

  Conventions: transparent background, outer 1 px ring of the faces empty, every pixel fully opaque or fully transparent, none pure
  black, emissive layer a subset of the colour layer. The final check fails the run (non-zero exit) if a written file breaks one.

  Run from the repo root:
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-UEVElectronBeamTextures.ps1

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
    if ($Kind -eq 'beam') {
        # the gun at the top (x7..8, y4), the hearth along the bottom (y9), the metal button on it (x6..9, y8)
        Set-Px $c 7 4 (Hex '8A90A0'); Set-Px $c 8 4 (Hex '8A90A0')
        for ($x = 4; $x -le 11; $x++) { Set-Px $c $x 9 (Hex 'B87A3A') }
        if ($Active) {
            $sx = @(5, 7, 9, 7)[$Frame % 4]
            for ($y = 5; $y -le 7; $y++) { Set-Both $c $e (7 + [int]($sx -gt 7)) $y (Hex '5AA0FF') }
            Set-Both $c $e $sx 7 (Hex 'C8E0FF')
            foreach ($x in 6, 7, 8, 9) { Set-Both $c $e $x 8 (Hex 'FFF4D0') }
        }
        else {
            foreach ($x in 6, 7, 8, 9) { Set-Px $c $x 8 (Hex '9A9EAA') }
            Set-Px $c 7 5 (Hex '3A4A6A'); Set-Px $c 8 5 (Hex '3A4A6A')
        }
    }
    else {
        # the mould (x7..8, y5..8) on a chill plate (y9); the crystal grows from the bottom
        for ($x = 5; $x -le 10; $x++) { Set-Px $c $x 9 (Hex '5A7AA0') }
        for ($y = 5; $y -le 8; $y++) { Set-Px $c 6 $y (Hex 'C8BCA0'); Set-Px $c 9 $y (Hex 'C8BCA0') }
        if ($Active) {
            for ($y = 5; $y -le 8; $y++) { Set-Both $c $e 7 $y (Hex 'FF8C2A'); Set-Both $c $e 8 $y (Hex 'FF8C2A') }
            for ($y = 8 - $Frame; $y -le 8; $y++) { Set-Both $c $e 7 $y (Hex 'FFF0B0'); Set-Both $c $e 8 $y (Hex 'FFD870') }
        }
        else {
            for ($y = 5; $y -le 8; $y++) { Set-Px $c 7 $y (Hex '6A5A48'); Set-Px $c 8 $y (Hex '6A5A48') }
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

$kinds = @(@{ Kind = 'beam'; Dir = 'block/multiblock/electron_beam_furnace' }, @{ Kind = 'foundry'; Dir = 'block/multiblock/single_crystal_foundry' })
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
    blade = @(
        '................', '.........KK.....', '........KWHK....', '.......KWHDK....',
        '......KWHHDK....', '......KWHHDK....', '.....KWHHDK.....', '.....KWHHDK.....',
        '....KWHHDK......', '....KWHHDK......', '...KKKKKKK......', '...KWHHHDK......',
        '...KKKKKKK......', '................', '................', '................')
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
    @('six_n_hafnium', 'ingot', '8E9AB0'), @('six_n_tantalum', 'ingot', '4E6A9A'), @('six_n_niobium', 'ingot', 'A8B4C8'), @('six_n_rhenium', 'ingot', 'C8C8D4'),
    @('eb_skull', 'disk', 'A07A48'), @('onion_carbon', 'dust', '3A3A44'),
    @('zr_hf_chloride_dust', 'dust', 'C8D4A0'), @('zirconium_chloride_dust', 'dust', 'E0E4C8'), @('hafnium_chloride_dust', 'dust', 'A8C0D8'),
    @('hafnia_dust', 'dust', 'E8E8F0'), @('hafnium_tetrachloride_dust', 'dust', 'B8D0E8'), @('hafnium_sponge', 'disk', '9AA4B8'),
    @('tantalite_fluoride_cake', 'disk', 'B08A5A'), @('k2taf7_dust', 'dust', 'F0F0E8'), @('niobium_oxyfluoride_dust', 'dust', 'D8E0F0'),
    @('tantalum_powder', 'dust', '5A6E94'), @('niobium_powder', 'dust', '8E9AB4'),
    @('alkali_fluoride_dust', 'dust', 'E8F0F4'), @('alkali_sulfate_dust', 'dust', 'F0E8D0'),
    @('yttrium_oxide_dust', 'dust', 'F4F0DC'), @('terbium_oxide_dust', 'dust', 'C8A878'), @('ysz_powder', 'dust', 'F8F4E8'), @('ysz_ingot', 'ingot', 'F0ECDC'),
    @('sx_master_alloy_dust', 'dust', '7A8494'), @('ceramic_shell_mould', 'mould', 'D8C8A8'), @('sx_gate', 'ingot', '6A7484'), @('sx_dross', 'dust', '5A4E48'),
    @('heat_treated_sx_blade', 'blade', '8A94A4'), @('bond_coated_sx_blade', 'blade', 'B8B0A0'), @('coated_sx_blade', 'blade', 'F0E4C0'),
    @('sx_pump_impeller', 'disk', '7A8898'), @('brayton_turbine_wheel', 'disk', 'D8CCA8'), @('nb3sn_srf_cavity', 'tube', 'C0C8D8')
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
