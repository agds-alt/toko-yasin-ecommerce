"use client";

import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Mail, User, Phone, MapPin, Save, AlertCircle, CheckCircle } from "lucide-react";

export default function AdminSettingsPage() {
  const { data: profile, isLoading, refetch } = trpc.auth.getProfile.useQuery();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Initialize form when profile loads
  useState(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        email: profile.email || "",
        phone: profile.phone || "",
        address: profile.address || "",
      });
    }
  });

  const updateProfile = trpc.auth.updateProfile.useMutation({
    onSuccess: () => {
      refetch();
      setIsEditing(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    },
    onError: (error) => {
      alert(`Error: ${error.message}`);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const updates: any = {};
    if (formData.name !== profile?.name) updates.name = formData.name;
    if (formData.email !== profile?.email) updates.email = formData.email;
    if (formData.phone !== profile?.phone) updates.phone = formData.phone;
    if (formData.address !== profile?.address) updates.address = formData.address;

    if (Object.keys(updates).length === 0) {
      setIsEditing(false);
      return;
    }

    await updateProfile.mutateAsync(updates);
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        email: profile.email || "",
        phone: profile.phone || "",
        address: profile.address || "",
      });
    }
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat pengaturan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
        <h1 className="text-3xl font-bold mb-2">Pengaturan Admin</h1>
        <p className="text-blue-100">
          Kelola informasi profil dan pengaturan notifikasi email
        </p>
      </div>

      {/* Success Alert */}
      {showSuccess && (
        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 flex items-center gap-3 animate-fade-in">
          <CheckCircle className="w-6 h-6 text-green-600" />
          <div>
            <p className="font-semibold text-green-900">Berhasil!</p>
            <p className="text-sm text-green-700">Pengaturan berhasil diperbarui</p>
          </div>
        </div>
      )}

      {/* Email Notification Info */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">
              📧 Email Notifikasi Admin
            </h3>
            <p className="text-sm text-blue-700 leading-relaxed">
              Email di bawah ini akan digunakan untuk menerima notifikasi pesanan baru dari customer.
              Pastikan email ini aktif dan dapat menerima email.
            </p>
            {profile?.email && (
              <div className="mt-3 bg-white rounded-lg p-3 border border-blue-200">
                <p className="text-xs text-blue-600 font-semibold mb-1">Email Notifikasi Aktif:</p>
                <p className="text-sm font-mono text-blue-900">{profile.email}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Informasi Profil</h2>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Edit Profil
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-2" />
              Nama Lengkap
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={!isEditing}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors"
              required
            />
          </div>

          {/* Email - IMPORTANT for notifications */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Mail className="w-4 h-4 inline mr-2" />
              Email <span className="text-blue-600">(Untuk Notifikasi)</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={!isEditing}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors"
              required
            />
            <p className="text-xs text-gray-500 mt-2">
              ⚠️ Email ini akan menerima notifikasi setiap ada pesanan baru
            </p>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Phone className="w-4 h-4 inline mr-2" />
              Nomor Telepon
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              disabled={!isEditing}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors"
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-2" />
              Alamat Toko
            </label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              disabled={!isEditing}
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none disabled:bg-gray-50 disabled:cursor-not-allowed resize-none transition-colors"
            />
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex gap-3 pt-4 border-t-2 border-gray-100">
              <button
                type="submit"
                disabled={updateProfile.isPending}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:opacity-90 disabled:opacity-50 font-semibold transition-all flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                {updateProfile.isPending ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-all"
              >
                Batal
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Additional Info */}
      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
        <h3 className="font-semibold text-yellow-900 mb-2">
          💡 Tips Pengaturan Email
        </h3>
        <ul className="text-sm text-yellow-800 space-y-2">
          <li>• Gunakan email yang aktif dan sering Anda cek</li>
          <li>• Pastikan email tidak memblokir email dari domain resend.dev</li>
          <li>• Periksa folder spam jika email tidak masuk ke inbox</li>
          <li>• Email ini juga akan menerima notifikasi verifikasi pembayaran</li>
        </ul>
      </div>

      {/* Role Info */}
      <div className="bg-gray-50 rounded-xl p-4 text-center">
        <p className="text-sm text-gray-600">
          Role: <span className="font-bold text-purple-600">ADMIN</span>
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Akun terdaftar sejak {new Date(profile?.createdAt || "").toLocaleDateString("id-ID")}
        </p>
      </div>
    </div>
  );
}
