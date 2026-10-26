<#
.SYNOPSIS
  Procedural 16x16 pixel art for the foundations of the ZPM era of Gregtech Grindless (package ZPM-F1, shared registrations):
  31 items and six block textures (GregTech style: top-left light, 3-5 tones per material, selective outlines).

.DESCRIPTION
  Every pixel is drawn by this script (palettes, char maps and small shading routines); nothing is copied or edited from GregTech
  Modern, GCYR or any other mod. Output is deterministic: re-running overwrites the same bytes (mottles come from Get-Noise, a hash
  of the position, not from a random generator). The helpers are copied from Build-LuVFoundationTextures.ps1 so the other scripts stay
  untouched. The six fluids need no PNG: the KubeJS fluid registry draws them from a colour.

  Writes (under pack/kubejs/assets/grindless/textures/):
    item/radium_capsule.png              a vertical lead-grey capsule with titanium ends, two hazard bands and a green glow window.
    item/curium_oxide.png                a heap of dark umber powder with warm orange glints (its own decay heat).
    item/carbon_nanotube_yarn.png        a ball of black thread with a silver sheen and a loose end.
    item/cvd_diamond_plate.png           a chamfered pale cyan diamond wafer with three facet tones and white glints.
    item/qubit_array.png                 a dark chip with a 4x4 grid of cyan qubits (two violet, entangled) and gold pins.
    item/archaeal_culture.png            a petri dish: glass rim, pink-purple agar, pale colonies.
    item/silica_aerogel.png              a pale blue-white translucent cube with soft specks.
    item/solar_core_survey.png           the data orb: a hot yellow core fading to orange, with cyan neutrino specks.
    item/multimessenger_catalogue.png    the data orb crossed by white (light), cyan (neutrino) and violet (gravitational wave) streaks.
    item/neptune_probe_recording.png     a cassette tape with a deep blue label and a dark spot.
    item/triton_probe_recording.png      a cassette tape with a pink label and a streak.
    item/neptune_flyby_data.png          the data orb in Neptune's deep blue with lighter bands and a dark spot.
    item/triton_flyby_data.png           the data orb in Triton's pink-white with a bright cap and dark streaks.
    item/pluto_kuiper_chart.png          the chart card with Pluto's pale heart on a brown disc and a dotted ring of the belt.
    item/kuiper_target_list.png          the chart card with rows of dots and lines and a red target mark.
    item/scoop_head.png                  a steel funnel under a white ceramic lip, on a shank: the intake of a siphon.
    item/ring_sail_net.png               a gold hoop holding a grey diagonal net.
    item/ring_ice_sample.png             a glass vial under a blue cap, holding pale blue ice chunks.
    item/titan_entry_probe.png           a silver backshell with a parachute canister above a wide orange-brown heat shield.
    item/lake_sampler.png                a steel canister with a cyan window and an orange float ring.
    item/aerogel_cartridge.png           a dark frame with six aerogel tiles and a yellow label strip.
    item/silica_nanograins.png           a small heap of white-blue grains with cyan glints.
    item/saturn_interior_model.png       the data orb in concentric layers: brown core, ice, grey metallic hydrogen, gold envelope.
    item/uranus_transfer_chart.png       the chart card with Uranus (a cyan disc crossed by a vertical ring) and gold waypoints.
    item/ice_giant_atmosphere_sample.png a round flask under a cork, swirled with cyan-green gas.
    item/ice_giant_diamond_seed.png      a small cut diamond crystal with a table and four facet tones.
    item/neptune_flyby_probe.png         a white dish, a gold-foil bus and a thin science boom.
    item/neptune_sample.png              a conical flask under a dark blue cap, holding frozen blue.
    item/tholin.png                      a heap of sticky red-brown dust with tan glints.
    item/silicon_28_dust.png             a heap of silver-blue grey powder with white glints.
    item/pica_heat_shield.png            a charred brown tile with pitted ablation and an orange crack.
    block/zpm/naquadria_containment_casing.png  dark graphite plates, rivets and a glowing yellow-green ring; seamless.
    block/zpm/pressure_hull_casing.png     blue-grey steel with two heavy ribs, bolts and a seam; seamless.
    block/zpm/photomultiplier_casing.png   a dark glass wall of four light-sensor domes with highlights.
    block/zpm/cryostat_casing.png          frosted white-blue insulation with two gold-plated copper foil bands.
    block/zpm/probe_bay_casing.png         grey truss plating around a dark launch rail with yellow guide marks.
    block/zpm/synroc_block.png             dark grey titanate ceramic with pale mineral flecks.

  Run from the repo root (PowerShell 5.1 blocks unsigned scripts by default; this bypass only affects that process):
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-ZPMFoundationTextures.ps1
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-ZPMFoundationTextures.ps1 -Only items,synroc_block
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-ZPMFoundationTextures.ps1 -Preview C:\path\zpm-f1.png -Credits

  Every pixel is fully opaque or fully transparent and none is pure black; the block textures have all 256 pixels opaque and the item
  icons have a transparent background. The final check fails the run (non-zero exit) if a written file breaks one of these rules, if two
  items are identical, if an item is nearly empty, or if the set of outputs differs from the items and blocks that
  startup_scripts/grindless/zpm/foundation.js registers.

.PARAMETER Only
  Subset of output names (e.g. tholin, synroc_block) or groups: items, blocks (comma-separated, also as one string with -File).
.PARAMETER OutRoot
  Textures root. Default: <repo>/pack/kubejs/assets/grindless/textures
.PARAMETER Preview
  Also write a review sheet (x6, nearest neighbour) to this PNG, which must be outside the repository (it is never shipped):
  every item on slot grey, then every block tiled 3x3.
.PARAMETER Credits
  Also print the CREDITS.md "Assets" table rows for the files written.
#>
[CmdletBinding()]
param(
    [string]$OutRoot = '',
    [string[]]$Only = @(),
    [string]$Preview = '',
    [switch]$Credits
)
$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'Pixel.Lib.ps1')

$RepoRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..'))
$DefaultOutRoot = [System.IO.Path]::GetFullPath((Join-Path $RepoRoot 'pack\kubejs\assets\grindless\textures'))
if (-not $OutRoot) { $OutRoot = $DefaultOutRoot }
$OutRoot = [System.IO.Path]::GetFullPath($OutRoot)
$ScriptName = Split-Path -Leaf $PSCommandPath

