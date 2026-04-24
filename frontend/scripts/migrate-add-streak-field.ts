import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const DB_URL =
  process.env.DB_URL ?? "mongodb://localhost:27017/courses-project";
const DB_NAME = process.env.DB_NAME ?? "courses-project";
const COLLECTION_NAME = "user";
const isDryRun = process.argv.includes("--dry-run");

// ✅ Ищем тех, у кого streak отсутствует или null
const STREAK_FILTER = {
  $or: [{ streak: { $exists: false } }, { streak: null }],
};

async function migrateUsers(): Promise<void> {
  const client = new MongoClient(DB_URL, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000,
  });
  const startTime = Date.now();

  try {
    await client.connect();
    const collection = client.db(DB_NAME).collection(COLLECTION_NAME);

    const total = await collection.countDocuments();
    const toUpdate = await collection.countDocuments(STREAK_FILTER);
    console.log(`📊 Всего документов: ${total}`);
    console.log(`🔍 Требуют обновления: ${toUpdate}`);

    if (isDryRun) {
      console.log("[DRY RUN] Изменений не вносим");
      return;
    }

    if (toUpdate === 0) {
      console.log("✅ Все пользователи уже имеют поле streak");
      return;
    }

    // ✅ Простой $set, без агрегационного pipeline
    const result = await collection.updateMany(STREAK_FILTER, {
      $set: {
        streak: {
          count: 0,
          isFire: false,
          updatedAt: new Date(),
        },
      },
    });

    console.log(`✅ Обновлено: ${result.modifiedCount} пользователей`);
    console.log(`⏱ Выполнено за ${Date.now() - startTime}ms`);
  } catch (error) {
    console.error("❌ Ошибка миграции:", error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

migrateUsers();
