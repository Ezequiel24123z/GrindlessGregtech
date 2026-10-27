<#
.SYNOPSIS
  Procedural 16x16 pixel art for the Horizon Collector (gtceu:lv_horizon_collector) and the Horizon Shard (grindless:horizon_shard),
  the machine the player arrives with in Gregtech Grindless (package STEAM-X1; GregTech style: top-left light, selective outlines).

.DESCRIPTION
  Every pixel is drawn by this script (geometry, palettes and char maps); nothing is copied or edited from GregTech Modern,
  GregTech Leisure or any other mod. Output is deterministic: re-running overwrites the same bytes.

  Writes (under pack/kubejs/assets/grindless/textures/):
    block/machines/horizon_collector/overlay_front.png                    idle: a dark pinpoint in a steel collar, its disk dim
    block/machines/horizon_collector/overlay_front_active.png             16x128 strip of 8 frames: a hot spot circles the disk
    block/machines/horizon_collector/overlay_front_active.png.mcmeta      frametime 3
    block/machines/horizon_collector/overlay_front_active_emissive.png    the same strip, only the glowing disk and photon ring
    block/machines/horizon_collector/overlay_front_active_emissive.png.mcmeta
    item/horizon_shard.png                                                a dark violet crystal splinter with iridescent edges

  The overlays sit on GTM's LV hull (workableTieredHullModel), so their background is transparent.

  Run from the repo root (PowerShell 5.1 blocks unsigned scripts by default; this bypass only affects that process):
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-HorizonCollectorTextures.ps1
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-HorizonCollectorTextures.ps1 -Credits

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
function Out-Mcmeta {
    param([string]$Rel, [int]$FrameTime)
    Save-Mcmeta (Join-Path $OutRoot ($Rel -replace '/', '\')) $FrameTime
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

# ============================================================================================
#  PALETTE
# ============================================================================================
$Pal = @{
    CollarLit  = Hex 'A7AEB8'; CollarMid = Hex '6C737D'; CollarDark = Hex '3A3F47'
    Core       = Hex '140A1E'                      # the pinpoint: very dark violet, never pure black
    DiskDim    = Hex '3B1F5C'; DiskMid = Hex '7A3FB0'  # the accretion disk at rest
    Hot        = Hex 'FF9A3C'; White = Hex 'FFF2C8'    # the hot spot as it passes
    RingDim    = Hex '5E4A86'; RingLit = Hex 'E9DDFF'  # the thin photon ring around the core
}

# ============================================================================================
#  MACHINE FACE
# ============================================================================================
# Radii around the face centre (7.5, 7.5): collar 5.6..6.7, disk 3.1..5.6, photon ring 2.3..3.1, core below 2.3.
$R_COLLAR = 6.7; $R_DISK = 5.6; $R_RING = 3.1; $R_CORE = 2.3
$FRAMES = 8

function Get-Zone {
    param([int]$X, [int]$Y)
    $dx = $X - 7.5; $dy = $Y - 7.5
    $d = [Math]::Sqrt($dx * $dx + $dy * $dy)
    if ($d -gt $R_COLLAR) { return @('none', $d, 0.0) }
    $a = [Math]::Atan2($dy, $dx)
    if ($d -gt $R_DISK) { return @('collar', $d, $a) }
    if ($d -gt $R_RING) { return @('disk', $d, $a) }
    if ($d -gt $R_CORE) { return @('ring', $d, $a) }
    return @('core', $d, $a)
}

# $Frame -1 = idle. $GlowOnly = the emissive layer (only the disk and the photon ring).
function New-Face {
    param([int]$Frame, [bool]$GlowOnly)
    $c = New-Canvas
    $spot = if ($Frame -ge 0) { 2 * [Math]::PI * $Frame / $FRAMES } else { 0.0 }
    for ($y = 0; $y -lt 16; $y++) {
        for ($x = 0; $x -lt 16; $x++) {
            $z = Get-Zone $x $y
            $zone = $z[0]; $d = $z[1]; $a = $z[2]
            if ($zone -eq 'none') { continue }
            if ($GlowOnly -and ($zone -eq 'collar' -or $zone -eq 'core')) { continue }
            switch ($zone) {
                'collar' {
                    # light from the top left: the collar's upper-left arc is lit, its lower-right arc in shade
                    $lit = -(($x - 7.5) + ($y - 7.5)) / ($R_COLLAR * 1.41)
                    $col = if ($lit -gt 0.35) { $Pal.CollarLit } elseif ($lit -gt -0.35) { $Pal.CollarMid } else { $Pal.CollarDark }
                }
                'core' { $col = $Pal.Core }
                'ring' {
                    if ($Frame -lt 0) { $col = $Pal.RingDim }
                    else { $col = if (($Frame % 2) -eq 0) { $Pal.RingLit } else { Mix $Pal.RingDim $Pal.RingLit 0.6 } }
                }
                'disk' {
                    # brighter towards the inner edge; the hot spot lights the arc it is passing over
                    $inner = 1.0 - ($d - $R_RING) / ($R_DISK - $R_RING)
                    $col = Mix $Pal.DiskDim $Pal.DiskMid (0.25 + 0.6 * $inner)
                    if ($Frame -ge 0) {
                        $da = [Math]::Abs($a - $spot)
                        while ($da -gt [Math]::PI) { $da = [Math]::Abs($da - 2 * [Math]::PI) }
                        $heat = [Math]::Max(0.0, 1.0 - $da / 1.25)
                        if ($heat -gt 0.75) { $col = Mix $Pal.Hot $Pal.White (($heat - 0.75) * 4) }
                        elseif ($heat -gt 0) { $col = Mix $col $Pal.Hot ($heat / 0.75) }
                        else { $col = Mix $col $Pal.DiskMid 0.35 }
                    }
                }
            }
            Set-Px $c $x $y $col
        }
    }
    return $c
}

$dir = 'block/machines/horizon_collector'
Out-Tex (New-Face -1 $false) "$dir/overlay_front.png"
$active = @(); $glow = @()
for ($f = 0; $f -lt $FRAMES; $f++) { $active += , (New-Face $f $false); $glow += , (New-Face $f $true) }
Out-Tex (Join-Frames $active) "$dir/overlay_front_active.png"
Out-Mcmeta "$dir/overlay_front_active.png.mcmeta" 3
Out-Tex (Join-Frames $glow) "$dir/overlay_front_active_emissive.png"
Out-Mcmeta "$dir/overlay_front_active_emissive.png.mcmeta" 3

# ============================================================================================
#  ITEM: the Horizon Shard
# ============================================================================================
# A splinter lying from the bottom left to the top right: iridescent edges ('e' magenta, 'c' cyan), a pale highlight down its lit
# face ('B'), violet body ('v', 'd') and a near-black heart ('k') with one warm fleck ('o') of the disk's light.
$ShardPal = New-Pal @'
e=C77DFF c=7FE3F0 B=F0E2FF v=8A4FD0 d=4A2A7A k=24123A o=FFB060
'@
$ShardRows = @(
    '................',
    '...........ce...',
    '..........cBBe..',
    '.........cBvBe..',
    '........cBvvde..',
    '.......cBvvde...',
    '......cBvdkde...',
    '.....cBvdkoe....',
    '....cBvdkkde....',
    '....cvdkkde.....',
    '...cvdkkde......',
    '...cdkkde.......',
    '..cdkde.........',
    '..ckke..........',
    '...ee...........',
    '................'
)
Assert-Map 'ShardRows' $ShardRows 16 16
$shard = New-Canvas
Write-Map $shard 0 0 $ShardRows $ShardPal
Add-Outline $shard
Out-Tex $shard 'item/horizon_shard.png'

# ============================================================================================
#  VERIFY what was written (size, binary alpha, no pure black, every strip frame drawn and different from the others)
# ============================================================================================
$problems = 0
foreach ($rel in $written) {
    if ($rel -like '*.mcmeta') { continue }
    $path = Join-Path $OutRoot ($rel -replace '/', '\')
    $img = Read-Png $path
    $msgs = @()
    $n = [int]($img.H / 16)
    $expectFrames = if ($rel -like '*_active*') { $FRAMES } else { 1 }
    if ($img.W -ne 16 -or $n -ne $expectFrames -or ($img.H % 16) -ne 0) { $msgs += "bad size $($img.W)x$($img.H) (expected 16x$(16 * $expectFrames))" }
    $minOpaque = if ($rel -like '*_emissive*') { 40 } else { 60 }
    $black = 0
    $sigs = @()
    for ($f = 0; $f -lt $n; $f++) {
        $opaque = 0
        $sig = New-Object System.Text.StringBuilder
        for ($i = 0; $i -lt 256; $i++) {
            $px = $img.P[$f * 256 + $i]
            $alpha = ($px -shr 24) -band 255
            if ($alpha -ne 0 -and $alpha -ne 255) { $msgs += "partial alpha in frame $f"; break }
            if ($alpha -eq 255) {
                $opaque++
                $q = Get-Rgba $px
                if ($q[0] -eq 0 -and $q[1] -eq 0 -and $q[2] -eq 0) { $black++ }
            }
            [void]$sig.Append($px).Append(',')
        }
        if ($opaque -lt $minOpaque) { $msgs += "frame $f has only $opaque opaque pixels" }
        $sigs += $sig.ToString()
    }
    if ($black -gt 0) { $msgs += "$black pure-black px" }
    if ($n -gt 1) {
        if (@($sigs | Select-Object -Unique).Count -ne $n) { $msgs += 'two frames are identical' }
        if (-not (Test-Path -LiteralPath ($path + '.mcmeta'))) { $msgs += 'no .mcmeta for the strip' }
    }
    if ($msgs.Count -gt 0) { $problems++; Write-Warning "$rel : $($msgs -join '; ')" }
}

Write-Host "written $($written.Count) files under $OutRoot ($problems with warnings)"
foreach ($rel in $written) { Write-Host "  $rel" }

if ($Credits) {
    Write-Host ''
    foreach ($rel in $written) {
        Write-Host ("| ``pack/kubejs/assets/grindless/textures/$rel`` | Generated with tools/assets/$ScriptName (procedural pixel art, original) by the STEAM-X1 agent, 2026-10-27 | the pack's licence (pending; proposed CC BY-SA 4.0) |")
    }
}
if ($problems -gt 0) { exit 1 }
