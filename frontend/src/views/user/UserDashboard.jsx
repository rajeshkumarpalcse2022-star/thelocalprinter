"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Building2,
  Heart,
  MapPin,
  ArrowRight,
  Printer,
  Star,
  Navigation,
  Loader2,
  X,
  SlidersHorizontal,
} from "lucide-react";
import { getUserDashboard, getFilterOptions, getPublicBusinesses } from "../../services/userService";
import { PageLoader } from "../../components/shared/page-loader";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import CopyableId from "../../components/admin/CopyableId";

const SEARCH_PLACEHOLDERS = [
  "Search by business name...",
  "Search by vendor ID...",
  "Search by location...",
];

const UserDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [displayPlaceholder, setDisplayPlaceholder] = useState(SEARCH_PLACEHOLDERS[0]);
  const [locationName, setLocationName] = useState("");
  const [userLat, setUserLat] = useState(null);
  const [userLng, setUserLng] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [radius, setRadius] = useState("");
  const [category, setCategory] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [minRating, setMinRating] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [customerType, setCustomerType] = useState("");
  const [orderingMethod, setOrderingMethod] = useState("");
  const [orderLimits, setOrderLimits] = useState("");
  const [filters, setFilters] = useState({
    categories: [],
    serviceTypes: [],
    customerTypes: [],
    orderingMethods: [],
    orderLimits: [],
  });

  const [searchResults, setSearchResults] = useState(null);
  const [filterResults, setFilterResults] = useState(null);
  const [filterLoading, setFilterLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchPagination, setSearchPagination] = useState(null);
  const [filterPagination, setFilterPagination] = useState(null);
  const [searchPage, setSearchPage] = useState(1);
  const [filterPage, setFilterPage] = useState(1);
  const debounceRef = useRef(null);
  const searchQueryRef = useRef("");
  const filterFetchIdRef = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIdx((prev) => (prev + 1) % SEARCH_PLACEHOLDERS.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setDisplayPlaceholder(SEARCH_PLACEHOLDERS[placeholderIdx]);
  }, [placeholderIdx]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await getUserDashboard();
        setData(res.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const res = await getFilterOptions();
        setFilters(res.data);
      } catch (err) { /* silent */ }
    };
    fetchFilters();
  }, []);

  useEffect(() => {
    setFilterPage(1);
  }, [locationName, userLat, userLng, radius, category, serviceId, minRating, serviceType, customerType, orderingMethod, orderLimits]);

  const hasActiveFilters = !!(locationName.trim() || userLat !== null || radius || category || serviceId || minRating || serviceType || customerType || orderingMethod || orderLimits);

  const performFilterSearch = useCallback(async (targetPage = 1) => {
    const fetchId = ++filterFetchIdRef.current;
    setFilterLoading(true);
    try {
      const params = { page: targetPage, limit: 12 };
      if (userLat !== null && userLng !== null && radius) {
        params.lat = userLat;
        params.lng = userLng;
        params.radius = radius;
      } else if (locationName.trim()) {
        const cityName = locationName.split(",")[0].trim();
        if (cityName) params.city = cityName;
      }
      if (serviceId) {
        params.serviceId = serviceId;
      } else if (category) {
        params.categoryId = category;
      }
      if (minRating) params.minRating = minRating;
      if (serviceType) params.serviceType = serviceType;
      if (customerType) params.customerType = customerType;
      if (orderingMethod) params.orderingMethod = orderingMethod;
      if (orderLimits) params.orderLimits = orderLimits;
      const res = await getPublicBusinesses(params);
      if (filterFetchIdRef.current === fetchId) {
        setFilterResults(res.data.businesses || []);
        setFilterPagination(res.data.pagination || null);
      }
    } catch (err) {
      if (filterFetchIdRef.current === fetchId) {
        setFilterResults([]);
        setFilterPagination(null);
      }
    } finally {
      if (filterFetchIdRef.current === fetchId) {
        setFilterLoading(false);
      }
    }
  }, [locationName, userLat, userLng, radius, category, serviceId, minRating, serviceType, customerType, orderingMethod, orderLimits]);

  useEffect(() => {
    if (searchQuery.trim()) return;
    if (!hasActiveFilters) {
      setFilterResults(null);
      setFilterLoading(false);
      setFilterPagination(null);
      return;
    }
    performFilterSearch(filterPage);
  }, [hasActiveFilters, performFilterSearch, searchQuery, filterPage]);

  const performSearch = useCallback(async (query, targetPage = 1) => {
    if (!query || !query.trim()) {
      setSearchResults(null);
      setSearchLoading(false);
      setSearchPagination(null);
      return;
    }
    setSearchLoading(true);
    try {
      const params = { search: query.trim(), page: targetPage, limit: 12 };
      if (userLat !== null && userLng !== null && radius) {
        params.lat = userLat;
        params.lng = userLng;
        params.radius = radius;
      } else if (locationName.trim()) {
        const cityName = locationName.split(",")[0].trim();
        if (cityName) params.city = cityName;
      }
      if (serviceId) {
        params.serviceId = serviceId;
      } else if (category) {
        params.categoryId = category;
      }
      if (minRating) params.minRating = minRating;
      if (serviceType) params.serviceType = serviceType;
      if (customerType) params.customerType = customerType;
      if (orderingMethod) params.orderingMethod = orderingMethod;
      if (orderLimits) params.orderLimits = orderLimits;
      const res = await getPublicBusinesses(params);
      if (searchQueryRef.current.trim() === query.trim()) {
        setSearchResults(res.data.businesses || []);
        setSearchPagination(res.data.pagination || null);
      }
    } catch (err) {
      if (searchQueryRef.current.trim() === query.trim()) {
        setSearchResults([]);
        setSearchPagination(null);
      }
    } finally {
      if (searchQueryRef.current.trim() === query.trim()) {
        setSearchLoading(false);
      }
    }
  }, [locationName, userLat, userLng, radius, category, serviceId, minRating, serviceType, customerType, orderingMethod, orderLimits]);

  useEffect(() => {
    searchQueryRef.current = searchQuery;
    setSearchPage(1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!searchQuery.trim()) {
      setSearchResults(null);
      setSearchLoading(false);
      setSearchPagination(null);
      return;
    }
    debounceRef.current = setTimeout(() => {
      performSearch(searchQuery, 1);
    }, 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchQuery, performSearch]);

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }
    setLocationLoading(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setUserLat(latitude);
        setUserLng(longitude);
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
          );
          const data = await res.json();
          const addr = data.address;
          const cityParts = [addr.city || addr.town || addr.village || addr.county, addr.state].filter(Boolean);
          setLocationName(cityParts.join(", ") || data.display_name?.split(",").slice(0, 2).join(",") || "");
        } catch {
          setLocationName(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        }
        setLocationLoading(false);
      },
      (err) => {
        setLocationLoading(false);
        if (err.code === 1) setError("Location permission denied. Please allow location access.");
        else if (err.code === 2) setError("Unable to determine your location.");
        else setError("Location request timed out. Please try again.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchPage(1);
    performSearch(searchQuery, 1);
  };

  if (loading) return <PageLoader />;
  if (error && !data) return <div className="text-destructive p-6">{error}</div>;

  const { stats, recentBusinesses, popularCategories } = data || {};

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-6xl mx-auto">
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 md:p-10 text-white">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3 leading-tight">
            Find the Perfect <span className="text-orange-400">Printing Service</span>
          </h1>
          <p className="text-white/60 mb-6 text-base">
            Discover trusted local printing businesses near you
          </p>

          <form onSubmit={handleSearch} className="space-y-3">
            <div className="flex items-center bg-white rounded-lg p-1">
              <Search size={18} className="ml-3 text-muted-foreground flex-shrink-0" />
              <input
                type="text"
                placeholder={displayPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 border-none px-3 py-2.5 text-sm bg-transparent text-gray-900 placeholder:text-gray-400 outline-none rounded-md selection:bg-blue-200 selection:text-blue-900"
              />
              <Button type="submit" size="sm" className="rounded-md px-5">Search</Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
              <div className="flex-1 flex gap-2">
                <div className="relative flex-1">
                  <Input
                    placeholder="Location..."
                    value={locationName}
                    readOnly
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50 h-9 cursor-default pr-8"
                  />
                  {locationName && (
                    <button
                      type="button"
                      onClick={() => { setLocationName(""); setUserLat(null); setUserLng(null); }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                      title="Clear location"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 flex-shrink-0 bg-white/10 border-white/20 text-white hover:bg-white/20"
                  onClick={handleUseMyLocation}
                  disabled={locationLoading}
                  title="Use my current location"
                >
                  {locationLoading ? <Loader2 size={14} className="animate-spin" /> : <Navigation size={14} />}
                </Button>
              </div>
              <div className="flex gap-2 items-center">
                <Select value={radius || "all"} onValueChange={(v) => setRadius(v === "all" ? "" : v)}>
                  <SelectTrigger className="w-full sm:w-[130px] bg-white/10 border-white/20 text-white h-9">
                    <SelectValue placeholder="Radius" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Distance</SelectItem>
                    <SelectItem value="1">1 KM</SelectItem>
                    <SelectItem value="2">2 KM</SelectItem>
                    <SelectItem value="5">5 KM</SelectItem>
                    <SelectItem value="10">10 KM</SelectItem>
                    <SelectItem value="25">25 KM</SelectItem>
                    <SelectItem value="50">50 KM</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5 bg-white/10 border-white/20 text-white hover:bg-white/20 h-9"
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal size={14} /> Filters & Radius
              </Button>
              </div>
            </div>

            {showFilters && (
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-white/70">Filters & Radius</span>
                  {(radius || category || serviceId || minRating || serviceType || customerType || orderingMethod || orderLimits) && (
                    <button
                      type="button"
                      onClick={() => { setRadius(""); setCategory(""); setServiceId(""); setMinRating(""); setServiceType(""); setCustomerType(""); setOrderingMethod(""); setOrderLimits(""); }}
                      className="text-[11px] font-medium text-orange-300 hover:text-orange-200 transition-colors"
                    >
                      Clear All
                    </button>
                  )}
                </div>
                <div className="flex gap-3 flex-wrap">
                  <div className="flex-1 min-w-[130px]">
                    <label className="text-[10px] font-medium text-white/70 uppercase tracking-wider mb-1 block">Category</label>
                    <Select value={category || "all"} onValueChange={(v) => {
                      setCategory(v === "all" ? "" : v);
                      setServiceId("");
                    }}>
                      <SelectTrigger className="h-8 text-xs bg-white/10 border-white/20 text-white"><SelectValue placeholder="All" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {filters.categories.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            <div className="flex items-center gap-2">
                              {c.image && <img src={c.image} alt="" className="h-4 w-4 object-contain" />}
                              <span>{c.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {category && (() => {
                    const selectedCat = filters.categories.find((c) => c.id === category);
                    const services = selectedCat?.services || [];
                    if (services.length === 0) return null;
                    return (
                      <div className="flex-1 min-w-[130px]">
                        <label className="text-[10px] font-medium text-white/70 uppercase tracking-wider mb-1 block">Services</label>
                        <Select value={serviceId || "all"} onValueChange={(v) => setServiceId(v === "all" ? "" : v)}>
                          <SelectTrigger className="h-8 text-xs bg-white/10 border-white/20 text-white"><SelectValue placeholder="All" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Services</SelectItem>
                            {services.map((s) => (
                              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    );
                  })()}
                  <div className="flex-1 min-w-[130px]">
                    <label className="text-[10px] font-medium text-white/70 uppercase tracking-wider mb-1 block">Min Rating</label>
                    <Select value={minRating || "all"} onValueChange={(v) => setMinRating(v === "all" ? "" : v)}>
                      <SelectTrigger className="h-8 text-xs bg-white/10 border-white/20 text-white"><SelectValue placeholder="Any" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any Rating</SelectItem>
                        <SelectItem value="1">1+ <Star size={10} className="inline fill-amber-400 text-amber-400" /></SelectItem>
                        <SelectItem value="2">2+ <Star size={10} className="inline fill-amber-400 text-amber-400" /></SelectItem>
                        <SelectItem value="3">3+ <Star size={10} className="inline fill-amber-400 text-amber-400" /></SelectItem>
                        <SelectItem value="4">4+ <Star size={10} className="inline fill-amber-400 text-amber-400" /></SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1 min-w-[130px]">
                    <label className="text-[10px] font-medium text-white/70 uppercase tracking-wider mb-1 block">Service</label>
                    <Select value={serviceType || "all"} onValueChange={(v) => setServiceType(v === "all" ? "" : v)}>
                      <SelectTrigger className="h-8 text-xs bg-white/10 border-white/20 text-white"><SelectValue placeholder="All" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Services</SelectItem>
                        {filters.serviceTypes?.map((s) => (
                          <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1 min-w-[130px]">
                    <label className="text-[10px] font-medium text-white/70 uppercase tracking-wider mb-1 block">Customer Type</label>
                    <Select value={customerType || "all"} onValueChange={(v) => setCustomerType(v === "all" ? "" : v)}>
                      <SelectTrigger className="h-8 text-xs bg-white/10 border-white/20 text-white"><SelectValue placeholder="All" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        {filters.customerTypes?.map((t) => (
                          <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1 min-w-[130px]">
                    <label className="text-[10px] font-medium text-white/70 uppercase tracking-wider mb-1 block">Ordering</label>
                    <Select value={orderingMethod || "all"} onValueChange={(v) => setOrderingMethod(v === "all" ? "" : v)}>
                      <SelectTrigger className="h-8 text-xs bg-white/10 border-white/20 text-white"><SelectValue placeholder="All" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Methods</SelectItem>
                        {filters.orderingMethods?.map((m) => (
                          <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1 min-w-[130px]">
                    <label className="text-[10px] font-medium text-white/70 uppercase tracking-wider mb-1 block">Order Limits</label>
                    <Select value={orderLimits || "all"} onValueChange={(v) => setOrderLimits(v === "all" ? "" : v)}>
                      <SelectTrigger className="h-8 text-xs bg-white/10 border-white/20 text-white"><SelectValue placeholder="All" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Limits</SelectItem>
                        {filters.orderLimits?.map((l) => (
                          <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
          </form>

          {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
        </div>
        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-white/[0.04] hidden md:block">
          <Printer size={140} />
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                <Building2 size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.totalBusinesses}</p>
                <p className="text-xs text-muted-foreground">Businesses</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center flex-shrink-0">
                <Heart size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.wishlistCount}</p>
                <p className="text-xs text-muted-foreground">Wishlisted</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center flex-shrink-0">
                <Star size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.totalCategories}</p>
                <p className="text-xs text-muted-foreground">Categories</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {popularCategories && popularCategories.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-foreground">Browse by Category</h3>
            <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={() => router.push("/user/businesses")}>
              View All <ArrowRight size={14} />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {popularCategories.map((cat) => (
              <Badge
                key={cat}
                variant="outline"
                className="cursor-pointer hover:bg-primary/5 hover:border-primary/30 transition-colors"
                onClick={() => router.push(`/user/businesses?category=${encodeURIComponent(cat)}`)}
              >
                {cat}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {searchLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin text-muted-foreground" />
        </div>
      ) : searchResults !== null && searchQuery.trim() ? (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-foreground">
              Search Results {searchPagination ? `(${searchPagination.total} total)` : searchResults.length > 0 && `(${searchResults.length})`}
            </h3>
            <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={() => { setSearchQuery(""); setSearchResults(null); }}>
              <X size={14} /> Clear Search
            </Button>
          </div>
          {searchResults.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <img src="/data-not-found.png" alt="No Data Found" className="mb-4 h-48 w-48 object-contain" />
              <h3 className="mb-1 text-base font-semibold">No Data Found in Database</h3>
              <p className="max-w-xs text-sm text-muted-foreground">
                No businesses match your search. Try a different query.
              </p>
            </div>
          ) : (
            <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchResults.map((b) => (
                <Card key={b._id} className="cursor-pointer hover:shadow-md transition-shadow overflow-hidden" onClick={() => router.push(`/user/businesses/${b._id}`)}>
                  <div className="h-32 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/30 dark:to-indigo-950/30 flex items-center justify-center text-primary">
                    <Building2 size={32} />
                  </div>
                  <CardContent className="p-4">
                    <h4 className="text-sm font-bold text-foreground truncate mb-1">{b.name}</h4>
                    {b.vendor?.publicId && (
                      <div className="mb-1"><CopyableId id={b.vendor.publicId} /></div>
                    )}
                    <Badge variant="secondary" className="text-[10px] mb-2">{b.category || "Printing"}</Badge>
                    {b.city && (
                      <p className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                        <MapPin size={12} /> {b.city}
                      </p>
                    )}
                    {b.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">{b.description.slice(0, 80)}...</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
            {searchPagination && searchPagination.pages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button
                  disabled={searchPage <= 1}
                  onClick={() => { setSearchPage(searchPage - 1); performSearch(searchQuery, searchPage - 1); }}
                  className="px-4 py-2 text-sm font-medium rounded-lg border border-border bg-background hover:bg-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-sm text-muted-foreground px-3">
                  Page {searchPagination.page} of {searchPagination.pages}
                </span>
                <button
                  disabled={searchPage >= searchPagination.pages}
                  onClick={() => { setSearchPage(searchPage + 1); performSearch(searchQuery, searchPage + 1); }}
                  className="px-4 py-2 text-sm font-medium rounded-lg border border-border bg-background hover:bg-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
            </>
          )}
        </div>
      ) : filterLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin text-muted-foreground" />
        </div>
      ) : filterResults !== null ? (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-foreground">
              Filtered Results {filterPagination ? `(${filterPagination.total} total)` : filterResults.length > 0 && `(${filterResults.length})`}
            </h3>
          </div>
          {filterResults.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <img src="/data-not-found.png" alt="No Data Found" className="mb-4 h-48 w-48 object-contain" />
              <h3 className="mb-1 text-base font-semibold">No Data Found in Database</h3>
              <p className="max-w-xs text-sm text-muted-foreground">
                No businesses match the selected filters. Try adjusting your criteria.
              </p>
            </div>
          ) : (
            <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filterResults.map((b) => (
                <Card key={b._id} className="cursor-pointer hover:shadow-md transition-shadow overflow-hidden" onClick={() => router.push(`/user/businesses/${b._id}`)}>
                  <div className="h-32 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/30 dark:to-indigo-950/30 flex items-center justify-center text-primary">
                    <Building2 size={32} />
                  </div>
                  <CardContent className="p-4">
                    <h4 className="text-sm font-bold text-foreground truncate mb-1">{b.name}</h4>
                    {b.vendor?.publicId && (
                      <div className="mb-1"><CopyableId id={b.vendor.publicId} /></div>
                    )}
                    <div className="flex items-center gap-1.5 mb-2">
                      {b.categoryId?.image && (b.categoryId.image.trim().startsWith('<') ? <div className="h-4 w-4 [&>svg]:w-4 [&>svg]:h-4" dangerouslySetInnerHTML={{ __html: b.categoryId.image }} /> : <img src={b.categoryId.image} alt="" className="h-4 w-4 object-contain" />)}
                      <Badge variant="secondary" className="text-[10px]">{b.category || "Printing"}</Badge>
                    </div>
                    {b.serviceIds && b.serviceIds.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {b.serviceIds.map((service) => (
                          <Badge key={service._id} variant="outline" className="text-[9px]">
                            {service.name}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {b.city && (
                      <p className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                        <MapPin size={12} /> {b.city}
                      </p>
                    )}
                    {b.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">{b.description.slice(0, 80)}...</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
            {filterPagination && filterPagination.pages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button
                  disabled={filterPage <= 1}
                  onClick={() => setFilterPage(filterPage - 1)}
                  className="px-4 py-2 text-sm font-medium rounded-lg border border-border bg-background hover:bg-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-sm text-muted-foreground px-3">
                  Page {filterPagination.page} of {filterPagination.pages}
                </span>
                <button
                  disabled={filterPage >= filterPagination.pages}
                  onClick={() => setFilterPage(filterPage + 1)}
                  className="px-4 py-2 text-sm font-medium rounded-lg border border-border bg-background hover:bg-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
            </>
          )}
        </div>
      ) : recentBusinesses && recentBusinesses.length > 0 ? (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-foreground">Recently Added</h3>
            <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={() => router.push("/user/businesses")}>
              View All <ArrowRight size={14} />
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentBusinesses.map((b) => (
              <Card key={b._id} className="cursor-pointer hover:shadow-md transition-shadow overflow-hidden" onClick={() => router.push(`/user/businesses/${b._id}`)}>
                <div className="h-32 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/30 dark:to-indigo-950/30 flex items-center justify-center text-primary">
                  <Building2 size={32} />
                </div>
                <CardContent className="p-4">
                  <h4 className="text-sm font-bold text-foreground truncate mb-1">{b.name}</h4>
                    {b.vendor?.publicId && (
                      <div className="mb-1"><CopyableId id={b.vendor.publicId} /></div>
                    )}
                    <div className="flex items-center gap-1.5 mb-2">
                      {b.categoryId?.image && (b.categoryId.image.trim().startsWith('<') ? <div className="h-4 w-4 [&>svg]:w-4 [&>svg]:h-4" dangerouslySetInnerHTML={{ __html: b.categoryId.image }} /> : <img src={b.categoryId.image} alt="" className="h-4 w-4 object-contain" />)}
                      <Badge variant="secondary" className="text-[10px]">{b.category || "Printing"}</Badge>
                    </div>
                    {b.serviceIds && b.serviceIds.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {b.serviceIds.map((service) => (
                          <Badge key={service._id} variant="outline" className="text-[9px]">
                            {service.name}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {b.city && (
                      <p className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                        <MapPin size={12} /> {b.city}
                    </p>
                  )}
                  {b.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{b.description.slice(0, 80)}...</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default UserDashboard;
