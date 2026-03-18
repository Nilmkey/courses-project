# Streaks Implementation Report

## Обзор

Реализована фича **streaks** (огонёк за ежедневное прохождение уроков) для проекта courses-project.

## Логика стриков

| Время с последнего обновления | Действие |
|------------------------------|----------|
| < 24 часов | Не меняем `count`, обновляем `updatedAt` (защита от накрутки) |
| 24-48 часов | `count++`, `isFire = true` |
| > 48 часов | Стрик сгорает: `count = 1`, `isFire = true` (начинаем заново) |

Фронтенд вычисляет визуальное состояние на основе `updatedAt`.

---

## Созданные файлы

### 1. `backend/services/streak.service.ts`

**Назначение:** Сервис для управления стриками пользователей.

**Функции:**
- `extendStreak(userId: string, headers?: Headers): Promise<StreakObj>` — продление стрика при завершении урока
- `getStreak(userId: string, headers?: Headers): Promise<StreakObj>` — получение текущего стрика

**Ключевые особенности:**
- Получение данных пользователя через `auth.api.getSession({ headers })`
- Атомарное обновление стрика через `auth.api.updateUser()`
- Логирование всех операций через `console.log()`
- Обработка ошибок через `ApiError`
- Константы времени вынесены в отдельные переменные

**Строки кода:** ~140

---

### 2. `backend/api/v1/streak/streak.types.ts`

**Назначение:** Типы для API стриков.

**Экспортируемые типы:**
```typescript
interface GetStreakResponse extends StreakObj {
  hoursSinceUpdate?: number;
}

interface StreakErrorResponse {
  message: string;
}
```

---

### 3. `backend/api/v1/streak/streak.controller.ts`

**Назначение:** Контроллер для обработки HTTP-запросов.

**Эндпоинты:**
- `GET /api/v1/streak` — получить стрик текущего пользователя

**Функции:**
- `getStreak(req, res)` — возвращает `GetStreakResponse` с добавлением `hoursSinceUpdate`
- Преобразование headers из Express в `Headers` для better-auth

---

### 4. `backend/api/v1/streak/streak.router.ts`

**Назначение:** Роутер для стриков.

**Маршруты:**
```typescript
router.get("/", authMiddleware, streakController.getStreak)
```

---

### 5. `lib/api/entities/api-streak.ts`

**Назначение:** Frontend API клиент для работы со стриками.

**Функции:**
- `getStreak(): Promise<StreakResponse>` — GET запрос к `/v1/streak`

**Интерфейс:**
```typescript
interface StreakResponse {
  count: number;
  isFire: boolean;
  updatedAt: string;
  hoursSinceUpdate?: number;
}
```

---

### 6. `hooks/useStreak.ts`

**Назначение:** React-хук для получения и отображения стрика.

**Возвращаемое значение (`UseStreakResult`):**
```typescript
{
  count: number;           // Текущий стрик (дни)
  isFire: boolean;         // Активен ли огонёк
  updatedAt: Date | null;  // Дата последнего обновления
  hoursSinceUpdate: number;// Часов с последнего обновления
  isLoading: boolean;      // Загрузка
  error: Error | null;     // Ошибка
  status: "active" | "lost" | "none"; // Статус для UI
}
```

**Логика:**
- `useEffect` для загрузки данных при монтировании
- `useMemo` для вычисления визуального состояния
- Обработка ошибок через `useToast`

---

### 7. `components/StreakFire.tsx`

**Назначение:** Визуальный компонент отображения стрика.

**Props:**
```typescript
interface StreakFireProps {
  showCount?: boolean;  // Показывать количество дней
  size?: "sm" | "md" | "lg";
  className?: string;
}
```

**Визуальные состояния:**
| Статус | Описание | Визуал |
|--------|----------|--------|
| `active` | Стрик активен (< 48 ч) | Яркий огонёк 🔥, анимация `pulse` |
| `lost` | Стрик сгорел (> 48 ч) | Тусклый серый огонёк |
| `none` | Стрик не начат (count=0) | Контур огонька |

---

## Изменённые файлы

### 1. `backend/services/progress.service.ts`

**Изменения:**
- Добавлен импорт `streakService`
- В методе `markComplete()` добавлен параметр `headers?: Headers`
- После сохранения прогресса вызывается `streakService.extendStreak(studentId, headers)`
- Ошибка обновления стрика логируется, но не прерывает основной поток

**Строки:**
```typescript
// Строка 6: импорт
import { streakService } from "./streak.service";

// Строка 54: параметр headers
async markComplete(
  studentId: string,
  lessonId: string,
  courseId: string,
  headers?: Headers,
): Promise<IProgress | null>

// Строки 84-89: вызов
try {
  await streakService.extendStreak(studentId, headers);
} catch (error) {
  console.error("[Progress] Не удалось обновить стрик:", error);
}
```

---

### 2. `backend/api/v1/progress/progress.controller.ts`

**Изменения:**
- В методе `markComplete()` добавлено преобразование headers из Express в `Headers`
- Headers передаются в `progressService.markComplete()`

**Строки:**
```typescript
// Строки 64-75: преобразование headers
const headers = new Headers();
for (const [key, value] of Object.entries(req.headers)) {
  if (value) {
    if (Array.isArray(value)) {
      value.forEach(v => headers.append(key, v));
    } else {
      headers.append(key, value);
    }
  }
}

// Строки 77-81: вызов сервиса
const progress = await progressService.markComplete(
  authReq.user.id,
  lessonId,
  courseId,
  headers,
);
```

