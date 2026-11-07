import { getSupabaseClient, isSupabaseConfigured } from './supabase';
import { dataService } from './dataService';

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
