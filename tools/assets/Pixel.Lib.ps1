<#
.SYNOPSIS
  Pixel-art helpers shared by the Gregtech Grindless texture generators (System.Drawing only).

.DESCRIPTION
  Canvases are flat [int[]] ARGB arrays (0 = fully transparent), so a 16x16 texture is just 256 ints and
  every build is deterministic. Palettes are case-sensitive char -> colour dictionaries, so pixel maps can
  be written as string arrays ('.' = untouched/transparent, '_' = erase).

  Dot-source this file: . (Join-Path $PSScriptRoot 'Pixel.Lib.ps1')
#>

Add-Type -AssemblyName System.Drawing

# ---------------------------------------------------------------- colours
function ConvertTo-Argb {
    param([int]$R, [int]$G, [int]$B, [int]$A = 255)
    $v = [long]$A * 16777216 + [long]$R * 65536 + [long]$G * 256 + [long]$B
    if ($v -gt 2147483647) { $v -= 4294967296 }
    return [int]$v
}

function Get-Rgba {
    param([int]$Argb)
    return @((($Argb -shr 16) -band 255), (($Argb -shr 8) -band 255), ($Argb -band 255), (($Argb -shr 24) -band 255))
}

# 'RRGGBB' or 'RRGGBBAA'
function Hex {
    param([string]$H)
    $H = $H.TrimStart('#')
    $r = [Convert]::ToInt32($H.Substring(0, 2), 16)
    $g = [Convert]::ToInt32($H.Substring(2, 2), 16)
    $b = [Convert]::ToInt32($H.Substring(4, 2), 16)
    $a = 255
    if ($H.Length -ge 8) { $a = [Convert]::ToInt32($H.Substring(6, 2), 16) }
    return (ConvertTo-Argb $r $g $b $a)
}

function Get-Clamp { param([double]$V) if ($V -lt 0) { return 0 } elseif ($V -gt 255) { return 255 } else { return [int][Math]::Round($V) } }

# Multiplies RGB by a factor (alpha kept).
function Shade {
    param([int]$Argb, [double]$Factor)
    $c = Get-Rgba $Argb
    return (ConvertTo-Argb (Get-Clamp ($c[0] * $Factor)) (Get-Clamp ($c[1] * $Factor)) (Get-Clamp ($c[2] * $Factor)) $c[3])
}

function Mix {
    param([int]$A, [int]$B, [double]$T)
    $x = Get-Rgba $A; $y = Get-Rgba $B
    return (ConvertTo-Argb (Get-Clamp ($x[0] + ($y[0] - $x[0]) * $T)) (Get-Clamp ($x[1] + ($y[1] - $x[1]) * $T)) (Get-Clamp ($x[2] + ($y[2] - $x[2]) * $T)) 255)
}

function Get-Lum {
    param([int]$Argb)
    $c = Get-Rgba $Argb
    return (0.299 * $c[0] + 0.587 * $c[1] + 0.114 * $c[2])
}

# "a=FFE6A0 B=F0C055 ..." -> case-sensitive dictionary char -> ARGB
function New-Palette {
    param([string]$Spec)
    $p = New-Object 'System.Collections.Generic.Dictionary[string,int]' ([System.StringComparer]::Ordinal)
    foreach ($tok in ($Spec -split '\s+')) {
        if ($tok -eq '') { continue }
        $kv = $tok -split '=', 2
        $p[$kv[0]] = Hex $kv[1]
    }
    return $p
}

# ---------------------------------------------------------------- canvas
function New-Canvas {
    param([int]$W = 16, [int]$H = 16)
    return [pscustomobject]@{ W = $W; H = $H; P = (New-Object 'int[]' ($W * $H)) }
}

function Copy-Canvas {
    param($C)
    return [pscustomobject]@{ W = $C.W; H = $C.H; P = [int[]]$C.P.Clone() }
}

function Set-Px {
    param($C, [int]$X, [int]$Y, [int]$Argb)
    if ($X -ge 0 -and $Y -ge 0 -and $X -lt $C.W -and $Y -lt $C.H) { $C.P[$Y * $C.W + $X] = $Argb }
}

