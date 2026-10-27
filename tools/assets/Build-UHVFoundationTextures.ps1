<#
.SYNOPSIS
  Procedural 16x16 pixel art for the foundations of the UHV era of Gregtech Grindless (package UHV-F1, shared registrations):
  52 items and three block textures (GregTech style: top-left light, 3-4 tones per material, selective outlines).

.DESCRIPTION
  Every pixel is drawn by this script (twelve small shape routines with a palette per item); nothing is copied or edited from GregTech
  Modern, GCYR or any other mod. Output is deterministic: re-running overwrites the same bytes (mottles come from Get-Noise, a hash of
  the position, not from a random generator). The twelve materials need no PNG: GregTech draws them from their colour.

  Writes (under pack/kubejs/assets/grindless/textures/):
      item/<name>.png for the 52 items that startup_scripts/grindless/uhv/foundation.js registers (see $Items below for the shape kind
    and the two colours of each: heaps, orbs, cards, vials, cartridges, spools, crystals, modules, capsules, chips, sails, assemblies).
      block/uhv/bsl4_casing.png       white sealed panels with a centre seam and a yellow-black hazard band; seamless.
      block/uhv/warp_gate_casing.png  dark metal with a violet coil ring and a central mount; seamless.
      block/uhv/hangar_casing.png     grey plates with two docking rails and yellow-black hazard edges; seamless.

  Run from the repo root:
      powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-UHVFoundationTextures.ps1
      powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-UHVFoundationTextures.ps1 -Only inp_wafer,bsl4_casing -Credits

  Every pixel is fully opaque or fully transparent and none is pure black; the block textures have all 256 pixels opaque and the item
  icons have a transparent corner and at least 20 opaque pixels. The final check fails the run (non-zero exit) if a written file breaks
  one of these rules, if two textures are identical, or if the set of outputs differs from the items and blocks that foundation.js
  registers.

.PARAMETER Only
  Subset of output names (e.g. inp_wafer, bsl4_casing) or groups: items, blocks (comma-separated, also as one string with -File).
.PARAMETER OutRoot
  Textures root. Default: <repo>/pack/kubejs/assets/grindless/textures
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

