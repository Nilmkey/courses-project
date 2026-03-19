# Система прогресса курсов (обновленная версия)

## Обзор

Реализована **иерархическая система отслеживания прогресса** с детализацией по уровням:
- **Блоки** → отдельные элементы контента (текст, видео, quiz)
- **Уроки** → набор блоков контента
- **Секции** → набор уроков
- **Курсы** → набор секций

## Ключевые особенности

### 1. Многоуровневый прогресс
Каждый уровень имеет собственный статус завершенности:
- `completed` - полностью завершено
- `in-progress` - в процессе
- `not-started` - не начато

### 2. Автоматический пересчет при изменениях
При добавлении нового контента (блоки, уроки, секции):
- **Сохраняется** весь существующий прогресс пользователей
- **Добавляются** новые элементы со статусом "not-started"
- **Пересчитывается** общий процент выполнения

### 3. Детализация по блокам
Для каждого урока хранится:
- Какие блоки пройдены
- Какие ответы даны в quiz
- Сколько блоков завершено из общего числа

## Модель данных

### Progress Schema

```typescript
interface IProgress {
  user_id: ObjectId;
  course_id: ObjectId;
  
  // Прогресс по урокам
  lessons: ILessonProgress[];
  
  // Прогресс по секциям (агрегированный)
  sections: ISectionProgress[];
  
  // Общий процент выполнения
  overallProgress: number;
  
  // Детальная статистика
  stats: {
    totalBlocks: number;
    completedBlocks: number;
    totalLessons: number;
    completedLessons: number;
    totalSections: number;
    completedSections: number;
  };
}

interface ILessonProgress {
  lesson_id: ObjectId;
  completed: boolean;
  completedAt?: Date;
  quizAnswers?: IQuizAnswer[];
  blocks: IBlockProgress[];        // Детализация по блокам
  completedBlocksCount: number;
  totalBlocksCount: number;
}

interface IBlockProgress {
  blockId: string;
  completed: boolean;
  completedAt?: Date;
  quizAnswers?: IQuizAnswer[];
}

interface ISectionProgress {
  section_id: ObjectId;
  completed: boolean;
  completedAt?: Date;
  completedLessonsCount: number;
  totalLessonsCount: number;
  lessonProgress: ILessonProgress[];
}
```

## Backend API

### Сервис прогресса (`backend/services/progress.service.ts`)

#### Основные методы:

**`getFullCourseProgress(studentId, courseId)`**
- Возвращает полный прогресс со всеми деталями
- Включает прогресс по блокам, урокам, секциям

**`markBlockComplete(studentId, lessonId, courseId, blockId, quizAnswers?)`**
- Отмечает конкретный блок как завершенный
- Сохраняет ответы на quiz если есть
- Автоматически обновляет счетчики урока

**`markComplete(studentId, lessonId, courseId)`**
- Отмечает весь урок как пройденный
- Автоматически завершает все блоки урока

**`recalculateCourseProgress(courseId)`**
- **Ключевой метод** для пересчета при изменениях
- Добавляет новые блоки/уроки/секции в прогресс пользователей
- Сохраняет существующий прогресс
- Пересчитывает общую статистику

**`updateLessonProgress(studentId, lessonId, courseId, data)`**
- Обновляет прогресс урока (ответы на quiz, статус)

**`resetProgress(studentId, lessonId, courseId)`**
- Сбрасывает прогресс урока и всех его блоков

### Сервисы контента с авто-пересчетом

#### Sections Service
```typescript
// При создании секции
async create(data) {
  const section = await Section.create(data);
  // Авто-пересчет прогресса всех пользователей
  await progressService.recalculateCourseProgress(courseId);
  return section;
}

// При удалении секции
async delete(id) {
  const section = await Section.findById(id);
  await Lesson.deleteMany({ section_id: id });
  await Section.findByIdAndDelete(id);
  // Авто-пересчет прогресса
  await progressService.recalculateCourseProgress(courseId);
}
```

#### Lessons Service
```typescript
// При создании урока
async create(data) {
  const lesson = await Lesson.create(data);
  await Section.findByIdAndUpdate(sectionId, {
    $push: { lessons: lesson._id },
  });
  // Авто-пересчет прогресса
  await progressService.recalculateCourseProgress(courseId);
}

// При обновлении блоков
async update(id, data) {
  const updated = await Lesson.findByIdAndUpdate(id, data);
  if (data.content_blocks) {
    // Если блоки изменены - пересчитываем прогресс
    await progressService.recalculateCourseProgress(courseId);
  }
  return updated;
}

// Добавить блок к уроку
async addBlock(lessonId, block) {
  const updated = await Lesson.findByIdAndUpdate(lessonId, {
    $push: { content_blocks: block },
  });
  // Авто-пересчет прогресса
  await progressService.recalculateCourseProgress(courseId);
}
```

