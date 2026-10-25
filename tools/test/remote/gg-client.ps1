# gg-client.ps1 - client suite: HeadlessMC + mc-runtime-test join a singleplayer world of the packwiz client pack.
. (Join-Path $PSScriptRoot 'gg-common.ps1')
. (Join-Path $PSScriptRoot 'gg-tools.ps1')
. (Join-Path $PSScriptRoot 'gg-collect.ps1')
. (Join-Path $PSScriptRoot 'gg-server.ps1')

# HeadlessMC (RC5) forces its LWJGL stub whenever --offline is used and the last-used account is an "offline" one
# ("You are offline without the game, forcing headless mode"). A fake last-used account of another provider (never
# authenticated: the game just logs a 401 and carries on offline) keeps the real LWJGL, which is what Mesa needs.
function Set-GGHmcRealAccount {
    param([string]$HmcHome)
    $utf8 = New-Object Text.UTF8Encoding($false)
    $acc = '{"accounts":{"GGTest":{"provider":"ggtest","name":"GGTest","uuid":"22689332a7fd41919600b0fe1135ee34","token":"ggtest-token","type":"msa","xuid":""}},"version":0}'
    $last = '{"accounts":{"latest":[{"provider":"offline","name":"GGTest"}]},"version":0}'
    foreach ($e in @(@('offline', $acc), @('last', $last))) {
        $dir = [IO.Path]::Combine($HmcHome, '.auth', $e[0])
        [void][IO.Directory]::CreateDirectory($dir)
        [IO.File]::WriteAllText([IO.Path]::Combine($dir, '.accounts.json'), $e[1], $utf8)
    }
}

# Session 0 (ssh) has no monitor, and Forge's early display window aborts without one ("Failed to find a primary
# monitor"). Turn it off for the test client only (patches the pack's fml.toml when it ships one).
function Set-GGEarlyWindowOff {
    param([string]$Instance)
    $cfgDir = Join-Path $Instance 'config'
    [void][IO.Directory]::CreateDirectory($cfgDir)
    $path = Join-Path $cfgDir 'fml.toml'
    $utf8 = New-Object Text.UTF8Encoding($false)
    $text = ''
    if ([IO.File]::Exists($path)) { $text = [IO.File]::ReadAllText($path) }
    if ($text -match '(?m)^\s*earlyWindowControl\s*=') {
        $text = [regex]::Replace($text, '(?m)^(\s*earlyWindowControl\s*=).*$', '$1 false')
    } else {
        $text = "earlyWindowControl = false`n" + $text
    }
    [IO.File]::WriteAllText($path, $text, $utf8)
}

