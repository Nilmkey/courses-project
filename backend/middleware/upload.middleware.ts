import multer from 'multer';
import path from 'path';
import type { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import fs from 'fs';

// Разрешённые MIME типы для изображений
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

// Создаём папку uploads, если её нет
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Настройка хранилища: временные файлы
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${req.user?.id || 'anonymous'}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

// Фильтр: проверка MIME типа
const fileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, 'Неверный тип файла. Разрешены только JPEG, PNG, WebP, GIF'));
  }
};

// Настройка multer
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
});

// Middleware для обработки ошибок multer
export const handleMulterError = (
  err: Error | null,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(new ApiError(400, 'Файл слишком большой. Максимальный размер 5MB'));
    }
    return next(new ApiError(400, `Ошибка загрузки: ${err.message}`));
  }

  if (err) {
    return next(new ApiError(400, err.message));
  }

  next();
};
