# Builds the Prism Launcher instance of the playable channel: a zip the player imports once
# (Prism: Add Instance > Import > zip). On every launch the instance updates itself from the
# `jugable` branch with packwiz-installer-bootstrap (MIT), which only moves to tested releases.
#   powershell -NoProfile -ExecutionPolicy Bypass -File tools\prism\Build-PrismInstance.ps1 [-Channel jugable] [-OutDir <dir>]
param(
    [string]$Channel = 'jugable',
    [string]$OutDir = (Join-Path $PSScriptRoot 'out'),
    [int]$MinMemMb = 4096,
    [int]$MaxMemMb = 10240
)
$ErrorActionPreference = 'Stop'
$repo = 'Ezequiel24123z/GrindlessGregtech'
$packUrl = "https://raw.githubusercontent.com/$repo/$Channel/pack/pack.toml"
$bootUrl = 'https://github.com/packwiz/packwiz-installer-bootstrap/releases/download/v0.0.3/packwiz-installer-bootstrap.jar'
$name = 'Gregtech Grindless'
$folder = 'GregtechGrindless'

$work = Join-Path ([IO.Path]::GetTempPath()) ("gg-prism-" + [guid]::NewGuid().ToString('N'))
$inst = Join-Path $work $folder
$mc = Join-Path $inst '.minecraft'
New-Item -ItemType Directory -Force -Path $mc | Out-Null
$utf8 = New-Object System.Text.UTF8Encoding($false)

# Prism substitutes $INST_JAVA in the command text when the command runs (after it has picked the Java); the
# environment variable of the same name is computed earlier and can be empty for a new instance with automatic Java,
# so the command must name $INST_JAVA itself (packwiz's documented Prism command). Prism 11 reads instance.cfg with
# QSettings (ConfigVersion 1.3): the value is quoted and its inner quotes escaped.
$preLaunch = '"\"$INST_JAVA\" -jar packwiz-installer-bootstrap.jar ' + $packUrl + '"'

$cfg = @(
    '[General]',
    'ConfigVersion=1.3',
    'InstanceType=OneSix',
    "name=$name",
    'iconKey=default',
    'OverrideCommands=true',
    "PreLaunchCommand=$preLaunch",
    'OverrideMemory=true',
    "MinMemAlloc=$MinMemMb",
    "MaxMemAlloc=$MaxMemMb",
    "notes=`"Gregtech Grindless: canal $Channel. Se actualiza solo al arrancar (solo versiones probadas).`""
) -join "`r`n"
[IO.File]::WriteAllText((Join-Path $inst 'instance.cfg'), $cfg + "`r`n", $utf8)

$pack = [ordered]@{
    components = @(
        [ordered]@{ uid = 'org.lwjgl3'; version = '3.3.1'; cachedName = 'LWJGL 3'; cachedVersion = '3.3.1'; cachedVolatile = $true; dependencyOnly = $true },
        [ordered]@{ uid = 'net.minecraft'; version = '1.20.1'; cachedName = 'Minecraft'; cachedVersion = '1.20.1'; important = $true; cachedRequires = @([ordered]@{ uid = 'org.lwjgl3'; suggests = '3.3.1' }) },
        [ordered]@{ uid = 'net.minecraftforge'; version = '47.4.28'; cachedName = 'Forge'; cachedVersion = '47.4.28'; cachedRequires = @([ordered]@{ uid = 'net.minecraft'; equals = '1.20.1' }) }
    )
    formatVersion = 1
}
[IO.File]::WriteAllText((Join-Path $inst 'mmc-pack.json'), ($pack | ConvertTo-Json -Depth 6), $utf8)

Invoke-WebRequest -UseBasicParsing -Uri $bootUrl -OutFile (Join-Path $mc 'packwiz-installer-bootstrap.jar')
$notice = "packwiz-installer-bootstrap.jar: https://github.com/packwiz/packwiz-installer-bootstrap (MIT License, Copyright (c) packwiz contributors).`r`n"
[IO.File]::WriteAllText((Join-Path $mc 'packwiz-installer-bootstrap.NOTICE.txt'), $notice, $utf8)

New-Item -ItemType Directory -Force -Path $OutDir | Out-Null
$zip = Join-Path $OutDir "Gregtech-Grindless-$Channel.zip"
if (Test-Path $zip) { Remove-Item $zip -Force }
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
# Entry names with '/' (Windows PowerShell's ZipFile.CreateFromDirectory writes '\', which other tools read as part of the name).
$archive = [IO.Compression.ZipFile]::Open($zip, [IO.Compression.ZipArchiveMode]::Create)
try {
    Get-ChildItem $work -Recurse -File -Force | ForEach-Object {
        $rel = $_.FullName.Substring($work.Length + 1) -replace '\\', '/'
        [void][IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, $_.FullName, $rel)
    }
} finally { $archive.Dispose() }
Remove-Item $work -Recurse -Force
Write-Output "Prism instance: $zip"
Write-Output "Channel: $packUrl"
