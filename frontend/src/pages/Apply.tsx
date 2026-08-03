import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { supabase } from "../supabaseClient";

export const Apply: React.FC = () => {
  const { t, lang } = useApp();

  const [formData, setFormData] = useState({
    parentName: "",
    parentPhone: "",
    childName: "",
    childAge: "",
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.parentName || !formData.parentPhone) {
      setStatusMsg({ 
        type: "error", 
        text: lang === "ru" ? "Введите имя и номер телефона." : lang === "en" ? "Please enter your name and phone number." : "Ismingiz va telefon raqamingizni kiriting." 
      });
      return;
    }

    setLoading(true);
    setStatusMsg(null);

    try {
      const { error } = await supabase.from("crm_leads").insert([
        {
          parent_name: formData.parentName,
          parent_phone: formData.parentPhone,
          child_name: formData.childName || null,
          child_age: formData.childAge ? parseInt(formData.childAge) : null,
          notes: formData.notes || null,
          status: "NEW",
        },
      ]);

      if (error) {
        console.error("Supabase insert lead error:", error);
        setStatusMsg({ 
          type: "error", 
          text: lang === "ru" ? "Произошла ошибка. Пожалуйста, попробуйте позже." : lang === "en" ? "An error occurred. Please try again later." : "Xatolik yuz berdi. Iltimos, keyinroq qayta urunib ko'ring." 
        });
      } else {
        setStatusMsg({ 
          type: "success", 
          text: t("apply.success") 
        });
        setFormData({
          parentName: "",
          parentPhone: "",
          childName: "",
          childAge: "",
          notes: "",
        });
      }
    } catch (err) {
      console.error(err);
      setStatusMsg({ 
        type: "error", 
        text: lang === "ru" ? "Произошла непредвиденная ошибка." : lang === "en" ? "An unexpected error occurred." : "Kutilmagan xatolik yuz berdi." 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full px-4 py-6 flex-1 flex flex-col gap-6 animate-fade-in">
      <section className="text-left">
        <h2 className="font-quicksand font-bold text-2xl text-primary dark:text-[#89ceff] transition-colors">
          {t("apply.title")}
        </h2>
        <p className="font-inter text-xs text-on-surface-variant dark:text-gray-400 mt-1">
          {t("apply.subtitle")}
        </p>
      </section>

      {/* Application Form */}
      <section className="glass-panel p-5 rounded-3xl text-left border border-white/20 shadow-sm">
        <h3 className="font-quicksand font-bold text-base text-cyan-600 dark:text-cyan-400 mb-3.5 border-b border-primary/10 pb-1.5">
          {t("apply.submit")}
        </h3>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <div className="flex flex-col gap-1">
            <input
              type="text"
              placeholder={t("apply.parent.name") + " *"}
              value={formData.parentName}
              onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
              className="px-4 py-2.5 border rounded-[16px] text-xs bg-white dark:bg-[#1e293b] border-gray-300 dark:border-gray-700 text-slate-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <input
              type="tel"
              placeholder={t("apply.parent.phone") + " *"}
              value={formData.parentPhone}
              onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
              className="px-4 py-2.5 border rounded-[16px] text-xs bg-white dark:bg-[#1e293b] border-gray-300 dark:border-gray-700 text-slate-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder={t("apply.child.name")}
              value={formData.childName}
              onChange={(e) => setFormData({ ...formData, childName: e.target.value })}
              className="px-4 py-2.5 border rounded-[16px] text-xs bg-white dark:bg-[#1e293b] border-gray-300 dark:border-gray-700 text-slate-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <input
              type="number"
              placeholder={t("apply.child.age")}
              value={formData.childAge}
              onChange={(e) => setFormData({ ...formData, childAge: e.target.value })}
              className="px-4 py-2.5 border rounded-[16px] text-xs bg-white dark:bg-[#1e293b] border-gray-300 dark:border-gray-700 text-slate-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              min="1"
              max="15"
            />
          </div>

          <textarea
            placeholder={t("apply.notes")}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="p-4 border rounded-[16px] text-xs bg-white dark:bg-[#1e293b] border-gray-300 dark:border-gray-700 text-slate-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 h-16 resize-none"
          />

          {statusMsg && (
            <div
              className={`p-2.5 rounded-xl text-[10px] font-bold text-center ${
                statusMsg.type === "success"
                  ? "bg-green-500/15 text-green-600 dark:text-green-400"
                  : "bg-red-500/15 text-red-500"
              }`}
            >
              {statusMsg.text}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-cyan-500 hover:bg-cyan-400 text-white font-quicksand font-bold text-xs rounded-xl shadow-md border-b-4 border-cyan-700 active:scale-95 active:border-b-0 active:translate-y-[4px] transition-all flex items-center justify-center gap-1.5"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              t("apply.submit")
            )}
          </button>
        </form>
      </section>

      {/* Info Card with Yandex Maps Iframe */}
      <section className="glass-panel p-5 rounded-3xl text-left border border-white/20 shadow-sm flex flex-col gap-3 font-inter text-xs text-on-surface-variant dark:text-gray-300">
        <h3 className="font-quicksand font-bold text-sm text-primary dark:text-[#89ceff] border-b border-primary/10 pb-1.5 flex items-center gap-1.5">
          <span className="material-symbols-outlined text-base">location_on</span>
          {t("apply.address.title")}
        </h3>
        <p><strong>{t("apply.phone")}:</strong> +998 (71) 123-45-67</p>
        <p><strong>{t("apply.address.title")}:</strong> {t("apply.address")}</p>
        
        {/* Interactive Yandex Maps Iframe */}
        <div className="w-full h-44 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-inner relative bg-slate-100">
          <iframe
            src="https://yandex.ru/map-widget/v1/?ll=69.204543%2C41.278508&z=16&pt=69.204543%2C41.278508%2Cpm2rdl"
            width="100%"
            height="100%"
            frameBorder="0"
            allowFullScreen={true}
            style={{ position: "relative" }}
            title="CloudCare Kids Yandex Map Location"
          ></iframe>
        </div>
      </section>
    </div>
  );
};
