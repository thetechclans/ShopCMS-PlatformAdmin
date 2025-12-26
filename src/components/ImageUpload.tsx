import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, Loader2 } from "lucide-react";
import { uploadImage, deleteImage } from "@/lib/mediaConfig";
import { toast } from "sonner";

interface ImageUploadProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  path: string;
  disabled?: boolean;
  variant?: "default" | "icon";
}

export const ImageUpload = ({ value, onChange, path, disabled, variant = "default" }: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Keep preview in sync with value passed from parent (e.g. after refetch)
  useEffect(() => {
    if (!uploading) {
      setPreview(value || null);
    }
  }, [value, uploading]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Upload file
    setUploading(true);
    try {
      const url = await uploadImage(file, path);
      
      if (url) {
        setPreview(url);
        onChange(url);
        toast.success("Image uploaded successfully");
      } else {
        setPreview(value || null);
        toast.error("Failed to upload image");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setPreview(value || null);
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = async () => {
    if (value) {
      const deleted = await deleteImage(value);
      if (!deleted) {
        toast.error("Failed to delete image from storage");
      }
    }
    
    setPreview(null);
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || uploading}
      />

      {preview ? (
        variant === "icon" ? (
          <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted border">
            <img
              src={preview}
              alt="Favicon preview"
              className="w-full h-full object-cover"
            />
            {!disabled && (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                onClick={handleRemove}
                disabled={uploading}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
            {uploading && (
              <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              </div>
            )}
          </div>
        ) : (
          <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-muted">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            {!disabled && (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={handleRemove}
                disabled={uploading}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            {uploading && (
              <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
          </div>
        )
      ) : (
        variant === "icon" ? (
          <div
            className="w-16 h-16 rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors flex items-center justify-center cursor-pointer bg-muted"
            onClick={() => !disabled && !uploading && fileInputRef.current?.click()}
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            ) : (
              <Upload className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        ) : (
          <div
            className="w-full aspect-video rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors flex items-center justify-center cursor-pointer"
            onClick={() => !disabled && !uploading && fileInputRef.current?.click()}
          >
            <div className="text-center">
              {uploading ? (
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
              ) : (
                <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              )}
              <p className="text-sm text-muted-foreground">
                {uploading ? "Uploading..." : "Click to upload image"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PNG, JPG, WEBP or GIF (max 5MB)
              </p>
            </div>
          </div>
        )
      )}
    </div>
  );
};
