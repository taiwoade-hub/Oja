import { useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Check, ChevronRight, Eye, ImagePlus, Layers3, LoaderCircle, Package, Pencil, Plus, Save, Search, Trash2, Upload, X } from "lucide-react";
import { Link } from "react-router";
import { toast } from "sonner";
import { trpc } from "@/providers/trpc";
import { money } from "@/lib/format";
import { resolveAssetUrl } from "@/lib/assets";
import type { StoreProduct } from "@/types/commerce";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

type ProductForm = {
  name: string; brand: string; description: string; categoryId: number | null;
  price: string; previousPrice: string; stock: string; lowStockThreshold: string;
  imageUrl: string; imageKey: string | null; colors: string; sizes: string; specifications: string;
  featured: boolean; bestSeller: boolean; newArrival: boolean; published: boolean;
};

const blankProduct: ProductForm = { name: "", brand: "", description: "", categoryId: null, price: "", previousPrice: "", stock: "0", lowStockThreshold: "5", imageUrl: "/products/9_Jbl_Headphone_Tune_730BT_Beige_G.png", imageKey: null, colors: "", sizes: "", specifications: "", featured: false, bestSeller: false, newArrival: true, published: true };

function toForm(product: StoreProduct | "new"): ProductForm {
  if (product === "new") return blankProduct;
  return { name: product.name, brand: product.brand, description: product.description, categoryId: product.categoryId, price: String(product.priceKobo / 100), previousPrice: product.previousPriceKobo ? String(product.previousPriceKobo / 100) : "", stock: String(product.stock), lowStockThreshold: String(product.lowStockThreshold), imageUrl: product.imageUrl, imageKey: product.imageKey ?? null, colors: product.colors.join(", "), sizes: product.sizes.join(", "), specifications: Object.entries(product.specifications).map(([key, value]) => `${key}: ${value}`).join("\n"), featured: product.featured, bestSeller: product.bestSeller, newArrival: product.newArrival, published: product.published };
}

