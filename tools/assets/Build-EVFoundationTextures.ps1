<#
.SYNOPSIS
  Procedural 16x16 pixel art for the foundations of the EV era of Gregtech Grindless: the sintered regolith bricks of the lunar
  base, the regolith cell's molten salt charge, the ruthenium catalyst and the Mars transfer chart (GregTech style: top-left
  light, 3-5 tones per material, selective outlines).

.DESCRIPTION
  Every pixel is drawn by this script (palettes + char maps + small shading routines); nothing is copied or edited from GregTech
  Modern or any other mod. Output is deterministic: re-running overwrites the same bytes (grain and pellet picks come from
  Get-Noise, a hash of the position, not from a random generator). The helpers of the other generators are copied here so those
  scripts stay untouched.

  Writes (under pack/kubejs/assets/grindless/textures/):
    block/sintered_regolith.png    grindless:sintered_regolith, "Sintered Regolith Bricks": lunar regolith fused in a furnace on
                                   the Moon. Every structure of the lunar base (the EV multiblocks) is built from it, and it is also
                                   the casing texture behind their controller overlays, so it is calm, mid-dark, fully opaque and
                                   seamless in both directions: two 8 px courses in running bond, each brick owning its last row and
                                   column as the dark fused seam, so the next tile continues the bond; bevelled bricks with a mottle
                                   of three close warm greys, salted per brick, and a subtle glassy speck on some of them.
    item/molten_salt_charge.png    grindless:molten_salt_charge: the regolith cell's calcium chloride electrolyte, never used up: a
                                   heavy titanium crucible (a light lip with a dark inner shadow, a straight brushed body, two lugs)
                                   filled to the brim with white granular CaCl2, with a small glowing molten spot in the middle.
    item/ruthenium_catalyst.png    grindless:ruthenium_catalyst: ruthenium on alumina, the Sabatier catalyst of the Mars atmosphere
                                   processor. The catalyst family's steel cup and heap of 2x2 pellets (New-Catalyst, copied from
                                   Build-HVTextures.ps1): white alumina pellets, three steel-blue ruthenium beads, a ruthenium band
                                   on the cup and a pale blue sparkle.
    item/mars_chart.png            grindless:mars_chart, "Mars Transfer Chart": the deep space antenna on the far side of the Moon
                                   writes the route to Mars onto a data stick. The chart family goes parchment draft (steam) ->
                                   printed photo map (LV) -> radio plot sheet (MV) -> data stick (EV): a diagonal graphite stick
                                   with a stainless connector cap, an EV purple status light and a pale label printed with a
                                   rust-red Mars.

  Run from the repo root (PowerShell 5.1 blocks unsigned scripts by default; this bypass only affects that process):
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-EVFoundationTextures.ps1
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-EVFoundationTextures.ps1 -Only regolith,chart
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-EVFoundationTextures.ps1 -Preview C:\path\ev-foundation.png -Credits

  Every pixel is fully opaque or fully transparent and none is pure black; the block texture has all 256 pixels opaque. The final
  check fails the run (non-zero exit) if any written file breaks one of these rules.

.PARAMETER Only
  Subset of: regolith, charge, catalyst, chart (comma-separated, also as one string with -File). Default: everything.
.PARAMETER OutRoot
  Textures root. Default: <repo>/pack/kubejs/assets/grindless/textures
.PARAMETER Preview
  Also write a review sheet (x8, nearest neighbour) to this PNG, which must be outside the repository (it is never shipped). Top
  row: the bricks alone, tiled 3x3 (to check the seams) and tiled 3x3 again with the lunar drill's controller face on the middle
  block (the bricks as a casing behind an overlay). Bottom row, on inventory-slot grey: the molten salt charge; the ruthenium
  catalyst next to the hydrotreating, reforming and shift catalysts; the Mars chart next to the lunar landing chart. The
  neighbours are read from OutRoot and left out if they are missing.
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
$Known = @('regolith', 'charge', 'catalyst', 'chart')
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

