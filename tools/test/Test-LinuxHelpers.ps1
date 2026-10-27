# Linux regression checks for the remote runner (pwsh 7 on Linux only). No Minecraft, no SSH, no network.
# Exercises what gg-common.ps1 overrides on Linux, the global lock and named mutexes across processes, the
# gg-linux-run.sh memory sizing, and a whole Run-GGTest.ps1 run that fails early (meta.json, host.json, results.zip).
# CI: .github/workflows/harness.yml. Locally on the VM: pwsh tools/test/Test-LinuxHelpers.ps1
# Env: GG_REQUIRE_JAVA=1 fails (instead of skipping) the JVM checks when no Java 17 is found.
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
if (-not $IsLinux) { Write-Output 'SKIP: Test-LinuxHelpers.ps1 runs on Linux only'; exit 0 }

$remote = [IO.Path]::Combine($PSScriptRoot, 'remote')
$root = [IO.Path]::Combine([IO.Path]::GetTempPath(), 'gg-linux-test-' + [guid]::NewGuid().ToString('N').Substring(0, 8))
[void][IO.Directory]::CreateDirectory($root)
$env:GG_BASE = [IO.Path]::Combine($root, 'base')
. ([IO.Path]::Combine($remote, 'gg-common.ps1'))
$script:Passed = 0
$script:Skipped = @()
function Assert-Linux([bool]$Condition, [string]$Name) {
    if (-not $Condition) { throw "FAIL: $Name" }
    $script:Passed++
}
function Start-Bg([string]$File, [string[]]$Argv) { # exact argv (Start-Process joins an array without quoting)
    $psi = New-Object Diagnostics.ProcessStartInfo($File)
    foreach ($a in $Argv) { $psi.ArgumentList.Add($a) }
    $psi.UseShellExecute = $false
    return [Diagnostics.Process]::Start($psi)
}
function Get-State([int]$ProcessId) { # '' when gone; Z = zombie (dead, not reaped yet)
    try { $s = [IO.File]::ReadAllText("/proc/$ProcessId/stat") } catch { return '' }
    return $s.Substring($s.LastIndexOf(')') + 2, 1)
}

