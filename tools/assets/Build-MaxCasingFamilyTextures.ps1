<#
.SYNOPSIS
  Procedural 16x16 block textures for the MAX casing family of Gregtech Grindless (package D5-CAS-MAX):
  tensegrity_truss_casing, membrane_vacuum_casing, droplet_radiator_casing and shell_window_coil_casing.

.DESCRIPTION
  Every pixel is drawn by this script; nothing is copied from GregTech Modern or any other mod. Output is deterministic (mottles come
  from Get-Noise, a hash of the position). Writes under pack/kubejs/assets/grindless/textures/block/max/:
      tensegrity_truss_casing.png    dark graphite struts in an X brace, thin white-gold strand tendons on the diagonals, nodes at the corners.
      membrane_vacuum_casing.png     smooth dark plate under a fine iridescent gold-violet grid, flanged and bolted rim.
      droplet_radiator_casing.png    fine vertical silver droplet streaks over a dark collector frame, collector slots every 8 px.
      shell_window_coil_casing.png   concentric square windings of white-gold strand round a dark core in a grey CMC former (no lit state).

  Run from the repo root:
      powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-MaxCasingFamilyTextures.ps1 -Credits

  The final check fails the run if a file has partial alpha, a pure black pixel, a transparent pixel, duplicates another texture, or
  is not referenced by foundation.js.

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
$EraName = 'max'; . (Join-Path $PSScriptRoot 'Era.Lib.ps1')

$RepoRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..'))
if (-not $OutRoot) { $OutRoot = Join-Path $RepoRoot 'pack\kubejs\assets\grindless\textures' }
$OutRoot = [System.IO.Path]::GetFullPath($OutRoot)
$ScriptName = Split-Path -Leaf $PSCommandPath

function Get-Noise {
    param([int]$X, [int]$Y, [int]$Salt)
    $v = [int64]($X * 73856093) -bxor [int64]($Y * 19349663) -bxor [int64]($Salt * 83492791)
    return [int]([Math]::Abs($v) % 1000)
}

function Get-Tone {
    param([int]$Argb, [int]$X, [int]$Y, [int]$Salt)
    $f = 1.15 - 0.03 * ($X + $Y) / 2
    $n = Get-Noise $X $Y $Salt
    if ($n -lt 110) { $f *= 0.88 } elseif ($n -gt 900) { $f *= 1.12 }
    return (Shade $Argb $f)
}

$Blocks = @('tensegrity_truss_casing', 'membrane_vacuum_casing', 'droplet_radiator_casing', 'shell_window_coil_casing')

