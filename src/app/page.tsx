import React from "react";
import Link from "next/link";
import {
  Users,
  MapPin,
  Globe2,
  ArrowRightLeft,
  AlertTriangle,
  Info,
  ShieldCheck,
  Database,
  HeartHandshake,
  ArrowUpRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  getNationalProtectionMetrics,
  getRegionalIdpCaseloads,
  verifyDataIntegrity,
} from "@/lib/db";
import { formatNumber } from "@/lib/utils";
import { ExecutiveTrendLine } from "@/components/charts/ExecutiveTrendLine";
import { RegionalSummarySection } from "@/components/dashboard/RegionalSummarySection";

export default function Home() {
  const metrics = getNationalProtectionMetrics();
  const regionalCaseloads = getRegionalIdpCaseloads();
  const integrity = verifyDataIntegrity();

  return (
    <div className="space-y-8">
      {/* Editorial Headline */}
      <section className="space-y-3 border-b border-ink-700 pb-5">
        <div className="flex items-center gap-2 text-xs font-mono text-[#bc6c25] uppercase tracking-wider">
          <span>Humanitarian Evidence</span>
          <span>•</span>
          <span>Official Public Records</span>
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-100">
          Ethiopia Displacement & Human Mobility Observatory
        </h1>
        <p className="max-w-3xl text-sm sm:text-base text-slate-400 leading-relaxed font-normal">
          An open analytical observatory tracking internal displacement, refugee inflows, returnee reintegration, and international mobility for Ethiopia.
        </p>

        {/* Simplified Methodology Notice */}
        <div className="mt-3 flex items-start gap-2.5 rounded-lg border border-[#dda15e]/30 bg-[#dda15e]/10 p-3 text-xs text-slate-300 leading-relaxed">
          <Info className="h-4 w-4 text-[#bc6c25] dark:text-[#dda15e] flex-shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold text-slate-100">Methodology & Population Distinction: </strong>
            Figures for <span className="underline decoration-[#dda15e]/60">Internally Displaced Persons (IOM DTM)</span>,{" "}
            <span className="underline decoration-[#426b66]/60">Refugees & Asylum-Seekers (UNHCR)</span>, and{" "}
            <span className="underline decoration-[#795267]/60">International Migrants (UN DESA)</span> derive from separate survey mandates and must not be summed.
          </div>
        </div>
      </section>

      {/* KPI Headline Cards */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-medium">
            Core Monitored Populations
          </h2>
          <span className="text-[11px] font-mono text-slate-400">
            {integrity.validCount} verified records
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Card 1: IDPs */}
          <Card className="border-t-4 border-t-[#bc6c25] hover:shadow-md transition-shadow">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center justify-between">
                <Badge variant="rust" size="sm">IDPs</Badge>
                <span className="text-[10px] font-mono text-slate-400">IOM DTM R37</span>
              </div>
              <CardTitle className="text-2xl font-bold mt-2 font-mono text-slate-100">
                {formatNumber(metrics.totalIdps)}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-1">
              <p className="text-xs text-slate-400">
                Internally Displaced Persons across 12 regional states.
              </p>
              <div className="mt-3 pt-2 border-t border-ink-700/60 text-[10px] font-mono text-slate-400 flex items-center justify-between">
                <span>Period: {metrics.idpReportingPeriod}</span>
                <span>Mobility Tracking</span>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Refugees Hosted */}
          <Card className="border-t-4 border-t-[#426b66] hover:shadow-md transition-shadow">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center justify-between">
                <Badge variant="cyan" size="sm">Refugees Hosted</Badge>
                <span className="text-[10px] font-mono text-slate-400">UNHCR</span>
              </div>
              <CardTitle className="text-2xl font-bold mt-2 font-mono text-slate-100">
                {formatNumber(metrics.totalRefugees)}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-1">
              <p className="text-xs text-slate-400">
                Registered refugees hosted from South Sudan, Somalia, and Sudan.
              </p>
              <div className="mt-3 pt-2 border-t border-ink-700/60 text-[10px] font-mono text-slate-400 flex items-center justify-between">
                <span>Period: {metrics.refugeeReportingPeriod}</span>
                <span>ProGres V4</span>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Returnees */}
          <Card className="border-t-4 border-t-[#606c38] hover:shadow-md transition-shadow">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center justify-between">
                <Badge variant="sage" size="sm">Returnees</Badge>
                <span className="text-[10px] font-mono text-slate-400">IOM DTM R37</span>
              </div>
              <CardTitle className="text-2xl font-bold mt-2 font-mono text-slate-100">
                {formatNumber(metrics.totalReturnees)}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-1">
              <p className="text-xs text-slate-400">
                Former IDPs and returnees assessed at place of origin.
              </p>
              <div className="mt-3 pt-2 border-t border-ink-700/60 text-[10px] font-mono text-slate-400 flex items-center justify-between">
                <span>Period: {metrics.idpReportingPeriod}</span>
                <span>Village Assessment</span>
              </div>
            </CardContent>
          </Card>

          {/* Card 4: Asylum Seekers */}
          <Card className="border-t-4 border-t-[#795267] hover:shadow-md transition-shadow">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center justify-between">
                <Badge variant="indigo" size="sm">Asylum Seekers</Badge>
                <span className="text-[10px] font-mono text-slate-400">UNHCR / RRS</span>
              </div>
              <CardTitle className="text-2xl font-bold mt-2 font-mono text-slate-100">
                {formatNumber(metrics.totalAsylumSeekers)}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-1">
              <p className="text-xs text-slate-400">
                Individual asylum applications pending status determination.
              </p>
              <div className="mt-3 pt-2 border-t border-ink-700/60 text-[10px] font-mono text-slate-400 flex items-center justify-between">
                <span>Period: {metrics.refugeeReportingPeriod}</span>
                <span>Data Finder</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Executive Trend Line Chart Section */}
      <ExecutiveTrendLine />

      {/* Subnational Regional Summary Section */}
      <RegionalSummarySection caseloads={regionalCaseloads} />

      {/* Deep Topical Modules Quick Links Grid */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-medium">
            Observatory Modules
          </h2>
          <span className="text-[11px] font-mono text-slate-400">
            Interactive analytical views
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link href="/inside-ethiopia" className="group">
            <Card className="h-full hover:border-[#606c38] transition-all hover:shadow-sm">
              <CardHeader className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#606c38]">
                    <MapPin className="h-4 w-4" />
                    <CardTitle className="text-sm font-semibold text-slate-100 group-hover:text-[#606c38] transition-colors">
                      Inside Ethiopia: Regional Mobility
                    </CardTitle>
                  </div>
                  <ArrowUpRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-[#606c38] transition-colors" />
                </div>
                <CardDescription className="mt-1.5 text-slate-400 text-xs leading-relaxed">
                  Subnational displacement, conflict epicenters, and drought corridors across 12 regional states.
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/globe" className="group">
            <Card className="h-full hover:border-[#426b66] transition-all hover:shadow-sm">
              <CardHeader className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#426b66]">
                    <Globe2 className="h-4 w-4" />
                    <CardTitle className="text-sm font-semibold text-slate-100 group-hover:text-[#426b66] transition-colors">
                      3D Migration Globe
                    </CardTitle>
                  </div>
                  <ArrowUpRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-[#426b66] transition-colors" />
                </div>
                <CardDescription className="mt-1.5 text-slate-400 text-xs leading-relaxed">
                  Interactive globe mapping international migrant stocks and Horn of Africa corridors.
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/across-borders" className="group">
            <Card className="h-full hover:border-[#426b66] transition-all hover:shadow-sm">
              <CardHeader className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#426b66]">
                    <ArrowRightLeft className="h-4 w-4" />
                    <CardTitle className="text-sm font-semibold text-slate-100 group-hover:text-[#426b66] transition-colors">
                      Across Borders: Refugees
                    </CardTitle>
                  </div>
                  <ArrowUpRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-[#426b66] transition-colors" />
                </div>
                <CardDescription className="mt-1.5 text-slate-400 text-xs leading-relaxed">
                  UNHCR registration tracking refugees hosted from neighboring nations and Ethiopians abroad.
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/demographics" className="group">
            <Card className="h-full hover:border-[#606c38] transition-all hover:shadow-sm">
              <CardHeader className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#606c38]">
                    <Users className="h-4 w-4" />
                    <CardTitle className="text-sm font-semibold text-slate-100 group-hover:text-[#606c38] transition-colors">
                      People & Demographics
                    </CardTitle>
                  </div>
                  <ArrowUpRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-[#606c38] transition-colors" />
                </div>
                <CardDescription className="mt-1.5 text-slate-400 text-xs leading-relaxed">
                  Age-sex population pyramids, household vulnerabilities, and female-headed household ratios.
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/drivers" className="group">
            <Card className="h-full hover:border-[#dda15e] transition-all hover:shadow-sm">
              <CardHeader className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#dda15e]">
                    <AlertTriangle className="h-4 w-4" />
                    <CardTitle className="text-sm font-semibold text-slate-100 group-hover:text-[#dda15e] transition-colors">
                      Drivers & Crises
                    </CardTitle>
                  </div>
                  <ArrowUpRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-[#dda15e] transition-colors" />
                </div>
                <CardDescription className="mt-1.5 text-slate-400 text-xs leading-relaxed">
                  Comparison between conflict displacement, drought crises, and floods across woredas.
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/humanitarian-needs" className="group">
            <Card className="h-full hover:border-[#bc6c25] transition-all hover:shadow-sm">
              <CardHeader className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#bc6c25]">
                    <HeartHandshake className="h-4 w-4" />
                    <CardTitle className="text-sm font-semibold text-slate-100 group-hover:text-[#bc6c25] transition-colors">
                      Humanitarian Needs
                    </CardTitle>
                  </div>
                  <ArrowUpRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-[#bc6c25] transition-colors" />
                </div>
                <CardDescription className="mt-1.5 text-slate-400 text-xs leading-relaxed">
                  Food security classification, shelter gaps, and multi-sector humanitarian needs.
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/explorer" className="group">
            <Card className="h-full hover:border-[#795267] transition-all hover:shadow-sm">
              <CardHeader className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#795267]">
                    <Database className="h-4 w-4" />
                    <CardTitle className="text-sm font-semibold text-slate-100 group-hover:text-[#795267] transition-colors">
                      Data Explorer & Exports
                    </CardTitle>
                  </div>
                  <ArrowUpRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-[#795267] transition-colors" />
                </div>
                <CardDescription className="mt-1.5 text-slate-400 text-xs leading-relaxed">
                  Interactive dataset browser with multi-column filters, provenance audit, and CSV downloads.
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/methodology" className="group">
            <Card className="h-full hover:border-ink-600 transition-all hover:shadow-sm">
              <CardHeader className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-400">
                    <ShieldCheck className="h-4 w-4" />
                    <CardTitle className="text-sm font-semibold text-slate-100 group-hover:text-slate-200 transition-colors">
                      Sources & Methodology
                    </CardTitle>
                  </div>
                  <ArrowUpRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-200 transition-colors" />
                </div>
                <CardDescription className="mt-1.5 text-slate-400 text-xs leading-relaxed">
                  Documentation of survey methodologies, assessment rounds, and data constraints.
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </section>

      {/* Provenance Citations */}
      <section className="space-y-3">
        <h2 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-medium">
          Source Citations & Provenance
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center justify-between">
                <Badge variant="rust" size="sm">Internal Displacement</Badge>
                <span className="text-[10px] font-mono text-slate-400">CC BY 4.0</span>
              </div>
              <CardTitle className="text-sm font-semibold text-slate-200 mt-1">
                IOM Displacement Tracking Matrix (DTM)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-1 text-xs text-slate-400 space-y-2">
              <p className="leading-relaxed">
                {metrics.idpCitation}
              </p>
              <div className="pt-2 border-t border-ink-700/60 flex items-center justify-between font-mono text-[11px] text-slate-400">
                <span>Methodology: Site & Village Assessments</span>
                <span>Ref: Aug 2024</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center justify-between">
                <Badge variant="cyan" size="sm">Cross-Border Refugees</Badge>
                <span className="text-[10px] font-mono text-slate-400">CC BY 4.0</span>
              </div>
              <CardTitle className="text-sm font-semibold text-slate-200 mt-1">
                UNHCR Refugee Data Finder
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-1 text-xs text-slate-400 space-y-2">
              <p className="leading-relaxed">
                {metrics.refugeeCitation}
              </p>
              <div className="pt-2 border-t border-ink-700/60 flex items-center justify-between font-mono text-[11px] text-slate-400">
                <span>Methodology: ProGres V4 Registrations</span>
                <span>Ref: Dec 2023</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
