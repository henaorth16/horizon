import React from "react";
import { cn } from "@/lib/utils";

export interface LegendItem {
  id: string;
  label: string;
  color: string;
  value?: string | number;
  dashed?: boolean;
}

export interface ChartLegendProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect"> {
  items: LegendItem[];
  orientation?: "horizontal" | "vertical";
  onSelect?: (id: string) => void;
  activeId?: string | null;
}

export const ChartLegend: React.FC<ChartLegendProps> = ({
  items,
  orientation = "horizontal",
  onSelect,
  activeId,
  className,
  ...props
}) => {
  return (
    <div
      role="list"
      aria-label="Chart legend"
      className={cn(
        "flex flex-wrap gap-x-5 gap-y-2 text-xs font-mono text-slate-300",
        orientation === "vertical" ? "flex-col space-y-1.5" : "items-center",
        className
      )}
      {...props}
    >
      {items.map((item) => {
        const isInteractive = Boolean(onSelect);
        const isActive = activeId === undefined || activeId === null || activeId === item.id;

        return (
          <div
            key={item.id}
            role="listitem"
            tabIndex={isInteractive ? 0 : undefined}
            onClick={() => onSelect?.(item.id)}
            onKeyDown={(e) => {
              if (isInteractive && (e.key === "Enter" || e.key === " ")) {
                e.preventDefault();
                onSelect?.(item.id);
              }
            }}
            className={cn(
              "flex items-center gap-2 transition-opacity select-none",
              isInteractive && "cursor-pointer hover:text-slate-100",
              !isActive && "opacity-40"
            )}
          >
            <span
              className={cn(
                "h-2.5 w-2.5 rounded-sm flex-shrink-0",
                item.dashed && "border border-dashed border-current bg-transparent"
              )}
              style={{ backgroundColor: item.dashed ? undefined : item.color, borderColor: item.color }}
              aria-hidden="true"
            />
            <span className="font-sans font-medium text-slate-300">{item.label}</span>
            {item.value !== undefined && (
              <span className="font-mono text-slate-400 font-semibold">{item.value}</span>
            )}
          </div>
        );
      })}
    </div>
  );
};
