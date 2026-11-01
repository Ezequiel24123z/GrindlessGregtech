<#
.SYNOPSIS
  Builds contact sheets and flags.csv from the gg_formed_*.png screenshots of the formed-shots fixture (RF-3B).
.DESCRIPTION
  Reads gg_formed_<ns>__<path>.png from -ShotsDir (a folder under C:\Users\<user>\gg-reforge\formed\<run id>; images are never
  committed). Writes, next to them or in -OutDir: sheet_<namespace>_<n>.png (labelled thumbnails) and flags.csv.
  Flags come from pixel statistics on a 96x54 downsample:
    magenta   >= 2 % of the pixels are missing-texture magenta/black checker colours (255,0,255)
    black     the frame is almost all black (mean luma < 6)
    uniform   the frame is almost one colour (luma stddev < 5): nothing but sky or void
    sparse    the structure is barely visible: < 10 % of the pixels differ from the frame's most common colour
    duplicate the frame is byte-identical to another machine's frame (same SHA-256)
  Manifest rows (gg_formed_shots_manifest*.json) with no shot (noshape, toolarge, shotfail, error) are added as flags too.
  Nothing here needs Minecraft, npm or the network (System.Drawing only).
.EXAMPLE
  powershell -NoProfile -File tools\test\Build-FormedSheets.ps1 -ShotsDir C:\Users\me\gg-reforge\formed\run1
#>
param(
  [Parameter(Mandatory = $true)][string]$ShotsDir,
  [string]$OutDir = '',
  [int]$Columns = 5,
  [int]$Rows = 4,
  [int]$ThumbWidth = 384,
  [double]$SparseAt = 0.90
)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
if ($OutDir -eq '') { $OutDir = $ShotsDir }
New-Item -ItemType Directory -Force -Path $OutDir | Out-Null
$thumbHeight = [int]($ThumbWidth * 9 / 16)
$label = 34

function Get-FrameStats([System.Drawing.Bitmap]$bmp) {
  $small = New-Object System.Drawing.Bitmap 96, 54
  $g = [System.Drawing.Graphics]::FromImage($small)
  $g.InterpolationMode = 'HighQualityBilinear'
  $g.DrawImage($bmp, 0, 0, 96, 54)
  $g.Dispose()
  $n = 96 * 54
  $sum = 0.0; $sum2 = 0.0; $magenta = 0
  $counts = @{}
  for ($y = 0; $y -lt 54; $y++) {
    for ($x = 0; $x -lt 96; $x++) {
      $px = $small.GetPixel($x, $y)
      $luma = 0.299 * $px.R + 0.587 * $px.G + 0.114 * $px.B
      $sum += $luma; $sum2 += $luma * $luma
      if ($px.R -gt 180 -and $px.B -gt 180 -and $px.G -lt 80) { $magenta++ }
      $key = ([int]($px.R / 16)) * 256 + ([int]($px.G / 16)) * 16 + [int]($px.B / 16)
      $counts[$key] = 1 + [int]$counts[$key]
    }
  }
  $small.Dispose()
  $mean = $sum / $n
  $var = [Math]::Max(0.0, $sum2 / $n - $mean * $mean)
  $top = ($counts.Values | Measure-Object -Maximum).Maximum
  [pscustomobject]@{ Mean = $mean; Std = [Math]::Sqrt($var); Magenta = $magenta / $n; Dominant = $top / $n }
}

$files = Get-ChildItem -Path $ShotsDir -Filter 'gg_formed_*.png' -File | Sort-Object Name
$sha = [System.Security.Cryptography.SHA256]::Create()
$items = @()
foreach ($f in $files) {
  $id = ($f.BaseName -replace '^gg_formed_', '') -replace '__', ':'
  $ns = $id.Split(':')[0]
  $hash = [BitConverter]::ToString($sha.ComputeHash([System.IO.File]::ReadAllBytes($f.FullName))) -replace '-', ''
  $flags = @()
  $bmp = $null
  try {
    $bmp = New-Object System.Drawing.Bitmap $f.FullName
    $st = Get-FrameStats $bmp
    if ($st.Magenta -ge 0.02) { $flags += 'magenta' }
    if ($st.Mean -lt 6) { $flags += 'black' }
    if ($st.Std -lt 5) { $flags += 'uniform' }
    if ($st.Dominant -gt $SparseAt) { $flags += 'sparse' }
  } catch {
    $flags += 'unreadable'
    $st = [pscustomobject]@{ Mean = 0; Std = 0; Magenta = 0; Dominant = 0 }
  } finally {
    if ($null -ne $bmp) { $bmp.Dispose() }
  }
  $items += [pscustomobject]@{ Id = $id; Ns = $ns; File = $f.FullName; Hash = $hash; Flags = $flags; Stats = $st }
}
$sha.Dispose()
$byHash = $items | Group-Object Hash | Where-Object { $_.Count -gt 1 }
foreach ($grp in $byHash) {
  $names = ($grp.Group | ForEach-Object { $_.Id }) -join ' '
  foreach ($it in $grp.Group) { $it.Flags += 'duplicate'; $it | Add-Member -NotePropertyName DupWith -NotePropertyValue $names -Force }
}

