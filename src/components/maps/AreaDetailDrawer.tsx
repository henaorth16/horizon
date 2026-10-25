"use client";

import React from "react";
import Link from "next/link";
import { X, MapPin, AlertCircle, CheckCircle2, ArrowRight, ShieldCheck, Database } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatNumber } from "@/lib/utils";

export interface SelectedAreaDetails {
  name: string;
  pcode: string;
  adminLevel: number;
  idps: number;
  returnees: number;
  primaryDriver?: string;
  confidence?: string;
  reportingDate?: string;
  citation?: string;
}

interface AreaDetailDrawerProps {
  area: SelectedAreaDetails | null;
  onClose: () => void;
}

export function AreaDetailDrawer({ area, onClose }: AreaDetailDrawerProps) {
  if (!area) return null;

  return (
    <div
      role="dialog"
      aria-labelledby="area-drawer-title"
      className="rounded-lg border border-ink-700 bg-ink-900/95 p-4 sm:p-5 shadow-xl backdrop-blur-md space-y-4 animate-in fade-in slide-in-from-right duration-200"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-ink-700 pb-3">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-mono text-[#bc6c25] dark:text-[#dda15e] uppercase tracking-wider mb-1 font-medium">
            <MapPin className="h-3.5 w-3.5" />
            <span>{area.adminLevel === 1 ? "Admin 1 Regional State" : "Admin 2 Administrative Zone"}</span>
          </div>
          <h3 id="area-drawer-title" className="text-lg font-bold text-slate-100">
            {area.name}
          </h3>
          <span className="text-xs font-mono text-slate-400">P-Code: {area.pcode}</span>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close detail drawer"
          className="rounded p-1 text-slate-400 hover:bg-ink-800 hover:text-slate-100 transition-colors focus-visible:ring-2 focus-visible:ring-[#bc6c25] focus-visible:outline-none"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Primary Statistics Grid */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="rounded bg-ink-850 p-3 border border-ink-700 space-y-1">
          <span className="text-[10px] font-mono uppercase text-[#bc6c25] dark:text-[#dda15e] block font-medium">
            IDP Caseload
          </span>
          <span className="text-xl font-bold font-mono text-slate-100">
            {formatNumber(area.idps)}
          </span>
          <span className="text-[10px] text-slate-400 block">Verified displaced</span>
        </div>

        <div className="rounded bg-ink-850 p-3 border border-ink-700 space-y-1">
          <span className="text-[10px] font-mono uppercase text-[#606c38] block font-medium">
            Tracked Returnees
          </span>
          <span className="text-xl font-bold font-mono text-slate-100">
            {formatNumber(area.returnees)}
          </span>
          <span className="text-[10px] text-slate-400 block">Former IDP returns</span>
        </div>
      </div>

      {/* Driver and Verification Status */}
      <div className="space-y-2 text-xs">
        <div className="flex items-center justify-between py-1.5 border-b border-ink-700/60">
          <span className="text-slate-400">Crisis Trigger:</span>
          <Badge
            variant={
              area.primaryDriver === "conflict"
                ? "rust"
                : area.primaryDriver === "drought"
                ? "sand"
                : "cyan"
            }
            size="sm"
          >
            {area.primaryDriver || "Unspecified"}
          </Badge>
        </div>

        <div className="flex items-center justify-between py-1.5 border-b border-ink-700/60">
          <span className="text-slate-400">Confidence:</span>
          <span className="font-mono text-slate-200 capitalize flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-[#606c38]" />
            {area.confidence || "Medium"}
          </span>
        </div>

        <div className="flex items-center justify-between py-1.5 border-b border-ink-700/60">
          <span className="text-slate-400">Date:</span>
          <span className="font-mono text-slate-200">{area.reportingDate || "2024-08-31"}</span>
        </div>
      </div>

      {/* Source Citation */}
      <div className="rounded bg-ink-850/60 p-3 border border-ink-700 text-[11px] text-slate-400 space-y-1">
        <div className="font-semibold text-slate-300 flex items-center gap-1">
          <ShieldCheck className="h-3.5 w-3.5 text-[#bc6c25] dark:text-[#dda15e]" />
          <span>Primary Publisher & License</span>
        </div>
        <p className="font-serif italic leading-relaxed">
          {area.citation || "IOM Displacement Tracking Matrix Site Assessment Round 37 (August 2024). CC BY 4.0."}
        </p>
      </div>

      {/* CTA: Data Explorer Filter Link */}
      <div className="pt-1">
        <Link
          href={`/explorer?locationId=${area.pcode}`}
          className="w-full inline-flex items-center justify-center gap-2 rounded bg-ink-800 hover:bg-ink-700 text-slate-100 text-xs font-mono py-2 px-3 transition-colors border border-ink-700"
        >
          <Database className="h-3.5 w-3.5 text-amber-400" />
          <span>Inspect {area.name} in Data Explorer</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
