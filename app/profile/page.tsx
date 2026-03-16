"use client";

import Navbar from "../_components/Navbar";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { User, Package, MapPin, Phone, Mail, Edit2, Save, X, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { trpc } from "@/lib/trpc";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
  });

  // Fetch user profile data
  const { data: profileData, isLoading: profileLoading, refetch } = trpc.auth.getProfile.useQuery(
    undefined,
    { enabled: !!session }
  );

  // Update profile mutation
  const updateProfile = trpc.auth.updateProfile.useMutation({
    onSuccess: () => {
      setIsEditing(false);
      refetch();
      alert("✅ Profile berhasil diupdate!");
    },
    onError: (error) => {
      alert("❌ Gagal update profile: " + error.message);
    },
  });

  // Get user orders count
  const { data: ordersData } = trpc.order.getMyOrders.useQuery(
    { limit: 50 }, // Get all orders for stats
    { enabled: !!session }
  );

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  // Set form data when profile loads
  useEffect(() => {
    if (profileData) {
      setFormData({
        name: profileData.name || "",
        phone: profileData.phone || "",
        address: profileData.address || "",
      });
    }
  }, [profileData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate(formData);
  };

  const handleCancel = () => {
    if (profileData) {
      setFormData({
        name: profileData.name || "",
        phone: profileData.phone || "",
        address: profileData.address || "",
      });
    }
    setIsEditing(false);
  };

  if (status === "loading" || profileLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 pt-8 pb-24">
          <div className="max-w-4xl mx-auto px-4">
            {/* Profile Card Skeleton */}
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 animate-pulse">
              <div className="flex items-center gap-6 mb-6">
                <div className="w-24 h-24 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-64"></div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-12 bg-gray-200 rounded"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
              </div>
            </div>

            {/* Stats Skeleton */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white rounded-2xl shadow-sm p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-10 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="bg-white rounded-2xl shadow-sm p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-10 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!session || !profileData) {
    return null;
  }

  const orders = ordersData?.orders || [];
  const totalOrders = orders.length;
  const totalSpent = orders.reduce((sum, order) => sum + Number(order.totalAmount), 0);

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-50 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2" style={{
              color: 'var(--gray-900)',
              fontFamily: 'Urbanist'
            }}>
              Profil Saya
            </h1>
            <p className="text-sm sm:text-base" style={{color: 'var(--gray-60)'}}>
              Kelola informasi akun Anda
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border" style={{borderColor: 'var(--gray-30)'}}>
                {/* Profile Picture */}
                <div className="text-center mb-6">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl sm:text-3xl font-bold" style={{backgroundColor: 'var(--primary)'}}>
                    {profileData.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold mb-1 truncate px-2" style={{color: 'var(--gray-900)'}}>
                    {profileData.name}
                  </h3>
                  <p className="text-xs sm:text-sm truncate px-2" style={{color: 'var(--gray-60)'}}>
                    {profileData.email}
                  </p>
                  <div className="mt-3 inline-block px-3 py-1 rounded-full text-xs font-semibold" style={{
                    backgroundColor: 'var(--primary-light)',
                    color: 'var(--primary)'
                  }}>
                    {profileData.role === 'ADMIN' ? 'Admin' : 'Customer'}
                  </div>
                </div>

                {/* Menu Items */}
                <div className="space-y-2">
                  <button className="w-full flex items-center gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-left transition-colors" style={{
                    backgroundColor: 'var(--primary-light)',
                    color: 'var(--primary)'
                  }}>
                    <User className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <span className="font-medium text-sm sm:text-base">Informasi Akun</span>
                  </button>

                  <button
                    onClick={() => router.push('/orders')}
                    className="w-full flex items-center gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-left transition-colors hover:bg-gray-50"
                    style={{color: 'var(--gray-60)'}}
                  >
                    <Package className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <span className="font-medium text-sm sm:text-base">Pesanan Saya</span>
                  </button>

                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="w-full flex items-center gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-left transition-colors hover:bg-red-50"
                    style={{color: 'var(--accent-red)'}}
                  >
                    <LogOut className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <span className="font-medium text-sm sm:text-base">Keluar</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              {/* Profile Information */}
              <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border" style={{borderColor: 'var(--gray-30)'}}>
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-xl font-bold" style={{color: 'var(--gray-900)'}}>
                    Informasi Pribadi
                  </h2>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full text-sm font-medium transition-all hover:opacity-90"
                      style={{backgroundColor: 'var(--primary)', color: 'white'}}
                    >
                      <Edit2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Edit</span>
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={handleCancel}
                        className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full text-sm font-medium transition-all hover:bg-gray-100"
                        style={{color: 'var(--gray-60)', border: '1px solid var(--gray-30)'}}
                      >
                        <X className="w-4 h-4" />
                        <span className="hidden sm:inline">Batal</span>
                      </button>
                      <button
                        onClick={handleSubmit}
                        disabled={updateProfile.isPending}
                        className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full text-sm font-medium transition-all hover:opacity-90 disabled:opacity-50"
                        style={{backgroundColor: 'var(--accent-green)', color: 'white'}}
                      >
                        {updateProfile.isPending ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span className="hidden sm:inline">Menyimpan...</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            <span className="hidden sm:inline">Simpan</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                  {/* Name */}
                  <div>
                    <label className="flex items-center gap-2 text-xs sm:text-sm font-medium mb-2" style={{color: 'var(--gray-900)'}}>
                      <User className="w-4 h-4" />
                      Nama Lengkap
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg text-sm sm:text-base transition-all"
                      style={{
                        borderColor: 'var(--gray-30)',
                        color: isEditing ? 'var(--gray-900)' : 'var(--gray-60)',
                        backgroundColor: isEditing ? 'white' : 'var(--gray-10)'
                      }}
                      placeholder="Nama lengkap Anda"
                    />
                  </div>

                  {/* Email (Read-only) */}
                  <div>
                    <label className="flex items-center gap-2 text-xs sm:text-sm font-medium mb-2" style={{color: 'var(--gray-900)'}}>
                      <Mail className="w-4 h-4" />
                      Email
                    </label>
                    <input
                      type="email"
                      value={profileData.email}
                      disabled
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg text-sm sm:text-base"
                      style={{borderColor: 'var(--gray-30)', color: 'var(--gray-60)', backgroundColor: 'var(--gray-10)'}}
                    />
                    <p className="text-xs mt-1" style={{color: 'var(--gray-60)'}}>
                      Email tidak dapat diubah
                    </p>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="flex items-center gap-2 text-xs sm:text-sm font-medium mb-2" style={{color: 'var(--gray-900)'}}>
                      <Phone className="w-4 h-4" />
                      Nomor Telepon
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg text-sm sm:text-base transition-all"
                      style={{
                        borderColor: 'var(--gray-30)',
                        color: isEditing ? 'var(--gray-900)' : 'var(--gray-60)',
                        backgroundColor: isEditing ? 'white' : 'var(--gray-10)'
                      }}
                      placeholder="08123456789"
                    />
                  </div>

                  {/* Address */}
                  <div>
                    <label className="flex items-center gap-2 text-xs sm:text-sm font-medium mb-2" style={{color: 'var(--gray-900)'}}>
                      <MapPin className="w-4 h-4" />
                      Alamat
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      disabled={!isEditing}
                      rows={3}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg text-sm sm:text-base transition-all resize-none"
                      style={{
                        borderColor: 'var(--gray-30)',
                        color: isEditing ? 'var(--gray-900)' : 'var(--gray-60)',
                        backgroundColor: isEditing ? 'white' : 'var(--gray-10)'
                      }}
                      placeholder="Jl. Contoh No. 123, Jakarta"
                    />
                  </div>
                </form>
              </div>

              {/* Account Statistics */}
              <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border" style={{borderColor: 'var(--gray-30)'}}>
                <h2 className="text-lg sm:text-xl font-bold mb-4" style={{color: 'var(--gray-900)'}}>
                  Statistik Akun
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div className="text-center p-3 sm:p-4 rounded-lg" style={{backgroundColor: 'var(--gray-10)'}}>
                    <p className="text-xl sm:text-2xl font-bold mb-1" style={{color: 'var(--primary)'}}>
                      {totalOrders}
                    </p>
                    <p className="text-xs sm:text-sm" style={{color: 'var(--gray-60)'}}>Total Pesanan</p>
                  </div>
                  <div className="text-center p-3 sm:p-4 rounded-lg" style={{backgroundColor: 'var(--gray-10)'}}>
                    <p className="text-xl sm:text-2xl font-bold mb-1" style={{color: 'var(--primary)'}}>
                      Rp {totalSpent.toLocaleString('id-ID')}
                    </p>
                    <p className="text-xs sm:text-sm" style={{color: 'var(--gray-60)'}}>Total Belanja</p>
                  </div>
                  <div className="text-center p-3 sm:p-4 rounded-lg col-span-2 sm:col-span-1" style={{backgroundColor: 'var(--gray-10)'}}>
                    <p className="text-xl sm:text-2xl font-bold mb-1" style={{color: 'var(--primary)'}}>
                      {new Date(profileData.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'short' })}
                    </p>
                    <p className="text-xs sm:text-sm" style={{color: 'var(--gray-60)'}}>Bergabung Sejak</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
