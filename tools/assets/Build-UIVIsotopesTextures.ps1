<#
.SYNOPSIS
  Procedural 16x16 pixel art for the four UIV-A1 items of Gregtech Grindless (Cf-249 target wheel, Ni/Ti multilayer, neutron
  supermirror, neutron guide).

.DESCRIPTION
  Every pixel is drawn by this script; nothing is copied or edited from GregTech Modern or any other mod. Output is deterministic.

  Writes (under pack/kubejs/assets/grindless/textures/): item/cf249_target_wheel.png, ni58_ti_multilayer.png,
  neutron_supermirror.png, neutron_guide.png.

  Conventions: transparent background, outer 1 px ring empty, every pixel fully opaque or fully transparent, none pure black. The
  final check fails the run (non-zero exit) if a written file breaks one.

  Run from the repo root:
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-UIVIsotopesTextures.ps1

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
$Items = @('cf249_target_wheel', 'ni58_ti_multilayer', 'neutron_supermirror', 'neutron_guide')

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
        'cf249_target_wheel' {
            # a titanium hub and rim with a ring of californium oxide segments
            Set-Rect $c 3 3 10 10 (Hex '8C929C')
            Set-Rect $c 4 4 8 8 (Hex '3C4048')
            Set-Rect $c 5 5 6 6 (Hex '2A2D33')
            foreach ($p in @(@(4, 7), @(4, 8), @(11, 7), @(11, 8), @(7, 4), @(8, 4), @(7, 11), @(8, 11))) { Set-Px $c $p[0] $p[1] (Hex 'D8B04C') }
            foreach ($p in @(@(5, 5), @(10, 5), @(5, 10), @(10, 10))) { Set-Px $c $p[0] $p[1] (Hex 'B8903C') }
            Set-Rect $c 7 7 2 2 (Hex 'C8CED8')
            Set-Px $c 3 3 (Hex 'C8CED8'); Set-Px $c 12 3 (Hex 'C8CED8'); Set-Px $c 3 12 (Hex '5C626C'); Set-Px $c 12 12 (Hex '5C626C')
        }
        'ni58_ti_multilayer' {
            # a glass chip with thin alternating nickel and titanium bands
            Set-Rect $c 2 4 12 8 (Hex 'A8C8D8')
            for ($y = 5; $y -le 10; $y++) { $col = if ($y % 2 -eq 1) { Hex 'C4C8B0' } else { Hex '8E96A0' }; Set-Rect $c 3 $y 10 1 $col }
            Set-Rect $c 2 4 12 1 (Hex 'E4F0F6'); Set-Rect $c 2 11 12 1 (Hex '688898')
        }
        'neutron_supermirror' {
            # a polished mirror plate with a faint chevron of layers
            Set-Rect $c 2 3 12 10 (Hex '9CA4B0')
            Set-Rect $c 3 4 10 8 (Hex 'D4DCE8')
            Set-Rect $c 3 4 10 2 (Hex 'F0F4FA')
            for ($i = 0; $i -lt 5; $i++) { Set-Px $c (4 + $i) (9 - $i) (Hex '7C8CA8'); Set-Px $c (11 - $i) (9 - $i) (Hex '7C8CA8') }
            Set-Rect $c 2 12 12 1 (Hex '5C6470')
        }
        default {
            # a square glass tube lined with mirrors, seen end on, in an aluminium sleeve
            Set-Rect $c 2 2 12 12 (Hex 'B4B8C0')
            Set-Rect $c 3 3 10 10 (Hex '60646C')
            Set-Rect $c 4 4 8 8 (Hex 'D4DCE8')
            Set-Rect $c 5 5 6 6 (Hex '1C2A3C')
            Set-Rect $c 6 6 4 4 (Hex '2C4468')
            Set-Px $c 7 7 (Hex '7CA8E0'); Set-Px $c 2 2 (Hex 'E0E4EA'); Set-Px $c 13 13 (Hex '787C84')
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
