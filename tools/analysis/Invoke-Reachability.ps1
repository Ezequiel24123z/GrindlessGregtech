<#
.SYNOPSIS
  Validacion estatica de progresion de Gregtech Grindless: volcado de recetas en el servidor de pruebas + alcanzabilidad.

.DESCRIPTION
  1. Sube pack\ y un overlay minimo (solo gg_dump.js) al PC de casa con tools\test\Invoke-GGTest.ps1, arranca un
     servidor limpio, lanza `kubejs custom_command gg_dump` y recupera kubejs\exported\*.json.
  2. Ejecuta tools\analysis\reachability.mjs (Node >= 18) sobre ese volcado con la configuracion tiers\<Tier>.json.
  3. Imprime el informe (PASS/FAIL por objetivo y cadena de bloqueo) y lo guarda en out\<fecha>-<Tier>\.

  Codigo de salida: 0 = PASS, 1 = hay FAIL/WARN en el analisis, 2 = fallo de la herramienta (volcado, Node, datos).

.PARAMETER Tier       Nombre del tier (tiers\<Tier>.json): steam, lv...
.PARAMETER SkipDump   No arranca el servidor: reutiliza -DumpDir o, si falta, el ultimo volcado (out\latest.txt).
.PARAMETER DumpDir    Carpeta con recipes.json, tags.json, items.json, machines.json, veins.json, info.json.
.PARAMETER OutDir     Carpeta de salida (por defecto tools\analysis\out\<fecha>-<Tier>).
.PARAMETER NodeExe    Ruta a node.exe. Si falta: $env:GG_NODE, node del PATH (>= 18), tools\analysis\.work\node y, en
                      ultimo caso, descarga un Node LTS portatil (zip oficial) en tools\analysis\.work\node.
.PARAMETER Pass       both (por defecto), gate (solo la puerta) o auto (solo la generacion automatica).
.PARAMETER Explain    Imprime la derivacion completa de los objetivos cuyo id/nombre contenga este texto.
.PARAMETER Detail     Imprime la derivacion de todos los objetivos.
.PARAMETER PackDir    Pack a subir (por defecto el del repo; se pasa tal cual a Invoke-GGTest.ps1).
.PARAMETER DumpTimeoutSec  Plazo para el marcador GGTEST|dump|DONE tras lanzar el comando (por defecto 240).
.PARAMETER LockWaitMin     Minutos que espera el candado del PC de casa (una sola JVM a la vez).

.EXAMPLE
  powershell -NoProfile -ExecutionPolicy Bypass -File tools\analysis\Invoke-Reachability.ps1 -Tier steam
.EXAMPLE
  powershell -NoProfile -ExecutionPolicy Bypass -File tools\analysis\Invoke-Reachability.ps1 -Tier steam -SkipDump -Explain perforadora
#>
param(
    [Parameter(Mandatory = $true)][string]$Tier,
    [switch]$SkipDump,
    [string]$DumpDir,
    [string]$OutDir,
    [string]$NodeExe,
    [ValidateSet('both', 'gate', 'auto')][string]$Pass = 'both',
    [string]$Explain,
    [switch]$Detail,
    [string]$PackDir,
    [int]$DumpTimeoutSec = 240,
    [int]$LockWaitMin = 120
)

$ErrorActionPreference = 'Stop'
$Here = Split-Path -Parent $MyInvocation.MyCommand.Path
$Repo = (Resolve-Path (Join-Path $Here '..\..')).Path
$Work = Join-Path $Here '.work'
$OutRoot = Join-Path $Here 'out'
$Analyzer = Join-Path $Here 'reachability.mjs'
$Harness = Join-Path $Repo 'tools\test\Invoke-GGTest.ps1'
$DumpScript = Join-Path $Repo 'tools\test\overlay\kubejs\server_scripts\gg_dump.js'
$MinNodeMajor = 18

function Write-Step([string]$msg) { Write-Host ("[reachability] " + $msg) -ForegroundColor Cyan }
function Fail([string]$msg, [int]$code = 2) { Write-Host ("[reachability] ERROR: " + $msg) -ForegroundColor Red; exit $code }

function Get-NodeMajor([string]$exe) {
    try {
        $v = (& $exe --version 2>$null | Select-Object -First 1)
        if ($v -match '^v(\d+)\.') { return [int]$Matches[1] }
    } catch { }
    return 0
}

