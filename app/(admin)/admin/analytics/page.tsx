"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  BarChart3,
  PieChart,
  Calendar,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPie,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { QohiraLoadingInline } from "@/app/_components/QohiraLoading";

// Force dynamic rendering
export const dynamic = "force-dynamic";

const COLORS = {
  primary: "#3B82F6",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  purple: "#8B5CF6",
  pink: "#EC4899",
  indigo: "#6366F1",
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: COLORS.warning,
  PAYMENT_UPLOADED: "#60A5FA",
  CONFIRMED: COLORS.success,
  PROCESSING: COLORS.purple,
  SHIPPED: COLORS.indigo,
  DELIVERED: "#059669",
  CANCELLED: COLORS.danger,
};

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<"7days" | "30days" | "90days" | "1year">("30days");

  const { data: analytics, isLoading } = trpc.admin.getAnalytics.useQuery({ period });
  const { data: stats } = trpc.admin.getStats.useQuery();

  if (isLoading) {
    return <QohiraLoadingInline message="Memuat analytics data..." minHeight="600px" />;
  }

  const periodLabels = {
    "7days": "7 Hari Terakhir",
    "30days": "30 Hari Terakhir",
    "90days": "90 Hari Terakhir",
    "1year": "1 Tahun Terakhir",
  };

  // Format chart data
  const chartData = analytics?.chartData.map((item) => ({
    ...item,
    date: new Date(item.date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
    }),
    revenue: item.revenue,
  })) || [];

  // Status distribution for pie chart
  const statusData = analytics?.statusCounts.map((item) => ({
    name: item.status,
    value: item._count,
  })) || [];

  // Calculate metrics
  const totalRevenue = analytics?.chartData.reduce((sum, item) => sum + item.revenue, 0) || 0;
  const totalOrders = analytics?.chartData.reduce((sum, item) => sum + item.orders, 0) || 0;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Calculate growth (compare first week vs last week)
  const weekData = chartData.slice(-7);
  const previousWeekData = chartData.slice(-14, -7);
  const currentWeekRevenue = weekData.reduce((sum, item) => sum + item.revenue, 0);
  const previousWeekRevenue = previousWeekData.reduce((sum, item) => sum + item.revenue, 0);
  const revenueGrowth = previousWeekRevenue > 0
    ? ((currentWeekRevenue - previousWeekRevenue) / previousWeekRevenue) * 100
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-1">
            Analisis performa bisnis Qohira
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex items-center gap-2 bg-white rounded-xl shadow-md p-1">
          {(["7days", "30days", "90days", "1year"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                period === p
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {periodLabels[p]}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/20 p-3 rounded-xl">
              <DollarSign className="w-6 h-6" />
            </div>
            <div className={`text-xs font-bold px-3 py-1 rounded-full ${
              revenueGrowth >= 0 ? "bg-green-500" : "bg-red-500"
            }`}>
              {revenueGrowth >= 0 ? "+" : ""}{revenueGrowth.toFixed(1)}%
            </div>
          </div>
          <h3 className="text-sm font-semibold opacity-90 mb-1">Total Revenue</h3>
          <p className="text-3xl font-bold">
            Rp {totalRevenue.toLocaleString("id-ID")}
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/20 p-3 rounded-xl">
              <ShoppingCart className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-sm font-semibold opacity-90 mb-1">Total Orders</h3>
          <p className="text-3xl font-bold">{totalOrders}</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/20 p-3 rounded-xl">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-sm font-semibold opacity-90 mb-1">Avg Order Value</h3>
          <p className="text-3xl font-bold">
            Rp {avgOrderValue.toLocaleString("id-ID", { maximumFractionDigits: 0 })}
          </p>
        </div>

        <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl shadow-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/20 p-3 rounded-xl">
              <Package className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-sm font-semibold opacity-90 mb-1">Total Products</h3>
          <p className="text-3xl font-bold">{stats?.totalProducts || 0}</p>
        </div>
      </div>

      {/* Revenue & Orders Chart */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-100 p-3 rounded-xl">
            <BarChart3 className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Revenue & Orders Trend</h2>
            <p className="text-sm text-gray-600">Perkembangan revenue dan pesanan</p>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              dataKey="date"
              stroke="#6B7280"
              style={{ fontSize: "12px" }}
            />
            <YAxis
              yAxisId="left"
              stroke="#6B7280"
              style={{ fontSize: "12px" }}
              tickFormatter={(value) => `Rp ${(value / 1000).toFixed(0)}k`}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#6B7280"
              style={{ fontSize: "12px" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #E5E7EB",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
              formatter={(value: number, name: string) => {
                if (name === "revenue") {
                  return [`Rp ${value.toLocaleString("id-ID")}`, "Revenue"];
                }
                return [value, "Orders"];
              }}
            />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="revenue"
              stroke={COLORS.primary}
              strokeWidth={3}
              dot={{ fill: COLORS.primary, r: 4 }}
              activeDot={{ r: 6 }}
              name="Revenue"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="orders"
              stroke={COLORS.success}
              strokeWidth={3}
              dot={{ fill: COLORS.success, r: 4 }}
              activeDot={{ r: 6 }}
              name="Orders"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Status Distribution */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-purple-100 p-3 rounded-xl">
              <PieChart className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Order Status</h2>
              <p className="text-sm text-gray-600">Distribusi status pesanan</p>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <RechartsPie>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell
                    key={`status-cell-${entry.name}-${index}`}
                    fill={STATUS_COLORS[entry.name] || COLORS.primary}
                  />
                ))}
              </Pie>
              <Tooltip />
            </RechartsPie>
          </ResponsiveContainer>
        </div>

        {/* Top Selling Products */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-green-100 p-3 rounded-xl">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Top Products</h2>
              <p className="text-sm text-gray-600">Produk terlaris</p>
            </div>
          </div>

          <div className="space-y-4">
            {analytics?.topProducts.map((product, index) => (
              <div
                key={`product-${product.id}-${index}`}
                className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full text-white font-bold">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {product.category?.name || "Uncategorized"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">
                    {product.totalSold}
                  </p>
                  <p className="text-xs text-gray-600">terjual</p>
                </div>
              </div>
            ))}

            {(!analytics?.topProducts || analytics.topProducts.length === 0) && (
              <div className="text-center py-12 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>Belum ada data penjualan produk</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
