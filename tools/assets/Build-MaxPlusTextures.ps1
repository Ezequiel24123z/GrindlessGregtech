<#
.SYNOPSIS
  Procedural 16x16 pixel art for the MAX+ era of Gregtech Grindless (package XP-V1): every item and the twelve casings that
  startup_scripts/grindless/maxplus/foundation.js registers, in the MAX+ era style of Era.Lib.ps1.

.DESCRIPTION
  Every pixel is drawn by this script and the shared component body of Era.Lib.ps1 (shape, ramp, accent); nothing is copied or edited
  from GregTech Modern, GCYR, Monifactory or any other mod. The item lists are read from foundation.js (COMPONENTS, LINE_ITEMS, CIRCUITS,
  UNIQUE and STANDINS, and the BLOCKS casings), so a new item there needs no table here: the body kind comes from the words of the
  name (a wafer is a card, a dust a heap, an ingot a bar, a cell a vial, a core an orb...), the colours from a hue band per material
  family and a hash of the name. The MAX+ style (fiction: kerr condensate, bound matter, the stationary horizon) gives every texture
  a violet-black body, a lens-rounded silhouette, a hot amber halo on the lit rim, ember motes and one orbiting bead.
  Output is deterministic: re-running overwrites the same bytes. GTM materials and fluids need no PNG (GregTech draws them from their
  colour). Controllers' faces and overlays are a later part.

  Writes (under pack/kubejs/assets/grindless/textures/):
      item/<name>.png for every item foundation.js registers (including horizon_frame_part).
      block/maxplus/<name>.png for the twelve casings; seamless.

  Run from the repo root:
      powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-MaxPlusTextures.ps1
      powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-MaxPlusTextures.ps1 -Only maxplus_sensor,bound_press_casing -Credits
      powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-MaxPlusTextures.ps1 -Preview C:\temp\maxplus-preview.png

  Every pixel is fully opaque or fully transparent and none is pure black; the block textures have all 256 pixels opaque and the item
  icons have a transparent corner and at least 20 opaque pixels. The final check fails the run (non-zero exit) if a written file breaks
  one of these rules, if two textures are identical, or if the set of outputs differs from what foundation.js registers.

.PARAMETER Only
  Subset of output names or groups: items, blocks (comma-separated, also as one string with -File).
.PARAMETER OutRoot
  Textures root. Default: <repo>/pack/kubejs/assets/grindless/textures
.PARAMETER Credits
  Also print the CREDITS.md "Assets" table rows for the files written.
