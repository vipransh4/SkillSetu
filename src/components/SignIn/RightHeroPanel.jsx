import React from 'react';

const RightHeroPanel = ({ title, titleHighlight, subtitle, stats }) => {
  return (
    <div className="sticky top-0 h-screen hidden w-1/2 lg:block overflow-hidden bg-slate-900 shrink-0 select-none">
      <img
        src="/illustration.jpg"
        alt="Skill Setu — Academia & Industry Collaboration"
        className="absolute inset-0 h-full w-full object-cover object-center filter brightness-90 contrast-[1.05] will-change-transform transform-gpu pointer-events-none"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-slate-900/20 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/60 via-transparent to-slate-900/60 pointer-events-none" />
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />

      <div className="relative z-10 flex h-full flex-col justify-between p-12 text-white">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1 text-xs font-semibold text-teal-300 backdrop-blur-md border border-white/15">
            <span className="h-2 w-2 rounded-full bg-teal-400 animate-pulse" />
            Academia & Industry Bridge Portal
          </span>
        </div>

        <div className="space-y-8 max-w-lg">
          <div className="space-y-3">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-white leading-tight">
              {title} <br />
              <span className="text-teal-400 drop-shadow-sm">{titleHighlight}</span>
            </h2>
            <p className="text-base text-slate-200 leading-relaxed font-normal opacity-90">
              {subtitle}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/15 backdrop-blur-sm bg-white/5 p-4 rounded-2xl">
            {stats.map((stat, idx) => (
              <div key={idx} className="flex flex-col">
                <span className="text-2xl font-bold text-white tracking-tight tabular-nums">{stat.number}</span>
                <span className="text-xs font-medium text-slate-300">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RightHeroPanel;