function Install-PortableNode([string]$dest) {
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    Write-Step 'No hay Node >= 18: descargando un Node LTS portatil (zip oficial de nodejs.org)'
    $index = Invoke-RestMethod -Uri 'https://nodejs.org/dist/index.json'
    $entry = $index | Where-Object { $_.lts -and ($_.files -contains 'win-x64-zip') } | Select-Object -First 1
    if (-not $entry) { Fail 'nodejs.org no ofrece ningun LTS win-x64-zip' }
    $ver = $entry.version
    $name = "node-$ver-win-x64"
    New-Item -ItemType Directory -Force -Path $Work | Out-Null
    $zip = Join-Path $Work "$name.zip"
    Invoke-WebRequest -Uri "https://nodejs.org/dist/$ver/$name.zip" -OutFile $zip -UseBasicParsing
    $sums = (Invoke-WebRequest -Uri "https://nodejs.org/dist/$ver/SHASUMS256.txt" -UseBasicParsing).Content -split "`n"
    $line = $sums | Where-Object { $_ -match ([regex]::Escape("$name.zip") + '\s*$') } | Select-Object -First 1
    if (-not $line) { Fail "SHASUMS256.txt no lista $name.zip" }
    $expected = ($line -split '\s+')[0].ToLower()
    $actual = (Get-FileHash -Algorithm SHA256 -Path $zip).Hash.ToLower()
    if ($expected -ne $actual) { Remove-Item $zip -Force; Fail "SHA256 de $name.zip no coincide" }
    $tmp = Join-Path $Work 'node-extract'
    if (Test-Path $tmp) { Remove-Item $tmp -Recurse -Force }
    Expand-Archive -Path $zip -DestinationPath $tmp -Force
    if (Test-Path $dest) { Remove-Item $dest -Recurse -Force }
    Move-Item -Path (Join-Path $tmp $name) -Destination $dest
    Remove-Item $tmp -Recurse -Force
    Remove-Item $zip -Force
    return (Join-Path $dest 'node.exe')
}

function Resolve-Node {
    $candidates = @()
    if ($NodeExe) { $candidates += $NodeExe }
    if ($env:GG_NODE) { $candidates += $env:GG_NODE }
    $cmd = Get-Command node.exe -ErrorAction SilentlyContinue
    if ($cmd) { $candidates += $cmd.Source }
    $candidates += (Join-Path $Work 'node\node.exe')
    foreach ($c in $candidates) {
        if ($c -and (Test-Path $c) -and ((Get-NodeMajor $c) -ge $MinNodeMajor)) { return $c }
    }
    if ($NodeExe) { Fail "el Node indicado en -NodeExe no existe o es anterior a v$MinNodeMajor" }
    return (Install-PortableNode (Join-Path $Work 'node'))
}

function Test-DumpDir([string]$dir) {
    foreach ($f in 'recipes.json', 'items.json', 'tags.json') {
        if (-not (Test-Path (Join-Path $dir $f))) { return $false }
    }
    return $true
}

