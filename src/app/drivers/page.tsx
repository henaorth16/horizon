import React from "react";
import type { Metadata } from "next";
import { AlertOctagon } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { DriverContextExplorer } from "@/components/drivers";

export const metadata: Metadata = {
  title: "Drivers & Crises — Conflict, Drought & Climate Shocks",
  description:
    "Documented internal displacement triggers distinguishing armed conflict, prolonged drought, and seasonal flooding events without unverified causation claims.",
};

export default function DriversPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-ink-800 pb-5">
        <div className="flex items-center gap-2 text-xs font-mono text-orange-400 uppercase tracking-widest mb-1.5">
          <AlertOctagon className="h-4 w-4" />
          <span>Crisis Drivers & Triggers Module</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100">
              Displacement Drivers & Crisis Triggers
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Documenting primary key-informant reported triggers of internal displacement across armed conflict, multi-season drought, and riverine floods without making unsupported causal assertions.
            </p>
          </div>
          <Badge variant="ember" size="md" className="self-start sm:self-auto font-mono">
            IOM DTM Round 37 Evidence
          </Badge>
        </div>
      </div>

      {/* Main Interactive Drivers Explorer */}
      <DriverContextExplorer />
    </div>
  );
}
