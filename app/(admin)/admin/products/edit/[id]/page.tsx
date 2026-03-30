"use client";

import { trpc } from "@/lib/trpc";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Upload, X } from "lucide-react";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    price: "",
    stock: "",
    weight: "",
    categoryId: "",
    isActive: true,
  });
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [hasVariants, setHasVariants] = useState(false);
  const [variants, setVariants] = useState<{ name: string; values: string[] }[]>([]);

  const { data: product, isLoading } = trpc.product.getById.useQuery(
    { id: productId },
    { enabled: !!productId }
  );

  const { data: categoriesData } = trpc.product.getCategories.useQuery();
  const categories = categoriesData || [];

  const updateProduct = trpc.product.update.useMutation({
    onSuccess: () => {
      // Update variants
      updateVariantsMutation.mutate({
        productId: productId,
        hasVariants: hasVariants,
        variants: variants.filter(v => v.name && v.values.length > 0),
      });
    },
    onError: (error) => {
      alert(`❌ Error: ${error.message}`);
    },
  });

  const updateVariantsMutation = trpc.product.updateVariants.useMutation({
    onSuccess: () => {
      alert("✅ Produk berhasil diupdate!");
      router.push("/admin/products");
    },
    onError: (error) => {
      alert(`❌ Error saat update varian: ${error.message}`);
    },
  });

  // Load product data when available
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        slug: product.slug,
        description: product.description || "",
        price: product.price.toString(),
        stock: product.stock.toString(),
        weight: product.weight ? product.weight.toString() : "",
        categoryId: product.categoryId || "",
        isActive: product.isActive,
      });
      setImages(product.images || []);
      setHasVariants(product.hasVariants || false);
      setVariants(product.variants || []);
    }
  }, [product]);

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

    updateProduct.mutate({
      id: productId,
      name: formData.name,
      slug: formData.slug,
      description: formData.description || undefined,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      weight: formData.weight ? parseFloat(formData.weight) : undefined,
      images: images,
      categoryId: formData.categoryId || undefined,
      isActive: formData.isActive,
      hasVariants: hasVariants,
    });
  };

  const addVariant = () => {
    setVariants([...variants, { name: "", values: [] }]);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const updateVariantName = (index: number, name: string) => {
    const updated = [...variants];
    updated[index].name = name;
    setVariants(updated);
  };

  const updateVariantValues = (index: number, valuesStr: string) => {
    const updated = [...variants];
    updated[index].values = valuesStr.split(',').map(v => v.trim()).filter(v => v);
    setVariants(updated);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat produk...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">❌</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Produk Tidak Ditemukan</h2>
        <button
          onClick={() => router.push("/admin/products")}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all"
        >
          Kembali ke Daftar Produk
        </button>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold text-gray-900">Edit Produk</h1>
          <p className="text-gray-600 mt-1">Update informasi produk {product.name}</p>
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
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
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

          {/* Price, Stock & Weight */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                min="0"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Berat (kg) ⚖️
              </label>
              <input
                type="number"
                value={formData.weight}
                onChange={(e) =>
                  setFormData({ ...formData, weight: e.target.value })
                }
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                placeholder="0.5"
                min="0"
                step="0.01"
              />
              <p className="text-xs text-gray-500 mt-1">
                Untuk kalkulasi ongkir
              </p>
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

          {/* Active Status */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData({ ...formData, isActive: e.target.checked })
              }
              className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <label htmlFor="isActive" className="text-sm font-semibold text-gray-700">
              Produk Aktif (tampilkan di toko)
            </label>
          </div>

          {/* Variants */}
          <div className="border-2 border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700">
                  Varian Produk
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Tambahkan varian seperti ukuran, warna, dll (opsional)
                </p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasVariants}
                  onChange={(e) => {
                    setHasVariants(e.target.checked);
                    if (!e.target.checked) setVariants([]);
                  }}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-200"
                />
                <span className="text-sm font-semibold text-gray-700">Aktifkan Varian</span>
              </label>
            </div>

            {hasVariants && (
              <div className="space-y-4">
                {variants.map((variant, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200">
                    <div className="flex items-start gap-4">
                      <div className="flex-1 space-y-3">
                        <input
                          type="text"
                          value={variant.name}
                          onChange={(e) => updateVariantName(index, e.target.value)}
                          placeholder="Nama varian (contoh: Ukuran, Warna)"
                          className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 outline-none"
                        />
                        <input
                          type="text"
                          value={variant.values.join(', ')}
                          onChange={(e) => updateVariantValues(index, e.target.value)}
                          placeholder="Nilai (pisahkan dengan koma, contoh: S, M, L, XL)"
                          className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 outline-none"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeVariant(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addVariant}
                  className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 font-semibold hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all"
                >
                  + Tambah Varian
                </button>
              </div>
            )}
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
              disabled={updateProduct.isPending || uploading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 text-white rounded-xl font-semibold transition-all"
            >
              {updateProduct.isPending ? "Menyimpan..." : "Update Produk"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
