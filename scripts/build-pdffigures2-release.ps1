param(
  [string]$OutputDir = (Join-Path (Split-Path -Parent $PSScriptRoot) "dist"),
  [string]$SourceUrl = "https://github.com/allenai/pdffigures2.git",
  [switch]$Force
)

$ErrorActionPreference = "Stop"

function Require-Command {
  param([Parameter(Mandatory = $true)][string]$Name)
  $cmd = Get-Command $Name -ErrorAction SilentlyContinue
  if (-not $cmd) {
    throw "$Name is required on PATH."
  }
}

Require-Command git
Require-Command sbt
Require-Command java

$skillRoot = Split-Path -Parent $PSScriptRoot
$buildRoot = Join-Path $skillRoot ".build"
$src = Join-Path $buildRoot "pdffigures2"

if ($Force -and (Test-Path -LiteralPath $src)) {
  Remove-Item -LiteralPath $src -Recurse -Force
}

if (-not (Test-Path -LiteralPath $src)) {
  New-Item -ItemType Directory -Path $buildRoot -Force | Out-Null
  git clone $SourceUrl $src
}

Push-Location $src
try {
  git pull --ff-only
  sbt assembly
  $jar = Get-ChildItem -Path (Join-Path $src "target") -Recurse -Filter "*assembly*.jar" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
  if (-not $jar) {
    throw "No assembly jar found under target after sbt assembly."
  }

  New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
  $out = Join-Path $OutputDir "pdffigures2-assembly.jar"
  Copy-Item -LiteralPath $jar.FullName -Destination $out -Force
  Write-Host "Built release asset:"
  Write-Host "  $out"
} finally {
  Pop-Location
}
