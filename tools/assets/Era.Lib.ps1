<#
.SYNOPSIS
  Era-style library of the Gregtech Grindless texture generators: one visual style per era, beyond the palette.

.DESCRIPTION
  A style (see $script:EraStyles) names the era's shape language, wear, trim and panel lines, and the tone curve that
  lands its luminance and saturation on the era's targets. Steam to ZPM are only DESCRIBED (Apply = $false, identity
  curve): the table records what their textures already look like and nothing here touches them. UV, UHV and UXV carry
  the targets later parts will apply. UEV, UIV, OpV and MAX each have a distinct signature (RF-6A, docs/reforge/06_assets_audit.md
  sections 3.4, 6 and 7).

  Two entry points, both deterministic (hashes of the file name and position, no random generator):
    New-EraComponentBody   shared component-body function: shape + shading ramp + accent for one item kind, driven by the era style.
    Convert-EraTexture     finishing pass on any finished canvas: silhouette, trim, wear, panel lines, then the era tone curve.
                           Items get all of it; blocks get trim, wear, seams and the curve; overlays only the curve (their
                           silhouette and casing convention stay as drawn).

  Use from a generator, after Pixel.Lib.ps1 and before any Save-Png:
      $EraName = 'opv'
      . (Join-Path $PSScriptRoot 'Era.Lib.ps1')
  Dot-sourcing with $EraName set replaces Save-Png (Pixel.Lib.ps1, unchanged) with a wrapper that runs Convert-EraTexture
  on the canvas first; without $EraName the library only defines its functions. Pixel.Lib.ps1 must be dot-sourced first.
#>

if (-not (Get-Command Hex -ErrorAction SilentlyContinue)) { throw 'Era.Lib.ps1: dot-source Pixel.Lib.ps1 first' }

# Tone curve: l' = LumLo + (LumHi - LumLo) * l^Gamma ; s' = s * SatGain + SatLift (colourful pixels).
# Near-grey pixels (s < 0.12) are pulled toward Tint (hue TintHue, up to TintSat) so metals take the era's cast.
# LumTarget / SatTarget are the era's mean item luminance and saturation the curve aims for (audit units, 0..1).
function New-EraStyle {
    param([hashtable]$S)
    $d = @{
        Apply = $false; Shape = 'none'; Wear = 'none'; WearDensity = 0.0; Trim = 'none'; Panel = 'none'; Glint = 0; RampSteps = 4
        Gamma = 1.0; LumLo = 0.0; LumHi = 1.0; SatGain = 1.0; SatLift = 0.0; TintHue = 0.0; TintSat = 0.0
        LumTarget = 0.0; SatTarget = 0.0; Note = ''
    }
    foreach ($k in $S.Keys) { $d[$k] = $S[$k] }
    return [pscustomobject]$d
}

