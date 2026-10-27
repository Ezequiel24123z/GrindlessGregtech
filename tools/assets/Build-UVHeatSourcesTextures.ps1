<#
.SYNOPSIS
  Procedural 16x16 item icons for UV's heat source works (package UV-A2): probe_rtg, americium_micro_source, curium_rtg_pellet,
  heavy_curium_oxide (GregTech style: top-left light, 3-4 tones per material, selective outlines).

.DESCRIPTION
  Every pixel is drawn by this script (same shape routines as Build-UVFoundationTextures.ps1); nothing is copied from any mod.
  Deterministic: re-running overwrites the same bytes. Writes pack/kubejs/assets/grindless/textures/item/<name>.png.

  Run from the repo root:
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-UVHeatSourcesTextures.ps1

  Every pixel is fully opaque or fully transparent, none is pure black, the corner is transparent, at least 20 pixels are opaque and
  no two icons (nor any existing item icon with a name here) are identical; the run fails otherwise.

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

$RepoRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..'))
if (-not $OutRoot) { $OutRoot = Join-Path $RepoRoot 'pack\kubejs\assets\grindless\textures' }
$OutRoot = [System.IO.Path]::GetFullPath($OutRoot)
$ScriptName = Split-Path -Leaf $PSCommandPath

function Get-Noise {
    param([int]$X, [int]$Y, [int]$Salt)
    $v = [int64]($X * 73856093) -bxor [int64]($Y * 19349663) -bxor [int64]($Salt * 83492791)
    return [int]([Math]::Abs($v) % 1000)
}

# name -> kind, body colour, accent colour
$Items = [ordered]@{
    probe_rtg              = @('module', '5E6068', 'FF8A30')
    americium_micro_source = @('orb', 'C8CCD4', '5AD08A')
    curium_rtg_pellet      = @('capsule', 'A89480', 'FF5A2A')
    heavy_curium_oxide     = @('heap', '4A3E52', 'D0A040')
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
        'heap'    { $h = 9 - [Math]::Abs($dx) * 1.1; return ($Y -ge 14 - $h -and $Y -le 14 -and $h -gt 0) }
        'orb'     { return ($r -le 4.2) }
        'module'  { return (($X -ge 1 -and $X -le 14 -and $Y -ge 4 -and $Y -le 11) -or (($Y -eq 3 -or $Y -eq 12) -and $X % 2 -eq 0 -and $X -ge 2 -and $X -le 13)) }
        'capsule' { return ($X -ge 5 -and $X -le 10 -and $Y -ge 2 -and $Y -le 13 -and -not (($Y -eq 2 -or $Y -eq 13) -and ($X -eq 5 -or $X -eq 10))) }
    }
    return $false
}

function Test-Accent {
    param([string]$Kind, [int]$X, [int]$Y, [int]$Salt)
    $dx = $X - 7.5; $dy = $Y - 7.5
    $r = [Math]::Sqrt($dx * $dx + $dy * $dy)
    $n = Get-Noise $X $Y ($Salt + 7)
    switch ($Kind) {
        'heap'    { return ($n -gt 820) }
        'orb'     { return ($r -lt 1.8) }
        'module'  { return ($Y -ge 6 -and $Y -le 9 -and $X % 3 -ne 0) }
        'capsule' { return ($Y -ge 5 -and $Y -le 10) }
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
    $c = New-Item16 $n $Items[$n]
    $rel = "item/$n.png"
    Save-Png $c (Join-Path $OutRoot $rel)
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
    if ((($img.P[0] -shr 24) -band 255) -ne 0) { Add-Problem $rel 'corner pixel is not transparent' }
    if ($opaque -lt 20) { Add-Problem $rel "only $opaque opaque pixels" }
    $k = $img.P -join ','
    if ($keys.ContainsKey($k)) { Add-Problem $rel "identical to $($keys[$k])" } else { $keys[$k] = $rel }
}
$src = Get-Content -LiteralPath (Join-Path $RepoRoot 'pack\kubejs\startup_scripts\grindless\uv\heat_sources.js') -Raw
foreach ($n in $Items.Keys) { if ($src -notmatch "(?m)^\s+$n\s*:\s*\{") { Add-Problem $n 'drawn here but not registered by heat_sources.js' } }
if ($problems -gt 0) { throw "$problems problem(s) in the texture checks (see the warnings above)" }
Write-Host "wrote $($written.Count) textures to $OutRoot"

if ($Credits) {
    Write-Host ''
    foreach ($rel in $written) {
        Write-Host ("| ``pack/kubejs/assets/grindless/textures/$rel`` | Generated with tools/assets/$ScriptName (procedural pixel art, original) by the assets agent (UV-A2) | the pack's licence (pending; proposed CC BY-SA 4.0) |")
    }
}
