export default function Stats() {
  const stats = [
    { number: "6+", label: "Курсов", description: "На любой вкус" },
    { number: "100+", label: "Уроков", description: "Без лишней воды" },
    { number: "1000+", label: "Учеников", description: "Довольны обучением" },
  ];

  return (
    <section className="container mx-auto px-4 -mt-16 relative z-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-8 rounded-[2.5rem] border border-white dark:border-slate-800 shadow-xl text-center group hover:border-blue-200 transition-colors"
          >
            <div className="text-5xl font-black text-blue-600 mb-2 tracking-tighter group-hover:scale-110 transition-transform">
              {stat.number}
            </div>
            <div className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-1">
              {stat.label}
            </div>
            <div className="text-slate-500 dark:text-slate-400 text-sm font-medium">
              {stat.description}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
