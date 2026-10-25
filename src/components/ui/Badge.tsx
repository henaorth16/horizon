import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "default"
    | "ochre"
    | "terracotta"
    | "ember"
    | "cyan"
    | "sage"
    | "indigo"
    | "outline"
    | "muted"
    | "forest"
    | "olive"
    | "sand"
    | "rust";
  size?: "sm" | "md";
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = "default",
  size = "sm",
  children,
  ...props
}) => {
  const variantStyles = {
    default: "bg-ink-800 text-slate-200 border-ink-700",
    ochre:
      "bg-[#dda15e]/20 text-[#854b0e] border-[#dda15e]/40 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-600/30",
    terracotta:
      "bg-[#bc6c25]/20 text-[#9a3412] border-[#bc6c25]/40 dark:bg-red-950/50 dark:text-red-300 dark:border-red-600/30",
    ember:
      "bg-[#dda15e]/25 text-[#9a3412] border-[#dda15e]/50 dark:bg-orange-950/50 dark:text-orange-300 dark:border-orange-600/30",
    cyan:
      "bg-[#426b66]/20 text-[#164e63] border-[#426b66]/40 dark:bg-cyan-950/50 dark:text-cyan-300 dark:border-cyan-600/30",
    sage:
      "bg-[#606c38]/20 text-[#283618] border-[#606c38]/40 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-600/30",
    indigo:
      "bg-[#795267]/20 text-[#581c87] border-[#795267]/40 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-600/30",
    forest:
      "bg-[#283618]/15 text-[#283618] border-[#283618]/30 dark:bg-[#283618]/80 dark:text-[#fefae0] dark:border-[#606c38]/40",
    olive:
      "bg-[#606c38]/20 text-[#283618] border-[#606c38]/40 dark:bg-[#606c38]/40 dark:text-[#fefae0] dark:border-[#606c38]/60",
    sand:
      "bg-[#dda15e]/25 text-[#854b0e] border-[#dda15e]/40 dark:bg-[#dda15e]/30 dark:text-[#dda15e] dark:border-[#dda15e]/50",
    rust:
      "bg-[#bc6c25]/20 text-[#853010] border-[#bc6c25]/40 dark:bg-[#bc6c25]/40 dark:text-[#fefae0] dark:border-[#bc6c25]/60",
    outline: "bg-transparent text-slate-300 border-ink-700",
    muted: "bg-ink-850/60 text-slate-400 border-ink-700/60",
  }[variant];

  const sizeStyles = {
    sm: "px-2 py-0.5 text-xs font-medium tracking-wide",
    md: "px-2.5 py-1 text-sm font-medium",
  }[size];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded border uppercase transition-colors select-none",
        variantStyles,
        sizeStyles,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
