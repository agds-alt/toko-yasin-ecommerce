"use client";

import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, X } from "lucide-react";

export default function CreateProductPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    price: "",
    stock: "",
    categoryId: "",
  });
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const { data: categoriesData } = trpc.product.getCategories.useQuery();
  const categories = categoriesData || [];

  const createProduct = trpc.product.create.useMutation({
    onSuccess: () => {
      alert("✅ Produk berhasil ditambahkan!");
      router.push("/admin/products");
    },
    onError: (error) => {
      alert(`❌ Error: ${error.message}`);
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const uploadedUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "");

      try {
        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        const data = await response.json();
        uploadedUrls.push(data.secure_url);
      } catch (error) {
        console.error("Upload error:", error);
        alert(`❌ Gagal upload gambar: ${file.name}`);
      }
    }

    setImages([...images, ...uploadedUrls]);
    setUploading(false);
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.slug || !formData.price || !formData.stock) {
      alert("⚠️ Harap isi semua field yang wajib!");
      return;
    }

    createProduct.mutate({
      name: formData.name,
      slug: formData.slug,
      description: formData.description || undefined,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      images: images,
      categoryId: formData.categoryId || undefined,
    });
  };

  // Auto-generate slug from name
  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, ""),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push("/admin/products")}
          className="p-2 hover:bg-gray-100 rounded-lg transition-all"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tambah Produk Baru</h1>
          <p className="text-gray-600 mt-1">Tambahkan produk baru ke toko Yasin</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8">
        <div className="space-y-6">
          {/* Product Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nama Produk <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
              placeholder="Contoh: Al-Qur'an Tajwid Besar"
              required
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Slug (URL) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) =>
                setFormData({ ...formData, slug: e.target.value })
              }
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all font-mono text-sm"
              placeholder="al-quran-tajwid-besar"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              URL produk: /products/{formData.slug || "..."}
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Deskripsi
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={5}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all resize-none"
              placeholder="Deskripsi lengkap produk..."
            />
          </div>

          {/* Price & Stock */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Harga (Rp) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                placeholder="50000"
                min="0"
                step="1000"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Stok <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) =>
                  setFormData({ ...formData, stock: e.target.value })
                }
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                placeholder="100"
                min="0"
                required
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Kategori
            </label>
            <select
              value={formData.categoryId}
              onChange={(e) =>
                setFormData({ ...formData, categoryId: e.target.value })
              }
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
            >
              <option value="">Tanpa Kategori</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Gambar Produk
            </label>

            {/* Upload Button */}
            <div className="mb-4">
              <label
                htmlFor="image-upload"
                className={`inline-flex items-center gap-2 px-6 py-3 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all ${
                  uploading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <Upload className="w-5 h-5" />
                <span className="font-semibold">
                  {uploading ? "Uploading..." : "Upload Gambar"}
                </span>
              </label>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                disabled={uploading}
                className="hidden"
              />
              <p className="text-xs text-gray-500 mt-2">
                Upload beberapa gambar sekaligus (JPG, PNG, max 10MB per file)
              </p>
            </div>

            {/* Image Preview */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-40 object-cover rounded-lg border-2 border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4 border-t-2 border-gray-200">
            <button
              type="button"
              onClick={() => router.push("/admin/products")}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={createProduct.isPending || uploading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 text-white rounded-xl font-semibold transition-all"
            >
              {createProduct.isPending ? "Menyimpan..." : "Simpan Produk"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
