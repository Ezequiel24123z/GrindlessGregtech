<#
.SYNOPSIS
  Procedural 16x16 pixel art for the foundations of the MAX era of Gregtech Grindless (package MAX-F1, shared registrations):
  every item that startup_scripts/grindless/max/foundation.js registers and the seven block textures (GregTech style: top-left light,
  3-4 tones per material, selective outlines).

.DESCRIPTION
  Every pixel is drawn by this script (the shape routines of the OpV foundation script); nothing is copied or edited from GregTech Modern,
  GCYR, Monifactory or any other mod. The item list is read from foundation.js (the ITEMS block), so adding an item there needs no table
  here: the shape comes from the last words of the name (a wafer is a card, a powder a heap, a boule a crystal...) and the body and accent
  colours from a hash of the name. Output is deterministic: re-running overwrites the same bytes (mottles come from Get-Noise, a hash of
  the position, not from a random generator). The materials need no PNG (GregTech draws them from their colour).

  Writes (under pack/kubejs/assets/grindless/textures/):
      item/<name>.png for every item in foundation.js.
      block/max/<name>.png for the seven blocks: max_optical_table_casing, membrane_roller_casing, geroch_drum_casing, stream_turn_casing,
      mirror_shell_segment, stream_bundle_block, feeder_coil_casing; seamless.

  Run from the repo root:
      powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-MaxFoundationTextures.ps1
      powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-MaxFoundationTextures.ps1 -Only max_sensor,geroch_drum_casing -Credits

  Every pixel is fully opaque or fully transparent and none is pure black; the block textures have all 256 pixels opaque and the item
  icons have a transparent corner and at least 20 opaque pixels. The final check fails the run (non-zero exit) if a written file breaks
  one of these rules, if two textures are identical, or if the set of outputs differs from the items and blocks that foundation.js
  registers.

.PARAMETER Only
  Subset of output names or groups: items, blocks (comma-separated, also as one string with -File).
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

$RepoRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..'))
if (-not $OutRoot) { $OutRoot = Join-Path $RepoRoot 'pack\kubejs\assets\grindless\textures' }
$OutRoot = [System.IO.Path]::GetFullPath($OutRoot)
$ScriptName = Split-Path -Leaf $PSCommandPath
$OnlySet = @(); foreach ($o in $Only) { $OnlySet += ($o -split ',') | Where-Object { $_ } }
$FoundationJs = Join-Path $RepoRoot 'pack\kubejs\startup_scripts\grindless\max\foundation.js'

function Get-Noise {
    param([int]$X, [int]$Y, [int]$Salt)
    $v = [int64]($X * 73856093) -bxor [int64]($Y * 19349663) -bxor [int64]($Salt * 83492791)
    return [int]([Math]::Abs($v) % 1000)
}

function Get-Salt {
    param([string]$Name)
    $salt = 0; foreach ($ch in $Name.ToCharArray()) { $salt = ($salt * 31 + [int]$ch) % 9973 }
    return $salt
}

# last word (or first matching word) of the name -> shape
$KindOf = @{
    card = 'wafer film plate foil tape strip panel ribbon web slab tile'
    heap = 'powder soot sponge slag residue waste concentrate mix scrap fraction'
    crystal = 'boule crystal ingot billet bloom seed isotope tetrataenite'
    orb = 'pellet atom core spheres droplet mirror'
    chip = 'die chip lna'
    cartridge = 'cartridge canister blank target'
    vial = 'cell recipient pool culture capsule'
    spool = 'coil ring winding rotor bearing toroid pump magnet'
    capsule = 'fibre tow strand tube rod braid sleeve glass'
    module = 'module array interposer controller modulator mixer coupler valve node library archive ark payload truss cavity lens'
    sail = 'belt mesh stack laminate liner'
    assembly = 'harness radiator nozzle former imager tether drive probe unit'
}
$KindTable = @{}
foreach ($k in $KindOf.Keys) { foreach ($w in ($KindOf[$k] -split ' ')) { $KindTable[$w] = $k } }
$KindList = @('card', 'heap', 'crystal', 'orb', 'chip', 'cartridge', 'vial', 'spool', 'capsule', 'module', 'sail', 'assembly')

