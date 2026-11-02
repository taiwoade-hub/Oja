import { Heart, Plus } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { money } from "@/lib/format";
import type { StoreProduct } from "@/types/commerce";

export function ProductCard({ product, list = false }: { product: StoreProduct; list?: boolean }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const utils = trpc.useUtils();
  const wishlist = trpc.shop.wishlist.useQuery(undefined, { enabled: isAuthenticated });
  const saved = wishlist.data?.some((item) => item.productId === product.id);
  const toggle = trpc.shop.toggleWishlist.useMutation({
    onSuccess: async (result) => { await utils.shop.wishlist.invalidate(); toast.success(result.saved ? "Saved to your wishlist" : "Removed from your wishlist"); },
    onError: (error) => toast.error(error.message),
  });
  const add = trpc.shop.addToCart.useMutation({
    onSuccess: async () => { await utils.shop.cart.invalidate(); toast.success("Added to bag"); },
    onError: (error) => toast.error(error.message),
  });
  const requireAuth = () => { if (!isAuthenticated) { navigate("/login"); return false; } return true; };
  const discount = product.previousPriceKobo ? Math.round((1 - product.priceKobo / product.previousPriceKobo) * 100) : 0;

  return (
    <article className={`product-card ${list ? "product-card--list" : ""}`}>
      <div className="product-media">
        <Link to={`/product/${product.id}`} aria-label={`View ${product.name}`}>
          <img src={product.imageUrl} alt={product.name} loading="lazy" />
        </Link>
        {discount > 0 && <span className="discount-tag">−{discount}%</span>}
        <button className={`media-action media-action--heart ${saved ? "is-saved" : ""}`} aria-label={saved ? "Remove from wishlist" : "Save to wishlist"} onClick={() => requireAuth() && toggle.mutate({ productId: product.id })} disabled={toggle.isPending}>
          <Heart size={17} fill={saved ? "currentColor" : "none"} />
        </button>
        <button className="media-action media-action--add" aria-label={`Add ${product.name} to bag`} onClick={() => requireAuth() && add.mutate({ productId: product.id, quantity: 1, variant: "" })} disabled={add.isPending || product.stock < 1}>
          <Plus size={18} />
        </button>
      </div>
      <Link to={`/product/${product.id}`} className="product-copy">
        <div>
          <p className="product-brand">{product.brand}</p>
          <h3>{product.name}</h3>
        </div>
        <div className="product-price">
          <span>{money(product.priceKobo)}</span>
          {product.previousPriceKobo && <del>{money(product.previousPriceKobo)}</del>}
        </div>
      </Link>
    </article>
  );
}
