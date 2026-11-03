<#
.SYNOPSIS
  Procedural 16x16 item textures for the nine intermediates of UEV's monolithic photonic wafer flow (package D4-UEV-PHOTON) of
  Gregtech Grindless.

.DESCRIPTION
  Every pixel is drawn by this script (a palette and two small shapes); nothing is copied or edited from GregTech Modern or any other
  mod. Output is deterministic. Writes pack/kubejs/assets/grindless/textures/item/<name>.png for: wsi_waveguide_wafer,
  detector_waveguide_wafer, graphene_ring_wafer, encapsulated_ring_wafer, electroded_photonic_wafer, hybrid_quantum_wafer,
  clad_quantum_wafer (wafers) and quantum_photonic_die, pigtailed_quantum_die (dies). The final check fails the run (non-zero exit) on
  partial alpha, pure black or too few opaque pixels.

  Run from the repo root:
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-UEVPhotonicWaferTextures.ps1

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

function Shade {
    param([string]$Rgb, [double]$F)
    $r = [Convert]::ToInt32($Rgb.Substring(0, 2), 16); $g = [Convert]::ToInt32($Rgb.Substring(2, 2), 16); $b = [Convert]::ToInt32($Rgb.Substring(4, 2), 16)
    if ($F -ge 1) { $f = $F - 1; $r += (255 - $r) * $f; $g += (255 - $g) * $f; $b += (255 - $b) * $f }
    else { $r *= $F; $g *= $F; $b *= $F }
    '{0:X2}{1:X2}{2:X2}' -f [Math]::Max(8, [Math]::Min(255, [int]$r)), [Math]::Max(8, [Math]::Min(255, [int]$g)), [Math]::Max(8, [Math]::Min(255, [int]$b))
}
function New-Tint {
    param([string]$Rgb)
    New-Palette ("K=$(Shade $Rgb 0.35) W=$(Shade $Rgb 1.5) H=$Rgb D=$(Shade $Rgb 0.65)")
}

$shapes = @{
    wafer = @(
        '................', '................', '................', '.....KKKKKK.....',
        '...KKWWWWHHKK...', '..KWWHHHHHHDDK..', '..KWHHHHHHHDDK..', '..KWHHHHHHHDDK..',
        '..KWHHHHHHHDDK..', '..KKDHHHHHDDKK..', '....KKDDDDKK....', '......KKKK......',
        '................', '................', '................', '................')
    die = @(
        '................', '................', '..K.K.K.K.K.K...', '.KKKKKKKKKKKKKK.',
        '.KWWWWWWWWWHDK..', '.KWHHHHHHHHHDK..', '.KWHHKKKKHHHDK..', '.KWHHKHHKHHHDK..',
        '.KWHHKKKKHHHDK..', '.KWHHHHHHHHHDK..', '.KKKKKKKKKKKKK..', '..K.K.K.K.K.K...',
        '................', '................', '................', '................')
}
$items = @(
    @('wsi_waveguide_wafer', 'wafer', '7A8AA8'), @('detector_waveguide_wafer', 'wafer', '5A78C8'),
    @('graphene_ring_wafer', 'wafer', '58606C'), @('encapsulated_ring_wafer', 'wafer', '8090A8'),
    @('electroded_photonic_wafer', 'wafer', 'D0B060'), @('hybrid_quantum_wafer', 'wafer', 'B87A5A'),
    @('clad_quantum_wafer', 'wafer', 'A8C8D8'),
    @('quantum_photonic_die', 'die', 'A890E0'), @('pigtailed_quantum_die', 'die', 'C8A8F0')
)
foreach ($it in $items) {
    $map = $shapes[$it[1]]
    foreach ($row in $map) { if ($row.Length -ne 16) { throw "$($it[0]): a map row is $($row.Length) wide" } }
    if ($map.Count -ne 16) { throw "$($it[0]): the map is $($map.Count) rows" }
    $c = New-Canvas
    Write-Map $c 0 0 $map (New-Tint $it[2])
    Out-Tex $c "item/$($it[0]).png"
}

$problems = New-Object System.Collections.Generic.List[string]
foreach ($it in $items) {
    $png = Read-Png (Join-Path $OutRoot ("item\$($it[0]).png"))
    $opaque = 0
    for ($i = 0; $i -lt $png.P.Length; $i++) {
        $v = $png.P[$i]; $a = ($v -shr 24) -band 255
        if ($a -ne 0 -and $a -ne 255) { $problems.Add("item/$($it[0]): partial alpha at $i") }
        if ($a -eq 255) { $opaque++; if (($v -band 0xFFFFFF) -eq 0) { $problems.Add("item/$($it[0]): pure black at $i") } }
    }
    if ($opaque -lt 40) { $problems.Add("item/$($it[0]): only $opaque opaque pixels") }
}
if ($problems.Count -gt 0) { $problems | Select-Object -First 20 | ForEach-Object { Write-Error $_ -ErrorAction Continue }; exit 1 }

Write-Host "$ScriptName wrote $($written.Count) files"
if ($Credits) {
    foreach ($w in $written) { Write-Host "| pack/kubejs/assets/grindless/textures/$w | drawn procedurally by tools/assets/$ScriptName | ours |" }
}
