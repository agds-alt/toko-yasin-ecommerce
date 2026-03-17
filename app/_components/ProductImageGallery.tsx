"use client";

import { useState, useRef, MouseEvent } from "react";
import { X, ZoomIn, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
}

export default function ProductImageGallery({
  images,
  productName,
}: ProductImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLDivElement>(null);

  // Fallback to placeholder if no images
  const displayImages = images.length > 0 ? images : ["/placeholder.png"];
  const currentImage = displayImages[selectedIndex];

  // Handle mouse move for zoom effect
  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current || !isZoomed) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setMousePosition({ x, y });
  };

  // Navigate images in modal
  const nextImage = () => {
    setSelectedIndex((prev) => (prev + 1) % displayImages.length);
  };

  const prevImage = () => {
    setSelectedIndex((prev) =>
      prev === 0 ? displayImages.length - 1 : prev - 1
    );
  };

  // Keyboard navigation
  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isModalOpen) return;
    if (e.key === "ArrowRight") nextImage();
    if (e.key === "ArrowLeft") prevImage();
    if (e.key === "Escape") setIsModalOpen(false);
  };

  // Add keyboard listener
  useState(() => {
    if (typeof window !== "undefined") {
      window.addEventListener("keydown", handleKeyDown as any);
      return () => window.removeEventListener("keydown", handleKeyDown as any);
    }
  });

  return (
    <>
      <div className="flex flex-col md:flex-row gap-4">
        {/* Thumbnail List - Vertical on desktop, horizontal on mobile */}
        <div className="order-2 md:order-1 flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto max-h-[500px] scrollbar-hide">
          {displayImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={`flex-shrink-0 w-20 h-20 rounded-lg border-2 overflow-hidden transition-all duration-200 ${
                selectedIndex === index
                  ? "border-orange-500 ring-2 ring-orange-200 scale-105"
                  : "border-gray-200 hover:border-orange-300"
              }`}
            >
              <img
                src={image}
                alt={`${productName} thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>

        {/* Main Image with Inline Zoom */}
        <div className="order-1 md:order-2 flex-1 relative">
          <div
            ref={imageRef}
            className="relative bg-gray-50 rounded-2xl overflow-hidden border-2 border-gray-100 aspect-square max-h-[500px] cursor-zoom-in group"
            onMouseEnter={() => setIsZoomed(true)}
            onMouseLeave={() => setIsZoomed(false)}
            onMouseMove={handleMouseMove}
            onClick={() => setIsModalOpen(true)}
          >
            {/* Main Image */}
            <img
              src={currentImage}
              alt={`${productName} - Image ${selectedIndex + 1}`}
              className={`w-full h-full object-contain transition-transform duration-200 ${
                isZoomed ? "scale-150" : "scale-100"
              }`}
              style={
                isZoomed
                  ? {
                      transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`,
                    }
                  : {}
              }
            />

            {/* Zoom Indicator */}
            <div
              className={`absolute top-4 right-4 bg-black/70 text-white px-3 py-2 rounded-lg flex items-center gap-2 transition-opacity duration-200 ${
                isZoomed ? "opacity-0" : "opacity-100 group-hover:opacity-100"
              }`}
            >
              <ZoomIn className="w-4 h-4" />
              <span className="text-sm font-medium hidden sm:inline">
                Hover to zoom
              </span>
            </div>

            {/* Click to fullscreen hint */}
            <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-2 rounded-lg text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 hidden md:block">
              Click for fullscreen
            </div>

            {/* Image counter */}
            {displayImages.length > 1 && (
              <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1.5 rounded-full text-sm font-medium">
                {selectedIndex + 1} / {displayImages.length}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fullscreen Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4">
          {/* Close Button */}
          <button
            onClick={() => setIsModalOpen(false)}
            className="absolute top-4 right-4 z-10 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-all duration-200"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Image Counter */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/10 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
            {selectedIndex + 1} / {displayImages.length}
          </div>

          {/* Previous Button */}
          {displayImages.length > 1 && (
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-all duration-200 z-10"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Next Button */}
          {displayImages.length > 1 && (
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-all duration-200 z-10"
              aria-label="Next image"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          {/* Main Modal Image */}
          <div className="relative max-w-5xl max-h-[90vh] w-full h-full flex items-center justify-center">
            <img
              src={currentImage}
              alt={`${productName} - Fullscreen ${selectedIndex + 1}`}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>

          {/* Thumbnail Navigation at Bottom */}
          {displayImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 max-w-full overflow-x-auto px-4 py-2 bg-black/30 rounded-full backdrop-blur-sm scrollbar-hide">
              {displayImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedIndex(index)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg border-2 overflow-hidden transition-all duration-200 ${
                    selectedIndex === index
                      ? "border-white ring-2 ring-white/50 scale-110"
                      : "border-white/30 hover:border-white/60 opacity-70 hover:opacity-100"
                  }`}
                >
                  <img
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Instructions */}
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 text-white/60 text-sm hidden md:block">
            Use arrow keys to navigate • ESC to close
          </div>
        </div>
      )}

      {/* Custom scrollbar hide */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </>
  );
}
