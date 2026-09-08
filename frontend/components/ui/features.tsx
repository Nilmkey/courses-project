import { Code, Flame, Trophy, Users, BookOpen, Play } from "lucide-react";

export default function Features() {
  const features = [
    {
      icon: <Code className="w-8 h-8" />,
      title: "Актуальный стек",
      description:
        "Изучай только то, что реально требуют работодатели. Никакой воды и устаревших библиотек",
      color: "from-blue-500 to-cyan-500",
      shadow: "shadow-blue-500/20",
    },
    {
      icon: <Play className="w-8 h-8" />,
      title: "Реальные задачи",
      description:
        "Минимум теории, максимум кода. К концу обучения у тебя будет готовое портфолио из крутых проектов",
      color: "from-indigo-500 to-blue-600",
      shadow: "shadow-indigo-500/20",
    },
    {
      icon: <Trophy className="w-8 h-8" />,
      title: "Геймификация",
      description:
        "Следите за своим прогрессом, получайте достижения и бейджи за каждый пройденный курс",
      color: "from-purple-500 to-pink-500",
      shadow: "shadow-purple-500/20",
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "Каталог курсов",
      description:
        "Широкий выбор направлений: от основ веб-разработки до нейросетей на любой вкус",
      color: "from-rose-400 to-orange-500",
      shadow: "shadow-rose-500/20",
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Доступность",
      description:
        "Качественное IT-образование доступно сразу после регистрации, учись в своем темпе",
      color: "from-emerald-400 to-teal-500",
      shadow: "shadow-emerald-500/20",
    },
    {
      icon: <Flame className="w-8 h-8" />,
      title: "Сообщество",
      description:
        "Тысячи довольных учеников уже изменили свою жизнь вместе с нами, присоединяйся",
      color: "from-amber-400 to-orange-500",
      shadow: "shadow-amber-500/20",
    },
  ];

  return (
    <section className="relative container mx-auto px-4 py-16 sm:py-24 md:py-32">
      <div className="text-center mb-12 sm:mb-16 md:mb-24 relative z-10">
        <h3 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 sm:mb-6 tracking-tight">
          Почему выбирают <span className="text-indigo-600 dark:text-indigo-400">нас?</span>
        </h3>
        <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 font-medium max-w-2xl mx-auto">
          Мы создали идеальные условия для твоего старта в разработке. Забудь про скучные лекции.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 relative z-10">
        {features.map((feature, index) => (
          <div
            key={index}
            className="group relative p-6 sm:p-8 bg-white dark:bg-slate-900 rounded-[2rem] sm:rounded-[2.5rem] border border-slate-200/50 dark:border-slate-800/50 shadow-xl shadow-slate-200/20 dark:shadow-none hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br opacity-5 dark:opacity-[0.03] group-hover:opacity-10 group-hover:scale-150 transition-all duration-700 blur-3xl rounded-full translate-x-1/3 -translate-y-1/3" />

            <div
              className={`w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center text-white mb-6 sm:mb-8 shadow-lg ${feature.shadow} group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 ring-4 ring-white dark:ring-slate-900`}
            >
              {feature.icon}
            </div>

            <h4 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white mb-3 sm:mb-4 tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {feature.title}
            </h4>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              {feature.description}
            </p>

            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${feature.color}" />
          </div>
        ))}
      </div>
    </section>
  );
}
