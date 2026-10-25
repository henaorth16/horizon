import React from "react";
import { cn } from "@/lib/utils";
import { OBSERVATORY_COLORS, FreshnessStatus } from "@/lib/theme/colors";

export interface StatusIndicatorProps extends React.HTMLAttributes<HTMLSpanElement> {
  status?: FreshnessStatus;
  label?: string;
  pulse?: boolean;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status = "fresh",
  label,
  pulse = true,
  className,
  ...props
}) => {
  const dotColor = {
    fresh: "bg-emerald-400",
    stale: "bg-amber-400",
    outdated: "bg-orange-500",
    error: "bg-red-500",
    unknown: "bg-slate-400",
  }[status];

  const glowColor = {
    fresh: "bg-emerald-500/40",
    stale: "bg-amber-500/40",
    outdated: "bg-orange-500/40",
    error: "bg-red-500/40",
    unknown: "bg-slate-500/40",
  }[status];

  return (
    <span
      className={cn("inline-flex items-center gap-2 text-xs font-mono text-slate-300", className)}
      {...props}
    >
      <span className="relative flex h-2 w-2">
        {pulse && status === "fresh" && (
          <span
            className={cn("absolute inline-flex h-full w-full animate-ping rounded-full opacity-75", glowColor)}
          />
        )}
        <span className={cn("relative inline-flex h-2 w-2 rounded-full", dotColor)} />
      </span>
      {label && <span>{label}</span>}
    </span>
  );
};
