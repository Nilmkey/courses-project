export default function Stats() {
  const stats = [
    { number: "6+", label: "Курсов", description: "На любой вкус", color: "text-blue-600 dark:text-blue-400" },
    { number: "100+", label: "Уроков", description: "Без лишней воды", color: "text-indigo-600 dark:text-indigo-400" },
    { number: "1000+", label: "Учеников", description: "Довольны обучением", color: "text-purple-600 dark:text-purple-400" },
  ];

  return (
    <section className="container mx-auto px-4 -mt-6 sm:-mt-10 relative z-20">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="group relative bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border border-white dark:border-slate-800 shadow-2xl shadow-indigo-500/5 dark:shadow-none text-center hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-all duration-500 overflow-hidden hover:-translate-y-1"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-transparent dark:from-indigo-900/10 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <div className={`text-4xl sm:text-5xl md:text-6xl font-black mb-2 sm:mb-3 tracking-tighter group-hover:scale-110 transition-transform duration-500 ${stat.color}`}>
              {stat.number}
            </div>
            <div className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100 mb-1 sm:mb-2 tracking-tight">
              {stat.label}
            </div>
            <div className="text-sm sm:text-base text-slate-500 dark:text-slate-400 font-medium">
              {stat.description}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
