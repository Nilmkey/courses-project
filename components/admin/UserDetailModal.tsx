"use client";

import React, { useEffect, useState } from "react";
import { X, Loader2, Trash2, RotateCcw, UserCog, BookOpen, AlertTriangle, UserPlus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  const [availableCourses, setAvailableCourses] = useState<any[]>([]);
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

  useEffect(() => {
    if (isOpen && user) {
      setSelectedRole(user.role);
      setSelectedCourseId("");
      setCourseSearch("");
      setShowCourseDropdown(false);
      loadEnrollments();
      loadAvailableCourses();
    }
  }, [isOpen, user]);

  const loadAvailableCourses = async () => {
    try {
      setLoadingCourses(true);
      const response = await coursesApi.getAll();
      setAvailableCourses(response.courses || []);
    } catch (err) {
      console.error("Ошибка загрузки курсов:", err);
    } finally {
      setLoadingCourses(false);
    }
  };

  const loadEnrollments = async () => {
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
  };

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
        } catch (err: any) {
          console.error("Ошибка записи на курс:", err);
          toast.error(err?.message || "Не удалось записать на курс");
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
        } catch (err: any) {
          console.error("Ошибка удаления аккаунта:", err);
          toast.error(err?.message || "Не удалось удалить аккаунт");
        }
      },
    });
  };

  // Фильтруем курсы: исключаем уже записанные + поиск по названию
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
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal */}
        <div
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
            <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              Профиль пользователя
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="p-6 space-y-6">
            {/* Информация о пользователе */}
            <Card className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Аватар */}
                  <div className="flex-shrink-0">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-24 h-24 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-4xl font-bold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Детали */}
                  <div className="flex-1 space-y-4">
                    <div>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white">
                        {user.name}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {user.email}
                      </p>
                    </div>

                    {/* Изменение роли */}
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <UserCog className="w-4 h-4" />
                        Роль пользователя
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {(["student", "admin"] as const).map((role) => (
                          <button
                            key={role}
                            onClick={() => setSelectedRole(role)}
                            className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                              selectedRole === role
                                ? role === "admin"
                                  ? "bg-rose-600 text-white"
                                  : "bg-slate-600 text-white"
                                : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600"
                            }`}
                          >
                            {role === "admin"
                              ? "Администратор"
                              : "Студент"}
                          </button>
                        ))}
                      </div>
                      {selectedRole !== user.role && (
                        <Button
                          onClick={handleUpdateRole}
                          disabled={loading}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
                        >
                          {loading ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : null}
                          Сохранить роль
                        </Button>
                      )}
                    </div>

                    {/* Запись на курс */}
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <UserPlus className="w-4 h-4" />
                        Записать на курс
                      </label>

                      {/* Поиск курсов */}
                      <div className="relative">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="text"
                            placeholder="Найти курс..."
                            value={courseSearch}
                            onChange={(e) => {
                              setCourseSearch(e.target.value);
                              setShowCourseDropdown(true);
                            }}
                            onFocus={() => setShowCourseDropdown(true)}
                            onBlur={() => {
                              // Задержка чтобы кликнуть по варианту
                              setTimeout(() => setShowCourseDropdown(false), 200);
                            }}
                            className="w-full pl-10 pr-3 py-2 rounded-lg bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={loadingCourses}
                          />
                        </div>

                        {/* Выпадающий список курсов */}
                        {showCourseDropdown && (
                          <div className="absolute z-50 mt-1 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {loadingCourses ? (
                              <div className="flex items-center justify-center py-4">
                                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                              </div>
                            ) : filteredCourses.length === 0 ? (
                              <div className="py-4 text-center text-sm text-slate-500 dark:text-slate-400">
                                {availableCourses.length === enrollments.length
                                  ? "Все курсы уже добавлены"
                                  : "Курсы не найдены"}
                              </div>
                            ) : (
                              filteredCourses.map((course) => (
                                <button
                                  key={course._id}
                                  onMouseDown={() => {
                                    setSelectedCourseId(course._id);
                                    setCourseSearch(course.title);
                                    setShowCourseDropdown(false);
                                  }}
                                  className="w-full px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-3"
                                >
                                  {course.thumbnail ? (
                                    <img
                                      src={course.thumbnail}
                                      alt={course.title}
                                      className="w-10 h-10 rounded object-cover flex-shrink-0"
                                    />
                                  ) : (
                                    <div className="w-10 h-10 rounded bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                                      <BookOpen className="w-5 h-5 text-white/80" />
                                    </div>
                                  )}
                                  <div className="min-w-0">
                                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                      {course.title}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                      {course.level === "beginner"
                                        ? "Начальный"
                                        : course.level === "intermediate"
                                        ? "Средний"
                                        : "Продвинутый"}
                                    </p>
                                  </div>
                                </button>
                              ))
                            )}
                          </div>
                        )}
                      </div>

                      {/* Кнопка записи */}
                      {selectedCourseId && (
                        <Button
                          onClick={handleEnrollUser}
                          disabled={loadingCourses}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white font-bold w-full"
                        >
                          <UserPlus className="w-4 h-4 mr-2" />
                          Записать на: {availableCourses.find((c) => c._id === selectedCourseId)?.title}
                        </Button>
                      )}
                    </div>

                    {/* Удалить аккаунт */}
                    <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                      <Button
                        onClick={handleDeleteUser}
                        variant="outline"
                        size="sm"
                        className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:border-rose-600 font-bold"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Удалить аккаунт
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Курсы */}
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                Курсы пользователя
                <span className="text-sm font-normal text-slate-500 dark:text-slate-400 normal-case tracking-normal">
                  ({enrollments.length})
                </span>
              </h3>

              {loadingEnrollments ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
              ) : enrollments.length === 0 ? (
                <Card className="border-dashed border-2 py-12 text-center">
                  <CardContent>
                    <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-slate-500 font-bold text-sm">
                      Пользователь не записан ни на один курс
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {enrollments.map((enrollment) => (
                    <Card
                      key={enrollment._id}
                      className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-4">
                        <div className="flex flex-col lg:flex-row gap-4">
                          {/* Информация о курсе */}
                          <div className="flex-1">
                            <div className="flex items-start gap-3">
                              {enrollment.course.thumbnail ? (
                                <img
                                  src={enrollment.course.thumbnail}
                                  alt={enrollment.course.title}
                                  className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                                />
                              ) : (
                                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                                  <BookOpen className="w-8 h-8 text-white/80" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <h4 className="font-black text-slate-900 dark:text-white truncate">
                                  {enrollment.course.title}
                                </h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                  Записан:{" "}
                                  {new Date(enrollment.enrolledAt).toLocaleDateString("ru-RU")}
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                  <span
                                    className={`text-xs font-bold px-2 py-1 rounded-full ${
                                      enrollment.status === "active"
                                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                        : enrollment.status === "completed"
                                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                        : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
                                    }`}
                                  >
                                    {enrollment.status === "active"
                                      ? "Активен"
                                      : enrollment.status === "completed"
                                      ? "Завершён"
                                      : "Отменён"}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Прогресс */}
                            {enrollment.progress && (
                              <div className="mt-3">
                                <div className="flex items-center justify-between text-xs mb-1">
                                  <span className="font-bold text-slate-600 dark:text-slate-400">
                                    Прогресс
                                  </span>
                                  <span className="font-black text-blue-600 dark:text-blue-400">
                                    {Math.round(enrollment.progress.overallProgress)}%
                                  </span>
                                </div>
                                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                  <div
                                    className="bg-blue-600 h-2 rounded-full transition-all"
                                    style={{
                                      width: `${enrollment.progress.overallProgress}%`,
                                    }}
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-slate-600 dark:text-slate-400">
                                  <span>
                                    Уроков: {enrollment.progress.stats.completedLessons}/
                                    {enrollment.progress.stats.totalLessons}
                                  </span>
                                  <span>
                                    Блоков: {enrollment.progress.stats.completedBlocks}/
                                    {enrollment.progress.stats.totalBlocks}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Действия */}
                          <div className="flex lg:flex-col gap-2 flex-shrink-0">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleResetProgress(
                                  enrollment.course_id,
                                  enrollment.course.title
                                )
                              }
                              className="text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:border-amber-600 font-bold"
                            >
                              <RotateCcw className="w-4 h-4 mr-1" />
                              Сбросить прогресс
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleUnenroll(
                                  enrollment.course_id,
                                  enrollment.course.title
                                )
                              }
                              className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:border-rose-600 font-bold"
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Отписать
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
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
        <AlertDialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle
                className={`w-5 h-5 ${
                  confirmDialog.variant === "destructive"
                    ? "text-rose-600"
                    : "text-amber-600"
                }`}
              />
              {confirmDialog.title}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 dark:text-slate-400">
              {confirmDialog.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold">
              Отмена
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                await confirmDialog.onConfirm();
                setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
              }}
              className={`${
                confirmDialog.variant === "destructive"
                  ? "bg-rose-600 hover:bg-rose-700"
                  : "bg-blue-600 hover:bg-blue-700"
              } text-white font-bold`}
            >
              Подтвердить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
