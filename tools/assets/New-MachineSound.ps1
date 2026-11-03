<#
.SYNOPSIS
  Generates the working-sound loops of our special multiblocks with the ElevenLabs sound-generation API.
.DESCRIPTION
  Reads tools/assets/sounds.json, asks POST /v1/sound-generation for each row (loop, duration, prompt influence), converts the result
  with a pinned portable ffmpeg (.work/, gitignored) to mono OGG Vorbis at the spec sample rate, writes
  pack/kubejs/assets/grindless/sounds/<id>.ogg and rewrites pack/kubejs/assets/grindless/sounds.json deterministically (rows sorted
  by id; only rows whose .ogg exists). Every file is mastered (see Invoke-Master): optional low-pass, 150 ms equal-power tail-to-head crossfade,
  loudness to about -24 dBFS RMS with a -3 dBFS peak limit. -Master does the same offline to the files already in the pack (no API, no credits).
  A row whose .ogg already exists is skipped unless -Force (a generation costs credits).
  The API key is read at runtime from -KeyFile (default C:\Nueva carpeta\elevenlabskey.txt) or the GG_ELEVENLABS_KEY variable and is
  sent only in the xi-api-key header; it is never printed or stored. Docs/quality/sounds.md has the licence and the size budget.
.EXAMPLE
  powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\New-MachineSound.ps1 -Only loop_observatory -Force
#>
[CmdletBinding()]
param(
  [string[]]$Only = @(),
  [switch]$Force,
  [switch]$Plan,          # print the subscription tier and what would be generated, call nothing else
  [switch]$IndexOnly,     # no API call: rebuild sounds.json from the spec and the .ogg files present
  [switch]$Master,        # no API call: master the existing .ogg files that lack the GG_MASTER mark (-Force: all of them)
  [switch]$Cut,           # no API call: move the loop point of the existing .ogg files that lack the GG_CUT mark to the best seam (-Force: all)
  [string]$KeyFile = 'C:\Nueva carpeta\elevenlabskey.txt'
)
$ErrorActionPreference = 'Stop'
$root = Resolve-Path (Join-Path $PSScriptRoot '..\..')
$specPath = Join-Path $PSScriptRoot 'sounds.json'
$outDir = Join-Path $root 'pack\kubejs\assets\grindless\sounds'
$indexPath = Join-Path $root 'pack\kubejs\assets\grindless\sounds.json'
$work = Join-Path $root '.work'
$rawDir = Join-Path $work 'sounds-raw'

# Pinned portable ffmpeg (gyan.dev build, GPL: used as a tool only, never shipped). The hash was taken from the release asset
# itself (the project does not publish one), so it detects a changed or corrupted download.
$ffmpegUrl = 'https://github.com/GyanD/codexffmpeg/releases/download/7.1.1/ffmpeg-7.1.1-essentials_build.zip'
$ffmpegSha = '04861D3339C5EBE38B56C19A15CF2C0CC97F5DE4FA8910E4D47E5E6404E4A2D4'
$maxBytes = 100KB

function Get-Ffmpeg {
  $exe = Join-Path $work 'ffmpeg-7.1.1-essentials_build\bin\ffmpeg.exe'
  if (Test-Path $exe) { return $exe }
  New-Item -ItemType Directory -Force $work | Out-Null
  $zip = Join-Path $work 'ffmpeg.zip'
  if (-not (Test-Path $zip)) { & curl.exe -L -sS --fail -o $zip $ffmpegUrl; if ($LASTEXITCODE) { throw 'ffmpeg download failed' } }
  $hash = (Get-FileHash $zip -Algorithm SHA256).Hash
  if ($hash -ne $ffmpegSha) { Remove-Item $zip; throw "ffmpeg SHA-256 mismatch ($hash)" }
  Expand-Archive $zip -DestinationPath $work -Force
  if (-not (Test-Path $exe)) { throw 'ffmpeg.exe not found after extraction' }
  return $exe
}

