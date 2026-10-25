param(
    [string]$Destination = (Join-Path $PSScriptRoot 'bin')
)
# Downloads packwiz (it has no releases; uses the GitHub Actions build from the main branch).
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
New-Item -ItemType Directory -Force -Path $Destination | Out-Null
$zip = Join-Path $Destination 'packwiz.zip'
Invoke-WebRequest -UseBasicParsing -Uri 'https://nightly.link/packwiz/packwiz/workflows/go/main/Windows%2064-bit.zip' -OutFile $zip
Expand-Archive -Path $zip -DestinationPath $Destination -Force
Remove-Item $zip
$exe = Join-Path $Destination 'packwiz.exe'
if (-not (Test-Path $exe)) { throw "packwiz.exe did not appear in $Destination" }
Write-Output $exe
