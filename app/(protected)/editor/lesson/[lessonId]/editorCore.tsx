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
  Save,
  Layers,
  Sparkles
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
import { infoLesson } from "@/types/types";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";

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
  const [initialData, setInitialData] = useState<{ blocks: typeof blocks; lessonInfo: infoLesson } | null>(null);
  const toast = useToast();

  useEffect(() => {
    if (blocks.length > 0 && lessonInfo.title && !initialData) {
      setInitialData({
        blocks: JSON.parse(JSON.stringify(blocks)),
        lessonInfo: { ...lessonInfo },
      });
    }
  }, [blocks, lessonInfo, initialData]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const hasUnsavedChanges = useCallback(() => {
    if (!initialData) return false;
    
    const currentBlocks = JSON.stringify(blocks);
    const currentLessonInfo = JSON.stringify(lessonInfo);
    const initialBlocks = JSON.stringify(initialData.blocks);
    const initialLessonInfo = JSON.stringify(initialData.lessonInfo);
    
    return currentBlocks !== initialBlocks || currentLessonInfo !== initialLessonInfo;
  }, [blocks, lessonInfo, initialData]);

  const { resetChanges } = useUnsavedChanges({
    hasUnsavedChanges,
    message: "У вас есть несохраненные изменения в уроке. Вы уверены, что хотите уйти?",
    enabled: true,
  });

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
              (question.type === "single" && question.correctAnswerIndex === undefined) ||
              (question.type === "multiple" && (!question.correctAnswerIndices || question.correctAnswerIndices.length === 0))
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

      setInitialData({
        blocks: JSON.parse(JSON.stringify(blocks)),
        lessonInfo: { ...lessonInfo },
      });
      resetChanges();
      
      toast.success("Урок успешно сохранён!");
    } catch (error) {
      console.error("Ошибка при сохранении урока:", error);
      toast.error("Не удалось сохранить урок");
    } finally {
      setIsSaving(false);
    }
  }, [blocks, lessonId, lessonInfo.title, toast, validateBlocks, resetChanges]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-300 relative overflow-hidden">
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: resolvedTheme === "dark" ? "#0f172a" : "#ffffff",
            color: resolvedTheme === "dark" ? "#f1f5f9" : "#0f172a",
            border:
              resolvedTheme === "dark"
                ? "1px solid #1e293b"
                : "1px solid #e2e8f0",
            borderRadius: "1rem",
            boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
            padding: "16px 20px",
            fontWeight: "600",
          },
        }}
      />

       {/* Glow Effects */}
       <div className="absolute top-[20%] right-[-10%] w-[35rem] h-[35rem] bg-indigo-500/10 dark:bg-indigo-600/10 rounded-full blur-[140px] mix-blend-multiply dark:mix-blend-screen pointer-events-none z-0" />
       
       <header className="sticky top-0 z-50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm transition-colors">
          <div className="max-w-4xl mx-auto px-4 h-20 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={handleGoBack}
                className="group flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl transition-all"
              >
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                <span>К секциям</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
               {mounted && (
                <button
                  onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all shadow-inner border border-slate-200/50 dark:border-slate-700/50"
                  title={resolvedTheme === "dark" ? "Светлая тема" : "Темная тема"}
                >
                  {resolvedTheme === "dark" ? (
                    <Sun size={18} className="text-yellow-400" />
                  ) : (
                    <Moon size={18} className="text-slate-600" />
                  )}
                </button>
              )}
               <button
                onClick={handleSave}
                disabled={isSaving || !hasUnsavedChanges()}
                className={`
                  flex items-center gap-2 h-12 px-6 rounded-xl font-bold
                  transition-all duration-300 ease-out
                  ${
                    isSaving || !hasUnsavedChanges()
                      ? "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed border-transparent"
                      : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 active:scale-95"
                  }
                `}
              >
                {isSaving ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Save size={18} />
                )}
                <span className="hidden sm:inline">{isSaving ? "Сохранение..." : "Сохранить урок"}</span>
              </button>
            </div>
          </div>
       </header>

      <main className="max-w-4xl mx-auto py-12 px-4 relative z-10 w-full mb-20">
        <div className="mb-10 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md p-8 rounded-[2.5rem] border border-slate-200/50 dark:border-slate-800/50 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
          
          <div className="flex items-start gap-5 relative z-10">
             <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white flex-shrink-0">
               <BookOpen size={28} />
             </div>
             <div className="w-full">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1 block">
                  Название урока
                </label>
                <input
                  type="text"
                  placeholder="Введите название урока..."
                  value={lessonInfo.title}
                  onChange={(e) => handleLessonChange(e.target.value)}
                  className="
                    w-full bg-transparent
                    text-3xl font-black text-slate-900 dark:text-white
                    placeholder:text-slate-300 dark:placeholder:text-slate-600
                    outline-none border-none
                    border-b-2 border-transparent focus:border-indigo-500/30
                    pb-2 transition-colors duration-200 mt-1
                  "
                />
             </div>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-6">
           <Sparkles className="w-5 h-5 text-indigo-500" />
           <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
             Перетаскивайте блоки для изменения их порядка отображения
           </p>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={blocks} strategy={verticalListSortingStrategy}>
            <div className="space-y-4">
              {blocks.map((block) => (
                <div key={block.id} className="relative group/block">
                   <DragItem
                      block={block}
                      onEdit={setEditingId}
                      onDelete={(id) =>
                        setBlocks((prev) => prev.filter((b) => b.id !== id))
                      }
                    />
                </div>
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
              <div className="cursor-grabbing scale-[1.02] shadow-2xl rounded-2xl rotate-2">
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

        <div className="mt-8">
          <AddItemButton />
        </div>

        {/* Stats footer */}
        <div className="mt-12 p-6 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md rounded-[2rem] border border-slate-200/50 dark:border-slate-800/50 shadow-sm overflow-x-auto custom-scrollbar">
          <div className="flex items-center gap-6 md:gap-10 justify-center min-w-max px-4">
            <div className="flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center shadow-inner group-hover:bg-indigo-100 transition-colors">
                <Layers size={20} className="text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <div className="text-2xl font-black text-slate-800 dark:text-white leading-none">
                  {blocks.length}
                </div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                  всего блоков
                </div>
              </div>
            </div>

            <div className="w-px h-12 bg-slate-200/50 dark:bg-slate-800/50" />

            <div className="flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 flex items-center justify-center shadow-inner group-hover:bg-emerald-100 transition-colors">
                <FileText size={20} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <div className="text-2xl font-black text-slate-800 dark:text-white leading-none">
                  {blocks.filter((b) => b.type === "text").length}
                </div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                  тексты
                </div>
              </div>
            </div>

            <div className="w-px h-12 bg-slate-200/50 dark:bg-slate-800/50" />

            <div className="flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-2xl bg-violet-50 dark:bg-violet-500/10 border border-violet-100 dark:border-violet-500/20 flex items-center justify-center shadow-inner group-hover:bg-violet-100 transition-colors">
                <Video size={20} className="text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <div className="text-2xl font-black text-slate-800 dark:text-white leading-none">
                  {blocks.filter((b) => b.type === "video").length}
                </div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                  видео
                </div>
              </div>
            </div>

            <div className="w-px h-12 bg-slate-200/50 dark:bg-slate-800/50" />

            <div className="flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 flex items-center justify-center shadow-inner group-hover:bg-amber-100 transition-colors">
                 <HelpCircle size={20} className="text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <div className="text-2xl font-black text-slate-800 dark:text-white leading-none">
                  {blocks.filter((b) => b.type === "quiz").length}
                </div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                  тесты
                </div>
              </div>
            </div>
          </div>
        </div>

      </main>

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
