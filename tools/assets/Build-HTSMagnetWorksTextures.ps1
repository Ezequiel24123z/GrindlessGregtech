<#
.SYNOPSIS
  Procedural 16x16 pixel art for the LuV HTS magnet works' controller face of Gregtech Grindless (GregTech style: bevels,
  top-left light, every pixel fully opaque or fully transparent).

.DESCRIPTION
  Every pixel is drawn by this script (palettes + a char map + small routines); nothing is copied or edited from GregTech
  Modern or any other mod. Output is deterministic: re-running overwrites the same bytes (the frost's glint comes from
  Get-Noise, a hash of position and frame, not from a random generator). Same method, steel bezel and lamp ramp as the IV faces
  (Build-TritiumRemovalTextures.ps1, Build-HeavyWaterPlantTextures.ps1), whose helpers are copied so those scripts stay
  untouched, and the same checks: no frame repeats the next one, no hole inside the panel, and light only where the face has
  lights.

  Writes (under pack/kubejs/assets/grindless/textures/):
    block/multiblock/hts_magnet_works/overlay_front.png, overlay_front_active.png(+.mcmeta),
    overlay_front_active_emissive.png(+.mcmeta)

  The face is the works' magnet seen end-on (gtceu:hts_magnet_works): a racetrack coil of copper-gold HTS tape on the dark
  steel board, two tape turns lit from the top left with the turn between them in between, wound round a small dark bore.
  Under the coil, two lamps: run (green) and quench (red, the quench detector).
  8 frames, frametime 4: the field is on. The middle turn glows in LuV light purple, with two brighter pulses of current
  running round it clockwise; the bore glows cold cyan and breathes; frost glints on the outer turn (the liquid-helium cold
  test); the run lamp is lit. The quench lamp never lights: a quench would be a failed test. Idle: the coil cold and dark
  between its turns, the bore dark and both lamps dark.

  The *_emissive layer only holds the middle turn, the bore and the run lamp.

  Run from the repo root (PowerShell 5.1 blocks unsigned scripts by default; this bypass only affects that process):
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-HTSMagnetWorksTextures.ps1
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-HTSMagnetWorksTextures.ps1 -Only magnet_works -Credits
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-HTSMagnetWorksTextures.ps1 -Preview C:\path\hts-preview.png

  Overlay conventions (GTM's workable casings, as every other set): transparent background, details only on the overlay,
  animated variants are vertical 16x(16*n) strips with a .png.mcmeta, *_emissive layers hold only the pixels that glow
  (identical to the colour layer). Every pixel is fully opaque or fully transparent and none is pure black. The outer 1 px
  ring is always left empty so the casing shows around the face. Drawn for gtceu:block/casings/solid/machine_casing_frost_proof
  (GTM's frost-proof machine casing, the works' workableCasingModel); the face has its own dark frame, so it also reads on
  other casings. The final check fails the run (non-zero exit) if a written file breaks one of these rules.

.PARAMETER Only
  Subset of: magnet_works (comma-separated, also as one string with -File). Default: everything.
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
$Known = @('magnet_works')
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
# The field's glow in LuV light purple (the tier's colour, Minecraft's light purple FF55FF), white-hot -> deep. The middle turn
# rests on 3 on its lit sides (top, left) and on 4 on its shaded sides; a pulse of current lifts it two steps, its edges one.
$FieldSpec = '1=FCEBFF 2=F2B9FF 3=DE86FB 4=B95DE3 5=8340B0'
# The bore's cold cyan (the liquid-helium cold test), white -> deep. Each bore pixel has its resting tone; the breath pushes the
# whole bore a step either way.
$ColdSpec = '6=E9FEFF 7=AAF1FF 8=66D4EE 9=3199BE 0=226A8A'

# ============================================================================================
#  HTS MAGNET WORKS - controller face (GTM's frost-proof machine casing)
#  a racetrack coil seen end-on (x3..12 y3..11, its outer corners cut): the outer tape turn (x3..12 y3..11), the middle turn
#  (x4..11 y4..10), the inner tape turn (x5..10 y5..9, its inner corners filled so the bore is round) and the bore (x6..9
#  y6..8); under it the two lamps (run 3,13; quench 5,13)
# ============================================================================================
#   tape (copper-gold HTS tape), lit -> dark: a outer turn top, b outer turn left and inner turn top, c outer turn right and inner
#   turn left, d outer turn bottom and inner turn right, e inner turn bottom
#   (the inner turn is a step darker than the outer one on every side: it sits deeper in the coil)
#   middle turn, cold and dark when idle: p lit sides (top, left), q shaded sides (right, bottom); working, it glows (1..5)
#   bore, dark when idle: w; working, it glows (6..0)
#   frost glint on the outer turn: y
#   lamps: n run off (lit: N), S quench (never lit)
$HtCommonSpec = @'
a=FFE39A b=EFC062 c=D0963F d=A66C2C e=7B4A1F
p=5A3F2F q=3F2C21
w=1A2130
y=F3FAFF
n=1E4029
'@
$HtPal = New-Pal ($SteelSpec + ' ' + $LampSpec + ' ' + $FieldSpec + ' ' + $ColdSpec + ' ' + $HtCommonSpec)

# The whole idle face: bezel, the coil (two tape turns, the middle turn between them and the bore) and the two lamps (off). The
# working frames draw the same map and paint the glow and the frost over it.
$HtBase = @(
    '................',
    '.CDDDDDDDDDDDDE.',
    '.DGGGGGGGGGGGGF.',
    '.DGGaaaaaaaaGGF.',
    '.DGbppppppppcGF.',
    '.DGbpbbbbbbqcGF.',
    '.DGbpcbwwcdqcGF.',
    '.DGbpcwwwwdqcGF.',
    '.DGbpcdwwedqcGF.',
    '.DGbpeeeeeeqcGF.',
    '.DGbqqqqqqqqcGF.',
    '.DGGddddddddGGF.',
    '.DGGGGGGGGGGGGF.',
    '.DGnGSGGGGGGGGF.',
    '.EFFFFFFFFFFFFG.',
    '................'
)
Assert-Map 'HtBase' $HtBase

# The middle turn, clockwise from its top-left corner (top row, right side, bottom row, left side: 26 pixels); the third value
# is the side: 0 lit (top, left), 1 shaded (right, bottom).
$HtRing = @()
for ($x = 4; $x -le 11; $x++) { $HtRing += , @($x, 4, 0) }
for ($y = 5; $y -le 9; $y++) { $HtRing += , @(11, $y, 1) }
for ($x = 11; $x -ge 4; $x--) { $HtRing += , @($x, 10, 1) }
for ($y = 9; $y -ge 5; $y--) { $HtRing += , @(4, $y, 0) }
if ($HtRing.Count -ne 26) { throw "HtRing: expected 26 pixels, got $($HtRing.Count)" }
# Two pulses of current run round the middle turn, half a turn apart; each crosses half the ring in a loop (13 pixels in eight
# frames, rounded), so the second takes the first's place at the seam: the loop has no jump.
$HtCrest = @(0, 2, 3, 5, 7, 8, 10, 11)
# The bore: x, y and its resting tone (0 = the brightest of '67890'): bright in the middle, lit at the top left, deeper at the
# bottom right.
$HtBore = @(@(7, 6, 1), @(8, 6, 2), @(6, 7, 2), @(7, 7, 0), @(8, 7, 1), @(9, 7, 3), @(7, 8, 2), @(8, 8, 3))
# The bore breathes (negative = brighter): one slow swell and ebb per loop.
$HtBoreBreath = @(0, -1, -1, 0, 0, 1, 1, 0)
$HtRunLamp = @(3, 13); $HtQuenchLamp = @(5, 13)

# the outer turn's lit pixels, where the frost may glint (top row and left side)
$HtFrost = @()
for ($x = 4; $x -le 11; $x++) { $HtFrost += , @($x, 3) }
for ($y = 4; $y -le 10; $y++) { $HtFrost += , @(3, $y) }

function New-HTSMagnetWorksFrame {
    param([bool]$Active, [int]$T = 0)
    $c = New-Canvas; $e = New-Canvas
    $P = $HtPal
    Write-Map $c 0 0 $HtBase $P
    # idle: the coil is cold, dark between its turns; nothing moves and nothing glows
    if (-not $Active) { return @{ Color = $c; Emi = $e } }
    $f = $T % 8
    $field = '12345'
    $cold = '67890'

    # ---- the frost glints: at most one glint a frame on the outer turn's lit pixels
    $n = Get-Noise $f 5 $T 53
    $spark = $HtFrost[$n % $HtFrost.Count]
    if ($n -lt 200) { Set-Px $c $spark[0] $spark[1] $P['y'] }

    # ---- the middle turn: the field's glow, a step dimmer on its shaded sides; the two pulses lift the pixel under them two
    # steps and the pixels beside them one
    $crests = @($HtCrest[$f], ($HtCrest[$f] + 13))
    for ($i = 0; $i -lt $HtRing.Count; $i++) {
        $px = $HtRing[$i]
        $dist = 99
        foreach ($cr in $crests) {
            $d = [Math]::Abs($i - $cr) % 26
            $d = [Math]::Min($d, 26 - $d)
            if ($d -lt $dist) { $dist = $d }
        }
        $tone = 2 + $px[2]
        if ($dist -eq 0) { $tone -= 2 } elseif ($dist -eq 1) { $tone -= 1 }
        Set-Both $c $e $px[0] $px[1] $P[[string]$field[(Get-ClampInt $tone 0 ($field.Length - 1))]]
    }

    # ---- the bore: the cold glow of the field in the bore, breathing
    foreach ($b in $HtBore) {
        $tone = $b[2] + $HtBoreBreath[$f]
        Set-Both $c $e $b[0] $b[1] $P[[string]$cold[(Get-ClampInt $tone 0 ($cold.Length - 1))]]
    }

    # ---- the lamps: run lit while working; the quench lamp stays dark (a quench would be a failed test)
    Set-Both $c $e $HtRunLamp[0] $HtRunLamp[1] $P['N']

    Sync-Emissive $c $e
    return @{ Color = $c; Emi = $e }
}

# Where light may come from: the middle turn, the bore and the run lamp (the check below holds the emissive layer to these
# pixels, so the tape, the frost, the quench lamp and the steel never glow).
$HtGlowZone = New-Object 'System.Collections.Generic.HashSet[int]'
foreach ($px in $HtRing) { [void]$HtGlowZone.Add($px[1] * 16 + $px[0]) }
foreach ($b in $HtBore) { [void]$HtGlowZone.Add($b[1] * 16 + $b[0]) }
[void]$HtGlowZone.Add($HtRunLamp[1] * 16 + $HtRunLamp[0])

# ============================================================================================
#  BUILD
# ============================================================================================
$HtDir = 'block/multiblock/hts_magnet_works'
$HtFrameTime = 4

function Out-Overlay {
    param([string]$Dir, $Builder, [int]$FrameTime)
    $frames = @(); $emis = @()
    for ($f = 0; $f -lt 8; $f++) { $r = & $Builder $true $f; $frames += $r.Color; $emis += $r.Emi }
    $idle = & $Builder $false 0
    Out-Tex $idle.Color "$Dir/overlay_front.png"
    Out-Tex (Join-Frames $frames) "$Dir/overlay_front_active.png" $FrameTime
    Out-Tex (Join-Frames $emis) "$Dir/overlay_front_active_emissive.png" $FrameTime
}

if (Test-Want 'magnet_works') { Out-Overlay $HtDir ${function:New-HTSMagnetWorksFrame} $HtFrameTime }

# ============================================================================================
#  VERIFY what was written: exact sizes (the idle face 16x16, the strips 16x128), binary alpha, no pure black, the .mcmeta
#  frametime, frames that really differ (each one from the next, the loop seam included, and at least 4 distinct), the empty
#  casing ring around a panel without holes, and an emissive layer inside the colour layer, lit in every frame and only on
#  the middle turn, the bore and the run lamp
# ============================================================================================
$problems = 0
foreach ($rel in $written) {
    $path = Join-Path $OutRoot ($rel -replace '/', '\')
    $msgs = @()
    if ($rel.EndsWith('.mcmeta')) {
        $ft = 0
        try { $ft = [int]((Get-Content -LiteralPath $path -Raw | ConvertFrom-Json).animation.frametime) } catch { $msgs += 'unreadable .mcmeta' }
        if ($ft -ne $HtFrameTime) { $msgs += "frametime $ft (expected $HtFrameTime)" }
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
                if (-not $HtGlowZone.Contains($i % 256)) { $outside++ }
            }
            if ($stray -gt 0) { $msgs += "$stray emissive px not present in the colour layer" }
            if ($outside -gt 0) { $msgs += "$outside emissive px outside the middle turn, the bore and the run lamp" }
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

    $dir = Join-Path $OutRoot ($HtDir -replace '/', '\')
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
        Write-Host ("| ``pack/kubejs/assets/grindless/textures/$rel`` | Generated with tools/assets/$ScriptName (procedural pixel art, original) by the HTS magnet works agent, 2026-10-26 | the pack's licence (pending; proposed CC BY-SA 4.0) |")
    }
}
