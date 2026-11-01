<#
.SYNOPSIS
  Procedural 16x16 pixel art for the three UEV superheavy controllers and the twelve superheavy items of Gregtech Grindless.

.DESCRIPTION
  Every pixel is drawn by this script (palettes and small routines); nothing is copied or edited from GregTech Modern or any
  other mod. Output is deterministic. Same method and steel bezel as Build-UEVIsotopesTextures.ps1.

  Writes (under pack/kubejs/assets/grindless/textures/):
    block/multiblock/<machine>/overlay_front.png, overlay_front_active.png(+.mcmeta), overlay_front_active_emissive.png(+.mcmeta)
      for heavy_ion_cyclotron, recoil_separator, superheavy_chemistry_lab
    item/<name>.png for target_wheel_blank, activated_target_wheel, sealed_capsule, the five *_atoms, polycarbonate_foil,
      ion_tracked_foil, etched_membrane, berkelium_oxide_dust

  Faces: a steel bezel round a window. Cyclotron: a ring of the dees with an ion bunch circling it. Separator: a straight tube with a
  beam running through the dipole gaps. Lab: a gold-foil strip with a row of detector cells lighting up. Idle, the window is dark;
  working (4 frames, frametime 4) it glows and the run lamp is green. The *_emissive layer holds only the glow and the lamp.

  Conventions: transparent background, outer 1 px ring empty, every pixel fully opaque or fully transparent, none pure black,
  emissive layer a subset of the colour layer. The final check fails the run (non-zero exit) if a written file breaks one.

  Run from the repo root:
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-UEVSuperheavyTextures.ps1

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
$Machines = @('heavy_ion_cyclotron', 'recoil_separator', 'superheavy_chemistry_lab')
$Items = @('target_wheel_blank', 'activated_target_wheel', 'sealed_capsule', 'flerovium_atoms', 'livermorium_atoms', 'tennessine_atoms',
    'oganesson_atoms', 'moscovium_atoms', 'polycarbonate_foil', 'ion_tracked_foil', 'etched_membrane', 'berkelium_oxide_dust',
    'cast_polycarbonate_film', 'lead_polymer_liner', 'ca48_plasma_bunch')

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

# Own controller faces (RF-6C): a 12x12 map inside a thin steel frame (x1..14, y1..14), the rest transparent.
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

$Own = @{
    # the cyclotron: two D-shaped dees with the ion spiral in the gap between them
    heavy_ion_cyclotron = @{ Mode = 'chase'; Pal = @{}
        Ramp = @((Hex '2C2A44'), (Hex '6C3CC0'), (Hex 'B484F0'), (Hex 'D8B8FF'), (Hex 'F0E0FF')); Ramp2 = @()
        Map = @('............', '..MMM01MMM..', '.MDDD23DDDM.', 'MDPPP12PPPDM', 'MDPPP23PPPDM', 'MDPPP30PPPDM', 'MDPPP01PPPDM', '.MDDD12DDDM.', '..MMM23MMM..', '............', '............', '.....ll.....') }
    # the chemistry lab: a copper-heated column with blue gas moving along it and amber deposits on the detector pads
    superheavy_chemistry_lab = @{ Mode = 'chase'; Pal = @{ k = (Hex 'B06A38'); q = (Hex '8A4E28') }
        Ramp = @((Hex '4A2A0A'), (Hex 'C96A0A'), (Hex 'FF9E1F'), (Hex 'FFD15A'), (Hex 'FFF0B0'))
        Ramp2 = @((Hex '1A2A44'), (Hex '2E5C9C'), (Hex '4F86D0'), (Hex '86B4F0'), (Hex 'C8E0FF'))
        Map = @('kqkqkqkqkqkq', 'qkqkqkqkqkqk', '.DDDDDDDDDD.', '.DabcdefghD.', '.DPPPPPPPPD.', '.DDDDDDDDDD.', '............', '.0.1.2.3.0.1', 'DDDDDDDDDDDD', '............', '............', '.....ll.....') }
}

