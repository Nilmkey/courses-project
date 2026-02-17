import Dexie, { type EntityTable } from "dexie";
import { CourseBlock } from "@/types/types";

export interface LessonBlocks {
  lessonId: string;
  blocks: CourseBlock[];
  updatedAt: number;
}

const db = new Dexie("CourseConstructor") as Dexie & {
  lessons: EntityTable<LessonBlocks, "lessonId">;
};

db.version(1).stores({
  lessons: "lessonId, updatedAt",
});

export { db };
