"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, LayoutList, Loader2 } from "lucide-react";
import { CourseTitleInput } from "./CourseTitleInput";
import { CourseDescriptionInput } from "./CourseDescriptionInput";
import { CourseLevelSelect, type CourseLevel } from "./CourseLevelSelect";
import { CoursePriceSlider } from "./CoursePriceSlider";
import { CoursePublishToggle } from "./CoursePublishToggle";
import { TagSelector } from "./TagSelector";
import { Button } from "@/components/ui/button";
import { coursesApi } from "@/lib/api/entities/api-courses";
import { useToast } from "@/hooks/useToast";
import type { CourseFormData } from "@/types/types";

const defaultCourseData: CourseFormData = {
  title: "",
  description: "",
  level: "beginner",
  price: 0,
  isPublished: false,
  tags: [],
};

export function CourseEditForm() {
  const router = useRouter();
  const { courseId } = useParams();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [initialData, setInitialData] =
    useState<CourseFormData>(defaultCourseData);
  const [formData, setFormData] = useState<CourseFormData>(defaultCourseData);

  useEffect(() => {
    const loadCourse = async () => {
      if (!courseId) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await coursesApi.getById(courseId as string);
        const courseData: CourseFormData = {
          title: response.title,
          description: response.description ?? "",
          level: response.level as CourseLevel,
          price: response.price,
          isPublished: response.isPublished,
          tags: response.tags ?? [],
        };
        setInitialData(courseData);
        setFormData(courseData);
      } catch (error) {
        setInitialData(defaultCourseData);
        setFormData(defaultCourseData);
      } finally {
        setIsLoading(false);
      }
    };

    loadCourse();
  }, [courseId]);

  const updateField = useCallback(
    <K extends keyof CourseFormData>(field: K, value: CourseFormData[K]) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      setIsSaved(false);
    },
    [],
  );

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      await coursesApi.update(courseId as string, formData);
      toast.success("Курс успешно обновлён!");
      setInitialData(formData);
      setIsSaved(true);
    } catch (error) {
      toast.error("Не удалось обновить курс");
      console.error("Failed to save course:", error);
    } finally {
      setIsSaving(false);
    }
  }, [formData, courseId, toast]);

  const handleGoBack = useCallback(() => {
    router.push("/admin");
  }, [router]);

  const handleGoToSections = useCallback(() => {
    router.push(`/editor/course/${courseId}/sections`);
  }, [router, courseId]);

  const isDirty = useMemo(() => {
    if (isSaved) return false;
    return (
      formData.title !== initialData.title ||
      formData.description !== initialData.description ||
      formData.level !== initialData.level ||
      formData.price !== initialData.price ||
      formData.isPublished !== initialData.isPublished ||
      JSON.stringify(formData.tags) !== JSON.stringify(initialData.tags)
    );
  }, [formData, initialData, isSaved]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8faff] dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-blue-600 mx-auto mb-6" />
          <p className="text-xl font-bold text-slate-900 dark:text-white">
            Загрузка курса...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8faff] dark:bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-blue-100/50 dark:border-slate-800">
        <div className="container mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={handleGoBack}
              className="
                flex items-center gap-2 px-4 py-2
                text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white
                hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg
                transition-colors
              "
            >
              <ArrowLeft size={20} />
              <span className="font-medium">Назад</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            {isDirty && (
              <span className="text-sm text-orange-600 dark:text-orange-400 font-medium px-3 py-1">
                Есть несохранённые изменения
              </span>
            )}
            <Button
              onClick={handleGoToSections}
              variant="outline"
              className="flex items-center gap-2 h-12 px-6 rounded-xl font-bold border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
            >
              <LayoutList size={20} />
              Редактор секций
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || !isDirty}
              className={`
                flex items-center gap-2 h-12 px-6 rounded-xl font-bold
                transition-all duration-200 ease-out
                ${
                  isSaving || !isDirty
                    ? "bg-slate-300 dark:bg-slate-700 cursor-not-allowed opacity-60"
                    : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 active:scale-95"
                }
              `}
            >
              <Save
                size={20}
                className={`transition-transform duration-200 ${isSaving ? "animate-pulse" : ""}`}
              />
              {isSaving ? "Сохранение..." : "Сохранить"}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-10">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2">
              Редактирование курса
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-lg">
              Заполните информацию о курсе для публикации
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl p-8 space-y-8">
            {/* Title & Description */}
            <div className="space-y-6">
              <CourseTitleInput
                value={formData.title}
                onChange={(value) => updateField("title", value)}
              />
              <CourseDescriptionInput
                value={formData.description}
                onChange={(value) => updateField("description", value)}
              />
            </div>

            {/* Level Selection */}
            <CourseLevelSelect
              value={formData.level}
              onChange={(value) => updateField("level", value)}
            />

            {/* Price Slider */}
            <CoursePriceSlider
              value={formData.price}
              onChange={(value) => updateField("price", value)}
            />

            {/* Publish Toggle */}
            <CoursePublishToggle
              isPublished={formData.isPublished}
              onToggle={() => updateField("isPublished", !formData.isPublished)}
            />

            {/* Tag Selector */}
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
              <TagSelector
                selectedTagIds={formData.tags || []}
                onChange={(tagIds) => updateField("tags", tagIds)}
              />
            </div>
          </div>

          {/* Info Card */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800 p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-800 rounded-xl">
                <svg
                  className="w-6 h-6 text-blue-600 dark:text-blue-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-1">
                  Советы по заполнению
                </h4>
                <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                  <li>• Название должно быть кратким и понятным</li>
                  <li>• В описании укажите, чему научится студент</li>
                  <li>• Выберите подходящий уровень сложности</li>
                  <li>• Установите справедливую цену для курса</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
