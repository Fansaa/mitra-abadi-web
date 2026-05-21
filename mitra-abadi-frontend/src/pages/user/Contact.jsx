import { useState } from "react";
import ChatWindow from "../../components/ChatWindow";
import NavUser from "../../components/NavUser";
import logo from "../../assets/logo.png";

export default function Contact() {
  const [fabState, setFabState] = useState("closed"); // "closed" | "popup" | "chat"

  const handleFabClick = () => {
    if (fabState === "closed") setFabState("popup");
    else if (fabState === "popup") setFabState("closed");
    else if (fabState === "chat") setFabState("closed");
  };

  // Data Dummy untuk WhatsApp CTA
  const waNumber = import.meta.env.VITE_WHATSAPP_ADMIN_NUMBER;
  const waMessage = encodeURIComponent("Halo Pak Andy, saya ingin bertanya mengenai produk kain dari Mitra Abadi.");
  const waLink = `https://wa.me/${waNumber}?text=${waMessage}`;

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans selection:bg-[#e61e25] selection:text-white" style={{ fontFamily: "Manrope, sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

      {/* ── NAV ── */}
      <NavUser activePage="/contact" />

      {/* ── MAIN ── */}
      <main className="pt-28 md:pt-32 pb-20 px-4 md:px-8 max-w-[1400px] mx-auto min-h-screen">

        {/* ── HEADER (Pink-Cream Theme) ── */}
        <header className="mb-12 bg-gradient-to-br from-[#FFF5F2] to-[#FFF0EC] px-8 py-12 md:px-12 md:py-16 rounded-[3rem] border border-[#FCE5E1] shadow-sm relative overflow-hidden">
          {/* Decorative Blobs */}
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-[#FFE4DF] rounded-full blur-3xl opacity-60 pointer-events-none"></div>
          <div className="absolute bottom-0 left-10 -mb-20 w-64 h-64 bg-[#FFE8E4] rounded-full blur-3xl opacity-50 pointer-events-none"></div>

          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-md text-[#e61e25] mb-6 border border-[#FCE5E1] shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#e61e25] animate-pulse"></span>
              <span className="text-[11px] uppercase tracking-[0.2em] font-extrabold text-[#e61e25]">
                Layanan Pelanggan
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-stone-900 leading-tight tracking-tight mb-6">
              Hubungi <span className="text-[#e61e25]">Mitra Abadi</span>
            </h1>
            <p className="text-stone-600 text-base md:text-lg leading-relaxed font-medium max-w-xl">
              Kami siap membantu Anda memenuhi kebutuhan tekstil terbaik. Hubungi tim kami untuk konsultasi bahan, penawaran harga, atau informasi pemesanan.
            </p>
          </div>
        </header>

        {/* ── CONTENT GRIDS ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* ── KARTU KONTAK UTAMA (Andy Budiman) ── */}
          <div className="lg:col-span-7">
            <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-stone-100 h-full flex flex-col justify-center">
              <h2 className="text-[11px] uppercase tracking-[0.2em] font-extrabold text-stone-400 mb-8 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">support_agent</span>
                Konsultan Penjualan
              </h2>
              
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
                {/* Avatar Placeholder */}
                <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-[#FFF0EC] to-[#FFE4DF] border-4 border-white shadow-lg flex items-center justify-center shrink-0">
                   <span className="material-symbols-outlined text-6xl text-[#e61e25]">person</span>
                </div>
                
                {/* Info Andy Budiman */}
                <div className="text-center sm:text-left flex-1">
                  <h3 className="text-3xl font-black text-stone-900 mb-2">Andy Budiman</h3>
                  <p className="text-sm font-extrabold uppercase tracking-widest text-[#e61e25] mb-6">
                    Senior Sales Representative
                  </p>
                  <p className="text-stone-500 font-medium leading-relaxed mb-8">
                    "Halo! Saya Andy. Silakan hubungi saya secara langsung untuk mendiskusikan kebutuhan kain roll untuk proyek atau bisnis Anda. Saya akan memastikan Anda mendapatkan kualitas dan penawaran terbaik."
                  </p>
                  
                  {/* WhatsApp CTA */}
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-3 w-full sm:w-auto bg-[#25D366] text-white py-4 px-8 rounded-2xl font-extrabold text-[12px] uppercase tracking-widest hover:bg-[#1EBE53] transition-all shadow-[0_8px_30px_rgb(37,211,102,0.2)] hover:shadow-[0_8px_30px_rgb(37,211,102,0.4)] hover:-translate-y-1"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.556 4.121 1.523 5.855L.057 23.943l6.244-1.635A11.938 11.938 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.787 9.787 0 01-5.001-1.374l-.359-.213-3.709.972.989-3.614-.233-.371A9.785 9.785 0 012.182 12c0-5.418 4.4-9.818 9.818-9.818S21.818 6.582 21.818 12 17.418 21.818 12 21.818z" />
                    </svg>
                    Chat WA Sekarang
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* ── KARTU INFO LAINNYA ── */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            
            {/* Kartu Lokasi */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-stone-100 flex items-start gap-6 group hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded-2xl bg-red-50 text-[#e61e25] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[28px]">location_on</span>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-widest font-extrabold text-stone-400 mb-2">Lokasi Toko</p>
                <h3 className="text-lg font-black text-stone-900 mb-2">Taman Kopo Indah 2</h3>
                <p className="text-sm text-stone-600 font-medium leading-relaxed">
                  Blok D4 No. 46 <br />
                  Bandung, Jawa Barat, Indonesia
                </p>
              </div>
            </div>

            {/* Kartu Jam Operasional */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-stone-100 flex items-start gap-6 group hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded-2xl bg-stone-50 text-stone-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[28px]">schedule</span>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-widest font-extrabold text-stone-400 mb-2">Jam Operasional</p>
                <h3 className="text-lg font-black text-stone-900 mb-2">Senin – Sabtu</h3>
                <p className="text-sm text-stone-600 font-medium leading-relaxed">
                  08:00 – 17:00 WIB <br />
                  <span className="text-stone-400 text-xs mt-1 block">(Minggu & Hari Libur Nasional Tutup)</span>
                </p>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* ── FOOTER ── */}
      <footer className="w-full bg-white border-t border-stone-200 pt-16 pb-8">
        <div className="px-8 max-w-screen-2xl mx-auto flex justify-center">
          <div className="flex items-center gap-3">
             <img src={logo} alt="Mitra Abadi" className="h-8 w-auto grayscale opacity-60" />
             <span className="text-sm font-semibold text-stone-400">© 2026 Mitra Abadi.</span>
          </div>
        </div>
      </footer>

      {/* ── FAB POPUP ── */}
      {fabState === "popup" && (
        <div className="fixed bottom-28 right-4 md:right-8 z-50 w-[calc(100vw-2rem)] max-w-[320px] bg-white/90 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-300">
          <div className="px-6 py-5 border-b border-stone-100 bg-gradient-to-b from-stone-50/50 to-transparent">
            <p className="text-[11px] uppercase tracking-[0.2em] text-stone-500 font-extrabold">Pusat Bantuan</p>
            <p className="text-sm font-medium text-stone-600 mt-1">Pilih metode komunikasi:</p>
          </div>
          <div className="p-3 space-y-2">
            <a href={waLink} target="_blank" rel="noopener noreferrer"
              className="w-full flex items-center gap-4 p-3 hover:bg-stone-50 rounded-2xl transition-all group">
              <div className="w-12 h-12 rounded-full bg-[#25D366]/10 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <svg className="w-6 h-6 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              </div>
              <div>
                <p className="text-[15px] font-extrabold text-stone-900">Hubungi Admin</p>
                <p className="text-[12px] text-stone-500 font-medium">Layanan pelanggan via WhatsApp</p>
              </div>
            </a>
            <button onClick={() => setFabState("chat")}
              className="w-full flex items-center gap-4 p-3 hover:bg-stone-50 rounded-2xl transition-all group text-left">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <svg className="w-6 h-6 text-[#e61e25]" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10h-2V8h2m0 8h-2v-6h2m-1-9A10 10 0 002 12a10 10 0 0010 10 10 10 0 0010-10A10 10 0 0012 2z"/></svg>
              </div>
              <div>
                <p className="text-[15px] font-extrabold text-stone-900">Chat AI Assistant</p>
                <p className="text-[12px] text-stone-500 font-medium">Bantuan instan respons 24/7</p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* ── AI CHAT WINDOW ── */}
      {fabState === "chat" && <ChatWindow onClose={() => setFabState("closed")} />}

      {/* ── FAB BUTTON ── */}
      <button onClick={handleFabClick}
        className="fixed bottom-8 right-8 w-16 h-16 bg-[#e61e25] text-white rounded-full shadow-[0_8px_30px_rgb(230,30,37,0.3)] flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-40 group border-2 border-white">
        {fabState === "closed" || fabState === "popup" ? (
          <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
        ) : (
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/></svg>
        )}
        <span className="absolute right-full mr-5 bg-stone-900 text-white px-4 py-2 rounded-xl text-[11px] uppercase tracking-widest font-extrabold shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Hubungi Kami
        </span>
      </button>

    </div>
  );
}