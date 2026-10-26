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

# Plasma quench caster: a steel door with a mold slot and a pour spout; the slot glows orange when it casts.
$dir = Join-Path $OutRoot 'block\multiblock\plasma_quench_caster'
$pal = New-Palette 'F=A9B0B8 D=3E434B K=15171A M=7C858F Z=CFD6DE W=FF8A1F P=FFD08A H=545B64'
foreach ($active in @($false, $true)) {
    $c = New-Canvas
    Write-Map $c 0 0 @(
        '................',
        '.FFFFFFFFFFFFFD.',
        '.FKKKKKKKKKKKKD.',
        '.FKZZZZZZZZZZKD.',
        '.FKMMMMMMMMMMKD.',
        '.FKKKKKHHKKKKKD.',
        '.FKKKKKHHKKKKKD.',
        '.FKKHHHHHHHHKKD.',
        '.FKKHKKKKKKHKKD.',
        '.FKKHKKKKKKHKKD.',
        '.FKKHHHHHHHHKKD.',
        '.FKKKKKKKKKKKKD.',
        '.FKMMMMMMMMMMKD.',
        '.FHHHHHHHHHHHHD.',
        '.DDDDDDDDDDDDDD.',
        '................'
    ) $pal
    $e = New-Canvas
    if ($active) {
        foreach ($y in @(8, 9)) { for ($x = 5; $x -le 10; $x++) { Set-Px $c $x $y $pal['W']; Set-Px $e $x $y $pal['W'] } }
        foreach ($x in @(7, 8)) { Set-Px $c $x 8 $pal['P']; Set-Px $e $x 8 $pal['P'] }
    }
    Save-Overlay $dir $c $e $active
}

# Direct energy converter: a cryostat window onto three grids; the grids glow plasma blue-violet when it runs.
$dir = Join-Path $OutRoot 'block\multiblock\direct_energy_converter'
$pal = New-Palette 'F=B9C3CE D=474D57 K=181A1E M=8D97A3 Z=D6DEE8 V=3F4A5A W=9B6BFF P=D9C4FF H=5E6670'
foreach ($active in @($false, $true)) {
    $c = New-Canvas
    Write-Map $c 0 0 @(
        '................',
        '.FFFFFFFFFFFFFD.',
        '.FKKKKKKKKKKKKD.',
        '.FKZZZZZZZZZZKD.',
        '.FKMMMMMMMMMMKD.',
        '.FKKKKKKKKKKKKD.',
        '.FKKVKKVKKVKKKD.',
        '.FKKVKKVKKVKKKD.',
        '.FKKVKKVKKVKKKD.',
        '.FKKVKKVKKVKKKD.',
        '.FKKVKKVKKVKKKD.',
        '.FKKKKKKKKKKKKD.',
        '.FKMMMMMMMMMMKD.',
        '.FHHHHHHHHHHHHD.',
        '.DDDDDDDDDDDDDD.',
        '................'
    ) $pal
    $e = New-Canvas
    if ($active) {
        foreach ($x in @(3, 6, 9)) { for ($y = 6; $y -le 10; $y++) { Set-Px $c $x $y $pal['W']; Set-Px $e $x $y $pal['W'] } }
        foreach ($x in @(3, 6, 9)) { Set-Px $c $x 8 $pal['P']; Set-Px $e $x 8 $pal['P'] }
    }
    Save-Overlay $dir $c $e $active
}
