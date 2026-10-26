<#
.SYNOPSIS
  Procedural 16x16 pixel art for the foundations of the LuV era of Gregtech Grindless (package LuV-A1, shared registrations):
  the asteroid, Jovian and Saturnian items, four quantum seeds, two engineered seeds, the superconductor tapes, the triple-junction
  cell, the HSS-S drill bit and the harpoon, eight casing blocks and the orbital solar panel (GregTech style: top-left light, 3-5
  tones per material, selective outlines).

.DESCRIPTION
  Every pixel is drawn by this script (palettes + char maps + small shading routines); nothing is copied or edited from GregTech
  Modern, GCYR or any other mod. Output is deterministic: re-running overwrites the same bytes (mottles come from Get-Noise, a hash
  of the position, not from a random generator). The helpers of the other generators are copied here so those scripts stay
  untouched. Reused (recoloured) drawings of the pack's own generators: the quantum seed ampoule (New-PlanetSeedFrame of
  Build-TravelNetworkTextures.ps1), the drill bit shader (Draw-Helix, and the geometry of New-TungstenSteelBit, Build-EVTextures.ps1),
  the chart data stick ($ChartMap of Build-IVFoundationTextures.ps1, itself the Mars chart's), the data orb (New-OrbBase of
  Build-IVMercuryTextures.ps1) and the thin-film frame routine (New-ThinFilmFrame of Build-IVFoundationTextures.ps1).

  Writes (under pack/kubejs/assets/grindless/textures/):
    item/asteroid_pgm_concentrate.png  the carbonyl residue of meteoric iron: a small heap of dark grey-black metallic powder with
                                       bright platinum glints.
    item/chondritic_extract.png        a small glass vial under an aluminium crimp cap, holding a dark amber-brown organic extract.
    item/capture_bag.png               an inflated bag of gold Kapton gores sewn with white aramid tapes, its mouth on a titanium hoop
                                       and its tip gathered by an aramid tie.
    item/asteroid_quantum_seed.png, item/ionian_quantum_seed.png, item/europan_quantum_seed.png, item/ganymedean_quantum_seed.png
                                       (each + .mcmeta: 8 frames, frametime 3) the quantum seed ampoule with the teal ender pearl and
                                       the two violet sparks, under a cap of the place's ground: belt (rusty iron-grey rock, metal
                                       flecks; a dust lane with drifting motes), Io (sulfur yellow-orange with red-brown; volcanic
                                       plumes rising), Europa (ice white-blue with red-brown lineae; lineae drifting across), Ganymede
                                       (grey-brown with pale ice; a terminator sweeping the other way than Mercury's).
    item/engineered_barley_seed.png    three plump golden barley grains with a crease, a cyan glint on one and a small cyan sparkle.
    item/engineered_tobacco_seed.png   a low pile of tiny dark brown tobacco seeds (2x2 dots) with the same cyan glint.
    item/cryobot_probe.png             a slender silver melt probe: a tether reel on top, a seam band, a red-hot nose with a
                                       white-hot point.
    item/europan_ocean_sample.png      a stout sample bottle under a ridged titanium screw cap: blue brine with green glowing specks.
    item/melt_head.png                 a dark grey tungsten-carbide cone, point down, under its glowing orange heater disc and stub.
    item/jupiter_entry_probe.png       a blunt-cone entry probe: a dark brown heat shield in front (below), a silver conical backshell.
    item/saturn_flyby_probe.png        a white high-gain dish facing the viewer, a gold-foil bus with its engine, an RTG boom to the
                                       left and a science boom with its platform to the right.
    item/jovian_atmosphere_survey.png  the data orb (glass sphere in a steel cradle) filled with Jupiter's cream, orange and brown
                                       bands, a small red oval.
    item/gravitational_wave_catalogue.png  the data orb with a cyan chirp: a waveform that grows and quickens, then rings down.
    item/saturn_transfer_chart.png     the chart family's data stick with Saturn (gold disc, brown ring) and an orange Titan.
    item/heat_exchanger_bundle.png     nine dark blue-grey tungstensteel tube ends in a yellow-ochre sulfur-concrete frame (oblique).
    item/tether_spool.png              a reel of thin silver aluminium tape between white aramid flanges (the near one woven, with
                                       its hub), the loose end hanging.
    item/ionian_sublimate.png          a crusty crystalline chunk, white-yellow on top to orange below, with red-brown crust.
    item/nickel_tungsten_tape.png      a roll of thin bright nickel-silver tape lying flat (wound face, core hole, loose end).
    item/itbtc_coated_conductor.png    the same roll: a black-purple superconductor coating with silver cap-layer edges.
    item/neurotrophic_factor.png       a glass ampoule (sealed tip, blue break ring) of pale pink protein solution.
    item/neural_organoid.png           a pinkish-grey folded tissue sphere sitting in a drop of pink culture medium.
    item/triple_junction_wafer.png     a round wafer seen a little from above: blue-black face with a sheen over a gold-grey
                                       germanium rim and edge.
    item/triple_junction_cell.png      a square cell with cropped corners: deep blue, two silver busbars and thin fingers.
    item/hss_s_drill_bit.png           the drill bit family (the tungsten steel bit's geometry) in HSS-S: dark steel, violet tint.
    item/anchor_harpoon.png            a diagonal harpoon: a dark HSS-S shaft, a barbed tungsten-carbide head, a cable eye.
    block/luv/station_truss_casing.png     light grey aluminium plating behind a titanium truss (chords along the top and left
                                           edges, an X brace with a gusset); seamless.
    block/luv/radiation_vault_casing.png   heavy dark titanium/tantalum plates, riveted, staggered, parted by copper and tin layers
                                           (graded-Z); seamless.
    block/luv/whipple_shield_casing.png    a porous aluminium-foam bumper pitted by small impact craters over a woven yellow aramid
                                           layer and a dark stand-off gap; seamless.
    block/luv/asteroid_regolith_casing.png sintered dark grey-brown rubble bricks in irregular courses with metallic flecks; seamless.
    block/luv/sulfur_concrete_casing.png   big yellow-ochre sulfur-concrete blocks in running bond, aggregate and sulfur crystals.
    block/luv/magnetic_bearing.png         a ring of eight tetrataenite segments around a polished shaft, on a bevelled steel plate.
    block/luv/coilgun_coil_casing.png      tight black windings with copper-brown highlights between violet HSS-S rims; seamless.
    block/luv/sapphire_test_mass.png       polished blue sapphire: a bevel, four facets around a table, white glints.
    block/luv/orbital_solar_cells.png      top of grindless:orbital_solar_panel: 8 px multi-junction cells with cropped corners,
                                           blue-black with a silver busbar, fine fingers and a diagonal sheen; seamless.
    block/luv/orbital_solar_frame.png      its titanium frame: light grey-violet, brushed, lit edge; rows 6 to 8 (lit, mid, dark) are
                                           what the panel's sides show (models/block/luv/orbital_solar_panel.json).

  Run from the repo root (PowerShell 5.1 blocks unsigned scripts by default; this bypass only affects that process):
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-LuVFoundationTextures.ps1
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-LuVFoundationTextures.ps1 -Only seeds,capture_bag
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-LuVFoundationTextures.ps1 -Preview C:\path\luv-a1.png -Credits

  Every pixel is fully opaque or fully transparent and none is pure black; the block textures have all 256 pixels opaque and the
  item icons have a transparent background (in every frame). The final check fails the run (non-zero exit) if any written file
  breaks one of these rules, if a seed is not an 8-frame strip with its .mcmeta (frametime 3), has fewer than 3 distinct frames,
  leaves the Venusian seed's silhouette or shares a frame with another seed, if the HSS-S bit leaves the tungsten steel bit's
  silhouette, the chart the Mars chart's or the two orbs the lunar VLBI recording's (or copy one of them), if the two tapes stop
  sharing one silhouette or are identical, if the frame's rows 6 to 8 are not lit > mid > dark, or if the panel model does not use
  the two panel textures.

.PARAMETER Only
  Subset of output names (e.g. capture_bag, station_truss_casing, orbital_solar_cells) or groups: items, seeds, casings, panel
  (comma-separated, also as one string with -File). Default: everything.
.PARAMETER OutRoot
  Textures root. Default: <repo>/pack/kubejs/assets/grindless/textures
.PARAMETER Preview
  Also write a review sheet (x6, nearest neighbour) to this PNG, which must be outside the repository (it is never shipped). Rows 1-2,
  on inventory-slot grey: every item. Rows 3-4: the 8 frames of each new seed, then the Venusian and Hermean seeds. Row 5: the
  families next to their elders (tungsten steel and HSS-S bits; the three IV orbs and the two new ones; the Mars, inner planets
  and Saturn charts; the two tapes; the three vials). Rows 6-7: every casing tiled 3x3, then the orbital panel's cells 3x3, a mock
  of the panel (top over its 3 px edge) and the IV thin-film panel's mock. Under the sheet, every item at x2 (the usual GUI scale).
  Neighbours are read from OutRoot and left out if they are missing.
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

$RepoRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..'))
$DefaultOutRoot = [System.IO.Path]::GetFullPath((Join-Path $RepoRoot 'pack\kubejs\assets\grindless\textures'))
if (-not $OutRoot) { $OutRoot = $DefaultOutRoot }
$OutRoot = [System.IO.Path]::GetFullPath($OutRoot)
$ScriptName = Split-Path -Leaf $PSCommandPath

if ($Preview) {
    $Preview = $ExecutionContext.SessionState.Path.GetUnresolvedProviderPathFromPSPath($Preview)
    if ($Preview.StartsWith($RepoRoot.TrimEnd('\') + '\', [System.StringComparison]::OrdinalIgnoreCase)) {
        throw "-Preview must point outside the repository (the review sheet is never shipped): $Preview"
    }
}

# `powershell -File ... -Only a,b` delivers "a,b" as one string: split it so both calling styles work.
$Only = @($Only | ForEach-Object { $_ -split '[,;\s]+' } | Where-Object { $_ })

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

# A light -> dark ramp from hex strings.
function New-Ramp { param([string[]]$Hexes) return @($Hexes | ForEach-Object { Hex $_ }) }

function Get-ClampInt { param([int]$V, [int]$Lo, [int]$Hi) return [Math]::Max($Lo, [Math]::Min($Hi, $V)) }

# Deterministic 0..255 hash of (x, y, frame, salt): grain without a random generator.
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

# Fills rows of a horizontal-span body: @(y, x0, x1, toneOffset) per row, shaded with Get-SpanTone on a 5-tone ramp.
function Add-SpanRows {
    param($C, $Rows, $Ramp)
    foreach ($r in $Rows) {
        for ($x = $r[1]; $x -le $r[2]; $x++) { Set-Px $C $x $r[0] $Ramp[(Get-ClampInt ((Get-SpanTone $x $r[1] $r[2]) + $r[3]) 0 4)] }
    }
}

# Glass shared by the vials: g lit edge, w highlight, v empty glass, i shaded edge.
$VialGlassSpec = 'g=E2EEF2 w=F8FCFF v=BCCCD6 i=8C9CA8'

# ============================================================================================
#  ASTEROID PGM CONCENTRATE - a small heap of dark grey-black metallic powder with platinum glints
#  a mound (rows 6..13, half-widths in $HeapHalf) lit from the top left, grained by Get-Noise, outlined, then a few fixed glints
# ============================================================================================
$ConcRamp = New-Ramp @('8C8A88', '6E6C6A', '545250', '3E3C3B', '2C2B2A')
$ConcGlintPal = New-Pal 's=CDD3DC S=FFFFFF'
$ConcGlints = @(@(7, 7, 'S'), @(5, 10, 's'), @(10, 9, 'S'), @(8, 12, 's'), @(12, 12, 'S'), @(3, 12, 's'))
$HeapHalf = @(1.2, 2.4, 3.4, 4.3, 5.1, 5.8, 6.3, 6.6)

function New-PgmConcentrate {
    $c = New-Canvas
    for ($y = 6; $y -le 13; $y++) {
        $hw = $HeapHalf[$y - 6]
        for ($x = 0; $x -lt 16; $x++) {
            $dx = ($x + 0.5) - 8.0
            if ([Math]::Abs($dx) -gt $hw) { continue }
            $t = 0.62 - 0.40 * ($dx / 6.6) - 0.045 * ($y - 6) + ((Get-Noise $x $y 0 211) - 128) / 600.0
            $i = if ($t -ge 0.78) { 0 } elseif ($t -ge 0.58) { 1 } elseif ($t -ge 0.42) { 2 } elseif ($t -ge 0.28) { 3 } else { 4 }
            Set-Px $c $x $y $ConcRamp[$i]
        }
    }
    Add-Outline $c -LitArgb (Hex '4A4846') -ShadeArgb (Hex '1C1B1A')
    foreach ($g in $ConcGlints) { Set-Px $c $g[0] $g[1] $ConcGlintPal[$g[2]] }
    return $c
}

# ============================================================================================
#  CHONDRITIC EXTRACT - a small sealed glass vial of dark amber-brown organic extract
#  an aluminium crimp cap (A..D) on the neck, a 6 px glass body with a highlight streak, the extract from row 6 (S, T its surface)
# ============================================================================================
$ExtractPal = New-Pal ($VialGlassSpec + ' A=F0F2F4 B=C6CCD2 C=9AA2AC D=6E7682 S=D49A4A T=B07434 L=9A5A22 M=7A4418 N=5A3012 O=40200C')
$ExtractMap = @(
    '................',
    '................',
    '......ABBC......',
    '......BCCD......',
    '......gwvi......',
    '.....gwvvvi.....',
    '.....gwSSTi.....',
    '.....gwLMNi.....',
    '.....gLLMNi.....',
    '.....gLMMNi.....',
    '.....gLMNOi.....',
    '.....gLMNOi.....',
    '.....gMNOOi.....',
    '......iiii......',
    '................',
    '................'
)
Assert-Map 'ExtractMap' $ExtractMap

function New-ChondriticExtract {
    $c = New-Canvas
    Write-Map $c 0 0 $ExtractMap $ExtractPal
    Add-Outline $c -LitArgb (Hex '6A7884') -ShadeArgb (Hex '2E343C')
    return $c
}

# ============================================================================================
#  CAPTURE BAG - an inflated bag of gold Kapton film sewn with white aramid tapes, on a titanium hoop
#  the hoop is an ellipse (back arc row 2, sides row 3, front arc row 4) round the dark mouth; the bag (rows 5..13, $BagRows) is
#  shaded as a ball with a crinkle from Get-Noise; three aramid tapes run down its meridians (nx = -0.62, 0, +0.62) and an aramid
#  collar sits under the hoop; an aramid tie gathers the tip (row 14)
# ============================================================================================
$BagGold = New-Ramp @('FFF4C0', 'F6D46E', 'E0AE3C', 'B47E22', '7E5414')
$BagAramid = New-Ramp @('F6F4EC', 'DAD6CA', 'AEA898')
$BagTi = New-Ramp @('F2ECFA', 'D6CAE6', 'B2A2C8', '8A7AA2', '64587A')
$BagMouth = @((Hex '4A3410'), (Hex '6E4E18'))
$BagRows = @(@(5, 3, 12), @(6, 2, 13), @(7, 2, 13), @(8, 2, 13), @(9, 2, 13), @(10, 3, 12), @(11, 3, 12), @(12, 4, 11), @(13, 5, 10))
$BagSeams = @(-0.62, 0.0, 0.62)

function New-CaptureBag {
    $c = New-Canvas
    foreach ($r in $BagRows) {
        $y = $r[0]; $hw = ($r[2] - $r[1] + 1) / 2.0
        $seamX = @($BagSeams | ForEach-Object { [int][Math]::Floor(8.0 + $_ * $hw) })
        for ($x = $r[1]; $x -le $r[2]; $x++) {
            $nx = (($x + 0.5) - 8.0) / $hw; $ny = ($y - 9.0) / 5.0
            $lit = 0.35 - 0.55 * $nx - 0.45 * $ny + ((Get-Noise $x $y 0 307) - 128) / 520.0
            if ($y -eq 5 -or $seamX -contains $x) {
                $i = if ($lit -gt 0.3) { 0 } elseif ($lit -gt -0.15) { 1 } else { 2 }
                Set-Px $c $x $y $BagAramid[$i]
            } else {
                $i = if ($lit -gt 0.78) { 0 } elseif ($lit -gt 0.42) { 1 } elseif ($lit -gt 0.08) { 2 } elseif ($lit -gt -0.3) { 3 } else { 4 }
                Set-Px $c $x $y $BagGold[$i]
            }
        }
    }
    Set-Px $c 7 14 $BagAramid[1]; Set-Px $c 8 14 $BagAramid[2]
    # the hoop: back arc (one step darker, it is the far side), the mouth, the sides and the front arc
    for ($x = 4; $x -le 11; $x++) {
        Set-Px $c $x 2 $BagTi[(Get-ClampInt ((Get-SpanTone $x 4 11) + 1) 0 4)]
        Set-Px $c $x 3 $(if ($x -le 7) { $BagMouth[0] } else { $BagMouth[1] })
        Set-Px $c $x 4 $BagTi[(Get-SpanTone $x 4 11)]
    }
    Set-Px $c 3 3 $BagTi[1]; Set-Px $c 12 3 $BagTi[3]
    Add-Outline $c
    return $c
}

# ============================================================================================
#  QUANTUM SEEDS - the sealed ampoule of the seed family (New-PlanetSeedFrame, Build-TravelNetworkTextures.ps1) under a cap of
#  the place's ground, with the teal ender pearl and the two violet sparks of the entangled pair; 8 frames, frametime 3
#   K..O  the cap, lit -> dark; k a dark grain (red-brown on Io and Europa), y a bright speck (metal, sulfur, ice)
#   a..e  the glass rim, lit -> dark     f..j  the glow, brightest around the pearl -> its marks (i) and far side (j)
#   p..t  the ender pearl, lit -> dark   w the glass reflection; u, x the sparks and their trails
#  Glow modes: belt (a dust lane across the equator, a mote drifting along it), plumes (bands rising, Io's volcanoes), lineae
#  (red-brown streaks drifting diagonally, Europa's cracks), terminator (Ganymede's day side shrinking right to left, the other
#  way than Mercury's). Dir and Phase set the sparks' turn, so no seed shares another's frames.
# ============================================================================================
$SeedCx = 8.0; $SeedCy = 10.0; $SeedR = 4.9
$SeedCommon = 'p=86F6DA q=34CBA6 r=19937C s=0F6155 t=093C35 w=FFFFFF u=A27CFF x=D2BEFF'
$SeedPlaces = [ordered]@{
    'asteroid_quantum_seed'   = @{ Mode = 'belt'; Salt = 101; Dir = 1.0; Phase = 0.25; Outline = @('6A5A4A', '30261E'); Streak = @()
        Pal = New-Pal ($SeedCommon + ' K=A89480 L=8A7562 M=6C5A4A N=4E4036 O=362C24 k=8A4E2A y=E2E6EA a=FFFBF4 b=E8E0D4 c=C8BCAC d=9A8E7E e=6C6254 f=FAF6EE g=E4DCCE h=C2B6A4 i=5C4E40 j=8E8070') }
    'ionian_quantum_seed'     = @{ Mode = 'plumes'; Salt = 113; Dir = -1.0; Phase = 0.25; Outline = @('8A5A1C', '42260C'); Streak = @()
        Pal = New-Pal ($SeedCommon + ' K=FFEA7A L=F4C83C M=D89A2A N=A8622A O=6E3818 k=8E2A16 y=FFFFE0 a=FFFDE8 b=F8EEC0 c=E2CC88 d=B89A58 e=846838 f=FFFCE0 g=FFEC94 h=FFC64E i=C2501E j=D08A2C') }
    'europan_quantum_seed'    = @{ Mode = 'lineae'; Salt = 127; Dir = 1.0; Phase = 0.375; Outline = @('5E7690', '2A3848'); Streak = @(@(6, 1), @(7, 2), @(8, 2), @(9, 3), @(5, 3))
        Pal = New-Pal ($SeedCommon + ' K=F4F8FC L=D8E4EE M=B6C8D8 N=8EA6BC O=667E96 k=A0563A y=FFFFFE a=FFFFFD b=E8F2FA c=C4D6E6 d=94AAC0 e=667C94 f=FBFEFF g=E2F2FC h=BCDCF0 i=B06844 j=8CB4D4') }
    'ganymedean_quantum_seed' = @{ Mode = 'terminator'; Salt = 131; Dir = -1.0; Phase = 0.375; Outline = @('5C5448', '2A2620'); Streak = @()
        Pal = New-Pal ($SeedCommon + ' K=B2A694 L=948876 M=766A5A N=5A5044 O=3E362E k=2E2822 y=E6F0F6 a=FFFFFD b=E6E4E0 c=C6C2BA d=948E84 e=66625A f=F4F8FA g=DCE6EA h=B8C6CC i=5E544A j=403A32') }
}

function New-PlaceSeedFrame {
    param([int]$T, $Place)
    $c = New-Canvas
    $P = $Place.Pal
    # the cap of the place's ground (lit top-left, dark grains and bright specks) over the sealed neck
    foreach ($row in @(@(1, 6, 9), @(2, 5, 10), @(3, 5, 10))) {
        for ($x = $row[1]; $x -le $row[2]; $x++) {
            $tone = Get-SpanTone $x $row[1] $row[2]
            if ($row[0] -eq 3) { $tone = Get-ClampInt ($tone + 1) 0 4 }
            $col = $P[@('K', 'L', 'M', 'N', 'O')[$tone]]
            $n = Get-Noise $x $row[0] 0 $Place.Salt
            if ($n -gt 218) { $col = $P['k'] } elseif ($n -lt 20 -and $tone -le 2) { $col = $P['y'] }
            Set-Px $c $x $row[0] $col
        }
    }
    foreach ($s in $Place.Streak) { Set-Px $c $s[0] $s[1] $P['k'] }
    Set-Px $c 7 4 $P['b']; Set-Px $c 8 4 $P['d']
    $breath = (($T % 8) -lt 4)
    $step = [int][Math]::Floor($T / 2)
    for ($y = 4; $y -le 15; $y++) { for ($x = 2; $x -le 13; $x++) {
        $dx = ($x + 0.5) - $SeedCx; $dy = ($y + 0.5) - $SeedCy
        $r = [Math]::Sqrt($dx * $dx + $dy * $dy)
        if ($r -gt $SeedR) { continue }
        if ($r -ge ($SeedR - 0.95)) {
            $lit = - ($dx + $dy) / ([Math]::Max($r, 0.01) * 1.4142)
            $tone = if ($lit -gt 0.55) { 'a' } elseif ($lit -gt 0.1) { 'b' } elseif ($lit -gt -0.45) { 'c' } elseif ($lit -gt -0.8) { 'd' } else { 'e' }
        } elseif ($r -le 2.0) {
            $lit = - ($dx + $dy) / 1.4142
            $tone = if ($lit -gt 1.1) { 'p' } elseif ($lit -gt 0.2) { 'q' } elseif ($lit -gt -0.7) { 'r' } elseif ($lit -gt -1.3) { 's' } else { 't' }
        } else {
            $tone = if ($r -lt 2.7) { $(if ($breath) { 'f' } else { 'g' }) } elseif ($r -lt 3.3) { 'g' } else { 'h' }
            switch ($Place.Mode) {
                'belt' {
                    if ($y -eq 10) { $tone = $(if ((($x + $T) % 4) -eq 0) { 'i' } else { 'h' }) }
                }
                'plumes' {
                    if ((($y + 8 - $step) % 4) -eq 0 -and $r -ge 2.4) { $tone = $(if ($tone -eq 'h') { 'i' } else { 'h' }) }
                }
                'lineae' {
                    if ((($x + $y + $step) % 4) -eq 0 -and $r -ge 2.4) { $tone = 'i' }
                }
                'terminator' {
                    $term = 3.6 - 7.2 * (($T % 8) / 7.0)
                    if ($dx -gt $term) { $tone = $(if ($r -lt 3.0) { 'i' } else { 'j' }) }
                }
            }
            if ($Place.Mode -ne 'terminator' -and $r -ge 3.3 -and ($dx + $dy) -gt 2.4 -and $tone -ne 'i') { $tone = 'j' }
        }
        Set-Px $c $x $y $P[$tone]
    } }
    # a reflection on the glass, top-left inside the rim
    Set-Px $c 5 7 $P['w']; Set-Px $c 6 6 $P['a']
    # the entangled pair: two violet sparks on opposite sides of the pearl, an eighth of a turn per frame, each with a paler trail
    $dir = $Place.Dir
    $ang = $dir * [Math]::PI * 2 * (($T % 8) / 8.0) + [Math]::PI * 2 * $Place.Phase
    foreach ($k in 0, 1) {
        $a = $ang + $k * [Math]::PI
        $sx = [int][Math]::Floor($SeedCx + 3.05 * [Math]::Cos($a)); $sy = [int][Math]::Floor($SeedCy + 3.05 * [Math]::Sin($a))
        $ta = $a - $dir * [Math]::PI / 4
        $tx = [int][Math]::Floor($SeedCx + 3.05 * [Math]::Cos($ta)); $ty = [int][Math]::Floor($SeedCy + 3.05 * [Math]::Sin($ta))
        if ($tx -ne $sx -or $ty -ne $sy) { Set-Px $c $tx $ty $P['x'] }
        Set-Px $c $sx $sy $P['u']
    }
    Add-Outline $c -LitArgb (Hex $Place.Outline[0]) -ShadeArgb (Hex $Place.Outline[1])
    return $c
}

function New-PlaceSeed {
    param($Place)
    $frames = @(); for ($f = 0; $f -lt 8; $f++) { $frames += New-PlaceSeedFrame $f $Place }
    return (Join-Frames $frames)
}

# ============================================================================================
#  ENGINEERED SEEDS - barley grains and a pile of tobacco seeds, each with a faint cyan "engineered" glint
#  Add-Spindle draws a grain between two points: half-width $Half * sqrt(sin(pi t)) along it, shaded across it (the side facing the
#  top-left light is lighter), the two ends a step darker and an optional crease (one tone darker) down the middle third.
# ============================================================================================
$CyanPal = New-Pal 'g=5FE8E4 G=C8FFFC'
$BarleyRamp = New-Ramp @('FFF2B8', 'F2D070', 'D8A845', 'A87A2C', '74501A')
# back to front: left grain, right grain, the big middle grain
$BarleyGrains = @(@(1.5, 6.5, 4.5, 12.8, 1.5), @(8.8, 14.2, 14.5, 8.5, 1.6), @(4.5, 14.0, 9.8, 2.8, 1.9))

function Add-Spindle {
    param($C, [double]$X0, [double]$Y0, [double]$X1, [double]$Y1, [double]$Half, $Ramp, [switch]$Crease)
    $ax = $X1 - $X0; $ay = $Y1 - $Y0; $len2 = $ax * $ax + $ay * $ay; $len = [Math]::Sqrt($len2)
    # the unit normal facing the top-left light
    $px = -$ay / $len; $py = $ax / $len
    if (($px + $py) -gt 0) { $px = -$px; $py = -$py }
    for ($y = 0; $y -lt $C.H; $y++) { for ($x = 0; $x -lt $C.W; $x++) {
        $vx = ($x + 0.5) - $X0; $vy = ($y + 0.5) - $Y0
        $t = ($vx * $ax + $vy * $ay) / $len2
        if ($t -lt 0 -or $t -gt 1) { continue }
        $d = $vx * $px + $vy * $py
        $w = $Half * [Math]::Sqrt([Math]::Sin([Math]::PI * $t))
        if ([Math]::Abs($d) -gt ($w + 0.05)) { continue }
        $s = if ($w -gt 0.01) { $d / $w } else { 0.0 }
        $tone = if ($s -gt 0.5) { 0 } elseif ($s -gt 0.05) { 1 } elseif ($s -gt -0.45) { 2 } else { 3 }
        if ($t -lt 0.14 -or $t -gt 0.86) { $tone = [Math]::Min(4, $tone + 1) }
        if ($Crease -and [Math]::Abs($d + 0.15) -lt 0.42 -and $t -gt 0.3 -and $t -lt 0.75) { $tone = [Math]::Min(4, $tone + 1) }
        Set-Px $C $x $y $Ramp[$tone]
    } }
}

# a four-point cyan sparkle: G in the middle, g arms
function Add-Sparkle {
    param($C, [int]$X, [int]$Y)
    foreach ($d in @(@(-1, 0), @(1, 0), @(0, -1), @(0, 1))) { Set-Px $C ($X + $d[0]) ($Y + $d[1]) $CyanPal['g'] }
    Set-Px $C $X $Y $CyanPal['G']
}

function New-EngineeredBarley {
    $c = New-Canvas
    foreach ($g in $BarleyGrains) { Add-Spindle $c $g[0] $g[1] $g[2] $g[3] $g[4] $BarleyRamp -Crease }
    Add-Outline $c -LitArgb (Hex '9A7028') -ShadeArgb (Hex '4E3410')
    Set-Px $c 6 8 $CyanPal['G']; Set-Px $c 7 7 $CyanPal['g']
    Add-Sparkle $c 13 3
    return $c
}

#   tobacco: tiny seeds as 2x2 dots (h lit, m mid, d dark), offset every other dot row, a gap (k) here and there, a step darker on
#   the shaded right side of the pile; the pile is rows 8..13 with $PileHalf half-widths
$TobaccoPal = New-Pal 'h=B07C4C m=7A4C2A d=52321A k=36200F'
$PileHalf = @(1.6, 2.8, 3.9, 4.8, 5.5, 6.0)

function New-EngineeredTobacco {
    $c = New-Canvas
    $P = $TobaccoPal
    for ($y = 8; $y -le 13; $y++) {
        $hw = $PileHalf[$y - 8]
        for ($x = 0; $x -lt 16; $x++) {
            $dx = ($x + 0.5) - 8.0
            if ([Math]::Abs($dx) -gt $hw) { continue }
            $off = ([int][Math]::Floor($y / 2)) % 2
            $u = ($x + $off) % 2; $v = $y % 2
            $ch = if ($u -eq 0 -and $v -eq 0) { 'h' } elseif ($u -eq 1 -and $v -eq 1) { 'd' } else { 'm' }
            if ($dx -gt 2.0) { $ch = @{ h = 'm'; m = 'd'; d = 'k' }[$ch] }
            if ((Get-Noise $x $y 0 401) -gt 222) { $ch = 'k' }
            Set-Px $c $x $y $P[$ch]
        }
    }
    Add-Outline $c -LitArgb (Hex '5E3A1E') -ShadeArgb (Hex '24150A')
    Set-Px $c 6 10 $CyanPal['G']
    Add-Sparkle $c 12 5
    return $c
}

# ============================================================================================
#  CRYOBOT PROBE - a slender torpedo-shaped melt probe
#  the tether (l) rises from a reel (F, G flanges, t, T the wound tether) on a 4 px silver body (0..4, a seam band at row 8); the
#  nose glows: dull red where it meets the body, orange, a white-hot point
# ============================================================================================
$CryoPal = New-Pal 'l=D8C8A0 F=C8CED6 G=7A8290 t=E8D8B0 T=B8A47A 0=F8FAFC 1=D4DAE2 2=A8B0BC 3=7A8290 4=56606E W=FFF8D8 Y=FFD05A O=FF8A2A R=E0461C r=B8301A k=7A1E10'
$CryoMap = @(
    '........l.......',
    '.......l........',
    '.....FttttG.....',
    '.....FTTTTG.....',
    '.....FttttG.....',
    '......1223......',
    '......1023......',
    '......1023......',
    '......2234......',
    '......1023......',
    '......1023......',
    '......1023......',
    '......Rrrk......',
    '......OYOR......',
    '.......WY.......',
    '................'
)
Assert-Map 'CryoMap' $CryoMap

function New-CryobotProbe {
    $c = New-Canvas
    Write-Map $c 0 0 $CryoMap $CryoPal
    Add-Outline $c
    return $c
}

# ============================================================================================
#  EUROPAN OCEAN SAMPLE - a stout sealed sample bottle of blue brine with tiny green glowing specks (the living sample)
#  a ridged titanium screw cap (A..D, b the grooves), an 8 px glass body, the brine (S, T surface; L..O) with specks G (bright), e (dim)
# ============================================================================================
$OceanPal = New-Pal ($VialGlassSpec + ' A=E6DEF0 B=BEB0D2 b=8E80A4 C=9888AE D=6A5C80 S=8ED0F0 T=5AA8D8 L=3C8CC4 M=2A6EA6 N=1E5486 O=153E66 G=B4FF8A e=5AD25A')
$OceanMap = @(
    '................',
    '................',
    '.....ABBBCD.....',
    '.....AbBbCD.....',
    '.....ABBBCD.....',
    '....gwvvvvvi....',
    '....gwSSSSTi....',
    '....gwLMGMNi....',
    '....gLLMMNNi....',
    '....gLeMMNOi....',
    '....gLMMGNOi....',
    '....gLMeMNOi....',
    '....gLMMNNOi....',
    '.....iMNNOi.....',
    '......iiii......',
    '................'
)
Assert-Map 'OceanMap' $OceanMap

function New-EuropanOceanSample {
    $c = New-Canvas
    Write-Map $c 0 0 $OceanMap $OceanPal
    Add-Outline $c -LitArgb (Hex '5E6E80') -ShadeArgb (Hex '263040')
    return $c
}

# ============================================================================================
#  MELT HEAD - a conical tungsten-carbide melt head, point down, with its orange glowing heat source at its base (on top)
#  a steel stub (A..C), the heater disc seen a little from above (m, n its rim; W, Y, O the glow), then the cone ($MeltCone rows)
# ============================================================================================
$MeltPal = New-Pal 'A=DCE2EA B=A8B0BC C=6E7682 m=8C909A n=3E4048 W=FFF6D0 Y=FFD460 O=FF8C2A r=C84A1A'
$MeltTop = @(
    '................',
    '......ABBC......',
    '.....mOOOOn.....',
    '...mOYWWWYOOn...',
    '...nOOYYOOOrn...'
)
Assert-Map 'MeltTop' $MeltTop 16 5
$MeltRamp = New-Ramp @('A4A8B2', '80848E', '62666F', '4A4D55', '36383F')
$MeltCone = @(@(5, 3, 12, 0), @(6, 3, 12, 0), @(7, 4, 11, 0), @(8, 4, 11, 0), @(9, 5, 10, 0), @(10, 5, 10, 1), @(11, 6, 9, 1), @(12, 6, 9, 1), @(13, 7, 8, 1))

function New-MeltHead {
    $c = New-Canvas
    Write-Map $c 0 0 $MeltTop $MeltPal
    Add-SpanRows $c $MeltCone $MeltRamp
    Add-Outline $c
    return $c
}

# ============================================================================================
#  JUPITER ENTRY PROBE - a blunt-cone atmospheric entry probe, heat shield first (down)
#  a small parachute canister on top, the silver conical backshell (rows 3..7) and the dark brown heat shield: the widest shoulder
#  (row 8) and the blunt nose (rows 9..11), darker towards the front
# ============================================================================================
$ProbeSilver = New-Ramp @('F6F8FB', 'D6DCE4', 'AEB6C2', '848C9A', '606876')
$ProbeShield = New-Ramp @('A07C5C', '7E5E44', '624634', '4A3428', '34241C')
$ProbeCan = New-Ramp @('B8BEC8', '8C929E', '6A707C', '4C525E', '363A44')
$ProbeBack = @(@(3, 6, 9, 0), @(4, 5, 10, 0), @(5, 4, 11, 0), @(6, 3, 12, 0), @(7, 2, 13, 1))
$ProbeFront = @(@(8, 1, 14, 0), @(9, 2, 13, 1), @(10, 3, 12, 1), @(11, 5, 10, 2))

function New-JupiterEntryProbe {
    $c = New-Canvas
    Add-SpanRows $c @(, @(2, 7, 8, 1)) $ProbeCan
    Add-SpanRows $c $ProbeBack $ProbeSilver
    Add-SpanRows $c $ProbeFront $ProbeShield
    Add-Outline $c
    return $c
}

# ============================================================================================
#  SATURN FLYBY PROBE - a small spacecraft: a white high-gain dish facing the viewer, a gold-foil bus, an RTG boom, a science boom
#  the dish is an ellipse (centre 8,4; 5.6 x 3.0) lit top-left, a darker ring halfway out (its concave face) and a grey rim, the
#  feed (f) in the middle; under it the bus (gold foil G ramp) and the engine (n, N); the RTG boom (b) runs down-left to the RTG
#  (Q lit, R, K), the science boom (b) right to the scan platform (P ramp)
# ============================================================================================
$DishRamp = New-Ramp @('FFFFFF', 'EEF0F4', 'D6DAE2', 'B4BAC6', '8E95A2')
$FlybyPal = New-Pal 'f=4A5060 n=5A5E68 N=34383F b=9AA0AA Q=8A8E96 R=5E626A K=3E4148 P=D8DCE2 p=A4AAB4'
$BusRamp = New-Ramp @('FFE89A', 'F0C658', 'C8962E', '9C6E1E', '6E4A12')
$FlybyBits = @(
    @(4, 10, 'b'), @(3, 11, 'b'), @(1, 12, 'Q'), @(2, 12, 'R'), @(1, 13, 'Q'), @(2, 13, 'R'), @(1, 14, 'R'), @(2, 14, 'K'),
    @(10, 9, 'b'), @(11, 9, 'b'), @(12, 9, 'b'), @(13, 8, 'P'), @(14, 8, 'p'), @(13, 9, 'P'), @(14, 9, 'p'), @(13, 10, 'p'), @(14, 10, 'K'),
    @(7, 11, 'n'), @(8, 11, 'N'), @(7, 4, 'f')
)

function New-SaturnFlybyProbe {
    $c = New-Canvas
    for ($y = 0; $y -lt 8; $y++) { for ($x = 0; $x -lt 16; $x++) {
        $nx = (($x + 0.5) - 8.0) / 5.6; $ny = (($y + 0.5) - 4.0) / 3.0
        $rr = [Math]::Sqrt($nx * $nx + $ny * $ny)
        if ($rr -gt 1.0) { continue }
        $lit = - (0.6 * $nx + 0.8 * $ny)
        $i = if ($lit -gt 0.35) { 0 } elseif ($lit -gt -0.1) { 1 } else { 2 }
        if ($rr -ge 0.45 -and $rr -lt 0.62) { $i = [Math]::Min(4, $i + 1) }
        if ($rr -ge 0.84) { $i = [Math]::Min(4, $i + 2) }
        Set-Px $c $x $y $DishRamp[$i]
    } }
    Add-SpanRows $c @(@(7, 6, 9, 0), @(8, 5, 10, 0), @(9, 5, 10, 1), @(10, 6, 9, 1)) $BusRamp
    foreach ($b in $FlybyBits) { Set-Px $c $b[0] $b[1] $FlybyPal[$b[2]] }
    Add-Outline $c -LitArgb (Hex '6A707C') -ShadeArgb (Hex '2C3038')
    return $c
}

# ============================================================================================
#  DATA ORBS - the interferometer's orb (New-OrbBase, Build-IVMercuryTextures.ps1): a glassy blue-violet sphere (11 px across,
#  centred on 7,6) in a small steel cradle, outlined before the mark so every orb keeps one silhouette
#   jovian_atmosphere_survey: Jupiter's bands fill the glass inside its rim (zones cream, belts orange, dark brown belts), lighter on
#     the lit side, darker at the limb, a little turbulence where Get-Noise shifts a row, a small red oval
#   gravitational_wave_catalogue: a cyan chirp across the glass, small and slow on the left, bigger and faster towards the merger
#     (c brightest), then a short ring-down
# ============================================================================================
$OrbPal = New-Pal '0=F2F0FF 1=B4AEF4 2=8C84E6 3=6A5ED0 4=4C40A8 5=32287A h=9C94F0 a=EEF1F6 b=C2C8D2 m=949CAA n=68707E o=474E5A'
$OrbCx = 7; $OrbCy = 6; $OrbR = 5.5
$OrbSpecular = @(@(4, 3), @(5, 3), @(4, 4))
$CradleMap = @(
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '..b.........n...',
    '..mb.......mn...',
    '...mb.....mn....',
    '....mbabmnn.....',
    '.....nmmno......',
    '................',
    '................'
)
Assert-Map 'CradleMap' $CradleMap

function Test-InOrb { param([int]$X, [int]$Y) return ((($X - $OrbCx) * ($X - $OrbCx) + ($Y - $OrbCy) * ($Y - $OrbCy)) -le ($OrbR * $OrbR)) }

function New-OrbBase {
    $c = New-Canvas
    $P = $OrbPal
    for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
        if (-not (Test-InOrb $x $y)) { continue }
        $nx = ($x - $OrbCx) / $OrbR; $ny = ($y - $OrbCy) / $OrbR
        $r2 = $nx * $nx + $ny * $ny
        $nz = [Math]::Sqrt([Math]::Max(0.0, 1.0 - $r2))
        $t = 0.34 + 0.40 * (-0.55 * $nx - 0.62 * $ny + 0.56 * $nz)
        $tone = if ($t -ge 0.70) { 1 } elseif ($t -ge 0.56) { 2 } elseif ($t -ge 0.42) { 3 } elseif ($t -ge 0.28) { 4 } else { 5 }
        if ($r2 -gt 0.80) { $tone = [Math]::Min(5, $tone + 1) }
        $ch = [string]$tone
        if ((0.62 * $nx + 0.70 * $ny) -gt 0.40 -and $r2 -gt 0.30 -and $r2 -le 0.80) { $ch = 'h' }
        Set-Px $c $x $y $P[$ch]
    } }
    Write-Map $c 0 0 $CradleMap $P
    Add-Outline $c
    foreach ($s in $OrbSpecular) { Set-Px $c $s[0] $s[1] $P['0'] }
    return $c
}

#   bands by row (rows 2..10 of the glass): Z zone, B belt, D dark belt; each with a lit and a shaded tone
$JovianPal = New-Pal 'Z=F6E8C6 z=D8C09A B=E8A660 b=BC7838 D=A4643A d=7A4426 K=D04A2C'
$JovianRows = @{ 2 = 'D'; 3 = 'Z'; 4 = 'B'; 5 = 'Z'; 6 = 'Z'; 7 = 'D'; 8 = 'B'; 9 = 'Z'; 10 = 'D' }
$JovianOval = @(@(9, 7), @(10, 7))

function New-JovianSurvey {
    $c = New-OrbBase
    for ($y = 2; $y -le 10; $y++) { for ($x = 0; $x -lt 16; $x++) {
        $nx = ($x - $OrbCx) / $OrbR; $ny = ($y - $OrbCy) / $OrbR
        $r2 = $nx * $nx + $ny * $ny
        if ($r2 -gt 0.64) { continue }
        $row = $y
        if ((Get-Noise $x $y 0 503) -gt 214) { $row = Get-ClampInt ($y + 1) 2 10 }
        $band = $JovianRows[$row]
        $shade = ((0.62 * $nx + 0.70 * $ny) -gt 0.05) -or ($r2 -gt 0.46)
        $ch = if ($shade) { $band.ToLowerInvariant() } else { $band }
        Set-Px $c $x $y $JovianPal[$ch]
    } }
    foreach ($o in $JovianOval) { Set-Px $c $o[0] $o[1] $JovianPal['K'] }
    foreach ($s in $OrbSpecular) { Set-Px $c $s[0] $s[1] $OrbPal['0'] }
    return $c
}

#   the chirp: one y per column (x3..11), joined by vertical runs; C the wave, c the merger peaks
$ChirpPal = New-Pal 'C=3ED8E6 c=B4FFF8'
$ChirpYs = @(6, 5, 6, 7, 5, 8, 3, 9, 6)
$ChirpBright = @(8, 9, 10)

function New-GravWaveCatalogue {
    $c = New-OrbBase
    for ($i = 0; $i -lt $ChirpYs.Count; $i++) {
        $x = 3 + $i
        $y1 = $ChirpYs[$i]; $y0 = if ($i -gt 0) { $ChirpYs[$i - 1] } else { $y1 }
        $lo = [Math]::Min($y0, $y1); $hi = [Math]::Max($y0, $y1)
        # the run covers this column's value and the step from the previous one (but not the previous value itself)
        for ($y = $lo; $y -le $hi; $y++) {
            if ($y -eq $y0 -and $y0 -ne $y1) { continue }
            if (-not (Test-InOrb $x $y)) { throw "chirp pixel $x,$y is outside the orb" }
            Set-Px $c $x $y $(if ($ChirpBright -contains $x) { $ChirpPal['c'] } else { $ChirpPal['C'] })
        }
    }
    return $c
}

# ============================================================================================
#  SATURN TRANSFER CHART - the chart family's data stick ($ChartMap of Build-IVFoundationTextures.ps1, the Mars chart's map) with
#  Saturn on its label: a gold disc (S lit, T mid, U shade) crossed by a brown ring (R), and Titan, an orange dot (O)
# ============================================================================================
$PurpleSpec = 'a=F3E4FF b=D6B0FF c=B07AF0 d=8A4CD0 e=5C2E9C f=381C64 g=1C0E36'
$StainSpec = '0=F7FAFF 1=DCE5F0 2=B8C6D8 3=8E9DB2 4=667690 5=465470 6=2C364C'
$ChartPal = New-Pal ($PurpleSpec + ' ' + $StainSpec + ' ' + 'K=6E7688 L=5A6170 M=454B58 N=333844 O=252932 u=F4F0E2 v=E6E0CC w=C4BDA6 S=EECC78 T=C89A50 U=9A7034 R=8C6E44 Q=D0802E')
$ChartMap = @(
    '................',
    '................',
    '............135.',
    '...........024..',
    '..........1235..',
    '.........LMcN...',
    '........LMMN....',
    '.......uSTR.....',
    '......uRTU......',
    '.....uQvw.......',
    '....uvvw........',
    '...LMMN.........',
    '..LMMN..........',
    '..MNO...........',
    '................',
    '................'
)
Assert-Map 'ChartMap' $ChartMap

function New-SaturnChart {
    $c = New-Canvas
    Write-Map $c 0 0 $ChartMap $ChartPal
    Add-Outline $c -LitArgb (Hex '2A2E38') -ShadeArgb (Hex '16181E')
    return $c
}

# ============================================================================================
#  HEAT EXCHANGER BUNDLE - nine tungstensteel tube ends in a sulfur-concrete frame, oblique (front, top and right faces)
#   concrete: a top lit edge, b top face, c top corner, A front border lit, C front border shade, D right face, d its dark edge
#   tubes (3x3 each): T lit rim, U mid rim, V dark rim, h the bore
# ============================================================================================
$BundlePal = New-Pal 'a=F2D68A b=DDB862 c=B08A3E A=E2C070 C=A07C36 D=8A6A2C d=6A5020 T=A4A4D0 U=7070A4 V=4C4C7E h=24243C'
$BundleMap = @(
    '................',
    '................',
    '....aaaaaaaaaa..',
    '...abbbbbbbbbbc.',
    '..AAAAAAAAAAADd.',
    '..ATTUTTUTTUCDd.',
    '..AThVThVThVCDd.',
    '..AUVVUVVUVVCDd.',
    '..ATTUTTUTTUCDd.',
    '..AThVThVThVCDd.',
    '..AUVVUVVUVVCDd.',
    '..ATTUTTUTTUCDd.',
    '..AThVThVThVCDd.',
    '..AUVVUVVUVVCDd.',
    '..CCCCCCCCCCCd..',
    '................'
)
Assert-Map 'BundleMap' $BundleMap

function New-HeatExchangerBundle {
    $c = New-Canvas
    Write-Map $c 0 0 $BundleMap $BundlePal
    Add-Outline $c -LitArgb (Hex '7A6024') -ShadeArgb (Hex '3A2C10')
    return $c
}

# ============================================================================================
#  TETHER SPOOL - a reel of thin silver aluminium tape between white aramid flanges
#  the far flange edge-on at the left (f, F, G), the tape wound as a cylinder (0 spec .. 4, lit at the top), the near flange's face
#  at the right (w, W, V woven, X, x shade) with the steel hub (o) and its hole (H), the loose end of tape hanging below
# ============================================================================================
$SpoolPal = New-Pal 'f=D6D0C2 F=EEEAE0 G=C4BEB0 w=F8F6EE W=E6E2D6 V=D2CCBC X=B4AE9E x=8E887A o=9AA0AA H=3A3E46 0=F4F6F8 1=D8DCE2 2=B8BEC6 3=949AA4 4=6E7480'
$SpoolMap = @(
    '................',
    '................',
    '..ff........ww..',
    '..FG.......wWWx.',
    '..FG1111111WVWx.',
    '..FG0000000VWVx.',
    '..FG1111111WVWx.',
    '..FG2222222VoHx.',
    '..FG2222222WHox.',
    '..FG3333333WVWx.',
    '..FG3333333VWVx.',
    '..FG4444444WVWx.',
    '..FG..23...wXXx.',
    '..ff.23.....XX..',
    '....34..........',
    '................'
)
Assert-Map 'SpoolMap' $SpoolMap

function New-TetherSpool {
    $c = New-Canvas
    Write-Map $c 0 0 $SpoolMap $SpoolPal
    Add-Outline $c -LitArgb (Hex '7A7468') -ShadeArgb (Hex '3A3832')
    return $c
}

# ============================================================================================
#  IONIAN SUBLIMATE - a crusty crystalline chunk: white-yellow facets on top, yellow and orange below, red-brown crust (g)
# ============================================================================================
$SublimatePal = New-Pal 'a=FFFDE6 b=FFF2A0 c=FAD452 d=F0B02E e=D8801E f=A8561A g=C04A1E'
$SublimateMap = @(
    '................',
    '................',
    '........a.......',
    '.......abd......',
    '....a..abcd..a..',
    '...abbabbccdabd.',
    '..abbbbbccccbde.',
    '..bbcbbgcccddde.',
    '.abbbccccgdddee.',
    '.bcbcccdddddeef.',
    '.bccgcddddeeeef.',
    '..cccdddgeeeff..',
    '...ddddeeeefff..',
    '.....eeeeff.....',
    '................',
    '................'
)
Assert-Map 'SublimateMap' $SublimateMap

function New-IonianSublimate {
    $c = New-Canvas
    Write-Map $c 0 0 $SublimateMap $SublimatePal
    Add-Outline $c -LitArgb (Hex 'B8701E') -ShadeArgb (Hex '5E2E0E')
    return $c
}

# ============================================================================================
#  TAPES - a roll of tape lying flat: one geometry, two materials (checked: one silhouette)
#  the wound face is an ellipse (centre 8,6; 6 x 3.2) of fine concentric rings lit top-left, around a steel core ring (k) and its
#  hole (H); under it the roll's side (the tape's broad face, 3 px) shaded as a cylinder; the loose end curls off to the lower right.
#   nickel_tungsten_tape:   face and side bright nickel-silver.
#   itbtc_coated_conductor: the face alternates silver substrate edges and black-purple coating, the side and the loose end are
#                           the black-purple superconductor coating, their lower edge the silver cap layer (E).
# ============================================================================================
$TapeCore = @{ k = (Hex '8E929A'); H = (Hex '2E3036') }
$TapeLooseEnd = @(@(12, 11, 1), @(13, 11, 2), @(13, 12, 1), @(14, 12, 3), @(13, 13, 2), @(14, 13, 3), @(12, 14, 3), @(13, 14, 4))
$TapeMaterials = [ordered]@{
    'nickel_tungsten_tape'   = @{ FaceA = (New-Ramp @('FAFBF6', 'E2E4DC', 'C6C9C0', 'A4A79E', '7C7F78')); FaceB = (New-Ramp @('EEF0E8', 'D2D5CC', 'B6B9B0', '94978E', '6E716A'))
                                  Side = (New-Ramp @('F6F7F2', 'DCDED6', 'BCBFB6', '989B92', '74776F')); Edge = 0; Outline = @('6E7068', '30322E') }
    'itbtc_coated_conductor' = @{ FaceA = (New-Ramp @('F2F4F8', 'D0D4DC', 'B0B6C0', '8C929E', '686E7A')); FaceB = (New-Ramp @('7A6492', '5A4874', '42345A', '302642', '201A2E'))
                                  Side = (New-Ramp @('6E5886', '503E68', '3A2E4E', '2A2038', '1C1626')); Edge = (Hex 'D0D4DC'); Outline = @('4A3E5A', '18121E') }
}

function Test-InTapeFace { param([int]$X, [int]$Y) $nx = (($X + 0.5) - 8.0) / 6.0; $ny = (($Y + 0.5) - 6.0) / 3.2; return (($nx * $nx + $ny * $ny) -le 1.0) }

function New-TapeRoll {
    param($M)
    $c = New-Canvas
    # the side: below the face's lower edge in each column, 3 px deep; the lowest pixel is the tape's edge
    for ($x = 0; $x -lt 16; $x++) {
        $bottom = -1
        for ($y = 0; $y -lt 16; $y++) { if (Test-InTapeFace $x $y) { $bottom = $y } }
        if ($bottom -lt 0) { continue }
        for ($k = 1; $k -le 3; $k++) {
            $tone = Get-ClampInt ((Get-SpanTone $x 2 13) + $(if ($k -eq 3) { 1 } else { 0 })) 0 4
            $col = $M.Side[$tone]
            if ($k -eq 3 -and $M.Edge -ne 0) { $col = $M.Edge }
            Set-Px $c $x ($bottom + $k) $col
        }
    }
    for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
        if (-not (Test-InTapeFace $x $y)) { continue }
        $nx = (($x + 0.5) - 8.0) / 6.0; $ny = (($y + 0.5) - 6.0) / 3.2
        $rr = [Math]::Sqrt($nx * $nx + $ny * $ny)
        if ($rr -lt 0.30) { Set-Px $c $x $y $TapeCore.H; continue }
        if ($rr -lt 0.46) { Set-Px $c $x $y $TapeCore.k; continue }
        $lit = - (0.55 * $nx + 0.65 * $ny)
        $tone = if ($lit -gt 0.45) { 0 } elseif ($lit -gt 0.05) { 1 } elseif ($lit -gt -0.35) { 2 } else { 3 }
        $ramp = if (([int][Math]::Floor($rr * 7)) % 2 -eq 0) { $M.FaceA } else { $M.FaceB }
        Set-Px $c $x $y $ramp[$tone]
    } }
    foreach ($p in $TapeLooseEnd) {
        $col = $M.Side[$p[2]]
        if ($M.Edge -ne 0 -and $p[2] -ge 3) { $col = $M.Edge }
        Set-Px $c $p[0] $p[1] $col
    }
    Add-Outline $c -LitArgb (Hex $M.Outline[0]) -ShadeArgb (Hex $M.Outline[1])
    return $c
}

