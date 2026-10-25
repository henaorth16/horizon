import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Cookie, EyeOff, Lock, Server, FileText, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export const metadata: Metadata = {
  title: "Privacy Policy & Zero-Tracking Charter — Ethiopia Migration & Displacement Observatory",
  description:
    "Strict zero-tracking cookie confirmation, client-side ephemeral state management, and statistical disclosure control to protect vulnerable displaced populations.",
};

export default function PrivacyPage() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="border-b border-ink-800 pb-5">
        <div className="flex items-center gap-2 text-xs font-mono text-emerald-500 uppercase tracking-widest mb-1.5">
          <ShieldCheck className="h-4 w-4" />
          <span>Humanitarian Data Ethics & Privacy</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100">
              Privacy Policy & Zero-Tracking Commitment
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              An architectural guarantee of zero tracking cookies, client-side state isolation, and statistical disclosure control to safeguard vulnerable populations.
            </p>
          </div>
          <Badge variant="sage" size="md" className="self-start sm:self-auto font-mono">
            Zero Tracking Verified
          </Badge>
        </div>
      </div>

      {/* Prominent Zero-Cookie Guarantee Banner */}
      <Card className="border-l-4 border-l-emerald-500 bg-emerald-500/5">
        <CardHeader className="p-5 pb-2">
          <div className="flex items-center gap-2">
            <Cookie className="h-5 w-5 text-emerald-400" />
            <CardTitle className="text-base text-slate-100">
              Zero-Tracking Cookies Guarantee
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-5 pt-1 text-xs text-slate-300 leading-relaxed space-y-2">
          <p>
            The <strong>Ethiopia Migration & Displacement Observatory</strong> operates on a strict
            <strong className="text-emerald-400"> Zero-Tracking, Zero-Cookie architecture</strong>.
          </p>
          <ul className="space-y-1.5 text-slate-400 pt-1">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
              <span><strong>No tracking cookies:</strong> We do not set any tracking cookies, session profiling cookies, or persistent device identifiers on your browser.</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
              <span><strong>No third-party ad tech or marketing pixels:</strong> We do not integrate Google Analytics, Meta Pixel, commercial telemetry trackers, or behavioral advertising scripts.</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
              <span><strong>No persistent user profiling:</strong> We do not record or monetize user visit histories, geographic browsing trails, or query logs.</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Core Privacy Safeguards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Ephemeral Client-Side State */}
        <Card>
          <CardHeader className="p-5 pb-2">
            <CardTitle className="text-sm text-slate-100 flex items-center gap-2">
              <EyeOff className="h-4 w-4 text-cyan-400" />
              <span>1. Ephemeral Client-Side State Storage</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-1 text-xs text-slate-400 space-y-2 leading-relaxed">
            <p>
              Interactive controls across the observatory—such as selecting an administrative region, toggling displacement triggers,
              or choosing an assessment round—are managed strictly in-memory or synchronized through public URL search parameters (`?region=ET01&driver=drought`).
            </p>
            <p>
              This allows users to bookmark and share specific views without transmitting or storing user identifiers in server-side databases.
            </p>
          </CardContent>
        </Card>

        {/* Statistical Disclosure Control (SDC) */}
        <Card>
          <CardHeader className="p-5 pb-2">
            <CardTitle className="text-sm text-slate-100 flex items-center gap-2">
              <Lock className="h-4 w-4 text-amber-400" />
              <span>2. Statistical Disclosure Control (SDC)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-1 text-xs text-slate-400 space-y-2 leading-relaxed">
            <p>
              In accordance with humanitarian microdata protection guidelines, small-area demographic breakdowns and vulnerability matrices
              enforce a strict cell suppression threshold (<strong>SDC Threshold = 5</strong>).
            </p>
            <p>
              Any demographic age-sex cohort or localized record with fewer than 5 individuals is systematically suppressed (`&quot;&lt;5&quot;`)
              in visualizations and CSV/JSON data exports to eliminate the danger of deductive re-identification of vulnerable individuals.
            </p>
          </CardContent>
        </Card>

        {/* Server Logs & Infrastructure Security */}
        <Card>
          <CardHeader className="p-5 pb-2">
            <CardTitle className="text-sm text-slate-100 flex items-center gap-2">
              <Server className="h-4 w-4 text-purple-400" />
              <span>3. Ephemeral Infrastructure Logging</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-1 text-xs text-slate-400 space-y-2 leading-relaxed">
            <p>
              Our web servers maintain standard technical access logs (containing client IP address, request method, request URI, and HTTP response code)
              strictly for the operational maintenance of network availability, mitigation of automated denial-of-service (DDoS) traffic, and debugging of server errors.
            </p>
            <p>
              These logs are automatically rotated and purged in compliance with secure infrastructure retention standards and are never linked to personal identities.
            </p>
          </CardContent>
        </Card>

        {/* Humanitarian Data Responsibility Alignment */}
        <Card>
          <CardHeader className="p-5 pb-2">
            <CardTitle className="text-sm text-slate-100 flex items-center gap-2">
              <FileText className="h-4 w-4 text-emerald-400" />
              <span>4. Humanitarian Ethical Alignment</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-1 text-xs text-slate-400 space-y-2 leading-relaxed">
            <p>
              Our privacy posture aligns with international humanitarian data standards, including:
            </p>
            <ul className="list-disc pl-4 space-y-1 text-slate-400">
              <li><em>OCHA Centre for Humanitarian Data</em> — Working Draft on Data Responsibility in Humanitarian Action</li>
              <li><em>IOM Data Protection Manual</em> (IN/138)</li>
              <li><em>UNHCR Policy on the Protection of Personal Data of Persons of Concern</em></li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Footer */}
      <div className="rounded-lg border border-ink-700 bg-ink-900/60 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
        <div>
          <span>Related policies:</span>
        </div>
        <div className="flex items-center gap-4 font-mono">
          <Link href="/terms" className="text-[#bc6c25] dark:text-[#dda15e] hover:underline">Terms of Use</Link>
          <span className="text-ink-700">•</span>
          <Link href="/attribution" className="text-[#bc6c25] dark:text-[#dda15e] hover:underline">Attribution</Link>
          <span className="text-ink-700">•</span>
          <Link href="/methodology" className="text-[#bc6c25] dark:text-[#dda15e] hover:underline">Methodology</Link>
        </div>
      </div>
    </div>
  );
}
