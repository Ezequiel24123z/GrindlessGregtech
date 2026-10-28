<#
.SYNOPSIS
  Procedural 16x16 pixel art for the three UIV-B1 items of Gregtech Grindless (relay seed, launched relay seed, ergosphere probe).

.DESCRIPTION
  Every pixel is drawn by this script; nothing is copied or edited from GregTech Modern or any other mod. Output is deterministic.

  Writes (under pack/kubejs/assets/grindless/textures/): item/relay_seed.png, launched_relay_seed.png, ergosphere_probe.png.

  Conventions: transparent background, outer 1 px ring empty, every pixel fully opaque or fully transparent, none pure black. The
  final check fails the run (non-zero exit) if a written file breaks one.

  Run from the repo root:
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-UIVTravelTextures.ps1

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
$Items = @('relay_seed', 'launched_relay_seed', 'ergosphere_probe')

$written = New-Object System.Collections.Generic.List[string]
function Out-Tex {
    param($Canvas, [string]$Rel)
    $path = Join-Path $OutRoot ($Rel -replace '/', '\')
    for ($try = 1; $try -le 6; $try++) {
        try { Save-Png $Canvas $path; break }
        catch [System.IO.IOException] { if ($try -eq 6) { throw }; Start-Sleep -Milliseconds (250 * $try) }
    }
    $written.Add($Rel)
}

function New-Item16 {
    param([string]$Name)
    $c = New-Canvas
    switch ($Name) {
        'relay_seed' {
            # a starchip on a light sail frame, with a dark pellet and a gold exotic-matter cell on its face
            Set-Rect $c 2 2 12 12 (Hex '5C6470')
            Set-Rect $c 3 3 10 10 (Hex '2C3440')
            Set-Rect $c 5 5 3 3 (Hex '8E5CC8')
            Set-Rect $c 9 8 3 3 (Hex 'D8B04C')
            Set-Px $c 5 5 (Hex 'C8A0F0'); Set-Px $c 9 8 (Hex 'F4DC88')
            Set-Rect $c 3 11 10 1 (Hex '4C8CC8')
            Set-Px $c 2 2 (Hex 'A8B0BC'); Set-Px $c 13 2 (Hex 'A8B0BC'); Set-Px $c 2 13 (Hex '3C4450'); Set-Px $c 13 13 (Hex '3C4450')
        }
        'launched_relay_seed' {
            # the same chip, small, trailing a thin bright wake of laser light
            Set-Rect $c 9 6 5 5 (Hex '5C6470')
            Set-Rect $c 10 7 3 3 (Hex '2C3440')
            Set-Px $c 11 8 (Hex 'D8B04C'); Set-Px $c 9 6 (Hex 'A8B0BC')
            Set-Rect $c 2 8 7 1 (Hex '88D8F0')
            Set-Rect $c 4 7 5 1 (Hex '4C8CC8')
            Set-Rect $c 4 9 5 1 (Hex '4C8CC8')
            Set-Rect $c 6 6 3 1 (Hex '2C5C98')
            Set-Rect $c 6 10 3 1 (Hex '2C5C98')
            Set-Px $c 2 8 (Hex 'F0FCFF')
        }
        default {
            # a hardened probe: a dark sphere with a tilted ring, the ergosphere's frame dragging, and a lit sensor
            Set-Rect $c 4 4 8 8 (Hex '3C4450')
            Set-Rect $c 5 3 6 10 (Hex '3C4450')
            Set-Rect $c 3 5 10 6 (Hex '3C4450')
            Set-Rect $c 5 5 6 6 (Hex '1C222C')
            Set-Px $c 5 4 (Hex '7C8898'); Set-Px $c 6 4 (Hex '7C8898'); Set-Px $c 4 5 (Hex '7C8898'); Set-Px $c 4 6 (Hex '7C8898')
            for ($i = 0; $i -lt 10; $i++) { Set-Px $c (3 + $i) (12 - [int]($i * 0.8)) (Hex 'D8B04C') }
            Set-Rect $c 7 7 2 2 (Hex 'E8604C')
            Set-Px $c 7 7 (Hex 'FF9C88')
        }
    }
    return $c
}

foreach ($i in $Items) { Out-Tex (New-Item16 $i) "item/$i.png" }

$problems = New-Object System.Collections.Generic.List[string]
foreach ($i in $Items) {
    $n = "item/$i"
    $c = Read-Png (Join-Path $OutRoot ("$n.png" -replace '/', '\'))
    $solid = 0
    for ($y = 0; $y -lt $c.H; $y++) {
        for ($x = 0; $x -lt $c.W; $x++) {
            $v = $c.P[$y * $c.W + $x]; $a = ($v -shr 24) -band 255
            $ring = ((($x % 16) -eq 0) -or (($x % 16) -eq 15) -or (($y % 16) -eq 0) -or (($y % 16) -eq 15))
            if ($a -ne 0 -and $a -ne 255) { $problems.Add("${n}: partial alpha at $x,$y") }
            if ($a -eq 255 -and ($v -band 0xFFFFFF) -eq 0) { $problems.Add("${n}: pure black at $x,$y") }
            if ($ring -and $a -ne 0) { $problems.Add("${n}: ring pixel at $x,$y") }
            if ($a -eq 255) { $solid++ }
        }
    }
    if ($solid -eq 0) { $problems.Add("${n}: empty") }
}
if ($problems.Count -gt 0) { $problems | Select-Object -First 20 | ForEach-Object { Write-Error $_ -ErrorAction Continue }; exit 1 }

Write-Host "$ScriptName wrote $($written.Count) files"
if ($Credits) {
    foreach ($w in $written) { Write-Host "| pack/kubejs/assets/grindless/textures/$w | drawn procedurally by tools/assets/$ScriptName | ours |" }
}
