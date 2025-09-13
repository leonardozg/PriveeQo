import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface EnhancedButtonProps extends React.ComponentProps<typeof Button> {
  loading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
  gradient?: boolean;
  animation?: "press" | "lift" | "none";
  pulse?: boolean;
}

export function EnhancedButton({ 
  children, 
  className, 
  loading = false, 
  loadingText = "Cargando...",
  icon,
  gradient = false,
  animation = "press",
  pulse = false,
  disabled,
  ...props 
}: EnhancedButtonProps) {
  const animationClass = {
    press: "button-press",
    lift: "hover-lift",
    none: ""
  };

  return (
    <Button
      className={cn(
        "relative overflow-hidden transition-all duration-200",
        gradient && "enhanced-button",
        animationClass[animation],
        pulse && "badge-pulse",
        "shadow-md hover:shadow-lg",
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      <span className="relative z-10 flex items-center justify-center space-x-2">
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>{loadingText}</span>
          </>
        ) : (
          <>
            {icon && <span>{icon}</span>}
            <span>{children}</span>
          </>
        )}
      </span>
    </Button>
  );
}