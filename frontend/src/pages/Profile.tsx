import React, { useState } from "react";
import { useApp } from "../context/AppContext";

export const Profile: React.FC = () => {
  const { currentChild } = useApp();

  // FAQ Accordion and Feedback Form States
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);
  const [helpCategory, setHelpCategory] = useState("Texnik Muammo");
  const [helpMessage, setHelpMessage] = useState("");
  const [helpSubmitted, setHelpSubmitted] = useState(false);

  const handleHelpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!helpMessage.trim()) return;
    setHelpSubmitted(true);
    setHelpMessage("");
    setTimeout(() => {
      setHelpSubmitted(false);
    }, 4000);
  };

  // Create a pseudo-random code string for the QR code representation
  const qrValue = currentChild ? `cck-child-${currentChild.id}-${new Date().toISOString().split("T")[0]}` : "no-child";

  const getAgeText = (birthDateStr?: string) => {
    if (!birthDateStr) return "";
    const birthDate = new Date(birthDateStr);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return `${age} yosh`;
  };

  const childMetrics = [
    { label: "Bo'yi", value: "110 sm", icon: "straighten", color: "text-cyan-500" },
    { label: "Vazni", value: "18 kg", icon: "monitor_weight", color: "text-amber-500" },
    { label: "Guruh", value: "Kamalak", icon: "group", color: "text-emerald-500" },
    { label: "To'lov", value: "2M so'm", icon: "payments", color: "text-indigo-500" },
    { label: "Tashrif davri", value: "10 oy", icon: "calendar_today", color: "text-pink-500" },
    { label: "Yoshi", value: currentChild ? getAgeText(currentChild.birth_date) : "", icon: "cake", color: "text-yellow-500" },
  ];

  // Attendance mock for the last 15 days
  const last15Days = [
    { day: 1, attended: true },
    { day: 2, attended: true },
    { day: 3, attended: true },
    { day: 4, attended: false },
    { day: 5, attended: true },
    { day: 6, attended: true },
    { day: 7, attended: true },
    { day: 8, attended: true },
    { day: 9, attended: true },
    { day: 10, attended: false },
    { day: 11, attended: true },
    { day: 12, attended: true },
    { day: 13, attended: true },
    { day: 14, attended: true },
    { day: 15, attended: true },
  ];

  return (
    <div className="w-full max-w-md mx-auto px-4 py-6 flex-1 flex flex-col gap-5 pb-20">
      <section className="text-left">
        <h2 className="font-quicksand font-bold text-2xl text-primary dark:text-[#89ceff]">
          Bolajon Profili
        </h2>
        <p className="font-inter text-xs text-on-surface-variant dark:text-gray-400 mt-0.5">
          Farzandingiz parametrlari va smart davomat kartasi.
        </p>
      </section>

      {/* Child Metrics Grid (Replaces old text card) */}
      {currentChild && (
        <section className="grid grid-cols-3 gap-3">
          {childMetrics.map((metric, idx) => (
            <div key={idx} className="glass-panel p-3.5 rounded-2xl flex flex-col items-center text-center border border-white/20 shadow-sm hover:scale-105 transition-all duration-300">
              <span className={`material-symbols-outlined ${metric.color} text-xl mb-1`}>{metric.icon}</span>
              <span className="font-quicksand font-bold text-[13px] text-on-surface dark:text-white leading-tight">
                {metric.value}
              </span>
              <span className="font-inter text-[9px] text-on-surface-variant dark:text-gray-400 mt-0.5">
                {metric.label}
              </span>
            </div>
          ))}
        </section>
      )}

      {/* Smart Pickup QR Code */}
      {currentChild && (
        <section className="glass-panel p-5 rounded-3xl text-center shadow-sm border border-white/20 flex flex-col items-center gap-4">
          <h3 className="font-quicksand font-bold text-sm text-primary dark:text-[#89ceff] self-start border-b border-primary/10 w-full pb-2 text-left flex items-center gap-2">
            <span className="material-symbols-outlined text-base">qr_code_scanner</span>
            Smart Davomat (Olib ketish QR)
          </h3>
          <p className="font-inter text-[11px] text-on-surface-variant dark:text-gray-400 text-left leading-relaxed">
            Farzandingizni bog'chadan olib ketish uchun ushbu dinamik QR kodni tarbiyachiga ko'rsating.
          </p>

          <div className="bg-white p-3 rounded-2xl shadow-inner border border-gray-100 flex items-center justify-center w-36 h-36">
            <svg
              className="w-full h-full text-[#111c2d]"
              viewBox="0 0 100 100"
              fill="currentColor"
              shapeRendering="crispEdges"
            >
              <path d="M0 0h30v30H0zm40 0h20v10H40zm30 0h30v30H70zM0 40h10v20H0zm20 0h10v10H20zm30 0h20v10H50zm10 20h20v20H60zM0 70h30v30H0zm40 10h10v20H40zm30-10h30v30H70zM10 10h10v10H10zm70 0h10v10H80zm-70 70h10v10H10zm70 0h10v10H80z" />
              <path d="M30 40h10v10H30zm0 20h10v10H30zm10 0h10v10H40zm0-30h10v10H40zm10 40h10v10H50zm40-30h10v10H90zm0 10h10v10H90z" />
            </svg>
          </div>

          <span className="font-mono text-[8px] text-on-surface-variant dark:text-gray-400 bg-primary/5 px-3 py-1 rounded-full border border-primary/10">
            {qrValue}
          </span>
        </section>
      )}

      {/* Visual Monthly Attendance Statistics Graph */}
      {currentChild && (
        <section className="glass-panel p-5 rounded-3xl text-left shadow-sm border border-white/20 flex flex-col gap-4">
          <h3 className="font-quicksand font-bold text-sm text-primary dark:text-[#89ceff] border-b border-primary/10 pb-2 flex justify-between items-center w-full">
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-base">analytics</span>
              Oylik Davomat Ko'rsatkichi
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-lg">
              94% keldi
            </span>
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-emerald-500/5 dark:bg-emerald-500/10 p-3 rounded-2xl border border-emerald-500/10 flex items-center gap-2.5">
              <span className="material-symbols-outlined text-emerald-500 text-lg">check_circle</span>
              <div>
                <span className="text-[9px] text-on-surface-variant dark:text-gray-400 font-inter">Kelgan kunlari</span>
                <span className="font-quicksand font-bold text-xs text-on-surface dark:text-white block">23 kun</span>
              </div>
            </div>

            <div className="bg-red-500/5 dark:bg-red-500/10 p-3 rounded-2xl border border-red-500/10 flex items-center gap-2.5">
              <span className="material-symbols-outlined text-red-500 text-lg">cancel</span>
              <div>
                <span className="text-[9px] text-on-surface-variant dark:text-gray-400 font-inter">Kelmagan kunlari</span>
                <span className="font-quicksand font-bold text-xs text-on-surface dark:text-white block">2 kun</span>
              </div>
            </div>
          </div>

          {/* Last 15 days Grid dot-chart */}
          <div className="flex flex-col gap-1.5 mt-1">
            <span className="text-[9px] font-bold text-on-surface-variant dark:text-gray-400 font-inter">
              So'nggi 15 kunlik batafsil jadval:
            </span>
            <div className="flex gap-2 justify-between mt-1">
              {last15Days.map((day) => (
                <div key={day.day} className="flex flex-col items-center gap-1 flex-1">
                  <div
                    className={`w-3.5 h-3.5 rounded-full shadow-inner flex items-center justify-center ${
                      day.attended ? "bg-emerald-500" : "bg-red-500"
                    }`}
                    title={`Kun ${day.day}: ${day.attended ? "Kelgan" : "Kelmagan"}`}
                  />
                  <span className="text-[8px] text-gray-400 font-mono">{day.day}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Help & Support Mini Section (Yordam & Tez-tez beriladigan savollar) */}
      <section className="glass-panel p-5 rounded-3xl text-left border border-white/20 shadow-sm flex flex-col gap-4">
        <div className="border-b border-primary/10 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-cyan-500 text-xl">help</span>
            <h3 className="font-quicksand font-bold text-sm text-primary dark:text-[#89ceff]">
              Yordam & Qo'llab-quvvatlash
            </h3>
          </div>
          <span className="text-[10px] text-slate-400 font-inter">FAQ & Support</span>
        </div>

        {/* FAQ Accordion List */}
        <div className="flex flex-col gap-2.5 font-inter text-xs">
          <span className="text-[11px] font-bold text-on-surface-variant dark:text-gray-300 flex items-center gap-1">
            <span className="material-symbols-outlined text-xs text-amber-500">quiz</span>
            Ko'p beriladigan savollar (FAQ):
          </span>

          {[
            {
              id: "faq-1",
              q: "Jonli kameralarga qanday ulanaman?",
              a: "Ilovaning 'Kameralar' bo'limidan bog'cha guruh kamerasini tanlang hamda real-vaqt rejimida HD formatda kuzatib borishingiz mumkin."
            },
            {
              id: "faq-2",
              q: "Bolamni bog'chadan boshqa qarindoshim olib ketishi mumkinmi?",
              a: "Ha, buning uchun profil sahifangizdagi Smart QR kodni yoki tarbiyachiga ma'lum qilingan maxsus parolni olib ketuvchi shaxs taqdim etishi lozim."
            },
            {
              id: "faq-3",
              q: "Kunlik taomnoma va ovqatlanish jadvalini qayerdan ko'raman?",
              a: "Kundalik kun tartibi (Timeline) bo'limida har kuni beriladigan nonushta, tushlik va ikkinchi tushlik taomlari to'liq ko'rsatib boriladi."
            }
          ].map((faq) => (
            <div
              key={faq.id}
              onClick={() => setOpenFaqId(openFaqId === faq.id ? null : faq.id)}
              className="bg-white/60 dark:bg-slate-900/60 p-3 rounded-2xl border border-gray-200/80 dark:border-gray-800/80 cursor-pointer transition-all hover:border-cyan-500/40"
            >
              <div className="flex items-center justify-between font-quicksand font-bold text-xs text-primary dark:text-[#89ceff]">
                <span>❓ {faq.q}</span>
                <span className="material-symbols-outlined text-sm text-slate-400">
                  {openFaqId === faq.id ? "expand_less" : "expand_more"}
                </span>
              </div>
              {openFaqId === faq.id && (
                <p className="mt-2 text-[11px] text-slate-600 dark:text-gray-300 leading-relaxed pl-2 border-l-2 border-cyan-500 animate-fade-in">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Bug / Feedback Contact Form */}
        <div className="bg-slate-900/40 p-4 rounded-2xl border border-slate-800 flex flex-col gap-3 mt-1 text-left">
          <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
            <span className="material-symbols-outlined text-xs text-cyan-400">chat</span>
            Ma'muriyat yoki Texnik guruhga murojaat yuborish:
          </span>

          {helpSubmitted ? (
            <div className="p-3 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-xl text-xs font-bold text-center animate-fade-in">
              ✅ Rahmat! Murojaatingiz ma'muriyat va texnik guruhga yetkazildi.
            </div>
          ) : (
            <form onSubmit={handleHelpSubmit} className="flex flex-col gap-2.5">
              <div className="flex gap-2">
                <select
                  value={helpCategory}
                  onChange={(e) => setHelpCategory(e.target.value)}
                  className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none font-medium flex-1"
                >
                  <option value="Texnik Muammo">🔴 Texnik Muammo (Bug)</option>
                  <option value="Taklif va Istak">💡 Taklif va Istak</option>
                  <option value="Umumiy Savol">❓ Umumiy Savol</option>
                </select>
              </div>

              <textarea
                rows={2}
                required
                value={helpMessage}
                onChange={(e) => setHelpMessage(e.target.value)}
                placeholder="Savolingiz yoki muammoingiz haqida yozing..."
                className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white resize-none focus:outline-none focus:ring-1 focus:ring-cyan-500 font-inter"
              />

              <button
                type="submit"
                className="w-full py-2 bg-cyan-500 hover:bg-cyan-400 text-white font-quicksand font-bold text-xs rounded-xl shadow border-b-2 border-cyan-700 active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">send</span>
                Murojaatni Yuborish
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
};
