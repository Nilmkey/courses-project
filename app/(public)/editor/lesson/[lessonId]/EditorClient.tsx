"use client";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useConstructor } from "@/hooks/useConstructor";
import { db } from "@/lib/db";
import debounce from "lodash/debounce";

const DndEditor = dynamic(() => import("./editorCore"), {
  ssr: false,
  loading: () => <div>Загрузка редактора...</div>,
});

export default function DndPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const { blocks, setBlocks } = useConstructor();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    db.lessons
      .get(lessonId)
      .then((lesson) => {
        if (!cancelled) {
          setBlocks(lesson?.blocks ?? []);
          setIsLoaded(true);
        }
      })
      .catch(console.error);
    return () => {
      cancelled = true;
    };
  }, [lessonId, setBlocks]);

  const debouncedSave = useMemo(
    () =>
      debounce(async (payload: { blocks: typeof blocks; now: number }) => {
        await db.lessons.put({
          lessonId,
          blocks: payload.blocks,
          updatedAt: payload.now,
        });
      }, 500),
    [lessonId],
  );

  useEffect(() => {
    return () => debouncedSave.cancel();
  }, [debouncedSave]);

  useEffect(() => {
    if (!isLoaded) return;
    debouncedSave({ blocks, now: Date.now() });
  }, [blocks, isLoaded, debouncedSave]);

  return (
    <div onMouseDown={(e) => e.stopPropagation()}>
      {isLoaded ? <DndEditor /> : <div>Загрузка редактора...</div>}
    </div>
  );
}
