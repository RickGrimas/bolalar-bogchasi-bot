import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { BroadcastPage } from './BroadcastPage';
import { LiveChatPage } from './LiveChatPage';

interface BotMenu {
  id?: string;
  title: string;
  action_type: 'TEXT' | 'URL' | 'FILE' | 'AI_APPLICATION' | 'AI_CRM';
  content_value: string;
  location: 'MAIN_CHAT' | 'BROADCAST';
  order_index: number;
  is_active: boolean;
}

interface ApplicationQuestion {
  id?: string;
  question_text: string;
  order_index: number;
  is_active: boolean;
}

export const BotSettingsPage: React.FC = () => {
  // Main section tab
  const [mainSection, setMainSection] = useState<'menus_and_questions' | 'broadcast' | 'live_chat'>('menus_and_questions');
  
  // Sub-tab inside menus_and_questions
  const [activeSubTab, setActiveSubTab] = useState<'menus' | 'questions'>('menus');

  // Bot Menus State
  const [menus, setMenus] = useState<BotMenu[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newActionType, setNewActionType] = useState<'TEXT' | 'URL' | 'FILE' | 'AI_APPLICATION' | 'AI_CRM'>('TEXT');
  const [newContentValue, setNewContentValue] = useState('');

  // Editing Modal State
  const [editingMenu, setEditingMenu] = useState<BotMenu | null>(null);

  // Questions State
  const [questions, setQuestions] = useState<ApplicationQuestion[]>([]);
  const [newQuestionText, setNewQuestionText] = useState('');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchMenus();
    fetchQuestions();
  }, []);

  const fetchMenus = async () => {
    const { data } = await supabase
      .from('bot_menus')
      .select('*')
      .order('order_index', { ascending: true });

    let currentList: BotMenu[] = data ? [...data] : [];

    // Deduplicate by clean title in UI list
    const uniqueMap = new Map<string, BotMenu>();
    for (const item of currentList) {
      const cleanTitle = (item.title || '').trim();
      if (cleanTitle && !uniqueMap.has(cleanTitle)) {
        uniqueMap.set(cleanTitle, item);
      }
    }

    let deduplicatedList = Array.from(uniqueMap.values());

    // Standard 4 default main chat buttons
    const defaults: BotMenu[] = [
      {
        title: "Bog'cha haqida ma'lumot ℹ️",
        action_type: "TEXT",
        content_value: "🏫 *\"Porloq Kelajak\" Bolalar Bog'chasi*\n\nBizning bog'chamiz 3 yoshdan 6 yoshgacha bo'lgan bolalar uchun zamonaviy ta'lim, xavfsiz muhit va shaxsiy rivojlanish imkoniyatlarini taqdim etadi.\n\n✨ *Bizning afzalliklarimiz:*\n• Professional pedagog va psixologlar jamoasi\n• STEM, Mental arifmetika, Tillar (Ingliz va Rus)\n• Kuniga 4 mahal sog'lom va sifatli ovqatlanish\n• Online video kuzatuv va xavfsiz hudud\n• 5 mahal chiniqtirish va sport to'garaklari\n\n📍 Manzil: Toshkent sh., Chilonzor tumani, 14-mavze, 25-uy\n☎️ Telefon: +998 71 200-00-11",
        order_index: 1,
        location: "MAIN_CHAT",
        is_active: true
      },
      {
        title: "Ariza qoldirish 📝",
        action_type: "AI_APPLICATION",
        content_value: "AI Avtomatik Ariza Qabul Qilish Tizimi",
        order_index: 2,
        location: "MAIN_CHAT",
        is_active: true
      },
      {
        title: "🤖 AI Assistent Yordami",
        action_type: "AI_CRM",
        content_value: "AI CRM Live Assistant",
        order_index: 3,
        location: "MAIN_CHAT",
        is_active: true
      },
      {
        title: "Biz bilan bog'lanish 📞",
        action_type: "TEXT",
        content_value: "📞 *Biz bilan bog'lanish*\n\nSavollaringiz yoki takliflaringiz bo'lsa, bevosita botga matnli xabar yozishingiz mumkin. Adminlarimiz tez orada sizga javob berishadi.\n\n📱 *Murojaat uchun:* +998 71 200-00-11\n💬 *Telegram Admin:* @bogcha_admin_support\n🌐 *Veb-sayt:* https://bogcha-mini-app.vercel.app",
        order_index: 4,
        location: "MAIN_CHAT",
        is_active: true
      }
    ];

    for (const def of defaults) {
      const exists = deduplicatedList.some(m => (m.title || '').trim() === def.title.trim());
      if (!exists) {
        deduplicatedList.push({ ...def, id: `def-${def.order_index}` });
      }
    }

    setMenus(deduplicatedList);
  };

  const fetchQuestions = async () => {
    const { data } = await supabase
      .from('application_questions')
      .select('*')
      .order('order_index', { ascending: true });
    if (data) setQuestions(data);
  };

  const handleCleanDuplicates = async () => {
    setLoading(true);
    const { data } = await supabase.from('bot_menus').select('*').order('created_at', { ascending: true });
    if (data && data.length > 0) {
      const seenTitles = new Set<string>();
      const idsToDelete: string[] = [];
      for (const item of data) {
        const cleanTitle = (item.title || '').trim();
        if (seenTitles.has(cleanTitle)) {
          idsToDelete.push(item.id!);
        } else {
          seenTitles.add(cleanTitle);
        }
      }
      if (idsToDelete.length > 0) {
        for (const id of idsToDelete) {
          await supabase.from('bot_menus').delete().eq('id', id);
        }
        setMessage(`✅ ${idsToDelete.length} ta takrorlangan dublikat tugma bazadan tozalandi!`);
      } else {
        setMessage("ℹ️ Bazada takrorlangan tugmalar topilmadi.");
      }
    }
    setLoading(false);
    await fetchMenus();
  };

  const handleAddMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    let finalValue = newContentValue;
    if (newActionType === 'AI_APPLICATION') finalValue = newContentValue || "AI Avtomatik Ariza Qabul Qilish Tizimi";
    if (newActionType === 'AI_CRM') finalValue = newContentValue || "AI CRM Live Assistant";

    if (!newTitle) return;

    setLoading(true);
    let { error } = await supabase.from('bot_menus').insert([{
      title: newTitle,
      action_type: newActionType,
      content_value: finalValue,
      location: 'MAIN_CHAT',
      order_index: menus.length + 1,
      is_active: true
    }]);

    if (error && error.message.includes('bot_menus_action_type_check')) {
      const fallbackRes = await supabase.from('bot_menus').insert([{
        title: newTitle,
        action_type: 'TEXT',
        content_value: `${newActionType}: ${finalValue}`,
        location: 'MAIN_CHAT',
        order_index: menus.length + 1,
        is_active: true
      }]);
      error = fallbackRes.error;
    }

    setLoading(false);
    if (!error) {
      setNewTitle('');
      setNewContentValue('');
      setMessage('✅ Yangi tugma saqlandi!');
      fetchMenus();
    } else {
      setMessage(`❌ Xatolik: ${error.message}`);
    }
  };

  const handleSaveEditMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMenu) return;

    setLoading(true);

    if (editingMenu.id && !editingMenu.id.startsWith('def-')) {
      let { error } = await supabase
        .from('bot_menus')
        .update({
          title: editingMenu.title,
          action_type: editingMenu.action_type,
          content_value: editingMenu.content_value,
          is_active: editingMenu.is_active
        })
        .eq('id', editingMenu.id);

      if (error && error.message.includes('bot_menus_action_type_check')) {
        const fallbackRes = await supabase
          .from('bot_menus')
          .update({
            title: editingMenu.title,
            action_type: 'TEXT',
            content_value: `${editingMenu.action_type}: ${editingMenu.content_value}`,
            is_active: editingMenu.is_active
          })
          .eq('id', editingMenu.id);
        error = fallbackRes.error;
      }

      setLoading(false);
      if (!error) {
        setMessage("✅ Tugma ma'lumotlari tahrirlandi!");
        setEditingMenu(null);
        fetchMenus();
      } else {
        setMessage(`❌ Tahrirlashda xatolik: ${error.message}`);
      }
    } else {
      // Virtual default item: insert as new DB row
      let { error } = await supabase.from('bot_menus').insert([{
        title: editingMenu.title,
        action_type: editingMenu.action_type,
        content_value: editingMenu.content_value,
        location: 'MAIN_CHAT',
        order_index: editingMenu.order_index || 1,
        is_active: editingMenu.is_active
      }]);

      if (error && error.message.includes('bot_menus_action_type_check')) {
        const fallbackRes = await supabase.from('bot_menus').insert([{
          title: editingMenu.title,
          action_type: 'TEXT',
          content_value: `${editingMenu.action_type}: ${editingMenu.content_value}`,
          location: 'MAIN_CHAT',
          order_index: editingMenu.order_index || 1,
          is_active: editingMenu.is_active
        }]);
        error = fallbackRes.error;
      }

      setLoading(false);
      if (!error) {
        setMessage("✅ Tugma saqlandi!");
        setEditingMenu(null);
        fetchMenus();
      } else {
        setMessage(`❌ Saqlashda xatolik: ${error.message}`);
      }
    }
  };

  const handleToggleMenuStatus = async (menu: BotMenu) => {
    setLoading(true);
    if (menu.id && !menu.id.startsWith('def-')) {
      const { error } = await supabase
        .from('bot_menus')
        .update({ is_active: !menu.is_active })
        .eq('id', menu.id);
      if (error) setMessage(`❌ Xatolik: ${error.message}`);
      else setMessage(`✅ Tugma statusi o'zgardi!`);
    } else {
      let { error } = await supabase.from('bot_menus').insert([{
        title: menu.title,
        action_type: menu.action_type,
        content_value: menu.content_value,
        location: menu.location || 'MAIN_CHAT',
        order_index: menu.order_index || 1,
        is_active: !menu.is_active
      }]);
      if (error && error.message.includes('bot_menus_action_type_check')) {
        await supabase.from('bot_menus').insert([{
          title: menu.title,
          action_type: 'TEXT',
          content_value: `${menu.action_type}: ${menu.content_value}`,
          location: menu.location || 'MAIN_CHAT',
          order_index: menu.order_index || 1,
          is_active: !menu.is_active
        }]);
      }
      setMessage(`✅ Tugma statusi o'zgardi!`);
    }
    setLoading(false);
    await fetchMenus();
  };

  const handleDeleteMenu = async (menu: BotMenu) => {
    if (!window.confirm(`"${menu.title}" tugmasini o'chirishni tasdiqlaysizmi?`)) return;
    setLoading(true);
    if (menu.id && !menu.id.startsWith('def-')) {
      const { error } = await supabase.from('bot_menus').delete().eq('id', menu.id);
      if (error) setMessage(`❌ O'chirishda xatolik: ${error.message}`);
      else setMessage("✅ Tugma o'chirildi!");
    } else {
      setMessage("✅ Tugma o'chirildi!");
    }
    setLoading(false);
    await fetchMenus();
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText) return;

    setLoading(true);
    const { error } = await supabase.from('application_questions').insert([{
      question_text: newQuestionText,
      order_index: questions.length + 1,
      is_active: true
    }]);

    setLoading(false);
    if (!error) {
      setNewQuestionText('');
      setMessage('✅ Yangi savol saqlandi!');
      fetchQuestions();
    } else {
      setMessage(`❌ Xatolik: ${error.message}`);
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!window.confirm("Ushbu savolni o'chirishni tasdiqlaysizmi?")) return;
    await supabase.from('application_questions').delete().eq('id', id);
    fetchQuestions();
  };

  return (
    <div className="p-6 bg-slate-900 text-white rounded-2xl max-w-6xl mx-auto shadow-2xl my-4 border border-slate-800 flex flex-col gap-6 font-sans">
      
      {/* Top Title Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-4 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-emerald-400 flex items-center gap-2">
            ⚙️ Telegram Bot Sozlamalari
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Telegram bot menyulari, ariza savollari, e'lonlar yuborish va muloqotni yagona markazdan boshqaring.
          </p>
        </div>
      </div>

      {/* Main Mini-Section Sub-Navigation Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={() => setMainSection('menus_and_questions')}
          className={`py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all border ${
            mainSection === 'menus_and_questions'
              ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-600/30'
              : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <span>📱 Bot Chat & Savollar</span>
        </button>

        <button
          onClick={() => setMainSection('broadcast')}
          className={`py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all border ${
            mainSection === 'broadcast'
              ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-600/30'
              : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <span>📢 Ommaviy E'lon Yuborish</span>
        </button>

        <button
          onClick={() => setMainSection('live_chat')}
          className={`py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all border ${
            mainSection === 'live_chat'
              ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-600/30'
              : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <span>💬 Jonli Muloqot (Live Chat)</span>
        </button>
      </div>

      {/* SECTION 1: MENUS AND APPLICATION QUESTIONS */}
      {mainSection === 'menus_and_questions' && (
        <div className="space-y-6 pt-2">
          {message && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-lg text-emerald-300 text-sm flex justify-between items-center">
              <span>{message}</span>
              <button onClick={() => setMessage('')} className="text-xs text-slate-400 hover:text-white">✕</button>
            </div>
          )}

          {/* Sub Tabs: Menus vs Questions */}
          <div className="flex gap-3 border-b border-slate-800 pb-3">
            <button
              onClick={() => setActiveSubTab('menus')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeSubTab === 'menus'
                  ? 'bg-slate-700 text-emerald-400 border border-emerald-500/40'
                  : 'bg-slate-800/40 text-slate-400 hover:text-slate-200'
              }`}
            >
              Asosiy Chat Tugmalari ({menus.length})
            </button>
            <button
              onClick={() => setActiveSubTab('questions')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeSubTab === 'questions'
                  ? 'bg-slate-700 text-emerald-400 border border-emerald-500/40'
                  : 'bg-slate-800/40 text-slate-400 hover:text-slate-200'
              }`}
            >
              Ariza Savollari ({questions.length})
            </button>
          </div>

          {/* Sub Tab: Bot Menus */}
          {activeSubTab === 'menus' && (
            <div className="space-y-6">
              
              {/* Add New Menu Form */}
              <form onSubmit={handleAddMenu} className="bg-slate-800/60 p-4 rounded-xl space-y-4 border border-slate-700">
                <h3 className="font-semibold text-sm text-emerald-300 flex items-center gap-2">
                  <span>➕ Yangi Asosiy Chat Tugmasi Qo'shish</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-slate-400">Tugma Nomi (Matn / Emoji)</label>
                    <input
                      type="text"
                      placeholder="masalan: Bog'cha Narxlari 💰"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white focus:border-emerald-500 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-slate-400">Tugma Turi</label>
                    <select
                      value={newActionType}
                      onChange={(e) => setNewActionType(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white font-semibold focus:border-emerald-500 outline-none"
                    >
                      <option value="TEXT">💬 Oddiy Matnli Javob</option>
                      <option value="AI_APPLICATION">📝 AI Avtomatik Ariza Qabul Qilish</option>
                      <option value="AI_CRM">🤖 AI Jonli Muloqot Assistent</option>
                      <option value="URL">🔗 Tashqi Havola (URL)</option>
                      <option value="FILE">📄 Fayl / Hujjat (URL)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-slate-400">
                      {newActionType === 'AI_APPLICATION' || newActionType === 'AI_CRM' 
                        ? "Assistent Tavsifi (Ixtiyoriy)" 
                        : "Natijaviy Qiymat (Matn yoki Link)"}
                    </label>
                    <input
                      type="text"
                      placeholder={
                        newActionType === 'AI_APPLICATION' 
                          ? "AI Ariza Tizimi" 
                          : newActionType === 'AI_CRM'
                          ? "AI Live Assistant"
                          : newActionType === 'TEXT' 
                          ? 'Javob matni...' 
                          : 'https://...'
                      }
                      value={newContentValue}
                      onChange={(e) => setNewContentValue(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white focus:border-emerald-500 outline-none"
                      required={newActionType === 'TEXT' || newActionType === 'URL' || newActionType === 'FILE'}
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded font-semibold text-xs text-white transition flex items-center gap-1"
                >
                  {loading ? 'Saqlanmoqda...' : '＋ Tugmani Saqlash'}
                </button>
              </form>

              {/* Menus List & Edit Management */}
              <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800 pb-2 gap-2">
                  <h3 className="font-semibold text-xs text-slate-300">
                    Mavjud Chat Tugmalari Ro'yxati va Sozlamalari ({menus.length} ta)
                  </h3>
                  <button
                    onClick={handleCleanDuplicates}
                    disabled={loading}
                    className="px-3 py-1 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 rounded text-xs font-bold border border-amber-500/40 transition flex items-center gap-1"
                  >
                    🧹 Dublikatlarni Tozalash
                  </button>
                </div>

                {menus.length === 0 ? (
                  <p className="text-slate-500 text-xs py-4 text-center">Hozircha tugmalar yo'q.</p>
                ) : (
                  <div className="space-y-2">
                    {menus.map((menu) => (
                      <div 
                        key={menu.id || menu.title} 
                        className={`flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 rounded-xl border gap-3 transition ${
                          menu.is_active 
                            ? "bg-slate-900 border-slate-800" 
                            : "bg-slate-950/60 border-slate-900 opacity-60"
                        }`}
                      >
                        <div className="space-y-1 max-w-xl">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm text-white">{menu.title}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                              menu.action_type === 'AI_APPLICATION'
                                ? 'bg-purple-950 text-purple-300 border border-purple-600/50'
                                : menu.action_type === 'AI_CRM'
                                ? 'bg-cyan-950 text-cyan-300 border border-cyan-600/50'
                                : menu.action_type === 'TEXT'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-700/50'
                                : 'bg-blue-950 text-blue-300 border border-blue-600/50'
                            }`}>
                              {menu.action_type === 'AI_APPLICATION' ? '🤖 AI ARIZA' : menu.action_type === 'AI_CRM' ? '🤖 AI CRM ASSISTENT' : menu.action_type}
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                              menu.is_active ? "bg-emerald-900/60 text-emerald-300" : "bg-red-950 text-red-400"
                            }`}>
                              {menu.is_active ? "Faol" : "Nofaol"}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 line-clamp-2 font-mono bg-slate-950/50 p-2 rounded border border-slate-800/80">
                            {menu.content_value}
                          </p>
                        </div>

                        {/* Action buttons: Edit, Toggle Status (Nofaol qilish), Delete */}
                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <button
                            onClick={() => setEditingMenu(menu)}
                            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded text-xs font-semibold transition border border-slate-700 flex items-center gap-1"
                          >
                            ✏️ Tahrirlash
                          </button>
                          <button
                            onClick={() => handleToggleMenuStatus(menu)}
                            className={`px-3 py-1 rounded text-xs font-semibold transition border ${
                              menu.is_active 
                                ? "bg-slate-800 text-amber-400 border-amber-500/30 hover:bg-amber-950" 
                                : "bg-emerald-950 text-emerald-400 border-emerald-500/40 hover:bg-emerald-900"
                            }`}
                          >
                            {menu.is_active ? "🔕 Nofaol qilish" : "🔔 Faollashtirish"}
                          </button>
                          <button
                            onClick={() => handleDeleteMenu(menu)}
                            className="px-3 py-1 bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-800/60 rounded text-xs font-semibold transition"
                          >
                            🗑️ O'chirish
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Telegram Keyboard Live Simulation Preview */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-slate-400 flex items-center gap-2">
                  📱 Telegram Bot Chat Klaviaturasi Ko'rinishi (Live Preview)
                </h4>
                <div className="grid grid-cols-2 gap-2 max-w-md mx-auto bg-slate-900 p-3 rounded-xl border border-slate-800">
                  {menus.filter(m => m.is_active).map(m => (
                    <div key={m.id} className="bg-slate-800 p-2.5 rounded-lg text-center font-semibold text-xs text-white border border-slate-700 truncate shadow">
                      {m.title}
                    </div>
                  ))}
                  <div className="col-span-2 bg-slate-800/50 p-2 rounded-lg text-center text-xs text-slate-400 border border-slate-800 italic">
                    Ariza yuborish (Maxsus tugma)
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* Sub Tab: Application Questions */}
          {activeSubTab === 'questions' && (
            <div className="space-y-6">
              <form onSubmit={handleAddQuestion} className="bg-slate-800/60 p-4 rounded-xl space-y-4 border border-slate-700">
                <h3 className="font-semibold text-sm text-emerald-300">➕ Yangi Ariza Savoli Qo'shish</h3>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-400">Savol Matni</label>
                  <input
                    type="text"
                    placeholder="masalan: Farzandingizda allergiyalar bormi?"
                    value={newQuestionText}
                    onChange={(e) => setNewQuestionText(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded font-semibold text-xs text-white transition"
                >
                  {loading ? 'Saqlanmoqda...' : 'Savolni Saqlash'}
                </button>
              </form>

              {/* Questions List */}
              <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-800">
                <h3 className="font-semibold text-xs mb-3 text-slate-300">Arizadagi Savollar Ketma-ketligi</h3>
                {questions.length === 0 ? (
                  <p className="text-slate-500 text-xs">Savollar topilmadi.</p>
                ) : (
                  <div className="space-y-2">
                    {questions.map((q, idx) => (
                      <div key={q.id} className="flex justify-between items-center bg-slate-900 p-3 rounded border border-slate-800">
                        <div className="flex items-center gap-3">
                          <span className="w-5 h-5 rounded-full bg-emerald-900 text-emerald-300 font-bold text-[10px] flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="text-xs text-white font-medium">{q.question_text}</span>
                        </div>
                        <button
                          onClick={() => q.id && handleDeleteQuestion(q.id)}
                          className="text-red-400 hover:text-red-300 text-xs font-semibold"
                        >
                          O'chirish
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: BROADCAST ANNOUNCEMENTS */}
      {mainSection === 'broadcast' && (
        <div className="pt-2">
          <BroadcastPage />
        </div>
      )}

      {/* SECTION 3: LIVE SUPPORT CHAT */}
      {mainSection === 'live_chat' && (
        <div className="pt-2">
          <LiveChatPage />
        </div>
      )}

      {/* EDIT MENU MODAL */}
      {editingMenu && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl w-full max-w-xl space-y-4 shadow-2xl animate-fade-in">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-emerald-400 flex items-center gap-2">
                ✏️ Tugmani Tahrirlash: <span className="text-white">{editingMenu.title}</span>
              </h3>
              <button 
                onClick={() => setEditingMenu(null)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditMenu} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-300">Tugma Nomi (Matn / Emoji)</label>
                <input
                  type="text"
                  value={editingMenu.title}
                  onChange={(e) => setEditingMenu({ ...editingMenu, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white font-medium focus:border-emerald-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-300">Tugma Turi</label>
                <select
                  value={editingMenu.action_type}
                  onChange={(e) => setEditingMenu({ ...editingMenu, action_type: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white font-semibold focus:border-emerald-500 outline-none"
                >
                  <option value="TEXT">💬 Oddiy Matnli Javob</option>
                  <option value="AI_APPLICATION">📝 AI Avtomatik Ariza Qabul Qilish</option>
                  <option value="AI_CRM">🤖 AI Jonli Muloqot Assistent</option>
                  <option value="URL">🔗 Tashqi Havola (URL)</option>
                  <option value="FILE">📄 Fayl / Hujjat (URL)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-300">
                  Natijaviy Qiymat / Javob Matni
                </label>
                {editingMenu.action_type === 'TEXT' ? (
                  <textarea
                    rows={6}
                    value={editingMenu.content_value}
                    onChange={(e) => setEditingMenu({ ...editingMenu, content_value: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white font-mono focus:border-emerald-500 outline-none"
                    placeholder="Bot foydalanuvchiga qaytaradigan batafsil matn..."
                    required
                  />
                ) : (
                  <input
                    type="text"
                    value={editingMenu.content_value}
                    onChange={(e) => setEditingMenu({ ...editingMenu, content_value: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white font-mono focus:border-emerald-500 outline-none"
                    placeholder="Link yoki tavsif..."
                    required
                  />
                )}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="is_active_checkbox"
                  checked={editingMenu.is_active}
                  onChange={(e) => setEditingMenu({ ...editingMenu, is_active: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                />
                <label htmlFor="is_active_checkbox" className="text-xs font-semibold text-slate-300 cursor-pointer">
                  Tugma faol (Telegram botda ko'rinadi)
                </label>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-800 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingMenu(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-semibold text-slate-300 transition"
                >
                  Bekor Qilish
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-xs font-bold text-white transition flex items-center gap-1"
                >
                  {loading ? 'Saqlanmoqda...' : "💾 O'zgartirishlarni Saqlash"}

                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
