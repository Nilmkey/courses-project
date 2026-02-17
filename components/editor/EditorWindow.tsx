"use client";
import { useEffect } from "react";
import { X } from "lucide-react";
import { useConstructor } from "@/hooks/useConstructor";
import { BlockContent } from "@/types/types";
import { MilkdownEditorWrapper } from "./forms/TextForm";
import { VideoForm } from "./forms/VideoForm";
import { QuizForm } from "./forms/QuizForm";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  id: string;
}

const FORM_COMPONENTS = {
  text: MilkdownEditorWrapper,
  video: VideoForm,
  quiz: QuizForm,
};

export function EditorWindow({ isOpen, onClose, id }: ModalProps) {
  const { blocks, setBlocks } = useConstructor();

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const activeBlock = blocks.find((b) => b.id === id);
  const type = activeBlock!.type;
  const Form = FORM_COMPONENTS[type];

  const handleEditBlock = (newContent: BlockContent) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, content: newContent } : b)),
    );
  };

  const handleChangeTitle = (newTitle: string) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, title: newTitle } : b)),
    );
  };

  return (
    <div className="fixed inset-0 z-5000 flex items-center justify-center p-4 sm:p-6 md:p-10">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative flex w-full h-full max-h-[90vh] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between gap-6 border-b border-slate-100 bg-white px-6 py-6">
          <div className="min-w-0">
            <div className="flex justify-between items-center gap-5">
              <h2 className=" text-2xl font-bold text-slate-900">
                Редактирование
              </h2>
              <input
                type="text"
                placeholder="[название]"
                value={activeBlock?.title}
                className="w-full bg-transparent text-2xl  text-slate-800 placeholder-slate-200 outline-none"
                onChange={(e) => handleChangeTitle(e.target.value)}
              ></input>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-full p-2 text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={28} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto bg-white min-h-0 relative">
          <div className="h-full w-full">
            {Form ? (
              <Form
                content={activeBlock?.content as BlockContent}
                onUpdate={handleEditBlock}
              />
            ) : (
              <div className="text-center py-10 text-slate-400">
                Форма для этого типа блока еще не создана
              </div>
            )}
          </div>
        </div>

        <div className="shrink-0 p-6 bg-white border-t border-slate-100">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-background3 px-10 p-4 text-sm font-semibold text-background4 shadow-lg transition-all hover:bg-slate-800 active:scale-95"
            >
              Сохранить изменения
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
