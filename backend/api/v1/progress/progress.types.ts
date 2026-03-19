// api/v1/progress/progress.types.ts
export interface MarkLessonCompleteRequest {
  params: { lessonId: string };
  body: {
    courseId: string;
  };
}

export interface ResetProgressRequest {
  params: { lessonId: string };
  body: {
    courseId: string;
  };
}

export interface GetCourseProgressRequest {
  params: { courseId: string };
}

export interface UpdateLessonProgressRequest {
  params: { lessonId: string };
  body: {
    courseId: string;
    completed: boolean;
    quizAnswers?: Array<{
      questionId: string;
      selectedAnswer: number | number[] | string;
      isCorrect: boolean;
    }>;
  };
}

export interface GetLessonProgressRequest {
  params: { lessonId: string };
  query: {
    courseId: string;
  };
}

export interface InitializeProgressRequest {
  body: {
    courseId: string;
  };
}

export interface MarkBlockCompleteRequest {
  params: { lessonId: string };
  body: {
    courseId: string;
    blockId: string;
    quizAnswers?: Array<{
      questionId: string;
      selectedAnswer: number | number[] | string;
      isCorrect: boolean;
    }>;
  };
}

export interface RecalculateProgressRequest {
  params: { courseId: string };
}

export interface QuizAnswerResponse {
  questionId: string;
  selectedAnswer: number | number[] | string;
  isCorrect: boolean;
}

export interface BlockProgressResponse {
  blockId: string;
  completed: boolean;
  completedAt?: string;
  quizAnswers?: QuizAnswerResponse[];
}

export interface LessonProgressResponse {
  lesson_id: string;
  completed: boolean;
  completedAt?: string;
  quizAnswers?: QuizAnswerResponse[];
  blocks?: BlockProgressResponse[];
  completedBlocksCount: number;
  totalBlocksCount: number;
}

export interface SectionProgressResponse {
  section_id: string;
  completed: boolean;
  completedAt?: string;
  completedLessonsCount: number;
  totalLessonsCount: number;
}

export interface CourseProgressResponse {
  totalLessons: number;
  completedLessons: number;
  totalBlocks: number;
  completedBlocks: number;
  totalSections: number;
  completedSections: number;
  progress: number;
}

export interface CourseProgressDetailResponse {
  _id: string;
  user_id: string;
  course_id: string;
  lessons: LessonProgressResponse[];
  sections: SectionProgressResponse[];
  overallProgress: number;
  stats: {
    totalBlocks: number;
    completedBlocks: number;
    totalLessons: number;
    completedLessons: number;
    totalSections: number;
    completedSections: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ProgressDetailResponse {
  _id: string;
  user_id: string;
  course_id: string;
  lessons: LessonProgressResponse[];
  sections: SectionProgressResponse[];
  overallProgress: number;
  stats: {
    totalBlocks: number;
    completedBlocks: number;
    totalLessons: number;
    completedLessons: number;
    totalSections: number;
    completedSections: number;
  };
  createdAt: string;
  updatedAt: string;
}