.PARAMETER Preview
  Write a review sheet (every written texture at x4) to this PNG path, which must be outside the repository (never published).
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
$FoundationJs = Join-Path $RepoRoot 'pack\kubejs\startup_scripts\grindless\maxplus\foundation.js'
if ($Preview) {
    $Preview = $ExecutionContext.SessionState.Path.GetUnresolvedProviderPathFromPSPath($Preview)
    if ($Preview.StartsWith($RepoRoot.TrimEnd('\') + '\', [System.StringComparison]::OrdinalIgnoreCase)) {
        throw "-Preview must point outside the repository (the review sheet is never shipped): $Preview"
    }
}

# ---- item kinds: the last word of the name that matches wins; the shared body kinds are those of Era.Lib.ps1 (Test-EraBodyShape)
$ComponentKind = @{
    maxplus_electric_motor = 'spool'; maxplus_electric_pump = 'vial'; maxplus_electric_piston = 'capsule'; maxplus_robot_arm = 'sail'
    maxplus_emitter = 'cup'; maxplus_sensor = 'orb'; maxplus_field_generator = 'crystal'; maxplus_conveyor_module = 'module'
    maxplus_fluid_regulator = 'cartridge'
}
$KindOf = @{
    card      = 'plate sheet slab tile laminate laminated holo foil layer'
    heap      = 'powder dust ash concentrate pebbles residue boil_off'
    crystal   = 'billet boule crystal seed lattice compact diamond'
    module    = 'ingot'
    orb       = 'sphere core cage atom'
    chip      = 'die circuit processor coprocessor qpu'
    cartridge = 'cask packet slug stack cartridge reference'
    vial      = 'cell reservoir dewar recipient oxide hydroxide chloride'
    spool     = 'coil toroid winding rotor ring hoop disc fcl'
    capsule   = 'wire ribbon strand fibre braid sleeve tape tube conduit waveguide probe pair truss part frame'
    sail      = 'mesh web blade belt liner window'
    cup       = 'cavity chamber flange nozzle former'
}
$KindTable = @{}
foreach ($k in $KindOf.Keys) { foreach ($w in ($KindOf[$k] -split ' ')) { $KindTable[$w] = $k } }
# wafers are discs: the card body; a die is a chip; a billet a crystal; everything else falls through the table above
$KindList = @('module', 'cartridge', 'orb', 'cup', 'chip', 'spool')

# hue bands (degrees) by material family; the default band is the violet of the kerr condensate
$FamilyHue = @(
    @('ni56|nickel|ni_', 150), @('caesium|cesium|six_n', 48), @('quartz|silicon|si28|sic_|sapphire', 190), @('neutronium|degenerate|compressed', 300),
    @('^be_|beryllium', 95), @('gd_|hfb2|absorber', 120), @('mo_|molybdenum', 215), @('he4|helium|superfluid|cold_', 200),
    @('strange|strangelet', 340), @('co56|fe16|fe_ln|fe56', 15), @('pmn|nv_|diamond|gan_|inp_|ln_', 170)
)

function Get-ItemSpec {
    param([string]$Name)
    $salt = Get-EraHash $Name
    if ($ComponentKind.ContainsKey($Name)) { $kind = $ComponentKind[$Name] }
    elseif ($Name -eq 'horizon_processor') { $kind = 'chip' }
    elseif ($Name -match '_wafer$') { $kind = 'card' }
    else {
        $kind = $null
        $words = $Name.Split('_')
        for ($i = $words.Count - 1; $i -ge 0; $i--) { if ($KindTable.ContainsKey($words[$i])) { $kind = $KindTable[$words[$i]]; break } }
        if (-not $kind -and $Name -match 'boil_off') { $kind = 'heap' }
        if (-not $kind) { $kind = $KindList[$salt % $KindList.Count] }
    }
    $hue = 250 + ($salt % 50)
    foreach ($f in $FamilyHue) { if ($Name -match $f[0]) { $hue = $f[1] + ($salt % 18) - 9; break } }
    if ($Name -like 'maxplus_*' -or $Name -eq 'horizon_processor') { $hue = 262 + ($salt % 22) }
    $lum = 0.30 + (($salt -shr 3) % 9) / 100.0
    $body = ConvertFrom-EraHsl $hue 0.46 $lum
    $accent = ConvertFrom-EraHsl (196 + ($salt % 22)) 0.70 0.60
    if (($salt % 3) -eq 0) { $accent = ConvertFrom-EraHsl (28 + ($salt % 22)) 0.88 0.58 }
    return @($kind, $body, $accent)
}

function New-Item16 {
    param([string]$Name)
    $s = Get-ItemSpec $Name
    return (New-EraComponentBody 'maxplus' $s[0] $Name $s[1] $s[2] -Carve)
}

# ---- casings: dark horizon-grade plates, each with one clear motif (the style adds rim halo, motes and seams at save time)
$Blocks = @('horizon_machine_casing', 'condensate_vessel_casing', 'bound_press_casing', 'slingshot_coil_casing', 'lift_nozzle_casing', 'crucible_liner_casing',
    'bound_lattice_casing', 'kerr_coil_casing', 'fe56_shield_casing', 'primordial_cryostat_casing', 'void_diamond_window', 'horizon_gate_casing')

function New-Block16 {
    param([string]$Name)
    $c = New-Canvas 16 16
    $seed = Get-EraHash $Name
    $void = Hex '221C38'; $violet = Hex '4A3C78'; $amber = Hex 'E89838'; $ice = Hex '8AB8F0'; $steel = Hex '55506A'
    for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
        $n = Get-EraNoise $x $y $seed
        $base = $void
        $t = 1.12 - 0.028 * ($x + $y)
        switch ($Name) {
            'horizon_machine_casing' {
                # void plate; an amber accretion ring around a dark centre
                $r = [Math]::Sqrt(($x - 7.5) * ($x - 7.5) + ($y - 7.5) * ($y - 7.5))
                if ($r -ge 4.0 -and $r -lt 5.2) { $base = $amber; $t = 1.0 - 0.05 * [Math]::Abs($r - 4.6) * 4 + 0.02 * (7 - $x) }
                elseif ($r -lt 4.0) { $base = Hex '120E22' }
                else { $base = $void }
            }
            'condensate_vessel_casing' {
                # violet vessel plating with horizontal ribs and an ice-blue condensate seam
                $base = $violet
                if ($y % 5 -eq 0) { $base = $void }
                if ($y -eq 7 -or $y -eq 8) { $base = $ice; $t = 1.0 }
            }
            'bound_press_casing' {
                # heavy steel slab, a bolt in every corner and a crossed-bond groove
                $base = $steel
                if ($x -eq $y -or $x + $y -eq 15) { $base = $void }
                if (($x -eq 2 -or $x -eq 13) -and ($y -eq 2 -or $y -eq 13)) { $base = $amber }
            }
            'slingshot_coil_casing' {
                # amber windings around a violet core, one turn per two rows
                $base = $violet
                if (($y % 4) -lt 2 -and $x -ge 2 -and $x -le 13) { $base = $amber; $t = 1.05 - 0.03 * ($y % 4) - 0.02 * $x / 4.0 }
            }
            'lift_nozzle_casing' {
                # converging chevrons pointing up, ice-lit
                $base = $steel
                $d = [Math]::Abs($x - 7.5)
                if ((($y + [int][Math]::Floor($d)) % 5) -eq 0) { $base = $ice; $t = 1.0 }
                elseif ((($y + [int][Math]::Floor($d)) % 5) -eq 1) { $base = $void }
            }
            'crucible_liner_casing' {
                # scorched liner bricks with a hot amber crack
                $base = $steel
                if ($y % 4 -eq 0 -or (($x + (($y -shr 2) % 2) * 4) % 8) -eq 0) { $base = $void }
                if ($n -gt 930) { $base = $amber; $t = 1.0 }
            }
            'bound_lattice_casing' {
                # near-black hexagonal lattice, condensate-blue lines
                $base = Hex '1A1630'
                $hx = ($x + (($y -shr 1) % 2) * 2) % 4
                if ($hx -eq 0 -or ($y % 4) -eq 3) { $base = $ice; $t = 0.85 }
            }
            'kerr_coil_casing' {
                # helical pale-gold bands, slanted, round a dark core; passive, no lit state
                $base = $void
                $gold = Hex 'E6D08A'
                if ((($x + $y) % 6) -lt 2 -and $x -ge 1 -and $x -le 14) { $base = $gold; $t = 1.0 - 0.02 * ($y % 6) }
            }
            'fe56_shield_casing' {
                # cold grey slabs with a violet seam
                $base = Hex '8890A0'
                if ($y % 8 -eq 0 -or $x % 8 -eq 0) { $base = $void }
                if ($y -eq 4 -or $y -eq 12) { $base = Hex '7A5CC8'; $t = 1.0 }
            }
            'primordial_cryostat_casing' {
                # frosted pale blue panels, bolted, with frost speckle
                $base = Hex 'B8D8F0'
                if ($x % 8 -eq 0 -or $y % 8 -eq 0) { $base = $steel }
                if ($n -gt 840) { $base = Hex 'EAF6FF'; $t = 1.0 }
            }
            'void_diamond_window' {
                # clear lilac-white pane in a steel frame, one diagonal glint
                $base = Hex 'E4DCF4'
                if ($x -lt 2 -or $x -gt 13 -or $y -lt 2 -or $y -gt 13) { $base = $steel }
                elseif ($x + $y -eq 11 -or $x + $y -eq 12) { $base = Hex 'FFFFFF'; $t = 1.0 }
            }
            'horizon_gate_casing' {
                # dark plate, gold-white chevron arcs, violet edge
                $base = $void
                $d = [Math]::Abs($x - 7.5)
                if ((($y - [int][Math]::Floor($d)) % 5 + 5) % 5 -eq 0 -and $y -ge 2 -and $y -le 13) { $base = Hex 'F4E6B0'; $t = 1.0 }
                if ($x -eq 0 -or $x -eq 15 -or $y -eq 0 -or $y -eq 15) { $base = Hex '7A5CC8'; $t = 1.0 }
            }
        }
        if ($n -lt 110) { $t *= 0.86 } elseif ($n -gt 900) { $t *= 1.12 }
        Set-Px $c $x $y (EraShade $base $t)
    } }
    return $c
}

