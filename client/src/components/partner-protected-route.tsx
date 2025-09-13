import { usePartnerAuth } from "@/hooks/use-partner-auth";
import { Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { useEffect } from "react";

export function PartnerProtectedRoute({ children }: { children: React.ReactNode }) {
  const { partner, isLoading } = usePartnerAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !partner) {
      setLocation("/partner/login");
    }
  }, [isLoading, partner, setLocation]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  if (!partner) {
    return null; // Redirecting...
  }

  return <>{children}</>;
}