function Invoke-Dump([string]$runDir) {
    if (-not (Test-Path $Harness)) { Fail "no existe $Harness" }
    if (-not (Test-Path $DumpScript)) { Fail "no existe $DumpScript" }
    $overlay = Join-Path $Work "overlay-$Tier"
    if (Test-Path $overlay) { Remove-Item $overlay -Recurse -Force }
    New-Item -ItemType Directory -Force -Path (Join-Path $overlay 'kubejs\server_scripts') | Out-Null
    New-Item -ItemType Directory -Force -Path (Join-Path $overlay 'kubejs\exported') | Out-Null
    Copy-Item $DumpScript (Join-Path $overlay 'kubejs\server_scripts\gg_dump.js')
    # kubejs/exported debe existir para que el banco de pruebas recoja lo que escribe el volcado.
    New-Item -ItemType File -Force -Path (Join-Path $overlay 'kubejs\exported\.keep') | Out-Null

    $harnessOut = Join-Path $runDir 'harness'
    $hargs = @(
        '-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', $Harness,
        '-Suite', 'server', '-OverlayDir', $overlay, '-OutDir', $harnessOut,
        '-Commands', 'kubejs custom_command gg_dump',
        '-WaitForLog', ('GGTEST\|dump\|(DONE|FAIL)@@' + $DumpTimeoutSec),
        '-LockWaitMin', $LockWaitMin
    )
    if ($PackDir) { $hargs += @('-PackDir', $PackDir) }
    Write-Step 'Volcado: servidor limpio en el PC de casa (arranque + export; 2-5 min, espera si hay otra prueba)'
    # Out-Host: la salida del banco de pruebas se muestra pero no se mezcla con el valor que devuelve esta funcion.
    & powershell.exe @hargs | Out-Host
    $code = $LASTEXITCODE

    $exported = Join-Path $harnessOut 'results\server\kubejs-exported'
    if (-not (Test-DumpDir $exported)) {
        Fail ("el banco de pruebas termino con codigo $code y no dejo el volcado en $exported; revisa " +
            (Join-Path $harnessOut 'summary.txt'))
    }
    if ($code -ne 0) {
        Write-Host ("[reachability] AVISO: Invoke-GGTest.ps1 salio con codigo $code, pero el volcado esta completo (ver " +
            (Join-Path $harnessOut 'summary.txt') + ')') -ForegroundColor Yellow
    }
    $dest = Join-Path $runDir 'dump'
    if (Test-Path $dest) { Remove-Item $dest -Recurse -Force }
    Copy-Item $exported $dest -Recurse
    return $dest
}

function Remove-OldRuns([int]$keep) {
    if (-not (Test-Path $OutRoot)) { return }
    $old = Get-ChildItem $OutRoot -Directory | Sort-Object Name -Descending | Select-Object -Skip $keep
    foreach ($d in $old) { Remove-Item $d.FullName -Recurse -Force }
}

# --- principal (no se ejecuta si se carga con punto para usar las funciones) ---
if ($MyInvocation.InvocationName -eq '.') { return }

try { [Console]::OutputEncoding = [System.Text.Encoding]::UTF8; $OutputEncoding = [System.Text.Encoding]::UTF8 } catch { }

if (-not (Test-Path $Analyzer)) { Fail "no existe $Analyzer" }
if (-not (Test-Path (Join-Path $Here "tiers\$Tier.json"))) { Fail "no existe tiers\$Tier.json (tiers disponibles: $((Get-ChildItem (Join-Path $Here 'tiers') -Filter *.json).BaseName -join ', '))" }
if (-not $OutDir) { $OutDir = Join-Path $OutRoot ((Get-Date -Format 'yyyyMMdd-HHmmss') + '-' + $Tier) }
New-Item -ItemType Directory -Force -Path $OutDir | Out-Null

$node = Resolve-Node
Write-Step ("Node: $node (" + (& $node --version) + ')')

if ($SkipDump) {
    if (-not $DumpDir) {
        $latest = Join-Path $OutRoot 'latest.txt'
        if (-not (Test-Path $latest)) { Fail 'con -SkipDump hace falta -DumpDir (no hay ningun volcado previo en out\latest.txt)' }
        $DumpDir = (Get-Content $latest -Raw).Trim()
    }
    if (-not (Test-DumpDir $DumpDir)) { Fail "$DumpDir no contiene recipes.json, items.json y tags.json" }
    Write-Step "Reutilizando el volcado de $DumpDir"
} else {
    $DumpDir = Invoke-Dump $OutDir
    New-Item -ItemType Directory -Force -Path $OutRoot | Out-Null
    Set-Content -Path (Join-Path $OutRoot 'latest.txt') -Value $DumpDir -Encoding UTF8
}

$report = Join-Path $OutDir "report-$Tier.txt"
$aargs = @($Analyzer, '--tier', $Tier, '--dump', $DumpDir, '--pass', $Pass, '--out', $report, '--json', (Join-Path $OutDir "report-$Tier.json"))
if ($Explain) { $aargs += @('--explain', $Explain) }
if ($Detail) { $aargs += '--verbose' }
Write-Step "Analisis: $Tier ($Pass)"
& $node @aargs
$code = $LASTEXITCODE
Remove-OldRuns 6
Write-Step ("Informe: $report (codigo ${code}: " + $(if ($code -eq 0) { 'PASS' } elseif ($code -eq 1) { 'FAIL' } else { 'error' }) + ')')
exit $code
