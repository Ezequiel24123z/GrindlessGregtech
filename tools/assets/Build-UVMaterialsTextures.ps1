<#
.SYNOPSIS
  Procedural 16x16 item icons for UV's materials (package UV-A8): bnnt_dust, silver_tube, pit_billet, the six near_net_* parts and
  the three printed_* parts (GregTech style: top-left light, 3-4 tones per material, selective outlines).

.DESCRIPTION
  Every pixel is drawn by this script (same shape routines as Build-UVColdTextures.ps1); nothing is copied from any mod.
  Deterministic: re-running overwrites the same bytes. Writes pack/kubejs/assets/grindless/textures/item/<name>.png.
  Near-net parts carry a 'porous' flag: scattered dark pores over the body, which the pressed (printed_*) parts do not have.

  Run from the repo root:
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-UVMaterialsTextures.ps1

  Every pixel is fully opaque or fully transparent, none is pure black, the corner is transparent, at least 20 pixels are opaque and
  no two icons are identical; the run fails otherwise.

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

# name -> kind, body colour, accent colour[, 'porous']
$Items = [ordered]@{
    bnnt_dust                   = @('heap', 'EEEEF2', 'C8CCD8')
    silver_tube                 = @('tube', 'C8CCD4', '7C808C')
    pit_billet                  = @('billet', 'C0C4CC', '5A4A6E')
    near_net_neutronium_gear    = @('gear', 'B4B4B4', '7A7A7A', 'porous')
    near_net_darmstadtium_rotor = @('rotor', 'B89C5C', '806A3A', 'porous')
    near_net_tritanium_gear     = @('gear', 'A85A6E', '6E3444', 'porous')
    near_net_thruster_chamber   = @('chamber', 'A85A6E', '6E3444', 'porous')
    near_net_array_mount        = @('module', 'B4B4B4', '7A7A7A', 'porous')
    near_net_probe_frame        = @('frame', 'B89C5C', '806A3A', 'porous')
    printed_thruster_chamber    = @('chamber', 'C46A82', 'E8A0B4')
    printed_array_mount         = @('module', 'D2D2D8', '5A6A8C')
    printed_probe_frame         = @('frame', 'D4B46C', 'F0DC9C')
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
        'tube'    { return ($X -ge 1 -and $X -le 14 -and $Y -ge 6 -and $Y -le 9) }
        'billet'  { return ($X -ge 2 -and $X -le 13 -and $Y -ge 5 -and $Y -le 10 -and -not (($X -eq 2 -or $X -eq 13) -and ($Y -eq 5 -or $Y -eq 10))) }
        'gear'    {
            if ($r -lt 1.6) { return $false }
            if ($r -le 4.8) { return $true }
            $sector = [int][Math]::Floor(([Math]::Atan2($dy, $dx) + [Math]::PI) * 8 / [Math]::PI)
            return ($r -le 6.9 -and $sector % 2 -eq 0)
        }
        'rotor'   { return ($r -le 2.4 -or ($r -le 7.0 -and ([Math]::Abs($dx - $dy) -le 1.3 -or [Math]::Abs($dx + $dy) -le 1.3))) }
        'chamber' {
            if ($Y -lt 1 -or $Y -gt 14) { return $false }
            $half = 2.5; if ($Y -ge 7) { $half = 1.5 + ($Y - 7) * 0.8 } elseif ($Y -le 3) { $half = 3.5 }
            return ([Math]::Abs($dx) -le $half)
        }
        'module'  { return (($X -ge 1 -and $X -le 14 -and $Y -ge 4 -and $Y -le 11) -or (($Y -eq 3 -or $Y -eq 12) -and $X % 2 -eq 0 -and $X -ge 2 -and $X -le 13)) }
        'frame'   {
            if ($X -lt 2 -or $X -gt 13 -or $Y -lt 2 -or $Y -gt 13) { return $false }
            return ($X -le 3 -or $X -ge 12 -or $Y -le 3 -or $Y -ge 12 -or [Math]::Abs($X - $Y) -le 1 -or [Math]::Abs($X + $Y - 15) -le 1)
        }
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
        'tube'    { return ($X -le 2 -or $Y -eq 9) }
        'billet'  { return ($X -le 3 -or $X -ge 12) }
        'gear'    { return ($r -le 2.6) }
        'rotor'   { return ($r -le 2.4) }
        'chamber' { return ($Y -ge 7 -and $Y % 2 -eq 0) }
        'module'  { return ($Y -ge 6 -and $Y -le 9 -and $X % 3 -ne 0) }
        'frame'   { return (($X -le 3 -or $X -ge 12) -and ($Y -le 3 -or $Y -ge 12)) }
    }
    return $false
}

function New-Item16 {
    param([string]$Name, [string[]]$Spec)
    $c = New-Canvas 16 16
    $salt = 0; foreach ($ch in $Name.ToCharArray()) { $salt = ($salt * 31 + [int]$ch) % 9973 }
    $body = Hex $Spec[1]; $accent = Hex $Spec[2]
    $porous = ($Spec.Count -gt 3 -and $Spec[3] -eq 'porous')
    for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
        if (-not (Test-Shape $Spec[0] $x $y)) { continue }
        $base = $body; if (Test-Accent $Spec[0] $x $y $salt) { $base = $accent }
        $tone = Get-Tone $base $x $y $salt
        if ($porous -and (Get-Noise $x $y ($salt + 13)) -gt 840) { $tone = Shade $tone 0.62 }
        Set-Px $c $x $y $tone
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
$src = Get-Content -LiteralPath (Join-Path $RepoRoot 'pack\kubejs\startup_scripts\grindless\uv\materials.js') -Raw
foreach ($n in $Items.Keys) { if ($src -notmatch "(?m)^\s+$n\s*:\s*\{") { Add-Problem $n 'drawn here but not registered by materials.js' } }
if ($problems -gt 0) { throw "$problems problem(s) in the texture checks (see the warnings above)" }
Write-Host "wrote $($written.Count) textures to $OutRoot"

if ($Credits) {
    Write-Host ''
    foreach ($rel in $written) {
        Write-Host ("| ``pack/kubejs/assets/grindless/textures/$rel`` | Generated with tools/assets/$ScriptName (procedural pixel art, original) by the assets agent (UV-A8) | the pack's licence (pending; proposed CC BY-SA 4.0) |")
    }
}
