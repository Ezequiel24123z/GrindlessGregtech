<#
.SYNOPSIS
  Procedural 16x16 pixel art for the foundations of the OpV era of Gregtech Grindless (package OpV-F1, shared registrations):
  69 items and three casing block textures (GregTech style: top-left light, 3-4 tones per material, selective outlines).

.DESCRIPTION
  Every pixel is drawn by this script (the shape routines of the UXV foundation script with a new palette per item); nothing is copied
  or edited from GregTech Modern, GCYR, Monifactory or any other mod. Output is deterministic: re-running overwrites the same bytes
  (mottles come from Get-Noise, a hash of the position, not from a random generator). The materials need no PNG (GregTech draws them
  from their colour).

  Writes (under pack/kubejs/assets/grindless/textures/):
      item/<name>.png for the 69 items that startup_scripts/grindless/opv/foundation.js registers (see $Items below).
      block/opv/field_frozen_casing.png          blue-steel plate with pale frozen field lines; seamless.
      block/opv/annihilation_shield_casing.png   dense grey absorber tiles with an amber gamma seam; seamless.
      block/opv/neg_xhv_casing.png               dark porous getter sinter in a bright steel frame; seamless.

  Run from the repo root:
      powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-OpVFoundationTextures.ps1
      powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-OpVFoundationTextures.ps1 -Only tetron_die,neg_xhv_casing -Credits

  Every pixel is fully opaque or fully transparent and none is pure black; the block textures have all 256 pixels opaque and the item
  icons have a transparent corner and at least 20 opaque pixels. The final check fails the run (non-zero exit) if a written file breaks
  one of these rules, if two textures are identical, or if the set of outputs differs from the items and blocks that foundation.js
  registers.

.PARAMETER Only
  Subset of output names or groups: items, blocks (comma-separated, also as one string with -File).
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
    bulge_relay_seed          = @('orb', '4A3A68', 'F0C080')
    launched_bulge_seed       = @('orb', '3A3058', 'FFE0A0')
    chain_lamina_stack        = @('sail', '7080A8', 'B8C8F0')
    ni_chain_slab             = @('cartridge', '8890A8', 'C8D0E8')
    chain_field_coil          = @('spool', '607098', 'A0C0FF')
    chain_composite_rod       = @('capsule', '6878A0', 'B0C8F8')
    chain_composite_rotor     = @('spool', '5A6890', 'D0E0FF')
    superfluid_he3_seal       = @('spool', '9AA8C0', 'D8F0FF')
    chain_mesh_belt           = @('sail', '586890', '98B0E0')
    opv_harmonic_drive        = @('spool', '4A4E68', 'FFB0D0')
    th229_lasing_crystal      = @('crystal', '6A4A80', 'FFD0F0')
    hpge_compton_crystal      = @('crystal', '8A9098', 'E0E8F0')
    inas_al_wafer             = @('card', '5A5A70', 'C0C8D8')
    gated_2deg_wafer          = @('card', '3A4A60', '90E0C0')
    tetron_die                = @('chip', '3A3068', 'D0A0FF')
    cryo_cmos_die             = @('chip', '2E4060', 'A0E0FF')
    nb_tsv_interposer         = @('module', '5A6070', 'D0D8F0')
    cryo_optical_link         = @('module', '2E3A58', '80F0FF')
    hemt_amplifier            = @('chip', '4A3A50', 'FFB080')
    gan_mmic                  = @('chip', '3A5048', 'B0FF90')
    sdd_die                   = @('chip', '505A68', 'F0F0A0')
    field_frozen_plate        = @('card', '6A80B0', 'D0E8FF')
    aln_power_die             = @('chip', '6A6A60', 'F0E0B0')
    tetron_array              = @('module', '3A2E60', 'E0B0FF')
    gamma_multilayer_mirror   = @('orb', '50586A', 'E8F0FF')
    laue_lens                 = @('crystal', '7A8AA0', 'E0F8FF')
    be_beam_window            = @('card', 'A0A4A8', 'F0F4F8')
    ir_spallation_target      = @('cartridge', 'B0B4BC', 'F0F8FF')
    spent_ir_target           = @('cartridge', '5A5A50', 'A0C060')
    li6_hydride_shield        = @('module', 'A8A898', 'E8E8D0')
    electron_cooler           = @('capsule', '3A5A78', 'A0F0FF')
    stochastic_cooling_pickup = @('module', '4A4A60', 'F0D080')
    pb208_beam_cell           = @('vial', '5A5A68', 'B0B0D0')
    octupole_trap_magnet      = @('spool', '5A4870', 'F0A0FF')
    levitation_trap_cell      = @('capsule', '3A3A58', 'E0E0FF')
    lyman_alpha_laser         = @('capsule', '482E68', 'C080FF')
    gamma_absorber_tile       = @('card', '4A4848', 'B0A890')
    tpv_panel                 = @('card', '2A2A48', 'FF9050')
    acmf_pellet               = @('orb', '6A6A78', 'C0D0F0')
    seed_positron_plasma      = @('vial', '6A3A78', 'FFA0E0')
    dense_positron_cell       = @('vial', '4A2E68', 'FF80F0')
    cold_antiproton_cell      = @('vial', '2E4068', '90D0FF')
    antiproton_stack_opv      = @('vial', '3A3478', 'B0B0FF')
    antihydrogen_ice_cell     = @('vial', '3A5A80', 'E0FFFF')
    strangelet_seed           = @('crystal', '4A2048', 'FF60A0')
    stable_exotic_matter      = @('orb', '2A1A48', 'C060FF')
    kugelblitz_core           = @('orb', '201C28', 'FFE0A0')
    hawking_drive             = @('assembly', '3A3A48', 'FFD080')
    xnav_unit                 = @('module', '2E3E58', '70FFE0')
    node_power_transmitter    = @('assembly', '4A5068', '80D0FF')
    bulge_debris              = @('heap', '6A5A4A', 'A89070')
    metal_feedstock           = @('heap', '7A7E88', 'C0C8D8')
    silicate_debris_fraction  = @('heap', '8A7860', 'C8B898')
    si_alloy_powder           = @('heap', '6A6E78', 'A8B0C0')
    cluster_sinter_casing     = @('card', '6A5E50', 'B8A890')
    collector_node            = @('orb', '4A5A70', 'A0E8C0')
    spent_collector_node      = @('orb', '4A4A48', '8A8A70')
    deployed_node_pack        = @('assembly', '4A5868', 'B0F0D0')
    probe_seed                = @('crystal', '4A6070', 'A0FFD0')
    vitamin_kit               = @('cartridge', '6A7060', 'F0E070')
    pathfinder_probe          = @('assembly', '5A5E78', 'FFB060')
    launched_pathfinder       = @('assembly', '4A4E68', 'FFE090')
    pathfinder_probe_core     = @('module', '3E4060', 'FFC070')
    bulge_light_census        = @('card', '38281E', 'FFC080')
    superheavy_census_iv      = @('card', '24203C', 'A0FFE0')
    element_124_recoil        = @('card', '2A2848', 'FF9060')
    element_126_recoil        = @('card', '2A2848', '60C8FF')
    chain_strand_repeater     = @('orb', '3A4068', 'A0C8FF')
    sgr_a_chart               = @('card', '1E1A30', 'F0A0FF')
}
$Blocks = @('field_frozen_casing', 'annihilation_shield_casing', 'neg_xhv_casing')

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
        'field_frozen_casing' {
            $plate = Hex '5A6E98'; $line = Hex 'D8ECFF'; $edge = Hex '2E3A54'
            for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
                $col = Get-Tone $plate $x $y 701
                if ($y % 4 -eq 2 -and $x -ge 2 -and $x -le 13) { $col = Shade $line (1.0 - 0.02 * $x) }
                if ($y % 4 -eq 3 -and ($x % 5) -eq 1) { $col = Shade $plate 0.78 }
                if ($x -eq 0 -or $y -eq 0 -or $x -eq 15 -or $y -eq 15) { $col = $edge }
                Set-Px $c $x $y $col
            } }
        }
        'annihilation_shield_casing' {
            $tile = Hex '4E4E56'; $seam = Hex 'FFB040'; $edge = Hex '26262C'; $gap = Hex '34343A'
            for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
                $col = Get-Tone $tile $x $y 702
                if ($x % 5 -eq 0 -or $y % 5 -eq 0) { $col = $gap }
                if (($x -eq 7 -or $x -eq 8) -and ($y -eq 7 -or $y -eq 8)) { $col = $seam }
                if ([Math]::Abs($x - 7.5) + [Math]::Abs($y - 7.5) -eq 3 -and $x -ge 4 -and $x -le 11) { $col = Shade $seam 0.8 }
                if ($x -eq 0 -or $y -eq 0 -or $x -eq 15 -or $y -eq 15) { $col = $edge }
                Set-Px $c $x $y $col
            } }
        }
        'neg_xhv_casing' {
            $sinter = Hex '3E4A44'; $frame = Hex 'C8CCD4'; $pore = Hex '242C28'
            for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
                $col = Get-Tone $sinter $x $y 703
                if ((Get-Noise $x $y 704) -gt 760) { $col = $pore }
                if ($x -le 1 -or $y -le 1 -or $x -ge 14 -or $y -ge 14) { $col = Shade $frame (1.08 - 0.03 * ($x + $y) / 2) }
                if ($x -eq 0 -or $y -eq 0) { $col = Shade $frame 1.1 }
                if ($x -eq 15 -or $y -eq 15) { $col = Shade $frame 0.62 }
                Set-Px $c $x $y $col
            } }
        }
    }
    return $c
}

