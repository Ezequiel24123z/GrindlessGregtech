<#
.SYNOPSIS
Draws each chapter of the quest book to a PNG (boxes, lines, grid) so a layout can be judged without the game.

.DESCRIPTION
Runs tools\quests\lint.mjs --export to get positions, dependencies and findings, then draws with System.Drawing:
  - one cell = one FTB Quests grid unit; light lines every cell, stronger lines every 2 cells, axes at 0;
  - quests with their shape and size; green = start of the chapter, gold = milestone (size >= 1.5),
    grey with a dashed border = optional; red/orange outline = lint error/warning on that quest;
  - dependency lines with an arrow at the dependent end; red/orange = a lint rule complains about that line;
  - dependencies on other chapters as a dashed stub from the left edge, labelled with the chapter;
  - quest links (quest_links) with a dashed teal outline, the linked quest's title and chapter, and in teal the lines FTB
    Quests draws to them (every button of a dependency gets a line, links included), instead of a stub.

.PARAMETER Chapter   Chapter file names (without .snbt). Default: all.
.PARAMETER Book      Quest book folder. Default: pack\config\ftbquests\quests of this repo.
.PARAMETER OutDir    Output folder. Default: tools\quests\out (ignored by git).
.PARAMETER Prefix    Prefix for the file names, e.g. "before-".
.PARAMETER Scale     Pixels per cell (default 56).
.PARAMETER NodeExe   node.exe. Default: $env:GG_NODE, node on PATH, tools\analysis\.work\node\node.exe.
.PARAMETER ItemsJson Optional items.json of a gg_dump run, passed to the linter.
.PARAMETER TagsJson  Optional tags.json of a gg_dump run, passed to the linter.