if ($Preview) {
    $Preview = $ExecutionContext.SessionState.Path.GetUnresolvedProviderPathFromPSPath($Preview)
    if ($Preview.StartsWith($RepoRoot.TrimEnd('\') + '\', [System.StringComparison]::OrdinalIgnoreCase)) {
        throw "-Preview must point outside the repository (the review sheet is never shipped): $Preview"
    }
}

# `powershell -File ... -Only a,b` delivers "a,b" as one string: split it so both calling styles work.
$Only = @($Only | ForEach-Object { $_ -split '[,;\s]+' } | Where-Object { $_ })

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

function New-Ramp { param([string[]]$Hexes) return @($Hexes | ForEach-Object { Hex $_ }) }
function Get-ClampInt { param([int]$V, [int]$Lo, [int]$Hi) return [Math]::Max($Lo, [Math]::Min($Hi, $V)) }

# Deterministic 0..255 hash of (x, y, frame, salt): grain without a random generator.
function Get-Noise {
    param([long]$X, [long]$Y, [long]$T = 0, [long]$Salt = 0)
    $h = (($X * 73856093L) -bxor ($Y * 19349663L) -bxor ($T * 83492791L) -bxor ($Salt * 2654435761L)) % 1000003L
    if ($h -lt 0) { $h = -$h }
    return [int](($h * 7919L) % 256L)
}

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

# Fills rows of a horizontal-span body: @(y, x0, x1, toneOffset) per row, shaded with Get-SpanTone on a 5-tone ramp.
function Add-SpanRows {
    param($C, $Rows, $Ramp)
    foreach ($r in $Rows) {
        for ($x = $r[1]; $x -le $r[2]; $x++) { Set-Px $C $x $r[0] $Ramp[(Get-ClampInt ((Get-SpanTone $x $r[1] $r[2]) + $r[3]) 0 4)] }
    }
}

# Glass shared by the vials and flasks: g lit edge, w highlight, v empty glass, i shaded edge.
$GlassSpec = 'g=E2EEF2 w=F8FCFF v=BCCCD6 i=8C9CA8'

# ============================================================================================
#  HEAPS (powders): a mound of rows 6..13 lit from the top left, grained by Get-Noise, outlined, with fixed glints
# ============================================================================================
$HeapHalfFull = @(1.2, 2.4, 3.4, 4.3, 5.1, 5.8, 6.3, 6.6)
$HeapHalfSmall = @(0.9, 1.8, 2.6, 3.2, 3.8, 4.2, 4.5, 4.6)

function New-Heap {
    param($Ramp, $Glints, $Half, [int]$Salt)
    $c = New-Canvas
    $top = 14 - $Half.Count
    for ($i = 0; $i -lt $Half.Count; $i++) {
        $y = $top + $i
        $x0 = [int][Math]::Round(7.5 - $Half[$i] + 0.5)
        $x1 = [int][Math]::Round(7.5 + $Half[$i] - 0.5)
        for ($x = $x0; $x -le $x1; $x++) {
            $n = Get-Noise $x $y 0 $Salt
            $idx = (Get-SpanTone $x $x0 $x1) + $(if ($n -gt 205) { -1 } elseif ($n -lt 45) { 1 } else { 0 })
            Set-Px $c $x $y $Ramp[(Get-ClampInt $idx 0 4)]
        }
    }
    Add-Outline $c
    foreach ($g in $Glints) { Set-Px $c $g[0] $g[1] (Hex $g[2]) }
    return $c
}

function New-CuriumOxide { New-Heap (New-Ramp @('7A6A5E', '5A4C42', '443830', '30261F', '221A14')) @(@(6, 9, 'FF9A3C'), @(9, 11, 'FFB45A'), @(11, 12, 'FF8A28'), @(4, 12, 'FFA040')) $HeapHalfFull 701 }
function New-Tholin { New-Heap (New-Ramp @('B86A4A', '9A4E34', '7A3A26', '5A2A1C', '3E1C12')) @(@(6, 9, 'E8A070'), @(9, 11, 'D88A5A'), @(11, 12, 'E8A070'), @(4, 12, 'D88A5A')) $HeapHalfFull 711 }
function New-Silicon28Dust { New-Heap (New-Ramp @('C8D0E0', 'A8B2C8', '8894AC', '687490', '4C5670')) @(@(6, 9, 'FFFFFF'), @(9, 11, 'F0F4FF'), @(11, 12, 'FFFFFF'), @(4, 12, 'E0E8F8')) $HeapHalfFull 721 }
function New-SilicaNanograins { New-Heap (New-Ramp @('F4FAFF', 'DCEAF6', 'C0D4E8', 'A4BCD6', '8AA4C4')) @(@(7, 9, 'A0F0FF'), @(9, 11, 'FFFFFF'), @(10, 12, 'A0F0FF')) $HeapHalfSmall 731 }

# ============================================================================================
#  DATA ORBS: a glass sphere (shaded by Get-Noise-free geometry) in a steel cradle; each item supplies the pattern inside
# ============================================================================================
function New-Orb {
    param([scriptblock]$Pattern)
    $c = New-Canvas
    $cx = 8.0; $cy = 6.5; $r = 5.6
    for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
        $nx = ($x + 0.5 - $cx) / $r; $ny = ($y + 0.5 - $cy) / $r
        $r2 = $nx * $nx + $ny * $ny
        if ($r2 -gt 1.0) { continue }
        $nz = [Math]::Sqrt([Math]::Max(0.0, 1.0 - $r2))
        $t = 0.34 + 0.40 * (-0.55 * $nx - 0.62 * $ny + 0.56 * $nz)
        $f = if ($t -ge 0.70) { 1.16 } elseif ($t -ge 0.56) { 1.0 } elseif ($t -ge 0.42) { 0.84 } elseif ($t -ge 0.28) { 0.68 } else { 0.54 }
        if ($r2 -gt 0.80) { $f = $f * 0.85 }
        $base = & $Pattern $nx $ny $r2 $x $y
        Set-Px $c $x $y (Shade $base $f)
    } }
    Set-Rect $c 4 13 8 1 (Hex 'A0A8B4')
    Set-Rect $c 3 14 10 1 (Hex '6A727E')
    Add-Outline $c
    Set-Px $c 4 3 (Hex 'FFFFFF'); Set-Px $c 5 3 (Hex 'E8F2FF'); Set-Px $c 4 4 (Hex 'E8F2FF')
    return $c
}

