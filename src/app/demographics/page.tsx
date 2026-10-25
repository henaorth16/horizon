import React from "react";
import type { Metadata } from "next";
import { Users, ShieldCheck, AlertCircle } from "lucide-react";
import {
  getDemographicProfile,
  getVulnerabilityMetrics,
  getRegionalDemographicComparisons,
  PCODE_TO_REGION_NAME,
} from "@/lib/db";
import type { DemographicProfile } from "@/lib/db/types";
import { DemographicExplorerView } from "@/components/demographics";
import { ObservatoryFilterProvider } from "@/lib/state/ObservatoryFilterContext";

export const metadata: Metadata = {
  title: "People & Demographics — Age, Sex & Vulnerability Breakdown",
  description:
    "Demographic composition, population pyramids, and household vulnerability structures of displaced populations in Ethiopia",
};

export default function DemographicsPage() {
  const initialIdpProfile = getDemographicProfile({ populationType: "idp", locationId: "ET" });
  const initialRefugeeProfile = getDemographicProfile({ populationType: "refugee", locationId: "ET" });
  const vulnerabilityMetrics = getVulnerabilityMetrics();
  const regionalComparisons = getRegionalDemographicComparisons();

  // Pre-load regional IDP profiles
  const allProfiles: Record<string, DemographicProfile> = {
    idp_ET: initialIdpProfile,
    refugee_ET: initialRefugeeProfile,
  };

  for (const pcode of Object.keys(PCODE_TO_REGION_NAME)) {
    if (pcode !== "ET") {
      allProfiles[`idp_${pcode}`] = getDemographicProfile({
        populationType: "idp",
        locationId: pcode,
      });
    }
  }

  return (
    <ObservatoryFilterProvider syncWithUrl={true}>
      <div className="space-y-6">
        <div className="border-b border-ink-800 pb-5">
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase tracking-widest mb-1.5">
            <Users className="h-4 w-4" />
            <span>Demographic Analysis Module</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100">
                People & Demographics
              </h1>
              <p className="text-sm text-slate-400 mt-1 max-w-2xl">
                Age pyramids, sex-disaggregated statistics, and household vulnerability profiles of displaced communities across assessment sites.
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-mono">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Preserving Source Brackets (Non-Merged)</span>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-md border border-ink-700 bg-ink-900/80 p-4 text-xs text-slate-300">
          <AlertCircle className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-200">Demographic Data Standards: </span>
            Preserving original source age brackets (0–4, 5–11, 12–17, 18–59, 60+). Figures for IDPs (IOM DTM) and Hosted Refugees (UNHCR) reflect separate legal mandates and are partitioned to prevent composite aggregation. Missing breakdowns for unassessed sites are explicitly denoted.
          </div>
        </div>

        {/* Master Client Demographic Explorer */}
        <DemographicExplorerView
          initialIdpProfile={initialIdpProfile}
          initialRefugeeProfile={initialRefugeeProfile}
          vulnerabilityMetrics={vulnerabilityMetrics}
          regionalComparisons={regionalComparisons}
          allProfiles={allProfiles}
        />
      </div>
    </ObservatoryFilterProvider>
  );
}
