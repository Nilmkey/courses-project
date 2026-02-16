'use client'

import React, { useState } from "react";
import Link from "next/link";
import {
  Code,
  ChevronRight,
  Layout,
  Server,
  Globe,
  Laptop,
  Users,
  Zap,
  User,
} from "lucide-react";

const CoursesPage = () => {
  const [filter, setFilter] = useState("all");

  const courses = [
    {
      id: "frontend",
      title: "Frontend Разработчик",
      description:
        "Создание современных интерфейсов на React, Next.js и Tailwind CSS с нуля до уровня Pro.",
      difficulty: "Средний",
      target: "Для студентов и начинающих",
      status: "open",
      type: "career",
      icon: <Layout className="w-8 h-8" />,
      gradient: "from-blue-500 to-cyan-400",
    },
    {
      id: "backend",
      title: "Backend Разработчик",
      description:
        "Проектирование архитектуры баз данных, API и серверной логики на Node.js и Python.",
      difficulty: "Сложный",
      target: "Для тех, кто знает основы",
      status: "open",
      type: "career",
      icon: <Server className="w-8 h-8" />,
      gradient: "from-indigo-600 to-purple-500",
    },
    {
      id: "fullstack",
      title: "Fullstack Мастер",
      description:
        "Комплексное обучение: от верстки до развертывания приложений на облачных серверах.",
      difficulty: "Эксперт",
      target: "Для амбициозных новичков",
      status: "closed",
      type: "career",
      icon: <Globe className="w-8 h-8" />,
      gradient: "from-orange-500 to-rose-500",
    },
    {
      id: "python",
      title: "Python для всех",
      description:
        "Самый популярный язык программирования для анализа данных, AI и автоматизации задач.",
      difficulty: "Легкий",
      target: "Для школьников и студентов",
      status: "open",
      type: "language",
      icon: <Laptop className="w-8 h-8" />,
      gradient: "from-emerald-500 to-teal-400",
    },
    {
      id: "javascript",
      title: "JavaScript Intensive",
      description:
        "Глубокое погружение в экосистему JS: асинхронность, замыкания и работа с DOM.",
      difficulty: "Средний",
      target: "Для тех, кто хочет в веб",
      status: "open",
      type: "language",
      icon: <Zap className="w-8 h-8" />,
      gradient: "from-yellow-400 to-orange-400",
    },
    {
      id: "cpp",
      title: "Основы C++",
      description:
        "Изучение алгоритмов, структур данных и основ системного программирования.",
      difficulty: "Сложный",
      target: "Для студентов тех. вузов",
      status: "closed",
      type: "language",
      icon: <Code className="w-8 h-8" />,
      gradient: "from-blue-600 to-indigo-700",
    },
  ];

  const filteredCourses =
    filter === "all" ? courses : courses.filter((c) => c.type === filter);

  return (
    <div className="min-h-screen bg-[#f8faff] text-slate-900 font-sans pb-20">
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 transition-transform hover:scale-105 cursor-pointer"
          >
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              <Code className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-black tracking-tight uppercase">
              CodeLearn
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-500">
            <Link href="/courses" className="text-blue-600">
              Курсы
            </Link>
            <a href="#" className="hover:text-blue-600 transition-colors">
              Практика
            </a>
            <a href="#" className="hover:text-blue-600 transition-colors">
              Сообщество
            </a>
          </div>

          <Link href="/profile">
            <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center cursor-pointer hover:bg-slate-200 transition-colors">
              <User className="w-5 h-5 text-slate-600" />
            </div>
          </Link>
        </div>
      </nav>

      <section className="py-16 px-4 max-w-6xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
          Выбери свой путь в <span className="text-blue-600">IT</span>
        </h1>
        <p className="text-slate-500 font-medium text-lg max-w-2xl mx-auto mb-10">
          Актуальные программы обучения от экспертов индустрии. Начни учиться
          сегодня и построй карьеру мечты.
        </p>

        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {["all", "career", "language"].map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
                filter === t
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-200 scale-105"
                  : "bg-white text-slate-500 border border-slate-200 hover:border-blue-300"
              }`}
            >
              {t === "all"
                ? "Все курсы"
                : t === "career"
                  ? "Профессии"
                  : "Языки"}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="group relative bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 p-8 flex flex-col h-full transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-200/40 overflow-hidden"
            >
              <div className="mb-6 flex justify-between items-center">
                <span
                  className={`px-4 py-1.5 rounded-full text-[10px] uppercase font-black tracking-widest border ${
                    course.difficulty === "Легкий"
                      ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                      : course.difficulty === "Средний"
                        ? "bg-blue-50 text-blue-600 border-blue-100"
                        : "bg-rose-50 text-rose-600 border-rose-100"
                  }`}
                >
                  {course.difficulty}
                </span>
                <div
                  className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${course.gradient} flex items-center justify-center text-white shadow-lg shadow-blue-100 group-hover:rotate-12 transition-transform duration-500`}
                >
                  {course.icon}
                </div>
              </div>

              <div className="flex-grow">
                <h3 className="text-2xl font-black text-slate-800 mb-3 leading-tight group-hover:text-blue-600 transition-colors">
                  {course.title}
                </h3>
                <p className="text-slate-400 font-medium text-sm leading-relaxed mb-6">
                  {course.description}
                </p>
              </div>

              <div className="mt-auto space-y-6">
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                    <Users className="w-4 h-4 text-slate-400" />
                  </div>
                  <span className="text-xs font-bold text-slate-500">
                    {course.target}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full animate-pulse ${course.status === "open" ? "bg-emerald-500" : "bg-slate-300"}`}
                    />
                    <span
                      className={`text-[11px] font-black uppercase tracking-tighter ${course.status === "open" ? "text-emerald-600" : "text-slate-400"}`}
                    >
                      {course.status === "open"
                        ? "Набор открыт"
                        : "Набор закрыт"}
                    </span>
                  </div>

                  <button
                    disabled={course.status === "closed"}
                    className={`flex items-center gap-1 font-bold text-sm transition-all ${
                      course.status === "open"
                        ? "text-blue-600 hover:gap-3 group-hover:mr-2"
                        : "text-slate-300 cursor-not-allowed"
                    }`}
                  >
                    {course.status === "open" ? "Подробнее" : "Ждем старта"}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div
                className={`absolute -right-12 -bottom-12 w-24 h-24 bg-gradient-to-br ${course.gradient} opacity-[0.03] rounded-full blur-2xl group-hover:scale-[3] transition-transform duration-700`}
              />
            </div>
          ))}
        </div>
      </section>

      <footer className="bg-white border-t border-slate-100 py-12">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2">
              <Code className="w-6 h-6 text-blue-600" />
              <span className="text-xl font-black tracking-tight text-slate-800">
                CodeLearn
              </span>
            </div>
            <p className="text-slate-400 font-medium">
              © {new Date().getFullYear()} CodeLearn. Все права защищены.
            </p>
            <div className="flex gap-6 text-slate-400 font-bold text-sm">
              <a href="#" className="hover:text-blue-600 transition-colors">
                Политика
              </a>
              <a href="#" className="hover:text-blue-600 transition-colors">
                Условия
              </a>
              <a href="#" className="hover:text-blue-600 transition-colors">
                Поддержка
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CoursesPage;
