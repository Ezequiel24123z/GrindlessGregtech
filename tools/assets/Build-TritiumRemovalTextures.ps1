<#
.SYNOPSIS
  Procedural 16x16 pixel art for the IV tritium removal facility's controller face of Gregtech Grindless (GregTech style:
  bevels, top-left light, every pixel fully opaque or fully transparent).

.DESCRIPTION
  Every pixel is drawn by this script (palettes + a char map + small routines); nothing is copied or edited from GregTech
  Modern or any other mod. Output is deterministic: re-running overwrites the same bytes (the frost's twinkle comes from
  Get-Noise, a hash of position and frame, not from a random generator). Same method, steel bezel and lamp ramp as the IV faces
  (Build-HotCellTextures.ps1, Build-HeavyWaterPlantTextures.ps1), whose helpers are copied so those scripts stay untouched, and
  the same checks: no frame repeats the next one, no hole inside the panel, and light only where the face has lights.

  Writes (under pack/kubejs/assets/grindless/textures/):
    block/multiblock/tritium_removal_facility/overlay_front.png, overlay_front_active.png(+.mcmeta),
    overlay_front_active_emissive.png(+.mcmeta)

  The face is the facility's mimic panel (gtceu:tritium_removal_facility), as on a control-room board: at the left the slim
  titanium catalytic exchange column, where the tritiated water's vapour meets the deuterium carrier; in the middle the frosted
  cold box, its window showing the cryogenic distillation column standing in a pool of pale blue liquid hydrogen isotopes; at the
  right the tritium storage bed, a titanium vessel with a sight glass where the stored tritium glows in GTM's tritium pink. A
  transfer line runs from the column into the cold box near its top, and the tritium line from the box's sump to the bed. Under
  the column, two lamps: run (green) and tritium (pink).
  8 frames, frametime 4: a bubble of vapour rises up the exchange column one pixel a frame; a cold pulse enters the cold box
  through the transfer line twice a loop; reflux drops fall down the distillation column into the pool and splash; a pink pulse
  runs along the tritium line into the bed, where the tritium breathes and brightens as the pulse lands; the frost on the cold
  box twinkles; the run lamp is lit and the tritium lamp blinks when the pulse lands. Idle: a dark cold box, a dull pool, the
  stored tritium dull and both lamps dark.

  The *_emissive layer only holds the stored tritium, the pulse on the tritium line and the lit lamps.

  Run from the repo root (PowerShell 5.1 blocks unsigned scripts by default; this bypass only affects that process):
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-TritiumRemovalTextures.ps1
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-TritiumRemovalTextures.ps1 -Only facility -Credits
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-TritiumRemovalTextures.ps1 -Preview C:\path\trf-preview.png

  Overlay conventions (GTM's workable casings, as every other set): transparent background, details only on the overlay,
  animated variants are vertical 16x(16*n) strips with a .png.mcmeta, *_emissive layers hold only the pixels that glow
  (identical to the colour layer). Every pixel is fully opaque or fully transparent and none is pure black. The outer 1 px
  ring is always left empty so the casing shows around the face. Drawn for gtceu:block/casings/solid/machine_casing_frost_proof
  (GTM's frost-proof machine casing, the facility's workableCasingModel); the face has its own dark frame, so it also reads on
  other casings. The final check fails the run (non-zero exit) if a written file breaks one of these rules.

.PARAMETER Only
  Subset of: facility (comma-separated, also as one string with -File). Default: everything.
.PARAMETER OutRoot
  Textures root. Default: <repo>/pack/kubejs/assets/grindless/textures
.PARAMETER Preview
  Also write a review sheet to this PNG, which must be outside the repository (it is never shipped). The sheet is x8, nearest
  neighbour. Rows: the face on a light frost-proof-casing stand-in (a flat plate with a soft bevel), idle, then every active
  frame with its emissive layer, then a dark-room view; the same on a dark grey stand-in; the emissive layer alone; and the raw
  colour layer on a checker. Last row: a 3x3 wall, idle and working, on both stand-ins, and the same walls at x2 and x1.
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

# `powershell -File ... -Only a,b` delivers "a,b" as one string: split it so both calling styles work.
$Only = @($Only | ForEach-Object { $_ -split '[,;\s]+' } | Where-Object { $_ })
$Known = @('facility')
foreach ($id in $Only) { if ($Known -notcontains $id) { throw "Unknown -Only id '$id' (expected: $($Known -join ', '))" } }

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
# The stored tritium's glow in GTM's tritium pink (its material colour FF316B), white-hot -> deep. The surface of the stored
# tritium rests on 2, the body on 3 and the bottom on 4; the breath and the landing pulse push them a step brighter or dimmer.
$TritiumSpec = '1=FFE3EC 2=FF9FBD 3=FF5285 4=D42D5E 5=8F1B3F'

# ============================================================================================
#  TRITIUM REMOVAL FACILITY - controller face (GTM's frost-proof machine casing)
#  the exchange column (x3..4: cap y3, body y4..11, foot y12), the transfer line (5,5), the cold box (x6..10 y3..11: frosted shell,
#  window x7..9 y4..10 with the distillation column at x8 and the pool on y9..10), the tritium line (11,9), the storage bed
#  (x12..13: cap y4, sight glass y5..10 with the stored tritium on y8..10, foot y11) and the two lamps (run 3,13; tritium 5,13)
# ============================================================================================
#   exchange column (titanium): k cap lit, j cap shade, t body lit, u body shade, e feet (also the bed's)
#   lines: o (the transfer line and the tritium line)
#   cold box (frosted shell): a top highlight, b lit side, c top right, d shade, f bottom; y a frost sparkle
#   cold box window: w interior, x the distillation column, q the pool (the only letters that change between idle and working:
#   dark when idle, lit when working)
#   vapour bubble: h head, i tail; reflux drop and splash: v
#   storage bed: g empty sight glass, p the stored tritium when idle (dull); working, it glows (1..5)
#   lamps: n run off (lit: N), m tritium off (lit: 2)
$TrCommonSpec = @'
k=D9DEE4 j=A9B1BB t=B6BEC8 u=7D8691 e=545D68
o=98A1AC
a=E6F3FC b=C6DCEC c=9FBACF d=7896AE f=5A768D y=F8FCFF
h=C8F8FF i=82D9EA v=E3F6FF
g=3A3442 p=6B3A4A
n=1E4029 m=4A1E2A
'@
$TrWorkSpec = @'
w=23405C x=8C9AA8 q=8ED3FF
'@
$TrIdleSpec = @'
w=18263A x=4E5B68 q=3D6D8F
'@
$TrPalOn = New-Pal ($SteelSpec + ' ' + $LampSpec + ' ' + $TritiumSpec + ' ' + $TrCommonSpec + ' ' + $TrWorkSpec)
$TrPalOff = New-Pal ($SteelSpec + ' ' + $LampSpec + ' ' + $TritiumSpec + ' ' + $TrCommonSpec + ' ' + $TrIdleSpec)

# The static panel: bezel, the exchange column, the transfer line, the cold box with its window and pool, the tritium line, the
# storage bed with its empty sight glass and the two lamps (off). The frame code paints the stored tritium and what moves.
$TrBase = @(
    '................',
    '.CDDDDDDDDDDDDE.',
    '.DGGGGGGGGGGGGF.',
    '.DGkjGabbbcGGGF.',
    '.DGtuGbwxwdGkjF.',
    '.DGtuobwxwdGggF.',
    '.DGtuGbwxwdGggF.',
    '.DGtuGbwxwdGggF.',
    '.DGtuGbwxwdGggF.',
    '.DGtuGbqqqdoggF.',
    '.DGtuGbqqqdGggF.',
    '.DGtuGdffffGeeF.',
    '.DGeeGGGGGGGGGF.',
    '.DGnGmGGGGGGGGF.',
    '.EFFFFFFFFFFFFG.',
    '................'
)
Assert-Map 'TrBase' $TrBase

$TrBubbleX = 3; $TrBubbleY0 = 4; $TrBubbleY1 = 11            # the column's lit side, where the vapour rises (top, bottom)
$TrTransfer = @(5, 5)                                       # the transfer line into the cold box
$TrDropX = 9                                                # the reflux drops fall down the right of the distillation column
$TrPoolTop = 9                                              # the pool's surface row
$TrLine = @(11, 9)                                          # the tritium line from the sump to the bed
$TrBedX0 = 12; $TrBedX1 = 13; $TrFillY0 = 8; $TrFillY1 = 10 # the stored tritium in the sight glass
$TrRunLamp = @(3, 13); $TrTritiumLamp = @(5, 13)
# The cold pulse enters the box at frames 0 and 4; a drop falls every four frames (rows 5..8) and splashes as the next forms;
# the tritium pulse runs on the line at frames 2 and 6 and lands in the bed at 3 and 7.
$TrTransferFrames = @(0, 4)
$TrLineFrames = @(2, 6)
$TrLandFrames = @(3, 7)
# The stored tritium breathes (negative = brighter): one slow swell and ebb per loop, plus the landing pulse.
$TrPulse = @(0, 0, 1, -1, 0, 1, 0, -1)

# the frosted shell's lit pixels, where the frost may twinkle (top row and the lit side)
$TrFrost = @()
for ($x = 6; $x -le 10; $x++) { $TrFrost += , @($x, 3) }
for ($y = 4; $y -le 10; $y++) { $TrFrost += , @(6, $y) }

function New-TritiumRemovalFrame {
    param([bool]$Active, [int]$T = 0)
    $c = New-Canvas; $e = New-Canvas
    $P = if ($Active) { $TrPalOn } else { $TrPalOff }
    Write-Map $c 0 0 $TrBase $P
    if (-not $Active) {
        # idle: the stored tritium sits dull in its sight glass; nothing moves and nothing glows
        for ($y = $TrFillY0; $y -le $TrFillY1; $y++) { for ($x = $TrBedX0; $x -le $TrBedX1; $x++) { Set-Px $c $x $y $P['p'] } }
        return @{ Color = $c; Emi = $e }
    }
    $f = $T % 8
    $glow = '12345'

    # ---- the exchange column: a vapour bubble rises one pixel a frame up its lit side (bottom to top in eight frames), its tail
    # under it
    $by = $TrBubbleY1 - $f
    Set-Px $c $TrBubbleX $by $P['h']
    if ($by + 1 -le $TrBubbleY1) { Set-Px $c $TrBubbleX ($by + 1) $P['i'] }

    # ---- the transfer line: the carrier enters the cold box twice a loop
    if ($TrTransferFrames -contains $f) { Set-Px $c $TrTransfer[0] $TrTransfer[1] $P['h'] }

    # ---- the cold box: a reflux drop falls down the distillation column (rows 5..8, a new one every four frames) and splashes on
    # the pool's surface as the next one forms
    $dy = 5 + ($f % 4)
    Set-Px $c $TrDropX $dy $P['v']
    if (($f % 4) -eq 0) { Set-Px $c $TrDropX $TrPoolTop $P['v'] }

    # ---- the frost twinkles: at most one sparkle a frame on the shell's lit pixels
    $n = Get-Noise $f 7 $T 41
    $spark = $TrFrost[$n % $TrFrost.Count]
    if ($n -lt 200) { Set-Px $c $spark[0] $spark[1] $P['y'] }

    # ---- the tritium line: a pink pulse runs to the bed twice a loop
    if ($TrLineFrames -contains $f) { Set-Both $c $e $TrLine[0] $TrLine[1] $P['2'] }

    # ---- the stored tritium: the surface a step brighter than the body, the bottom a step dimmer, the far column of the glass a
    # step dimmer than the near one; it breathes, and brightens a step when the pulse lands
    $land = $TrLandFrames -contains $f
    for ($y = $TrFillY0; $y -le $TrFillY1; $y++) {
        for ($x = $TrBedX0; $x -le $TrBedX1; $x++) {
            $tone = 1 + ($y - $TrFillY0) + ($x - $TrBedX0) + $TrPulse[$f]
            if ($land -and $y -eq $TrFillY0) { $tone-- }
            Set-Both $c $e $x $y $P[[string]$glow[(Get-ClampInt $tone 0 ($glow.Length - 1))]]
        }
    }

    # ---- the lamps: run lit while working; the tritium lamp blinks when the pulse lands
    Set-Both $c $e $TrRunLamp[0] $TrRunLamp[1] $P['N']
    if ($land) { Set-Both $c $e $TrTritiumLamp[0] $TrTritiumLamp[1] $P['2'] }

    Sync-Emissive $c $e
    return @{ Color = $c; Emi = $e }
}

# Where light may come from: the stored tritium, the pulse on the tritium line and the two lamps (the check below holds the
# emissive layer to these pixels, so the cold box, the columns, the frost and the steel never glow).
$TrGlowZone = New-Object 'System.Collections.Generic.HashSet[int]'
for ($y = $TrFillY0; $y -le $TrFillY1; $y++) { for ($x = $TrBedX0; $x -le $TrBedX1; $x++) { [void]$TrGlowZone.Add($y * 16 + $x) } }
[void]$TrGlowZone.Add($TrLine[1] * 16 + $TrLine[0])
foreach ($l in @($TrRunLamp, $TrTritiumLamp)) { [void]$TrGlowZone.Add($l[1] * 16 + $l[0]) }

# ============================================================================================
#  BUILD
# ============================================================================================
$TrDir = 'block/multiblock/tritium_removal_facility'
$TrFrameTime = 4

function Out-Overlay {
    param([string]$Dir, $Builder, [int]$FrameTime)
    $frames = @(); $emis = @()
    for ($f = 0; $f -lt 8; $f++) { $r = & $Builder $true $f; $frames += $r.Color; $emis += $r.Emi }
    $idle = & $Builder $false 0
    Out-Tex $idle.Color "$Dir/overlay_front.png"
    Out-Tex (Join-Frames $frames) "$Dir/overlay_front_active.png" $FrameTime
    Out-Tex (Join-Frames $emis) "$Dir/overlay_front_active_emissive.png" $FrameTime
}

if (Test-Want 'facility') { Out-Overlay $TrDir ${function:New-TritiumRemovalFrame} $TrFrameTime }

# ============================================================================================
#  VERIFY what was written: exact sizes (the idle face 16x16, the strips 16x128), binary alpha, no pure black, the .mcmeta
#  frametime, frames that really differ (each one from the next, the loop seam included, and at least 4 distinct), the empty
#  casing ring around a panel without holes, and an emissive layer inside the colour layer, lit in every frame and only on
#  the stored tritium, the tritium line and the lamps
# ============================================================================================
$problems = 0
foreach ($rel in $written) {
    $path = Join-Path $OutRoot ($rel -replace '/', '\')
    $msgs = @()
    if ($rel.EndsWith('.mcmeta')) {
        $ft = 0
        try { $ft = [int]((Get-Content -LiteralPath $path -Raw | ConvertFrom-Json).animation.frametime) } catch { $msgs += 'unreadable .mcmeta' }
        if ($ft -ne $TrFrameTime) { $msgs += "frametime $ft (expected $TrFrameTime)" }
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
                if (-not $TrGlowZone.Contains($i % 256)) { $outside++ }
            }
            if ($stray -gt 0) { $msgs += "$stray emissive px not present in the colour layer" }
            if ($outside -gt 0) { $msgs += "$outside emissive px outside the stored tritium, the tritium line and the lamps" }
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

# ============================================================================================
#  PREVIEW (optional, never shipped)
# ============================================================================================
if ($Preview -and $written.Count -gt 0) {
    # a flat plate with a soft bevel (lit top and left edges, shaded bottom and right): the stand-in casings
    function New-StandInPlate {
        param([string]$Spec)
        $pal = New-Pal $Spec
        $c = New-Canvas
        for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
            $ch = 'c'
            if ($x -eq 0 -or $y -eq 0) { $ch = 'a' }
            elseif ($x -eq 15 -or $y -eq 15) { $ch = 'e' }
            elseif ($x -eq 1 -or $y -eq 1) { $ch = 'b' }
            elseif ($x -eq 14 -or $y -eq 14) { $ch = 'd' }
            $c.P[$y * 16 + $x] = $pal[$ch]
        } }
        return $c
    }
    function Get-Frame { param($Strip, [int]$Index) $f = New-Canvas 16 16; [Array]::Copy($Strip.P, $Index * 256, $f.P, 0, 256); return $f }
    function Merge-On { param($Dst, $Src) $o = Copy-Canvas $Dst; Merge-Canvas $o $Src; return $o }
    function Get-Dimmed { param($C, [double]$K) $o = Copy-Canvas $C; for ($i = 0; $i -lt $o.P.Length; $i++) { if ($o.P[$i] -ne 0) { $o.P[$i] = Shade $o.P[$i] $K } }; return $o }
    # the casing and the colour layer at a quarter of their light, the emissive layer at full light: a dark room
    function Get-Dark { param($Base, $Col, $Emi) return (Merge-On (Get-Dimmed (Merge-On $Base $Col) 0.25) $Emi) }
    # a 3x3 wall of casing with the controller on the middle block
    function New-Wall {
        param($Casing, $Face)
        $w = New-Canvas 48 48
        for ($j = 0; $j -lt 3; $j++) { for ($i = 0; $i -lt 3; $i++) { Merge-Canvas $w $Casing (16 * $i) (16 * $j) } }
        Merge-Canvas $w $Face 16 16
        return $w
    }
    # paints a canvas into the sheet, each pixel as a Scale x Scale square
    function Add-Blit {
        param($Sheet, $Tex, [int]$X0, [int]$Y0, [int]$Scale)
        $row = New-Object 'int[]' $Scale
        for ($y = 0; $y -lt $Tex.H; $y++) { for ($x = 0; $x -lt $Tex.W; $x++) {
            $v = $Tex.P[$y * $Tex.W + $x]
            if (($v -band 0xFF000000) -eq 0) { continue }
            for ($s = 0; $s -lt $Scale; $s++) { $row[$s] = $v }
            for ($s = 0; $s -lt $Scale; $s++) { [Array]::Copy($row, 0, $Sheet.P, ($Y0 + $y * $Scale + $s) * $Sheet.W + $X0 + $x * $Scale, $Scale) }
        } }
    }

    $frost = New-StandInPlate 'a=E4EEF4 b=D4E1EA c=C6D4DE d=A9BAC6 e=8C9EAB'
    $darkPlate = New-StandInPlate 'a=4C4C4C b=444444 c=3B3B3B d=2D2D2D e=1F1F1F'
    $checker = New-Canvas
    for ($i = 0; $i -lt 256; $i++) { $checker.P[$i] = if (((($i % 16) + [int][Math]::Floor($i / 16)) % 2) -eq 0) { Hex '3C4048' } else { Hex '4A4F58' } }
    $night = New-Canvas
    for ($i = 0; $i -lt 256; $i++) { $night.P[$i] = Hex '0A0B0D' }

    $dir = Join-Path $OutRoot ($TrDir -replace '/', '\')
    $idle = Read-Png (Join-Path $dir 'overlay_front.png')
    $act = Read-Png (Join-Path $dir 'overlay_front_active.png')
    $emi = Read-Png (Join-Path $dir 'overlay_front_active_emissive.png')
    $lit = @(); for ($f = 0; $f -lt 8; $f++) { $lit += (Merge-On (Get-Frame $act $f) (Get-Frame $emi $f)) }

    $k = 8; $gap = 16; $cell = 16 * $k + $gap
    $rows = 4
    $wallW = 48 * $k + $gap
    $sheet = New-Canvas ($gap + 10 * $cell) ($gap + $rows * $cell + 48 * $k + $gap)
    $bgRow = New-Object 'int[]' $sheet.W
    $bg = Hex '1E2126'
    for ($i = 0; $i -lt $sheet.W; $i++) { $bgRow[$i] = $bg }
    for ($y = 0; $y -lt $sheet.H; $y++) { [Array]::Copy($bgRow, 0, $sheet.P, $y * $sheet.W, $sheet.W) }

    # rows 1-2: idle, the 8 working frames and a dark room, on the light and the dark stand-in; row 3: the emissive layer alone;
    # row 4: the raw colour layer (idle and frames) on a checker, so the empty ring shows
    $r = 0
    foreach ($cs in @($frost, $darkPlate)) {
        $y0 = $gap + $r * $cell
        Add-Blit $sheet (Merge-On $cs $idle) $gap $y0 $k
        for ($f = 0; $f -lt 8; $f++) { Add-Blit $sheet (Merge-On $cs $lit[$f]) ($gap + (1 + $f) * $cell) $y0 $k }
        Add-Blit $sheet (Get-Dark $cs (Get-Frame $act 0) (Get-Frame $emi 0)) ($gap + 9 * $cell) $y0 $k
        $r++
    }
    $y0 = $gap + 2 * $cell
    for ($f = 0; $f -lt 8; $f++) { Add-Blit $sheet (Merge-On $night (Get-Frame $emi $f)) ($gap + (1 + $f) * $cell) $y0 $k }
    $y0 = $gap + 3 * $cell
    Add-Blit $sheet (Merge-On $checker $idle) $gap $y0 $k
    for ($f = 0; $f -lt 8; $f++) { Add-Blit $sheet (Merge-On $checker (Get-Frame $act $f)) ($gap + (1 + $f) * $cell) $y0 $k }

    # row 5: a 3x3 wall idle and working on the light stand-in at x8, then the same walls on both stand-ins at x2 and x1
    $wy = $gap + $rows * $cell
    Add-Blit $sheet (New-Wall $frost $idle) $gap $wy $k
    Add-Blit $sheet (New-Wall $frost $lit[0]) ($gap + $wallW) $wy $k
    $sx = $gap + 2 * $wallW
    $sc = 0
    foreach ($cs in @($frost, $darkPlate)) {
        Add-Blit $sheet (New-Wall $cs $idle) ($sx + $sc * (2 * 96 + 2 * $gap)) $wy 2
        Add-Blit $sheet (New-Wall $cs $lit[0]) ($sx + $sc * (2 * 96 + 2 * $gap) + 96 + $gap) $wy 2
        Add-Blit $sheet (New-Wall $cs $idle) ($sx + $sc * (2 * 96 + 2 * $gap)) ($wy + 96 + $gap) 1
        Add-Blit $sheet (New-Wall $cs $lit[0]) ($sx + $sc * (2 * 96 + 2 * $gap) + 96 + $gap) ($wy + 96 + $gap) 1
        $sc++
    }

    $pdir = Split-Path -Parent $Preview
    if ($pdir -and -not (Test-Path -LiteralPath $pdir)) { New-Item -ItemType Directory -Force -Path $pdir | Out-Null }
    $bmp = ConvertTo-Bitmap $sheet
    try { $bmp.Save($Preview, [System.Drawing.Imaging.ImageFormat]::Png) } finally { $bmp.Dispose() }
    Write-Host "preview: $Preview (x$k; on a light and a dark frost-proof-casing stand-in: idle, 8 working frames, dark room; the emissive layer alone; the raw layer on a checker; 3x3 walls at x8, x2 and x1)"
}

if ($problems -gt 0) { throw "$problems file(s) failed the texture checks (see the warnings above)" }

if ($Credits) {
    Write-Host ''
    foreach ($rel in $written) {
        Write-Host ("| ``pack/kubejs/assets/grindless/textures/$rel`` | Generated with tools/assets/$ScriptName (procedural pixel art, original) by the tritium removal facility agent, 2026-10-25 | the pack's licence (pending; proposed CC BY-SA 4.0) |")
    }
}
