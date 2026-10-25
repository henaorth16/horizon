import React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "secondary", size = "md", children, disabled, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center rounded-md font-medium text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#bc6c25]/60 disabled:opacity-50 disabled:pointer-events-none select-none cursor-pointer";

    const variantStyles = {
      primary:
        "bg-[#bc6c25] text-[#fefae0] hover:bg-[#a65b1a] font-semibold shadow-sm active:translate-y-px",
      secondary:
        "bg-ink-800 text-slate-200 hover:bg-ink-700 border border-ink-700/80 active:translate-y-px",
      outline:
        "border border-ink-700 text-slate-300 hover:border-[#606c38] hover:text-slate-100 bg-transparent",
      ghost:
        "text-slate-400 hover:text-slate-100 hover:bg-ink-800/60 bg-transparent",
      danger:
        "bg-red-950/40 text-red-300 border border-red-700/40 hover:bg-red-900/50",
    }[variant];

    const sizeStyles = {
      sm: "h-8 px-3 text-xs",
      md: "h-9 px-4 text-sm",
      lg: "h-11 px-6 text-base",
      icon: "h-9 w-9 p-0",
    }[size];

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variantStyles, sizeStyles, className)}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
