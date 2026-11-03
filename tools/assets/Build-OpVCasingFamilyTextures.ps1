<#
.SYNOPSIS
  Procedural 16x16 block textures for the OpV casing family of Gregtech Grindless (package D5-CAS-OPV):
  chain_lamina_casing, tpv_wall_casing and kugelblitz_cavity_casing.

.DESCRIPTION
  Every pixel is drawn by this script; nothing is copied from GregTech Modern or any other mod. Output is deterministic (mottles come
  from Get-Noise, a hash of the position). Writes under pack/kubejs/assets/grindless/textures/block/opv/:
      chain_lamina_casing.png       deep OpV blue plate in 1 px bands every 2 rows, tied every 4 px by thin silver strand lines.
      tpv_wall_casing.png           dark ceramic 4x4 tiles (purple-grey cells) with a thin warm copper grid between them.
      kugelblitz_cavity_casing.png  hexagonal facets of alternating WC grey and SiC teal rings round a violet pip, field-frozen rim.

  Run from the repo root:
      powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-OpVCasingFamilyTextures.ps1 -Credits

  The final check fails the run if a file has partial alpha, a pure black pixel, a transparent pixel, duplicates another texture, or
  is not referenced by foundation.js.

.PARAMETER OutRoot
  Textures root. Default: <repo>/pack/kubejs/assets/grindless/textures
.PARAMETER Credits
  Also print the CREDITS.md "Assets" table rows for the files written.
#>
[CmdletBinding()]
param(
    [string]$OutRoot = '',
    [switch]$Credits
)
$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'Pixel.Lib.ps1')
$EraName = 'opv'; . (Join-Path $PSScriptRoot 'Era.Lib.ps1')

$RepoRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..'))
if (-not $OutRoot) { $OutRoot = Join-Path $RepoRoot 'pack\kubejs\assets\grindless\textures' }
$OutRoot = [System.IO.Path]::GetFullPath($OutRoot)
$ScriptName = Split-Path -Leaf $PSCommandPath

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

$Blocks = @('chain_lamina_casing', 'tpv_wall_casing', 'kugelblitz_cavity_casing')

function New-Block16 {
    param([string]$Name)
    $c = New-Canvas 16 16
    switch ($Name) {
        'chain_lamina_casing' {
            $plate = Hex '2C4FA0'; $band = Hex '3A62BC'; $strand = Hex 'C4D0E4'; $rim = Hex '16224A'
            for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
                $col = Get-Tone $plate $x $y 711
                if ($y % 2 -eq 1) { $col = Get-Tone $band $x $y 712 }
                if ($x % 4 -eq 2) { $col = Shade $strand (1.05 - 0.02 * $y) }
                if ((Get-Noise $x $y 713) -gt 940) { $col = Shade $strand 0.85 }
                if ($x -eq 0 -or $y -eq 0 -or $x -eq 15 -or $y -eq 15) { $col = $rim }
                Set-Px $c $x $y $col
            } }
        }
        'tpv_wall_casing' {
            $cell = Hex '4A4458'; $copper = Hex 'C27A48'; $edge = Hex '24202E'
            for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
                $col = Get-Tone $cell $x $y 721
                if (($x % 4) -eq 0 -or ($y % 4) -eq 0) { $col = Shade $copper (1.1 - 0.03 * (($x + $y) / 2)) }
                if (($x % 4) -eq 1 -and ($y % 4) -eq 1) { $col = Shade $cell 1.3 }
                if ($x -eq 15 -or $y -eq 15) { $col = Shade $copper 0.6 }
                Set-Px $c $x $y $col
            } }
        }
        'kugelblitz_cavity_casing' {
            $wc = Hex '6A6C74'; $sic = Hex '2E8E8A'; $pip = Hex 'B070F0'; $rim = Hex 'CFE6FF'; $edge = Hex '2A3A58'
            for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
                $dx = $x - 7.5; $dy = $y - 7.5
                $hex = [Math]::Max([Math]::Abs($dy) * 1.1547, [Math]::Abs($dx) + [Math]::Abs($dy) * 0.5774)
                $ring = [int][Math]::Floor($hex)
                if ($ring % 2 -eq 0) { $col = Get-Tone $wc $x $y 731 } else { $col = Get-Tone $sic $x $y 732 }
                if ($hex -lt 1.6) { $col = Shade $pip (1.15 - 0.05 * $hex) }
                if ($x -le 1 -or $y -le 1 -or $x -ge 14 -or $y -ge 14) { $col = Shade $rim (1.0 - 0.02 * ($x + $y) / 2) }
                if ($x -eq 0 -or $y -eq 0 -or $x -eq 15 -or $y -eq 15) { $col = $edge }
                Set-Px $c $x $y $col
            } }
        }
    }
    return $c
}

$written = @()
foreach ($n in $Blocks) {
    $rel = "block/opv/$n.png"
    Save-Png (New-Block16 $n) (Join-Path $OutRoot $rel)
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
        if ($a -ne 0 -and $a -ne 255) { Add-Problem $rel 'partial alpha'; break }
        if ($a -eq 255) { $opaque++; if (($p -band 0xFFFFFF) -eq 0) { $black++ } }
    }
    if ($black -gt 0) { Add-Problem $rel "$black pure black pixel(s)" }
    if ($opaque -ne 256) { Add-Problem $rel 'block must be fully opaque' }
    $k = $img.P -join ','
    if ($keys.ContainsKey($k)) { Add-Problem $rel "identical to $($keys[$k])" } else { $keys[$k] = $rel }
}
$src = Get-Content -LiteralPath (Join-Path $RepoRoot 'pack\kubejs\startup_scripts\grindless\opv\foundation.js') -Raw
foreach ($b in $Blocks) { if ($src -notmatch "grindless:block/opv/${b}'") { Add-Problem $b 'block texture not referenced by foundation.js' } }
if ($problems -gt 0) { throw "$problems problem(s) in the texture checks (see the warnings above)" }
Write-Host "wrote $($written.Count) textures to $OutRoot"

if ($Credits) {
    Write-Host ''
    foreach ($rel in $written) {
        Write-Host ("| ``pack/kubejs/assets/grindless/textures/$rel`` | Generated with tools/assets/$ScriptName (procedural pixel art, original) by the assets agent (D5-CAS-OPV) | the pack's licence (MIT) |")
    }
}