# ============================================================================================
#  NEUROTROPHIC FACTOR - a glass ampoule of pale pink clear protein solution
#  the sealed tip, the head, a blue break ring (r, R) at the neck, the body with the solution (S, T surface; L..N) and a round bottom
# ============================================================================================
$AmpoulePal = New-Pal ($VialGlassSpec + ' r=6E9AF0 R=3E64C0 S=FFEEF4 T=F6CCDA L=F8D6E2 M=EAB6C8 N=CC92A8')
$AmpouleMap = @(
    '................',
    '.......gi.......',
    '.......wi.......',
    '......gwvi......',
    '......gwvi......',
    '.......rR.......',
    '......gwvi......',
    '.....gwvvvi.....',
    '.....gwSSTi.....',
    '.....gLLMNi.....',
    '.....gLMMNi.....',
    '.....gLMMNi.....',
    '.....gLMNNi.....',
    '......iNNi......',
    '................',
    '................'
)
Assert-Map 'AmpouleMap' $AmpouleMap

function New-NeurotrophicFactor {
    $c = New-Canvas
    Write-Map $c 0 0 $AmpouleMap $AmpoulePal
    Add-Outline $c -LitArgb (Hex '7A8894') -ShadeArgb (Hex '343C46')
    return $c
}

# ============================================================================================
#  NEURAL ORGANOID - a pinkish-grey folded tissue sphere in a drop of pink culture medium
#  the drop is a flat lens (rows 10..13, m ramp, two highlights); the sphere (centre 8,7.5, radius 3.9) is shaded top-left with
#  the folds ($OrganoidFolds) two tones darker and a spec where the light hits
# ============================================================================================
$OrganoidRamp = New-Ramp @('F6DCE0', 'E2B8C0', 'C8989F', 'A47882', '7A5862')
$MediumRamp = New-Ramp @('FFDCD8', 'F4ACAC', 'DE8A92', 'B46672')
$OrganoidFolds = @(@(6, 5), @(7, 5), @(8, 6), @(9, 6), @(5, 8), @(6, 8), @(7, 9), @(9, 8), @(10, 8), @(10, 9), @(7, 10), @(8, 10), @(10, 5), @(11, 6))

