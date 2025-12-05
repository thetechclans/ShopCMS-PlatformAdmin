import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/contexts/TenantContext";

interface CarouselSlide {
  id: string;
  image_url: string;
  title: string | null;
  subtitle: string | null;
  cta_label: string | null;
  cta_link: string | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
}

const fetchCarouselSlides = async (tenantId: string): Promise<CarouselSlide[]> => {
  const { data, error } = await supabase
    .from("carousel_slides")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  if (error) throw error;
  return data || [];
};

const fetchCategories = async (tenantId: string): Promise<Category[]> => {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("is_published", true)
    .order("display_order", { ascending: true });

  if (error) throw error;
  return data || [];
};

export const useHomePageData = () => {
  const { tenant } = useTenant();
  
  const slidesQuery = useQuery({
    queryKey: ["carousel-slides", tenant?.id],
    queryFn: () => {
      if (!tenant?.id) throw new Error("Tenant required");
      return fetchCarouselSlides(tenant.id);
    },
    enabled: !!tenant?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const categoriesQuery = useQuery({
    queryKey: ["published-categories", tenant?.id],
    queryFn: () => {
      if (!tenant?.id) throw new Error("Tenant required");
      return fetchCategories(tenant.id);
    },
    enabled: !!tenant?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    slides: slidesQuery.data || [],
    categories: categoriesQuery.data || [],
    isLoading: slidesQuery.isLoading || categoriesQuery.isLoading,
    isError: slidesQuery.isError || categoriesQuery.isError,
    error: slidesQuery.error || categoriesQuery.error,
  };
};
