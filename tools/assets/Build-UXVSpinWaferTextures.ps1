<#
.SYNOPSIS
  Procedural 16x16 pixel art for the 6 items of the UXV spintronic wafer (package D4-UXV-SPIN) of Gregtech Grindless.

.DESCRIPTION
  Every pixel is drawn by Era.Lib.ps1's component shapes with a palette per item; nothing is copied or edited from GregTech Modern or
  any other mod. Output is deterministic. The items are those startup_scripts/grindless/uxv/spin_wafer.js registers.

  Writes pack/kubejs/assets/grindless/textures/item/<name>.png.

  Run from the repo root:
      powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-UXVSpinWaferTextures.ps1

  Every pixel is fully opaque or fully transparent, none is pure black, the corner is transparent and each icon has at least 20 opaque
  pixels. The final check fails the run if a file breaks a rule, if two textures are identical, or if the drawn set differs from the
  items spin_wafer.js registers.

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
$EraName = 'uxv'; . (Join-Path $PSScriptRoot 'Era.Lib.ps1')

$RepoRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..'))
if (-not $OutRoot) { $OutRoot = Join-Path $RepoRoot 'pack\kubejs\assets\grindless\textures' }
$OutRoot = [System.IO.Path]::GetFullPath($OutRoot)
$ScriptName = Split-Path -Leaf $PSCommandPath

# name -> kind, body colour, accent colour
$Items = [ordered]@{
    si28_cmos_wafer  = @('card', '3A4658', 'A8C0E0')
    si28_m1_wafer    = @('card', '3A4658', 'E0A070')
    me_on_spin_wafer = @('card', '3A3A64', 'F890D0')
    meso_spin_wafer  = @('card', '3E3068', '70F0E0')
    spintronic_wafer = @('card', '4A2E68', 'FFD870')
    spintronic_die   = @('chip', '4A3470', 'FFE070')
}

$written = @()
foreach ($n in $Items.Keys) {
    $s = $Items[$n]
    $c = New-EraComponentBody $EraName $s[0] $n (Hex $s[1]) (Hex $s[2])
    Save-Png $c (Join-Path $OutRoot "item\$n.png")
    $written += "item/$n.png"
}

$problems = 0
function Add-Problem { param([string]$Name, [string]$Msg) $script:problems++; Write-Warning "$Name`: $Msg" }
$keys = @{}
foreach ($rel in $written) {
    $img = Read-Png (Join-Path $OutRoot ($rel -replace '/', '\'))
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
$src = Get-Content -LiteralPath (Join-Path $RepoRoot 'pack\kubejs\startup_scripts\grindless\uxv\spin_wafer.js') -Raw
foreach ($n in $Items.Keys) { if ($src -notmatch "(?m)^\s+$n\s*:\s*\d+") { Add-Problem $n 'drawn here but not registered by spin_wafer.js' } }
$reg = [regex]::Match($src, '(?s)const ITEMS = \{(.*?)\n  \}').Groups[1].Value
foreach ($m in [regex]::Matches($reg, '(?m)^\s+([a-z0-9_]+)\s*:')) { if (-not $Items.Contains($m.Groups[1].Value)) { Add-Problem $m.Groups[1].Value 'registered by spin_wafer.js but not drawn here' } }
if ($problems -gt 0) { throw "$problems problem(s) in the texture checks (see the warnings above)" }
Write-Host "wrote $($written.Count) textures to $OutRoot"

if ($Credits) {
    Write-Host ''
    foreach ($rel in $written) {
        Write-Host ("| ``pack/kubejs/assets/grindless/textures/$rel`` | Generated with tools/assets/$ScriptName (procedural pixel art, original) by the assets agent (D4-UXV-SPIN) | the pack's licence (MIT) |")
    }
}
