import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";

interface Slide {
  url: string;
  captionKey: string;
}

export const Home: React.FC = () => {
  const { t, dynamicPages, draftPages, lang } = useApp();

  const homeData = draftPages?.['home']?.[lang] || dynamicPages?.['home']?.[lang] || {};

  const titleText = homeData.title !== undefined ? homeData.title : t("home.title");
  const subtitleText = homeData.subtitle !== undefined ? homeData.subtitle : t("home.subtitle");

  const slides = Array.isArray(homeData.slides)
    ? homeData.slides
    : [
        { url: "https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=600&auto=format&fit=crop", caption: t("home.caption1") },
        { url: "https://images.unsplash.com/photo-1596464716127-f2a82984de30?q=80&w=600&auto=format&fit=crop", caption: t("home.caption2") },
        { url: "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?q=80&w=600&auto=format&fit=crop", caption: t("home.caption3") },
        { url: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=600&auto=format&fit=crop", caption: t("home.caption4") }
      ];

  const goalTitle = homeData.goal?.title !== undefined ? homeData.goal.title : t("home.goal.title");
  const goalDesc = homeData.goal?.desc !== undefined ? homeData.goal.desc : t("home.goal.desc");
  const goalImage = homeData.goal?.image !== undefined ? homeData.goal.image : "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=400&auto=format&fit=crop";

  const infoTitle = homeData.info?.title !== undefined ? homeData.info.title : t("home.info.title");
  const infoImage = homeData.info?.image !== undefined ? homeData.info.image : "https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=400&auto=format&fit=crop";
  const infoItems = Array.isArray(homeData.info?.items)
    ? homeData.info.items
    : [t("home.info.li1"), t("home.info.li2"), t("home.info.li3")];

  const newsTitle = homeData.news_title !== undefined ? homeData.news_title : t("home.news.title");
  const newsItems = Array.isArray(homeData.news)
    ? homeData.news
    : [
        { title: t("home.news1.title"), desc: t("home.news1.desc"), image: "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?q=80&w=200&auto=format&fit=crop" },
        { title: t("home.news2.title"), desc: t("home.news2.desc"), image: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?q=80&w=200&auto=format&fit=crop" }
      ];

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="w-full flex flex-col py-4 px-4 flex-1 relative animate-fade-in">
      {/* Title & Subtitle Section ABOVE the image slider */}
      <section className="w-full flex flex-col items-center text-center mt-3 mb-5">
        {titleText && (
          <h1 className="font-quicksand font-bold text-2xl text-primary dark:text-[#89ceff] mb-1.5 leading-tight">
            {titleText}
          </h1>
        )}
        {subtitleText && (
          <p className="font-inter text-[11px] text-on-surface-variant dark:text-gray-300 max-w-xs leading-relaxed">
            {subtitleText}
          </p>
        )}
      </section>

      {/* Interactive Horizontal Sliding Slideshow */}
      {slides.length > 0 && (
        <section className="w-full flex flex-col items-center mb-6">
          <div className="w-full aspect-[16/10] mb-4 rounded-3xl overflow-hidden glass-panel flex flex-col shadow-md border-2 border-cyan-400/30 relative">
            <div
              className="flex h-full transition-transform duration-700 ease-in-out"
              style={{
                width: `${slides.length * 100}%`,
                transform: `translateX(-${currentSlide * (100 / slides.length)}%)`,
              }}
            >
              {slides.map((slide: any, idx: number) => (
                <div
                  key={idx}
                  className="h-full relative overflow-hidden bg-slate-100 dark:bg-slate-800"
                  style={{ width: `${100 / slides.length}%` }}
                >
                  {slide.url && (
                    <img
                      src={slide.url}
                      alt={slide.caption || "Slide"}
                      className="w-full h-full object-cover"
                    />
                  )}
                  {/* Backdrop Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  {/* Slide Caption */}
                  {slide.caption && (
                    <div className="absolute bottom-3 left-4 right-4 text-left z-20">
                      <p className="text-white font-quicksand font-bold text-xs md:text-sm drop-shadow">
                        {slide.caption}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Dots Indicator */}
            {slides.length > 1 && (
              <div className="absolute bottom-3 right-4 flex gap-1 z-30">
                {slides.map((_: any, idx: number) => (
                  <span
                    key={idx}
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                      idx === currentSlide ? "bg-cyan-400 w-3" : "bg-white/50"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Mini-section 1: Bog'cha maqsadi (with integrated Image) */}
      {(goalTitle || goalDesc || goalImage) && (
        <section className="glass-panel p-4 rounded-2xl border border-white/20 shadow-sm mb-4">
          {goalTitle && (
            <h3 className="font-quicksand font-bold text-sm text-cyan-600 dark:text-cyan-400 border-b border-primary/10 pb-1 mb-3 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base">emoji_events</span>
              {goalTitle}
            </h3>
          )}
          <div className="flex flex-col sm:flex-row gap-3">
            {goalImage && (
              <div className="w-full sm:w-24 h-20 rounded-xl overflow-hidden flex-shrink-0">
                <img
                  src={goalImage}
                  alt={goalTitle || "Goal"}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            {goalDesc && (
              <p className="font-inter text-xs text-on-surface-variant dark:text-gray-300 leading-relaxed text-left flex-1">
                {goalDesc}
              </p>
            )}
          </div>
        </section>
      )}

      {/* Mini-section 2: Umumiy ma'lumotlar (with Integrated Image) */}
      {(infoTitle || infoImage || infoItems.length > 0) && (
        <section className="glass-panel p-4 rounded-2xl border border-white/20 shadow-sm mb-4">
          {infoTitle && (
            <h3 className="font-quicksand font-bold text-sm text-amber-500 dark:text-amber-400 border-b border-primary/10 pb-1 mb-3 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base">info</span>
              {infoTitle}
            </h3>
          )}
          <div className="flex flex-col sm:flex-row-reverse gap-3">
            {infoImage && (
              <div className="w-full sm:w-24 h-20 rounded-xl overflow-hidden flex-shrink-0">
                <img
                  src={infoImage}
                  alt={infoTitle || "Info"}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            {infoItems.length > 0 && (
              <ul className="font-inter text-xs text-on-surface-variant dark:text-gray-300 flex flex-col gap-1.5 text-left flex-1 justify-center">
                {infoItems.map((item: string, idx: number) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      )}

      {/* Mini-section 3: Yangiliklar (with Integrated Images) */}
      {newsItems.length > 0 && (
        <section className="glass-panel p-4 rounded-2xl border border-white/20 shadow-sm">
          {newsTitle && (
            <h3 className="font-quicksand font-bold text-sm text-emerald-500 dark:text-emerald-400 border-b border-primary/10 pb-1 mb-3 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base">campaign</span>
              {newsTitle}
            </h3>
          )}
          <div className="flex flex-col gap-3">
            {newsItems.map((news: any, idx: number) => (
              <div key={idx} className="flex gap-3 items-center border-b border-gray-100 dark:border-gray-800 last:border-b-0 pb-2.5 last:pb-0">
                {news.image && (
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                    <img src={news.image} alt={news.title || "News"} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1 text-left">
                  {news.title && (
                    <span className="font-quicksand font-bold text-xs text-on-surface dark:text-white block leading-tight">
                      {news.title}
                    </span>
                  )}
                  {news.desc && (
                    <p className="font-inter text-[10px] text-on-surface-variant dark:text-gray-400 leading-normal mt-0.5">
                      {news.desc}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
