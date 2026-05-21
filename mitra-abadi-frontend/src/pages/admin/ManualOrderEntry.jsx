import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api";
import Swal from "sweetalert2";

export default function ManualOrderEntry() {
  const navigate = useNavigate();
  const [availableProducts, setAvailableProducts] = useState([]);
  const [items, setItems] = useState([]);
  const [customer, setCustomer] = useState({ name: "", phone: "", email: "", address: "" });
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.get('/admin/products')
      .then(res => setAvailableProducts(res.data.data ?? []))
      .catch(console.error);
  }, []);

  const addItem = (product) => {
    const variant = product.variants?.[0];
    if (!variant) return;
    // Prevent duplicate
    if (items.some(it => it.product_variant_id === variant.id)) return;
    setItems(prev => [...prev, {
      id: Date.now(),
      product_variant_id: variant.id,
      name: product.name,
      color: variant.color_name || variant.color_hex,
      color_hex: variant.color_hex,
      warna: "",
      qty_yard: 0,
      total_price: parseFloat(product.price_min) || 0,
    }]);
  };

  const updateItem = (id, field, value) => {
    setItems(prev => prev.map(it => it.id === id ? { ...it, [field]: value } : it));
  };

  const removeItem = (id) => setItems(prev => prev.filter(it => it.id !== id));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customer.name.trim() || items.length === 0) {
      setError("Nama pelanggan dan minimal 1 item produk diperlukan.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await api.post('/admin/orders', {
        customer_name: customer.name,
        customer_phone: customer.phone,
        customer_email: customer.email || null,
        customer_address: customer.address,
        notes,
        items: items.map(it => ({
          product_variant_id: it.product_variant_id,
          warna: it.warna || null,
          qty_yard: Number(it.qty_yard) || 0,
          total_price: Number(it.total_price),
        })),
      });
      
      await Swal.fire({
        title: "Pesanan Berhasil!",
        text: "Pesanan baru telah berhasil dicatat ke dalam sistem.",
        icon: "success",
        confirmButtonColor: "#e61e25",
        timer: 2000,
        showConfirmButton: false,
      });

      // Clear draft after success
      setItems([]);
      setCustomer({ name: "", phone: "", email: "", address: "" });
      setNotes("");
      setSearch("");
    } catch (err) {
      setError(err.response?.data?.message ?? 'Gagal menyimpan pesanan. Silakan coba lagi.');
    } finally {
      setSaving(false);
    }
  };

  const filteredProducts = availableProducts.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const grandTotal = useMemo(() => {
    return items.reduce((acc, it) => acc + Number(it.total_price), 0);
  }, [items]);

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
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-stone-400">Manajemen Transaksi</p>
              <h1 className="text-xl font-extrabold text-stone-900">Catat Pesanan</h1>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setItems([]);
              setCustomer({ name: "", phone: "", email: "", address: "" });
              setNotes("");
              setError("");
              setSearch("");
            }}
            className="hidden md:flex items-center gap-2 bg-stone-100 text-stone-600 font-bold text-[11px] uppercase tracking-widest px-6 py-3 rounded-xl hover:bg-stone-200 hover:text-stone-900 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">delete_sweep</span>
            Bersihkan Draft
          </button>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 md:px-8 mt-10">
        
        {/* Page Header */}
        <div className="mb-10 max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-black text-stone-900 leading-tight mb-3">
            Buat Pesanan Baru
          </h2>
          <p className="text-stone-500 font-medium leading-relaxed">
            Catat penjualan langsung secara manual. Verifikasi data pelanggan dan ketersediaan stok sebelum melakukan finalisasi.
          </p>
        </div>

        {error && (
          <div className="mb-8 p-5 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-4">
            <svg className="w-6 h-6 text-[#e61e25] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <div>
              <h4 className="text-sm font-extrabold text-stone-900 mb-1">Gagal menyimpan pesanan</h4>
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* ── Left Column (Forms) ── */}
          <div className="lg:col-span-8 flex flex-col gap-8">

            {/* Step 1: Informasi Pelanggan */}
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
                    value={customer.name}
                    onChange={e => setCustomer({ ...customer, name: e.target.value })}
                    placeholder="Nama lengkap..."
                    required
                    className="w-full bg-stone-50 border border-stone-200 text-stone-800 text-sm font-bold rounded-2xl px-5 py-4 focus:outline-none focus:border-[#e61e25] focus:ring-4 focus:ring-[#e61e25]/10 transition-all placeholder:text-stone-400"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-extrabold uppercase tracking-widest text-stone-500 mb-2.5 block">
                    Nomor Telepon
                  </label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-[#e61e25] transition-colors">phone</span>
                    <input
                      type="tel"
                      value={customer.phone}
                      onChange={e => setCustomer({ ...customer, phone: e.target.value })}
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
                      value={customer.email}
                      onChange={e => setCustomer({ ...customer, email: e.target.value })}
                      placeholder="email@contoh.com"
                      className="w-full bg-stone-50 border border-stone-200 text-stone-800 text-sm font-bold rounded-2xl pl-12 pr-5 py-4 focus:outline-none focus:border-[#e61e25] focus:ring-4 focus:ring-[#e61e25]/10 transition-all placeholder:text-stone-400"
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="text-[11px] font-extrabold uppercase tracking-widest text-stone-500 mb-2.5 block">
                    Alamat Pengiriman
                  </label>
                  <textarea
                    value={customer.address}
                    onChange={e => setCustomer({ ...customer, address: e.target.value })}
                    placeholder="Alamat lengkap tujuan pengiriman..."
                    className="w-full min-h-[100px] resize-none bg-stone-50 border border-stone-200 text-stone-800 text-sm font-semibold rounded-2xl px-5 py-4 focus:outline-none focus:border-[#e61e25] focus:ring-4 focus:ring-[#e61e25]/10 transition-all placeholder:text-stone-400 leading-relaxed"
                  />
                </div>
              </div>
            </section>

            {/* Step 2: Pilih Produk */}
            <section className="bg-white p-8 md:p-10 rounded-[2rem] shadow-sm border border-stone-100 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-2 h-full bg-stone-900"></div>
              
              <div className="flex items-center gap-4 mb-8 pb-6 border-b border-stone-100">
                <div className="w-10 h-10 rounded-2xl bg-stone-100 text-stone-900 flex items-center justify-center shrink-0 border border-stone-200">
                  <span className="font-black text-lg">2</span>
                </div>
                <div>
                  <h3 className="text-lg font-black text-stone-900">Pilih Produk</h3>
                  <p className="text-[11px] font-bold text-stone-400 uppercase tracking-widest mt-1">Cari dan tambahkan item</p>
                </div>
              </div>

              {/* Pencarian Produk */}
              <div className="mb-6">
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-stone-900 transition-colors">search</span>
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Ketik nama produk..."
                    className="w-full bg-stone-50 border border-stone-200 text-stone-800 text-sm font-bold rounded-2xl pl-14 pr-5 py-4 focus:outline-none focus:border-stone-900 focus:ring-4 focus:ring-stone-900/10 transition-all placeholder:text-stone-400"
                  />
                </div>
              </div>

              {/* Daftar Produk Tersedia */}
              <div className="mb-8">
                {filteredProducts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
                    {filteredProducts.map(product => {
                      const variant = product.variants?.[0];
                      const alreadyAdded = items.some(it => it.product_variant_id === variant?.id);
                      return (
                        <div
                          key={product.id}
                          onClick={() => !alreadyAdded && variant && addItem(product)}
                          className={`p-5 rounded-2xl border transition-all ${
                            alreadyAdded
                              ? 'border-stone-200 bg-stone-50 opacity-60 cursor-not-allowed'
                              : !variant
                              ? 'border-red-100 bg-red-50 opacity-60 cursor-not-allowed'
                              : 'border-stone-200 bg-white hover:border-stone-900 hover:shadow-md cursor-pointer'
                          }`}
                        >
                          <h4 className="font-extrabold text-stone-900 text-sm truncate mb-1">{product.name}</h4>
                          <div className="flex items-center gap-2 mt-3">
                            {variant?.color_hex && (
                              <div
                                className="w-5 h-5 rounded-full border border-stone-200 shrink-0 shadow-sm"
                                style={{ backgroundColor: variant.color_hex }}
                              />
                            )}
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-0.5">Warna</p>
                              <p className="text-xs font-semibold text-stone-700">
                                {variant ? (variant.color_name || variant.color_hex || '—') : "Kosong"}
                                {variant?.color_hex && (
                                  <span className="text-stone-400 ml-1 font-mono">{variant.color_hex}</span>
                                )}
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 pt-4 border-t border-stone-100 flex items-center justify-between">
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-0.5">Range Harga</p>
                              <span className="font-bold text-stone-900 text-sm">
                                Rp {parseFloat(product.price_min || 0).toLocaleString('id-ID')}
                                {product.price_max && parseFloat(product.price_max) !== parseFloat(product.price_min) && (
                                  <> – Rp {parseFloat(product.price_max).toLocaleString('id-ID')}</>
                                )}
                              </span>
                            </div>
                            {alreadyAdded ? (
                              <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">Ditambahkan</span>
                            ) : !variant ? (
                              <span className="text-[10px] font-extrabold uppercase tracking-widest text-red-600 bg-red-50 px-2 py-1 rounded-md">Habis</span>
                            ) : (
                              <span className="material-symbols-outlined text-stone-400">add_circle</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-10 border-2 border-dashed border-stone-200 rounded-2xl bg-stone-50">
                    <span className="material-symbols-outlined text-stone-300 text-4xl mb-2">inventory_2</span>
                    <p className="font-bold text-stone-500 text-sm">Tidak ada produk yang cocok dengan "{search}"</p>
                  </div>
                )}
              </div>

              {/* Item Terpilih (Keranjang) */}
              <div>
                <h4 className="text-[11px] font-extrabold uppercase tracking-widest text-stone-500 mb-4">
                  Item Terpilih ({items.length})
                </h4>
                {items.length > 0 ? (
                  <div className="border border-stone-200 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-stone-50 border-b border-stone-200">
                          <tr>
                            <th className="font-extrabold text-[10px] uppercase tracking-widest text-stone-400 px-5 py-4">Produk</th>
                            <th className="font-extrabold text-[10px] uppercase tracking-widest text-stone-400 px-4 py-4 w-36">Warna</th>
                            <th className="font-extrabold text-[10px] uppercase tracking-widest text-stone-400 px-4 py-4 w-28">Qty (Yard)</th>
                            <th className="font-extrabold text-[10px] uppercase tracking-widest text-stone-400 px-4 py-4 w-44">Harga Total</th>
                            <th className="font-extrabold text-[10px] uppercase tracking-widest text-stone-400 px-4 py-4 text-center">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                          {items.map(item => (
                            <tr key={item.id} className="bg-white hover:bg-stone-50 transition-colors">
                              <td className="px-5 py-4">
                                <p className="font-bold text-stone-900">{item.name}</p>
                                <div className="flex items-center gap-1.5 mt-1">
                                  {item.color_hex && (
                                    <div className="w-3 h-3 rounded-full border border-stone-200 shrink-0" style={{ backgroundColor: item.color_hex }} />
                                  )}
                                  <p className="text-[11px] font-semibold text-stone-500">{item.color}</p>
                                </div>
                              </td>
                              <td className="px-4 py-4">
                                <input
                                  type="text"
                                  value={item.warna}
                                  onChange={e => updateItem(item.id, 'warna', e.target.value)}
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
                                  onChange={e => updateItem(item.id, 'qty_yard', e.target.value)}
                                  className="w-full bg-white border border-stone-200 text-stone-800 text-sm font-bold rounded-xl px-3 py-2 focus:outline-none focus:border-[#e61e25] focus:ring-2 focus:ring-[#e61e25]/10 text-center"
                                />
                              </td>
                              <td className="px-4 py-4">
                                <input
                                  type="number"
                                  min="0"
                                  value={item.total_price}
                                  onChange={e => updateItem(item.id, 'total_price', e.target.value)}
                                  className="w-full bg-white border border-stone-200 text-stone-800 text-sm font-bold rounded-xl px-3 py-2 focus:outline-none focus:border-[#e61e25] focus:ring-2 focus:ring-[#e61e25]/10 text-right"
                                />
                              </td>
                              <td className="px-4 py-4 text-center">
                                <button
                                  type="button"
                                  onClick={() => removeItem(item.id)}
                                  className="w-8 h-8 inline-flex items-center justify-center rounded-lg text-stone-400 hover:bg-red-50 hover:text-[#e61e25] transition-colors"
                                  title="Hapus Item"
                                >
                                  <span className="material-symbols-outlined text-[20px]">delete</span>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 border-2 border-dashed border-stone-200 rounded-2xl bg-stone-50">
                    <p className="font-bold text-stone-500 text-sm">Belum ada item dipilih.</p>
                    <p className="text-xs text-stone-400 mt-1">Klik produk di atas untuk menambahkannya ke pesanan.</p>
                  </div>
                )}
              </div>
            </section>

            {/* Step 3: Catatan */}
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
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Tulis instruksi khusus, request potongan, atau informasi tambahan untuk order ini..."
                className="w-full min-h-[120px] resize-none bg-stone-50 border border-stone-200 text-stone-800 text-sm font-semibold rounded-2xl px-5 py-4 focus:outline-none focus:border-stone-900 focus:ring-4 focus:ring-stone-900/10 transition-all placeholder:text-stone-400 leading-relaxed"
              />
            </section>

          </div>

          {/* ── Right Column (Summary) ── */}
          <div className="lg:col-span-4 relative">
            <div className="sticky top-32 bg-stone-900 text-white p-8 rounded-[2rem] shadow-xl">
              <h3 className="text-xl font-black tracking-tight mb-6 flex items-center gap-3 border-b border-stone-700 pb-6">
                <span className="material-symbols-outlined text-[#e61e25]">receipt_long</span>
                Ringkasan Order
              </h3>

              <div className="space-y-4 mb-8 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar-dark">
                {items.length === 0 ? (
                  <p className="text-sm text-stone-500 font-medium italic text-center py-4">Draft pesanan kosong.</p>
                ) : (
                  items.map(item => (
                    <div key={item.id} className="flex justify-between items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <span className="block text-sm font-bold text-stone-100 truncate">{item.name}</span>
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
                        Rp {Number(item.total_price || 0).toLocaleString('id-ID')}
                      </span>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-6 border-t border-stone-700 mb-8">
                <p className="text-[10px] uppercase tracking-widest font-extrabold text-stone-400 mb-1">
                  Total Keseluruhan
                </p>
                <p className="text-4xl font-black text-white tracking-tight">
                  Rp {grandTotal.toLocaleString('id-ID')}
                </p>
              </div>

              <button
                type="submit"
                disabled={saving || items.length === 0}
                className="w-full py-4 px-6 rounded-2xl font-extrabold text-[12px] uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-3 bg-[#e61e25] hover:bg-[#bd0015] shadow-[0_8px_30px_rgb(230,30,37,0.3)] hover:-translate-y-1 disabled:opacity-50 disabled:bg-stone-700 disabled:text-stone-400 disabled:shadow-none disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {saving ? (
                  <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
                ) : (
                  <span className="material-symbols-outlined text-[20px]">check_circle</span>
                )}
                {saving ? "Memproses..." : "Buat Order Sekarang"}
              </button>
            </div>
          </div>

        </form>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f5f5f4; 
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d6d3d1; 
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a8a29e; 
        }

        .custom-scrollbar-dark::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar-dark::-webkit-scrollbar-track {
          background: #292524; 
          border-radius: 10px;
        }
        .custom-scrollbar-dark::-webkit-scrollbar-thumb {
          background: #57534e; 
          border-radius: 10px;
        }
      `}} />
    </div>
  );
}