# Ramps shared with the EV set (Build-EVTextures.ps1): EV purple accents and clean stainless steel, lit -> dark.
$PurpleSpec = 'a=F3E4FF b=D6B0FF c=B07AF0 d=8A4CD0 e=5C2E9C f=381C64 g=1C0E36'
$StainSpec = '0=F7FAFF 1=DCE5F0 2=B8C6D8 3=8E9DB2 4=667690 5=465470 6=2C364C'

# ============================================================================================
#  SINTERED REGOLITH BRICKS - block texture, fully opaque, seamless in both directions
#  two courses of 8 px: the upper one split into two 8 px bricks, the lower one shifted by half a brick (running bond). Each brick
#  owns its last row and column as the fused seam (dark, no mortar colour), so the tile below/right continues the bond. Bevel lit
#  on the top and left edges, shaded on the bottom and right; inside, a calm mottle of three close warm greys (basalt, a little
#  browner than GCYR's moon stone), salted per brick so no two bricks match, and one subtle glassy speck on some bricks only.
# ============================================================================================
#   a lit edge   b light mottle   c mid mottle   d dark mottle   e shaded edge   f fused seam   g glassy speck
$RegolithPal = New-Pal 'a=A09B90 b=8A857B c=827D73 d=7A756C e=645F57 f=46423C g=58534C'
$RegolithMottle = @(70, 190)    # noise thresholds b | c | d: the share of each mottle tone
$RegolithGradient = 4           # per step of u + v: the mottle is a little lighter towards the brick's lit corner
$RegolithBiasAmp = 24           # per brick, a hash shifts the whole mottle by up to this much (lighter or darker bricks)
$RegolithSpeckSalt = 88         # the hash that picks which bricks get a speck (with 88: the upper left and the lower wrapped one)

# Brick-local position of a tile pixel: @(U, V, brick) with U, V in 0..7 (7 = the seam). The lower course is shifted by 4 px.
function Get-RegolithBrick {
    param([int]$X, [int]$Y)
    $course = [int][Math]::Floor($Y / 8)
    $bx = ($X - 4 * $course + 16) % 16
    return @(($bx % 8), ($Y % 8), (2 * $course + [int][Math]::Floor($bx / 8)))
}

function New-SinteredRegolith {
    $c = New-Canvas
    $P = $RegolithPal
    # per brick: a hash decides whether it carries a glassy speck (about half of them) and where, inside the bevel
    $speck = @{}
    foreach ($br in 0..3) {
        if ((Get-Noise $br 0 0 $RegolithSpeckSalt) -lt 112) {
            $speck[$br] = @((1 + (Get-Noise $br 1 0 $RegolithSpeckSalt) % 5), (1 + (Get-Noise $br 2 0 $RegolithSpeckSalt) % 5))
        }
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
            # the mottle: noise salted per brick, a per-brick shift and a slight lean towards the lit corner
            $bias = [int](((Get-Noise $br 7 0 89) - 128) * $RegolithBiasAmp / 128)
            $n = (Get-Noise $x $y 0 (61 + 7 * $br)) + $RegolithGradient * ($u + $v - 6) + $bias
            $ch = if ($n -lt $RegolithMottle[0]) { 'b' } elseif ($n -lt $RegolithMottle[1]) { 'c' } else { 'd' }
        }
        Set-Px $c $x $y $P[$ch]
    } }
    return $c
}

# ============================================================================================
#  MOLTEN SALT CHARGE - a heavy titanium crucible full of calcium chloride with a molten spot in the middle
#  a metal crucible seen slightly from above: a light titanium lip, wider than the body, with a dark inner shadow under its back
#  edge; the white salt level with the brim and the small molten spot in it; a dark band under the front of the lip with a lug
#  on each side; a straight brushed body (a narrow highlight, the dark tones on the right) curving into a dark base
# ============================================================================================
#   titanium (the $PlatPal ramp of Build-EVTextures.ps1, plus p for the deepest shadow): K spec, L light, m mid, n dark, o darkest
#   salt: S is a granule picked per pixel by Get-Noise (W white, X grain, Y shaded grain)     molten spot: a white-hot, b yellow, c orange
$ChargePal = New-Pal @'
K=F9E9FF L=ECC8FA m=DCA0F0 n=AB6FC6 o=6B3C86 p=4A2860
W=F4F4F0 X=E2E2DA Y=C8C8BE
a=FFE7A0 b=FFC45A c=FF8F2E
'@

