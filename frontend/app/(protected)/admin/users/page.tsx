"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
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
  Shield,
  GraduationCap,
  X,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/useToast";
import { usersApi, type User } from "@/lib/api/entities/api-users";
import UserDetailModal from "@/components/admin/UserDetailModal";

export default function AdminUsers() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const toast = useToast();

  const latestRequestId = useRef(0);
  const isFirstFetch = useRef(true);

  // Debounce search input to avoid request flooding and 429
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, 350);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Reset to page 1 whenever debounced search changes
  const isFirstMount = useRef(true);
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    setPage(1);
  }, [debouncedSearch]);

  const loadUsers = useCallback(
    async (targetPage: number, targetSearch: string, showSpinner = true) => {
      const requestId = ++latestRequestId.current;

      try {
        if (showSpinner) {
          setIsFetching(true);
        }
        const response = await usersApi.getAll({
          page: targetPage,
          limit: 10,
          search: targetSearch || undefined,
        });

        // Ignore stale requests
        if (requestId !== latestRequestId.current) return;

        setUsers(response.users || []);
        setTotalPages(response.totalPages || 1);
        setTotal(response.total || 0);
      } catch (err) {
        if (requestId !== latestRequestId.current) return;
        console.error("Ошибка загрузки:", err);
        toast.error("Не удалось загрузить пользователей. Попробуйте позже.");
      } finally {
        if (requestId === latestRequestId.current) {
          setIsFetching(false);
          setInitialLoading(false);
        }
      }
    },
    [toast],
  );

  useEffect(() => {
    setMounted(true);
    const showFull = isFirstFetch.current;
    if (isFirstFetch.current) {
      isFirstFetch.current = false;
    }
    loadUsers(page, debouncedSearch, showFull);
  }, [page, debouncedSearch, loadUsers]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanSearch = searchInput.trim();
    if (cleanSearch !== debouncedSearch) {
      setDebouncedSearch(cleanSearch);
      setPage(1);
    } else {
      loadUsers(1, cleanSearch, true);
    }
  };

  const clearSearch = () => {
    setSearchInput("");
    setDebouncedSearch("");
    setPage(1);
  };

  const openUserDetail = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const closeUserDetail = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  // Instant optimistic update when role changes
  const handleUpdateUserRole = (updatedUser: User) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === updatedUser.id ? { ...u, role: updatedUser.role } : u,
      ),
    );
    setSelectedUser((prev) =>
      prev && prev.id === updatedUser.id
        ? { ...prev, role: updatedUser.role }
        : prev,
    );
  };

  // Instant optimistic update when user is deleted
  const handleDeleteUser = (deletedUserId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== deletedUserId));
    setTotal((prev) => Math.max(0, prev - 1));
    closeUserDetail();
  };

  if (!mounted) return null;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-300 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[10%] w-[30rem] h-[30rem] bg-indigo-500/10 dark:bg-indigo-600/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen pointer-events-none z-0" />

      <header className="border-b bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border-slate-200/50 dark:border-slate-800/50 sticky top-0 z-50 transition-colors">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <Link
              href="/admin"
              className="flex items-center gap-3 group cursor-pointer"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform shadow-lg shadow-indigo-500/30">
                <Code className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight hidden sm:block">
                CodeLearn{" "}
                <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                  Admin
                </span>
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
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all shadow-inner"
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
                className="font-bold border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl flex items-center gap-2 transition-all"
              >
                <ChevronLeft size={16} /> Назад к курсам
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-12 relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md p-6 rounded-[2rem] border border-slate-200/50 dark:border-slate-800/50 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl shadow-inner">
              <Users className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                Пользователи
              </h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium">
                Всего аккаунтов на платформе:{" "}
                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                  {total}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="mb-8">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <Input
                type="text"
                placeholder="Поиск по имени или email..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-12 pr-12 h-14 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-slate-200/50 dark:border-slate-800/50 rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-base"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            <Button
              type="submit"
              className="h-14 px-8 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/30 active:scale-95 transition-all text-base shrink-0 flex items-center gap-2"
            >
              {isFetching && <Loader2 className="w-4 h-4 animate-spin" />}
              Найти
            </Button>
          </div>
        </form>

        {initialLoading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="w-12 h-12 text-indigo-600 dark:text-indigo-400 animate-spin" />
            <span className="text-slate-500 dark:text-slate-400 font-bold tracking-widest uppercase text-sm">
              Загрузка данных...
            </span>
          </div>
        ) : (
          <div className={`transition-opacity duration-200 relative ${isFetching ? "opacity-60 pointer-events-none" : "opacity-100"}`}>
            {isFetching && (
              <div className="absolute top-0 inset-x-0 -mt-4 flex justify-center z-20">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-600 text-white text-xs font-bold shadow-lg animate-pulse">
                  <Loader2 className="w-3 h-3 animate-spin" /> Обновление...
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {users.length === 0 ? (
                <div className="col-span-full">
                  <Card className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border-dashed border-2 border-slate-300 dark:border-slate-700 py-24 text-center rounded-[2.5rem]">
                    <CardContent className="flex flex-col items-center">
                      <Users className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-6" />
                      <p className="text-slate-500 dark:text-slate-400 font-bold text-lg">
                        Пользователи не найдены.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                users.map((user) => (
                  <Card
                    key={user.id}
                    className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border-slate-200/50 dark:border-slate-800/50 rounded-3xl shadow-xl shadow-slate-200/10 dark:shadow-none hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group"
                  >
                    <CardContent className="p-5 flex items-center gap-4">
                      {/* Avatar */}
                      <div className="relative shrink-0">
                        <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        {user.avatar ? (
                          <Image
                            src={user.avatar}
                            alt={user.name}
                            width={64}
                            height={64}
                            unoptimized
                            className="w-16 h-16 rounded-2xl object-cover relative z-10 shadow-sm border border-slate-100 dark:border-slate-800"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white text-2xl font-black relative z-10 shadow-lg shadow-indigo-500/20">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-black text-slate-900 dark:text-white truncate">
                          {user.name}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 truncate mb-2">
                          {user.email}
                        </p>
                        <div className="flex items-center gap-2">
                          {user.role === "admin" ? (
                            <span className="inline-flex items-center gap-1 text-[10px] uppercase font-black tracking-widest px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 ring-1 ring-inset ring-rose-200 dark:ring-rose-500/20">
                              <Shield size={10} /> Admin
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] uppercase font-black tracking-widest px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 ring-1 ring-inset ring-indigo-200 dark:ring-indigo-500/20">
                              <GraduationCap size={10} /> Student
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action */}
                      <div className="shrink-0 flex items-center h-full">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openUserDetail(user)}
                          className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 transition-all shadow-inner"
                        >
                          <Eye size={20} />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-10">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1 || isFetching}
                  className="rounded-2xl w-12 h-12 p-0 border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md text-slate-600 dark:text-slate-400"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <div className="px-6 py-2 rounded-2xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-sm text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">
                  Стр {page} / {totalPages}
                </div>
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages || isFetching}
                  className="rounded-2xl w-12 h-12 p-0 border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md text-slate-600 dark:text-slate-400"
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            )}
          </div>
        )}
      </main>

      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          isOpen={isModalOpen}
          onClose={closeUserDetail}
          onUpdateUserRole={handleUpdateUserRole}
          onDeleteUser={handleDeleteUser}
        />
      )}

      <footer className="border-t border-slate-200/50 dark:border-slate-800/50 bg-white/70 dark:bg-slate-950/70 backdrop-blur-2xl py-6 transition-colors mt-auto z-10">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-slate-400 text-xs font-bold uppercase tracking-widest">
          <p>© {new Date().getFullYear()} CodeLearn Admin</p>
          <div className="flex gap-4 normal-case tracking-normal">
            <span className="text-indigo-600 dark:text-indigo-400 font-black">
              v2.0.4
            </span>
            <span>CMS для обучения</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
