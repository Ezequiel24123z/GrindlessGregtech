<#
.SYNOPSIS
  Procedural 16x16 pixel art for the UEV calutron controller face and the four isotope items of Gregtech Grindless.

.DESCRIPTION
  Every pixel is drawn by this script (palettes and small routines); nothing is copied or edited from GregTech Modern or any
  other mod. Output is deterministic. Same method and steel bezel as Build-UHVTranscuriumTextures.ps1.

  Writes (under pack/kubejs/assets/grindless/textures/):
    block/multiblock/calutron/overlay_front.png, overlay_front_active.png(+.mcmeta), overlay_front_active_emissive.png(+.mcmeta)
    item/ca48_oven_charge.png, plutonium_oxide_target.png, irradiated_plutonium_target.png, plutonium_244_target.png

  Calutron face: a steel bezel round a window onto the racetrack, a half ring of the magnet; idle, the ion beam is dark. Working
  (4 frames, frametime 4), a violet ion bunch runs round the arc and the collector pocket glows; the run lamp is green.
  The *_emissive layer holds only the glow and the lamp.
  Items: a platinum-foil disc with a pale calcium pellet; a zircaloy rod holding grey-pink oxide pellets; the same rod glowing
  after irradiation; an aluminium foil with a red-pink plutonium deposit.

  Conventions: transparent background, outer 1 px ring empty, every pixel fully opaque or fully transparent, none pure black,
  emissive layer a subset of the colour layer. The final check fails the run (non-zero exit) if a written file breaks one.

  Run from the repo root:
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-UEVIsotopesTextures.ps1

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
$EraName = 'uev'; . (Join-Path $PSScriptRoot 'Era.Lib.ps1')

$RepoRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..'))
if (-not $OutRoot) { $OutRoot = Join-Path $RepoRoot 'pack\kubejs\assets\grindless\textures' }
$OutRoot = [System.IO.Path]::GetFullPath($OutRoot)
$ScriptName = Split-Path -Leaf $PSCommandPath
$FrameTime = 4
$Frames = 4
$Dir = 'block/multiblock/calutron'
$Items = @('ca48_oven_charge', 'plutonium_oxide_target', 'irradiated_plutonium_target', 'plutonium_244_target', 'ca48_crucible_load', 'pu244_plating_ampoule')

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

# Own controller face (RF-6C): a 12x12 map inside a thin steel frame (x1..14, y1..14), the rest transparent.
# Map letters: L M D E steel, P pit, l run lamp, 0-9 glow cells of ramp 1, a-j glow cells of ramp 2 (the digit or letter is
# the cell's phase), any other letter is in the spec's Pal. A ramp is the idle colour, then four glow colours.
# Mode chase: the glow travels with the phase; twinkle: each phase flickers by itself; fill: cells light in phase order.
$OwnSteel = @{ L = (Hex 'B0B0B0'); M = (Hex '707070'); D = (Hex '404040'); E = (Hex '222222'); P = (Hex '161616') }
function New-OwnFace {
    param($Spec, [int]$Frame, [bool]$Active)
    if ($Spec.Map.Count -ne 12) { throw 'Own face map needs 12 rows' }
    $rows = @(('.' * 16), ('.' + ('L' * 13) + 'M.'))
    foreach ($m in $Spec.Map) { if ($m.Length -ne 12) { throw "Own face row '$m' is not 12 wide" }; $rows += ".L${m}E." }
    $rows += ('.M' + ('E' * 13) + '.'); $rows += ('.' * 16)
    $c = New-Canvas; $e = New-Canvas
    for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
        $ch = [string]$rows[$y][$x]
        if ($ch -eq '.') { continue }
        if ($ch -ceq 'l') {
            $v = $(if ($Active) { $LampOn } else { $LampOff }); Set-Px $c $x $y $v
            if ($Active) { Set-Px $e $x $y $v }
            continue
        }
        $ramp = $null; $d = 0
        if ($ch -cmatch '[0-9]') { $ramp = $Spec.Ramp; $d = [int]$ch }
        elseif ($ch -cmatch '[a-j]') { $ramp = $Spec.Ramp2; $d = [int][char]$ch - 97 }
        if ($ramp) {
            $k = -1
            if ($Active) {
                switch ($Spec.Mode) {
                    'chase' { $k = ($d + $Frame) % 4 }
                    'twinkle' { $k = (($d * 3 + $Frame * 2) % 5) - 1 }
                    'fill' { $t = 1 + 2 * $Frame; if ($d -le $t) { $k = [Math]::Max(0, 3 - ($t - $d)) } }
                }
            }
            if ($k -lt 0) { Set-Px $c $x $y $ramp[0] } else { Set-Both $c $e $x $y $ramp[$k + 1] }
            continue
        }
        if ($OwnSteel.ContainsKey($ch)) { Set-Px $c $x $y $OwnSteel[$ch] }
        elseif ($Spec.Pal -and $Spec.Pal.ContainsKey($ch)) { Set-Px $c $x $y $Spec.Pal[$ch] }
        else { throw "Own face: no colour for '$ch'" }
    } }
    return @{ C = $c; E = $e }
}

