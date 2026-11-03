<#
.SYNOPSIS
  Procedural 16x16 pixel art for the UV pyroprocessing cell and accelerator-driven reactor controller faces, and the uranium-233 fuel rod item, of Gregtech Grindless.

.DESCRIPTION
  Every pixel is drawn by this script (palettes and small routines); nothing is copied or edited from GregTech Modern or any
  other mod. Output is deterministic. Same method and steel bezel as the earlier sets (Build-ZPMNaquadriaTextures.ps1).

  Writes (under pack/kubejs/assets/grindless/textures/):
    block/multiblock/pyroprocessing_cell/overlay_front.png, overlay_front_active.png(+.mcmeta), overlay_front_active_emissive.png(+.mcmeta)
    block/multiblock/accelerator_driven_reactor/ the same three files
    item/u233_fuel_rod.png, item/spent_oxide_fragments.png, item/spent_nitride_fragments.png, item/u233_cathode_deposit.png

  Cell face: a dark steel bezel round a furnace window; idle, the salt bath is dark. Working (4 frames, frametime 4), an orange
  molten-salt surface glows and a pale green cathode rod dips into it; the run lamp is green.
  Reactor face: a bezel round a beam window; idle, the beam line is dark. Working (4 frames, frametime 4), cyan proton bunches
  travel along the beam line into a violet core; the run lamp is green.
  The *_emissive layer holds only the glow and the lamp.
  Rod: a thin zircaloy tube, grey, with a pale green uranium-233 fuel column and end plugs.

  Conventions: transparent background, outer 1 px ring empty, every pixel fully opaque or fully transparent, none pure black,
  emissive layer a subset of the colour layer. The final check fails the run (non-zero exit) if a written file breaks one.

  Run from the repo root:
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-UVThoriumTextures.ps1

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
    # the cell: two electrodes dip into a molten-salt bath over heater coils; the tips and the bath glow
    cell    = @{ Mode = 'chase'; Pal = @{ k = (Hex 'B06A38'); q = (Hex '8A4E28') }
        Ramp = @((Hex '3A4A2A'), (Hex '8AD88A'), (Hex 'B8F5A8'), (Hex 'D8FFC8'), (Hex 'F4FFEE'))
        Ramp2 = @((Hex '4A1A08'), (Hex 'C2480A'), (Hex 'F0771F'), (Hex 'FFB347'), (Hex 'FFE08A'))
        Map = @('...M....M...', '...M....M...', '...M....M...', '...M....M...', '.Da0aaaa1aD.', '.DbabababaD.', '..DbababaD..', '...DDDDDD...', '..MMMMMMMM..', '..kqkqkqkq..', '............', '.....ll.....') }
    # the reactor: a proton beam in its pipe enters a spherical subcritical core over the fuel rods
    reactor = @{ Mode = 'chase'; Pal = @{}
        Ramp = @((Hex '1F6F8A'), (Hex '2FB4D8'), (Hex '8AE4F5'), (Hex 'C8F4FF'), (Hex 'E8FBFF'))
        Ramp2 = @((Hex '4A1E70'), (Hex '8E3FD0'), (Hex 'B565F0'), (Hex 'D8A0FF'), (Hex 'E3B8FF'))
        Map = @('.....DDDDD..', '....DPaaaPD.', 'EEEDPaaaaaPD', '0123012aaaPD', 'EEEDPaaaaaPD', '....DPaaaPD.', '.....DDDDD..', '............', 'M.M.M.M.M.M.', 'M.M.M.M.M.M.', '............', '.....ll.....') }
}

function New-Face {
    param([string]$Kind, [int]$Frame, [bool]$Active)
    return New-OwnFace $Own[$Kind] $Frame $Active
}

