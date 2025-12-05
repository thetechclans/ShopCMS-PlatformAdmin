import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Upload, Link as LinkIcon, X } from "lucide-react";
import { toast } from "sonner";
import { uploadImage } from "@/lib/mediaConfig";

interface ProductVideoProps {
  videoData: {
    video_url?: string;
    thumbnail_url?: string;
  };
  onChange: (data: { video_url?: string; thumbnail_url?: string }) => void;
}

export function ProductVideo({ videoData, onChange }: ProductVideoProps) {
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState(videoData.video_url || "");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadImage(file, "products/videos");
      if (url) {
        onChange({ video_url: url });
        toast.success("Video uploaded successfully");
      } else {
        toast.error("Failed to upload video");
      }
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleUrlSave = () => {
    if (!urlInput) {
      toast.error("Please enter a video URL");
      return;
    }

    // Basic URL validation
    try {
      new URL(urlInput);
      onChange({ video_url: urlInput });
      toast.success("Video URL saved");
    } catch {
      toast.error("Please enter a valid URL");
    }
  };

  const handleRemoveVideo = () => {
    onChange({});
    setUrlInput("");
  };

  const isYouTubeUrl = (url: string) => {
    return url.includes("youtube.com") || url.includes("youtu.be");
  };

  const isVimeoUrl = (url: string) => {
    return url.includes("vimeo.com");
  };

  const getEmbedUrl = (url: string) => {
    if (isYouTubeUrl(url)) {
      const videoId = url.split("v=")[1]?.split("&")[0] || url.split("/").pop();
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (isVimeoUrl(url)) {
      const videoId = url.split("/").pop();
      return `https://player.vimeo.com/video/${videoId}`;
    }
    return url;
  };

  if (videoData.video_url) {
    const isEmbeddable = isYouTubeUrl(videoData.video_url) || isVimeoUrl(videoData.video_url);

    return (
      <Card className="p-4">
        <div className="space-y-4">
          {isEmbeddable ? (
            <div className="aspect-video">
              <iframe
                src={getEmbedUrl(videoData.video_url)}
                className="w-full h-full rounded-md"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
              <video
                src={videoData.video_url}
                controls
                className="w-full h-full rounded-md"
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground truncate flex-1">
              {videoData.video_url}
            </p>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleRemoveVideo}
            >
              <X className="h-4 w-4 mr-2" />
              Remove
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Tabs defaultValue="url" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="url">
          <LinkIcon className="h-4 w-4 mr-2" />
          Video URL
        </TabsTrigger>
        <TabsTrigger value="upload">
          <Upload className="h-4 w-4 mr-2" />
          Upload File
        </TabsTrigger>
      </TabsList>

      <TabsContent value="url" className="space-y-4">
        <div className="space-y-2">
          <Label>Video URL (YouTube, Vimeo, or direct link)</Label>
          <div className="flex gap-2">
            <Input
              placeholder="https://youtube.com/watch?v=..."
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
            />
            <Button type="button" onClick={handleUrlSave}>
              Save
            </Button>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="upload">
        <Card className="border-dashed">
          <label className="flex flex-col items-center justify-center p-8 cursor-pointer hover:bg-muted/50 transition-colors">
            <input
              type="file"
              className="hidden"
              accept="video/mp4,video/webm"
              onChange={handleFileUpload}
              disabled={uploading}
            />
            {uploading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            ) : (
              <>
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground">
                  Click to upload video
                </span>
                <span className="text-xs text-muted-foreground mt-1">
                  MP4 or WebM format
                </span>
              </>
            )}
          </label>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