### API Endpoints

| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/course/:courseId/full` | Полный прогресс с деталями |
| GET | `/course/:courseId` | Сводный прогресс (проценты + статистика) |
| GET | `/lesson/:lessonId?courseId=` | Прогресс урока (ответы + блоки) |
| POST | `/lesson/:lessonId/complete` | Отметить урок как пройденный |
| POST | `/lesson/:lessonId/block/:blockId/complete` | Отметить блок как завершенный |
| PATCH | `/lesson/:lessonId` | Обновить прогресс урока |
| POST | `/lesson/:lessonId/reset` | Сбросить прогресс урока |
| POST | `/initialize` | Инициализировать прогресс |
| POST | `/course/:courseId/recalculate` | Пересчитать прогресс всех пользователей |

## Frontend

### API Client (`lib/api/entities/api-progress.ts`)

```typescript
// Получить полный прогресс
const progress = await progressApi.getFullCourseProgress(courseId);

// Отметить блок как завершенный
await progressApi.markBlockComplete(lessonId, courseId, {
  blockId,
  quizAnswers,
});

// Пересчитать прогресс при изменениях
await progressApi.recalculateProgress(courseId);
```

### LearningContext (`contexts/LearningContext.tsx`)

```typescript
const {
  // Прогресс с детализацией
  overallProgress: {
    totalLessons,
    completedLessons,
    totalBlocks,
    completedBlocks,
    totalSections,
    completedSections,
    progress,
  },
  
  // Прогресс по урокам с блоками
  lessonProgress: Record<string, LessonProgressData>,
  
  // Методы
  markLessonComplete,      // Завершить урок
  completeBlock,           // Завершить блок
  updateQuizAnswers,       // Сохранить ответы
  resetLessonProgress,     // Сбросить прогресс
  recalculateProgress,     // Пересчитать при изменениях
  getLessonStatus,         // Получить статус урока
} = useLearning();
```

### Типы данных

```typescript
interface LessonProgressData {
  lessonId: string;
  status: "not-started" | "in-progress" | "completed";
  completedBlocks: number;
  totalBlocks: number;
  quizAnswers?: IQuizAnswer[];
  blocks?: BlockProgressResponse[];
  isCompleted?: boolean;
}
```

## Сценарии использования

### Сценарий 1: Пользователь проходит урок

1. Открывает урок → статус меняется на "in-progress"
2. Проходит блоки (видео, текст) → `completeBlock()`
3. Отвечает на quiz → `updateQuizAnswers()`
4. Завершает урок → `markLessonComplete()`

**Результат:**
- Все блоки отмечены как завершенные
- Урок помечен как "completed"
- Обновляется общий прогресс курса
- Продлевается стрик пользователя

### Сценарий 2: Добавление нового блока в урок

**До изменений:**
- У пользователя 5 блоков в уроке, 3 пройдены

**После добавления блока:**
1. Backend автоматически вызывает `recalculateCourseProgress()`
2. Новый блок добавляется в прогресс пользователя со статусом "not-started"
3. Существующие 3 блока остаются завершенными
4. `completedBlocksCount` не меняется (остается 3)
5. `totalBlocksCount` увеличивается (становится 6)

**Результат:**
- Пользователь видит новый блок
- Может продолжить с того места, где остановился
- Прогресс не сбрасывается

### Сценарий 3: Добавление нового урока в секцию

**До изменений:**
- 10 уроков в курсе, пользователь завершил 5 (50%)

**После добавления урока:**
1. `recalculateCourseProgress()` добавляет новый урок в прогресс всех пользователей
2. Новый урок со статусом "not-started"
3. Завершенные уроки остаются завершенными

**Результат:**
- Теперь 11 уроков, пользователь завершил 5 (45%)
- Прогресс корректно пересчитан
- Не нужно проходить заново

### Сценарий 4: Добавление новой секции

Аналогично сценарию 3:
- Новая секция добавляется в `progress.sections`
- Все уроки новой секции добавляются в `progress.lessons`
- Статус всех новых элементов: "not-started"
- Существующий прогресс сохраняется

### Сценарий 5: Администратор изменяет курс

```typescript
// В админ панели при добавлении/изменении контента
const handleAddBlock = async (lessonId, blockData) => {
  await lessonsService.addBlock(lessonId, blockData);
  // Пересчет происходит автоматически на backend
  
  // Опционально: уведомить пользователей
  // или показать индикатор "обновлено"
};
```

## Алгоритм пересчета прогресса

```
1. Получить актуальную структуру курса (секции → уроки → блоки)
2. Для каждого пользователя:
   a. Пройтись по всем секциям курса
   b. Если секции нет в progress.sections → создать с status="not-started"
   c. Если секция есть → обновить totalLessonsCount
   d. Пройтись по всем урокам секции
   e. Если урока нет в progress.lessonProgress → создать с status="not-started"
   f. Если урок есть → обновить totalBlocksCount
   g. Пройтись по всем блокам урока
   h. Если блока нет → добавить с completed=false
   i. Пересчитать completedBlocksCount для каждого урока
   j. Пересчитать completedLessonsCount для каждой секции
