# gg-tools.ps1 - tooling, Forge install cache, packwiz sync and overlay (runs on the home test PC).
. (Join-Path $PSScriptRoot 'gg-common.ps1')

$global:GGUrls = @{
    Installer     = 'https://github.com/packwiz/packwiz-installer/releases/download/v0.5.14/packwiz-installer.jar'
    Bootstrap     = 'https://github.com/packwiz/packwiz-installer-bootstrap/releases/download/v0.0.3/packwiz-installer-bootstrap.jar'
    HmcExe        = 'https://github.com/headlesshq/headlessmc/releases/download/3.0.0-RC5/headlessmc-launcher-windows-x64.exe'
    HmcJar        = 'https://github.com/headlesshq/headlessmc/releases/download/3.0.0-RC5/headlessmc.jar'
    McRuntimeTest = 'https://github.com/headlesshq/mc-runtime-test-mod/releases/download/1.20.1-5.0.1/mc-runtime-test-1.20.1-forge-5.0.1.jar'
    ForgeMaven    = 'https://maven.minecraftforge.net/net/minecraftforge/forge'
    MesaVersion   = '26.2.4'
    Mesa          = 'https://github.com/pal1000/mesa-dist-win/releases/download/26.2.4/mesa3d-26.2.4-release-msvc.7z'
}

function Initialize-GGDirs {
    foreach ($d in @($global:GG.Base, $global:GG.Tools, $global:GG.Cache, $global:GG.Sync, $global:GG.Hmc, $global:GG.Runs, $global:GG.Incoming)) {
        New-Item -ItemType Directory -Force -Path $d | Out-Null
    }
}

function Get-GGPackKey {
    param([string]$Name)
    $k = ($Name.ToLowerInvariant() -replace '[^a-z0-9]+', '-').Trim('-')
    if (-not $k) { $k = 'pack' }
    return $k
}

# packwiz-installer (+bootstrap) and the Java we need; downloaded once, cached in tools\.
function Ensure-GGInstaller {
    $boot = Join-Path $global:GG.Tools 'packwiz-installer-bootstrap.jar'
    $main = Join-Path $global:GG.Tools 'packwiz-installer.jar'
    return (Invoke-GGExclusive 'tools' {
            $n1 = Get-GGFile $global:GGUrls.Bootstrap $boot 50000
            $n2 = Get-GGFile $global:GGUrls.Installer $main 100000
            if ($n1 -or $n2) { 'downloaded' } else { 'cached' }
        })
}

# Forge dedicated server installed once per Forge version in cache\forge-server\<mc>-<forge>; runs copy it.
function Ensure-GGForgeServer {
    param([string]$Mc, [string]$Forge)
    $ver = "$Mc-$Forge"
    $dir = Join-Path $global:GG.Cache "forge-server\$ver"
    $argsFile = Join-Path $dir "libraries\net\minecraftforge\forge\$ver\$($global:GG.ForgeArgsFile)"
    if ((Test-Path (Join-Path $dir '.ok')) -and (Test-Path $argsFile)) { return @{ Dir = $dir; Cached = $true; Ver = $ver } }

    # one run installs, a concurrent one waits and then finds it cached
    return (Invoke-GGExclusive "forge-$ver" {
            if ((Test-Path (Join-Path $dir '.ok')) -and (Test-Path $argsFile)) { return @{ Dir = $dir; Cached = $true; Ver = $ver } }
            $installer = Join-Path $global:GG.Cache "forge-installers\forge-$ver-installer.jar"
            [void](Get-GGFile "$($global:GGUrls.ForgeMaven)/$ver/forge-$ver-installer.jar" $installer 1000000)
            Remove-GGTree $dir
            New-Item -ItemType Directory -Force -Path $dir | Out-Null
            $java = Get-GGJava17
            Write-GGLog "installing Forge server $ver (about 2 min) ..."
            $flog = Join-Path $global:GG.Cache "forge-install-$ver"
            $code = Invoke-GGTool $java "-jar `"$installer`" --installServer `"$dir`"" $dir $flog 900 $null 'forge-installer'
            if ($code -ne 0 -or -not (Test-Path $argsFile)) {
                $tail = ''
                if (Test-Path "$flog.out.log") { $tail = ((Get-Content "$flog.out.log" -Tail 12) -join ' | ') }
                throw "Forge installer failed (exit $code): $tail"
            }
            Set-Content -Path (Join-Path $dir '.ok') -Value (Get-Date).ToString('o')
            return @{ Dir = $dir; Cached = $false; Ver = $ver }
        })
}

