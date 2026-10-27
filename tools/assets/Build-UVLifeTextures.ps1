<#
.SYNOPSIS
  Procedural 16x16 pixel art for the UV ark biosphere and neural culture vat controller faces and the algae culture icon of
  Gregtech Grindless (UV-A10).

.DESCRIPTION
  Every pixel is drawn by this script (palettes and small routines); nothing is copied or edited from GregTech Modern or any
  other mod. Output is deterministic. Same method and steel bezel as the earlier sets (Build-UVDetectorsTextures.ps1).

  Writes (under pack/kubejs/assets/grindless/textures/):
    block/multiblock/ark_biosphere/overlay_front.png, overlay_front_active.png(+.mcmeta), overlay_front_active_emissive.png(+.mcmeta)
    block/multiblock/neural_culture_vat/ the same three files
    item/algae_culture.png

  Ark face: a bezel round a glass dome window over green water with an algae tube; idle, the water is still. Working (4 frames,
  frametime 4), an oxygen bubble rises through the tube and the grow lamp at the top glows; the run lamp is green.
  Vat face: a bezel round a culture flask of pink medium; idle, the culture is dark. Working (4 frames, frametime 4), the neurons in
  the flask fire one after another (violet sparks); the run lamp is green.
  The *_emissive layer holds only the glow and the lamp.
  Algae culture: a glass culture flask with a cork, half full of bright green algae.

  Conventions: transparent background, outer 1 px ring empty, every pixel fully opaque or fully transparent, none pure black,
  emissive layer a subset of the colour layer, no two active frames alike. The final check fails the run (non-zero exit) if a
  written file breaks one, or if pack/kubejs/startup_scripts/grindless/uv/life.js does not name these folders and the item texture.

  Run from the repo root:
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-UVLifeTextures.ps1

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

