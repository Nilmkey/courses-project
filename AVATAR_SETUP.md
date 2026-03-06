# Настройка загрузки аватара в Cloudinary

## 1. Добавьте переменные окружения в `.env`:

```env
# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Получить их можно здесь: https://cloudinary.com/users/register/free

## 2. Структура API

### Загрузка аватара
```
POST /api/v1/users/avatar
Content-Type: multipart/form-data

FormData:
  avatar: <file>
```

Ответ:
```json
{
  "avatar": "https://res.cloudinary.com/...",
  "message": "Аватар успешно загружен"
}
```

### Удаление аватара
```
DELETE /api/v1/users/avatar
```

Ответ:
```json
{
  "message": "Аватар успешно удалён"
}
```

## 3. Использование на фронтенде

На странице `/profile` есть UI для загрузки аватара:
- Наведите на аватар и нажмите на иконку камеры
- Выберите изображение (JPEG, PNG, WebP, GIF, макс. 5MB)
- Нажмите "Сохранить" или "Отмена"
- Для удаления текущего аватара нажмите на иконку корзины

## 4. Что было добавлено

### Бэкенд:
- `backend/utils/cloudinary.ts` - утилиты для работы с Cloudinary
- `backend/middleware/upload.middleware.ts` - middleware для загрузки файлов
- `backend/api/v1/users/users.controller.ts` - методы `uploadAvatar` и `deleteAvatar`
- `backend/api/v1/users/users.router.ts` - роуты POST/DELETE /avatar
- `backend/auth.ts` - добавлено поле `image` в additionalFields

### Фронтенд:
- `app/(public)/(auth)/profile/page.tsx` - UI для загрузки/удаления аватара
- `app/layout.tsx` - добавлен Toaster для уведомлений
- `lib/auth-client.ts` - добавлено поле `image` в типизацию

### Зависимости:
- `multer` - обработка multipart/form-data
- `@types/multer` - типы для multer

## 5. Примечания

- Временные файлы сохраняются в папку `uploads/` (добавлена в .gitignore)
- При загрузке нового аватара старый автоматически удаляется из Cloudinary
- Изображения оптимизируются (макс. 500x500, auto quality)
