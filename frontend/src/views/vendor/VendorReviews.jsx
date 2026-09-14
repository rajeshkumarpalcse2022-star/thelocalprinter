"use client";
import { useState, useEffect, useCallback } from "react";
import {
  Star,
  Building2,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Users,
  TrendingUp,
  Heart,
  CreditCard,
} from "lucide-react";
import {
  getVendorReviews,
  getVendorReviewSummary,
} from "../../services/vendorService";
import {
  PageLoader,
  EmptyState,
  TablePagination,
} from "../../components/admin/SharedComponents";
import "../../components/admin/admin.css";

const RatingStars = ({ rating, size = 16 }) => (
  <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
    {[1, 2, 3, 4, 5].map((i) => (
      <Star
        key={i}
        size={size}
        fill={i <= rating ? "#f59e0b" : "transparent"}
        color={i <= rating ? "#f59e0b" : "var(--text-tertiary)"}
        strokeWidth={i <= rating ? 0 : 1.5}
      />
    ))}
  </div>
);

const RatingBar = ({ stars, count, total }) => {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
      <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", minWidth: 14, textAlign: "right" }}>
        {stars}
      </span>
      <Star size={13} fill="#f59e0b" color="#f59e0b" strokeWidth={0} />
      <div style={{ flex: 1, height: 8, borderRadius: 4, background: "var(--bg-tertiary)", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: "#f59e0b", borderRadius: 4, transition: "width 0.4s ease" }} />
      </div>
      <span style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", minWidth: 20, textAlign: "right" }}>
        {count}
      </span>
    </div>
  );
};

const VendorReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [error, setError] = useState("");
  const [businessFilter, setBusinessFilter] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = { page };
      if (businessFilter) params.businessId = businessFilter;
      if (ratingFilter) params.rating = ratingFilter;
      if (search) params.search = search;
      const res = await getVendorReviews(params);
      setReviews(res.data.reviews);
      setPagination(res.data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load reviews");
    } finally {
      setLoading(false);
    }
  }, [page, businessFilter, ratingFilter, search]);

  const fetchSummary = useCallback(async () => {
    setSummaryLoading(true);
    try {
      const res = await getVendorReviewSummary();
      setSummary(res.data);
    } catch {
      // silently fail for summary
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  useEffect(() => {
    setPage(1);
  }, [businessFilter, ratingFilter, search]);

  const businessList = summary?.businesses || [];
  const ratingBreakdown = summary?.ratingDistribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

  return (
    <div style={{ padding: "1rem" }} className="sm:p-8">
      {/* Header */}
      <div style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: "1rem",
        flexWrap: "wrap",
        marginBottom: "2rem",
      }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.25rem" }}>
            Reviews
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            See what customers are saying about your businesses.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "1rem",
        marginBottom: "2rem",
      }}>
        <div style={{
          background: "var(--bg-secondary)",
          borderRadius: "var(--radius-xl)",
          padding: "1.25rem 1.5rem",
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          border: "1px solid var(--border-primary)",
          boxShadow: "var(--shadow-card)",
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: "var(--radius-lg)",
            background: "#f59e0b12", color: "#f59e0b",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <Star size={22} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
            <span style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.2 }}>
              {summaryLoading ? "—" : (summary?.averageRating?.toFixed(1) || "0.0")}
            </span>
            <span style={{ fontSize: "0.8rem", color: "var(--text-tertiary)", fontWeight: 500 }}>Average Rating</span>
          </div>
        </div>

        <div style={{
          background: "var(--bg-secondary)",
          borderRadius: "var(--radius-xl)",
          padding: "1.25rem 1.5rem",
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          border: "1px solid var(--border-primary)",
          boxShadow: "var(--shadow-card)",
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: "var(--radius-lg)",
            background: "#2563eb12", color: "#2563eb",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <MessageSquare size={22} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
            <span style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.2 }}>
              {summaryLoading ? "—" : (summary?.totalReviews || 0)}
            </span>
            <span style={{ fontSize: "0.8rem", color: "var(--text-tertiary)", fontWeight: 500 }}>Total Reviews</span>
          </div>
        </div>

        <div style={{
          background: "var(--bg-secondary)",
          borderRadius: "var(--radius-xl)",
          padding: "1.25rem 1.5rem",
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          border: "1px solid var(--border-primary)",
          boxShadow: "var(--shadow-card)",
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: "var(--radius-lg)",
            background: "#8b5cf612", color: "#8b5cf6",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <Users size={22} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
            <span style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.2 }}>
              {summaryLoading ? "—" : (businessList.length || 0)}
            </span>
            <span style={{ fontSize: "0.8rem", color: "var(--text-tertiary)", fontWeight: 500 }}>Reviewed Businesses</span>
          </div>
        </div>
      </div>

      {/* Rating Breakdown */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(min(320px, 100%), 1fr))",
        gap: "1rem",
        marginBottom: "2rem",
      }}>
        <div style={{
          background: "var(--bg-secondary)",
          border: "1px solid var(--border-primary)",
          borderRadius: "var(--radius-lg)",
          padding: "1.5rem",
          boxShadow: "var(--shadow-card)",
        }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <TrendingUp size={16} /> Rating Breakdown
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
            {[5, 4, 3, 2, 1].map((s) => (
              <RatingBar key={s} stars={s} count={ratingBreakdown[s] || 0} total={summary?.totalReviews || 1} />
            ))}
          </div>
        </div>
      </div>

      {/* Filters & Reviews */}
      <div style={{
        background: "var(--bg-secondary)",
        border: "1px solid var(--border-primary)",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
        boxShadow: "var(--shadow-card)",
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          padding: "1rem 1.25rem",
          borderBottom: "1px solid var(--border-primary)",
          flexWrap: "wrap",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flex: 1, minWidth: 200 }}>
            <Search size={16} style={{ color: "var(--text-tertiary)" }} />
            <input
              type="text"
              placeholder="Search reviews..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                flex: 1,
                border: "none",
                background: "transparent",
                fontSize: "0.875rem",
                color: "var(--text-primary)",
                outline: "none",
              }}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Filter size={14} style={{ color: "var(--text-tertiary)" }} />
            <select
              value={businessFilter}
              onChange={(e) => setBusinessFilter(e.target.value)}
              style={{
                padding: "0.55rem 0.85rem",
                border: "1.5px solid var(--border-input)",
                borderRadius: "var(--radius)",
                fontSize: "0.85rem",
                background: "var(--bg-input)",
                color: "var(--text-primary)",
                cursor: "pointer",
                transition: "var(--transition)",
              }}
            >
              <option value="">All Businesses</option>
              {businessList.map((b) => (
                <option key={b._id} value={b._id}>{b.name}</option>
              ))}
            </select>
          </div>
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            style={{
              padding: "0.55rem 0.85rem",
              border: "1.5px solid var(--border-input)",
              borderRadius: "var(--radius)",
              fontSize: "0.85rem",
              background: "var(--bg-input)",
              color: "var(--text-primary)",
              cursor: "pointer",
              transition: "var(--transition)",
            }}
          >
            <option value="">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>

        {loading ? (
          <PageLoader />
        ) : error ? (
          <div className="admin-error">{error}</div>
        ) : reviews.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="No Reviews Found"
            description={
              businessFilter || ratingFilter || search
                ? "Try adjusting your filters."
                : "No reviews yet. Reviews from customers will appear here."
            }
          />
        ) : (
          <div>
            {reviews.map((review) => (
              <div
                key={review._id}
                style={{
                  padding: "1.25rem 1.5rem",
                  borderBottom: "1px solid var(--border-primary)",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-hover)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", minWidth: 0 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: "50%",
                      background: "var(--accent-primary)", color: "#fff",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "0.8rem", fontWeight: 700, flexShrink: 0,
                    }}>
                      {review.user?.fullName?.[0] || "U"}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-primary)" }}>
                        {review.user?.fullName || "Anonymous"}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                        <Building2 size={12} />
                        {review.business?.name || "Unknown Business"}
                      </div>
                      {review.user?.publicId && (
                        <div style={{ fontSize: "0.7rem", color: "var(--text-tertiary)", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                          <CreditCard size={11} />
                          {review.user.publicId}
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.25rem", flexShrink: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      {review.isWishlisted && (
                        <Heart size={14} className="text-red-500 fill-red-500" />
                      )}
                      <RatingStars rating={review.rating} size={14} />
                    </div>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                {review.comment && (
                  <p style={{
                    fontSize: "0.85rem",
                    color: "var(--text-secondary)",
                    lineHeight: 1.6,
                    margin: 0,
                    paddingLeft: "2.75rem",
                  }}>
                    {review.comment}
                  </p>
                )}
              </div>
            ))}
            <TablePagination pagination={pagination} onPageChange={setPage} />
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorReviews;
