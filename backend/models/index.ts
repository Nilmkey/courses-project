// models/index.ts
export { Course } from './Course';
export { Section } from './Section';
export { Lesson } from './Lesson';
export { Enrollment } from './Enrollment';
export { Progress } from './Progress';
export { Tag } from './Tag';

export type { ICourse } from './Course';
export type { ISection } from './Section';
export type { ILesson, ILessonBlock, IBlockContent } from './Lesson';
export type { IEnrollment } from './Enrollment';
export type { IProgress, ILessonProgress, IQuizAnswer } from './Progress';
export type { ITag } from './Tag';