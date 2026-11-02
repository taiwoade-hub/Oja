import { useEffect, useState } from "react";
import { Bell, Heart, Home, MapPin, Search, ShoppingBag, User, X } from "lucide-react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Logo } from "@/components/Logo";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { money, shortDate } from "@/lib/format";
import { resolveAssetUrl } from "@/lib/assets";

function SearchDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const results = trpc.catalog.list.useQuery({ search: query || undefined, sort: "featured" }, { enabled: open });
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="search-dialog" showCloseButton={false}>
        <DialogTitle className="sr-only">Search the Oja catalogue</DialogTitle>
        <DialogDescription className="sr-only">Search by product, brand or description</DialogDescription>
        <div className="search-dialog__bar">
          <Search size={22} />
          <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="What are you looking for?" aria-label="Search products" />
          <button className="icon-btn" onClick={() => onOpenChange(false)} aria-label="Close search"><X size={20} /></button>
        </div>
        {!query && <div className="popular-searches"><span className="mono-label">POPULAR RIGHT NOW</span><div>{["Headphones", "Leather", "New arrivals", "Skincare"].map((term) => <button key={term} onClick={() => { if (term === "New arrivals") { onOpenChange(false); navigate("/explore?sort=newest"); } else setQuery(term); }}>{term}</button>)}</div></div>}
        <div className="search-results">
          {query && results.data?.length === 0 && <div className="empty-state"><h3>No close matches</h3><p>Try a broader product name or browse the full collection.</p><Link to="/explore" onClick={() => onOpenChange(false)} className="text-link">Explore everything</Link></div>}
          {query && results.data?.slice(0, 5).map((product) => (
            <Link to={`/product/${product.id}`} key={product.id} onClick={() => onOpenChange(false)} className="search-result">
              <img src={resolveAssetUrl(product.imageUrl)} alt="" loading="lazy" decoding="async" /><span><small>{product.brand}</small><strong>{product.name}</strong></span><b>{money(product.priceKobo)}</b>
            </Link>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function NotificationsDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  const notes = trpc.shop.notifications.useQuery(undefined, { enabled: open && isAuthenticated });
  const read = trpc.shop.markNotificationsRead.useMutation({ onSuccess: () => utils.shop.notifications.invalidate() });
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="side-dialog">
        <DialogTitle>Notifications</DialogTitle><DialogDescription>Order updates and notes from Oja.</DialogDescription>
        <div className="notification-list">
          {notes.data?.length === 0 && <div className="empty-state"><Bell size={28} /><h3>All quiet for now</h3><p>We’ll keep order updates here.</p></div>}
          {notes.data?.map((note) => <article key={note.id} className={note.read ? "note is-read" : "note"}><span className="note-dot" /><div><strong>{note.title}</strong><p>{note.body}</p><small>{shortDate(note.createdAt)}</small></div></article>)}
        </div>
        {!!notes.data?.some((note) => !note.read) && <button className="btn-secondary w-full" onClick={() => read.mutate()}>Mark all as read</button>}
      </DialogContent>
    </Dialog>
  );
}

export function StoreLayout() {
  const { isAuthenticated, user } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const cart = trpc.shop.cart.useQuery(undefined, { enabled: isAuthenticated });
  const cartCount = cart.data?.filter((item) => !item.savedForLater).reduce((sum, item) => sum + item.quantity, 0) ?? 0;
  useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" }); }, [location.pathname]);
  const tabs = [
    { to: "/", label: "Home", icon: Home },
    { to: "/explore", label: "Explore", icon: Search },
    { to: "/wishlist", label: "Saved", icon: Heart },
    { to: "/cart", label: "Bag", icon: ShoppingBag },
    { to: isAuthenticated ? "/account" : "/login", label: isAuthenticated ? "Account" : "Sign in", icon: User },
  ];
  return (
    <div className="store-shell">
      <div className="announcement">Free standard delivery over ₦150,000 <span>·</span> Use OJA15 on selected essentials</div>
      <header className="store-header">
        <Logo />
        <nav className="desktop-nav" aria-label="Main navigation"><NavLink to="/explore">Shop all</NavLink><NavLink to="/explore?sort=newest">New arrivals</NavLink><NavLink to="/orders">Track order</NavLink></nav>
        <div className="header-actions">
          <button className="location-button" onClick={() => navigate(isAuthenticated ? "/checkout" : "/login")}><MapPin size={16} /><span>Deliver to <strong>Lagos</strong></span></button>
          <button className="icon-btn" onClick={() => setSearchOpen(true)} aria-label="Search"><Search size={20} /></button>
          <button className="icon-btn desktop-only" onClick={() => isAuthenticated ? setNotesOpen(true) : navigate("/login")} aria-label="Notifications"><Bell size={20} /></button>
          <Link className="icon-btn desktop-only" to={isAuthenticated ? "/account" : "/login"} aria-label="Account"><User size={20} /></Link>
          <Link className="bag-button" to="/cart" aria-label={`Shopping bag with ${cartCount} items`}><ShoppingBag size={19} /><span>Bag</span>{cartCount > 0 && <b>{cartCount}</b>}</Link>
        </div>
      </header>
      <main><Outlet /></main>
      <footer className="store-footer">
        <div><Logo /><p>Good things, chosen well.<br />Delivered across Nigeria.</p></div>
        <div className="footer-links">
          <div><span className="mono-label">SHOP</span><Link to="/explore">All products</Link><Link to="/explore?sort=newest">New arrivals</Link><Link to="/wishlist">Wishlist</Link></div>
          <div><span className="mono-label">ACCOUNT</span><Link to="/orders">Orders & tracking</Link><Link to={isAuthenticated ? "/account" : "/login"}>{isAuthenticated ? "Profile & addresses" : "Sign in / Register"}</Link>{user?.role === "admin" && <Link to="/admin">Admin workspace</Link>}</div>
          <div><span className="mono-label">HELP</span><a href="mailto:hello@oja.store">hello@oja.store</a><Link to="/account">Delivery & support</Link></div>
        </div>
        <div className="footer-bottom"><span>© 2026 Oja Studio</span><span>Lagos · Nigeria</span></div>
      </footer>
      <nav className="mobile-tabs" aria-label="Mobile navigation">{tabs.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} end={to === "/"} className={({ isActive }) => isActive ? "active" : ""}><span className="tab-icon"><Icon size={20} />{to === "/cart" && cartCount > 0 && <b>{cartCount}</b>}</span><small>{label}</small></NavLink>)}</nav>
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
      <NotificationsDialog open={notesOpen} onOpenChange={setNotesOpen} />
    </div>
  );
}