$Lit = Hex 'B0B0B0'; $Mid = Hex '707070'; $Dark = Hex '404040'; $Deep = Hex '222222'
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
    if ($Kind -eq 'ark') {
        # the dome: a stepped glass outline (x3..12, y3..10) over green water (y7..10), the algae tube in the middle (x7..8)
        $glass = Hex '9FD8D0'; $air = Hex '1C2A2E'; $water = Hex '1F6B3A'; $waterLow = Hex '154A28'
        for ($y = 3; $y -le 10; $y++) { for ($x = 4; $x -le 11; $x++) { Set-Px $c $x $y $air } }
        for ($x = 6; $x -le 9; $x++) { Set-Px $c $x 3 $glass }
        Set-Px $c 5 4 $glass; Set-Px $c 10 4 $glass
        for ($y = 5; $y -le 10; $y++) { Set-Px $c 4 $y $glass; Set-Px $c 11 $y $glass }
        Set-Px $c 4 4 $Deep; Set-Px $c 11 4 $Deep; Set-Px $c 4 3 $Deep; Set-Px $c 5 3 $Deep; Set-Px $c 10 3 $Deep; Set-Px $c 11 3 $Deep
        for ($y = 7; $y -le 10; $y++) { for ($x = 5; $x -le 10; $x++) { Set-Px $c $x $y $(if ($y -ge 9) { $waterLow } else { $water }) } }
        $tube = Hex '3FA35A'
        for ($y = 5; $y -le 10; $y++) { Set-Px $c 7 $y $tube; Set-Px $c 8 $y (Hex '2E8048') }
        $growOff = Hex '6A5A2A'
        Set-Px $c 7 4 $growOff; Set-Px $c 8 4 $growOff
        if ($Active) {
            # the grow lamp at the top of the dome, and an oxygen bubble climbing the tube one row a frame (bottom to top)
            Set-Both $c $e 7 4 (Hex 'FFF2A8'); Set-Both $c $e 8 4 (Hex 'FFD86A')
            $by = 10 - ($Frame * 1) - [int]($Frame -ge 2)
            Set-Both $c $e 7 $by (Hex 'DFFFF4')
            $leaf = @((Hex '8CF07A'), (Hex '5ED65A'))
            Set-Both $c $e 6 (8 + ($Frame % 2)) $leaf[$Frame % 2]
            Set-Both $c $e 9 (9 - ($Frame % 2)) $leaf[($Frame + 1) % 2]
        }
    }
    else {
        # the flask: a neck (x7..8, y3..4) and a round body (x4..11, y5..10) of pink medium
        $glass = Hex 'B8C8D0'; $medium = Hex 'A84A6A'; $mediumLow = Hex '7A3050'
        Set-Px $c 7 3 $glass; Set-Px $c 8 3 $glass
        Set-Px $c 6 4 $glass; Set-Px $c 9 4 $glass; Set-Px $c 7 4 (Hex '2A2A34'); Set-Px $c 8 4 (Hex '2A2A34')
        for ($x = 5; $x -le 10; $x++) { Set-Px $c $x 5 $glass; Set-Px $c $x 10 $glass }
        for ($y = 6; $y -le 9; $y++) { Set-Px $c 4 $y $glass; Set-Px $c 11 $y $glass }
        for ($y = 6; $y -le 9; $y++) { for ($x = 5; $x -le 10; $x++) { Set-Px $c $x $y $(if ($y -ge 8) { $mediumLow } else { $medium }) } }
        $cellOff = Hex '4A2440'
        $cells = @(@(6, 7), @(9, 6), @(8, 9), @(6, 9))
        foreach ($p in $cells) { Set-Px $c $p[0] $p[1] $cellOff }
        if ($Active) {
            # the neurons fire in turn: the lit one is bright violet, its dendrite one pixel toward the next
            $p = $cells[$Frame]; $q = $cells[($Frame + 1) % 4]
            Set-Both $c $e $p[0] $p[1] (Hex 'E6A8FF')
            $dx = [Math]::Sign($q[0] - $p[0]); $dy = [Math]::Sign($q[1] - $p[1])
            Set-Both $c $e ($p[0] + $dx) ($p[1] + $dy) (Hex 'B070E0')
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

# The algae culture: a corked conical flask, light from the top left, half full of algae.
function New-AlgaeCulture {
    $c = New-Canvas
    $cork = Hex '9A6A3A'; $corkDark = Hex '6E4A26'
    $glassLit = Hex 'D8ECF0'; $glass = Hex '9CB8C4'; $glassDark = Hex '5E7884'
    $algae = Hex '4CC048'; $algaeLit = Hex '8CE87A'; $algaeDark = Hex '2A7A30'; $empty = Hex '3A4E58'
    Set-Px $c 7 2 $cork; Set-Px $c 8 2 $corkDark; Set-Px $c 7 3 $cork; Set-Px $c 8 3 $corkDark
    for ($y = 4; $y -le 6; $y++) { Set-Px $c 6 $y $glassLit; Set-Px $c 9 $y $glassDark; Set-Px $c 7 $y $empty; Set-Px $c 8 $y $empty }
    # the cone widens one pixel each side every two rows, y7..12; the base at y13
    for ($y = 7; $y -le 12; $y++) {
        $h = [int][Math]::Floor(($y - 7) / 2) + 1
        $l = 7 - $h; $r = 8 + $h
        Set-Px $c $l $y $glassLit; Set-Px $c $r $y $glassDark
        for ($x = $l + 1; $x -le $r - 1; $x++) {
            $v = if ($y -lt 9) { $empty } elseif ($y -eq 9) { $algaeLit } elseif ($y -eq 12) { $algaeDark } else { $algae }
            Set-Px $c $x $y $v
        }
    }
    for ($x = 3; $x -le 12; $x++) { Set-Px $c $x 13 $(if ($x -le 4) { $glass } else { $glassDark }) }
    Set-Px $c 6 11 $algaeLit; Set-Px $c 9 10 $algaeDark; Set-Px $c 8 7 $glassLit
    return $c
}

$kinds = @(@{ Kind = 'ark'; Dir = 'block/multiblock/ark_biosphere' }, @{ Kind = 'vat'; Dir = 'block/multiblock/neural_culture_vat' })
foreach ($k in $kinds) {
    $idle = New-Face $k.Kind 0 $false
    Out-Tex $idle.C "$($k.Dir)/overlay_front.png"
    $col = @(); $emi = @()
    for ($f = 0; $f -lt $Frames; $f++) { $a = New-Face $k.Kind $f $true; $col += , $a.C; $emi += , $a.E }
    Out-Tex (Join-Frames $col) "$($k.Dir)/overlay_front_active.png" $FrameTime
    Out-Tex (Join-Frames $emi) "$($k.Dir)/overlay_front_active_emissive.png" $FrameTime
}
$ItemRel = 'item/algae_culture.png'
Out-Tex (New-AlgaeCulture) $ItemRel

# self-check: the machines and the item use these paths; ring empty, alpha 0 or 255, nothing pure black, emissive a subset of the colour
# layer, no two frames alike
$problems = New-Object System.Collections.Generic.List[string]
$startup = Get-Content -Raw (Join-Path $RepoRoot 'pack\kubejs\startup_scripts\grindless\uv\life.js')
if (-not $startup.Contains("'grindless:item/algae_culture'")) { $problems.Add('uv/life.js does not use grindless:item/algae_culture') }
function Test-Pixels {
    param($Png, [string]$Name)
    for ($y = 0; $y -lt $Png.H; $y++) {
        for ($x = 0; $x -lt $Png.W; $x++) {
            $v = $Png.P[$y * $Png.W + $x]; $a = ($v -shr 24) -band 255
            $ring = ((($x % 16) -eq 0) -or (($x % 16) -eq 15) -or (($y % 16) -eq 0) -or (($y % 16) -eq 15))
            if ($a -ne 0 -and $a -ne 255) { $problems.Add("${Name}: partial alpha at $x,$y") }
            if ($a -eq 255 -and ($v -band 0xFFFFFF) -eq 0) { $problems.Add("${Name}: pure black at $x,$y") }
            if ($ring -and $a -ne 0) { $problems.Add("${Name}: ring pixel at $x,$y") }
        }
    }
}
Test-Pixels (Read-Png (Join-Path $OutRoot ($ItemRel -replace '/', '\'))) $ItemRel
foreach ($k in $kinds) {
    if (-not $startup.Contains("'grindless:$($k.Dir)'")) { $problems.Add("uv/life.js does not use grindless:$($k.Dir)") }
    $png = @{}
    foreach ($n in 'overlay_front', 'overlay_front_active', 'overlay_front_active_emissive') { $png[$n] = Read-Png (Join-Path $OutRoot ("$($k.Dir)/$n.png" -replace '/', '\')) }
    foreach ($n in $png.Keys) { Test-Pixels $png[$n] "$($k.Dir)/$n" }
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