function New-SolarCoreSurvey {
    New-Orb {
        param($nx, $ny, $r2, $x, $y)
        $col = Mix (Hex 'FFF3B0') (Hex 'D8540E') ([Math]::Sqrt($r2))
        if ((Get-Noise $x $y 0 11) -gt 236) { $col = Hex '7FE8FF' }
        return $col
    }
}
function New-MultimessengerCatalogue {
    New-Orb {
        param($nx, $ny, $r2, $x, $y)
        $d = ($x + $y) % 7
        if ($d -eq 1) { return (Hex 'EDEDF8') }
        if ($d -eq 3) { return (Hex '36C6E6') }
        if ($d -eq 5) { return (Hex 'A860E0') }
        return (Hex '27334F')
    }
}
function New-NeptuneFlybyData {
    New-Orb {
        param($nx, $ny, $r2, $x, $y)
        if ($y -ge 7 -and $y -le 8 -and $x -ge 8 -and $x -le 10) { return (Hex '16296E') }
        if ($y -eq 4 -or $y -eq 9) { return (Hex '6C94EC') }
        return (Hex '2A4FB8')
    }
}
function New-TritonFlybyData {
    New-Orb {
        param($nx, $ny, $r2, $x, $y)
        if ($y -le 3) { return (Hex 'F8F0F4') }
        if ((Get-Noise $x $y 0 17) -gt 170 -and (($x + $y) % 3) -eq 0) { return (Hex 'B07A88') }
        return (Hex 'E8C8D0')
    }
}
function New-SaturnInteriorModel {
    New-Orb {
        param($nx, $ny, $r2, $x, $y)
        $d = [Math]::Sqrt($r2)
        if ($d -lt 0.28) { return (Hex '7A4A30') }
        if ($d -lt 0.50) { return (Hex 'DCEAF4') }
        if ($d -lt 0.75) { return (Hex 'A0A8B8') }
        return (Hex 'E8C070')
    }
}

# ============================================================================================
#  CHART CARDS: the chart family's data stick (navy card, pale border, gold connector); each item supplies the drawing
# ============================================================================================
function New-ChartBase {
    $c = New-Canvas
    Set-Rect $c 2 2 12 10 (Hex 'C0C8D4')
    Set-Rect $c 3 3 10 8 (Hex '1B2A44')
    Set-Rect $c 13 3 1 9 (Hex '8C96A8'); Set-Rect $c 2 11 12 1 (Hex '8C96A8')
    Set-Rect $c 6 12 4 3 (Hex 'D8B04A'); Set-Rect $c 9 12 1 3 (Hex 'A07E28'); Set-Rect $c 6 14 4 1 (Hex 'A07E28')
    return $c
}
function New-PlutoKuiperChart {
    $c = New-ChartBase
    for ($y = 3; $y -le 10; $y++) { for ($x = 3; $x -le 12; $x++) {
        $dx = $x + 0.5 - 7.5; $dy = $y + 0.5 - 6.5
        if (($dx * $dx + $dy * $dy) -le 6.0) { Set-Px $c $x $y (Hex $(if ($dx -lt 0 -and $dy -lt 0) { '9A7B6A' } else { '70584C' })) }
    } }
    foreach ($p in @(@(6, 5), @(7, 5), @(8, 5), @(9, 5), @(6, 6), @(7, 6), @(8, 6), @(9, 6), @(7, 7), @(8, 7), @(7, 8))) { }
    foreach ($p in @(@(6, 5), @(8, 5), @(6, 6), @(7, 6), @(8, 6), @(9, 6), @(7, 7), @(8, 7))) { Set-Px $c $p[0] $p[1] (Hex 'F2D8C8') }
    foreach ($p in @(@(3, 6), @(4, 9), @(6, 10), @(10, 10), @(12, 8), @(12, 5), @(10, 3), @(5, 3))) { Set-Px $c $p[0] $p[1] (Hex '8FA0B8') }
    return $c
}
function New-KuiperTargetList {
    $c = New-ChartBase
    $rows = @(@(4, 4, 'E8A860', 7), @(6, 4, '8FA0B8', 5), @(8, 4, '8FA0B8', 6), @(10, 4, '8FA0B8', 4))
    foreach ($r in $rows) {
        Set-Px $c $r[1] $r[0] (Hex $r[2])
        for ($i = 0; $i -lt $r[3]; $i++) { Set-Px $c (6 + $i) $r[0] (Hex 'A8B8D0') }
    }
    foreach ($p in @(@(3, 3), @(5, 3), @(3, 5), @(5, 5))) { Set-Px $c $p[0] $p[1] (Hex 'E84A3C') }
    return $c
}
function New-UranusTransferChart {
    $c = New-ChartBase
    for ($y = 3; $y -le 10; $y++) { for ($x = 3; $x -le 12; $x++) {
        $dx = $x + 0.5 - 7.5; $dy = $y + 0.5 - 6.5
        $ring = ($dx * $dx) / 2.6 + ($dy * $dy) / 14.0
        if ($ring -ge 0.75 -and $ring -le 1.15) { Set-Px $c $x $y (Hex '8CC8D8') }
    } }
    for ($y = 3; $y -le 10; $y++) { for ($x = 3; $x -le 12; $x++) {
        $dx = $x + 0.5 - 7.5; $dy = $y + 0.5 - 6.5
        if (($dx * $dx + $dy * $dy) -le 4.6) { Set-Px $c $x $y (Hex $(if ($dx -lt 0 -and $dy -lt 0) { 'D4F6F8' } else { '9CE0E8' })) }
    } }
    foreach ($p in @(@(3, 10), @(5, 10), @(10, 10), @(12, 10))) { Set-Px $c $p[0] $p[1] (Hex 'E8C060') }
    return $c
}

# ============================================================================================
#  CASSETTES: the probes' recordings
# ============================================================================================
function New-Cassette {
    param([string]$Label, [string]$Mark)
    $c = New-Canvas
    Set-Rect $c 1 3 14 10 (Hex 'B8BCC4')
    Set-Rect $c 1 12 14 1 (Hex '5A606C'); Set-Rect $c 14 3 1 10 (Hex '8C92A0')
    Set-Rect $c 3 4 10 4 (Hex $Label)
    Set-Rect $c 3 4 10 1 (Shade (Hex $Label) 1.2)
    foreach ($p in @(@(5, 6), @(6, 6), @(9, 5), @(10, 5), @(10, 6), @(11, 6))) { Set-Px $c $p[0] $p[1] (Hex $Mark) }
    Set-Rect $c 3 9 10 3 (Hex '3A3F4A')
    foreach ($cx in @(5, 10)) {
        Set-Rect $c ($cx - 1) 9 3 3 (Hex '2A2E36')
        Set-Px $c $cx 10 (Hex 'E8ECF2')
        Set-Px $c ($cx - 1) 10 (Hex 'C0C4CC'); Set-Px $c ($cx + 1) 10 (Hex 'C0C4CC')
    }
    Add-Outline $c
    return $c
}
function New-NeptuneProbeRecording { New-Cassette '3A62D0' '16296E' }
function New-TritonProbeRecording { New-Cassette 'E8B8C8' 'B07A88' }

