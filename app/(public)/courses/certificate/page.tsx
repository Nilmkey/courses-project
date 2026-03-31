"use client";

import React, { useRef, useState } from "react";
import { Download, Home, Award, Loader2, Medal } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { toPng } from "html-to-image";


export default function CertificatePage() {
  const searchParams = useSearchParams();
  const certificateRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Получаем данные из URL query параметров
  const userName = searchParams.get("userName") || "Пользователь";
  const courseName = searchParams.get("courseName") || "Курс";
  const date = new Date().toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const handleDownloadPdf = async () => {
    if (!certificateRef.current) return;

    setIsGenerating(true);
    try {
      // Ждем загрузки шрифтов перед генерацией
      await document.fonts.ready;

      const loadScript = (src: string) =>
        new Promise((resolve, reject) => {
          if (document.querySelector(`script[src="${src}"]`))
            return resolve(true);
          const script = document.createElement("script");
          script.src = src;
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });

      await loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js",
      );

      const element = certificateRef.current;

      const dataUrl = await toPng(element, {
        quality: 1.0,
        backgroundColor: "#ffffff",
        cacheBust: true,
        skipFonts: true,
        style: {
          fontFamily: "system-ui, -apple-system, sans-serif",
        },
      });

      const pdf = new (window as any).jspdf.jsPDF("landscape", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Сертификат_${userName.replace(/\s+/g, "_")}.pdf`);
    } catch (error) {
      console.error("Ошибка при генерации PDF:", error);
      alert("Произошла ошибка при скачивании сертификата.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center py-12 px-4 font-sans text-slate-900">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black text-slate-800 dark:text-white mb-2">
          Поздравляем с окончанием курса! 🎉
        </h1>
        <p className="text-slate-500">
          Ваш сертификат готов. Вы можете скачать его в формате PDF.
        </p>
      </div>

      <div className="w-full max-w-5xl overflow-x-auto pb-8 flex justify-center">
        <div
          ref={certificateRef}
          className="relative bg-white w-[1056px] h-[746px] shrink-0 shadow-2xl flex items-center justify-center p-12 overflow-hidden print-exact"
          style={{
            backgroundImage:
              "radial-gradient(circle at center, #ffffff 0%, #f8fafc 100%)",
          }}
        >
          <div className="absolute inset-8 border-[12px] border-[#1e293b] flex items-center justify-center">
            <div className="absolute inset-2 border-2 border-[#1e293b]"></div>
          </div>

          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
            <Award size={600} />
          </div>

          <div className="relative z-10 flex flex-col items-center text-center px-20">
            <div className="mb-8 text-[#3b5bdb]">
              <Medal size={80} strokeWidth={1.5} />
            </div>

            <h1 className="text-5xl font-black tracking-[0.2em] text-slate-900 uppercase mb-4">
              Сертификат
            </h1>
            <h2 className="text-xl text-slate-500 uppercase tracking-widest font-bold mb-12">
              Об успешном окончании курса
            </h2>

            <p className="text-lg text-slate-600 mb-6 italic">
              Настоящим подтверждается, что
            </p>

            <div className="mb-6 pb-2 border-b-2 border-slate-300 w-full max-w-2xl px-12">
              <h3 className="text-5xl font-serif text-[#3b5bdb]">{userName}</h3>
            </div>

            <p className="text-lg text-slate-600 mb-6 italic">
              успешно завершил(а) программу обучения по направлению
            </p>

            <h4 className="text-3xl font-bold text-slate-800 mb-20 max-w-3xl">
              «{courseName}»
            </h4>

            <div className="w-full max-w-3xl flex justify-between items-end mt-auto px-10">
              <div className="flex flex-col items-center">
                <span className="text-lg font-bold text-slate-800 mb-2">
                  {date}
                </span>
                <span className="text-sm text-slate-500 border-t border-slate-300 pt-2 w-48 text-center uppercase tracking-wider">
                  Дата выдачи
                </span>
              </div>

              <div className="w-24 h-24 rounded-full border-4 border-[#3b5bdb]/30 flex items-center justify-center text-[#3b5bdb]/30 transform -rotate-12">
                <span className="font-bold uppercase text-xs tracking-widest text-center">
                  Code
                  <br />
                  Learn
                  <br />
                  Одобрено
                </span>
              </div>

              <div className="flex flex-col items-center">
                <span className="text-3xl text-slate-800 mb-1" style={{ fontFamily: "cursive" }}>
                  А.Копьев
                </span>
                <span className="text-sm text-slate-500 border-t border-slate-300 pt-2 w-48 text-center uppercase tracking-wider">
                  Директор платформы
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 flex justify-center gap-4 z-50">
        <button
          onClick={handleDownloadPdf}
          disabled={isGenerating}
          className="flex items-center gap-2 bg-[#3b5bdb] hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-blue-500/30 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Генерация PDF...
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              Сохранить PDF
            </>
          )}
        </button>

        <a
          href="/"
          className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-8 py-4 rounded-2xl font-bold transition-all active:scale-95"
        >
          <Home className="w-5 h-5" />
          На главную
        </a>
      </div>
    </div>
  );
}
