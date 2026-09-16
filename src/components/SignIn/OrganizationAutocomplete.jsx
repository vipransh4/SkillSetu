import React, { useState, useEffect, useRef } from 'react';
import { Building2, Check, X, Sparkles } from 'lucide-react';

export const COMMON_ORGANIZATIONS = [
  { name: 'Google', domain: 'google.com', sector: 'Information Technology' },
  { name: 'Microsoft', domain: 'microsoft.com', sector: 'Information Technology' },
  { name: 'Amazon', domain: 'amazon.com', sector: 'Information Technology & E-Commerce' },
  { name: 'Tata Consultancy Services (TCS)', domain: 'tcs.com', sector: 'Information Technology' },
  { name: 'Infosys', domain: 'infosys.com', sector: 'Information Technology' },
  { name: 'Wipro', domain: 'wipro.com', sector: 'Information Technology' },
  { name: 'Reliance Industries', domain: 'ril.com', sector: 'Energy & Telecom' },
  { name: 'HDFC Bank', domain: 'hdfcbank.com', sector: 'Banking & Financial Services' },
  { name: 'ICICI Bank', domain: 'icicibank.com', sector: 'Banking & Financial Services' },
  { name: 'Adobe', domain: 'adobe.com', sector: 'Creative Software & Cloud' },
  { name: 'Razorpay', domain: 'razorpay.com', sector: 'FinTech & Payments' },
  { name: 'Zomato', domain: 'zomato.com', sector: 'Consumer Tech & Food Delivery' },
  { name: 'Flipkart', domain: 'flipkart.com', sector: 'E-Commerce' },
  { name: 'Swiggy', domain: 'swiggy.com', sector: 'Consumer Tech' },
  { name: 'Larsen & Toubro (L&T)', domain: 'larsentoubro.com', sector: 'Engineering & Construction' },
  { name: 'Deloitte', domain: 'deloitte.com', sector: 'Management & Technology Consulting' },
  { name: 'Accenture', domain: 'accenture.com', sector: 'IT Services & Consulting' },
  { name: 'KPMG', domain: 'kpmg.com', sector: 'Financial Advisory & Audit' },
  { name: 'Tata Motors', domain: 'tatamotors.com', sector: 'Automotive & Mobility' },
  { name: 'Paytm', domain: 'paytm.com', sector: 'FinTech' }
];

export const POPULAR_CHIPS = [
  'Google',
  'Microsoft',
  'Amazon',
  'TCS',
  'Infosys',
  'Reliance',
  'HDFC Bank',
  'Adobe',
  'Razorpay',
  'Zomato'
];

const OrganizationAutocomplete = ({ value = '', onChange, error, showChips = true, placeholder = 'e.g. Microsoft, Google, TCS' }) => {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      setSuggestions(COMMON_ORGANIZATIONS.slice(0, 8));
      return;
    }
    const filtered = COMMON_ORGANIZATIONS.filter(
      (org) =>
        org.name.toLowerCase().includes(trimmed) ||
        org.domain.toLowerCase().includes(trimmed) ||
        org.sector.toLowerCase().includes(trimmed)
    );
    setSuggestions(filtered);
    setSelectedIndex(-1);
  }, [query, isOpen]);

  const handleSelect = (name) => {
    setQuery(name);
    onChange(name);
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    onChange(val);
    if (!isOpen) setIsOpen(true);
  };

  const handleClear = () => {
    setQuery('');
    onChange('');
    setSuggestions(COMMON_ORGANIZATIONS.slice(0, 8));
    setSelectedIndex(-1);
    if (inputRef.current) inputRef.current.focus();
  };

  const handleKeyDown = (e) => {
    if (!isOpen || suggestions.length === 0) {
      if (e.key === 'ArrowDown') {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        handleSelect(suggestions[selectedIndex].name);
      } else if (suggestions.length > 0) {
        handleSelect(suggestions[0].name);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setSelectedIndex(-1);
    }
  };

  return (
    <div ref={containerRef} className="space-y-1.5 w-full">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <Building2 size={13} className="text-blue-600" />
          <span>Organization / Company Name</span>
        </label>
        {showChips && (
          <span className="text-[10px] text-slate-400 font-medium">Quick Select Available</span>
        )}
      </div>

      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`w-full rounded-xl border bg-white py-2.5 pl-3.5 pr-8 text-sm font-medium text-slate-800 placeholder-slate-400 outline-none transition-all ${
            error
              ? 'border-red-500 ring-2 ring-red-500/20 bg-red-50/20'
              : 'border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10'
          }`}
        />

        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
            title="Clear organization"
          >
            <X size={14} />
          </button>
        )}

        {isOpen && suggestions.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-1.5 max-h-56 overflow-y-auto rounded-xl border border-slate-200 bg-white/95 backdrop-blur-md shadow-xl z-50 divide-y divide-slate-100">
            {suggestions.map((org, index) => {
              const isSelected = selectedIndex === index;
              const isCurrent = query.toLowerCase() === org.name.toLowerCase();
              return (
                <div
                  key={org.name}
                  onClick={() => handleSelect(org.name)}
                  className={`flex items-center justify-between px-3.5 py-2.5 cursor-pointer text-xs transition-colors ${
                    isSelected ? 'bg-blue-50 text-blue-900' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <p className="font-semibold text-slate-900 truncate">{org.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{org.domain} · {org.sector}</p>
                  </div>
                  {isCurrent && <Check size={14} className="text-blue-600 shrink-0" />}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showChips && (
        <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Sparkles size={10} className="text-amber-500" />
            Top:
          </span>
          {POPULAR_CHIPS.map((chip) => {
            const orgObj = COMMON_ORGANIZATIONS.find(
              (o) => o.name.toLowerCase() === chip.toLowerCase() || o.name.toLowerCase().includes(chip.toLowerCase())
            );
            const targetName = orgObj ? orgObj.name : chip;
            const isChipSelected = query.toLowerCase() === targetName.toLowerCase() || query.toLowerCase() === chip.toLowerCase();
            return (
              <button
                key={chip}
                type="button"
                onClick={() => handleSelect(targetName)}
                className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-all cursor-pointer border ${
                  isChipSelected
                    ? 'bg-blue-50 text-blue-700 border-blue-300 font-bold'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {chip}
              </button>
            );
          })}
        </div>
      )}

      {error && <p className="text-xs font-medium text-red-500">{error}</p>}
    </div>
  );
};

export default OrganizationAutocomplete;
