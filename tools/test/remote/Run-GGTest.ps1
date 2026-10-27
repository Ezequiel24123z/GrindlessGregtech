# Run-GGTest.ps1 - remote entry point. Invoked by tools\test\Invoke-GGTest.ps1 over ssh (home: Windows PowerShell 5.1)
# or through gg-linux-run.sh (azure/local Linux bench: pwsh 7, server suite only).
# Reads <base>\incoming\<RunId>.zip (pack\, overlay\, request.json), takes the global lock,
# runs the requested suites and leaves <base>\runs\<RunId>\results.zip for the caller.
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
        Assert-GGResourceRequest $ctl.Req
        if ($global:GGIsLinux -and [string]$ctl.Req.suite -ne 'server') { throw "suite '$($ctl.Req.suite)' is not supported on a Linux bench (server only; the client suite runs on the home bench)" }
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
            $slots = 1
            Enter-GGLock -MaxWaitMin ([int]$req.lockWaitMin)
            $killed = Stop-GGOrphans
            $drive = New-Object IO.DriveInfo([IO.Path]::GetPathRoot([IO.Path]::GetFullPath($global:GG.Base)))
            $driveLabel = $(if ($global:GGIsLinux) { $global:GG.Base } else { $drive.Name.TrimEnd('\') })
            $freeGb = [math]::Round($drive.AvailableFreeSpace / 1GB, 1)
            if ($freeGb -lt 10) { throw "only $freeGb GB free on $driveLabel" }
            $waited = [int]((Get-Date) - $t0).TotalSeconds
            Set-GGStage 'PASS' ("acquired slot {0} (of {1}) after {2}s; no RAM launch floor; orphans killed {3}; {5} free {4} GB" -f $global:GG.Slot, $slots, $waited, $killed, $freeGb, $driveLabel)
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
        # No more JVMs will start for this run; clear the informational legacy slot state.
        Set-GGSlotState 0 $false
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
            backend    = $(if ($ctl.Req -and $ctl.Req.backend) { [string]$ctl.Req.backend } else { '' })
            os         = $(if ($global:GGIsLinux) { 'linux' } else { 'windows' })
            commit     = $(if ($ctl.Req -and $ctl.Req.commit) { [string]$ctl.Req.commit } else { '' })
            dirty      = $(if ($ctl.Req -and $null -ne $ctl.Req.dirty) { [bool]$ctl.Req.dirty } else { $null })
        }
        [IO.File]::WriteAllText((Join-Path $resultsDir 'meta.json'), (ConvertTo-Json -InputObject $meta), (New-Object Text.UTF8Encoding($false)))
        if ($global:GGIsLinux) {
            $hostInfo = [ordered]@{
                machine = [Environment]::MachineName
                kernel  = $(try { [IO.File]::ReadAllText('/proc/sys/kernel/osrelease').Trim() } catch { '' })
                os      = $(try { ([regex]::Match([IO.File]::ReadAllText('/etc/os-release'), '(?m)^PRETTY_NAME="?([^"\r\n]*)')).Groups[1].Value } catch { '' })
                cpus    = [Environment]::ProcessorCount
                pwsh    = [string]$PSVersionTable.PSVersion
                cgroupMemory = Get-GGCgroupMemory
            }
            [IO.File]::WriteAllText((Join-Path $resultsDir 'host.json'), (ConvertTo-Json -InputObject $hostInfo -Depth 4), (New-Object Text.UTF8Encoding($false)))
        }
        Save-GGStages
        Copy-Item -LiteralPath $global:GG.RunLog -Destination (Join-Path $resultsDir 'run.log') -Force -ErrorAction SilentlyContinue
        New-GGResultsZip $resultsDir (Join-Path $runDir 'results.zip')
        Write-GGLog ("results: {0}" -f (Join-Path $runDir 'results.zip'))
    } catch {
        Write-GGLog ("failed to build results zip: {0}" -f $_.Exception.Message) 'ERROR'
    }
    # anything of THIS run still alive (never the other slot's JVM), then free the slot
    try { [void](Stop-GGRunProcesses $RunId) } catch {}
    Exit-GGLock
    try { Remove-GGOldRuns 3 } catch {}
    [Console]::Out.WriteLine("GGRESULT|$RunId|$overall")
}

if ($overall -eq 'PASS') { exit 0 } else { exit 1 }
