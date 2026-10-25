<#
.SYNOPSIS
  Procedural 16x16 pixel art for the EV Rare Earth Extraction Cascade of Gregtech Grindless: the controller face (GregTech style:
  bevels, top-left light, 3-5 tones per material).

.DESCRIPTION
  Every pixel is drawn by this script (palettes + char maps + small shading routines); nothing is copied or edited from GregTech
  Modern or any other mod. Output is deterministic: re-running overwrites the same bytes (the churn of the mixers comes from
  Get-Noise, a hash of position and frame, not from a random generator). Same method, ramps and checks as Build-EVTextures.ps1
  (whose helpers are copied here so that script stays untouched): neutral steel bezel, EV purple accents, clean stainless steel
  and titanium for the pipework.

  Writes (under pack/kubejs/assets/grindless/textures/):
    block/multiblock/extraction_cascade/overlay_front.png, overlay_front_active.png(+.mcmeta),
    overlay_front_active_emissive.png(+.mcmeta)

  The face is a sight glass onto three stages of the mixer-settler line (gtceu:extraction_cascade, ev/extraction_cascade.js), side
  by side behind dark glass partitions. Each stage has its titanium gearbox on the white PTFE header along the roof, a shaft down to
  an impeller in the mixing chamber, a plate with a pour gap, and the settling chamber below it: pale amber kerosene on top, the
  lilac rare earth chloride solution underneath, with the interface between them. A stainless outlet pipe runs under the stages
  with one tap per product (yellow samarium chloride, off-white mixed chlorides, violet neodymium chloride), and the base carries
  the EV purple stripes and the state lamp, like the platinum plant. 8 frames, frametime 3: the impellers turn (each stage a frame
  behind the one on its left), the emulsion churns, droplets pour through the plates and sink through the kerosene, the interface
  ripples, a kerosene droplet crosses each partition to the right at the top while a droplet of solution crosses it to the left at
  the bottom (counter-current), the taps pulse and the lamp is green. Idle: impellers still, the mixers settled, a flat interface,
  everything a little darker and the red lamp. The emissive layer holds the lamp, the stripes, the crossing droplets and one
  glint on each interface.

  Run from the repo root (PowerShell 5.1 blocks unsigned scripts by default; this bypass only affects that process):
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-ExtractionCascadeTextures.ps1
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-ExtractionCascadeTextures.ps1 -Preview C:\path\cascade.png -Credits

  Overlay conventions (GTM's workable casings, as every other set): transparent background, details only on the overlay, animated
  variants are vertical 16x(16*n) strips with a .png.mcmeta, *_emissive layers hold only the pixels that glow (identical to the colour
  layer). Every pixel is fully opaque or fully transparent and none is pure black. The outer 1 px ring is always left empty so the
  casing shows around the face. Drawn for gtceu:block/casings/solid/machine_casing_inert_ptfe (gtceu:inert_machine_casing, the
  appearance block of ev/extraction_cascade.js); the face has its own dark frame, so it also reads on other casings. The final check
  fails the run (non-zero exit) if any written file breaks one of these rules.

.PARAMETER Only
  Subset of: cascade (comma-separated, also as one string with -File). Default: everything.
.PARAMETER OutRoot
  Textures root. Default: <repo>/pack/kubejs/assets/grindless/textures
.PARAMETER Preview
  Also write a review sheet (x8, nearest neighbour) to this PNG, which must be outside the repository (it is never shipped). Rows:
  the face on the inert casing (idle, then the 8 active frames with their emissive layer); the raw colour layers on a checker
  (transparency check); the emissive layer alone on black; a dark-room view (casing and colour layer dimmed, emissive at full
  brightness); a 3x3 wall idle and active, and the face on four casings (inert PTFE, a pale plate, clean stainless steel and stable
  titanium, idle above and active below).
.PARAMETER Casing
  Optional 16x16 PNG used as the inert casing in the preview (for example GTM's machine_casing_inert_ptfe.png extracted from the jar
  and kept outside the repository). Without it a stand-in drawn by code is used. Context only: it is never written anywhere.
.PARAMETER Credits
  Also print the CREDITS.md "Assets" table rows for the files written.
#>
[CmdletBinding()]
param(
    [string]$OutRoot = '',
    [string[]]$Only = @(),
    [string]$Preview = '',
    [string]$Casing = '',
    [switch]$Credits
)
$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'Pixel.Lib.ps1')

