"use client";

import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";

export default function PushNotificationManager() {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const subscribeMutation = trpc.notification.subscribe.useMutation();
  const unsubscribeMutation = trpc.notification.unsubscribe.useMutation();

  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission);
      checkSubscription();
    }
  }, []);

  const checkSubscription = async () => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (error) {
      console.error("Error checking subscription:", error);
    }
  };

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const subscribeToPush = async () => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      alert("Push notifications tidak didukung di browser ini");
      return;
    }

    setIsLoading(true);

    try {
      // Request notification permission
      const permissionResult = await Notification.requestPermission();
      setPermission(permissionResult);

      if (permissionResult !== "granted") {
        alert("Permission untuk notifikasi ditolak");
        setIsLoading(false);
        return;
      }

      // Get service worker registration
      const registration = await navigator.serviceWorker.ready;

      // Subscribe to push notifications
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        throw new Error("VAPID public key not found");
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      // Send subscription to server
      const subscriptionJson = subscription.toJSON();
      await subscribeMutation.mutateAsync({
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscriptionJson.keys!.p256dh!,
          auth: subscriptionJson.keys!.auth!,
        },
        userAgent: navigator.userAgent,
      });

      setIsSubscribed(true);
      alert("Berhasil subscribe ke notifikasi!");
    } catch (error) {
      console.error("Error subscribing to push:", error);
      alert("Gagal subscribe ke notifikasi");
    } finally {
      setIsLoading(false);
    }
  };

  const unsubscribeFromPush = async () => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      return;
    }

    setIsLoading(true);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        // Unsubscribe from push
        await subscription.unsubscribe();

        // Remove from server
        await unsubscribeMutation.mutateAsync({
          endpoint: subscription.endpoint,
        });

        setIsSubscribed(false);
        alert("Berhasil unsubscribe dari notifikasi");
      }
    } catch (error) {
      console.error("Error unsubscribing from push:", error);
      alert("Gagal unsubscribe dari notifikasi");
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render if notifications not supported
  if (!("Notification" in window)) {
    return null;
  }

  // Don't render if permission denied
  if (permission === "denied") {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-80 z-40">
      {!isSubscribed && permission !== "granted" && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 text-2xl">🔔</div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm mb-1">
                Aktifkan Notifikasi
              </h3>
              <p className="text-xs text-gray-600 mb-3">
                Dapatkan update pesanan dan promo langsung di perangkat Anda
              </p>
              <button
                onClick={subscribeToPush}
                disabled={isLoading}
                className="w-full bg-[var(--primary)] text-white text-sm font-medium py-2 px-4 rounded-lg hover:bg-[var(--primary-dark)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? "Memproses..." : "Aktifkan Notifikasi"}
              </button>
            </div>
            <button
              onClick={() => setPermission("denied")}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
