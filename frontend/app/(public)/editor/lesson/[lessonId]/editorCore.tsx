"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  ArrowLeft,
  Loader2,
  BookOpen,
  FileText,
  Video,
  HelpCircle,
  Sun,
  Moon,
} from "lucide-react";
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
import {
  lessonsBlocksApi,
  toLessonBlockData,
} from "@/lib/api/entities/api-lessons";
import { useToast } from "@/hooks/useToast";
import { Toaster } from "react-hot-toast";

export default function Editor() {
  const params = useParams();
  const router = useRouter();
  const { lessonId } = params as { lessonId: string };
  const { blocks, setBlocks, lessonInfo, setLessonInfo } = useConstructor();
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const isTempId = useCallback((id: string) => id.startsWith("temp_"), []);

  const validateBlocks = useCallback((): string | null => {
    if (!lessonInfo.title.trim()) {
      return "Укажите название урока";
    }

    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];
      const blockNumber = i + 1;

      if (!block.title.trim()) {
        return `Блок #${blockNumber}: укажите название блока`;
      }

      if (block.type === "text") {
        if (!block.content.text?.trim()) {
          return `Блок #${blockNumber} (текст): добавьте текстовое содержимое`;
        }
      } else if (block.type === "video") {
        if (!block.content.url?.trim()) {
          return `Блок #${blockNumber} (видео): укажите ссылку на видео`;
        }
      } else if (block.type === "quiz") {
        if (!block.content.questions || block.content.questions.length === 0) {
          return `Блок #${blockNumber} (викторина): добавьте хотя бы один вопрос`;
        }

        for (let j = 0; j < block.content.questions.length; j++) {
          const question = block.content.questions[j];
          if (!question.questionText.trim()) {
            return `Блок #${blockNumber} (викторина), вопрос #${j + 1}: укажите текст вопроса`;
          }

          if (question.type === "single" || question.type === "multiple") {
            if (!question.options || question.options.length === 0) {
              return `Блок #${blockNumber} (викторина), вопрос #${j + 1}: добавьте варианты ответов`;
            }
            if (
              (question.type === "single" &&
                question.correctAnswerIndex === undefined) ||
              (question.type === "multiple" &&
                (!question.correctAnswerIndices ||
                  question.correctAnswerIndices.length === 0))
            ) {
              return `Блок #${blockNumber} (викторина), вопрос #${j + 1}: укажите правильный ответ`;
            }
          } else if (question.type === "text") {
            if (!question.correctAnswerText?.trim()) {
              return `Блок #${blockNumber} (викторина), вопрос #${j + 1}: укажите правильный ответ`;
            }
          }
        }
      }
    }

    return null;
  }, [blocks, lessonInfo.title]);

  const handleSave = useCallback(async () => {
    if (!lessonId) {
      toast.error("ID урока не определён");
      return;
    }

    const validationError = validateBlocks();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setIsSaving(true);
    try {
      const contentBlocks = blocks.map((block, index) => ({
        ...toLessonBlockData(block),
        order_index: index,
      }));

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
  }, [blocks, lessonId, lessonInfo.title, toast, validateBlocks]);

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <button
            onClick={handleGoBack}
            className="
              flex items-center gap-2 px-4 py-2.5
              text-slate-500 dark:text-slate-400 hover:text-[#3b5bdb] dark:hover:text-indigo-400
              hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl
              transition-all duration-200 font-semibold text-sm
            "
          >
            <ArrowLeft size={18} />
            <span>Назад к секциям</span>
          </button>

          {mounted && (
            <button
              onClick={() =>
                setTheme(resolvedTheme === "dark" ? "light" : "dark")
              }
              className="p-2 rounded-full hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors"
            >
              {resolvedTheme === "dark" ? (
                <Sun size={18} className="text-yellow-400" />
              ) : (
                <Moon size={18} className="text-slate-600" />
              )}
            </button>
          )}
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`
            px-6 py-2.5 text-white rounded-xl font-bold text-sm
            transition-all duration-200
            ${
              isSaving
                ? "bg-slate-300 dark:bg-slate-700 cursor-not-allowed text-slate-500 dark:text-slate-400"
                : "bg-gradient-to-r from-[#3b5bdb] to-[#5c7cfa] hover:shadow-lg hover:shadow-indigo-500/25 hover:-translate-y-0.5"
            }
          `}
        >
          {isSaving ? (
            <span className="flex items-center gap-2">
              <Loader2 size={16} className="animate-spin" />
              Сохранение...
            </span>
          ) : (
            "Сохранить"
          )}
        </button>
      </div>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#3b5bdb] to-[#5c7cfa] flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white">
            <BookOpen size={20} />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">
            Редактор урока
          </h1>
        </div>

        <input
          type="text"
          placeholder="Название урока..."
          value={lessonInfo.title}
          onChange={(e) => handleLessonChange(e.target.value)}
          className="
            w-full bg-transparent
            text-xl font-bold text-slate-800 dark:text-white
            placeholder:text-slate-300 dark:placeholder:text-slate-600
            outline-none border-none
            border-b-2 border-transparent focus:border-indigo-200 dark:focus:border-indigo-500/30
            pb-2 transition-colors duration-200
          "
        />
      </div>

      <p className="text-sm font-medium text-slate-400 dark:text-slate-500 mb-8">
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

      <div className="mt-8 p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-5 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
              <BookOpen
                size={16}
                className="text-[#3b5bdb] dark:text-indigo-400"
              />
            </div>
            <div>
              <div className="text-xl font-extrabold text-slate-800 dark:text-white">
                {blocks.length}
              </div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                блоков
              </div>
            </div>
          </div>

          <div className="w-px h-10 bg-slate-100 dark:bg-slate-800" />

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
              <FileText
                size={16}
                className="text-emerald-600 dark:text-emerald-400"
              />
            </div>
            <div>
              <div className="text-xl font-extrabold text-slate-800 dark:text-white">
                {blocks.filter((b) => b.type === "text").length}
              </div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                текстовых
              </div>
            </div>
          </div>

          <div className="w-px h-10 bg-slate-100 dark:bg-slate-800" />

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center">
              <Video
                size={16}
                className="text-violet-600 dark:text-violet-400"
              />
            </div>
            <div>
              <div className="text-xl font-extrabold text-slate-800 dark:text-white">
                {blocks.filter((b) => b.type === "video").length}
              </div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                видео
              </div>
            </div>
          </div>

          <div className="w-px h-10 bg-slate-100 dark:bg-slate-800" />

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
              <HelpCircle
                size={16}
                className="text-amber-600 dark:text-amber-400"
              />
            </div>
            <div>
              <div className="text-xl font-extrabold text-slate-800 dark:text-white">
                {blocks.filter((b) => b.type === "quiz").length}
              </div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                викторин
              </div>
            </div>
          </div>
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
