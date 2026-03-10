"use client";

import { useState, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import DragItem from "@/components/ui/dragItem";
import { AddItemButton } from "@/components/ui/addItemButton";
import { useConstructor } from "@/hooks/useConstructor";
import { EditorWindow } from "@/components/editor/EditorWindow";
import { lessonsBlocksApi, toLessonBlockData } from "@/lib/api/entities/api-lessons";
import { useToast } from "@/hooks/useToast";

export default function Editor() {
  const params = useParams();
  const router = useRouter();
  const { lessonId } = params as { lessonId: string };
  const { blocks, setBlocks, lessonInfo, setLessonInfo } = useConstructor();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const toast = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  const activeBlock = useMemo(
    () => blocks.find((b) => b.id === activeId),
    [blocks, activeId],
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleEdit = useCallback(() => {
    if (!activeBlock) return;
    setEditingId(activeBlock.id);
  }, [activeBlock, setEditingId]);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
        setBlocks((items) => {
          const oldIndex = items.findIndex((i) => i.id === active.id);
          const newIndex = items.findIndex((i) => i.id === over.id);
          return arrayMove(items, oldIndex, newIndex);
        });
      }
      setActiveId(null);
    },
    [setBlocks],
  );

  const handleCloseModal = useCallback(() => {
    setEditingId(null);
  }, []);

  const handleGoBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleLessonChange = useCallback(
    (title: string) => {
      setLessonInfo((prev) => ({ ...prev, title }));
    },
    [setLessonInfo],
  );

  // Проверка, является ли ID временным
  const isTempId = useCallback((id: string) => id.startsWith("temp_"), []);

  // ========== Сохранение ==========

  const handleSave = useCallback(async () => {
    if (!lessonId) {
      toast.error("ID урока не определён");
      return;
    }

    setIsSaving(true);
    try {
      // Конвертируем блоки в формат для API
      const contentBlocks = blocks.map((block, index) => ({
        ...toLessonBlockData(block),
        order_index: index,
      }));

      // Отправляем обновление урока на сервер
      await lessonsBlocksApi.update(lessonId, {
        title: lessonInfo.title,
        content_blocks: contentBlocks,
      });

      toast.success("Урок успешно сохранён!");
    } catch (error) {
      console.error("Ошибка при сохранении урока:", error);
      toast.error("Не удалось сохранить урок");
    } finally {
      setIsSaving(false);
    }
  }, [blocks, lessonId, lessonInfo.title, toast]);

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={handleGoBack}
            className="
              flex items-center gap-2 px-4 py-2
              text-slate-600 hover:text-slate-900
              hover:bg-slate-100 rounded-lg
              transition-colors
            "
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Назад к секциям</span>
          </button>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`
            px-6 py-3 rounded-lg font-medium transition-all
            shadow-sm hover:shadow-md
            ${
              isSaving
                ? "bg-slate-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }
            text-white
          `}
        >
          {isSaving ? (
            <span className="flex items-center gap-2">
              <Loader2 size={18} className="animate-spin" />
              Сохранение...
            </span>
          ) : (
            "Сохранить"
          )}
        </button>
      </div>

      <h1 className="text-3xl font-bold text-slate-900 mb-2">Редактор урока</h1>
      
      {/* Название урока */}
      <div className="mb-8">
        <input
          type="text"
          placeholder="[название урока]"
          value={lessonInfo.title}
          onChange={(e) => handleLessonChange(e.target.value)}
          className="w-full bg-transparent text-2xl text-slate-800 placeholder-slate-200 outline-none"
        />
      </div>

      <p className="text-slate-500 mb-8">
        Перетаскивайте блоки для изменения порядка
      </p>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={blocks} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {blocks.map((block) => (
              <DragItem
                key={block.id}
                block={block}
                onEdit={setEditingId}
                onDelete={(id) =>
                  setBlocks((prev) => prev.filter((b) => b.id !== id))
                }
              />
            ))}
          </div>
        </SortableContext>

        <DragOverlay
          dropAnimation={{
            sideEffects: defaultDropAnimationSideEffects({
              styles: { active: { opacity: "0.5" } },
            }),
          }}
        >
          {activeId && activeBlock ? (
            <div className="cursor-grabbing">
              <DragItem
                block={activeBlock}
                onEdit={handleEdit}
                onDelete={() => {}}
                isOverlay
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <AddItemButton />

      {/* Статистика */}
      <div className="mt-8 p-4 bg-slate-50 rounded-xl border border-slate-200">
        <div className="flex items-center gap-6 text-sm text-slate-600">
          <span>
            <strong className="text-slate-900">{blocks.length}</strong> блоков
          </span>
          <span>
            <strong className="text-slate-900">
              {blocks.filter((b) => b.type === "text").length}
            </strong>{" "}
            текстовых
          </span>
          <span>
            <strong className="text-slate-900">
              {blocks.filter((b) => b.type === "video").length}
            </strong>{" "}
            видео
          </span>
          <span>
            <strong className="text-slate-900">
              {blocks.filter((b) => b.type === "quiz").length}
            </strong>{" "}
            викторин
          </span>
        </div>
      </div>

      {editingId && (
        <EditorWindow
          isOpen={!!editingId}
          onClose={handleCloseModal}
          id={editingId}
        />
      )}
    </div>
  );
}
