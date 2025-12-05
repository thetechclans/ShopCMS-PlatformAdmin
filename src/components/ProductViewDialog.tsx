import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Loader2 } from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  category_id: string | null;
  is_published: boolean;
}

interface ProductImage {
  id: string;
  image_url: string;
  display_order: number;
}

interface ProductVideo {
  video_url: string;
}

interface ProductAttribute {
  attribute_key: string;
  attribute_value: string;
}

interface Category {
  id: string;
  name: string;
}

interface ProductViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | undefined;
}

export const ProductViewDialog = ({
  open,
  onOpenChange,
  product,
}: ProductViewDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [video, setVideo] = useState<ProductVideo | null>(null);
  const [attributes, setAttributes] = useState<ProductAttribute[]>([]);
  const [category, setCategory] = useState<Category | null>(null);

  useEffect(() => {
    if (open && product) {
      fetchProductDetails();
    }
  }, [open, product]);

  const fetchProductDetails = async () => {
    if (!product) return;

    setLoading(true);
    try {
      // Fetch images
      const { data: imagesData } = await supabase
        .from("product_images")
        .select("*")
        .eq("product_id", product.id)
        .order("display_order", { ascending: true });

      // Fetch video
      const { data: videoData } = await supabase
        .from("product_videos")
        .select("video_url")
        .eq("product_id", product.id)
        .maybeSingle();

      // Fetch attributes
      const { data: attributesData } = await supabase
        .from("product_attributes")
        .select("attribute_key, attribute_value")
        .eq("product_id", product.id)
        .order("display_order", { ascending: true });

      // Fetch category if product has one
      if (product.category_id) {
        const { data: categoryData } = await supabase
          .from("categories")
          .select("id, name")
          .eq("id", product.category_id)
          .single();
        setCategory(categoryData);
      } else {
        setCategory(null);
      }

      setImages(imagesData || []);
      setVideo(videoData);
      setAttributes(attributesData || []);
    } catch (error) {
      console.error("Error fetching product details:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {product.name}
            <Badge variant={product.is_published ? "default" : "secondary"}>
              {product.is_published ? "Published" : "Draft"}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <span className="font-medium">Slug:</span> {product.slug}
                </div>
                {category && (
                  <div>
                    <span className="font-medium">Category:</span> {category.name}
                  </div>
                )}
                {product.description && (
                  <div>
                    <span className="font-medium">Description:</span>
                    <p className="mt-1 text-muted-foreground">{product.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Images */}
            {images.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Images</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {images.map((image, index) => (
                      <div key={image.id} className="relative aspect-square">
                        <img
                          src={image.image_url}
                          alt={`Product image ${index + 1}`}
                          className="w-full h-full object-cover rounded-md"
                        />
                        {index === 0 && (
                          <Badge className="absolute top-2 left-2" variant="default">
                            Main
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Video */}
            {video && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Video</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm">
                    <span className="font-medium">URL:</span>{" "}
                    <a
                      href={video.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {video.video_url}
                    </a>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Attributes */}
            {attributes.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Attributes</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableBody>
                      {attributes.map((attr, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {attr.attribute_key}
                          </TableCell>
                          <TableCell>{attr.attribute_value}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
