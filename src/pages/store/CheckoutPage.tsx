import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Landmark, LoaderCircle, LockKeyhole, MapPin, Plus, Truck, Zap } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { trpc } from "@/providers/trpc";
import { money } from "@/lib/format";
import { resolveAssetUrl } from "@/lib/assets";
import { AuthGate } from "@/components/store/AuthGate";
import { AddressForm } from "@/components/store/AddressForm";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

function CheckoutContent() {
  const navigate = useNavigate();
  const utils = trpc.useUtils();
  const addresses = trpc.shop.addresses.useQuery();
  const [addressId, setAddressId] = useState<number>();
  const [deliveryMethod, setDeliveryMethod] = useState<"standard" | "express">("standard");
  const [paymentMethod, setPaymentMethod] = useState<"bank_transfer" | "paystack">("bank_transfer");
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState<string>();
  const [addressOpen, setAddressOpen] = useState(false);
  const idempotencyKey = useRef(crypto.randomUUID());
  const quote = trpc.shop.quote.useQuery({ deliveryMethod, coupon });
  const placeOrder = trpc.shop.placeOrder.useMutation({
    onSuccess: async (result) => {
      await utils.invalidate();
      navigate(`/orders?placed=${result.orderNumber}`, { state: { placed: result.orderNumber } });
    },
    onError: (error) => toast.error(error.message),
  });
  useEffect(() => {
    if (!addressId && addresses.data?.length) setAddressId((addresses.data.find((address) => address.isDefault) ?? addresses.data[0]).id);
  }, [addresses.data, addressId]);
  const selectedAddress = addresses.data?.find((address) => address.id === addressId);
  const canPlace = !!selectedAddress && !!quote.data?.items.length && !placeOrder.isPending;

  return <div className="page-container simple-page checkout-page">
    <Link to="/cart" className="back-link"><ArrowLeft size={16} /> Back to bag</Link>
    <div className="page-heading"><span className="mono-label">SECURE CHECKOUT</span><h1>Almost yours.</h1><p>Review delivery and payment. We’ll confirm every detail before placing your order.</p></div>
    <div className="checkout-layout">
      <div className="checkout-sections">
        <section className="checkout-section">
          <div className="section-number">01</div><div className="checkout-section__content"><div className="section-title-row"><div><h2>Delivery address</h2><p>Where should we send your order?</p></div><Dialog open={addressOpen} onOpenChange={setAddressOpen}><DialogTrigger asChild><button className="text-button"><Plus size={15} /> New address</button></DialogTrigger><DialogContent className="form-dialog"><DialogTitle>Add a delivery address</DialogTitle><DialogDescription>Save an address to your Oja account.</DialogDescription><AddressForm onAdded={() => setAddressOpen(false)} /></DialogContent></Dialog></div>
          {addresses.isLoading && <div className="skeleton-block" />}
          {addresses.data?.length === 0 && <div className="inline-empty"><MapPin size={22} /><div><strong>Add your first address</strong><p>We need a delivery destination before you can place an order.</p></div></div>}
          <div className="address-options">{addresses.data?.map((address) => <label className={address.id === addressId ? "choice-card selected" : "choice-card"} key={address.id}><input type="radio" name="address" checked={address.id === addressId} onChange={() => setAddressId(address.id)} /><span className="radio-mark">{address.id === addressId && <Check size={12} />}</span><span><strong>{address.label} · {address.fullName}</strong><p>{address.line1}, {address.city}, {address.state}</p><small>{address.phone}</small></span></label>)}</div>
          </div>
        </section>
        <section className="checkout-section">
          <div className="section-number">02</div><div className="checkout-section__content"><h2>Delivery speed</h2><p>Both options include tracking from dispatch to doorstep.</p><div className="delivery-options">
            <label className={deliveryMethod === "standard" ? "choice-card selected" : "choice-card"}><input type="radio" name="delivery" checked={deliveryMethod === "standard"} onChange={() => setDeliveryMethod("standard")} /><Truck size={20} /><span><strong>Standard delivery</strong><small>3–5 business days</small></span><b>{quote.data?.subtotalKobo && quote.data.subtotalKobo >= (quote.data.freeThresholdKobo ?? 15000000) ? "Free" : money(quote.data?.standardFeeKobo ?? 350000)}</b></label>
            <label className={deliveryMethod === "express" ? "choice-card selected" : "choice-card"}><input type="radio" name="delivery" checked={deliveryMethod === "express"} onChange={() => setDeliveryMethod("express")} /><Zap size={20} /><span><strong>Express delivery</strong><small>1–2 business days</small></span><b>{money(quote.data?.expressFeeKobo ?? 750000)}</b></label>
          </div></div>
        </section>
        <section className="checkout-section">
          <div className="section-number">03</div><div className="checkout-section__content"><h2>Payment</h2><p>Your total is calculated securely on our server.</p><div className="payment-options">
            <label className={paymentMethod === "bank_transfer" ? "choice-card selected" : "choice-card"}><input type="radio" name="payment" checked={paymentMethod === "bank_transfer"} onChange={() => setPaymentMethod("bank_transfer")} /><Landmark size={20} /><span><strong>Bank transfer</strong><small>Place now; transfer instructions follow by email. Your order remains pending until verified.</small></span></label>
            <label className="choice-card disabled" aria-disabled="true"><input type="radio" name="payment" disabled checked={paymentMethod === "paystack"} onChange={() => setPaymentMethod("paystack")} /><LockKeyhole size={20} /><span><strong>Paystack</strong><small>Online payment is not configured for this store yet.</small></span><span className="status-pill">Unavailable</span></label>
          </div></div>
        </section>
      </div>
      <aside className="order-summary checkout-summary"><h2>Your order</h2><div className="checkout-products">{quote.data?.items.map((item) => <div key={item.id}><img src={resolveAssetUrl(item.product.imageUrl)} alt="" loading="lazy" decoding="async" /><span><strong>{item.product.name}</strong><small>Qty {item.quantity}{item.variant ? ` · ${item.variant}` : ""}</small></span><b>{money(item.product.priceKobo * item.quantity)}</b></div>)}</div>
        <form className="coupon-form" onSubmit={(event) => { event.preventDefault(); setCoupon(couponInput.trim() || undefined); }}><label htmlFor="coupon">Promotion code</label><div><input id="coupon" value={couponInput} onChange={(e) => setCouponInput(e.target.value)} placeholder="e.g. OJA15" /><button className="btn-secondary" type="submit">Apply</button></div>{coupon && quote.data?.couponMessage && <p className="field-error">{quote.data.couponMessage}</p>}{coupon && !quote.data?.couponMessage && (quote.data?.discountKobo ?? 0) > 0 && <p className="field-success">{coupon.toUpperCase()} applied.</p>}</form>
        <dl><div><dt>Subtotal</dt><dd>{money(quote.data?.subtotalKobo ?? 0)}</dd></div>{(quote.data?.discountKobo ?? 0) > 0 && <div className="discount-line"><dt>Discount</dt><dd>−{money(quote.data?.discountKobo ?? 0)}</dd></div>}<div><dt>Delivery</dt><dd>{quote.data?.deliveryFeeKobo === 0 ? "Free" : money(quote.data?.deliveryFeeKobo ?? 0)}</dd></div><div className="summary-total"><dt>Total</dt><dd>{money(quote.data?.totalKobo ?? 0)}</dd></div></dl>
        <button className="btn-primary w-full" disabled={!canPlace} onClick={() => addressId && placeOrder.mutate({ addressId, deliveryMethod, coupon, paymentMethod, idempotencyKey: idempotencyKey.current })}>{placeOrder.isPending ? <LoaderCircle className="spin" size={17} /> : <LockKeyhole size={16} />} {placeOrder.isPending ? "Placing order…" : "Place order"}{!placeOrder.isPending && <ArrowRight size={16} />}</button>
        <p>By placing this order, you confirm the delivery details above. Payment is never marked successful from the browser.</p>
      </aside>
    </div>
  </div>;
}

export default function CheckoutPage() { return <AuthGate title="Sign in to complete your order."><CheckoutContent /></AuthGate>; }
