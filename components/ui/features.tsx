import { Code, Flame, Trophy, Users, BookOpen, Play } from "lucide-react";

export default function Features() {
  const features = [
    {
      icon: <Code className="w-8 h-8" />,
      title: "Актуальный стек",
      description:
        "Изучай только то, что реально требуют работодатели в 2026 году. Никакой воды и устаревших библиотек.",
      color: "bg-blue-500",
    },
    {
      icon: <Play className="w-8 h-8" />,
      title: "Работа над реальными задачами",
      description:
        "Минимум теории, максимум кода. К концу обучения у тебя будет готовое портфолио из крутых проектов.",
      color: "bg-indigo-500",
    },
    {
      icon: <Trophy className="w-8 h-8" />,
      title: "Геймификация",
      description:
        "Следите за своим прогрессом, получайте достижения и бейджи за каждый курс",
      color: "bg-cyan-500",
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "Каталог курсов",
      description:
        "Широкий выбор направлений: от веб-разработки до нейросетей на любой вкус",
      color: "bg-violet-500",
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Доступность",
      description:
        "Качественное IT-образование доступно абсолютно бесплатно после регистрации",
      color: "bg-sky-500",
    },
    {
      icon: <Flame className="w-8 h-8" />,
      title: "Сообщество",
      description:
        "Тысячи довольных учеников уже изменили свою жизнь вместе с нами",
      color: "bg-orange-500",
    },
  ];

  return (
    <section className="container mx-auto px-4 py-24 md:py-32">
      <div className="text-center mb-16 md:mb-20">
        <h3 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
          Почему выбирают нас?
        </h3>
        <p className="text-slate-500 dark:text-slate-400 font-medium">
          Мы создали идеальные условия для твоего старта в разработке
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <div
            key={index}
            className="group p-8 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-500/50 hover:shadow-2xl transition-all duration-300"
          >
            <div
              className={`w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 transition-transform duration-500`}
            >
              {feature.icon}
            </div>
            <h4 className="text-xl font-black text-slate-800 dark:text-white mb-3 flex items-center gap-2">
              {feature.title}
            </h4>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
