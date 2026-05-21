import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../lib/api";
import ChatWindow from "../../components/ChatWindow";
import NavUser from "../../components/NavUser";
import logo from "../../assets/logo.png";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

function getImageUrl(imagePath) {
  if (!imagePath) return null;
  if (imagePath.startsWith("http")) return imagePath;
  return `${API_BASE}/storage/${imagePath}`;
}

function formatHarga(min, max) {
  if (min != null && max != null)
    return `IDR ${Number(min).toLocaleString("id-ID")} – ${Number(max).toLocaleString("id-ID")}`;
  if (min != null) return `IDR ${Number(min).toLocaleString("id-ID")}`;
  return "-";
}

// ── Badge Component ──────────────────────────────────────────────────────────
function Badge({ style, label }) {
  if (!label) return null;
  const base = "px-4 py-1.5 text-[10px] font-extrabold uppercase tracking-widest rounded-full shadow-sm";
  if (style === "primary") return <span className={`${base} bg-[#e61e25] text-white`}>{label}</span>;
  if (style === "low-stock") return <span className={`${base} bg-orange-500 text-white`}>{label}</span>;
  return <span className={`${base} bg-white/90 backdrop-blur-sm text-[#e61e25]`}>{label}</span>;
}

// ── Main Component ───────────────────────────────────────────────────────────
export default function CatalogDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [fabric, setFabric] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeThumb, setActiveThumb] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [fabState, setFabState] = useState("closed"); // "closed" | "popup" | "chat"

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

  const handleFabClick = () => {
    if (fabState === "closed") setFabState("popup");
    else if (fabState === "popup") setFabState("closed");
    else if (fabState === "chat") setFabState("closed");
  };

  // ── Render Loading ──
  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 font-sans" style={{ fontFamily: "Manrope, sans-serif" }}>
        <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        {/* Nav */}
        <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl border-b border-stone-200/50 shadow-sm">
          <div className="flex justify-between items-center px-8 py-4 max-w-screen-2xl mx-auto">
            <div className="flex items-center gap-12">
              <a href="/" className="hover:opacity-80 transition-opacity">
                <img src={logo} alt="Mitra Abadi" className="h-10 w-auto object-contain" />
              </a>
            </div>
          </div>
        </nav>

        <main className="pt-32 pb-24 px-6 md:px-12 max-w-[1400px] mx-auto">
          {/* Breadcrumb skeleton */}
          <div className="mb-10 flex items-center gap-3">
            <div className="bg-stone-200 animate-pulse rounded h-4 w-16" />
            <div className="bg-stone-200 animate-pulse rounded h-4 w-3" />
            <div className="bg-stone-200 animate-pulse rounded h-4 w-24" />
            <div className="bg-stone-200 animate-pulse rounded h-4 w-3" />
            <div className="bg-stone-200 animate-pulse rounded h-4 w-20" />
          </div>

          {/* Product Grid skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-16">

            {/* Left: Hero image + thumbnails */}
            <div className="lg:col-span-6 xl:col-span-7 flex flex-col gap-6">
              <div className="bg-white p-4 rounded-[2rem] shadow-sm border border-stone-100">
                <div className="bg-stone-200 animate-pulse rounded-2xl w-full aspect-[4/5] md:aspect-square xl:aspect-[4/3]" />
              </div>
              {/* Thumbnail strip */}
              <div className="flex gap-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="w-24 h-24 flex-shrink-0 bg-stone-200 animate-pulse rounded-2xl" />
                ))}
              </div>
            </div>

            {/* Right: Product info */}
            <div className="lg:col-span-6 xl:col-span-5 flex flex-col pt-4 gap-8">
              {/* Badge + title */}
              <div className="space-y-4">
                <div className="bg-stone-200 animate-pulse rounded-full h-7 w-36" />
                <div className="bg-stone-200 animate-pulse rounded h-12 w-4/5" />
                <div className="bg-stone-200 animate-pulse rounded h-12 w-3/5" />
                <div className="bg-stone-200 animate-pulse rounded h-4 w-full" />
                <div className="bg-stone-200 animate-pulse rounded h-4 w-5/6" />
              </div>

              {/* Specs card */}
              <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-stone-100 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  {[1, 2, 3, 4].map((n) => (
                    <div key={n} className="space-y-2">
                      <div className="bg-stone-200 animate-pulse rounded h-2.5 w-16" />
                      <div className="bg-stone-200 animate-pulse rounded h-4 w-24" />
                    </div>
                  ))}
                </div>
                <div className="pt-6 border-t border-stone-100 space-y-2">
                  <div className="bg-stone-200 animate-pulse rounded h-2.5 w-28" />
                  <div className="bg-stone-200 animate-pulse rounded h-9 w-48" />
                </div>
                <div className="pt-4 border-t border-stone-100 space-y-3">
                  <div className="bg-stone-200 animate-pulse rounded h-2.5 w-28" />
                  <div className="flex gap-3">
                    {[1, 2, 3].map((n) => (
                      <div key={n} className="bg-stone-200 animate-pulse rounded-full h-8 w-20" />
                    ))}
                  </div>
                </div>
              </div>

              {/* WhatsApp CTA skeleton */}
              <div className="bg-stone-200 animate-pulse rounded-2xl h-16 w-full" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ── Render 404 ──
  if (!fabric) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center font-sans">
        <div className="bg-white p-12 rounded-3xl border border-stone-100 shadow-sm text-center max-w-md mx-auto">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-[#e61e25]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-[#e61e25] font-extrabold uppercase tracking-[0.2em] text-[10px] mb-3">404 — Tidak Ditemukan</p>
          <h2 className="text-2xl font-extrabold text-stone-900 mb-8 leading-tight">Produk Tidak Ada di Arsip</h2>
          <button
            onClick={() => navigate("/catalog")}
            className="w-full py-4 bg-stone-900 text-white font-bold text-[11px] uppercase tracking-widest rounded-2xl hover:bg-[#e61e25] transition-colors shadow-sm"
          >
            ← Kembali ke Katalog
          </button>
        </div>
      </div>
    );
  }

  const whatsappAdminNumber = import.meta.env.VITE_WHATSAPP_ADMIN_NUMBER || "628123456789";
  const hargaWA = (() => {
    const min = fabric.price_min;
    const max = fabric.price_max;
    if (min != null && max != null)
      return `Rp ${Number(min).toLocaleString("id-ID")} - Rp ${Number(max).toLocaleString("id-ID")}`;
    if (min != null) return `Rp ${Number(min).toLocaleString("id-ID")}`;
    return "-";
  })();
  const whatsappMessage = encodeURIComponent(
    `Halo Mitra Abadi!\n\n` +
    `Saya tertarik dengan produk berikut:\n` +
    `---------------------------\n` +
    `Nama Produk : ${fabric.name}\n` +
    `Kode SKU    : ${fabric.sku_code || "-"}\n` +
    `Kategori    : ${fabric.category?.name || "-"}\n` +
    `Harga       : ${hargaWA}\n` +
    `---------------------------\n\n` +
    `Mohon informasi ketersediaan dan cara pemesanan.\n` +
    `Terima kasih!`
  );
  const whatsappUrl = `https://wa.me/${whatsappAdminNumber}?text=${whatsappMessage}`;

  const rawThumbs = fabric.thumbnails?.length ? fabric.thumbnails : fabric.img ? [fabric.img] : [];
  const thumbnails = rawThumbs.map(getImageUrl).filter(Boolean);

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans selection:bg-[#e61e25] selection:text-white" style={{ fontFamily: "Manrope, sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      
      {/* ── Navbar ── */}
      <NavUser activePage="/catalog" />

      {/* ── Main ── */}
      <main className="pt-28 md:pt-32 pb-24 px-4 md:px-12 max-w-[1400px] mx-auto min-h-screen">

        {/* Breadcrumb */}
        <div className="mb-10 flex items-center gap-3">
          <button
            onClick={() => navigate("/catalog")}
            className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-widest text-stone-400 hover:text-[#e61e25] transition-colors group"
          >
            <div className="w-6 h-6 rounded-full bg-white border border-stone-200 flex items-center justify-center group-hover:border-[#e61e25] transition-colors">
              <svg className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </div>
            Kembali
          </button>
          <span className="text-stone-300">/</span>
          <span className="text-[10px] uppercase tracking-[0.15em] text-stone-400 font-bold">{fabric.category?.name || "Katalog"}</span>
          <span className="text-stone-300">/</span>
          <span className="text-[10px] uppercase tracking-[0.15em] text-stone-600 font-extrabold">{fabric.sku_code || `ID-${fabric.id}`}</span>
        </div>

        {/* ── Product Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-16">

          {/* Col 1: Hero Image + Thumbnails */}
          <div className="lg:col-span-6 xl:col-span-7 flex flex-col gap-6">
            {/* Hero Card */}
            <div className="bg-white p-4 rounded-[2rem] shadow-sm border border-stone-100">
              <div
                className="relative aspect-[4/5] md:aspect-square xl:aspect-[4/3] overflow-hidden rounded-2xl bg-stone-100 cursor-zoom-in group"
                onMouseEnter={() => setIsZoomed(true)}
                onMouseLeave={() => setIsZoomed(false)}
              >
                {thumbnails.length > 0 ? (
                  <img
                    src={thumbnails[activeThumb]}
                    alt={fabric.name}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out"
                    style={{ transform: isZoomed ? "scale(1.1)" : "scale(1)" }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-300">
                    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  </div>
                )}
                {/* Badge */}
                {fabric.badge && (
                  <div className="absolute top-5 left-5 z-10">
                    <Badge style={fabric.badgeStyle} label={fabric.badge} />
                  </div>
                )}
                {/* Zoom hint */}
                <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-full flex items-center gap-2 shadow-[0_8px_30px_rgb(0,0,0,0.12)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <svg className="w-4 h-4 text-[#e61e25]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-stone-700">Zoom Tekstur</span>
                </div>
              </div>
            </div>

            {/* Thumbnails */}
            {thumbnails.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {thumbnails.map((thumb, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveThumb(i)}
                    className={`relative w-24 h-24 flex-shrink-0 rounded-2xl overflow-hidden transition-all duration-300 ${
                      activeThumb === i
                        ? "ring-2 ring-[#e61e25] ring-offset-4 scale-95"
                        : "opacity-60 hover:opacity-100 hover:scale-95 border border-stone-200"
                    }`}
                  >
                    <img src={thumb} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Col 2: Product Info */}
          <div className="lg:col-span-6 xl:col-span-5 flex flex-col pt-4">
            
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 text-[#e61e25] mb-6">
                <span className="w-2 h-2 rounded-full bg-[#e61e25] animate-pulse"></span>
                <span className="text-[10px] uppercase tracking-[0.2em] font-extrabold">
                  Arsip Tekstil Premium
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-stone-900 leading-tight mb-4">
                {fabric.name}
              </h1>
              {fabric.description && (
                <p className="text-stone-500 leading-relaxed text-base font-medium">{fabric.description}</p>
              )}
            </div>

            {/* Specs Card */}
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-stone-100 mb-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <span className="text-[10px] uppercase tracking-[0.2em] font-extrabold text-stone-400 block mb-1.5 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                    Kategori
                  </span>
                  <p className="font-extrabold text-stone-900 text-[15px]">{fabric.category?.name || "-"}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-[0.2em] font-extrabold text-stone-400 block mb-1.5 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
                    Kode SKU
                  </span>
                  <p className="font-extrabold text-stone-900 text-[15px]">{fabric.sku_code || "-"}</p>
                </div>
                {fabric.season && (
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.2em] font-extrabold text-stone-400 block mb-1.5 flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                      Season
                    </span>
                    <p className="font-extrabold text-stone-900 text-[15px]">{fabric.season}</p>
                  </div>
                )}
                {fabric.origin && (
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.2em] font-extrabold text-stone-400 block mb-1.5 flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      Origin
                    </span>
                    <p className="font-extrabold text-stone-900 text-[15px] truncate">{fabric.origin}</p>
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-stone-100">
                <span className="text-[10px] uppercase tracking-[0.2em] font-extrabold text-stone-400 block mb-2 flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Estimasi Harga / Roll
                </span>
                <p className="text-3xl font-black text-[#e61e25] tracking-tight">{formatHarga(fabric.price_min, fabric.price_max)}</p>
              </div>

              {/* Warna Hex */}
              {fabric.dominant_colors?.length > 0 && (
                <div className="pt-6 border-t border-stone-100">
                  <span className="text-[10px] uppercase tracking-[0.2em] font-extrabold text-stone-400 block mb-3 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
                    Dominasi Warna
                  </span>
                  <div className="flex flex-wrap gap-4">
                    {fabric.dominant_colors.map((hex) => (
                      <div key={hex} className="flex items-center gap-2 bg-stone-50 py-1.5 pr-4 pl-1.5 rounded-full border border-stone-200">
                        <span
                          style={{ backgroundColor: hex }}
                          className="w-5 h-5 rounded-full border border-black/5 shadow-inner flex-shrink-0"
                        />
                        <span className="font-mono text-xs font-bold text-stone-600 tracking-wider">
                          {hex.toUpperCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* WhatsApp CTA - Updated to Green */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-auto group flex items-center justify-center gap-3 w-full bg-[#25D366] text-white py-5 px-8 rounded-2xl font-extrabold text-[12px] uppercase tracking-[0.15em] hover:bg-[#1EBE53] transition-all shadow-[0_8px_30px_rgb(37,211,102,0.2)] hover:shadow-[0_8px_30px_rgb(37,211,102,0.4)] hover:-translate-y-1"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.556 4.121 1.523 5.855L.057 23.943l6.244-1.635A11.938 11.938 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.787 9.787 0 01-5.001-1.374l-.359-.213-3.709.972.989-3.614-.233-.371A9.785 9.785 0 012.182 12c0-5.418 4.4-9.818 9.818-9.818S21.818 6.582 21.818 12 17.418 21.818 12 21.818z" />
              </svg>
              Konsultasi & Pemesanan
            </a>
          </div>
        </div>

        {/* ── Archivist Notes + Care ── */}
        {(fabric.archivistNote || fabric.features?.length > 0 || fabric.careInstructions) && (
          <section className="mt-24 mb-10">
            <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-stone-100">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">

                {/* Notes & Features */}
                {(fabric.archivistNote || fabric.features?.length > 0) && (
                  <div className="space-y-8">
                    <div>
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-100 text-stone-500 mb-4">
                        <span className="text-[10px] uppercase tracking-[0.2em] font-extrabold">Kurasi Tekstil</span>
                      </div>
                      <h2 className="text-3xl font-black tracking-tight text-stone-900">Catatan Produk</h2>
                    </div>
                    {fabric.archivistNote && (
                      <div className="p-6 bg-[#fdf8f8] rounded-2xl border border-red-100">
                        <p className="text-stone-600 leading-relaxed font-medium italic">"{fabric.archivistNote}"</p>
                      </div>
                    )}
                    {fabric.features?.length > 0 && (
                      <ul className="space-y-4 pt-2">
                        {fabric.features.map((feat) => (
                          <li key={feat} className="flex items-start gap-4">
                            <span className="mt-1 w-6 h-6 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0 shadow-sm border border-red-100">
                              <svg className="w-3.5 h-3.5 text-[#e61e25]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </span>
                            <span className="text-stone-700 font-semibold">{feat}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {/* Care Instructions */}
                {fabric.careInstructions && (
                  <div className="bg-stone-50 border border-stone-200 p-10 md:p-12 rounded-3xl flex flex-col justify-center h-full">
                    <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-stone-100 flex items-center justify-center mb-8">
                      <svg className="w-8 h-8 text-[#e61e25]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
                      </svg>
                    </div>
                    <p className="text-[10px] uppercase tracking-[0.2em] font-extrabold text-stone-400 mb-2">Panduan</p>
                    <h3 className="text-2xl font-black text-stone-900 mb-4">Perawatan Kain</h3>
                    <p className="text-stone-600 font-medium leading-relaxed max-w-md">{fabric.careInstructions}</p>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="w-full bg-white border-t border-stone-200 pt-16 pb-8">
        <div className="px-8 max-w-screen-2xl mx-auto flex justify-center">
          <div className="flex items-center gap-3">
             <img src={logo} alt="Mitra Abadi" className="h-8 w-auto grayscale opacity-60" />
             <span className="text-sm font-semibold text-stone-400">© 2026 Mitra Abadi.</span>
          </div>
        </div>
      </footer>

      {/* FAB POPUP */}
      {fabState === "popup" && (
        <div className="fixed bottom-28 right-4 md:right-8 z-50 w-[calc(100vw-2rem)] max-w-[320px] bg-white/90 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-300">
          <div className="px-6 py-5 border-b border-stone-100 bg-gradient-to-b from-stone-50/50 to-transparent">
            <p className="text-[11px] uppercase tracking-[0.2em] text-stone-500 font-extrabold">Pusat Bantuan</p>
            <p className="text-sm font-medium text-stone-600 mt-1">Pilih metode komunikasi:</p>
          </div>
          <div className="p-3 space-y-2">
            <a href={`https://wa.me/${import.meta.env.VITE_WHATSAPP_ADMIN_NUMBER}`} target="_blank" rel="noopener noreferrer"
              className="w-full flex items-center gap-4 p-3 hover:bg-stone-50 rounded-2xl transition-all group">
              <div className="w-12 h-12 rounded-full bg-[#25D366]/10 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <svg className="w-6 h-6 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              </div>
              <div>
                <p className="text-[15px] font-extrabold text-stone-900">Hubungi Admin</p>
                <p className="text-[12px] text-stone-500 font-medium">Layanan pelanggan via WhatsApp</p>
              </div>
            </a>
            <button onClick={() => setFabState("chat")}
              className="w-full flex items-center gap-4 p-3 hover:bg-stone-50 rounded-2xl transition-all group text-left">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <svg className="w-6 h-6 text-[#e61e25]" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10h-2V8h2m0 8h-2v-6h2m-1-9A10 10 0 002 12a10 10 0 0010 10 10 10 0 0010-10A10 10 0 0012 2z"/></svg>
              </div>
              <div>
                <p className="text-[15px] font-extrabold text-stone-900">Chat AI Assistant</p>
                <p className="text-[12px] text-stone-500 font-medium">Bantuan instan respons 24/7</p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* AI CHAT WINDOW */}
      {fabState === "chat" && <ChatWindow onClose={() => setFabState("closed")} />}

      {/* FAB BUTTON */}
      <button onClick={handleFabClick}
        className="fixed bottom-8 right-8 w-16 h-16 bg-[#e61e25] text-white rounded-full shadow-[0_8px_30px_rgb(230,30,37,0.3)] flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-40 group border-2 border-white">
        {fabState === "closed" || fabState === "popup" ? (
          <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
        ) : (
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/></svg>
        )}
        <span className="absolute right-full mr-5 bg-stone-900 text-white px-4 py-2 rounded-xl text-[11px] uppercase tracking-widest font-extrabold shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Hubungi Kami
        </span>
      </button>
    </div>
  );
}