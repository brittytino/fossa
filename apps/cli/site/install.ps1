param(
    [string]$TeamKey
)

$ErrorActionPreference = "Stop"

function Write-Header([string]$Message) {
    Write-Host $Message -ForegroundColor Cyan
}

function Write-Step([string]$Message) {
    Write-Host "-> $Message" -ForegroundColor Yellow
}

function Write-Success([string]$Message) {
    Write-Host "OK $Message" -ForegroundColor Green
}

function Test-IsWindows {
    if (Get-Variable IsWindows -ErrorAction SilentlyContinue) {
        return [bool]$IsWindows
    }

    return $env:OS -eq 'Windows_NT'
}

function Get-NpmBin {
    try {
        $npmBin = (& npm bin -g).Trim()
        if ($npmBin) {
            return $npmBin
        }
    }
    catch {
    }

    $prefix = (& npm prefix -g).Trim()
    if (Test-IsWindows) {
        return $prefix
    }

    return (Join-Path $prefix 'bin')
}

function Get-FossaExecutableName {
    if (Test-IsWindows) {
        return 'fossa.cmd'
    }

    return 'fossa'
}

function Resolve-FossaCommand {
    $command = Get-Command fossa -ErrorAction SilentlyContinue
    if ($command) {
        return $command.Source
    }

    $npmBin = Get-NpmBin
    $candidate = Join-Path $npmBin (Get-FossaExecutableName)
    if (Test-Path $candidate) {
        return $candidate
    }

    throw 'Unable to find fossa after installation. Open a new terminal and try again.'
}

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    throw 'npm is required but was not found. Install Node.js from https://nodejs.org and run again.'
}

Write-Header 'Fossa CLI installer (PowerShell)'
Write-Step 'Installing or updating @fossa/cli'
& npm install -g @fossa/cli | Out-Host

$npmBin = Get-NpmBin
$pathSeparator = [System.IO.Path]::PathSeparator
$pathEntries = $env:Path -split [System.Text.RegularExpressions.Regex]::Escape([string]$pathSeparator)
if (-not ($pathEntries | Where-Object { $_ -eq $npmBin })) {
    $env:Path = "$npmBin$pathSeparator$env:Path"
}

$fossa = Resolve-FossaCommand
$version = (& $fossa --version).Trim()
Write-Success "Fossa CLI ready ($version)"

if ($TeamKey) {
    Write-Step 'Authenticating with team key'
    & $fossa auth team-key --key $TeamKey | Out-Host
    Write-Success 'Authenticated successfully'
}

Write-Step 'Installing bundled Fossa skills into detected agent roots'
& $fossa skills install | Out-Host
Write-Success 'Bundled skills installed'
