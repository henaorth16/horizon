"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

const ROUTE_LABELS: Record<string, string> = {
  "": "Overview",
  "inside-ethiopia": "Inside Ethiopia",
  "globe": "Migration Globe",
  "across-borders": "Across Borders",
  "demographics": "People & Demographics",
  "drivers": "Drivers & Crises",
  "humanitarian-needs": "Humanitarian Needs",
  "explorer": "Data Explorer",
  "methodology": "Sources & Methodology",
  "terms": "Terms of Use",
  "privacy": "Privacy Policy",
  "attribution": "Attribution & Accreditations",
};

export const Breadcrumbs: React.FC<{ className?: string }> = ({ className }) => {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) {
    return (
      <nav aria-label="Breadcrumb" className={cn("flex items-center text-xs font-mono text-slate-400 mb-4", className)}>
        <span className="flex items-center gap-1.5 text-slate-300">
          <Home className="h-3.5 w-3.5 text-[#bc6c25] dark:text-[#dda15e]" />
          <span>Observatory</span>
        </span>
        <ChevronRight className="h-3.5 w-3.5 mx-2 text-ink-600" />
        <span className="text-[#bc6c25] dark:text-[#dda15e] font-medium">National Overview</span>
      </nav>
    );
  }

  let accumulatedPath = "";

  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center text-xs font-mono text-slate-400 mb-4", className)}>
      <Link href="/" className="flex items-center gap-1.5 hover:text-slate-200 transition-colors">
        <Home className="h-3.5 w-3.5 text-[#bc6c25] dark:text-[#dda15e]" />
        <span>Observatory</span>
      </Link>
      {segments.map((segment, index) => {
        accumulatedPath += `/${segment}`;
        const isLast = index === segments.length - 1;
        const label = ROUTE_LABELS[segment] || segment.replace(/-/g, " ");

        return (
          <React.Fragment key={accumulatedPath}>
            <ChevronRight className="h-3.5 w-3.5 mx-2 text-ink-600" />
            {isLast ? (
              <span className="text-[#bc6c25] dark:text-[#dda15e] font-semibold capitalize" aria-current="page">
                {label}
              </span>
            ) : (
              <Link href={accumulatedPath} className="hover:text-slate-200 capitalize transition-colors">
                {label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
