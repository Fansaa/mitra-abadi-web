import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api";

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
    composition: "",
    yard_per_roll: "",
    description: "",
  });
  const [variant, setVariant] = useState({ color_name: "", color_hex: "#000000", stock_roll: "", image: null });

  useEffect(() => {
    api.get('/admin/categories').then(res => setCategories(res.data.data)).catch(console.error);
  }, []);

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v !== "") formData.append(k, v); });
      if (variant.color_name) {
        formData.append('variants[0][color_name]', variant.color_name);
        formData.append('variants[0][color_hex]', variant.color_hex);
        formData.append('variants[0][stock_roll]', variant.stock_roll || 0);
        if (variant.image) formData.append('variants[0][image]', variant.image);
      }
      await api.post('/admin/products', formData);
      navigate('/admin/inventory');
    } catch (err) {
      const errors = err.response?.data?.errors;
      setError(errors ? Object.values(errors).flat().join(' | ') : 'Gagal menyimpan produk.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-4xl font-display font-extrabold text-on-surface tracking-tight mb-2">
          Tambah Produk Baru
        </h2>
        <p className="font-body text-lg text-on-surface-variant leading-relaxed">
          Daftarkan produk kain baru ke sistem. Pastikan semua data terisi dengan lengkap dan benar.
        </p>
      </div>

      {/* Form */}
      <div>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-12 gap-8 xl:gap-12 items-start">
          {/* Left Column */}
          <div className="xl:col-span-7 flex flex-col gap-10">
            {/* Informasi Dasar */}
            <section className="bg-surface-container-lowest rounded-xl p-10 shadow-[0_40px_80px_-20px_rgba(26,28,28,0.04)]">
              <h3 className="font-headline text-lg font-medium text-on-surface mb-8">
                Informasi Dasar
              </h3>
              <div className="space-y-8">
                <div>
                  <label className="font-body text-[10px] uppercase tracking-widest text-on-surface-variant block mb-2">
                    Nama Spesimen
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="Mis: Royal Silk Jacquard Motif Kawung"
                    className="w-full border-0 border-b border-outline-variant bg-transparent px-0 py-2 font-body text-on-surface focus:ring-0 focus:border-primary transition-colors placeholder:text-on-surface-variant/40"
                  />
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <label className="font-body text-[10px] uppercase tracking-widest text-on-surface-variant block mb-2">
                      Komposisi
                    </label>
                    <input
                      type="text"
                      value={form.composition}
                      onChange={(e) => handleChange("composition", e.target.value)}
                      placeholder="Mis: 100% Silk"
                      className="w-full border-0 border-b border-outline-variant bg-transparent px-0 py-2 font-body text-on-surface focus:ring-0 focus:border-primary transition-colors placeholder:text-on-surface-variant/40"
                    />
                  </div>
                  <div>
                    <label className="font-body text-[10px] uppercase tracking-widest text-on-surface-variant block mb-2">
                      Kategori Material
                    </label>
                    <div className="relative">
                      <select
                        value={form.category_id}
                        onChange={(e) => handleChange("category_id", e.target.value)}
                        className="w-full border-0 border-b border-outline-variant bg-transparent px-0 py-2 font-body text-on-surface focus:ring-0 focus:border-primary transition-colors appearance-none cursor-pointer"
                      >
                        <option value="" disabled>
                          Pilih Kategori
                        </option>
                        {categories.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                      <span className="material-symbols-outlined absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
                        expand_more
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <label className="font-body text-[10px] uppercase tracking-widest text-on-surface-variant block mb-2">
                      Yard/Roll
                    </label>
                    <input
                      type="number"
                      value={form.yard_per_roll}
                      onChange={(e) => handleChange("yard_per_roll", e.target.value)}
                      placeholder="55"
                      min="0.01"
                      required
                      className="w-full border-0 border-b border-outline-variant bg-transparent px-0 py-2 font-body text-on-surface focus:ring-0 focus:border-primary transition-colors placeholder:text-on-surface-variant/40"
                    />
                  </div>
                  <div>
                    <label className="font-body text-[10px] uppercase tracking-widest text-on-surface-variant block mb-2">
                      Warna
                    </label>
                    <input
                      type="text"
                      value={variant.color_name}
                      onChange={(e) => setVariant(prev => ({ ...prev, color_name: e.target.value }))}
                      placeholder="Mis: Indigo Deep Blue"
                      className="w-full border-0 border-b border-outline-variant bg-transparent px-0 py-2 font-body text-on-surface focus:ring-0 focus:border-primary transition-colors placeholder:text-on-surface-variant/40"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Informasi Harga */}
            <section className="bg-surface-container-lowest rounded-xl p-10 shadow-[0_40px_80px_-20px_rgba(26,28,28,0.04)]">
              <h3 className="font-headline text-lg font-medium text-on-surface mb-8">
                Range Harga (IDR)
              </h3>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label className="font-body text-[10px] uppercase tracking-widest text-on-surface-variant block mb-2">
                    Harga Minimum
                  </label>
                  <input
                    type="number"
                    value={form.price_min}
                    onChange={(e) => handleChange("price_min", e.target.value)}
                    placeholder="50000"
                    className="w-full border-0 border-b border-outline-variant bg-transparent px-0 py-2 font-body text-on-surface focus:ring-0 focus:border-primary transition-colors placeholder:text-on-surface-variant/40"
                  />
                </div>
                <div>
                  <label className="font-body text-[10px] uppercase tracking-widest text-on-surface-variant block mb-2">
                    Harga Maksimum
                  </label>
                  <input
                    type="number"
                    value={form.price_max}
                    onChange={(e) => handleChange("price_max", e.target.value)}
                    placeholder="150000"
                    className="w-full border-0 border-b border-outline-variant bg-transparent px-0 py-2 font-body text-on-surface focus:ring-0 focus:border-primary transition-colors placeholder:text-on-surface-variant/40"
                  />
                </div>
              </div>
            </section>

            {/* Manajemen Stok */}
            <section className="bg-surface-container-lowest rounded-xl p-10 shadow-[0_40px_80px_-20px_rgba(26,28,28,0.04)]">
              <h3 className="font-headline text-lg font-medium text-on-surface mb-8">
                Manajemen Stok
              </h3>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label className="font-body text-[10px] uppercase tracking-widest text-on-surface-variant block mb-2">
                    Stok Masuk (Roll)
                  </label>
                  <input
                    type="number"
                    value={variant.stock_roll}
                    onChange={(e) => setVariant(prev => ({ ...prev, stock_roll: e.target.value }))}
                    placeholder="1"
                    className="w-full border-0 border-b border-outline-variant bg-transparent px-0 py-2 font-body text-on-surface focus:ring-0 focus:border-primary transition-colors placeholder:text-on-surface-variant/40"
                  />
                </div>
                <div>
                  <label className="font-body text-[10px] uppercase tracking-widest text-on-surface-variant block mb-2">
                    Warna Hex
                  </label>
                  <input
                    type="color"
                    value={variant.color_hex}
                    onChange={(e) => setVariant(prev => ({ ...prev, color_hex: e.target.value }))}
                    className="w-full border-0 border-b border-outline-variant bg-transparent px-0 py-2 font-body text-on-surface focus:ring-0 focus:border-primary transition-colors h-10 cursor-pointer"
                  />
                </div>
              </div>
            </section>
          </div>

          {/* Right Column */}
          <div className="xl:col-span-5 flex flex-col gap-10">
            {/* Media Arsip */}
            <section className="bg-surface-container-lowest rounded-xl p-8 shadow-[0_40px_80px_-20px_rgba(26,28,28,0.04)]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-headline text-lg font-medium text-on-surface">Media Arsip</h3>
                <span className="font-body text-[10px] uppercase tracking-widest text-outline bg-surface-container px-2 py-1 rounded-full">
                  Resolusi Tinggi
                </span>
              </div>
              <label className="relative group border-2 border-dashed border-outline-variant hover:border-primary transition-colors duration-300 rounded-xl bg-surface-container-lowest overflow-hidden cursor-pointer h-72 flex flex-col items-center justify-center text-center p-8 block">
                <div className="w-16 h-16 rounded-full bg-surface-container-low flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-primary/10 transition-all duration-300">
                  <span className="material-symbols-outlined text-3xl text-on-surface-variant group-hover:text-primary transition-colors">
                    add_a_photo
                  </span>
                </div>
                <p className="font-body text-sm text-on-surface font-medium mb-1">
                  Tarik &amp; Lepas foto makro di sini
                </p>
                <p className="font-body text-xs text-on-surface-variant max-w-[200px]">
                  Mendukung JPG, PNG. Maksimal 10MB.
                </p>
                {variant.image && (
                  <p className="font-body text-xs text-primary mt-2">{variant.image.name}</p>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setVariant(prev => ({ ...prev, image: e.target.files[0] }))}
                />
              </label>
            </section>

            {/* Catatan Kurator */}
            <section className="bg-surface-container-lowest rounded-xl p-8 shadow-[0_40px_80px_-20px_rgba(26,28,28,0.04)] flex-1 flex flex-col">
              <h3 className="font-headline text-lg font-medium text-on-surface mb-6">
                Catatan Kurator
              </h3>
              <div className="relative flex-1 flex flex-col">
                <textarea
                  value={form.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Tuliskan deskripsi historis, karakteristik tekstur, atau instruksi perawatan khusus untuk spesimen ini..."
                  className="w-full flex-1 min-h-[200px] resize-none border-0 bg-surface-container-low rounded-lg p-6 font-body text-sm text-on-surface focus:ring-0 focus:bg-surface-container-highest transition-colors placeholder:text-on-surface-variant/50 leading-relaxed"
                />
                <div className="absolute bottom-4 right-6 pointer-events-none">
                  <span className="material-symbols-outlined text-outline-variant/30 text-4xl">
                    edit_document
                  </span>
                </div>
              </div>
            </section>
          </div>
        </form>

        {/* Action Bar */}
        <div className="mt-16 pt-8 border-t border-outline-variant/20 flex items-center justify-end gap-6">
          {error && <p className="text-red-500 text-sm mt-2 mr-auto">{error}</p>}
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-on-surface-variant font-body text-[11px] uppercase tracking-widest font-semibold px-4 py-3 hover:text-on-surface transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="bg-primary-container text-on-primary-container font-body text-[11px] uppercase tracking-widest font-semibold px-10 py-4 rounded shadow-lg shadow-primary-container/20 hover:bg-primary hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Menyimpan..." : "Simpan ke Arsip"}
          </button>
        </div>
      </div>
    </div>
  );
}
