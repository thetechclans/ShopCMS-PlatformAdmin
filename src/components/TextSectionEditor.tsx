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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bold, Italic, AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";

interface TextSectionEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: TextSectionData) => void;
  initialData?: TextSectionData;
}

export interface TextSectionData {
  type: "text";
  content: string;
  textColor: string;
  backgroundColor: string;
  textAlign: "left" | "center" | "right";
  fontSize: "small" | "medium" | "large";
  fontWeight: "normal" | "semibold" | "bold";
}

export const TextSectionEditor = ({
  open,
  onOpenChange,
  onSave,
  initialData,
}: TextSectionEditorProps) => {
  const [formData, setFormData] = useState<TextSectionData>(
    initialData || {
      type: "text",
      content: "",
      textColor: "#000000",
      backgroundColor: "#ffffff",
      textAlign: "left",
      fontSize: "medium",
      fontWeight: "normal",
    }
  );

  // Update form data when initialData changes or dialog opens
  useEffect(() => {
    if (initialData && open) {
      setFormData(initialData);
    } else if (!initialData && open) {
      setFormData({
        type: "text",
        content: "",
        textColor: "#000000",
        backgroundColor: "#ffffff",
        textAlign: "left",
        fontSize: "medium",
        fontWeight: "normal",
      });
    }
  }, [initialData, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onOpenChange(false);
  };

  const wrapText = (tag: string) => {
    const textarea = document.getElementById("content") as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = formData.content.substring(start, end);
    const before = formData.content.substring(0, start);
    const after = formData.content.substring(end);

    const wrapped = `<${tag}>${selectedText}</${tag}>`;
    setFormData({
      ...formData,
      content: before + wrapped + after,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Text Section Settings</DialogTitle>
          <DialogDescription>
            Add and format text content for your page
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <div className="flex gap-2 mb-2">
              <Toggle
                size="sm"
                onClick={() => wrapText("strong")}
                aria-label="Toggle bold"
              >
                <Bold className="h-4 w-4" />
              </Toggle>
              <Toggle
                size="sm"
                onClick={() => wrapText("em")}
                aria-label="Toggle italic"
              >
                <Italic className="h-4 w-4" />
              </Toggle>
              <div className="border-l border-border mx-2" />
              <Toggle
                size="sm"
                pressed={formData.textAlign === "left"}
                onClick={() => setFormData({ ...formData, textAlign: "left" })}
                aria-label="Align left"
              >
                <AlignLeft className="h-4 w-4" />
              </Toggle>
              <Toggle
                size="sm"
                pressed={formData.textAlign === "center"}
                onClick={() => setFormData({ ...formData, textAlign: "center" })}
                aria-label="Align center"
              >
                <AlignCenter className="h-4 w-4" />
              </Toggle>
              <Toggle
                size="sm"
                pressed={formData.textAlign === "right"}
                onClick={() => setFormData({ ...formData, textAlign: "right" })}
                aria-label="Align right"
              >
                <AlignRight className="h-4 w-4" />
              </Toggle>
            </div>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              placeholder="Enter your text content here. Select text and use formatting buttons above."
              rows={10}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fontSize">Font Size</Label>
              <Select
                value={formData.fontSize}
                onValueChange={(value: "small" | "medium" | "large") =>
                  setFormData({ ...formData, fontSize: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fontWeight">Font Weight</Label>
              <Select
                value={formData.fontWeight}
                onValueChange={(value: "normal" | "semibold" | "bold") =>
                  setFormData({ ...formData, fontWeight: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="semibold">Semi Bold</SelectItem>
                  <SelectItem value="bold">Bold</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="textColor">Text Color</Label>
              <Input
                id="textColor"
                type="color"
                value={formData.textColor}
                onChange={(e) =>
                  setFormData({ ...formData, textColor: e.target.value })
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
