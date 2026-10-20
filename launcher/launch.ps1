Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "   Launching ANY3D Slicer (Anycubic Kobra 2 Calibrated) " -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Cyan

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location (Join-Path $scriptDir "..")

node launcher\launcher.js
