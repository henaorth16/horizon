import React from "react";
import { AlertTriangle, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

export interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  message: string;
  details?: string;
  onRetry?: () => void;
  actionText?: string;
  onReset?: () => void;
  resetText?: string;
  suggestions?: string[];
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Failed to load visualization data",
  message,
  details,
  onRetry,
  actionText = "Retry Query",
  onReset,
  resetText = "Reset to Default View",
  suggestions,
  className,
  ...props
}) => {
  const [showDetails, setShowDetails] = React.useState(false);

  return (
    <div
      role="alert"
      className={cn(
        "flex min-h-[220px] w-full flex-col items-center justify-center rounded-lg border border-red-900/40 bg-red-950/20 p-8 text-center",
        className
      )}
      {...props}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-950/80 text-red-400 mb-3 border border-red-800/60 shadow-sm">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <h4 className="text-sm font-semibold text-red-200">{title}</h4>
      <p className="mt-1.5 max-w-sm text-xs text-red-300/80 leading-relaxed">{message}</p>

      {suggestions && suggestions.length > 0 && (
        <div className="mt-3 max-w-sm text-left rounded bg-ink-950/80 border border-red-900/40 p-2.5 w-full">
          <p className="text-[11px] font-mono text-red-300 font-semibold mb-1">Recommended Next Steps:</p>
          <ul className="text-[11px] text-red-300/80 space-y-1 list-disc list-inside">
            {suggestions.map((s, idx) => (
              <li key={idx} className="leading-snug">{s}</li>
            ))}
          </ul>
        </div>
      )}

      {details && (
        <div className="mt-3 max-w-md w-full text-left">
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-1 text-[11px] font-mono text-red-400 hover:text-red-300 mx-auto"
          >
            <span>{showDetails ? "Hide diagnostic trace" : "View diagnostic trace"}</span>
            {showDetails ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
          {showDetails && (
            <pre className="mt-2 p-2.5 rounded bg-ink-950 border border-red-900/50 text-[10px] font-mono text-red-300/90 overflow-x-auto whitespace-pre-wrap max-h-32">
              {details}
            </pre>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-center gap-2.5 mt-4">
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="border-red-800/60 text-red-200 hover:bg-red-950/60 hover:text-red-100 gap-1.5 font-mono text-xs"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>{actionText}</span>
          </Button>
        )}

        {onReset && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="text-xs font-mono text-slate-300 hover:text-slate-100 underline underline-offset-4"
          >
            {resetText}
          </Button>
        )}
      </div>
    </div>
  );
};
