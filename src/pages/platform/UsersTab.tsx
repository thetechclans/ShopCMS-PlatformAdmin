import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Ban, Check, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface PlatformUser {
  id: string;
  shop_name: string | null;
  email: string | null;
  tenant_id: string | null;
  status: string;
  created_at: string;
  tenants: { name: string; subdomain: string } | null;
  domains: string[];
  primaryDomain: string;
  roles: string[];
  is_self: boolean;
  is_last_super_admin: boolean;
  is_last_tenant_admin: boolean;
}

interface Tenant {
  id: string;
  name: string;
  subdomain: string;
}

type ParsedDeleteError = {
  code: string;
  message: string;
};

const toStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (typeof item === "string") return item;
      if (item && typeof item === "object" && "role" in item) {
        const roleValue = (item as { role?: unknown }).role;
        if (typeof roleValue === "string") {
          return roleValue;
        }
      }
      return null;
    })
    .filter((item): item is string => Boolean(item));
};

const normalizePlatformUser = (raw: any): PlatformUser => {
  const domains = toStringArray(raw?.domains);
  const roles = toStringArray(raw?.roles);
  const tenant = raw?.tenants && typeof raw.tenants === "object"
    ? {
        name: typeof raw.tenants.name === "string" ? raw.tenants.name : "N/A",
        subdomain: typeof raw.tenants.subdomain === "string" ? raw.tenants.subdomain : "",
      }
    : null;

  return {
    id: typeof raw?.id === "string" ? raw.id : "",
    shop_name: typeof raw?.shop_name === "string" ? raw.shop_name : null,
    email: typeof raw?.email === "string" ? raw.email : null,
    tenant_id: typeof raw?.tenant_id === "string" ? raw.tenant_id : null,
    status: typeof raw?.status === "string" ? raw.status : "pending",
    created_at: typeof raw?.created_at === "string" ? raw.created_at : new Date().toISOString(),
    tenants: tenant,
    domains,
    primaryDomain:
      typeof raw?.primaryDomain === "string" && raw.primaryDomain.length > 0
        ? raw.primaryDomain
        : (tenant?.subdomain || "-"),
    roles,
    is_self: Boolean(raw?.is_self),
    is_last_super_admin: Boolean(raw?.is_last_super_admin),
    is_last_tenant_admin: Boolean(raw?.is_last_tenant_admin),
  };
};

const parseDeleteError = async (error: unknown): Promise<ParsedDeleteError> => {
  const fallback: ParsedDeleteError = {
    code: "delete_user_failed",
    message: "Failed to delete user",
  };

  if (!error || typeof error !== "object") {
    return fallback;
  }

  const errorObj = error as { message?: string; context?: Response };

  if (errorObj.context) {
    try {
      const payload = await errorObj.context.clone().json();
      return {
        code: payload?.code || fallback.code,
        message: payload?.error || fallback.message,
      };
    } catch {
      return {
        ...fallback,
        message: errorObj.message || fallback.message,
      };
    }
  }

  return {
    ...fallback,
    message: errorObj.message || fallback.message,
  };
};

const deleteErrorToastMessage: Record<string, string> = {
  cannot_delete_self: "You cannot delete your own account.",
  last_super_admin_protected: "Cannot delete the last remaining super admin.",
  last_tenant_admin_protected: "Cannot delete the last active tenant admin/shop owner.",
  hard_delete_confirmation_required: "Delete confirmation was not provided.",
  user_not_found: "User not found.",
};

