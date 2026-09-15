'use client';

import Link from 'next/link';
import SearchBar from '../navigation/SearchBar';
import { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { usePathname, useRouter } from 'next/navigation'; 
import { Menu, X, MapPin, Search, Crosshair, Loader2, LogOut, LayoutDashboard, ChevronDown, ChevronRight, Heart } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getActiveCategories, getWishlist } from '@/services/userService';

const PAGES = [
  { name: 'Home', slug: '/' },
  { name: 'About', slug: '/about' },
  { name: 'Contact', slug: '/contact' },
  { name: 'Search Businesses', slug: '/search' },
  { name: 'Login / Signup', slug: '/login' },
  { name: 'Privacy Policy', slug: '/privacy-policy' },
  { name: 'Terms & Conditions', slug: '/terms-and-conditions' },
];

export default function Header() {
  const headerRef = useRef(null);
  const pathname = usePathname();
  const router = useRouter(); 
  const { user, loading, logout } = useAuth();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [locationInput, setLocationInput] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileProfileOpen, setIsMobileProfileOpen] = useState(false);
  const [mobileSuggestions, setMobileSuggestions] = useState([]);
  const [showMobileSuggestions, setShowMobileSuggestions] = useState(false);
  const [mobileSelectedIndex, setMobileSelectedIndex] = useState(-1);
  const mobileCategoriesRef = useRef([]);
  const mobileSearchWrapperRef = useRef(null);
  const profileRef = useRef(null);
  const [wishlistCount, setWishlistCount] = useState(0);

  useEffect(() => {
    if (!loading && user?.role === 'USER') {
      getWishlist(1)
        .then((res) => setWishlistCount(res.data?.pagination?.total ?? 0))
        .catch(() => setWishlistCount(0));
    }
  }, [user, loading]);

  const getDashboardRoute = (role) => {
    switch (role) {
      case 'ADMIN': return '/admin/dashboard';
      case 'VENDOR': return '/vendor/dashboard';
      case 'USER': return '/user/dashboard';
      default: return '/user/dashboard';
    }
  };

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
    setIsMobileProfileOpen(false);
    setIsMobileMenuOpen(false);
    router.push('/');
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
      if (mobileSearchWrapperRef.current && !mobileSearchWrapperRef.current.contains(e.target)) {
        setShowMobileSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    getActiveCategories()
      .then((res) => { mobileCategoriesRef.current = res.data?.categories || []; })
      .catch(() => { mobileCategoriesRef.current = []; });
  }, []);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true); 

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();

          const city = data.address.city || data.address.town || data.address.village || data.address.suburb || data.address.county;
          
          if (city) {
            setLocationInput(city);
          } else {
            setLocationInput('Location Found');
          }
        } catch (error) {
          console.error(error);
          alert("Could not fetch location name.");
        } finally {
          setIsLocating(false); 
        }
      },
      (error) => {
        setIsLocating(false);
        alert('Location access denied. Please type your city.');
      }
    );
  };

  const computeMobileSuggestions = useCallback((text) => {
    if (!text || !text.trim()) return [];
    const q = text.trim().toLowerCase();
    const results = [];
    PAGES.forEach((page) => {
      if (page.name.toLowerCase().includes(q)) {
        results.push({ type: 'PAGE', name: page.name, href: page.slug });
      }
    });
    mobileCategoriesRef.current.forEach((cat) => {
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

  const handleMobileSearchChange = (e) => {
    const val = e.target.value;
    setSearchInput(val);
    setMobileSelectedIndex(-1);
    if (!val.trim()) {
      setMobileSuggestions([]);
      setShowMobileSuggestions(false);
      return;
    }
    const results = computeMobileSuggestions(val);
    setMobileSuggestions(results);
    setShowMobileSuggestions(results.length > 0);
  };

  const handleMobileSuggestionClick = (suggestion) => {
    setSearchInput('');
    setShowMobileSuggestions(false);
    setMobileSuggestions([]);
    setIsMobileMenuOpen(false);
    router.push(suggestion.href);
  };

  const handleMobileSearchKeyDown = (e) => {
    if (!showMobileSuggestions || mobileSuggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setMobileSelectedIndex((prev) => (prev < mobileSuggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setMobileSelectedIndex((prev) => (prev > 0 ? prev - 1 : mobileSuggestions.length - 1));
    } else if (e.key === 'Enter' && mobileSelectedIndex >= 0) {
      e.preventDefault();
      handleMobileSuggestionClick(mobileSuggestions[mobileSelectedIndex]);
    } else if (e.key === 'Escape') {
      setShowMobileSuggestions(false);
      setMobileSelectedIndex(-1);
    }
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(headerRef.current, {
        y: -20,
        opacity: 0,
        duration: 0.5,
        ease: 'power2.out'
      });
    });
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileMenuOpen]);

  const userInitial = user?.role ? user.role.charAt(0) : '?';

  return (
    <>
      <header 
        ref={headerRef}
        className="fixed top-4 left-0 w-full z-40 px-4 md:px-6 flex justify-center pointer-events-none"
      >
        <div className="pointer-events-auto w-full h-[65px] max-w-screen-xl mx-auto px-4 lg:px-6 rounded-2xl bg-white/75 backdrop-blur-md shadow-lg border border-brand-border/50 flex items-center justify-between gap-8 transition-all">
          
          <Link href="/" className="shrink-0">
            <div className="flex items-center gap-2.5">
               <img 
                 src="/logo.webp" 
                 alt="Logo" 
                 className="w-[130px] md:w-[160px] h-auto" 
               />
            </div>
          </Link>

          <div className="hidden lg:flex flex-grow justify-center max-w-[740px] px-4">
            <SearchBar />
          </div>

          <nav className="hidden lg:flex items-center gap-2 shrink-0 text-[16px] font-bold">
            <Link 
              href="/about" 
              className={`px-4 py-2 rounded-xl transition-colors ${
                pathname === '/about' ? 'bg-brand-orange/10 text-brand-orange' : 'text-brand-navy hover:bg-brand-orange/10 hover:text-brand-orange'
              }`}
            >
              About
            </Link>
            <Link 
              href="/contact" 
              className={`px-4 py-2 rounded-xl transition-colors ${
                pathname === '/contact' ? 'bg-brand-orange/10 text-brand-orange' : 'text-brand-navy hover:bg-brand-orange/10 hover:text-brand-orange'
              }`}
            >
              Contact
            </Link>

            {!loading && user?.role === 'USER' && (
              <Link 
                href="/user/wishlist" 
                className={`relative p-2 rounded-xl transition-colors ${
                  pathname === '/user/wishlist' ? 'bg-brand-orange/10 text-brand-orange' : 'text-brand-navy hover:bg-brand-orange/10 hover:text-brand-orange'
                }`}
              >
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brand-orange px-1 text-[9px] font-bold text-white leading-none">
                    {wishlistCount > 99 ? '99+' : wishlistCount}
                  </span>
                )}
              </Link>
            )}

            {!loading && (
              <>
                {!user ? (
                  <Link 
                    href="/login" 
                    className="ml-2 px-6 py-2 rounded-xl border border-brand-border text-brand-navy hover:border-brand-navy hover:bg-brand-light transition-colors bg-white/50"
                  >
                    Login/Signup
                  </Link>
                ) : (
                  <div className="relative ml-2" ref={profileRef}>
                    <button
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-brand-border bg-white/50 hover:bg-brand-light transition-colors cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-full bg-brand-orange text-white flex items-center justify-center text-[14px] font-bold shrink-0">
                        {userInitial}
                      </div>

                      <ChevronDown className={`w-4 h-4 text-brand-muted transition-transform hidden xl:block ${isProfileOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isProfileOpen && (
                      <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-brand-border/50 py-2 z-50">
                        <div className="px-4 py-3 border-b border-brand-border/50 xl:hidden">
                          <p className="text-[14px] font-bold text-brand-navy line-clamp-1">{user.fullName}</p>
                          <p className="text-[11px] font-semibold text-brand-orange uppercase tracking-wider mt-0.5">{user.role}</p>
                        </div>
                        <Link
                          href={getDashboardRoute(user.role)}
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-[14px] font-semibold text-brand-navy hover:bg-brand-light hover:text-brand-orange transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          Dashboard
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-[14px] font-semibold text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </nav>

          <div className="flex items-center gap-2 lg:hidden pointer-events-auto">
            <Link 
             href="/search"
              className="w-9 h-9 flex items-center justify-center rounded-full  text-black shadow-sm hover:bg-[#D84A06] transition-colors"
            >
              <MapPin className="w-5 h-5" />
            </Link>
            <button 
              className="p-1.5 text-brand-navy hover:text-brand-orange transition-colors"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
          
        </div>
      </header>

      <div 
        className={`fixed inset-0 bg-brand-navy/60 backdrop-blur-sm z-[50] transition-opacity duration-300 lg:hidden ${
          isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      <div 
        className={`fixed top-0 right-0 h-full w-[85%] max-w-[320px] bg-white z-[60] shadow-2xl transition-transform duration-300 ease-in-out lg:hidden flex flex-col ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-brand-border/50">
          <img src="/logo.webp" alt="Logo" className="h-auto w-[130px]" />
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 rounded-full bg-brand-light text-brand-muted hover:text-brand-orange transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8">
          
          <div className="w-full flex flex-col gap-2.5 p-4 bg-[#F7F8FA] rounded-2xl border border-brand-border">
            
            <div className="flex items-center bg-white p-2 rounded-xl relative">
              <MapPin className="w-[18px] h-[18px] text-brand-orange shrink-0 ml-1.5 mr-2.5" />
              <input 
                type="text" 
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                placeholder={isLocating ? "Detecting..." : "Enter location..."} 
                className="w-full text-[14px] bg-transparent outline-none border-none focus:ring-0 p-0 text-brand-navy font-medium placeholder:font-normal placeholder:text-gray-400" 
              />
              <button 
                type="button"
                onClick={handleGetLocation}
                disabled={isLocating}
                className="w-9 h-9 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center shrink-0 transition-all ml-1 active:scale-95 cursor-pointer z-10 disabled:opacity-50"
              >
                {isLocating ? (
                  <Loader2 className="w-[18px] h-[18px] text-brand-orange animate-spin" />
                ) : (
                  <Crosshair className="w-[18px] h-[18px] text-brand-navy opacity-60 hover:opacity-100 pointer-events-none" />
                )}
              </button>
            </div>
            
            <div className="relative" ref={mobileSearchWrapperRef}>
              <div className="flex items-center bg-white p-2 rounded-xl">
                <Search className="w-[18px] h-[18px] text-brand-orange shrink-0 ml-1.5 mr-2.5" />
                <input 
                  type="text" 
                  value={searchInput}
                  onChange={handleMobileSearchChange}
                  onKeyDown={handleMobileSearchKeyDown}
                  onFocus={() => { if (searchInput.trim() && mobileSuggestions.length > 0) setShowMobileSuggestions(true); }}
                  autoComplete="off"
                  placeholder="Search printers..." 
                  className="w-full h-9 text-[14px] bg-transparent outline-none border-none focus:ring-0 p-0 text-brand-navy font-medium placeholder:font-normal placeholder:text-gray-400" 
                />
              </div>

              {showMobileSuggestions && mobileSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl border border-brand-border shadow-lg z-50 overflow-hidden max-h-[260px] overflow-y-auto">
                  <ul>
                    {mobileSuggestions.map((s, i) => (
                      <li
                        key={`m-${s.type}-${s.href}-${i}`}
                        onClick={() => handleMobileSuggestionClick(s)}
                        className={`flex items-center gap-2.5 px-3 py-2.5 cursor-pointer transition-colors ${i === mobileSelectedIndex ? 'bg-brand-orange/5' : 'hover:bg-slate-50'}`}
                      >
                        <div className="flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center bg-slate-100">
                          {s.type === 'PAGE' && <Search className="w-3.5 h-3.5 text-slate-500" />}
                          {s.type === 'CATEGORY' && <Search className="w-3.5 h-3.5 text-brand-orange" />}
                          {s.type === 'SUBCATEGORY' && <ChevronRight className="w-3.5 h-3.5 text-brand-orange" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[12px] font-semibold text-brand-darkText truncate">{s.name}</div>
                          {s.type === 'SUBCATEGORY' && (
                            <div className="text-[10px] text-brand-muted truncate">{s.parentName}</div>
                          )}
                        </div>
                        <span className={`flex-shrink-0 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${s.type === 'PAGE' ? 'bg-slate-100 text-slate-500' : s.type === 'CATEGORY' ? 'bg-brand-orange/10 text-brand-orange' : 'bg-blue-50 text-blue-500'}`}>
                          {s.type}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {showMobileSuggestions && searchInput.trim() && mobileSuggestions.length === 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl border border-brand-border shadow-lg z-50 px-3 py-4 text-center">
                  <p className="text-[12px] text-brand-muted">No suggestions found</p>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                const params = new URLSearchParams();
                if (locationInput.trim()) params.set('location', locationInput.trim());
                if (searchInput.trim()) params.set('q', searchInput.trim());
                router.push(`/search?${params.toString()}`);
              }}
              className="w-full bg-[#EA580C] hover:bg-[#D84A06] text-white py-3 rounded-xl font-bold text-[14px] mt-2 transition-colors shadow-sm active:scale-[0.98]"
            >
              Search
            </button>
          </div>

          <nav className="flex flex-col gap-3 text-[16px] font-bold">
            <Link href="/about" onClick={() => setIsMobileMenuOpen(false)} className="p-4 rounded-xl text-brand-navy bg-brand-light/50 hover:bg-brand-orange/10 hover:text-brand-orange transition-colors">
              About
            </Link>
            <Link href="/contact" onClick={() => setIsMobileMenuOpen(false)} className="p-4 rounded-xl text-brand-navy bg-brand-light/50 hover:bg-brand-orange/10 hover:text-brand-orange transition-colors">
              Contact
            </Link>
            {!loading && user?.role === 'USER' && (
              <Link href="/user/wishlist" onClick={() => setIsMobileMenuOpen(false)} className={`relative flex items-center gap-3 p-4 rounded-xl text-brand-navy bg-brand-light/50 hover:bg-brand-orange/10 hover:text-brand-orange transition-colors ${pathname === '/user/wishlist' ? 'bg-brand-orange/10 text-brand-orange' : ''}`}>
                <span className="relative">
                  <Heart className="w-5 h-5" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brand-orange px-1 text-[9px] font-bold text-white leading-none">
                      {wishlistCount > 99 ? '99+' : wishlistCount}
                    </span>
                  )}
                </span>
                Wishlist
              </Link>
            )}
          </nav>
        </div>

        <div className="p-6 border-t border-brand-border/50">
          {!loading && (
            <>
              {!user ? (
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center w-full py-4 rounded-xl border-2 border-brand-navy text-brand-navy hover:bg-brand-navy hover:text-white transition-colors font-bold text-[16px]">
                  Login/Signup
                </Link>
              ) : (
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => setIsMobileProfileOpen(!isMobileProfileOpen)}
                    className="flex items-center gap-3 w-full p-3 rounded-xl bg-brand-light border border-brand-border cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-full bg-brand-orange text-white flex items-center justify-center text-[16px] font-bold shrink-0">
                      {userInitial}
                    </div>

                    <ChevronDown className={`w-4 h-4 text-brand-muted transition-transform ${isMobileProfileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isMobileProfileOpen && (
                    <div className="flex flex-col gap-1 pl-3">
                      <Link
                        href={getDashboardRoute(user.role)}
                        onClick={() => { setIsMobileProfileOpen(false); setIsMobileMenuOpen(false); }}
                        className="flex items-center gap-3 p-3 rounded-xl text-[14px] font-semibold text-brand-navy hover:bg-brand-orange/10 hover:text-brand-orange transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        Dashboard
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 p-3 rounded-xl text-[14px] font-semibold text-red-500 hover:bg-red-50 transition-colors cursor-pointer text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
