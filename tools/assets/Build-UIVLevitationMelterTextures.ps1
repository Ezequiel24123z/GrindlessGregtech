<#
.SYNOPSIS
  Procedural 16x16 pixel art for the UIV levitation melter controller face and the 14 items of the UIV-A3 package, of Gregtech Grindless.

.DESCRIPTION
  Every pixel is drawn by this script (palettes and small routines); nothing is copied or edited from GregTech Modern or any
  other mod. Output is deterministic. Same method and steel bezel as Build-UIVMetallicHydrogenTextures.ps1.

  Writes (under pack/kubejs/assets/grindless/textures/):
    block/multiblock/levitation_melter/overlay_front.png, overlay_front_active.png(+.mcmeta), overlay_front_active_emissive.png(+.mcmeta)
    item/<name>.png for each item in $items below (six shapes, each tinted by one base colour)

  Face: a bezel round a window with a cold-crucible coil on each side and a bead of melt floating between them. Working (4 frames,
  frametime 4), the bead bobs and glows from orange to white. The *_emissive layer holds only the glow and the lamp.

  Conventions: transparent background, outer 1 px ring of the face empty, every pixel fully opaque or fully transparent, none pure
  black, emissive layer a subset of the colour layer. The final check fails the run (non-zero exit) if a written file breaks one.

  Run from the repo root:
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-UIVLevitationMelterTextures.ps1

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
    param([int]$Frame, [bool]$Active)
    $c = New-Bezel
    $e = New-Canvas
    for ($y = 4; $y -le 9; $y++) { for ($x = 4; $x -le 11; $x++) { Set-Px $c $x $y $Pit } }
    # the crucible coil: copper turns on the left and right walls of the window
    $copper = Hex 'D09050'; $shade = Hex '905A28'
    foreach ($y in 4, 6, 8) { foreach ($x in 4, 11) { Set-Px $c $x $y $copper; Set-Px $c $x ($y + 1) $shade } }
    # the bead hangs in the middle; when working it bobs one pixel and heats
    $bob = if ($Active) { @(0, -1, 0, 1)[$Frame % 4] } else { 0 }
    $y0 = 6 + $bob
    if ($Active) {
        $glow = @((Hex 'FF8030'), (Hex 'FFB060'), (Hex 'FFE0A0'), (Hex 'FFFFFF'))[$Frame % 4]
        foreach ($x in 7, 8) { Set-Both $c $e $x $y0 $glow; Set-Both $c $e $x ($y0 + 1) $glow }
    }
    else {
        foreach ($x in 7, 8) { Set-Px $c $x $y0 (Hex '8A7A68'); Set-Px $c $x ($y0 + 1) (Hex '8A7A68') }
    }
    Set-Px $c 7 12 $(if ($Active) { $LampOn } else { $LampOff })
    Set-Px $c 8 12 $(if ($Active) { $LampOn } else { $LampOff })
    if ($Active) { Set-Px $e 7 12 $LampOn; Set-Px $e 8 12 $LampOn }
    for ($i = 0; $i -lt 16; $i++) { foreach ($p in @(@($i, 0), @($i, 15), @(0, $i), @(15, $i))) { Set-Px $c $p[0] $p[1] 0; Set-Px $e $p[0] $p[1] 0 } }
    return @{ C = $c; E = $e }
}

$Dir = 'block/multiblock/levitation_melter'
$idle = New-Face 0 $false
Out-Tex $idle.C "$Dir/overlay_front.png"
$col = @(); $emi = @()
for ($f = 0; $f -lt $Frames; $f++) { $a = New-Face $f $true; $col += , $a.C; $emi += , $a.E }
Out-Tex (Join-Frames $col) "$Dir/overlay_front_active.png" $FrameTime
Out-Tex (Join-Frames $emi) "$Dir/overlay_front_active_emissive.png" $FrameTime

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
    block = @(
        '................', '................', '................', '..KKKKKKKKKKKK..',
        '.KWWWWWWWWWWHDK.', '.KWHHHHHHHHHHDK.', '.KWHHHHHHHHHHDK.', '.KWHHHHHHHHHHDK.',
        '.KWHHHHHHHHHHDK.', '.KWHHHHHHHHHHDK.', '.KWHHHHHHHHHDDK.', '.KDDDDDDDDDDDDK.',
        '..KKKKKKKKKKKK..', '................', '................', '................')
}
$items = @(
    @('melter_dross', 'dust', '6E5E50'), @('nb_ta_button', 'disk', '9AA8B8'), @('densified_w_preform', 'block', '7A7A86'),
    @('zr_master_alloy', 'ingot', 'B0B8C0'), @('beryllium_oxide_dust', 'dust', 'E8E0D0'), @('rhea_slab', 'ingot', 'C0C0CC'),
    @('rhea_former', 'mould', 'A8A8B8'), @('wound_rhea_former', 'mould', 'B87848'), @('impregnated_mh_coil', 'disk', 'D8C078'),
    @('rhea_cased_charge', 'tube', 'A0B0E8'), @('halbach_array', 'block', '606878'), @('rhea_cased_halbach', 'block', '8890A8'),
    @('potted_mh_stator', 'disk', '80A0C8'), @('maglev_stator', 'disk', '70D0E8')
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
