<#
.SYNOPSIS
  Procedural 16x16 textures for UHV's ceramics and the level 8 rocket (package UHV-A8): the item icons tantalum_carbide_liner and
  oganesson_propellant_pod, and the ICAN rocket motor's three block faces (GregTech style: top-left light, 3-4 tones per material,
  selective outlines on the items).

.DESCRIPTION
  Every pixel is drawn by this script (same shading routines as Build-UHVElevatorTextures.ps1); nothing is copied from any mod
  (GCYR's motor textures are not used). Deterministic: re-running overwrites the same bytes. Writes
  pack/kubejs/assets/grindless/textures/item/<name>.png and textures/block/uhv/ican_rocket_motor_{top,side,bottom}.png.

  Run from the repo root:
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-UHVPropulsionTextures.ps1

  Items: every pixel is fully opaque or fully transparent, none is pure black, the corner is transparent, at least 20 pixels are
  opaque and the icon is registered by startup_scripts/grindless/uhv/propulsion.js. Block faces: every pixel is opaque and none is
  pure black. The run fails otherwise.

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

# name -> kind, body colour, accent colour
$Items = [ordered]@{
    tantalum_carbide_liner   = @('sleeve', 'B8A878', '5C5446')
    oganesson_propellant_pod = @('pod', 'C0C4CC', '8A4A9A')
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
    switch ($Kind) {
        # an upright sleeve seen from above the rim: an elliptic mouth on a short cylinder
        'sleeve' {
            if ($Y -eq 2 -or $Y -eq 13) { return ($X -ge 5 -and $X -le 10) }
            if ($Y -ge 3 -and $Y -le 12) { return ($X -ge 4 -and $X -le 11) }
        }
        # a capsule tank with a filler valve on top
        'pod' {
            if ($Y -eq 1) { return ($X -ge 7 -and $X -le 8) }
            if ($Y -eq 2 -or $Y -eq 14) { return ($X -ge 6 -and $X -le 9) }
            if ($Y -eq 3 -or $Y -eq 13) { return ($X -ge 4 -and $X -le 11) }
            if ($Y -ge 4 -and $Y -le 12) { return ($X -ge 3 -and $X -le 12) }
        }
    }
    return $false
}

function Test-Accent {
    param([string]$Kind, [int]$X, [int]$Y, [int]$Salt)
    $n = Get-Noise $X $Y ($Salt + 7)
    switch ($Kind) {
        # the dark bore seen through the mouth, and a sintering seam round the waist
        'sleeve' { return (($Y -eq 3 -and $X -ge 6 -and $X -le 9) -or ($Y -eq 4 -and $X -ge 5 -and $X -le 10) -or ($Y -eq 9 -and $n -gt 250)) }
        # oganesson's purple bands and the sight glass
        'pod' { return ($Y -eq 5 -or $Y -eq 11 -or ($X -ge 7 -and $X -le 8 -and $Y -ge 7 -and $Y -le 9)) }
    }
    return $false
}

function New-Item16 {
    param([string]$Name, [string[]]$Spec)
    $c = New-Canvas 16 16
    $salt = Get-Salt $Name
    $body = Hex $Spec[1]; $accent = Hex $Spec[2]
    for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
        if (-not (Test-Shape $Spec[0] $x $y)) { continue }
        $base = $body; if (Test-Accent $Spec[0] $x $y $salt) { $base = $accent }
        Set-Px $c $x $y (Get-Tone $base $x $y $salt)
    } }
    Add-Outline $c
    return $c
}

# ---------------------------------------------------------------- the ICAN rocket motor's faces (cube_bottom_top)
$Steel = Hex '5E6270'
$SteelDark = Hex '3C3F4A'
$Uhtc = Hex '8E929C'
$Purple = Hex '8A4A9A'
$Glow = Hex 'C8603A'

# side: a steel drum with panel seams, a UHTC heat band near the bottom and an oganesson-purple feed ring near the top
function Get-SideColour {
    param([int]$X, [int]$Y)
    if ($X -eq 0 -or $Y -eq 0) { return (Shade $Steel 1.18) }
    if ($X -eq 15 -or $Y -eq 15) { return $SteelDark }
    if ($Y -eq 3) { return $Purple }
    if ($Y -ge 11 -and $Y -le 13) { return $Uhtc }
    if ($X -eq 5 -or $X -eq 10) { return $SteelDark }
    return $Steel
}

# top: the mounting plate, four bolts round a central purple propellant inlet
function Get-TopColour {
    param([int]$X, [int]$Y)
    if ($X -eq 0 -or $Y -eq 0) { return (Shade $Steel 1.18) }
    if ($X -eq 15 -or $Y -eq 15) { return $SteelDark }
    $dx = $X - 7.5; $dy = $Y - 7.5; $r = [Math]::Sqrt($dx * $dx + $dy * $dy)
    if ($r -lt 2.2) { return $Purple }
    if ($r -lt 3.2) { return $SteelDark }
    if (($X -eq 3 -or $X -eq 12) -and ($Y -eq 3 -or $Y -eq 12)) { return $Uhtc }
    return $Steel
}

