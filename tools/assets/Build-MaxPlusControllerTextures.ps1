<#
.SYNOPSIS
  Procedural 16x16 pixel art for the MAX+ art pass of Gregtech Grindless (package XP-V2): the controller faces of the 17 MAX+ machines and of the
  Hyperstargate, the gate's six blocks and two items, the six creative-item stand-ins and the horizon capacitor's block.

.DESCRIPTION
  Every pixel is drawn by this script; nothing is copied or edited from GregTech Modern, AE2 or any other mod. Output is deterministic.
  Textures are saved through Era.Lib.ps1's MAX+ style (EraName 'maxplus'), as in Build-MaxPlusTextures.ps1 (XP-V1).

  Writes (under pack/kubejs/assets/grindless/textures/):
    faces:    block/multiblock/<machine>/overlay_front.png, overlay_front_active.png(+.mcmeta), overlay_front_active_emissive.png(+.mcmeta)
              for the 17 controllers and hyperstargate. All share one violet-black bezel with an amber lit edge; the bore shows what the
              machine does (a flask, a press, a sling, a lift, a bowl, a flame, a tank, a torus, an anvil, a crystal, a weave, three streams,
              a furnace, an arm, a bank of cells, a grid of nodes, a factory, the gate). Working: 4 frames, the amber and ice pixels pulse.
    parts:    block/maxplus/hyperstargate_{ring_block,chevron_block,locked_chevron,power_unit,base}.png, block/maxplus/horizon_iris.png
              (the ring and both chevrons share one plate: a lit chevron with a latch bar is a locked one), item/hyperstargate_chevron_upgrade.png,
              item/hyperstargate_interface.png
    standins: item/creative_{energy,chest,tank,computation_provider,data_access_hatch,energy_cell}.png (a round horizon-matter token with
              the namesake's icon, so none reads as the placeable block), block/maxplus/horizon_capacitor.png

  Conventions: faces have a transparent background and an empty outer 1 px ring; every pixel is fully opaque or fully transparent and none is
  pure black; emissive is a subset of the colour layer; blocks are fully opaque; items have a transparent corner. The final check fails the run
  (non-zero exit) if a written file breaks one.

  Run from the repo root:
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-MaxPlusControllerTextures.ps1
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-MaxPlusControllerTextures.ps1 -Only parts -Preview C:\temp\xp-v2.png

.PARAMETER Only
  Subset of groups: faces, parts, standins (comma-separated).
.PARAMETER OutRoot
  Textures root. Default: <repo>/pack/kubejs/assets/grindless/textures
.PARAMETER Credits
  Also print the CREDITS.md "Assets" table rows for the files written.
.PARAMETER Preview
  Write a review sheet (everything written, x4; faces idle then working frame 0) to this PNG path, outside the repository.
#>
[CmdletBinding()]
param(
    [string]$OutRoot = '',
    [string[]]$Only = @(),
    [switch]$Credits,
    [string]$Preview = ''
)
$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'Pixel.Lib.ps1')
$EraName = 'maxplus'; . (Join-Path $PSScriptRoot 'Era.Lib.ps1')

$RepoRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..'))
if (-not $OutRoot) { $OutRoot = Join-Path $RepoRoot 'pack\kubejs\assets\grindless\textures' }
$OutRoot = [System.IO.Path]::GetFullPath($OutRoot)
$ScriptName = Split-Path -Leaf $PSCommandPath
$OnlySet = @(); foreach ($o in $Only) { $OnlySet += ($o -split ',') | Where-Object { $_ } }
if ($Preview) {
    $Preview = $ExecutionContext.SessionState.Path.GetUnresolvedProviderPathFromPSPath($Preview)
    if ($Preview.StartsWith($RepoRoot.TrimEnd('\') + '\', [System.StringComparison]::OrdinalIgnoreCase)) {
        throw "-Preview must point outside the repository (the review sheet is never shipped): $Preview"
    }
}
function Test-Group { param([string]$G) return ($OnlySet.Count -eq 0 -or $OnlySet -contains $G) }

$FrameTime = 4
$Frames = 4
$written = New-Object System.Collections.Generic.List[string]
$groupOf = @{}
function Out-Tex {
    param($Canvas, [string]$Rel, [string]$Group, [int]$Time = 0)
    $path = Join-Path $OutRoot ($Rel -replace '/', '\')
    $dir = Split-Path -Parent $path
    if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir | Out-Null }
    for ($try = 1; $try -le 6; $try++) {
        try { Save-Png $Canvas $path; if ($Time -gt 0) { Save-Mcmeta ($path + '.mcmeta') $Time }; break }
        catch [System.IO.IOException] { if ($try -eq 6) { throw }; Start-Sleep -Milliseconds (250 * $try) }
    }
    $written.Add($Rel); $groupOf[$Rel] = $Group
    if ($Time -gt 0) { $written.Add($Rel + '.mcmeta'); $groupOf[$Rel + '.mcmeta'] = $Group }
}

# palette of the MAX+ style: event-horizon violet-black with an amber accretion halo and ice-blue condensate light
$Void = Hex '221C38'; $Violet = Hex '4A3C78'; $Steel = Hex '55506A'; $Amber = Hex 'E89838'; $Ice = Hex '8AB8F0'
$Lit = Hex '8A78C0'; $Mid = Hex '4A3C78'; $Dark = Hex '2E2650'; $Deep = Hex '1A1430'; $Pit = Hex '120E22'
$Hot = Hex 'FFF2C8'; $Warm = Hex 'FFD890'; $Plate = Hex '7A6AAE'
$LampOn = Hex 'FFB040'; $LampOff = Hex '5A3A10'

# ---------------------------------------------------------------- faces: a 10 x 8 motif in the bore (x 3..12, y 3..10)
# '#' structure, 'a' amber, 'i' ice, 'w' white-hot core; '.' leaves the bore dark
$Faces = [ordered]@{
    condensate_refinery = @('....##....', '...#ii#...', '...#ii#...', '..#iiii#..', '..#iiii#..', '..#aaaa#..', '...#aa#...', '....aa....')
    bound_matter_press = @('##########', '#aaaaaaaa#', '..........', '....ww....', '....ww....', '..........', '#aaaaaaaa#', '##########')
    hills_slingshot = @('a........a', '#a......a#', '.#a....a#.', '..#a..a#..', '...#aa#...', '....##..w.', '....##.w..', '....##....')
    tarantula_stellar_lift = @('....aa....', '...aaaa...', '..a.aa.a..', '....ii....', '....ii....', '..#.ii.#..', '..#.ii.#..', '.########.')
    pair_instability_crucible = @('...a..a...', '..a.aa.a..', '...aaaa...', '#.aaaaaa.#', '#.aaaaaa.#', '##.aaaa.##', '.##....##.', '..######..')
    nickel_56_burner = @('....ii....', '...i..i...', '..i.aa.i..', '..i.aa.i..', '..i.aa.i..', '...i..i...', '....ii....', '.########.')
    pristine_gas_works = @('..######..', '.#i....i#.', '.#..i...#.', '.#.....i#.', '.#i..i..#.', '.#....i.#.', '.#iiiiii#.', '..######..')
    primordial_fusion_torus = @('...aaaa...', '..a####a..', '.a#....#a.', '.a#.ww.#a.', '.a#.ww.#a.', '.a#....#a.', '..a####a..', '...aaaa...')
    blueshift_forge = @('i.i.......', '.i.i......', 'i.i..wwww.', '.....wwww.', '..######..', '...####...', '..######..', '.########.')
    void_crystal_fab = @('....ii....', '...iiii...', '..iiwwii..', '..iiwwii..', '...iiii...', '....ii....', '..a....a..', '.aaa..aaa.')
    meta_material_loom = @('a.a.a.a.a.', 'iiiiiiiiii', '.a.a.a.a.a', 'iiiiiiiiii', 'a.a.a.a.a.', 'iiiiiiiiii', '.a.a.a.a.a', 'iiiiiiiiii')
    horizon_crystal_furnace = @('.########.', '.#......#.', '.#..ii..#.', '.#.iwwi.#.', '.#.iwwi.#.', '.#..ii..#.', '.#aaaaaa#.', '.########.')
    condensate_assembler = @('..#.......', '..#.......', '..##aaa...', '....#.a...', '....#.ww..', '...###ww..', '..########', '..........')
    horizon_capacitor_bank = @('.########.', '#a#a#a#a##', '#i#i#i#i##', '#i#i#i#i##', '#i#i#i#i##', '#a#a#a#a##', '.########.', '..........')
    hyper_assembly_array = @('aaaa..aaaa', 'a##a..a##a', 'aaaa..aaaa', '...#aa#...', '...#aa#...', 'aaaa..aaaa', 'a##a..a##a', 'aaaa..aaaa')
    hyperfactory = @('.#..#..#..', '.#..#..#..', '.#..#..#..', '##########', '#aa#aa#aa#', '#aa#aa#aa#', '#aa#aa#aa#', '##########')
    hyperstargate = @('..aaaaaa..', '.a#iiii#a.', 'a#i....i#a', 'ai..ww..ia', 'ai..ww..ia', 'a#i....i#a', '.a#iiii#a.', '..aaaaaa..')
}

function New-FaceBezel {
    $c = New-Canvas
    Set-Rect $c 1 1 14 14 $Dark
    for ($i = 1; $i -le 14; $i++) {
        Set-Px $c $i 1 $Lit; Set-Px $c 1 $i $Lit
        Set-Px $c $i 14 $Deep; Set-Px $c 14 $i $Deep
    }
    Set-Rect $c 2 2 12 12 $Mid
    Set-Rect $c 3 3 10 8 $Pit
    Set-Rect $c 3 11 10 3 $Dark
    return $c
}

function New-Face {
    param([string[]]$Map, [int]$Frame, [bool]$Active)
    $c = New-FaceBezel
    $e = New-Canvas
    for ($j = 0; $j -lt 8; $j++) {
        $row = $Map[$j]
        for ($i = 0; $i -lt 10; $i++) {
            $ch = $row[$i]; $x = 3 + $i; $y = 3 + $j
            if ($ch -eq '.') { continue }
            if ($ch -eq '#') { Set-Px $c $x $y $(if ($i -lt 5 -and $j -lt 4) { $Plate } else { Shade $Plate 0.82 }); continue }
            $base = $(if ($ch -eq 'a') { $Amber } elseif ($ch -eq 'i') { $Ice } else { $Hot })
            if ($ch -eq 'w') {
                $col = $(if ($Active -and ($Frame % 2) -eq 1) { $Warm } else { $Hot })
                if (-not $Active) { $col = Shade $Hot 0.62 }
                Set-Px $c $x $y $col
                if ($Active) { Set-Px $e $x $y $col }
                continue
            }
            if ($Active -and ((($i * 2 + $j + $Frame) % 4) -ne 0)) { Set-Px $c $x $y $base; Set-Px $e $x $y $base }
            else { Set-Px $c $x $y (Shade $base 0.6) }
        }
    }
    $lamp = $(if ($Active) { $LampOn } else { $LampOff })
    Set-Px $c 7 12 $lamp; Set-Px $c 8 12 $lamp
    if ($Active) { Set-Px $e 7 12 $LampOn; Set-Px $e 8 12 $LampOn }
    for ($i = 0; $i -lt 16; $i++) { foreach ($p in @(@($i, 0), @($i, 15), @(0, $i), @(15, $i))) { Set-Px $c $p[0] $p[1] 0; Set-Px $e $p[0] $p[1] 0 } }
    return @{ C = $c; E = $e }
}

# ---------------------------------------------------------------- blocks and items
function Get-Light { param([int]$X, [int]$Y) return (1.12 - 0.028 * ($X + $Y)) }

# one plate shared by the ring and both chevrons: steel with a violet glyph band between two grooves
function New-GatePlate {
    param([string]$Seed)
    $c = New-Canvas 16 16
    $s = Get-EraHash $Seed
    for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
        $base = $Steel
        if ($y -eq 0 -or $y -eq 15 -or $y -eq 4 -or $y -eq 11) { $base = $Void }
        elseif ($y -ge 5 -and $y -le 10) { $base = $Violet }
        $t = Get-Light $x $y
        $n = Get-EraNoise $x $y $s
        if ($n -lt 110) { $t *= 0.88 } elseif ($n -gt 920) { $t *= 1.1 }
        Set-Px $c $x $y (EraShade $base $t)
    } }
    return $c
}

