<#
.SYNOPSIS
  Procedural 16x16 pixel art for the foundations of the UV era of Gregtech Grindless (package UV-F1, shared registrations):
  33 items and three block textures (GregTech style: top-left light, 3-4 tones per material, selective outlines).

.DESCRIPTION
  Every pixel is drawn by this script (twelve small shape routines with a palette per item); nothing is copied or edited from GregTech
  Modern, GCYR or any other mod. Output is deterministic: re-running overwrites the same bytes (mottles come from Get-Noise, a hash of
  the position, not from a random generator). The sixteen materials need no PNG: GregTech draws them from their colour.

  Writes (under pack/kubejs/assets/grindless/textures/):
    item/<name>.png for the 33 items that startup_scripts/grindless/uv/foundation.js registers (see $Items below for the shape kind
    and the two colours of each: heaps, orbs, cards, vials, cartridges, spools, crystals, modules, capsules, chips, sails, assemblies).
    block/uv/laser_module_block.png      dark plates with two rows of red lenses; seamless.
    block/uv/srf_cryomodule_block.png    frosted white-blue shell with niobium-grey ribs and copper bands; seamless.
    block/uv/bnnt_fuel_tank_side.png     white-grey tank wall with three dark bands and rivets; seamless.

  Run from the repo root:
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-UVFoundationTextures.ps1
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-UVFoundationTextures.ps1 -Only hbn_dust,laser_module_block -Credits

  Every pixel is fully opaque or fully transparent and none is pure black; the block textures have all 256 pixels opaque and the item
  icons have a transparent corner and at least 20 opaque pixels. The final check fails the run (non-zero exit) if a written file breaks
  one of these rules, if two textures are identical, or if the set of outputs differs from the items and blocks that foundation.js
  registers.

