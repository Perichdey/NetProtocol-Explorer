# NetProtocol Explorer - Inicializador Unificado
$ErrorActionPreference = "Stop"
$PSScriptRoot = Split-Path -Parent -Path $MyInvocation.MyCommand.Definition
Set-Location $PSScriptRoot

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "      NetProtocol Explorer - Plataforma de Redes          " -ForegroundColor White
Write-Host "==========================================================" -ForegroundColor Cyan

$PythonExe = Join-Path $PSScriptRoot ".venv\Scripts\python.exe"

if (-not (Test-Path $PythonExe)) {
    Write-Host "[!] Ambiente virtual .venv nao encontrado. Executando instalacao inicial..." -ForegroundColor Yellow
    & "$PSScriptRoot\install.ps1"
}

Write-Host "[*] Iniciando servidor NetProtocol Explorer na porta 8000..." -ForegroundColor Green
Write-Host "[*] Acesse em seu navegador: http://127.0.0.1:8000" -ForegroundColor Cyan
Write-Host "[*] Pressione Ctrl+C para encerrar o servidor." -ForegroundColor Gray

Start-Process "http://127.0.0.1:8000" -ErrorAction SilentlyContinue

& $PythonExe -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000
