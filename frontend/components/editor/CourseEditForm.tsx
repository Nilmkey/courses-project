"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Save,
  LayoutList,
  Loader2,
  Sparkles,
  Settings2,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CourseTitleInput } from "./CourseTitleInput";
import { CourseDescriptionInput } from "./CourseDescriptionInput";
import { CourseLevelSelect, type CourseLevel } from "./CourseLevelSelect";
import { CoursePriceSlider } from "./CoursePriceSlider";
import { CoursePublishToggle } from "./CoursePublishToggle";
import { CourseEnrollmentToggle } from "./CourseEnrollmentToggle";
import { TagSelector } from "./TagSelector";
import { coursesApi } from "@/lib/api/entities/api-courses";
import { useToast } from "@/hooks/useToast";
import type { CourseFormData } from "@/types/types";

const defaultCourseData: CourseFormData = {
  title: "",
  description: "",
  level: "beginner",
  price: 0,
  isPublished: false,
  isOpenForEnrollment: false,
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
          isOpenForEnrollment: response.isOpenForEnrollment ?? false,
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
      toast.success("Данные курса успешно обновлены!");
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
      formData.isOpenForEnrollment !== initialData.isOpenForEnrollment ||
      JSON.stringify(formData.tags) !== JSON.stringify(initialData.tags)
    );
  }, [formData, initialData, isSaved]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-16 h-16 animate-spin text-indigo-600 dark:text-indigo-400" />
        <p className="text-sm font-black tracking-[0.2em] uppercase text-slate-500 dark:text-slate-400 animate-pulse">
          Загрузка курса...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-300 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-indigo-500/10 dark:bg-indigo-600/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen pointer-events-none z-0 translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 left-0 w-[30rem] h-[30rem] bg-cyan-500/10 dark:bg-cyan-600/10 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen pointer-events-none z-0 -translate-x-1/3 translate-y-1/3" />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm transition-colors">
        <div className="max-w-5xl mx-auto px-4 h-20 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={handleGoBack}
              className="group flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl transition-all"
            >
              <ArrowLeft
                size={18}
                className="group-hover:-translate-x-1 transition-transform"
              />
              <span>К списку курсов</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            {isDirty && (
              <span className="hidden md:inline-flex text-[10px] font-black uppercase tracking-widest text-orange-500 bg-orange-50 dark:bg-orange-500/10 border border-orange-200/50 dark:border-orange-500/20 px-3 py-1.5 rounded-full animate-pulse">
                Внесены изменения
              </span>
            )}
            <Button
              onClick={handleGoToSections}
              variant="outline"
              className="flex items-center gap-2 h-12 px-6 rounded-xl font-bold border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all shadow-inner"
            >
              <LayoutList size={18} />
              <span className="hidden sm:inline">Редактор контента</span>
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || !isDirty}
              className={`
                flex items-center gap-2 h-12 px-6 rounded-xl font-bold
                transition-all duration-300 ease-out
                ${
                  isSaving || !isDirty
                    ? "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed border-transparent"
                    : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 active:scale-95"
                }
              `}
            >
              <Save size={18} className={isSaving ? "animate-pulse" : ""} />
              <span className="hidden sm:inline">
                {isSaving ? "Сохранение..." : "Сохранить"}
              </span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-12 relative z-10 w-full mb-20 mb-8">
        {/* Page Title */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md p-6 rounded-[2rem] border border-slate-200/50 dark:border-slate-800/50 shadow-sm">
          <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl shadow-inner shrink-0 w-max">
            <Settings2 className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
              Настройки курса
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              Основная информация, обложка и доступность курса
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column (Main Form) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-[2.5rem] border border-slate-200/50 dark:border-slate-800/50 shadow-xl shadow-slate-200/20 dark:shadow-none p-8 space-y-8 relative overflow-hidden group">
              {/* Internal decorative glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />

              <div className="space-y-6 relative z-10">
                <div className="space-y-4">
                  <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-500" />
                    Базовая информация
                  </h3>
                  <CourseTitleInput
                    value={formData.title}
                    onChange={(value) => updateField("title", value)}
                  />
                  <CourseDescriptionInput
                    value={formData.description}
                    onChange={(value) => updateField("description", value)}
                  />
                </div>

                <div className="pt-6 border-t border-slate-200/50 dark:border-slate-800">
                  <CourseLevelSelect
                    value={formData.level}
                    onChange={(value) => updateField("level", value)}
                  />
                </div>

                <div className="pt-6 border-t border-slate-200/50 dark:border-slate-800">
                  <TagSelector
                    selectedTagIds={formData.tags || []}
                    onChange={(tagIds) => updateField("tags", tagIds)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (Settings & Publishing) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-[2.5rem] border border-slate-200/50 dark:border-slate-800/50 shadow-xl shadow-slate-200/20 dark:shadow-none p-6 space-y-8 relative overflow-hidden">
              <div className="space-y-6 relative z-10">
                <div>
                  <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white mb-4">
                    Публикация и Доступ
                  </h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
                      <CoursePublishToggle
                        isPublished={formData.isPublished}
                        onToggle={() =>
                          updateField("isPublished", !formData.isPublished)
                        }
                      />
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
                      <CourseEnrollmentToggle
                        isOpenForEnrollment={formData.isOpenForEnrollment}
                        onToggle={() =>
                          updateField(
                            "isOpenForEnrollment",
                            !formData.isOpenForEnrollment,
                          )
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-200/50 dark:border-slate-800">
                  <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white mb-4">
                    Цена
                  </h3>
                  <CoursePriceSlider
                    value={formData.price}
                    onChange={(value) => updateField("price", value)}
                  />
                </div>
              </div>
            </div>

            {/* Helper Block */}
            <div className="bg-indigo-50/50 dark:bg-indigo-900/10 backdrop-blur-xl border border-indigo-100 dark:border-indigo-800/30 rounded-3xl p-6 relative overflow-hidden">
              <Info className="absolute top-4 right-4 w-24 h-24 text-indigo-500/5 -translate-y-1/3 translate-x-1/3" />
              <div className="relative z-10">
                <h4 className="font-extrabold text-indigo-900 dark:text-indigo-300 mb-3 text-lg">
                  Советы
                </h4>
                <ul className="text-sm text-indigo-800/70 dark:text-indigo-300/70 space-y-2 font-medium">
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-400 mt-0.5">•</span>
                    Название должно быть кратким и цепляющим.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-400 mt-0.5">•</span>В описании
                    укажите, чему именно научится студент.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-400 mt-0.5">•</span>
                    Заполните теги, чтобы студентам было проще найти курс.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
