<#
.SYNOPSIS
  Procedural 16x16 pixel art for the Mars site of Gregtech Grindless: the controller face of the EV atmosphere processor
  (gtceu:atmosphere_processor). GregTech style: bevels, top-left light, every pixel fully opaque or fully transparent.

.DESCRIPTION
  Every pixel is drawn by this script (palettes + char maps + small routines); nothing is copied or edited from GregTech Modern,
  GregTech Leisure or any other mod. Output is deterministic: re-running overwrites the same bytes. Same method, neutral steel
  ramp, EV purple accents, base strip and checks as the other EV faces (Build-EVTextures.ps1; the helpers are copied so that
  script stays untouched).

  Writes (under pack/kubejs/assets/grindless/textures/):
    block/multiblock/atmosphere_processor/overlay_front.png, overlay_front_active.png(+.mcmeta),
    overlay_front_active_emissive.png(+.mcmeta)

  The face follows the air through the machine (docs/eras/ev.md), top to bottom: a round intake (a stainless shroud around a
  four-bladed fan, with the thin rust-red Martian air behind the blades) between two dust filter cartridges; under the fan's
  outlet, the Sabatier reactor with its catalyst window; a pipe that takes the methane to the left gauge (pink) and the oxygen to
  the right one (blue); and the purple stripes and status lamp of the EV faces along the base. 8 frames, frametime 3: the fan
  turns (22.5 degrees a frame, its blades blurred against the haze), a gust runs down each filter, the reactor glows warm and
  flickers, a methane bead runs left and an oxygen bead right along the pipe, both gauges pulse out of step with a bubble rising
  in each, the stripes light up and the lamp turns green. Idle: blades still in an X, cold reactor, dark gauges and the red lamp.
  The emissive layer has the gauges, the reactor window, the beads, the stripes and the lamp.

  Run from the repo root (PowerShell 5.1 blocks unsigned scripts by default; this bypass only affects that process):
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-MarsSiteTextures.ps1
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-MarsSiteTextures.ps1 -Preview C:\path\atmosphere_processor.png -Casing C:\path\machine_casing_stable_titanium.png
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-MarsSiteTextures.ps1 -Credits

  Overlay conventions (GTM's workable casings, as every other set): transparent background, details only on the overlay, animated
  variants are vertical 16x(16*n) strips with a .png.mcmeta, *_emissive layers hold only the pixels that glow (identical to the colour
  layer). The outer 1 px ring is always left empty so the casing shows around the face. -Verbose warns if a later drawing covers an
  emissive pixel.
  Drawn for gtceu:block/casings/solid/machine_casing_stable_titanium (gtceu:stable_machine_casing, the controller's
  workableCasingModel): the face has its own dark bezel, so it reads the same on the light titanium plating as on any other casing.

.PARAMETER OutRoot
  Textures root. Default: <repo>/pack/kubejs/assets/grindless/textures
.PARAMETER Preview
  Also write a review sheet (nearest neighbour, x8) to this PNG, which must be outside the repository (it is never shipped): the
  face on the casing (idle, every active frame with its emissive layer, a dark-room view), the controller in a 3x3 wall of casing,
  idle and working, and the emissive layer alone on black, frame by frame.
.PARAMETER Casing
  Optional 16x16 PNG used as the casing in the preview (for example GTM's machine_casing_stable_titanium.png extracted from the jar
  and kept outside the repo). Without it, a stand-in titanium plate drawn by code is used.
.PARAMETER Credits
  Also print the CREDITS.md "Assets" table rows for the files written.
#>
[CmdletBinding()]
param(
    [string]$OutRoot = '',
    [string]$Preview = '',
    [string]$Casing = '',
    [switch]$Credits
)
$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'Pixel.Lib.ps1')

$RepoRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..'))
if (-not $OutRoot) { $OutRoot = Join-Path $RepoRoot 'pack\kubejs\assets\grindless\textures' }
$OutRoot = [System.IO.Path]::GetFullPath($OutRoot)
$ScriptName = Split-Path -Leaf $PSCommandPath

