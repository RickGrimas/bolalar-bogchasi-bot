import React, { useState } from "react";
import { useApp } from "../context/AppContext";

export const Navbar: React.FC = () => {
  const { 
    isDark, 
    toggleTheme, 
    isAuthenticated, 
    logout, 
    loginWithoutPassword, 
    loading, 
    appTheme, 
    setAppTheme,
    lang,
    setLang,
    t
  } = useApp();

  const [showSettings, setShowSettings] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [showAboutSystem, setShowAboutSystem] = useState(false);

  const toggleSettings = () => {
    setShowSettings((prev) => !prev);
  };

  const handleLangChange = (selectedLang: "uz" | "ru" | "en") => {
    setLang(selectedLang);
  };

  const handleLogout = () => {
    setShowSettings(false);
    logout();
  };

  return (
    <header className="absolute top-0 left-0 w-full z-50 flex justify-between items-center px-4 bg-white/70 dark:bg-[#1e293b]/70 backdrop-blur-md border-b border-white/20 dark:border-white/5 h-[64px] transition-colors duration-500 rounded-t-3xl">
      <div className="flex items-center gap-1.5">
        <span className="material-symbols-outlined text-primary dark:text-[#89ceff] text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
          child_care
        </span>
        <div className="font-quicksand font-bold text-[15px] text-primary dark:text-[#89ceff] tracking-tight">
          {t("header.title")}
        </div>
      </div>

      <div className="flex items-center gap-1.5 relative">
        {/* Theme Toggle switch */}
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-full hover:bg-primary/10 dark:hover:bg-white/10 transition-all active:scale-90 duration-150 flex items-center justify-center text-primary dark:text-yellow-300"
          title={isDark ? "Kunduzgi rejim" : "Tungi rejim"}
        >
          <span className="material-symbols-outlined text-[20px]">
            {isDark ? "light_mode" : "dark_mode"}
          </span>
        </button>

        {/* Public view Login Button - Direct instant login to User account */}
        {!isAuthenticated && (
          <button
            onClick={() => loginWithoutPassword()}
            disabled={loading}
            className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-white font-quicksand font-bold text-[10px] rounded-xl shadow-md border-b-2 border-cyan-700 active:scale-95 active:border-b-0 active:translate-y-[2px] transition-all flex items-center gap-1"
          >
            {loading ? (
              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span className="material-symbols-outlined text-xs">login</span>
                {t("settings.login")}
              </>
            )}
          </button>
        )}

        {/* Settings Button */}
        <div className="relative">
          <button
            onClick={toggleSettings}
            className="p-1.5 rounded-full hover:bg-primary/10 dark:hover:bg-white/10 transition-all active:scale-90 duration-150 flex items-center justify-center text-primary dark:text-cyan-400"
            title="Sozlamalar"
          >
            <span className="material-symbols-outlined text-[20px]">
              settings
            </span>
          </button>

          {/* Dropdown Menu */}
          {showSettings && (
            <div className="absolute right-0 mt-2.5 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 shadow-xl p-3.5 z-50 text-left flex flex-col gap-3">
              <div className="font-quicksand font-bold text-xs text-primary dark:text-[#89ceff] border-b border-primary/10 pb-1.5 flex justify-between items-center">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">settings_applications</span>
                  {t("settings.title")}
                </span>
                {/* Close Button "X" */}
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-gray-400 hover:text-slate-600 dark:hover:text-white flex items-center justify-center p-0.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                  title="Yopish"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>

              {/* Design Theme Selector */}
              <div className="flex flex-col gap-1.5 text-xs font-inter text-slate-700 dark:text-gray-300">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm text-cyan-500 font-bold">palette</span>
                  {t("settings.theme")}
                </span>
                <div className="grid grid-cols-2 gap-1 mt-1">
                  <button
                    onClick={() => setAppTheme("classic")}
                    className={`py-1 text-[9px] font-bold rounded-lg border transition-all ${
                      appTheme === "classic"
                        ? "bg-cyan-500 text-white border-cyan-500"
                        : "bg-slate-50 dark:bg-slate-800 border-gray-200 dark:border-gray-700 text-slate-500 dark:text-gray-400"
                    }`}
                  >
                    {t("settings.theme.classic")}
                  </button>
                  <button
                    onClick={() => setAppTheme("cartoon")}
                    className={`py-1 text-[9px] font-bold rounded-lg border transition-all ${
                      appTheme === "cartoon"
                        ? "bg-cyan-500 text-white border-cyan-500"
                        : "bg-slate-50 dark:bg-slate-800 border-gray-200 dark:border-gray-700 text-slate-500 dark:text-gray-400"
                    }`}
                  >
                    {t("settings.theme.cartoon")}
                  </button>
                </div>
              </div>

              {/* Notifications switcher */}
              {isAuthenticated && (
                <div className="flex justify-between items-center text-xs font-inter text-slate-700 dark:text-gray-300">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm text-cyan-500">notifications</span>
                    {t("settings.notifications")}
                  </span>
                  <button
                    onClick={() => setNotifications(!notifications)}
                    className={`w-8 h-4 rounded-full relative transition-colors duration-300 ${
                      notifications ? "bg-cyan-500" : "bg-gray-300 dark:bg-slate-700"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transition-transform duration-300 ${
                        notifications ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              )}

              {/* Language Switcher */}
              <div className="flex flex-col gap-1.5 text-xs font-inter text-slate-700 dark:text-gray-300">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm text-cyan-500">language</span>
                  {t("settings.lang")}
                </span>
                <div className="grid grid-cols-3 gap-1 mt-1">
                  {(["uz", "ru", "en"] as const).map((l) => (
                    <button
                      key={l}
                      onClick={() => handleLangChange(l)}
                      className={`py-1 text-[10px] font-bold rounded-lg border uppercase tracking-wider transition-all ${
                        lang === l
                          ? "bg-cyan-500 text-white border-cyan-500"
                          : "bg-slate-50 dark:bg-slate-800 border-gray-200 dark:border-gray-700 text-slate-500 dark:text-gray-400"
                      }`}
                    >
                      {l === "uz" ? "Uz" : l === "ru" ? "Ru" : "En"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tizim Haqida (About System) Collapsible Info Card */}
              <div className="flex flex-col gap-1 border-t border-gray-100 dark:border-gray-800 pt-2 font-inter text-xs">
                <button
                  type="button"
                  onClick={() => setShowAboutSystem((prev) => !prev)}
                  className="w-full flex items-center justify-between text-slate-700 dark:text-gray-300 font-bold hover:text-cyan-500 transition-colors py-1 text-[11px]"
                >
                  <span className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm text-cyan-500">info</span>
                    {lang === "ru" ? "О системе" : lang === "en" ? "About System" : "Tizim haqida batafsil"}
                  </span>
                  <span className="material-symbols-outlined text-xs">
                    {showAboutSystem ? "expand_less" : "expand_more"}
                  </span>
                </button>

                {showAboutSystem && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-900/90 rounded-xl border border-gray-200 dark:border-slate-800 text-[10px] text-slate-600 dark:text-gray-300 flex flex-col gap-2 animate-fade-in text-left">
                    <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-800 pb-1.5">
                      <span className="font-quicksand font-extrabold text-cyan-600 dark:text-cyan-400">
                        CloudCare Kids CRM
                      </span>
                      <span className="bg-cyan-500/20 text-cyan-500 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded">
                        v2.5.0 Premium
                      </span>
                    </div>

                    <p className="leading-relaxed">
                      {lang === "ru"
                        ? "CloudCare Kids — это единая цифровая экосистема для детских садов. Включает онлайн-видеонаблюдение, автоматический утренний фильтр, AI-ассистент и смарт-контроль посещаемости."
                        : lang === "en"
                        ? "CloudCare Kids is a unified digital platform for kindergartens, featuring real-time CCTV streaming, daily health tracking, AI Copilot, and Smart QR attendance control."
                        : "CloudCare Kids — bu bolalar bog'chalari uchun yagona raqamli ekotizimdir. U real-vaqt rejimida HD kameralar, kunlik rivojlanish va ovqatlanish monitori, Smart QR davomat hamda AI Copilot yordamchisini o'z ichiga oladi."}
                    </p>

                    <div className="flex flex-col gap-1 border-t border-gray-200 dark:border-slate-800 pt-1.5 font-mono text-[9px] text-slate-500 dark:text-gray-400">
                      <div className="flex justify-between">
                        <span>Platfoma:</span>
                        <span className="text-slate-700 dark:text-gray-200 font-bold">Telegram Mini App</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Xavfsizlik:</span>
                        <span className="text-emerald-500 font-bold">Encrypted Zero-Trust</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Litsenziya:</span>
                        <span className="text-amber-500 font-bold">Enterprise Cloud</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Logout Button */}
              {isAuthenticated && (
                <button
                  onClick={handleLogout}
                  className="w-full py-2 bg-red-500 hover:bg-red-400 text-white font-quicksand font-bold text-xs rounded-xl shadow-md border-b-2 border-red-700 active:scale-95 active:border-b-0 active:translate-y-[2px] transition-all flex items-center justify-center gap-1 mt-1"
                >
                  <span className="material-symbols-outlined text-sm">logout</span>
                  {t("settings.logout")}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
