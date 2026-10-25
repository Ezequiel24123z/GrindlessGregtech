<#
.SYNOPSIS
  Procedural 16x16 pixel art for the IV fluorspar kiln's controller face of Gregtech Grindless (GregTech style: bevels, top-left
  light, every pixel fully opaque or fully transparent).

.DESCRIPTION
  Every pixel is drawn by this script (palettes + a char map + small routines); nothing is copied or edited from GregTech
  Modern or any other mod. Output is deterministic: re-running overwrites the same bytes (the flicker comes from Get-Noise, a
  hash of position and frame, not from a random generator). Same method, steel bezel and lamp ramp as the EV and IV faces
  (Build-FissionReactorTextures.ps1, Build-HotCellTextures.ps1), whose helpers are copied so those scripts stay untouched, and
  the hot cell's checks: no frame repeats the next one, no hole inside the panel, and light only where the face has lights.

  Writes (under pack/kubejs/assets/grindless/textures/):
    block/multiblock/fluorspar_kiln/overlay_front.png, overlay_front_active.png(+.mcmeta), overlay_front_active_emissive.png(+.mcmeta)

  The face is the kiln seen from the side, as on a flow sheet: a long rotary kiln of pale heatproof steel across the panel, with
  two steel riding rings on pairs of rollers and a plinth under it, a feed hopper of lilac fluorspar over its cold (left) end, a
  heating jacket under it between the rings, and the white PTFE scrubber tower at its hot (right) end, with its packing column
  and the HF sump at its foot. Two lamps over the kiln: the drive (green) and the HF (cyan).
  8 frames, frametime 4: the kiln turns (a seam of rivets runs down the visible side of the shell, row by row, and the opposite
  seam comes round when the first goes behind), fluorspar trickles from the hopper into the feed end, the heating jacket glows
  and flickers, a drop of HF runs down the packing into the sump, the drive lamp is lit and the HF lamp blinks as the drop lands.
  Idle: the kiln stands still, the jacket is dark, the sump is empty, the fluorspar in the hopper is dull and both lamps are dark.

  The *_emissive layer only holds the heating jacket's glow and the lit lamps.

  Run from the repo root (PowerShell 5.1 blocks unsigned scripts by default; this bypass only affects that process):
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-FluorsparKilnTextures.ps1
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-FluorsparKilnTextures.ps1 -Only kiln -Credits
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-FluorsparKilnTextures.ps1 -Preview C:\path\fluorspar-kiln.png

  Overlay conventions (GTM's workable casings, as every other set): transparent background, details only on the overlay,
  animated variants are vertical 16x(16*n) strips with a .png.mcmeta, *_emissive layers hold only the pixels that glow
  (identical to the colour layer). Every pixel is fully opaque or fully transparent and none is pure black. The outer 1 px
  ring is always left empty so the casing shows around the face. Drawn for gtceu:block/casings/solid/machine_casing_heatproof
  (GTM's heatproof machine casing, the kiln's workableCasingModel); the face has its own dark frame, so it also reads on other
  casings. The final check fails the run (non-zero exit) if a written file breaks one of these rules.

.PARAMETER Only
  Subset of: kiln (comma-separated, also as one string with -File). Default: everything.
.PARAMETER OutRoot
  Textures root. Default: <repo>/pack/kubejs/assets/grindless/textures
.PARAMETER Preview
  Optional review sheet (PNG, outside the repository, never shipped): idle, the 8 active frames with the emissive layer, a dark
  room, and a 3x3 wall idle and working, on a stand-in heatproof casing drawn by code.
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
$Known = @('kiln')
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

# Deterministic 0..255 hash of (x, y, frame, salt): flicker without a random generator.
function Get-Noise {
    param([long]$X, [long]$Y, [long]$T = 0, [long]$Salt = 0)
    $h = (($X * 73856093L) -bxor ($Y * 19349663L) -bxor ($T * 83492791L) -bxor ($Salt * 2654435761L)) % 1000003L
    if ($h -lt 0) { $h = -$h }
    return [int](($h * 7919L) % 256L)
}

# Ramps shared with the earlier sets: neutral steel (lit -> dark) and the state lamp (green M..P, red Q..S).
$SteelSpec = 'A=D3D3D3 B=B0B0B0 C=8E8E8E D=707070 E=565656 F=404040 G=2F2F2F H=222222 I=161616 J=0D0D0D'
$LampSpec = 'M=E2FFE4 N=62FF86 O=22C257 P=0C6B2E Q=FF5A48 R=B52D22 S=5E1511'
# The heating jacket's glow, bright -> dim. Its middle rests on v; the flicker pushes each pixel a step either way.
$HeatSpec = 'u=FFD27A v=FF9A3C w=D9602A'

# ============================================================================================
#  FLUORSPAR KILN - controller face (GTM's heatproof machine casing)
#  the kiln (cold end flange x2, shell x3..10 on rows 6..9, riding rings at x4 and x8 from row 5 to row 10), the rollers under
#  the rings (row 11), the plinth (row 12), the heating jacket (x5..7 row 10), the feed hopper (mouth x2..5 row 2, funnel and
#  neck rows 3..4) and its chute (3,5), the scrubber tower (x11..13 rows 2..12) with its packing column (x12) and sump (rows
#  10..11), and the drive and HF lamps (7,3 and 9,3)
# ============================================================================================
#   kiln shell (heatproof steel): k lit top, K body, W lower body, L shade, m a rivet on the shade row
#   fluorspar: l lit (working), q dull (idle)
#   heating jacket: h dark (idle); u v w glow (working)
#   scrubber (PTFE): p lit cap, T wall, U shade wall, V base shade; packing n o; HF c drop and splash, d liquid
#   lamps: z drive off (lit: N), y HF off (lit: x)
$FkPal = New-Pal ($SteelSpec + ' ' + $LampSpec + ' ' + $HeatSpec + ' ' + @'
k=D9D3C5 K=B8AF9C W=A39A88 L=8C8472 m=5F594C
l=C2A6E0 q=8A729F
h=4A2C22
p=F2F2F2 T=D2D2D2 U=A6A6A6 V=7C7C7C
n=323A39 o=4A5452
c=C6F7F0 d=7FD6CB
z=1E4029 y=1A3C40 x=7DF3FF
'@)

# The static panel: bezel, hopper, lamps (off), the kiln with its rings, rollers and plinth, the jacket (dark) and the scrubber
# with its packing. The rivets, the feed, the glow, the drop and the sump are drawn per frame.
$FkBase = @(
    '................',
    '.CDDDDDDDDDDDDE.',
    '.DCqqDGGGGGppTF.',
    '.DGDEGGzGyGTnUF.',
    '.DGEGGGGGGGToUF.',
    '.DGHEGGGEGGTnUF.',
    '.DDkBkkkBkkToUF.',
    '.DDKCKKKCKKTnUF.',
    '.DEWDWWWDWWToUF.',
    '.DFLELLLELLTnUF.',
    '.DHHFhhhFHHToUF.',
    '.DHDHDHDHDHToUF.',
    '.DEEEEEEEEEUUVF.',
    '.DFFFFFFFFFFFFF.',
    '.EFFFFFFFFFFFFG.',
    '................'
)
Assert-Map 'FkBase' $FkBase

$FkShellX = @(3, 6, 9)                                      # a seam of rivets along the shell (the rings at 4 and 8 carry none)
$FkShellY0 = 6                                              # the shell's top row; rows 6..9 are its visible side
$FkSeam = 'LLLm'                                            # a rivet's colour on rows 6..9 (darker than the shell under it)
$FkIdleSeam = 1                                             # idle: the rivets stand on row 7
$FkHopper = @(@(3, 2), @(4, 2)); $FkChute = @(3, 5)
$FkJacket = @(@(5, 10), @(6, 10), @(7, 10))
$FkColX = 12; $FkDropY0 = 3; $FkSumpY = @(10, 11)
$FkLampDrive = @(7, 3); $FkLampHf = @(9, 3)
$FkLand = 7                                                 # the frame the drop reaches the sump (and the HF lamp blinks)

function New-FluorsparKilnFrame {
    param([bool]$Active, [int]$T = 0)
    $c = New-Canvas; $e = New-Canvas
    $P = $FkPal
    Write-Map $c 0 0 $FkBase $P
    $f = $T % 8

    # ---- the shell turns: a seam of rivets runs down the visible side, one row a frame; the opposite seam comes round after four
    # frames
    $row = if ($Active) { $f % 4 } else { $FkIdleSeam }
    foreach ($x in $FkShellX) { Set-Px $c $x ($FkShellY0 + $row) $P[[string]$FkSeam[$row]] }

    # ---- the feed: bright fluorspar in the hopper, grains falling down the chute every other frame
    foreach ($h in $FkHopper) { Set-Px $c $h[0] $h[1] $P[$(if ($Active) { 'l' } else { 'q' })] }
    if ($Active -and ($f % 2) -eq 0) { Set-Px $c $FkChute[0] $FkChute[1] $P['l'] }

    # ---- the heating jacket: glows and flickers while working
    if ($Active) {
        $glow = 'uvw'
        foreach ($j in $FkJacket) {
            $tone = 1
            $n = Get-Noise $j[0] $j[1] $T 41
            if ($n -lt 70) { $tone-- } elseif ($n -gt 185) { $tone++ }
            Set-Both $c $e $j[0] $j[1] $P[[string]$glow[(Get-ClampInt $tone 0 ($glow.Length - 1))]]
        }
    }

    # ---- the scrubber: a drop of HF runs down the packing and lands in the sump
    if ($Active) {
        foreach ($sy in $FkSumpY) { Set-Px $c $FkColX $sy $P['d'] }
        if ($f -lt $FkLand) { Set-Px $c $FkColX ($FkDropY0 + $f) $P['c'] }
        else { Set-Px $c $FkColX $FkSumpY[0] $P['c'] }
    }

    # ---- the lamps: the drive lit while working; the HF lamp blinks as the drop lands
    if ($Active) { Set-Both $c $e $FkLampDrive[0] $FkLampDrive[1] $P['N'] }
    if ($Active -and $f -eq $FkLand) { Set-Both $c $e $FkLampHf[0] $FkLampHf[1] $P['x'] }

    Sync-Emissive $c $e
    return @{ Color = $c; Emi = $e }
}

# Where light may come from: the heating jacket and the two lamps (the check below holds the emissive layer to these pixels, so
# the kiln, the hopper, the scrubber, the HF and the steel never glow).
$FkGlowZone = New-Object 'System.Collections.Generic.HashSet[int]'
foreach ($j in $FkJacket) { [void]$FkGlowZone.Add($j[1] * 16 + $j[0]) }
foreach ($l in @($FkLampDrive, $FkLampHf)) { [void]$FkGlowZone.Add($l[1] * 16 + $l[0]) }

# ============================================================================================
#  BUILD
# ============================================================================================
$FkDir = 'block/multiblock/fluorspar_kiln'
$FkFrameTime = 4

function Out-Overlay {
    param([string]$Dir, $Builder, [int]$FrameTime)
    $frames = @(); $emis = @()
    for ($f = 0; $f -lt 8; $f++) { $r = & $Builder $true $f; $frames += $r.Color; $emis += $r.Emi }
    $idle = & $Builder $false 0
    Out-Tex $idle.Color "$Dir/overlay_front.png"
    Out-Tex (Join-Frames $frames) "$Dir/overlay_front_active.png" $FrameTime
    Out-Tex (Join-Frames $emis) "$Dir/overlay_front_active_emissive.png" $FrameTime
}

if (Test-Want 'kiln') { Out-Overlay $FkDir ${function:New-FluorsparKilnFrame} $FkFrameTime }

# ============================================================================================
#  VERIFY what was written: exact sizes (the idle face 16x16, the strips 16x128), binary alpha, no pure black, the .mcmeta
#  frametime, frames that really differ (each one from the next, the loop seam included, and at least 4 distinct), the empty
#  casing ring around a panel without holes, and an emissive layer inside the colour layer, lit in every frame and only on
#  the jacket and the lamps
# ============================================================================================
$problems = 0
foreach ($rel in $written) {
    $path = Join-Path $OutRoot ($rel -replace '/', '\')
    $msgs = @()
    if ($rel.EndsWith('.mcmeta')) {
        $ft = 0
        try { $ft = [int]((Get-Content -LiteralPath $path -Raw | ConvertFrom-Json).animation.frametime) } catch { $msgs += 'unreadable .mcmeta' }
        if ($ft -ne $FkFrameTime) { $msgs += "frametime $ft (expected $FkFrameTime)" }
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
                if (-not $FkGlowZone.Contains($i % 256)) { $outside++ }
            }
            if ($stray -gt 0) { $msgs += "$stray emissive px not present in the colour layer" }
            if ($outside -gt 0) { $msgs += "$outside emissive px outside the jacket and the lamps" }
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
if ($Preview -and (Test-Want 'kiln')) {
    # a stand-in for GTM's heatproof casing, drawn here (its texture is not in the repository): a pale invar plate with a lit
    # top-left bevel, a dark bottom-right one and a faint mottle
    function New-StandInHeatproof {
        $c = New-Canvas
        $lit = Hex 'C9C4B8'; $mid = Hex 'ADA89C'; $dark = Hex '807B71'; $edge = Hex '5E5A53'
        for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
            if ($x -eq 0 -or $y -eq 0) { $v = $lit }
            elseif ($x -eq 15 -or $y -eq 15) { $v = $edge }
            elseif ($x -eq 14 -or $y -eq 14) { $v = $dark }
            else { $v = if ((Get-Noise $x $y 0 77) -lt 60) { Shade $mid 0.95 } else { $mid } }
            Set-Px $c $x $y $v
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
    function New-Wall {
        param($Casing, $Face)
        $w = New-Canvas 48 48
        for ($j = 0; $j -lt 3; $j++) { for ($i = 0; $i -lt 3; $i++) { Merge-Canvas $w $Casing (16 * $i) (16 * $j) } }
        Merge-Canvas $w $Face 16 16
        return $w
    }
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

    $casing = New-StandInHeatproof
    $dir = Join-Path $OutRoot ($FkDir -replace '/', '\')
    $idle = Read-Png (Join-Path $dir 'overlay_front.png')
    $act = Read-Png (Join-Path $dir 'overlay_front_active.png')
    $emi = Read-Png (Join-Path $dir 'overlay_front_active_emissive.png')
    $tiles = New-Object System.Collections.Generic.List[object]
    $tiles.Add((Merge-On $casing $idle))
    for ($f = 0; $f -lt 8; $f++) { $tiles.Add((Merge-On (Merge-On $casing (Get-Frame $act $f)) (Get-Frame $emi $f))) }
    $tiles.Add((Get-Dark $casing (Get-Frame $act 0) (Get-Frame $emi 0)))
    $wallIdle = New-Wall $casing $idle
    $wallAct = New-Wall $casing (Merge-On (Get-Frame $act 0) (Get-Frame $emi 0))

    $k = 8; $gap = 16
    $sheet = New-Canvas ($gap + $tiles.Count * (16 * $k + $gap)) ($gap + 16 * $k + $gap + 48 * $k + $gap)
    $bgRow = New-Object 'int[]' $sheet.W
    $bg = Hex '1E2126'
    for ($i = 0; $i -lt $sheet.W; $i++) { $bgRow[$i] = $bg }
    for ($y = 0; $y -lt $sheet.H; $y++) { [Array]::Copy($bgRow, 0, $sheet.P, $y * $sheet.W, $sheet.W) }
    for ($ti = 0; $ti -lt $tiles.Count; $ti++) { Add-Blit $sheet $tiles[$ti] ($gap + $ti * (16 * $k + $gap)) $gap $k }
    $wy = $gap + 16 * $k + $gap
    Add-Blit $sheet $wallIdle $gap $wy $k
    Add-Blit $sheet $wallAct ($gap + 48 * $k + $gap) $wy $k
    $sx = $gap + 2 * (48 * $k + $gap)
    Add-Blit $sheet $wallIdle $sx $wy 2
    Add-Blit $sheet $wallAct ($sx + 96 + $gap) $wy 2
    Add-Blit $sheet $wallIdle $sx ($wy + 96 + $gap) 1
    Add-Blit $sheet $wallAct ($sx + 96 + $gap) ($wy + 96 + $gap) 1

    $pdir = Split-Path -Parent $Preview
    if ($pdir -and -not (Test-Path -LiteralPath $pdir)) { New-Item -ItemType Directory -Force -Path $pdir | Out-Null }
    $bmp = ConvertTo-Bitmap $sheet
    try { $bmp.Save($Preview, [System.Drawing.Imaging.ImageFormat]::Png) } finally { $bmp.Dispose() }
    Write-Host "preview: $Preview (idle, 8 active frames with emissive, dark room; a 3x3 wall idle and working at x8, x2 and x1)"
}

if ($problems -gt 0) { throw "$problems file(s) failed the texture checks (see the warnings above)" }

if ($Credits) {
    Write-Host ''
    foreach ($rel in $written) {
        Write-Host ("| ``pack/kubejs/assets/grindless/textures/$rel`` | Generated with tools/assets/$ScriptName (procedural pixel art, original) by the fluorspar kiln agent, 2026-10-25 | the pack's licence (pending; proposed CC BY-SA 4.0) |")
    }
}
