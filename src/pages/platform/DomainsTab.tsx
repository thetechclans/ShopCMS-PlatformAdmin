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
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

interface Domain {
  id: string;
  tenant_id: string;
  domain: string;
  is_primary: boolean;
  is_verified: boolean;
  created_at: string;
  tenant?: {
    name: string;
  };
}

interface Tenant {
  id: string;
  name: string;
}

const DomainsTab = () => {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDomain, setEditingDomain] = useState<Domain | null>(null);
  const [formData, setFormData] = useState({
    tenant_id: '',
    domain: '',
    is_primary: false,
    is_verified: false
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [domainsResult, tenantsResult] = await Promise.all([
        supabase
          .from('tenant_domains')
          .select(`
            *,
            tenant:tenants(name)
          `)
          .order('created_at', { ascending: false }),
        supabase
          .from('tenants')
          .select('id, name')
          .eq('status', 'active')
          .order('name')
      ]);

      if (domainsResult.error) throw domainsResult.error;
      if (tenantsResult.error) throw tenantsResult.error;

      setDomains(domainsResult.data || []);
      setTenants(tenantsResult.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load domains');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingDomain) {
        const { error } = await supabase
          .from('tenant_domains')
          .update({
            tenant_id: formData.tenant_id,
            domain: formData.domain,
            is_primary: formData.is_primary,
            is_verified: formData.is_verified
          })
          .eq('id', editingDomain.id);

        if (error) throw error;
        toast.success('Domain updated successfully');
      } else {
        const { error } = await supabase
          .from('tenant_domains')
          .insert({
            tenant_id: formData.tenant_id,
            domain: formData.domain,
            is_primary: formData.is_primary,
            is_verified: formData.is_verified
          });

        if (error) throw error;
        toast.success('Domain added successfully');
      }

      setDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      console.error('Error saving domain:', error);
      toast.error(error.message || 'Failed to save domain');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this domain?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('tenant_domains')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Domain deleted successfully');
      fetchData();
    } catch (error: any) {
      console.error('Error deleting domain:', error);
      toast.error(error.message || 'Failed to delete domain');
    }
  };

  const handleEdit = (domain: Domain) => {
    setEditingDomain(domain);
    setFormData({
      tenant_id: domain.tenant_id,
      domain: domain.domain,
      is_primary: domain.is_primary,
      is_verified: domain.is_verified
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingDomain(null);
    setFormData({
      tenant_id: '',
      domain: '',
      is_primary: false,
      is_verified: false
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Custom Domains</CardTitle>
            <CardDescription>Link custom domains to tenants</CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Domain
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingDomain ? 'Edit Domain' : 'Add New Domain'}</DialogTitle>
                <DialogDescription>
                  {editingDomain ? 'Update domain configuration' : 'Link a custom domain to a tenant'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="tenant">Tenant</Label>
                  <Select value={formData.tenant_id} onValueChange={(value) => setFormData({ ...formData, tenant_id: value })} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a tenant" />
                    </SelectTrigger>
                    <SelectContent>
                      {tenants.map((tenant) => (
                        <SelectItem key={tenant.id} value={tenant.id}>
                          {tenant.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="domain">Domain Name</Label>
                  <Input
                    id="domain"
                    value={formData.domain}
                    onChange={(e) => setFormData({ ...formData, domain: e.target.value.toLowerCase() })}
                    placeholder="e.g., sunware.com"
                    required
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="is_primary">Primary Domain</Label>
                  <Switch
                    id="is_primary"
                    checked={formData.is_primary}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_primary: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="is_verified">Verified</Label>
                  <Switch
                    id="is_verified"
                    checked={formData.is_verified}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_verified: checked })}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingDomain ? 'Update' : 'Add'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">Loading domains...</div>
        ) : domains.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No domains configured. Add a custom domain to get started.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Domain</TableHead>
                <TableHead>Tenant</TableHead>
                <TableHead>Primary</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Added</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {domains.map((domain) => (
                <TableRow key={domain.id}>
                  <TableCell className="font-medium">{domain.domain}</TableCell>
                  <TableCell>{domain.tenant?.name || 'N/A'}</TableCell>
                  <TableCell>
                    {domain.is_primary && <Badge>Primary</Badge>}
                  </TableCell>
                  <TableCell>
                    {domain.is_verified ? (
                      <Badge variant="default" className="gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="gap-1">
                        <XCircle className="w-3 h-3" />
                        Not Verified
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{new Date(domain.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(domain)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(domain.id)}>
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

export default DomainsTab;