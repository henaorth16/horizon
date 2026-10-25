"use client";

import React, { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export interface ChartContainerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  aspectRatio?: number; // e.g. 16/9 or 2
  minHeight?: number;
  ariaLabel: string;
  children: (dimensions: {
    width: number;
    height: number;
    boundedWidth: number;
    boundedHeight: number;
    margin: { top: number; right: number; bottom: number; left: number };
  }) => React.ReactNode;
  margin?: { top: number; right: number; bottom: number; left: number };
}

export const ChartContainer: React.FC<ChartContainerProps> = ({
  className,
  aspectRatio,
  minHeight = 240,
  ariaLabel,
  children,
  margin = { top: 20, right: 20, bottom: 30, left: 40 },
  ...props
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: 600,
    height: minHeight,
  });

  useEffect(() => {
    if (!containerRef.current) return;
    if (typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;

      const newWidth = Math.max(100, Math.floor(entry.contentRect.width));
      let newHeight = minHeight;

      if (aspectRatio) {
        newHeight = Math.max(minHeight, Math.floor(newWidth / aspectRatio));
      } else if (entry.contentRect.height > 0) {
        newHeight = Math.max(minHeight, Math.floor(entry.contentRect.height));
      }

      setDimensions({ width: newWidth, height: newHeight });
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [aspectRatio, minHeight]);

  const boundedWidth = Math.max(0, dimensions.width - margin.left - margin.right);
  const boundedHeight = Math.max(0, dimensions.height - margin.top - margin.bottom);

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label={ariaLabel}
      className={cn("relative w-full overflow-hidden select-none", className)}
      style={{ minHeight }}
      {...props}
    >
      {dimensions.width > 0 &&
        children({
          width: dimensions.width,
          height: dimensions.height,
          boundedWidth,
          boundedHeight,
          margin,
        })}
    </div>
  );
};
