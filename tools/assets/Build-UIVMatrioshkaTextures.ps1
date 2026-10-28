<#
.SYNOPSIS
  Procedural 16x16 pixel art for the UIV Matrioshka computer and droplet radiator works controller faces, the five structure blocks and the items of the UIV-A10 package, of Gregtech Grindless.

.DESCRIPTION
  Every pixel is drawn by this script (palettes and small routines); nothing is copied or edited from GregTech Modern or any
  other mod. Output is deterministic. Same method and steel bezel as Build-UIVMemoriesCryostatTextures.ps1.

  Writes (under pack/kubejs/assets/grindless/textures/):
    block/multiblock/<machine>/overlay_front.png, overlay_front_active.png(+.mcmeta), overlay_front_active_emissive.png(+.mcmeta)
    block/uiv/<name>.png for each structure block
    item/<name>.png for each item in $items below (shapes tinted by one base colour)

  Matrioshka face: nested squares in the window; working (4 frames, frametime 4) the rings light up one after another from the core.
  Droplet works face: a column of tin droplets that falls frame by frame.

  Conventions: transparent background on faces and items, outer 1 px ring of the face empty, every pixel fully opaque or fully
  transparent, none pure black, emissive layer a subset of the colour layer. The final check fails the run (non-zero exit) if a written file breaks one.

  Run from the repo root:
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-UIVMatrioshkaTextures.ps1

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
    if ($Kind -eq 'shell') {
        # three nested rings around a core; the lit ring steps outward
        $ring = Hex '5C4A2C'
        foreach ($x in 4..11) { Set-Px $c $x 4 $ring; Set-Px $c $x 9 $ring }
        foreach ($y in 4..9) { Set-Px $c 4 $y $ring; Set-Px $c 11 $y $ring }
        foreach ($x in 6..9) { Set-Px $c $x 6 $ring; Set-Px $c $x 7 $ring }
        if ($Active) {
            $glow = @((Hex 'FFF0A0'), (Hex 'FFC040'), (Hex 'FF8020'), (Hex 'C0FFFF'))[$Frame % 4]
            if ($Frame -eq 0) { foreach ($x in 7, 8) { Set-Both $c $e $x 6 $glow; Set-Both $c $e $x 7 $glow } }
            elseif ($Frame -eq 1) { foreach ($x in 6..9) { Set-Both $c $e $x 6 $glow; Set-Both $c $e $x 7 $glow } }
            elseif ($Frame -eq 2) { foreach ($x in 4..11) { Set-Both $c $e $x 4 $glow; Set-Both $c $e $x 9 $glow } }
            else { foreach ($y in 4..9) { Set-Both $c $e 4 $y $glow; Set-Both $c $e 11 $y $glow } }
        }
    }
    if ($Kind -eq 'drops') {
        # a column of tin droplets that falls one step a frame
        $tin = Hex 'B8C0C8'
        foreach ($y in 4, 6, 8) { Set-Px $c 7 $y $tin; Set-Px $c 8 $y $tin }
        if ($Active) {
            $hot = @((Hex 'FFFFFF'), (Hex 'E0E8F0'), (Hex 'FFE0A0'), (Hex 'FFB060'))[$Frame % 4]
            $dy = 4 + ($Frame % 4) + 1
            Set-Both $c $e 7 $dy $hot; Set-Both $c $e 8 $dy $hot
            Set-Both $c $e 5 $dy $hot; Set-Both $c $e 10 $dy $hot
        }
    }
    Set-Px $c 7 12 $(if ($Active) { $LampOn } else { $LampOff })
    Set-Px $c 8 12 $(if ($Active) { $LampOn } else { $LampOff })
    if ($Active) { Set-Px $e 7 12 $LampOn; Set-Px $e 8 12 $LampOn }
    for ($i = 0; $i -lt 16; $i++) { foreach ($p in @(@($i, 0), @($i, 15), @(0, $i), @(15, $i))) { Set-Px $c $p[0] $p[1] 0; Set-Px $e $p[0] $p[1] 0 } }
    return @{ C = $c; E = $e }
}

$Dirs = @('block/multiblock/matrioshka_computer', 'block/multiblock/droplet_radiator_works')
$Kinds = @('shell', 'drops')
for ($m = 0; $m -lt $Dirs.Count; $m++) {
    $idle = New-Face $Kinds[$m] 0 $false
    Out-Tex $idle.C "$($Dirs[$m])/overlay_front.png"
    $col = @(); $emi = @()
    for ($f = 0; $f -lt $Frames; $f++) { $a = New-Face $Kinds[$m] $f $true; $col += , $a.C; $emi += , $a.E }
    Out-Tex (Join-Frames $col) "$($Dirs[$m])/overlay_front_active.png" $FrameTime
    Out-Tex (Join-Frames $emi) "$($Dirs[$m])/overlay_front_active_emissive.png" $FrameTime
}

# ---------------------------------------------------------------- structure blocks (opaque 16x16 tiles)
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

