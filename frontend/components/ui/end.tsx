"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { authClient } from "@/frontend/lib/auth-client";
import { Sparkles, ArrowRight } from "lucide-react";

export default function End() {
  const { data: session } = authClient.useSession();

  if (session) return null;

  return (
    <section className="container mx-auto px-4 py-24 object-center relative z-10">
      <div className="relative bg-gradient-to-br from-indigo-600 via-blue-600 to-indigo-800 rounded-[3rem] p-12 md:p-24 overflow-hidden shadow-2xl shadow-indigo-500/30">
        <div className="absolute top-0 right-0 w-full h-full pointer-events-none">
          <div className="absolute -top-1/2 -right-1/4 w-[40rem] h-[40rem] bg-pink-500/30 rounded-full blur-[100px] mix-blend-screen" />
          <div className="absolute -bottom-1/2 -left-1/4 w-[40rem] h-[40rem] bg-blue-400/30 rounded-full blur-[100px] mix-blend-screen" />
          <div
            className="absolute inset-0 opacity-[0.1]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='1.5'/%3E%3Ccircle cx='13' cy='13' r='1.5'/%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <div className="relative z-10 max-w-3xl text-center mx-auto text-white flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-bold mb-8">
            <Sparkles className="w-4 h-4 text-pink-300" />
            <span>Твой старт в IT-карьере</span>
          </div>

          <h3 className="text-4xl md:text-6xl font-black mb-8 leading-tight tracking-tight">
            Готов написать свой <br className="hidden md:block" /> первый{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-blue-300">
              Hello World
            </span>
            ?
          </h3>

          <p className="text-lg md:text-2xl text-blue-100/90 mb-12 font-medium leading-relaxed">
            Присоединяйся к нашему комьюнити. Начни учиться сегодня, чтобы
            завтра оффер нашел тебя сам.
          </p>

          <Link href="/login" className="w-full sm:w-auto">
            <Button
              size="lg"
              className="bg-white text-indigo-600 hover:bg-slate-50 font-black text-lg px-10 h-16 rounded-2xl shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.5)] transition-all active:scale-95 w-full sm:w-auto flex items-center gap-3 hover:-translate-y-1"
            >
              Зарегистрироваться сейчас
              <ArrowRight className="w-6 h-6" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
