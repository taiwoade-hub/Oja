import { BarChart3, BellRing, Boxes, ChevronRight, CircleDollarSign, ExternalLink, FolderTree, LayoutDashboard, LayoutTemplate, LoaderCircle, LogOut, Menu, Package, RefreshCw, Settings, ShoppingBag, Sparkles, Users, X } from "lucide-react";
import { Component, useState, type ErrorInfo, type ReactNode } from "react";
import { Link, NavLink, Navigate, useNavigate, useParams } from "react-router";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { AdminOverview } from "./AdminOverview";
import { AdminProducts, AdminCategories, AdminInventory, AdminHomepage } from "./AdminCatalog";
import { AdminOrders } from "./AdminOrders";
import { AdminCustomers, AdminPromotions, AdminSettings, AdminBroadcast } from "./AdminOperations";

class AdminErrorBoundary extends Component<
  { children: ReactNode; section?: string },
  { hasError: boolean; error: Error | null }
> {
  state: { hasError: boolean; error: Error | null } = { hasError: false, error: null };
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Admin Page Error:", error, info);
  }
  componentDidUpdate(prevProps: { section?: string }) {
    if (prevProps.section !== this.props.section && this.state.hasError) {
      this.setState({ hasError: false, error: null });
    }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="admin-loading" style={{ minHeight: "60vh", padding: "40px 20px" }}>
          <Logo />
          <h2>Admin workspace temporarily unavailable</h2>
          <p style={{ maxWidth: "440px", fontSize: "13px", color: "var(--muted)" }}>
            {this.state.error?.message || "Could not load the admin workspace on your current device."}
          </p>
          <div style={{ display: "flex", gap: "10px", marginTop: "14px", flexWrap: "wrap", justifyContent: "center" }}>
            <button
              className="btn-primary"
              onClick={() => this.setState({ hasError: false, error: null })}
            >
              <RefreshCw size={15} /> Reload workspace
            </button>
            <Link to="/admin/overview" className="btn-secondary">
              Go to overview
            </Link>
            <Link to="/" className="text-link" style={{ alignSelf: "center", marginLeft: "8px" }}>
              Return to storefront
            </Link>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

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
  const navigate = useNavigate();
  const utils = trpc.useUtils();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { section = "overview" } = useParams();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isActivatingDemo, setIsActivatingDemo] = useState(false);
  const current = nav.find((item) => item.slug === section) ?? nav[0];

  const loginMutation = trpc.auth.login.useMutation();

  const handleInstantDemoLogin = async () => {
    try {
      setIsActivatingDemo(true);
      const res = await loginMutation.mutateAsync({
        email: "admin@oja.store",
        password: "admin",
        role: "admin",
      });
      if (res?.user) {
        utils.auth.me.setData(undefined, res.user);
      }
      await utils.auth.me.invalidate();
    } catch {
      // Fallback: direct storage set for static GitHub Pages
      try {
        localStorage.setItem(
          "oja_user",
          JSON.stringify({
            id: 2,
            unionId: "seed-admin",
            name: "Store Administrator",
            email: "admin@oja.store",
            role: "admin",
            lastSignInAt: new Date(),
          })
        );
        window.location.reload();
      } catch {
        navigate("/login?tab=admin");
      }
    } finally {
      setIsActivatingDemo(false);
    }
  };

  if (isLoading)
    return (
      <div className="admin-loading">
        <Logo />
        <LoaderCircle className="spin" size={24} />
        <p>Opening your workspace…</p>
      </div>
    );

  if (!isAuthenticated)
    return (
      <div className="admin-loading">
        <Logo />
        <h1>Store operations, secured.</h1>
        <p>Sign in with an administrator account to manage Oja.</p>
        <div className="admin-gate-actions">
          <Link to="/login?tab=admin" className="btn-primary">
            Sign in as Administrator <ChevronRight size={16} />
          </Link>
          <button
            type="button"
            className="btn-secondary"
            onClick={handleInstantDemoLogin}
            disabled={isActivatingDemo}
          >
            {isActivatingDemo ? (
              <>
                <LoaderCircle className="spin" size={15} /> Entering workspace…
              </>
            ) : (
              <>
                <Sparkles size={15} /> Quick Access (Demo Admin)
              </>
            )}
          </button>
          <Link to="/" className="text-link">
            Return to storefront
          </Link>
        </div>
      </div>
    );

  if (user?.role !== "admin")
    return (
      <div className="admin-loading">
        <Logo />
        <h1>Administrator access required.</h1>
        <p>
          You are signed in as <strong>{user?.name || user?.email || "a customer"}</strong>. This account does not have permission to manage store operations.
        </p>
        <div className="admin-gate-actions">
          <button
            type="button"
            className="btn-primary"
            onClick={handleInstantDemoLogin}
            disabled={isActivatingDemo}
          >
            {isActivatingDemo ? (
              <>
                <LoaderCircle className="spin" size={15} /> Switching…
              </>
            ) : (
              <>
                <Sparkles size={15} /> Switch to Administrator (Demo)
              </>
            )}
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={async () => {
              await logout();
              navigate("/login?tab=admin");
            }}
          >
            Sign in with another Admin account
          </button>
          <Link to="/account" className="btn-secondary">
            Back to my customer account
          </Link>
          <Link to="/" className="text-link">
            Return to storefront
          </Link>
        </div>
      </div>
    );

  const userName = user?.name || "Store Administrator";
  const userInitial = userName.trim().charAt(0).toUpperCase() || "A";

  return (
    <AdminErrorBoundary section={section}>
      <div className="admin-shell">
        <aside className={menuOpen ? "admin-sidebar open" : "admin-sidebar"}>
          <div className="admin-sidebar__top">
            <Logo />
            <button className="icon-btn admin-menu-close" onClick={() => setMenuOpen(false)} aria-label="Close menu">
              <X size={19} />
            </button>
            <span>STORE OPERATIONS</span>
          </div>
          <nav aria-label="Admin navigation">
            {nav.map(({ slug, label, icon: Icon }) => (
              <NavLink
                key={slug}
                to={`/admin/${slug}`}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                <Icon size={17} strokeWidth={1.8} />
                <span>{label}</span>
                <ChevronRight className="nav-chevron" size={14} />
              </NavLink>
            ))}
          </nav>
          <div className="admin-sidebar__bottom">
            <Link to="/" target="_blank">
              <ExternalLink size={16} /> View storefront
            </Link>
            <button onClick={logout}>
              <LogOut size={16} /> Sign out
            </button>
            <div className="admin-user">
              <span>{userInitial}</span>
              <div>
                <strong>{userName}</strong>
                <small>Administrator</small>
              </div>
            </div>
          </div>
        </aside>
        {menuOpen && <button className="admin-scrim" onClick={() => setMenuOpen(false)} aria-label="Close navigation" />}
        <main className="admin-main">
          <header className="admin-topbar">
            <button className="icon-btn admin-menu-button" onClick={() => setMenuOpen(true)} aria-label="Open menu">
              <Menu size={20} />
            </button>
            <div>
              <span className="mono-label">OJA / {current.slug.toUpperCase()}</span>
              <h1>{current.label}</h1>
            </div>
            <div className="admin-topbar__meta">
              <span className="live-dot" /> Store online
              <small>
                {new Date().toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
              </small>
            </div>
          </header>
          <div className="admin-content">
            <AdminErrorBoundary section={section}>
              <AdminContent section={section} />
            </AdminErrorBoundary>
          </div>
          <footer className="admin-footer">
            <span>
              <BarChart3 size={14} /> Live store data
            </span>
            <span>Oja operations · 2026</span>
          </footer>
        </main>
      </div>
    </AdminErrorBoundary>
  );
}
