<#
.SYNOPSIS
  Procedural 16x16 pixel art for UV's accelerators (package UV-A5): the synchrotron, muon fusion cell and antimatter trap controller
  faces, and the 13 item icons of the LIGA, antiproton and muon fusion lines, of Gregtech Grindless.

.DESCRIPTION
  Every pixel is drawn by this script (palettes and small routines); nothing is copied or edited from GregTech Modern or any
  other mod. Output is deterministic. Same steel bezel as Build-UVThoriumTextures.ps1 and the same item method as
  Build-UVColdTextures.ps1.

  Writes (under pack/kubejs/assets/grindless/textures/):
    block/multiblock/synchrotron/overlay_front.png, overlay_front_active.png(+.mcmeta), overlay_front_active_emissive.png(+.mcmeta)
    block/multiblock/muon_fusion_cell/ the same three files
    block/multiblock/antimatter_trap/ the same three files
    item/<name>.png for the 13 items registered by startup_scripts/grindless/uv/accelerators.js

  Synchrotron face: a bezel round a square beam pipe; working (4 frames, frametime 4), three pale bunches circle it.
  Cell face: a bezel round a tank of liquid D-T; working, the liquid glows teal and violet muon sparks rise through it.
  Trap face: a bezel round a bore between two copper solenoid bars; working, a violet antiproton cloud shimmers in the bore.
  Every face has a green run lamp; the *_emissive layer holds only the glow and the lamp.

  Conventions: transparent background, outer 1 px ring empty, every pixel fully opaque or fully transparent, none pure black,
  emissive layer a subset of the colour layer, no two icons identical, every icon registered. The run fails otherwise.

  Run from the repo root:
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-UVAcceleratorsTextures.ps1

.PARAMETER OutRoot
  Textures root. Default: <repo>/pack/kubejs/assets/grindless/textures
.PARAMETER Credits
  Also print the CREDITS.md "Assets" table rows for the files written.
#>
[CmdletBinding()]
param(
    [string]$OutRoot = '',
    [switch]$Credits
)
$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'Pixel.Lib.ps1')
$EraName = 'uv'; . (Join-Path $PSScriptRoot 'Era.Lib.ps1')

$RepoRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..'))
if (-not $OutRoot) { $OutRoot = Join-Path $RepoRoot 'pack\kubejs\assets\grindless\textures' }
$OutRoot = [System.IO.Path]::GetFullPath($OutRoot)
$ScriptName = Split-Path -Leaf $PSCommandPath
$FrameTime = 4
$Frames = 4

