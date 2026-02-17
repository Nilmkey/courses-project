"use client";
import { BlockContent } from "@/types/types";
import React from "react";

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
    <div className="w-full bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Левая колонка - Форма */}
        <div className="space-y-6">
          {/* Поле Title */}
          <div className="relative group">
            <label className="block text-xs font-medium text-slate-900 mb-1 group-focus-within:text-blue-600 transition-colors">
              Название видео
            </label>
            <input
              type="text"
              value={content.titleVideo || ""}
              onChange={(e) => handleChange("titleVideo", e.target.value)}
              placeholder="Введите название..."
              className="w-full px-3 py-2 text-base border-b-2 text-gray-500 outline-none focus:border-blue-600 transition-all bg-transparent"
            />
          </div>

          {/* Поле URL */}
          <div className="relative group">
            <label className="block text-xs font-medium text-slate-900 mb-1 group-focus-within:text-blue-600 transition-colors">
              Ссылка на видео
            </label>
            <input
              type="text"
              value={content.url || ""}
              onChange={(e) => handleChange("url", e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full px-3 py-2 text-base border-b-2 text-gray-500 outline-none focus:border-blue-600 transition-all bg-transparent"
            />
          </div>

          <div className="text-[11px] text-gray-400 italic">
            * Ссылка должна вести на YouTube, Vimeo или прямой MP4 файл.
          </div>
        </div>

        {/* Правая колонка - Предпросмотр */}
        <div className="flex items-start">
          {embedUrl ? (
            <div className="w-full">
              <div className="text-xs font-medium text-slate-900 mb-2">
                Предпросмотр
              </div>
              <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden shadow-lg">
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
              <div className="text-xs font-medium text-slate-900 mb-2">
                Предпросмотр
              </div>
              <div className="w-full aspect-video bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                <div className="text-center p-4">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400 mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-sm text-gray-500">
                    Неподдерживаемый формат ссылки
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Используйте YouTube, Vimeo или .mp4
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full">
              <div className="text-xs font-medium text-slate-900 mb-2">
                Предпросмотр
              </div>
              <div className="w-full aspect-video bg-gray-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                <div className="text-center p-4">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-300 mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-sm text-gray-400">
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
