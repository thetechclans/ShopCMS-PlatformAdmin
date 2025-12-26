import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/contexts/TenantContext";
import {
  PLAN_DEFINITIONS,
  normalizePlanType,
  getAnalyticsLevel,
  planSupportsAnalytics,
  type PlanType,
} from "@/lib/plans";

interface PlanFeatures {
  planType: PlanType;
  canAccessThemes: boolean;
  canAccessAdvancedFeatures: boolean;
  hasAnalytics: boolean;
  analyticsLevel: "none" | "standard" | "advanced";
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
    staleTime: 10 * 60 * 1000,
  });

  const planType = normalizePlanType(tenantLimits?.plan_type);
  const planDefinition = PLAN_DEFINITIONS[planType];

  const features: PlanFeatures = {
    planType,
    canAccessThemes: planDefinition.features.canAccessThemes,
    canAccessAdvancedFeatures: planDefinition.features.canAccessAdvancedFeatures,
    hasAnalytics: planSupportsAnalytics(planType),
    analyticsLevel: getAnalyticsLevel(planType),
    maxProducts: tenantLimits?.max_products ?? planDefinition.defaultLimits.maxProducts,
    maxCategories: tenantLimits?.max_categories ?? planDefinition.defaultLimits.maxCategories,
    maxCarouselSlides: tenantLimits?.max_carousel_slides ?? planDefinition.defaultLimits.maxCarouselSlides,
    maxStaticPages: tenantLimits?.max_static_pages ?? planDefinition.defaultLimits.maxStaticPages,
    maxImageSizeMb:
      typeof tenantLimits?.max_image_size_mb === "number"
        ? Number(tenantLimits.max_image_size_mb)
        : planDefinition.defaultLimits.maxImageSizeMb,
  };

  return {
    features,
    isLoading,
  };
};
