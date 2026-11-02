<#
.SYNOPSIS
  Procedural 16x16 pixel art for the spintronic row intermediates of the UXV era of Gregtech Grindless (package RF-6B):
  the 43 items that startup_scripts/grindless/uxv/spin_rows.js registers (GregTech style: top-left light, 3-4 tones per material).

.DESCRIPTION
  Every pixel is drawn by this script; nothing is copied or edited from GregTech Modern or any other mod. Output is deterministic.
  Families, each with its own silhouette (never a recolour of one shape):
    metal   5N metal crystals (faceted diamonds with facet lines).
    dust    blend, charge and redeposit dusts (speckled heaps).
    ingot   mu-metal and Heusler cast ingots (bars in perspective, cast ridges).
    band    hot band (a spiral coil).
    foil    annealed mu foil (a curling sheet).
    can     mu-metal shield can (a ribbed cylinder with an open top).
    raw     raw crystals (shard clusters or stacked flake plates).
    boule   Czochralski boules (shoulder, cylinder, seed rod) and the EFG plate (a ribbon).
    slice   sliced and polished discs (ellipse with an edge; polished ones gleam).
    wafer   processed wafers (a disc with a flat, one pattern per process stage).
    stack   SOT stacks (four layers in perspective; the contacted one has pads).

  Writes pack/kubejs/assets/grindless/textures/item/<name>.png.

  Run from the repo root:
      powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-UXVSpinRowsTextures.ps1
      powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-UXVSpinRowsTextures.ps1 -Only ggg_boule -Credits
      powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-UXVSpinRowsTextures.ps1 -PreviewPath $env:TEMP\uxv_spin_rows.png

  Every pixel is fully opaque or fully transparent, none is pure black, the corner is transparent and each icon has at least 20 opaque
  pixels. The final check fails the run if a file breaks a rule, if two textures are identical, or if the drawn set differs from the
  items spin_rows.js registers.

.PARAMETER Only
  Subset of item names (comma-separated, also as one string with -File).
.PARAMETER OutRoot
  Textures root. Default: <repo>/pack/kubejs/assets/grindless/textures
.PARAMETER PreviewPath
  Writes a 4x preview sheet of the drawn items to this PNG (keep it outside the repo).
.PARAMETER Credits
  Also print the CREDITS.md "Assets" table rows for the files written.
#>
[CmdletBinding()]
param(
    [string]$OutRoot = '',
    [string[]]$Only = @(),
    [string]$PreviewPath = '',
    [switch]$Credits
)
$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'Pixel.Lib.ps1')
$EraName = 'uxv'; . (Join-Path $PSScriptRoot 'Era.Lib.ps1')

$RepoRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..'))
if (-not $OutRoot) { $OutRoot = Join-Path $RepoRoot 'pack\kubejs\assets\grindless\textures' }
$OutRoot = [System.IO.Path]::GetFullPath($OutRoot)
$ScriptName = Split-Path -Leaf $PSCommandPath
$OnlySet = @(); foreach ($o in $Only) { $OnlySet += ($o -split ',') | Where-Object { $_ } }

function Get-Noise {
    param([int]$X, [int]$Y, [int]$Salt)
    $v = [int64]($X * 73856093) -bxor [int64]($Y * 19349663) -bxor [int64]($Salt * 83492791)
    return [int]([Math]::Abs($v) % 1000)
}