$script:EraStyles = [ordered]@{
    # Steam to ZPM: described as they are (measured by the RF-6A audit). Identity curve, never applied.
    steam = New-EraStyle @{ Shape = 'hand-drawn'; Wear = 'soot'; Trim = 'rivet-band'; Panel = 'plate'; LumTarget = 0.51; SatTarget = 0.59; RampSteps = 16; Note = 'hand-drawn, saturated brass and iron' }
    lv    = New-EraStyle @{ Shape = 'boxy'; Wear = 'scuff'; Trim = 'stamp'; Panel = 'plate'; LumTarget = 0.40; SatTarget = 0.27; RampSteps = 12; Note = 'tier-stamped components, low colour count' }
    mv    = New-EraStyle @{ Shape = 'boxy'; Wear = 'scuff'; Trim = 'stamp'; Panel = 'plate'; LumTarget = 0.53; SatTarget = 0.35; RampSteps = 7; Note = 'machines carry the identity' }
    hv    = New-EraStyle @{ Shape = 'boxy'; Wear = 'scuff'; Trim = 'bevel'; Panel = 'plate'; LumTarget = 0.54; SatTarget = 0.34; RampSteps = 15; Note = 'decent' }
    ev    = New-EraStyle @{ Shape = 'boxy'; Wear = 'clean'; Trim = 'bevel'; Panel = 'plate'; LumTarget = 0.50; SatTarget = 0.42; RampSteps = 18; Note = 'good variety, few items' }
    iv    = New-EraStyle @{ Shape = 'mixed'; Wear = 'weathered'; Trim = 'bevel'; Panel = 'plate'; LumTarget = 0.51; SatTarget = 0.33; RampSteps = 17; Note = 'strongest mid-game identity' }
    luv   = New-EraStyle @{ Shape = 'mixed'; Wear = 'clean'; Trim = 'bevel'; Panel = 'plate'; LumTarget = 0.48; SatTarget = 0.37; RampSteps = 18; Note = 'good' }
    zpm   = New-EraStyle @{ Shape = 'mixed'; Wear = 'clean'; Trim = 'bevel'; Panel = 'plate'; LumTarget = 0.49; SatTarget = 0.36; RampSteps = 17; Note = 'good; bright and saturated peak' }

    # UV, UHV, UXV: targets for the later parts (Apply stays $false until the part that owns their scripts).
    uv    = New-EraStyle @{ Shape = 'bevel'; Wear = 'machined'; WearDensity = 0.03; Trim = 'edge-light'; Panel = 'seam'; RampSteps = 8; LumTarget = 0.42; SatTarget = 0.30; Gamma = 0.85; LumLo = 0.02; LumHi = 0.97; SatGain = 1.3; SatLift = 0.04; TintHue = 215; TintSat = 0.16; Note = 'deep, cold metal; richer than today' }
    uhv   = New-EraStyle @{ Shape = 'bevel'; Wear = 'scorch'; WearDensity = 0.05; Trim = 'edge-light'; Panel = 'seam'; RampSteps = 8; LumTarget = 0.44; SatTarget = 0.32; Gamma = 0.82; LumLo = 0.02; LumHi = 0.97; SatGain = 1.4; SatLift = 0.05; TintHue = 25; TintSat = 0.16; Note = 'heat-treated, bronze-toned' }
    uxv   = New-EraStyle @{ Shape = 'step'; Wear = 'etched'; WearDensity = 0.04; Trim = 'rim'; Panel = 'grid'; RampSteps = 8; LumTarget = 0.42; SatTarget = 0.30; Gamma = 0.85; LumLo = 0.02; LumHi = 0.97; SatGain = 1.35; SatLift = 0.05; TintHue = 280; TintSat = 0.16; Note = 'violet-tinted etched hardware' }

    # Distinct signatures. UEV and UIV are applied by the later part.
    uev   = New-EraStyle @{ Shape = 'notch'; Wear = 'scorch'; WearDensity = 0.06; Trim = 'edge-light'; Panel = 'rib'; RampSteps = 8; LumTarget = 0.50; SatTarget = 0.36; Gamma = 0.78; LumLo = 0.03; LumHi = 0.97; SatGain = 1.55; SatLift = 0.08; TintHue = 12; TintSat = 0.22; Note = 'ribbed, scorched ember steel' }
    uiv   = New-EraStyle @{ Shape = 'round'; Wear = 'frost'; WearDensity = 0.07; Trim = 'edge-light'; Panel = 'ring'; RampSteps = 8; LumTarget = 0.50; SatTarget = 0.38; Gamma = 0.78; LumLo = 0.03; LumHi = 0.97; SatGain = 1.55; SatLift = 0.08; TintHue = 165; TintSat = 0.22; Note = 'rounded, frosted and cool' }

    # OpV: polished brass-and-ceramic hardware. Chamfered corners, warm bevel trim, verdigris-free brass speckle, one seam.
    opv   = New-EraStyle @{ Apply = $true; Shape = 'bevel'; Wear = 'brass-speckle'; WearDensity = 0.07; Trim = 'bevel'; Panel = 'seam'; Glint = 0; RampSteps = 10
                            Gamma = 0.70; LumLo = 0.02; LumHi = 0.96; SatGain = 1.65; SatLift = 0.10; TintHue = 38; TintSat = 0.30
                            LumTarget = 0.52; SatTarget = 0.42; Note = 'warm polished brass and ceramic; chamfered, seamed' }
    # MAX: pristine pearl-and-prism hardware. Stepped corners, rim light, grid seams with rivets, glints.
    max   = New-EraStyle @{ Apply = $true; Shape = 'step'; Wear = 'none'; WearDensity = 0.0; Trim = 'rim'; Panel = 'grid'; Glint = 2; RampSteps = 12
                            Gamma = 0.62; LumLo = 0.03; LumHi = 1.0; SatGain = 1.85; SatLift = 0.14; TintHue = 196; TintSat = 0.34
                            LumTarget = 0.62; SatTarget = 0.50; Note = 'cool pearl and prism; stepped, gridded, rim-lit, glinting' }
}