.EXAMPLE
powershell -File tools\quests\Render-QuestPreview.ps1 -Chapter steam_age -OutDir $env:TEMP\previews
#>
param(
    [string[]]$Chapter = @(),
    [string]$Book,
    [string]$OutDir,
    [string]$Prefix = '',
    [int]$Scale = 56,
    [string]$NodeExe,
    [string]$ItemsJson,
    [string]$TagsJson
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$repo = Split-Path -Parent (Split-Path -Parent $here)
if (-not $Book) { $Book = Join-Path $repo 'pack\config\ftbquests\quests' }
if (-not $OutDir) { $OutDir = Join-Path $here 'out' }
New-Item -ItemType Directory -Force $OutDir | Out-Null

function Find-Node {
    $candidates = @()
    if ($NodeExe) { $candidates += $NodeExe }
    if ($env:GG_NODE) { $candidates += $env:GG_NODE }
    $cmd = Get-Command node.exe -ErrorAction SilentlyContinue
    if ($cmd) { $candidates += $cmd.Source }
    $candidates += (Join-Path $repo 'tools\analysis\.work\node\node.exe')
    foreach ($c in $candidates) { if ($c -and (Test-Path $c)) { return $c } }
    throw 'node.exe not found: pass -NodeExe or set GG_NODE'
}

$node = Find-Node
$export = Join-Path $OutDir ('.export-' + [guid]::NewGuid().ToString('N') + '.json')
$lintArgs = @((Join-Path $here 'lint.mjs'), '--book', $Book, '--export', $export, '--quiet')
if ($Chapter.Count -gt 0) { $lintArgs += @('--chapter', ($Chapter -join ',')) }
if ($ItemsJson) { $lintArgs += @('--items', $ItemsJson) }
if ($TagsJson) { $lintArgs += @('--tags', $TagsJson) }
& $node @lintArgs | Out-Null
if (-not (Test-Path $export)) { throw "lint.mjs did not write $export" }
$model = Get-Content $export -Raw -Encoding UTF8 | ConvertFrom-Json
Remove-Item $export -Force

function New-Color([string]$hex, [int]$alpha = 255) {
    $c = [System.Drawing.ColorTranslator]::FromHtml($hex)
    return [System.Drawing.Color]::FromArgb($alpha, $c.R, $c.G, $c.B)
}

function Get-ShapePoints([string]$shape, [float]$cx, [float]$cy, [float]$r) {
    $pts = New-Object System.Collections.Generic.List[System.Drawing.PointF]
    switch ($shape) {
        'hexagon' { for ($i = 0; $i -lt 6; $i++) { $a = [Math]::PI / 3 * $i; $pts.Add((New-Object System.Drawing.PointF(($cx + $r * [Math]::Cos($a)), ($cy + $r * 0.92 * [Math]::Sin($a))))) } }
        'octagon' { for ($i = 0; $i -lt 8; $i++) { $a = [Math]::PI / 4 * $i + [Math]::PI / 8; $pts.Add((New-Object System.Drawing.PointF(($cx + $r * [Math]::Cos($a)), ($cy + $r * [Math]::Sin($a))))) } }
        'pentagon' { for ($i = 0; $i -lt 5; $i++) { $a = 2 * [Math]::PI / 5 * $i - [Math]::PI / 2; $pts.Add((New-Object System.Drawing.PointF(($cx + $r * [Math]::Cos($a)), ($cy + $r * [Math]::Sin($a))))) } }
        'diamond' { $pts.Add((New-Object System.Drawing.PointF($cx, ($cy - $r)))); $pts.Add((New-Object System.Drawing.PointF(($cx + $r), $cy))); $pts.Add((New-Object System.Drawing.PointF($cx, ($cy + $r)))); $pts.Add((New-Object System.Drawing.PointF(($cx - $r), $cy))) }
        'gear' { for ($i = 0; $i -lt 16; $i++) { $a = [Math]::PI / 8 * $i; $rr = if ($i % 2 -eq 0) { $r } else { $r * 0.82 }; $pts.Add((New-Object System.Drawing.PointF(($cx + $rr * [Math]::Cos($a)), ($cy + $rr * [Math]::Sin($a))))) } }
        default { return $null }
    }
    return $pts.ToArray()
}

$bg = New-Color '#1E1F24'
$gridMinor = New-Color '#272930'
$gridMajor = New-Color '#30333C'
$axis = New-Color '#4A4E5A'
$fill = @{ normal = (New-Color '#3E6FA8'); root = (New-Color '#3C8D5A'); milestone = (New-Color '#B8862B'); optional = (New-Color '#4A4F5C') }
$lineColor = @{ ok = (New-Color '#9AA3B2'); warn = (New-Color '#E0A030'); error = (New-Color '#E05050') }
$outlineColor = @{ ok = (New-Color '#D8DCE4'); warn = (New-Color '#E0A030'); error = (New-Color '#FF4040') }
$written = @()

foreach ($ch in $model.chapters) {
    $qs = @($ch.quests)
    if ($qs.Count -eq 0) { continue }
    $byId = @{}
    foreach ($q in $qs) { $byId[$q.id] = $q }
    # quest links (pl_* charts): drawn like quests, with a dashed teal outline
    $lks = @($ch.links | Where-Object { $_ -ne $null })
    foreach ($l in $lks) { $byId[$l.id] = $l }
    $boxes = @($qs) + @($lks)
    $hasCross = @($qs | Where-Object { @($_.cross | Where-Object { -not $_.viaLink }).Count -gt 0 }).Count -gt 0
    $minX = ($boxes | ForEach-Object { $_.x - $_.size / 2 } | Measure-Object -Minimum).Minimum - 1.2
    $maxX = ($boxes | ForEach-Object { $_.x + $_.size / 2 } | Measure-Object -Maximum).Maximum + 1.2
    $minY = ($boxes | ForEach-Object { $_.y - $_.size / 2 } | Measure-Object -Minimum).Minimum - 1.0
    $maxY = ($boxes | ForEach-Object { $_.y + $_.size / 2 } | Measure-Object -Maximum).Maximum + 1.4
    if ($hasCross) { $minX -= 3.0 }
    $s = [double]$Scale
    $wCells = $maxX - $minX; $hCells = $maxY - $minY
    if ($wCells * $s -gt 14000) { $s = 14000 / $wCells }
    $header = 64
    $W = [int][Math]::Ceiling($wCells * $s); $H = [int][Math]::Ceiling($hCells * $s) + $header
    $bmp = New-Object System.Drawing.Bitmap($W, $H)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit
    $g.Clear($bg)
    $px = { param($x) [float](($x - $minX) * $s) }
    $py = { param($y) [float](($y - $minY) * $s + $header) }

    # grid
    $penMinor = New-Object System.Drawing.Pen($gridMinor, 1)
    $penMajor = New-Object System.Drawing.Pen($gridMajor, 1)
    $penAxis = New-Object System.Drawing.Pen($axis, 1.5)
    for ($x = [Math]::Floor($minX); $x -le [Math]::Ceiling($maxX); $x += 1) {
        $pen = if ($x -eq 0) { $penAxis } elseif ([Math]::Abs($x % 2) -lt 0.001) { $penMajor } else { $penMinor }
        $g.DrawLine($pen, (& $px $x), [float]$header, (& $px $x), [float]$H)
    }
    for ($y = [Math]::Floor($minY); $y -le [Math]::Ceiling($maxY); $y += 1) {
        $pen = if ($y -eq 0) { $penAxis } elseif ([Math]::Abs($y % 2) -lt 0.001) { $penMajor } else { $penMinor }
        $g.DrawLine($pen, [float]0, (& $py $y), [float]$W, (& $py $y))
    }
    $fontSize = [float][Math]::Max(7, 9 * $s / 56)
    $font = New-Object System.Drawing.Font('Segoe UI', $fontSize)
    $fontSmall = New-Object System.Drawing.Font('Segoe UI', [float]($fontSize * 0.85), [System.Drawing.FontStyle]::Italic)
    $fontHead = New-Object System.Drawing.Font('Segoe UI', 13, [System.Drawing.FontStyle]::Bold)
    $fontHead2 = New-Object System.Drawing.Font('Segoe UI', 9)
    $white = New-Object System.Drawing.SolidBrush((New-Color '#E8EAEE'))
    $grey = New-Object System.Drawing.SolidBrush((New-Color '#A0A6B2'))

    # cross-chapter stubs
    $stubPen = New-Object System.Drawing.Pen((New-Color '#7FA7D9'), 1.5)
    $stubPen.DashStyle = [System.Drawing.Drawing2D.DashStyle]::Dash
    foreach ($q in $qs) {
        $i = 0
        foreach ($c in @($q.cross | Where-Object { -not $_.viaLink })) {
            $y0 = (& $py $q.y) + $i * 12
            $g.DrawLine($stubPen, [float]4, [float]$y0, (& $px ($q.x - $q.size / 2)), (& $py $q.y))
            $g.DrawString(('<- ' + $c.chapter + ': ' + $c.title), $fontSmall, $grey, [float]6, [float]($y0 - $fontSize * 1.6))
            $i++
        }
    }

    # dependency lines
    foreach ($e in @($ch.edges)) {
        $a = $byId[$e.from]; $b = $byId[$e.to]
        if (-not $a -or -not $b) { continue }
        $col = $lineColor[$e.level]
        $pen = New-Object System.Drawing.Pen($col, [float]([Math]::Max(1.5, 2 * $s / 56)))
        if ($e.hidden) { $pen.DashStyle = [System.Drawing.Drawing2D.DashStyle]::Dot }
        $x1 = & $px $a.x; $y1 = & $py $a.y; $x2 = & $px $b.x; $y2 = & $py $b.y
        $g.DrawLine($pen, $x1, $y1, $x2, $y2)
        $len = [Math]::Sqrt(($x2 - $x1) * ($x2 - $x1) + ($y2 - $y1) * ($y2 - $y1))
        if ($len -gt 1) {
            $ux = ($x2 - $x1) / $len; $uy = ($y2 - $y1) / $len
            $back = $b.size * $s / 2 * 0.95
            $tx = $x2 - $ux * $back; $ty = $y2 - $uy * $back
            $ah = 7 * $s / 56
            $p1 = New-Object System.Drawing.PointF([float]$tx, [float]$ty)
            $p2 = New-Object System.Drawing.PointF([float]($tx - $ux * $ah * 1.6 - $uy * $ah), [float]($ty - $uy * $ah * 1.6 + $ux * $ah))
            $p3 = New-Object System.Drawing.PointF([float]($tx - $ux * $ah * 1.6 + $uy * $ah), [float]($ty - $uy * $ah * 1.6 - $ux * $ah))
            $g.FillPolygon((New-Object System.Drawing.SolidBrush($col)), [System.Drawing.PointF[]]@($p1, $p2, $p3))
        }
        $pen.Dispose()
    }

    # lines to and from quest links (teal)
    $linkCol = New-Color '#4FB3A9'
    foreach ($e in @($ch.linkEdges | Where-Object { $_ -ne $null })) {
        $a = $byId[$e.from]; $b = $byId[$e.to]
        if (-not $a -or -not $b) { continue }
        $pen = New-Object System.Drawing.Pen($linkCol, [float]([Math]::Max(1.5, 2 * $s / 56)))
        $x1 = & $px $a.x; $y1 = & $py $a.y; $x2 = & $px $b.x; $y2 = & $py $b.y
        $g.DrawLine($pen, $x1, $y1, $x2, $y2)
        $len = [Math]::Sqrt(($x2 - $x1) * ($x2 - $x1) + ($y2 - $y1) * ($y2 - $y1))
        if ($len -gt 1) {
            $ux = ($x2 - $x1) / $len; $uy = ($y2 - $y1) / $len
            $back = $b.size * $s / 2 * 0.95
            $tx = $x2 - $ux * $back; $ty = $y2 - $uy * $back
            $ah = 7 * $s / 56
            $p1 = New-Object System.Drawing.PointF([float]$tx, [float]$ty)
            $p2 = New-Object System.Drawing.PointF([float]($tx - $ux * $ah * 1.6 - $uy * $ah), [float]($ty - $uy * $ah * 1.6 + $ux * $ah))
            $p3 = New-Object System.Drawing.PointF([float]($tx - $ux * $ah * 1.6 + $uy * $ah), [float]($ty - $uy * $ah * 1.6 - $ux * $ah))
            $g.FillPolygon((New-Object System.Drawing.SolidBrush($linkCol)), [System.Drawing.PointF[]]@($p1, $p2, $p3))
        }
        $pen.Dispose()
    }

    # quest links: the linked quest's title and chapter, dashed teal outline
    foreach ($l in $lks) {
        $cx = & $px $l.x; $cy = & $py $l.y
        $r = [float]($l.size * $s / 2 * 0.9)
        $brush = New-Object System.Drawing.SolidBrush((New-Color '#2B5F5B'))
        $pen = New-Object System.Drawing.Pen($linkCol, [float]2)
        $pen.DashStyle = [System.Drawing.Drawing2D.DashStyle]::Dash
        $pts = Get-ShapePoints $l.shape $cx $cy $r
        if ($pts) { $g.FillPolygon($brush, $pts); $g.DrawPolygon($pen, $pts) }
        else { $g.FillRectangle($brush, ($cx - $r), ($cy - $r), (2 * $r), (2 * $r)); $g.DrawRectangle($pen, ($cx - $r), ($cy - $r), (2 * $r), (2 * $r)) }
        $boxW = [float]([Math]::Max(2.2, $l.size + 0.6) * $s)
        $fmt = New-Object System.Drawing.StringFormat
        $fmt.Alignment = [System.Drawing.StringAlignment]::Center
        $fmt.Trimming = [System.Drawing.StringTrimming]::EllipsisWord
        $lr = New-Object System.Drawing.RectangleF(($cx - $boxW / 2), ($cy + $r + 2), $boxW, [float]($fontSize * 3.2))
        $g.DrawString(([string]$l.title + ' (' + [string]$l.chapter + ')'), $font, $white, $lr, $fmt)
        $brush.Dispose(); $pen.Dispose()
    }

    # quests
    foreach ($q in $qs) {
        $cx = & $px $q.x; $cy = & $py $q.y
        $r = [float]($q.size * $s / 2 * 0.9)
        $kind = if ($q.root) { 'root' } elseif ($q.size -ge 1.5) { 'milestone' } elseif ($q.optional) { 'optional' } else { 'normal' }
        $brush = New-Object System.Drawing.SolidBrush($fill[$kind])
        $ow = if ($q.level -eq 'ok') { 1.5 } else { 3.5 }
        $pen = New-Object System.Drawing.Pen($outlineColor[$q.level], [float]$ow)
        if ($q.optional) { $pen.DashStyle = [System.Drawing.Drawing2D.DashStyle]::Dash }
        $pts = Get-ShapePoints $q.shape $cx $cy $r
        if ($pts) {
            $g.FillPolygon($brush, $pts); $g.DrawPolygon($pen, $pts)
        } elseif ($q.shape -eq 'square' -or $q.shape -eq 'rsquare') {
            $rect = New-Object System.Drawing.RectangleF(($cx - $r), ($cy - $r), (2 * $r), (2 * $r))
            if ($q.shape -eq 'rsquare') {
                $path = New-Object System.Drawing.Drawing2D.GraphicsPath
                $d = [float]($r * 0.6)
                $path.AddArc($rect.X, $rect.Y, $d, $d, 180, 90); $path.AddArc($rect.Right - $d, $rect.Y, $d, $d, 270, 90)
                $path.AddArc($rect.Right - $d, $rect.Bottom - $d, $d, $d, 0, 90); $path.AddArc($rect.X, $rect.Bottom - $d, $d, $d, 90, 90)
                $path.CloseFigure(); $g.FillPath($brush, $path); $g.DrawPath($pen, $path)
            } else { $g.FillRectangle($brush, $rect); $g.DrawRectangle($pen, $rect.X, $rect.Y, $rect.Width, $rect.Height) }
        } else {
            $g.FillEllipse($brush, ($cx - $r), ($cy - $r), (2 * $r), (2 * $r)); $g.DrawEllipse($pen, ($cx - $r), ($cy - $r), (2 * $r), (2 * $r))
        }
        $label = [string]$q.title
        $boxW = [float]([Math]::Max(2.2, $q.size + 0.6) * $s)
        $fmt = New-Object System.Drawing.StringFormat
        $fmt.Alignment = [System.Drawing.StringAlignment]::Center
        $fmt.Trimming = [System.Drawing.StringTrimming]::EllipsisWord
        $lr = New-Object System.Drawing.RectangleF(($cx - $boxW / 2), ($cy + $r + 2), $boxW, [float]($fontSize * 3.2))
        $g.DrawString($label, $font, $white, $lr, $fmt)
        $brush.Dispose(); $pen.Dispose()
    }

    $g.FillRectangle((New-Object System.Drawing.SolidBrush((New-Color '#15161A'))), 0, 0, $W, $header)
    $g.DrawString(([string]$ch.title + '   (' + $ch.filename + ')'), $fontHead, $white, [float]10, [float]8)
    $sub = "quests=$($qs.Count)   lint: $($ch.errors) errors, $($ch.warnings) warnings   green=start  gold=milestone  dashed=optional  red/orange=lint"
    if ($lks.Count -gt 0) { $sub += "  teal dashed=quest link ($($lks.Count))" }
    $g.DrawString($sub, $fontHead2, $grey, [float]12, [float]36)
    $file = Join-Path $OutDir ($Prefix + $ch.filename + '.png')
    $bmp.Save($file, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose(); $bmp.Dispose()
    $written += $file
    Write-Output ("{0}  ({1}x{2}, {3} quests, {4} errors, {5} warnings)" -f $file, $W, $H, $qs.Count, $ch.errors, $ch.warnings)
}
if ($written.Count -eq 0) { Write-Warning 'no chapter rendered' }
