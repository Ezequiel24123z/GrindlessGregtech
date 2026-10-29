<#
.SYNOPSIS
  Procedural 16x16 pixel art for the four UXV-A1 items of Gregtech Grindless (element 121 and 122 atoms, Fm-257 and Cm-248 plated blanks).

.DESCRIPTION
  Every pixel is drawn by this script; nothing is copied or edited from GregTech Modern or any other mod. Output is deterministic.

  Writes (under pack/kubejs/assets/grindless/textures/): item/element_121_atoms.png, element_122_atoms.png, fm257_plated_blank.png,
  cm248_plated_blank.png.

  Conventions: transparent background, outer 1 px ring empty, every pixel fully opaque or fully transparent, none pure black. The
  final check fails the run (non-zero exit) if a written file breaks one.

  Run from the repo root:
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-UXVSuperheavyTextures.ps1

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
$Items = @('element_121_atoms', 'element_122_atoms', 'fm257_plated_blank', 'cm248_plated_blank')

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
        'element_121_atoms' {
            # a pale membrane with a few violet atoms caught on it
            Set-Rect $c 2 3 12 10 (Hex '8C94A0')
            Set-Rect $c 3 4 10 8 (Hex 'C8D0DC')
            foreach ($p in @(@(5, 6), @(9, 5), @(7, 9), @(10, 9))) { Set-Px $c $p[0] $p[1] (Hex 'B040D0'); Set-Px $c ($p[0] + 1) $p[1] (Hex 'E8A0F0') }
            Set-Rect $c 2 12 12 1 (Hex '5C6470')
        }
        'element_122_atoms' {
            # the same membrane with blue-violet atoms
            Set-Rect $c 2 3 12 10 (Hex '8C94A0')
            Set-Rect $c 3 4 10 8 (Hex 'C8D0DC')
            foreach ($p in @(@(5, 5), @(9, 6), @(6, 9), @(10, 9))) { Set-Px $c $p[0] $p[1] (Hex '6048D8'); Set-Px $c ($p[0] + 1) $p[1] (Hex 'B8A0F8') }
            Set-Rect $c 2 12 12 1 (Hex '5C6470')
        }
        'fm257_plated_blank' {
            # a titanium plate with a round fermium deposit
            Set-Rect $c 2 2 12 12 (Hex '9CA2AC')
            Set-Rect $c 3 3 10 10 (Hex '747A86')
            Set-Rect $c 5 5 6 6 (Hex 'D8A8B8')
            Set-Rect $c 6 6 4 4 (Hex 'F0C8D4')
            Set-Rect $c 2 13 12 1 (Hex '4C525C')
        }
        default {
            # a titanium plate with a round curium deposit
            Set-Rect $c 2 2 12 12 (Hex '9CA2AC')
            Set-Rect $c 3 3 10 10 (Hex '747A86')
            Set-Rect $c 5 5 6 6 (Hex 'B8B0D8')
            Set-Rect $c 6 6 4 4 (Hex 'D8D0F0')
            Set-Rect $c 2 13 12 1 (Hex '4C525C')
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