# ============================================================================================
#  VESSELS
# ============================================================================================
function New-RingIceSample {
    $c = New-Canvas
    $P = New-Pal ($GlassSpec + ' C=7AB4F0 c=3E7CC4 k=2A5A98 I=F2FAFF j=CFE6F6 J=A6CBE6')
    Write-Map $c 4 2 @('..Ccck..', '..Ccck..', '..gwvi..', '.gwvvvi.', '.gIIjJi.', '.gIjjJi.', '.gjIJJi.', '.gjjJJi.', '.gjJJJi.', '.giiiii.', '..iiii..') $P
    Add-Outline $c
    return $c
}
function New-IceGiantAtmosphereSample {
    $c = New-Canvas
    $P = New-Pal ($GlassSpec + ' k=A8794A K=C99A64 a=8FE8E0 b=5CC0C8 d=D8F8F2 e=3E98A8')
    Write-Map $c 2 1 @('...kKk....', '...kKk....', '...gvi....', '...gvi....', '..gvvvi...', '.gvaabbvi.', '.gadbbeei.', '.gabbeebi.', '.gbbeebbi.', '.gvbeeavi.', '..gvvvvi..', '...iiii...') $P
    Add-Outline $c
    return $c
}
function New-NeptuneSample {
    $c = New-Canvas
    $P = New-Pal ($GlassSpec + ' k=2A4A98 K=3E62C0 b=5C86E6 B=9CC0FF d=3A5EB8')
    Write-Map $c 3 2 @('..kKKk..', '..gwvi..', '..gvvi..', '..gvvi..', '.gvbbbvi.', '.gbBBbbi.', 'gvbBBbbbi', 'gbbbbBbdi', 'giiiiiiii') $P
    Add-Outline $c
    return $c
}
function New-ArchaealCulture {
    $c = New-Canvas
    for ($y = 5; $y -le 13; $y++) { for ($x = 0; $x -le 15; $x++) {
        $dx = ($x + 0.5 - 8.0) / 7.4; $dy = ($y + 0.5 - 9.0) / 3.9
        $v = $dx * $dx + $dy * $dy
        if ($v -gt 1.0) { continue }
        if ($v -gt 0.68) { Set-Px $c $x $y (Hex $(if ($dy -lt 0) { 'E2EEF2' } else { '8C9CA8' })); continue }
        $n = Get-Noise $x $y 0 41
        $col = if ($dx -lt 0 -and $dy -lt 0) { 'E8B8E0' } elseif ($n -gt 200) { 'C080C8' } else { 'D8A0D8' }
        Set-Px $c $x $y (Hex $col)
    } }
    foreach ($p in @(@(5, 8), @(8, 7), @(10, 10), @(7, 11), @(11, 8), @(4, 10))) { Set-Px $c $p[0] $p[1] (Hex 'F4F0A0') }
    foreach ($p in @(@(6, 9), @(9, 9), @(8, 10))) { Set-Px $c $p[0] $p[1] (Hex '8A3A9A') }
    Add-Outline $c
    return $c
}
function New-LakeSampler {
    $c = New-Canvas
    $P = New-Pal 'S=C4CCD6 W=EEF2F8 D=8A94A4 d=5E6878 L=9AE0F0 l=5CB0D0 k=7A8494'
    Write-Map $c 5 1 @('..kk..', '..kk..', '.SWWD.', '.SWWd.', '.SLLd.', '.SLlD.', '.SLld.', '.SWWd.', '.SWWD.', '.SDDd.', '.SDdd.', '..dd..') $P
    for ($y = 8; $y -le 13; $y++) { for ($x = 0; $x -le 15; $x++) {
        $dx = ($x + 0.5 - 8.0) / 7.4; $dy = ($y + 0.5 - 10.5) / 2.6
        $v = $dx * $dx + $dy * $dy
        if ($v -gt 1.0) { continue }
        if ($v -lt 0.30) { continue }
        Set-Px $c $x $y (Hex $(if ($dy -lt 0) { 'FFB060' } elseif ($v -gt 0.8) { 'C45E18' } else { 'F28A32' }))
    } }
    Add-Outline $c
    return $c
}

