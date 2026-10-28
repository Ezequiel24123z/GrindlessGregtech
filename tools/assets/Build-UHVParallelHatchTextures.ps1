<#
.SYNOPSIS
  Procedural 16x16 front overlay of the UHV parallel hatch of Gregtech Grindless (package MEGA-0b).

.DESCRIPTION
  GTM ships the parallel hatch overlays only up to the UV one (parallel_hatch_mk1..mk4), so the UHV hatch (gtceu:uhv_parallel_hatch, a tier above)
  needs its own. Every pixel is drawn here from a character map in GTM's UHV colour (GTValues.VNF: dark red); nothing is copied or edited
  from GregTech Modern or any other mod. Output is deterministic: re-running overwrites the same bytes.

  Writes (under pack/kubejs/assets/grindless/textures/block/machines/uhv_parallel_hatch/), the file names GTM's overlayTieredHullModel
  looks for in the folder:
    overlay_front.png                 a dark panel with four parallel bars of the UHV colour (one more than the UV hatch's idea of "stack")
    overlay_front_emissive.png        only the bars (the part that glows)
    overlay_front_active.png (+ .mcmeta)           two frames: the bars brighten from the top down
    overlay_front_active_emissive.png (+ .mcmeta)  the same glow, two frames

  Run from the repo root (PowerShell 5.1 blocks unsigned scripts by default; this bypass only affects that process):
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-UHVParallelHatchTextures.ps1
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-UHVParallelHatchTextures.ps1 -Credits

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
$Dir = 'block/machines/uhv_parallel_hatch'

$base = Hex 'B0181E'
$Pal = New-Object 'System.Collections.Generic.Dictionary[string,int]' ([System.StringComparer]::Ordinal)
$Pal['R'] = $base                               # the bars, UHV red
$Pal['r'] = Shade $base 0.62                    # a bar's lower edge
$Pal['H'] = Mix $base (Hex 'FFFFFF') 0.55       # a lit bar
$Pal['F'] = Hex '8C939F'                        # the frame
$Pal['f'] = Hex '5E6570'                        # the frame's shaded edge
$Pal['P'] = Hex '2A2E36'                        # the panel
$Pal['p'] = Hex '1B1E24'                        # the panel's inner shadow

# a 10 x 10 window: frame, panel, four bars (rows 2, 4, 6, 8 of the window with a shaded line under each)
$Window = @(
    'FFFFFFFFFF',
    'FpppppppfF',
    'FPRRRRRRPf',
    'FPrrrrrrPf',
    'FPRRRRRRPf',
    'FPrrrrrrPf',
    'FPRRRRRRPf',
    'FPrrrrrrPf',
    'FPRRRRRRPf',
    'ffffffffff'
)
# the same window with the glowing pixels alone: R and H only
$BarRows = 2, 4, 6, 8

function New-Face {
    param([int[]]$Lit = @(), [switch]$GlowOnly)
    $c = New-Canvas 16 16
    for ($j = 0; $j -lt $Window.Count; $j++) {
        $row = $Window[$j]
        $isBar = $BarRows -contains $j
        if ($GlowOnly -and -not $isBar) { continue }
        $out = ''
        foreach ($ch in $row.ToCharArray()) {
            if ($GlowOnly) { $out += $(if ($ch -eq 'R') { if ($Lit -contains $j) { 'H' } else { 'R' } } else { '.' }) }
            else { $out += $(if ($ch -eq 'R' -and $Lit -contains $j) { 'H' } else { [string]$ch }) }
        }
        Write-Map $c 3 (3 + $j) @($out) $Pal
    }
    return $c
}

$written = New-Object System.Collections.Generic.List[string]
function Out-Tex {
    param($Canvas, [string]$Name, [int]$FrameTime = 0)
    $path = Join-Path $OutRoot (($Dir + '/' + $Name) -replace '/', '\')
    for ($try = 1; $try -le 6; $try++) {
        try { Save-Png $Canvas $path; if ($FrameTime -gt 0) { Save-Mcmeta ($path + '.mcmeta') $FrameTime }; break }
        catch [System.IO.IOException] { if ($try -eq 6) { throw }; Start-Sleep -Milliseconds (250 * $try) }
    }
    $written.Add($Dir + '/' + $Name)
    if ($FrameTime -gt 0) { $written.Add($Dir + '/' + $Name + '.mcmeta') }
}

Out-Tex (New-Face) 'overlay_front.png'
Out-Tex (New-Face -GlowOnly) 'overlay_front_emissive.png'
$act = Join-Frames @((New-Face -Lit @(2, 4)), (New-Face -Lit @(6, 8)))
$actGlow = Join-Frames @((New-Face -Lit @(2, 4) -GlowOnly), (New-Face -Lit @(6, 8) -GlowOnly))
Out-Tex $act 'overlay_front_active.png' 10
Out-Tex $actGlow 'overlay_front_active_emissive.png' 10

# verify: 16x16 (strips 16 x 32), binary alpha, no pure black, the UHV red present, not fully transparent
$problems = 0
foreach ($rel in $written) {
    if ($rel -like '*.mcmeta') { continue }
    $img = Read-Png (Join-Path $OutRoot ($rel -replace '/', '\'))
    $msgs = @()
    if ($img.W -ne 16 -or ($img.H -ne 16 -and $img.H -ne 32)) { $msgs += "bad size $($img.W)x$($img.H)" }
    $opaque = 0; $black = 0; $red = 0
    foreach ($px in $img.P) {
        $alpha = ($px -shr 24) -band 255
        if ($alpha -ne 0 -and $alpha -ne 255) { $msgs += 'partial alpha'; break }
        if ($alpha -eq 255) {
            $opaque++
            $q = Get-Rgba $px
            if ($q[0] -eq 0 -and $q[1] -eq 0 -and $q[2] -eq 0) { $black++ }
            if (($px -bor 0xFF000000) -eq $base) { $red++ }
        }
    }
    if ($opaque -eq 0) { $msgs += 'fully transparent' }
    if ($black -gt 0) { $msgs += "$black pure-black px" }
    if ($red -eq 0 -and $rel -notlike '*_active*') { $msgs += 'no pixel of the UHV colour' }
    if ($msgs.Count -gt 0) { $problems++; Write-Warning "$rel : $($msgs -join '; ')" }
}

Write-Host "written $($written.Count) files under $OutRoot ($problems with warnings)"
foreach ($rel in $written) { Write-Host "  $rel" }

if ($Credits) {
    Write-Host ''
    foreach ($rel in $written) {
        Write-Host ("| ``pack/kubejs/assets/grindless/textures/$rel`` | Generated with tools/assets/$ScriptName (procedural pixel art, original) by the mega library agent (MEGA-0b) | the pack's licence (pending; proposed CC BY-SA 4.0) |")
    }
}
if ($problems -gt 0) { exit 1 }
