<#
.SYNOPSIS
  Procedural 16x16 pixel art for the UHV organoid array controller face of Gregtech Grindless.

.DESCRIPTION
  Every pixel is drawn by this script (palettes and small routines); nothing is copied or edited from GregTech Modern or any
  other mod. Output is deterministic. Same method and steel bezel as the earlier sets (Build-UHVTranscuriumTextures.ps1).

  Writes (under pack/kubejs/assets/grindless/textures/):
    block/multiblock/organoid_array/overlay_front.png, overlay_front_active.png(+.mcmeta), overlay_front_active_emissive.png(+.mcmeta)

  Face: a dark steel bezel round a microelectrode array window; gold electrodes line the dish and a pink cortical organoid sits
  in the middle. Idle, the medium is dark, the electrodes dull and the organoid grey-pink. Working (4 frames, frametime 4), the
  organoid glows and a spike sweeps across the electrode columns in cyan; the run lamp is green.
  The *_emissive layer holds only the spike, the organoid's core and the lamp.

  Conventions: transparent background, outer 1 px ring empty, every pixel fully opaque or fully transparent, none pure black,
  emissive layer a subset of the colour layer. The final check fails the run (non-zero exit) if a written file breaks one.

  Run from the repo root:
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-UHVWetwareTextures.ps1

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
$Dir = 'block/multiblock/organoid_array'

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

# the electrode columns, left to right; the outer two run down the dish's sides, the inner two only top and bottom
$Columns = @(
    @(@(4, 4), @(4, 6), @(4, 7), @(4, 9)),
    @(@(6, 4), @(6, 9)),
    @(@(9, 4), @(9, 9)),
    @(@(11, 4), @(11, 6), @(11, 7), @(11, 9))
)
# the organoid: x6..9, y5..8 without its corners; the core is x7..8, y6..7
$Organoid = @()
for ($y = 5; $y -le 8; $y++) {
    for ($x = 6; $x -le 9; $x++) {
        if (($x -eq 6 -or $x -eq 9) -and ($y -eq 5 -or $y -eq 8)) { continue }
        $Organoid += , @($x, $y)
    }
}

function New-Face {
    param([int]$Frame, [bool]$Active)
    $c = New-Bezel
    $e = New-Canvas
    $medium = $(if ($Active) { Hex '3A2030' } else { Hex '24161E' })
    for ($y = 4; $y -le 9; $y++) { for ($x = 4; $x -le 11; $x++) { Set-Px $c $x $y $medium } }
    $gold = $(if ($Active) { Hex 'D8B040' } else { Hex '6A5A28' })
    foreach ($col in $Columns) { foreach ($p in $col) { Set-Px $c $p[0] $p[1] $gold } }
    foreach ($p in $Organoid) {
        $core = ($p[0] -eq 7 -or $p[0] -eq 8) -and ($p[1] -eq 6 -or $p[1] -eq 7)
        if ($Active) {
            if ($core) { Set-Both $c $e $p[0] $p[1] (Hex 'F4A8C0') } else { Set-Px $c $p[0] $p[1] (Hex 'C0607E') }
        }
        else {
            Set-Px $c $p[0] $p[1] $(if ($core) { Hex '7A4A5A' } else { Hex '5A3444' })
        }
    }
    if ($Active) {
        # the spike: one electrode column bright per frame, its neighbour fading behind it
        $now = $Columns[$Frame % 4]
        $prev = $Columns[($Frame + 3) % 4]
        foreach ($p in $prev) { Set-Both $c $e $p[0] $p[1] (Hex '3CB4C8') }
        foreach ($p in $now) { Set-Both $c $e $p[0] $p[1] (Hex 'C8FFFF') }
    }
    # run lamp under the window
    Set-Px $c 7 12 $(if ($Active) { $LampOn } else { $LampOff })
    Set-Px $c 8 12 $(if ($Active) { $LampOn } else { $LampOff })
    if ($Active) { Set-Px $e 7 12 $LampOn; Set-Px $e 8 12 $LampOn }
    # nothing may sit on the outer ring
    for ($i = 0; $i -lt 16; $i++) { foreach ($p in @(@($i, 0), @($i, 15), @(0, $i), @(15, $i))) { Set-Px $c $p[0] $p[1] 0; Set-Px $e $p[0] $p[1] 0 } }
    return @{ C = $c; E = $e }
}

$idle = New-Face 0 $false
Out-Tex $idle.C "$Dir/overlay_front.png"
$col = @(); $emi = @()
for ($f = 0; $f -lt $Frames; $f++) { $a = New-Face $f $true; $col += , $a.C; $emi += , $a.E }
Out-Tex (Join-Frames $col) "$Dir/overlay_front_active.png" $FrameTime
Out-Tex (Join-Frames $emi) "$Dir/overlay_front_active_emissive.png" $FrameTime

# self-check: ring empty, alpha 0 or 255, nothing pure black, emissive a subset of the colour layer, no two frames alike
$problems = New-Object System.Collections.Generic.List[string]
$png = @{}
foreach ($n in 'overlay_front', 'overlay_front_active', 'overlay_front_active_emissive') { $png[$n] = Read-Png (Join-Path $OutRoot ("$Dir/$n.png" -replace '/', '\')) }
foreach ($n in $png.Keys) {
    $c = $png[$n]
    for ($y = 0; $y -lt $c.H; $y++) {
        for ($x = 0; $x -lt $c.W; $x++) {
            $v = $c.P[$y * $c.W + $x]; $a = ($v -shr 24) -band 255
            $ring = ((($x % 16) -eq 0) -or (($x % 16) -eq 15) -or (($y % 16) -eq 0) -or (($y % 16) -eq 15))
            if ($a -ne 0 -and $a -ne 255) { $problems.Add("$Dir/${n}: partial alpha at $x,$y") }
            if ($a -eq 255 -and ($v -band 0xFFFFFF) -eq 0) { $problems.Add("$Dir/${n}: pure black at $x,$y") }
            if ($ring -and $a -ne 0) { $problems.Add("$Dir/${n}: ring pixel at $x,$y") }
        }
    }
}
$colPng = $png['overlay_front_active']; $em = $png['overlay_front_active_emissive']
for ($i = 0; $i -lt $colPng.P.Length; $i++) { if ($em.P[$i] -ne 0 -and $em.P[$i] -ne $colPng.P[$i]) { $problems.Add("${Dir}: emissive differs from colour at $i") } }
for ($f = 0; $f -lt $Frames - 1; $f++) {
    $same = $true
    for ($i = 0; $i -lt 256; $i++) { if ($colPng.P[$f * 256 + $i] -ne $colPng.P[($f + 1) * 256 + $i]) { $same = $false; break } }
    if ($same) { $problems.Add("${Dir}: frame $f repeats frame $($f + 1)") }
}
if ($problems.Count -gt 0) { $problems | Select-Object -First 20 | ForEach-Object { Write-Error $_ -ErrorAction Continue }; exit 1 }

Write-Host "$ScriptName wrote $($written.Count) files"
if ($Credits) {
    foreach ($w in $written) { Write-Host "| pack/kubejs/assets/grindless/textures/$w | drawn procedurally by tools/assets/$ScriptName | ours |" }
}
