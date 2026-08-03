import React, { useState } from "react";
import { useApp } from "../context/AppContext";

export const Help: React.FC = () => {
  const { t, lang, dynamicPages } = useApp();
  const [bugType, setBugType] = useState("Bug");
  const [desc, setDesc] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const helpData = dynamicPages?.['help']?.[lang] || {};

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (desc.trim()) {
      setSubmitted(true);
      setDesc("");
      setTimeout(() => {
        setSubmitted(false);
      }, 3000);
    }
  };

  const getAboutText1 = () => {
    if (lang === "ru") {
      return "CloudCare Kids — это современная система управления и видеонаблюдения для детских садов. С помощью приложения родители следят за ежедневным развитием, питанием и занятиями своих детей.";
    }
    if (lang === "en") {
      return "CloudCare Kids is a modern kindergarten management and live monitoring system. Through the app, parents follow their children's daily development, meals, and lessons.";
    }
    return "CloudCare Kids — bu bolalar bog'chasining zamonaviy boshqaruv va videokuzatuv tizimidir. Ota-onalar ilova orqali bolalarining kunlik rivojlanishini, ovqatlanishini va darslarini kuzatib boradilar.";
  };

  const getAboutText2 = () => {
    if (lang === "ru") {
      return "Если возникнут проблемы, вы можете обратиться к администрации детского сада или отправить сообщение в нашу техническую группу с помощью формы ниже.";
    }
    if (lang === "en") {
      return "If problems occur, you can contact the kindergarten administration or send a message directly to our technical team using the form below.";
    }
    return "Muammolar yuzaga kelsa, bog'cha ma'muriyatiga murojaat qilishingiz yoki quyidagi shakl orqali to'g'ridan-to'g'ri texnik guruhimizga xabar yuborishingiz mumkin.";
  };

  const aboutText1 = helpData.about_text1 || getAboutText1();
  const aboutText2 = helpData.about_text2 || getAboutText2();
  
  const faqList = helpData.faq || [
    { q: t("help.faq1.q"), a: t("help.faq1.a") },
    { q: t("help.faq2.q"), a: t("help.faq2.a") },
    { q: t("help.faq3.q"), a: t("help.faq3.a") }
  ];

  return (
    <div className="w-full px-4 py-6 flex-1 flex flex-col gap-6 animate-fade-in">
      <section className="text-left">
        <h2 className="font-quicksand font-bold text-2xl text-primary dark:text-[#89ceff] transition-colors">
          {t("pub.help")}
        </h2>
        <p className="font-inter text-xs text-on-surface-variant dark:text-gray-400 mt-1">
          {t("help.subtitle")}
        </p>
      </section>

      {/* System FAQ / Help info */}
      <section className="glass-panel p-5 rounded-3xl text-left border border-white/20 shadow-sm flex flex-col gap-3 font-inter text-xs text-on-surface-variant dark:text-gray-300">
        <h3 className="font-quicksand font-bold text-sm text-primary dark:text-[#89ceff] border-b border-primary/10 pb-1.5 flex items-center gap-1.5">
          <span className="material-symbols-outlined text-base">info</span>
          {lang === "ru" ? "О системе" : lang === "en" ? "About system" : "Tizim haqida"}
        </h3>
        <p className="leading-relaxed">
          <strong>CloudCare Kids</strong> — {aboutText1}
        </p>
        <p className="leading-relaxed mt-1">
          {aboutText2}
        </p>
      </section>

      {/* FAQ Section */}
      <section className="glass-panel p-5 rounded-3xl text-left border border-white/20 shadow-sm flex flex-col gap-3">
        <h3 className="font-quicksand font-bold text-sm text-cyan-600 dark:text-cyan-400 border-b border-primary/10 pb-1.5 flex items-center gap-1.5">
          <span className="material-symbols-outlined text-base">quiz</span>
          {helpData.faq_title || t("help.faq.title")}
        </h3>
        <div className="flex flex-col gap-3 font-inter text-xs text-on-surface-variant dark:text-gray-300">
          {faqList.map((item: any, idx: number) => (
            <div key={idx} className="flex flex-col gap-1 border-b border-gray-100 dark:border-gray-800 last:border-b-0 pb-2 last:pb-0">
              <h4 className="font-quicksand font-bold text-[13px] text-primary dark:text-[#89ceff]">
                ❓ {item.q}
              </h4>
              <p className="leading-relaxed text-[11px] text-slate-500 dark:text-gray-400 pl-4">
                {item.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Feedback/Bug Report Form */}
      <section className="glass-panel p-5 rounded-3xl text-left border border-white/20 shadow-sm">
        <h3 className="font-quicksand font-bold text-sm text-cyan-600 dark:text-cyan-400 mb-3 border-b border-primary/10 pb-1.5">
          {t("help.report.title")}
        </h3>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <div className="flex flex-col gap-1">
            <label className="font-quicksand font-bold text-xs text-on-surface dark:text-white">
              {t("help.report.type")}
            </label>
            <select
              value={bugType}
              onChange={(e) => setBugType(e.target.value)}
              className="px-4 py-2.5 border rounded-[16px] text-xs bg-white dark:bg-[#1e293b] border-gray-300 dark:border-gray-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="Bug">{lang === "ru" ? "Ошибка в системе (Bug)" : lang === "en" ? "System Error (Bug)" : "Tizimdagi xatolik (Bug)"}</option>
              <option value="Suggestion">{lang === "ru" ? "Предложение или отзыв" : lang === "en" ? "Suggestion or feedback" : "Taklif yoki mulohaza"}</option>
              <option value="Other">{lang === "ru" ? "Другие вопросы" : lang === "en" ? "Other matters" : "Boshqa masalalar"}</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-quicksand font-bold text-xs text-on-surface dark:text-white">
              {t("help.report.desc")} *
            </label>
            <textarea
              placeholder={lang === "ru" ? "Подробно опишите ошибку..." : lang === "en" ? "Please describe the issue in detail..." : "Xatolik yoki kamchilikni batafsil yozing..."}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="p-4 border rounded-[16px] text-xs bg-white dark:bg-[#1e293b] border-gray-300 dark:border-gray-700 text-slate-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 h-24 resize-none"
              required
            />
          </div>

          {submitted && (
            <div className="p-2.5 rounded-xl text-[10px] font-bold text-center bg-green-500/15 text-green-600 dark:text-green-400">
              {t("help.report.success")}
            </div>
          )}

          <button
            type="submit"
            className="w-full h-11 bg-cyan-500 hover:bg-cyan-400 text-white font-quicksand font-bold text-xs rounded-xl shadow-md border-b-4 border-cyan-700 active:scale-95 active:border-b-0 active:translate-y-[4px] transition-all flex items-center justify-center gap-1.5"
          >
            {t("help.report.submit")}
          </button>
        </form>
      </section>
    </div>
  );
};
