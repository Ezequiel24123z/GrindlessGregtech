<#
.SYNOPSIS
  Procedural 16x16 pixel art for the wireless energy network of Gregtech Grindless (GregTech style: top-left light, selective
  outlines, GTM's tier colours).

.DESCRIPTION
  Every pixel is drawn by this script (palettes + small geometry routines); nothing is copied or edited from GregTech Modern or any
  other mod. Output is deterministic: re-running overwrites the same bytes.

  The network's look, at a glance: a mast with amber arcs going out = EU into the network (dynamo hatch, dynamo cover); a dish with
  cyan arcs coming in = EU out of it (energy hatch, energy cover); the tower's cells glow in their tier's colour.

  Writes (under pack/kubejs/assets/grindless/textures/):
    block/machines/wireless/hatch.png, hatch_emissive.png(+.mcmeta)      the wireless energy hatch's front: a round port with a small dish,
                                                                         the signal coming in (cyan, animated, full-bright)
    block/machines/wireless/dynamo.png, dynamo_emissive.png(+.mcmeta)    the wireless dynamo hatch's front: the port with a small mast and
                                                                         a beacon, the signal going out (amber)
    block/machines/wireless/port_<2|4|16|64>a_tinted.png                 the port's inner ring and the amperage pips under it (1 to 4),
                                                                         light grey: GTM tints them with the tier's colour (tint index 2,
                                                                         EnergyHatchPartMachine#tintColor). The block models
                                                                         (models/block/machines/wireless/<kind>_<amps>a.json) stack the hull,
                                                                         this tinted layer, the art and the emissive layer, GTM's energy
                                                                         hatch layout.
    block/cover/wireless_<energy|dynamo>_cover_<tier>.png                 the covers on a machine's face (SimpleCoverRenderer): a frame in
                                                                         the tier's colour round the dish or the mast
    block/cover/wireless_<energy|dynamo>_cover_emissive.png(+.mcmeta)    their signal (one per kind, every tier)
    item/wireless/<energy|dynamo>_cover_<tier>.png                       the cover items: a steel plate with the frame and the symbol
    block/wireless/capacitor_cell_<tier>.png                             the tower's cells: a steel frame round three capacitor stacks in
                                                                         the tier's colour
    block/multiblock/wireless_energy_tower/overlay_front.png, overlay_front_active.png(+.mcmeta) and
    overlay_front_active_emissive.png(+.mcmeta)                          the tower controller: a gauge of stacked cells under a small mast
  Tier colours: GTM's (GTValues.VNF: LV grey, MV aqua, HV gold, EV purple, IV blue).

  Run from the repo root (PowerShell 5.1 blocks unsigned scripts by default; this bypass only affects that process):
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-WirelessEnergyTextures.ps1
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-WirelessEnergyTextures.ps1 -Only cells -Credits

  Conventions (same as the other sets): transparent background, every pixel fully opaque or fully transparent, no pure black,
  animated textures are vertical 16x(16*n) strips with a .png.mcmeta.

.PARAMETER OutRoot
  Textures root. Default: <repo>/pack/kubejs/assets/grindless/textures
.PARAMETER Only
  Subset of: hatches, covers, items, cells, tower. Default: everything.
.PARAMETER Credits
  Also print the CREDITS.md "Assets" table rows for the files written.
#>
[CmdletBinding()]
param(
    [string]$OutRoot = '',
    [string[]]$Only = @(),
    [switch]$Credits
)
$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'Pixel.Lib.ps1')

if (-not $OutRoot) { $OutRoot = Join-Path $PSScriptRoot '..\..\pack\kubejs\assets\grindless\textures' }
$OutRoot = [System.IO.Path]::GetFullPath($OutRoot)
$ScriptName = Split-Path -Leaf $PSCommandPath
$Want = @($Only | ForEach-Object { $_ -split ',' } | ForEach-Object { $_.Trim().ToLowerInvariant() } | Where-Object { $_ -ne '' })
function Test-Want { param([string]$Name) return ($Want.Count -eq 0 -or $Want -contains $Name) }

