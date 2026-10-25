<#
.SYNOPSIS
  Procedural 16x16 pixel art for the two controller faces of IV's uranium cycle of Gregtech Grindless: the In-Situ Leach Field
  and the Fuel Fabrication Plant (GregTech style: bevels, top-left light, every pixel fully opaque or fully transparent).

.DESCRIPTION
  Every pixel is drawn by this script (palettes + char maps + small routines); nothing is copied or edited from GregTech Modern
  or any other mod. Output is deterministic: re-running overwrites the same bytes (the furnace shimmer comes from Get-Noise, a
  hash of position and frame, not from a random generator). Same method, steel bezel, lamp ramp, IV blue and checks as the
  fission reactor's face (Build-FissionReactorTextures.ps1, itself after the EV faces of Build-CombinedCycleHotMillTextures.ps1
  and Build-ExtractionCascadeTextures.ps1); the helpers are copied so those scripts stay untouched.

  Writes (under pack/kubejs/assets/grindless/textures/):
    block/multiblock/isr_wellfield/overlay_front.png, overlay_front_active.png(+.mcmeta), overlay_front_active_emissive.png(+.mcmeta)
    block/multiblock/fuel_fabrication_plant/...    (same three)

  isr_wellfield (gtceu:isr_wellfield, on GTM's inert PTFE casing): a dark mimic of the five-spot at the top left, with the four
  injection wells at its corners, the production well in the middle and a flow line from each corner to it; the production line
  runs right to the header house, two ion-exchange columns side by side, and the return main carries the barren lixiviant back
  under the field and up to the wells. 8 frames, frametime 4: the injection wells are lit IV blue and send pulses of lixiviant
  down the diagonals (opposite wells together, the other pair half a beat later), the production well and its line are lit
  yellow-green (uranyl sulfate) with a pulse running to the header, a yellow loading band rises in each column and resets (the
  second column half a loop behind the first: lead and lag), and blue pulses run back along the return main. Idle: unlit wells
  (a muted blue, the producer olive), grey lines, empty amber resin in the columns.

  fuel_fabrication_plant (gtceu:fuel_fabrication_plant, on GTM's clean stainless steel casing): a row of four status lamps
  (press, sinter, pilger, glovebox) along the top, the sintering furnace's window under them, and under that a row of UO2
  pellets on a tray feeding into a Zircaloy cladding tube, drawn cut open, with its progress cells underneath. 8 frames,
  frametime 4: the furnace glows orange (hottest in the middle and at the heaters on top), breathes and shimmers while boats of
  pellets cross its hearth as dark silhouettes; the pellets advance one cell a frame and fill the tube (empty on frame 0, full
  on frame 7, then the next tube) and a green cell lights under each one that is in; the four lamps are lit blue and a brighter
  one runs along them. Idle: a cold furnace (its heater coils and the boats of pellets on the hearth), an empty tube, unlit lamps
  and cells.

  The *_emissive layers hold only the lit wells, the lit flow and the lit column cells (leach field), and only the furnace glow,
  the lit lamps and the lit progress cells (fuel plant: the pellets and the boats are dark and never glow).

  Run from the repo root (PowerShell 5.1 blocks unsigned scripts by default; this bypass only affects that process):
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-UraniumCycleTextures.ps1
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-UraniumCycleTextures.ps1 -Only isr,fuel -Credits
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-UraniumCycleTextures.ps1 -Preview C:\path\uranium-cycle.png -PtfeCasing C:\path\machine_casing_inert_ptfe.png -StainlessCasing C:\path\machine_casing_clean_stainless_steel.png

  Overlay conventions (GTM's workable casings, as every other set): transparent background, details only on the overlay,
  animated variants are vertical 16x(16*n) strips with a .png.mcmeta, *_emissive layers hold only the pixels that glow
  (identical to the colour layer). Every pixel is fully opaque or fully transparent and none is pure black. The outer 1 px ring
  is always left empty so the casing shows around the face. Drawn for gtceu:block/casings/solid/machine_casing_inert_ptfe (the
  leach field's header house, a dark grey plate in GTM 7.5.3) and gtceu:block/casings/solid/machine_casing_clean_stainless_steel
  (the fuel plant, a pale blue-grey plate); each face has its own dark frame, so it also reads on other casings. The final check
  fails the run (non-zero exit) if a written file breaks one of these rules, if a frame repeats the next one, if the panel has a
  hole, or if light comes from anywhere but the face's lights.

.PARAMETER Only
  Subset of: isr (isr_wellfield), fuel (fuel_fabrication_plant); comma-separated, also as one string with -File. Default: both.
.PARAMETER OutRoot
  Textures root. Default: <repo>/pack/kubejs/assets/grindless/textures
.PARAMETER Preview
  Also write a review sheet (x8, nearest neighbour) to this PNG, which must be outside the repository (it is never shipped). Per
  face: the idle face and the 8 active frames on its casing; the raw colour layers on a checker (transparency check); the
  emissive layer alone on black; a dark-room view (casing and colour layer dimmed, emissive at full brightness); and, at the
  right, the face idle and active on the other face's casing. At the bottom, a 3x3 wall of each face's casing, idle and active.
.PARAMETER PtfeCasing
  Optional 16x16 PNG used as the leach field's casing in the preview (GTM's machine_casing_inert_ptfe.png, extracted from the
  jar and kept outside the repository). Without it a flat grey of its tone stands in. Context only: never written anywhere.
.PARAMETER StainlessCasing
  The same for the fuel plant (GTM's machine_casing_clean_stainless_steel.png); without it a flat pale blue-grey stands in.
.PARAMETER Credits
  Also print the CREDITS.md "Assets" table rows for the files written.
#>
[CmdletBinding()]
param(
    [string]$OutRoot = '',
    [string[]]$Only = @(),
    [string]$Preview = '',
    [string]$PtfeCasing = '',
    [string]$StainlessCasing = '',
    [switch]$Credits
)
$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'Pixel.Lib.ps1')

# `powershell -File ... -Only a,b` delivers "a,b" as one string: split it so both calling styles work.
$Only = @($Only | ForEach-Object { $_ -split '[,;\s]+' } | Where-Object { $_ })
$Known = @('isr', 'fuel')
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
if ($PtfeCasing) {
    $PtfeCasing = $ExecutionContext.SessionState.Path.GetUnresolvedProviderPathFromPSPath($PtfeCasing)
    if (-not (Test-Path -LiteralPath $PtfeCasing)) { throw "-PtfeCasing not found: $PtfeCasing" }
}
if ($StainlessCasing) {
    $StainlessCasing = $ExecutionContext.SessionState.Path.GetUnresolvedProviderPathFromPSPath($StainlessCasing)
    if (-not (Test-Path -LiteralPath $StainlessCasing)) { throw "-StainlessCasing not found: $StainlessCasing" }
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

# Index into a ramp that repeats every $N cells (PowerShell's % keeps the sign of a negative operand).
function Get-Wrap { param([int]$V, [int]$N) return ((($V % $N) + $N) % $N) }

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
# IV accent (GTM writes IV in blue), white -> deep: the same ramp as the fission reactor's Cherenkov glow.
$IvBlueSpec = 'a=EAFAFF b=BDEBFF c=8FD8FF d=63C2FF e=3FA9FF f=2C86E6 g=2164C2'

# ============================================================================================
#  IN-SITU LEACH FIELD - controller face (inert PTFE casing)
#  five-spot mimic (dark recess x3..9 y3..9: injection wells at its corners 3,3 9,3 9,9 3,9, production well at 6,6, two flow
#  pixels on each diagonal), its lit lip (y10 and x10), the production line along y6 (x7..10) into the header house (x11..13
#  y3..11: column A at x11, column B at x13, cells y4..10 between a lit cap and a dark foot, a steel spine at x12), and the return
#  main along y12 (x13 -> x3) and up x3 (y11, y10) to the south-west well
# ============================================================================================
#   k mimic recess          l idle flow line (in the recess)          L idle return main (on the panel)
#   wells off: u injection (dark blue), v production (dark olive)     h the return main's deep blue (its pulses run on it)
#   uranyl sulfate, lit -> dim: x y z w            column cells: q empty resin, r loaded, s the loading front
$IsrPal = New-Pal ($SteelSpec + ' ' + $IvBlueSpec + ' ' + @'
k=142228 l=7A8C96 L=8A979E h=1B3F78
u=3A68A4 v=6E7F2E
x=EEFF9E y=C3E04A z=86A82A w=58731C
q=5C4A1E r=D8B22A s=FFE46E
'@)

$IsrBase = @(
    '................',
    '.CDDDDDDDDDDDDE.',
    '.DGGGGGGGGGGGGF.',
    '.DGukkkkkuECECF.',
    '.DGklkkklkEqFqF.',
    '.DGkklklkkEqFqF.',
    '.DGkkkvllllqFqF.',
    '.DGkklklkkEqFqF.',
    '.DGklkkklkEqFqF.',
    '.DGukkkkkuEqFqF.',
    '.DGLEEEEEEFqFqF.',
    '.DGLGGGGGGGEFEF.',
    '.DGLLLLLLLLLLLF.',
    '.DGGGGGGGGGGGGF.',
    '.EFFFFFFFFFFFFG.',
    '................'
)
Assert-Map 'IsrBase' $IsrBase

$IsrWells = @(@(3, 3), @(9, 3), @(9, 9), @(3, 9))       # injection wells NW, NE, SE, SW
# each injection well's flow line to the production well, the well's end first
$IsrLines = @(
    @(@(4, 4), @(5, 5)),
    @(@(8, 4), @(7, 5)),
    @(@(8, 8), @(7, 7)),
    @(@(4, 8), @(5, 7))
)
$IsrLag = @(0, 2, 0, 2)                                    # opposite wells pulse together, the other pair half a beat later
$IsrProducer = @(6, 6)
$IsrHeaderLine = @(@(7, 6), @(8, 6), @(9, 6), @(10, 6))    # production line, from the well to the header house
$IsrMain = New-Object System.Collections.Generic.List[object]
for ($x = 13; $x -ge 3; $x--) { $IsrMain.Add(@($x, 12)) }   # return main, from under the house back to the south-west well
$IsrMain.Add(@(3, 11)); $IsrMain.Add(@(3, 10))
$IsrColumns = @(11, 13)
$IsrColumnLag = @(0, 4)                                    # lead and lag: column B loads half a loop behind column A
$IsrCellBottom = 10; $IsrCells = 7
$IsrAcid = 'defg'                                          # lixiviant pulse: head -> trailing line (the lit wells stay brighter)
$IsrBarren = 'efgh'                                        # the same on the return main, a step dimmer so the field leads
$IsrUranyl = 'xyzw'                                        # pregnant solution pulse: head -> trailing line

function New-IsrFrame {
    param([bool]$Active, [int]$T = 0)
    $c = New-Canvas; $e = New-Canvas
    $P = $IsrPal
    Write-Map $c 0 0 $IsrBase $P

    if ($Active) {
        # ---- injection: each well flashes as a slug of lixiviant leaves it, and the pulse runs down its diagonal
        for ($k = 0; $k -lt $IsrWells.Count; $k++) {
            $ph = ($T + $IsrLag[$k]) % 4
            $w = $IsrWells[$k]
            Set-Both $c $e $w[0] $w[1] $P[$(if ($ph -eq 0) { 'b' } else { 'c' })]
            for ($i = 0; $i -lt 2; $i++) {
                $px = $IsrLines[$k][$i]
                Set-Both $c $e $px[0] $px[1] $P[[string]$IsrAcid[(Get-Wrap ($ph - $i) 4)]]
            }
        }
        # ---- production: the well brightens as each pair's pulses reach it; the pregnant solution runs to the header house
        Set-Both $c $e $IsrProducer[0] $IsrProducer[1] $P[$(if (($T % 2) -eq 0) { 'x' } else { 'y' })]
        for ($i = 0; $i -lt $IsrHeaderLine.Count; $i++) {
            $px = $IsrHeaderLine[$i]
            Set-Both $c $e $px[0] $px[1] $P[[string]$IsrUranyl[(Get-Wrap ($T - $i) 4)]]
        }
        # ---- the barren lixiviant goes back to the field along the return main
        for ($i = 0; $i -lt $IsrMain.Count; $i++) {
            $px = $IsrMain[$i]
            Set-Both $c $e $px[0] $px[1] $P[[string]$IsrBarren[(Get-Wrap ($T - $i) 4)]]
        }
        # ---- ion exchange: a yellow loading band rises one cell a frame in each column, then the column is eluted (0..7 cells)
        for ($j = 0; $j -lt $IsrColumns.Count; $j++) {
            $level = ($T + $IsrColumnLag[$j]) % 8
            for ($n = 0; $n -lt $level; $n++) {
                Set-Both $c $e $IsrColumns[$j] ($IsrCellBottom - $n) $P[$(if ($n -eq $level - 1) { 's' } else { 'r' })]
            }
        }
    }

    Sync-Emissive $c $e
    return @{ Color = $c; Emi = $e }
}

# Where light may come from: the five wells, the flow lines, the production line, the return main and the column cells.
$IsrGlowZone = New-Object 'System.Collections.Generic.HashSet[int]'
foreach ($w in $IsrWells) { [void]$IsrGlowZone.Add($w[1] * 16 + $w[0]) }
foreach ($line in $IsrLines) { foreach ($px in $line) { [void]$IsrGlowZone.Add($px[1] * 16 + $px[0]) } }
[void]$IsrGlowZone.Add($IsrProducer[1] * 16 + $IsrProducer[0])
foreach ($px in $IsrHeaderLine) { [void]$IsrGlowZone.Add($px[1] * 16 + $px[0]) }
foreach ($px in $IsrMain) { [void]$IsrGlowZone.Add($px[1] * 16 + $px[0]) }
foreach ($x in $IsrColumns) { for ($n = 0; $n -lt $IsrCells; $n++) { [void]$IsrGlowZone.Add(($IsrCellBottom - $n) * 16 + $x) } }

# ============================================================================================
#  FUEL FABRICATION PLANT - controller face (clean stainless steel casing)
#  four status lamps (y3: x3..4 press, x6..7 sinter, x9..10 pilger, x12..13 glovebox), the sintering furnace (steel frame x3..13
#  y4..8, window x4..12 y5..7: heaters on top, the hearth with its boats below), the pellet tray (x3..5 y11 on a steel tray at
#  y12), the Zircaloy tube cut open (walls y10 and y12, bore x6..12 y11, end plug x13) and its progress cells (x6..12 y13)
# ============================================================================================
#   furnace glow, white-hot -> dark red: h i j k l m       idle window: n glass, w glint, o deep, t a cold heater coil
#   p a boat of pellets
#   UO2 pellets: u lit, v shade (they alternate, so the row is seen to move)
#   Zircaloy (silver with a faint green-grey cast), lit -> dark: 1 2 3 4
#   off: q progress cell, r / s a status lamp (lit side / shaded side)
$FuelPal = New-Pal ($SteelSpec + ' ' + $LampSpec + ' ' + $IvBlueSpec + ' ' + @'
h=FFF6D0 i=FFDA7A j=FFAE45 k=F27F2A l=C9531D m=8C3417
n=3A302C w=8C8078 o=241C1A p=2A201C t=7A5A48
u=A2988E v=6E655C
1=E8EBE0 2=C3C7B6 3=A3A795 4=777B6B
q=2C5A3A r=2F4C7C s=22385E
'@)

$FuelBase = @(
    '................',
    '.CDDDDDDDDDDDDE.',
    '.DGGGGGGGGGGGGF.',
    '.DGrsIrsIrsIrsF.',
    '.DGCBBBBBBBBBDF.',
    '.DGBnnnnnnnnnEF.',
    '.DGCnnnnnnnnnEF.',
    '.DGCnnnnnnnnnFF.',
    '.DGDEEEEEEEEEFF.',
    '.DGGGGGGGGGGGGF.',
    '.DGGGG21111113F.',
    '.DGuvuIIIIIII4F.',
    '.DGEFF33333334F.',
    '.DGGGGqqqqqqqGF.',
    '.EFFFFFFFFFFFFG.',
    '................'
)
Assert-Map 'FuelBase' $FuelBase

$FuelLamps = @(3, 6, 9, 12)                     # left pixel of each 2 px lamp: press, sinter, pilger, glovebox
$FuelLampY = 3
$FuelGlassX0 = 4; $FuelGlassX1 = 12; $FuelGlassY0 = 5; $FuelGlassY1 = 7
$FuelHot = 'hijklm'
$FuelHotX = 8                                    # the middle of the hot zone
# The furnace breathes (negative = hotter): one slow swell per loop, out of step with the reactor's pool.
$FuelBreath = @(0, 0, -1, -1, 0, 0, 1, 1)
# Idle window (a cold furnace): the heater coils along its top, a glint at its left and the deep at its right, and the boats of
# pellets standing on the hearth where frame 0 has them.
$FuelIdleGlass = @{ '4,5' = 't'; '6,5' = 't'; '8,5' = 't'; '10,5' = 't'; '12,5' = 't'; '4,6' = 'w'; '5,6' = 'w'; '12,6' = 'o'; '11,6' = 'o' }
$FuelIdleBoat = 'v'
$FuelTrayX = @(3, 4, 5)
$FuelBoreX = 6; $FuelBoreY = 11; $FuelCells = 7
$FuelBarY = 13

function Get-PelletTone {
    param([int]$X, [int]$Shift)
    if ((Get-Wrap ($X - $Shift) 2) -eq 0) { return 'u' } else { return 'v' }
}

function New-FuelFrame {
    param([bool]$Active, [int]$T = 0)
    $c = New-Canvas; $e = New-Canvas
    $P = $FuelPal
    Write-Map $c 0 0 $FuelBase $P

    # ---- the sintering furnace: hottest in the middle and at the heaters along the top, cooler towards both doors; the whole
    #      tunnel breathes, a few pixels shimmer a step up or down, and boats of pellets cross the hearth one pixel a frame
    for ($y = $FuelGlassY0; $y -le $FuelGlassY1; $y++) { for ($x = $FuelGlassX0; $x -le $FuelGlassX1; $x++) {
        if ($Active) {
            if ($y -eq $FuelGlassY1 -and (Get-Wrap ($x - $T) 4) -lt 2) { Set-Px $c $x $y $P['p']; continue }
            $tone = 1 + [int][Math]::Floor([Math]::Abs($x - $FuelHotX) / 2) + [Math]::Min($y - $FuelGlassY0, 1) + $FuelBreath[$T % 8]
            $n = Get-Noise $x $y $T 59
            if ($n -lt 40) { $tone-- } elseif ($n -gt 215) { $tone++ }
            Set-Both $c $e $x $y $P[[string]$FuelHot[(Get-ClampInt $tone 0 ($FuelHot.Length - 1))]]
        } else {
            $key = "$x,$y"
            if ($FuelIdleGlass.ContainsKey($key)) { Set-Px $c $x $y $P[$FuelIdleGlass[$key]] }
            elseif ($y -eq $FuelGlassY1 -and (Get-Wrap $x 4) -lt 2) { Set-Px $c $x $y $P[$FuelIdleBoat] }
        }
    } }

    # ---- pellets: the row on the tray moves into the tube one cell a frame (empty on frame 0, full on frame 7); a progress cell
    #      lights under each pellet that is in, the newest one brightest
    $shift = if ($Active) { $T } else { 0 }
    $fill = if ($Active) { $T % 8 } else { 0 }
    foreach ($x in $FuelTrayX) { Set-Px $c $x $FuelBoreY $P[(Get-PelletTone $x $shift)] }
    for ($i = 0; $i -lt $fill; $i++) {
        $x = $FuelBoreX + $i
        Set-Px $c $x $FuelBoreY $P[(Get-PelletTone $x $shift)]
        Set-Both $c $e $x $FuelBarY $P[$(if ($i -eq $fill - 1) { 'M' } else { 'N' })]
    }

    # ---- status lamps: all four lit while the line runs, a brighter one walks from the press to the glovebox
    if ($Active) {
        $hot = ([int][Math]::Floor($T / 2)) % 4
        for ($k = 0; $k -lt $FuelLamps.Count; $k++) {
            $x = $FuelLamps[$k]
            Set-Both $c $e $x $FuelLampY $P[$(if ($k -eq $hot) { 'b' } else { 'c' })]
            Set-Both $c $e ($x + 1) $FuelLampY $P[$(if ($k -eq $hot) { 'd' } else { 'e' })]
        }
    }

    Sync-Emissive $c $e
    return @{ Color = $c; Emi = $e }
}

# Where light may come from: the furnace window, the four lamps and the progress cells (the pellets, the boats, the tube and the
# steel can never glow).
$FuelGlowZone = New-Object 'System.Collections.Generic.HashSet[int]'
for ($y = $FuelGlassY0; $y -le $FuelGlassY1; $y++) { for ($x = $FuelGlassX0; $x -le $FuelGlassX1; $x++) { [void]$FuelGlowZone.Add($y * 16 + $x) } }
foreach ($x in $FuelLamps) { [void]$FuelGlowZone.Add($FuelLampY * 16 + $x); [void]$FuelGlowZone.Add($FuelLampY * 16 + $x + 1) }
for ($i = 0; $i -lt $FuelCells; $i++) { [void]$FuelGlowZone.Add($FuelBarY * 16 + $FuelBoreX + $i) }

# ============================================================================================
#  BUILD
# ============================================================================================
$IsrDir = 'block/multiblock/isr_wellfield'
$FuelDir = 'block/multiblock/fuel_fabrication_plant'
$FrameTime = 4
$GlowZones = @{}
$GlowZones[$IsrDir] = $IsrGlowZone
$GlowZones[$FuelDir] = $FuelGlowZone

function Out-Overlay {
    param([string]$Dir, $Builder, [int]$FrameTime)
    $frames = @(); $emis = @()
    for ($f = 0; $f -lt 8; $f++) { $r = & $Builder $true $f; $frames += $r.Color; $emis += $r.Emi }
    $idle = & $Builder $false 0
    Out-Tex $idle.Color "$Dir/overlay_front.png"
    Out-Tex (Join-Frames $frames) "$Dir/overlay_front_active.png" $FrameTime
    Out-Tex (Join-Frames $emis) "$Dir/overlay_front_active_emissive.png" $FrameTime
}

if (Test-Want 'isr') { Out-Overlay $IsrDir ${function:New-IsrFrame} $FrameTime }
if (Test-Want 'fuel') { Out-Overlay $FuelDir ${function:New-FuelFrame} $FrameTime }

# ============================================================================================
#  VERIFY what was written: exact sizes (the idle face 16x16, the strips 16x128), binary alpha, no pure black, the .mcmeta
#  frametime, frames that really differ (each one from the next, the loop seam included, and at least 4 distinct), the empty
#  casing ring around a panel without holes, and an emissive layer inside the colour layer, lit in every frame and only where
#  the face has lights
# ============================================================================================
$problems = 0
foreach ($rel in $written) {
    $path = Join-Path $OutRoot ($rel -replace '/', '\')
    $msgs = @()
    if ($rel.EndsWith('.mcmeta')) {
        $ft = 0
        try { $ft = [int]((Get-Content -LiteralPath $path -Raw | ConvertFrom-Json).animation.frametime) } catch { $msgs += 'unreadable .mcmeta' }
        if ($ft -ne $FrameTime) { $msgs += "frametime $ft (expected $FrameTime)" }
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
    # an emissive layer may only contain pixels that exist, identical, in the colour layer, only where the face has lights, and
    # every frame has a glow
    if ($emissive) {
        $zone = $GlowZones[($rel -replace '/[^/]+$', '')]
        $colorPath = Join-Path $OutRoot (($rel -replace '_emissive\.png$', '.png') -replace '/', '\')
        $color = Read-Png $colorPath
        if ($null -eq $zone) { $msgs += 'no glow zone for this face' }
        elseif ($color.H -ne $img.H) { $msgs += 'emissive strip height differs from the colour strip' }
        else {
            $stray = 0; $outside = 0
            for ($i = 0; $i -lt $img.P.Length; $i++) {
                if ((($img.P[$i] -shr 24) -band 255) -eq 0) { continue }
                if ($img.P[$i] -ne $color.P[$i]) { $stray++ }
                if (-not $zone.Contains($i % 256)) { $outside++ }
            }
            if ($stray -gt 0) { $msgs += "$stray emissive px not present in the colour layer" }
            if ($outside -gt 0) { $msgs += "$outside emissive px outside the face's lights" }
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
if ($Preview) {
    function Get-Frame { param($Strip, [int]$Index) $f = New-Canvas 16 16; [Array]::Copy($Strip.P, $Index * 256, $f.P, 0, 256); return $f }
    function Merge-On { param($Dst, $Src) $o = Copy-Canvas $Dst; Merge-Canvas $o $Src; return $o }
    function Get-Dimmed {
        param($C, [double]$Factor)
        $o = Copy-Canvas $C
        for ($i = 0; $i -lt $o.P.Length; $i++) { if ((($o.P[$i] -shr 24) -band 255) -ne 0) { $o.P[$i] = Shade $o.P[$i] $Factor } }
        return $o
    }
    function New-Flat { param([int]$Argb) $o = New-Canvas 16 16; for ($i = 0; $i -lt 256; $i++) { $o.P[$i] = $Argb }; return $o }
    # the casing a face is drawn for: GTM's texture when its path is given (its first 16x16 frame), otherwise a flat stand-in of its tone
    function Get-CasingTile {
        param([string]$Path, [string]$FlatHex)
        if (-not $Path) { return (New-Flat (Hex $FlatHex)) }
        $img = Read-Png $Path
        if ($img.W -ne 16 -or ($img.H % 16) -ne 0) { throw "casing $Path is $($img.W)x$($img.H) (expected 16x16 or a 16-wide strip)" }
        return (Get-Frame $img 0)
    }
    $ptfe = Get-CasingTile $PtfeCasing '3C3C3C'
    $stain = Get-CasingTile $StainlessCasing 'C3C6D2'
    $checker = New-Canvas 16 16
    for ($i = 0; $i -lt 256; $i++) { $checker.P[$i] = if (((($i % 16) + [int][Math]::Floor($i / 16)) % 2) -eq 0) { Hex '3C4048' } else { Hex '4A4F58' } }
    $black = New-Flat (Hex '0A0B0D')

    $faces = @()
    if (Test-Want 'isr') { $faces += [pscustomobject]@{ Dir = $IsrDir; Own = $ptfe; Other = $stain } }
    if (Test-Want 'fuel') { $faces += [pscustomobject]@{ Dir = $FuelDir; Own = $stain; Other = $ptfe } }

    # composed at 1x (16 px tiles, 2 px gaps) and scaled at the end
    $blockH = 4 * 18
    $sheet = New-Canvas 204 (2 + $faces.Count * ($blockH + 2) + 50)
    for ($i = 0; $i -lt $sheet.P.Length; $i++) { $sheet.P[$i] = Hex '1E2126' }
    function Add-Tile { param($Tile, [int]$X0, [int]$Y0) Merge-Canvas $sheet $Tile $X0 $Y0 }
    function Add-Wall {
        param($Tile, $Face, [int]$X0, [int]$Y0)
        for ($j = 0; $j -lt 3; $j++) { for ($i = 0; $i -lt 3; $i++) {
            $t = if ($i -eq 1 -and $j -eq 1) { Merge-On $Tile $Face } else { $Tile }
            Add-Tile $t ($X0 + 16 * $i) ($Y0 + 16 * $j)
        } }
    }
    $y0 = 2
    $walls = @()
    foreach ($fc in $faces) {
        $dir = Join-Path $OutRoot ($fc.Dir -replace '/', '\')
        $idle = Read-Png (Join-Path $dir 'overlay_front.png')
        $act = Read-Png (Join-Path $dir 'overlay_front_active.png')
        $emi = Read-Png (Join-Path $dir 'overlay_front_active_emissive.png')
        $night = Get-Dimmed $fc.Own 0.3
        # rows: on its casing | raw on a checker | emissive alone | dark room (the idle face first, then the 8 active frames)
        Add-Tile (Merge-On $fc.Own $idle) 2 $y0
        Add-Tile (Merge-On $checker $idle) 2 ($y0 + 18)
        Add-Tile $black 2 ($y0 + 36)
        Add-Tile (Merge-On $night (Get-Dimmed $idle 0.3)) 2 ($y0 + 54)
        for ($f = 0; $f -lt 8; $f++) {
            $x0 = 20 + 18 * $f
            $col = Get-Frame $act $f; $em = Get-Frame $emi $f
            Add-Tile (Merge-On (Merge-On $fc.Own $col) $em) $x0 $y0
            Add-Tile (Merge-On $checker $col) $x0 ($y0 + 18)
            Add-Tile (Merge-On $black $em) $x0 ($y0 + 36)
            Add-Tile (Merge-On (Merge-On $night (Get-Dimmed $col 0.3)) $em) $x0 ($y0 + 54)
        }
        # at the right: the face idle and active (frame 2) on the other face's casing
        $lit2 = Merge-On (Get-Frame $act 2) (Get-Frame $emi 2)
        Add-Tile (Merge-On $fc.Other $idle) 168 $y0
        Add-Tile (Merge-On $fc.Other $lit2) 186 $y0
        $walls += [pscustomobject]@{ Tile = $fc.Own; Idle = $idle; Lit = $lit2 }
        $y0 += $blockH + 2
    }
    # bottom: a 3x3 wall of each face's casing, idle and active (frame 2)
    $x0 = 2
    foreach ($w in $walls) {
        Add-Wall $w.Tile $w.Idle $x0 $y0; $x0 += 50
        Add-Wall $w.Tile $w.Lit $x0 $y0; $x0 += 50
    }

    # nearest-neighbour x8
    $scale = 8
    $big = New-Canvas ($sheet.W * $scale) ($sheet.H * $scale)
    $row = New-Object 'int[]' ($big.W)
    for ($y = 0; $y -lt $sheet.H; $y++) {
        for ($x = 0; $x -lt $sheet.W; $x++) { $v = $sheet.P[$y * $sheet.W + $x]; for ($i = 0; $i -lt $scale; $i++) { $row[$x * $scale + $i] = $v } }
        for ($j = 0; $j -lt $scale; $j++) { [Array]::Copy($row, 0, $big.P, ($y * $scale + $j) * $big.W, $big.W) }
    }
    $pdir = Split-Path -Parent $Preview
    if ($pdir -and -not (Test-Path -LiteralPath $pdir)) { New-Item -ItemType Directory -Force -Path $pdir | Out-Null }
    $bmp = ConvertTo-Bitmap $big
    try { $bmp.Save($Preview, [System.Drawing.Imaging.ImageFormat]::Png) } finally { $bmp.Dispose() }
    $ptfeNote = if ($PtfeCasing) { Split-Path -Leaf $PtfeCasing } else { 'a flat grey stand-in for the PTFE casing' }
    $stainNote = if ($StainlessCasing) { Split-Path -Leaf $StainlessCasing } else { 'a flat blue-grey stand-in for the stainless casing' }
    Write-Host "preview: $Preview (on $ptfeNote and $stainNote; per face: on its casing, raw on a checker, emissive alone, dark room, then on the other casing; 3x3 walls)"
}

if ($problems -gt 0) { throw "$problems file(s) failed the texture checks (see the warnings above)" }

if ($Credits) {
    Write-Host ''
    foreach ($rel in $written) {
        Write-Host ("| ``pack/kubejs/assets/grindless/textures/$rel`` | Generated with tools/assets/$ScriptName (procedural pixel art, original) by the uranium cycle agent, 2026-10-25 | the pack's licence (pending; proposed CC BY-SA 4.0) |")
    }
}
