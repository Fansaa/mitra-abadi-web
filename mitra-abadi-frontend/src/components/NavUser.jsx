import { useState } from "react";
import logo from "../assets/logo.png";

const navLinks = [
  { label: "Tentang", href: "/" },
  { label: "Katalog", href: "/catalog" },
  { label: "Kontak", href: "/contact" },
];

export default function NavUser({ activePage = "/" }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl border-b border-stone-200/50 shadow-sm transition-all duration-300">
      <div className="flex justify-between items-center px-4 md:px-8 py-4 max-w-screen-2xl mx-auto">
        {/* Logo + Desktop Links */}
        <div className="flex items-center gap-8 md:gap-12">
          <a href="/" className="hover:opacity-80 transition-opacity">
            <img src={logo} alt="Mitra Abadi" className="h-8 md:h-10 w-auto object-contain" />
          </a>
          <div className="hidden md:flex gap-8 items-center">
            {navLinks.map((item) => {
              const isActive = item.href === activePage;
              return (
                <a
                  key={item.label}
                  href={item.href}
                  className={`text-[15px] font-bold tracking-wide transition-all duration-200 relative ${
                    isActive ? "text-[#e61e25]" : "text-stone-500 hover:text-stone-900"
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute -bottom-5 left-0 w-full h-[3px] bg-[#e61e25] rounded-t-full" />
                  )}
                </a>
              );
            })}
          </div>
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="md:hidden p-2 -mr-1 rounded-lg text-stone-600 hover:text-[#e61e25] hover:bg-stone-50 transition-colors"
          aria-label="Buka menu navigasi"
        >
          {menuOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-stone-100 px-4 py-3 space-y-1">
          {navLinks.map((item) => {
            const isActive = item.href === activePage;
            return (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold tracking-wide transition-colors ${
                  isActive
                    ? "text-[#e61e25] bg-red-50"
                    : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
                }`}
              >
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#e61e25] flex-shrink-0" />}
                {item.label}
              </a>
            );
          })}
        </div>
      )}
    </nav>
  );
}
