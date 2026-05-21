import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api";
import Sk from "../../components/Skeleton";
import Swal from "sweetalert2";

export default function ManajemenKategori() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Create state
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  // Modal edit state
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);

  const fetchCategories = () => {
    api.get("/admin/categories")
      .then((res) => setCategories(res.data.data ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCategories(); }, []);

  /* ── Modal helpers ─────────────────────────────────────── */
  const handleStartEdit = (cat) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditDesc(cat.description ?? "");
    setEditError("");
    // Tiny delay so the element mounts before transition fires
    requestAnimationFrame(() => setIsModalVisible(true));
  };

  const handleCancelEdit = useCallback(() => {
    setIsModalVisible(false);
    setTimeout(() => {
      setEditingId(null);
      setEditName("");
      setEditDesc("");
      setEditError("");
    }, 200); // matches transition duration
  }, []);

  // Close on Escape key
  useEffect(() => {
    if (!editingId) return;
    const onKey = (e) => { if (e.key === "Escape") handleCancelEdit(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [editingId, handleCancelEdit]);

  /* ── CRUD handlers ─────────────────────────────────────── */
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setSaving(true);
    setError("");
    try {
      await api.post("/admin/categories", { name: newName.trim(), description: newDesc.trim() });
      setNewName("");
      setNewDesc("");
      setShowForm(false);
      fetchCategories();
      Swal.fire({
        title: "Berhasil!",
        text: "Kategori baru berhasil ditambahkan.",
        icon: "success",
        confirmButtonColor: "#e61e25",
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (err) {
      setError(err.response?.data?.message ?? "Gagal membuat kategori.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editName.trim()) return;
    setEditSaving(true);
    setEditError("");
    try {
      await api.put(`/admin/categories/${editingId}`, {
        name: editName.trim(),
        description: editDesc.trim(),
      });
      handleCancelEdit();
      fetchCategories();
      Swal.fire({
        title: "Berhasil!",
        text: "Kategori berhasil diperbarui.",
        icon: "success",
        confirmButtonColor: "#e61e25",
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (err) {
      setEditError(err.response?.data?.message ?? "Gagal memperbarui kategori.");
    } finally {
      setEditSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    const result = await Swal.fire({
      title: "Hapus Kategori?",
      text: `Kategori "${name}" akan dihapus permanen.`,
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
      await api.delete(`/admin/categories/${id}`);
      Swal.fire({ title: "Dihapus!", text: "Kategori berhasil dihapus.", icon: "success", confirmButtonColor: "#e61e25", timer: 1800, showConfirmButton: false });
      fetchCategories();
    } catch (err) {
      Swal.fire({ title: "Gagal", text: err.response?.data?.message ?? "Gagal menghapus kategori.", icon: "error", confirmButtonColor: "#e61e25" });
    }
  };

  /* ── Render ────────────────────────────────────────────── */
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
              <h1 className="text-xl font-extrabold text-stone-900">Kategori Produk</h1>
            </div>
          </div>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="hidden md:flex items-center gap-2 bg-stone-900 text-white font-bold text-[11px] uppercase tracking-widest px-6 py-3 rounded-xl hover:bg-[#e61e25] transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">{showForm ? "close" : "add"}</span>
            {showForm ? "Batal Tambah" : "Tambah Kategori"}
          </button>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 md:px-8 mt-10">

        {/* Page Header Info */}
        <div className="mb-10 max-w-2xl flex justify-between items-end">
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-stone-900 leading-tight mb-3">
              Manajemen Kategori
            </h2>
            <p className="text-stone-500 font-medium leading-relaxed">
              Kelola dan organisasikan kategori tekstil untuk katalog dan inventaris. Pengelompokan yang baik mempermudah pencarian produk.
            </p>
          </div>
        </div>

        {/* Create Form Card */}
        {showForm && (
          <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-sm border border-stone-100 mb-8 animate-in fade-in slide-in-from-top-4 duration-300">
            <h3 className="text-lg font-black text-stone-900 flex items-center gap-3 mb-8 pb-6 border-b border-stone-100">
              <svg className="w-5 h-5 text-[#e61e25]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
              Tambah Kategori Baru
            </h3>

            <form onSubmit={handleCreate} className="flex flex-col gap-6 max-w-2xl">
              <div>
                <label className="text-[11px] font-extrabold uppercase tracking-widest text-stone-500 mb-2.5 block">
                  Nama Kategori <span className="text-[#e61e25]">*</span>
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Misal: Katun Premium"
                  required
                  autoFocus
                  className="w-full bg-stone-50 border border-stone-200 text-stone-800 text-sm font-bold rounded-2xl px-5 py-4 focus:outline-none focus:border-[#e61e25] focus:ring-4 focus:ring-[#e61e25]/10 transition-all placeholder:text-stone-400"
                />
              </div>
              
              <div>
                <label className="text-[11px] font-extrabold uppercase tracking-widest text-stone-500 mb-2.5 block">
                  Deskripsi
                </label>
                <input
                  type="text"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Deskripsi singkat karakteristik kategori ini..."
                  className="w-full bg-stone-50 border border-stone-200 text-stone-800 text-sm font-semibold rounded-2xl px-5 py-4 focus:outline-none focus:border-[#e61e25] focus:ring-4 focus:ring-[#e61e25]/10 transition-all placeholder:text-stone-400"
                />
              </div>
              
              {error && (
                <div className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-3 rounded-xl border border-red-100 text-sm font-semibold">
                  <span className="material-symbols-outlined text-[18px]">error</span>
                  {error}
                </div>
              )}

              <div className="flex items-center gap-4 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-stone-900 text-white font-bold text-[11px] uppercase tracking-widest px-8 py-4 rounded-xl hover:bg-[#e61e25] hover:-translate-y-0.5 shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  {saving ? "Menyimpan..." : "Simpan Kategori"}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setError(""); }}
                  className="text-stone-500 font-bold text-[11px] uppercase tracking-widest px-6 py-4 rounded-xl hover:bg-stone-100 hover:text-stone-900 transition-colors"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Category Table / List Card */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-stone-100 p-8 flex flex-col gap-2">
          {/* Header Row */}
          <div className="hidden md:grid grid-cols-12 gap-6 pb-4 border-b border-stone-100 px-6">
            <div className="col-span-5 text-[10px] font-extrabold text-stone-400 uppercase tracking-widest">Nama Kategori</div>
            <div className="col-span-3 text-[10px] font-extrabold text-stone-400 uppercase tracking-widest">Jumlah Produk</div>
            <div className="col-span-2 text-[10px] font-extrabold text-stone-400 uppercase tracking-widest">Deskripsi</div>
            <div className="col-span-2 text-[10px] font-extrabold text-stone-400 uppercase tracking-widest text-right">Aksi</div>
          </div>

          {/* Loading Skeleton */}
          {loading && (
            <div className="flex flex-col gap-4 mt-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-6">
                  <Sk className="w-12 h-12 rounded-2xl flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Sk className="h-4 w-48 rounded-full" />
                    <Sk className="h-3 w-32 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && categories.length === 0 && (
            <div className="py-20 text-center flex flex-col items-center">
              <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-4xl text-stone-300">category</span>
              </div>
              <h3 className="text-lg font-black text-stone-900 mb-2">Belum ada Kategori</h3>
              <p className="text-sm text-stone-500 font-medium mb-6">Tambahkan kategori pertama Anda untuk mengelompokkan inventaris.</p>
              <button
                onClick={() => setShowForm(true)}
                className="text-[#e61e25] font-extrabold text-[11px] uppercase tracking-widest hover:underline underline-offset-4"
              >
                + Tambah Kategori Baru
              </button>
            </div>
          )}

          {/* Data Rows */}
          {!loading && categories.length > 0 && (
            <div className="flex flex-col gap-2 mt-2">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 items-center hover:bg-stone-50 transition-colors p-4 md:px-6 rounded-2xl group border border-transparent hover:border-stone-100"
                >
                  <div className="col-span-1 md:col-span-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#e61e25] flex items-center justify-center shrink-0 border border-red-100">
                      <span className="material-symbols-outlined text-[22px]">category</span>
                    </div>
                    <div>
                      <span className="font-extrabold text-stone-900 text-[15px] block mb-0.5">{cat.name}</span>
                      {/* Show desc on mobile */}
                      <span className="md:hidden text-xs text-stone-500 font-medium truncate block max-w-[200px]">
                        {cat.description || "Tidak ada deskripsi"}
                      </span>
                    </div>
                  </div>
                  <div className="col-span-1 md:col-span-3 hidden md:block">
                    <div className="inline-flex flex-col">
                      <span className="text-[15px] font-black text-stone-900">{cat.products_count ?? 0}</span>
                      <span className="text-[10px] uppercase tracking-widest font-bold text-stone-400">Produk</span>
                    </div>
                  </div>
                  <div className="col-span-1 md:col-span-2 hidden md:block">
                    <span className="text-xs text-stone-500 font-medium truncate block pr-4" title={cat.description}>
                      {cat.description || "-"}
                    </span>
                  </div>
                  <div className="col-span-1 md:col-span-2 flex items-center md:justify-end gap-2 mt-2 md:mt-0">
                    <button
                      onClick={() => navigate(`/admin/manajemen-kategori/${cat.id}`)}
                      className="w-10 h-10 flex items-center justify-center rounded-xl bg-stone-50 text-stone-500 hover:text-white hover:bg-stone-900 transition-colors border border-stone-200 hover:border-stone-900"
                      title="Lihat Detail"
                    >
                      <span className="material-symbols-outlined text-[18px]">visibility</span>
                    </button>
                    <button
                      onClick={() => handleStartEdit(cat)}
                      className="w-10 h-10 flex items-center justify-center rounded-xl bg-stone-50 text-stone-500 hover:text-white hover:bg-stone-900 transition-colors border border-stone-200 hover:border-stone-900"
                      title="Edit Kategori"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id, cat.name)}
                      className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-50 text-[#e61e25] hover:text-white hover:bg-[#e61e25] transition-colors border border-red-100 hover:border-[#e61e25]"
                      title="Hapus Kategori"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Edit Modal ──────────────────────────────────────── */}
      {editingId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

          {/* Backdrop */}
          <div
            className={`absolute inset-0 bg-stone-900/40 backdrop-blur-sm transition-opacity duration-300 ${
              isModalVisible ? "opacity-100" : "opacity-0"
            }`}
            onClick={handleCancelEdit}
          />

          {/* Dialog Card */}
          <div
            className={`relative w-full max-w-lg bg-white rounded-[2rem] shadow-[0_24px_64px_-12px_rgba(0,0,0,0.2)] border border-stone-100 overflow-hidden transition-all duration-300 ${
              isModalVisible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4"
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-stone-100 bg-stone-50/50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-red-50 text-[#e61e25] flex items-center justify-center shrink-0 border border-red-100">
                  <span className="material-symbols-outlined text-[20px]">edit_note</span>
                </div>
                <div>
                  <h2 className="text-lg font-black text-stone-900 leading-tight">
                    Edit Kategori
                  </h2>
                  <p className="text-xs font-semibold text-stone-400 mt-0.5">
                    Perbarui nama atau deskripsi kategori
                  </p>
                </div>
              </div>
              <button
                onClick={handleCancelEdit}
                className="w-10 h-10 rounded-full flex items-center justify-center text-stone-400 hover:bg-stone-100 hover:text-stone-900 transition-colors"
              >
                <span className="material-symbols-outlined text-[22px]">close</span>
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleUpdate} className="p-8 flex flex-col gap-6">

              <div>
                <label className="text-[11px] font-extrabold uppercase tracking-widest text-stone-500 mb-2.5 block">
                  Nama Kategori <span className="text-[#e61e25]">*</span>
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  autoFocus
                  className="w-full bg-stone-50 border border-stone-200 text-stone-800 text-sm font-bold rounded-2xl px-5 py-4 focus:outline-none focus:border-[#e61e25] focus:ring-4 focus:ring-[#e61e25]/10 transition-all"
                />
              </div>

              <div>
                <label className="text-[11px] font-extrabold uppercase tracking-widest text-stone-500 mb-2.5 block">
                  Deskripsi
                </label>
                <textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  placeholder="Deskripsi singkat..."
                  className="w-full resize-none min-h-[100px] bg-stone-50 border border-stone-200 text-stone-800 text-sm font-semibold rounded-2xl px-5 py-4 focus:outline-none focus:border-[#e61e25] focus:ring-4 focus:ring-[#e61e25]/10 transition-all placeholder:text-stone-400 leading-relaxed"
                />
              </div>

              {editError && (
                <div className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-3 rounded-xl border border-red-100 text-sm font-semibold">
                  <span className="material-symbols-outlined text-[18px]">error</span>
                  {editError}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100 mt-2">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="font-bold text-[11px] uppercase tracking-widest px-6 py-4 text-stone-500 hover:text-stone-900 rounded-xl hover:bg-stone-100 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={editSaving}
                  className="font-bold text-[11px] uppercase tracking-widest px-8 py-4 rounded-xl bg-stone-900 text-white hover:bg-[#e61e25] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  {editSaving ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Sticky Add Button (Optional if you want it sticky on mobile bottoms) */}
      {!showForm && (
        <div className="md:hidden fixed bottom-6 right-6 z-40">
          <button
            onClick={() => setShowForm(true)}
            className="w-14 h-14 bg-[#e61e25] text-white rounded-full shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-3xl">add</span>
          </button>
        </div>
      )}

    </div>
  );
}