import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PlanBadge } from "@/components/PlanBadge";
import { toast } from "sonner";
import { RotateCcw } from "lucide-react";
import { PLAN_DEFINITIONS, normalizePlanType, type PlanType } from "@/lib/plans";

type SubscriptionState = "active" | "expiring_soon" | "expired";

type TenantSubscriptionRow = {
  limitId: string;
  tenantId: string;
  tenantName: string;
  tenantSubdomain: string;
  tenantStatus: string;
  primaryDomain: string;
  planType: PlanType;
  subscriptionStartedAt: string;
  subscriptionExpiresAt: string;
  subscriptionState: SubscriptionState;
  daysLeft: number;
  totalUsers: number;
  activeUsers: number;
  pendingUsers: number;
  suspendedUsers: number;
};

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const EXPIRING_SOON_DAYS = 7;
const DEFAULT_SUBSCRIPTION_DAYS = 30;

const getSubscriptionState = (daysLeft: number): SubscriptionState => {
  if (daysLeft < 0) return "expired";
  if (daysLeft <= EXPIRING_SOON_DAYS) return "expiring_soon";
  return "active";
};

const formatDateTime = (value: string) => new Date(value).toLocaleString();
const getDefaultExpiryDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + DEFAULT_SUBSCRIPTION_DAYS);
  return date.toISOString().slice(0, 10);
};
const toEndOfDayIso = (value: string) => new Date(`${value}T23:59:59`).toISOString();
const isDateInPast = (value: string) => new Date(`${value}T23:59:59`).getTime() < Date.now();

const getTenantStatusBadge = (status: string) => {
  if (status === "active") return <Badge>Active</Badge>;
  if (status === "inactive") return <Badge variant="secondary">Inactive</Badge>;
  if (status === "suspended") return <Badge variant="destructive">Suspended</Badge>;
  return <Badge variant="outline">{status}</Badge>;
};

