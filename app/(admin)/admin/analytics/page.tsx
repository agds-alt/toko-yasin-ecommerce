"use client";

import { trpc } from "@/lib/trpc";
import { useState } from "react";

// Force dynamic rendering to avoid SSR issues with recharts
export const dynamic = "force-dynamic";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, DollarSign, ShoppingCart, Package } from "lucide-react";

const COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
  "#14B8A6",
];

const STATUS_COLORS: Record<string, string> = {
  PENDING: "#F59E0B",
  PAYMENT_UPLOADED: "#3B82F6",
  CONFIRMED: "#10B981",
  PROCESSING: "#8B5CF6",
  SHIPPED: "#6366F1",
  DELIVERED: "#10B981",
  CANCELLED: "#EF4444",
};

export default function AdminAnalyticsPage() {
  const [period, setPeriod] = useState<"7days" | "30days" | "90days" | "1year">(
    "30days"
  );

  const { data, isLoading } = trpc.admin.getAnalytics.useQuery({ period });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat analytics...</p>
        </div>
      </div>
    );
  }

  const periodLabels = {
    "7days": "7 Hari Terakhir",
    "30days": "30 Hari Terakhir",
    "90days": "90 Hari Terakhir",
    "1year": "1 Tahun Terakhir",
  };

  // Prepare status pie chart data
  const statusData = data?.statusCounts?.map((item) => ({
    name: item.status,
    value: item._count,
  })) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-1">
            Analisis penjualan dan performa toko
          </p>
        </div>

        {/* Period Filter */}
        <div className="flex gap-2">
          {(["7days", "30days", "90days", "1year"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                period === p
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {periodLabels[p]}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-100 p-3 rounded-xl">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-sm text-gray-600 font-semibold">Total Revenue</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            Rp {(data?.totalRevenue || 0).toLocaleString("id-ID")}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 p-3 rounded-xl">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 font-semibold">Total Pesanan</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {data?.totalOrders || 0}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-100 p-3 rounded-xl">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 font-semibold">Rata-rata Order</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            Rp{" "}
            {data?.totalOrders
              ? Math.round(
                  (data?.totalRevenue || 0) / data.totalOrders
                ).toLocaleString("id-ID")
              : 0}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-yellow-100 p-3 rounded-xl">
              <Package className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 font-semibold">Top Products</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {data?.topProducts?.length || 0}
          </p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            Revenue Harian
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data?.chartData || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.getDate()}/${date.getMonth() + 1}`;
                }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value: any) =>
                  `Rp ${Number(value).toLocaleString("id-ID")}`
                }
                labelFormatter={(label) => {
                  const date = new Date(label);
                  return date.toLocaleDateString("id-ID");
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#10B981"
                strokeWidth={2}
                name="Revenue"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Orders Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            Pesanan Harian
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data?.chartData || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.getDate()}/${date.getMonth() + 1}`;
                }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                labelFormatter={(label) => {
                  const date = new Date(label);
                  return date.toLocaleDateString("id-ID");
                }}
              />
              <Legend />
              <Bar dataKey="orders" fill="#3B82F6" name="Pesanan" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            Status Pesanan
          </h3>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={STATUS_COLORS[entry.name] || COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              Tidak ada data
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            Produk Terlaris
          </h3>
          {data?.topProducts && data.topProducts.length > 0 ? (
            <div className="space-y-4">
              {data.topProducts.map((product, index) => (
                <div
                  key={product.productId}
                  className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl"
                >
                  <div className="text-2xl font-bold text-gray-400 w-8">
                    #{index + 1}
                  </div>
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-16 h-16 object-contain bg-white rounded-lg"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      {product.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {product.quantitySold} unit terjual
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">
                      {product.orderCount} order
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              Tidak ada data
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