$written = New-Object System.Collections.Generic.List[string]
function Out-Tex {
    param($Canvas, [string]$Rel, [int]$FrameTime = 0)
    $path = Join-Path $OutRoot ($Rel -replace '/', '\')
    $dir = Split-Path -Parent $path
    if (-not (Test-Path -LiteralPath $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
    # an editor, indexer or virus scanner can hold a file for a moment: retry the write a few times
    for ($try = 1; $try -le 6; $try++) {
        try { Save-Png $Canvas $path; if ($FrameTime -gt 0) { Save-Mcmeta ($path + '.mcmeta') $FrameTime }; break }
        catch [System.IO.IOException] { if ($try -eq 6) { throw }; Start-Sleep -Milliseconds (250 * $try) }
    }
    $written.Add($Rel)
    if ($FrameTime -gt 0) { $written.Add($Rel + '.mcmeta') }
}

# Like New-Palette, but a repeated letter is an error instead of a silent overwrite.
function New-Pal {
    param([string]$Spec)
    $pal = New-Object 'System.Collections.Generic.Dictionary[string,int]' ([System.StringComparer]::Ordinal)
    foreach ($tok in ($Spec -split '\s+')) {
        if ($tok -eq '') { continue }
        $kv = $tok -split '=', 2
        if ($pal.ContainsKey($kv[0])) { throw "Palette letter '$($kv[0])' defined twice" }
        $pal[$kv[0]] = Hex $kv[1]
    }
    return $pal
}

#   A..E  steel, lit -> dark;  K/k the mast's beacon (lit, shaded)
#   Y/y/z amber signal: bright, mid, dim (EU going out);  Q/q/p cyan signal: bright, mid, dim (EU coming in)
#   T/U/V the tinted layer, light grey (GTM multiplies it by the tier's colour): lit, mid, shaded
#   P/O   a port's dark ring and the darker field inside
$Pal = New-Pal @'
A=EEF1F6 B=C6CDD8 C=98A2B2 D=687282 E=474E5B
K=FF7A4A k=C84A2C
Y=FFE27E y=F2AE3C z=9C6C28
Q=AEFAFF q=4AD4F0 p=257C90
T=F6F6F6 U=CACACA V=9C9C9C
P=3A3F49 O=262A31
'@

# GTM's tier colours (GTValues.VNF): the bright tone; Get-TierRamp derives the rest
$TierColour = @{ lv = 'B8B8B8'; mv = '4FE6EE'; hv = 'F5A623'; ev = 'B04AD6'; iv = '5A6CF2' }
$TierNames = @('lv', 'mv', 'hv', 'ev', 'iv')

# 0 highlight, 1 bright, 2 mid, 3 dark, 4 darkest
function Get-TierRamp {
    param([string]$Tier)
    $base = Hex $TierColour[$Tier]
    return @((Mix $base (Hex 'FFFFFF') 0.55), $base, (Shade $base 0.78), (Shade $base 0.55), (Shade $base 0.36))
}

function Get-ClampInt { param([int]$V, [int]$Lo, [int]$Hi) return [Math]::Max($Lo, [Math]::Min($Hi, $V)) }

# the pixels of an arc: centre ($Cx, $Cy) in pixel units (pixel centres at x + 0.5), radius $R (half a pixel either side), the part of
# the circle within $Half degrees of $Dir (screen angles: 0 = right, 90 = down), inside the box
function Get-Arc {
    param([double]$Cx, [double]$Cy, [double]$R, [double]$Dir, [double]$Half, [int]$X0 = 0, [int]$Y0 = 0, [int]$X1 = 15, [int]$Y1 = 15)
    $out = New-Object System.Collections.Generic.List[object]
    for ($y = $Y0; $y -le $Y1; $y++) { for ($x = $X0; $x -le $X1; $x++) {
        $dx = ($x + 0.5) - $Cx; $dy = ($y + 0.5) - $Cy
        $d = [Math]::Sqrt($dx * $dx + $dy * $dy)
        if ([Math]::Abs($d - $R) -gt 0.5) { continue }
        $deg = [Math]::Atan2($dy, $dx) * 180.0 / [Math]::PI
        $diff = [Math]::Abs((($deg - $Dir) % 360.0 + 540.0) % 360.0 - 180.0)
        if ($diff -le $Half) { $out.Add(@($x, $y)) }
    } }
    return ,$out
}

function Set-Pixels {
    param($C, $Pixels, [int]$Argb)
    foreach ($p in $Pixels) { Set-Px $C $p[0] $p[1] $Argb }
}

# a 1-pixel line (Bresenham)
function Add-Line {
    param($C, [int]$X0, [int]$Y0, [int]$X1, [int]$Y1, [int]$Argb)
    $dx = [Math]::Abs($X1 - $X0); $sx = if ($X0 -lt $X1) { 1 } else { -1 }
    $dy = - [Math]::Abs($Y1 - $Y0); $sy = if ($Y0 -lt $Y1) { 1 } else { -1 }
    $err = $dx + $dy
    while ($true) {
        Set-Px $C $X0 $Y0 $Argb
        if ($X0 -eq $X1 -and $Y0 -eq $Y1) { break }
        $e2 = 2 * $err
        if ($e2 -ge $dy) { $err += $dy; $X0 += $sx }
        if ($e2 -le $dx) { $err += $dx; $Y0 += $sy }
    }
}

# keeps only the arc pixels that land on an empty pixel of $Art (the signal never covers the symbol)
function Select-Free {
    param($Art, $Pixels)
    $out = New-Object System.Collections.Generic.List[object]
    foreach ($p in $Pixels) { if ((Get-Px $Art $p[0] $p[1]) -eq 0) { $out.Add($p) } }
    return ,$out
}

# ============================================================================================
#  SYMBOLS: the mast (EU going out) and the dish (EU coming in), in a box; each returns @{ art; arcs (inner first); spot }
# ============================================================================================
# the mast: two legs from a spire out to the feet, rungs, a beacon on top, arcs on both sides of the beacon
function New-Mast {
    param([int]$Top, [int]$Bottom, [double]$Spread, [int[]]$Rungs, [double[]]$Radii, [int[]]$Box)
    $c = New-Canvas
    for ($y = $Top; $y -le $Bottom; $y++) {
        $t = ($y - $Top) / [double]($Bottom - $Top)
        Set-Px $c ([int][Math]::Round(7 - $t * $Spread)) $y $Pal['B']
        Set-Px $c ([int][Math]::Round(8 + $t * $Spread)) $y $Pal['D']
    }
    foreach ($y in $Rungs) {
        $t = ($y - $Top) / [double]($Bottom - $Top)
        $xl = [int][Math]::Round(7 - $t * $Spread); $xr = [int][Math]::Round(8 + $t * $Spread)
        for ($x = $xl + 1; $x -lt $xr; $x++) { Set-Px $c $x $y $Pal['C'] }
    }
    Set-Px $c 7 ($Top - 1) $Pal['A']; Set-Px $c 8 ($Top - 1) $Pal['C']
    Set-Px $c 7 ($Top - 2) $Pal['K']; Set-Px $c 8 ($Top - 2) $Pal['k']
    $cy = $Top - 1.5
    $arcs = @()
    foreach ($r in $Radii) {
        $all = New-Object System.Collections.Generic.List[object]
        foreach ($side in 180, 0) { foreach ($p in (Get-Arc 8.0 $cy $r $side 42 $Box[0] $Box[1] $Box[2] $Box[3])) { $all.Add($p) } }
        $arcs += ,(Select-Free $c $all)
    }
    return @{ art = $c; arcs = $arcs; spot = @(@(7, ($Top - 2)), @(8, ($Top - 2))) }
}

# the dish: a dish face (a cap of a disc, opening to the upper right: its rim dark, its face lit from the top left), a feed arm to a
# horn at the focus, a post under it, arcs coming onto the horn from the upper right
function New-Dish {
    param([double]$Cx, [double]$Cy, [double]$R, [double]$Half, [double]$Feed, [double[]]$Radii, [int[]]$Box, [int[]]$Post)
    $c = New-Canvas
    $ux = [Math]::Cos(135 * [Math]::PI / 180); $uy = [Math]::Sin(135 * [Math]::PI / 180)
    $cut = $R * [Math]::Cos($Half * [Math]::PI / 180)
    for ($y = 0; $y -le 15; $y++) { for ($x = 0; $x -le 15; $x++) {
        $dx = ($x + 0.5) - $Cx; $dy = ($y + 0.5) - $Cy
        $d = [Math]::Sqrt($dx * $dx + $dy * $dy)
        $p = $dx * $ux + $dy * $uy
        if ($d -gt $R + 0.35 -or $p -lt $cut) { continue }
        if ($d -gt $R - 1.0) { Set-Px $c $x $y $(if ($p -lt $cut + 0.9) { $Pal['E'] } else { $Pal['D'] }) }
        else {
            $lit = ($dx + $dy)
            Set-Px $c $x $y $(if ($p -lt $cut + 0.9) { $Pal['C'] } elseif ($lit -lt -1.0) { $Pal['A'] } else { $Pal['B'] })
        }
    } }
    # the feed: from the middle of the dish face towards the centre, a horn at its end
    $bx = $Cx + ($R - 1.2) * $ux; $by = $Cy + ($R - 1.2) * $uy
    $fx = $bx - $Feed * $ux; $fy = $by - $Feed * $uy
    $x1 = [int][Math]::Floor($fx); $y1 = [int][Math]::Floor($fy)
    Add-Line $c ([int][Math]::Floor($bx - 0.8 * $ux)) ([int][Math]::Floor($by - 0.8 * $uy)) $x1 $y1 $Pal['C']
    Set-Px $c $x1 $y1 $Pal['q']
    for ($y = $Post[1]; $y -le $Post[2]; $y++) { Set-Px $c $Post[0] $y $Pal['C']; Set-Px $c ($Post[0] + 1) $y $Pal['D'] }
    $arcs = @()
    foreach ($r in $Radii) { $arcs += ,(Select-Free $c (Get-Arc ($x1 + 0.5) ($y1 + 0.5) $r -45 40 $Box[0] $Box[1] $Box[2] $Box[3])) }
    return @{ art = $c; arcs = $arcs; spot = ,@($x1, $y1) }
}

# the signal frames: one arc lit after the other in $Order, the arc before it fading, the spot (beacon or horn) lit; the last frame
# lights only the spot
function New-SignalFrames {
    param($Sym, [int[]]$Order, [string]$Bright, [string]$Mid, [string]$Spot)
    $frames = @()
    $n = $Order.Count
    for ($f = 0; $f -le $n; $f++) {
        $c = New-Canvas
        if ($f -lt $n) { Set-Pixels $c $Sym.arcs[$Order[$f]] $Pal[$Bright] }
        if ($f -ge 1) { Set-Pixels $c $Sym.arcs[$Order[$f - 1]] $Pal[$Mid] }
        foreach ($p in $Sym.spot) { Set-Px $c $p[0] $p[1] $(if ($f -eq $n) { $Pal[$Spot] } else { $Pal[$Bright] }) }
        $frames += $c
    }
    return ,$frames
}

# the symbols in the hatch port (inside 5..10) and on a cover / item (inside 3..12)
function New-SmallMast { return New-Mast 7 10 1.5 @(9) @(1.8, 2.9) @(5, 4, 10, 10) }
function New-SmallDish { return New-Dish 9.2 5.8 3.8 64 1.4 @(1.6, 2.7) @(5, 4, 10, 10) @(6, 10, 10) }
function New-MidMast { return New-Mast 6 12 2.2 @(9, 11) @(2.4, 3.8) @(3, 2, 12, 9) }
function New-MidDish { return New-Dish 10.4 4.8 6.0 62 2.2 @(2.2, 3.6) @(3, 2, 12, 11) @(5, 11, 12) }

# ============================================================================================
#  THE HATCHES: a round port 10 across (3..12) on the front; its outer ring dark steel (art), its inner ring and the amperage pips
#  under it in the tier's colour (tinted layer), a dark field inside with the symbol
# ============================================================================================
function New-PortArt {
    $c = New-Canvas
    for ($y = 3; $y -le 12; $y++) { for ($x = 3; $x -le 12; $x++) {
        $edge = ($x -eq 3 -or $x -eq 12 -or $y -eq 3 -or $y -eq 12)
        if (($x -eq 3 -or $x -eq 12) -and ($y -eq 3 -or $y -eq 12)) { continue }
        if ($edge) { Set-Px $c $x $y $(if ($x -eq 3 -or $y -eq 3) { $Pal['D'] } else { $Pal['E'] }) }
        elseif (-not ($x -eq 4 -or $x -eq 11 -or $y -eq 4 -or $y -eq 11)) { Set-Px $c $x $y $Pal['O'] }
    } }
    return $c
}

function New-PortTint {
    param([int]$Pips)
    $c = New-Canvas
    for ($y = 4; $y -le 11; $y++) { for ($x = 4; $x -le 11; $x++) {
        if (-not ($x -eq 4 -or $x -eq 11 -or $y -eq 4 -or $y -eq 11)) { continue }
        if (($x -eq 4 -or $x -eq 11) -and ($y -eq 4 -or $y -eq 11)) { continue }
        Set-Px $c $x $y $(if ($x -eq 4 -or $y -eq 4) { $Pal['T'] } elseif ($x -eq 11 -and $y -eq 11) { $Pal['V'] } else { $Pal['U'] })
    } }
    # the amperage: 1 to 4 pips, two pixels wide, centred under the port
    $width = $Pips * 2 + ($Pips - 1)
    $x0 = 8 - [int][Math]::Ceiling($width / 2.0)
    for ($i = 0; $i -lt $Pips; $i++) {
        $x = $x0 + $i * 3
        Set-Px $c $x 14 $Pal['T']; Set-Px $c ($x + 1) 14 $Pal['U']
    }
    return $c
}

function New-HatchArt {
    param($Sym, [string]$Dim)
    $c = New-PortArt
    $s = Copy-Canvas $Sym.art
    foreach ($arc in $Sym.arcs) { Set-Pixels $s $arc $Pal[$Dim] }
    Merge-Canvas $c $s
    return $c
}

# ============================================================================================
#  THE COVERS AND THEIR ITEMS: a frame in the tier's colour round a dark field with the symbol
# ============================================================================================
function New-CoverFace {
    param($Sym, [string]$Dim, [string]$Tier)
    $ramp = Get-TierRamp $Tier
    $c = New-Canvas
    for ($y = 1; $y -le 14; $y++) { for ($x = 1; $x -le 14; $x++) {
        if (($x -eq 1 -or $x -eq 14) -and ($y -eq 1 -or $y -eq 14)) { continue }
        $edge = ($x -eq 1 -or $x -eq 14 -or $y -eq 1 -or $y -eq 14)
        $inner = ($x -eq 2 -or $x -eq 13 -or $y -eq 2 -or $y -eq 13)
        if ($edge) { Set-Px $c $x $y $(if ($x -eq 1 -or $y -eq 1) { $ramp[1] } else { $ramp[3] }) }
        elseif ($inner) { Set-Px $c $x $y $(if ($x -eq 2 -or $y -eq 2) { $ramp[3] } else { $ramp[4] }) }
        else { Set-Px $c $x $y $Pal['O'] }
    } }
    Set-Px $c 2 2 $ramp[0]
    $s = Copy-Canvas $Sym.art
    foreach ($arc in $Sym.arcs) { Set-Pixels $s $arc $Pal[$Dim] }
    Merge-Canvas $c $s
    return $c
}

# the item: a steel plate (lit top-left), the tier's frame, the symbol; outlined
function New-CoverItem {
    param($Sym, [string]$Dim, [string]$Tier)
    $ramp = Get-TierRamp $Tier
    $c = New-Canvas
    for ($y = 2; $y -le 13; $y++) { for ($x = 2; $x -le 13; $x++) {
        $edge = ($x -eq 2 -or $x -eq 13 -or $y -eq 2 -or $y -eq 13)
        if ($edge) { Set-Px $c $x $y $(if ($x -eq 2 -or $y -eq 2) { $ramp[1] } else { $ramp[3] }) }
        elseif ($x -eq 3 -or $y -eq 3) { Set-Px $c $x $y $Pal['B'] }
        elseif ($x -eq 12 -or $y -eq 12) { Set-Px $c $x $y $Pal['D'] }
        else { Set-Px $c $x $y $Pal['O'] }
    } }
    Set-Px $c 2 2 $ramp[0]
    $s = Copy-Canvas $Sym.art
    foreach ($arc in $Sym.arcs) { Set-Pixels $s $arc $Pal[$Dim] }
    foreach ($p in $Sym.spot) { Set-Px $s $p[0] $p[1] $(if ($Dim -eq 'z') { $Pal['K'] } else { $Pal['Q'] }) }
    # the symbol stays inside the plate's field
    for ($y = 0; $y -le 15; $y++) { for ($x = 0; $x -le 15; $x++) { if ($x -lt 4 -or $x -gt 11 -or $y -lt 4 -or $y -gt 11) { Set-Px $s $x $y 0 } } }
    Merge-Canvas $c $s
    Add-Outline $c -LitArgb (Hex '565C68') -ShadeArgb (Hex '2C3038')
    return $c
}

# ============================================================================================
#  THE CELLS: a steel frame (lit top-left) round three capacitor stacks in the tier's colour, each with a bright core and terminals
# ============================================================================================
function New-Cell {
    param([string]$Tier)
    $ramp = Get-TierRamp $Tier
    $c = New-Canvas
    for ($y = 0; $y -le 15; $y++) { for ($x = 0; $x -le 15; $x++) {
        $border = ($x -le 1 -or $x -ge 14 -or $y -le 1 -or $y -ge 14)
        if ($border) {
            $tone = if ($x -eq 0 -or $y -eq 0) { 'B' } elseif ($x -eq 15 -or $y -eq 15) { 'E' } elseif ($x -eq 1 -or $y -eq 1) { 'C' } else { 'D' }
            Set-Px $c $x $y $Pal[$tone]
        } else { Set-Px $c $x $y $Pal['O'] }
    } }
    # bolts in the corners
    foreach ($p in @(@(1, 1), @(14, 1), @(1, 14), @(14, 14))) { Set-Px $c $p[0] $p[1] $Pal['A'] }
    # three stacks, each 3 wide: x 3..5, 7..9 (wait: 6..8 keeps them centred), 10..12; rows 3..12, a terminal cap on top
    foreach ($x0 in 3, 7, 11) {
        for ($y = 4; $y -le 12; $y++) {
            Set-Px $c $x0 $y $ramp[2]
            Set-Px $c ($x0 + 1) $y $(if (($y % 3) -eq 0) { $ramp[3] } else { $ramp[1] })
            if ($x0 + 2 -le 13) { Set-Px $c ($x0 + 2) $y $ramp[3] }
        }
        Set-Px $c ($x0 + 1) 6 $ramp[0]; Set-Px $c ($x0 + 1) 9 $ramp[0]
        Set-Px $c $x0 3 $Pal['C']; Set-Px $c ($x0 + 1) 3 $Pal['A']; if ($x0 + 2 -le 13) { Set-Px $c ($x0 + 2) 3 $Pal['D'] }
    }
    return $c
}

# ============================================================================================
#  THE TOWER CONTROLLER: a dark screen with a gauge of stacked cells and a small mast on top of it
# ============================================================================================
function New-TowerFront {
    param([int]$Level, [switch]$EmissiveOnly)
    $ramp = Get-TierRamp 'mv'
    $c = New-Canvas
    if (-not $EmissiveOnly) {
        for ($y = 5; $y -le 14; $y++) { for ($x = 3; $x -le 12; $x++) {
            $edge = ($x -eq 3 -or $x -eq 12 -or $y -eq 5 -or $y -eq 14)
            if ($edge) { Set-Px $c $x $y $(if ($x -eq 3 -or $y -eq 5) { $Pal['C'] } else { $Pal['E'] }) } else { Set-Px $c $x $y $Pal['O'] }
        } }
        # the mast over the screen
        Set-Px $c 7 1 $Pal['K']; Set-Px $c 8 1 $Pal['k']
        for ($y = 2; $y -le 4; $y++) { Set-Px $c 7 $y $Pal['B']; Set-Px $c 8 $y $Pal['D'] }
        Set-Px $c 6 4 $Pal['C']; Set-Px $c 9 4 $Pal['D']
    }
    # the gauge: four bars from the bottom; $Level of them lit (0..4), the rest dim
    for ($b = 0; $b -lt 4; $b++) {
        $y = 12 - $b * 2
        $lit = ($b -lt $Level)
        for ($x = 5; $x -le 10; $x++) {
            if ($EmissiveOnly) { if ($lit) { Set-Px $c $x $y $(if ($x -eq 5) { $ramp[0] } else { $ramp[1] }) } }
            else { Set-Px $c $x $y $(if ($lit) { $(if ($x -eq 5) { $ramp[0] } else { $ramp[1] }) } else { $ramp[4] }) }
        }
    }
    return $c
}

# ============================================================================================
#  BUILD
# ============================================================================================
$Dir = 'block/machines/wireless'

if (Test-Want 'hatches') {
    $d = New-SmallDish
    Out-Tex (New-HatchArt $d 'p') "$Dir/hatch.png"
    Out-Tex (Join-Frames (New-SignalFrames $d @(1, 0) 'Q' 'q' 'Q')) "$Dir/hatch_emissive.png" 5
    $m = New-SmallMast
    Out-Tex (New-HatchArt $m 'z') "$Dir/dynamo.png"
    Out-Tex (Join-Frames (New-SignalFrames $m @(0, 1) 'Y' 'y' 'K')) "$Dir/dynamo_emissive.png" 5
    $pips = @{ 2 = 1; 4 = 2; 16 = 3; 64 = 4 }
    foreach ($a in 2, 4, 16, 64) { Out-Tex (New-PortTint $pips[$a]) "$Dir/port_$($a)a_tinted.png" }
}

if (Test-Want 'covers') {
    $d = New-MidDish
    $m = New-MidMast
    foreach ($t in $TierNames) {
        Out-Tex (New-CoverFace $d 'p' $t) "block/cover/wireless_energy_cover_$t.png"
        Out-Tex (New-CoverFace $m 'z' $t) "block/cover/wireless_dynamo_cover_$t.png"
    }
    Out-Tex (Join-Frames (New-SignalFrames $d @(1, 0) 'Q' 'q' 'Q')) 'block/cover/wireless_energy_cover_emissive.png' 5
    Out-Tex (Join-Frames (New-SignalFrames $m @(0, 1) 'Y' 'y' 'K')) 'block/cover/wireless_dynamo_cover_emissive.png' 5
}

if (Test-Want 'items') {
    $d = New-SmallDish
    $m = New-SmallMast
    foreach ($t in $TierNames) {
        Out-Tex (New-CoverItem $d 'p' $t) "item/wireless/energy_cover_$t.png"
        Out-Tex (New-CoverItem $m 'z' $t) "item/wireless/dynamo_cover_$t.png"
    }
}

if (Test-Want 'cells') {
    foreach ($t in $TierNames) { Out-Tex (New-Cell $t) "block/wireless/capacitor_cell_$t.png" }
}

if (Test-Want 'tower') {
    $tdir = 'block/multiblock/wireless_energy_tower'
    Out-Tex (New-TowerFront 2) "$tdir/overlay_front.png"
    $active = @(); $emissive = @()
    foreach ($lv in 1, 2, 3, 4) { $active += New-TowerFront $lv; $emissive += New-TowerFront $lv -EmissiveOnly }
    Out-Tex (Join-Frames $active) "$tdir/overlay_front_active.png" 6
    Out-Tex (Join-Frames $emissive) "$tdir/overlay_front_active_emissive.png" 6
}

# ============================================================================================
#  VERIFY what was written (size, binary alpha, no pure black, mcmeta vs frames, an animation that really animates, a tinted layer
#  that is grey, an emissive layer that never covers grey steel of its art)
# ============================================================================================
$problems = 0
foreach ($rel in $written) {
    if ($rel.EndsWith('.mcmeta')) { continue }
    $path = Join-Path $OutRoot ($rel -replace '/', '\')
    $img = Read-Png $path
    $msgs = @()
    if ($img.W -ne 16 -or ($img.H % 16) -ne 0) { $msgs += "bad size $($img.W)x$($img.H)" }
    $opaque = 0; $black = 0; $colour = 0
    foreach ($px in $img.P) {
        $alpha = ($px -shr 24) -band 255
        if ($alpha -ne 0 -and $alpha -ne 255) { $msgs += 'partial alpha'; break }
        if ($alpha -eq 255) {
            $opaque++
            $q = Get-Rgba $px
            if ($q[0] -eq 0 -and $q[1] -eq 0 -and $q[2] -eq 0) { $black++ }
            if ($q[0] -ne $q[1] -or $q[1] -ne $q[2]) { $colour++ }
        }
    }
    if ($opaque -eq 0) { $msgs += 'fully transparent' }
    if ($black -gt 0) { $msgs += "$black pure-black px" }
    if ($rel.EndsWith('_tinted.png') -and $colour -gt 0) { $msgs += "$colour coloured px in a tinted layer (it must be grey)" }
    if (Test-Path -LiteralPath ($path + '.mcmeta')) {
        $n = [int]($img.H / 16)
        if ($n -lt 3 -or $n -gt 8) { $msgs += "animation has $n frames (expected 3-8)" }
        $seen = @{}
        for ($f = 0; $f -lt $n; $f++) { $seen[(($img.P[($f * 256)..($f * 256 + 255)]) -join ',')] = 1 }
        if ($seen.Count -lt $n) { $msgs += "only $($seen.Count) distinct frames out of $n" }
    }
    if ($rel -match '^block/machines/wireless/(hatch|dynamo)_emissive\.png$') {
        $art = Read-Png ($path -replace '_emissive\.png$', '.png')
        $n = [int]($img.H / 16)
        for ($f = 0; $f -lt $n; $f++) { for ($i = 0; $i -lt 256; $i++) {
            if (((($img.P[$f * 256 + $i]) -shr 24) -band 255) -eq 0) { continue }
            $a = $art.P[$i]
            if ((($a -shr 24) -band 255) -ne 0) {
                $q = Get-Rgba $a
                if ($q[0] -eq $q[1] -and $q[1] -eq $q[2]) { $msgs += "emissive frame $f covers grey steel"; $f = $n; break }
            }
        } }
    }
    if ($msgs.Count -gt 0) { $problems++; Write-Warning "$rel : $($msgs -join '; ')" }
}

Write-Host "written $($written.Count) files under $OutRoot ($problems with warnings)"
foreach ($rel in $written) { Write-Host "  $rel" }

if ($Credits) {
    Write-Host ''
    foreach ($rel in $written) {
        Write-Host ("| ``pack/kubejs/assets/grindless/textures/$rel`` | Generated with tools/assets/$ScriptName (procedural pixel art, original) by the wireless energy agent, 2026-10-25 | the pack's licence (pending; proposed CC BY-SA 4.0) |")
    }
}
if ($problems -gt 0) { exit 1 }
