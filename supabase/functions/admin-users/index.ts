import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
  "Access-Control-Max-Age": "86400",
};

type AdminUsersBody = {
  action?: string;
  email?: string;
  password?: string;
  shopName?: string;
  userId?: string;
  role?: string;
  tenantId?: string;
  tenantIdFilter?: string | null;
  statusFilter?: string | null;
  newStatus?: string | null;
  confirmHardDelete?: boolean;
};

type RoleRecord = {
  user_id: string;
  role: string;
};

type ProfileRecord = {
  id: string;
  shop_name: string | null;
  email: string | null;
  tenant_id: string | null;
  status: string;
  created_at: string;
  tenants: {
    name: string;
    subdomain: string;
  } | null;
};

const jsonResponse = (payload: unknown, status = 200) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const errorResponse = (status: number, code: string, message: string, details?: unknown) =>
  jsonResponse(
    {
      error: message,
      code,
      details: details ?? null,
    },
    status,
  );

const toRoleMap = (roles: RoleRecord[]) => {
  const roleMap = new Map<string, string[]>();

  roles.forEach((row) => {
    const currentRoles = roleMap.get(row.user_id) ?? [];
    roleMap.set(row.user_id, [...currentRoles, row.role]);
  });

  return roleMap;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return errorResponse(401, "missing_authorization_header", "No authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      return errorResponse(401, "unauthorized", "Unauthorized");
    }

    const { data: superAdminRole, error: superAdminRoleError } = await supabaseClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "super_admin")
      .maybeSingle();

    if (superAdminRoleError && superAdminRoleError.code !== "PGRST116") {
      console.error("Error verifying super_admin role:", superAdminRoleError);
      return errorResponse(500, "super_admin_role_check_failed", "Failed to verify access");
    }

    if (!superAdminRole) {
      return errorResponse(
        403,
        "super_admin_required",
        "Access denied. Only super admins can manage users.",
      );
    }

    const body = await req.json().catch(() => ({}));
    const {
      action = "list",
      email,
      password,
      shopName,
      userId,
      role,
      tenantId,
      tenantIdFilter,
      statusFilter,
      newStatus,
      confirmHardDelete,
    } = body as AdminUsersBody;

    if (action === "list") {
      let profilesQuery = supabaseClient
        .from("profiles")
        .select(
          `
          id,
          shop_name,
          email,
          tenant_id,
          status,
          created_at,
          tenants (
            name,
            subdomain
          )
        `,
        )
        .order("created_at", { ascending: false });

      if (tenantIdFilter) {
        profilesQuery = profilesQuery.eq("tenant_id", tenantIdFilter);
      }

      if (statusFilter) {
        profilesQuery = profilesQuery.eq("status", statusFilter);
      }

      const { data: profilesData, error: profilesError } = await profilesQuery;

      if (profilesError) {
        console.error("Error fetching profiles in admin-users function:", profilesError);
        return errorResponse(500, "profiles_query_failed", profilesError.message);
      }

      const { data: domainsData, error: domainsError } = await supabaseClient
        .from("tenant_domains")
        .select("tenant_id, domain, is_primary");

      if (domainsError) {
        console.error("Error fetching tenant domains in admin-users function:", domainsError);
        return errorResponse(500, "domains_query_failed", domainsError.message);
      }

      const { data: rolesData, error: rolesError } = await supabaseClient
        .from("user_roles")
        .select("user_id, role");

      if (rolesError) {
        console.error("Error fetching user roles in admin-users function:", rolesError);
        return errorResponse(500, "roles_query_failed", rolesError.message);
      }

      const roleMap = toRoleMap((rolesData ?? []) as RoleRecord[]);
      const superAdminCount = new Set(
        (rolesData ?? [])
          .filter((row: any) => row.role === "super_admin")
          .map((row: any) => row.user_id),
      ).size;

      const tenantAdminCounts = new Map<string, Set<string>>();
      (profilesData ?? []).forEach((profile: any) => {
        const rolesForUser = roleMap.get(profile.id) ?? [];
        const isTenantAdminRole = rolesForUser.some((r) => r === "admin" || r === "shop_owner");

        if (!profile.tenant_id || profile.status !== "active" || !isTenantAdminRole) {
          return;
        }

        const existing = tenantAdminCounts.get(profile.tenant_id) ?? new Set<string>();
        existing.add(profile.id);
        tenantAdminCounts.set(profile.tenant_id, existing);
      });

      const usersWithDomains = ((profilesData ?? []) as ProfileRecord[]).map((profile) => {
        const tenantDomains = (domainsData || []).filter((d: any) => d.tenant_id === profile.tenant_id);
        const primaryDomain = tenantDomains.find((d: any) => d.is_primary);
        const allDomains = tenantDomains.map((d: any) => d.domain);
        const roles = roleMap.get(profile.id) ?? [];
        const hasSuperAdminRole = roles.includes("super_admin");
        const isTenantAdminRole = roles.some((r) => r === "admin" || r === "shop_owner");
        const tenantAdminCount = profile.tenant_id
          ? (tenantAdminCounts.get(profile.tenant_id)?.size ?? 0)
          : 0;

        return {
          ...profile,
          roles,
          domains: allDomains,
          primaryDomain: primaryDomain?.domain || profile.tenants?.subdomain,
          is_self: profile.id === user.id,
          is_last_super_admin: hasSuperAdminRole && superAdminCount <= 1,
          is_last_tenant_admin:
            profile.status === "active" &&
            isTenantAdminRole &&
            Boolean(profile.tenant_id) &&
            tenantAdminCount <= 1,
        };
      });

      return jsonResponse({ users: usersWithDomains });
    }

    if (action === "create") {
      const { data: newUser, error: signUpError } = await supabaseClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { shop_name: shopName },
      });

      if (signUpError) {
        console.error("Error creating user:", signUpError);
        return errorResponse(400, "create_user_failed", signUpError.message);
      }

      const { error: profileError } = await supabaseClient
        .from("profiles")
        .update({ tenant_id: tenantId })
        .eq("id", newUser.user.id);

      if (profileError) {
        console.error("Error updating profile with tenant_id:", profileError);
      }

      const { error: roleError } = await supabaseClient
        .from("user_roles")
        .insert({
          user_id: newUser.user.id,
          role: role || "shop_owner",
        });

      if (roleError) {
        console.error("Error assigning role:", roleError);
        await supabaseClient.auth.admin.deleteUser(newUser.user.id);
        return errorResponse(500, "assign_role_failed", "Failed to assign role");
      }

      return jsonResponse({ user: newUser.user });
    }

    if (action === "delete") {
      if (!userId) {
        return errorResponse(400, "missing_user_id", "userId is required for delete action");
      }

      if (!confirmHardDelete) {
        return errorResponse(
          400,
          "hard_delete_confirmation_required",
          "confirmHardDelete must be true to permanently delete a user",
        );
      }

      if (userId === user.id) {
        return errorResponse(403, "cannot_delete_self", "You cannot delete your own account");
      }

      const { data: targetProfile, error: targetProfileError } = await supabaseClient
        .from("profiles")
        .select("id, email, shop_name, tenant_id, status")
        .eq("id", userId)
        .maybeSingle();

      if (targetProfileError && targetProfileError.code !== "PGRST116") {
        console.error("Error loading target profile for deletion:", targetProfileError);
        return errorResponse(500, "target_profile_query_failed", targetProfileError.message);
      }

      if (!targetProfile) {
        return errorResponse(404, "user_not_found", "Target user was not found");
      }

      const { data: targetRolesData, error: targetRolesError } = await supabaseClient
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);

      if (targetRolesError) {
        console.error("Error loading target roles for deletion:", targetRolesError);
        return errorResponse(500, "target_roles_query_failed", targetRolesError.message);
      }

      const targetRoles = (targetRolesData ?? []).map((row: any) => row.role as string);
      const hasSuperAdminRole = targetRoles.includes("super_admin");
      const hasTenantAdminRole = targetRoles.some((r) => r === "admin" || r === "shop_owner");

      if (hasSuperAdminRole) {
        const { data: superAdminRoles, error: superAdminCountError } = await supabaseClient
          .from("user_roles")
          .select("user_id")
          .eq("role", "super_admin");

        if (superAdminCountError) {
          console.error("Error checking super admin count:", superAdminCountError);
          return errorResponse(500, "super_admin_count_query_failed", superAdminCountError.message);
        }

        const superAdminCount = new Set((superAdminRoles ?? []).map((row: any) => row.user_id)).size;
        if (superAdminCount <= 1) {
          return errorResponse(
            403,
            "last_super_admin_protected",
            "Cannot delete the last remaining super admin",
          );
        }
      }

      if (targetProfile.tenant_id && targetProfile.status === "active" && hasTenantAdminRole) {
        const { data: activeTenantAdmins, error: activeTenantAdminsError } = await supabaseClient
          .from("profiles")
          .select("id, user_roles!inner(role)")
          .eq("tenant_id", targetProfile.tenant_id)
          .eq("status", "active")
          .in("user_roles.role", ["admin", "shop_owner"]);

        if (activeTenantAdminsError) {
          console.error("Error checking tenant admin count:", activeTenantAdminsError);
          return errorResponse(
            500,
            "tenant_admin_count_query_failed",
            activeTenantAdminsError.message,
          );
        }

        const tenantAdminCount = new Set((activeTenantAdmins ?? []).map((row: any) => row.id)).size;
        if (tenantAdminCount <= 1) {
          return errorResponse(
            403,
            "last_tenant_admin_protected",
            "Cannot delete the last active tenant admin/shop owner",
          );
        }
      }

      const { error: deleteError } = await supabaseClient.auth.admin.deleteUser(userId);

      if (deleteError) {
        console.error("Error deleting user:", deleteError);
        return errorResponse(400, "delete_user_failed", deleteError.message);
      }

      const { error: auditError } = await supabaseClient.from("audit_logs").insert({
        user_id: user.id,
        action: "USER_HARD_DELETE",
        table_name: "profiles",
        record_id: userId,
        old_data: {
          user_id: targetProfile.id,
          email: targetProfile.email,
          shop_name: targetProfile.shop_name,
          tenant_id: targetProfile.tenant_id,
          status: targetProfile.status,
          roles: targetRoles,
        },
        new_data: null,
      });

      if (auditError) {
        console.error("Failed to write deletion audit log:", auditError);
      }

      return jsonResponse({ success: true, userId });
    }

    if (action === "update-status") {
      if (!userId || !newStatus) {
        return errorResponse(
          400,
          "missing_status_update_params",
          "userId and newStatus are required for update-status action",
        );
      }

      const { error: statusError } = await supabaseClient
        .from("profiles")
        .update({ status: newStatus })
        .eq("id", userId);

      if (statusError) {
        console.error("Error updating user status in admin-users function:", statusError);
        return errorResponse(500, "update_status_failed", statusError.message);
      }

      return jsonResponse({ success: true });
    }

    return errorResponse(400, "invalid_action", "Invalid action");
  } catch (error) {
    console.error("Error in admin-users function:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return errorResponse(500, "admin_users_unhandled_error", errorMessage);
  }
});