try {
    # ---- environment and paths
    Assert-Linux $global:GGIsLinux 'GGIsLinux is set on Linux pwsh'
    Assert-Linux ($global:GG.ForgeArgsFile -eq 'unix_args.txt') 'Forge uses unix_args.txt (":" classpath) on Linux'
    Assert-Linux ($global:GG.Base -eq $env:GG_BASE) 'GG_BASE is honoured'
    Assert-Linux ([bool]$env:COMPUTERNAME) 'COMPUTERNAME is filled from the machine name'
    Assert-Linux ((Join-Path '/a' 'logs\kubejs\x.log') -eq '/a/logs/kubejs/x.log') 'Join-Path turns \ into /'
    Assert-Linux ((Join-Path '/a' 'b\c' 'd\e') -eq '/a/b/c/d/e') 'Join-Path keeps additional child paths'
    Assert-Linux (@('/x', '/y' | Join-Path -ChildPath 'z\w').Count -eq 2) 'Join-Path takes pipeline input'
    Assert-Linux ($null -eq (Join-Path $root 'nope' -Resolve -ErrorAction SilentlyContinue)) 'Join-Path -Resolve still resolves'

    # ---- trees
    $src = Join-Path $root 'src'
    New-Item -ItemType Directory -Force -Path (Join-Path $src 'sub'), (Join-Path $src 'skip') | Out-Null
    'a' | Set-Content (Join-Path $src 'sub/a.txt'); 'b' | Set-Content (Join-Path $src 'packwiz.json'); 'c' | Set-Content (Join-Path $src 'skip/c.txt')
    $dst = Join-Path $root 'dst'
    Copy-GGTree $src $dst @('skip') @('packwiz.json')
    $copied = @(Get-ChildItem $dst -Recurse -File | ForEach-Object { $_.FullName.Substring($dst.Length + 1) })
    Assert-Linux ($copied.Count -eq 1 -and $copied[0] -eq 'sub/a.txt') "Copy-GGTree copies with dir and file excludes (got: $($copied -join ','))"
    Copy-GGTree $src $dst
    Assert-Linux (Test-Path (Join-Path $dst 'skip/c.txt')) 'Copy-GGTree overwrites into an existing tree'
    Remove-GGTree $dst
    Assert-Linux (-not (Test-Path $dst)) 'Remove-GGTree removes a tree'
    Remove-GGTree $dst

    # ---- host figures
    $ram = Get-GGFreeRamGb
    Assert-Linux ($ram -gt 0) "Get-GGFreeRamGb reads /proc/meminfo ($ram GB)"
    $cg = Get-GGCgroupMemory
    Assert-Linux ($cg.cgroup -like '/*') "Get-GGCgroupMemory finds this process's cgroup ($($cg.cgroup))"
    $drive = New-Object IO.DriveInfo([IO.Path]::GetPathRoot([IO.Path]::GetFullPath($global:GG.Base)))
    Assert-Linux ($drive.AvailableFreeSpace -gt 0) 'the lock stage can read free disk space of the base'

    # ---- process trees: Stop-GGTree kills a parent and its children
    $p = Start-Bg 'bash' @('-c', 'sleep 300 & sleep 300 & wait')
    $kids = @()
    for ($i = 0; $i -lt 50 -and $kids.Count -lt 2; $i++) {
        Start-Sleep -Milliseconds 100
        $kids = @([IO.Directory]::GetDirectories('/proc') | ForEach-Object { [IO.Path]::GetFileName($_) } | Where-Object { $_ -match '^\d+$' } | Where-Object {
                try { $s = [IO.File]::ReadAllText("/proc/$_/stat"); [int]$s.Substring($s.LastIndexOf(')') + 2).Split(' ')[1] -eq $p.Id } catch { $false } })
    }
    Assert-Linux ($kids.Count -eq 2) "test tree started (2 children, got $($kids.Count))"
    Stop-GGTree $p.Id
    [void]$p.WaitForExit(5000)
    Start-Sleep -Milliseconds 300
    $alive = @($kids | Where-Object { (Get-State $_) -notin @('', 'Z') })
    Assert-Linux ($p.HasExited -and $alive.Count -eq 0) 'Stop-GGTree kills the whole tree'

    # ---- named mutexes are shared between processes (Invoke-GGExclusive, the global harness lock)
    $holder = Start-Bg 'pwsh' @('-NoProfile', '-NonInteractive', '-Command',
        ('$m = New-Object Threading.Mutex($false, ''Global\GGHarness-linux-test''); [void]$m.WaitOne(); [IO.File]::WriteAllText(''{0}'', ''held''); Start-Sleep 4; $m.ReleaseMutex()' -f (Join-Path $root 'held')))
    for ($i = 0; $i -lt 100 -and -not (Test-Path (Join-Path $root 'held')); $i++) { Start-Sleep -Milliseconds 100 }
    $m = New-Object Threading.Mutex($false, 'Global\GGHarness-linux-test')
    Assert-Linux (-not $m.WaitOne(0)) 'a named mutex held by another process is busy'
    Assert-Linux ($m.WaitOne(15000)) 'it is acquired once the other process releases it'
    $m.ReleaseMutex(); $m.Dispose()
    [void]$holder.WaitForExit(5000)
    Assert-Linux ((Invoke-GGExclusive 'linux-test' { 'inside' }) -eq 'inside') 'Invoke-GGExclusive runs its body'

    $global:GG.Runs = Join-Path $root 'runs'
    $global:GG.RunId = 'linux-test'
    $global:GG.RunDir = Join-Path $global:GG.Runs 'linux-test'
    $global:GG.LockPath = Join-Path $global:GG.Runs '.lock'
    [void][IO.Directory]::CreateDirectory($global:GG.RunDir)
    $commonPath = (Join-Path $remote 'gg-common.ps1').Replace("'", "''")
    $probe = "`$ProgressPreference='SilentlyContinue'; `$env:GG_BASE='$($env:GG_BASE)'; . '$commonPath'; if (Try-GGNativeMutex) { Exit-GGNativeMutex; 'ACQUIRED' } else { 'BUSY' }"
    Enter-GGLock -MaxWaitMin 1
    Assert-Linux ($global:GG.HasLock -and (Test-Path $global:GG.LockPath)) 'Enter-GGLock takes the harness lock'
    $other = & pwsh -NoProfile -NonInteractive -Command $probe
    Assert-Linux ("$other" -eq 'BUSY') 'another process cannot take the harness mutex while it is held'
    Exit-GGLock
    $other = & pwsh -NoProfile -NonInteractive -Command $probe
    Assert-Linux ("$other" -eq 'ACQUIRED') 'Exit-GGLock releases the harness mutex'

    # ---- slots: with -Slots 2 a second runner takes slot 1 while slot 0 is held; a third one times out
    Enter-GGLock -MaxWaitMin 1 -Slots 2
    Assert-Linux ($global:GG.HasLock -and $global:GG.Slot -eq 0 -and $global:GG.NativeMutexIndex -eq 0) 'Slots=2: the first runner takes slot 0'
    $slotChild = { param([string]$Id, [int]$HoldSec)
        "`$ProgressPreference='SilentlyContinue'; `$env:GG_BASE='$($env:GG_BASE)'; . '$commonPath'; " +
        "`$global:GG.Runs='$($global:GG.Runs)'; `$global:GG.RunId='$Id'; `$global:GG.RunDir=Join-Path `$global:GG.Runs '$Id'; " +
        "`$global:GG.LockPath=Join-Path `$global:GG.Runs '.lock'; [void][IO.Directory]::CreateDirectory(`$global:GG.RunDir); " +
        "try { Enter-GGLock -MaxWaitMin 0 -Slots 2; [Console]::Out.WriteLine('SLOT|' + `$global:GG.Slot); Start-Sleep -Seconds $HoldSec; Exit-GGLock } " +
        "catch { [Console]::Out.WriteLine('NOSLOT|' + `$_.Exception.Message) }" }
    $second = Start-Bg 'pwsh' @('-NoProfile', '-NonInteractive', '-Command', (& $slotChild 'linux-test-b' 20))
    $slotFile = Join-Path $global:GG.Runs '.lock.1'
    for ($i = 0; $i -lt 150 -and -not (Test-Path $slotFile); $i++) { Start-Sleep -Milliseconds 100 }
    Assert-Linux (Test-Path $slotFile) 'Slots=2: a second runner holds slot 1 at the same time'
    $third = @(& pwsh -NoProfile -NonInteractive -Command (& $slotChild 'linux-test-c' 0))
    Assert-Linux ("$third" -match 'NOSLOT\|.*all 2 slot\(s\) busy') "Slots=2: a third runner finds every slot busy ($third)"
    Exit-GGLock
    $second.Kill(); [void]$second.WaitForExit(10000)
    Remove-Item -LiteralPath $slotFile -Force -ErrorAction SilentlyContinue
    # ---- JVMs: Get-GGManagedProcesses sees a run's java, Stop-GGRunProcesses kills only that run's
    $java = $null
    try { $java = Get-GGJava17 } catch {}
    if ($java) {
        Assert-Linux (Test-Path $java) "Get-GGJava17 finds $java"
        $javaSrc = Join-Path $root 'Sleep.java'
        [IO.File]::WriteAllText($javaSrc, 'public class Sleep { public static void main(String[] a) throws Exception { Thread.sleep(120000); } }')
        $jvm = Start-Bg $java @('-Dgg.run=linux-orphan-run', $javaSrc)
        $seen = $null
        for ($i = 0; $i -lt 100 -and -not $seen; $i++) {
            Start-Sleep -Milliseconds 100
            $seen = @(Get-GGManagedProcesses | Where-Object { $_.ProcessId -eq $jvm.Id })[0]
        }
        Assert-Linux ($seen -and $seen.CommandLine -match '-Dgg\.run=linux-orphan-run') 'Get-GGManagedProcesses lists a java with its command line'
        Assert-Linux ((Get-GGRunIdOfCommandLine $seen.CommandLine) -eq 'linux-orphan-run') 'the run id is read from the command line'
        Assert-Linux ((Stop-GGRunProcesses 'some-other-run') -eq 0 -and -not $jvm.HasExited) 'another run''s JVM is never killed'
        Assert-Linux ((Stop-GGRunProcesses 'linux-orphan-run') -eq 1) 'Stop-GGRunProcesses kills the run''s JVM'
        Assert-Linux ($jvm.WaitForExit(10000)) 'the JVM is gone'
        $rx = Get-GGBaseRegex
        Assert-Linux ("java -jar $($global:GG.Base)/cache/forge-installers/x.jar" -match $rx -and '/home/me/.minecraft/x.jar' -notmatch $rx) 'the base regex matches our dirs only'
        $out = Join-Path $root 'tool'
        $code = Invoke-GGTool '/bin/sh' "-c `"echo tool-ran; exit 4`"" $root $out 30 $null 'sh'
        Assert-Linux ($code -eq 4 -and (Get-Content "$out.out.log" -Raw) -match 'tool-ran') 'Invoke-GGTool (GGProc) runs a native tool with logs and exit code'
    } elseif ($env:GG_REQUIRE_JAVA -eq '1') {
        throw 'FAIL: no Java 17 found (GG_REQUIRE_JAVA=1)'
    } else { $script:Skipped += 'JVM checks (no Java 17)' }

    # ---- gg-linux-run.sh: memory sizing and exit code, with a stub runner
    $stubDir = Join-Path $root 'base/tools/remote/stub'
    New-Item -ItemType Directory -Force -Path $stubDir | Out-Null
    Copy-Item (Join-Path $remote 'gg-linux-run.sh') $stubDir
    Set-Content (Join-Path $stubDir 'Run-GGTest.ps1') 'param($RunId) [Console]::Out.WriteLine("STUB|$RunId|$env:GG_BASE"); exit 3'
    $benv = Join-Path $root 'bench.env'
    Set-Content $benv "GG_BENCH_MEMORY_MAX=1234M`nGG_BENCH_MEMORY_SWAP_MAX=1G"
    $sh = Join-Path $stubDir 'gg-linux-run.sh'
    $o = @(& env -u GG_BASE -u GG_MEMORY_MAX GG_NO_SCOPE=1 "GG_BENCH_ENV=$benv" bash $sh 'stub-run' 2>&1)
    Assert-Linux ($LASTEXITCODE -eq 3) "gg-linux-run.sh returns the runner's exit code (got $LASTEXITCODE)"
    Assert-Linux (($o -join "`n") -match "STUB\|stub-run\|$([regex]::Escape((Join-Path $root 'base')))") 'GG_BASE defaults to three levels above the script'
    Assert-Linux (($o -join "`n") -match 'GGSCOPE\|none\|MemoryMax=1234M') "bench.env sizes the scope ($($o[0]))"
    $o = @(& env -u GG_BASE GG_NO_SCOPE=1 "GG_BENCH_ENV=$benv" GG_MEMORY_MAX=999M bash $sh 'stub-run' 2>&1)
    Assert-Linux (($o -join "`n") -match 'MemoryMax=999M') 'a caller GG_MEMORY_MAX overrides bench.env'
    $o = @(& env -u GG_BASE -u GG_MEMORY_MAX GG_NO_SCOPE=1 GG_BENCH_ENV=/nonexistent GG_BENCH_RESERVE_MB=1000 GG_BENCH_RUN_MAX_MB=999999 bash $sh 'stub-run' 2>&1)
    $totalMb = [int]([regex]::Match([IO.File]::ReadAllText('/proc/meminfo'), 'MemTotal:\s+(\d+)').Groups[1].Value) / 1024
    Assert-Linux (($o -join "`n") -match ("MemoryMax={0}M" -f ([math]::Floor($totalMb) - 1000))) "without bench.env the ceiling is RAM minus the reserve ($($o[0]))"
    $o = @(& env -u GG_BASE -u GG_MEMORY_MAX GG_NO_SCOPE=1 GG_BENCH_ENV=/nonexistent GG_BENCH_RESERVE_MB=1000 GG_BENCH_RUN_MAX_MB=1500 bash $sh 'stub-run' 2>&1)
    Assert-Linux (($o -join "`n") -match 'MemoryMax=1500M') "the per-run cap bounds the ceiling on a large host ($($o[0]))"
    $o = @(& env -u GG_BASE -u GG_MEMORY_MAX GG_NO_SCOPE=1 GG_BENCH_ENV=/nonexistent GG_BENCH_RESERVE_MB=1000 GG_BENCH_RUN_MAX_MB=999999 GG_SLOTS=2 bash $sh 'stub-run' 2>&1)
    Assert-Linux (($o -join "`n") -match ("MemoryMax={0}M" -f [math]::Floor(([math]::Floor($totalMb) - 1000) / 2))) "GG_SLOTS=2 halves the ceiling ($($o[0]))"

    # ---- a whole Run-GGTest.ps1 run that fails at extract: still meta.json, host.json, results.zip and GGRESULT
    $o = @(& env "GG_BASE=$($env:GG_BASE)" pwsh -NoProfile -NonInteractive -File (Join-Path $remote 'Run-GGTest.ps1') -RunId 'linux-missing-zip' 2>&1)
    $code = $LASTEXITCODE
    Assert-Linux ($code -eq 1 -and ($o -join "`n") -match 'GGRESULT\|linux-missing-zip\|FAIL') "Run-GGTest reports FAIL for a missing upload (exit $code)"
    $res = Join-Path $env:GG_BASE 'runs/linux-missing-zip/results'
    $meta = Get-Content (Join-Path $res 'meta.json') -Raw | ConvertFrom-Json
    Assert-Linux ($meta.os -eq 'linux' -and $meta.overall -eq 'FAIL' -and $meta.host) 'meta.json records os and host'
    $hostJson = Get-Content (Join-Path $res 'host.json') -Raw | ConvertFrom-Json
    Assert-Linux ($hostJson.cpus -gt 0 -and $hostJson.kernel -and $hostJson.cgroupMemory) 'host.json records the kernel, CPUs and cgroup memory'
    $stages = @(Get-Content (Join-Path $res 'stages.json') -Raw | ConvertFrom-Json)
    Assert-Linux (@($stages | Where-Object { $_.name -eq 'extract' -and $_.status -eq 'FAIL' }).Count -eq 1) 'the extract stage failed as expected'
    Assert-Linux (Test-Path (Join-Path $env:GG_BASE 'runs/linux-missing-zip/results.zip')) 'results.zip is built'

    # ---- shell scripts parse
    foreach ($f in @(Get-ChildItem (Join-Path $PSScriptRoot '../vm') -Filter *.sh) + @(Get-ChildItem $remote -Filter *.sh)) {
        & bash -n $f.FullName
        Assert-Linux ($LASTEXITCODE -eq 0) "bash -n $($f.Name)"
    }
} finally {
    try { Exit-GGLock } catch {}
    Remove-Item -LiteralPath $root -Recurse -Force -ErrorAction SilentlyContinue
}
$skip = $(if ($script:Skipped.Count) { '; skipped: ' + ($script:Skipped -join ', ') } else { '' })
Write-Output "PASS: $($script:Passed) Linux runner checks; no Minecraft or SSH launched$skip"
exit 0