function Get-ItemSpec {
    param([string]$Name)
    $salt = Get-Salt $Name
    $kind = $null
    $words = $Name.Split('_')
    for ($i = $words.Count - 1; $i -ge 0; $i--) { if ($KindTable.ContainsKey($words[$i])) { $kind = $KindTable[$words[$i]]; break } }
    if (-not $kind) { $kind = $KindList[$salt % $KindList.Count] }
    $r = 50 + ($salt * 7) % 100; $g = 50 + ($salt * 13) % 100; $b = 50 + ($salt * 29) % 100
    $ar = [Math]::Min(255, $g + 110); $ag = [Math]::Min(255, $b + 110); $ab = [Math]::Min(255, $r + 110)
    return @($kind, ('{0:X2}{1:X2}{2:X2}' -f $r, $g, $b), ('{0:X2}{1:X2}{2:X2}' -f $ar, $ag, $ab))
}

function Get-Tone {
    param([int]$Argb, [int]$X, [int]$Y, [int]$Salt)
    $f = 1.2 - 0.035 * ($X + $Y)
    $n = Get-Noise $X $Y $Salt
    if ($n -lt 110) { $f *= 0.86 } elseif ($n -gt 900) { $f *= 1.14 }
    return (Shade $Argb $f)
}

function Test-Shape {
    param([string]$Kind, [int]$X, [int]$Y, [int]$Salt)
    $dx = $X - 7.5; $dy = $Y - 7.5
    $r = [Math]::Sqrt($dx * $dx + $dy * $dy)
    switch ($Kind) {
        'heap'     { $h = 9 - [Math]::Abs($dx) * 1.1; return ($Y -ge 14 - $h -and $Y -le 14 -and $h -gt 0) }
        'orb'      { return ($r -le 6.2) }
        'card'     { return ($X -ge 2 -and $X -le 13 -and $Y -ge 2 -and $Y -le 13) }
        'vial'     { return (($X -ge 6 -and $X -le 9 -and $Y -ge 1 -and $Y -le 4) -or ($X -ge 4 -and $X -le 11 -and $Y -ge 5 -and $Y -le 14)) }
        'cartridge' { return ($X -ge 1 -and $X -le 14 -and $Y -ge 3 -and $Y -le 12) }
        'spool'    { return ($r -le 6.4 -and $r -ge 1.8) }
        'crystal'  { return ([Math]::Abs($dx) + [Math]::Abs($dy) -le 7.2) }
        'module'   { return (($X -ge 1 -and $X -le 14 -and $Y -ge 4 -and $Y -le 11) -or (($Y -eq 3 -or $Y -eq 12) -and $X % 2 -eq 0 -and $X -ge 2 -and $X -le 13)) }
        'capsule'  { return ($X -ge 5 -and $X -le 10 -and $Y -ge 2 -and $Y -le 13 -and -not (($Y -eq 2 -or $Y -eq 13) -and ($X -eq 5 -or $X -eq 10))) }
        'chip'     { return (($X -ge 3 -and $X -le 12 -and $Y -ge 3 -and $Y -le 12) -or (($X -eq 1 -or $X -eq 2 -or $X -eq 13 -or $X -eq 14) -and $Y -ge 4 -and $Y -le 11 -and $Y % 2 -eq 0)) }
        'sail'     { return ($X -ge 1 -and $Y -ge 1 -and $Y -le 14 -and $X -le 1 + $Y -and ($X -eq 1 -or $X -le 14)) }
        'assembly' { return ($X -ge 3 -and $X -le 12 -and $Y -ge 0 -and $Y -le 15) }
    }
    return $false
}

