import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, X, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { uploadImage } from "@/lib/mediaConfig";

interface GalleryImage {
  id?: string;
  image_url: string;
  display_order: number;
}

interface ProductGalleryProps {
  images: GalleryImage[];
  onChange: (images: GalleryImage[]) => void;
}

export function ProductGallery({ images, onChange }: ProductGalleryProps) {
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (images.length >= 3) {
      toast.error("You can upload a maximum of 3 additional images for this product");
      return;
    }

    setUploading(true);
    try {
      const url = await uploadImage(file, "products");
      if (url) {
        onChange([
          ...images,
          {
            image_url: url,
            display_order: images.length,
          },
        ]);
        toast.success("Image uploaded successfully");
      } else {
        toast.error("Failed to upload image");
      }
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleRemoveImage = (index: number) => {
    onChange(
      images
        .filter((_, i) => i !== index)
        .map((img, i) => ({ ...img, display_order: i }))
    );
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        {images.map((image, index) => (
          <Card key={index} className="relative aspect-square overflow-hidden">
            <img
              src={image.image_url}
              alt={`Gallery ${index + 1}`}
              className="w-full h-full object-cover"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8"
              onClick={() => handleRemoveImage(index)}
            >
              <X className="h-4 w-4" />
            </Button>
          </Card>
        ))}

        {images.length < 3 && (
          <Card className="relative aspect-square overflow-hidden border-dashed">
            <label className="flex flex-col items-center justify-center h-full cursor-pointer hover:bg-muted/50 transition-colors">
              <input
                type="file"
                className="hidden"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageUpload}
                disabled={uploading}
              />
              {uploading ? (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              ) : (
                <>
                  <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground">
                    Add Image
                  </span>
                </>
              )}
            </label>
          </Card>
        )}
      </div>

      {images.length === 0 && (
        <p className="text-sm text-muted-foreground">
          You can add up to 3 additional images
        </p>
      )}

      {images.length === 3 && (
        <p className="text-sm text-muted-foreground">
          Maximum of 3 gallery images reached
        </p>
      )}
    </div>
  );
}
