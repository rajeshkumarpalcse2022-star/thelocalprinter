'use client';

import { MapPin, Search, Crosshair, ChevronRight } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getActiveCategories } from '@/services/userService';

const PAGES = [
  { name: 'Home', slug: '/' },
  { name: 'About', slug: '/about' },
  { name: 'Contact', slug: '/contact' },
  { name: 'Search Businesses', slug: '/search' },
  { name: 'Login / Signup', slug: '/login' },
  { name: 'Privacy Policy', slug: '/privacy-policy' },
  { name: 'Terms & Conditions', slug: '/terms-and-conditions' },
];

export default function SearchBar() {
  const router = useRouter();
  const [location, setLocation] = useState('');
  const [query, setQuery] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const categoriesRef = useRef([]);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  useEffect(() => {
    getActiveCategories()
      .then((res) => { categoriesRef.current = res.data?.categories || []; })
      .catch(() => { categoriesRef.current = []; });
  }, []);

  const computeSuggestions = useCallback((text) => {
    if (!text || !text.trim()) return [];
    const q = text.trim().toLowerCase();
    const results = [];

    PAGES.forEach((page) => {
      if (page.name.toLowerCase().includes(q)) {
        results.push({ type: 'PAGE', name: page.name, href: page.slug });
      }
    });

    categoriesRef.current.forEach((cat) => {
      if (cat.name.toLowerCase().includes(q)) {
        results.push({ type: 'CATEGORY', name: cat.name, href: `/categories/${cat.slug}` });
      }
      (cat.services || []).forEach((sub) => {
        if (sub.name.toLowerCase().includes(q)) {
          results.push({ type: 'SUBCATEGORY', name: sub.name, parentName: cat.name, href: `/categories/${cat.slug}/${sub.slug}` });
        }
      });
    });

    return results.slice(0, 12);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleQueryChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    setSelectedIndex(-1);
    if (!val.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      if (location.trim()) {
        const params = new URLSearchParams();
        params.append('location', location.trim());
        router.push(`/search?${params.toString()}`);
      }
      return;
    }
    const results = computeSuggestions(val);
    setSuggestions(results);
    setShowSuggestions(results.length > 0);
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery('');
    setShowSuggestions(false);
    setSuggestions([]);
    router.push(suggestion.href);
  };

  const handleQueryKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter') return;
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleSuggestionClick(suggestions[selectedIndex]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  useEffect(() => {
    if (selectedIndex >= 0 && suggestionsRef.current) {
      const el = suggestionsRef.current.children[selectedIndex];
      if (el) el.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  const detectLocationOnDemand = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`);
            const data = await res.json();
            const city = data.address.city || data.address.town || data.address.state_district || '';
            if (city) setLocation(city);
          } catch (err) { console.warn(err); } finally { setIsLocating(false); }
        },
        (error) => { console.warn(error.message); setIsLocating(false); },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else { alert("Location access requires HTTPS."); setIsLocating(false); }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    const params = new URLSearchParams();
    if (location) params.append('location', location);
    if (query) params.append('q', query);
    router.push(`/search?${params.toString()}`);
  };

  const typeLabel = { PAGE: 'PAGE', CATEGORY: 'CATEGORY', SUBCATEGORY: 'SUBCATEGORY' };

  return (
    <div ref={wrapperRef} className="relative w-full max-w-[750px]">
      <form onSubmit={handleSearch} className="flex items-center bg-white rounded-full border border-brand-border h-[52px] w-full shadow-sm hover:shadow-md transition-shadow focus-within:ring-2 focus-within:ring-brand-orange/30 focus-within:border-brand-orange overflow-hidden pl-2 pr-1.5">
        <div className="flex items-center flex-1 h-full pl-3 bg-transparent pr-1">
          <MapPin className={`w-5 h-5 shrink-0 ${isLocating ? 'text-brand-orange animate-pulse' : 'text-brand-muted'}`} />
          <input type="text" placeholder={isLocating ? "Detecting..." : "Enter location..."} value={location} onChange={(e) => {
            setLocation(e.target.value);
            if (!e.target.value.trim()) {
              const params = new URLSearchParams();
              if (query.trim()) params.append('q', query.trim());
              router.push(`/search${params.toString() ? '?' + params.toString() : ''}`);
            }
          }} className="w-full h-full px-3 text-[15px] text-brand-darkText border-none focus:ring-0 focus:outline-none bg-transparent placeholder:text-brand-muted" />
          <button type="button" onClick={detectLocationOnDemand} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors shrink-0">
            <Crosshair className={`w-[18px] h-[18px] transition-all ${isLocating ? 'text-brand-orange opacity-100 animate-spin' : 'text-brand-muted hover:text-brand-navy'}`} />
          </button>
        </div>
        <div className="h-7 w-[1px] bg-brand-border shrink-0 mx-1 md:mx-2"></div>
        <div className="flex items-center flex-[1.5] h-full bg-transparent">
          <Search className="w-5 h-5 text-brand-muted shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Business name, tag or category..."
            value={query}
            onChange={handleQueryChange}
            onKeyDown={handleQueryKeyDown}
            onFocus={() => { if (query.trim() && suggestions.length > 0) setShowSuggestions(true); }}
            autoComplete="off"
            className="w-full h-full px-3 text-[15px] text-brand-darkText border-none focus:ring-0 focus:outline-none bg-transparent placeholder:text-brand-muted"
          />
          <button type="submit" className="h-[42px] px-7 bg-brand-orange hover:bg-[#E04812] text-white text-[15px] font-bold rounded-full transition-colors shrink-0 flex items-center gap-2 ml-2">
            <Search className="w-[18px] h-[18px]" />Enter
          </button>
        </div>
      </form>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl border border-brand-border shadow-lg z-50 overflow-hidden max-h-[380px] overflow-y-auto">
          <ul ref={suggestionsRef}>
            {suggestions.map((s, i) => (
              <li
                key={`${s.type}-${s.href}-${i}`}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSuggestionClick(s)}
                onMouseEnter={() => setSelectedIndex(i)}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${i === selectedIndex ? 'bg-brand-orange/5' : 'hover:bg-slate-50'}`}
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center bg-slate-100">
                  {s.type === 'PAGE' && <Search className="w-4 h-4 text-slate-500" />}
                  {s.type === 'CATEGORY' && <Search className="w-4 h-4 text-brand-orange" />}
                  {s.type === 'SUBCATEGORY' && <ChevronRight className="w-4 h-4 text-brand-orange" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-brand-darkText truncate">{s.name}</div>
                  {s.type === 'SUBCATEGORY' && (
                    <div className="text-[11px] text-brand-muted truncate">{s.parentName}</div>
                  )}
                </div>
                <span className={`flex-shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${s.type === 'PAGE' ? 'bg-slate-100 text-slate-500' : s.type === 'CATEGORY' ? 'bg-brand-orange/10 text-brand-orange' : 'bg-blue-50 text-blue-500'}`}>
                  {typeLabel[s.type]}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {showSuggestions && query.trim() && suggestions.length === 0 && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl border border-brand-border shadow-lg z-50 px-4 py-5 text-center">
          <p className="text-[13px] text-brand-muted">No suggestions found</p>
        </div>
      )}
    </div>
  );
}
