# Система прогресса курсов

## Обзор

Реализована полноценная система отслеживания прогресса пользователей по курсам с возможностью завершения и автоматического обновления статуса.

## Backend

### Модель Progress (`backend/models/Progress.ts`)

Хранит прогресс пользователя по каждому курсу:
- `user_id` - ID пользователя
- `course_id` - ID курса
- `lessons` - массив прогресса по урокам
  - `lesson_id` - ID урока
  - `completed` - флаг завершения
  - `completedAt` - дата завершения
  - `quizAnswers` - ответы на викторины
- `overallProgress` - общий процент выполнения (0-100)

### Сервис прогресса (`backend/services/progress.service.ts`)

Основные методы:

#### `getFullCourseProgress(studentId, courseId)`
Возвращает полный прогресс пользователя по курсу со всеми деталями.

#### `getCourseProgress(studentId, courseId)`
Возвращает сводный прогресс (проценты выполнения).

#### `getLessonProgress(studentId, lessonId, courseId)`
Возвращает ответы пользователя на викторины в конкретном уроке.

#### `markComplete(studentId, lessonId, courseId)`
Отмечает урок как пройденный. Автоматически:
- Обновляет общий прогресс курса
- При 100% прогрессе меняет статус enrollment на "completed"

#### `updateLessonProgress(studentId, lessonId, courseId, data)`
Обновляет прогресс урока (например, сохраняет ответы на викторину).

#### `resetProgress(studentId, lessonId, courseId)`
Сбрасывает прогресс урока.

#### `initializeProgress(studentId, courseId)`
Инициализирует пустой прогресс при записи на курс.

### API Endpoints (`backend/api/v1/progress/`)

| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/course/:courseId/full` | Полный прогресс курса с деталями |
| GET | `/course/:courseId` | Сводный прогресс (проценты) |
| GET | `/lesson/:lessonId?courseId=` | Прогресс урока (ответы на quiz) |
| POST | `/lesson/:lessonId/complete` | Отметить урок как пройденный |
| PATCH | `/lesson/:lessonId` | Обновить прогресс урока |
| POST | `/lesson/:lessonId/reset` | Сбросить прогресс урока |
| POST | `/initialize` | Инициализировать прогресс |

### Интеграция с Enrollment

При записи на курс автоматически создается документ Progress.
При достижении 100% прогресса статус enrollment меняется на "completed".

## Frontend

### API Client (`lib/api/entities/api-progress.ts`)

Клиент для работы с API прогресса:
```typescript
progressApi.getFullCourseProgress(courseId)
progressApi.getCourseProgress(courseId)
progressApi.getLessonProgress(lessonId, courseId)
progressApi.markLessonComplete(lessonId, courseId)
progressApi.updateLessonProgress(lessonId, data)
progressApi.resetLessonProgress(lessonId, courseId)
progressApi.initializeProgress(courseId)
```

### LearningContext (`contexts/LearningContext.tsx`)

Предоставляет состояние и методы для работы с прогрессом:

```typescript
const {
  overallProgress,        // { totalLessons, completedLessons, progress }
  lessonProgress,         // Record<lessonId, LessonProgressData>
  markLessonComplete,     // async (lessonId) => void
  updateQuizAnswers,      // async (lessonId, answers) => void
  resetLessonProgress,    // async (lessonId) => void
  getLessonStatus,        // (lessonId) => LessonStatus
  getLessonProgress,      // (lessonId) => LessonProgressData
} = useLearning();
```

Типы статуса урока:
- `"not-started"` - не начат
- `"in-progress"` - в процессе
- `"completed"` - завершен

### UI Компоненты

#### CourseSidebar (`app/(protected)/learn/[courseSlug]/sidebar/CourseSidebar.tsx`)

Отображает:
- Прогресс-бар с процентом выполнения
- Количество завершенных уроков из общего числа
- Анимацию при 100% выполнении
- Иконку трофея

#### LessonItem (`app/(protected)/learn/[courseSlug]/sidebar/LessonItem.tsx`)

Показывает статус каждого урока:
- ⚪ - не начат
- 🟡 - в процессе  
- 🟢 - завершен

#### QuizBlockView (`app/(protected)/learn/[courseSlug]/content/QuizBlockView.tsx`)

Автоматически сохраняет ответы на викторины через `updateQuizAnswers`.
При 100% правильных ответах показывает кнопку завершения урока.

#### CompletionButton (`components/learning/CompletionButton.tsx`)

Кнопка для отметки урока как пройденного.

## Страница курса

`app/(protected)/learn/[courseSlug]/page.tsx`

При загрузке:
1. Загружает курс по slug
2. Загружает прогресс пользователя через `progressApi.getCourseProgress`
3. Передает прогресс в LearningContext

## Как это работает

1. **Запись на курс**: При записи через `enrollmentApi.enroll` автоматически создается пустой прогресс.

2. **Прохождение урока**:
   - Пользователь открывает урок
   - Отвечает на вопросы викторины (ответы сохраняются через `updateQuizAnswers`)
   - Нажимает "Отметить как пройденное" (`markLessonComplete`)

3. **Обновление прогресса**:
   - Backend обновляет документ Progress
   - Пересчитывает `overallProgress`
   - Если прогресс 100% → меняет статус enrollment на "completed"

4. **Отображение**:
   - Sidebar показывает общий прогресс курса
   - Каждый урок показывает свой статус (иконки)
   - Прогресс-бар анимируется при изменении

## Примеры использования

### Отметить урок как пройденный

```typescript
const { markLessonComplete } = useLearning();
await markLessonComplete(lessonId);
```

### Сохранить ответы на викторину

```typescript
const { updateQuizAnswers } = useLearning();
await updateQuizAnswers(lessonId, [
  { questionId: "1", selectedAnswer: 0, isCorrect: true },
  { questionId: "2", selectedAnswer: [0, 2], isCorrect: true },
]);
```

### Получить статус урока

```typescript
const { getLessonStatus } = useLearning();
const status = getLessonStatus(lessonId);
// "not-started" | "in-progress" | "completed"
```

### Получить общий прогресс

```typescript
const { overallProgress } = useLearning();
console.log(`${overallProgress.progress}% завершено`);
console.log(`${overallProgress.completedLessons} из ${overallProgress.totalLessons} уроков`);
```

## Миграции

Модель Progress уже существует в базе данных. Никакие миграции не требуются.

## Тестирование

1. Запишитесь на курс
2. Пройдите несколько уроков
3. Проверьте, что прогресс обновляется в sidebar
4. Пройдите все уроки → статус курса должен измениться на "completed"
