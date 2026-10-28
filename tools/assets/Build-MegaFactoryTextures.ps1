<#
.SYNOPSIS
  Textures of the UV Mega Factory (gtceu:mega_factory, package MEGA-8): the controller face block/multiblock/mega_factory/overlay_front.png,
  overlay_front_active.png and overlay_front_active_emissive.png, and the five module blocks block/uv/<name>_module.png.
  Procedural pixel art, original.
.PARAMETER Credits
  Also print the CREDITS.md "Assets" table rows for the files written.
.EXAMPLE
  powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-MegaFactoryTextures.ps1 -Credits
#>
[CmdletBinding()]
param([string]$OutRoot = '', [switch]$Credits)
$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'Pixel.Lib.ps1')
if (-not $OutRoot) { $OutRoot = Join-Path $PSScriptRoot '..\..\pack\kubejs\assets\grindless\textures' }

$dir = Join-Path $OutRoot 'block\multiblock\mega_factory'
$written = New-Object System.Collections.Generic.List[string]

# Controller: a dark hatch with a row of four socket lights; the lights glow cyan when it runs.
$pal = New-Palette 'F=B9C3CE D=474D57 K=181A1E M=8D97A3 Z=D6DEE8 V=3F4A5A H=5E6670 C=3CC8E6 P=A0F0FF'
foreach ($active in @($false, $true)) {
    $c = New-Canvas
    Write-Map $c 0 0 @(
        '................',
        '.FFFFFFFFFFFFFD.',
        '.FKKKKKKKKKKKKD.',
        '.FKZZZZZZZZZZKD.',
        '.FKMVVVVVVVVMKD.',
        '.FKMVHHHHHHVMKD.',
        '.FKMVHKKKKHVMKD.',
        '.FKMVHKKKKHVMKD.',
        '.FKMVHHHHHHVMKD.',
        '.FKMVVVVVVVVMKD.',
        '.FKKKKKKKKKKKKD.',
        '.FKMHCHCHCHCMKD.',
        '.FKKKKKKKKKKKKD.',
        '.FHHHHHHHHHHHHD.',
        '.DDDDDDDDDDDDDD.',
        '................'
    ) $pal
    $e = New-Canvas
    $name = 'overlay_front'
    if ($active) {
        foreach ($x in @(5, 7, 9, 11)) { Set-Px $c $x 11 $pal['P']; Set-Px $e $x 11 $pal['P'] }
        $name += '_active'
        Save-Png $e (Join-Path $dir ($name + '_emissive.png'))
        $written.Add("block/multiblock/mega_factory/$($name)_emissive.png")
    }
    Save-Png $c (Join-Path $dir ($name + '.png'))
    $written.Add("block/multiblock/mega_factory/$name.png")
}

# Module blocks: a UV-grey plate with a coloured border and a small emblem of the module's job.
$modules = [ordered]@{
    separation_module = @{ accent = 'E6A23C'; emblem = @(
        '................', '................', '................', '......AAAA......', '.....AAAAAA.....', '.....AAAAAA.....', '.....AAAAAA.....', '......AAAA......',
        '................', '....A......A....', '...AAA....AAA...', '....A......A....', '................', '................', '................', '................') }
    forming_module = @{ accent = '5AB4F0'; emblem = @(
        '................', '................', '................', '....AAAAAAAA....', '....A......A....', '....A......A....', '....AAAAAAAA....', '................',
        '................', '..AAAAAAAAAAAA..', '..A..........A..', '..AAAAAAAAAAAA..', '................', '................', '................', '................') }
    cutting_module = @{ accent = 'E85A5A'; emblem = @(
        '................', '................', '...A..........A.', '....A........A..', '.....A......A...', '......A....A....', '.......AAAA.....', '.......AAAA.....',
        '......A....A....', '.....A......A...', '....A........A..', '...A..........A.', '................', '................', '................', '................') }
    mixing_module = @{ accent = '6ED26E'; emblem = @(
        '................', '................', '....AAAAAAAA....', '....A......A....', '....A.AA...A....', '....A.AAA..A....', '....A..AA..A....', '....A......A....',
        '.....AAAAAA.....', '................', '................', '................', '................', '................', '................', '................') }
    heat_module = @{ accent = 'F08C28'; emblem = @(
        '................', '................', '.......A........', '......AA........', '.....AAA.A......', '....AAAAAAA.....', '....AAAAAAAA....', '....AAAAAAAA....',
        '.....AAAAAA.....', '......AAAA......', '................', '................', '................', '................', '................', '................') }
}
foreach ($name in $modules.Keys) {
    $m = $modules[$name]
    $p = New-Palette ('F=B9C3CE D=474D57 K=181A1E M=8D97A3 V=3F4A5A A=' + $m.accent)
    $c = New-Canvas
    $rows = @(
        'FFFFFFFFFFFFFFFD',
        'FAAAAAAAAAAAAAMD',
        'FAVVVVVVVVVVVAMD'
    )
    for ($i = 3; $i -lt 13; $i++) { $rows += 'FAVVVVVVVVVVVAMD' }
    $rows += 'FAVVVVVVVVVVVAMD'
    $rows += 'FAAAAAAAAAAAAAMD'
    $rows += 'DDDDDDDDDDDDDDDD'
    Write-Map $c 0 0 $rows $p
    Write-Map $c 0 0 $m.emblem $p
    $rel = "block/uv/$name.png"
    Save-Png $c (Join-Path $OutRoot ($rel.Replace('/', '\')))
    $written.Add($rel)
}
$written | ForEach-Object { Write-Host "wrote $_" }

if ($Credits) {
    foreach ($rel in $written) {
        Write-Output ('| `pack/kubejs/assets/grindless/textures/' + $rel + '` | Generated with tools/assets/Build-MegaFactoryTextures.ps1 (procedural pixel art, original) by the MEGA-8 agent, 2026-10-28 | the pack''s licence (pending; proposed CC BY-SA 4.0) |')
    }
}