# name -> kind, body, accent, glow, variant
$Items = [ordered]@{
    five_n_cobalt        = @('metal', '5A78C0', 'A8C4F8', 'E8F0FF', 'a')
    five_n_iron          = @('metal', '8A8E98', 'D0D4E0', 'FFFFFF', 'b')
    five_n_manganese     = @('metal', 'A07898', 'E0B8D8', 'FFE8F8', 'a')
    five_n_silicon       = @('metal', '5A6478', 'A0B0D0', 'E0ECFF', 'b')
    five_n_nickel        = @('metal', '98A8A0', 'D8EAE0', 'FFFFFF', 'a')
    five_n_gallium       = @('metal', '78A0C8', 'C0E4FF', 'F8FFFF', 'b')
    mu_metal_blend       = @('dust', '7C8694', 'C4D0DC', 'F0F8FF', 'blend')
    finemet_charge_dust  = @('dust', '5C6A84', 'A8B8D8', 'E8F0FF', 'charge')
    stno_redeposit_dust  = @('dust', '6A5878', 'B8A0D0', 'F0E0FF', 'redeposit')
    mu_metal_ingot       = @('ingot', '7E8A98', 'D0DCE8', 'FFFFFF', 'plain')
    heusler_cast_ingot   = @('ingot', 'A08A5C', 'E8D098', 'FFF4C8', 'cast')
    mu_metal_hot_band    = @('band', '8A7468', 'E8A070', 'FFD8A0', 'hot')
    annealed_mu_foil     = @('foil', 'A0B0C0', 'E8F4FF', 'FFFFFF', 'foil')
    mu_metal_shield_can  = @('can', '6C7888', 'B8C8D8', 'F0F8FF', 'can')
    ni_mn_ga_raw_crystal = @('raw', '6E8A78', 'B0D8C0', 'F0FFF4', 'shards')
    fgt_raw_crystal      = @('raw', '787C90', 'B8C0E0', 'F8F8FF', 'shards2')
    raw_hbn_crystal      = @('raw', 'D8DCE4', 'FFFFFF', 'F0F8FF', 'plates')
    wte2_raw_crystal     = @('raw', '484C60', '9098C0', 'D8E0FF', 'plates2')
    dysco3_boule         = @('boule', 'B09468', 'E8D0A0', 'FFF0C8', 'boule')
    ggg_boule            = @('boule', '78A878', 'C0F0C0', 'F0FFF0', 'boule')
    ga2o3_efg_plate      = @('boule', 'B8C4D4', 'F0F8FF', 'FFFFFF', 'ribbon')
    dysco3_slice         = @('slice', 'A88C60', 'D8C090', 'F0E0B0', 'rough')
    dysco3_polished_slice = @('slice', 'B89C70', 'F0DCA8', 'FFFFE0', 'polished')
    ggg_slice            = @('slice', '6E9E6E', 'A0D0A0', 'D0F4D0', 'rough')
    ggg_polished_slice   = @('slice', '7CB07C', 'C8F4C8', 'F8FFF8', 'polished')
    ga2o3_slice          = @('slice', 'A8B4C8', 'D8E4F4', 'FFFFFF', 'rough')
    annealed_mtj_wafer   = @('wafer', '3C4A68', '6C84B8', 'FFB878', 'anneal')
    etched_mtj_wafer     = @('wafer', '3C4A68', '7890C8', 'C8E0FF', 'pillars')
    annealed_mram_wafer  = @('wafer', '4A3C68', '8470B8', 'FFA8C8', 'anneal')
    etched_mram_wafer    = @('wafer', '4A3C68', '9078C8', 'F0D8FF', 'bits')
    annealed_saf_wafer   = @('wafer', '584A3C', 'A08860', 'FFD890', 'saf')
    written_track_wafer  = @('wafer', '2E3E4C', '5A94B0', 'FFE070', 'track')
    cofe_me_wafer        = @('wafer', '3C5A4A', '70B090', 'D8FFE8', 'checker')
    yig_film_wafer       = @('wafer', '3C6048', '60B070', 'C8FFC8', 'film')
    yig_waveguide_wafer  = @('wafer', '3C6048', '70C080', 'F0FF98', 'wave')
    stno_defined_wafer   = @('wafer', '4C3C58', '8868B0', 'E8C8FF', 'defined')
    stno_milled_wafer    = @('wafer', '4C3C58', '7A6098', 'D8C0F0', 'milled')
    stno_clean_wafer     = @('wafer', '584C68', 'A898C8', 'FFFFFF', 'clean')
    stno_planarised_wafer = @('wafer', '5C5070', 'B0A0D0', 'F8F0FF', 'planar')
    ga2o3_epi_wafer      = @('wafer', '506070', '90B0D0', 'F0FFFF', 'epi')
    ga2o3_gated_wafer    = @('wafer', '506070', '88A8C8', 'FFE890', 'gated')
    sot_heterostack      = @('stack', '5A6070', '58A0B8', 'E0F0F8', 'plain')
    contacted_sot_stack  = @('stack', '5A6070', '58A0B8', 'FFD860', 'contacts')
}

