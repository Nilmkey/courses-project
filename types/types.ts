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
  lesson_id: string;
  title: string;
}

export interface Section {
  id: string;
  title: string;
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
