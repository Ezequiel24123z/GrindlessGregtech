param(
    [string]$Destination = (Join-Path $PSScriptRoot 'bin')
)
# Downloads packwiz (it has no releases). Pinned to one recorded GitHub Actions build (run 38494029406, commit
# 170b22d785959dda5876b54b7f16e1b807a57fb6, MIT) and verified by SHA-256, so a moving main cannot change the tool.
# To update: pick a new successful "Go" run on main, download its artifact and record the new run id and digest here.
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
$runId = '38494029406'
$sha256 = '0F67C098635ADABCCFB34F160F7C938BC27054C265AE4C337230C375B9DCBC66'
New-Item -ItemType Directory -Force -Path $Destination | Out-Null
$zip = Join-Path $Destination 'packwiz.zip'
Invoke-WebRequest -UseBasicParsing -Uri "https://nightly.link/packwiz/packwiz/actions/runs/$runId/Windows%2064-bit.zip" -OutFile $zip
$got = (Get-FileHash $zip -Algorithm SHA256).Hash
if ($got -ne $sha256) { Remove-Item $zip -Force; throw "packwiz artifact digest mismatch: expected $sha256, got $got" }
Expand-Archive -Path $zip -DestinationPath $Destination -Force
Remove-Item $zip
$exe = Join-Path $Destination 'packwiz.exe'
if (-not (Test-Path $exe)) { throw "packwiz.exe did not appear in $Destination" }
Write-Output $exe
