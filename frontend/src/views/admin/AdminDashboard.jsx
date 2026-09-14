"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Building2,
  Clock,
  CheckCircle,
  XCircle,
  Store,
  UserCheck,
  Loader2,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  getDashboardStats,
  getDashboardGrowth,
  getBusinessStatusCounts,
} from "../../services/adminService";
import { StatCard, PageLoader } from "../../components/admin/SharedComponents";
import "../../components/admin/admin.css";

const GROWTH_FILTERS = [
  { label: "7 Days", value: "7d" },
  { label: "30 Days", value: "30d" },
  { label: "6 Months", value: "6m" },
  { label: "1 Year", value: "1y" },
];

const PIE_COLORS = ["#16a34a", "#d97706", "#dc2626", "#2563eb"];

const ChartTooltipContent = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "var(--bg-secondary)",
        border: "1px solid var(--border-primary)",
        borderRadius: "var(--radius-lg)",
        padding: "0.6rem 0.85rem",
        boxShadow: "var(--shadow-lg)",
      }}
    >
      <p style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", marginBottom: "0.35rem" }}>
        {label}
      </p>
      {payload.map((entry, i) => (
        <p key={i} style={{ fontSize: "var(--text-xs)", color: entry.color, fontWeight: 600 }}>
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState("");

  const [growthData, setGrowthData] = useState([]);
  const [growthPeriod, setGrowthPeriod] = useState("30d");
  const [growthLoading, setGrowthLoading] = useState(true);
  const [growthError, setGrowthError] = useState("");

  const [statusData, setStatusData] = useState(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const [statusError, setStatusError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getDashboardStats();
        setStats(res.data.stats);
      } catch (err) {
        setStatsError(err.response?.data?.message || "Failed to load dashboard stats");
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    const fetchGrowth = async () => {
      setGrowthLoading(true);
      setGrowthError("");
      try {
        const res = await getDashboardGrowth(growthPeriod);
        setGrowthData(res.data.growth);
      } catch (err) {
        setGrowthError(err.response?.data?.message || "Failed to load growth data");
      } finally {
        setGrowthLoading(false);
      }
    };
    fetchGrowth();
  }, [growthPeriod]);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await getBusinessStatusCounts();
        setStatusData(res.data);
      } catch (err) {
        setStatusError(err.response?.data?.message || "Failed to load business status");
      } finally {
        setStatusLoading(false);
      }
    };
    fetchStatus();
  }, []);

  if (statsLoading) return <PageLoader />;
  if (statsError) return <div className="admin-error">{statsError}</div>;

  const pieData = statusData
    ? [
        { name: "Approved", value: statusData.approved },
        { name: "Pending", value: statusData.pending },
        { name: "Rejected", value: statusData.rejected },
        { name: "Active", value: statusData.active },
      ].filter((d) => d.value > 0)
    : [];

  return (
    <div className="admin-dashboard">
      <div className="page-header">
        <div>
          <h1 style={{ color: "var(--text-primary)" }}>Dashboard</h1>
          <p className="page-subtitle" style={{ color: "var(--text-tertiary)" }}>
            Welcome back. Here&apos;s your platform overview.
          </p>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard icon={Users} label="Total Users" value={stats.totalUsers} color="#2563eb" />
        <StatCard icon={Store} label="Total Vendors" value={stats.totalVendors} color="#f97316" />
        <StatCard icon={Building2} label="Total Businesses" value={stats.totalBusinesses} color="#8b5cf6" />
        <StatCard icon={Clock} label="Pending Approvals" value={stats.pendingBusinesses} color="#d97706" />
        <StatCard icon={UserCheck} label="Pending Resellers" value={stats.pendingResellers || 0} color="#8b5cf6" />
        <StatCard icon={CheckCircle} label="Active Businesses" value={stats.activeBusinesses} color="#16a34a" />
        <StatCard icon={XCircle} label="Rejected" value={stats.inactiveBusinesses} color="#dc2626" />
      </div>

      <div className="charts-grid">
        <div
          className="dashboard-card"
          style={{
            background: "var(--bg-secondary)",
            border: "1px solid var(--border-primary)",
            borderRadius: "var(--radius-xl)",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <div className="card-header" style={{ borderBottom: "1px solid var(--border-primary)" }}>
            <h3 style={{ color: "var(--text-primary)", fontSize: "var(--text-base)", fontWeight: 600 }}>
              Platform Growth
            </h3>
            <div style={{ display: "flex", gap: "0.25rem", flexWrap: "wrap" }}>
              {GROWTH_FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setGrowthPeriod(f.value)}
                  style={{
                    padding: "0.3rem 0.7rem",
                    borderRadius: "var(--radius)",
                    border: "1px solid var(--border-primary)",
                    background: growthPeriod === f.value ? "var(--accent-primary)" : "var(--bg-secondary)",
                    color: growthPeriod === f.value ? "#fff" : "var(--text-secondary)",
                    fontSize: "var(--text-xs)",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 150ms ease",
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <div style={{ padding: "var(--space-4)" }}>
            {growthLoading ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300 }}>
                <Loader2 size={24} className="spin" style={{ color: "var(--text-tertiary)" }} />
              </div>
            ) : growthError ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300, color: "var(--accent-error)", fontSize: "var(--text-sm)" }}>
                {growthError}
              </div>
            ) : growthData.length === 0 ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300, color: "var(--text-tertiary)", fontSize: "var(--text-sm)" }}>
                No growth data available for this period.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={growthData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-secondary)" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: "var(--text-tertiary)" }}
                    tickFormatter={(v) => {
                      const d = new Date(v);
                      return `${d.getDate()}/${d.getMonth() + 1}`;
                    }}
                  />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "var(--text-tertiary)" }} />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Legend
                    wrapperStyle={{ fontSize: "var(--text-xs)", paddingTop: "0.5rem" }}
                  />
                  <Line type="monotone" dataKey="users" stroke="#2563eb" strokeWidth={2} dot={false} name="Users" />
                  <Line type="monotone" dataKey="vendors" stroke="#f97316" strokeWidth={2} dot={false} name="Vendors" />
                  <Line type="monotone" dataKey="businesses" stroke="#8b5cf6" strokeWidth={2} dot={false} name="Businesses" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div
          className="dashboard-card"
          style={{
            background: "var(--bg-secondary)",
            border: "1px solid var(--border-primary)",
            borderRadius: "var(--radius-xl)",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <div className="card-header" style={{ borderBottom: "1px solid var(--border-primary)" }}>
            <h3 style={{ color: "var(--text-primary)", fontSize: "var(--text-base)", fontWeight: 600 }}>
              Business Status Overview
            </h3>
          </div>
          <div style={{ padding: "var(--space-4)" }}>
            {statusLoading ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300 }}>
                <Loader2 size={24} className="spin" style={{ color: "var(--text-tertiary)" }} />
              </div>
            ) : statusError ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300, color: "var(--accent-error)", fontSize: "var(--text-sm)" }}>
                {statusError}
              </div>
            ) : pieData.length === 0 ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300, color: "var(--text-tertiary)", fontSize: "var(--text-sm)" }}>
                No businesses available.
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap", gap: "var(--space-4)" }}>
                <div style={{ width: "100%", maxWidth: 360 }}>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={110}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "var(--bg-secondary)",
                        border: "1px solid var(--border-primary)",
                        borderRadius: "var(--radius-lg)",
                        fontSize: "var(--text-xs)",
                      }}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: "var(--text-xs)" }}
                      formatter={(value) => <span style={{ color: "var(--text-secondary)" }}>{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
