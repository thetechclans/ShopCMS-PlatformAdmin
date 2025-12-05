import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Plus, X } from "lucide-react";

interface Attribute {
  id?: string;
  attribute_key: string;
  attribute_value: string;
  display_order: number;
}

interface ProductAttributesProps {
  attributes: Attribute[];
  onChange: (attributes: Attribute[]) => void;
}

export function ProductAttributes({
  attributes,
  onChange,
}: ProductAttributesProps) {
  const handleAddAttribute = () => {
    onChange([
      ...attributes,
      {
        attribute_key: "",
        attribute_value: "",
        display_order: attributes.length,
      },
    ]);
  };

  const handleRemoveAttribute = (index: number) => {
    onChange(
      attributes
        .filter((_, i) => i !== index)
        .map((attr, i) => ({ ...attr, display_order: i }))
    );
  };

  const handleUpdateAttribute = (
    index: number,
    field: "attribute_key" | "attribute_value",
    value: string
  ) => {
    const updated = [...attributes];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {attributes.map((attr, index) => (
        <Card key={index} className="p-4">
          <div className="flex gap-2 items-start">
            <div className="flex-1 grid grid-cols-2 gap-2">
              <div>
                <Input
                  placeholder="Attribute Name (e.g., Color)"
                  value={attr.attribute_key}
                  onChange={(e) =>
                    handleUpdateAttribute(index, "attribute_key", e.target.value)
                  }
                />
              </div>
              <div>
                <Input
                  placeholder="Attribute Value (e.g., Black)"
                  value={attr.attribute_value}
                  onChange={(e) =>
                    handleUpdateAttribute(
                      index,
                      "attribute_value",
                      e.target.value
                    )
                  }
                />
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => handleRemoveAttribute(index)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={handleAddAttribute}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Attribute
      </Button>

      {attributes.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          No attributes added yet. Click "Add Attribute" to get started.
        </p>
      )}
    </div>
  );
}