const TenantSubscriptionsTab = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | SubscriptionState>("all");
  const [planFilter, setPlanFilter] = useState<"all" | "basic" | "silver" | "gold">("all");
  const [renewDialogOpen, setRenewDialogOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<TenantSubscriptionRow | null>(null);
  const [renewPlanType, setRenewPlanType] = useState<PlanType>("basic");
  const [renewSubscriptionExpiresAt, setRenewSubscriptionExpiresAt] = useState(getDefaultExpiryDate());
  const queryClient = useQueryClient();

  const { data: subscriptions = [], isLoading } = useQuery({
    queryKey: ["tenant-subscriptions"],
    queryFn: async () => {
      const [limitsRes, domainsRes, profilesRes] = await Promise.all([
        supabase
          .from("tenant_limits")
          .select(
            `
              id,
              tenant_id,
              plan_type,
              subscription_started_at,
              subscription_expires_at,
              tenants!inner(id, name, subdomain, status)
            `,
          )
          .order("subscription_expires_at", { ascending: true }),
        supabase
          .from("tenant_domains")
          .select("tenant_id, domain, is_primary, is_verified"),
        supabase
          .from("profiles")
          .select("tenant_id, status"),
      ]);

      if (limitsRes.error) throw limitsRes.error;
      if (domainsRes.error) throw domainsRes.error;
      if (profilesRes.error) throw profilesRes.error;

      const profileCounts = new Map<
        string,
        { total: number; active: number; pending: number; suspended: number }
      >();

      (profilesRes.data || []).forEach((profile: any) => {
        if (!profile.tenant_id) return;

        const current = profileCounts.get(profile.tenant_id) || {
          total: 0,
          active: 0,
          pending: 0,
          suspended: 0,
        };

        current.total += 1;
        if (profile.status === "active") current.active += 1;
        if (profile.status === "pending") current.pending += 1;
        if (profile.status === "suspended") current.suspended += 1;

        profileCounts.set(profile.tenant_id, current);
      });

      const domainsByTenant = new Map<string, string>();
      const verifiedDomainByTenant = new Map<string, string>();

      (domainsRes.data || []).forEach((domain: any) => {
        if (!domain.tenant_id || !domain.domain) return;

        if (!domainsByTenant.has(domain.tenant_id)) {
          domainsByTenant.set(domain.tenant_id, domain.domain);
        }

        if (domain.is_verified && !verifiedDomainByTenant.has(domain.tenant_id)) {
          verifiedDomainByTenant.set(domain.tenant_id, domain.domain);
        }

        if (domain.is_primary) {
          domainsByTenant.set(domain.tenant_id, domain.domain);
          if (domain.is_verified) {
            verifiedDomainByTenant.set(domain.tenant_id, domain.domain);
          }
        }
      });

      const now = Date.now();

      return (limitsRes.data || []).map((row: any) => {
        const expiryMs = new Date(row.subscription_expires_at).getTime();
        const daysLeft = Math.ceil((expiryMs - now) / MS_PER_DAY);
        const subscriptionState = getSubscriptionState(daysLeft);
        const counts = profileCounts.get(row.tenant_id) || {
          total: 0,
          active: 0,
          pending: 0,
          suspended: 0,
        };

        return {
          limitId: row.id,
          tenantId: row.tenant_id,
          tenantName: row.tenants?.name || "Unknown",
          tenantSubdomain: row.tenants?.subdomain || "-",
          tenantStatus: row.tenants?.status || "unknown",
          primaryDomain:
            verifiedDomainByTenant.get(row.tenant_id) ||
            domainsByTenant.get(row.tenant_id) ||
            row.tenants?.subdomain ||
            "-",
          planType: normalizePlanType(row.plan_type),
          subscriptionStartedAt: row.subscription_started_at,
          subscriptionExpiresAt: row.subscription_expires_at,
          subscriptionState,
          daysLeft,
          totalUsers: counts.total,
          activeUsers: counts.active,
          pendingUsers: counts.pending,
          suspendedUsers: counts.suspended,
        } as TenantSubscriptionRow;
      });
    },
  });

  const renewMutation = useMutation({
    mutationFn: async () => {
      if (!selectedSubscription) {
        throw new Error("No subscription selected.");
      }

      if (isDateInPast(renewSubscriptionExpiresAt)) {
        throw new Error("Subscription expiry must be today or a future date.");
      }

      const baseUpdate = {
        plan_type: renewPlanType,
        subscription_started_at: new Date().toISOString(),
        subscription_expires_at: toEndOfDayIso(renewSubscriptionExpiresAt),
      };

      const updatePayload =
        renewPlanType === selectedSubscription.planType
          ? baseUpdate
          : {
              ...baseUpdate,
              max_products: PLAN_DEFINITIONS[renewPlanType].defaultLimits.maxProducts,
              max_categories: PLAN_DEFINITIONS[renewPlanType].defaultLimits.maxCategories,
              max_carousel_slides: PLAN_DEFINITIONS[renewPlanType].defaultLimits.maxCarouselSlides,
              max_static_pages: PLAN_DEFINITIONS[renewPlanType].defaultLimits.maxStaticPages,
              max_image_size_mb: PLAN_DEFINITIONS[renewPlanType].defaultLimits.maxImageSizeMb,
            };

      const { error } = await supabase.from("tenant_limits").update(updatePayload).eq("id", selectedSubscription.limitId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Subscription renewed successfully.");
      queryClient.invalidateQueries({ queryKey: ["tenant-subscriptions"] });
      setRenewDialogOpen(false);
      setSelectedSubscription(null);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const openRenewDialog = (row: TenantSubscriptionRow) => {
    setSelectedSubscription(row);
    setRenewPlanType(row.planType);
    setRenewSubscriptionExpiresAt(getDefaultExpiryDate());
    setRenewDialogOpen(true);
  };

  const filteredSubscriptions = useMemo(() => {
    const searchLower = search.trim().toLowerCase();

    return subscriptions.filter((row) => {
      const matchesSearch =
        !searchLower ||
        row.tenantName.toLowerCase().includes(searchLower) ||
        row.tenantSubdomain.toLowerCase().includes(searchLower) ||
        row.primaryDomain.toLowerCase().includes(searchLower);

      const matchesStatus = statusFilter === "all" || row.subscriptionState === statusFilter;
      const matchesPlan = planFilter === "all" || row.planType === planFilter;

      return matchesSearch && matchesStatus && matchesPlan;
    });
  }, [subscriptions, search, statusFilter, planFilter]);

  const totals = useMemo(() => {
    const active = subscriptions.filter((row) => row.subscriptionState === "active").length;
    const expiringSoon = subscriptions.filter((row) => row.subscriptionState === "expiring_soon").length;
    const expired = subscriptions.filter((row) => row.subscriptionState === "expired").length;
    const activeUsers = subscriptions.reduce((sum, row) => sum + row.activeUsers, 0);

    return {
      tenants: subscriptions.length,
      active,
      expiringSoon,
      expired,
      activeUsers,
    };
  }, [subscriptions]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Tenant Subscriptions</h2>
        <p className="text-muted-foreground mt-1">
          Track subscribed tenants, expiry windows, active tenant users, and renew expired plans.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total subscribed tenants</CardDescription>
            <CardTitle>{totals.tenants}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active subscriptions</CardDescription>
            <CardTitle>{totals.active}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Expiring in {EXPIRING_SOON_DAYS} days</CardDescription>
            <CardTitle>{totals.expiringSoon}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Expired subscriptions</CardDescription>
            <CardTitle>{totals.expired}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active tenant users</CardDescription>
            <CardTitle>{totals.activeUsers}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Subscription Directory</CardTitle>
          <CardDescription>
            Search tenants, filter by subscription state and plan, and renew subscriptions in place.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3 mb-4">
            <Input
              placeholder="Search by tenant, subdomain, or domain"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as typeof statusFilter)}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All states</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expiring_soon">Expiring soon</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
            <Select value={planFilter} onValueChange={(value) => setPlanFilter(value as typeof planFilter)}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All plans</SelectItem>
                <SelectItem value="basic">Basic</SelectItem>
                <SelectItem value="silver">Silver</SelectItem>
                <SelectItem value="gold">Gold</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Primary Domain</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Tenant Status</TableHead>
                  <TableHead>Subscription Window</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Days Left</TableHead>
                  <TableHead>User Snapshot</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      Loading subscription data...
                    </TableCell>
                  </TableRow>
                ) : filteredSubscriptions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      No subscriptions found for the selected filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSubscriptions.map((row) => (
                    <TableRow key={row.tenantId}>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium">{row.tenantName}</p>
                          <p className="text-xs text-muted-foreground">{row.tenantSubdomain}</p>
                        </div>
                      </TableCell>
                      <TableCell>{row.primaryDomain}</TableCell>
                      <TableCell>
                        <PlanBadge planType={row.planType} size="sm" />
                      </TableCell>
                      <TableCell>{getTenantStatusBadge(row.tenantStatus)}</TableCell>
                      <TableCell>
                        <div className="text-xs space-y-1">
                          <p>Start: {formatDateTime(row.subscriptionStartedAt)}</p>
                          <p>End: {formatDateTime(row.subscriptionExpiresAt)}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {row.subscriptionState === "active" && <Badge>Active</Badge>}
                        {row.subscriptionState === "expiring_soon" && <Badge variant="secondary">Expiring Soon</Badge>}
                        {row.subscriptionState === "expired" && <Badge variant="destructive">Expired</Badge>}
                      </TableCell>
                      <TableCell>
                        {row.daysLeft >= 0 ? `${row.daysLeft} day(s)` : `Expired ${Math.abs(row.daysLeft)} day(s) ago`}
                      </TableCell>
                      <TableCell>
                        <div className="text-xs space-y-1">
                          <p>Total: {row.totalUsers}</p>
                          <p>Active: {row.activeUsers}</p>
                          <p>Pending: {row.pendingUsers}</p>
                          <p>Suspended: {row.suspendedUsers}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant={row.subscriptionState === "expired" ? "default" : "outline"}
                          size="sm"
                          onClick={() => openRenewDialog(row)}
                          disabled={renewMutation.isPending}
                        >
                          <RotateCcw className="mr-2 h-4 w-4" />
                          {row.subscriptionState === "expired" ? "Add subscription" : "Renew"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={renewDialogOpen}
        onOpenChange={(open) => {
          setRenewDialogOpen(open);
          if (!open) {
            setSelectedSubscription(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedSubscription?.subscriptionState === "expired" ? "Add new subscription" : "Renew subscription"}
            </DialogTitle>
            <DialogDescription>
              {selectedSubscription
                ? `Update ${selectedSubscription.tenantName} to keep services active and set a new subscription period.`
                : "Update the selected tenant's subscription period."}
            </DialogDescription>
          </DialogHeader>

          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              renewMutation.mutate();
            }}
          >
            <div className="space-y-2">
              <Label>Tenant</Label>
              <Input value={selectedSubscription?.tenantName || ""} disabled />
            </div>

            <div className="space-y-2">
              <Label htmlFor="renew-plan">Subscription Plan</Label>
              <Select value={renewPlanType} onValueChange={(value) => setRenewPlanType(value as PlanType)}>
                <SelectTrigger id="renew-plan">
                  <SelectValue placeholder="Select plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="silver">Silver</SelectItem>
                  <SelectItem value="gold">Gold</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="renew-expiry">New Subscription Expiry</Label>
              <Input
                id="renew-expiry"
                type="date"
                value={renewSubscriptionExpiresAt}
                onChange={(event) => setRenewSubscriptionExpiresAt(event.target.value)}
                min={new Date().toISOString().slice(0, 10)}
              />
            </div>

            <div className="rounded-md border bg-muted/40 p-3 text-sm text-muted-foreground">
              Renewing the subscription resets the start date to today. If you switch plans, the selected plan's default
              limits are applied as part of the update.
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setRenewDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={renewMutation.isPending}>
                {renewMutation.isPending ? "Saving..." : "Save subscription"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TenantSubscriptionsTab;
