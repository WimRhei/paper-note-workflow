param(
  [switch]$Quiet
)

$ErrorActionPreference = "Stop"

function Resolve-Tool {
  param([Parameter(Mandatory = $true)][string]$Name)
  $cmd = Get-Command $Name -ErrorAction SilentlyContinue
  if ($cmd) {
    return $cmd.Source
  }
  return $null
}

$skillRoot = Split-Path -Parent $PSScriptRoot
$localBin = Join-Path $skillRoot ".tools\bin"
$env:Path = "$localBin;$env:Path"

$checks = @(
  @{ Name = "pdftotext"; Required = $true },
  @{ Name = "pdffigures2"; Required = $true },
  @{ Name = "java"; Required = $true }
)

$failed = @()
foreach ($check in $checks) {
  $path = Resolve-Tool $check.Name
  if ($path) {
    if (-not $Quiet) {
      Write-Host ("OK   {0}: {1}" -f $check.Name, $path)
    }
  } else {
    $failed += $check.Name
    if (-not $Quiet) {
      Write-Host ("MISS {0}" -f $check.Name)
    }
  }
}

if ($failed.Count -gt 0) {
  if (-not $Quiet) {
    Write-Host ""
    Write-Host "Run this from the skill root to install local wrappers:"
    Write-Host "  powershell -ExecutionPolicy Bypass -File .\scripts\bootstrap-windows.ps1"
    Write-Host ""
    Write-Host "If Java is missing, install a JRE/JDK first and rerun verification."
  }
  exit 1
}

exit 0
