'use client';

import { Suspense, useEffect, useRef, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import gsap from 'gsap';
import {
  SlidersHorizontal,
  MapPin,
  Search,
  X,
  ChevronDown,
  Loader2,
  Building2,
  Sun,
  Moon,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { searchPublicBusinesses, getPublicFilterOptions } from '@/services/userService';

const CustomDropdown = ({ value, onChange, options, placeholder = "Select...", minWidth = "min-w-[220px]", align = "left", direction = "down" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative w-full ${isOpen ? 'z-[60]' : 'z-40'}`} ref={dropdownRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-[13px] lg:text-[14px] text-brand-navy font-semibold outline-none bg-transparent p-0 border-none cursor-pointer flex justify-between items-center group"
      >
        <span className="truncate pr-4 select-none">{value || placeholder}</span>
        <ChevronDown className={`w-[18px] h-[18px] text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-brand-orange' : 'group-hover:text-brand-orange'}`} />
      </div>

      <div
        className={`absolute ${direction === 'up' ? 'bottom-[130%]' : 'top-[130%]'} ${align === 'right' ? 'right-0' : 'left-0'} ${minWidth} bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.1)] border border-gray-100 py-3 transition-all duration-300 ${isOpen ? 'opacity-100 visible translate-y-0' : `opacity-0 invisible ${direction === 'up' ? 'translate-y-[15px]' : '-translate-y-[15px]'}`}`}
      >
        {options.map((opt, i) => (
          <div
            key={i}
            onClick={() => { onChange(opt); setIsOpen(false); }}
            className="relative block py-3 pr-5 text-[14px] font-semibold text-brand-navy transition-all duration-300 hover:bg-brand-orange/5 hover:text-brand-orange cursor-pointer group/item pl-5 hover:pl-8"
          >
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-0 bg-brand-orange transition-all duration-300 ease-out group-hover/item:h-[60%] rounded-r-md"></div>
            {opt}
          </div>
        ))}
      </div>
    </div>
  );
};

const API_MAP = {
  filterOrder: { 'All order types': '', 'On Call': 'on_call', 'Shop Visit': 'shop_visit' },
  filterService: { 'All services': '', 'Print only': 'print_only', 'Design & Print': 'full_with_design' },
  filterLimit: { 'Any': '', 'No Limit': 'no_limit', 'Single': 'single', 'Minimum': 'minimum', 'Bulk': 'bulk' },
};

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const containerRef = useRef(null);

  const [keyword, setKeyword] = useState(searchParams.get('q') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');

  useEffect(() => {
    const loc = searchParams.get('location') || '';
    const q = searchParams.get('q') || '';
    setLocation(loc);
    setKeyword(q);
  }, [searchParams]);
  const [filterCategory, setFilterCategory] = useState('All Categories');
  const [filterRating, setFilterRating] = useState('Any rating');
  const [filterService, setFilterService] = useState('All services');
  const [filterOrder, setFilterOrder] = useState('All order types');
  const [filterDeal, setFilterDeal] = useState('B2B, B2C & both');
  const [filterLimit, setFilterLimit] = useState('Any');
  const [showFilters, setShowFilters] = useState(false);

  const [businesses, setBusinesses] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [filterOptions, setFilterOptions] = useState({ categories: [] });
  const [currentPage, setCurrentPage] = useState(1);

  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const saved = localStorage.getItem('search-theme');
    if (saved === 'dark') {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    } else {
      setTheme('light');
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    localStorage.setItem('search-theme', next);
    if (next === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  useEffect(() => {
    getPublicFilterOptions().then(res => {
      if (res?.data) setFilterOptions(res.data);
    }).catch(() => {});
  }, []);

  const hasActiveFilters = !!(keyword.trim() || location.trim() || filterCategory !== 'All Categories' || filterService !== 'All services' || filterOrder !== 'All order types' || filterDeal !== 'B2B, B2C & both' || filterLimit !== 'Any' || filterRating !== 'Any rating');

  const filtersRef = useRef({});
  filtersRef.current = { keyword, location, filterCategory, filterService, filterOrder, filterDeal, filterLimit, filterRating, filterOptions };

  const doFetch = useCallback(async (page = 1) => {
    const f = filtersRef.current;
    setLoading(true);
    try {
      const params = { page, limit: 12 };
      if (f.keyword.trim()) params.search = f.keyword.trim();
      if (f.location.trim()) params.city = f.location.trim();
      if (f.filterCategory && f.filterCategory !== 'All Categories') {
        const cat = f.filterOptions.categories?.find(c => c.name === f.filterCategory);
        if (cat) params.categoryId = cat.id;
      }
      if (f.filterService !== 'All services') {
        const v = API_MAP.filterService[f.filterService];
        if (v) params.serviceType = v;
      }
      if (f.filterOrder !== 'All order types') {
        const v = API_MAP.filterOrder[f.filterOrder];
        if (v) params.orderingMethod = v;
      }
      if (f.filterDeal !== 'B2B, B2C & both') {
        params.customerType = API_MAP.dealWith?.[f.filterDeal] || '';
      }
      if (f.filterLimit !== 'Any') {
        const v = API_MAP.filterLimit[f.filterLimit];
        if (v) params.orderLimits = v;
      }
      if (f.filterRating !== 'Any rating') {
        params.minRating = f.filterRating === '4 Stars & up' ? 4 : 3;
      }

      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) delete params[key];
      });

      const res = await searchPublicBusinesses(params);
      if (res?.data) {
        setBusinesses(res.data.businesses || []);
        setPagination(res.data.pagination || { page: 1, limit: 12, total: 0, pages: 0 });
      }
    } catch (err) {
      console.error('Search failed:', err);
      setBusinesses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    doFetch(1);
    setCurrentPage(1);
  }, [keyword, location, filterCategory, filterService, filterOrder, filterDeal, filterLimit, filterRating, filterOptions, doFetch]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    doFetch(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearAllFilters = () => {
    setKeyword('');
    setLocation('');
    setFilterCategory('All Categories');
    setFilterService('All services');
    setFilterOrder('All order types');
    setFilterDeal('B2B, B2C & both');
    setFilterLimit('Any');
    setFilterRating('Any rating');
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.search-top-block', { y: 20, opacity: 0, duration: 0.5, ease: 'power2.out' });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const categoryOptions = ['All Categories', ...(filterOptions.categories?.map(c => c.name) || [])];

  const isDark = theme === 'dark';

  return (
    <div ref={containerRef} className={`min-h-screen pt-[100px] pb-12 px-4 md:px-6 flex flex-col items-center transition-colors duration-300 ${isDark ? 'bg-gray-900' : 'bg-[#F7F8FA]'}`}>
      <div className="max-w-screen-xl w-full flex flex-col items-center">

        <div className="search-top-block relative z-30 w-full flex flex-col items-center mb-6">

          <div className="mt-5 flex flex-col gap-3 items-center w-full max-w-[1300px]">
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
              <button onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2.5 text-[14px] font-extrabold transition-all duration-300 px-6 py-3 rounded-full shadow-md hover:shadow-lg border w-full sm:w-auto justify-center ${isDark ? 'bg-gray-800 border-gray-700 ' + (showFilters ? 'text-brand-orange border-brand-orange/20' : 'text-gray-200 hover:text-brand-orange') : 'bg-white border-gray-100 ' + (showFilters ? 'text-brand-orange border-brand-orange/20' : 'text-brand-navy hover:text-brand-orange')}`}>
                <SlidersHorizontal className="w-[18px] h-[18px]" strokeWidth={2.5} />
                Filters & Radius
              </button>
              <button onClick={toggleTheme}
                className={`flex items-center gap-2 text-[14px] font-extrabold transition-all duration-300 px-5 py-3 rounded-full shadow-md hover:shadow-lg border w-full sm:w-auto justify-center ${isDark ? 'bg-gray-800 border-gray-700 text-yellow-400 hover:text-yellow-300' : 'bg-white border-gray-100 text-brand-navy hover:text-brand-orange'}`}>
                {isDark ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
                {isDark ? 'Light Mode' : 'Dark Mode'}
              </button>
            </div>
          </div>

          <div className={`w-full max-w-[1300px] grid transition-[grid-template-rows,opacity,margin] duration-500 ease-in-out ${showFilters ? 'grid-rows-[1fr] opacity-100 mt-6' : 'grid-rows-[0fr] opacity-0 mt-0'}`}>
            <div className="overflow-hidden">
              <div className={`w-full border rounded-3xl px-6 md:px-8 pt-8 pb-8 shadow-sm ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                  <div className="flex flex-col relative">
                    <label className={`text-[11px] font-extrabold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-300' : 'text-brand-navy'}`}>Category</label>
                    <div className={`border-b py-1.5 transition-colors ${isDark ? 'border-gray-600 hover:border-gray-400' : 'border-gray-100 hover:border-gray-300'}`}>
                      <CustomDropdown value={filterCategory} onChange={setFilterCategory} options={categoryOptions} />
                    </div>
                  </div>
                  <div className="flex flex-col relative">
                    <label className={`text-[11px] font-extrabold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-300' : 'text-brand-navy'}`}>Rating (Minimum)</label>
                    <div className={`border-b py-1.5 transition-colors ${isDark ? 'border-gray-600 hover:border-gray-400' : 'border-gray-100 hover:border-gray-300'}`}>
                      <CustomDropdown value={filterRating} onChange={setFilterRating} options={['Any rating', '4 Stars & up', '3 Stars & up']} />
                    </div>
                  </div>
                  <div className="flex flex-col relative">
                    <label className={`text-[11px] font-extrabold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-300' : 'text-brand-navy'}`}>Service</label>
                    <div className={`border-b py-1.5 transition-colors ${isDark ? 'border-gray-600 hover:border-gray-400' : 'border-gray-100 hover:border-gray-300'}`}>
                      <CustomDropdown value={filterService} onChange={setFilterService} options={['All services', 'Print only', 'Design & Print']} direction="up" />
                    </div>
                  </div>
                  <div className="flex flex-col relative">
                    <label className={`text-[11px] font-extrabold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-300' : 'text-brand-navy'}`}>Order</label>
                    <div className={`border-b py-1.5 transition-colors ${isDark ? 'border-gray-600 hover:border-gray-400' : 'border-gray-100 hover:border-gray-300'}`}>
                      <CustomDropdown value={filterOrder} onChange={setFilterOrder} options={['All order types', 'On Call', 'Shop Visit']} direction="up" />
                    </div>
                  </div>
                  <div className="flex flex-col relative">
                    <label className={`text-[11px] font-extrabold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-300' : 'text-brand-navy'}`}>Deal With</label>
                    <div className={`border-b py-1.5 transition-colors ${isDark ? 'border-gray-600 hover:border-gray-400' : 'border-gray-100 hover:border-gray-300'}`}>
                      <CustomDropdown value={filterDeal} onChange={setFilterDeal} options={['B2B, B2C & both', 'B2B only', 'B2C only']} direction="up" />
                    </div>
                  </div>
                  <div className="flex flex-col relative">
                    <label className={`text-[11px] font-extrabold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-300' : 'text-brand-navy'}`}>Orders Limit</label>
                    <div className={`border-b py-1.5 transition-colors ${isDark ? 'border-gray-600 hover:border-gray-400' : 'border-gray-100 hover:border-gray-300'}`}>
                      <CustomDropdown value={filterLimit} onChange={setFilterLimit} options={['Any', 'No Limit', 'Single', 'Minimum', 'Bulk']} direction="up" />
                    </div>
                  </div>
                  <div className="flex items-end">
                    <button onClick={() => { doFetch(1); setCurrentPage(1); }}
                      className="w-full h-[44px] bg-[#1C364F] hover:bg-[#122538] text-white rounded-xl font-bold text-[14px] transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2">
                      <SlidersHorizontal className="w-4 h-4" /> Apply Filters
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full max-w-[1300px] flex flex-col mt-4">
          <div className="relative z-20 border-b pb-5 mb-8 transition-colors duration-300"
            style={{ borderColor: isDark ? '#374151' : '#e5e7eb' }}>
            <div className="flex flex-col">
              <h2 className={`text-[20px] md:text-[24px] font-extrabold transition-colors ${isDark ? 'text-gray-100' : 'text-brand-navy'}`}>
                {loading ? 'Searching...' : `${pagination.total} result${pagination.total !== 1 ? 's' : ''} found`}
              </h2>
              {hasActiveFilters && !loading && (
                <p className={`text-[14px] font-medium mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {location.trim() ? `in ${location.trim()}` : 'Filtered results'}
                </p>
              )}
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className={`w-10 h-10 animate-spin mb-4 ${isDark ? 'text-brand-orange' : 'text-brand-orange'}`} />
              <p className={`text-[16px] font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Searching for businesses...</p>
            </div>
          ) : businesses.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {businesses.map((biz) => (
                  <Card key={biz._id}
                    className={`cursor-pointer group border-0 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}
                    onClick={() => router.push(`/businesses/${biz._id}`)}>
                    <div className="h-44 bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center text-slate-300 relative overflow-hidden">
                      {biz.verificationMedia?.thumbnailImages?.[0] ? (
                        <img src={biz.verificationMedia.thumbnailImages[0]} alt={biz.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <Building2 size={40} strokeWidth={1.5} />
                      )}
                      {biz.category && (
                        <div className="absolute top-3 left-3">
                          <span className="inline-flex items-center gap-1 bg-white/90 backdrop-blur-sm text-xs font-semibold text-slate-700 px-2.5 py-1 rounded-full shadow-sm">
                            {biz.categoryId?.image && (
                              biz.categoryId.image.trim().startsWith('<') ? <span className="h-3.5 w-3.5 [&>svg]:w-3.5 [&>svg]:h-3.5" dangerouslySetInnerHTML={{ __html: biz.categoryId.image }} /> : <img src={biz.categoryId.image} alt="" className="h-3.5 w-3.5 object-contain" />
                            )}
                            {biz.category}
                          </span>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4 space-y-2">
                      <h4 className={`text-[15px] font-bold truncate group-hover:text-[#EA580C] transition-colors ${isDark ? 'text-gray-100' : 'text-slate-900'}`}>{biz.name}</h4>
                      {biz.city && (
                        <p className={`flex items-center gap-1 text-xs ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                          <MapPin size={12} className="text-[#EA580C] shrink-0" />
                          <span className="truncate">{biz.city}{biz.address ? `, ${biz.address}` : ""}</span>
                        </p>
                      )}
                      {biz.serviceIds && biz.serviceIds.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-0.5">
                          {biz.serviceIds.slice(0, 3).map((service) => (
                            <span key={service._id} className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${isDark ? 'text-gray-300 bg-gray-700' : 'text-slate-600 bg-slate-100'}`}>
                              {service.name}
                            </span>
                          ))}
                          {biz.serviceIds.length > 3 && (
                            <span className={`text-[10px] font-medium ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>+{biz.serviceIds.length - 3}</span>
                          )}
                        </div>
                      )}
                      {biz.description && (
                        <p className={`text-xs line-clamp-1 pt-0.5 ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>
                          {biz.description}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {pagination.pages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                    <button key={page} onClick={() => handlePageChange(page)}
                      className={`w-10 h-10 rounded-xl font-bold text-[14px] transition-all ${currentPage === page ? 'bg-[#EA580C] text-white shadow-md' : isDark ? 'bg-gray-800 border border-gray-700 text-gray-300 hover:border-brand-orange hover:text-brand-orange' : 'bg-white border border-gray-200 text-brand-navy hover:border-brand-orange hover:text-brand-orange'}`}>
                      {page}
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className={`flex flex-col items-center justify-center text-center py-16 rounded-3xl border shadow-sm ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
              <div className={`w-[72px] h-[72px] mb-6 flex items-center justify-center rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <Search className={`w-8 h-8 ${isDark ? 'text-gray-500' : 'text-gray-300'}`} strokeWidth={2.5} />
              </div>
              <h3 className={`text-[22px] font-extrabold mb-2 ${isDark ? 'text-gray-100' : 'text-brand-navy'}`}>No businesses found nearby</h3>
              <p className={`text-[15px] font-medium mb-8 max-w-[400px] ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Try adjusting your search filters or expanding the area to find what you're looking for.</p>
              <button onClick={clearAllFilters}
                className="bg-[#1C364F] hover:bg-[#122538] text-white px-8 py-3.5 rounded-full font-bold text-[14px] transition-all shadow-md hover:shadow-lg flex items-center gap-2">
                <X className="w-4 h-4" /> Clear All Filters
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center"><div className="animate-pulse text-gray-400">Loading search...</div></div>}>
      <SearchContent />
    </Suspense>
  );
}