function Get-EraStyle {
    param([string]$Era)
    if (-not $script:EraStyles.Contains($Era)) { throw "Era.Lib.ps1: unknown era '$Era'" }
    return $script:EraStyles[$Era]
}

# ---------------------------------------------------------------- helpers

# Private copies of Pixel.Lib's Shade, Mix and Get-Lum: some generators redefine Shade with another signature.
function EraShade { param([int]$Argb, [double]$Factor) $c = Get-Rgba $Argb; return (ConvertTo-Argb (Get-Clamp ($c[0] * $Factor)) (Get-Clamp ($c[1] * $Factor)) (Get-Clamp ($c[2] * $Factor)) $c[3]) }
function EraMix { param([int]$A, [int]$B, [double]$T) $x = Get-Rgba $A; $y = Get-Rgba $B; return (ConvertTo-Argb (Get-Clamp ($x[0] + ($y[0] - $x[0]) * $T)) (Get-Clamp ($x[1] + ($y[1] - $x[1]) * $T)) (Get-Clamp ($x[2] + ($y[2] - $x[2]) * $T)) 255) }
function EraLum { param([int]$Argb) $c = Get-Rgba $Argb; return (0.299 * $c[0] + 0.587 * $c[1] + 0.114 * $c[2]) }
function Get-EraHash {
    param([string]$Text)
    $h = [int64]5381
    foreach ($ch in $Text.ToCharArray()) { $h = (($h * 33) + [int]$ch) -band 0x7FFFFFFF }
    return [int]$h
}

function Get-EraNoise {
    param([int]$X, [int]$Y, [int]$Seed)
    $v = ([int64]($X + 1) * 73856093) -bxor ([int64]($Y + 1) * 19349663) -bxor ([int64]($Seed + 1) * 83492791)
    return [int]([Math]::Abs($v) % 1000)
}

function ConvertTo-EraHsl {
    param([int]$Argb)
    $c = Get-Rgba $Argb
    $r = $c[0] / 255.0; $g = $c[1] / 255.0; $b = $c[2] / 255.0
    $mx = [Math]::Max($r, [Math]::Max($g, $b)); $mn = [Math]::Min($r, [Math]::Min($g, $b))
    $l = ($mx + $mn) / 2.0; $d = $mx - $mn
    if ($d -lt 1e-9) { return @(0.0, 0.0, $l, $c[3]) }
    $s = $d / (1.0 - [Math]::Abs(2.0 * $l - 1.0))
    if ($mx -eq $r) { $h = 60.0 * ((($g - $b) / $d) % 6) } elseif ($mx -eq $g) { $h = 60.0 * ((($b - $r) / $d) + 2) } else { $h = 60.0 * ((($r - $g) / $d) + 4) }
    if ($h -lt 0) { $h += 360.0 }
    return @($h, [Math]::Min(1.0, $s), $l, $c[3])
}

function ConvertFrom-EraHsl {
    param([double]$H, [double]$S, [double]$L, [int]$A = 255)
    $S = [Math]::Max(0.0, [Math]::Min(1.0, $S)); $L = [Math]::Max(0.0, [Math]::Min(1.0, $L))
    $c = (1.0 - [Math]::Abs(2.0 * $L - 1.0)) * $S
    $hp = (($H % 360.0) + 360.0) % 360.0 / 60.0
    $x = $c * (1.0 - [Math]::Abs(($hp % 2) - 1.0))
    switch ([int][Math]::Floor($hp)) {
        0 { $r = $c; $g = $x; $b = 0.0 }
        1 { $r = $x; $g = $c; $b = 0.0 }
        2 { $r = 0.0; $g = $c; $b = $x }
        3 { $r = 0.0; $g = $x; $b = $c }
        4 { $r = $x; $g = 0.0; $b = $c }
        default { $r = $c; $g = 0.0; $b = $x }
    }
    $m = $L - $c / 2.0
    return (ConvertTo-Argb (Get-Clamp (($r + $m) * 255)) (Get-Clamp (($g + $m) * 255)) (Get-Clamp (($b + $m) * 255)) $A)
}

function Test-EraOpaque { param($C, [int]$X, [int]$Y) return ((Get-Px $C $X $Y) -band 0xFF000000) -ne 0 }

