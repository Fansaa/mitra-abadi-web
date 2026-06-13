import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api";
import Swal from "sweetalert2";

export default function SpecimenEntry() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    category_id: "",
    price_min: "",
    price_max: "",
    sku_code: "",
    description: "",
  });
  const [variant, setVariant] = useState({ color_hex: "#4a4a4a", image: null });
  const [imagePreview, setImagePreview] = useState(null);
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
    api.get("/admin/categories").then((res) => setCategories(res.data.data)).catch(console.error);
  }, []);

  // Handler untuk mengunggah gambar dan membuat preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVariant((prev) => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleChange = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v !== "") formData.append(k, v); });
      formData.append("variants[0][color_name]", "");
      formData.append("variants[0][color_hex]", variant.color_hex);
      formData.append("variants[0][stock_roll]", 0);
      if (variant.image) formData.append("variants[0][image]", variant.image);
      
      await api.post("/admin/products", formData);
      await Swal.fire({
        title: "Berhasil!",
        text: "Produk baru berhasil ditambahkan.",
        icon: "success",
        confirmButtonColor: "#e61e25",
        timer: 1800,
        showConfirmButton: false,
      });
      navigate("/admin/inventory");
    } catch (err) {
      const errors = err.response?.data?.errors;
      setError(errors ? Object.values(errors).flat().join(" | ") : "Gagal menyimpan produk.");
    } finally {
      setLoading(false);
    }
  };

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
              <h1 className="text-xl font-extrabold text-stone-900">Tambah Produk Baru</h1>
            </div>
          </div>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="hidden md:flex items-center gap-2 bg-stone-900 text-white font-bold text-[11px] uppercase tracking-widest px-6 py-3 rounded-xl hover:bg-[#e61e25] transition-all shadow-sm disabled:opacity-50"
          >
            {loading ? "Menyimpan..." : "Simpan Produk"}
          </button>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-8 mt-10">
        
        <div className="mb-10 max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-black text-stone-900 leading-tight mb-3">
            Registrasi Spesimen
          </h2>
          <p className="text-stone-500 font-medium leading-relaxed">
            Daftarkan produk tekstil baru ke dalam arsip sistem. Pastikan seluruh detail seperti SKU, Harga, dan Kategori terisi dengan akurat.
          </p>
        </div>

        {error && (
          <div className="mb-8 p-5 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-4">
            <svg className="w-6 h-6 text-[#e61e25] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <div>
              <h4 className="text-sm font-extrabold text-stone-900 mb-1">Gagal menyimpan produk</h4>
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-12 gap-8 xl:gap-10 items-start">
          
          {/* ── Left Column ── */}
          <div className="xl:col-span-7 flex flex-col gap-8">
            
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
                    Nama Kain / Spesimen <span className="text-[#e61e25]">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="Misal: Premium Katun Toyobo Fodu"
                    required
                    className="w-full bg-stone-50 border border-stone-200 text-stone-800 text-sm font-bold rounded-2xl px-5 py-4 focus:outline-none focus:border-[#e61e25] focus:ring-4 focus:ring-[#e61e25]/10 transition-all placeholder:text-stone-400 placeholder:font-medium"
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
                      placeholder="Misal: SKU-KTN-001"
                      required
                      className="w-full bg-stone-50 border border-stone-200 text-stone-800 text-sm font-bold rounded-2xl px-5 py-4 focus:outline-none focus:border-[#e61e25] focus:ring-4 focus:ring-[#e61e25]/10 transition-all placeholder:text-stone-400 placeholder:font-medium"
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
                        {categories.find((c) => String(c.id) === String(form.category_id))?.name || "Pilih Kategori Kriteria"}
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

                {/* Deskripsi */}
                <div>
                  <label className="text-[11px] font-extrabold uppercase tracking-widest text-stone-500 mb-2.5 block">
                    Deskripsi Lengkap
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    placeholder="Tuliskan detail tekstur, komposisi, atau rekomendasi penggunaan bahan ini..."
                    className="w-full min-h-[160px] resize-none bg-stone-50 border border-stone-200 text-stone-800 text-sm font-semibold rounded-2xl px-5 py-4 focus:outline-none focus:border-[#e61e25] focus:ring-4 focus:ring-[#e61e25]/10 transition-all placeholder:text-stone-400 placeholder:font-medium leading-relaxed"
                  />
                </div>
              </div>
            </div>

            {/* Pricing Card */}
            <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-sm border border-stone-100">
              <h3 className="text-lg font-black text-stone-900 flex items-center gap-3 mb-8 pb-6 border-b border-stone-100">
                <svg className="w-5 h-5 text-[#e61e25]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Range Harga per Yard (IDR)
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[11px] font-extrabold uppercase tracking-widest text-stone-500 mb-2.5 block">
                    Harga Minimum <span className="text-[#e61e25]">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-400 font-bold">Rp</span>
                    <input
                      type="number"
                      value={form.price_min}
                      onChange={(e) => handleChange("price_min", e.target.value)}
                      placeholder="35000"
                      min="0"
                      required
                      className="w-full bg-stone-50 border border-stone-200 text-stone-800 text-sm font-bold rounded-2xl pl-12 pr-5 py-4 focus:outline-none focus:border-[#e61e25] focus:ring-4 focus:ring-[#e61e25]/10 transition-all placeholder:text-stone-400 placeholder:font-medium"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-extrabold uppercase tracking-widest text-stone-500 mb-2.5 block">
                    Harga Maksimum <span className="text-[#e61e25]">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-400 font-bold">Rp</span>
                    <input
                      type="number"
                      value={form.price_max}
                      onChange={(e) => handleChange("price_max", e.target.value)}
                      placeholder="45000"
                      min="0"
                      required
                      className="w-full bg-stone-50 border border-stone-200 text-stone-800 text-sm font-bold rounded-2xl pl-12 pr-5 py-4 focus:outline-none focus:border-[#e61e25] focus:ring-4 focus:ring-[#e61e25]/10 transition-all placeholder:text-stone-400 placeholder:font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* ── Right Column ── */}
          <div className="xl:col-span-5 flex flex-col gap-8">
            
            {/* Visual Produk Card */}
            <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-sm border border-stone-100">
              <h3 className="text-lg font-black text-stone-900 flex items-center gap-3 mb-8 pb-6 border-b border-stone-100">
                <svg className="w-5 h-5 text-[#e61e25]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                Visual Produk
              </h3>

              {/* Photo Upload */}
              <div className="mb-8">
                <label className="text-[11px] font-extrabold uppercase tracking-widest text-stone-500 mb-2.5 block">
                  Foto Utama Resolusi Tinggi
                </label>
                <label className="relative block w-full h-[320px] rounded-3xl border-2 border-dashed border-stone-200 bg-stone-50 hover:bg-red-50/50 hover:border-[#e61e25]/50 transition-all duration-300 cursor-pointer overflow-hidden group">
                  {imagePreview ? (
                    <>
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-stone-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span className="bg-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg flex items-center gap-2">
                          <svg className="w-4 h-4 text-stone-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                          Ganti Foto
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                      <div className="w-16 h-16 rounded-full bg-white shadow-sm border border-stone-100 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:shadow-md transition-all duration-300">
                        <svg className="w-8 h-8 text-stone-300 group-hover:text-[#e61e25] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                      </div>
                      <p className="font-bold text-stone-800 mb-1">Klik untuk unggah foto</p>
                      <p className="text-xs font-medium text-stone-400">Atau seret & letakkan file di sini<br/>(Maksimal 10MB, JPG/PNG)</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
              </div>

              {/* Varian Warna Default */}
              <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200">
                <div className="flex items-center justify-between mb-4">
                  <label className="text-[11px] font-extrabold uppercase tracking-widest text-stone-500">
                    Varian Warna (Hex)
                  </label>
                  <span className="text-[9px] font-extrabold uppercase tracking-widest bg-stone-200 text-stone-600 px-2 py-1 rounded-md">Default</span>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden shadow-sm border border-stone-200 flex-shrink-0">
                    <input
                      type="color"
                      value={variant.color_hex}
                      onChange={(e) => setVariant((prev) => ({ ...prev, color_hex: e.target.value }))}
                      className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer"
                    />
                  </div>
                  <div className="flex-1 bg-white border border-stone-200 rounded-xl px-4 py-3 flex items-center justify-between">
                    <span className="font-mono text-sm font-bold text-stone-800 tracking-wider">
                      {variant.color_hex.toUpperCase()}
                    </span>
                    <span className="text-xs font-semibold text-stone-400">Kode Warna</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </form>

        {/* Mobile Action Bar */}
        <div className="md:hidden mt-8 flex flex-col gap-4">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-stone-900 text-white font-bold text-[12px] uppercase tracking-widest py-4 rounded-xl shadow-lg hover:bg-[#e61e25] transition-colors disabled:opacity-50"
          >
            {loading ? "Menyimpan..." : "Simpan Produk"}
          </button>
          <button
            onClick={() => navigate(-1)}
            className="w-full bg-white border border-stone-200 text-stone-600 font-bold text-[12px] uppercase tracking-widest py-4 rounded-xl hover:bg-stone-50 transition-colors"
          >
            Batal
          </button>
        </div>

      </div>
    </div>
  );
}