.PARAMETER Only
  Subset of output names (e.g. hbn_dust, laser_module_block) or groups: items, blocks (comma-separated, also as one string with -File).
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
    thorium_oxide_fuel_assembly   = @('assembly', '9AA3A8', '2E8F6A')
    thorium_nitride_fuel_assembly = @('assembly', '8E8AA8', 'C8B040')
    spent_thorium_oxide_fuel      = @('assembly', '5A5E55', '7FD04A')
    spent_thorium_nitride_fuel    = @('assembly', '4E4A5E', 'A8E040')
    curium_244_pellet             = @('capsule', 'B8A58A', 'E86A30')
    gphs_module                   = @('module', '6E7078', 'E0A030')
    carbon_carbon_aeroshell       = @('sail', '3A3A44', '8A8C98')
    pb11_capsule                  = @('capsule', 'C9CCD2', 'D0402A')
    d_he3_capsule                 = @('capsule', 'D8D2B8', '3A8FD0')
    srf_cryomodule                = @('module', 'C8D8E8', '9A9CA8')
    antiproton_cartridge          = @('cartridge', '3B3F58', 'FF4E8A')
    fibre_laser_module            = @('module', '7A2A32', 'FF7A6A')
    ytterbium_fibre               = @('spool', 'B8C0A0', 'F0E070')
    ingaas_pump_module            = @('chip', '4A3A58', 'FF9A40')
    hpge_crystal                  = @('crystal', 'A8B8C8', 'F0F8FF')
    snspd_array                   = @('chip', '28406A', '58E0FF')
    hbn_dust                      = @('heap', 'E4E4E8', 'A8D0F0')
    bnnt_yarn                     = @('spool', 'E8E8F0', '9AB0D8')
    ented_powder                  = @('heap', '2A2438', 'B070FF')
    neutronium_am_powder          = @('heap', '3A4A5A', 'FFFFFF')
    darmstadtium_am_powder        = @('heap', '3C6A48', 'C8F0A0')
    tritanium_am_powder           = @('heap', '8A3A3A', 'F0B0A0')
    light_sail                    = @('sail', 'D8E8F4', 'F0D060')
    starchip                      = @('chip', '2C3A30', '70F090')
    sailcraft                     = @('sail', 'B0B8C8', 'E06060')
    starshot_probe                = @('cartridge', '9AA0B0', '60D0FF')
    triton_ice_core               = @('orb', 'E8B8C8', '8AD0F0')
    sputnik_ice_core              = @('orb', 'F0F0F4', 'C8A090')
    charon_core                   = @('orb', '8A6A5A', 'D8C8B8')
    planetesimal_sample           = @('vial', 'B8A890', '60B0D0')
    heliopause_data               = @('card', 'E0A030', '3A4ABA')
    proxima_approach_data         = @('card', 'C04A38', 'F0D8A0')
    sgr_a_star_image              = @('card', '1E1A2E', 'FF9A30')
}
$Blocks = @('laser_module_block', 'srf_cryomodule_block', 'bnnt_fuel_tank_side')

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
        'laser_module_block' {
            $plate = Hex '3A3640'; $lens = Hex 'FF5A4A'; $rim = Hex '6A6472'
            for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
                $col = Get-Tone $plate $x $y 201
                if ($x -eq 0 -or $y -eq 0 -or $x -eq 15 -or $y -eq 15) { $col = $rim }
                if (($y -eq 4 -or $y -eq 5 -or $y -eq 10 -or $y -eq 11) -and $x -ge 3 -and $x -le 12 -and $x % 3 -ne 0) { $col = $lens }
                Set-Px $c $x $y $col
            } }
        }
        'srf_cryomodule_block' {
            $shell = Hex 'D4E4F0'; $rib = Hex '8A8E9C'; $cu = Hex 'C87A3A'
            for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
                $col = Get-Tone $shell $x $y 202
                if ($x -eq 0 -or $x -eq 15 -or $y -eq 0 -or $y -eq 15) { $col = $rib }
                if ($y -eq 5 -or $y -eq 10) { $col = $cu }
                if ($x -eq 7 -or $x -eq 8) { $col = Shade $rib (1.1 - 0.02 * $y) }
                Set-Px $c $x $y $col
            } }
        }
        'bnnt_fuel_tank_side' {
            $wall = Hex 'DCDCE4'; $band = Hex '4A4C5A'; $rivet = Hex 'F4F4F8'
            for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
                $col = Get-Tone $wall $x $y 203
                if ($y -eq 1 -or $y -eq 7 -or $y -eq 8 -or $y -eq 14) { $col = Shade $band (1.15 - 0.02 * $x) }
                if (($y -eq 3 -or $y -eq 12) -and ($x % 4) -eq 1) { $col = $rivet }
                Set-Px $c $x $y $col
            } }
        }
    }
    return $c
}

$Outputs = [ordered]@{}
foreach ($n in $Items.Keys) { $Outputs[$n] = [pscustomobject]@{ Rel = "item/$n.png"; Group = 'items' } }
foreach ($n in $Blocks) { $Outputs[$n] = [pscustomobject]@{ Rel = "block/uv/$n.png"; Group = 'blocks' } }

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
    $src = Get-Content -LiteralPath (Join-Path $RepoRoot 'pack\kubejs\startup_scripts\grindless\uv\foundation.js') -Raw
    foreach ($n in $Items.Keys) { if ($src -notmatch "(?m)^\s+$n\s*:\s*\{") { Add-Problem $n 'drawn here but not registered by foundation.js' } }
    foreach ($b in @('laser_module_block', 'srf_cryomodule_block', 'bnnt_fuel_tank')) { if ($src -notmatch "grindless:block/uv/${b}(_side)?'") { Add-Problem $b 'block texture not referenced by foundation.js' } }
}
if ($problems -gt 0) { throw "$problems problem(s) in the texture checks (see the warnings above)" }
Write-Host "wrote $($written.Count) textures to $OutRoot"

if ($Credits) {
    Write-Host ''
    foreach ($rel in $written) {
        Write-Host ("| ``pack/kubejs/assets/grindless/textures/$rel`` | Generated with tools/assets/$ScriptName (procedural pixel art, original) by the assets agent (UV-F1) | the pack's licence (pending; proposed CC BY-SA 4.0) |")
    }
}
