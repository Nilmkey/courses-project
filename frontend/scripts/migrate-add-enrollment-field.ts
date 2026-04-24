// scripts/migrate-add-enrollment-field.ts
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const DB_URL = process.env.DB_URL || 'mongodb://localhost:27017/courses-project';

const CourseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  price: { type: Number, required: true, default: 0 },
  isPublished: { type: Boolean, required: true, default: false },
  isOpenForEnrollment: { type: Boolean, required: true, default: false },
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

async function migrateCourses() {
  try {
    await mongoose.connect(DB_URL);
    console.log('✅ Подключено к базе данных');

    // Находим все курсы, у которых нет поля isOpenForEnrollment
    const coursesWithoutField = await Course.find({
      isOpenForEnrollment: { $exists: false }
    });

    if (coursesWithoutField.length === 0) {
      console.log('✅ Все курсы уже имеют поле isOpenForEnrollment');
      await mongoose.disconnect();
      return;
    }

    console.log(`🔍 Найдено ${coursesWithoutField.length} курсов для обновления`);

    // Обновляем все курсы, устанавливая isOpenForEnrollment в то же значение, что и isPublished
    const updatePromises = coursesWithoutField.map(course => 
      Course.findByIdAndUpdate(course._id, {
        isOpenForEnrollment: course.isPublished
      })
    );

    await Promise.all(updatePromises);

    console.log(`✅ Успешно обновлено ${coursesWithoutField.length} курсов`);
    console.log('📋 Теперь isOpenForEnrollment установлен в то же значение, что и isPublished');
    
    await mongoose.disconnect();
    console.log('🔌 Отключено от базы данных');
  } catch (error) {
    console.error('❌ Ошибка:', error);
    process.exit(1);
  }
}

migrateCourses();
