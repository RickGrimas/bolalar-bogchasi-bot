import React, { useEffect, useState } from "react";

interface DayNightBackgroundProps {
  isDark: boolean;
}

export const DayNightBackground: React.FC<DayNightBackgroundProps> = ({ isDark }) => {
  const [stars, setStars] = useState<{ id: number; top: string; left: string; size: string; delay: string; duration: string }[]>([]);

  useEffect(() => {
    // Generate random stars for dark mode
    const generatedStars = Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 80}%`,
      left: `${Math.random() * 100}%`,
      size: `${Math.random() * 3 + 1}px`,
      delay: `${Math.random() * 5}s`,
      duration: `${Math.random() * 3 + 2}s`,
    }));
    setStars(generatedStars);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Light Mode Elements */}
      {!isDark && (
        <>
          {/* Sun */}
          <div className="sun absolute transition-all duration-1000" />

          {/* Floating Clouds */}
          <div className="cloud-svg top-10 left-[-150px]" style={{ animationDuration: "50s" }}>
            <svg width="120" height="80" viewBox="0 0 120 80" fill="currentColor">
              <path d="M100 50 a20 20 0 0 1 -20 20 h-60 a20 20 0 0 1 -20 -20 a25 25 0 0 1 25 -25 a35 35 0 0 1 65 5 a25 25 0 0 1 10 20 z" />
            </svg>
          </div>
          <div className="cloud-svg top-32 left-[-250px]" style={{ animationDuration: "80s", animationDelay: "15s" }}>
            <svg width="180" height="100" viewBox="0 0 120 80" fill="currentColor">
              <path d="M100 50 a20 20 0 0 1 -20 20 h-60 a20 20 0 0 1 -20 -20 a25 25 0 0 1 25 -25 a35 35 0 0 1 65 5 a25 25 0 0 1 10 20 z" />
            </svg>
          </div>
          <div className="cloud-svg top-64 left-[-180px]" style={{ animationDuration: "65s", animationDelay: "30s" }}>
            <svg width="100" height="60" viewBox="0 0 120 80" fill="currentColor">
              <path d="M100 50 a20 20 0 0 1 -20 20 h-60 a20 20 0 0 1 -20 -20 a25 25 0 0 1 25 -25 a35 35 0 0 1 65 5 a25 25 0 0 1 10 20 z" />
            </svg>
          </div>

          {/* Animated 2D Flapping Birds */}
          <div className="bird" style={{ animationDuration: "25s", animationDelay: "0s" }}>
            <div className="bird-wings" />
          </div>
          <div className="bird" style={{ animationDuration: "35s", animationDelay: "10s", top: "250px" }}>
            <div className="bird-wings" style={{ animationDuration: "0.5s" }} />
          </div>
          <div className="bird" style={{ animationDuration: "20s", animationDelay: "5s", top: "50px" }}>
            <div className="bird-wings" style={{ animationDuration: "0.7s" }} />
          </div>
        </>
      )}

      {/* Dark Mode Elements */}
      {isDark && (
        <>
          {/* Moon */}
          <div className="moon absolute transition-all duration-1000" />

          {/* Twinkling Stars */}
          {stars.map((star) => (
            <div
              key={star.id}
              className="star"
              style={{
                top: star.top,
                left: star.left,
                width: star.size,
                height: star.size,
                animationDelay: star.delay,
                animationDuration: star.duration,
              }}
            />
          ))}

          {/* Sparse Night Clouds */}
          <div className="dark-cloud-svg top-20 left-[-200px]" style={{ animationDuration: "70s" }}>
            <svg width="150" height="90" viewBox="0 0 120 80" fill="currentColor">
              <path d="M100 50 a20 20 0 0 1 -20 20 h-60 a20 20 0 0 1 -20 -20 a25 25 0 0 1 25 -25 a35 35 0 0 1 65 5 a25 25 0 0 1 10 20 z" />
            </svg>
          </div>
          <div className="dark-cloud-svg top-60 left-[-150px]" style={{ animationDuration: "90s", animationDelay: "20s" }}>
            <svg width="100" height="60" viewBox="0 0 120 80" fill="currentColor">
              <path d="M100 50 a20 20 0 0 1 -20 20 h-60 a20 20 0 0 1 -20 -20 a25 25 0 0 1 25 -25 a35 35 0 0 1 65 5 a25 25 0 0 1 10 20 z" />
            </svg>
          </div>
        </>
      )}
    </div>
  );
};
