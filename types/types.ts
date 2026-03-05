export type BlockType = "text" | "video" | "quiz";

export interface BlockContent {
  titleVideo?: string;
  text?: string;
  url?: string;
  questions?: QuizQuestion[];
}

export interface CourseBlock {
  id: string;
  title: string;
  type: BlockType;
  content: BlockContent;
}

export interface infoLesson {
  title: string;
  // isDraft: boolean;
  order_index: number;
  sectionId: string;
}

export type QuestionType = "single" | "multiple" | "text";

interface BaseQuestion {
  id: string;
  questionText: string;
}

interface SingleChoiceQuestion extends BaseQuestion {
  type: "single";
  options: string[];
  correctAnswerIndex: number;
}

interface MultipleChoiceQuestion extends BaseQuestion {
  type: "multiple";
  options: string[];
  correctAnswerIndices: number[];
}

interface TextQuestion extends BaseQuestion {
  type: "text";
  correctAnswerText: string;
}

export type QuizQuestion =
  | SingleChoiceQuestion
  | MultipleChoiceQuestion
  | TextQuestion;

export interface SectionLesson {
  title: string;
  lesson_id: string;
}

export interface Section {
  id: string;
  title: string;
  order_index: number;
  isDraft: boolean;
  courseId: string;
  lessons: SectionLesson[];
}

export interface CourseMetadata {
  _id: string;
  title: string;
  usersCount: number;
  sectionIds: string[];
}

export interface SectionEditorProps {
  courseId: string;
}

export interface SectionItemProps {
  section: Section;
  onSectionTitleChange: (id: string, title: string) => void;
  onLessonChange: (sectionId: string, lessons: SectionLesson[]) => void;
  onRemoveSection: (id: string) => void;
}

export interface LessonItemProps {
  lesson: SectionLesson;
  sectionId: string;
  onLessonChange: (lessonId: string, title: string) => void;
  onRemoveLesson: (lessonId: string) => void;
}

export type CourseLevel = "beginner" | "intermediate" | "advanced";

export interface IQuizQuestion {
  id: string;
  questionText: string;
  options: string[]; // Список вариантов ответов
  correctAnswerIndex: number; // Индекс правильного ответа
  explanation?: string; // Необязательное пояснение
}
export interface IBaseBlock {
  _id: string;
  title: string;
  order_index?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ITextBlock extends IBaseBlock {
  type: "text";
  content: {
    text: string; // Для текстового блока текст обязателен
  };
}

export interface IVideoBlock extends IBaseBlock {
  type: "video";
  content: {
    titleVideo?: string;
    url: string; // Для видео URL обязателен
  };
}

export interface IQuizBlock extends IBaseBlock {
  type: "quiz";
  content: {
    questions: IQuizQuestion[]; // Массив строго типизированных вопросов
  };
}

// Финальный тип блока
export type IBlock = ITextBlock | IVideoBlock | IQuizBlock;
export interface ILesson {
  _id: string;
  custom_id: string;
  section_id: string;
  title: string;
  slug: string;
  is_free: boolean;
  order_index: number;
  content_blocks: IBlock[];
  createdAt: string;
  updatedAt: string;
}

export interface ISection {
  _id: string;
  custom_id: string;
  course_id: string;
  title: string;
  order_index: number;
  isDraft: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ICourse {
  _id: string;
  custom_id: string;
  title: string;
  slug: string;
  description?: string;
  thumbnail?: string;
  author_id?: string;
  level: CourseLevel;
  createdAt: string;
  updatedAt: string;
  iconName?: string;
  status?: 'open' | 'closed';
  type?: 'career' | 'language';
  price?: number;
  isPublished?: boolean;
}

// ==================== API Courses ====================
export interface CreateCourseData {
  title: string;
  description?: string;
  thumbnail?: string;
  level: CourseLevel;
  price?: number;
  isPublished?: boolean;
  sections?: Array<{
    title: string;
    order_index?: number;
    isDraft?: boolean;
    lessons?: Array<{
      title: string;
      slug: string;
      order_index?: number;
      is_free?: boolean;
      content_blocks?: Array<{
        id: string;
        title: string;
        type: "text" | "video" | "quiz";
        content: Record<string, unknown>;
      }>;
    }>;
  }>;
}

export interface UpdateCourseData {
  title?: string;
  description?: string;
  thumbnail?: string;
  level?: CourseLevel;
  price?: number;
  isPublished?: boolean;
}

export interface CourseApiResponse {
  _id: string;
  custom_id: string;
  title: string;
  slug: string;
  price: number;
  isPublished: boolean;
  description?: string;
  thumbnail?: string;
  author_id: string;
  level: CourseLevel;
  createdAt: string;
  updatedAt: string;
}

export interface LessonItem {
  _id: string;
  custom_id: string;
  section_id: string;
  title: string;
  slug: string;
  is_free: boolean;
  order_index: number;
  content_blocks: IBlock[];
  createdAt: string;
  updatedAt: string;
}

export interface SectionWithLessons {
  _id: string;
  custom_id: string;
  course_id: string;
  title: string;
  order_index: number;
  isDraft: boolean;
  createdAt: string;
  updatedAt: string;
  lessons: LessonItem[];
}

export interface CourseWithSectionsResponse extends CourseApiResponse {
  sections: SectionWithLessons[];
}

export interface CoursesListResponse {
  courses: CourseApiResponse[];
}

export interface CourseFormData {
  title: string;
  description: string;
  level: CourseLevel;
  price: number;
  isPublished: boolean;
}