function Get-Salt { param([string]$Name) $s = 0; foreach ($ch in $Name.ToCharArray()) { $s = ($s * 31 + [int]$ch) % 9973 }; return $s }

# Light from the top left: brighter toward the origin, with a little grain.
function Get-Tone {
    param([int]$Argb, [int]$X, [int]$Y, [int]$Salt, [double]$Slope = 0.035)
    $f = 1.2 - $Slope * ($X + $Y)
    $n = Get-Noise $X $Y $Salt
    if ($n -lt 110) { $f *= 0.88 } elseif ($n -gt 900) { $f *= 1.12 }
    return (Shade $Argb $f)
}

function Add-Disc {
    param($C, [double]$Cx, [double]$Cy, [double]$Rx, [double]$Ry, [scriptblock]$Pick, [int]$Salt)
    for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
        $dx = ($x - $Cx) / $Rx; $dy = ($y - $Cy) / $Ry
        if ($dx * $dx + $dy * $dy -gt 1.0) { continue }
        $col = & $Pick $x $y ([Math]::Sqrt($dx * $dx + $dy * $dy) * $Rx)
        if ($col -ne $null) { Set-Px $C $x $y $col }
    } }
}

function Draw-Metal {
    param($C, $B, $A, $G, [string]$V, [int]$Salt)
    for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
        $dx = $x - 7.5; $dy = $y - 7.5
        if ([Math]::Abs($dx) + [Math]::Abs($dy) -gt 7.2) { continue }
        $col = $B
        if ($V -eq 'a') {
            if ($dx -le 0 -and $dy -le 0) { $col = $A } elseif ($dx -gt 0 -and $dy -gt 0) { $col = Shade $B 0.72 }
            if ([Math]::Abs($dx) -lt 0.7 -or [Math]::Abs($dy) -lt 0.7) { $col = Shade $B 0.85 }
        } else {
            if ([Math]::Abs([Math]::Abs($dx) - [Math]::Abs($dy)) -lt 0.8) { $col = Shade $B 0.8 } elseif ($dx -lt 0 -and $dy -lt 0) { $col = $A }
        }
        if ($x -eq 5 -and $y -eq 4) { $col = $G }
        Set-Px $C $x $y (Get-Tone $col $x $y $Salt)
    } }
}

function Draw-Dust {
    param($C, $B, $A, $G, [string]$V, [int]$Salt)
    $thr = 820; if ($V -eq 'blend') { $thr = 650 } elseif ($V -eq 'redeposit') { $thr = 880 }
    for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
        $dx = $x - 7.5
        $h = 9 - [Math]::Abs($dx) * 1.1
        if ($V -eq 'charge') { $h = 10 - [Math]::Abs($dx + 1) * 1.4 }
        if ($V -eq 'redeposit') { $h = 8 - [Math]::Abs($dx) * 0.9 }
        if (-not ($y -ge 14 - $h -and $y -le 14 -and $h -gt 0)) { continue }
        $n = Get-Noise $x $y ($Salt + 7)
        $col = $B
        if ($n -gt $thr) { $col = $A }
        if ($V -eq 'blend' -and $n -lt 140) { $col = Shade $B 0.7 }
        if ($V -eq 'redeposit' -and $n -gt 960) { $col = $G }
        Set-Px $C $x $y (Get-Tone $col $x $y $Salt)
    }}
    if ($V -eq 'charge') { Set-Px $C 9 6 (Shade $G 0.95); Set-Px $C 5 8 (Shade $G 0.9) }
    if ($V -eq 'redeposit') { Set-Px $C 3 12 $G; Set-Px $C 12 11 $G; Set-Px $C 9 3 (Shade $A 1.1) }
    Add-Outline $C
}

