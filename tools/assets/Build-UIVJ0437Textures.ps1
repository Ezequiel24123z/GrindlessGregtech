<#
.SYNOPSIS
  Procedural 16x16 pixel art for the UIV PSR J0437-4715 machines' controller faces and the items of the UIV-B3 package, of Gregtech Grindless.

.DESCRIPTION
  Every pixel is drawn by this script (palettes and small routines); nothing is copied or edited from GregTech Modern or any
  other mod. Output is deterministic. Same method and steel bezel as Build-UIVMatrioshkaTextures.ps1.

  Writes (under pack/kubejs/assets/grindless/textures/):
    block/multiblock/<machine>/overlay_front.png, overlay_front_active.png(+.mcmeta), overlay_front_active_emissive.png(+.mcmeta)
    item/<name>.png for each item in $items below (shapes tinted by one base colour)

  Wind trap face: two counter-rotating arcs (electrons and positrons) that spiral to a trap; working, a lit bead moves along them.
  Lab face: nested rings of a condensate that fill from the rim. Profiler face: a folded pulse profile whose peak steps across the window.

  Conventions: transparent background on faces and items, outer 1 px ring of the face empty, every pixel fully opaque or fully
  transparent, none pure black, emissive layer a subset of the colour layer. The final check fails the run (non-zero exit) if a written file breaks one.

  Run from the repo root:
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-UIVJ0437Textures.ps1

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
    if ($Kind -eq 'wind') {
        # two arcs that cross in the middle: electrons (blue) and positrons (pink)
        $ele = Hex '3060B0'; $pos = Hex 'B04880'
        $ea = @(@(4, 4), @(5, 5), @(6, 6), @(7, 7), @(8, 7), @(9, 8), @(10, 9), @(11, 9))
        $pa = @(@(4, 9), @(5, 8), @(6, 7), @(7, 6), @(8, 6), @(9, 5), @(10, 4), @(11, 4))
        foreach ($p in $ea) { Set-Px $c $p[0] $p[1] $ele }
        foreach ($p in $pa) { Set-Px $c $p[0] $p[1] $pos }
        if ($Active) {
            $i = $Frame * 2
            Set-Both $c $e $ea[$i][0] $ea[$i][1] (Hex '90C0FF')
            Set-Both $c $e $pa[$i + 1][0] $pa[$i + 1][1] (Hex 'FFA0D8')
        }
    }
    if ($Kind -eq 'lab') {
        # nested rings of a condensate; working, the glow steps in from the rim
        $ring = Hex '4C6C7C'
        foreach ($x in 4..11) { Set-Px $c $x 4 $ring; Set-Px $c $x 9 $ring }
        foreach ($y in 4..9) { Set-Px $c 4 $y $ring; Set-Px $c 11 $y $ring }
        foreach ($x in 6..9) { Set-Px $c $x 6 $ring; Set-Px $c $x 7 $ring }
        if ($Active) {
            $glow = @((Hex 'C0FFFF'), (Hex '80E0FF'), (Hex '40B0F0'), (Hex 'FFFFFF'))[$Frame % 4]
            if ($Frame -eq 0) { foreach ($x in 4..11) { Set-Both $c $e $x 4 $glow; Set-Both $c $e $x 9 $glow } }
            elseif ($Frame -eq 1) { foreach ($y in 4..9) { Set-Both $c $e 4 $y $glow; Set-Both $c $e 11 $y $glow } }
            elseif ($Frame -eq 2) { foreach ($x in 6..9) { Set-Both $c $e $x 6 $glow; Set-Both $c $e $x 7 $glow } }
            else { foreach ($x in 7, 8) { Set-Both $c $e $x 6 $glow; Set-Both $c $e $x 7 $glow } }
        }
    }
    if ($Kind -eq 'pulse') {
        # a folded pulse profile: a baseline with one peak that steps across the window
        $base = Hex '60683C'
        foreach ($x in 4..11) { Set-Px $c $x 9 $base }
        foreach ($p in @(@(5, 8), @(6, 7), @(7, 6), @(8, 5), @(9, 6), @(10, 7))) { Set-Px $c $p[0] $p[1] $base }
        if ($Active) {
            $hot = @((Hex 'FFFFFF'), (Hex 'F0F0A0'), (Hex 'FFD060'), (Hex 'FFA040'))[$Frame % 4]
            $cols = @(5, 6, 7, 8)
            $x = $cols[$Frame % 4]
            $ys = @(8, 7, 6, 5)
            Set-Both $c $e $x $ys[$Frame % 4] $hot
            Set-Both $c $e $x 9 $hot
        }
    }
    Set-Px $c 7 12 $(if ($Active) { $LampOn } else { $LampOff })
    Set-Px $c 8 12 $(if ($Active) { $LampOn } else { $LampOff })
    if ($Active) { Set-Px $e 7 12 $LampOn; Set-Px $e 8 12 $LampOn }
    for ($i = 0; $i -lt 16; $i++) { foreach ($p in @(@($i, 0), @($i, 15), @(0, $i), @(15, $i))) { Set-Px $c $p[0] $p[1] 0; Set-Px $e $p[0] $p[1] 0 } }
    return @{ C = $c; E = $e }
}

$Dirs = @('block/multiblock/pulsar_wind_trap', 'block/multiblock/positronium_condensate_lab', 'block/multiblock/xray_pulse_profiler')
$Kinds = @('wind', 'lab', 'pulse')
for ($m = 0; $m -lt $Dirs.Count; $m++) {
    $idle = New-Face $Kinds[$m] 0 $false
    Out-Tex $idle.C "$($Dirs[$m])/overlay_front.png"
    $col = @(); $emi = @()
    for ($f = 0; $f -lt $Frames; $f++) { $a = New-Face $Kinds[$m] $f $true; $col += , $a.C; $emi += , $a.E }
    Out-Tex (Join-Frames $col) "$($Dirs[$m])/overlay_front_active.png" $FrameTime
    Out-Tex (Join-Frames $emi) "$($Dirs[$m])/overlay_front_active_emissive.png" $FrameTime
}

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
    @('cooled_positron_bunch', 'tube', 'E070C0'), @('ps_converter_aerogel', 'disk', 'B8D8E8'), @('ps_in_aerogel', 'disk', 'D890D8'),
    @('laser_cooled_ps', 'disk', '70A0F0'), @('ps_bec', 'disk', 'F0F0FF'), @('gamma_laser_cavity', 'tube', 'A0F0A0'),
    @('c12_hpht_plate', 'wafer', 'C8E0F0'), @('c12_004_plate', 'wafer', 'D8ECF8'), @('c12_ion_milled_plate', 'wafer', 'E8F8FF'),
    @('gamma_bragg_mirror', 'ingot', 'B0C8D0'), @('solid_neon_cone', 'tube', 'FF9868'), @('annealed_neon_cone', 'tube', 'FFB088'),
    @('neon_moderator_cartridge', 'tube', 'D8A890')
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
