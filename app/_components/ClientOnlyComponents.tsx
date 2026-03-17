"use client";

import dynamic from "next/dynamic";

// Dynamically import components that use browser APIs to prevent SSR issues
export const OnlineStatus = dynamic(() => import("./OnlineStatus"), { ssr: false });
export const WhatsAppFloat = dynamic(() => import("./WhatsAppFloat"), { ssr: false });
export const PWAInstaller = dynamic(() => import("./PWAInstaller"), { ssr: false });
export const PushNotificationManager = dynamic(() => import("./PushNotificationManager"), { ssr: false });
