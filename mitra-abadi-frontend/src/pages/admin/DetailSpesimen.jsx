import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../lib/api";
import PageLoader from "../../components/PageLoader";
import Swal from "sweetalert2";


function getImageUrl(imagePath) {
  if (!imagePath) return null;
  if (imagePath.startsWith("http")) return imagePath;
  return "http://localhost:8000/storage/" + imagePath;
}

export default function DetailSpesimen() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Hapus Produk?",
      text: `"${product?.name}" akan dihapus permanen dan tidak dapat dikembalikan.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e61e25",
      cancelButtonColor: "#78716c",
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
      reverseButtons: true,
    });
    if (!result.isConfirmed) return;
    setDeleting(true);
    try {
      await api.delete(`/admin/products/${id}`);
      navigate('/admin/inventory');
    } catch {
      Swal.fire({ title: "Gagal", text: "Gagal menghapus produk. Coba lagi.", icon: "error", confirmButtonColor: "#e61e25" });
      setDeleting(false);
    }
  };

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

  if (loading) return <PageLoader />;

  if (!product) return <PageLoader text="Produk tidak ditemukan." />;

  const firstVariant = product.variants?.[0];
  const mainImageUrl = getImageUrl(firstVariant?.image_path);
  const stock = firstVariant?.inventory?.stock_roll ?? 0;
  const lowStock = stock < (firstVariant?.inventory?.low_stock_threshold ?? 10);
  const priceFormatted = (product.price_min != null && product.price_max != null)
    ? `IDR ${Number(product.price_min).toLocaleString("id-ID")} – ${Number(product.price_max).toLocaleString("id-ID")}`
    : "-";

  return (
    <div className="px-8 py-8">
      {/* Back link */}
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-bold text-primary hover:text-primary-container transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Kembali
        </button>
      </div>

      {/* Header Actions & Title */}
      <div className="flex justify-between items-end mb-12">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 bg-surface-container-high text-on-surface rounded-full text-xs font-bold uppercase tracking-widest">
              {product.id}
            </span>
            <span className="px-3 py-1 bg-surface-container-high text-on-surface rounded-full text-xs font-bold uppercase tracking-widest">
              {product.category?.name ?? "-"}
            </span>
          </div>
          <h1 className="text-5xl font-display font-extrabold tracking-tight text-on-surface">
            {product.name}
          </h1>
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-2 px-5 py-2.5 border border-error text-error font-semibold text-sm rounded-md hover:bg-error/5 transition-colors disabled:opacity-60"
          >
            <span className="material-symbols-outlined text-[18px]">delete</span>
            {deleting ? 'Menghapus...' : 'Hapus Produk'}
          </button>
          <button
            onClick={() => navigate(`/admin/inventory/${product.id}/edit`)}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary-container text-on-primary-container font-semibold text-sm rounded-md hover:bg-primary transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">edit</span>
            Edit Produk
          </button>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-12 gap-8">
        {/* Left: Texture Gallery */}
        <div className="col-span-8 space-y-8">
          <div className="bg-surface-container-lowest p-4 rounded-xl aspect-[16/9] overflow-hidden group">
            {mainImageUrl ? (
              <img
                src={mainImageUrl}
                alt={product.name}
                className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-700"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-on-surface-variant">
                <span className="material-symbols-outlined text-6xl">image_not_supported</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            {product.variants?.slice(1).map((v) => {
              const variantImg = getImageUrl(v.image_path);
              return (
                <div
                  key={v.id}
                  className="bg-surface-container-lowest p-2 rounded-lg aspect-square overflow-hidden cursor-pointer"
                >
                  {variantImg ? (
                    <img
                      src={variantImg}
                      alt={v.color_name}
                      className="w-full h-full object-cover rounded opacity-80 hover:opacity-100 transition-opacity"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-2xl text-on-surface-variant">
                        texture
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
            <div className="bg-surface-container-highest p-2 rounded-lg aspect-square flex items-center justify-center cursor-pointer group">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant group-hover:text-primary transition-colors">
                add_photo_alternate
              </span>
            </div>
          </div>

          {/* Curator's Notes */}
          <div className="bg-surface-container-lowest p-8 rounded-xl">
            <h3 className="text-lg font-headline font-bold text-on-surface mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">
                history_edu
              </span>
              Catatan Produk
            </h3>
            <div className="text-on-surface-variant text-base leading-relaxed space-y-4 font-body">
              {product.description ? (
                <p>{product.description}</p>
              ) : (
                <p className="italic opacity-60">Belum ada deskripsi.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right: Sidebar Info */}
        <div className="col-span-4 space-y-8">
          {/* Stock Status */}
          <div className="bg-surface-container-lowest p-8 rounded-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-fixed-dim/20 rounded-bl-full -z-0"></div>
            <h3 className="text-sm font-semibold text-on-surface-variant uppercase tracking-widest mb-2 relative z-10">
              Stok Saat Ini
            </h3>
            <div className="text-4xl font-display font-extrabold text-on-surface mb-4 relative z-10">
              {stock}
              <span className="text-lg text-on-surface-variant font-medium ml-1">Roll</span>
            </div>
            <div className="flex items-center gap-2 relative z-10">
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  lowStock ? "bg-error" : "bg-primary-container"
                }`}
              ></div>
              <span
                className={`text-sm font-bold tracking-wide ${
                  lowStock ? "text-error" : "text-primary-container"
                }`}
              >
                {lowStock ? "Stok Menipis" : "Tersedia"}
              </span>
            </div>
          </div>

          {/* Technical Specs */}
          <div className="bg-surface-container-lowest p-8 rounded-xl">
            <h3 className="text-sm font-semibold text-on-surface-variant uppercase tracking-widest mb-6">
              Spesifikasi Teknis
            </h3>
            <div className="space-y-6">
              <div>
                <div className="text-xs text-on-surface-variant mb-1 font-medium">Yard/Roll</div>
                <div className="text-base font-bold text-on-surface border-b border-outline-variant/30 pb-2">
                  {product.yard_per_roll ? product.yard_per_roll + ' yd' : "-"}
                </div>
              </div>
              <div>
                <div className="text-xs text-on-surface-variant mb-1 font-medium">Komposisi</div>
                <div className="text-base font-bold text-on-surface border-b border-outline-variant/30 pb-2">
                  {product.composition ?? "-"}
                </div>
              </div>
              <div>
                <div className="text-xs text-on-surface-variant mb-1 font-medium">
                  Kategori Material
                </div>
                <div className="text-base font-bold text-on-surface border-b border-outline-variant/30 pb-2">
                  {product.category?.name ?? "-"}
                </div>
              </div>
              <div>
                <div className="text-xs text-on-surface-variant mb-1 font-medium">
                  Range Harga
                </div>
                <div className="text-base font-bold text-on-surface pb-2">
                  {priceFormatted}
                </div>
              </div>
            </div>
          </div>

          {/* Variants */}
          {product.variants && product.variants.length > 0 && (
            <div className="bg-surface-container-lowest p-8 rounded-xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-semibold text-on-surface-variant uppercase tracking-widest">
                  Varian Warna
                </h3>
              </div>
              <div className="space-y-4">
                {product.variants.map((v) => (
                  <div key={v.id} className="flex justify-between items-center py-2">
                    <div className="flex items-center gap-3">
                      {v.color_hex && (
                        <div
                          className="w-5 h-5 rounded-full border border-outline-variant/30 flex-shrink-0"
                          style={{ backgroundColor: v.color_hex }}
                        ></div>
                      )}
                      <div>
                        <div className="text-sm font-bold text-on-surface">{v.color_name}</div>
                        <div className="text-xs text-on-surface-variant">
                          Stok: {v.inventory?.stock_roll ?? 0} roll
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