# name, base colour, accent colour, pattern
$blocks = @(
    @('matrioshka_logic_tile', '3C4C78', '60A0FF', 'grid'),
    @('matrioshka_node', '505860', 'D8E8F0', 'dots'),
    @('matrioshka_emitter_shell', '70503C', 'FFA040', 'bars'),
    @('matrioshka_tpv_shell', '2C3C58', '40E0C0', 'cells'),
    @('droplet_radiator_module', '88909C', 'FFE0A0', 'drops')
)
foreach ($b in $blocks) {
    $base = Hex $b[1]; $edge = Hex (Shade $b[1] 0.6); $hi = Hex (Shade $b[1] 1.35); $acc = Hex $b[2]
    $c = New-Canvas
    Set-Rect $c 0 0 16 16 $base
    for ($i = 0; $i -lt 16; $i++) { Set-Px $c $i 0 $hi; Set-Px $c 0 $i $hi; Set-Px $c $i 15 $edge; Set-Px $c 15 $i $edge }
    switch ($b[3]) {
        'grid' { foreach ($i in 4, 8, 12) { for ($k = 2; $k -le 13; $k++) { Set-Px $c $i $k $edge; Set-Px $c $k $i $edge } }; foreach ($x in 4, 12) { foreach ($y in 4, 12) { Set-Px $c $x $y $acc } } }
        'dots' { foreach ($x in 3, 7, 11) { foreach ($y in 3, 7, 11) { Set-Px $c $x $y $acc; Set-Px $c ($x + 1) $y $acc } } }
        'bars' { foreach ($y in 3, 6, 9, 12) { for ($x = 2; $x -le 13; $x++) { Set-Px $c $x $y $acc } } }
        'cells' { foreach ($x in 2, 8) { foreach ($y in 2, 8) { Set-Rect $c $x $y 5 5 $acc; Set-Rect $c ($x + 1) ($y + 1) 3 3 $edge } } }
        'drops' { foreach ($x in 3, 7, 11) { foreach ($y in 2, 6, 10) { Set-Px $c $x $y $acc; Set-Px $c $x ($y + 1) $acc } } }
    }
    Out-Tex $c "block/uiv/$($b[0]).png"
}

# ---------------------------------------------------------------- items
$shapes = @{
    ingot = @(
        '................', '................', '................', '................',
        '................', '...KKKKKKKKKK...', '..KWWWWWWWWHDK..', '.KWHHHHHHHHHDDK.',
        '.KWHHHHHHHHHDDK.', '.KKKKKKKKKKKKKK.', '................', '................',
        '................', '................', '................', '................')
    wafer = @(
        '................', '................', '.....KKKKKK.....', '...KKWWHHHHKK...',
        '..KWWHHHHHHHDK..', '..KWHHHHHHHHDK..', '.KWHHHHHHHHHDDK.', '.KWHHHHHHHHHDDK.',
        '..KWHHHHHHHDDK..', '..KWHHHHHHHDDK..', '...KKDDDDDDKK...', '.....KKKKKK.....',
        '................', '................', '................', '................')
    chip = @(
        '................', '................', '..K.K.K.K.K.K...', '.KKKKKKKKKKKKK..',
        '.KWWWWWWWWWHDK..', '.KWHHHHHHHHHDK..', '.KWHHKKKKHHHDK..', '.KWHHKWWKHHHDK..',
        '.KWHHKKKKHHHDK..', '.KWHHHHHHHHHDK..', '.KDDDDDDDDDDDK..', '.KKKKKKKKKKKKK..',
        '..K.K.K.K.K.K...', '................', '................', '................')
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
    @('eb_distilled_tin', 'ingot', 'C8D0D8'), @('glassy_carbon_lattice', 'disk', '404850'), @('sic_coated_lattice', 'disk', '687078'),
    @('droplet_wick', 'tube', 'A8A090'), @('droplet_collector', 'tube', '98A8B8'),
    @('ingaasb_epi_wafer', 'wafer', '9068A8'), @('air_bridge_wafer', 'wafer', 'D0A840'), @('ingaasb_tpv_cell', 'chip', 'B05878'),
    @('tpv_tile', 'ingot', 'C06888'), @('tpv_segment', 'ingot', 'D88098'), @('tipt_au_stack', 'ingot', 'E0C060'),
    @('nb_target', 'disk', '7890A8'), @('w_target', 'disk', '606870'), @('nb_trilayer', 'wafer', '6888B8'), @('nb_jj_wafer', 'wafer', '5878C8'),
    @('aqfp_die', 'chip', '4868C8'), @('aqfp_module', 'chip', '6080E0'),
    @('c12_cvd_plate', 'wafer', 'D0E8F0'), @('c12_polished_plate', 'wafer', 'E8F8FF'), @('c12_metallised_plate', 'wafer', 'A0C0D8'),
    @('c12_boron_diamond', 'wafer', '90B0E8'), @('diamond_contact_wafer', 'wafer', 'C8D8A0'), @('diamond_schottky_die', 'chip', 'B0D0E0'),
    @('sputtered_w_wafer', 'wafer', '808890'), @('w_photonic_crystal', 'wafer', 'A0A8B0'), @('hfo2_passivated_crystal', 'wafer', 'C0C8D0'),
    @('selective_emitter', 'chip', 'E08850'), @('rad_hard_controller', 'chip', '708898')
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
foreach ($b in $blocks) {
    $p = Read-Png (Join-Path $OutRoot ("block\uiv\$($b[0]).png"))
    Test-Pixels $p "block/uiv/$($b[0])" $false
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
