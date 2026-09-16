import React from "react";
import { ArrowUpRight } from "lucide-react";
import { ROLE_NAV_CONFIG, normalizeRole } from "./roleNavConfig";

const AppleMegaNav = ({
  isOpen,
  activeMenu,
  userRole,
  onMouseEnter,
  onMouseLeave,
  onNavigate,
  onClose
}) => {
  const normalized = normalizeRole(userRole);
  const currentMenuData = activeMenu ? ROLE_NAV_CONFIG[activeMenu]?.[normalized] : null;

  const handleItemClick = (item) => {
    if (onClose) onClose();
    if (onNavigate) {
      const queryParam = item.query ? { query: item.query } : {};
      onNavigate(item.route, queryParam);
    }
  };

  return (
    <>
      <div
        className={`fixed inset-0 top-14 md:top-16 bg-black/10 dark:bg-black/40 backdrop-blur-[2px] z-30 transition-opacity duration-200 ease-out cursor-pointer ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        className={`fixed top-14 md:top-16 left-0 w-full z-40 bg-white/95 dark:bg-[#0B0F17]/95 backdrop-blur-xl border-b border-black/[0.08] dark:border-white/[0.08] shadow-[0_16px_32px_rgba(0,0,0,0.04)] dark:shadow-[0_16px_32px_rgba(0,0,0,0.5)] transition-all ease-out ${
          isOpen
            ? "opacity-100 translate-y-0 duration-200 pointer-events-auto visible"
            : "opacity-0 -translate-y-1 duration-150 ease-in pointer-events-none invisible"
        }`}
      >
        {currentMenuData ? (
          <div className="max-w-6xl mx-auto px-8 py-10 grid grid-cols-12 gap-8 whitespace-nowrap">
            <div className="col-span-12 md:col-span-5 border-b md:border-b-0 md:border-r border-slate-100 dark:border-white/[0.06] pb-6 md:pb-0 md:pr-8">
              <p className="text-[11px] font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase mb-4 select-none whitespace-nowrap truncate">
                {currentMenuData.column1.header}
              </p>
              <div className="space-y-2">
                {currentMenuData.column1.items.map((item, idx) => (
                  <button
                    key={item.label + idx}
                    type="button"
                    onClick={() => handleItemClick(item)}
                    className="w-full text-left text-xl md:text-2xl font-semibold tracking-tight text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors block py-0.5 group cursor-pointer flex items-center justify-between whitespace-nowrap"
                  >
                    <span className="whitespace-nowrap truncate">{item.label}</span>
                    <ArrowUpRight
                      size={18}
                      className="opacity-0 -translate-x-1.5 translate-y-1.5 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all text-blue-600 dark:text-blue-400 shrink-0 ml-2"
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="col-span-6 md:col-span-4 border-r border-slate-100 dark:border-white/[0.06] pr-6">
              <p className="text-[11px] font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase mb-3 select-none whitespace-nowrap truncate">
                {currentMenuData.column2.header}
              </p>
              <div className="space-y-1">
                {currentMenuData.column2.items.map((item, idx) => (
                  <button
                    key={item.label + idx}
                    type="button"
                    onClick={() => handleItemClick(item)}
                    className="w-full text-left text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:translate-x-0.5 transition-all block py-1.5 flex items-center justify-between group cursor-pointer whitespace-nowrap"
                  >
                    <span className="truncate whitespace-nowrap">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="col-span-6 md:col-span-3">
              <p className="text-[11px] font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase mb-3 select-none whitespace-nowrap truncate">
                {currentMenuData.column3.header}
              </p>
              <div className="space-y-1">
                {currentMenuData.column3.items.map((item, idx) => (
                  <button
                    key={item.label + idx}
                    type="button"
                    onClick={() => handleItemClick(item)}
                    className="w-full text-left text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:translate-x-0.5 transition-all block py-1.5 flex items-center justify-between group cursor-pointer whitespace-nowrap"
                  >
                    <span className="truncate whitespace-nowrap">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
};

export default AppleMegaNav;
