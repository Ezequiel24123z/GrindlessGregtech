<#
.SYNOPSIS
  Procedural 16x16 pixel art for the foundations of the UEV era of Gregtech Grindless (package UEV-F1, shared registrations):
  32 items and three block textures (GregTech style: top-left light, 3-4 tones per material, selective outlines).

.DESCRIPTION
  Every pixel is drawn by this script (the shape routines of the UHV foundation script with a new palette per item); nothing is copied
  or edited from GregTech Modern, GCYR or any other mod. Output is deterministic: re-running overwrites the same bytes (mottles come
  from Get-Noise, a hash of the position, not from a random generator). The materials need no PNG (GregTech draws them from their
  colour), and the HfTaCN coil block borrows GregTech's tritanium coil texture, the one S0-7 proved.

  Writes (under pack/kubejs/assets/grindless/textures/):
      item/<name>.png for the 32 items that startup_scripts/grindless/uev/foundation.js registers (see $Items below).
      block/uev/uev_fusion_casing.png               dark tungsten tiles with a hot orange seam; seamless.
      block/uev/degenerate_containment_casing.png   violet-black shell with a bright core ring; seamless.
      block/uev/photonic_casing.png                 white cleanroom panels with a cyan light strip; seamless.

  Run from the repo root:
      powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-UEVFoundationTextures.ps1
      powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-UEVFoundationTextures.ps1 -Only snspd,photonic_casing -Credits

  Every pixel is fully opaque or fully transparent and none is pure black; the block textures have all 256 pixels opaque and the item
  icons have a transparent corner and at least 20 opaque pixels. The final check fails the run (non-zero exit) if a written file breaks
  one of these rules, if two textures are identical, or if the set of outputs differs from the items and blocks that foundation.js
  registers.

.PARAMETER Only
  Subset of output names (e.g. snspd, photonic_casing) or groups: items, blocks (comma-separated, also as one string with -File).
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
    uev_electric_motor            = @('module', '6A7A9A', '9FE8FF')
    uev_electric_pump             = @('capsule', '7A8AA0', '5AB8E8')
    uev_conveyor_module           = @('module', '5A6070', 'E8C050')
    uev_electric_piston           = @('capsule', '8A909C', 'E86A4A')
    uev_robot_arm                 = @('assembly', '8A8EA0', 'FFB84A')
    uev_sensor                    = @('chip', '4A5A78', '7AFFC8')
    uev_emitter                   = @('chip', '5A4A78', 'FF7AE0')
    uev_field_generator           = @('orb', '3A4A8A', '9FE8FF')
    ca48_beam                     = @('cartridge', '7A8A9A', 'F0F0D8')
    target_wheel                  = @('spool', '9A9AA8', 'E87A3A')
    tennessine_sample             = @('vial', 'B8C0D0', 'C85AF0')
    superheavy_census             = @('card', '2A2E4A', 'E8D870')
    degenerate_eos_model          = @('card', '3A2A58', 'B07AFF')
    barnard_gravity_survey        = @('card', '5A3A3A', 'E88A5A')
    quantum_repeater_node         = @('orb', '2A3A58', '5AF0E0')
    pulsar_navigation_chart       = @('card', '12183A', '7AB8FF')
    mass_radius_chart             = @('card', '2E3A2A', 'A8E87A')
    degenerate_matter             = @('heap', '2A2438', 'C890FF')
    degenerate_pellet             = @('orb', '382A50', 'E0B0FF')
    sx_blade                      = @('sail', 'A8ACB8', 'E8E8F0')
    sic_sic_plate                 = @('card', '3A4640', '7AB8A0')
    wf_w_tile                     = @('card', '6A6A76', 'B8B8C8')
    snspd                         = @('chip', '28303E', '7AD8FF')
    qd_source                     = @('chip', '3A2E48', 'FF9A5A')
    sdd                           = @('chip', '5A6068', 'E8E060')
    lobster_eye_mcp               = @('card', '3E4450', 'A8C8E0')
    aerogel_tile                  = @('card', 'C8DCEC', 'F4FAFF')
    hollow_core_fibre             = @('spool', 'D8E8F0', '9AD8FF')
    faraday_isolator              = @('cartridge', '4A5A4A', '9AE8A0')
    bonded_fe16n2_magnet          = @('capsule', '4A4E5A', 'E85A5A')
    barnard_core_rock             = @('heap', '7A4A3A', 'E8A878')
    uev_smes_cell                 = @('cartridge', '2E3A5A', '7AF0FF')
}
$Blocks = @('uev_fusion_casing', 'degenerate_containment_casing', 'photonic_casing')

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
        'uev_fusion_casing' {
            $tile = Hex '4A4A56'; $seam = Hex 'E8782A'; $edge = Hex '2E2E38'
            for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
                $col = Get-Tone $tile $x $y 401
                if ($x -eq 0 -or $y -eq 0 -or $x -eq 15 -or $y -eq 15) { $col = $edge }
                if (($x -eq 7 -or $x -eq 8) -and $y -ge 2 -and $y -le 13) { $col = Shade $seam (1.1 - 0.02 * $y) }
                if (($y -eq 7 -or $y -eq 8) -and $x -ge 2 -and $x -le 13) { $col = Shade $seam (1.1 - 0.02 * $x) }
                Set-Px $c $x $y $col
            } }
        }
        'degenerate_containment_casing' {
            $shell = Hex '2A2238'; $ring = Hex 'D8A0FF'; $mount = Hex '6A5A84'
            for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
                $col = Get-Tone $shell $x $y 402
                $dx = $x - 7.5; $dy = $y - 7.5; $r = [Math]::Sqrt($dx * $dx + $dy * $dy)
                if ($r -ge 3.6 -and $r -le 5) { $col = Shade $ring (1.15 - 0.02 * ($x + $y)) }
                if ($r -lt 2) { $col = Shade $ring 0.7 }
                if ($x -eq 0 -or $y -eq 0 -or $x -eq 15 -or $y -eq 15) { $col = $mount }
                Set-Px $c $x $y $col
            } }
        }
        'photonic_casing' {
            $panel = Hex 'E6EAEE'; $seam = Hex '9AA4B0'; $light = Hex '5AE8F0'
            for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
                $col = Get-Tone $panel $x $y 403
                if ($x -eq 0 -or $y -eq 0 -or $x -eq 15 -or $y -eq 15) { $col = $seam }
                if ($y -ge 7 -and $y -le 8 -and $x -ge 2 -and $x -le 13) { $col = $light }
                if (($x -eq 3 -or $x -eq 12) -and ($y -eq 3 -or $y -eq 12)) { $col = Shade $seam 0.8 }
                Set-Px $c $x $y $col
            } }
        }
    }
    return $c
}

