import React, { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import { supabase } from "../supabaseClient";
import { ImageWithFallback } from "../components/ImageWithFallback";

export const Dashboard: React.FC = () => {
  const { currentChild, user } = useApp();
  const [todayLog, setTodayLog] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentChild) {
      fetchTodayLog();
    }
  }, [currentChild]);

  const fetchTodayLog = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("daily_logs")
        .select("*")
        .eq("child_id", currentChild?.id)
        .eq("date", new Date().toISOString().split("T")[0])
        .maybeSingle();

      if (!error && data) {
        setTodayLog(data);
      } else {
        setTodayLog(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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

  const announcements = [
    {
      title: "Ertaga bayram tadbiri!",
      text: "Ertaga soat 10:00 da bolajonlar ishtirokida festival bo'ladi. Bolalarni bayramona kiyimda olib keling.",
      image: "/images/news1.svg",
    },
    {
      title: "Tibbiy ko'rik",
      text: "Juma kuni bog'chamizda bolalar uchun rejaviy shifokor ko'rigi tashkil etiladi.",
      image: "/images/news2.svg",
    },
  ];

  return (
    <div className="w-full max-w-md mx-auto px-4 py-6 flex-1 flex flex-col gap-5">
      {/* Welcome Header */}
      <section className="text-left">
        <h2 className="font-quicksand font-bold text-2xl text-primary dark:text-[#89ceff]">
          Salom, {user?.full_name}!
        </h2>
        <p className="font-inter text-xs text-on-surface-variant dark:text-gray-400 mt-0.5">
          Farzandingiz haqidagi so'nggi ma'lumotlar bilan tanishing.
        </p>
      </section>

      {/* Child Profile Details Card (Photo, Name, Age, Group) */}
      {currentChild && (
        <section className="glass-panel p-4 rounded-3xl text-left border border-white/20 shadow-sm flex items-center gap-4 bg-gradient-to-r from-cyan-500/10 to-teal-500/5">
          {/* Child Photo */}
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-cyan-400/40 shadow-sm flex-shrink-0">
            <ImageWithFallback
              src="/images/child_avatar.svg"
              alt={`${currentChild.first_name}`}
              icon="face"
              className="w-full h-full"
            />
          </div>
          {/* Child details */}
          <div className="flex-1 flex flex-col gap-0.5">
            <h4 className="font-quicksand font-bold text-base text-primary dark:text-[#89ceff]">
              {currentChild.first_name} {currentChild.last_name}
            </h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 px-2 py-0.5 rounded-lg text-[9px] font-bold">
                Kamalak guruhi
              </span>
              <span className="bg-amber-500/15 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-lg text-[9px] font-bold">
                {getAgeText(currentChild.birth_date)}
              </span>
            </div>
          </div>
        </section>
      )}

      {/* Attendance & Today status */}
      <section className="glass-panel p-5 rounded-3xl text-left shadow-sm border border-white/20 flex flex-col gap-4">
        <h3 className="font-quicksand font-bold text-base text-primary dark:text-[#89ceff] border-b border-primary/10 pb-1.5 flex items-center gap-1.5">
          <span className="material-symbols-outlined text-base">verified_user</span>
          Bugungi holat (Davomat)
        </h3>

        {loading ? (
          <div className="flex items-center justify-center py-4">
            <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : todayLog ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 bg-emerald-500/10 p-3.5 rounded-2xl border border-emerald-500/10">
              <span className="material-symbols-outlined text-emerald-500 text-3xl">check_circle</span>
              <div className="flex-1">
                <span className="font-quicksand font-bold text-xs text-emerald-600 dark:text-emerald-400">Bog'chada</span>
                <p className="font-inter text-[10px] text-on-surface-variant dark:text-gray-300">
                  Farzandingiz bugun o'z vaqtida bog'chaga keldi.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-1">
              <div className="bg-cyan-500/5 dark:bg-white/5 p-3 rounded-2xl border border-white/10 flex flex-col items-center justify-center text-center">
                <span className="material-symbols-outlined text-cyan-500 mb-1 text-lg">restaurant</span>
                <span className="font-quicksand font-bold text-[11px] text-on-surface dark:text-white">Ovqatlanishi</span>
                <span className="font-inter text-[10px] text-on-surface-variant dark:text-gray-400 mt-0.5 font-bold text-cyan-600 dark:text-cyan-400">
                  {todayLog.food_rating === "EXCELLENT" ? "Hammasini yedi" : todayLog.food_rating === "GOOD" ? "Yaxshi yedi" : "Kam yedi"}
                </span>
              </div>

              <div className="bg-cyan-500/5 dark:bg-white/5 p-3 rounded-2xl border border-white/10 flex flex-col items-center justify-center text-center">
                <span className="material-symbols-outlined text-amber-500 mb-1 text-lg">sentiment_satisfied</span>
                <span className="font-quicksand font-bold text-[11px] text-on-surface dark:text-white">Kayfiyati</span>
                <span className="font-inter text-[10px] text-on-surface-variant dark:text-gray-400 mt-0.5 font-bold text-amber-600 dark:text-amber-400">
                  {todayLog.mood || "Yaxshi"}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 bg-amber-500/10 p-3.5 rounded-2xl border border-amber-500/10">
            <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-3xl">info</span>
            <div className="flex-1">
              <span className="font-quicksand font-bold text-xs text-amber-600 dark:text-amber-400">Ma'lumot yo'q</span>
              <p className="font-inter text-[10px] text-on-surface-variant dark:text-gray-300">
                Bugungi hisobot tarbiyachi tomonidan hali kiritilmagan.
              </p>
            </div>
          </div>
        )}
      </section>

      {/* Announcements with Images */}
      <section className="glass-panel p-5 rounded-3xl text-left shadow-sm border border-white/20 flex flex-col gap-3">
        <h3 className="font-quicksand font-bold text-base text-primary dark:text-[#89ceff] border-b border-primary/10 pb-1.5 flex items-center gap-1.5">
          <span className="material-symbols-outlined text-base">campaign</span>
          Muhim e'lonlar
        </h3>
        <div className="flex flex-col gap-3.5">
          {announcements.map((ann, idx) => (
            <div key={idx} className="bg-white/50 dark:bg-white/5 p-3 rounded-2xl border border-white/20 dark:border-white/5 flex gap-3 items-center">
              <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
                <ImageWithFallback
                  src={ann.image}
                  alt={ann.title}
                  icon="campaign"
                  className="w-full h-full"
                />
              </div>
              <div className="flex-1">
                <span className="font-quicksand font-bold text-xs text-on-surface dark:text-white">
                  {ann.title}
                </span>
                <p className="font-inter text-[10px] text-on-surface-variant dark:text-gray-400 leading-normal mt-0.5">
                  {ann.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