$src = Get-Content -LiteralPath $FoundationJs -Raw
function Get-JsList {
    param([string]$Var)
    $m = [regex]::Match($src, "var $Var = \[(.*?)\]", 'Singleline')
    if (-not $m.Success) { throw "foundation.js: array $Var not found" }
    return @([regex]::Matches($m.Groups[1].Value, "'([a-z0-9_]+)'") | ForEach-Object { $_.Groups[1].Value })
}
$ItemNames = @()
$ItemNames += Get-JsList 'COMPONENTS'
$ItemNames += Get-JsList 'UNIQUE'
$ItemNames += Get-JsList 'CIRCUITS'
$ItemNames += Get-JsList 'STANDINS'
$lm = [regex]::Match($src, "var LINE_ITEMS = \((.*?)\)\.split", 'Singleline')
if (-not $lm.Success) { throw 'foundation.js: LINE_ITEMS not found' }
$ItemNames += (([regex]::Matches($lm.Groups[1].Value, "'([^']*)'") | ForEach-Object { $_.Groups[1].Value }) -join '').Split(' ', [StringSplitOptions]::RemoveEmptyEntries)
$ItemNames = @($ItemNames | Select-Object -Unique)

$Outputs = [ordered]@{}
foreach ($n in $ItemNames) { $Outputs[$n] = [pscustomobject]@{ Rel = "item/$n.png"; Group = 'items' } }
foreach ($n in $Blocks) { $Outputs[$n] = [pscustomobject]@{ Rel = "block/maxplus/$n.png"; Group = 'blocks' } }