$Outputs = [ordered]@{}
foreach ($n in $Items.Keys) { $Outputs[$n] = [pscustomobject]@{ Rel = "item/$n.png"; Group = 'items' } }
foreach ($n in $Blocks) { $Outputs[$n] = [pscustomobject]@{ Rel = "block/uev/$n.png"; Group = 'blocks' } }

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
    $src = Get-Content -LiteralPath (Join-Path $RepoRoot 'pack\kubejs\startup_scripts\grindless\uev\foundation.js') -Raw
    foreach ($n in $Items.Keys) { if ($src -notmatch "(?m)^\s+$n\s*:\s*\{") { Add-Problem $n 'drawn here but not registered by foundation.js' } }
    foreach ($b in $Blocks) { if ($src -notmatch "grindless:block/uev/${b}'") { Add-Problem $b 'block texture not referenced by foundation.js' } }
    $reg = [regex]::Match($src, '(?s)const ITEMS = \{(.*?)\n  \}').Groups[1].Value
    foreach ($m in [regex]::Matches($reg, '(?m)^\s+([a-z0-9_]+)\s*:')) { if (-not $Items.Contains($m.Groups[1].Value)) { Add-Problem $m.Groups[1].Value 'registered by foundation.js but not drawn here' } }
}
if ($problems -gt 0) { throw "$problems problem(s) in the texture checks (see the warnings above)" }
Write-Host "wrote $($written.Count) textures to $OutRoot"

if ($Credits) {
    Write-Host ''
    foreach ($rel in $written) {
        Write-Host ("| ``pack/kubejs/assets/grindless/textures/$rel`` | Generated with tools/assets/$ScriptName (procedural pixel art, original) by the assets agent (UEV-F1) | the pack's licence (pending; proposed CC BY-SA 4.0) |")
    }
}