function Get-EraNeighbours {
    param($C, [int]$X, [int]$Y)
    $n = 0
    foreach ($d in @(@(1, 0), @(-1, 0), @(0, 1), @(0, -1))) { if (Test-EraOpaque $C ($X + $d[0]) ($Y + $d[1])) { $n++ } }
    return $n
}

# ---------------------------------------------------------------- tone curve
function Invoke-EraTone {
    param($C, $Style)
    for ($i = 0; $i -lt $C.P.Length; $i++) {
        $p = $C.P[$i]
        if (($p -band 0xFF000000) -eq 0) { continue }
        $hsl = ConvertTo-EraHsl $p
        $h = $hsl[0]; $s = $hsl[1]; $l = $hsl[2]
        $l2 = $Style.LumLo + ($Style.LumHi - $Style.LumLo) * [Math]::Pow($l, $Style.Gamma)
        $s2 = $s * $Style.SatGain
        if ($s -gt 0.03) { $s2 += $Style.SatLift }
        if ($s -lt 0.12) {
            $t = 1.0 - $s / 0.12
            if ($t -gt 0.5) { $h = $Style.TintHue }
            $s2 += $Style.TintSat * $t
        }
        $C.P[$i] = ConvertFrom-EraHsl $h $s2 $l2 $hsl[3]
    }
}

# ---------------------------------------------------------------- structure (items and blocks)
# Rounds or steps the silhouette: erases protruding tip pixels nearest to the bounding-box corners (seed picks which corners).
function Invoke-EraShape {
    param($C, $Style, [int]$Seed)
    $passes = 0; $corners = 15
    switch ($Style.Shape) {
        'bevel' { $passes = 1; $corners = 1 + ($Seed % 15) }
        'round' { $passes = 1; $corners = 15 }
        'step'  { $passes = 2; $corners = 1 + ($Seed % 15) }
        'notch' { $passes = 1; $corners = 1 + ($Seed % 15) }
        default { return }
    }
    for ($pass = 0; $pass -lt $passes; $pass++) {
        $x0 = 99; $y0 = 99; $x1 = -1; $y1 = -1
        for ($y = 0; $y -lt $C.H; $y++) { for ($x = 0; $x -lt $C.W; $x++) { if (Test-EraOpaque $C $x $y) { if ($x -lt $x0) { $x0 = $x }; if ($x -gt $x1) { $x1 = $x }; if ($y -lt $y0) { $y0 = $y }; if ($y -gt $y1) { $y1 = $y } } } }
        if ($x1 -lt 0 -or ($x1 - $x0) -lt 6 -or ($y1 - $y0) -lt 6) { return }
        $cx = @($x0, $x1, $x0, $x1); $cy = @($y0, $y0, $y1, $y1)
        for ($k = 0; $k -lt 4; $k++) {
            if (($corners -band (1 -shl $k)) -eq 0) { continue }
            $best = $null; $bd = 99
            for ($y = $y0; $y -le $y1; $y++) { for ($x = $x0; $x -le $x1; $x++) {
                if (-not (Test-EraOpaque $C $x $y)) { continue }
                $d = [Math]::Abs($x - $cx[$k]) + [Math]::Abs($y - $cy[$k])
                if ($d -lt $bd) { $bd = $d; $best = @($x, $y) }
            } }
            if ($null -ne $best -and $bd -le 3 -and (Get-EraNeighbours $C $best[0] $best[1]) -le 2) { Set-Px $C $best[0] $best[1] 0 }
        }
    }
}

# Lit-edge and shade-edge trim on the fill pixels that touch an outline or the background.
function Invoke-EraTrim {
    param($C, $Style)
    if ($Style.Trim -eq 'none') { return }
    $lit = 1.0; $shd = 1.0
    switch ($Style.Trim) {
        'bevel'      { $lit = 1.22; $shd = 0.80 }
        'rim'        { $lit = 1.34; $shd = 0.74 }
        'edge-light' { $lit = 1.20; $shd = 0.86 }
        default      { return }
    }
    $src = [int[]]$C.P.Clone()
    for ($y = 0; $y -lt $C.H; $y++) { for ($x = 0; $x -lt $C.W; $x++) {
        $p = $src[$y * $C.W + $x]
        if (($p -band 0xFF000000) -eq 0) { continue }
        $l = EraLum $p
        if ($l -lt 40) { continue }
        $edgeUL = $false; $edgeDR = $false
        foreach ($d in @(@(-1, 0), @(0, -1))) {
            $q = if ($x + $d[0] -ge 0 -and $y + $d[1] -ge 0) { $src[($y + $d[1]) * $C.W + $x + $d[0]] } else { 0 }
            if (($q -band 0xFF000000) -eq 0 -or (EraLum $q) -lt 0.55 * $l) { $edgeUL = $true }
        }
        foreach ($d in @(@(1, 0), @(0, 1))) {
            $xx = $x + $d[0]; $yy = $y + $d[1]
            $q = if ($xx -lt $C.W -and $yy -lt $C.H) { $src[$yy * $C.W + $xx] } else { 0 }
            if (($q -band 0xFF000000) -eq 0 -or (EraLum $q) -lt 0.55 * $l) { $edgeDR = $true }
        }
        if ($edgeUL) { $C.P[$y * $C.W + $x] = EraShade $p $lit } elseif ($edgeDR) { $C.P[$y * $C.W + $x] = EraShade $p $shd }
    } }
}

