"use client";

import { useState, useCallback } from "react";
import { Copy, Check } from "lucide-react";

const CopyableId = ({ id, className = "" }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!id) return;
    try {
      await navigator.clipboard.writeText(id);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = id;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  }, [id]);

  if (!id) return null;

  const isVendor = id.startsWith("VND");
  const isReseller = id.startsWith("RSL");

  const getIdColor = () => {
    if (isVendor) return "#f97316";
    if (isReseller) return "#8b5cf6";
    return "#2563eb";
  };

  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.3rem",
      }}
    >
      <span
        style={{
          fontFamily: "monospace",
          fontSize: "var(--text-xs)",
          fontWeight: 600,
          color: getIdColor(),
          letterSpacing: "0.02em",
        }}
      >
        {id}
      </span>
      <span
        role="button"
        tabIndex={0}
        onClick={handleCopy}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleCopy(); }}
        title={copied ? "Copied!" : "Copy ID"}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 20,
          height: 20,
          padding: 0,
          border: "none",
          borderRadius: "var(--radius-sm)",
          background: "transparent",
          color: copied ? "var(--accent-success, #16a34a)" : "var(--text-tertiary)",
          cursor: "pointer",
          transition: "color 150ms ease",
          flexShrink: 0,
        }}
        onMouseEnter={(e) => {
          if (!copied) e.currentTarget.style.color = "var(--text-primary)";
        }}
        onMouseLeave={(e) => {
          if (!copied) e.currentTarget.style.color = "var(--text-tertiary)";
        }}
      >
        {copied ? <Check size={13} /> : <Copy size={13} />}
      </span>
    </span>
  );
};

export default CopyableId;
