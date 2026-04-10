'use client'

import React from "react";
import { useRouter } from "next/navigation";
import { Code } from "lucide-react";

export default function Page() {
  const router = useRouter();
  return (
    <div>
      <header className="sticky top-0 z-50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-blue-100/50 dark:border-slate-800">
        <div className="container mx-auto px-4 h-20 flex justify-between items-center">
          <div
            className="flex items-center gap-3 group cursor-pointer"
            onClick={() => router.push("/")}
          > 
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
              <Code className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-black tracking-tight uppercase dark:text-white">
              CodeLearn
            </span>
          </div>
        </div>
      </header>
    </div>
  );
}
