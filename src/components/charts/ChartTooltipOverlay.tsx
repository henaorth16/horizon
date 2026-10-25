import React from "react";
import { cn } from "@/lib/utils";

export interface ChartTooltipOverlayProps {
  x: number;
  y: number;
  containerWidth: number;
  containerHeight: number;
  visible: boolean;
  title?: string;
  source?: string;
  referenceDate?: string;
  children: React.ReactNode;
}

export const ChartTooltipOverlay: React.FC<ChartTooltipOverlayProps> = ({
  x,
  y,
  containerWidth,
  containerHeight,
  visible,
  title,
  source,
  referenceDate,
  children,
}) => {
  if (!visible) return null;

  // Clamping tooltip to remain within parent bounds
  const tooltipWidth = 220;
  const tooltipHeight = 120;
  const padding = 12;

  let left = x + padding;
  if (left + tooltipWidth > containerWidth) {
    left = Math.max(padding, x - tooltipWidth - padding);
  }

  let top = y + padding;
  if (top + tooltipHeight > containerHeight) {
    top = Math.max(padding, y - tooltipHeight - padding);
  }

  return (
    <div
      role="tooltip"
      aria-hidden={!visible}
      style={{ left: `${left}px`, top: `${top}px` }}
      className={cn(
        "pointer-events-none absolute z-50 rounded-md border border-ink-700 bg-ink-900/95 p-3 text-xs text-slate-100 shadow-xl backdrop-blur-md transition-transform duration-75 ease-out",
        "min-w-[180px] max-w-[280px]"
      )}
    >
      {title && (
        <div className="font-semibold text-slate-100 border-b border-ink-700 pb-1.5 mb-2 flex items-center justify-between">
          <span>{title}</span>
        </div>
      )}
      <div className="space-y-1.5 text-slate-300">{children}</div>
      {(source || referenceDate) && (
        <div className="mt-2.5 pt-1.5 border-t border-ink-800 text-[10px] text-slate-400 flex items-center justify-between font-mono">
          {source && <span>Src: {source}</span>}
          {referenceDate && <span>Ref: {referenceDate}</span>}
        </div>
      )}
    </div>
  );
};
