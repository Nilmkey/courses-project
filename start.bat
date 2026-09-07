@echo off
title CodeLearn Quick Start

cd /d "%~dp0"

echo ===================================================
echo             CodeLearn - Quick Start
echo ===================================================
echo.

REM 1. Check .env file
if not exist ".env" (
    echo [!] .env not found. Creating from .env.example...
    copy ".env.example" ".env" >nul
    echo [+] .env created.
    echo.
)

REM 2. Install dependencies
echo [1/4] Installing backend dependencies (pnpm install)...
cd /d "%~dp0backend"
call pnpm install
if %errorlevel% neq 0 (
    echo [ERROR] Backend pnpm install failed!
    pause
    exit /b %errorlevel%
)

echo.
echo [2/4] Installing frontend dependencies (pnpm install)...
cd /d "%~dp0frontend"
call pnpm install
if %errorlevel% neq 0 (
    echo [ERROR] Frontend pnpm install failed!
    pause
    exit /b %errorlevel%
)

REM 3. Start services in separate windows
echo.
echo ===================================================
echo [3/4] Starting Backend (http://localhost:7777)...
start "CodeLearn Backend" cmd /k "cd /d "%~dp0backend" && pnpm dev:back"

echo [4/4] Starting Frontend (http://localhost:3000)...
start "CodeLearn Frontend" cmd /k "cd /d "%~dp0frontend" && pnpm dev"

REM 4. Open browser
echo.
echo Waiting for servers to initialize...
ping 127.0.0.1 -n 5 >nul
start http://localhost:3000

echo.
echo ===================================================
echo  [OK] Services started successfully!
echo  - Frontend: http://localhost:3000
echo  - Backend:  http://localhost:7777
echo ===================================================
echo.
exit /b 0