import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Crown, Check } from "lucide-react";
import { useTenant } from "@/contexts/TenantContext";

export const ThemeSelector = () => {
  const { tenantId } = useTenant();
  const queryClient = useQueryClient();

  // Fetch available themes for Gold tier
  const { data: themes = [], isLoading } = useQuery({
    queryKey: ["gold-themes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("themes")
        .select("*")
        .eq("plan_tier_required", "gold")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      return data;
    },
  });

  // Fetch current profile theme selection
  const { data: profile } = useQuery({
    queryKey: ["profile-theme", tenantId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("theme_id")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  // Mutation to update theme
  const updateThemeMutation = useMutation({
    mutationFn: async (themeId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("profiles")
        .update({ theme_id: themeId })
        .eq("id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile-theme"] });
      toast.success("Theme updated successfully!");
    },
    onError: (error) => {
      toast.error("Failed to update theme: " + error.message);
    },
  });

  const handleThemeSelect = (themeId: string) => {
    updateThemeMutation.mutate(themeId);
  };

  if (isLoading) {
    return <div>Loading themes...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Crown className="w-5 h-5 text-amber-500" />
        <h3 className="text-lg font-semibold">Premium Themes</h3>
        <Badge variant="secondary" className="bg-amber-500/10 text-amber-700 border-amber-500/20">
          Gold Tier Exclusive
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {themes.map((theme) => {
          const isSelected = profile?.theme_id === theme.id;
          
          return (
            <Card 
              key={theme.id} 
              className={`cursor-pointer transition-all hover:shadow-lg ${
                isSelected ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => handleThemeSelect(theme.id)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{theme.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {theme.description}
                    </CardDescription>
                  </div>
                  {isSelected && (
                    <Check className="w-5 h-5 text-primary" />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {theme.preview_image_url && (
                  <img
                    src={theme.preview_image_url}
                    alt={theme.name}
                    className="w-full h-32 object-cover rounded-md"
                  />
                )}
                <Button
                  variant={isSelected ? "default" : "outline"}
                  className="w-full mt-4"
                  disabled={updateThemeMutation.isPending}
                >
                  {isSelected ? "Current Theme" : "Select Theme"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
