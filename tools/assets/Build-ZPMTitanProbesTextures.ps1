[CmdletBinding()]
param([string]$OutRoot = '')
$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'Pixel.Lib.ps1')
if (-not $OutRoot) { $OutRoot = Join-Path $PSScriptRoot '..\..\pack\kubejs\assets\grindless\textures' }

function Save-Overlay {
    param([string]$Dir, $C, $E, [bool]$Active)
    for ($i = 0; $i -lt $E.P.Length; $i++) {
        if ($E.P[$i] -ne 0 -and $E.P[$i] -ne $C.P[$i]) { throw "emissive pixel $i of $Dir is not in the colour layer" }
    }
    $name = 'overlay_front'
    if ($Active) { $name += '_active' }
    Save-Png $C (Join-Path $Dir ($name + '.png'))
    if ($Active) { Save-Png $E (Join-Path $Dir ($name + '_emissive.png')) }
}

$frame = @(
    '................',
    '.FFFFFFFFFFFFFD.',
    '.FKKKKKKKKKKKKD.',
    '.FKaaaaaaaaaaKD.',
    '.FKaaaaaaaaaaKD.',
    '.FKaaaaaaaaaaKD.',
    '.FKaaaaaaaaaaKD.',
    '.FKaaaaaaaaaaKD.',
    '.FKaaaaaaaaaaKD.',
    '.FKaaaaaaaaaaKD.',
    '.FKaaaaaaaaaaKD.',
    '.FKaaaaaaaaaaKD.',
    '.FKKKKKKKKKKKKD.',
    '.FHHHHHHHHHHHHD.',
    '.DDDDDDDDDDDDDD.',
    '................'
)

# Entry probe bay: a dark bay with an orange haze band and a rail down its middle; the probe's glow runs along the rail when it works.
$dir = Join-Path $OutRoot 'block\multiblock\entry_probe_bay'
$pal = New-Palette 'F=B9BEC4 D=474B52 K=181A1E H=5E5F66 a=2A1C12 T=C8741E R=9AA0A8 W=FFB45A'
foreach ($active in @($false, $true)) {
    $c = New-Canvas
    Write-Map $c 0 0 $frame $pal
    for ($x = 3; $x -le 12; $x++) { Set-Px $c $x 4 $pal['T']; Set-Px $c $x 5 $pal['T'] }
    for ($y = 6; $y -le 11; $y++) { Set-Px $c 7 $y $pal['R']; Set-Px $c 8 $y $pal['R'] }
    $e = New-Canvas
    if ($active) {
        for ($y = 7; $y -le 10; $y++) { Set-Px $c 7 $y $pal['W']; Set-Px $c 8 $y $pal['W']; Set-Px $e 7 $y $pal['W']; Set-Px $e 8 $y $pal['W'] }
    }
    Save-Overlay $dir $c $e $active
}

# Tholin reformer: a PTFE-white window over a rust-red column of tholin; the column glows when it runs.
$dir = Join-Path $OutRoot 'block\multiblock\tholin_reformer'
$pal = New-Palette 'F=B9BEC4 D=474B52 K=181A1E H=5E5F66 a=D8D4C8 T=8A3A1E W=FF7A3C'
foreach ($active in @($false, $true)) {
    $c = New-Canvas
    Write-Map $c 0 0 $frame $pal
    for ($y = 3; $y -le 11; $y++) { Set-Px $c 7 $y $pal['T']; Set-Px $c 8 $y $pal['T'] }
    $e = New-Canvas
    if ($active) {
        for ($y = 3; $y -le 11; $y++) { Set-Px $c 7 $y $pal['W']; Set-Px $c 8 $y $pal['W']; Set-Px $e 7 $y $pal['W']; Set-Px $e 8 $y $pal['W'] }
    }
    Save-Overlay $dir $c $e $active
}

# Titan probe recording: a dark data card with an orange telemetry trace.
$c = New-Canvas
$pal = New-Palette 'F=9AA0A8 K=1C1E24 T=F2AE60 U=C8741E'
Set-Rect $c 2 2 12 12 $pal['K']
foreach ($x in 2..13) { Set-Px $c $x 2 $pal['F']; Set-Px $c $x 13 $pal['F'] }
foreach ($y in 2..13) { Set-Px $c 2 $y $pal['F']; Set-Px $c 13 $y $pal['F'] }
$trace = @(9, 9, 8, 6, 4, 6, 9, 10, 11, 9, 7, 8)
for ($i = 0; $i -lt $trace.Length; $i++) { Set-Px $c (3 + $i) $trace[$i] $pal['T']; Set-Px $c (3 + $i) ($trace[$i] + 1) $pal['U'] }
Save-Png $c (Join-Path $OutRoot 'item\titan_probe_recording.png')
