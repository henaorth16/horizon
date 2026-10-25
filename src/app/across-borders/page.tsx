import React from "react";
import type { Metadata } from "next";
import { ArrowRightLeft, Shield, AlertCircle, ShieldCheck, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/charts/EmptyState";
import { getNationalProtectionMetrics, getRefugeeOrigins } from "@/lib/db";
import { formatNumber, formatPercent } from "@/lib/utils";
import { FlowExplorerView } from "@/components/flows";

export const metadata: Metadata = {
  title: "Across Borders — UNHCR Refugee & Asylum Caseloads",
  description: "Refugees hosted in Ethiopia and Ethiopian refugees hosted internationally",
};

export default function AcrossBordersPage() {
  const metrics = getNationalProtectionMetrics();
  const refugeeOrigins = getRefugeeOrigins();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-ink-700 pb-5">
        <div className="flex items-center gap-2 text-xs font-mono text-[#426b66] uppercase tracking-wider mb-1.5 font-medium">
          <ArrowRightLeft className="h-4 w-4" />
          <span>Cross-Border Protection Module</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100">
              Across Borders: Refugees & Asylum Seekers
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              UNHCR registration figures tracking recognized refugees, active asylum applicants, and countries of origin.
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#426b66]/30 bg-[#426b66]/10 text-[#426b66] dark:text-[#5b938d] text-xs font-mono font-medium">
            <span>UNHCR ProGres Verified</span>
          </div>
        </div>
      </div>

      {/* Distinction Callout */}
      <div className="flex items-start gap-3 rounded-lg border border-ink-700 bg-ink-900/60 p-3.5 text-xs text-slate-300">
        <AlertCircle className="h-4 w-4 text-[#426b66] dark:text-[#5b938d] flex-shrink-0 mt-0.5" />
        <div>
          <strong className="font-semibold text-slate-200">Legal Protection Mandate: </strong>
          Refugee statistics are governed under the 1951 Geneva Convention. These figures are strictly distinct from internally displaced persons (IDPs) and must not be aggregated.
        </div>
      </div>

      {/* KPI Headline Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="border-t-4 border-t-[#426b66]">
          <CardHeader className="p-4 pb-1">
            <span className="text-[11px] font-mono uppercase text-slate-400 font-medium">Total Hosted Refugees</span>
            <CardTitle className="text-3xl font-bold font-mono text-[#426b66] dark:text-[#5b938d]">
              {formatNumber(metrics.totalRefugees)}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1 text-xs text-slate-400">
            Registered refugees in camps and urban centers across Ethiopia (Ref: {metrics.refugeeReportingPeriod})
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-[#795267]">
          <CardHeader className="p-4 pb-1">
            <span className="text-[11px] font-mono uppercase text-slate-400 font-medium">Active Asylum Seekers</span>
            <CardTitle className="text-3xl font-bold font-mono text-[#795267] dark:text-[#9e6e87]">
              {formatNumber(metrics.totalAsylumSeekers)}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1 text-xs text-slate-400">
            Individual asylum applications awaiting status determination by UNHCR and RRS
          </CardContent>
        </Card>
      </div>

      {/* Origin Country Breakdown */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-mono uppercase tracking-wider text-slate-400">
            Major Refugee Populations Hosted in Ethiopia by Country of Origin
          </h2>
          <span className="text-[11px] font-mono text-slate-500">Source: UNHCR Refugee Data Finder</span>
        </div>

        {refugeeOrigins.length === 0 ? (
          <EmptyState
            title="No Refugee Origin Records"
            description="Official UNHCR country-of-origin registration records are not currently populated."
            suggestions={[
              "Verify that UNHCR Refugee Data Finder datasets have completed ingestion",
              "Review the methodology page for data coverage notes",
            ]}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {refugeeOrigins.map((orig) => (
              <Card key={orig.originIso} className="hover:border-ink-600 transition-colors">
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base text-slate-100">{orig.originName}</CardTitle>
                      <span className="text-[10px] font-mono text-slate-500">ISO: {orig.originIso}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-cyan-400 font-bold text-lg block">
                        {formatNumber(orig.refugees)}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">{orig.percentage}% of hosted</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-1 text-xs text-slate-400">
                  <div className="pt-2 border-t border-ink-800/80 flex items-center justify-between font-mono text-[10px] text-slate-400">
                    <span className="inline-flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                      Biometric Registration
                    </span>
                    <span>Ref: {orig.reportingDate}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Interactive Flow & Sankey Visualization Section */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-mono uppercase tracking-wider text-slate-400">
            Displacement Corridors & Origin-Destination Pathways
          </h2>
          <Badge variant="cyan" size="sm" className="font-mono text-[10px]">
            Sankey Volume Scaled
          </Badge>
        </div>
        <FlowExplorerView initialDatasetId="refugee_inflows" />
      </section>

      {/* Official Citation Footer Callout */}
      <div className="p-4 rounded-lg border border-ink-800 bg-ink-900/60 flex items-start gap-3 text-xs text-slate-400">
        <ShieldCheck className="h-4 w-4 text-cyan-400 flex-shrink-0 mt-0.5" />
        <div>
          <div className="font-semibold text-slate-300">Official Primary Source Citation</div>
          <p className="mt-0.5 text-slate-400 font-serif italic">
            United Nations High Commissioner for Refugees (UNHCR) Refugee Data Finder (Year-End 2023 Report). Open Data under Creative Commons Attribution 4.0 International (CC BY 4.0).
          </p>
        </div>
      </div>
    </div>
  );
}
