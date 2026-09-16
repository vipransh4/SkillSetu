import React from 'react';
import { 
  Sun, 
  Moon, 
  Monitor, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Eye, 
  Palette,
  Laptop,
  CheckCircle2
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const AppearanceSettings = () => {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();

  const themeOptions = [
    {
      id: 'light',
      label: 'Light Mode',
      description: 'Clean high-contrast daytime canvas with crisp typographic clarity.',
      icon: Sun,
      previewBg: 'bg-slate-50 border-slate-200',
      previewCard: 'bg-white border-slate-200 shadow-2xs',
      previewText: 'text-slate-800',
      previewMuted: 'bg-slate-200',
      badgeBorder: 'border-blue-300 text-blue-700'
    },
    {
      id: 'dark',
      label: 'Dark Mode',
      description: 'Professional midnight slate palette designed for low-light focus.',
      icon: Moon,
      previewBg: 'bg-[#090D16] border-slate-800',
      previewCard: 'bg-[#121929] border-slate-800 shadow-2xs',
      previewText: 'text-slate-100',
      previewMuted: 'bg-slate-700',
      badgeBorder: 'border-blue-500/40 text-blue-400'
    },
    {
      id: 'system',
      label: 'System Adaptive',
      description: 'Automatically synchronizes with your device operating system preference.',
      icon: Laptop,
      isSplit: true
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2 tracking-tight">
              <Palette size={20} className="text-blue-600" />
              Appearance & Interface Theme
            </h2>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Configure how Skill Setu renders across your displays. Choose an explicit mode or sync with system preferences.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto bg-slate-100/80 p-1 rounded-2xl border border-slate-200/60">
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                theme === 'light'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Sun size={14} />
              <span>Light</span>
            </button>

            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                theme === 'dark'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Moon size={14} />
              <span>Dark</span>
            </button>

            <button
              type="button"
              onClick={() => setTheme('system')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                theme === 'system'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Laptop size={14} />
              <span>System</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {themeOptions.map((opt) => {
          const isSelected = theme === opt.id;
          const Icon = opt.icon;

          return (
            <div
              key={opt.id}
              onClick={() => setTheme(opt.id)}
              className={`group border rounded-3xl p-5 cursor-pointer transition-all duration-200 flex flex-col justify-between relative overflow-hidden ${
                isSelected
                  ? 'border-blue-600 ring-2 ring-blue-500/20 shadow-sm bg-blue-50/10'
                  : 'border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/50'
              }`}
            >
              <div>
                <div className="h-28 rounded-2xl border mb-4 p-3 relative overflow-hidden flex flex-col justify-between">
                  {opt.isSplit ? (
                    <div className="absolute inset-0 flex">
                      <div className="w-1/2 bg-slate-100 p-2.5 border-r border-slate-200 flex flex-col justify-between">
                        <div className="w-6 h-1.5 bg-slate-300 rounded-full" />
                        <div className="w-full bg-white border border-slate-200 rounded-lg p-2 shadow-2xs">
                          <div className="w-10 h-1 bg-slate-300 rounded-full mb-1" />
                          <div className="w-6 h-1 bg-blue-400 rounded-full" />
                        </div>
                      </div>
                      <div className="w-1/2 bg-[#090D16] p-2.5 flex flex-col justify-between">
                        <div className="w-6 h-1.5 bg-slate-700 rounded-full ml-auto" />
                        <div className="w-full bg-[#121929] border border-slate-800 rounded-lg p-2 shadow-2xs">
                          <div className="w-10 h-1 bg-slate-700 rounded-full mb-1" />
                          <div className="w-6 h-1 bg-blue-500 rounded-full" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className={`absolute inset-0 p-3 flex flex-col justify-between ${opt.previewBg}`}>
                      <div className="flex items-center justify-between">
                        <div className={`w-12 h-1.5 rounded-full ${opt.previewMuted}`} />
                        <Icon size={14} className={opt.id === 'light' ? 'text-amber-500' : 'text-blue-400'} />
                      </div>
                      <div className={`rounded-xl border p-2.5 ${opt.previewCard}`}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className={`w-16 h-1.5 rounded-full ${opt.previewMuted}`} />
                          <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded-full border ${opt.badgeBorder} bg-transparent`}>
                            Verified
                          </span>
                        </div>
                        <div className="w-24 h-1 bg-slate-300/40 rounded-full" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <Icon size={16} className={isSelected ? 'text-blue-600' : 'text-slate-500'} />
                    <h3 className="text-sm font-bold text-slate-900 tracking-tight">{opt.label}</h3>
                  </div>

                  {isSelected && (
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <Check size={12} strokeWidth={3} />
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-500 leading-relaxed">
                  {opt.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-400 font-medium">Status</span>
                <span className={`font-semibold tabular-nums ${
                  isSelected ? 'text-blue-600' : 'text-slate-400'
                }`}>
                  {isSelected ? 'Active Preference' : 'Click to Apply'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="border border-slate-200/80 rounded-3xl p-6 relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Eye size={16} className="text-blue-600" />
              Sleek Badge & Typography Surface Preview
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Badges throughout the platform are rendered background-free with refined hairline borders.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Quick Toggle</span>
            <button
              type="button"
              onClick={toggleTheme}
              className={`w-12 h-6.5 rounded-full p-0.5 transition-colors duration-200 ease-in-out cursor-pointer relative flex items-center ${
                resolvedTheme === 'dark' ? 'bg-slate-900' : 'bg-slate-200'
              }`}
            >
              <div
                className={`w-5.5 h-5.5 rounded-full bg-white shadow-md transform transition-transform duration-200 flex items-center justify-center text-slate-800 ${
                  resolvedTheme === 'dark' ? 'translate-x-5.5 text-slate-900' : 'translate-x-0'
                }`}
              >
                {resolvedTheme === 'dark' ? <Moon size={12} /> : <Sun size={12} />}
              </div>
            </button>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-slate-200/70 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full border border-blue-300 text-blue-700 bg-transparent">
              Full-Time
            </span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full border border-emerald-300 text-emerald-700 bg-transparent flex items-center gap-1">
              <ShieldCheck size={12} /> Verified Candidate
            </span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full border border-indigo-300 text-indigo-700 bg-transparent">
              Enterprise Recruiter
            </span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full border border-amber-300 text-amber-700 bg-transparent">
              Hybrid Mode
            </span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full border border-rose-300 text-rose-700 bg-transparent">
              Urgent Placement
            </span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full border border-slate-300 text-slate-700 bg-transparent tabular-nums">
              98% Fit Rating
            </span>
          </div>

          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 text-slate-500">
            <span>Current Display Mode: <strong className="text-slate-900 capitalize">{resolvedTheme}</strong></span>
            <span className="flex items-center gap-1 text-emerald-600 font-semibold">
              <CheckCircle2 size={13} /> Zero Background Sleek Badge Standard Active
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppearanceSettings;