$written = New-Object System.Collections.Generic.List[string]
function Out-Tex {
    param($Canvas, [string]$Rel, [int]$Time = 0)
    $path = Join-Path $OutRoot ($Rel -replace '/', '\')
    for ($try = 1; $try -le 6; $try++) {
        try { Save-Png $Canvas $path; if ($Time -gt 0) { Save-Mcmeta ($path + '.mcmeta') $Time }; break }
        catch [System.IO.IOException] { if ($try -eq 6) { throw }; Start-Sleep -Milliseconds (250 * $try) }
    }
    $written.Add($Rel)
    if ($Time -gt 0) { $written.Add($Rel + '.mcmeta') }
}

function Set-Both {
    param($C, $E, [int]$X, [int]$Y, [int]$Argb)
    Set-Px $C $X $Y $Argb; Set-Px $E $X $Y $Argb
}

# ---------------------------------------------------------------- controller faces

$Lit = Hex 'B0B0B0'; $Mid = Hex '707070'; $Dark = Hex '404040'; $Deep = Hex '222222'; $Pit = Hex '161616'
$LampOn = Hex '62FF86'; $LampOff = Hex '0C6B2E'

# Own controller faces (RF-6C): a 12x12 map inside a thin steel frame (x1..14, y1..14), the rest transparent.
# Map letters: L M D E steel, P pit, l run lamp, 0-9 glow cells of ramp 1, a-j glow cells of ramp 2 (the digit or letter is
# the cell's phase), any other letter is in the spec's Pal. A ramp is the idle colour, then four glow colours.
# Mode chase: the glow travels with the phase; twinkle: each phase flickers by itself; fill: cells light in phase order.
$OwnSteel = @{ L = (Hex 'B0B0B0'); M = (Hex '707070'); D = (Hex '404040'); E = (Hex '222222'); P = (Hex '161616') }
function New-OwnFace {
    param($Spec, [int]$Frame, [bool]$Active)
    if ($Spec.Map.Count -ne 12) { throw 'Own face map needs 12 rows' }
    $rows = @(('.' * 16), ('.' + ('L' * 13) + 'M.'))
    foreach ($m in $Spec.Map) { if ($m.Length -ne 12) { throw "Own face row '$m' is not 12 wide" }; $rows += ".L${m}E." }
    $rows += ('.M' + ('E' * 13) + '.'); $rows += ('.' * 16)
    $c = New-Canvas; $e = New-Canvas
    for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
        $ch = [string]$rows[$y][$x]
        if ($ch -eq '.') { continue }
        if ($ch -ceq 'l') {
            $v = $(if ($Active) { $LampOn } else { $LampOff }); Set-Px $c $x $y $v
            if ($Active) { Set-Px $e $x $y $v }
            continue
        }
        $ramp = $null; $d = 0
        if ($ch -cmatch '[0-9]') { $ramp = $Spec.Ramp; $d = [int]$ch }
        elseif ($ch -cmatch '[a-j]') { $ramp = $Spec.Ramp2; $d = [int][char]$ch - 97 }
        if ($ramp) {
            $k = -1
            if ($Active) {
                switch ($Spec.Mode) {
                    'chase' { $k = ($d + $Frame) % 4 }
                    'twinkle' { $k = (($d * 3 + $Frame * 2) % 5) - 1 }
                    'fill' { $t = 1 + 2 * $Frame; if ($d -le $t) { $k = [Math]::Max(0, 3 - ($t - $d)) } }
                }
            }
            if ($k -lt 0) { Set-Px $c $x $y $ramp[0] } else { Set-Both $c $e $x $y $ramp[$k + 1] }
            continue
        }
        if ($OwnSteel.ContainsKey($ch)) { Set-Px $c $x $y $OwnSteel[$ch] }
        elseif ($Spec.Pal -and $Spec.Pal.ContainsKey($ch)) { Set-Px $c $x $y $Spec.Pal[$ch] }
        else { throw "Own face: no colour for '$ch'" }
    } }
    return @{ C = $c; E = $e }
}

$Own = @{
    # the storage ring: a bunch circulates the racetrack past two rows of copper undulators
    synchrotron = @{ Mode = 'chase'; Pal = @{ k = (Hex 'B06A38'); q = (Hex '8A4E28') }
        Ramp = @((Hex '24303A'), (Hex '8AE4F5'), (Hex 'C0F0FF'), (Hex 'FFF2C0'), (Hex 'FFFFFF')); Ramp2 = @()
        Map = @('............', '..01230123..', '..3PPPPPP0..', '..2kqkqkq1..', '..1PDDDDP2..', '..0PDDDDP3..', '..3kqkqkq0..', '..2PPPPPP1..', '..10321032..', '............', '............', '.....ll.....') }
    # the muon cell: a tall tank, teal deuterium-tritium liquid below, violet muon sparks above
    muon_fusion_cell = @{ Mode = 'twinkle'; Pal = @{}
        Ramp = @((Hex '2A1A3A'), (Hex '8E3FD0'), (Hex 'B565F0'), (Hex 'C08AFF'), (Hex 'E3B8FF'))
        Ramp2 = @((Hex '1A3A34'), (Hex '2E9C88'), (Hex '4FC8B0'), (Hex '86E8D4'), (Hex 'C8FFF2'))
        Map = @('..MMMMMMMM..', '..D012340D..', '..D304120D..', '..DPPPPPPD..', '..DabababD..', '..DbababaD..', '..DabababD..', '..DbababaD..', '..DabababD..', '..MMMMMMMM..', '.MM......MM.', '.....ll.....') }
    # the trap: copper solenoids above and below confine a violet antiproton cloud
    antimatter_trap = @{ Mode = 'twinkle'; Pal = @{ k = (Hex 'B06A38'); q = (Hex '8A4E28') }
        Ramp = @(); Ramp2 = @((Hex '2A1A3A'), (Hex '8E3FD0'), (Hex 'B565F0'), (Hex 'D8A0FF'), (Hex 'E3B8FF'))
        Map = @('............', 'kqkqkqkqkqkq', 'qkqkqkqkqkqk', '............', '....bcdb....', '...bcdeab...', '..acdeabcd..', '..bdeabcde..', '...cdeabc...', 'kqkqkqkqkqkq', 'qkqkqkqkqkqk', '.....ll.....') }
}

