# 🎓 CodeLearn — Интерактивная платформа для обучения

**CodeLearn** — это современная LMS (Learning Management System), предназначенная для создания и прохождения интерактивных IT-курсов. Сервис позволяет авторам гибко настраивать учебные программы, а студентам — эффективно учиться с отслеживанием прогресса.

## 🚀 Основные возможности

### 🛠 Мощный редактор курсов
- **Структура курса:** Создание секций и уроков с помощью интуитивного Drag-and-Drop интерфейса.
- **Блочный конструктор конспекта:** Уроки собираются из различных блоков:
    - **Текст (Markdown):** Удобный редактор TipTap с поддержкой форматирования и Slash-команд.
    - **Видео:** Интеграция видео с YouTube, Vimeo или прямых ссылок.
    - **Тесты:** Создание проверочных заданий с одиночным, множественным выбором или текстовым ответом.
- **Управление доступом:** Возможность публиковать курсы, открывать набор и устанавливать стоимость.

### 📈 Личный кабинет и прогресс
- **Трекинг обучения:** Визуальное отображение прогресса по каждому курсу и блоку.
- **Система "Стриков":** Мотивация студента через ежедневную активность (огненный индикатор).
- **Сертификация:** Автоматическая генерация PDF-сертификата после успешного завершения курса.

### 🛡 Админ-панель
- Управление пользователями (назначение ролей: студент/админ).
- Редактирование тегов для категоризации курсов.
- Мониторинг записей на курсы.

## 🛠 Технологический стек

### Frontend
- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS
- **State:** React Context API + Lucide Icons
- **Editor:** TipTap (Rich Text) + @dnd-kit (Drag & Drop)
- **Local DB:** Dexie.js (IndexedDB) для черновиков

### Backend
- **Runtime:** Node.js + Express
- **Language:** TypeScript
- **Database:** MongoDB (Mongoose)
- **Auth:** Better-Auth (Session-based)

---

## ⚙️ Запуск проекта

### 1. Предварительные требования
- Установленная **MongoDB** (локально или Atlas).
- **Node.js** (версия 18+).
- Менеджер пакетов **pnpm** (рекомендуется) или npm.

### 2. Настройка окружения
В корне проекта создайте единый файл `.env` на основе примера `.env.example`. **Важно:** не выкладывайте реальные ключи в репозиторий!

**Корень проекта (`.env`):**
```env
# Backend
PORT=7777
HOST=0.0.0.0
NODE_ENV=development

# Database
DB_URL=mongodb://localhost:27017/courses-project
BETTER_AUTH_SECRET=ваш_секрет

# CORS
CORS_ORIGIN=http://localhost:3000

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:7777/api
NEXT_PUBLIC_BACKEND_URL=http://localhost:7777

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. Установка зависимостей
```bash
# Из корня проекта
cd backend && pnpm install
cd ../frontend && pnpm install
```

### 4. Запуск в режиме разработки
**Запуск Backend:**
```bash
cd backend
pnpm run dev
```

**Запуск Frontend:**
```bash
cd frontend
pnpm run dev
```
После запуска фронтенд будет доступен по адресу `http://localhost:3000`.

- **sanek5648**
- **AdrianoMajestic**
- **Nilmkey**