---

### 3. `backend/api/v1/index.ts`

**Изменения:**
- Добавлен импорт `streakRouter`
- Зарегистрирован роутер через `router.use("/streak", streakRouter)`

**Строки:**
```typescript
// Строка 10: импорт
import streakRouter from "./streak/streak.router";

// Строка 20: регистрация
router.use("/streak", streakRouter);
```

---

### 4. `backend/services/index.ts`

**Изменения:**
- Добавлен экспорт `streakService`

**Строка:**
```typescript
// Строка 6
export { streakService } from "./streak.service";
```

---

### 5. `app/(protected)/learn/[courseSlug]/sidebar/CourseSidebar.tsx`

**Изменения:**
- Добавлен импорт `StreakFire`
- В секцию статистики добавлен компонент стрика

**Строки:**
```typescript
// Строка 7: импорт
import { StreakFire } from "@/components/StreakFire";

// Строки 72-74: в JSX
<div className="mb-3">
  <StreakFire size="sm" showCount={true} />
</div>
```

---

### 6. `app/(public)/(auth)/profile/page.tsx`

**Изменения:**
- Исправлено использование `user.streak` → `user.streak.count`

**Строка:**
```typescript
// Строка 439
value={user?.streak.count || 0}
```

---

### 7. `components/ui/header-no-courses.tsx`

**Изменения:**
- Исправлено использование `user.streak` → `user.streak.count`

**Строки:**
```typescript
// Строка 95
className={`w-5 h-5 ${user.streak.count > 0 ? "text-orange-500 animate-pulse" : "text-orange-500"}`}

// Строка 98
{user.streak.count || 0}
```

---

## Интеграция

### Backend → Frontend поток данных

```
1. Пользователь завершает урок
   ↓
2. POST /v1/progress/lesson/:lessonId/complete
   ↓
3. progressController.markComplete() → headers → progressService.markComplete()
   ↓
4. progressService → streakService.extendStreak(userId, headers)
   ↓
5. streakService получает сессию через auth.api.getSession({ headers })
   ↓
6. Вычисляется новый стрик на основе времени последнего обновления
   ↓
7. Обновление streak в БД через auth.api.updateUser({ body: { streak }, headers })
   ↓
8. Frontend периодически опрашивает GET /v1/streak через useStreak
   ↓
9. StreakFire отображает актуальное состояние
```

---

## Production-ready аспекты

### Обработка ошибок
- Все сервисные методы обёрнуты в `try/catch`
- Бросаются `ApiError` с соответствующими статус-кодами
- Ошибки логируются через `console.error()`
- Ошибка обновления стрика в `progress.service` не прерывает основной поток

### Типизация TypeScript
- Все функции имеют явные типы возвращаемых значений
- Используется `StreakObj` из `backend/types.ts`
- Нет `any` типов (кроме session для совместимости с better-auth)

### Консистентный кодстайл
- Следует существующим паттернам проекта
- Именование файлов: `*.service.ts`, `*.controller.ts`, `*.router.ts`
- Структура API: `api/v1/<resource>/`

### MongoDB оптимизация
- Атомарные операции через `auth.api.updateUser()`
- Один запрос на получение и обновление стрика

### Логирование
- `[Streak]` префикс для логов сервиса
- `[Progress]` префикс для логов в progress.service
- Логи на фронтенде: `[useStreak]`

---

## Тестирование

### Ручные сценарии:

1. **Первый урок:**
   - Пройти первый урок → стрик должен стать `count = 1, isFire = true`

2. **Продление стрика (24-48 ч):**
   - Подождать 24+ часа, пройти урок → `count++`

3. **Защита от накрутки (< 24 ч):**
   - Пройти второй урок менее чем через 24 ч → `count` не меняется

4. **Сгорание стрика (> 48 ч):**
   - Подождать 48+ часов, пройти урок → `count = 1`

---

## Будущие улучшения

1. **Real-time обновления:** Использовать WebSocket/SSE для мгновенного обновления UI
2. **История стриков:** Сохранять историю максимальных серий
3. **Уведомления:** Напоминания о необходимости пройти урок
4. **Анимации:** Более сложные анимации при сгорании/продлении
5. **Кэширование:** SWR/React Query для оптимизации запросов

---

## Итоговая статистика

| Категория | Количество |
|-----------|------------|
| Создано файлов | 7 |
| Изменено файлов | 7 |
| Backend сервисы | 1 |
| API endpoints | 1 |
| React компоненты | 1 |
| React хуки | 1 |
| Общий объём | ~500 строк кода |

---

## API Reference

### GET /api/v1/streak

Получить стрик текущего пользователя.

**Headers:**
- `Cookie` — сессионная кука better-auth

**Response 200:**
```json
{
  "count": 5,
  "isFire": true,
  "updatedAt": "2026-03-17T10:30:00.000Z",
  "hoursSinceUpdate": 12.5
}
```

**Response 401:**
```json
{
  "message": "Требуется авторизация"
}
```

---

## Changelog

### v1.0.0 (2026-03-18)
- ✅ Создан сервис `streakService` с логикой продления стрика
- ✅ Интеграция в `progressService.markComplete()`
- ✅ Создан API endpoint `GET /api/v1/streak`
- ✅ Создан React хук `useStreak`
- ✅ Создан компонент `StreakFire`
- ✅ Интеграция в UI (CourseSidebar, profile page, header)
- ✅ TypeScript компиляция без ошибок
