import { useState, useMemo, useEffect } from "react";
import api from "../../lib/api";
import FabricCard from "../../components/FabricCard";
import ChatWindow from "../../components/ChatWindow";
import logo from "../../assets/logo.png";

const ITEMS_PER_PAGE = 6;

export default function Catalog() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedColor, setSelectedColor] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [fabState, setFabState] = useState("closed"); // "closed" | "popup" | "chat"

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get("/products"),
      api.get("/categories"),
    ]).then(([productsRes, categoriesRes]) => {
      setProducts(productsRes.data.data || []);
      setCategories(categoriesRes.data.data || []);
    }).catch((err) => {
      console.error("Gagal memuat data:", err);
      setError("Gagal memuat katalog. Periksa koneksi Anda dan coba lagi.");
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  const paletteColors = useMemo(() => {
    const seen = new Set();
    const colors = [];
    for (const p of products) {
      for (const hex of (p.dominant_colors || [])) {
        const key = hex.toLowerCase();
        if (!seen.has(key)) { seen.add(key); colors.push({ hex, label: hex }); }
      }
    }
    return colors;
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = products;
    if (activeCategory !== "All") result = result.filter((p) => p.category?.name === activeCategory);
    if (selectedColor) result = result.filter((p) => (p.dominant_colors || []).some((c) => c.toLowerCase() === selectedColor.toLowerCase()));
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(q) || (p.category?.name || "").toLowerCase().includes(q));
    }
    return result;
  }, [products, activeCategory, selectedColor, searchQuery]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProducts.length;

  const handleCategoryChange = (cat) => { setActiveCategory(cat); setVisibleCount(ITEMS_PER_PAGE); };
  const handleColorSelect = (hex) => { setSelectedColor(selectedColor === hex ? null : hex); setVisibleCount(ITEMS_PER_PAGE); };
  const handleFabClick = () => {
    if (fabState === "closed") setFabState("popup");
    else if (fabState === "popup") setFabState("closed");
    else if (fabState === "chat") setFabState("closed");
  };

  const hasActiveFilter = activeCategory !== "All" || selectedColor || searchQuery.trim();

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans selection:bg-[#e61e25] selection:text-white" style={{ fontFamily: "Manrope, sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

      {/* NAV */}
      <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl border-b border-stone-200/50 shadow-sm transition-all duration-300">
        <div className="flex justify-between items-center px-8 py-4 max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-12">
            <a href="/" className="hover:opacity-80 transition-opacity">
              <img src={logo} alt="Mitra Abadi" className="h-10 w-auto object-contain" />
            </a>
            <div className="hidden md:flex gap-8 items-center">
              {[
                { label: "Tentang", href: "/" },
                { label: "Katalog", href: "/catalog", active: true },
                { label: "Kontak", href: "/" },
              ].map((item) => (
                <a key={item.label} href={item.href} className={`text-[15px] font-bold tracking-wide transition-all duration-200 relative ${item.active ? "text-[#e61e25]" : "text-stone-500 hover:text-stone-900"}`}>
                  {item.label}
                  {item.active && (
                    <span className="absolute -bottom-5 left-0 w-full h-[3px] bg-[#e61e25] rounded-t-full"></span>
                  )}
                </a>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* MAIN */}
      <main className="pt-32 pb-20 px-8 max-w-[1600px] mx-auto min-h-screen">

        {/* Header */}
        <header className="mb-12">
          <div className="mb-10">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 text-[#e61e25] mb-6">
                <span className="w-2 h-2 rounded-full bg-[#e61e25] animate-pulse"></span>
                <span className="text-[11px] uppercase tracking-[0.2em] font-extrabold">
                  Distributor Kain Berkualitas
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-stone-900 leading-tight tracking-tight">
                Eksplorasi <span className="text-[#e61e25]">Katalog</span> Kain
              </h1>
              <p className="mt-4 text-stone-500 max-w-xl text-base md:text-lg leading-relaxed font-medium">
                Temukan koleksi bahan tekstil premium pilihan kami — dari kain rajut industri tangguh hingga katun lembut untuk kenyamanan maksimal.
              </p>
            </div>
          </div>

          {/* Search bar & Result Count Card */}
          <div className="flex flex-col md:flex-row gap-4 items-stretch max-w-4xl">
            {/* Search Input */}
            <div className="relative w-full flex-grow group">
              <svg
                className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400 group-focus-within:text-[#e61e25] transition-colors pointer-events-none"
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Cari nama kain, SKU, atau kategori..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setVisibleCount(ITEMS_PER_PAGE); }}
                className="w-full h-full pl-14 pr-12 py-4 bg-white border border-stone-200 text-stone-800 text-sm font-semibold rounded-2xl shadow-sm focus:outline-none focus:border-[#e61e25] focus:ring-4 focus:ring-[#e61e25]/10 transition-all placeholder:text-stone-400 placeholder:font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-stone-100 text-stone-500 rounded-full hover:bg-stone-200 hover:text-stone-800 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Result Count Card (Dipindah ke sini) */}
            {!loading && (
              <div className="w-full md:w-64 bg-white px-6 py-3 rounded-2xl shadow-sm border border-stone-200 flex-shrink-0 flex flex-col justify-center">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-stone-900 tracking-tighter leading-none">
                    {filteredProducts.length}
                  </span>
                  <span className="text-xs text-stone-400 font-bold uppercase tracking-wider">
                    Produk
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 font-semibold mt-1">
                  {hasActiveFilter ? "Sesuai filter pencarian" : "Tersedia di katalog"}
                </p>
              </div>
            )}
          </div>
        </header>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* SIDEBAR */}
          <aside className="w-full lg:w-72 flex-shrink-0 space-y-6">

            {/* Filters Container */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-100 space-y-8">
              
              {/* Color Palette */}
              {paletteColors.length > 0 && (
                <section>
                  <h3 className="text-[11px] uppercase tracking-[0.2em] font-extrabold text-stone-400 mb-4 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/></svg>
                    Palet Warna
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {paletteColors.map((color) => (
                      <button
                        key={color.hex}
                        onClick={() => handleColorSelect(color.hex)}
                        title={color.label}
                        className={`w-9 h-9 rounded-full transition-all shadow-sm ${
                          selectedColor === color.hex
                            ? "ring-2 ring-offset-4 ring-[#e61e25] scale-110"
                            : "ring-1 ring-offset-2 ring-transparent hover:ring-stone-300 hover:scale-105 border border-black/5"
                        }`}
                        style={{ backgroundColor: color.hex }}
                      />
                    ))}
                  </div>
                  
                  {/* Tombol Hapus Filter Warna yang Diperjelas */}
                  {selectedColor && (
                    <button
                      onClick={() => setSelectedColor(null)}
                      className="mt-5 w-full py-3 bg-red-50 text-[#e61e25] rounded-xl text-xs font-extrabold uppercase tracking-widest hover:bg-[#e61e25] hover:text-white transition-colors flex items-center justify-center gap-2 shadow-sm border border-red-100"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/></svg>
                      Hapus Warna
                    </button>
                  )}
                </section>
              )}

              {/* Category Filter - DROPDOWN */}
              <section className={paletteColors.length > 0 ? "pt-8 border-t border-stone-100" : ""}>
                <h3 className="text-[11px] uppercase tracking-[0.2em] font-extrabold text-stone-400 mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7"/></svg>
                  Kategori
                </h3>
                
                <div className="relative w-full group">
                  <select
                    value={activeCategory}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full appearance-none pl-4 pr-10 py-3.5 bg-stone-50 border border-stone-200 text-stone-800 text-sm font-bold rounded-xl shadow-sm focus:outline-none focus:border-[#e61e25] focus:ring-2 focus:ring-[#e61e25]/20 transition-all cursor-pointer"
                  >
                    <option value="All">Semua Kategori ({products.length})</option>
                    {categories.map((cat) => {
                      const count = products.filter((p) => p.category?.name === cat.name).length;
                      return (
                        <option key={cat.id} value={cat.name}>
                          {cat.name} ({count})
                        </option>
                      );
                    })}
                  </select>
                  {/* Custom Dropdown Arrow */}
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400 group-focus-within:text-[#e61e25] transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </section>

              {/* Reset all */}
              {hasActiveFilter && (
                <div className="pt-4 border-t border-stone-100">
                  <button
                    onClick={() => { setActiveCategory("All"); setSelectedColor(null); setSearchQuery(""); setVisibleCount(ITEMS_PER_PAGE); }}
                    className="w-full py-3.5 bg-stone-900 text-white rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-stone-800 transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                    Reset Semua Filter
                  </button>
                </div>
              )}
            </div>

            {/* Curator note */}
            <div className="bg-[#fcf8f8] p-5 rounded-3xl border border-red-100">
              <div className="flex gap-3">
                <div className="mt-0.5">
                  <svg className="w-5 h-5 text-[#e61e25]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-stone-900 font-extrabold mb-1">Info Pembelian</p>
                  <p className="text-xs text-stone-600 leading-relaxed font-medium">
                    Semua produk tersedia dalam satuan roll. Stok dan harga dapat berubah sewaktu-waktu. Hubungi admin untuk detail pemesanan.
                  </p>
                </div>
              </div>
            </div>
          </aside>

          {/* GRID */}
          <div className="flex-grow">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-6 rounded-2xl flex items-center justify-center font-semibold text-sm">
                {error}
              </div>
            )}
            
            {loading ? (
              <div className="flex flex-col items-center justify-center h-96 text-center bg-white rounded-3xl border border-stone-100 shadow-sm">
                <svg className="w-10 h-10 text-[#e61e25] animate-spin mb-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <p className="text-stone-500 font-bold tracking-wide">Menyiapkan katalog...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-96 text-center bg-white rounded-3xl border border-dashed border-stone-200">
                <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mb-5">
                  <svg className="w-8 h-8 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-extrabold text-stone-800 mb-2">Produk tidak ditemukan</h3>
                <p className="text-stone-500 text-sm font-medium max-w-sm mb-6">Maaf, tidak ada kain yang sesuai dengan filter atau kata kunci yang Anda masukkan.</p>
                <button
                  onClick={() => { setActiveCategory("All"); setSelectedColor(null); setSearchQuery(""); }}
                  className="px-6 py-2.5 bg-stone-900 text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-[#e61e25] transition-colors shadow-sm"
                >
                  Hapus Pencarian
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-y-12 gap-x-8">
                  {visibleProducts.map((fabric) => (
                    <FabricCard key={fabric.id} fabric={fabric} />
                  ))}
                </div>
                
                {hasMore && (
                  <div className="mt-16 flex justify-center">
                    <button
                      onClick={() => setVisibleCount((v) => v + ITEMS_PER_PAGE)}
                      className="group flex items-center gap-3 px-10 py-4 bg-white border border-stone-200 rounded-full shadow-sm hover:shadow-md hover:border-[#e61e25] hover:text-[#e61e25] transition-all duration-300"
                    >
                      <span className="text-[11px] font-extrabold uppercase tracking-[0.15em]">Muat Lebih Banyak</span>
                      <svg className="w-4 h-4 text-stone-400 group-hover:text-[#e61e25] group-hover:translate-y-0.5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                )}
                
                {!hasMore && filteredProducts.length > ITEMS_PER_PAGE && (
                  <div className="mt-16 flex items-center justify-center gap-4">
                    <div className="h-px bg-stone-200 w-12"></div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-bold">
                      Semua Produk Ditampilkan
                    </p>
                    <div className="h-px bg-stone-200 w-12"></div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* FOOTER */}
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
        <div className="fixed bottom-28 right-8 z-50 w-[320px] bg-white/90 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-300">
          <div className="px-6 py-5 border-b border-stone-100 bg-gradient-to-b from-stone-50/50 to-transparent">
            <p className="text-[11px] uppercase tracking-[0.2em] text-stone-500 font-extrabold">Pusat Bantuan</p>
            <p className="text-sm font-medium text-stone-600 mt-1">Pilih metode komunikasi:</p>
          </div>
          <div className="p-3 space-y-2">
            <a href="https://wa.me/628123456789" target="_blank" rel="noopener noreferrer"
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