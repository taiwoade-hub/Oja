import superjson from "superjson";
import { resolveAssetUrl } from "./assets";
import type { StoreProduct } from "@/types/commerce";

export interface DemoCategory {
  id: number;
  name: string;
  slug: string;
  position: number;
  active: boolean;
  imageUrl?: string | null;
}

export const DEMO_CATEGORIES: DemoCategory[] = [
  { id: 1, name: "Electronics", slug: "electronics", position: 1, active: true },
  { id: 2, name: "Fashion", slug: "fashion", position: 2, active: true },
  { id: 3, name: "Home", slug: "home", position: 3, active: true },
  { id: 4, name: "Beauty", slug: "beauty", position: 4, active: true },
  { id: 5, name: "Accessories", slug: "accessories", position: 5, active: true },
];

export const DEMO_PRODUCTS: StoreProduct[] = [
  {
    id: 1,
    categoryId: 1,
    categoryName: "Electronics",
    brand: "JBL",
    name: "Tune 730BT Wireless Headphones",
    slug: "jbl-tune-730bt-headphones",
    description: "Soft, lightweight over-ear headphones with rich bass, a foldable frame and up to 40 hours of listening. Made for focused work and unhurried weekends.",
    priceKobo: 18500000,
    previousPriceKobo: 22000000,
    stock: 24,
    lowStockThreshold: 5,
    rating: 48,
    reviewCount: 126,
    imageUrl: resolveAssetUrl("/products/unsplash/9_Jbl_Headphone_Tune_730BT_Beige_G.png"),
    gallery: [
      resolveAssetUrl("/products/unsplash/9_Jbl_Headphone_Tune_730BT_Beige_G.png"),
      resolveAssetUrl("/products/2_Headphones_product_photography_Photos.png"),
    ],
    colors: ["Sand", "Black"],
    sizes: [],
    specifications: { Battery: "40 hours", Bluetooth: "5.3", Weight: "220 g", Charging: "USB-C" },
    featured: true,
    bestSeller: true,
    newArrival: true,
    published: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 2,
    categoryId: 1,
    categoryName: "Electronics",
    brand: "OM SYSTEM",
    name: "OM-5 Mark II Camera · Sand",
    slug: "om-system-om-5-mark-ii-sand",
    description: "A compact, weather-sealed mirrorless camera built for everyday storytelling, with computational photography features and dependable image stabilisation.",
    priceKobo: 145000000,
    previousPriceKobo: null,
    stock: 7,
    lowStockThreshold: 5,
    rating: 49,
    reviewCount: 34,
    imageUrl: resolveAssetUrl("/products/unsplash/10_OM_SYSTEM_OM_5_Mark_II_Digital_Camera.png"),
    gallery: [
      resolveAssetUrl("/products/unsplash/10_OM_SYSTEM_OM_5_Mark_II_Digital_Camera.png"),
      resolveAssetUrl("/products/1_OM_SYSTEM_OM_5_Mark_II_Mirrorless.png"),
    ],
    colors: ["Sand", "Silver", "Black"],
    sizes: [],
    specifications: { Sensor: "20.4 MP", Mount: "Micro Four Thirds", Stabilisation: "5-axis", Video: "4K" },
    featured: true,
    bestSeller: false,
    newArrival: true,
    published: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 3,
    categoryId: 5,
    categoryName: "Accessories",
    brand: "Troubadour",
    name: "Generation Leather Backpack",
    slug: "generation-leather-backpack",
    description: "A refined everyday backpack in smooth black leather. Thoughtful compartments keep work essentials organised without adding bulk.",
    priceKobo: 12800000,
    previousPriceKobo: 14900000,
    stock: 11,
    lowStockThreshold: 5,
    rating: 47,
    reviewCount: 58,
    imageUrl: resolveAssetUrl("/products/unsplash/8_Generation_Leather_Backpack_Lightweight.png"),
    gallery: [
      resolveAssetUrl("/products/unsplash/8_Generation_Leather_Backpack_Lightweight.png"),
      resolveAssetUrl("/products/unsplash/1_Ellington_Leather_Backpack_for_Mission.png"),
    ],
    colors: ["Black", "Cognac"],
    sizes: [],
    specifications: { Material: "Leather", Laptop: "Up to 16 inches", Lining: "Recycled fabric", Warranty: "5 years" },
    featured: true,
    bestSeller: true,
    newArrival: false,
    published: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 4,
    categoryId: 3,
    categoryName: "Home",
    brand: "Fitzgerald",
    name: "Neutral Fabric Swivel Chair",
    slug: "fitzgerald-neutral-swivel-chair",
    description: "A softly sculpted dining chair with a natural timber base and smooth swivel motion. Tailored upholstery makes long dinners even better.",
    priceKobo: 31000000,
    previousPriceKobo: null,
    stock: 4,
    lowStockThreshold: 5,
    rating: 46,
    reviewCount: 19,
    imageUrl: resolveAssetUrl("/products/unsplash/3_Fitzgerald_Neutral_Fabric_Swivel.png"),
    gallery: [resolveAssetUrl("/products/unsplash/3_Fitzgerald_Neutral_Fabric_Swivel.png")],
    colors: ["Oat", "Charcoal"],
    sizes: [],
    specifications: { Frame: "Natural oak", Upholstery: "Woven fabric", Motion: "360° swivel", Assembly: "Fully assembled" },
    featured: true,
    bestSeller: false,
    newArrival: false,
    published: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 5,
    categoryId: 4,
    categoryName: "Beauty",
    brand: "Neuraé",
    name: "Harmonie Daily Ritual Set",
    slug: "neurae-harmonie-daily-ritual-set",
    description: "A gentle four-step skincare ritual designed to cleanse, treat and replenish. A considered daily routine for rested-looking skin.",
    priceKobo: 8600000,
    previousPriceKobo: 9900000,
    stock: 18,
    lowStockThreshold: 5,
    rating: 48,
    reviewCount: 72,
    imageUrl: resolveAssetUrl("/products/unsplash/5_Neura_Harmonie_The_Serum_Neura_bluemercur.png"),
    gallery: [
      resolveAssetUrl("/products/unsplash/5_Neura_Harmonie_The_Serum_Neura_bluemercur.png"),
      resolveAssetUrl("/products/10_Prompt_Luxury_Face_Serum_Ad_Ultra.png"),
    ],
    colors: [],
    sizes: ["4-piece set"],
    specifications: { Routine: "Cleanse, treat, hydrate", Skin: "All skin types", Origin: "France", Packaging: "Recyclable" },
    featured: false,
    bestSeller: true,
    newArrival: true,
    published: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 6,
    categoryId: 5,
    categoryName: "Accessories",
    brand: "Prince SB",
    name: "Minimalist Steel Watch",
    slug: "prince-minimalist-steel-watch",
    description: "A precise, pared-back timepiece with a clean ivory dial and polished steel bracelet. Quiet enough for every day, sharp enough for evening.",
    priceKobo: 9500000,
    previousPriceKobo: null,
    stock: 3,
    lowStockThreshold: 5,
    rating: 45,
    reviewCount: 41,
    imageUrl: resolveAssetUrl("/products/unsplash/4_Minimalist_3d_Watch_3D_Product_Visualization.png"),
    gallery: [resolveAssetUrl("/products/unsplash/4_Minimalist_3d_Watch_3D_Product_Visualization.png")],
    colors: ["Silver"],
    sizes: ["38 mm", "42 mm"],
    specifications: { Movement: "Quartz", Case: "Stainless steel", Water: "3 ATM", Glass: "Mineral crystal" },
    featured: false,
    bestSeller: false,
    newArrival: true,
    published: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 7,
    categoryId: 2,
    categoryName: "Fashion",
    brand: "Oja Studio",
    name: "Everyday Leather Sneaker",
    slug: "oja-everyday-leather-sneaker",
    description: "Clean white trainers with a supple leather upper and cushioned footbed. A simple foundation for daily uniforms.",
    priceKobo: 7400000,
    previousPriceKobo: 8900000,
    stock: 32,
    lowStockThreshold: 5,
    rating: 47,
    reviewCount: 93,
    imageUrl: resolveAssetUrl("/products/unsplash/2_Shoes_white_background_Images_Free.png"),
    gallery: [resolveAssetUrl("/products/unsplash/2_Shoes_white_background_Images_Free.png")],
    colors: ["White"],
    sizes: ["39", "40", "41", "42", "43", "44"],
    specifications: { Upper: "Leather", Sole: "Rubber", Fit: "True to size", Care: "Wipe clean" },
    featured: false,
    bestSeller: true,
    newArrival: false,
    published: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 8,
    categoryId: 1,
    categoryName: "Electronics",
    brand: "Fujifilm",
    name: "Instax Mini LiPlay+ · Beige",
    slug: "fujifilm-instax-mini-liplay-beige",
    description: "A hybrid instant camera for capturing, editing and printing small memories on the go. Connect your phone to print favourite frames too.",
    priceKobo: 21000000,
    previousPriceKobo: 23500000,
    stock: 9,
    lowStockThreshold: 5,
    rating: 46,
    reviewCount: 28,
    imageUrl: resolveAssetUrl("/products/unsplash/6_Fujifilm_Instax_Mini_LiPlay_Hybrid.png"),
    gallery: [resolveAssetUrl("/products/unsplash/6_Fujifilm_Instax_Mini_LiPlay_Hybrid.png")],
    colors: ["Beige", "Stone White"],
    sizes: [],
    specifications: { Film: "Instax Mini", Connection: "Bluetooth", Features: "Hybrid print", Charging: "USB" },
    featured: true,
    bestSeller: true,
    newArrival: false,
    published: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 9,
    categoryId: 1,
    categoryName: "Electronics",
    brand: "Bang & Olufsen",
    name: "Beosound A1 2nd Gen Speaker · Natural",
    slug: "beosound-a1-portable-speaker",
    description: "A compact waterproof Bluetooth speaker delivering refined 360-degree True360 sound. Features an aluminum dome grille and genuine leather carry strap.",
    priceKobo: 19500000,
    previousPriceKobo: 22000000,
    stock: 12,
    lowStockThreshold: 5,
    rating: 49,
    reviewCount: 42,
    imageUrl: "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80",
    ],
    colors: ["Natural Aluminum", "Anthracite", "Sand"],
    sizes: [],
    specifications: { Battery: "Up to 18 hours", Bluetooth: "5.1 aptX", Waterproof: "IP67 dust & waterproof", Weight: "558 g" },
    featured: true,
    bestSeller: false,
    newArrival: true,
    published: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 10,
    categoryId: 1,
    categoryName: "Electronics",
    brand: "Braun",
    name: "BC21 Wireless Charging Alarm Clock",
    slug: "braun-bc21-digital-clock",
    description: "A quiet, minimalist bedside clock featuring an integrated 10W fast Qi wireless charging pad and an auto-dimming LCD display designed for better sleep.",
    priceKobo: 4800000,
    previousPriceKobo: null,
    stock: 19,
    lowStockThreshold: 5,
    rating: 46,
    reviewCount: 29,
    imageUrl: "https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?auto=format&fit=crop&w=800&q=80",
    gallery: ["https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?auto=format&fit=crop&w=800&q=80"],
    colors: ["Matte Black", "Pure White"],
    sizes: [],
    specifications: { Charging: "10W Qi Fast Charge", Display: "Auto-dimming VA LCD", Power: "USB-C connection", Snooze: "Touch-activated" },
    featured: false,
    bestSeller: true,
    newArrival: false,
    published: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 11,
    categoryId: 2,
    categoryName: "Fashion",
    brand: "Oja Studio",
    name: "Heavyweight Organic Cotton Tee · Chalk",
    slug: "oja-heavyweight-organic-tee",
    description: "Constructed from 240gsm combed organic cotton with a structured relaxed silhouette and double-needle hems. A clean everyday staple.",
    priceKobo: 3200000,
    previousPriceKobo: null,
    stock: 35,
    lowStockThreshold: 5,
    rating: 48,
    reviewCount: 88,
    imageUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80",
    ],
    colors: ["Chalk", "Washed Black", "Olive"],
    sizes: ["S", "M", "L", "XL"],
    specifications: { Fabric: "100% GOTS Certified Cotton", Weight: "240 gsm", Fit: "Relaxed Boxy", Care: "Machine wash cold" },
    featured: false,
    bestSeller: true,
    newArrival: true,
    published: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 12,
    categoryId: 2,
    categoryName: "Fashion",
    brand: "Norse Projects",
    name: "Structured Linen Chore Overshirt",
    slug: "norse-structured-linen-overshirt",
    description: "Spun from breathable European flax linen tailored with ergonomic workwear patch pockets and genuine horn buttons for unhurried layering.",
    priceKobo: 8900000,
    previousPriceKobo: 10500000,
    stock: 14,
    lowStockThreshold: 5,
    rating: 47,
    reviewCount: 31,
    imageUrl: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80",
    gallery: ["https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80"],
    colors: ["Raw Ecru", "Deep Indigo", "Umber"],
    sizes: ["M", "L", "XL"],
    specifications: { Composition: "100% European Flax", Buttons: "Natural horn", Pockets: "3 external patch", Origin: "Portugal" },
    featured: true,
    bestSeller: false,
    newArrival: false,
    published: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 13,
    categoryId: 3,
    categoryName: "Home",
    brand: "Hasami Porcelain",
    name: "Stackable Ceramic Mug & Saucer Set",
    slug: "hasami-porcelain-mug-set",
    description: "Handcrafted in Nagasaki utilizing century-old pottery traditions. Merges natural raw clay and porcelain to create a velvety tactile finish with modular stackability.",
    priceKobo: 3800000,
    previousPriceKobo: null,
    stock: 22,
    lowStockThreshold: 5,
    rating: 49,
    reviewCount: 64,
    imageUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80",
    gallery: ["https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80"],
    colors: ["Gloss Gray", "Natural Clay", "Matte Black"],
    sizes: ["385 ml"],
    specifications: { Origin: "Hasami, Nagasaki, Japan", Material: "Porcelain & raw clay blend", Care: "Dishwasher and microwave safe", Stackable: "Yes" },
    featured: true,
    bestSeller: true,
    newArrival: false,
    published: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 14,
    categoryId: 3,
    categoryName: "Home",
    brand: "Frama",
    name: "Geometric Brass Oil & Incense Burner",
    slug: "frama-brass-incense-burner",
    description: "A sculptural solid cast brass object designed to diffuse botanical essential oils and support standard incense sticks. Develops a distinct personal patina over time.",
    priceKobo: 7200000,
    previousPriceKobo: 8400000,
    stock: 9,
    lowStockThreshold: 5,
    rating: 48,
    reviewCount: 19,
    imageUrl: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80",
    gallery: ["https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80"],
    colors: ["Solid Brass"],
    sizes: [],
    specifications: { Material: "Untreated solid brass", Weight: "420 g", Compatibility: "Essential oils and sticks", Design: "Copenhagen studio" },
    featured: false,
    bestSeller: false,
    newArrival: true,
    published: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 15,
    categoryId: 3,
    categoryName: "Home",
    brand: "Menu / Audo",
    name: "Column Dimmable Cordless Table Lamp",
    slug: "audo-column-cordless-lamp",
    description: "Inspired by ancient architectural bollards, this portable rechargeable lamp radiates warm, inviting ambient light with three-stage touch dimming.",
    priceKobo: 11500000,
    previousPriceKobo: null,
    stock: 8,
    lowStockThreshold: 5,
    rating: 49,
    reviewCount: 37,
    imageUrl: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80",
    gallery: ["https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80"],
    colors: ["Brushed Bronze", "Anodized Aluminum"],
    sizes: [],
    specifications: { Battery: "10 hours on full charge", Dimming: "3-step touch dimmer", Light: "2700K Warm LED", Charging: "Magnetic USB cable" },
    featured: true,
    bestSeller: false,
    newArrival: false,
    published: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 16,
    categoryId: 4,
    categoryName: "Beauty",
    brand: "Aesop",
    name: "Resurrection Aromatique Hand & Body Balm",
    slug: "aesop-resurrection-aromatique-balm",
    description: "A deeply nourishing botanical balm formulated with Mandarin Rind, Rosemary Leaf, and Cedar Atlas to replenish moisture with an aromatic, nongreasy matte finish.",
    priceKobo: 4200000,
    previousPriceKobo: null,
    stock: 26,
    lowStockThreshold: 5,
    rating: 49,
    reviewCount: 110,
    imageUrl: "https://images.unsplash.com/photo-1608248597359-523e19813d11?auto=format&fit=crop&w=800&q=80",
    gallery: ["https://images.unsplash.com/photo-1608248597359-523e19813d11?auto=format&fit=crop&w=800&q=80"],
    colors: [],
    sizes: ["75 ml", "500 ml"],
    specifications: { Aroma: "Citrus, Woody, Herbaceous", Texture: "Concentrated rich cream", "Key Ingredients": "Mandarin, Rosemary, Cedar", Skin: "All skin types" },
    featured: false,
    bestSeller: true,
    newArrival: false,
    published: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 17,
    categoryId: 4,
    categoryName: "Beauty",
    brand: "Oja Apothecary",
    name: "Cold-Pressed Baobab & Marula Body Nectar",
    slug: "oja-baobab-marula-body-nectar",
    description: "Wild-harvested cold-pressed African baobab and marula seed oils enriched with vitamin E. Delivers intense barrier restoration and glowing skin.",
    priceKobo: 3600000,
    previousPriceKobo: 4500000,
    stock: 30,
    lowStockThreshold: 5,
    rating: 48,
    reviewCount: 52,
    imageUrl: "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&w=800&q=80",
    gallery: ["https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&w=800&q=80"],
    colors: [],
    sizes: ["100 ml bottle"],
    specifications: { Ingredients: "100% Wild African Botanicals", Press: "First cold press", Feel: "Silky dry oil", Origin: "Lagos, Nigeria" },
    featured: true,
    bestSeller: false,
    newArrival: true,
    published: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 18,
    categoryId: 5,
    categoryName: "Accessories",
    brand: "Craighill",
    name: "Wilson Solid Brass Keyring & Hook",
    slug: "craighill-wilson-brass-keyring",
    description: "Precision formed from a single continuous piece of 1/8\" hard brass wire. A minimal mechanical accessory that slips smoothly onto belt loops.",
    priceKobo: 2200000,
    previousPriceKobo: null,
    stock: 45,
    lowStockThreshold: 5,
    rating: 47,
    reviewCount: 76,
    imageUrl: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=800&q=80",
    gallery: ["https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=800&q=80"],
    colors: ["Raw Brass", "Black Oxide"],
    sizes: [],
    specifications: { Material: "Solid hard brass wire", Dimensions: "2\" x 1.25\"", Weight: "32 g", Origin: "Brooklyn, NY" },
    featured: false,
    bestSeller: true,
    newArrival: false,
    published: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 19,
    categoryId: 5,
    categoryName: "Accessories",
    brand: "Akila",
    name: "Apollo Bio-Acetate Polarized Sunglasses",
    slug: "akila-apollo-polarized-sunglasses",
    description: "Classic chunky silhouette hand-fashioned from renewable plant-based acetate, fitted with scratch-resistant optical lenses providing 100% UVA/UVB blockage.",
    priceKobo: 9800000,
    previousPriceKobo: 11500000,
    stock: 15,
    lowStockThreshold: 5,
    rating: 48,
    reviewCount: 43,
    imageUrl: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80",
    gallery: ["https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80"],
    colors: ["Amber Tortoise", "Matte Black"],
    sizes: [],
    specifications: { Frame: "Bio-acetate", Lenses: "Polarized CR-39", UV: "100% UV400", Hinges: "5-barrel stainless steel" },
    featured: true,
    bestSeller: false,
    newArrival: true,
    published: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const DEMO_HOMEPAGE_SECTIONS = [
  {
    id: 1,
    type: "hero",
    title: "Good things, chosen well.",
    subtitle: "A tightly curated collection for quieter, better everyday rituals. Free Lagos delivery over ₦150,000.",
    imageUrl: resolveAssetUrl("/products/2_Headphones_product_photography_Photos.png"),
    productIds: [1],
    products: [DEMO_PRODUCTS[0]],
  },
  {
    id: 2,
    type: "categories",
    title: "Shop by category",
    subtitle: "Find your way in",
    productIds: [],
    products: [],
  },
  {
    id: 3,
    type: "products",
    title: "The short list",
    subtitle: "Considered pieces, ready to ship",
    productIds: [1, 2, 3, 4],
    products: DEMO_PRODUCTS.slice(0, 4),
  },
  {
    id: 4,
    type: "promo",
    title: "Better routines start here.",
    subtitle: "Save 15% on selected beauty and everyday essentials with OJA15.",
    imageUrl: resolveAssetUrl("/products/10_Prompt_Luxury_Face_Serum_Ad_Ultra.png"),
    productIds: [5],
    products: [DEMO_PRODUCTS[4]],
  },
  {
    id: 5,
    type: "products",
    title: "Just landed",
    subtitle: "New objects worth knowing about",
    productIds: [9, 10, 11, 12, 13, 14, 15, 16],
    products: DEMO_PRODUCTS.slice(8, 16),
  },
];