# name -> kind, body colour, accent colour
$Items = [ordered]@{
    berkelium_249                 = @('capsule', 'C8C2B0', '4AE07A')
    californium_252               = @('capsule', 'B0B4BC', 'E8E04A')
    californium_252_source        = @('cartridge', '8A8E9A', 'E8E04A')
    thorium_229                   = @('vial', 'A8A0B8', '5AD0C0')
    nickel_62_target              = @('module', 'A8A89C', '6A7A6A')
    nickel_63_target              = @('module', '8E9488', '9AF07A')
    hfir_driver_element           = @('assembly', 'B4B8C0', '3A9A6A')
    spent_hfir_driver_element     = @('assembly', '5E5A54', '9ADA4A')
    transcurium_target            = @('assembly', '7A6A5A', 'D06A3A')
    irradiated_transcurium_target = @('assembly', '4A4248', 'F08A3A')
    nuclear_clock                 = @('orb', '2A3A5A', 'B07AFF')
    lithium_niobate_boule         = @('crystal', 'E8DC9A', 'FFF4C8')
    lithium_niobate_wafer         = @('orb', 'E0D490', 'B8A860')
    vuv_caf2_boule                = @('crystal', 'C8E0F4', 'F4FAFF')
    thorium_caf2_crystal          = @('crystal', 'B8C8E0', '6AF0C8')
    eu_yso_boule                  = @('crystal', 'E8C8D8', 'FF6A8A')
    inp_boule                     = @('crystal', '4A4A5A', '8A7AA8')
    inp_wafer                     = @('orb', '52525E', '9A8ABA')
    quantum_cascade_laser         = @('chip', '3A3448', 'FF6A3A')
    thin_film_ln_modulator        = @('chip', 'C8B87A', '3AC8FF')
    sic_power_module              = @('module', '3A4A44', '7AE0A0')
    sic_mirror_blank              = @('orb', '6A7470', 'C8D4D0')
    nbn_coated_sic_plate          = @('card', '5A5E6E', 'D8C060')
    imm_solar_array               = @('sail', '2A3A6A', '8AA8E8')
    red_tuned_solar_array         = @('sail', '4A2A3A', 'E85A4A')
    betavoltaic_cell              = @('capsule', 'D8E0E8', '6AE8B0')
    c12_diamond_spreader          = @('card', 'D0E8F0', 'FFFFFF')
    positron_cartridge            = @('cartridge', '3A5868', '5AE8FF')
    antihydrogen_cartridge        = @('cartridge', '4A3A68', 'FF5AE0')
    exotic_matter_cell            = @('cartridge', '1E1A2E', 'A0FF5A')
    zblan_fibre                   = @('spool', 'D0E4F0', '8AE0FF')
    pbo_fibre                     = @('spool', 'D8A838', 'F8D878')
    tether_ribbon_segment         = @('spool', '3A3A40', 'D8A838')
    tether_climber                = @('module', 'B0B4C0', 'FFB84A')
    uhtc_tile                     = @('card', '6A6E7C', 'A8ACBA')
    uhtc_nozzle                   = @('heap', '5A5E6C', 'F08A3A')
    organoid_processor            = @('chip', 'E8B8B0', 'C84A6A')
    proxima_flora_sample          = @('vial', 'A8B8B0', '3A1E2E')
    proxima_regolith_survey       = @('card', '8A5A3A', 'E8B88A')
    characterised_xeno_strain     = @('vial', 'C8D8C8', '7A3A9A')
    xeno_genome_data              = @('card', '3A2A4A', 'C870FF')
    proxima_ice_core              = @('orb', 'D8E0F0', '6A8AB8')
    cold_trap_regolith            = @('heap', '5A4A48', 'C8D8F0')
    chitosan_scaffold             = @('crystal', 'E8E0C8', 'B8A880')
    xeno_radioprotectant          = @('vial', 'D0C8E0', 'E8D84A')
    infrared_pigment              = @('heap', '3A1A1E', 'C83A2A')
    aluminium_reflector_film      = @('sail', 'D8DCE4', 'F8FAFF')
    swarm_segment                 = @('sail', '4A5A7A', 'F0D060')
    worn_swarm_segment            = @('sail', '6A6460', 'A89A70')
    coronal_field_map             = @('card', 'E87A2A', 'FFE07A')
    stellar_neighbourhood_chart   = @('card', '1A2240', 'F0F0FF')
    proxima_gate_seed             = @('orb', '3A1E5A', 'E07AFF')
}
$Blocks = @('bsl4_casing', 'warp_gate_casing', 'hangar_casing')

function Get-Tone {
    param([int]$Argb, [int]$X, [int]$Y, [int]$Salt)
    $f = 1.2 - 0.035 * ($X + $Y)
    $n = Get-Noise $X $Y $Salt
    if ($n -lt 110) { $f *= 0.86 } elseif ($n -gt 900) { $f *= 1.14 }
    return (Shade $Argb $f)
}

function Test-Shape {
    param([string]$Kind, [int]$X, [int]$Y, [int]$Salt)
    $dx = $X - 7.5; $dy = $Y - 7.5
    $r = [Math]::Sqrt($dx * $dx + $dy * $dy)
    switch ($Kind) {
        'heap'     { $h = 9 - [Math]::Abs($dx) * 1.1; return ($Y -ge 14 - $h -and $Y -le 14 -and $h -gt 0) }
        'orb'      { return ($r -le 6.2) }
        'card'     { return ($X -ge 2 -and $X -le 13 -and $Y -ge 2 -and $Y -le 13) }
        'vial'     { return (($X -ge 6 -and $X -le 9 -and $Y -ge 1 -and $Y -le 4) -or ($X -ge 4 -and $X -le 11 -and $Y -ge 5 -and $Y -le 14)) }
        'cartridge' { return ($X -ge 1 -and $X -le 14 -and $Y -ge 3 -and $Y -le 12) }
        'spool'    { return ($r -le 6.4 -and $r -ge 1.8) }
        'crystal'  { return ([Math]::Abs($dx) + [Math]::Abs($dy) -le 7.2) }
        'module'   { return (($X -ge 1 -and $X -le 14 -and $Y -ge 4 -and $Y -le 11) -or (($Y -eq 3 -or $Y -eq 12) -and $X % 2 -eq 0 -and $X -ge 2 -and $X -le 13)) }
        'capsule'  { return ($X -ge 5 -and $X -le 10 -and $Y -ge 2 -and $Y -le 13 -and -not (($Y -eq 2 -or $Y -eq 13) -and ($X -eq 5 -or $X -eq 10))) }
        'chip'     { return (($X -ge 3 -and $X -le 12 -and $Y -ge 3 -and $Y -le 12) -or (($X -eq 1 -or $X -eq 2 -or $X -eq 13 -or $X -eq 14) -and $Y -ge 4 -and $Y -le 11 -and $Y % 2 -eq 0)) }
        'sail'     { return ($X -ge 1 -and $Y -ge 1 -and $Y -le 14 -and $X -le 1 + $Y -and ($X -eq 1 -or $X -le 14)) }
        'assembly' { return ($X -ge 3 -and $X -le 12 -and $Y -ge 0 -and $Y -le 15) }
    }
    return $false
}