function New-Block16 {
    param([string]$Name)
    $c = New-Canvas 16 16
    switch ($Name) {
        'tensegrity_truss_casing' {
            $graphite = Hex '30323A'; $strut = Hex '4A4D58'; $gold = Hex 'F0DCA0'; $node = Hex 'D8D4C8'; $rim = Hex '1C1D24'
            for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
                $col = Get-Tone $graphite $x $y 811
                if ($x -eq $y -or $x -eq (15 - $y) -or $x -eq $y + 1 -or $x -eq (14 - $y)) { $col = Get-Tone $strut $x $y 812 }
                if ($x -eq $y + 2 -and $x -lt 14 -or $x -eq (13 - $y) -and $y -gt 1) { $col = Shade $gold 0.95 }
                if (($x -le 2 -or $x -ge 13) -and ($y -le 2 -or $y -ge 13)) { $col = Get-Tone $node $x $y 813 }
                if ($x -eq 0 -or $y -eq 0 -or $x -eq 15 -or $y -eq 15) { $col = $rim }
                Set-Px $c $x $y $col
            } }
        }
        'membrane_vacuum_casing' {
            $plate = Hex '22222E'; $gold = Hex 'C8A050'; $violet = Hex '8060B8'; $flange = Hex '55586A'; $bolt = Hex 'B8BCD0'
            for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
                $col = Get-Tone $plate $x $y 821
                if (($x % 3) -eq 1 -or ($y % 3) -eq 1) { if ((($x + $y) % 2) -eq 0) { $col = Shade $gold 0.85 } else { $col = Shade $violet 0.95 } }
                if ($x -le 1 -or $y -le 1 -or $x -ge 14 -or $y -ge 14) { $col = Get-Tone $flange $x $y 822 }
                if (($x -eq 1 -or $x -eq 14) -and ($y -eq 1 -or $y -eq 14)) { $col = $bolt }
                if (($x -eq 7 -or $x -eq 8) -and ($y -le 1 -or $y -ge 14)) { $col = $bolt }
                if (($y -eq 7 -or $y -eq 8) -and ($x -le 1 -or $x -ge 14)) { $col = $bolt }
                Set-Px $c $x $y $col
            } }
        }
        'droplet_radiator_casing' {
            $frame = Hex '2A2E38'; $silver = Hex 'C8D0DA'; $streak = Hex '8C98AA'; $slot = Hex '12141A'; $edge = Hex '4A5060'
            for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
                $col = Get-Tone $frame $x $y 831
                $n = Get-Noise $x 0 832
                if (($x % 2) -eq 0) { $col = Shade $streak (0.8 + 0.25 * (($y + $x * 3) % 6) / 5) }
                if (($x % 4) -eq 0 -and (($y * 5 + $x) % 7) -lt 2) { $col = $silver }
                if ($y -eq 7 -or $y -eq 8 -or $y -eq 15 -or $y -eq 0) { $col = Get-Tone $edge $x $y 833 }
                if (($y -eq 7 -or $y -eq 8) -and ($x % 4) -lt 2) { $col = Shade $slot 1.3 }
                if ($x -eq 0 -or $x -eq 15) { $col = Get-Tone $edge $x $y 834 }
                Set-Px $c $x $y $col
            } }
        }
        'shell_window_coil_casing' {
            $former = Hex '6A6E78'; $core = Hex '1E2028'; $strand = Hex 'F2E2B0'; $gap = Hex '3C404A'
            for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
                $ring = [Math]::Max([Math]::Abs($x - 7.5), [Math]::Abs($y - 7.5))
                $r = [int][Math]::Floor($ring)
                if ($r -ge 6) { $col = Get-Tone $former $x $y 841 }
                elseif ($r -le 1) { $col = Get-Tone $core $x $y 842 }
                elseif ($r % 2 -eq 0) { $col = Shade $strand (1.0 - 0.03 * (($x + $y) % 3)) }
                else { $col = Shade $gap (1.0 + 0.05 * ($x % 2)) }
                if ($x -eq 0 -or $y -eq 0 -or $x -eq 15 -or $y -eq 15) { $col = Shade $former 0.55 }
                Set-Px $c $x $y $col
            } }
        }
    }
    return $c
}

$written = @()
foreach ($n in $Blocks) {
    $rel = "block/max/$n.png"
    Save-Png (New-Block16 $n) (Join-Path $OutRoot $rel)
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
    if ($opaque -ne 256) { Add-Problem $rel 'block must be fully opaque' }
    $k = $img.P -join ','
    if ($keys.ContainsKey($k)) { Add-Problem $rel "identical to $($keys[$k])" } else { $keys[$k] = $rel }
}
$src = Get-Content -LiteralPath (Join-Path $RepoRoot 'pack\kubejs\startup_scripts\grindless\max\foundation.js') -Raw
foreach ($b in $Blocks) { if ($src -notmatch "grindless:block/max/${b}'") { Add-Problem $b 'block texture not referenced by foundation.js' } }
if ($problems -gt 0) { throw "$problems problem(s) in the texture checks (see the warnings above)" }
Write-Host "wrote $($written.Count) textures to $OutRoot"

if ($Credits) {
    Write-Host ''
    foreach ($rel in $written) {
        Write-Host ("| ``pack/kubejs/assets/grindless/textures/$rel`` | Generated with tools/assets/$ScriptName (procedural pixel art, original) by the assets agent (D5-CAS-MAX) | the pack's licence (MIT) |")
    }
}