function Draw-Ingot {
    param($C, $B, $A, $G, [string]$V, [int]$Salt)
    $dark = Shade $B 0.62
    for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
        $col = $null
        if ($y -ge 4 -and $y -le 6 -and $x -ge (5 - ($y - 4) * 1) -and $x -le (14 - ($y - 4))) { $col = $A }
        elseif ($y -ge 7 -and $y -le 12 -and $x -ge 3 -and $x -le 11) { $col = $B }
        elseif ($x -ge 12 -and $x -le 13 -and $y -ge 5 -and $y -le 11 -and $y -ge 5 + ($x - 12) - 0 -and $y -le 11) { $col = $dark }
        elseif ($y -ge 7 -and $y -le 12 -and $x -eq 12) { $col = $dark }
        if ($col -eq $null) { continue }
        if ($V -eq 'cast' -and $y -ge 7 -and $x -lt 12 -and (($x + $y) % 4 -eq 0)) { $col = Shade $col 0.82 }
        if ($V -eq 'cast' -and $y -le 6 -and ($x % 3 -eq 0)) { $col = Mix $col $G 0.4 }
        if ($V -eq 'plain' -and $y -eq 7) { $col = Mix $col $G 0.55 }
        Set-Px $C $x $y (Get-Tone $col $x $y $Salt 0.02)
    } }
    Add-Outline $C
}

function Draw-Band {
    param($C, $B, $A, $G, [string]$V, [int]$Salt)
    for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
        $dx = $x - 7.5; $dy = $y - 7.5
        $r = [Math]::Sqrt($dx * $dx + $dy * $dy)
        if ($r -gt 7 -or $r -lt 2.2) { continue }
        $ang = [Math]::Atan2($dy, $dx)
        $ph = [int][Math]::Floor($r + $ang * 0.9)
        $col = $B; if (($ph % 3 + 3) % 3 -eq 0) { $col = $A } elseif (($ph % 3 + 3) % 3 -eq 1) { $col = Shade $B 0.78 }
        if ($r -lt 3.4) { $col = Mix $col $G 0.5 }
        Set-Px $C $x $y (Get-Tone $col $x $y $Salt)
    } }
    Add-Outline $C
}

function Draw-Foil {
    param($C, $B, $A, $G, [string]$V, [int]$Salt)
    for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
        $u = $x + $y * 0.5
        if ($y -lt 3 -or $y -gt 13 -or $u -lt 4.5 -or $u -gt 17.5) { continue }
        $col = $B
        if ((($x + $y) % 5) -lt 2) { $col = $A }
        if ($y -ge 11 -and $x -ge 9) { $col = Shade $B 0.7 }
        if ($y -eq 3 -or $y -eq 4) { $col = Mix $col $G 0.5 }
        Set-Px $C $x $y (Get-Tone $col $x $y $Salt 0.02)
    } }
    foreach ($p in @(@(11, 11), @(12, 10), @(13, 9))) { Set-Px $C $p[0] $p[1] (Shade $B 0.55) }
    Add-Outline $C
}

