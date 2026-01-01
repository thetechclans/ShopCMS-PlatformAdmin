import { supabase } from '@/integrations/supabase/client';

export interface TenantRequest {
  id: string;
  requested_plan_id: string;
  business_name: string;
  subdomain: string;
  contact_name: string;
  contact_email: string;
  contact_phone?: string;
  business_description?: string;
  message?: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  reviewed_by?: string;
  reviewed_at?: string;
  rejection_reason?: string;
  tenant_id?: string;
  created_at: string;
  updated_at: string;
  subscription_plan?: {
    id: string;
    name: string;
    price: number;
    currency: string;
    plan_type: string;
  };
}

export interface TenantRequestFormData {
  requested_plan_id: string;
  business_name: string;
  subdomain: string;
  contact_name: string;
  contact_email: string;
  contact_phone?: string;
  business_description?: string;
  message?: string;
}

/**
 * Submit a new tenant request (anonymous/public access)
 * Used by customers on the home page to request a new tenant
 */
export async function submitTenantRequest(
  formData: TenantRequestFormData
): Promise<TenantRequest> {
  const { data, error } = await supabase
    .from('tenant_requests')
    .insert(formData)
    .select()
    .single();

  if (error) throw error;
  return data as TenantRequest;
}

/**
 * Check if a subdomain is available
 */
export async function checkSubdomainAvailability(subdomain: string): Promise<boolean> {
  // Check in tenants table
  const { data: existingTenant, error: tenantError } = await supabase
    .from('tenants')
    .select('subdomain')
    .eq('subdomain', subdomain)
    .maybeSingle();

  if (tenantError) {
    console.error('Error checking tenant subdomain:', tenantError);
  }
  
  if (existingTenant) return false;

  // Check in pending/approved tenant requests
  const { data: existingRequest, error: requestError } = await supabase
    .from('tenant_requests')
    .select('subdomain')
    .eq('subdomain', subdomain)
    .in('status', ['pending', 'approved'])
    .maybeSingle();

  if (requestError) {
    console.error('Error checking request subdomain:', requestError);
  }

  if (existingRequest) return false;

  return true;
}

/**
 * Get all tenant requests (admin only)
 * Optionally filter by status
 */
export async function getTenantRequests(status?: string): Promise<TenantRequest[]> {
  let query = supabase
    .from('tenant_requests')
    .select(`
      *,
      subscription_plan:subscription_plans!requested_plan_id(
        id,
        name,
        price,
        currency,
        plan_type
      )
    `)
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as TenantRequest[];
}

/**
 * Get a single tenant request by ID (admin only)
 */
export async function getTenantRequestById(id: string): Promise<TenantRequest> {
  const { data, error } = await supabase
    .from('tenant_requests')
    .select(`
      *,
      subscription_plan:subscription_plans!requested_plan_id(
        id,
        name,
        price,
        currency,
        plan_type
      )
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as TenantRequest;
}

/**
 * Create tenant from approved request (admin only)
 * This function will create a new tenant, set up tenant_limits,
 * and update the request status to 'completed'
 */
export async function createTenantFromRequest(requestId: string): Promise<string> {
  // Get the request details
  const request = await getTenantRequestById(requestId);

  if (request.status !== 'approved') {
    throw new Error('Request must be approved before creating tenant');
  }

  // Create the tenant
  const { data: tenant, error: tenantError } = await supabase
    .from('tenants')
    .insert({
      name: request.business_name,
      slug: request.subdomain,
      subdomain: request.subdomain,
      status: 'active',
    })
    .select()
    .single();

  if (tenantError) throw tenantError;

  // Create tenant limits based on the selected plan
  const { error: limitsError } = await supabase
    .from('tenant_limits')
    .insert({
      tenant_id: tenant.id,
      plan_type: request.subscription_plan?.plan_type || 'basic',
    });

  if (limitsError) throw limitsError;

  // Update the request to mark it as completed
  const { error: updateError } = await supabase
    .from('tenant_requests')
    .update({
      status: 'completed',
      tenant_id: tenant.id,
    })
    .eq('id', requestId);

  if (updateError) throw updateError;

  return tenant.id;
}

/**
 * Approve a tenant request and automatically create the tenant
 * (admin only)
 */
export async function approveTenantRequest(
  requestId: string,
  userId: string
): Promise<{ request: TenantRequest; tenantId: string }> {
  // First, mark the request as approved
  const { data, error } = await supabase
    .from('tenant_requests')
    .update({
      status: 'approved',
      reviewed_by: userId,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', requestId)
    .select()
    .single();

  if (error) throw error;

  // Automatically create the tenant from the approved request
  const tenantId = await createTenantFromRequest(requestId);

  return { request: data as TenantRequest, tenantId };
}

/**
 * Reject a tenant request (admin only)
 */
export async function rejectTenantRequest(
  requestId: string,
  userId: string,
  reason: string
): Promise<TenantRequest> {
  const { data, error } = await supabase
    .from('tenant_requests')
    .update({
      status: 'rejected',
      reviewed_by: userId,
      reviewed_at: new Date().toISOString(),
      rejection_reason: reason,
    })
    .eq('id', requestId)
    .select()
    .single();

  if (error) throw error;
  return data as TenantRequest;
}

/**
 * Get tenant request statistics (admin dashboard)
 */
export async function getTenantRequestStats() {
  const { data, error } = await supabase
    .from('tenant_requests')
    .select('status');

  if (error) throw error;

  const stats = {
    total: data.length,
    pending: data.filter((r) => r.status === 'pending').length,
    approved: data.filter((r) => r.status === 'approved').length,
    rejected: data.filter((r) => r.status === 'rejected').length,
    completed: data.filter((r) => r.status === 'completed').length,
  };

  return stats;
}
