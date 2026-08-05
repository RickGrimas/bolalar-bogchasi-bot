import React, { useState } from "react";

interface ImageWithFallbackProps {
  src?: string;
  alt?: string;
  className?: string;
  icon?: string;
  caption?: string;
  style?: React.CSSProperties;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt = "Rasmlar",
  className = "",
  icon = "child_care",
  caption,
  style,
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // If no src or image loading failed, render high-performance SVG gradient placeholder card
  if (!src || hasError) {
    return (
      <div
        className={`w-full h-full min-h-[140px] flex flex-col items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-cyan-900/60 via-slate-900 to-indigo-950 border border-cyan-500/20 rounded-2xl ${className}`}
        style={style}
      >
        {/* Soft background glow circles */}
        <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-cyan-500/10 blur-xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-indigo-500/10 blur-xl pointer-events-none" />

        <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 mb-2 shadow-lg z-10">
          <span className="material-symbols-outlined text-2xl font-bold">{icon}</span>
        </div>

        <span className="font-quicksand font-bold text-xs text-cyan-200 text-center z-10 drop-shadow max-w-[90%] truncate">
          {alt || caption || "CloudCare Kids"}
        </span>

        {caption && (
          <span className="font-inter text-[10px] text-cyan-400/80 text-center z-10 mt-0.5 max-w-[85%] line-clamp-1">
            {caption}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`} style={style}>
      {/* Loading Skeleton Pulse before image loads */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-slate-800 animate-pulse flex items-center justify-center">
          <span className="material-symbols-outlined text-slate-600 text-xl">image</span>
        </div>
      )}

      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={`w-full h-full object-cover transition-opacity duration-500 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
};
