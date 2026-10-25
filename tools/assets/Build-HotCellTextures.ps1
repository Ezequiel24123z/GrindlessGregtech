<#
.SYNOPSIS
  Procedural 16x16 pixel art for the IV hot cell's controller face of Gregtech Grindless (GregTech style: bevels, top-left
  light, every pixel fully opaque or fully transparent).

.DESCRIPTION
  Every pixel is drawn by this script (palettes + a char map + small routines); nothing is copied or edited from GregTech
  Modern or any other mod. Output is deterministic: re-running overwrites the same bytes (the shimmer comes from Get-Noise, a
  hash of position and frame, not from a random generator). Same method, steel bezel and lamp ramp as the EV and IV faces
  (Build-CombinedCycleHotMillTextures.ps1, Build-FissionReactorTextures.ps1), whose helpers are copied so those scripts stay
  untouched, and the fission reactor's checks: no frame repeats the next one, no hole inside the panel, and light only where
  the face has lights.

  Writes (under pack/kubejs/assets/grindless/textures/):
    block/multiblock/hot_cell/overlay_front.png, overlay_front_active.png(+.mcmeta), overlay_front_active_emissive.png(+.mcmeta)

  The face is the operating window of the hot cell (gtceu:hot_cell), as the operator sees it: a thick lead glass window in a
  dark steel frame over most of the panel, amber at its edges and dark amber-brown where it looks into the cell. Inside, a
  master-slave manipulator comes down from its sleeve in the wall at the top of the window, with a two-finger pincer (the
  tongs) at its end, and a small sample vial stands on the dark bench at the bottom of the cell. Under the window: a small
  radiation sign at the bottom left and a row of four mode lamps (1 enrichment, 2 fuel, 3 reprocessing, 4 radon).
  8 frames, frametime 4: the cell lights are on (warm amber behind the glass); the tongs come down to the sample, close on it,
  lift it a pixel, set it down, open and rise back to the top; the sample glows yellow-green and breathes; mode lamp 1 is lit
  and lamp 4 blinks once a loop, when the pincer closes. Idle: the cell is dark, the tongs are parked at the top, the sample
  is a dull olive vial and the four lamps are dark.

  The *_emissive layer only holds the sample's glow (the vial and the light it casts beside it) and the lit lamps.

  Run from the repo root (PowerShell 5.1 blocks unsigned scripts by default; this bypass only affects that process):
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-HotCellTextures.ps1
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-HotCellTextures.ps1 -Only hot_cell -Credits

  Overlay conventions (GTM's workable casings, as every other set): transparent background, details only on the overlay,
  animated variants are vertical 16x(16*n) strips with a .png.mcmeta, *_emissive layers hold only the pixels that glow
  (identical to the colour layer). Every pixel is fully opaque or fully transparent and none is pure black. The outer 1 px
  ring is always left empty so the casing shows around the face. Drawn for gtnn:block/casings/solid/radiation_proof_machine_casing
  (GT--'s radiation-proof machine casing, the hot cell's workableCasingModel); the face has its own dark frame, so it also
  reads on other casings. The final check fails the run (non-zero exit) if a written file breaks one of these rules.

.PARAMETER Only
  Subset of: hot_cell (comma-separated, also as one string with -File). Default: everything.
.PARAMETER OutRoot
  Textures root. Default: <repo>/pack/kubejs/assets/grindless/textures
.PARAMETER Credits
  Also print the CREDITS.md "Assets" table rows for the files written.
#>
[CmdletBinding()]
param(
    [string]$OutRoot = '',
    [string[]]$Only = @(),
    [switch]$Credits
)
$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'Pixel.Lib.ps1')

# `powershell -File ... -Only a,b` delivers "a,b" as one string: split it so both calling styles work.
$Only = @($Only | ForEach-Object { $_ -split '[,;\s]+' } | Where-Object { $_ })
$Known = @('hot_cell')
foreach ($id in $Only) { if ($Known -notcontains $id) { throw "Unknown -Only id '$id' (expected: $($Known -join ', '))" } }

if (-not $OutRoot) { $OutRoot = Join-Path $PSScriptRoot '..\..\pack\kubejs\assets\grindless\textures' }
$OutRoot = [System.IO.Path]::GetFullPath($OutRoot)
$ScriptName = Split-Path -Leaf $PSCommandPath

