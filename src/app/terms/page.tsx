import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Scale, ShieldAlert, BookOpen, ExternalLink, HeartHandshake, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export const metadata: Metadata = {
  title: "Terms of Use — Ethiopia Migration & Displacement Observatory",
  description:
    "Operational guidelines, informational and humanitarian usage principles, CC BY 4.0 licensing, and data protection terms.",
};

export default function TermsPage() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="border-b border-ink-800 pb-5">
        <div className="flex items-center gap-2 text-xs font-mono text-amber-500 uppercase tracking-widest mb-1.5">
          <Scale className="h-4 w-4" />
          <span>Legal & Humanitarian Governance</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100">
              Terms of Use & Humanitarian Charter
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Ethical guidelines, open data licensing terms, operational limitations, and permitted use cases for humanitarian intelligence.
            </p>
          </div>
          <Badge variant="ochre" size="md" className="self-start sm:self-auto font-mono">
            Version 1.0 (2026)
          </Badge>
        </div>
      </div>

      {/* Primary Statement: Informational & Humanitarian Purpose */}
      <Card className="border-l-4 border-l-amber-500 bg-amber-500/5">
        <CardHeader className="p-5 pb-2">
          <div className="flex items-center gap-2">
            <HeartHandshake className="h-5 w-5 text-amber-400" />
            <CardTitle className="text-base text-slate-100">
              1. Exclusive Informational & Humanitarian Purpose
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-5 pt-1 text-xs text-slate-300 leading-relaxed space-y-2">
          <p>
            All datasets, visual models, interactive dashboards, time-series projections, and exported aggregates published on the
            <strong> Ethiopia Migration & Displacement Observatory</strong> are compiled and presented exclusively for
            public humanitarian analysis, academic research, journalistic reporting, policy evaluation, and non-commercial monitoring.
          </p>
          <p className="text-slate-400">
            This observatory is an independent open data synthesis initiative. The information presented herein does not constitute
            legal advice, formal asylum adjudication, or an official determination of international protection status for any individual
            or group. Humanitarian field conditions are dynamic; operational responders must verify critical localized figures directly
            with primary field agencies.
          </p>
        </CardContent>
      </Card>

      {/* Grid of Terms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mandate Isolation & Non-Affiliation */}
        <Card>
          <CardHeader className="p-5 pb-2">
            <CardTitle className="text-sm text-slate-100 flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-cyan-400" />
              <span>2. Agency Independence & Non-Affiliation</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-1 text-xs text-slate-400 space-y-2 leading-relaxed">
            <p>
              Data originates from authoritative humanitarian publishers—including the <strong>International Organization for Migration (IOM DTM)</strong>,
              the <strong>United Nations High Commissioner for Refugees (UNHCR)</strong>, the <strong>United Nations Office for the Coordination of Humanitarian Affairs (OCHA HDX)</strong>,
              and the <strong>United Nations Department of Economic and Social Affairs (UN DESA)</strong>.
            </p>
            <p>
              This observatory is not operated, administered, or formally endorsed by the United Nations or the Government of Ethiopia.
              Designations employed and boundary lines shown do not imply the expression of any opinion whatsoever concerning the legal status
              of any territory, city, or area, or of its authorities.
            </p>
          </CardContent>
        </Card>

        {/* CC BY 4.0 Re-use */}
        <Card>
          <CardHeader className="p-5 pb-2">
            <CardTitle className="text-sm text-slate-100 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-emerald-400" />
              <span>3. Open Access & CC BY 4.0 Licensing</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-1 text-xs text-slate-400 space-y-2 leading-relaxed">
            <p>
              Unless otherwise specified, content, analytical synthesis, and visualizations produced by this observatory are made available under
              the <strong>Creative Commons Attribution 4.0 International (CC BY 4.0)</strong> license.
            </p>
            <p>
              You are free to share, copy, distribute, adapt, and build upon the material in any medium or format, provided you provide appropriate
              attribution to the primary originating agency (e.g. IOM DTM or UNHCR) and this platform, provide a link to the license, and indicate if changes were made.
            </p>
          </CardContent>
        </Card>

        {/* Statistical Limitations */}
        <Card>
          <CardHeader className="p-5 pb-2">
            <CardTitle className="text-sm text-slate-100 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-purple-400" />
              <span>4. Field Collection Constraints & Limitations</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-1 text-xs text-slate-400 space-y-2 leading-relaxed">
            <p>
              Displacement tracking in active conflict, drought-affected, and remote pastoral corridors is subject to significant access constraints,
              communication blackouts, and logistical bottlenecks. Figures reported reflect verified site assessments and key informant estimates
              at the time of evaluation (e.g., IOM DTM Round 37, August 2024).
            </p>
            <p>
              Users should examine the temporal metadata, confidence tiers, and assessment round indicators attached to each observation record
              in the <Link href="/explorer" className="text-amber-400 hover:underline">Data Explorer</Link>.
            </p>
          </CardContent>
        </Card>

        {/* Data Protection & Non-Commercial Protection */}
        <Card>
          <CardHeader className="p-5 pb-2">
            <CardTitle className="text-sm text-slate-100 flex items-center gap-2">
              <Scale className="h-4 w-4 text-amber-400" />
              <span>5. Individual Protection & Privacy Safeguards</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-1 text-xs text-slate-400 space-y-2 leading-relaxed">
            <p>
              Under humanitarian data responsibility principles, any attempt to de-anonymize, trace, or deductively re-identify individuals
              or small vulnerable cohorts (<Link href="/privacy" className="text-amber-400 hover:underline">Statistical Disclosure Control threshold &lt; 5</Link>)
              using published aggregate figures is strictly prohibited.
            </p>
            <p>
              Downstream users are responsible for complying with the <em>IOM Data Protection Principles</em> and <em>UNHCR Data Protection Policy</em>.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Footer */}
      <div className="rounded-lg border border-ink-700 bg-ink-900/60 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
        <div>
          <span>Related policies:</span>
        </div>
        <div className="flex items-center gap-4 font-mono">
          <Link href="/privacy" className="text-[#bc6c25] dark:text-[#dda15e] hover:underline">Privacy Policy</Link>
          <span className="text-ink-700">•</span>
          <Link href="/attribution" className="text-[#bc6c25] dark:text-[#dda15e] hover:underline">Attribution</Link>
          <span className="text-ink-700">•</span>
          <Link href="/methodology" className="text-[#bc6c25] dark:text-[#dda15e] hover:underline">Methodology</Link>
        </div>
      </div>
    </div>
  );
}
