# Local-only regression checks. No SSH, Minecraft, downloads, or remote filesystem writes.
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
$env:GG_BASE = $PSScriptRoot
. (Join-Path $PSScriptRoot 'remote\gg-common.ps1')
$script:Passed = 0

function Assert-Policy {
    param([bool]$Condition, [string]$Name)
    if (-not $Condition) { throw "FAIL: $Name" }
    $script:Passed++
}

function Assert-Rejected {
    param([scriptblock]$Body, [string]$Name)
    $rejected = $false
    try { & $Body | Out-Null } catch { $rejected = $true }
    Assert-Policy $rejected $Name
}

function New-TestRequest {
    return [pscustomobject]@{
        slots = 1; slotMinFreeGb = 8; waitForLog = @()
        serverXms = '1G'; serverXmx = '4G'
        bootTimeoutSec = 420; commandTimeoutSec = 60; clientTimeoutSec = 600
        waitTimeoutSec = 120; lockWaitMin = 5; settleSec = 15
    }
}

foreach ($relative in @('Invoke-GGTest.ps1', 'Test-ResourcePolicy.ps1', 'remote\gg-common.ps1',
        'remote\gg-resource-policy.ps1', 'remote\gg-server.ps1', 'remote\gg-client.ps1', 'remote\Run-GGTest.ps1')) {
    $tokens = $null
    $errors = $null
    [void][Management.Automation.Language.Parser]::ParseFile((Join-Path $PSScriptRoot $relative), [ref]$tokens, [ref]$errors)
    Assert-Policy ($errors.Count -eq 0) "PowerShell parses $relative"
}

$req = New-TestRequest
Assert-GGResourceRequest $req
Assert-Policy ($req.clientXms -eq '1G' -and $req.clientXmx -eq '4G' -and $req.nativeTimeoutSec -eq 600) 'optional new fields use the bounded profile'
foreach ($key in 'serverXms', 'serverXmx', 'clientXms', 'clientXmx') {
    $req = New-TestRequest
    Assert-GGResourceRequest $req
    $req.$key = '7G'
    Assert-Rejected { Assert-GGResourceRequest $req } "$key cannot exceed 4 GB"
    $req.$key = '4G -Xmx12G'
    Assert-Rejected { Assert-GGResourceRequest $req } "$key cannot inject JVM flags"
    $req.$key = '1.5G'
    Assert-Rejected { Assert-GGResourceRequest $req } "$key rejects fractional Java sizes"
    $req.$key = '4097M'
    Assert-Rejected { Assert-GGResourceRequest $req } "$key enforces the byte-size boundary"
}
$req = New-TestRequest
$req.serverXms = '1024M'
$req.serverXmx = '4096M'
Assert-GGResourceRequest $req
Assert-Policy ($req.serverXmx -eq '4096M') 'equivalent valid Java units are preserved'
foreach ($side in 'server', 'client') {
    $req = New-TestRequest
    Assert-GGResourceRequest $req
    $req."${side}Xms" = '4G'
    $req."${side}Xmx" = '2G'
    Assert-Rejected { Assert-GGResourceRequest $req } "$side initial heap cannot exceed maximum"
}
foreach ($key in 'bootTimeoutSec', 'commandTimeoutSec', 'clientTimeoutSec', 'waitTimeoutSec',
        'nativeTimeoutSec', 'lockWaitMin', 'settleSec') {
    $req = New-TestRequest
    Assert-GGResourceRequest $req
    $req.$key = 1801
    Assert-Rejected { Assert-GGResourceRequest $req } "$key cannot bypass the deadline cap"
    $req.$key = -1
    Assert-Rejected { Assert-GGResourceRequest $req } "$key rejects negative values"
}
$req = New-TestRequest
$req.slots = 2
Assert-Rejected { Assert-GGResourceRequest $req } 'uploaded request cannot enable a second JVM'
$req = New-TestRequest
$req.slotMinFreeGb = 0
Assert-Rejected { Assert-GGResourceRequest $req } 'uploaded request cannot disable RAM headroom'
$req = New-TestRequest
$req.waitForLog = @([pscustomobject]@{ pattern = 'DONE'; timeoutSec = 900 })
Assert-Rejected { Assert-GGResourceRequest $req } 'per-marker deadlines cannot bypass the cap'