function Get-Px {
    param($C, [int]$X, [int]$Y)
    if ($X -ge 0 -and $Y -ge 0 -and $X -lt $C.W -and $Y -lt $C.H) { return $C.P[$Y * $C.W + $X] }
    return 0
}

function Set-Rect {
    param($C, [int]$X, [int]$Y, [int]$W, [int]$H, [int]$Argb)
    for ($j = 0; $j -lt $H; $j++) { for ($i = 0; $i -lt $W; $i++) { Set-Px $C ($X + $i) ($Y + $j) $Argb } }
}

# Draws a char map: '.' or ' ' leave the pixel alone, '_' erases it, anything else must be in the palette.
function Write-Map {
    param($C, [int]$X0, [int]$Y0, [string[]]$Rows, $Pal)
    for ($j = 0; $j -lt $Rows.Count; $j++) {
        $row = $Rows[$j]
        for ($i = 0; $i -lt $row.Length; $i++) {
            $ch = [string]$row[$i]
            if ($ch -eq '.' -or $ch -eq ' ') { continue }
            if ($ch -eq '_') { Set-Px $C ($X0 + $i) ($Y0 + $j) 0; continue }
            if (-not $Pal.ContainsKey($ch)) { throw "Unknown palette char '$ch' (map row $j, col $i)" }
            Set-Px $C ($X0 + $i) ($Y0 + $j) $Pal[$ch]
        }
    }
}

# Paints the opaque pixels of $Src onto $Dst (alpha 0 = skip).
function Merge-Canvas {
    param($Dst, $Src, [int]$X0 = 0, [int]$Y0 = 0)
    for ($y = 0; $y -lt $Src.H; $y++) { for ($x = 0; $x -lt $Src.W; $x++) {
        $c = $Src.P[$y * $Src.W + $x]
        if (($c -band 0xFF000000) -ne 0) { Set-Px $Dst ($X0 + $x) ($Y0 + $y) $c }
    } }
}

# Stacks equally sized frames into a vertical strip (animated texture).
function Join-Frames {
    param($Frames)
    $n = @($Frames).Count
    $w = $Frames[0].W; $h = $Frames[0].H
    $out = New-Canvas $w ($h * $n)
    for ($i = 0; $i -lt $n; $i++) { [Array]::Copy($Frames[$i].P, 0, $out.P, $i * $w * $h, $w * $h) }
    return $out
}

<#
  Selective outline: every transparent pixel that touches an opaque one (4-neighbourhood) gets an outline.
  Pixels up/left of the shape (facing the light) use a softer tone, pixels down/right of it the darkest tone.
  Colours are derived from the neighbouring fill so each material keeps its own dark hue; pass -LitArgb/-ShadeArgb
  to force fixed colours.
#>
function Add-Outline {
    param($C, [double]$LitFactor = 0.62, [double]$ShadeFactor = 0.36, [int]$LitArgb = 0, [int]$ShadeArgb = 0)
    $src = [int[]]$C.P.Clone()
    $w = $C.W; $h = $C.H
    for ($y = 0; $y -lt $h; $y++) { for ($x = 0; $x -lt $w; $x++) {
        if (($src[$y * $w + $x] -band 0xFF000000) -ne 0) { continue }
        $shadeNb = 0; $litNb = 0
        # neighbour to the left/above => this pixel sits down/right of the shape (shade side)
        if ($x -gt 0 -and (($src[$y * $w + $x - 1] -band 0xFF000000) -ne 0)) { $shadeNb = $src[$y * $w + $x - 1] }
        if ($y -gt 0 -and (($src[($y - 1) * $w + $x] -band 0xFF000000) -ne 0)) {
            $up = $src[($y - 1) * $w + $x]
            if ($shadeNb -eq 0 -or (Get-Lum $up) -lt (Get-Lum $shadeNb)) { $shadeNb = $up }
        }
        if ($x -lt ($w - 1) -and (($src[$y * $w + $x + 1] -band 0xFF000000) -ne 0)) { $litNb = $src[$y * $w + $x + 1] }
        if ($y -lt ($h - 1) -and (($src[($y + 1) * $w + $x] -band 0xFF000000) -ne 0)) {
            $dn = $src[($y + 1) * $w + $x]
            if ($litNb -eq 0 -or (Get-Lum $dn) -lt (Get-Lum $litNb)) { $litNb = $dn }
        }
        if ($shadeNb -ne 0) {
            if ($ShadeArgb -ne 0) { $C.P[$y * $w + $x] = $ShadeArgb } else { $C.P[$y * $w + $x] = Shade $shadeNb $ShadeFactor }
        } elseif ($litNb -ne 0) {
            if ($LitArgb -ne 0) { $C.P[$y * $w + $x] = $LitArgb } else { $C.P[$y * $w + $x] = Shade $litNb $LitFactor }
        }
    } }
}