# ============================================================================================
#  OTHER ITEMS
# ============================================================================================
function New-RadiumCapsule {
    $c = New-Canvas
    $ti = New-Ramp @('F0F2F8', 'D0D4DE', 'A8ADBA', '828794', '5E6370')
    $pb = New-Ramp @('A8AEBA', '8E94A2', '747A88', '5C6270', '444A58')
    for ($y = 1; $y -le 14; $y++) {
        $x0 = 5; $x1 = 10
        if ($y -eq 1 -or $y -eq 14) { $x0 = 6; $x1 = 9 }
        $ramp = if ($y -le 3 -or $y -ge 12) { $ti } else { $pb }
        for ($x = $x0; $x -le $x1; $x++) { Set-Px $c $x $y $ramp[(Get-SpanTone $x 5 10)] }
    }
    foreach ($y in @(5, 10)) { for ($x = 5; $x -le 10; $x++) { Set-Px $c $x $y (Hex $(if ($x -le 7) { 'F0D040' } else { 'C09820' })) } }
    foreach ($p in @(@(7, 6, 'C8FF70'), @(8, 6, '7ACC30'), @(7, 7, '9AE850'), @(8, 7, '5AA820'), @(7, 8, '7ACC30'), @(8, 8, '3E8A18'), @(7, 9, '5AA820'), @(8, 9, '3E8A18'))) { Set-Px $c $p[0] $p[1] (Hex $p[2]) }
    Add-Outline $c
    return $c
}
function New-CarbonNanotubeYarn {
    $c = New-Canvas
    $ramp = New-Ramp @('8C90A8', '4A4A58', '3A3A46', '2A2A34', '20202A')
    for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
        $nx = ($x + 0.5 - 7.5) / 5.6; $ny = ($y + 0.5 - 7.0) / 5.6
        if (($nx * $nx + $ny * $ny) -gt 1.0) { continue }
        $t = -0.55 * $nx - 0.62 * $ny
        $i = if ($t -gt 0.5) { 1 } elseif ($t -gt 0.0) { 2 } elseif ($t -gt -0.45) { 3 } else { 4 }
        if ((($x * 2 + $y) % 5) -eq 0) { $i = Get-ClampInt ($i - 1) 0 4 }
        if ((($x - $y * 2 + 32) % 7) -eq 0) { $i = 0 }
        Set-Px $c $x $y $ramp[$i]
    } }
    foreach ($p in @(@(12, 12), @(13, 13), @(14, 13), @(14, 14))) { Set-Px $c $p[0] $p[1] (Hex '4A4A58') }
    Add-Outline $c
    return $c
}
function New-CvdDiamondPlate {
    $c = New-Canvas
    $tones = @('EFFFFF', 'BFEFF8', '8CD4E4')
    for ($y = 2; $y -le 13; $y++) { for ($x = 2; $x -le 13; $x++) {
        if (($x + $y) -lt 6 -or ($x + $y) -gt 24 -or ($x - $y) -gt 7 -or ($y - $x) -gt 7) { continue }
        $col = $tones[[int][Math]::Floor(($x + $y) / 4) % 3]
        if ($x -eq 2 -or $y -eq 2) { $col = 'EFFFFF' } elseif ($x -eq 13 -or $y -eq 13) { $col = '5AA8C4' }
        Set-Px $c $x $y (Hex $col)
    } }
    foreach ($p in @(@(5, 4), @(10, 9), @(4, 8))) { Set-Px $c $p[0] $p[1] (Hex 'FFFFFF') }
    Add-Outline $c
    return $c
}
function New-QubitArray {
    $c = New-Canvas
    Set-Rect $c 2 2 12 12 (Hex '1C2236')
    Set-Rect $c 2 2 12 1 (Hex '3A4466'); Set-Rect $c 2 2 1 12 (Hex '3A4466')
    Set-Rect $c 2 13 12 1 (Hex '10141E'); Set-Rect $c 13 2 1 12 (Hex '10141E')
    foreach ($i in 0..3) {
        foreach ($j in 0..3) { Set-Px $c (4 + 2 * $i) (4 + 2 * $j) (Hex '4DE0F0') }
    }
    Set-Px $c 6 6 (Hex 'B070FF'); Set-Px $c 8 8 (Hex 'B070FF')
    foreach ($k in @(4, 6, 8, 10)) {
        Set-Px $c 1 $k (Hex 'D8B04A'); Set-Px $c 14 $k (Hex 'D8B04A'); Set-Px $c $k 1 (Hex 'D8B04A'); Set-Px $c $k 14 (Hex 'D8B04A')
    }
    Add-Outline $c
    return $c
}
function New-SilicaAerogel {
    $c = New-Canvas
    for ($y = 2; $y -le 13; $y++) { for ($x = 2; $x -le 13; $x++) {
        $face = ''
        if ($y -ge 5 -and $x -le 10) { $face = 'front' }
        elseif ($x -ge 11 -and $y -ge (5 - ($x - 10)) -and $y -le (13 - ($x - 10))) { $face = 'right' }
        elseif ($y -le 4 -and $y -ge 2 -and $x -ge (6 - ($y - 2) * 0 - ($y - 2) - 0) -and $x -le ($y + 8)) { $face = 'top' }
        if ($face -eq '') { continue }
        $col = switch ($face) { 'front' { 'C4DCF0' } 'right' { 'A0BCD8' } default { 'E8F4FF' } }
        if ((Get-Noise $x $y 0 51) -gt 225) { $col = 'FFFFFF' }
        Set-Px $c $x $y (Hex $col)
    } }
    Add-Outline $c
    return $c
}
function New-ScoopHead {
    $c = New-Canvas
    $steel = New-Ramp @('E4EAF2', 'C0C8D4', '98A2B2', '727C8E', '505A6A')
    $rows = @(@(4, 3, 12, 0), @(5, 3, 12, 0), @(6, 4, 11, 0), @(7, 4, 11, 0), @(8, 5, 10, 0), @(9, 5, 10, 0), @(10, 6, 9, 0), @(11, 6, 9, 0), @(12, 6, 9, 0), @(13, 6, 9, 1), @(14, 6, 9, 2))
    Add-SpanRows $c $rows $steel
    for ($y = 1; $y -le 3; $y++) { for ($x = 0; $x -le 15; $x++) {
        $dx = ($x + 0.5 - 8.0) / 6.8; $dy = ($y + 0.5 - 3.0) / 2.4
        $v = $dx * $dx + $dy * $dy
        if ($v -gt 1.0) { continue }
        if ($v -lt 0.45) { Set-Px $c $x $y (Hex '26303E') }
        else { Set-Px $c $x $y (Hex $(if ($dy -lt 0) { 'F6F4EC' } else { 'C8C4B4' })) }
    } }
    foreach ($p in @(@(5, 6), @(6, 7), @(7, 8), @(8, 9))) { Set-Px $c $p[0] $p[1] (Hex '505A6A') }
    Add-Outline $c
    return $c
}
function New-RingSailNet {
    $c = New-Canvas
    for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
        $dx = $x + 0.5 - 8.0; $dy = $y + 0.5 - 8.0
        $d = [Math]::Sqrt($dx * $dx + $dy * $dy)
        if ($d -gt 7.4) { continue }
        if ($d -gt 6.0) { Set-Px $c $x $y (Hex $(if ($dx -lt 0 -and $dy -lt 0) { 'F0D890' } else { 'B89848' })); continue }
        if ((($x + $y) % 3) -eq 0 -or (($x - $y + 48) % 3) -eq 0) { Set-Px $c $x $y (Hex $(if ((($x + $y) % 3) -eq 0) { 'B8BECC' } else { '8C94A6' })) }
    } }
    return $c
}
function New-TitanEntryProbe {
    $c = New-Canvas
    $sil = New-Ramp @('F0F4FA', 'D0D6E0', 'A8B0BE', '828C9C', '5E6878')
    $org = New-Ramp @('F2AE60', 'E8963C', 'C8741E', '9A5412', '6A3808')
    Add-SpanRows $c @(@(1, 6, 9, 0), @(2, 6, 9, 0), @(3, 6, 9, 0), @(4, 6, 9, 0), @(5, 5, 10, 0), @(6, 5, 10, 0), @(7, 4, 11, 0), @(8, 4, 11, 0)) $sil
    Add-SpanRows $c @(@(9, 2, 13, 0), @(10, 3, 12, 0), @(11, 4, 11, 0), @(12, 5, 10, 0)) $org
    foreach ($x in 3..12) { Set-Px $c $x 9 (Hex 'B8B0A0') }
    Set-Px $c 7 2 (Hex 'E84A3C'); Set-Px $c 8 2 (Hex 'E84A3C')
    Add-Outline $c
    return $c
}
function New-NeptuneFlybyProbe {
    $c = New-Canvas
    for ($y = 0; $y -lt 9; $y++) { for ($x = 0; $x -lt 11; $x++) {
        $dx = ($x + 0.5 - 5.5) / 4.6; $dy = ($y + 0.5 - 4.5) / 3.8
        $v = $dx * $dx + $dy * $dy
        if ($v -gt 1.0) { continue }
        Set-Px $c $x $y (Hex $(if ($v -lt 0.06) { '3A4458' } elseif ($v -gt 0.78) { 'A8B0C0' } elseif ($dx -lt 0 -and $dy -lt 0) { 'FFFFFF' } else { 'DCE2EC' }))
    } }
    foreach ($p in @(@(6, 8), @(7, 9))) { Set-Px $c $p[0] $p[1] (Hex '828C9C') }
    Set-Rect $c 7 10 5 4 (Hex 'D8A838'); Set-Rect $c 7 10 5 1 (Hex 'F0CC60'); Set-Rect $c 7 13 5 1 (Hex 'A07E28')
    Set-Rect $c 12 5 1 8 (Hex 'A0A8B8'); Set-Rect $c 12 12 1 1 (Hex 'A0A8B8')
    Set-Rect $c 13 3 2 3 (Hex 'E8E8F0')
    Set-Px $c 9 14 (Hex '5E6878')
    Add-Outline $c
    return $c
}
function New-AerogelCartridge {
    $c = New-Canvas
    Set-Rect $c 3 2 10 12 (Hex '4A5468')
    Set-Rect $c 3 2 10 1 (Hex '6A7690'); Set-Rect $c 3 2 1 12 (Hex '6A7690')
    Set-Rect $c 6 1 4 1 (Hex 'AEB6C4')
    foreach ($row in @(3, 6, 9)) { foreach ($col in @(4, 8)) {
        Set-Rect $c $col $row 4 2 (Hex 'DCEAF6')
        Set-Px $c $col $row (Hex 'FFFFFF')
        Set-Px $c ($col + 3) ($row + 1) (Hex 'A4BCD6')
    } }
    Set-Rect $c 4 12 8 1 (Hex 'E8C040')
    Add-Outline $c
    return $c
}
function New-IceGiantDiamondSeed {
    $c = New-Canvas
    for ($y = 3; $y -le 12; $y++) { for ($x = 2; $x -le 13; $x++) {
        $dx = $x + 0.5 - 8.0; $dy = $y + 0.5 - 8.0
        if (([Math]::Abs($dx) + [Math]::Abs($dy)) -gt 5.2) { continue }
        $col = if ([Math]::Abs($dx) -lt 1.5 -and $dy -lt 0) { 'F4FFFF' } elseif ($dx -lt 0) { $(if ($dy -lt 0) { 'C4F0F8' } else { '8CD4E4' }) } else { $(if ($dy -lt 0) { '8CD4E4' } else { '5AA8C4' }) }
        Set-Px $c $x $y (Hex $col)
    } }
    Set-Px $c 5 5 (Hex 'FFFFFF'); Set-Px $c 9 4 (Hex 'FFFFFF')
    Add-Outline $c
    return $c
}
function New-PicaHeatShield {
    $c = New-Canvas
    Set-Rect $c 2 2 12 12 (Hex '3A2418')
    for ($y = 2; $y -le 13; $y++) { for ($x = 2; $x -le 13; $x++) {
        $n = Get-Noise $x $y 0 61
        if ($n -gt 215) { Set-Px $c $x $y (Hex 'C8661E') } elseif ($n -lt 50) { Set-Px $c $x $y (Hex '261810') } elseif ($n -lt 110) { Set-Px $c $x $y (Hex '4A3020') }
    } }
    Set-Rect $c 2 2 12 1 (Hex '6A4A34'); Set-Rect $c 2 2 1 12 (Hex '6A4A34')
    Set-Rect $c 2 13 12 1 (Hex '1C120C'); Set-Rect $c 13 2 1 12 (Hex '1C120C')
    foreach ($p in @(@(4, 11), @(5, 10), @(6, 9), @(7, 8), @(8, 7), @(9, 6), @(10, 5))) { Set-Px $c $p[0] $p[1] (Hex 'FF8A28') }
    foreach ($p in @(@(5, 11), @(7, 9), @(9, 7))) { Set-Px $c $p[0] $p[1] (Hex 'FFC060') }
    Add-Outline $c
    return $c
}

