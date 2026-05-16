import { useEffect, useState } from "react";
import ChatWindow from "../../components/ChatWindow";
import logo from "../../assets/logo.png";

const FABRIC_URL =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDM-M0H7Jio-GyDm_uA65YUsF-ClGVquKbzPPaMTOoMKlqKo_Wl4tdlxnL2xBEATHCola-KLT3dLHDp_oIOTtOU8SXGwmNJJ_6uuh1768s7dg7LntZC8YtJZyPwfVurVscF5zBJUE6PDD971KtPw8gRLZ4ukkocoASVek8u0M8PL3zPNiJstFX1S7nSERvETgKYJO4G1wfLX4fUJEa9J6UzmapxsRbQzsJ9IWWbA1Fi9znol9Ydvpa3ZFagPsLz12D_ZJVbch1-xqcP";

export default function About() {
  const [mounted, setMounted] = useState(false);
  const [fabState, setFabState] = useState("closed"); // "closed" | "popup" | "chat"

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleFabClick = () => {
    if (fabState === "closed") setFabState("popup");
    else if (fabState === "popup") setFabState("closed");
    else if (fabState === "chat") setFabState("closed");
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans selection:bg-[#e61e25] selection:text-white" style={{ fontFamily: "Manrope, sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

      {/* NAV */}
      <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl border-b border-stone-200/50 shadow-sm transition-all duration-300">
        <div className="flex justify-between items-center px-8 py-4 max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-12">
            <a href="/" className="hover:opacity-80 transition-opacity">
              <img src={logo} alt="Mitra Abadi" className="h-10 w-auto object-contain" />
            </a>
            <div className="hidden md:flex gap-8 items-center">
              {[
                { label: "Tentang", href: "/", active: true },
                { label: "Katalog", href: "/catalog" },
                { label: "Kontak", href: "/" },
              ].map((item) => (
                <a key={item.label} href={item.href} className={`text-[15px] font-bold tracking-wide transition-all duration-200 relative ${item.active ? "text-[#e61e25]" : "text-stone-500 hover:text-stone-900"}`}>
                  {item.label}
                  {item.active && (
                    <span className="absolute -bottom-5 left-0 w-full h-[3px] bg-[#e61e25] rounded-t-full"></span>
                  )}
                </a>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* MAIN */}
      <main className="pt-32 pb-20 px-8 max-w-[1280px] mx-auto min-h-screen overflow-hidden">
        
        {/* HERO SECTION */}
        <section className="flex flex-col-reverse md:flex-row items-center gap-16 md:gap-24 py-12 md:py-20">
          <div 
            className={`flex-1 transition-all duration-1000 ease-out delay-200 ${mounted ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-12"}`}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 text-[#e61e25] mb-6">
              <span className="w-2 h-2 rounded-full bg-[#e61e25] animate-pulse"></span>
              <span className="text-[11px] uppercase tracking-[0.2em] font-extrabold">Tentang Kami</span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-stone-900 leading-tight tracking-tight mb-6">
              Distributor Kain <br />
              <span className="text-[#e61e25]">Terpercaya</span>
            </h1>
            <p className="text-base md:text-lg text-stone-500 leading-relaxed font-medium max-w-lg">
              Selamat datang di Mitra Abadi, toko kain terpercaya yang telah berdiri sejak tahun 2018. Kami menyediakan berbagai pilihan kain berkualitas untuk kebutuhan fashion, seragam, dekorasi, hingga kebutuhan tekstil lainnya dengan harga yang kompetitif dan pelayanan yang ramah.
            </p>
          </div>
          
          <div 
            className={`flex-1 flex justify-center md:justify-end transition-all duration-1000 ease-out ${mounted ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12"}`}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-red-50 rounded-full blur-3xl opacity-50 scale-110"></div>
              <img src={logo} alt="Mitra Abadi" className="w-[280px] md:w-[360px] h-auto object-contain relative z-10 drop-shadow-xl" />
            </div>
          </div>
        </section>

        {/* STORY SECTION */}
        <section 
          className={`mb-24 bg-white rounded-[3rem] p-8 md:p-16 border border-stone-100 shadow-sm relative overflow-hidden transition-all duration-1000 ease-out delay-300 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}
        >
          {/* Accent Line */}
          <div className="absolute top-0 left-0 w-2 h-full bg-[#e61e25]"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
            {/* Image */}
            <div className="relative rounded-3xl overflow-hidden shadow-lg border border-stone-100 group">
              <div className="absolute inset-0 bg-stone-900/10 group-hover:bg-transparent transition-colors z-10"></div>
              <img
                src={FABRIC_URL}
                alt="Premium textiles"
                className="w-full h-[400px] object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>

            {/* Text & Actions */}
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] font-extrabold text-stone-400 mb-4">Kualitas & Komitmen</p>
              <h2 className="text-3xl md:text-4xl font-extrabold text-stone-900 leading-tight tracking-tight mb-6">
                Dedikasi Pada <br /> Kualitas
              </h2>
              <p className="text-stone-500 font-medium leading-relaxed mb-10">
                Dengan pengalaman dan komitmen yang kami bangun sejak awal berdiri, kami terus berupaya menjadi mitra terbaik untuk setiap kebutuhan kain Anda. Mitra Abadi hadir untuk memenuhi kebutuhan pelanggan dengan mengutamakan kualitas produk dan kepuasan layanan.
              </p>
              
              <div className="flex flex-wrap items-center gap-6">
                <a
                  href="/catalog"
                  className="px-8 py-3.5 bg-stone-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#e61e25] transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
                >
                  Lihat Katalog
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* CONTACT SECTION */}
        <section 
          className={`mb-12 max-w-4xl mx-auto text-center transition-all duration-1000 ease-out delay-500 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-100 text-stone-500 mb-6">
             <span className="text-[11px] uppercase tracking-[0.2em] font-extrabold">Lokasi & Kontak</span>
          </div>
          <h3 className="text-3xl md:text-4xl font-extrabold text-stone-900 leading-tight tracking-tight mb-12">
            Kunjungi Kami
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            {/* Address Card */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-100 hover:shadow-md transition-shadow group">
              <div className="flex items-start gap-5">
                <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#e61e25] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[28px]">location_on</span>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] font-extrabold text-stone-400 mb-2">Alamat Utama</p>
                  <p className="text-sm text-stone-600 font-medium leading-relaxed">
                    Taman Kopo Indah 2 Blok D4 No. 46 <br />
                    Bandung, Jawa Barat
                  </p>
                </div>
              </div>
            </div>

            {/* Phone Card */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-100 hover:shadow-md transition-shadow group flex flex-col justify-between">
              <div className="flex items-start gap-5 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#e61e25] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[28px]">forum</span>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] font-extrabold text-stone-400 mb-2">Telepon / WhatsApp</p>
                  <p className="text-lg text-stone-900 font-extrabold tracking-wide">
                    0812-1425-7670
                  </p>
                </div>
              </div>
              <a
                href="https://wa.me/6281214257670"
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 bg-[#e61e25] text-white rounded-xl text-[11px] font-bold uppercase tracking-widest text-center hover:bg-[#bd0015] transition-colors shadow-sm"
              >
                Hubungi Sekarang
              </a>
            </div>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="w-full bg-white border-t border-stone-200 pt-16 pb-8">
        <div className="px-8 max-w-screen-2xl mx-auto flex justify-center">
          <div className="flex items-center gap-3">
             <img src={logo} alt="Mitra Abadi" className="h-8 w-auto grayscale opacity-60" />
             <span className="text-sm font-semibold text-stone-400">© 2026 Mitra Abadi.</span>
          </div>
        </div>
      </footer>

      {/* FAB POPUP */}
      {fabState === "popup" && (
        <div className="fixed bottom-28 right-8 z-50 w-[320px] bg-white/90 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-300">
          <div className="px-6 py-5 border-b border-stone-100 bg-gradient-to-b from-stone-50/50 to-transparent">
            <p className="text-[11px] uppercase tracking-[0.2em] text-stone-500 font-extrabold">Pusat Bantuan</p>
            <p className="text-sm font-medium text-stone-600 mt-1">Pilih metode komunikasi:</p>
          </div>
          <div className="p-3 space-y-2">
            <a href="https://wa.me/628123456789" target="_blank" rel="noopener noreferrer"
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

      {/* AI CHAT WINDOW */}
      {fabState === "chat" && <ChatWindow onClose={() => setFabState("closed")} />}

      {/* FAB BUTTON */}
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