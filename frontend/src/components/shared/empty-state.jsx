"use client";

import { cn } from "@/lib/utils";

export function EmptyState({ icon: Icon, image, title, description, action, className }) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 text-center", className)}>
      {image ? (
        <img src={image} alt={title || "Empty"} className="mb-4 h-40 w-40 object-contain" />
      ) : Icon ? (
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
      ) : null}
      <h3 className="mb-1 text-base font-semibold">{title}</h3>
      {description && (
        <p className="max-w-xs text-sm text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
