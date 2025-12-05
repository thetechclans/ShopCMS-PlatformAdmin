import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, X, Ban, Filter } from "lucide-react";
import { toast } from "sonner";

interface Profile {
  id: string;
  shop_name: string;
  email: string;
  tenant_id: string;
  status: string;
  created_at: string;
}

interface Tenant {
  id: string;
  name: string;
  subdomain: string;
}

interface TenantDomain {
  domain: string;
  is_primary: boolean;
}

const UsersTab = () => {
  const queryClient = useQueryClient();
  const [selectedTenant, setSelectedTenant] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // Fetch tenants for filter
  const { data: tenants } = useQuery({
    queryKey: ["tenants-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tenants")
        .select("id, name, subdomain")
        .order("name");
      if (error) throw error;
      return data as Tenant[];
    },
  });

  // Fetch users with filters via admin edge function (bypasses RLS restrictions)
  const { data: users, isLoading } = useQuery({
    queryKey: ["platform-users", selectedTenant, selectedStatus],
    queryFn: async () => {
      const tenantIdFilter = selectedTenant === "all" ? null : selectedTenant;
      const statusFilter = selectedStatus === "all" ? null : selectedStatus;

      const { data, error } = await supabase.functions.invoke("admin-users", {
        body: {
          action: "list",
          tenantIdFilter,
          statusFilter,
        },
      });

      if (error) {
        console.error("Error fetching users from admin-users function:", error);
        throw error;
      }

      return (data?.users || []) as (Profile & {
        tenants: { name: string; subdomain: string };
        domains: string[];
        primaryDomain: string;
      })[];
    },
  });

  // Update user status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ userId, status }: { userId: string; status: string }) => {
      const { error } = await supabase.functions.invoke("admin-users", {
        body: {
          action: "update-status",
          userId,
          newStatus: status,
        },
      });

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["platform-users"] });
      toast.success(`User ${variables.status === "active" ? "approved" : variables.status}!`);
    },
    onError: (error) => {
      console.error("Error updating user status via admin-users function:", error);
      toast.error("Failed to update user status");
    },
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      active: "default",
      pending: "secondary",
      suspended: "destructive",
    };

    return (
      <Badge variant={variants[status] || "default"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>
          Approve, suspend, or manage users across all tenants
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Filter by Tenant</label>
            <Select value={selectedTenant} onValueChange={setSelectedTenant}>
              <SelectTrigger>
                <SelectValue placeholder="All Tenants" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tenants</SelectItem>
                {tenants?.map((tenant) => (
                  <SelectItem key={tenant.id} value={tenant.id}>
                    {tenant.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Filter by Status</label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Users Table */}
        {isLoading ? (
          <div className="text-center py-8">Loading users...</div>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Shop Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Domain(s)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  users?.map((user) => (
                    <TableRow key={user.id} className={user.status === "pending" ? "bg-accent/50" : ""}>
                      <TableCell className="font-medium">{user.shop_name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{user.email || "N/A"}</TableCell>
                      <TableCell>{user.tenants?.name || "N/A"}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className="font-medium text-sm">{user.primaryDomain}</span>
                          {user.domains.length > 1 && (
                            <span className="text-xs text-muted-foreground">
                              +{user.domains.length - 1} more
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(user.status)}</TableCell>
                      <TableCell>
                        {new Date(user.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {user.status === "pending" && (
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() =>
                                updateStatusMutation.mutate({
                                  userId: user.id,
                                  status: "active",
                                })
                              }
                              disabled={updateStatusMutation.isPending}
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                          )}
                          {user.status === "active" && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() =>
                                updateStatusMutation.mutate({
                                  userId: user.id,
                                  status: "suspended",
                                })
                              }
                              disabled={updateStatusMutation.isPending}
                            >
                              <Ban className="w-4 h-4 mr-1" />
                              Suspend
                            </Button>
                          )}
                          {user.status === "suspended" && (
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() =>
                                updateStatusMutation.mutate({
                                  userId: user.id,
                                  status: "active",
                                })
                              }
                              disabled={updateStatusMutation.isPending}
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Activate
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UsersTab;
