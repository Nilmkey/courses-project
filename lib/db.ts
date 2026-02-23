import Dexie, { type EntityTable } from "dexie";
import { CourseBlock, Section } from "@/types/types";

export interface LessonBlocks {
  lessonId: string;
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

db.version(1).stores({
  lessons: "lessonId, updatedAt",
  courses: "courseId, updatedAt",
});

export { db };