function Test-Accent {
    param([string]$Kind, [int]$X, [int]$Y, [int]$Salt)
    $dx = $X - 7.5; $dy = $Y - 7.5
    $r = [Math]::Sqrt($dx * $dx + $dy * $dy)
    $n = Get-Noise $X $Y ($Salt + 7)
    switch ($Kind) {
        'heap'      { return ($n -gt 820) }
        'orb'       { return ($Y -eq 7 -or $Y -eq 8 -or $r -lt 2) }
        'card'      { return ($Y % 3 -eq 1 -and $X -ge 4 -and $X -le 11 -and $X % 4 -ne 0) }
        'vial'      { return ($Y -le 4 -or $Y -ge 9) }
        'cartridge' { return ($Y -ge 5 -and $Y -le 10 -and ($X % 5) -ge 1 -and ($X % 5) -le 3) }
        'spool'     { return (($X + $Y) % 4 -eq 0) }
        'crystal'   { return ($X -ge 8 -and $Y -ge 8) }
        'module'    { return ($Y -ge 6 -and $Y -le 9 -and $X % 3 -ne 0) }
        'capsule'   { return ($Y -ge 5 -and $Y -le 10) }
        'chip'      { return ($X -ge 5 -and $X -le 10 -and $Y -ge 5 -and $Y -le 10 -and ($X + $Y) % 2 -eq 0) }
        'sail'      { return (($X - $Y + 16) % 4 -eq 0) }
        'assembly'  { return ($X % 3 -eq 0 -and $Y -ge 2 -and $Y -le 13) }
    }
    return $false
}

function New-Item16 {
    param([string]$Name, [string[]]$Spec)
    $c = New-Canvas 16 16
    $salt = 0; foreach ($ch in $Name.ToCharArray()) { $salt = ($salt * 31 + [int]$ch) % 9973 }
    $body = Hex $Spec[1]; $accent = Hex $Spec[2]
    for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
        if (-not (Test-Shape $Spec[0] $x $y $salt)) { continue }
        $base = $body; if (Test-Accent $Spec[0] $x $y $salt) { $base = $accent }
        Set-Px $c $x $y (Get-Tone $base $x $y $salt)
    } }
    Add-Outline $c
    return $c
}

function New-Block16 {
    param([string]$Name)
    $c = New-Canvas 16 16
    switch ($Name) {
        'bsl4_casing' {
            $panel = Hex 'E4E6EA'; $seam = Hex '9A9EA8'; $stripe = Hex 'E8C030'; $dark = Hex '3A3C44'
            for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
                $col = Get-Tone $panel $x $y 301
                if ($x -eq 0 -or $y -eq 0 -or $x -eq 15 -or $y -eq 15 -or $x -eq 8) { $col = $seam }
                if ($y -ge 12 -and $y -le 13 -and $x -ne 8) { if ((($x + $y) % 4) -lt 2) { $col = $stripe } else { $col = $dark } }
                if (($x -eq 3 -or $x -eq 12) -and ($y -eq 3 -or $y -eq 9)) { $col = Shade $seam 0.8 }
                Set-Px $c $x $y $col
            } }
        }
        'warp_gate_casing' {
            $metal = Hex '34303E'; $coil = Hex 'B07AFF'; $mount = Hex '7A7488'
            for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
                $col = Get-Tone $metal $x $y 302
                $dx = $x - 7.5; $dy = $y - 7.5; $r = [Math]::Sqrt($dx * $dx + $dy * $dy)
                if ($r -ge 4.2 -and $r -le 5.6) { $col = Shade $coil (1.15 - 0.02 * ($x + $y)) }
                if ($x -eq 0 -or $y -eq 0 -or $x -eq 15 -or $y -eq 15) { $col = $mount }
                if (($x -eq 7 -or $x -eq 8) -and ($y -eq 7 -or $y -eq 8)) { $col = $mount }
                Set-Px $c $x $y $col
            } }
        }
        'hangar_casing' {
            $plate = Hex '8C9098'; $rail = Hex '5A5E68'; $yel = Hex 'E8C030'; $blk = Hex '2E2E34'
            for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
                $col = Get-Tone $plate $x $y 303
                if ($y -eq 5 -or $y -eq 10) { $col = $rail }
                if ($y -le 1 -or $y -ge 14) { if ((($x + $y) % 4) -lt 2) { $col = $yel } else { $col = $blk } }
                if (($y -eq 3 -or $y -eq 12) -and ($x % 5) -eq 2) { $col = Shade $plate 1.25 }
                Set-Px $c $x $y $col
            } }
        }
    }
    return $c
}