function Invoke-EraWear {
    param($C, $Style, [int]$Seed)
    if ($Style.WearDensity -le 0) { return }
    $thr = [int]($Style.WearDensity * 1000)
    $src = [int[]]$C.P.Clone()
    for ($y = 0; $y -lt $C.H; $y++) { for ($x = 0; $x -lt $C.W; $x++) {
        $p = $src[$y * $C.W + $x]
        if (($p -band 0xFF000000) -eq 0 -or (Get-EraNeighbours $C $x $y) -lt 4) { continue }
        $n = Get-EraNoise $x $y ($Seed + 11)
        if ($n -ge $thr) { continue }
        switch ($Style.Wear) {
            'brass-speckle' { $C.P[$y * $C.W + $x] = EraMix (EraShade $p 1.1) (Hex 'E8C070') 0.55 }
            'scorch'        { $C.P[$y * $C.W + $x] = EraShade $p 0.72 }
            'frost'         { $C.P[$y * $C.W + $x] = EraMix $p (Hex 'E0F4FF') 0.5 }
            'machined'      { $C.P[$y * $C.W + $x] = EraShade $p 0.85 }
            'etched'        { $C.P[$y * $C.W + $x] = EraMix $p (Hex 'C8A8F0') 0.4 }
        }
    } }
}

# Panel lines on interior pixels: seam = one line, grid = a row and a column with bright rivets at the row ends, rib / ring left for the UEV and UIV part.
function Invoke-EraPanel {
    param($C, $Style, [int]$Seed)
    if ($Style.Panel -eq 'none') { return }
    $x0 = 99; $y0 = 99; $x1 = -1; $y1 = -1
    for ($y = 0; $y -lt $C.H; $y++) { for ($x = 0; $x -lt $C.W; $x++) { if (Test-EraOpaque $C $x $y) { if ($x -lt $x0) { $x0 = $x }; if ($x -gt $x1) { $x1 = $x }; if ($y -lt $y0) { $y0 = $y }; if ($y -gt $y1) { $y1 = $y } } } }
    if ($x1 -lt 0 -or ($x1 - $x0) -lt 7 -or ($y1 - $y0) -lt 7) { return }
    $src = [int[]]$C.P.Clone()
    $isInner = { param($x, $y) (Test-EraOpaque $C $x $y) -and (Get-EraNeighbours $C $x $y) -eq 4 }
    $col = $x0 + 3 + ($Seed % [Math]::Max(1, ($x1 - $x0 - 5)))
    $row = $y0 + 3 + (($Seed -shr 4) % [Math]::Max(1, ($y1 - $y0 - 5)))
    $vertical = ($Style.Panel -eq 'seam' -or $Style.Panel -eq 'grid')
    $horizontal = ($Style.Panel -eq 'grid' -or $Style.Panel -eq 'rib')
    if ($Style.Panel -eq 'seam' -and ($Seed % 2) -eq 1) { $vertical = $false; $horizontal = $true }
    if ($vertical) { for ($y = $y0; $y -le $y1; $y++) { if (& $isInner $col $y) { $C.P[$y * $C.W + $col] = EraShade $src[$y * $C.W + $col] 0.78 } } }
    if ($horizontal) {
        $first = -1; $last = -1
        for ($x = $x0; $x -le $x1; $x++) { if (& $isInner $x $row) { $C.P[$row * $C.W + $x] = EraShade $src[$row * $C.W + $x] 0.78; if ($first -lt 0) { $first = $x }; $last = $x } }
        if ($Style.Panel -eq 'grid' -and $first -ge 0) {
            foreach ($rx in @($first, $last)) { $C.P[$row * $C.W + $rx] = EraShade $src[$row * $C.W + $rx] 1.5 }
        }
    }
}

