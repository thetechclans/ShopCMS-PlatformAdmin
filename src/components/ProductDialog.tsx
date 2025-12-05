import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ImageUpload } from "./ImageUpload";
import { ProductGallery } from "./ProductGallery";
import { ProductVideo } from "./ProductVideo";
import { ProductAttributes } from "./ProductAttributes";
import { uploadImage } from "@/lib/mediaConfig";
import { useTenant } from "@/contexts/TenantContext";

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  slug: z.string().min(1, "Slug is required"),
  category_id: z.string().optional(),
  is_published: z.boolean(),
  description: z.string().optional(),
  main_image_url: z.string().optional(),
  whatsapp_enabled: z.boolean(),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: {
    id: string;
    name: string;
    slug: string;
    category_id: string | null;
    is_published: boolean;
    description: string | null;
    whatsapp_enabled: boolean;
  };
  onSuccess: () => void;
}

interface Category {
  id: string;
  name: string;
}

export function ProductDialog({
  open,
  onOpenChange,
  product,
  onSuccess,
}: ProductDialogProps) {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [mainImageUrl, setMainImageUrl] = useState<string | undefined>(
    undefined
  );
  const [galleryImages, setGalleryImages] = useState<
    Array<{ id?: string; image_url: string; display_order: number }>
  >([]);
  const [videoData, setVideoData] = useState<{
    video_url?: string;
    thumbnail_url?: string;
  }>({});
  const [attributes, setAttributes] = useState<
    Array<{ id?: string; attribute_key: string; attribute_value: string; display_order: number }>
  >([]);
  const { tenantId } = useTenant();

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      slug: "",
      category_id: "",
      is_published: false,
      description: "",
      main_image_url: "",
      whatsapp_enabled: false,
    },
  });

  useEffect(() => {
    if (tenantId) {
      fetchCategories();
    }
  }, [tenantId]);

  useEffect(() => {
    if (product && open) {
      form.reset({
        name: product.name,
        slug: product.slug,
        category_id: product.category_id || "",
        is_published: product.is_published,
        description: product.description || "",
        whatsapp_enabled: product.whatsapp_enabled,
      });
      // Reset states before fetching
      setMainImageUrl(undefined);
      setGalleryImages([]);
      setVideoData({});
      setAttributes([]);
      fetchProductDetails(product.id);
    } else if (!product && open) {
      form.reset({
        name: "",
        slug: "",
        category_id: "",
        is_published: false,
        description: "",
        whatsapp_enabled: false,
      });
      setMainImageUrl(undefined);
      setGalleryImages([]);
      setVideoData({});
      setAttributes([]);
    }
  }, [product, open, form]);

  const fetchCategories = async () => {
    if (!tenantId) return;

    const { data, error } = await supabase
      .from("categories")
      .select("id, name")
      .eq("tenant_id", tenantId)
      .order("name");

    if (!error && data) {
      setCategories(data);
    }
  };

  const fetchProductDetails = async (productId: string) => {
    // Fetch images
    const { data: images } = await supabase
      .from("product_images")
      .select("*")
      .eq("product_id", productId)
      .order("display_order");

    if (images && images.length > 0) {
      setMainImageUrl(images[0].image_url);
      setGalleryImages(
        images.slice(1, 4).map((img, idx) => ({
          id: img.id,
          image_url: img.image_url,
          display_order: idx + 1,
        }))
      );
    }

    // Fetch video
    const { data: video } = await supabase
      .from("product_videos")
      .select("*")
      .eq("product_id", productId)
      .maybeSingle();

    if (video) {
      setVideoData({
        video_url: video.video_url,
        thumbnail_url: video.thumbnail_url || undefined,
      });
    }

    // Fetch attributes
    const { data: attrs } = await supabase
      .from("product_attributes")
      .select("*")
      .eq("product_id", productId)
      .order("display_order");

    if (attrs) {
      setAttributes(attrs);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const onNameChange = (name: string) => {
    if (!product) {
      form.setValue("slug", generateSlug(name));
    }
  };

  const handleImageUpload = (url: string | null) => {
    setMainImageUrl(url || undefined);
  };

  const onSubmit = async (values: ProductFormValues) => {
    if (values.is_published && !mainImageUrl) {
      toast.error("Please add a main image before publishing this product");
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let productId = product?.id;

      if (product) {
        if (!tenantId) throw new Error("Tenant not found");

        const { error } = await supabase
          .from("products")
          .update({
            name: values.name,
            slug: values.slug,
            category_id: values.category_id || null,
            is_published: values.is_published,
            description: values.description || null,
            whatsapp_enabled: values.whatsapp_enabled,
          })
          .eq("id", product.id)
          .eq("tenant_id", tenantId);

        if (error) throw error;
      } else {
        if (!tenantId) throw new Error("Tenant not found");

        const { data, error } = await supabase
          .from("products")
          .insert({
            name: values.name,
            slug: values.slug,
            category_id: values.category_id || null,
            is_published: values.is_published,
            description: values.description || null,
            whatsapp_enabled: values.whatsapp_enabled,
            user_id: user.id,
            tenant_id: tenantId,
          })
          .select()
          .single();

        if (error) throw error;
        productId = data.id;
      }

      if (!productId) throw new Error("Product ID not found");

      // Handle images
      await supabase
        .from("product_images")
        .delete()
        .eq("product_id", productId);

      const allImages = [
        ...(mainImageUrl ? [{ image_url: mainImageUrl, display_order: 0 }] : []),
        ...galleryImages.map((img, idx) => ({
          image_url: img.image_url,
          display_order: idx + 1,
        })),
      ];

      if (allImages.length > 0) {
        await supabase.from("product_images").insert(
          allImages.map((img) => ({
            product_id: productId,
            image_url: img.image_url,
            display_order: img.display_order,
          }))
        );
      }

      // Handle video
      await supabase
        .from("product_videos")
        .delete()
        .eq("product_id", productId);

      if (videoData.video_url) {
        await supabase.from("product_videos").insert({
          product_id: productId,
          video_url: videoData.video_url,
          thumbnail_url: videoData.thumbnail_url || null,
        });
      }

      // Handle attributes
      await supabase
        .from("product_attributes")
        .delete()
        .eq("product_id", productId);

      const validAttributes = attributes.filter(
        (attr) => attr.attribute_key && attr.attribute_value
      );

      if (validAttributes.length > 0) {
        await supabase.from("product_attributes").insert(
          validAttributes.map((attr, idx) => ({
            product_id: productId,
            attribute_key: attr.attribute_key,
            attribute_value: attr.attribute_value,
            display_order: idx,
          }))
        );
      }

      toast.success(
        product ? "Product updated successfully" : "Product created successfully"
      );
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {product ? "Edit Product" : "Create Product"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          onNameChange(e.target.value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>
                      URL-friendly name for this product
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category (Optional)</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="No category selected" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_published"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value === "true")}
                      value={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="false">Draft</SelectItem>
                        <SelectItem value="true">Published</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Description</h3>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={6} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Main Image</h3>
              <ImageUpload
                value={mainImageUrl}
                onChange={handleImageUpload}
                path="products"
              />
              {form.watch("is_published") && !mainImageUrl && (
                <p className="text-sm text-destructive">
                  Main image is required for published products
                </p>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Gallery Images</h3>
              <ProductGallery
                images={galleryImages}
                onChange={setGalleryImages}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Video (Optional)</h3>
              <ProductVideo videoData={videoData} onChange={setVideoData} />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Attributes</h3>
              <ProductAttributes
                attributes={attributes}
                onChange={setAttributes}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">WhatsApp Integration</h3>

              <FormField
                control={form.control}
                name="whatsapp_enabled"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-3">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4 rounded border-input"
                      />
                    </FormControl>
                    <div className="space-y-0.5">
                      <FormLabel className="text-sm">Enable WhatsApp Chat Button</FormLabel>
                      <FormDescription className="text-xs">
                        Allow customers to chat on WhatsApp for this product. Make sure to configure your WhatsApp number in Settings.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : product ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
