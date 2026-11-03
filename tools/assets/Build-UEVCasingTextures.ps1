<#
.SYNOPSIS
  Procedural 16x16 block textures for the UEV casing family of Gregtech Grindless (package D4-CASE-UEV).

.DESCRIPTION
  Every pixel is drawn by this script; nothing is copied or edited from GregTech Modern, GCYR or any other mod. Output is
  deterministic (mottles come from Get-Noise, a hash of the position). The UEV era style (ribbed, scorched ember steel: notched
  corners, ribs, scorch wear, edge-light trim, a warm tint) is applied when the file is saved (Era.Lib.ps1).

  Writes (under pack/kubejs/assets/grindless/textures/block/uev/):
      sic_composite_casing.png          charcoal 2x2 twill weave under three ribs, blue-grey tantalum inserts in the corners.
      superhydride_magnet_casing.png    grey SiC face with a copper-rose winding band and an ember-lit pole tip at the centre.
      hftacn_lining_casing.png          golden-grey carbonitride bricks in a notched course with ember-glowing mortar lines.

  Run from the repo root:
      powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-UEVCasingTextures.ps1
      powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-UEVCasingTextures.ps1 -Only hftacn_lining_casing -Credits

  The final check fails the run if a texture is not fully opaque, has partial alpha or a pure black pixel, if two textures are
  identical, or if the set of outputs differs from the blocks startup_scripts/grindless/uev/casings.js registers.

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
$EraName = 'uev'; . (Join-Path $PSScriptRoot 'Era.Lib.ps1')

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

$Blocks = @('sic_composite_casing', 'superhydride_magnet_casing', 'hftacn_lining_casing')

function New-Block16 {
    param([string]$Name)
    $c = New-Canvas 16 16
    switch ($Name) {
        'sic_composite_casing' {
            $weaveA = Hex '3A4640'; $weaveB = Hex '2A332E'; $rib = Hex '566660'; $insert = Hex '6C7A92'
            for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
                $col = if ((([int][Math]::Floor($x / 2)) + ([int][Math]::Floor($y / 2))) % 2 -eq 0) { Get-Tone $weaveA $x $y 411 } else { Get-Tone $weaveB $x $y 411 }
                if ($y -eq 3 -or $y -eq 7 -or $y -eq 11) { $col = Shade $rib (1.1 - 0.02 * $x) }
                if (($x -le 2 -or $x -ge 13) -and ($y -le 2 -or $y -ge 13)) { $col = Get-Tone $insert $x $y 412 }
                Set-Px $c $x $y $col
            } }
        }
        'superhydride_magnet_casing' {
            $face = Hex '5A6670'; $wind = Hex 'C07A6A'; $tip = Hex 'F0A050'; $edge = Hex '3A444C'
            for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
                $col = Get-Tone $face $x $y 413
                if ($x -eq 0 -or $y -eq 0 -or $x -eq 15 -or $y -eq 15) { $col = $edge }
                if ($y -ge 5 -and $y -le 10 -and $x -ge 1 -and $x -le 14) { $col = Shade $wind (1.0 + 0.12 * (($x % 2) - 0.5)) }
                if ($y -eq 5 -or $y -eq 10) { $col = Shade $wind 0.7 }
                $dx = $x - 7.5; $dy = $y - 7.5; $r = [Math]::Sqrt($dx * $dx + $dy * $dy)
                if ($r -le 2.4) { $col = Shade $tip (1.1 - 0.06 * $r) }
                Set-Px $c $x $y $col
            } }
        }
        'hftacn_lining_casing' {
            $brick = Hex '8A7E5A'; $mortar = Hex 'E8782A'; $scorch = Hex '3A3228'
            for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
                $row = [int][Math]::Floor($y / 4)
                $off = if ($row % 2 -eq 0) { 0 } else { 4 }
                $col = Get-Tone $brick $x $y 414
                if ($y % 4 -eq 3) { $col = Shade $mortar (1.0 - 0.015 * $x) }
                elseif ((($x + $off) % 8) -eq 7) { $col = Shade $mortar 0.85 }
                if ((Get-Noise $x $y 415) -gt 930) { $col = $scorch }
                Set-Px $c $x $y $col
            } }
        }
    }
    return $c
}

$Outputs = [ordered]@{}
foreach ($n in $Blocks) { $Outputs[$n] = "block/uev/$n.png" }

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
    $src = Get-Content -LiteralPath (Join-Path $RepoRoot 'pack\kubejs\startup_scripts\grindless\uev\casings.js') -Raw
    foreach ($b in $Blocks) { if ($src -notmatch "(?m)^\s+$b\s*:\s*\{") { Add-Problem $b 'drawn here but not registered by casings.js' } }
}
if ($problems -gt 0) { throw "$problems problem(s) in the texture checks (see the warnings above)" }
Write-Host "wrote $($written.Count) textures to $OutRoot"

if ($Credits) {
    Write-Host ''
    foreach ($rel in $written) {
        Write-Host ("| ``pack/kubejs/assets/grindless/textures/$rel`` | Generated with tools/assets/$ScriptName (procedural pixel art, original) by the assets agent (D4-CASE-UEV) | the pack's licence (MIT) |")
    }
}
