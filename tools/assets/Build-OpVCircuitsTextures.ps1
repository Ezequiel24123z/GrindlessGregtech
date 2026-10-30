<#
.SYNOPSIS
  Procedural 16x16 pixel art for the 28 items of the OpV-A2 package (the OpV circuit lines, process lines 11-18), of Gregtech Grindless.

.DESCRIPTION
  Every pixel is drawn by this script (palettes and small routines); nothing is copied or edited from GregTech Modern or any
  other mod. Output is deterministic. Same item method as Build-UXVSpinLogicTextures.ps1 (one shape map tinted by one base colour).

  Writes (under pack/kubejs/assets/grindless/textures/):
    item/<name>.png for each item in $items below

  Conventions: transparent background, every pixel fully opaque or fully transparent, none pure black. The final check fails the run
  (non-zero exit) if a written file breaks one.

  Run from the repo root:
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-OpVCircuitsTextures.ps1

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

$written = New-Object System.Collections.Generic.List[string]
function Out-Tex {
    param($Canvas, [string]$Rel)
    $path = Join-Path $OutRoot ($Rel -replace '/', '\')
    for ($try = 1; $try -le 6; $try++) {
        try { Save-Png $Canvas $path; break }
        catch [System.IO.IOException] { if ($try -eq 6) { throw }; Start-Sleep -Milliseconds (250 * $try) }
    }
    $written.Add($Rel)
}

# one base colour -> a palette: K outline, W lit, H body, D shade
function Shade {
    param([string]$Rgb, [double]$F)
    $r = [Convert]::ToInt32($Rgb.Substring(0, 2), 16); $g = [Convert]::ToInt32($Rgb.Substring(2, 2), 16); $b = [Convert]::ToInt32($Rgb.Substring(4, 2), 16)
    if ($F -ge 1) { $f = $F - 1; $r += (255 - $r) * $f; $g += (255 - $g) * $f; $b += (255 - $b) * $f }
    else { $r *= $F; $g *= $F; $b *= $F }
    '{0:X2}{1:X2}{2:X2}' -f [Math]::Max(8, [Math]::Min(255, [int]$r)), [Math]::Max(8, [Math]::Min(255, [int]$g)), [Math]::Max(8, [Math]::Min(255, [int]$b))
}
function New-Tint {
    param([string]$Rgb)
    New-Palette ("K=$(Shade $Rgb 0.35) W=$(Shade $Rgb 1.5) H=$Rgb D=$(Shade $Rgb 0.65)")
}

$shapes = @{
    wafer = @(
        '................', '................', '.....KKKKKK.....', '...KKWWWWHHKK...',
        '..KWWHHHHHHHDK..', '..KWHHKKKKHHDK..', '.KWHHKHHHHKHDDK.', '.KWHHKHKKHKHDDK.',
        '.KWHHKHKKHKHDDK.', '.KWHHKHHHHKHDDK.', '..KDHHKKKKHHDK..', '..KDDHHHHHHDDK..',
        '...KKDDDDDDKK...', '.....KKKKKK.....', '................', '................')
    die = @(
        '................', '................', '...K..K..K..K...', '..KKKKKKKKKKKK..',
        '..KWWWWWWWWHDK..', '.KKWHHHHHHHHDKK.', '..KWHKKKKKKHDK..', '.KKWHKWWHDKHDKK.',
        '..KWHKWHHDKHDK..', '.KKWHKHHDDKHDKK.', '..KWHKKKKKKHDK..', '.KKWHHHHHHHHDKK.',
        '..KDDDDDDDDDDK..', '..KKKKKKKKKKKK..', '...K..K..K..K...', '................')
    rod = @(
        '................', '......KKKK......', '.....KWWHDK.....', '.....KWHHDK.....',
        '.....KWHHDK.....', '.....KWHHDK.....', '.....KWHHDK.....', '.....KWHHDK.....',
        '.....KWHHDK.....', '.....KWHHDK.....', '.....KWHHDK.....', '.....KWHHDK.....',
        '.....KWHHDK.....', '.....KDDDDK.....', '......KKKK......', '................')
    boule = @(
        '................', '................', '................', '....KKKKKKKK....',
        '..KKWWWWWWWWKK..', '.KWWHHHHHHHHHHK.', '.KWHHHHHHHHHHDK.', '.KHHHHHHHHHHHDK.',
        '.KHHHHHHHHHHHDK.', '.KHHHHHHHHHHDDK.', '.KDHHHHHHHHDDDK.', '..KKDDDDDDDDKK..',
        '....KKKKKKKK....', '................', '................', '................')
    target = @(
        '................', '.KKKKKKKKKKKKKK.', '.KDDDDDDDDDDDDK.', '.KDDDKKKKKKDDDK.',
        '.KDDKWWWWHHKDDK.', '.KDKWWHHHHHHKDK.', '.KDKWHHHHHHHKDK.', '.KDKWHHHHHHDKDK.',
        '.KDKWHHHHHHDKDK.', '.KDKHHHHHHDDKDK.', '.KDDKHHHHDDKDDK.', '.KDDDKKKKKKDDDK.',
        '.KDDDDDDDDDDDDK.', '.KKKKKKKKKKKKKK.', '................', '................')
    scrap = @(
        '................', '................', '................', '..KKK.....KK....',
        '.KWHDK...KWDK...', '.KHHDK..KWHHDK..', '..KDK...KHHDDK..', '...K.....KDDK...',
        '.....KKK..KK....', '....KWHHK.......', '...KWHHHDK..KK..', '...KHHHDDK.KWDK.',
        '....KDDDK..KDDK.', '.....KKK....KK..', '................', '................')
}
$items = @(
    # line 11
    @('si28_poly_rod', 'rod', '8890A0'),
    # line 12
    @('si_inp_boule', 'boule', '6A5A7A'), @('si_inp_wafer', 'wafer', '7A6A8C'), @('inp_scrap', 'scrap', '5E5070'),
    @('inas_qw_wafer', 'wafer', '8A6A9A'), @('hbn_capped_2deg_wafer', 'wafer', 'C8C8D8'),
    # line 13
    @('gate_stack_soi_wafer', 'wafer', '6C7890'), @('cryo_cmos_litho_wafer', 'wafer', '5A70A8'), @('cryo_cmos_implanted_wafer', 'wafer', '4A6090'),
    @('cryo_cmos_metal_wafer', 'wafer', 'C0A050'), @('untested_cryo_cmos_die', 'die', '5070A0'), @('gold_overspray', 'scrap', 'E0B840'),
    # line 14
    @('rrr_nb_target', 'target', '9098B0'), @('tsv_via_wafer', 'wafer', '707888'), @('nb_filled_tsv_wafer', 'wafer', '8890B8'),
    @('bonded_tsv_interposer', 'wafer', '7880A8'), @('nbtin_film_wafer', 'wafer', 'B08A60'),
    # line 15
    @('ln_on_soi_wafer', 'wafer', 'B8B090'), @('ln_soi_waveguide_wafer', 'wafer', 'A8A8C8'), @('snspd_link_wafer', 'wafer', '8090C0'),
    # line 16
    @('inp_hemt_epi_wafer', 'wafer', '8A6080'), @('hemt_gated_wafer', 'wafer', '9A7090'), @('isolated_hemt_wafer', 'wafer', '7A5878'),
    # line 17
    @('hpsi_sic_wafer', 'wafer', '70A080'), @('gan_sic_epi_wafer', 'wafer', '90A8A0'), @('gan_gated_wafer', 'wafer', '80A0B0'),
    # line 18
    @('sdd_ring_wafer', 'wafer', '7888A0'), @('sdd_anode_wafer', 'wafer', '98A0B8')
)
foreach ($it in $items) {
    $map = $shapes[$it[1]]
    foreach ($row in $map) { if ($row.Length -ne 16) { throw "$($it[0]): a map row is $($row.Length) wide" } }
    if ($map.Count -ne 16) { throw "$($it[0]): the map is $($map.Count) rows" }
    $c = New-Canvas
    Write-Map $c 0 0 $map (New-Tint $it[2])
    Out-Tex $c "item/$($it[0]).png"
}

# self-check: alpha 0 or 255, nothing pure black, enough opaque pixels
$problems = New-Object System.Collections.Generic.List[string]
foreach ($it in $items) {
    $p = Read-Png (Join-Path $OutRoot ("item\$($it[0]).png"))
    $opaque = 0
    for ($i = 0; $i -lt $p.P.Length; $i++) {
        $v = $p.P[$i]; $a = ($v -shr 24) -band 255
        if ($a -ne 0 -and $a -ne 255) { $problems.Add("item/$($it[0]): partial alpha at $i") }
        if ($a -eq 255 -and ($v -band 0xFFFFFF) -eq 0) { $problems.Add("item/$($it[0]): pure black at $i") }
        if ($a -eq 255) { $opaque++ }
    }
    if ($opaque -lt 40) { $problems.Add("item/$($it[0]): only $opaque opaque pixels") }
}
if ($problems.Count -gt 0) { $problems | Select-Object -First 20 | ForEach-Object { Write-Error $_ -ErrorAction Continue }; exit 1 }

Write-Host "$ScriptName wrote $($written.Count) files"
if ($Credits) {
    foreach ($w in $written) { Write-Host "| pack/kubejs/assets/grindless/textures/$w | drawn procedurally by tools/assets/$ScriptName | ours |" }
}
