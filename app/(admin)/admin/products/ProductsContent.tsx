"use client";

import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Plus, Edit, Trash2, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminProductsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);

  const { data: productsData, isLoading, refetch } = trpc.product.getAll.useQuery({
    search: searchQuery || undefined,
    limit: 50,
  });

  const deleteProduct = trpc.product.delete.useMutation({
    onSuccess: () => {
      alert("✅ Produk berhasil dihapus!");
      refetch();
      setShowDeleteModal(null);
    },
    onError: (error) => {
      alert(`❌ Error: ${error.message}`);
    },
  });

  const toggleActive = trpc.product.toggleActive.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

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

  const products = productsData?.products || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Produk</h1>
          <p className="text-gray-600 mt-1">
            Kelola semua produk di toko Yasin
          </p>
        </div>
        <button
          onClick={() => router.push("/admin/products/create")}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
        >
          <Plus className="w-5 h-5" />
          Tambah Produk
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Cari produk..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {products.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Belum ada produk
            </h3>
            <p className="text-gray-600 mb-6">
              Mulai tambahkan produk pertama Anda
            </p>
            <button
              onClick={() => router.push("/admin/products/create")}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all"
            >
              <Plus className="w-5 h-5" />
              Tambah Produk
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                    Produk
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                    Kategori
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                    Harga
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                    Stok
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((product) => {
                  const images = product.images || [];
                  const imageUrl = images[0] || "/placeholder.png";

                  return (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-4">
                          <img
                            src={imageUrl}
                            alt={product.name}
                            className="w-16 h-16 object-contain bg-gray-100 rounded-lg"
                          />
                          <div>
                            <p className="font-semibold text-gray-900">
                              {product.name}
                            </p>
                            <p className="text-sm text-gray-500 line-clamp-1">
                              {product.slug}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-gray-700">
                          {product.category?.name || "-"}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-bold text-gray-900">
                          Rp {Number(product.price).toLocaleString("id-ID")}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`font-semibold ${
                            product.stock > 10
                              ? "text-green-600"
                              : product.stock > 0
                              ? "text-yellow-600"
                              : "text-red-600"
                          }`}
                        >
                          {product.stock}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <button
                          onClick={() =>
                            toggleActive.mutate({ productId: product.id })
                          }
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            product.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {product.isActive ? "Aktif" : "Nonaktif"}
                        </button>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() =>
                              router.push(`/admin/products/edit/${product.id}`)
                            }
                            className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-all"
                            title="Edit"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => setShowDeleteModal(product.id)}
                            className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-all"
                            title="Hapus"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Hapus Produk?
              </h3>
              <p className="text-gray-600">
                Produk yang dihapus tidak dapat dikembalikan
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
              >
                Batal
              </button>
              <button
                onClick={() => deleteProduct.mutate({ id: showDeleteModal })}
                disabled={deleteProduct.isPending}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-xl font-semibold transition-all"
              >
                {deleteProduct.isPending ? "Menghapus..." : "Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
