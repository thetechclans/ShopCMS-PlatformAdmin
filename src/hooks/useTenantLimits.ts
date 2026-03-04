import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/contexts/TenantContext";

interface TenantLimits {
  max_products: number;
  max_categories: number;
  max_image_size_mb: number;
  max_carousel_slides: number;
  max_static_pages: number;
  plan_type: string;
  subscription_started_at: string;
  subscription_expires_at: string;
}

type LimitResource = "products" | "categories" | "carousel_slides" | "static_pages";

export function useTenantLimits() {
  const { tenant } = useTenant();

  const { data: limits, isLoading } = useQuery({
    queryKey: ["tenant-limits", tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return null;

      const { data, error } = await supabase
        .from("tenant_limits")
        .select("*")
        .eq("tenant_id", tenant.id)
        .single();

      if (error) throw error;
      return data as TenantLimits;
    },
    enabled: !!tenant?.id,
  });

  const checkLimit = async (resourceType: LimitResource, currentCount: number): Promise<boolean> => {
    if (!limits) return true; // Allow if limits not loaded yet

    const maxKey = `max_${resourceType}` as keyof TenantLimits;
    const maxLimit = limits[maxKey];

    if (typeof maxLimit === 'number' && currentCount >= maxLimit) {
      return false;
    }

    return true;
  };

  const checkImageSize = (fileSizeMB: number): boolean => {
    if (!limits) return true;
    return fileSizeMB <= limits.max_image_size_mb;
  };

  const isSubscriptionActive = !!limits?.subscription_expires_at
    && new Date(limits.subscription_expires_at).getTime() > Date.now();

  return {
    limits,
    isLoading,
    checkLimit,
    checkImageSize,
    isSubscriptionActive,
  };
}
