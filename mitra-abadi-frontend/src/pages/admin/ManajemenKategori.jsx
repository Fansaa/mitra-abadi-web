import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api";
import SectionLoader from "../../components/SectionLoader";
import Swal from "sweetalert2";

export default function ManajemenKategori() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  const fetchCategories = () => {
    api.get('/admin/categories')
      .then(res => setCategories(res.data.data ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setSaving(true);
    setError("");
    try {
      await api.post('/admin/categories', { name: newName.trim(), description: newDesc.trim() });
      setNewName("");
      setNewDesc("");
      setShowForm(false);
      fetchCategories();
    } catch (err) {
      setError(err.response?.data?.message ?? 'Gagal membuat kategori.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    const result = await Swal.fire({
      title: "Hapus Kategori?",
      text: `Kategori "${name}" akan dihapus permanen.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e61e25",
      cancelButtonColor: "#78716c",
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
      reverseButtons: true,
    });
    if (!result.isConfirmed) return;
    try {
      await api.delete(`/admin/categories/${id}`);
      Swal.fire({ title: "Dihapus!", text: "Kategori berhasil dihapus.", icon: "success", confirmButtonColor: "#e61e25", timer: 1800, showConfirmButton: false });
      fetchCategories();
    } catch (err) {
      Swal.fire({ title: "Gagal", text: err.response?.data?.message ?? "Gagal menghapus kategori.", icon: "error", confirmButtonColor: "#e61e25" });
    }
  };

  return (
    <div className="px-8 py-8">
      {/* Page Header */}
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-display font-extrabold text-on-surface tracking-tight mb-2">
            Manajemen Kategori
          </h2>
          <p className="text-lg text-on-surface-variant leading-relaxed font-body">
            Kelola dan organisasikan kategori kain untuk katalog dan inventaris.
          </p>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          className="bg-primary-container text-on-primary font-semibold py-3 px-6 rounded-md hover:bg-primary transition-colors flex items-center gap-2 shrink-0 shadow-sm"
        >
          <span className="material-symbols-outlined">add</span>
          <span>Tambah Kategori Baru</span>
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="bg-surface-container-lowest rounded-xl p-8 ring-1 ring-outline-variant/15">
          <h3 className="text-lg font-bold text-on-surface mb-6">Tambah Kategori Baru</h3>
          <form onSubmit={handleCreate} className="flex flex-col gap-4 max-w-lg">
            <div>
              <label className="block font-body text-xs uppercase tracking-widest font-semibold text-on-surface-variant mb-2">
                Nama Kategori *
              </label>
              <input
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="Nama kategori..."
                required
                className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:ring-0 px-0 py-2 font-body text-on-surface placeholder-surface-dim transition-colors"
              />
            </div>
            <div>
              <label className="block font-body text-xs uppercase tracking-widest font-semibold text-on-surface-variant mb-2">
                Deskripsi
              </label>
              <input
                type="text"
                value={newDesc}
                onChange={e => setNewDesc(e.target.value)}
                placeholder="Deskripsi singkat..."
                className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:ring-0 px-0 py-2 font-body text-on-surface placeholder-surface-dim transition-colors"
              />
            </div>
            {error && (
              <p className="text-sm text-error">{error}</p>
            )}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="bg-primary-container text-on-primary font-semibold py-2 px-5 rounded-md hover:bg-primary transition-colors disabled:opacity-50"
              >
                {saving ? 'Menyimpan...' : 'Simpan'}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setError(""); }}
                className="text-on-surface-variant font-semibold py-2 px-5 rounded-md hover:bg-surface-container-low transition-colors"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Category Table */}
      <div className="bg-surface-container-lowest rounded-xl p-8 ring-1 ring-outline-variant/15 flex flex-col gap-6">
        {/* Header */}
        <div className="grid grid-cols-12 gap-4 pb-4 border-b border-surface-variant/50 px-4">
          <div className="col-span-5 text-[10px] font-semibold text-on-surface/50 uppercase tracking-widest font-body">
            Nama Kategori
          </div>
          <div className="col-span-3 text-[10px] font-semibold text-on-surface/50 uppercase tracking-widest font-body">
            Jumlah Produk
          </div>
          <div className="col-span-2 text-[10px] font-semibold text-on-surface/50 uppercase tracking-widest font-body">
            Deskripsi
          </div>
          <div className="col-span-2 text-[10px] font-semibold text-on-surface/50 uppercase tracking-widest font-body text-right">
            Aksi
          </div>
        </div>

        {/* Loading */}
        {loading && <SectionLoader />}

        {/* Empty state */}
        {!loading && categories.length === 0 && (
          <div className="py-12 text-center text-on-surface-variant font-body">
            Belum ada kategori. Tambah kategori baru di atas.
          </div>
        )}

        {/* Rows */}
        {!loading && categories.length > 0 && (
          <div className="flex flex-col gap-4">
            {categories.map((cat) => (
              <div
                key={cat.id}
                onClick={() => navigate(`/admin/manajemen-kategori/${cat.id}`)}
                className="grid grid-cols-12 gap-4 items-center bg-surface hover:bg-surface-container-low transition-colors p-4 rounded-lg group cursor-pointer"
              >
                <div className="col-span-5 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-on-surface/70 text-sm">
                      category
                    </span>
                  </div>
                  <span className="font-bold text-on-surface text-sm tracking-tight">
                    {cat.name}
                  </span>
                </div>
                <div className="col-span-3">
                  <span className="text-sm font-medium text-on-surface/80">
                    {cat.products_count ?? 0}{" "}
                    <span className="text-xs text-on-surface/50 ml-1">Produk</span>
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-xs text-on-surface/60 truncate block max-w-[140px]">
                    {cat.description || '-'}
                  </span>
                </div>
                <div
                  className="col-span-2 flex items-center justify-end gap-3"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => navigate(`/admin/manajemen-kategori/${cat.id}`)}
                    className="text-primary hover:text-primary-container transition-colors p-1"
                    title="Lihat Detail"
                  >
                    <span className="material-symbols-outlined text-lg">visibility</span>
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id, cat.name)}
                    className="text-primary hover:text-error transition-colors p-1"
                    title="Hapus Kategori"
                  >
                    <span className="material-symbols-outlined text-lg">delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