function Test-Accent {
    param([string]$Kind, [int]$X, [int]$Y, [int]$Salt)
    $dx = $X - 7.5; $dy = $Y - 7.5
    $r = [Math]::Sqrt($dx * $dx + $dy * $dy)
    $n = Get-Noise $X $Y ($Salt + 7)
    switch ($Kind) {
        'heap'      { return ($n -gt 820) }
        'orb'       { return ($Y -eq 7 -or $Y -eq 8 -or $r -lt 2) }
        'card'      { return ($Y % 3 -eq 1 -and $X -ge 4 -and $X -le 11 -and $X % 4 -ne 0) }
        'vial'      { return ($Y -le 4 -or $Y -ge 9) }
        'cartridge' { return ($Y -ge 5 -and $Y -le 10 -and ($X % 5) -ge 1 -and ($X % 5) -le 3) }
        'spool'     { return (($X + $Y) % 4 -eq 0) }
        'crystal'   { return ($X -ge 8 -and $Y -ge 8) }
        'module'    { return ($Y -ge 6 -and $Y -le 9 -and $X % 3 -ne 0) }
        'capsule'   { return ($Y -ge 5 -and $Y -le 10) }
        'chip'      { return ($X -ge 5 -and $X -le 10 -and $Y -ge 5 -and $Y -le 10 -and ($X + $Y) % 2 -eq 0) }
        'sail'      { return (($X - $Y + 16) % 4 -eq 0) }
        'assembly'  { return ($X % 3 -eq 0 -and $Y -ge 2 -and $Y -le 13) }
    }
    return $false
}

function New-Item16 {
    param([string]$Name, [string[]]$Spec)
    $c = New-Canvas 16 16
    $salt = Get-Salt $Name
    $body = Hex $Spec[1]; $accent = Hex $Spec[2]
    for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
        if (-not (Test-Shape $Spec[0] $x $y $salt)) { continue }
        $base = $body; if (Test-Accent $Spec[0] $x $y $salt) { $base = $accent }
        Set-Px $c $x $y (Get-Tone $base $x $y $salt)
    } }
    Add-Outline $c
    return $c
}

$Blocks = @('max_optical_table_casing', 'membrane_roller_casing', 'geroch_drum_casing', 'stream_turn_casing', 'mirror_shell_segment', 'stream_bundle_block', 'feeder_coil_casing')

function New-Block16 {
    param([string]$Name)
    $c = New-Canvas 16 16
    switch ($Name) {
        'max_optical_table_casing' {
            # damped steel slab with a grid of tapped holes
            $slab = Hex '6A7078'; $hole = Hex '2E3238'; $edge = Hex '3A3E46'
            for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
                $col = Get-Tone $slab $x $y 711
                if ($x % 4 -eq 2 -and $y % 4 -eq 2) { $col = $hole }
                if ($x -eq 0 -or $y -eq 0 -or $x -eq 15 -or $y -eq 15) { $col = $edge }
                Set-Px $c $x $y $col
            } }
        }
        'membrane_roller_casing' {
            # grey plate with a horizontal roller and a pale membrane seam
            $plate = Hex '5A6068'; $roller = Hex '8A9098'; $seam = Hex 'E0E8F0'; $edge = Hex '30343C'
            for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
                $col = Get-Tone $plate $x $y 712
                if ($y -ge 5 -and $y -le 10) { $col = Get-Tone $roller $x $y 713 }
                if ($y -eq 7 -or $y -eq 8) { $col = Shade $seam (1.0 - 0.02 * $x) }
                if ($x -eq 0 -or $y -eq 0 -or $x -eq 15 -or $y -eq 15) { $col = $edge }
                Set-Px $c $x $y $col
            } }
        }
        'geroch_drum_casing' {
            # dark drum staves with brass bands
            $stave = Hex '40444C'; $band = Hex 'B89048'; $edge = Hex '24262C'
            for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
                $col = Get-Tone $stave $x $y 714
                if ($x % 4 -eq 0) { $col = Shade $stave 0.7 }
                if ($y -eq 3 -or $y -eq 4 -or $y -eq 11 -or $y -eq 12) { $col = Shade $band (1.1 - 0.02 * $x) }
                if ($x -eq 0 -or $y -eq 0 -or $x -eq 15 -or $y -eq 15) { $col = $edge }
                Set-Px $c $x $y $col
            } }
        }
        'stream_turn_casing' {
            # blue-grey plate with a curved bright channel
            $plate = Hex '4A5870'; $chan = Hex '90D8FF'; $edge = Hex '2A3244'
            for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
                $col = Get-Tone $plate $x $y 715
                $d = [Math]::Abs([Math]::Sqrt(($x - 15) * ($x - 15) + ($y - 15) * ($y - 15)) - 9)
                if ($d -lt 1.2) { $col = Shade $chan (1.0 - 0.03 * $d) }
                if ($x -eq 0 -or $y -eq 0 -or $x -eq 15 -or $y -eq 15) { $col = $edge }
                Set-Px $c $x $y $col
            } }
        }
        'mirror_shell_segment' {
            # polished hexagonal mirror facets
            $mirror = Hex 'B8C4D0'; $gap = Hex '4A5460'; $edge = Hex '38404A'
            for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
                $col = Get-Tone $mirror $x $y 716
                $fx = ($x + (($y -shr 3) * 4)) % 8
                if ($fx -eq 0 -or $y % 8 -eq 0) { $col = $gap }
                if ($x -eq 0 -or $y -eq 0 -or $x -eq 15 -or $y -eq 15) { $col = $edge }
                Set-Px $c $x $y $col
            } }
        }
        'stream_bundle_block' {
            # parallel pale streams in a dark housing
            $house = Hex '2E3848'; $stream = Hex 'A0E8F8'; $edge = Hex '1C2230'
            for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
                $col = Get-Tone $house $x $y 717
                if ($x % 3 -eq 1 -and $x -ge 2 -and $x -le 13) { $col = Shade $stream (0.8 + 0.01 * (($y * 7 + $x) % 20)) }
                if ($x -eq 0 -or $y -eq 0 -or $x -eq 15 -or $y -eq 15) { $col = $edge }
                Set-Px $c $x $y $col
            } }
        }
        'feeder_coil_casing' {
            # copper-red feeder windings on a grey core
            $core = Hex '585C64'; $wind = Hex 'C06838'; $edge = Hex '2C2E34'
            for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
                $col = Get-Tone $core $x $y 718
                if ($y % 3 -ne 0 -and $x -ge 2 -and $x -le 13) { $col = Get-Tone $wind $x $y 719 }
                if ($x -eq 0 -or $y -eq 0 -or $x -eq 15 -or $y -eq 15) { $col = $edge }
                Set-Px $c $x $y $col
            } }
        }
    }
    return $c
}

