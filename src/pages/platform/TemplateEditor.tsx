import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Save, Palette, Layout } from "lucide-react";
import { TemplateHomePageDesigner } from "./TemplateHomePageDesigner";

interface TemplateEditorProps {
  planType: "basic" | "silver" | "gold";
}

interface TemplateConfig {
  id: string;
  plan_type: string;
  primary_color: string;
  secondary_color: string;
  background_color: string;
  text_color: string;
  accent_color: string;
  carousel_style: string;
  category_layout: string;
  heading_font: string;
  body_font: string;
}

export const TemplateEditor = ({ planType }: TemplateEditorProps) => {
  const queryClient = useQueryClient();

  const { data: config, isLoading } = useQuery({
    queryKey: ["template-config", planType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("plan_template_configs")
        .select("*")
        .eq("plan_type", planType)
        .single();

      if (error) throw error;
      return data as TemplateConfig;
    },
  });

  const [formData, setFormData] = useState<Partial<TemplateConfig>>({});

  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<TemplateConfig>) => {
      const { error } = await supabase
        .from("plan_template_configs")
        .update(updates)
        .eq("plan_type", planType);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["template-config", planType] });
      toast.success("Template configuration updated successfully");
      setFormData({});
    },
    onError: (error) => {
      toast.error(`Failed to update template: ${error.message}`);
    },
  });

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  const currentConfig = { ...config, ...formData };

  if (isLoading) {
    return <div>Loading template configuration...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold capitalize">{planType} Plan Template</h2>
        <p className="text-muted-foreground">
          Customize the default template for all {planType} tier tenants
        </p>
      </div>

      <Tabs defaultValue="colors" className="space-y-6">
        <TabsList>
          <TabsTrigger value="colors">
            <Palette className="h-4 w-4 mr-2" />
            Colors & Layout
          </TabsTrigger>
          <TabsTrigger value="homepage">
            <Layout className="h-4 w-4 mr-2" />
            Home Page Design
          </TabsTrigger>
        </TabsList>

        <TabsContent value="colors" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Color Configuration</CardTitle>
            <CardDescription>Set the default color scheme for this plan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="primary_color">Primary Color</Label>
              <div className="flex gap-2">
                <Input
                  id="primary_color"
                  value={currentConfig?.primary_color || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, primary_color: e.target.value })
                  }
                  placeholder="hsl(262, 83%, 58%)"
                />
                <Input
                  type="color"
                  value={currentConfig?.primary_color?.match(/hsl\((\d+)/)?.[1] ? `#${parseInt(currentConfig.primary_color.match(/hsl\((\d+)/)?.[1] || "0").toString(16)}` : "#8B5CF6"}
                  className="w-16"
                  onChange={(e) => {
                    const hex = e.target.value;
                    const r = parseInt(hex.slice(1, 3), 16);
                    const g = parseInt(hex.slice(3, 5), 16);
                    const b = parseInt(hex.slice(5, 7), 16);
                    const hsl = `hsl(${Math.round((Math.atan2(Math.sqrt(3) * (g - b), 2 * r - g - b) * 180) / Math.PI)}, 83%, 58%)`;
                    setFormData({ ...formData, primary_color: hsl });
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="secondary_color">Secondary Color</Label>
              <Input
                id="secondary_color"
                value={currentConfig?.secondary_color || ""}
                onChange={(e) =>
                  setFormData({ ...formData, secondary_color: e.target.value })
                }
                placeholder="hsl(316, 80%, 57%)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="background_color">Background Color</Label>
              <Input
                id="background_color"
                value={currentConfig?.background_color || ""}
                onChange={(e) =>
                  setFormData({ ...formData, background_color: e.target.value })
                }
                placeholder="hsl(0, 0%, 100%)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="text_color">Text Color</Label>
              <Input
                id="text_color"
                value={currentConfig?.text_color || ""}
                onChange={(e) =>
                  setFormData({ ...formData, text_color: e.target.value })
                }
                placeholder="hsl(220, 13%, 18%)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="accent_color">Accent Color</Label>
              <Input
                id="accent_color"
                value={currentConfig?.accent_color || ""}
                onChange={(e) =>
                  setFormData({ ...formData, accent_color: e.target.value })
                }
                placeholder="hsl(220, 13%, 95%)"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Layout Configuration</CardTitle>
            <CardDescription>Configure layout and typography defaults</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="carousel_style">Carousel Style</Label>
              <Select
                value={currentConfig?.carousel_style || "standard"}
                onValueChange={(value) =>
                  setFormData({ ...formData, carousel_style: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="fullwidth">Full Width</SelectItem>
                  <SelectItem value="contained">Contained</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category_layout">Category Layout</Label>
              <Select
                value={currentConfig?.category_layout || "grid"}
                onValueChange={(value) =>
                  setFormData({ ...formData, category_layout: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grid">Grid</SelectItem>
                  <SelectItem value="list">List</SelectItem>
                  <SelectItem value="carousel">Carousel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="heading_font">Heading Font</Label>
              <Input
                id="heading_font"
                value={currentConfig?.heading_font || ""}
                onChange={(e) =>
                  setFormData({ ...formData, heading_font: e.target.value })
                }
                placeholder="Inter"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="body_font">Body Font</Label>
              <Input
                id="body_font"
                value={currentConfig?.body_font || ""}
                onChange={(e) =>
                  setFormData({ ...formData, body_font: e.target.value })
                }
                placeholder="Inter"
              />
            </div>
          </CardContent>
        </Card>
          </div>

          <div className="flex justify-end gap-2">
        <Button
          onClick={handleSave}
          disabled={updateMutation.isPending || Object.keys(formData).length === 0}
        >
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
          </div>

          <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
          <CardDescription>Live preview of template with current settings</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className="p-8 rounded-lg border"
            style={{
              backgroundColor: currentConfig?.background_color,
              color: currentConfig?.text_color,
            }}
          >
            <h1
              className="text-4xl font-bold mb-4"
              style={{ fontFamily: currentConfig?.heading_font }}
            >
              Sample Heading
            </h1>
            <p
              className="mb-4"
              style={{ fontFamily: currentConfig?.body_font }}
            >
              This is sample body text showing how the configured fonts and colors will appear.
            </p>
            <div className="flex gap-2">
              <div
                className="h-12 w-12 rounded"
                style={{ backgroundColor: currentConfig?.primary_color }}
              />
              <div
                className="h-12 w-12 rounded"
                style={{ backgroundColor: currentConfig?.secondary_color }}
              />
              <div
                className="h-12 w-12 rounded"
                style={{ backgroundColor: currentConfig?.accent_color }}
              />
            </div>
          </div>
        </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="homepage">
          <TemplateHomePageDesigner 
            planType={planType}
            onSave={() => queryClient.invalidateQueries({ queryKey: ["template-config", planType] })}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