function New-Face {
    param([string]$Kind, [int]$Frame, [bool]$Active)
    return New-OwnFace $Own[$Kind] $Frame $Active
}

$kinds = @(
    @{ Kind = 'synchrotron'; Dir = 'block/multiblock/synchrotron' },
    @{ Kind = 'muon_fusion_cell'; Dir = 'block/multiblock/muon_fusion_cell' },
    @{ Kind = 'antimatter_trap'; Dir = 'block/multiblock/antimatter_trap' }
)
foreach ($k in $kinds) {
    $idle = New-Face $k.Kind 0 $false
    Out-Tex $idle.C "$($k.Dir)/overlay_front.png"
    $col = @(); $emi = @()
    for ($f = 0; $f -lt $Frames; $f++) { $a = New-Face $k.Kind $f $true; $col += , $a.C; $emi += , $a.E }
    Out-Tex (Join-Frames $col) "$($k.Dir)/overlay_front_active.png" $FrameTime
    Out-Tex (Join-Frames $emi) "$($k.Dir)/overlay_front_active_emissive.png" $FrameTime
}

# ---------------------------------------------------------------- item icons

function Get-Noise {
    param([int]$X, [int]$Y, [int]$Salt)
    $v = [int64]($X * 73856093) -bxor [int64]($Y * 19349663) -bxor [int64]($Salt * 83492791)
    return [int]([Math]::Abs($v) % 1000)
}

# name -> kind, body colour, accent colour
$Items = [ordered]@{
    pmma_coated_wafer          = @('wafer', 'C8D8E8', 'F0F4FF')
    x_ray_mask                 = @('frame', 'B8C0C8', 'E8C040')
    exposed_wafer              = @('wafer', 'B0C0D8', '8070C0')
    patterned_wafer            = @('wafer', '9AA8C0', '40C0A0')
    photonic_chip              = @('chip', '506070', '60E0F0')
    silicon_nitride_film       = @('sheet', 'A0A8B8', 'C8D0D8')
    tungsten_target            = @('block', '6A7078', 'C87840')
    activated_tungsten_target  = @('block', '6A7078', '60E080')
    empty_antiproton_cartridge = @('capsule', '9098A8', '4A5060')
    empty_antiproton_trap      = @('module', '808C98', '3A4450')
    antiproton_trap            = @('module', '808C98', 'C060FF')
    ican_pellet                = @('orb', '70A060', 'E0F080')
    lithium_breeder_blanket    = @('sheet', 'C8C0D0', '8A7A9A')
}

function Get-Tone {
    param([int]$Argb, [int]$X, [int]$Y, [int]$Salt)
    $f = 1.2 - 0.035 * ($X + $Y)
    $n = Get-Noise $X $Y $Salt
    if ($n -lt 110) { $f *= 0.86 } elseif ($n -gt 900) { $f *= 1.14 }
    return (Shade $Argb $f)
}

