import React from "react";
import type { Metadata } from "next";
import { HeartHandshake } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { SectorNeedsExplorerView } from "@/components/needs";

export const metadata: Metadata = {
  title: "Humanitarian Needs — Sectoral Vulnerability & Relief Demands",
  description:
    "Sector-specific humanitarian needs of displaced populations across emergency shelter, WASH, food security, protection, and healthcare based on OCHA HNO 2024 and cluster standards.",
};

export default function HumanitarianNeedsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-ink-800 pb-5">
        <div className="flex items-center gap-2 text-xs font-mono text-red-400 uppercase tracking-widest mb-1.5">
          <HeartHandshake className="h-4 w-4" />
          <span>Sector Needs & Cluster Benchmarks Module</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100">
              Humanitarian Needs & Sector Demands
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Granular sector-specific deficit indicators across emergency shelter, safe drinking water, acute food insecurity, child/gender protection, and primary healthcare without synthetic composite indexing.
            </p>
          </div>
          <Badge variant="terracotta" size="md" className="self-start sm:self-auto font-mono">
            OCHA HNO & Cluster Evidence
          </Badge>
        </div>
      </div>

      {/* Main Interactive Sector Needs Explorer */}
      <SectorNeedsExplorerView />
    </div>
  );
}
