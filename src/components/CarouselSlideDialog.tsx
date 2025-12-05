import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ImageUpload } from "./ImageUpload";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { urlSchema } from "@/lib/validationSchemas";
import { useTenant } from "@/contexts/TenantContext";

interface CarouselSlide {
  id: string;
  image_url: string;
  title: string | null;
  subtitle: string | null;
  cta_label: string | null;
  cta_link: string | null;
  display_order: number;
  is_active: boolean;
}

interface CarouselSlideDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slide?: CarouselSlide | null;
  onSave: () => void;
}

export const CarouselSlideDialog = ({ open, onOpenChange, slide, onSave }: CarouselSlideDialogProps) => {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [subtitle, setSubtitle] = useState<string>("");
  const [ctaLabel, setCtaLabel] = useState<string>("");
  const [ctaLink, setCtaLink] = useState<string>("");
  const [isActive, setIsActive] = useState<boolean>(true);
  const [displayOrder, setDisplayOrder] = useState<number>(0);
  const [saving, setSaving] = useState(false);
  const { tenantId, isLoading: tenantLoading } = useTenant();

  useEffect(() => {
    if (slide) {
      setImageUrl(slide.image_url || "");
      setTitle(slide.title || "");
      setSubtitle(slide.subtitle || "");
      setCtaLabel(slide.cta_label || "");
      setCtaLink(slide.cta_link || "");
      setIsActive(slide.is_active);
      setDisplayOrder(slide.display_order);
    } else {
      setImageUrl("");
      setTitle("");
      setSubtitle("");
      setCtaLabel("");
      setCtaLink("");
      setIsActive(true);
      setDisplayOrder(0);
    }
  }, [slide, open]);

  const handleSave = async () => {
    if (!imageUrl) {
      toast.error("Please upload an image");
      return;
    }

    // Validate CTA link if provided
    if (ctaLink) {
      const validation = urlSchema.safeParse(ctaLink);
      if (!validation.success) {
        toast.error(validation.error.errors[0].message);
        return;
      }
    }

    setSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      if (!tenantId) throw new Error("Tenant not found");

      const slideData = {
        user_id: user.id,
        tenant_id: tenantId,
        image_url: imageUrl,
        title: title || null,
        subtitle: subtitle || null,
        cta_label: ctaLabel || null,
        cta_link: ctaLink || null,
        display_order: displayOrder,
        is_active: isActive,
      };

      if (slide) {
        const { error } = await supabase
          .from("carousel_slides")
          .update(slideData)
          .eq("id", slide.id);

        if (error) throw error;
        toast.success("Slide updated successfully");
      } else {
        const { error } = await supabase
          .from("carousel_slides")
          .insert(slideData);

        if (error) throw error;
        toast.success("Slide added successfully");
      }

      onSave();
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving slide:", error);
      toast.error("Failed to save slide");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{slide ? "Edit Slide" : "Add Slide"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <Label>Slide Image *</Label>
            <ImageUpload
              value={imageUrl}
              onChange={(url) => setImageUrl(url || "")}
              path="carousel-slides"
            />
          </div>

          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter slide title"
            />
          </div>

          <div>
            <Label htmlFor="subtitle">Subtitle</Label>
            <Textarea
              id="subtitle"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Enter slide subtitle or description"
              rows={3}
            />
          </div>

          <div className="space-y-4 border-t pt-4">
            <h4 className="font-medium">Call-to-Action Button (Optional)</h4>
            
            <div>
              <Label htmlFor="ctaLabel">Button Label</Label>
              <Input
                id="ctaLabel"
                value={ctaLabel}
                onChange={(e) => setCtaLabel(e.target.value)}
                placeholder="e.g., Shop Now"
              />
            </div>

            <div>
              <Label htmlFor="ctaLink">Button Link</Label>
              <Input
                id="ctaLink"
                value={ctaLink}
                onChange={(e) => setCtaLink(e.target.value)}
                placeholder="e.g., /products or https://example.com"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="displayOrder">Display Order</Label>
            <Input
              id="displayOrder"
              type="number"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
            <Label htmlFor="isActive">Active (visible on carousel)</Label>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Slide"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
