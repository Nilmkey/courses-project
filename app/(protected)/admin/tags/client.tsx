"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
  Code,
  Plus,
  Trash2,
  Edit,
  Tags,
  Sun,
  Moon,
  Loader2,
  ArrowLeft,
  Search,
  X,
  Check,
  Palette,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { tagsApi, type TagResponse, type CreateTagData, type UpdateTagData } from "@/lib/api/entities/api-tags";
import { slugify } from "@/lib/utils/slugify";
import { Toaster } from "react-hot-toast";
import { useToast } from "@/hooks/useToast";

const generateColor = () => {
  const colors = [
    "#3b5bdb", // indigo
    "#0ca678", // emerald
    "#e67700", // orange
    "#c2255c", // pink
    "#845ef7", // violet
    "#1098ad", // cyan
    "#f08c00", // amber
    "#2b8a3e", // green
    "#5c7cfa", // blue
    "#d63384", // fuchsia
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

export default function AdminTagsPage() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [tags, setTags] = useState<TagResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateTagData>({
    name: "",
    slug: "",
    color: generateColor(),
  });

  const toast = useToast();

  useEffect(() => {
    setMounted(true);
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      setLoading(true);
      const response = await tagsApi.getAll();
      setTags(response.tags || []);
    } catch (err) {
      console.error("Ошибка загрузки тегов:", err);
      toast.error("Не удалось загрузить теги. Попробуйте позже.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.name.trim() || !formData.slug.trim()) {
      toast.error("Название и slug обязательны");
      return;
    }

    try {
      setIsCreating(true);
      await tagsApi.create(formData);
      toast.success("Тег успешно создан");
      setFormData({ name: "", slug: "", color: generateColor() });
      await loadTags();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Ошибка при создании тега";
      toast.error(message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdate = async (id: string) => {
    const tag = tags.find((t) => t._id === id);
    if (!tag) return;

    const updateData: UpdateTagData = {
      name: formData.name || tag.name,
      slug: formData.slug || tag.slug,
      color: formData.color || tag.color,
    };

    try {
      await tagsApi.update(id, updateData);
      toast.success("Тег успешно обновлён");
      setEditingId(null);
      setFormData({ name: "", slug: "", color: generateColor() });
      await loadTags();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Ошибка при обновлении тега";
      toast.error(message);
    }
  };

  const handleDelete = async (id: string) => {
    toast.confirm(
      "Вы уверены, что хотите удалить этот тег? Если он используется в курсах, удаление не удастся.",
      async () => {
        try {
          await tagsApi.delete(id);
          setTags(tags.filter((t) => t._id !== id));
          toast.success("Тег успешно удалён");
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : "Ошибка при удалении тега";
          toast.error(message);
        }
      },
      {
        confirmText: "Удалить",
        confirmClassName: "bg-red-600 hover:bg-red-500",
      }
    );
  };

  const startEditing = (tag: TagResponse) => {
    setEditingId(tag._id);
    setFormData({
      name: tag.name,
      slug: tag.slug,
      color: tag.color,
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setFormData({ name: "", slug: "", color: generateColor() });
  };

  const filteredTags = tags.filter((tag) =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-indigo-100/50 dark:border-slate-800 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href="/admin"
            className="group flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-[#3b5bdb] transition-colors"
          >
            <div className="p-1.5 rounded-lg group-hover:bg-indigo-50 dark:group-hover:bg-slate-800 transition-colors">
              <ArrowLeft size={16} />
            </div>
            <span className="hidden sm:inline">К админке</span>
          </Link>

          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative flex items-center justify-center w-9 h-9 bg-[#3b5bdb] rounded-xl shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
              <Code size={20} className="text-white" />
            </div>
            <span className="text-xl font-black tracking-tight uppercase dark:text-white">
              CodeLearn
            </span>
          </Link>

          <button
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="p-2 rounded-full hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors"
          >
            {resolvedTheme === "dark" ? (
              <Sun size={18} className="text-yellow-400" />
            ) : (
              <Moon size={18} className="text-slate-600" />
            )}
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 space-y-8 grow">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#3b5bdb] to-[#5c7cfa] flex items-center justify-center shadow-lg shadow-blue-500/20 text-white">
            <Tags size={24} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">
              Управление тегами
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              Создание и редактирование тегов для курсов
            </p>
          </div>
        </div>

        <Card className="border-indigo-100 dark:border-slate-800 shadow-lg shadow-indigo-500/5">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2 mb-4">
              {editingId ? (
                <>
                  <Edit size={20} className="text-[#3b5bdb]" />
                  <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                    Редактирование тега
                  </h2>
                </>
              ) : (
                <>
                  <Plus size={20} className="text-[#3b5bdb]" />
                  <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                    Создать новый тег
                  </h2>
                </>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                  Название *
                </label>
                <Input
                  placeholder="Например: JavaScript"
                  value={formData.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      name,
                      slug: slugify(name),
                    }));
                  }}
                  className="border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                  Slug *
                </label>
                <Input
                  placeholder="javascript"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, slug: e.target.value }))
                  }
                  className="border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                  Цвет
                </label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={formData.color}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, color: e.target.value }))
                    }
                    className="w-16 h-10 p-1 border-slate-200 dark:border-slate-700 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={formData.color}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, color: e.target.value }))
                    }
                    placeholder="#3b5bdb"
                    className="flex-1 border-slate-200 dark:border-slate-700"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, color: generateColor() }))
                    }
                    className="shrink-0"
                  >
                    <Palette size={18} />
                  </Button>
                </div>
              </div>
            </div>

            {formData.name && (
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <span>Предпросмотр:</span>
                <span
                  className="px-3 py-1 rounded-full text-white font-medium text-xs"
                  style={{ backgroundColor: formData.color }}
                >
                  {formData.name}
                </span>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              {editingId ? (
                <>
                  <Button
                    onClick={() => handleUpdate(editingId)}
                    disabled={isCreating}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white"
                  >
                    {isCreating ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Check size={16} />
                    )}
                    Сохранить
                  </Button>
                  <Button
                    onClick={cancelEditing}
                    variant="outline"
                    disabled={isCreating}
                  >
                    <X size={16} />
                    Отмена
                  </Button>
                </>
              ) : (
                <Button
                  onClick={handleCreate}
                  disabled={isCreating}
                  className="bg-[#3b5bdb] hover:bg-[#2f4bbf] text-white"
                >
                  {isCreating ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Plus size={16} />
                  )}
                  Создать тег
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <Input
            placeholder="Поиск тегов..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-slate-200 dark:border-slate-700"
          />
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 size={40} className="animate-spin text-[#3b5bdb]" />
            <p className="mt-4 text-sm font-medium text-slate-400">
              Загрузка тегов...
            </p>
          </div>
        ) : filteredTags.length === 0 ? (
          <Card className="border-dashed border-2 border-slate-200 dark:border-slate-800">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Tags size={48} className="text-slate-300 mb-4" />
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
                {searchQuery ? "Ничего не найдено" : "Теги не созданы"}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
                {searchQuery
                  ? "Попробуйте изменить поисковый запрос"
                  : "Создайте первый тег, чтобы начать категоризацию курсов"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTags.map((tag) => (
              <Card
                key={tag._id}
                className="group hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300 border-slate-200 dark:border-slate-800"
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <span
                      className="px-3 py-1 rounded-full text-white font-medium text-sm"
                      style={{ backgroundColor: tag.color }}
                    >
                      {tag.name}
                    </span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-indigo-50 dark:hover:bg-slate-800"
                        onClick={() => startEditing(tag)}
                      >
                        <Edit size={14} className="text-[#3b5bdb]" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-red-50 dark:hover:bg-red-900/20"
                        onClick={() => handleDelete(tag._id)}
                      >
                        <Trash2 size={14} className="text-red-500" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Slug:</span>
                      <code className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                        {tag.slug}
                      </code>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Цвет:</span>
                      <div className="flex items-center gap-1">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: tag.color }}
                        />
                        <code className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                          {tag.color}
                        </code>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <footer className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 py-8 mt-auto">
        <div className="container mx-auto px-4 flex justify-between items-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">
          <div className="flex items-center gap-2">
            <Code className="w-5 h-5 text-blue-600" />
            <span className="text-lg font-black text-slate-800 dark:text-white tracking-tight">
              CodeLearn
            </span>
          </div>
          <p>© {new Date().getFullYear()} CodeLearn. Все права защищены.</p>
        </div>
      </footer>
    </div>
  );
}