# bottom: the UHTC nozzle exit, a hot throat in the middle
function Get-BottomColour {
    param([int]$X, [int]$Y)
    $dx = $X - 7.5; $dy = $Y - 7.5; $r = [Math]::Sqrt($dx * $dx + $dy * $dy)
    if ($r -lt 2.0) { return (Shade $Glow 1.15) }
    if ($r -lt 3.4) { return $Glow }
    if ($r -lt 4.4) { return $SteelDark }
    if ($r -lt 6.6) { return $Uhtc }
    if ($X -eq 0 -or $Y -eq 0) { return (Shade $Steel 1.18) }
    if ($X -eq 15 -or $Y -eq 15) { return $SteelDark }
    return $Steel
}

function New-Face {
    param([string]$Name, [scriptblock]$Colour)
    $c = New-Canvas 16 16
    $salt = Get-Salt $Name
    for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
        $base = & $Colour $x $y
        $n = Get-Noise $x $y $salt
        $f = 1.0; if ($n -lt 120) { $f = 0.9 } elseif ($n -gt 890) { $f = 1.1 }
        Set-Px $c $x $y (Shade $base $f)
    } }
    return $c
}

$Faces = [ordered]@{
    ican_rocket_motor_side   = ${function:Get-SideColour}
    ican_rocket_motor_top    = ${function:Get-TopColour}
    ican_rocket_motor_bottom = ${function:Get-BottomColour}
}

$written = @()
foreach ($n in $Items.Keys) {
    $c = New-Item16 $n $Items[$n]
    $rel = "item/$n.png"
    Save-Png $c (Join-Path $OutRoot $rel)
    $written += $rel
}
foreach ($n in $Faces.Keys) {
    $c = New-Face $n $Faces[$n]
    $rel = "block/uhv/$n.png"
    Save-Png $c (Join-Path $OutRoot $rel)
    $written += $rel
}

$problems = 0
function Add-Problem { param([string]$Name, [string]$Msg) $script:problems++; Write-Warning "$Name`: $Msg" }
foreach ($rel in $written) {
    $img = Read-Png (Join-Path $OutRoot $rel)
    $block = $rel -like 'block/*'
    $opaque = 0; $black = 0
    foreach ($p in $img.P) {
        $a = ($p -shr 24) -band 255
        if ($a -ne 0 -and $a -ne 255) { Add-Problem $rel 'partial alpha'; break }
        if ($block -and $a -ne 255) { Add-Problem $rel 'transparent pixel on a block face'; break }
        if ($a -eq 255) { $opaque++; if (($p -band 0xFFFFFF) -eq 0) { $black++ } }
    }
    if ($black -gt 0) { Add-Problem $rel "$black pure black pixel(s)" }
    if (-not $block) {
        if ((($img.P[0] -shr 24) -band 255) -ne 0) { Add-Problem $rel 'corner pixel is not transparent' }
        if ($opaque -lt 20) { Add-Problem $rel "only $opaque opaque pixels" }
    }
}
$src = Get-Content -LiteralPath (Join-Path $RepoRoot 'pack\kubejs\startup_scripts\grindless\uhv\propulsion.js') -Raw
foreach ($n in $Items.Keys) { if ($src -notmatch "(?m)^\s+$n\s*:\s*\{") { Add-Problem $n 'drawn here but not registered by propulsion.js' } }
$model = Join-Path $RepoRoot 'pack\kubejs\assets\grindless\models\block\ican_rocket_motor.json'
if (Test-Path -LiteralPath $model) {
    $m = Get-Content -LiteralPath $model -Raw
    foreach ($n in $Faces.Keys) { if ($m -notmatch [regex]::Escape("grindless:block/uhv/$n")) { Add-Problem $n 'drawn here but not used by models/block/ican_rocket_motor.json' } }
} else { Add-Problem 'ican_rocket_motor' 'models/block/ican_rocket_motor.json missing' }
if ($problems -gt 0) { throw "$problems problem(s) in the texture checks (see the warnings above)" }
Write-Host "wrote $($written.Count) textures to $OutRoot"

if ($Credits) {
    Write-Host ''
    foreach ($rel in $written) {
        Write-Host ("| ``pack/kubejs/assets/grindless/textures/$rel`` | Generated with tools/assets/$ScriptName (procedural pixel art, original) by the assets agent (UHV-A8) | the pack's licence (pending; proposed CC BY-SA 4.0) |")
    }
}
