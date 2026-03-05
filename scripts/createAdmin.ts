// scripts/createAdmin.ts
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

dotenv.config();

const DB_URL = process.env.DB_URL || 'mongodb://localhost:27017/courses-project';

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, default: 'student', enum: ['student', 'teacher', 'admin'] },
  image: String,
  streak: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function createAdmin() {
  try {
    await mongoose.connect(DB_URL);
    console.log('✅ Подключено к базе данных');

    const email = 'admin@example.com';
    const password = 'admin123';
    const name = 'Admin';

    // Проверяем, есть ли уже админ
    const existingAdmin = await User.findOne({ email, role: 'admin' });
    if (existingAdmin) {
      console.log('⚠️ Админ уже существует:', { email, id: existingAdmin._id });
      await mongoose.disconnect();
      return;
    }

    // Хэшируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создаём админа
    const admin = await User.create({
      email,
      password: hashedPassword,
      name,
      role: 'admin',
      streak: 0,
    });

    console.log('✅ Создан админ:', {
      _id: admin._id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
    });

    console.log('\n📝 Данные для входа:');
    console.log(`   Email: ${email}`);
    console.log(`   Пароль: ${password}`);
    console.log('\n🔗 Теперь войди на /login и нажми кнопку "Создать курс"');

    await mongoose.disconnect();
    console.log('🔌 Отключено от базы данных');
  } catch (error) {
    console.error('❌ Ошибка:', error);
    process.exit(1);
  }
}

createAdmin();