function Test-Want { param([string]$Id) return ($Only.Count -eq 0 -or $Only -contains $Id) }

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

# An emissive pixel only counts while the colour layer still shows it: drops the ones a later draw covered
# (-Verbose lists how many, to catch a glow that was covered by accident).
function Sync-Emissive {
    param($C, $E)
    $dropped = 0
    for ($i = 0; $i -lt $E.P.Length; $i++) { if ($E.P[$i] -ne 0 -and $E.P[$i] -ne $C.P[$i]) { $E.P[$i] = 0; $dropped++ } }
    if ($dropped -gt 0) { Write-Verbose "Sync-Emissive: $dropped emissive pixel(s) covered by a later draw" }
}

# Deterministic 0..255 hash of (x, y, frame, salt): shimmer without a random generator.
function Get-Noise {
    param([long]$X, [long]$Y, [long]$T = 0, [long]$Salt = 0)
    $h = (($X * 73856093L) -bxor ($Y * 19349663L) -bxor ($T * 83492791L) -bxor ($Salt * 2654435761L)) % 1000003L
    if ($h -lt 0) { $h = -$h }
    return [int](($h * 7919L) % 256L)
}

# Ramps shared with the earlier sets: neutral steel (lit -> dark) and the state lamp (green M..P, red Q..S).
$SteelSpec = 'A=D3D3D3 B=B0B0B0 C=8E8E8E D=707070 E=565656 F=404040 G=2F2F2F H=222222 I=161616 J=0D0D0D'
$LampSpec = 'M=E2FFE4 N=62FF86 O=22C257 P=0C6B2E Q=FF5A48 R=B52D22 S=5E1511'
# The sample's radioactive glow, white-hot -> deep yellow-green. Its core rests on b, swells to a and ebbs to c; its top is a
# step dimmer and the light it casts beside it two (d), and the shimmer pushes those a step either way.
$SampleSpec = 'a=EFFFB0 b=C8F25A c=9AD63A d=6FA82A e=4C7A1E'

