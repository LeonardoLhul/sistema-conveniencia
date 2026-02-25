@echo off
REM Script para iniciar Backend e Frontend
REM Simplesmente dê clique duplo neste arquivo

setlocal enabledelayedexpansion
cd /d "%~dp0"

echo.
echo ======================================
echo   🚀 Sistema Conveniência
echo ======================================
echo.

REM Iniciar Backend em nova janela
echo Iniciando Backend (Python)...
start "Backend - Flask" cmd /k "cd backend && venv\Scripts\activate && python app.py"

REM Aguardar 3 segundos
timeout /t 3 /nobreak

REM Iniciar Frontend em nova janela
echo Iniciando Frontend (React)...
start "Frontend - Vite" cmd /k "cd frontend && npm run dev"

REM Aguardar 5 segundos
timeout /t 5 /nobreak

REM Abrir navegador
echo.
echo ✅ Sistema iniciado!
echo.
echo   Backend:  http://localhost:5000
echo   Frontend: http://localhost:5173
echo.
start http://localhost:5173

echo Pressione qualquer tecla para fechar...
pause
