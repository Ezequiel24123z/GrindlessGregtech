<#
.SYNOPSIS
  Procedural 16x16 pixel art for the foundations of the UIV era of Gregtech Grindless (package UIV-F1, shared registrations):
  34 items and two block textures (GregTech style: top-left light, 3-4 tones per material, selective outlines).

.DESCRIPTION
  Every pixel is drawn by this script (the shape routines of the UEV foundation script with a new palette per item); nothing is copied
  or edited from GregTech Modern, GCYR or any other mod. Output is deterministic: re-running overwrites the same bytes (mottles come
  from Get-Noise, a hash of the position, not from a random generator). The materials need no PNG (GregTech draws them from their
  colour), and the metallic hydrogen coil block borrows GregTech's tritanium coil texture.

  Writes (under pack/kubejs/assets/grindless/textures/):
      item/<name>.png for the 34 items that startup_scripts/grindless/uiv/foundation.js registers (see $Items below).
      block/uiv/uiv_fusion_casing.png          dark tungsten tiles with a white-hot seam; seamless.
      block/uiv/neutron_star_site_casing.png   blue-black shell with a bright core ring; seamless.

  Run from the repo root:
      powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-UIVFoundationTextures.ps1
      powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-UIVFoundationTextures.ps1 -Only p_si_die,uiv_fusion_casing -Credits

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
    uiv_electric_motor         = @('module', '6A809A', 'A8F0FF')
    uiv_electric_pump          = @('capsule', '7A90A8', '5AD0F0')
    uiv_conveyor_module        = @('module', '5A6878', 'F0D060')
    uiv_electric_piston        = @('capsule', '8A98A8', 'F0785A')
    uiv_robot_arm              = @('assembly', '8A94A8', 'FFC85A')
    uiv_sensor                 = @('chip', '4A6080', '8AFFD8')
    uiv_emitter                = @('chip', '604A80', 'FF8AF0')
    uiv_field_generator        = @('orb', '3A509A', 'A8F0FF')
    ti50_oven_charge           = @('cartridge', '8A94A0', 'C8D4E0')
    element_119_recoil         = @('card', '2A3248', 'F0A850')
    element_120_recoil         = @('card', '2A3248', '58E8B0')
    superheavy_census_ii       = @('card', '30204A', 'F0E080')
    u238_flash_target          = @('spool', '5A7A58', 'E8F058')
    mh_winding                 = @('spool', '8AA0C0', 'D8F0FF')
    h_si28_wafer               = @('card', '5A6478', '9AD8FF')
    p_si_die                   = @('chip', '48506A', 'FFA85A')
    eo_microcomb               = @('chip', '3A4A68', '5AF0F0')
    telecom_memory             = @('chip', '5A3A68', 'F05AD0')
    mk_cryostat_module         = @('module', 'A8B8C8', '5A90F0')
    data_crystal_5d            = @('crystal', '6A90C0', 'E0F0FF')
    wf_rhea_billet             = @('cartridge', '7A7A8A', 'D0D0E0')
    ps_cooling_laser           = @('capsule', '5A4878', 'FF5A78')
    cage_part                  = @('assembly', '6A6E80', 'B0B8D0')
    sled_charge                = @('cartridge', '3A4060', 'F08A3A')
    neutronium_pellet          = @('orb', '2A2A40', 'C8C8F0')
    j0437_pulse_raw            = @('card', '1A2240', '6A9AF0')
    xray_pulse_timed           = @('card', '1A2A40', '8AF0C8')
    pulsar_navigation_solution = @('card', '12183A', '9AC0FF')
    kerr_probe_data            = @('card', '3A1A30', 'F07A9A')
    correlated_kerr_data       = @('card', '30204A', 'D08AFF')
    recovered_half_sled        = @('sail', '7A7E8E', 'D8DCE8')
    ns_eos_chart               = @('card', '1A1E38', 'A8C8FF')
    kerr_chart                 = @('card', '2E1A38', 'F0A8E0')
    pulsar_timed_repeater      = @('orb', '1E2A50', '6AF0FF')
}
$Blocks = @('uiv_fusion_casing', 'neutron_star_site_casing')

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
        'uiv_fusion_casing' {
            $tile = Hex '44445A'; $seam = Hex 'FFF0C8'; $edge = Hex '2A2A3A'
            for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
                $col = Get-Tone $tile $x $y 501
                if ($x -eq 0 -or $y -eq 0 -or $x -eq 15 -or $y -eq 15) { $col = $edge }
                if (($x -eq 7 -or $x -eq 8) -and $y -ge 2 -and $y -le 13) { $col = Shade $seam (1.0 - 0.02 * $y) }
                if (($y -eq 7 -or $y -eq 8) -and $x -ge 2 -and $x -le 13) { $col = Shade $seam (1.0 - 0.02 * $x) }
                Set-Px $c $x $y $col
            } }
        }
        'neutron_star_site_casing' {
            $shell = Hex '1E2438'; $ring = Hex '8AC8FF'; $mount = Hex '5A6A88'
            for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
                $col = Get-Tone $shell $x $y 502
                $dx = $x - 7.5; $dy = $y - 7.5; $r = [Math]::Sqrt($dx * $dx + $dy * $dy)
                if ($r -ge 3.6 -and $r -le 5) { $col = Shade $ring (1.15 - 0.02 * ($x + $y)) }
                if ($r -lt 2) { $col = Shade $ring 0.7 }
                if ($x -eq 0 -or $y -eq 0 -or $x -eq 15 -or $y -eq 15) { $col = $mount }
                Set-Px $c $x $y $col
            } }
        }
    }
    return $c
}

$Outputs = [ordered]@{}
foreach ($n in $Items.Keys) { $Outputs[$n] = [pscustomobject]@{ Rel = "item/$n.png"; Group = 'items' } }
foreach ($n in $Blocks) { $Outputs[$n] = [pscustomobject]@{ Rel = "block/uiv/$n.png"; Group = 'blocks' } }

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
    $src = Get-Content -LiteralPath (Join-Path $RepoRoot 'pack\kubejs\startup_scripts\grindless\uiv\foundation.js') -Raw
    foreach ($n in $Items.Keys) { if ($src -notmatch "(?m)^\s+$n\s*:\s*\{") { Add-Problem $n 'drawn here but not registered by foundation.js' } }
    foreach ($b in $Blocks) { if ($src -notmatch "grindless:block/uiv/${b}'") { Add-Problem $b 'block texture not referenced by foundation.js' } }
    $reg = [regex]::Match($src, '(?s)const ITEMS = \{(.*?)\n  \}').Groups[1].Value
    foreach ($m in [regex]::Matches($reg, '(?m)^\s+([a-z0-9_]+)\s*:')) { if (-not $Items.Contains($m.Groups[1].Value)) { Add-Problem $m.Groups[1].Value 'registered by foundation.js but not drawn here' } }
}
if ($problems -gt 0) { throw "$problems problem(s) in the texture checks (see the warnings above)" }
Write-Host "wrote $($written.Count) textures to $OutRoot"

if ($Credits) {
    Write-Host ''
    foreach ($rel in $written) {
        Write-Host ("| ``pack/kubejs/assets/grindless/textures/$rel`` | Generated with tools/assets/$ScriptName (procedural pixel art, original) by the assets agent (UIV-F1) | the pack's licence (pending; proposed CC BY-SA 4.0) |")
    }
}