$originalRamReader = ${function:Get-GGFreeRamGb}
function Get-GGFreeRamGb { return $script:AvailableGb }
$script:AvailableGb = 8
$decision = Get-GGSlotDecision @() 4 0
Assert-Policy ($decision.Index -eq 0 -and $decision.Free -eq 8) 'first JVM starts at the 8 GB boundary even for a legacy caller'
$script:AvailableGb = 7.9
Assert-Policy ((Get-GGSlotDecision @() 4 0).Index -eq -1) 'first JVM also waits for RAM; zero cannot disable the floor'
$script:AvailableGb = 16
foreach ($index in 0, 1, 3) {
    $holder = [pscustomobject]@{ Index = $index; Info = [pscustomobject]@{ v = 2; slots = 4; runId = 'owned-test'; pid = 123; started = '' } }
    Assert-Policy ((Get-GGSlotDecision @($holder) 4 8).Index -eq -1) "legacy slot $index blocks all additional JVMs"
}
Assert-Policy ((Get-GGSlotLimit @() 4) -eq 1) 'global scheduler ceiling is one, not merely a default'
$commonPath = (Join-Path $PSScriptRoot 'remote\gg-common.ps1').Replace("'", "''")
$probeCode = "`$ProgressPreference='SilentlyContinue'; `$env:GG_BASE='$($PSScriptRoot.Replace("'", "''"))'; . '$commonPath'; if (Try-GGNativeMutex) { Exit-GGNativeMutex; 'ACQUIRED' } else { 'BUSY' }"
$encodedProbe = [Convert]::ToBase64String([Text.Encoding]::Unicode.GetBytes($probeCode))
$savedGG = $global:GG.Clone()
$testRoot = Join-Path ([IO.Path]::GetTempPath()) ('gg-resource-policy-' + [guid]::NewGuid().ToString('N'))
$testRun = Join-Path $testRoot 'local-test'
[void][IO.Directory]::CreateDirectory($testRun)
$global:GG.Runs = $testRoot
$global:GG.RunDir = $testRun
$global:GG.RunId = 'local-test'
$global:GG.LockPath = Join-Path $testRoot '.lock'
try {
    $beforeAcquire = [datetime]::UtcNow
    Enter-GGLock -MaxWaitMin 1 -Slots 4 -MinFreeGb 0
    $info = Get-GGLockInfo
    Assert-Policy ($global:GG.HasLock -and $global:GG.NativeMutex -and $info.slots -eq 1) 'real slot acquisition retains the OS mutex and normalizes legacy slot requests'
    Assert-Policy ([datetime]::Parse($info.started).ToUniversalTime() -ge $beforeAcquire) 'lock start records actual acquisition'
    [IO.File]::Delete($global:GG.LockPath)
    $other = & powershell -NoProfile -ExecutionPolicy Bypass -EncodedCommand $encodedProbe
    Assert-Policy ($LASTEXITCODE -eq 0 -and "$other" -eq 'BUSY') 'another real process stays excluded even without a metadata lock file'
    Exit-GGLock
    $other = & powershell -NoProfile -ExecutionPolicy Bypass -EncodedCommand $encodedProbe
    Assert-Policy ($LASTEXITCODE -eq 0 -and "$other" -eq 'ACQUIRED') 'normal slot exit releases the OS mutex even after metadata disappears'
} finally {
    Exit-GGLock
    [IO.File]::Delete((Join-Path $testRoot '.lock'))
    [IO.File]::Delete((Join-Path $testRun '.waiting'))
    [IO.Directory]::Delete($testRun)
    [IO.Directory]::Delete($testRoot)
    $global:GG = $savedGG
}
Set-Item -Path function:Get-GGFreeRamGb -Value $originalRamReader
function Get-CimInstance { throw 'simulated unavailable memory counters' }
Assert-Rejected { Get-GGFreeRamGb } 'unreadable RAM is a failure, not 999 GB of fictional headroom'
Remove-Item function:Get-CimInstance