# `powershell -File ... -Only a,b` delivers "a,b" as one string: split it so both calling styles work.
$Only = @($Only | ForEach-Object { $_ -split '[,;\s]+' } | Where-Object { $_ })
$Known = @('cascade')
foreach ($id in $Only) { if ($Known -notcontains $id) { throw "Unknown -Only value '$id' (expected: $($Known -join ', '))" } }

$RepoRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..'))
if (-not $OutRoot) { $OutRoot = Join-Path $RepoRoot 'pack\kubejs\assets\grindless\textures' }
$OutRoot = [System.IO.Path]::GetFullPath($OutRoot)
$ScriptName = Split-Path -Leaf $PSCommandPath

if ($Preview) {
    $Preview = $ExecutionContext.SessionState.Path.GetUnresolvedProviderPathFromPSPath($Preview)
    if ($Preview.StartsWith($RepoRoot.TrimEnd('\') + '\', [System.StringComparison]::OrdinalIgnoreCase)) {
        throw "-Preview must point outside the repository (the review sheet is never shipped): $Preview"
    }
}
if ($Casing) {
    $Casing = $ExecutionContext.SessionState.Path.GetUnresolvedProviderPathFromPSPath($Casing)
    if (-not (Test-Path -LiteralPath $Casing)) { throw "-Casing not found: $Casing" }
}

function Test-Want { param([string]$Id) return ($Only.Count -eq 0 -or $Only -contains $Id) }

$written = New-Object System.Collections.Generic.List[string]
function Out-Tex {
    param($Canvas, [string]$Rel, [int]$FrameTime = 0)
    $path = Join-Path $OutRoot ($Rel -replace '/', '\')
    # an editor, indexer or virus scanner can hold a file for a moment: retry the write a few times
    for ($try = 1; $try -le 6; $try++) {
        try { Save-Png $Canvas $path; if ($FrameTime -gt 0) { Save-Mcmeta ($path + '.mcmeta') $FrameTime }; break }
        catch [System.IO.IOException] { if ($try -eq 6) { throw }; Start-Sleep -Milliseconds (250 * $try) }
    }
    $written.Add($Rel)
    if ($FrameTime -gt 0) { $written.Add($Rel + '.mcmeta') }
}

function Assert-Map {
    param([string]$Name, [string[]]$Rows, [int]$W = 16, [int]$H = 16)
    if ($Rows.Count -ne $H) { throw "${Name}: expected $H rows, got $($Rows.Count)" }
    for ($i = 0; $i -lt $Rows.Count; $i++) { if ($Rows[$i].Length -ne $W) { throw "${Name}: row $i has $($Rows[$i].Length) chars, expected $W" } }
}

# Like New-Palette, but a repeated letter is an error instead of a silent overwrite.
function New-Pal {
    param([string]$Spec)
    $pal = New-Object 'System.Collections.Generic.Dictionary[string,int]' ([System.StringComparer]::Ordinal)
    foreach ($tok in ($Spec -split '\s+')) {
        if ($tok -eq '') { continue }
        $kv = $tok -split '=', 2
        if ($pal.ContainsKey($kv[0])) { throw "Palette letter '$($kv[0])' defined twice" }
        $pal[$kv[0]] = Hex $kv[1]
    }
    return $pal
}

# Sets a pixel on the colour layer and on the emissive layer (the emissive layer may only hold what the colour layer holds).
function Set-Both {
    param($C, $E, [int]$X, [int]$Y, [int]$Argb)
    Set-Px $C $X $Y $Argb; Set-Px $E $X $Y $Argb
}

# An emissive pixel only counts while the colour layer still shows it: drops the ones a later draw covered
# (-Verbose lists how many, to catch a glow that was covered by accident).
function Sync-Emissive {
    param($C, $E)
    $dropped = 0
    for ($i = 0; $i -lt $E.P.Length; $i++) { if ($E.P[$i] -ne 0 -and $E.P[$i] -ne $C.P[$i]) { $E.P[$i] = 0; $dropped++ } }
    if ($dropped -gt 0) { Write-Verbose "Sync-Emissive: $dropped emissive pixel(s) covered by a later draw" }
}

# Deterministic 0..255 hash of (x, y, frame, salt): churn without a random generator.
function Get-Noise {
    param([long]$X, [long]$Y, [long]$T = 0, [long]$Salt = 0)
    $h = (($X * 73856093L) -bxor ($Y * 19349663L) -bxor ($T * 83492791L) -bxor ($Salt * 2654435761L)) % 1000003L
    if ($h -lt 0) { $h = -$h }
    return [int](($h * 7919L) % 256L)
}

# Ramps shared with the EV set (Build-EVTextures.ps1): neutral steel (lit -> dark), EV purple, clean stainless steel, state lamp.
$SteelSpec = 'A=D3D3D3 B=B0B0B0 C=8E8E8E D=707070 E=565656 F=404040 G=2F2F2F H=222222 I=161616 J=0D0D0D'
$PurpleSpec = 'a=F3E4FF b=D6B0FF c=B07AF0 d=8A4CD0 e=5C2E9C f=381C64 g=1C0E36'
$StainSpec = '0=F7FAFF 1=DCE5F0 2=B8C6D8 3=8E9DB2 4=667690 5=465470 6=2C364C'
$LampSpec = 'M=E2FFE4 N=62FF86 O=22C257 P=0C6B2E Q=FF5A48 R=B52D22 S=5E1511'

# ============================================================================================
#  RARE EARTH EXTRACTION CASCADE - controller face (inert PTFE casing)
#  three stages of the mixer-settler line side by side (A x3..5, B x7..9, C x11..13, dark partitions at x6 and x10):
#  y2 motor caps, y3 PTFE header with a titanium gearbox over each stage, y4 shaft in the emulsion, y5 impeller, y6 plate with a
#  pour gap, y7..8 kerosene, y9 interface, y10..11 chloride solution, y12 outlet pipe with the product taps, y13 stripes and lamp
# ============================================================================================
#   kerosene (organic): h top, i body, j bottom, k deep, K crossing droplet
#   chloride solution (aqueous): p sheen, q body, r bottom, s deep, L crossing droplet
#   emulsion: u light, v mid, w dark          PTFE header: x lit end, y pipe, z shaded end          titanium gearbox: m, n, o
#   taps: samarium chloride T U V, neodymium chloride X Y Z, mixed chlorides 7 8 (light, colour, dark; the mixed one has two)
$CascadePal = New-Pal ($SteelSpec + ' ' + $PurpleSpec + ' ' + $StainSpec + ' ' + $LampSpec + ' ' + @'
h=FFEDB8 i=F4CF78 j=DCA94C k=A87830 K=FFF4CC
p=F3E0F0 q=DDBCD6 r=C29ABD s=9C749C L=FCE4F6
u=EED8C6 v=D2B0A2 w=AA8A80
x=F4F5F6 y=D4D7DC z=A5AAB2
m=F2D2FA n=D8A6EC o=A472C2
T=F4EEB8 U=E8E0A0 V=9C9452
X=E2CCE4 Y=C6A2C8 Z=7A5079
7=F6F0E6 8=EFE6DA 9=B8A48C
'@)

# The bezel and the two partitions; everything inside is drawn by code.
$CascadeBase = @(
    '................',
    '.CDDDDDDDDDDDDE.',
    '.DGGGGGGGGGGGGF.',
    '.DGIIIIIIIIIIIF.',
    '.DGIIIFIIIFIIIF.',
    '.DGIIIFIIIFIIIF.',
    '.DGIIIFIIIFIIIF.',
    '.DGIIIFIIIFIIIF.',
    '.DGIIIFIIIFIIIF.',
    '.DGIIIFIIIFIIIF.',
    '.DGIIIFIIIFIIIF.',
    '.DGIIIFIIIFIIIF.',
    '.DGIIIIIIIIIIIF.',
    '.DGGGGGGGGGGGGF.',
    '.EFFFFFFFFFFFFG.',
    '................'
)
Assert-Map 'CascadeBase' $CascadeBase

$CascadeStages = @(4, 8, 12)    # centre column of each stage
$CascadeWalls = @(6, 10)        # the partitions between them
$CascadeDim = 0.72              # idle: the liquids rest in the dark
# impeller (y5, three pixels): a glint sweeps across the blades as they turn, one step per frame
$CascadeImpeller = @('ACE', 'CAD', 'DCB', 'EDC')
# taps under the stages: light, colour, dark (the colours of the three chloride materials of ev/extraction_cascade.js)
$CascadeTaps = @('TUV', '789', 'XYZ')

function New-CascadeFrame {
    param([bool]$Active, [int]$T = 0)
    $c = New-Canvas; $e = New-Canvas
    $P = $CascadePal
    Write-Map $c 0 0 $CascadeBase $P
    $lit = if ($Active) { 1.0 } else { $CascadeDim }

    # ---- header (y3): the white PTFE pipe along the roof, lit at its left end
    for ($x = 3; $x -le 13; $x++) {
        $ch = if ($x -eq 3) { 'x' } elseif ($x -eq 13) { 'z' } else { 'y' }
        Set-Px $c $x 3 $P[$ch]
    }

    for ($s = 0; $s -lt 3; $s++) {
        $xc = $CascadeStages[$s]
        # titanium gearbox on the header
        Set-Px $c $xc 3 $P['o']
        # shaft (y4) in the emulsion: its two sides flicker against each other and now and then show a droplet of either phase;
        # at rest the mixer has settled into kerosene
        Set-Px $c $xc 4 $P['B']
        foreach ($dx in -1, 1) {
            if ($Active) {
                $k = ($T + $s) % 4
                $ch = if ((($T + $s + $dx + 1) % 2) -eq 0) { 'u' } else { 'v' }
                if ($k -eq 1 -and $dx -lt 0) { $ch = 'i' } elseif ($k -eq 3 -and $dx -gt 0) { $ch = 'q' }
                Set-Px $c ($xc + $dx) 4 $P[$ch]
            } else { Set-Px $c ($xc + $dx) 4 (Shade $P['j'] $lit) }
        }
        # impeller (y5): each stage turns a frame behind the one on its left
        $ph = if ($Active) { ($T + 4 - $s) % 4 } else { 0 }
        for ($i = 0; $i -lt 3; $i++) {
            $col = $P[[string]$CascadeImpeller[$ph][$i]]
            if (-not $Active) { $col = Shade $col 0.8 }
            Set-Px $c ($xc - 1 + $i) 5 $col
        }
        # plate (y6) with the pour gap under the impeller
        Set-Px $c ($xc - 1) 6 $P['F']; Set-Px $c ($xc + 1) 6 $P['F']
        Set-Px $c $xc 6 $(if ($Active) { $P['v'] } else { $P['H'] })
        # settling chamber: kerosene (y7..8), interface (y9), chloride solution (y10..11)
        for ($dx = -1; $dx -le 1; $dx++) {
            $x = $xc + $dx
            Set-Px $c $x 7 (Shade $P['h'] $lit)
            Set-Px $c $x 8 (Shade $P['i'] $lit)
            if ($Active) {
                # the interface ripples to the right: two pixels of solution up, two of kerosene down, one step per frame (each
                # stage one pixel out of step with its neighbour)
                $up = ((($x - $T + $s) % 4 + 4) % 4) -lt 2
                Set-Px $c $x 9 $P[$(if ($up) { 'q' } else { 'j' })]
            } else { Set-Px $c $x 9 (Shade $P['j'] $lit) }
            Set-Px $c $x 10 (Shade $P['q'] $lit)
            Set-Px $c $x 11 (Shade $P['r'] $lit)
        }
    }

    # ---- the glass partitions, seen edge on: a darker line of whatever is behind them
    foreach ($wx in $CascadeWalls) {
        for ($y = 4; $y -le 11; $y++) {
            Set-Px $c $wx $y (Shade (Mix (Get-Px $c ($wx - 1) $y) (Get-Px $c ($wx + 1) $y) 0.5) 0.62)
        }
    }

    if ($Active) {
        for ($s = 0; $s -lt 3; $s++) {
            $xc = $CascadeStages[$s]
            # a droplet of solution pours through the gap and sinks through the kerosene to the interface
            $k = ($T + 2 * $s) % 4
            if ($k -eq 1) { Set-Px $c $xc 7 $P['r'] } elseif ($k -eq 2) { Set-Px $c $xc 8 $P['r'] }
            # one glint rides each interface on the first crest pixel
            for ($dx = -1; $dx -le 1; $dx++) {
                $x = $xc + $dx
                if (((($x - $T + $s) % 4 + 4) % 4) -eq 0) { Set-Both $c $e $x 9 $P['p']; break }
            }
        }
    }

    # ---- counter-current: kerosene crosses each partition to the right at the top, solution to the left at the bottom
    if ($Active) {
        for ($w = 0; $w -lt 2; $w++) {
            $wx = $CascadeWalls[$w]
            $k = ($T + 2 * $w) % 4
            if ($k -lt 3) { Set-Both $c $e ($wx - 1 + $k) 8 $P['K'] }
            $k = ($T + 2 * $w + 2) % 4
            if ($k -lt 3) { Set-Both $c $e ($wx + 1 - $k) 11 $P['L'] }
        }
    }

    # ---- outlet pipe (y12), dark stainless, with one tap per product under each stage
    for ($x = 3; $x -le 13; $x++) {
        $ch = if ($x -eq 3) { '4' } elseif ($x -eq 13) { '6' } else { '5' }
        Set-Px $c $x 12 $P[$ch]
    }
    for ($s = 0; $s -lt 3; $s++) {
        $tone = if ($Active) { if ((($T + 2 * $s) % 4) -lt 2) { 0 } else { 1 } } else { 2 }
        Set-Px $c $CascadeStages[$s] 12 $P[[string]$CascadeTaps[$s][$tone]]
    }

    # ---- base strip (y13): EV purple stripes x3..9, state lamp x11..13
    foreach ($x in 3..9) {
        if (($x % 4) -lt 2) {
            if ($Active) { Set-Both $c $e $x 13 $P['c'] } else { Set-Px $c $x 13 $P['e'] }
        } else { Set-Px $c $x 13 $P['g'] }
    }
    if ($Active) {
        $core = if (($T % 4) -lt 2) { 'M' } else { 'N' }
        Set-Both $c $e 11 13 $P[$core]; Set-Both $c $e 12 13 $P['N']; Set-Both $c $e 13 13 $P['O']
    } else {
        Set-Px $c 11 13 $P['Q']; Set-Px $c 12 13 $P['R']; Set-Px $c 13 13 $P['S']
    }

    Sync-Emissive $c $e
    return @{ Color = $c; Emi = $e }
}

# ============================================================================================
#  BUILD
# ============================================================================================
$CascadeDir = 'block/multiblock/extraction_cascade'
$CascadeFrameTime = 3

function Out-Overlay {
    param([string]$Dir, $Builder, [int]$FrameTime)
    $frames = @(); $emis = @()
    for ($f = 0; $f -lt 8; $f++) { $r = & $Builder $true $f; $frames += $r.Color; $emis += $r.Emi }
    $idle = & $Builder $false 0
    Out-Tex $idle.Color "$Dir/overlay_front.png"
    Out-Tex (Join-Frames $frames) "$Dir/overlay_front_active.png" $FrameTime
    Out-Tex (Join-Frames $emis) "$Dir/overlay_front_active_emissive.png" $FrameTime
}

if (Test-Want 'cascade') { Out-Overlay $CascadeDir ${function:New-CascadeFrame} $CascadeFrameTime }

# ============================================================================================
#  VERIFY what was written: 16x16 frames (the idle face a single one, the strips exactly 8), binary alpha, no pure black, a
#  frametime of 2-4, an animation that really animates, the empty casing ring, and an emissive layer inside the colour layer
# ============================================================================================
$problems = 0
foreach ($rel in $written) {
    $path = Join-Path $OutRoot ($rel -replace '/', '\')
    $msgs = @()
    if ($rel.EndsWith('.mcmeta')) {
        $ft = 0
        try { $ft = [int]((Get-Content -LiteralPath $path -Raw | ConvertFrom-Json).animation.frametime) } catch { $msgs += 'unreadable .mcmeta' }
        if ($ft -lt 2 -or $ft -gt 4) { $msgs += "frametime $ft (expected 2-4)" }
        if ($msgs.Count -gt 0) { $problems++; Write-Warning "$rel : $($msgs -join '; ')" }
        continue
    }
    $img = Read-Png $path
    $nf = [int][Math]::Floor($img.H / 16)
    $strip = Test-Path -LiteralPath ($path + '.mcmeta')
    if ($img.W -ne 16 -or ($img.H % 16) -ne 0) { $msgs += "bad size $($img.W)x$($img.H)" }
    elseif ($strip -and $nf -ne 8) { $msgs += "animation has $nf frames (expected 8)" }
    elseif (-not $strip -and $nf -ne 1) { $msgs += "static face is $($img.W)x$($img.H) (expected 16x16)" }
    $opaque = 0; $black = 0; $partial = 0
    foreach ($px in $img.P) {
        $alpha = ($px -shr 24) -band 255
        if ($alpha -ne 0 -and $alpha -ne 255) { $partial++; continue }
        if ($alpha -eq 255) {
            $opaque++
            if (($px -band 0xFFFFFF) -eq 0) { $black++ }
        }
    }
    if ($partial -gt 0) { $msgs += "$partial partially transparent px" }
    if ($opaque -eq 0) { $msgs += 'fully transparent' }
    if ($black -gt 0) { $msgs += "$black pure-black px" }
    if ($strip -and $rel -notlike '*_emissive.png') {
        $seen = @{}
        for ($f = 0; $f -lt $nf; $f++) { $seen[(($img.P[($f * 256)..($f * 256 + 255)]) -join ',')] = 1 }
        if ($seen.Count -lt 4) { $msgs += "only $($seen.Count) distinct frames out of $nf" }
    }
    # the casing's outer 1 px ring stays visible in every frame
    $ring = 0
    for ($f = 0; $f -lt $nf; $f++) { for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
        if ($x -ge 1 -and $y -ge 1 -and $x -le 14 -and $y -le 14) { continue }
        if ((($img.P[($f * 16 + $y) * 16 + $x] -shr 24) -band 255) -ne 0) { $ring++ }
    } } }
    if ($ring -gt 0) { $msgs += "$ring opaque px in the casing ring" }
    # an emissive layer may only contain pixels that exist, identical, in the colour layer, and every frame has a glow
    if ($rel -like '*_active_emissive.png') {
        $colorPath = Join-Path $OutRoot (($rel -replace '_emissive\.png$', '.png') -replace '/', '\')
        $color = Read-Png $colorPath
        if ($color.H -ne $img.H) { $msgs += 'emissive strip height differs from the colour strip' }
        else {
            $stray = 0
            for ($i = 0; $i -lt $img.P.Length; $i++) {
                if ((($img.P[$i] -shr 24) -band 255) -ne 0 -and $img.P[$i] -ne $color.P[$i]) { $stray++ }
            }
            if ($stray -gt 0) { $msgs += "$stray emissive px not present in the colour layer" }
        }
        for ($f = 0; $f -lt $nf; $f++) {
            $glow = 0
            for ($i = $f * 256; $i -lt ($f + 1) * 256; $i++) { if ((($img.P[$i] -shr 24) -band 255) -ne 0) { $glow++ } }
            if ($glow -eq 0) { $msgs += "emissive frame $f is empty" }
        }
    }
    if ($msgs.Count -gt 0) { $problems++; Write-Warning "$rel : $($msgs -join '; ')" }
}

Write-Host "written $($written.Count) files under $OutRoot ($problems with warnings)"
foreach ($rel in $written) {
    $hash = (Get-FileHash -Algorithm SHA256 -LiteralPath (Join-Path $OutRoot ($rel -replace '/', '\'))).Hash.Substring(0, 16).ToLowerInvariant()
    Write-Host "  $rel  sha256:$hash"
}

# ============================================================================================
#  PREVIEW (optional, never shipped)
# ============================================================================================
if ($Preview) {
    function Get-Frame { param($Strip, [int]$Index) $f = New-Canvas 16 16; [Array]::Copy($Strip.P, $Index * 256, $f.P, 0, 256); return $f }
    function Merge-On { param($Dst, $Src) $o = Copy-Canvas $Dst; Merge-Canvas $o $Src; return $o }
    function Get-Dimmed {
        param($C, [double]$Factor)
        $o = Copy-Canvas $C
        for ($i = 0; $i -lt $o.P.Length; $i++) { if ((($o.P[$i] -shr 24) -band 255) -ne 0) { $o.P[$i] = Shade $o.P[$i] $Factor } }
        return $o
    }
    # a bevelled casing drawn by code: a lit rim top/left, a shaded rim bottom/right, grooves and a recessed panel in the middle.
    # keys: a lit rim, b top rim, c face, d groove, e shaded rim, f bottom rim, l panel, m panel stripe
    function New-StandInPanel {
        param([string]$Spec)
        $c = New-Canvas 16 16
        $pal = New-Palette $Spec
        for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
            $ch = 'c'
            if ($y -le 2) { $ch = 'b' } elseif ($y -ge 13) { $ch = 'f' }
            if ($x -le 1 -and $y -gt 2 -and $y -lt 13) { $ch = 'a' } elseif ($x -ge 14 -and $y -gt 2 -and $y -lt 13) { $ch = 'e' }
            if ($y -eq 3 -or $y -eq 12 -or $y -eq 15) { $ch = 'd' }
            if ($x -ge 4 -and $x -le 11 -and $y -ge 4 -and $y -le 11) { $ch = if (($x % 3) -eq 1) { 'm' } else { 'l' } }
            $c.P[$y * 16 + $x] = $pal[$ch]
        } }
        return $c
    }
    # GTM's inert casing is a dark grey PTFE plate: the stand-in is a dark grey panel
    $inert = if ($Casing) { Get-Frame (Read-Png $Casing) 0 } else { New-StandInPanel 'a=4A4A4A b=424242 c=383838 d=1E1E1E e=2C2C2C f=262626 l=3E3E3E m=454545' }
    $pale = New-StandInPanel 'a=F4F6FA b=E8ECF2 c=DCE1E8 d=9AA2AE e=C2C9D3 f=B4BCC7 l=CDD3DC m=D8DDE5'
    $stainless = New-StandInPanel 'a=DDE1E6 b=CFD4DA c=BFC5CC d=6B727B e=98A0A9 f=868E98 l=A2AAB3 m=B2B9C1'
    $titanium = New-StandInPanel 'a=EBD0F2 b=DDBDE8 c=C9A3D8 d=7E5A8F e=A883BA f=9470A8 l=B48FC6 m=C39ED2'
    $checker = New-Canvas 16 16
    for ($i = 0; $i -lt 256; $i++) { $checker.P[$i] = if (((($i % 16) + [int][Math]::Floor($i / 16)) % 2) -eq 0) { Hex '3C4048' } else { Hex '4A4F58' } }
    $black = New-Canvas 16 16
    for ($i = 0; $i -lt 256; $i++) { $black.P[$i] = Hex '0A0B0D' }

    $dir = Join-Path $OutRoot ($CascadeDir -replace '/', '\')
    $idle = Read-Png (Join-Path $dir 'overlay_front.png')
    $act = Read-Png (Join-Path $dir 'overlay_front_active.png')
    $emi = Read-Png (Join-Path $dir 'overlay_front_active_emissive.png')
    $lit = @(); for ($f = 0; $f -lt 8; $f++) { $lit += (Merge-On (Get-Frame $act $f) (Get-Frame $emi $f)) }

    # composed at 1x (2 px gaps become 16 px) and scaled at the end
    $sheet = New-Canvas 174 124
    for ($i = 0; $i -lt $sheet.P.Length; $i++) { $sheet.P[$i] = Hex '1E2126' }
    function Add-Tile { param($Tile, [int]$X0, [int]$Y0) Merge-Canvas $sheet $Tile $X0 $Y0 }
    function Add-Wall {
        param($Tile, $Face, [int]$X0, [int]$Y0)
        for ($j = 0; $j -lt 3; $j++) { for ($i = 0; $i -lt 3; $i++) {
            $t = if ($i -eq 1 -and $j -eq 1) { Merge-On $Tile $Face } else { $Tile }
            Add-Tile $t ($X0 + 16 * $i) ($Y0 + 16 * $j)
        } }
    }
    $nightCasing = Get-Dimmed $inert 0.3
    # row 1: on the inert casing | row 2: raw layers on a checker | row 3: emissive alone | row 4: dark room
    Add-Tile (Merge-On $inert $idle) 2 2
    Add-Tile (Merge-On $checker $idle) 2 20
    Add-Tile $black 2 38
    Add-Tile (Merge-On $nightCasing (Get-Dimmed $idle 0.3)) 2 56
    for ($f = 0; $f -lt 8; $f++) {
        $x0 = 22 + 18 * $f
        Add-Tile (Merge-On $inert $lit[$f]) $x0 2
        Add-Tile (Merge-On $checker (Get-Frame $act $f)) $x0 20
        Add-Tile (Merge-On $black (Get-Frame $emi $f)) $x0 38
        Add-Tile (Merge-On (Merge-On $nightCasing (Get-Dimmed (Get-Frame $act $f) 0.3)) (Get-Frame $emi $f)) $x0 56
    }
    # row 5: 3x3 walls (idle, active frame 2) and the face on four casings (idle above, active frame 2 below)
    Add-Wall $inert $idle 2 74
    Add-Wall $inert $lit[2] 52 74
    $k = 0
    foreach ($cs in @($inert, $pale, $stainless, $titanium)) {
        Add-Tile (Merge-On $cs $idle) (102 + 18 * $k) 74
        Add-Tile (Merge-On $cs $lit[2]) (102 + 18 * $k) 92
        $k++
    }

    # nearest-neighbour x8
    $scale = 8
    $big = New-Canvas ($sheet.W * $scale) ($sheet.H * $scale)
    $row = New-Object 'int[]' ($big.W)
    for ($y = 0; $y -lt $sheet.H; $y++) {
        for ($x = 0; $x -lt $sheet.W; $x++) { $v = $sheet.P[$y * $sheet.W + $x]; for ($i = 0; $i -lt $scale; $i++) { $row[$x * $scale + $i] = $v } }
        for ($j = 0; $j -lt $scale; $j++) { [Array]::Copy($row, 0, $big.P, ($y * $scale + $j) * $big.W, $big.W) }
    }
    $pdir = Split-Path -Parent $Preview
    if ($pdir -and -not (Test-Path -LiteralPath $pdir)) { New-Item -ItemType Directory -Force -Path $pdir | Out-Null }
    $bmp = ConvertTo-Bitmap $big
    try { $bmp.Save($Preview, [System.Drawing.Imaging.ImageFormat]::Png) } finally { $bmp.Dispose() }
    $note = if ($Casing) { Split-Path -Leaf $Casing } else { 'inert casing stand-in drawn by code' }
    Write-Host "preview: $Preview (on $note; rows: on the casing, raw on a checker, emissive alone, dark room; 3x3 walls and four casings)"
}

if ($problems -gt 0) { throw "$problems file(s) failed the texture checks (see the warnings above)" }

if ($Credits) {
    Write-Host ''
    foreach ($rel in $written) {
        Write-Host ("| ``pack/kubejs/assets/grindless/textures/$rel`` | Generated with tools/assets/$ScriptName (procedural pixel art, original) by the extraction cascade agent, 2026-10-25 | the pack's licence (pending; proposed CC BY-SA 4.0) |")
    }
}
