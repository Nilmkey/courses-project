"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Code, ChevronRight, Loader2 } from "lucide-react";
import { coursesApi } from "@/lib/api/entities/api-courses";
import { tagsApi } from "@/lib/api/entities/api-tags";
import { CourseApiResponse, CourseLevel, ITag } from "@/types/types";
import HeaderNoCourses from "../../../components/ui/header-no-courses";
import Footer from "@/components/ui/footer";

const iconMap: Record<string, React.ReactNode> = {
  Layout: <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /><path d="M9 21V9" /></svg>,
  Server: <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="8" rx="2" /><rect x="2" y="14" width="20" height="8" rx="2" /><path d="M6 6h.01" /><path d="M6 18h.01" /></svg>,
  Globe: <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>,
  Laptop: <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M2 21h20" /><path d="M12 17v4" /></svg>,
  Zap: <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>,
  Code: <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>,
};

const getLevelLabel = (level: CourseLevel) => {
  switch (level) {
    case "beginner":
      return "Начальный";
    case "intermediate":
      return "Средний";
    case "advanced":
      return "Продвинутый";
    default:
      return level;
  }
};

const getLevelStyles = (level: CourseLevel) => {
  switch (level) {
    case "beginner":
      return "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20";
    case "intermediate":
      return "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20";
    case "advanced":
      return "bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400 border border-pink-200 dark:border-pink-500/20";
    default:
      return "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700";
  }
};

const CoursesPage = () => {
  const [mounted, setMounted] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [courses, setCourses] = useState<CourseApiResponse[]>([]);
  const [tags, setTags] = useState<ITag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const [coursesData, tagsData] = await Promise.all([
        coursesApi.getAll(),
        tagsApi.getAll(),
      ]);
      setCourses(coursesData.courses || []);
      setTags(tagsData.tags || []);
    } catch (err) {
      console.error("Ошибка загрузки курсов:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  const tagIdToName = new Map(tags.map((t) => [t._id, t.name]));

  const allTags = Array.from(
    new Set(courses.flatMap((c) => c.tags || []))
  )
    .map((tagId) => tagIdToName.get(tagId) || tagId)
    .sort();

  const filteredCourses =
    selectedTag === null
      ? courses
      : courses.filter((c) =>
          c.tags?.some((tagId) => tagIdToName.get(tagId) === selectedTag)
        );

  const publishedCourses = filteredCourses.filter((c) => c.isPublished);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-300 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none fixed">
        <div className="absolute top-[-10%] -left-[10%] w-[40rem] h-[40rem] bg-indigo-500/10 dark:bg-indigo-600/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-pulse duration-[8000ms]" />
        <div className="absolute bottom-[20%] right-[-10%] w-[35rem] h-[35rem] bg-pink-500/10 dark:bg-pink-600/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen" />
      </div>

      <HeaderNoCourses />
      
      <main className="flex-grow py-20 px-4 max-w-7xl mx-auto w-full relative z-10 space-y-16">
        <div className="text-center animate-in slide-in-from-bottom-8 duration-700">
          <h1 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">
            Освой профессию <br className="md:hidden" /> в <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-blue-600">IT</span>
          </h1>
          <p className="text-slate-600 dark:text-slate-400 font-medium text-xl max-w-2xl mx-auto">
            От теории к практике. Все необходимое для уверенного старта и развития в разработке.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 animate-in fade-in duration-1000 delay-100">
          <button
            onClick={() => setSelectedTag(null)}
            className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300 ${
              selectedTag === null
                ? "bg-indigo-600 text-white shadow-xl shadow-indigo-500/30 scale-105"
                : "bg-white/50 dark:bg-slate-900/50 backdrop-blur-md text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-white dark:hover:bg-slate-900"
            }`}
          >
            Все курсы
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300 capitalize ${
                selectedTag === tag
                  ? "bg-indigo-600 text-white shadow-xl shadow-indigo-500/30 scale-105"
                  : "bg-white/50 dark:bg-slate-900/50 backdrop-blur-md text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-white dark:hover:bg-slate-900"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20 justify-items-center animate-in slide-in-from-bottom-12 duration-700 delay-200">
          {loading
            ? [1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-full max-w-[380px] h-[400px] bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] border border-slate-200/50 dark:border-slate-800/50 animate-pulse flex flex-col p-8"
                >
                  <div className="flex justify-between items-center mb-6">
                    <div className="h-6 w-24 bg-slate-200 dark:bg-slate-800 rounded-full" />
                    <div className="h-12 w-12 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
                  </div>
                  <div className="space-y-3 mt-4">
                    <div className="h-8 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                    <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded-lg mt-4" />
                    <div className="h-4 w-5/6 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                  </div>
                  <div className="mt-auto h-12 w-full bg-slate-200 dark:bg-slate-800 rounded-2xl" />
                </div>
              ))
            : publishedCourses.map((course) => {
                return (
                  <div
                    key={course._id}
                    className="group relative bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl rounded-[2.5rem] border border-slate-200/50 dark:border-slate-800/50 shadow-xl shadow-slate-200/20 dark:shadow-none p-8 flex flex-col h-[420px] w-full max-w-[380px] transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-500/20 dark:hover:shadow-indigo-500/10 hover:border-indigo-200 dark:hover:border-indigo-500/30 overflow-hidden cursor-pointer"
                    onClick={() => {
                      if (course.slug) {
                        window.location.href = `/courses/${course.slug}`;
                      }
                    }}
                  >
                  <div className="mb-6 flex justify-between items-center relative z-10">
                    <span
                      className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider backdrop-blur-md shadow-sm ${getLevelStyles(course.level)}`}
                    >
                      {getLevelLabel(course.level)}
                    </span>
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}
                    >
                      {iconMap[course.iconName || "Code"] || iconMap.Code}
                    </div>
                  </div>

                  <div className="flex-grow overflow-y-auto relative z-10 mt-2">
                    <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-4 leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {course.title}
                    </h3>
                    {course.description && (
                      <p className="text-slate-500 dark:text-slate-400 font-medium text-[15px] leading-relaxed line-clamp-4">
                        {course.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-8 space-y-6 relative z-10">
                    <div className="flex items-center justify-between pt-5 border-t border-slate-100 dark:border-slate-800/50">
                      <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-full font-bold">
                        <div
                          className={`w-2 h-2 rounded-full animate-pulse ${course.isOpenForEnrollment ? "bg-emerald-500" : "bg-rose-500"}`}
                        />
                        <span
                          className={`text-xs uppercase tracking-tighter ${course.isOpenForEnrollment ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}
                        >
                          {course.isOpenForEnrollment
                            ? "Открыто"
                            : "Закрыто"}
                        </span>
                      </div>

                      <div
                        className={`flex items-center gap-1 font-black text-sm uppercase tracking-widest transition-all ${
                          course.isOpenForEnrollment
                            ? "text-indigo-600 dark:text-indigo-400 group-hover:gap-3"
                            : "text-slate-400"
                        }`}
                      >
                        {course.isOpenForEnrollment
                          ? "Вперед"
                          : "Ждем"}
                        <ChevronRight className="w-5 h-5" />
                      </div>
                    </div>
                  </div>

                  <div
                    className={`absolute -right-20 -bottom-20 w-64 h-64 bg-gradient-to-br from-indigo-500 to-blue-600 opacity-0 group-hover:opacity-[0.03] dark:group-hover:opacity-[0.1] rounded-full blur-3xl transition-all duration-700`}
                  />
                </div>
              );
            })}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CoursesPage;