function New-NeuralOrganoid {
    $c = New-Canvas
    foreach ($r in @(@(10, 3, 12), @(11, 2, 13), @(12, 2, 13), @(13, 4, 11))) {
        for ($x = $r[1]; $x -le $r[2]; $x++) {
            $i = if ($x -lt 6) { 1 } elseif ($x -lt 11) { 2 } else { 3 }
            if ($r[0] -eq 13) { $i = [Math]::Min(3, $i + 1) }
            Set-Px $c $x $r[0] $MediumRamp[$i]
        }
    }
    Set-Px $c 3 11 $MediumRamp[0]; Set-Px $c 4 10 $MediumRamp[0]
    for ($y = 2; $y -le 12; $y++) { for ($x = 3; $x -le 12; $x++) {
        $dx = ($x + 0.5) - 8.0; $dy = ($y + 0.5) - 7.5
        $r = [Math]::Sqrt($dx * $dx + $dy * $dy)
        if ($r -gt 3.9) { continue }
        $lit = - ($dx * 0.6 + $dy * 0.7) / 3.9
        $i = if ($lit -gt 0.5) { 0 } elseif ($lit -gt 0.1) { 1 } elseif ($lit -gt -0.35) { 2 } else { 3 }
        if ($r -gt 3.2) { $i = [Math]::Min(4, $i + 1) }
        Set-Px $c $x $y $OrganoidRamp[$i]
    } }
    foreach ($f in $OrganoidFolds) {
        $cur = Get-Px $c $f[0] $f[1]
        $idx = [Array]::IndexOf($OrganoidRamp, $cur)
        if ($idx -ge 0) { Set-Px $c $f[0] $f[1] $OrganoidRamp[[Math]::Min(4, $idx + 2)] }
    }
    Set-Px $c 6 6 $OrganoidRamp[0]
    Add-Outline $c
    return $c
}

