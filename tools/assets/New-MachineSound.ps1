<#
.SYNOPSIS
  Generates the working-sound loops of our special multiblocks with the ElevenLabs sound-generation API.
.DESCRIPTION
  Reads tools/assets/sounds.json, asks POST /v1/sound-generation for each row (loop, duration, prompt influence), converts the result
  with a pinned portable ffmpeg (.work/, gitignored) to mono OGG Vorbis at the spec sample rate, writes
  pack/kubejs/assets/grindless/sounds/<id>.ogg and rewrites pack/kubejs/assets/grindless/sounds.json deterministically (rows sorted
  by id; only rows whose .ogg exists). A row whose .ogg already exists is skipped unless -Force (a generation costs credits).
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
  # mono, trimmed to the requested length (a loop must not carry the encoder padding), libvorbis
  & $ffmpeg -y -v error -i $raw -t ([double]$s.duration) -ac 1 -ar $spec.sampleRate -c:a libvorbis -q:a ([int]$s.quality) -map_metadata -1 -fflags +bitexact -flags:a +bitexact $ogg
  if ($LASTEXITCODE) { throw "ffmpeg failed for $($s.id)" }
  $size = (Get-Item $ogg).Length
  Write-Host ("{0}: {1:N1} KB" -f $s.id, ($size / 1KB))
  if ($size -gt $maxBytes) { Write-Warning "$($s.id) is over the 100 KB budget: lower quality or duration in sounds.json" }
}
Write-Index $spec
Write-Host 'sounds.json updated.'