$csv = @()
foreach ($it in $items) {
  if ($it.Flags.Count -eq 0) { continue }
  $csv += [pscustomobject]@{
    id = $it.Id; namespace = $it.Ns; flags = ($it.Flags -join '+'); magenta = [Math]::Round($it.Stats.Magenta, 4)
    meanLuma = [Math]::Round($it.Stats.Mean, 1); stdLuma = [Math]::Round($it.Stats.Std, 1); dominant = [Math]::Round($it.Stats.Dominant, 3)
    note = $(if ($it.PSObject.Properties['DupWith']) { 'same pixels as: ' + $it.DupWith } else { '' })
  }
}
foreach ($m in (Get-ChildItem -Path $ShotsDir -Filter 'gg_formed_shots_manifest*.json' -File -ErrorAction SilentlyContinue)) {
  $doc = Get-Content -Raw -Path $m.FullName | ConvertFrom-Json
  foreach ($r in $doc.rows) {
    $problem = $null
    if ($r.status -ne 'shot') { $problem = $r.status } elseif ($r.formed -ne $true) { $problem = 'notformed' }
    if ($null -eq $problem) { continue }
    $csv += [pscustomobject]@{ id = $r.id; namespace = $r.ns; flags = $problem; magenta = ''; meanLuma = ''; stdLuma = ''; dominant = ''
      note = ('xei=' + $r.xei + ' shapes=' + $r.shapes + ' ' + $r.note) }
  }
}
$csv | Sort-Object id | Export-Csv -Path (Join-Path $OutDir 'flags.csv') -NoTypeInformation -Encoding UTF8

$font = New-Object System.Drawing.Font 'Consolas', 10
$red = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 80, 80))
$white = [System.Drawing.Brushes]::White
$sheets = 0
foreach ($grp in ($items | Group-Object Ns)) {
  $perSheet = $Columns * $Rows
  $list = @($grp.Group | Sort-Object Id)
  for ($start = 0; $start -lt $list.Count; $start += $perSheet) {
    $page = [int]($start / $perSheet) + 1
    $sheet = New-Object System.Drawing.Bitmap ($Columns * $ThumbWidth), ($Rows * ($thumbHeight + $label))
    $g = [System.Drawing.Graphics]::FromImage($sheet)
    $g.Clear([System.Drawing.Color]::FromArgb(24, 24, 24))
    $g.InterpolationMode = 'HighQualityBilinear'
    for ($i = 0; $i -lt $perSheet -and ($start + $i) -lt $list.Count; $i++) {
      $it = $list[$start + $i]
      $cx = ($i % $Columns) * $ThumbWidth
      $cy = [int]($i / $Columns) * ($thumbHeight + $label)
      try {
        $img = [System.Drawing.Image]::FromFile($it.File)
        $g.DrawImage($img, $cx, $cy + $label, $ThumbWidth - 2, $thumbHeight - 2)
        $img.Dispose()
      } catch { }
      $brush = if ($it.Flags.Count -gt 0) { $red } else { $white }
      $text = $it.Id.Split(':', 2)[1]
      if ($it.Flags.Count -gt 0) { $text += ' [' + ($it.Flags -join ',') + ']' }
      $g.DrawString($text, $font, $brush, [single]($cx + 2), [single]($cy + 8))
    }
    $g.Dispose()
    $sheet.Save((Join-Path $OutDir ('sheet_{0}_{1}.png' -f ($grp.Name -replace '[^A-Za-z0-9_]', '_'), $page)), [System.Drawing.Imaging.ImageFormat]::Png)
    $sheet.Dispose()
    $sheets++
  }
}
$font.Dispose(); $red.Dispose()
$byNs = ($items | Group-Object Ns | ForEach-Object { '{0}={1}' -f $_.Name, $_.Count }) -join ' '
Write-Output ('FORMED-SHEETS shots={0} flagged={1} sheets={2} flagsCsv={3} | {4}' -f $items.Count, @($items | Where-Object { $_.Flags.Count -gt 0 }).Count, $sheets, (Join-Path $OutDir 'flags.csv'), $byNs)