# ============================================================================================
#  TRIPLE-JUNCTION WAFER - a round wafer seen a little from above
#  face ellipse (centre 8,7; 6.5 x 5.0): blue-black (2, 3) with a diagonal sheen (0, 1) inside a gold-grey germanium rim (G ramp);
#  under it the wafer's 1 px edge, gold-grey
# ============================================================================================
$WaferFace = New-Ramp @('3E5088', '28345E', '182040', '10162C')
$WaferGe = New-Ramp @('ECE0B2', 'C8BC90', 'A09670', '7A7258')

function New-TripleJunctionWafer {
    $c = New-Canvas
    for ($x = 0; $x -lt 16; $x++) {
        $bottom = -1
        for ($y = 0; $y -lt 16; $y++) {
            $nx = (($x + 0.5) - 8.0) / 6.5; $ny = (($y + 0.5) - 7.0) / 5.0
            if (($nx * $nx + $ny * $ny) -le 1.0) { $bottom = $y }
        }
        if ($bottom -ge 0) { Set-Px $c $x ($bottom + 1) $WaferGe[(Get-ClampInt ((Get-SpanTone $x 1 14) - 0) 2 3)] }
    }
    for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
        $nx = (($x + 0.5) - 8.0) / 6.5; $ny = (($y + 0.5) - 7.0) / 5.0
        $rr = [Math]::Sqrt($nx * $nx + $ny * $ny)
        if ($rr -gt 1.0) { continue }
        if ($rr -gt 0.84) {
            $lit = - ($nx + $ny)
            Set-Px $c $x $y $WaferGe[$(if ($lit -gt 0.5) { 0 } elseif ($lit -gt -0.3) { 1 } else { 2 })]
            continue
        }
        $d = ($x + $y) - 11
        $i = if ($d -ge -1 -and $d -le 0) { 1 } elseif ($d -eq 1) { 0 } elseif ($d -ge 6) { 3 } else { 2 }
        Set-Px $c $x $y $WaferFace[$i]
    } }
    Add-Outline $c -LitArgb (Hex '6A6450') -ShadeArgb (Hex '2E2A20')
    return $c
}

