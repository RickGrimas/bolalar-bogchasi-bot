import React, { useState, useEffect } from "react";
import { getAdminHeaders } from "../utils/api";

export interface AILead {
  id: string;
  telegram_id?: string;
  name: string;
  phone_number: string;
  child_age?: string;
  notes?: string;
  status: "NEW" | "CONTACTED" | "CONVERTED" | "ARCHIVED";
  created_at: string;
}

interface Props {
  isDark: boolean;
}

export const AILeadsSection: React.FC<Props> = ({ isDark }) => {
  const [leads, setLeads] = useState<AILead[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/ai-leads", { headers: getAdminHeaders() });
      if (res.ok) {
        const data = await res.json();
        setLeads(data || []);
      }
    } catch (err) {
      console.error("Fetch AI leads error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch("/api/admin/ai-leads/status", {
        method: "PUT",
        headers: getAdminHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ id, status: newStatus })
      });
      if (res.ok) {
        setLeads((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status: newStatus as any } : item))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredLeads = leads.filter((item) => {
    const matchesSearch =
      (item.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.phone_number || "").includes(searchTerm) ||
      (item.notes || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const countNew = leads.filter((l) => l.status === "NEW").length;
  const countContacted = leads.filter((l) => l.status === "CONTACTED").length;
  const countConverted = leads.filter((l) => l.status === "CONVERTED").length;

  return (
    <div className="w-full flex flex-col gap-6 animate-fade-in text-left">
      {/* Header & Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className={`p-4 rounded-2xl border flex items-center gap-3.5 ${
          isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"
        }`}>
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-xl">contacts</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Jami AI Leadlar</span>
            <h4 className="font-quicksand font-bold text-xl text-cyan-400">{leads.length} ta</h4>
          </div>
        </div>

        <div className={`p-4 rounded-2xl border flex items-center gap-3.5 ${
          isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"
        }`}>
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-xl">mark_chat_unread</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Yangi (Ko'rilmagan)</span>
            <h4 className="font-quicksand font-bold text-xl text-amber-400">{countNew} ta</h4>
          </div>
        </div>

        <div className={`p-4 rounded-2xl border flex items-center gap-3.5 ${
          isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"
        }`}>
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-xl">phone_in_talk</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Aloqaga chiqilgan</span>
            <h4 className="font-quicksand font-bold text-xl text-indigo-400">{countContacted} ta</h4>
          </div>
        </div>

        <div className={`p-4 rounded-2xl border flex items-center gap-3.5 ${
          isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"
        }`}>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-xl">verified</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mijozga aylangan</span>
            <h4 className="font-quicksand font-bold text-xl text-emerald-400">{countConverted} ta</h4>
          </div>
        </div>
      </div>

      {/* Action Controls & Search Filter Bar */}
      <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
        isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
      }`}>
        <div className="relative flex-1 w-full">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-lg">search</span>
          <input
            type="text"
            placeholder="Ism, telefon raqam yoki izoh bo'yicha qidiruv..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-9 pr-4 py-2 rounded-xl text-xs focus:outline-none focus:border-cyan-500 border ${
              isDark ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
            }`}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`px-3 py-2 rounded-xl text-xs font-quicksand font-bold focus:outline-none border ${
              isDark ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
            }`}
          >
            <option value="ALL">Barcha statuslar</option>
            <option value="NEW">Yangi (NEW)</option>
            <option value="CONTACTED">Bog'lanilgan (CONTACTED)</option>
            <option value="CONVERTED">Mijoz bo'lgan (CONVERTED)</option>
            <option value="ARCHIVED">Arxivlangan (ARCHIVED)</option>
          </select>

          <button
            onClick={fetchLeads}
            disabled={loading}
            className="p-2 bg-cyan-500 hover:bg-cyan-400 text-white rounded-xl font-bold shadow-md transition-all active:scale-95"
            title="Yangilash"
          >
            <span className="material-symbols-outlined text-lg">sync</span>
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className={`rounded-3xl border overflow-hidden shadow-sm ${
        isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-inter border-collapse">
            <thead>
              <tr className={`border-b text-[10px] uppercase font-bold tracking-wider ${
                isDark ? "bg-slate-950/60 border-slate-800 text-slate-400" : "bg-slate-100 border-slate-200 text-slate-500"
              }`}>
                <th className="p-4">F.I.Sh / Mijoz</th>
                <th className="p-4">Telefon Raqami</th>
                <th className="p-4">Farzand Yoshi</th>
                <th className="p-4">AI Chat Xulosasi / Izoh</th>
                <th className="p-4">Sana</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? "divide-slate-800/60" : "divide-slate-200"}`}>
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 font-quicksand font-bold">
                    {loading ? "Ma'lumotlar yuklanmoqda..." : "Hech qanday AI Lead topilmadi."}
                  </td>
                </tr>
              ) : (
                filteredLeads.map((item) => (
                  <tr key={item.id} className={`transition-colors ${
                    isDark ? "hover:bg-slate-800/40 text-slate-200" : "hover:bg-slate-50 text-slate-800"
                  }`}>
                    <td className="p-4 font-bold font-quicksand text-sm flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs font-bold">
                        {item.name.charAt(0).toUpperCase()}
                      </span>
                      <span>{item.name}</span>
                    </td>
                    <td className="p-4 font-mono text-cyan-400 font-bold">
                      {item.phone_number || "Kiritilmagan"}
                    </td>
                    <td className="p-4 font-medium">{item.child_age || "-"}</td>
                    <td className="p-4 max-w-xs truncate text-slate-400" title={item.notes}>
                      {item.notes || "-"}
                    </td>
                    <td className="p-4 text-[11px] text-slate-400">
                      {new Date(item.created_at).toLocaleString("uz-UZ")}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                        item.status === "NEW"
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          : item.status === "CONTACTED"
                          ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                          : item.status === "CONVERTED"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-slate-500/20 text-slate-400 border border-slate-500/30"
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <select
                        value={item.status}
                        onChange={(e) => handleStatusChange(item.id, e.target.value)}
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-bold focus:outline-none border ${
                          isDark ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                        }`}
                      >
                        <option value="NEW">Yangi</option>
                        <option value="CONTACTED">Bog'lanildi</option>
                        <option value="CONVERTED">Mijoz Bo'ldi</option>
                        <option value="ARCHIVED">Arxivlash</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