# ============================================================================================
#  BLOCKS: fully opaque 16x16; a lit top row and left column, a shaded bottom row and right column
# ============================================================================================
function Add-Bevel {
    param($C, [double]$Lit = 1.18, [double]$Dark = 0.78)
    for ($i = 0; $i -lt 16; $i++) {
        Set-Px $C $i 0 (Shade (Get-Px $C $i 0) $Lit); Set-Px $C 0 $i (Shade (Get-Px $C 0 $i) $Lit)
        Set-Px $C $i 15 (Shade (Get-Px $C $i 15) $Dark); Set-Px $C 15 $i (Shade (Get-Px $C 15 $i) $Dark)
    }
}
function New-NaquadriaContainmentCasing {
    $c = New-Canvas
    $tones = New-Ramp @('2A2E33', '33383E', '3C4248')
    for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) { Set-Px $c $x $y $tones[(Get-Noise $x $y 0 81) % 3] } }
    for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
        $d = [Math]::Sqrt([Math]::Pow($x + 0.5 - 8.0, 2) + [Math]::Pow($y + 0.5 - 8.0, 2))
        if ($d -ge 3.2 -and $d -le 4.6) { Set-Px $c $x $y (Hex $(if ($d -lt 3.9) { 'FFFFB0' } else { 'C8FF50' })) }
        elseif ($d -gt 4.6 -and $d -lt 5.4) { Set-Px $c $x $y (Hex '4A5A2A') }
    } }
    foreach ($p in @(@(2, 2), @(13, 2), @(2, 13), @(13, 13))) { Set-Px $c $p[0] $p[1] (Hex 'AEB6C0'); Set-Px $c ($p[0] + 1) ($p[1] + 1) (Hex '1E2226') }
    Add-Bevel $c
    return $c
}
function New-PressureHullCasing {
    $c = New-Canvas
    $tones = New-Ramp @('8896A6', '9AA8B8', 'AAB8C6')
    for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) { Set-Px $c $x $y $tones[(Get-Noise $x $y 0 91) % 3] } }
    foreach ($ry in @(0, 8)) {
        Set-Rect $c 0 $ry 16 2 (Hex '5C6A7A')
        Set-Rect $c 0 $ry 16 1 (Hex '7A8898')
        foreach ($bx in @(1, 5, 9, 13)) { Set-Px $c $bx $ry (Hex 'DDE6EE'); Set-Px $c $bx ($ry + 1) (Hex '3E4A58') }
    }
    for ($y = 2; $y -lt 16; $y++) { if ($y -ne 8 -and $y -ne 9) { Set-Px $c 8 $y (Hex '5C6A7A') } }
    Add-Bevel $c
    return $c
}
function New-PhotomultiplierCasing {
    $c = New-Canvas
    Set-Rect $c 0 0 16 16 (Hex '14202A')
    $ramp = New-Ramp @('5ABAD8', '3A8AA8', '2A6A88', '1C4A62', '12303F')
    foreach ($ox in @(0, 8)) { foreach ($oy in @(0, 8)) {
        for ($y = 0; $y -lt 8; $y++) { for ($x = 0; $x -lt 8; $x++) {
            $dx = ($x + 0.5 - 4.0) / 3.7; $dy = ($y + 0.5 - 4.0) / 3.7
            $v = $dx * $dx + $dy * $dy
            if ($v -gt 1.0) { continue }
            $t = 0.5 - 0.5 * ($dx * 0.7 + $dy * 0.7) - 0.3 * $v
            $i = if ($t -gt 0.75) { 0 } elseif ($t -gt 0.55) { 1 } elseif ($t -gt 0.38) { 2 } elseif ($t -gt 0.2) { 3 } else { 4 }
            Set-Px $c ($ox + $x) ($oy + $y) $ramp[$i]
        } }
        Set-Px $c ($ox + 2) ($oy + 2) (Hex 'D8F4FF'); Set-Px $c ($ox + 3) ($oy + 2) (Hex 'A8E0F4')
    } }
    Add-Bevel $c 1.5 0.7
    return $c
}
function New-CryostatCasing {
    $c = New-Canvas
    $tones = New-Ramp @('C8DCE8', 'DCEAF2', 'EAF4FA', 'B4CCDC')
    for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) { Set-Px $c $x $y $tones[(Get-Noise $x $y 0 101) % 4] } }
    foreach ($ry in @(5, 12)) {
        for ($x = 0; $x -lt 16; $x++) {
            $w = ((Get-Noise $x $ry 0 103) % 3)
            Set-Px $c $x $ry (Hex @('F0CC70', 'D8A84A', 'E4BA5C')[$w])
            Set-Px $c $x ($ry + 1) (Hex @('D8A84A', 'B08030', 'C89440')[$w])
        }
        Set-Rect $c 0 ($ry - 1) 16 1 (Hex '8FA6B8')
        Set-Rect $c 0 ($ry + 2) 16 1 (Hex '8FA6B8')
    }
    Add-Bevel $c 1.08 0.82
    return $c
}
function New-ProbeBayCasing {
    $c = New-Canvas
    $tones = New-Ramp @('B4BAC4', 'BEC4CC', 'AAB0BA')
    for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) { Set-Px $c $x $y $tones[(Get-Noise $x $y 0 111) % 3] } }
    foreach ($i in 0..15) { Set-Px $c $i $i (Hex '8A92A0'); Set-Px $c (15 - $i) $i (Hex '8A92A0') }
    Set-Rect $c 0 6 16 4 (Hex '3A3F4A')
    Set-Rect $c 0 7 16 2 (Hex '2A2E38')
    foreach ($x in @(1, 5, 9, 13)) { Set-Rect $c $x 7 2 2 (Hex 'E8C030') }
    Set-Rect $c 0 6 16 1 (Hex '5A6070'); Set-Rect $c 0 9 16 1 (Hex '1E222A')
    Add-Bevel $c
    return $c
}
function New-SynrocBlock {
    $c = New-Canvas
    $tones = New-Ramp @('2E2C30', '38353A', '262428', '45424A')
    for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
        $n = Get-Noise $x $y 0 121
        $col = $tones[$n % 4]
        if ($n -gt 246) { $col = Hex 'E8E0B8' } elseif ($n -gt 238) { $col = Hex 'A8A088' }
        Set-Px $c $x $y $col
    } }
    Add-Bevel $c 1.25 0.8
    return $c
}