# ============================================================================================
#  TRIPLE-JUNCTION CELL - a square cell with cropped corners (x2..13, y2..13)
#  a lit top/left border (E) and a dark bottom/right one (e), deep blue (b, with a diagonal sheen m), thin fingers (f) on rows 5, 8,
#  11 and two silver busbars (s, a glint S at the top) on columns 5 and 10
# ============================================================================================
$CellPal = New-Pal 'E=5A7ED8 e=142A60 b=1E3A8C m=2C4CA4 f=7A88A8 s=D8DEE6 S=F8FAFC'

function New-TripleJunctionCell {
    $c = New-Canvas
    $P = $CellPal
    for ($y = 2; $y -le 13; $y++) { for ($x = 2; $x -le 13; $x++) {
        if (($x -eq 2 -or $x -eq 13) -and ($y -eq 2 -or $y -eq 13)) { continue }
        if ($y -eq 2 -or $x -eq 2) { $ch = 'E' }
        elseif ($y -eq 13 -or $x -eq 13) { $ch = 'e' }
        elseif ($x -eq 5 -or $x -eq 10) { $ch = $(if ($y -eq 3) { 'S' } else { 's' }) }
        elseif ($y -eq 5 -or $y -eq 8 -or $y -eq 11) { $ch = 'f' }
        else { $d = $x + $y; $ch = $(if ($d -ge 9 -and $d -le 11) { 'm' } else { 'b' }) }
        Set-Px $c $x $y $P[$ch]
    } }
    Add-Outline $c -LitArgb (Hex '24366A') -ShadeArgb (Hex '0E1630')
    return $c
}

# ============================================================================================
#  HSS-S DRILL BIT - Draw-Helix (the drill bits' shader, copied from Build-EVTextures.ps1) with the tungsten steel bit's geometry
#  (New-TungstenSteelBit), so the family keeps one silhouette; HSS-S is GregTech's dark violet steel
# ============================================================================================
function Draw-Helix {
    param($Canvas, $Ramp, [double]$Xc, [double]$TipY, [double]$RadBody, [double]$TipLen, [double]$BodyLen,
          [double]$RadShank, [double]$TotalLen, [double]$Pitch, [double]$Starts, [double]$Amp, [double]$Phase = 0.0)
    $lightX = -0.62; $lightZ = 0.50
    for ($y = 0; $y -lt $Canvas.H; $y++) {
        for ($x = 0; $x -lt $Canvas.W; $x++) {
            $axial = $TipY - ($y + 0.5)
            $perp = ($x + 0.5) - $Xc
            if ($axial -lt -0.2 -or $axial -gt $TotalLen) { continue }
            $zone = 'thread'
            if ($axial -le $TipLen) { $rad = $RadBody * [Math]::Max(0.0, $axial) / $TipLen }
            elseif ($axial -le $BodyLen) { $rad = $RadBody }
            elseif ($axial -le ($BodyLen + 1.0)) { $rad = $RadBody; $zone = 'groove' }
            else { $rad = $RadShank; $zone = 'shank' }
            if ([Math]::Abs($perp) -gt ($rad + 0.1)) { continue }
            $radSafe = [Math]::Max($rad, 0.5)
            $across = [Math]::Max(-$radSafe, [Math]::Min($radSafe, $perp))
            $depth = [Math]::Sqrt([Math]::Max(0.0, $radSafe * $radSafe - $across * $across))
            $diffuse = [Math]::Max(0.0, ($across / $radSafe) * $lightX + ($depth / $radSafe) * $lightZ)
            $tone = 0.18 + 0.78 * $diffuse
            if ($zone -eq 'thread') {
                $theta = [Math]::Asin([Math]::Max(-1.0, [Math]::Min(1.0, $across / $radSafe)))
                $turn = $Starts * ($axial / $Pitch + $theta / (2 * [Math]::PI)) + $Phase
                $s = $turn - [Math]::Floor($turn)
                $ridge = 0.5 - 0.5 * [Math]::Cos(2 * [Math]::PI * $s)
                $tone += $Amp * ($ridge - 0.5)
            } elseif ($zone -eq 'groove') { $tone = $tone * 0.72 }
            $idx = if ($tone -ge 0.78) { 0 } elseif ($tone -ge 0.60) { 1 } elseif ($tone -ge 0.42) { 2 } elseif ($tone -ge 0.26) { 3 } else { 4 }
            Set-Px $Canvas $x $y $Ramp[$idx]
        }
    }
}

$RampHssS = New-Ramp @('E2D6EA', 'B6A2C8', '8C76A2', '624E78', '3E2E52')

function New-HssSBit {
    $c = New-Canvas
    Draw-Helix $c $RampHssS 8.0 14.7 3.6 8.5 10.5 2.4 13.6 16.0 3.0 0.95 0.0
    Add-Outline $c -LitArgb (Hex '5E4C70') -ShadeArgb (Hex '1E1428')
    return $c
}

# ============================================================================================
#  ANCHOR HARPOON - lower left (cable eye) to upper right (tip), in diagonal coordinates al = x - y (along) and ac = x + y (across)
#  the shaft is the two diagonals ac = 15 (lit) and 16 (shade) for al -7..5, HSS-S with a glint every 4 steps; the head (al 5..13)
#  narrows to the point, tungsten carbide with a honed lit edge; two barbs point back from its base corners; the eye is a ring at
#  the shaft's foot and a braided cable stub leaves it
# ============================================================================================
$RampCarbide = New-Ramp @('EEF2F8', 'BCC4D0', '8E96A6', '646B7A', '454B58')
$HarpoonBarbs = @(@(8, 4, 2), @(7, 4, 3), @(12, 7, 3), @(12, 8, 4))
$HarpoonEye = @(@(2, 11, 1), @(3, 11, 2), @(1, 12, 1), @(3, 12, 3), @(1, 13, 2), @(2, 13, 3), @(3, 13, 3))
$HarpoonCable = @(@(1, 14, (Hex '8A8478')), @(0, 15, (Hex '5E5A50')))

