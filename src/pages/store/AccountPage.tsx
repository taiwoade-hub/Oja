import { useState } from "react";
import { ArrowRight, Bell, ChevronRight, LogOut, Mail, MapPin, Package, Plus, ShieldCheck, UserRound } from "lucide-react";
import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { AuthGate } from "@/components/store/AuthGate";
import { AddressForm } from "@/components/store/AddressForm";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { shortDate } from "@/lib/format";

function AccountContent() {
  const { user, logout } = useAuth();
  const addresses = trpc.shop.addresses.useQuery();
  const notes = trpc.shop.notifications.useQuery();
  const [addressOpen, setAddressOpen] = useState(false);
  const initials = user?.name?.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "OJ";
  return <div className="page-container simple-page account-page">
    <section className="account-hero"><div className="avatar-large">{initials}</div><div><span className="mono-label">YOUR OJA ACCOUNT</span><h1>{user?.name || "Welcome back"}</h1><p>{user?.email || "Your personal Oja space"}</p></div><button className="btn-secondary" onClick={logout}><LogOut size={16} /> Sign out</button></section>
    <div className="account-shortcuts"><Link to="/orders"><Package size={21} /><span><strong>Orders & tracking</strong><small>Review purchases and delivery progress</small></span><ChevronRight size={18} /></Link><Link to="/wishlist"><UserRound size={21} /><span><strong>Saved pieces</strong><small>Return to everything you loved</small></span><ChevronRight size={18} /></Link>{user?.role === "admin" && <Link to="/admin"><ShieldCheck size={21} /><span><strong>Admin workspace</strong><small>Manage the Oja store</small></span><ChevronRight size={18} /></Link>}</div>
    <div className="account-grid">
      <section className="account-section"><div className="section-title-row"><div><span className="mono-label">DELIVERY</span><h2>Saved addresses</h2></div><Dialog open={addressOpen} onOpenChange={setAddressOpen}><DialogTrigger asChild><button className="icon-btn bordered" aria-label="Add address"><Plus size={18} /></button></DialogTrigger><DialogContent className="form-dialog"><DialogTitle>Add a delivery address</DialogTitle><DialogDescription>Save a destination for future checkouts.</DialogDescription><AddressForm onAdded={() => setAddressOpen(false)} /></DialogContent></Dialog></div>
        {addresses.data?.length === 0 && <div className="inline-empty"><MapPin size={22} /><div><strong>No addresses yet</strong><p>Add one now for a faster checkout.</p></div></div>}
        <div className="saved-addresses">{addresses.data?.map((address) => <article key={address.id}><MapPin size={18} /><div><strong>{address.label}{address.isDefault && <span>Default</span>}</strong><p>{address.fullName} · {address.phone}</p><p>{address.line1}, {address.city}, {address.state}</p></div></article>)}</div>
      </section>
      <section className="account-section"><div className="section-title-row"><div><span className="mono-label">UPDATES</span><h2>Recent notifications</h2></div><Bell size={20} /></div>
        {notes.data?.length === 0 && <div className="inline-empty"><Bell size={22} /><div><strong>Nothing new</strong><p>Order and store updates will appear here.</p></div></div>}
        <div className="account-notes">{notes.data?.slice(0, 4).map((note) => <article key={note.id}><span className={note.read ? "note-dot read" : "note-dot"} /><div><strong>{note.title}</strong><p>{note.body}</p><small>{shortDate(note.createdAt)}</small></div></article>)}</div>
      </section>
    </div>
    <section className="support-strip"><Mail size={22} /><div><strong>Need a hand?</strong><p>Our care team can help with products, delivery, or an existing order.</p></div><a className="text-link" href="mailto:hello@oja.store">hello@oja.store <ArrowRight size={15} /></a></section>
  </div>;
}

export default function AccountPage() { return <AuthGate title="A personal space for your Oja journey."><AccountContent /></AuthGate>; }
