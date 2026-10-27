<#
.SYNOPSIS
  Procedural 16x16 pixel art for the UV wireless tier of Gregtech Grindless (package UV-A9): the UV SMES cell and the UV covers.

.DESCRIPTION
  Every pixel is drawn by the routines of Build-WirelessEnergyTextures.ps1 (loaded from that script's syntax tree: its functions and its
  palette, nothing else runs), in GTM's UV colour (GTValues.VNF: dark aqua). Nothing is copied or edited from GregTech Modern or any
  other mod. Output is deterministic: re-running overwrites the same bytes. The shared layers (the hatch overlays, the covers' emissive
  signal) are the wireless script's and are not written here.

  Writes (under pack/kubejs/assets/grindless/textures/):
    block/wireless/smes_cell_uv.png                         the UV cell (the table's uv row texture): a superconducting coil in a
                                                            frost-grey cryostat, its tape turns dark aqua in the window
    block/cover/wireless_<energy|dynamo>_cover_uv.png       the covers on a machine's face: a dark aqua frame round the dish or the mast
    item/wireless/<energy|dynamo>_cover_uv.png              the cover items: a steel plate with the frame and the symbol

  Run from the repo root (PowerShell 5.1 blocks unsigned scripts by default; this bypass only affects that process):
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-UVWirelessTextures.ps1
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\assets\Build-UVWirelessTextures.ps1 -Credits

.PARAMETER OutRoot
  Textures root. Default: <repo>/pack/kubejs/assets/grindless/textures
.PARAMETER Credits
  Also print the CREDITS.md "Assets" table rows for the files written.
#>
[CmdletBinding()]
param(
    [string]$OutRoot = '',
    [switch]$Credits
)
$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'Pixel.Lib.ps1')

if (-not $OutRoot) { $OutRoot = Join-Path $PSScriptRoot '..\..\pack\kubejs\assets\grindless\textures' }
$OutRoot = [System.IO.Path]::GetFullPath($OutRoot)
$ScriptName = Split-Path -Leaf $PSCommandPath

# the drawing routines and the palette of the wireless set: its function definitions and its $Pal assignment, nothing else
$Source = Join-Path $PSScriptRoot 'Build-WirelessEnergyTextures.ps1'
$parseErrors = $null
$ast = [System.Management.Automation.Language.Parser]::ParseFile($Source, [ref]$null, [ref]$parseErrors)
if ($parseErrors -and $parseErrors.Count -gt 0) { throw "Cannot parse ${Source}: $($parseErrors[0])" }
$Skip = @('Test-Want', 'Out-Tex')
foreach ($st in $ast.EndBlock.Statements) {
    if ($st -is [System.Management.Automation.Language.FunctionDefinitionAst] -and $Skip -notcontains $st.Name) {
        . ([ScriptBlock]::Create($st.Extent.Text))
    }
}
$palAst = @($ast.EndBlock.Statements | Where-Object {
    $_ -is [System.Management.Automation.Language.AssignmentStatementAst] -and $_.Left.Extent.Text -eq '$Pal' })
if ($palAst.Count -ne 1) { throw "Expected one `$Pal assignment in $Source, found $($palAst.Count)" }
. ([ScriptBlock]::Create($palAst[0].Extent.Text))
foreach ($fn in 'New-SmesCell', 'New-CoverFace', 'New-CoverItem', 'New-SmallDish', 'New-SmallMast', 'New-MidDish', 'New-MidMast', 'Get-TierRamp') {
    if (-not (Get-Command $fn -CommandType Function -ErrorAction SilentlyContinue)) { throw "$Source no longer defines $fn" }
}

# GTM's UV colour (GTValues.VNF: dark aqua), the bright tone; Get-TierRamp derives the rest
$TierColour = @{ uv = '1FB8B0' }
$Tier = 'uv'