# Loudness and loop standard (docs/quality/sounds.md): about -24 dBFS RMS, peak at most -3 dBFS, 150 ms equal-power crossfade of the
# tail into the head (the file becomes 0.15 s shorter and loops without a seam), optional low-pass (spec field "lowpass", Hz).
$targetRms = -24.0
$peakLimit = -3.0
$crossfade = 0.15
$masterTag = 'GG_MASTER=1'

function Invoke-Native($exe, [string[]]$argv) {
  $psi = New-Object Diagnostics.ProcessStartInfo
  $psi.FileName = $exe; $psi.UseShellExecute = $false; $psi.RedirectStandardError = $true; $psi.RedirectStandardOutput = $true
  $psi.Arguments = ($argv | ForEach-Object { '"' + $_ + '"' }) -join ' '
  $p = [Diagnostics.Process]::Start($psi)
  $err = $p.StandardError.ReadToEndAsync(); $null = $p.StandardOutput.ReadToEndAsync(); $p.WaitForExit()
  return [pscustomobject]@{ Code = $p.ExitCode; Text = $err.Result }
}

$cutTag = 'GG_CUT=1'
Add-Type -Language CSharp -TypeDefinition @'
using System;
public static class LoopCut {
  // The crossfaded loop is circular: any rotation of it is as seamless as the original join. Pick the rotation whose cut is a quiet
  // step (two neighbouring samples that almost agree) and where the 50 ms before the cut match the 50 ms after it in level.
  public static int[] Candidates(float[] x, int rate, int count) {
    int n = x.Length, seg = Math.Max(1, (int)Math.Round(rate * 0.05));
    double[] sq = new double[n + 1];
    double dsum = 0;
    for (int i = 0; i < n; i++) { sq[i + 1] = sq[i] + (double)x[i] * x[i]; double d = x[(i + 1) % n] - x[i]; dsum += d * d; }
    double drms = Math.Sqrt(dsum / n);
    double[] score = new double[n];
    for (int k = 0; k < n; k++) score[k] = double.MaxValue;
    for (int k = seg; k <= n - seg; k++) {
      double a = Math.Sqrt((sq[k + seg] - sq[k]) / seg), b = Math.Sqrt((sq[k] - sq[k - seg]) / seg);
      double db = Math.Abs(20 * Math.Log10(Math.Max(a, 1e-9) / Math.Max(b, 1e-9)));
      double r = drms > 1e-9 ? Math.Abs(x[k] - x[k - 1]) / drms : 0;
      score[k] = db + 1.5 * r + 0.5 * (Math.Abs(x[k]) + Math.Abs(x[k - 1])) / Math.Max(drms, 1e-9);
    }
    int[] res = new int[count];
    for (int c = 0; c < count; c++) {
      int best = seg; for (int k = seg; k <= n - seg; k++) if (score[k] < score[best]) best = k;
      res[c] = best;
      for (int k = Math.Max(0, best - 400); k <= Math.Min(n - 1, best + 400); k++) score[k] = double.MaxValue;
    }
    return res;
  }
  // The audit's two seam measures on a file played end to start.
  public static double Measure(float[] x, int rate, out double mismatchDb) {
    int n = x.Length, seg = Math.Max(1, (int)Math.Round(rate * 0.05));
    double a = 0, b = 0, dsum = 0;
    for (int i = 0; i < seg; i++) { a += (double)x[i] * x[i]; b += (double)x[n - seg + i] * x[n - seg + i]; }
    mismatchDb = Math.Abs(20 * Math.Log10(Math.Max(Math.Sqrt(a / seg), 1e-9) / Math.Max(Math.Sqrt(b / seg), 1e-9)));
    for (int i = 1; i < n; i++) { double d = x[i] - x[i - 1]; dsum += d * d; }
    double drms = Math.Sqrt(dsum / (n - 1));
    return drms > 1e-9 ? Math.Abs(x[0] - x[n - 1]) / drms : 0;
  }  public static float[] ReadWav(string path) {
    byte[] b = System.IO.File.ReadAllBytes(path);
    int p = 12;
    while (p + 8 <= b.Length) {
      string id = System.Text.Encoding.ASCII.GetString(b, p, 4);
      int len = BitConverter.ToInt32(b, p + 4);
      if (id == "data") { if (len <= 0 || p + 8 + len > b.Length) len = b.Length - p - 8; float[] f = new float[len / 4]; Buffer.BlockCopy(b, p + 8, f, 0, f.Length * 4); return f; }
      p += 8 + len + (len & 1);
    }
    throw new Exception("no data chunk in " + path);
  }
}
'@