$ChargeMap = @(
    '................',
    '................',
    '................',
    '....LLKKLLmm....',
    '..LKppppoooomn..',
    '..LSSSSabSSSSn..',
    '..LLSSSbccSSmn..',
    '...nKKLLLLmnp...',
    '.Lmnnnnnooopppo.',
    '...nLmmmnnooo...',
    '...nLmmnnnooo...',
    '...nLmmmnnooo...',
    '...onnnoooppp...',
    '....oooppppp....',
    '................',
    '................'
)
Assert-Map 'ChargeMap' $ChargeMap

function New-MoltenSaltCharge {
    $c = New-Canvas
    $P = $ChargePal
    for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
        $ch = [string]$ChargeMap[$y][$x]
        if ($ch -eq '.') { continue }
        if ($ch -eq 'S') {
            $n = Get-Noise $x $y 0 71
            $ch = if ($n -lt 120) { 'W' } elseif ($n -lt 215) { 'X' } else { 'Y' }
        }
        Set-Px $c $x $y $P[$ch]
    } }
    Add-Outline $c -LitArgb (Hex '5A3272') -ShadeArgb (Hex '2C1638')
    return $c
}

# ============================================================================================
#  RUTHENIUM CATALYST - the catalyst family's cup and pellet heap
# ============================================================================================
# --- New-Catalyst (copied from Build-HVTextures.ps1): a heap of 2x2 pellets in a steel cup with a coloured band. One addition:
#     -Sparkle gives the colours (arms, core) of the four-point sparkle; its default is the platinum one of the HV copy.
$CatSteel = @((Hex 'F2F6FA'), (Hex 'C8D3E0'), (Hex '9AA9BC'), (Hex '6D7D95'), (Hex '48587A'))

function New-Catalyst {
    param($Pellets, $Band, [int]$Platinum, $Sparkle = @((Hex 'FFF6B8'), (Hex 'FFFFFF')))
    # $Pellets: ball ramps, picked per ball by hash (the last one is the bright metal); $Band: 3 tones of the cup's band
    # (light, mid, dark); $Platinum: how many of the top beads are forced to the bright metal, with a sparkle beside the heap
    $c = New-Canvas
    # cup: rim (y8), coloured band (y9), body (y10..11) and a narrower foot (y12)
    foreach ($x in 3..12) { Set-Px $c $x 8 $CatSteel[(Get-SpanTone $x 3 12)] }
    foreach ($x in 4..11) {
        $t = Get-SpanTone $x 4 11
        Set-Px $c $x 9 $(if ($t -le 1) { $Band[0] } elseif ($t -eq 2) { $Band[1] } else { $Band[2] })
    }
    foreach ($y in 10..11) { foreach ($x in 4..11) { Set-Px $c $x $y $CatSteel[(Get-ClampInt ((Get-SpanTone $x 4 11) + 1) 0 4)] } }
    foreach ($x in 5..10) { Set-Px $c $x 12 $CatSteel[(Get-ClampInt ((Get-SpanTone $x 5 10) + 2) 0 4)] }
    # heap: 2 + 3 + 4 beads (2x2, lit from the top-left), the rows settling into one another
    $balls = @(@(6, 2), @(8, 2), @(5, 4), @(7, 4), @(9, 4), @(4, 6), @(6, 6), @(8, 6), @(10, 6))
    $bright = @(1, 3, 6, 4) | Select-Object -First $Platinum
    for ($bi = 0; $bi -lt $balls.Count; $bi++) {
        $bx = $balls[$bi][0]; $by = $balls[$bi][1]
        $ramp = $Pellets[(Get-Noise $bx $by 0 7) % $Pellets.Count]
        if ($bright -contains $bi) { $ramp = $Pellets[$Pellets.Count - 1] }
        $tones = @(@(0, 0, 0), @(1, 0, 1), @(0, 1, 2), @(1, 1, 3))
        foreach ($q in $tones) { Set-Px $c ($bx + $q[0]) ($by + $q[1]) $ramp[$q[2]] }
    }
    if ($Platinum -gt 0) {
        # a four-point sparkle above the heap
        foreach ($d in @(@(-1, 0), @(1, 0), @(0, -1), @(0, 1))) { Set-Px $c (12 + $d[0]) (3 + $d[1]) $Sparkle[0] }
        Set-Px $c 12 3 $Sparkle[1]
    }
    Add-Outline $c -LitArgb (Hex '55627C') -ShadeArgb (Hex '232B40')
    return $c
}