function New-Face {
    param([string]$Machine, [int]$Frame, [bool]$Active)
    if ($Own.ContainsKey($Machine)) { return New-OwnFace $Own[$Machine] $Frame $Active }
    $c = New-Bezel
    $e = New-Canvas
    for ($y = 4; $y -le 9; $y++) { for ($x = 4; $x -le 11; $x++) { Set-Px $c $x $y $Pit } }
    # recoil_separator
    for ($x = 4; $x -le 11; $x++) { Set-Px $c $x 6 (Hex '2C3A44'); Set-Px $c $x 7 (Hex '2C3A44') }
    foreach ($x in @(5, 8, 10)) { Set-Px $c $x 4 (Hex '8A4C4C'); Set-Px $c $x 9 (Hex '4C4C8A') }
    if ($Active) {
        $beam = @((Hex 'E0FFFF'), (Hex '78E0F0'), (Hex '3CA8C8'))
        for ($k = 0; $k -lt 3; $k++) { $x = 4 + (($Frame * 2 + $k) % 8); Set-Both $c $e $x 6 $beam[$k]; Set-Both $c $e $x 7 $beam[$k] }
    }
    Set-Px $c 7 12 $(if ($Active) { $LampOn } else { $LampOff })
    Set-Px $c 8 12 $(if ($Active) { $LampOn } else { $LampOff })
    if ($Active) { Set-Px $e 7 12 $LampOn; Set-Px $e 8 12 $LampOn }
    for ($i = 0; $i -lt 16; $i++) { foreach ($p in @(@($i, 0), @($i, 15), @(0, $i), @(15, $i))) { Set-Px $c $p[0] $p[1] 0; Set-Px $e $p[0] $p[1] 0 } }
    return @{ C = $c; E = $e }
}

function New-Item16 {
    param([string]$Name)
    $c = New-Canvas
    switch ($Name) {
        { $_ -in @('target_wheel_blank', 'activated_target_wheel') } {
            $hot = $Name -eq 'activated_target_wheel'
            for ($y = 2; $y -le 13; $y++) { for ($x = 2; $x -le 13; $x++) {
                $d = ($x - 7.5) * ($x - 7.5) + ($y - 7.5) * ($y - 7.5)
                if ($d -le 30 -and $d -ge 4) { Set-Px $c $x $y $(if ($x + $y -lt 14) { Hex 'B4BCC4' } else { Hex '7C848C' }) }
            } }
            Set-Rect $c 7 7 2 2 (Hex '404850')
            foreach ($p in @(@(7, 3), @(7, 12), @(3, 7), @(12, 7))) { Set-Px $c $p[0] $p[1] $(if ($hot) { Hex '78E8F8' } else { Hex '2C3238' }) }
        }
        'sealed_capsule' {
            Set-Rect $c 5 3 6 10 (Hex '8C9096'); Set-Rect $c 5 3 6 1 (Hex 'C4C8CE'); Set-Rect $c 5 12 6 1 (Hex '5C6064')
            Set-Rect $c 6 6 4 4 (Hex '4C5C68'); Set-Rect $c 7 7 2 2 (Hex '9CB4C4')
        }
        'polycarbonate_foil' {
            Set-Rect $c 3 3 10 10 (Hex 'C8DCE4'); Set-Rect $c 3 3 10 1 (Hex 'F0FAFC'); Set-Rect $c 3 12 10 1 (Hex '8CA4AC')
            Set-Px $c 6 6 (Hex 'F0FAFC'); Set-Px $c 9 9 (Hex 'F0FAFC')
        }
        'ion_tracked_foil' {
            Set-Rect $c 3 3 10 10 (Hex 'C8DCE4'); Set-Rect $c 3 3 10 1 (Hex 'F0FAFC'); Set-Rect $c 3 12 10 1 (Hex '8CA4AC')
            foreach ($p in @(@(5, 5), @(8, 6), @(6, 8), @(10, 9), @(7, 11), @(10, 5), @(5, 10))) { Set-Px $c $p[0] $p[1] (Hex '6C3CC0') }
        }
        'cast_polycarbonate_film' {
            Set-Rect $c 3 4 10 8 (Hex 'D4E4EA'); Set-Rect $c 3 4 10 1 (Hex 'F4FCFE'); Set-Rect $c 3 11 10 1 (Hex '94ACB4'); Set-Px $c 8 7 (Hex 'F4FCFE')
        }
        'lead_polymer_liner' {
            Set-Rect $c 3 3 10 10 (Hex '6C7480'); Set-Rect $c 3 3 10 1 (Hex '9CA4B0'); Set-Rect $c 4 5 8 6 (Hex 'C8DCE4'); Set-Rect $c 4 5 8 1 (Hex 'F0FAFC')
        }
        'ca48_plasma_bunch' {
            Set-Rect $c 5 6 6 4 (Hex 'F0A878'); Set-Rect $c 6 7 4 2 (Hex 'FCE0C8'); Set-Rect $c 4 7 1 2 (Hex 'C87850'); Set-Rect $c 11 7 1 2 (Hex 'C87850'); Set-Px $c 7 4 (Hex 'F0A878'); Set-Px $c 8 11 (Hex 'F0A878')
        }
        'etched_membrane' {
            Set-Rect $c 3 3 10 10 (Hex 'D8E8D8'); Set-Rect $c 3 3 10 1 (Hex 'F8FFF8'); Set-Rect $c 3 12 10 1 (Hex '98AC98')
            for ($y = 5; $y -le 11; $y += 3) { for ($x = 5; $x -le 11; $x += 3) { Set-Px $c $x $y (Hex '4C6C4C') } }
        }
        'berkelium_oxide_dust' {
            $pile = @(@(4, 11), @(5, 10), @(6, 9), @(7, 8), @(8, 8), @(9, 9), @(10, 10), @(11, 11))
            for ($x = 3; $x -le 12; $x++) { for ($y = 12 - [Math]::Min([Math]::Min($x - 3, 12 - $x), 4); $y -le 12; $y++) { Set-Px $c $x $y $(if (($x + $y) % 3 -eq 0) { Hex 'D0B848' } else { Hex 'A89030' }) } }
            Set-Px $c 7 7 (Hex 'E8D878'); Set-Px $c 8 7 (Hex 'D0B848')
        }
        default {
            # an atoms item: a small grey disc (the membrane) with a few coloured dots, one colour per element
            $dot = switch ($Name) {
                'flerovium_atoms' { Hex 'B8C4D8' } 'livermorium_atoms' { Hex 'C8B0D0' } 'tennessine_atoms' { Hex 'D8C8A0' }
                'oganesson_atoms' { Hex 'A8D8D0' } default { Hex 'D0B8B8' }
            }
            for ($y = 3; $y -le 12; $y++) { for ($x = 3; $x -le 12; $x++) {
                $d = ($x - 7.5) * ($x - 7.5) + ($y - 7.5) * ($y - 7.5)
                if ($d -le 20) { Set-Px $c $x $y $(if ($x + $y -lt 14) { Hex 'A4ACB4' } else { Hex '6C747C' }) }
            } }
            foreach ($p in @(@(6, 6), @(9, 7), @(7, 9), @(10, 10), @(5, 9))) { Set-Px $c $p[0] $p[1] $dot }
        }
    }
    return $c
}

