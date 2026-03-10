'use client'

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export default function End() {
  const { data: session } = authClient.useSession();

  if (session) return null;

  return (
    <section className="container mx-auto px-4 py-20">
      <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[2.5rem] md:rounded-[3rem] p-10 md:p-20 overflow-hidden shadow-2xl shadow-blue-500/40">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-white/10 skew-x-12 translate-x-1/2" />
        <div className="relative z-10 max-w-2xl text-white">
          <h3 className="text-3xl md:text-5xl font-black mb-6 leading-tight">
            Готов написать свой <br /> первый Hello World?
          </h3>
          <p className="text-lg md:text-xl text-blue-100 mb-10 font-medium leading-relaxed">
            Присоединяйся к нашему комьюнити. Начни учиться сегодня, чтобы
            завтра оффер нашел тебя сам.
          </p>
          <Link href="/login">
            <Button
              size="lg"
              className="bg-white text-blue-600 hover:bg-blue-50 font-black text-lg px-8 md:px-10 h-16 rounded-2xl shadow-xl transition-all active:scale-95 w-full sm:w-auto"
            >
              Зарегистрироваться сейчас
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
