<#
.SYNOPSIS
  Procedural 16x16 pixel art for the OpV antimatter machines' controller faces and the items of the antimatter lines of Gregtech Grindless (package OpV-B3).

.DESCRIPTION
  Every pixel is drawn by this script (palettes and small routines); nothing is copied or edited from GregTech Modern or any
  other mod. Output is deterministic. Same method and steel bezel as Build-UXVCygnusDiskTextures.ps1.

  Writes (under pack/kubejs/assets/grindless/textures/):
    block/multiblock/<machine>/overlay_front.png, overlay_front_active.png(+.mcmeta), overlay_front_active_emissive.png(+.mcmeta)
    item/<name>.png for each item in $Items

  Foundry face: nested trap rings round a bore; working, a pale antiatom orbits. Engine face: a drum with a core; working, the core flares.
  The *_emissive layer holds only the glow and the lamp.

  Conventions: transparent background, outer 1 px ring of a face empty, every pixel fully opaque or fully transparent, none pure
  black, emissive layer a subset of the colour layer. The final check fails the run (non-zero exit) if a written file breaks one.

  Run from the repo root:
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-OpVAntimatterTextures.ps1

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

function New-Face {
    param([string]$Kind, [int]$Frame, [bool]$Active)
    $c = New-Bezel
    $e = New-Canvas
    for ($y = 4; $y -le 9; $y++) { for ($x = 4; $x -le 11; $x++) { Set-Px $c $x $y $Pit } }
    if ($Kind -eq 'trap') {
        # two nested rings of coil round a dark bore
        $coil = Hex 'C08040'; $ring = Hex '8090A0'
        foreach ($x in 4..11) { Set-Px $c $x 4 $ring; Set-Px $c $x 9 $ring }
        foreach ($y in 4..9) { Set-Px $c 4 $y $ring; Set-Px $c 11 $y $ring }
        foreach ($x in 5..10) { Set-Px $c $x 5 $coil; Set-Px $c $x 8 $coil }
        foreach ($y in 5..8) { Set-Px $c 5 $y $coil; Set-Px $c 10 $y $coil }
        if ($Active) {
            $a = @((Hex 'FF40C0'), (Hex 'FF70D8'), (Hex 'FFA0E8'), (Hex 'FFE0F8'))[$Frame % 4]
            $pos = @(@(6, 6), @(9, 6), @(9, 7), @(6, 7))[$Frame % 4]
            Set-Both $c $e $pos[0] $pos[1] $a
            Set-Both $c $e (15 - $pos[0] - 0) (13 - $pos[1]) $a
        }
    }
    else {
        # a drum with a core: a ring of vents round a centre
        $vent = Hex '705050'; $coil = Hex '9090B0'
        foreach ($x in 4..11) { Set-Px $c $x 4 $coil; Set-Px $c $x 9 $coil }
        foreach ($x in 5, 7, 9, 10) { Set-Px $c $x 5 $vent; Set-Px $c $x 8 $vent }
        Set-Px $c 7 6 (Hex '503030'); Set-Px $c 8 6 (Hex '503030'); Set-Px $c 7 7 (Hex '503030'); Set-Px $c 8 7 (Hex '503030')
        if ($Active) {
            $j = @((Hex 'FF7020'), (Hex 'FFA040'), (Hex 'FFD070'), (Hex 'FFF8D0'))[$Frame % 4]
            Set-Both $c $e 7 6 $j; Set-Both $c $e 8 7 $j
            if ($Frame -ge 2) { Set-Both $c $e 8 6 $j; Set-Both $c $e 7 7 $j }
            if ($Frame -eq 3) { Set-Both $c $e 6 6 $j; Set-Both $c $e 9 7 $j; Set-Both $c $e 7 5 $j; Set-Both $c $e 8 8 $j }
        }
    }
    Set-Px $c 7 12 $(if ($Active) { $LampOn } else { $LampOff })
    Set-Px $c 8 12 $(if ($Active) { $LampOn } else { $LampOff })
    if ($Active) { Set-Px $e 7 12 $LampOn; Set-Px $e 8 12 $LampOn }
    for ($i = 0; $i -lt 16; $i++) { foreach ($p in @(@($i, 0), @($i, 15), @(0, $i), @(15, $i))) { Set-Px $c $p[0] $p[1] 0; Set-Px $e $p[0] $p[1] 0 } }
    return @{ C = $c; E = $e }
}

