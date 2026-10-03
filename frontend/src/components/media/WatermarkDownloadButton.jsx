"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { downloadImageWithWatermark } from "../../lib/watermarkDownload";

/**
 * Download button for a watermarked media tile.
 *
 * The file it saves is the image plus the website logo composed on a canvas, so
 * what the user downloads matches the logo they see on screen.
 *
 * Positioning is left to the caller (`className`) because the button sits in
 * different corners of tiles vs. lightboxes.
 */
const WatermarkDownloadButton = ({
  url,
  filename,
  position = "top-right",
  showLabel = false,
  className = "",
  ariaLabel = "Download image with website logo",
}) => {
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  const handleClick = async (e) => {
    e.stopPropagation?.();
    e.preventDefault?.();
    if (busy || !url) return;
    setBusy(true);
    setFailed(false);
    try {
      await downloadImageWithWatermark(url, { filename, position });
    } catch (err) {
      console.warn("Download failed:", err);
      setFailed(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      title={failed ? "Download failed — try again" : "Download with website logo"}
      aria-label={ariaLabel}
      className={`inline-flex select-none items-center justify-center gap-1.5 rounded-full bg-white/92 text-brand-navy ring-1 ring-black/10 shadow-sm backdrop-blur-sm transition-colors hover:bg-white disabled:opacity-70 ${
        showLabel ? "px-3 py-1.5 text-[12px] font-bold" : "h-8 w-8"
      } ${className}`}
    >
      {busy ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className={showLabel ? "h-3.5 w-3.5" : "h-4 w-4"} />
      )}
      {showLabel && <span>{busy ? "Preparing..." : failed ? "Retry" : "Download"}</span>}
    </button>
  );
};

export default WatermarkDownloadButton;
