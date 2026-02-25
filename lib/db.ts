import Dexie, { type EntityTable } from "dexie";
import { CourseBlock, infoLesson, Section } from "@/types/types";

export interface LessonBlocks {
  lessonId: string;
  lessonInfo: infoLesson;
  blocks: CourseBlock[];
  updatedAt: number;
}

export interface CourseConstructor {
  sectionId: string;
  sections: Section[];
  updatedAt: number;
}

type CourseDB = Dexie & {
  lessons: EntityTable<LessonBlocks, "lessonId">;
  courses: EntityTable<CourseConstructor, "sectionId">;
};

const db = new Dexie("CourseConstructor") as CourseDB;

db.version(4).stores({
  lessons: "lessonId, updatedAt",
  courses: "sectionId, updatedAt",
});

export { db };