$Faces = @(
    @{ Dir = 'block/multiblock/antihydrogen_foundry'; Kind = 'trap' },
    @{ Dir = 'block/multiblock/annihilation_engine'; Kind = 'drum' }
)
foreach ($f in $Faces) {
    $idle = New-Face $f.Kind 0 $false
    Out-Tex $idle.C "$($f.Dir)/overlay_front.png"
    $col = @(); $emi = @()
    for ($i = 0; $i -lt $Frames; $i++) { $a = New-Face $f.Kind $i $true; $col += , $a.C; $emi += , $a.E }
    Out-Tex (Join-Frames $col) "$($f.Dir)/overlay_front_active.png" $FrameTime
    Out-Tex (Join-Frames $emi) "$($f.Dir)/overlay_front_active_emissive.png" $FrameTime
}

# items: a disc of the item's colours with a dark core and a pattern; the corners stay clear
$Items = @(
    @{ Name = 'trapped_antihydrogen'; A = 'E060FF'; B = '8030B0'; Pat = 'ring' },
    @{ Name = 'cooled_antihydrogen'; A = '60E0FF'; B = '3080B0'; Pat = 'ring' },
    @{ Name = 'activated_absorber_tile'; A = 'B0B8C0'; B = '58E070'; Pat = 'tile' },
    @{ Name = 'spent_acmf_hohlraum'; A = 'A08060'; B = '504030'; Pat = 'can' },
    @{ Name = 'magnesium_fluoride_dust'; A = 'E8ECF0'; B = 'A8B8D0'; Pat = 'tile' },
    @{ Name = 'ti_sapphire_boule'; A = '5078E0'; B = 'E05040'; Pat = 'can' },
    @{ Name = 'lbo_boule'; A = 'C8F0E0'; B = '78B8A0'; Pat = 'can' },
    @{ Name = 'kr_tripler_cell'; A = 'D0D8E8'; B = '90A0F0'; Pat = 'ring' },
    @{ Name = 'octupole_tape'; A = 'C8A060'; B = '706040'; Pat = 'tile' },
    @{ Name = 'octupole_winding'; A = 'D0A858'; B = '60A8D8'; Pat = 'ring' },
    @{ Name = 'potted_octupole_winding'; A = '484850'; B = 'D0A858'; Pat = 'ring' },
    @{ Name = 'cooled_octupole_winding'; A = '70C8F0'; B = '484850'; Pat = 'ring' },
    @{ Name = 'hopg_blank'; A = '505860'; B = '8890A0'; Pat = 'tile' },
    @{ Name = 'hopg_plate'; A = '687078'; B = 'A8B0C0'; Pat = 'tile' },
    @{ Name = 'hopg_offcut'; A = '404850'; B = '706860'; Pat = 'can' },
    @{ Name = 'w_re_alloy_ingot'; A = '9098A8'; B = '505868'; Pat = 'tile' },
    @{ Name = 'cm245_fraction'; A = '90E070'; B = '408030'; Pat = 'ring' },
    @{ Name = 'w_re_hohlraum'; A = 'B0B8C8'; B = '60E080'; Pat = 'can' },
    @{ Name = 'boron_10_dust'; A = '605850'; B = '98E0A0'; Pat = 'ring' },
    @{ Name = 'b4c_10_dust'; A = '383840'; B = '88C8A0'; Pat = 'tile' },
    @{ Name = 'w_b4c_powder'; A = '889098'; B = '405848'; Pat = 'tile' },
    @{ Name = 'gasb_boule'; A = '8898B0'; B = '485870'; Pat = 'can' },
    @{ Name = 'gasb_wafer'; A = 'A8B8D0'; B = '687890'; Pat = 'ring' },
    @{ Name = 'gasb_kerf_dust'; A = '788090'; B = '404858'; Pat = 'tile' },
    @{ Name = 'ingaassb_epi_wafer'; A = 'C07080'; B = '703848'; Pat = 'ring' }
)
function New-ItemTexture {
    param($Spec)
    $c = New-Canvas
    $a = Hex $Spec.A; $b = Hex $Spec.B; $core = Hex '303038'
    for ($y = 0; $y -lt 16; $y++) {
        for ($x = 0; $x -lt 16; $x++) {
            $d = [Math]::Sqrt([Math]::Pow($x - 7.5, 2) + [Math]::Pow($y - 7.5, 2))
            switch ($Spec.Pat) {
                'ring' { if ($d -le 2.2) { Set-Px $c $x $y $core } elseif ($d -le 6.6) { Set-Px $c $x $y $(if (($x + $y) % 3 -eq 0) { $b } else { $a }) } }
                'tile' { if ($x -ge 2 -and $x -le 13 -and $y -ge 2 -and $y -le 13) { Set-Px $c $x $y $(if (($x -band 3) -eq 0 -or ($y -band 3) -eq 0) { $core } elseif (($x + $y) % 5 -eq 0) { $b } else { $a }) } }
                default { if ($x -ge 4 -and $x -le 11 -and $y -ge 2 -and $y -le 13) { Set-Px $c $x $y $(if ($y -le 3 -or $y -ge 12) { $b } elseif ($x -eq 7 -or $x -eq 8) { $core } else { $a }) } }
            }
        }
    }
    return $c
}
foreach ($it in $Items) { Out-Tex (New-ItemTexture $it) "item/$($it.Name).png" }

