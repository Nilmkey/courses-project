"use client";
import { BlockContent } from "@/types/types";
import React from "react";
import { Video, Link, AlertCircle } from "lucide-react";

interface VideoFormProps {
  content: BlockContent;
  onUpdate: (updatedContent: BlockContent) => void;
}

export const VideoForm = ({ content, onUpdate }: VideoFormProps) => {
  const handleChange = (field: keyof BlockContent, value: string) => {
    onUpdate({
      ...content,
      [field]: value,
    });
  };

  // Функция для определения типа видео и получения embed URL
  const getEmbedUrl = (url: string): string | null => {
    if (!url) return null;

    // YouTube
    const youtubeRegex =
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const youtubeMatch = url.match(youtubeRegex);
    if (youtubeMatch && youtubeMatch[1]) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    }

    // Vimeo
    const vimeoRegex = /(?:vimeo\.com\/)(\d+)/;
    const vimeoMatch = url.match(vimeoRegex);
    if (vimeoMatch && vimeoMatch[1]) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }

    // Прямая ссылка на MP4
    if (url.endsWith(".mp4") || url.endsWith(".webm") || url.endsWith(".ogg")) {
      return url;
    }

    return null;
  };

  const embedUrl = getEmbedUrl(content.url || "");
  const isDirectVideo = content.url?.match(/\.(mp4|webm|ogg)$/i);

  return (
    <div className="w-full bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Левая колонка - Форма */}
        <div className="space-y-6">
          {/* Заголовок секции */}
          <div className="flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-slate-700">
            <Video className="w-5 h-5 text-[#3b5bdb]" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Настройки видео
            </h3>
          </div>

          {/* Поле Title */}
          <div className="relative group">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 group-focus-within:text-[#3b5bdb] transition-colors">
              Название видео
            </label>
            <input
              type="text"
              value={content.titleVideo || ""}
              onChange={(e) => handleChange("titleVideo", e.target.value)}
              placeholder="Введите название..."
              className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-[#3b5bdb] focus:bg-white dark:focus:bg-slate-900 transition-all"
            />
          </div>

          {/* Поле URL */}
          <div className="relative group">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 group-focus-within:text-[#3b5bdb] transition-colors">
              Ссылка на видео
            </label>
            <div className="relative">
              <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={content.url || ""}
                onChange={(e) => handleChange("url", e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-[#3b5bdb] focus:bg-white dark:focus:bg-slate-900 transition-all"
              />
            </div>
          </div>

          <div className="flex items-start gap-2 text-[11px] text-slate-500 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            <span>Ссылка должна вести на YouTube, Vimeo или прямой MP4/WebM/OGG файл</span>
          </div>
        </div>

        {/* Правая колонка - Предпросмотр */}
        <div className="flex items-start">
          {embedUrl ? (
            <div className="w-full">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-slate-700 mb-3">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Предпросмотр
                </h4>
              </div>
              <div className="relative w-full aspect-video bg-slate-900 dark:bg-black rounded-xl overflow-hidden shadow-lg ring-1 ring-slate-200 dark:ring-slate-700">
                {isDirectVideo ? (
                  <video
                    src={embedUrl}
                    controls
                    className="w-full h-full object-contain"
                  >
                    Ваш браузер не поддерживает видео.
                  </video>
                ) : (
                  <iframe
                    src={embedUrl}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="Video preview"
                  />
                )}
              </div>
            </div>
          ) : content.url ? (
            <div className="w-full">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-slate-700 mb-3">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Предпросмотр
                </h4>
              </div>
              <div className="w-full aspect-video bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-600">
                <div className="text-center p-6">
                  <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                    <AlertCircle className="w-7 h-7 text-red-500 dark:text-red-400" />
                  </div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Неподдерживаемый формат
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Используйте YouTube, Vimeo или .mp4/.webm/.ogg
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-slate-700 mb-3">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Предпросмотр
                </h4>
              </div>
              <div className="w-full aspect-video bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-xl flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-600">
                <div className="text-center p-6">
                  <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                    <Video className="w-7 h-7 text-[#3b5bdb] dark:text-blue-400" />
                  </div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Вставьте ссылку для предпросмотра
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
