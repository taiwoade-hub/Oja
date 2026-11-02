import { BarChart3, BellRing, Boxes, ChevronRight, CircleDollarSign, ExternalLink, FolderTree, LayoutDashboard, LayoutTemplate, LoaderCircle, LogOut, Menu, Package, Settings, ShoppingBag, Users, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink, Navigate, useParams } from "react-router";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/hooks/useAuth";
import { AdminOverview } from "./AdminOverview";
import { AdminProducts, AdminCategories, AdminInventory, AdminHomepage } from "./AdminCatalog";
import { AdminOrders } from "./AdminOrders";
import { AdminCustomers, AdminPromotions, AdminSettings, AdminBroadcast } from "./AdminOperations";

const nav = [
  { slug: "overview", label: "Overview", icon: LayoutDashboard },
  { slug: "products", label: "Products", icon: Package },
  { slug: "categories", label: "Categories", icon: FolderTree },
  { slug: "orders", label: "Orders & payments", icon: ShoppingBag },
  { slug: "customers", label: "Customers", icon: Users },
  { slug: "inventory", label: "Inventory", icon: Boxes },
  { slug: "homepage", label: "Homepage builder", icon: LayoutTemplate },
  { slug: "promotions", label: "Promotions", icon: CircleDollarSign },
  { slug: "notifications", label: "Notifications", icon: BellRing },
  { slug: "settings", label: "Store settings", icon: Settings },
];

function AdminContent({ section }: { section: string }) {
  switch (section) {
    case "overview": return <AdminOverview />;
    case "products": return <AdminProducts />;
    case "categories": return <AdminCategories />;
    case "orders": return <AdminOrders />;
    case "customers": return <AdminCustomers />;
    case "inventory": return <AdminInventory />;
    case "homepage": return <AdminHomepage />;
    case "promotions": return <AdminPromotions />;
    case "notifications": return <AdminBroadcast />;
    case "settings": return <AdminSettings />;
    default: return <Navigate to="/admin/overview" replace />;
  }
}

export default function AdminPage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { section = "overview" } = useParams();
  const [menuOpen, setMenuOpen] = useState(false);
  const current = nav.find((item) => item.slug === section) ?? nav[0];
  if (isLoading) return <div className="admin-loading"><Logo /><LoaderCircle className="spin" size={24} /><p>Opening your workspace…</p></div>;
  if (!isAuthenticated) return <div className="admin-loading"><Logo /><h1>Store operations, secured.</h1><p>Sign in with an administrator account to manage Oja.</p><Link to="/login" className="btn-primary">Sign in to continue <ChevronRight size={16} /></Link><Link to="/" className="text-link">Return to storefront</Link></div>;
  if (user?.role !== "admin") return <div className="admin-loading"><Logo /><h1>Administrator access required.</h1><p>Your customer account does not have permission to open store operations.</p><Link to="/account" className="btn-primary">Back to my account</Link></div>;

  return <div className="admin-shell">
    <aside className={menuOpen ? "admin-sidebar open" : "admin-sidebar"}>
      <div className="admin-sidebar__top"><Logo /><button className="icon-btn admin-menu-close" onClick={() => setMenuOpen(false)} aria-label="Close menu"><X size={19} /></button><span>STORE OPERATIONS</span></div>
      <nav aria-label="Admin navigation">{nav.map(({ slug, label, icon: Icon }) => <NavLink key={slug} to={`/admin/${slug}`} onClick={() => setMenuOpen(false)} className={({ isActive }) => isActive ? "active" : ""}><Icon size={17} strokeWidth={1.8} /><span>{label}</span><ChevronRight className="nav-chevron" size={14} /></NavLink>)}</nav>
      <div className="admin-sidebar__bottom"><Link to="/" target="_blank"><ExternalLink size={16} /> View storefront</Link><button onClick={logout}><LogOut size={16} /> Sign out</button><div className="admin-user"><span>{user.name?.slice(0, 1) || "A"}</span><div><strong>{user.name}</strong><small>Administrator</small></div></div></div>
    </aside>
    {menuOpen && <button className="admin-scrim" onClick={() => setMenuOpen(false)} aria-label="Close navigation" />}
    <main className="admin-main">
      <header className="admin-topbar"><button className="icon-btn admin-menu-button" onClick={() => setMenuOpen(true)} aria-label="Open menu"><Menu size={20} /></button><div><span className="mono-label">OJA / {current.slug.toUpperCase()}</span><h1>{current.label}</h1></div><div className="admin-topbar__meta"><span className="live-dot" /> Store online<small>{new Date().toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}</small></div></header>
      <div className="admin-content"><AdminContent section={section} /></div>
      <footer className="admin-footer"><span><BarChart3 size={14} /> Live store data</span><span>Oja operations · 2026</span></footer>
    </main>
  </div>;
}