function Draw-Can {
    param($C, $B, $A, $G, [string]$V, [int]$Salt)
    for ($y = 2; $y -le 14; $y++) { for ($x = 3; $x -le 12; $x++) {
        $col = $B
        if ($x -le 4) { $col = $A } elseif ($x -ge 11) { $col = Shade $B 0.65 }
        if ($y -le 4) {
            $ex = ($x - 7.5) / 4.8; $ey = ($y - 3.0) / 1.8
            if ($ex * $ex + $ey * $ey -gt 1) { continue }
            $col = $G; if ($y -ge 3 -and $x -ge 5 -and $x -le 10) { $col = Shade $B 0.4 }
        } elseif ($y -eq 7 -or $y -eq 11) { $col = Shade $col 0.78 }
        Set-Px $C $x $y (Get-Tone $col $x $y $Salt 0.015)
    } }
    Add-Outline $C
}

function Draw-Raw {
    param($C, $B, $A, $G, [string]$V, [int]$Salt)
    if ($V -like 'shards*') {
        $shards = @(@(4, 9, 3), @(8, 13, 4), @(11, 8, 3), @(6, 6, 2))
        if ($V -eq 'shards2') { $shards = @(@(3, 7, 2), @(6, 12, 3), @(9, 9, 3), @(12, 12, 2)) }
        foreach ($s in $shards) {
            for ($y = 14 - $s[0] * 2 + 0; $y -le 14; $y++) { for ($x = 0; $x -lt 16; $x++) {
                $cx = $s[0] + 2; $h = $s[1]; $hw = $s[2]
                $t = (14 - $y) / [double]$h
                if ($t -gt 1) { continue }
                $w = $hw * (1 - $t * 0.85) + 0.4
                if ([Math]::Abs($x - ($cx + 1)) -gt $w) { continue }
                $col = $B; if ($x -lt $cx + 1) { $col = $A } elseif ($x -gt $cx + 1.5) { $col = Shade $B 0.68 }
                if ($y -eq 14 - [int]$h + 1) { $col = $G }
                Set-Px $C $x $y (Get-Tone $col $x $y $Salt 0.02)
            } }
        }
    } else {
        $plates = @(@(2, 13, 12), @(3, 10, 10), @(1, 7, 11), @(4, 4, 8))
        if ($V -eq 'plates2') { $plates = @(@(1, 13, 13), @(3, 10, 9), @(2, 7, 10), @(5, 4, 6)) }
        foreach ($p in $plates) {
            for ($j = 0; $j -lt 2; $j++) { for ($i = 0; $i -lt $p[2]; $i++) {
                $x = $p[0] + $i + (1 - $j); $y = $p[1] - $j
                $col = $B; if ($j -eq 0) { $col = $A }
                if ($i -eq 0 -and $j -eq 1) { $col = $G }
                if ($i -ge $p[2] - 2) { $col = Shade $B 0.7 }
                Set-Px $C $x $y (Get-Tone $col $x $y $Salt 0.02)
            } }
        }
    }
    Add-Outline $C
}

function Draw-Boule {
    param($C, $B, $A, $G, [string]$V, [int]$Salt)
    if ($V -eq 'ribbon') {
        for ($y = 1; $y -le 14; $y++) { for ($x = 4; $x -le 11; $x++) {
            if ($y -le 2 -and ($x + $y) -gt 11) { continue }
            $col = $B
            if ($x -le 5) { $col = $A } elseif ($x -ge 10) { $col = Shade $B 0.66 }
            if ($y -le 3) { $col = Mix $col $G 0.6 }
            if ($y % 4 -eq 0 -and $x -gt 5 -and $x -lt 10) { $col = Shade $col 0.82 }
            Set-Px $C $x $y (Get-Tone $col $x $y $Salt 0.02)
        } }
        Set-Rect $C 3 14 10 1 (Shade $B 0.5)
    } else {
        for ($y = 0; $y -le 15; $y++) {
            if ($y -le 1) { $hw = 1 } elseif ($y -le 5) { $hw = 2 + ($y - 1) } else { $hw = 6 }
            if ($y -ge 14) { $hw = 5 }
            for ($x = 0; $x -lt 16; $x++) {
                $d = $x - 7.5
                if ([Math]::Abs($d) -gt $hw - 0.5) { continue }
                $col = $B
                if ($d -lt -$hw * 0.35) { $col = $A } elseif ($d -gt $hw * 0.45) { $col = Shade $B 0.66 }
                if ($y -le 1) { $col = $G } elseif ($y -ge 6 -and ($y % 3 -eq 0)) { $col = Shade $col 0.84 }
                Set-Px $C $x $y (Get-Tone $col $x $y $Salt 0.015)
            }
        }
    }
    Add-Outline $C
}

