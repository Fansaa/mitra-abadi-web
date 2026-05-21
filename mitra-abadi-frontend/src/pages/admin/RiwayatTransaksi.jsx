import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api";
import Sk from "../../components/Skeleton";
import Swal from "sweetalert2";

// --- Helpers ---

function formatIDR(amount) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount ?? 0);
}

function formatDate(dateStr) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatProductSummary(items) {
  if (!items || items.length === 0) return "-";
  const firstName = items[0]?.product_name ?? items[0]?.name ?? "Produk";
  if (items.length === 1) return firstName;
  return `${firstName} + ${items.length - 1} lainnya`;
}

// --- Download Helper ---

async function downloadPdf(orderId, type, filename) {
  const response = await api.get(`/admin/orders/${orderId}/${type}`, {
    responseType: "blob",
  });
  const url = URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// --- Detail Modal ---

function DetailModal({ order, onClose }) {
  if (!order) return null;

  const [downloadingInvoice, setDownloadingInvoice] = useState(false);
  const [downloadingPacking, setDownloadingPacking] = useState(false);

  const handleDownloadInvoice = async () => {
    setDownloadingInvoice(true);
    try {
      await downloadPdf(order.id, "invoice", `invoice_${order.order_code}.pdf`);
    } finally {
      setDownloadingInvoice(false);
    }
  };

  const handleDownloadPackingList = async () => {
    setDownloadingPacking(true);
    try {
      await downloadPdf(order.id, "packing-list", `packing_list_${order.order_code}.pdf`);
    } finally {
      setDownloadingPacking(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm transition-opacity"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-[2rem] shadow-[0_24px_64px_-12px_rgba(0,0,0,0.2)] border border-stone-100 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-stone-100 bg-stone-50/50">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-red-50 text-[#e61e25] flex items-center justify-center shrink-0 border border-red-100">
              <span className="material-symbols-outlined text-[20px]">receipt_long</span>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] font-extrabold text-stone-400 mb-0.5">
                Detail Transaksi
              </p>
              <h3 className="text-lg font-black text-stone-900 leading-tight">
                {order.order_code}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center text-stone-400 hover:bg-stone-100 hover:text-stone-900 transition-colors"
            aria-label="Tutup"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto flex-1 p-8 space-y-8 bg-stone-50/30">
          
          {/* Date */}
          <div className="flex items-center gap-2 text-stone-600 bg-white p-5 rounded-2xl border border-stone-100 shadow-sm w-fit">
            <span className="material-symbols-outlined text-[18px]">calendar_today</span>
            <span className="font-semibold text-sm">{formatDate(order.created_at)}</span>
          </div>

          {/* Customer Info */}
          <section>
            <h4 className="text-[11px] font-extrabold uppercase tracking-widest text-stone-500 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">person</span>
              Informasi Pelanggan
            </h4>
            <div className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-stone-400 mb-1">Nama Lengkap</p>
                <p className="text-sm font-extrabold text-stone-900">{order.customer_name || "-"}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-stone-400 mb-1">Nomor Telepon</p>
                <p className="text-sm font-extrabold text-stone-900">{order.customer_phone || "-"}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-stone-400 mb-1">Email</p>
                <p className="text-sm font-extrabold text-stone-900">{order.customer_email || "-"}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-stone-400 mb-1">Alamat Pengiriman</p>
                <p className="text-sm font-medium text-stone-700 leading-relaxed">{order.customer_address || "-"}</p>
              </div>
            </div>
          </section>

          {/* Items Table */}
          <section>
            <h4 className="text-[11px] font-extrabold uppercase tracking-widest text-stone-500 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">inventory_2</span>
              Item Pesanan
            </h4>
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-stone-50 border-b border-stone-100">
                    <tr>
                      <th className="font-extrabold text-[10px] uppercase tracking-widest text-stone-400 px-6 py-4">Produk</th>
                      <th className="font-extrabold text-[10px] uppercase tracking-widest text-stone-400 px-4 py-4">Warna</th>
                      <th className="font-extrabold text-[10px] uppercase tracking-widest text-stone-400 px-4 py-4 text-center">Qty (Yard)</th>
                      <th className="font-extrabold text-[10px] uppercase tracking-widest text-stone-400 px-6 py-4 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {(order.items ?? []).map((item, idx) => (
                      <tr key={item.id ?? idx} className="hover:bg-stone-50/50 transition-colors">
                        <td className="px-6 py-4 font-bold text-stone-900">
                          {item.product_name ?? item.name ?? "-"}
                        </td>
                        <td className="px-4 py-4">
                          <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-stone-100 border border-stone-200 text-xs font-semibold text-stone-600">
                            {item.color_hex && (
                              <span
                                className="w-3 h-3 rounded-full border border-stone-300 shrink-0"
                                style={{ backgroundColor: item.color_hex }}
                              />
                            )}
                            {item.warna
                              ? item.warna
                              : item.color_name && item.color_name !== "-"
                              ? item.color_name
                              : (item.color_hex ?? "-")}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center font-bold text-stone-700">
                          {item.qty_yard != null && Number(item.qty_yard) > 0
                            ? Number(item.qty_yard).toLocaleString("id-ID", { maximumFractionDigits: 2 })
                            : "-"}
                        </td>
                        <td className="px-6 py-4 text-right font-black text-stone-900">
                          {item.subtotal != null ? formatIDR(item.subtotal) : "-"}
                        </td>
                      </tr>
                    ))}
                    {(order.items ?? []).length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-stone-500 font-medium text-sm bg-stone-50/50">
                          Tidak ada item dalam pesanan ini.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Total & Notes */}
          <section className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 bg-stone-900 text-white p-6 md:p-8 rounded-3xl shadow-lg">
            {order.notes ? (
              <div className="flex-1 max-w-sm">
                <p className="text-[10px] uppercase tracking-widest font-extrabold text-stone-400 mb-2">
                  Catatan Pelanggan
                </p>
                <p className="text-sm font-medium text-stone-300 leading-relaxed italic bg-white/10 p-4 rounded-xl">
                  "{order.notes}"
                </p>
              </div>
            ) : (
              <div className="flex-1"></div> // spacer
            )}
            <div className="md:text-right flex flex-col justify-center">
              <p className="text-[10px] uppercase tracking-widest font-extrabold text-stone-400 mb-1">
                Total Tagihan
              </p>
              <p className="text-3xl font-black text-white tracking-tight">
                {formatIDR(order.total_amount)}
              </p>
            </div>
          </section>
        </div>

        {/* Modal Footer */}
        <div className="px-8 py-6 border-t border-stone-100 bg-white flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadInvoice}
              disabled={downloadingInvoice}
              className="inline-flex items-center justify-center gap-2 font-bold text-[11px] uppercase tracking-widest px-6 py-3.5 rounded-xl bg-stone-900 text-white hover:bg-[#e61e25] disabled:opacity-50 disabled:hover:bg-stone-900 shadow-sm transition-colors"
            >
              {downloadingInvoice ? (
                <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
              ) : (
                <span className="material-symbols-outlined text-[16px]">receipt_long</span>
              )}
              Unduh Invoice
            </button>
            <button
              onClick={handleDownloadPackingList}
              disabled={downloadingPacking}
              className="inline-flex items-center justify-center gap-2 font-bold text-[11px] uppercase tracking-widest px-6 py-3.5 rounded-xl bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 hover:text-stone-900 disabled:opacity-50 transition-colors shadow-sm"
            >
              {downloadingPacking ? (
                <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
              ) : (
                <span className="material-symbols-outlined text-[16px]">inventory_2</span>
              )}
              Unduh Packing List
            </button>
          </div>
          <button
            onClick={onClose}
            className="font-bold text-[11px] uppercase tracking-widest px-6 py-3.5 rounded-xl text-stone-500 hover:bg-stone-100 hover:text-stone-900 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Main Page ---

export default function RiwayatTransaksi() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [search, setSearch] = useState("");
  const [tanggalDari, setTanggalDari] = useState("");
  const [tanggalSampai, setTanggalSampai] = useState("");

  // Modal
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Download state: { id, type } or null
  const [downloadingId, setDownloadingId] = useState(null);

  const handleDelete = async (order) => {
    const result = await Swal.fire({
      title: "Hapus Pesanan?",
      html: `Pesanan <strong>${order.order_code}</strong> atas nama <strong>${order.customer_name}</strong> akan dihapus permanen.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e61e25",
      cancelButtonColor: "#78716c",
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
    });
    if (!result.isConfirmed) return;
    try {
      await api.delete(`/admin/orders/${order.id}`);
      setOrders(prev => prev.filter(o => o.id !== order.id));
      await Swal.fire({
        title: "Berhasil Dihapus",
        text: `Pesanan ${order.order_code} telah dihapus.`,
        icon: "success",
        confirmButtonColor: "#e61e25",
        timer: 1800,
        showConfirmButton: false,
      });
    } catch {
      Swal.fire({ title: "Gagal", text: "Gagal menghapus pesanan.", icon: "error", confirmButtonColor: "#e61e25" });
    }
  };

  const handleDownload = async (order, type) => {
    const key = `${order.id}-${type}`;
    if (downloadingId === key) return;
    setDownloadingId(key);
    try {
      const filename =
        type === "invoice"
          ? `invoice_${order.order_code}.pdf`
          : `packing_list_${order.order_code}.pdf`;
      await downloadPdf(order.id, type, filename);
    } finally {
      setDownloadingId(null);
    }
  };

  useEffect(() => {
    setLoading(true);
    setError("");
    api
      .get("/admin/orders")
      .then((res) => setOrders(res.data.data ?? []))
      .catch((err) => {
        setError(err.response?.data?.message ?? "Gagal memuat riwayat transaksi.");
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Search by customer name or order code
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const matchName = (order.customer_name ?? "").toLowerCase().includes(q);
        const matchCode = (order.order_code ?? "").toLowerCase().includes(q);
        if (!matchName && !matchCode) return false;
      }

      // Date range filter
      if (tanggalDari) {
        const orderDate = new Date(order.created_at);
        const fromDate = new Date(tanggalDari);
        fromDate.setHours(0, 0, 0, 0);
        if (orderDate < fromDate) return false;
      }
      if (tanggalSampai) {
        const orderDate = new Date(order.created_at);
        const toDate = new Date(tanggalSampai);
        toDate.setHours(23, 59, 59, 999);
        if (orderDate > toDate) return false;
      }

      return true;
    });
  }, [orders, search, tanggalDari, tanggalSampai]);

  const handleClearFilters = () => {
    setSearch("");
    setTanggalDari("");
    setTanggalSampai("");
  };

  const hasActiveFilters = search.trim() || tanggalDari || tanggalSampai;

  return (
    <>
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
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-stone-400">Panel Admin</p>
                <h1 className="text-xl font-extrabold text-stone-900">Riwayat Transaksi</h1>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1400px] mx-auto px-6 md:px-8 mt-10">

          {/* Page Header Info */}
          <div className="mb-8 max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-black text-stone-900 leading-tight mb-3">
              Semua Pesanan
            </h2>
            <p className="text-stone-500 font-medium leading-relaxed">
              Pantau dan kelola seluruh riwayat pesanan pelanggan secara terpusat. Filter berdasarkan status atau tanggal untuk pencarian cepat.
            </p>
          </div>

          {/* Filter Bar Card */}
          <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-stone-100 mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

              {/* Search */}
              <div className="lg:col-span-2">
                <label className="text-[11px] font-extrabold uppercase tracking-widest text-stone-500 mb-2.5 block">
                  Pencarian
                </label>
                <div className="relative group">
                  <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400 group-focus-within:text-[#e61e25] transition-colors pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Nama pelanggan atau kode order..."
                    className="w-full bg-stone-50 border border-stone-200 text-stone-800 text-sm font-bold rounded-2xl pl-14 pr-4 py-4 focus:outline-none focus:border-[#e61e25] focus:ring-4 focus:ring-[#e61e25]/10 transition-all placeholder:text-stone-400"
                  />
                  {search && (
                    <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-stone-200 text-stone-500 rounded-full hover:bg-stone-300 transition-colors">
                      <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Date From */}
              <div>
                <label className="text-[11px] font-extrabold uppercase tracking-widest text-stone-500 mb-2.5 block">
                  Dari Tanggal
                </label>
                <input
                  type="date"
                  value={tanggalDari}
                  onChange={(e) => setTanggalDari(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 text-stone-800 text-sm font-bold rounded-2xl px-5 py-4 focus:outline-none focus:border-[#e61e25] focus:ring-4 focus:ring-[#e61e25]/10 transition-all cursor-pointer"
                />
              </div>

              {/* Date To */}
              <div>
                <label className="text-[11px] font-extrabold uppercase tracking-widest text-stone-500 mb-2.5 block">
                  Sampai Tanggal
                </label>
                <input
                  type="date"
                  value={tanggalSampai}
                  onChange={(e) => setTanggalSampai(e.target.value)}
                  min={tanggalDari || undefined}
                  className="w-full bg-stone-50 border border-stone-200 text-stone-800 text-sm font-bold rounded-2xl px-5 py-4 focus:outline-none focus:border-[#e61e25] focus:ring-4 focus:ring-[#e61e25]/10 transition-all cursor-pointer"
                />
              </div>
            </div>

            {/* Clear filters */}
            {hasActiveFilters && (
              <div className="flex justify-end mt-6 pt-6 border-t border-stone-100">
                <button
                  onClick={handleClearFilters}
                  className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-widest text-[#e61e25] hover:text-red-700 bg-red-50 hover:bg-red-100 px-5 py-2.5 rounded-xl transition-colors border border-red-100"
                >
                  <span className="material-symbols-outlined text-[16px]">filter_alt_off</span>
                  Reset Filter
                </button>
              </div>
            )}
          </div>

          {/* Table Card */}
          <div className="bg-white rounded-[2rem] shadow-sm border border-stone-100 p-8 flex flex-col gap-2">
            
            {/* Header */}
            <div className="hidden lg:grid grid-cols-12 gap-6 pb-4 border-b border-stone-100 px-6">
              <div className="col-span-2 text-[10px] font-extrabold text-stone-400 uppercase tracking-widest">No. Order</div>
              <div className="col-span-3 text-[10px] font-extrabold text-stone-400 uppercase tracking-widest">Pelanggan</div>
              <div className="col-span-2 text-[10px] font-extrabold text-stone-400 uppercase tracking-widest">Tanggal</div>
              <div className="col-span-2 text-[10px] font-extrabold text-stone-400 uppercase tracking-widest text-right">Tagihan</div>
              <div className="col-span-3 text-[10px] font-extrabold text-stone-400 uppercase tracking-widest text-right">Aksi</div>
            </div>

            {/* Loading */}
            {loading ? (
              <div className="flex flex-col gap-4 mt-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-6 px-6 py-2">
                    <Sk className="h-6 w-24 rounded-lg flex-shrink-0" />
                    <div className="flex flex-col gap-2 flex-1">
                      <Sk className="h-4 w-40 rounded-full" />
                      <Sk className="h-3 w-24 rounded-full" />
                    </div>
                    <Sk className="h-4 w-32 rounded-full hidden lg:block" />
                    <Sk className="h-4 w-24 rounded-full hidden lg:block" />
                    <Sk className="h-8 w-20 rounded-xl hidden lg:block" />
                    <Sk className="h-10 w-24 rounded-xl flex-shrink-0" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="py-20 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-[32px]">error</span>
                </div>
                <h3 className="text-lg font-bold text-stone-900 mb-1">Gagal memuat data</h3>
                <p className="text-sm text-stone-500 mb-4">{error}</p>
                <button onClick={() => window.location.reload()} className="text-[11px] font-extrabold uppercase tracking-widest text-[#e61e25] underline underline-offset-4">
                  Coba Muat Ulang
                </button>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="py-20 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-stone-50 text-stone-300 rounded-full flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-[40px]">receipt_long</span>
                </div>
                <h3 className="text-lg font-black text-stone-900 mb-2">Tidak Ada Transaksi</h3>
                <p className="text-sm text-stone-500 font-medium">
                  {orders.length === 0 ? "Sistem belum mencatat transaksi apa pun." : "Tidak ada transaksi yang cocok dengan filter yang Anda pasang."}
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2 mt-2">
                {filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-center hover:bg-stone-50 transition-colors p-5 lg:px-6 rounded-2xl group border border-transparent hover:border-stone-100 cursor-pointer"
                  >
                    {/* Order Code */}
                    <div className="col-span-1 lg:col-span-2">
                      <span className="inline-block px-3 py-1.5 bg-stone-100 text-stone-800 border border-stone-200 font-mono text-[11px] font-bold tracking-wider rounded-lg">
                        {order.order_code}
                      </span>
                    </div>

                    {/* Customer */}
                    <div className="col-span-1 lg:col-span-3">
                      <p className="font-extrabold text-[15px] text-stone-900 group-hover:text-[#e61e25] transition-colors leading-tight mb-1">
                        {order.customer_name}
                      </p>
                      <p className="text-xs font-semibold text-stone-400">
                        {formatProductSummary(order.items)}
                      </p>
                    </div>

                    {/* Date */}
                    <div className="col-span-1 lg:col-span-2 hidden lg:block text-xs font-bold text-stone-500">
                      {formatDate(order.created_at)}
                    </div>

                    {/* Total */}
                    <div className="col-span-1 lg:col-span-2 hidden lg:block text-right font-black text-[15px] text-stone-900">
                      {formatIDR(order.total_amount)}
                    </div>

                    {/* Actions */}
                    <div className="col-span-1 lg:col-span-3 flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleDownload(order, "invoice")}
                        disabled={downloadingId === `${order.id}-invoice`}
                        title="Unduh Invoice"
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-stone-50 text-stone-500 hover:text-white hover:bg-stone-900 transition-colors border border-stone-200 hover:border-stone-900 disabled:opacity-50"
                      >
                        {downloadingId === `${order.id}-invoice` ? (
                          <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                        ) : (
                          <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                        )}
                      </button>
                      <button
                        onClick={() => handleDownload(order, "packing-list")}
                        disabled={downloadingId === `${order.id}-packing-list`}
                        title="Unduh Packing List"
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-stone-50 text-stone-500 hover:text-white hover:bg-stone-900 transition-colors border border-stone-200 hover:border-stone-900 disabled:opacity-50"
                      >
                        {downloadingId === `${order.id}-packing-list` ? (
                          <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                        ) : (
                          <span className="material-symbols-outlined text-[18px]">inventory_2</span>
                        )}
                      </button>
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-stone-50 text-stone-500 hover:text-white hover:bg-stone-900 transition-colors border border-stone-200 hover:border-stone-900"
                        title="Lihat Detail"
                      >
                        <span className="material-symbols-outlined text-[18px]">visibility</span>
                      </button>
                      <button
                        onClick={() => navigate(`/admin/riwayat-transaksi/${order.id}/edit`)}
                        title="Edit Pesanan"
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-blue-50 text-blue-600 hover:text-white hover:bg-blue-600 transition-colors border border-blue-100 hover:border-blue-600"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(order)}
                        title="Hapus Pesanan"
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-50 text-[#e61e25] hover:text-white hover:bg-[#e61e25] transition-colors border border-red-100 hover:border-[#e61e25]"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Footer Summary */}
            {!loading && filteredOrders.length > 0 && (
              <div className="mt-6 pt-6 border-t border-stone-100 text-center">
                <span className="text-[11px] font-bold uppercase tracking-widest text-stone-400">
                  Menampilkan {filteredOrders.length} dari {orders.length} transaksi
                </span>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedOrder && (
        <DetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
    </>
  );
} 