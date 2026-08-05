import React from "react";
import { useApp } from "../context/AppContext";
import { ImageWithFallback } from "../components/ImageWithFallback";

export const Life: React.FC = () => {
  const { t, dynamicPages, draftPages, lang } = useApp();

  const lifeData = draftPages?.['life']?.[lang] || dynamicPages?.['life']?.[lang] || {};

  const titleText = lifeData.title !== undefined ? lifeData.title : t("life.title");
  const subtitleText = lifeData.subtitle !== undefined ? lifeData.subtitle : t("life.subtitle");

  const announcements = Array.isArray(lifeData.announcements) && lifeData.announcements.length > 0
    ? lifeData.announcements
    : [
        { date: t("life.ann1.date"), text: t("life.ann1.text") },
        { date: t("life.ann2.date"), text: t("life.ann2.text") },
      ];

  const activities = Array.isArray(lifeData.activities) && lifeData.activities.length > 0
    ? lifeData.activities
    : [
        {
          title: t("life.act1.title"),
          desc: t("life.act1.desc"),
          image: "/images/act1.jpg",
        },
        {
          title: t("life.act2.title"),
          desc: t("life.act2.desc"),
          image: "/images/act2.jpg",
        },
        {
          title: t("life.act3.title"),
          desc: t("life.act3.desc"),
          image: "/images/act3.jpg",
        },
      ];

  const routine = Array.isArray(lifeData.routine) ? lifeData.routine : [
    { time: "08:00 - 08:30", title: "Bolalarni kutib olish va badantarbiya" },
    { time: "08:30 - 09:00", title: "Nonushta va suhbat" },
    { time: "09:00 - 10:30", title: "Rivojlantiruvchi va ta'limiy mashg'ulotlar" },
    { time: "10:30 - 12:00", title: "Ochiq havoda sayr va o'yinlar" },
    { time: "12:00 - 12:30", title: "Tushlik" },
    { time: "13:00 - 15:00", title: "Kunlik shirin uyqu" }
  ];

  return (
    <div className="w-full px-4 py-6 flex-1 flex flex-col gap-6 animate-fade-in text-left">
      <section className="text-left">
        <h2 className="font-quicksand font-bold text-2xl text-primary dark:text-[#89ceff] transition-colors">
          {titleText}
        </h2>
        <p className="font-inter text-xs text-on-surface-variant dark:text-gray-400 mt-1">
          {subtitleText}
        </p>
      </section>

      {/* Announcements */}
      {announcements.length > 0 && (
        <section className="glass-panel p-4 rounded-3xl text-left border border-white/20 shadow-sm">
          <h3 className="font-quicksand font-bold text-sm text-cyan-600 dark:text-cyan-400 mb-2.5 border-b border-primary/10 pb-1 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-base">notifications_active</span>
            {t("life.alert.title")}
          </h3>
          <div className="flex flex-col gap-2.5 text-xs font-inter text-on-surface-variant dark:text-gray-300">
            {announcements.map((ann: any, idx: number) => (
              <div key={idx} className="flex gap-2.5 items-start">
                <span className="bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 px-2 py-0.5 rounded-lg text-[9px] font-bold whitespace-nowrap">
                  {ann.date}
                </span>
                <p className="leading-relaxed flex-1">{ann.text}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Daily Routine Section */}
      {routine.length > 0 && (
        <section className="glass-panel p-4 rounded-3xl text-left border border-white/20 shadow-sm flex flex-col gap-3">
          <h3 className="font-quicksand font-bold text-sm text-amber-600 dark:text-amber-400 border-b border-primary/10 pb-1 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-base">schedule</span>
            Kun Tartibi (Daily Schedule)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-inter">
            {routine.map((item: any, idx: number) => (
              <div key={idx} className="bg-white/40 dark:bg-slate-900/50 p-2.5 rounded-xl border border-white/30 dark:border-white/5 flex items-center gap-2.5">
                <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-mono font-bold px-2 py-1 rounded-lg flex-shrink-0">
                  {item.time}
                </span>
                <span className="text-on-surface dark:text-gray-200 font-medium text-xs">
                  {item.title}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Interactive Activities List */}
      <section className="flex flex-col gap-5">
        <h3 className="font-quicksand font-bold text-base text-primary dark:text-[#89ceff] text-left border-b border-primary/10 pb-1">
          {t("life.act.title")}
        </h3>
        {activities.map((act: any, idx: number) => (
          <div
            key={idx}
            className="glass-panel rounded-2xl overflow-hidden shadow-sm flex flex-col border border-white/20 dark:border-white/5"
          >
            {act.image && (
              <div className="h-44 w-full overflow-hidden">
                <ImageWithFallback
                  src={act.image}
                  alt={act.title}
                  icon="sports_esports"
                  className="w-full h-full"
                />
              </div>
            )}
            <div className="p-4 text-left flex flex-col gap-1">
              <h4 className="font-quicksand font-bold text-sm text-primary dark:text-[#89ceff]">
                {act.title}
              </h4>
              <p className="font-inter text-xs text-on-surface-variant dark:text-gray-300 leading-relaxed">
                {act.desc}
              </p>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};
