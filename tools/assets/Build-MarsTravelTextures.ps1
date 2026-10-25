<#
.SYNOPSIS
  Procedural 16x16 pixel art for Mars (end of the EV era) of Gregtech Grindless (GregTech style: bevels, top-left light,
  selective outlines).

.DESCRIPTION
  Every pixel is drawn by this script (palettes + char maps + small shading routines); nothing is copied or edited
  from GregTech Modern, GCYR or any other mod. Output is deterministic: re-running overwrites the same bytes.

  Writes (under pack/kubejs/assets/grindless/textures/):
    item/martian_vein_sample_frame.png   (layer 0 of grindless:vein_sample_<id> for the veins of veins_mars.json, untinted)
    item/martian_vein_sample_core.png    (layer 1: greys only, tinted with the colour of each vein)

  The Mars sample is the lunar sample's sibling (tools/assets/Build-MoonTextures.ps1, same capsule outline so the family reads
  at a glance): an EV titanium capsule instead of stainless steel, and a rust-red valve, seal band and foot ring (Mars) instead
  of the gold seal. Its drill core shows a dusty top, a dark basalt band and a bright band (ice or the vein), so it does not
  read as the lunar core.

  Run from the repo root (PowerShell 5.1 blocks unsigned scripts by default; this bypass only affects that process):
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-MarsTravelTextures.ps1
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-MarsTravelTextures.ps1 -Credits

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

if (-not $OutRoot) { $OutRoot = Join-Path $PSScriptRoot '..\..\pack\kubejs\assets\grindless\textures' }
$OutRoot = [System.IO.Path]::GetFullPath($OutRoot)
$ScriptName = Split-Path -Leaf $PSCommandPath

