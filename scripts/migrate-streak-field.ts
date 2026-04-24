import { MongoClient, Db, UpdateFilter, AnyBulkWriteOperation } from "mongodb";
import * as dotenv from "dotenv";

// Загрузка переменных окружения
dotenv.config();

const MONGODB_URI = process.env.DB_URL || "mongodb://localhost:27017";
const DATABASE_NAME = process.env.DATABASE_NAME || "test";
const COLLECTION_NAME = "user";

interface StreakObject {
  count: number;
  isFire: boolean;
  updateAt: Date;
}

interface UserDocument {
  _id: import("mongodb").ObjectId;
  streak: number | StreakObject;
  [key: string]: unknown;
}

interface MigrationStats {
  total: number;
  updated: number;
  skipped: number;
  errors: number;
}

class StreakMigration {
  private client: MongoClient | null = null;
  private db: Db | null = null;

  async connect(): Promise<void> {
    try {
      this.client = new MongoClient(MONGODB_URI);
      await this.client.connect();
      this.db = this.client.db(DATABASE_NAME);
      console.log(`✅ Подключено к MongoDB: ${MONGODB_URI}`);
      console.log(`📊 База данных: ${DATABASE_NAME}`);
    } catch (error) {
      console.error("❌ Ошибка подключения к MongoDB:", error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      console.log("🔌 Подключение закрыто");
    }
  }

  /**
   * Проверка: является ли значение числом
   */
  private isNumberStreak(value: unknown): value is number {
    return typeof value === "number" && !isNaN(value);
  }

  /**
   * Проверка: является ли значение уже объектом streak
   */
  private isObjectStreak(value: unknown): value is StreakObject {
    return (
      typeof value === "object" &&
      value !== null &&
      "count" in value &&
      "isFire" in value &&
      "updateAt" in value
    );
  }

  /**
   * Применение миграции
   */
  async migrate(): Promise<MigrationStats> {
    if (!this.db) {
      throw new Error("База данных не подключена. Вызовите connect() сначала.");
    }

    const collection = this.db.collection<UserDocument>(COLLECTION_NAME);
    const stats: MigrationStats = {
      total: 0,
      updated: 0,
      skipped: 0,
      errors: 0,
    };

    console.log("\n🚀 Запуск миграции поля streak...\n");

    try {
      // Получаем все документы
      const allUsers = await collection.find({}).toArray();
      stats.total = allUsers.length;

      console.log(`📋 Найдено документов: ${stats.total}`);

      // Обновляем документы в пакетном режиме
      const updateOperations: AnyBulkWriteOperation<UserDocument>[] = [];

      for (const user of allUsers) {
        try {
          if (this.isNumberStreak(user.streak)) {
            const update: UpdateFilter<UserDocument> = {
              $set: {
                streak: {
                  count: user.streak,
                  isFire: false,
                  updateAt: new Date(),
                },
              },
            };

            updateOperations.push({
              updateOne: {
                filter: { _id: user._id },
                update,
              },
            });

            stats.updated++;
          } else if (this.isObjectStreak(user.streak)) {
            stats.skipped++;
            console.log(`⏭️  Пропущен документ ${user._id}: streak уже объект`);
          } else {
            stats.skipped++;
            console.log(
              `⏭️  Пропущен документ ${user._id}: streak не число и не объект (${typeof user.streak})`,
            );
          }
        } catch (docError) {
          stats.errors++;
          console.error(`❌ Ошибка обработки документа ${user._id}:`, docError);
        }
      }

      // Выполняем пакетное обновление
      if (updateOperations.length > 0) {
        const result = await collection.bulkWrite(updateOperations, {
          ordered: false,
        });
        console.log(`\n📊 Результат пакетной операции:`, {
          modifiedCount: result.modifiedCount,
          matchedCount: result.matchedCount,
        });
      }

      console.log("\n✅ Миграция завершена");
      this.printStats(stats);

      return stats;
    } catch (error) {
      console.error("❌ Критическая ошибка миграции:", error);
      throw error;
    }
  }

  /**
   * Откат миграции (преобразует объект обратно в число)
   */
  async rollback(): Promise<MigrationStats> {
    if (!this.db) {
      throw new Error("База данных не подключена. Вызовите connect() сначала.");
    }

    const collection = this.db.collection<UserDocument>(COLLECTION_NAME);
    const stats: MigrationStats = {
      total: 0,
      updated: 0,
      skipped: 0,
      errors: 0,
    };

    console.log("\n🔄 Запуск отката миграции поля streak...\n");

    try {
      const allUsers = await collection.find({}).toArray();
      stats.total = allUsers.length;

      console.log(`📋 Найдено документов: ${stats.total}`);

      const updateOperations: AnyBulkWriteOperation<UserDocument>[] = [];

      for (const user of allUsers) {
        try {
          if (this.isObjectStreak(user.streak)) {
            const update: UpdateFilter<UserDocument> = {
              $set: {
                streak: user.streak.count,
              },
            };

            updateOperations.push({
              updateOne: {
                filter: { _id: user._id },
                update,
              },
            });

            stats.updated++;
          } else if (this.isNumberStreak(user.streak)) {
            stats.skipped++;
            console.log(`⏭️  Пропущен документ ${user._id}: streak уже число`);
          } else {
            stats.skipped++;
            console.log(
              `⏭️  Пропущен документ ${user._id}: streak неизвестного типа`,
            );
          }
        } catch (docError) {
          stats.errors++;
          console.error(`❌ Ошибка обработки документа ${user._id}:`, docError);
        }
      }

      if (updateOperations.length > 0) {
        const result = await collection.bulkWrite(updateOperations, {
          ordered: false,
        });
        console.log(`\n📊 Результат пакетной операции:`, {
          modifiedCount: result.modifiedCount,
          matchedCount: result.matchedCount,
        });
      }

      console.log("\n✅ Откат завершён");
      this.printStats(stats);

      return stats;
    } catch (error) {
      console.error("❌ Критическая ошибка отката:", error);
      throw error;
    }
  }

  /**
   * Вывод статистики
   */
  private printStats(stats: MigrationStats): void {
    console.log("\n" + "=".repeat(50));
    console.log("📈 СТАТИСТИКА");
    console.log("=".repeat(50));
    console.log(`Всего документов:    ${stats.total}`);
    console.log(`Обновлено:           ${stats.updated}`);
    console.log(`Пропущено:           ${stats.skipped}`);
    console.log(`Ошибок:              ${stats.errors}`);
    console.log("=".repeat(50) + "\n");
  }
}

// Точка входа
async function main() {
  const migration = new StreakMigration();
  const command = process.argv[2] || "migrate";

  console.log("=".repeat(50));
  console.log("MONGODB STREAK MIGRATION");
  console.log("=".repeat(50));
  console.log(`Команда: ${command}`);
  console.log(`URI: ${MONGODB_URI}`);
  console.log(`DB: ${DATABASE_NAME}`);
  console.log(`Collection: ${COLLECTION_NAME}`);
  console.log("=".repeat(50));

  try {
    await migration.connect();

    switch (command) {
      case "migrate":
        await migration.migrate();
        break;
      case "rollback":
        await migration.rollback();
        break;
      case "dry-run":
        console.log("\n🔍 Режим проверки (dry-run) - без реальных изменений");
        await migration.migrate();
        break;
      default:
        console.error(`❌ Неизвестная команда: ${command}`);
        console.log("Используйте: migrate | rollback | dry-run");
        process.exit(1);
    }
  } catch (error) {
    console.error("\n❌ Скрипт завершён с ошибкой:", error);
    process.exit(1);
  } finally {
    await migration.disconnect();
  }
}

// Запуск
main();