function Get-LoopCuts([float[]]$x, [int]$rate) { return [LoopCut]::Candidates($x, $rate, 12) }

function Invoke-LoopRotate($ffmpeg, [string]$inWav, [string]$outWav, [int]$k, [string]$id) {
  $g = "[0:a]asplit[a][b];[a]atrim=start_sample=$k,asetpts=PTS-STARTPTS[x];[b]atrim=end_sample=$k,asetpts=PTS-STARTPTS[y];[x][y]concat=n=2:v=0:a=1[o]"
  $r = Invoke-Native $ffmpeg @('-y', '-hide_banner', '-i', $inWav, '-filter_complex', $g, '-map', '[o]', '-c:a', 'pcm_f32le', $outWav)
  if ($r.Code) { throw "ffmpeg rotate failed for $id" }
}

# Tries the cut candidates in order and keeps the first whose encoded file passes the audit's seam measures (the lossy encode adds noise
# to the two end samples, so the check is made on the decoded Ogg).
function Invoke-Cut($ffmpeg, [string]$src, [object]$spec, [object]$row, [string]$dest) {
  $rate = [int]$spec.sampleRate
  $wav = Join-Path $rawDir "$($row.id).cut.wav"; $rot = Join-Path $rawDir "$($row.id).rot.wav"; $chk = Join-Path $rawDir "$($row.id).chk.wav"
  $d = Invoke-Native $ffmpeg @('-y', '-hide_banner', '-i', $src, '-ac', '1', '-ar', "$rate", '-c:a', 'pcm_f32le', $wav)
  if ($d.Code) { throw "ffmpeg decode failed for $($row.id)" }
  $x = [LoopCut]::ReadWav($wav)
  $out = "$dest.tmp.ogg"; $bestOut = "$dest.best.ogg"; $bestScore = [double]::MaxValue; $bestInfo = ''
  foreach ($k in (Get-LoopCuts $x $rate)) {
    Invoke-LoopRotate $ffmpeg $wav $rot $k $row.id
    $e = Invoke-Native $ffmpeg @('-y', '-v', 'error', '-i', $rot, '-ac', '1', '-ar', "$rate", '-c:a', 'libvorbis', '-q:a', "$([int]$row.quality)", '-map_metadata', '-1', '-metadata', $masterTag, '-metadata', $cutTag, '-fflags', '+bitexact', '-flags:a', '+bitexact', $out)
    if ($e.Code) { throw "ffmpeg encode failed for $($row.id)" }
    # the encoder may overshoot the peak limit: trim the gain once, which keeps the loop circular
    $st = Invoke-Native $ffmpeg @('-hide_banner', '-i', $out, '-af', 'astats=measure_perchannel=none:measure_overall=Peak_level', '-f', 'null', '-')
    $pm = [regex]::Matches($st.Text, 'Peak level dB:\s*(-?[\d.]+)')
    if ($pm.Count -gt 0) {
      $pk = [double]::Parse($pm[$pm.Count - 1].Groups[1].Value, [Globalization.CultureInfo]::InvariantCulture)
      if ($pk -gt -2.3) {
        $trimDb = (-2.6 - $pk).ToString('0.00', [Globalization.CultureInfo]::InvariantCulture)
        $e = Invoke-Native $ffmpeg @('-y', '-v', 'error', '-i', $rot, '-af', "volume=${trimDb}dB", '-ac', '1', '-ar', "$rate", '-c:a', 'libvorbis', '-q:a', "$([int]$row.quality)", '-map_metadata', '-1', '-metadata', $masterTag, '-metadata', $cutTag, '-fflags', '+bitexact', '-flags:a', '+bitexact', $out)
        if ($e.Code) { throw "ffmpeg encode failed for $($row.id)" }
      }
    }
    $v = Invoke-Native $ffmpeg @('-y', '-hide_banner', '-i', $out, '-ac', '1', '-ar', "$rate", '-c:a', 'pcm_f32le', $chk)
    if ($v.Code) { throw "ffmpeg verify decode failed for $($row.id)" }
    $mis = 0.0; $ratio = [LoopCut]::Measure([LoopCut]::ReadWav($chk), $rate, [ref]$mis)
    $score = [Math]::Max($ratio / 3.0, $mis / 2.0)
    if ($score -lt $bestScore) { $bestScore = $score; Copy-Item $out $bestOut -Force; $bestInfo = "sample $k, level step $($mis.ToString('0.0')) dB, sample step x$($ratio.ToString('0.0'))" }
    if ($score -le 1) { break }
  }
  Move-Item $bestOut $dest -Force
  Remove-Item $wav, $rot, $chk, $out -ErrorAction SilentlyContinue
  Write-Host "$($row.id): cut at $bestInfo"
}

