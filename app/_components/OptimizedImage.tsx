"use client";

import Image from "next/image";
import { useState } from "react";

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  fill?: boolean;
  objectFit?: "contain" | "cover" | "fill" | "none" | "scale-down";
}

export default function OptimizedImage({
  src,
  alt,
  className = "",
  width,
  height,
  priority = false,
  fill = false,
  objectFit = "cover",
}: OptimizedImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    setHasError(true);
    setImgSrc("/placeholder.png");
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  // Check if it's a Cloudinary URL for optimization
  const isCloudinary = imgSrc?.includes("cloudinary.com");

  // For Cloudinary images, we can use their transformation API
  const optimizedSrc = isCloudinary && !imgSrc.includes("/upload/")
    ? imgSrc.replace("/upload/", "/upload/f_auto,q_auto,w_800/")
    : imgSrc;

  if (fill) {
    return (
      <div className={`relative ${className}`}>
        {isLoading && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg" />
        )}
        <Image
          src={optimizedSrc || "/placeholder.png"}
          alt={alt}
          fill
          className={`object-${objectFit} ${isLoading ? "opacity-0" : "opacity-100"} transition-opacity duration-300`}
          onError={handleError}
          onLoad={handleLoad}
          priority={priority}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
            <span className="text-gray-400 text-sm">No Image</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div
          className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg"
          style={{ width: width || "100%", height: height || "100%" }}
        />
      )}
      <Image
        src={optimizedSrc || "/placeholder.png"}
        alt={alt}
        width={width || 400}
        height={height || 400}
        className={`${isLoading ? "opacity-0" : "opacity-100"} transition-opacity duration-300`}
        onError={handleError}
        onLoad={handleLoad}
        priority={priority}
        style={{ objectFit }}
      />
      {hasError && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg"
          style={{ width: width || "100%", height: height || "100%" }}
        >
          <span className="text-gray-400 text-sm">No Image</span>
        </div>
      )}
    </div>
  );
}