function New-AnchorHarpoon {
    $c = New-Canvas
    for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
        $al = $x - $y; $ac = $x + $y; $d = $ac - 15.5
        if ($al -ge -7 -and $al -le 5 -and ($ac -eq 15 -or $ac -eq 16)) {
            $i = if ($ac -eq 15) { $(if ((($al + 8) % 4) -eq 0) { 0 } else { 1 }) } else { 3 }
            Set-Px $c $x $y $RampHssS[$i]
        }
        if ($al -ge 5 -and $al -le 13) {
            $hw = 0.6 + 2.6 * (13 - $al) / 8.0
            if ([Math]::Abs($d) -le $hw) {
                $s = $d / $hw
                $i = if ($s -lt -0.6) { 0 } elseif ($s -lt 0.0) { 1 } elseif ($s -lt 0.6) { 2 } else { 3 }
                Set-Px $c $x $y $RampCarbide[$i]
            }
        }
    } }
    foreach ($b in $HarpoonBarbs) { Set-Px $c $b[0] $b[1] $RampCarbide[$b[2]] }
    foreach ($e in $HarpoonEye) { Set-Px $c $e[0] $e[1] $RampHssS[$e[2]] }
    foreach ($k in $HarpoonCable) { Set-Px $c $k[0] $k[1] $k[2] }
    Add-Outline $c -LitArgb (Hex '4E4262') -ShadeArgb (Hex '1C1426')
    return $c
}

# ============================================================================================
#  CASING BLOCKS - fully opaque, seamless (every pattern repeats on 16 px, or 8 px; frames sit on two edges so tiles continue)
# ============================================================================================
#  STATION TRUSS: light aluminium plating (0..4, brushed along x) behind a titanium truss: chords on rows 0..1 and columns 0..1
#  (lit, then mid), an X brace on x = y and x + y = 17 (lit pixel, shaded pixel), a gusset plate where they cross, rivets on the
#  chords; the truss casts a one-pixel shadow (4) on the plating right and below it
$TrussPal = New-Pal '0=E8ECF0 1=DCE0E5 2=D0D5DB 3=C2C8CF 4=A8AFB8 a=EEE6F6 b=CEC0DE c=A898BE d=7E6E96 r=FFFFFF'

function Get-TrussCell {
    param([int]$X, [int]$Y)
    if ($Y -eq 0 -or $X -eq 0) { return $(if (($Y -eq 0 -and ($X % 8) -eq 4) -or ($X -eq 0 -and ($Y % 8) -eq 4)) { 'r' } else { 'a' }) }
    if ($Y -eq 1 -or $X -eq 1) { return 'c' }
    if ($X -ge 7 -and $X -le 10 -and $Y -ge 7 -and $Y -le 10) {
        if ($X -eq 8 -and $Y -eq 8) { return 'r' }
        if ($X -eq 7 -or $Y -eq 7) { return 'a' }
        if ($X -eq 10 -or $Y -eq 10) { return 'd' }
        return 'b'
    }
    if ($X -eq $Y -or ($X + $Y) -eq 17) { return 'b' }
    if ($X -eq ($Y + 1) -or ($X + $Y) -eq 18) { return 'd' }
    return ''
}

function New-StationTrussCasing {
    $c = New-Canvas
    for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
        $ch = Get-TrussCell $x $y
        if ($ch -eq '') {
            $n = Get-Noise ([int][Math]::Floor($x / 4)) $y 0 601
            $ch = if ($n -lt 60) { '1' } elseif ($n -lt 200) { '2' } else { '3' }
            if ((Get-TrussCell (($x + 15) % 16) $y) -ne '' -or (Get-TrussCell $x (($y + 15) % 16)) -ne '') { $ch = '4' }
        }
        Set-Px $c $x $y $TrussPal[$ch]
    } }
    return $c
}

#  RADIATION VAULT: dark titanium/tantalum plates (L lit edge, M/m mottle, D shaded edge, K seam) in two staggered courses (rows
#  0..6 with a seam at x = 15, rows 8..14 with a seam at x = 7), a copper layer (c, C) on row 7 and a tin layer (t, T) on row 15
#  (graded-Z), two 2x2 rivets per plate (R lit, r, k shadow)
$VaultPal = New-Pal 'L=7A7E8C M=5E626E m=565A66 D=444752 K=2E3038 c=B06C42 C=7E4A2C t=BEC2C6 T=9A9EA4 R=AEB4C2 r=7A808E k=26282E'
$VaultRivets = @(@(3, 2), @(11, 2), @(3, 10), @(11, 10))

function New-RadiationVaultCasing {
    $c = New-Canvas
    $P = $VaultPal
    for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
        if ($y -eq 7) { $ch = $(if ((Get-Noise $x 7 0 611) -lt 150) { 'c' } else { 'C' }) }
        elseif ($y -eq 15) { $ch = $(if ((Get-Noise $x 15 0 613) -lt 150) { 't' } else { 'T' }) }
        else {
            $seam = if ($y -lt 7) { 15 } else { 7 }
            $v = if ($y -lt 7) { $y } else { $y - 8 }
            if ($x -eq $seam) { $ch = 'K' }
            elseif ($v -eq 0 -or $x -eq (($seam + 1) % 16)) { $ch = 'L' }
            elseif ($v -eq 6 -or $x -eq (($seam + 15) % 16)) { $ch = 'D' }
            else { $ch = $(if ((Get-Noise $x $y 0 617) -lt 110) { 'm' } else { 'M' }) }
        }
        Set-Px $c $x $y $P[$ch]
    } }
    foreach ($r in $VaultRivets) {
        Set-Px $c $r[0] $r[1] $P['R']; Set-Px $c ($r[0] + 1) $r[1] $P['r']
        Set-Px $c $r[0] ($r[1] + 1) $P['r']; Set-Px $c ($r[0] + 1) ($r[1] + 1) $P['k']
    }
    return $c
}

#  WHIPPLE SHIELD: an aluminium-foam bumper (rows 0..9: f0 lit row, f1/f2 foam, p pores, f3 the shaded last row) pitted by impact
#  craters (h pit, s shaded inner wall at the top-left, l lit inner wall at the bottom-right), a woven yellow aramid layer (rows
#  10..14, w/W weave, a frayed hole), and a dark stand-off gap (row 15)
$WhipplePal = New-Pal 'F=E2E6EA f=CBCFD5 e=BABFC6 p=8E949E E=A2A8B0 w=F0E2A8 W=D4C07A h=464A52 s=8A9098 l=F8FAFC g=4A4E56'
$WhippleCraters = @(@(4, 3), @(11, 6), @(14, 2))
$WhipplePits = @(@(8, 1), @(2, 7), @(8, 8))

function New-WhippleShieldCasing {
    $c = New-Canvas
    $P = $WhipplePal
    for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
        if ($y -eq 0) { $ch = 'F' }
        elseif ($y -le 8) { $n = Get-Noise $x $y 0 621; $ch = $(if ($n -gt 214) { 'p' } elseif ($n -lt 120) { 'f' } else { 'e' }) }
        elseif ($y -eq 9) { $ch = 'E' }
        elseif ($y -le 14) { $ch = $(if ((([int][Math]::Floor($x / 2)) + $y) % 2 -eq 0) { 'w' } else { 'W' }) }
        else { $ch = 'g' }
        Set-Px $c $x $y $P[$ch]
    } }
    foreach ($k in $WhippleCraters) {
        Set-Px $c $k[0] ($k[1] - 1) $P['s']; Set-Px $c ($k[0] - 1) $k[1] $P['s']
        Set-Px $c $k[0] $k[1] $P['h']
        Set-Px $c ($k[0] + 1) $k[1] $P['l']; Set-Px $c $k[0] ($k[1] + 1) $P['l']
    }
    foreach ($k in $WhipplePits) { Set-Px $c $k[0] $k[1] $P['h']; Set-Px $c ($k[0] + 1) $k[1] $P['l'] }
    Set-Px $c 9 12 $P['h']; Set-Px $c 10 12 $P['s']
    return $c
}

#  ASTEROID REGOLITH: four courses of 4 rows (the last one mortar, m), with irregular joints ($RubbleJoints, one list per course);
#  each brick has a lit top row (a), a mottle (b, c) shifted per brick, a shaded right column (d), and metallic flecks (s, S)
$RubblePal = New-Pal 'a=7E6E60 b=665849 c=574B40 d=463D35 m=2E2722 s=D0D4D8 S=9CA0A6'
$RubbleJoints = @(@(6, 13), @(3, 10), @(0, 8), @(4, 12))

function New-AsteroidRegolithCasing {
    $c = New-Canvas
    $P = $RubblePal
    for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
        $course = [int][Math]::Floor($y / 4); $v = $y % 4
        $joints = $RubbleJoints[$course]
        if ($v -eq 3 -or $joints -contains $x) { Set-Px $c $x $y $P['m']; continue }
        $brick = 0; foreach ($j in $joints) { if ($x -gt $j) { $brick++ } }
        if ($brick -eq 2) { $brick = 0 }   # the last brick wraps round to the first
        if ($v -eq 0) { $ch = 'a' }
        elseif ($joints -contains (($x + 1) % 16)) { $ch = 'd' }
        else {
            $n = (Get-Noise $x $y 0 631) + ((Get-Noise $course $brick 0 633) - 128) / 3
            $ch = if ($n -lt 110) { 'b' } elseif ($n -lt 230) { 'c' } else { 'd' }
        }
        $f = Get-Noise $x $y 0 637
        if ($f -gt 247) { $ch = 's' } elseif ($f -gt 238) { $ch = 'S' }
        Set-Px $c $x $y $P[$ch]
    } }
    return $c
}

#  SULFUR CONCRETE: big blocks 16 x 8 in running bond (vertical joint at x = 7 on rows 0..6, at x = 15 on rows 8..14; horizontal
#  joints on rows 7 and 15, j), a lit top row and left column (a), a shaded bottom row and right column (e), an ochre mottle (b, c,
#  d), aggregate (g) and sulfur crystals (y, a glint Y)
$SulfurPal = New-Pal 'a=EED48A b=DDBE6E c=D2B262 d=C6A456 e=A88A44 j=86702E g=8A7448 y=FFEE70 Y=FFFBD0'

function New-SulfurConcreteCasing {
    $c = New-Canvas
    $P = $SulfurPal
    for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
        $v = $y % 8
        $joint = if ($y -lt 8) { 7 } else { 15 }
        if ($v -eq 7 -or $x -eq $joint) { $ch = 'j' }
        elseif ($v -eq 0 -or $x -eq (($joint + 1) % 16)) { $ch = 'a' }
        elseif ($v -eq 6 -or $x -eq (($joint + 15) % 16)) { $ch = 'e' }
        else {
            $n = Get-Noise $x $y 0 641
            $ch = if ($n -lt 70) { 'b' } elseif ($n -lt 180) { 'c' } elseif ($n -lt 236) { 'd' } else { 'g' }
            $s = Get-Noise $x $y 0 643
            if ($s -gt 248) { $ch = 'Y' } elseif ($s -gt 238) { $ch = 'y' }
        }
        Set-Px $c $x $y $P[$ch]
    } }
    return $c
}

#  MAGNETIC BEARING: a bevelled steel plate (A lit edge, B/C mottle, E shaded edge), a ring of eight tetrataenite segments (t ramp,
#  odd segments a step darker, dark gaps g between them; the outer edge lit top-left, the inner edge lit bottom-right as it steps
#  down), an air gap (g) and the polished shaft (s ramp, a spec at its top-left)
$BearingPal = New-Pal 'A=B8C0CC B=8E96A4 C=848C9A E=5A606C g=2C2E34'
$TetraRamp = New-Ramp @('E2DEC4', 'C4BEA0', 'A8A282', '8A8466', '6A654C')
$ShaftRamp = New-Ramp @('FFFFFF', 'E4E8EE', 'C0C6CE', '949AA4')

function New-MagneticBearing {
    $c = New-Canvas
    $P = $BearingPal
    for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
        $dx = ($x + 0.5) - 8.0; $dy = ($y + 0.5) - 8.0
        $r = [Math]::Sqrt($dx * $dx + $dy * $dy)
        $lit = - ($dx + $dy) / ([Math]::Max($r, 0.01) * 1.4142)
        if ($r -le 2.6) {
            $i = if ($lit -gt 0.6 -and $r -gt 0.8) { 0 } elseif ($lit -gt -0.2) { 1 } elseif ($r -gt 1.6) { 3 } else { 2 }
            Set-Px $c $x $y $ShaftRamp[$i]
        } elseif ($r -le 3.5) { Set-Px $c $x $y $P['g'] }
        elseif ($r -le 6.6) {
            $ang = [Math]::Atan2($dy, $dx) + [Math]::PI
            $segF = $ang / ([Math]::PI / 4)
            $seg = [int][Math]::Floor($segF)
            $frac = $segF - $seg
            if ($frac * $r * 0.785 -lt 0.45) { Set-Px $c $x $y $P['g']; continue }
            $i = 1 + ($seg % 2)
            if ($r -gt 5.7) { $i = $(if ($lit -gt 0.2) { 0 } else { 3 + ($seg % 2) }) }
            elseif ($r -lt 4.4) { $i = $(if ($lit -gt 0.2) { 3 } else { 0 }) }
            Set-Px $c $x $y $TetraRamp[(Get-ClampInt $i 0 4)]
        } else {
            if ($y -eq 0 -or $x -eq 0) { $ch = 'A' }
            elseif ($y -eq 15 -or $x -eq 15) { $ch = 'E' }
            else { $ch = $(if ((Get-Noise $x $y 0 651) -lt 128) { 'B' } else { 'C' }) }
            Set-Px $c $x $y $P[$ch]
        }
    } }
    return $c
}

