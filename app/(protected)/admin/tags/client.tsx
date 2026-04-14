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
    "#1971c2", // blue
    "#0c8599", // cyan
    "#1098ad", // cyan light
    "#0ca678", // emerald
    "#2b8a3e", // green
    "#2f9e44", // green light
    "#845ef7", // violet
    "#7950f2", // purple
    "#5c7cfa", // blue light
    "#4263eb", // royal blue
    "#364fc7", // navy
    "#c2255c", // pink dark
    "#d63384", // fuchsia
    "#e64980", // pink
    "#f06595", // pink light
    "#fa5252", // red
    "#e03131", // red dark
    "#c92a2a", // red darker
    "#ff6b6b", // coral
    "#ee5a24", // red-orange
    "#e67700", // orange
    "#f08c00", // amber
    "#fab005", // yellow
    "#fd7e14", // orange light
    "#e8590c", // dark orange
    "#f59f00", // gold
    "#9c36b5", // purple dark
    "#be4bdb", // magenta
    "#cc5de8", // orchid
    "#da77f2", // lavender
    "#ae3ec9", // violet dark
    "#01a3a4", // teal
    "#099268", // mint
    "#12b886", // turquoise
    "#38d9a9", // aqua
    "#66d9c8", // seafoam
    "#495057", // gray dark
    "#868e96", // gray
    "#adb5bd", // gray light
    "#343a40", // charcoal
    "#212529", // almost black
    "#ff69b4", // hotpink
    "#ff1493", // deeppink
    "#db7093", // palevioletred
    "#9370db", // mediumpurple
    "#6a5acd", // slateblue
    "#20b2aa", // lightseagreen
    "#3cb371", // mediumseagreen
    "#ffa500", // orange (named)
    "#ff8c00", // darkorange
    "#ffd700", // gold
    "#ff6347", // tomato
    "#ff4500", // orangered
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
          toast.success("Тег удалён");
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : "Ошибка при удалении тега";
          toast.error(message);
        }
      },
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
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-300 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[10%] right-[10%] w-[40rem] h-[40rem] bg-indigo-500/10 dark:bg-indigo-600/10 rounded-full blur-[150px] mix-blend-multiply dark:mix-blend-screen pointer-events-none z-0" />
      <div className="absolute top-[40%] left-[5%] w-[30rem] h-[30rem] bg-pink-500/10 dark:bg-pink-600/10 rounded-full blur-[150px] mix-blend-multiply dark:mix-blend-screen pointer-events-none z-0" />

      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: resolvedTheme === "dark" ? "#0f172a" : "#ffffff",
            color: resolvedTheme === "dark" ? "#f8fafc" : "#0f172a",
            border: resolvedTheme === "dark" ? "1px solid #1e293b" : "1px solid #e2e8f0",
            borderRadius: "1rem",
            boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
            padding: "16px 20px",
            fontWeight: "600",
          },
        }}
      />

      <header className="sticky top-0 z-50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm transition-colors">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link
                href="/admin"
                className="flex items-center gap-3 group cursor-pointer"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform shadow-lg shadow-indigo-500/30">
                  <Code className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight hidden sm:block">
                  CodeLearn <span className="text-indigo-600 dark:text-indigo-400 font-medium">Admin</span>
                </h1>
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all shadow-inner"
              >
                {resolvedTheme === "dark" ? <Sun className="text-yellow-400" size={20} /> : <Moon className="text-slate-600" size={20} />}
              </Button>
              <Link href="/admin">
                <Button variant="outline" className="font-bold border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl flex items-center gap-2 transition-all">
                  <ArrowLeft size={16} /> Назад к курсам
                </Button>
              </Link>
            </div>
          </div>
      </header>

      <main className="max-w-6xl mx-auto w-full px-4 py-12 relative z-10 flex flex-col md:flex-row gap-8">
         {/* Form Section */}
         <div className="w-full md:w-[350px] shrink-0">
          <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border-slate-200/50 dark:border-slate-800/50 shadow-xl shadow-slate-200/20 dark:shadow-none rounded-[2rem] sticky top-28">
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl shadow-inner text-indigo-600 dark:text-indigo-400">
                  {editingId ? <Edit size={24} /> : <Plus size={24} />}
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {editingId ? "Изменить тег" : "Новый тег"}
                </h2>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 pl-1">
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
                    className="h-12 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 pl-1">
                    Slug *
                  </label>
                  <Input
                    placeholder="javascript"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, slug: e.target.value }))
                    }
                    className="h-12 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-xl font-mono text-sm text-slate-500 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 pl-1">
                    Цвет
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={formData.color}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, color: e.target.value }))
                      }
                      className="w-14 h-12 p-1 border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer bg-white dark:bg-slate-800"
                    />
                    <Input
                      type="text"
                      value={formData.color}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, color: e.target.value }))
                      }
                      placeholder="#3b5bdb"
                      className="flex-1 h-12 border-slate-200 dark:border-slate-700 rounded-xl font-mono focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-800"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, color: generateColor() }))
                      }
                      className="shrink-0 h-12 w-12 rounded-xl"
                      title="Сгенерировать случайный цвет"
                    >
                      <Palette size={18} />
                    </Button>
                  </div>
                </div>
              </div>

              {formData.name && (
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                  <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Превью:</p>
                  <span
                    className="inline-block px-4 py-1.5 rounded-full text-white font-bold text-sm shadow-sm transition-transform hover:scale-105"
                    style={{ backgroundColor: formData.color, textShadow: '0px 1px 2px rgba(0,0,0,0.2)' }}
                  >
                    {formData.name}
                  </span>
                </div>
              )}

              <div className="flex flex-col gap-2 pt-2">
                {editingId ? (
                  <>
                    <Button
                      onClick={() => handleUpdate(editingId)}
                      disabled={isCreating}
                      className="h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl w-full shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                    >
                      {isCreating ? <Loader2 size={18} className="animate-spin mr-2" /> : <Check size={18} className="mr-2" />}
                      Сохранить изменения
                    </Button>
                    <Button
                      onClick={cancelEditing}
                      variant="outline"
                      disabled={isCreating}
                      className="h-12 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-xl w-full"
                    >
                      Отмена
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={handleCreate}
                    disabled={isCreating}
                    className="h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl w-full shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
                  >
                    {isCreating ? <Loader2 size={18} className="animate-spin mr-2" /> : <Plus size={18} className="mr-2" />}
                    Создать тег
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* List Section */}
        <div className="flex-1 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md p-6 rounded-[2rem] border border-slate-200/50 dark:border-slate-800/50 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl shadow-inner">
                <Tags className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  Все теги
                </h2>
                 <p className="text-slate-500 dark:text-slate-400 font-medium">
                  Используются для фильтрации курсов
                </p>
              </div>
            </div>
          </div>

          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-indigo-500 transition-colors" />
            <Input
              placeholder="Поиск тегов по названию..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-slate-200/50 dark:border-slate-800/50 rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-base"
            />
          </div>

          {loading ? (
             <div className="flex flex-col items-center justify-center py-32 gap-4">
              <Loader2 className="w-12 h-12 text-indigo-600 dark:text-indigo-400 animate-spin" />
              <span className="text-slate-500 dark:text-slate-400 font-bold tracking-widest uppercase text-sm">Загрузка тегов...</span>
            </div>
          ) : filteredTags.length === 0 ? (
            <Card className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border-dashed border-2 border-slate-300 dark:border-slate-700 py-24 text-center rounded-[2.5rem]">
              <CardContent className="flex flex-col items-center justify-center py-6 text-center">
                <Tags size={64} className="text-slate-300 dark:text-slate-600 mb-6" />
                <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2">
                  {searchQuery ? "По вашему запросу ничего не найдено" : "Теги не созданы"}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                  {searchQuery ? "Попробуйте изменить поисковый запрос" : "Создайте первый тег с помощью формы слева"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredTags.map((tag) => (
                <Card
                  key={tag._id}
                  className="group bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border-slate-200/50 dark:border-slate-800/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                >
                  <CardContent className="p-5 flex flex-col justify-between h-full relative">
                     <div 
                      className="absolute top-0 right-0 w-24 h-24 opacity-10 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-700" 
                      style={{ backgroundColor: tag.color }}
                     />

                    <div className="flex items-start justify-between mb-4 relative z-10">
                      <span
                        className="px-3.5 py-1.5 rounded-full text-white font-bold text-sm shadow-[0_2px_10px_rgba(0,0,0,0.1)]"
                        style={{ backgroundColor: tag.color, textShadow: '0px 1px 2px rgba(0,0,0,0.2)' }}
                      >
                        {tag.name}
                      </span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                          onClick={() => startEditing(tag)}
                        >
                          <Edit size={16} className="text-slate-500 hover:text-indigo-600 transition-colors" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg"
                          onClick={() => handleDelete(tag._id)}
                        >
                          <Trash2 size={16} className="text-rose-500" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2 mt-auto relative z-10">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="font-bold text-slate-400">slug:</span>
                        <code className="text-slate-600 dark:text-slate-300 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md">
                          {tag.slug}
                        </code>
                      </div>
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="font-bold text-slate-400">hex:</span>
                        <div className="flex items-center gap-2">
                           <div
                            className="w-3 h-3 rounded-full border border-slate-200 dark:border-slate-700"
                            style={{ backgroundColor: tag.color }}
                          />
                          <code className="text-slate-600 dark:text-slate-300 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md uppercase">
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
        </div>
      </main>

      <footer className="border-t border-slate-200/50 dark:border-slate-800/50 bg-white/70 dark:bg-slate-950/70 backdrop-blur-2xl py-6 transition-colors mt-auto z-10">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-slate-400 text-xs font-bold uppercase tracking-widest">
          <p>© {new Date().getFullYear()} CodeLearn Admin</p>
          <div className="flex gap-4 normal-case tracking-normal">
            <span className="text-indigo-600 dark:text-indigo-400 font-black">v2.0.4</span>
            <span>CMS для обучения</span>
          </div>
        </div>
      </footer>
    </div>
  );
}