# Run-GGTest.ps1 - remote (home test PC) entry point. Invoked by tools\test\Invoke-GGTest.ps1 over ssh.
# Reads D:\GregtechGrindless\incoming\<RunId>.zip (pack\, overlay\, request.json), takes the global lock,
# runs the requested suites and leaves D:\GregtechGrindless\runs\<RunId>\results.zip for the caller.
param(
    [Parameter(Mandatory = $true)][string]$RunId
)

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
. (Join-Path $PSScriptRoot 'gg-common.ps1')
. (Join-Path $PSScriptRoot 'gg-tools.ps1')
. (Join-Path $PSScriptRoot 'gg-collect.ps1')
. (Join-Path $PSScriptRoot 'gg-server.ps1')
. (Join-Path $PSScriptRoot 'gg-client.ps1')

$overall = 'FAIL'
$startedUtc = [datetime]::UtcNow
$req = $null
$packInfo = $null
$ctl = @{ Wall = [Diagnostics.Stopwatch]::StartNew() }

Initialize-GGDirs
$runDir = Join-Path $global:GG.Runs $RunId
$resultsDir = Join-Path $runDir 'results'
New-Item -ItemType Directory -Force -Path $runDir | Out-Null
New-Item -ItemType Directory -Force -Path $resultsDir | Out-Null
$global:GG.RunId = $RunId
$global:GG.RunDir = $runDir
$global:GG.ResultsDir = $resultsDir
$global:GG.RunLog = Join-Path $runDir 'run.log'

Write-GGLog ("GG remote runner start: run {0} on {1} (PowerShell {2}, runner pid {3})" -f $RunId, $env:COMPUTERNAME, $PSVersionTable.PSVersion, $PID)

try {
    $ok = Invoke-GGStage 'extract' {
        $zip = Join-Path $global:GG.Incoming "$RunId.zip"
        if (-not (Test-Path -LiteralPath $zip)) { throw "uploaded zip not found: $zip" }
        [IO.Compression.ZipFile]::ExtractToDirectory($zip, $runDir)
        Remove-Item -LiteralPath $zip -Force -ErrorAction SilentlyContinue
        $reqPath = Join-Path $runDir 'request.json'
        if (-not (Test-Path $reqPath)) { throw 'request.json missing in upload' }
        $ctl.Req = (Get-Content -LiteralPath $reqPath -Raw -Encoding UTF8) | ConvertFrom-Json
        $packToml = Join-Path $runDir 'pack\pack.toml'
        if (-not (Test-Path $packToml)) { throw 'pack\pack.toml missing in upload' }
        $ctl.PackInfo = Read-GGPackToml $packToml
        if (-not $ctl.PackInfo.forge) { throw "pack.toml has no [versions] forge entry (this harness supports Forge only)" }
        if (-not $ctl.PackInfo.mc) { throw 'pack.toml has no [versions] minecraft entry' }
        Set-GGStage 'PASS' ("pack '{0}' {1}: MC {2}, Forge {3}" -f $ctl.PackInfo.name, $ctl.PackInfo.version, $ctl.PackInfo.mc, $ctl.PackInfo.forge)
    }

    if ($ok) {
        $req = $ctl.Req
        $packInfo = $ctl.PackInfo
        $packToml = Join-Path $runDir 'pack\pack.toml'
        $packKey = Get-GGPackKey $packInfo.name

        $ok = Invoke-GGStage 'lock' {
            $t0 = Get-Date
            Enter-GGLock ([int]$req.lockWaitMin)
            $killed = Stop-GGOrphans
            $freeGb = [math]::Round((Get-PSDrive D).Free / 1GB, 1)
            if ($freeGb -lt 10) { throw "only $freeGb GB free on D:" }
            $waited = [int]((Get-Date) - $t0).TotalSeconds
            Set-GGStage 'PASS' ("acquired after {0}s; orphans killed {1}; D: free {2} GB" -f $waited, $killed, $freeGb)
        }
    }

    if ($ok) {
        $suite = [string]$req.suite
        if ($suite -eq 'server' -or $suite -eq 'both') {
            Invoke-GGServerSuite $req $packToml $packInfo $packKey
        }
        if ($suite -eq 'client' -or $suite -eq 'both') {
            Invoke-GGClientSuite $req $packToml $packInfo $packKey
        }
    }
} catch {
    Add-GGStage 'harness' 'FAIL' 0 ($_.Exception.Message + ' @ ' + $_.InvocationInfo.PositionMessage)
} finally {
    try {
        $failed = @($global:GG.Stages | Where-Object { $_.status -eq 'FAIL' })
        $overall = 'PASS'
        if ($failed.Count -gt 0) { $overall = 'FAIL' }
        if ($global:GG.Stages.Count -eq 0) { $overall = 'FAIL' }
        $meta = [ordered]@{
            runId      = $RunId
            overall    = $overall
            startedUtc = $startedUtc.ToString('o')
            seconds    = [math]::Round($ctl.Wall.Elapsed.TotalSeconds, 1)
            host       = $env:COMPUTERNAME
            suite      = $(if ($req) { [string]$req.suite } else { '' })
            pack       = $(if ($packInfo) { $packInfo.name } else { '' })
            packVersion = $(if ($packInfo) { $packInfo.version } else { '' })
            minecraft  = $(if ($packInfo) { $packInfo.mc } else { '' })
            forge      = $(if ($packInfo) { $packInfo.forge } else { '' })
        }
        [IO.File]::WriteAllText((Join-Path $resultsDir 'meta.json'), (ConvertTo-Json -InputObject $meta), (New-Object Text.UTF8Encoding($false)))
        Save-GGStages
        Copy-Item -LiteralPath $global:GG.RunLog -Destination (Join-Path $resultsDir 'run.log') -Force -ErrorAction SilentlyContinue
        New-GGResultsZip $resultsDir (Join-Path $runDir 'results.zip')
        Write-GGLog ("results: {0}" -f (Join-Path $runDir 'results.zip'))
    } catch {
        Write-GGLog ("failed to build results zip: {0}" -f $_.Exception.Message) 'ERROR'
    }
    Exit-GGLock
    try { Remove-GGOldRuns 3 } catch {}
    [Console]::Out.WriteLine("GGRESULT|$RunId|$overall")
}

if ($overall -eq 'PASS') { exit 0 } else { exit 1 }
