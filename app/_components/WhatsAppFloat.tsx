"use client";

import { MessageCircle, X } from "lucide-react";
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";

export default function WhatsAppFloat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Fetch admin phone number
  const { data: adminData } = trpc.user.getAdminContact.useQuery();

  useEffect(() => {
    // Show button after a short delay for better UX
    const timer = setTimeout(() => setIsVisible(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleWhatsAppClick = () => {
    if (!adminData?.phone) {
      alert("Maaf, nomor WhatsApp belum tersedia. Silakan hubungi kami melalui email.");
      return;
    }

    // Format phone number (remove leading 0, add 62)
    let phoneNumber = adminData.phone.replace(/\D/g, ""); // Remove non-digits
    if (phoneNumber.startsWith("0")) {
      phoneNumber = "62" + phoneNumber.substring(1);
    } else if (!phoneNumber.startsWith("62")) {
      phoneNumber = "62" + phoneNumber;
    }

    // Pre-filled message
    const message = encodeURIComponent(
      "Halo Qohira, saya ingin bertanya tentang produk yang tersedia."
    );

    // Open WhatsApp
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, "_blank");
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 flex flex-col items-end gap-3">
        {/* Tooltip/Message bubble */}
        {isOpen && (
          <div
            className="bg-white rounded-2xl shadow-2xl p-4 max-w-xs animate-fade-in border-2"
            style={{ borderColor: "#25D366" }}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">
                    Qohira
                  </p>
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Online
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-gray-700 mb-3">
              Ada yang bisa kami bantu? Chat dengan kami sekarang! 💬
            </p>
            <button
              onClick={handleWhatsAppClick}
              className="w-full py-2 px-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              Mulai Chat
            </button>
          </div>
        )}

        {/* Main WhatsApp Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="group relative w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full shadow-2xl hover:scale-110 transition-all duration-300 flex items-center justify-center animate-bounce-slow"
          style={{
            boxShadow: "0 8px 24px rgba(37, 211, 102, 0.4)",
          }}
          aria-label="Chat WhatsApp"
        >
          {/* Pulse ring animation */}
          <span className="absolute inset-0 rounded-full bg-green-400 opacity-75 animate-ping"></span>

          {/* Icon */}
          <MessageCircle className="w-7 h-7 sm:w-8 sm:h-8 text-white relative z-10 group-hover:rotate-12 transition-transform" />

          {/* Notification badge */}
          <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
            1
          </span>
        </button>
      </div>

      {/* Custom animations */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounce-slow {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}
