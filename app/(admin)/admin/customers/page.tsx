"use client";

import { trpc } from "@/lib/trpc";
import { Users, Mail, Phone, ShoppingBag, DollarSign } from "lucide-react";

// Force dynamic rendering to avoid SSR issues
export const dynamic = "force-dynamic";

export default function AdminCustomersPage() {
  const { data, isLoading } = trpc.admin.getCustomers.useQuery({
    limit: 50,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data pelanggan...</p>
        </div>
      </div>
    );
  }

  const customers = data?.customers || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Pelanggan</h1>
        <p className="text-gray-600 mt-1">
          Kelola data pelanggan Qahira
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-semibold">
                Total Pelanggan
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {customers.length}
              </p>
            </div>
            <div className="bg-blue-100 p-4 rounded-xl">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-semibold">
                Total Pesanan
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {customers.reduce((sum, c) => sum + c.totalOrders, 0)}
              </p>
            </div>
            <div className="bg-purple-100 p-4 rounded-xl">
              <ShoppingBag className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-semibold">
                Total Revenue
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                Rp{" "}
                {customers
                  .reduce((sum, c) => sum + c.totalSpent, 0)
                  .toLocaleString("id-ID")}
              </p>
            </div>
            <div className="bg-green-100 p-4 rounded-xl">
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {customers.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Belum ada pelanggan
            </h3>
            <p className="text-gray-600">
              Pelanggan akan muncul di sini setelah mereka mendaftar
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                    Pelanggan
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                    Kontak
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                    Role
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                    Total Pesanan
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                    Total Belanja
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                    Bergabung
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                          {customer.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {customer.name}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="w-4 h-4" />
                          {customer.email}
                        </div>
                        {customer.phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="w-4 h-4" />
                            {customer.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          customer.role === "ADMIN"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {customer.role}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4 text-gray-400" />
                        <span className="font-semibold text-gray-900">
                          {customer.totalOrders}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-bold text-green-600">
                        Rp {customer.totalSpent.toLocaleString("id-ID")}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">
                      {new Date(customer.createdAt).toLocaleDateString(
                        "id-ID",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        }
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
