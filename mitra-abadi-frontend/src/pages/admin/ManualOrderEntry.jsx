import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api";

export default function ManualOrderEntry() {
  const navigate = useNavigate();
  const [availableProducts, setAvailableProducts] = useState([]);
  const [items, setItems] = useState([]);
  const [customer, setCustomer] = useState({ name: "", phone: "", email: "", address: "" });
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
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
      color: variant.color_name,
      qty_roll: 1,
      price_per_meter: parseFloat(product.price_min) || 0,
      available: variant.inventory?.stock_roll ?? 0,
    }]);
  };

  const updateItem = (id, field, value) => {
    setItems(prev => prev.map(it => it.id === id ? { ...it, [field]: value } : it));
  };

  const removeItem = (id) => setItems(prev => prev.filter(it => it.id !== id));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customer.name.trim() || items.length === 0) {
      setError("Nama customer dan minimal 1 item diperlukan.");
      return;
    }
    setSaving(true);
    setError("");
    setSuccessMsg("");
    try {
      await api.post('/admin/orders', {
        customer_name: customer.name,
        customer_phone: customer.phone,
        customer_email: customer.email || null,
        customer_address: customer.address,
        notes,
        items: items.map(it => ({
          product_variant_id: it.product_variant_id,
          qty_roll: Number(it.qty_roll),
          price_per_meter: Number(it.price_per_meter),
        })),
      });
      setSuccessMsg("Order berhasil disimpan!");
      setItems([]);
      setCustomer({ name: "", phone: "", email: "", address: "" });
      setNotes("");
    } catch (err) {
      setError(err.response?.data?.message ?? 'Gagal menyimpan order.');
    } finally {
      setSaving(false);
    }
  };

  const filteredProducts = availableProducts.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="px-8 py-8">
      {/* Page header */}
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-display font-extrabold tracking-tight text-on-surface mb-2">
            Catat Pesanan
          </h2>
          <p className="font-body text-on-surface-variant text-lg leading-relaxed">
            Catat penjualan langsung dan permintaan eksternal. Verifikasi ketersediaan stok sebelum finalisasi.
          </p>
        </div>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => {
              setItems([]);
              setCustomer({ name: "", phone: "", email: "", address: "" });
              setNotes("");
              setError("");
              setSuccessMsg("");
            }}
            className="font-body text-sm uppercase tracking-widest font-semibold text-primary underline underline-offset-4 decoration-1 hover:text-primary-container transition-colors px-4 py-2"
          >
            Clear Draft
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column */}
          <div className="lg:col-span-8 space-y-12">

            {/* Step 1: Customer Details */}
            <section className="bg-surface-container-lowest p-8 md:p-10 rounded-xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-surface-container-high group-hover:bg-primary transition-colors duration-500"></div>
              <div className="flex items-baseline gap-4 mb-8">
                <span className="font-headline text-4xl font-black text-surface-container-highest select-none">01</span>
                <h3 className="font-headline text-xl font-bold tracking-tight text-on-surface">Customer Details</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="md:col-span-2">
                  <label className="block font-body text-xs uppercase tracking-widest font-semibold text-on-surface-variant mb-2">
                    Nama Customer *
                  </label>
                  <input
                    type="text"
                    value={customer.name}
                    onChange={e => setCustomer({ ...customer, name: e.target.value })}
                    placeholder="Nama lengkap customer..."
                    className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:ring-0 px-0 py-2 font-body text-on-surface placeholder-surface-dim transition-colors"
                  />
                </div>
                <div>
                  <label className="block font-body text-xs uppercase tracking-widest font-semibold text-on-surface-variant mb-2">
                    Nomor Telepon
                  </label>
                  <div className="flex relative">
                    <span className="material-symbols-outlined absolute left-0 top-2 text-surface-dim">phone</span>
                    <input
                      type="tel"
                      value={customer.phone}
                      onChange={e => setCustomer({ ...customer, phone: e.target.value })}
                      placeholder="+62 8xx-xxxx-xxxx"
                      className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:ring-0 pl-8 pr-0 py-2 font-body text-on-surface placeholder-surface-dim transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-body text-xs uppercase tracking-widest font-semibold text-on-surface-variant mb-2">
                    Email <span className="normal-case text-on-surface-variant/50">(Opsional)</span>
                  </label>
                  <div className="flex relative">
                    <span className="material-symbols-outlined absolute left-0 top-2 text-surface-dim">mail</span>
                    <input
                      type="email"
                      value={customer.email}
                      onChange={e => setCustomer({ ...customer, email: e.target.value })}
                      placeholder="email@contoh.com"
                      className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:ring-0 pl-8 pr-0 py-2 font-body text-on-surface placeholder-surface-dim transition-colors"
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block font-body text-xs uppercase tracking-widest font-semibold text-on-surface-variant mb-2">
                    Alamat Pengiriman
                  </label>
                  <input
                    type="text"
                    value={customer.address}
                    onChange={e => setCustomer({ ...customer, address: e.target.value })}
                    placeholder="Alamat pengiriman lengkap..."
                    className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:ring-0 px-0 py-2 font-body text-on-surface placeholder-surface-dim transition-colors"
                  />
                </div>
              </div>
            </section>

            {/* Step 2: Product Selection */}
            <section className="bg-surface-container-lowest p-8 md:p-10 rounded-xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
              <div className="flex items-baseline gap-4 mb-8">
                <span className="font-headline text-4xl font-black text-surface-container-highest select-none">02</span>
                <h3 className="font-headline text-xl font-bold tracking-tight text-on-surface">Pilih Produk</h3>
              </div>

              {/* Search */}
              <div className="mb-6">
                <div className="relative bg-surface-container-low rounded-lg p-1 flex items-center">
                  <span className="material-symbols-outlined text-on-surface-variant ml-3">search</span>
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Cari produk..."
                    className="w-full bg-transparent border-none focus:ring-0 font-body text-on-surface placeholder-on-surface-variant py-3 px-4"
                  />
                </div>
              </div>

              {/* Product Grid */}
              {filteredProducts.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
                  {filteredProducts.map(product => {
                    const variant = product.variants?.[0];
                    const alreadyAdded = items.some(it => it.product_variant_id === variant?.id);
                    return (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => addItem(product)}
                        disabled={alreadyAdded || !variant}
                        className={`text-left p-4 rounded-lg border transition-colors ${
                          alreadyAdded
                            ? 'border-primary/40 bg-primary/5 opacity-60 cursor-default'
                            : 'border-outline-variant/30 bg-surface-container-low hover:bg-surface-container hover:border-primary/40 cursor-pointer'
                        }`}
                      >
                        <p className="font-body text-sm font-semibold text-on-surface truncate">{product.name}</p>
                        {variant && (
                          <p className="font-body text-xs text-on-surface-variant mt-1">{variant.color_name}</p>
                        )}
                        <p className="font-body text-xs text-on-surface-variant mt-1">
                          Stok: {variant?.inventory?.stock_roll ?? '-'} roll
                        </p>
                        <p className="font-body text-xs font-medium text-primary mt-1">
                          IDR {parseFloat(product.price_min || 0).toLocaleString('id-ID')}/m
                        </p>
                        {alreadyAdded && (
                          <p className="font-body text-[10px] text-primary font-bold uppercase tracking-wider mt-1">Ditambahkan</p>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {filteredProducts.length === 0 && search && (
                <div className="text-center py-6 text-on-surface-variant font-body text-sm mb-6">
                  Tidak ada produk yang cocok dengan "{search}".
                </div>
              )}

              {/* Selected Items */}
              {items.length > 0 && (
                <div>
                  <h4 className="font-body text-xs uppercase tracking-widest font-semibold text-on-surface-variant mb-4">
                    Item Dipilih
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-outline-variant/30">
                          <th className="text-left font-body text-xs uppercase tracking-widest text-on-surface-variant pb-3 pr-4">Produk</th>
                          <th className="text-left font-body text-xs uppercase tracking-widest text-on-surface-variant pb-3 pr-4">Warna</th>
                          <th className="text-left font-body text-xs uppercase tracking-widest text-on-surface-variant pb-3 pr-4">Qty (Roll)</th>
                          <th className="text-left font-body text-xs uppercase tracking-widest text-on-surface-variant pb-3 pr-4">Harga/Meter</th>
                          <th className="text-left font-body text-xs uppercase tracking-widest text-on-surface-variant pb-3 pr-4">Stok</th>
                          <th className="pb-3"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/20">
                        {items.map(item => (
                          <tr key={item.id}>
                            <td className="py-3 pr-4 font-medium text-on-surface">{item.name}</td>
                            <td className="py-3 pr-4 text-on-surface-variant">{item.color}</td>
                            <td className="py-3 pr-4">
                              <input
                                type="number"
                                min="1"
                                value={item.qty_roll}
                                onChange={e => updateItem(item.id, 'qty_roll', e.target.value)}
                                className="w-20 bg-transparent border-b border-outline-variant focus:border-primary focus:ring-0 px-0 py-1 text-on-surface text-center"
                              />
                            </td>
                            <td className="py-3 pr-4">
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.price_per_meter}
                                onChange={e => updateItem(item.id, 'price_per_meter', e.target.value)}
                                className="w-28 bg-transparent border-b border-outline-variant focus:border-primary focus:ring-0 px-0 py-1 text-on-surface text-right"
                              />
                            </td>
                            <td className="py-3 pr-4 text-on-surface-variant text-xs">{item.available} roll</td>
                            <td className="py-3">
                              <button
                                type="button"
                                onClick={() => removeItem(item.id)}
                                className="text-on-surface-variant hover:text-error transition-colors"
                              >
                                <span className="material-symbols-outlined text-[18px]">close</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {items.length === 0 && (
                <div className="text-center py-8 text-on-surface-variant">
                  <p className="font-body text-sm">Belum ada produk dipilih. Klik produk di atas untuk menambahkan.</p>
                </div>
              )}
            </section>

            {/* Step 3: Notes */}
            <section className="bg-surface-container-lowest p-8 md:p-10 rounded-xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-surface-container-high group-hover:bg-primary transition-colors duration-500"></div>
              <div className="flex items-baseline gap-4 mb-8">
                <span className="font-headline text-4xl font-black text-surface-container-highest select-none">03</span>
                <h3 className="font-headline text-xl font-bold tracking-tight text-on-surface">Catatan</h3>
              </div>
              <div>
                <label className="block font-body text-xs uppercase tracking-widest font-semibold text-on-surface-variant mb-2">
                  Catatan Order (Opsional)
                </label>
                <textarea
                  rows="3"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Catatan khusus untuk order ini..."
                  className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:ring-0 px-0 py-2 font-body text-on-surface placeholder-surface-dim transition-colors resize-none"
                />
              </div>
            </section>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-4 relative">
            <div className="sticky top-24 bg-surface-container-lowest p-8 rounded-xl shadow-[0_0_40px_rgba(26,28,28,0.06)]">
              <h3 className="font-headline text-lg font-bold tracking-tight text-on-surface mb-6 border-b border-surface-container-highest pb-4">
                Ringkasan Order
              </h3>

              <div className="space-y-4 mb-8">
                {items.length === 0 && (
                  <p className="font-body text-sm text-on-surface-variant">Belum ada item.</p>
                )}
                {items.map(item => (
                  <div key={item.id} className="flex justify-between items-start">
                    <div>
                      <span className="block font-body text-sm font-medium text-on-surface">{item.name}</span>
                      <span className="block font-body text-[10px] uppercase tracking-widest text-on-surface-variant mt-0.5">
                        {item.qty_roll} roll × IDR {parseFloat(item.price_per_meter || 0).toLocaleString('id-ID')}/m
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Feedback */}
              {successMsg && (
                <div className="mb-4 p-4 bg-surface-container-highest rounded-md text-sm text-on-surface font-medium">
                  {successMsg}
                </div>
              )}
              {error && (
                <div className="mb-4 p-4 bg-error-container/30 rounded-md border border-error/20 text-sm text-error">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={saving}
                className={`w-full py-4 px-6 rounded-md font-bold text-sm tracking-wide transition-colors duration-300 flex items-center justify-center gap-2 ${
                  saving
                    ? "bg-surface-container-highest text-on-surface-variant cursor-not-allowed"
                    : "bg-primary-container text-on-primary-container hover:bg-primary"
                }`}
              >
                <span className="material-symbols-outlined text-sm">
                  {saving ? "hourglass_empty" : "receipt_long"}
                </span>
                {saving ? "Menyimpan..." : "Buat Order"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
