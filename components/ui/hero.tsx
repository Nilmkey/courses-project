'use client'

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, BookOpen } from "lucide-react";
import { authClient } from "@/lib/auth-client";

function useTypingEffect(text: string, speed: number = 50, delay: number = 500) {
  const [displayed, setDisplayed] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      let index = 0;
      const interval = setInterval(() => {
        if (index < text.length) {
          setDisplayed(text.slice(0, index + 1));
          index++;
        } else {
          setIsComplete(true);
          clearInterval(interval);
        }
      }, speed);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timeout);
  }, [text, speed, delay]);

  return { displayed, isComplete };
}

function TypingCursor() {
  return (
    <span className="inline-block w-[3px] h-[0.85em] bg-indigo-500 dark:bg-indigo-400 ml-1 animate-pulse align-middle rounded-sm" />
  );
}

export default function Hero() {
  const { data: session, isPending } = authClient.useSession();
  const isAuthenticated = !!session?.user;

  const title = useTypingEffect("на реальной практике", 55, 600);
  const subtitle = useTypingEffect(
    "CodeLearn — это место, где обучение превращается в практику: вы создаёте реальные продукты, а не просто изучаете теорию.",
    16.7,
    1670
  );

  if (isPending) {
    return (
      <section className="relative pt-24 pb-32 md:pt-32 md:pb-40 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="h-8 w-64 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mb-8 animate-pulse" />
          <div className="h-20 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mb-8 animate-pulse" />
          <div className="h-6 w-2/3 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mb-12 animate-pulse" />
          <div className="h-16 w-80 bg-slate-200 dark:bg-slate-800 rounded-2xl mx-auto animate-pulse" />
        </div>
      </section>
    );
  }

  return (
    <section className="relative pt-24 pb-32 md:pt-32 md:pb-40 overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[10%] w-[40rem] h-[40rem] bg-indigo-500/20 dark:bg-indigo-600/20 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-pulse duration-[8000ms]" />
        <div className="absolute bottom-[20%] right-[-10%] w-[35rem] h-[35rem] bg-pink-500/20 dark:bg-pink-600/20 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen" />
        <div className="absolute top-[40%] left-[-20%] w-[30rem] h-[30rem] bg-blue-500/20 dark:bg-blue-600/20 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen block" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-sm font-bold mb-8 shadow-sm backdrop-blur-sm animate-in slide-in-from-bottom-4 duration-500">
          <span>Платформа №1 для будущих разработчиков</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black text-slate-900 dark:text-white mb-8 tracking-tighter leading-[1.05]">
          <span className="block">
            Построй свой<br className="hidden md:block" /> путь в IT <br className="md:hidden" />
          </span>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
            {title.displayed}
            {!title.isComplete && <TypingCursor />}
          </span>
        </h1>

        <p className="text-lg md:text-2xl text-slate-600 dark:text-slate-400 mb-12 max-w-3xl mx-auto leading-relaxed font-medium min-h-[3.5rem]">
          {subtitle.displayed}
          {!subtitle.isComplete && <TypingCursor />}
        </p>

        <div className={`flex flex-col sm:flex-row gap-4 justify-center items-center transition-opacity duration-700 ${subtitle.isComplete ? 'opacity-100' : 'opacity-0'}`}>
          {isAuthenticated ? (
            <Link href="/courses" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="h-16 px-10 text-lg font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-xl shadow-indigo-500/30 transition-all hover:scale-105 active:scale-95 w-full flex items-center gap-3"
              >
                Продолжить обучение
                <ArrowRight className="w-6 h-6" />
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/courses" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="h-16 px-10 text-lg font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-xl shadow-indigo-500/30 transition-all hover:scale-105 active:scale-95 w-full flex items-center gap-3"
                >
                  Начать обучение
                  <ArrowRight className="w-6 h-6" />
                </Button>
              </Link>
              <Link href="/login" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-16 px-10 text-lg font-bold border-2 border-slate-200 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-500/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-2xl shadow-sm transition-all hover:scale-105 active:scale-95 w-full"
                >
                  Войти
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
