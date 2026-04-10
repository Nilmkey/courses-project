import { Code } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-12 mt-auto z-10 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-6 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-[10px]">
        <div className="flex items-center gap-3 hover:scale-105 transition-transform cursor-pointer">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Code size={16} />
          </div>
          <span className="text-base font-black text-slate-900 dark:text-white tracking-tight">
            CodeLearn
          </span>
        </div>
        <p className="text-center sm:text-left">© {new Date().getFullYear()} CodeLearn. Все права защищены.</p>
        <div className="flex gap-6 text-slate-400 font-bold text-xs">
          <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            Политика
          </a>
          <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            Условия
          </a>
        </div>
      </div>
    </footer>
  );
}