if ($Preview) {
    $Preview = $ExecutionContext.SessionState.Path.GetUnresolvedProviderPathFromPSPath($Preview)
    if ($Preview.StartsWith($RepoRoot.TrimEnd('\') + '\', [System.StringComparison]::OrdinalIgnoreCase)) {
        throw "-Preview must point outside the repository (the review sheet is never shipped): $Preview"
    }
}
if ($Casing) {
    $Casing = $ExecutionContext.SessionState.Path.GetUnresolvedProviderPathFromPSPath($Casing)
    if (-not (Test-Path -LiteralPath $Casing)) { throw "-Casing not found: $Casing" }
}

$written = New-Object System.Collections.Generic.List[string]
function Out-Tex {
    param($Canvas, [string]$Rel, [int]$FrameTime = 0)
    $path = Join-Path $OutRoot ($Rel -replace '/', '\')
    # an editor, indexer or virus scanner can hold a file for a moment: retry the write a few times
    for ($try = 1; $try -le 6; $try++) {
        try { Save-Png $Canvas $path; if ($FrameTime -gt 0) { Save-Mcmeta ($path + '.mcmeta') $FrameTime }; break }
        catch [System.IO.IOException] { if ($try -eq 6) { throw }; Start-Sleep -Milliseconds (250 * $try) }
    }
    $written.Add($Rel)
    if ($FrameTime -gt 0) { $written.Add($Rel + '.mcmeta') }
}

function Assert-Map {
    param([string]$Name, [string[]]$Rows, [int]$W = 16, [int]$H = 16)
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

# Sets a pixel on the colour layer and on the emissive layer (the emissive layer may only hold what the colour layer holds).
function Set-Both {
    param($C, $E, [int]$X, [int]$Y, [int]$Argb)
    Set-Px $C $X $Y $Argb; Set-Px $E $X $Y $Argb
}

# An emissive pixel only counts while the colour layer still shows it: drops the ones a later draw covered.
function Sync-Emissive {
    param($C, $E)
    $dropped = 0
    for ($i = 0; $i -lt $E.P.Length; $i++) { if ($E.P[$i] -ne 0 -and $E.P[$i] -ne $C.P[$i]) { $E.P[$i] = 0; $dropped++ } }
    if ($dropped -gt 0) { Write-Verbose "Sync-Emissive: $dropped emissive pixel(s) covered by a later draw" }
}

# Deterministic 0..255 hash of (x, y, frame, salt): flicker without a random generator.
function Get-Noise {
    param([long]$X, [long]$Y, [long]$T = 0, [long]$Salt = 0)
    $h = (($X * 73856093L) -bxor ($Y * 19349663L) -bxor ($T * 83492791L) -bxor ($Salt * 2654435761L)) % 1000003L
    if ($h -lt 0) { $h = -$h }
    return [int](($h * 7919L) % 256L)
}

# Neutral steel ramp shared by every overlay (lit -> dark), the same one as the LV, MV, HV and EV sets.
$SteelSpec = 'A=D3D3D3 B=B0B0B0 C=8E8E8E D=707070 E=565656 F=404040 G=2F2F2F H=222222 I=161616 J=0D0D0D'
# EV tier purple, lit -> dark (stripes).
$PurpleSpec = 'a=F3E4FF b=D6B0FF c=B07AF0 d=8A4CD0 e=5C2E9C f=381C64 g=1C0E36'
# Clean stainless steel (cooler and brighter than the neutral steel), lit -> dark: the intake shroud, the hub and the pipe.
$StainSpec = '0=F7FAFF 1=DCE5F0 2=B8C6D8 3=8E9DB2 4=667690 5=465470 6=2C364C'
# State lamp: green while working (M..P), red while idle (Q..S).
$LampSpec = 'M=E2FFE4 N=62FF86 O=22C257 P=0C6B2E Q=FF5A48 R=B52D22 S=5E1511'

# Frame shared by the EV faces with a free-form window: 1 px empty ring, steel bezel, dark window x3..13 y3..12, base strip y13.
$WindowBase = @(
    '................',
    '.CDDDDDDDDDDDDE.',
    '.DGGGGGGGGGGGGF.',
    '.DGIIIIIIIIIIIF.',
    '.DGIIIIIIIIIIIF.',
    '.DGIIIIIIIIIIIF.',
    '.DGIIIIIIIIIIIF.',
    '.DGIIIIIIIIIIIF.',
    '.DGIIIIIIIIIIIF.',
    '.DGIIIIIIIIIIIF.',
    '.DGIIIIIIIIIIIF.',
    '.DGIIIIIIIIIIIF.',
    '.DGIIIIIIIIIIIF.',
    '.DGGGGGGGGGGGGF.',
    '.EFFFFFFFFFFFFG.',
    '................'
)
Assert-Map 'WindowBase' $WindowBase

# ============================================================================================
#  ATMOSPHERE PROCESSOR - controller face (stable titanium casing), the first machine built on Mars
#  the air goes top to bottom: a round intake (shroud ring at 3.5..4.5 px from the hub at x8,y6, the fan inside it) between two
#  dust filter cartridges (x3, x13; y3..8), the Sabatier reactor under the fan's outlet (catalyst window x7..9, y11), the product
#  gauges (methane x3..4, oxygen x12..13; cap y9, sight glass y10..11) on the pipe (y12) and the base strip (y13)
# ============================================================================================
# h..k Mars dust on the filters (gust, lit pleat, shaded pleat, dark fold) and l the thin red air seen behind the fan; K..n methane
# (highlight -> dark, GregTech's methane pink), T..W oxygen (GregTech's oxygen blue), u..w the reactor glow and y the cold reactor.
$AtmPal = New-Pal ($SteelSpec + ' ' + $PurpleSpec + ' ' + $StainSpec + ' ' + $LampSpec + ' ' + @'
h=F0C8A0 i=C48E64 j=8E5A3A k=5C3424 l=3E2622
K=FFD6EC L=FF6AB4 m=F01E86 n=A8145C
T=E6F8FF U=A0E4FF V=4CC3FF W=2E8CCC
u=FFF0B8 v=FFC24A w=F08A1E y=5A2A10
'@)
$AtmFrameTime = 3

$FanCx = 8
$FanCy = 6
# shroud ring (3.5 <= d < 4.5) and blade cells (1.2 <= d < 3.5, the hub keeps the rest), in a fixed order: [x, y, dx, dy, d]
$FanRing = @(); $FanBlades = @()
for ($y = $FanCy - 4; $y -le $FanCy + 4; $y++) { for ($x = $FanCx - 4; $x -le $FanCx + 4; $x++) {
    $dx = $x - $FanCx; $dy = $y - $FanCy
    $d = [Math]::Sqrt($dx * $dx + $dy * $dy)
    if ($d -ge 3.5 -and $d -lt 4.5) { $FanRing += , @($x, $y, $dx, $dy, $d) }
    elseif ($d -ge 1.2 -and $d -lt 3.5) { $FanBlades += , @($x, $y, $dx, $dy, $d) }
} }
# the hub: a stainless cap over the centre and its four neighbours, lit from the top-left
$FanHub = @(@(8, 6, '2'), @(8, 5, '3'), @(7, 6, '3'), @(9, 6, '4'), @(8, 7, '4'))
# x3..13 along y12: stainless pipe with a flange on each side, the reactor's steel base in the middle
$AtmPipe = '4323FFF3234'
# the two products: [left x of the gauge, highlight -> dark ramp, phase offset of its pulse]
$AtmGauges = @(@{ X = 3; Ramp = @('K', 'L', 'm', 'n'); Off = 0 }, @{ X = 12; Ramp = @('T', 'U', 'V', 'W'); Off = 2 })

# Shroud ring lit from the top-left: the outer rim goes from bright (top-left) to dark (bottom-right); the inner lip that drops
# into the duct (only on the diagonals, where the ring is two pixels thick) the other way round: shaded top-left, lit bottom-right.
function Get-RingTone {
    param([int]$Dx, [int]$Dy, [double]$D)
    $s = ($Dx + $Dy) / $D
    if ($D -lt 4.0) { return [string](Get-ClampInt ([int][Math]::Round(3 - 0.75 * $s)) 1 5) }
    if ($s -le -0.9) { return '1' } elseif ($s -le -0.3) { return '2' } elseif ($s -lt 0.3) { return '3' } elseif ($s -lt 0.9) { return '4' }
    return '5'
}

# A fan cell with the blades at Phi degrees: four blades, so cos(4 (theta - phi)) is 1 on a blade's axis. At or above Thr it is
# blade (steel, lit from the top-left), down to -0.4 the blur between blade and gap, below that the thin red air behind the fan.
# Straight blades only: the X and + poses are symmetric and the poses between them blur, so no frame shows hooked arms.
function Get-FanTone {
    param([int]$Dx, [int]$Dy, [double]$D, [double]$Phi, [double]$Thr)
    $c = [Math]::Cos(4 * ([Math]::Atan2($Dy, $Dx) - $Phi * [Math]::PI / 180))
    $s = ($Dx + $Dy) / $D
    if ($c -ge $Thr) { if ($s -lt -0.6) { return 'A' } elseif ($s -lt 0.6) { return 'B' }; return 'C' }
    if ($c -ge -0.4) { if ($s -lt 0) { return 'D' }; return 'E' }
    return 'l'
}

function New-AtmosphereFrame {
    param([bool]$Active, [int]$T = 0)
    $c = New-Canvas; $e = New-Canvas
    $P = $AtmPal
    Write-Map $c 0 0 $WindowBase $P

    # ---- the intake: shroud ring, blades and hub. Idle: wide blades still in an X. Working: thinner, blurred blades turning
    #      22.5 degrees a frame; a four-bladed fan repeats every 90 degrees, so the 8 frames are half a turn and loop cleanly
    foreach ($q in $FanRing) { Set-Px $c $q[0] $q[1] $P[(Get-RingTone $q[2] $q[3] $q[4])] }
    $phi = 45.0; $thr = 0.25
    if ($Active) { $phi = 45.0 + 22.5 * $T; $thr = 0.3 }
    foreach ($q in $FanBlades) { Set-Px $c $q[0] $q[1] $P[(Get-FanTone $q[2] $q[3] $q[4] $phi $thr)] }
    foreach ($q in $FanHub) { Set-Px $c $q[0] $q[1] $P[$q[2]] }

    # ---- dust filter cartridges on both sides of the intake: a steel cap (y3) over five pleats (y4..8) caked with red dust, the
    #      right one in the shade; while working a gust runs down each of them, half a loop apart
    for ($side = 0; $side -lt 2; $side++) {
        $fx = 3 + 10 * $side
        Set-Px $c $fx 3 $P[$(if ($side -eq 0) { 'C' } else { 'E' })]
        for ($k = 0; $k -lt 5; $k++) {
            $tone = if (($k % 2) -eq 1) { 'k' } elseif ($side -eq 0) { 'i' } else { 'j' }
            if ($Active -and $k -eq (($T + 2 * $side) % 4)) {
                if ($tone -eq 'k') { $tone = 'j' } elseif ($tone -eq 'j') { $tone = 'i' } else { $tone = 'h' }
            }
            Set-Px $c $fx (4 + $k) $P[$tone]
        }
    }

    # ---- Sabatier reactor under the fan's outlet: steel walls (x6, x10) round the catalyst window (x7..9, y11), which glows warm
    #      and flickers while CO2 and hydrogen react on it, hottest in the middle; dark when cold
    Set-Px $c 6 11 $P['D']; Set-Px $c 10 11 $P['F']
    for ($x = 7; $x -le 9; $x++) {
        if ($Active) {
            $n = Get-Noise $x 11 $T 7
            $tone = if ($n -ge 200) { 'u' } elseif ($n -ge 70 -or $x -eq 8) { 'v' } else { 'w' }
            Set-Both $c $e $x 11 $P[$tone]
        } else { Set-Px $c $x 11 $P['y'] }
    }

    # ---- the pipe (y12); while working a methane bead runs left to its gauge and an oxygen bead right to its own, out of step
    for ($i = 0; $i -lt 11; $i++) { Set-Px $c (3 + $i) 12 $P[[string]$AtmPipe[$i]] }
    if ($Active) {
        Set-Both $c $e (6 - ($T % 4)) 12 $P['L']
        Set-Both $c $e (10 + (($T + 2) % 4)) 12 $P['U']
    }

    # ---- product gauges standing on the pipe: a steel cap (y9) over a 2x2 sight glass (y10..11) lit from the top-left, methane on
    #      the left and oxygen on the right. Working: they glow and pulse out of step (two bright frames, two dimmer ones) and a
    #      bubble rises through each while it is bright. Idle: dark glass.
    foreach ($g in $AtmGauges) {
        $x0 = $g.X; $ramp = $g.Ramp
        Set-Px $c $x0 9 $P['C']; Set-Px $c ($x0 + 1) 9 $P['E']
        $ph = ($T + $g.Off) % 4
        $lift = 0
        if ($Active -and $ph -lt 2) { $lift = 1 }
        foreach ($q in @(@($x0, 10, 1), @(($x0 + 1), 10, 2), @($x0, 11, 2), @(($x0 + 1), 11, 3))) {
            $col = $P[$ramp[$q[2] - $lift]]
            if ($Active) { Set-Both $c $e $q[0] $q[1] $col } else { Set-Px $c $q[0] $q[1] (Shade $col 0.4) }
        }
        if ($Active -and $ph -lt 2) { Set-Both $c $e ($x0 + 1) (11 - $ph) $P[$ramp[0]] }
    }

    # ---- base strip (y13): purple stripes x3..9 and the state lamp x11..13, as on the other EV faces
    foreach ($x in 3..9) {
        if (($x % 4) -lt 2) {
            if ($Active) { Set-Both $c $e $x 13 $P['c'] } else { Set-Px $c $x 13 $P['e'] }
        } else { Set-Px $c $x 13 $P['g'] }
    }
    if ($Active) {
        $core = if (($T % 4) -lt 2) { 'M' } else { 'N' }
        Set-Both $c $e 11 13 $P[$core]; Set-Both $c $e 12 13 $P['N']; Set-Both $c $e 13 13 $P['O']
    } else {
        Set-Px $c 11 13 $P['Q']; Set-Px $c 12 13 $P['R']; Set-Px $c 13 13 $P['S']
    }

    Sync-Emissive $c $e
    return @{ Color = $c; Emi = $e }
}

# ============================================================================================
#  BUILD
# ============================================================================================
function Out-Overlay {
    param([string]$Dir, $Builder, [int]$FrameTime)
    $frames = @(); $emis = @()
    for ($f = 0; $f -lt 8; $f++) { $r = & $Builder $true $f; $frames += $r.Color; $emis += $r.Emi }
    $idle = & $Builder $false 0
    Out-Tex $idle.Color "$Dir/overlay_front.png"
    Out-Tex (Join-Frames $frames) "$Dir/overlay_front_active.png" $FrameTime
    Out-Tex (Join-Frames $emis) "$Dir/overlay_front_active_emissive.png" $FrameTime
}

Out-Overlay 'block/multiblock/atmosphere_processor' ${function:New-AtmosphereFrame} $AtmFrameTime

# ============================================================================================
#  VERIFY what was written (size, binary alpha, no pure black, 8-frame strips with a valid .mcmeta that really animate, empty
#  casing ring, emissive pixels present and identical in the colour layer)
# ============================================================================================
$problems = 0
foreach ($rel in $written) {
    if ($rel.EndsWith('.mcmeta')) { continue }
    $path = Join-Path $OutRoot ($rel -replace '/', '\')
    $img = Read-Png $path
    $msgs = @()
    if ($img.W -ne 16 -or ($img.H % 16) -ne 0) { $msgs += "bad size $($img.W)x$($img.H)" }
    $opaque = 0; $black = 0
    foreach ($px in $img.P) {
        $alpha = ($px -shr 24) -band 255
        if ($alpha -ne 0 -and $alpha -ne 255) { $msgs += 'partial alpha'; break }
        if ($alpha -eq 255) {
            $opaque++
            $q = Get-Rgba $px
            if ($q[0] -eq 0 -and $q[1] -eq 0 -and $q[2] -eq 0) { $black++ }
        }
    }
    if ($opaque -eq 0) { $msgs += 'fully transparent' }
    if ($black -gt 0) { $msgs += "$black pure-black px" }
    $nf = [int]($img.H / 16)
    if (Test-Path -LiteralPath ($path + '.mcmeta')) {
        if ($nf -ne 8) { $msgs += "animation has $nf frames (expected 8)" }
        try {
            $meta = [System.IO.File]::ReadAllText($path + '.mcmeta') | ConvertFrom-Json
            if ($meta.animation.frametime -ne $AtmFrameTime) { $msgs += "mcmeta frametime is '$($meta.animation.frametime)' (expected $AtmFrameTime)" }
        } catch { $msgs += "mcmeta is not valid JSON ($($_.Exception.Message))" }
        if ($rel -notlike '*_emissive.png') {
            $seen = @{}
            for ($f = 0; $f -lt $nf; $f++) { $seen[(($img.P[($f * 256)..($f * 256 + 255)]) -join ',')] = 1 }
            if ($seen.Count -lt 4) { $msgs += "only $($seen.Count) distinct frames out of $nf" }
        }
    } elseif ($nf -ne 1) { $msgs += "$nf-frame strip without .mcmeta" }
    for ($f = 0; $f -lt $nf; $f++) { for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
        if ($x -lt 1 -or $y -lt 1 -or $x -ge 15 -or $y -ge 15) {
            if ((($img.P[($f * 16 + $y) * 16 + $x] -shr 24) -band 255) -ne 0) { $msgs += "opaque pixel in the casing ring (frame $f, $x,$y)"; $f = $nf; $y = 16; break }
        }
    } } }
    if ($rel -like '*_active_emissive.png') {
        $color = Read-Png (Join-Path $OutRoot (($rel -replace '_emissive\.png$', '.png') -replace '/', '\'))
        if ($color.H -ne $img.H) { $msgs += 'emissive strip height differs from the colour strip' }
        else {
            $lit = 0
            for ($i = 0; $i -lt $img.P.Length; $i++) {
                if ((($img.P[$i] -shr 24) -band 255) -eq 0) { continue }
                $lit++
                if ($img.P[$i] -ne $color.P[$i]) { $msgs += 'emissive pixel not present in colour layer'; break }
            }
            if ($lit -eq 0) { $msgs += 'emissive layer is empty' }
        }
    }
    if ($msgs.Count -gt 0) { $problems++; Write-Warning "$rel : $($msgs -join '; ')" }
}

Write-Host "written $($written.Count) files under $OutRoot ($problems with warnings)"
foreach ($rel in $written) { Write-Host "  $rel" }

# ============================================================================================
#  PREVIEW (optional, never shipped)
# ============================================================================================
if ($Preview) {
    # a bevelled stand-in of the stable titanium casing (the panel of Build-EVPreview.ps1) for when no -Casing is given
    function New-StandInTitanium {
        $c = New-Canvas 16 16
        $pal = New-Palette 'a=EBD0F2 b=DDBDE8 c=C9A3D8 d=7E5A8F e=A883BA f=9470A8 l=B48FC6 m=C39ED2'
        for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
            $ch = 'c'
            if ($y -le 2) { $ch = 'b' } elseif ($y -ge 13) { $ch = 'f' }
            if ($x -le 1 -and $y -gt 2 -and $y -lt 13) { $ch = 'a' } elseif ($x -ge 14 -and $y -gt 2 -and $y -lt 13) { $ch = 'e' }
            if ($y -eq 3 -or $y -eq 12 -or $y -eq 15) { $ch = 'd' }
            if ($x -ge 4 -and $x -le 11 -and $y -ge 4 -and $y -le 11) { $ch = if (($x % 3) -eq 1) { 'm' } else { 'l' } }
            $c.P[$y * 16 + $x] = $pal[$ch]
        } }
        return $c
    }
    function Get-Frame { param($Strip, [int]$Index) $f = New-Canvas 16 16; [Array]::Copy($Strip.P, $Index * 256, $f.P, 0, 256); return $f }
    function Merge-On { param($Dst, $Src) $o = Copy-Canvas $Dst; Merge-Canvas $o $Src; return $o }
    function Get-Dark {
        param($Base, $Col, $Emi)
        $o = Merge-On $Base $Col
        for ($i = 0; $i -lt $o.P.Length; $i++) { $o.P[$i] = Shade $o.P[$i] 0.25 }
        return (Merge-On $o $Emi)
    }
    $casingNote = 'a stand-in titanium plate drawn by code'
    $casingTex = New-StandInTitanium
    if ($Casing) {
        $casingTex = Read-Png $Casing
        if ($casingTex.W -ne 16 -or ($casingTex.H % 16) -ne 0) { throw "-Casing must be a 16x16 PNG (got $($casingTex.W)x$($casingTex.H)): $Casing" }
        if ($casingTex.H -gt 16) { $casingTex = Get-Frame $casingTex 0 }
        $casingNote = Split-Path -Leaf $Casing
    }
    $dir = Join-Path $OutRoot 'block\multiblock\atmosphere_processor'
    $idle = Read-Png (Join-Path $dir 'overlay_front.png')
    $act = Read-Png (Join-Path $dir 'overlay_front_active.png')
    $emi = Read-Png (Join-Path $dir 'overlay_front_active_emissive.png')
    $tiles = New-Object System.Collections.Generic.List[object]
    $tiles.Add((Merge-On $casingTex $idle))
    for ($f = 0; $f -lt 8; $f++) { $tiles.Add((Merge-On (Merge-On $casingTex (Get-Frame $act $f)) (Get-Frame $emi $f))) }
    $tiles.Add((Get-Dark $casingTex (Get-Frame $act 0) (Get-Frame $emi 0)))

    # 1x sheet: the tiles in a row; under them the controller in a 3x3 wall of casing (idle, then working) and the emissive layer
    # alone on black, frame by frame in two rows of four
    $gap = 2
    $sw = $gap + $tiles.Count * (16 + $gap); $sh = $gap + 16 + $gap + 48 + $gap
    $sheet = New-Canvas $sw $sh
    for ($i = 0; $i -lt $sheet.P.Length; $i++) { $sheet.P[$i] = Hex '202428' }
    function Put-Tile { param($Tile, [int]$X0, [int]$Y0) for ($y = 0; $y -lt 16; $y++) { [Array]::Copy($Tile.P, $y * 16, $sheet.P, ($Y0 + $y) * $sw + $X0, 16) } }
    for ($t = 0; $t -lt $tiles.Count; $t++) { Put-Tile $tiles[$t] ($gap + $t * (16 + $gap)) $gap }
    $wy = $gap + 16 + $gap
    $k = 0
    foreach ($center in @($tiles[0], $tiles[1])) {
        $wx = $gap + $k * (48 + $gap)
        for ($j = 0; $j -lt 3; $j++) { for ($i = 0; $i -lt 3; $i++) {
            $tile = if ($i -eq 1 -and $j -eq 1) { $center } else { $casingTex }
            Put-Tile $tile ($wx + 16 * $i) ($wy + 16 * $j)
        } }
        $k++
    }
    $night = New-Canvas 16 16
    for ($i = 0; $i -lt 256; $i++) { $night.P[$i] = Hex '0E0E10' }
    $ex = $gap + 2 * (48 + $gap) + $gap
    for ($f = 0; $f -lt 8; $f++) { Put-Tile (Merge-On $night (Get-Frame $emi $f)) ($ex + ($f % 4) * (16 + $gap)) ($wy + [int][Math]::Floor($f / 4) * (16 + $gap)) }

    # nearest-neighbour upscale, one scaled row at a time
    $scale = 8
    $big = New-Canvas ($sw * $scale) ($sh * $scale)
    $row = New-Object 'int[]' ($sw * $scale)
    for ($y = 0; $y -lt $sh; $y++) {
        for ($x = 0; $x -lt $sw; $x++) { $v = $sheet.P[$y * $sw + $x]; for ($s = 0; $s -lt $scale; $s++) { $row[$x * $scale + $s] = $v } }
        for ($s = 0; $s -lt $scale; $s++) { [Array]::Copy($row, 0, $big.P, ($y * $scale + $s) * $big.W, $big.W) }
    }
    Save-Png $big $Preview
    Write-Host "preview: $Preview (x$scale on $casingNote; idle, 8 active frames with emissive, dark room; 3x3 wall idle and working; the emissive layer alone)"
}

if ($Credits) {
    Write-Host ''
    foreach ($rel in $written) {
        Write-Host ("| ``pack/kubejs/assets/grindless/textures/$rel`` | Generated with tools/assets/$ScriptName (procedural pixel art, original) by the mars site agent, 2026-10-25 | the pack's licence (pending; proposed CC BY-SA 4.0) |")
    }
}
if ($problems -gt 0) { exit 1 }
