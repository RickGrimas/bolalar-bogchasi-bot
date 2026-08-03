import React, { useState, useEffect } from "react";

export const LiveCams: React.FC = () => {
  const [selectedCam, setSelectedCam] = useState("Sinf xonasi 1");
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const cams = ["Sinf xonasi 1", "O'yin maydonchasi", "Uxlash xonasi"];

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString("uz-UZ", { hour12: false }) + " " + date.toLocaleDateString("uz-UZ");
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 py-6 flex-1 flex flex-col gap-6 pb-20">
      <section className="text-left flex justify-between items-center">
        <div>
          <h2 className="font-quicksand font-bold text-2xl text-primary dark:text-[#89ceff]">
            Jonli Kameralar
          </h2>
          <p className="font-inter text-xs text-on-surface-variant dark:text-gray-400 mt-1">
            Farzandingiz xonasidan real vaqt rejimidagi videooqim.
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-red-500 text-white rounded-full text-[10px] font-bold uppercase tracking-wider animate-pulse shadow-sm shadow-red-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-white inline-block"></span>
          Live
        </div>
      </section>

      {/* Select Camera Dropdown */}
      <section className="flex gap-2">
        {cams.map((cam) => (
          <button
            key={cam}
            onClick={() => setSelectedCam(cam)}
            className={`flex-1 py-2 px-3 rounded-xl font-quicksand font-bold text-xs shadow-sm active:scale-95 transition-all ${
              selectedCam === cam
                ? "bg-primary text-white"
                : "glass-panel text-on-surface dark:text-gray-300"
            }`}
          >
            {cam}
          </button>
        ))}
      </section>

      {/* Video Player Container */}
      <section className="glass-panel p-2 rounded-3xl shadow-md overflow-hidden">
        <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-black flex items-center justify-center border border-white/20">
          {isPlaying ? (
            <>
              {/* Fake Live Video Background (using unsplash kids video/image loop or animation) */}
              <div
                className="absolute inset-0 bg-cover bg-center opacity-85 blur-[0.5px]"
                style={{
                  backgroundImage:
                    selectedCam === "Sinf xonasi 1"
                      ? "url('https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=800&auto=format&fit=crop')"
                      : selectedCam === "O'yin maydonchasi"
                      ? "url('https://images.unsplash.com/photo-1596464716127-f2a82984de30?q=80&w=800&auto=format&fit=crop')"
                      : "url('https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?q=80&w=800&auto=format&fit=crop')",
                }}
              />

              {/* Simulated camera scanlines */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.12)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,3px_100%] pointer-events-none opacity-40"></div>

              {/* CCTV Info Overlay */}
              <div className="absolute inset-0 p-3 flex flex-col justify-between font-mono text-[10px] text-green-400 select-none">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col text-left">
                    <span>CAM: {selectedCam.toUpperCase()}</span>
                    <span>SECURE: AES-256</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping"></span>
                    <span>STABLE: 60 FPS</span>
                  </div>
                </div>

                <div className="flex justify-between items-end">
                  <span>REC ●</span>
                  <span>{formatTimestamp(currentTime)}</span>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center text-gray-400 p-4">
              <span className="material-symbols-outlined text-4xl mb-2">videocam_off</span>
              <p className="font-inter text-xs">Video oqim to'xtatilgan</p>
            </div>
          )}

          {/* Pause overlay button */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-center justify-center z-20"
          >
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-lg">
              <span className="material-symbols-outlined text-3xl">
                {isPlaying ? "pause" : "play_arrow"}
              </span>
            </div>
          </button>
        </div>
      </section>

      {/* Camera Notes */}
      <section className="glass-panel p-5 rounded-2xl text-left shadow-sm flex flex-col gap-2 border border-white/20">
        <h4 className="font-quicksand font-bold text-sm text-primary dark:text-[#89ceff] flex items-center gap-2">
          <span className="material-symbols-outlined text-base">security</span>
          Xavfsizlik eslatmasi
        </h4>
        <p className="font-inter text-xs text-on-surface-variant dark:text-gray-300 leading-relaxed">
          Tizimimiz <strong>Zero-Trust</strong> tamoyili va <strong>TLS 1.3</strong> shifrlash bayonnomalari orqali himoyalangan. Kamera tasvirlari faqat ro'yxatdan o'tgan ota-onalarga beriladi va hech qayerda saqlab qolinmaydi.
        </p>
      </section>
    </div>
  );
};
