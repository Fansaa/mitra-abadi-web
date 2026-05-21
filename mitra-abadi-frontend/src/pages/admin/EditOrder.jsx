import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../lib/api";
import Swal from "sweetalert2";

function formatIDR(amount) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount ?? 0);
}

export default function EditOrder() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [orderCode, setOrderCode] = useState("");

  const [form, setForm] = useState({
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    customer_address: "",
    notes: "",
  });

  const [items, setItems] = useState([]);

  useEffect(() => {
    api.get(`/admin/orders/${id}`)
      .then(res => {
        const o = res.data.data;
        setOrderCode(o.order_code ?? "");
        setForm({
          customer_name:    o.customer_name    ?? "",
          customer_phone:   o.customer_phone   ?? "",
          customer_email:   o.customer_email   ?? "",
          customer_address: o.customer_address ?? "",
          notes:            o.notes            ?? "",
        });
        setItems((o.items ?? []).map(item => ({
          id:           item.id,
          product_name: item.product_name ?? "-",
          color_name:   item.color_name   ?? null,
          color_hex:    item.color_hex    ?? null,
          warna:        item.warna        ?? "",
          qty_yard:     item.qty_yard     ?? 0,
          total_price:  item.subtotal     ?? 0,
        })));
      })
      .catch(() => setError("Gagal memuat data pesanan."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const updateItem = (itemId, field, value) =>
    setItems(prev => prev.map(it => it.id === itemId ? { ...it, [field]: value } : it));

  const grandTotal = useMemo(() =>
    items.reduce((acc, it) => acc + Number(it.total_price), 0),
  [items]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.customer_name.trim()) {
      setError("Nama pelanggan wajib diisi.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await api.put(`/admin/orders/${id}`, {
        ...form,
        items: items.map(it => ({
          id:          it.id,
          warna:       it.warna || null,
          qty_yard:    Number(it.qty_yard) || 0,
          total_price: Number(it.total_price),
        })),
      });
      await Swal.fire({
        title: "Berhasil!",
        text: "Perubahan pesanan berhasil disimpan.",
        icon: "success",
        confirmButtonColor: "#e61e25",
        timer: 1800,
        showConfirmButton: false,
      });
      navigate("/admin/riwayat-transaksi");
    } catch (err) {
      const errors = err.response?.data?.errors;
      const msg = errors
        ? Object.values(errors).flat().join(" | ")
        : err.response?.data?.message ?? "Gagal menyimpan perubahan.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans pb-24" style={{ fontFamily: "Manrope, sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* Top Navbar */}
      <div className="bg-white border-b border-stone-200 px-4 md:px-8 py-5 sticky top-16 z-30 shadow-sm">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 hover:bg-stone-200 hover:text-stone-900 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-stone-400">Riwayat Transaksi</p>
              <h1 className="text-xl font-extrabold text-stone-900">Edit Pesanan</h1>
            </div>
          </div>
          {orderCode && (
            <span className="hidden md:inline-block px-4 py-2 bg-stone-100 text-stone-700 font-mono text-[11px] font-bold tracking-wider rounded-xl border border-stone-200">
              {orderCode}
            </span>
          )}
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 md:px-8 mt-10">

        <div className="mb-10 max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-black text-stone-900 leading-tight mb-3">Edit Pesanan</h2>
          <p className="text-stone-500 font-medium leading-relaxed">
            Perbarui informasi pelanggan, item pesanan, dan catatan.
          </p>
        </div>

        {error && (
          <div className="mb-8 p-5 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-4">
            <svg className="w-6 h-6 text-[#e61e25] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-600 font-medium">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <span className="material-symbols-outlined text-stone-300 text-5xl animate-spin">progress_activity</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">

            {/* Left Column */}
            <div className="lg:col-span-8 flex flex-col gap-8">

              {/* Informasi Pelanggan */}
              <section className="bg-white p-8 md:p-10 rounded-[2rem] shadow-sm border border-stone-100 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-[#e61e25]"></div>

                <div className="flex items-center gap-4 mb-8 pb-6 border-b border-stone-100">
                  <div className="w-10 h-10 rounded-2xl bg-red-50 text-[#e61e25] flex items-center justify-center shrink-0 border border-red-100">
                    <span className="font-black text-lg">1</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-stone-900">Informasi Pelanggan</h3>
                    <p className="text-[11px] font-bold text-stone-400 uppercase tracking-widest mt-1">Detail Kontak & Pengiriman</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="text-[11px] font-extrabold uppercase tracking-widest text-stone-500 mb-2.5 block">
                      Nama Pelanggan <span className="text-[#e61e25]">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.customer_name}
                      onChange={e => handleChange("customer_name", e.target.value)}
                      placeholder="Nama lengkap..."
                      required
                      className="w-full bg-stone-50 border border-stone-200 text-stone-800 text-sm font-bold rounded-2xl px-5 py-4 focus:outline-none focus:border-[#e61e25] focus:ring-4 focus:ring-[#e61e25]/10 transition-all placeholder:text-stone-400"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-extrabold uppercase tracking-widest text-stone-500 mb-2.5 block">Nomor Telepon</label>
                    <div className="relative group">
                      <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-[#e61e25] transition-colors">phone</span>
                      <input
                        type="tel"
                        value={form.customer_phone}
                        onChange={e => handleChange("customer_phone", e.target.value)}
                        placeholder="08xx-xxxx-xxxx"
                        className="w-full bg-stone-50 border border-stone-200 text-stone-800 text-sm font-bold rounded-2xl pl-12 pr-5 py-4 focus:outline-none focus:border-[#e61e25] focus:ring-4 focus:ring-[#e61e25]/10 transition-all placeholder:text-stone-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-extrabold uppercase tracking-widest text-stone-500 mb-2.5 block">
                      Email <span className="text-stone-400 normal-case tracking-normal font-medium ml-1">(Opsional)</span>
                    </label>
                    <div className="relative group">
                      <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-[#e61e25] transition-colors">mail</span>
                      <input
                        type="email"
                        value={form.customer_email}
                        onChange={e => handleChange("customer_email", e.target.value)}
                        placeholder="email@contoh.com"
                        className="w-full bg-stone-50 border border-stone-200 text-stone-800 text-sm font-bold rounded-2xl pl-12 pr-5 py-4 focus:outline-none focus:border-[#e61e25] focus:ring-4 focus:ring-[#e61e25]/10 transition-all placeholder:text-stone-400"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-[11px] font-extrabold uppercase tracking-widest text-stone-500 mb-2.5 block">Alamat Pengiriman</label>
                    <textarea
                      value={form.customer_address}
                      onChange={e => handleChange("customer_address", e.target.value)}
                      placeholder="Alamat lengkap tujuan pengiriman..."
                      className="w-full min-h-[100px] resize-none bg-stone-50 border border-stone-200 text-stone-800 text-sm font-semibold rounded-2xl px-5 py-4 focus:outline-none focus:border-[#e61e25] focus:ring-4 focus:ring-[#e61e25]/10 transition-all placeholder:text-stone-400 leading-relaxed"
                    />
                  </div>
                </div>
              </section>

              {/* Item Pesanan */}
              <section className="bg-white p-8 md:p-10 rounded-[2rem] shadow-sm border border-stone-100 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-stone-900"></div>

                <div className="flex items-center gap-4 mb-8 pb-6 border-b border-stone-100">
                  <div className="w-10 h-10 rounded-2xl bg-stone-100 text-stone-900 flex items-center justify-center shrink-0 border border-stone-200">
                    <span className="font-black text-lg">2</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-stone-900">Item Pesanan</h3>
                    <p className="text-[11px] font-bold text-stone-400 uppercase tracking-widest mt-1">Edit qty dan harga total per item</p>
                  </div>
                </div>

                {items.length === 0 ? (
                  <p className="text-sm text-stone-400 font-medium text-center py-6">Tidak ada item dalam pesanan ini.</p>
                ) : (
                  <div className="border border-stone-200 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-stone-50 border-b border-stone-200">
                          <tr>
                            <th className="font-extrabold text-[10px] uppercase tracking-widest text-stone-400 px-5 py-4">Produk</th>
                            <th className="font-extrabold text-[10px] uppercase tracking-widest text-stone-400 px-4 py-4 w-36">Warna</th>
                            <th className="font-extrabold text-[10px] uppercase tracking-widest text-stone-400 px-4 py-4 w-28">Qty (Yard)</th>
                            <th className="font-extrabold text-[10px] uppercase tracking-widest text-stone-400 px-4 py-4 w-44">Harga Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                          {items.map(item => (
                            <tr key={item.id} className="bg-white hover:bg-stone-50 transition-colors">
                              <td className="px-5 py-4">
                                <p className="font-bold text-stone-900">{item.product_name}</p>
                                <div className="flex items-center gap-1.5 mt-1">
                                  {item.color_hex && (
                                    <div className="w-3 h-3 rounded-full border border-stone-200 shrink-0" style={{ backgroundColor: item.color_hex }} />
                                  )}
                                  <p className="text-[11px] font-semibold text-stone-500">
                                    {item.color_name && item.color_name !== "-"
                                      ? item.color_name
                                      : (item.color_hex ?? "-")}
                                  </p>
                                </div>
                              </td>
                              <td className="px-4 py-4">
                                <input
                                  type="text"
                                  value={item.warna}
                                  onChange={e => updateItem(item.id, "warna", e.target.value)}
                                  placeholder="mis. Merah"
                                  className="w-full bg-white border border-stone-200 text-stone-800 text-sm font-bold rounded-xl px-3 py-2 focus:outline-none focus:border-[#e61e25] focus:ring-2 focus:ring-[#e61e25]/10"
                                />
                              </td>
                              <td className="px-4 py-4">
                                <input
                                  type="number"
                                  min="0"
                                  step="any"
                                  value={item.qty_yard}
                                  onChange={e => updateItem(item.id, "qty_yard", e.target.value)}
                                  className="w-full bg-white border border-stone-200 text-stone-800 text-sm font-bold rounded-xl px-3 py-2 focus:outline-none focus:border-[#e61e25] focus:ring-2 focus:ring-[#e61e25]/10 text-center"
                                />
                              </td>
                              <td className="px-4 py-4">
                                <input
                                  type="number"
                                  min="0"
                                  value={item.total_price}
                                  onChange={e => updateItem(item.id, "total_price", e.target.value)}
                                  className="w-full bg-white border border-stone-200 text-stone-800 text-sm font-bold rounded-xl px-3 py-2 focus:outline-none focus:border-[#e61e25] focus:ring-2 focus:ring-[#e61e25]/10 text-right"
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </section>

              {/* Catatan */}
              <section className="bg-white p-8 md:p-10 rounded-[2rem] shadow-sm border border-stone-100 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-stone-300"></div>

                <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 rounded-2xl bg-stone-50 text-stone-400 flex items-center justify-center shrink-0 border border-stone-200">
                    <span className="font-black text-lg">3</span>
                  </div>
                  <h3 className="text-lg font-black text-stone-900">Catatan <span className="text-stone-400 font-semibold text-sm ml-1">(Opsional)</span></h3>
                </div>

                <textarea
                  rows="3"
                  value={form.notes}
                  onChange={e => handleChange("notes", e.target.value)}
                  placeholder="Instruksi khusus atau informasi tambahan..."
                  className="w-full min-h-[100px] resize-none bg-stone-50 border border-stone-200 text-stone-800 text-sm font-semibold rounded-2xl px-5 py-4 focus:outline-none focus:border-stone-900 focus:ring-4 focus:ring-stone-900/10 transition-all placeholder:text-stone-400 leading-relaxed"
                />
              </section>
            </div>

            {/* Right Column — Ringkasan */}
            <div className="lg:col-span-4 relative">
              <div className="sticky top-32 bg-stone-900 text-white p-8 rounded-[2rem] shadow-xl flex flex-col gap-6">
                <h3 className="text-xl font-black tracking-tight flex items-center gap-3 border-b border-stone-700 pb-6">
                  <span className="material-symbols-outlined text-[#e61e25]">receipt_long</span>
                  Ringkasan
                </h3>

                <div className="space-y-4 max-h-[30vh] overflow-y-auto pr-1">
                  {items.length === 0 ? (
                    <p className="text-sm text-stone-500 italic text-center py-4">Tidak ada item.</p>
                  ) : (
                    items.map(item => (
                      <div key={item.id} className="flex justify-between items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <span className="block text-sm font-bold text-stone-100 truncate">{item.product_name}</span>
                          {item.warna && (
                            <span className="block text-[10px] text-stone-400 mt-0.5">{item.warna}</span>
                          )}
                          {Number(item.qty_yard) > 0 && (
                            <span className="block text-[10px] uppercase tracking-widest text-stone-400 mt-0.5">
                              {item.qty_yard} yard
                            </span>
                          )}
                        </div>
                        <span className="font-bold text-sm text-stone-100 shrink-0">
                          {formatIDR(item.total_price)}
                        </span>
                      </div>
                    ))
                  )}
                </div>

                <div className="pt-6 border-t border-stone-700">
                  <p className="text-[10px] uppercase tracking-widest font-extrabold text-stone-400 mb-1">Total Tagihan</p>
                  <p className="text-4xl font-black text-white tracking-tight">{formatIDR(grandTotal)}</p>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-4 px-6 rounded-2xl font-extrabold text-[12px] uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-3 bg-[#e61e25] hover:bg-[#bd0015] shadow-[0_8px_30px_rgb(230,30,37,0.3)] hover:-translate-y-1 disabled:opacity-50 disabled:bg-stone-700 disabled:text-stone-400 disabled:shadow-none disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  {saving ? (
                    <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
                  ) : (
                    <span className="material-symbols-outlined text-[20px]">save</span>
                  )}
                  {saving ? "Menyimpan..." : "Simpan Perubahan"}
                </button>

                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="w-full py-3 px-6 rounded-2xl font-extrabold text-[12px] uppercase tracking-widest text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors text-center"
                >
                  Batal
                </button>
              </div>
            </div>

          </form>
        )}
      </div>
    </div>
  );
}
