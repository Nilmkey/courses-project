"use client";

import { useState, useCallback, memo } from "react";
import { CheckCircle2, Circle, XCircle, RefreshCw } from "lucide-react";
import { useLearning } from "@/hooks/useLearning";
import type { IQuizBlock, IQuizAnswer } from "@/types/types";

const QUESTION_TYPE_BADGES = {
  single: {
    label: "Один ответ",
    color:
      "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400",
  },
  multiple: {
    label: "Несколько ответов",
    color:
      "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400",
  },
  text: {
    label: "Текстовый ответ",
    color:
      "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400",
  },
} as const;

interface QuizBlockViewProps {
  content: IQuizBlock["content"];
  onQuizPassed?: () => void;
}

export function QuizBlockView({ content, onQuizPassed }: QuizBlockViewProps) {
  const { currentLessonId, updateQuizAnswers, isCurrentBlockCompleted } =
    useLearning();

  const [answers, setAnswers] = useState<
    Record<string, number | number[] | string>
  >({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<{ correct: number; total: number } | null>(
    null,
  );
  const [isChecking, setIsChecking] = useState(false);

  const handleSingleAnswer = useCallback(
    (questionId: string, answerIndex: number) => {
      if (submitted) return;
      setAnswers((prev) => ({ ...prev, [questionId]: answerIndex }));
    },
    [submitted],
  );

  const handleMultipleAnswer = useCallback(
    (questionId: string, answerIndex: number) => {
      if (submitted) return;
      setAnswers((prev) => {
        const current = (prev[questionId] as number[]) || [];
        const next = current.includes(answerIndex)
          ? current.filter((i) => i !== answerIndex)
          : [...current, answerIndex];
        return { ...prev, [questionId]: next };
      });
    },
    [submitted],
  );

  const handleTextAnswer = useCallback(
    (questionId: string, answer: string) => {
      if (submitted) return;
      setAnswers((prev) => ({ ...prev, [questionId]: answer }));
    },
    [submitted],
  );

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

    const isAllCorrect = correct === content.questions.length;
    setScore({ correct, total: content.questions.length });
    setSubmitted(true);
    setIsChecking(false);

    if (isAllCorrect && onQuizPassed) {
      onQuizPassed();
    }

    updateQuizAnswers(currentLessonId, quizAnswers).catch((error) => {
      console.error("Ошибка при сохранении ответов:", error);
    });
  }, [
    answers,
    content.questions,
    currentLessonId,
    isChecking,
    onQuizPassed,
    updateQuizAnswers,
  ]);

  const resetQuiz = useCallback(() => {
    setAnswers({});
    setSubmitted(false);
    setScore(null);
  }, []);

  const answeredCount = Object.keys(answers).length;
  const hasAnsweredAll = answeredCount === content.questions.length;

  return (
    <div>
      {/* Баннер, если блок уже успешно пройден */}
      {isCurrentBlockCompleted && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 size={22} />
            </div>
            <div>
              <p className="font-bold text-emerald-900 dark:text-emerald-200 text-sm">
                Этот тест уже успешно пройден
              </p>
              <p className="text-xs text-emerald-700/80 dark:text-emerald-400/80">
                Вы можете перейти к следующему материалу или повторить тест для закрепления.
              </p>
            </div>
          </div>
          <button
            onClick={resetQuiz}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded-xl transition-colors border border-emerald-300/50 dark:border-emerald-700/50 flex-shrink-0 shadow-sm"
          >
            <RefreshCw size={14} />
            <span>Пройти заново</span>
          </button>
        </div>
      )}

      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
        Викторина
      </h2>
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

      <div className="mt-8 flex flex-wrap items-center gap-4">
        {!submitted ? (
          <button
            onClick={checkAnswers}
            disabled={!hasAnsweredAll || isChecking}
            className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/25 active:scale-95"
          >
            {isChecking ? "Проверка..." : "Проверить ответы"}
          </button>
        ) : (
          <div className="flex flex-wrap items-center gap-4 w-full">
            <div
              className={`flex-1 min-w-[240px] px-5 py-3.5 rounded-xl font-bold flex items-center gap-3 ${
                score && score.correct === score.total
                  ? "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                  : "bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-900/60"
              }`}
            >
              {score && score.correct === score.total ? (
                <CheckCircle2 className="text-emerald-500 flex-shrink-0" size={22} />
              ) : (
                <XCircle className="text-red-500 flex-shrink-0" size={22} />
              )}
              <div className="text-sm">
                <div>Ваш результат: {score?.correct} из {score?.total}</div>
                {score && score.correct < score.total && (
                  <div className="text-xs font-normal opacity-90 mt-0.5">
                    Ошибочные ответы подсвечены красным. Попробуйте ещё раз!
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={resetQuiz}
              className="flex items-center gap-2 px-5 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700 active:scale-95"
            >
              <RefreshCw size={16} />
              <span>Попробовать снова</span>
            </button>
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
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm">
      <div className="flex items-start gap-3 mb-4">
        <span className="flex-shrink-0 w-8 h-8 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-lg flex items-center justify-center font-bold text-sm">
          {index + 1}
        </span>
        <div className="flex-1">
          <p className="font-semibold text-slate-900 dark:text-white">
            {question.questionText}
          </p>
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
    <span
      className={`inline-block mt-2 px-2.5 py-1 rounded-full text-xs font-medium ${badge.color}`}
    >
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

const SingleChoiceOptions = memo<SingleChoiceOptionsProps>(
  function SingleChoiceOptions({ question, answer, submitted, onSelect }) {
    const options = question.options || [];
    const correctIndex = question.correctAnswerIndex;

    return (
      <div className="space-y-2">
        {options.map((option, optIdx) => {
          const isSelected = answer === optIdx;
          const isCorrect = optIdx === correctIndex;
          let buttonStyle =
            "bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-800";

          if (submitted) {
            if (isSelected && isCorrect) {
              // Пользователь выбрал верный ответ -> зелёный
              buttonStyle =
                "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500 dark:border-emerald-500 text-emerald-900 dark:text-emerald-200";
            } else if (isSelected && !isCorrect) {
              // Пользователь выбрал неверный ответ -> красный
              buttonStyle =
                "bg-red-50 dark:bg-red-950/30 border-red-500 dark:border-red-500 text-red-900 dark:text-red-200";
            } else {
              // Невыбранные ответы остаются нейтральными (не раскрываем верный ответ!)
              buttonStyle =
                "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 opacity-60";
            }
          } else if (isSelected) {
            buttonStyle =
              "bg-indigo-50 dark:bg-indigo-950/30 border-indigo-500 dark:border-indigo-400";
          }

          return (
            <button
              key={optIdx}
              onClick={() => onSelect(question.id, optIdx)}
              disabled={submitted}
              className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-colors disabled:cursor-not-allowed ${buttonStyle}`}
            >
              {submitted ? (
                isSelected && isCorrect ? (
                  <CheckCircle2
                    className="text-emerald-500 flex-shrink-0"
                    size={20}
                  />
                ) : isSelected && !isCorrect ? (
                  <XCircle className="text-red-500 flex-shrink-0" size={20} />
                ) : (
                  <Circle
                    className="text-slate-400 dark:text-slate-500 flex-shrink-0"
                    size={20}
                  />
                )
              ) : isSelected ? (
                <CheckCircle2
                  className="text-indigo-600 dark:text-indigo-400 flex-shrink-0"
                  size={20}
                />
              ) : (
                <Circle
                  className="text-slate-400 dark:text-slate-500 flex-shrink-0"
                  size={20}
                />
              )}
              <span className="text-left text-slate-900 dark:text-white font-medium">
                {option}
              </span>
            </button>
          );
        })}
      </div>
    );
  },
);

interface MultipleChoiceOptionsProps {
  question: IQuizBlock["content"]["questions"][0];
  answers: number[];
  submitted: boolean;
  onSelect: (qId: string, idx: number) => void;
}

const MultipleChoiceOptions = memo<MultipleChoiceOptionsProps>(
  function MultipleChoiceOptions({ question, answers, submitted, onSelect }) {
    const options = question.options || [];
    const correctIndices = question.correctAnswerIndices || [];

    return (
      <div className="space-y-2">
        {options.map((option, optIdx) => {
          const isSelected = answers.includes(optIdx);
          const isCorrect = correctIndices.includes(optIdx);
          let buttonStyle =
            "bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-800";

          if (submitted) {
            if (isSelected && isCorrect) {
              // Пользователь выбрал верный вариант -> зелёный
              buttonStyle =
                "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500 dark:border-emerald-500 text-emerald-900 dark:text-emerald-200";
            } else if (isSelected && !isCorrect) {
              // Пользователь выбрал неверный вариант -> красный
              buttonStyle =
                "bg-red-50 dark:bg-red-950/30 border-red-500 dark:border-red-500 text-red-900 dark:text-red-200";
            } else {
              // Невыбранные варианты остаются нейтральными (не раскрываем верный ответ!)
              buttonStyle =
                "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 opacity-60";
            }
          } else if (isSelected) {
            buttonStyle =
              "bg-indigo-50 dark:bg-indigo-950/30 border-indigo-500 dark:border-indigo-400";
          }

          return (
            <button
              key={optIdx}
              onClick={() => onSelect(question.id, optIdx)}
              disabled={submitted}
              className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-colors disabled:cursor-not-allowed ${buttonStyle}`}
            >
              {submitted ? (
                isSelected && isCorrect ? (
                  <CheckCircle2
                    className="text-emerald-500 flex-shrink-0"
                    size={20}
                  />
                ) : isSelected && !isCorrect ? (
                  <XCircle className="text-red-500 flex-shrink-0" size={20} />
                ) : (
                  <Circle
                    className="text-slate-400 dark:text-slate-500 flex-shrink-0"
                    size={20}
                  />
                )
              ) : isSelected ? (
                <CheckCircle2
                  className="text-indigo-600 dark:text-indigo-400 flex-shrink-0"
                  size={20}
                />
              ) : (
                <Circle
                  className="text-slate-400 dark:text-slate-500 flex-shrink-0"
                  size={20}
                />
              )}
              <span className="text-left text-slate-900 dark:text-white font-medium">
                {option}
              </span>
            </button>
          );
        })}
      </div>
    );
  },
);

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
  const isCorrect =
    submitted &&
    (answer || "").toLowerCase().trim() ===
      (question.correctAnswerText || "").toLowerCase().trim();
  const isWrong = submitted && !isCorrect;

  return (
    <div className="space-y-1.5">
      <div className="relative">
        <input
          type="text"
          value={answer || ""}
          onChange={(e) => onChange(question.id, e.target.value)}
          disabled={submitted}
          placeholder="Введите ваш ответ..."
          className={`w-full px-4 py-3.5 rounded-xl border-2 text-slate-900 dark:text-white transition-colors disabled:cursor-not-allowed ${
            submitted
              ? isCorrect
                ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200"
                : "border-red-500 bg-red-50/50 dark:bg-red-950/20 text-red-900 dark:text-red-200"
              : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 focus:border-indigo-500 dark:focus:border-indigo-400"
          }`}
        />
        {submitted && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
            {isCorrect ? (
              <CheckCircle2 className="text-emerald-500" size={20} />
            ) : (
              <XCircle className="text-red-500" size={20} />
            )}
          </div>
        )}
      </div>
      {isWrong && (
        <p className="text-xs text-red-500 font-medium">
          Неверный ответ. Попробуйте ещё раз.
        </p>
      )}
    </div>
  );
});
