import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Trash2, ArrowUp, ArrowDown, Edit, Grid3x3, Type, Save } from "lucide-react";
import { CategorySectionEditor, CategorySectionData } from "@/components/CategorySectionEditor";
import { TextSectionEditor, TextSectionData } from "@/components/TextSectionEditor";
import { CategorySection } from "@/components/CategorySection";
import { TextSection } from "@/components/TextSection";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type PageSection = CategorySectionData | TextSectionData;

interface TemplateHomePageDesignerProps {
  planType: "basic" | "silver" | "gold";
  onSave?: () => void;
}

export const TemplateHomePageDesigner = ({ planType, onSave }: TemplateHomePageDesignerProps) => {
  const [sections, setSections] = useState<PageSection[]>([]);
  const [categorySectionEditorOpen, setCategorySectionEditorOpen] = useState(false);
  const [textSectionEditorOpen, setTextSectionEditorOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<{ index: number; data: PageSection } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Mock categories for preview
  const mockCategories = [
    { id: "1", name: "Electronics", slug: "electronics", image_url: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=300" },
    { id: "2", name: "Fashion", slug: "fashion", image_url: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=300" },
    { id: "3", name: "Home & Garden", slug: "home-garden", image_url: "https://images.unsplash.com/photo-1556912173-3bb406ef7e77?w=300" },
  ];

  useEffect(() => {
    loadDefaultSections();
  }, [planType]);

  const loadDefaultSections = async () => {
    try {
      const { data, error } = await supabase
        .from("plan_template_configs")
        .select("default_sections")
        .eq("plan_type", planType)
        .single();

      if (error) throw error;

      if (data?.default_sections && Array.isArray(data.default_sections)) {
        setSections(data.default_sections as unknown as PageSection[]);
      } else {
        // Initialize with default sections if none exist
        initializeDefaultSections();
      }
    } catch (error) {
      console.error("Error loading default sections:", error);
      initializeDefaultSections();
    }
  };

  const initializeDefaultSections = () => {
    const defaultSections: PageSection[] = [
      {
        type: "category",
        title: "Shop by Category",
        subtitle: "Explore our collections",
        titleColor: "#1f2937",
        subtitleColor: "#6b7280",
        backgroundColor: "#ffffff",
      },
      {
        type: "text",
        content: "<h2>Welcome to Our Shop</h2><p>Discover amazing products curated just for you.</p>",
        textColor: "#1f2937",
        backgroundColor: "#f9fafb",
        textAlign: "center",
        fontSize: "medium",
        fontWeight: "normal",
      },
    ];
    setSections(defaultSections);
  };

  const handleSaveConfiguration = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("plan_template_configs")
        .update({ default_sections: sections as unknown as any })
        .eq("plan_type", planType);

      if (error) throw error;

      toast.success("Template home page configuration saved successfully");
      onSave?.();
    } catch (error) {
      console.error("Error saving configuration:", error);
      toast.error("Failed to save configuration");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddSection = (type: "category" | "text") => {
    if (type === "category") {
      setCategorySectionEditorOpen(true);
      setEditingSection(null);
    } else {
      setTextSectionEditorOpen(true);
      setEditingSection(null);
    }
  };

  const handleEditSection = (index: number, section: PageSection) => {
    setEditingSection({ index, data: section });
    if (section.type === "category") {
      setCategorySectionEditorOpen(true);
    } else {
      setTextSectionEditorOpen(true);
    }
  };

  const handleSaveSection = (data: PageSection) => {
    if (editingSection !== null) {
      const newSections = [...sections];
      newSections[editingSection.index] = data;
      setSections(newSections);
    } else {
      setSections([...sections, data]);
    }
    setEditingSection(null);
    toast.success("Section saved");
  };

  const handleDeleteSection = (index: number) => {
    setSections(sections.filter((_, i) => i !== index));
    toast.success("Section deleted");
  };

  const moveSection = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === sections.length - 1)
    ) {
      return;
    }

    const newSections = [...sections];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    [newSections[index], newSections[newIndex]] = [newSections[newIndex], newSections[index]];
    setSections(newSections);
  };

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold capitalize">Default Home Page for {planType} Plan</h3>
            <p className="text-sm text-muted-foreground">
              Configure the default sections that will appear for new tenants
            </p>
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Section
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleAddSection("category")}>
                  <Grid3x3 className="h-4 w-4 mr-2" />
                  Category Section
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAddSection("text")}>
                  <Type className="h-4 w-4 mr-2" />
                  Text Section
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button onClick={handleSaveConfiguration} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save Configuration"}
            </Button>
          </div>
        </div>

        <div className="border-2 border-dashed border-border rounded-lg p-6 bg-muted/20">
          <div className="space-y-4">
            <div className="bg-accent/50 p-4 rounded border">
              <p className="text-sm font-medium text-center">Hero Carousel Section (Always Present)</p>
            </div>

            {sections.length === 0 ? (
              <div className="border-2 border-dashed border-border rounded-lg p-12 text-center bg-background">
                <h3 className="text-lg font-medium mb-2">No Sections Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Add sections to create the default home page layout
                </p>
                <Button onClick={() => handleAddSection("category")} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Section
                </Button>
              </div>
            ) : (
              sections.map((section, index) => (
                <div key={index} className="relative group bg-background rounded-lg border p-4">
                  <div className="absolute top-2 right-2 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => moveSection(index, "up")}
                      disabled={index === 0}
                      title="Move up"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => moveSection(index, "down")}
                      disabled={index === sections.length - 1}
                      title="Move down"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleEditSection(index, section)}
                      title="Edit section"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteSection(index)}
                      title="Delete section"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {section.type === "category" && (
                    <div className="pointer-events-none">
                      <CategorySection
                        title={section.title}
                        subtitle={section.subtitle}
                        titleColor={section.titleColor}
                        subtitleColor={section.subtitleColor}
                        backgroundColor={section.backgroundColor}
                        categories={mockCategories}
                      />
                    </div>
                  )}
                  {section.type === "text" && (
                    <div className="pointer-events-none">
                      <TextSection
                        content={section.content}
                        textColor={section.textColor}
                        backgroundColor={section.backgroundColor}
                        textAlign={section.textAlign}
                        fontSize={section.fontSize}
                        fontWeight={section.fontWeight}
                      />
                    </div>
                  )}
                </div>
              ))
            )}

            <div className="bg-accent/50 p-4 rounded border">
              <p className="text-sm font-medium text-center">Footer Section (Always Present)</p>
            </div>
          </div>
        </div>
      </Card>

      <CategorySectionEditor
        open={categorySectionEditorOpen}
        onOpenChange={(open) => {
          setCategorySectionEditorOpen(open);
          if (!open) setEditingSection(null);
        }}
        onSave={handleSaveSection}
        initialData={editingSection?.data.type === "category" ? editingSection.data : undefined}
      />
      <TextSectionEditor
        open={textSectionEditorOpen}
        onOpenChange={(open) => {
          setTextSectionEditorOpen(open);
          if (!open) setEditingSection(null);
        }}
        onSave={handleSaveSection}
        initialData={editingSection?.data.type === "text" ? editingSection.data : undefined}
      />
    </div>
  );
};