function Test-Shape {
    param([string]$Kind, [int]$X, [int]$Y)
    $dx = $X - 7.5; $dy = $Y - 7.5
    $r = [Math]::Sqrt($dx * $dx + $dy * $dy)
    switch ($Kind) {
        'wafer'   { return ($r -le 6.2 -and -not ($Y -ge 13)) }
        'frame'   { return ($X -ge 2 -and $X -le 13 -and $Y -ge 2 -and $Y -le 13) }
        'chip'    { return (($X -ge 4 -and $X -le 11 -and $Y -ge 4 -and $Y -le 11) -or (($X -eq 2 -or $X -eq 13 -or $Y -eq 2 -or $Y -eq 13) -and ($X + $Y) % 2 -eq 0 -and $X -ge 2 -and $X -le 13 -and $Y -ge 2 -and $Y -le 13 -and -not (($X -eq 2 -or $X -eq 13) -and ($Y -eq 2 -or $Y -eq 13)))) }
        'sheet'   { return ($X -ge 2 -and $X -le 13 -and $Y -ge 4 -and $Y -le 11) }
        'block'   { return ($X -ge 3 -and $X -le 12 -and $Y -ge 3 -and $Y -le 12) }
        'orb'     { return ($r -le 4.2) }
        'module'  { return (($X -ge 1 -and $X -le 14 -and $Y -ge 4 -and $Y -le 11) -or (($Y -eq 3 -or $Y -eq 12) -and $X % 2 -eq 0 -and $X -ge 2 -and $X -le 13)) }
        'capsule' { return ($X -ge 5 -and $X -le 10 -and $Y -ge 2 -and $Y -le 13 -and -not (($Y -eq 2 -or $Y -eq 13) -and ($X -eq 5 -or $X -eq 10))) }
    }
    return $false
}

function Test-Accent {
    param([string]$Kind, [int]$X, [int]$Y, [int]$Salt)
    $dx = $X - 7.5; $dy = $Y - 7.5
    $r = [Math]::Sqrt($dx * $dx + $dy * $dy)
    $n = Get-Noise $X $Y ($Salt + 7)
    switch ($Kind) {
        'wafer'   { return ($r -lt 4.5 -and (($X % 3 -eq 0) -or ($Y % 3 -eq 0))) }
        'frame'   { return ($X -ge 5 -and $X -le 10 -and $Y -ge 5 -and $Y -le 10 -and ($X + $Y) % 3 -ne 0) }
        'chip'    { return ($X -ge 5 -and $X -le 10 -and $Y -ge 5 -and $Y -le 10 -and ($Y -eq 6 -or $Y -eq 9 -or $X -eq 7)) }
        'sheet'   { return (($X + $Y) % 4 -eq 0) }
        'block'   { return ($Y -ge 10 -or $n -gt 900) }
        'orb'     { return ($r -lt 1.8) }
        'module'  { return ($Y -ge 6 -and $Y -le 9 -and $X % 3 -ne 0) }
        'capsule' { return ($Y -ge 5 -and $Y -le 10) }
    }
    return $false
}

function New-Item16 {
    param([string]$Name, [string[]]$Spec)
    if (@('heap', 'orb', 'card', 'vial', 'spool', 'crystal', 'module', 'capsule', 'chip', 'sail', 'cup', 'cartridge') -contains $Spec[0] -and $Spec.Count -le 3) { return New-EraComponentBody $EraName $Spec[0] $Name (Hex $Spec[1]) (Hex $Spec[2]) }
    $c = New-Canvas 16 16
    $salt = 0; foreach ($ch in $Name.ToCharArray()) { $salt = ($salt * 31 + [int]$ch) % 9973 }
    $body = Hex $Spec[1]; $accent = Hex $Spec[2]
    for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
        if (-not (Test-Shape $Spec[0] $x $y)) { continue }
        $base = $body; if (Test-Accent $Spec[0] $x $y $salt) { $base = $accent }
        Set-Px $c $x $y (Get-Tone $base $x $y $salt)
    } }
    Add-Outline $c
    return $c
}

