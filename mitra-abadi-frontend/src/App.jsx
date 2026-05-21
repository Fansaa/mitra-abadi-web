import "./App.css";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import AdminLayout from "./components/layout/AdminLayout";
import ProtectedRoute from "./components/ProtectedRoute";

import Catalog from "./pages/user/Catalog";
import CatalogDetail from "./pages/user/CatalogDetail";
import About from "./pages/user/About";
import Contact from "./pages/user/Contact";

import LoginAdmin from "./pages/admin/LoginAdmin";
import Dashboard from "./pages/admin/Dashboard";
import DetailKategori from "./pages/admin/DetailKategori";
import DetailSpesimen from "./pages/admin/DetailSpesimen";
import EditSpesimen from "./pages/admin/EditSpesimen";
import Inventory from "./pages/admin/Inventory";
import ManajemenKategori from "./pages/admin/ManajemenKategori";
import ManualOrderEntry from "./pages/admin/ManualOrderEntry";
import SpecimenEntry from "./pages/admin/SpesimenEntry";
import RiwayatTransaksi from "./pages/admin/RiwayatTransaksi";
import EditOrder from "./pages/admin/EditOrder";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<About />} />
        <Route path="/about" element={<About />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/catalog/:id" element={<CatalogDetail />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/admin/login" element={<LoginAdmin />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="inventory/:id" element={<DetailSpesimen />} />
            <Route path="inventory/:id/edit" element={<EditSpesimen />} />
            <Route path="manajemen-kategori" element={<ManajemenKategori />} />
            <Route path="manajemen-kategori/:id" element={<DetailKategori />} />
            <Route path="manual-order-entry" element={<ManualOrderEntry />} />
            <Route path="specimen-entry" element={<SpecimenEntry />} />
            <Route path="riwayat-transaksi" element={<RiwayatTransaksi />} />
            <Route path="riwayat-transaksi/:id/edit" element={<EditOrder />} />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  );
}
