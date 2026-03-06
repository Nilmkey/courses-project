import Header from "./components/header";
import Footer from "./components/footer";
import Hero from "./components/hero";
import Stats from "./components/stats";
import Features from "./components/features";
import End from "./components/end";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-[#f8faff] dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Header />
      <main className="flex-1">
        <Hero />
        <Stats />
        <Features />
        <End />
      </main>
      <Footer />
    </div>
  );
}
