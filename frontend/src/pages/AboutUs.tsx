import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { ImageWithFallback } from "../components/ImageWithFallback";

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
  const headerImage = aboutData.header_image || "/images/about_header.jpg";

  const stats = Array.isArray(aboutData.stats) && aboutData.stats.length > 0
    ? aboutData.stats
    : [
        { value: "150+", label: "Bolajonlar", icon: "🌿", color: "text-cyan-500" },
        { value: "25+", label: "Malakali Xodimlar", icon: "👨‍🏫", color: "text-amber-500" },
        { value: "10+", label: "Yillik Tajriba", icon: "⭐", color: "text-emerald-500" },
      ];

  const defaultSections = [
    { icon: "🌿", image: "/images/slide1.jpg" },
    { icon: "👨‍🏫", image: "/images/slide2.jpg" },
    { icon: "🎓", image: "/images/slide3.jpg" },
    { icon: "🏫", image: "/images/slide4.jpg" },
    { icon: "📜", image: "/images/goal.jpg" },
    { icon: "💳", image: "/images/info.jpg" },
    { icon: "⭐", image: "/images/news1.jpg" },
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
    image: sec.image || defaultSections[idx % defaultSections.length]?.image || "/images/slide1.jpg"
  }));

  const defaultTeam = [
    { image: "/images/team1.jpg", isLeader: true },
    { image: "/images/team1.jpg", isLeader: false },
    { image: "/images/team1.jpg", isLeader: false },
    { image: "/images/team1.jpg", isLeader: false },
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
    image: mem.image || defaultTeam[idx % defaultTeam.length]?.image || "/images/team1.jpg",
    isLeader: mem.isLeader !== undefined ? mem.isLeader : (defaultTeam[idx % defaultTeam.length]?.isLeader || false)
  }));

  return (
    <div className="w-full flex-1 flex flex-col pb-20 animate-fade-in text-left">
      {/* Playful Header Section with Background Image - Edge to Edge */}
      <section className="w-full h-52 relative shadow-md border-b border-cyan-400/20 overflow-hidden">
        <ImageWithFallback
          src={headerImage}
          alt="Biz Haqimizda Background"
          icon="diversity_3"
          className="w-full h-full"
        />
        {/* Dark overlay to make text stand out */}
        <div className="absolute inset-0 bg-black/55 flex flex-col justify-end p-4 text-left z-10 pointer-events-none">
          <h2 className="font-quicksand font-bold text-2xl text-white drop-shadow-md mb-1 pt-6">
            {titleText}
          </h2>
          <p className="font-inter text-[11px] text-gray-200/90 leading-relaxed max-w-xs drop-shadow">
            {subtitleText}
          </p>
        </div>
      </section>

      {/* Main Content Area with padding */}
      <div className="p-4 flex flex-col gap-6">
        {/* Navigation Sub-Tabs */}
        <div className="flex border-b border-gray-200 dark:border-slate-800">
          <button
            onClick={() => setActiveSubTab("info")}
            className={`pb-2.5 px-4 font-quicksand font-bold text-xs border-b-2 transition-all flex items-center gap-1.5 ${
              activeSubTab === "info"
                ? "border-cyan-500 text-cyan-600 dark:text-cyan-400"
                : "border-transparent text-gray-400 hover:text-slate-600 dark:hover:text-gray-200"
            }`}
          >
            <span className="material-symbols-outlined text-sm">info</span>
            {t("about.tab.info")}
          </button>
          <button
            onClick={() => setActiveSubTab("team")}
            className={`pb-2.5 px-4 font-quicksand font-bold text-xs border-b-2 transition-all flex items-center gap-1.5 ${
              activeSubTab === "team"
                ? "border-cyan-500 text-cyan-600 dark:text-cyan-400"
                : "border-transparent text-gray-400 hover:text-slate-600 dark:hover:text-gray-200"
            }`}
          >
            <span className="material-symbols-outlined text-sm">groups</span>
            {t("about.tab.team")}
          </button>
        </div>

        {/* Tab content 1: General Info & Kindergarten Stats */}
        {activeSubTab === "info" && (
          <div className="flex flex-col gap-6 animate-fade-in">
            {/* Quick Stats Grid */}
            <section className="grid grid-cols-3 gap-2">
              {stats.map((stat: any, idx: number) => (
                <div
                  key={idx}
                  className="glass-panel p-3 rounded-2xl border border-white/20 dark:border-white/5 flex flex-col items-center justify-center text-center shadow-sm"
                >
                  <span className="text-xl mb-1 select-none">{renderIcon(stat.icon)}</span>
                  <span className={`font-quicksand font-bold text-base ${stat.color || "text-cyan-500"} leading-tight`}>
                    {stat.value}
                  </span>
                  <span className="font-inter text-[9px] text-on-surface-variant dark:text-gray-400 leading-tight mt-0.5">
                    {stat.label}
                  </span>
                </div>
              ))}
            </section>

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
                        <ImageWithFallback
                          src={section.image}
                          alt={section.title}
                          icon="star"
                          className="w-full h-full"
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
                      <ImageWithFallback
                        src={member.image}
                        alt={member.name}
                        icon="person"
                        className="w-full h-full"
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