function ProductEditor({ product, onClose }: { product: StoreProduct | "new"; onClose: () => void }) {
  const utils = trpc.useUtils();
  const categories = trpc.admin.categories.useQuery();
  const [form, setForm] = useState<ProductForm>(() => toForm(product));
  const [uploading, setUploading] = useState(false);
  const upload = trpc.storage.upload.useMutation();
  const refresh = async () => { await Promise.all([utils.admin.products.invalidate(), utils.admin.overview.invalidate(), utils.catalog.invalidate()]); onClose(); };
  const create = trpc.admin.createProduct.useMutation({ onSuccess: async () => { await refresh(); toast.success("Product created"); }, onError: (error) => toast.error(error.message) });
  const update = trpc.admin.updateProduct.useMutation({ onSuccess: async () => { await refresh(); toast.success("Product updated"); }, onError: (error) => toast.error(error.message) });
  const set = <K extends keyof ProductForm>(key: K, value: ProductForm[K]) => setForm((current) => ({ ...current, [key]: value }));
  const busy = create.isPending || update.isPending;
  const imageFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Choose an image under 5 MB"); return; }
    setUploading(true);
    try {
      const contentBase64 = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result).split(",")[1]); reader.onerror = reject; reader.readAsDataURL(file); });
      const saved = await upload.mutateAsync({ name: file.name, contentBase64, contentType: file.type });
      setForm((current) => ({ ...current, imageUrl: saved.url, imageKey: saved.key }));
      toast.success("Image uploaded to secure storage");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Upload failed"); }
    finally { setUploading(false); event.target.value = ""; }
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const specifications = Object.fromEntries(form.specifications.split("\n").map((line) => line.split(/:(.*)/s)).filter((parts) => parts.length >= 2 && parts[0].trim()).map((parts) => [parts[0].trim(), parts[1].trim()]));
    const input = { name: form.name, brand: form.brand, description: form.description, categoryId: form.categoryId, priceKobo: Math.round(Number(form.price) * 100), previousPriceKobo: form.previousPrice ? Math.round(Number(form.previousPrice) * 100) : null, stock: Number(form.stock), lowStockThreshold: Number(form.lowStockThreshold), imageUrl: form.imageUrl, imageKey: form.imageKey, colors: form.colors.split(",").map((value) => value.trim()).filter(Boolean), sizes: form.sizes.split(",").map((value) => value.trim()).filter(Boolean), specifications, featured: form.featured, bestSeller: form.bestSeller, newArrival: form.newArrival, published: form.published };
    if (product === "new") create.mutate(input); else update.mutate({ ...input, id: product.id });
  };
  return <Dialog open onOpenChange={(open) => !open && onClose()}><DialogContent className="product-editor-dialog"><div className="editor-header"><div><DialogTitle>{product === "new" ? "Add a product" : "Edit product"}</DialogTitle><DialogDescription>Changes appear in the storefront as soon as they’re saved.</DialogDescription></div><button className="icon-btn" onClick={onClose} aria-label="Close editor"><X size={19} /></button></div>
    <div className="product-editor-layout"><form className="product-form" onSubmit={submit}>
      <section><h3>Product information</h3><div className="form-grid two"><label>Product name<input required minLength={2} value={form.name} onChange={(e) => set("name", e.target.value)} /></label><label>Brand<input required minLength={2} value={form.brand} onChange={(e) => set("brand", e.target.value)} /></label><label className="span-two">Description<textarea required minLength={10} rows={4} value={form.description} onChange={(e) => set("description", e.target.value)} /></label><label>Category<select value={form.categoryId ?? ""} onChange={(e) => set("categoryId", e.target.value ? Number(e.target.value) : null)}><option value="">Uncategorised</option>{categories.data?.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}</select></label><label>Image path or URL<input required value={form.imageUrl} onChange={(e) => { set("imageUrl", e.target.value); set("imageKey", null); }} /></label></div><label className="upload-button"><input type="file" accept="image/png,image/jpeg,image/webp" onChange={imageFile} disabled={uploading} />{uploading ? <LoaderCircle className="spin" size={16} /> : <Upload size={16} />}{uploading ? "Uploading securely…" : "Upload replacement image"}<small>PNG, JPEG or WebP · max 5 MB</small></label></section>
      <section><h3>Price & inventory</h3><div className="form-grid four"><label>Price (₦)<input required min="1" step="0.01" type="number" value={form.price} onChange={(e) => set("price", e.target.value)} /></label><label>Previous price (₦)<input min="0" step="0.01" type="number" value={form.previousPrice} onChange={(e) => set("previousPrice", e.target.value)} /></label><label>Stock<input required min="0" type="number" value={form.stock} onChange={(e) => set("stock", e.target.value)} /></label><label>Low-stock alert<input required min="0" type="number" value={form.lowStockThreshold} onChange={(e) => set("lowStockThreshold", e.target.value)} /></label></div></section>
      <section><h3>Variations & details</h3><div className="form-grid two"><label>Colours<input value={form.colors} onChange={(e) => set("colors", e.target.value)} placeholder="Sand, Black" /></label><label>Sizes<input value={form.sizes} onChange={(e) => set("sizes", e.target.value)} placeholder="S, M, L" /></label><label className="span-two">Specifications<textarea rows={3} value={form.specifications} onChange={(e) => set("specifications", e.target.value)} placeholder={"Material: Leather\nWarranty: 2 years"} /><small>One “Label: value” pair per line.</small></label></div></section>
      <section><h3>Storefront visibility</h3><div className="flag-grid">{(["published","featured","bestSeller","newArrival"] as const).map((key) => <label className="check-label" key={key}><input type="checkbox" checked={form[key]} onChange={(e) => set(key, e.target.checked)} />{key === "bestSeller" ? "Best seller" : key === "newArrival" ? "New arrival" : key.charAt(0).toUpperCase() + key.slice(1)}</label>)}</div></section>
      <div className="editor-actions"><button type="button" className="btn-secondary" onClick={onClose}>Cancel</button><button className="btn-primary" disabled={busy || uploading}>{busy ? <LoaderCircle className="spin" size={16} /> : <Save size={16} />}{product === "new" ? "Create product" : "Save changes"}</button></div>
    </form><aside className="live-preview"><span className="mono-label">LIVE PRODUCT PREVIEW</span><div className="preview-card"><div className="preview-image">{form.imageUrl ? <img src={resolveAssetUrl(form.imageUrl)} alt="Product preview" /> : <ImagePlus size={30} />}{!form.published && <span>Draft</span>}</div><small>{form.brand || "Brand"}</small><h3>{form.name || "Product name"}</h3><strong>{form.price ? money(Math.round(Number(form.price) * 100)) : "₦0"}</strong><p>{form.description || "Your product description will appear here."}</p><div className="preview-meta"><span>{form.stock} in stock</span><span>{form.published ? "Visible in store" : "Hidden"}</span></div></div><p>This preview uses the same hierarchy as the customer product card.</p></aside></div>
  </DialogContent></Dialog>;
}

