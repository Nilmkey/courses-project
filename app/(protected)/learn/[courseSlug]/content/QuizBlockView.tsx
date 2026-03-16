"use client";

import { useState, useCallback } from "react";
import { CheckCircle2, Circle, XCircle } from "lucide-react";
import { CompletionButton } from "@/components/learning/CompletionButton";
import { useLearning } from "@/hooks/useLearning";
import type { IQuizBlock, IQuizAnswer } from "@/types/types";

export function QuizBlockView({ content }: { content: IQuizBlock["content"] }) {
  const { currentLessonId, updateQuizAnswers } = useLearning();
  const [answers, setAnswers] = useState<
    Record<string, number | number[] | string>
  >({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<{ correct: number; total: number } | null>(
    null,
  );

  // Обработка ответа для одиночного выбора
  const handleSingleAnswer = useCallback(
    (questionId: string, answerIndex: number) => {
      if (submitted) return; // Блокируем изменение после отправки
      setAnswers((prev) => ({ ...prev, [questionId]: answerIndex }));
    },
    [submitted],
  );

  // Обработка ответа для множественного выбора
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

  // Обработка текстового ответа
  const handleTextAnswer = useCallback(
    (questionId: string, answer: string) => {
      if (submitted) return;
      setAnswers((prev) => ({ ...prev, [questionId]: answer }));
    },
    [submitted],
  );

  // Проверка ответов
  const checkAnswers = useCallback(() => {
    if (!currentLessonId) return;

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
    updateQuizAnswers(currentLessonId, quizAnswers);
    setSubmitted(true);
  }, [answers, content.questions, currentLessonId, updateQuizAnswers]);

  // Сброс теста
  const resetQuiz = useCallback(() => {
    setAnswers({});
    setSubmitted(false);
    setScore(null);
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Викторина</h2>
      <p className="text-gray-500 mb-8">
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

      {/* Кнопки действий */}
      <div className="mt-8 flex items-center gap-4">
        {!submitted ? (
          <button
            onClick={checkAnswers}
            disabled={Object.keys(answers).length === 0}
            className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed shadow-lg shadow-blue-500/25"
          >
            Проверить ответы
          </button>
        ) : (
          <div className="flex items-center gap-6">
            <div className="px-6 py-3 rounded-xl font-bold bg-gray-100 text-gray-700">
              Ваш результат: {score?.correct} из {score?.total}
            </div>
            <button
              onClick={resetQuiz}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
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

function QuestionCard({
  question,
  index,
  answer,
  submitted,
  onSingleAnswer,
  onMultipleAnswer,
  onTextAnswer,
}: QuestionCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-start gap-3 mb-4">
        <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-bold text-sm">
          {index + 1}
        </span>
        <div className="flex-1">
          <p className="font-semibold text-gray-900">{question.questionText}</p>
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
}

function QuestionTypeBadge({ type }: { type: string }) {
  const badges = {
    single: { label: "Один ответ", color: "bg-purple-100 text-purple-700" },
    multiple: {
      label: "Несколько ответов",
      color: "bg-indigo-100 text-indigo-700",
    },
    text: {
      label: "Текстовый ответ",
      color: "bg-emerald-100 text-emerald-700",
    },
  };

  const badge = badges[type as keyof typeof badges];

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

function SingleChoiceOptions({
  question,
  answer,
  submitted,
  onSelect,
}: SingleChoiceOptionsProps) {
  const options = question.options || [];

  return (
    <div className="space-y-2">
      {options.map((option, optIdx) => {
        const isSelected = answer === optIdx;

        let buttonStyle = "bg-gray-50 border-gray-200 hover:bg-gray-100";

        if (submitted) {
          if (isSelected) {
            // Показываем только выбранный пользователем ответ
            buttonStyle = "bg-gray-100 border-gray-300";
          }
        } else if (isSelected) {
          buttonStyle = "bg-blue-50 border-blue-500";
        }

        return (
          <button
            key={optIdx}
            onClick={() => onSelect(question.id, optIdx)}
            disabled={submitted}
            className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-colors disabled:cursor-not-allowed ${buttonStyle}`}
          >
            {isSelected ? (
              <CheckCircle2 className="text-blue-500 flex-shrink-0" size={20} />
            ) : (
              <Circle className="text-gray-400 flex-shrink-0" size={20} />
            )}
            <span className="text-left text-gray-900">
              {option}
            </span>
          </button>
        );
      })}
    </div>
  );
}

interface MultipleChoiceOptionsProps {
  question: IQuizBlock["content"]["questions"][0];
  answers: number[];
  submitted: boolean;
  onSelect: (qId: string, idx: number) => void;
}

function MultipleChoiceOptions({
  question,
  answers,
  submitted,
  onSelect,
}: MultipleChoiceOptionsProps) {
  const options = question.options || [];

  return (
    <div className="space-y-2">
      {options.map((option, optIdx) => {
        const isSelected = answers.includes(optIdx);

        let buttonStyle = "bg-gray-50 border-gray-200 hover:bg-gray-100";

        if (submitted) {
          if (isSelected) {
            // Показываем только выбранные пользователем ответы
            buttonStyle = "bg-gray-100 border-gray-300";
          }
        } else if (isSelected) {
          buttonStyle = "bg-blue-50 border-blue-500";
        }

        return (
          <button
            key={optIdx}
            onClick={() => onSelect(question.id, optIdx)}
            disabled={submitted}
            className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-colors disabled:cursor-not-allowed ${buttonStyle}`}
          >
            {isSelected ? (
              <CheckCircle2 className="text-blue-500 flex-shrink-0" size={20} />
            ) : (
              <Circle className="text-gray-400 flex-shrink-0" size={20} />
            )}
            <span className="text-left text-gray-900">
              {option}
            </span>
          </button>
        );
      })}
    </div>
  );
}

interface TextAnswerInputProps {
  question: IQuizBlock["content"]["questions"][0];
  answer: string | undefined;
  submitted: boolean;
  onChange: (qId: string, text: string) => void;
}

function TextAnswerInput({
  question,
  answer,
  submitted,
  onChange,
}: TextAnswerInputProps) {
  return (
    <div className="space-y-3">
      <input
        type="text"
        value={answer || ""}
        onChange={(e) => onChange(question.id, e.target.value)}
        disabled={submitted}
        placeholder="Введите ваш ответ..."
        className={`w-full px-4 py-3 rounded-lg border-2 text-gray-900 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed ${
          submitted
            ? "border-gray-300 bg-gray-50"
            : "border-gray-500 focus:border-blue-500"
        }`}
      />
    </div>
  );
}
