"use client";

import { useState, useEffect } from "react";
import { X, Plus, Search, Loader2 } from "lucide-react";
import {
  tagsApi,
  type TagResponse,
} from "@/lib/api/entities/api-tags";
import { slugify } from "@/lib/utils/slugify";
import { useToast } from "@/hooks/useToast";

interface TagSelectorProps {
  selectedTagIds: string[];
  onChange: (tagIds: string[]) => void;
}

export function TagSelector({ selectedTagIds, onChange }: TagSelectorProps) {
  const [allTags, setAllTags] = useState<TagResponse[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      setIsLoading(true);
      const response = await tagsApi.getAll();
      setAllTags(response.tags || []);
    } catch (err) {
      console.error("Ошибка загрузки тегов:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTags = allTags.filter((tag) =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const toggleTag = (tagId: string) => {
    if (selectedTagIds.includes(tagId)) {
      onChange(selectedTagIds.filter((id) => id !== tagId));
    } else {
      onChange([...selectedTagIds, tagId]);
    }
  };

  const removeTag = (tagId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selectedTagIds.filter((id) => id !== tagId));
  };

  const selectedTags = allTags.filter((tag) =>
    selectedTagIds.includes(tag._id),
  );

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
          Теги курса
        </label>

        {/* Выбранные теги */}
        {selectedTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedTags.map((tag) => (
              <span
                key={tag._id}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-sm font-medium transition-all hover:scale-105"
                style={{ backgroundColor: tag.color }}
              >
                {tag.name}
                <button
                  onClick={(e) => removeTag(tag._id, e)}
                  className="p-0.5 rounded-full hover:bg-white/20 transition-colors"
                  type="button"
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Поиск */}
        <div className="relative mb-4">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Поиск тегов..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3b5bdb] focus:border-transparent transition-all"
          />
        </div>

        {/* Список тегов для выбора */}
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={24} className="animate-spin text-[#3b5bdb]" />
          </div>
        ) : filteredTags.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
            {searchQuery ? "Теги не найдены" : "Нет доступных тегов"}
          </p>
        ) : (
          <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2 rounded-xl border border-slate-200 dark:border-slate-700">
            {filteredTags.map((tag) => {
              const isSelected = selectedTagIds.includes(tag._id);
              return (
                <button
                  key={tag._id}
                  onClick={() => toggleTag(tag._id)}
                  className={`
                    inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium
                    transition-all hover:scale-105
                    ${
                      isSelected
                        ? "ring-2 ring-offset-2 ring-[#3b5bdb] dark:ring-offset-slate-900"
                        : ""
                    }
                  `}
                  style={{
                    backgroundColor: isSelected ? tag.color : `${tag.color}20`,
                    color: isSelected ? "#fff" : tag.color,
                  }}
                  type="button"
                >
                  {isSelected && <Plus size={14} />}
                  {tag.name}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Кнопка перехода к управлению тегами */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {selectedTagIds.length} тегов выбрано
        </p>
        <a
          href="/admin/tags"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-semibold text-[#3b5bdb] hover:underline transition-colors"
        >
          Управление тегами
        </a>
      </div>
    </div>
  );
}