function Draw-Slice {
    param($C, $B, $A, $G, [string]$V, [int]$Salt)
    # edge (two rows) then the top face
    foreach ($off in @(2, 1)) {
        Add-Disc $C 7.5 (8.0 + $off) 7.0 4.4 { param($x, $y, $r) return (Shade $B 0.6) } $Salt
    }
    $polished = ($V -eq 'polished')
    Add-Disc $C 7.5 8.0 7.0 4.4 {
        param($x, $y, $r)
        $col = $B
        if ($polished) {
            if (($x - $y) -ge -2 -and ($x - $y) -le 0 -and $x -le 9) { $col = $G } elseif ($x -lt 8) { $col = $A }
        } else {
            $n = Get-Noise $x $y ($Salt + 3)
            if ($n -gt 760) { $col = $A } elseif ($n -lt 160) { $col = Shade $B 0.78 }
        }
        return (Get-Tone $col $x $y $Salt 0.02)
    } $Salt
    Add-Outline $C
}

function Draw-Wafer {
    param($C, $B, $A, $G, [string]$V, [int]$Salt)
    $edge = Shade $B 0.55
    Add-Disc $C 7.5 7.5 7.0 7.0 {
        param($x, $y, $r)
        if ($y -ge 14) { return $null }
        $col = $B
        $n = Get-Noise $x $y ($Salt + 5)
        switch ($V) {
            'anneal'   { if ($r -ge 4.5 -and $r -lt 5.8) { $col = $G } elseif ($r -lt 3.2) { $col = $A } else { $col = Mix $B $A 0.35 } }
            'pillars'  { if (($x % 3) -eq 1 -and ($y % 3) -eq 1) { $col = $G } elseif (($x % 3) -eq 0 -or ($y % 3) -eq 0) { $col = $A } }
            'bits'     { if (($x % 4) -lt 2 -and ($y % 4) -lt 2) { $col = $A; if (($x % 4) -eq 0 -and ($y % 4) -eq 0) { $col = $G } } else { $col = Shade $B 0.8 } }
            'saf'      { if ([int][Math]::Floor($r) % 2 -eq 0) { $col = $A } else { $col = Mix $B $A 0.3 }; if ($r -lt 1.6) { $col = $G } }
            'track'    { if (($y % 3) -eq 0) { $col = $A; if (($y % 6) -eq 0 -and ($x % 5) -lt 3) { $col = $G } } }
            'checker'  { if ((([int][Math]::Floor($x / 2) + [int][Math]::Floor($y / 2)) % 2) -eq 0) { $col = $A } ; if ($x -eq 4 -and $y -eq 4) { $col = $G } }
            'film'     { if ((($x + $y) % 7) -lt 2) { $col = $G } else { $col = Mix $B $A 0.55 } }
            'wave'     {
                $col = Mix $B $A 0.3
                $onPath = ($y -eq 4 -and $x -ge 3 -and $x -le 11) -or ($y -eq 7 -and $x -ge 4 -and $x -le 12) -or ($y -eq 10 -and $x -ge 3 -and $x -le 11) -or ($x -eq 11 -and $y -ge 4 -and $y -le 7) -or ($x -eq 4 -and $y -ge 7 -and $y -le 10)
                if ($onPath) { $col = $G }
            }
            'defined'  { if (($x % 3) -lt 2 -and ($y % 3) -lt 2) { $col = $A; if (($x % 3) -eq 0 -and ($y % 3) -eq 0) { $col = $G } } else { $col = Shade $B 0.7 } }
            'milled'   { if ($n -lt 260) { $col = Shade $B 0.6 } elseif ($n -gt 900) { $col = $G } else { $col = $A } }
            'clean'    { if ($r -ge 5.6) { $col = $A } else { $col = Mix $B $A 0.5 }; if (($x -eq 5 -and $y -eq 5) -or ($x -eq 10 -and $y -eq 9) -or ($x -eq 7 -and $y -eq 11)) { $col = $G } }
            'planar'   { if ((($x + $y) % 6) -lt 2) { $col = $G } else { $col = Mix $B $A 0.6 }; if ($r -ge 6) { $col = $A } }
            'epi'      { if ($r -lt 3.8) { $col = $A } elseif ($r -lt 5.2) { $col = $B } elseif ($r -lt 6.2) { $col = $G } else { $col = Shade $B 0.8 } }
            'gated'    { if (($x % 4) -lt 2) { $col = $A } else { $col = Shade $B 0.8 }; if (($x % 4) -eq 0 -and ($y % 5) -eq 2) { $col = $G } }
        }
        return (Get-Tone $col $x $y $Salt 0.02)
    } $Salt
    # wafer flat
    Set-Rect $C 3 14 10 1 0
    Add-Outline $C
}

