import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AdminAuthProvider } from "@/hooks/use-admin-auth";
import { PartnerAuthProvider } from "@/hooks/use-partner-auth";
import AdminPage from "@/pages/admin-complete";
import DataImport from "@/pages/data-import";
import PartnerPage from "@/pages/partner";
import PartnerLogin from "@/pages/partner-login";
import Landing from "@/pages/landing";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/admin" component={AdminPage} />
      <Route path="/data-import" component={DataImport} />
      <Route path="/partner" component={PartnerPage} />
      <Route path="/partner/login" component={PartnerLogin} />
      <Route component={NotFound} />
    </Switch>
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
