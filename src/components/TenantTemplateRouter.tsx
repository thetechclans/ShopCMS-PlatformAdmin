import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/contexts/TenantContext";
import { BasicTemplate } from "@/templates/BasicTemplate";
import { SilverTemplate } from "@/templates/SilverTemplate";
import { GoldTemplate } from "@/templates/GoldTemplate";
import { Skeleton } from "@/components/ui/skeleton";

interface TenantTemplateRouterProps {
  slides: any[];
  categories: any[];
  sections: any[];
  isLoading: boolean;
}

export const TenantTemplateRouter = ({
  slides,
  categories,
  sections,
  isLoading,
}: TenantTemplateRouterProps) => {
  const { tenantId } = useTenant();

  // Fetch tenant limits to get plan_type
  const { data: tenantLimits, isLoading: limitsLoading } = useQuery({
    queryKey: ["tenant-limits", tenantId],
    queryFn: async () => {
      if (!tenantId) return null;
      
      const { data, error } = await supabase
        .from("tenant_limits")
        .select("plan_type")
        .eq("tenant_id", tenantId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!tenantId,
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  });

  // Fetch profile to get selected theme_id for Gold tier
  const { data: profile } = useQuery({
    queryKey: ["profile-theme", tenantId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("theme_id")
        .eq("tenant_id", tenantId)
        .single();

      if (error) return null;
      return data;
    },
    enabled: !!tenantId && tenantLimits?.plan_type === 'gold',
  });

  // Fetch theme details if Gold tier has selected a theme
  const { data: theme } = useQuery({
    queryKey: ["theme", profile?.theme_id],
    queryFn: async () => {
      if (!profile?.theme_id) return null;

      const { data, error } = await supabase
        .from("themes")
        .select("*")
        .eq("id", profile.theme_id)
        .single();

      if (error) return null;
      return data;
    },
    enabled: !!profile?.theme_id,
  });

  if (limitsLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Skeleton className="h-16 w-full" />
        <div className="flex-1 container mx-auto px-4 py-8 space-y-8">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  const planType = tenantLimits?.plan_type || 'basic';

  // Route to appropriate template based on plan
  switch (planType) {
    case 'silver':
      return (
        <SilverTemplate
          slides={slides}
          categories={categories}
          sections={sections}
          isLoading={isLoading}
        />
      );
    
    case 'gold':
      // Determine theme variant for Gold tier
      const themeVariant = theme?.name?.toLowerCase().includes('dark') ? 'dark' : 'light';
      return (
        <GoldTemplate
          slides={slides}
          categories={categories}
          sections={sections}
          isLoading={isLoading}
          themeVariant={themeVariant}
        />
      );
    
    case 'basic':
    default:
      return (
        <BasicTemplate
          slides={slides}
          categories={categories}
          sections={sections}
          isLoading={isLoading}
        />
      );
  }
};