export function AdminProducts() {
  const utils = trpc.useUtils();
  const products = trpc.admin.products.useQuery();
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<StoreProduct | "new" | null>(null);
  const remove = trpc.admin.deleteProduct.useMutation({ onSuccess: async () => { await Promise.all([utils.admin.products.invalidate(), utils.catalog.invalidate()]); toast.success("Product deleted"); }, onError: (error) => toast.error(error.message) });
  const filtered = useMemo(() => products.data?.filter((product) => `${product.name} ${product.brand} ${product.categoryName}`.toLowerCase().includes(query.toLowerCase())) ?? [], [products.data, query]);
  return <div className="admin-stack"><div className="admin-section-actions"><div><h2>Catalogue</h2><p>{products.data?.length ?? 0} products across the Oja collection.</p></div><button className="btn-primary" onClick={() => setEditing("new")}><Plus size={16} /> Add product</button></div>
    <section className="admin-panel table-panel"><div className="table-toolbar"><div className="admin-search"><Search size={16} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products or brands" aria-label="Search products" /></div><span className="table-count">{filtered.length} results</span></div><div className="admin-table-wrap"><table className="admin-table product-table"><thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Inventory</th><th>Visibility</th><th className="align-right">Actions</th></tr></thead><tbody>{filtered.map((product) => <tr key={product.id}><td><div className="table-product"><img src={resolveAssetUrl(product.imageUrl)} alt="" loading="lazy" decoding="async" /><span><strong>{product.name}</strong><small>{product.brand}</small></span></div></td><td>{product.categoryName || "Uncategorised"}</td><td><strong>{money(product.priceKobo)}</strong>{product.previousPriceKobo && <small className="strike">{money(product.previousPriceKobo)}</small>}</td><td><span className={product.stock <= product.lowStockThreshold ? "stock-low" : "stock-good"}>{product.stock} units</span><small>Alert at {product.lowStockThreshold}</small></td><td><span className={product.published ? "visibility-badge active" : "visibility-badge"}>{product.published ? "Published" : "Draft"}</span><small>{product.featured ? "Featured" : product.newArrival ? "New arrival" : "Standard"}</small></td><td><div className="table-actions"><Link to={`/product/${product.id}`} target="_blank" className="icon-btn" aria-label={`Preview ${product.name}`}><Eye size={16} /></Link><button className="icon-btn" onClick={() => setEditing(product)} aria-label={`Edit ${product.name}`}><Pencil size={16} /></button><button className="icon-btn danger" onClick={() => { if (window.confirm(`Permanently delete ${product.name}?`)) remove.mutate({ id: product.id }); }} aria-label={`Delete ${product.name}`}><Trash2 size={16} /></button></div></td></tr>)}</tbody></table>{filtered.length === 0 && !products.isLoading && <div className="empty-state"><Package size={28} /><h3>No products found</h3><p>Try a broader search or add a new product.</p></div>}</div></section>{editing && <ProductEditor key={editing === "new" ? "new" : editing.id} product={editing} onClose={() => setEditing(null)} />}</div>;
}

function CategoryRow({ category }: { category: { id: number; name: string; position: number; active: boolean; slug: string; imageUrl: string | null } }) {
  const utils = trpc.useUtils();
  const [name, setName] = useState(category.name);
  const update = trpc.admin.updateCategory.useMutation({ onSuccess: async () => { await Promise.all([utils.admin.categories.invalidate(), utils.catalog.home.invalidate()]); toast.success("Category updated"); }, onError: (error) => toast.error(error.message) });
  return <tr><td><input className="inline-input" value={name} onChange={(e) => setName(e.target.value)} onBlur={() => { if (name.trim() && name !== category.name) update.mutate({ id: category.id, name }); }} /></td><td><span className="mono-slug">/{category.slug}</span></td><td><input className="inline-input small" type="number" value={category.position} onChange={(e) => update.mutate({ id: category.id, position: Number(e.target.value) })} /></td><td><button className={category.active ? "visibility-badge active button-badge" : "visibility-badge button-badge"} onClick={() => update.mutate({ id: category.id, active: !category.active })}>{category.active ? "Active" : "Hidden"}</button></td></tr>;
}

