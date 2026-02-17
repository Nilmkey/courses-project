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
