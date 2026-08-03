import React, { useState, useEffect } from "react";
import { getAdminHeaders } from "../utils/api";

interface AIConfigItem {
  id?: string;
  assistant_type: string;
  global_ai_enabled?: boolean;
  system_prompt: string;
  doc_content: string;
  doc_file_url?: string;
  tts_enabled?: boolean;
  is_active?: boolean;
}

interface Props {
  isDark: boolean;
}

export const AIManagementSection: React.FC<Props> = ({ isDark }) => {
  const [activeSubTab, setActiveSubTab] = useState<"ADMIN_COPILOT" | "CRM_ASSISTANT" | "KIDS_ENCYCLOPEDIA">("CRM_ASSISTANT");
  const [globalAIEnabled, setGlobalAIEnabled] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>("");

  const [configs, setConfigs] = useState<Record<string, AIConfigItem>>({
    ADMIN_COPILOT: {
      assistant_type: "ADMIN_COPILOT",
      system_prompt: "Siz bog'cha rahbari uchun aqlli Copilot yordamchisisiz. Tizimdagi statistikalar, davomat, moliya va ko'rsatkichlar bo'yicha aniq maslahat bering.",
      doc_content: "Bog'cha ish vaqti: 08:00 - 18:00. Oylik to'lov: 2,000,000 so'm. 4 mahal ovqat beriladi.",
      is_active: true
    },
    CRM_ASSISTANT: {
      assistant_type: "CRM_ASSISTANT",
      system_prompt: "Siz 'Porloq Kelajak' bog'chasining xushmuomala sotuv assistentisiz. Mijozlar bilan samimiy gaplashib, bog'cha haqida ma'lumot bering va uning ismi va telefon raqamini olishga harakat qiling.",
      doc_content: "Manzil: Chilonzor 14-mavze. Tel: +998 71 200-00-11. Qabul 3-6 yoshdagilar uchun.",
      is_active: true
    },
    KIDS_ENCYCLOPEDIA: {
      assistant_type: "KIDS_ENCYCLOPEDIA",
      system_prompt: "Siz bolalar uchun do'stona va bilimdon yordamchisiz. Bolalarga qiziqarli va sodda tilda javob bering.",
      doc_content: "Tabiat, hayvonlar, kosmos va fan haqida qiziqarli faktlar.",
      tts_enabled: true,
      is_active: true
    }
  });

  // Fetch AI Configs from server
  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/ai-config", { headers: getAdminHeaders() });
      if (res.ok) {
        const data = await res.json();
        if (data && Object.keys(data).length > 0) {
          if (data.GLOBAL_SETTINGS) {
            setGlobalAIEnabled(data.GLOBAL_SETTINGS.global_ai_enabled !== false);
          }
          setConfigs((prev) => ({
            ...prev,
            ...data
          }));
        }
      }
    } catch (err) {
      console.error("AI config fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGlobalToggle = async (newValue: boolean) => {
    setGlobalAIEnabled(newValue);
    try {
      await fetch("/api/admin/ai-config", {
        method: "POST",
        headers: getAdminHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          assistant_type: "GLOBAL_SETTINGS",
          global_ai_enabled: newValue
        })
      });
      showStatus(newValue ? "Tizimda AI Assistent yoqildi!" : "Tizimda AI Assistent o'chirildi!");
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveSubConfig = async (type: string) => {
    setSaving(true);
    const target = configs[type];
    try {
      const res = await fetch("/api/admin/ai-config", {
        method: "POST",
        headers: getAdminHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          assistant_type: type,
          global_ai_enabled: globalAIEnabled,
          system_prompt: target.system_prompt,
          doc_content: target.doc_content,
          doc_file_url: target.doc_file_url || "",
          tts_enabled: !!target.tts_enabled,
          is_active: target.is_active !== false
        })
      });
      if (res.ok) {
        showStatus("AI Sozlamalari muvaffaqiyatli saqlandi!");
      }
    } catch (err) {
      showStatus("Xatolik yuz berdi saqlashda!");
    } finally {
      setSaving(false);
    }
  };

  const showStatus = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(""), 4000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const textContent = event.target?.result as string;
      setConfigs((prev) => ({
        ...prev,
        [type]: {
          ...prev[type],
          doc_content: (prev[type]?.doc_content || "") + "\n\n--- YUKLANGAN HUJJAT (" + file.name + ") ---\n" + textContent,
          doc_file_url: file.name
        }
      }));
      showStatus(`"${file.name}" fayl matni AI bilimlar bazasiga qo'shildi!`);
    };
    reader.readAsText(file);
  };

  const currentConfig = configs[activeSubTab] || {
    assistant_type: activeSubTab,
    system_prompt: "",
    doc_content: "",
    is_active: true
  };

  return (
    <div className="w-full flex flex-col gap-6 animate-fade-in text-left">
      {/* Toast Notification */}
      {statusMessage && (
        <div className="fixed top-20 right-8 z-50 bg-cyan-500 text-white px-5 py-3 rounded-2xl shadow-xl font-quicksand font-bold text-xs flex items-center gap-2 animate-bounce">
          <span className="material-symbols-outlined text-base">check_circle</span>
          {statusMessage}
        </div>
      )}

      {/* Global Master AI Switch Header Card */}
      <div className={`p-6 rounded-3xl border shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all ${
        isDark ? "bg-slate-900/90 border-slate-800" : "bg-white border-slate-200"
      }`}>
        <div className="flex items-center gap-3.5">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-2xl ${
            globalAIEnabled ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" : "bg-slate-800 text-slate-500"
          }`}>
            <span className="material-symbols-outlined text-2xl">neurology</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className={`font-quicksand font-bold text-lg ${isDark ? "text-white" : "text-slate-900"}`}>
                Tizimli AI Assistent Statusi
              </h2>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                globalAIEnabled ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-red-500/20 text-red-400 border border-red-500/30"
              }`}>
                {globalAIEnabled ? "FAOL (ON)" : "O'CHIRILGAN (OFF)"}
              </span>
            </div>
            <p className={`font-inter text-xs mt-0.5 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
              Ushbu umumiy kalit orqali butun tizimdagi barcha AI assistentlarni birdaniga yoqish yoki o'chirish mumkin.
            </p>
          </div>
        </div>

        {/* ON / OFF Master Switch Toggle */}
        <button
          onClick={() => handleGlobalToggle(!globalAIEnabled)}
          className={`px-6 py-3 rounded-2xl font-quicksand font-bold text-xs flex items-center gap-2.5 transition-all shadow-md active:scale-95 ${
            globalAIEnabled
              ? "bg-emerald-500 hover:bg-emerald-400 text-white shadow-emerald-500/20 border-b-4 border-emerald-700"
              : "bg-slate-700 hover:bg-slate-600 text-white border-b-4 border-slate-900"
          }`}
        >
          <span className="material-symbols-outlined text-base">
            {globalAIEnabled ? "toggle_on" : "toggle_off"}
          </span>
          <span>{globalAIEnabled ? "AI Tizimni O'chirish" : "AI Tizimni Yoqish"}</span>
        </button>
      </div>

      {/* 3 Sub-Tabs Navigation for 3 AI Assistant Variants */}
      <div className={`grid grid-cols-1 md:grid-cols-3 gap-3 p-1.5 rounded-2xl border ${
        isDark ? "bg-slate-900/60 border-slate-800" : "bg-slate-100 border-slate-200"
      }`}>
        {[
          {
            id: "CRM_ASSISTANT",
            label: "💬 CRM Assistant",
            desc: "Mijozlar bilan muloqot va lead yig'ish",
            badge: "CRM Chat"
          },
          {
            id: "ADMIN_COPILOT",
            label: "👔 Admin Copilot",
            desc: "Tizim tahlili va rahbariyat yordamchisi",
            badge: "Copilot"
          },
          {
            id: "KIDS_ENCYCLOPEDIA",
            label: "👶 Kids Encyclopedia",
            desc: "Bolalar uchun bilimdon yordamchi + TTS",
            badge: "Ta'lim + Ovoz"
          }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`p-4 rounded-xl font-quicksand text-left transition-all flex flex-col justify-between gap-2 border ${
              activeSubTab === tab.id
                ? "bg-cyan-500/15 border-cyan-500 text-cyan-400 font-extrabold shadow-sm"
                : isDark
                ? "bg-slate-900/40 border-slate-800/60 text-slate-400 hover:text-slate-200"
                : "bg-white border-slate-200 text-slate-700 hover:text-slate-900"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm">{tab.label}</span>
              <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                activeSubTab === tab.id ? "bg-cyan-500 text-white" : isDark ? "bg-slate-800 text-slate-400" : "bg-slate-200 text-slate-600"
              }`}>
                {tab.badge}
              </span>
            </div>
            <p className="font-inter text-[11px] font-normal text-slate-400 leading-snug">
              {tab.desc}
            </p>
          </button>
        ))}
      </div>

      {/* Selected Assistant Configuration Panel */}
      <div className={`p-6 rounded-3xl border shadow-sm flex flex-col gap-5 ${
        isDark ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"
      }`}>
        <div className="flex items-center justify-between border-b pb-4 border-slate-800/60">
          <div>
            <h3 className="font-quicksand font-bold text-base flex items-center gap-2">
              <span className="material-symbols-outlined text-cyan-400 text-lg">tune</span>
              {activeSubTab === "CRM_ASSISTANT" && "CRM Assistant (Mijozlar Bilan Suhbat) Sozlamalari"}
              {activeSubTab === "ADMIN_COPILOT" && "Admin Copilot (Tizim Boshqaruvi) Sozlamalari"}
              {activeSubTab === "KIDS_ENCYCLOPEDIA" && "Kids Encyclopedia (Bolalar Ensiklopediyasi) Sozlamalari"}
            </h3>
            <p className="font-inter text-xs text-slate-400 mt-0.5">
              Sun'iy intellekt xulq-atvori, system promptlari va bilimlar bazasi (documents) ni shu yerdan tahrirlashingiz mumkin.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Assistant Specific On/Off switch */}
            <label className="flex items-center gap-2 cursor-pointer font-quicksand text-xs font-bold">
              <span>Faollik:</span>
              <input
                type="checkbox"
                checked={currentConfig.is_active !== false}
                onChange={(e) => {
                  setConfigs((prev) => ({
                    ...prev,
                    [activeSubTab]: {
                      ...prev[activeSubTab],
                      is_active: e.target.checked
                    }
                  }));
                }}
                className="w-4 h-4 accent-cyan-500 rounded"
              />
            </label>

            {/* TTS Toggle for Kids Encyclopedia */}
            {activeSubTab === "KIDS_ENCYCLOPEDIA" && (
              <label className="flex items-center gap-2 cursor-pointer font-quicksand text-xs font-bold bg-cyan-500/10 px-3 py-1.5 rounded-xl border border-cyan-500/30 text-cyan-400">
                <span className="material-symbols-outlined text-sm">volume_up</span>
                <span>TTS (Ovozli xabar):</span>
                <input
                  type="checkbox"
                  checked={!!currentConfig.tts_enabled}
                  onChange={(e) => {
                    setConfigs((prev) => ({
                      ...prev,
                      [activeSubTab]: {
                        ...prev[activeSubTab],
                        tts_enabled: e.target.checked
                      }
                    }));
                  }}
                  className="w-4 h-4 accent-cyan-500 rounded"
                />
              </label>
            )}

            <button
              onClick={() => handleSaveSubConfig(activeSubTab)}
              disabled={saving}
              className="bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-white font-quicksand font-bold text-xs py-2 px-5 rounded-xl shadow-md border-b-4 border-cyan-700 active:scale-95 active:border-b-0 active:translate-y-[2px] transition-all flex items-center gap-1.5"
            >
              {saving ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">save</span>
                  Saqlash
                </>
              )}
            </button>
          </div>
        </div>

        {/* System Prompt Field */}
        <div className="flex flex-col gap-2">
          <label className="font-quicksand font-bold text-xs text-slate-300 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-cyan-400 text-sm">terminal</span>
            System Prompt (AI Assistent uchun maxsus ko'rsatmalar matni):
          </label>
          <textarea
            rows={4}
            value={currentConfig.system_prompt}
            onChange={(e) => {
              const val = e.target.value;
              setConfigs((prev) => ({
                ...prev,
                [activeSubTab]: {
                  ...prev[activeSubTab],
                  system_prompt: val
                }
              }));
            }}
            placeholder="AI uchun qat'iy ko'rsatmalar..."
            className={`w-full p-3.5 rounded-2xl border text-xs font-mono leading-relaxed focus:outline-none focus:border-cyan-500 transition-colors ${
              isDark ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
            }`}
          />
        </div>

        {/* Prompt Doc / Knowledge Base Upload & Content Field */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="font-quicksand font-bold text-xs text-slate-300 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-cyan-400 text-sm">description</span>
              Prompt ko'rsatmalari va Bilimlar Bazasi (Hujjatlar / Text / Doc):
            </label>

            {/* File Upload Input */}
            <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-xl border border-slate-700 font-quicksand font-bold text-[11px] flex items-center gap-1.5 transition-all">
              <span className="material-symbols-outlined text-sm">upload_file</span>
              <span>Fayl yuklash (.txt, .doc, .md)</span>
              <input
                type="file"
                accept=".txt,.doc,.docx,.md"
                onChange={(e) => handleFileUpload(e, activeSubTab)}
                className="hidden"
              />
            </label>
          </div>

          <textarea
            rows={6}
            value={currentConfig.doc_content}
            onChange={(e) => {
              const val = e.target.value;
              setConfigs((prev) => ({
                ...prev,
                [activeSubTab]: {
                  ...prev[activeSubTab],
                  doc_content: val
                }
              }));
            }}
            placeholder="Bog'cha narxlari, manzili, dars tartiblari, qoidalari..."
            className={`w-full p-3.5 rounded-2xl border text-xs font-inter leading-relaxed focus:outline-none focus:border-cyan-500 transition-colors ${
              isDark ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
            }`}
          />
        </div>
      </div>
    </div>
  );
};