# pellet balls, lit from the top-left: highlight, light, mid, dark
$PelAlumina = @((Hex 'F6F4EE'), (Hex 'E2DED2'), (Hex 'BDB7A6'), (Hex '8F897A'))
# ruthenium: GregTech's material colour 0xA2CDE0, its secondary 0x3C7285
$PelRuthenium = @((Hex 'CFE6F0'), (Hex 'A2CDE0'), (Hex '5E93AC'), (Hex '3C7285'))
$BandRuthenium = @((Hex 'A2CDE0'), (Hex '5E93AC'), (Hex '2E5A70'))
$SparkRuthenium = @((Hex 'CFEFFF'), (Hex 'FFFFFF'))

function New-RutheniumCatalyst {
    # the hash puts ruthenium on beads 1, 3 and 8 (top right, centre, lower right); the forced bead (1) carries the sparkle
    return (New-Catalyst @($PelAlumina, $PelAlumina, $PelRuthenium) $BandRuthenium 1 $SparkRuthenium)
}

# ============================================================================================
#  MARS TRANSFER CHART - a data stick
#  a diagonal graphite stick (lower left -> upper right, four pixels per row like the platinum electrode), a stainless connector
#  cap on the upper end, an EV purple status light by the cap, and a pale label across the middle printed with Mars
# ============================================================================================
#   graphite: K gloss, L lit edge, M face, N shaded edge, O deepest     label: u lit edge, v paper, w shaded edge
#   Mars: r lit, s mid, t dark     0..6 stainless (cap)     c EV purple (status light)
$ChartPal = New-Pal ($PurpleSpec + ' ' + $StainSpec + ' ' + @'
K=6E7688 L=5A6170 M=454B58 N=333844 O=252932
u=F4F0E2 v=E6E0CC w=C4BDA6
r=E2683A s=B5481F t=7E2C12
'@)

$StickMap = @(
    '................',
    '................',
    '............135.',
    '...........024..',
    '..........1235..',
    '.........LMcN...',
    '........LMMN....',
    '.......uvvw.....',
    '......ursw......',
    '.....uvst.......',
    '....uvvw........',
    '...LMMN.........',
    '..LMMN..........',
    '..MNO...........',
    '................',
    '................'
)
Assert-Map 'StickMap' $StickMap

function New-MarsChart {
    $c = New-Canvas
    Write-Map $c 0 0 $StickMap $ChartPal
    Add-Outline $c -LitArgb (Hex '2A2E38') -ShadeArgb (Hex '16181E')
    return $c
}

# ============================================================================================
#  BUILD
# ============================================================================================
if (Test-Want 'regolith') { Out-Tex (New-SinteredRegolith) 'block/sintered_regolith.png' }
if (Test-Want 'charge') { Out-Tex (New-MoltenSaltCharge) 'item/molten_salt_charge.png' }
if (Test-Want 'catalyst') { Out-Tex (New-RutheniumCatalyst) 'item/ruthenium_catalyst.png' }
if (Test-Want 'chart') { Out-Tex (New-MarsChart) 'item/mars_chart.png' }

# ============================================================================================
#  VERIFY what was written: 16x16, binary alpha, no pure black, the block fully opaque, the items not empty
# ============================================================================================
$problems = 0
foreach ($rel in $written) {
    $path = Join-Path $OutRoot ($rel -replace '/', '\')
    $img = Read-Png $path
    $msgs = @()
    if ($img.W -ne 16 -or $img.H -ne 16) { $msgs += "bad size $($img.W)x$($img.H) (expected 16x16)" }
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
    if ($black -gt 0) { $msgs += "$black pure-black px" }
    if ($rel -like 'block/*') {
        if ($opaque -ne $img.P.Length) { $msgs += "block texture is not fully opaque ($opaque of $($img.P.Length) px)" }
    } elseif ($opaque -eq 0) { $msgs += 'fully transparent' }
    if ($msgs.Count -gt 0) { $problems++; Write-Warning "$rel : $($msgs -join '; ')" }
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
    # composed at 1x (1 px gaps become 8 px) and scaled at the end
    $sheet = New-Canvas 128 70
    for ($i = 0; $i -lt $sheet.P.Length; $i++) { $sheet.P[$i] = Hex '1E2126' }
    $slot = Hex '8B8B8B'
    function Add-Tile {
        param($Tex, [int]$X0, [int]$Y0, [int]$Back = 0)
        if ($Back -ne 0) { Set-Rect $sheet $X0 $Y0 16 16 $Back }
        if ($null -ne $Tex) { Merge-Canvas $sheet $Tex $X0 $Y0 }
    }
    # top row: the bricks alone, a 3x3 wall, and a 3x3 wall with a controller face on the middle block
    $brick = Get-Tex 'block/sintered_regolith.png'
    $face = Get-Tex 'block/multiblock/lunar_drill/overlay_front.png'
    if ($null -ne $brick) {
        Add-Tile $brick 2 2
        for ($j = 0; $j -lt 3; $j++) { for ($i = 0; $i -lt 3; $i++) {
            Add-Tile $brick (20 + 16 * $i) (2 + 16 * $j)
            Add-Tile $brick (70 + 16 * $i) (2 + 16 * $j)
        } }
        if ($null -ne $face) { Add-Tile $face 86 18 }
    }
    # bottom row on slot grey: the charge | the catalyst family | the chart family
    Add-Tile (Get-Tex 'item/molten_salt_charge.png') 2 52 $slot
    $x = 22
    foreach ($rel in 'item/ruthenium_catalyst.png', 'item/hydrotreating_catalyst.png', 'item/reforming_catalyst.png', 'item/shift_catalyst.png') {
        Add-Tile (Get-Tex $rel) $x 52 $slot; $x += 17
    }
    Add-Tile (Get-Tex 'item/mars_chart.png') 93 52 $slot
    Add-Tile (Get-Tex 'item/lunar_landing_chart.png') 110 52 $slot

    # nearest-neighbour x8
    $k = 8
    $big = New-Canvas ($sheet.W * $k) ($sheet.H * $k)
    $row = New-Object 'int[]' ($big.W)
    for ($y = 0; $y -lt $sheet.H; $y++) {
        for ($x = 0; $x -lt $sheet.W; $x++) { $v = $sheet.P[$y * $sheet.W + $x]; for ($i = 0; $i -lt $k; $i++) { $row[$x * $k + $i] = $v } }
        for ($j = 0; $j -lt $k; $j++) { [Array]::Copy($row, 0, $big.P, ($y * $k + $j) * $big.W, $big.W) }
    }
    $dir = Split-Path -Parent $Preview
    if ($dir -and -not (Test-Path -LiteralPath $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
    $bmp = ConvertTo-Bitmap $big
    try { $bmp.Save($Preview, [System.Drawing.Imaging.ImageFormat]::Png) } finally { $bmp.Dispose() }
    Write-Host "preview: $Preview (bricks, 3x3 wall, 3x3 wall with a face; charge | ruthenium, hydrotreating, reforming, shift | Mars chart, lunar landing chart)"
}

if ($problems -gt 0) { throw "$problems file(s) failed the texture checks (see the warnings above)" }

if ($Credits) {
    Write-Host ''
    foreach ($rel in $written) {
        Write-Host ("| ``pack/kubejs/assets/grindless/textures/$rel`` | Generated with tools/assets/$ScriptName (procedural pixel art, original) by the assets agent, 2026-10-25 | the pack's licence (pending; proposed CC BY-SA 4.0) |")
    }
}
