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
  $st = Invoke-Native $ffmpeg @('-hide_banner', '-i', $loop, '-af', 'astats=measure_perchannel=none:measure_overall=RMS_level+Peak_level', '-f', 'null', '-')
  $rms = [regex]::Matches($st.Text, 'RMS level dB:\s*(-?[\d.]+)'); $pk = [regex]::Matches($st.Text, 'Peak level dB:\s*(-?[\d.]+)')
  if ($rms.Count -eq 0 -or $pk.Count -eq 0) { throw "$($row.id): could not measure the level" }
  $rmsDb = [double]::Parse($rms[$rms.Count - 1].Groups[1].Value, $inv); $peakDb = [double]::Parse($pk[$pk.Count - 1].Groups[1].Value, $inv)
  # up to 5 dB beyond the peak limit is allowed for impulsive files; a soft clip then holds the peak
  $gain = [Math]::Min($targetRms - $rmsDb, $peakLimit - $peakDb + 5)
  $clip = if ($gain -gt $peakLimit - $peakDb + 0.05) { ",asoftclip=type=tanh:threshold=$([Math]::Pow(10, ($peakLimit - 2) / 20).ToString('0.####', $inv))" } else { '' }
  $af = "volume=$($gain.ToString('0.00', $inv))dB$clip,afade=t=in:d=0.003,afade=t=out:st=$(($d - $crossfade - 0.003).ToString($inv)):d=0.003"
  $out = "$dest.tmp.ogg"
  $e = Invoke-Native $ffmpeg @('-y', '-v', 'error', '-i', $loop, '-af', $af, '-ac', '1', '-ar', "$($spec.sampleRate)", '-c:a', 'libvorbis', '-q:a', "$([int]$row.quality)", '-map_metadata', '-1', '-metadata', $masterTag, '-fflags', '+bitexact', '-flags:a', '+bitexact', $out)
  if ($e.Code) { throw "ffmpeg encode failed for $($row.id)" }
  Move-Item $out $dest -Force
  Remove-Item $tmp, $loop -ErrorAction SilentlyContinue
  Write-Host ("{0}: rms {1} -> gain {2:N1} dB, {3:N1} KB" -f $row.id, $rmsDb, $gain, ((Get-Item $dest).Length / 1KB))
}

function Test-Mastered([string]$file) {
  $b = [IO.File]::ReadAllBytes($file)
  return [Text.Encoding]::GetEncoding(28591).GetString($b, 0, [Math]::Min($b.Length, 4096)).Contains($masterTag)
}
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