function New-Rod {
    $c = New-Canvas
    $tube = @((Hex 'C8CCD0'), (Hex '9AA0A6'), (Hex '6E747A'))
    $fuel = @((Hex 'C4F0B0'), (Hex '8CC878'), (Hex '5E9A4E'))
    # a diagonal rod from the lower left to the upper right, 2 px thick
    for ($i = 0; $i -lt 12; $i++) {
        $x = 2 + $i; $y = 13 - $i
        $core = ($i -ge 2 -and $i -le 9)
        $pal = if ($core) { $fuel } else { $tube }
        Set-Px $c $x $y $pal[1]
        Set-Px $c ($x + 1) $y $pal[0]
        Set-Px $c $x ($y - 1) $pal[2]
    }
    Set-Px $c 2 14 $tube[2]; Set-Px $c 14 2 $tube[0]
    return $c
}

function New-Fragments {
    param($Pal)
    $c = New-Canvas
    # three chopped tube pieces, each a short ring of hull with the fuel showing at the cut
    $pieces = @(@(2, 3), @(8, 2), @(5, 8))
    foreach ($p in $pieces) {
        $x0 = $p[0]; $y0 = $p[1]
        for ($dy = 0; $dy -lt 4; $dy++) { for ($dx = 0; $dx -lt 6; $dx++) {
            $edge = ($dy -eq 0 -or $dy -eq 3)
            Set-Px $c ($x0 + $dx) ($y0 + $dy) $(if ($edge) { $Pal.Hull } elseif ($dx -eq 0 -or $dx -eq 5) { $Pal.Cut } else { $Pal.Fuel })
        } }
    }
    return $c
}

function New-Deposit {
    $c = New-Canvas
    $steel = @((Hex 'C8CCD0'), (Hex '8A9096'), (Hex '5A6066'))
    $metal = @((Hex 'E0F8D0'), (Hex '9CD08A'), (Hex '5E9A4E'))
    # a cathode rod with a dendritic uranium-233 crust and a salt crust at the tip
    for ($y = 1; $y -le 6; $y++) { Set-Px $c 7 $y $steel[1]; Set-Px $c 8 $y $steel[0] }
    for ($y = 6; $y -le 13; $y++) {
        $w = if ($y -lt 9) { 2 } else { 3 }
        for ($x = 8 - $w; $x -le 7 + $w; $x++) {
            $v = $(if ((($x * 3 + $y * 5) % 4) -eq 0) { $metal[0] } elseif ((($x + $y) % 3) -eq 0) { $metal[2] } else { $metal[1] })
            Set-Px $c $x $y $v
        }
    }
    Set-Px $c 4 12 $metal[2]; Set-Px $c 11 12 $metal[2]; Set-Px $c 5 14 $metal[1]; Set-Px $c 10 14 $metal[1]
    Set-Px $c 7 14 (Hex 'C8E0F0'); Set-Px $c 8 14 (Hex 'C8E0F0')
    return $c
}

$FragOx = @{ Hull = (Hex '8A9096'); Cut = (Hex '5A6066'); Fuel = (Hex 'D8D0A0') }
$FragNi = @{ Hull = (Hex '8A9096'); Cut = (Hex '5A6066'); Fuel = (Hex 'A8B8D8') }
$ItemFiles = @('u233_fuel_rod', 'spent_oxide_fragments', 'spent_nitride_fragments', 'u233_cathode_deposit')

$kinds = @(@{ Kind = 'cell'; Dir = 'block/multiblock/pyroprocessing_cell' }, @{ Kind = 'reactor'; Dir = 'block/multiblock/accelerator_driven_reactor' })
foreach ($k in $kinds) {
    $idle = New-Face $k.Kind 0 $false
    Out-Tex $idle.C "$($k.Dir)/overlay_front.png"
    $col = @(); $emi = @()
    for ($f = 0; $f -lt $Frames; $f++) { $a = New-Face $k.Kind $f $true; $col += , $a.C; $emi += , $a.E }
    Out-Tex (Join-Frames $col) "$($k.Dir)/overlay_front_active.png" $FrameTime
    Out-Tex (Join-Frames $emi) "$($k.Dir)/overlay_front_active_emissive.png" $FrameTime
}
Out-Tex (New-Rod) 'item/u233_fuel_rod.png'
Out-Tex (New-Fragments $FragOx) 'item/spent_oxide_fragments.png'
Out-Tex (New-Fragments $FragNi) 'item/spent_nitride_fragments.png'
Out-Tex (New-Deposit) 'item/u233_cathode_deposit.png'