# Runs packwiz-installer against the uploaded pack into a persistent per-pack/per-side sync dir
# (so mod jars are only downloaded once); returns the sync dir.
function Sync-GGPack {
    param([string]$Side, [string]$PackToml, [string]$PackKey, [string]$LogDir)
    $syncDir = Join-Path $global:GG.Sync "$PackKey-$Side"
    New-Item -ItemType Directory -Force -Path (Join-Path $syncDir 'mods') | Out-Null
    $manual = Join-Path $global:GG.Cache 'manual-mods'
    if (Test-Path $manual) {
        foreach ($j in @(Get-ChildItem $manual -Filter *.jar -File -ErrorAction SilentlyContinue)) {
            $dst = Join-Path $syncDir ('mods\' + $j.Name)
            if (-not (Test-Path $dst)) { Copy-Item -LiteralPath $j.FullName -Destination $dst -Force; Write-GGLog "manual mod placed: $($j.Name)" }
        }
    }
    $boot = Join-Path $global:GG.Tools 'packwiz-installer-bootstrap.jar'
    $main = Join-Path $global:GG.Tools 'packwiz-installer.jar'
    $java = Get-GGJava17
    New-Item -ItemType Directory -Force -Path $LogDir | Out-Null
    $logBase = Join-Path $LogDir "packwiz-installer-$Side"
    $argStr = "-jar `"$boot`" -g -s $Side --bootstrap-no-update --bootstrap-main-jar `"$main`" --pack-folder `"$syncDir`" `"$PackToml`""
    Write-GGLog "packwiz-installer side=$Side -> $syncDir"
    $code = Invoke-GGTool $java $argStr $global:GG.Tools $logBase 1800 $null "packwiz-installer($Side)"
    $lines = @()
    if (Test-Path "$logBase.out.log") { $lines += @(Get-Content "$logBase.out.log") }
    if (Test-Path "$logBase.err.log") { $lines += @(Get-Content "$logBase.err.log") }
    if ($code -ne 0) {
        $bad = @($lines | Where-Object { $_ -match '(?i)fail|error|exception|manual|not available|unable|could not|exclud' } | Select-Object -First 12)
        if ($bad.Count -eq 0) { $bad = @($lines | Select-Object -Last 8) }
        throw ("packwiz-installer exit $code. " + ($bad -join ' | ') + " (see packwiz-installer-$Side.out.log; CurseForge mods with distribution disabled need their jar in $manual)")
    }
    return $syncDir
}

# Copies overlay\ (test-only files) over the instance, overwriting. Returns the list of overlaid relative paths.
function Add-GGOverlay {
    param([string]$OverlayDir, [string]$Instance)
    $rel = @()
    if (-not (Test-Path $OverlayDir)) { return $rel }
    $root = (Resolve-Path $OverlayDir).Path.TrimEnd('\', '/')
    foreach ($f in @(Get-ChildItem $OverlayDir -Recurse -File -Force)) {
        $rel += $f.FullName.Substring($root.Length + 1)
    }
    if ($rel.Count -gt 0) { Copy-GGTree $OverlayDir $Instance }
    return $rel
}

function Get-GGModList {
    param([string]$Instance)
    $mods = Join-Path $Instance 'mods'
    if (-not (Test-Path $mods)) { return @() }
    return @(Get-ChildItem $mods -Filter *.jar -File | Sort-Object Name | ForEach-Object { '{0}  {1}' -f $_.Name, $_.Length })
}

# Software OpenGL for the client test (real LWJGL, no stub): Mesa's llvmpipe opengl32.dll + libgallium_wgl.dll are
# placed next to java.exe of a PRIVATE copy of JDK 17 (the system JDK is never modified), so only the game launched
# from it renders with Mesa. Cached in tools\mesa and tools\jdk17-mesa. Returns @{ JavaHome; Version; Cached }.
function Ensure-GGMesa {
    $ver = $global:GGUrls.MesaVersion
    $mesaRoot = Join-Path $global:GG.Tools 'mesa'
    $archive = Join-Path $mesaRoot "mesa3d-$ver-release-msvc.7z"
    $x64 = Join-Path $mesaRoot "$ver\x64"
    $jdkSrc = Split-Path -Parent (Split-Path -Parent (Get-GGJava17))
    $dst = Join-Path $global:GG.Tools 'jdk17-mesa'
    $marker = Join-Path $dst '.gg-mesa'
    $want = "$ver|$jdkSrc"
    $isCached = { (Test-Path $marker) -and ((Get-Content $marker -Raw).Trim() -eq $want) -and (Test-Path (Join-Path $dst 'bin\opengl32.dll')) }
    if (& $isCached) { return @{ JavaHome = $dst; Version = $ver; Cached = $true } }
    # one run builds it, a concurrent one waits and then finds it cached
    return (Invoke-GGExclusive 'mesa' {
            if (& $isCached) { return @{ JavaHome = $dst; Version = $ver; Cached = $true } }
            if (-not (Test-Path (Join-Path $x64 'opengl32.dll'))) {
                [void](Get-GGFile $global:GGUrls.Mesa $archive 30000000)
                $out = Join-Path $mesaRoot $ver
                Remove-GGTree $out
                New-Item -ItemType Directory -Force -Path $out | Out-Null
                $sevenZip = 'C:\Program Files\7-Zip\7z.exe'
                if (Test-Path $sevenZip) { & $sevenZip x $archive "-o$out" -y | Out-Null } else { & tar.exe -xf $archive -C $out | Out-Null }
                $global:LASTEXITCODE = 0
                if (-not (Test-Path (Join-Path $x64 'opengl32.dll'))) { throw "Mesa extraction failed: $archive" }
            }
            Write-GGLog "building tools\jdk17-mesa (private JDK 17 copy + Mesa $ver llvmpipe) ..."
            Remove-GGTree $dst
            Copy-GGTree $jdkSrc $dst
            foreach ($f in @('opengl32.dll', 'libgallium_wgl.dll', 'dxil.dll', 'spirv_to_dxil.dll')) {
                Copy-Item -LiteralPath (Join-Path $x64 $f) -Destination (Join-Path $dst "bin\$f") -Force
            }
            Set-Content -LiteralPath $marker -Value $want
            return @{ JavaHome = $dst; Version = $ver; Cached = $false }
        })
}
