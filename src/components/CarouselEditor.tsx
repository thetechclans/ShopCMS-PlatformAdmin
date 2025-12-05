import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Edit, Trash2, MoveUp, MoveDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CarouselSlideDialog } from "./CarouselSlideDialog";
import { Badge } from "@/components/ui/badge";

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

interface CarouselEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CarouselEditor = ({ open, onOpenChange }: CarouselEditorProps) => {
  const [slides, setSlides] = useState<CarouselSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [slideDialogOpen, setSlideDialogOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<CarouselSlide | null>(null);

  useEffect(() => {
    if (open) {
      fetchSlides();
    }
  }, [open]);

  const fetchSlides = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("carousel_slides")
      .select("*")
      .eq("user_id", user.id)
      .order("display_order", { ascending: true });

    if (error) {
      toast.error("Failed to load slides");
      console.error(error);
    } else {
      setSlides(data || []);
    }
    setLoading(false);
  };

  const handleAddSlide = () => {
    setEditingSlide(null);
    setSlideDialogOpen(true);
  };

  const handleEditSlide = (slide: CarouselSlide) => {
    setEditingSlide(slide);
    setSlideDialogOpen(true);
  };

  const handleDeleteSlide = async (id: string) => {
    if (!confirm("Are you sure you want to delete this slide?")) return;

    const { error } = await supabase
      .from("carousel_slides")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete slide");
      console.error(error);
    } else {
      toast.success("Slide deleted");
      fetchSlides();
    }
  };

  const handleMoveSlide = async (slide: CarouselSlide, direction: "up" | "down") => {
    const currentIndex = slides.findIndex(s => s.id === slide.id);
    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (newIndex < 0 || newIndex >= slides.length) return;

    const updates = [
      { id: slide.id, display_order: newIndex },
      { id: slides[newIndex].id, display_order: currentIndex }
    ];

    for (const update of updates) {
      const { error } = await supabase
        .from("carousel_slides")
        .update({ display_order: update.display_order })
        .eq("id", update.id);

      if (error) {
        toast.error("Failed to reorder slides");
        return;
      }
    }

    fetchSlides();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Carousel Slides</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Button onClick={handleAddSlide} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Slide
            </Button>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : slides.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No slides yet. Add your first slide to get started.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {slides.map((slide, index) => (
                  <Card key={slide.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={slide.image_url}
                          alt={slide.title || "Slide"}
                          className="w-32 h-20 object-cover rounded"
                        />
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{slide.title || "Untitled Slide"}</h4>
                            <Badge variant={slide.is_active ? "default" : "secondary"}>
                              {slide.is_active ? "Active" : "Hidden"}
                            </Badge>
                          </div>
                          {slide.subtitle && (
                            <p className="text-sm text-muted-foreground line-clamp-1">{slide.subtitle}</p>
                          )}
                          {slide.cta_label && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Button: {slide.cta_label}
                            </p>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMoveSlide(slide, "up")}
                            disabled={index === 0}
                          >
                            <MoveUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMoveSlide(slide, "down")}
                            disabled={index === slides.length - 1}
                          >
                            <MoveDown className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditSlide(slide)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteSlide(slide.id)}
                          >
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

      <CarouselSlideDialog
        open={slideDialogOpen}
        onOpenChange={setSlideDialogOpen}
        slide={editingSlide}
        onSave={fetchSlides}
      />
    </>
  );
};