# A couple of bright glints on the lit half.
function Invoke-EraGlint {
    param($C, $Style, [int]$Seed)
    $placed = 0
    for ($t = 0; $t -lt 60 -and $placed -lt $Style.Glint; $t++) {
        $x = Get-EraNoise $t 3 $Seed; $y = Get-EraNoise $t 5 $Seed
        $x = 2 + ($x % ($C.W - 5)); $y = 2 + ($y % ($C.H - 5))
        if ($x + $y -gt ($C.W + $C.H) / 2 - 2) { continue }
        if ((Test-EraOpaque $C $x $y) -and (Get-EraNeighbours $C $x $y) -eq 4 -and (EraLum (Get-Px $C $x $y)) -gt 70) {
            Set-Px $C $x $y (EraMix (Get-Px $C $x $y) (Hex 'FFFFFF') 0.72); $placed++
        }
    }
}

# ---------------------------------------------------------------- entry points
# Finishes one canvas. $Path decides the kind (item/, overlay, else block) and seeds the details; animated strips keep every frame in step.
function Convert-EraTexture {
    param($C, [string]$Era, [string]$Path)
    $style = Get-EraStyle $Era
    if (-not $style.Apply) { return $C }
    $norm = $Path -replace '\\', '/'
    $leaf = [System.IO.Path]::GetFileNameWithoutExtension($norm) -replace '_(active|emissive|paused)$', ''
    $kind = 'block'
    if ($norm -match '/item/') { $kind = 'item' } elseif ($norm -match 'overlay') { $kind = 'overlay' }
    $seed = Get-EraHash $leaf
    $frames = 1
    if ($C.H -gt $C.W -and ($C.H % $C.W) -eq 0) { $frames = $C.H / $C.W }
    $out = New-Canvas $C.W $C.H
    for ($f = 0; $f -lt $frames; $f++) {
        $fc = New-Canvas $C.W ($C.H / $frames)
        [Array]::Copy($C.P, $f * $fc.W * $fc.H, $fc.P, 0, $fc.W * $fc.H)
        if ($kind -ne 'overlay') {
            if ($kind -eq 'item') { Invoke-EraShape $fc $style $seed }
            Invoke-EraTrim $fc $style
            Invoke-EraWear $fc $style $seed
            Invoke-EraPanel $fc $style $seed
            if ($kind -eq 'item' -and $style.Glint -gt 0) { Invoke-EraGlint $fc $style $seed }
        }
        Invoke-EraTone $fc $style
        [Array]::Copy($fc.P, 0, $out.P, $f * $fc.W * $fc.H, $fc.W * $fc.H)
    }
    return $out
}

# Shared component body: one item kind drawn with the era's shading ramp (Style.RampSteps tones, so no 3-colour items) and
# accent; silhouette, trim, wear and seams come from Convert-EraTexture at save time. Kinds: heap orb card vial spool crystal
# module capsule chip sail cup cartridge.
function Test-EraBodyShape {
    param([string]$Kind, [int]$X, [int]$Y)
    $dx = $X - 7.5; $dy = $Y - 7.5
    $r = [Math]::Sqrt($dx * $dx + $dy * $dy)
    switch ($Kind) {
        'heap'      { $h = 9 - [Math]::Abs($dx) * 1.1; return ($Y -ge 14 - $h -and $Y -le 14 -and $h -gt 0) }
        'orb'       { return ($r -le 6.2) }
        'card'      { return ($X -ge 2 -and $X -le 13 -and $Y -ge 2 -and $Y -le 13) }
        'vial'      { return (($X -ge 6 -and $X -le 9 -and $Y -ge 1 -and $Y -le 4) -or ($X -ge 4 -and $X -le 11 -and $Y -ge 5 -and $Y -le 14)) }
        'cartridge' { return ($X -ge 1 -and $X -le 14 -and $Y -ge 3 -and $Y -le 12) }
        'spool'     { return ($r -le 6.4 -and $r -ge 1.8) }
        'crystal'   { return ([Math]::Abs($dx) + [Math]::Abs($dy) -le 7.2) }
        'module'    { return (($X -ge 1 -and $X -le 14 -and $Y -ge 4 -and $Y -le 11) -or (($Y -eq 3 -or $Y -eq 12) -and $X % 2 -eq 0 -and $X -ge 2 -and $X -le 13)) }
        'capsule'   { return ($X -ge 5 -and $X -le 10 -and $Y -ge 2 -and $Y -le 13 -and -not (($Y -eq 2 -or $Y -eq 13) -and ($X -eq 5 -or $X -eq 10))) }
        'chip'      { return (($X -ge 3 -and $X -le 12 -and $Y -ge 3 -and $Y -le 12) -or (($X -eq 1 -or $X -eq 2 -or $X -eq 13 -or $X -eq 14) -and $Y -ge 4 -and $Y -le 11 -and $Y % 2 -eq 0)) }
        'sail'      { return ($X -ge 1 -and $Y -ge 1 -and $Y -le 14 -and $X -le 1 + $Y -and ($X -eq 1 -or $X -le 14)) }
        'cup'       { return (($r -le 6.6 -and $Y -ge 5) -or ($X -ge 2 -and $X -le 13 -and $Y -ge 3 -and $Y -le 5)) }
    }
    return $false
}

