# Руководство по API-запросам в Next.js

> Для junior-разработчиков. Объясняем просто, показываем на примерах.

---

## 1. Базовый API-клиент

### Зачем это нужно

Без базового клиента ты будешь писать один и тот же код в каждом компоненте:

```typescript
// В компоненте CourseList.tsx
const response = await fetch("http://localhost:7777/api/courses");
const data = await response.json();

// В компоненте CourseDetail.tsx
const response = await fetch("http://localhost:7777/api/courses/123");
const data = await response.json();
```

**Проблемы:**

- Если URL сервера изменится — нужно править в 10 местах
- Если нужно добавить токен авторизации — правим везде
- Если сервер "молчит" 5 минут — приложение зависнет (нет таймаута)
- Если сервер вернул ошибку 500 — приложение упадёт без красивого сообщения
- Код дублируется — нарушается принцип **DRY** (Don't Repeat Yourself)

### Аналогия из жизни

Представь, что ты каждый день ходишь в магазин за продуктами.

**Без базового клиента** — это как если бы ты каждый раз:

- Искал новый маршрут до магазина
- Каждый раз заново придумывал, что купить
- Не брал с собой деньги (забыл авторизацию)
- Ждал у закрытого магазина бесконечно (нет таймаута)

**С базовым клиентом** — это как если бы у тебя был:

- ✅ Один проверенный маршрут
- ✅ Список покупок (единый формат запросов)
- ✅ Кошелёк с деньгами (авторизация)
- ✅ Таймер: если магазин закрыт более 30 секунд — идёшь домой (таймаут)

### Готовый код

Создай файл `lib/api-client.ts`:

```typescript
// ============================================================
// БАЗОВЫЙ API КЛИЕНТ
// ============================================================
// Этот файл — "посредник" между твоим приложением и сервером.
// Все запросы к бэкенду должны идти через него.

// Базовый URL API — меняется в одном месте для всех окружений
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:7777/api";

// ============================================================
// ТИПЫ ДЛЯ ОБРАБОТКИ ОШИБОК
// ============================================================

export class ApiError extends Error {
  status: number;
  data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }
}

// ============================================================
// НАСТРОЙКИ ПО УМОЛЧАНИЮ
// ============================================================

const DEFAULT_TIMEOUT = 30000; // 30 секунд

const DEFAULT_HEADERS: HeadersInit = {
  "Content-Type": "application/json",
};

// ============================================================
// ФУНКЦИЯ ДЛЯ ПОЛУЧЕНИЯ ТОКЕНА АВТОРИЗАЦИИ
// ============================================================

function getAuthToken(): string | null {
  if (typeof document !== "undefined") {
    const cookies = document.cookie.split(";");
    const authCookie = cookies.find((cookie) =>
      cookie.trim().startsWith("auth-token="),
    );
    return authCookie ? authCookie.split("=")[1] : null;
  }
  return null;
}

// ============================================================
// ФУНКЦИЯ С ТАЙМАУТОМ
// ============================================================

function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = DEFAULT_TIMEOUT,
): Promise<Response> {
  const controller = new AbortController();
  const { signal } = controller;

  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  return fetch(url, { ...options, signal })
    .then((response) => {
      clearTimeout(timeoutId);
      return response;
    })
    .catch((error) => {
      clearTimeout(timeoutId);

      if (error.name === "AbortError") {
        throw new ApiError(
          `Request timeout: сервер не ответил за ${timeoutMs / 1000} секунд`,
          408,
        );
      }

      throw error;
    });
}

// ============================================================
// ОСНОВНАЯ ФУНКЦИЯ ЗАПРОСА
// ============================================================

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getAuthToken();

  const headers: HeadersInit = {
    ...DEFAULT_HEADERS,
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const fetchOptions: RequestInit = {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  };

  try {
    const response = await fetchWithTimeout(url, fetchOptions);

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: (await response.text()) || response.statusText };
      }

      throw new ApiError(
        errorData.message || `HTTP error: ${response.status}`,
        response.status,
        errorData,
      );
    }

    if (response.status === 204) {
      return undefined as T;
    }

    const data = await response.json();
    return data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new ApiError(
        "Не удалось подключиться к серверу. Проверьте интернет-соединение.",
        0,
      );
    }

    throw new ApiError(
      error instanceof Error ? error.message : "Неизвестная ошибка",
      0,
      error,
    );
  }
}

// ============================================================
// УДОБНЫЕ МЕТОДЫ ДЛЯ РАЗНЫХ ТИПОВ ЗАПРОСОВ
// ============================================================

export const api = {
  get: <T>(endpoint: string, options?: RequestInit) =>
    apiRequest<T>(endpoint, { ...options, method: "GET" }),

  post: <T>(endpoint: string, body?: unknown, options?: RequestInit) =>
    apiRequest<T>(endpoint, { ...options, method: "POST", body }),

  put: <T>(endpoint: string, body?: unknown, options?: RequestInit) =>
    apiRequest<T>(endpoint, { ...options, method: "PUT", body }),

  patch: <T>(endpoint: string, body?: unknown, options?: RequestInit) =>
    apiRequest<T>(endpoint, { ...options, method: "PATCH", body }),

  delete: <T>(endpoint: string, options?: RequestInit) =>
    apiRequest<T>(endpoint, { ...options, method: "DELETE" }),
};
```

### Как использовать

```typescript
// Где угодно в проекте:
import { api } from "@/lib/api-client";

// GET запрос
const courses = await api.get<Course[]>("/courses");

// POST запрос
const newCourse = await api.post<Course>("/courses", {
  title: "Новый курс",
  price: 9900,
});

// DELETE запрос
await api.delete(`/courses/${courseId}`);
```

### ❌ Как НЕ надо делать

```typescript
// ❌ ПЛОХО: Хардкод URL в каждом компоненте
async function getCourses() {
  const res = await fetch("http://localhost:7777/api/courses");
  return res.json();
}

// ❌ ПЛОХО: Нет обработки ошибок
async function getCourse(id: string) {
  const res = await fetch(`/api/courses/${id}`);
  return res.json();
}

// ❌ ПЛОХО: Нет таймаута
async function getSlowData() {
  return fetch("/api/slow-endpoint").then((r) => r.json());
}
```

---

## 2. Named Exports — почему это важно

### В чём проблема

**Default export** выглядит так:

```typescript
export default class ApiClient { ... }
import ApiClient from './api-client'; // без фигурных скобок
```

**Named exports** выглядит так:

```typescript
export class ApiClient { ... }
import { ApiClient } from './api-client'; // в фигурных скобках
```

**Проблемы default export:**

- Tree-shaking не работает — bundler не может определить, что ты используешь
- При импорте можно дать любое имя: `import Foo from './api-client'` — IDE не подскажет ошибку
- Нельзя импортировать несколько вещей из одного файла

### Аналогия

**Default export** — как комплексный обед:

- Получаешь всё сразу (суп, салат, главное, десерт)
- Не можешь выбрать только то, что хочешь
- Половина еды выбрасывается

**Named exports** — как меню à la carte:

- Заказываешь только то, что нужно
- Платишь только за выбранные блюда
- Ничего не пропадает

### ✅ Как правильно

```typescript
// lib/api-client.ts

// Именованные экспорты
export type ApiResponse<T> = {
  data: T;
  status: number;
};

export class ApiError extends Error { ... }

export const api = {
  get: <T>(endpoint: string) => { ... },
  post: <T>(endpoint: string, body: unknown) => { ... },
};

export const API_TIMEOUT = 30000;
```

```typescript
// Использование — импортируем только то, что нужно
import { api, type ApiResponse, ApiError } from "@/lib/api-client";

// IDE покажет точное название и тип
// Tree-shaking уберёт неиспользуемый код
// При рефакторинге IDE найдёт все использования
```

### ❌ Как НЕ надо

```typescript
// ❌ Default export
export default { ... }
import api from './api-client';      // Можно назвать как угодно
import foo from './api-client';      // Непонятно, что это
```

---

## 3. Типизация запросов и ответов

### Зачем это нужно

**Без типизации** ты работаешь вслепую:

```typescript
const course = await api.get("/courses/123");
console.log(course.name); // А есть ли поле name?
console.log(course.students); // А students — это массив или число?
console.log(course.foo); // TypeScript не предупредит об ошибке!
```

### Аналогия

**Без типизации** — как коробка без маркировки:

- Не знаешь, что внутри
- Не знаешь, хрупкое ли содержимое
- Открываешь и удивляешься (иногда неприятно)

**С типизацией** — как коробка с накладной:

- Знаешь точное содержимое
- Знаешь размеры и вес
- Если что-то не совпадает — узнаешь сразу

### Готовый код

Создай файл `types/course.ts`:

```typescript
export type Course = {
  id: string;
  title: string;
  description: string;
  price: number;
  instructorId: string;
  students: string[];
  createdAt: string;
  updatedAt: string;
  status: "draft" | "published" | "archived";
};

export type CreateCourseRequest = {
  title: string;
  description: string;
  price: number;
};

export type GetCoursesResponse = {
  courses: Course[];
  total: number;
  page: number;
  totalPages: number;
};
```

Используй в коде:

```typescript
import { api } from "@/lib/api-client";
import type { Course, GetCoursesResponse } from "@/types/course";

async function loadCourses() {
  const response = await api.get<GetCoursesResponse>("/courses");

  // ✅ TypeScript знает тип данных
  console.log(response.courses[0].title);
  console.log(response.total);

  // ❌ TypeScript предупредит об ошибке
  // console.log(response.foo); // Property 'foo' does not exist
}

async function createCourse(data: CreateCourseRequest) {
  const course = await api.post<CreateCourseRequest, Course>("/courses", data);
  console.log(course.id); // ✅ Знаем, что вернётся Course
}
```

### ❌ Как НЕ надо

```typescript
// ❌ any везде
async function getCourses(): Promise<any> {
  return fetch("/api/courses").then((r) => r.json());
}

// ❌ Частичная типизация
interface Course {
  id: string;
  title: string;
  // А где остальные поля?
}
```

---

## 4. Next.js: revalidate, tags, Server Actions

### revalidate — обновление кэша по времени

```typescript
// app/courses/page.tsx

// Данные обновляются каждые 60 секунд
export const revalidate = 60;

export default async function CoursesPage() {
  const courses = await api.get('/courses');
  return <div>...</div>;
}
```

Или через опцию `next`:

```typescript
const courses = await fetch(`${API_URL}/courses`, {
  next: {
    revalidate: 3600, // Обновлять раз в час
    tags: ["courses"], // Можно обновить вручную по тегу
  },
});
```

### tags — обновление кэша по событию

```typescript
// app/courses/page.tsx
const courses = await fetch('/api/courses', {
  next: { tags: ['courses'] }
});

// app/actions/courses.ts
'use server';

import { revalidateTag } from 'next/cache';

export async function createCourse(formData: FormData) {
  await api.post('/courses', { ... });

  // ✅ Все страницы с тегом 'courses' обновятся
  revalidateTag('courses');
}
```

### Server Actions для мутаций

```typescript
// app/actions/courses.ts
"use server";

import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";

export async function createCourse(formData: FormData) {
  const title = formData.get("title") as string;
  const price = Number(formData.get("price"));

  await api.post("/courses", { title, price });
  revalidateTag("courses");
  redirect("/courses");
}
```

Использование в форме:

```typescript
// components/course-form.tsx
'use client';

import { createCourse } from '@/app/actions/courses';

export function CourseForm() {
  return (
    <form action={createCourse}>
      <input name="title" placeholder="Название" />
      <input name="price" type="number" placeholder="Цена" />
      <button type="submit">Создать</button>
    </form>
  );
}
```

### ❌ Как НЕ надо

```typescript
// ❌ useEffect для загрузки данных в Server Component
export default async function CoursesPage() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    fetch('/api/courses').then(r => r.json()).then(setCourses);
  }, []);

  return <div>...</div>;
}
// Server Component не может использовать useState/useEffect!

// ❌ Нет revalidate — данные закэшируются навсегда
const courses = await fetch('/api/courses');
```

---

## 5. Структура папок

### Рекомендуемая структура

```
courses-project/
├── app/                          # Next.js маршруты
│   ├── (public)/                 # Публичные страницы
│   │   ├── courses/
│   │   │   ├── page.tsx          # /courses
│   │   │   └── [id]/
│   │   │       └── page.tsx      # /courses/:id
│   │   └── layout.tsx
│   │
│   ├── (protected)/              # Защищённые страницы
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   │
│   ├── actions/                  # Server Actions
│   │   ├── courses.ts
│   │   └── auth.ts
│   │
│   └── layout.tsx
│
├── components/
│   ├── ui/                       # Базовые компоненты
│   │   ├── button.tsx
│   │   └── input.tsx
│   │
│   ├── course/                   # Компоненты курсов
│   │   ├── course-card.tsx
│   │   └── course-list.tsx
│   │
│   └── layout/
│       ├── header.tsx
│       └── footer.tsx
│
├── lib/
│   ├── api-client.ts             # Базовый API клиент
│   ├── api/                      # API сервисы
│   │   ├── courses.ts
│   │   └── users.ts
│   │
│   └── utils.ts
│
├── types/
│   ├── api.ts                    # Базовые типы API
│   ├── course.ts                 # Типы для курсов
│   └── user.ts
│
├── hooks/
│   ├── use-courses.ts
│   └── use-auth.ts
│
└── contexts/
    └── auth-context.tsx
```

### Почему именно так

```typescript
// ✅ ХОРОШО: Страница только координирует
// app/courses/page.tsx
import { CourseList } from '@/components/course/course-list';
import { getCourses } from '@/lib/api/courses';

export default async function CoursesPage() {
  const courses = await getCourses();
  return <CourseList courses={courses} />;
}

// ❌ ПЛОХО: Вся логика в странице
export default async function CoursesPage() {
  // 200 строк кода с запросами, обработкой, рендерингом...
}
```

```typescript
// ✅ ХОРОШО: Компоненты по доменам
components/
├── ui/              # Переиспользуемые
├── course/          # Специфичные для курсов
└── layout/          # Лейауты

// ❌ ПЛОХО: Всё в кучу
components/
├── Card.tsx         # Какой Card?
├── List.tsx         # Список чего?
└── Form.tsx         # Форма для чего?
```

---

## 6. Обработка ошибок

### Уровни обработки

**Уровень 1: API клиент**

```typescript
// lib/api-client.ts
export class ApiError extends Error {
  status: number;
  data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.message || `HTTP ${response.status}`,
        response.status,
        errorData,
      );
    }

    return await response.json();
  } catch (error) {
    console.error("[API Error]", { endpoint, error });
    throw error;
  }
}
```

**Уровень 2: Server Actions**

```typescript
// app/actions/courses.ts
"use server";

type ActionResult<T> = {
  success: boolean;
  data?: T;
  error?: { code: string; message: string; field?: string };
};

export async function createCourse(
  prevState: unknown,
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  const title = formData.get("title") as string;

  if (!title || title.length < 3) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Название должно быть не менее 3 символов",
        field: "title",
      },
    };
  }

  try {
    const data = await api.post<{ id: string }>("/courses", { title });
    revalidateTag("courses");
    return { success: true, data };
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        success: false,
        error: { code: "API_ERROR", message: error.message },
      };
    }
    return {
      success: false,
      error: { code: "UNKNOWN_ERROR", message: "Что-то пошло не так" },
    };
  }
}
```

**Уровень 3: Клиентский компонент**

```typescript
// components/course-form.tsx
'use client';

import { useActionState } from 'react';
import { createCourse } from '@/app/actions/courses';
import { toast } from 'react-hot-toast';

export function CourseForm() {
  const [state, action, isPending] = useActionState(createCourse, null);

  useEffect(() => {
    if (state?.success) {
      toast.success('Курс создан!');
    } else if (state?.error) {
      toast.error(state.error.message);
    }
  }, [state]);

  return (
    <form action={action}>
      <input name="title" placeholder="Название" />
      {state?.error?.field === 'title' && (
        <span className="text-red-500">{state.error.message}</span>
      )}
      <button type="submit" disabled={isPending}>
        {isPending ? 'Создание...' : 'Создать'}
      </button>
    </form>
  );
}
```

### ❌ Как НЕ надо

```typescript
// ❌ Игнорирование ошибок
async function getCourses() {
  const response = await fetch('/api/courses');
  return response.json();
}

// ❌ Пустой catch
try {
  await api.post('/courses', data);
} catch (error) {
  // Пусто!
}

// ❌ alert() для ошибок
catch (error) {
  alert('Ошибка: ' + error.message);
}
```

---

## 7. Server vs Client Components

### Главное правило

```
Нужен ли интерактив (useState, useEffect, onClick)?
                    │
         ┌──────────┴──────────┐
         │                     │
        НЕТ                   ДА
         │                     │
         ▼                     ▼
┌─────────────────┐   ┌─────────────────┐
│ Server Component│   │ Client Component│
│ - Запрос данных │   │ - Только часть  │
│ - Статика       │   │   страницы      │
│ - Безопасность  │   │ - Минимум кода  │
└─────────────────┘   └─────────────────┘
```

### ✅ Правильно: Запрос в Server Component

```typescript
// app/courses/page.tsx
// Нет 'use client' — это Server Component

import { api } from '@/lib/api-client';
import { CourseList } from '@/components/course/course-list';

export default async function CoursesPage() {
  // Запрос на сервере
  const courses = await api.get('/courses');

  // Передаём данные в клиентский компонент
  return <CourseList courses={courses} />;
}

// Почему хорошо:
// - Данные загружаются на сервере (быстро)
// - JavaScript не нужен для загрузки
// - SEO friendly
// - Можно использовать секретные ключи
```

### ✅ Правильно: Client Component только для интерактива

```typescript
// components/course/course-list.tsx
'use client';

import type { Course } from '@/types/course';

export function CourseList({ courses }: { courses: Course[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <div>
      {courses.map(course => (
        <div
          key={course.id}
          onClick={() => setSelectedId(course.id)}
          className={selectedId === course.id ? 'selected' : ''}
        >
          {course.title}
        </div>
      ))}
    </div>
  );
}
```

### ❌ Как НЕ надо

```typescript
// ❌ useEffect для загрузки данных
'use client';

export function CoursesPage() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    fetch('/api/courses').then(r => r.json()).then(setCourses);
  }, []);

  return <div>...</div>;
}
// Это должен быть Server Component!

// ❌ Client Component там, где не нужен интерактив
'use client'; // Зачем? Нет useState, useEffect, onClick

export function CourseCard({ course }) {
  return <div>{course.title}</div>;
}
// Лишний JavaScript в бандле!
```

---

## Чек-лист перед коммитом

- [ ] Запрос идёт через базовый API клиент (не напрямую fetch)
- [ ] Использованы named exports (не default)
- [ ] Все типы определены в `types/`
- [ ] Для мутаций используется Server Action
- [ ] Кэш настроен (revalidate или tags)
- [ ] Ошибки обрабатываются на всех уровнях
- [ ] Server Component используется где возможно
- [ ] Client Component только для интерактива
- [ ] Нет секретов в клиентском коде
- [ ] Запросы параллельные (не waterfall)

---

## Быстрая справка

| Задача           | Решение                                    |
| ---------------- | ------------------------------------------ |
| GET запрос       | `api.get<T>('/endpoint')`                  |
| POST запрос      | `api.post<Req, Res>('/endpoint', data)`    |
| Обработка ошибок | `try/catch` + `ApiError`                   |
| Кэширование      | `next: { revalidate: 60, tags: ['name'] }` |
| Инвалидация      | `revalidateTag('name')` в Server Action    |
| Мутации          | Server Action + `revalidateTag`            |
| Типы             | `types/*.ts` файлы                         |
| Server Component | Запросы данных, статика                    |
| Client Component | Интерактив (useState, onClick)             |