# the cell's texture is the table's uv row texture
$TablePath = Join-Path $PSScriptRoot '..\..\pack\kubejs\data\grindless\tables\wireless_energy.json'
$row = @((Get-Content -Raw -Encoding UTF8 -LiteralPath $TablePath | ConvertFrom-Json).tiers | Where-Object { [string]$_.name -eq $Tier })
if ($row.Count -ne 1) { throw "tables/wireless_energy.json has $($row.Count) '$Tier' rows" }
if ([string]$row[0].texture -notmatch '^grindless:(block/wireless/[a-z0-9_]+)$') { throw "Texture '$($row[0].texture)' of the $Tier row is not grindless:block/wireless/<name>" }
$CellRel = "$($Matches[1]).png"

$written = New-Object System.Collections.Generic.List[string]
function Out-Tex {
    param($Canvas, [string]$Rel)
    $path = Join-Path $OutRoot ($Rel -replace '/', '\')
    $dir = Split-Path -Parent $path
    if (-not (Test-Path -LiteralPath $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
    for ($try = 1; $try -le 6; $try++) {
        try { Save-Png $Canvas $path; break }
        catch [System.IO.IOException] { if ($try -eq 6) { throw }; Start-Sleep -Milliseconds (250 * $try) }
    }
    $written.Add($Rel)
}

# ============================================================================================
#  BUILD
# ============================================================================================
Out-Tex (New-SmesCell $Tier) $CellRel
Out-Tex (New-CoverFace (New-MidDish) 'p' $Tier) "block/cover/wireless_energy_cover_$Tier.png"
Out-Tex (New-CoverFace (New-MidMast) 'z' $Tier) "block/cover/wireless_dynamo_cover_$Tier.png"
Out-Tex (New-CoverItem (New-SmallDish) 'p' $Tier) "item/wireless/energy_cover_$Tier.png"
Out-Tex (New-CoverItem (New-SmallMast) 'z' $Tier) "item/wireless/dynamo_cover_$Tier.png"

# ============================================================================================
#  VERIFY (size, binary alpha, no pure black, the tier's colour present, every output distinct)
# ============================================================================================
$problems = 0
$seen = @{}
$ramp = @(Get-TierRamp $Tier)
foreach ($rel in $written) {
    $path = Join-Path $OutRoot ($rel -replace '/', '\')
    $img = Read-Png $path
    $msgs = @()
    if ($img.W -ne 16 -or $img.H -ne 16) { $msgs += "bad size $($img.W)x$($img.H)" }
    $opaque = 0; $black = 0; $tier = 0
    foreach ($px in $img.P) {
        $alpha = ($px -shr 24) -band 255
        if ($alpha -ne 0 -and $alpha -ne 255) { $msgs += 'partial alpha'; break }
        if ($alpha -eq 255) {
            $opaque++
            $q = Get-Rgba $px
            if ($q[0] -eq 0 -and $q[1] -eq 0 -and $q[2] -eq 0) { $black++ }
            if ($ramp -contains ($px -bor 0xFF000000)) { $tier++ }
        }
    }
    if ($opaque -eq 0) { $msgs += 'fully transparent' }
    if ($black -gt 0) { $msgs += "$black pure-black px" }
    if ($tier -eq 0) { $msgs += 'no pixel of the UV colour' }
    $key = ($img.P -join ',')
    if ($seen.ContainsKey($key)) { $msgs += "same pixels as $($seen[$key])" } else { $seen[$key] = $rel }
    if ($msgs.Count -gt 0) { $problems++; Write-Warning "$rel : $($msgs -join '; ')" }
}

Write-Host "written $($written.Count) files under $OutRoot ($problems with warnings)"
foreach ($rel in $written) { Write-Host "  $rel" }

if ($Credits) {
    Write-Host ''
    foreach ($rel in $written) {
        Write-Host ("| ``pack/kubejs/assets/grindless/textures/$rel`` | Generated with tools/assets/$ScriptName (procedural pixel art, original; the routines of Build-WirelessEnergyTextures.ps1) by the wireless agent (UV-A9) | the pack's licence (pending; proposed CC BY-SA 4.0) |")
    }
}
if ($problems -gt 0) { exit 1 }