# ---------------------------------------------------------------- files
# PNGs are written by hand (IHDR + one IDAT + IEND, stored deflate, RGBA8, transparent pixels as 0,0,0,0) so the
# bytes are identical on every machine: no GDI+ colour-space chunks, no encoder differences.
$script:Crc32Table = $null
function Get-Crc32Table {
    if ($null -eq $script:Crc32Table) {
        $table = New-Object 'long[]' 256
        for ($n = 0; $n -lt 256; $n++) {
            $c = [long]$n
            for ($k = 0; $k -lt 8; $k++) {
                if (($c -band 1) -eq 1) { $c = 3988292384L -bxor ($c -shr 1) } else { $c = $c -shr 1 }
            }
            $table[$n] = $c
        }
        $script:Crc32Table = $table
    }
    return ,$script:Crc32Table
}

function Get-Crc32 {
    param([byte[]]$Data)
    $table = Get-Crc32Table
    $crc = 4294967295L
    foreach ($byte in $Data) { $crc = $table[($crc -bxor $byte) -band 255] -bxor ($crc -shr 8) }
    return ($crc -bxor 4294967295L)
}

function Get-Adler32 {
    param([byte[]]$Data)
    $a = 1L; $b = 0L
    foreach ($byte in $Data) { $a = ($a + $byte) % 65521; $b = ($b + $a) % 65521 }
    return (($b -shl 16) -bor $a)
}

function Write-Be32 {
    param([System.IO.Stream]$Stream, [long]$Value)
    $Stream.WriteByte([byte](($Value -shr 24) -band 255)); $Stream.WriteByte([byte](($Value -shr 16) -band 255))
    $Stream.WriteByte([byte](($Value -shr 8) -band 255)); $Stream.WriteByte([byte]($Value -band 255))
}

function Write-PngChunk {
    param([System.IO.Stream]$Stream, [string]$Type, [byte[]]$Data)
    $typeBytes = [System.Text.Encoding]::ASCII.GetBytes($Type)
    $crcInput = New-Object 'byte[]' (4 + $Data.Length)
    [Array]::Copy($typeBytes, 0, $crcInput, 0, 4)
    if ($Data.Length -gt 0) { [Array]::Copy($Data, 0, $crcInput, 4, $Data.Length) }
    Write-Be32 $Stream $Data.Length
    $Stream.Write($crcInput, 0, $crcInput.Length)
    Write-Be32 $Stream (Get-Crc32 $crcInput)
}

