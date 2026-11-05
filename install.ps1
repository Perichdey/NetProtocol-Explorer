# NetProtocol Explorer - Instalador Automatizado para Nova Maquina
$ErrorActionPreference = "Stop"
$PSScriptRoot = Split-Path -Parent -Path $MyInvocation.MyCommand.Definition
Set-Location $PSScriptRoot

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  NetProtocol Explorer - Assistente de Instalacao         " -ForegroundColor White
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Verificar Wireshark / TShark
Write-Host "`n[1/4] Verificando instalacao do Wireshark / TShark..." -ForegroundColor Cyan
$TsharkDefault = "C:\Program Files\Wireshark\tshark.exe"
$TsharkPathCmd = Get-Command "tshark" -ErrorAction SilentlyContinue

if (Test-Path $TsharkDefault) {
    Write-Host "  [OK] TShark encontrado em: $TsharkDefault" -ForegroundColor Green
} elseif ($TsharkPathCmd) {
    Write-Host "  [OK] TShark encontrado no PATH: $($TsharkPathCmd.Source)" -ForegroundColor Green
} else {
    Write-Host "  [AVISO] TShark nao encontrado no caminho padrao!" -ForegroundColor Yellow
    Write-Host "  Por favor, instale o Wireshark (incluindo TShark e Npcap) em https://www.wireshark.org/download.html" -ForegroundColor Yellow
}

# 2. Localizar Python 3.10+
Write-Host "`n[2/4] Verificando ambiente Python..." -ForegroundColor Cyan
$PythonCmd = $null
if (Get-Command "py" -ErrorAction SilentlyContinue) {
    $PythonCmd = "py"
} elseif (Get-Command "python" -ErrorAction SilentlyContinue) {
    $PythonCmd = "python"
} else {
    Write-Host "  [ERRO] Python nao encontrado! Instale o Python 3.10+ em https://www.python.org/downloads/ (marque 'Add Python to PATH')." -ForegroundColor Red
    exit 1
}

$PyVer = & $PythonCmd --version
Write-Host "  [OK] Python detectado: $PyVer" -ForegroundColor Green

# 3. Criar Ambiente Virtual (.venv) e instalar dependencias
Write-Host "`n[3/4] Configurando ambiente virtual (.venv) e bibliotecas..." -ForegroundColor Cyan
$VenvPython = Join-Path $PSScriptRoot ".venv\Scripts\python.exe"

if (-not (Test-Path $VenvPython)) {
    & $PythonCmd -m venv .venv
}

& $VenvPython -m pip install --upgrade pip
& $VenvPython -m pip install -r requirements.txt
Write-Host "  [OK] Dependencias Python instaladas com sucesso." -ForegroundColor Green

# 4. Verificar Frontend Compilado (frontend/dist) ou Recompilar se Node.js estiver presente
Write-Host "`n[4/4] Verificando interface grafica (Frontend)..." -ForegroundColor Cyan
$DistIndex = Join-Path $PSScriptRoot "frontend\dist\index.html"

if (Test-Path $DistIndex) {
    Write-Host "  [OK] Bundle de producao (frontend/dist) ja esta compilado e pronto para uso!" -ForegroundColor Green
} elseif (Get-Command "npm" -ErrorAction SilentlyContinue) {
    Write-Host "  [*] Compilando frontend via Node.js / NPM..." -ForegroundColor Yellow
    Push-Location (Join-Path $PSScriptRoot "frontend")
    npm install
    npm run build
    Pop-Location
    Write-Host "  [OK] Frontend compilado com sucesso!" -ForegroundColor Green
} else {
    Write-Host "  [AVISO] Pasta frontend/dist nao encontrada e Node.js nao instalado." -ForegroundColor Yellow
    Write-Host "  Instale o Node.js LTS (https://nodejs.org) ou copie a pasta com 'frontend/dist' ja compilada." -ForegroundColor Yellow
}

Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host "  INSTALACAO CONCLUIDA COM SUCESSO!                       " -ForegroundColor Green
Write-Host "  Para iniciar o sistema, execute: .\start.bat ou .\start.ps1" -ForegroundColor White
Write-Host "==========================================================" -ForegroundColor Cyan
