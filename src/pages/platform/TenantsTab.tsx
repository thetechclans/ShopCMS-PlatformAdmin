import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { PlanBadge } from "@/components/PlanBadge";

interface Tenant {
  id: string;
  name: string;
  slug: string;
  subdomain: string;
  status: string;
  created_at: string;
  plan_type?: string;
}

const TenantsTab = () => {
  const navigate = useNavigate();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    subdomain: '',
    status: 'active',
    plan_type: 'basic'
  });

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      const { data: tenantsData, error } = await supabase
        .from('tenants')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch plan types for all tenants
      const { data: limitsData } = await supabase
        .from('tenant_limits')
        .select('tenant_id, plan_type');

      // Map plan types to tenants
      const tenantsWithPlans = tenantsData?.map(tenant => ({
        ...tenant,
        plan_type: limitsData?.find(l => l.tenant_id === tenant.id)?.plan_type
      })) || [];

      setTenants(tenantsWithPlans);
    } catch (error) {
      console.error('Error fetching tenants:', error);
      toast.error('Failed to load tenants');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingTenant) {
        const { error } = await supabase
          .from('tenants')
          .update({
            name: formData.name,
            slug: formData.slug,
            subdomain: formData.subdomain,
            status: formData.status
          })
          .eq('id', editingTenant.id);

        if (error) throw error;
        toast.success('Tenant updated successfully');
      } else {
        // Create tenant
        const { data: newTenant, error: tenantError } = await supabase
          .from('tenants')
          .insert({
            name: formData.name,
            slug: formData.slug,
            subdomain: formData.subdomain,
            status: formData.status
          })
          .select()
          .single();

        if (tenantError) throw tenantError;

        // Define plan presets
        const planPresets: Record<string, any> = {
          basic: { max_products: 10, max_categories: 5, max_carousel_slides: 3, max_static_pages: 5, max_image_size_mb: 2 },
          silver: { max_products: 50, max_categories: 15, max_carousel_slides: 10, max_static_pages: 20, max_image_size_mb: 5 },
          gold: { max_products: 200, max_categories: 50, max_carousel_slides: 30, max_static_pages: 100, max_image_size_mb: 10 },
        };

        const preset = planPresets[formData.plan_type] || planPresets.basic;

        // Create tenant_limits automatically
        const { error: limitsError } = await supabase
          .from('tenant_limits')
          .insert({
            tenant_id: newTenant.id,
            plan_type: formData.plan_type,
            ...preset
          });

        if (limitsError) {
          console.error('Error creating tenant limits:', limitsError);
          toast.warning('Tenant created but limits could not be set. Please configure limits manually.');
        } else {
          toast.success(`Tenant created successfully with ${formData.plan_type} plan!`);
        }
      }

      setDialogOpen(false);
      resetForm();
      fetchTenants();
    } catch (error: any) {
      console.error('Error saving tenant:', error);
      toast.error(error.message || 'Failed to save tenant');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tenant? This will delete all associated data.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('tenants')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Tenant deleted successfully');
      fetchTenants();
    } catch (error: any) {
      console.error('Error deleting tenant:', error);
      toast.error(error.message || 'Failed to delete tenant');
    }
  };

  const handleEdit = (tenant: Tenant) => {
    setEditingTenant(tenant);
    setFormData({
      name: tenant.name,
      slug: tenant.slug,
      subdomain: tenant.subdomain,
      status: tenant.status,
      plan_type: tenant.plan_type || 'basic'
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingTenant(null);
    setFormData({
      name: '',
      slug: '',
      subdomain: '',
      status: 'active',
      plan_type: 'basic'
    });
  };

  const handlePreview = (slug: string) => {
    navigate(`/?tenant=${slug}`);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      active: "default",
      inactive: "secondary",
      suspended: "destructive"
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Tenants</CardTitle>
            <CardDescription>Manage shop tenants and their settings</CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Tenant
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingTenant ? 'Edit Tenant' : 'Create New Tenant'}</DialogTitle>
                <DialogDescription>
                  {editingTenant ? 'Update tenant information' : 'Add a new shop tenant to the platform'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Tenant Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Sunware Shop"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                    placeholder="e.g., sunware-shop"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="subdomain">Subdomain</Label>
                  <Input
                    id="subdomain"
                    value={formData.subdomain}
                    onChange={(e) => setFormData({ ...formData, subdomain: e.target.value.toLowerCase() })}
                    placeholder="e.g., sunware"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {!editingTenant && (
                  <div>
                    <Label htmlFor="plan_type">Plan Type</Label>
                    <Select value={formData.plan_type} onValueChange={(value) => setFormData({ ...formData, plan_type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic">Basic - 10 products, 5 categories</SelectItem>
                        <SelectItem value="silver">Silver - 50 products, 15 categories</SelectItem>
                        <SelectItem value="gold">Gold - 200 products, 50 categories</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground mt-1">
                      Limits can be adjusted later in the Limits tab
                    </p>
                  </div>
                )}
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingTenant ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">Loading tenants...</div>
        ) : tenants.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No tenants found. Create your first tenant to get started.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Subdomain</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tenants.map((tenant) => (
                <TableRow key={tenant.id}>
                  <TableCell className="font-medium">{tenant.name}</TableCell>
                  <TableCell>{tenant.subdomain}</TableCell>
                  <TableCell>{tenant.slug}</TableCell>
                  <TableCell>
                    {tenant.plan_type ? (
                      <PlanBadge planType={tenant.plan_type as "basic" | "silver" | "gold"} size="sm" />
                    ) : (
                      <Badge variant="outline">Not Set</Badge>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(tenant.status)}</TableCell>
                  <TableCell>{new Date(tenant.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handlePreview(tenant.slug)} title="Preview shop">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(tenant)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(tenant.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default TenantsTab;