"use client";

import React, { useEffect, useState, useCallback } from "react";
import { X, Loader2, Trash2, RotateCcw, UserCog, BookOpen, AlertTriangle, UserPlus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Toaster } from "react-hot-toast";
import { useToast } from "@/hooks/useToast";
import { usersApi, type User, type UserEnrollment } from "@/lib/api/entities/api-users";
import { coursesApi } from "@/lib/api/entities/api-courses";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

interface Course {
  _id: string;
  title: string;
  level: string;
}

interface UserDetailModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onUpdateUserRole?: () => void;
}

export default function UserDetailModal({ user, isOpen, onClose, onUpdateUserRole }: UserDetailModalProps) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [enrollments, setEnrollments] = useState<UserEnrollment[]>([]);
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);
  const [selectedRole, setSelectedRole] = useState<User["role"]>(user.role);
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [courseSearch, setCourseSearch] = useState("");
  const [showCourseDropdown, setShowCourseDropdown] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => Promise<void>;
    variant?: "default" | "destructive";
  }>({ isOpen: false, title: "", description: "", onConfirm: async () => {} });

  const loadAvailableCourses = useCallback(async () => {
    try {
      setLoadingCourses(true);
      const response = await coursesApi.getAll();
      setAvailableCourses(response.courses || []);
    } catch (err) {
      console.error("Ошибка загрузки курсов:", err);
    } finally {
      setLoadingCourses(false);
    }
  }, []);

  const loadEnrollments = useCallback(async () => {
    try {
      setLoadingEnrollments(true);
      const data = await usersApi.getEnrollments(user.id);
      setEnrollments(data);
    } catch (err) {
      console.error("Ошибка загрузки курсов:", err);
      toast.error("Не удалось загрузить курсы пользователя");
    } finally {
      setLoadingEnrollments(false);
    }
  }, [user.id, toast]);

  useEffect(() => {
    if (isOpen && user) {
      setSelectedRole(user.role);
      setSelectedCourseId("");
      setCourseSearch("");
      setShowCourseDropdown(false);
      loadEnrollments();
      loadAvailableCourses();
    }
  }, [isOpen, user, loadEnrollments, loadAvailableCourses]);

  const handleUpdateRole = async () => {
    if (selectedRole === user.role) {
      toast.success("Роль не изменена");
      return;
    }

    try {
      setLoading(true);
      await usersApi.updateRole(user.id, selectedRole);
      toast.success("Роль пользователя обновлена");
      onUpdateUserRole?.();
    } catch (err) {
      console.error("Ошибка обновления роли:", err);
      toast.error("Не удалось обновить роль");
    } finally {
      setLoading(false);
    }
  };

  const handleUnenroll = async (courseId: string, courseTitle: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "Отписать от курса",
      description: `Вы уверены, что хотите отписать пользователя от курса "${courseTitle}"? Прогресс будет потерян.`,
      variant: "destructive",
      onConfirm: async () => {
        try {
          await usersApi.deleteEnrollment(user.id, courseId);
          setEnrollments((prev) => prev.filter((e) => e.course_id !== courseId));
          toast.success("Пользователь отписан от курса");
        } catch (err) {
          console.error("Ошибка отписки:", err);
          toast.error("Не удалось отписать от курса");
        }
      },
    });
  };

  const handleResetProgress = async (courseId: string, courseTitle: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "Сбросить прогресс",
      description: `Вы уверены, что хотите сбросить весь прогресс пользователя по курсу "${courseTitle}"? Это действие нельзя отменить.`,
      variant: "destructive",
      onConfirm: async () => {
        try {
          await usersApi.resetProgress(user.id, courseId);
          loadEnrollments();
          toast.success("Прогресс сброшен");
        } catch (err) {
          console.error("Ошибка сброса прогресса:", err);
          toast.error("Не удалось сбросить прогресс");
        }
      },
    });
  };

  const handleEnrollUser = async () => {
    if (!selectedCourseId) {
      toast.error("Выберите курс");
      return;
    }

    const course = availableCourses.find((c) => c._id === selectedCourseId);
    setConfirmDialog({
      isOpen: true,
      title: "Записать на курс",
      description: `Записать пользователя "${user.name}" на курс "${course?.title}"?`,
      variant: "default",
      onConfirm: async () => {
        try {
          await usersApi.enrollUser(user.id, selectedCourseId);
          setSelectedCourseId("");
          setCourseSearch("");
          setShowCourseDropdown(false);
          loadEnrollments();
          toast.success("Пользователь записан на курс");
        } catch (err: unknown) {
          console.error("Ошибка записи на курс:", err);
          toast.error(err instanceof Error ? err.message : "Не удалось записать на курс");
        }
      },
    });
  };

  const handleDeleteUser = async () => {
    setConfirmDialog({
      isOpen: true,
      title: "Удалить аккаунт",
      description: `Вы уверены, что хотите удалить аккаунт "${user.name}"? Все записи и прогресс будут удалены. Это действие нельзя отменить.`,
      variant: "destructive",
      onConfirm: async () => {
        try {
          await usersApi.deleteUser(user.id);
          toast.success("Аккаунт пользователя удалён");
          onClose();
          onUpdateUserRole?.();
        } catch (err: unknown) {
          console.error("Ошибка удаления аккаунта:", err);
          toast.error(err instanceof Error ? err.message : "Не удалось удалить аккаунт");
        }
      },
    });
  };

  const enrolledCourseIds = new Set(enrollments.map((e) => e.course_id));
  const filteredCourses = availableCourses.filter(
    (c) =>
      !enrolledCourseIds.has(c._id) &&
      (!courseSearch || c.title.toLowerCase().includes(courseSearch.toLowerCase()))
  );

  if (!isOpen) return null;

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "var(--toast-bg)",
            color: "var(--toast-color)",
            border: "var(--toast-border)",
            borderRadius: "0.75rem",
            boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
          },
        }}
      />

      {/* Overlay */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-4 sm:p-6 transition-all duration-500 will-change-transform"
        onClick={onClose}
      >
        {/* Modal */}
        <div
          className="bg-white/90 dark:bg-slate-950/90 backdrop-blur-3xl rounded-[2.5rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-white/50 dark:border-slate-800/50 flex flex-col relative"
          onClick={(e) => e.stopPropagation()}
        >
           <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-indigo-500/10 dark:bg-indigo-500/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />

          {/* Header */}
          <div className="sticky top-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-b border-slate-200/50 dark:border-slate-800/50 px-8 py-5 flex items-center justify-between z-10 shrink-0">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
              Профиль ученика
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-xl w-10 h-10 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-rose-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar relative z-10">
            {/* Информация о пользователе */}
            <div className="bg-slate-50/50 dark:bg-slate-900/30 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-[2rem] p-8 shadow-sm">
                <div className="flex flex-col md:flex-row gap-8">
                  {/* Аватар */}
                  <div className="flex-shrink-0">
                    <div className="relative">
                      <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full scale-125" />
                      {user.avatar ? (
                        <Image
                        src={user.avatar}
                          alt={user.name}
                          className="w-32 h-32 rounded-3xl object-cover relative z-10 shadow-lg border-2 border-white dark:border-slate-800"
                        />
                      ) : (
                        <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white text-5xl font-black relative z-10 shadow-xl shadow-indigo-500/30">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Детали */}
                  <div className="flex-1 space-y-6">
                    <div>
                      <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-1">
                        {user.name}
                      </h3>
                      <p className="text-base font-medium text-slate-500 dark:text-slate-400 font-mono">
                        {user.email}
                      </p>
                    </div>

                    {/* Изменение роли */}
                    <div className="space-y-3">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-2">
                        <UserCog className="w-4 h-4" />
                        Роль пользователя
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {(["student", "admin"] as const).map((role) => (
                          <button
                            key={role}
                            onClick={() => setSelectedRole(role)}
                            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm ${
                              selectedRole === role
                                ? role === "admin"
                                  ? "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/30"
                                  : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/30"
                                : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-indigo-300"
                            }`}
                          >
                            {role === "admin" ? "Администратор" : "Студент"}
                          </button>
                        ))}
                      </div>
                      {selectedRole !== user.role && (
                        <div className="pt-2">
                           <Button
                            onClick={handleUpdateRole}
                            disabled={loading}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl"
                          >
                            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Сохранить роль
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Запись на курс */}
                    <div className="space-y-3 pt-4 border-t border-slate-200/50 dark:border-slate-800">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-2">
                        <UserPlus className="w-4 h-4" />
                        Записать на курс
                      </label>

                      {/* Поиск курсов */}
                      <div className="relative">
                        <div className="relative group">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                          <input
                            type="text"
                            placeholder="Найти курс для записи..."
                            value={courseSearch}
                            onChange={(e) => {
                              setCourseSearch(e.target.value);
                              setShowCourseDropdown(true);
                            }}
                            onFocus={() => setShowCourseDropdown(true)}
                            onBlur={() => {
                              setTimeout(() => setShowCourseDropdown(false), 200);
                            }}
                            className="w-full pl-11 pr-4 py-3 h-12 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-inner"
                            disabled={loadingCourses}
                          />
                        </div>

                        {/* Выпадающий список курсов */}
                        {showCourseDropdown && (
                          <div className="absolute z-50 mt-2 w-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
                            {loadingCourses ? (
                              <div className="flex items-center justify-center py-6">
                                <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
                              </div>
                            ) : filteredCourses.length === 0 ? (
                              <div className="py-6 text-center text-sm font-bold text-slate-500 dark:text-slate-400">
                                {availableCourses.length === enrollments.length
                                  ? "Все курсы уже изучены!"
                                  : "Ничего не найдено"}
                              </div>
                            ) : (
                              <div className="p-2 space-y-1">
                                {filteredCourses.map((course) => (
                                  <button
                                    key={course._id}
                                    onMouseDown={() => {
                                      setSelectedCourseId(course._id);
                                      setCourseSearch(course.title);
                                      setShowCourseDropdown(false);
                                    }}
                                    className="w-full p-2 text-left hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-3"
                                  >
                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-indigo-500/20">
                                      <BookOpen className="w-5 h-5 text-white/90" />
                                    </div>
                                    <div className="min-w-0">
                                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                        {course.title}
                                      </p>
                                      <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Уровень: {course.level}
                                      </p>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Кнопка записи */}
                      {selectedCourseId && (
                        <Button
                          onClick={handleEnrollUser}
                          disabled={loadingCourses}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold w-full h-12 rounded-xl shadow-lg shadow-emerald-500/30"
                        >
                          <UserPlus className="w-5 h-5 mr-2" />
                          Подтвердить запись
                        </Button>
                      )}
                    </div>

                    {/* Удалить аккаунт */}
                    <div className="pt-4 border-t border-slate-200/50 dark:border-slate-800">
                      <Button
                        onClick={handleDeleteUser}
                        variant="outline"
                        className="text-rose-600 border-rose-200 bg-rose-50 hover:bg-rose-600 dark:bg-rose-900/10 dark:border-rose-900 hover:text-white font-bold rounded-xl h-12 w-full transition-all shadow-inner"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Удалить аккаунт навсегда
                      </Button>
                    </div>
                  </div>
                </div>
            </div>

            {/* Курсы */}
            <div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-6 flex items-center gap-3">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl shadow-inner">
                  <BookOpen className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                Прогресс по курсам
                <span className="text-sm font-bold py-1 px-3 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400 ml-2">
                  {enrollments.length}
                </span>
              </h3>

              {loadingEnrollments ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                </div>
              ) : enrollments.length === 0 ? (
                <div className="bg-white/50 dark:bg-slate-900/50 border-dashed border-2 border-slate-200 dark:border-slate-800 py-16 rounded-[2rem] text-center">
                    <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-500 dark:text-slate-400 font-bold text-lg">
                      Пользователь не записан ни на один курс
                    </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {enrollments.map((enrollment) => (
                    <div
                      key={enrollment._id}
                      className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200/50 dark:border-slate-800/50 hover:shadow-lg transition-all group"
                    >
                        <div className="flex flex-col md:flex-row gap-6 items-center">
                          {/* Информация о курсе */}
                          <div className="flex-1 flex gap-4 w-full">
                              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/20">
                                <BookOpen className="w-8 h-8 text-white/90" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-black text-xl text-slate-900 dark:text-white truncate">
                                  {enrollment.course.title}
                                </h4>
                                <div className="flex flex-wrap items-center gap-3 mt-2">
                                  <span className="text-xs font-bold text-slate-500 font-mono">
                                    Дата: {new Date(enrollment.enrolledAt).toLocaleDateString("ru-RU")}
                                  </span>
                                  <span
                                    className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${
                                      enrollment.status === "active"
                                        ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 ring-1 ring-inset ring-emerald-200/50"
                                        : enrollment.status === "completed"
                                        ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 ring-1 ring-inset ring-blue-200/50"
                                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                                    }`}
                                  >
                                    {enrollment.status === "active"
                                      ? "В процессе"
                                      : enrollment.status === "completed"
                                      ? "Изучен"
                                      : "Отменён"}
                                  </span>
                                </div>
                              </div>
                          </div>

                           {/* Прогресс */}
                           <div className="w-full md:w-64 shrink-0">
                            {enrollment.progress && (
                              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl shadow-inner">
                                <div className="flex items-center justify-between text-xs mb-2">
                                  <span className="font-black text-slate-500 uppercase tracking-widest">
                                    Выполнено
                                  </span>
                                  <span className="font-black text-indigo-600 dark:text-indigo-400 text-sm">
                                    {Math.round(enrollment.progress.overallProgress)}%
                                  </span>
                                </div>
                                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mb-2">
                                  <div
                                    className="bg-indigo-600 h-2 rounded-full transition-all shadow-[0_0_8px_rgba(79,70,229,0.5)]"
                                    style={{
                                      width: `${enrollment.progress.overallProgress}%`,
                                    }}
                                  />
                                </div>
                                <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                  <span>{enrollment.progress.stats.completedLessons}/{enrollment.progress.stats.totalLessons} Урок</span>
                                  <span>{enrollment.progress.stats.completedBlocks}/{enrollment.progress.stats.totalBlocks} Блок</span>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Действия */}
                          <div className="flex flex-row md:flex-col gap-2 shrink-0 w-full md:w-auto mt-4 md:mt-0">
                            <Button
                              variant="outline"
                              onClick={() =>
                                handleResetProgress(
                                  enrollment.course_id,
                                  enrollment.course.title
                                )
                              }
                              className="flex-1 border-amber-200 text-amber-600 hover:bg-amber-50 dark:border-amber-900 dark:hover:bg-amber-900/20 font-bold rounded-xl h-10"
                            >
                              <RotateCcw className="w-4 h-4 md:mr-0 mr-2" />
                              <span className="md:hidden">Сбросить</span>
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() =>
                                handleUnenroll(
                                  enrollment.course_id,
                                  enrollment.course.title
                                )
                              }
                              className="flex-1 border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-900 dark:hover:bg-rose-900/20 font-bold rounded-xl h-10"
                            >
                              <Trash2 className="w-4 h-4 md:mr-0 mr-2" />
                               <span className="md:hidden">Удалить</span>
                            </Button>
                          </div>
                        </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Dialog подтверждения */}
      <AlertDialog
        open={confirmDialog.isOpen}
        onOpenChange={(open) => setConfirmDialog((prev) => ({ ...prev, isOpen: open }))}
      >
        <AlertDialogContent className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-6 sm:p-8">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3 tracking-tight">
              <div className={`p-3 rounded-2xl shadow-inner ${
                   confirmDialog.variant === "destructive"
                   ? "bg-rose-100 dark:bg-rose-500/20 text-rose-600"
                   : "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600"
              }`}>
                 <AlertTriangle className="w-6 h-6" />
              </div>
              {confirmDialog.title}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base font-medium text-slate-600 dark:text-slate-400 mt-2">
              {confirmDialog.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 flex gap-3">
            <AlertDialogCancel className="rounded-xl font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border-transparent h-12 px-6">
              Отмена
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                await confirmDialog.onConfirm();
                setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
              }}
              className={`rounded-xl font-bold h-12 px-8 shadow-lg ${
                confirmDialog.variant === "destructive"
                  ? "bg-rose-600 hover:bg-rose-700 shadow-rose-500/30"
                  : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/30"
              } text-white transition-all active:scale-95`}
            >
              Подтвердить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}