# self-check: ring empty, alpha 0 or 255, nothing pure black, emissive a subset of the colour layer, no two frames alike
$problems = New-Object System.Collections.Generic.List[string]
foreach ($k in $kinds) {
    $png = @{}
    foreach ($n in 'overlay_front', 'overlay_front_active', 'overlay_front_active_emissive') { $png[$n] = Read-Png (Join-Path $OutRoot ("$($k.Dir)/$n.png" -replace '/', '\')) }
    foreach ($n in $png.Keys) {
        $c = $png[$n]
        for ($y = 0; $y -lt $c.H; $y++) {
            for ($x = 0; $x -lt $c.W; $x++) {
                $v = $c.P[$y * $c.W + $x]; $a = ($v -shr 24) -band 255
                $ring = ((($x % 16) -eq 0) -or (($x % 16) -eq 15) -or (($y % 16) -eq 0) -or (($y % 16) -eq 15))
                if ($a -ne 0 -and $a -ne 255) { $problems.Add("$($k.Dir)/${n}: partial alpha at $x,$y") }
                if ($a -eq 255 -and ($v -band 0xFFFFFF) -eq 0) { $problems.Add("$($k.Dir)/${n}: pure black at $x,$y") }
                if ($ring -and $a -ne 0) { $problems.Add("$($k.Dir)/${n}: ring pixel at $x,$y") }
            }
        }
    }
    $col = $png['overlay_front_active']; $em = $png['overlay_front_active_emissive']
    for ($i = 0; $i -lt $col.P.Length; $i++) { if ($em.P[$i] -ne 0 -and $em.P[$i] -ne $col.P[$i]) { $problems.Add("$($k.Dir): emissive differs from colour at $i") } }
    for ($f = 0; $f -lt $Frames - 1; $f++) {
        $same = $true
        for ($i = 0; $i -lt 256; $i++) { if ($col.P[$f * 256 + $i] -ne $col.P[($f + 1) * 256 + $i]) { $same = $false; break } }
        if ($same) { $problems.Add("$($k.Dir): frame $f repeats frame $($f + 1)") }
    }
}
foreach ($name in $ItemFiles) {
    $rod = Read-Png (Join-Path $OutRoot "item\$name.png")
    for ($y = 0; $y -lt $rod.H; $y++) {
        for ($x = 0; $x -lt $rod.W; $x++) {
            $v = $rod.P[$y * $rod.W + $x]; $a = ($v -shr 24) -band 255
            if ($a -ne 0 -and $a -ne 255) { $problems.Add("item/${name}: partial alpha at $x,$y") }
            if ($a -eq 255 -and ($v -band 0xFFFFFF) -eq 0) { $problems.Add("item/${name}: pure black at $x,$y") }
            if ($a -ne 0 -and ($x -eq 0 -or $x -eq 15 -or $y -eq 0 -or $y -eq 15)) { $problems.Add("item/${name}: ring pixel at $x,$y") }
        }
    }
}
if ($problems.Count -gt 0) { $problems | Select-Object -First 20 | ForEach-Object { Write-Error $_ -ErrorAction Continue }; exit 1 }

Write-Host "$ScriptName wrote $($written.Count) files"
if ($Credits) {
    foreach ($w in $written) { Write-Host "| pack/kubejs/assets/grindless/textures/$w | drawn procedurally by tools/assets/$ScriptName | ours |" }
}
