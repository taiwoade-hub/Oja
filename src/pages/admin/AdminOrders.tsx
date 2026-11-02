import { useMemo, useState } from "react";
import { CheckCircle2, ChevronDown, ChevronUp, CreditCard, Search } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/providers/trpc";
import { money, shortDate } from "@/lib/format";
import { resolveAssetUrl } from "@/lib/assets";

type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";
type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export function AdminOrders() {
  const utils = trpc.useUtils();
  const orders = trpc.admin.orders.useQuery();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [expanded, setExpanded] = useState<number | null>(null);
  const update = trpc.admin.updateOrder.useMutation({ onSuccess: async () => { await Promise.all([utils.admin.orders.invalidate(), utils.admin.overview.invalidate(), utils.shop.orders.invalidate()]); toast.success("Order updated and customer notified"); }, onError: (error) => toast.error(error.message) });
  const filtered = useMemo(() => orders.data?.filter((order) => (status === "all" || order.status === status) && `${order.orderNumber} ${order.customer} ${order.email}`.toLowerCase().includes(query.toLowerCase())) ?? [], [orders.data, query, status]);
  const pendingValue = orders.data?.filter((order) => order.paymentStatus === "pending" && order.status !== "cancelled").reduce((sum, order) => sum + order.totalKobo, 0) ?? 0;
  return <div className="admin-stack">
    <div className="admin-inline-metrics"><div><span>Total orders</span><strong>{orders.data?.length ?? "—"}</strong></div><div><span>Awaiting fulfilment</span><strong>{orders.data?.filter((order) => ["pending", "processing"].includes(order.status)).length ?? "—"}</strong></div><div><span>Pending payment value</span><strong>{money(pendingValue)}</strong></div></div>
    <section className="admin-panel table-panel"><div className="table-toolbar"><div className="admin-search"><Search size={16} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search order or customer" aria-label="Search orders" /></div><select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter order status"><option value="all">All statuses</option>{["pending","processing","shipped","delivered","cancelled"].map((value) => <option key={value}>{value}</option>)}</select></div>
      <div className="admin-table-wrap"><table className="admin-table order-admin-table"><thead><tr><th>Order</th><th>Customer</th><th>Placed</th><th>Payment</th><th>Status</th><th className="align-right">Total</th><th /></tr></thead><tbody>{filtered.map((order) => {
        const open = expanded === order.id;
        return [
          <tr key={order.id} className={open ? "is-expanded" : ""}><td><strong>{order.orderNumber}</strong><small>{order.items.length} line items</small></td><td><strong>{order.customer}</strong><small>{order.email}</small></td><td>{shortDate(order.createdAt)}</td><td><span className={`payment-badge payment-${order.paymentStatus}`}>{order.paymentStatus}</span><small className="capitalize">{order.paymentMethod.replace("_", " ")}</small></td><td><span className={`status-badge status-${order.status}`}>{order.status}</span></td><td className="align-right"><strong>{money(order.totalKobo)}</strong></td><td><button className="icon-btn" onClick={() => setExpanded(open ? null : order.id)} aria-label={`${open ? "Close" : "Open"} ${order.orderNumber}`}>{open ? <ChevronUp size={17} /> : <ChevronDown size={17} />}</button></td></tr>,
          open && <tr key={`${order.id}-details`} className="admin-order-details"><td colSpan={7}><div className="admin-order-detail-grid"><section><h3>Order items</h3>{order.items.map((item) => <div className="admin-order-line" key={item.id}><img src={resolveAssetUrl(item.imageSnapshot)} alt="" loading="lazy" decoding="async" /><span><strong>{item.nameSnapshot}</strong><small>{item.variant || "Standard"} · Qty {item.quantity}</small></span><b>{money(item.unitPriceKobo * item.quantity)}</b></div>)}</section><section><h3>Delivery snapshot</h3><p>{order.addressSnapshot}</p><dl className="mini-summary"><div><dt>Delivery</dt><dd className="capitalize">{order.deliveryMethod}</dd></div><div><dt>Tracking</dt><dd>{order.trackingCode}</dd></div><div><dt>Subtotal</dt><dd>{money(order.subtotalKobo)}</dd></div><div><dt>Delivery fee</dt><dd>{money(order.deliveryFeeKobo)}</dd></div></dl></section><section className="order-update-form"><h3>Update order</h3><label>Fulfilment status<select value={order.status} disabled={update.isPending || order.status === "cancelled"} onChange={(e) => update.mutate({ id: order.id, status: e.target.value as OrderStatus })}>{["pending","processing","shipped","delivered","cancelled"].map((value) => <option key={value}>{value}</option>)}</select></label><label>Payment status<select value={order.paymentStatus} disabled={update.isPending || order.status === "cancelled"} onChange={(e) => update.mutate({ id: order.id, status: order.status, paymentStatus: e.target.value as PaymentStatus })}>{["pending","paid","failed","refunded"].map((value) => <option key={value}>{value}</option>)}</select></label><p><CheckCircle2 size={14} /> {order.status === "cancelled" ? "Cancelled orders are locked to protect inventory history." : "Changes create a customer notification and order event."}</p></section></div></td></tr>
        ];
      })}</tbody></table>{filtered.length === 0 && !orders.isLoading && <div className="empty-state"><CreditCard size={28} /><h3>No matching orders</h3><p>Try another status or search term.</p></div>}</div>
    </section>
  </div>;
}
