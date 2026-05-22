import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api";
import Sk from "../../components/Skeleton";
import * as XLSX from "xlsx";
import Swal from "sweetalert2";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";

// --- Helpers ---

function getLastNDays(n) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (n - 1 - i));
    return d.toISOString().slice(0, 10);
  });
}

function formatAxisLabel(iso) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-stone-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-stone-700 text-sm">
      <p className="font-extrabold text-stone-300 text-[10px] uppercase tracking-widest mb-1">{label}</p>
      <p className="font-black text-lg">{payload[0].value} <span className="text-stone-400 font-semibold text-xs">pesanan</span></p>
    </div>
  );
}

const BULAN = [
  "Januari","Februari","Maret","April","Mei","Juni",
  "Juli","Agustus","September","Oktober","November","Desember"
];

function SelectField({ value, onChange, options, className = "" }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between bg-stone-50 border border-stone-200 text-stone-800 text-sm font-bold rounded-2xl px-4 py-4 focus:outline-none hover:border-stone-300 transition-all cursor-pointer shadow-sm"
      >
        <span>{selectedOption ? selectedOption.label : "Pilih..."}</span>
        <div className={`text-stone-400 transition-transform duration-300 ${open ? "rotate-180 text-[#e61e25]" : ""}`}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {open && (
        <div className="absolute left-0 right-0 mt-2 py-2 bg-white border border-stone-100 rounded-2xl shadow-[0_12px_30px_rgba(0,0,0,0.08)] z-50 max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`w-full px-4 py-3 flex items-center justify-between text-left text-sm font-bold transition-colors ${
                  isSelected
                    ? "text-[#e61e25] bg-red-50/50"
                    : "text-stone-700 hover:text-[#e61e25] hover:bg-stone-50/80"
                }`}
              >
                <span className="flex items-center gap-2">
                  {isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#e61e25]"></span>
                  )}
                  {opt.label}
                </span>
                {isSelected && (
                  <svg className="w-4 h-4 text-[#e61e25]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function MonthYearPicker({ label, month, year, onMonthChange, onYearChange }) {
  const monthOptions = BULAN.map((b, i) => ({ value: i + 1, label: b }));

  return (
    <div className="flex flex-col gap-2">
      {label && <span className="text-[11px] font-extrabold uppercase tracking-widest text-stone-500">{label}</span>}
      <div className="flex items-center gap-2">
        <SelectField
          value={month}
          onChange={onMonthChange}
          options={monthOptions}
          className="min-w-[140px]"
        />
        <input
          type="number"
          min="2020"
          max="2099"
          value={year}
          onChange={e => onYearChange(Number(e.target.value))}
          className="bg-stone-50 border border-stone-200 text-stone-800 text-sm font-bold rounded-2xl px-4 py-4 focus:outline-none focus:border-[#e61e25] focus:ring-4 focus:ring-[#e61e25]/10 transition-all w-24 text-center"
        />
      </div>
    </div>
  );
}

// --- Main Component ---

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartDays, setChartDays] = useState(30);

  const now = new Date();
  const [exportMode, setExportMode] = useState("single");
  const [exportFromMonth, setExportFromMonth] = useState(now.getMonth() + 1);
  const [exportFromYear, setExportFromYear] = useState(now.getFullYear());
  const [exportToMonth, setExportToMonth] = useState(now.getMonth() + 1);
  const [exportToYear, setExportToYear] = useState(now.getFullYear());
  const [previewRows, setPreviewRows] = useState([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewFetched, setPreviewFetched] = useState(false);
  const [exporting, setExporting] = useState(false);

  const resetPreview = () => { setPreviewFetched(false); setPreviewRows([]); };

  const exportPeriodLabel = () => {
    if (exportMode === "single") return `${BULAN[exportFromMonth - 1]} ${exportFromYear}`;
    const sameYear = exportFromYear === exportToYear;
    return sameYear
      ? `${BULAN[exportFromMonth - 1]}–${BULAN[exportToMonth - 1]} ${exportFromYear}`
      : `${BULAN[exportFromMonth - 1]} ${exportFromYear}–${BULAN[exportToMonth - 1]} ${exportToYear}`;
  };

  const exportFilename = () => {
    if (exportMode === "single")
      return `penjualan_${BULAN[exportFromMonth - 1].toLowerCase()}_${exportFromYear}.xlsx`;
    const sameYear = exportFromYear === exportToYear;
    return sameYear
      ? `penjualan_${BULAN[exportFromMonth-1].toLowerCase()}-${BULAN[exportToMonth-1].toLowerCase()}_${exportFromYear}.xlsx`
      : `penjualan_${BULAN[exportFromMonth-1].toLowerCase()}${exportFromYear}-${BULAN[exportToMonth-1].toLowerCase()}${exportToYear}.xlsx`;
  };

  const getExportParams = () => {
    const toMonth = exportMode === "single" ? exportFromMonth : exportToMonth;
    const toYear  = exportMode === "single" ? exportFromYear  : exportToYear;
    return { from_month: exportFromMonth, from_year: exportFromYear, to_month: toMonth, to_year: toYear };
  };

  const handleFetchPreview = async () => {
    setPreviewLoading(true);
    setPreviewFetched(false);
    setPreviewRows([]);
    try {
      const res = await api.get("/admin/orders/export", { params: getExportParams() });
      const rows = res.data.data ?? [];
      setPreviewRows(rows);
      setPreviewFetched(true);
      if (rows.length === 0) {
        Swal.fire({
          title: "Tidak Ada Data",
          text: `Tidak ada data penjualan untuk periode ${exportPeriodLabel()}.`,
          icon: "info",
          confirmButtonColor: "#e61e25",
          confirmButtonText: "Oke",
        });
      }
    } catch {
      Swal.fire({ title: "Gagal", text: "Gagal memuat data. Coba lagi.", icon: "error", confirmButtonColor: "#e61e25" });
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleExport = () => {
    if (previewRows.length === 0) {
      Swal.fire({
        title: "Tidak Ada Data",
        text: `Belum ada data untuk diekspor. Klik "Lihat Data" terlebih dahulu.`,
        icon: "info",
        confirmButtonColor: "#e61e25",
        confirmButtonText: "Oke",
      });
      return;
    }
    setExporting(true);
    try {
      const ws = XLSX.utils.json_to_sheet(previewRows);
      const colWidths = Object.keys(previewRows[0]).map(key => ({
        wch: Math.max(key.length, ...previewRows.map(r => String(r[key] ?? "").length)) + 2,
      }));
      ws["!cols"] = colWidths;
      const wb = XLSX.utils.book_new();
      const sheetName = `Penjualan ${exportPeriodLabel()}`.slice(0, 31);
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
      XLSX.writeFile(wb, exportFilename());
    } catch {
      Swal.fire({ title: "Gagal", text: "Gagal membuat file Excel. Coba lagi.", icon: "error", confirmButtonColor: "#e61e25" });
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    api
      .get("/admin/dashboard")
      .then((res) => setStats(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const transactions = stats?.recent_orders ?? [];

  const { chartData, totalInRange } = useMemo(() => {
    const days = getLastNDays(chartDays);
    const counts = Object.fromEntries(days.map((d) => [d, 0]));

    transactions.forEach((order) => {
      const date = (order.created_at ?? "").slice(0, 10);
      if (date in counts) counts[date]++;
    });

    const step = Math.max(1, Math.floor(days.length / 7));
    const chartData = days.map((iso, i) => ({
      label: i % step === 0 || i === days.length - 1 ? formatAxisLabel(iso) : "",
      fullLabel: formatAxisLabel(iso),
      pesanan: counts[iso],
    }));

    const totalInRange = chartData.reduce((s, d) => s + d.pesanan, 0);
    return { chartData, totalInRange };
  }, [transactions, chartDays]);

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans pb-24" style={{ fontFamily: "Manrope, sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* ── Top Navbar ── */}
      <div className="bg-white border-b border-stone-200 px-4 md:px-8 py-5 sticky top-16 z-30 shadow-sm">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[#e61e25] text-white flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-[20px]">dashboard</span>
            </div>
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-stone-400">Panel Admin</p>
              <h1 className="text-xl font-extrabold text-stone-900">Dashboard</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 md:px-8 mt-10 space-y-10">
        
        {/* Page Header */}
        <div className="max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-black text-stone-900 leading-tight mb-3">
            Ringkasan Sistem
          </h2>
          <p className="text-stone-500 font-medium leading-relaxed">
            Pantau performa penjualan, ketersediaan stok inventori, dan status transaksi terkini secara *real-time*.
          </p>
        </div>

        {/* ── Metric Cards ── */}
        <section>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {loading ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white p-8 rounded-[2rem] shadow-sm border border-stone-100 flex flex-col gap-6">
                <div className="flex justify-between items-start">
                  <Sk className="h-4 w-24 rounded-full" />
                  <Sk className="w-12 h-12 rounded-2xl" />
                </div>
                <div className="flex flex-col gap-2 mt-4">
                  <Sk className="h-10 w-24 rounded-lg" />
                  <Sk className="h-3 w-36 rounded-full" />
                </div>
              </div>
            )) : [
              {
                label: "Total Produk",
                icon: "inventory_2",
                value: stats?.total_products ?? "-",
                desc: "Total spesimen di inventori",
                color: "text-stone-900 bg-stone-100",
                iconColor: "text-stone-600"
              },
              {
                label: "Total Pesanan",
                icon: "receipt_long",
                value: stats?.total_orders ?? "-",
                desc: "Seluruh transaksi tercatat",
                color: "text-stone-900 bg-stone-100",
                iconColor: "text-stone-600"
              },
              {
                label: "Estimasi Pendapatan",
                icon: "account_balance_wallet",
                value: stats?.total_revenue ? "Rp " + Number(stats.total_revenue).toLocaleString("id-ID") : "-",
                desc: "Akumulasi nilai transaksi",
                accent: true,
                color: "text-white bg-stone-800",
                iconColor: "text-stone-300"
              },
            ].map((m, idx) => (
              <div
                key={idx}
                className={`p-5 md:p-8 rounded-[2rem] shadow-sm border flex flex-col justify-between group hover:-translate-y-1 hover:shadow-md transition-all duration-300 ${
                  m.accent ? "bg-stone-900 border-stone-800" : m.critical ? "bg-red-50 border-red-100" : "bg-white border-stone-100"
                }`}
              >
                <div className="flex justify-between items-start mb-8">
                  <span className={`text-[10px] font-extrabold tracking-widest uppercase ${m.accent ? "text-stone-400" : m.critical ? "text-red-500" : "text-stone-400"}`}>
                    {m.label}
                  </span>
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${m.critical ? "bg-red-100" : m.color}`}>
                    <span className={`material-symbols-outlined text-[20px] ${m.iconColor}`}>{m.icon}</span>
                  </div>
                </div>
                <div>
                  <p className={`text-4xl font-black tracking-tight ${m.accent ? "text-white" : m.critical ? "text-[#e61e25]" : "text-stone-900"}`}>
                    {m.value}
                  </p>
                  <p className={`text-xs font-semibold mt-2 ${m.accent ? "text-stone-500" : m.critical ? "text-red-400" : "text-stone-400"}`}>
                    {m.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Grafik Pesanan ── */}
        <section>
          <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-sm border border-stone-100">
            {/* Header Grafik */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div>
                <h3 className="text-xl font-black tracking-tight text-stone-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#e61e25]">monitoring</span>
                  Grafik Pesanan
                </h3>
                <p className="text-sm font-semibold text-stone-400 mt-1">
                  Total <strong className="text-stone-700">{totalInRange} pesanan</strong> dalam {chartDays} hari terakhir
                </p>
              </div>
              <div className="flex bg-stone-50 p-1.5 rounded-xl border border-stone-200">
                {[7, 30].map((d) => (
                  <button
                    key={d}
                    onClick={() => setChartDays(d)}
                    className={`px-4 py-2 text-[11px] font-extrabold uppercase tracking-widest rounded-lg transition-all ${
                      chartDays === d
                        ? "bg-white text-stone-900 shadow-sm"
                        : "text-stone-400 hover:text-stone-700"
                    }`}
                  >
                    {d} Hari
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="h-72 mt-6 flex gap-4">
                <div className="flex flex-col justify-between py-2 w-8 shrink-0">
                  <Sk className="h-3 w-8 rounded" />
                  <Sk className="h-3 w-6 rounded" />
                  <Sk className="h-3 w-4 rounded" />
                </div>
                <Sk className="flex-1 rounded-2xl" />
              </div>
            ) : (
              <div className="h-72 mt-6 -mx-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 16, left: -16, bottom: 0 }}>
                    <defs>
                      <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#e61e25" stopOpacity={0.18} />
                        <stop offset="95%" stopColor="#e61e25" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" stroke="#f5f5f4" vertical={false} />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 10, fontWeight: 700, fill: "#a8a29e", fontFamily: "Manrope, sans-serif" }}
                      axisLine={false}
                      tickLine={false}
                      dy={8}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 10, fontWeight: 700, fill: "#a8a29e", fontFamily: "Manrope, sans-serif" }}
                      axisLine={false}
                      tickLine={false}
                      width={28}
                    />
                    <Tooltip
                      content={<ChartTooltip />}
                      cursor={{ stroke: "#e61e25", strokeWidth: 1, strokeDasharray: "4 4" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="pesanan"
                      stroke="#e61e25"
                      strokeWidth={2.5}
                      fill="url(#areaGradient)"
                      dot={false}
                      activeDot={{ r: 5, fill: "#e61e25", stroke: "#fff", strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </section>

        {/* ── Transaksi Terbaru ── */}
        <section>
          <div className="bg-white rounded-[2rem] shadow-sm border border-stone-100 p-4 md:p-8 flex flex-col gap-2">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black tracking-tight text-stone-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-stone-400">history</span>
                Transaksi Terbaru
              </h3>
              <button
                onClick={() => navigate("/admin/riwayat-transaksi")}
                className="text-[10px] font-extrabold uppercase tracking-widest text-[#e61e25] hover:text-red-700 hover:underline underline-offset-4 transition-colors"
              >
                Lihat Semua
              </button>
            </div>

            {loading ? (
              <div className="flex flex-col gap-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-6 px-4 py-2">
                    <Sk className="h-4 w-20 rounded-lg flex-shrink-0" />
                    <div className="flex flex-col gap-2 flex-1">
                      <Sk className="h-4 w-32 rounded-full" />
                      <Sk className="h-3 w-24 rounded-full" />
                    </div>
                    <Sk className="h-4 w-24 rounded-full hidden md:block" />
                    <Sk className="h-6 w-20 rounded-xl hidden md:block" />
                  </div>
                ))}
              </div>
            ) : transactions.length === 0 ? (
              <div className="py-12 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-3xl text-stone-300">receipt_long</span>
                </div>
                <p className="text-sm font-bold text-stone-500">Belum ada transaksi terbaru.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="border-b border-stone-100">
                    <tr>
                      <th className="py-4 font-extrabold text-[10px] uppercase tracking-widest text-stone-400">Pelanggan</th>
                      <th className="py-4 font-extrabold text-[10px] uppercase tracking-widest text-stone-400">Produk</th>
                      <th className="py-4 font-extrabold text-[10px] uppercase tracking-widest text-stone-400 text-center">Qty (Yard)</th>
                      <th className="py-4 font-extrabold text-[10px] uppercase tracking-widest text-stone-400 text-right">Total Tagihan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-50">
                    {transactions.map((t, idx) => (
                      <tr key={t.id ?? idx} className="hover:bg-stone-50/50 transition-colors group">
                        <td className="py-5 font-bold text-stone-900 pr-4">
                          {t.customer_name}
                        </td>
                        <td className="py-5 text-sm font-semibold text-stone-500 pr-4">
                          {t.product_name}
                        </td>
                        <td className="py-5 text-center font-bold text-stone-700">
                          {t.qty_yard != null && Number(t.qty_yard) > 0 ? `${Number(t.qty_yard).toLocaleString("id-ID")} yard` : "-"}
                        </td>
                        <td className="py-5 text-right font-black text-stone-900">
                          {t.total_amount != null ? "Rp " + Number(t.total_amount).toLocaleString("id-ID") : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* ── Ekspor Data Penjualan ── */}
        <section>
          <div className="bg-white rounded-[2rem] shadow-sm border border-stone-100 p-8 md:p-10">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h3 className="text-xl font-black tracking-tight text-stone-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-600">table_chart</span>
                  Ekspor Data Penjualan
                </h3>
                <p className="text-sm font-semibold text-stone-400 mt-1">
                  Unduh rekap transaksi dalam format Excel (.xlsx)
                </p>
              </div>
              {/* Mode Toggle */}
              <div className="flex bg-stone-50 p-1.5 rounded-xl border border-stone-200 self-start sm:self-auto">
                {[{ key: "single", label: "1 Bulan" }, { key: "range", label: "Range Bulan" }].map(m => (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => { setExportMode(m.key); resetPreview(); }}
                    className={`px-4 py-2 text-[11px] font-extrabold uppercase tracking-widest rounded-lg transition-all ${
                      exportMode === m.key ? "bg-white text-stone-900 shadow-sm" : "text-stone-400 hover:text-stone-700"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter Fields */}
            <div className="flex flex-wrap items-end gap-5 pb-8 border-b border-stone-100">
              {exportMode === "single" ? (
                <>
                  <MonthYearPicker label="Bulan" month={exportFromMonth} year={exportFromYear}
                    onMonthChange={v => { setExportFromMonth(v); resetPreview(); }}
                    onYearChange={v => { setExportFromYear(v); resetPreview(); }}
                  />
                </>
              ) : (
                <>
                  <div className="flex flex-wrap items-end gap-3">
                    <span className="text-[11px] font-extrabold uppercase tracking-widest text-stone-400 pb-4">Dari</span>
                    <MonthYearPicker label="" month={exportFromMonth} year={exportFromYear}
                      onMonthChange={v => { setExportFromMonth(v); resetPreview(); }}
                      onYearChange={v => { setExportFromYear(v); resetPreview(); }}
                    />
                  </div>
                  <div className="flex flex-wrap items-end gap-3">
                    <span className="text-[11px] font-extrabold uppercase tracking-widest text-stone-400 pb-4">Sampai</span>
                    <MonthYearPicker label="" month={exportToMonth} year={exportToYear}
                      onMonthChange={v => { setExportToMonth(v); resetPreview(); }}
                      onYearChange={v => { setExportToYear(v); resetPreview(); }}
                    />
                  </div>
                </>
              )}

              <button
                type="button"
                onClick={handleFetchPreview}
                disabled={previewLoading}
                className="inline-flex items-center gap-2 bg-stone-900 hover:bg-stone-700 disabled:bg-stone-300 disabled:cursor-not-allowed text-white font-extrabold text-[12px] uppercase tracking-widest px-6 py-4 rounded-2xl transition-all"
              >
                {previewLoading
                  ? <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                  : <span className="material-symbols-outlined text-[18px]">search</span>}
                {previewLoading ? "Memuat..." : "Lihat Data"}
              </button>
            </div>

            {/* Preview Area */}
            {previewLoading && (
              <div className="mt-8 flex flex-col gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex gap-4 px-2">
                    <Sk className="h-4 w-24 rounded-lg" />
                    <Sk className="h-4 w-32 rounded-lg" />
                    <Sk className="h-4 flex-1 rounded-lg" />
                    <Sk className="h-4 w-20 rounded-lg" />
                  </div>
                ))}
              </div>
            )}

            {previewFetched && !previewLoading && previewRows.length > 0 && (
              <div className="mt-8">
                {/* Summary bar */}
                <div className="flex flex-wrap items-center gap-6 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="material-symbols-outlined text-emerald-600 text-[18px]">check_circle</span>
                    <span className="font-extrabold text-stone-900">{previewRows.length} baris data</span>
                    <span className="text-stone-400 font-medium">— {exportPeriodLabel()}</span>
                  </div>
                  <div className="ml-auto">
                    <span className="text-[11px] font-extrabold uppercase tracking-widest text-stone-400">
                      Total: Rp {previewRows.reduce((s, r) => s + Number(r["Harga Total"] ?? 0), 0).toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>

                {/* Table */}
                <div className="border border-stone-200 rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto max-h-[360px] overflow-y-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-stone-50 border-b border-stone-200 sticky top-0">
                        <tr>
                          {Object.keys(previewRows[0]).map(col => (
                            <th key={col} className="font-extrabold text-[10px] uppercase tracking-widest text-stone-400 px-4 py-3 whitespace-nowrap">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {previewRows.slice(0, 50).map((row, idx) => (
                          <tr key={idx} className="hover:bg-stone-50 transition-colors">
                            {Object.values(row).map((val, ci) => (
                              <td key={ci} className="px-4 py-3 text-stone-700 font-medium whitespace-nowrap">
                                {ci === 9 /* Harga Total */
                                  ? "Rp " + Number(val ?? 0).toLocaleString("id-ID")
                                  : String(val ?? "-")}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {previewRows.length > 50 && (
                    <div className="px-5 py-3 bg-stone-50 border-t border-stone-200 text-[11px] font-bold text-stone-400 uppercase tracking-widest">
                      ... dan {previewRows.length - 50} baris lainnya (semua akan diekspor)
                    </div>
                  )}
                </div>

                {/* Export button */}
                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    onClick={handleExport}
                    disabled={exporting}
                    className="inline-flex items-center gap-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-300 disabled:cursor-not-allowed text-white font-extrabold text-[12px] uppercase tracking-widest px-7 py-4 rounded-2xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                  >
                    {exporting
                      ? <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
                      : <span className="material-symbols-outlined text-[20px]">download</span>}
                    {exporting ? "Mengekspor..." : "Ekspor Excel (.xlsx)"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}