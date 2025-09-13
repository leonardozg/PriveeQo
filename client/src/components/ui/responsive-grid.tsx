import * as React from "react";
import { cn } from "@/lib/utils";

interface ResponsiveGridProps {
  children: React.ReactNode;
  cols?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: number;
  className?: string;
}

export function ResponsiveGrid({ 
  children, 
  cols = { xs: 1, sm: 2, md: 3, lg: 4 },
  gap = 4,
  className
}: ResponsiveGridProps) {
  const colClasses: Record<number, string> = {
    1: "grid-cols-1",
    2: "grid-cols-2", 
    3: "grid-cols-3",
    4: "grid-cols-4",
    5: "grid-cols-5",
    6: "grid-cols-6"
  };

  const gapClass = `gap-${gap}`;

  const gridClasses = [
    "grid",
    cols.xs && colClasses[cols.xs],
    cols.sm && `sm:${colClasses[cols.sm]}`,
    cols.md && `md:${colClasses[cols.md]}`,
    cols.lg && `lg:${colClasses[cols.lg]}`,
    cols.xl && `xl:${colClasses[cols.xl]}`,
    gapClass
  ].filter(Boolean).join(" ");

  return (
    <div className={cn(gridClasses, className)}>
      {children}
    </div>
  );
}

interface ResponsiveStackProps {
  children: React.ReactNode;
  direction?: "col" | "row";
  breakpoint?: "sm" | "md" | "lg";
  gap?: number;
  className?: string;
}

export function ResponsiveStack({ 
  children, 
  direction = "row",
  breakpoint = "sm",
  gap = 4,
  className
}: ResponsiveStackProps) {
  const gapClass = `gap-${gap}`;
  const directionClass = direction === "col" ? "flex-col" : "flex-row";
  const breakpointClass = `${breakpoint}:${directionClass}`;

  return (
    <div className={cn(
      "flex",
      direction === "col" ? "flex-col" : "flex-col",
      breakpointClass,
      gapClass,
      className
    )}>
      {children}
    </div>
  );
}