# ============================================================================================
#  HOT CELL - controller face (GT--'s radiation-proof machine casing)
#  the operating window (dark steel frame x3..12 y3..10 with the manipulator's sleeve at 8,3; lead glass x4..11 y4..9, amber
#  on its edges: lit on the top row and the left column, deep on the right column; the cell x5..10 y5..8 and its bench y9),
#  the manipulator (column 8) and the sample vial on the bench under it (8,7..8), the radiation sign (x3..5 y11..13) and the
#  four mode lamps (recess x7..13 y11..12, lamps at 7,12 9,12 11,12 13,12, lit lip y13)
# ============================================================================================
#   lead glass: f glint (top-left corner), g amber edge (lit), h amber edge (deep)
#   the cell (idle, lights off): w top, x body, k bench; (active, lit from the ceiling) r s t u top -> floor, m bench
#   tongs: T U V highlight / body / shade under the cell lights, Y W X the same with the lights off
#   sample, idle: o dull olive (its body), p dark olive (its top)
#   lamps: l off (lit: N)
#   radiation sign: y yellow (and the steel J for its marks)
$HcPal = New-Pal ($SteelSpec + ' ' + $LampSpec + ' ' + $SampleSpec + ' ' + @'
f=F6D07A g=D69A3A h=A8701E
w=45301A x=3A2712 k=241A10
r=8E6026 s=7C5220 t=6A461C u=5A3B18 m=3C2C1A
T=D6D0C2 U=A39D90 V=716B60
Y=8E897E W=6E695F X=4E4A43
o=6E7038 p=4E5030
l=1E4029
y=F2C230
'@)

# The static panel: bezel, the window frame with the manipulator's sleeve (H), the glass edges, the radiation sign, the lamp
# recess and its lit lip. 'x' marks the cell and 'k' the bench, 'l' the lamps: the frame code paints over them.
$HcBase = @(
    '................',
    '.CDDDDDDDDDDDDE.',
    '.DGGGGGGGGGGGGF.',
    '.DGDEEEEHEEEFGF.',
    '.DGEfgggggggFGF.',
    '.DGEgxxxxxxhFGF.',
    '.DGEgxxxxxxhFGF.',
    '.DGEgxxxxxxhFGF.',
    '.DGEgxxxxxxhFGF.',
    '.DGEgkkkkkkhFGF.',
    '.DGFFFFFFFFFHGF.',
    '.DGJyJGIIIIIIIF.',
    '.DGyJyGlIlIlIlF.',
    '.DGyJyGEEEEEEEF.',
    '.EFFFFFFFFFFFFG.',
    '................'
)
Assert-Map 'HcBase' $HcBase

$HcArmX = 8                                                 # the manipulator's column (under its sleeve), and the sample's
$HcTop = 4                                                  # the glass's top row (where the arm comes in)
$HcInX0 = 5; $HcInX1 = 10; $HcInY0 = 5; $HcInY1 = 8         # the cell seen through the glass
$HcBenchY = 9
$HcLamps = @(@(7, 12), @(9, 12), @(11, 12), @(13, 12))      # modes 1..4, left to right
# The working loop, one entry per frame: the row of the pincer's crossbar (4 = parked at the top), whether the pincer is
# closed and whether it holds the sample up. Down to the sample, close, lift it a pixel, set it down, open and rise: every
# step moves one pixel at most, frame 7 included (back to the top in frame 0).
$HcWrist = @(4, 5, 6, 6, 5, 5, 6, 5)
$HcShut = @($false, $false, $false, $true, $true, $true, $true, $false)
$HcLift = @($false, $false, $false, $false, $true, $true, $false, $false)
# The sample breathes (negative = brighter): one slow swell and ebb per loop.
$HcPulse = @(0, -1, -1, 0, 0, 1, 1, 0)
$HcBlink = 3                                                # lamp 4 blinks when the pincer closes

function New-HotCellFrame {
    param([bool]$Active, [int]$T = 0)
    $c = New-Canvas; $e = New-Canvas
    $P = $HcPal
    Write-Map $c 0 0 $HcBase $P
    $f = $T % 8
    $glow = 'abcde'

    # ---- the cell behind the glass: dark with the lights off; lit from the ceiling when working (warm, fading to the floor)
    $tones = if ($Active) { 'rstu' } else { 'wxxx' }
    for ($y = $HcInY0; $y -le $HcInY1; $y++) {
        for ($x = $HcInX0; $x -le $HcInX1; $x++) { Set-Px $c $x $y $P[[string]$tones[$y - $HcInY0]] }
    }
    for ($x = $HcInX0; $x -le $HcInX1; $x++) { Set-Px $c $x $HcBenchY $P[$(if ($Active) { 'm' } else { 'k' })] }

    $hi = $P[$(if ($Active) { 'T' } else { 'Y' })]
    $body = $P[$(if ($Active) { 'U' } else { 'W' })]
    $shade = $P[$(if ($Active) { 'V' } else { 'X' })]

    # ---- the manipulator: the arm down from its sleeve, the crossbar and the two fingers (spread when open, straight down when
    # closed)
    $w = if ($Active) { $HcWrist[$f] } else { $HcTop }
    $shut = $Active -and $HcShut[$f]
    $lift = $Active -and $HcLift[$f]
    for ($y = $HcTop; $y -lt $w; $y++) { Set-Px $c $HcArmX $y $body }
    Set-Px $c ($HcArmX - 1) $w $body; Set-Px $c $HcArmX $w $hi; Set-Px $c ($HcArmX + 1) $w $shade
    $jaw = if ($shut) { 1 } else { 2 }
    Set-Px $c ($HcArmX - $jaw) ($w + 1) $body; Set-Px $c ($HcArmX + $jaw) ($w + 1) $shade

    # ---- the sample: a vial two pixels tall on the bench, or held up in the pincer
    $vb = if ($lift) { $HcBenchY - 2 } else { $HcBenchY - 1 }        # its bottom pixel
    if ($Active) {
        # the core breathes with the loop (b; a at the swell, c at the ebb); its top and the light it casts on the cell beside its
        # foot breathe with it, one and two steps dimmer, and now and then shimmer a step up or down
        $core = 1 + $HcPulse[$f]
        Set-Both $c $e $HcArmX $vb $P[[string]$glow[$core]]
        # x, y, steps dimmer than the core, brightest tone allowed
        foreach ($g in @(@($HcArmX, ($vb - 1), 1, 1), @(($HcArmX - 1), $vb, 2, 2), @(($HcArmX + 1), $vb, 2, 2))) {
            $tone = $core + $g[2]
            $n = Get-Noise $g[0] $g[1] $T 53
            if ($n -lt 40) { $tone-- } elseif ($n -gt 215) { $tone++ }
            Set-Both $c $e $g[0] $g[1] $P[[string]$glow[(Get-ClampInt $tone $g[3] ($glow.Length - 1))]]
        }
    } else {
        Set-Px $c $HcArmX $vb $P['o']; Set-Px $c $HcArmX ($vb - 1) $P['p']
    }

    # ---- the mode lamps: mode 1 lit while working; lamp 4 blinks once a loop, when the pincer closes on the sample
    for ($k = 0; $k -lt $HcLamps.Count; $k++) {
        $lx = $HcLamps[$k][0]; $ly = $HcLamps[$k][1]
        if ($Active -and ($k -eq 0 -or ($k -eq 3 -and $f -eq $HcBlink))) { Set-Both $c $e $lx $ly $P['N'] }
        else { Set-Px $c $lx $ly $P['l'] }
    }

    Sync-Emissive $c $e
    return @{ Color = $c; Emi = $e }
}

# Where light may come from: the sample (on the bench or held up), the light it casts beside its foot and the four lamps (the
# check below holds the emissive layer to these pixels, so the glass, the cell, the tongs, the sign and the steel never glow).
$HcGlowZone = New-Object 'System.Collections.Generic.HashSet[int]'
foreach ($vy in @(($HcBenchY - 3), ($HcBenchY - 2), ($HcBenchY - 1))) { [void]$HcGlowZone.Add($vy * 16 + $HcArmX) }
foreach ($vy in @(($HcBenchY - 2), ($HcBenchY - 1))) {
    [void]$HcGlowZone.Add($vy * 16 + $HcArmX - 1); [void]$HcGlowZone.Add($vy * 16 + $HcArmX + 1)
}
foreach ($l in $HcLamps) { [void]$HcGlowZone.Add($l[1] * 16 + $l[0]) }

# ============================================================================================
#  BUILD
# ============================================================================================
$HcDir = 'block/multiblock/hot_cell'
$HcFrameTime = 4

function Out-Overlay {
    param([string]$Dir, $Builder, [int]$FrameTime)
    $frames = @(); $emis = @()
    for ($f = 0; $f -lt 8; $f++) { $r = & $Builder $true $f; $frames += $r.Color; $emis += $r.Emi }
    $idle = & $Builder $false 0
    Out-Tex $idle.Color "$Dir/overlay_front.png"
    Out-Tex (Join-Frames $frames) "$Dir/overlay_front_active.png" $FrameTime
    Out-Tex (Join-Frames $emis) "$Dir/overlay_front_active_emissive.png" $FrameTime
}

if (Test-Want 'hot_cell') { Out-Overlay $HcDir ${function:New-HotCellFrame} $HcFrameTime }

# ============================================================================================
#  VERIFY what was written: exact sizes (the idle face 16x16, the strips 16x128), binary alpha, no pure black, the .mcmeta
#  frametime, frames that really differ (each one from the next, the loop seam included, and at least 4 distinct), the empty
#  casing ring around a panel without holes, and an emissive layer inside the colour layer, lit in every frame and only on
#  the sample, its light and the lamps
# ============================================================================================
$problems = 0
foreach ($rel in $written) {
    $path = Join-Path $OutRoot ($rel -replace '/', '\')
    $msgs = @()
    if ($rel.EndsWith('.mcmeta')) {
        $ft = 0
        try { $ft = [int]((Get-Content -LiteralPath $path -Raw | ConvertFrom-Json).animation.frametime) } catch { $msgs += 'unreadable .mcmeta' }
        if ($ft -ne $HcFrameTime) { $msgs += "frametime $ft (expected $HcFrameTime)" }
        if ($msgs.Count -gt 0) { $problems++; Write-Warning "$rel : $($msgs -join '; ')" }
        continue
    }
    $img = Read-Png $path
    $nf = [int][Math]::Floor($img.H / 16)
    $strip = Test-Path -LiteralPath ($path + '.mcmeta')
    if ($img.W -ne 16 -or ($img.H % 16) -ne 0) { $msgs += "bad size $($img.W)x$($img.H)" }
    elseif ($strip -and $nf -ne 8) { $msgs += "animation is $($img.W)x$($img.H) (expected 16x128, 8 frames)" }
    elseif (-not $strip -and $nf -ne 1) { $msgs += "static face is $($img.W)x$($img.H) (expected 16x16)" }
    $opaque = 0; $black = 0; $partial = 0
    foreach ($px in $img.P) {
        $alpha = ($px -shr 24) -band 255
        if ($alpha -ne 0 -and $alpha -ne 255) { $partial++; continue }
        if ($alpha -eq 255) {
            $opaque++
            if (($px -band 0xFFFFFF) -eq 0) { $black++ }
        }
    }
    if ($partial -gt 0) { $msgs += "$partial partially transparent px" }
    if ($opaque -eq 0) { $msgs += 'fully transparent' }
    if ($black -gt 0) { $msgs += "$black pure-black px" }
    $emissive = $rel -like '*_emissive.png'
    if ($strip) {
        $keys = @(); for ($f = 0; $f -lt $nf; $f++) { $keys += (($img.P[($f * 256)..($f * 256 + 255)]) -join ',') }
        $distinct = @($keys | Select-Object -Unique).Count
        if ($distinct -lt 4) { $msgs += "only $distinct distinct frames out of $nf" }
        if (-not $emissive) {
            for ($f = 0; $f -lt $nf; $f++) { if ($keys[$f] -eq $keys[($f + 1) % $nf]) { $msgs += "frame $f repeats in frame $(($f + 1) % $nf)" } }
        }
    }
    # the casing's outer 1 px ring stays visible in every frame; inside it the colour layers are a whole panel
    $ring = 0; $holes = 0
    for ($f = 0; $f -lt $nf; $f++) { for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
        $on = (($img.P[($f * 16 + $y) * 16 + $x] -shr 24) -band 255) -ne 0
        if ($x -lt 1 -or $y -lt 1 -or $x -gt 14 -or $y -gt 14) { if ($on) { $ring++ } }
        elseif (-not $emissive -and -not $on) { $holes++ }
    } } }
    if ($ring -gt 0) { $msgs += "$ring opaque px in the casing ring" }
    if ($holes -gt 0) { $msgs += "$holes transparent px inside the panel" }
    # an emissive layer may only contain pixels that exist, identical, in the colour layer, only where light comes from, and
    # every frame has a glow
    if ($emissive) {
        $colorPath = Join-Path $OutRoot (($rel -replace '_emissive\.png$', '.png') -replace '/', '\')
        $color = Read-Png $colorPath
        if ($color.H -ne $img.H) { $msgs += 'emissive strip height differs from the colour strip' }
        else {
            $stray = 0; $outside = 0
            for ($i = 0; $i -lt $img.P.Length; $i++) {
                if ((($img.P[$i] -shr 24) -band 255) -eq 0) { continue }
                if ($img.P[$i] -ne $color.P[$i]) { $stray++ }
                if (-not $HcGlowZone.Contains($i % 256)) { $outside++ }
            }
            if ($stray -gt 0) { $msgs += "$stray emissive px not present in the colour layer" }
            if ($outside -gt 0) { $msgs += "$outside emissive px outside the sample, its light and the lamps" }
        }
        for ($f = 0; $f -lt $nf; $f++) {
            $lit = 0
            for ($i = $f * 256; $i -lt ($f + 1) * 256; $i++) { if ((($img.P[$i] -shr 24) -band 255) -ne 0) { $lit++ } }
            if ($lit -eq 0) { $msgs += "emissive frame $f is empty" }
        }
    }
    if ($msgs.Count -gt 0) { $problems++; Write-Warning "$rel : $($msgs -join '; ')" }
}

Write-Host "written $($written.Count) files under $OutRoot ($problems with warnings)"
foreach ($rel in $written) {
    $hash = (Get-FileHash -Algorithm SHA256 -LiteralPath (Join-Path $OutRoot ($rel -replace '/', '\'))).Hash.Substring(0, 16).ToLowerInvariant()
    Write-Host "  $rel  sha256:$hash"
}

if ($problems -gt 0) { throw "$problems file(s) failed the texture checks (see the warnings above)" }

if ($Credits) {
    Write-Host ''
    foreach ($rel in $written) {
        Write-Host ("| ``pack/kubejs/assets/grindless/textures/$rel`` | Generated with tools/assets/$ScriptName (procedural pixel art, original) by the hot cell agent, 2026-10-25 | the pack's licence (pending; proposed CC BY-SA 4.0) |")
    }
}
