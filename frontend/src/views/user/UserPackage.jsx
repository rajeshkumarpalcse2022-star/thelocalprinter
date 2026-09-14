"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { CheckCircle, Loader2, Package, Ticket, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Separator } from "../../components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { CouponCard } from "../../components/admin/CouponCard";
import { EmptyCouponAnimation } from "../../components/shared/empty-coupon-animation";
import api from "../../services/api";

const POLL_INTERVAL = 20000;

const UserPackage = () => {
  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const intervalRef = useRef(null);

  const [coupons, setCoupons] = useState([]);
  const [couponsLoading, setCouponsLoading] = useState(true);
  const [couponsError, setCouponsError] = useState("");

  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [applyError, setApplyError] = useState("");

  const fetchPackage = useCallback(async (showLoader = false) => {
    try {
      if (showLoader) setLoading(true);
      setError("");
      const res = await api.get("/user/package");
      setPkg(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load package");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCoupons = useCallback(async () => {
    try {
      setCouponsLoading(true);
      setCouponsError("");
      const res = await api.get("/coupons/my");
      setCoupons(res.data.data.coupons || []);
    } catch (err) {
      setCouponsError(err.response?.data?.message || "Failed to load coupons");
    } finally {
      setCouponsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPackage(true);
    fetchCoupons();
  }, [fetchPackage, fetchCoupons]);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      fetchPackage(false);
    }, POLL_INTERVAL);
    return () => clearInterval(intervalRef.current);
  }, [fetchPackage]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        fetchPackage(false);
        fetchCoupons();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [fetchPackage, fetchCoupons]);

  // Revalidate applied coupon when package price changes or on visibility change
  useEffect(() => {
    if (appliedCoupon && pkg?.fee !== undefined) {
      const revalidate = async () => {
        try {
          const res = await api.post("/coupons/apply", {
            code: appliedCoupon.code,
            originalPrice: pkg.fee,
          });
          setAppliedCoupon(res.data.data);
        } catch {
          setAppliedCoupon(null);
        }
      };
      revalidate();
    }
  }, [pkg?.fee]);

  const handleApplyCoupon = async (coupon) => {
    if (!pkg?.fee) return;
    try {
      setApplyingCoupon(true);
      setApplyError("");
      const res = await api.post("/coupons/apply", {
        code: coupon.code,
        originalPrice: pkg.fee,
      });
      setAppliedCoupon(res.data.data);
    } catch (err) {
      setApplyError(err.response?.data?.message || "Failed to apply coupon");
      setAppliedCoupon(null);
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setApplyError("");
  };

  const originalPrice = pkg?.fee ?? 0;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-muted-foreground">
        <Loader2 size={32} className="animate-spin" />
        <span className="text-sm">Loading package...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-destructive">
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Package</h1>
        <p className="text-sm text-muted-foreground">Your user subscription package details.</p>
      </div>

      <Tabs defaultValue="subscription" className="space-y-6">
        <TabsList>
          <TabsTrigger value="subscription" className="gap-2">
            <Package className="h-4 w-4" />
            Subscription
          </TabsTrigger>
          <TabsTrigger value="coupon" className="gap-2">
            <Ticket className="h-4 w-4" />
            Coupon
          </TabsTrigger>
        </TabsList>

        {/* Subscription Tab */}
        <TabsContent value="subscription">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>User Subscription</CardTitle>
                  <CardDescription>Access the Local Printer platform and discover printers</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Price section */}
              <div className="text-center py-4">
                {appliedCoupon ? (
                  <div className="space-y-2">
                    <p className="text-lg text-muted-foreground line-through">
                      &#8377;{originalPrice.toLocaleString("en-IN")}
                    </p>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                        {appliedCoupon.discountPercent}% OFF
                      </span>
                    </div>
                    <div className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">
                      &#8377;{appliedCoupon.finalPrice.toLocaleString("en-IN")}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      You save &#8377;{appliedCoupon.discountAmount.toLocaleString("en-IN")}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1.5 mt-2"
                      onClick={handleRemoveCoupon}
                    >
                      <X size={14} />
                      Remove Coupon
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="text-4xl font-bold text-foreground">
                      &#8377;{originalPrice.toLocaleString("en-IN")}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">one-time</p>
                  </>
                )}
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="text-muted-foreground">Subscription Duration</p>
                  <p className="font-semibold text-foreground">{pkg?.durationDays ?? 30} Days</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Trial Period</p>
                  <p className="font-semibold text-foreground">{pkg?.trialDays ?? 0} Days</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h3 className="font-semibold text-foreground">Package Benefits</h3>
                {pkg?.benefits?.length > 0 ? (
                  <div className="space-y-2.5">
                    {pkg.benefits.map((benefit, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <CheckCircle className="h-4.5 w-4.5 mt-0.5 shrink-0 text-emerald-500" />
                        <span className="text-sm text-foreground">{benefit}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No package benefits configured yet.</p>
                )}
              </div>

              <Separator />

              <Button className="w-full" size="lg" disabled>
                Pay &#8377;{(appliedCoupon ? appliedCoupon.finalPrice : originalPrice).toLocaleString("en-IN")} & Subscribe
              </Button>
              <p className="text-xs text-center text-muted-foreground">Payment integration coming soon</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Coupon Tab */}
        <TabsContent value="coupon">
          {couponsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : couponsError ? (
            <div className="flex flex-col items-center justify-center py-12 text-destructive">
              <p className="text-sm">{couponsError}</p>
            </div>
          ) : coupons.length === 0 ? (
            <EmptyCouponAnimation />
          ) : (
            <div className="space-y-4">
              {applyError && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {applyError}
                </div>
              )}
              {coupons.map((coupon) => (
                <CouponCard
                  key={coupon._id}
                  coupon={coupon}
                  onApply={handleApplyCoupon}
                  applying={applyingCoupon && appliedCoupon?.code === coupon.code}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserPackage;
