import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../lib/api";
import Sk from "../../components/Skeleton";
import Swal from "sweetalert2";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

function getImageUrl(imagePath) {
  if (!imagePath) return null;
  if (imagePath.startsWith("http")) return imagePath;
  return `${API_BASE}/storage/${imagePath}`;
}

export default function EditSpesimen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "", category_id: "", price_min: "", price_max: "",
    sku_code: "", description: "",
  });
  const [variants, setVariants] = useState([]);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const catDropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (catDropdownRef.current && !catDropdownRef.current.contains(event.target)) {
        setCategoryDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    Promise.all([
      api.get(`/admin/products/${id}`),
      api.get('/admin/categories'),
    ]).then(([prodRes, catRes]) => {
      const p = prodRes.data.data;
      setForm({
        name: p.name ?? "",
        category_id: p.category_id ?? "",
        price_min: p.price_min ?? "",
        price_max: p.price_max ?? "",
        sku_code: p.sku_code ?? "",
        description: p.description ?? "",
      });
      setVariants(p.variants ?? []);
      setCategories(catRes.data.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleVariantChange = (variantId, field, value) => {
    setVariants(prev => prev.map(v => v.id === variantId ? { ...v, [field]: value } : v));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append('_method', 'PUT'); // Method spoofing untuk Laravel/PHP
      Object.entries(form).forEach(([k, v]) => formData.append(k, v ?? ''));
      variants.forEach((v, i) => {
        formData.append(`variants[${i}][id]`, v.id);
        formData.append(`variants[${i}][color_name]`, v.color_name ?? "");
        formData.append(`variants[${i}][color_hex]`, v.color_hex ?? "");
        if (v.newImage) formData.append(`variants[${i}][image]`, v.newImage);
      });
      
      await api.post(`/admin/products/${id}`, formData);
      await Swal.fire({
        title: "Berhasil!",
        text: "Perubahan produk berhasil disimpan.",
        icon: "success",
        confirmButtonColor: "#e61e25",
        timer: 1800,
        showConfirmButton: false,
      });
      navigate(`/admin/inventory/${id}`);
    } catch (err) {
      const errors = err.response?.data?.errors;
      const msg = errors ? Object.values(errors).flat().join(' | ') : 'Gagal menyimpan perubahan.';
      setError(msg);
      Swal.fire({ title: "Gagal", text: msg, icon: "error", confirmButtonColor: "#e61e25" });
    } finally {
      setSaving(false);
    }
  };

  // ── Render Loading State ──
  if (loading) return (
    <div className="min-h-screen bg-stone-50 font-sans pb-24">
      <div className="bg-white border-b border-stone-200 px-8 py-5 shadow-sm flex items-center gap-4">
        <Sk className="w-10 h-10 rounded-full" />
        <div className="space-y-2">
          <Sk className="h-3 w-32 rounded-full" />
          <Sk className="h-4 w-48 rounded-full" />
        </div>
      </div>
      <div className="max-w-[1400px] mx-auto px-6 md:px-8 mt-10">
        <div className="mb-10 space-y-3">
          <Sk className="h-10 w-3/4 max-w-lg rounded-xl" />
          <Sk className="h-4 w-64 rounded-full" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          <div className="lg:col-span-7 xl:col-span-8 space-y-8">
            <Sk className="w-full h-80 rounded-[2rem]" />
            <Sk className="w-full h-64 rounded-[2rem]" />
          </div>
          <div className="lg:col-span-5 xl:col-span-4">
            <Sk className="w-full aspect-[4/5] rounded-[2rem]" />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans pb-24" style={{ fontFamily: "Manrope, sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* ── Top Navbar / Breadcrumb ── */}
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
              <h1 className="text-xl font-extrabold text-stone-900">Edit Produk</h1>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="font-bold text-[11px] uppercase tracking-widest px-6 py-3 rounded-xl text-stone-500 hover:bg-stone-100 hover:text-stone-900 transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex items-center gap-2 bg-stone-900 text-white font-bold text-[11px] uppercase tracking-widest px-8 py-3 rounded-xl hover:bg-[#e61e25] transition-all shadow-sm disabled:opacity-50 hover:-translate-y-0.5"
            >
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-8 mt-10">
        
        {/* Page Header */}
        <div className="mb-10 max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-black text-stone-900 leading-tight mb-3">
            Perbarui Spesimen
          </h2>
          <p className="text-stone-500 font-medium leading-relaxed">
            Mengedit data spesimen: <strong className="text-stone-700">{form.name || `Produk #${id}`}</strong>. Pastikan perubahan harga dan varian sudah benar sebelum disimpan.
          </p>
        </div>

        {error && (
          <div className="mb-8 p-5 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-4 max-w-3xl">
            <svg className="w-6 h-6 text-[#e61e25] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <div>
              <h4 className="text-sm font-extrabold text-stone-900 mb-1">Gagal menyimpan perubahan</h4>
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            
            {/* ── Left Column (Forms) ── */}
            <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-8">
              
              {/* Informasi Dasar Card */}
              <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-sm border border-stone-100">
                <h3 className="text-lg font-black text-stone-900 flex items-center gap-3 mb-8 pb-6 border-b border-stone-100">
                  <svg className="w-5 h-5 text-[#e61e25]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  Informasi Utama
                </h3>
                
                <div className="space-y-6">
                  {/* Nama Spesimen */}
                  <div>
                    <label className="text-[11px] font-extrabold uppercase tracking-widest text-stone-500 mb-2.5 block">
                      Nama Spesimen <span className="text-[#e61e25]">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      placeholder="Misal: Premium Katun Toyobo Fodu"
                      required
                      className="w-full bg-stone-50 border border-stone-200 text-stone-800 text-sm font-bold rounded-2xl px-5 py-4 focus:outline-none focus:border-[#e61e25] focus:ring-4 focus:ring-[#e61e25]/10 transition-all placeholder:text-stone-400"
                    />
                  </div>

                  {/* Grid SKU & Kategori */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-[11px] font-extrabold uppercase tracking-widest text-stone-500 mb-2.5 block">
                        Kode SKU <span className="text-[#e61e25]">*</span>
                      </label>
                      <input
                        type="text"
                        value={form.sku_code}
                        onChange={(e) => handleChange("sku_code", e.target.value)}
                        placeholder="Misal: SKU-001-SILK"
                        required
                        className="w-full bg-stone-50 border border-stone-200 text-stone-800 text-sm font-bold rounded-2xl px-5 py-4 focus:outline-none focus:border-[#e61e25] focus:ring-4 focus:ring-[#e61e25]/10 transition-all placeholder:text-stone-400"
                      />
                    </div>
                    <div ref={catDropdownRef} className="relative">
                      <label className="text-[11px] font-extrabold uppercase tracking-widest text-stone-500 mb-2.5 block">
                        Kategori <span className="text-[#e61e25]">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                        className={`w-full flex items-center justify-between bg-stone-50 border text-stone-800 text-sm font-bold rounded-2xl px-5 py-4 focus:outline-none transition-all cursor-pointer ${
                          categoryDropdownOpen
                            ? "border-[#e61e25] ring-4 ring-[#e61e25]/10"
                            : "border-stone-200 hover:border-stone-300"
                        }`}
                      >
                        <span className={form.category_id ? "text-stone-800" : "text-stone-400"}>
                          {categories.find((c) => String(c.id) === String(form.category_id))?.name || "Pilih Kategori"}
                        </span>
                        <div className={`text-stone-400 transition-transform duration-300 ${categoryDropdownOpen ? "rotate-180 text-[#e61e25]" : ""}`}>
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </button>

                      {categoryDropdownOpen && (
                        <div className="absolute left-0 right-0 mt-2 py-2 bg-white border border-stone-100 rounded-2xl shadow-[0_12px_30px_rgba(0,0,0,0.08)] z-50 max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                          {categories.map((c) => {
                            const isSelected = String(c.id) === String(form.category_id);
                            return (
                              <button
                                key={c.id}
                                type="button"
                                onClick={() => {
                                  handleChange("category_id", c.id);
                                  setCategoryDropdownOpen(false);
                                }}
                                className={`w-full px-5 py-3.5 flex items-center justify-between text-left text-sm font-bold transition-colors ${
                                  isSelected
                                    ? "text-[#e61e25] bg-red-50/50"
                                    : "text-stone-700 hover:text-[#e61e25] hover:bg-stone-50/80"
                                }`}
                              >
                                <span className="flex items-center gap-2">
                                  {isSelected && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#e61e25]"></span>
                                  )}
                                  {c.name}
                                </span>
                                {isSelected && (
                                  <svg className="w-4 h-4 text-[#e61e25]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Grid Harga */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-[11px] font-extrabold uppercase tracking-widest text-stone-500 mb-2.5 block">
                        Harga Minimum (Rp)
                      </label>
                      <div className="relative">
                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-400 font-bold">Rp</span>
                        <input
                          type="number"
                          value={form.price_min}
                          onChange={(e) => handleChange("price_min", e.target.value)}
                          placeholder="35000"
                          min="0"
                          className="w-full bg-stone-50 border border-stone-200 text-stone-800 text-sm font-bold rounded-2xl pl-12 pr-5 py-4 focus:outline-none focus:border-[#e61e25] focus:ring-4 focus:ring-[#e61e25]/10 transition-all placeholder:text-stone-400"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] font-extrabold uppercase tracking-widest text-stone-500 mb-2.5 block">
                        Harga Maksimum (Rp)
                      </label>
                      <div className="relative">
                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-400 font-bold">Rp</span>
                        <input
                          type="number"
                          value={form.price_max}
                          onChange={(e) => handleChange("price_max", e.target.value)}
                          placeholder="45000"
                          min="0"
                          className="w-full bg-stone-50 border border-stone-200 text-stone-800 text-sm font-bold rounded-2xl pl-12 pr-5 py-4 focus:outline-none focus:border-[#e61e25] focus:ring-4 focus:ring-[#e61e25]/10 transition-all placeholder:text-stone-400"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Deskripsi Card */}
              <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-sm border border-stone-100">
                <h3 className="text-lg font-black text-stone-900 flex items-center gap-3 mb-8 pb-6 border-b border-stone-100">
                  <svg className="w-5 h-5 text-[#e61e25]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>
                  Deskripsi / Catatan Produk
                </h3>
                <textarea
                  value={form.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Tuliskan detail tekstur, komposisi, atau rekomendasi penggunaan bahan ini..."
                  className="w-full min-h-[160px] resize-y bg-stone-50 border border-stone-200 text-stone-800 text-sm font-semibold rounded-2xl px-5 py-4 focus:outline-none focus:border-[#e61e25] focus:ring-4 focus:ring-[#e61e25]/10 transition-all placeholder:text-stone-400 leading-relaxed"
                />
              </div>

              {/* Varian Warna Card */}
              {variants.length > 0 && (
                <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-sm border border-stone-100">
                  <h3 className="text-lg font-black text-stone-900 flex items-center gap-3 mb-8 pb-6 border-b border-stone-100">
                    <svg className="w-5 h-5 text-[#e61e25]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
                    Varian Warna & Gambar
                  </h3>
                  
                  <div className="flex flex-col gap-6">
                    {variants.map((v) => {
                      // Bikin preview jika ada file baru yang dipilih, kalau tidak pakai gambar eksisting
                      const previewImg = v.newImage 
                        ? URL.createObjectURL(v.newImage) 
                        : getImageUrl(v.image_path);

                      return (
                        <div key={v.id} className="p-6 bg-stone-50 rounded-3xl border border-stone-200 flex flex-col md:flex-row gap-6 items-center">
                          {/* Circle Image Preview */}
                          <div className="w-20 h-20 rounded-full border-2 border-white shadow-md bg-stone-200 overflow-hidden flex-shrink-0 relative group">
                            {previewImg ? (
                              <img src={previewImg} alt="Varian" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-stone-400">
                                <span className="material-symbols-outlined">image</span>
                              </div>
                            )}
                            {/* Hover overlay uploader */}
                            <label className="absolute inset-0 bg-stone-900/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                              <span className="material-symbols-outlined text-white text-xl">upload</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleVariantChange(v.id, 'newImage', e.target.files[0])}
                              />
                            </label>
                          </div>

                          <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="text-[10px] font-extrabold uppercase tracking-widest text-stone-500 mb-2 block">
                                Ganti File Gambar (Opsional)
                              </label>
                              <input
                                type="file"
                                accept="image/*"
                                className="w-full text-xs text-stone-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-[11px] file:font-extrabold file:uppercase file:tracking-widest file:bg-white file:text-stone-700 file:shadow-sm file:border file:border-stone-200 hover:file:bg-stone-100 transition-all cursor-pointer"
                                onChange={(e) => handleVariantChange(v.id, 'newImage', e.target.files[0])}
                              />
                            </div>
                            
                            <div>
                              <label className="text-[10px] font-extrabold uppercase tracking-widest text-stone-500 mb-2 block">
                                Warna Hex
                              </label>
                              <div className="flex items-center gap-3 bg-white border border-stone-200 rounded-xl px-3 py-2">
                                <div className="relative w-8 h-8 rounded-full overflow-hidden shadow-sm flex-shrink-0 border border-black/10">
                                  <input
                                    type="color"
                                    className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer"
                                    value={v.color_hex ?? "#000000"}
                                    onChange={(e) => handleVariantChange(v.id, "color_hex", e.target.value)}
                                  />
                                </div>
                                <span className="font-mono text-sm font-bold text-stone-700 tracking-wider">
                                  {(v.color_hex ?? "#000000").toUpperCase()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>

            {/* ── Right Column (Preview) ── */}
            <div className="lg:col-span-5 xl:col-span-4">
              <div className="sticky top-32">
                <h3 className="text-[11px] font-extrabold uppercase tracking-widest text-stone-400 mb-4 ml-2">
                  Pratinjau Utama
                </h3>
                {variants.length > 0 ? (
                  <div className="w-full aspect-[4/5] bg-white rounded-[2.5rem] p-4 shadow-sm border border-stone-100 overflow-hidden">
                    <div className="w-full h-full rounded-[2rem] bg-stone-100 overflow-hidden border border-stone-100">
                      {variants[0].newImage ? (
                        <img
                          src={URL.createObjectURL(variants[0].newImage)}
                          alt="Preview Varian"
                          className="w-full h-full object-cover"
                        />
                      ) : variants[0]?.image_path ? (
                        <img
                          alt="Specimen"
                          className="w-full h-full object-cover"
                          src={getImageUrl(variants[0].image_path)}
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-stone-300 gap-3">
                          <span className="material-symbols-outlined text-6xl">image</span>
                          <p className="text-xs font-bold uppercase tracking-widest">Tidak Ada Foto</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="w-full aspect-[4/5] bg-stone-50 border-2 border-dashed border-stone-200 rounded-[2.5rem] flex flex-col items-center justify-center text-center p-6 gap-4">
                    <div className="w-16 h-16 bg-white text-stone-300 rounded-full flex items-center justify-center shadow-sm">
                      <span className="material-symbols-outlined text-3xl">image_not_supported</span>
                    </div>
                    <p className="text-xs font-bold text-stone-500 uppercase tracking-widest">Belum ada varian gambar</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Action Buttons (Bottom) */}
          <div className="md:hidden mt-10 pt-6 border-t border-stone-200 flex flex-col gap-4">
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="w-full bg-stone-900 text-white font-bold text-[12px] uppercase tracking-widest py-4 rounded-xl shadow-lg hover:bg-[#e61e25] transition-colors disabled:opacity-50"
            >
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-full bg-white border border-stone-200 text-stone-600 font-bold text-[12px] uppercase tracking-widest py-4 rounded-xl hover:bg-stone-50 transition-colors"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}