# ============================================================================================
#  BUILD
# ============================================================================================
$Outputs = [ordered]@{}
function Add-Output { param([string]$Name, [string]$Group, [string]$Rel, [scriptblock]$Build) $Outputs[$Name] = @{ Group = $Group; Rel = $Rel; Build = $Build } }

Add-Output 'radium_capsule' 'items' 'item/radium_capsule.png' { New-RadiumCapsule }
Add-Output 'curium_oxide' 'items' 'item/curium_oxide.png' { New-CuriumOxide }
Add-Output 'carbon_nanotube_yarn' 'items' 'item/carbon_nanotube_yarn.png' { New-CarbonNanotubeYarn }
Add-Output 'cvd_diamond_plate' 'items' 'item/cvd_diamond_plate.png' { New-CvdDiamondPlate }
Add-Output 'qubit_array' 'items' 'item/qubit_array.png' { New-QubitArray }
Add-Output 'archaeal_culture' 'items' 'item/archaeal_culture.png' { New-ArchaealCulture }
Add-Output 'silica_aerogel' 'items' 'item/silica_aerogel.png' { New-SilicaAerogel }
Add-Output 'solar_core_survey' 'items' 'item/solar_core_survey.png' { New-SolarCoreSurvey }
Add-Output 'multimessenger_catalogue' 'items' 'item/multimessenger_catalogue.png' { New-MultimessengerCatalogue }
Add-Output 'neptune_probe_recording' 'items' 'item/neptune_probe_recording.png' { New-NeptuneProbeRecording }
Add-Output 'triton_probe_recording' 'items' 'item/triton_probe_recording.png' { New-TritonProbeRecording }
Add-Output 'neptune_flyby_data' 'items' 'item/neptune_flyby_data.png' { New-NeptuneFlybyData }
Add-Output 'triton_flyby_data' 'items' 'item/triton_flyby_data.png' { New-TritonFlybyData }
Add-Output 'pluto_kuiper_chart' 'items' 'item/pluto_kuiper_chart.png' { New-PlutoKuiperChart }
Add-Output 'kuiper_target_list' 'items' 'item/kuiper_target_list.png' { New-KuiperTargetList }
Add-Output 'scoop_head' 'items' 'item/scoop_head.png' { New-ScoopHead }
Add-Output 'ring_sail_net' 'items' 'item/ring_sail_net.png' { New-RingSailNet }
Add-Output 'ring_ice_sample' 'items' 'item/ring_ice_sample.png' { New-RingIceSample }
Add-Output 'titan_entry_probe' 'items' 'item/titan_entry_probe.png' { New-TitanEntryProbe }
Add-Output 'lake_sampler' 'items' 'item/lake_sampler.png' { New-LakeSampler }
Add-Output 'aerogel_cartridge' 'items' 'item/aerogel_cartridge.png' { New-AerogelCartridge }
Add-Output 'silica_nanograins' 'items' 'item/silica_nanograins.png' { New-SilicaNanograins }
Add-Output 'saturn_interior_model' 'items' 'item/saturn_interior_model.png' { New-SaturnInteriorModel }
Add-Output 'uranus_transfer_chart' 'items' 'item/uranus_transfer_chart.png' { New-UranusTransferChart }
Add-Output 'ice_giant_atmosphere_sample' 'items' 'item/ice_giant_atmosphere_sample.png' { New-IceGiantAtmosphereSample }
Add-Output 'ice_giant_diamond_seed' 'items' 'item/ice_giant_diamond_seed.png' { New-IceGiantDiamondSeed }
Add-Output 'neptune_flyby_probe' 'items' 'item/neptune_flyby_probe.png' { New-NeptuneFlybyProbe }
Add-Output 'neptune_sample' 'items' 'item/neptune_sample.png' { New-NeptuneSample }
Add-Output 'tholin' 'items' 'item/tholin.png' { New-Tholin }
Add-Output 'silicon_28_dust' 'items' 'item/silicon_28_dust.png' { New-Silicon28Dust }
Add-Output 'pica_heat_shield' 'items' 'item/pica_heat_shield.png' { New-PicaHeatShield }
Add-Output 'naquadria_containment_casing' 'blocks' 'block/zpm/naquadria_containment_casing.png' { New-NaquadriaContainmentCasing }
Add-Output 'pressure_hull_casing' 'blocks' 'block/zpm/pressure_hull_casing.png' { New-PressureHullCasing }
Add-Output 'photomultiplier_casing' 'blocks' 'block/zpm/photomultiplier_casing.png' { New-PhotomultiplierCasing }
Add-Output 'cryostat_casing' 'blocks' 'block/zpm/cryostat_casing.png' { New-CryostatCasing }
Add-Output 'probe_bay_casing' 'blocks' 'block/zpm/probe_bay_casing.png' { New-ProbeBayCasing }
Add-Output 'synroc_block' 'blocks' 'block/zpm/synroc_block.png' { New-SynrocBlock }

