"use client";

import { useState } from "react";
import { Copy, Check, Clock, Sparkles, Loader2 } from "lucide-react";

export function CouponCard({ coupon, onApply, applying = false }) {
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(coupon.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = coupon.code;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isExpired = coupon.validUntil && new Date(coupon.validUntil) < new Date();
  const isUsed = coupon.isUsed;
  const isDisabled = coupon.status !== "active" || isExpired || isUsed || applying;

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-background to-background shadow-lg shadow-emerald-500/5 ${isDisabled ? "opacity-60" : ""}`}>
      {/* Top decorative strip */}
      <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500" />

      <div className="flex flex-col sm:flex-row">
        {/* Left: Discount section */}
        <div className="relative flex flex-col items-center justify-center gap-1 px-8 py-8 sm:py-10 sm:min-w-[180px] border-b sm:border-b-0 sm:border-r border-dashed border-emerald-500/30">
          {/* Decorative dots */}
          <div className="absolute top-1/2 -translate-y-1/2 -left-2.5 h-5 w-5 rounded-full bg-background" />
          <div className="absolute top-1/2 -translate-y-1/2 -right-2.5 h-5 w-5 rounded-full bg-background" />

          <div className="flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-emerald-500" />
            <span className="text-4xl font-extrabold tracking-tight bg-gradient-to-br from-emerald-500 to-teal-600 bg-clip-text text-transparent">
              {coupon.discountPercent}%
            </span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
            OFF
          </span>
        </div>

        {/* Right: Details section */}
        <div className="flex flex-1 flex-col gap-3 p-5 sm:p-6">
          {/* Header row */}
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-2">
              {coupon.text && (
                <p className="text-base font-bold text-foreground tracking-tight">
                  {coupon.text}
                </p>
              )}
              <div className="flex items-center gap-2 flex-wrap">
                <code className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 text-sm font-mono font-bold tracking-widest text-emerald-700 dark:text-emerald-300 max-w-full overflow-hidden text-ellipsis whitespace-nowrap">
                  {coupon.code}
                </code>
                <button
                  type="button"
                  onClick={copyCode}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:bg-muted hover:text-foreground active:scale-95"
                  title="Copy code"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                      <span className="text-emerald-500">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Status badge */}
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider shrink-0 ${
                isUsed
                  ? "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                  : isExpired
                  ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                  : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
              }`}
            >
              {isUsed ? "Used" : isExpired ? "Expired" : "Active"}
            </span>
          </div>

          {/* Validity */}
          {coupon.validUntil && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>
                {isExpired ? "Expired on" : "Valid until"}{" "}
                <span className="font-medium text-foreground">
                  {formatDate(coupon.validUntil)}
                </span>
              </span>
            </div>
          )}

          {/* Apply button */}
          <button
            type="button"
            disabled={isDisabled}
            onClick={() => onApply && onApply(coupon)}
            className={`mt-auto w-full rounded-xl px-4 py-2.5 text-sm font-bold tracking-wide transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${
              isDisabled
                ? "cursor-not-allowed bg-muted text-muted-foreground"
                : "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/25 hover:shadow-lg hover:shadow-emerald-500/30 hover:from-emerald-600 hover:to-teal-600"
            }`}
          >
            {applying && <Loader2 className="h-4 w-4 animate-spin" />}
            {isUsed ? "Already Used" : isExpired ? "Expired" : applying ? "Applying..." : "Apply Coupon"}
          </button>
        </div>
      </div>
    </div>
  );
}
