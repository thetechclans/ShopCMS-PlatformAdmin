import { supabase } from "@/integrations/supabase/client";

export interface MediaConfig {
  provider: 'supabase' | 'cloudinary' | 's3' | 'custom';
  bucket?: string;
  maxFileSize?: number;
  allowedTypes?: string[];
  customEndpoint?: string;
}

const DEFAULT_CONFIG: MediaConfig = {
  provider: 'supabase',
  bucket: 'category-images',
  maxFileSize: 5242880, // 5MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
};

export async function getMediaConfig(): Promise<MediaConfig> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return DEFAULT_CONFIG;

    const { data, error } = await supabase
      .from('profiles')
      .select('media_config')
      .eq('id', user.id)
      .single();

    if (error || !data?.media_config) {
      return DEFAULT_CONFIG;
    }

    const config = data.media_config as unknown as MediaConfig;
    return { ...DEFAULT_CONFIG, ...config };
  } catch {
    return DEFAULT_CONFIG;
  }
}

export async function updateMediaConfig(config: Partial<MediaConfig>): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const currentConfig = await getMediaConfig();
    const newConfig = { ...currentConfig, ...config };

    const { error } = await supabase
      .from('profiles')
      .update({ media_config: newConfig })
      .eq('id', user.id);

    return !error;
  } catch {
    return false;
  }
}

export async function uploadImage(file: File, path: string): Promise<string | null> {
  try {
    const config = await getMediaConfig();

    // Validate file size
    if (config.maxFileSize && file.size > config.maxFileSize) {
      throw new Error(`File size exceeds ${config.maxFileSize / 1024 / 1024}MB limit`);
    }

    // Validate file type
    if (config.allowedTypes && !config.allowedTypes.includes(file.type)) {
      throw new Error('File type not allowed');
    }

    // Handle different providers
    switch (config.provider) {
      case 'supabase':
        return await uploadToSupabase(file, path, config.bucket!);
      
      // Future providers can be added here
      case 'cloudinary':
      case 's3':
      case 'custom':
        throw new Error(`Provider ${config.provider} not yet implemented`);
      
      default:
        throw new Error('Invalid media provider');
    }
  } catch (error) {
    console.error('Upload error:', error);
    return null;
  }
}

async function uploadToSupabase(file: File, path: string, bucket: string): Promise<string | null> {
  try {
    // Get tenant_id from user profile for tenant-scoped storage
    const { data: { user } } = await supabase.auth.getUser();
    let tenantPrefix = '';
    
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single();
      
      if (profile?.tenant_id) {
        tenantPrefix = `${profile.tenant_id}/`;
      }
    }
    
    // Generate unique filename with tenant scope
    const fileExt = file.name.split('.').pop();
    const fileName = `${tenantPrefix}${path}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      return null;
    }

    // Get public URL
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return data.publicUrl;
  } catch (error) {
    console.error('Upload to Supabase failed:', error);
    return null;
  }
}

export async function deleteImage(url: string): Promise<boolean> {
  try {
    const config = await getMediaConfig();

    if (config.provider !== 'supabase') {
      console.warn('Delete not implemented for provider:', config.provider);
      return false;
    }

    // Extract file path from URL
    const urlParts = url.split('/');
    const fileName = urlParts[urlParts.length - 1];
    const folderPath = urlParts[urlParts.length - 2];
    const filePath = `${folderPath}/${fileName}`;

    const { error } = await supabase.storage
      .from(config.bucket!)
      .remove([filePath]);

    return !error;
  } catch (error) {
    console.error('Delete error:', error);
    return false;
  }
}