const UsersTab = () => {
  const queryClient = useQueryClient();
  const [selectedTenant, setSelectedTenant] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [deleteCandidate, setDeleteCandidate] = useState<PlatformUser | null>(null);

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

      const rawUsers = Array.isArray(data?.users) ? data.users : [];
      return rawUsers.map(normalizePlatformUser);
    },
  });

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

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { data, error } = await supabase.functions.invoke("admin-users", {
        body: {
          action: "delete",
          userId,
          confirmHardDelete: true,
        },
      });

      if (error) {
        const parsed = await parseDeleteError(error);
        const enrichedError = new Error(parsed.message) as Error & { code?: string };
        enrichedError.code = parsed.code;
        throw enrichedError;
      }

      if (!data?.success) {
        const enrichedError = new Error("Delete failed") as Error & { code?: string };
        enrichedError.code = "delete_user_failed";
        throw enrichedError;
      }
    },
    onSuccess: () => {
      setDeleteCandidate(null);
      queryClient.invalidateQueries({ queryKey: ["platform-users"] });
      toast.success("User deleted permanently.");
    },
    onError: (error) => {
      const typedError = error as Error & { code?: string };
      const code = typedError.code ?? "delete_user_failed";
      toast.error(deleteErrorToastMessage[code] || typedError.message || "Failed to delete user");
    },
  });

  const getDeleteBlockReason = (user: PlatformUser) => {
    if (user.is_self) return "Current signed-in account cannot be deleted.";
    if (user.is_last_super_admin) return "Last super admin is protected from deletion.";
    if (user.is_last_tenant_admin) return "Last active tenant admin/shop owner is protected.";
    return null;
  };

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
          Approve, suspend, or permanently delete users across all tenants
        </CardDescription>
      </CardHeader>
      <CardContent>
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
                  <TableHead>Roles</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  users?.map((user) => {
                    const deleteBlockReason = getDeleteBlockReason(user);
                    const userDomains = Array.isArray(user.domains) ? user.domains : [];
                    const userRoles = Array.isArray(user.roles) ? user.roles : [];

                    return (
                      <TableRow key={user.id} className={user.status === "pending" ? "bg-accent/50" : ""}>
                        <TableCell className="font-medium">{user.shop_name || "-"}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{user.email || "N/A"}</TableCell>
                        <TableCell>{user.tenants?.name || "N/A"}</TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <span className="font-medium text-sm">{user.primaryDomain}</span>
                            {userDomains.length > 1 && (
                              <span className="text-xs text-muted-foreground">
                                +{userDomains.length - 1} more
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {userRoles.length === 0 ? (
                              <Badge variant="outline">No role</Badge>
                            ) : (
                              userRoles.map((role) => (
                                <Badge key={`${user.id}-${role}`} variant="outline">
                                  {role}
                                </Badge>
                              ))
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(user.status)}</TableCell>
                        <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
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
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-destructive border-destructive/40 hover:bg-destructive/10"
                              onClick={() => setDeleteCandidate(user)}
                              disabled={Boolean(deleteBlockReason) || deleteUserMutation.isPending}
                              title={deleteBlockReason || "Permanently delete user"}
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                          {deleteBlockReason && (
                            <p className="text-xs text-muted-foreground mt-1">{deleteBlockReason}</p>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        )}

        <AlertDialog
          open={Boolean(deleteCandidate)}
          onOpenChange={(open) => {
            if (!open) {
              setDeleteCandidate(null);
            }
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Hard delete user?</AlertDialogTitle>
              <AlertDialogDescription>
                This action permanently removes the user account from Supabase Auth and cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>

            {deleteCandidate && (
              <div className="text-sm space-y-1">
                <p>
                  <span className="font-medium">Email:</span> {deleteCandidate.email || "N/A"}
                </p>
                <p>
                  <span className="font-medium">Tenant:</span> {deleteCandidate.tenants?.name || "N/A"}
                </p>
                <p>
                  <span className="font-medium">Roles:</span>{" "}
                  {Array.isArray(deleteCandidate.roles) && deleteCandidate.roles.length > 0
                    ? deleteCandidate.roles.join(", ")
                    : "No role"}
                </p>
              </div>
            )}

            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleteUserMutation.isPending}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={deleteUserMutation.isPending || !deleteCandidate}
                onClick={(event) => {
                  event.preventDefault();
                  if (!deleteCandidate) return;
                  deleteUserMutation.mutate(deleteCandidate.id);
                }}
              >
                {deleteUserMutation.isPending ? "Deleting..." : "Confirm hard delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
};

export default UsersTab;
