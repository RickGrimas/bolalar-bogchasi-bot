import React, { useState, useRef, useEffect } from "react";
import { useApp } from "../context/AppContext";

interface Message {
  id: number;
  sender: "user" | "ai";
  text: string;
  audioUrl?: string;
}

export const AI: React.FC = () => {
  const { t, lang } = useApp();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputVal, setInputVal] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isKidsMode, setIsKidsMode] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Set greeting dynamically when component mounts or language changes
  useEffect(() => {
    setMessages([
      {
        id: 1,
        sender: "ai",
        text: t("ai.page.greeting"),
      },
    ]);
  }, [lang]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const query = inputVal.trim();
    const userMsg: Message = {
      id: Date.now(),
      sender: "user",
      text: query,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal("");
    setIsTyping(true);

    try {
      const endpoint = isKidsMode ? "/api/ai/kids-helper" : "/api/ai/crm-chat";
      const payload = isKidsMode
        ? { question: query, requestTTS: true }
        : { message: query, history: messages };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        const aiMsg: Message = {
          id: Date.now() + 1,
          sender: "ai",
          text: data.text || "Javob olindi.",
          audioUrl: data.audioUrl
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        throw new Error("Server xatosi");
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "ai",
          text: "Bog'chamiz ma'lumotlari bo'yicha yordam berishim mumkin. Narxlarimiz 2.000.000 so'm, Manzil: Chilonzor 14-mavze. Ariza qoldirishingiz ham mumkin!"
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="w-full px-4 py-4 flex-1 flex flex-col h-[calc(100vh-136px)] animate-fade-in">
      {/* Header Info + Mode Switcher */}
      <section className="text-left mb-3 flex-shrink-0 flex items-center justify-between">
        <div>
          <h2 className="font-quicksand font-bold text-xl text-primary dark:text-[#89ceff]">
            {t("ai.page.title")}
          </h2>
          <p className="font-inter text-[10px] text-on-surface-variant dark:text-gray-400 mt-0.5">
            {t("ai.page.subtitle")}
          </p>
        </div>

        {/* Mode Switcher */}
        <button
          onClick={() => setIsKidsMode(!isKidsMode)}
          className={`px-3 py-1.5 rounded-xl font-quicksand font-bold text-[10px] transition-all flex items-center gap-1 border ${
            isKidsMode
              ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
              : "bg-cyan-500/20 text-cyan-400 border-cyan-500/40"
          }`}
        >
          <span className="material-symbols-outlined text-sm">
            {isKidsMode ? "child_care" : "forum"}
          </span>
          <span>{isKidsMode ? "👶 Bolalar Rejimi (TTS)" : "💬 CRM Rejimi"}</span>
        </button>
      </section>

      {/* Chat Messages Area */}
      <section className="flex-1 glass-panel rounded-3xl p-4 overflow-y-auto mb-3 border border-white/20 flex flex-col gap-3 scrollbar-none shadow-inner">
        {messages.map((msg) => {
          const isUser = msg.sender === "user";
          return (
            <div
              key={msg.id}
              className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs font-inter leading-relaxed shadow-sm text-left flex flex-col gap-2 ${
                  isUser
                    ? "bg-cyan-500 text-white rounded-tr-none"
                    : "bg-white dark:bg-slate-800 text-on-surface dark:text-gray-200 border border-gray-100 dark:border-gray-700/50 rounded-tl-none"
                }`}
              >
                <div>{msg.text}</div>
                {msg.audioUrl && (
                  <audio controls className="w-full h-8 mt-1 rounded-xl">
                    <source src={msg.audioUrl} type="audio/mp3" />
                  </audio>
                )}
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex w-full justify-start">
            <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-gray-700/50 rounded-2xl rounded-tl-none px-4 py-3 flex gap-1 items-center shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: "0ms" }}></span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: "150ms" }}></span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: "300ms" }}></span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </section>

      {/* Input bar */}
      <form
        onSubmit={handleSend}
        className="flex gap-2 flex-shrink-0 pb-safe"
      >
        <input
          type="text"
          placeholder={t("ai.page.placeholder")}
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          disabled={isTyping}
          className="flex-1 px-4 py-3 border rounded-[16px] text-xs bg-white dark:bg-[#1e293b] border-gray-300 dark:border-gray-750 text-slate-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isTyping || !inputVal.trim()}
          className="px-5 bg-cyan-500 hover:bg-cyan-400 text-white font-quicksand font-bold text-xs rounded-xl shadow-md border-b-4 border-cyan-700 active:scale-95 active:border-b-0 active:translate-y-[4px] transition-all flex items-center justify-center gap-1 disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-sm font-bold">send</span>
          <span className="hidden sm:inline">{t("ai.page.send")}</span>
        </button>
      </form>
    </div>
  );
};
