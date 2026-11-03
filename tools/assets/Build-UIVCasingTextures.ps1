<#
.SYNOPSIS
  Procedural 16x16 block textures for the UIV casing family of Gregtech Grindless (package D4-CASE-UIV).

.DESCRIPTION
  Every pixel is drawn by this script; nothing is copied or edited from GregTech Modern, GCYR or any other mod. Output is
  deterministic (mottles come from Get-Noise, a hash of the position). The UIV era style (rounded, frosted and cool: round
  corners, frost wear, a concentric lit ring, a cyan-teal tint) is applied when the file is saved (Era.Lib.ps1).

  Writes (under pack/kubejs/assets/grindless/textures/block/uiv/):
      rhea_casing.png                   frosted blue-grey with a printed rounded-cell lattice and a teal ring at the centre.
      mh_field_casing.png               silver-cyan concentric winding rings with a frosted rim.
      multilayer_optics_casing.png      dark glass with iridescent violet-teal multilayer bands and a rounded window.
      dilution_cryostat_casing.png      pale frosted white-cyan can with nested shields as concentric circles.

  Run from the repo root:
      powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-UIVCasingTextures.ps1
      powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-UIVCasingTextures.ps1 -Only rhea_casing -Credits

  The final check fails the run if a texture is not fully opaque, has partial alpha or a pure black pixel, if two textures are
  identical, or if the set of outputs differs from the blocks startup_scripts/grindless/uiv/casings.js registers.

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
$EraName = 'uiv'; . (Join-Path $PSScriptRoot 'Era.Lib.ps1')

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

function Get-Radius {
    param([int]$X, [int]$Y)
    $dx = $X - 7.5; $dy = $Y - 7.5
    return [Math]::Sqrt($dx * $dx + $dy * $dy)
}

$Blocks = @('rhea_casing', 'mh_field_casing', 'multilayer_optics_casing', 'dilution_cryostat_casing')

function New-Block16 {
    param([string]$Name)
    $c = New-Canvas 16 16
    switch ($Name) {
        'rhea_casing' {
            $face = Hex '5C6C7C'; $cell = Hex '3E4C5C'; $ring = Hex '4FC0C0'; $frost = Hex 'C8DCE8'
            for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
                $col = Get-Tone $face $x $y 421
                $cx = ($x % 4) - 1.5; $cy = ($y % 4) - 1.5
                if (([Math]::Sqrt($cx * $cx + $cy * $cy)) -lt 1.2) { $col = Get-Tone $cell $x $y 422 }
                $r = Get-Radius $x $y
                if ($r -ge 2.6 -and $r -le 3.6) { $col = Shade $ring (1.1 - 0.05 * $r) }
                if ((Get-Noise $x $y 423) -gt 940) { $col = $frost }
                Set-Px $c $x $y $col
            } }
        }
        'mh_field_casing' {
            $base = Hex '8AA0AC'; $ringA = Hex '4A6A78'; $lit = Hex '7FE0E8'; $rim = Hex 'D4E4EC'
            for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
                $r = Get-Radius $x $y
                $col = Get-Tone $base $x $y 424
                if (([int][Math]::Floor($r)) % 2 -eq 1) { $col = Shade $ringA (1.05 - 0.03 * $r) }
                if ($r -ge 5.2 -and $r -le 6.0) { $col = Shade $lit 1.0 }
                if ($x -eq 0 -or $y -eq 0 -or $x -eq 15 -or $y -eq 15) { $col = Shade $rim 0.9 }
                Set-Px $c $x $y $col
            } }
        }
        'multilayer_optics_casing' {
            $glass = Hex '1E2A34'; $violet = Hex '8A5AC0'; $teal = Hex '3AC0B0'; $edge = Hex '6FE8E0'
            for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
                $col = Get-Tone $glass $x $y 425
                if ($y % 3 -eq 1) { $col = if (($x + $y) % 4 -lt 2) { Shade $violet (0.9 + 0.01 * $x) } else { Shade $teal (0.9 + 0.01 * $x) } }
                $inX = $x -ge 4 -and $x -le 11; $inY = $y -ge 4 -and $y -le 11
                if ($inX -and $inY) {
                    $col = Get-Tone (Hex '2E4658') $x $y 426
                    if ($x -eq 4 -or $x -eq 11 -or $y -eq 4 -or $y -eq 11) { $col = $edge }
                }
                Set-Px $c $x $y $col
            } }
        }
        'dilution_cryostat_casing' {
            $can = Hex 'D2E4EC'; $shield = Hex '8CB4C4'; $blue = Hex '5A8CD0'
            for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
                $r = Get-Radius $x $y
                $col = Get-Tone $can $x $y 427
                if ($r -ge 2.0 -and $r -lt 3.0) { $col = Shade $shield 1.0 }
                if ($r -ge 4.0 -and $r -lt 5.0) { $col = Shade $shield 0.85 }
                if ($r -ge 6.0 -and $r -lt 6.8) { $col = Shade $blue 1.05 }
                if ((Get-Noise $x $y 428) -gt 920) { $col = Hex 'F4FAFC' }
                Set-Px $c $x $y $col
            } }
        }
    }
    return $c
}

$Outputs = [ordered]@{}
foreach ($n in $Blocks) { $Outputs[$n] = "block/uiv/$n.png" }

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
    $src = Get-Content -LiteralPath (Join-Path $RepoRoot 'pack\kubejs\startup_scripts\grindless\uiv\casings.js') -Raw
    foreach ($b in $Blocks) { if ($src -notmatch "(?m)^\s+$b\s*:\s*\{") { Add-Problem $b 'drawn here but not registered by casings.js' } }
}
if ($problems -gt 0) { throw "$problems problem(s) in the texture checks (see the warnings above)" }
Write-Host "wrote $($written.Count) textures to $OutRoot"

if ($Credits) {
    Write-Host ''
    foreach ($rel in $written) {
        Write-Host ("| ``pack/kubejs/assets/grindless/textures/$rel`` | Generated with tools/assets/$ScriptName (procedural pixel art, original) by the assets agent (D4-CASE-UIV) | the pack's licence (MIT) |")
    }
}
