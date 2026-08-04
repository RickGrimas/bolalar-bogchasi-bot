import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { motion } from "framer-motion";

export const LoginModal: React.FC = () => {
  const { 
    isLoginModalOpen, 
    setIsLoginModalOpen, 
    login, 
    loginWithoutPassword,
    loading, 
    loginError, 
    setLoginError,
    t 
  } = useApp();

  const [username, setUsername] = useState("parent1@bogcha.uz");
  const [password, setPassword] = useState("password123");
  const [rememberMe, setRememberMe] = useState(true);

  if (!isLoginModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username) {
      setLoginError("Iltimos, Login yoki Emailingizni kiriting.");
      return;
    }
    await login(username, password || "password123", rememberMe);
  };

  const handleQuickDemoLogin = async () => {
    await loginWithoutPassword();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm font-quicksand">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-sm rounded-3xl bg-white/95 dark:bg-slate-900/95 border border-white/20 dark:border-white/5 shadow-2xl p-6 relative overflow-hidden"
      >
        {/* Close Button */}
        <button
          onClick={() => {
            setIsLoginModalOpen(false);
            setLoginError(null);
          }}
          className="absolute top-4 right-4 text-gray-400 hover:text-slate-600 dark:hover:text-white flex items-center justify-center p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-90"
        >
          <span className="material-symbols-outlined text-lg">close</span>
        </button>

        {/* Header */}
        <div className="flex flex-col items-center text-center mt-2 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 dark:bg-cyan-400/15 flex items-center justify-center text-cyan-600 dark:text-cyan-400 mb-2">
            <span className="material-symbols-outlined text-2xl font-bold">
              vpn_key
            </span>
          </div>
          <h2 className="font-bold text-lg text-primary dark:text-[#89ceff]">
            {t("settings.login")}
          </h2>
          <p className="text-[10px] text-slate-500 dark:text-gray-400 mt-0.5">
            Akkauntingizga kirish usulini tanlang
          </p>
        </div>

        {/* 1-Click Quick Demo Parent Login Button */}
        <div className="mb-3">
          <button
            type="button"
            onClick={handleQuickDemoLogin}
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold text-xs rounded-2xl shadow-lg border-b-4 border-cyan-700 active:scale-98 active:border-b-0 active:translate-y-[2px] transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span className="material-symbols-outlined text-base">bolt</span>
                ⚡ Tezkor Ota-ona Sifatida Kirish
              </>
            )}
          </button>
        </div>

        <div className="relative flex py-1 items-center mb-3">
          <div className="flex-grow border-t border-gray-200 dark:border-slate-800"></div>
          <span className="flex-shrink mx-2 text-[9px] font-bold text-gray-400 uppercase">yoki login va parol bilan</span>
          <div className="flex-grow border-t border-gray-200 dark:border-slate-800"></div>
        </div>

        {/* Demo credentials hint box */}
        <div className="mb-3 p-2.5 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-[10px] text-cyan-700 dark:text-cyan-300 text-center font-bold">
          💡 Demo login: <span className="underline">parent1@bogcha.uz</span> | Parol: <span className="underline">password123</span>
        </div>

        {/* Error Message */}
        {loginError && (
          <div className="mb-3 p-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-[10px] text-red-600 dark:text-red-400 text-left font-inter leading-relaxed flex items-start gap-1.5 animate-pulse">
            <span className="material-symbols-outlined text-sm flex-shrink-0">error</span>
            <span>{loginError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 text-xs">
          {/* Username / Login field */}
          <div className="flex flex-col gap-1 text-left text-slate-700 dark:text-gray-300 font-bold">
            <label htmlFor="login-username" className="pl-1 text-[10px]">
              Login (yoki Email)
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-base">
                person
              </span>
              <input
                id="login-username"
                type="text"
                placeholder="parent1 (yoki parent1@bogcha.uz)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white font-inter placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-cyan-500 dark:focus:border-cyan-400 transition-colors"
                required
              />
            </div>
          </div>

          {/* Password field */}
          <div className="flex flex-col gap-1 text-left text-slate-700 dark:text-gray-300 font-bold">
            <label htmlFor="login-password" className="pl-1 text-[10px]">
              Parol
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-base">
                lock
              </span>
              <input
                id="login-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white font-inter placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-cyan-500 dark:focus:border-cyan-400 transition-colors"
              />
            </div>
          </div>

          {/* Remember me Checkbox */}
          <div className="flex items-center gap-2 pl-1 py-0.5">
            <input
              id="login-remember"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded text-cyan-500 border-gray-300 focus:ring-cyan-500 dark:border-slate-700 dark:bg-slate-800 dark:focus:ring-cyan-400 cursor-pointer"
            />
            <label
              htmlFor="login-remember"
              className="text-[10px] text-slate-600 dark:text-gray-400 select-none font-bold cursor-pointer"
            >
              Meni eslab qol (keyingi kirishlar uchun)
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-1 py-2.5 bg-slate-800 hover:bg-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold rounded-xl shadow-md border-b-2 border-slate-900 active:scale-98 active:translate-y-[1px] transition-all flex items-center justify-center gap-1.5"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span className="material-symbols-outlined text-sm">login</span>
                Login va Parol orqali kirish
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};
