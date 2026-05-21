import { useState } from "react";
import { Outlet } from "react-router-dom";
import SidebarAdmin from "../SideBarAdmin";
import NavAdmin from "../NavAdmin";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="bg-surface text-on-surface antialiased min-h-screen">
      <SidebarAdmin isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <NavAdmin onMenuClick={() => setSidebarOpen((v) => !v)} />
      <main className="md:ml-64 pt-16 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}
