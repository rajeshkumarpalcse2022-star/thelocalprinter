"use client";

import { Loader2 } from "lucide-react";

export const StatCard = ({ icon: Icon, label, value, color, trend }) => (
  <div
    style={{
      background: "var(--bg-secondary)",
      borderRadius: "var(--radius-xl)",
      padding: "1.25rem 1.5rem",
      display: "flex",
      alignItems: "center",
      gap: "1rem",
      border: "1px solid var(--border-primary)",
      boxShadow: "var(--shadow-card)",
      transition: "var(--transition-base)",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.boxShadow = "var(--shadow-card-hover)";
      e.currentTarget.style.transform = "translateY(-2px)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.boxShadow = "var(--shadow-card)";
      e.currentTarget.style.transform = "translateY(0)";
    }}
  >
    <div
      style={{
        width: 48,
        height: 48,
        borderRadius: "var(--radius-lg)",
        background: `${color}12`,
        color: color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <Icon size={22} />
    </div>
    <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
      <span
        style={{
          fontSize: "var(--text-2xl)",
          fontWeight: 700,
          color: "var(--text-primary)",
          lineHeight: 1.2,
        }}
      >
        {value ?? 0}
      </span>
      <span
        style={{
          fontSize: "var(--text-sm)",
          color: "var(--text-tertiary)",
          fontWeight: 500,
        }}
      >
        {label}
      </span>
    </div>
    {trend && (
      <span
        style={{
          marginLeft: "auto",
          fontSize: "var(--text-xs)",
          fontWeight: 600,
          color: "var(--accent-success)",
          background: "var(--accent-success-light)",
          padding: "0.2rem 0.5rem",
          borderRadius: "var(--radius-full)",
        }}
      >
        {trend}
      </span>
    )}
  </div>
);

export const StatusBadge = ({ status }) => {
  const map = {
    approved: { bg: "var(--bg-badge-approved)", color: "var(--text-badge-approved)" },
    active: { bg: "var(--bg-badge-active)", color: "var(--text-badge-active)" },
    pending: { bg: "var(--bg-badge-pending)", color: "var(--text-badge-pending)" },
    rejected: { bg: "var(--bg-badge-rejected)", color: "var(--text-badge-rejected)" },
    inactive: { bg: "var(--bg-badge-inactive)", color: "var(--text-badge-inactive)" },
  };
  const s = map[status] || map.inactive;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "0.2rem 0.6rem",
        borderRadius: "var(--radius-full)",
        fontSize: "var(--text-xs)",
        fontWeight: 600,
        textTransform: "capitalize",
        background: s.bg,
        color: s.color,
        lineHeight: 1.5,
      }}
    >
      {status}
    </span>
  );
};

export const LoadingSkeleton = ({ rows = 3, cols = 4 }) => (
  <div style={{ padding: "var(--space-4)", display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} style={{ display: "flex", gap: "var(--space-4)" }}>
        {Array.from({ length: cols }).map((_, j) => (
          <div
            key={j}
            style={{
              height: 20,
              flex: 1,
              borderRadius: "var(--radius-sm)",
              background: `linear-gradient(90deg, var(--bg-skeleton) 25%, var(--bg-hover) 50%, var(--bg-skeleton) 75%)`,
              backgroundSize: "200% 100%",
              animation: "shimmer 1.5s infinite",
            }}
          />
        ))}
      </div>
    ))}
  </div>
);

export const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "var(--space-12) var(--space-6)",
      textAlign: "center",
    }}
  >
    <div
      style={{
        width: 64,
        height: 64,
        borderRadius: "var(--radius-full)",
        background: "var(--bg-tertiary)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--text-tertiary)",
        marginBottom: "var(--space-4)",
      }}
    >
      <Icon size={28} />
    </div>
    <h3
      style={{
        fontSize: "var(--text-md)",
        fontWeight: 600,
        color: "var(--text-primary)",
        marginBottom: "var(--space-1)",
      }}
    >
      {title}
    </h3>
    <p
      style={{
        fontSize: "var(--text-sm)",
        color: "var(--text-tertiary)",
        maxWidth: 320,
      }}
    >
      {description}
    </p>
    {action && <div style={{ marginTop: "var(--space-4)" }}>{action}</div>}
  </div>
);