foreach ($n in $Items.Keys) { Out-Tex (New-Item16 $n $Items[$n]) "item/$n.png" }

# ---------------------------------------------------------------- self-check

$problems = New-Object System.Collections.Generic.List[string]
function Test-Pixels {
    param($Img, [string]$Name, [bool]$Ring)
    for ($y = 0; $y -lt $Img.H; $y++) {
        for ($x = 0; $x -lt $Img.W; $x++) {
            $v = $Img.P[$y * $Img.W + $x]; $a = ($v -shr 24) -band 255
            $edge = ((($x % 16) -eq 0) -or (($x % 16) -eq 15) -or (($y % 16) -eq 0) -or (($y % 16) -eq 15))
            if ($a -ne 0 -and $a -ne 255) { $problems.Add("${Name}: partial alpha at $x,$y") }
            if ($a -eq 255 -and ($v -band 0xFFFFFF) -eq 0) { $problems.Add("${Name}: pure black at $x,$y") }
            if ($Ring -and $edge -and $a -ne 0) { $problems.Add("${Name}: ring pixel at $x,$y") }
        }
    }
}
foreach ($k in $kinds) {
    $png = @{}
    foreach ($n in 'overlay_front', 'overlay_front_active', 'overlay_front_active_emissive') { $png[$n] = Read-Png (Join-Path $OutRoot ("$($k.Dir)/$n.png" -replace '/', '\')) }
    foreach ($n in $png.Keys) { Test-Pixels $png[$n] "$($k.Dir)/$n" $true }
    $col = $png['overlay_front_active']; $em = $png['overlay_front_active_emissive']
    for ($i = 0; $i -lt $col.P.Length; $i++) { if ($em.P[$i] -ne 0 -and $em.P[$i] -ne $col.P[$i]) { $problems.Add("$($k.Dir): emissive differs from colour at $i") } }
    for ($f = 0; $f -lt $Frames - 1; $f++) {
        $same = $true
        for ($i = 0; $i -lt 256; $i++) { if ($col.P[$f * 256 + $i] -ne $col.P[($f + 1) * 256 + $i]) { $same = $false; break } }
        if ($same) { $problems.Add("$($k.Dir): frame $f repeats frame $($f + 1)") }
    }
}
$keys = @{}
foreach ($n in $Items.Keys) {
    $img = Read-Png (Join-Path $OutRoot "item\$n.png")
    Test-Pixels $img "item/$n" $false
    $opaque = @($img.P | Where-Object { (($_ -shr 24) -band 255) -eq 255 }).Count
    if ((($img.P[0] -shr 24) -band 255) -ne 0) { $problems.Add("item/${n}: corner pixel is not transparent") }
    if ($opaque -lt 20) { $problems.Add("item/${n}: only $opaque opaque pixels") }
    $key = $img.P -join ','
    if ($keys.ContainsKey($key)) { $problems.Add("item/${n}: identical to $($keys[$key])") } else { $keys[$key] = $n }
}
$src = Get-Content -LiteralPath (Join-Path $RepoRoot 'pack\kubejs\startup_scripts\grindless\uv\accelerators.js') -Raw
foreach ($n in $Items.Keys) { if ($src -notmatch "(?m)^\s+$n\s*:\s*\{") { $problems.Add("item/${n}: drawn here but not registered by uv/accelerators.js") } }
if ($problems.Count -gt 0) { $problems | Select-Object -First 20 | ForEach-Object { Write-Error $_ -ErrorAction Continue }; exit 1 }

Write-Host "$ScriptName wrote $($written.Count) files"
if ($Credits) {
    foreach ($w in $written) { Write-Host "| pack/kubejs/assets/grindless/textures/$w | drawn procedurally by tools/assets/$ScriptName | ours |" }
}
