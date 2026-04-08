"use client";

import { useState, useCallback, useEffect, memo } from "react";
import { CheckCircle2, Circle, XCircle } from "lucide-react";
import { CompletionButton } from "@/components/learning/CompletionButton";
import { useLearning } from "@/hooks/useLearning";
import type { IQuizBlock, IQuizAnswer } from "@/types/types";

const QUESTION_TYPE_BADGES = {
  single: { label: "Один ответ", color: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400" },
  multiple: {
    label: "Несколько ответов",
    color: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400",
  },
  text: {
    label: "Текстовый ответ",
    color: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400",
  },
} as const;

export function QuizBlockView({ content }: { content: IQuizBlock["content"] }) {
  const { currentLessonId, updateQuizAnswers } = useLearning();

  const [answers, setAnswers] = useState<Record<string, number | number[] | string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<{ correct: number; total: number } | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    setAnswers({});
    setSubmitted(false);
    setScore(null);
    setIsChecking(false);
  }, [content]);

  const handleSingleAnswer = useCallback((questionId: string, answerIndex: number) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [questionId]: answerIndex }));
  }, [submitted]);

  const handleMultipleAnswer = useCallback((questionId: string, answerIndex: number) => {
    if (submitted) return;
    setAnswers((prev) => {
      const current = (prev[questionId] as number[]) || [];
      const next = current.includes(answerIndex)
        ? current.filter((i) => i !== answerIndex)
        : [...current, answerIndex];
      return { ...prev, [questionId]: next };
    });
  }, [submitted]);

  const handleTextAnswer = useCallback((questionId: string, answer: string) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  }, [submitted]);

  const checkAnswers = useCallback(async () => {
    if (!currentLessonId || isChecking) return;

    setIsChecking(true);
    let correct = 0;
    const quizAnswers: IQuizAnswer[] = [];

    for (const question of content.questions) {
      const userAnswer = answers[question.id];
      let isCorrect = false;

      if (question.type === "single") {
        isCorrect = userAnswer === question.correctAnswerIndex;
        quizAnswers.push({
          questionId: question.id,
          selectedAnswer: userAnswer as number,
          isCorrect,
        });
      } else if (question.type === "multiple") {
        const userIndices = (userAnswer as number[]) || [];
        const correctIndices = question.correctAnswerIndices || [];
        isCorrect =
          userIndices.length === correctIndices.length &&
          userIndices.every((i) => correctIndices.includes(i));
        quizAnswers.push({
          questionId: question.id,
          selectedAnswer: userIndices,
          isCorrect,
        });
      } else if (question.type === "text") {
        isCorrect =
          (userAnswer as string)?.toLowerCase().trim() ===
          (question.correctAnswerText || "").toLowerCase().trim();
        quizAnswers.push({
          questionId: question.id,
          selectedAnswer: userAnswer as string,
          isCorrect,
        });
      }

      if (isCorrect) correct++;
    }

    setScore({ correct, total: content.questions.length });
    setSubmitted(true);
    setIsChecking(false);

    updateQuizAnswers(currentLessonId, quizAnswers).catch((error) => {
      console.error("Ошибка при сохранении ответов:", error);
    });
  }, [answers, content.questions, currentLessonId, isChecking, updateQuizAnswers]);

  const resetQuiz = useCallback(() => {
    setAnswers({});
    setSubmitted(false);
    setScore(null);
  }, []);

  const answeredCount = Object.keys(answers).length;
  const hasAnsweredAll = answeredCount === content.questions.length;

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Викторина</h2>
      <p className="text-slate-500 dark:text-slate-400 mb-8">
        Ответьте на все вопросы и нажмите &quot;Проверить ответы&quot;
      </p>

      <div className="space-y-8">
        {content.questions.map((q, idx) => (
          <QuestionCard
            key={q.id}
            question={q}
            index={idx}
            answer={answers[q.id]}
            submitted={submitted}
            onSingleAnswer={handleSingleAnswer}
            onMultipleAnswer={handleMultipleAnswer}
            onTextAnswer={handleTextAnswer}
          />
        ))}
      </div>

      <div className="mt-8 flex items-center gap-4">
        {!submitted ? (
          <button
            onClick={checkAnswers}
            disabled={!hasAnsweredAll || isChecking}
            className="px-8 py-4 bg-[#3b5bdb] text-white rounded-xl font-bold hover:bg-[#2f4a9e] transition-colors disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed shadow-lg shadow-blue-500/25"
          >
            {isChecking ? "Проверка..." : "Проверить ответы"}
          </button>
        ) : (
          <div className="flex items-center gap-6">
            <div className={`px-6 py-3 rounded-xl font-bold ${
              score && score.correct === score.total
                ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
            }`}>
              Ваш результат: {score?.correct} из {score?.total}
            </div>
            <button
              onClick={resetQuiz}
              className="px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Попробовать снова
            </button>
            {score && score.correct === score.total && <CompletionButton />}
          </div>
        )}
      </div>
    </div>
  );
}