#  COILGUN COIL: violet HSS-S rims (rows 0..1 lit, 14..15 shaded, bolts b) and four turns of black-insulated superconducting wire
#  (rows 2..13, 3 rows a turn: copper-brown top, dark, darkest) with brighter copper where the turns cross over, every 8 px
$CoilPal = New-Pal '0=B49CC4 1=8C76A0 2=6A567E 3=46365A b=D8CCE2 B=2E2240 c=8A4A28 C=C88050 k=2A1E1C K=1A1214'

function New-CoilgunCoilCasing {
    $c = New-Canvas
    $P = $CoilPal
    for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
        if ($y -le 1 -or $y -ge 14) {
            $ch = @{ 0 = '0'; 1 = '1'; 14 = '2'; 15 = '3' }[$y]
            if (($x % 8) -eq 3 -and ($y -eq 0 -or $y -eq 14)) { $ch = 'b' }
            if (($x % 8) -eq 3 -and ($y -eq 1 -or $y -eq 15)) { $ch = 'B' }
        } else {
            $turn = [int][Math]::Floor(($y - 2) / 3); $v = ($y - 2) % 3
            $ch = @('c', 'k', 'K')[$v]
            if ($v -eq 0 -and (($x + 2 * $turn) % 8) -eq 0) { $ch = 'C' }
            if ($v -eq 1 -and (($x + 2 * $turn) % 8) -eq 1) { $ch = 'c' }
        }
        Set-Px $c $x $y $P[$ch]
    } }
    return $c
}

#  SAPPHIRE TEST MASS: polished blue sapphire: a bevel (e lit edge, E shaded edge), four facets round a central table (T): top (1)
#  lightest, left (2), right (3), bottom (4) darkest, the facet edges (l) light, and white glints (w)
$SapphirePal = New-Pal 'e=9CC8FF E=122C66 1=4A8AE8 2=3470D0 T=2E62C0 3=2252A8 4=1A3E88 l=7AB0F8 w=E8F4FF'
$SapphireGlints = @(@(3, 2), @(2, 3), @(6, 5), @(12, 11))

function New-SapphireTestMass {
    $c = New-Canvas
    $P = $SapphirePal
    for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
        $dx = $x - 7.5; $dy = $y - 7.5
        if ($y -eq 0 -or $x -eq 0) { $ch = 'e' }
        elseif ($y -eq 15 -or $x -eq 15) { $ch = 'E' }
        elseif ([Math]::Abs($dx) -lt 3 -and [Math]::Abs($dy) -lt 3) { $ch = 'T' }
        elseif ([Math]::Abs([Math]::Abs($dx) - [Math]::Abs($dy)) -lt 0.6) { $ch = 'l' }
        elseif ($dy -lt -[Math]::Abs($dx)) { $ch = '1' }
        elseif ($dx -lt -[Math]::Abs($dy)) { $ch = '2' }
        elseif ($dx -gt [Math]::Abs($dy)) { $ch = '3' }
        else { $ch = '4' }
        Set-Px $c $x $y $P[$ch]
    } }
    foreach ($g in $SapphireGlints) { Set-Px $c $g[0] $g[1] $P['w'] }
    return $c
}

#  ORBITAL SOLAR PANEL - grindless:orbital_solar_panel (models/block/luv/orbital_solar_panel.json: a 3 px slab, y 6..9)
#  cells (top): 8 px multi-junction cells, 2x2 per tile: a gap (k) on each cell's last row and column, cropped corners (k), a silver
#  busbar (s, a glint S) along each cell's top, fine fingers (f) on columns 2 and 4, blue-black (b) with a diagonal sheen (m, n)
#  frame (sides and underside): New-ThinFilmFrame's routine in brushed titanium: rows 6..8 are a lit line, the mid tone, a dark line
$OrbCellPal = New-Pal 'k=0C0E1A b=161A38 m=20264C n=2C3460 f=4A5478 s=B8C0D0 S=E0E6F0'
$OrbFramePal = New-Pal '0=F4EEFA 1=D8CCE6 2=C0B2D2 3=A898BE 4=8C7EA4 5=6E6286'

function New-OrbitalSolarCells {
    $c = New-Canvas
    $P = $OrbCellPal
    for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
        $u = $x % 8; $v = $y % 8
        if ($u -eq 7 -or $v -eq 7 -or (($u -eq 0 -or $u -eq 6) -and ($v -eq 0 -or $v -eq 6))) { $ch = 'k' }
        elseif ($v -eq 0) { $ch = $(if ($u -eq 2) { 'S' } else { 's' }) }
        elseif ($u -eq 2 -or $u -eq 4) { $ch = 'f' }
        else {
            $d = ($x + $y) % 16
            $ch = if ($d -eq 6) { 'n' } elseif ($d -ge 5 -and $d -le 7) { 'm' } else { 'b' }
        }
        Set-Px $c $x $y $P[$ch]
    } }
    return $c
}

function New-OrbitalSolarFrame {
    $c = New-Canvas
    $P = $OrbFramePal
    for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
        $n = Get-Noise ([int][Math]::Floor($x / 4)) $y 0 67
        $tone = if ($n -lt 70) { 1 } elseif ($n -lt 200) { 2 } else { 3 }
        if ($y -eq 6) { $tone = 0 } elseif ($y -eq 7) { $tone = 2 } elseif ($y -eq 8) { $tone = 4 }
        if ($x -eq 0 -or $y -eq 0) { $tone = [Math]::Min($tone, 1) }
        if ($x -eq 15 -or $y -eq 15) { $tone = [Math]::Max($tone, 4) }
        Set-Px $c $x $y $P[[string]$tone]
    } }
    return $c
}

# ============================================================================================
#  BUILD
# ============================================================================================
$Outputs = [ordered]@{}
function Add-Output { param([string]$Name, [string]$Group, [string]$Rel, [scriptblock]$Build, [int]$FrameTime = 0, $Arg = $null) $Outputs[$Name] = @{ Group = $Group; Rel = $Rel; Build = $Build; FrameTime = $FrameTime; Arg = $Arg } }

Add-Output 'asteroid_pgm_concentrate' 'items' 'item/asteroid_pgm_concentrate.png' { New-PgmConcentrate }
Add-Output 'chondritic_extract' 'items' 'item/chondritic_extract.png' { New-ChondriticExtract }
Add-Output 'capture_bag' 'items' 'item/capture_bag.png' { New-CaptureBag }
foreach ($seed in $SeedPlaces.Keys) { Add-Output $seed 'seeds' "item/$seed.png" { param($a) New-PlaceSeed $a } 3 $SeedPlaces[$seed] }
Add-Output 'engineered_barley_seed' 'items' 'item/engineered_barley_seed.png' { New-EngineeredBarley }
Add-Output 'engineered_tobacco_seed' 'items' 'item/engineered_tobacco_seed.png' { New-EngineeredTobacco }
Add-Output 'cryobot_probe' 'items' 'item/cryobot_probe.png' { New-CryobotProbe }
Add-Output 'europan_ocean_sample' 'items' 'item/europan_ocean_sample.png' { New-EuropanOceanSample }
Add-Output 'melt_head' 'items' 'item/melt_head.png' { New-MeltHead }
Add-Output 'jupiter_entry_probe' 'items' 'item/jupiter_entry_probe.png' { New-JupiterEntryProbe }
Add-Output 'saturn_flyby_probe' 'items' 'item/saturn_flyby_probe.png' { New-SaturnFlybyProbe }
Add-Output 'jovian_atmosphere_survey' 'items' 'item/jovian_atmosphere_survey.png' { New-JovianSurvey }
Add-Output 'gravitational_wave_catalogue' 'items' 'item/gravitational_wave_catalogue.png' { New-GravWaveCatalogue }
Add-Output 'saturn_transfer_chart' 'items' 'item/saturn_transfer_chart.png' { New-SaturnChart }
Add-Output 'heat_exchanger_bundle' 'items' 'item/heat_exchanger_bundle.png' { New-HeatExchangerBundle }
Add-Output 'tether_spool' 'items' 'item/tether_spool.png' { New-TetherSpool }
Add-Output 'ionian_sublimate' 'items' 'item/ionian_sublimate.png' { New-IonianSublimate }
foreach ($tape in $TapeMaterials.Keys) { Add-Output $tape 'items' "item/$tape.png" { param($a) New-TapeRoll $a } 0 $TapeMaterials[$tape] }
Add-Output 'neurotrophic_factor' 'items' 'item/neurotrophic_factor.png' { New-NeurotrophicFactor }
Add-Output 'neural_organoid' 'items' 'item/neural_organoid.png' { New-NeuralOrganoid }
Add-Output 'triple_junction_wafer' 'items' 'item/triple_junction_wafer.png' { New-TripleJunctionWafer }
Add-Output 'triple_junction_cell' 'items' 'item/triple_junction_cell.png' { New-TripleJunctionCell }
Add-Output 'hss_s_drill_bit' 'items' 'item/hss_s_drill_bit.png' { New-HssSBit }
Add-Output 'anchor_harpoon' 'items' 'item/anchor_harpoon.png' { New-AnchorHarpoon }
Add-Output 'station_truss_casing' 'casings' 'block/luv/station_truss_casing.png' { New-StationTrussCasing }
Add-Output 'radiation_vault_casing' 'casings' 'block/luv/radiation_vault_casing.png' { New-RadiationVaultCasing }
Add-Output 'whipple_shield_casing' 'casings' 'block/luv/whipple_shield_casing.png' { New-WhippleShieldCasing }
Add-Output 'asteroid_regolith_casing' 'casings' 'block/luv/asteroid_regolith_casing.png' { New-AsteroidRegolithCasing }
Add-Output 'sulfur_concrete_casing' 'casings' 'block/luv/sulfur_concrete_casing.png' { New-SulfurConcreteCasing }
Add-Output 'magnetic_bearing' 'casings' 'block/luv/magnetic_bearing.png' { New-MagneticBearing }
Add-Output 'coilgun_coil_casing' 'casings' 'block/luv/coilgun_coil_casing.png' { New-CoilgunCoilCasing }
Add-Output 'sapphire_test_mass' 'casings' 'block/luv/sapphire_test_mass.png' { New-SapphireTestMass }
Add-Output 'orbital_solar_cells' 'panel' 'block/luv/orbital_solar_cells.png' { New-OrbitalSolarCells }
Add-Output 'orbital_solar_frame' 'panel' 'block/luv/orbital_solar_frame.png' { New-OrbitalSolarFrame }

$Known = @($Outputs.Keys) + @('items', 'seeds', 'casings', 'panel')
foreach ($id in $Only) { if ($Known -notcontains $id) { throw "Unknown -Only value '$id' (expected an output name or one of: items, seeds, casings, panel)" } }
foreach ($name in $Outputs.Keys) {
    $o = $Outputs[$name]
    if ($Only.Count -gt 0 -and $Only -notcontains $name -and $Only -notcontains $o.Group) { continue }
    Out-Tex (& $o.Build $o.Arg) $o.Rel $o.FrameTime
}

