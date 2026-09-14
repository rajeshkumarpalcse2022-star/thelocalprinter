"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Search,
  Building2,
  MapPin,
  Heart,
  X,
  Loader2,
  SlidersHorizontal,
} from "lucide-react";
import {
  getPublicBusinesses,
  getFilterOptions,
  addToWishlist,
  removeFromWishlist,
} from "../../services/userService";
import { PageHeader } from "../../components/shared/page-header";
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

const UserExplore = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [businesses, setBusinesses] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    categories: [],
    cities: [],
    serviceTypes: [],
    customerTypes: [],
    orderingMethods: [],
  });
  const [showFilters, setShowFilters] = useState(false);

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [serviceId, setServiceId] = useState(searchParams.get("serviceId") || "");
  const [city, setCity] = useState(searchParams.get("city") || "");
  const [serviceType, setServiceType] = useState(searchParams.get("serviceType") || "");
  const [customerType, setCustomerType] = useState(searchParams.get("customerType") || "");
  const [orderingMethod, setOrderingMethod] = useState(searchParams.get("orderingMethod") || "");
  const [page, setPage] = useState(1);
  const [wishlistedIds, setWishlistedIds] = useState(new Set());
  const [togglingWishlist, setTogglingWishlist] = useState(null);

  const debounceRef = useRef(null);

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const res = await getFilterOptions();
        setFilters(res.data);
      } catch (err) { /* silent */ }
    };
    fetchFilters();
  }, []);

  const fetchBusinesses = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = { page, limit: 12 };
      if (search) params.search = search;
      if (serviceId) {
        params.serviceId = serviceId;
      } else if (category) {
        params.categoryId = category;
      }
      if (city) params.city = city;
      if (serviceType) params.serviceType = serviceType;
      if (customerType) params.customerType = customerType;
      if (orderingMethod) params.orderingMethod = orderingMethod;
      const res = await getPublicBusinesses(params);
      setBusinesses(res.data.businesses);
      setPagination(res.data.pagination);
      const ids = new Set(res.data.businesses.filter((b) => b.isWishlisted).map((b) => b._id));
      setWishlistedIds(ids);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load businesses");
    } finally {
      setLoading(false);
    }
  }, [page, search, category, serviceId, city, serviceType, customerType, orderingMethod]);

  useEffect(() => { fetchBusinesses(); }, [fetchBusinesses]);
  useEffect(() => { setPage(1); }, [search, category, serviceId, city, serviceType, customerType, orderingMethod]);

  const handleSearchChange = (val) => {
    setSearch(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setSearch(val), 300);
  };

  const clearFilters = () => {
    setSearch(""); setCategory(""); setServiceId(""); setCity(""); setServiceType(""); setCustomerType(""); setOrderingMethod("");
    router.push(pathname);
  };

  const hasActiveFilters = category || serviceId || city || serviceType || customerType || orderingMethod;

  const toggleWishlist = async (e, businessId) => {
    e.stopPropagation();
    setTogglingWishlist(businessId);
    try {
      if (wishlistedIds.has(businessId)) {
        await removeFromWishlist(businessId);
        setWishlistedIds((prev) => { const next = new Set(prev); next.delete(businessId); return next; });
      } else {
        await addToWishlist(businessId);
        setWishlistedIds((prev) => new Set(prev).add(businessId));
      }
    } catch (err) { /* silent */ } finally { setTogglingWishlist(null); }
  };

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-6xl mx-auto">
      <PageHeader
        title="Explore Printers"
        description="Find the best printing services for your needs"
        actions={
          <Button variant="outline" size="sm" className="gap-2 relative" onClick={() => setShowFilters(!showFilters)}>
            <SlidersHorizontal size={16} /> Filters
            {hasActiveFilters && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-orange-500" />}
          </Button>
        }
      />

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search businesses..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-9 pr-9"
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            <X size={14} />
          </button>
        )}
      </div>

      {showFilters && (
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-3 flex-wrap items-end">
              <div className="flex-1 min-w-[140px]">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Category</label>
                <Select value={category || "all"} onValueChange={(v) => {
                  setCategory(v === "all" ? "" : v);
                  setServiceId("");
                }}>
                  <SelectTrigger><SelectValue placeholder="All Categories" /></SelectTrigger>
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
                  <div className="flex-1 min-w-[140px]">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Services</label>
                    <Select value={serviceId || "all"} onValueChange={(v) => setServiceId(v === "all" ? "" : v)}>
                      <SelectTrigger><SelectValue placeholder="All Services" /></SelectTrigger>
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
              <div className="flex-1 min-w-[140px]">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">City</label>
                <Select value={city || "all"} onValueChange={(v) => setCity(v === "all" ? "" : v)}>
                  <SelectTrigger><SelectValue placeholder="All Cities" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Cities</SelectItem>
                    {filters.cities.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 min-w-[140px]">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Service Type</label>
                <Select value={serviceType || "all"} onValueChange={(v) => setServiceType(v === "all" ? "" : v)}>
                  <SelectTrigger><SelectValue placeholder="All Services" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Services</SelectItem>
                    {filters.serviceTypes.map((s) => (
                      <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 min-w-[140px]">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Customer Type</label>
                <Select value={customerType || "all"} onValueChange={(v) => setCustomerType(v === "all" ? "" : v)}>
                  <SelectTrigger><SelectValue placeholder="All Types" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {filters.customerTypes.map((t) => (
                      <SelectItem key={t} value={t}>{t.toUpperCase()}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 min-w-[140px]">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Ordering</label>
                <Select value={orderingMethod || "all"} onValueChange={(v) => setOrderingMethod(v === "all" ? "" : v)}>
                  <SelectTrigger><SelectValue placeholder="All Methods" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Methods</SelectItem>
                    {filters.orderingMethods.map((m) => (
                      <SelectItem key={m} value={m}>{m.replace(/_/g, " ")}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive gap-1" onClick={clearFilters}>
                  <X size={14} /> Clear All
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <PageLoader />
      ) : error ? (
        <div className="text-destructive text-sm p-6">{error}</div>
      ) : businesses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <img src="/data-not-found.png" alt="No Data Found" className="mb-4 h-48 w-48 object-contain" />
          <h3 className="mb-1 text-base font-semibold">No Data Found in Database</h3>
          <p className="max-w-xs text-sm text-muted-foreground">
            {hasActiveFilters || search ? "Try adjusting your search or filters." : "No approved businesses yet. Check back soon!"}
          </p>
        </div>
      ) : (
        <>
          <p className="text-xs text-muted-foreground">
            Showing {businesses.length} of {pagination?.total || 0} businesses
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {businesses.map((b) => (
              <Card key={b._id} className="cursor-pointer hover:shadow-md transition-shadow overflow-hidden" onClick={() => router.push(`/user/businesses/${b._id}`)}>
                <div className="h-40 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/30 dark:to-indigo-950/30 flex items-center justify-center text-primary relative overflow-hidden">
                  {b.verificationMedia?.thumbnailImages?.[0] ? (
                    <img src={b.verificationMedia.thumbnailImages[0]} alt={b.name} className="w-full h-full object-cover" />
                  ) : (
                    <Building2 size={36} />
                  )}
                  <button
                    onClick={(e) => toggleWishlist(e, b._id)}
                    disabled={togglingWishlist === b._id}
                    className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 dark:bg-background/90 flex items-center justify-center backdrop-blur-sm transition-colors hover:bg-white dark:hover:bg-background"
                  >
                    {togglingWishlist === b._id ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Heart size={14} className={wishlistedIds.has(b._id) ? "text-red-500 fill-red-500" : "text-muted-foreground"} />
                    )}
                  </button>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="text-sm font-bold text-foreground truncate">{b.name}</h3>
                  </div>
                  {b.category && (
                    <div className="flex items-center gap-1.5 mb-1">
                      {b.categoryId?.image && (b.categoryId.image.trim().startsWith('<') ? <div className="h-4 w-4 [&>svg]:w-4 [&>svg]:h-4" dangerouslySetInnerHTML={{ __html: b.categoryId.image }} /> : <img src={b.categoryId.image} alt="" className="h-4 w-4 object-contain" />)}
                      <Badge variant="secondary" className="text-[10px]">{b.category}</Badge>
                    </div>
                  )}
                  {b.serviceIds && b.serviceIds.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-1">
                      {b.serviceIds.map((service) => (
                        <Badge key={service._id} variant="outline" className="text-[9px]">
                          {service.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {b.vendor?.publicId && (
                    <div className="mb-1.5"><CopyableId id={b.vendor.publicId} /></div>
                  )}
                  {b.city && (
                    <p className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                      <MapPin size={12} /> {b.city}{b.address ? `, ${b.address}` : ""}
                    </p>
                  )}
                  {b.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{b.description.slice(0, 100)}...</p>
                  )}
                  <div className="flex flex-wrap gap-1">
                    {b.serviceType && <Badge variant="outline" className="text-[10px] capitalize">{b.serviceType.replace(/_/g, " ")}</Badge>}
                    {b.customerType && <Badge variant="outline" className="text-[10px]">{b.customerType.toUpperCase()}</Badge>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
              <span className="text-sm text-muted-foreground">Page {page} of {pagination.totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= pagination.totalPages} onClick={() => setPage(page + 1)}>Next</Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UserExplore;
