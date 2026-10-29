<#
.SYNOPSIS
  Procedural 16x16 pixel art for the foundations of the UXV era of Gregtech Grindless (package UXV-F1, shared registrations):
  106 items and one block texture (GregTech style: top-left light, 3-4 tones per material, selective outlines).

.DESCRIPTION
  Every pixel is drawn by this script (the shape routines of the UIV foundation script with a new palette per item); nothing is copied
  or edited from GregTech Modern, GCYR, Monifactory or any other mod. Output is deterministic: re-running overwrites the same bytes
  (mottles come from Get-Noise, a hash of the position, not from a random generator). The materials need no PNG (GregTech draws them
  from their colour).

  Writes (under pack/kubejs/assets/grindless/textures/):
      item/<name>.png for the 106 items that startup_scripts/grindless/uxv/foundation.js registers (see $Items below).
      block/uxv/uxv_fusion_casing.png   dark W-184 fibre weave with a violet-white seam; seamless.

  Run from the repo root:
      powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-UXVFoundationTextures.ps1
      powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-UXVFoundationTextures.ps1 -Only mtj_die,uxv_fusion_casing -Credits

  Every pixel is fully opaque or fully transparent and none is pure black; the block texture has all 256 pixels opaque and the item
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
    uxv_electric_motor      = @('module', '5A5E72', 'C8A0FF')
    uxv_electric_pump       = @('capsule', '6A6E84', '7AC8F0')
    uxv_conveyor_module     = @('module', '4E5468', 'F0C870')
    uxv_electric_piston     = @('capsule', '7E8090', 'F08C70')
    uxv_robot_arm           = @('assembly', '7E8098', 'FFD070')
    uxv_sensor              = @('chip', '3E5078', '90FFE0')
    uxv_emitter             = @('chip', '56407A', 'FFA0F0')
    uxv_field_generator     = @('orb', '3A4488', 'C0F0FF')
    cofeb_target            = @('cartridge', '6A7890', 'A8C0E8')
    mgo_target              = @('cartridge', 'C8C8C0', 'F0F0E8')
    heusler_target          = @('cartridge', '98886A', 'E0C890')
    saf_target_set          = @('cartridge', '58606E', 'D0A878')
    ta_seed_target          = @('cartridge', '4A5A78', '90A8D0')
    srruo3_target           = @('cartridge', '3A3038', '8A7090')
    la_bfo_target           = @('cartridge', 'A86850', 'F0B898')
    cofeb_ingot             = @('heap', '6A7890', 'B0C8F0')
    heusler_ingot           = @('heap', '98886A', 'E8D0A0')
    terfenol_d_ingot        = @('heap', '8A7E6A', 'D8C8A8')
    ni_mn_ga_ingot          = @('heap', 'A0A890', 'D0D8C0')
    ta_foil                 = @('sail', '5A6A88', 'A0B8D8')
    pt_sheet                = @('sail', 'B8BCC8', 'F0F4FF')
    dysco3_substrate        = @('card', 'D8D0C0', 'F8F0E0')
    ggg_wafer               = @('card', 'B8C8A8', 'E0F0D0')
    hbn_crystal             = @('crystal', 'E0E4F0', 'FFFFFF')
    wte2_crystal            = @('crystal', '505868', '90A0C0')
    fgt_crystal             = @('crystal', '6A5058', 'B88890')
    mtj_stack_wafer         = @('card', '3A4A70', '70B0FF')
    mram_stack_wafer        = @('card', '3A4A70', '70FFC0')
    saf_track_wafer         = @('card', '3A4A70', 'FFB070')
    mtj_die                 = @('chip', '34406A', '60D0FF')
    mram_wafer              = @('card', '2E3A5A', '60FFB0')
    srruo3_electrode_wafer  = @('card', '3A3038', 'C0A0D8')
    me_switch_wafer         = @('card', '5A3A58', 'F890D0')
    sot_readout_stack       = @('card', '2E4A58', '70F0E0')
    meso_logic_die          = @('chip', '4A3470', 'D080FF')
    racetrack_chip          = @('chip', '30445A', 'FFE070')
    magnonic_bus            = @('module', '2E5A48', '90FFC0')
    sin_membrane            = @('sail', '5A6A78', 'B8D0E0')
    nanoaperture_array      = @('card', '2A3040', 'E0F0FF')
    rf_carpet_board         = @('card', '2E5A3A', 'D0C070')
    kr_f2_premix            = @('vial', 'B8A0D8', 'F0E0FF')
    krf_excimer_laser       = @('capsule', '504A78', 'FF70A0')
    pt_lpe_crucible         = @('spool', 'B8BCC8', 'FFF0B0')
    gas_stopping_cell       = @('capsule', '6A7A90', 'A8F0F8')
    shequid_gyro            = @('orb', '4A6A98', 'E0FFFF')
    stno_stack_wafer        = @('card', '4A3A70', 'A0A0FF')
    stno_array              = @('chip', '3A3A78', '80A0FF')
    gum_metal_billet        = @('heap', '8A94A0', 'D0DCE8')
    gum_metal_blank         = @('cartridge', '7A8490', 'C0CCD8')
    gum_metal_flexspline    = @('spool', '8A94A0', 'E0E8F0')
    uxv_strain_wave_gear    = @('spool', '5A6070', 'FFC060')
    encoder_ring            = @('spool', '4A5468', '80E0F0')
    multipole_encoder_ring  = @('spool', '4A4868', 'F080E0')
    tmr_encoder             = @('chip', '3A4868', 'F0F080')
    ga2o3_wafer             = @('card', 'D0D8E0', 'FFFFFF')
    ga2o3_power_die         = @('chip', '5A6A88', 'FFE0A0')
    mu_metal_foil           = @('sail', '70788A', 'C0C8DC')
    shielded_interposer     = @('module', '5A6078', 'B0F0D0')
    finemet_ribbon          = @('sail', '8A8EA0', 'D8DCEC')
    finemet_toroid          = @('spool', '8A8EA0', 'F0F4FF')
    finemet_core            = @('spool', '6A6E80', 'A8B0D0')
    uxv_voltage_coil        = @('spool', '5A4A88', 'FFD0A0')
    fm257_target            = @('cartridge', '7A6070', 'F0A0C0')
    cm248_target            = @('cartridge', '6A5A80', 'D8B0F0')
    element_121_recoil      = @('card', '2A2848', 'FFB860')
    element_122_recoil      = @('card', '2A2848', '60FFC8')
    superheavy_census_iii   = @('card', '24203C', 'FFF090')
    spent_actinide_target   = @('cartridge', '4A4A3A', 'A8D060')
    u238_ion_source         = @('orb', '4A5A48', 'D8F060')
    u238_beam_charge        = @('vial', '587A50', 'F0FF70')
    island_nuclide          = @('crystal', '3A5088', 'A0D0FF')
    island_chart            = @('card', '1E2A48', '90E0FF')
    tetrataenite_lamination = @('sail', '8A7A70', 'C8B8A8')
    tetrataenite_rotor      = @('spool', '8A7A70', 'F0D8C0')
    strand_stator           = @('spool', '6A5A40', 'F0D890')
    strand_tape             = @('sail', 'C8B070', 'F8E8B0')
    alip_duct               = @('capsule', '7A8098', 'E0A060')
    w184_cvi_preform        = @('assembly', '3A3E4C', '9098B0')
    terfenol_d_rod          = @('capsule', '8A7E6A', 'E0D0B0')
    ni_mn_ga_crystal        = @('crystal', 'A0A890', 'E0E8D0')
    cnt_bumper_weave        = @('assembly', '2E3038', '7088A0')
    cnt_whipple_shield      = @('module', '2E3038', '80A0C0')
    frc_cartridge           = @('cartridge', '3A4888', 'A0E8FF')
    gamma_laser_module      = @('module', '3A3A58', 'B0FFB0')
    positron_stack          = @('vial', '5A4A88', 'FFA0FF')
    ti44_core               = @('orb', '7A7E90', 'FFD890')
    si28_ash                = @('heap', '787C88', 'B0B8C8')
    raw_pasta               = @('heap', 'B8A888', 'F0E0B8')
    spaghetti_phase         = @('spool', 'C8B070', 'F8E8A0')
    lasagna_phase           = @('sail', 'D8C080', 'F8F0B8')
    gnocchi_fragment        = @('orb', 'C8B488', 'F0E4C0')
    anti_phase_residue      = @('heap', '70608A', 'B8A8D8')
    lasagna_plate           = @('card', 'D0B870', 'F8ECB0')
    pasta_core_sample       = @('vial', 'B8A070', 'F0DC98')
    ejecta_knot_dust        = @('heap', '8A5A48', 'D8A078')
    refractory_condensate   = @('heap', '7A7078', 'C0B8C8')
    metal_condensate        = @('heap', '8A8E98', 'D0D8E0')
    silicate_condensate     = @('heap', '8A7A68', 'D0C0A8')
    vela_glitch_timing      = @('card', '1A2A48', '70C0FF')
    vela_glitch_record      = @('card', '22204A', 'C0A0FF')
    cygnus_vlbi_record      = @('card', '1A2E3A', '70E0D0')
    elevator_log            = @('card', '2A2A3A', 'FFD070')
    ti44_map                = @('card', '2A3040', 'FFA060')
    arm_chart               = @('card', '1E2A38', '90C8FF')
    bulge_chart             = @('card', '38261E', 'FFB878')
    pasta_strand_repeater   = @('orb', '3A3A68', 'F8E090')
}
$Blocks = @('uxv_fusion_casing')

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
        'uxv_fusion_casing' {
            $weave = Hex '3C3E4E'; $seam = Hex 'E0D0FF'; $edge = Hex '24242E'
            for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
                $col = Get-Tone $weave $x $y 601
                if ((($x + $y) % 4) -eq 0) { $col = Shade $weave 0.8 }
                if ($x -eq 0 -or $y -eq 0 -or $x -eq 15 -or $y -eq 15) { $col = $edge }
                if (($x -eq 7 -or $x -eq 8) -and $y -ge 2 -and $y -le 13) { $col = Shade $seam (1.0 - 0.02 * $y) }
                if (($y -eq 7 -or $y -eq 8) -and $x -ge 2 -and $x -le 13) { $col = Shade $seam (1.0 - 0.02 * $x) }
                Set-Px $c $x $y $col
            } }
        }
    }
    return $c
}

