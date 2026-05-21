import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../lib/api";
import Sk from "../../components/Skeleton";

export default function DetailKategori() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/admin/categories/${id}`)
      .then(res => setCategory(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  // ── Render Loading State ──
  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 font-sans pb-24">
        {/* Navbar Skeleton */}
        <div className="bg-white border-b border-stone-200 px-8 py-5 shadow-sm">
          <div className="max-w-[1400px] mx-auto flex items-center gap-4">
            <Sk className="w-10 h-10 rounded-full" />
            <div className="space-y-2">
              <Sk className="h-3 w-32 rounded-full" />
              <Sk className="h-4 w-48 rounded-full" />
            </div>
          </div>
        </div>
        
        {/* Content Skeleton */}
        <div className="max-w-[1400px] mx-auto px-6 md:px-8 mt-10">
          <div className="mb-10 space-y-4">
            <Sk className="h-10 w-3/4 max-w-md rounded-xl" />
            <Sk className="h-4 w-full max-w-xl rounded-full" />
            <Sk className="h-4 w-2/3 max-w-lg rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {[1, 2].map((n) => (
              <div key={n} className="bg-white p-8 rounded-[2rem] shadow-sm border border-stone-100 space-y-4">
                <Sk className="h-4 w-24 rounded-full" />
                <Sk className="h-10 w-16 rounded-xl" />
              </div>
            ))}
          </div>

          <div className="bg-white rounded-[2rem] shadow-sm border border-stone-100 p-8">
            <Sk className="h-6 w-40 rounded-full mb-8" />
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-4 py-2">
                  <Sk className="h-4 w-12 rounded-full flex-shrink-0" />
                  <Sk className="h-4 w-48 rounded-full flex-1" />
                  <Sk className="h-4 w-32 rounded-full hidden md:block" />
                  <Sk className="h-8 w-8 rounded-xl flex-shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Render 404 / Not Found ──
  if (!category) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center font-sans pb-24">
        <div className="bg-white p-12 rounded-[2rem] border border-stone-100 shadow-sm text-center max-w-md mx-auto">
          <div className="w-20 h-20 bg-stone-50 text-stone-300 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-[40px]">category</span>
          </div>
          <h2 className="text-2xl font-black text-stone-900 mb-2 leading-tight">Kategori Tidak Ditemukan</h2>
          <p className="text-sm font-medium text-stone-500 mb-8">Kategori yang Anda cari mungkin telah dihapus atau ID tidak valid.</p>
          <button
            onClick={() => navigate("/admin/manajemen-kategori")}
            className="w-full py-4 bg-stone-900 text-white font-bold text-[11px] uppercase tracking-widest rounded-xl hover:bg-[#e61e25] transition-colors shadow-sm"
          >
            ← Kembali ke Kategori
          </button>
        </div>
      </div>
    );
  }

  const products = category.products ?? [];

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans pb-24" style={{ fontFamily: "Manrope, sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* ── Top Navbar / Breadcrumb ── */}
      <div className="bg-white border-b border-stone-200 px-4 md:px-8 py-5 sticky top-16 z-30 shadow-sm">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/manajemen-kategori')}
              className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 hover:bg-stone-200 hover:text-stone-900 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-stone-400">Manajemen Inventori</p>
              <h1 className="text-xl font-extrabold text-stone-900">Detail Kategori</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 md:px-8 mt-10">
        
        {/* Page Header */}
        <div className="mb-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 text-[#e61e25] mb-4 border border-red-100">
            <span className="material-symbols-outlined text-[14px]">category</span>
            <span className="text-[10px] uppercase tracking-widest font-extrabold">Kategori Produk</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-stone-900 leading-tight tracking-tight mb-4">
            {category.name}
          </h2>
          <p className="text-stone-500 font-medium leading-relaxed text-lg">
            {category.description || <span className="italic opacity-70">Tidak ada deskripsi untuk kategori ini.</span>}
          </p>
        </div>

        {/* ── Metric Cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-stone-100 flex flex-col justify-between group hover:-translate-y-1 transition-transform duration-300">
            <div className="flex justify-between items-start mb-6">
              <span className="text-[10px] font-extrabold tracking-widest uppercase text-stone-400">
                Total Produk
              </span>
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 bg-stone-100 text-stone-600">
                <span className="material-symbols-outlined text-[20px]">inventory_2</span>
              </div>
            </div>
            <div>
              <p className="text-4xl font-black tracking-tight text-stone-900">
                {products.length}
              </p>
              <p className="text-xs font-semibold mt-2 text-stone-400">
                Spesimen terdaftar dalam kategori ini
              </p>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-stone-100 flex flex-col justify-between group hover:-translate-y-1 transition-transform duration-300">
            <div className="flex justify-between items-start mb-6">
              <span className="text-[10px] font-extrabold tracking-widest uppercase text-stone-400">
                ID Kategori
              </span>
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 bg-stone-100 text-stone-600">
                <span className="material-symbols-outlined text-[20px]">tag</span>
              </div>
            </div>
            <div>
              <p className="text-4xl font-black tracking-tight text-stone-900">
                {category.id}
              </p>
              <p className="text-xs font-semibold mt-2 text-stone-400">
                Nomor identifikasi unik sistem
              </p>
            </div>
          </div>
        </div>

        {/* ── Product List Table ── */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-stone-100 p-8 flex flex-col gap-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-black tracking-tight text-stone-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-stone-400">list_alt</span>
              Daftar Produk
            </h3>
          </div>

          {products.length === 0 ? (
            <div className="py-16 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-3xl text-stone-300">inventory_2</span>
              </div>
              <h3 className="text-lg font-bold text-stone-900 mb-1">Belum ada produk</h3>
              <p className="text-sm text-stone-500 font-medium">Kategori ini belum memiliki spesimen kain yang terdaftar.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-stone-100">
                  <tr>
                    <th className="py-4 px-2 font-extrabold text-[10px] uppercase tracking-widest text-stone-400 w-16">ID</th>
                    <th className="py-4 font-extrabold text-[10px] uppercase tracking-widest text-stone-400">Nama Produk</th>
                    <th className="py-4 font-extrabold text-[10px] uppercase tracking-widest text-stone-400 text-right">Harga</th>
                    <th className="py-4 font-extrabold text-[10px] uppercase tracking-widest text-stone-400 text-right pr-2">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  {products.map((p) => {
                    // Coba ambil harga dari price_min, atau price jika price_min tidak ada
                    const priceVal = p.price_min ?? p.price;
                    const priceFormatted = priceVal != null 
                      ? `Rp ${parseFloat(priceVal).toLocaleString('id-ID')}` 
                      : '-';

                    return (
                      <tr 
                        key={p.id} 
                        className="group hover:bg-stone-50/70 transition-colors duration-200 cursor-pointer"
                        onClick={() => navigate(`/admin/inventory/${p.id}`)}
                      >
                        <td className="py-5 px-2">
                          <span className="font-mono text-xs font-bold text-stone-500 bg-stone-100 px-2.5 py-1 rounded-md">
                            {p.id}
                          </span>
                        </td>
                        <td className="py-5 font-bold text-stone-900 group-hover:text-[#e61e25] transition-colors pr-4">
                          {p.name}
                        </td>
                        <td className="py-5 text-right font-extrabold text-stone-700">
                          {priceFormatted}
                        </td>
                        <td className="py-5 pr-2">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/admin/inventory/${p.id}`);
                              }}
                              className="w-8 h-8 flex items-center justify-center rounded-xl bg-stone-100 text-stone-500 hover:text-white hover:bg-stone-900 transition-colors border border-transparent"
                              title="Lihat Produk"
                            >
                              <span className="material-symbols-outlined text-[16px]">visibility</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}