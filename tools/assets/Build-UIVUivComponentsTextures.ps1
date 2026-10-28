<#
.SYNOPSIS
  Procedural 16x16 item pixel art for the UIV pump, robot arm and motor lines (package UIV-A8) of Gregtech Grindless.

.DESCRIPTION
  Every pixel is drawn by this script (palettes and small routines); nothing is copied or edited from GregTech Modern or any
  other mod. Output is deterministic. Same method as Build-UIVMemoriesCryostatTextures.ps1: shapes tinted by one base colour.

  Writes pack/kubejs/assets/grindless/textures/item/<name>.png for each item in $items below.

  Conventions: transparent background, every pixel fully opaque or fully transparent, none pure black, at least 40 opaque pixels.
  The final check fails the run (non-zero exit) if a written file breaks one.

  Run from the repo root:
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-UIVUivComponentsTextures.ps1

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

# one base colour -> a palette: K outline, W lit, H body, D shade
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
    ingot = @(
        '................', '................', '................', '................',
        '................', '...KKKKKKKKKK...', '..KWWWWWWWWHDK..', '.KWHHHHHHHHHDDK.',
        '.KWHHHHHHHHHDDK.', '.KKKKKKKKKKKKKK.', '................', '................',
        '................', '................', '................', '................')
    blade = @(
        '................', '.........KK.....', '........KWHK....', '.......KWHDK....',
        '......KWHHDK....', '......KWHHDK....', '.....KWHHDK.....', '.....KWHHDK.....',
        '....KWHHDK......', '....KWHHDK......', '...KKKKKKK......', '...KWHHHDK......',
        '...KKKKKKK......', '................', '................', '................')
    disk = @(
        '................', '................', '.....KKKKKK.....', '....KWWHHHDK....',
        '...KWHHHHHHDK...', '..KWHHKKKKHHDK..', '..KWHHK..KHHDK..', '..KWHHK..KHHDK..',
        '..KWHHKKKKHHDK..', '...KWHHHHHDDK...', '....KDDDDDDK....', '.....KKKKKK.....',
        '................', '................', '................', '................')
    tube = @(
        '................', '................', '....KKKKKKKK....', '...KWWHHHHDDK...',
        '...KWHHHHHHDK...', '...KWHHHHHHDK...', '...KWHHHHHHDK...', '...KWHHHHHHDK...',
        '...KWHHHHHHDK...', '...KWHHHHHHDK...', '...KWHHHHHHDK...', '....KDDDDDDK....',
        '.....KKKKKK.....', '................', '................', '................')
    dust = @(
        '................', '................', '................', '................',
        '.......KK.......', '......KWHK......', '.....KWHHHK.....', '....KWHHHHDK....',
        '...KWHHHHHHDK...', '..KWHHHHHHHDDK..', '..KDDDDDDDDDDK..', '...KKKKKKKKKK...',
        '................', '................', '................', '................')
}
$items = @(
    @('rhea_am_powder', 'dust', '8C90A8'), @('near_net_rhea_impeller', 'disk', '7078A0'), @('printed_rhea_impeller', 'disk', '8088B0'),
    @('dense_rhea_impeller', 'disk', '98A0C8'), @('machined_rhea_impeller', 'disk', 'B0B8E0'), @('balanced_rhea_impeller', 'disk', 'C8D0F0'),
    @('rhea_swarf', 'dust', '606890'), @('zirconium_sponge', 'dust', 'A0A8A8'),
    @('bmg_blank', 'tube', '80B0C0'), @('bmg_gate', 'blade', '6C98A8'), @('bmg_flexspline', 'tube', 'A0D0E0'),
    @('strain_wave_gear', 'disk', '90C0D0'), @('ba_cu_blend', 'dust', 'B88860'),
    @('bulk_gdbco', 'ingot', '484858'), @('oxygenated_gdbco', 'ingot', '585870'),
    @('impregnated_gdbco', 'ingot', '686888'), @('field_cooled_gdbco', 'ingot', '7890C0')
)
foreach ($it in $items) {
    $map = $shapes[$it[1]]
    foreach ($row in $map) { if ($row.Length -ne 16) { throw "$($it[0]): a map row is $($row.Length) wide" } }
    if ($map.Count -ne 16) { throw "$($it[0]): the map is $($map.Count) rows" }
    $c = New-Canvas
    Write-Map $c 0 0 $map (New-Tint $it[2])
    Out-Tex $c "item/$($it[0]).png"
}

# self-check: alpha 0 or 255, nothing pure black, enough opaque pixels
$problems = New-Object System.Collections.Generic.List[string]
foreach ($it in $items) {
    $p = Read-Png (Join-Path $OutRoot ("item\$($it[0]).png"))
    $opaque = 0
    for ($i = 0; $i -lt $p.P.Length; $i++) {
        $v = $p.P[$i]; $a = ($v -shr 24) -band 255
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
