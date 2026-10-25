<#
.SYNOPSIS
  Procedural 16x16 pixel art for the IV naquadah plant's controller face of Gregtech Grindless (GregTech style: bevels,
  top-left light, every pixel fully opaque or fully transparent).

.DESCRIPTION
  Every pixel is drawn by this script (palettes + a char map + small routines); nothing is copied or edited from GregTech
  Modern or any other mod. Output is deterministic: re-running overwrites the same bytes (the shimmer comes from Get-Noise, a
  hash of position and frame, not from a random generator). Same method, steel bezel and lamp ramp as the IV faces
  (Build-HotCellTextures.ps1, Build-FissionReactorTextures.ps1), whose helpers are copied so those scripts stay untouched, and
  the hot cell's checks: no frame repeats the next one, no hole inside the panel, and light only where the face has lights.
  IV's accent is the fission reactor's Cherenkov blue: on this face it is the neutron source's glow.

  Writes (under pack/kubejs/assets/grindless/textures/):
    block/multiblock/naquadah_plant/overlay_front.png, overlay_front_active.png(+.mcmeta), overlay_front_active_emissive.png(+.mcmeta)

  The face is the viewport into the activation chamber of the naquadah plant (gtceu:naquadah_plant), GT--'s naquadah line in
  one multiblock: naquadah oxide mixture turns into naquadah dust by neutron activation in a bath of fluoroantimonic acid
  (HSbF6, a superacid), with a plutonium-beryllium neutron source in place of GT--'s neutron accelerators. A dark steel frame
  holds dark teal lead glass with a glint at its top left. Inside the dark chamber, at the left, the Pu-Be source: a small
  capsule with a yellow band standing in a steel cradle; at the right, a vessel of the pale green-yellow superacid bath with a
  small dark green-black heap of naquadah at its bottom (GTM's naquadah: a near-black metal with a dark green sheen). Under the
  window: a small radiation sign at the bottom left, the handle of the drawer the source is loaded through, and the mode 1
  lamp at the bottom right.
  8 frames, frametime 4: the source glows a cold blue (Cherenkov-like) and breathes, lighting the chamber around it and the
  vessel's near wall; the bath's surface is lit and shimmers; bubbles rise and burst at the surface; dark green naquadah flecks
  sink and settle on the heap, which catches a glint as each one lands; the lamp is lit. Idle: the chamber is dark, the source
  is a dull capsule, the bath is still and unlit (no bubbles) and the lamp is dark.

  The *_emissive layer only holds the source's glow (the capsule and the halo around it), the bath's lit surface and the lit
  lamp.

  Run from the repo root (PowerShell 5.1 blocks unsigned scripts by default; this bypass only affects that process):
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-NaquadahPlantTextures.ps1
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-NaquadahPlantTextures.ps1 -Only naquadah_plant -Credits

  Overlay conventions (GTM's workable casings, as every other set): transparent background, details only on the overlay,
  animated variants are vertical 16x(16*n) strips with a .png.mcmeta, *_emissive layers hold only the pixels that glow
  (identical to the colour layer). Every pixel is fully opaque or fully transparent and none is pure black. The outer 1 px
  ring is always left empty so the casing shows around the face. Drawn for gtceu:block/casings/solid/machine_casing_inert_ptfe
  (GTM's chemically inert PTFE machine casing, the plant's casing in docs/eras/iv.md); the face has its own dark steel frame,
  so it also reads on other casings. The final check fails the run (non-zero exit) if a written file breaks one of these
  rules.

.PARAMETER Only
  Subset of: naquadah_plant (comma-separated, also as one string with -File). Default: everything.
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
$Known = @('naquadah_plant')
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
# IV accent (GTM writes IV in blue): the fission reactor's Cherenkov blue, white-hot -> deep. The source's core rests on b,
# swells to a and ebbs to c; the capsule's ends are a step dimmer, the halo beside it three and the glow above it four, and the
# shimmer pushes those a step either way.
$CherenkovSpec = 'a=EAFAFF b=BDEBFF c=8FD8FF d=63C2FF e=3FA9FF f=2C86E6 g=2164C2'
# The superacid's lit surface, brightest -> dimmest: it rests on s, the shimmer moves it a step and a bursting bubble flashes r.
$BathSpec = 'r=F6FFD0 s=E0F49C t=CAE47C u=B2D262'

# ============================================================================================
#  NAQUADAH PLANT - controller face (GTM's chemically inert PTFE machine casing)
#  the activation chamber's window (dark steel frame x3..12 y3..10, the chamber x4..11 y4..9 behind dark teal lead glass with
#  its glint at 4,4 5,4), the Pu-Be source (a capsule at 5,6..8 in a steel cradle x4..6 y8..9), the vessel of the superacid
#  bath (walls x7 and x11 from their lips at y5 down to the floor, the bath x8..10: surface y6, liquid y7..8, the naquadah
#  heap at its bottom: peak 9,8 over row 9), the radiation sign (x3..5 y11..13), the source drawer's handle (posts 7,11 and
#  10,11, grip x7..10 y12, its shadow y13) and the mode 1 lamp (recess x11..13 y11..12, lamp at 12,12, lit lip y13)
# ============================================================================================
#   lead glass: w glint
#   the chamber, idle (dark): h upper, i lower; active (lit by the source): j near it, k farther
#   source, idle: T cap, y band (the capsule's yellow hazard band), U foot; the cradle is steel (D E prongs, D C E base)
#   vessel (PTFE-lined): p wall (lit side), q wall (shade side), Y lip (lit), Z lip (shade); L the near wall in the source's light
#   bath, idle (unlit and still): V surface, W liquid, X lowest row; active: the BathSpec surface, v liquid, x lowest row, z bubble
#   naquadah: n heap, m its peak and the sinking flecks, o the glint on the heap's base where a fleck lands
#   lamps: l off (lit: N)
#   radiation sign: y yellow (and the steel J for its marks)
$NpPal = New-Pal ($SteelSpec + ' ' + $LampSpec + ' ' + $CherenkovSpec + ' ' + $BathSpec + ' ' + @'
w=5F8E8B
h=15272B i=101E22 j=1D3E50 k=152D38
T=B7BCC1 U=7D8287
p=86908E q=566060 Y=A9B3B1 Z=6E7877 L=7FA3B8
V=8C9C56 W=727F46 X=5C6838
v=A3C455 x=86A445 z=EEF9CC
n=232B1E m=34422E o=566B4A
l=1E4029
y=F2C230
'@)

# The static panel, as it stands idle: bezel, the window frame, the glass glint, the dark chamber, the source in its cradle,
# the vessel with the still bath over the heap, the radiation sign, the handle of the drawer the source is loaded through, the
# lamp recess and its lit lip. The frame code repaints the chamber, the source, the bath and the lamp when the plant works.
$NpBase = @(
    '................',
    '.CDDDDDDDDDDDDE.',
    '.DGGGGGGGGGGGGF.',
    '.DGDEEEEEEEEFGF.',
    '.DGEwwhhhhhhFGF.',
    '.DGEhhhYhhhZFGF.',
    '.DGEiTipVVVqFGF.',
    '.DGEiyipWWWqFGF.',
    '.DGEDUEpXmXqFGF.',
    '.DGEDCEpnnnqFGF.',
    '.DGFFFFFFFFFHGF.',
    '.DGJyJGEGGEIIIF.',
    '.DGyJyGDCCEIlIF.',
    '.DGyJyGGHHGEEEF.',
    '.EFFFFFFFFFFFFG.',
    '................'
)
Assert-Map 'NpBase' $NpBase

$NpInX0 = 4; $NpInX1 = 11; $NpInY0 = 4; $NpInY1 = 9         # the chamber seen through the glass
$NpSrcX = 5; $NpCoreY = 7                                   # the source's capsule (cap 5,6, core 5,7, foot 5,8)
# The source's glow around its core: x, y, steps dimmer than the core, brightest tone allowed (the cap and the foot, the
# halo beside the capsule, the glow above its cap).
$NpHalo = @(
    @(5, 6, 1, 1), @(5, 8, 1, 1),
    @(4, 6, 3, 2), @(6, 6, 3, 2), @(4, 7, 3, 2), @(6, 7, 3, 2),
    @(5, 5, 4, 3)
)
$NpWallX = 7                                                # the vessel's near wall, which the source lights at y6..7
$NpBathX0 = 8; $NpBathX1 = 10                               # the bath's columns inside the vessel
$NpSurfY = 6; $NpBottomY = 8                                # its lit surface and the lowest row of liquid
$NpHeapX = 9; $NpHeapY = 8                                  # the peak of the naquadah heap (its base fills row 9)
$NpLamp = @(12, 12)                                         # the mode 1 lamp
# The source breathes (negative = brighter): one slow swell and ebb per loop.
$NpPulse = @(0, -1, -1, 0, 0, 1, 1, 0)
# Bubbles: column, the frame it shows and the row it shows on. It rises a pixel a frame and bursts on the surface: two from
# the bottom of the far column and a small one off the heap's peak, never two in one column at once.
$NpBubbles = @(@(10, 0, 8), @(9, 3, 7), @(10, 4, 8))
# Flecks of naquadah: they come out of the bath just under the surface in the near column ($NpFleckX), sink a pixel a frame
# and land on the heap's base two frames later, which glints there as each one lands. The frames each one shows:
$NpFleckX = 8
$NpFlecks = @(1, 5)

function New-NaquadahPlantFrame {
    param([bool]$Active, [int]$T = 0)
    $c = New-Canvas; $e = New-Canvas
    $P = $NpPal
    Write-Map $c 0 0 $NpBase $P
    $f = $T % 8
    $glow = 'abcdefg'
    $surf = 'rstu'

    if ($Active) {
        # ---- the chamber, lit by the source: a cold blue near it, darker farther away (the halo itself is drawn below)
        for ($y = $NpInY0; $y -le $NpInY1; $y++) {
            for ($x = $NpInX0; $x -le $NpInX1; $x++) {
                $ch = [string]$NpBase[$y][$x]
                if ($ch -ne 'h' -and $ch -ne 'i') { continue }
                $d = [Math]::Max([Math]::Abs($x - $NpSrcX), [Math]::Abs($y - $NpCoreY))
                Set-Px $c $x $y $P[$(if ($d -le 2) { 'j' } else { 'k' })]
            }
        }

        # ---- the source: the core breathes with the loop (b; a at the swell, c at the ebb); the capsule's ends, the halo beside
        # it and the glow above it breathe with it, dimmer, and now and then shimmer a step up or down
        $core = 1 + $NpPulse[$f]
        Set-Both $c $e $NpSrcX $NpCoreY $P[[string]$glow[$core]]
        foreach ($g in $NpHalo) {
            $tone = $core + $g[2]
            $n = Get-Noise $g[0] $g[1] $T 61
            if ($n -lt 40) { $tone-- } elseif ($n -gt 215) { $tone++ }
            Set-Both $c $e $g[0] $g[1] $P[[string]$glow[(Get-ClampInt $tone $g[3] ($glow.Length - 1))]]
        }
        # its light on the vessel's near wall (lit, not a light: it stays off the emissive layer)
        Set-Px $c $NpWallX 6 $P['L']; Set-Px $c $NpWallX 7 $P['L']

        # ---- the bath: where the bubbles and the flecks are this frame
        $bub = @{}; $flk = @{}; $land = $false
        foreach ($b in $NpBubbles) {
            $by = $b[2] - (($f - $b[1] + 8) % 8)
            if ($by -ge $NpSurfY) { $bub["$($b[0]),$by"] = $true }
        }
        foreach ($s in $NpFlecks) {
            $age = ($f - $s + 8) % 8
            if ($age -le 1) { $flk["$NpFleckX,$($NpSurfY + 1 + $age)"] = $true }
            elseif ($age -eq 2) { $land = $true }
        }
        for ($x = $NpBathX0; $x -le $NpBathX1; $x++) {
            # the lit surface rests on s and shimmers a step either way; a bubble bursting there flashes r
            $tone = 1
            $n = Get-Noise $x $NpSurfY $T 67
            if ($n -lt 48) { $tone-- } elseif ($n -gt 207) { $tone++ }
            if ($bub.ContainsKey("$x,$NpSurfY")) { $tone = 0 }
            Set-Both $c $e $x $NpSurfY $P[[string]$surf[$tone]]
            # the liquid under it, lit from the surface, with the rising bubbles and the sinking flecks (around the heap's peak)
            for ($y = $NpSurfY + 1; $y -le $NpBottomY; $y++) {
                if ($x -eq $NpHeapX -and $y -eq $NpHeapY) { continue }
                $k = "$x,$y"
                $ch = if ($bub.ContainsKey($k)) { 'z' } elseif ($flk.ContainsKey($k)) { 'm' } elseif ($y -eq $NpBottomY) { 'x' } else { 'v' }
                Set-Px $c $x $y $P[$ch]
            }
        }
        # the heap's base glints where a fleck lands on it
        if ($land) { Set-Px $c $NpFleckX ($NpBottomY + 1) $P['o'] }
    }

    # ---- the mode 1 lamp: lit while working
    if ($Active) { Set-Both $c $e $NpLamp[0] $NpLamp[1] $P['N'] }
    else { Set-Px $c $NpLamp[0] $NpLamp[1] $P['l'] }

    Sync-Emissive $c $e
    return @{ Color = $c; Emi = $e }
}

# Where light may come from: the source's core and its glow, the bath's surface and the lamp (the check below holds the
# emissive layer to these pixels, so the glass, the chamber, the vessel, the heap, the sign and the steel never glow).
$NpGlowZone = New-Object 'System.Collections.Generic.HashSet[int]'
[void]$NpGlowZone.Add($NpCoreY * 16 + $NpSrcX)
foreach ($g in $NpHalo) { [void]$NpGlowZone.Add($g[1] * 16 + $g[0]) }
for ($x = $NpBathX0; $x -le $NpBathX1; $x++) { [void]$NpGlowZone.Add($NpSurfY * 16 + $x) }
[void]$NpGlowZone.Add($NpLamp[1] * 16 + $NpLamp[0])

# ============================================================================================
#  BUILD
# ============================================================================================
$NpDir = 'block/multiblock/naquadah_plant'
$NpFrameTime = 4

function Out-Overlay {
    param([string]$Dir, $Builder, [int]$FrameTime)
    $frames = @(); $emis = @()
    for ($f = 0; $f -lt 8; $f++) { $r = & $Builder $true $f; $frames += $r.Color; $emis += $r.Emi }
    $idle = & $Builder $false 0
    Out-Tex $idle.Color "$Dir/overlay_front.png"
    Out-Tex (Join-Frames $frames) "$Dir/overlay_front_active.png" $FrameTime
    Out-Tex (Join-Frames $emis) "$Dir/overlay_front_active_emissive.png" $FrameTime
}

if (Test-Want 'naquadah_plant') { Out-Overlay $NpDir ${function:New-NaquadahPlantFrame} $NpFrameTime }

# ============================================================================================
#  VERIFY what was written: exact sizes (the idle face 16x16, the strips 16x128), binary alpha, no pure black, the .mcmeta
#  frametime, frames that really differ (each one from the next, the loop seam included, and at least 4 distinct), the empty
#  casing ring around a panel without holes, and an emissive layer inside the colour layer, lit in every frame and only on
#  the source, its glow, the bath's surface and the lamp
# ============================================================================================
$problems = 0
foreach ($rel in $written) {
    $path = Join-Path $OutRoot ($rel -replace '/', '\')
    $msgs = @()
    if ($rel.EndsWith('.mcmeta')) {
        $ft = 0
        try { $ft = [int]((Get-Content -LiteralPath $path -Raw | ConvertFrom-Json).animation.frametime) } catch { $msgs += 'unreadable .mcmeta' }
        if ($ft -ne $NpFrameTime) { $msgs += "frametime $ft (expected $NpFrameTime)" }
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
                if (-not $NpGlowZone.Contains($i % 256)) { $outside++ }
            }
            if ($stray -gt 0) { $msgs += "$stray emissive px not present in the colour layer" }
            if ($outside -gt 0) { $msgs += "$outside emissive px outside the source, its glow, the bath's surface and the lamp" }
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
        Write-Host ("| ``pack/kubejs/assets/grindless/textures/$rel`` | Generated with tools/assets/$ScriptName (procedural pixel art, original) by the naquadah plant agent, 2026-10-25 | the pack's licence (pending; proposed CC BY-SA 4.0) |")
    }
}