$budget = @{ TimeoutSec = 600; Clock = [pscustomobject]@{ Elapsed = [pscustomobject]@{ TotalMilliseconds = 0 } } }
Assert-Policy ((Get-GGNativeTimeoutMs $budget 60000) -eq 60000) 'short operation keeps its own deadline'
$budget.Clock.Elapsed.TotalMilliseconds = 599950
Assert-Policy ((Get-GGNativeTimeoutMs $budget 60000) -eq 50) 'RCON and process waits cannot claim a fresh timeout'
$budget.Clock.Elapsed.TotalMilliseconds = 600000
Assert-Rejected { Get-GGNativeTimeoutMs $budget 1 } 'total native budget expires at the boundary'
Assert-Rejected { Get-GGNativeTimeoutMs $budget 600000 } 'a subsequent suite cannot reset the shared budget'

$tokens = $null
$errors = $null
$entry = [Management.Automation.Language.Parser]::ParseFile((Join-Path $PSScriptRoot 'Invoke-GGTest.ps1'), [ref]$tokens, [ref]$errors)
$probe = [scriptblock]::Create($entry.ParamBlock.Extent.Text + @'

[pscustomobject]@{ Slots=$Slots; ServerXms=$ServerXms; ServerXmx=$ServerXmx; ClientXms=$ClientXms; ClientXmx=$ClientXmx; Native=$NativeTimeoutSec; LockWait=$LockWaitMin }
'@)
$defaults = & $probe
Assert-Policy ($defaults.Slots -eq 1 -and $defaults.ServerXms -eq '1G' -and $defaults.ServerXmx -eq '4G') 'local server defaults match remote policy'
Assert-Policy ($defaults.ClientXms -eq '1G' -and $defaults.ClientXmx -eq '4G' -and $defaults.Native -eq 600 -and $defaults.LockWait -eq 5) 'local client and queue defaults match remote policy'
Assert-Rejected { & $probe -Slots 2 } 'local entry rejects extra slots before executing its body'
Assert-Rejected { & $probe -ClientTimeoutSec 1800 } 'local entry rejects the old 30-minute client timeout'
Assert-Rejected { & $probe -NativeTimeoutSec 601 } 'local entry rejects a longer total budget'
Assert-Rejected { & $probe -SlotMinFreeGb 0 } 'local entry rejects disabled RAM headroom'

Add-Type -TypeDefinition @'
using System;
using System.IO;
using System.Net;
using System.Net.Sockets;
using System.Threading;
public sealed class GGSlowRconFixture : IDisposable {
    private readonly TcpListener listener;
    private readonly Thread worker;
    private TcpClient client;
    private volatile bool stopping;
    public int Port { get; private set; }
    public GGSlowRconFixture() {
        listener = new TcpListener(IPAddress.Loopback, 0);
        listener.Start();
        Port = ((IPEndPoint)listener.LocalEndpoint).Port;
        worker = new Thread(new ThreadStart(Serve));
        worker.IsBackground = true;
        worker.Start();
    }
    private void Serve() {
        try {
            using (TcpClient accepted = listener.AcceptTcpClient()) {
                client = accepted;
                NetworkStream stream = accepted.GetStream();
                byte[] packet = {10,0,0,0,100,0,0,0,2,0,0,0,0,0};
                for (int i = 0; i < packet.Length && !stopping; i++) {
                    Thread.Sleep(30);
                    stream.Write(packet, i, 1);
                }
            }
        } catch (IOException) { } catch (SocketException) { } catch (ObjectDisposedException) { }
    }
    public void Dispose() {
        stopping = true;
        listener.Stop();
        if (client != null) client.Close();
        worker.Join(1000);
    }
}
'@
$fixture = New-Object GGSlowRconFixture
try {
    $clock = [Diagnostics.Stopwatch]::StartNew()
    $timedOut = $false
    $failure = ''
    try {
        $connection = [GGRcon]::Connect('127.0.0.1', $fixture.Port, 'test', 120)
        $connection.Dispose()
    } catch {
        $cause = $_.Exception.GetBaseException()
        $failure = $cause.Message
        $timedOut = ($cause -is [IO.IOException] -and $failure -eq 'RCON operation timeout') -or
            ($cause -is [Net.Sockets.SocketException] -and $cause.SocketErrorCode -eq [Net.Sockets.SocketError]::TimedOut)
    }
    Assert-Policy $timedOut "fragmented RCON replies cannot restart the operation deadline ($failure)"
    Assert-Policy ($clock.Elapsed.TotalMilliseconds -lt 1000) 'real loopback RCON timeout stays bounded'
} finally { $fixture.Dispose() }

[Console]::Out.WriteLine("PASS: $script:Passed local resource-policy checks; no Minecraft or SSH launched")