function Draw-Stack {
    param($C, $B, $A, $G, [string]$V, [int]$Salt)
    $layers = @($B, (Shade $A 0.8), (Mix $A $B 0.5), $A)
    for ($i = 0; $i -lt 4; $i++) {
        $y0 = 11 - $i * 3
        $top = $layers[$i]
        for ($x = 4; $x -le 14; $x++) { Set-Px $C $x $y0 (Get-Tone $top $x $y0 $Salt 0.02) }
        for ($x = 2; $x -le 12; $x++) { Set-Px $C $x ($y0 + 1) (Get-Tone $top $x ($y0 + 1) $Salt 0.02) }
        for ($x = 2; $x -le 12; $x++) { Set-Px $C $x ($y0 + 2) (Shade $top 0.6) }
        Set-Px $C 13 ($y0 + 1) (Shade $top 0.55)
        Set-Px $C 14 $y0 (Shade $top 0.6)
    }
    if ($V -eq 'contacts') {
        foreach ($p in @(@(5, 2), @(7, 2), @(9, 2), @(11, 2))) { Set-Rect $C $p[0] ($p[1] - 1) 1 2 $G }
        Set-Px $C 6 1 (Shade $G 0.7); Set-Px $C 10 1 (Shade $G 0.7)
    } else {
        Set-Px $C 6 2 $G; Set-Px $C 8 3 $G
    }
    Add-Outline $C
}

function New-Item16 {
    param([string]$Name, [string[]]$Spec)
    $c = New-Canvas 16 16
    $salt = Get-Salt $Name
    $b = Hex $Spec[1]; $a = Hex $Spec[2]; $g = Hex $Spec[3]; $v = $Spec[4]
    switch ($Spec[0]) {
        'metal' { Draw-Metal $c $b $a $g $v $salt }
        'dust'  { Draw-Dust $c $b $a $g $v $salt }
        'ingot' { Draw-Ingot $c $b $a $g $v $salt }
        'band'  { Draw-Band $c $b $a $g $v $salt }
        'foil'  { Draw-Foil $c $b $a $g $v $salt }
        'can'   { Draw-Can $c $b $a $g $v $salt }
        'raw'   { Draw-Raw $c $b $a $g $v $salt }
        'boule' { Draw-Boule $c $b $a $g $v $salt }
        'slice' { Draw-Slice $c $b $a $g $v $salt }
        'wafer' { Draw-Wafer $c $b $a $g $v $salt }
        'stack' { Draw-Stack $c $b $a $g $v $salt }
    }
    if ($Spec[0] -eq 'metal') { Add-Outline $c }
    return $c
}

