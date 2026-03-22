"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PricingModal({ isOpen, onClose }: PricingModalProps) {
  const [billingType, setBillingType] = useState<"subscription" | "onetime">("subscription");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-[#1a2b4a] via-[#2a3b5a] to-[#1a2b4a] rounded-3xl shadow-2xl animate-in zoom-in-95 duration-300">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          <X className="w-6 h-6 text-white" />
        </button>

        {/* Header */}
        <div className="text-center pt-12 pb-8 px-6">
          <h1 className="text-4xl sm:text-5xl font-black mb-4 bg-gradient-to-r from-[#d4a574] via-[#f4c794] to-[#d4a574] bg-clip-text text-transparent">
            Paket Harga Qohira
          </h1>
          <p className="text-white/90 text-lg">
            Pilih paket yang sesuai dengan kebutuhan bisnis Anda
          </p>
        </div>

        {/* Toggle Billing Type */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-white/10 p-1 rounded-full backdrop-blur-sm">
            <button
              onClick={() => setBillingType("subscription")}
              className={`px-6 py-3 rounded-full font-semibold transition-all ${
                billingType === "subscription"
                  ? "bg-gradient-to-r from-[#d4a574] to-[#f4c794] text-[#1a2b4a] shadow-lg"
                  : "text-white/70 hover:text-white"
              }`}
            >
              Berlangganan
            </button>
            <button
              onClick={() => setBillingType("onetime")}
              className={`px-6 py-3 rounded-full font-semibold transition-all ${
                billingType === "onetime"
                  ? "bg-gradient-to-r from-[#d4a574] to-[#f4c794] text-[#1a2b4a] shadow-lg"
                  : "text-white/70 hover:text-white"
              }`}
            >
              Beli Putus
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="px-6 pb-12">
          {billingType === "subscription" ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Starter */}
              <PricingCard
                title="Starter"
                subtitle="Untuk bisnis yang baru memulai"
                price="500K"
                period="/bulan"
                features={[
                  "Maksimal 100 produk",
                  "Dashboard admin dasar",
                  "Manajemen pesanan",
                  "1 akun admin",
                  "Support via email",
                  "Hosting & domain termasuk",
                ]}
                disabledFeatures={[
                  "Custom domain",
                  "Analytics lanjutan",
                  "Integrasi payment gateway",
                ]}
              />

              {/* Professional - Popular */}
              <PricingCard
                title="Professional"
                subtitle="Untuk bisnis yang sedang berkembang"
                price="1.2JT"
                period="/bulan"
                popular
                features={[
                  "Unlimited produk",
                  "Dashboard admin lengkap",
                  "Manajemen pesanan & inventory",
                  "3 akun admin",
                  "Support prioritas (WA + Email)",
                  "Hosting & domain termasuk",
                  "Custom domain",
                  "Analytics & laporan lengkap",
                  "Integrasi 2 payment gateway",
                  "Email marketing basic",
                  "Backup mingguan",
                ]}
              />

              {/* Enterprise */}
              <PricingCard
                title="Enterprise"
                subtitle="Untuk bisnis skala besar"
                price="2.5JT"
                period="/bulan"
                badge="🎁 BONUS WEB POS"
                features={[
                  "✨ BONUS: Sistem POS Kasir Web (nilai 5JT)",
                  "Unlimited produk",
                  "Dashboard admin premium",
                  "Full inventory management",
                  "Unlimited akun admin",
                  "Support 24/7 dedicated",
                  "Hosting premium & domain",
                  "Custom domain & SSL",
                  "Advanced analytics & AI insights",
                  "Integrasi semua payment gateway",
                  "Email & SMS marketing",
                  "Backup harian otomatis",
                  "Custom fitur sesuai kebutuhan",
                  "Multi-warehouse support",
                  "API access",
                  "Integrasi POS dengan online store",
                ]}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Basic License */}
              <OneTimePricingCard
                title="Basic License"
                price="8JT"
                description="Source code lengkap dengan fitur dasar"
                features={[
                  "Full source code",
                  "Dokumentasi lengkap",
                  "Free update 3 bulan",
                  "Support setup awal",
                ]}
                disabledFeatures={["Custom development"]}
              />

              {/* Premium License */}
              <OneTimePricingCard
                title="Premium License"
                price="15JT"
                description="Semua fitur + customization"
                popular
                features={[
                  "Full source code",
                  "Dokumentasi + video tutorial",
                  "Free update 1 tahun",
                  "Support dedicated 6 bulan",
                  "2x custom development",
                  "Training tim",
                ]}
              />

              {/* Enterprise License */}
              <OneTimePricingCard
                title="Enterprise License"
                price="25JT"
                description="Solusi complete untuk enterprise"
                badge="🎁 BONUS WEB POS"
                features={[
                  "✨ BONUS: Source Code POS Kasir Web (nilai 10JT)",
                  "Full source code E-commerce + POS",
                  "Complete documentation",
                  "Lifetime free updates",
                  "Support dedicated 1 tahun",
                  "Unlimited custom development",
                  "Training & consultation",
                  "White label ready",
                  "Integrasi POS dengan toko online",
                ]}
              />
            </div>
          )}
        </div>

        {/* Contact Section */}
        <div className="bg-white/5 backdrop-blur-sm mx-6 mb-6 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-3">
            Butuh Paket Custom?
          </h3>
          <p className="text-white/80 mb-6">
            Hubungi kami untuk mendiskusikan kebutuhan spesifik bisnis Anda
          </p>
          <a
            href="https://wa.me/6281234567890"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-8 py-4 bg-gradient-to-r from-[#d4a574] to-[#f4c794] text-[#1a2b4a] font-bold rounded-full hover:shadow-xl hover:scale-105 transition-all"
          >
            Hubungi Kami via WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}

