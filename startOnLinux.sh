#!/usr/bin/env bash

# Определение директории скрипта
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR" || exit 1

echo "==================================================="
echo "            CodeLearn - Quick Start"
echo "==================================================="
echo

# 1. Проверка Node.js
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org/ before running this script."
    echo
    exit 1
fi

# 2. Проверка и установка pnpm
if ! command -v pnpm &> /dev/null; then
    echo "[!] pnpm is not found on your system."
    echo "[*] Installing pnpm globally via npm..."
    
    # Использование sudo при необходимости или обычный npm install
    if ! npm install -g pnpm; then
        echo "[ERROR] Failed to install pnpm automatically."
        echo "Please try installing it manually with: npm install -g pnpm (or with sudo)"
        echo
        exit 1
    fi

    # Обновление PATH в текущей сессии для обнаружения pnpm
    export PATH="$HOME/.local/share/pnpm:$PATH"
    
    if ! command -v pnpm &> /dev/null; then
        echo "[!] pnpm was installed, but was not detected in the current PATH."
        echo "Please restart your terminal session and run start.sh again."
        echo
        exit 1
    fi
    echo "[+] pnpm successfully installed!"
    echo
fi

# 3. Проверка .env файла
if [ ! -f ".env" ]; then
    echo "[!] .env not found. Creating from .env.example..."
    cp ".env.example" ".env"
    echo "[+] .env created."
    echo
fi

# 4. Установка зависимостей
echo "[1/4] Installing backend dependencies (pnpm install)..."
cd "$SCRIPT_DIR/backend" || exit 1
if ! pnpm install; then
    echo "[ERROR] Backend pnpm install failed!"
    exit 1
fi

echo
echo "[2/4] Installing frontend dependencies (pnpm install)..."
cd "$SCRIPT_DIR/frontend" || exit 1
if ! pnpm install; then
    echo "[ERROR] Frontend pnpm install failed!"
    exit 1
fi

# Функция запуска процесса в новом окне терминала (cross-platform для Unix)
run_in_new_terminal() {
    local title="$1"
    local command="$2"

    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS: открытие в Apple Terminal
        osascript -e "tell application \"Terminal\" to do script \"echo -n \\\"\\\\033]0;$title\\\\007\\\"; $command\"" > /dev/null
    elif command -v gnome-terminal &> /dev/null; then
        gnome-terminal --title="$title" -- bash -c "$command; exec bash"
    elif command -v xterm &> /dev/null; then
        xterm -T "$title" -e bash -c "$command; exec bash" &
    elif command -v konsole &> /dev/null; then
        konsole --new-tab -p tabtitle="$title" -e bash -c "$command; exec bash" &
    else
        # Запасной вариант: фоновый процесс
        echo "[!] Could not open separate terminal window. Running in background..."
        eval "$command" &
    fi
}

# 5. Запуск сервисов
echo
echo "==================================================="
echo "[3/4] Starting Backend (http://localhost:7777)..."
run_in_new_terminal "CodeLearn Backend" "cd \"$SCRIPT_DIR/backend\" && pnpm dev:back"

echo "[4/4] Starting Frontend (http://localhost:3000)..."
run_in_new_terminal "CodeLearn Frontend" "cd \"$SCRIPT_DIR/frontend\" && pnpm dev"

# 6. Открытие браузера
echo
echo "Waiting for servers to initialize..."
sleep 5

# Универсальное открытие URL
if command -v open &> /dev/null; then
    open "http://localhost:3000"         # macOS
elif command -v xdg-open &> /dev/null; then
    xdg-open "http://localhost:3000"     # Linux
fi

echo
echo "==================================================="
echo " [OK] Services started successfully!"
echo " - Frontend: http://localhost:3000"
echo " - Backend:  http://localhost:7777"
echo "==================================================="
echo
exit 0