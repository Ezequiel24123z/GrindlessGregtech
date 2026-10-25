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
        slots = 1; waitForLog = @()
        serverXms = '1G'; serverXmx = '4G'
        bootTimeoutSec = 420; commandTimeoutSec = 60; clientTimeoutSec = 600
        waitTimeoutSec = 120; lockWaitMin = 5; settleSec = 15
    }
}

$asts = @{}
$paths = @([IO.Directory]::GetFiles($PSScriptRoot, '*.ps1')) + @([IO.Directory]::GetFiles((Join-Path $PSScriptRoot 'remote'), '*.ps1'))
foreach ($path in $paths) {
    $relative = $path.Substring($PSScriptRoot.Length + 1)
    $tokens = $null
    $errors = $null
    $asts[$relative] = [Management.Automation.Language.Parser]::ParseFile($path, [ref]$tokens, [ref]$errors)
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
Assert-GGResourceRequest $req
Assert-Policy ($null -eq $req.PSObject.Properties['slotMinFreeGb']) 'requests need no RAM-floor field'
foreach ($legacyFloor in @(0, 8, 128, 1000000, -1, [double]::NaN, [double]::PositiveInfinity, $null, 'obsolete')) {
    $req = New-TestRequest
    Add-Member -InputObject $req -NotePropertyName slotMinFreeGb -NotePropertyValue $legacyFloor
    $warnings = @(Assert-GGResourceRequest $req 3>&1)
    Assert-Policy ($warnings.Count -eq 1 -and $warnings[0] -is [Management.Automation.WarningRecord] -and
        "$($warnings[0])" -match 'slotMinFreeGb.*deprecated and ignored') "legacy request RAM value '$legacyFloor' is explicitly ignored"
    Assert-Policy ($req.serverXmx -eq '4G' -and $req.clientXmx -eq '4G' -and $req.nativeTimeoutSec -eq 600) 'ignoring legacy RAM input preserves heap and time caps'
}
$req = New-TestRequest
$req.waitForLog = @([pscustomobject]@{ pattern = 'DONE'; timeoutSec = 900 })
Assert-Rejected { Assert-GGResourceRequest $req } 'per-marker deadlines cannot bypass the cap'

# Even diagnostic callers must get unknown, not a launch refusal, when both counters fail or omit their values.
function Get-CimInstance { throw 'simulated unavailable memory counters' }
try {
    Assert-Policy ($null -eq (Get-GGFreeRamGb)) 'unavailable RAM counters return unknown without throwing'
    function Get-CimInstance { return [pscustomobject]@{} }
    Assert-Policy ($null -eq (Get-GGFreeRamGb)) 'missing RAM counter values return unknown without throwing'
    function Get-CimInstance { return [pscustomobject]@{ AvailableMBytes = 0 } }
    Assert-Policy ((Get-GGFreeRamGb) -eq 0) 'zero available RAM is reported honestly for diagnostics'
} finally { Remove-Item function:Get-CimInstance }

$originalRamReader = ${function:Get-GGFreeRamGb}
$script:RamReads = 0
$script:RamMode = 'low'
function Get-GGFreeRamGb {
    $script:RamReads++
    if ($script:RamMode -eq 'unreadable') { throw 'simulated unavailable memory counters' }
    return $script:AvailableGb
}
foreach ($available in 0, 4.5, 7.9, 8) {
    $script:AvailableGb = $available
    foreach ($legacyFloor in 0, 8, 128, 1000000) {
        $records = @(Get-GGSlotDecision @() 4 $legacyFloor 3>&1)
        $decision = $records[-1]
        Assert-Policy ($decision.Index -eq 0 -and $null -eq $decision.Free -and $decision.Pending -eq 0) "first JVM is admitted with $available GB regardless of legacy floor $legacyFloor"
        Assert-Policy ($records[0] -is [Management.Automation.WarningRecord] -and
            "$($records[0])" -match 'MinFreeGb.*deprecated and ignored') 'legacy slot-decision parameter is explicitly ignored'
    }
}
$script:RamMode = 'unreadable'
Assert-Policy ((Get-GGSlotDecision @() 4).Index -eq 0) 'unreadable counters cannot refuse the first slot'
foreach ($index in 0, 1, 3) {
    $holder = [pscustomobject]@{ Index = $index; Info = [pscustomobject]@{ v = 2; slots = 4; runId = 'owned-test'; pid = 123; started = '' } }
    Assert-Policy ((Get-GGSlotDecision @($holder) 4).Index -eq -1) "legacy slot $index blocks all additional JVMs even without RAM counters"
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
    foreach ($mode in 'low', 'unreadable') {
        $script:RamMode = $mode
        $script:AvailableGb = 0
        $beforeAcquire = [datetime]::UtcNow
        $warnings = @(Enter-GGLock -MaxWaitMin 1 -Slots 4 -MinFreeGb 1000000 -ReserveGb 1000000 3>&1)
        Assert-Policy ($warnings.Count -eq 1 -and "$($warnings[0])" -match 'MinFreeGb.*deprecated and ignored') 'legacy acquisition parameter is explicitly ignored'
        $info = Get-GGLockInfo
        Assert-Policy ($global:GG.HasLock -and $global:GG.NativeMutex -and $info.slots -eq 1) "real acquisition retains the OS mutex with $mode RAM and legacy slot/floor/reserve inputs"
        Assert-Policy ([datetime]::Parse($info.started).ToUniversalTime() -ge $beforeAcquire) 'lock start records actual acquisition'
        Assert-Policy (-not [IO.File]::Exists((Join-Path $testRun '.waiting'))) 'successful acquisition removes its waiting ticket'
        [IO.File]::Delete($global:GG.LockPath)
        $other = & powershell -NoProfile -ExecutionPolicy Bypass -EncodedCommand $encodedProbe
        Assert-Policy ($LASTEXITCODE -eq 0 -and "$other" -eq 'BUSY') 'another real process stays excluded even without a metadata lock file'
        Exit-GGLock
        $other = & powershell -NoProfile -ExecutionPolicy Bypass -EncodedCommand $encodedProbe
        Assert-Policy ($LASTEXITCODE -eq 0 -and "$other" -eq 'ACQUIRED') 'normal slot exit releases the OS mutex even after metadata disappears'
    }

    # A live legacy nonzero slot must exclude acquisition, even though old RAM/reservation fields are ignored.
    $legacyPath = Join-Path $testRoot '.lock.3'
    $legacy = [pscustomobject]@{
        v = 2; slots = 4; slot = 3; runId = 'legacy-local-test'; pid = $PID; reserveGb = 1000000
        started = [datetime]::UtcNow.ToString('o'); updated = [datetime]::UtcNow.ToString('o')
        procStart = (Get-Process -Id $PID).StartTime.ToUniversalTime().ToString('o')
    }
    [IO.File]::WriteAllText($legacyPath, (ConvertTo-Json $legacy))
    $active = @(Get-GGActiveSlots)
    Assert-Policy ($active.Count -eq 1 -and $active[0].Index -eq 3) 'real live legacy slot metadata is recognized'
    Assert-Policy ((Get-GGSlotDecision $active 4).Index -eq -1) 'real legacy holder blocks another JVM without RAM checks'
    $failure = ''
    try { Enter-GGLock -MaxWaitMin 0 -Slots 4 } catch { $failure = $_.Exception.Message }
    Assert-Policy ($failure -match 'timed out.*all 1 slot\(s\) busy') 'actual acquisition refuses a live legacy holder, not unreadable RAM'
    Assert-Policy (-not $global:GG.HasLock -and -not $global:GG.NativeMutex -and
        -not [IO.File]::Exists((Join-Path $testRun '.waiting'))) 'failed acquisition releases its mutex and waiting ticket'
    Assert-Policy ([IO.File]::Exists($legacyPath)) 'failed acquisition preserves the other holder'
    [IO.File]::Delete($legacyPath)

    Enter-GGLock -MaxWaitMin 1
    $foreign = Get-GGLockInfo
    $foreign.runId = 'another-local-test'
    [IO.File]::WriteAllText($global:GG.LockPath, (ConvertTo-Json $foreign))
    Exit-GGLock
    Assert-Policy ([IO.File]::Exists($global:GG.LockPath)) 'exit never deletes metadata now owned by another run'
    $other = & powershell -NoProfile -ExecutionPolicy Bypass -EncodedCommand $encodedProbe
    Assert-Policy ($LASTEXITCODE -eq 0 -and "$other" -eq 'ACQUIRED') 'exit still releases its own OS mutex after metadata ownership changes'
} finally {
    Exit-GGLock
    [IO.File]::Delete((Join-Path $testRoot '.lock'))
    [IO.File]::Delete((Join-Path $testRoot '.lock.3'))
    [IO.File]::Delete((Join-Path $testRun '.waiting'))
    [IO.Directory]::Delete($testRun)
    [IO.Directory]::Delete($testRoot)
    $global:GG = $savedGG
}

# Execute the actual pre-launch statements only, stopping BEFORE GGProc.Start. No JVM or tools can be launched.
# This catches a reintroduced last-moment RAM check on either side, not just a scheduler regression.
function Get-TestLaunchPrefix {
    param($Ast, [string]$Stage)
    $calls = @($Ast.FindAll({
        param($node)
        $node -is [Management.Automation.Language.CommandAst] -and $node.GetCommandName() -eq 'Invoke-GGStage'
    }, $true) | Where-Object { $_.CommandElements[1].Value -eq $Stage })
    Assert-Policy ($calls.Count -eq 1) "locates the actual $Stage stage"
    $statements = @($calls[0].CommandElements[2].ScriptBlock.EndBlock.Statements)
    $starts = @($statements | Where-Object { $_.Extent.Text -match '^\$g = \[GGProc\]::Start\(' })
    Assert-Policy ($starts.Count -eq 1) "$Stage has one identifiable native launch boundary"
    $prefix = @($statements | Where-Object { $_.Extent.StartOffset -lt $starts[0].Extent.StartOffset } |
        ForEach-Object { $_.Extent.Text }) -join "`n"
    Assert-Policy ($prefix -notmatch '::Start\(|Start-Process|Invoke-GGTool') "$Stage regression prefix contains no process launch"
    return [scriptblock]::Create($prefix + "`nreturn `$argLine")
}

$savedBudget = $global:GG.NativeBudget
try {
    foreach ($side in 'server', 'client') {
        $stage = 'boot'
        if ($side -eq 'client') { $stage = 'client-launch' }
        $prefix = Get-TestLaunchPrefix $asts["remote\gg-$side.ps1"] $stage
        $Req = New-TestRequest
        Assert-GGResourceRequest $Req
        $ctx = @{ ForgeVer = 'local-only'; Hmc = @{ Home = 'local-only' } }
        $inst = 'local-only-not-created'
        $renderer = 'mesa'
        foreach ($mode in 'low', 'unreadable') {
            $script:RamMode = $mode
            $script:AvailableGb = 0
            $global:GG.NativeBudget = $null
            $argLine = & $prefix
            Assert-Policy (-not [string]::IsNullOrEmpty($argLine)) "$side reaches the launch boundary with $mode RAM, without starting a process"
            Assert-Policy ($global:GG.NativeBudget.TimeoutSec -eq 600) "$side launch preparation preserves the native budget"
        }
        $global:GG.NativeBudget = @{ TimeoutSec = 600; Clock = [pscustomobject]@{ Elapsed = [pscustomobject]@{ TotalMilliseconds = 600000 } } }
        Assert-Rejected { & $prefix } "$side cannot reset an exhausted budget at the launch boundary"
    }
    Assert-Policy ($script:RamReads -eq 0) 'slot decisions, real acquisition and both launch boundaries never query RAM'
} finally {
    $global:GG.NativeBudget = $savedBudget
    Set-Item -Path function:Get-GGFreeRamGb -Value $originalRamReader
}

$budget = @{ TimeoutSec = 600; Clock = [pscustomobject]@{ Elapsed = [pscustomobject]@{ TotalMilliseconds = 0 } } }
Assert-Policy ((Get-GGNativeTimeoutMs $budget 60000) -eq 60000) 'short operation keeps its own deadline'
$budget.Clock.Elapsed.TotalMilliseconds = 599950
Assert-Policy ((Get-GGNativeTimeoutMs $budget 60000) -eq 50) 'RCON and process waits cannot claim a fresh timeout'
$budget.Clock.Elapsed.TotalMilliseconds = 600000
Assert-Rejected { Get-GGNativeTimeoutMs $budget 1 } 'total native budget expires at the boundary'
Assert-Rejected { Get-GGNativeTimeoutMs $budget 600000 } 'a subsequent suite cannot reset the shared budget'

$entry = $asts['Invoke-GGTest.ps1']
$notice = @($entry.EndBlock.Statements | Where-Object {
    $_ -is [Management.Automation.Language.IfStatementAst] -and $_.Extent.Text -like "*ContainsKey('SlotMinFreeGb')*"
})
Assert-Policy ($notice.Count -eq 1) 'local entry explicitly deprecates the old RAM parameter'
$probe = [scriptblock]::Create($entry.ParamBlock.Extent.Text + "`n" + $notice[0].Extent.Text + @'

[pscustomobject]@{ Slots=$Slots; SlotMinFreeGb=$SlotMinFreeGb; ServerXms=$ServerXms; ServerXmx=$ServerXmx; ClientXms=$ClientXms; ClientXmx=$ClientXmx; Native=$NativeTimeoutSec; LockWait=$LockWaitMin }
'@)
$defaults = & $probe
Assert-Policy ($defaults.Slots -eq 1 -and $defaults.ServerXms -eq '1G' -and $defaults.ServerXmx -eq '4G') 'local server defaults match remote policy'
Assert-Policy ($defaults.ClientXms -eq '1G' -and $defaults.ClientXmx -eq '4G' -and $defaults.Native -eq 600 -and $defaults.LockWait -eq 5) 'local client and queue defaults match remote policy'
Assert-Rejected { & $probe -Slots 2 } 'local entry rejects extra slots before executing its body'
Assert-Rejected { & $probe -ClientTimeoutSec 1800 } 'local entry rejects the old 30-minute client timeout'
Assert-Rejected { & $probe -NativeTimeoutSec 601 } 'local entry rejects a longer total budget'
Assert-Policy ($defaults.SlotMinFreeGb -eq 0) 'local entry has no default RAM floor'
foreach ($legacyFloor in @(0, 8, 128, 1000000, -1, [double]::NaN, [double]::PositiveInfinity)) {
    $records = @(& $probe -SlotMinFreeGb $legacyFloor 3>&1)
    Assert-Policy ($records.Count -eq 2 -and $records[-1].Slots -eq 1 -and
        $records[0] -is [Management.Automation.WarningRecord] -and "$($records[0])" -match 'SlotMinFreeGb.*deprecated and ignored') "local entry accepts and deprecates legacy RAM value '$legacyFloor'"
}
$requestAssignment = @($entry.EndBlock.Statements | Where-Object { $_.Extent.Text -match '^\$request = ' })
Assert-Policy ($requestAssignment.Count -eq 1 -and $requestAssignment[0].Extent.Text -notmatch '(?im)^\s*slotMinFreeGb\s*=') 'new upload payloads do not advertise an active RAM floor'

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