function New-Block16 {
    param([string]$Name)
    $c = New-Canvas 16 16
    $s = Get-EraHash $Name
    switch ($Name) {
        'hyperstargate_ring_block' {
            $c = New-GatePlate 'gate'
            foreach ($gx in 2, 7, 12) { Set-Rect $c $gx 6 3 4 $Ice; Set-Rect $c ($gx + 1) 7 1 2 $Void }
        }
        'hyperstargate_chevron_block' {
            # an unlit chevron: a dim amber outline on the dark band
            $c = New-GatePlate 'gate'
            Set-Rect $c 0 5 16 6 $Void
            $dim = Shade $Amber 0.55
            for ($k = 0; $k -lt 5; $k++) { foreach ($x in (2 + $k), (13 - $k)) { Set-Px $c $x (5 + $k) $dim } }
            Set-Px $c 7 10 $dim; Set-Px $c 8 10 $dim
        }
        'hyperstargate_locked_chevron' {
            # a lit chevron held by a steel latch bar with two ice rivets
            $c = New-GatePlate 'gate'
            Set-Rect $c 0 5 16 6 $Void
            for ($k = 0; $k -lt 5; $k++) { foreach ($x in (2 + $k), (3 + $k), (13 - $k), (12 - $k)) { Set-Px $c $x (5 + $k) $Amber } }
            Set-Px $c 7 10 $Amber; Set-Px $c 8 10 $Amber; Set-Px $c 7 9 $Hot; Set-Px $c 8 9 $Hot
            Set-Rect $c 1 8 14 2 $Steel
            for ($x = 1; $x -le 14; $x++) { Set-Px $c $x 8 (Shade $Lit 0.9) }
            Set-Px $c 3 9 $Ice; Set-Px $c 12 9 $Ice
        }
        'hyperstargate_power_unit' {
            for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
                $base = $Steel
                if ($x -eq 0 -or $x -eq 15 -or $y -eq 0 -or $y -eq 15) { $base = $Void }
                elseif ($y -le 2 -or $y -ge 13) { $base = $Violet }
                elseif ((($x - 1) % 5) -lt 3) { $base = $Void; if ($y -ge 5 -and $y -le 12) { $base = $Ice }; if ($y -eq 3 -or $y -eq 4) { $base = $Amber } }
                Set-Px $c $x $y (EraShade $base (Get-Light $x $y))
            } }
            foreach ($x in 2, 7, 12) { Set-Px $c $x 8 $Hot }
        }
        'horizon_iris' {
            for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
                $dx = $x - 7.5; $dy = $y - 7.5
                $r = [Math]::Sqrt($dx * $dx + $dy * $dy)
                $a = [Math]::Atan2($dy, $dx) + [Math]::PI
                $base = $Steel
                if ($r -lt 2.6) { $base = $Pit }
                elseif ($r -lt 3.5) { $base = $Amber }
                elseif ($r -lt 7.4) {
                    $v = ($a + $r * 0.30) * 8.0 / (2 * [Math]::PI)
                    $base = $(if (([int][Math]::Floor($v) % 2) -eq 0) { $Violet } else { $Steel })
                    if (($v - [Math]::Floor($v)) -lt 0.13) { $base = $Void }
                }
                elseif ($r -lt 8.1) { $base = $Void }
                Set-Px $c $x $y (EraShade $base (Get-Light $x $y))
            } }
        }
        'hyperstargate_base' {
            for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
                $base = $Steel
                if ($x -eq 0 -or $x -eq 15 -or $y -eq 0 -or $y -eq 15) { $base = $Void }
                elseif ($x -ge 2 -and $x -le 13 -and $y -ge 2 -and $y -le 13) { $base = $Violet }
                if ($x -ge 2 -and $x -le 13 -and ($x -eq 7 -or $x -eq 8) -and $y -ge 2 -and $y -le 13) { $base = $Void }
                if ($y -eq 7 -or $y -eq 8) { if ($x -ge 2 -and $x -le 13) { $base = $Void } }
                if (($x -eq 3 -or $x -eq 12) -and ($y -eq 3 -or $y -eq 12)) { $base = $Amber }
                $t = Get-Light $x $y
                $n = Get-EraNoise $x $y $s
                if ($n -lt 110) { $t *= 0.88 } elseif ($n -gt 920) { $t *= 1.1 }
                Set-Px $c $x $y (EraShade $base $t)
            } }
        }
        'horizon_capacitor' {
            # the bank's cell: a steel case with a dark window of charge bars
            for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
                $base = $Steel
                if ($x -eq 0 -or $x -eq 15 -or $y -eq 0 -or $y -eq 15) { $base = $Void }
                elseif ($x -ge 4 -and $x -le 11 -and $y -ge 2 -and $y -le 13) {
                    $base = $Pit
                    if (($y % 3) -ne 0 -and $x -ge 5 -and $x -le 10) { $base = $(if ($y -le 7) { $Amber } else { $Ice }) }
                }
                elseif ($x -eq 2 -or $x -eq 13) { if ($y -eq 3 -or $y -eq 12) { $base = $Amber } }
                $t = Get-Light $x $y
                $n = Get-EraNoise $x $y $s
                if ($n -lt 110) { $t *= 0.88 } elseif ($n -gt 920) { $t *= 1.1 }
                Set-Px $c $x $y (EraShade $base $t)
            } }
        }
        default { throw "no block drawing for $Name" }
    }
    return $c
}

