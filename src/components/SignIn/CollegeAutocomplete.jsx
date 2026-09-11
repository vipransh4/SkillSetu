import React, { useState, useEffect, useRef } from 'react';
import { Building, Check, Loader2, X } from 'lucide-react';
import apiClient from '../../api/client';

const CollegeAutocomplete = ({ value = '', onChange, error }) => {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef(null);
  const listRef = useRef(null);
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

    const trimmed = query.trim();
    if (!trimmed) {
      const timer = setTimeout(() => {
        setSuggestions([]);
        setSelectedIndex(-1);
      }, 0);
      return () => clearTimeout(timer);
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await apiClient.get(`/institutions/search?q=${encodeURIComponent(trimmed)}&limit=15`);
        setSuggestions(res.data || []);
        setSelectedIndex(-1);
      } catch (err) {
        console.error('Institution search error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  const handleSelect = (collegeName) => {
    setQuery(collegeName);
    onChange(collegeName);
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
    setSuggestions([]);
    setSelectedIndex(-1);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (!isOpen || suggestions.length === 0) {
      if (e.key === 'ArrowDown' && suggestions.length > 0) {
        setIsOpen(true);
        setSelectedIndex(0);
        e.preventDefault();
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => {
        const next = prev < suggestions.length - 1 ? prev + 1 : 0;
        return next;
      });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => {
        const next = prev > 0 ? prev - 1 : suggestions.length - 1;
        return next;
      });
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        e.preventDefault();
        handleSelect(suggestions[selectedIndex].name);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setSelectedIndex(-1);
    }
  };

  return (
    <div className="relative space-y-1" ref={containerRef}>
      <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
        College / University
      </label>
      <div className="relative flex items-center">
        <Building className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder="e.g. IIT Bombay, DTU, SRCC..."
          className={`w-full rounded-xl border bg-white py-2.5 pl-10 pr-9 text-sm font-medium text-slate-800 placeholder-slate-400 outline-none transition-all ${
            error
              ? 'border-red-500 ring-2 ring-red-500/20 bg-red-50/20'
              : 'border-slate-200 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10'
          }`}
        />
        {query.length > 0 && !isLoading && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
            title="Clear college"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
        {isLoading && (
          <div className="absolute right-3">
            <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
          </div>
        )}
      </div>

      {error && <p className="text-xs font-medium text-red-500">{error}</p>}

      {isOpen && query.trim().length > 0 && suggestions.length > 0 && (
        <div 
          ref={listRef}
          className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl animate-fadeIn"
        >
          {suggestions.map((inst, index) => {
            const isSelected = inst.name.toLowerCase() === query.trim().toLowerCase();
            const isHighlighted = selectedIndex === index;
            return (
              <div
                key={inst.id}
                onClick={() => handleSelect(inst.name)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`flex items-center justify-between gap-2 px-3.5 py-2.5 text-left text-xs cursor-pointer transition-colors ${
                  isHighlighted || isSelected ? 'bg-slate-100 text-slate-900' : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="font-semibold text-slate-900 truncate">{inst.name}</span>
                  <span className="text-[11px] text-slate-500 truncate">
                    {inst.city ? `${inst.city}, ` : ''}{inst.state || 'India'}
                  </span>
                </div>

                {isSelected && (
                  <div className="shrink-0">
                    <Check className="h-4 w-4 text-emerald-600" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CollegeAutocomplete;
