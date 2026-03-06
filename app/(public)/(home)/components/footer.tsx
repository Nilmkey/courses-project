import { Code } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 py-12">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8 text-slate-400 font-bold uppercase tracking-widest text-[10px]">
        <div className="flex items-center gap-2">
          <Code className="w-5 h-5 text-blue-600" />
          <span className="text-lg font-black text-slate-800 dark:text-white tracking-tight">
            CodeLearn
          </span>
        </div>
        <p className="text-center md:text-left">
          © {new Date().getFullYear()} CodeLearn. Все права защищены.
        </p>
        <div className="flex gap-6 text-slate-400 font-bold text-sm">
          <a href="#" className="hover:text-blue-600 transition-colors">
            Политика
          </a>
          <a href="#" className="hover:text-blue-600 transition-colors">
            Условия
          </a>
        </div>
      </div>
    </footer>
  );
}
