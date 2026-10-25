import React from "react";
import { RotateCcw, SearchX } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  resetText?: string;
  onReset?: () => void;
  suggestions?: string[];
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No Data Available",
  description,
  actionText,
  onAction,
  resetText = "Reset Filter Parameters",
  onReset,
  suggestions,
  icon,
  className,
  ...props
}) => {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex min-h-[220px] w-full flex-col items-center justify-center rounded-lg border border-dashed border-ink-700 bg-ink-900/50 p-8 text-center",
        className
      )}
      {...props}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ink-850 text-[#bc6c25] dark:text-[#dda15e] mb-3 border border-ink-700 shadow-sm">
        {icon || <SearchX className="h-6 w-6 text-[#bc6c25] dark:text-[#dda15e]" />}
      </div>
      <h4 className="text-sm font-semibold text-slate-100">{title}</h4>
      <p className="mt-1.5 max-w-sm text-xs text-slate-400 leading-relaxed">{description}</p>

      {suggestions && suggestions.length > 0 && (
        <div className="mt-3 max-w-sm text-left rounded bg-ink-850/70 border border-ink-700 p-2.5 w-full">
          <p className="text-[11px] font-mono text-slate-300 font-semibold mb-1">Recommended Next Steps:</p>
          <ul className="text-[11px] text-slate-400 space-y-1 list-disc list-inside">
            {suggestions.map((s, idx) => (
              <li key={idx} className="leading-snug">{s}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
        {onReset && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onReset}
            className="text-xs font-mono border-ink-700 hover:border-amber-500/60 text-slate-200 hover:text-amber-400 gap-1.5"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>{resetText}</span>
          </Button>
        )}

        {actionText && onAction && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onAction}
            className="text-xs font-mono text-amber-400 hover:text-amber-300 underline underline-offset-4"
          >
            {actionText}
          </Button>
        )}
      </div>
    </div>
  );
};
