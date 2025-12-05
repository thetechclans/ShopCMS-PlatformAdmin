import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
  'Access-Control-Max-Age': '86400',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Get the user's token from the Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the user is authenticated
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user has super_admin role
    const { data: roles } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'super_admin')
      .single();

    if (!roles) {
      console.error('Access denied: User does not have super_admin role');
      return new Response(
        JSON.stringify({ error: 'Access denied. Only super admins can manage users.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json().catch(() => ({}));
    const {
      action = 'list',
      email,
      password,
      shopName,
      userId,
      role,
      tenantId,
      tenantIdFilter,
      statusFilter,
      newStatus,
    } = body as {
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
    };

    if (action === 'list') {
      // List all users for platform admin, with optional filters
      let profilesQuery = supabaseClient
        .from('profiles')
        .select(`
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
        `)
        .order('created_at', { ascending: false });

      if (tenantIdFilter) {
        profilesQuery = profilesQuery.eq('tenant_id', tenantIdFilter);
      }

      if (statusFilter) {
        profilesQuery = profilesQuery.eq('status', statusFilter);
      }

      const { data: profilesData, error: profilesError } = await profilesQuery;

      if (profilesError) {
        console.error('Error fetching profiles in admin-users function:', profilesError);
        return new Response(
          JSON.stringify({ error: profilesError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: domainsData, error: domainsError } = await supabaseClient
        .from('tenant_domains')
        .select('tenant_id, domain, is_primary');

      if (domainsError) {
        console.error('Error fetching tenant domains in admin-users function:', domainsError);
        return new Response(
          JSON.stringify({ error: domainsError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const usersWithDomains = (profilesData || []).map((profile: any) => {
        const tenantDomains = (domainsData || []).filter((d: any) => d.tenant_id === profile.tenant_id);
        const primaryDomain = tenantDomains.find((d: any) => d.is_primary);
        const allDomains = tenantDomains.map((d: any) => d.domain);

        return {
          ...profile,
          domains: allDomains,
          primaryDomain: primaryDomain?.domain || profile.tenants?.subdomain,
        };
      });

      return new Response(
        JSON.stringify({ users: usersWithDomains }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'create') {
      // Create new user
      const { data: newUser, error: signUpError } = await supabaseClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { shop_name: shopName }
      });

      if (signUpError) {
        console.error('Error creating user:', signUpError);
        return new Response(
          JSON.stringify({ error: signUpError.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Create profile with tenant_id
      const { error: profileError } = await supabaseClient
        .from('profiles')
        .update({ tenant_id: tenantId })
        .eq('id', newUser.user.id);

      if (profileError) {
        console.error('Error updating profile with tenant_id:', profileError);
      }

      // Assign role to new user
      const { error: roleError } = await supabaseClient
        .from('user_roles')
        .insert({
          user_id: newUser.user.id,
          role: role || 'shop_owner'
        });

      if (roleError) {
        console.error('Error assigning role:', roleError);
        // Clean up: delete the user if role assignment fails
        await supabaseClient.auth.admin.deleteUser(newUser.user.id);
        return new Response(
          JSON.stringify({ error: 'Failed to assign role' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('User created successfully:', newUser.user.id);
      return new Response(
        JSON.stringify({ user: newUser.user }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'delete') {
      if (!userId) {
        return new Response(
          JSON.stringify({ error: 'userId is required for delete action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Delete user and their roles (cascade will handle roles table)
      const { error: deleteError } = await supabaseClient.auth.admin.deleteUser(userId);

      if (deleteError) {
        console.error('Error deleting user:', deleteError);
        return new Response(
          JSON.stringify({ error: deleteError.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('User deleted successfully:', userId);
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'update-status') {
      if (!userId || !newStatus) {
        return new Response(
          JSON.stringify({ error: 'userId and newStatus are required for update-status action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { error: statusError } = await supabaseClient
        .from('profiles')
        .update({ status: newStatus })
        .eq('id', userId);

      if (statusError) {
        console.error('Error updating user status in admin-users function:', statusError);
        return new Response(
          JSON.stringify({ error: statusError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('User status updated successfully:', { userId, status: newStatus });
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in admin-users function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
