import { ArrowRight, Boxes, CircleDollarSign, Clock3, PackageCheck, ShoppingBag, Users } from "lucide-react";
import { Link } from "react-router";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { trpc } from "@/providers/trpc";
import { money, shortDate } from "@/lib/format";
import { resolveAssetUrl } from "@/lib/assets";

export function AdminOverview() {
  const overview = trpc.admin.overview.useQuery();
  if (overview.isLoading) return <div className="admin-stack"><div className="metric-grid">{[1,2,3,4].map((n) => <div className="skeleton-block metric-skeleton" key={n} />)}</div><div className="skeleton-block chart-skeleton" /></div>;
  if (overview.error) return <div className="empty-state"><h2>Overview unavailable</h2><p>{overview.error.message}</p><button className="btn-secondary" onClick={() => overview.refetch()}>Try again</button></div>;
  const data = overview.data;
  if (!data) return null;
  const metrics = [
    { label: "Verified revenue", value: money(data.revenueKobo), note: "Paid, non-cancelled orders", icon: CircleDollarSign },
    { label: "Total orders", value: data.orderCount.toLocaleString(), note: `${data.pendingCount} awaiting action`, icon: ShoppingBag },
    { label: "Customers", value: data.customerCount.toLocaleString(), note: "Registered customer accounts", icon: Users },
    { label: "Fulfilled", value: data.completedCount.toLocaleString(), note: "Successfully delivered", icon: PackageCheck },
  ];
  return <div className="admin-stack">
    <section className="admin-welcome"><div><span className="mono-label">AT A GLANCE</span><h2>A clear view of the store.</h2><p>Live orders, verified revenue, and the details that need your attention.</p></div><Link to="/admin/orders" className="btn-primary">Review orders <ArrowRight size={15} /></Link></section>
    <div className="metric-grid">{metrics.map(({ label, value, note, icon: Icon }) => <article className="metric-card" key={label}><div><span>{label}</span><Icon size={18} /></div><strong>{value}</strong><small>{note}</small></article>)}</div>
    <div className="overview-grid">
      <section className="admin-panel sales-panel"><div className="panel-heading"><div><span className="mono-label">LAST 7 DAYS</span><h2>Sales activity</h2></div><span className="panel-note">Verified payments</span></div><div className="sales-chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={data.days} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}><defs><linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#db6a43" stopOpacity={0.22}/><stop offset="100%" stopColor="#db6a43" stopOpacity={0}/></linearGradient></defs><CartesianGrid vertical={false} stroke="#ececeb" /><XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#7a7c81", fontSize: 12 }} /><YAxis axisLine={false} tickLine={false} tick={{ fill: "#7a7c81", fontSize: 11 }} tickFormatter={(value) => value ? `₦${Math.round(value / 100000)}k` : "0"} /><Tooltip formatter={(value) => [money(Number(value)), "Revenue"]} contentStyle={{ border: "1px solid #e5e5e2", borderRadius: 10, boxShadow: "0 10px 30px rgba(20,20,20,.06)", fontSize: 12 }} /><Area type="monotone" dataKey="revenueKobo" stroke="#db6a43" strokeWidth={2.2} fill="url(#salesFill)" activeDot={{ r: 4, fill: "#db6a43", stroke: "#fff", strokeWidth: 2 }} /></AreaChart></ResponsiveContainer></div></section>
      <section className="admin-panel attention-panel"><div className="panel-heading"><div><span className="mono-label">NEEDS ATTENTION</span><h2>Low inventory</h2></div><Boxes size={19} /></div>{data.lowStock.length === 0 && <div className="inline-empty"><PackageCheck size={22} /><div><strong>Stock looks healthy</strong><p>No products are below their threshold.</p></div></div>}<div className="low-stock-list">{data.lowStock.slice(0, 5).map((product) => <Link to="/admin/inventory" key={product.id}><img src={resolveAssetUrl(product.imageUrl)} alt="" loading="lazy" decoding="async" /><span><strong>{product.name}</strong><small>{product.brand}</small></span><b>{product.stock} left</b></Link>)}</div><Link to="/admin/inventory" className="text-link">Manage inventory <ArrowRight size={14} /></Link></section>
    </div>
    <div className="overview-grid lower">
      <section className="admin-panel"><div className="panel-heading"><div><span className="mono-label">LATEST ACTIVITY</span><h2>Recent orders</h2></div><Link to="/admin/orders" className="text-link">View all</Link></div><div className="recent-orders">{data.recent.map(({ order, customer }) => <div key={order.id}><span className={`status-dot status-${order.status}`} /><span><strong>{order.orderNumber}</strong><small>{customer} · {shortDate(order.createdAt)}</small></span><b>{money(order.totalKobo)}</b><span className={`status-badge status-${order.status}`}>{order.status}</span></div>)}</div></section>
      <section className="admin-panel"><div className="panel-heading"><div><span className="mono-label">BY UNITS SOLD</span><h2>Top products</h2></div><Clock3 size={18} /></div><div className="top-products">{data.top.map((product, index) => <div key={product.name}><span>{String(index + 1).padStart(2, "0")}</span><div><strong>{product.name}</strong><small>{product.quantity} units · {money(product.revenueKobo)}</small></div></div>)}</div></section>
    </div>
  </div>;
}