interface PricingCardProps {
  title: string;
  subtitle: string;
  price: string;
  period: string;
  features: string[];
  disabledFeatures?: string[];
  popular?: boolean;
  badge?: string;
}

function PricingCard({
  title,
  subtitle,
  price,
  period,
  features,
  disabledFeatures = [],
  popular = false,
  badge,
}: PricingCardProps) {
  return (
    <div
      className={`relative bg-white/10 backdrop-blur-sm rounded-2xl p-6 transition-all hover:scale-105 hover:bg-white/15 ${
        popular ? "ring-2 ring-[#d4a574] shadow-xl scale-105" : ""
      } ${badge ? "ring-2 ring-green-400 shadow-xl" : ""}`}
    >
      {popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-[#d4a574] to-[#f4c794] text-[#1a2b4a] font-bold text-sm rounded-full shadow-lg">
          POPULER
        </div>
      )}
      {badge && !popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold text-sm rounded-full shadow-lg animate-pulse">
          {badge}
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold bg-gradient-to-r from-[#d4a574] to-[#f4c794] bg-clip-text text-transparent mb-2">
          {title}
        </h3>
        <p className="text-white/70 text-sm">{subtitle}</p>
      </div>

      {/* Price */}
      <div className="text-center mb-6">
        <div className="text-4xl font-black bg-gradient-to-r from-[#d4a574] to-[#f4c794] bg-clip-text text-transparent">
          <span className="text-2xl">Rp</span>
          {price}
        </div>
        <div className="text-white/60">{period}</div>
      </div>

      {/* Features */}
      <ul className="space-y-3 mb-6">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-start gap-2 text-white/90 text-sm">
            <span className="text-[#d4a574] font-bold mt-0.5">✓</span>
            <span>{feature}</span>
          </li>
        ))}
        {disabledFeatures.map((feature, idx) => (
          <li key={idx} className="flex items-start gap-2 text-white/40 text-sm">
            <span className="text-white/30 font-bold mt-0.5">✗</span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA Button */}
      <button className="w-full py-3 bg-gradient-to-r from-[#d4a574] to-[#f4c794] text-[#1a2b4a] font-bold rounded-xl hover:shadow-lg transition-all hover:scale-105">
        Pilih Paket
      </button>
    </div>
  );
}

interface OneTimePricingCardProps {
  title: string;
  price: string;
  description: string;
  features: string[];
  disabledFeatures?: string[];
  popular?: boolean;
  badge?: string;
}

function OneTimePricingCard({
  title,
  price,
  description,
  features,
  disabledFeatures = [],
  popular = false,
  badge,
}: OneTimePricingCardProps) {
  return (
    <div
      className={`relative bg-white/10 backdrop-blur-sm rounded-2xl p-6 transition-all hover:scale-105 hover:bg-white/15 ${
        popular ? "ring-2 ring-[#d4a574] shadow-xl scale-105" : ""
      } ${badge ? "ring-2 ring-green-400 shadow-xl" : ""}`}
    >
      {popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-[#d4a574] to-[#f4c794] text-[#1a2b4a] font-bold text-sm rounded-full shadow-lg">
          TERPOPULER
        </div>
      )}
      {badge && !popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold text-sm rounded-full shadow-lg animate-pulse">
          {badge}
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold bg-gradient-to-r from-[#d4a574] to-[#f4c794] bg-clip-text text-transparent mb-3">
          {title}
        </h3>
        <div className="text-4xl font-black bg-gradient-to-r from-[#d4a574] to-[#f4c794] bg-clip-text text-transparent mb-2">
          <span className="text-xl">Rp</span>
          {price}
        </div>
        <p className="text-white/70 text-sm">{description}</p>
      </div>

      {/* Features */}
      <ul className="space-y-3 mb-6">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-start gap-2 text-white/90 text-sm">
            <span className="text-[#d4a574] font-bold mt-0.5">✓</span>
            <span>{feature}</span>
          </li>
        ))}
        {disabledFeatures.map((feature, idx) => (
          <li key={idx} className="flex items-start gap-2 text-white/40 text-sm">
            <span className="text-white/30 font-bold mt-0.5">✗</span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA Button */}
      <button className="w-full py-3 bg-gradient-to-r from-[#d4a574] to-[#f4c794] text-[#1a2b4a] font-bold rounded-xl hover:shadow-lg transition-all hover:scale-105">
        Beli Sekarang
      </button>
    </div>
  );
}
