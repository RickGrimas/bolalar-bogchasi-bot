import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { supabase } from "../supabaseClient";
import { toast } from "react-hot-toast";

type Mode = "CMS" | "CRM";

export const AdminPanel: React.FC = () => {
  const { isDark, toggleTheme, lang, setLang, t } = useApp();

  // Auth State
  const [adminUser, setAdminUser] = useState<any>({ email: "admin@bogcha.uz", role: "ADMIN" });
  const [adminEmail, setAdminEmail] = useState("admin@bogcha.uz");
  const [adminPassword, setAdminPassword] = useState("admin");
  const [loggingIn, setLoggingIn] = useState(false);

  // Settings Gear Modal State
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showSimulator, setShowSimulator] = useState(false);

  // Core App Modes & Tabs State
  const [mode, setMode] = useState<Mode>("CRM");
  const [activeCmsTab, setActiveCmsTab] = useState<string>("home");
  const [activeCrmTab, setActiveCrmTab] = useState<string>("children");

  // CRM Demo Data State
  const [childrenList, setChildrenList] = useState<any[]>([
    { id: "1", first_name: "Aliya", last_name: "Alieva", group: "Kamalak", parent: "Ali Ota", phone: "+998 90 123 45 67" },
    { id: "2", first_name: "Valisher", last_name: "Valiev", group: "Kamalak", parent: "Vali Ota", phone: "+998 90 234 56 78" },
    { id: "3", first_name: "Jasur", last_name: "Karimov", group: "Yulduzcha", parent: "Zebo Karimova", phone: "+998 91 345 67 89" },
    { id: "4", first_name: "Madina", last_name: "Soliho'jaeva", group: "Yulduzcha", parent: "Sardor Solihov", phone: "+998 93 456 78 90" },
  ]);

  const [leadsList, setLeadsList] = useState<any[]>([
    { id: "lead-1", parent_name: "Rustam Alimov", phone: "+998 90 123 45 67", child: "Jasur", status: "YANGI", notes: "Yozgi guruhga yozilmoqchi" },
    { id: "lead-2", parent_name: "Nigora Umarova", phone: "+998 93 987 65 43", child: "Madina", status: "BOG'LANILDI", notes: "Qo'shimcha ingliz tili so'ramoqda" },
    { id: "lead-3", parent_name: "Bobur Tursunov", phone: "+998 97 555 44 33", child: "Aziz", status: "GURUHDA", notes: "Sinaov kunidan o'tdi" },
  ]);

  const [groupsList, setGroupsList] = useState<any[]>([
    { id: "g1", name: "Kamalak guruhi", age: "3-4 yosh", count: 22, teacher: "Dilnoza Opa" },
    { id: "g2", name: "Yulduzcha guruhi", age: "4-5 yosh", count: 18, teacher: "Malika Opa" },
    { id: "g3", name: "Quyoshcha guruhi", age: "5-6 yosh", count: 25, teacher: "Shahnoza Opa" },
  ]);

  const [announcements, setAnnouncements] = useState<any[]>([
    { id: "1", title: "Ertaga bayram tadbiri!", text: "Bolalarni bayramona kiyimda olib keling." },
    { id: "2", title: "Tibbiy ko'rik", text: "Juma kuni bog'chamizda shifokor ko'rigi bo'ladi." },
  ]);

  const [camerasList, setCamerasList] = useState<any[]>([
    { id: "cam-1", name: "Kamalak xonasi", stream: "HD Stream 1 (Online)", status: "Active" },
    { id: "cam-2", name: "O'yin maydonchasi", stream: "HD Stream 2 (Online)", status: "Active" },
    { id: "cam-3", name: "Oshxona zal", stream: "HD Stream 3 (Online)", status: "Active" },
  ]);

  // Form input states
  const [newAnnTitle, setNewAnnTitle] = useState("");
  const [newAnnText, setNewAnnText] = useState("");
  const [newChildFirstName, setNewChildFirstName] = useState("");
  const [newChildLastName, setNewChildLastName] = useState("");
  const [newChildGroup, setNewChildGroup] = useState("Kamalak");
  const [newChildParent, setNewChildParent] = useState("");
  const [msgSubject, setMsgSubject] = useState("");
  const [msgText, setMsgText] = useState("");
  const [aiPromptText, setAiPromptText] = useState("Siz Bolalar Bog'chasi uchun aqlli CRM assistentisiz. Ota-onalarga sharoitlar va narxlar haqida javob bering.");

  // Handle Admin Login
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingIn(true);
    setTimeout(() => {
      if (adminEmail && adminPassword) {
        setAdminUser({ email: adminEmail, role: "ADMIN" });
        toast.success("Admin panelga muvaffaqiyatli kirildi!");
      } else {
        toast.error("Email va parolni kiriting.");
      }
      setLoggingIn(false);
    }, 500);
  };

  const handleAdminLogout = () => {
    setAdminUser(null);
    setShowSettingsModal(false);
    toast.success("Admin panelidan chiqindi.");
  };

  const handleAddAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnTitle || !newAnnText) return;
    setAnnouncements([{ id: Date.now().toString(), title: newAnnTitle, text: newAnnText }, ...announcements]);
    setNewAnnTitle("");
    setNewAnnText("");
    toast.success("Yangi e'lon e'lon qilindi!");
  };

  const handleAddChild = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChildFirstName || !newChildLastName) return;
    const newChild = {
      id: Date.now().toString(),
      first_name: newChildFirstName,
      last_name: newChildLastName,
      group: newChildGroup,
      parent: newChildParent || "Ota-onasi",
      phone: "+998 90 000 00 00",
    };
    setChildrenList([newChild, ...childrenList]);
    setNewChildFirstName("");
    setNewChildLastName("");
    setNewChildParent("");
    toast.success("Yangi bola bazaga qo'shildi!");
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgText) return;
    setMsgSubject("");
    setMsgText("");
    toast.success("Ommaviy xabarnoma barcha ota-onalarga yuborildi!");
  };

  // 1. UNAUTHENTICATED ADMIN LOGIN CARD (TMA Style)
  if (!adminUser) {
    return (
      <div className="w-full flex-1 flex items-center justify-center p-4 bg-slate-950 text-slate-100 font-quicksand">
        <form
          onSubmit={handleAdminLogin}
          className="w-full max-w-xs rounded-3xl bg-slate-900/90 border border-cyan-500/30 shadow-2xl p-6 flex flex-col gap-4 text-left backdrop-blur-md relative overflow-hidden"
        >
          <div className="absolute -top-10 -left-10 w-28 h-28 rounded-full bg-cyan-500/10 blur-2xl pointer-events-none" />
          
          <div className="flex flex-col items-center text-center mt-1 mb-1">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 mb-2 shadow-lg">
              <span className="material-symbols-outlined text-3xl font-bold">admin_panel_settings</span>
            </div>
            <h2 className="font-bold text-lg text-white">Admin Login Panel</h2>
            <p className="text-[10px] text-slate-400 mt-0.5">CloudCare Kids Boshqaruv Markazi</p>
          </div>

          <div className="flex flex-col gap-1 text-xs">
            <label className="text-[10px] text-slate-400 font-bold">Admin Email</label>
            <input
              type="email"
              required
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs focus:outline-none focus:border-cyan-500"
              placeholder="admin@bogcha.uz"
            />
          </div>

          <div className="flex flex-col gap-1 text-xs">
            <label className="text-[10px] text-slate-400 font-bold">Parol</label>
            <input
              type="password"
              required
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs focus:outline-none focus:border-cyan-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loggingIn}
            className="w-full mt-2 py-3 bg-cyan-500 hover:bg-cyan-400 text-white font-bold text-xs rounded-xl shadow-lg border-b-4 border-cyan-700 active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            {loggingIn ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span className="material-symbols-outlined text-sm">login</span>
                Admin Panelga Kirish
              </>
            )}
          </button>
        </form>
      </div>
    );
  }

  // 2. AUTHENTICATED TELEGRAM MINI APP ADMIN INTERFACE
  return (
    <div className={`w-full flex-1 flex flex-col font-quicksand relative overflow-hidden transition-colors duration-500 ${isDark ? "bg-slate-950 text-slate-100" : "bg-slate-100 text-slate-900"}`}>
      
      {/* TOP HEADER BAR WITH TITLE, MODE BADGE & SETTINGS GEAR POPOVER */}
      <header className={`h-14 w-full flex-shrink-0 flex items-center justify-between px-4 z-30 border-b backdrop-blur-md ${
        isDark ? "bg-slate-950/90 border-slate-800 text-white" : "bg-white/90 border-slate-200 text-slate-900"
      }`}>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-cyan-400 text-xl font-bold">child_care</span>
          <span className="font-bold text-sm">CloudCare Admin</span>
          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider text-white ${
            mode === "CMS" ? "bg-cyan-500" : "bg-indigo-500"
          }`}>
            {mode}
          </span>
        </div>

        {/* Top Right Controls (Settings Gear ⚙️ Popover Dropdown) */}
        <div className="flex items-center gap-2 relative">
          <button
            onClick={() => setShowSettingsModal((prev) => !prev)}
            className={`p-2 rounded-xl border transition-all flex items-center justify-center ${
              showSettingsModal 
                ? "border-cyan-500 bg-cyan-500/10 text-cyan-400" 
                : isDark ? "border-slate-800 text-slate-300 hover:bg-slate-900" : "border-slate-200 text-slate-700 hover:bg-slate-100"
            }`}
            title="Sozlamalar"
          >
            <span className="material-symbols-outlined text-lg">settings</span>
          </button>

          {/* SETTINGS POPOVER DROPDOWN MENU */}
          {showSettingsModal && (
            <div className={`absolute right-0 top-12 w-72 rounded-2xl shadow-2xl p-4 flex flex-col gap-3.5 text-left z-50 backdrop-blur-md border ${
              isDark ? "bg-slate-950/95 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900 shadow-2xl"
            }`}>
              <div className="flex items-center justify-between border-b pb-2 border-inherit">
                <span className="font-bold text-xs flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-cyan-400 text-base">settings</span>
                  Admin Sozlamalari
                </span>
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-white"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>

              {/* Mode Switcher (CMS vs CRM) */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Rejimni Tanlang</label>
                <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800">
                  <button
                    onClick={() => { setMode("CMS"); setShowSettingsModal(false); toast.success("CMS Rejimi yoqildi"); }}
                    className={`py-1.5 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-1 ${
                      mode === "CMS" ? "bg-cyan-500 text-white shadow" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    🌐 CMS
                  </button>
                  <button
                    onClick={() => { setMode("CRM"); setShowSettingsModal(false); toast.success("CRM Rejimi yoqildi"); }}
                    className={`py-1.5 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-1 ${
                      mode === "CRM" ? "bg-indigo-500 text-white shadow" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    🔒 CRM
                  </button>
                </div>
              </div>

              {/* Language Switcher */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tizim Tili</label>
                <div className="grid grid-cols-3 gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800">
                  {(["uz", "ru", "en"] as const).map((l) => (
                    <button
                      key={l}
                      onClick={() => { setLang(l); toast.success(`Til ${l.toUpperCase()} ga o'zgartirildi`); }}
                      className={`py-1 rounded-lg font-bold text-[10px] uppercase transition-all ${
                        lang === l ? "bg-cyan-500 text-white" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme Selector */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Mavzu (Theme)</label>
                <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800">
                  <button
                    onClick={() => { if (isDark) toggleTheme(); }}
                    className={`py-1.5 rounded-lg font-bold text-xs flex items-center justify-center gap-1 ${!isDark ? "bg-amber-500/20 text-amber-400 border border-amber-500/40" : "text-slate-400"}`}
                  >
                    <span className="material-symbols-outlined text-sm">light_mode</span> Kunduzgi
                  </button>
                  <button
                    onClick={() => { if (!isDark) toggleTheme(); }}
                    className={`py-1.5 rounded-lg font-bold text-xs flex items-center justify-center gap-1 ${isDark ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40" : "text-slate-400"}`}
                  >
                    <span className="material-symbols-outlined text-sm">dark_mode</span> Tungi
                  </button>
                </div>
              </div>

              {/* Logout Action */}
              <button
                onClick={handleAdminLogout}
                className="w-full mt-1 py-2 px-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-bold text-xs rounded-xl border border-red-500/30 flex items-center justify-center gap-1.5 transition-all"
              >
                <span className="material-symbols-outlined text-sm">logout</span>
                Admin Seansidan Chiqish
              </button>
            </div>
          )}
        </div>
      </header>

      {/* SINGLE COLUMN MOBILE CONTENT AREA */}
      <main className="flex-1 w-full overflow-y-auto px-4 py-4 pb-24 space-y-4 text-left scrollbar-none">
        
        {/* MODE 1: CMS (Content Management System) */}
        {mode === "CMS" && (
          <div className="flex flex-col gap-4 animate-fade-in">
            {/* Horizontal Pill Scroll Sub-Tab Selector for CMS */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none w-full border-b border-slate-800/60">
              {[
                { id: "home", label: t("admin.cms.home"), icon: "home" },
                { id: "life", label: t("admin.cms.life"), icon: "sports_esports" },
                { id: "about", label: t("admin.cms.about"), icon: "diversity_3" },
                { id: "ai", label: t("admin.cms.ai"), icon: "neurology" },
                { id: "apply", label: t("admin.cms.apply"), icon: "edit_document" },
                { id: "bot_settings", label: "Bot Sozlamalari", icon: "settings_suggest" },
                { id: "admins", label: "Adminlar", icon: "admin_panel_settings" },
                { id: "help", label: t("admin.cms.help"), icon: "help" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveCmsTab(tab.id)}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs whitespace-nowrap flex items-center gap-1.5 transition-all ${
                    activeCmsTab === tab.id
                      ? "bg-cyan-500 text-white shadow-md"
                      : isDark ? "bg-slate-900 text-slate-400 border border-slate-800" : "bg-white text-slate-600 border border-slate-200"
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* CMS Home Editor */}
            {activeCmsTab === "home" && (
              <div className={`p-4 rounded-2xl border flex flex-col gap-3.5 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
                <h4 className="font-bold text-xs text-cyan-500 border-b border-inherit pb-2">Asosiy Sahifa Matnlarini Tahrirlash</h4>
                <div className="flex flex-col gap-1 text-xs">
                  <label className="text-[10px] text-slate-400 font-bold">Bosh Sarlavha ({lang.toUpperCase()})</label>
                  <input
                    type="text"
                    defaultValue={defaultHomeData.uz.title}
                    className="px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div className="flex flex-col gap-1 text-xs">
                  <label className="text-[10px] text-slate-400 font-bold">Subtitr / Izoh ({lang.toUpperCase()})</label>
                  <textarea
                    defaultValue={defaultHomeData.uz.subtitle}
                    className="px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs focus:outline-none focus:border-cyan-500 h-20 resize-none"
                  />
                </div>
                <button
                  onClick={() => toast.success("Asosiy sahifa matnlari saqlandi!")}
                  className="py-2.5 bg-cyan-500 hover:bg-cyan-400 text-white font-bold text-xs rounded-xl shadow-md border-b-2 border-cyan-700 active:scale-95 transition-all"
                >
                  O'zgarishlarni Saqlash
                </button>
              </div>
            )}

            {/* CMS AI Prompts Editor */}
            {activeCmsTab === "ai" && (
              <div className={`p-4 rounded-2xl border flex flex-col gap-3.5 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
                <h4 className="font-bold text-xs text-cyan-500 border-b border-inherit pb-2">AI Copilot Prompt Sozlamalari</h4>
                <div className="flex flex-col gap-1 text-xs">
                  <label className="text-[10px] text-slate-400 font-bold">Tizim AI Prompt Qoidalari</label>
                  <textarea
                    value={aiPromptText}
                    onChange={(e) => setAiPromptText(e.target.value)}
                    className="px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs focus:outline-none focus:border-cyan-500 h-28 resize-none"
                  />
                </div>
                <button
                  onClick={() => toast.success("AI Prompt saqlandi!")}
                  className="py-2.5 bg-cyan-500 hover:bg-cyan-400 text-white font-bold text-xs rounded-xl shadow-md border-b-2 border-cyan-700 active:scale-95 transition-all"
                >
                  Promptni Saqlash
                </button>
              </div>
            )}

            {/* Fallback for other CMS sub-tabs */}
            {!["home", "ai"].includes(activeCmsTab) && (
              <div className={`p-4 rounded-2xl border flex flex-col gap-3.5 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
                <h4 className="font-bold text-xs text-cyan-500 border-b border-inherit pb-2">{activeCmsTab.toUpperCase()} Bo'limi Tahriri</h4>
                <p className="text-xs text-slate-400">Ushbu bo'lim matnlari va rasmlarini mobil formatda tahrirlashingiz mumkin.</p>
                <button
                  onClick={() => toast.success("Ma'lumotlar saqlandi!")}
                  className="py-2.5 bg-cyan-500 hover:bg-cyan-400 text-white font-bold text-xs rounded-xl shadow-md border-b-2 border-cyan-700 active:scale-95 transition-all"
                >
                  Saqlash
                </button>
              </div>
            )}
          </div>
        )}

        {/* MODE 2: CRM (Customer Relationship Management & Database) */}
        {mode === "CRM" && (
          <div className="flex flex-col gap-4 animate-fade-in">
            {/* Horizontal Pill Scroll Sub-Tab Selector for CRM */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none w-full border-b border-slate-800/60">
              {[
                { id: "children", label: t("admin.crm.children"), icon: "boy" },
                { id: "leads", label: "🤖 AI Leadlar", icon: "contacts" },
                { id: "groups", label: t("admin.crm.groups"), icon: "group_work" },
                { id: "messages", label: t("admin.crm.messages"), icon: "campaign" },
                { id: "dashboard", label: t("admin.crm.dashboard"), icon: "dashboard" },
                { id: "timeline", label: t("admin.crm.timeline"), icon: "history" },
                { id: "cameras", label: t("admin.crm.cameras"), icon: "videocam" },
                { id: "tasks", label: t("admin.crm.tasks"), icon: "task" },
                { id: "profile", label: t("admin.crm.profile"), icon: "person" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveCrmTab(tab.id)}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs whitespace-nowrap flex items-center gap-1.5 transition-all ${
                    activeCrmTab === tab.id
                      ? "bg-indigo-500 text-white shadow-md"
                      : isDark ? "bg-slate-900 text-slate-400 border border-slate-800" : "bg-white text-slate-600 border border-slate-200"
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* CRM Children Database Sub-tab */}
            {activeCrmTab === "children" && (
              <div className="flex flex-col gap-3">
                {/* Form to Register New Child */}
                <div className={`p-4 rounded-2xl border flex flex-col gap-3 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
                  <h4 className="font-bold text-xs text-indigo-400 border-b border-inherit pb-2 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">person_add</span>
                    Yangi Bola va Ota-onani Ro'yxatdan O'tkazish
                  </h4>
                  <form onSubmit={handleAddChild} className="flex flex-col gap-2.5 text-xs">
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Bola Ismi *"
                        required
                        value={newChildFirstName}
                        onChange={(e) => setNewChildFirstName(e.target.value)}
                        className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                      <input
                        type="text"
                        placeholder="Bola Familiyasi *"
                        required
                        value={newChildLastName}
                        onChange={(e) => setNewChildLastName(e.target.value)}
                        className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={newChildGroup}
                        onChange={(e) => setNewChildGroup(e.target.value)}
                        className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                      >
                        <option value="Kamalak">Kamalak guruhi</option>
                        <option value="Yulduzcha">Yulduzcha guruhi</option>
                        <option value="Quyoshcha">Quyoshcha guruhi</option>
                      </select>
                      <input
                        type="text"
                        placeholder="Ota-ona F.I.Sh."
                        value={newChildParent}
                        onChange={(e) => setNewChildParent(e.target.value)}
                        className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <button
                      type="submit"
                      className="py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs rounded-xl shadow border-b-2 border-indigo-700 active:scale-95 transition-all mt-1"
                    >
                      Bolani Bazaga Qo'shish
                    </button>
                  </form>
                </div>

                {/* Children List Cards */}
                <div className={`p-4 rounded-2xl border flex flex-col gap-3 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
                  <h4 className="font-bold text-xs text-slate-300 border-b border-inherit pb-2">Bolalar Ro'yxati ({childrenList.length} nafar)</h4>
                  <div className="flex flex-col gap-2">
                    {childrenList.map((child) => (
                      <div key={child.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs border border-indigo-500/30">
                            {child.first_name[0]}
                          </div>
                          <div className="flex flex-col text-xs">
                            <span className="font-bold text-white">{child.first_name} {child.last_name}</span>
                            <span className="text-[10px] text-slate-400">Guruhi: {child.group} | Ota-onasi: {child.parent}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setChildrenList(childrenList.filter(c => c.id !== child.id));
                            toast.success("Bola bazadan o'chirildi");
                          }}
                          className="text-red-400 hover:text-red-300 p-1"
                        >
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* CRM AI Leads Sub-tab */}
            {activeCrmTab === "leads" && (
              <div className={`p-4 rounded-2xl border flex flex-col gap-3 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
                <h4 className="font-bold text-xs text-amber-400 border-b border-inherit pb-2 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">contacts</span>
                  Potensial Ota-onalar (AI Leads Pipeline)
                </h4>
                <div className="flex flex-col gap-2">
                  {leadsList.map((lead) => (
                    <div key={lead.id} className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex flex-col gap-1.5 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-white">{lead.parent_name}</span>
                        <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[9px] px-2 py-0.5 rounded font-bold">
                          {lead.status}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-300">Telefon: {lead.phone}</span>
                      <span className="text-[10px] text-slate-400">Farzand: {lead.child} | Izoh: {lead.notes}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CRM Groups Sub-tab */}
            {activeCrmTab === "groups" && (
              <div className={`p-4 rounded-2xl border flex flex-col gap-3 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
                <h4 className="font-bold text-xs text-indigo-400 border-b border-inherit pb-2">Guruhlar Boshqaruvi</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {groupsList.map((g) => (
                    <div key={g.id} className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex flex-col gap-1">
                      <span className="font-bold text-xs text-indigo-400">{g.name}</span>
                      <span className="text-[10px] text-slate-400">Yoshi: {g.age} | Tarbiyachi: {g.teacher}</span>
                      <span className="text-[10px] text-cyan-400 font-bold">Bolalar soni: {g.count} nafar</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CRM Messages Sub-tab */}
            {activeCrmTab === "messages" && (
              <div className={`p-4 rounded-2xl border flex flex-col gap-3 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
                <h4 className="font-bold text-xs text-indigo-400 border-b border-inherit pb-2 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">campaign</span>
                  Ota-onalarga Ommaviy Bildirishnoma Yuborish
                </h4>
                <form onSubmit={handleSendBroadcast} className="flex flex-col gap-2.5 text-xs">
                  <input
                    type="text"
                    placeholder="Xabar Mavzusi"
                    value={msgSubject}
                    onChange={(e) => setMsgSubject(e.target.value)}
                    className="px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                  <textarea
                    placeholder="Xabar matni..."
                    required
                    value={msgText}
                    onChange={(e) => setMsgText(e.target.value)}
                    className="px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 h-24 resize-none"
                  />
                  <button
                    type="submit"
                    className="py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs rounded-xl shadow border-b-2 border-indigo-700 active:scale-95 transition-all"
                  >
                    Ommaviy Yuborish
                  </button>
                </form>
              </div>
            )}

            {/* CRM Dashboard Sub-tab */}
            {activeCrmTab === "dashboard" && (
              <div className="flex flex-col gap-3">
                <div className={`p-4 rounded-2xl border flex flex-col gap-3 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
                  <h4 className="font-bold text-xs text-indigo-400 border-b border-inherit pb-2">Boshqaruv Statistikasi</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex flex-col">
                      <span className="text-[10px] text-slate-400 font-bold">Bugungi Davomat</span>
                      <span className="text-lg font-bold text-emerald-400">94%</span>
                    </div>
                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex flex-col">
                      <span className="text-[10px] text-slate-400 font-bold">To'lovlar</span>
                      <span className="text-lg font-bold text-cyan-400">88% Bajarildi</span>
                    </div>
                  </div>
                </div>

                {/* E'lonlar qo'shish */}
                <div className={`p-4 rounded-2xl border flex flex-col gap-3 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
                  <h4 className="font-bold text-xs text-indigo-400 border-b border-inherit pb-2">Yangi E'lon Qo'shish</h4>
                  <form onSubmit={handleAddAnnouncement} className="flex flex-col gap-2 text-xs">
                    <input
                      type="text"
                      placeholder="E'lon Sarlavhasi"
                      required
                      value={newAnnTitle}
                      onChange={(e) => setNewAnnTitle(e.target.value)}
                      className="px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                    <textarea
                      placeholder="E'lon matni..."
                      required
                      value={newAnnText}
                      onChange={(e) => setNewAnnText(e.target.value)}
                      className="px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 h-16 resize-none"
                    />
                    <button
                      type="submit"
                      className="py-2 bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs rounded-xl shadow border-b-2 border-indigo-700 active:scale-95 transition-all"
                    >
                      E'lonni Chaqirish
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* CRM Cameras Sub-tab */}
            {activeCrmTab === "cameras" && (
              <div className={`p-4 rounded-2xl border flex flex-col gap-3 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
                <h4 className="font-bold text-xs text-indigo-400 border-b border-inherit pb-2 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">videocam</span>
                  HD Kameralar Oqimi Boshqaruvi
                </h4>
                <div className="flex flex-col gap-2">
                  {camerasList.map((cam) => (
                    <div key={cam.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex justify-between items-center text-xs">
                      <div className="flex flex-col">
                        <span className="font-bold text-white">{cam.name}</span>
                        <span className="text-[10px] text-emerald-400 font-bold">{cam.stream}</span>
                      </div>
                      <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] px-2 py-0.5 rounded font-bold">
                        {cam.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Fallback for remaining CRM sub-tabs */}
            {!["children", "leads", "groups", "messages", "dashboard", "cameras"].includes(activeCrmTab) && (
              <div className={`p-4 rounded-2xl border flex flex-col gap-3 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
                <h4 className="font-bold text-xs text-indigo-400 border-b border-inherit pb-2">{activeCrmTab.toUpperCase()} CRM Sahifasi</h4>
                <p className="text-xs text-slate-400">Ushbu bo'lim ma'lumotlarini mobil formatda kuzatishingiz va boshqarishingiz mumkin.</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* FIXED TELEGRAM MINI APP BOTTOM CONTROL NAVIGATION BAR */}
      <nav className={`fixed bottom-0 left-0 w-full h-[68px] z-40 border-t backdrop-blur-md flex items-center justify-around px-1 transition-colors duration-300 ${
        isDark ? "bg-slate-950/95 border-slate-800 text-slate-100" : "bg-white/95 border-slate-200 text-slate-900 shadow-lg"
      }`}>
        {[
          { id: "dashboard", label: "Dashboard", icon: "dashboard", mode: "CRM", subTab: "dashboard" },
          { id: "crm", label: "CRM Tizimi", icon: "groups", mode: "CRM", subTab: "children" },
          { id: "cms", label: "CMS Sayt", icon: "edit_document", mode: "CMS", subTab: "home" },
          { id: "bot", label: "Bot & AI", icon: "smart_toy", mode: "CMS", subTab: "ai" },
          { id: "chat", label: "Xabarlar", icon: "forum", mode: "CRM", subTab: "messages" },
        ].map((tab) => {
          const isActive = (mode === tab.mode && ((tab.mode === "CMS" && activeCmsTab === tab.subTab) || (tab.mode === "CRM" && activeCrmTab === tab.subTab))) || (tab.id === "crm" && mode === "CRM") || (tab.id === "cms" && mode === "CMS");
          return (
            <button
              key={tab.id}
              onClick={() => {
                setMode(tab.mode as any);
                if (tab.mode === "CMS") setActiveCmsTab(tab.subTab);
                if (tab.mode === "CRM") setActiveCrmTab(tab.subTab);
              }}
              className="flex flex-col items-center justify-center flex-1 h-full py-1 text-center group active:scale-95 transition-all"
            >
              <div
                className={`flex items-center justify-center w-9 h-7 rounded-full mb-0.5 transition-all ${
                  isActive ? "bg-cyan-500 text-white shadow-md font-bold" : "text-slate-400 hover:bg-slate-800/50"
                }`}
              >
                <span className="material-symbols-outlined text-[19px]">{tab.icon}</span>
              </div>
              <span
                className={`font-quicksand text-[8px] font-bold tracking-tight ${
                  isActive ? "text-cyan-400 font-bold" : "text-slate-400"
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default AdminPanel;
