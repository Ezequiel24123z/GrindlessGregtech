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

# the bounded restart (gg-server.ps1 Invoke-GGServerRestart): request rules, and a static look at the function itself
$req = New-TestRequest
Add-Member -InputObject $req -NotePropertyName suite -NotePropertyValue 'server'
Add-Member -InputObject $req -NotePropertyName commands -NotePropertyValue @('kubejs custom_command gg_x', '@restart:GGTEST\|x\|PHASE1', 'kubejs custom_command gg_x')
Assert-GGResourceRequest $req
Assert-Policy $true 'one restart with a marker is a valid server request'
$req.suite = 'both'
Assert-GGResourceRequest $req
Assert-Policy $true 'one restart is valid in the server stage of a combined request'
$req.commands = @('@restart', '@restart')
Assert-Rejected { Assert-GGResourceRequest $req } 'a combined request cannot restart twice or open another native budget'
$req.suite = 'server'
$req.commands = @('@restart', '@restart')
Assert-Rejected { Assert-GGResourceRequest $req } 'a run cannot restart twice (both boots share one budget)'
$req.commands = @('@restart:(unclosed')
Assert-Rejected { Assert-GGResourceRequest $req } 'a restart marker must be a valid regex'
$req.commands = @('@restartnow')
Assert-Rejected { Assert-GGResourceRequest $req } 'a malformed restart command is refused'
$req.commands = @('@restart:GGTEST\|a\|DONE&&GGTEST\|b\|DONE')
Assert-GGResourceRequest $req
Assert-Policy $true 'a restart may wait for several markers (&&)'
$req.commands = @('@restart:GGTEST\|a\|DONE&&')
Assert-Rejected { Assert-GGResourceRequest $req } 'an empty restart marker is refused'
$req.commands = @('@restart:GGTEST\|a\|DONE&&(')
Assert-Rejected { Assert-GGResourceRequest $req } 'every restart marker must be a valid regex'
$req.commands = @('@restart')
$req.suite = 'client'
Assert-Rejected { Assert-GGResourceRequest $req } 'a client-only request cannot restart a server'
$tokens = $null
$errors = $null
$serverAst = [Management.Automation.Language.Parser]::ParseFile((Join-Path $PSScriptRoot 'remote\gg-server.ps1'), [ref]$tokens, [ref]$errors)
Assert-Policy (@($errors).Count -eq 0) ('gg-server.ps1 parses without errors ' + (@($errors) -join '; '))
$restartFn = $serverAst.Find({ param($n) $n -is [Management.Automation.Language.FunctionDefinitionAst] -and $n.Name -eq 'Invoke-GGServerRestart' }, $true)
Assert-Policy ($null -ne $restartFn) 'gg-server.ps1 defines Invoke-GGServerRestart'
$budgetWrites = @($restartFn.FindAll({ param($n) $n -is [Management.Automation.Language.AssignmentStatementAst] -and $n.Left.Extent.Text -match 'NativeBudget' }, $true))
Assert-Policy ($budgetWrites.Count -eq 0) 'a restart never resets or replaces the native budget clock'
$calls = @($restartFn.FindAll({ param($n) $n -is [Management.Automation.Language.CommandAst] }, $true) | ForEach-Object { $_.GetCommandName() })
Assert-Policy (@($calls | Where-Object { $_ -eq 'Get-GGNativeTimeoutMs' }).Count -ge 6) 'every restart wait is bounded by the shared native budget'
Assert-Policy (-not ($calls -contains 'Get-GGFreeRamGb') -and $restartFn.Extent.Text -notmatch 'Insufficient available RAM') 'a restart adds no RAM gate: the one global test JVM and its heap caps are the limits'
Assert-Policy ($restartFn.Extent.Text -match 'Get-GGNativeTimeoutMs \$budget 30000') 'a restart stops the server within the same 30 s grace as the final shutdown'
Assert-Policy ((Get-Content -Raw (Join-Path $PSScriptRoot 'remote\gg-server.ps1')) -match "Invoke-GGServerRestart \`$ctx \`$inst \`$res \`$Req") 'the commands stage hands @restart to Invoke-GGServerRestart instead of RCON'
$waitStage = @($serverAst.FindAll({ param($n) $n -is [Management.Automation.Language.CommandAst] -and $n.GetCommandName() -eq 'Invoke-GGStage' }, $true) | Where-Object { $_.CommandElements[1].Value -eq 'wait-markers' })
Assert-Policy ($waitStage.Count -eq 1 -and $waitStage[0].Extent.Text -match 'phase1\\logs\\kubejs\\server\.log' -and $waitStage[0].Extent.Text -match 'phase1\\logs\\latest\.log') 'after a restart, -WaitForLog markers may come from either boot'