$Outputs = [ordered]@{}
foreach ($n in $Items.Keys) { $Outputs[$n] = [pscustomobject]@{ Rel = "item/$n.png"; Group = 'items' } }
foreach ($n in $Blocks) { $Outputs[$n] = [pscustomobject]@{ Rel = "block/uxv/$n.png"; Group = 'blocks' } }

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
    $src = Get-Content -LiteralPath (Join-Path $RepoRoot 'pack\kubejs\startup_scripts\grindless\uxv\foundation.js') -Raw
    foreach ($n in $Items.Keys) { if ($src -notmatch "(?m)^\s+$n\s*:\s*\{") { Add-Problem $n 'drawn here but not registered by foundation.js' } }
    foreach ($b in $Blocks) { if ($src -notmatch "grindless:block/uxv/${b}'") { Add-Problem $b 'block texture not referenced by foundation.js' } }
    $reg = [regex]::Match($src, '(?s)const ITEMS = \{(.*?)\n  \}').Groups[1].Value
    foreach ($m in [regex]::Matches($reg, '(?m)^\s+([a-z0-9_]+)\s*:')) { if (-not $Items.Contains($m.Groups[1].Value)) { Add-Problem $m.Groups[1].Value 'registered by foundation.js but not drawn here' } }
}
if ($problems -gt 0) { throw "$problems problem(s) in the texture checks (see the warnings above)" }
Write-Host "wrote $($written.Count) textures to $OutRoot"

if ($Credits) {
    Write-Host ''
    foreach ($rel in $written) {
        Write-Host ("| ``pack/kubejs/assets/grindless/textures/$rel`` | Generated with tools/assets/$ScriptName (procedural pixel art, original) by the assets agent (UXV-F1) | the pack's licence (pending; proposed CC BY-SA 4.0) |")
    }
}
