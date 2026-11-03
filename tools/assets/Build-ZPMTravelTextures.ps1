[CmdletBinding()]
param([string]$OutRoot = '')
# ZPM B1: the level 5 and 6 rocket tanks (original column textures) and the Saturnian and Uranian quantum seed ampoules.
$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'Pixel.Lib.ps1')
if (-not $OutRoot) { $OutRoot = Join-Path $PSScriptRoot '..\..\pack\kubejs\assets\grindless\textures' }
$blockDir = Join-Path $OutRoot 'block\zpm'
$itemDir = Join-Path $OutRoot 'item'

$sideMap = @(
    'KDDDDDDDDDDDDDDK',
    'DMLLLLLLLLLLLLMD',
    'DLWWWFWWWWWWWWLD',
    'DLWWWFWWWWWWWWLD',
    'DBBBBBBBBBBBBBBD',
    'DCCCCCCCCCCCCCCD',
    'DLWWWFWWWWWWYWLD',
    'DLWWWFWWWWWWYWLD',
    'DLWWWFWWWWWWWWLD',
    'DLWWWFWWWWWWWWLD',
    'DCCCCCCCCCCCCCCD',
    'DBBBBBBBBBBBBBBD',
    'DLWWWFWWWWWWWWLD',
    'DLWWWFWWWWWWWWLD',
    'DMLLLLLLLLLLLLMD',
    'KDDDDDDDDDDDDDDK'
)
$endMap = @(
    'KDDDDDDDDDDDDDDK',
    'DMMMMMMMMMMMMMMD',
    'DMLLLLLLLLLLLLMD',
    'DMLWWWWWWWWWWLMD',
    'DMLWBBBBBBBBWLMD',
    'DMLWBCCCCCCBWLMD',
    'DMLWBCKKKKCBWLMD',
    'DMLWBCKDDKCBWLMD',
    'DMLWBCKDDKCBWLMD',
    'DMLWBCKKKKCBWLMD',
    'DMLWBCCCCCCBWLMD',
    'DMLWBBBBBBBBWLMD',
    'DMLWWWWWWWWWWLMD',
    'DMLLLLLLLLLLLLMD',
    'DMMMMMMMMMMMMMMD',
    'KDDDDDDDDDDDDDDK'
)
$iconMap = @(
    'ZZZZZZKKKKZZZZZZ',
    'ZZZZKKLLLLKKZZZZ',
    'ZZZKLWWFWWWLKZZZ',
    'ZZZKLWWFWWWMKZZZ',
    'ZZZKBBBBBBBBKZZZ',
    'ZZZKCCCCCCCCKZZZ',
    'ZZZKLWWFWWYMKZZZ',
    'ZZZKLWWFWWWMKZZZ',
    'ZZZKLWWFWWWMKZZZ',
    'ZZZKCCCCCCCCKZZZ',
    'ZZZKBBBBBBBBKZZZ',
    'ZZZKLWWFWWWMKZZZ',
    'ZZZKMWWFWWWDKZZZ',
    'ZZZZKDMMMMDKZZZZ',
    'ZZZZZKKDDKKZZZZZ',
    'ZZZZZZZZZZZZZZZZ'
)
$tanks = @(
    @{ Name = 'naquadah_fuel_tank'; Pal = 'W=3C4A3E L=2E3A31 M=26302A D=1A221D K=0C110E B=2FBF5B C=8CFFB0 F=57705E Y=E8FF7A Z=141A16' },
    @{ Name = 'aerogel_fuel_tank'; Pal = 'W=DCE6F5 L=BCCBE3 M=96A8C9 D=5A6A8C K=26304A B=8B5CF0 C=D2B8FF F=F4F8FF Y=FFE27A Z=3A4466' }
)
foreach ($t in $tanks) {
    $pal = New-Palette $t.Pal
    $side = New-Canvas
    Write-Map $side 0 0 $sideMap $pal
    Save-Png $side (Join-Path $blockDir ($t.Name + '_side.png'))
    $end = New-Canvas
    Write-Map $end 0 0 $endMap $pal
    Save-Png $end (Join-Path $blockDir ($t.Name + '_end.png'))
    $icon = New-Canvas
    Write-Map $icon 0 0 $iconMap $pal
    Save-Png $icon (Join-Path $blockDir ($t.Name + '.png'))
}

# the seed ampoule: a glass vial with a cap of the place's matter (Saturn: banded gold; Uranus: pale cyan)
$seedMap = @(
    '................',
    '.....KKKKKK.....',
    '....KCCCCCCK....',
    '....KCCDDCCK....',
    '.....KKKKKK.....',
    '.....KGGGGK.....',
    '....KGGHHGGK....',
    '...KGGHSSHGGK...',
    '...KGHSSSSHGK...',
    '...KGHSSSSHGK...',
    '...KGGHSSHGGK...',
    '....KGGHHGGK....',
    '.....KGGGGK.....',
    '......KKKK......',
    '................',
    '................'
)
$saturnSeedMap = @(
    '................',
    '.....KKKKKK.....',
    '....KCCCCCDK....',
    '....KCCCDDDK....',
    '.....KKKKKK.....',
    '.....KHGGGK.....',
    '....KHSSGGGK....',
    '...KHSSSSSGGK...',
    '..CCCCCCCCCCCC..',
    '...KSSSSSSGDK...',
    '...KSSSSGGDDK...',
    '....KSSGGDDK....',
    '.....KGGDDK.....',
    '......KKKK......',
    '................',
    '................'
)
# Saturn: the ring crosses the vial and the light falls from the top-left; Uranus keeps the plain ampoule
$seeds = @(
    @{ Name = 'saturnian_quantum_seed'; Map = $saturnSeedMap; Pal = 'K=3A2A10 C=C9A24A D=8A6320 G=B8C4CC H=EAF2F7 S=E8C26A' },
    @{ Name = 'uranian_quantum_seed'; Map = $seedMap; Pal = 'K=0E3A44 C=8FE3EE D=3E8C9C G=B8C4CC H=EAF2F7 S=7FE0E8' }
)
foreach ($s in $seeds) {
    $c = New-Canvas
    Write-Map $c 0 0 $s.Map (New-Palette $s.Pal)
    Save-Png $c (Join-Path $itemDir ($s.Name + '.png'))
}