$Outputs = [ordered]@{}
foreach ($n in $Items.Keys) { $Outputs[$n] = [pscustomobject]@{ Rel = "item/$n.png"; Group = 'items' } }
foreach ($n in $Blocks) { $Outputs[$n] = [pscustomobject]@{ Rel = "block/opv/$n.png"; Group = 'blocks' } }

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
    $src = Get-Content -LiteralPath (Join-Path $RepoRoot 'pack\kubejs\startup_scripts\grindless\opv\foundation.js') -Raw
    foreach ($n in $Items.Keys) { if ($src -notmatch "(?m)^\s+$n\s*:\s*\{") { Add-Problem $n 'drawn here but not registered by foundation.js' } }
    foreach ($b in $Blocks) { if ($src -notmatch "grindless:block/opv/${b}'") { Add-Problem $b 'block texture not referenced by foundation.js' } }
    $reg = [regex]::Match($src, '(?s)const ITEMS = \{(.*?)\n  \}').Groups[1].Value
    foreach ($m in [regex]::Matches($reg, '(?m)^\s+([a-z0-9_]+)\s*:')) { if (-not $Items.Contains($m.Groups[1].Value)) { Add-Problem $m.Groups[1].Value 'registered by foundation.js but not drawn here' } }
}
if ($problems -gt 0) { throw "$problems problem(s) in the texture checks (see the warnings above)" }
Write-Host "wrote $($written.Count) textures to $OutRoot"

if ($Credits) {
    Write-Host ''
    foreach ($rel in $written) {
        Write-Host ("| ``pack/kubejs/assets/grindless/textures/$rel`` | Generated with tools/assets/$ScriptName (procedural pixel art, original) by the assets agent (OpV-F1) | the pack's licence (pending; proposed CC BY-SA 4.0) |")
    }
}
