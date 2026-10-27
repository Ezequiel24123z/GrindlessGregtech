<#
.SYNOPSIS
  Procedural 16x16 item icon for UHV's fibres and the space elevator (package UHV-A7): geo_assembled_stage (GregTech style: top-left
  light, 3-4 tones per material, selective outlines).

.DESCRIPTION
  Every pixel is drawn by this script (same shading routines as Build-UVPhotonicsTextures.ps1); nothing is copied from any mod.
  Deterministic: re-running overwrites the same bytes. Writes pack/kubejs/assets/grindless/textures/item/<name>.png.

  Run from the repo root:
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-UHVElevatorTextures.ps1

  Every pixel is fully opaque or fully transparent, none is pure black, the corner is transparent, at least 20 pixels are opaque and
  the icon is registered by startup_scripts/grindless/uhv/elevator.js; the run fails otherwise.

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
    geo_assembled_stage = @('stage', 'C4C8D2', 'D8A838')
}

function Get-Tone {
    param([int]$Argb, [int]$X, [int]$Y, [int]$Salt)
    $f = 1.2 - 0.035 * ($X + $Y)
    $n = Get-Noise $X $Y $Salt
    if ($n -lt 110) { $f *= 0.86 } elseif ($n -gt 900) { $f *= 1.14 }
    return (Shade $Argb $f)
}

# a squat rocket stage: a wide tank with a domed top, an interstage ring and a cluster of engine bells
function Test-Shape {
    param([string]$Kind, [int]$X, [int]$Y)
    switch ($Kind) {
        'stage' {
            if ($Y -eq 1) { return ($X -ge 6 -and $X -le 9) }
            if ($Y -eq 2) { return ($X -ge 4 -and $X -le 11) }
            if ($Y -ge 3 -and $Y -le 11) { return ($X -ge 3 -and $X -le 12) }
            if ($Y -ge 12 -and $Y -le 14) {
                $w = $Y - 12
                return (($X -ge 4 - $w -and $X -le 5 + $w -and $X -le 6) -or ($X -ge 10 - $w -and $X -le 11 + $w -and $X -ge 9) -or
                        ($X -ge 7 -and $X -le 8 -and $Y -le 13))
            }
        }
    }
    return $false
}

function Test-Accent {
    param([string]$Kind, [int]$X, [int]$Y, [int]$Salt)
    $n = Get-Noise $X $Y ($Salt + 7)
    switch ($Kind) {
        # gold foil bands at the interstage and the thrust frame, and a seam down the tank
        'stage' { return ($Y -eq 4 -or $Y -eq 11 -or ($X -eq 8 -and $Y -ge 5 -and $Y -le 10 -and $n -gt 200)) }
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
}
$src = Get-Content -LiteralPath (Join-Path $RepoRoot 'pack\kubejs\startup_scripts\grindless\uhv\elevator.js') -Raw
foreach ($n in $Items.Keys) { if ($src -notmatch "(?m)^\s+$n\s*:\s*\{") { Add-Problem $n 'drawn here but not registered by elevator.js' } }
if ($problems -gt 0) { throw "$problems problem(s) in the texture checks (see the warnings above)" }
Write-Host "wrote $($written.Count) textures to $OutRoot"

if ($Credits) {
    Write-Host ''
    foreach ($rel in $written) {
        Write-Host ("| ``pack/kubejs/assets/grindless/textures/$rel`` | Generated with tools/assets/$ScriptName (procedural pixel art, original) by the assets agent (UHV-A7) | the pack's licence (pending; proposed CC BY-SA 4.0) |")
    }
}
