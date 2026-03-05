'use client'

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { ExtendedUser } from "@/backend/auth";

export default function Hero() {
  const { data: session } = authClient.useSession();
  const user = session?.user as unknown as ExtendedUser | undefined;

  return (
    <section className="relative pt-20 pb-32 overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-200/40 dark:bg-blue-900/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-200/30 dark:bg-indigo-900/20 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-sm font-bold mb-8 shadow-sm">
          <span>Платформа №1 для будущих разработчиков</span>
        </div>

        <h2 className="text-4xl md:text-7xl font-black text-slate-900 dark:text-white mb-8 tracking-tight leading-[1.1]">
          Построй свой путь в IT <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600">
            на реальной практике
          </span>
        </h2>

        <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
          {user ? (
            <>
              Рады видеть тебя снова,{" "}
              <span className="font-bold text-slate-900 dark:text-white">
                {user.name}!
              </span>
            </>
          ) : (
            "CodeLearn — это современная экосистема обучения. Мы учим создавать реальные продукты через практику в браузере."
          )}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href={user ? `/courses` : `/login`} className="w-full sm:w-auto">
            <Button
              size="lg"
              className="h-16 px-10 text-lg font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-xl shadow-blue-500/30 transition-all hover:-translate-y-1 active:translate-y-0 w-full"
            >
              {user ? "Продолжить обучение" : "Начать обучение бесплатно"}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
