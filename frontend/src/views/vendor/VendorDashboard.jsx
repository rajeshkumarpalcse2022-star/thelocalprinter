"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  CheckCircle,
  Clock,
  Plus,
  Eye,
  ArrowRight,
  MapPin,
  TrendingUp,
  XCircle,
  Star,
  MessageSquare,
} from "lucide-react";
import { getVendorDashboard } from "../../services/vendorService";
import { PageHeader } from "../../components/shared/page-header";
import { StatusBadge } from "../../components/shared/status-badge";
import { EmptyState } from "../../components/shared/empty-state";
import { PageLoader } from "../../components/shared/page-loader";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";

const VendorDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await getVendorDashboard();
        setData(res.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <PageLoader />;
  if (error) return <div className="text-destructive p-6">{error}</div>;

  const { stats, reviewStats, recentBusinesses, recentReviews } = data;

  const statCards = [
    { icon: Building2, label: "Total Businesses", value: stats.totalBusinesses, color: "text-violet-500", bg: "bg-violet-500/10" },
    { icon: Clock, label: "Pending Approval", value: stats.pendingBusinesses, color: "text-amber-500", bg: "bg-amber-500/10" },
    { icon: CheckCircle, label: "Approved", value: stats.approvedBusinesses, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { icon: XCircle, label: "Rejected", value: stats.rejectedBusinesses || 0, color: "text-red-500", bg: "bg-red-500/10" },
    { icon: Star, label: "Average Rating", value: reviewStats?.averageRating || 0, color: "text-amber-500", bg: "bg-amber-500/10" },
    { icon: MessageSquare, label: "Total Reviews", value: reviewStats?.totalReviews || 0, color: "text-cyan-500", bg: "bg-cyan-500/10" },
  ];

  const quickActions = [
    { icon: Plus, label: "Add Business", color: "text-violet-500", bg: "bg-violet-500/10", onClick: () => router.push("/vendor/businesses/new") },
    { icon: Eye, label: "View Businesses", color: "text-blue-500", bg: "bg-blue-500/10", onClick: () => router.push("/vendor/businesses") },
    { icon: TrendingUp, label: "My Profile", color: "text-orange-500", bg: "bg-orange-500/10", onClick: () => router.push("/vendor/profile") },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <PageHeader
        title="Dashboard"
        description="Welcome back! Here's an overview of your businesses."
        action={
          <Button onClick={() => router.push("/vendor/businesses/new")} className="gap-2">
            <Plus size={18} />
            Add Business
          </Button>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${s.bg} ${s.color} flex items-center justify-center flex-shrink-0`}>
                <s.icon size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground truncate">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <h3 className="text-lg font-semibold text-foreground mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {quickActions.map((a) => (
            <Card key={a.label} className="cursor-pointer hover:shadow-md transition-shadow" onClick={a.onClick}>
              <CardContent className="p-4 flex flex-col items-center gap-3 text-center">
                <div className={`w-10 h-10 rounded-lg ${a.bg} ${a.color} flex items-center justify-center`}>
                  <a.icon size={20} />
                </div>
                <span className="text-sm font-semibold text-foreground">{a.label}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base">Recent Businesses</CardTitle>
          <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={() => router.push("/vendor/businesses")}>
            View All <ArrowRight size={14} />
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {recentBusinesses.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={Building2}
                title="No Businesses Yet"
                description="Start by adding your first printing business."
              />
            </div>
          ) : (
            <div className="divide-y">
              {recentBusinesses.map((b) => (
                <div key={b._id} className="flex items-center gap-3 px-6 py-3 hover:bg-muted/50 transition-colors">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
                      {b.name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{b.name}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin size={12} className="flex-shrink-0" />
                      {b.city || "No city"} &middot;
                      {b.categoryId?.image && (b.categoryId.image.trim().startsWith('<') ? <span className="h-3 w-3 [&>svg]:w-3 [&>svg]:h-3 inline-block align-middle" dangerouslySetInnerHTML={{ __html: b.categoryId.image }} /> : <img src={b.categoryId.image} alt="" className="h-3 w-3 object-contain inline" />)}
                      {b.category || "No category"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={b.status} />
                    {!b.isActive && <StatusBadge status="inactive" />}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {recentReviews && recentReviews.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Recent Reviews</CardTitle>
            <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={() => router.push("/vendor/reviews")}>
              View All <ArrowRight size={14} />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {recentReviews.map((r) => (
                <div key={r._id} className="px-6 py-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-primary">{r.business?.name}</span>
                    <span className="text-xs text-muted-foreground">&mdash; {r.user?.fullName || "User"}</span>
                  </div>
                  <div className="flex items-center gap-0.5 mb-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={12} fill={s <= r.rating ? "#f59e0b" : "none"} color={s <= r.rating ? "#f59e0b" : "var(--muted-foreground)"} />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">&ldquo;{r.comment}&rdquo;</p>
                  <span className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VendorDashboard;