foreach ($m in $Machines) {
    $dir = "block/multiblock/$m"
    $idle = New-Face $m 0 $false
    Out-Tex $idle.C "$dir/overlay_front.png"
    $col = @(); $emi = @()
    for ($f = 0; $f -lt $Frames; $f++) { $a = New-Face $m $f $true; $col += , $a.C; $emi += , $a.E }
    Out-Tex (Join-Frames $col) "$dir/overlay_front_active.png" $FrameTime
    Out-Tex (Join-Frames $emi) "$dir/overlay_front_active_emissive.png" $FrameTime
}
foreach ($i in $Items) { Out-Tex (New-Item16 $i) "item/$i.png" }

# self-check: ring empty, alpha 0 or 255, nothing pure black, emissive a subset of the colour layer, no two frames alike
$problems = New-Object System.Collections.Generic.List[string]
$names = @()
foreach ($m in $Machines) { $names += @("block/multiblock/$m/overlay_front", "block/multiblock/$m/overlay_front_active", "block/multiblock/$m/overlay_front_active_emissive") }
$names += ($Items | ForEach-Object { "item/$_" })
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
foreach ($m in $Machines) {
    $cl = $png["block/multiblock/$m/overlay_front_active"]; $em = $png["block/multiblock/$m/overlay_front_active_emissive"]
    for ($i = 0; $i -lt $cl.P.Length; $i++) { if ($em.P[$i] -ne 0 -and $em.P[$i] -ne $cl.P[$i]) { $problems.Add("${m}: emissive differs from colour at $i") } }
    for ($f = 0; $f -lt $Frames - 1; $f++) {
        $same = $true
        for ($i = 0; $i -lt 256; $i++) { if ($cl.P[$f * 256 + $i] -ne $cl.P[($f + 1) * 256 + $i]) { $same = $false; break } }
        if ($same) { $problems.Add("${m}: frame $f repeats frame $($f + 1)") }
    }
}
if ($problems.Count -gt 0) { $problems | Select-Object -First 20 | ForEach-Object { Write-Error $_ -ErrorAction Continue }; exit 1 }

Write-Host "$ScriptName wrote $($written.Count) files"
if ($Credits) {
    foreach ($w in $written) { Write-Host "| pack/kubejs/assets/grindless/textures/$w | drawn procedurally by tools/assets/$ScriptName | ours |" }
}
