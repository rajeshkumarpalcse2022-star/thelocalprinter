'use client';

import { MapPin, Search, ChevronRight, AlertCircle, Loader2 } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getActiveCategories, getPublicFilterOptions, getLocationAutocomplete } from '@/services/userService';

const LOCATION_DEBOUNCE_MS = 300;
const LOCATION_LIMIT = 5;

export default function SearchBar() {
  const router = useRouter();
  const [location, setLocation] = useState('');
  const [query, setQuery] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const categoriesRef = useRef([]);
  const citiesRef = useRef([]);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const locationWrapperRef = useRef(null);
  const [notification, setNotification] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [locationSelectedIndex, setLocationSelectedIndex] = useState(-1);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const locationSuggestionsRef = useRef(null);
  // Structured info for the selected location (display string is still what
  // the existing search contract uses). Kept in a ref so selecting a
  // suggestion never triggers navigation/search by itself.
  const locationMetaRef = useRef(null);
  const locationDebounceRef = useRef(null);
  const locationAbortRef = useRef(null);
  const locationRequestIdRef = useRef(0);

  useEffect(() => {
    getActiveCategories()
      .then((res) => { categoriesRef.current = res.data?.categories || []; })
      .catch(() => { categoriesRef.current = []; });
    getPublicFilterOptions()
      .then((res) => { citiesRef.current = res.data?.cities || []; })
      .catch(() => { citiesRef.current = []; });
  }, []);

  const computeSuggestions = useCallback((text) => {
    if (!text || !text.trim()) return [];
    const q = text.trim().toLowerCase();
    const results = [];

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
      // The location dropdown is rendered outside locationWrapperRef, so a
      // mousedown on a suggestion must NOT count as outside — otherwise the
      // dropdown unmounts before the suggestion's click event can fire and
      // the location field never gets populated.
      const inLocationInput = locationWrapperRef.current?.contains(e.target);
      const inLocationList = locationSuggestionsRef.current?.contains(e.target);
      if (!inLocationInput && !inLocationList) {
        setShowLocationSuggestions(false);
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
      return;
    }
    const results = computeSuggestions(val);
    setSuggestions(results);
    setShowSuggestions(results.length > 0);
  };

  // DB cities are only a graceful offline fallback — primary source is the
  // server-side location autocomplete (real places, not just DB cities).
  const computeDbLocationFallback = useCallback((text) => {
    const q = text.trim().toLowerCase();
    if (!q) return [];
    return citiesRef.current
      .filter((city) => city.toLowerCase().includes(q))
      .slice(0, LOCATION_LIMIT)
      .map((city) => ({ placeId: `db-${city}`, displayName: city, city, state: '', country: '', lat: null, lon: null }));
  }, []);

  const fetchLocationSuggestions = useCallback((text) => {
    const query = (text || '').trim();
    if (locationDebounceRef.current) clearTimeout(locationDebounceRef.current);
    if (locationAbortRef.current) locationAbortRef.current.abort();
    if (!query) {
      setLocationSuggestions([]);
      setShowLocationSuggestions(false);
      setIsLocationLoading(false);
      return;
    }
    setIsLocationLoading(true);
    setShowLocationSuggestions(true);
    const requestId = ++locationRequestIdRef.current;
    locationDebounceRef.current = setTimeout(async () => {
      const controller = new AbortController();
      locationAbortRef.current = controller;
      try {
        const res = await getLocationAutocomplete(query, LOCATION_LIMIT, controller.signal);
        if (locationRequestIdRef.current !== requestId) return; // stale response
        const list = (res?.data?.locations || []).slice(0, LOCATION_LIMIT);
        setLocationSuggestions(list);
        setLocationSelectedIndex(-1);
      } catch (err) {
        if (err?.code === 'ERR_CANCELED' || err?.name === 'CanceledError' || err?.name === 'AbortError') return;
        if (locationRequestIdRef.current !== requestId) return;
        // Graceful fallback: keep typed text, show DB cities if any.
        setLocationSuggestions(computeDbLocationFallback(query));
        setLocationSelectedIndex(-1);
      } finally {
        if (locationRequestIdRef.current === requestId) setIsLocationLoading(false);
      }
    }, LOCATION_DEBOUNCE_MS);
  }, [computeDbLocationFallback]);

  useEffect(() => () => {
    if (locationDebounceRef.current) clearTimeout(locationDebounceRef.current);
    if (locationAbortRef.current) locationAbortRef.current.abort();
  }, []);

  const handleLocationChange = (e) => {
    const val = e.target.value;
    setLocation(val);
    locationMetaRef.current = null;
    setLocationSelectedIndex(-1);
    fetchLocationSuggestions(val);
  };

  const handleLocationSuggestionClick = (suggestion) => {
    if (!suggestion) return;
    // ONLY populate the LEFT location field — no navigation, no search.
    setLocation(suggestion.displayName);
    locationMetaRef.current = suggestion;
    setShowLocationSuggestions(false);
    setLocationSuggestions([]);
    setLocationSelectedIndex(-1);
    setIsLocationLoading(false);
  };

  const handleLocationKeyDown = (e) => {
    if (!showLocationSuggestions || (locationSuggestions.length === 0 && !isLocationLoading)) {
      if (e.key === 'Escape') setShowLocationSuggestions(false);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setLocationSelectedIndex((prev) => (prev < locationSuggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setLocationSelectedIndex((prev) => (prev > 0 ? prev - 1 : locationSuggestions.length - 1));
    } else if (e.key === 'Enter' && locationSelectedIndex >= 0) {
      e.preventDefault();
      handleLocationSuggestionClick(locationSuggestions[locationSelectedIndex]);
    } else if (e.key === 'Escape') {
      setShowLocationSuggestions(false);
      setLocationSelectedIndex(-1);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion.name);
    setShowSuggestions(false);
    setSuggestions([]);
    setSelectedIndex(-1);
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

  useEffect(() => {
    if (locationSelectedIndex >= 0 && locationSuggestionsRef.current) {
      const el = locationSuggestionsRef.current.children[locationSelectedIndex];
      if (el) el.scrollIntoView({ block: 'nearest' });
    }
  }, [locationSelectedIndex]);

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
    setShowLocationSuggestions(false);
    if (!location.trim() || !query.trim()) {
      setNotification('Please fill both location and search field.');
      setTimeout(() => setNotification(''), 3000);
      return;
    }
    const params = new URLSearchParams();
    params.append('location', location.trim());
    params.append('q', query.trim());
    router.push(`/search?${params.toString()}`);
  };

  const typeLabel = { CATEGORY: 'CATEGORY', SUBCATEGORY: 'SUBCATEGORY' };

  return (
    <div ref={wrapperRef} className="relative w-full max-w-[750px]">
      {notification && (
        <div className="flex items-center gap-2 px-4 py-2.5 mb-2 bg-red-50 border border-red-200 rounded-xl text-red-600 text-[13px] font-medium z-50 shadow-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {notification}
        </div>
      )}
      <form onSubmit={handleSearch} className="flex items-center bg-white rounded-full border border-brand-border h-[52px] w-full shadow-sm hover:shadow-md transition-shadow focus-within:ring-2 focus-within:ring-brand-orange/30 focus-within:border-brand-orange overflow-hidden pl-2 pr-1.5">
        <div ref={locationWrapperRef} className="relative flex items-center flex-1 h-full pl-3 bg-transparent pr-1">
          <MapPin className={`w-5 h-5 shrink-0 ${isLocating ? 'text-brand-orange animate-pulse' : 'text-brand-muted'}`} />
          <input type="text" placeholder={isLocating ? "Detecting..." : "Enter location..."} value={location} onChange={handleLocationChange} onKeyDown={handleLocationKeyDown} onFocus={() => { if (location.trim()) fetchLocationSuggestions(location); }} autoComplete="off" className="w-full h-full px-3 text-[15px] text-brand-darkText border-none focus:ring-0 focus:outline-none bg-transparent placeholder:text-brand-muted" />
        </div>
        <div className="h-7 w-[1px] bg-brand-border shrink-0 mx-1 md:mx-2"></div>
        <div className="flex items-center flex-[1.5] h-full bg-transparent">
          <Search className="w-5 h-5 text-brand-muted shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search category or subcategory..."
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

      {showLocationSuggestions && (
        <div className="absolute left-0 top-[52px] mt-1 w-full sm:max-w-[340px] sm:w-[340px] max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-900 rounded-2xl border border-brand-border shadow-lg z-50 overflow-hidden max-h-[280px] overflow-y-auto">
          {isLocationLoading && locationSuggestions.length === 0 ? (
            <div className="flex items-center gap-2.5 px-4 py-3 text-[13px] text-brand-muted">
              <Loader2 className="w-4 h-4 animate-spin text-brand-orange shrink-0" />
              Finding locations…
            </div>
          ) : locationSuggestions.length > 0 ? (
            <ul ref={locationSuggestionsRef}>
              {locationSuggestions.map((s, i) => (
                <li
                  key={`loc-${s.placeId}-${i}`}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleLocationSuggestionClick(s)}
                  onMouseEnter={() => setLocationSelectedIndex(i)}
                  className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${i === locationSelectedIndex ? 'bg-brand-orange/5' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                >
                  <MapPin className="w-4 h-4 text-brand-orange shrink-0" />
                  <span className="min-w-0">
                    <span className="block text-[13px] font-semibold text-brand-darkText dark:text-slate-100 truncate">{s.displayName}</span>
                    {(s.state || s.country) && (
                      <span className="block text-[11px] text-brand-muted truncate">{[s.state, s.country].filter(Boolean).join(', ')}</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-3 text-[13px] text-brand-muted">No locations found</div>
          )}
        </div>
      )}

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
                  {s.type === 'CATEGORY' && <Search className="w-4 h-4 text-brand-orange" />}
                  {s.type === 'SUBCATEGORY' && <ChevronRight className="w-4 h-4 text-brand-orange" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-brand-darkText truncate">{s.name}</div>
                  {s.type === 'SUBCATEGORY' && (
                    <div className="text-[11px] text-brand-muted truncate">{s.parentName}</div>
                  )}
                </div>
                <span className={`flex-shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${s.type === 'CATEGORY' ? 'bg-brand-orange/10 text-brand-orange' : 'bg-blue-50 text-blue-500'}`}>
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
