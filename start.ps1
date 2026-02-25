# Script para iniciar Backend e Frontend simultaneamente
# Clique direito neste arquivo > "Run with PowerShell"
# Se der erro de permissão, execute: Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendPath = Join-Path $projectRoot "backend"
$frontendPath = Join-Path $projectRoot "frontend"

Write-Host "🚀 Iniciando Sistema Conveniência..." -ForegroundColor Green
Write-Host "Backend: $backendPath" -ForegroundColor Cyan
Write-Host "Frontend: $frontendPath" -ForegroundColor Cyan

# Iniciar Backend em nova janela
Write-Host "`n▶️  Iniciando Backend (Python)..." -ForegroundColor Yellow
$backendScript = @"
cd '$backendPath'
if (!(Test-Path 'venv')) {
    Write-Host 'Criando virtual environment...' -ForegroundColor Yellow
    python -m venv venv
}
. .\venv\Scripts\Activate.ps1
Write-Host 'Instalando dependências...' -ForegroundColor Yellow
pip install -r requirements.txt -q
Write-Host 'Iniciando servidor Flask...' -ForegroundColor Green
python app.py
"@

Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendScript

# Aguardar backend iniciar
Start-Sleep -Seconds 3

# Iniciar Frontend em nova janela
Write-Host "`n▶️  Iniciando Frontend (React)..." -ForegroundColor Yellow
$frontendScript = @"
cd '$frontendPath'
Write-Host 'Instalando dependências...' -ForegroundColor Yellow
npm install -q
Write-Host 'Iniciando Vite dev server...' -ForegroundColor Green
npm run dev
"@

Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendScript

# Aguardar frontend iniciar
Start-Sleep -Seconds 5

# Abrir navegador
Write-Host "`n✅ Sistema iniciado!" -ForegroundColor Green
Write-Host "   Backend:  http://localhost:5000" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "   Abrindo navegador..." -ForegroundColor Yellow

Start-Process "http://localhost:5173"

Write-Host "`n✋ Pressione Ctrl+C em cada janela para encerrar" -ForegroundColor Gray
Read-Host "Pressione Enter para fechar este script"