$Outputs = [ordered]@{}
foreach ($n in $Items.Keys) { $Outputs[$n] = [pscustomobject]@{ Rel = "item/$n.png"; Group = 'items' } }
foreach ($n in $Blocks) { $Outputs[$n] = [pscustomobject]@{ Rel = "block/uhv/$n.png"; Group = 'blocks' } }

$written = @()
foreach ($n in $Outputs.Keys) {
    $o = $Outputs[$n]
    if ($OnlySet.Count -gt 0 -and $OnlySet -notcontains $n -and $OnlySet -notcontains $o.Group) { continue }
    if ($o.Group -eq 'items') { $c = New-Item16 $n $Items[$n] } else { $c = New-Block16 $n }
    Save-Png $c (Join-Path $OutRoot $o.Rel)
    $written += $o.Rel
}

$problems = 0
function Add-Problem { param([string]$Name, [string]$Msg) $script:problems++; Write-Warning "$Name`: $Msg" }
$keys = @{}
foreach ($rel in $written) {
    $img = Read-Png (Join-Path $OutRoot $rel)
    $opaque = 0; $black = 0
    foreach ($p in $img.P) {
        $a = ($p -shr 24) -band 255
        if ($a -ne 0 -and $a -ne 255) { Add-Problem $rel 'partial alpha' ; break }
        if ($a -eq 255) { $opaque++; if (($p -band 0xFFFFFF) -eq 0) { $black++ } }
    }
    if ($black -gt 0) { Add-Problem $rel "$black pure black pixel(s)" }
    if ($rel.StartsWith('block/')) { if ($opaque -ne 256) { Add-Problem $rel 'block must be fully opaque' } }
    else {
        if ((($img.P[0] -shr 24) -band 255) -ne 0) { Add-Problem $rel 'corner pixel is not transparent' }
        if ($opaque -lt 20) { Add-Problem $rel "only $opaque opaque pixels" }
    }
    $k = $img.P -join ','
    if ($keys.ContainsKey($k)) { Add-Problem $rel "identical to $($keys[$k])" } else { $keys[$k] = $rel }
}
if ($OnlySet.Count -eq 0) {
    $src = Get-Content -LiteralPath (Join-Path $RepoRoot 'pack\kubejs\startup_scripts\grindless\uhv\foundation.js') -Raw
    foreach ($n in $Items.Keys) { if ($src -notmatch "(?m)^\s+$n\s*:\s*\{") { Add-Problem $n 'drawn here but not registered by foundation.js' } }
    foreach ($b in $Blocks) { if ($src -notmatch "grindless:block/uhv/${b}'") { Add-Problem $b 'block texture not referenced by foundation.js' } }
    $reg = [regex]::Match($src, '(?s)const ITEMS = \{(.*?)\n  \}').Groups[1].Value
    foreach ($m in [regex]::Matches($reg, '(?m)^\s+([a-z0-9_]+)\s*:')) { if (-not $Items.Contains($m.Groups[1].Value)) { Add-Problem $m.Groups[1].Value 'registered by foundation.js but not drawn here' } }
}
if ($problems -gt 0) { throw "$problems problem(s) in the texture checks (see the warnings above)" }
Write-Host "wrote $($written.Count) textures to $OutRoot"

if ($Credits) {
    Write-Host ''
    foreach ($rel in $written) {
        Write-Host ("| ``pack/kubejs/assets/grindless/textures/$rel`` | Generated with tools/assets/$ScriptName (procedural pixel art, original) by the assets agent (UHV-F1) | the pack's licence (pending; proposed CC BY-SA 4.0) |")
    }
}