$written = @(); $canvases = @{}
foreach ($n in $Items.Keys) {
    if ($OnlySet.Count -gt 0 -and $OnlySet -notcontains $n) { continue }
    $c = New-Item16 $n $Items[$n]
    Save-Png $c (Join-Path $OutRoot "item/$n.png")
    $written += "item/$n.png"; $canvases[$n] = $c
}

if ($PreviewPath) {
    $cols = 8; $scale = 4; $cell = 18
    $names = @($canvases.Keys)
    $rows = [int][Math]::Ceiling($names.Count / $cols)
    $sheet = New-Canvas ($cols * $cell * $scale) ($rows * $cell * $scale)
    $bg = Hex '2A2A32'
    for ($i = 0; $i -lt $sheet.P.Length; $i++) { $sheet.P[$i] = $bg }
    for ($k = 0; $k -lt $names.Count; $k++) {
        $src = $canvases[$names[$k]]
        $ox = (($k % $cols) * $cell + 1) * $scale; $oy = ([int][Math]::Floor($k / $cols) * $cell + 1) * $scale
        for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
            $p = $src.P[$y * 16 + $x]
            if ((($p -shr 24) -band 255) -eq 0) { continue }
            Set-Rect $sheet ($ox + $x * $scale) ($oy + $y * $scale) $scale $scale $p
        } }
    }
    Save-Png $sheet $PreviewPath
    Write-Host "preview sheet: $PreviewPath"
}

$problems = 0
function Add-Problem { param([string]$Name, [string]$Msg) $script:problems++; Write-Warning "$Name`: $Msg" }
$keys = @{}
foreach ($rel in $written) {
    $img = Read-Png (Join-Path $OutRoot $rel)
    $opaque = 0; $black = 0
    foreach ($p in $img.P) {
        $a = ($p -shr 24) -band 255
        if ($a -ne 0 -and $a -ne 255) { Add-Problem $rel 'partial alpha'; break }
        if ($a -eq 255) { $opaque++; if (($p -band 0xFFFFFF) -eq 0) { $black++ } }
    }
    if ($black -gt 0) { Add-Problem $rel "$black pure black pixel(s)" }
    if ((($img.P[0] -shr 24) -band 255) -ne 0) { Add-Problem $rel 'corner pixel is not transparent' }
    if ($opaque -lt 20) { Add-Problem $rel "only $opaque opaque pixels" }
    $k = $img.P -join ','
    if ($keys.ContainsKey($k)) { Add-Problem $rel "identical to $($keys[$k])" } else { $keys[$k] = $rel }
}
if ($OnlySet.Count -eq 0) {
    $src = Get-Content -LiteralPath (Join-Path $RepoRoot 'pack\kubejs\startup_scripts\grindless\uxv\spin_rows.js') -Raw
    $regNames = @(); foreach ($m in [regex]::Matches($src, '(?m)^\s+([a-z0-9_]+):\s*\d+,?\s*$')) { $regNames += $m.Groups[1].Value }
    foreach ($n in $Items.Keys) { if ($regNames -notcontains $n) { Add-Problem $n 'drawn here but not registered by spin_rows.js' } }
    foreach ($n in $regNames) { if (-not $Items.Contains($n)) { Add-Problem $n 'registered by spin_rows.js but not drawn here' } }
}
if ($problems -gt 0) { throw "$problems problem(s) in the texture checks (see the warnings above)" }
Write-Host "wrote $($written.Count) textures to $OutRoot"

if ($Credits) {
    Write-Host ''
    foreach ($rel in $written) {
        Write-Host ("| ``pack/kubejs/assets/grindless/textures/$rel`` | Generated with tools/assets/$ScriptName (procedural pixel art, original) by the assets agent (RF-6B) | the pack's licence (MIT) |")
    }
}