# ============================================================================================
#  VERIFY what was written: 16 px wide, 16 tall (seeds: 8 frames), binary alpha, no pure black, block textures fully opaque, item
#  icons with a transparent background in every frame; the families (seeds, bits, orbs, charts, tapes), the frame's edge rows and
#  the panel model
# ============================================================================================
function Get-AlphaMask {
    param($Img, [int]$Frame = 0)
    $m = New-Object System.Text.StringBuilder
    for ($i = $Frame * 256; $i -lt ($Frame + 1) * 256; $i++) { [void]$m.Append($(if ((($Img.P[$i] -shr 24) -band 255) -ne 0) { '1' } else { '0' })) }
    return $m.ToString()
}
function Get-FrameKey { param($Img, [int]$Frame) return (($Img.P[($Frame * 256)..($Frame * 256 + 255)]) -join ',') }
function Read-Rel { param([string]$Rel) $p = Join-Path $OutRoot ($Rel -replace '/', '\'); if (Test-Path -LiteralPath $p) { return (Read-Png $p) } return $null }

$problems = 0
function Add-Problem { param([string]$Rel, [string]$Msg) $script:problems++; Write-Warning "$Rel : $Msg" }

$seedRels = @($SeedPlaces.Keys | ForEach-Object { "item/$_.png" })
foreach ($rel in $written) {
    if ($rel.EndsWith('.mcmeta')) { continue }
    $img = Read-Rel $rel
    $isSeed = $seedRels -contains $rel
    $wantH = if ($isSeed) { 128 } else { 16 }
    if ($img.W -ne 16 -or $img.H -ne $wantH) { Add-Problem $rel "bad size $($img.W)x$($img.H) (expected 16x$wantH)"; continue }
    $black = 0; $partial = 0
    foreach ($px in $img.P) {
        $alpha = ($px -shr 24) -band 255
        if ($alpha -ne 0 -and $alpha -ne 255) { $partial++; continue }
        if ($alpha -eq 255 -and ($px -band 0xFFFFFF) -eq 0) { $black++ }
    }
    if ($partial -gt 0) { Add-Problem $rel "$partial partially transparent px" }
    if ($black -gt 0) { Add-Problem $rel "$black pure-black px" }
    for ($f = 0; $f -lt ($img.H / 16); $f++) {
        $opaque = ((Get-AlphaMask $img $f).ToCharArray() | Where-Object { $_ -eq '1' }).Count
        if ($rel -like 'block/*') { if ($opaque -ne 256) { Add-Problem $rel "block texture is not fully opaque ($opaque of 256 px)" } }
        elseif ($opaque -eq 0) { Add-Problem $rel "frame $f is fully transparent" }
        elseif ($opaque -eq 256) { Add-Problem $rel "frame $f is fully opaque (no transparent background)" }
    }
    if ($isSeed) {
        $mcmeta = Join-Path $OutRoot (($rel + '.mcmeta') -replace '/', '\')
        $want = "{`n  `"animation`": {`n    `"frametime`": 3`n  }`n}`n"
        if (-not (Test-Path -LiteralPath $mcmeta) -or [System.IO.File]::ReadAllText($mcmeta) -cne $want) { Add-Problem $rel 'missing or unexpected .mcmeta (frametime 3)' }
        $keys = @{}; for ($f = 0; $f -lt 8; $f++) { $keys[(Get-FrameKey $img $f)] = 1 }
        if ($keys.Count -lt 3) { Add-Problem $rel "only $($keys.Count) distinct frames out of 8" }
        $venus = Read-Rel 'item/venusian_quantum_seed.png'
        if ($null -ne $venus -and (Get-AlphaMask $img 0) -ne (Get-AlphaMask $venus 0)) { Add-Problem $rel 'frame 0 leaves the Venusian seed silhouette' }
        $others = @('lunar', 'martian', 'venusian', 'hermean') | ForEach-Object { "item/${_}_quantum_seed.png" }
        $others += @($seedRels | Where-Object { $_ -ne $rel })
        foreach ($o in $others) {
            $oi = Read-Rel $o
            if ($null -eq $oi) { continue }
            $ok = @{}; for ($f = 0; $f -lt ($oi.H / 16); $f++) { $ok[(Get-FrameKey $oi $f)] = 1 }
            foreach ($k in $keys.Keys) { if ($ok.ContainsKey($k)) { Add-Problem $rel "shares a frame with $o"; break } }
        }
    }
}

# the families: one silhouette with the elder, a different picture
$Families = @(
    @{ Rel = 'item/hss_s_drill_bit.png'; Elders = @('item/tungsten_steel_drill_bit.png') },
    @{ Rel = 'item/saturn_transfer_chart.png'; Elders = @('item/mars_chart.png', 'item/inner_planets_chart.png') },
    @{ Rel = 'item/jovian_atmosphere_survey.png'; Elders = @('item/lunar_vlbi_recording.png', 'item/outer_system_chart.png', 'item/sagittarius_a_star_signal.png') },
    @{ Rel = 'item/gravitational_wave_catalogue.png'; Elders = @('item/lunar_vlbi_recording.png', 'item/outer_system_chart.png', 'item/sagittarius_a_star_signal.png', 'item/jovian_atmosphere_survey.png') },
    @{ Rel = 'item/itbtc_coated_conductor.png'; Elders = @('item/nickel_tungsten_tape.png') }
)
foreach ($fam in $Families) {
    if ($written -notcontains $fam.Rel) { continue }
    $img = Read-Rel $fam.Rel
    foreach ($e in $fam.Elders) {
        $ei = Read-Rel $e
        if ($null -eq $ei) { continue }
        if ((Get-AlphaMask $img) -ne (Get-AlphaMask $ei)) { Add-Problem $fam.Rel "silhouette differs from $e" }
        if (($img.P -join ',') -eq ($ei.P -join ',')) { Add-Problem $fam.Rel "identical to $e" }
    }
}
# the frame's edge band: rows 6, 7, 8 lit > mid > dark (the panel's sides)
if ($written -contains 'block/luv/orbital_solar_frame.png') {
    $fr = Read-Rel 'block/luv/orbital_solar_frame.png'
    $lum = @(6, 7, 8 | ForEach-Object { $row = $_; ((1..14 | ForEach-Object { Get-Lum $fr.P[$row * 16 + $_] }) | Measure-Object -Average).Average })
    if (-not ($lum[0] -gt $lum[1] -and $lum[1] -gt $lum[2])) { Add-Problem 'block/luv/orbital_solar_frame.png' 'rows 6..8 are not lit > mid > dark' }
}
# the panel model (only next to the default textures root)
if ($OutRoot -eq $DefaultOutRoot) {
    $model = Join-Path $RepoRoot 'pack\kubejs\assets\grindless\models\block\luv\orbital_solar_panel.json'
    if (-not (Test-Path -LiteralPath $model)) { Add-Problem 'models/block/luv/orbital_solar_panel.json' 'missing' }
    else {
        $json = [System.IO.File]::ReadAllText($model)
        foreach ($t in @('"cells": "grindless:block/luv/orbital_solar_cells"', '"frame": "grindless:block/luv/orbital_solar_frame"', '"particle": "grindless:block/luv/orbital_solar_frame"')) {
            if (-not $json.Contains($t)) { Add-Problem 'models/block/luv/orbital_solar_panel.json' "does not contain $t" }
        }
    }
}

Write-Host "written $($written.Count) files under $OutRoot ($problems problems)"
foreach ($rel in $written) { Write-Host "  $rel" }

# ============================================================================================
#  PREVIEW (optional, never shipped)
# ============================================================================================
if ($Preview) {
    function Get-Tex {
        param([string]$Rel, [int]$Frame = 0)
        $t = Read-Rel $Rel
        if ($null -eq $t) { Write-Warning "preview: $Rel not found, left out"; return $null }
        if ($t.H -gt 16) { $f = New-Canvas; [Array]::Copy($t.P, $Frame * 256, $f.P, 0, 256); return $f }
        return $t
    }
    $bg = Hex '1E2126'
    $slot = Hex '8B8B8B'
    $sheet = New-Canvas 312 204
    for ($i = 0; $i -lt $sheet.P.Length; $i++) { $sheet.P[$i] = $bg }
    function Add-Tile {
        param($Tex, [int]$X0, [int]$Y0, [int]$Back = 0)
        if ($Back -ne 0) { Set-Rect $sheet $X0 $Y0 16 16 $Back }
        if ($null -ne $Tex) { Merge-Canvas $sheet $Tex $X0 $Y0 }
    }
    function Add-Wall {
        param($Tex, [int]$X0, [int]$Y0)
        if ($null -eq $Tex) { return }
        for ($j = 0; $j -lt 3; $j++) { for ($i = 0; $i -lt 3; $i++) { Add-Tile $Tex ($X0 + 16 * $i) ($Y0 + 16 * $j) } }
    }
    function Add-PanelMock {
        param($Top, $Frame, [int]$X0, [int]$Y0)
        if ($null -eq $Top -or $null -eq $Frame) { return }
        Add-Tile $Top $X0 $Y0
        for ($j = 0; $j -lt 3; $j++) { for ($i = 0; $i -lt 16; $i++) { Set-Px $sheet ($X0 + $i) ($Y0 + 16 + $j) $Frame.P[(6 + $j) * 16 + $i] } }
    }

    # rows 1-2: every item (seeds at frame 0)
    $itemRels = @($Outputs.Keys | Where-Object { $Outputs[$_].Rel -like 'item/*' } | ForEach-Object { $Outputs[$_].Rel })
    for ($i = 0; $i -lt $itemRels.Count; $i++) {
        $row = [int][Math]::Floor($i / 15); $col = $i % 15
        Add-Tile (Get-Tex $itemRels[$i]) (2 + 17 * $col) (2 + 19 * $row) $slot
    }
    # rows 3-4: the 8 frames of each new seed, two seeds a row, then the Venusian and Hermean seeds
    $seedNames = @($SeedPlaces.Keys)
    for ($s = 0; $s -lt $seedNames.Count; $s++) {
        $y0 = 40 + 19 * [int][Math]::Floor($s / 2); $x0 = 2 + 140 * ($s % 2)
        for ($f = 0; $f -lt 8; $f++) { Add-Tile (Get-Tex "item/$($seedNames[$s]).png" $f) ($x0 + 17 * $f) $y0 $slot }
    }
    Add-Tile (Get-Tex 'item/venusian_quantum_seed.png') 285 40 $slot
    Add-Tile (Get-Tex 'item/hermean_quantum_seed.png') 285 59 $slot
    # row 5: the families next to their elders
    $famRow = @('item/tungsten_steel_drill_bit.png', 'item/hss_s_drill_bit.png', '',
        'item/lunar_vlbi_recording.png', 'item/outer_system_chart.png', 'item/sagittarius_a_star_signal.png', 'item/jovian_atmosphere_survey.png', 'item/gravitational_wave_catalogue.png', '',
        'item/mars_chart.png', 'item/inner_planets_chart.png', 'item/saturn_transfer_chart.png', '',
        'item/nickel_tungsten_tape.png', 'item/itbtc_coated_conductor.png', '',
        'item/chondritic_extract.png', 'item/neurotrophic_factor.png', 'item/europan_ocean_sample.png')
    $x = 2
    foreach ($rel in $famRow) { if ($rel -eq '') { $x += 6; continue }; Add-Tile (Get-Tex $rel) $x 78 $slot; $x += 17 }
    # rows 6-7: the casings tiled 3x3, the orbital cells 3x3, the panel mock and the IV thin-film panel's mock
    $walls = @($Outputs.Keys | Where-Object { $Outputs[$_].Group -eq 'casings' })
    for ($i = 0; $i -lt $walls.Count; $i++) {
        $row = [int][Math]::Floor($i / 5); $col = $i % 5
        Add-Wall (Get-Tex $Outputs[$walls[$i]].Rel) (2 + 52 * $col) (97 + 52 * $row)
    }
    $cells = Get-Tex 'block/luv/orbital_solar_cells.png'
    $frameTex = Get-Tex 'block/luv/orbital_solar_frame.png'
    Add-Wall $cells (2 + 52 * 3) 149
    Add-Tile $cells 262 97; Add-Tile $frameTex 284 97
    Add-PanelMock $cells $frameTex 262 120
    Add-PanelMock (Get-Tex 'block/iv/thin_film_cells.png') (Get-Tex 'block/iv/thin_film_frame.png') 284 120
    Add-Tile (Get-Tex 'block/hermean_heat_shield_brick.png') 262 149
    Add-Tile (Get-Tex 'block/sintered_regolith.png') 284 149

    # nearest-neighbour x6, plus a strip of the items at x2 (the usual GUI scale) under the sheet
    $k = 6
    $strip = 48
    $big = New-Canvas ($sheet.W * $k) ($sheet.H * $k + $strip)
    $row = New-Object 'int[]' ($big.W)
    for ($i = 0; $i -lt $row.Length; $i++) { $row[$i] = $bg }
    for ($j = $sheet.H * $k; $j -lt $big.H; $j++) { [Array]::Copy($row, 0, $big.P, $j * $big.W, $big.W) }
    for ($y = 0; $y -lt $sheet.H; $y++) {
        for ($x = 0; $x -lt $sheet.W; $x++) { $v = $sheet.P[$y * $sheet.W + $x]; for ($i = 0; $i -lt $k; $i++) { $row[$x * $k + $i] = $v } }
        for ($j = 0; $j -lt $k; $j++) { [Array]::Copy($row, 0, $big.P, ($y * $k + $j) * $big.W, $big.W) }
    }
    $x0 = 16; $y0 = $sheet.H * $k + 8
    foreach ($rel in $itemRels) {
        $tex = Get-Tex $rel
        Set-Rect $big $x0 $y0 32 32 $slot
        if ($null -ne $tex) {
            for ($ty = 0; $ty -lt 16; $ty++) { for ($tx = 0; $tx -lt 16; $tx++) {
                $v = $tex.P[$ty * 16 + $tx]
                if ((($v -shr 24) -band 255) -ne 0) { Set-Rect $big ($x0 + 2 * $tx) ($y0 + 2 * $ty) 2 2 $v }
            } }
        }
        $x0 += 40
    }
    $dir = Split-Path -Parent $Preview
    if ($dir -and -not (Test-Path -LiteralPath $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
    $bmp = ConvertTo-Bitmap $big
    try { $bmp.Save($Preview, [System.Drawing.Imaging.ImageFormat]::Png) } finally { $bmp.Dispose() }
    Write-Host "preview: $Preview (items | seed frames | families | casings 3x3, orbital cells, panel mocks | items at x2)"
}

if ($problems -gt 0) { throw "$problems problem(s) in the texture checks (see the warnings above)" }

if ($Credits) {
    Write-Host ''
    foreach ($rel in $written) {
        Write-Host ("| ``pack/kubejs/assets/grindless/textures/$rel`` | Generated with tools/assets/$ScriptName (procedural pixel art, original) by the assets agent (LuV-A1), 2026-10-26 | the pack's licence (pending; proposed CC BY-SA 4.0) |")
    }
}