interface QuestionCardProps {
  question: IQuizBlock["content"]["questions"][0];
  index: number;
  answer: number | number[] | string | undefined;
  submitted: boolean;
  onSingleAnswer: (qId: string, idx: number) => void;
  onMultipleAnswer: (qId: string, idx: number) => void;
  onTextAnswer: (qId: string, text: string) => void;
}

const QuestionCard = memo<QuestionCardProps>(function QuestionCard({
  question,
  index,
  answer,
  submitted,
  onSingleAnswer,
  onMultipleAnswer,
  onTextAnswer,
}) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
      <div className="flex items-start gap-3 mb-4">
        <span className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center font-bold text-sm">
          {index + 1}
        </span>
        <div className="flex-1">
          <p className="font-semibold text-slate-900 dark:text-white">{question.questionText}</p>
          <QuestionTypeBadge type={question.type} />
        </div>
      </div>

      <div className="space-y-3 pl-11">
        {question.type === "single" && (
          <SingleChoiceOptions
            question={question}
            answer={answer as number | undefined}
            submitted={submitted}
            onSelect={onSingleAnswer}
          />
        )}

        {question.type === "multiple" && (
          <MultipleChoiceOptions
            question={question}
            answers={(answer as number[]) || []}
            submitted={submitted}
            onSelect={onMultipleAnswer}
          />
        )}

        {question.type === "text" && (
          <TextAnswerInput
            question={question}
            answer={answer as string | undefined}
            submitted={submitted}
            onChange={onTextAnswer}
          />
        )}
      </div>
    </div>
  );
});

function QuestionTypeBadge({ type }: { type: string }) {
  const badge = QUESTION_TYPE_BADGES[type as keyof typeof QUESTION_TYPE_BADGES];
  return (
    <span className={`inline-block mt-2 px-2.5 py-1 rounded-full text-xs font-medium ${badge.color}`}>
      {badge.label}
    </span>
  );
}

interface SingleChoiceOptionsProps {
  question: IQuizBlock["content"]["questions"][0];
  answer: number | undefined;
  submitted: boolean;
  onSelect: (qId: string, idx: number) => void;
}

