"use client";

import { memo, useMemo } from "react";
import { CompletionButton } from "@/components/learning/CompletionButton";
import type { IVideoBlock } from "@/types/types";

/**
 * Определяет тип видео и возвращает embed URL
 */
function getEmbedUrl(url: string): string | null {
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

  // Прямая ссылка на MP4/WebM/OGG
  if (url.endsWith(".mp4") || url.endsWith(".webm") || url.endsWith(".ogg")) {
    return url;
  }

  return null;
}

interface VideoPreviewProps {
  embedUrl: string;
  isDirectVideo: boolean;
}

// Оптимизированный компонент с memo
const VideoPreview = memo<VideoPreviewProps>(function VideoPreview({ embedUrl, isDirectVideo }) {
  if (isDirectVideo) {
    return (
      <video
        src={embedUrl}
        controls
        className="w-full h-full object-contain"
        controlsList="play"
      >
        Ваш браузер не поддерживает видео.
      </video>
    );
  }

  return (
    <iframe
      src={embedUrl}
      className="w-full h-full"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
      allowFullScreen
      title="Video player"
    />
  );
});

export function VideoBlockView({ content }: { content: IVideoBlock["content"] }) {
  // Кэшируем вычисления с useMemo
  const { embedUrl, isDirectVideo, hasError } = useMemo(() => {
    const url = content.url || "";
    const embed = getEmbedUrl(url);
    const isDirect = !!(
      url && (url.endsWith(".mp4") || url.endsWith(".webm") || url.endsWith(".ogg"))
    );
    const error = !embed;
    
    return { embedUrl: embed || "", isDirectVideo: isDirect, hasError: error };
  }, [content.url]);

  return (
    <div>
      {content.titleVideo && (
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          {content.titleVideo}
        </h2>
      )}

      {hasError ? (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-8 mb-6 text-center">
          <div className="text-red-600 dark:text-red-400 font-medium">
            Неподдерживаемый формат видео
          </div>
          <p className="text-red-500 dark:text-red-400 text-sm mt-2">
            Пожалуйста, используйте ссылки на YouTube, Vimeo или прямые ссылки
            на .mp4/.webm/.ogg файлы
          </p>
        </div>
      ) : (
        <div className="relative aspect-video bg-black rounded-xl overflow-hidden mb-6 shadow-lg">
          <VideoPreview embedUrl={embedUrl} isDirectVideo={isDirectVideo} />
        </div>
      )}

      <CompletionButton />
    </div>
  );
}
