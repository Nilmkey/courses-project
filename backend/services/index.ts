// services/index.ts
export { coursesService } from './courses.service';
export { sectionsService } from './sections.service';
export { lessonsService } from './lessons.service';
export { enrollmentService } from './enrollment.service';
export { progressService } from './progress.service';

export type {
  CourseCreateInput,
  SectionCreateInput,
  LessonCreateInput,
} from './courses.service';

export type {
  SectionCreateInput as SectionServiceCreateInput,
  SectionUpdateInput,
} from './sections.service';

export type {
  LessonCreateInput as LessonServiceCreateInput,
  LessonUpdateInput,
  LessonBlockInput,
} from './lessons.service';

export type {
  EnrollmentCreateInput,
  EnrollmentStatus,
} from './enrollment.service';

export type {
  QuizAnswerInput,
  LessonProgressInput,
  ProgressUpdateInput,
  CourseProgressResult,
} from './progress.service';