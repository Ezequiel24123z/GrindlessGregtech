<#
.SYNOPSIS
  Procedural 16x16 pixel art for the foundations of the IV era of Gregtech Grindless (package IV-A1): the fuel cycle items, the
  PuBe neutron source, the RTG pellet, the ion exchange resin, the platinum gauze, the inner planets chart, the Venus and Mercury
  vein samples, Mercury's heat shield bricks and the thin-film panel (GregTech style: top-left light, 3-5 tones per material,
  selective outlines).

.DESCRIPTION
  Every pixel is drawn by this script (palettes + char maps + small shading routines); nothing is copied or edited from GregTech
  Modern, GCYR or any other mod. Output is deterministic: re-running overwrites the same bytes (mottles come from Get-Noise, a hash
  of the position, not from a random generator). The helpers of the other generators are copied here so those scripts stay
  untouched; the inner planets chart reuses the Mars chart's data stick map (Build-EVFoundationTextures.ps1) and the vein samples
  reuse the Martian sample's capsule drawing (Build-MarsTravelTextures.ps1), recoloured.

  Writes (under pack/kubejs/assets/grindless/textures/):
    item/leu_pellet.png              grindless:leu_pellet: sintered UO2 fuel pellets, dark charcoal with a dull sheen: one standing on
                                     its end (its top face ringed by the lit chamfer) and one lying end-on in front of it (the chamfer
                                     ring and a shallow dish on its end face).
    item/zircaloy_cladding_tube.png  grindless:zircaloy_cladding_tube: a long, thin pilgered tube drawn diagonally, silver with a faint
                                     green-grey cast (zircaloy), the open upper end showing the bore.
    item/leu_fuel_assembly.png       the fuel assembly family: one map ($AssemblyMap) and one palette per assembly. A tall square bundle
    item/mox_fuel_assembly.png       of rods seen from the front and the right (oblique), a stainless top nozzle with its flow holes,
    item/breeder_fuel_assembly.png   two spacer grids and a bottom nozzle. The colour of the fuel shows between the rods and on the
    item/spent_fuel_assembly.png     top nozzle's band: green LEU, orange-red MOX, a purple plutonium core between two dark olive
    item/spent_breeder_assembly.png  uranium-238 blankets (breeder). Spent: the steel burnt dark bronze, the rods brown, Cherenkov blue
                                     between the rods and a blue glow edge (the spent breeder keeps its purple core).
    item/pube_neutron_source.png     grindless:pube_neutron_source: a small sealed stainless capsule, its cap welded on (a rippled
                                     bead) with a plug in the middle, and a yellow warning band with a dark trefoil hint.
    item/rtg_pellet.png              grindless:rtg_pellet: a Pu-238 oxide heater pellet glowing orange-red, white-hot on its top face,
                                     standing in a silvery iridium clad cup, with two heat shimmer pixels above it.
    item/ion_exchange_resin.png      grindless:ion_exchange_resin: a small heap of translucent amber beads (a highlight on the lit side,
                                     the light glowing through on the far side).
    item/platinum_gauze.png          grindless:platinum_gauze: a square of woven platinum-rhodium mesh (the holes see through), bright
                                     silver-white, its lower right corner folded back.
    item/inner_planets_chart.png     grindless:inner_planets_chart: the Mars chart's data stick (graphite, stainless cap, EV purple
                                     light) with Venus (pale yellow-cream) and Mercury (grey) printed on the label.
    item/venusian_vein_sample_frame.png, item/venusian_vein_sample_core.png
                                     the vein sample capsule of the Moon and Mars, in Venus tones (pale ochre with a yellow-brown basalt
                                     band); the core (greys only, tinted per vein) is a weathered crust over two lava flows.
    item/hermean_vein_sample_frame.png, item/hermean_vein_sample_core.png
                                     the same capsule in Mercury's dark greys with a charcoal band; the core is pale regolith over a dark
                                     graphite band, with bright specks.
    block/hermean_heat_shield_brick.png
                                     grindless:hermean_heat_shield_brick, the casing texture of the Mercury multiblocks: Mercury regolith
                                     sintered into pale ceramic tiles. Calm, light, fully opaque and seamless: a straight 2x2 grid of
                                     8 px square tiles with thin seams (not the sintered regolith's running bond), a soft bevel and a
                                     faint per-tile mottle.
    block/iv/thin_film_cells.png     top of grindless:hermean_thin_film_panel: gallium arsenide thin-film cells, indigo-black with a
                                     faint diagonal sheen, cut into strips by dark scribes and fine silver busbars; seamless.
    block/iv/thin_film_frame.png     its tungstensteel frame (edges and underside): dark blue-grey, brushed, with a lit edge; the
                                     panel's sides show its rows 6 to 8 (lit, mid, dark).

  Run from the repo root (PowerShell 5.1 blocks unsigned scripts by default; this bypass only affects that process):
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-IVFoundationTextures.ps1
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-IVFoundationTextures.ps1 -Only assemblies,samples
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-IVFoundationTextures.ps1 -Preview C:\path\iv-foundation.png -Credits

  Every pixel is fully opaque or fully transparent and none is pure black; the block textures have all 256 pixels opaque and the
  item icons have a transparent background. The final check fails the run (non-zero exit) if any written file breaks one of these
  rules, if a sample core is not grey or covers its frame, if the five assemblies stop sharing one silhouette or if the inner
  planets chart's silhouette drifts from the Mars chart's.

.PARAMETER Only
  Subset of: pellet, tube, assemblies, source, rtg, resin, gauze, chart, samples, brick, panel (comma-separated, also as one string
  with -File). Default: everything.
.PARAMETER OutRoot
  Textures root. Default: <repo>/pack/kubejs/assets/grindless/textures
.PARAMETER Preview
  Also write a review sheet (x8, nearest neighbour) to this PNG, which must be outside the repository (it is never shipped). Row 1,
  on inventory-slot grey: every item, the five assemblies side by side, and the Mars chart after the inner planets chart. Row 2: the
  vein samples (frame, core, and both layers with the core tinted by the vein colour, as the game draws them) next to the Martian
  and lunar ones. Row 3: the heat shield brick, tiled 3x3 and tiled 3x3 with the lunar drill's controller face on the middle block,
  then the sintered regolith 3x3 for comparison and the thin-film cells tiled 3x3. Row 4: the thin-film cells and frame, a mock of
  the panel (the top above its 3 px edge) and the EV Solar Wing Panel's cells and frame. Under the sheet, every item at x2 (the
  usual GUI scale). The neighbours are read from OutRoot and left out if they are missing.
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
$Known = @('pellet', 'tube', 'assemblies', 'source', 'rtg', 'resin', 'gauze', 'chart', 'samples', 'brick', 'panel')
foreach ($id in $Only) { if ($Known -notcontains $id) { throw "Unknown -Only value '$id' (expected: $($Known -join ', '))" } }

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
    param($Canvas, [string]$Rel)
    $path = Join-Path $OutRoot ($Rel -replace '/', '\')
    # an editor, indexer or virus scanner can hold a file for a moment: retry the write a few times
    for ($try = 1; $try -le 6; $try++) {
        try { Save-Png $Canvas $path; break }
        catch [System.IO.IOException] { if ($try -eq 6) { throw }; Start-Sleep -Milliseconds (250 * $try) }
    }
    $written.Add($Rel)
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

# Ramps shared with the EV set (Build-EVFoundationTextures.ps1): EV purple accents and clean stainless steel, lit -> dark.
$PurpleSpec = 'a=F3E4FF b=D6B0FF c=B07AF0 d=8A4CD0 e=5C2E9C f=381C64 g=1C0E36'
$StainSpec = '0=F7FAFF 1=DCE5F0 2=B8C6D8 3=8E9DB2 4=667690 5=465470 6=2C364C'

# ============================================================================================
#  LEU PELLET - sintered uranium dioxide: dark charcoal ceramic with a dull sheen
#  one pellet standing on its end at the back (the top face ringed by the chamfer catching the light, the ground side lit on the
#  left) and one lying end-on in front of it: its end face with the chamfer ring and a shallow dish, the round body going back up-right
# ============================================================================================
#   body: K dull sheen, L lit, M mid, N shade, O deepest     end faces: E lit chamfer, T face, U face in shade (and the dish)
$PelletPal = New-Pal @'
K=7E756C L=625A52 M=4B443E N=38322E O=29251F
E=978D81 T=746B61 U=5E564E
'@
$PelletMap = @(
    '................',
    '................',
    '..EETT..........',
    '.ETTTUN.........',
    '.LEEETO.........',
    '.LKKMNO...KKLM..',
    '.LKKMNO..LKKLMN.',
    '.LKKMNO.LKLLMNO.',
    '.LKKMNOEEETMMNO.',
    '.LKKMNETTTTUNNO.',
    '..LMNOETUTTUNO..',
    '......ETTEUNO...',
    '......TTTUUN....',
    '.......UUNN.....',
    '................',
    '................'
)
Assert-Map 'PelletMap' $PelletMap

function New-LeuPellet {
    $c = New-Canvas
    Write-Map $c 0 0 $PelletMap $PelletPal
    Add-Outline $c -LitArgb (Hex '4A433C') -ShadeArgb (Hex '1E1B18')
    return $c
}

# ============================================================================================
#  ZIRCALOY CLADDING TUBE - a long thin tube, lower left -> upper right, three pixels per row
#  zircaloy is silver with a faint green-grey cast (the material colours 0xB4B8A6 / 0x4C4F45); each row is the lit side, a sheen
#  streak and the shaded side; the upper end is open: the near lip, the dark bore and the far lip catching the light
# ============================================================================================
#   a sheen, b lit side, c mid, d shaded side     mouth: h bore, r far lip (lit), q far lip (shade)
#   the mouth is a small ring across the axis around one bore pixel: the near lip (the tube's own end) and the far lip beyond it
$TubePal = New-Pal 'a=E8EBE0 b=C3C7B6 c=A3A795 d=777B6B h=2E312A r=F0F2E8 q=B0B4A2'
$TubeMap = @(
    '................',
    '.............r..',
    '............bhq.',
    '...........bac..',
    '..........bad...',
    '.........bad....',
    '........bad.....',
    '.......bad......',
    '......bad.......',
    '.....bad........',
    '....bad.........',
    '...bad..........',
    '..bad...........',
    '..ad............',
    '................',
    '................'
)
Assert-Map 'TubeMap' $TubeMap

function New-CladdingTube {
    $c = New-Canvas
    Write-Map $c 0 0 $TubeMap $TubePal
    Add-Outline $c -LitArgb (Hex '545849') -ShadeArgb (Hex '2A2C25')
    return $c
}

# ============================================================================================
#  FUEL ASSEMBLIES - one map, five palettes (LEU, MOX, breeder, spent, spent breeder)
#  a tall square bundle in an oblique view: the front face (x3..10) and the right face (x11..12, each column one pixel higher),
#  the top nozzle's top face (y1..2) with three flow holes. Front, top to bottom: the top nozzle (a lit edge and the coloured band),
#  four rows of rods, the spacer grid, four rows of rods, the bottom nozzle with the gap between its legs. The rods are zircaloy
#  columns; what shows between them (C, E) is the fuel's colour. The two outer rod rows at each end use lower-case letters (a..e) so
#  the breeder can paint its uranium-238 blankets above and below the plutonium core; the other palettes map them to the core colours.
# ============================================================================================
#   steel (nozzles, grid): 0 spec .. 5 deepest, h hole     rods: A lit, B mid, D right face; C, E between the rods (front, right)
#   band: F lit, f mid, G right face     blankets: a b c d e (same roles as A B C D E)
$AssemblyMap = @(
    '................',
    '.....10011123...',
    '....1h1h1h23G...',
    '...10011122Ge...',
    '...FFFFFFffde...',
    '...acacbcbcdE...',
    '...acacbcbcDE...',
    '...ACACBCBCD4...',
    '...ACACBCBC3E...',
    '...11112223DE...',
    '...ACACBCBCDe...',
    '...ACACBCBCde...',
    '...acacbcbcd5...',
    '...acacbcbc4....',
    '...223hh334.....',
    '................'
)
Assert-Map 'AssemblyMap' $AssemblyMap

$AsmSteelFresh = '0=F4F7FB 1=D3DBE5 2=ADB7C5 3=808B9D 4=5B6577 5=414A5B h=394050'
$AsmSteelSpent = '0=A0947F 1=827765 2=675D4D 3=4F473B 4=3B352C 5=2B2721 h=241F1A'
$AsmRodsFresh = 'A=DDE1D3 B=B5B9A7 D=8B8F7F'
# Outline pairs (lit side, shade side): a dark steel line for fresh fuel, the Cherenkov glow edge for spent fuel.
$AsmOutlineFresh = @((Hex '4A5266'), (Hex '242936'))
$AsmOutlineSpent = @((Hex '5AA2EE'), (Hex '2A5AB4'))
$AssemblyVariants = [ordered]@{
    'leu_fuel_assembly'      = @{ Steel = $AsmSteelFresh; Core = "$AsmRodsFresh C=2E8C3C E=1D5C27"; Band = 'F=6FE06A f=45B54A G=2A7A34'; Blanket = ''; Outline = $AsmOutlineFresh }
    'mox_fuel_assembly'      = @{ Steel = $AsmSteelFresh; Core = "$AsmRodsFresh C=C2471E E=7A2A10"; Band = 'F=FF9A3C f=E8642A G=A33F18'; Blanket = ''; Outline = $AsmOutlineFresh }
    'breeder_fuel_assembly'  = @{ Steel = $AsmSteelFresh; Core = "$AsmRodsFresh C=7A3CC4 E=4A2282"; Band = 'F=C08AFF f=9A5CE0 G=5E2E9E'
                                  Blanket = 'a=8E8F70 b=707257 c=45473A d=5C5E4A e=36382C'; Outline = $AsmOutlineFresh }
    'spent_fuel_assembly'    = @{ Steel = $AsmSteelSpent; Core = 'A=857866 B=685D4E C=1F4FA6 D=4E463A E=163A7A'; Band = 'F=8E6A3C f=6E5230 G=4C3922'; Blanket = ''; Outline = $AsmOutlineSpent }
    'spent_breeder_assembly' = @{ Steel = $AsmSteelSpent; Core = 'A=7E6E86 B=625468 C=4A2878 D=4A4050 E=301A52'; Band = 'F=7E4CB4 f=603A8C G=40265E'
                                  Blanket = 'a=6E6A52 b=575440 c=1F4FA6 d=46432F e=163A7A'; Outline = $AsmOutlineSpent }
}

function New-FuelAssembly {
    param($Variant)
    # the blanket letters default to the core colours (every assembly but the breeders has one fuel zone)
    $blanket = $Variant.Blanket
    if (-not $blanket) {
        $blanket = (($Variant.Core -split '\s+') | Where-Object { $_ } | ForEach-Object { $_.Substring(0, 1).ToLowerInvariant() + $_.Substring(1) }) -join ' '
    }
    $pal = New-Pal ($Variant.Steel + ' ' + $Variant.Core + ' ' + $Variant.Band + ' ' + $blanket)
    $c = New-Canvas
    Write-Map $c 0 0 $AssemblyMap $pal
    Add-Outline $c -LitArgb $Variant.Outline[0] -ShadeArgb $Variant.Outline[1]
    return $c
}

# ============================================================================================
#  PuBe NEUTRON SOURCE - a small sealed stainless capsule with a yellow warning band
#  an upright short cylinder seen a little from above: the welded cap's top face with the plug in the middle, the cap's rounded
#  front edge, the weld bead (rippled), the body, a yellow band with dark diagonal hazard stripes ((x + y) mod 3) and the bottom
# ============================================================================================
#   stainless 0..6 ($StainSpec)     P / Q the welded plug (lit / shade)     band: p spec, q lit, r mid, s dark, t darkest     m stripe
$SourcePal = New-Pal ($StainSpec + ' ' + @'
P=FFFFFF Q=667690
p=FFF7B0 q=FFE23C r=E8B51E s=B5860E t=7A5A06 m=3A2A30
'@)
$SourceMap = @(
    '................',
    '................',
    '................',
    '................',
    '......1002......',
    '.....10PQ23.....',
    '.....200124.....',
    '.....312144.....',
    '.....211345.....',
    '.....qmprmt.....',
    '.....mppmst.....',
    '.....211345.....',
    '.....211345.....',
    '......3345......',
    '................',
    '................'
)
Assert-Map 'SourceMap' $SourceMap

function New-PuBeSource {
    $c = New-Canvas
    Write-Map $c 0 0 $SourceMap $SourcePal
    Add-Outline $c -LitArgb (Hex '56627A') -ShadeArgb (Hex '262E40')
    return $c
}

# ============================================================================================
#  RTG PELLET - plutonium-238 oxide, glowing with its own heat, standing in an iridium clad cup
#  the pellet's top face is white-hot in the middle, its exposed side orange to dark red (lit on the left); the clad is a silvery
#  cup with a wider lip, a shadow under the lip and a rounded bottom. The outline takes the colour of what it borders (warm around
#  the glow, grey around the clad).
# ============================================================================================
#   glow: W white-hot, Y yellow, O orange, R red-orange, r red, k dark red     iridium clad: 0 spec, 1 lit, 2 mid, 3 dark, 4 darkest
$RtgPal = New-Pal @'
W=FFFBE2 Y=FFE27A O=FFA53A R=EE6420 r=C2401A k=862410
0=FCFDFF 1=DDE3EC 2=B5BECC 3=8A95A8 4=616C80
'@
$RtgMap = @(
    '................',
    '................',
    '.....OYYYYR.....',
    '....OYWWWYOR....',
    '....OYYYYOOr....',
    '....OOYYRrrk....',
    '....OOYYRrrk....',
    '....OOYYRrrk....',
    '...1100223344...',
    '....33223444....',
    '....11002334....',
    '....11002334....',
    '....11002334....',
    '.....223344.....',
    '................',
    '................'
)
Assert-Map 'RtgMap' $RtgMap

function New-RtgPellet {
    $c = New-Canvas
    Write-Map $c 0 0 $RtgMap $RtgPal
    Add-Outline $c
    return $c
}

# ============================================================================================
#  ION EXCHANGE RESIN - a small heap of translucent amber beads (sulfonated polystyrene)
#  4x4 beads with cut corners, drawn back to front so the front ones sit on the others: a highlight on the lit side, the rich amber
#  body, a golden glow on the far side where the light comes through, and a dark rim.
# ============================================================================================
#   h highlight, l amber, g glow (light through the bead), m rim (lit side), d rim (far side)
$ResinPal = New-Pal 'h=FFF6D6 l=F2A93A g=FFD268 m=D08A28 d=96540E'
$BeadMap = @(
    '.mm.',
    'mhld',
    'mlgd',
    '.dd.'
)
Assert-Map 'BeadMap' $BeadMap 4 4
# top-left corners of the beads, back (top) to front (bottom): a mound a little higher on the right
$ResinBeads = @(@(6, 3), @(3, 6), @(9, 5), @(1, 9), @(6, 8), @(11, 8), @(4, 11), @(8, 11))

function New-IonExchangeResin {
    $c = New-Canvas
    foreach ($b in $ResinBeads) { Write-Map $c $b[0] $b[1] $BeadMap $ResinPal }
    Add-Outline $c -LitArgb (Hex '9A5E14') -ShadeArgb (Hex '4E2C06')
    return $c
}

# ============================================================================================
#  PLATINUM GAUZE - a square of woven platinum-rhodium wire, its lower right corner folded back
#  an 11x11 sheet (u, v 0..10 from x2, y2): wires on the even rows and columns, holes (transparent: the gauze is see-through) where
#  both are odd. At each crossing the wire on top alternates (over: spec, under: mid), the horizontal runs are lighter than the
#  vertical ones, and the far half of the sheet is one tone darker. The corner beyond the crease u + v = $GauzeFold is folded over:
#  the flap is its mirror image across the crease, plain metal (the back of the weave), lit along the bright crease line.
# ============================================================================================
$GauzePal = New-Pal '0=FAFBFD 1=E8ECF1 2=D3D9E2 3=B7BFCC 4=97A0B0'
$GauzeFold = 17

function New-PlatinumGauze {
    $c = New-Canvas
    $P = $GauzePal
    $marker = Hex 'FF00FF'
    for ($v = 0; $v -le 10; $v++) { for ($u = 0; $u -le 10; $u++) {
        if ($u + $v -gt $GauzeFold) { continue }
        $x = 2 + $u; $y = 2 + $v
        # holes are shielded from the outline pass with a marker, then cleared
        if (($u % 2) -eq 1 -and ($v % 2) -eq 1) { Set-Px $c $x $y $marker; continue }
        if (($u % 2) -eq 0 -and ($v % 2) -eq 0) { $t = if (((($u + $v) / 2) % 2) -eq 0) { 0 } else { 2 } }
        elseif (($v % 2) -eq 0) { $t = 1 }
        else { $t = 2 }
        if (($u + $v) -gt 10) { $t++ }
        Set-Px $c $x $y $P[[string]$t]
    } }
    Add-Outline $c -LitArgb (Hex '7A8494') -ShadeArgb (Hex '465062')
    for ($i = 0; $i -lt $c.P.Length; $i++) { if ($c.P[$i] -eq $marker) { $c.P[$i] = 0 } }
    # the fold: the bright crease, then the flap (the mirror of the cut corner), darker towards its tip
    for ($v = 0; $v -le 10; $v++) { for ($u = 0; $u -le 10; $u++) {
        if ($u + $v -eq $GauzeFold) { Set-Px $c (2 + $u) (2 + $v) $P['0'] }
        elseif ($u + $v -gt $GauzeFold) {
            $fu = $GauzeFold - $v; $fv = $GauzeFold - $u
            $d = $GauzeFold - ($fu + $fv)
            Set-Px $c (2 + $fu) (2 + $fv) $P[[string](Get-ClampInt $d 1 4)]
        }
    } }
    return $c
}

# ============================================================================================
#  INNER PLANETS CHART - the Mars chart's data stick with Venus and Mercury on its label
#  the stick map and the graphite, stainless and EV purple colours are the Mars chart's (Build-EVFoundationTextures.ps1, $StickMap,
#  $ChartPal): only the label changes. Venus is a pale yellow-cream disc (2x2, an ochre shade so it holds on the pale label) at the
#  upper end of the label, Mercury a small grey mark at the lower end.
# ============================================================================================
#   graphite: K gloss, L lit edge, M face, N shaded edge, O deepest     label: u lit edge, v paper, w shaded edge
#   Venus: V lit, W mid, X shade     Mercury: m lit, n shade     0..6 stainless (cap)     c EV purple (status light)
$ChartPal = New-Pal ($PurpleSpec + ' ' + $StainSpec + ' ' + @'
K=6E7688 L=5A6170 M=454B58 N=333844 O=252932
u=F4F0E2 v=E6E0CC w=C4BDA6
V=FFF4CA W=E8C878 X=B08A40
m=9C9C98 n=62625E
'@)
$ChartMap = @(
    '................',
    '................',
    '............135.',
    '...........024..',
    '..........1235..',
    '.........LMcN...',
    '........LMMN....',
    '.......uVWw.....',
    '......uvWX......',
    '.....umvw.......',
    '....uvnw........',
    '...LMMN.........',
    '..LMMN..........',
    '..MNO...........',
    '................',
    '................'
)
Assert-Map 'ChartMap' $ChartMap

function New-InnerPlanetsChart {
    $c = New-Canvas
    Write-Map $c 0 0 $ChartMap $ChartPal
    Add-Outline $c -LitArgb (Hex '2A2E38') -ShadeArgb (Hex '16181E')
    return $c
}

# ============================================================================================
#  VEIN SAMPLES - Venus and Mercury, the siblings of the lunar and Martian samples
#  New-SampleFrame is New-MartianSampleFrame (Build-MarsTravelTextures.ps1) with its two ramps as parameters: the valve knob, the
#  cap, the seal band, the side rails around the window (x5..10, y5..11), the foot ring and the rounded bottom; the window stays
#  transparent (layer 0), with a glass highlight down its left wall. The core (layer 1) is greys only, tinted per vein by the game,
#  and only paints inside the window (x6..10, y6..11).
#   Venus: pale ochre capsule, yellow-brown basalt valve, band and foot ring (Venus rock under its yellow sky).
#   Mercury: dark grey capsule, charcoal valve, band and foot ring (Mercury's dark, graphite-rich rock).
# ============================================================================================
$VenusCapsule = @{
    Body = @((Hex 'F8F0DA'), (Hex 'EADBB2'), (Hex 'D4BF8C'), (Hex 'A98F60'), (Hex '74613E'))
    Seal = @((Hex 'CFA766'), (Hex 'A88040'), (Hex '805E2C'), (Hex '5A4120'), (Hex '3A2A14'))
    GlassW = (Hex 'FFFBEC'); GlassL = (Hex 'F2E6CA')
}
$MercuryCapsule = @{
    Body = @((Hex 'C9C5BF'), (Hex 'A39F99'), (Hex '86827C'), (Hex '5E5A55'), (Hex '403D39'))
    Seal = @((Hex '8E8A85'), (Hex '67635E'), (Hex '4C4945'), (Hex '363431'), (Hex '262422'))
    GlassW = (Hex 'F7F7F5'); GlassL = (Hex 'DDDBD7')
}

function New-SampleFrame {
    param($Capsule)
    $c = New-Canvas
    $st = $Capsule.Body; $seal = $Capsule.Seal
    # valve knob, cap and the seal band under it
    foreach ($x in 7..8) { Set-Px $c $x 1 $seal[(Get-SpanTone $x 7 8)] }
    foreach ($x in 5..10) { Set-Px $c $x 2 $st[(Get-SpanTone $x 5 10)] }
    foreach ($x in 4..11) { Set-Px $c $x 3 $st[(Get-SpanTone $x 4 11)] }
    foreach ($x in 4..11) { Set-Px $c $x 4 $seal[(Get-SpanTone $x 4 11)] }
    # side rails around the window, the foot ring and the rounded bottom cap
    foreach ($y in 5..11) { Set-Px $c 4 $y $st[1]; Set-Px $c 11 $y $st[3] }
    foreach ($x in 4..11) { Set-Px $c $x 12 $seal[(Get-ClampInt ((Get-SpanTone $x 4 11) + 1) 0 4)] }
    foreach ($x in 5..10) { Set-Px $c $x 13 $st[(Get-ClampInt ((Get-SpanTone $x 5 10) + 1) 0 4)] }
    foreach ($x in 6..9) { Set-Px $c $x 14 $st[(Get-ClampInt ((Get-SpanTone $x 6 9) + 2) 0 4)] }
    # the window is shielded from the outline pass with a marker, then cleared
    $marker = Hex 'FF00FF'
    foreach ($y in 5..11) { foreach ($x in 5..10) { Set-Px $c $x $y $marker } }
    Add-Outline $c
    foreach ($y in 5..11) { foreach ($x in 5..10) { Set-Px $c $x $y 0 } }
    # glass highlight down the left inner wall (the core never covers x5)
    Set-Px $c 5 5 $Capsule.GlassL
    foreach ($y in 6..10) { Set-Px $c 5 $y $Capsule.GlassW }
    Set-Px $c 5 11 $Capsule.GlassL
    return $c
}

# Core footprint inside the window: x6..10, y6..11, lit from the left. The greys are the lunar and Martian cores' ($CorePal).
#   Venus: a bright weathered crust, a first lava flow, the dark seam between two flows, the second flow.
#   Mercury: pale regolith, a dark graphite-rich band, then grey rock with bright specks (the iridosmine).
$CorePal = New-Palette 'A=F2F2F2 B=D6D6D6 C=B4B4B4 D=8C8C8C E=666666 F=424242'
$VenusCoreRows = @(
    'AAAAB',
    'ABBBC',
    'BCCCD',
    'ABBCC',
    'DDEED',
    'BBCCD'
)
Assert-Map 'VenusCoreRows' $VenusCoreRows 5 6
$MercuryCoreRows = @(
    'ABBBC',
    'EEEFE',
    'BCBCD',
    'ABACC',
    'BCCAD',
    'CDDDE'
)
Assert-Map 'MercuryCoreRows' $MercuryCoreRows 5 6

function New-SampleCore {
    param([string[]]$Rows)
    $c = New-Canvas
    Write-Map $c 6 6 $Rows $CorePal
    return $c
}

# ============================================================================================
#  HERMEAN HEAT SHIELD BRICKS - block texture, fully opaque, seamless in both directions
#  Mercury regolith sintered under concentrated sunlight into pale ceramic tiles: a straight 2x2 grid of 8 px square tiles (no
#  running bond, unlike the sintered regolith), each owning its last row and column as a thin seam, so the next tile continues the
#  grid. A soft bevel (lit top and left, shaded bottom and right) and a calm mottle of three close pale tones, a little lighter towards
#  the lit corner, shifted per tile, with a rare sinter pore. It is the casing texture of the Mercury multiblocks: low contrast.
# ============================================================================================
#   a lit edge   b light mottle   c mid mottle   d dark mottle   e shaded edge   f seam   g sinter pore
$BrickPal = New-Pal 'a=EEE9DF b=E1DACD c=DAD3C5 d=D2CABB e=C0B7A7 f=A89F90 g=C9C0B0'
$BrickMottle = @(80, 200)    # noise thresholds b | c | d
$BrickGradient = 3           # per step of u + v: lighter towards the tile's lit corner
$BrickBiasAmp = 16           # per tile, a hash shifts the whole mottle by up to this much
$BrickPore = 248             # noise above this: a sinter pore (a slightly darker speck)

function New-HeatShieldBrick {
    $c = New-Canvas
    $P = $BrickPal
    for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
        $u = $x % 8; $v = $y % 8
        $tile = [int][Math]::Floor($x / 8) + 2 * [int][Math]::Floor($y / 8)
        if ($u -eq 7 -or $v -eq 7) { $ch = 'f' }
        elseif (($u -eq 6 -and $v -eq 0) -or ($u -eq 0 -and $v -eq 6)) { $ch = 'c' }
        elseif ($u -eq 0 -or $v -eq 0) { $ch = 'a' }
        elseif ($u -eq 6 -or $v -eq 6) { $ch = 'e' }
        else {
            $bias = [int](((Get-Noise $tile 5 0 97) - 128) * $BrickBiasAmp / 128)
            $n = (Get-Noise $x $y 0 (41 + 5 * $tile)) + $BrickGradient * ($u + $v - 6) + $bias
            $ch = if ($n -lt $BrickMottle[0]) { 'b' } elseif ($n -lt $BrickMottle[1]) { 'c' } else { 'd' }
            if ((Get-Noise $x $y 0 (131 + $tile)) -gt $BrickPore) { $ch = 'g' }
        }
        Set-Px $c $x $y $P[$ch]
    } }
    return $c
}

# ============================================================================================
#  THIN-FILM PANEL - grindless:hermean_thin_film_panel (models/block/iv/hermean_thin_film_panel.json: a 3 px slab, y 6..9)
#  cells (top): gallium arsenide thin film, indigo-black. Strips 3 px tall, parted alternately by a dark laser scribe (rows 3, 11) and
#  a fine silver busbar (rows 7, 15, one glint at x = $FilmGlint); a faint diagonal sheen ((x + y) mod 16, so it tiles) and a few specks.
#  frame (sides and underside): tungstensteel, brushed along x, lit top/left rim, dark bottom/right rim; rows 6..8 are what the
#  panel's sides show: a lit edge line, the mid tone and a dark line.
# ============================================================================================
#   cells: k scribe / speck, l cell, m sheen, n sheen core, s busbar glint, t busbar
$FilmPal = New-Pal 'k=130E1F l=1B1430 m=241B3D n=30264E s=B9BECB t=767B8F'
$FilmGlint = 5               # the column of the busbars' one brighter pixel
#   tungstensteel (GTM's colour is 0x6464A0; the frame sits a little darker): 0 edge highlight, 1 lit, 2 mid, 3 dark, 4 darker, 5 deepest
$FramePal = New-Pal '0=9090B8 1=6C6C98 2=585884 3=484870 4=383858 5=2A2A42'

function New-ThinFilmCells {
    $c = New-Canvas
    $P = $FilmPal
    for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
        $r = $y % 8
        if ($r -eq 7) { $ch = if (($x % 16) -eq $FilmGlint) { 's' } else { 't' } }
        elseif ($r -eq 3) { $ch = 'k' }
        else {
            $d = ($x + $y) % 16
            $ch = 'l'
            if ($d -ge 4 -and $d -le 6) { $ch = 'm' }
            if ($d -eq 5 -and ($r -eq 1 -or $r -eq 5)) { $ch = 'n' }
            $nz = Get-Noise $x $y 0 53
            if ($nz -gt 240) { $ch = 'k' } elseif ($nz -lt 8 -and $ch -eq 'l') { $ch = 'm' }
        }
        Set-Px $c $x $y $P[$ch]
    } }
    return $c
}

