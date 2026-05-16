import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api";
import SectionLoader from "../../components/SectionLoader";
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
  const [filterStatus, setFilterStatus] = useState("all");

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
      cancelButtonColor: "#78716c",
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
      reverseButtons: true,
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
      const stock = p.variants?.[0]?.inventory?.stock_roll ?? 0;
      const isLow = stock < 10;
      const statusMatch =
        filterStatus === "all" || (filterStatus === "low" ? isLow : !isLow);
      return searchMatch && catMatch && statusMatch;
    });
  }, [products, filterSearch, filterCategory, filterStatus]);

  const statusFilters = [
    { value: "all", label: "Semua" },
    { value: "ok", label: "Normal" },
    { value: "low", label: "Stok Menipis" },
  ];

  return (
    <div className="px-8 py-8">
      {/* Page Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-4xl font-display font-extrabold tracking-tight text-on-surface mb-2">
            Inventaris
          </h2>
          <p className="text-on-surface-variant font-body text-lg leading-relaxed">
            Kelola spesimen kain, pantau stok, dan perbarui metadata.
          </p>
        </div>
        <button
          onClick={() => navigate("/admin/specimen-entry")}
          className="px-6 py-2.5 bg-primary-container text-on-primary-container text-sm font-bold tracking-wide rounded hover:bg-primary hover:text-white transition-colors flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Tambah Produk
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-4 mb-6 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
            search
          </span>
          <input
            type="text"
            placeholder="Cari nama atau kategori..."
            value={filterSearch}
            onChange={(e) => setFilterSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-surface-container-lowest border border-outline-variant/30 rounded-lg text-sm font-body text-on-surface focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Category */}
        <div className="relative">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="appearance-none pl-4 pr-8 py-2.5 bg-surface-container-lowest border border-outline-variant/30 rounded-lg text-sm font-body text-on-surface focus:outline-none focus:border-primary transition-colors cursor-pointer"
          >
            <option value="all">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <span className="material-symbols-outlined pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[16px]">
            expand_more
          </span>
        </div>

        {/* Status pills */}
        <div className="flex gap-2">
          {statusFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilterStatus(f.value)}
              className={`px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-wider border transition-colors ${
                filterStatus === f.value
                  ? "bg-primary-container text-on-primary-container border-primary-container"
                  : "bg-transparent text-on-surface-variant border-outline-variant/40 hover:border-primary/40"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Reset */}
        {(filterSearch || filterCategory !== "all" || filterStatus !== "all") && (
          <button
            onClick={() => { setFilterSearch(""); setFilterCategory("all"); setFilterStatus("all"); }}
            className="text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-error transition-colors"
          >
            Reset Filter
          </button>
        )}
      </div>

      {/* Inventory Table */}
      <div className="bg-surface-container-lowest rounded-xl p-8 mb-8">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 pb-4 border-b border-outline-variant/20 mb-6 text-xs font-body font-bold tracking-widest uppercase text-on-surface-variant">
          <div className="col-span-3">Nama Spesimen</div>
          <div className="col-span-2">Kategori</div>
          <div className="text-right col-span-2">Stok (Roll)</div>
          <div className="col-span-2 flex justify-end">Status</div>
          <div className="col-span-2 text-right">Harga</div>
          <div className="col-span-1 text-right">Aksi</div>
        </div>

        {/* Rows */}
        {loading ? (
          <SectionLoader />
        ) : (
          <div className="flex flex-col gap-6">
            {displayProducts.map((p) => {
              const stock = p.variants?.[0]?.inventory?.stock_roll ?? 0;
              const lowStock = stock < 10;
              const imagePath = p.variants?.[0]?.image_path;
              const imageUrl = getImageUrl(imagePath);
              const priceFormatted =
                p.price_min != null && p.price_max != null
                  ? `IDR ${Number(p.price_min).toLocaleString("id-ID")} – ${Number(p.price_max).toLocaleString("id-ID")}`
                  : p.price_min != null
                  ? `IDR ${Number(p.price_min).toLocaleString("id-ID")}`
                  : "-";

              return (
                <div
                  key={p.id}
                  onClick={() => navigate(`/admin/inventory/${p.id}`)}
                  className={`grid grid-cols-12 gap-4 items-center group cursor-pointer ${
                    lowStock ? "bg-error-container/20 -mx-4 px-4 py-2 rounded-lg" : ""
                  }`}
                >
                  <div className="col-span-3 flex items-center gap-4">
                    <div className="w-12 h-12 bg-surface-container-highest rounded-full overflow-hidden flex-shrink-0">
                      {imageUrl ? (
                        <img src={imageUrl} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="material-symbols-outlined text-on-surface-variant text-[18px]">image</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <div className={`font-headline font-bold text-sm transition-colors ${lowStock ? "text-error" : "text-on-surface group-hover:text-primary"}`}>
                        {p.name}
                      </div>
                      <div className="font-body text-xs text-on-surface-variant mt-1">ID: {p.id}</div>
                    </div>
                  </div>

                  <div className="col-span-2">
                    <span className="inline-block px-3 py-1 bg-surface-container-high text-on-surface text-[10px] font-body font-bold tracking-widest uppercase rounded-full">
                      {p.category?.name ?? "-"}
                    </span>
                  </div>

                  <div className={`text-right font-body text-sm col-span-2 ${lowStock ? "font-bold text-error" : "font-medium text-on-surface"}`}>
                    {stock}
                  </div>

                  <div className="col-span-2 flex justify-end">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-body font-bold tracking-widest uppercase rounded-full ${lowStock ? "bg-error-container text-error" : "bg-surface-container-low text-on-surface"}`}>
                      <span className={`w-2 h-2 rounded-full ${lowStock ? "bg-error animate-pulse" : "bg-tertiary"}`}></span>
                      {lowStock ? "Stok Menipis" : "Tersedia"}
                    </span>
                  </div>

                  <div className="col-span-2 text-right font-body text-xs text-on-surface font-semibold">
                    {priceFormatted}
                  </div>

                  <div className="col-span-1 flex justify-end items-center gap-2 text-on-surface-variant" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => navigate(`/admin/inventory/${p.id}`)} className="hover:text-primary transition-colors">
                      <span className="material-symbols-outlined text-[18px]">visibility</span>
                    </button>
                    <button onClick={() => navigate(`/admin/inventory/${p.id}/edit`)} className="hover:text-primary transition-colors">
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                    <button onClick={(e) => handleDelete(e, p)} className="hover:text-error transition-colors">
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </div>
              );
            })}

            {displayProducts.length === 0 && (
              <div className="py-12 text-center text-on-surface-variant font-body text-sm">
                {products.length === 0 ? "Belum ada produk." : "Tidak ada produk yang sesuai filter."}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-6 flex justify-between items-center border-t border-outline-variant/15">
          <div className="text-xs font-body text-on-surface-variant">
            Menampilkan {displayProducts.length} dari {products.length} spesimen
          </div>
        </div>
      </div>
    </div>
  );
}
