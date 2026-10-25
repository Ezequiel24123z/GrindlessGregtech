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
    if ([int]$Req.slots -ne 1) { throw 'The personal-PC policy permits exactly one Minecraft JVM globally (-Slots 1)' }
    $free = [double]$Req.slotMinFreeGb
    if ([double]::IsNaN($free) -or [double]::IsInfinity($free) -or $free -lt 8) { throw 'slotMinFreeGb must be at least 8 GB' }
    foreach ($wait in @($Req.waitForLog)) {
        if ($null -eq $wait) { continue }
        $n = [double]$wait.timeoutSec
        if ([double]::IsNaN($n) -or $n -lt 0 -or $n -gt 180 -or $n -ne [math]::Floor($n)) {
            throw 'Each waitForLog deadline must be at most 180 seconds (0 uses waitTimeoutSec)'
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