$problems = New-Object System.Collections.Generic.List[string]
function Test-Pixels {
    param($Png, [string]$Name, [bool]$Ring)
    for ($y = 0; $y -lt $Png.H; $y++) {
        for ($x = 0; $x -lt $Png.W; $x++) {
            $v = $Png.P[$y * $Png.W + $x]; $a = ($v -shr 24) -band 255
            $onRing = ((($x % 16) -eq 0) -or (($x % 16) -eq 15) -or (($y % 16) -eq 0) -or (($y % 16) -eq 15))
            if ($a -ne 0 -and $a -ne 255) { $problems.Add("${Name}: partial alpha at $x,$y") }
            if ($a -eq 255 -and ($v -band 0xFFFFFF) -eq 0) { $problems.Add("${Name}: pure black at $x,$y") }
            if ($Ring -and $onRing -and $a -ne 0) { $problems.Add("${Name}: ring pixel at $x,$y") }
        }
    }
}
foreach ($f in $Faces) {
    $Dir = $f.Dir
    $png = @{}
    foreach ($n in 'overlay_front', 'overlay_front_active', 'overlay_front_active_emissive') { $png[$n] = Read-Png (Join-Path $OutRoot ("$Dir/$n.png" -replace '/', '\')) }
    foreach ($n in $png.Keys) { Test-Pixels $png[$n] "$Dir/$n" $true }
    $cl = $png['overlay_front_active']; $em = $png['overlay_front_active_emissive']
    for ($i = 0; $i -lt $cl.P.Length; $i++) { if ($em.P[$i] -ne 0 -and $em.P[$i] -ne $cl.P[$i]) { $problems.Add("${Dir}: emissive differs from colour at $i") } }
    for ($k = 0; $k -lt $Frames - 1; $k++) {
        $same = $true
        for ($i = 0; $i -lt 256; $i++) { if ($cl.P[$k * 256 + $i] -ne $cl.P[($k + 1) * 256 + $i]) { $same = $false; break } }
        if ($same) { $problems.Add("${Dir}: frame $k repeats frame $($k + 1)") }
    }
}
foreach ($it in $Items) {
    $png = Read-Png (Join-Path $OutRoot "item\$($it.Name).png")
    Test-Pixels $png "item/$($it.Name)" $false
    if ((($png.P[0] -shr 24) -band 255) -ne 0) { $problems.Add("item/$($it.Name): corner is not transparent") }
    $opaque = 0; foreach ($v in $png.P) { if ((($v -shr 24) -band 255) -eq 255) { $opaque++ } }
    if ($opaque -lt 20) { $problems.Add("item/$($it.Name): only $opaque opaque pixels") }
}
if ($problems.Count -gt 0) { $problems | Select-Object -First 20 | ForEach-Object { Write-Error $_ -ErrorAction Continue }; exit 1 }

Write-Host "$ScriptName wrote $($written.Count) files"
if ($Credits) {
    foreach ($w in $written) { Write-Host "| pack/kubejs/assets/grindless/textures/$w | drawn procedurally by tools/assets/$ScriptName | ours |" }
}
