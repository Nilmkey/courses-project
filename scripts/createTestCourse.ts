// scripts/createTestCourse.ts
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const DB_URL = process.env.DB_URL || 'mongodb://localhost:27017/courses-project';

const CourseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  price: { type: Number, required: true, default: 0 },
  isPublished: { type: Boolean, required: true, default: false },
  description: String,
  thumbnail: String,
  author_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner',
  },
  iconName: { type: String, default: 'Code' },
  status: { type: String, enum: ['open', 'closed'], default: 'open' },
  type: { type: String, enum: ['career', 'language'], default: 'career' },
}, { timestamps: true });

const Course = mongoose.models.Course || mongoose.model('Course', CourseSchema);

async function createTestCourse() {
  try {
    await mongoose.connect(DB_URL);
    console.log('✅ Подключено к базе данных');

    // Проверяем, есть ли уже курсы
    const existingCourses = await Course.countDocuments();
    if (existingCourses > 0) {
      console.log(`⚠️ В базе уже есть ${existingCourses} курсов`);
      await mongoose.disconnect();
      return;
    }

    // Создаём тестовый курс
    const testCourse = await Course.create({
      title: 'HTML & CSS Основы',
      slug: 'html-css-basics',
      description: 'Изучите основы вёрстки сайтов с нуля. HTML теги, CSS стили, Flexbox, Grid и адаптивная вёрстка.',
      thumbnail: 'https://via.placeholder.com/400x300/3b82f6/ffffff?text=HTML+CSS',
      level: 'beginner',
      price: 0,
      isPublished: true,
      iconName: 'Layout',
      status: 'open',
      type: 'career',
    });

    console.log('✅ Создан тестовый курс:', {
      _id: testCourse._id,
      title: testCourse.title,
      slug: testCourse.slug,
    });

    // Создаём ещё один курс
    const jsCourse = await Course.create({
      title: 'JavaScript для начинающих',
      slug: 'javascript-beginners',
      description: 'Освойте главный язык веба. Переменные, функции, массивы, объекты, DOM и асинхронность.',
      thumbnail: 'https://via.placeholder.com/400x300/f59e0b/ffffff?text=JavaScript',
      level: 'beginner',
      price: 0,
      isPublished: true,
      iconName: 'Code',
      status: 'open',
      type: 'career',
    });

    console.log('✅ Создан курс JavaScript:', {
      _id: jsCourse._id,
      title: jsCourse.title,
      slug: jsCourse.slug,
    });

    // Создаём курс английского
    const enCourse = await Course.create({
      title: 'Английский для IT',
      slug: 'english-for-it',
      description: 'Специализированный курс английского языка для программистов. Техническая лексика, собеседования, документация.',
      thumbnail: 'https://via.placeholder.com/400x300/10b981/ffffff?text=English',
      level: 'intermediate',
      price: 0,
      isPublished: true,
      iconName: 'Globe',
      status: 'open',
      type: 'language',
    });

    console.log('✅ Создан курс Английский:', {
      _id: enCourse._id,
      title: enCourse.title,
      slug: enCourse.slug,
    });

    console.log('\n🎉 Готово! Теперь курсы доступны в приложении.');
    await mongoose.disconnect();
    console.log('🔌 Отключено от базы данных');
  } catch (error) {
    console.error('❌ Ошибка:', error);
    process.exit(1);
  }
}

createTestCourse();
