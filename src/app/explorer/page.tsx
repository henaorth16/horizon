import React from "react";
import type { Metadata } from "next";
import { Database, AlertCircle, ShieldCheck } from "lucide-react";
import { getAllObservations, verifyDataIntegrity } from "@/lib/db";
import { ObservationExplorer } from "@/components/explorer/ObservationExplorer";

export const metadata: Metadata = {
  title: "Data Explorer & Export — Ethiopia Migration Observatory",
  description: "Search, filter, inspect, and export verified observation records with full source provenance",
};

export default function DataExplorerPage() {
  const observations = getAllObservations();
  const integrity = verifyDataIntegrity();

  return (
    <div className="space-y-6">
      <div className="border-b border-ink-800 pb-5">
        <div className="flex items-center gap-2 text-xs font-mono text-amber-500 uppercase tracking-widest mb-1.5">
          <Database className="h-4 w-4" />
          <span>Transparency & Open Data Module</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100">
              Observation Data Explorer & Exports
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Query the underlying normalized observation database with complete metadata provenance, reference timestamps, and automated export tools.
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-mono">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Database Integrity: {integrity.validCount}/{integrity.totalRecordsChecked} Validated</span>
          </div>
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-md border border-ink-700 bg-ink-900/80 p-4 text-xs text-slate-300">
        <AlertCircle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-200">Citation & Export Safeguards: </span>
          All data exports automatically include primary source citations, license terms, retrieval dates, and known methodology caveats to preserve scientific transparency. Figures for IDPs and Refugees reflect distinct legal mandates and must not be aggregated.
        </div>
      </div>

      {/* Interactive Observation Browser */}
      <ObservationExplorer initialObservations={observations} />
    </div>
  );
}
