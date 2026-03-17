"use client";

import { useState } from "react";
import { Camera, Loader2, X, User } from "lucide-react";
import Image from "next/image";

interface AvatarUploadProps {
  currentAvatar?: string | null;
  userName?: string | null;
  onUploadSuccess: (url: string) => void;
  onRemove?: () => void;
  size?: "sm" | "md" | "lg";
  editable?: boolean;
}

export default function AvatarUpload({
  currentAvatar,
  userName,
  onUploadSuccess,
  onRemove,
  size = "md",
  editable = true,
}: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  };

  const iconSizes = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("File harus berupa gambar");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran gambar maksimal 5MB");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to Cloudinary
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append(
        "upload_preset",
        process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "ecommerce-unsigned"
      );

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      onUploadSuccess(data.secure_url);
      setPreviewUrl(null);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Gagal mengupload gambar. Silakan coba lagi.");
      setPreviewUrl(null);
    } finally {
      setUploading(false);
    }
  };

  const displayAvatar = previewUrl || currentAvatar;
  const initials = userName
    ? userName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <div className="relative inline-block">
      {/* Avatar Display */}
      <div
        className={`${sizeClasses[size]} relative rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg ${
          editable ? "cursor-pointer group" : ""
        }`}
      >
        {displayAvatar ? (
          <img
            src={displayAvatar}
            alt={userName || "User"}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className={`${size === "sm" ? "text-lg" : size === "md" ? "text-2xl" : "text-3xl"}`}>
            {initials}
          </span>
        )}

        {/* Upload Overlay */}
        {editable && !uploading && (
          <label
            htmlFor="avatar-upload"
            className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center cursor-pointer"
          >
            <Camera className={`${iconSizes[size]} text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200`} />
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        )}

        {/* Uploading State */}
        {uploading && (
          <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
            <Loader2 className={`${iconSizes[size]} text-white animate-spin`} />
          </div>
        )}
      </div>

      {/* Remove Button */}
      {currentAvatar && onRemove && editable && !uploading && (
        <button
          onClick={onRemove}
          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors shadow-lg"
          title="Hapus foto"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {/* Upload Hint */}
      {editable && !uploading && (
        <p className="text-xs text-gray-500 text-center mt-2">
          {currentAvatar ? "Klik untuk ganti" : "Klik untuk upload"}
        </p>
      )}
    </div>
  );
}
