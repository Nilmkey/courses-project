import { Router } from 'express';
import { asyncHandler } from '../../../utils/asyncHandler';
import { uploadImage } from '../../../utils/cloudinary';
import { authMiddleware } from '../../../middleware/auth.middleware';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import fsSync from 'fs';
import { validateFileByMagicNumbers, mimeToExtension } from '../../../utils/fileValidator';
import { ApiError } from '../../../utils/ApiError';

const router = Router();

// Разрешённые MIME типы
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

// Временное хранилище для загруженных файлов
const tempDir = path.join(process.cwd(), 'tmp');
if (!fsSync.existsSync(tempDir)) {
  fsSync.mkdirSync(tempDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
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

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

/**
 * POST /api/v1/upload/image
 * Загрузка изображения в Cloudinary
 * Валидация: MIME тип + magic numbers
 */
router.post(
  '/image',
  authMiddleware,
  upload.single('file'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: 'Файл не загружен' });
    }

    try {
      // Двойная валидация: проверяем magic numbers файла (асинхронно)
      const validation = await validateFileByMagicNumbers(req.file.path);
      if (!validation.isValid) {
        // Удаляем опасный файл
        await fs.unlink(req.file.path);
        return res.status(400).json({ message: validation.error });
      }

      // Дополнительно: сверяем MIME тип с реальным типом файла
      const expectedExt = mimeToExtension[req.file.mimetype];
      if (expectedExt && expectedExt !== validation.detectedType) {
        await fs.unlink(req.file.path);
        return res.status(400).json({
          message: `MIME тип не соответствует содержимому файла. Ожидался ${expectedExt}, обнаружен ${validation.detectedType}`,
        });
      }

      const result = await uploadImage(req.file.path, 'course-images');

      // Удаляем временный файл
      await fs.unlink(req.file.path);

      res.json({
        url: result.url,
        publicId: result.publicId,
      });
    } catch (error) {
      // Удаляем временный файл при ошибке
      try {
        await fs.unlink(req.file.path);
      } catch {
        // Файл мог быть уже удалён
      }
      throw error;
    }
  }),
);

export default router;
