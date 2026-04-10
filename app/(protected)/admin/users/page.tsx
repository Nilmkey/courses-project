"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
  Code,
  Sun,
  Moon,
  Loader2,
  Search,
  Users,
  ChevronLeft,
  ChevronRight,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Toaster } from "react-hot-toast";
import { useToast } from "@/hooks/useToast";
import { usersApi, type User } from "@/lib/api/entities/api-users";
import UserDetailModal from "@/components/admin/UserDetailModal";

export default function AdminUsers() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const toast = useToast();

  useEffect(() => {
    setMounted(true);
    loadUsers();
  }, [page, search]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await usersApi.getAll({
        page,
        limit: 10,
        search: search || undefined,
      });
      setUsers(response.users || []);
      setTotalPages(response.totalPages);
      setTotal(response.total);
    } catch (err) {
      console.error("Ошибка загрузки:", err);
      toast.error("Не удалось загрузить пользователей. Попробуйте позже.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadUsers();
  };

  const openUserDetail = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const closeUserDetail = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  if (!mounted) return null;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: resolvedTheme === "dark" ? "#0f172a" : "#ffffff",
            color: resolvedTheme === "dark" ? "#f1f5f9" : "#0f172a",
            border:
              resolvedTheme === "dark"
                ? "1px solid #1e293b"
                : "1px solid #e2e8f0",
            borderRadius: "0.75rem",
            boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
          },
        }}
      />

      <header className="border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="flex items-center gap-2 group cursor-pointer"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                <Code className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                CodeLearn <span className="text-blue-600">Admin</span>
              </h1>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                setTheme(resolvedTheme === "dark" ? "light" : "dark")
              }
              className="rounded-full"
            >
              {resolvedTheme === "dark" ? (
                <Sun className="text-yellow-400" size={20} />
              ) : (
                <Moon className="text-slate-600" size={20} />
              )}
            </Button>
            <Link href="/admin">
              <Button
                variant="outline"
                className="font-bold border-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <Users className="w-4 h-4 mr-2" /> Курсы
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                Управление пользователями
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                Всего пользователей: {total}
              </p>
            </div>
          </div>
        </div>

        {/* Поиск */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Поиск по имени или email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
            >
              Найти
            </Button>
          </div>
        </form>

        {/* Список пользователей */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          </div>
        ) : (
          <>
            <div className="grid gap-4">
              {users.length === 0 ? (
                <Card className="border-dashed border-2 py-20 text-center">
                  <CardContent>
                    <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 font-bold">
                      Пользователей не найдено.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                users.map((user) => (
                  <Card
                    key={user.id}
                    className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-4 flex flex-col sm:flex-row items-center gap-6">
                      {/* Аватар */}
                      <div className="flex-shrink-0">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>

                      {/* Информация */}
                      <div className="flex-1 text-center sm:text-left">
                        <h3 className="text-lg font-black dark:text-white">
                          {user.name}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {user.email}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`text-xs font-bold px-2 py-1 rounded-full ${
                              user.role === "admin"
                                ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                                : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
                            }`}
                          >
                            {user.role === "admin"
                              ? "Администратор"
                              : "Студент"}
                          </span>
                        </div>
                      </div>

                      {/* Действия */}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openUserDetail(user)}
                          className="font-bold"
                        >
                          <Eye className="w-4 h-4 mr-2" /> Подробнее
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Пагинация */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  Страница {page} из {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Модальное окно с деталями пользователя */}
      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          isOpen={isModalOpen}
          onClose={closeUserDetail}
          onUpdateUserRole={() => loadUsers()}
        />
      )}

      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 transition-colors">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-slate-400 text-xs font-bold uppercase tracking-widest">
          <p>© {new Date().getFullYear()} CodeLearn Admin Dashboard</p>
          <div className="flex gap-4 normal-case tracking-normal">
            <span className="text-blue-600 font-black">v2.0.4</span>
            <span>CMS для обучения</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
