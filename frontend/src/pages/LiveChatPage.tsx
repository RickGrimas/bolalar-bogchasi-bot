import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { getAdminHeaders } from '../utils/api';

interface ChatSession {
  id: string;
  telegram_id: string;
  user_name: string;
  status: 'OPEN' | 'CLOSED';
  last_message_at: string;
}

interface ChatMessage {
  id: string;
  session_id: string;
  sender_type: 'USER' | 'ADMIN';
  text: string;
  telegram_message_id?: number;
  created_at: string;
}

export const LiveChatPage: React.FC = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Editing Message State
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    fetchSessions();

    const sessionSub = supabase
      .channel('public:chat_sessions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_sessions' }, () => {
        fetchSessions();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(sessionSub);
    };
  }, []);

  useEffect(() => {
    if (activeSession) {
      fetchMessages(activeSession.id);

      const messageSub = supabase
        .channel(`public:chat_messages:${activeSession.id}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_messages', filter: `session_id=eq.${activeSession.id}` }, (payload) => {
          if (payload.eventType === 'INSERT') {
            setMessages((prev) => {
              const exists = prev.some(m => m.id === (payload.new as ChatMessage).id);
              if (exists) return prev;
              return [...prev, payload.new as ChatMessage];
            });
          } else if (payload.eventType === 'UPDATE') {
            setMessages((prev) => prev.map(m => m.id === (payload.new as ChatMessage).id ? (payload.new as ChatMessage) : m));
          } else if (payload.eventType === 'DELETE') {
            setMessages((prev) => prev.filter(m => m.id !== (payload.old as any).id));
          }
        })
        .subscribe();

      return () => {
        supabase.removeChannel(messageSub);
      };
    }
  }, [activeSession]);

  const fetchSessions = async () => {
    const { data } = await supabase
      .from('chat_sessions')
      .select('*')
      .order('last_message_at', { ascending: false });

    if (data) setSessions(data);
  };

  const fetchMessages = async (sessionId: string) => {
    const { data } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (data) setMessages(data);
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText || !activeSession) return;

    setSending(true);
    setErrorMessage('');

    const targetUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    let success = false;

    const endpoints = ['/api/admin/reply', `${targetUrl}/api/admin/reply`];

    for (const url of endpoints) {
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: getAdminHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({
            telegram_id: activeSession.telegram_id,
            text: replyText,
            session_id: activeSession.id
          })
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            success = true;
            break;
          }
        }
      } catch (err) {
        // Try next endpoint
      }
    }

    if (success) {
      setReplyText('');
      fetchMessages(activeSession.id);
    } else {
      const { error: dbErr } = await supabase.from('chat_messages').insert([{
        session_id: activeSession.id,
        sender_type: 'ADMIN',
        text: replyText
      }]);

      if (!dbErr) {
        setReplyText('');
        fetchMessages(activeSession.id);
        setErrorMessage("⚠️ Xabar saqlandi, ammo Telegram serveriga ulanib bo'lmadi (Bot backend yoniqligini tekshiring).");
      } else {
        setErrorMessage(`❌ Javob yuborishda xatolik: ${dbErr.message}`);
      }
    }

    setSending(false);
  };

  // EDIT MESSAGE HANDLER
  const handleSaveEdit = async (msg: ChatMessage) => {
    if (!editText.trim() || !activeSession) return;

    const targetUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const endpoints = ['/api/admin/edit-message', `${targetUrl}/api/admin/edit-message`];

    let success = false;
    for (const url of endpoints) {
      try {
        const res = await fetch(url, {
          method: 'PUT',
          headers: getAdminHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({
            message_id: msg.id,
            telegram_id: activeSession.telegram_id,
            telegram_message_id: msg.telegram_message_id,
            new_text: editText.trim()
          })
        });

        if (res.ok) {
          success = true;
          break;
        }
      } catch (err) {}
    }

    if (!success) {
      await supabase.from('chat_messages').update({ text: editText.trim() }).eq('id', msg.id);
    }

    setEditingMsgId(null);
    setEditText('');
    fetchMessages(activeSession.id);
  };

  // DELETE MESSAGE HANDLER
  const handleDeleteMsg = async (msg: ChatMessage) => {
    if (!confirm("Ushbu xabarni Telegram bot va bazadan o'chirib tashlaysizmi?") || !activeSession) return;

    const targetUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const endpoints = ['/api/admin/delete-message', `${targetUrl}/api/admin/delete-message`];

    let success = false;
    for (const url of endpoints) {
      try {
        const res = await fetch(url, {
          method: 'DELETE',
          headers: getAdminHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({
            message_id: msg.id,
            telegram_id: activeSession.telegram_id,
            telegram_message_id: msg.telegram_message_id
          })
        });

        if (res.ok) {
          success = true;
          break;
        }
      } catch (err) {}
    }

    if (!success) {
      await supabase.from('chat_messages').delete().eq('id', msg.id);
    }

    fetchMessages(activeSession.id);
  };

  return (
    <div className="p-6 bg-slate-900 text-white rounded-xl max-w-6xl mx-auto shadow-2xl my-2 border border-slate-800 h-[700px] flex flex-col">
      <h2 className="text-xl font-bold mb-3 text-emerald-400 flex items-center gap-2">
        💬 Telegram Foydalanuvchilari Bilan Jonli Muloqot (Live Support)
      </h2>

      {errorMessage && (
        <div className="mb-3 p-3 bg-amber-950/90 border border-amber-500/50 rounded-lg text-amber-200 text-xs">
          {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Left Side: Sessions List */}
        <div className="bg-slate-800/60 rounded-xl border border-slate-800 p-3 flex flex-col overflow-y-auto">
          <h3 className="font-semibold text-xs text-slate-400 mb-2 uppercase tracking-wider">
            Suhbatlar ({sessions.length})
          </h3>
          {sessions.length === 0 ? (
            <div className="text-slate-500 text-xs p-4 text-center">
              Hali botga xabar yozilgan suhbatlar mavjud emas.
            </div>
          ) : (
            <div className="space-y-2">
              {sessions.map((s) => (
                <div
                  key={s.id}
                  onClick={() => { setActiveSession(s); setErrorMessage(''); setEditingMsgId(null); }}
                  className={`p-3 rounded-lg cursor-pointer transition border ${
                    activeSession?.id === s.id
                      ? 'bg-emerald-950 border-emerald-500/80 text-white'
                      : 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-xs truncate">{s.user_name}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(s.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400">Telegram ID: {s.telegram_id}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Message Chat Area */}
        <div className="md:col-span-2 bg-slate-800/40 rounded-xl border border-slate-800 p-4 flex flex-col justify-between">
          {activeSession ? (
            <>
              {/* Header */}
              <div className="pb-3 border-b border-slate-800 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-base text-emerald-300">{activeSession.user_name}</h3>
                  <span className="text-xs text-slate-400">Telegram ID: {activeSession.telegram_id}</span>
                </div>
                <span className="bg-emerald-900/60 text-emerald-300 text-xs px-2.5 py-1 rounded-full font-semibold">
                  Ochiq suhbat
                </span>
              </div>

              {/* Messages Body */}
              <div className="flex-1 overflow-y-auto my-3 space-y-3 pr-2">
                {messages.length === 0 ? (
                  <p className="text-slate-500 text-center text-xs my-10">Xabarlar tarixi bo'sh.</p>
                ) : (
                  messages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex flex-col group ${m.sender_type === 'ADMIN' ? 'items-end' : 'items-start'}`}
                    >
                      <div className="relative flex items-center gap-2 max-w-md">
                        {/* Admin Action Buttons (Edit & Delete) */}
                        {m.sender_type === 'ADMIN' && editingMsgId !== m.id && (
                          <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                            <button
                              onClick={() => { setEditingMsgId(m.id); setEditText(m.text); }}
                              className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs"
                              title="Tahrirlash"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDeleteMsg(m)}
                              className="p-1 bg-slate-800 hover:bg-red-900 text-red-400 rounded text-xs"
                              title="O'chirish"
                            >
                              🗑️
                            </button>
                          </div>
                        )}

                        {/* Inline Edit Form */}
                        {editingMsgId === m.id ? (
                          <div className="flex flex-col gap-2 bg-slate-800 p-2.5 rounded-xl border border-emerald-500/50 w-full">
                            <input
                              type="text"
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              className="bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white"
                              autoFocus
                            />
                            <div className="flex justify-end gap-2 text-[10px]">
                              <button
                                type="button"
                                onClick={() => setEditingMsgId(null)}
                                className="px-2 py-1 bg-slate-700 text-slate-300 rounded"
                              >
                                Bekor qilish
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSaveEdit(m)}
                                className="px-2 py-1 bg-emerald-600 text-white rounded font-bold"
                              >
                                Saqlash
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div
                            className={`p-3 rounded-2xl text-xs ${
                              m.sender_type === 'ADMIN'
                                ? 'bg-emerald-600 text-white rounded-br-none'
                                : 'bg-slate-700 text-slate-100 rounded-bl-none'
                            }`}
                          >
                            {m.text}
                          </div>
                        )}
                      </div>
                      <span className="text-[9px] text-slate-500 mt-1 px-1">
                        {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {/* Input Form */}
              <form onSubmit={handleSendReply} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Foydalanuvchiga javobingizni kiriting..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500 text-xs"
                  required
                />
                <button
                  type="submit"
                  disabled={sending}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg font-bold text-white transition text-xs flex items-center gap-1"
                >
                  {sending ? '...' : 'Javob Yuborish ✈️'}
                </button>
              </form>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500 text-xs">
              Chap tarafdagi suhbatlardan birini tanlang.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