$src = Get-Content -LiteralPath $FoundationJs -Raw
$reg = [regex]::Match($src, '(?s)const ITEMS = \{(.*?)\n  \}').Groups[1].Value
$ItemNames = @(); foreach ($m in [regex]::Matches($reg, '(?m)^\s+([a-z0-9_]+)\s*:')) { $ItemNames += $m.Groups[1].Value }

$Outputs = [ordered]@{}
foreach ($n in $ItemNames) { $Outputs[$n] = [pscustomobject]@{ Rel = "item/$n.png"; Group = 'items' } }
foreach ($n in $Blocks) { $Outputs[$n] = [pscustomobject]@{ Rel = "block/max/$n.png"; Group = 'blocks' } }

$written = @()
foreach ($n in $Outputs.Keys) {
    $o = $Outputs[$n]
    if ($OnlySet.Count -gt 0 -and $OnlySet -notcontains $n -and $OnlySet -notcontains $o.Group) { continue }
    if ($o.Group -eq 'items') { $c = New-Item16 $n (Get-ItemSpec $n) } else { $c = New-Block16 $n }
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
        if ($a -ne 0 -and $a -ne 255) { Add-Problem $rel 'partial alpha' ; break }
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
    foreach ($b in $Blocks) { if ($src -notmatch "grindless:block/max/${b}'") { Add-Problem $b 'block texture not referenced by foundation.js' } }
    $regBlocks = [regex]::Match($src, '(?s)const BLOCKS = \{(.*?)\n  \}').Groups[1].Value
    foreach ($m in [regex]::Matches($regBlocks, '(?m)^\s+([a-z0-9_]+)\s*:')) { if ($Blocks -notcontains $m.Groups[1].Value) { Add-Problem $m.Groups[1].Value 'registered by foundation.js but not drawn here' } }
}
if ($problems -gt 0) { throw "$problems problem(s) in the texture checks (see the warnings above)" }
Write-Host "wrote $($written.Count) textures to $OutRoot"

if ($Credits) {
    Write-Host ''
    foreach ($rel in $written) {
        Write-Host ("| ``pack/kubejs/assets/grindless/textures/$rel`` | Generated with tools/assets/$ScriptName (procedural pixel art, original) by the assets agent (MAX-F1) | the pack's licence (pending; proposed CC BY-SA 4.0) |")
    }
}
