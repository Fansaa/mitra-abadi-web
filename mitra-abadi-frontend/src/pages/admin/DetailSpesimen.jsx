import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../lib/api";
import Sk from "../../components/Skeleton";
import Swal from "sweetalert2";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

function getImageUrl(imagePath) {
  if (!imagePath) return null;
  if (imagePath.startsWith("http")) return imagePath;
  return `${API_BASE}/storage/${imagePath}`;
}

export default function DetailSpesimen() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    api
      .get(`/admin/products/${id}`)
      .then((res) => {
        setProduct(res.data.data);
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Hapus Produk?",
      text: `"${product?.name}" akan dihapus permanen dari sistem dan tidak dapat dikembalikan.`,
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
    
    setDeleting(true);
    try {
      await api.delete(`/admin/products/${id}`);
      await Swal.fire({
        title: "Dihapus!",
        text: "Produk berhasil dihapus.",
        icon: "success",
        confirmButtonColor: "#e61e25",
        timer: 1800,
        showConfirmButton: false,
      });
      navigate('/admin/inventory');
    } catch {
      Swal.fire({ 
        title: "Gagal", 
        text: "Gagal menghapus produk. Coba lagi.", 
        icon: "error", 
        confirmButtonColor: "#e61e25" 
      });
      setDeleting(false);
    }
  };

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
          <div className="mb-10 space-y-3">
            <Sk className="h-4 w-24 rounded-full" />
            <Sk className="h-10 w-3/4 max-w-lg rounded-xl" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
            <div className="lg:col-span-7 space-y-8">
              <Sk className="w-full aspect-square md:aspect-[4/3] rounded-[2rem]" />
              <div className="bg-white p-8 rounded-[2rem] space-y-4">
                <Sk className="h-6 w-40 rounded-full mb-6" />
                <Sk className="h-4 w-full rounded-full" />
                <Sk className="h-4 w-5/6 rounded-full" />
                <Sk className="h-4 w-4/6 rounded-full" />
              </div>
            </div>
            <div className="lg:col-span-5 space-y-8">
              <div className="bg-white p-8 rounded-[2rem] space-y-6">
                <Sk className="h-4 w-32 rounded-full mb-4" />
                {[1, 2, 3].map((n) => (
                  <div key={n} className="space-y-2">
                    <Sk className="h-3 w-20 rounded-full" />
                    <Sk className="h-5 w-40 rounded-full" />
                  </div>
                ))}
              </div>
              <div className="bg-white p-8 rounded-[2rem] space-y-6">
                <Sk className="h-4 w-28 rounded-full mb-4" />
                {[1, 2].map((n) => (
                  <div key={n} className="flex items-center gap-3 py-2">
                    <Sk className="w-6 h-6 rounded-full flex-shrink-0" />
                    <Sk className="h-4 w-24 rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Render 404 / Not Found ──
  if (!product) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center font-sans pb-24">
        <div className="bg-white p-12 rounded-[2rem] border border-stone-100 shadow-sm text-center max-w-md mx-auto">
          <div className="w-20 h-20 bg-stone-50 text-stone-300 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-[40px]">inventory_2</span>
          </div>
          <h2 className="text-2xl font-black text-stone-900 mb-2 leading-tight">Produk Tidak Ditemukan</h2>
          <p className="text-sm font-medium text-stone-500 mb-8">Produk yang Anda cari mungkin telah dihapus atau ID tidak valid.</p>
          <button
            onClick={() => navigate("/admin/inventory")}
            className="w-full py-4 bg-stone-900 text-white font-bold text-[11px] uppercase tracking-widest rounded-xl hover:bg-[#e61e25] transition-colors shadow-sm"
          >
            ← Kembali ke Inventaris
          </button>
        </div>
      </div>
    );
  }

  const firstVariant = product.variants?.[0];
  const mainImageUrl = getImageUrl(firstVariant?.image_path) || getImageUrl(product.img);
  const priceFormatted = (product.price_min != null && product.price_max != null)
    ? `Rp ${Number(product.price_min).toLocaleString("id-ID")} - Rp ${Number(product.price_max).toLocaleString("id-ID")}`
    : "-";

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans pb-24" style={{ fontFamily: "Manrope, sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* ── Top Navbar / Breadcrumb ── */}
      <div className="bg-white border-b border-stone-200 px-4 md:px-8 py-5 sticky top-16 z-30 shadow-sm">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/inventory')}
              className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 hover:bg-stone-200 hover:text-stone-900 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-stone-400">Manajemen Inventori</p>
              <h1 className="text-xl font-extrabold text-stone-900">Detail Produk</h1>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-2 font-bold text-[11px] uppercase tracking-widest px-6 py-3 rounded-xl bg-red-50 text-[#e61e25] border border-red-100 hover:bg-[#e61e25] hover:text-white transition-colors disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">delete</span>
              {deleting ? 'Menghapus...' : 'Hapus'}
            </button>
            <button
              onClick={() => navigate(`/admin/inventory/${product.id}/edit`)}
              className="flex items-center gap-2 font-bold text-[11px] uppercase tracking-widest px-6 py-3 rounded-xl bg-stone-900 text-white shadow-sm hover:bg-[#e61e25] hover:-translate-y-0.5 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">edit</span>
              Edit Produk
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-8 mt-10">
        
        {/* Header Title */}
        <div className="mb-10 max-w-3xl">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1.5 bg-stone-200/50 border border-stone-200 text-stone-600 rounded-lg text-[10px] font-extrabold uppercase tracking-widest">
              ID: {product.id}
            </span>
            <span className="px-3 py-1.5 bg-red-50 border border-red-100 text-[#e61e25] rounded-lg text-[10px] font-extrabold uppercase tracking-widest">
              {product.category?.name ?? "Tanpa Kategori"}
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-stone-900 leading-tight tracking-tight">
            {product.name}
          </h2>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 xl:gap-10 items-start">
          
          {/* ── Left Column (Media & Notes) ── */}
          <div className="xl:col-span-7 flex flex-col gap-8">
            
            {/* Image Card */}
            <div className="bg-white p-4 md:p-6 rounded-[2.5rem] shadow-sm border border-stone-100">
              <div className="relative aspect-square md:aspect-[4/3] rounded-[2rem] overflow-hidden bg-stone-100 group border border-stone-100">
                {mainImageUrl ? (
                  <img
                    src={mainImageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-stone-300 gap-4">
                    <span className="material-symbols-outlined text-6xl">image_not_supported</span>
                    <p className="font-bold text-sm uppercase tracking-widest">Tidak ada foto</p>
                  </div>
                )}
              </div>
            </div>

            {/* Description Card */}
            <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-sm border border-stone-100">
              <h3 className="text-lg font-black text-stone-900 flex items-center gap-3 mb-6 pb-6 border-b border-stone-100">
                <div className="w-10 h-10 rounded-2xl bg-stone-50 text-stone-400 flex items-center justify-center shrink-0 border border-stone-200">
                  <span className="material-symbols-outlined text-[20px]">subject</span>
                </div>
                Catatan Produk
              </h3>
              <div className="text-stone-600 text-sm font-medium leading-relaxed">
                {product.description ? (
                  <p className="whitespace-pre-line">{product.description}</p>
                ) : (
                  <p className="italic text-stone-400">Belum ada deskripsi yang ditambahkan untuk produk ini.</p>
                )}
              </div>
            </div>
          </div>

          {/* ── Right Column (Specs & Variants) ── */}
          <div className="xl:col-span-5 flex flex-col gap-8">
            
            {/* Specs Card */}
            <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-sm border border-stone-100">
              <h3 className="text-lg font-black text-stone-900 flex items-center gap-3 mb-8 pb-6 border-b border-stone-100">
                <div className="w-10 h-10 rounded-2xl bg-red-50 text-[#e61e25] flex items-center justify-center shrink-0 border border-red-100">
                  <span className="material-symbols-outlined text-[20px]">tune</span>
                </div>
                Spesifikasi Teknis
              </h3>
              
              <div className="space-y-6">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-stone-400 block mb-1">
                    Kode SKU
                  </span>
                  <div className="text-base font-black text-stone-900 font-mono tracking-wide">
                    {product.sku_code ?? "-"}
                  </div>
                </div>
                
                <div className="w-full h-px bg-stone-100"></div>
                
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-stone-400 block mb-1">
                    Kategori Material
                  </span>
                  <div className="text-[15px] font-bold text-stone-900">
                    {product.category?.name ?? "-"}
                  </div>
                </div>

                <div className="w-full h-px bg-stone-100"></div>

                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-stone-400 block mb-2">
                    Rentang Harga / Yard
                  </span>
                  <div className="text-2xl font-black text-[#e61e25] tracking-tight">
                    {priceFormatted}
                  </div>
                </div>
              </div>
            </div>

            {/* Variants Card */}
            {product.variants && product.variants.length > 0 && (
              <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-sm border border-stone-100">
                <h3 className="text-lg font-black text-stone-900 flex items-center gap-3 mb-6 pb-6 border-b border-stone-100">
                  <div className="w-10 h-10 rounded-2xl bg-stone-50 text-stone-400 flex items-center justify-center shrink-0 border border-stone-200">
                    <span className="material-symbols-outlined text-[20px]">palette</span>
                  </div>
                  Varian Warna
                </h3>
                
                <div className="grid grid-cols-1 gap-3">
                  {product.variants.map((v) => (
                    <div key={v.id} className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl border border-stone-200">
                      <div className="flex items-center gap-4">
                        {v.color_hex ? (
                          <div
                            className="w-8 h-8 rounded-full border border-black/5 shadow-inner flex-shrink-0"
                            style={{ backgroundColor: v.color_hex }}
                          ></div>
                        ) : (
                          <div className="w-8 h-8 rounded-full border border-stone-200 bg-stone-200 flex-shrink-0"></div>
                        )}
                        <div>
                          <span className="text-[10px] font-extrabold uppercase tracking-widest text-stone-400 block mb-0.5">Kode Hex</span>
                          <span className="font-mono text-sm font-bold text-stone-800 tracking-wider">{v.color_hex?.toUpperCase() ?? "-"}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-stone-400 block mb-0.5">Stok</span>
                        <span className="text-sm font-bold text-[#e61e25]">{v.inventory?.stock_roll ?? 0} Roll</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Mobile Action Buttons (Visible only on small screens) */}
            <div className="md:hidden flex flex-col gap-3 mt-4">
              <button
                onClick={() => navigate(`/admin/inventory/${product.id}/edit`)}
                className="w-full py-4 rounded-xl bg-stone-900 text-white font-bold text-[11px] uppercase tracking-widest shadow-sm flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">edit</span>
                Edit Produk
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="w-full py-4 rounded-xl bg-red-50 text-[#e61e25] border border-red-100 font-bold text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[18px]">delete</span>
                {deleting ? 'Menghapus...' : 'Hapus Produk'}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}