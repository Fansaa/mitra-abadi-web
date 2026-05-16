import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../lib/api";
import logo from "../../assets/logo.png";

const USD_TO_IDR = 16000;

function parsePrice(price) {
  if (typeof price === "number") return price;
  return parseFloat(String(price).replace("$", "")) || 0;
}

function formatIDR(amount) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function getStockStatus(stock) {
  if (stock <= 10) return { label: "Stok Kritis", color: "text-red-600", bg: "bg-red-50 border-red-200" };
  if (stock <= 30) return { label: "Stok Menipis", color: "text-amber-600", bg: "bg-amber-50 border-amber-200" };
  if (stock <= 60) return { label: "Stok Terbatas", color: "text-yellow-600", bg: "bg-yellow-50 border-yellow-200" };
  return { label: "Tersedia", color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200" };
}

// ── Badge Component ──────────────────────────────────────────────────────────
function Badge({ style, label }) {
  if (!label) return null;
  const base = "px-3 py-1 text-[9px] font-black uppercase tracking-[0.12em] shadow-sm";
  if (style === "primary") return <span className={`${base} bg-[#E61E25] text-white`}>{label}</span>;
  if (style === "low-stock") return <span className={`${base} bg-[#E61E25] text-white`}>{label}</span>;
  return <span className={`${base} bg-white/90 backdrop-blur text-[#E61E25]`}>{label}</span>;
}

// ── Main Component ───────────────────────────────────────────────────────────
export default function CatalogDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [fabric, setFabric] = useState(null);
  const [loading, setLoading] = useState(true);

  const [activeThumb, setActiveThumb] = useState(0);
  const [meters, setMeters] = useState(1.0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setLoading(true);
    setActiveThumb(0);
    window.scrollTo({ top: 0, behavior: "instant" });
    api.get("/products/" + id)
      .then((res) => {
        setFabric(res.data.data || null);
      })
      .catch(() => {
        setFabric(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fdf8f8] flex items-center justify-center">
        <svg className="w-8 h-8 text-[#E61E25] animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      </div>
    );
  }

  if (!fabric) {
    return (
      <div className="min-h-screen bg-[#fdf8f8] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#E61E25] font-black uppercase tracking-[0.2em] text-xs mb-3">404 — Tidak Ditemukan</p>
          <h2 className="text-3xl font-black text-stone-900 mb-6" style={{ fontFamily: "Manrope, sans-serif" }}>
            Produk Tidak Ada di Arsip
          </h2>
          <button
            onClick={() => navigate("/catalog")}
            className="px-8 py-3 bg-[#E61E25] text-white font-bold text-xs uppercase tracking-widest hover:bg-red-700 transition-colors"
          >
            ← Kembali ke Katalog
          </button>
        </div>
      </div>
    );
  }

  const priceUSD = parsePrice(fabric.price);
  const priceIDR = priceUSD * USD_TO_IDR;
  const totalIDR = priceIDR * meters;
  const stockStatus = getStockStatus(fabric.stock_total ?? 0);

  const thumbnails = fabric.thumbnails?.length
    ? fabric.thumbnails
    : fabric.img
    ? [fabric.img]
    : [];

  const whatsappAdminNumber = import.meta.env.VITE_WHATSAPP_ADMIN_NUMBER || "628123456789";
  const whatsappMessage = encodeURIComponent(
    `Halo Mitra Abadi! Saya ingin memesan:\n\n` +
    `📦 Produk: ${fabric.name}\n` +
    `🔖 Kode Produk: #${fabric.id}\n` +
    `📂 Kategori: ${fabric.category?.name || "-"}\n` +
    `📏 Jumlah: ${meters} meter\n` +
    `💰 Estimasi Total: ${formatIDR(totalIDR)}\n\n` +
    `Mohon konfirmasi ketersediaan stok dan detail pemesanan. Terima kasih!`
  );
  const whatsappUrl = `https://wa.me/${whatsappAdminNumber}?text=${whatsappMessage}`;

  return (
    <div
      className="min-h-screen bg-[#fdf8f8] text-stone-900"
      style={{ fontFamily: "Manrope, sans-serif" }}
    >
      <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      {/* ── Navbar ── */}
      <nav className="fixed top-0 w-full z-50 bg-stone-50/90 backdrop-blur-md border-b border-stone-200/20">
        <div className="flex justify-between items-center px-8 py-5 max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-10">
            <a href="/" className="hover:opacity-80 transition-opacity">
              <img src={logo} alt="Mitra Abadi" className="h-10 w-auto" />
            </a>
            <div className="hidden md:flex gap-7 items-center">
              {[
                { label: "Tentang", href: "/" },
                { label: "Katalog", href: "/catalog", active: true },
                { label: "Kontak", href: "/" },
              ].map((item) => (
                <a key={item.label} href={item.href} className={`text-sm font-semibold tracking-tight transition-colors duration-200 ${item.active ? "text-[#e61e25] border-b-2 border-[#e61e25] pb-0.5" : "text-stone-600 hover:text-[#e61e25]"}`}>
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* ── Main ── */}
      <main className="pt-28 pb-24 px-4 md:px-12 max-w-screen-2xl mx-auto">

        {/* Breadcrumb / Back */}
        <div className="mb-10 flex items-center gap-3">
          <button
            onClick={() => navigate("/catalog")}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.15em] text-stone-400 hover:text-[#E61E25] transition-colors group"
          >
            <svg className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
            Kembali ke Katalog
          </button>
          <span className="text-stone-200">·</span>
          <span className="text-[10px] uppercase tracking-[0.15em] text-stone-300 font-bold">{fabric.category?.name}</span>
          <span className="text-stone-200">·</span>
          <span className="text-[10px] uppercase tracking-[0.15em] text-stone-300 font-bold">#{fabric.id}</span>
        </div>

        {/* ── Product Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-16">

          {/* Col 1: Side Metadata */}
          <div className="hidden lg:flex lg:col-span-2 flex-col gap-10 pt-2">
            <div>
              <span className="text-[9px] uppercase tracking-[0.2em] font-black text-stone-400 block mb-1">Kategori</span>
              <p className="font-black text-[#E61E25] text-sm">{fabric.category?.name || "-"}</p>
            </div>
            {fabric.season && (
              <div>
                <span className="text-[9px] uppercase tracking-[0.2em] font-black text-stone-400 block mb-1">Season</span>
                <p className="font-black text-[#E61E25] text-sm">{fabric.season}</p>
              </div>
            )}
            {fabric.origin && (
              <div>
                <span className="text-[9px] uppercase tracking-[0.2em] font-black text-stone-400 block mb-1">Origin</span>
                <p className="font-black text-[#E61E25] text-sm leading-snug">{fabric.origin}</p>
              </div>
            )}
            <div className="mt-auto pt-8 border-t border-stone-100">
              <div className="w-8 h-0.5 bg-[#E61E25] mb-3" />
              <p className="text-[9px] uppercase tracking-[0.15em] text-stone-400 font-bold leading-relaxed">
                Setiap roll diperiksa dan dikurasi untuk memastikan kualitas tekstil terjaga.
              </p>
            </div>
          </div>

          {/* Col 2: Hero Image + Thumbnails */}
          <div className="lg:col-span-6">
            {/* Hero */}
            <div
              className="relative aspect-[4/5] overflow-hidden bg-stone-100 cursor-zoom-in group"
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
            >
              {thumbnails.length > 0 ? (
                <img
                  src={thumbnails[activeThumb]}
                  alt={fabric.name}
                  className="w-full h-full object-cover transition-transform duration-700"
                  style={{ transform: isZoomed ? "scale(1.08)" : "scale(1)" }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-stone-300">
                  <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
              )}
              {/* Badge */}
              {fabric.badge && (
                <div className="absolute top-4 left-4">
                  <Badge style={fabric.badgeStyle} label={fabric.badge} />
                </div>
              )}
              {/* Zoom hint */}
              <div className="absolute bottom-5 left-5 bg-white/95 backdrop-blur px-4 py-2.5 flex items-center gap-2.5 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <svg className="w-4 h-4 text-[#E61E25]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="text-[9px] font-black uppercase tracking-[0.15em]">Arahkan untuk zoom tekstur</span>
              </div>
            </div>

            {/* Thumbnails */}
            {thumbnails.length > 1 && (
              <div className="grid grid-cols-4 gap-3 mt-4">
                {thumbnails.map((thumb, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveThumb(i)}
                    className={`aspect-square overflow-hidden transition-all duration-200 ${
                      activeThumb === i
                        ? "ring-2 ring-[#E61E25] ring-offset-1"
                        : "opacity-50 hover:opacity-80"
                    }`}
                  >
                    <img src={thumb} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Col 3: Info + Order */}
          <div className="lg:col-span-4 flex flex-col gap-8">

            {/* Title */}
            <div>
              <p className="text-[9px] uppercase tracking-[0.2em] font-black text-[#E61E25] mb-2">
                Arsip Tekstil Premium
              </p>
              <h1 className="text-4xl font-black tracking-tight text-stone-900 leading-tight mb-4">
                {fabric.name}
              </h1>
              <p className="text-stone-500 leading-relaxed text-sm">{fabric.description}</p>
            </div>

            {/* Specs Grid */}
            <div className="grid grid-cols-2 gap-px bg-stone-200 border border-stone-200 overflow-hidden">
              {[
                { label: "Gramasi", value: fabric.gsm ? fabric.gsm + " GSM" : "-" },
                { label: "Lebar", value: fabric.width_cm ? fabric.width_cm + " cm" : "-" },
                { label: "Kode SKU", value: fabric.sku_code || "-" },
                { label: "Finishing", value: fabric.finish || "-" },
              ].map(({ label, value }) => (
                <div key={label} className="bg-white p-5">
                  <span className="text-[9px] uppercase tracking-[0.2em] font-black text-stone-400 block mb-1.5">
                    {label}
                  </span>
                  <p className="font-black text-stone-900 text-sm leading-snug">{value}</p>
                </div>
              ))}
            </div>

            {/* Order Calculator */}
            <div className="bg-stone-50 border border-stone-200 p-6 space-y-5">
              <div className="flex justify-between items-center">
                <h3 className="text-[10px] uppercase tracking-[0.2em] font-black text-stone-900">
                  Kalkulator Pesanan
                </h3>
                <span className={`text-[9px] font-black uppercase tracking-[0.1em] px-2 py-1 border ${stockStatus.bg} ${stockStatus.color}`}>
                  {stockStatus.label}: {fabric.stock_total ?? 0}m
                </span>
              </div>

              {/* Meter Input */}
              <div>
                <label className="text-[9px] uppercase tracking-[0.15em] font-black text-stone-400 block mb-2">
                  Jumlah Pesanan (Meter)
                </label>
                <div className="flex items-center border border-stone-300 bg-white focus-within:border-[#E61E25] transition-colors">
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={meters}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      if (!isNaN(v) && v >= 0.5) setMeters(v);
                    }}
                    className="bg-transparent border-none focus:outline-none text-center text-2xl font-black text-stone-900 py-4"
                  />
                  <span className="pl-12 font-black text-stone-300 text-sm">m</span>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="pt-4 border-t border-stone-200 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] uppercase tracking-[0.15em] font-black text-stone-400">
                    Harga / Meter
                  </span>
                  <span className="text-xs font-bold text-stone-400">{formatIDR(priceIDR)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[9px] uppercase tracking-[0.15em] font-black text-stone-400">
                    Jumlah
                  </span>
                  <span className="text-xs font-bold text-stone-400">{meters}m</span>
                </div>
                <div className="flex justify-between items-end pt-2 border-t border-stone-100">
                  <span className="text-[9px] uppercase tracking-[0.15em] font-black text-stone-500">
                    Estimasi Total
                  </span>
                  <div className="text-right">
                    <p className="text-2xl font-black text-[#E61E25] leading-none">{formatIDR(totalIDR)}</p>
                    <p className="text-[9px] text-stone-400 mt-0.5">{meters}m × {formatIDR(priceIDR)}</p>
                  </div>
                </div>
              </div>

              {/* WhatsApp CTA */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 w-full bg-[#E61E25] text-white py-5 font-black text-xs uppercase tracking-[0.15em] hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.556 4.121 1.523 5.855L.057 23.943l6.244-1.635A11.938 11.938 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.787 9.787 0 01-5.001-1.374l-.359-.213-3.709.972.989-3.614-.233-.371A9.785 9.785 0 012.182 12c0-5.418 4.4-9.818 9.818-9.818S21.818 6.582 21.818 12 17.418 21.818 12 21.818z" />
                </svg>
                Pesan via WhatsApp
              </a>

              <p className="text-center text-[9px] uppercase tracking-[0.15em] text-stone-400 font-bold">
                Pesanan diproses dalam 24 jam · Pengiriman ke Seluruh Indonesia
              </p>
            </div>

            {/* Certifications (if present) */}
            {fabric.certifications?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {fabric.certifications.map((cert) => (
                  <span
                    key={cert}
                    className="bg-white border border-stone-200 text-stone-500 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.12em]"
                  >
                    {cert}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Archivist Notes + Care ── */}
        {(fabric.archivistNote || fabric.features?.length > 0 || fabric.careInstructions) && (
          <section className="mt-24 pt-16 border-t border-stone-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 xl:gap-24">

              {/* Notes */}
              {(fabric.archivistNote || fabric.features?.length > 0) && (
                <div className="space-y-8">
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.2em] font-black text-[#E61E25] mb-3">Catatan Arsip</p>
                    <h2 className="text-3xl font-black tracking-tight text-stone-900">Catatan Produk</h2>
                  </div>
                  {fabric.archivistNote && (
                    <p className="text-stone-500 leading-relaxed">"{fabric.archivistNote}"</p>
                  )}
                  {fabric.features?.length > 0 && (
                    <ul className="space-y-4">
                      {fabric.features.map((feat) => (
                        <li key={feat} className="flex items-start gap-3">
                          <span className="mt-1 w-4 h-4 rounded-full bg-[#E61E25]/10 flex items-center justify-center flex-shrink-0">
                            <svg className="w-2.5 h-2.5 text-[#E61E25]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </span>
                          <span className="text-stone-600 text-sm">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* Care Instructions */}
              {fabric.careInstructions && (
                <div className="bg-stone-100 border border-stone-200 p-10 flex flex-col items-center justify-center text-center space-y-5">
                  <div className="w-14 h-14 rounded-full bg-[#E61E25]/10 flex items-center justify-center">
                    <svg className="w-7 h-7 text-[#E61E25]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.2em] font-black text-[#E61E25] mb-2">Perawatan Kain</p>
                    <h3 className="text-xl font-black text-stone-900 mb-4">Panduan Perawatan</h3>
                    <p className="text-stone-500 text-sm leading-relaxed max-w-xs">{fabric.careInstructions}</p>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-stone-200 bg-stone-50">
        <div className="flex flex-col md:flex-row justify-between items-center px-6 md:px-12 py-10 max-w-screen-2xl mx-auto gap-6">
          <span className="text-xs text-stone-400">© 2025 Mitra Abadi. Hak cipta dilindungi.</span>
          <div className="flex flex-wrap justify-center gap-8">
            {["Kebijakan Privasi", "Syarat & Ketentuan", "Aksesibilitas", "Keberlanjutan"].map((item) => (
              <a key={item} href="#" className="text-xs text-stone-400 hover:text-[#E61E25] hover:underline underline-offset-4 transition-all">
                {item}
              </a>
            ))}
            <a href={`https://wa.me/${import.meta.env.VITE_WHATSAPP_ADMIN_NUMBER || "628123456789"}`} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-[#E61E25] hover:underline underline-offset-4">
              Hubungi via WhatsApp
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
