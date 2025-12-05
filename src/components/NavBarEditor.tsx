import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ImageUpload } from "./ImageUpload";
import { useTenant } from "@/contexts/TenantContext";

interface NavBarEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NavBarEditor = ({ open, onOpenChange }: NavBarEditorProps) => {
  const [logoUrl, setLogoUrl] = useState<string>("");
  const [brandText, setBrandText] = useState("Shop");
  const [logoLinkToHome, setLogoLinkToHome] = useState(true);
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [textColor, setTextColor] = useState("#000000");
  const [stickyScroll, setStickyScroll] = useState(true);
  const [configId, setConfigId] = useState<string | null>(null);
  const { tenantId } = useTenant();

  useEffect(() => {
    if (open) {
      loadNavBarConfig();
    }
  }, [open]);

  const loadNavBarConfig = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("navbar_config")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (data) {
      setConfigId(data.id);
      setLogoUrl(data.logo_url || "");
      setBrandText(data.brand_text || "Shop");
      setLogoLinkToHome(data.logo_link_to_home ?? true);
      setBackgroundColor(data.background_color || "#ffffff");
      setTextColor(data.text_color || "#000000");
      setStickyScroll(data.sticky_scroll ?? true);
    }
  };

  const handleSave = async (publish: boolean = false) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("You must be logged in");
      return;
    }

    if (!tenantId) {
      toast.error("Tenant not found");
      return;
    }

    const configData = {
      user_id: user.id,
      tenant_id: tenantId,
      logo_url: logoUrl || null,
      brand_text: brandText,
      logo_link_to_home: logoLinkToHome,
      background_color: backgroundColor,
      text_color: textColor,
      sticky_scroll: stickyScroll,
      is_published: publish,
    };

    if (configId) {
      const { error } = await supabase
        .from("navbar_config")
        .update(configData)
        .eq("id", configId);

      if (error) {
        toast.error("Failed to update navbar");
        return;
      }
    } else {
      const { data, error } = await supabase
        .from("navbar_config")
        .insert(configData)
        .select()
        .single();

      if (error) {
        toast.error("Failed to create navbar");
        return;
      }
      setConfigId(data.id);
    }

    toast.success(publish ? "NavBar published!" : "NavBar saved as draft");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Navigation Bar</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label>Logo Image</Label>
            <ImageUpload
              value={logoUrl}
              onChange={(url) => setLogoUrl(url || "")}
              path="navbar"
            />
            <p className="text-sm text-muted-foreground">
              If no logo is uploaded, the brand text below will be displayed
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="brandText">Brand Text</Label>
            <Input
              id="brandText"
              type="text"
              value={brandText}
              onChange={(e) => setBrandText(e.target.value)}
              placeholder="Shop"
            />
            <p className="text-sm text-muted-foreground">
              This text appears when no logo is uploaded
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Logo Links to Home Page</Label>
              <p className="text-sm text-muted-foreground">
                Click logo to navigate to home
              </p>
            </div>
            <Switch checked={logoLinkToHome} onCheckedChange={setLogoLinkToHome} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bgColor">Background Color</Label>
              <div className="flex gap-2">
                <Input
                  id="bgColor"
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="w-20 h-10"
                />
                <Input
                  type="text"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  placeholder="#ffffff"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="textColor">Text Color</Label>
              <div className="flex gap-2">
                <Input
                  id="textColor"
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-20 h-10"
                />
                <Input
                  type="text"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  placeholder="#000000"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Sticky on Scroll</Label>
              <p className="text-sm text-muted-foreground">
                Keep navbar visible when scrolling
              </p>
            </div>
            <Switch checked={stickyScroll} onCheckedChange={setStickyScroll} />
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={() => handleSave(false)} className="flex-1">
              Save Draft
            </Button>
            <Button onClick={() => handleSave(true)} className="flex-1">
              Publish NavBar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