export function AdminCategories() {
  const utils = trpc.useUtils();
  const categories = trpc.admin.categories.useQuery();
  const [name, setName] = useState("");
  const create = trpc.admin.createCategory.useMutation({ onSuccess: async () => { setName(""); await Promise.all([utils.admin.categories.invalidate(), utils.catalog.home.invalidate()]); toast.success("Category created"); }, onError: (error) => toast.error(error.message) });
  return <div className="admin-stack"><div className="admin-section-actions"><div><h2>Category structure</h2><p>Organise discovery without changing product records.</p></div></div><div className="category-admin-layout"><section className="admin-panel table-panel"><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Name</th><th>Storefront path</th><th>Position</th><th>Status</th></tr></thead><tbody>{categories.data?.map((category) => <CategoryRow key={`${category.id}-${category.name}-${category.position}-${category.active}`} category={category} />)}</tbody></table></div></section><aside className="admin-panel compact-form"><span className="mono-label">NEW CATEGORY</span><h2>Add a department</h2><p>Create a clear, customer-friendly category.</p><form onSubmit={(e) => { e.preventDefault(); create.mutate({ name, position: (categories.data?.length ?? 0) + 1 }); }}><label>Category name<input required minLength={2} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Wellness" /></label><button className="btn-primary w-full" disabled={create.isPending}><Plus size={15} /> Create category</button></form><div className="form-note"><Layers3 size={17} /><p>Categories appear on the homepage when active. Product assignment is managed in each product editor.</p></div></aside></div></div>;
}

export function AdminInventory() {
  const utils = trpc.useUtils();
  const inventory = trpc.admin.inventory.useQuery();
  const [selected, setSelected] = useState<number | null>(null);
  const [delta, setDelta] = useState("1");
  const [reason, setReason] = useState("Stock received");
  const adjust = trpc.admin.adjustStock.useMutation({ onSuccess: async () => { await Promise.all([utils.admin.inventory.invalidate(), utils.admin.products.invalidate(), utils.admin.overview.invalidate()]); setSelected(null); toast.success("Inventory adjusted"); }, onError: (error) => toast.error(error.message) });
  const product = inventory.data?.find((item) => item.id === selected);
  const lowCount = inventory.data?.filter((item) => item.stock <= item.lowStockThreshold).length ?? 0;
  return <div className="admin-stack"><div className="admin-inline-metrics"><div><span>Total units</span><strong>{inventory.data?.reduce((sum, item) => sum + item.stock, 0) ?? "—"}</strong></div><div><span>Low-stock products</span><strong>{lowCount}</strong></div><div><span>Out of stock</span><strong>{inventory.data?.filter((item) => item.stock === 0).length ?? "—"}</strong></div></div><section className="admin-panel table-panel"><div className="panel-heading padded"><div><span className="mono-label">LIVE STOCK</span><h2>Inventory control</h2></div><p>Every adjustment is recorded with its reason.</p></div><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Product</th><th>Available</th><th>Threshold</th><th>Status</th><th>Recent movement</th><th /></tr></thead><tbody>{inventory.data?.map((item) => <tr key={item.id}><td><div className="table-product"><img src={resolveAssetUrl(item.imageUrl)} alt="" loading="lazy" decoding="async" /><span><strong>{item.name}</strong><small>{item.brand}</small></span></div></td><td><strong className="stock-number">{item.stock}</strong></td><td>{item.lowStockThreshold}</td><td><span className={item.stock === 0 ? "stock-low" : item.stock <= item.lowStockThreshold ? "stock-watch" : "stock-good"}>{item.stock === 0 ? "Out of stock" : item.stock <= item.lowStockThreshold ? "Low stock" : "Healthy"}</span></td><td>{item.movements[0] ? <><span className={item.movements[0].delta > 0 ? "movement positive" : "movement"}>{item.movements[0].delta > 0 ? "+" : ""}{item.movements[0].delta}</span><small>{item.movements[0].reason}</small></> : <small>No adjustments yet</small>}</td><td><button className="btn-secondary small-button" onClick={() => { setSelected(item.id); setDelta("1"); setReason("Stock received"); }}>Adjust</button></td></tr>)}</tbody></table></div></section>
    <Dialog open={selected !== null} onOpenChange={(open) => !open && setSelected(null)}><DialogContent className="form-dialog narrow"><DialogTitle>Adjust inventory</DialogTitle><DialogDescription>{product?.name} · currently {product?.stock} units</DialogDescription><form className="stack-form" onSubmit={(e) => { e.preventDefault(); if (selected) adjust.mutate({ productId: selected, delta: Number(delta), reason }); }}><label>Quantity change<input type="number" required min="-10000" max="10000" value={delta} onChange={(e) => setDelta(e.target.value)} /><small>Use a negative number to remove stock.</small></label><label>Reason<input required minLength={3} value={reason} onChange={(e) => setReason(e.target.value)} /></label>{product && <div className="stock-preview"><span>New available stock</span><strong>{product.stock + (Number(delta) || 0)}</strong></div>}<button className="btn-primary" disabled={adjust.isPending}>Save adjustment</button></form></DialogContent></Dialog>
  </div>;
}