const SingleChoiceOptions = memo<SingleChoiceOptionsProps>(function SingleChoiceOptions({
  question,
  answer,
  submitted,
  onSelect,
}) {
  const options = question.options || [];
  const correctIndex = question.correctAnswerIndex;

  return (
    <div className="space-y-2">
      {options.map((option, optIdx) => {
        const isSelected = answer === optIdx;
        const isCorrect = optIdx === correctIndex;
        let buttonStyle = "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700";

        if (submitted) {
          if (isCorrect) {
            buttonStyle = "bg-green-50 dark:bg-green-900/20 border-green-500 dark:border-green-400";
          } else if (isSelected && !isCorrect) {
            buttonStyle = "bg-red-50 dark:bg-red-900/20 border-red-500 dark:border-red-400";
          } else {
            buttonStyle = "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 opacity-60";
          }
        } else if (isSelected) {
          buttonStyle = "bg-blue-50 dark:bg-blue-900/20 border-blue-500 dark:border-blue-400";
        }

        return (
          <button
            key={optIdx}
            onClick={() => onSelect(question.id, optIdx)}
            disabled={submitted}
            className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-colors disabled:cursor-not-allowed ${buttonStyle}`}
          >
            {submitted ? (
              isCorrect ? (
                <CheckCircle2 className="text-green-500 flex-shrink-0" size={20} />
              ) : isSelected ? (
                <XCircle className="text-red-500 flex-shrink-0" size={20} />
              ) : (
                <Circle className="text-slate-400 dark:text-slate-500 flex-shrink-0" size={20} />
              )
            ) : isSelected ? (
              <CheckCircle2 className="text-blue-500 flex-shrink-0" size={20} />
            ) : (
              <Circle className="text-slate-400 dark:text-slate-500 flex-shrink-0" size={20} />
            )}
            <span className="text-left text-slate-900 dark:text-white">{option}</span>
          </button>
        );
      })}
    </div>
  );
});

interface MultipleChoiceOptionsProps {
  question: IQuizBlock["content"]["questions"][0];
  answers: number[];
  submitted: boolean;
  onSelect: (qId: string, idx: number) => void;
}

const MultipleChoiceOptions = memo<MultipleChoiceOptionsProps>(function MultipleChoiceOptions({
  question,
  answers,
  submitted,
  onSelect,
}) {
  const options = question.options || [];
  const correctIndices = question.correctAnswerIndices || [];

  return (
    <div className="space-y-2">
      {options.map((option, optIdx) => {
        const isSelected = answers.includes(optIdx);
        const isCorrect = correctIndices.includes(optIdx);
        let buttonStyle = "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700";

        if (submitted) {
          if (isCorrect) {
            buttonStyle = "bg-green-50 dark:bg-green-900/20 border-green-500 dark:border-green-400";
          } else if (isSelected && !isCorrect) {
            buttonStyle = "bg-red-50 dark:bg-red-900/20 border-red-500 dark:border-red-400";
          } else {
            buttonStyle = "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 opacity-60";
          }
        } else if (isSelected) {
          buttonStyle = "bg-blue-50 dark:bg-blue-900/20 border-blue-500 dark:border-blue-400";
        }

        return (
          <button
            key={optIdx}
            onClick={() => onSelect(question.id, optIdx)}
            disabled={submitted}
            className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-colors disabled:cursor-not-allowed ${buttonStyle}`}
          >
            {submitted ? (
              isCorrect ? (
                <CheckCircle2 className="text-green-500 flex-shrink-0" size={20} />
              ) : isSelected ? (
                <XCircle className="text-red-500 flex-shrink-0" size={20} />
              ) : (
                <Circle className="text-slate-400 dark:text-slate-500 flex-shrink-0" size={20} />
              )
            ) : isSelected ? (
              <CheckCircle2 className="text-blue-500 flex-shrink-0" size={20} />
            ) : (
              <Circle className="text-slate-400 dark:text-slate-500 flex-shrink-0" size={20} />
            )}
            <span className="text-left text-slate-900 dark:text-white">{option}</span>
          </button>
        );
      })}
    </div>
  );
});

interface TextAnswerInputProps {
  question: IQuizBlock["content"]["questions"][0];
  answer: string | undefined;
  submitted: boolean;
  onChange: (qId: string, text: string) => void;
}

const TextAnswerInput = memo<TextAnswerInputProps>(function TextAnswerInput({
  question,
  answer,
  submitted,
  onChange,
}) {
  return (
    <input
      type="text"
      value={answer || ""}
      onChange={(e) => onChange(question.id, e.target.value)}
      disabled={submitted}
      placeholder="Введите ваш ответ..."
      className={`w-full px-4 py-3 rounded-lg border-2 text-slate-900 dark:text-white transition-colors disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:cursor-not-allowed ${
        submitted
          ? "border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800"
          : "border-slate-500 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400"
      }`}
    />
  );
});
