"use client";

import React, { useEffect, useState } from "react";
import { X, Loader2, Trash2, RotateCcw, UserCog, BookOpen, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Toaster } from "react-hot-toast";
import { useToast } from "@/hooks/useToast";
import { usersApi, type User, type UserEnrollment } from "@/lib/api/entities/api-users";
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
      loadEnrollments();
    }
  }, [isOpen, user]);

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
