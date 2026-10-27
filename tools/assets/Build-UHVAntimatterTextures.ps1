<#
.SYNOPSIS
  Procedural 16x16 pixel art for the UHV positron accumulator and Casimir array controller faces, and the seven items of the UHV-A6
  package, of Gregtech Grindless.

.DESCRIPTION
  Every pixel is drawn by this script (palettes and small routines); nothing is copied or edited from GregTech Modern or any
  other mod. Output is deterministic. Same method and steel bezel as the earlier sets (Build-UHVPowerDevicesTextures.ps1).

  Writes (under pack/kubejs/assets/grindless/textures/):
    block/multiblock/positron_accumulator/overlay_front.png, overlay_front_active.png(+.mcmeta), overlay_front_active_emissive.png(+.mcmeta)
    block/multiblock/casimir_array/ the same three files
    item/magnesium_target.png, sodium_22_target.png, moderated_positron_source.png, spent_positron_source.png, empty_penning_trap.png,
    casimir_cavity_stack.png, worn_casimir_cavity_stack.png

  Accumulator face: a bezel round a beamline window: the solenoid's windings above and below the bore, the source at its left end.
  Working (4 frames, frametime 4), the windings glow, a packet of positrons runs along the bore two pixels a frame and the source
  glows; the run lamp is green.
  Array face: a bezel round a cryostat window holding a stack of four mirror plates. Working (4 frames, frametime 4), a violet
  shimmer climbs the gaps between the plates. The *_emissive layer holds only the glow and the lamp.

  Conventions: transparent background, outer 1 px ring of the faces empty, every pixel fully opaque or fully transparent, none pure
  black, emissive layer a subset of the colour layer. The final check fails the run (non-zero exit) if a written file breaks one.

  Run from the repo root:
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-UHVAntimatterTextures.ps1

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
    if ($Kind -eq 'accumulator') {
        # the solenoid's windings on rows 4-5 and 8-9 (x5..11), the bore on rows 6-7, the source block at x4 rows 6-7
        for ($x = 5; $x -le 11; $x++) {
            foreach ($y in 4, 5, 8, 9) {
                $even = (($x + $y) % 2) -eq 0
                if ($Active -and $even) { Set-Both $c $e $x $y (Hex '5AB8FF') } elseif ($even) { Set-Px $c $x $y (Hex '6A7A9A') } else { Set-Px $c $x $y (Hex '3A4660') }
            }
        }
        Set-Px $c 4 6 (Hex 'C8A040'); Set-Px $c 4 7 (Hex 'C8A040')
        if ($Active) {
            Set-Both $c $e 4 6 (Hex 'FFD870'); Set-Both $c $e 4 7 (Hex 'FFD870')
            # the positron packet runs along the bore
            $px = 5 + 2 * $Frame
            Set-Both $c $e $px 6 (Hex 'FF9AE0'); Set-Both $c $e $px 7 (Hex 'FF9AE0')
            Set-Both $c $e ($px + 1) 6 (Hex 'FFD8F4'); Set-Both $c $e ($px + 1) 7 (Hex 'FFD8F4')
        }
    }
    else {
        # four mirror plates (x5..10) on rows 4, 6, 8 and their gaps on rows 5, 7, 9; the cryostat walls on columns 4 and 11
        for ($y = 4; $y -le 9; $y++) { Set-Px $c 4 $y (Hex '5A6A7A'); Set-Px $c 11 $y (Hex '5A6A7A') }
        foreach ($y in 4, 6, 8) { for ($x = 5; $x -le 10; $x++) { Set-Px $c $x $y (Hex 'B8A878') } }
        if ($Active) {
            $gap = @(9, 7, 5)[$Frame % 3]
            for ($x = 5; $x -le 10; $x++) { if ((($x + $Frame) % 2) -eq 0) { Set-Both $c $e $x $gap (Hex 'C07AFF') } }
            Set-Both $c $e (5 + $Frame) 4 (Hex 'F0E8C0')
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

$kinds = @(@{ Kind = 'accumulator'; Dir = 'block/multiblock/positron_accumulator' }, @{ Kind = 'array'; Dir = 'block/multiblock/casimir_array' })
foreach ($k in $kinds) {
    $idle = New-Face $k.Kind 0 $false
    Out-Tex $idle.C "$($k.Dir)/overlay_front.png"
    $col = @(); $emi = @()
    for ($f = 0; $f -lt $Frames; $f++) { $a = New-Face $k.Kind $f $true; $col += , $a.C; $emi += , $a.E }
    Out-Tex (Join-Frames $col) "$($k.Dir)/overlay_front_active.png" $FrameTime
    Out-Tex (Join-Frames $emi) "$($k.Dir)/overlay_front_active_emissive.png" $FrameTime
}

# ---------------------------------------------------------------- items

# A round target disc: K outline, W lit edge, D shaded edge (the backing); every B cell is replaced by $Fill (x, y) -> palette char.
$DiscBase = @(
    '................',
    '................',
    '.....KKKKKK.....',
    '....KWWWWWWK....',
    '...KWBBBBBBDK...',
    '..KWBBBBBBBBDK..',
    '..KWBBBBBBBBDK..',
    '..KWBBBBBBBBDK..',
    '..KWBBBBBBBBDK..',
    '..KWBBBBBBBBDK..',
    '..KWBBBBBBBBDK..',
    '...KDBBBBBBDK...',
    '....KDDDDDDK....',
    '.....KKKKKK.....',
    '................',
    '................'
)
# A square slab: K outline (x2..13, y2..13), W lit top-left edge, D shaded bottom-right edge; B cells go through $Fill.
$DieBase = @(
    '................',
    '................',
    '..KKKKKKKKKKKK..',
    '..KWWWWWWWWWWK..',
    '..KWBBBBBBBBDK..',
    '..KWBBBBBBBBDK..',
    '..KWBBBBBBBBDK..',
    '..KWBBBBBBBBDK..',
    '..KWBBBBBBBBDK..',
    '..KWBBBBBBBBDK..',
    '..KWBBBBBBBBDK..',
    '..KWBBBBBBBBDK..',
    '..KDDDDDDDDDDK..',
    '..KKKKKKKKKKKK..',
    '................',
    '................'
)
# A can standing on end: K outline, T its top face, W lit side, D shaded side; B cells go through $Fill.
$CanBase = @(
    '................',
    '.....KKKKKK.....',
    '....KTTTTTTK....',
    '....KKTTTTKK....',
    '....KWBBBBDK....',
    '....KWBBBBDK....',
    '....KWBBBBDK....',
    '....KWBBBBDK....',
    '....KWBBBBDK....',
    '....KWBBBBDK....',
    '....KWBBBBDK....',
    '....KWBBBBDK....',
    '....KWBBBBDK....',
    '....KDDDDDDK....',
    '.....KKKKKK.....',
    '................'
)
function Get-FilledMap {
    param([string[]]$Base, [scriptblock]$Fill)
    $out = @()
    for ($y = 0; $y -lt $Base.Count; $y++) {
        $row = ''
        for ($x = 0; $x -lt $Base[$y].Length; $x++) {
            $ch = $Base[$y][$x]
            if ($ch -eq 'B') { $row += [string](& $Fill $x $y) } else { $row += [string]$ch }
        }
        $out += $row
    }
    return , $out
}
# the disc's centre (x6..9, y6..9) and its ring
function Test-Centre { param([int]$X, [int]$Y) return ($X -ge 6 -and $X -le 9 -and $Y -ge 6 -and $Y -le 9) }

$Copper = 'K=4A2614 W=E0A070 D=8A4A28'
$items = @(
    # silver magnesium pressed on a copper backing, with a glint (G)
    @{ Name = 'magnesium_target'; Pal = "$Copper B=B87A4A M=C8CCD4 G=F0F2F8"
        Map = (Get-FilledMap $DiscBase { param($x, $y) if ($x -eq 6 -and $y -eq 6) { 'G' } elseif (Test-Centre $x $y) { 'M' } else { 'B' } }) },
    # the activated spot (A, sodium-22) in the middle of the magnesium
    @{ Name = 'sodium_22_target'; Pal = "$Copper B=B87A4A M=C8CCD4 A=F0C040 H=FFF0A0"
        Map = (Get-FilledMap $DiscBase { param($x, $y) if (($x -eq 7 -or $x -eq 8) -and ($y -eq 7 -or $y -eq 8)) { $(if ($x -eq 7 -and $y -eq 7) { 'H' } else { 'A' }) } elseif (Test-Centre $x $y) { 'M' } else { 'B' } }) },
    # the source under a pale pink film of solid neon (N), the spot showing through
    @{ Name = 'moderated_positron_source'; Pal = "$Copper B=B87A4A N=F0B8C8 A=F0C040 P=FFD8E4"
        Map = (Get-FilledMap $DiscBase { param($x, $y) if (($x -eq 7 -or $x -eq 8) -and ($y -eq 7 -or $y -eq 8)) { 'A' } elseif (($x + $y) -eq 11 -and $x -ge 4 -and $x -le 6) { 'P' } elseif ((Test-Centre $x $y) -or ($x -ge 4 -and $x -le 11 -and $y -ge 5 -and $y -le 10)) { 'N' } else { 'B' } }) },
    # dull and darkened: the film gone in patches (S), the spot burnt out (X)
    @{ Name = 'spent_positron_source'; Pal = 'K=3A2A20 W=8A7060 D=5A4030 B=6A5444 S=8A8078 X=4A4440'
        Map = (Get-FilledMap $DiscBase { param($x, $y) if (($x -eq 7 -or $x -eq 8) -and ($y -eq 7 -or $y -eq 8)) { 'X' } elseif ((($x * 3 + $y) % 5) -eq 0 -and $y -ge 5 -and $y -le 10) { 'S' } else { 'B' } }) },
    # a titanium can with gold electrode bands (G) round it
    @{ Name = 'empty_penning_trap'; Pal = 'K=3A3E48 W=D0D4DC T=B0B4C0 D=6A707C B=9AA0AC G=E8C050'
        Map = (Get-FilledMap $CanBase { param($x, $y) if ($y -eq 5 -or $y -eq 8 -or $y -eq 11) { 'G' } else { 'B' } }) },
    # four golden-grey NbN plates (P) with dark gaps (V) between them, a faint violet edge (E) at each gap's end
    @{ Name = 'casimir_cavity_stack'; Pal = 'K=2A2A34 W=C8C0A8 D=5A5648 P=B8A878 V=1E1A2A E=8A5AC0'
        Map = (Get-FilledMap $DieBase { param($x, $y) if (($y % 2) -eq 0) { 'P' } elseif ($x -eq 11) { 'E' } else { 'V' } }) },
    # the same plates dulled (P) and pitted (X)
    @{ Name = 'worn_casimir_cavity_stack'; Pal = 'K=2A2A34 W=9A9488 D=4A4840 P=7A7464 V=1E1A2A X=3A3630'
        Map = (Get-FilledMap $DieBase { param($x, $y) if (($y % 2) -eq 0) { $(if ((($x + $y * 2) % 5) -eq 0) { 'X' } else { 'P' }) } else { 'V' } }) }
)
foreach ($it in $items) {
    foreach ($row in $it.Map) { if ($row.Length -ne 16) { throw "$($it.Name): a map row is $($row.Length) wide" } }
    if ($it.Map.Count -ne 16) { throw "$($it.Name): the map is $($it.Map.Count) rows" }
    $c = New-Canvas
    Write-Map $c 0 0 $it.Map (New-Palette $it.Pal)
    Out-Tex $c "item/$($it.Name).png"
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
foreach ($k in $kinds) {
    $png = @{}
    foreach ($n in 'overlay_front', 'overlay_front_active', 'overlay_front_active_emissive') { $png[$n] = Read-Png (Join-Path $OutRoot ("$($k.Dir)/$n.png" -replace '/', '\')) }
    foreach ($n in $png.Keys) { Test-Pixels $png[$n] "$($k.Dir)/$n" $true }
    $col = $png['overlay_front_active']; $em = $png['overlay_front_active_emissive']
    for ($i = 0; $i -lt $col.P.Length; $i++) { if ($em.P[$i] -ne 0 -and $em.P[$i] -ne $col.P[$i]) { $problems.Add("$($k.Dir): emissive differs from colour at $i") } }
    for ($f = 0; $f -lt $Frames - 1; $f++) {
        $same = $true
        for ($i = 0; $i -lt 256; $i++) { if ($col.P[$f * 256 + $i] -ne $col.P[($f + 1) * 256 + $i]) { $same = $false; break } }
        if ($same) { $problems.Add("$($k.Dir): frame $f repeats frame $($f + 1)") }
    }
}
foreach ($it in $items) {
    $png = Read-Png (Join-Path $OutRoot ("item\$($it.Name).png"))
    Test-Pixels $png "item/$($it.Name)" $false
    $opaque = 0; foreach ($v in $png.P) { if ((($v -shr 24) -band 255) -eq 255) { $opaque++ } }
    if ($opaque -lt 40) { $problems.Add("item/$($it.Name): only $opaque opaque pixels") }
}
if ($problems.Count -gt 0) { $problems | Select-Object -First 20 | ForEach-Object { Write-Error $_ -ErrorAction Continue }; exit 1 }

Write-Host "$ScriptName wrote $($written.Count) files"
if ($Credits) {
    foreach ($w in $written) { Write-Host "| pack/kubejs/assets/grindless/textures/$w | drawn procedurally by tools/assets/$ScriptName | ours |" }
}
