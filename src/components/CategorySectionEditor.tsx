import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CategorySectionEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: CategorySectionData) => void;
  initialData?: CategorySectionData;
}

export interface CategorySectionData {
  type: "category";
  title: string;
  subtitle: string;
  titleColor: string;
  subtitleColor: string;
  backgroundColor: string;
}

export const CategorySectionEditor = ({
  open,
  onOpenChange,
  onSave,
  initialData,
}: CategorySectionEditorProps) => {
  const [formData, setFormData] = useState<CategorySectionData>(
    initialData || {
      type: "category",
      title: "Shop by Category",
      subtitle: "Browse our collection",
      titleColor: "#000000",
      subtitleColor: "#6b7280",
      backgroundColor: "#ffffff",
    }
  );

  // Update form data when initialData changes or dialog opens
  useEffect(() => {
    if (initialData && open) {
      setFormData(initialData);
    } else if (!initialData && open) {
      setFormData({
        type: "category",
        title: "Shop by Category",
        subtitle: "Browse our collection",
        titleColor: "#000000",
        subtitleColor: "#6b7280",
        backgroundColor: "#ffffff",
      });
    }
  }, [initialData, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Category Section Settings</DialogTitle>
          <DialogDescription>
            Customize the category section appearance
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Section Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Shop by Category"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subtitle">Subtitle</Label>
            <Input
              id="subtitle"
              value={formData.subtitle}
              onChange={(e) =>
                setFormData({ ...formData, subtitle: e.target.value })
              }
              placeholder="Browse our collection"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="titleColor">Title Color</Label>
              <Input
                id="titleColor"
                type="color"
                value={formData.titleColor}
                onChange={(e) =>
                  setFormData({ ...formData, titleColor: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subtitleColor">Subtitle Color</Label>
              <Input
                id="subtitleColor"
                type="color"
                value={formData.subtitleColor}
                onChange={(e) =>
                  setFormData({ ...formData, subtitleColor: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="backgroundColor">Background Color</Label>
              <Input
                id="backgroundColor"
                type="color"
                value={formData.backgroundColor}
                onChange={(e) =>
                  setFormData({ ...formData, backgroundColor: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Section</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
