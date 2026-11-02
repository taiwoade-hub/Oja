import { Armchair, ArrowRight, BriefcaseBusiness, Headphones, Shirt, Sparkles } from "lucide-react";
import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { ProductCard } from "@/components/store/ProductCard";
import { resolveAssetUrl } from "@/lib/assets";

const categoryIcons = [Headphones, Shirt, Armchair, Sparkles, BriefcaseBusiness];

export default function HomePage() {
  const home = trpc.catalog.home.useQuery();
  if (home.isLoading) return <div className="page-container home-skeleton"><div className="skeleton hero-skeleton" /><div className="skeleton-line" /><div className="product-grid">{[1,2,3,4].map((n) => <div className="skeleton product-skeleton" key={n} />)}</div></div>;
  if (home.error) return <div className="empty-state page-container"><h2>We couldn’t open the shop</h2><p>{home.error.message}</p><button className="btn-primary" onClick={() => home.refetch()}>Try again</button></div>;
  return (
    <div className="home-page">
      {home.data?.sections.map((section) => {
        if (section.type === "hero") {
          const product = section.products[0];
          return <section className="home-hero page-container" key={section.id}>
            <div className="hero-copy"><span className="mono-label">THE EVERYDAY EDIT · 2026</span><h1>{section.title}</h1><p>{section.subtitle}</p><div className="hero-actions">{product && <Link to={`/product/${product.id}`} className="btn-primary">Shop the edit <ArrowRight size={17} /></Link>}<Link to="/explore" className="text-link">Browse everything</Link></div><div className="hero-note"><span>01</span><p>Useful objects.<br />Quiet design. No endless aisle.</p></div></div>
            <div className="hero-image">
              <img
                src={resolveAssetUrl(section.imageUrl ?? product?.imageUrl)}
                alt="Featured headphones in warm natural light"
                loading="eager"
                decoding="async"
                fetchPriority="high"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  target.src = resolveAssetUrl("/products/2_Headphones_product_photography_Photos.png");
                }}
              />
              <span className="image-caption">LESS, BUT BETTER</span>
            </div>
          </section>;
        }
        if (section.type === "categories") return <section className="catalogue-section page-container" key={section.id}><div className="section-heading"><div><span className="mono-label">{section.subtitle}</span><h2>{section.title}</h2></div><Link to="/explore" className="text-link">View all</Link></div><div className="category-row">{home.data.categories.map((category, index) => { const Icon = categoryIcons[index % categoryIcons.length]; return <Link key={category.id} to={`/explore?category=${category.slug}`}><Icon size={25} strokeWidth={1.5} /><span>{category.name}</span><ArrowRight size={15} /></Link>; })}</div></section>;
        if (section.type === "promo") {
          const product = section.products[0];
          return <section className="promo-panel page-container" key={section.id}>
            <div className="promo-image">
              <img
                src={resolveAssetUrl(section.imageUrl ?? product?.imageUrl)}
                alt="Daily skincare ritual"
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  target.src = resolveAssetUrl("/products/10_Prompt_Luxury_Face_Serum_Ad_Ultra.png");
                }}
              />
            </div>
            <div className="promo-copy"><span className="mono-label">OJA15 · LIMITED EDIT</span><h2>{section.title}</h2><p>{section.subtitle}</p>{product && <Link to={`/product/${product.id}`} className="btn-light">Shop the ritual <ArrowRight size={17} /></Link>}</div>
          </section>;
        }
        return <section className="catalogue-section page-container" id={section.title === "Just landed" ? "new" : undefined} key={section.id}><div className="section-heading"><div><span className="mono-label">{section.subtitle}</span><h2>{section.title}</h2></div><Link to="/explore" className="text-link">Shop all <ArrowRight size={14} /></Link></div><div className="product-grid">{section.products.map((product) => product && <ProductCard product={product} key={product.id} />)}</div></section>;
      })}
      <section className="service-notes page-container"><div><strong>Considered delivery</strong><p>Clear tracking from our door to yours.</p></div><div><strong>14-day returns</strong><p>Simple returns on unused items.</p></div><div><strong>Human support</strong><p>Real help from our Lagos team.</p></div></section>
    </div>
  );
}
