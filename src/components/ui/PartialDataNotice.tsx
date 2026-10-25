import React from "react";
import { AlertTriangle, ShieldCheck, MapPinOff, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PartialDataNoticeProps {
  title?: string;
  locationName?: string;
  unassessedZones?: string[];
  missingBreakdowns?: string[];
  reason?: string;
  citation?: string;
  severity?: "info" | "warning";
  className?: string;
}

export function PartialDataNotice({
  title = "Coverage Limitation & Partial Data Caveat",
  locationName,
  unassessedZones = [],
  missingBreakdowns = [],
  reason = "Field assessments subject to physical access, seasonal flooding, or operational constraints.",
  citation = "UN OCHA Ethiopia Humanitarian Access Snapshot / IOM DTM Methodology Note",
  severity = "warning",
  className,
}: PartialDataNoticeProps) {
  const isWarning = severity === "warning";

  return (
    <div
      role="note"
      aria-label={title}
      className={cn(
        "rounded-lg border p-4 text-xs leading-relaxed space-y-2",
        isWarning
          ? "border-amber-500/30 bg-amber-950/20 text-amber-200"
          : "border-sky-500/30 bg-sky-950/20 text-sky-200",
        className
      )}
    >
      <div className="flex items-center gap-2">
        {isWarning ? (
          <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0" />
        ) : (
          <Info className="h-4 w-4 text-sky-400 flex-shrink-0" />
        )}
        <strong className={isWarning ? "text-amber-300 font-semibold" : "text-sky-300 font-semibold"}>
          {title}
          {locationName ? ` — ${locationName}` : ""}
        </strong>
      </div>

      <p className="text-slate-300 text-[11px] leading-relaxed">
        {reason}{" "}
        <span className="font-semibold text-slate-200">
          An unassessed or blank entry does not imply zero displacement.
        </span>{" "}
        Figures represent verified sites reached during the monitoring period.
      </p>

      {unassessedZones.length > 0 && (
        <div className="pt-1 flex items-start gap-1.5 text-[11px] font-mono text-slate-400">
          <MapPinOff className="h-3.5 w-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
          <span>
            <strong className="text-slate-300 font-normal">Unassessed or Inaccessible Zones:</strong>{" "}
            {unassessedZones.join(", ")}
          </span>
        </div>
      )}

      {missingBreakdowns.length > 0 && (
        <div className="pt-0.5 text-[11px] font-mono text-slate-400">
          <strong className="text-slate-300 font-normal">Omitted Disaggregations:</strong>{" "}
          {missingBreakdowns.join("; ")}
        </div>
      )}

      {citation && (
        <div className="pt-1 text-[10px] font-mono text-slate-500 border-t border-ink-800/80">
          Source Caveat: {citation}
        </div>
      )}
    </div>
  );
}
