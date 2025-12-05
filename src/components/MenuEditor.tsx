import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Edit, Trash2, MoveUp, MoveDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { urlSchema } from "@/lib/validationSchemas";
import { useTenant } from "@/contexts/TenantContext";

interface MenuItem {
  id: string;
  label: string;
  url: string;
  display_order: number;
  is_published: boolean;
}

interface MenuEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const MenuEditor = ({ open, onOpenChange }: MenuEditorProps) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const { tenantId } = useTenant();

  useEffect(() => {
    if (open) {
      fetchMenuItems();
    }
  }, [open]);

  const fetchMenuItems = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("menu_items")
      .select("*")
      .eq("user_id", user.id)
      .order("display_order", { ascending: true });

    if (error) {
      toast.error("Failed to load menu items");
      console.error(error);
    } else {
      setMenuItems(data || []);
    }
    setLoading(false);
  };

  const handleAdd = () => {
    setEditingItem(null);
    setLabel("");
    setUrl("");
    setEditDialogOpen(true);
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setLabel(item.label);
    setUrl(item.url);
    setEditDialogOpen(true);
  };

  const handleSave = async () => {
    if (!label || !url) {
      toast.error("Label and URL are required");
      return;
    }

    // Validate URL
    const validation = urlSchema.safeParse(url);
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    setSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      if (!tenantId) throw new Error("Tenant not found");

      const itemData = {
        user_id: user.id,
        tenant_id: tenantId,
        label,
        url,
        is_published: true,
        display_order: editingItem ? editingItem.display_order : menuItems.length,
      };

      if (editingItem) {
        const { error } = await supabase
          .from("menu_items")
          .update(itemData)
          .eq("id", editingItem.id);

        if (error) throw error;
        toast.success("Menu item updated");
      } else {
        const { error } = await supabase
          .from("menu_items")
          .insert(itemData);

        if (error) throw error;
        toast.success("Menu item added");
      }

      fetchMenuItems();
      setEditDialogOpen(false);
    } catch (error) {
      console.error("Error saving menu item:", error);
      toast.error("Failed to save menu item");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this menu item?")) return;

    const { error } = await supabase
      .from("menu_items")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete menu item");
    } else {
      toast.success("Menu item deleted");
      fetchMenuItems();
    }
  };

  const handleMove = async (item: MenuItem, direction: "up" | "down") => {
    const currentIndex = menuItems.findIndex(m => m.id === item.id);
    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (newIndex < 0 || newIndex >= menuItems.length) return;

    const updates = [
      { id: item.id, display_order: newIndex },
      { id: menuItems[newIndex].id, display_order: currentIndex }
    ];

    for (const update of updates) {
      const { error } = await supabase
        .from("menu_items")
        .update({ display_order: update.display_order })
        .eq("id", update.id);

      if (error) {
        toast.error("Failed to reorder menu items");
        return;
      }
    }

    fetchMenuItems();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Menu</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Button onClick={handleAdd} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Menu Item
            </Button>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : menuItems.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No menu items yet.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {menuItems.map((item, index) => (
                  <Card key={item.id}>
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium">{item.label}</p>
                          <p className="text-sm text-muted-foreground">{item.url}</p>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMove(item, "up")}
                            disabled={index === 0}
                          >
                            <MoveUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMove(item, "down")}
                            disabled={index === menuItems.length - 1}
                          >
                            <MoveDown className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Menu Item" : "Add Menu Item"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="label">Label</Label>
              <Input
                id="label"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g., Home, Products, About"
              />
            </div>
            <div>
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="e.g., /, /products, /about"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
