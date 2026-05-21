import { Link } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

function getImageUrl(imagePath) {
  if (!imagePath) return null;
  if (imagePath.startsWith("http")) return imagePath;
  return `${API_BASE}/storage/${imagePath}`;
}

function FabricCard({ fabric }) {
  const imageUrl = getImageUrl(fabric.img);

  return (
    <Link to={`/catalog/${fabric.id}`} className="group flex flex-col cursor-pointer">
      <div className="group flex flex-col">
        <div className="relative overflow-hidden aspect-[4/5] bg-[#f1edec] mb-5 rounded-sm">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={fabric.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
              onError={(e) => { e.currentTarget.style.display = "none"; }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-stone-300 text-xs uppercase tracking-widest font-bold">No Image</span>
            </div>
          )}
          {fabric.badge && fabric.badgeStyle !== "low-stock" && (
            <div className="absolute top-4 left-4">
              <span
                className={`px-3 py-1 text-[9px] font-label font-black uppercase tracking-widest shadow-sm ${
                  fabric.badgeStyle === "primary"
                    ? "bg-[#e61e25] text-white"
                    : "bg-white/90 backdrop-blur text-[#e61e25]"
                }`}
              >
                {fabric.badge}
              </span>
            </div>
          )}
          {fabric.badge && fabric.badgeStyle === "low-stock" && (
            <div className="absolute bottom-4 right-4">
              <span className="px-2 py-1 bg-[#e61e25] text-white text-[8px] font-label uppercase tracking-widest font-bold rounded-sm">
                {fabric.badge}
              </span>
            </div>
          )}
        </div>
        <div className="space-y-1">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-extrabold text-stone-900 group-hover:text-[#e61e25] transition-colors font-[Manrope]">
              {fabric.name}
            </h2>
            <span className="text-sm font-bold text-[#e61e25] font-[Manrope]">
              {fabric.price_min != null && fabric.price_max != null
                ? `IDR ${Number(fabric.price_min).toLocaleString("id-ID")} – ${Number(fabric.price_max).toLocaleString("id-ID")}`
                : "-"}
            </span>
          </div>
          <div className="pt-4 border-t border-stone-200/50 space-y-3">
            <div className="flex gap-6">
              <div className="flex flex-col">
                <span className="text-[9px] uppercase tracking-widest text-stone-500 font-bold">Kategori</span>
                <span className="text-[11px] font-bold text-stone-800">{fabric.category?.name || "-"}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] uppercase tracking-widest text-stone-500 font-bold">Kode SKU</span>
                <span className="text-[11px] font-bold text-stone-800">{fabric.sku_code || "-"}</span>
              </div>
            </div>
            {fabric.dominant_colors?.length > 0 && (
              <div className="flex items-center gap-1.5">
                {fabric.dominant_colors.slice(0, 5).map((hex) => (
                  <span
                    key={hex}
                    title={hex}
                    style={{ backgroundColor: hex }}
                    className="w-4 h-4 rounded-full border border-stone-200/60 flex-shrink-0"
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default FabricCard;
