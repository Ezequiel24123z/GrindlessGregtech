<#
.SYNOPSIS
  Procedural 16x16 pixel art for the IV fission reactor's controller face of Gregtech Grindless (GregTech style: bevels,
  top-left light, every pixel fully opaque or fully transparent).

.DESCRIPTION
  Every pixel is drawn by this script (palettes + a char map + small routines); nothing is copied or edited from GregTech
  Modern or any other mod. Output is deterministic: re-running overwrites the same bytes (the shimmer comes from Get-Noise, a
  hash of position and frame, not from a random generator). Same method, steel bezel and lamp ramp as the EV faces
  (Build-CombinedCycleHotMillTextures.ps1, Build-ExtractionCascadeTextures.ps1), whose helpers are copied so those scripts stay
  untouched, and their checks plus three: no frame repeats the next one, no hole inside the panel, and light only where the
  face has lights. IV's accent is blue (GTM's colour for the tier): on this face it is the Cherenkov glow.

  Writes (under pack/kubejs/assets/grindless/textures/):
    block/multiblock/fission_reactor/overlay_front.png, overlay_front_active.png(+.mcmeta), overlay_front_active_emissive.png(+.mcmeta)

  The face is the reactor's control panel (gtceu:fission_reactor): a round viewing port into the pool at the top left, where
  the tops of the four fuel channels stand in the water; the core map at the top right, a dark mimic with one lamp per channel
  in a 2x2 grid; the power bar under the port; the red SCRAM button at the bottom right; and the base strip with yellow and
  black radiation stripes. 8 frames, frametime 4: the Cherenkov glow breathes and shimmers around the channel tops while a
  brighter ring runs out from the centre every four frames, the four channel lamps are lit green (channel 4 flickers once a
  loop), and the power bar follows the glow one cell up and down. The SCRAM button is never lit. Idle: dark water with the
  grey channel tops, four dark lamps and an empty bar.

  The *_emissive layer only holds the Cherenkov glow, the lit channel lamps and the lit cells of the power bar.

  Run from the repo root (PowerShell 5.1 blocks unsigned scripts by default; this bypass only affects that process):
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-FissionReactorTextures.ps1
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-FissionReactorTextures.ps1 -Only reactor -Credits

  Overlay conventions (GTM's workable casings, as every other set): transparent background, details only on the overlay,
  animated variants are vertical 16x(16*n) strips with a .png.mcmeta, *_emissive layers hold only the pixels that glow
  (identical to the colour layer). Every pixel is fully opaque or fully transparent and none is pure black. The outer 1 px
  ring is always left empty so the casing shows around the face. Drawn for
  gtceu:block/casings/solid/machine_casing_robust_tungstensteel (the reactor's workableCasingModel); the face has its own
  dark frame, so it also reads on other casings. The final check fails the run (non-zero exit) if a written file breaks one
  of these rules.

.PARAMETER Only
  Subset of: reactor (fission_reactor; comma-separated, also as one string with -File). Default: everything.
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
$Known = @('reactor')
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
# IV accent (GTM writes IV in blue): the Cherenkov blue, white-hot -> deep. The glow rests on c..f; the breathing and the
# shimmer push it between b and g, and a only shows at a rare peak.
$CherenkovSpec = 'a=EAFAFF b=BDEBFF c=8FD8FF d=63C2FF e=3FA9FF f=2C86E6 g=2164C2'

# ============================================================================================
#  FISSION REACTOR - controller face (robust tungstensteel casing)
#  viewing port (rim x3..9 y3..9, glass x4..8 y4..8 without its corners, centre 6,6; the four channel tops at 5,5 7,5 5,7 7,7),
#  core map (dark recess x11..13 y3..7, lamps at 11,4 13,4 11,6 13,6, lit lip y8), power bar (plate x3..8 y10..12, cells
#  x4..7 y11), SCRAM button (x10..13 y9..12) and the radiation stripes on the base strip (y13, x3..13)
# ============================================================================================
#   pool water (idle): i lit, j body, k deep (k is also an unlit cell of the power bar); w glint on the glass
#   channel tops: u idle (grey), v active (dark against the glow)
#   lamps: l off (lit: N, flicker: O)
#   SCRAM button, never lit: p highlight, q body, r shade, s deep
#   radiation stripes: y yellow (and the steel J for the black)
$FrPal = New-Pal ($SteelSpec + ' ' + $LampSpec + ' ' + $CherenkovSpec + ' ' + @'
i=163A6B j=0E2142 k=0A1731 w=5A7EA8
u=56637A v=1D2A40
l=1E4029
p=C8463A q=962A22 r=6A1C17 s=42110E
y=F2C230
'@)

# The static panel: bezel, the port's steel ring, the map recess and its lip, the bar plate, the SCRAM button and the stripes.
# 'k' marks the glass and the bar cells and 'l' the lamps: the frame code paints over them.
$FrBase = @(
    '................',
    '.CDDDDDDDDDDDDE.',
    '.DGGGGGGGGGGGGF.',
    '.DGGGBBCGGGIIIF.',
    '.DGGBkkkDGGlIlF.',
    '.DGBkkkkkDGIIIF.',
    '.DGCkkkkkEGlIlF.',
    '.DGCkkkkkFGIIIF.',
    '.DGGDkkkFGGEEEF.',
    '.DGGGEFFGGGpqGF.',
    '.DGCDDDDEGpqqrF.',
    '.DGDkkkkFGqqrsF.',
    '.DGEFFFFGGGrsGF.',
    '.DGJyyJJyyJJyyF.',
    '.EFFFFFFFFFFFFG.',
    '................'
)
Assert-Map 'FrBase' $FrBase

$FrCx = 6; $FrCy = 6                                        # centre of the port
$FrLamps = @(@(11, 4), @(13, 4), @(11, 6), @(13, 6))        # channels 1..4, in reading order
$FrBarX = 4; $FrBarY = 11; $FrBarCells = 4
# The pool breathes (negative = brighter): one slow swell and ebb per loop. The power bar follows it.
$FrPulse = @(0, -1, -1, 0, 0, 1, 1, 0)
# Idle water: the glass catches a little light at its top left and sinks into the deep at its bottom right.
$FrIdleGlass = @{ '5,4' = 'w'; '4,5' = 'w'; '6,4' = 'i'; '4,6' = 'i'; '8,7' = 'k'; '7,8' = 'k'; '6,8' = 'k' }

# The glass pixels of the port: a 5x5 square around the centre without its corners. Each one keeps its ring (Manhattan
# distance to the centre): 0 centre, 1 arms, 2 the middles of the edge, 3 the rest of the edge. The channel tops sit at the
# four diagonals (ring 2 with both offsets 1).
$FrGlass = New-Object System.Collections.Generic.List[object]
for ($dy = -2; $dy -le 2; $dy++) { for ($dx = -2; $dx -le 2; $dx++) {
    if ([Math]::Abs($dx) -eq 2 -and [Math]::Abs($dy) -eq 2) { continue }
    $FrGlass.Add([pscustomobject]@{
        X = $FrCx + $dx; Y = $FrCy + $dy
        Ring = [Math]::Abs($dx) + [Math]::Abs($dy)
        Fuel = ([Math]::Abs($dx) -eq 1 -and [Math]::Abs($dy) -eq 1)
    })
} }

function New-FissionFrame {
    param([bool]$Active, [int]$T = 0)
    $c = New-Canvas; $e = New-Canvas
    $P = $FrPal
    Write-Map $c 0 0 $FrBase $P
    $glow = 'abcdefg'

    # ---- the port: the four channel tops in the pool
    foreach ($g in $FrGlass) {
        if ($g.Fuel) { Set-Px $c $g.X $g.Y $P[$(if ($Active) { 'v' } else { 'u' })]; continue }
        if ($Active) {
            # Cherenkov glow: brightest between the channel tops (c), fading to the rim (f); the whole pool breathes, a brighter
            # ring runs out from the centre every four frames and a few pixels shimmer a step up or down
            $tone = $g.Ring + 2 + $FrPulse[$T % 8]
            if ($g.Ring -eq ($T % 4)) { $tone-- }
            $n = Get-Noise $g.X $g.Y $T 41
            if ($n -lt 36) { $tone-- } elseif ($n -gt 219) { $tone++ }
            Set-Both $c $e $g.X $g.Y $P[[string]$glow[(Get-ClampInt $tone 0 ($glow.Length - 1))]]
        } else {
            $key = "$($g.X),$($g.Y)"
            Set-Px $c $g.X $g.Y $P[$(if ($FrIdleGlass.ContainsKey($key)) { $FrIdleGlass[$key] } else { 'j' })]
        }
    }

    # ---- the core map: one lamp per channel, green while it burns; channel 4 dips for one frame a loop
    for ($k = 0; $k -lt $FrLamps.Count; $k++) {
        $lx = $FrLamps[$k][0]; $ly = $FrLamps[$k][1]
        if ($Active) {
            $ch = if ($k -eq 3 -and ($T % 8) -eq 5) { 'O' } else { 'N' }
            Set-Both $c $e $lx $ly $P[$ch]
        } else { Set-Px $c $lx $ly $P['l'] }
    }

    # ---- the power bar: lit cells from the left with a bright head, following the pool's breath (2 to 4 cells of 4)
    $level = if ($Active) { 3 - $FrPulse[$T % 8] } else { 0 }
    for ($i = 0; $i -lt $FrBarCells; $i++) {
        $x = $FrBarX + $i
        if ($i -lt $level) { Set-Both $c $e $x $FrBarY $P[$(if ($i -eq $level - 1) { 'c' } else { 'e' })] }
        else { Set-Px $c $x $FrBarY $P['k'] }
    }

    Sync-Emissive $c $e
    return @{ Color = $c; Emi = $e }
}

# Where light may come from: the glow of the port, the four lamps and the bar cells (the check below holds the emissive layer
# to these pixels, so the SCRAM button, the stripes and the steel can never glow).
$FrGlowZone = New-Object 'System.Collections.Generic.HashSet[int]'
foreach ($g in $FrGlass) { if (-not $g.Fuel) { [void]$FrGlowZone.Add($g.Y * 16 + $g.X) } }
foreach ($l in $FrLamps) { [void]$FrGlowZone.Add($l[1] * 16 + $l[0]) }
for ($i = 0; $i -lt $FrBarCells; $i++) { [void]$FrGlowZone.Add($FrBarY * 16 + $FrBarX + $i) }

# ============================================================================================
#  BUILD
# ============================================================================================
$FrDir = 'block/multiblock/fission_reactor'
$FrFrameTime = 4

function Out-Overlay {
    param([string]$Dir, $Builder, [int]$FrameTime)
    $frames = @(); $emis = @()
    for ($f = 0; $f -lt 8; $f++) { $r = & $Builder $true $f; $frames += $r.Color; $emis += $r.Emi }
    $idle = & $Builder $false 0
    Out-Tex $idle.Color "$Dir/overlay_front.png"
    Out-Tex (Join-Frames $frames) "$Dir/overlay_front_active.png" $FrameTime
    Out-Tex (Join-Frames $emis) "$Dir/overlay_front_active_emissive.png" $FrameTime
}

if (Test-Want 'reactor') { Out-Overlay $FrDir ${function:New-FissionFrame} $FrFrameTime }

# ============================================================================================
#  VERIFY what was written: exact sizes (the idle face 16x16, the strips 16x128), binary alpha, no pure black, the .mcmeta
#  frametime, frames that really differ (each one from the next, the loop seam included, and at least 4 distinct), the empty
#  casing ring around a panel without holes, and an emissive layer inside the colour layer, lit in every frame and only on
#  the glow, the lamps and the bar
# ============================================================================================
$problems = 0
foreach ($rel in $written) {
    $path = Join-Path $OutRoot ($rel -replace '/', '\')
    $msgs = @()
    if ($rel.EndsWith('.mcmeta')) {
        $ft = 0
        try { $ft = [int]((Get-Content -LiteralPath $path -Raw | ConvertFrom-Json).animation.frametime) } catch { $msgs += 'unreadable .mcmeta' }
        if ($ft -ne $FrFrameTime) { $msgs += "frametime $ft (expected $FrFrameTime)" }
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
                if (-not $FrGlowZone.Contains($i % 256)) { $outside++ }
            }
            if ($stray -gt 0) { $msgs += "$stray emissive px not present in the colour layer" }
            if ($outside -gt 0) { $msgs += "$outside emissive px outside the glow, the lamps and the bar" }
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
        Write-Host ("| ``pack/kubejs/assets/grindless/textures/$rel`` | Generated with tools/assets/$ScriptName (procedural pixel art, original) by the fission reactor agent, 2026-10-25 | the pack's licence (pending; proposed CC BY-SA 4.0) |")
    }
}