// Helper to get storage
function getStorage<T>(key: string, defaultValue: T): T {
  try {
    const val = localStorage.getItem(`oja_${key}`);
    return val ? JSON.parse(val) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setStorage<T>(key: string, val: T): void {
  try {
    localStorage.setItem(`oja_${key}`, JSON.stringify(val));
  } catch {}
}

export function handleClientDemoBatch(pathStr: string, inputParams: Record<string, any>, bodyObj?: any) {
  // Extract procedure names from path (e.g. "catalog.home" or "catalog.home,auth.me")
  const pathPart = pathStr.replace(/^.*\/api\/trpc\/?/, "").split("?")[0];
  const procedures = pathPart.split(",").filter(Boolean);

  const results = procedures.map((proc, index) => {
    // Robust extraction of input payload regardless of batch or superjson wrapper
    const paramItem = inputParams?.[String(index)] ?? (index === 0 ? inputParams : undefined);
    const bodyItem =
      bodyObj?.[String(index)] ??
      (Array.isArray(bodyObj) ? bodyObj[index] : undefined) ??
      (index === 0 ? bodyObj : undefined);
    const raw = paramItem ?? bodyItem;
    let input: any = {};
    if (raw && typeof raw === "object") {
      input = "json" in raw ? raw.json ?? {} : raw;
    }

    // 1. CATALOG PROCEDURES
    if (proc === "catalog.home") {
      return {
        categories: DEMO_CATEGORIES,
        sections: DEMO_HOMEPAGE_SECTIONS,
      };
    }

    if (proc === "catalog.list") {
      let filtered = [...DEMO_PRODUCTS];
      if (input.search) {
        const q = String(input.search).toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.brand.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q)
        );
      }
      if (input.category) {
        filtered = filtered.filter(
          (p) => p.categoryName?.toLowerCase() === input.category.toLowerCase()
        );
      }
      if (input.maxPrice) {
        filtered = filtered.filter((p) => p.priceKobo <= input.maxPrice);
      }
      if (input.minRating) {
        filtered = filtered.filter((p) => p.rating >= input.minRating);
      }
      if (input.inStock) {
        filtered = filtered.filter((p) => p.stock > 0);
      }
      if (input.sort === "price_asc") {
        filtered.sort((a, b) => a.priceKobo - b.priceKobo);
      } else if (input.sort === "price_desc") {
        filtered.sort((a, b) => b.priceKobo - a.priceKobo);
      } else if (input.sort === "rating") {
        filtered.sort((a, b) => b.rating - a.rating);
      } else if (input.sort === "newest") {
        filtered.sort((a, b) => (b.newArrival ? 1 : 0) - (a.newArrival ? 1 : 0));
      }
      return filtered;
    }

    if (proc === "catalog.detail") {
      const prodId = Number(input.id);
      const product = DEMO_PRODUCTS.find((p) => p.id === prodId) ?? DEMO_PRODUCTS[0];
      const related = DEMO_PRODUCTS.filter(
        (p) => p.id !== product.id && p.categoryId === product.categoryId
      );
      return {
        product,
        related: related.length
          ? related
          : DEMO_PRODUCTS.slice(0, 4).filter((p) => p.id !== product.id),
      };
    }

    // 2. AUTH PROCEDURES
    if (proc === "auth.me") {
      const user = getStorage("user", null);
      return user;
    }

    if (proc === "auth.login") {
      const role = input.role ?? "user";
      const name =
        role === "admin"
          ? "Store Administrator"
          : input.email
          ? input.email.split("@")[0]
          : "Amara Okafor";
      const email =
        input.email || (role === "admin" ? "admin@oja.store" : "amara@example.com");
      const user = {
        id: 1,
        unionId: `user-${email.replace(/[^a-zA-Z0-9]/g, "_")}`,
        name,
        email,
        role,
        lastSignInAt: new Date(),
      };
      setStorage("user", user);
      return { success: true, user };
    }

    if (proc === "auth.signup") {
      const user = {
        id: 2,
        unionId: `user-${input.email.replace(/[^a-zA-Z0-9]/g, "_")}`,
        name: input.name,
        email: input.email,
        role: "user",
        lastSignInAt: new Date(),
      };
      setStorage("user", user);
      return { success: true, user };
    }

    if (proc === "auth.logout") {
      setStorage("user", null);
      return { success: true };
    }

    // 3. SHOP PROCEDURES
    if (proc === "shop.cart") {
      const cart = getStorage<any[]>("cart", []);
      return cart;
    }

    if (proc === "shop.addToCart") {
      const cart = getStorage<any[]>("cart", []);
      const prod = DEMO_PRODUCTS.find((p) => p.id === input.productId) ?? DEMO_PRODUCTS[0];
      const existing = cart.find(
        (i) => i.productId === input.productId && i.variant === input.variant
      );
      if (existing) {
        existing.quantity += input.quantity || 1;
      } else {
        cart.push({
          id: Date.now(),
          productId: prod.id,
          product: prod,
          quantity: input.quantity || 1,
          variant: input.variant || "",
          savedForLater: false,
        });
      }
      setStorage("cart", cart);
      return { success: true };
    }

    if (proc === "shop.updateCart" || proc === "shop.updateCartItem") {
      let cart = getStorage<any[]>("cart", []);
      cart = cart.map((item) => (item.id === input.id ? { ...item, ...input } : item));
      setStorage("cart", cart);
      return { success: true };
    }

    if (proc === "shop.removeCart" || proc === "shop.removeCartItem") {
      let cart = getStorage<any[]>("cart", []);
      cart = cart.filter((item) => item.id !== input.id);
      setStorage("cart", cart);
      return { success: true };
    }

    if (proc === "shop.wishlist") {
      const wishlist = getStorage<any[]>("wishlist", []);
      return wishlist;
    }

    if (proc === "shop.toggleWishlist") {
      let wishlist = getStorage<any[]>("wishlist", []);
      const prod = DEMO_PRODUCTS.find((p) => p.id === input.productId) ?? DEMO_PRODUCTS[0];
      const exists = wishlist.some((w) => w.productId === input.productId);
      if (exists) {
        wishlist = wishlist.filter((w) => w.productId !== input.productId);
        setStorage("wishlist", wishlist);
        return { saved: false };
      } else {
        wishlist.push({ id: Date.now(), productId: prod.id, product: prod });
        setStorage("wishlist", wishlist);
        return { saved: true };
      }
    }

    if (proc === "shop.addresses") {
      const addresses = getStorage<any[]>("addresses", [
        {
          id: 1,
          userId: 1,
          label: "Home",
          fullName: "Amara Okafor",
          phone: "+234 803 123 4567",
          line1: "12 Admiralty Way",
          city: "Lekki Phase 1",
          state: "Lagos",
          isDefault: true,
        },
      ]);
      return addresses;
    }

    if (proc === "shop.addAddress") {
      const addresses = getStorage<any[]>("addresses", []);
      const newAddr = {
        id: Date.now(),
        userId: 1,
        ...input,
        isDefault: input.isDefault ?? addresses.length === 0,
      };
      if (newAddr.isDefault) {
        addresses.forEach((a) => (a.isDefault = false));
      }
      addresses.push(newAddr);
      setStorage("addresses", addresses);
      return addresses;
    }

    if (proc === "shop.notifications") {
      return [
        {
          id: 1,
          title: "Welcome to Oja Lagos",
          body: "Thank you for exploring our collection of considered everyday objects.",
          createdAt: new Date(),
          read: false,
        },
      ];
    }

    if (proc === "shop.markNotificationsRead") {
      return { success: true };
    }

    if (proc === "shop.quote") {
      const cart = getStorage<any[]>("cart", []).filter((i) => !i.savedForLater);
      const subtotalKobo = cart.reduce(
        (sum, item) => sum + item.product.priceKobo * item.quantity,
        0
      );
      const deliveryFeeKobo = subtotalKobo >= 15000000 ? 0 : 350000;
      const discountKobo =
        input.coupon === "OJA15" || input.couponCode === "OJA15"
          ? Math.round(subtotalKobo * 0.15)
          : 0;
      const totalKobo = subtotalKobo - discountKobo + deliveryFeeKobo;
      return {
        items: cart,
        subtotalKobo,
        discountKobo,
        deliveryFeeKobo,
        totalKobo,
        couponValid: input.coupon === "OJA15" || input.couponCode === "OJA15",
      };
    }

    if (proc === "shop.placeOrder" || proc === "shop.checkout") {
      const orders = getStorage<any[]>("orders", []);
      const orderNumber = `OJ-${Math.floor(1000 + Math.random() * 9000)}`;
      const cart = getStorage<any[]>("cart", []).filter((i) => !i.savedForLater);
      const subtotalKobo = cart.reduce(
        (sum, item) => sum + item.product.priceKobo * item.quantity,
        0
      );
      const newOrder = {
        id: Date.now(),
        orderNumber,
        status: "processing",
        paymentStatus: "paid",
        paymentMethod: input.paymentMethod || "bank_transfer",
        deliveryMethod: input.deliveryMethod || "standard",
        trackingCode: `TRK-${orderNumber}`,
        createdAt: new Date(),
        subtotalKobo,
        deliveryFeeKobo: subtotalKobo >= 15000000 ? 0 : 350000,
        totalKobo: input.totalKobo || subtotalKobo || 18500000,
        addressSnapshot: input.address || "12 Admiralty Way, Lekki Phase 1, Lagos",
        items: cart.map((i, idx) => ({
          id: idx + 1,
          productId: i.product.id,
          nameSnapshot: i.product.name,
          imageSnapshot: resolveAssetUrl(i.product.imageUrl),
          variant: i.variant || "Standard",
          quantity: i.quantity,
          unitPriceKobo: i.product.priceKobo,
        })),
        events: [
          {
            id: 1,
            status: "pending",
            message: "Order placed. Awaiting bank transfer confirmation.",
            createdAt: new Date(),
          },
        ],
      };
      orders.unshift(newOrder);
      setStorage("orders", orders);
      setStorage("cart", []);
      return { id: newOrder.id, orderNumber };
    }

    if (proc === "shop.orders") {
      const orders = getStorage<any[]>("orders", [
        {
          id: 101,
          orderNumber: "OJ-1048",
          status: "delivered",
          paymentStatus: "paid",
          paymentMethod: "bank_transfer",
          deliveryMethod: "standard",
          trackingCode: "TRK-OJ-1048",
          totalKobo: 18850000,
          createdAt: new Date(Date.now() - 5 * 86400000),
          addressSnapshot: "Amara Okafor · 12 Admiralty Way, Lekki, Lagos",
          items: [
            {
              id: 1,
              productId: DEMO_PRODUCTS[0].id,
              nameSnapshot: DEMO_PRODUCTS[0].name,
              imageSnapshot: DEMO_PRODUCTS[0].imageUrl,
              variant: "Sand",
              quantity: 1,
              unitPriceKobo: DEMO_PRODUCTS[0].priceKobo,
            },
          ],
          events: [
            {
              id: 1,
              status: "delivered",
              message: "Package delivered to concierge.",
              createdAt: new Date(Date.now() - 4 * 86400000),
            },
          ],
        },
      ]);
      return orders;
    }

    if (proc === "shop.cancelOrder") {
      let orders = getStorage<any[]>("orders", []);
      orders = orders.map((o) => (o.id === input.id ? { ...o, status: "cancelled" } : o));
      setStorage("orders", orders);
      return { ok: true };
    }

    if (proc === "shop.reorder") {
      return { ok: true };
    }

    // 4. ADMIN PROCEDURES
    if (proc === "admin.overview") {
      return {
        revenueKobo: 48500000,
        ordersCount: 28,
        customersCount: 142,
        lowStock: DEMO_PRODUCTS.filter((p) => p.stock <= p.lowStockThreshold),
        recent: [
          {
            order: {
              id: 101,
              orderNumber: "OJ-1048",
              status: "delivered",
              paymentStatus: "paid",
              paymentMethod: "bank_transfer",
              totalKobo: 18850000,
              createdAt: new Date(Date.now() - 2 * 86400000),
              items: [
                {
                  id: 1,
                  quantity: 1,
                  nameSnapshot: "Tune 730BT Wireless Headphones",
                  unitPriceKobo: 18500000,
                },
              ],
            },
            customer: "Amara Okafor",
          },
        ],
      };
    }

    if (proc === "admin.customers") {
      return [
        {
          id: 1,
          name: "Amara Okafor",
          email: "amara@example.com",
          role: "user",
          orders: 4,
          spendKobo: 42000000,
          suspended: false,
          createdAt: new Date(),
        },
        {
          id: 2,
          name: "Store Admin",
          email: "admin@oja.store",
          role: "admin",
          orders: 0,
          spendKobo: 0,
          suspended: false,
          createdAt: new Date(),
        },
      ];
    }

    if (proc === "admin.coupons") {
      return [
        {
          id: 1,
          code: "OJA15",
          type: "percent",
          value: 15,
          minPurchaseKobo: 5000000,
          active: true,
          createdAt: new Date(),
        },
      ];
    }

    if (proc === "admin.settings") {
      return [
        { key: "standardDeliveryKobo", value: "350000" },
        { key: "expressDeliveryKobo", value: "750000" },
        { key: "freeDeliveryThresholdKobo", value: "15000000" },
      ];
    }

    if (proc === "admin.orders") {
      return [
        {
          id: 101,
          orderNumber: "OJ-1048",
          customer: "Amara Okafor",
          email: "amara@example.com",
          status: "delivered",
          paymentStatus: "paid",
          paymentMethod: "bank_transfer",
          deliveryMethod: "standard",
          trackingCode: "TRK-OJ-1048",
          subtotalKobo: 18500000,
          deliveryFeeKobo: 350000,
          totalKobo: 18850000,
          addressSnapshot: "Amara Okafor · 12 Admiralty Way, Lekki Phase 1, Lagos",
          createdAt: new Date(Date.now() - 2 * 86400000),
          items: [
            {
              id: 1,
              nameSnapshot: "Tune 730BT Wireless Headphones",
              imageSnapshot: DEMO_PRODUCTS[0].imageUrl,
              variant: "Sand",
              quantity: 1,
              unitPriceKobo: 18500000,
            },
          ],
        },
      ];
    }

    if (proc === "admin.inventory") {
      return DEMO_PRODUCTS.map((p) => ({
        ...p,
        movements: [{ delta: p.stock, reason: "Initial seed", createdAt: new Date() }],
      }));
    }

    if (
      proc === "admin.setCustomerSuspended" ||
      proc === "admin.createCoupon" ||
      proc === "admin.setCouponActive" ||
      proc === "admin.updateSetting" ||
      proc === "admin.updateOrderStatus" ||
      proc === "admin.adjustInventory" ||
      proc === "admin.upsertProduct" ||
      proc === "admin.deleteProduct"
    ) {
      return { ok: true };
    }

    if (proc === "admin.broadcast") {
      return { count: 142 };
    }

    return null;
  });

  const responseBody = results.map((data) => ({
    result: {
      data: superjson.serialize(data),
    },
  }));

  return new Response(JSON.stringify(responseBody), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

