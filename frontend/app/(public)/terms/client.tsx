"use client";

import HeaderNoCourses from "@/components/ui/header-no-courses";
import Footer from "@/components/ui/footer";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  Shield,
  AlertCircle,
  Mail,
  Scale,
  Clock,
  CheckCircle2,
} from "lucide-react";

const sections = [
  {
    icon: FileText,
    title: "1. Общие положения",
    content: [
      "Настоящие Условия использования регулируют отношения между образовательной платформой CodeLearn (далее — «Платформа») и пользователями (далее — «Пользователь»).",
      "Платформа предоставляет доступ к образовательным курсам, учебным материалам и сопутствующим сервисам через интернет.",
      "Использование Платформы означает полное согласие Пользователя с настоящими Условиями. Если вы не согласны с какими-либо пунктами, пожалуйста, воздержитесь от использования сервисов.",
      "Администрация Платформы оставляет за собой право вносить изменения в настоящие Условия без предварительного уведомления. Обновлённая версия вступает в силу с момента публикации на сайте.",
    ],
  },
  {
    icon: Shield,
    title: "2. Регистрация и учётная запись",
    content: [
      "Для получения доступа к курсам Пользователь обязан пройти процедуру регистрации, предоставив достоверные и актуальные данные.",
      "Пользователь несёт ответственность за сохранность своих учётных данных (логина и пароля).",
      "Запрещается передавать учётные данные третьим лицам. Все действия, выполненные с использованием учётной записи Пользователя, считаются совершёнными самим Пользователем.",
      "Администрация вправе заблокировать учётную запись при подозрении на несанкционированный доступ или нарушение настоящих Условий.",
    ],
  },
  {
    icon: AlertCircle,
    title: "3. Правила использования",
    content: [
      "Пользователь обязуется использовать материалы Платформы исключительно в личных образовательных целях.",
      "Запрещается: копировать, распространять, модифицировать, продавать или иным образом использовать контент Платформы в коммерческих целях без письменного разрешения Администрации.",
      "Запрещается использовать Платформу для распространения вредоносного программного обеспечения, спама или материалов, нарушающих законодательство.",
      "Пользователь обязуется не нарушать нормальную работу Платформы, не создавать помехи другим пользователям и не предпринимать действий, направленных на получение несанкционированного доступа к данным.",
    ],
  },
  {
    icon: Scale,
    title: "4. Интеллектуальная собственность",
    content: [
      "Все материалы, размещённые на Платформе (тексты, видео, изображения, программный код, графические элементы, дизайн), являются объектами авторского права и защищены законодательством.",
      "Контент принадлежит CodeLearn и/или его партнёрам. Любое использование возможно только в рамках личного обучения.",
      "Получение сертификата не передаёт Пользователю исключительных прав на материалы курса.",
      "При обнаружении фактов незаконного использования контента Администрация вправе применить санкции, включая блокировку аккаунта и обращение в судебные органы.",
    ],
  },
  {
    icon: Clock,
    title: "5. Доступ к курсам и сертификаты",
    content: [
      "После оплаты курса Пользователь получает доступ к учебным материалам на срок, указанный на странице конкретного курса.",
      "По завершении курса и выполнении всех условий (прохождение уроков, тестов, проектов) Пользователю выдаётся электронный сертификат.",
      "Сертификат подтверждает факт прохождения курса и не является документом об образовании государственного образца.",
      "Администрация не гарантирует бессрочный доступ к материалам. Срок действия доступа зависит от тарифа и условий конкретного курса.",
    ],
  },
  {
    icon: CheckCircle2,
    title: "6. Оплата и возврат",
    content: [
      "Оплата курсов производится в порядке, указанном на сайте Платформы. Доступные способы оплаты отображаются при оформлении покупки.",
      "Пользователь вправе запросить возврат средств в течение 14 дней с момента оплаты, если не использовал более 20% материалов курса.",
      "Возврат невозможен, если курс уже пройден более чем на 20%, а также в случае нарушения Пользователем настоящих Условий.",
      "Для оформления возврата необходимо направить заявку на электронную почту, указанную в разделе контактов.",
    ],
  },
  {
    icon: Mail,
    title: "7. Ответственность и ограничения",
    content: [
      "Платформа предоставляется «как есть» (as is). Администрация не гарантирует бесперебойную работу сервиса и отсутствие технических ошибок.",
      "CodeLearn не несёт ответственности за убытки, понесенные Пользователем в связи с использованием или невозможностью использования Платформы.",
      "Администрация не гарантирует получение Пользователем определённых знаний или навыков — результат зависит от индивидуальных усилий учащегося.",
      "Платформа не отвечает за содержание сторонних ресурсов, ссылки на которые могут размещаться в учебных материалах.",
    ],
  },
  {
    icon: Mail,
    title: "8. Персональные данные",
    content: [
      "Обработка персональных данных Пользователя осуществляется в соответствии с Политикой конфиденциальности CodeLearn.",
      "Регистрируясь на Платформе, Пользователь даёт согласие на сбор, хранение и обработку своих персональных данных.",
      "Платформа обязуется не передавать персональные данные третьим лицам, за исключением случаев, предусмотренных законодательством.",
      "Пользователь вправе запросить удаление своих персональных данных, направив соответствующий запрос на электронную почту Администрации.",
    ],
  },
];

export default function TermsClient() {
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
            <FileText className="w-4 h-4" />
            Юридическая информация
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight mb-6">
            Условия{" "}
            <span className="bg-gradient-to-r from-indigo-500 to-blue-600 bg-clip-text text-transparent">
              использования
            </span>
          </h1>

          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
            Ознакомьтесь с правилами пользования платформой CodeLearn. Эти
            документы определяют ваши права и обязанности как пользователя.
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
              <h3 className="text-3xl font-black mb-4">Остались вопросы?</h3>
              <p className="text-indigo-100 text-lg mb-8 max-w-xl">
                Если у вас есть вопросы по условиям использования или нужна
                дополнительная информация, свяжитесь с нашей командой поддержки.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="mailto:support@codelearn.ru"
                  className="inline-flex items-center gap-2 bg-white text-indigo-600 px-6 py-3 rounded-2xl font-bold hover:bg-indigo-50 transition-colors active:scale-95"
                >
                  <Mail className="w-5 h-5" />
                  support@codelearn.ru
                </Link>

                <Link
                  href="/privacy"
                  className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md text-white px-6 py-3 rounded-2xl font-bold hover:bg-white/30 transition-colors active:scale-95"
                >
                  <Shield className="w-5 h-5" />
                  Политика конфиденциальности
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
