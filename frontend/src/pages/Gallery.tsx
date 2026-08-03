import React from "react";

export const Gallery: React.FC = () => {
  const images = [
    {
      url: "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?q=80&w=600&auto=format&fit=crop",
      title: "Ochiq havodagi o'yinlar",
    },
    {
      url: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=600&auto=format&fit=crop",
      title: "Rasm chizish darsi",
    },
    {
      url: "https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=600&auto=format&fit=crop",
      title: "Bizning guruh xonamiz",
    },
    {
      url: "https://images.unsplash.com/photo-1596464716127-f2a82984de30?q=80&w=600&auto=format&fit=crop",
      title: "Lego konstruktor xonasi",
    },
  ];

  return (
    <div className="w-full px-4 py-6 flex-1 flex flex-col gap-6">
      <section className="text-left">
        <h2 className="font-quicksand font-bold text-2xl text-primary dark:text-[#89ceff] transition-colors">
          Bog'cha Galereyasi
        </h2>
        <p className="font-inter text-xs text-on-surface-variant dark:text-gray-400 mt-1">
          Bolajonlarimizning qiziqarli mashg'ulotlaridan foto-hisobotlar.
        </p>
      </section>

      <section className="grid grid-cols-2 gap-4">
        {images.map((img, idx) => (
          <div
            key={idx}
            className="group relative overflow-hidden rounded-2xl glass-panel p-1.5 shadow-sm border border-white/20 hover:scale-[1.02] transition-transform duration-300"
          >
            <div className="overflow-hidden rounded-xl aspect-square bg-gray-100 relative">
              <img
                src={img.url}
                alt={img.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-[#111c2d]/40 flex items-end p-2 opacity-100">
                <span className="text-white font-quicksand font-bold text-[10px] text-left leading-tight">
                  {img.title}
                </span>
              </div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};
