import { Switch, Route } from "wouter";
import { Suspense, lazy } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AdminAuthProvider } from "@/hooks/use-admin-auth";
import { PartnerAuthProvider } from "@/hooks/use-partner-auth";

// Lazy-loaded components for code splitting
const AdminPage = lazy(() => import("@/pages/admin-complete"));
const DataImport = lazy(() => import("@/pages/data-import"));
const PartnerPage = lazy(() => import("@/pages/partner"));
const PartnerLogin = lazy(() => import("@/pages/partner-login"));
const Landing = lazy(() => import("@/pages/landing"));
const NotFound = lazy(() => import("@/pages/not-found"));

// Loading component
function PageLoader() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 mx-auto"></div>
        <p className="text-gray-600 mt-2">Cargando...</p>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/admin" component={AdminPage} />
        <Route path="/data-import" component={DataImport} />
        <Route path="/partner" component={PartnerPage} />
        <Route path="/partner/login" component={PartnerLogin} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AdminAuthProvider>
        <PartnerAuthProvider>
          <TooltipProvider>
            <div className="min-h-screen bg-slate-50 font-arial">
              <Router />
              <Toaster />
            </div>
          </TooltipProvider>
        </PartnerAuthProvider>
      </AdminAuthProvider>
    </QueryClientProvider>
  );
}

export default App;