$ItemPal = @{ a = $Amber; i = $Ice; w = $Hot; v = $Lit; d = $Void; s = $Steel; m = $Violet }

function New-Item16 {
    param([string]$Name)
    $c = New-Canvas 16 16
    switch ($Name) {
        'hyperstargate_chevron_upgrade' {
            # a card carrying a chevron and an up arrow
            Set-Rect $c 2 3 12 10 $Lit
            Set-Rect $c 3 4 10 8 $Void
            Write-Map $c 4 4 @('........', '.a....a.', '..a..a..', '...aa...', '........', '.....ii.', '....iiii', '.....ii.') $ItemPal
            Write-Map $c 4 4 @('........', '........', '........', '........', '..aaaa..', '........', '........', '........') $ItemPal
        }
        'hyperstargate_interface' {
            # a console: a screen with a glyph, a dial and a row of keys
            Set-Rect $c 1 3 14 10 $Steel
            Set-Rect $c 1 3 14 1 $Lit
            Set-Rect $c 2 5 7 5 $Void
            Write-Map $c 3 6 @('i.i.i', '.iii.', 'i.i.i') $ItemPal
            Write-Map $c 10 5 @('.aaa.', 'aaaaa', 'aawaa', 'aaaaa', '.aaa.') $ItemPal
            Write-Map $c 2 11 @('i.a.i.a.i.a') $ItemPal
        }
        default {
            # a round horizon-matter token with the namesake's icon
            for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
                $r = [Math]::Sqrt(($x - 7.5) * ($x - 7.5) + ($y - 7.5) * ($y - 7.5))
                if ($r -le 6.3) { Set-Px $c $x $y $(if ($r -ge 5.3) { $Amber } else { $Void }) }
            } }
            $icon = switch ($Name) {
                'creative_energy' { @('.....aa.', '....aa..', '...aa...', '..aaaaa.', '....aa..', '...aa...', '..aa....', '.aa.....') }
                'creative_chest' { @('vvvvvvvv', 'vmmmmmmv', 'vvvvvvvv', 'vvvaavvv', 'vvvaavvv', 'vmmmmmmv', 'vmmmmmmv', 'vvvvvvvv') }
                'creative_tank' { @('.vvvvvv.', 'v......v', 'v.iiii.v', 'viiiiiiv', 'viiwiiiv', 'viiiiiiv', 'v.iiii.v', '.vvvvvv.') }
                'creative_computation_provider' { @('.a.a.a.a', 'vvvvvvvv', 'vddddddv', 'vdaiaidv', 'vdiaiadv', 'vddddddv', 'vvvvvvvv', '.a.a.a.a') }
                'creative_data_access_hatch' { @('vvvvvvvv', 'vddddddv', 'vdiiiidv', 'vddddddv', 'vdaaaadv', 'vddwwddv', 'vddddddv', 'vvvvvvvv') }
                'creative_energy_cell' { @('vvvvvvvv', 'vddaaddv', 'vddaaddv', 'vdiiiidv', 'vdiiiidv', 'vdwwwwdv', 'vddddddv', 'vvvvvvvv') }
                default { throw "no item drawing for $Name" }
            }
            Write-Map $c 4 4 $icon $ItemPal
        }
    }
    return $c
}

