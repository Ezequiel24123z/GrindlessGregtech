<#
.SYNOPSIS
  Procedural 16x16 pixel art for the Large Steam family (GregTech Leisure's "Large Steam X" idea, docs/research/leisure.md 4.2 -
  idea only: no code, texture or text of GTL is used, its licence does not allow it): the controller faces of the large steam
  macerator, thermal centrifuge, ore washer, chemical bath and centrifuge. GregTech style: bevels, top-left light, every pixel fully
  opaque or transparent.

.DESCRIPTION
  Every pixel is drawn by this script (palettes + char maps + a few small routines); nothing is copied or edited from GregTech Modern,
  GregTech Leisure or any other mod. Output is deterministic: re-running overwrites the same bytes.

  The family is a step up from the small steam family (Build-SteamSmallFamilyTextures.ps1) at the Steam -> LV transition, and its
  shell is steel (startup_scripts/grindless/steam/large_family.js: gtceu:solid_machine_casing with bronze or steel frame posts), so
  the faces are steel-and-brass, drawn for GTM's solid steel casing (gtceu:block/casings/solid/machine_casing_solid_steel):
    - one shared frame: a steel bezel with four brass rivets, a brass trim (lit top and left, dark bottom and right) around a dark
      recessed window, and a steel base plate with the steam pressure bar (empty when idle, filling while it works) and the status
      lamp (dull red idle, green active);
    - one working icon per machine in the window, in bright steel, brass and its own colour, so each reads on the grey casing:
      macerator    two steel crusher jaws with big teeth biting ore; working, they grind (the jaws slide past each other), the
                   ore breaks into grit and sparks fly where the teeth meet;
      centrifuge   a rotor in its steel housing: a brass hub, four steel arms and four sample buckets (orange, blue, green, white);
                   working, it turns an eighth of a turn per frame;
      thermal      the same rotor inside a ring of copper heating coils; working, the coils glow orange-white (a hot spot runs round
      centrifuge   the ring) and heat shimmers over the rotor;
      chemical     a steel vat of green chemical with a basket of ore hanging from a hook; working, the basket is dipped and the
      bath         liquid bubbles; idle, the basket hangs above the still liquid;
      ore washer   a ribbed drum lying in a trough of water under a spray pipe; working, the ribs turn, drops fall from the pipe and
                   the water splashes.

  Writes (under pack/kubejs/assets/grindless/textures/):
    block/multiblock/large_steam_macerator/overlay_front.png, overlay_front_active.png(+.mcmeta), overlay_front_active_emissive.png(+.mcmeta)
    block/multiblock/large_steam_thermal_centrifuge/...   (same three)
    block/multiblock/large_steam_ore_washer/...            (same three)
    block/multiblock/large_steam_chemical_bath/...         (same three)
    block/multiblock/large_steam_centrifuge/...            (same three)

  Run from the repo root (PowerShell 5.1 blocks unsigned scripts by default; this bypass only affects that process):
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-SteamLargeFamilyTextures.ps1
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-SteamLargeFamilyTextures.ps1 -Only macerator,centrifuge
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-SteamLargeFamilyTextures.ps1 -Credits

  Overlay conventions (GTM's workable casings, as every other set): transparent background, details only on the overlay, animated
  variants are vertical 16x(16*n) strips with a .png.mcmeta, *_emissive layers hold only the pixels that glow (identical to the colour
  layer). The outer 1 px ring is always left empty so the casing shows around the face.

.PARAMETER Only
  Subset of: macerator, thermal, washer, bath, centrifuge. Default: all five.
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
    for ($i = 0; $i -lt $Rows.Count; $i++) { if ($Rows[$i].Length -ne $W) { throw "${Name}: row $i has $($Rows[$i].Length) chars, expected $W (got '$($Rows[$i])')" } }
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

function Set-Both {
    param($C, $E, [int]$X, [int]$Y, [int]$Argb)
    Set-Px $C $X $Y $Argb; Set-Px $E $X $Y $Argb
}

# An emissive pixel only counts while the colour layer still shows it: drops the ones a later draw covered (the rotor's buckets
# over the glowing coil; -Verbose lists how many).
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

# ============================================================================================
#  SHARED FAMILY PALETTE AND FRAME
#  Steel A..J: the neutral ramp of the LV-and-later faces (Build-LVTextures.ps1), lit -> dark. Brass Y y u U W O: the steam
#  family's ramp (Build-SteamSmallFamilyTextures.ps1), lit -> dark. Status lamp: green q Q r while working, red L l idle. Steam
#  pressure bar: s (steam white) and S (its lit head). Per-icon accents:
#    ore n N z (light, mid, dark) and grit g; sparks and heat h (white-hot) m (orange) k (deep orange); copper coils c K (lit, dark);
#    samples a (orange) b (blue) G (green) p (pale); chemical liquid V (lit) v (mid) x (deep) and its bubbles X; water w (lit)
#    t (mid) T (deep).
# ============================================================================================
$SteelSpec = 'A=D3D3D3 B=B0B0B0 C=8E8E8E D=707070 E=565656 F=404040 G=2F2F2F H=222222 I=161616 J=0D0D0D'
$FamPal = New-Pal ($SteelSpec.Replace('G=2F2F2F', 'R=2F2F2F') + ' ' + @'
Y=F6DC94 y=E0B45C u=B98A3E U=8B6430 W=5C401E O=36250F
q=4CFF7A Q=CFFFD8 r=19B84A L=B23A2C l=7E2A20
s=E8EEF2 S=FFFFFF
n=B8743A N=7A4A26 z=4E2E18 g=9A8F84
h=FFF3C8 m=FFB03A k=D2551E
c=E0874A K=8A4220
a=FF9A3C b=4FA8FF G=6BE06B p=F0F4F8
V=B6F27A v=6CCB3C x=3E8A24 X=E4FFC8
w=9FD8FF t=4C9BE6 T=2C5FA8
'@)
$WIN_X0 = 3
$WIN_Y0 = 3
$WIN_W = 10
$WIN_H = 8

# steel bezel (D lit, F shade) with brass rivets in its corners; brass trim around the window (y lit top/left, U dark bottom/right);
# the window x3..12, y3..10 ('.', filled by each icon over a dark backdrop); a steel base plate y12..13 for the pressure bar and lamp
$FrameBase = @(
    '................',
    '.YDDDDDDDDDDDDu.',
    '.DyyyyyyyyyyyyF.',
    '.Dy..........UF.',
    '.Dy..........UF.',
    '.Dy..........UF.',
    '.Dy..........UF.',
    '.Dy..........UF.',
    '.Dy..........UF.',
    '.Dy..........UF.',
    '.Dy..........UF.',
    '.DUUUUUUUUUUUUF.',
    '.DEEEEEEEEEEEEF.',
    '.DEFFFFFFFFEEEF.',
    '.uFFFFFFFFFFFFW.',
    '................'
)
Assert-Map 'FrameBase' $FrameBase

function New-Frame {
    $c = New-Canvas; $e = New-Canvas
    Write-Map $c 0 0 $FrameBase $FamPal
    # the dark recessed window: a shade under the top trim and down the left side, the rest near black
    for ($y = 0; $y -lt $WIN_H; $y++) { for ($x = 0; $x -lt $WIN_W; $x++) {
        $k = if ($y -eq 0 -or $x -eq 0) { 'H' } else { 'J' }
        Set-Px $c ($WIN_X0 + $x) ($WIN_Y0 + $y) $FamPal[$k]
    } }
    return @{ Color = $c; Emi = $e }
}

# window-local pixel helpers (local 0,0 = absolute WIN_X0,WIN_Y0); they ignore pixels outside the window
function Set-W {
    param($c, [int]$X, [int]$Y, [string]$K)
    if ($X -lt 0 -or $Y -lt 0 -or $X -ge $WIN_W -or $Y -ge $WIN_H) { return }
    Set-Px $c ($WIN_X0 + $X) ($WIN_Y0 + $Y) $FamPal[$K]
}
function Set-WBoth {
    param($c, $e, [int]$X, [int]$Y, [string]$K)
    if ($X -lt 0 -or $Y -lt 0 -or $X -ge $WIN_W -or $Y -ge $WIN_H) { return }
    Set-Both $c $e ($WIN_X0 + $X) ($WIN_Y0 + $Y) $FamPal[$K]
}

# base plate (y13): the steam pressure bar x3..10 (empty idle; filling one pixel a frame, with a lit head, while it works) and the
# lamp x12..13
function Paint-Plate {
    param($c, $e, [bool]$Active, [int]$T)
    if ($Active) {
        $fill = 1 + ($T % 8)
        for ($i = 0; $i -lt $fill; $i++) { Set-Px $c (3 + $i) 13 $FamPal['s'] }
        Set-Both $c $e (2 + $fill) 13 $FamPal['S']
        $core = if (($T % 2) -eq 0) { 'Q' } else { 'q' }
        Set-Both $c $e 12 13 $FamPal[$core]
        Set-Both $c $e 13 13 $FamPal['q']
        Set-Px $c 12 12 $FamPal['r']
    } else {
        Set-Px $c 12 13 $FamPal['L']; Set-Px $c 13 13 $FamPal['l']
        Set-Px $c 12 12 $FamPal['l']
    }
}

# ============================================================================================
#  ICONS (window-local coordinates, 10 x 8). Each paints $c/$e in place over the dark window.
# ============================================================================================

# MACERATOR: two crusher jaws with big triangular teeth (steel), ore caught between them. Working: the top jaw slides right and the
# bottom one left (the teeth grind past each other), the ore breaks into grit and sparks fly where two teeth meet.
function Paint-Macerator {
    param($c, $e, [bool]$Active, [int]$T)
    $s = if ($Active) { $T % 4 } else { 0 }
    # a few lumps of ore in the zigzag channel between the teeth (darker than the steel, so the teeth stand out); while it works
    # they break into grit, and the teeth (drawn next) bite into them
    foreach ($o in @(@(3, 3, 'n'), @(4, 4, 'N'), @(7, 3, 'n'), @(8, 4, 'z'), @(0, 4, 'N'), @(2, 4, 'z'))) {
        $k = $o[2]
        if ($Active -and ((Get-Noise $o[0] $o[1] $T 7) % 3) -eq 0) { $k = 'g' }
        Set-W $c $o[0] $o[1] $k
    }
    # jaw backs and faces
    for ($x = 0; $x -lt $WIN_W; $x++) {
        Set-W $c $x 0 'D'; Set-W $c $x 1 'A'
        Set-W $c $x 6 'C'; Set-W $c $x 7 'E'
    }
    # teeth every 4 px: a 3 px base and a 1 px tip; the top row points down and moves right with s, the bottom row points up,
    # half a tooth along, and moves left
    for ($i = -1; $i -le 3; $i++) {
        $tx = 4 * $i + $s
        Set-W $c $tx 2 'A'; Set-W $c ($tx + 1) 2 'A'; Set-W $c ($tx + 2) 2 'B'; Set-W $c ($tx + 1) 3 'B'
        $bx = 4 * $i + 2 - $s
        Set-W $c $bx 5 'B'; Set-W $c ($bx + 1) 5 'C'; Set-W $c ($bx + 2) 5 'D'; Set-W $c ($bx + 1) 4 'C'
    }
    if (-not $Active) { return }
    # sparks where a top tooth's tip passes a bottom one's (every other frame)
    if (($T % 2) -eq 1) {
        for ($i = -1; $i -le 3; $i++) {
            $x = 4 * $i + $s + 1
            Set-WBoth $c $e $x 4 'h'
            Set-WBoth $c $e ($x + 1) 3 'm'
        }
    }
}

# the bowl both centrifuges' rotors turn in: a disc round the window's middle (centre 5,4 in window pixel corners, radius 4). Rim
# pixels (outer 1 px of the disc) get the housing; the rest is the dark bowl.
function Get-BowlPart {
    param([int]$X, [int]$Y)
    $dx = ($X + 0.5) - 5.0; $dy = ($Y + 0.5) - 4.0
    $d = [Math]::Sqrt($dx * $dx + $dy * $dy)
    if ($d -gt 4.05) { return 'out' }
    if ($d -gt 3.0) { if ($dx + $dy -lt -0.5) { return 'rimlit' } elseif ($dx + $dy -gt 0.5) { return 'rimshade' } else { return 'rim' } }
    return 'bowl'
}

# the rotor: a brass hub at (4..5, 3..4), four arms 2 px wide and a 2 px bucket at each end. $Step 0..7 is the angle in eighths of a
# turn: even steps draw a "+", odd steps an "x"; the bucket colours walk round, so it is seen to turn.
$RotorPlus = @(
    @{ Arm = @(@(4, 1), @(5, 1), @(4, 2), @(5, 2)); Bucket = @(@(4, 0), @(5, 0)) },
    @{ Arm = @(@(6, 3), @(6, 4), @(7, 3), @(7, 4)); Bucket = @(@(8, 3), @(8, 4)) },
    @{ Arm = @(@(4, 5), @(5, 5), @(4, 6), @(5, 6)); Bucket = @(@(4, 7), @(5, 7)) },
    @{ Arm = @(@(2, 3), @(2, 4), @(3, 3), @(3, 4)); Bucket = @(@(1, 3), @(1, 4)) }
)
$RotorCross = @(
    @{ Arm = @(@(6, 2), @(7, 1)); Bucket = @(@(7, 0), @(8, 1)) },
    @{ Arm = @(@(6, 5), @(7, 6)); Bucket = @(@(8, 6), @(7, 7)) },
    @{ Arm = @(@(3, 5), @(2, 6)); Bucket = @(@(1, 6), @(2, 7)) },
    @{ Arm = @(@(3, 2), @(2, 1)); Bucket = @(@(1, 1), @(2, 0)) }
)
$BucketColours = @('a', 'b', 'G', 'p')
function Paint-Rotor {
    param($c, $e, [int]$Step, [string]$ArmLit = 'A', [string]$ArmShade = 'C')
    $arms = if (($Step % 2) -eq 0) { $RotorPlus } else { $RotorCross }
    $turn = [int][Math]::Floor($Step / 2)
    for ($i = 0; $i -lt 4; $i++) {
        $a = $arms[$i]
        foreach ($p in $a.Arm) { Set-W $c $p[0] $p[1] $(if (($p[0] + $p[1]) % 2 -eq 0) { $ArmLit } else { $ArmShade }) }
        foreach ($p in $a.Bucket) { Set-W $c $p[0] $p[1] $BucketColours[($i + $turn) % 4] }
    }
    Set-W $c 4 3 'Y'; Set-W $c 5 3 'y'; Set-W $c 4 4 'u'; Set-W $c 5 4 'U'
}

# CENTRIFUGE: the rotor in its round steel bowl. Working: it turns an eighth of a turn per frame and a glint runs round the rim.
function Paint-Centrifuge {
    param($c, $e, [bool]$Active, [int]$T)
    for ($y = 0; $y -lt $WIN_H; $y++) { for ($x = 0; $x -lt $WIN_W; $x++) {
        $part = Get-BowlPart $x $y
        if ($part -eq 'out') { continue }
        $k = switch ($part) { 'rimlit' { 'C' } 'rimshade' { 'F' } 'rim' { 'D' } default { 'R' } }
        Set-W $c $x $y $k
    } }
    $step = if ($Active) { $T % 8 } else { 0 }
    Paint-Rotor $c $e $step
    if ($Active) {
        $glint = @(@(2, 1), @(1, 2), @(1, 3), @(2, 0))[$T % 4]
        Set-W $c $glint[0] $glint[1] 'A'
    }
}

# THERMAL CENTRIFUGE: the same rotor in a bowl whose rim is a ring of copper heating coils. Idle: cold copper. Working: the coils
# glow orange with a white-hot spot running round, and the rotor turns.
$CoilRing = @(@(3, 0), @(4, 0), @(5, 0), @(6, 0), @(7, 1), @(8, 2), @(8, 3), @(8, 4), @(8, 5), @(7, 6), @(6, 7), @(5, 7), @(4, 7), @(3, 7), @(2, 6), @(1, 5), @(1, 4), @(1, 3), @(1, 2), @(2, 1))
function Paint-ThermalCentrifuge {
    param($c, $e, [bool]$Active, [int]$T)
    for ($y = 0; $y -lt $WIN_H; $y++) { for ($x = 0; $x -lt $WIN_W; $x++) {
        $part = Get-BowlPart $x $y
        if ($part -eq 'out') { continue }
        Set-W $c $x $y $(if ($part -eq 'bowl') { 'R' } else { 'K' })
    } }
    # the coil: copper turns with dark gaps (cold), glowing from deep orange to white-hot while it works
    for ($y = 0; $y -lt $WIN_H; $y++) { for ($x = 0; $x -lt $WIN_W; $x++) {
        $part = Get-BowlPart $x $y
        if ($part -eq 'out' -or $part -eq 'bowl') { continue }
        $turnPx = ((($x + $y) % 2) -eq 0)
        if (-not $Active) { Set-W $c $x $y $(if ($turnPx) { 'c' } else { 'K' }); continue }
        $k = if ($turnPx) { 'm' } else { 'k' }
        Set-WBoth $c $e $x $y $k
    } }
    if ($Active) {
        # a white-hot spot runs round the coil, two pixels at a time
        $i0 = ($T * 5) % $CoilRing.Count
        foreach ($j in 0, 1) { $p = $CoilRing[($i0 + $j) % $CoilRing.Count]; Set-WBoth $c $e $p[0] $p[1] 'h' }
    }
    $step = if ($Active) { $T % 8 } else { 0 }
    Paint-Rotor $c $e $step
}

# CHEMICAL BATH: a steel vat of green chemical (rows 4..7) with a brass rim, and a basket of ore on a hook from the top. Idle: the
# basket hangs above the still liquid. Working: the basket is down in the bath and bubbles rise round it; the surface shimmers.
function Paint-ChemicalBath {
    param($c, $e, [bool]$Active, [int]$T)
    # the vat: steel walls x0 and x9, a floor at row 7, the brass rim at row 3
    for ($y = 4; $y -le 7; $y++) { Set-W $c 0 $y 'D'; Set-W $c 9 $y 'E' }
    for ($x = 1; $x -le 8; $x++) { Set-W $c $x 7 'E' }
    Set-W $c 0 3 'y'; Set-W $c 9 3 'u'
    # the liquid: lit surface row 4, mid and deep below
    for ($x = 1; $x -le 8; $x++) {
        $surf = if ($Active -and ((($x + $T) % 4) -eq 0)) { 'X' } else { 'V' }
        Set-W $c $x 4 $surf; Set-W $c $x 5 'v'; Set-W $c $x 6 'x'
    }
    # the hook (rows 0..1) and the basket: up at rows 1..3 idle, dipped to rows 3..5 while working
    $by = if ($Active) { 3 } else { 1 }
    for ($y = 0; $y -lt $by; $y++) { Set-W $c 5 $y 'C' }
    Set-W $c 3 $by 'B'; Set-W $c 4 $by 'A'; Set-W $c 5 $by 'A'; Set-W $c 6 $by 'B'; Set-W $c 7 $by 'C'
    Set-W $c 3 ($by + 1) 'C'; Set-W $c 4 ($by + 1) 'n'; Set-W $c 5 ($by + 1) 'N'; Set-W $c 6 ($by + 1) 'n'; Set-W $c 7 ($by + 1) 'D'
    Set-W $c 4 ($by + 2) 'D'; Set-W $c 5 ($by + 2) 'C'; Set-W $c 6 ($by + 2) 'D'
    if (-not $Active) { return }
    # bubbles rise from the basket on both sides, three at a time
    $bub = @(@(2, 6), @(2, 5), @(1, 4), @(8, 6), @(8, 5), @(8, 4), @(2, 6), @(1, 5))
    for ($i = 0; $i -lt 3; $i++) {
        $p = $bub[($T + $i * 3) % 8]
        Set-WBoth $c $e $p[0] $p[1] 'X'
    }
}

# ORE WASHER: a ribbed steel drum lying in a trough of water, under a spray pipe. Idle: still drum, calm water. Working: the ribs
# move (the drum turns), drops fall from the pipe's nozzles and the water splashes against the drum.
function Paint-OreWasher {
    param($c, $e, [bool]$Active, [int]$T)
    # the spray pipe along the top with two nozzles
    for ($x = 1; $x -le 8; $x++) { Set-W $c $x 0 'C' }
    Set-W $c 0 0 'D'; Set-W $c 9 0 'D'
    Set-W $c 3 1 'E'; Set-W $c 6 1 'E'
    # the drum: rows 2..6, x1..8, end caps in brass, ribs every 2 px that move with the turn
    $phase = if ($Active) { $T % 2 } else { 0 }
    for ($y = 2; $y -le 6; $y++) {
        Set-W $c 1 $y $(if ($y -le 3) { 'y' } else { 'u' })
        Set-W $c 8 $y $(if ($y -le 3) { 'u' } else { 'U' })
        for ($x = 2; $x -le 7; $x++) {
            $rib = ((($x + $phase) % 2) -eq 0)
            $k = if ($y -eq 2) { if ($rib) { 'A' } else { 'B' } } elseif ($y -eq 6) { if ($rib) { 'E' } else { 'F' } } else { if ($rib) { 'B' } else { 'D' } }
            Set-W $c $x $y $k
        }
    }
    # the water in the trough (row 7, and up the drum's foot at row 6 on both sides)
    for ($x = 0; $x -le 9; $x++) { Set-W $c $x 7 $(if ($Active -and ((($x + $T) % 4) -eq 0)) { 'w' } else { 't' }) }
    Set-W $c 0 6 'T'; Set-W $c 9 6 'T'
    if (-not $Active) { return }
    # drops from the nozzles (they fall down the sides of the drum's top), and a splash at the trough
    $drop = $T % 4
    Set-W $c 3 (1 + $drop) $(if ($drop -eq 0) { 'w' } else { 'w' })
    Set-W $c 6 (1 + (($drop + 2) % 4)) 'w'
    if ($drop -eq 3) { Set-W $c 0 6 'w'; Set-W $c 9 5 'w' }
}

# ============================================================================================
#  BUILD
# ============================================================================================
$MACHINES = @(
    @{ Id = 'macerator'; Dir = 'large_steam_macerator'; Paint = ${function:Paint-Macerator} },
    @{ Id = 'thermal'; Dir = 'large_steam_thermal_centrifuge'; Paint = ${function:Paint-ThermalCentrifuge} },
    @{ Id = 'washer'; Dir = 'large_steam_ore_washer'; Paint = ${function:Paint-OreWasher} },
    @{ Id = 'bath'; Dir = 'large_steam_chemical_bath'; Paint = ${function:Paint-ChemicalBath} },
    @{ Id = 'centrifuge'; Dir = 'large_steam_centrifuge'; Paint = ${function:Paint-Centrifuge} }
)

foreach ($mc in $MACHINES) {
    if (-not (Test-Want $mc.Id)) { continue }
    $frames = @(); $emis = @()
    for ($t = 0; $t -lt 8; $t++) {
        $f = New-Frame
        & $mc.Paint $f.Color $f.Emi $true $t
        Paint-Plate $f.Color $f.Emi $true $t
        Sync-Emissive $f.Color $f.Emi
        $frames += $f.Color; $emis += $f.Emi
    }
    $idle = New-Frame
    & $mc.Paint $idle.Color $idle.Emi $false 0
    Paint-Plate $idle.Color $idle.Emi $false 0

    Out-Tex $idle.Color ('block/multiblock/' + $mc.Dir + '/overlay_front.png')
    Out-Tex (Join-Frames $frames) ('block/multiblock/' + $mc.Dir + '/overlay_front_active.png') 3
    Out-Tex (Join-Frames $emis) ('block/multiblock/' + $mc.Dir + '/overlay_front_active_emissive.png') 3
}

# ============================================================================================
#  VERIFY what was written (size, binary alpha, no pure black, 8-frame strips that really animate, an idle face that is not the
#  first working frame, empty casing ring, emissive pixels present in every frame and identical in the colour layer)
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
        $seen = @{}
        for ($f = 0; $f -lt $nf; $f++) { $seen[(($img.P[($f * 256)..($f * 256 + 255)]) -join ',')] = 1 }
        if ($rel -notlike '*_emissive.png' -and $seen.Count -lt 4) { $msgs += "only $($seen.Count) distinct frames out of $nf" }
        if ($rel -like '*_emissive.png') {
            for ($f = 0; $f -lt $nf; $f++) {
                $lit = 0
                for ($i = $f * 256; $i -lt ($f + 1) * 256; $i++) { if ((($img.P[$i] -shr 24) -band 255) -ne 0) { $lit++ } }
                if ($lit -eq 0) { $msgs += "emissive frame $f is empty"; break }
            }
        }
    }
    for ($f = 0; $f -lt $nf; $f++) { for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
        if ($x -lt 1 -or $y -lt 1 -or $x -ge 15 -or $y -ge 15) {
            if ((($img.P[($f * 16 + $y) * 16 + $x] -shr 24) -band 255) -ne 0) { $msgs += "opaque pixel in the casing ring (frame $f, $x,$y)"; $f = $nf; $y = 16; break }
        }
    } } }
    if ($rel -like '*_active_emissive.png') {
        $color = Read-Png (Join-Path $OutRoot (($rel -replace '_emissive\.png$', '.png') -replace '/', '\'))
        if ($color.H -ne $img.H) { $msgs += 'emissive strip height differs from the colour strip' }
        else {
            for ($i = 0; $i -lt $img.P.Length; $i++) {
                if ((($img.P[$i] -shr 24) -band 255) -ne 0 -and $img.P[$i] -ne $color.P[$i]) { $msgs += 'emissive pixel not present in colour layer'; break }
            }
        }
    }
    if ($rel -like '*/overlay_front.png') {
        $active = Read-Png (Join-Path $OutRoot (($rel -replace 'overlay_front\.png$', 'overlay_front_active.png') -replace '/', '\'))
        if ((($img.P) -join ',') -eq (($active.P[0..255]) -join ',')) { $msgs += 'the idle face is the first working frame' }
    }
    if ($msgs.Count -gt 0) { $problems++; Write-Warning "$rel : $($msgs -join '; ')" }
}

Write-Host "written $($written.Count) files under $OutRoot ($problems with warnings)"
foreach ($rel in $written) { Write-Host "  $rel" }
if ($problems -gt 0) { exit 1 }

if ($Credits) {
    Write-Host ''
    foreach ($rel in $written) {
        Write-Host ("| ``pack/kubejs/assets/grindless/textures/$rel`` | Generated with tools/assets/$ScriptName (procedural pixel art, original) by the gallery agent, 2026-10-25 | the pack's own (pending; proposed CC BY-SA 4.0) |")
    }
}
