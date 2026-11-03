<#
.SYNOPSIS
  Procedural 16x16 block textures for the UXV casing family of Gregtech Grindless (package D4-CASE-UXV).

.DESCRIPTION
  Every pixel is drawn by this script; nothing is copied or edited from GregTech Modern, GCYR or any other mod. Output is
  deterministic (mottles come from Get-Noise, a hash of the position). The UXV era style (violet-tinted etched hardware: stepped
  bevels, etched wear, a grid panel, rim trim, a violet tint, lower luminance) is applied when the file is saved (Era.Lib.ps1).

  Writes (under pack/kubejs/assets/grindless/textures/block/uxv/):
      gum_metal_casing.png            pale titanium-grey with a stepped bevel, a fine etched grid and darker chevron springs in the corners.
      mu_metal_shield_casing.png      bright nickel-silver panels on an etched grid, nested squares for the shielding layers.
      pulsed_field_casing.png         dark coil face with a stepped amber Finemet ring and small pale-blue die squares on the grid lines.
      pasta_containment_casing.png    dark violet-black with glowing magenta parallel striations behind an etched grid window.

  Run from the repo root:
      powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-UXVCasingTextures.ps1
      powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-UXVCasingTextures.ps1 -Only gum_metal_casing -Credits

  The final check fails the run if a texture is not fully opaque, has partial alpha or a pure black pixel, if two textures are
  identical, or if the set of outputs differs from the blocks startup_scripts/grindless/uxv/casings.js registers.

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

function Get-Tone {
    param([int]$Argb, [int]$X, [int]$Y, [int]$Salt)
    $f = 1.2 - 0.035 * ($X + $Y)
    $n = Get-Noise $X $Y $Salt
    if ($n -lt 110) { $f *= 0.86 } elseif ($n -gt 900) { $f *= 1.14 }
    return (Shade $Argb $f)
}

$Blocks = @('gum_metal_casing', 'mu_metal_shield_casing', 'pulsed_field_casing', 'pasta_containment_casing')

function New-Block16 {
    param([string]$Name)
    $c = New-Canvas 16 16
    switch ($Name) {
        'gum_metal_casing' {
            $face = Hex 'A8AAB4'; $grid = Hex '8A8C98'; $spring = Hex '5E5A70'; $bevel = Hex 'C8CAD4'
            for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
                $col = Get-Tone $face $x $y 511
                if ($x % 4 -eq 0 -or $y % 4 -eq 0) { $col = Shade $grid (1.05 - 0.02 * $y) }
                if ($x -le 1 -or $y -le 1) { $col = Shade $bevel (1.0 - 0.03 * ($x + $y)) }
                # chevron springs in the four corners: a diagonal V, two pixels thick
                $cx = if ($x -lt 8) { $x } else { 15 - $x }
                $cy = if ($y -lt 8) { $y } else { 15 - $y }
                if ($cx -ge 2 -and $cx -le 5 -and $cy -ge 2 -and $cy -le 5 -and (($cx + $cy) -eq 6 -or ($cx + $cy) -eq 7)) { $col = Get-Tone $spring $x $y 512 }
                Set-Px $c $x $y $col
            } }
        }
        'mu_metal_shield_casing' {
            $panel = Hex 'C4C8D0'; $grid = Hex '7A7E8E'; $layer = Hex '9CA2B2'; $rim = Hex '9A7AD8'
            for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
                $col = Get-Tone $panel $x $y 513
                if ($x % 8 -eq 0 -or $y % 8 -eq 0) { $col = Shade $grid 1.0 }
                $d = [Math]::Max([Math]::Abs($x - 7.5), [Math]::Abs($y - 7.5))
                if ($d -ge 1.5 -and $d -lt 2.5) { $col = Shade $layer 0.8 }
                elseif ($d -ge 3.5 -and $d -lt 4.5) { $col = Shade $layer 0.9 }
                elseif ($d -ge 5.5 -and $d -lt 6.5) { $col = Shade $layer 1.0 }
                if ($x -eq 15 -or $y -eq 15) { $col = Shade $rim (1.0 - 0.02 * $x) }
                Set-Px $c $x $y $col
            } }
        }
        'pulsed_field_casing' {
            $coil = Hex '3A2E54'; $ring = Hex 'D8A040'; $die = Hex '9CC8E8'; $line = Hex '5A4A80'
            for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
                $col = Get-Tone $coil $x $y 514
                if ($x % 5 -eq 0 -or $y % 5 -eq 0) { $col = Shade $line 1.0 }
                $d = [Math]::Max([Math]::Abs($x - 7.5), [Math]::Abs($y - 7.5))
                if ($d -ge 3.5 -and $d -lt 5.5) { $col = Shade $ring (1.1 - 0.05 * ($d - 3.5)) }
                if (($x % 5 -eq 0 -and $y % 5 -eq 0) -and $d -gt 5.5) { $col = Shade $die 1.0 }
                if (($x % 5 -eq 0 -and $y % 5 -eq 0) -and $d -le 5.5) { $col = Shade $line 1.2 }
                Set-Px $c $x $y $col
            } }
        }
        'pasta_containment_casing' {
            $base = Hex '241C34'; $stria = Hex 'D040B0'; $grid = Hex '5A4A74'; $rim = Hex '6A5A8A'
            for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
                $col = Get-Tone $base $x $y 515
                if ($x -ge 3 -and $x -le 12 -and $y -ge 3 -and $y -le 12) {
                    $col = Shade $base 0.9
                    if ($y % 2 -eq 0) { $col = Shade $stria (0.85 + 0.02 * (($x + $y) % 5)) }
                    if ($x -eq 3 -or $x -eq 12 -or $y -eq 3 -or $y -eq 12) { $col = Shade $grid 1.0 }
                }
                if ($x -le 1 -or $x -ge 14 -or $y -le 1 -or $y -ge 14) { $col = Shade $rim (1.0 - 0.02 * ($x + $y)) }
                Set-Px $c $x $y $col
            } }
        }
    }
    return $c
}

$Outputs = [ordered]@{}
foreach ($n in $Blocks) { $Outputs[$n] = "block/uxv/$n.png" }

$written = @()
foreach ($n in $Outputs.Keys) {
    if ($OnlySet.Count -gt 0 -and $OnlySet -notcontains $n) { continue }
    Save-Png (New-Block16 $n) (Join-Path $OutRoot $Outputs[$n])
    $written += $Outputs[$n]
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
    if ($opaque -ne 256) { Add-Problem $rel 'block must be fully opaque' }
    $k = $img.P -join ','
    if ($keys.ContainsKey($k)) { Add-Problem $rel "identical to $($keys[$k])" } else { $keys[$k] = $rel }
}
if ($OnlySet.Count -eq 0) {
    $src = Get-Content -LiteralPath (Join-Path $RepoRoot 'pack\kubejs\startup_scripts\grindless\uxv\casings.js') -Raw
    foreach ($b in $Blocks) { if ($src -notmatch "(?m)^\s+$b\s*:\s*\{") { Add-Problem $b 'drawn here but not registered by casings.js' } }
}
if ($problems -gt 0) { throw "$problems problem(s) in the texture checks (see the warnings above)" }
Write-Host "wrote $($written.Count) textures to $OutRoot"

if ($Credits) {
    Write-Host ''
    foreach ($rel in $written) {
        Write-Host ("| ``pack/kubejs/assets/grindless/textures/$rel`` | Generated with tools/assets/$ScriptName (procedural pixel art, original) by the assets agent (D4-CASE-UXV) | the pack's licence (MIT) |")
    }
}
