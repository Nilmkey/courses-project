// constants/courseLevels.ts
export const COURSE_LEVELS = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
} as const;

export type CourseLevel = (typeof COURSE_LEVELS)[keyof typeof COURSE_LEVELS];

export const COURSE_LEVEL_VALUES = Object.values(COURSE_LEVELS) as CourseLevel[];

export const isCourseLevel = (value: string): value is CourseLevel => {
  return COURSE_LEVEL_VALUES.includes(value as CourseLevel);
};

export const COURSE_LEVEL_ORDER: Record<CourseLevel, number> = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
};