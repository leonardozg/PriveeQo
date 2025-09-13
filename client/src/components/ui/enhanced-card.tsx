import * as React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface EnhancedCardProps extends React.ComponentProps<typeof Card> {
  hover?: boolean;
  interactive?: boolean;
  gradient?: boolean;
  animation?: "fade" | "slide" | "scale" | "bounce";
  delay?: number;
}

export function EnhancedCard({ 
  children, 
  className, 
  hover = false, 
  interactive = false, 
  gradient = false,
  animation = "fade",
  delay = 0,
  ...props 
}: EnhancedCardProps) {
  const animationClass = {
    fade: "animate-fade-in",
    slide: "animate-slide-up", 
    scale: "animate-scale-in",
    bounce: "animate-bounce-subtle"
  };

  return (
    <Card
      className={cn(
        "enhanced-card",
        hover && "hover-lift",
        interactive && "card-hover cursor-pointer",
        gradient && "bg-gradient-to-br from-white to-gray-50",
        animationClass[animation],
        className
      )}
      style={{ animationDelay: `${delay}s` }}
      {...props}
    >
      {children}
    </Card>
  );
}