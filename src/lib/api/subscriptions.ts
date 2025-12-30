import { supabase } from '@/integrations/supabase/client';

export interface SubscriptionPlan {
  id: string;
  plan_type: 'basic' | 'silver' | 'gold';
  name: string;
  price: number;
  currency: string;
  period: string;
  description: string;
  is_popular: boolean;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
  features?: SubscriptionFeature[];
}

export interface SubscriptionFeature {
  id: string;
  plan_id: string;
  feature_text: string;
  is_included: boolean;
  display_order: number;
  created_at: string;
}

export interface CreateSubscriptionPlanInput {
  plan_type: 'basic' | 'silver' | 'gold';
  name: string;
  price: number;
  currency?: string;
  period?: string;
  description: string;
  is_popular?: boolean;
  is_active?: boolean;
  display_order?: number;
}

export interface UpdateSubscriptionPlanInput {
  name?: string;
  price?: number;
  currency?: string;
  period?: string;
  description?: string;
  is_popular?: boolean;
  is_active?: boolean;
  display_order?: number;
}

/**
 * Fetch all active subscription plans (public access)
 * Used on the home page to display available plans
 */
export async function getActiveSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  const { data, error } = await supabase
    .from('subscription_plans')
    .select(`
      *,
      features:subscription_features(*)
    `)
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (error) throw error;
  return data as SubscriptionPlan[];
}

/**
 * Fetch all subscription plans (admin only)
 * Used in admin dashboard to manage all plans
 */
export async function getAllSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  const { data, error } = await supabase
    .from('subscription_plans')
    .select(`
      *,
      features:subscription_features(*)
    `)
    .order('display_order', { ascending: true });

  if (error) throw error;
  return data as SubscriptionPlan[];
}

/**
 * Get a single subscription plan by ID
 */
export async function getSubscriptionPlanById(id: string): Promise<SubscriptionPlan> {
  const { data, error } = await supabase
    .from('subscription_plans')
    .select(`
      *,
      features:subscription_features(*)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as SubscriptionPlan;
}

/**
 * Create a new subscription plan (admin only)
 */
export async function createSubscriptionPlan(
  plan: CreateSubscriptionPlanInput
): Promise<SubscriptionPlan> {
  const { data, error } = await supabase
    .from('subscription_plans')
    .insert(plan)
    .select()
    .single();

  if (error) throw error;
  return data as SubscriptionPlan;
}

/**
 * Update an existing subscription plan (admin only)
 */
export async function updateSubscriptionPlan(
  id: string,
  updates: UpdateSubscriptionPlanInput
): Promise<SubscriptionPlan> {
  const { data, error } = await supabase
    .from('subscription_plans')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as SubscriptionPlan;
}

/**
 * Delete a subscription plan (admin only)
 */
export async function deleteSubscriptionPlan(id: string): Promise<void> {
  const { error } = await supabase
    .from('subscription_plans')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

/**
 * Add features to a subscription plan (admin only)
 */
export async function addSubscriptionFeature(
  plan_id: string,
  feature_text: string,
  is_included: boolean = true,
  display_order?: number
): Promise<SubscriptionFeature> {
  const { data, error } = await supabase
    .from('subscription_features')
    .insert({
      plan_id,
      feature_text,
      is_included,
      display_order,
    })
    .select()
    .single();

  if (error) throw error;
  return data as SubscriptionFeature;
}

/**
 * Update a subscription feature (admin only)
 */
export async function updateSubscriptionFeature(
  id: string,
  updates: Partial<SubscriptionFeature>
): Promise<SubscriptionFeature> {
  const { data, error } = await supabase
    .from('subscription_features')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as SubscriptionFeature;
}

/**
 * Delete a subscription feature (admin only)
 */
export async function deleteSubscriptionFeature(id: string): Promise<void> {
  const { error } = await supabase
    .from('subscription_features')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

/**
 * Reorder subscription features for a plan (admin only)
 */
export async function reorderSubscriptionFeatures(
  features: Array<{ id: string; display_order: number }>
): Promise<void> {
  const updates = features.map(({ id, display_order }) =>
    supabase
      .from('subscription_features')
      .update({ display_order })
      .eq('id', id)
  );

  await Promise.all(updates);
}
