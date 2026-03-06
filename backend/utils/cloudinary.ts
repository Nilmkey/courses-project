import { v2 as cloudinary } from 'cloudinary';

// Настраиваем Cloudinary из переменных окружения
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface UploadResult {
  url: string;
  publicId: string;
}

/**
 * Загружает изображение в Cloudinary
 * @param filePath - Путь к файлу на диске
 * @param folder - Папка в Cloudinary (по умолчанию 'avatars')
 */
export const uploadImage = async (
  filePath: string,
  folder: string = 'avatars',
): Promise<UploadResult> => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: 'image',
      transformation: [
        { width: 500, height: 500, crop: 'limit' },
        { quality: 'auto:good' },
      ],
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    throw new Error(`Cloudinary upload error: ${(error as Error).message}`);
  }
};

/**
 * Удаляет изображение из Cloudinary
 * @param publicId - ID изображения в Cloudinary
 */
export const deleteImage = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    throw new Error(`Cloudinary delete error: ${(error as Error).message}`);
  }
};

/**
 * Извлекает public_id из URL Cloudinary
 * @param url - URL изображения
 */
export const extractPublicId = (url: string): string | null => {
  const match = url.match(/\/upload\/v\d+\/(.+)\.[a-z]{3,4}$/);
  return match ? match[1] : null;
};

export { cloudinary };
