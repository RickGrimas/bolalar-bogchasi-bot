import React, { useState, useRef, useEffect } from "react";

interface HomeworkTask {
  id: number;
  title: string;
  desc: string;
  deadline: string;
  subject: string;
  icon: string;
}

interface Message {
  id: number;
  sender: "user" | "ai";
  text: string;
}

export const Tasks: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"pending" | "approved">("pending");
  const [showAIChat, setShowAIChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "ai",
      text: "Salom! Men uyga vazifalarni bajarishda yordam beradigan ensiklopedik yordamchiman. Bola bilan birgalikda istalgan mavzuda savol berishingiz mumkin (masalan: 'Kamalak qanday paydo bo'ladi?', 'Kosmos haqida ma'lumot').",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [aiTyping, setAiTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Upload Form states
  const [selectedFileType, setSelectedFileType] = useState<"text" | "image" | "video" | "audio" | "file">("text");
  const [uploadText, setUploadText] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(-1);
  const [submittedList, setSubmittedList] = useState<any[]>([]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, aiTyping]);

  const activeTasks: HomeworkTask[] = [
    {
      id: 1,
      subject: "Rasm chizish",
      title: "Tabiat va kuz fasli",
      desc: "Sariq va qizil rangli barglar tasvirlangan rasm chizib, uni bo'yash kerak.",
      deadline: "Bugun, 18:00 gacha",
      icon: "palette",
    },
    {
      id: 2,
      subject: "Matematika",
      title: "10 ichida qo'shish",
      desc: "5 ta oddiy qo'shish amaliga oid misollarni daftarga yozish va yechish.",
      deadline: "Ertaga, 12:00 gacha",
      icon: "calculate",
    },
  ];

  const approvedTasks = [
    {
      id: 101,
      subject: "Mental Arifmetika",
      title: "Abakusda sonlarni ko'rsatish",
      feedback: "Juda yaxshi bajarilgan! Abakus darsidagi sonlar to'g'ri ko'rsatildi.",
      score: "A'lo (5/5)",
      date: "Kecha",
      icon: "abacus",
    },
  ];

  // Mock upload action
  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFileType === "text" && !uploadText.trim()) return;
    if (selectedFileType !== "text" && !uploadFile && !uploadText.trim()) return;

    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setSubmittedList((old) => [
              ...old,
              {
                id: Date.now(),
                type: selectedFileType,
                content: selectedFileType === "text" ? uploadText : uploadFile?.name || "fayl.jpg",
                status: "Tarbiyachiga yuborildi",
                date: "Hozir",
              },
            ]);
            setUploadText("");
            setUploadFile(null);
            setUploadProgress(-1);
          }, 400);
          return 100;
        }
        return prev + 20;
      });
    }, 150);
  };

  // AI response helper
  const handleAISend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg: Message = { id: Date.now(), sender: "user", text: chatInput.trim() };
    setChatMessages((prev) => [...prev, userMsg]);
    const text = chatInput.toLowerCase();
    setChatInput("");
    setAiTyping(true);

    setTimeout(() => {
      setAiTyping(false);
      let reply = "Savolingiz uchun rahmat! Men ensiklopedik lug'atdan ushbu mavzu bo'yicha ma'lumot izlayapman. Iltimos, aniqroq so'rab ko'ring.";
      if (text.includes("kamalak") || text.includes("rang")) {
        reply = "Kamalak yomg'ir tomchilari orqali quyosh nurlarining sinishi va qaytishi natijasida hosil bo'ladi. U 7 xil rangdan iborat: qizil, olovrang, sariq, yashil, moviy, ko'k va binafsharang.";
      } else if (text.includes("kosmos") || text.includes("koinot") || text.includes("sayyora")) {
        reply = "Koinot cheksiz bo'lib, unda milliardlab yulduzlar va sayyoralar mavjud. Biz yashaydigan Quyosh tizimida 8 ta asosiy sayyora bor. Yer sayyorasi hayot mavjud bo'lgan yagona sayyoradir.";
      } else if (text.includes("matematika") || text.includes("qo'shish") || text.includes("hisob")) {
        reply = "Matematika fanlar ichida eng muhimlaridan biridir. Bolalarga qo'shishni o'rgatishda rangli lego kubiklaridan yoki mevalardan foydalanish juda qulay va ko'rgazmali hisoblanadi.";
      } else if (text.includes("rasm") || text.includes("chizish") || text.includes("barg")) {
        reply = "Kuz faslida barglar tarkibidagi xlorofill kamayib ketishi sababli ular sariq, qizil va jigarrang tusga kiradi. Rasm chizishda bolaga ushbu yorqin kuz ranglarini aralashtirishga ruxsat bering.";
      }

      setChatMessages((prev) => [...prev, { id: Date.now() + 1, sender: "ai", text: reply }]);
    }, 1200);
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 py-6 flex-1 flex flex-col gap-5 pb-20 relative">
      <section className="text-left">
        <h2 className="font-quicksand font-bold text-2xl text-primary dark:text-[#89ceff]">
          Uyga Vazifalar
        </h2>
        <p className="font-inter text-xs text-on-surface-variant dark:text-gray-400 mt-0.5">
          Farzandingizga berilgan kunlik vazifalar ro'yxati va topshirish.
        </p>
      </section>

      {/* Mini-tabs */}
      <div className="grid grid-cols-2 gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab("pending")}
          className={`py-2 text-[10px] font-quicksand font-bold rounded-xl transition-all duration-300 ${
            activeTab === "pending" ? "bg-cyan-500 text-white shadow-sm" : "text-slate-600 dark:text-gray-400"
          }`}
        >
          Faol vazifalar
        </button>
        <button
          onClick={() => setActiveTab("approved")}
          className={`py-2 text-[10px] font-quicksand font-bold rounded-xl transition-all duration-300 ${
            activeTab === "approved" ? "bg-cyan-500 text-white shadow-sm" : "text-slate-600 dark:text-gray-400"
          }`}
        >
          Tasdiqlanganlar
        </button>
      </div>

      {activeTab === "pending" ? (
        <div className="flex flex-col gap-4 text-left animate-fade-in">
          {/* Tasks List */}
          <div className="flex flex-col gap-3">
            {activeTasks.map((task) => (
              <div
                key={task.id}
                className="glass-panel p-4 rounded-3xl border border-white/20 shadow-sm flex gap-3.5 hover:scale-[1.01] transition-all duration-200"
              >
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-xl">{task.icon}</span>
                </div>
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between items-center">
                    <span className="font-quicksand font-bold text-[10px] text-cyan-600 dark:text-[#89ceff] uppercase">
                      {task.subject}
                    </span>
                    <span className="font-inter text-[9px] font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded-lg">
                      {task.deadline}
                    </span>
                  </div>
                  <h4 className="font-quicksand font-bold text-sm text-primary dark:text-[#89ceff] mt-0.5">
                    {task.title}
                  </h4>
                  <p className="font-inter text-xs text-on-surface-variant dark:text-gray-300 mt-1 leading-relaxed">
                    {task.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Submission / Upload Area */}
          <div className="glass-panel p-5 rounded-3xl border border-white/20 shadow-sm">
            <h3 className="font-quicksand font-bold text-sm text-cyan-600 dark:text-cyan-400 mb-3 border-b border-primary/10 pb-1.5 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base">cloud_upload</span>
              Vazifani topshirish
            </h3>

            {/* Select File Type to submit (5 types) */}
            <div className="grid grid-cols-5 gap-1 bg-slate-50 dark:bg-slate-800 p-1 rounded-xl mb-3 border border-gray-100 dark:border-gray-700/50">
              {(["text", "image", "video", "audio", "file"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    setSelectedFileType(type);
                    setUploadFile(null);
                  }}
                  className={`py-1.5 rounded-lg flex flex-col items-center justify-center gap-0.5 transition-all ${
                    selectedFileType === type
                      ? "bg-cyan-500 text-white shadow-sm"
                      : "text-slate-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-slate-700/50"
                  }`}
                  title={type.toUpperCase()}
                >
                  <span className="material-symbols-outlined text-sm">
                    {type === "text"
                      ? "description"
                      : type === "image"
                      ? "image"
                      : type === "video"
                      ? "videocam"
                      : type === "audio"
                      ? "mic"
                      : "folder"}
                  </span>
                  <span className="text-[7px] font-bold uppercase tracking-tighter">{type === "text" ? "Matn" : type}</span>
                </button>
              ))}
            </div>

            <form onSubmit={handleUploadSubmit} className="flex flex-col gap-3">
              {selectedFileType === "text" ? (
                <textarea
                  placeholder="Vazifa javobini yozing..."
                  value={uploadText}
                  onChange={(e) => setUploadText(e.target.value)}
                  className="p-3.5 border rounded-[16px] text-xs bg-white dark:bg-[#1e293b] border-gray-300 dark:border-gray-700 text-slate-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 h-20 resize-none"
                  required
                />
              ) : (
                <div className="flex flex-col gap-2">
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-4 flex flex-col items-center justify-center bg-white dark:bg-[#1e293b] text-center cursor-pointer hover:border-cyan-500 transition-all relative">
                    <input
                      type="file"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          setUploadFile(e.target.files[0]);
                        }
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <span className="material-symbols-outlined text-2xl text-gray-400 mb-1">upload_file</span>
                    <span className="text-xs font-inter text-slate-600 dark:text-gray-400">
                      {uploadFile ? uploadFile.name : `Fayl tanlang (${selectedFileType.toUpperCase()})`}
                    </span>
                    <span className="text-[9px] text-gray-400 mt-0.5">Tizim formatni avtomatik taniydi</span>
                  </div>
                  <input
                    type="text"
                    placeholder="Qo'shimcha izoh yozishingiz mumkin..."
                    value={uploadText}
                    onChange={(e) => setUploadText(e.target.value)}
                    className="px-4 py-2 border rounded-[16px] text-xs bg-white dark:bg-[#1e293b] border-gray-300 dark:border-gray-700 text-slate-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              )}

              {/* Progress bar mock */}
              {uploadProgress >= 0 && (
                <div className="w-full flex flex-col gap-1 mt-1">
                  <div className="flex justify-between items-center text-[9px] font-bold text-cyan-600 dark:text-[#89ceff]">
                    <span>Yuklanmoqda...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-500 transition-all duration-150" style={{ width: `${uploadProgress}%` }}></div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={uploadProgress >= 0}
                className="w-full h-10 bg-cyan-500 hover:bg-cyan-400 text-white font-quicksand font-bold text-xs rounded-xl shadow-md border-b-4 border-cyan-700 active:scale-95 active:border-b-0 active:translate-y-[4px] transition-all flex items-center justify-center gap-1.5"
              >
                Topshirish
              </button>
            </form>
          </div>

          {/* Submissions List */}
          {submittedList.length > 0 && (
            <div className="glass-panel p-4 rounded-3xl border border-white/20 shadow-sm flex flex-col gap-3">
              <h4 className="font-quicksand font-bold text-xs text-primary dark:text-[#89ceff] border-b border-primary/10 pb-1.5">
                Yuborilgan vazifalar holati
              </h4>
              <div className="flex flex-col gap-2">
                {submittedList.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-white/5 text-[10px] font-inter">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-xs text-cyan-500">task_alt</span>
                      <span className="text-slate-700 dark:text-gray-300 font-bold truncate max-w-[120px]">{item.content}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-amber-500 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded text-[8px]">{item.status}</span>
                      <span className="text-gray-400">{item.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* APPROVED TABS */
        <div className="flex flex-col gap-4 text-left animate-fade-in">
          {approvedTasks.map((task) => (
            <div
              key={task.id}
              className="glass-panel p-4 rounded-3xl border border-white/20 shadow-sm flex gap-3.5"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-xl">verified</span>
              </div>
              <div className="flex-1 flex flex-col gap-0.5">
                <div className="flex justify-between items-center">
                  <span className="font-quicksand font-bold text-[10px] text-emerald-600 dark:text-emerald-400 uppercase">
                    {task.subject}
                  </span>
                  <span className="font-inter text-[9px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-lg">
                    {task.score}
                  </span>
                </div>
                <h4 className="font-quicksand font-bold text-sm text-primary dark:text-[#89ceff]">
                  {task.title}
                </h4>
                <div className="bg-emerald-500/5 dark:bg-white/5 p-3 rounded-2xl border-l-4 border-emerald-500 mt-2">
                  <span className="font-quicksand font-bold text-[9px] text-emerald-600 dark:text-emerald-400 block mb-0.5">
                    Tarbiyachi bahosi & izohi:
                  </span>
                  <p className="font-inter text-xs text-on-surface-variant dark:text-gray-300 leading-normal italic">
                    "{task.feedback}"
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Floating AI Helper Panel Button on bottom-right */}
      <div className="fixed bottom-20 right-4 z-45">
        <button
          onClick={() => setShowAIChat((prev) => !prev)}
          className="w-12 h-12 rounded-full bg-cyan-500 hover:bg-cyan-400 text-white flex items-center justify-center shadow-lg active:scale-90 transition-all border-2 border-white dark:border-[#1e293b]"
          title="AI Ensiklopediya Yordamchisi"
        >
          <span className="material-symbols-outlined text-xl font-bold">psychology</span>
        </button>
      </div>

      {/* Full-Height AI Chat panel covering the workspace inside mobile layout */}
      {showAIChat && (
        <div className="absolute inset-0 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-2xl rounded-3xl p-4 z-50 flex flex-col gap-3 animate-fade-in">
          {/* Header */}
          <div className="flex justify-between items-center border-b border-primary/10 pb-2 flex-shrink-0">
            <span className="font-quicksand font-bold text-xs text-cyan-600 dark:text-[#89ceff] flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">psychology</span>
              AI Ensiklopediya Ko'makchisi
            </span>
            <div className="flex items-center gap-2">
              {/* Clear History Button */}
              <button
                onClick={() => setChatMessages([
                  {
                    id: 1,
                    sender: "ai",
                    text: "Salom! Men uyga vazifalarni bajarishda yordam beradigan ensiklopedik yordamchiman. Bola bilan birgalikda istalgan mavzuda savol berishingiz mumkin (masalan: 'Kamalak qanday paydo bo'ladi?', 'Kosmos haqida ma'lumot').",
                  }
                ])}
                className="text-gray-400 hover:text-red-500 transition-colors p-1 flex items-center justify-center"
                title="Tarixni tozalash"
              >
                <span className="material-symbols-outlined text-sm">delete</span>
              </button>
              {/* Close Button */}
              <button
                onClick={() => setShowAIChat(false)}
                className="text-gray-400 hover:text-slate-600 dark:hover:text-white p-1 flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto scrollbar-none flex flex-col gap-2.5 pr-1">
            {chatMessages.map((msg) => {
              const isUser = msg.sender === "user";
              return (
                <div key={msg.id} className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-3 py-2 text-[10px] font-inter leading-relaxed text-left shadow-sm ${
                      isUser
                        ? "bg-cyan-500 text-white rounded-tr-none"
                        : "bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700/50 rounded-tl-none"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })}

            {aiTyping && (
              <div className="flex w-full justify-start">
                <div className="bg-slate-50 dark:bg-slate-800 border border-gray-100 dark:border-gray-700/50 rounded-2xl rounded-tl-none px-3 py-2.5 flex gap-1 items-center shadow-sm">
                  <span className="w-1 h-1 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: "0ms" }}></span>
                  <span className="w-1 h-1 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: "150ms" }}></span>
                  <span className="w-1 h-1 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: "300ms" }}></span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Form input */}
          <form onSubmit={handleAISend} className="flex gap-2 flex-shrink-0 mt-1 pb-safe">
            <input
              type="text"
              placeholder="Mavzu yoki savolni yozing..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              disabled={aiTyping}
              className="flex-1 px-3 py-2 border rounded-xl text-[10px] bg-white dark:bg-[#1e293b] border-gray-300 dark:border-gray-700 text-slate-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <button
              type="submit"
              disabled={aiTyping || !chatInput.trim()}
              className="w-8 h-8 bg-cyan-500 text-white rounded-xl hover:bg-cyan-400 active:scale-95 transition-all flex items-center justify-center shadow-md disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-sm font-bold">send</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
