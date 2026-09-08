@echo off
title CodeLearn Quick Start

cd /d "%~dp0"

echo ===================================================
echo             CodeLearn - Quick Start
echo ===================================================
echo.

REM 1. Check Node.js
where node >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/ before running this script.
    echo.
    pause
    exit /b 1
)

REM 2. Check and install pnpm if needed
where pnpm >nul 2>nul
if errorlevel 1 goto :install_pnpm
goto :pnpm_ok

:install_pnpm
echo [!] pnpm is not found on your system.
echo [*] Installing pnpm globally via npm...
call npm install -g pnpm
if errorlevel 1 (
    echo [ERROR] Failed to install pnpm automatically.
    echo Please try installing it manually with: npm install -g pnpm
    echo.
    pause
    exit /b 1
)
if exist "%APPDATA%\npm" set "PATH=%APPDATA%\npm;%PATH%"
where pnpm >nul 2>nul
if errorlevel 1 (
    echo [!] pnpm was installed, but was not detected in the current PATH.
    echo Please restart your terminal/system and run start.bat again.
    echo.
    pause
    exit /b 1
)
echo [+] pnpm successfully installed!
echo.

:pnpm_ok
REM 3. Check .env file
if not exist ".env" (
    echo [!] .env not found. Creating from .env.example...
    copy ".env.example" ".env" >nul
    echo [+] .env created.
    echo.
)

REM 4. Install dependencies
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

REM 5. Start services in separate windows
echo.
echo ===================================================
echo [3/4] Starting Backend (http://localhost:7777)...
start "CodeLearn Backend" cmd /k "cd /d "%~dp0backend" && pnpm dev:back"

echo [4/4] Starting Frontend (http://localhost:3000)...
start "CodeLearn Frontend" cmd /k "cd /d "%~dp0frontend" && pnpm dev"

REM 6. Open browser
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