# ---------------------------------------------------------------- drawing
if (Test-Group 'faces') {
    foreach ($m in $Faces.Keys) {
        $dir = "block/multiblock/$m"
        $idle = New-Face $Faces[$m] 0 $false
        Out-Tex $idle.C "$dir/overlay_front.png" 'faces'
        $col = @(); $emi = @()
        for ($f = 0; $f -lt $Frames; $f++) { $a = New-Face $Faces[$m] $f $true; $col += , $a.C; $emi += , $a.E }
        Out-Tex (Join-Frames $col) "$dir/overlay_front_active.png" 'faces' $FrameTime
        Out-Tex (Join-Frames $emi) "$dir/overlay_front_active_emissive.png" 'faces' $FrameTime
    }
}
$PartBlocks = @('hyperstargate_ring_block', 'hyperstargate_chevron_block', 'hyperstargate_locked_chevron', 'hyperstargate_power_unit', 'horizon_iris', 'hyperstargate_base')
$PartItems = @('hyperstargate_chevron_upgrade', 'hyperstargate_interface')
$Standins = @('creative_energy', 'creative_chest', 'creative_tank', 'creative_computation_provider', 'creative_data_access_hatch', 'creative_energy_cell')
if (Test-Group 'parts') {
    foreach ($n in $PartBlocks) { Out-Tex (New-Block16 $n) "block/maxplus/$n.png" 'parts' }
    foreach ($n in $PartItems) { Out-Tex (New-Item16 $n) "item/$n.png" 'parts' }
}
if (Test-Group 'standins') {
    foreach ($n in $Standins) { Out-Tex (New-Item16 $n) "item/$n.png" 'standins' }
    Out-Tex (New-Block16 'horizon_capacitor') 'block/maxplus/horizon_capacitor.png' 'standins'
}

