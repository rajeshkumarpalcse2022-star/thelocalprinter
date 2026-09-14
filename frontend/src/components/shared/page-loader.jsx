"use client";

import { Loader2 } from "lucide-react";

export function PageLoader({ text = "Loading..." }) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-3">
      <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
      <span className="text-sm font-medium text-muted-foreground">{text}</span>
    </div>
  );
}
