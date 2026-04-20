"use client";

import HeaderNoCourses from "@/components/ui/header-no-courses";
import Footer from "@/components/ui/footer";
import Link from "next/link";
import { ArrowLeft, Shield, Database, Eye, Lock, UserCheck, Mail, Clock, FileText } from "lucide-react";

const sections = [
  {
    icon: Shield,
    title: "1. Общие положения о конфиденциальности",
    content: [
      "Настоящая Политика конфиденциальности (далее — «Политика») определяет порядок обработки и защиты персональных данных пользователей образовательной платформы CodeLearn (далее — «Платформа»).",
      "CodeLearn уважает право на конфиденциальность и стремится обеспечить высокий уровень защиты персональных данных в соответствии с Федеральным законом №152-ФЗ «О персональных данных».",
      "Политика действует в отношении всех персональных данных, которые Платформа может получить от пользователя при использовании сервисов.",
    ],
  },
  {
    icon: Database,
    title: "2. Какие данные мы собираем",
    content: [
      "При регистрации на Платформе мы собираем: имя (или псевдоним), адрес электронной почты, пароль (в хэшированном виде).",
      "При оплате курсов: данные, необходимые для обработки платежей (информация об оплате обрабатывается платёжными системами-партнёрами, и Платформа не хранит данные банковских карт).",
      "Технические данные: IP-адрес, тип браузера, операционная система, дата и время доступа, данные о взаимодействии с платформой (прогресс обучения, время, проведённое на уроках).",
      "Данные, предоставляемые voluntarily: информация в профиле, аватар, отзывы, вопросы к преподавателям.",
    ],
  },
  {
    icon: Eye,
    title: "3. Цели обработки данных",
    content: [
      "Идентификация пользователя для обеспечения доступа к образовательным услугам.",
      "Обработка платежей и подтверждение покупок курсов.",
      "Обеспечение технической поддержки и обратной связи.",
      "Улучшение качества сервисов, анализ использования платформы и разработка новых функций.",
      "Отправка информационных и маркетинговых материалов (только с явного согласия пользователя).",
      "Выдача сертификатов и подтверждений о прохождении курсов.",
    ],
  },
  {
    icon: Lock,
    title: "4. Хранение и защита данных",
    content: [
      "Персональные данные хранятся на защищённых серверах с использованием современных технологий шифрования (SSL/TLS).",
      "Пароли хранятся исключительно в хэшированном виде с применением надёжных алгоритмов.",
      "Доступ к персональным данным имеют только уполномоченные сотрудники Платформы, которым это необходимо для выполнения рабочих обязанностей.",
      "Платформа регулярно проводит аудит безопасности и обновляет защитные механизмы.",
    ],
  },
  {
    icon: UserCheck,
    title: "5. Права пользователя",
    content: [
      "Пользователь имеет право получить информацию о том, какие его персональные данные обрабатываются Платформой.",
      "Пользователь вправе запросить копию своих персональных данных в машиночитаемом формате.",
      "Пользователь может потребовать исправления неточных или неполных данных.",
      "Пользователь вправе потребовать удаления своих персональных данных, за исключением случаев, когда законодательство требует их сохранения.",
      "Пользователь может отозвать согласие на обработку данных, направив запрос на электронную почту Платформы.",
    ],
  },
  {
    icon: Database,
    title: "6. Передача данных третьим лицам",
    content: [
      "CodeLearn не продаёт, не сдаёт в аренду и не передаёт персональные данные третьим лицам для их маркетинговых целей.",
      "Данные могут быть переданы третьим лицам только в случаях: получения согласия пользователя; требований законодательства; запросов правоохранительных органов в установленном порядке.",
      "Платформа использует сторонние сервисы для обработки платежей, хостинга и аналитики. Эти сервисы обязуются соблюдать конфиденциальность и использовать данные только для предоставления услуг.",
    ],
  },
  {
    icon: Clock,
    title: "7. Срок хранения данных",
    content: [
      "Персональные данные хранятся в течение всего срока действия учётной записи пользователя.",
      "После удаления аккаунта данные удаляются в течение 30 дней, за исключением информации, которую законодательство обязывает хранить дольше (например, данные о финансовых транзакциях).",
      "Анонимизированные и агрегированные данные могут храниться бессрочно для аналитических целей.",
    ],
  },
  {
    icon: Mail,
    title: "8. Cookies и технологии отслеживания",
    content: [
      "Платформа использует cookies для обеспечения работоспособности сервисов, аутентификации и анализа использования.",
      "Пользователь может управлять настройками cookies в своём браузере, однако отключение cookies может повлиять на функциональность.",
      "Платформа может использовать сторонние аналитические инструменты (например, Google Analytics) для сбора обезличенной статистики посещений.",
    ],
  },
  {
    icon: FileText,
    title: "9. Изменения в Политике",
    content: [
      "CodeLearn оставляет за собой право вносить изменения в настоящую Политику. При существенных изменениях пользователи будут уведомлены через электронную почту или уведомление на сайте.",
      "Продолжение использования Платформы после внесения изменений означает согласие с обновлённой Политикой.",
      "Рекомендуем периодически ознакомиться с текущей версией Политики.",
    ],
  },
];

export default function PrivacyClient() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-300">
      <HeaderNoCourses />

      <section className="relative pt-32 pb-16 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-blue-500/5 dark:from-indigo-500/10 dark:to-blue-500/10" />
        <div className="max-w-4xl mx-auto relative">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Вернуться на главную
          </Link>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-black uppercase tracking-widest text-xs mb-6">
            <Shield className="w-4 h-4" />
            Конфиденциальность
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight mb-6">
            Политика{" "}
            <span className="bg-gradient-to-r from-indigo-500 to-blue-600 bg-clip-text text-transparent">
              конфиденциальности
            </span>
          </h1>

          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
            Мы серьёзно относимся к защите ваших персональных данных. В этом
            документе описано, какие данные мы собираем и как их используем.
          </p>

          <div className="mt-6 flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              Обновлено: 14 апреля 2026
            </span>
          </div>
        </div>
      </section>

      <section className="flex-grow px-4 pb-20">
        <div className="max-w-4xl mx-auto space-y-8">
          {sections.map((section, idx) => {
            const Icon = section.icon;
            return (
              <div
                key={idx}
                className="group bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 p-8 hover:shadow-2xl hover:shadow-indigo-500/5 dark:hover:shadow-indigo-500/10 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {section.title}
                  </h2>
                </div>

                <div className="space-y-4">
                  {section.content.map((paragraph, pIdx) => (
                    <p
                      key={pIdx}
                      className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="px-4 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-500 to-blue-600 p-10 md:p-14 text-white shadow-2xl shadow-indigo-500/20">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10">
              <h3 className="text-3xl font-black mb-4">
                Вопросы по конфиденциальности?
              </h3>
              <p className="text-indigo-100 text-lg mb-8 max-w-xl">
                Если у вас есть вопросы по обработке персональных данных или
                хотите воспользоваться своими правами, свяжитесь с нами.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="mailto:privacy@codelearn.ru"
                  className="inline-flex items-center gap-2 bg-white text-indigo-600 px-6 py-3 rounded-2xl font-bold hover:bg-indigo-50 transition-colors active:scale-95"
                >
                  <Mail className="w-5 h-5" />
                  privacy@codelearn.ru
                </Link>

                <Link
                  href="/terms"
                  className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md text-white px-6 py-3 rounded-2xl font-bold hover:bg-white/30 transition-colors active:scale-95"
                >
                  <FileText className="w-5 h-5" />
                  Условия использования
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
