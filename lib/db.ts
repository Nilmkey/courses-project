import Dexie, { type EntityTable } from "dexie";
import { CourseBlock, infoLesson, Section } from "@/types/types";

export interface LessonBlocks {
  lessonId: string;
  lessonInfo: infoLesson;
  blocks: CourseBlock[];
  updatedAt: number;
}

export interface CourseConstructor {
  courseId: string;
  sections: Section[];
  updatedAt: number;
}

type CourseDB = Dexie & {
  lessons: EntityTable<LessonBlocks, "lessonId">;
  courses: EntityTable<CourseConstructor, "courseId">;
};

const db = new Dexie("CourseConstructor") as CourseDB;

db.version(3).stores({
  lessons: "lessonId, updatedAt",
  courses: "courseId, updatedAt",
});

export { db };
