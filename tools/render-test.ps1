# ============================================================================
# tools/render-test.ps1 -- headless render test for the static site
# ----------------------------------------------------------------------------
# This file is intentionally ASCII-only so that it runs correctly no matter
# which encoding Windows PowerShell picks. All Chinese text lives in the
# UTF-8 data file tools/render-checks.json, which is read with -Encoding UTF8.
#
# Usage (from the website root):
#     powershell -ExecutionPolicy Bypass -File tools/render-test.ps1
#     powershell -ExecutionPolicy Bypass -File tools/render-test.ps1 -Base http://localhost:8788
#
# -Base is optional. Without it the pages are opened from disk (offline mode).
# With it the pages are opened through the local dev server (online mode),
# which also exercises the real API.
#
# What it does: opens every page in headless Microsoft Edge, dumps the
# rendered DOM, and checks that the parts produced by JavaScript are present
# and that the browser console reported no JavaScript errors.
# ============================================================================
param(
  [string]$Root = (Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)),
  [string]$Base = ''
)

$ErrorActionPreference = 'Stop'

$edge = 'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
if (-not (Test-Path $edge)) { $edge = 'C:\Program Files\Microsoft\Edge\Application\msedge.exe' }
if (-not (Test-Path $edge)) {
  Write-Output 'ERROR: Microsoft Edge was not found; cannot run the render test.'
  exit 2
}

$outDir = Join-Path $Root 'tools\_render'
if (Test-Path $outDir) { Remove-Item -Recurse -Force $outDir }
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

if ($Base) {
  $modeLabel = 'online mode via ' + $Base
} else {
  $modeLabel = 'offline mode (file://)'
}
Write-Output ('Render test - ' + $modeLabel)
Write-Output ''

$checksFile = Join-Path $Root 'tools\render-checks.json'
$checks = Get-Content -LiteralPath $checksFile -Raw -Encoding UTF8 | ConvertFrom-Json

$pass = 0
$fail = 0
$report = New-Object System.Collections.Generic.List[string]

foreach ($c in $checks) {
  $rel = $c.file
  $safe = ($rel -replace '[\\/]', '_')
  $domFile = Join-Path $outDir ($safe + '.dom.txt')
  $logFile = Join-Path $outDir ($safe + '.log.txt')
  $profile = Join-Path $outDir ('profile-' + [System.IO.Path]::GetFileNameWithoutExtension($rel))
  if ($Base) {
    $url = ($Base.TrimEnd('/')) + '/' + ($rel -replace '\\', '/')
  } else {
    $url = 'file:///' + ($Root -replace '\\', '/') + '/' + ($rel -replace '\\', '/')
  }

  # The site deliberately blocks headless user agents on the server side,
  # so the test has to present a normal browser UA to reach the API.
  # The value must keep its embedded quotes, otherwise Start-Process splits it.
  $ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'

  $argList = @(
    '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
    '--disable-extensions', '--disable-background-networking', '--mute-audio',
    '--allow-file-access-from-files',
    ('--user-agent="' + $ua + '"'),
    "--user-data-dir=$profile",
    '--virtual-time-budget=8000',
    '--enable-logging=stderr', '--log-level=0',
    '--dump-dom', $url
  )

  Start-Process -FilePath $edge -ArgumentList $argList `
    -RedirectStandardOutput $domFile -RedirectStandardError $logFile -Wait -NoNewWindow

  $dom = ''
  if (Test-Path $domFile) { $dom = Get-Content $domFile -Raw -Encoding UTF8 }
  $log = ''
  if (Test-Path $logFile) { $log = Get-Content $logFile -Raw -Encoding UTF8 }

  $problems = @()

  if ([string]::IsNullOrWhiteSpace($dom)) {
    $problems += 'DOM output is empty - the page did not render.'
  } else {
    foreach ($m in $c.must) {
      if ($dom -notlike ('*' + $m + '*')) { $problems += ('missing expected content: ' + $m) }
    }
    foreach ($m in $c.mustNot) {
      if ($dom -like ('*' + $m + '*')) { $problems += ('found forbidden content: ' + $m) }
    }
  }

  if ($log) {
    $matches = [regex]::Matches($log, '(?m)^.*(Uncaught|ERROR:CONSOLE|SyntaxError|TypeError|ReferenceError).*$')
    foreach ($m in $matches) {
      $line = $m.Value.Trim()
      if ($line.Length -gt 200) { $line = $line.Substring(0, 200) }
      $problems += ('console error: ' + $line)
    }
  }

  if ($problems.Count -eq 0) {
    $pass++
    $line = '  [OK]   ' + $rel
    Write-Output $line
    $report.Add($line)
  } else {
    $fail++
    $line = '  [FAIL] ' + $rel
    Write-Output $line
    $report.Add($line)
    foreach ($p in $problems) {
      Write-Output ('         - ' + $p)
      $report.Add('         - ' + $p)
    }
  }
}

$summary = 'Render test: ' + $pass + ' passed, ' + $fail + ' failed.'
Write-Output ''
Write-Output $summary
$report.Add('')
$report.Add($summary)
$report.Add('Raw DOM and logs: ' + $outDir)

$reportFile = Join-Path $outDir 'report.txt'
[System.IO.File]::WriteAllLines($reportFile, $report, (New-Object System.Text.UTF8Encoding($false)))
Write-Output ('Report written to: ' + $reportFile)

if ($fail -gt 0) { exit 1 } else { exit 0 }