# ---------------------------------------------------------------- checks
$problems = New-Object System.Collections.Generic.List[string]
$keys = @{}
foreach ($rel in $written) {
    if ($rel.EndsWith('.mcmeta')) { continue }
    $img = Read-Png (Join-Path $OutRoot ($rel -replace '/', '\'))
    $isFace = $rel -match 'overlay_front'
    $opaque = 0
    for ($y = 0; $y -lt $img.H; $y++) { for ($x = 0; $x -lt $img.W; $x++) {
        $v = $img.P[$y * $img.W + $x]; $a = ($v -shr 24) -band 255
        if ($a -ne 0 -and $a -ne 255) { $problems.Add("${rel}: partial alpha at $x,$y") }
        if ($a -eq 255) { $opaque++; if (($v -band 0xFFFFFF) -eq 0) { $problems.Add("${rel}: pure black at $x,$y") } }
        if ($isFace -and $a -ne 0 -and ((($x % 16) -eq 0) -or (($x % 16) -eq 15) -or (($y % 16) -eq 0) -or (($y % 16) -eq 15))) { $problems.Add("${rel}: ring pixel at $x,$y") }
    } }
    if ($rel.StartsWith('block/maxplus/') -and $opaque -ne 256) { $problems.Add("${rel}: block must be fully opaque") }
    if ($rel.StartsWith('item/')) {
        if ((($img.P[0] -shr 24) -band 255) -ne 0) { $problems.Add("${rel}: corner pixel is not transparent") }
        if ($opaque -lt 20) { $problems.Add("${rel}: only $opaque opaque pixels") }
    }
    $k = $img.P -join ','
    if ($keys.ContainsKey($k)) { $problems.Add("${rel}: identical to $($keys[$k])") } else { $keys[$k] = $rel }
    if ($rel.EndsWith('overlay_front_active.png')) {
        $em = Read-Png (Join-Path $OutRoot (($rel -replace '_active\.png$', '_active_emissive.png') -replace '/', '\'))
        for ($i = 0; $i -lt $img.P.Length; $i++) { if ($em.P[$i] -ne 0 -and $em.P[$i] -ne $img.P[$i]) { $problems.Add("${rel}: emissive differs from colour at $i") } }
        for ($f = 0; $f -lt $Frames - 1; $f++) {
            $same = $true
            for ($i = 0; $i -lt 256; $i++) { if ($img.P[$f * 256 + $i] -ne $img.P[($f + 1) * 256 + $i]) { $same = $false; break } }
            if ($same) { $problems.Add("${rel}: frame $f repeats frame $($f + 1)") }
        }
    }
}
if ($problems.Count -gt 0) { $problems | Select-Object -First 20 | ForEach-Object { Write-Error $_ -ErrorAction Continue }; exit 1 }
Write-Host "$ScriptName wrote $($written.Count) files"

if ($Preview) {
    $png = @($written | Where-Object { -not $_.EndsWith('.mcmeta') -and -not $_.EndsWith('_emissive.png') })
    $k = 4; $cell = 16 * $k + 6; $cols = 12
    $rows = [int][Math]::Ceiling($png.Count / $cols)
    $sheet = New-Canvas ($cols * $cell + 6) ($rows * $cell + 6)
    $bg = Hex '2A2D33'
    for ($i = 0; $i -lt $sheet.P.Length; $i++) { $sheet.P[$i] = $bg }
    $i = 0
    foreach ($rel in $png) {
        $img = Read-Png (Join-Path $OutRoot ($rel -replace '/', '\'))
        $x0 = 6 + ($i % $cols) * $cell; $y0 = 6 + [int][Math]::Floor($i / $cols) * $cell
        for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
            $v = $img.P[$y * 16 + $x]
            if (($v -band 0xFF000000) -eq 0) { continue }
            for ($sy = 0; $sy -lt $k; $sy++) { for ($sx = 0; $sx -lt $k; $sx++) { $sheet.P[($y0 + $y * $k + $sy) * $sheet.W + $x0 + $x * $k + $sx] = $v } }
        } }
        $i++
    }
    $pdir = Split-Path -Parent $Preview
    if ($pdir -and -not (Test-Path -LiteralPath $pdir)) { New-Item -ItemType Directory -Force -Path $pdir | Out-Null }
    & $script:EraSavePng $sheet $Preview
    Write-Host "preview: $Preview"
}

if ($Credits) {
    foreach ($w in $written) { Write-Host "| pack/kubejs/assets/grindless/textures/$w | drawn procedurally by tools/assets/$ScriptName | ours |" }
}
