import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Save } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { urlSchema } from "@/lib/validationSchemas";
import { useTenant } from "@/contexts/TenantContext";

interface FooterEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FooterConfig {
  id?: string;
  brand_name: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  working_hours: string;
  copyright_text: string;
}

interface SocialLink {
  id?: string;
  platform: string;
  url: string;
  display_order: number;
}

interface QuickLink {
  id?: string;
  label: string;
  url: string;
  display_order: number;
}

const SOCIAL_PLATFORMS = [
  "Instagram",
  "WhatsApp",
  "Facebook",
  "Twitter",
  "YouTube",
  "LinkedIn",
  "TikTok",
];

export const FooterEditor = ({ open, onOpenChange }: FooterEditorProps) => {
  const [config, setConfig] = useState<FooterConfig>({
    brand_name: "",
    tagline: "",
    address: "",
    phone: "",
    email: "",
    working_hours: "",
    copyright_text: "",
  });
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [quickLinks, setQuickLinks] = useState<QuickLink[]>([]);
  const [loading, setLoading] = useState(false);
  const { tenantId } = useTenant();

  useEffect(() => {
    if (open) {
      loadFooterData();
    }
  }, [open]);

  const loadFooterData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [configRes, socialRes, quickRes] = await Promise.all([
      supabase
        .from("footer_config")
        .select("*")
        .eq("user_id", user.id)
        .single(),
      supabase
        .from("social_links")
        .select("*")
        .eq("user_id", user.id)
        .order("display_order"),
      supabase
        .from("footer_quick_links")
        .select("*")
        .eq("user_id", user.id)
        .order("display_order"),
    ]);

    if (configRes.data) {
      setConfig(configRes.data);
    }
    if (socialRes.data) {
      setSocialLinks(socialRes.data);
    }
    if (quickRes.data) {
      setQuickLinks(quickRes.data);
    }
  };

  const handleSave = async (publish = false) => {
    // Validate social link URLs
    for (const link of socialLinks) {
      const validation = urlSchema.safeParse(link.url);
      if (!validation.success) {
        toast.error(`Invalid social link URL for ${link.platform}: ${validation.error.errors[0].message}`);
        return;
      }
    }

    // Validate quick link URLs
    for (const link of quickLinks) {
      const validation = urlSchema.safeParse(link.url);
      if (!validation.success) {
        toast.error(`Invalid quick link URL for "${link.label}": ${validation.error.errors[0].message}`);
        return;
      }
    }

    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      if (!tenantId) throw new Error("Tenant not found");

      // Save footer config
      const configData = {
        user_id: user.id,
        tenant_id: tenantId,
        ...config,
        is_published: publish,
      };

      if (config.id) {
        await supabase
          .from("footer_config")
          .update(configData)
          .eq("id", config.id);
      } else {
        const { data } = await supabase
          .from("footer_config")
          .insert(configData)
          .select()
          .single();
        if (data) setConfig(data);
      }

      // Delete existing social links and recreate
      await supabase.from("social_links").delete().eq("user_id", user.id);
      if (socialLinks.length > 0) {
        await supabase.from("social_links").insert(
          socialLinks.map((link, index) => ({
            user_id: user.id,
            tenant_id: tenantId,
            platform: link.platform,
            url: link.url,
            display_order: index,
            is_active: publish,
          }))
        );
      }

      // Delete existing quick links and recreate
      await supabase.from("footer_quick_links").delete().eq("user_id", user.id);
      if (quickLinks.length > 0) {
        await supabase.from("footer_quick_links").insert(
          quickLinks.map((link, index) => ({
            user_id: user.id,
            tenant_id: tenantId,
            label: link.label,
            url: link.url,
            display_order: index,
            is_active: publish,
          }))
        );
      }

      toast.success(publish ? "Footer published successfully!" : "Footer saved as draft");
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving footer:", error);
      toast.error("Failed to save footer");
    } finally {
      setLoading(false);
    }
  };

  const addSocialLink = () => {
    setSocialLinks([
      ...socialLinks,
      { platform: "Instagram", url: "", display_order: socialLinks.length },
    ]);
  };

  const removeSocialLink = (index: number) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== index));
  };

  const addQuickLink = () => {
    setQuickLinks([
      ...quickLinks,
      { label: "", url: "", display_order: quickLinks.length },
    ]);
  };

  const removeQuickLink = (index: number) => {
    setQuickLinks(quickLinks.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Footer</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Brand Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Brand Information</h3>
            <div className="grid gap-4">
              <div>
                <Label htmlFor="brand_name">Brand Name</Label>
                <Input
                  id="brand_name"
                  value={config.brand_name}
                  onChange={(e) =>
                    setConfig({ ...config, brand_name: e.target.value })
                  }
                  placeholder="Your Shop Name"
                />
              </div>
              <div>
                <Label htmlFor="tagline">Tagline</Label>
                <Input
                  id="tagline"
                  value={config.tagline}
                  onChange={(e) =>
                    setConfig({ ...config, tagline: e.target.value })
                  }
                  placeholder="Your shop's tagline"
                />
              </div>
              <div>
                <Label htmlFor="copyright">Copyright Text</Label>
                <Input
                  id="copyright"
                  value={config.copyright_text}
                  onChange={(e) =>
                    setConfig({ ...config, copyright_text: e.target.value })
                  }
                  placeholder="© 2025 Your Shop. All rights reserved."
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Information</h3>
            <div className="grid gap-4">
              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={config.address}
                  onChange={(e) =>
                    setConfig({ ...config, address: e.target.value })
                  }
                  placeholder="123 Main St, City, Country"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={config.phone}
                  onChange={(e) =>
                    setConfig({ ...config, phone: e.target.value })
                  }
                  placeholder="+1 234 567 8900"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={config.email}
                  onChange={(e) =>
                    setConfig({ ...config, email: e.target.value })
                  }
                  placeholder="contact@yourshop.com"
                />
              </div>
              <div>
                <Label htmlFor="working_hours">Working Hours</Label>
                <Input
                  id="working_hours"
                  value={config.working_hours}
                  onChange={(e) =>
                    setConfig({ ...config, working_hours: e.target.value })
                  }
                  placeholder="Mon-Sat: 10AM - 8PM"
                />
              </div>
            </div>
          </div>

          {/* Social Media Links */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Social Media</h3>
              <Button onClick={addSocialLink} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Social Link
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              For WhatsApp: Use format <code className="px-1 py-0.5 bg-muted rounded">https://wa.me/PHONENUMBER</code> (e.g., https://wa.me/919442420554)
            </p>
            {socialLinks.map((link, index) => (
              <div key={index} className="flex gap-2">
                <Select
                  value={link.platform}
                  onValueChange={(value) => {
                    const newLinks = [...socialLinks];
                    newLinks[index].platform = value;
                    setSocialLinks(newLinks);
                  }}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SOCIAL_PLATFORMS.map((platform) => (
                      <SelectItem key={platform} value={platform}>
                        {platform}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  value={link.url}
                  onChange={(e) => {
                    const newLinks = [...socialLinks];
                    newLinks[index].url = e.target.value;
                    setSocialLinks(newLinks);
                  }}
                  placeholder={link.platform === "WhatsApp" ? "https://wa.me/919442420554" : "https://..."}
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeSocialLink(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Quick Links</h3>
              <Button onClick={addQuickLink} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Link
              </Button>
            </div>
            {quickLinks.map((link, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={link.label}
                  onChange={(e) => {
                    const newLinks = [...quickLinks];
                    newLinks[index].label = e.target.value;
                    setQuickLinks(newLinks);
                  }}
                  placeholder="Link Label"
                  className="w-40"
                />
                <Input
                  value={link.url}
                  onChange={(e) => {
                    const newLinks = [...quickLinks];
                    newLinks[index].url = e.target.value;
                    setQuickLinks(newLinks);
                  }}
                  placeholder="/page or https://..."
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeQuickLink(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 mt-6 pt-6 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button variant="secondary" onClick={() => handleSave(false)} disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
            <Button onClick={() => handleSave(true)} disabled={loading}>
              Publish Footer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