function Invoke-Master($ffmpeg, [string]$src, [double]$trim, [object]$spec, [object]$row, [string]$dest) {
  $inv = [Globalization.CultureInfo]::InvariantCulture
  $tmp = Join-Path $rawDir "$($row.id).master.wav"
  $pre = @('-y', '-hide_banner', '-i', $src)
  if ($trim -gt 0) { $pre += @('-t', $trim.ToString($inv)) }
  $info = Invoke-Native $ffmpeg ($pre + @('-ac', '1', '-ar', "$($spec.sampleRate)", '-c:a', 'pcm_f32le', $tmp))
  if ($info.Code) { throw "ffmpeg decode failed for $($row.id)" }
  $d = 0.0
  if ($info.Text -match 'time=(\d+):(\d+):([\d.]+)' ) { $m = [regex]::Matches($info.Text, 'time=(\d+):(\d+):([\d.]+)'); $l = $m[$m.Count - 1]; $d = [int]$l.Groups[1].Value * 3600 + [int]$l.Groups[2].Value * 60 + [double]::Parse($l.Groups[3].Value, $inv) }
  if ($d -lt 1) { throw "$($row.id): decoded length $d s" }
  $c = $crossfade.ToString($inv); $dc = ($d - $crossfade).ToString($inv); $dd = $d.ToString($inv)
  $lp = if ($row.lowpass) { $one = "lowpass=f=$($row.lowpass),"; if ([int]$row.lowpass -le 6000) { $one + $one } else { $one } } else { '' }
  $graph = "[0:a]${lp}asplit=3[h][m][t];[h]atrim=0:$c,asetpts=PTS-STARTPTS,afade=t=in:d=${c}:curve=qsin[h2];[m]atrim=${c}:$dc,asetpts=PTS-STARTPTS[m2];[t]atrim=${dc}:$dd,asetpts=PTS-STARTPTS,afade=t=out:d=${c}:curve=qsin[t2];[t2][h2]amix=inputs=2:normalize=0:duration=longest[x];[m2][x]concat=n=2:v=0:a=1[o]"
  $loop = Join-Path $rawDir "$($row.id).loop.wav"
  $r = Invoke-Native $ffmpeg @('-y', '-hide_banner', '-i', $tmp, '-filter_complex', $graph, '-map', '[o]', '-c:a', 'pcm_f32le', $loop)
  if ($r.Code) { throw "ffmpeg crossfade failed for $($row.id)" }
  $rotWav = Join-Path $rawDir "$($row.id).rot.wav"
  Invoke-LoopRotate $ffmpeg $loop $rotWav (Get-LoopCuts ([LoopCut]::ReadWav($loop)) ([int]$spec.sampleRate))[0] $row.id
  Move-Item $rotWav $loop -Force
  $st = Invoke-Native $ffmpeg @('-hide_banner', '-i', $loop, '-af', 'astats=measure_perchannel=none:measure_overall=RMS_level+Peak_level', '-f', 'null', '-')
  $rms = [regex]::Matches($st.Text, 'RMS level dB:\s*(-?[\d.]+)'); $pk = [regex]::Matches($st.Text, 'Peak level dB:\s*(-?[\d.]+)')
  if ($rms.Count -eq 0 -or $pk.Count -eq 0) { throw "$($row.id): could not measure the level" }
  $rmsDb = [double]::Parse($rms[$rms.Count - 1].Groups[1].Value, $inv); $peakDb = [double]::Parse($pk[$pk.Count - 1].Groups[1].Value, $inv)
  # up to 5 dB beyond the peak limit is allowed for impulsive files; a soft clip then holds the peak
  $gain = [Math]::Min($targetRms - $rmsDb, $peakLimit - $peakDb + 5)
  $clip = if ($gain -gt $peakLimit - $peakDb + 0.05) { ",asoftclip=type=tanh:threshold=$([Math]::Pow(10, ($peakLimit - 2) / 20).ToString('0.####', $inv))" } else { '' }
  $af = "volume=$($gain.ToString('0.00', $inv))dB$clip"
  $out = "$dest.tmp.ogg"
  $e = Invoke-Native $ffmpeg @('-y', '-v', 'error', '-i', $loop, '-af', $af, '-ac', '1', '-ar', "$($spec.sampleRate)", '-c:a', 'libvorbis', '-q:a', "$([int]$row.quality)", '-map_metadata', '-1',   '-metadata', $masterTag, '-metadata', $cutTag, '-fflags', '+bitexact', '-flags:a', '+bitexact', $out)
  if ($e.Code) { throw "ffmpeg encode failed for $($row.id)" }
  Move-Item $out $dest -Force
  Remove-Item $tmp, $loop -ErrorAction SilentlyContinue
  Write-Host ("{0}: rms {1} -> gain {2:N1} dB, {3:N1} KB" -f $row.id, $rmsDb, $gain, ((Get-Item $dest).Length / 1KB))
}

