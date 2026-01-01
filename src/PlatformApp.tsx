import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PlatformAdminLayout } from "./pages/platform/PlatformAdminLayout";
import { PlatformAdminGuard } from "./pages/platform/PlatformAdminGuard";
import TenantsTab from "./pages/platform/TenantsTab";
import DomainsTab from "./pages/platform/DomainsTab";
import UsersTab from "./pages/platform/UsersTab";
import TenantLimitsTab from "./pages/platform/TenantLimitsTab";
import PlatformAnalytics from "./pages/platform/PlatformAnalytics";
import { TemplateEditor } from "./pages/platform/TemplateEditor";
import SubscriptionManagement from "./pages/admin/SubscriptionManagement";
import TenantRequests from "./pages/admin/TenantRequests";
import PlatformHome from "./pages/PlatformHome";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const PlatformApp = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PlatformHome />} />
          <Route path="/auth" element={<Auth />} />

          <Route
            path="/platform/admin"
            element={
              <PlatformAdminGuard>
                <PlatformAdminLayout />
              </PlatformAdminGuard>
            }
          >
            <Route index element={<TenantsTab />} />
            <Route path="tenants" element={<TenantsTab />} />
            <Route path="domains" element={<DomainsTab />} />
            <Route path="users" element={<UsersTab />} />
            <Route path="limits" element={<TenantLimitsTab />} />
            <Route path="analytics" element={<PlatformAnalytics />} />
            <Route path="templates/basic" element={<TemplateEditor planType="basic" />} />
            <Route path="templates/silver" element={<TemplateEditor planType="silver" />} />
            <Route path="templates/gold" element={<TemplateEditor planType="gold" />} />
            <Route path="subscriptions" element={<SubscriptionManagement />} />
            <Route path="tenant-requests" element={<TenantRequests />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default PlatformApp;
