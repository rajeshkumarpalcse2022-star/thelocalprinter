"use client";

const POSITIONS = {
  "top-right": "top-2 right-2",
  "bottom-right": "bottom-2 right-2",
  "bottom-right-lg": "bottom-3 right-3 sm:bottom-4 sm:right-4",
};

const SIZES = {
  sm: "w-14",
  md: "w-16 sm:w-20",
  lg: "w-24 sm:w-32",
};

/**
 * Default website logo watermark overlay for vendor-uploaded media.
 * Absolutely positioned inside a `relative` media container.
 * `pointer-events-none` keeps underlying clicks/controls working.
 */
const WatermarkLogo = ({ position = "top-right", size = "md", className = "" }) => (
  <span
    aria-hidden="true"
    className={`pointer-events-none absolute z-20 select-none rounded-md bg-white/85 px-1.5 py-1 shadow-sm ring-1 ring-black/5 backdrop-blur-[2px] ${
      POSITIONS[position] || POSITIONS["top-right"]
    } ${SIZES[size] || SIZES.md} ${className}`}
  >
    <img
      src="/logo.png"
      alt="The Local Printer"
      draggable={false}
      className="h-auto w-full object-contain"
    />
  </span>
);

export default WatermarkLogo;