function Test-EraBodyAccent {
    param([string]$Kind, [int]$X, [int]$Y, [int]$Seed)
    $dx = $X - 7.5; $dy = $Y - 7.5
    $r = [Math]::Sqrt($dx * $dx + $dy * $dy)
    $n = Get-EraNoise $X $Y ($Seed + 7)
    switch ($Kind) {
        'heap'      { return ($n -gt 820) }
        'orb'       { return ($Y -eq 7 -or $Y -eq 8 -or $r -lt 2) }
        'card'      { return ($Y % 3 -eq 1 -and $X -ge 4 -and $X -le 11 -and $X % 4 -ne 0) }
        'vial'      { return ($Y -le 4 -or $Y -ge 9) }
        'cartridge' { return ($Y -ge 5 -and $Y -le 10 -and ($X % 5) -ge 1 -and ($X % 5) -le 3) }
        'spool'     { return (($X + $Y) % 4 -eq 0) }
        'crystal'   { return ($X -ge 8 -and $Y -ge 8) }
        'module'    { return ($Y -ge 6 -and $Y -le 9 -and $X % 3 -ne 0) }
        'capsule'   { return ($Y -ge 5 -and $Y -le 10) }
        'chip'      { return ($X -ge 5 -and $X -le 10 -and $Y -ge 5 -and $Y -le 10 -and ($X + $Y) % 2 -eq 0) }
        'sail'      { return (($X - $Y + 16) % 4 -eq 0) }
        'cup'       { return ($Y -le 5 -or ($r -ge 5.2 -and $X % 2 -eq 0)) }
    }
    return $false
}

function New-EraComponentBody {
    param([string]$Era, [string]$Kind, [string]$Name, [int]$Body, [int]$Accent)
    $style = Get-EraStyle $Era
    $seed = Get-EraHash $Name
    $steps = [Math]::Max(3, $style.RampSteps)
    $c = New-Canvas 16 16
    for ($y = 0; $y -lt 16; $y++) { for ($x = 0; $x -lt 16; $x++) {
        if (-not (Test-EraBodyShape $Kind $x $y)) { continue }
        $base = $Body; if (Test-EraBodyAccent $Kind $x $y $seed) { $base = $Accent }
        # diagonal light ramp quantised to $steps tones, plus a position hash that nudges a pixel one tone up or down
        $t = 1.0 - ($x + $y) / 30.0
        $q = [Math]::Round($t * ($steps - 1))
        $n = Get-EraNoise $x $y $seed
        if ($n -lt 110) { $q-- } elseif ($n -gt 900) { $q++ }
        $q = [Math]::Max(0, [Math]::Min($steps - 1, $q))
        $f = 0.62 + 0.76 * ($q / [double]($steps - 1))
        Set-Px $c $x $y (EraShade $base $f)
    } }
    Add-Outline $c
    return $c
}

# ---------------------------------------------------------------- Save-Png hook
if ($EraName) {
    $script:EraHookName = [string]$EraName
    $script:EraSavePng = (Get-Command Save-Png -CommandType Function).ScriptBlock
    function Save-Png {
        param($C, [string]$Path)
        & $script:EraSavePng (Convert-EraTexture $C $script:EraHookName $Path) $Path
    }
}
