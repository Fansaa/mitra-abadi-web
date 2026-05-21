import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function NavAdmin({ title = "Sistem Manajemen Distribusi Tekstil", onMenuClick }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    navigate("/admin/login");
  };

  return (
    <header className="fixed top-0 left-0 right-0 md:left-64 z-50 flex justify-between items-center px-4 md:px-8 h-16 bg-surface-container-low transition-colors duration-300">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Mobile hamburger */}
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 -ml-1 rounded-lg text-on-surface hover:text-primary hover:bg-surface-container-highest transition-colors flex-shrink-0"
          aria-label="Buka menu"
        >
          <span className="material-symbols-outlined text-2xl">menu</span>
        </button>

        <h1 className="text-sm md:text-base font-bold tracking-tight text-on-surface truncate">
          {title}
        </h1>
      </div>

      {/* Profile Dropdown */}
      <div className="relative flex-shrink-0" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen((v) => !v)}
          className="flex items-center gap-2 text-on-surface/70 hover:text-primary transition-colors duration-200 active:opacity-80 focus:outline-none"
          aria-label="Profil pengguna"
        >
          <span className="material-symbols-outlined fill text-3xl">account_circle</span>
          <span className="hidden md:block text-sm font-semibold text-on-surface">
            {user?.name || "Admin"}
          </span>
          <span className="material-symbols-outlined text-sm text-on-surface-variant">
            {dropdownOpen ? "expand_less" : "expand_more"}
          </span>
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 top-full mt-2 w-52 bg-surface-container-lowest rounded-xl shadow-lg border border-surface-container-highest py-2 z-50">
            <div className="px-4 py-3 border-b border-surface-container-highest">
              <p className="text-xs font-bold text-on-surface truncate">{user?.name || "Administrator"}</p>
              <p className="text-[10px] text-on-surface-variant truncate mt-0.5">{user?.email || ""}</p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-error hover:bg-error-container/30 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              Keluar
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
