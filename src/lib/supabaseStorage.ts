import { getSupabaseClient, isSupabaseConfigured } from './supabase';
import { dataService } from './dataService';
import { authService } from './authService';

export interface UploadResult {
  url: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  source: 'supabase' | 'local_media';
}

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml'
];

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB limit

/**
 * Uploads an image file to Supabase Storage (bucket 'article-images').
 * Falls back to permanent Media Library storage (dataURL) if Supabase is offline or unconfigured.
 * Guaranteed never to return temporary blob: URLs.
 */
export async function uploadArticleImage(
  file: File,
  onProgress?: (percent: number) => void
): Promise<UploadResult> {
  // 0. Authorization guard
  if (!authService.isSessionValid()) {
    throw new Error('Access Denied: Only authorized administrator (rajsiba2005@gmail.com) can upload media.');
  }

  // 1. Validation
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error(`Unsupported image format (${file.type || 'unknown'}). Please upload JPEG, PNG, WebP, GIF, or SVG.`);
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error(`File size ${(file.size / (1024 * 1024)).toFixed(1)}MB exceeds maximum 10MB limit.`);
  }

  onProgress?.(25);

  // 2. Generate clean, unique filename
  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const cleanBase = file.name
    .replace(/\.[^/.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .slice(0, 30);
  const uniqueName = `${cleanBase}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}.${extension}`;

  // 3. Check if Supabase client is configured
  const supabase = getSupabaseClient();
  if (isSupabaseConfigured() && supabase) {
    try {
      onProgress?.(50);
      const bucketName = 'article-images';

      // Attempt upload to Supabase Storage bucket
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(`uploads/${uniqueName}`, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (!error && data) {
        onProgress?.(85);
        const { data: publicUrlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(data.path);

        if (publicUrlData?.publicUrl) {
          onProgress?.(100);

          // Also register with local media library index
          dataService.addMedia({
            title: file.name,
            file_url: publicUrlData.publicUrl,
            file_name: uniqueName,
            file_size: file.size,
            mime_type: file.type,
            alt_text: file.name.replace(/\.[^/.]+$/, '')
          });

          return {
            url: publicUrlData.publicUrl,
            fileName: uniqueName,
            fileSize: file.size,
            mimeType: file.type,
            source: 'supabase'
          };
        }
      } else if (error) {
        console.warn('Supabase storage upload notice:', error.message);
        // Fall back gracefully to permanent data URL
      }
    } catch (err: any) {
      console.warn('Supabase upload fallback trigger:', err?.message || err);
    }
  }

  // 4. Permanent Fallback (Reader as persistent Data URL registered in DataService)
  onProgress?.(70);
  const permanentUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read image file data'));
    reader.readAsDataURL(file);
  });

  onProgress?.(100);

  // Register in media library
  dataService.addMedia({
    title: file.name,
    file_url: permanentUrl,
    file_name: uniqueName,
    file_size: file.size,
    mime_type: file.type,
    alt_text: file.name.replace(/\.[^/.]+$/, '')
  });

  return {
    url: permanentUrl,
    fileName: uniqueName,
    fileSize: file.size,
    mimeType: file.type,
    source: 'local_media'
  };
}

/**
 * Uploads a homepage banner (desktop or mobile) to Supabase Storage.
 * Attempts bucket 'banners', falls back to 'article-images', or permanent media dataURL.
 */
export async function uploadBannerImage(
  file: File,
  deviceType: 'desktop' | 'mobile' = 'desktop',
  onProgress?: (percent: number) => void
): Promise<UploadResult> {
  if (!authService.isSessionValid()) {
    throw new Error('Access Denied: Only authorized administrator (rajsiba2005@gmail.com) can update banners.');
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error(`Unsupported image format (${file.type || 'unknown'}). Please upload JPEG, PNG, WebP, GIF, or SVG.`);
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error(`Banner file size ${(file.size / (1024 * 1024)).toFixed(1)}MB exceeds maximum 10MB limit.`);
  }

  onProgress?.(20);

  const extension = file.name.split('.').pop()?.toLowerCase() || 'png';
  const uniqueName = `digiseekho_banner_${deviceType}_${Date.now()}.${extension}`;

  const supabase = getSupabaseClient();
  if (isSupabaseConfigured() && supabase) {
    onProgress?.(40);
    // Try 'banners' bucket first, then 'article-images'
    const targetBuckets = ['banners', 'article-images'];

    for (const bucketName of targetBuckets) {
      try {
        const { data, error } = await supabase.storage
          .from(bucketName)
          .upload(`homepage/${uniqueName}`, file, {
            cacheControl: '3600',
            upsert: true
          });

        if (!error && data) {
          onProgress?.(85);
          const { data: publicUrlData } = supabase.storage
            .from(bucketName)
            .getPublicUrl(data.path);

          if (publicUrlData?.publicUrl) {
            onProgress?.(100);

            dataService.addMedia({
              title: `DigiSeekho ${deviceType === 'desktop' ? 'Desktop' : 'Mobile'} Homepage Banner`,
              file_url: publicUrlData.publicUrl,
              file_name: uniqueName,
              file_size: file.size,
              mime_type: file.type,
              alt_text: `DigiSeekho ${deviceType} banner`
            });

            return {
              url: publicUrlData.publicUrl,
              fileName: uniqueName,
              fileSize: file.size,
              mimeType: file.type,
              source: 'supabase'
            };
          }
        }
      } catch (err) {
        console.warn(`Bucket ${bucketName} upload attempt notice:`, err);
      }
    }
  }

  // Fallback to permanent data URL registered in DataService
  onProgress?.(70);
  const permanentUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read image file data'));
    reader.readAsDataURL(file);
  });

  onProgress?.(100);

  dataService.addMedia({
    title: `DigiSeekho ${deviceType === 'desktop' ? 'Desktop' : 'Mobile'} Homepage Banner`,
    file_url: permanentUrl,
    file_name: uniqueName,
    file_size: file.size,
    mime_type: file.type,
    alt_text: `DigiSeekho ${deviceType} banner`
  });

  return {
    url: permanentUrl,
    fileName: uniqueName,
    fileSize: file.size,
    mimeType: file.type,
    source: 'local_media'
  };
}

/**
 * Syncs an existing banner URL into Supabase Storage if Supabase is connected
 */
export async function syncExistingBannerToSupabase(bannerUrl: string): Promise<string | null> {
  const supabase = getSupabaseClient();
  if (!isSupabaseConfigured() || !supabase) {
    return null;
  }

  try {
    const response = await fetch(bannerUrl);
    if (!response.ok) return null;
    const blob = await response.blob();
    const file = new File([blob], 'digiseekho_official_banner.png', { type: blob.type || 'image/png' });
    const result = await uploadBannerImage(file, 'desktop');
    return result.url;
  } catch (err) {
    console.warn('Failed to sync existing banner to Supabase:', err);
    return null;
  }
}
