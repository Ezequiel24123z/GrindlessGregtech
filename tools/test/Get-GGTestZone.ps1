<#
.SYNOPSIS
Looks up, allocates and validates the reserved test bands in tools\test\zones.json.

.DESCRIPTION
No arguments: one line per band (id, X, Z, tests).
  -Id <id or test>   the band of that zone id or gg_test_<name> (without the prefix), as JSON.
  -Next              the X start of the next free band (after the highest band, rounded up to the 256 step).
  -Validate          checks the table: unique ids, X/Z overlaps between bands, band width, and that every listed test
                     exists as tools\test\overlay\kubejs\**\gg_test_<name>.js. Exit 0 = clean, 1 = problems (one line each).

.EXAMPLE
powershell -NoProfile -File tools\test\Get-GGTestZone.ps1 -Next
powershell -NoProfile -File tools\test\Get-GGTestZone.ps1 -Id cryogenic_plant
#>
param(
    [string]$Id,
    [switch]$Next,
    [switch]$Validate,
    [string]$ZonesFile
)
$ErrorActionPreference = 'Stop'
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
if (-not $ZonesFile) { $ZonesFile = Join-Path $here 'zones.json' }
$table = Get-Content $ZonesFile -Raw -Encoding UTF8 | ConvertFrom-Json
$defZ = @($table.defaults.z)

function Get-Z($zone) { if ($zone.z) { return @($zone.z) } else { return $defZ } }

if ($Id) {
    $hit = @($table.zones | Where-Object { $_.id -eq $Id -or (@($_.tests) -contains $Id) })
    if ($hit.Count -eq 0) { Write-Output "no zone for '$Id'"; exit 1 }
    $hit | ForEach-Object { $_ | ConvertTo-Json -Compress -Depth 4 }
    exit 0
}

if ($Next) {
    $maxEnd = ($table.zones | ForEach-Object { [int]$_.x[1] } | Measure-Object -Maximum).Maximum
    $step = [int]$table.step
    Write-Output ([int]([math]::Floor($maxEnd / $step) + 1) * $step)
    exit 0
}

if ($Validate) {
    $problems = New-Object System.Collections.Generic.List[string]
    $zones = @($table.zones)
    $dups = $zones | Group-Object id | Where-Object Count -gt 1
    foreach ($d in $dups) { $problems.Add("duplicate id $($d.Name)") }
    foreach ($z in $zones) {
        if ([int]$z.x[1] -lt [int]$z.x[0]) { $problems.Add("$($z.id): X range reversed") }
        if (([int]$z.x[1] - [int]$z.x[0] + 1) -gt [int]$table.width) { $problems.Add("$($z.id): wider than $($table.width) in X") }
    }
    for ($i = 0; $i -lt $zones.Count; $i++) {
        for ($j = $i + 1; $j -lt $zones.Count; $j++) {
            $a = $zones[$i]; $b = $zones[$j]; $za = Get-Z $a; $zb = Get-Z $b
            $xo = [int]$a.x[0] -le [int]$b.x[1] -and [int]$b.x[0] -le [int]$a.x[1]
            $zo = [int]$za[0] -le [int]$zb[1] -and [int]$zb[0] -le [int]$za[1]
            if ($xo -and $zo) { $problems.Add("overlap: $($a.id) and $($b.id)") }
        }
    }
    $overlay = Join-Path $here 'overlay\kubejs'
    $known = @{}
    Get-ChildItem $overlay -Recurse -Filter 'gg_test_*.js' | ForEach-Object { $known[($_.BaseName -replace '^gg_test_', '')] = $true }
    foreach ($z in $zones) { foreach ($t in @($z.tests)) { if ($t -and -not $known.ContainsKey($t)) { $problems.Add("$($z.id): test gg_test_$t.js not found") } } }
    if ($problems.Count -eq 0) { Write-Output "zones: $($zones.Count) bands, no overlaps"; exit 0 }
    $problems | ForEach-Object { Write-Output $_ }
    exit 1
}

$table.zones | ForEach-Object {
    $z = Get-Z $_
    '{0,-28} X {1,5}-{2,-5} Z {3}-{4}  {5}' -f $_.id, $_.x[0], $_.x[1], $z[0], $z[1], (@($_.tests) -join ',')
}
