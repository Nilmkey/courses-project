"use client";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useConstructor } from "@/hooks/useConstructor";
import { db } from "@/lib/db";
import debounce from "lodash/debounce";
import { infoLesson } from "@/types/types";
import {
  lessonsBlocksApi,
  toCourseBlock,
} from "@/lib/api/entities/api-lessons";
import { Loader2 } from "lucide-react";

const DndEditor = dynamic(() => import("./editorCore"), {
  ssr: false,
  loading: () => (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-[#3b5bdb]" />
        <p className="text-sm font-black text-slate-400 tracking-[0.2em] uppercase animate-pulse">
          Загрузка редактора
        </p>
      </div>
    </div>
  ),
});

export default function DndPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const { blocks, setBlocks, lessonInfo, setLessonInfo } = useConstructor();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      try {
        const lesson = await lessonsBlocksApi.getById(lessonId);

        if (!cancelled) {
          const convertedBlocks = lesson.content_blocks.map(toCourseBlock);
          setBlocks(convertedBlocks);

          setLessonInfo((prev) => ({
            ...prev,
            title: lesson.title,
            order_index: lesson.order_index,
            sectionId: lesson.section_id,
          }));

          setIsLoaded(true);
        }
      } catch (error) {
        console.error("Ошибка загрузки урока с сервера:", error);

        if (!cancelled) {
          const localLesson = await db.lessons.get(lessonId);
          if (localLesson) {
            setBlocks(localLesson.blocks);
            setLessonInfo(localLesson.lessonInfo);
          }
          setIsLoaded(true);
        }
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, [lessonId, setBlocks, setLessonInfo]);

  const debouncedSave = useMemo(
    () =>
      debounce(
        async (payload: {
          lessonInfo: infoLesson;
          blocks: typeof blocks;
          now: number;
        }) => {
          await db.lessons.put({
            lessonId,
            lessonInfo: payload.lessonInfo,
            blocks: payload.blocks,
            updatedAt: payload.now,
          });
        },
        500,
      ),
    [lessonId],
  );

  useEffect(() => {
    return () => debouncedSave.cancel();
  }, [debouncedSave]);

  useEffect(() => {
    if (!isLoaded) return;
    debouncedSave({ lessonInfo, blocks, now: Date.now() });
  }, [lessonInfo, blocks, isLoaded, debouncedSave]);

  return (
    <div onMouseDown={(e) => e.stopPropagation()}>
      {isLoaded ? (
        <DndEditor />
      ) : (
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-[#3b5bdb]" />
            <p className="text-sm font-black text-slate-400 tracking-[0.2em] uppercase animate-pulse">
              Загрузка редактора
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
