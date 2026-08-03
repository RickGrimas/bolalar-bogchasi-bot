import React, { useState } from "react";
import { useApp } from "../context/AppContext";

const renderIcon = (iconStr: string, sizeClass: string = "text-lg") => {
  if (!iconStr) return <span className={`material-symbols-outlined ${sizeClass}`}>star</span>;
  const isEmoji = /\p{Extended_Pictographic}/u.test(iconStr) || (iconStr.charCodeAt(0) > 255);
  if (isEmoji) {
    return <span className={`${sizeClass} select-none leading-none inline-block`}>{iconStr}</span>;
  }
  return <span className={`material-symbols-outlined ${sizeClass}`}>{iconStr}</span>;
};

export const AboutUs: React.FC = () => {
  const { t, dynamicPages, draftPages, lang } = useApp();
  const [activeSubTab, setActiveSubTab] = useState<"info" | "team">("info");

  const aboutData = draftPages?.['about']?.[lang] || dynamicPages?.['about']?.[lang] || {};

  const titleText = aboutData.title !== undefined ? aboutData.title : t("about.title");
  const subtitleText = aboutData.subtitle !== undefined ? aboutData.subtitle : t("about.subtitle");
  const headerImage = aboutData.header_image || "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=80&w=800&auto=format&fit=crop";

  const stats = Array.isArray(aboutData.stats) && aboutData.stats.length > 0
    ? aboutData.stats
    : [
        { value: "150+", label: "Bolajonlar", icon: "🌿", color: "text-cyan-500" },
        { value: "25+", label: "Malakali Xodimlar", icon: "👨‍🏫", color: "text-amber-500" },
        { value: "10+", label: "Yillik Tajriba", icon: "⭐", color: "text-emerald-500" },
      ];

  const defaultSections = [
    { icon: "🌿", image: "https://images.unsplash.com/photo-1596464716127-f2a82984de30?q=80&w=400&auto=format&fit=crop" },
    { icon: "👨‍🏫", image: "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?q=80&w=400&auto=format&fit=crop" },
    { icon: "🎓", image: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?q=80&w=400&auto=format&fit=crop" },
    { icon: "🏫", image: "https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=400&auto=format&fit=crop" },
    { icon: "📜", image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=400&auto=format&fit=crop" },
    { icon: "💳", image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=400&auto=format&fit=crop" },
    { icon: "⭐", image: "https://images.unsplash.com/photo-1516627145497-ae6968895b74?q=80&w=400&auto=format&fit=crop" },
  ];

  const rawSections = Array.isArray(aboutData.sections) && aboutData.sections.length > 0
    ? aboutData.sections
    : [
        { title: t("about.sec1.title"), desc: t("about.sec1.desc") },
        { title: t("about.sec2.title"), desc: t("about.sec2.desc") },
        { title: t("about.sec3.title"), desc: t("about.sec3.desc") },
        { title: t("about.sec4.title"), desc: t("about.sec4.desc") },
        { title: t("about.sec5.title"), desc: t("about.sec5.desc") },
        { title: t("about.sec6.title"), desc: t("about.sec6.desc") },
        { title: t("about.sec7.title"), desc: t("about.sec7.desc") },
      ];

  const sections = rawSections.map((sec: any, idx: number) => ({
    ...sec,
    icon: sec.icon || defaultSections[idx % defaultSections.length]?.icon || "⭐",
    image: sec.image || defaultSections[idx % defaultSections.length]?.image || "https://images.unsplash.com/photo-1516627145497-ae6968895b74?q=80&w=400&auto=format&fit=crop"
  }));

  const defaultTeam = [
    { image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop", isLeader: true },
    { image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200&auto=format&fit=crop", isLeader: false },
    { image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200&auto=format&fit=crop", isLeader: false },
    { image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop", isLeader: false },
  ];

  const rawTeam = Array.isArray(aboutData.team) && aboutData.team.length > 0
    ? aboutData.team
    : [
        { name: t("about.team.director.name"), role: t("about.team.director.role"), desc: t("about.team.director.desc") },
        { name: t("about.team.member1.name"), role: t("about.team.member1.role"), desc: t("about.team.member1.desc") },
        { name: t("about.team.member2.name"), role: t("about.team.member2.role"), desc: t("about.team.member2.desc") },
        { name: t("about.team.member3.name"), role: t("about.team.member3.role"), desc: t("about.team.member3.desc") },
      ];

  const team = rawTeam.map((mem: any, idx: number) => ({
    ...mem,
    image: mem.image || defaultTeam[idx % defaultTeam.length]?.image || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop",
    isLeader: mem.isLeader !== undefined ? mem.isLeader : (defaultTeam[idx % defaultTeam.length]?.isLeader || false)
  }));

  return (
    <div className="w-full flex-1 flex flex-col pb-20 animate-fade-in text-left">
      {/* Playful Header Section with Background Image - Edge to Edge */}
      <section className="w-full h-52 relative shadow-md border-b border-cyan-400/20">
        <img
          src={headerImage}
          alt="Biz Haqimizda Background"
          className="w-full h-full object-cover"
        />
        {/* Dark overlay to make text stand out */}
        <div className="absolute inset-0 bg-black/55 flex flex-col justify-end p-4 text-left">
          <h2 className="font-quicksand font-bold text-2xl text-white drop-shadow-md mb-1 pt-6">
            {titleText}
          </h2>
          <p className="font-inter text-[11px] text-gray-200/90 leading-relaxed max-w-xs drop-shadow">
            {subtitleText}
          </p>
        </div>
      </section>

      {/* Main Content Area with Padding */}
      <div className="px-4 py-4 flex flex-col gap-5">
        {/* Tab Switching Buttons */}
        <div className="flex gap-2 p-1.5 bg-slate-200/60 dark:bg-slate-800/60 rounded-2xl border border-white/20 dark:border-white/5">
          <button
            onClick={() => setActiveSubTab("info")}
            className={`flex-1 py-2 px-3 rounded-xl font-quicksand font-bold text-xs transition-all duration-300 flex items-center justify-center gap-1.5 ${
              activeSubTab === "info"
                ? "bg-cyan-500 text-white shadow-md border-b-2 border-cyan-700"
                : "text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700/50"
            }`}
          >
            <span className="material-symbols-outlined text-sm">info</span>
            {t("about.tab.info")}
          </button>
          <button
            onClick={() => setActiveSubTab("team")}
            className={`flex-1 py-2 px-3 rounded-xl font-quicksand font-bold text-xs transition-all duration-300 flex items-center justify-center gap-1.5 ${
              activeSubTab === "team"
                ? "bg-cyan-500 text-white shadow-md border-b-2 border-cyan-700"
                : "text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700/50"
            }`}
          >
            <span className="material-symbols-outlined text-sm">diversity_3</span>
            {t("about.team.title")}
          </button>
        </div>

        {/* Tab content 1: General Info */}
        {activeSubTab === "info" && (
          <div className="flex flex-col gap-5 animate-fade-in">
            {/* Statistics Cards */}
            {stats.length > 0 && (
              <section className="grid grid-cols-3 gap-3">
                {stats.map((stat: any, idx: number) => (
                  <div key={idx} className="glass-panel p-3 rounded-2xl flex flex-col items-center text-center border border-white/20 shadow-sm hover:scale-105 transition-all duration-300">
                    <span className={`${stat.color || "text-cyan-500"} mb-1 flex items-center justify-center`}>
                      {renderIcon(stat.icon, "text-xl")}
                    </span>
                    <span className="font-quicksand font-bold text-base text-on-surface dark:text-white">
                      {stat.value}
                    </span>
                    <span className="font-inter text-[9px] text-on-surface-variant dark:text-gray-400 mt-0.5">
                      {stat.label}
                    </span>
                  </div>
                ))}
              </section>
            )}

            {/* Visual content list with corresponding images */}
            <section className="flex flex-col gap-5">
              {sections.map((section: any, idx: number) => {
                const isEven = idx % 2 === 0;
                return (
                  <div
                    key={idx}
                    className={`glass-panel rounded-3xl overflow-hidden shadow-sm border border-white/20 dark:border-white/5 flex flex-col ${
                      isEven ? "sm:flex-row" : "sm:flex-row-reverse"
                    } hover:scale-[1.01] transition-transform duration-300`}
                  >
                    {/* Section Image */}
                    {section.image && (
                      <div className="w-full sm:w-1/3 aspect-[4/3] sm:aspect-auto sm:min-h-[120px] overflow-hidden flex-shrink-0">
                        <img
                          src={section.image}
                          alt={section.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Section Details */}
                    <div className="p-4 flex-1 flex flex-col justify-center text-left">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center flex-shrink-0">
                          {renderIcon(section.icon, "text-lg")}
                        </div>
                        <h4 className="font-quicksand font-bold text-sm text-primary dark:text-[#89ceff]">
                          {section.title}
                        </h4>
                      </div>
                      <p className="font-inter text-xs text-on-surface-variant dark:text-gray-300 leading-relaxed">
                        {section.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </section>
          </div>
        )}

        {/* Tab content 2: Kindergarten Team */}
        {activeSubTab === "team" && (
          <section className="flex flex-col gap-4 animate-fade-in">
            <div className="text-left px-1">
              <p className="font-inter text-xs text-on-surface-variant dark:text-gray-400">
                {t("about.team.subtitle")}
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {team.map((member: any, idx: number) => (
                <div
                  key={idx}
                  className={`glass-panel p-4 rounded-3xl border shadow-sm flex gap-4 text-left transition-all duration-300 ${
                    member.isLeader
                      ? "border-amber-400/40 bg-amber-500/5 dark:bg-amber-500/10 hover:border-amber-400"
                      : "border-white/20 hover:scale-[1.01]"
                  }`}
                >
                  {/* Profile Image (avatar style) */}
                  <div className="relative flex-shrink-0">
                    <div className={`w-16 h-16 rounded-full overflow-hidden border-2 shadow-inner ${
                      member.isLeader ? "border-amber-400" : "border-cyan-400"
                    }`}>
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {member.isLeader && (
                      <span className="absolute -top-1 -right-1 bg-amber-400 text-slate-900 rounded-full w-5 h-5 flex items-center justify-center shadow-md animate-pulse">
                        <span className="material-symbols-outlined text-xs font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>
                          crown
                        </span>
                      </span>
                    )}
                  </div>

                  {/* Bio Details */}
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="flex flex-wrap items-baseline gap-1.5 mb-1">
                      <span className="font-quicksand font-bold text-sm text-primary dark:text-[#89ceff]">
                        {member.name}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider ${
                        member.isLeader
                          ? "bg-amber-400/20 text-amber-600 dark:text-amber-400"
                          : "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400"
                      }`}>
                        {member.role}
                      </span>
                    </div>
                    <p className="font-inter text-xs text-on-surface-variant dark:text-gray-300 leading-normal">
                      {member.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
