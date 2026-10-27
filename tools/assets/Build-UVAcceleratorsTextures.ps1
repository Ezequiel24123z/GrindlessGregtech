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

function New-Bezel {
    $c = New-Canvas
    Set-Rect $c 1 1 14 14 $Dark
    for ($i = 1; $i -le 14; $i++) {
        Set-Px $c $i 1 $Lit; Set-Px $c 1 $i $Lit
        Set-Px $c $i 14 $Deep; Set-Px $c 14 $i $Deep
    }
    Set-Rect $c 2 2 12 12 $Mid
    Set-Rect $c 3 3 10 8 $Deep
    Set-Rect $c 3 11 10 3 $Dark
    return $c
}

# the beam pipe round the window, clockwise from the top left: 24 places
$Ring = New-Object System.Collections.Generic.List[object]
for ($x = 4; $x -le 11; $x++) { $Ring.Add(@($x, 4)) }
for ($y = 5; $y -le 9; $y++) { $Ring.Add(@(11, $y)) }
for ($x = 10; $x -ge 4; $x--) { $Ring.Add(@($x, 9)) }
for ($y = 8; $y -ge 5; $y--) { $Ring.Add(@(4, $y)) }

function New-Face {
    param([string]$Kind, [int]$Frame, [bool]$Active)
    $c = New-Bezel
    $e = New-Canvas
    for ($y = 4; $y -le 9; $y++) { for ($x = 4; $x -le 11; $x++) { Set-Px $c $x $y $Pit } }
    switch ($Kind) {
        'synchrotron' {
            foreach ($p in $Ring) { Set-Px $c $p[0] $p[1] (Hex '1C2A33') }
            if ($Active) {
                for ($i = 0; $i -lt 3; $i++) {
                    $k = (($Frame * 2) + ($i * 8)) % $Ring.Count
                    $head = $Ring[$k]; $tail = $Ring[($k + $Ring.Count - 1) % $Ring.Count]
                    Set-Both $c $e $head[0] $head[1] (Hex 'FFF2C0')
                    Set-Both $c $e $tail[0] $tail[1] (Hex '8AE4F5')
                }
            }
        }
        'cell' {
            for ($x = 4; $x -le 11; $x++) { for ($y = 7; $y -le 9; $y++) { Set-Px $c $x $y (Hex '1A3A34') } }
            if ($Active) {
                $dt = @((Hex '2E9C88'), (Hex '4FC8B0'), (Hex '86E8D4'))
                for ($x = 4; $x -le 11; $x++) {
                    for ($y = 7; $y -le 9; $y++) {
                        $k = if ($y -eq 7) { (($x + $Frame) % 3) } else { 0 }
                        Set-Both $c $e $x $y $dt[$k]
                    }
                }
                for ($i = 0; $i -lt 3; $i++) {
                    $x = 5 + (($i * 3) % 6)
                    $y = 8 - (($Frame + $i) % 4)
                    Set-Both $c $e $x $y (Hex 'C08AFF')
                }
            }
        }
        'trap' {
            for ($y = 4; $y -le 9; $y++) { Set-Px $c 4 $y (Hex 'B06A38'); Set-Px $c 11 $y (Hex '8A4E28') }
            for ($x = 5; $x -le 10; $x++) { Set-Px $c $x 6 (Hex '1C1C2A'); Set-Px $c $x 7 (Hex '1C1C2A') }
            if ($Active) {
                $viol = @((Hex '8E3FD0'), (Hex 'B565F0'), (Hex 'E3B8FF'))
                for ($x = 6; $x -le 9; $x++) {
                    foreach ($y in 6, 7) { Set-Both $c $e $x $y $viol[(($x + $y + $Frame) % 3)] }
                }
            }
        }
    }
    Set-Px $c 7 12 $(if ($Active) { $LampOn } else { $LampOff })
    Set-Px $c 8 12 $(if ($Active) { $LampOn } else { $LampOff })
    if ($Active) { Set-Px $e 7 12 $LampOn; Set-Px $e 8 12 $LampOn }
    for ($i = 0; $i -lt 16; $i++) { foreach ($p in @(@($i, 0), @($i, 15), @(0, $i), @(15, $i))) { Set-Px $c $p[0] $p[1] 0; Set-Px $e $p[0] $p[1] 0 } }
    return @{ C = $c; E = $e }
}

$kinds = @(
    @{ Kind = 'synchrotron'; Dir = 'block/multiblock/synchrotron' },
    @{ Kind = 'cell'; Dir = 'block/multiblock/muon_fusion_cell' },
    @{ Kind = 'trap'; Dir = 'block/multiblock/antimatter_trap' }
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
