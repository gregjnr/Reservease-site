import React, { useEffect, useState } from 'react';

/**
 * BackgroundMotion: Ambient background motion graphics with blurred luminous orbs
 * and animated geometric wave mesh, unified with a single signature Emerald color.
 */
export const BackgroundMotion: React.FC = () => {
  const [mousePos, setMousePos] = useState({ x: 50, y: 30 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Calculate normalized mouse position for subtle parallax
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none"
    >
      {/* 1. Base Subtle Ambient Emerald Gradient Canvas */}
      <div className="absolute inset-0 bg-radial-[circle_at_50%_0%] from-emerald-100/40 via-slate-50/80 to-slate-50" />

      {/* 2. Primary Floating Blurred Emerald Orb (Top Left to Center) */}
      <div
        className="absolute -top-24 -left-24 w-[520px] h-[520px] rounded-full bg-emerald-300/35 mix-blend-multiply blur-3xl animate-float-slow"
        style={{
          transform: `translate(${mousePos.x * 0.15}px, ${mousePos.y * 0.15}px)`,
          transition: 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      />

      {/* 3. Secondary Floating Blurred Emerald Orb (Right Midfield) */}
      <div
        className="absolute top-1/4 -right-28 w-[620px] h-[620px] rounded-full bg-emerald-400/25 mix-blend-multiply blur-[110px] animate-float-reverse"
        style={{
          transform: `translate(-${mousePos.x * 0.2}px, -${mousePos.y * 0.15}px)`,
          transition: 'transform 1s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      />

      {/* 4. Deep Atmospheric Emerald Pulse Orb (Bottom Center / Left) */}
      <div className="absolute -bottom-36 left-1/4 w-[680px] h-[680px] rounded-full bg-emerald-500/15 mix-blend-multiply blur-[130px] animate-pulse-blur" />

      {/* 5. Center Dynamic Floating Shimmer Orb (Following Mouse gently) */}
      <div
        className="absolute w-[440px] h-[440px] rounded-full bg-emerald-200/40 blur-[90px] opacity-70"
        style={{
          left: `${mousePos.x}%`,
          top: `${mousePos.y}%`,
          transform: 'translate(-50%, -50%)',
          transition: 'left 1.2s ease-out, top 1.2s ease-out',
        }}
      />

      {/* 6. Animated Subtle Geometric Grid Overlay with Radial Vignette */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.22] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_35%,#000_70%,transparent_100%)]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="emerald-grid-pattern"
            width="48"
            height="48"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 48 0 L 0 0 0 48"
              fill="none"
              stroke="#059669"
              strokeWidth="0.75"
              strokeDasharray="2 6"
            />
            <circle cx="48" cy="48" r="1.2" fill="#059669" opacity="0.6" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#emerald-grid-pattern)" />
      </svg>

      {/* 7. Subtle Rotating Fluid Wave Mesh */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[850px] opacity-[0.14] animate-wave-motion">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full fill-emerald-600">
          <path
            d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-45.8C87.4,-32.6,90,-16.3,88.5,-0.9C87,14.6,81.4,29.1,72.8,41.4C64.2,53.7,52.5,63.7,39.3,71.3C26.1,78.9,13,84.1,-0.6,85.2C-14.3,86.2,-28.5,83.1,-41.4,75.4C-54.3,67.7,-65.8,55.4,-73.4,41.3C-80.9,27.2,-84.4,11.3,-82.9,-4C-81.4,-19.4,-74.8,-34.2,-65.4,-46.4C-55.9,-58.5,-43.5,-68.1,-30,-75.6C-16.5,-83.1,-1.9,-88.6,12.7,-85.2C27.3,-81.8,41.7,-83.6,44.7,-76.4Z"
            transform="translate(100 100)"
            filter="blur(30px)"
          />
        </svg>
      </div>
    </div>
  );
};
