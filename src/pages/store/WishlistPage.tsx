import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { Link } from "react-router";
import { toast } from "sonner";
import { trpc } from "@/providers/trpc";
import { money } from "@/lib/format";
import { resolveAssetUrl } from "@/lib/assets";
import { AuthGate } from "@/components/store/AuthGate";

function WishlistContent() {
  const utils = trpc.useUtils();
  const items = trpc.shop.wishlist.useQuery();
  const toggle = trpc.shop.toggleWishlist.useMutation({ onSuccess: () => utils.shop.wishlist.invalidate() });
  const add = trpc.shop.addToCart.useMutation({ onSuccess: async (_, input) => { await utils.shop.cart.invalidate(); await toggle.mutateAsync({ productId: input.productId }); toast.success("Moved to your bag"); }, onError: (error) => toast.error(error.message) });
  return <div className="page-container simple-page"><div className="page-heading"><span className="mono-label">YOUR SHORTLIST</span><h1>Saved pieces</h1><p>Keep the good things close until you’re ready.</p></div>{items.data?.length === 0 && <div className="empty-state"><Heart size={30} /><h2>Your wishlist is open</h2><p>Tap the heart on any product to keep it here.</p><Link to="/explore" className="btn-primary">Explore the collection</Link></div>}<div className="wishlist-list">{items.data?.map(({ id, product, productId }) => <article key={id}><Link to={`/product/${productId}`}><img src={resolveAssetUrl(product.imageUrl)} alt={product.name} loading="lazy" decoding="async" /></Link><div className="wishlist-copy"><span className="product-brand">{product.brand}</span><Link to={`/product/${productId}`}><h3>{product.name}</h3></Link><strong>{money(product.priceKobo)}</strong><p className={product.stock ? "in-stock" : "out-stock"}>{product.stock ? "In stock" : "Out of stock"}</p></div><div className="wishlist-actions"><button className="btn-primary" disabled={!product.stock || add.isPending} onClick={() => add.mutate({ productId, quantity: 1, variant: "" })}><ShoppingBag size={16} /> Move to bag</button><button className="icon-btn" onClick={() => toggle.mutate({ productId })} aria-label="Remove from wishlist"><Trash2 size={18} /></button></div></article>)}</div></div>;
}

export default function WishlistPage() { return <AuthGate title="Keep every considered piece close."><WishlistContent /></AuthGate>; }
