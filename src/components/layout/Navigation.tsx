"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MapPin,
  Globe2,
  ArrowRightLeft,
  Users,
  AlertOctagon,
  HeartHandshake,
  Database,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  status?: "active" | "planned";
}

export const NAV_ITEMS: NavItem[] = [
  { title: "Overview", href: "/", icon: LayoutDashboard },
  { title: "Inside Ethiopia", href: "/inside-ethiopia", icon: MapPin },
  { title: "Migration Globe", href: "/globe", icon: Globe2 },
  { title: "Across Borders", href: "/across-borders", icon: ArrowRightLeft },
  { title: "People & Demographics", href: "/demographics", icon: Users },
  { title: "Drivers & Crises", href: "/drivers", icon: AlertOctagon },
  { title: "Humanitarian Needs", href: "/humanitarian-needs", icon: HeartHandshake },
  { title: "Data Explorer", href: "/explorer", icon: Database },
  { title: "Sources & Methodology", href: "/methodology", icon: BookOpen },
];

export const Navigation: React.FC<{ className?: string; onNavigate?: () => void }> = ({
  className,
  onNavigate,
}) => {
  const pathname = usePathname();

  return (
    <nav className={cn("space-y-1", className)} aria-label="Observatory Navigation">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-xs font-medium transition-all group select-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none",
              isActive
                ? "bg-amber-500/10 text-amber-400 font-semibold border-l-2 border-amber-500 pl-2.5 shadow-sm"
                : "text-slate-400 hover:bg-ink-800/60 hover:text-slate-200"
            )}
          >
            <Icon
              className={cn(
                "h-4 w-4 transition-colors flex-shrink-0",
                isActive ? "text-amber-400" : "text-slate-400 group-hover:text-slate-300"
              )}
            />
            <span className="truncate">{item.title}</span>
            {item.status === "planned" && (
              <span className="ml-auto text-[10px] uppercase font-mono px-1 py-0.2 rounded bg-ink-800 text-slate-500">
                WIP
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
};
