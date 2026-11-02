# Read-only gate to run BEFORE moving a channel (releases / tag): proves the exact commit is what is being promoted.
# Checks: (1) -Sha is a full commit that exists; (2) pack/pack.toml at that commit has the expected version;
# (3) the T0 workflow concluded success for exactly that SHA; (4) the GitHub release v<Version> carries the Prism zip.
# Exit 0 only when every check passes. It never changes a branch, tag or release.
#   pwsh tools/release/Test-Promotion.ps1 -Sha <40-hex> -Version 1.1.0 [-SkipRelease]
# -SkipRelease is for the step before the release exists (the Prism asset is then reported as skipped, not passed).
param(
    [Parameter(Mandatory)][string]$Sha,
    [Parameter(Mandatory)][string]$Version,
    [string]$Repo = 'Ezequiel24123z/GrindlessGregtech',
    [string]$GhExe = 'gh',
    [switch]$SkipRelease
)
$ErrorActionPreference = 'Stop'
$ver = $Version -replace '^v', ''
$failures = New-Object System.Collections.Generic.List[string]
function Check([string]$name, [bool]$ok, [string]$detail) {
    if ($ok) { Write-Output "PASS  $name" } else { Write-Output "FAIL  $name -- $detail"; $script:failures.Add($name) }
}

Check 'sha-format' ($Sha -match '^[0-9a-f]{40}$') "expected a full 40-character lowercase SHA, got '$Sha'"
if ($failures.Count -eq 0) {
    $full = (git rev-parse --verify --quiet "$Sha^{commit}" 2>$null)
    Check 'sha-exists' ($full -eq $Sha) "git does not resolve $Sha to that exact commit"
}
if ($failures.Count -eq 0) {
    $toml = (git show "${Sha}:pack/pack.toml" 2>$null) -join "`n"
    $m = [regex]::Match($toml, '(?m)^version\s*=\s*"([^"]+)"')
    $found = if ($m.Success) { $m.Groups[1].Value } else { '(none)' }
    Check 'pack-version' ($found -eq $ver) "pack/pack.toml at $Sha has version $found, expected $ver"

    $runsJson = (& $GhExe run list --repo $Repo --workflow t0.yml --commit $Sha --json conclusion,headSha,status --limit 20) -join "`n"
    $runs = @($runsJson | ConvertFrom-Json) | Where-Object { $_.headSha -eq $Sha }
    $green = @($runs | Where-Object { $_.status -eq 'completed' -and $_.conclusion -eq 'success' })
    $latest = @($runs | Select-Object -First 1)
    Check 't0-success' ($green.Count -gt 0 -and $latest.Count -gt 0 -and $latest[0].conclusion -eq 'success') `
        "no successful T0 run for exactly $Sha, or the newest run for it is not green"

    if ($SkipRelease) {
        Write-Output 'SKIP  prism-asset -- -SkipRelease given; the release must be checked again after it is published'
    } else {
        $relJson = (& $GhExe release view "v$ver" --repo $Repo --json assets,isDraft) -join "`n"
        $rel = $relJson | ConvertFrom-Json
        $names = @($rel.assets | ForEach-Object { $_.name })
        Check 'prism-asset' ($names -contains "Gregtech-Grindless-v$ver.zip") "release v$ver has no Gregtech-Grindless-v$ver.zip (assets: $($names -join ', '))"
        Check 'release-published' (-not $rel.isDraft) "release v$ver is still a draft"
    }
}
if ($failures.Count -gt 0) { Write-Output "PROMOTION BLOCKED: $($failures -join ', ')"; exit 1 }
Write-Output "PROMOTION OK: $Sha is v$ver"