$written = New-Object System.Collections.Generic.List[string]
function Out-Tex {
    param($Canvas, [string]$Rel)
    $path = Join-Path $OutRoot ($Rel -replace '/', '\')
    # an editor, indexer or virus scanner can hold a file for a moment: retry the write a few times
    for ($try = 1; $try -le 6; $try++) {
        try { Save-Png $Canvas $path; break }
        catch [System.IO.IOException] { if ($try -eq 6) { throw }; Start-Sleep -Milliseconds (250 * $try) }
    }
    $written.Add($Rel)
}

function Assert-Map {
    param([string]$Name, [string[]]$Rows, [int]$W, [int]$H)
    if ($Rows.Count -ne $H) { throw "${Name}: expected $H rows, got $($Rows.Count)" }
    for ($i = 0; $i -lt $Rows.Count; $i++) { if ($Rows[$i].Length -ne $W) { throw "${Name}: row $i has $($Rows[$i].Length) chars, expected $W" } }
}

# Like New-Palette, but a repeated letter is an error instead of a silent overwrite.
function New-Pal {
    param([string]$Spec)
    $pal = New-Object 'System.Collections.Generic.Dictionary[string,int]' ([System.StringComparer]::Ordinal)
    foreach ($tok in ($Spec -split '\s+')) {
        if ($tok -eq '') { continue }
        $kv = $tok -split '=', 2
        if ($pal.ContainsKey($kv[0])) { throw "Palette letter '$($kv[0])' defined twice" }
        $pal[$kv[0]] = Hex $kv[1]
    }
    return $pal
}

function Get-ClampInt { param([int]$V, [int]$Lo, [int]$Hi) return [Math]::Max($Lo, [Math]::Min($Hi, $V)) }

# Cylinder shading across a horizontal span. Returns a ramp index: 0 spec, 1 light, 2 mid, 3 dark, 4 darkest.
function Get-SpanTone {
    param([int]$X, [int]$X0, [int]$X1)
    $frac = ($X - $X0 + 0.5) / ($X1 - $X0 + 1)
    if ($frac -lt 0.22) { return 1 }
    elseif ($frac -lt 0.45) { return 0 }
    elseif ($frac -lt 0.62) { return 2 }
    elseif ($frac -lt 0.85) { return 3 }
    else { return 4 }
}

# ============================================================================================
#  ITEMS
# ============================================================================================
# --- Mars vein sample: the lunar sample's sibling. Titanium (GTM's titanium is a pale violet-pink; EV) with a rust-red valve,
# seal band and foot ring. Two layers like every vein sample: the frame is drawn untinted, the core in greys only so the game
# tints it with the colour of each vein; the core only paints inside the frame's window, which is transparent in the frame.
$CapsulePal = New-Pal @'
0=FFF5FF 1=F1DBF7 2=DAB9E7 3=C29ED3 4=9E7AB0 5=6F5180
h=FFD3B2 i=EE8F58 j=C85B2F k=8D3919 l=531E0C
W=FFF7F3 L=F1DCD6
'@
$RampTitanium = @($CapsulePal['0'], $CapsulePal['1'], $CapsulePal['2'], $CapsulePal['4'], $CapsulePal['5'])
$RampSeal = @($CapsulePal['h'], $CapsulePal['i'], $CapsulePal['j'], $CapsulePal['k'], $CapsulePal['l'])

function New-MartianSampleFrame {
    $c = New-Canvas
    $st = $RampTitanium
    # rust valve knob, titanium cap and the rust seal band under it
    foreach ($x in 7..8) { Set-Px $c $x 1 $RampSeal[(Get-SpanTone $x 7 8)] }
    foreach ($x in 5..10) { Set-Px $c $x 2 $st[(Get-SpanTone $x 5 10)] }
    foreach ($x in 4..11) { Set-Px $c $x 3 $st[(Get-SpanTone $x 4 11)] }
    foreach ($x in 4..11) { Set-Px $c $x 4 $RampSeal[(Get-SpanTone $x 4 11)] }
    # side rails around the window (x5..10, y5..11), a rust foot ring and a rounded titanium bottom cap
    foreach ($y in 5..11) { Set-Px $c 4 $y $st[1]; Set-Px $c 11 $y $st[3] }
    foreach ($x in 4..11) { Set-Px $c $x 12 $RampSeal[(Get-ClampInt ((Get-SpanTone $x 4 11) + 1) 0 4)] }
    foreach ($x in 5..10) { Set-Px $c $x 13 $st[(Get-ClampInt ((Get-SpanTone $x 5 10) + 1) 0 4)] }
    foreach ($x in 6..9) { Set-Px $c $x 14 $st[(Get-ClampInt ((Get-SpanTone $x 6 9) + 2) 0 4)] }
    # the window is shielded from the outline pass with a marker, then cleared
    $marker = Hex 'FF00FF'
    foreach ($y in 5..11) { foreach ($x in 5..10) { Set-Px $c $x $y $marker } }
    Add-Outline $c
    foreach ($y in 5..11) { foreach ($x in 5..10) { Set-Px $c $x $y 0 } }
    # warm glass highlight down the left inner wall (the core never covers x5)
    Set-Px $c 5 5 $CapsulePal['L']
    foreach ($y in 6..10) { Set-Px $c 5 $y $CapsulePal['W'] }
    Set-Px $c 5 11 $CapsulePal['L']
    return $c
}

# Core footprint inside the window: x6..10, y6..11 (y5 stays empty: the headspace of the capsule). A drill core from the Martian
# ground: a dusty top, a dark basalt band, a bright band (the ice or the vein itself) and darker rock at the bottom, lit from the left.
$MartianCoreRows = @(
    'ABACB',
    'BBCCD',
    'DDEEE',
    'AABBC',
    'BCCDD',
    'DEFEF'
)
Assert-Map 'MartianCoreRows' $MartianCoreRows 5 6
$CorePal = New-Palette 'A=F2F2F2 B=D6D6D6 C=B4B4B4 D=8C8C8C E=666666 F=424242'

function New-MartianSampleCore {
    $c = New-Canvas
    Write-Map $c 6 6 $MartianCoreRows $CorePal
    return $c
}

# ============================================================================================
#  BUILD
# ============================================================================================
Out-Tex (New-MartianSampleFrame) 'item/martian_vein_sample_frame.png'
Out-Tex (New-MartianSampleCore) 'item/martian_vein_sample_core.png'

# ============================================================================================
#  VERIFY what was written (size, binary alpha, no pure black, grey core that only paints inside the frame's window, and not the
#  same picture as the lunar sample)
# ============================================================================================
$problems = 0
foreach ($rel in $written) {
    $path = Join-Path $OutRoot ($rel -replace '/', '\')
    $img = Read-Png $path
    $msgs = @()
    if ($img.W -ne 16 -or $img.H -ne 16) { $msgs += "bad size $($img.W)x$($img.H)" }
    $opaque = 0; $black = 0; $gray = $true
    foreach ($px in $img.P) {
        $alpha = ($px -shr 24) -band 255
        if ($alpha -ne 0 -and $alpha -ne 255) { $msgs += 'partial alpha'; break }
        if ($alpha -eq 255) {
            $opaque++
            $q = Get-Rgba $px
            if ($q[0] -eq 0 -and $q[1] -eq 0 -and $q[2] -eq 0) { $black++ }
            if ($q[0] -ne $q[1] -or $q[1] -ne $q[2]) { $gray = $false }
        }
    }
    if ($opaque -eq 0) { $msgs += 'fully transparent' }
    if ($black -gt 0) { $msgs += "$black pure-black px" }
    if ($rel -like '*_sample_core.png') {
        if (-not $gray) { $msgs += 'core is not grayscale' }
        $frame = Read-Png (Join-Path $OutRoot (($rel -replace '_core\.png$', '_frame.png') -replace '/', '\'))
        for ($i = 0; $i -lt 256; $i++) {
            if ((($img.P[$i] -shr 24) -band 255) -ne 0 -and (($frame.P[$i] -shr 24) -band 255) -ne 0) { $msgs += "core covers a frame pixel ($($i % 16),$([int][Math]::Floor($i / 16)))"; break }
        }
    }
    $lunar = Join-Path $OutRoot (($rel -replace 'martian_', 'lunar_') -replace '/', '\')
    if (Test-Path -LiteralPath $lunar) {
        $other = Read-Png $lunar
        if ((($img.P) -join ',') -eq (($other.P) -join ',')) { $msgs += 'identical to the lunar sample texture' }
    }
    if ($msgs.Count -gt 0) { $problems++; Write-Warning "$rel : $($msgs -join '; ')" }
}

Write-Host "written $($written.Count) files under $OutRoot ($problems with warnings)"
foreach ($rel in $written) { Write-Host "  $rel" }

if ($Credits) {
    Write-Host ''
    foreach ($rel in $written) {
        Write-Host ("| ``pack/kubejs/assets/grindless/textures/$rel`` | Generated with tools/assets/$ScriptName (procedural pixel art, original) by the mars-travel agent, 2026-10-25 | the pack's own (pending; proposed CC BY-SA 4.0) |")
    }
}
if ($problems -gt 0) { exit 1 }
