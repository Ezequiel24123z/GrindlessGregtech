<#
.SYNOPSIS
  Procedural 16x16 pixel art for the OpV-R1 "Pathfinder" intermediates of Gregtech Grindless (startup_scripts/grindless/opv/pathfinder.js):
  8 item icons (GregTech style: top-left light, 3-4 tones per material, selective outlines).

.DESCRIPTION
  Every pixel is drawn by this script (the shape routines of Build-OpVFoundationTextures.ps1, a palette per item); nothing is copied or
  edited from GregTech Modern or any other mod. Output is deterministic: re-running overwrites the same bytes (mottles come from
  Get-Noise, a hash of the position, not from a random generator).

  Writes (under pack/kubejs/assets/grindless/textures/): item/<name>.png for the items listed in $Items below.

  Run from the repo root:
      powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-OpVPathfinderTextures.ps1
      powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-OpVPathfinderTextures.ps1 -Credits

  Every pixel is fully opaque or fully transparent and none is pure black; each icon has a transparent corner and at least 20 opaque
  pixels. The final check fails the run (non-zero exit) if a written file breaks one of these rules, if two textures are identical, or if
  the set of outputs differs from the items that pathfinder.js registers.

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
    polycapillary_optic  = @('spool', '8A9AA8', 'E0F4FF')
    xray_timing_head     = @('module', '3E4A5A', '80F0FF')
    rejected_timing_head = @('module', '4A4440', 'B08060')
    clock_locked_head    = @('module', '3A3E5E', 'FFE080')
    gan_mmic_tile        = @('card', '3A5048', 'B0FF90')
    tested_mmic_tile     = @('card', '3A5A58', '90FFE0')
    rejected_mmic_tile   = @('card', '484040', 'C09068')
    sealed_mmic_tile     = @('card', '6A7078', 'F0F4FF')
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
        'card'   { return ($X -ge 2 -and $X -le 13 -and $Y -ge 2 -and $Y -le 13) }
        'spool'  { return ($r -le 6.4 -and $r -ge 1.8) }
        'module' { return (($X -ge 1 -and $X -le 14 -and $Y -ge 4 -and $Y -le 11) -or (($Y -eq 3 -or $Y -eq 12) -and $X % 2 -eq 0 -and $X -ge 2 -and $X -le 13)) }
    }
    return $false
}

function Test-Accent {
    param([string]$Kind, [int]$X, [int]$Y)
    switch ($Kind) {
        'card'   { return ($Y % 3 -eq 1 -and $X -ge 4 -and $X -le 11 -and $X % 4 -ne 0) }
        'spool'  { return (($X + $Y) % 4 -eq 0) }
        'module' { return ($Y -ge 6 -and $Y -le 9 -and $X % 3 -ne 0) }
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
        $base = $body; if (Test-Accent $Spec[0] $x $y) { $base = $accent }
        Set-Px $c $x $y (Get-Tone $base $x $y $salt)
    } }
    Add-Outline $c
    return $c
}

$written = @()
foreach ($n in $Items.Keys) {
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
        if ($a -ne 0 -and $a -ne 255) { Add-Problem $rel 'partial alpha'; break }
        if ($a -eq 255) { $opaque++; if (($p -band 0xFFFFFF) -eq 0) { $black++ } }
    }
    if ($black -gt 0) { Add-Problem $rel "$black pure black pixel(s)" }
    if ((($img.P[0] -shr 24) -band 255) -ne 0) { Add-Problem $rel 'corner pixel is not transparent' }
    if ($opaque -lt 20) { Add-Problem $rel "only $opaque opaque pixels" }
    $k = $img.P -join ','
    if ($keys.ContainsKey($k)) { Add-Problem $rel "identical to $($keys[$k])" } else { $keys[$k] = $rel }
}
$src = Get-Content -LiteralPath (Join-Path $RepoRoot 'pack\kubejs\startup_scripts\grindless\opv\pathfinder.js') -Raw
foreach ($n in $Items.Keys) { if ($src -notmatch "(?m)^\s+$n\s*:\s*\{") { Add-Problem $n 'drawn here but not registered by pathfinder.js' } }
$reg = [regex]::Match($src, '(?s)const ITEMS = \{(.*?)\n  \}').Groups[1].Value
foreach ($m in [regex]::Matches($reg, '(?m)^\s+([a-z0-9_]+)\s*:')) { if (-not $Items.Contains($m.Groups[1].Value)) { Add-Problem $m.Groups[1].Value 'registered by pathfinder.js but not drawn here' } }
if ($problems -gt 0) { throw "$problems problem(s) in the texture checks (see the warnings above)" }
Write-Host "wrote $($written.Count) textures to $OutRoot"

if ($Credits) {
    Write-Host ''
    foreach ($rel in $written) {
        Write-Host ("| ``pack/kubejs/assets/grindless/textures/$rel`` | Generated with tools/assets/$ScriptName (procedural pixel art, original) by the pathfinder agent (OpV-R1) | the pack's licence (pending; proposed CC BY-SA 4.0) |")
    }
}
