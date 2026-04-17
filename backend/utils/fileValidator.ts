import fs from 'fs/promises';

/**
 * Сигнатуры файлов (magic numbers) для валидации изображений
 * Каждый формат имеет уникальный заголовок в байтах
 */
const FILE_SIGNATURES: Record<string, Buffer> = {
  // JPEG: FF D8 FF
  jpeg: Buffer.from([0xff, 0xd8, 0xff]),
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  png: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  // GIF: 47 49 46 38 (GIF8)
  gif: Buffer.from([0x47, 0x49, 0x46, 0x38]),
  // WebP: RIFF (полная проверка в коде)
  webp: Buffer.from([0x52, 0x49, 0x46, 0x46]),
};

// Сигнатура WEBP для дополнительной проверки
const WEBP_MARKER = Buffer.from('WEBP', 'ascii');

/**
 * Асинхронно проверяет, соответствует ли файл заявленному типу по magic numbers.
 *
 * Не блокирует Event Loop — безопасно для конкурентных запросов.
 *
 * @param filePath - Путь к файлу
 * @param allowedExtensions - Разрешённые расширения (jpeg, png, gif, webp)
 * @returns Результат валидации
 */
export async function validateFileByMagicNumbers(
  filePath: string,
  allowedExtensions: string[] = ['jpeg', 'png', 'gif', 'webp'],
): Promise<{ isValid: boolean; detectedType?: string; error?: string }> {
  let fileHandle: fs.FileHandle | null = null;

  try {
    // Открываем файл асинхронно
    fileHandle = await fs.open(filePath, 'r');

    // Читаем первые 12 байт (достаточно для всех сигнатур)
    const buffer = Buffer.alloc(12);
    const { bytesRead } = await fileHandle.read(buffer, 0, 12, 0);

    if (bytesRead < 4) {
      return {
        isValid: false,
        error: 'Файл слишком маленький или пустой',
      };
    }

    // Проверяем каждую разрешённую сигнатуру
    for (const ext of allowedExtensions) {
      const signature = FILE_SIGNATURES[ext];
      if (!signature) continue;

      // Сравниваем байты через buffer.equals (slice создаёт view, не копию)
      const fileHeader = buffer.subarray(0, signature.length);
      if (!fileHeader.equals(signature)) {
        continue;
      }

      // JPEG, PNG, GIF — сигнатура совпала, этого достаточно
      if (ext !== 'webp') {
        return { isValid: true, detectedType: ext };
      }

      // Для WebP нужна дополнительная проверка — подтвердить "WEBP" на позиции 8-11
      if (bytesRead >= 12) {
        const webpMarker = buffer.subarray(8, 12);
        if (webpMarker.equals(WEBP_MARKER)) {
          return { isValid: true, detectedType: 'webp' };
        }
      }

      // Не настоящий WebP, ищем дальше
    }

    // Ни одна сигнатура не совпала
    return {
      isValid: false,
      error: 'Файл не является допустимым изображением. Загружайте только JPEG, PNG, WebP или GIF',
    };
  } catch (error) {
    return {
      isValid: false,
      error: `Ошибка чтения файла: ${(error as Error).message}`,
    };
  } finally {
    // Гарантированно закрываем дескриптор даже при ошибке
    await fileHandle?.close();
  }
}

/**
 * Карта MIME типов к расширениям для magic numbers валидации
 */
export const mimeToExtension: Record<string, string> = {
  'image/jpeg': 'jpeg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};