# the calutron: copper magnet coils over the D-shaped chamber; two isotope beams (amber outer, cyan inner) arc from the source to the collector
$CalutronFace = @{ Mode = 'chase'; Pal = @{ k = (Hex 'B06A38'); q = (Hex '8A4E28') }
    Ramp = @((Hex '4A2A0A'), (Hex 'C96A0A'), (Hex 'FF9E1F'), (Hex 'FFD15A'), (Hex 'FFF0B0'))
    Ramp2 = @((Hex '1A3A44'), (Hex '2E9CB8'), (Hex '4FC8E0'), (Hex '86E8F4'), (Hex 'C8FAFF'))
    Map = @('kqkqkqkqkqkq', 'qkqkqkqkqkqk', '...012301...', '..3.abcd.2..', '..2.d..a.1..', '..1.c..b.0..', '..0.b..c.3..', '..3.a..d.2..', '..2......1..', '.MMM....MMM.', '.DDD....DDD.', '.....ll.....') }

function New-Face {
    param([int]$Frame, [bool]$Active)
    return New-OwnFace $CalutronFace $Frame $Active
}

function New-Item16 {
    param([string]$Name)
    $c = New-Canvas
    switch ($Name) {
        'ca48_oven_charge' {
            $pt = @((Hex 'E4E8EC'), (Hex 'B4BCC4'), (Hex '7C848C'))
            for ($y = 3; $y -le 12; $y++) { for ($x = 3; $x -le 12; $x++) {
                $d = [Math]::Max([Math]::Abs(2 * $x - 15), [Math]::Abs(2 * $y - 15))
                if ($d -le 9) { Set-Px $c $x $y $(if ($x + $y -lt 13) { $pt[0] } elseif ($x + $y -lt 17) { $pt[1] } else { $pt[2] }) }
            } }
            Set-Rect $c 6 6 4 4 (Hex 'D8D0B0'); Set-Rect $c 7 7 2 2 (Hex 'F0E8CC')
        }
        'ca48_crucible_load' {
            Set-Rect $c 4 4 8 9 (Hex '8C7A58'); Set-Rect $c 4 4 8 1 (Hex 'B8A47C'); Set-Rect $c 4 12 8 1 (Hex '5E5238')
            Set-Rect $c 5 6 6 5 (Hex 'D8DCE0'); Set-Rect $c 6 7 2 2 (Hex 'F4F6F8')
        }
        'pu244_plating_ampoule' {
            Set-Rect $c 6 2 4 12 (Hex 'B8E0E8'); Set-Rect $c 7 2 1 12 (Hex 'E8F8FC'); Set-Rect $c 6 1 4 1 (Hex '88A8B0'); Set-Rect $c 6 14 4 1 (Hex '88A8B0')
            Set-Rect $c 7 7 2 6 (Hex 'C8A8B8'); Set-Px $c 8 8 (Hex 'F0D0DC')
        }
        'plutonium_oxide_target' {
            Set-Rect $c 7 2 2 12 (Hex '9AA0A4'); Set-Rect $c 7 2 1 12 (Hex 'C4C8CC'); Set-Rect $c 6 2 4 1 (Hex '70767C'); Set-Rect $c 6 13 4 1 (Hex '70767C')
            for ($y = 4; $y -le 11; $y += 2) { Set-Rect $c 7 $y 2 1 (Hex 'A08894') }
        }
        'irradiated_plutonium_target' {
            Set-Rect $c 7 2 2 12 (Hex '8A8E90'); Set-Rect $c 6 2 4 1 (Hex '5C6064'); Set-Rect $c 6 13 4 1 (Hex '5C6064')
            for ($y = 4; $y -le 11; $y += 2) { Set-Rect $c 7 $y 2 1 (Hex '78E8F8') }
            Set-Px $c 6 7 (Hex '3C9CC0'); Set-Px $c 9 8 (Hex '3C9CC0')
        }
        default {
            Set-Rect $c 3 3 10 10 (Hex 'C4C8CE'); Set-Rect $c 3 3 10 1 (Hex 'E4E8EE'); Set-Rect $c 3 12 10 1 (Hex '8C9096')
            Set-Rect $c 5 5 6 6 (Hex 'C04860'); Set-Rect $c 6 6 4 4 (Hex 'E0708A'); Set-Px $c 7 7 (Hex 'F4A0B4')
        }
    }
    return $c
}

