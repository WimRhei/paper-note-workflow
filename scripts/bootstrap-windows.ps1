param(
  [string]$Repo = "",
  [string]$Pdffigures2JarUrl = $env:PAPER_NOTE_DRAFTER_PDFFIGURES2_JAR_URL,
  [switch]$Force
)

$ErrorActionPreference = "Stop"

function New-Directory {
  param([Parameter(Mandatory = $true)][string]$Path)
  if (-not (Test-Path -LiteralPath $Path)) {
    New-Item -ItemType Directory -Path $Path | Out-Null
  }
}

function Get-GitHubLatestAssetUrl {
  param(
    [Parameter(Mandatory = $true)][string]$Repository,
    [Parameter(Mandatory = $true)][string]$Pattern
  )

  $apiUrl = "https://api.github.com/repos/$Repository/releases/latest"
  $release = Invoke-RestMethod -Uri $apiUrl -Headers @{ "User-Agent" = "paper-note-drafter-bootstrap" }
  $asset = $release.assets | Where-Object { $_.name -like $Pattern } | Select-Object -First 1
  if (-not $asset) {
    throw "No GitHub release asset matching '$Pattern' found in $Repository latest release."
  }
  return $asset.browser_download_url
}

function Resolve-GitHubRepoFromOrigin {
  $git = Get-Command git -ErrorAction SilentlyContinue
  if (-not $git) {
    return ""
  }

  $origin = ""
  try {
    $origin = git -C $skillRoot remote get-url origin 2>$null
  } catch {
    return ""
  }

  if ($origin -match "github\.com[:/](?<owner>[^/]+)/(?<repo>[^/.]+)(\.git)?$") {
    return "$($Matches.owner)/$($Matches.repo)"
  }
  return ""
}

function Save-File {
  param(
    [Parameter(Mandatory = $true)][string]$Url,
    [Parameter(Mandatory = $true)][string]$Path
  )
  Write-Host "Downloading $Url"
  Invoke-WebRequest -Uri $Url -OutFile $Path -Headers @{ "User-Agent" = "paper-note-drafter-bootstrap" }
}

$skillRoot = Split-Path -Parent $PSScriptRoot
$toolsRoot = Join-Path $skillRoot ".tools"
$downloads = Join-Path $toolsRoot "downloads"
$bin = Join-Path $toolsRoot "bin"
$popplerRoot = Join-Path $toolsRoot "poppler"
$pdffiguresRoot = Join-Path $toolsRoot "pdffigures2"

New-Directory $toolsRoot
New-Directory $downloads
New-Directory $bin
New-Directory $popplerRoot
New-Directory $pdffiguresRoot

$popplerZip = Join-Path $downloads "poppler-windows.zip"
$pdftotextCmd = Join-Path $bin "pdftotext.cmd"

if ($Force -or -not (Test-Path -LiteralPath $pdftotextCmd)) {
  $popplerUrl = Get-GitHubLatestAssetUrl -Repository "oschwartz10612/poppler-windows" -Pattern "*Release*.zip"
  Save-File -Url $popplerUrl -Path $popplerZip

  if (Test-Path -LiteralPath $popplerRoot) {
    Remove-Item -LiteralPath $popplerRoot -Recurse -Force
  }
  New-Directory $popplerRoot
  Expand-Archive -LiteralPath $popplerZip -DestinationPath $popplerRoot -Force

  $pdftotextExe = Get-ChildItem -LiteralPath $popplerRoot -Recurse -Filter "pdftotext.exe" | Select-Object -First 1
  if (-not $pdftotextExe) {
    throw "Downloaded Poppler package did not contain pdftotext.exe."
  }

  $pdftotextCmdText = "@echo off`r`n`"$($pdftotextExe.FullName)`" %*`r`n"
  Set-Content -LiteralPath $pdftotextCmd -Value $pdftotextCmdText -Encoding ASCII
}

$java = Get-Command java -ErrorAction SilentlyContinue
if (-not $java) {
  throw "Java was not found on PATH. Install a JRE/JDK, then rerun this script."
}

$jarPath = Join-Path $pdffiguresRoot "pdffigures2-assembly.jar"
if ($Force -or -not (Test-Path -LiteralPath $jarPath)) {
  if (-not $Pdffigures2JarUrl) {
    if (-not $Repo) {
      $Repo = Resolve-GitHubRepoFromOrigin
    }
    if (-not $Repo) {
      throw "Provide -Repo owner/repo for this skill's GitHub release, or set PAPER_NOTE_DRAFTER_PDFFIGURES2_JAR_URL to a pdffigures2 assembly jar URL."
    }
    $Pdffigures2JarUrl = Get-GitHubLatestAssetUrl -Repository $Repo -Pattern "pdffigures2*assembly*.jar"
  }
  Save-File -Url $Pdffigures2JarUrl -Path $jarPath
}

$pdffiguresCmd = Join-Path $bin "pdffigures2.cmd"
$pdffiguresCmdText = "@echo off`r`njava -jar `"$jarPath`" %*`r`n"
Set-Content -LiteralPath $pdffiguresCmd -Value $pdffiguresCmdText -Encoding ASCII

Write-Host ""
Write-Host "Installed local wrappers:"
Write-Host "  $pdftotextCmd"
Write-Host "  $pdffiguresCmd"
Write-Host ""
Write-Host "For this PowerShell session, run:"
Write-Host "  `$env:Path = '$bin;' + `$env:Path"
Write-Host ""
Write-Host "Then verify:"
Write-Host "  powershell -ExecutionPolicy Bypass -File .\scripts\verify-windows.ps1"
