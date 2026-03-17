import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const DB_URL =
  process.env.DB_URL || "mongodb://localhost:27017/courses-project";

async function migrateUsers() {
  const client = new MongoClient(DB_URL);

  try {
    await client.connect();
    console.log("✅ Подключено к базе данных");

    const db = client.db();
    const usersCollection = db.collection("user"); // better-auth использует коллекцию 'user'

    // Находим всех пользователей, у которых нет поля streak или оно null
    const usersWithoutStreak = await usersCollection
      .find({
        $or: [{ streak: { $exists: false } }, { streak: null }],
      })
      .toArray();

    if (usersWithoutStreak.length === 0) {
      console.log("✅ У всех пользователей уже есть поле streak");
      await client.close();
      return;
    }

    console.log(
      `🔍 Найдено ${usersWithoutStreak.length} пользователей для обновления`,
    );

    // Обновляем всех пользователей, устанавливая streak по умолчанию
    const result = await usersCollection.updateMany(
      {
        $or: [{ streak: { $exists: false } }, { streak: null }],
      },
      {
        $set: {
          streak: {
            count: 0,
            isFire: false,
            updateAt: new Date(),
          },
        },
      },
    );

    console.log(`✅ Успешно обновлено ${result.modifiedCount} пользователей`);
    console.log(
      "📋 Поле streak инициализировано: { count: 0, isFire: false, updateAt: new Date() }",
    );

    await client.close();
    console.log("🔌 Отключено от базы данных");
  } catch (error) {
    console.error("❌ Ошибка:", error);
    await client.close();
    process.exit(1);
  }
}

migrateUsers();
