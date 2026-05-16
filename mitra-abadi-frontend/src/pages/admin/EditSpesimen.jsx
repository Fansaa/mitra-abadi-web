import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../lib/api";
import PageLoader from "../../components/PageLoader";

export default function EditSpesimen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "", category_id: "", price_min: "", price_max: "",
    composition: "", yard_per_roll: "", description: "",
  });
  const [variants, setVariants] = useState([]);

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
        composition: p.composition ?? "",
        yard_per_roll: p.yard_per_roll ?? "",
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
      formData.append('_method', 'PUT');
      Object.entries(form).forEach(([k, v]) => formData.append(k, v ?? ''));
      variants.forEach((v, i) => {
        formData.append(`variants[${i}][id]`, v.id);
        formData.append(`variants[${i}][color_name]`, v.color_name ?? "");
        formData.append(`variants[${i}][color_hex]`, v.color_hex ?? "");
        if (v.newImage) formData.append(`variants[${i}][image]`, v.newImage);
      });
      await api.post(`/admin/products/${id}`, formData);
      navigate(`/admin/inventory/${id}`);
    } catch (err) {
      const errors = err.response?.data?.errors;
      setError(errors ? Object.values(errors).flat().join(' | ') : 'Gagal menyimpan perubahan.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="px-8 py-8">
      {/* Header */}
      <div className="sticky top-16 z-10 bg-surface/90 backdrop-blur-md py-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="editorial-link mb-4 text-on-surface-variant"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Kembali ke Detail
          </button>
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-on-surface">
            Edit Produk
          </h1>
          <p className="text-on-surface-variant mt-2">
            Mengedit data produk: {form.name || `Produk #${id}`}
          </p>
        </div>

        <div className="flex items-center gap-6">
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="editorial-link text-on-surface-variant hover:text-error"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="bg-primary-container text-on-primary-container hover:bg-primary transition-all duration-300 px-8 py-3 rounded-md font-bold text-sm tracking-wide shadow-[0_4px_14px_0_rgba(230,30,37,0.2)] hover:shadow-[0_6px_20px_rgba(230,30,37,0.3)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </div>

      {/* Main Canvas */}
      <form onSubmit={handleSubmit} className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mt-8">
          {/* Left Column */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-12">
            {/* Informasi Dasar */}
            <section className="bg-surface-container-lowest p-8 rounded-xl tonal-lift">
              <h2 className="font-headline text-xl font-bold mb-8 text-on-surface flex items-center gap-3">
                <span className="material-symbols-outlined fill text-primary">info</span>
                Informasi Dasar
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                <div>
                  <label className="ledger-label">Nama Spesimen</label>
                  <input
                    type="text"
                    className="ledger-input"
                    value={form.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                  />
                </div>
                <div>
                  <label className="ledger-label">Komposisi</label>
                  <input
                    type="text"
                    className="ledger-input"
                    value={form.composition}
                    onChange={(e) => handleChange("composition", e.target.value)}
                    placeholder="Mis: 100% Silk"
                  />
                </div>
                <div>
                  <label className="ledger-label">Kategori</label>
                  <div className="relative">
                    <select
                      className="ledger-input appearance-none bg-transparent pr-8 cursor-pointer"
                      value={form.category_id}
                      onChange={(e) => handleChange("category_id", e.target.value)}
                    >
                      <option value="" disabled>Pilih Kategori</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-outline">
                      expand_more
                    </span>
                  </div>
                </div>
                <div>
                  <label className="ledger-label">Harga Minimum (IDR)</label>
                  <input
                    type="number"
                    className="ledger-input"
                    value={form.price_min}
                    onChange={(e) => handleChange("price_min", e.target.value)}
                    placeholder="50000"
                  />
                </div>
                <div>
                  <label className="ledger-label">Harga Maksimum (IDR)</label>
                  <input
                    type="number"
                    className="ledger-input"
                    value={form.price_max}
                    onChange={(e) => handleChange("price_max", e.target.value)}
                    placeholder="150000"
                  />
                </div>
                <div>
                  <label className="ledger-label">Yard/Roll</label>
                  <input
                    type="number"
                    className="ledger-input"
                    value={form.yard_per_roll}
                    onChange={(e) => handleChange("yard_per_roll", e.target.value)}
                    placeholder="55"
                  />
                </div>
              </div>
            </section>

            {/* Variants */}
            {variants.length > 0 && (
              <section className="bg-surface-container-lowest p-8 rounded-xl tonal-lift">
                <h2 className="font-headline text-xl font-bold mb-8 text-on-surface flex items-center gap-3">
                  <span className="material-symbols-outlined fill text-primary">palette</span>
                  Varian Warna
                </h2>
                <div className="flex flex-col gap-8">
                  {variants.map((v) => (
                    <div key={v.id} className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-6 border-b border-outline-variant/20 last:border-0 last:pb-0">
                      <div>
                        <label className="ledger-label">Nama Warna</label>
                        <input
                          type="text"
                          className="ledger-input"
                          value={v.color_name ?? ""}
                          onChange={(e) => handleVariantChange(v.id, "color_name", e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="ledger-label">Hex Warna</label>
                        <input
                          type="color"
                          className="ledger-input h-10 cursor-pointer"
                          value={v.color_hex ?? "#000000"}
                          onChange={(e) => handleVariantChange(v.id, "color_hex", e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="ledger-label">Ganti Gambar</label>
                        <input
                          type="file"
                          accept="image/*"
                          className="w-full text-sm text-on-surface-variant file:mr-3 file:py-1 file:px-3 file:border-0 file:rounded file:bg-surface-container file:text-on-surface file:font-body file:text-xs file:cursor-pointer cursor-pointer"
                          onChange={(e) => handleVariantChange(v.id, 'newImage', e.target.files[0])}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Curator's Notes */}
            <section className="bg-surface-container-lowest p-8 rounded-xl tonal-lift">
              <h2 className="font-headline text-xl font-bold mb-8 text-on-surface flex items-center gap-3">
                <span className="material-symbols-outlined fill text-primary">edit_note</span>
                Catatan / Deskripsi
              </h2>
              <textarea
                className="w-full bg-surface border border-outline-variant/30 rounded-lg p-4 text-on-surface font-body leading-relaxed focus:ring-0 focus:border-primary transition-colors min-h-[200px] resize-y"
                placeholder="Tuliskan deskripsi, karakteristik kain, atau instruksi perawatan khusus..."
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
              />
            </section>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-8">
            {variants.length > 0 ? (
              <section className="bg-surface-container-low rounded-xl p-2 relative overflow-hidden group">
                <div className="absolute top-6 left-6 z-10 flex gap-2">
                  <span className="bg-surface-container-lowest/80 backdrop-blur-md text-on-surface text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full">
                    Gambar Utama
                  </span>
                </div>
                <div className="w-full aspect-[4/5] bg-surface-container-highest rounded-lg overflow-hidden relative">
                  {variants[0]?.image_url ? (
                    <img
                      alt="Specimen"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      src={variants[0].image_url}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-on-surface-variant">
                      <span className="material-symbols-outlined text-6xl">image</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-on-surface/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4 backdrop-blur-sm">
                    <label
                      className="bg-surface-container-lowest text-on-surface p-3 rounded-full hover:bg-primary-container hover:text-on-primary-container transition-colors cursor-pointer"
                      title="Replace Image"
                    >
                      <span className="material-symbols-outlined">cameraswitch</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleVariantChange(variants[0].id, 'newImage', e.target.files[0])}
                      />
                    </label>
                  </div>
                </div>
              </section>
            ) : (
              <section className="bg-surface-container-lowest p-6 rounded-xl border border-dashed border-outline-variant/50 flex flex-col items-center justify-center text-center gap-4 min-h-[160px]">
                <div className="bg-surface text-primary p-4 rounded-full shadow-sm">
                  <span className="material-symbols-outlined text-2xl">image_not_supported</span>
                </div>
                <p className="text-xs text-on-surface-variant">Belum ada varian gambar</p>
              </section>
            )}

            <section className="bg-surface-container-lowest p-6 rounded-xl border border-dashed border-outline-variant/50 hover:bg-surface-container-low transition-colors flex flex-col items-center justify-center text-center gap-4 min-h-[160px]">
              <div className="bg-surface text-primary p-4 rounded-full shadow-sm">
                <span className="material-symbols-outlined text-2xl">add_photo_alternate</span>
              </div>
              <div>
                <h3 className="font-bold text-sm text-on-surface">Unggah Gambar Tambahan</h3>
                <p className="text-xs text-on-surface-variant mt-1 max-w-[200px]">
                  Seret &amp; lepas file JPG atau PNG ke sini.
                </p>
              </div>
            </section>
          </div>
        </div>
      </form>
    </div>
  );
}
