const fs = require('fs');

const oldCode = fs.readFileSync("c:\\Users\\Smart Pc\\Desktop\\Bolalar bog'chasi uchun standart bot\\frontend\\src\\pages\\AdminPanel.old.tsx", 'utf-8');

let newCode = oldCode.replace('// 2. AUTHENTICATED TELEGRAM MINI APP ADMIN INTERFACE', '// 2. AUTHENTICATED DESKTOP ADMIN INTERFACE');

newCode = newCode.replace(
  '<div className={`w-full flex-1 flex flex-col font-quicksand relative overflow-hidden transition-colors duration-500 ${isDark ? "bg-slate-950 text-slate-100" : "bg-slate-100 text-slate-900"}`}>',
  '<div className={`w-full h-screen flex font-quicksand overflow-hidden transition-colors duration-500 ${isDark ? "bg-slate-950 text-slate-100" : "bg-slate-100 text-slate-900"}`}>\n      {/* DESKTOP LEFT SIDEBAR */}\n      <aside className={`w-64 flex-shrink-0 flex flex-col border-r transition-colors ${isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"}`}>\n        <div className="p-6 border-b border-inherit flex items-center gap-3">\n          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold">\n            <span className="material-symbols-outlined text-2xl">child_care</span>\n          </div>\n          <div className="flex flex-col">\n            <h1 className="text-base font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">\n              CloudCare Admin\n            </h1>\n            <span className="text-[10px] text-slate-400 font-medium">Control Panel</span>\n          </div>\n        </div>\n\n        <nav className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-none">\n          {[\n            { id: "dashboard", label: "Dashboard", icon: "dashboard", mode: "CRM", subTab: "dashboard" },\n            { id: "crm", label: "CRM Tizimi", icon: "groups", mode: "CRM", subTab: "children" },\n            { id: "cms", label: "CMS Sayt", icon: "edit_document", mode: "CMS", subTab: "home" },\n            { id: "bot", label: "Bot & AI", icon: "smart_toy", mode: "CMS", subTab: "ai" },\n            { id: "chat", label: "Xabarlar", icon: "forum", mode: "CRM", subTab: "messages" },\n          ].map((tab) => {\n            const isActive = (mode === tab.mode && ((tab.mode === "CMS" && activeCmsTab === tab.subTab) || (tab.mode === "CRM" && activeCrmTab === tab.subTab))) || (tab.id === "crm" && mode === "CRM") || (tab.id === "cms" && mode === "CMS");\n            return (\n              <button\n                key={tab.id}\n                onClick={() => {\n                  setMode(tab.mode);\n                  if (tab.mode === "CMS") setActiveCmsTab(tab.subTab);\n                  if (tab.mode === "CRM") setActiveCrmTab(tab.subTab);\n                }}\n                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-bold text-sm transition-all ${isActive ? "bg-cyan-500 text-white shadow-md" : isDark ? "text-slate-400 hover:bg-slate-800 hover:text-white" : "text-slate-600 hover:bg-slate-100"}`}\n              >\n                <span className="material-symbols-outlined text-xl">{tab.icon}</span>\n                <span>{tab.label}</span>\n              </button>\n            );\n          })}\n        </nav>\n      </aside>\n      \n      {/* MAIN CONTENT AREA */}\n      <div className="flex-1 flex flex-col relative overflow-hidden">'
);

newCode = newCode.replace(
  /<header className={`h-14 w-full flex-shrink-0 flex items-center justify-between px-4 z-30 border-b backdrop-blur-md.*?<\/header>/s,
  `<header className={\`h-14 w-full flex-shrink-0 flex items-center justify-between px-6 z-30 border-b \${isDark ? "bg-slate-950/90 border-slate-800" : "bg-white/90 border-slate-200"}\`}>\n        <div className="font-bold text-sm text-slate-400">Asosiy Boshqaruv Oynasi</div>\n        <div className="flex items-center gap-4">\n          <button onClick={toggleTheme} className="p-2 rounded-xl bg-slate-800 text-amber-400 hover:bg-slate-700 flex items-center justify-center">\n            <span className="material-symbols-outlined text-sm">{isDark ? "light_mode" : "dark_mode"}</span>\n          </button>\n          <button onClick={handleAdminLogout} className="px-3 py-1.5 rounded-xl bg-red-500/20 text-red-400 font-bold text-xs flex items-center gap-1.5 hover:bg-red-500/30">\n            <span className="material-symbols-outlined text-sm">logout</span> Chiqish\n          </button>\n        </div>\n      </header>`
);

// We need to remove the whole bottom nav AND the comment before it.
newCode = newCode.replace(
  /{\/\* FIXED TELEGRAM MINI APP BOTTOM CONTROL NAVIGATION BAR \*\/}[\s\S]*?<nav className={`fixed bottom-0 left-0 w-full.*?<\/nav>/s,
  ''
);

newCode = newCode.replace(
  /<\/main>[\s\S]*?<\/div>[\s\S]*?\);[\s\S]*?};/s,
  '</main>\n      </div>\n    </div>\n  );\n};'
);

fs.writeFileSync("c:\\Users\\Smart Pc\\Desktop\\Bolalar bog'chasi uchun standart bot\\frontend\\src\\pages\\AdminPanel.tsx", newCode);
console.log("Transformed into desktop monolithic!");