$written = @()
foreach ($n in $Outputs.Keys) {
    $o = $Outputs[$n]
    if ($OnlySet.Count -gt 0 -and $OnlySet -notcontains $n -and $OnlySet -notcontains $o.Group) { continue }
    if ($o.Group -eq 'items') { $c = New-Item16 $n } else { $c = New-Block16 $n }
    Save-Png $c (Join-Path $OutRoot $o.Rel)
    $written += $o.Rel
}

$problems = 0
function Add-Problem { param([string]$Name, [string]$Msg) $script:problems++; Write-Warning "$Name`: $Msg" }
$keys = @{}
foreach ($rel in $written) {
    $img = Read-Png (Join-Path $OutRoot $rel)
    $opaque = 0; $black = 0
    foreach ($p in $img.P) {
        $a = ($p -shr 24) -band 255
        if ($a -ne 0 -and $a -ne 255) { Add-Problem $rel 'partial alpha'; break }
        if ($a -eq 255) { $opaque++; if (($p -band 0xFFFFFF) -eq 0) { $black++ } }
    }
    if ($black -gt 0) { Add-Problem $rel "$black pure black pixel(s)" }
    if ($rel.StartsWith('block/')) { if ($opaque -ne 256) { Add-Problem $rel 'block must be fully opaque' } }
    else {
        if ((($img.P[0] -shr 24) -band 255) -ne 0) { Add-Problem $rel 'corner pixel is not transparent' }
        if ($opaque -lt 20) { Add-Problem $rel "only $opaque opaque pixels" }
    }
    $k = $img.P -join ','
    if ($keys.ContainsKey($k)) { Add-Problem $rel "identical to $($keys[$k])" } else { $keys[$k] = $rel }
}
if ($OnlySet.Count -eq 0) {
    foreach ($b in $Blocks) { if ($src -notmatch "'$b'") { Add-Problem $b 'casing drawn here but not registered by foundation.js' } }
    $bm = [regex]::Match($src, "var BLOCKS = \{\};?\s*;?\[(.*?)\]", 'Singleline')
    if ($bm.Success) { foreach ($m in [regex]::Matches($bm.Groups[1].Value, "'([a-z0-9_]+)'")) { if ($Blocks -notcontains $m.Groups[1].Value) { Add-Problem $m.Groups[1].Value 'registered by foundation.js but not drawn here' } } }
    else { Add-Problem 'BLOCKS' 'casing list not found in foundation.js' }
}
if ($problems -gt 0) { throw "$problems problem(s) in the texture checks (see the warnings above)" }
Write-Host "wrote $($written.Count) textures to $OutRoot"

if ($Preview -and $written.Count -gt 0) {
    $k = 4; $cell = 16 * $k + 6; $cols = 24
    $rows = [int][Math]::Ceiling($written.Count / $cols)
    $sheet = New-Canvas ($cols * $cell + 6) ($rows * $cell + 6)
    $bg = Hex '2A2D33'
    for ($i = 0; $i -lt $sheet.P.Length; $i++) { $sheet.P[$i] = $bg }
    $i = 0
    foreach ($rel in $written) {
        $img = Read-Png (Join-Path $OutRoot $rel)
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
    Write-Host ''
    foreach ($rel in $written) {
        Write-Host ("| ``pack/kubejs/assets/grindless/textures/$rel`` | Generated with tools/assets/$ScriptName (procedural pixel art, original) by the assets agent (XP-V1) | the pack's licence (MIT) |")
    }
}
