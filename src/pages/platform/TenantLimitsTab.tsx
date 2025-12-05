import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Settings, ArrowUp } from "lucide-react";
import { PlanBadge } from "@/components/PlanBadge";

interface TenantLimit {
  id: string;
  tenant_id: string;
  plan_type: string;
  max_products: number;
  max_categories: number;
  max_image_size_mb: number;
  max_carousel_slides: number;
  max_static_pages: number;
}

interface Tenant {
  id: string;
  name: string;
  subdomain: string;
}

const TenantLimitsTab = () => {
  const [open, setOpen] = useState(false);
  const [selectedLimit, setSelectedLimit] = useState<TenantLimit | null>(null);
  const [planType, setPlanType] = useState<string>("basic");
  const [maxProducts, setMaxProducts] = useState<number>(10);
  const [maxCategories, setMaxCategories] = useState<number>(5);
  const [maxImageSizeMb, setMaxImageSizeMb] = useState<number>(2.0);
  const [maxCarouselSlides, setMaxCarouselSlides] = useState<number>(3);
  const [maxStaticPages, setMaxStaticPages] = useState<number>(5);
  const queryClient = useQueryClient();

  const { data: limitsWithTenants = [], isLoading } = useQuery({
    queryKey: ["tenant-limits"],
    queryFn: async () => {
      const { data: limits, error: limitsError } = await supabase
        .from("tenant_limits")
        .select("*")
        .order("created_at", { ascending: false });

      if (limitsError) throw limitsError;

      const { data: tenants, error: tenantsError } = await supabase
        .from("tenants")
        .select("id, name, subdomain");

      if (tenantsError) throw tenantsError;

      return (limits || []).map((limit) => ({
        ...limit,
        tenant: tenants?.find((t) => t.id === limit.tenant_id),
      }));
    },
  });

  // Query for tenants without limits
  const { data: tenantsWithoutLimits = [] } = useQuery({
    queryKey: ["tenants-without-limits"],
    queryFn: async () => {
      const { data: allTenants, error: tenantsError } = await supabase
        .from("tenants")
        .select("id, name, subdomain")
        .eq("status", "active");

      if (tenantsError) throw tenantsError;

      const { data: limits, error: limitsError } = await supabase
        .from("tenant_limits")
        .select("tenant_id");

      if (limitsError) throw limitsError;

      const tenantIdsWithLimits = new Set(limits?.map((l) => l.tenant_id) || []);
      return (allTenants || []).filter((t) => !tenantIdsWithLimits.has(t.id));
    },
  });

  const updateLimitMutation = useMutation({
    mutationFn: async () => {
      if (!selectedLimit) throw new Error("No limit selected");

      const { error } = await supabase
        .from("tenant_limits")
        .update({
          plan_type: planType,
          max_products: maxProducts,
          max_categories: maxCategories,
          max_image_size_mb: maxImageSizeMb,
          max_carousel_slides: maxCarouselSlides,
          max_static_pages: maxStaticPages,
        })
        .eq("id", selectedLimit.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Tenant limits updated successfully");
      queryClient.invalidateQueries({ queryKey: ["tenant-limits"] });
      queryClient.invalidateQueries({ queryKey: ["tenants-without-limits"] });
      setOpen(false);
      setSelectedLimit(null);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const initializeLimitsMutation = useMutation({
    mutationFn: async (tenantId: string) => {
      const preset = {
        max_products: 10,
        max_categories: 5,
        max_carousel_slides: 3,
        max_static_pages: 5,
        max_image_size_mb: 2,
      };

      const { error } = await supabase
        .from("tenant_limits")
        .insert({
          tenant_id: tenantId,
          plan_type: "basic",
          ...preset,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Tenant limits initialized with Basic plan");
      queryClient.invalidateQueries({ queryKey: ["tenant-limits"] });
      queryClient.invalidateQueries({ queryKey: ["tenants-without-limits"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const openEditDialog = (limit: TenantLimit) => {
    setSelectedLimit(limit);
    setPlanType(limit.plan_type);
    setMaxProducts(limit.max_products);
    setMaxCategories(limit.max_categories);
    setMaxImageSizeMb(limit.max_image_size_mb);
    setMaxCarouselSlides(limit.max_carousel_slides);
    setMaxStaticPages(limit.max_static_pages);
    setOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateLimitMutation.mutate();
  };

  const quickUpgrade = (limit: TenantLimit, newPlan: string) => {
    const presets: Record<string, any> = {
      basic: { max_products: 10, max_categories: 5, max_carousel_slides: 3, max_static_pages: 5, max_image_size_mb: 2 },
      silver: { max_products: 50, max_categories: 15, max_carousel_slides: 10, max_static_pages: 20, max_image_size_mb: 5 },
      gold: { max_products: 200, max_categories: 50, max_carousel_slides: 30, max_static_pages: 100, max_image_size_mb: 10 },
    };

    setSelectedLimit(limit);
    setPlanType(newPlan);
    setMaxProducts(presets[newPlan].max_products);
    setMaxCategories(presets[newPlan].max_categories);
    setMaxCarouselSlides(presets[newPlan].max_carousel_slides);
    setMaxStaticPages(presets[newPlan].max_static_pages);
    setMaxImageSizeMb(presets[newPlan].max_image_size_mb);
    setOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Tenant Limits</h2>
        <p className="text-muted-foreground mt-2">
          Configure resource limits for each tenant based on their plan type
        </p>
      </div>

      {tenantsWithoutLimits.length > 0 && (
        <div className="border border-amber-500/50 rounded-lg p-4 bg-amber-50/50">
          <h3 className="text-lg font-semibold mb-2 text-amber-900">
            Tenants Without Limits
          </h3>
          <p className="text-sm text-amber-800 mb-3">
            The following tenants don't have limits configured. Initialize them with Basic plan defaults:
          </p>
          <div className="space-y-2">
            {tenantsWithoutLimits.map((tenant) => (
              <div key={tenant.id} className="flex items-center justify-between bg-background p-2 rounded">
                <div>
                  <span className="font-medium">{tenant.name}</span>
                  <span className="text-sm text-muted-foreground ml-2">
                    ({tenant.subdomain})
                  </span>
                </div>
                <Button
                  size="sm"
                  onClick={() => initializeLimitsMutation.mutate(tenant.id)}
                  disabled={initializeLimitsMutation.isPending}
                >
                  Initialize Limits
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tenant</TableHead>
              <TableHead>Subdomain</TableHead>
              <TableHead>Plan Type</TableHead>
              <TableHead>Max Products</TableHead>
              <TableHead>Max Categories</TableHead>
              <TableHead>Image Size (MB)</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : limitsWithTenants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  No tenant limits found
                </TableCell>
              </TableRow>
            ) : (
              limitsWithTenants.map((limit: any) => (
                <TableRow key={limit.id}>
                  <TableCell className="font-medium">
                    {limit.tenant?.name || "Unknown"}
                  </TableCell>
                  <TableCell>{limit.tenant?.subdomain || "-"}</TableCell>
                  <TableCell>
                    <PlanBadge planType={limit.plan_type} size="sm" />
                  </TableCell>
                  <TableCell>{limit.max_products}</TableCell>
                  <TableCell>{limit.max_categories}</TableCell>
                  <TableCell>{limit.max_image_size_mb}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {limit.plan_type === 'basic' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => quickUpgrade(limit, 'silver')}
                        >
                          <ArrowUp className="h-3 w-3 mr-1" />
                          Silver
                        </Button>
                      )}
                      {(limit.plan_type === 'basic' || limit.plan_type === 'silver') && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => quickUpgrade(limit, 'gold')}
                          className="border-amber-500/50 text-amber-700 hover:bg-amber-50"
                        >
                          <ArrowUp className="h-3 w-3 mr-1" />
                          Gold
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(limit)}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Tenant Limits</DialogTitle>
            <DialogDescription>
              Configure resource limits for this tenant
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="planType">Plan Type</Label>
                <Select value={planType} onValueChange={setPlanType}>
                  <SelectTrigger>
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
                <Label htmlFor="maxProducts">Max Products</Label>
                <Input
                  id="maxProducts"
                  type="number"
                  min="1"
                  value={maxProducts}
                  onChange={(e) => setMaxProducts(Number(e.target.value))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxCategories">Max Categories</Label>
                <Input
                  id="maxCategories"
                  type="number"
                  min="1"
                  value={maxCategories}
                  onChange={(e) => setMaxCategories(Number(e.target.value))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxImageSize">Max Image Size (MB)</Label>
                <Input
                  id="maxImageSize"
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={maxImageSizeMb}
                  onChange={(e) => setMaxImageSizeMb(Number(e.target.value))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxCarousel">Max Carousel Slides</Label>
                <Input
                  id="maxCarousel"
                  type="number"
                  min="1"
                  value={maxCarouselSlides}
                  onChange={(e) => setMaxCarouselSlides(Number(e.target.value))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxPages">Max Static Pages</Label>
                <Input
                  id="maxPages"
                  type="number"
                  min="1"
                  value={maxStaticPages}
                  onChange={(e) => setMaxStaticPages(Number(e.target.value))}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateLimitMutation.isPending}>
                {updateLimitMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TenantLimitsTab;
