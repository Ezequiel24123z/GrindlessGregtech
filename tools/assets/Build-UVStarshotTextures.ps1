<#
.SYNOPSIS
  Procedural 16x16 pixel art for UV's Starshot of Gregtech Grindless: the light sail fab, starchip fab and laser sail launcher
  controller faces and the three sail carriers.

.DESCRIPTION
  Every pixel is drawn by this script (palettes and small routines); nothing is copied or edited from GregTech Modern or any
  other mod. Output is deterministic. Same method and steel bezel as Build-UVDetectorsTextures.ps1.

  Writes (under pack/kubejs/assets/grindless/textures/):
    block/multiblock/light_sail_fab/overlay_front.png, overlay_front_active.png(+.mcmeta), overlay_front_active_emissive.png(+.mcmeta)
    block/multiblock/starchip_fab/ the same three files
    block/multiblock/laser_sail_launcher/ the same three files
    item/epitaxial_silicon_wafer.png, item/nitride_coated_carrier.png, item/patterned_sail_carrier.png

  Sail fab face: a bezel round a dark bay with a tungsten heater bar at the top and a thin grey film below it; working (4 frames,
  frametime 4), the heater glows and an interference band runs across the film. Starchip fab face: a clean window with a small chip
  in the middle; working, a bonder tip steps round the chip's four pads, which light cyan. Launcher face: a night sky over a row of
  laser emitters; working, a violet beam climbs from the emitters and a bright sail dot rides its tip. The run lamp is green; the
  *_emissive layer holds only the glow and the lamp.
  Carriers: a round silicon wafer with a flat; the coated carrier wears a gold-violet nitride film, the patterned one a cyan grid.

  Conventions: transparent background, outer 1 px ring empty, every pixel fully opaque or fully transparent, none pure black,
  emissive layer a subset of the colour layer, no two active frames alike. The final check fails the run (non-zero exit) if a
  written file breaks one, or if pack/kubejs/startup_scripts/grindless/uv/starshot.js does not name these folders and items.

  Run from the repo root:
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-UVStarshotTextures.ps1

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
    if ($Kind -eq 'sail') {
        Set-Rect $c 4 3 8 8 $Pit
        # the heater bar (y4) and the film (y8), both x4..11
        $heatOff = Hex '6A6F78'
        for ($x = 4; $x -le 11; $x++) { Set-Px $c $x 4 $heatOff; Set-Px $c $x 8 (Hex '8A8F98') }
        if ($Active) {
            $heat = @((Hex 'FFB347'), (Hex 'F0771F'))
            for ($x = 4; $x -le 11; $x++) { Set-Both $c $e $x 4 $heat[($x + $Frame) % 2] }
            # the interference band: three colours sliding two pixels a frame
            $band = @((Hex 'E8C34A'), (Hex 'B85CE0'), (Hex '4AD0E8'))
            $bx = 4 + ($Frame * 2)
            for ($k = 0; $k -lt 3; $k++) { if (($bx + $k) -le 11) { Set-Both $c $e ($bx + $k) 8 $band[$k] } }
        }
    }
    elseif ($Kind -eq 'chip') {
        Set-Rect $c 4 3 8 8 (Hex '2C3438')
        # the chip, x6..9, y5..8, and its four pads at the corners outside it
        Set-Rect $c 6 5 4 4 (Hex '3A2F5A')
        Set-Px $c 7 6 (Hex '6A5AA0'); Set-Px $c 8 7 (Hex '6A5AA0')
        $pads = @(@(5, 4), @(10, 4), @(10, 9), @(5, 9))
        $padOff = Hex '8A7A40'
        foreach ($p in $pads) { Set-Px $c $p[0] $p[1] $padOff }
        if ($Active) {
            $padOn = Hex '6AF0F0'
            for ($k = 0; $k -le $Frame; $k++) { Set-Both $c $e $pads[$k][0] $pads[$k][1] $padOn }
            $tip = $pads[$Frame]
            $ty = if ($tip[1] -lt 6) { $tip[1] - 1 } else { $tip[1] + 1 }
            Set-Px $c $tip[0] $ty (Hex 'D8DCE0')
        }
    }
    else {
        # the sky x3..12, y3..10, the emitter row along the bottom (y10)
        Set-Rect $c 3 3 10 8 (Hex '0E1430')
        $emOff = Hex '5A3A6A'
        for ($x = 4; $x -le 11; $x += 2) { Set-Px $c $x 10 $emOff }
        Set-Px $c 11 4 (Hex '8890B8')
        if ($Active) {
            $emOn = Hex 'C88AFF'
            for ($x = 4; $x -le 11; $x += 2) { Set-Both $c $e $x 10 $emOn }
            # the beam climbs from y9 two rows a frame; the sail rides its tip
            $top = 9 - ($Frame * 2)
            for ($y = 9; $y -ge $top; $y--) { Set-Both $c $e 7 $y (Hex '9A4AF0'); Set-Both $c $e 8 $y (Hex '7A3AD0') }
            $sy = $top - 1
            if ($sy -ge 3) { Set-Both $c $e 7 $sy (Hex 'FFF4C8'); Set-Both $c $e 8 $sy (Hex 'FFF4C8') }
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

# A round wafer, radius 6.5 round (7.5, 7.5), with a flat along the bottom (y13); lit from the top left.
function New-Wafer {
    param([string]$Kind)
    $c = New-Canvas
    $base = Hex '7C8694'; $rim = Hex '4E5664'; $sheen = Hex 'B8C2D0'
    if ($Kind -eq 'coated') { $base = Hex '8A6AB0'; $rim = Hex '54407A'; $sheen = Hex 'E8C34A' }
    if ($Kind -eq 'patterned') { $base = Hex '3A4A6A'; $rim = Hex '263048'; $sheen = Hex '8AE8F0' }
    for ($y = 1; $y -le 13; $y++) {
        for ($x = 1; $x -le 14; $x++) {
            $d = [Math]::Sqrt([Math]::Pow($x - 7.5, 2) + [Math]::Pow($y - 7.5, 2))
            if ($d -gt 6.6) { continue }
            $col = if ($d -gt 5.7 -or $y -eq 13) { $rim } else { $base }
            Set-Px $c $x $y $col
        }
    }
    # sheen: a short diagonal on the top left
    foreach ($p in @(@(4, 5), @(5, 4), @(4, 6), @(6, 4))) { Set-Px $c $p[0] $p[1] $sheen }
    if ($Kind -eq 'patterned') {
        $grid = Hex '5AB8D0'
        for ($y = 4; $y -le 11; $y++) { for ($x = 4; $x -le 11; $x++) { if (($x % 3 -eq 0) -or ($y % 3 -eq 0)) { Set-Px $c $x $y $grid } } }
    }
    if ($Kind -eq 'coated') { foreach ($p in @(@(9, 10), @(10, 9), @(10, 10))) { Set-Px $c $p[0] $p[1] (Hex 'B85CE0') } }
    return $c
}

$kinds = @(
    @{ Kind = 'sail'; Dir = 'block/multiblock/light_sail_fab' },
    @{ Kind = 'chip'; Dir = 'block/multiblock/starchip_fab' },
    @{ Kind = 'launch'; Dir = 'block/multiblock/laser_sail_launcher' }
)
foreach ($k in $kinds) {
    $idle = New-Face $k.Kind 0 $false
    Out-Tex $idle.C "$($k.Dir)/overlay_front.png"
    $col = @(); $emi = @()
    for ($f = 0; $f -lt $Frames; $f++) { $a = New-Face $k.Kind $f $true; $col += , $a.C; $emi += , $a.E }
    Out-Tex (Join-Frames $col) "$($k.Dir)/overlay_front_active.png" $FrameTime
    Out-Tex (Join-Frames $emi) "$($k.Dir)/overlay_front_active_emissive.png" $FrameTime
}
$items = @(@{ Name = 'epitaxial_silicon_wafer'; Kind = 'epi' }, @{ Name = 'nitride_coated_carrier'; Kind = 'coated' },
    @{ Name = 'patterned_sail_carrier'; Kind = 'patterned' })
foreach ($it in $items) { Out-Tex (New-Wafer $it.Kind) "item/$($it.Name).png" }

# self-check: the startup script uses these folders and items; ring empty, alpha 0 or 255, nothing pure black, emissive a subset of
# the colour layer, no two frames alike, no two items alike
$problems = New-Object System.Collections.Generic.List[string]
$startup = Get-Content -Raw (Join-Path $RepoRoot 'pack\kubejs\startup_scripts\grindless\uv\starshot.js')
function Test-Png {
    param($C, [string]$Name)
    for ($y = 0; $y -lt $C.H; $y++) {
        for ($x = 0; $x -lt $C.W; $x++) {
            $v = $C.P[$y * $C.W + $x]; $a = ($v -shr 24) -band 255
            $ring = ((($x % 16) -eq 0) -or (($x % 16) -eq 15) -or (($y % 16) -eq 0) -or (($y % 16) -eq 15))
            if ($a -ne 0 -and $a -ne 255) { $problems.Add("${Name}: partial alpha at $x,$y") }
            if ($a -eq 255 -and ($v -band 0xFFFFFF) -eq 0) { $problems.Add("${Name}: pure black at $x,$y") }
            if ($ring -and $a -ne 0) { $problems.Add("${Name}: ring pixel at $x,$y") }
        }
    }
}
foreach ($k in $kinds) {
    if (-not $startup.Contains("'grindless:$($k.Dir)'")) { $problems.Add("uv/starshot.js does not use grindless:$($k.Dir)") }
    $png = @{}
    foreach ($n in 'overlay_front', 'overlay_front_active', 'overlay_front_active_emissive') { $png[$n] = Read-Png (Join-Path $OutRoot ("$($k.Dir)/$n.png" -replace '/', '\')) }
    foreach ($n in $png.Keys) { Test-Png $png[$n] "$($k.Dir)/$n" }
    $col = $png['overlay_front_active']; $em = $png['overlay_front_active_emissive']
    for ($i = 0; $i -lt $col.P.Length; $i++) { if ($em.P[$i] -ne 0 -and $em.P[$i] -ne $col.P[$i]) { $problems.Add("$($k.Dir): emissive differs from colour at $i") } }
    for ($f = 0; $f -lt $Frames - 1; $f++) {
        $same = $true
        for ($i = 0; $i -lt 256; $i++) { if ($col.P[$f * 256 + $i] -ne $col.P[($f + 1) * 256 + $i]) { $same = $false; break } }
        if ($same) { $problems.Add("$($k.Dir): frame $f repeats frame $($f + 1)") }
    }
}
$seen = @{}
foreach ($it in $items) {
    if (-not $startup.Contains("$($it.Name): {")) { $problems.Add("uv/starshot.js does not register $($it.Name)") }
    $p = Read-Png (Join-Path $OutRoot "item\$($it.Name).png")
    Test-Png $p "item/$($it.Name)"
    $key = ($p.P -join ',')
    if ($seen.ContainsKey($key)) { $problems.Add("item/$($it.Name) repeats item/$($seen[$key])") } else { $seen[$key] = $it.Name }
}
if ($problems.Count -gt 0) { $problems | Select-Object -First 20 | ForEach-Object { Write-Error $_ -ErrorAction Continue }; exit 1 }

Write-Host "$ScriptName wrote $($written.Count) files"
if ($Credits) {
    foreach ($w in $written) { Write-Host "| pack/kubejs/assets/grindless/textures/$w | drawn procedurally by tools/assets/$ScriptName | ours |" }
}