# A local dry run of Invoke-GGServerRestart: a small console program stands in for java (it writes the "Done" line and exits 0 on
# `stop`) and a loopback listener answers RCON's login. Two markers (one in each log), the console stop, the first boot's logs moved to
# phase1\, the same command line started (no RAM gate), the boot, the settle and RCON, on the run's one budget clock; then a marker that
# never comes. No Minecraft, no SSH.
. (Join-Path $PSScriptRoot 'remote\gg-server.ps1')
$dryRoot = Join-Path $PSScriptRoot ('.restart-dryrun-' + [guid]::NewGuid().ToString('N'))
[void][IO.Directory]::CreateDirectory($dryRoot)
$fakeJava = Join-Path $dryRoot 'fake-java.exe'
Add-Type -OutputAssembly $fakeJava -OutputType ConsoleApplication -TypeDefinition @'
using System;
using System.IO;
public static class GGFakeServer {
    public static int Main(string[] args) {
        Directory.CreateDirectory("logs");
        string log = Path.Combine("logs", "latest.log");
        File.AppendAllText(log, "[00:00:00] [Server thread/INFO] [minecraft/DedicatedServer]: Done (1.000s)! For help, type \"help\"" + Environment.NewLine);
        Console.Out.WriteLine("fake server up: " + string.Join(" ", args));
        string line;
        while ((line = Console.In.ReadLine()) != null) {
            if (line.Trim() == "stop") {
                File.AppendAllText(log, "[00:00:01] [Server thread/INFO] [minecraft/MinecraftServer]: Stopping server" + Environment.NewLine);
                return 0;
            }
        }
        return 3;
    }
}
'@
Add-Type -TypeDefinition @'
using System;
using System.IO;
using System.Net;
using System.Net.Sockets;
using System.Threading;
public sealed class GGLoginRconFixture : IDisposable {
    private readonly TcpListener listener;
    private readonly Thread worker;
    private volatile bool stopping;
    public int Port { get; private set; }
    public int Logins;
    public GGLoginRconFixture() {
        listener = new TcpListener(IPAddress.Loopback, 0);
        listener.Start();
        Port = ((IPEndPoint)listener.LocalEndpoint).Port;
        worker = new Thread(new ThreadStart(Serve));
        worker.IsBackground = true;
        worker.Start();
    }
    private static byte[] ReadExact(NetworkStream s, int n) {
        byte[] b = new byte[n];
        int o = 0;
        while (o < n) { int r = s.Read(b, o, n - o); if (r <= 0) throw new IOException("closed"); o += r; }
        return b;
    }
    private void Serve() {
        while (!stopping) {
            try {
                TcpClient c = listener.AcceptTcpClient();
                NetworkStream s = c.GetStream();
                int len = BitConverter.ToInt32(ReadExact(s, 4), 0);
                byte[] p = ReadExact(s, len);
                MemoryStream m = new MemoryStream();
                BinaryWriter w = new BinaryWriter(m);
                w.Write(10); w.Write(BitConverter.ToInt32(p, 0)); w.Write(2); w.Write((short)0);
                byte[] a = m.ToArray();
                s.Write(a, 0, a.Length);
                Interlocked.Increment(ref Logins);
            } catch (IOException) { } catch (SocketException) { } catch (ObjectDisposedException) { } catch (InvalidOperationException) { }
        }
    }
    public void Dispose() { stopping = true; listener.Stop(); worker.Join(1000); }
}
'@
$savedDryGG = $global:GG.Clone()
$dryProcs = New-Object System.Collections.ArrayList
$dryRcon = New-Object GGLoginRconFixture
$script:DryLog = New-Object System.Collections.ArrayList
function Write-GGLog { param([string]$Message, [string]$Level = 'INFO') [void]$script:DryLog.Add($Message) }
# no RAM gate: a restart must not even read the counters (0 GB "available" here would refuse any launch that looked)
$script:DryRamReads = 0
function Get-GGFreeRamGb { $script:DryRamReads++; return 0 }
try {
    $inst = Join-Path $dryRoot 'server'
    $res = Join-Path $dryRoot 'results'
    [void][IO.Directory]::CreateDirectory((Join-Path $inst 'logs\kubejs'))
    [void][IO.Directory]::CreateDirectory($res)
    [IO.File]::WriteAllText((Join-Path $inst 'logs\kubejs\server.log'), "[00:00:00] [INFO] GGTEST|dry|PHASE1|DONE`r`n")
    $global:GG.RunId = 'restart-dryrun'
    $global:GG.HasLock = $false
    $global:GG.RunLog = ''
    $global:GG.NativeBudget = @{ Clock = [Diagnostics.Stopwatch]::StartNew(); TimeoutSec = 600 }
    $dryBudget = $global:GG.NativeBudget
    $first = [GGProc]::Start($fakeJava, 'first boot', $inst, (Join-Path $res 'server-stdout.log'), (Join-Path $res 'server-stderr.log'), $null)
    [void]$dryProcs.Add($first)
    $waited = [Diagnostics.Stopwatch]::StartNew()
    while (-not (Test-Path (Join-Path $inst 'logs\latest.log')) -and $waited.Elapsed.TotalSeconds -lt 20) { Start-Sleep -Milliseconds 100 }
    # the second marker: another test's DONE in latest.log (the fake server opens it only to append a line)
    [IO.File]::AppendAllText((Join-Path $inst 'logs\latest.log'), "[00:00:00] [Server thread/INFO] [KubeJS Server/]: GGTEST|other|DONE`r`n")
    $ctx = @{ Proc = $first; Rcon = $null; Java = $fakeJava; ForgeVer = 'dryrun'; Port = 0; RconPort = $dryRcon.Port; RconPw = 'dry'; ExpectStop = $false; Booted = $true; Restarted = $false; Phase1Logs = $false }
    $dryReq = New-TestRequest
    $dryReq.settleSec = 1
    Invoke-GGServerRestart $ctx $inst $res $dryReq 'GGTEST\|dry\|PHASE1\|DONE&&GGTEST\|other\|DONE'
    $second = $ctx.Proc
    [void]$dryProcs.Add($second)
    Assert-Policy ($first.HasExited -and $first.ExitCode -eq 0) 'the restart stops the server through its console and requires exit code 0'
    Assert-Policy ($second.Id -ne $first.Id -and -not $second.HasExited) 'the restart starts the same command line again as a second process'
    Assert-Policy ($ctx.Booted -and $ctx.Restarted -and $ctx.Phase1Logs -and $null -ne $ctx.Rcon -and $dryRcon.Logins -eq 1) 'after the restart the server has booted, settled and RCON is connected again'
    $kept = @('phase1\logs\latest.log', 'phase1\logs\kubejs\server.log', 'phase1\server-stdout.log') | Where-Object { -not (Test-Path (Join-Path $res $_)) }
    Assert-Policy ($kept.Count -eq 0) ('the first boot''s logs are kept in results\server\phase1 (missing: ' + ($kept -join ', ') + ')')
    Assert-Policy (-not (Test-Path (Join-Path $inst 'logs\kubejs\server.log'))) 'the second boot''s waits never read the first boot''s KubeJS log'
    Assert-Policy ((Read-GGSharedText (Join-Path $res 'server-stdout.log')) -match '@user_jvm_args\.txt .*nogui') 'the second launch uses the server''s own argument line'
    Assert-Policy ([object]::ReferenceEquals($global:GG.NativeBudget, $dryBudget)) 'the restart spends the run''s one budget clock'
    Assert-Policy ($script:DryRamReads -eq 0) 'the restart reads no available-RAM counter before its second launch'
    $logText = @($script:DryLog) -join "`n"
    Assert-Policy ($logText -match 'restart marker hit \[GGTEST\\\|dry\\\|PHASE1\\\|DONE\] \[GGTEST\\\|other\\\|DONE\]' -and $logText -match 'restarted: settled') 'the restart waits for every marker and settles like the first boot'
    # a marker that never comes: bounded by the wait limit, the server left running for the normal shutdown
    $dryReq.waitTimeoutSec = 2
    $clock = [Diagnostics.Stopwatch]::StartNew()
    $missed = $false
    try { Invoke-GGServerRestart $ctx $inst $res $dryReq 'GGTEST\|other\|DONE&&never printed' } catch { $missed = $_.Exception.Message -match '\[never printed\] not seen within 2s' }
    Assert-Policy ($missed -and $clock.Elapsed.TotalSeconds -lt 10 -and -not $second.HasExited -and $ctx.Proc.Id -eq $second.Id) 'a restart marker that never comes fails within its bound and leaves the server to the normal shutdown'
} finally {
    foreach ($p in $dryProcs) {
        if (-not $p.HasExited) {
            try { $p.WriteLine('stop') } catch {}
            if (-not $p.WaitForExit(5000)) { Stop-Process -Id $p.Id -Force -ErrorAction SilentlyContinue }
        }
        $p.CloseLogs()
    }
    if ($ctx -and $ctx.Rcon) { $ctx.Rcon.Dispose() }
    $dryRcon.Dispose()
    $global:GG = $savedDryGG
    Remove-Item function:Write-GGLog
    Remove-Item function:Get-GGFreeRamGb
    Remove-Item -LiteralPath $dryRoot -Recurse -Force
}

[Console]::Out.WriteLine("PASS: $script:Passed local resource-policy checks; no Minecraft or SSH launched")