export const PageLoader = () => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "var(--space-3)",
      minHeight: 400,
      color: "var(--text-tertiary)",
    }}
  >
    <Loader2 size={28} className="spin" />
    <span style={{ fontSize: "var(--text-sm)", fontWeight: 500 }}>Loading...</span>
  </div>
);

export const TablePagination = ({ pagination, onPageChange }) => {
  if (!pagination || pagination.pages <= 1) return null;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "var(--space-4)",
        padding: "var(--space-4)",
        borderTop: "1px solid var(--border-primary)",
      }}
    >
      <button
        disabled={pagination.page <= 1}
        onClick={() => onPageChange(pagination.page - 1)}
        style={{
          padding: "0.4rem 1rem",
          border: "1px solid var(--border-primary)",
          borderRadius: "var(--radius)",
          background: "var(--bg-secondary)",
          color: "var(--text-secondary)",
          fontSize: "var(--text-sm)",
          fontWeight: 500,
          cursor: pagination.page <= 1 ? "not-allowed" : "pointer",
          opacity: pagination.page <= 1 ? 0.4 : 1,
          transition: "var(--transition-fast)",
        }}
      >
        Previous
      </button>
      <span style={{ fontSize: "var(--text-sm)", color: "var(--text-tertiary)" }}>
        Page {pagination.page} of {pagination.pages}
      </span>
      <button
        disabled={pagination.page >= pagination.pages}
        onClick={() => onPageChange(pagination.page + 1)}
        style={{
          padding: "0.4rem 1rem",
          border: "1px solid var(--border-primary)",
          borderRadius: "var(--radius)",
          background: "var(--bg-secondary)",
          color: "var(--text-secondary)",
          fontSize: "var(--text-sm)",
          fontWeight: 500,
          cursor: pagination.page >= pagination.pages ? "not-allowed" : "pointer",
          opacity: pagination.page >= pagination.pages ? 0.4 : 1,
          transition: "var(--transition-fast)",
        }}
      >
        Next
      </button>
    </div>
  );
};

export const ConfirmDialog = ({ open, title, message, onConfirm, onCancel, loading }) => {
  if (!open) return null;
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "var(--bg-overlay)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "var(--space-4)",
      }}
      onClick={onCancel}
    >
      <div
        style={{
          background: "var(--bg-modal)",
          borderRadius: "var(--radius-xl)",
          width: "100%",
          maxWidth: 400,
          padding: "var(--space-6)",
          boxShadow: "var(--shadow-lg)",
          border: "1px solid var(--border-primary)",
          animation: "fadeIn 0.15s ease",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 600, color: "var(--text-primary)", marginBottom: "var(--space-2)" }}>
          {title}
        </h3>
        <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", marginBottom: "var(--space-6)", lineHeight: 1.6 }}>
          {message}
        </p>
        <div style={{ display: "flex", gap: "var(--space-3)", justifyContent: "flex-end" }}>
          <button
            onClick={onCancel}
            disabled={loading}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "var(--radius)",
              border: "1px solid var(--border-primary)",
              background: "var(--bg-secondary)",
              color: "var(--text-secondary)",
              fontSize: "var(--text-sm)",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "var(--radius)",
              border: "none",
              background: "var(--accent-error)",
              color: "#fff",
              fontSize: "var(--text-sm)",
              fontWeight: 500,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              display: "flex",
              alignItems: "center",
              gap: "var(--space-2)",
            }}
          >
            {loading && <Loader2 size={14} className="spin" />}
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};
