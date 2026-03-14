/**
 * Cloudinary Upload Utilities
 * Direct client-to-Cloudinary upload untuk menghemat bandwidth server
 */

export interface CloudinaryUploadResponse {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
}

/**
 * Upload image langsung ke Cloudinary dari client
 * Menggunakan unsigned upload preset
 */
export async function uploadToCloudinary(
  file: File,
  folder: string = "products"
): Promise<CloudinaryUploadResponse> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error("Cloudinary configuration is missing");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  formData.append("folder", folder);

  // Auto optimization parameters
  formData.append("quality", "auto");
  formData.append("fetch_format", "auto");

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error("Failed to upload image to Cloudinary");
  }

  return response.json();
}

/**
 * Generate optimized image URL dengan transformasi
 */
export function getOptimizedImageUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    quality?: "auto" | number;
    format?: "auto" | "webp" | "avif" | "jpg" | "png";
  } = {}
): string {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  if (!cloudName) {
    return publicId; // Fallback to original if no cloud name
  }

  const {
    width,
    height,
    quality = "auto",
    format = "auto",
  } = options;

  const transformations: string[] = [];

  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  transformations.push(`q_${quality}`);
  transformations.push(`f_${format}`);
  transformations.push("c_limit"); // Limit size, maintain aspect ratio

  const transformString = transformations.join(",");

  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformString}/${publicId}`;
}

/**
 * Generate responsive image srcset
 */
export function getResponsiveImageSrcSet(
  publicId: string,
  sizes: number[] = [320, 640, 768, 1024, 1280]
): string {
  return sizes
    .map((size) => {
      const url = getOptimizedImageUrl(publicId, { width: size });
      return `${url} ${size}w`;
    })
    .join(", ");
}

/**
 * Delete image from Cloudinary (requires server-side API key)
 * This should be called from API route, not client
 */
export async function deleteFromCloudinary(
  publicId: string
): Promise<boolean> {
  // This will be implemented in API route with server-side credentials
  const response = await fetch("/api/cloudinary/delete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ publicId }),
  });

  return response.ok;
}