function HomepageSectionEditor({ section, products }: { section: { id: number; type: string; title: string; subtitle: string | null; position: number; enabled: boolean; productIdsJson: string }; products: StoreProduct[] }) {
  const utils = trpc.useUtils();
  let initialIds: number[] = [];
  try {
    initialIds = Array.isArray((section as any).productIds)
      ? (section as any).productIds
      : JSON.parse(section.productIdsJson || "[]");
  } catch {
    initialIds = [];
  }
  const [title, setTitle] = useState(section.title);
  const [subtitle, setSubtitle] = useState(section.subtitle ?? "");
  const [position, setPosition] = useState(section.position);
  const [ids, setIds] = useState<number[]>(initialIds);
  const update = trpc.admin.updateHomepage.useMutation({ onSuccess: async () => { await Promise.all([utils.admin.homepage.invalidate(), utils.catalog.home.invalidate()]); toast.success("Homepage section saved"); }, onError: (error) => toast.error(error.message) });
  const remove = trpc.admin.deleteHomepageSection.useMutation({ onSuccess: async () => { await Promise.all([utils.admin.homepage.invalidate(), utils.catalog.home.invalidate()]); toast.success("Section removed"); }, onError: (error) => toast.error(error.message) });
  return <article className={section.enabled ? "homepage-section-card" : "homepage-section-card disabled"}><div className="homepage-section-card__head"><div><span className="section-type">{section.type}</span><h3>{section.title}</h3></div><button className={section.enabled ? "visibility-badge active button-badge" : "visibility-badge button-badge"} onClick={() => update.mutate({ id: section.id, enabled: !section.enabled })}>{section.enabled ? "Visible" : "Hidden"}</button></div><div className="form-grid two"><label>Section title<input value={title} onChange={(e) => setTitle(e.target.value)} /></label><label>Position<input type="number" min="0" value={position} onChange={(e) => setPosition(Number(e.target.value))} /></label><label className="span-two">Supporting copy<input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} /></label></div>{["products", "hero", "promo"].includes(section.type) && <details className="product-picker"><summary>{ids.length} selected products <ChevronRight size={14} /></summary><div>{products.map((product) => <label className="check-label" key={product.id}><input type="checkbox" checked={ids.includes(product.id)} onChange={(e) => setIds((current) => e.target.checked ? [...current, product.id] : current.filter((id) => id !== product.id))} /><span>{product.name}</span></label>)}</div></details>}<div className="homepage-section-card__actions"><button className="btn-secondary small-button" onClick={() => update.mutate({ id: section.id, title, subtitle, position, productIds: ids })} disabled={update.isPending}><Save size={14} /> Save section</button>{section.type === "products" && <button className="text-button danger" onClick={() => { if (window.confirm("Remove this homepage section?")) remove.mutate({ id: section.id }); }}><Trash2 size={14} /> Remove</button>}</div></article>;
}

export function AdminHomepage() {
  const utils = trpc.useUtils();
  const homepage = trpc.admin.homepage.useQuery();
  const products = trpc.admin.products.useQuery();
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const create = trpc.admin.createHomepageSection.useMutation({ onSuccess: async () => { setTitle(""); setSubtitle(""); await Promise.all([utils.admin.homepage.invalidate(), utils.catalog.home.invalidate()]); toast.success("Product section added"); }, onError: (error) => toast.error(error.message) });
  return <div className="admin-stack"><div className="admin-section-actions"><div><h2>Homepage composition</h2><p>Control the content and order customers see first.</p></div><Link to="/" target="_blank" className="btn-secondary"><Eye size={15} /> Preview storefront</Link></div><div className="homepage-admin-layout"><div className="homepage-section-list">{homepage.data?.map((section) => <HomepageSectionEditor key={`${section.id}-${section.title}-${section.position}-${section.enabled}`} section={section} products={products.data ?? []} />)}</div><aside className="admin-panel compact-form sticky-panel"><span className="mono-label">NEW PRODUCT SECTION</span><h2>Add to the story</h2><p>Create a curated product row, then select its products.</p><form onSubmit={(e) => { e.preventDefault(); create.mutate({ title, subtitle, productIds: [] }); }}><label>Section title<input required minLength={2} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. The weekend edit" /></label><label>Supporting copy<input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="A short editorial subtitle" /></label><button className="btn-primary w-full" disabled={create.isPending}><Plus size={15} /> Add section</button></form><div className="form-note"><Check size={17} /><p>Sections are sorted by position. Hidden sections stay saved but disappear from the customer homepage.</p></div></aside></div></div>;
}
