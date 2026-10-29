# Shared local/remote policy. Changing a default must not bypass the personal-PC limits.
function Assert-GGResourceRequest {
    param($Req)
    $heaps = [ordered]@{ serverXms = '1G'; serverXmx = '4G'; clientXms = '1G'; clientXmx = '4G' }
    foreach ($key in @($heaps.Keys)) {
        if ($null -eq $Req.PSObject.Properties[$key]) { Add-Member -InputObject $Req -NotePropertyName $key -NotePropertyValue $heaps[$key] }
        $value = [string]$Req.$key
        if ($value -notmatch '^([1-9][0-9]*)([kKmMgG])$') { throw "Invalid $key '$value': use a positive integer Java heap size such as 1G or 4096M" }
        $gb = [double]::Parse($Matches[1], [Globalization.CultureInfo]::InvariantCulture)
        switch ($Matches[2].ToUpperInvariant()) {
            'M' { $gb /= 1024 }
            'K' { $gb /= 1048576 }
        }
        if ($gb -gt 4) { throw "$key '$value' exceeds the personal-PC limit of 4 GB heap; do not raise it without the user's approval" }
        $heaps[$key] = $gb
    }
    foreach ($side in 'server', 'client') {
        if ($heaps["${side}Xms"] -gt $heaps["${side}Xmx"]) { throw "${side}Xms must not exceed ${side}Xmx" }
    }
    $caps = [ordered]@{
        bootTimeoutSec = 420; commandTimeoutSec = 60; clientTimeoutSec = 600
        waitTimeoutSec = 180; nativeTimeoutSec = 600; lockWaitMin = 15; settleSec = 60
    }
    foreach ($key in $caps.Keys) {
        if ($null -eq $Req.PSObject.Properties[$key]) { Add-Member -InputObject $Req -NotePropertyName $key -NotePropertyValue $caps[$key] }
        $n = [double]$Req.$key
        $min = 1
        if ($key -eq 'settleSec') { $min = 0 }
        if ([double]::IsNaN($n) -or $n -lt $min -or $n -gt $caps[$key] -or $n -ne [math]::Floor($n)) {
            throw "$key must be an integer between $min and $($caps[$key]) under the personal-PC policy"
        }
    }
    if ($null -eq $Req.PSObject.Properties['emiAuditTimeoutSec']) {
        Add-Member -InputObject $Req -NotePropertyName emiAuditTimeoutSec -NotePropertyValue 600
    }
    $emiTimeout = [double]$Req.emiAuditTimeoutSec
    if ([double]::IsNaN($emiTimeout) -or $emiTimeout -lt 600 -or $emiTimeout -gt 1800 -or $emiTimeout -ne [math]::Floor($emiTimeout)) {
        throw 'emiAuditTimeoutSec must be an integer between 600 and 1800'
    }
    if ($null -eq $Req.PSObject.Properties['emiAuditClientXmx']) {
        Add-Member -InputObject $Req -NotePropertyName emiAuditClientXmx -NotePropertyValue '4G'
    }
    if ([string]$Req.emiAuditClientXmx -notmatch '^[4-8][gG]$') {
        throw 'emiAuditClientXmx must be a whole-GB heap from 4G to 8G'
    }
    if (($emiTimeout -gt 600 -or [string]$Req.emiAuditClientXmx -ne '4G') -and
        ([string]$Req.suite -ne 'client' -or [string]$Req.os -ne 'linux')) {
        throw 'Extended EMI audit resources are permitted only for a client-only Linux audit'
    }
    if ([string]$Req.emiAuditClientXmx -ne '4G' -and [double]$Req.slots -ne 1) {
        throw 'An extended EMI audit heap requires slots=1 so no other bench run can hold a slot'
    }
    # The Windows home PC runs one Minecraft JVM globally; a dedicated Linux VM (request os = linux) may run up to 8
    # concurrent slots, each bounded by its own systemd MemoryMax (gg-linux-run.sh). The runner re-caps per bench.
    $slotsMax = $(if ([string]$Req.os -eq 'linux') { 8 } else { 1 })
    $n = [double]$Req.slots
    if ([double]::IsNaN($n) -or $n -lt 1 -or $n -gt $slotsMax -or $n -ne [math]::Floor($n)) {
        if ($slotsMax -eq 1) { throw 'The personal-PC policy permits exactly one Minecraft JVM globally (-Slots 1)' }
        throw "slots must be an integer between 1 and $slotsMax on a Linux bench"
    }
    if ($null -ne $Req.PSObject.Properties['slotMinFreeGb']) {
        Write-Warning 'slotMinFreeGb is deprecated and ignored; available RAM does not gate slot acquisition or JVM launch'
    }
    foreach ($wait in @($Req.waitForLog)) {
        if ($null -eq $wait) { continue }
        $n = [double]$wait.timeoutSec
        if ([double]::IsNaN($n) -or $n -lt 0 -or $n -gt 180 -or $n -ne [math]::Floor($n)) {
            throw 'Each waitForLog deadline must be at most 180 seconds (0 uses waitTimeoutSec)'
        }
    }
    # One bounded restart in a server stage, including the server stage of both.
    $restarts = @(@($Req.commands) | Where-Object { $null -ne $_ -and ([string]$_) -match '^\s*@restart' })
    if ($restarts.Count -gt 0) {
        if ([string]$Req.suite -notin @('server', 'both')) { throw 'A server restart (@restart) requires a server stage (-Suite server or both)' }
        if ($restarts.Count -gt 1) { throw 'A run may restart its server at most once: both boots share one native budget' }
        $restart = [string]$restarts[0]
        if ($restart -notmatch '^@restart(?::(.+))?$') { throw "Malformed restart command '$restart': use @restart or @restart:<marker regex>[&&<marker regex>...]" }
        if ($Matches[1]) {
            foreach ($pattern in ($Matches[1] -split '&&')) {
                if (-not $pattern) { throw "Empty restart marker in '$restart'" }
                try { [void](New-Object Text.RegularExpressions.Regex($pattern)) } catch { throw "Invalid restart marker regex '$pattern'" }
            }
        }
    }
}

# One clock survives both suites; successive stages cannot each claim a fresh ten minutes.
function Get-GGNativeTimeoutMs {
    param($Budget, [int]$MaxMs)
    if ($MaxMs -le 0) { throw 'A native wait must have a positive timeout' }
    $remaining = ([double]$Budget.TimeoutSec * 1000) - $Budget.Clock.Elapsed.TotalMilliseconds
    if ($remaining -le 0) { throw "Native test budget exhausted after $($Budget.TimeoutSec)s; stop this run, do not automatically retry" }
    return [int][math]::Max(1, [math]::Floor([math]::Min($MaxMs, $remaining)))
}
