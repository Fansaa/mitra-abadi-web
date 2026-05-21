import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api";
import Sk from "../../components/Skeleton";
import Swal from "sweetalert2";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

function getImageUrl(imagePath) {
  if (!imagePath) return null;
  if (imagePath.startsWith("http")) return imagePath;
  return `${API_BASE}/storage/${imagePath}`;
}

export default function Inventory() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [filterSearch, setFilterSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  const fetchProducts = () => {
    Promise.all([
      api.get("/admin/products"),
      api.get("/admin/categories"),
    ])
      .then(([prodRes, catRes]) => {
        setProducts(prodRes.data.data ?? []);
        setCategories(catRes.data.data ?? []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleDelete = async (e, product) => {
    e.stopPropagation();
    const result = await Swal.fire({
      title: "Hapus Produk?",
      text: `"${product.name}" akan dihapus permanen dan tidak dapat dikembalikan.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e61e25",
      cancelButtonColor: "#d6d3d1",
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
      reverseButtons: true,
      customClass: {
        cancelButton: 'text-stone-700 font-bold'
      }
    });
    if (!result.isConfirmed) return;
    try {
      await api.delete(`/admin/products/${product.id}`);
      Swal.fire({
        title: "Dihapus!",
        text: "Produk berhasil dihapus.",
        icon: "success",
        confirmButtonColor: "#e61e25",
        timer: 1800,
        showConfirmButton: false,
      });
      fetchProducts();
    } catch {
      Swal.fire({ title: "Gagal", text: "Gagal menghapus produk. Coba lagi.", icon: "error", confirmButtonColor: "#e61e25" });
    }
  };

  const displayProducts = useMemo(() => {
    return products.filter((p) => {
      const searchMatch =
        !filterSearch ||
        p.name.toLowerCase().includes(filterSearch.toLowerCase()) ||
        (p.category?.name || "").toLowerCase().includes(filterSearch.toLowerCase());
      const catMatch = filterCategory === "all" || String(p.category?.id) === String(filterCategory);
      return searchMatch && catMatch;
    });
  }, [products, filterSearch, filterCategory]);

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans pb-24" style={{ fontFamily: "Manrope, sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* Top Navbar / Breadcrumb */}
      <div className="bg-white border-b border-stone-200 px-4 md:px-8 py-5 sticky top-16 z-30 shadow-sm">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 hover:bg-stone-200 hover:text-stone-900 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-stone-400">Manajemen Inventori</p>
              <h1 className="text-xl font-extrabold text-stone-900">Katalog Produk</h1>
            </div>
          </div>
          <button
            onClick={() => navigate("/admin/specimen-entry")}
            className="hidden md:flex items-center gap-2 bg-stone-900 text-white font-bold text-[11px] uppercase tracking-widest px-6 py-3 rounded-xl hover:bg-[#e61e25] transition-all shadow-sm hover:-translate-y-0.5"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Tambah Produk
          </button>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 md:px-8 mt-10">

        {/* Page Header Info */}
        <div className="mb-8 max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-black text-stone-900 leading-tight mb-3">
            Daftar Inventaris
          </h2>
          <p className="text-stone-500 font-medium leading-relaxed">
            Kelola spesimen kain, pantau ketersediaan, perbarui metadata, dan atur detail harga produk yang tampil di katalog.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="relative flex-1 group">
            <svg
              className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400 group-focus-within:text-[#e61e25] transition-colors pointer-events-none"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Cari nama kain atau kategori..."
              value={filterSearch}
              onChange={(e) => setFilterSearch(e.target.value)}
              className="w-full bg-white border border-stone-200 text-stone-800 text-sm font-bold rounded-2xl pl-14 pr-4 py-4 focus:outline-none focus:border-[#e61e25] focus:ring-4 focus:ring-[#e61e25]/10 transition-all placeholder:text-stone-400 shadow-sm"
            />
          </div>

          {/* Category Dropdown */}
          <div className="relative w-full md:w-72 group flex-shrink-0">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full appearance-none bg-white border border-stone-200 text-stone-800 text-sm font-bold rounded-2xl pl-5 pr-12 py-4 focus:outline-none focus:border-[#e61e25] focus:ring-4 focus:ring-[#e61e25]/10 transition-all cursor-pointer shadow-sm truncate"
            >
              <option value="all">Semua Kategori</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <svg className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400 group-focus-within:text-[#e61e25] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {/* Reset Button */}
          {(filterSearch || filterCategory !== "all") && (
            <button
              onClick={() => { setFilterSearch(""); setFilterCategory("all"); }}
              className="flex items-center justify-center gap-2 px-6 py-4 bg-red-50 text-[#e61e25] font-bold text-[11px] uppercase tracking-widest rounded-2xl hover:bg-[#e61e25] hover:text-white transition-colors border border-red-100 shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
              Reset
            </button>
          )}
        </div>

        {/* Inventory Table Card */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-stone-100 p-8 flex flex-col gap-2">
          
          {/* Table Header */}
          <div className="hidden lg:grid grid-cols-12 gap-6 pb-4 border-b border-stone-100 px-6">
            <div className="col-span-3 text-[10px] font-extrabold text-stone-400 uppercase tracking-widest">Nama Spesimen</div>
            <div className="col-span-2 text-[10px] font-extrabold text-stone-400 uppercase tracking-widest">Kategori</div>
            <div className="col-span-2 text-[10px] font-extrabold text-stone-400 uppercase tracking-widest">Kode SKU</div>
            <div className="col-span-1 text-[10px] font-extrabold text-stone-400 uppercase tracking-widest">Warna</div>
            <div className="col-span-2 text-[10px] font-extrabold text-stone-400 uppercase tracking-widest text-right">Rentang Harga</div>
            <div className="col-span-2 text-[10px] font-extrabold text-stone-400 uppercase tracking-widest text-right">Aksi</div>
          </div>

          {/* Loading Skeleton */}
          {loading ? (
            <div className="flex flex-col gap-4 mt-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-6">
                  <Sk className="w-12 h-12 rounded-2xl flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Sk className="h-4 w-48 rounded-full" />
                    <Sk className="h-3 w-32 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Empty State */}
              {displayProducts.length === 0 && (
                <div className="py-20 text-center flex flex-col items-center">
                  <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined text-4xl text-stone-300">inventory_2</span>
                  </div>
                  <h3 className="text-lg font-black text-stone-900 mb-2">Produk tidak ditemukan</h3>
                  <p className="text-sm text-stone-500 font-medium max-w-sm">
                    {products.length === 0 
                      ? "Belum ada produk di dalam inventaris Anda." 
                      : "Tidak ada produk yang sesuai dengan filter pencarian Anda."}
                  </p>
                </div>
              )}

              {/* Data Rows */}
              <div className="flex flex-col gap-2 mt-2">
                {displayProducts.map((p) => {
                  const imagePath = p.variants?.[0]?.image_path;
                  const imageUrl = getImageUrl(imagePath);
                  const priceFormatted =
                    p.price_min != null && p.price_max != null
                      ? `Rp ${Number(p.price_min).toLocaleString("id-ID")} - ${Number(p.price_max).toLocaleString("id-ID")}`
                      : p.price_min != null
                      ? `Rp ${Number(p.price_min).toLocaleString("id-ID")}`
                      : "-";

                  return (
                    <div
                      key={p.id}
                      onClick={() => navigate(`/admin/inventory/${p.id}`)}
                      className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-center hover:bg-stone-50 transition-colors p-4 lg:px-6 rounded-2xl group border border-transparent hover:border-stone-100 cursor-pointer"
                    >
                      {/* Name & Image */}
                      <div className="col-span-1 lg:col-span-3 flex items-center gap-4">
                        <div className="w-12 h-12 bg-stone-100 rounded-2xl overflow-hidden flex-shrink-0 border border-stone-200">
                          {imageUrl ? (
                            <img src={imageUrl} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-stone-300">
                              <span className="material-symbols-outlined text-[20px]">image</span>
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-extrabold text-[15px] text-stone-900 group-hover:text-[#e61e25] transition-colors leading-tight mb-0.5">
                            {p.name}
                          </div>
                          <div className="font-bold text-[11px] text-stone-400">ID: {p.id}</div>
                        </div>
                      </div>

                      {/* Category */}
                      <div className="col-span-1 lg:col-span-2 hidden lg:block">
                        <span className="inline-flex px-3 py-1.5 bg-stone-100 text-stone-600 text-[10px] font-extrabold uppercase tracking-widest rounded-lg border border-stone-200">
                          {p.category?.name ?? "-"}
                        </span>
                      </div>

                      {/* SKU */}
                      <div className="col-span-1 lg:col-span-2 hidden lg:block font-mono text-xs font-bold text-stone-600">
                        {p.sku_code || <span className="text-stone-300">—</span>}
                      </div>

                      {/* Colors */}
                      <div className="col-span-1 hidden lg:flex flex-wrap gap-1.5">
                        {p.variants?.length > 0
                          ? p.variants.slice(0, 3).map((v) =>
                              v.color_hex ? (
                                <div
                                  key={v.id}
                                  style={{ backgroundColor: v.color_hex }}
                                  className="w-4 h-4 rounded-full border border-black/10 shadow-inner"
                                  title={v.color_hex.toUpperCase()}
                                />
                              ) : null
                            )
                          : <span className="text-stone-300 text-xs">—</span>
                        }
                        {p.variants?.length > 3 && (
                          <div className="w-4 h-4 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center text-[8px] font-bold text-stone-500">
                            +
                          </div>
                        )}
                      </div>

                      {/* Price */}
                      <div className="col-span-1 lg:col-span-2 hidden lg:block text-right font-extrabold text-xs text-stone-800">
                        {priceFormatted}
                      </div>

                      {/* Actions */}
                      <div className="col-span-1 lg:col-span-2 flex items-center justify-end gap-2 mt-2 lg:mt-0" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => navigate(`/admin/inventory/${p.id}`)}
                          className="w-10 h-10 flex items-center justify-center rounded-xl bg-stone-50 text-stone-500 hover:text-white hover:bg-stone-900 transition-colors border border-stone-200 hover:border-stone-900"
                          title="Lihat Detail"
                        >
                          <span className="material-symbols-outlined text-[18px]">visibility</span>
                        </button>
                        <button
                          onClick={() => navigate(`/admin/inventory/${p.id}/edit`)}
                          className="w-10 h-10 flex items-center justify-center rounded-xl bg-stone-50 text-stone-500 hover:text-white hover:bg-stone-900 transition-colors border border-stone-200 hover:border-stone-900"
                          title="Edit Produk"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button
                          onClick={(e) => handleDelete(e, p)}
                          className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-50 text-[#e61e25] hover:text-white hover:bg-[#e61e25] transition-colors border border-red-100 hover:border-[#e61e25]"
                          title="Hapus Produk"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Table Footer Info */}
          {!loading && displayProducts.length > 0 && (
            <div className="mt-6 pt-6 border-t border-stone-100 text-center">
              <span className="text-[11px] font-bold uppercase tracking-widest text-stone-400">
                Menampilkan {displayProducts.length} dari {products.length} spesimen
              </span>
            </div>
          )}
        </div>

      </div>

      {/* Mobile Sticky Add Button */}
      <div className="md:hidden fixed bottom-6 right-6 z-40">
        <button
          onClick={() => navigate("/admin/specimen-entry")}
          className="w-14 h-14 bg-[#e61e25] text-white rounded-full shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-transform border-2 border-white"
        >
          <span className="material-symbols-outlined text-3xl">add</span>
        </button>
      </div>

    </div>
  );
}