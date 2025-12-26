import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlanBadge } from "@/components/PlanBadge";
import { PLAN_DEFINITIONS, normalizePlanType, type PlanType } from "@/lib/plans";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Activity, BarChart2, Eye, TrendingUp } from "lucide-react";

type DateRange = "7d" | "30d" | "90d";

const rangeToDays: Record<DateRange, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
};

interface TenantPlanSummary {
  tenant_id: string;
  name: string;
  plan_type: string;
  total_page_views: number | string;
  total_product_views: number | string;
}

const toCount = (value: unknown): number => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const PlatformAnalytics = () => {
  const [range, setRange] = useState<DateRange>("7d");
  const days = rangeToDays[range];

  const { data: tenantPlanCounts = [] } = useQuery({
    queryKey: ["platform-tenant-plan-counts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tenant_limits")
        .select("tenant_id, plan_type, tenants!inner(status)")
        .eq("tenants.status", "active");

      if (error || !data) return [];

      const counts: Record<PlanType, number> = {
        basic: 0,
        silver: 0,
        gold: 0,
      };

      data.forEach((row: any) => {
        const plan = (row.plan_type as PlanType) ?? "basic";
        if (plan in counts) {
          counts[plan]++;
        }
      });

      return Object.entries(counts).map(([plan, count]) => ({
        planType: plan as PlanType,
        count,
      }));
    },
  });

  const { data: kpis } = useQuery({
    queryKey: ["platform-kpis", days],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("platform_kpis", { p_days: days });
      if (error || !data) {
        console.error("Failed to load platform KPIs:", error);
        return null;
      }
      return (Array.isArray(data) ? data[0] : data) as {
        total_page_views: number | string;
        total_product_views: number | string;
        total_category_views: number | string;
        active_tenants: number | string;
      };
    },
  });

  const { data: topTenants = [] } = useQuery({
    queryKey: ["platform-top-tenants", days],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("top_tenants_by_traffic_in_range", { p_days: days });
      if (error || !data) {
        console.error("Failed to load top tenants by traffic:", error);
        return [];
      }
      return data as TenantPlanSummary[];
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Platform Analytics</h1>
        <p className="text-muted-foreground">
          Overview of tenant activity and plan performance.
        </p>
      </div>

      <div className="flex items-center justify-end">
        <Select value={range} onValueChange={(value) => setRange(value as DateRange)}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Page views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {toCount(kpis?.total_page_views).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all tenants in the selected period.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Product views</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {toCount(kpis?.total_product_views).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Product detail page visits platform-wide.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Category views</CardTitle>
            <BarChart2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {toCount(kpis?.total_category_views).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Category page visits platform-wide.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active tenants</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {toCount(kpis?.active_tenants).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Tenants with at least one tracked event.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {tenantPlanCounts.map((item: any) => (
          <Card key={item.planType}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">
                  {PLAN_DEFINITIONS[item.planType].label} tenants
                </CardTitle>
                <PlanBadge planType={item.planType} size="sm" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{item.count}</div>
              <p className="text-xs text-muted-foreground">
                Active tenants on this plan.
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top tenants by traffic</CardTitle>
        </CardHeader>
        <CardContent>
          {topTenants.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No analytics data available yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead className="text-right">Page views</TableHead>
                  <TableHead className="text-right">Product views</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topTenants.map((row) => (
                  <TableRow key={row.tenant_id}>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>
                      <PlanBadge planType={normalizePlanType(row.plan_type)} size="sm" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline">
                        {toCount(row.total_page_views).toLocaleString()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline">
                        {toCount(row.total_product_views).toLocaleString()}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PlatformAnalytics;
