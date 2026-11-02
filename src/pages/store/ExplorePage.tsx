import { useState } from "react";
import { Grid2X2, List, Search, SlidersHorizontal, X } from "lucide-react";
import { useSearchParams } from "react-router";
import { trpc } from "@/providers/trpc";
import { ProductCard } from "@/components/store/ProductCard";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

export default function ExplorePage() {
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState(params.get("search") ?? "");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [maxPrice, setMaxPrice] = useState(Number(params.get("max") ?? 1500000));
  const [minRating, setMinRating] = useState(Number(params.get("rating") ?? 0));
  const [inStock, setInStock] = useState(params.get("stock") === "1");
  const [list, setList] = useState(false);
  const queryInput = {
    search: params.get("search") || undefined, category: params.get("category") || undefined,
    sort: (params.get("sort") ?? "featured") as "featured" | "newest" | "price_asc" | "price_desc" | "rating",
    maxPrice: params.get("max") ? Number(params.get("max")) * 100 : undefined,
    minRating: params.get("rating") ? Number(params.get("rating")) * 10 : undefined,
    inStock: params.get("stock") === "1" || undefined,
  };
  const products = trpc.catalog.list.useQuery(queryInput);
  const home = trpc.catalog.home.useQuery();
  const update = (key: string, value?: string) => { const next = new URLSearchParams(params); if (value) next.set(key, value); else next.delete(key); setParams(next); };
  const applyFilters = () => { const next = new URLSearchParams(params); next.set("max", String(maxPrice)); if (minRating) next.set("rating", String(minRating)); else next.delete("rating"); if (inStock) next.set("stock", "1"); else next.delete("stock"); setParams(next); setFiltersOpen(false); };
  return (
    <div className="page-container explore-page">
      <div className="explore-title"><span className="mono-label">THE CATALOGUE</span><h1>Find your next favourite.</h1><p>Useful, beautiful things — without the endless scroll.</p></div>
      <form className="explore-search" onSubmit={(event) => { event.preventDefault(); update("search", search || undefined); }}><Search size={20} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products, brands, categories" aria-label="Search catalogue" />{search && <button type="button" className="icon-btn" onClick={() => { setSearch(""); update("search"); }} aria-label="Clear search"><X size={17} /></button>}<button className="btn-primary" type="submit">Search</button></form>
      <div className="category-pills"><button className={!params.get("category") ? "active" : ""} onClick={() => update("category")}>All</button>{home.data?.categories.map((category) => <button key={category.id} className={params.get("category") === category.slug ? "active" : ""} onClick={() => update("category", category.slug)}>{category.name}</button>)}</div>
      <div className="catalogue-toolbar"><p><strong>{products.data?.length ?? "—"}</strong> considered pieces</p><div><button className="btn-filter" onClick={() => setFiltersOpen(true)}><SlidersHorizontal size={16} /> Filters{(params.get("rating") || params.get("stock")) && <span />}</button><select aria-label="Sort products" value={queryInput.sort} onChange={(event) => update("sort", event.target.value)}><option value="featured">Featured</option><option value="newest">Newest</option><option value="price_asc">Price: low to high</option><option value="price_desc">Price: high to low</option><option value="rating">Top rated</option></select><div className="layout-toggle"><button className={!list ? "active" : ""} onClick={() => setList(false)} aria-label="Grid view"><Grid2X2 size={17} /></button><button className={list ? "active" : ""} onClick={() => setList(true)} aria-label="List view"><List size={18} /></button></div></div></div>
      {products.isLoading ? <div className="product-grid">{[1,2,3,4,5,6].map((n) => <div className="skeleton product-skeleton" key={n} />)}</div> : products.data?.length ? <div className={list ? "product-grid product-grid--list" : "product-grid"}>{products.data.map((product) => <ProductCard key={product.id} product={product} list={list} />)}</div> : <div className="empty-state"><Search size={30} /><h2>Nothing matches just yet</h2><p>Try removing a filter or searching for something broader.</p><button className="btn-primary" onClick={() => { setParams({}); setSearch(""); }}>Clear all filters</button></div>}
      <Dialog open={filtersOpen} onOpenChange={setFiltersOpen}><DialogContent className="side-dialog"><DialogTitle>Refine the collection</DialogTitle><DialogDescription>Filter by price, customer rating and availability.</DialogDescription><div className="filter-group"><label htmlFor="max-price">Maximum price <strong>₦{maxPrice.toLocaleString()}</strong></label><input id="max-price" type="range" min="50000" max="1500000" step="50000" value={maxPrice} onChange={(event) => setMaxPrice(Number(event.target.value))} /><div className="range-labels"><span>₦50,000</span><span>₦1,500,000</span></div></div><div className="filter-group"><span className="label">Minimum rating</span><div className="category-pills">{[0,4,4.5].map((value) => <button key={value} className={minRating === value ? "active" : ""} onClick={() => setMinRating(value)}>{value === 0 ? "Any" : `${value}+ stars`}</button>)}</div></div><label className="check-row"><input type="checkbox" checked={inStock} onChange={(event) => setInStock(event.target.checked)} /><span>In-stock products only</span></label><button className="btn-primary w-full" onClick={applyFilters}>Show products</button></DialogContent></Dialog>
    </div>
  );
}
