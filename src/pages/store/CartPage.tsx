import { ArrowRight, Bookmark, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { money } from "@/lib/format";
import { AuthGate } from "@/components/store/AuthGate";

function CartContent() {
  const utils = trpc.useUtils();
  const cart = trpc.shop.cart.useQuery();
  const quote = trpc.shop.quote.useQuery({ deliveryMethod: "standard" });
  const refresh = async () => { await Promise.all([utils.shop.cart.invalidate(), utils.shop.quote.invalidate()]); };
  const update = trpc.shop.updateCart.useMutation({ onSuccess: refresh });
  const remove = trpc.shop.removeCart.useMutation({ onSuccess: refresh });
  const active = cart.data?.filter((item) => !item.savedForLater) ?? [];
  const saved = cart.data?.filter((item) => item.savedForLater) ?? [];
  return <div className="page-container simple-page"><div className="page-heading"><span className="mono-label">YOUR SELECTION</span><h1>Shopping bag</h1><p>{active.reduce((sum, item) => sum + item.quantity, 0)} items, chosen well.</p></div>{cart.data?.length === 0 && <div className="empty-state"><ShoppingBag size={30} /><h2>Your bag is waiting</h2><p>Start with our tightly edited collection.</p><Link to="/explore" className="btn-primary">Explore products</Link></div>}<div className="cart-layout"><div className="cart-items">{active.map((item) => <article className="cart-item" key={item.id}><Link to={`/product/${item.productId}`}><img src={item.product.imageUrl} alt={item.product.name} /></Link><div className="cart-item__copy"><span className="product-brand">{item.product.brand}</span><Link to={`/product/${item.productId}`}><h3>{item.product.name}</h3></Link>{item.variant && <p>{item.variant}</p>}<strong>{money(item.product.priceKobo)}</strong><div className="cart-item__actions"><div className="quantity-control"><button disabled={item.quantity <= 1 || update.isPending} onClick={() => update.mutate({ id: item.id, quantity: item.quantity - 1, savedForLater: false })} aria-label="Decrease quantity"><Minus size={14} /></button><span>{item.quantity}</span><button disabled={item.quantity >= item.product.stock || update.isPending} onClick={() => update.mutate({ id: item.id, quantity: item.quantity + 1, savedForLater: false })} aria-label="Increase quantity"><Plus size={14} /></button></div><button className="text-button" onClick={() => update.mutate({ id: item.id, quantity: item.quantity, savedForLater: true })}><Bookmark size={14} /> Save for later</button><button className="icon-btn" onClick={() => remove.mutate({ id: item.id })} aria-label="Remove item"><Trash2 size={17} /></button></div></div><b className="cart-line-total">{money(item.product.priceKobo * item.quantity)}</b></article>)}
    {saved.length > 0 && <section className="saved-later"><h2>Saved for later</h2>{saved.map((item) => <article className="cart-item" key={item.id}><img src={item.product.imageUrl} alt={item.product.name} /><div className="cart-item__copy"><span className="product-brand">{item.product.brand}</span><h3>{item.product.name}</h3><strong>{money(item.product.priceKobo)}</strong><button className="text-link" onClick={() => update.mutate({ id: item.id, quantity: item.quantity, savedForLater: false })}>Move to bag</button></div><button className="icon-btn" onClick={() => remove.mutate({ id: item.id })} aria-label="Remove saved item"><Trash2 size={17} /></button></article>)}</section>}</div>
    {active.length > 0 && <aside className="order-summary"><h2>Order summary</h2><dl><div><dt>Subtotal</dt><dd>{money(quote.data?.subtotalKobo ?? 0)}</dd></div><div><dt>Standard delivery</dt><dd>{quote.data?.deliveryFeeKobo === 0 ? "Free" : money(quote.data?.deliveryFeeKobo ?? 0)}</dd></div><div className="summary-total"><dt>Total</dt><dd>{money(quote.data?.totalKobo ?? 0)}</dd></div></dl><Link to="/checkout" className="btn-primary w-full">Continue to checkout <ArrowRight size={16} /></Link><p>Stock and current prices are checked again before your order is placed.</p></aside>}</div></div>;
}

export default function CartPage() { return <AuthGate title="Your bag, ready when you are."><CartContent /></AuthGate>; }
