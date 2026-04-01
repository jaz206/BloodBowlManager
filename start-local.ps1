param(
    [string]$DevHost = "127.0.0.1",
    [int]$Port = 5173
)

$ErrorActionPreference = "Stop"
$projectRoot = $PSScriptRoot

if (-not (Test-Path (Join-Path $projectRoot "package.json"))) {
    throw "No se ha encontrado package.json en $projectRoot"
}

Write-Host "Iniciando BloodBowlManager en http://$DevHost`:$Port ..." -ForegroundColor Yellow

Start-Process -FilePath "powershell.exe" -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location '$projectRoot'; npm run dev -- --host $DevHost --port $Port"
)

Start-Sleep -Seconds 3
Start-Process "http://$DevHost`:$Port"
