"use client";

import { useEffect, useState, useCallback } from "react";
import { coursesApi } from "@/frontend/lib/api/entities/api-courses";
import { api } from "@/frontend/lib/api/api-client";
import type { ICourse, ISection } from "@/types/types";

interface ProgressData {
  totalLessons: number;
  completedLessons: number;
  progress: number;
}

interface UseCourseDataResult {
  course: ICourse | null;
  sections: ISection[];
  progress: ProgressData;
  isLoading: boolean;
  error: string | null;
}

interface UseCourseDataOptions {
  courseSlug: string;
  enabled?: boolean;
}

export function useCourseData({
  courseSlug,
  enabled = true,
}: UseCourseDataOptions): UseCourseDataResult {
  const [course, setCourse] = useState<ICourse | null>(null);
  const [sections, setSections] = useState<ISection[]>([]);
  const [progress, setProgress] = useState<ProgressData>({
    totalLessons: 0,
    completedLessons: 0,
    progress: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCourseData = useCallback(async () => {
    if (!enabled || !courseSlug) return;

    setIsLoading(true);
    setError(null);

    try {
      const courseData = await coursesApi.getBySlug(courseSlug);
      setCourse(courseData);
      setSections(courseData.sections);

      const progressData = await api
        .get<ProgressData>(
          `/v1/progress/course/${courseData._id}`,
          { credentials: "include" },
          true,
        )
        .catch(() => {
          return null;
        });

      if (progressData) {
        setProgress(progressData);
      } else {
        const totalLessons = courseData.sections.reduce(
          (acc, section) => acc + section.lessons.length,
          0,
        );
        setProgress({
          totalLessons,
          completedLessons: 0,
          progress: 0,
        });
      }
    } catch (err) {
      console.error("Ошибка загрузки данных курса:", err);
      setError(err instanceof Error ? err.message : "Неизвестная ошибка");
    } finally {
      setIsLoading(false);
    }
  }, [courseSlug, enabled]);

  useEffect(() => {
    loadCourseData();
  }, [loadCourseData]);

  return {
    course,
    sections,
    progress,
    isLoading,
    error,
  };
}
