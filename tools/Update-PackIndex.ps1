param(
    [string]$PackDir = (Join-Path $PSScriptRoot '..\pack'),
    [string]$Packwiz
)
# Deja los archivos de texto de pack/ en UTF-8 sin BOM y con saltos LF (lo que git publica),
# y regenera index.toml. Así los hashes de packwiz coinciden con lo que descarga el jugador.
$ErrorActionPreference = 'Stop'
$PackDir = (Resolve-Path $PackDir).Path

if (-not $Packwiz) { $Packwiz = $env:PACKWIZ_EXE }
if (-not $Packwiz) {
    $local = Join-Path $PSScriptRoot 'bin\packwiz.exe'
    if (-not (Test-Path $local)) { & (Join-Path $PSScriptRoot 'Get-Packwiz.ps1') | Out-Null }
    $Packwiz = $local
}
if (-not (Test-Path $Packwiz)) { throw "No encuentro packwiz.exe ($Packwiz)" }

$textExt = @('.toml', '.js', '.ts', '.json', '.json5', '.snbt', '.mcmeta', '.md', '.txt', '.cfg', '.properties', '.yaml', '.yml', '.lang', '.csv')
$changed = 0
Get-ChildItem -Path $PackDir -Recurse -File | Where-Object { $textExt -contains $_.Extension.ToLowerInvariant() } | ForEach-Object {
    $bytes = [IO.File]::ReadAllBytes($_.FullName)
    $start = 0
    if ($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF) { $start = 3 }
    $out = New-Object System.Collections.Generic.List[byte] ($bytes.Length)
    for ($i = $start; $i -lt $bytes.Length; $i++) {
        if ($bytes[$i] -eq 13 -and ($i + 1) -lt $bytes.Length -and $bytes[$i + 1] -eq 10) { continue }
        $out.Add($bytes[$i])
    }
    if ($start -gt 0 -or $out.Count -ne $bytes.Length) {
        [IO.File]::WriteAllBytes($_.FullName, $out.ToArray())
        $changed++
    }
}
Write-Output "Normalizados: $changed archivo(s)"

Push-Location $PackDir
try {
    & $Packwiz refresh
    if ($LASTEXITCODE -ne 0) { throw "packwiz refresh falló ($LASTEXITCODE)" }
} finally { Pop-Location }
