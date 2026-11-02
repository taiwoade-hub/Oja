import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Check,
  Heart,
  Minus,
  Pause,
  Play,
  Plus,
  Share2,
  Sparkles,
  Star,
  Truck,
  RotateCcw,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { money, rating } from "@/lib/format";
import { ProductCard } from "@/components/store/ProductCard";

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  const detail = trpc.catalog.detail.useQuery({ id: Number(id) });

  const [image, setImage] = useState(0);
  const [color, setColor] = useState("");
  const [size, setSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [zoom, setZoom] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  // Gallery Auto-play / Auto-scroll state
  const [autoPlay, setAutoPlay] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [progress, setProgress] = useState(0);

  // Related products carousel auto-scroll ref
  const carouselRef = useRef<HTMLDivElement>(null);
  const [carouselAutoScroll, setCarouselAutoScroll] = useState(true);
  const [isCarouselHovered, setIsCarouselHovered] = useState(false);

  const wishlist = trpc.shop.wishlist.useQuery(undefined, { enabled: isAuthenticated });
  const saved = wishlist.data?.some((item) => item.productId === Number(id));

  const toggle = trpc.shop.toggleWishlist.useMutation({
    onSuccess: async (result) => {
      await utils.shop.wishlist.invalidate();
      toast.success(result.saved ? "Saved to your wishlist" : "Removed from saved items");
    },
  });

  const add = trpc.shop.addToCart.useMutation({
    onSuccess: async () => {
      await utils.shop.cart.invalidate();
      setJustAdded(true);
      toast.success("Added to your shopping bag");
      setTimeout(() => setJustAdded(false), 2200);
    },
    onError: (error) => toast.error(error.message),
  });

  const product = detail.data?.product;
  const related = detail.data?.related ?? [];
  const gallery = product?.gallery ?? [];
  const galleryCount = gallery.length;

  // Auto-advance gallery images if more than 1 image exists
  useEffect(() => {
    if (!autoPlay || isHovered || galleryCount <= 1) {
      setProgress(0);
      return;
    }

    const intervalTime = 4000;
    const stepTime = 50;
    const increment = (stepTime / intervalTime) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setImage((current) => (current + 1) % galleryCount);
          return 0;
        }
        return prev + increment;
      });
    }, stepTime);

    return () => clearInterval(timer);
  }, [autoPlay, isHovered, galleryCount]);

  // Reset image when id changes
  useEffect(() => {
    setImage(0);
    setProgress(0);
  }, [id]);

  // Related products auto-scroll animation
  useEffect(() => {
    if (!carouselAutoScroll || isCarouselHovered || !carouselRef.current) return;

    const scrollInterval = setInterval(() => {
      if (!carouselRef.current) return;
      const el = carouselRef.current;
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (el.scrollLeft >= maxScroll - 5) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: 290, behavior: "smooth" });
      }
    }, 4500);

    return () => clearInterval(scrollInterval);
  }, [carouselAutoScroll, isCarouselHovered]);

  const handleScrollCarousel = (direction: "left" | "right") => {
    if (!carouselRef.current) return;
    const scrollAmount = direction === "left" ? -300 : 300;
    carouselRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  if (detail.isLoading) {
    return (
      <div className="page-container detail-skeleton">
        <div className="skeleton" />
        <div className="skeleton" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="empty-state page-container">
        <h1>Product not found</h1>
        <p>It may have been removed or relocated from the current collection.</p>
        <Link to="/explore" className="btn-primary">
          Back to the catalogue
        </Link>
      </div>
    );
  }

  const selectedColor = color || product.colors[0] || "";
  const selectedSize = size || product.sizes[0] || "";
  const variant = [selectedColor, selectedSize].filter(Boolean).join(" · ");

  const requireAuth = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return false;
    }
    return true;
  };

  const share = async () => {
    const data = {
      title: product.name,
      text: `${product.brand} · ${product.name}`,
      url: window.location.href,
    };
    if (navigator.share) {
      await navigator.share(data);
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Product link copied to clipboard");
    }
  };

  return (
    <div className="page-container product-page">
      {/* Top breadcrumb navigation */}
      <div className="product-breadcrumb">
        <Link to="/explore" className="back-link">
          <ArrowLeft size={16} /> Back to shop
        </Link>
        <span className="breadcrumb-slash">/</span>
        <span className="breadcrumb-brand">{product.brand}</span>
        <span className="breadcrumb-slash">/</span>
        <span className="breadcrumb-current">{product.name}</span>
      </div>

      <section className="product-detail">
        {/* GALLERY SECTION WITH ANIMATED AUTO-SCROLL */}
        <div
          className="gallery"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Main Display Image */}
          <div className="gallery-main-wrapper">
            <button
              className={`gallery-main ${zoom ? "is-zoomed" : ""}`}
              onDoubleClick={() => setZoom(!zoom)}
              onClick={() => setZoom(!zoom)}
              aria-label="Zoom product image"
            >
              <img
                key={gallery[image] ?? product.imageUrl}
                src={gallery[image] ?? product.imageUrl}
                alt={product.name}
                className="gallery-image-animated"
              />
            </button>

            {/* Gallery Progress & Auto-play controls */}
            {galleryCount > 1 && (
              <>
                {autoPlay && (
                  <div
                    className="gallery-progress-bar"
                    style={{ width: `${progress}%` }}
                    aria-hidden="true"
                  />
                )}
                <div className="gallery-controls-overlay">
                  <button
                    type="button"
                    className="gallery-auto-badge"
                    onClick={() => setAutoPlay(!autoPlay)}
                    aria-label={autoPlay ? "Pause auto-scroll preview" : "Start auto-scroll preview"}
                  >
                    {autoPlay ? (
                      <>
                        <Pause size={12} />
                        <span>Auto-scroll: ON</span>
                      </>
                    ) : (
                      <>
                        <Play size={12} />
                        <span>Auto-scroll: OFF</span>
                      </>
                    )}
                  </button>
                  <span className="gallery-counter">
                    {image + 1} / {galleryCount}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Animated Thumbnails Strip */}
          {galleryCount > 1 && (
            <div className="gallery-thumbs" role="tablist">
              {gallery.map((src, index) => (
                <button
                  key={src}
                  type="button"
                  className={`gallery-thumb-btn ${index === image ? "active" : ""}`}
                  onClick={() => {
                    setImage(index);
                    setProgress(0);
                  }}
                  aria-label={`View image ${index + 1}`}
                >
                  <img src={src} alt="" />
                  {index === image && autoPlay && (
                    <div
                      className="thumb-progress"
                      style={{ width: `${progress}%` }}
                    />
                  )}
                </button>
              ))}
            </div>
          )}

          <div className="gallery-footer-hints">
            <span className="gallery-hint">
              {isHovered && autoPlay ? "Preview paused while hovered · Click to zoom" : "Double click to zoom"}
            </span>
          </div>
        </div>

        {/* PRODUCT INFO & PURCHASE */}
        <div className="product-info">
          <div className="product-meta-header">
            <span className="product-brand">{product.brand}</span>
            {product.newArrival && <span className="new-tag">New arrival</span>}
          </div>

          <h1>{product.name}</h1>

          <div className="rating-row">
            <Star size={15} fill="currentColor" />
            <strong>{rating(product.rating)}</strong>
            <span>{product.reviewCount} verified reviews</span>
          </div>

          <div className="detail-price">
            <strong>{money(product.priceKobo)}</strong>
            {product.previousPriceKobo && (
              <>
                <del>{money(product.previousPriceKobo)}</del>
                <span className="discount-pill">
                  Save {Math.round((1 - product.priceKobo / product.previousPriceKobo) * 100)}%
                </span>
              </>
            )}
          </div>

          <p className="detail-description">{product.description}</p>

          {/* Color Selection */}
          {product.colors.length > 0 && (
            <div className="variant-group">
              <div className="variant-label">
                Colour: <strong>{selectedColor}</strong>
              </div>
              <div className="variant-options">
                {product.colors.map((value, index) => (
                  <button
                    key={value}
                    type="button"
                    className={selectedColor === value ? "active" : ""}
                    onClick={() => setColor(value)}
                  >
                    <span className={`color-swatch color-${index % 4}`} />
                    {value}
                    {selectedColor === value && <Check size={13} />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Selection */}
          {product.sizes.length > 0 && (
            <div className="variant-group">
              <div className="variant-label">
                Size: <strong>{selectedSize}</strong>
              </div>
              <div className="variant-options">
                {product.sizes.map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={selectedSize === value ? "active" : ""}
                    onClick={() => setSize(value)}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Stock Notification */}
          <p className={`stock-note ${product.stock <= product.lowStockThreshold ? "low" : ""}`}>
            <span />
            {product.stock > 0
              ? product.stock <= product.lowStockThreshold
                ? `Only ${product.stock} remaining — order soon`
                : "In stock · Ready to dispatch from Lagos"
              : "Currently out of stock"}
          </p>

          {/* Purchase Actions Row */}
          <div className="purchase-row">
            <div className="quantity-control" aria-label="Adjust quantity">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                aria-label="Decrease quantity"
              >
                <Minus size={16} />
              </button>
              <span>{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                disabled={quantity >= product.stock}
                aria-label="Increase quantity"
              >
                <Plus size={16} />
              </button>
            </div>

            <button
              type="button"
              className={`btn-primary add-to-bag ${justAdded ? "is-success" : ""}`}
              disabled={product.stock < 1 || add.isPending}
              onClick={() =>
                requireAuth() &&
                add.mutate({ productId: product.id, quantity, variant })
              }
            >
              {justAdded ? (
                <>
                  <Check size={18} /> Added to bag!
                </>
              ) : add.isPending ? (
                "Adding to bag…"
              ) : (
                "Add to bag"
              )}
            </button>

            <button
              type="button"
              className={`btn-icon-large ${saved ? "is-saved" : ""}`}
              onClick={() => requireAuth() && toggle.mutate({ productId: product.id })}
              aria-label={saved ? "Remove from saved items" : "Save to wishlist"}
            >
              <Heart size={20} fill={saved ? "currentColor" : "none"} />
            </button>
          </div>

          {/* Value Props Strip */}
          <div className="product-perks">
            <div className="perk-item">
              <Truck size={15} />
              <span>Complimentary Lagos delivery over ₦150,000</span>
            </div>
            <div className="perk-item">
              <RotateCcw size={15} />
              <span>14-day hassle-free returns</span>
            </div>
          </div>

          <button type="button" className="share-button" onClick={share}>
            <Share2 size={15} /> Share this piece
          </button>

          {/* Specifications & Delivery Accordions */}
          <div className="product-accordions">
            <details open>
              <summary>
                Specifications <Plus size={16} />
              </summary>
              <dl>
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key}>
                    <dt>{key}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            </details>
            <details>
              <summary>
                Delivery & returns <Plus size={16} />
              </summary>
              <p>
                Standard Lagos delivery arrives in 1–2 business days. Express same-day
                dispatch available for orders confirmed before 1 PM. Nationwide delivery
                arrives via tracked courier within 2–4 days. Unused pieces in original
                packaging can be returned within 14 days.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* ANIMATED AUTO-SCROLLING "YOU MAY ALSO LIKE" SECTION */}
      {related.length > 0 && (
        <section className="catalogue-section related-section">
          <div className="section-heading">
            <div>
              <span className="mono-label">CURATED PAIRINGS</span>
              <h2>You may also like</h2>
            </div>
            <div className="carousel-nav-buttons">
              <button
                type="button"
                className="icon-btn bordered"
                onClick={() => handleScrollCarousel("left")}
                aria-label="Scroll left"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                className="icon-btn bordered"
                onClick={() => handleScrollCarousel("right")}
                aria-label="Scroll right"
              >
                <ChevronRight size={18} />
              </button>
              <button
                type="button"
                className="carousel-auto-pill"
                onClick={() => setCarouselAutoScroll(!carouselAutoScroll)}
                aria-label="Toggle auto-scroll recommendations"
              >
                <Sparkles size={12} />
                <span>{carouselAutoScroll ? "Auto-scroll ON" : "Auto-scroll OFF"}</span>
              </button>
            </div>
          </div>

          {/* Smooth Auto-Scrolling Carousel Reel */}
          <div
            ref={carouselRef}
            className="related-carousel-track"
            onMouseEnter={() => setIsCarouselHovered(true)}
            onMouseLeave={() => setIsCarouselHovered(false)}
          >
            {related.map((item) => (
              <div key={item.id} className="related-carousel-item">
                <ProductCard product={item} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