function Save-Png {
    param($C, [string]$Path)
    $dir = Split-Path -Parent $Path
    if ($dir -and -not (Test-Path -LiteralPath $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
    $w = $C.W; $h = $C.H
    $raw = New-Object 'byte[]' ($h * (1 + $w * 4))
    $o = 0
    for ($y = 0; $y -lt $h; $y++) {
        $o++    # filter type 0 (None)
        for ($x = 0; $x -lt $w; $x++) {
            $p = $C.P[$y * $w + $x]
            if ((($p -shr 24) -band 255) -ne 0) {
                $raw[$o] = [byte](($p -shr 16) -band 255); $raw[$o + 1] = [byte](($p -shr 8) -band 255)
                $raw[$o + 2] = [byte]($p -band 255); $raw[$o + 3] = [byte](($p -shr 24) -band 255)
            }
            $o += 4
        }
    }
    # zlib stream made of stored (uncompressed) deflate blocks
    $z = New-Object System.IO.MemoryStream
    $z.WriteByte(0x78); $z.WriteByte(0x01)
    $pos = 0
    while ($pos -lt $raw.Length) {
        $n = [Math]::Min(65535, $raw.Length - $pos)
        $last = if (($pos + $n) -ge $raw.Length) { 1 } else { 0 }
        $nn = (-bnot $n) -band 65535
        $z.WriteByte([byte]$last)
        $z.WriteByte([byte]($n -band 255)); $z.WriteByte([byte](($n -shr 8) -band 255))
        $z.WriteByte([byte]($nn -band 255)); $z.WriteByte([byte](($nn -shr 8) -band 255))
        $z.Write($raw, $pos, $n)
        $pos += $n
    }
    Write-Be32 $z (Get-Adler32 $raw)

    $ihdr = New-Object System.IO.MemoryStream
    Write-Be32 $ihdr $w; Write-Be32 $ihdr $h
    foreach ($b in @(8, 6, 0, 0, 0)) { $ihdr.WriteByte([byte]$b) }

    $out = New-Object System.IO.MemoryStream
    $out.Write([byte[]]@(137, 80, 78, 71, 13, 10, 26, 10), 0, 8)
    Write-PngChunk $out 'IHDR' $ihdr.ToArray()
    Write-PngChunk $out 'IDAT' $z.ToArray()
    Write-PngChunk $out 'IEND' ([byte[]]@())
    [System.IO.File]::WriteAllBytes($Path, $out.ToArray())

    # read-back self check: what we decode must be what we drew
    $back = Read-Png $Path
    if ($back.W -ne $w -or $back.H -ne $h) { throw "PNG round-trip size mismatch for $Path" }
    for ($i = 0; $i -lt $C.P.Length; $i++) {
        $want = $C.P[$i]; if ((($want -shr 24) -band 255) -eq 0) { $want = 0 }
        if ($back.P[$i] -ne $want) { throw "PNG round-trip mismatch at pixel $i for $Path" }
    }
}

# canvas -> System.Drawing.Bitmap (caller disposes)
function ConvertTo-Bitmap {
    param($C)
    $fmt = [System.Drawing.Imaging.PixelFormat]::Format32bppArgb
    $bmp = New-Object System.Drawing.Bitmap($C.W, $C.H, $fmt)
    $rect = New-Object System.Drawing.Rectangle(0, 0, $C.W, $C.H)
    $data = $bmp.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::WriteOnly, $fmt)
    [System.Runtime.InteropServices.Marshal]::Copy([int[]]$C.P, 0, $data.Scan0, $C.P.Length)
    $bmp.UnlockBits($data)
    return $bmp
}

function Read-Png {
    param([string]$Path)
    $bytes = [System.IO.File]::ReadAllBytes($Path)
    $ms = New-Object System.IO.MemoryStream(, $bytes)
    $img = [System.Drawing.Image]::FromStream($ms)
    $fmt = [System.Drawing.Imaging.PixelFormat]::Format32bppArgb
    $bmp = New-Object System.Drawing.Bitmap($img.Width, $img.Height, $fmt)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
    $g.DrawImage($img, 0, 0, $img.Width, $img.Height)
    $g.Dispose(); $img.Dispose(); $ms.Dispose()
    $c = New-Canvas $bmp.Width $bmp.Height
    $rect = New-Object System.Drawing.Rectangle(0, 0, $bmp.Width, $bmp.Height)
    $data = $bmp.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadOnly, $fmt)
    [System.Runtime.InteropServices.Marshal]::Copy($data.Scan0, $c.P, 0, $c.P.Length)
    $bmp.UnlockBits($data)
    $bmp.Dispose()
    return $c
}

# Vanilla animation metadata (frames are the 16x16 slices of the strip, played in order).
function Save-Mcmeta {
    param([string]$Path, [int]$FrameTime)
    $dir = Split-Path -Parent $Path
    if ($dir -and -not (Test-Path -LiteralPath $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
    $json = "{`n  `"animation`": {`n    `"frametime`": $FrameTime`n  }`n}`n"
    [System.IO.File]::WriteAllText($Path, $json, (New-Object System.Text.UTF8Encoding($false)))
}