function New-ThinFilmFrame {
    $c = New-Canvas
    $P = $FramePal
    for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
        # brushed: the grain runs along x, a tone per 4 px run with a little noise
        $n = Get-Noise ([int][Math]::Floor($x / 4)) $y 0 67
        $tone = if ($n -lt 70) { 1 } elseif ($n -lt 200) { 2 } else { 3 }
        # the edge band the panel's sides show (rows 6..8)
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
if (Test-Want 'pellet') { Out-Tex (New-LeuPellet) 'item/leu_pellet.png' }
if (Test-Want 'tube') { Out-Tex (New-CladdingTube) 'item/zircaloy_cladding_tube.png' }
if (Test-Want 'assemblies') {
    foreach ($name in $AssemblyVariants.Keys) { Out-Tex (New-FuelAssembly $AssemblyVariants[$name]) "item/$name.png" }
}
if (Test-Want 'source') { Out-Tex (New-PuBeSource) 'item/pube_neutron_source.png' }
if (Test-Want 'rtg') { Out-Tex (New-RtgPellet) 'item/rtg_pellet.png' }
if (Test-Want 'resin') { Out-Tex (New-IonExchangeResin) 'item/ion_exchange_resin.png' }
if (Test-Want 'gauze') { Out-Tex (New-PlatinumGauze) 'item/platinum_gauze.png' }
if (Test-Want 'chart') { Out-Tex (New-InnerPlanetsChart) 'item/inner_planets_chart.png' }
if (Test-Want 'samples') {
    Out-Tex (New-SampleFrame $VenusCapsule) 'item/venusian_vein_sample_frame.png'
    Out-Tex (New-SampleCore $VenusCoreRows) 'item/venusian_vein_sample_core.png'
    Out-Tex (New-SampleFrame $MercuryCapsule) 'item/hermean_vein_sample_frame.png'
    Out-Tex (New-SampleCore $MercuryCoreRows) 'item/hermean_vein_sample_core.png'
}
if (Test-Want 'brick') { Out-Tex (New-HeatShieldBrick) 'block/hermean_heat_shield_brick.png' }
if (Test-Want 'panel') {
    Out-Tex (New-ThinFilmCells) 'block/iv/thin_film_cells.png'
    Out-Tex (New-ThinFilmFrame) 'block/iv/thin_film_frame.png'
}

# ============================================================================================
#  VERIFY what was written: 16x16, binary alpha, no pure black, block textures fully opaque, item icons with a transparent
#  background; grey sample cores that only paint inside their frame's window; one silhouette for the five assemblies (and five
#  different pictures); the inner planets chart on the Mars chart's silhouette
# ============================================================================================
function Get-AlphaMask {
    param($Img)
    return (($Img.P | ForEach-Object { if ((($_ -shr 24) -band 255) -ne 0) { '1' } else { '0' } }) -join '')
}

$problems = 0
foreach ($rel in $written) {
    $path = Join-Path $OutRoot ($rel -replace '/', '\')
    $img = Read-Png $path
    $msgs = @()
    if ($img.W -ne 16 -or $img.H -ne 16) { $msgs += "bad size $($img.W)x$($img.H) (expected 16x16)" }
    $opaque = 0; $black = 0; $partial = 0; $gray = $true
    foreach ($px in $img.P) {
        $alpha = ($px -shr 24) -band 255
        if ($alpha -ne 0 -and $alpha -ne 255) { $partial++; continue }
        if ($alpha -eq 255) {
            $opaque++
            $q = Get-Rgba $px
            if ($q[0] -eq 0 -and $q[1] -eq 0 -and $q[2] -eq 0) { $black++ }
            if ($q[0] -ne $q[1] -or $q[1] -ne $q[2]) { $gray = $false }
        }
    }
    if ($partial -gt 0) { $msgs += "$partial partially transparent px" }
    if ($black -gt 0) { $msgs += "$black pure-black px" }
    if ($rel -like 'block/*') {
        if ($opaque -ne $img.P.Length) { $msgs += "block texture is not fully opaque ($opaque of $($img.P.Length) px)" }
    } else {
        if ($opaque -eq 0) { $msgs += 'fully transparent' }
        elseif ($opaque -eq $img.P.Length) { $msgs += 'item icon is fully opaque (no transparent background)' }
    }
    if ($rel -like '*_sample_core.png') {
        if (-not $gray) { $msgs += 'core is not grayscale' }
        $framePath = Join-Path $OutRoot (($rel -replace '_core\.png$', '_frame.png') -replace '/', '\')
        if (-not (Test-Path -LiteralPath $framePath)) { $msgs += 'its frame is missing' }
        else {
            $frame = Read-Png $framePath
            for ($i = 0; $i -lt 256; $i++) {
                if ((($img.P[$i] -shr 24) -band 255) -ne 0 -and (($frame.P[$i] -shr 24) -band 255) -ne 0) {
                    $msgs += "core covers a frame pixel ($($i % 16),$([int][Math]::Floor($i / 16)))"; break
                }
            }
        }
        foreach ($other in 'lunar', 'martian') {
            $otherPath = Join-Path $OutRoot "item\${other}_vein_sample_core.png"
            if ((Test-Path -LiteralPath $otherPath) -and (((Read-Png $otherPath).P -join ',') -eq ($img.P -join ','))) { $msgs += "identical to the $other core" }
        }
    }
    if ($msgs.Count -gt 0) { $problems++; Write-Warning "$rel : $($msgs -join '; ')" }
}

# the assembly family: one silhouette, five different pictures
$asmWritten = @($written | Where-Object { $_ -like 'item/*_assembly.png' })
if ($asmWritten.Count -gt 1) {
    $imgs = @{}
    foreach ($rel in $asmWritten) { $imgs[$rel] = Read-Png (Join-Path $OutRoot ($rel -replace '/', '\')) }
    $mask0 = Get-AlphaMask $imgs[$asmWritten[0]]
    for ($i = 1; $i -lt $asmWritten.Count; $i++) {
        if ((Get-AlphaMask $imgs[$asmWritten[$i]]) -ne $mask0) { $problems++; Write-Warning "$($asmWritten[$i]) : silhouette differs from $($asmWritten[0])" }
        for ($j = 0; $j -lt $i; $j++) {
            if (($imgs[$asmWritten[$i]].P -join ',') -eq ($imgs[$asmWritten[$j]].P -join ',')) { $problems++; Write-Warning "$($asmWritten[$i]) : identical to $($asmWritten[$j])" }
        }
    }
}
# the chart family: the inner planets chart sits on the Mars chart's silhouette
if ($written -contains 'item/inner_planets_chart.png') {
    $marsPath = Join-Path $OutRoot 'item\mars_chart.png'
    if (Test-Path -LiteralPath $marsPath) {
        $inner = Read-Png (Join-Path $OutRoot 'item\inner_planets_chart.png')
        if ((Get-AlphaMask $inner) -ne (Get-AlphaMask (Read-Png $marsPath))) { $problems++; Write-Warning 'item/inner_planets_chart.png : silhouette differs from item/mars_chart.png' }
    }
}

Write-Host "written $($written.Count) files under $OutRoot ($problems with warnings)"
foreach ($rel in $written) { Write-Host "  $rel" }

# ============================================================================================
#  PREVIEW (optional, never shipped)
# ============================================================================================
if ($Preview) {
    function Get-Tex {
        param([string]$Rel)
        $p = Join-Path $OutRoot ($Rel -replace '/', '\')
        if (Test-Path -LiteralPath $p) { return (Read-Png $p) }
        Write-Warning "preview: $Rel not found, left out"
        return $null
    }
    # an item layer as the game draws it with a tint: every channel multiplied by the tint's
    function Get-Tinted {
        param($Tex, [int]$Tint)
        if ($null -eq $Tex) { return $null }
        $t = Get-Rgba $Tint
        $o = Copy-Canvas $Tex
        for ($i = 0; $i -lt $o.P.Length; $i++) {
            $q = Get-Rgba $o.P[$i]
            if ($q[3] -eq 0) { continue }
            $o.P[$i] = ConvertTo-Argb ([int]($q[0] * $t[0] / 255)) ([int]($q[1] * $t[1] / 255)) ([int]($q[2] * $t[2] / 255)) 255
        }
        return $o
    }
    # composed at 1x (1 px gaps become 8 px) and scaled at the end
    $bg = Hex '1E2126'
    $slot = Hex '8B8B8B'
    $sheet = New-Canvas 224 112
    for ($i = 0; $i -lt $sheet.P.Length; $i++) { $sheet.P[$i] = $bg }
    function Add-Tile {
        param($Tex, [int]$X0, [int]$Y0, [int]$Back = 0)
        if ($Back -ne 0) { Set-Rect $sheet $X0 $Y0 16 16 $Back }
        if ($null -ne $Tex) { Merge-Canvas $sheet $Tex $X0 $Y0 }
    }
    function Add-Wall {
        param($Tex, [int]$X0, [int]$Y0, $Face = $null)
        if ($null -eq $Tex) { return }
        for ($j = 0; $j -lt 3; $j++) { for ($i = 0; $i -lt 3; $i++) { Add-Tile $Tex ($X0 + 16 * $i) ($Y0 + 16 * $j) } }
        if ($null -ne $Face) { Add-Tile $Face ($X0 + 16) ($Y0 + 16) }
    }
    # a panel seen a little from above: the top, then the 3 px edge (rows 6..8 of the frame)
    function Add-PanelMock {
        param($Top, $Frame, [int]$X0, [int]$Y0)
        if ($null -eq $Top -or $null -eq $Frame) { return }
        Add-Tile $Top $X0 $Y0
        for ($j = 0; $j -lt 3; $j++) { for ($i = 0; $i -lt 16; $i++) { Set-Px $sheet ($X0 + $i) ($Y0 + 16 + $j) $Frame.P[(6 + $j) * 16 + $i] } }
    }

    # row 1, on slot grey: the items (the Mars chart after the inner planets chart, for the family)
    $itemRels = @('item/leu_pellet.png', 'item/zircaloy_cladding_tube.png', 'item/leu_fuel_assembly.png', 'item/mox_fuel_assembly.png',
        'item/breeder_fuel_assembly.png', 'item/spent_fuel_assembly.png', 'item/spent_breeder_assembly.png', 'item/pube_neutron_source.png',
        'item/rtg_pellet.png', 'item/ion_exchange_resin.png', 'item/platinum_gauze.png', 'item/inner_planets_chart.png', 'item/mars_chart.png')
    $x = 2
    foreach ($rel in $itemRels) { Add-Tile (Get-Tex $rel) $x 2 $slot; $x += 17 }

    # row 2: the vein samples (frame, core, and both layers with the core tinted by a vein of that body), then the Martian and lunar ones
    $x = 2
    foreach ($s in @(@('venusian', '5A5A6E', $true), @('hermean', 'B9C6D2', $true), @('martian', 'D7E8B3', $false), @('lunar', '6E6A5E', $false))) {
        $frame = Get-Tex "item/$($s[0])_vein_sample_frame.png"
        $core = Get-Tex "item/$($s[0])_vein_sample_core.png"
        if ($s[2]) { Add-Tile $frame $x 21 $slot; $x += 17; Add-Tile $core $x 21 $slot; $x += 17 }
        Add-Tile $frame $x 21 $slot; Add-Tile (Get-Tinted $core (Hex $s[1])) $x 21; $x += 17
    }

    # row 3: the heat shield brick alone, as a wall, as a wall behind a controller face; the sintered regolith; the thin-film field
    $brick = Get-Tex 'block/hermean_heat_shield_brick.png'
    Add-Tile $brick 2 40
    Add-Wall $brick 20 40
    Add-Wall $brick 70 40 (Get-Tex 'block/multiblock/lunar_drill/overlay_front.png')
    Add-Wall (Get-Tex 'block/sintered_regolith.png') 120 40
    $cells = Get-Tex 'block/iv/thin_film_cells.png'
    Add-Wall $cells 172 40

    # row 4: the thin-film cells and frame, the panel mock, and the EV Solar Wing Panel for comparison
    $frameTex = Get-Tex 'block/iv/thin_film_frame.png'
    Add-Tile $cells 2 90
    Add-Tile $frameTex 20 90
    Add-PanelMock $cells $frameTex 38 90
    $wingCells = Get-Tex 'block/ev_tripod/wing_cells.png'
    $wingFrame = Get-Tex 'block/ev_tripod/wing_frame.png'
    Add-Tile $wingCells 62 90
    Add-Tile $wingFrame 80 90
    Add-PanelMock $wingCells $wingFrame 98 90

    # nearest-neighbour x8, plus a strip of the items at x2 (the usual GUI scale) under the sheet
    $k = 8
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
    Write-Host "preview: $Preview (items | vein samples | brick, walls, regolith, thin-film field | cells, frame, panel mock, EV wing | items at x2)"
}

if ($problems -gt 0) { throw "$problems file(s) failed the texture checks (see the warnings above)" }

if ($Credits) {
    Write-Host ''
    foreach ($rel in $written) {
        Write-Host ("| ``pack/kubejs/assets/grindless/textures/$rel`` | Generated with tools/assets/$ScriptName (procedural pixel art, original) by the assets agent, 2026-10-25 | the pack's licence (pending; proposed CC BY-SA 4.0) |")
    }
}