$idle = New-Face 0 $false
Out-Tex $idle.C "$Dir/overlay_front.png"
$col = @(); $emi = @()
for ($f = 0; $f -lt $Frames; $f++) { $a = New-Face $f $true; $col += , $a.C; $emi += , $a.E }
Out-Tex (Join-Frames $col) "$Dir/overlay_front_active.png" $FrameTime
Out-Tex (Join-Frames $emi) "$Dir/overlay_front_active_emissive.png" $FrameTime
foreach ($i in $Items) { Out-Tex (New-Item16 $i) "item/$i.png" }

# self-check: ring empty, alpha 0 or 255, nothing pure black, emissive a subset of the colour layer, no two frames alike
$problems = New-Object System.Collections.Generic.List[string]
$names = @("$Dir/overlay_front", "$Dir/overlay_front_active", "$Dir/overlay_front_active_emissive") + ($Items | ForEach-Object { "item/$_" })
$png = @{}
foreach ($n in $names) {
    $c = Read-Png (Join-Path $OutRoot ("$n.png" -replace '/', '\'))
    $png[$n] = $c
    $solid = 0
    for ($y = 0; $y -lt $c.H; $y++) {
        for ($x = 0; $x -lt $c.W; $x++) {
            $v = $c.P[$y * $c.W + $x]; $a = ($v -shr 24) -band 255
            $ring = ((($x % 16) -eq 0) -or (($x % 16) -eq 15) -or (($y % 16) -eq 0) -or (($y % 16) -eq 15))
            if ($a -ne 0 -and $a -ne 255) { $problems.Add("${n}: partial alpha at $x,$y") }
            if ($a -eq 255 -and ($v -band 0xFFFFFF) -eq 0) { $problems.Add("${n}: pure black at $x,$y") }
            if ($ring -and $a -ne 0) { $problems.Add("${n}: ring pixel at $x,$y") }
            if ($a -eq 255) { $solid++ }
        }
    }
    if ($solid -eq 0) { $problems.Add("${n}: empty") }
}
$cl = $png["$Dir/overlay_front_active"]; $em = $png["$Dir/overlay_front_active_emissive"]
for ($i = 0; $i -lt $cl.P.Length; $i++) { if ($em.P[$i] -ne 0 -and $em.P[$i] -ne $cl.P[$i]) { $problems.Add("emissive differs from colour at $i") } }
for ($f = 0; $f -lt $Frames - 1; $f++) {
    $same = $true
    for ($i = 0; $i -lt 256; $i++) { if ($cl.P[$f * 256 + $i] -ne $cl.P[($f + 1) * 256 + $i]) { $same = $false; break } }
    if ($same) { $problems.Add("frame $f repeats frame $($f + 1)") }
}
if ($problems.Count -gt 0) { $problems | Select-Object -First 20 | ForEach-Object { Write-Error $_ -ErrorAction Continue }; exit 1 }

Write-Host "$ScriptName wrote $($written.Count) files"
if ($Credits) {
    foreach ($w in $written) { Write-Host "| pack/kubejs/assets/grindless/textures/$w | drawn procedurally by tools/assets/$ScriptName | ours |" }
}
