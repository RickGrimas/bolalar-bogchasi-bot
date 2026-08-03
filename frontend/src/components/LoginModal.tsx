import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { motion } from "framer-motion";

export const LoginModal: React.FC = () => {
  const { 
    isLoginModalOpen, 
    setIsLoginModalOpen, 
    login, 
    loading, 
    loginError, 
    setLoginError,
    t 
  } = useApp();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  if (!isLoginModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setLoginError("Iltimos, barcha maydonlarni to'ldiring.");
      return;
    }
    const success = await login(email, password, rememberMe);
    if (success) {
      setEmail("");
      setPassword("");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-sm rounded-3xl bg-white/90 dark:bg-slate-900/90 border border-white/20 dark:border-white/5 shadow-2xl p-6 relative overflow-hidden font-quicksand"
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
        <div className="flex flex-col items-center text-center mt-2 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 dark:bg-cyan-400/15 flex items-center justify-center text-cyan-600 dark:text-cyan-400 mb-2">
            <span className="material-symbols-outlined text-2xl font-bold">
              vpn_key
            </span>
          </div>
          <h2 className="font-bold text-lg text-primary dark:text-[#89ceff]">
            {t("settings.login")}
          </h2>
          <p className="text-[10px] text-slate-500 dark:text-gray-400 mt-1">
            Akkauntingizga kirish uchun login va parolni kiriting
          </p>
        </div>

        {/* Error Message */}
        {loginError && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-[10px] text-red-600 dark:text-red-400 text-left font-inter leading-relaxed flex items-start gap-1.5 animate-pulse">
            <span className="material-symbols-outlined text-sm flex-shrink-0">error</span>
            <span>{loginError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs">
          {/* Email field */}
          <div className="flex flex-col gap-1.5 text-left text-slate-700 dark:text-gray-300 font-bold">
            <label htmlFor="login-email" className="pl-1 text-[10px]">
              Email
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-base">
                mail
              </span>
              <input
                id="login-email"
                type="email"
                placeholder="parent@bogcha.uz"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white font-inter placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-cyan-500 dark:focus:border-cyan-400 transition-colors"
                required
              />
            </div>
          </div>

          {/* Password field */}
          <div className="flex flex-col gap-1.5 text-left text-slate-700 dark:text-gray-300 font-bold">
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
                required
              />
            </div>
          </div>

          {/* Remember me Checkbox */}
          <div className="flex items-center gap-2 pl-1 py-1">
            <input
              id="login-remember"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded text-cyan-500 border-gray-300 focus:ring-cyan-500 dark:border-slate-700 dark:bg-slate-800 dark:focus:ring-cyan-400"
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
            className="w-full mt-2 py-3 bg-cyan-500 hover:bg-cyan-400 text-white font-bold rounded-xl shadow-md border-b-4 border-cyan-700 hover:border-cyan-600 active:scale-98 active:border-b-0 active:translate-y-[2px] transition-all flex items-center justify-center gap-1.5"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span className="material-symbols-outlined text-sm">login</span>
                Kirish
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};
