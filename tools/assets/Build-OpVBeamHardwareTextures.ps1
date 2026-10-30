<#
.SYNOPSIS
  Procedural 16x16 pixel art for the OpV beam hardware of Gregtech Grindless (package OpV-D1, process lines 20-25): 22 items
  (GregTech style: top-left light, 3-4 tones per material, selective outlines).

.DESCRIPTION
  Every pixel is drawn by this script (the shape routines of the OpV foundation script with a new palette per item); nothing is copied
  or edited from GregTech Modern, GCYR, Monifactory or any other mod. Output is deterministic: re-running overwrites the same bytes
  (mottles come from Get-Noise, a hash of the position, not from a random generator). The material (bred tritium gas) needs no PNG
  (GregTech draws it from its colour).

  Writes (under pack/kubejs/assets/grindless/textures/):
      item/<name>.png for the 22 items that startup_scripts/grindless/opv/beam_hardware.js registers (see $Items below).

  Run from the repo root:
      powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-OpVBeamHardwareTextures.ps1
      powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-OpVBeamHardwareTextures.ps1 -Only ceb6_boule -Credits

  Every pixel is fully opaque or fully transparent and none is pure black; the item icons have a transparent corner and at least 20
  opaque pixels. The final check fails the run (non-zero exit) if a written file breaks one of these rules, if two textures are
  identical, or if the set of outputs differs from the items that beam_hardware.js registers.

.PARAMETER Only
  Subset of output names (comma-separated, also as one string with -File).
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
    be_fluoride_dust      = @('heap', 'C8CCD0', 'F0F4F8')
    eb_beryllium_ingot    = @('cartridge', '9AA0A6', 'D8E0E6')
    be_window_foil        = @('sail', 'A8AEB4', 'E8EEF4')
    brazed_be_window      = @('orb', '8A9096', 'E0C890')
    be_window_scrap       = @('heap', '7E848A', 'B8C0C6')
    ir_target_rod         = @('capsule', 'B8BCC4', 'F4F8FF')
    ta_clad_ir_rod        = @('capsule', '6A7084', 'B8C0E0')
    decladded_ir_core     = @('capsule', '8A8E86', 'C8D0A0')
    ir_spallation_residue = @('heap', '5A5A60', '90A0B8')
    li6h_tile             = @('card', 'C8C8B8', 'F4F4E4')
    canned_li6h_block     = @('module', '8E9298', 'D8D8C4')
    ceb6_powder           = @('heap', '5A3E78', '9070C0')
    ceb6_boule            = @('crystal', '4A3070', 'B090F0')
    ceb6_cathode          = @('vial', '6A5A80', 'E0B0FF')
    cooler_electron_gun   = @('assembly', '4A5068', 'C0A0FF')
    pickup_array          = @('chip', '50586A', 'B0E8C8')
    brazed_pickup_tank    = @('module', '6A7078', 'C8F0D8')
    tizrv_ingot           = @('cartridge', '7A8088', 'B8C4A0')
    tizrv_target          = @('orb', '6A7078', 'C8D4A8')
    neg_coated_chamber    = @('spool', '8A8E96', '5E6A58')
    activated_neg_chamber = @('spool', '9AA0A8', '90C870')
    spent_neg_chamber     = @('spool', '6A6C70', '7A6A58')
}

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

$written = @()
foreach ($n in $Items.Keys) {
    if ($OnlySet.Count -gt 0 -and $OnlySet -notcontains $n) { continue }
    $rel = "item/$n.png"
    Save-Png (New-Item16 $n $Items[$n]) (Join-Path $OutRoot $rel)
    $written += $rel
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
    if ((($img.P[0] -shr 24) -band 255) -ne 0) { Add-Problem $rel 'corner pixel is not transparent' }
    if ($opaque -lt 20) { Add-Problem $rel "only $opaque opaque pixels" }
    $k = $img.P -join ','
    if ($keys.ContainsKey($k)) { Add-Problem $rel "identical to $($keys[$k])" } else { $keys[$k] = $rel }
}
if ($OnlySet.Count -eq 0) {
    $src = Get-Content -LiteralPath (Join-Path $RepoRoot 'pack\kubejs\startup_scripts\grindless\opv\beam_hardware.js') -Raw
    $reg = [regex]::Match($src, '(?s)const ITEMS = \{(.*?)\n  \}').Groups[1].Value
    $registered = @{}
    foreach ($m in [regex]::Matches($reg, '(?m)^\s+([a-z0-9_]+)\s*:')) { $registered[$m.Groups[1].Value] = $true }
    foreach ($n in $Items.Keys) { if (-not $registered.ContainsKey($n)) { Add-Problem $n 'drawn here but not registered by beam_hardware.js' } }
    foreach ($n in $registered.Keys) { if (-not $Items.Contains($n)) { Add-Problem $n 'registered by beam_hardware.js but not drawn here' } }
}
if ($problems -gt 0) { throw "$problems problem(s) in the texture checks (see the warnings above)" }
Write-Host "wrote $($written.Count) textures to $OutRoot"

if ($Credits) {
    Write-Host ''
    foreach ($rel in $written) {
        Write-Host ("| ``pack/kubejs/assets/grindless/textures/$rel`` | Generated with tools/assets/$ScriptName (procedural pixel art, original) by the assets agent (OpV-D1) | the pack's licence (pending; proposed CC BY-SA 4.0) |")
    }
}
