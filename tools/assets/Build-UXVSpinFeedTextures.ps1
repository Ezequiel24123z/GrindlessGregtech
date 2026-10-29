<#
.SYNOPSIS
  Procedural 16x16 pixel art for the spintronic feedstock items of the UXV era of Gregtech Grindless (package UXV-A2):
  the 37 items that startup_scripts/grindless/uxv/spin_feed.js registers (GregTech style: top-left light, 3-4 tones per material).

.DESCRIPTION
  Every pixel is drawn by this script (the shape routines of the UXV foundation script with a new palette per item); nothing is copied
  or edited from GregTech Modern or any other mod. Output is deterministic: re-running overwrites the same bytes.
  Families: oxide and metal dusts and charges (heaps), 5N/7N metals (crystals), fume (orb), dross (heap), AM powders (vials),
  near-net parts (capsules), HIP blanks and the spent target (cartridges).

  Writes pack/kubejs/assets/grindless/textures/item/<name>.png.

  Run from the repo root:
      powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-UXVSpinFeedTextures.ps1
      powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-UXVSpinFeedTextures.ps1 -Only bfo_fume -Credits

  Every pixel is fully opaque or fully transparent, none is pure black, the corner is transparent and each icon has at least 20 opaque
  pixels. The final check fails the run if a file breaks one of these rules, if two textures are identical, or if the drawn set differs
  from the items spin_feed.js registers.

.PARAMETER Only
  Subset of item names (comma-separated, also as one string with -File).
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
    dysprosium_oxide_dust    = @('heap', 'C8B8A0', 'F0E4CC')
    dysprosium_dust          = @('heap', '8A8E98', 'C8D0DC')
    scandium_oxide_dust      = @('heap', 'D8D4E0', 'FFFFFF')
    strontium_carbonate_dust = @('heap', 'E4E0D0', 'FFFFF0')
    magnesium_hydroxide_dust = @('heap', 'D0DCD8', 'F4FFFA')
    five_n_magnesia_dust     = @('heap', 'EEEEE6', 'FFFFFF')
    five_n_platinum          = @('crystal', 'B8BCC8', 'F0F4FF')
    five_n_ruthenium         = @('crystal', '7A8098', 'C0C8E0')
    five_n_iridium           = @('crystal', 'A8B0B8', 'E8F0F4')
    seven_n_tellurium        = @('crystal', '70788A', 'B0C0D8')
    seven_n_germanium        = @('crystal', '8A9A98', 'D0E8E0')
    bfo_fume                 = @('orb', '8A5A48', 'E0A088')
    lpe_dross                = @('heap', '5A5A64', 'A0A0B0')
    dysco3_charge_dust       = @('heap', 'B8A890', 'E8D8B8')
    ggg_charge_dust          = @('heap', 'A8B898', 'D8F0C8')
    srruo3_charge_dust       = @('heap', '3A3038', '9A80A8')
    la_bfo_charge_dust       = @('heap', 'A86850', 'E8B090')
    gum_metal_blend          = @('heap', '7A8490', 'C8D4E0')
    cofeb_am_powder          = @('vial', '6A7890', 'B0C8F0')
    heusler_am_powder        = @('vial', '98886A', 'E8D0A0')
    mgo_am_powder            = @('vial', 'C8C8C0', 'F8F8F0')
    ruthenium_am_powder      = @('vial', '7A8098', 'C0C8E0')
    srruo3_am_powder         = @('vial', '3A3038', '9A80A8')
    la_bfo_am_powder         = @('vial', 'A86850', 'E8B090')
    near_net_cofeb_blank     = @('capsule', '6A7890', 'A8C0E8')
    near_net_heusler_blank   = @('capsule', '98886A', 'E0C890')
    near_net_mgo_blank       = @('capsule', 'C8C8C0', 'F0F0E8')
    near_net_saf_blank       = @('capsule', '58606E', 'D0A878')
    near_net_srruo3_blank    = @('capsule', '3A3038', '8A7090')
    near_net_la_bfo_blank    = @('capsule', 'A86850', 'F0B898')
    cofeb_hip_blank          = @('cartridge', '7A88A0', 'C0D8FF')
    heusler_hip_blank        = @('cartridge', 'A8986A', 'F0DCA0')
    mgo_hip_blank            = @('cartridge', 'D8D8D0', 'FFFFF8')
    saf_hip_blank            = @('cartridge', '68707E', 'E0B888')
    srruo3_hip_blank         = @('cartridge', '4A4048', 'A888B8')
    la_bfo_hip_blank         = @('cartridge', 'B87860', 'F8C8A8')
    spent_cofeb_target       = @('cartridge', '4A4A3A', '8A9060')
}

