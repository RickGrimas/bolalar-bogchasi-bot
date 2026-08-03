import React, { useState } from "react";

interface Activity {
  title: string;
  time: string;
  desc: string;
  icon: string;
}

interface Meal {
  time: string;
  name: string;
  icon: string;
}

export const DailyLog: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<"today" | "schedule" | "gallery">("today");
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [selectedMealDay, setSelectedMealDay] = useState<number>(0); // 0 = Mon, 5 = Sat

  // Typical Activities
  const typicalActivities: Activity[] = [
    { title: "Ertalabki gimnastika", time: "08:15 - 08:30", desc: "Bolalar jismoniy faolligini oshirish uchun qiziqarli mashqlar.", icon: "fitness_center" },
    { title: "STEM mashg'ulotlari", time: "09:30 - 10:15", desc: "Mantiqiy fikrlash, matematika va muhandislik asoslari.", icon: "science" },
    { title: "Ingliz tili darsi", time: "11:00 - 11:45", desc: "So'zlashuv va o'yinlar orqali chet tillarini o'rganish.", icon: "translate" },
    { title: "Rasm chizish / Loy ishi", time: "16:00 - 16:45", desc: "Ijodkorlik va nozik motorikani rivojlantirish darsi.", icon: "palette" },
  ];

  // 6-day Meal Schedule Mock Data
  const daysOfWeek = ["Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba"];
  const mealsData: Record<number, Meal[]> = {
    0: [
      { time: "08:30 - Nonushta", name: "Suyuq manna bo'tqasi, sariyog'li non, shirin choy", icon: "soup_kitchen" },
      { time: "12:30 - Tushlik", name: "Moshxo'rda sho'rva, tovuqli kotlet, kartoshka pyuresi", icon: "dinner_dining" },
      { time: "15:30 - Ikkinchi tushlik", name: "Yumshoq bulochka, meva sharbati", icon: "bakery_dining" },
      { time: "17:30 - Kechki ovqat", name: "Makaron va pishloq, choy", icon: "flatware" },
    ],
    1: [
      { time: "08:30 - Nonushta", name: "Guruchli bo'tqa, pishloqli sendvich, kakao", icon: "soup_kitchen" },
      { time: "12:30 - Tushlik", name: "Karam sho'rva, go'shtli palov, salat, kompot", icon: "dinner_dining" },
      { time: "15:30 - Ikkinchi tushlik", name: "Pechenye, tabiiy olma", icon: "cookie" },
      { time: "17:30 - Kechki ovqat", name: "Grechka va qiymali sous, limonli choy", icon: "flatware" },
    ],
    2: [
      { time: "08:30 - Nonushta", name: "Suli (ovsyanka) bo'tqasi, murabboli non, sut", icon: "soup_kitchen" },
      { time: "12:30 - Tushlik", name: "Frikadelkali sho'rva, teftel, dimlangan guruch", icon: "dinner_dining" },
      { time: "15:30 - Ikkinchi tushlik", name: "Keks, yogurt, mevalar", icon: "cake" },
      { time: "17:30 - Kechki ovqat", name: "Kartoshkali pirog, kompot", icon: "flatware" },
    ],
    3: [
      { time: "08:30 - Nonushta", name: "Manna bo'tqasi, pishloqli non, na'matak choyi", icon: "soup_kitchen" },
      { time: "12:30 - Tushlik", name: "Borsh sho'rvasi, qovurilgan baliq, guruch garnir", icon: "dinner_dining" },
      { time: "15:30 - Ikkinchi tushlik", name: "Bulochka, banan, sut", icon: "bakery_dining" },
      { time: "17:30 - Kechki ovqat", name: "Tovuqli somsa, limonli choy", icon: "flatware" },
    ],
    4: [
      { time: "08:30 - Nonushta", name: "Guruchli sutli bo'tqa, asal, kofe-sutli ichimlik", icon: "soup_kitchen" },
      { time: "12:30 - Tushlik", name: "No'xat sho'rva, dimlangan go'sht (gulyash), pyure", icon: "dinner_dining" },
      { time: "15:30 - Ikkinchi tushlik", name: "Yumshoq vafli, mevali sharbat", icon: "cookie" },
      { time: "17:30 - Kechki ovqat", name: "Vermishel toblamasi, choy", icon: "flatware" },
    ],
    5: [
      { time: "08:30 - Nonushta", name: "Semolina shirin bo'tqasi, tost non, issiq sut", icon: "soup_kitchen" },
      { time: "12:30 - Tushlik", name: "Sabzavotli krem-sho'rva, lag'mon, mevalar", icon: "dinner_dining" },
      { time: "15:30 - Ikkinchi tushlik", name: "Pechenye va kefir (qatiq)", icon: "cookie" },
      { time: "17:30 - Kechki ovqat", name: "Guruchli sabzavotli keks, choy", icon: "flatware" },
    ],
  };

  // Gallery Photos with Downloads
  const galleryItems = [
    {
      id: 1,
      url: "https://images.unsplash.com/photo-1596464716127-f2a82984de30?q=80&w=600&auto=format&fit=crop",
      desc: "Lego konstruktoridan chiroyli uychalar qurdik.",
    },
    {
      id: 2,
      url: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=600&auto=format&fit=crop",
      desc: "Ranglar bilan ishlash darsimizdan yorqin lavha.",
    },
    {
      id: 3,
      url: "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?q=80&w=600&auto=format&fit=crop",
      desc: "Mini hovuzimizda yozgi suv chiniqtirish darsi.",
    },
  ];

  const handleDownload = (imgUrl: string) => {
    // Open image in a new window to let parent save/download
    window.open(imgUrl, "_blank");
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 py-6 flex-1 flex flex-col gap-5 pb-20">
      <section className="text-left">
        <h2 className="font-quicksand font-bold text-2xl text-primary dark:text-[#89ceff]">
          Kundalik Mashg'ulotlar
        </h2>
        <p className="font-inter text-xs text-on-surface-variant dark:text-gray-400 mt-0.5">
          Farzandingiz faoliyati, mashg'ulotlari, taomnomasi va rasmlari.
        </p>
      </section>

      {/* Mini-Tab Selector */}
      <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-gray-255 dark:border-gray-700">
        {(["today", "schedule", "gallery"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveSubTab(tab)}
            className={`py-2 text-[10px] font-quicksand font-bold rounded-xl transition-all duration-300 ${
              activeSubTab === tab
                ? "bg-cyan-500 text-white shadow-sm"
                : "text-slate-600 dark:text-gray-400 hover:text-slate-900"
            }`}
          >
            {tab === "today" ? "Bugungi holat" : tab === "schedule" ? "Jadval & Taomlar" : "Galereya"}
          </button>
        ))}
      </div>

      {/* SUBTAB 1: TODAY'S STATUS & CALENDAR */}
      {activeSubTab === "today" && (
        <div className="flex flex-col gap-4 animate-fade-in text-left">
          {/* Calendar Picker Control */}
          <div className="glass-panel p-4 rounded-3xl border border-white/20 shadow-sm flex flex-col gap-2.5">
            <label className="font-quicksand font-bold text-xs text-primary dark:text-[#89ceff] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">calendar_month</span>
              Kunni tanlang:
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2.5 border rounded-[16px] text-xs bg-white dark:bg-[#1e293b] border-gray-300 dark:border-gray-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          {/* Today's Checklist Log Card */}
          <div className="glass-panel p-5 rounded-3xl border border-white/20 shadow-sm flex flex-col gap-4">
            <h4 className="font-quicksand font-bold text-sm text-primary dark:text-[#89ceff] border-b border-primary/10 pb-1.5 flex justify-between items-center">
              <span>Kunlik Faollik Hisoboti</span>
              <span className="text-[10px] text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-lg">
                Bajarildi
              </span>
            </h4>

            {/* Checklist */}
            <div className="flex flex-col gap-3 font-inter text-xs text-on-surface-variant dark:text-gray-300">
              <div className="flex gap-2.5 items-center">
                <span className="material-symbols-outlined text-emerald-500 text-base">check_circle</span>
                <span><strong>Ertalabki gimnastika:</strong> Qatnashdi va to'liq mashqlarni bajardi.</span>
              </div>
              <div className="flex gap-2.5 items-center">
                <span className="material-symbols-outlined text-emerald-500 text-base">check_circle</span>
                <span><strong>STEM mashg'uloti:</strong> Robot konstruktsiyasini yasashda qatnashdi.</span>
              </div>
              <div className="flex gap-2.5 items-center">
                <span className="material-symbols-outlined text-emerald-500 text-base">check_circle</span>
                <span><strong>Ingliz tili:</strong> Yangi mevalar nomlarini o'rgandi, talaffuzi yaxshi.</span>
              </div>
              <div className="flex gap-2.5 items-center">
                <span className="material-symbols-outlined text-emerald-500 text-base">check_circle</span>
                <span><strong>Kunduzgi uyqu:</strong> 13:00 dan 15:00 gacha shirin uxladi.</span>
              </div>
            </div>

            {/* Teacher Notes */}
            <div className="bg-cyan-500/5 dark:bg-white/5 p-3 rounded-2xl border-l-4 border-cyan-500 mt-1">
              <span className="font-quicksand font-bold text-[10px] text-cyan-600 dark:text-cyan-400 block mb-1">
                Tarbiyachi izohi:
              </span>
              <p className="font-inter text-xs text-on-surface-variant dark:text-gray-300 leading-relaxed italic">
                "Bugun Aliya juda faol bo'ldi. Darslarni qiziqish bilan o'zlashtirdi va barcha ovqatlarini yaxshi yedi."
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: SCHEDULE & 6-DAY MEALS PLAN */}
      {activeSubTab === "schedule" && (
        <div className="flex flex-col gap-4 animate-fade-in text-left">
          {/* Section: Odatiy Mashg'ulotlar */}
          <div className="glass-panel p-4 rounded-3xl border border-white/20 shadow-sm flex flex-col gap-3">
            <h3 className="font-quicksand font-bold text-sm text-primary dark:text-[#89ceff] border-b border-primary/10 pb-1 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base">school</span>
              Odatiy Mashg'ulotlar
            </h3>
            <div className="flex flex-col gap-3">
              {typicalActivities.map((act, idx) => (
                <div key={idx} className="flex gap-3 items-start border-b border-gray-100 dark:border-gray-800 last:border-b-0 pb-2 last:pb-0">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-base">{act.icon}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className="font-quicksand font-bold text-xs text-on-surface dark:text-white">
                        {act.title}
                      </span>
                      <span className="font-inter text-[9px] text-cyan-600 dark:text-[#89ceff]">
                        {act.time}
                      </span>
                    </div>
                    <p className="font-inter text-[10px] text-on-surface-variant dark:text-gray-400 leading-normal mt-0.5">
                      {act.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: 6-Day Menu Plan */}
          <div className="glass-panel p-4 rounded-3xl border border-white/20 shadow-sm flex flex-col gap-3">
            <h3 className="font-quicksand font-bold text-sm text-amber-500 dark:text-amber-400 border-b border-primary/10 pb-1 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base">restaurant_menu</span>
              6 Kunlik Taomnoma
            </h3>

            {/* Horizontal Day Selector tabs */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {daysOfWeek.map((day, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedMealDay(idx)}
                  className={`px-3 py-1.5 text-[9px] font-bold rounded-lg border uppercase tracking-wider flex-shrink-0 transition-all ${
                    selectedMealDay === idx
                      ? "bg-amber-500 text-white border-amber-500 shadow-sm"
                      : "bg-slate-50 dark:bg-slate-800 border-gray-200 dark:border-gray-700 text-slate-500 dark:text-gray-400"
                  }`}
                >
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>

            {/* Selected day meals list */}
            <div className="flex flex-col gap-2.5 mt-2">
              <div className="text-[10px] font-bold text-cyan-600 dark:text-[#89ceff] uppercase tracking-wide">
                {daysOfWeek[selectedMealDay]} Taomnomasi:
              </div>
              {mealsData[selectedMealDay].map((meal, idx) => (
                <div key={idx} className="flex gap-3 items-center bg-amber-500/5 dark:bg-white/5 p-2.5 rounded-xl border border-white/10 text-left">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-base">{meal.icon}</span>
                  </div>
                  <div className="flex-1">
                    <span className="font-quicksand font-bold text-[9px] text-amber-500 dark:text-amber-400 block uppercase">
                      {meal.time}
                    </span>
                    <p className="font-inter text-xs text-on-surface dark:text-gray-200 leading-tight mt-0.5">
                      {meal.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: DOWNLOADABLE PHOTO GALLERY */}
      {activeSubTab === "gallery" && (
        <div className="flex flex-col gap-4 animate-fade-in text-left">
          <div className="glass-panel p-4 rounded-3xl border border-white/20 shadow-sm flex flex-col gap-4">
            <h3 className="font-quicksand font-bold text-sm text-primary dark:text-[#89ceff] border-b border-primary/10 pb-1 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base">photo_library</span>
              Bolajonlarning Kundalik Fotolari
            </h3>
            
            <div className="flex flex-col gap-4">
              {galleryItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white/50 dark:bg-white/5 rounded-2xl overflow-hidden border border-white/20 shadow-inner flex flex-col"
                >
                  <div className="w-full aspect-[16/10] overflow-hidden relative">
                    <img src={item.url} alt={item.desc} className="w-full h-full object-cover" />
                    {/* Floating Download Button over image */}
                    <button
                      onClick={() => handleDownload(item.url)}
                      className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-cyan-500/90 text-white flex items-center justify-center shadow-md active:scale-90 hover:bg-cyan-400 transition-all z-20"
                      title="Yuklab olish"
                    >
                      <span className="material-symbols-outlined text-base">download</span>
                    </button>
                  </div>
                  <div className="p-3 text-left">
                    <p className="font-inter text-xs text-on-surface-variant dark:text-gray-300 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
