import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind classes cleanly without conflicts.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Formats a number with standard commas or compact notation (e.g., 2.4M, 150K).
 */
export function formatNumber(
  value: number | null | undefined,
  options?: { compact?: boolean; fallback?: string }
): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return options?.fallback ?? "—";
  }

  if (options?.compact) {
    return new Intl.NumberFormat("en-US", {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  }

  return new Intl.NumberFormat("en-US").format(value);
}

/**
 * Formats a percentage value (e.g., 42.5%).
 */
export function formatPercent(
  value: number | null | undefined,
  digits: number = 1
): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "—";
  }
  return `${value.toFixed(digits)}%`;
}

/**
 * Formats standard ISO dates to editorial humanitarian format (e.g. "Oct 2024").
 */
export function formatEditorialDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "Unknown";
  try {
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}
