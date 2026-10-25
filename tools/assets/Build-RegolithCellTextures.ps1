<#
.SYNOPSIS
  Procedural 16x16 pixel art for the EV Regolith Cell of Gregtech Grindless, the chemistry of the Moon base (GregTech style:
  bevels, top-left light, 3-5 tones per material, every pixel fully opaque or fully transparent).

.DESCRIPTION
  Every pixel is drawn by this script (palettes + char maps + small shading routines); nothing is copied or edited from GregTech
  Modern or any other mod. Output is deterministic: re-running overwrites the same bytes (the shimmer of the melt and the grain of
  the crust come from Get-Noise, a hash of position and frame, not from a random generator). Same method, ramps and checks as the
  EV set (Build-EVTextures.ps1) and the Syngas plant (Build-SyngasTextures.ps1): neutral steel bezel, EV purple accents, the
  shared state lamp. Their helpers are copied here so those scripts stay untouched.

  Writes (under pack/kubejs/assets/grindless/textures/):
    block/multiblock/regolith_cell/overlay_front.png, overlay_front_active.png(+.mcmeta), overlay_front_active_emissive.png(+.mcmeta)

  The face is the cell as gtceu:regolith_cell builds it (startup_scripts/grindless/ev/regolith_cell.js), seen through a window in
  the brick wall: under the tempered glass roof, a crucible of stable titanium with a band of nichrome coils wound round it holds a
  pool of molten regolith; a platinum anode hangs from the roof into the melt, and the iron and silicon won at the cathode settle in
  a pool of metal on the crucible floor. The base strip carries EV purple stripes and the state lamp. 8 frames, frametime 3: the
  melt shimmers, oxygen bubbles rise from the anode and break at the surface, a pulse of current runs down the anode, heat climbs
  through the glowing coil turns, the roof catches the glow, a glint runs over the metal pool and the lamp blinks. Idle: a dark
  crust with a faint ember, cold copper-red coils, a dull anode, solid metal, a cold roof and the red lamp.

  Run from the repo root (PowerShell 5.1 blocks unsigned scripts by default; this bypass only affects that process):
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-RegolithCellTextures.ps1
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-RegolithCellTextures.ps1 -Only cell -Preview C:\path\regolith-cell.png
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-RegolithCellTextures.ps1 -Credits

  Overlay conventions (GTM's workable casings, as every other set): transparent background, details only on the overlay, animated
  variants are vertical 16x(16*n) strips with a .png.mcmeta, *_emissive layers hold only the pixels that glow (identical to the colour
  layer). Every pixel is fully opaque or fully transparent and none is pure black. The outer 1 px ring is always left empty so the
  casing shows around the face. Drawn for grindless:block/sintered_regolith (the brick of the lunar base, its workableCasingModel):
  a calm, mid-dark warm grey, so the face keeps the dark steel bezel of the HV and EV faces and puts its light tones inside it.
  The final check fails the run (non-zero exit) if any written file breaks one of these rules.

.PARAMETER Only
  Subset of: cell (comma-separated, also as one string with -File). Default: everything.
.PARAMETER OutRoot
  Textures root. Default: <repo>/pack/kubejs/assets/grindless/textures
.PARAMETER Preview
  Also write a review sheet (x8, nearest neighbour) to this PNG, which must be outside the repository (it is never shipped). Top row:
  the face on the sintered regolith bricks, idle, every active frame with its emissive layer, and a dark-room view. Bottom row: the
  controller in a 3x3 wall of bricks, idle and working, at x8 and again at x2 and x1 (how it reads from a few blocks away). The
  bricks are read from OutRoot (or the repo's textures); if they are missing, a stand-in drawn with a copy of the brick generator
  of Build-EVFoundationTextures.ps1 is used.
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
$Known = @('cell')
foreach ($id in $Only) { if ($Known -notcontains $id) { throw "Unknown -Only value '$id' (expected: $($Known -join ', '))" } }

$RepoRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..'))
$RepoTextures = Join-Path $RepoRoot 'pack\kubejs\assets\grindless\textures'
if (-not $OutRoot) { $OutRoot = $RepoTextures }
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

# Ramps shared with the EV set (Build-EVTextures.ps1): neutral steel (lit -> dark), EV purple accents, state lamp.
$SteelSpec = 'A=D3D3D3 B=B0B0B0 C=8E8E8E D=707070 E=565656 F=404040 G=2F2F2F H=222222 I=161616 J=0D0D0D'
$PurpleSpec = 'a=F3E4FF b=D6B0FF c=B07AF0 d=8A4CD0 e=5C2E9C f=381C64 g=1C0E36'
$LampSpec = 'M=E2FFE4 N=62FF86 O=22C257 P=0C6B2E Q=FF5A48 R=B52D22 S=5E1511'

# Frame shared with the HV and EV faces: 1 px empty ring, steel bezel, dark window x3..13 y3..12, base strip y13.
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
#  REGOLITH CELL - controller face (sintered regolith bricks)
#  the platinum anode (x8) hangs from its clamp on the power leads (y3) into the melt; the stable titanium crucible: rim y5,
#  walls x4 (lit) and x12 (shaded) from y6, a rounded bowl (corners on y10, bottom y11) on a plinth (y12); the nichrome coil
#  band wound round it (x3 and x13, y6..11, under the rim); molten regolith x5..11, y7..9 (y6 is the gap under the rim), the
#  metal won at the cathode x6..10, y10; base strip y13: EV purple stripes x3..9, state lamp x11..13
# ============================================================================================
#   titanium (light blue-grey): h spec, i light, j mid, k dark, l darkest
#   melt (molten regolith, hot -> cooler): m white-hot, n yellow, o orange, p deep orange, q red
#   crust (idle): r lit, s mid, t dark; u ember, v faint ember
#   nichrome coils, glowing: w the hottest turn, x a front turn, y a turn behind; cold copper-red: z front, L behind
#   platinum anode: T spark, U lit, V mid, W dull
#   metal pool (iron and silicon): X glint, Y liquid metal, Z its shaded end, K solid metal, 0 solid shade
#   oxygen: 3 bubble, 4 the puff where it breaks
$CellPal = New-Pal ($SteelSpec + ' ' + $PurpleSpec + ' ' + $LampSpec + ' ' + @'
h=EEF3F8 i=CAD4DF j=A4B1C1 k=7D8A9C l=5A6679
m=FFF7D0 n=FFD96A o=FFA53A p=EE6C1E q=B8420F
r=55473E s=3E332C t=2C2420 u=9A3A14 v=62260F
w=FFB45A x=F2702E y=A8361A z=C8693F L=7A3520
T=FFFFFF U=F3F0E6 V=D6D1C2 W=A29D8E
X=FFF8EA Y=C9C3B8 Z=A39C90 K=8E877C 0=6A645C
3=EAF7FF 4=A8D2E6
'@)

# Static parts drawn over the window ('.' leaves the window as it is): the power leads (E) with the anode clamp (B A D), the
# titanium crucible and its plinth. The coils (x3, x13), the melt, the metal pool and the anode are drawn by code.
$CellBase = @(
    '................',
    '................',
    '................',
    '...EEEEBADEEEE..',
    '................',
    '...hh.......ij..',
    '....j.......k...',
    '....j.......k...',
    '....j.......k...',
    '....j.......k...',
    '....jj.....kk...',
    '....jjjkkkkkl...',
    '...ijjjjkkkkll..',
    '................',
    '................',
    '................'
)
Assert-Map 'CellBase' $CellBase

$MeltRamp = @('m', 'n', 'o', 'p', 'q')     # heat index 0..4, white-hot -> red
$LeadL = @(3, 4, 5, 6); $LeadR = @(13, 12, 11, 10)   # the power leads (y3), outer end first: the pulse runs in to the clamp
# Oxygen bubbles: two streams beside the anode, each a 4-step path (rise, rise, break at the surface, the puff above it).
$BubbleL = @(@(7, 9), @(7, 8), @(6, 7), @(6, 6))
$BubbleR = @(@(9, 9), @(9, 8), @(10, 7), @(10, 6))
$MetalGlint = @(6, 7, 8, 9, 10, 9, 8, 7)    # the glint's x on the metal pool, frame by frame (there and back)

function New-RegolithCellFrame {
    param([bool]$Active, [int]$T = 0)
    $c = New-Canvas; $e = New-Canvas
    $P = $CellPal
    Write-Map $c 0 0 $WindowBase $P
    Write-Map $c 0 0 $CellBase $P
    $k = $T % 4

    # ---- the melt (x5..11, y7..9): white-hot round the anode, cooler towards the walls and the floor; idle, a dark crust
    foreach ($y in 7..9) { foreach ($x in 5..11) {
        if ($Active) {
            $dx = [Math]::Abs($x - 8)
            $hv = @(0, 1, 1, 2)[$dx] + ($y - 7)
            $nz = Get-Noise $x $y $T 41
            if ($nz -lt 56) { $hv -= 1 } elseif ($nz -gt 208) { $hv += 1 }
            $col = $P[$MeltRamp[(Get-ClampInt $hv 0 4)]]
            # the anode's pixels (x8, y7..8) are drawn over these and are not emissive
            if ($x -eq 8 -and $y -le 8) { Set-Px $c $x $y $col } else { Set-Both $c $e $x $y $col }
        } else {
            $nz = Get-Noise $x $y 0 43
            $ch = if ($y -eq 7) { $(if ($nz -lt 130) { 'r' } else { 's' }) } else { $(if ($nz -lt 80) { 's' } else { 't' }) }
            Set-Px $c $x $y $P[$ch]
        }
    } }
    if (-not $Active) { Set-Px $c 6 8 $P['u']; Set-Px $c 7 9 $P['v']; Set-Px $c 10 8 $P['v'] }

    # ---- the metal pool on the crucible floor (x6..10, y10): liquid metal with a glint running over it; idle, solid
    foreach ($x in 6..10) {
        if ($Active) {
            if ($x -eq $MetalGlint[$T % 8]) { Set-Both $c $e $x 10 $P['X'] } else { Set-Px $c $x 10 $P[$(if ($x -le 8) { 'Y' } else { 'Z' })] }
        } else { Set-Px $c $x 10 $P[$(if ($x -le 7) { 'K' } else { '0' })] }
    }

    # ---- the platinum anode (x8): bright from the clamp down; in the melt it takes the melt's colour, and its tip glows
    foreach ($y in 4..6) { Set-Px $c 8 $y $P[$(if ($Active) { 'U' } else { 'V' })] }
    if ($Active) {
        foreach ($y in 7, 8) { Set-Px $c 8 $y (Mix $P['V'] (Get-Px $c 8 $y) 0.4) }
        Set-Both $c $e 8 9 $P['T']
        # the power pulse (purple, with a dimmer tail) runs in along both leads to the clamp, then down the anode
        foreach ($lead in @($LeadL, $LeadR)) {
            Set-Both $c $e $lead[($k + 3) % 4] 3 $P['d']
            Set-Both $c $e $lead[$k] 3 $P['c']
        }
        if ($k -lt 3) { Set-Both $c $e 8 (4 + $k) $P['T'] }
    } else {
        # the cold crust has closed round it: only its stub shows on the surface
        Set-Px $c 8 7 $P['W']
    }

    # ---- oxygen bubbles: they leave the anode, rise through the melt and break at the surface (two streams, half a cycle apart)
    if ($Active) {
        foreach ($stream in @(@($BubbleL, 0), @($BubbleR, 2))) {
            $s = ($T + $stream[1]) % 4
            $b = $stream[0][$s]
            if ($s -lt 3) { Set-Both $c $e $b[0] $b[1] $P['3'] } else { Set-Px $c $b[0] $b[1] $P['4'] }
        }
    }

    # ---- the nichrome coil band (x3 and x13, y6..11): front turns on y6, y8, y10, the turns behind on y7, y9, y11. While the
    #      cell works every turn glows and the heat climbs through them, a row per frame; at rest they are cold copper-red
    foreach ($x in 3, 13) { foreach ($y in 6..11) {
        $front = (($y % 2) -eq 0)
        if ($Active) {
            $hot = ((($y + $T) % 4) -eq 0)
            $ch = if ($front) { $(if ($hot) { 'w' } else { 'x' }) } else { $(if ($hot) { 'x' } else { 'y' }) }
            $col = $P[$ch]
            if ($x -eq 13) { $col = Shade $col 0.86 }
            Set-Both $c $e $x $y $col
        } else {
            $col = $P[$(if ($front) { 'z' } else { 'L' })]
            if ($x -eq 13) { $col = Shade $col 0.8 }
            Set-Px $c $x $y $col
        }
    } }

    # ---- base strip (y13): EV purple stripes x3..9, state lamp x11..13 (the platinum plant's strip)
    foreach ($x in 3..9) {
        if (($x % 4) -lt 2) {
            if ($Active) { Set-Both $c $e $x 13 $P['c'] } else { Set-Px $c $x 13 $P['e'] }
        } else { Set-Px $c $x 13 $P['g'] }
    }
    if ($Active) {
        $core = if ($k -lt 2) { 'M' } else { 'N' }
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

if (Test-Want 'cell') { Out-Overlay 'block/multiblock/regolith_cell' ${function:New-RegolithCellFrame} 3 }

# ============================================================================================
#  VERIFY what was written (size, binary alpha, no pure black, mcmeta vs frames, empty casing ring, emissive subset,
#  animation that really animates) - the checks of the HV and EV sets
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
            if (($px -band 0xFFFFFF) -eq 0) { $black++ }
        }
    }
    if ($opaque -eq 0) { $msgs += 'fully transparent' }
    if ($black -gt 0) { $msgs += "$black pure-black px" }
    if (Test-Path -LiteralPath ($path + '.mcmeta')) {
        $n = [int]($img.H / 16)
        if ($n -lt 4 -or $n -gt 8) { $msgs += "animation has $n frames (expected 4-8)" }
        if ($rel -notlike '*_emissive.png') {
            $seen = @{}
            for ($f = 0; $f -lt $n; $f++) { $seen[(($img.P[($f * 256)..($f * 256 + 255)]) -join ',')] = 1 }
            if ($seen.Count -lt 4) { $msgs += "only $($seen.Count) distinct frames out of $n" }
        }
    }
    $nf = [int]($img.H / 16)
    for ($f = 0; $f -lt $nf; $f++) { for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
        if ($x -lt 1 -or $y -lt 1 -or $x -ge 15 -or $y -ge 15) {
            if ((($img.P[($f * 16 + $y) * 16 + $x] -shr 24) -band 255) -ne 0) { $msgs += "opaque pixel in the casing ring (frame $f, $x,$y)"; $f = $nf; $y = 16; break }
        }
    } } }
    if ($rel -like '*_active_emissive.png') {
        $colorPath = Join-Path $OutRoot (($rel -replace '_emissive\.png$', '.png') -replace '/', '\')
        $color = Read-Png $colorPath
        if ($color.H -ne $img.H) { $msgs += 'emissive strip height differs from the colour strip' }
        else {
            for ($i = 0; $i -lt $img.P.Length; $i++) {
                if ((($img.P[$i] -shr 24) -band 255) -ne 0 -and $img.P[$i] -ne $color.P[$i]) { $msgs += 'emissive pixel not present in colour layer'; break }
            }
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
    # --- stand-in for the bricks when the texture is missing: a copy of New-SinteredRegolith (Build-EVFoundationTextures.ps1)
    $RegolithPal = New-Pal 'a=A09B90 b=8A857B c=827D73 d=7A756C e=645F57 f=46423C g=58534C'
    function Get-RegolithBrick {
        param([int]$X, [int]$Y)
        $course = [int][Math]::Floor($Y / 8)
        $bx = ($X - 4 * $course + 16) % 16
        return @(($bx % 8), ($Y % 8), (2 * $course + [int][Math]::Floor($bx / 8)))
    }
    function New-StandInRegolith {
        $c = New-Canvas
        $P = $RegolithPal
        $speck = @{}
        foreach ($br in 0..3) {
            if ((Get-Noise $br 0 0 88) -lt 112) { $speck[$br] = @((1 + (Get-Noise $br 1 0 88) % 5), (1 + (Get-Noise $br 2 0 88) % 5)) }
        }
        for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
            $b = Get-RegolithBrick $x $y
            $u = $b[0]; $v = $b[1]; $br = $b[2]
            if ($u -eq 7 -or $v -eq 7) { $ch = 'f' }
            elseif (($u -eq 6 -and $v -eq 0) -or ($u -eq 0 -and $v -eq 6)) { $ch = 'c' }
            elseif ($u -eq 0 -or $v -eq 0) { $ch = 'a' }
            elseif ($u -eq 6 -or $v -eq 6) { $ch = 'e' }
            elseif ($speck.ContainsKey($br) -and $speck[$br][0] -eq $u -and $speck[$br][1] -eq $v) { $ch = 'g' }
            else {
                $bias = [int](((Get-Noise $br 7 0 89) - 128) * 24 / 128)
                $nz = (Get-Noise $x $y 0 (61 + 7 * $br)) + 4 * ($u + $v - 6) + $bias
                $ch = if ($nz -lt 70) { 'b' } elseif ($nz -lt 190) { 'c' } else { 'd' }
            }
            Set-Px $c $x $y $P[$ch]
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
    # a 3x3 wall of bricks with the controller on the middle block
    function New-Wall {
        param($Brick, $Face)
        $w = New-Canvas 48 48
        for ($j = 0; $j -lt 3; $j++) { for ($i = 0; $i -lt 3; $i++) { Merge-Canvas $w $Brick (16 * $i) (16 * $j) } }
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

    $brickRel = 'block\sintered_regolith.png'
    $brick = $null
    foreach ($root in @($OutRoot, $RepoTextures)) {
        $p0 = Join-Path $root $brickRel
        if ($null -eq $brick -and (Test-Path -LiteralPath $p0)) { $brick = Read-Png $p0 }
    }
    if ($null -eq $brick) { Write-Warning 'preview: block/sintered_regolith.png not found, using the stand-in bricks'; $brick = New-StandInRegolith }

    $dir = Join-Path $OutRoot 'block\multiblock\regolith_cell'
    $idle = Read-Png (Join-Path $dir 'overlay_front.png')
    $act = Read-Png (Join-Path $dir 'overlay_front_active.png')
    $emi = Read-Png (Join-Path $dir 'overlay_front_active_emissive.png')
    $tiles = New-Object System.Collections.Generic.List[object]
    $tiles.Add((Merge-On $brick $idle))
    for ($f = 0; $f -lt 8; $f++) { $tiles.Add((Merge-On (Merge-On $brick (Get-Frame $act $f)) (Get-Frame $emi $f))) }
    $tiles.Add((Get-Dark $brick (Get-Frame $act 0) (Get-Frame $emi 0)))
    $wallIdle = New-Wall $brick $idle
    $wallAct = New-Wall $brick (Merge-On (Get-Frame $act 0) (Get-Frame $emi 0))

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
        Write-Host ("| ``pack/kubejs/assets/grindless/textures/$rel`` | Generated with tools/assets/$ScriptName (procedural pixel art, original) by the regolith cell agent, 2026-10-25 | the pack's licence (pending; proposed CC BY-SA 4.0) |")
    }
}
