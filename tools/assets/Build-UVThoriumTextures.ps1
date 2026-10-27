<#
.SYNOPSIS
  Procedural 16x16 pixel art for the UV pyroprocessing cell and accelerator-driven reactor controller faces, and the uranium-233 fuel rod item, of Gregtech Grindless.

.DESCRIPTION
  Every pixel is drawn by this script (palettes and small routines); nothing is copied or edited from GregTech Modern or any
  other mod. Output is deterministic. Same method and steel bezel as the earlier sets (Build-ZPMNaquadriaTextures.ps1).

  Writes (under pack/kubejs/assets/grindless/textures/):
    block/multiblock/pyroprocessing_cell/overlay_front.png, overlay_front_active.png(+.mcmeta), overlay_front_active_emissive.png(+.mcmeta)
    block/multiblock/accelerator_driven_reactor/ the same three files
    item/u233_fuel_rod.png

  Cell face: a dark steel bezel round a furnace window; idle, the salt bath is dark. Working (4 frames, frametime 4), an orange
  molten-salt surface glows and a pale green cathode rod dips into it; the run lamp is green.
  Reactor face: a bezel round a beam window; idle, the beam line is dark. Working (4 frames, frametime 4), cyan proton bunches
  travel along the beam line into a violet core; the run lamp is green.
  The *_emissive layer holds only the glow and the lamp.
  Rod: a thin zircaloy tube, grey, with a pale green uranium-233 fuel column and end plugs.

  Conventions: transparent background, outer 1 px ring empty, every pixel fully opaque or fully transparent, none pure black,
  emissive layer a subset of the colour layer. The final check fails the run (non-zero exit) if a written file breaks one.

  Run from the repo root:
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-UVThoriumTextures.ps1

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
    if ($Kind -eq 'cell') {
        if ($Active) {
            $salt = @((Hex 'C2480A'), (Hex 'F0771F'), (Hex 'FFB347'), (Hex 'FFE08A'))
            for ($x = 5; $x -le 10; $x++) {
                for ($y = 7; $y -le 9; $y++) {
                    $k = if ($y -eq 7) { (($x + $Frame) % 4) } else { 0 }
                    Set-Both $c $e $x $y $salt[$k]
                }
            }
            # the cathode rod, pale green, dipping into the bath
            for ($y = 4; $y -le 7; $y++) { Set-Both $c $e 7 $y (Hex '9CD88A') }
            Set-Both $c $e 8 ($(4 + ($Frame % 2))) (Hex 'D2F5C2')
        }
        else {
            for ($x = 5; $x -le 10; $x++) { for ($y = 7; $y -le 9; $y++) { Set-Px $c $x $y (Hex '3A1A0C') } }
            for ($y = 4; $y -le 6; $y++) { Set-Px $c 7 $y (Hex '4E6648') }
        }
    }
    else {
        # the beam line along y6..7 from the left, into the core x9..10
        for ($x = 4; $x -le 11; $x++) { Set-Px $c $x 6 (Hex '1C2A33'); Set-Px $c $x 7 (Hex '1C2A33') }
        if ($Active) {
            $cyan = @((Hex '2FB4D8'), (Hex '8AE4F5'))
            for ($i = 0; $i -lt 3; $i++) {
                $x = 4 + ((($Frame * 2) + ($i * 3)) % 6)
                Set-Both $c $e $x 6 $cyan[0]; Set-Both $c $e $x 7 $cyan[1]
            }
            foreach ($p in @(@(10, 5), @(11, 5), @(10, 8), @(11, 8), @(10, 6), @(11, 6), @(10, 7), @(11, 7))) {
                $k = (($p[0] + $p[1] + $Frame) % 3)
                $viol = @((Hex '8E3FD0'), (Hex 'B565F0'), (Hex 'E3B8FF'))
                Set-Both $c $e $p[0] $p[1] $viol[$k]
            }
        }
        else {
            foreach ($p in @(@(10, 5), @(11, 5), @(10, 8), @(11, 8), @(10, 6), @(11, 6), @(10, 7), @(11, 7))) { Set-Px $c $p[0] $p[1] (Hex '2A1A3A') }
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

function New-Rod {
    $c = New-Canvas
    $tube = @((Hex 'C8CCD0'), (Hex '9AA0A6'), (Hex '6E747A'))
    $fuel = @((Hex 'C4F0B0'), (Hex '8CC878'), (Hex '5E9A4E'))
    # a diagonal rod from the lower left to the upper right, 2 px thick
    for ($i = 0; $i -lt 12; $i++) {
        $x = 2 + $i; $y = 13 - $i
        $core = ($i -ge 2 -and $i -le 9)
        $pal = if ($core) { $fuel } else { $tube }
        Set-Px $c $x $y $pal[1]
        Set-Px $c ($x + 1) $y $pal[0]
        Set-Px $c $x ($y - 1) $pal[2]
    }
    Set-Px $c 2 14 $tube[2]; Set-Px $c 14 2 $tube[0]
    return $c
}

$kinds = @(@{ Kind = 'cell'; Dir = 'block/multiblock/pyroprocessing_cell' }, @{ Kind = 'reactor'; Dir = 'block/multiblock/accelerator_driven_reactor' })
foreach ($k in $kinds) {
    $idle = New-Face $k.Kind 0 $false
    Out-Tex $idle.C "$($k.Dir)/overlay_front.png"
    $col = @(); $emi = @()
    for ($f = 0; $f -lt $Frames; $f++) { $a = New-Face $k.Kind $f $true; $col += , $a.C; $emi += , $a.E }
    Out-Tex (Join-Frames $col) "$($k.Dir)/overlay_front_active.png" $FrameTime
    Out-Tex (Join-Frames $emi) "$($k.Dir)/overlay_front_active_emissive.png" $FrameTime
}
Out-Tex (New-Rod) 'item/u233_fuel_rod.png'

# self-check: ring empty, alpha 0 or 255, nothing pure black, emissive a subset of the colour layer, no two frames alike
$problems = New-Object System.Collections.Generic.List[string]
foreach ($k in $kinds) {
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
$rod = Read-Png (Join-Path $OutRoot 'item\u233_fuel_rod.png')
for ($y = 0; $y -lt $rod.H; $y++) {
    for ($x = 0; $x -lt $rod.W; $x++) {
        $v = $rod.P[$y * $rod.W + $x]; $a = ($v -shr 24) -band 255
        if ($a -ne 0 -and $a -ne 255) { $problems.Add("item/u233_fuel_rod: partial alpha at $x,$y") }
        if ($a -eq 255 -and ($v -band 0xFFFFFF) -eq 0) { $problems.Add("item/u233_fuel_rod: pure black at $x,$y") }
        if ($a -ne 0 -and ($x -eq 0 -or $x -eq 15 -or $y -eq 0 -or $y -eq 15)) { $problems.Add("item/u233_fuel_rod: ring pixel at $x,$y") }
    }
}
if ($problems.Count -gt 0) { $problems | Select-Object -First 20 | ForEach-Object { Write-Error $_ -ErrorAction Continue }; exit 1 }

Write-Host "$ScriptName wrote $($written.Count) files"
if ($Credits) {
    foreach ($w in $written) { Write-Host "| pack/kubejs/assets/grindless/textures/$w | drawn procedurally by tools/assets/$ScriptName | ours |" }
}
