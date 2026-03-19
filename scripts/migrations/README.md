# Миграция поля `streak` в коллекции `user`

## Описание

Скрипт преобразует поле `streak` из простого числа в объект:

**До:**
```javascript
{ streak: 5 }
```

**После:**
```javascript
{
  streak: {
    count: 5,
    isFire: false,
    updateAt: new Date()
  }
}
```

## Требования

- Node.js 18+
- MongoDB 4.4+
- Доступ к базе данных

## Установка

```bash
# Перейдите в директорию миграций
cd scripts/migrations

# Установите зависимости
pnpm install
# или
npm install
# или
yarn install
```

## Настройка

1. Создайте файл `.env` на основе `.env.example`:
```bash
cp .env.example .env
```

2. Отредактируйте `.env`, указав ваши параметры:
```env
MONGODB_URI=mongodb://localhost:27017
DATABASE_NAME=test
```

Для MongoDB Atlas:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/?retryWrites=true&w=majority
DATABASE_NAME=test
```

## Запуск

### Применение миграции
```bash
pnpm migrate
# или
npm run migrate
```

### Откат миграции
```bash
pnpm rollback
# или
npm run rollback
```

### Тестовый запуск (без изменений)
```bash
pnpm dry-run
# или
npm run dry-run
```

### Прямой запуск через tsx
```bash
npx tsx scripts/migrations/migrate-streak-field.ts migrate
npx tsx scripts/migrations/migrate-streak-field.ts rollback
```

## Вывод скрипта

```
==================================================
MONGODB STREAK MIGRATION
==================================================
Команда: migrate
URI: mongodb://localhost:27017
DB: test
Collection: user
==================================================
✅ Подключено к MongoDB: mongodb://localhost:27017
📊 База данных: test

🚀 Запуск миграции поля streak...

📋 Найдено документов: 150
⏭️  Пропущен документ 507f1f77bcf86cd799439011: streak уже объект
⏭️  Пропущен документ 507f1f77bcf86cd799439012: streak не число и не объект (undefined)

📊 Результат пакетной операции: { modifiedCount: 148, matchedCount: 148 }

✅ Миграция завершена

==================================================
📈 СТАТИСТИКА
==================================================
Всего документов:    150
Обновлено:           148
Пропущено:           2
Ошибок:              0
==================================================

🔌 Подключение закрыто
```

## Структура скрипта

| Метод | Описание |
|-------|----------|
| `connect()` | Подключение к MongoDB |
| `migrate()` | Применение миграции |
| `rollback()` | Откат миграции |
| `disconnect()` | Закрытие подключения |

## Особенности

- ✅ **Проверка типа**: Обновляются только документы, где `streak` — число
- ✅ **Идемпотентность**: Повторный запуск не ломает уже migrated документы
- ✅ **Пакетная операция**: `bulkWrite` для производительности
- ✅ **Логирование**: Подробный вывод процесса и статистики
- ✅ **Обработка ошибок**: Try/catch на уровне каждого документа
- ✅ **Откат**: Возможность вернуть исходный формат

## Безопасность

1. **Сделайте бэкап перед запуском:**
```bash
mongodump --uri="mongodb://localhost:27017" --db=test --collection=user --out=./backup
```

2. **Восстановление из бэкапа:**
```bash
mongorestore --uri="mongodb://localhost:27017" ./backup/test/user
```

3. **Запустите dry-run** для проверки:
```bash
npm run dry-run
```

## Troubleshooting

### Ошибка подключения
```
MongoServerError: Authentication failed
```
→ Проверьте `MONGODB_URI` в `.env`

### Коллекция не найдена
```
Error: Namespace not found
```
→ Убедитесь, что `DATABASE_NAME` и коллекция `user` существуют

### Таймаут подключения
```
MongoServerSelectionError: connection timed out
```
→ Проверьте доступность MongoDB сервера

## Лицензия

MIT