$Known = @($Outputs.Keys) + @('items', 'blocks')
foreach ($id in $Only) { if ($Known -notcontains $id) { throw "Unknown -Only value '$id' (expected an output name or one of: items, blocks)" } }
foreach ($name in $Outputs.Keys) {
    $o = $Outputs[$name]
    if ($Only.Count -gt 0 -and $Only -notcontains $name -and $Only -notcontains $o.Group) { continue }
    Out-Tex (& $o.Build) $o.Rel
}

# ============================================================================================
#  VERIFY what was written
# ============================================================================================
$problems = 0
function Add-Problem { param([string]$Rel, [string]$Msg) $script:problems++; Write-Warning "$Rel : $Msg" }
$ReadCache = @{}
foreach ($rel in $written) {
    $img = Read-Png (Join-Path $OutRoot ($rel -replace '/', '\'))
    $ReadCache[$rel] = $img
    $isBlock = $rel.StartsWith('block/')
    if ($img.W -ne 16 -or $img.H -ne 16) { Add-Problem $rel "size $($img.W)x$($img.H), expected 16x16"; continue }
    $opaque = 0
    foreach ($p in $img.P) {
        $a = ($p -shr 24) -band 255
        if ($a -ne 0 -and $a -ne 255) { Add-Problem $rel 'a pixel is semi-transparent'; break }
        if ($a -eq 255) { $opaque++; if (($p -band 0xFFFFFF) -eq 0) { Add-Problem $rel 'a pixel is pure black'; break } }
    }
    if ($isBlock -and $opaque -ne 256) { Add-Problem $rel "block texture has $opaque opaque pixels, expected 256" }
    if (-not $isBlock) {
        if (($img.P[0] -shr 24) -ne 0) { Add-Problem $rel 'item icon has an opaque top-left corner (needs a transparent background)' }
        if ($opaque -lt 20) { Add-Problem $rel "item icon is nearly empty ($opaque opaque pixels)" }
    }
}
$keys = @{}
foreach ($rel in $written) {
    if ($ReadCache[$rel].P.Count -ne 256) { continue }
    $k = ($ReadCache[$rel].P) -join ','
    if ($keys.ContainsKey($k)) { Add-Problem $rel "identical to $($keys[$k])" } else { $keys[$k] = $rel }
}
if ($Only.Count -eq 0) {
    $src = Get-Content -LiteralPath (Join-Path $RepoRoot 'pack\kubejs\startup_scripts\grindless\zpm\foundation.js') -Raw
    $want = New-Object System.Collections.Generic.HashSet[string]
    foreach ($m in [regex]::Matches($src, '(?m)^    (\w+): \{ (?:stack|glass)')) { [void]$want.Add($m.Groups[1].Value) }
    $have = New-Object System.Collections.Generic.HashSet[string]
    foreach ($n in $Outputs.Keys) { [void]$have.Add($n) }
    foreach ($n in $want) { if (-not $have.Contains($n)) { Add-Problem $n 'registered by foundation.js but not drawn here' } }
    foreach ($n in $have) { if (-not $want.Contains($n)) { Add-Problem $n 'drawn here but not registered by foundation.js' } }
}

if ($Preview) {
    $items = @($written | Where-Object { $_.StartsWith('item/') })
    $blocks = @($written | Where-Object { $_.StartsWith('block/') })
    $scale = 6
    $cols = 8
    $itemRows = [int][Math]::Ceiling($items.Count / $cols)
    $W = $cols * 18 * $scale
    $H = ($itemRows * 18 + 2 + 3 * 16 + 2) * $scale
    $big = New-Canvas $W $H
    Set-Rect $big 0 0 $W $H (Hex '8B8B8B')
    for ($i = 0; $i -lt $items.Count; $i++) {
        $ox = ($i % $cols) * 18 * $scale + $scale; $oy = [int][Math]::Floor($i / $cols) * 18 * $scale + $scale
        $img = $ReadCache[$items[$i]]
        for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
            $p = $img.P[$y * 16 + $x]
            if ((($p -shr 24) -band 255) -ne 0) { Set-Rect $big ($ox + $x * $scale) ($oy + $y * $scale) $scale $scale $p }
        } }
    }
    $by = ($itemRows * 18 + 2) * $scale
    for ($b = 0; $b -lt $blocks.Count; $b++) {
        $img = $ReadCache[$blocks[$b]]
        $bx = $b * 50
        for ($ty = 0; $ty -lt 3; $ty++) { for ($tx = 0; $tx -lt 3; $tx++) {
            for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
                $px = $bx + $tx * 16 + $x; $py = [int]($by / $scale) + $ty * 16 + $y
                Set-Rect $big ($px * $scale / 3) ($py * $scale) 2 $scale $img.P[$y * 16 + $x]
            } }
        } }
    }
    $dir = Split-Path -Parent $Preview
    if ($dir -and -not (Test-Path -LiteralPath $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
    $bmp = ConvertTo-Bitmap $big
    try { $bmp.Save($Preview, [System.Drawing.Imaging.ImageFormat]::Png) } finally { $bmp.Dispose() }
    Write-Host "preview: $Preview (items x6 | blocks tiled 3x3)"
}

if ($problems -gt 0) { throw "$problems problem(s) in the texture checks (see the warnings above)" }
Write-Host "wrote $($written.Count) textures to $OutRoot"

if ($Credits) {
    Write-Host ''
    foreach ($rel in $written) {
        Write-Host ("| ``pack/kubejs/assets/grindless/textures/$rel`` | Generated with tools/assets/$ScriptName (procedural pixel art, original) by the assets agent (ZPM-F1) | the pack's licence (pending; proposed CC BY-SA 4.0) |")
    }
}