function Get-Tone {
    param([int]$Argb, [int]$X, [int]$Y, [int]$Salt)
    $f = 1.2 - 0.035 * ($X + $Y)
    $n = Get-Noise $X $Y $Salt
    if ($n -lt 110) { $f *= 0.86 } elseif ($n -gt 900) { $f *= 1.14 }
    return (Shade $Argb $f)
}

function Test-Shape {
    param([string]$Kind, [int]$X, [int]$Y)
    $dx = $X - 7.5; $dy = $Y - 7.5
    $r = [Math]::Sqrt($dx * $dx + $dy * $dy)
    switch ($Kind) {
        'heap'      { $h = 9 - [Math]::Abs($dx) * 1.1; return ($Y -ge 14 - $h -and $Y -le 14 -and $h -gt 0) }
        'orb'       { return ($r -le 6.2) }
        'vial'      { return (($X -ge 6 -and $X -le 9 -and $Y -ge 1 -and $Y -le 4) -or ($X -ge 4 -and $X -le 11 -and $Y -ge 5 -and $Y -le 14)) }
        'cartridge' { return ($X -ge 1 -and $X -le 14 -and $Y -ge 3 -and $Y -le 12) }
        'crystal'   { return ([Math]::Abs($dx) + [Math]::Abs($dy) -le 7.2) }
        'capsule'   { return ($X -ge 5 -and $X -le 10 -and $Y -ge 2 -and $Y -le 13 -and -not (($Y -eq 2 -or $Y -eq 13) -and ($X -eq 5 -or $X -eq 10))) }
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
        'vial'      { return ($Y -le 4 -or $Y -ge 9) }
        'cartridge' { return ($Y -ge 5 -and $Y -le 10 -and ($X % 5) -ge 1 -and ($X % 5) -le 3) }
        'crystal'   { return ($X -ge 8 -and $Y -ge 8) }
        'capsule'   { return ($Y -ge 5 -and $Y -le 10) }
    }
    return $false
}

function New-Item16 {
    param([string]$Name, [string[]]$Spec)
    $c = New-Canvas 16 16
    $salt = 0; foreach ($ch in $Name.ToCharArray()) { $salt = ($salt * 31 + [int]$ch) % 9973 }
    $body = Hex $Spec[1]; $accent = Hex $Spec[2]
    for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
        if (-not (Test-Shape $Spec[0] $x $y)) { continue }
        $base = $body; if (Test-Accent $Spec[0] $x $y $salt) { $base = $accent }
        Set-Px $c $x $y (Get-Tone $base $x $y $salt)
    } }
    Add-Outline $c
    return $c
}

$written = @()
foreach ($n in $Items.Keys) {
    if ($OnlySet.Count -gt 0 -and $OnlySet -notcontains $n) { continue }
    $c = New-Item16 $n $Items[$n]
    Save-Png $c (Join-Path $OutRoot "item/$n.png")
    $written += "item/$n.png"
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
    $src = Get-Content -LiteralPath (Join-Path $RepoRoot 'pack\kubejs\startup_scripts\grindless\uxv\spin_feed.js') -Raw
    $reg = [regex]::Match($src, '(?s)const ITEMS = \{(.*?)\n  \}').Groups[1].Value
    $regNames = @(); foreach ($m in [regex]::Matches($reg, '(?m)^\s+([a-z0-9_]+)\s*:')) { $regNames += $m.Groups[1].Value }
    foreach ($n in $Items.Keys) { if ($regNames -notcontains $n) { Add-Problem $n 'drawn here but not registered by spin_feed.js' } }
    foreach ($n in $regNames) { if (-not $Items.Contains($n)) { Add-Problem $n 'registered by spin_feed.js but not drawn here' } }
}
if ($problems -gt 0) { throw "$problems problem(s) in the texture checks (see the warnings above)" }
Write-Host "wrote $($written.Count) textures to $OutRoot"

if ($Credits) {
    Write-Host ''
    foreach ($rel in $written) {
        Write-Host ("| ``pack/kubejs/assets/grindless/textures/$rel`` | Generated with tools/assets/$ScriptName (procedural pixel art, original) by the assets agent (UXV-A2) | the pack's licence (pending; proposed CC BY-SA 4.0) |")
    }
}
