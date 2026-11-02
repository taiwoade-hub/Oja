import { useMemo, useState } from "react";
import { ArrowRight, Check, ChevronDown, ChevronUp, Circle, PackageCheck, RotateCcw, ShoppingBag, Truck, XCircle } from "lucide-react";
import { Link, useSearchParams } from "react-router";
import { toast } from "sonner";
import { trpc } from "@/providers/trpc";
import { money, shortDate } from "@/lib/format";
import { resolveAssetUrl } from "@/lib/assets";
import { AuthGate } from "@/components/store/AuthGate";

const statusSteps = ["pending", "processing", "shipped", "delivered"] as const;

function OrdersContent() {
  const utils = trpc.useUtils();
  const orders = trpc.shop.orders.useQuery();
  const [params] = useSearchParams();
  const [expanded, setExpanded] = useState<number | null>(null);
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const placed = params.get("placed");
  const cancel = trpc.shop.cancelOrder.useMutation({ onSuccess: async () => { await utils.shop.orders.invalidate(); toast.success("Order cancelled and stock returned"); }, onError: (error) => toast.error(error.message) });
  const reorder = trpc.shop.reorder.useMutation({ onSuccess: async () => { await utils.shop.cart.invalidate(); toast.success("Available items added to your bag"); }, onError: (error) => toast.error(error.message) });
  const filtered = useMemo(() => orders.data?.filter((order) => filter === "all" || (filter === "active" ? !["delivered", "cancelled"].includes(order.status) : ["delivered", "cancelled"].includes(order.status))) ?? [], [orders.data, filter]);

  return <div className="page-container simple-page orders-page">
    {placed && <div className="success-banner"><PackageCheck size={25} /><div><strong>Order {placed} is in.</strong><p>Thank you. We’ve saved your order and will notify you after payment is verified.</p></div></div>}
    <div className="page-heading row-heading"><div><span className="mono-label">YOUR OJA JOURNEY</span><h1>Orders & tracking</h1><p>Every order, from confirmation to your doorstep.</p></div><Link to="/explore" className="btn-secondary">Continue shopping <ArrowRight size={15} /></Link></div>
    <div className="filter-tabs">{(["all", "active", "completed"] as const).map((value) => <button key={value} className={filter === value ? "active" : ""} onClick={() => setFilter(value)}>{value === "all" ? "All orders" : value === "active" ? "In progress" : "Completed"}</button>)}</div>
    {orders.isLoading && <div className="order-list">{[1, 2].map((item) => <div className="skeleton-block order-skeleton" key={item} />)}</div>}
    {!orders.isLoading && filtered.length === 0 && <div className="empty-state"><ShoppingBag size={30} /><h2>No orders here yet</h2><p>When you find something you love, your order will appear here.</p><Link to="/explore" className="btn-primary">Explore the collection</Link></div>}
    <div className="order-list">{filtered.map((order) => {
      const isOpen = expanded === order.id;
      const currentStep = statusSteps.indexOf(order.status as typeof statusSteps[number]);
      return <article className="order-card" key={order.id}>
        <button className="order-card__head" onClick={() => setExpanded(isOpen ? null : order.id)} aria-expanded={isOpen}>
          <div><span className="mono-label">{order.orderNumber}</span><h2>{order.items[0]?.nameSnapshot}{order.items.length > 1 ? ` + ${order.items.length - 1} more` : ""}</h2><p>Placed {shortDate(order.createdAt)} · {order.items.reduce((sum, item) => sum + item.quantity, 0)} items</p></div>
          <div className="order-head-meta"><span className={`status-badge status-${order.status}`}>{order.status}</span><strong>{money(order.totalKobo)}</strong>{isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</div>
        </button>
        <div className="order-card__products">{order.items.slice(0, 3).map((item) => <img key={item.id} src={resolveAssetUrl(item.imageSnapshot)} alt={item.nameSnapshot} loading="lazy" decoding="async" />)}<div className="order-quick-status"><Truck size={17} /><span>{order.status === "delivered" ? "Delivered" : order.status === "cancelled" ? "Order cancelled" : order.status === "shipped" ? "On its way" : "We’re preparing your order"}</span></div></div>
        {isOpen && <div className="order-details">
          {order.status !== "cancelled" && <div className="tracking-steps">{statusSteps.map((step, index) => <div className={index <= currentStep ? "complete" : ""} key={step}><span>{index < currentStep || order.status === "delivered" ? <Check size={13} /> : <Circle size={10} />}</span><small>{step}</small></div>)}</div>}
          <div className="order-detail-grid"><section><h3>Items in this order</h3>{order.items.map((item) => <div className="order-line" key={item.id}><img src={resolveAssetUrl(item.imageSnapshot)} alt="" loading="lazy" decoding="async" /><span><strong>{item.nameSnapshot}</strong><small>{item.variant || "Standard"} · Qty {item.quantity}</small></span><b>{money(item.unitPriceKobo * item.quantity)}</b></div>)}</section><section><h3>Delivery & payment</h3><p className="address-snapshot">{order.addressSnapshot}</p><dl className="mini-summary"><div><dt>Delivery</dt><dd className="capitalize">{order.deliveryMethod}</dd></div><div><dt>Payment</dt><dd className="capitalize">{order.paymentMethod.replace("_", " ")} · {order.paymentStatus}</dd></div><div><dt>Tracking code</dt><dd>{order.trackingCode}</dd></div><div><dt>Total</dt><dd>{money(order.totalKobo)}</dd></div></dl></section></div>
          <section className="order-timeline"><h3>Order updates</h3>{order.events.map((event) => <div key={event.id}><span className={event.status === "cancelled" ? "timeline-dot cancelled" : "timeline-dot"} /><div><strong>{event.message}</strong><small>{new Date(event.createdAt).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}</small></div></div>)}</section>
          <div className="order-actions"><button className="btn-secondary" onClick={() => reorder.mutate({ id: order.id })} disabled={reorder.isPending}><RotateCcw size={15} /> Buy again</button>{order.status === "pending" && <button className="text-button danger" disabled={cancel.isPending} onClick={() => { if (window.confirm(`Cancel ${order.orderNumber}? This cannot be undone.`)) cancel.mutate({ id: order.id }); }}><XCircle size={15} /> Cancel order</button>}</div>
        </div>}
      </article>;
    })}</div>
  </div>;
}

export default function OrdersPage() { return <AuthGate title="Your orders, all in one place."><OrdersContent /></AuthGate>; }
