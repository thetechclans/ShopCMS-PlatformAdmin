import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useTenant } from "@/contexts/TenantContext";

const pageSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  content: z.string().optional(),
  is_published: z.boolean().default(false),
});

type PageFormValues = z.infer<typeof pageSchema>;

interface PageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  page?: {
    id: string;
    title: string;
    slug: string;
    content: string | null;
    is_published: boolean;
  };
  onSuccess: () => void;
}

export const PageDialog = ({
  open,
  onOpenChange,
  page,
  onSuccess,
}: PageDialogProps) => {
  const [loading, setLoading] = useState(false);
  const { tenantId } = useTenant();

  const form = useForm<PageFormValues>({
    resolver: zodResolver(pageSchema),
    defaultValues: {
      title: "",
      slug: "",
      content: "",
      is_published: false,
    },
  });

  useEffect(() => {
    if (open && page) {
      form.reset({
        title: page.title,
        slug: page.slug,
        content: page.content || "",
        is_published: page.is_published,
      });
    } else if (open && !page) {
      form.reset({
        title: "",
        slug: "",
        content: "",
        is_published: false,
      });
    }
  }, [open, page, form]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const onTitleChange = (value: string) => {
    form.setValue("title", value);
    if (!page) {
      // Only auto-generate slug for new pages
      const slug = generateSlug(value);
      form.setValue("slug", slug);
    }
  };

  const onSubmit = async (values: PageFormValues) => {
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      if (page) {
        // Update existing page
        const { error } = await supabase
          .from("pages")
          .update({
            title: values.title,
            slug: values.slug,
            content: values.content || null,
            is_published: values.is_published,
          })
          .eq("id", page.id);

        if (error) throw error;
        toast.success("Page updated successfully");
      } else {
        if (!tenantId) throw new Error("Tenant not found");

        // Create new page
        const { error } = await supabase
          .from("pages")
          .insert({
            user_id: user.id,
            tenant_id: tenantId,
            title: values.title,
            slug: values.slug,
            content: values.content || null,
            is_published: values.is_published,
          });

        if (error) throw error;
        toast.success("Page created successfully");
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error saving page:", error);
      toast.error(error.message || "Failed to save page");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{page ? "Edit Page" : "Create New Page"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      onChange={(e) => onTitleChange(e.target.value)}
                      placeholder="About Us"
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
                  <FormLabel>Slug (URL)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="about-us" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Enter your page content here..."
                      rows={10}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_published"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <FormLabel>Publish Page</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Make this page visible to the public
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

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
                {loading ? "Saving..." : page ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
