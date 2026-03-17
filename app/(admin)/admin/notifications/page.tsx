"use client";

import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Bell, Send, Users, CheckCircle, XCircle, Loader } from "lucide-react";

// Force dynamic rendering
export const dynamic = "force-dynamic";

export default function AdminNotificationsPage() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [url, setUrl] = useState("/");
  const [icon, setIcon] = useState("/icons/icon-192x192.png");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ success: number; failed: number } | null>(null);

  // Get all subscriptions count
  const { data: statsData } = trpc.admin.getStats.useQuery();
  const totalSubscriptions = statsData?.totalUsers || 0; // Approximation

  const sendNotification = trpc.notification.send.useMutation({
    onSuccess: (data) => {
      setSending(false);
      setResult(data);
      // Clear form
      setTitle("");
      setBody("");
      setUrl("/");
    },
    onError: (error) => {
      setSending(false);
      alert(`Error: ${error.message}`);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !body.trim()) {
      alert("Title dan Body harus diisi!");
      return;
    }

    setSending(true);
    setResult(null);

    sendNotification.mutate({
      title: title.trim(),
      body: body.trim(),
      url: url || "/",
      icon: icon || "/icons/icon-192x192.png",
    });
  };

  const sendTestNotification = () => {
    setTitle("🔔 Test Notification");
    setBody("Ini adalah test notification dari Toko Buku Abdul. Jika Anda menerima ini, berarti push notifications berfungsi dengan baik!");
    setUrl("/");
    setIcon("/icons/icon-192x192.png");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Bell className="w-8 h-8 text-blue-600" />
          Push Notifications
        </h1>
        <p className="text-gray-600 mt-1">
          Kirim notifikasi push ke semua pengguna yang telah mengaktifkan notifikasi
        </p>
      </div>

      {/* Stats Card */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl shadow-md p-6 border-2 border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 font-semibold">Active Subscriptions</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              ~{totalSubscriptions}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Estimated dari total users
            </p>
          </div>
          <div className="bg-blue-100 p-4 rounded-xl">
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Send Notification Form */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Send className="w-5 h-5 text-blue-600" />
          Send Notification
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Quick Test Button */}
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-gray-700 mb-2">
              🧪 Quick Test
            </p>
            <button
              type="button"
              onClick={sendTestNotification}
              className="text-sm bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-4 py-2 rounded-lg transition-all"
            >
              Load Test Notification
            </button>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Notification Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Promo Spesial Hari Ini!"
              className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
              required
              maxLength={50}
            />
            <p className="text-xs text-gray-500 mt-1">{title.length}/50 characters</p>
          </div>

          {/* Body */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Notification Body *
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="e.g., Dapatkan diskon 20% untuk semua produk hari ini!"
              className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none resize-none transition-all"
              rows={4}
              required
              maxLength={150}
            />
            <p className="text-xs text-gray-500 mt-1">{body.length}/150 characters</p>
          </div>

          {/* URL */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Click URL (Optional)
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="/products atau /cart"
              className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
            />
            <p className="text-xs text-gray-500 mt-1">
              URL yang akan dibuka saat notifikasi diklik
            </p>
          </div>

          {/* Icon */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Icon URL (Optional)
            </label>
            <input
              type="text"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="/icons/icon-192x192.png"
              className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
            />
            <p className="text-xs text-gray-500 mt-1">
              Path ke icon yang akan ditampilkan di notifikasi
            </p>
          </div>

          {/* Preview */}
          {(title || body) && (
            <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-gray-700 mb-3">📱 Preview</p>
              <div className="bg-white rounded-lg p-4 shadow-md border border-gray-300">
                <div className="flex items-start gap-3">
                  {icon && (
                    <img
                      src={icon}
                      alt="Icon"
                      className="w-10 h-10 rounded-lg"
                      onError={(e) => {
                        e.currentTarget.src = "/icons/icon-192x192.png";
                      }}
                    />
                  )}
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 text-sm">
                      {title || "Notification Title"}
                    </p>
                    <p className="text-gray-600 text-sm mt-1">
                      {body || "Notification body text..."}
                    </p>
                    {url && url !== "/" && (
                      <p className="text-xs text-blue-600 mt-2">→ {url}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-600 mt-1" />
                <div className="flex-1">
                  <p className="font-bold text-gray-900">Notification Sent!</p>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-700">
                        <strong>{result.success}</strong> sent
                      </span>
                    </div>
                    {result.failed > 0 && (
                      <div className="flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-red-600" />
                        <span className="text-sm text-gray-700">
                          <strong>{result.failed}</strong> failed
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={sending || !title.trim() || !body.trim()}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {sending ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Send to All Users
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
        <p className="text-sm text-gray-700">
          <strong>ℹ️ Info:</strong> Notifikasi akan dikirim ke semua pengguna yang telah
          mengaktifkan push notifications. Pengguna harus memberikan izin notifikasi di
          browser mereka terlebih dahulu.
        </p>
      </div>

      {/* Testing Guide Link */}
      <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4">
        <p className="text-sm text-gray-700 mb-2">
          <strong>📚 Testing Guide:</strong>
        </p>
        <p className="text-xs text-gray-600">
          Lihat file <code className="bg-purple-100 px-2 py-1 rounded">PUSH_NOTIFICATION_TESTING.md</code> untuk
          panduan lengkap testing push notifications.
        </p>
      </div>
    </div>
  );
}
