<#
.SYNOPSIS
  Procedural 16x16 pixel art for the UV zone refining tower and optical ground station controller faces of Gregtech Grindless.

.DESCRIPTION
  Every pixel is drawn by this script (palettes and small routines); nothing is copied or edited from GregTech Modern or any
  other mod. Output is deterministic. Same method and steel bezel as the earlier sets (Build-UVThoriumTextures.ps1).

  Writes (under pack/kubejs/assets/grindless/textures/):
    block/multiblock/zone_refining_tower/overlay_front.png, overlay_front_active.png(+.mcmeta), overlay_front_active_emissive.png(+.mcmeta)
    block/multiblock/optical_ground_station/ the same three files

  Tower face: a bezel round a tall window with a grey germanium bar and copper RF coil turns at its sides; idle, the bar is cold.
  Working (4 frames, frametime 4), an orange melt zone climbs the bar and the coil turns beside it glow; the run lamp is green.
  Station face: a bezel round a night-sky window with a dark mirror dish at the bottom; idle, the sky is empty. Working (4 frames,
  frametime 4), a faint star twinkles and a red laser photon falls down onto the detector, which flashes cyan; the run lamp is green.
  The *_emissive layer holds only the glow and the lamp.

  Conventions: transparent background, outer 1 px ring empty, every pixel fully opaque or fully transparent, none pure black,
  emissive layer a subset of the colour layer, no two active frames alike. The final check fails the run (non-zero exit) if a
  written file breaks one, or if pack/kubejs/startup_scripts/grindless/uv/detectors.js does not name these overlay folders.

  Run from the repo root:
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-UVDetectorsTextures.ps1

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
    if ($Kind -eq 'tower') {
        for ($y = 3; $y -le 10; $y++) { for ($x = 5; $x -le 10; $x++) { Set-Px $c $x $y $Pit } }
        # the germanium bar, x7..8, and the coil turns at x5 and x10 on even rows
        $bar = @((Hex '9AA3AD'), (Hex '6F7880'))
        for ($y = 3; $y -le 10; $y++) { Set-Px $c 7 $y $bar[0]; Set-Px $c 8 $y $bar[1] }
        $coilOff = Hex '7A4A22'
        foreach ($y in 4, 6, 8, 10) { Set-Px $c 5 $y $coilOff; Set-Px $c 10 $y $coilOff }
        if ($Active) {
            # the melt zone: two rows, climbing one coil turn a frame (bottom to top)
            $zy = 10 - ($Frame * 2)
            $melt = @((Hex 'FFE08A'), (Hex 'F0771F'))
            Set-Both $c $e 7 $zy $melt[0]; Set-Both $c $e 8 $zy $melt[1]
            Set-Both $c $e 7 ($zy - 1) $melt[1]; Set-Both $c $e 8 ($zy - 1) (Hex 'C2480A')
            $coilOn = Hex 'FFB347'
            Set-Both $c $e 5 $zy $coilOn; Set-Both $c $e 10 $zy $coilOn
        }
    }
    else {
        # the sky: x4..11, y3..9; the mirror dish along the bottom (y9..10), the detector at its focus (y8)
        $sky = Hex '0E1430'
        for ($y = 3; $y -le 9; $y++) { for ($x = 4; $x -le 11; $x++) { Set-Px $c $x $y $sky } }
        $dish = Hex '8C96A8'
        foreach ($x in 4, 11) { Set-Px $c $x 9 $dish }
        for ($x = 5; $x -le 10; $x++) { Set-Px $c $x 10 $dish }
        Set-Px $c 7 8 (Hex '2A3A44'); Set-Px $c 8 8 (Hex '2A3A44')
        if ($Active) {
            # a faint star twinkling (two brightnesses) and a laser photon falling to the detector
            $star = @((Hex 'D8DCF0'), (Hex '8890B8'))
            Set-Both $c $e 10 4 $star[$Frame % 2]
            Set-Both $c $e 5 5 $star[($Frame + 1) % 2]
            $py = 3 + ($Frame * 2)
            if ($py -le 7) { Set-Both $c $e 7 $py (Hex 'FF4A3A') }
            $det = if ($Frame -eq 3) { Hex '8AF0FF' } else { Hex '2FB4D8' }
            Set-Both $c $e 7 8 $det; Set-Both $c $e 8 8 $det
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

$kinds = @(@{ Kind = 'tower'; Dir = 'block/multiblock/zone_refining_tower' }, @{ Kind = 'station'; Dir = 'block/multiblock/optical_ground_station' })
foreach ($k in $kinds) {
    $idle = New-Face $k.Kind 0 $false
    Out-Tex $idle.C "$($k.Dir)/overlay_front.png"
    $col = @(); $emi = @()
    for ($f = 0; $f -lt $Frames; $f++) { $a = New-Face $k.Kind $f $true; $col += , $a.C; $emi += , $a.E }
    Out-Tex (Join-Frames $col) "$($k.Dir)/overlay_front_active.png" $FrameTime
    Out-Tex (Join-Frames $emi) "$($k.Dir)/overlay_front_active_emissive.png" $FrameTime
}

# self-check: the machines use these folders; ring empty, alpha 0 or 255, nothing pure black, emissive a subset of the colour layer,
# no two frames alike
$problems = New-Object System.Collections.Generic.List[string]
$startup = Get-Content -Raw (Join-Path $RepoRoot 'pack\kubejs\startup_scripts\grindless\uv\detectors.js')
foreach ($k in $kinds) {
    if (-not $startup.Contains("'grindless:$($k.Dir)'")) { $problems.Add("uv/detectors.js does not use grindless:$($k.Dir)") }
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
