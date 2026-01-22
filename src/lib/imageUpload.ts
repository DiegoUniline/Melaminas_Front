import { supabase } from "@/integrations/supabase/client";

/**
 * Uploads a base64 image to Cloudinary via edge function
 * @param base64Image - The base64 encoded image (with or without data URL prefix)
 * @param fileName - Optional filename for the image
 * @returns The URL of the uploaded image, or null if upload failed
 */
export async function uploadImageToCloudinary(
  base64Image: string,
  fileName?: string
): Promise<string | null> {
  try {
    // Ensure we have the full data URL format
    let imageData = base64Image;
    if (!base64Image.startsWith('data:')) {
      imageData = `data:image/jpeg;base64,${base64Image}`;
    }

    console.log('[uploadImageToCloudinary] Uploading image, size:', imageData.length);

    const { data, error } = await supabase.functions.invoke('upload-image', {
      body: { 
        base64Image: imageData,
        fileName: fileName || `cotizacion-${Date.now()}`
      }
    });

    if (error) {
      console.error('[uploadImageToCloudinary] Edge function error:', error);
      return null;
    }

    if (data?.url) {
      console.log('[uploadImageToCloudinary] Success:', data.url);
      return data.url;
    }

    console.error('[uploadImageToCloudinary] No URL in response:', data);
    return null;
  } catch (error) {
    console.error('[uploadImageToCloudinary] Error:', error);
    return null;
  }
}