function Test-Tagged([string]$file, [string]$tag) {
  $b = [IO.File]::ReadAllBytes($file)
  return [Text.Encoding]::GetEncoding(28591).GetString($b, 0, [Math]::Min($b.Length, 4096)).Contains($tag)
}
function Test-Mastered([string]$file) { return (Test-Tagged $file $masterTag) }
function Get-Key {
  if ($env:GG_ELEVENLABS_KEY) { return $env:GG_ELEVENLABS_KEY.Trim() }
  if (-not (Test-Path $KeyFile)) { throw "No API key: set GG_ELEVENLABS_KEY or provide $KeyFile" }
  return (Get-Content $KeyFile -Raw).Trim()
}

function Write-Index($spec) {
  $lines = foreach ($s in ($spec.sounds | Sort-Object id)) {
    if (-not (Test-Path (Join-Path $outDir "$($s.id).ogg"))) { continue }
    $att = if ($s.attenuation) { [int]$s.attenuation } else { 16 }
    $vol = ([double]$s.volume).ToString([Globalization.CultureInfo]::InvariantCulture)
    "  `"$($s.id)`": { `"sounds`": [ { `"name`": `"grindless:$($s.id)`", `"volume`": $vol, `"attenuation_distance`": $att, `"stream`": false } ] }"
  }
  $json = "{`n" + ($lines -join ",`n") + "`n}`n"
  [System.IO.File]::WriteAllText($indexPath, $json, (New-Object System.Text.UTF8Encoding($false)))
}

$spec = Get-Content $specPath -Raw | ConvertFrom-Json
$rows = @($spec.sounds | Where-Object { $Only.Count -eq 0 -or $Only -contains $_.id })
New-Item -ItemType Directory -Force $outDir, $rawDir | Out-Null

if ($Master) {
  $ffmpeg = Get-Ffmpeg
  foreach ($s in $rows) {
    $f = Join-Path $outDir "$($s.id).ogg"
    if (-not (Test-Path $f)) { continue }
    if (-not $Force -and (Test-Mastered $f)) { continue }
    $src = Join-Path $rawDir "$($s.id).src.ogg"
    Copy-Item $f $src -Force
    Invoke-Master $ffmpeg $src 0 $spec $s $f
    Remove-Item $src
  }
  Write-Index $spec; Write-Host 'sounds.json rebuilt'; return
}

if ($Cut) {
  $ffmpeg = Get-Ffmpeg
  foreach ($s in $rows) {
    $f = Join-Path $outDir "$($s.id).ogg"
    if (-not (Test-Path $f)) { continue }
    if (-not $Force -and (Test-Tagged $f $cutTag)) { continue }
    $src = Join-Path $rawDir "$($s.id).src.ogg"
    Copy-Item $f $src -Force
    Invoke-Cut $ffmpeg $src $spec $s $f
    Remove-Item $src
  }
  Write-Index $spec; Write-Host 'sounds.json rebuilt'; return
}

if ($IndexOnly) { Write-Index $spec; Write-Host "sounds.json rebuilt ($($rows.Count) spec rows)"; return }

$todo = @($rows | Where-Object { $Force -or -not (Test-Path (Join-Path $outDir "$($_.id).ogg")) })
if ($todo.Count -eq 0) { Write-Index $spec; Write-Host 'Nothing to generate (use -Force to regenerate).'; return }

$headers = @{ 'xi-api-key' = (Get-Key) }
$sub = Invoke-RestMethod 'https://api.elevenlabs.io/v1/user/subscription' -Headers $headers
Write-Host ("ElevenLabs plan: {0} ({1}), credits used {2}/{3}" -f $sub.tier, $sub.status, $sub.character_count, $sub.character_limit)
if ($sub.tier -eq 'free') { throw 'The free plan has no commercial licence for generated audio: do not generate with it (docs/quality/sounds.md).' }
if ($Plan) { $todo | ForEach-Object { Write-Host "would generate $($_.id) ($($_.duration)s)" }; return }

$ffmpeg = Get-Ffmpeg
foreach ($s in $todo) {
  $raw = Join-Path $rawDir "$($s.id).mp3"
  $body = [ordered]@{ text = $s.prompt; duration_seconds = [double]$s.duration; loop = [bool]$s.loop; prompt_influence = [double]$s.promptInfluence; model_id = $spec.model } | ConvertTo-Json
  try {
    Invoke-WebRequest 'https://api.elevenlabs.io/v1/sound-generation?output_format=mp3_44100_128' -Method Post -Headers $headers `
      -ContentType 'application/json' -Body ([Text.Encoding]::UTF8.GetBytes($body)) -OutFile $raw -UseBasicParsing
  } catch {
    $code = if ($_.Exception.Response) { [int]$_.Exception.Response.StatusCode } else { 0 }
    throw "sound-generation failed for $($s.id): HTTP $code"
  }
  $ogg = Join-Path $outDir "$($s.id).ogg"
  Invoke-Master $ffmpeg $raw ([double]$s.duration) $spec $s $ogg
  $size = (Get-Item $ogg).Length
  Write-Host ("{0}: {1:N1} KB" -f $s.id, ($size / 1KB))
  if ($size -gt $maxBytes) { Write-Warning "$($s.id) is over the 100 KB budget: lower quality or duration in sounds.json" }
}
Write-Index $spec
Write-Host 'sounds.json updated.'