# HeadlessMC launcher + mc-runtime-test jar (cached in tools\) and the HMC config/home dir (one per renderer).
# Renderer 'mesa' = real LWJGL on Mesa llvmpipe (private JDK copy, see Ensure-GGMesa); 'stub' = HeadlessMC's -lwjgl stub.
# Slot 0 keeps the historical dirs (hmc\home-<renderer>, hmc\.minecraft); every other slot has its own copy under
# hmc\slot<N>\, so two clients running at once never share (or rewrite) HeadlessMC's config or its game directory.
function Ensure-GGHmc {
    param([string]$Mc, [string]$Renderer = 'mesa')
    $exe = Join-Path $global:GG.Tools 'headlessmc-launcher-windows-x64.exe'
    $mcrtName = "mc-runtime-test-$Mc-forge-5.0.1.jar"
    $mcrt = Join-Path $global:GG.Tools $mcrtName
    $url = "https://github.com/headlesshq/mc-runtime-test-mod/releases/download/$Mc-5.0.1/$mcrtName"
    $dl = [bool](Invoke-GGExclusive 'tools' {
            $n1 = Get-GGFile $global:GGUrls.HmcExe $exe 50000000
            $n2 = Get-GGFile $url $mcrt 100000
            ($n1 -or $n2)
        })
    $hmcRoot = $global:GG.Hmc
    $slot = [math]::Max(0, [int]$global:GG.Slot)
    if ($slot -gt 0) { $hmcRoot = Join-Path $global:GG.Hmc ('slot{0}' -f $slot) }
    $hmcHome = Join-Path $hmcRoot "home-$Renderer"
    $mcDir = Join-Path $hmcRoot '.minecraft'
    New-Item -ItemType Directory -Force -Path $hmcHome | Out-Null
    New-Item -ItemType Directory -Force -Path $mcDir | Out-Null
    $mesa = $null
    if ($Renderer -eq 'mesa') {
        $mesa = Ensure-GGMesa
        $javaHome = $mesa.JavaHome.Replace('\', '/')
    } else {
        $javaHome = (Split-Path -Parent (Split-Path -Parent (Get-GGJava17))).Replace('\', '/')
    }
    $cfg = @(
        "hmc.java.versions=$javaHome",
        "hmc.files.mc=$($mcDir.Replace('\', '/'))",
        'hmc.jline.enabled=false',
        'hmc.launcher.crash-report-watcher=true',
        'hmc.assets.dummy=true'
    )
    $cfgPath = Join-Path $hmcHome 'config.properties'
    $want = ($cfg -join "`r`n") + "`r`n"
    $have = ''
    if (Test-Path -LiteralPath $cfgPath) { $have = [IO.File]::ReadAllText($cfgPath) }
    if ($have -ne $want) { [IO.File]::WriteAllText($cfgPath, $want, (New-Object Text.UTF8Encoding($false))) }
    if ($Renderer -eq 'mesa') { Set-GGHmcRealAccount $hmcHome }
    if ($mesa -and -not $mesa.Cached) { $dl = $true }
    return @{ Exe = $exe; McRuntimeTest = $mcrt; Home = $hmcHome; McDir = $mcDir; Downloaded = $dl; Mesa = $mesa }
}

# options.txt: keep what the pack ships, force the keys that would block or slow down a headless run.
# The client runs on the user's own PC: every sound category is muted (he hears it otherwise).
function Set-GGClientOptions {
    param([string]$Path, [string]$Renderer = 'mesa')
    $want = [ordered]@{ 'onboardAccessibility' = 'false'; 'pauseOnLostFocus' = 'false' }
    foreach ($cat in 'master', 'music', 'record', 'weather', 'block', 'hostile', 'neutral', 'player', 'ambient', 'voice') {
        $want["soundCategory_$cat"] = '0.0'
    }
    if ($Renderer -eq 'mesa') {
        # software rendering: keep the frame cost low (the test only needs the world to load)
        $want['renderDistance'] = '4'
        $want['simulationDistance'] = '5'
        $want['maxFps'] = '30'
        $want['enableVsync'] = 'false'
    }
    $lines = @()
    if (Test-Path $Path) { $lines = @([IO.File]::ReadAllLines($Path)) }
    foreach ($k in $want.Keys) {
        $found = $false
        for ($i = 0; $i -lt $lines.Count; $i++) {
            if ($lines[$i] -match ('^' + [regex]::Escape($k) + ':')) { $lines[$i] = "${k}:$($want[$k])"; $found = $true }
        }
        if (-not $found) { $lines += "${k}:$($want[$k])" }
    }
    [IO.File]::WriteAllLines($Path, [string[]]$lines, (New-Object Text.UTF8Encoding($false)))
}

# Proof that the game JVM really loaded Mesa's OpenGL (not the system driver, not HeadlessMC's stub).
function Get-GGMesaProof {
    param([string]$Instance)
    try {
        $rx = [regex]::Escape($Instance)
        foreach ($p in @(Get-CimInstance Win32_Process -Filter "Name='java.exe'" -ErrorAction Stop)) {
            if (-not $p.CommandLine -or $p.CommandLine -notmatch $rx) { continue }
            $proc = [Diagnostics.Process]::GetProcessById([int]$p.ProcessId)
            $mods = @($proc.Modules | Where-Object { $_.ModuleName -match '^(opengl32|libgallium_wgl)\.dll$' } | ForEach-Object { $_.FileName })
            if ($mods.Count -gt 0) { return ('pid {0}: {1}' -f $p.ProcessId, ($mods -join ', ')) }
        }
    } catch { }
    return $null
}

# On a client timeout: thread dump + live Screen classes of the game JVM, to see what the test is waiting for
# (a blocking confirm screen, a stuck world load, ...). Best effort; returns a short summary for the failure message.
function Save-GGClientHangDiagnostics {
    param([string]$Instance, [string]$ResultsDir)
    try {
        $rx = [regex]::Escape($Instance)
        $jvm = @(Get-CimInstance Win32_Process -Filter "Name='java.exe'" | Where-Object { $_.CommandLine -and $_.CommandLine -match $rx }) | Select-Object -First 1
        if (-not $jvm) { return '' }
        $bin = Split-Path -Parent (Get-GGJava17)
        $files = @{}
        foreach ($t in @(@('jstack', "$($jvm.ProcessId)"), @('jcmd', "$($jvm.ProcessId) GC.class_histogram"))) {
            $exe = Join-Path $bin ($t[0] + '.exe')
            if (-not (Test-Path $exe)) { continue }
            $out = Join-Path $ResultsDir ("hang-{0}.txt" -f $t[0])
            $p = [GGProc]::Start($exe, $t[1], $ResultsDir, $out, "$out.err", $null)
            if (-not $p.WaitForExit(30000)) { Stop-GGTree $p.Id }
            $p.CloseLogs()
            $files[$t[0]] = $out
        }
        $parts = @()
        if ($files['jstack'] -and (Test-Path $files['jstack'])) {
            $dump = [IO.File]::ReadAllText($files['jstack'])
            $server = if ($dump -match '(?m)^"Server thread"') { 'present' } else { 'absent' }
            $render = ''
            if ($dump -match '(?ms)^"Render thread".*?\r?\n\s+at ([^\r\n]+)') { $render = $Matches[1] }
            $parts += "Server thread $server"
            if ($render) { $parts += "Render thread top frame: $render" }
        }
        if ($files['jcmd'] -and (Test-Path $files['jcmd'])) {
            $screens = New-Object System.Collections.ArrayList
            foreach ($l in [IO.File]::ReadAllLines($files['jcmd'])) {
                if ($l -match '^\s*\d+:\s+(\d+)\s+\d+\s+(net\.minecraft\.client\.gui\.screens\.[\w.]*?(\w+Screen))\s' -and $l -notmatch 'Lambda') { [void]$screens.Add(("{0} x{1}" -f $Matches[3], $Matches[1])) }
            }
            if ($screens.Count -gt 0) { $parts += ('live Screen instances: ' + ((@($screens) | Select-Object -First 10) -join ', ')) }
        }
        if ($parts.Count -eq 0) { return '' }
        return ('. Hang diagnostics: ' + ($parts -join '; ') + ' (hang-jstack.txt / hang-jcmd.txt)')
    } catch { return '' }
}

function Get-GGClientFailureHint {
    param([string]$StdoutLog, [string]$Instance)
    $crash = Join-Path $Instance 'crash-reports'
    if (Test-Path $crash) {
        # HeadlessMC kills the game as soon as a crash report appears, so the report can be empty/truncated
        $reports = @(Get-ChildItem $crash -File -ErrorAction SilentlyContinue | Where-Object { $_.Length -gt 0 } | Sort-Object LastWriteTime -Descending)
        if ($reports.Count -gt 0) { return ('crash report {0}: {1}' -f $reports[0].Name, (Get-GGCrashHint $reports[0].FullName)) }
    }
    $tail = @(Get-Content -LiteralPath $StdoutLog -Tail 4000 -ErrorAction SilentlyContinue)
    # the offline test account always logs auth/profile-key/Realms failures; they are not the cause of anything
    $noise = 'InvalidCredentialsException|MinecraftClientHttpException|profile key pair|SignedJWT|Realms|authlib'
    $fatal = @($tail | Where-Object { $_ -match '/FATAL\]' -and $_ -notmatch $noise } | Select-Object -Last 2 | ForEach-Object { ($_ -replace '^\[[^\]]*\]\s*', '').Trim() })
    $exc = @($tail | Where-Object { $_ -match '^[a-z][\w.]*\.[A-Z]\w*(Exception|Error)\b' -and $_ -notmatch $noise } | Select-Object -Last 2 | ForEach-Object { $_.Trim() })
    $caused = @($tail | ForEach-Object { if ($_ -match 'Caused by: (.+)$' -and $_ -notmatch $noise) { $Matches[1].Trim() } } | Select-Object -Last 2)
    if ($fatal.Count -gt 0 -or $exc.Count -gt 0 -or $caused.Count -gt 0) {
        $parts = @()
        if ($fatal.Count -gt 0) { $parts += ('FATAL: ' + ($fatal -join ' / ')) }
        if ($exc.Count -gt 0) { $parts += ('exception: ' + ($exc -join ' / ')) }
        if ($caused.Count -gt 0) { $parts += ('root cause: ' + ($caused -join ' / ')) }
        return ($parts -join ' | ')
    }
    return ('last output: ' + ((@($tail | Select-Object -Last 8) | ForEach-Object { $_.Trim() }) -join ' / '))
}

function Invoke-GGClientSuite {
    param($Req, [string]$PackToml, $PackInfo, [string]$PackKey)

    $res = Join-Path $global:GG.ResultsDir 'client'
    $inst = Join-Path $global:GG.RunDir 'client'
    $overlay = Join-Path $global:GG.RunDir 'overlay'
    New-Item -ItemType Directory -Force -Path $res | Out-Null
    $timeout = [int]$Req.clientTimeoutSec
    $renderer = [string]$Req.clientRenderer
    if ($renderer -ne 'stub') { $renderer = 'mesa' }
    $ctx = @{ Proc = $null; Hmc = $null }

    try {
        $ok = Invoke-GGStage 'client-tools' {
            $ctx.Hmc = Ensure-GGHmc $PackInfo.mc $renderer
            [void](Ensure-GGInstaller)
            $how = 'cached'
            if ($ctx.Hmc.Downloaded) { $how = 'downloaded/built' }
            $gl = 'HeadlessMC -lwjgl stub (no real OpenGL)'
            if ($renderer -eq 'mesa') { $gl = 'real LWJGL on Mesa {0} llvmpipe (software OpenGL)' -f $ctx.Hmc.Mesa.Version }
            Set-GGStage 'PASS' ("HeadlessMC 3.0.0-RC5 + mc-runtime-test, {0} ({1})" -f $gl, $how)
        }

        if ($ok) {
            $ok = Invoke-GGStage 'sync-client' {
                Remove-GGTree $inst
                New-Item -ItemType Directory -Force -Path $inst | Out-Null
                # the sync dir is shared by every run of this pack: one run at a time may update it and copy from it
                Invoke-GGExclusive "sync-$PackKey-client" {
                    $sync = Sync-GGPack 'client' $PackToml $PackKey $res
                    Copy-GGTree $sync $inst @() @('packwiz.json')
                }
                $n = @(Get-ChildItem (Join-Path $inst 'mods') -Filter *.jar -File -ErrorAction SilentlyContinue).Count
                $mb = Get-GGDirSizeMB (Join-Path $inst 'mods')
                Set-GGStage 'PASS' ("{0} mod jars, {1} MB" -f $n, $mb)
            }
        }

        if ($ok) {
            $ok = Invoke-GGStage 'overlay-client' {
                $rel = @(Add-GGOverlay $overlay $inst)
                [IO.File]::WriteAllLines((Join-Path $res 'overlay-files.txt'), [string[]]$rel)
                # optional test-only removal of mods (-ClientExclude); the default keeps the real client mod set
                $excluded = @()
                $patterns = @(Get-GGList $Req.clientExclude)
                foreach ($jar in [IO.Directory]::GetFiles((Join-Path $inst 'mods'), '*.jar')) {
                    $name = [IO.Path]::GetFileName($jar)
                    foreach ($rx in $patterns) {
                        if ([regex]::IsMatch($name, $rx, [Text.RegularExpressions.RegexOptions]::IgnoreCase)) { [IO.File]::Delete($jar); $excluded += $name; break }
                    }
                }
                [IO.File]::WriteAllLines((Join-Path $res 'client-excluded-mods.txt'), [string[]]$excluded)
                Copy-Item -LiteralPath $ctx.Hmc.McRuntimeTest -Destination (Join-Path $inst 'mods') -Force
                Copy-Item -LiteralPath $PackToml -Destination (Join-Path $inst 'pack.toml') -Force
                Remove-GGTree (Join-Path $inst 'saves')
                Set-GGClientOptions (Join-Path $inst 'options.txt') $renderer
                if ($renderer -eq 'mesa') { Set-GGEarlyWindowOff $inst }
                $exTxt = ''
                if ($excluded.Count -gt 0) { $exTxt = '; EXCLUDED from the test client: ' + ($excluded -join ', ') }
                Set-GGStage 'PASS' ("{0} overlay file(s) + mc-runtime-test.jar{1}" -f $rel.Count, $exTxt)
            }
        }

        if ($ok) {
            $ok = Invoke-GGStage 'client-launch' {
                $freeGb = Get-GGFreeRamGb
                if ($freeGb -lt [math]::Max(8, [double]$Req.slotMinFreeGb)) { throw "Insufficient available RAM before client launch: $freeGb GB" }
                if (-not $global:GG.NativeBudget) { $global:GG.NativeBudget = @{ Clock = [Diagnostics.Stopwatch]::StartNew(); TimeoutSec = [int]$Req.nativeTimeoutSec } }
                [void](Get-GGNativeTimeoutMs $global:GG.NativeBudget 1)
                $lw = ''
                if ($renderer -eq 'stub') { $lw = '-lwjgl ' }
                $argLine = "launch --offline $($lw)--packwiz `"$inst`" client --jvm `"-Xms$($Req.clientXms) -Xmx$($Req.clientXmx) -Djava.awt.headless=true -DMcRuntimeGameTest=false`""
                $envs = @("HMC_FILES_LOCATION=$($ctx.Hmc.Home)")
                if ($renderer -eq 'mesa') {
                    # software OpenGL; llvmpipe threads are capped so the PC stays usable for its owner
                    $envs += 'GALLIUM_DRIVER=llvmpipe'
                    $envs += "LP_NUM_THREADS=$([math]::Max(2, [math]::Min(6, [int]([Environment]::ProcessorCount / 3))))"
                }
                $g = [GGProc]::Start($ctx.Hmc.Exe, $argLine, $inst, (Join-Path $res 'client-hmc-stdout.log'), (Join-Path $res 'client-hmc-stderr.log'), $envs)
                $ctx.Proc = $g
                Set-GGSlotState $null $true
                Write-GGLog "HeadlessMC started (pid $($g.Id), renderer $renderer), free RAM $freeGb GB; first run installs the Forge client (slow)"
                $sw = [Diagnostics.Stopwatch]::StartNew()
                $lastPrint = 0
                $lastProbe = -100
                $glProof = $null
                $tailOut = New-Object GGTail (Join-Path $res 'client-hmc-stdout.log')
                $tailLog = New-Object GGTail (Join-Path $inst 'logs\latest.log')
                $last = ''
                while (-not $g.WaitForExit((Get-GGNativeTimeoutMs $global:GG.NativeBudget 2000))) {
                    foreach ($l in $tailLog.ReadNew()) { $last = $l }
                    foreach ($l in $tailOut.ReadNew()) { if (-not $last) { $last = $l } }
                    if ($renderer -eq 'mesa' -and -not $glProof -and ($sw.Elapsed.TotalSeconds - $lastProbe) -ge 10) {
                        $lastProbe = $sw.Elapsed.TotalSeconds
                        $glProof = Get-GGMesaProof $inst
                        if ($glProof) { Write-GGLog "Mesa OpenGL is loaded by the game JVM ($glProof)" }
                    }
                    if ($sw.Elapsed.TotalSeconds -gt $timeout) {
                        Stop-GGTree $g.Id
                        [void]$g.WaitForExit(15000)
                        throw ("client timed out after {0}s; last line: {1}; live diagnostics skipped to stop promptly" -f $timeout, $last)
                    }
                    if ($sw.Elapsed.TotalSeconds - $lastPrint -ge 30) {
                        $lastPrint = $sw.Elapsed.TotalSeconds
                        $show = $last
                        if ($show.Length -gt 150) { $show = $show.Substring(0, 150) }
                        Write-GGLog ("  client {0}s | {1}" -f [int]$sw.Elapsed.TotalSeconds, $show)
                    }
                    Update-GGLock
                }
                $code = $g.ExitCode
                $g.CloseLogs()
                $ctx.Proc = $null
                $stdout = Read-GGSharedText (Join-Path $res 'client-hmc-stdout.log')
                $gameLog = Read-GGSharedText (Join-Path $inst 'logs\latest.log')
                $finished = ($stdout -match 'Successfully finished\.') -or ($gameLog -match 'Successfully finished\.')
                $crashDir = Join-Path $inst 'crash-reports'
                $crashes = @()
                if (Test-Path $crashDir) { $crashes = @(Get-ChildItem $crashDir -File | ForEach-Object { $_.Name }) }
                if ($code -ne 0) {
                    $hint = Get-GGClientFailureHint (Join-Path $res 'client-hmc-stdout.log') $inst
                    throw ("client exited with code {0} after {1}s. {2}" -f $code, [int]$sw.Elapsed.TotalSeconds, $hint)
                }
                if ($crashes.Count -gt 0) { throw ("client exited 0 but crash reports exist: {0}" -f ($crashes -join ', ')) }
                if (-not $finished) { throw ("client exited 0 after {0}s but 'Successfully finished.' was not logged" -f [int]$sw.Elapsed.TotalSeconds) }
                $proofTxt = ''
                $st = 'PASS'
                if ($renderer -eq 'mesa') {
                    if ($glProof) { $proofTxt = ', Mesa llvmpipe GL confirmed' } else { $proofTxt = ', Mesa GL module not observed in the game JVM'; $st = 'WARN' }
                }
                Set-GGStage $st ("exit 0, 'Successfully finished.' logged, no crash reports ({0}s{1})" -f [int]$sw.Elapsed.TotalSeconds, $proofTxt)
            }
        }
    } finally {
        if ($ctx.Proc) {
            if (-not $ctx.Proc.HasExited) { Stop-GGTree $ctx.Proc.Id; [void]$ctx.Proc.WaitForExit(15000) }
            $ctx.Proc.CloseLogs()
        }
        # the game may outlive HeadlessMC; make sure nothing of THIS run is left running (never another run's JVM)
        [void](Stop-GGRunProcesses $global:GG.RunId)
        Set-GGSlotState $null $false
        if (Test-Path (Join-Path $inst 'logs\kubejs')) { [void](Invoke-GGStage 'client-kubejs' { Invoke-GGKubeJsCheck $inst $res }) }
        Save-GGInstanceResults $inst $res
    }
}
