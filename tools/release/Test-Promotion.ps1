# Read-only gate to run BEFORE moving a channel (releases / tag): proves the exact commit is what is being promoted.
# Checks: (1) -Sha is a full commit that exists; (2) pack/pack.toml at that commit has the expected version;
# (3) the authoritative T0 run for exactly that SHA concluded success; (4) the GitHub release v<Version> carries the Prism zip.
# T0 selection is independent of gh's ordering: among the runs of exactly -Sha, cancelled, skipped, neutral and stale
# runs are ignored (a duplicate push cancelled by the concurrency group proves nothing); any run still queued or in
# progress blocks until it ends; otherwise the newest conclusive run (latest attempt start, then run id) is authoritative
# and must be a success, so a later failure still blocks while a re-run that started after a failure supersedes it.
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
function Check([string]$name, [bool]$ok, [string]$detail, [string]$passDetail = '') {
    if ($ok) { Write-Output ("PASS  $name" + $(if ($passDetail) { " -- $passDetail" } else { '' })) }
    else { Write-Output "FAIL  $name -- $detail"; $script:failures.Add($name) }
}
# pwsh 7 turns ISO strings into [datetime] while Windows PowerShell 5.1 keeps strings; both become UTC here.
function RunTime($v) {
    if ($v -is [datetime]) { return $v.ToUniversalTime() }
    $d = [datetimeoffset]::MinValue
    if ("$v" -and [datetimeoffset]::TryParse("$v", [Globalization.CultureInfo]::InvariantCulture,
            [Globalization.DateTimeStyles]::AssumeUniversal, [ref]$d)) { return $d.UtcDateTime }
    return [datetime]::MinValue
}
function DescribeRun($e) {
    $r = $e.Run
    $state = if ($r.status -eq 'completed') { $r.conclusion } else { $r.status }
    $where = (@($r.headBranch, $r.event) | Where-Object { $_ }) -join ' '
    $at = if ($e.Time -gt [datetime]::MinValue) { ', started ' + $e.Time.ToString("yyyy-MM-dd'T'HH:mm:ss'Z'", [Globalization.CultureInfo]::InvariantCulture) } else { '' }
    "run $(if ($r.databaseId) { $r.databaseId } else { '(no id)' }) [$(if ($where) { "$where, " })$state$at]"
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

    $global:LASTEXITCODE = 0
    $runsJson = (& $GhExe run list --repo $Repo --workflow t0.yml --commit $Sha --json attempt,conclusion,createdAt,databaseId,event,headBranch,headSha,startedAt,status --limit 50) -join "`n"
    $ghExit = $LASTEXITCODE
    $listed = if ($ghExit -eq 0 -and $runsJson.Trim()) { @($runsJson | ConvertFrom-Json | ForEach-Object { $_ } | Where-Object { $null -ne $_ }) } else { @() }
    $i = 0
    $all = @(foreach ($r in $listed) {
        $t = RunTime $r.startedAt
        if ($t -eq [datetime]::MinValue) { $t = RunTime $r.createdAt }
        [pscustomobject]@{ Run = $r; Time = $t; Order = $i++
            Id = $(if ($r.databaseId) { [long]$r.databaseId } else { 0 }); Attempt = $(if ($r.attempt) { [int]$r.attempt } else { 0 }) }
    })
    $mine = @($all | Where-Object { $_.Run.headSha -ceq $Sha } | Sort-Object -Property `
        @{ Expression = 'Time'; Descending = $true }, @{ Expression = 'Id'; Descending = $true },
        @{ Expression = 'Attempt'; Descending = $true }, @{ Expression = 'Order'; Descending = $false })
    $otherNote = if ($all.Count -gt $mine.Count) { " ($($all.Count - $mine.Count) run(s) of other SHAs ignored)" } else { '' }
    $nonEvidence = @('cancelled', 'skipped', 'neutral', 'stale')
    $pending = @($mine | Where-Object { $_.Run.status -ne 'completed' })
    $ignored = @($mine | Where-Object { $_.Run.status -eq 'completed' -and $nonEvidence -contains $_.Run.conclusion })
    $conclusive = @($mine | Where-Object { $_.Run.status -eq 'completed' -and $nonEvidence -notcontains $_.Run.conclusion })
    $ignoredNote = if ($ignored.Count) { '; ignored ' + (($ignored | ForEach-Object { DescribeRun $_ }) -join ', ') } else { '' }
    $t0Why = $null
    if ($ghExit -ne 0) { $t0Why = "gh run list failed (exit $ghExit); no T0 evidence for $Sha" }
    elseif ($mine.Count -eq 0) { $t0Why = "no T0 run for exactly $Sha$otherNote" }
    elseif ($pending.Count) { $t0Why = 'T0 for this SHA has not finished: ' + (($pending | ForEach-Object { DescribeRun $_ }) -join ', ') + '; wait for it to complete' }
    elseif ($conclusive.Count -eq 0) { $t0Why = "no authoritative T0 run for exactly ${Sha}: only " + (($ignored | ForEach-Object { DescribeRun $_ }) -join ', ') + $otherNote }
    elseif ($conclusive[0].Run.conclusion -ne 'success') { $t0Why = "the newest authoritative T0 $(DescribeRun $conclusive[0]) is not green$ignoredNote" }
    $acceptedNote = if ($null -eq $t0Why) { "accepted $(DescribeRun $conclusive[0])$ignoredNote$otherNote" } else { '' }
    Check 't0-success' ($null -eq $t0Why) $t0Why $acceptedNote

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
