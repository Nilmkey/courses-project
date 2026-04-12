import { Router } from 'express';
import { asyncHandler } from '../../../utils/asyncHandler';
import { uploadImage } from '../../../utils/cloudinary';
import { authMiddleware } from '../../../middleware/auth.middleware';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

// Временное хранилище для загруженных файлов
const tempDir = path.join(process.cwd(), 'tmp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
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

const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB

/**
 * POST /api/v1/upload/image
 * Загрузка изображения в Cloudinary
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
      const result = await uploadImage(req.file.path, 'course-images');
      
      // Удаляем временный файл
      fs.unlinkSync(req.file.path);

      res.json({
        url: result.secure_url || result.url,
        publicId: result.public_id,
      });
    } catch (error) {
      // Удаляем временный файл при ошибке
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      throw error;
    }
  }),
);

export default router;
