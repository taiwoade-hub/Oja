import { eq } from "drizzle-orm";
import { getDb } from "../api/queries/connection";
import { categories, products, homepageSections, coupons, storeSettings, users } from "./schema";

const img = (name: string) => `/products/unsplash/${name}`;

export async function runSeed() {
  const db = getDb();

  console.log("Checking and seeding Oja catalogue...");
  
  // Ensure categories exist
  const existingCats = await db.select().from(categories);
  if (existingCats.length === 0) {
    await db.insert(categories).values([
      { name: "Electronics", slug: "electronics", position: 1 },
      { name: "Fashion", slug: "fashion", position: 2 },
      { name: "Home", slug: "home", position: 3 },
      { name: "Beauty", slug: "beauty", position: 4 },
      { name: "Accessories", slug: "accessories", position: 5 },
    ]);
  }

  const cats = await db.select().from(categories);
  const categoryId = (slug: string) => cats.find((c) => c.slug === slug)?.id ?? cats[0].id;

  const productList = [
    // 1. JBL Headphones
    {
      categoryId: categoryId("electronics"), brand: "JBL", name: "Tune 730BT Wireless Headphones", slug: "jbl-tune-730bt-headphones",
      description: "Soft, lightweight over-ear headphones with rich bass, a foldable frame and up to 40 hours of listening. Made for focused work and unhurried weekends.",
      priceKobo: 18500000, previousPriceKobo: 22000000, stock: 24, rating: 48, reviewCount: 126,
      imageUrl: img("9_Jbl_Headphone_Tune_730BT_Beige_G.png"), galleryJson: JSON.stringify([img("9_Jbl_Headphone_Tune_730BT_Beige_G.png"), "/products/2_Headphones_product_photography_Photos.png"]),
      colorsJson: JSON.stringify(["Sand", "Black"]), sizesJson: JSON.stringify([]), specificationsJson: JSON.stringify({ Battery: "40 hours", Bluetooth: "5.3", Weight: "220 g", Charging: "USB-C" }),
      featured: true, bestSeller: true, newArrival: true,
    },
    // 2. OM System Camera
    {
      categoryId: categoryId("electronics"), brand: "OM SYSTEM", name: "OM-5 Mark II Camera · Sand", slug: "om-system-om-5-mark-ii-sand",
      description: "A compact, weather-sealed mirrorless camera built for everyday storytelling, with computational photography features and dependable image stabilisation.",
      priceKobo: 145000000, previousPriceKobo: null, stock: 7, rating: 49, reviewCount: 34,
      imageUrl: img("10_OM_SYSTEM_OM_5_Mark_II_Digital_Camera.png"), galleryJson: JSON.stringify([img("10_OM_SYSTEM_OM_5_Mark_II_Digital_Camera.png"), "/products/1_OM_SYSTEM_OM_5_Mark_II_Mirrorless.png"]),
      colorsJson: JSON.stringify(["Sand", "Silver", "Black"]), sizesJson: JSON.stringify([]), specificationsJson: JSON.stringify({ Sensor: "20.4 MP", Mount: "Micro Four Thirds", Stabilisation: "5-axis", Video: "4K" }),
      featured: true, newArrival: true,
    },
    // 3. Troubadour Backpack
    {
      categoryId: categoryId("accessories"), brand: "Troubadour", name: "Generation Leather Backpack", slug: "generation-leather-backpack",
      description: "A refined everyday backpack in smooth black leather. Thoughtful compartments keep work essentials organised without adding bulk.",
      priceKobo: 12800000, previousPriceKobo: 14900000, stock: 11, rating: 47, reviewCount: 58,
      imageUrl: img("8_Generation_Leather_Backpack_Lightweight.png"), galleryJson: JSON.stringify([img("8_Generation_Leather_Backpack_Lightweight.png"), img("1_Ellington_Leather_Backpack_for_Mission.png")]),
      colorsJson: JSON.stringify(["Black", "Cognac"]), sizesJson: JSON.stringify([]), specificationsJson: JSON.stringify({ Material: "Leather", Laptop: "Up to 16 inches", Lining: "Recycled fabric", Warranty: "5 years" }),
      featured: true, bestSeller: true,
    },
    // 4. Fitzgerald Swivel Chair
    {
      categoryId: categoryId("home"), brand: "Fitzgerald", name: "Neutral Fabric Swivel Chair", slug: "fitzgerald-neutral-swivel-chair",
      description: "A softly sculpted dining chair with a natural timber base and smooth swivel motion. Tailored upholstery makes long dinners even better.",
      priceKobo: 31000000, previousPriceKobo: null, stock: 4, lowStockThreshold: 5, rating: 46, reviewCount: 19,
      imageUrl: img("3_Fitzgerald_Neutral_Fabric_Swivel.png"), galleryJson: JSON.stringify([img("3_Fitzgerald_Neutral_Fabric_Swivel.png")]),
      colorsJson: JSON.stringify(["Oat", "Charcoal"]), sizesJson: JSON.stringify([]), specificationsJson: JSON.stringify({ Frame: "Natural oak", Upholstery: "Woven fabric", Motion: "360° swivel", Assembly: "Fully assembled" }),
      featured: true,
    },
    // 5. Neuraé Ritual Set
    {
      categoryId: categoryId("beauty"), brand: "Neuraé", name: "Harmonie Daily Ritual Set", slug: "neurae-harmonie-daily-ritual-set",
      description: "A gentle four-step skincare ritual designed to cleanse, treat and replenish. A considered daily routine for rested-looking skin.",
      priceKobo: 8600000, previousPriceKobo: 9900000, stock: 18, rating: 48, reviewCount: 72,
      imageUrl: img("5_Neura_Harmonie_The_Serum_Neura_bluemercur.png"), galleryJson: JSON.stringify([img("5_Neura_Harmonie_The_Serum_Neura_bluemercur.png"), "/products/10_Prompt_Luxury_Face_Serum_Ad_Ultra.png"]),
      colorsJson: JSON.stringify([]), sizesJson: JSON.stringify(["4-piece set"]), specificationsJson: JSON.stringify({ Routine: "Cleanse, treat, hydrate", Skin: "All skin types", Origin: "France", Packaging: "Recyclable" }),
      bestSeller: true, newArrival: true,
    },
    // 6. Minimalist Steel Watch
    {
      categoryId: categoryId("accessories"), brand: "Prince SB", name: "Minimalist Steel Watch", slug: "prince-minimalist-steel-watch",
      description: "A precise, pared-back timepiece with a clean ivory dial and polished steel bracelet. Quiet enough for every day, sharp enough for evening.",
      priceKobo: 9500000, previousPriceKobo: null, stock: 3, lowStockThreshold: 5, rating: 45, reviewCount: 41,
      imageUrl: img("4_Minimalist_3d_Watch_3D_Product_Visualization.png"), galleryJson: JSON.stringify([img("4_Minimalist_3d_Watch_3D_Product_Visualization.png")]),
      colorsJson: JSON.stringify(["Silver"]), sizesJson: JSON.stringify(["38 mm", "42 mm"]), specificationsJson: JSON.stringify({ Movement: "Quartz", Case: "Stainless steel", Water: "3 ATM", Glass: "Mineral crystal" }),
      newArrival: true,
    },
    // 7. Everyday Leather Sneaker
    {
      categoryId: categoryId("fashion"), brand: "Oja Studio", name: "Everyday Leather Sneaker", slug: "oja-everyday-leather-sneaker",
      description: "Clean white trainers with a supple leather upper and cushioned footbed. A simple foundation for daily uniforms.",
      priceKobo: 7400000, previousPriceKobo: 8900000, stock: 32, rating: 47, reviewCount: 93,
      imageUrl: img("2_Shoes_white_background_Images_Free.png"), galleryJson: JSON.stringify([img("2_Shoes_white_background_Images_Free.png")]),
      colorsJson: JSON.stringify(["White"]), sizesJson: JSON.stringify(["39", "40", "41", "42", "43", "44"]), specificationsJson: JSON.stringify({ Upper: "Leather", Sole: "Rubber", Fit: "True to size", Care: "Wipe clean" }),
      bestSeller: true,
    },
    // 8. Fujifilm Instax Mini
    {
      categoryId: categoryId("electronics"), brand: "Fujifilm", name: "Instax Mini LiPlay+ · Beige", slug: "fujifilm-instax-mini-liplay-beige",
      description: "A hybrid instant camera for capturing, editing and printing small memories on the go. Connect your phone to print favourite frames too.",
      priceKobo: 21000000, previousPriceKobo: 23500000, stock: 9, rating: 46, reviewCount: 28,
      imageUrl: img("6_Fujifilm_Instax_Mini_LiPlay_Hybrid.png"), galleryJson: JSON.stringify([img("6_Fujifilm_Instax_Mini_LiPlay_Hybrid.png")]),
      colorsJson: JSON.stringify(["Beige", "Stone White"]), sizesJson: JSON.stringify([]), specificationsJson: JSON.stringify({ Film: "Instax Mini", Connection: "Bluetooth", Features: "Hybrid print", Charging: "USB" }),
      featured: true, bestSeller: true,
    },

    // --- NEW PRODUCTS ---
    // 9. B&O Portable Speaker
    {
      categoryId: categoryId("electronics"), brand: "Bang & Olufsen", name: "Beosound A1 2nd Gen Speaker · Natural", slug: "beosound-a1-portable-speaker",
      description: "A compact waterproof Bluetooth speaker delivering refined 360-degree True360 sound. Features an aluminum dome grille and genuine leather carry strap.",
      priceKobo: 19500000, previousPriceKobo: 22000000, stock: 12, rating: 49, reviewCount: 42,
      imageUrl: "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80",
      galleryJson: JSON.stringify([
        "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80",
      ]),
      colorsJson: JSON.stringify(["Natural Aluminum", "Anthracite", "Sand"]), sizesJson: JSON.stringify([]),
      specificationsJson: JSON.stringify({ Battery: "Up to 18 hours", Bluetooth: "5.1 aptX", Waterproof: "IP67 dust & waterproof", Weight: "558 g" }),
      featured: true, newArrival: true,
    },
    // 10. Braun Alarm Clock
    {
      categoryId: categoryId("electronics"), brand: "Braun", name: "BC21 Wireless Charging Alarm Clock", slug: "braun-bc21-digital-clock",
      description: "A quiet, minimalist bedside clock featuring an integrated 10W fast Qi wireless charging pad and an auto-dimming LCD display designed for better sleep.",
      priceKobo: 4800000, previousPriceKobo: null, stock: 19, rating: 46, reviewCount: 29,
      imageUrl: "https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?auto=format&fit=crop&w=800&q=80",
      galleryJson: JSON.stringify([
        "https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?auto=format&fit=crop&w=800&q=80",
      ]),
      colorsJson: JSON.stringify(["Matte Black", "Pure White"]), sizesJson: JSON.stringify([]),
      specificationsJson: JSON.stringify({ Charging: "10W Qi Fast Charge", Display: "Auto-dimming VA LCD", Power: "USB-C connection", Snooze: "Touch-activated" }),
      bestSeller: true,
    },
    // 11. Heavyweight Organic Cotton Tee
    {
      categoryId: categoryId("fashion"), brand: "Oja Studio", name: "Heavyweight Organic Cotton Tee · Chalk", slug: "oja-heavyweight-organic-tee",
      description: "Constructed from 240gsm combed organic cotton with a structured relaxed silhouette and double-needle hems. A clean everyday staple.",
      priceKobo: 3200000, previousPriceKobo: null, stock: 35, rating: 48, reviewCount: 88,
      imageUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80",
      galleryJson: JSON.stringify([
        "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80",
      ]),
      colorsJson: JSON.stringify(["Chalk", "Washed Black", "Olive"]), sizesJson: JSON.stringify(["S", "M", "L", "XL"]),
      specificationsJson: JSON.stringify({ Fabric: "100% GOTS Certified Cotton", Weight: "240 gsm", Fit: "Relaxed Boxy", Care: "Machine wash cold" }),
      bestSeller: true, newArrival: true,
    },
    // 12. Linen Chore Overshirt
    {
      categoryId: categoryId("fashion"), brand: "Norse Projects", name: "Structured Linen Chore Overshirt", slug: "norse-structured-linen-overshirt",
      description: "Spun from breathable European flax linen tailored with ergonomic workwear patch pockets and genuine horn buttons for unhurried layering.",
      priceKobo: 8900000, previousPriceKobo: 10500000, stock: 14, rating: 47, reviewCount: 31,
      imageUrl: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80",
      galleryJson: JSON.stringify([
        "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80",
      ]),
      colorsJson: JSON.stringify(["Raw Ecru", "Deep Indigo", "Umber"]), sizesJson: JSON.stringify(["M", "L", "XL"]),
      specificationsJson: JSON.stringify({ Composition: "100% European Flax", Buttons: "Natural horn", Pockets: "3 external patch", Origin: "Portugal" }),
      featured: true,
    },
    // 13. Hasami Porcelain Mug & Saucer Set
    {
      categoryId: categoryId("home"), brand: "Hasami Porcelain", name: "Stackable Ceramic Mug & Saucer Set", slug: "hasami-porcelain-mug-set",
      description: "Handcrafted in Nagasaki utilizing century-old pottery traditions. Merges natural raw clay and porcelain to create a velvety tactile finish with modular stackability.",
      priceKobo: 3800000, previousPriceKobo: null, stock: 22, rating: 49, reviewCount: 64,
      imageUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80",
      galleryJson: JSON.stringify([
        "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80",
      ]),
      colorsJson: JSON.stringify(["Gloss Gray", "Natural Clay", "Matte Black"]), sizesJson: JSON.stringify(["385 ml"]),
      specificationsJson: JSON.stringify({ Origin: "Hasami, Nagasaki, Japan", Material: "Porcelain & raw clay blend", Care: "Dishwasher and microwave safe", Stackable: "Yes" }),
      featured: true, bestSeller: true,
    },
    // 14. Brass Incense Burner
    {
      categoryId: categoryId("home"), brand: "Frama", name: "Geometric Brass Oil & Incense Burner", slug: "frama-brass-incense-burner",
      description: "A sculptural solid cast brass object designed to diffuse botanical essential oils and support standard incense sticks. Develops a distinct personal patina over time.",
      priceKobo: 7200000, previousPriceKobo: 8400000, stock: 9, rating: 48, reviewCount: 19,
      imageUrl: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80",
      galleryJson: JSON.stringify([
        "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80",
      ]),
      colorsJson: JSON.stringify(["Solid Brass"]), sizesJson: JSON.stringify([]),
      specificationsJson: JSON.stringify({ Material: "Untreated solid brass", Weight: "420 g", Compatibility: "Essential oils and sticks", Design: "Copenhagen studio" }),
      newArrival: true,
    },
    // 15. Menu Dimmable Cordless Table Lamp
    {
      categoryId: categoryId("home"), brand: "Menu / Audo", name: "Column Dimmable Cordless Table Lamp", slug: "audo-column-cordless-lamp",
      description: "Inspired by ancient architectural bollards, this portable rechargeable lamp radiates warm, inviting ambient light with three-stage touch dimming.",
      priceKobo: 11500000, previousPriceKobo: null, stock: 8, rating: 49, reviewCount: 37,
      imageUrl: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80",
      galleryJson: JSON.stringify([
        "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80",
      ]),
      colorsJson: JSON.stringify(["Brushed Bronze", "Anodized Aluminum"]), sizesJson: JSON.stringify([]),
      specificationsJson: JSON.stringify({ Battery: "10 hours on full charge", Dimming: "3-step touch dimmer", Light: "2700K Warm LED", Charging: "Magnetic USB cable" }),
      featured: true,
    },
    // 16. Aesop Resurrection Aromatique Balm
    {
      categoryId: categoryId("beauty"), brand: "Aesop", name: "Resurrection Aromatique Hand & Body Balm", slug: "aesop-resurrection-aromatique-balm",
      description: "A deeply nourishing botanical balm formulated with Mandarin Rind, Rosemary Leaf, and Cedar Atlas to replenish moisture with an aromatic, nongreasy matte finish.",
      priceKobo: 4200000, previousPriceKobo: null, stock: 26, rating: 49, reviewCount: 110,
      imageUrl: "https://images.unsplash.com/photo-1608248597359-523e19813d11?auto=format&fit=crop&w=800&q=80",
      galleryJson: JSON.stringify([
        "https://images.unsplash.com/photo-1608248597359-523e19813d11?auto=format&fit=crop&w=800&q=80",
      ]),
      colorsJson: JSON.stringify([]), sizesJson: JSON.stringify(["75 ml", "500 ml"]),
      specificationsJson: JSON.stringify({ Aroma: "Citrus, Woody, Herbaceous", Texture: "Concentrated rich cream", "Key Ingredients": "Mandarin, Rosemary, Cedar", Skin: "All skin types" }),
      bestSeller: true,
    },
    // 17. Oja Baobab & Marula Body Nectar
    {
      categoryId: categoryId("beauty"), brand: "Oja Apothecary", name: "Cold-Pressed Baobab & Marula Body Nectar", slug: "oja-baobab-marula-body-nectar",
      description: "Wild-harvested cold-pressed African baobab and marula seed oils enriched with vitamin E. Delivers intense barrier restoration and glowing skin.",
      priceKobo: 3600000, previousPriceKobo: 4500000, stock: 30, rating: 48, reviewCount: 52,
      imageUrl: "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&w=800&q=80",
      galleryJson: JSON.stringify([
        "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&w=800&q=80",
      ]),
      colorsJson: JSON.stringify([]), sizesJson: JSON.stringify(["100 ml bottle"]),
      specificationsJson: JSON.stringify({ Ingredients: "100% Wild African Botanicals", Press: "First cold press", Feel: "Silky dry oil", Origin: "Lagos, Nigeria" }),
      featured: true, newArrival: true,
    },
    // 18. Craighill Solid Brass Keyring
    {
      categoryId: categoryId("accessories"), brand: "Craighill", name: "Wilson Solid Brass Keyring & Hook", slug: "craighill-wilson-brass-keyring",
      description: "Precision formed from a single continuous piece of 1/8\" hard brass wire. A minimal mechanical accessory that slips smoothly onto belt loops.",
      priceKobo: 2200000, previousPriceKobo: null, stock: 45, rating: 47, reviewCount: 76,
      imageUrl: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=800&q=80",
      galleryJson: JSON.stringify([
        "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=800&q=80",
      ]),
      colorsJson: JSON.stringify(["Raw Brass", "Black Oxide"]), sizesJson: JSON.stringify([]),
      specificationsJson: JSON.stringify({ Material: "Solid hard brass wire", Dimensions: "2\" x 1.25\"", Weight: "32 g", Origin: "Brooklyn, NY" }),
      bestSeller: true,
    },
    // 19. Akila Polarized Sunglasses
    {
      categoryId: categoryId("accessories"), brand: "Akila", name: "Apollo Bio-Acetate Polarized Sunglasses", slug: "akila-apollo-polarized-sunglasses",
      description: "Classic chunky silhouette hand-fashioned from renewable plant-based acetate, fitted with scratch-resistant optical lenses providing 100% UVA/UVB blockage.",
      priceKobo: 9800000, previousPriceKobo: 11500000, stock: 15, rating: 48, reviewCount: 43,
      imageUrl: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80",
      galleryJson: JSON.stringify([
        "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80",
      ]),
      colorsJson: JSON.stringify(["Amber Tortoise", "Matte Black"]), sizesJson: JSON.stringify([]),
      specificationsJson: JSON.stringify({ Frame: "Bio-acetate", Lenses: "Polarized CR-39", UV: "100% UV400", Hinges: "5-barrel stainless steel" }),
      featured: true, newArrival: true,
    },
  ];

  // Insert or update products
  for (const item of productList) {
    const existingProd = await db.select().from(products).where(eq(products.slug, item.slug)).limit(1);
    if (existingProd.length === 0) {
      console.log(`Adding new product: ${item.name}`);
      await db.insert(products).values(item);
    }
  }

  const allProducts = await db.select().from(products);
  const id = (slug: string) => allProducts.find((p) => p.slug === slug)?.id ?? allProducts[0].id;

  // Check homepage sections
  const existingSections = await db.select().from(homepageSections);
  if (existingSections.length === 0) {
    await db.insert(homepageSections).values([
      { type: "hero", title: "Good things, chosen well.", subtitle: "A tightly curated collection for quieter, better everyday rituals. Free Lagos delivery over ₦150,000.", imageUrl: "/products/2_Headphones_product_photography_Photos.png", productIdsJson: JSON.stringify([id("jbl-tune-730bt-headphones")]), position: 1 },
      { type: "categories", title: "Shop by category", subtitle: "Find your way in", productIdsJson: "[]", position: 2 },
      { type: "products", title: "The short list", subtitle: "Considered pieces, ready to ship", productIdsJson: JSON.stringify(allProducts.slice(0, 4).map((p) => p.id)), position: 3 },
      { type: "promo", title: "Better routines start here.", subtitle: "Save 15% on selected beauty and everyday essentials with OJA15.", imageUrl: "/products/10_Prompt_Luxury_Face_Serum_Ad_Ultra.png", productIdsJson: JSON.stringify([id("neurae-harmonie-daily-ritual-set")]), position: 4 },
      { type: "products", title: "Just landed", subtitle: "New objects worth knowing about", productIdsJson: JSON.stringify(allProducts.slice(4, 12).map((p) => p.id)), position: 5 },
    ]);
  } else {
    // Update "Just landed" section with more products
    const landedSection = existingSections.find((s) => s.title === "Just landed");
    if (landedSection) {
      const topIds = allProducts.slice(4, 12).map((p) => p.id);
      await db.update(homepageSections).set({ productIdsJson: JSON.stringify(topIds) }).where(eq(homepageSections.id, landedSection.id));
    }
  }

  // Ensure default coupons and settings
  const existingCoupons = await db.select().from(coupons);
  if (existingCoupons.length === 0) {
    await db.insert(coupons).values({ code: "OJA15", type: "percent", value: 15, minPurchaseKobo: 5000000, active: true });
  }

  const existingSettings = await db.select().from(storeSettings);
  if (existingSettings.length === 0) {
    await db.insert(storeSettings).values([
      { key: "storeName", value: "Oja" }, { key: "currency", value: "NGN" },
      { key: "standardDeliveryKobo", value: "350000" }, { key: "expressDeliveryKobo", value: "750000" },
      { key: "freeDeliveryThresholdKobo", value: "15000000" }, { key: "supportEmail", value: "hello@oja.store" },
    ]);
  }

  // Ensure users
  const existingUsers = await db.select().from(users);
  if (existingUsers.length === 0) {
    await db.insert(users).values([
      { unionId: "seed-customer-amara", name: "Amara Okafor", email: "amara@example.com", role: "user" },
      { unionId: "seed-admin", name: "Store Administrator", email: "admin@oja.store", role: "admin" },
    ]);
  }

  console.log(`Oja catalogue active with ${allProducts.length} curated products.`);
}

if (process.argv[1]?.includes("seed.ts") || import.meta.url.endsWith(process.argv[1] || "")) {
  runSeed().catch((error) => { console.error(error); process.exit(1); });
}