3. Обновить общую статистику:
   - totalBlocks, completedBlocks
   - totalLessons, completedLessons  
   - totalSections, completedSections
4. Пересчитать overallProgress = (completedLessons / totalLessons) * 100
5. Обновить статус enrollment:
   - Если 100% → "completed"
   - Иначе → "active"
```

## Миграции

При первом запуске после обновления:

1. **Существующие записи Progress** будут автоматически обновлены при первом обращении
2. **Новые поля** (blocks, sections, stats) инициализируются значениями по умолчанию
3. **recalculateCourseProgress()** может быть вызван вручную для всех курсов для полной синхронизации

### SQL-подобная миграция (опционально)

```javascript
// Для существующих записей можно выполнить:
db.progress.updateMany(
  { sections: { $exists: false } },
  { 
    $set: { 
      sections: [],
      stats: {
        totalBlocks: 0,
        completedBlocks: 0,
        totalLessons: 0,
        completedLessons: 0,
        totalSections: 0,
        completedSections: 0,
      }
    } 
  }
);

// Затем вызвать recalculateCourseProgress() для каждого курса
```

## Тестирование

### 1. Базовый прогресс
```
1. Записаться на курс
2. Пройти 1 блок → проверить completedBlocks=1
3. Пройти урок → проверить lesson.completed=true
4. Проверить overallProgress обновился
```

### 2. Добавление блока
```
1. Пользователь прошел 3/5 блоков в уроке
2. Админ добавляет 6-й блок
3. Проверить: completedBlocks=3, totalBlocks=6
4. Пользователь может продолжить с 4-го блока
```

### 3. Добавление урока
```
1. Пользователь прошел 5/10 уроков (50%)
2. Админ добавляет 11-й урок
3. Проверить: completedLessons=5, totalLessons=11 (~45%)
4. Пройденные уроки остаются завершенными
```

### 4. Добавление секции
```
1. Курс имеет 2 секции, пользователь прошел 1
2. Админ добавляет 3-ю секцию с уроками
3. Проверить: completedSections=1, totalSections=3
4. Прогресс пересчитан корректно
```

## Производительность

### Оптимизация пересчета

Для больших курсов с множеством пользователей:

1. **Пакетный пересчет**: Группировать изменения и пересчитывать раз в N минут
2. **Фоновые задачи**: Выносить `recalculateCourseProgress()` в очередь (Bull, Agenda)
3. **Частичный пересчет**: Пересчитывать только затронутые изменения

### Пример с очередью

```typescript
// backend/services/progress-queue.service.ts
import { Queue } from 'bull';

const progressQueue = new Queue('progress-recalculation', REDIS_URL);

// При изменении контента
progressQueue.add({ courseId }, { 
  delay: 5000, // Пересчитать через 5 секунд
  jobId: `recalc-${courseId}-${Date.now()}`
});

// Обработчик
progressQueue.process(async (job) => {
  await progressService.recalculateCourseProgress(job.data.courseId);
});
```

## Заключение

Обновленная система прогресса обеспечивает:

✅ **Детализацию** до уровня блоков  
✅ **Автоматический пересчет** при изменениях  
✅ **Сохранение** существующего прогресса  
✅ **Масштабируемость** для больших курсов  
✅ **Гибкость** для различных сценариев обучения
