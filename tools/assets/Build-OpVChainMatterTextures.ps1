<#
.SYNOPSIS
  Procedural 16x16 pixel art for the 8 chain matter items of the OpV-A0 package (process lines 1 and 2), of Gregtech Grindless.

.DESCRIPTION
  Every pixel is drawn by this script (palettes and small routines); nothing is copied or edited from GregTech Modern or any
  other mod. Output is deterministic. Same item method as Build-OpVCircuitsTextures.ps1 (one shape map tinted by one base colour).

  Writes (under pack/kubejs/assets/grindless/textures/):
    item/<name>.png for each item in $items below

  Conventions: transparent background, every pixel fully opaque or fully transparent, none pure black. The final check fails the run
  (non-zero exit) if a written file breaks one.

  Run from the repo root:
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-OpVChainMatterTextures.ps1

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
    # a thick crust slab with chain links on its face
    slab = @(
        '................', '................', '................', '...KKKKKKKKKK...',
        '..KWWWWWWWWWHK..', '.KWHHHHHHHHHHDK.', '.KWHKKHHKKHHHDK.', '.KWKHHKKHHKHHDK.',
        '.KWHKKHHKKHHHDK.', '.KHHHHHHHHHHDDK.', '.KDDDDDDDDDDDDK.', '.KDDDDDDDDDDDDK.',
        '..KKKKKKKKKKKK..', '................', '................', '................')
    # a slab crossed by the condensed lattice
    lattice = @(
        '................', '................', '..KKKKKKKKKKKK..', '.KWWWWWWWWWWWHK.',
        '.KWHKHHKHHKHHDK.', '.KWKKKKKKKKKKDK.', '.KWHKHHKHHKHHDK.', '.KWHKHHKHHKHHDK.',
        '.KWKKKKKKKKKKDK.', '.KWHKHHKHHKHHDK.', '.KHDDDDDDDDDDDK.', '.KDDDDDDDDDDDDK.',
        '..KKKKKKKKKKKK..', '................', '................', '................')
    # a cage part's bars, capped top and bottom, around the held phase
    caged = @(
        '................', '................', '..KKKKKKKKKKKKK.', '..KWWWWWWWWWWDK.',
        '..KKKKKKKKKKKKK.', '..KWWKWWKWHKHDK.', '..KWHKWHKHHKHDK.', '..KWHKHHKHHKHDK.',
        '..KHHKHHKHHKDDK.', '..KHDKHDKHDKDDK.', '..KKKKKKKKKKKKK.', '..KHDDDDDDDDDDK.',
        '..KKKKKKKKKKKKK.', '................', '................', '................')
    # a thin sheet seen at an angle
    lamina = @(
        '................', '................', '................', '................',
        '......KKKKKKKKK.', '.....KWWWWWWWHK.', '....KWHHHHHHDK..', '...KWHHHHHHDK...',
        '..KWHHHHHHDK....', '.KHHHHHHHDK.....', '.KDDDDDDDK......', '.KKKKKKKKK......',
        '................', '................', '................', '................')
    # strands over and under
    weave = @(
        '................', '.KKKKKKKKKKKKKK.', '.KWWKHHKWWKHHDK.', '.KWHKHDKWHKHDDK.',
        '.KKKKKKKKKKKKKK.', '.KHHKWWKHHKWWDK.', '.KHDKWHKHDKWHDK.', '.KKKKKKKKKKKKKK.',
        '.KWWKHHKWWKHHDK.', '.KWHKHDKWHKHDDK.', '.KKKKKKKKKKKKKK.', '.KHHKWWKHHKWWDK.',
        '.KHDKWHKHDKWHDK.', '.KDDDDDDDDDDDDK.', '.KKKKKKKKKKKKKK.', '................')
    # a spool of braided wire with its free end
    braid = @(
        '................', '................', '....KKKKKKKK....', '...KWWWWWWHDK...',
        '...KKKKKKKKKK...', '....KWDWDWDK....', '....KDWDWDHK....', '....KWDWDWDK....',
        '....KDWDWDHK....', '....KWDWDWDK....', '....KDWDWDHK....', '...KKKKKKKKKK...',
        '...KHDDDDDDDK...', '....KKKKKKKK....', '..........KWK...', '...........K....')
}
$items = @(
    # line 1
    @('chain_crust_slab', 'slab', '8C7A6A'), @('caged_chain_phase', 'caged', 'B09060'), @('pbo_braided_chain_wire', 'braid', 'D0A040'),
    # line 2
    @('chain_lattice_slab', 'lattice', '7A8AA0'), @('caged_chain_lattice', 'caged', '8098B8'), @('chain_lamina', 'lamina', '90A8C0'),
    # the Ni layer and the mesh weave
    @('caged_ni_chain', 'caged', 'A0A0B8'), @('chain_mesh_weave', 'weave', 'C0A878')
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
        if ($a -eq 255 -and ($v -band 0xFFFFFF) -eq 0) { $problems.Add("item/$($it[0]): pure black at $i") }
        if ($a -eq 255) { $opaque++ }
    }
    if ($opaque -lt 40) { $problems.Add("item/$($it[0]): only $opaque opaque pixels") }
}
if ($problems.Count -gt 0) { $problems | Select-Object -First 20 | ForEach-Object { Write-Error $_ -ErrorAction Continue }; exit 1 }

Write-Host "$ScriptName wrote $($written.Count) files"
if ($Credits) {
    foreach ($w in $written) { Write-Host "| pack/kubejs/assets/grindless/textures/$w | drawn procedurally by tools/assets/$ScriptName | ours |" }
}
