import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/contexts/TenantContext";

interface PlanFeatures {
  canAccessThemes: boolean;
  canAccessAdvancedFeatures: boolean;
  planType: 'basic' | 'silver' | 'gold';
  maxProducts: number;
  maxCategories: number;
  maxCarouselSlides: number;
  maxStaticPages: number;
  maxImageSizeMb: number;
}

export const usePlanFeatures = () => {
  const { tenantId } = useTenant();

  const { data: tenantLimits, isLoading } = useQuery({
    queryKey: ["tenant-plan-features", tenantId],
    queryFn: async () => {
      if (!tenantId) return null;
      
      const { data, error } = await supabase
        .from("tenant_limits")
        .select("*")
        .eq("tenant_id", tenantId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!tenantId,
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  });

  const planType = (tenantLimits?.plan_type || 'basic') as 'basic' | 'silver' | 'gold';

  const features: PlanFeatures = {
    canAccessThemes: planType === 'gold',
    canAccessAdvancedFeatures: planType === 'silver' || planType === 'gold',
    planType,
    maxProducts: tenantLimits?.max_products || 10,
    maxCategories: tenantLimits?.max_categories || 5,
    maxCarouselSlides: tenantLimits?.max_carousel_slides || 3,
    maxStaticPages: tenantLimits?.max_static_pages || 5,
    maxImageSizeMb: Number(tenantLimits?.max_image_size_mb) || 2,
  };

  return {
    features,
    isLoading,
  };
};
