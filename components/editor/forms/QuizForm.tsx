"use client";

import { BlockContent, QuizQuestion, QuestionType } from "@/types/types";
import {
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  HelpCircle,
  CheckSquare,
  Type,
} from "lucide-react";

interface BaseFormProps {
  content: BlockContent;
  onUpdate: (newContent: BlockContent) => void;
}

const createEmptyQuestion = (type: QuestionType = "single"): QuizQuestion => {
  const base = {
    id: crypto.randomUUID(),
    questionText: "",
  };

  if (type === "text") {
    return { ...base, type, correctAnswerText: "" } as QuizQuestion;
  }

  if (type === "multiple") {
    return {
      ...base,
      type,
      options: ["Вариант 1", "Вариант 2"],
      correctAnswerIndices: [],
    } as QuizQuestion;
  }

  return {
    ...base,
    type: "single",
    options: ["Вариант 1", "Вариант 2"],
    correctAnswerIndex: 0,
  } as QuizQuestion;
};

export const QuizForm = ({ content, onUpdate }: BaseFormProps) => {
  const questions = content.questions || [];

  const updateQuestions = (newQuestions: QuizQuestion[]) => {
    onUpdate({ ...content, questions: newQuestions });
  };

  const updateQuestionData = (qId: string, data: Partial<QuizQuestion>) => {
    updateQuestions(
      questions.map((q) =>
        q.id === qId ? ({ ...q, ...data } as QuizQuestion) : q,
      ),
    );
  };

  const toggleMultipleAnswer = (q: QuizQuestion, index: number) => {
    if (q.type !== "multiple") return;
    const current = q.correctAnswerIndices;
    const next = current.includes(index)
      ? current.filter((i) => i !== index)
      : [...current, index];
    updateQuestionData(q.id, { type: "multiple", correctAnswerIndices: next });
  };

  return (
    <div className="space-y-8 px-6 py-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700">
        <label className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
          Конструктор теста ({questions.length})
        </label>
        <div className="flex gap-2">
          <button
            onClick={() =>
              updateQuestions([...questions, createEmptyQuestion("single")])
            }
            className="flex items-center gap-1.5 text-[10px] bg-slate-900 dark:bg-slate-700 text-white px-3 py-2 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-600 font-bold shadow-sm"
          >
            <Plus size={12} /> Одиночный
          </button>
          <button
            onClick={() =>
              updateQuestions([...questions, createEmptyQuestion("multiple")])
            }
            className="flex items-center gap-1.5 text-[10px] bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-500 font-bold shadow-sm"
          >
            <Plus size={12} /> Множественный
          </button>
          <button
            onClick={() =>
              updateQuestions([...questions, createEmptyQuestion("text")])
            }
            className="flex items-center gap-1.5 text-[10px] bg-emerald-600 text-white px-3 py-2 rounded-lg hover:bg-emerald-500 font-bold shadow-sm"
          >
            <Type size={12} /> Текстовый
          </button>
        </div>
      </div>

      <div className="space-y-10">
        {questions.map((q) => (
          <div
            key={q.id}
            className="p-6 rounded-2xl border-2 border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm space-y-5 relative group"
          >
            {/* Badge типа вопроса */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase">
              {q.type === "single" && <Circle size={10} />}
              {q.type === "multiple" && <CheckSquare size={10} />}
              {q.type === "text" && <Type size={10} />}
              {q.type === "single"
                ? "Один ответ"
                : q.type === "multiple"
                  ? "Несколько ответов"
                  : "Текстовый ответ"}
            </div>

            <button
              onClick={() =>
                updateQuestions(questions.filter((item) => item.id !== q.id))
              }
              className="absolute -top-3 -right-3 p-2 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 text-slate-400 hover:text-red-600 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all"
            >
              <Trash2 size={16} />
            </button>

            {/* Текст вопроса */}
            <input
              type="text"
              className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-[#3b5bdb] dark:focus:border-[#5c7cfa] focus:bg-white dark:focus:bg-slate-950 rounded-xl px-4 py-3 outline-none font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all"
              placeholder="Напишите текст вопроса..."
              value={q.questionText}
              onChange={(e) =>
                updateQuestionData(q.id, { questionText: e.target.value })
              }
            />

            <div className="space-y-3">
              {q.type === "text" ? (
                <div className="space-y-2">
                  <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1">
                    Правильный ответ (студент должен ввести это)
                  </span>
                  <input
                    type="text"
                    className="w-full bg-emerald-50/50 dark:bg-emerald-900/20 border-2 border-emerald-100 dark:border-emerald-900/50 focus:border-emerald-500 rounded-xl px-4 py-3 outline-none font-bold text-emerald-900 dark:text-emerald-100 transition-all"
                    placeholder="Введите текст правильного ответа..."
                    value={q.correctAnswerText}
                    onChange={(e) =>
                      updateQuestionData(q.id, {
                        type: "text",
                        correctAnswerText: e.target.value,
                      })
                    }
                  />
                </div>
              ) : (
                <div className="grid gap-3">
                  <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1">
                    Варианты ответов
                  </span>
                  {q.options.map((option, optIndex) => {
                    const isCorrect =
                      q.type === "single"
                        ? q.correctAnswerIndex === optIndex
                        : q.correctAnswerIndices.includes(optIndex);

                    return (
                      <div
                        key={optIndex}
                        className="flex items-center gap-3 group/opt"
                      >
                        <button
                          onClick={() =>
                            q.type === "single"
                              ? updateQuestionData(q.id, {
                                  type: "single",
                                  correctAnswerIndex: optIndex,
                                })
                              : toggleMultipleAnswer(q, optIndex)
                          }
                          className={`shrink-0 transition-all ${isCorrect ? "text-green-600 dark:text-green-400 scale-110" : "text-slate-200 dark:text-slate-700 hover:text-slate-400"}`}
                        >
                          {isCorrect ? (
                            <CheckCircle2 size={24} strokeWidth={3} />
                          ) : (
                            <Circle size={24} />
                          )}
                        </button>
                        <input
                          type="text"
                          className={`flex-1 text-sm font-semibold p-3 rounded-xl border-2 transition-all ${
                            isCorrect
                              ? "bg-green-50 dark:bg-green-900/20 border-green-500 dark:border-green-600 text-green-900 dark:text-green-100"
                              : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white focus:border-[#3b5bdb] dark:focus:border-[#5c7cfa]"
                          }`}
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...q.options];
                            newOptions[optIndex] = e.target.value;
                            updateQuestionData(q.id, { options: newOptions });
                          }}
                        />
                        {q.options.length > 2 && (
                          <button
                            onClick={() =>
                              updateQuestionData(q.id, {
                                options: q.options.filter(
                                  (_, i) => i !== optIndex,
                                ),
                              })
                            }
                            className="p-2 text-slate-300 dark:text-slate-600 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                  <button
                    onClick={() =>
                      updateQuestionData(q.id, {
                        options: [
                          ...q.options,
                          `Вариант ${q.options.length + 1}`,
                        ],
                      })
                    }
                    className="inline-flex items-center text-xs text-slate-900 dark:text-slate-300 font-black hover:text-blue-600 dark:hover:text-blue-400 mt-2 pl-9"
                  >
                    <Plus size={14} className="mr-1" strokeWidth={3} /> Добавить
                    вариант
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {questions.length === 0 && (
        <div className="text-center py-16 border-4 border-dashed border-slate-100 dark:border-slate-800 rounded-2rem bg-slate-50/20 dark:bg-slate-900/20">
          <HelpCircle size={48} className="mx-auto text-slate-200 dark:text-slate-700 mb-4" />
          <p className="text-slate-900 dark:text-white font-bold text-lg">
            Создайте свой первый вопрос
          </p>
        </div>
      )}
    </div>
  );
};
