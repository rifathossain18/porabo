import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, ChevronDown, Check, X, MapPin } from 'lucide-react';
import { DISTRICTS } from '../lib/mockData';

interface DistrictSelectProps {
  value: string;
  onChange: (district: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  label?: string;
  error?: string;
}

export const DistrictSelect: React.FC<DistrictSelectProps> = ({
  value,
  onChange,
  placeholder = 'Search & select district...',
  className = '',
  disabled = false,
  label,
  error
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Filter 64 districts based on query
  const filteredDistricts = useMemo(() => {
    if (!searchQuery.trim()) return DISTRICTS;
    const q = searchQuery.toLowerCase().trim();
    return DISTRICTS.filter(d => d.toLowerCase().includes(q));
  }, [searchQuery]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Scroll active item into view
  useEffect(() => {
    if (isOpen && listRef.current) {
      const activeEl = listRef.current.children[highlightedIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex, isOpen]);

  // Focus search input on open
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (district: string) => {
    onChange(district);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev < filteredDistricts.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredDistricts[highlightedIndex]) {
        handleSelect(filteredDistricts[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-xs font-medium text-slate-300 dark:text-slate-300 text-slate-700 mb-1">
          {label}
        </label>
      )}

      {/* Main trigger button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            setIsOpen(prev => !prev);
            setHighlightedIndex(0);
          }
        }}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl border text-left text-xs sm:text-sm transition-all ${
          disabled
            ? 'opacity-50 cursor-not-allowed bg-slate-900/40 border-slate-800 text-slate-500'
            : isOpen
            ? 'border-blue-500 ring-2 ring-blue-500/20 bg-[#0B0F19] text-white dark:bg-[#0B0F19] dark:text-white'
            : value
            ? 'bg-[#0B0F19] border-blue-950/70 text-white hover:border-blue-800 dark:bg-[#0B0F19] dark:text-white'
            : 'bg-[#0B0F19] border-blue-950/70 text-slate-400 hover:border-blue-800 dark:bg-[#0B0F19] dark:text-slate-400'
        } ${error ? 'border-rose-500' : ''}`}
      >
        <span className="flex items-center gap-2 truncate">
          <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="truncate font-medium">{value || placeholder}</span>
        </span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180 text-blue-400' : ''
          }`}
        />
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 bg-[#0B0F19] border border-blue-900/60 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 max-h-72 flex flex-col">
          {/* Search Input Box */}
          <div className="p-2 border-b border-blue-950/80 bg-[#111827]/80">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={e => {
                  setSearchQuery(e.target.value);
                  setHighlightedIndex(0);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Type district name (e.g. Dhaka, Bogura)..."
                className="w-full bg-[#070A12] border border-blue-950 rounded-xl pl-8 pr-7 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    inputRef.current?.focus();
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mt-1.5 px-1">
              <span>{filteredDistricts.length} of 64 districts</span>
              <span className="text-cyan-400">Arrow keys to navigate</span>
            </div>
          </div>

          {/* District Options List */}
          <ul
            ref={listRef}
            role="listbox"
            className="flex-1 overflow-y-auto py-1 divide-y divide-blue-950/30 scrollbar-thin scrollbar-thumb-blue-900 scrollbar-track-transparent"
          >
            {filteredDistricts.length === 0 ? (
              <li className="px-4 py-6 text-center text-xs text-slate-400 space-y-1">
                <p className="font-semibold text-slate-300">No district found for "{searchQuery}"</p>
                <p className="text-[11px] text-slate-500">Check spelling or choose from Bangladesh 64 districts.</p>
              </li>
            ) : (
              filteredDistricts.map((district, index) => {
                const isSelected = value.toLowerCase() === district.toLowerCase();
                const isHighlighted = highlightedIndex === index;

                return (
                  <li
                    key={district}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(district)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`px-3.5 py-2 text-xs cursor-pointer flex items-center justify-between transition-colors ${
                      isSelected
                        ? 'bg-blue-600/30 text-white font-semibold'
                        : isHighlighted
                        ? 'bg-blue-950/60 text-blue-200'
                        : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-cyan-400' : 'bg-slate-600'}`} />
                      <span>{district}</span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}

      {error && <p className="mt-1 text-xs text-rose-400">{error}</p>}
    </div>
  );
};
