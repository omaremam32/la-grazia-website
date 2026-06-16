import React, { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { Analytics } from "@vercel/analytics/react";
import { createClient, type Session } from "@supabase/supabase-js";

type Lang = "EN" | "AR";

type Product = {
  id?: string;
  name: string;
  price: string;
  minPrice: number;
  category: string;
  image: string;
  frontImage?: string;
  modelImage?: string;
  backImage?: string;
  tag: string;
  occasion: string;
  colors: string[];
  complete: string[];
  description: string;
  isActive?: boolean;
  sortOrder?: number;
};

type ProductImageInput = {
  name: string;
  image: string;
  frontImage?: string;
  modelImage?: string;
  backImage?: string;
};

type CartItem = {
  product: Product;
  size: string;
  color: string;
  quantity: number;
};

type AccountUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  isAdmin?: boolean;
  addressLine?: string;
  city?: string;
  area?: string;
  building?: string;
  floor?: string;
  apartment?: string;
  deliveryNotes?: string;
};

type AccountAddress = {
  id: string;
  user_id: string;
  label: string | null;
  full_name: string | null;
  phone: string | null;
  city: string | null;
  area: string | null;
  street: string | null;
  building: string | null;
  floor: string | null;
  apartment: string | null;
  delivery_notes: string | null;
  is_default: boolean;
  created_at?: string | null;
};

type AddressForm = {
  label: string;
  fullName: string;
  phone: string;
  city: string;
  area: string;
  street: string;
  building: string;
  floor: string;
  apartment: string;
  deliveryNotes: string;
  isDefault: boolean;
};

type AccountOrderItem = {
  id: string;
  product_name: string;
  product_image?: string | null;
  size?: string | null;
  color?: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
};

type AccountOrder = {
  id: string;
  order_reference: string;
  total_amount: number;
  currency: string;
  payment_status: string;
  order_status: string;
  created_at: string;
  customer_name?: string | null;
  customer_email?: string | null;
  customer_phone?: string | null;
  order_items?: AccountOrderItem[];
};

type AdminOrder = AccountOrder & {
  user_id?: string | null;
};


type ProductRow = {
  id: string;
  name: string;
  price: string;
  min_price: number;
  category: string;
  image: string;
  tag: string | null;
  occasion: string | null;
  colors: string[] | null;
  complete: string[] | null;
  description: string | null;
  is_active: boolean;
  sort_order: number | null;
};

type ProductForm = {
  name: string;
  price: string;
  minPrice: string;
  category: string;
  image: string;
  tag: string;
  occasion: string;
  colors: string;
  complete: string;
  description: string;
  isActive: boolean;
  sortOrder: string;
};

type ProductReview = {
  id: string;
  user_id?: string | null;
  product_name: string;
  rating: number;
  review_text: string;
  customer_name?: string | null;
  customer_email?: string | null;
  is_approved: boolean;
  created_at: string;
};

type ReviewForm = {
  rating: number;
  reviewText: string;
};

type SupportMessage = {
  id: string;
  user_id?: string | null;
  customer_name?: string | null;
  customer_email?: string | null;
  customer_phone?: string | null;
  subject: string;
  message: string;
  related_order_reference?: string | null;
  related_product_name?: string | null;
  status: string;
  admin_note?: string | null;
  created_at: string;
};

type SupportForm = {
  subject: string;
  message: string;
  relatedOrderReference: string;
  relatedProductName: string;
};

const WHATSAPP_NUMBER = "201101900086";
const BRAND_EMAIL = "omaromohamed2003@gmail.com";

// Real launch countdown target. Change this date/time whenever you want to change the official launch moment.
// Redone countdown: 30-day launch countdown ending on 5 July 2026 at 11:59 PM Egypt time.
const LAUNCH_DATE_ISO = "2026-07-05T23:59:59+03:00";
const COUNTDOWN_SECOND = 1000;
const COUNTDOWN_MINUTE = COUNTDOWN_SECOND * 60;
const COUNTDOWN_HOUR = COUNTDOWN_MINUTE * 60;
const COUNTDOWN_DAY = COUNTDOWN_HOUR * 24;

type LaunchCountdown = {
  total: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isFinished: boolean;
};

function getLaunchCountdown(): LaunchCountdown {
  const total = Math.max(0, new Date(LAUNCH_DATE_ISO).getTime() - Date.now());

  return {
    total,
    days: Math.floor(total / COUNTDOWN_DAY),
    hours: Math.floor((total % COUNTDOWN_DAY) / COUNTDOWN_HOUR),
    minutes: Math.floor((total % COUNTDOWN_HOUR) / COUNTDOWN_MINUTE),
    seconds: Math.floor((total % COUNTDOWN_MINUTE) / COUNTDOWN_SECOND),
    isFinished: total <= 0,
  };
}

const ADMIN_EMAILS = ["omaromohamed2003@gmail.com", "yazedhani28@gmail.com"].map((email) =>
  email.trim().toLowerCase()
);

const LAGRAZIA_AUTH_STORAGE_KEY = "lagrazia-supabase-auth-v4";
const LAGRAZIA_OFFER_STORAGE_KEY = "lagrazia-private-offer-v4";
const LAGRAZIA_OFFER_DISMISS_STORAGE_KEY = "lagrazia-private-offer-dismissed-v5";
const PRIVATE_OFFER_CODE = "GRAZIA10";

type PrivateOfferStatus = "unknown" | "unclaimed" | "claimed" | "redeemed" | "used" | "error";

type PrivateOfferApiResponse = {
  ok?: boolean;
  status?: PrivateOfferStatus;
  canUse?: boolean;
  message?: string;
  error?: string;
};

function clearOldSupabaseAuthStorage() {
  if (typeof window === "undefined") return;

  const removeMatchingKeys = (storage: Storage) => {
    Object.keys(storage).forEach((key) => {
      const normalizedKey = key.toLowerCase();

      if (
        key !== LAGRAZIA_AUTH_STORAGE_KEY &&
        (key.startsWith("sb-") || normalizedKey.includes("supabase"))
      ) {
        storage.removeItem(key);
      }
    });
  };

  removeMatchingKeys(window.localStorage);
  removeMatchingKeys(window.sessionStorage);
}

if (typeof window !== "undefined" && !window.localStorage.getItem(LAGRAZIA_AUTH_STORAGE_KEY)) {
  clearOldSupabaseAuthStorage();
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

const supabase =
  SUPABASE_URL && SUPABASE_ANON_KEY
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          storageKey: LAGRAZIA_AUTH_STORAGE_KEY,
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          flowType: "pkce",
          storage: typeof window !== "undefined" ? window.localStorage : undefined,
        },
      })
    : null;

if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}

const emptyAddressForm: AddressForm = {
  label: "Home",
  fullName: "",
  phone: "",
  city: "Cairo",
  area: "",
  street: "",
  building: "",
  floor: "",
  apartment: "",
  deliveryNotes: "",
  isDefault: true,
};


const emptyProductForm: ProductForm = {
  name: "",
  price: "EGP 0",
  minPrice: "0",
  category: "Tops",
  image: "/photos/jacket-1-front.jpeg",
  tag: "New Arrival",
  occasion: "Everyday Chic",
  colors: "Cream, Champagne",
  complete: "Capri Long Tailored Jorts, La Grazia Silk Scarf",
  description: "",
  isActive: true,
  sortOrder: "0",
};

const emptySupportForm: SupportForm = {
  subject: "Pre-Order Question",
  message: "",
  relatedOrderReference: "",
  relatedProductName: "",
};

const products: Product[] = [
  {
    name: "Atelier Wrap Jacket",
    price: "EGP 2450",
    minPrice: 2450,
    category: "Jackets",
    image: "/photos/jacket-1-front.jpeg",
    frontImage: "/photos/jacket-1-front.jpeg",
    modelImage: "/photos/jacket-1-model.jpeg",
    backImage: "/photos/jacket-1-back.jpeg",
    tag: "Signature Jacket",
    occasion: "Dinner / Events / Elegant Daywear",
    colors: ["Cream"],
    complete: ["Atelier Drape Top", "Atelier Palazzo Pants", "La Grazia Silk Scarf", "Gold accessories"],
    description:
      "A sculpted wrap jacket with an asymmetric front, removable tie belt, soft contrast piping, and signature gold LG hardware. Designed as a refined La Grazia statement jacket with timeless Italian elegance.",
  },
  {
    name: "Milano Spirit Jacket",
    price: "EGP 2,570",
    minPrice: 2570,
    category: "Jackets",
    image: "/photos/jacket-2-front.jpeg",
    frontImage: "/photos/jacket-2-front.jpeg",
    modelImage: "/photos/jacket-2-model.jpeg",
    backImage: "/photos/jacket-2-back.jpeg",
    tag: "Statement Jacket",
    occasion: "Weekend / City Walk / Spring Edit",
    colors: ["Cream Print"],
    complete: ["Atelier Soft Polo Top", "Atelier Capri Long Tailored Jorts", "La Grazia Silk Scarf", "White wide-leg denim"],
    description:
      "A lightweight Italian-print jacket with floral panels, contrast piping, refined zipper details, and La Grazia embroidery. A youthful statement piece that keeps the brand elegant, feminine, and wearable.",
  },
  {
    name: "Atelier Soft Polo Top",
    price: "EGP 1,220",
    minPrice: 1220,
    category: "Tops",
    image: "/photos/top-1-front.jpeg",
    frontImage: "/photos/top-1-front.jpeg",
    modelImage: "/photos/top-1-model.jpeg",
    backImage: "/photos/top-1-back.jpeg",
    tag: "Daily Essential",
    occasion: "Daily Wear / University / Cafe",
    colors: ["Soft Blue"],
    complete: ["Atelier Capri Long Tailored Jorts", "Atelier Palazzo Pants", "La Grazia Silk Scarf", "Mini leather bag"],
    description:
      "A daily wearable soft polo top with a contrast collar, refined gold buttons, a fitted feminine shape, and subtle LG detail. Created to be easy for teenagers and women to wear every day.",
  },
  {
    name: "Atelier Drape Top",
    price: "EGP 1250",
    minPrice: 1250,
    category: "Tops",
    image: "/photos/top-2-front.jpeg",
    frontImage: "/photos/top-2-front.jpeg",
    modelImage: "/photos/top-2-model.jpeg",
    backImage: "/photos/top-2-back.jpeg",
    tag: "Soft Luxury",
    occasion: "Dinner / Brunch / Smart Casual",
    colors: ["Cream"],
    complete: ["Atelier Palazzo Pants", "Atelier Wrap Jacket", "La Grazia Silk Scarf", "Gold hoops"],
    description:
      "A refined drape top with a soft cowl neckline, gold crest button, cap sleeves, and signature LG monogram. It gives the collection a luxurious feminine top for polished styling.",
  },
  {
    name: "Atelier Contrast Collar Top",
    price: "EGP 1240",
    minPrice: 1240,
    category: "Tops",
    image: "/photos/top-3-front.jpeg",
    frontImage: "/photos/top-3-front.jpeg",
    modelImage: "/photos/top-3-model.jpeg",
    backImage: "/photos/top-3-back.jpeg",
    tag: "Daily Essential",
    occasion: "Daily Chic / Lunch / University",
    colors: ["Dusty Blue"],
    complete: ["Atelier Celeste Wrap Pants", "Atelier Riviera Tailored Jorts", "La Grazia Silk Scarf", "Gold jewelry"],
    description:
      "A closed contrast-collar top with a soft structured fit, short sleeves, and signature LG monogram. A youthful elegant piece that still feels premium and easy to style.",
  },
  {
    name: "Atelier Palazzo Pants",
    price: "EGP 1550",
    minPrice: 1550,
    category: "Pants",
    image: "/photos/pants-1-front.jpeg",
    frontImage: "/photos/pants-1-front.jpeg",
    modelImage: "/photos/pants-1-model.jpeg",
    backImage: "/photos/pants-1-back.jpeg",
    tag: "Elegant Tailoring",
    occasion: "Work / Dinner / City Chic",
    colors: ["Stone Beige"],
    complete: ["Atelier Soft Polo Top", "Atelier Wrap Jacket", "La Grazia Silk Scarf", "Structured mini bag"],
    description:
      "A high-waisted palazzo pant with a fluid wide-leg silhouette, front pleats, premium Italian-inspired fabric, and signature gold LG hardware. Elegant, clean, and timeless.",
  },
  {
    name: "Atelier Celeste Wrap Pants",
    price: "EGP 1799",
    minPrice: 1799,
    category: "Pants",
    image: "/photos/pants-2-front.jpeg",
    frontImage: "/photos/pants-2-front.jpeg",
    modelImage: "/photos/pants-2-model.jpeg",
    backImage: "/photos/pants-2-back.jpeg",
    tag: "Elegant Tailoring",
    occasion: "Events / Dinner / Smart Casual",
    colors: ["Dusty Blue"],
    complete: ["Atelier Contrast Collar Top", "Atelier Wrap Jacket", "La Grazia Silk Scarf", "Nude heels"],
    description:
      "A luxury wrap pant with an asymmetric crossover waistband, sculpted draped panel, soft front pleats, and fluid wide-leg movement. A unique La Grazia statement pant.",
  },
  {
    name: "Atelier Low-Waist Linen Pants",
    price: "EGP 1550",
    minPrice: 1550,
    category: "Pants",
    image: "/photos/low-waisted-linen-pants-front.png",
    frontImage: "/photos/low-waisted-linen-pants-front.png",
    modelImage: "/photos/low-waisted-linen-pants-model.png",
    backImage: "/photos/low-waisted-linen-pants-back.png",
    tag: "New Arrival",
    occasion: "Everyday Chic",
    colors: ["Ivory Beige"],
    complete: ["Atelier Soft Polo Top", "La Grazia Silk Scarf", "Atelier Wrap Jacket"],
    description:
      "The Atelier Low-Waist Linen Pants are crafted from a breathable premium linen blend with a relaxed wide-leg silhouette, soft front pleats, and a refined low-waist fit finished with signature gold LG hardware. Designed to pair perfectly with La Grazia Milano polo tops, scarves, and tailored jackets.",
  },
  {
    name: "La Grazia Silk Scarf",
    price: "EGP 669",
    minPrice: 669,
    category: "Scarves",
    image: "/photos/scarf-1-front.png",
    frontImage: "/photos/scarf-1-front.png",
    modelImage: "/photos/scarf-1-model.png",
    backImage: "/photos/scarf-1-back.png",
    tag: "Classic Accessory",
    occasion: "Styling / Gift / Soft Luxury",
    colors: ["Navy", "Cream"],
    complete: ["Atelier Soft Polo Top", "Atelier Wrap Jacket", "Atelier Capri Long Tailored Jorts", "Atelier Drape Top"],
    description:
      "A silk-touch scarf available in two refined La Grazia colorways: Navy and Cream. Finished with an elegant botanical motif, premium border detailing, and luxury packaging. Designed for neck styling, hair styling, bag accents, and shoulder draping.",
  },
  {
    name: "Atelier Riviera Tailored Jorts",
    price: "EGP 1400",
    minPrice: 1400,
    category: "Jorts",
    image: "/photos/jorts-1-front.png",
    frontImage: "/photos/jorts-1-front.png",
    modelImage: "/photos/jorts-1-model.png",
    backImage: "/photos/jorts-1-back.png",
    tag: "Hero Product",
    occasion: "Summer / Resort / Daily Luxury",
    colors: ["Cream"],
    complete: ["Atelier Drape Top", "Milano Spirit Jacket", "La Grazia Silk Scarf", "Gold sandals"],
    description:
      "A high-waisted tailored jort with sculpted pleats, a refined longline length, cuffed hem, premium cotton-linen texture, and signature LG hardware. A luxury reimagining of everyday jorts.",
  },
  {
    name: "Atelier Capri Long Tailored Jorts",
    price: "EGP 1450",
    minPrice: 1450,
    category: "Jorts",
    image: "/photos/jorts-2-front.png",
    frontImage: "/photos/jorts-2-front.png",
    modelImage: "/photos/jorts-2-model.png",
    backImage: "/photos/jorts-2-back.png",
    tag: "Hero Product",
    occasion: "Coastal Chic / Summer / Signature Look",
    colors: ["Cream"],
    complete: ["Atelier Soft Polo Top", "Atelier Wrap Jacket", "La Grazia Silk Scarf", "Mini LG bag"],
    description:
      "The signature La Grazia long tailored jort. Longer knee-grazing length, high waist, soft pleats, cuffed hem, gold LG hardware, and an embroidered crest detail for timeless Italian coastal elegance.",
  },
];

const PRODUCT_FRONT_IMAGES: Record<string, string> = {
  "Atelier Wrap Jacket": "/photos/jacket-1-front.jpeg",
  "Milano Spirit Jacket": "/photos/jacket-2-front.jpeg",
  "Atelier Soft Polo Top": "/photos/top-1-front.jpeg",
  "Atelier Drape Top": "/photos/top-2-front.jpeg",
  "Atelier Contrast Collar Top": "/photos/top-3-front.jpeg",
  "Atelier Palazzo Pants": "/photos/pants-1-front.jpeg",
  "Atelier Celeste Wrap Pants": "/photos/pants-2-front.jpeg",
  "Atelier Low-Waist Linen Pants": "/photos/low-waisted-linen-pants-front.png",
  "La Grazia Silk Scarf": "/photos/scarf-1-front.png",
  "Atelier Riviera Tailored Jorts": "/photos/jorts-1-front.png",
  "Atelier Capri Long Tailored Jorts": "/photos/jorts-2-front.png",};

const PRODUCT_MODEL_IMAGES: Record<string, string> = {
  "Atelier Wrap Jacket": "/photos/jacket-1-model.jpeg",
  "Milano Spirit Jacket": "/photos/jacket-2-model.jpeg",
  "Atelier Soft Polo Top": "/photos/top-1-model.jpeg",
  "Atelier Drape Top": "/photos/top-2-model.jpeg",
  "Atelier Contrast Collar Top": "/photos/top-3-model.jpeg",
  "Atelier Palazzo Pants": "/photos/pants-1-model.jpeg",
  "Atelier Celeste Wrap Pants": "/photos/pants-2-model.jpeg",
  "Atelier Low-Waist Linen Pants": "/photos/low-waisted-linen-pants-model.png",
  "La Grazia Silk Scarf": "/photos/scarf-1-model.png",
  "Atelier Riviera Tailored Jorts": "/photos/jorts-1-model.png",
  "Atelier Capri Long Tailored Jorts": "/photos/jorts-2-model.png",};

const PRODUCT_BACK_IMAGES: Record<string, string> = {
  "Atelier Wrap Jacket": "/photos/jacket-1-back.jpeg",
  "Milano Spirit Jacket": "/photos/jacket-2-back.jpeg",
  "Atelier Soft Polo Top": "/photos/top-1-back.jpeg",
  "Atelier Drape Top": "/photos/top-2-back.jpeg",
  "Atelier Contrast Collar Top": "/photos/top-3-back.jpeg",
  "Atelier Palazzo Pants": "/photos/pants-1-back.jpeg",
  "Atelier Celeste Wrap Pants": "/photos/pants-2-back.jpeg",
  "Atelier Low-Waist Linen Pants": "/photos/low-waisted-linen-pants-back.png",
  "La Grazia Silk Scarf": "/photos/scarf-1-back.png",
  "Atelier Riviera Tailored Jorts": "/photos/jorts-1-back.png",
  "Atelier Capri Long Tailored Jorts": "/photos/jorts-2-back.png",};


type ProductImageView = "front" | "model" | "back";

function normalizeProductNameForImages(name: string) {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

function mapByNormalizedName(source: Record<string, string>) {
  return Object.fromEntries(
    Object.entries(source).map(([name, image]) => [normalizeProductNameForImages(name), image])
  ) as Record<string, string>;
}

const PRODUCT_FRONT_IMAGES_NORMALIZED = mapByNormalizedName(PRODUCT_FRONT_IMAGES);
const PRODUCT_MODEL_IMAGES_NORMALIZED = mapByNormalizedName(PRODUCT_MODEL_IMAGES);
const PRODUCT_BACK_IMAGES_NORMALIZED = mapByNormalizedName(PRODUCT_BACK_IMAGES);

function getMappedProductImage(productName: string, view: ProductImageView) {
  const normalizedName = normalizeProductNameForImages(productName);

  if (view === "front") return PRODUCT_FRONT_IMAGES_NORMALIZED[normalizedName];
  if (view === "model") return PRODUCT_MODEL_IMAGES_NORMALIZED[normalizedName];
  return PRODUCT_BACK_IMAGES_NORMALIZED[normalizedName];
}

const SCARF_COLOR_IMAGES: Record<string, Record<ProductImageView, string>> = {
  navy: {
    front: "/photos/scarf-1-front.png",
    model: "/photos/scarf-1-model.png",
    back: "/photos/scarf-1-back.png",
  },
  cream: {
    front: "/photos/scarf-2-front.png",
    model: "/photos/scarf-2-model.png",
    back: "/photos/scarf-2-back.png",
  },
};

function isLaGraziaSilkScarf(productName: string) {
  return normalizeProductNameForImages(productName) === "la grazia silk scarf";
}

function normalizeScarfColor(color?: string | null) {
  const normalizedColor = (color || "").trim().toLowerCase();

  if (normalizedColor.includes("cream") || normalizedColor.includes("creamy")) return "cream";
  return "navy";
}

function getScarfColorImage(productName: string, view: ProductImageView, color?: string | null) {
  if (!isLaGraziaSilkScarf(productName)) return undefined;
  return SCARF_COLOR_IMAGES[normalizeScarfColor(color)]?.[view];
}

const OFFICIAL_PRODUCT_COLOR_OPTIONS: Record<string, string[]> = {
  "atelier wrap jacket": ["Cream"],
  "milano spirit jacket": ["Cream Print"],
  "atelier soft polo top": ["Soft Blue"],
  "atelier drape top": ["Cream"],
  "atelier contrast collar top": ["Dusty Blue"],
  "atelier palazzo pants": ["Stone Beige"],
  "atelier celeste wrap pants": ["Dusty Blue"],
  "atelier low-waist linen pants": ["Ivory Beige"],
  "la grazia silk scarf": ["Navy", "Cream"],
  "atelier riviera tailored jorts": ["Cream"],
  "atelier capri long tailored jorts": ["Cream"],
};

function getOfficialColorOptions(productName: string) {
  return OFFICIAL_PRODUCT_COLOR_OPTIONS[normalizeProductNameForImages(productName)];
}

function withOfficialColorOptions(product: Product): Product {
  const officialColors = getOfficialColorOptions(product.name);

  if (!officialColors) return product;

  if (!isLaGraziaSilkScarf(product.name)) {
    return {
      ...product,
      colors: officialColors,
    };
  }

  return {
    ...product,
    colors: officialColors,
    image: "/photos/scarf-1-front.png",
    frontImage: "/photos/scarf-1-front.png",
    modelImage: "/photos/scarf-1-model.png",
    backImage: "/photos/scarf-1-back.png",
  };
}

function getDeclaredProductImage(product: ProductImageInput, view: ProductImageView) {
  if (view === "front") return product.frontImage || product.image;
  if (view === "model") return product.modelImage || product.frontImage || product.image;
  return product.backImage || product.frontImage || product.image;
}

function uniqueImageSources(sources: Array<string | undefined | null>) {
  const cleaned = sources
    .filter((source): source is string => Boolean(source && source.trim()))
    .map((source) => source.trim());

  return Array.from(new Set(cleaned));
}

function getProductImageSources(product: ProductImageInput, view: ProductImageView, color?: string | null) {
  return uniqueImageSources([
    getScarfColorImage(product.name, view, color),
    getMappedProductImage(product.name, view),
    getDeclaredProductImage(product, view),
    product.image,
    getScarfColorImage(product.name, "front", color),
    getMappedProductImage(product.name, "front"),
    getDeclaredProductImage(product, "front"),
  ]);
}

function SmartImage({
  sources,
  alt,
  loading,
}: {
  sources: string[];
  alt: string;
  loading?: "lazy" | "eager";
}) {
  const sourceKey = sources.join("|");
  const [sourceIndex, setSourceIndex] = useState(0);

  useEffect(() => {
    setSourceIndex(0);
  }, [sourceKey]);

  const activeSource = sources[sourceIndex] || "/photos/hero-piece.png";

  return (
    <img
      src={activeSource}
      alt={alt}
      loading={loading}
      onError={() => {
        setSourceIndex((currentIndex) => {
          const nextIndex = currentIndex + 1;
          return nextIndex < sources.length ? nextIndex : currentIndex;
        });
      }}
    />
  );
}

const sizeChart = [
  ["XS", "78 - 82 cm", "60 - 64 cm", "86 - 90 cm", "34 EU / 24-25"],
  ["S", "83 - 87 cm", "65 - 69 cm", "91 - 95 cm", "36 EU / 26-27"],
  ["M", "88 - 92 cm", "70 - 74 cm", "96 - 100 cm", "38 EU / 28-29"],
  ["L", "93 - 98 cm", "75 - 80 cm", "101 - 106 cm", "40 EU / 30-31"],
  ["XL", "99 - 105 cm", "81 - 88 cm", "107 - 114 cm", "42 EU / 32-33"],
];

const stockLevels = [5, 4, 10, 7, 8, 6, 5, 6, 9, 4, 5];

const modelInfo = [
  "Height 170 cm · Wearing S · Sculpted wrap fit",
  "Height 168 cm · Wearing S · Relaxed statement fit",
  "Height 169 cm · Wearing S · True to size",
  "Height 170 cm · Wearing S · Soft draped fit",
  "Height 169 cm · Wearing S · Soft structured fit",
  "Height 172 cm · Wearing M · Fluid wide-leg fit",
  "Height 171 cm · Wearing S · Draped wrap fit",
  "Height 170 cm · Wearing S · Low-waist relaxed linen fit",
  "70 x 70 cm · Square scarf · Silk-touch finish",
  "Height 170 cm · Wearing S · Long tailored fit",
  "Height 170 cm · Wearing S · Longer tailored fit",
];

const moodOptions = [
  {
    mood: "Coastal Atelier",
    result: "Atelier Capri Long Tailored Jorts",
    textEN: "Long tailored jorts, a refined daily top, gold details, and a clean Italian coastal mood.",
    textAR: "جورتس طويل Tailored مع توب راقٍ وتفاصيل ذهبية ولمسة ساحلية إيطالية.",
  },
  {
    mood: "Daily Chic",
    result: "Atelier Soft Polo Top",
    textEN: "A daily wearable polo top styled with soft tailoring and quiet luxury accessories.",
    textAR: "توب بولو يومي مع Tailoring ناعم وإكسسوارات فاخرة بهدوء.",
  },
  {
    mood: "Soft Tailoring",
    result: "Atelier Celeste Wrap Pants",
    textEN: "A sculptural wrap pant for dinners, events, and polished feminine looks.",
    textAR: "بنطلون Wrap راقٍ مناسب للعشاء والمناسبات واللوك الأنثوي الراقي.",
  },
  {
    mood: "Italian Muse",
    result: "La Grazia Silk Scarf",
    textEN: "A silk scarf in refined color options that finishes the outfit with Italian elegance.",
    textAR: "سكارف حرير بألوان راقية يكمّل اللوك بأناقة إيطالية.",
  },
];

const text = {
  EN: {
    topBar: "PRE-ORDER ACCESS IS OPEN — all orders before launch are reserved until the countdown finishes",
    womenOnly: "Women-Only Fashion",
    navBest: "Best Sellers",
    navCollection: "Collection",
    navAbout: "About",
    heroEyebrow: "Luxury Italian coastal elegance",
    heroTitle: "The La Grazia Atelier Collection.",
    heroDescription:
      "Discover La Grazia Milano: wrap jackets, daily tops, sculptural pants, silk scarves, and longer tailored jorts inspired by Italian coastal luxury, timeless feminine tailoring, soft neutrals, and gold details.",
    shopCollection: "Pre-Order Collection",
    findLook: "Find Your Piece",
    signatureEdit: "The Signature Edit",
    signatureText: "Wrap jackets, daily tops, sculptural pants, scarves, and signature long tailored jorts.",
    trustDelivery: "Delivery After Launch",
    trustExchange: "14-Day Exchange",
    trustStyling: "WhatsApp Styling",
    trustDrops: "Pre-Order Drop",
    mostLoved: "Most Loved",
    bestTitle: "Best Sellers",
    bestIntro: "A curated selection from the official La Grazia Milano Coastal Atelier Collection.",
    viewAll: "View All",
    wardrobeEyebrow: "New Arrivals",
    wardrobeTitle: "The Coastal Atelier Wardrobe",
    wardrobeIntro: "Browse the official 11-piece collection with one silk scarf available in multiple refined colorways. All orders placed before launch are treated as pre-orders until the countdown finishes.",
    searchPlaceholder: "Search jackets, tops, pants, scarves, jorts...",
    searchResults: "Search Results",
    featured: "La Grazia Selection",
    priceLow: "Price: Low to High",
    priceHigh: "Premium First",
    noResults: "No pieces matched your search. Try another word or clear the filter.",
    styleFinder: "Style Finder",
    styleTitle: "Find Your Grazia Piece",
    viewSuggested: "View Suggested Piece",
    yourMatch: "Your Match",
    fitGuide: "Fit Guide",
    sizeTitle: "La Grazia Size Chart",
    sizeIntro: "A simple guide for tops, trousers, jackets, and styled pieces.",
    askSize: "Ask for Size Help",
    size: "Size",
    bust: "Bust",
    waist: "Waist",
    hips: "Hips",
    trouserFit: "Trouser Fit",
    trousers: "Trousers",
    trousersText: "Choose your usual size for a clean fit. Size up for a relaxed wide-leg shape.",
    knitTops: "Knit Tops",
    knitText: "Stretch fit. Choose your normal size or size up for a softer modest fit.",
    jackets: "Jackets",
    jacketsText: "Structured fit. Size up if you plan to layer over shirts or knitwear.",
    giftEyebrow: "A Gift of Elegance",
    giftTitle: "La Grazia Gift Card",
    giftText: "Perfect for birthdays, graduations, and special occasions. Let her choose her own Italian-inspired piece.",
    reserveGift: "Reserve Gift Card",
    brandStory: "Brand Story",
    storyTitle: "Made for women who dress softly, confidently, and timelessly.",
    storyText:
      "La Grazia blends Italian coastal luxury with everyday wearability: clean tailoring, soft neutrals, gold hardware, elegant silhouettes, and pieces that make teenagers and women look polished without trying too hard.",
    tailoredFits: "Soft Tailoring",
    neutralPalette: "Neutral Palette",
    scarfStyling: "Silk Scarf",
    goldDetails: "Gold LG Details",
    club: "La Grazia Club",
    clubTitle: "Join the private list.",
    clubText: "Receive first access to new drops, styling edits, and limited local releases.",
    emailPlaceholder: "Enter your email",
    join: "Join",
    invalidEmail: "Please enter a valid email address.",
    emailDone: "Your email app will open to complete the signup.",
    shop: "Shop",
    sizeGuide: "Size Guide",
    email: "Email",
    whatsapp: "WhatsApp",
    menuSearch: "What are you looking for?",
    fullCollection: "Full Collection",
    privateList: "Private List",
    signIn: "Sign In",
    signUp: "Sign Up",
    myAccount: "My Account",
    signInTitle: "La Grazia Account",
    signUpTitle: "Create Your Account",
    signInText: "Sign in to access your Orders and Profile pages, save your details, and receive private drop access.",
    signUpText: "Create a La Grazia account to unlock your Orders and Profile pages, save your details, and receive private drop access.",
    fullName: "Full name",
    phoneNumber: "Phone number",
    signInEmail: "Email address",
    continueSignIn: "Continue",
    createAccount: "Create Account",
    noAccount: "New here? Create an account",
    haveAccount: "Already have an account? Sign in",
    signedInWelcome: "Welcome to La Grazia",
    accountCreated: "Your La Grazia account has been created",
    accountConfirmationSent: "Account created. Please check your email inbox to confirm your La Grazia account before signing in.",
    checkEmailTitle: "Check your email",
    checkEmailText: "We sent a La Grazia confirmation link to your inbox. Open it, press Confirm Email, then return here to sign in.",
    checkEmailHint: "If you cannot find it, check Spam or Junk.",
    signOut: "Sign Out",
    whatsappStyling: "WhatsApp Styling Help",
    savedLooks: "Saved Pieces",
    savedEmpty: "Tap the heart on any piece to save it here.",
    yourSelection: "Your Pre-Order Selection",
    bagTitle: "La Grazia Pre-Order Bag",
    emptyBag: "Your pre-order bag is empty. Add your favorite pieces first.",
    remove: "Remove",
    sendOrder: "Send Pre-Order on WhatsApp",
    payNow: "Pre-Order Checkout",
    openingPaymob: "Opening Paymob...",
    paymentError: "Payment could not start. Please try again.",
    paymentServerError: "Payment server is not ready locally. Test pre-order checkout after pushing to Vercel, or run Vercel dev.",
    only: "Only",
    left: "left",
    view: "View",
    add: "Pre-Order",
    occasion: "Occasion:",
    stock: "Stock:",
    model: "Model:",
    chooseSize: "Choose size:",
    chooseColor: "Choose color:",
    quantity: "Quantity:",
    completeLook: "Style it with:",
    addBag: "Add to Pre-Order Bag",
    orderWhatsapp: "Pre-Order on WhatsApp",
    notifyMe: "Notify Me",
    piecesLeft: "pieces left",
    home: "Home",
    bag: "Bag",
    dark: "Dark",
    light: "Light",
    toastAdded: "Added to La Grazia Pre-Order Bag",
    toastSaved: "Saved to your pieces",
    toastRemoved: "Removed from saved pieces",
    loadingLine: "Preparing your Coastal Atelier wardrobe",
    preOrderNotice: "Pre-order note: every order placed before launch is reserved as a pre-order until the countdown finishes and the collection officially goes live.",
    preOrderBadge: "Pre-Order Only",
    preOrderCartNote: "All items in your bag are pre-orders until the countdown finishes.",
  },
  AR: {
    topBar: "الحجز المسبق مفتوح الآن — جميع الطلبات قبل الإطلاق تعتبر Pre-Order حتى انتهاء العد التنازلي",
    womenOnly: "أزياء نسائية فقط",
    navBest: "الأكثر مبيعاً",
    navCollection: "المجموعة",
    navAbout: "عن البراند",
    heroEyebrow: "أناقة إيطالية ساحلية فاخرة",
    heroTitle: "مجموعة Coastal Atelier وصلت.",
    heroDescription:
      "اكتشفي لا غراتسيا ميلانو: جاكيتات، توبس، بنطلونات، سكارف، وجورتس طويل Tailored مستوحى من الفخامة الإيطالية الساحلية، الألوان الهادئة، والتفاصيل الذهبية.",
    shopCollection: "احجزي المجموعة مسبقاً",
    findLook: "اختاري القطعة",
    signatureEdit: "الاختيار الأساسي",
    signatureText: "جاكيتات، توبس، بنطلونات، سكارف، وجورتس طويل بتفاصيل ذهبية.",
    trustDelivery: "التوصيل بعد الإطلاق",
    trustExchange: "استبدال خلال ١٤ يوم",
    trustStyling: "تنسيق عبر واتساب",
    trustDrops: "إطلاق بالحجز المسبق",
    mostLoved: "الأكثر حباً",
    bestTitle: "الأكثر مبيعاً",
    bestIntro: "اختيار من مجموعة لا غراتسيا ميلانو الرسمية بطابع إيطالي ساحلي راقٍ.",
    viewAll: "شاهدي الكل",
    wardrobeEyebrow: "وصل حديثاً",
    wardrobeTitle: "خزانة Coastal Atelier",
    wardrobeIntro: "تصفحي المجموعة الرسمية. كل الطلبات قبل الإطلاق تعتبر حجز مسبق حتى انتهاء العد التنازلي.",
    searchPlaceholder: "ابحثي عن جاكيت، توب، بنطلون، سكارف، أو جورتس...",
    searchResults: "نتائج البحث",
    featured: "اختيارات لا غراتسيا",
    priceLow: "السعر من الأقل للأعلى",
    priceHigh: "الفاخر أولاً",
    noResults: "لا توجد قطع مطابقة. جربي كلمة أخرى أو امسحي الفلتر.",
    styleFinder: "اختاري ستايلك",
    styleTitle: "اكتشفي قطعة لا غراتسيا المناسبة لك",
    viewSuggested: "شاهدي القطعة المقترحة",
    yourMatch: "اختيارك المناسب",
    fitGuide: "دليل المقاسات",
    sizeTitle: "جدول مقاسات لا غراتسيا",
    sizeIntro: "دليل بسيط للمقاسات الخاصة بالبلوزات، البنطلونات، الجاكيتات، والقطع المختلفة.",
    askSize: "اسألي عن المقاس",
    size: "المقاس",
    bust: "الصدر",
    waist: "الوسط",
    hips: "الأرداف",
    trouserFit: "مقاس البنطلون",
    trousers: "البنطلونات",
    trousersText: "اختاري مقاسك المعتاد لقصّة منظمة. اختاري مقاس أكبر لو عايزة شكل أوسع.",
    knitTops: "البلوزات التريكو",
    knitText: "الخامة مطاطية. اختاري مقاسك الطبيعي أو مقاس أكبر لو تفضلي fit أوسع.",
    jackets: "الجاكيتات",
    jacketsText: "القصّة structured. اختاري مقاس أكبر لو هتلبسي تحتها قميص أو knitwear.",
    giftEyebrow: "هدية من الأناقة",
    giftTitle: "كارت هدية لا غراتسيا",
    giftText: "مناسب لأعياد الميلاد، التخرج، والمناسبات الخاصة. اتركي لها حرية اختيار القطعة الإيطالية المناسبة لها.",
    reserveGift: "احجزي كارت الهدية",
    brandStory: "قصة البراند",
    storyTitle: "مصممة للمرأة التي تحب الأناقة الهادئة والثقة والستايل الخالد.",
    storyText:
      "لا غراتسيا تمزج بين الفخامة الإيطالية الساحلية والارتداء اليومي: قصّات نظيفة، ألوان هادئة، تفاصيل LG ذهبية، وقطع تجعل البنات والسيدات يبدون أنيقات بدون مبالغة.",
    tailoredFits: "Tailoring ناعم",
    neutralPalette: "ألوان هادئة",
    scarfStyling: "سكارف حرير",
    goldDetails: "تفاصيل LG ذهبية",
    club: "نادي لا غراتسيا",
    clubTitle: "انضمي إلى القائمة الخاصة.",
    clubText: "احصلي على وصول مبكر للـ drops الجديدة، أفكار تنسيق، وإصدارات محلية محدودة.",
    emailPlaceholder: "اكتبي بريدك الإلكتروني",
    join: "انضمي",
    invalidEmail: "من فضلك اكتبي بريد إلكتروني صحيح.",
    emailDone: "سيتم فتح تطبيق البريد لإكمال الاشتراك.",
    shop: "تسوقي",
    sizeGuide: "دليل المقاسات",
    email: "الإيميل",
    whatsapp: "واتساب",
    menuSearch: "بتدوري على إيه؟",
    fullCollection: "المجموعة الكاملة",
    privateList: "القائمة الخاصة",
    signIn: "تسجيل الدخول",
    signUp: "إنشاء حساب",
    myAccount: "حسابي",
    signInTitle: "حساب لا غراتسيا",
    signUpTitle: "إنشاء حساب جديد",
    signInText: "سجلي بياناتك لتسهيل الطلب، حفظ التفاصيل، والحصول على وصول خاص للـ drops الجديدة.",
    signUpText: "أنشئي حساب لا غراتسيا لحفظ بياناتك، تسهيل الطلب، والحصول على وصول خاص للـ drops الجديدة.",
    fullName: "الاسم الكامل",
    phoneNumber: "رقم الهاتف",
    signInEmail: "البريد الإلكتروني",
    continueSignIn: "متابعة",
    createAccount: "إنشاء الحساب",
    noAccount: "جديدة هنا؟ أنشئي حساب",
    haveAccount: "لديك حساب بالفعل؟ سجلي الدخول",
    signedInWelcome: "أهلاً بكِ في لا غراتسيا",
    accountCreated: "تم إنشاء حساب لا غراتسيا",
    accountConfirmationSent: "تم إنشاء الحساب. من فضلك افحصي بريدك الإلكتروني لتأكيد حساب لا غراتسيا قبل تسجيل الدخول.",
    checkEmailTitle: "افحصي بريدك الإلكتروني",
    checkEmailText: "أرسلنا لك رابط تأكيد من لا غراتسيا. افتحي الإيميل، اضغطي Confirm Email، ثم عودي لتسجيل الدخول.",
    checkEmailHint: "إذا لم تجدي الرسالة، افحصي Spam أو Junk.",
    signOut: "تسجيل الخروج",
    whatsappStyling: "مساعدة تنسيق عبر واتساب",
    savedLooks: "القطع المحفوظة",
    savedEmpty: "اضغطي على القلب في أي قطعة لحفظها هنا.",
    yourSelection: "اختيارات الحجز المسبق",
    bagTitle: "شنطة الحجز المسبق",
    emptyBag: "شنطة الحجز المسبق فارغة. أضيفي القطعة المفضلة أولاً.",
    remove: "إزالة",
    sendOrder: "إرسال الحجز المسبق عبر واتساب",
    payNow: "إتمام الحجز المسبق",
    openingPaymob: "جاري فتح Paymob...",
    paymentError: "تعذر بدء الدفع. حاولي مرة أخرى.",
    paymentServerError: "الحجز المسبق لن يعمل محلياً إلا بعد النشر على Vercel أو تشغيل Vercel dev.",
    only: "متبقي",
    left: "فقط",
    view: "عرض",
    add: "حجز مسبق",
    occasion: "المناسبة:",
    stock: "المتوفر:",
    model: "الموديل:",
    chooseSize: "اختاري المقاس:",
    chooseColor: "اختاري اللون:",
    quantity: "الكمية:",
    completeLook: "نسقيها مع:",
    addBag: "أضيفي لشنطة الحجز المسبق",
    orderWhatsapp: "احجزي مسبقاً عبر واتساب",
    notifyMe: "بلغيني عند التوفر",
    piecesLeft: "قطع فقط",
    home: "الرئيسية",
    bag: "الشنطة",
    dark: "داكن",
    light: "فاتح",
    toastAdded: "تمت الإضافة إلى شنطة الحجز المسبق",
    toastSaved: "تم حفظ القطعة",
    toastRemoved: "تم حذف القطعة من المحفوظات",
    loadingLine: "نجهز لك خزانة Coastal Atelier راقية",
    preOrderNotice: "ملاحظة الحجز المسبق: أي طلب قبل الإطلاق يعتبر Pre-Order حتى انتهاء العد التنازلي وإطلاق المجموعة رسمياً.",
    preOrderBadge: "Pre-Order Only",
    preOrderCartNote: "كل القطع الموجودة في الشنطة تعتبر حجز مسبق حتى انتهاء العد التنازلي.",
  },
};

function createWhatsAppLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function getProductIndex(productName: string) {
  return Math.max(0, products.findIndex((product) => product.name === productName));
}

function getStock(productName: string) {
  return stockLevels[getProductIndex(productName)] || 5;
}

function getModelInfo(productName: string) {
  return modelInfo[getProductIndex(productName)] || modelInfo[0];
}

function SearchIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6.5 8.5h11v10.8c0 .9-.7 1.7-1.7 1.7H8.2c-.9 0-1.7-.7-1.7-1.7V8.5Z" />
      <path d="M9 8.5V7a3 3 0 0 1 6 0v1.5" />
    </svg>
  );
}

function AccountIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21a8 8 0 0 0-16 0" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </svg>
  );
}


function WhatsAppIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 11.5a8 8 0 0 1-11.9 7L4 20l1.5-4A8 8 0 1 1 20 11.5Z" />
      <path d="M9 8.8c.4 2 2.2 4 4.2 4.8l1.2-1.1 2 1c-.3 1.2-1.2 2-2.5 2-3.2 0-6.8-3.7-6.8-6.8 0-1.2.8-2.1 2-2.5l1 2.1L9 8.8Z" />
    </svg>
  );
}

function ProductCard({
  product,
  onOpen,
  onAdd,
  onWishlist,
  isWishlisted,
  language,
}: {
  product: Product;
  onOpen: (product: Product) => void;
  onAdd: (product: Product) => void;
  onWishlist: (product: Product) => void;
  isWishlisted: boolean;
  language: Lang;
}) {
  const t = text[language];
  const [imageView, setImageView] = useState<"front" | "model" | "back">("front");
  const [manualImageView, setManualImageView] = useState(false);

  const frontImageSources = useMemo(() => getProductImageSources(product, "front"), [product]);
  const modelImageSources = useMemo(() => getProductImageSources(product, "model"), [product]);
  const backImageSources = useMemo(() => getProductImageSources(product, "back"), [product]);

  const activeImageSources =
    imageView === "model"
      ? modelImageSources
      : imageView === "back"
        ? backImageSources
        : frontImageSources;

  useEffect(() => {
    const preloadSources = [...modelImageSources, ...backImageSources];

    preloadSources.forEach((source) => {
      const image = new Image();
      image.decoding = "async";
      image.src = source;
    });
  }, [modelImageSources, backImageSources]);

  const imageViews = [
    { key: "front" as const, label: "Front", available: frontImageSources.length > 0 },
    { key: "model" as const, label: "Model", available: modelImageSources.length > 0 },
    { key: "back" as const, label: "Back", available: backImageSources.length > 0 },
  ].filter((view) => view.available);

  return (
    <article className="productCard reveal">
      <div
        className="productImage"
        style={{ position: "relative" }}
        onClick={() => onOpen(product)}
        onPointerEnter={() => {
          if (!manualImageView && modelImageSources.length > 0) setImageView("model");
        }}
        onPointerLeave={() => {
          setManualImageView(false);
          setImageView("front");
        }}
      >
        <SmartImage
          sources={activeImageSources}
          alt={product.name}
          loading="lazy"
        />
        <div
          className="productImageSwitcher"
          style={{
            position: "absolute",
            left: 12,
            bottom: 12,
            zIndex: 4,
            display: "flex",
            gap: 6,
            padding: 4,
            borderRadius: 999,
            background: "rgba(255, 255, 255, 0.82)",
            backdropFilter: "blur(10px)",
            boxShadow: "0 10px 26px rgba(0, 0, 0, 0.12)",
          }}
          onClick={(event) => event.stopPropagation()}
          onPointerEnter={(event) => event.stopPropagation()}
        >
          {imageViews.map((view) => (
            <button
              key={view.key}
              type="button"
              className={imageView === view.key ? "imageSwitchBtn active" : "imageSwitchBtn"}
              style={{
                border: "1px solid rgba(176, 140, 78, 0.45)",
                borderRadius: 999,
                padding: "5px 9px",
                fontSize: 11,
                letterSpacing: "0.04em",
                color: imageView === view.key ? "#ffffff" : "#6f5735",
                background: imageView === view.key ? "#b08c4e" : "rgba(255, 255, 255, 0.72)",
                cursor: "pointer",
              }}
              onClick={(event) => {
                event.stopPropagation();
                setManualImageView(true);
                setImageView(view.key);
              }}
            >
              {view.label}
            </button>
          ))}
        </div>
        <span className="stockTag">
          {t.only} {getStock(product.name)} {t.left}
        </span>
        <button
          className={isWishlisted ? "heartBtn saved" : "heartBtn"}
          onClick={(event) => {
            event.stopPropagation();
            onWishlist(product);
          }}
          aria-label="Save piece"
        >
          ♥
        </button>
      </div>

      <div className="productInfo">
        <div>
          <p className="category">{product.category}</p>
          <h4>{product.name}</h4>
          <p className="price">{product.price}</p>
          <p className="preOrderLine">{t.preOrderBadge}</p>
        </div>

        <div className="cardActions">
          <button className="viewBtn" onClick={() => onOpen(product)}>
            {t.view}
          </button>
          <button className="addBtn" onClick={() => onAdd(product)}>
            {t.add}
          </button>
        </div>
      </div>
    </article>
  );
}

export default function App() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedImageView, setSelectedImageView] = useState<"front" | "model" | "back">("front");
  const [selectedSize, setSelectedSize] = useState("M");
  const [selectedColor, setSelectedColor] = useState("Cream");
  const [quantity, setQuantity] = useState(1);
  const [itemSizeChartOpen, setItemSizeChartOpen] = useState(false);
  const [displayProducts, setDisplayProducts] = useState<Product[]>(products);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const [wishlist, setWishlist] = useState<string[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [collectionMenuOpen, setCollectionMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [signInOpen, setSignInOpen] = useState(false);
  const [accountPageOpen, setAccountPageOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signIn" | "signUp">("signIn");
  const [accountUser, setAccountUser] = useState<AccountUser | null>(null);
  const [accountForm, setAccountForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [verificationNotice, setVerificationNotice] = useState("");
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phone: "",
    addressLine: "",
    city: "Cairo",
    area: "",
    building: "",
    floor: "",
    apartment: "",
    deliveryNotes: "",
  });
  const [addresses, setAddresses] = useState<AccountAddress[]>([]);
  const [addressForm, setAddressForm] = useState<AddressForm>(emptyAddressForm);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [profileSaving, setProfileSaving] = useState(false);
  const [addressSaving, setAddressSaving] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [accountLoading, setAccountLoading] = useState(false);
  const [accountView, setAccountView] = useState<"profile" | "orders" | "admin">("profile");
  const [accountOrders, setAccountOrders] = useState<AccountOrder[]>([]);
  const [adminOrders, setAdminOrders] = useState<AdminOrder[]>([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminProducts, setAdminProducts] = useState<ProductRow[]>([]);
  const [adminProductsLoading, setAdminProductsLoading] = useState(false);
  const [productSaving, setProductSaving] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productForm, setProductForm] = useState<ProductForm>(emptyProductForm);
  const [productReviews, setProductReviews] = useState<ProductReview[]>([]);
  const [allReviews, setAllReviews] = useState<ProductReview[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewForm, setReviewForm] = useState<ReviewForm>({ rating: 5, reviewText: "" });
  const [supportMessages, setSupportMessages] = useState<SupportMessage[]>([]);
  const [adminSupportMessages, setAdminSupportMessages] = useState<SupportMessage[]>([]);
  const [supportForm, setSupportForm] = useState<SupportForm>(emptySupportForm);
  const [supportSubmitting, setSupportSubmitting] = useState(false);
  const [supportLoading, setSupportLoading] = useState(false);
  const [adminSupportLoading, setAdminSupportLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [collectionFilter, setCollectionFilter] = useState("All");
  const [sortOption, setSortOption] = useState("Featured");
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);

  const [selectedMood, setSelectedMood] = useState("Coastal Atelier");
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState<Lang>("EN");

  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState("");
  const [privateListLoading, setPrivateListLoading] = useState(false);
  const [offerPopupOpen, setOfferPopupOpen] = useState(false);
  const [offerEmail, setOfferEmail] = useState("");
  const [offerStatus, setOfferStatus] = useState("");
  const [offerSubmitting, setOfferSubmitting] = useState(false);
  const [offerJustUnlocked, setOfferJustUnlocked] = useState(false);
  const [offerCelebrationOpen, setOfferCelebrationOpen] = useState(false);
  const [privateOfferStatus, setPrivateOfferStatus] = useState<PrivateOfferStatus>("unknown");

  const [toast, setToast] = useState("");
  const [scrollProgress, setScrollProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [introExitStarted, setIntroExitStarted] = useState(false);
  const [launchCountdown, setLaunchCountdown] = useState<LaunchCountdown>(() => getLaunchCountdown());

  const isArabic = language === "AR";
  const t = text[language];

  const offerCelebrationPieces = useMemo(
    () =>
      Array.from({ length: 32 }, (_, index) => ({
        id: index,
        label: index % 11 === 0 ? PRIVATE_OFFER_CODE : "10%",
        left: `${(index * 29 + 6) % 100}%`,
        delay: `${0.18 + (index % 16) * 0.13}s`,
        duration: `${4.9 + (index % 7) * 0.28}s`,
        drift: `${index % 2 === 0 ? "" : "-"}${26 + (index % 10) * 6}px`,
        rotate: `${index % 2 === 0 ? "" : "-"}${8 + (index % 8) * 3}deg`,
        size: `${11 + (index % 5) * 1.6}px`,
        opacity: `${0.34 + (index % 7) * 0.045}`,
      })),
    []
  );

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;

    const viewportMeta = document.querySelector<HTMLMetaElement>('meta[name="viewport"]');
    const viewportContent = "width=device-width, initial-scale=1, viewport-fit=cover";

    if (viewportMeta) {
      viewportMeta.setAttribute("content", viewportContent);
    } else {
      const meta = document.createElement("meta");
      meta.name = "viewport";
      meta.content = viewportContent;
      document.head.appendChild(meta);
    }

    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    const scrollToPageTop = () => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    scrollToPageTop();

    const initialScrollTimers = [0, 60, 160, 360, 700, 1100, 1600].map((delay) =>
      window.setTimeout(scrollToPageTop, delay)
    );

    const handleBeforeUnload = () => {
      if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = "manual";
      }

      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    const handlePageShow = () => {
      scrollToPageTop();
      window.setTimeout(scrollToPageTop, 120);
      window.setTimeout(scrollToPageTop, 450);
    };

    const handleLoad = () => {
      scrollToPageTop();
      window.setTimeout(scrollToPageTop, 250);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("pageshow", handlePageShow);
    window.addEventListener("load", handleLoad);

    return () => {
      initialScrollTimers.forEach((timer) => window.clearTimeout(timer));
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("pageshow", handlePageShow);
      window.removeEventListener("load", handleLoad);
    };
  }, []);

  const accountInitials = useMemo(() => {
    if (!accountUser) return "";

    const source = (accountUser.name || accountUser.email || "").trim();
    const parts = source.split(/\s+/).filter(Boolean);

    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }

    return source.slice(0, 2).toUpperCase();
  }, [accountUser]);

  const canAccessAdmin = useMemo(() => {
    const email = (accountUser?.email || "").trim().toLowerCase();

    return Boolean(accountUser?.isAdmin || ADMIN_EMAILS.includes(email));
  }, [accountUser]);

  const defaultAddress = useMemo(() => {
    return addresses.find((address) => address.is_default) || addresses[0] || null;
  }, [addresses]);

  const bestSellers = displayProducts.filter((product) =>
    ["Atelier Capri Long Tailored Jorts", "Atelier Soft Polo Top", "Atelier Wrap Jacket", "La Grazia Silk Scarf"].includes(product.name)
  );

  const filters = ["All", "New Arrival", "Hero Product", "Daily Essential", "Signature Jacket", "Elegant Tailoring", "Classic Accessory", "Soft Luxury", "Statement Jacket"];

  const filterLabels: Record<string, string> = {
    All: isArabic ? "الكل" : "All",
    "New Arrival": isArabic ? "وصل حديثاً" : "New Arrival",
    "Hero Product": isArabic ? "القطعة الأساسية" : "Hero Product",
    "Daily Essential": isArabic ? "يومي وأساسي" : "Daily Essential",
    "Signature Jacket": isArabic ? "جاكيت أساسي" : "Signature Jacket",
    "Elegant Tailoring": isArabic ? "Tailoring راقٍ" : "Elegant Tailoring",
    "Classic Accessory": isArabic ? "إكسسوار كلاسيكي" : "Classic Accessory",
    "Soft Luxury": isArabic ? "رفاهية ناعمة" : "Soft Luxury",
    "Statement Jacket": isArabic ? "جاكيت Statement" : "Statement Jacket",
  };

  const collectionMenuItems = [
    { key: "Jackets", label: isArabic ? "جاكيتات" : "Jackets" },
    { key: "Tops", label: isArabic ? "توبس" : "Tops" },
    { key: "Pants", label: isArabic ? "بنطلونات" : "Pants" },
    { key: "Scarves", label: isArabic ? "سكارف" : "Scarves" },
    { key: "Jorts", label: isArabic ? "جورتس" : "Jorts" },
  ];

  const sortOptions = [
    { value: "Featured", label: t.featured },
    { value: "Price Low to High", label: t.priceLow },
    { value: "Price High to Low", label: t.priceHigh },
  ];


  const approvedProductReviews = useMemo(() => {
    return productReviews.filter((review) => review.is_approved);
  }, [productReviews]);

  const productReviewAverage = useMemo(() => {
    if (approvedProductReviews.length === 0) return 0;
    const total = approvedProductReviews.reduce((sum, review) => sum + Number(review.rating || 0), 0);
    return Math.round((total / approvedProductReviews.length) * 10) / 10;
  }, [approvedProductReviews]);

  function productMatchesCollection(product: Product, collection: string) {
    if (collection === "All") return true;
    return product.category === collection;
  }

  function openCollectionGroup(group: string) {
    setCollectionFilter(group);
    setActiveFilter("All");
    setSearchTerm("");
    setMenuOpen(false);
    setCollectionMenuOpen(false);
    setAccountPageOpen(false);

    window.setTimeout(() => {
      document.getElementById("collection")?.scrollIntoView({ behavior: "smooth" });
    }, 80);
  }

  function openSizeGuideFromMenu() {
    const guideProduct = selectedProduct || displayProducts[0] || products[0];
    setMenuOpen(false);
    setCollectionMenuOpen(false);
    setAccountPageOpen(false);
    setSelectedProduct(guideProduct);
    setSelectedSize("M");
    setSelectedColor(guideProduct.colors[0]);
    setQuantity(1);
    setItemSizeChartOpen(true);
  }

  const filteredProducts = useMemo(() => {
    const result = displayProducts.filter((product) => {
      const search =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.occasion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.tag.toLowerCase().includes(searchTerm.toLowerCase());

      const filter = activeFilter === "All" || product.tag === activeFilter;
      const collection = productMatchesCollection(product, collectionFilter);

      return search && filter && collection;
    });

    if (sortOption === "Price Low to High") return [...result].sort((a, b) => a.minPrice - b.minPrice);
    if (sortOption === "Price High to Low") return [...result].sort((a, b) => b.minPrice - a.minPrice);

    return result;
  }, [displayProducts, searchTerm, activeFilter, collectionFilter, sortOption]);

  const wishlistProducts = displayProducts.filter((product) => wishlist.includes(product.name));

  const moodResult = moodOptions.find((option) => option.mood === selectedMood) || moodOptions[0];
  const moodProduct = displayProducts.find((product) => product.name === moodResult.result) || displayProducts[0] || products[0];

  const lineBreak = String.fromCharCode(10);
  const savedPrivateOfferEmail = getSavedOfferEmail();
  const activePrivateOfferEmail = offerEmail.trim().toLowerCase() || savedPrivateOfferEmail || newsletterEmail.trim().toLowerCase();
  const privateOfferActive =
    privateOfferStatus === "claimed" &&
    Boolean(activePrivateOfferEmail && activePrivateOfferEmail.includes("@"));
  const cartSubtotal = cart.reduce((total, item) => total + item.product.minPrice * item.quantity, 0);
  const cartDiscount = privateOfferActive ? Math.round(cartSubtotal * 0.10) : 0;
  const cartTotalAfterDiscount = Math.max(0, cartSubtotal - cartDiscount);

  function formatLuxuryPreOrderItem(item: CartItem, index: number) {
    const sizeLine = isLaGraziaSilkScarf(item.product.name) ? "" : `${lineBreak}Size: ${item.size}`;

    return `${index + 1}. ${item.product.name} — ${item.product.price}${sizeLine}${lineBreak}Color: ${item.color}${lineBreak}Quantity: ${item.quantity}`;
  }

  function createLuxuryPreOrderMessage(items: CartItem[]) {
    const itemWord = items.length === 1 ? "piece" : "pieces";
    const selectedWord = items.length === 1 ? "piece" : "pieces";
    const luxuryOrderLines = items
      .map((item, index) => formatLuxuryPreOrderItem(item, index))
      .join(`${lineBreak}${lineBreak}`);

    return (
      "Hello La Grazia Milano," +
      lineBreak +
      lineBreak +
      `I would love to reserve the following ${itemWord} from the upcoming La Grazia Atelier Collection:` +
      lineBreak +
      lineBreak +
      luxuryOrderLines +
      lineBreak +
      lineBreak +
      "I understand that all orders placed before the official launch are treated as pre-orders, and that my reservation will be confirmed once the countdown ends and the collection officially goes live." +
      lineBreak +
      lineBreak +
      `Kindly assist me with the pre-order confirmation, expected delivery details, and the next steps to secure my selected ${selectedWord}.` +
      lineBreak +
      lineBreak +
      "Thank you."
    );
  }

  const cartMessage =
    cart.length > 0
      ? createLuxuryPreOrderMessage(cart)
      : "Hello La Grazia Milano, I would love to ask about reserving a piece from the upcoming La Grazia Atelier Collection.";

  useEffect(() => {
    const fallbackExitTimer = window.setTimeout(() => setIntroExitStarted(true), 6261);

    return () => {
      window.clearTimeout(fallbackExitTimer);
    };
  }, []);

  useEffect(() => {
    if (!introExitStarted) return;

    const finishTimer = window.setTimeout(() => setLoading(false), 4200);
    return () => window.clearTimeout(finishTimer);
  }, [introExitStarted]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    if (loading) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    }

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [loading]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedOfferEmail = window.localStorage.getItem(LAGRAZIA_OFFER_STORAGE_KEY) || "";

    if (savedOfferEmail && savedOfferEmail.includes("@")) {
      setOfferEmail(savedOfferEmail);
      void refreshPrivateOfferStatus(savedOfferEmail);
    }

    const dismissed = window.sessionStorage.getItem(LAGRAZIA_OFFER_DISMISS_STORAGE_KEY);
    if (dismissed || loading) return;

    const timer = window.setTimeout(() => {
      setOfferPopupOpen(true);
    }, 450);

    return () => window.clearTimeout(timer);
  }, [loading]);

  useEffect(() => {
    const updateLaunchCountdown = () => {
      setLaunchCountdown(getLaunchCountdown());
    };

    updateLaunchCountdown();

    const countdownTimer = window.setInterval(updateLaunchCountdown, COUNTDOWN_SECOND);

    return () => window.clearInterval(countdownTimer);
  }, []);


  useEffect(() => {
    fetchStoreProducts();
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const height = document.documentElement.scrollHeight - window.innerHeight;
      const progress = height > 0 ? (window.scrollY / height) * 100 : 0;
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", onScroll);
    onScroll();

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (accountPageOpen) return;

    const elements = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));

    elements.forEach((element, index) => {
      element.dataset.revealIndex = String(index % 8);
      element.classList.remove("visible");
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const element = entry.target as HTMLElement;
          const revealIndex = Number(element.dataset.revealIndex || 0);

          if (entry.isIntersecting) {
            window.setTimeout(() => {
              element.classList.add("visible");
            }, revealIndex * 55);
          } else {
            element.classList.remove("visible");
          }
        });
      },
      {
        threshold: 0.14,
        rootMargin: "0px 0px -10% 0px",
      }
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [language, searchTerm, activeFilter, collectionFilter, sortOption, wishlist.length, accountPageOpen, filteredProducts.length]);


  useEffect(() => {
    if (accountPageOpen && accountView === "admin" && canAccessAdmin) {
      fetchAdminOrders();
      fetchAdminProducts();
      fetchAdminReviews();
      fetchAdminSupportMessages();
    }
  }, [accountPageOpen, accountView, canAccessAdmin]);

  useEffect(() => {
    if (accountPageOpen && session?.user?.id) {
      fetchUserSupportMessages(session.user.id);
    }
  }, [accountPageOpen, session?.user?.id]);

  useEffect(() => {
    if (!toast) return;

    const timer = window.setTimeout(() => setToast(""), 8000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    const closeOnEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setSearchOpen(false);
        setCartOpen(false);
        setSelectedProduct(null);
        setSortDropdownOpen(false);
        setItemSizeChartOpen(false);
      }
    };

    window.addEventListener("keydown", closeOnEsc);
    return () => window.removeEventListener("keydown", closeOnEsc);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") return;

    const shouldLockPage = Boolean(selectedProduct) || searchOpen || offerPopupOpen;
    const body = document.body;
    const html = document.documentElement;

    const lockPageScroll = () => {
      if (body.dataset.lagraziaScrollLocked === "true") return;

      const scrollY = window.scrollY || html.scrollTop || body.scrollTop || 0;

      body.dataset.lagraziaScrollLocked = "true";
      body.dataset.lagraziaScrollY = String(scrollY);

      body.style.position = "fixed";
      body.style.top = `-${scrollY}px`;
      body.style.left = "0";
      body.style.right = "0";
      body.style.width = "100%";
      body.style.overflow = "hidden";
      html.style.overflow = "hidden";
    };

    const unlockPageScroll = () => {
      if (body.dataset.lagraziaScrollLocked !== "true") return;

      const savedScrollY = Number(body.dataset.lagraziaScrollY || "0");

      body.style.position = "";
      body.style.top = "";
      body.style.left = "";
      body.style.right = "";
      body.style.width = "";
      body.style.overflow = "";
      html.style.overflow = "";

      delete body.dataset.lagraziaScrollLocked;
      delete body.dataset.lagraziaScrollY;

      window.scrollTo(0, savedScrollY);
    };

    if (shouldLockPage) {
      lockPageScroll();
    } else {
      unlockPageScroll();
    }
  }, [selectedProduct, searchOpen, offerPopupOpen]);

  useEffect(() => {
    if (!supabase) return;

    let cancelled = false;

    async function loadSavedSession() {
      try {
        const { data, error } = await supabase!.auth.getSession();

        if (cancelled) return;

        if (error) {
          console.error("Supabase session restore failed:", error);
          await handleSupabaseSession(null);
          return;
        }

        await handleSupabaseSession(data.session);
      } catch (error) {
        console.error("Unexpected Supabase session restore error:", error);
        if (!cancelled) await handleSupabaseSession(null);
      }
    }

    loadSavedSession();

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (cancelled) return;

      window.setTimeout(() => {
        if (!cancelled) {
          void handleSupabaseSession(nextSession);
        }
      }, 0);
    });

    return () => {
      cancelled = true;
      data.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const openAccountFromHash = () => {
      if (typeof window === "undefined") return;

      const wantsAccount = window.location.hash.toLowerCase().includes("account");
      if (!wantsAccount) return;

      if (accountUser) {
        setAccountPageOpen(true);
        setAccountView("orders");
        setSignInOpen(false);
        fetchUserOrders(accountUser.id);
        window.setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 80);
      } else {
        setAuthMode("signIn");
        setSignInOpen(true);
      }
    };

    openAccountFromHash();
    window.addEventListener("hashchange", openAccountFromHash);

    return () => window.removeEventListener("hashchange", openAccountFromHash);
  }, [accountUser]);

  async function handleSupabaseSession(nextSession: Session | null) {
    setSession(nextSession);

    if (!nextSession?.user || !supabase) {
      setAccountUser(null);
      setAccountOrders([]);
      setAdminOrders([]);
      setAddresses([]);
      setProfileForm({ name: "", email: "", phone: "", addressLine: "", city: "Cairo", area: "", building: "", floor: "", apartment: "", deliveryNotes: "" });
      setAddressForm(emptyAddressForm);
      setEditingAddressId(null);
      return;
    }

    const user = nextSession.user;
    const metadata = user.user_metadata || {};

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, full_name, email, phone, is_admin, address_line, city, area, building, floor, apartment, delivery_notes")
      .eq("id", user.id)
      .maybeSingle();

    const nextUser: AccountUser = {
      id: user.id,
      name: String(profile?.full_name || metadata.full_name || "La Grazia Client"),
      email: String(profile?.email || user.email || ""),
      phone: String(profile?.phone || metadata.phone || ""),
      isAdmin: Boolean(profile?.is_admin),
      addressLine: String(profile?.address_line || ""),
      city: String(profile?.city || "Cairo"),
      area: String(profile?.area || ""),
      building: String(profile?.building || ""),
      floor: String(profile?.floor || ""),
      apartment: String(profile?.apartment || ""),
      deliveryNotes: String(profile?.delivery_notes || ""),
    };

    setAccountUser(nextUser);
    setAccountForm({ name: nextUser.name, email: nextUser.email, phone: nextUser.phone, password: "" });
    setProfileForm({
      name: nextUser.name,
      email: nextUser.email,
      phone: nextUser.phone,
      addressLine: nextUser.addressLine || "",
      city: nextUser.city || "Cairo",
      area: nextUser.area || "",
      building: nextUser.building || "",
      floor: nextUser.floor || "",
      apartment: nextUser.apartment || "",
      deliveryNotes: nextUser.deliveryNotes || "",
    });
    fetchUserOrders(user.id);
    fetchUserAddresses(user.id);
    fetchUserWishlist(user.id);
    const email = String(profile?.email || user.email || "").trim().toLowerCase();
    if (Boolean(profile?.is_admin) || ADMIN_EMAILS.includes(email)) {
      fetchAdminOrders();
      fetchAdminProducts();
    }
  }


  function mapProductRow(row: ProductRow): Product {
    return withOfficialColorOptions({
      id: row.id,
      name: row.name,
      price: row.price,
      minPrice: Number(row.min_price || 0),
      category: row.category,
      image: getMappedProductImage(row.name, "front") || row.image,
      frontImage: getMappedProductImage(row.name, "front") || row.image,
      modelImage: getMappedProductImage(row.name, "model"),
      backImage: getMappedProductImage(row.name, "back"),
      tag: row.tag || "New Arrival",
      occasion: row.occasion || "Everyday Chic",
      colors: row.colors && row.colors.length > 0 ? row.colors : ["Cream"],
      complete: row.complete && row.complete.length > 0 ? row.complete : [],
      description: row.description || "",
      isActive: Boolean(row.is_active),
      sortOrder: Number(row.sort_order || 0),
    });
  }

  async function fetchStoreProducts() {
    if (!supabase) {
      setDisplayProducts(products.map(withOfficialColorOptions));
      return;
    }

    const { data, error } = await supabase
      .from("products")
      .select("id, name, price, min_price, category, image, tag, occasion, colors, complete, description, is_active, sort_order")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      console.error(error);
      setDisplayProducts(products.map(withOfficialColorOptions));
      return;
    }

    const officialNames = new Set(
      products.map((product) => normalizeProductNameForImages(product.name))
    );

    const databaseByName = new Map(
      ((data || []) as ProductRow[])
        .filter((row) => officialNames.has(normalizeProductNameForImages(row.name)))
        .map((row) => [normalizeProductNameForImages(row.name), mapProductRow(row)])
    );

    const mergedProducts = products.map((fallbackProduct) => {
      const databaseProduct = databaseByName.get(normalizeProductNameForImages(fallbackProduct.name));

      if (!databaseProduct) return withOfficialColorOptions(fallbackProduct);

      return withOfficialColorOptions({
        ...fallbackProduct,
        ...databaseProduct,
        image: getMappedProductImage(fallbackProduct.name, "front") || databaseProduct.image || fallbackProduct.image,
        frontImage: getMappedProductImage(fallbackProduct.name, "front") || databaseProduct.frontImage || fallbackProduct.frontImage || databaseProduct.image || fallbackProduct.image,
        modelImage: getMappedProductImage(fallbackProduct.name, "model") || databaseProduct.modelImage || fallbackProduct.modelImage || databaseProduct.image || fallbackProduct.image,
        backImage: getMappedProductImage(fallbackProduct.name, "back") || databaseProduct.backImage || fallbackProduct.backImage || databaseProduct.image || fallbackProduct.image,
      });
    });

    setDisplayProducts(mergedProducts);
  }

  function mapOfficialProductToRow(product: Product, index: number): ProductRow {
    return {
      id: product.id || `official-fallback-${index}-${normalizeProductNameForImages(product.name).replace(/[^a-z0-9]+/g, "-")}`,
      name: product.name,
      price: product.price,
      min_price: product.minPrice,
      category: product.category,
      image: product.image,
      tag: product.tag,
      occasion: product.occasion,
      colors: product.colors,
      complete: product.complete,
      description: product.description,
      is_active: product.isActive ?? true,
      sort_order: product.sortOrder ?? index + 1,
    };
  }

  function isOfficialFallbackProductId(productId: string) {
    return productId.startsWith("official-fallback-");
  }

  async function fetchAdminProducts() {
    if (!supabase || !canAccessAdmin) return;

    setAdminProductsLoading(true);

    const { data, error } = await supabase
      .from("products")
      .select("id, name, price, min_price, category, image, tag, occasion, colors, complete, description, is_active, sort_order")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      console.error(error);
      setToast(error.message);
    } else {
      const officialNames = new Set(
        products.map((product) => normalizeProductNameForImages(product.name))
      );

      const databaseRowsByName = new Map(
        ((data || []) as ProductRow[])
          .filter((row) => officialNames.has(normalizeProductNameForImages(row.name)))
          .map((row) => [normalizeProductNameForImages(row.name), row])
      );

      const mergedAdminProducts = products.map((fallbackProduct, index) => {
        const databaseRow = databaseRowsByName.get(normalizeProductNameForImages(fallbackProduct.name));
        const fallbackRow = mapOfficialProductToRow(fallbackProduct, index);

        if (!databaseRow) return fallbackRow;

        return {
          ...fallbackRow,
          ...databaseRow,
          image: getMappedProductImage(fallbackProduct.name, "front") || databaseRow.image || fallbackRow.image,
          sort_order: databaseRow.sort_order ?? fallbackRow.sort_order,
        };
      });

      setAdminProducts(mergedAdminProducts);
    }

    setAdminProductsLoading(false);
  }

  function splitListValue(value: string) {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  function startEditProduct(product: ProductRow) {
    setEditingProductId(isOfficialFallbackProductId(product.id) ? null : product.id);
    setProductForm({
      name: product.name || "",
      price: product.price || "",
      minPrice: String(product.min_price || 0),
      category: product.category || "",
      image: product.image || "/photos/jacket-1-front.jpeg",
      tag: product.tag || "New Arrival",
      occasion: product.occasion || "Everyday Chic",
      colors: (product.colors || []).join(", "),
      complete: (product.complete || []).join(", "),
      description: product.description || "",
      isActive: Boolean(product.is_active),
      sortOrder: String(product.sort_order || 0),
    });
  }

  function resetProductForm() {
    setEditingProductId(null);
    setProductForm(emptyProductForm);
  }

  async function getActiveSupabaseSession() {
    if (!supabase) return null;

    if (session?.user) return session;

    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error("Supabase active session check failed:", error);
      return null;
    }

    if (data.session) {
      await handleSupabaseSession(data.session);
    }

    return data.session;
  }

  async function saveProduct(event?: React.FormEvent<HTMLFormElement>) {
    event?.preventDefault();

    if (!supabase) {
      setToast(isArabic ? "Supabase غير متصل." : "Supabase is not connected.");
      return;
    }

    if (!productForm.name.trim() || !productForm.category.trim() || !productForm.image.trim()) {
      setToast(isArabic ? "اكتبي اسم المنتج والتصنيف والصورة." : "Add product name, category, and image.");
      return;
    }

    setProductSaving(true);

    try {
      const activeSession = await getActiveSupabaseSession();
      const authUser = activeSession?.user || null;
      const authEmail = (authUser?.email || "").trim().toLowerCase();

      if (!authUser) {
        setAuthMode("signIn");
        setSignInOpen(true);
        setToast(isArabic ? "سجلي الدخول مرة أخرى كأدمن." : "Please sign in again as an admin.");
        setProductSaving(false);
        return;
      }

      if (!ADMIN_EMAILS.includes(authEmail)) {
        setToast(isArabic ? "هذا الحساب ليس أدمن." : "This account is not allowed to add products.");
        setProductSaving(false);
        return;
      }

      const payload = {
        name: productForm.name.trim(),
        price: productForm.price.trim() || "EGP 0",
        min_price: Number(productForm.minPrice || 0),
        category: productForm.category.trim(),
        image: productForm.image.trim(),
        tag: productForm.tag.trim() || "New Arrival",
        occasion: productForm.occasion.trim() || "Everyday Chic",
        colors: splitListValue(productForm.colors),
        complete: splitListValue(productForm.complete),
        description: productForm.description.trim(),
        is_active: productForm.isActive,
        sort_order: Number(productForm.sortOrder || 0),
        updated_at: new Date().toISOString(),
      };

      const query = editingProductId
        ? supabase.from("products").update(payload).eq("id", editingProductId)
        : supabase.from("products").insert(payload);

      const { error } = await query;

      if (error) {
        console.error("Save product error:", error);
        setToast(error.message);
        setProductSaving(false);
        return;
      }

      await fetchStoreProducts();
      await fetchAdminProducts();
      resetProductForm();
      setToast(isArabic ? "تم حفظ المنتج" : "Product saved");
    } finally {
      setProductSaving(false);
    }
  }

  async function toggleProductActive(product: ProductRow) {
    if (!supabase || !canAccessAdmin) return;

    if (isOfficialFallbackProductId(product.id)) {
      setToast(isArabic ? "احفظي المنتج في قاعدة البيانات أولاً." : "Save this product first before hiding it.");
      startEditProduct(product);
      return;
    }

    const { error } = await supabase
      .from("products")
      .update({ is_active: !product.is_active, updated_at: new Date().toISOString() })
      .eq("id", product.id);

    if (error) {
      setToast(error.message);
      return;
    }

    await fetchStoreProducts();
    await fetchAdminProducts();
    setToast(product.is_active ? (isArabic ? "تم إخفاء المنتج" : "Product hidden") : (isArabic ? "تم إظهار المنتج" : "Product shown"));
  }

  async function deleteProduct(productId: string) {
    if (!supabase || !canAccessAdmin) return;

    if (isOfficialFallbackProductId(productId)) {
      setToast(isArabic ? "هذه قطعة أساسية في المجموعة ولا يمكن حذفها من النسخة الاحتياطية." : "This is an official collection fallback item. Save it to the database before deleting.");
      return;
    }

    const confirmed = window.confirm(isArabic ? "هل تريد حذف هذا المنتج؟" : "Delete this product?");
    if (!confirmed) return;

    const { error } = await supabase.from("products").delete().eq("id", productId);

    if (error) {
      setToast(error.message);
      return;
    }

    await fetchStoreProducts();
    await fetchAdminProducts();
    if (editingProductId === productId) resetProductForm();
    setToast(isArabic ? "تم حذف المنتج" : "Product deleted");
  }

  async function fetchProductReviews(productName: string) {
    if (!supabase || !productName) {
      setProductReviews([]);
      return;
    }

    setReviewsLoading(true);

    const { data, error } = await supabase
      .from("product_reviews")
      .select("id, user_id, product_name, rating, review_text, customer_name, customer_email, is_approved, created_at")
      .eq("product_name", productName)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setProductReviews([]);
    } else {
      setProductReviews((data || []) as ProductReview[]);
    }

    setReviewsLoading(false);
  }

  async function fetchAdminReviews() {
    if (!supabase || !canAccessAdmin) return;

    const { data, error } = await supabase
      .from("product_reviews")
      .select("id, user_id, product_name, rating, review_text, customer_name, customer_email, is_approved, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setToast(error.message);
      return;
    }

    setAllReviews((data || []) as ProductReview[]);
  }

  async function submitProductReview(event?: React.FormEvent<HTMLFormElement>) {
    event?.preventDefault();

    if (!selectedProduct) return;

    if (!supabase || !session?.user || !accountUser) {
      setAuthMode("signIn");
      setSignInOpen(true);
      setToast(isArabic ? "سجلي الدخول أولاً لإضافة تقييم." : "Please sign in first to leave a review.");
      return;
    }

    const cleanText = reviewForm.reviewText.trim();

    if (!cleanText || cleanText.length < 6) {
      setToast(isArabic ? "اكتبي تقييم قصير للمنتج." : "Write a short product review first.");
      return;
    }

    setReviewSubmitting(true);

    const { error } = await supabase.from("product_reviews").insert({
      user_id: session.user.id,
      product_name: selectedProduct.name,
      rating: Math.min(5, Math.max(1, Number(reviewForm.rating || 5))),
      review_text: cleanText,
      customer_name: accountUser.name,
      customer_email: accountUser.email,
      is_approved: false,
    });

    if (error) {
      console.error(error);
      setToast(error.message);
      setReviewSubmitting(false);
      return;
    }

    setReviewForm({ rating: 5, reviewText: "" });
    await fetchProductReviews(selectedProduct.name);
    if (canAccessAdmin) fetchAdminReviews();
    setToast(isArabic ? "تم إرسال التقييم للمراجعة" : "Review submitted for approval");
    setReviewSubmitting(false);
  }

  async function updateReviewApproval(reviewId: string, approved: boolean) {
    if (!supabase || !canAccessAdmin) return;

    const { error } = await supabase
      .from("product_reviews")
      .update({ is_approved: approved, updated_at: new Date().toISOString() })
      .eq("id", reviewId);

    if (error) {
      setToast(error.message);
      return;
    }

    setAllReviews((current) =>
      current.map((review) =>
        review.id === reviewId ? { ...review, is_approved: approved } : review
      )
    );

    if (selectedProduct) fetchProductReviews(selectedProduct.name);
    setToast(approved ? (isArabic ? "تم قبول التقييم" : "Review approved") : (isArabic ? "تم إخفاء التقييم" : "Review hidden"));
  }

  async function deleteReview(reviewId: string) {
    if (!supabase || !canAccessAdmin) return;

    const confirmed = window.confirm(isArabic ? "هل تريد حذف هذا التقييم؟" : "Delete this review?");
    if (!confirmed) return;

    const { error } = await supabase.from("product_reviews").delete().eq("id", reviewId);

    if (error) {
      setToast(error.message);
      return;
    }

    setAllReviews((current) => current.filter((review) => review.id !== reviewId));
    if (selectedProduct) fetchProductReviews(selectedProduct.name);
    setToast(isArabic ? "تم حذف التقييم" : "Review deleted");
  }

  async function fetchUserSupportMessages(userId = session?.user?.id) {
    if (!supabase || !userId) return;

    setSupportLoading(true);

    const { data, error } = await supabase
      .from("support_messages")
      .select("id, user_id, customer_name, customer_email, customer_phone, subject, message, related_order_reference, related_product_name, status, admin_note, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setSupportLoading(false);
      return;
    }

    setSupportMessages((data || []) as SupportMessage[]);
    setSupportLoading(false);
  }

  async function fetchAdminSupportMessages() {
    if (!supabase || !canAccessAdmin) return;

    setAdminSupportLoading(true);

    const { data, error } = await supabase
      .from("support_messages")
      .select("id, user_id, customer_name, customer_email, customer_phone, subject, message, related_order_reference, related_product_name, status, admin_note, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setToast(error.message);
      setAdminSupportLoading(false);
      return;
    }

    setAdminSupportMessages((data || []) as SupportMessage[]);
    setAdminSupportLoading(false);
  }

  async function submitSupportMessage(event?: React.FormEvent<HTMLFormElement>) {
    event?.preventDefault();

    if (!supabase || !session?.user || !accountUser) {
      setAuthMode("signIn");
      setSignInOpen(true);
      setToast(isArabic ? "سجلي الدخول أولاً للتواصل معنا." : "Please sign in first to contact support.");
      return;
    }

    const cleanMessage = supportForm.message.trim();

    if (!cleanMessage || cleanMessage.length < 8) {
      setToast(isArabic ? "اكتبي رسالة واضحة أولاً." : "Write a clear support message first.");
      return;
    }

    setSupportSubmitting(true);

    const { error } = await supabase.from("support_messages").insert({
      user_id: session.user.id,
      customer_name: accountUser.name,
      customer_email: accountUser.email,
      customer_phone: accountUser.phone,
      subject: supportForm.subject.trim() || "Support Request",
      message: cleanMessage,
      related_order_reference: supportForm.relatedOrderReference.trim() || null,
      related_product_name: supportForm.relatedProductName.trim() || null,
      status: "Open",
    });

    if (error) {
      console.error(error);
      setToast(error.message);
      setSupportSubmitting(false);
      return;
    }

    setSupportForm(emptySupportForm);
    await fetchUserSupportMessages(session.user.id);
    if (canAccessAdmin) fetchAdminSupportMessages();
    setToast(isArabic ? "تم إرسال رسالتك للدعم" : "Support message sent");
    setSupportSubmitting(false);
  }

  async function updateSupportMessageStatus(messageId: string, status: string) {
    if (!supabase || !canAccessAdmin) return;

    const { error } = await supabase
      .from("support_messages")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", messageId);

    if (error) {
      setToast(error.message);
      return;
    }

    setAdminSupportMessages((current) =>
      current.map((message) => (message.id === messageId ? { ...message, status } : message))
    );
    setToast(isArabic ? "تم تحديث حالة الرسالة" : "Support status updated");
  }

  async function updateSupportAdminNote(messageId: string, adminNote: string) {
    if (!supabase || !canAccessAdmin) return;

    const { error } = await supabase
      .from("support_messages")
      .update({ admin_note: adminNote, updated_at: new Date().toISOString() })
      .eq("id", messageId);

    if (error) {
      setToast(error.message);
      return;
    }

    setAdminSupportMessages((current) =>
      current.map((message) => (message.id === messageId ? { ...message, admin_note: adminNote } : message))
    );
  }

  async function deleteSupportMessage(messageId: string) {
    if (!supabase || !canAccessAdmin) return;

    const confirmed = window.confirm(isArabic ? "هل تريد حذف هذه الرسالة؟" : "Delete this support message?");
    if (!confirmed) return;

    const { error } = await supabase.from("support_messages").delete().eq("id", messageId);

    if (error) {
      setToast(error.message);
      return;
    }

    setAdminSupportMessages((current) => current.filter((message) => message.id !== messageId));
    setToast(isArabic ? "تم حذف الرسالة" : "Support message deleted");
  }

  async function fetchUserAddresses(userId = session?.user?.id) {
    if (!supabase || !userId) return;

    const { data, error } = await supabase
      .from("addresses")
      .select("id, user_id, label, full_name, phone, city, area, street, building, floor, apartment, delivery_notes, is_default, created_at")
      .eq("user_id", userId)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    setAddresses((data || []) as AccountAddress[]);
  }

  async function fetchUserWishlist(userId = session?.user?.id) {
    if (!supabase || !userId) return;

    const { data, error } = await supabase
      .from("wishlist_items")
      .select("product_name")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    setWishlist((data || []).map((item) => String(item.product_name)));
  }

  async function saveProfileDetails(event?: React.FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    if (!supabase || !session?.user?.id || !accountUser) return;

    setProfileSaving(true);

    const payload = {
      id: session.user.id,
      full_name: profileForm.name.trim() || accountUser.name,
      email: accountUser.email,
      phone: profileForm.phone.trim(),
      address_line: profileForm.addressLine.trim(),
      city: profileForm.city.trim() || "Cairo",
      area: profileForm.area.trim(),
      building: profileForm.building.trim(),
      floor: profileForm.floor.trim(),
      apartment: profileForm.apartment.trim(),
      delivery_notes: profileForm.deliveryNotes.trim(),
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("profiles").upsert(payload);

    if (error) {
      console.error(error);
      setToast(error.message);
      setProfileSaving(false);
      return;
    }

    setAccountUser((current) => current ? {
      ...current,
      name: payload.full_name,
      phone: payload.phone,
      addressLine: payload.address_line,
      city: payload.city,
      area: payload.area,
      building: payload.building,
      floor: payload.floor,
      apartment: payload.apartment,
      deliveryNotes: payload.delivery_notes,
    } : current);

    setToast(isArabic ? "تم حفظ بيانات الحساب" : "Profile details saved");
    setProfileSaving(false);
  }

  function resetAddressForm() {
    setEditingAddressId(null);
    setAddressForm({
      ...emptyAddressForm,
      fullName: accountUser?.name || "",
      phone: accountUser?.phone || "",
      city: accountUser?.city || "Cairo",
    });
  }

  function startEditAddress(address: AccountAddress) {
    setEditingAddressId(address.id);
    setAddressForm({
      label: address.label || "Home",
      fullName: address.full_name || accountUser?.name || "",
      phone: address.phone || accountUser?.phone || "",
      city: address.city || "Cairo",
      area: address.area || "",
      street: address.street || "",
      building: address.building || "",
      floor: address.floor || "",
      apartment: address.apartment || "",
      deliveryNotes: address.delivery_notes || "",
      isDefault: Boolean(address.is_default),
    });
  }

  async function saveAddress(event?: React.FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    if (!supabase || !session?.user?.id) return;

    setAddressSaving(true);

    if (addressForm.isDefault) {
      await supabase
        .from("addresses")
        .update({ is_default: false, updated_at: new Date().toISOString() })
        .eq("user_id", session.user.id);
    }

    const payload = {
      user_id: session.user.id,
      label: addressForm.label.trim() || "Home",
      full_name: addressForm.fullName.trim() || accountUser?.name || "La Grazia Client",
      phone: addressForm.phone.trim() || accountUser?.phone || "",
      city: addressForm.city.trim() || "Cairo",
      area: addressForm.area.trim(),
      street: addressForm.street.trim(),
      building: addressForm.building.trim(),
      floor: addressForm.floor.trim(),
      apartment: addressForm.apartment.trim(),
      delivery_notes: addressForm.deliveryNotes.trim(),
      is_default: addressForm.isDefault || addresses.length === 0,
      updated_at: new Date().toISOString(),
    };

    const query = editingAddressId
      ? supabase.from("addresses").update(payload).eq("id", editingAddressId).eq("user_id", session.user.id)
      : supabase.from("addresses").insert(payload);

    const { error } = await query;

    if (error) {
      console.error(error);
      setToast(error.message);
      setAddressSaving(false);
      return;
    }

    await fetchUserAddresses(session.user.id);
    resetAddressForm();
    setToast(isArabic ? "تم حفظ عنوان التوصيل" : "Delivery address saved");
    setAddressSaving(false);
  }

  async function deleteAddress(addressId: string) {
    if (!supabase || !session?.user?.id) return;

    const { error } = await supabase
      .from("addresses")
      .delete()
      .eq("id", addressId)
      .eq("user_id", session.user.id);

    if (error) {
      setToast(error.message);
      return;
    }

    await fetchUserAddresses(session.user.id);
    if (editingAddressId === addressId) resetAddressForm();
    setToast(isArabic ? "تم حذف العنوان" : "Address removed");
  }

  async function makeDefaultAddress(address: AccountAddress) {
    if (!supabase || !session?.user?.id) return;

    await supabase.from("addresses").update({ is_default: false }).eq("user_id", session.user.id);
    const { error } = await supabase
      .from("addresses")
      .update({ is_default: true, updated_at: new Date().toISOString() })
      .eq("id", address.id)
      .eq("user_id", session.user.id);

    if (error) {
      setToast(error.message);
      return;
    }

    fetchUserAddresses(session.user.id);
    setToast(isArabic ? "تم اختيار العنوان الافتراضي" : "Default address updated");
  }

  async function fetchUserOrders(userId = session?.user?.id) {
    if (!supabase || !userId) return;

    const { data, error } = await supabase
      .from("orders")
      .select("id, order_reference, total_amount, currency, payment_status, order_status, created_at, order_items(id, product_name, product_image, size, color, quantity, unit_price, total_price)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setAccountOrders(data as AccountOrder[]);
    }
  }

  async function fetchAdminOrders() {
    if (!supabase) return;

    setAdminLoading(true);

    const { data, error } = await supabase
      .from("orders")
      .select("id, user_id, order_reference, total_amount, currency, payment_status, order_status, customer_name, customer_email, customer_phone, created_at, order_items(id, product_name, product_image, size, color, quantity, unit_price, total_price)")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setToast(error.message);
    } else {
      setAdminOrders((data || []) as AdminOrder[]);
    }

    setAdminLoading(false);
  }

  async function updateAdminOrderStatus(orderId: string, nextStatus: string) {
    if (!supabase || !canAccessAdmin) return;

    const nextPaymentStatus = nextStatus === "Pending Payment" ? "pending" : nextStatus === "Cancelled" ? "cancelled" : "paid";

    const { error } = await supabase
      .from("orders")
      .update({
        order_status: nextStatus,
        payment_status: nextPaymentStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    if (error) {
      console.error(error);
      setToast(error.message);
      return;
    }

    setAdminOrders((current) =>
      current.map((order) =>
        order.id === orderId
          ? { ...order, order_status: nextStatus, payment_status: nextPaymentStatus }
          : order
      )
    );

    if (session?.user?.id) {
      fetchUserOrders(session.user.id);
    }

    setToast(isArabic ? "تم تحديث حالة الحجز المسبق" : "Pre-order status updated");
  }

  function openProduct(product: Product) {
    setSelectedProduct(product);
    setSelectedImageView("front");
    setSelectedSize(isLaGraziaSilkScarf(product.name) ? "One Size" : "M");
    setSelectedColor(product.colors[0]);
    setQuantity(1);
    setItemSizeChartOpen(false);
    setReviewForm({ rating: 5, reviewText: "" });
    fetchProductReviews(product.name);
  }

  function addToCart(product: Product, size = "M", color = product.colors[0], qty = 1) {
    setCart((current) => {
      const existingIndex = current.findIndex(
        (item) => item.product.name === product.name && item.size === size && item.color === color
      );

      if (existingIndex !== -1) {
        return current.map((item, index) =>
          index === existingIndex ? { ...item, quantity: item.quantity + qty } : item
        );
      }

      return [...current, { product, size, color, quantity: qty }];
    });

    setCartOpen(true);
    setToast(t.toastAdded);
  }

  function removeFromCart(indexToRemove: number) {
    setCart((current) => current.filter((_, index) => index !== indexToRemove));
  }

  function updateCartQuantity(indexToUpdate: number, newQuantity: number) {
    if (newQuantity < 1) {
      removeFromCart(indexToUpdate);
      return;
    }

    setCart((current) =>
      current.map((item, index) =>
        index === indexToUpdate ? { ...item, quantity: newQuantity } : item
      )
    );
  }

  async function toggleWishlist(product: Product) {
    const exists = wishlist.includes(product.name);

    setWishlist((current) =>
      current.includes(product.name)
        ? current.filter((name) => name !== product.name)
        : [...current, product.name]
    );

    setToast(exists ? t.toastRemoved : t.toastSaved);

    if (!supabase || !session?.user?.id) return;

    if (exists) {
      const { error } = await supabase
        .from("wishlist_items")
        .delete()
        .eq("user_id", session.user.id)
        .eq("product_name", product.name);

      if (error) {
        console.error(error);
        setToast(error.message);
        fetchUserWishlist(session.user.id);
      }

      return;
    }

    const { error } = await supabase
      .from("wishlist_items")
      .upsert(
        {
          user_id: session.user.id,
          product_name: product.name,
          product_image: product.image,
          product_category: product.category,
          product_price: product.price,
          product_min_price: product.minPrice,
        },
        { onConflict: "user_id,product_name" }
      );

    if (error) {
      console.error(error);
      setToast(error.message);
      fetchUserWishlist(session.user.id);
    }
  }

  async function handleNewsletterSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanEmail = newsletterEmail.trim().toLowerCase();

    if (!cleanEmail.includes("@") || !cleanEmail.includes(".")) {
      setNewsletterStatus(t.invalidEmail);
      return;
    }

    setPrivateListLoading(true);
    setNewsletterStatus("");

    try {
      const response = await fetch("/api/send-private-list-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: cleanEmail,
          customerName: accountUser?.name || "La Grazia Client",
          customerPhone: accountUser?.phone || null,
          preferredStyle: selectedMood || "Italian elegance",
          language,
        }),
      });

      let data: { ok?: boolean; error?: string } = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Private list request failed");
      }

      setNewsletterEmail("");
      setNewsletterStatus(
        isArabic
          ? "تم تسجيلك في القائمة الخاصة وتم إرسال رسالة ترحيب فاخرة إلى بريدك الإلكتروني."
          : "You are now on the La Grazia private list. A luxury welcome email has been sent to you."
      );
      setToast(isArabic ? "تم الانضمام للقائمة الخاصة" : "Joined the private list");
    } catch (error) {
      console.error("Private list signup failed:", error);
      setNewsletterStatus(
        isArabic
          ? "لم يتم حفظ البريد الآن. حاولي مرة أخرى بعد قليل."
          : "Could not save right now. Please try again in a moment."
      );
      setToast(error instanceof Error ? error.message : "Private list request failed");
    } finally {
      setPrivateListLoading(false);
    }
  }


  function normalizeOfferEmail(email: string) {
    return email.trim().toLowerCase();
  }

  function isValidOfferEmail(email: string) {
    const cleanEmail = normalizeOfferEmail(email);
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail);
  }

  async function callPrivateOfferApi(action: "status" | "claim" | "redeem" | "release", email: string, orderReference?: string): Promise<PrivateOfferApiResponse> {
    const cleanEmail = normalizeOfferEmail(email);

    if (!isValidOfferEmail(cleanEmail)) {
      return { ok: false, status: "error", error: "Invalid email address" } as PrivateOfferApiResponse;
    }

    try {
      const response = await fetch("/api/private-offer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action,
          email: cleanEmail,
          code: PRIVATE_OFFER_CODE,
          orderReference,
        }),
      });

      let data: PrivateOfferApiResponse = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok || !data.ok) {
        return {
          ok: false,
          status: data.status || "error",
          error: data.error || data.message || "Private offer request failed",
        };
      }

      return data;
    } catch (error) {
      console.error("Private offer request failed:", error);

      return {
        ok: false,
        status: "error",
        error: error instanceof Error ? error.message : "Private offer request failed",
      };
    }
  }

  async function refreshPrivateOfferStatus(email: string) {
    const cleanEmail = normalizeOfferEmail(email);

    if (!isValidOfferEmail(cleanEmail)) {
      setPrivateOfferStatus("unknown");
      return;
    }

    const result = await callPrivateOfferApi("status", cleanEmail);
    const nextStatus = result.status || "unknown";

    if (result.ok && (nextStatus === "claimed" || nextStatus === "used" || nextStatus === "unclaimed")) {
      setPrivateOfferStatus(nextStatus);

      if (nextStatus === "used" && typeof window !== "undefined") {
        window.localStorage.removeItem(LAGRAZIA_OFFER_STORAGE_KEY);
      }
    } else {
      setPrivateOfferStatus("unknown");
    }
  }

  async function claimPrivateOffer(email: string): Promise<PrivateOfferApiResponse> {
    const cleanEmail = normalizeOfferEmail(email);
    const result = await callPrivateOfferApi("claim", cleanEmail);

    if (result.ok && result.status === "claimed") {
      setPrivateOfferStatus("claimed");
    } else if (result.status === "used") {
      setPrivateOfferStatus("used");
    }

    return result;
  }

  async function redeemPrivateOffer(email: string, orderReference: string): Promise<PrivateOfferApiResponse> {
    const cleanEmail = normalizeOfferEmail(email);
    const result = await callPrivateOfferApi("redeem", cleanEmail, orderReference);

    if (result.ok && result.status === "redeemed") {
      setPrivateOfferStatus("used");
    } else if (result.status === "used") {
      setPrivateOfferStatus("used");
    }

    return result;
  }

  async function releasePrivateOffer(email: string, orderReference: string): Promise<PrivateOfferApiResponse> {
    const cleanEmail = normalizeOfferEmail(email);
    const result = await callPrivateOfferApi("release", cleanEmail, orderReference);

    if (result.ok && result.status === "claimed") {
      setPrivateOfferStatus("claimed");
    }

    return result;
  }

  function getSavedOfferEmail() {
    if (typeof window === "undefined") return "";

    const savedOfferEmail = window.localStorage.getItem(LAGRAZIA_OFFER_STORAGE_KEY) || "";
    return savedOfferEmail.includes("@") ? savedOfferEmail : "";
  }

  function closeOfferPopup(dismiss = true) {
    setOfferPopupOpen(false);
    setOfferJustUnlocked(false);
    setOfferCelebrationOpen(false);

    if (dismiss && typeof window !== "undefined") {
      window.sessionStorage.setItem(LAGRAZIA_OFFER_DISMISS_STORAGE_KEY, "true");
    }
  }

  async function handleOfferSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanEmail = normalizeOfferEmail(offerEmail);

    if (!isValidOfferEmail(cleanEmail)) {
      setOfferStatus(isArabic ? "من فضلك اكتبي بريد إلكتروني صحيح." : "Please enter a valid email address.");
      return;
    }

    setOfferSubmitting(true);
    setOfferStatus("");

    try {
      const offerClaim = await claimPrivateOffer(cleanEmail);

      if (!offerClaim.ok || offerClaim.status === "error") {
        setOfferStatus(
          isArabic
            ? "لم نتمكن من تفعيل الامتياز الآن. حاولي مرة أخرى بعد قليل."
            : "We could not activate the private privilege right now. Please try again in a moment."
        );
        setToast(offerClaim.error || "Private offer request failed");
        return;
      }

      if (offerClaim.status === "used" || offerClaim.canUse === false) {
        if (typeof window !== "undefined") {
          window.localStorage.removeItem(LAGRAZIA_OFFER_STORAGE_KEY);
        }

        setOfferStatus(
          isArabic
            ? "تم استخدام امتياز أول حجز مسبق لهذا البريد من قبل."
            : "This first pre-order privilege has already been used for this email."
        );
        setToast(isArabic ? "تم استخدام كود GRAZIA10 من قبل" : "GRAZIA10 was already used for this email");
        return;
      }

      if (typeof window !== "undefined") {
        window.localStorage.setItem(LAGRAZIA_OFFER_STORAGE_KEY, cleanEmail);
        window.sessionStorage.setItem(LAGRAZIA_OFFER_DISMISS_STORAGE_KEY, "true");
      }

      setNewsletterEmail(cleanEmail);

      await fetch("/api/send-private-list-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: cleanEmail,
          customerName: accountUser?.name || "La Grazia Client",
          customerPhone: accountUser?.phone || null,
          preferredStyle: selectedMood || "Italian elegance",
          language,
        }),
      }).catch((error) => {
        console.error("Private offer email failed:", error);
      });

      setOfferStatus(
        isArabic
          ? "تم تفعيل امتياز GRAZIA10 لأول حجز مسبق فقط."
          : "GRAZIA10 is now secured for your first pre-order only."
      );
      setOfferJustUnlocked(true);
      setOfferCelebrationOpen(true);
      setToast(isArabic ? "تم تفعيل امتياز أول حجز مسبق" : "First pre-order privilege secured");

      if (typeof window !== "undefined") {
        window.setTimeout(() => {
          closeOfferPopup(false);
        }, 5600);
      } else {
        closeOfferPopup(false);
      }
    } finally {
      setOfferSubmitting(false);
    }
  }

  async function handlePayNow() {
    if (cart.length === 0) {
      setToast(t.emptyBag);
      return;
    }

    const activeSession = await getActiveSupabaseSession();
    const guestEmail = offerEmail.trim().toLowerCase() || getSavedOfferEmail() || newsletterEmail.trim().toLowerCase();

    if (!accountUser && (!guestEmail || !guestEmail.includes("@"))) {
      setOfferPopupOpen(true);
      setOfferStatus(isArabic ? "اكتبي بريدك للحصول على الوصول الخاص وإكمال الحجز المسبق." : "Add your email to receive private access and continue your pre-order.");
      setToast(isArabic ? "اكتبي بريدك لإكمال الحجز المسبق." : "Add your email to continue the pre-order.");
      return;
    }

    const checkoutUserId = activeSession?.user?.id || accountUser?.id || null;
    const cleanGuestEmail = normalizeOfferEmail(guestEmail);
    const offerOrderReference = `LG-OFFER-${Date.now()}`;
    let offerRedeemedForCheckout = false;

    try {
      setPaymentLoading(true);

      let hasPrivateOfferDiscount = false;

      if (isValidOfferEmail(cleanGuestEmail)) {
        const offerRedemption = await redeemPrivateOffer(cleanGuestEmail, offerOrderReference);

        if (offerRedemption.ok && offerRedemption.status === "redeemed") {
          hasPrivateOfferDiscount = true;
          offerRedeemedForCheckout = true;

          if (typeof window !== "undefined") {
            window.localStorage.removeItem(LAGRAZIA_OFFER_STORAGE_KEY);
          }
        } else if (offerRedemption.status === "used") {
          setToast(
            isArabic
              ? "تم استخدام امتياز GRAZIA10 لهذا البريد من قبل، لذلك سيستمر الطلب بدون الخصم."
              : "GRAZIA10 has already been used for this email, so this pre-order will continue without the discount."
          );

          if (typeof window !== "undefined") {
            window.localStorage.removeItem(LAGRAZIA_OFFER_STORAGE_KEY);
          }
        }
      }

      const paymentItems = cart.map((item) => {
        const unitPrice = hasPrivateOfferDiscount ? Math.max(1, Math.round(item.product.minPrice * 0.90)) : item.product.minPrice;

        return {
          name: item.product.name,
          price: unitPrice,
          quantity: item.quantity,
          description: isLaGraziaSilkScarf(item.product.name)
            ? `${item.product.name} - Color: ${item.color}${hasPrivateOfferDiscount ? " - GRAZIA10 applied" : ""}`
            : `${item.product.name} - Size: ${item.size} - Color: ${item.color}${hasPrivateOfferDiscount ? " - GRAZIA10 applied" : ""}`,
        };
      });

      const totalAmount = paymentItems.reduce((total, item) => total + item.price * item.quantity, 0);
      const deliveryAddress = defaultAddress;
      const checkoutName = deliveryAddress?.full_name || accountUser?.name || "La Grazia Client";
      const nameParts = checkoutName.trim().split(" ").filter(Boolean);
      const firstName = nameParts[0] || "La";
      const lastName = nameParts.slice(1).join(" ") || "Grazia";
      const checkoutPhone = deliveryAddress?.phone || accountUser?.phone || `+${WHATSAPP_NUMBER}`;
      const checkoutCity = deliveryAddress?.city || accountUser?.city || "Cairo";
      const checkoutStreet = [deliveryAddress?.area, deliveryAddress?.street, accountUser?.addressLine].filter(Boolean).join(" - ") || "Cairo";
      const checkoutBuilding = deliveryAddress?.building || accountUser?.building || "1";
      const checkoutFloor = deliveryAddress?.floor || accountUser?.floor || "1";
      const checkoutApartment = deliveryAddress?.apartment || accountUser?.apartment || "1";

      const response = await fetch("/api/create-paymob-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: paymentItems,
          customer: {
            firstName,
            lastName,
            email: accountUser?.email || guestEmail || BRAND_EMAIL,
            phone: checkoutPhone,
            city: checkoutCity,
            street: checkoutStreet,
            building: checkoutBuilding,
            floor: checkoutFloor,
            apartment: checkoutApartment,
          },
        }),
      });

      let data: { checkoutUrl?: string; url?: string; orderReference?: string; error?: string } = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      const checkoutUrl = data.checkoutUrl || data.url;

      if (!response.ok || !checkoutUrl) {
        console.error(data);

        if (offerRedeemedForCheckout && isValidOfferEmail(cleanGuestEmail)) {
          await releasePrivateOffer(cleanGuestEmail, offerOrderReference);
        }

        if (window.location.hostname === "localhost") {
          setToast(t.paymentServerError || t.paymentError);
        } else {
          setToast(t.paymentError);
        }

        return;
      }

      if (supabase && checkoutUserId) {
        const orderReference = data.orderReference || `LG-${Date.now()}`;

        const { data: orderData, error: orderError } = await supabase
          .from("orders")
          .insert({
            user_id: checkoutUserId,
            order_reference: orderReference,
            total_amount: totalAmount,
            currency: "EGP",
            payment_status: "pending",
            order_status: "Pending Payment",
            paymob_checkout_url: checkoutUrl,
            customer_name: checkoutName,
            customer_email: accountUser?.email || guestEmail || BRAND_EMAIL,
            customer_phone: checkoutPhone,
            delivery_city: checkoutCity,
            delivery_area: deliveryAddress?.area || accountUser?.area || "",
            delivery_street: checkoutStreet,
            delivery_building: checkoutBuilding,
            delivery_floor: checkoutFloor,
            delivery_apartment: checkoutApartment,
            delivery_notes: deliveryAddress?.delivery_notes || accountUser?.deliveryNotes || "",
          })
          .select("id")
          .single();

        if (!orderError && orderData?.id) {
          const orderItems = cart.map((item) => {
            const unitPrice = hasPrivateOfferDiscount ? Math.max(1, Math.round(item.product.minPrice * 0.90)) : item.product.minPrice;

            return {
              order_id: orderData.id,
              user_id: checkoutUserId,
              product_name: item.product.name,
              product_image: item.product.image,
              size: isLaGraziaSilkScarf(item.product.name) ? null : item.size,
              color: item.color,
              quantity: item.quantity,
              unit_price: unitPrice,
              total_price: unitPrice * item.quantity,
            };
          });

          await supabase.from("order_items").insert(orderItems);

          try {
            await fetch("/api/send-order-email", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                order: {
                  id: orderData.id,
                  orderReference,
                  totalAmount,
                  currency: "EGP",
                  paymentStatus: "pending",
                  orderStatus: "Pending Payment",
                  checkoutUrl,
                  createdAt: new Date().toISOString(),
                },
                customer: {
                  name: checkoutName,
                  email: accountUser?.email || guestEmail || BRAND_EMAIL,
                  phone: checkoutPhone,
                },
                address: {
                  city: checkoutCity,
                  area: deliveryAddress?.area || accountUser?.area || "",
                  street: checkoutStreet,
                  building: checkoutBuilding,
                  floor: checkoutFloor,
                  apartment: checkoutApartment,
                  notes: deliveryAddress?.delivery_notes || accountUser?.deliveryNotes || "",
                },
                items: orderItems.map((item) => ({
                  productName: item.product_name,
                  productImage: item.product_image,
                  size: item.size,
                  color: item.color,
                  quantity: item.quantity,
                  unitPrice: item.unit_price,
                  totalPrice: item.total_price,
                })),
              }),
            });
          } catch (emailError) {
            console.error("Pre-order confirmation email failed:", emailError);
          }

          if (checkoutUserId) fetchUserOrders(checkoutUserId);
        } else {
          console.error(orderError);
        }
      }

      window.location.href = checkoutUrl;
    } catch (error) {
      console.error(error);

      if (offerRedeemedForCheckout && isValidOfferEmail(cleanGuestEmail)) {
        await releasePrivateOffer(cleanGuestEmail, offerOrderReference);
      }

      if (window.location.hostname === "localhost") {
        setToast(t.paymentServerError || t.paymentError);
      } else {
        setToast(t.paymentError);
      }
    } finally {
      setPaymentLoading(false);
    }
  }

  async function handleSignInSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase) {
      setToast(isArabic ? "Supabase غير متصل. تأكدي من متغيرات Vercel." : "Supabase is not connected. Check your Vercel environment variables.");
      return;
    }

    const email = accountForm.email.trim();
    const password = accountForm.password.trim();
    const fullName = accountForm.name.trim() || "La Grazia Client";
    const phone = accountForm.phone.trim();

    if (!email || !password || password.length < 6) {
      setToast(isArabic ? "اكتبي إيميل وباسورد من ٦ حروف على الأقل." : "Enter an email and a password of at least 6 characters.");
      return;
    }

    setAccountLoading(true);

    try {
      if (authMode === "signUp") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/#account`,
            data: {
              full_name: fullName,
              phone,
            },
          },
        });

        if (error) {
          setToast(error.message);
          return;
        }

        if (data.session && data.user) {
          await supabase.from("profiles").upsert({
            id: data.user.id,
            full_name: fullName,
            email,
            phone,
            updated_at: new Date().toISOString(),
          });

          const { data: savedSignUpSessionData } = await supabase.auth.setSession({
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
          });

          if (savedSignUpSessionData.session) {
            await handleSupabaseSession(savedSignUpSessionData.session);
            setAccountView("profile");
            setAccountPageOpen(true);
            window.setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 80);
          }
        }

        if (!data.session) {
          setVerificationNotice(t.accountConfirmationSent);
          setToast(t.accountConfirmationSent);
          setAuthMode("signIn");
          setAccountForm((current) => ({ ...current, password: "" }));
          return;
        }

        setVerificationNotice("");
        setToast(t.accountCreated);
      } else {
        clearOldSupabaseAuthStorage();

        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
          setToast(error.message);
          return;
        }

        if (!data.session) {
          setToast(isArabic ? "تم تسجيل الدخول ولكن لم يتم حفظ الجلسة. انتظري دقيقة ثم جربي مرة أخرى." : "Signed in, but the session was not saved. Wait a minute, then try again.");
          return;
        }

        const { data: savedSessionData, error: saveSessionError } = await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });

        if (saveSessionError || !savedSessionData.session) {
          console.error("Supabase session save failed:", saveSessionError);
          setToast(isArabic ? "تم تسجيل الدخول لكن الجلسة لم تحفظ. امسحي بيانات الموقع وجربي مرة أخرى." : "Signed in, but the session could not be saved. Clear site data and try again.");
          return;
        }

        await handleSupabaseSession(savedSessionData.session);
        setVerificationNotice("");
        setAccountView("orders");
        setAccountPageOpen(true);
        window.setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 80);
        setToast(t.signedInWelcome);
      }

      setSignInOpen(false);
      setAccountForm((current) => ({ ...current, password: "" }));
    } finally {
      setAccountLoading(false);
    }
  }

  async function handleSignOut() {
    if (supabase) {
      await supabase.auth.signOut();
    }

    if (typeof window !== "undefined") {
      window.localStorage.removeItem(LAGRAZIA_AUTH_STORAGE_KEY);
      clearOldSupabaseAuthStorage();
    }

    setAccountUser(null);
    setAccountForm({ name: "", email: "", phone: "", password: "" });
    setProfileForm({ name: "", email: "", phone: "", addressLine: "", city: "Cairo", area: "", building: "", floor: "", apartment: "", deliveryNotes: "" });
    setAddressForm(emptyAddressForm);
    setEditingAddressId(null);
    setAddresses([]);
    setAccountOrders([]);
    setAdminOrders([]);
    setWishlist([]);
    setSession(null);
    setAuthMode("signIn");
    setAccountPageOpen(false);
  }

  function openSearch() {
    setSearchOpen(true);
    setMenuOpen(false);
    setCartOpen(false);
  }

  function goToCollectionFromSearch() {
    setSearchOpen(false);
    setAccountPageOpen(false);
    window.setTimeout(() => {
      document.getElementById("collection")?.scrollIntoView({ behavior: "smooth" });
    }, 80);
  }

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }

        html { scroll-behavior: smooth; }

        body {
          margin: 0;
          background: #f7f1e8;
          color: #241a14;
          font-family: Inter, Arial, sans-serif;
          overflow-x: hidden;
        }

        button, input, select { font-family: inherit; }
        button { cursor: pointer; }
        a { color: inherit; text-decoration: none; }
        img { max-width: 100%; }

        .scrollProgress {
          position: fixed;
          top: 0;
          left: 0;
          height: 3px;
          background: linear-gradient(90deg, #b08a45, #d7b46f);
          z-index: 300;
          transition: width 0.15s ease;
        }

        .reveal {
          opacity: 0;
          transform: translateY(44px);
          transition: opacity 1.15s cubic-bezier(.16, 1, .3, 1), transform 1.15s cubic-bezier(.16, 1, .3, 1);
          will-change: opacity, transform;
        }

        .reveal.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .page {
          min-height: 100vh;
          background:
            radial-gradient(circle at top left, rgba(176, 138, 69, 0.10), transparent 34%),
            #f7f1e8;
          color: #241a14;
          transition: background 0.45s ease, color 0.45s ease;
          animation: pageFade 0.9s ease forwards;
        }

        .page.darkMode {
          background:
            radial-gradient(circle at top left, rgba(215, 180, 111, 0.13), transparent 36%),
            linear-gradient(180deg, #1f1510 0%, #160f0b 100%);
          color: #fff9f0;
        }

        .page.arabic { direction: rtl; }

        .page.arabic .brandMark,
        .page.arabic .productInfo,
        .page.arabic .modal,
        .page.arabic .cartItem,
        .page.arabic .menuWishlistCard {
          direction: ltr;
        }

        .page.arabic .heroCopy,
        .page.arabic .sectionHead,
        .page.arabic .cleanPanel,
        .page.arabic .newsletterBox,
        .page.arabic .footerInner,
        .page.arabic .shopTools,
        .page.arabic .storyGrid,
        .page.arabic .trustBar,
        .page.arabic .giftCardBox {
          direction: rtl;
          text-align: right;
        }

        .darkMode h1,
        .darkMode h2,
        .darkMode h3,
        .darkMode h4,
        .darkMode .sectionTitle,
        .darkMode .panelTitle,
        .darkMode .productInfo h4,
        .darkMode .footerLogo {
          color: #fff9f0 !important;
        }

        .darkMode p,
        .darkMode span,
        .darkMode td,
        .darkMode a,
        .darkMode .sectionIntro,
        .darkMode .panelText,
        .darkMode .price,
        .darkMode .productInfo p,
        .darkMode .modalInfo p,
        .darkMode .cartItem p,
        .darkMode .emptyState,
        .darkMode .fitNote p {
          color: #eadcc8;
        }

        .darkMode .eyebrow,
        .darkMode .category,
        .darkMode .footerTag,
        .darkMode .newsletterStatus,
        .darkMode .storyPoint span {
          color: #d7b46f !important;
        }

        .topBar {
          background: #2c1f18;
          color: #f7f1e8;
          padding: 0;
          overflow: hidden;
          white-space: nowrap;
          border-bottom: 1px solid rgba(215, 180, 111, 0.18);
          animation: topBarDrop 0.75s ease both;
          line-height: 1;
          position: relative;
        }

        .topBar::before,
        .topBar::after {
          content: "";
          position: absolute;
          top: 0;
          bottom: 0;
          width: 80px;
          z-index: 2;
          pointer-events: none;
        }

        .topBar::before {
          left: 0;
          background: linear-gradient(90deg, #2c1f18, rgba(44, 31, 24, 0));
        }

        .topBar::after {
          right: 0;
          background: linear-gradient(270deg, #2c1f18, rgba(44, 31, 24, 0));
        }

        .topBarTrack {
          display: flex;
          width: max-content;
          align-items: center;
          animation: topBarMarquee 36s linear infinite;
          will-change: transform;
        }

        .topBar:hover .topBarTrack {
          animation-play-state: paused;
        }

        .topBarGroup {
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }

        .topBarItem {
          display: inline-flex;
          align-items: center;
          padding: 12px 0;
          font-size: 11px;
          letter-spacing: 0.24em;
          text-transform: uppercase;
          color: #f7f1e8;
        }

        .topBarDivider {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #d7b46f;
          margin: 0 46px;
          box-shadow: 0 0 16px rgba(215, 180, 111, 0.55);
          flex: 0 0 auto;
        }

        .nav {
          position: sticky;
          top: 0;
          z-index: 30;
          background: rgba(247, 241, 232, 0.94);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(176, 138, 69, 0.22);
          animation: navDrop 0.8s ease 0.15s both;
        }

        .darkMode .nav {
          background: rgba(31, 21, 16, 0.94);
          border-color: rgba(215, 180, 111, 0.28);
        }

        .navInner {
          width: min(1680px, 100%);
          margin: 0 auto;
          padding: 18px clamp(28px, 4vw, 72px);
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          gap: 24px;
        }

        .navLeft {
          display: flex;
          align-items: center;
          gap: 18px;
          min-width: 0;
          justify-self: start;
        }

        .menuTrigger {
          flex: 0 0 auto;
        }

        .navLinks {
          display: flex;
          gap: 30px;
          font-size: 12px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #5f4c3e;
        }

        .darkMode .navLinks { color: #eadcc8; }

        .navLinks a {
          position: relative;
          transition: color 0.25s ease;
        }

        .navLinks a::after {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          bottom: -7px;
          height: 1px;
          background: #b08a45;
          transform: scaleX(0);
          transform-origin: center;
          transition: transform 0.3s ease;
        }

        .navLinks a:hover { color: #b08a45; }
        .navLinks a:hover::after { transform: scaleX(1); }

        .brandMark {
          text-align: center;
          line-height: 1;
          transition: transform 0.3s ease;
        }

        .brandMark:hover { transform: scale(1.025); }

        .brandMark h1 {
          margin: 0;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 34px;
          font-weight: 500;
          letter-spacing: 0.18em;
        }

        .brandMark p {
          margin: 8px 0 0;
          color: #b08a45;
          font-size: 10px;
          letter-spacing: 0.32em;
          text-transform: uppercase;
        }

        .navActions {
          justify-self: end;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .iconBtn,
        .pillBtn {
          border: 1px solid rgba(176, 138, 69, 0.34);
          background: rgba(255, 249, 240, 0.60);
          color: inherit;
          border-radius: 999px;
          min-height: 40px;
          transition: transform 0.25s ease, background 0.25s ease, color 0.25s ease, box-shadow 0.25s ease;
        }

        .darkMode .iconBtn,
        .darkMode .pillBtn {
          background: rgba(255, 249, 240, 0.08);
          color: #fff9f0;
          border-color: rgba(215, 180, 111, 0.44);
        }

        .iconBtn {
          width: 40px;
          display: grid;
          place-items: center;
          position: relative;
        }

        .pillBtn {
          padding: 0 16px;
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .iconBtn:hover,
        .pillBtn:hover {
          background: #e8d6bd;
          color: #2c1f18;
          transform: translateY(-2px);
          box-shadow: 0 10px 24px rgba(36, 26, 20, 0.12);
        }


        .signInBtn {
          position: relative;
          overflow: hidden;
          border-color: rgba(176, 138, 69, 0.55) !important;
          background: linear-gradient(135deg, rgba(255, 249, 240, 0.92), rgba(232, 214, 189, 0.72)) !important;
          box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.34), 0 10px 26px rgba(176, 138, 69, 0.10);
          white-space: nowrap;
        }

        .signInBtn::before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(120deg, transparent, rgba(198, 161, 91, 0.28), transparent);
          transform: translateX(-120%);
          transition: transform 0.7s ease;
        }

        .signInBtn:hover::before { transform: translateX(120%); }

        .darkMode .signInBtn {
          background: linear-gradient(135deg, rgba(215, 180, 111, 0.20), rgba(255, 249, 240, 0.08)) !important;
          color: #fff9f0;
        }

        .accountShortName {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          position: relative;
          z-index: 1;
        }

        .accountAvatar {
          width: 26px;
          height: 26px;
          border-radius: 999px;
          display: inline-grid;
          place-items: center;
          flex: 0 0 auto;
          background: #2c1f18;
          color: #fff9f0;
          border: 1px solid rgba(176, 138, 69, 0.45);
          font-size: 10px;
          line-height: 1;
          letter-spacing: 0.08em;
          font-weight: 700;
          text-transform: uppercase;
          box-shadow: 0 7px 15px rgba(36, 26, 20, 0.10);
        }

        .accountAvatar svg {
          width: 16px;
          height: 16px;
        }

        .accountDesktopLabel {
          display: inline-block;
          position: relative;
          z-index: 1;
        }

        .signedAccountBtn .accountAvatar {
          background: linear-gradient(135deg, #2c1f18, #5a4636);
          color: #fff9f0;
        }

        .darkMode .accountAvatar {
          background: #d7b46f;
          color: #211713;
          border-color: rgba(255, 249, 240, 0.32);
        }

        .accountDot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #b08a45;
          box-shadow: 0 0 0 4px rgba(176, 138, 69, 0.16);
        }

        .cartBubble {
          position: absolute;
          right: -2px;
          top: -2px;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #b08a45;
          color: white;
          display: grid;
          place-items: center;
          font-size: 10px;
          animation: bubblePop 0.35s ease;
        }

        .section {
          width: min(1680px, 100%);
          margin: 0 auto;
          padding: 86px clamp(28px, 4vw, 72px);
        }

        .hero {
          width: min(1680px, 100%);
          min-height: calc(100vh - 92px);
          margin: 0 auto;
          padding: 52px clamp(28px, 4vw, 72px) 42px;
          display: grid;
          grid-template-columns: 0.92fr 1.08fr;
          gap: 36px;
          align-items: stretch;
        }

        .heroCopy {
          background: #efe3d2;
          border: 1px solid rgba(176, 138, 69, 0.22);
          border-radius: 38px;
          padding: clamp(48px, 5vw, 86px);
          display: flex;
          flex-direction: column;
          justify-content: center;
          min-height: calc(100vh - 190px);
          animation: heroCopyIn 1.15s cubic-bezier(.16, 1, .3, 1) 0.35s both;
          position: relative;
          overflow: hidden;
        }

        .heroCopy::after {
          content: "LG";
          position: absolute;
          right: -30px;
          bottom: -50px;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 240px;
          color: rgba(176, 138, 69, 0.10);
          pointer-events: none;
        }

        .page.arabic .heroCopy::after {
          right: auto;
          left: -30px;
        }

        .heroCopy > * {
          position: relative;
          z-index: 1;
        }

        .darkMode .heroCopy {
          background: #2c1f18;
          border-color: rgba(215, 180, 111, 0.32);
        }

        .eyebrow {
          margin: 0 0 16px;
          color: #b08a45;
          font-size: 12px;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          line-height: 1.8;
        }

        .heroCopy .eyebrow,
        .heroCopy h2,
        .heroCopy .description,
        .heroCopy .preOrderNotice,
        .heroCopy .launchCountdown,
        .heroCopy .actions {
          opacity: 0;
          animation: fadeUp 1s cubic-bezier(.16, 1, .3, 1) forwards;
        }

        .heroCopy .eyebrow { animation-delay: 0.95s; }
        .heroCopy h2 { animation-delay: 1.18s; }
        .heroCopy .description { animation-delay: 1.42s; }
        .heroCopy .preOrderNotice { animation-delay: 1.56s; }
        .heroCopy .launchCountdown { animation-delay: 1.68s; }
        .heroCopy .actions { animation-delay: 1.9s; }

        .heroCopy h2,
        .sectionTitle,
        .panelTitle {
          font-family: Georgia, "Times New Roman", serif;
          font-weight: 500;
          line-height: 1.05;
          letter-spacing: 0.01em;
        }

        .heroCopy h2 {
          margin: 0;
          font-size: clamp(56px, 6vw, 104px);
        }

        .heroCopy p.description {
          max-width: 760px;
          margin: 30px 0 0;
          color: #6a5545;
          font-size: clamp(18px, 1.2vw, 23px);
          line-height: 1.9;
        }

        .preOrderNotice {
          max-width: 760px;
          margin: 22px 0 0;
          padding: 16px 18px;
          border-radius: 22px;
          border: 1px solid rgba(176, 138, 69, 0.28);
          background: rgba(255, 249, 240, 0.62);
          color: #5f4a39;
          font-size: 14px;
          line-height: 1.8;
          letter-spacing: 0.02em;
        }

        .darkMode .preOrderNotice {
          background: rgba(255, 249, 240, 0.08);
          border-color: rgba(215, 180, 111, 0.36);
          color: #eadcc8;
        }

        .launchCountdown {
          position: relative;
          isolation: isolate;
          max-width: 760px;
          margin: 24px 0 0;
          padding: 20px;
          overflow: hidden;
          border-radius: 30px;
          border: 1px solid rgba(176, 138, 69, 0.36);
          background:
            radial-gradient(circle at top left, rgba(255, 255, 255, 0.92), transparent 34%),
            linear-gradient(135deg, rgba(255, 249, 240, 0.96), rgba(239, 219, 187, 0.64));
          box-shadow: 0 22px 54px rgba(54, 37, 25, 0.12);
        }

        .launchCountdown::before {
          content: "";
          position: absolute;
          inset: 1px;
          z-index: -1;
          border-radius: 28px;
          background:
            linear-gradient(120deg, transparent, rgba(255, 255, 255, 0.56), transparent);
          transform: translateX(-120%);
          animation: countdownShine 6.5s ease-in-out infinite;
          pointer-events: none;
        }

        .launchCountdown::after {
          content: "";
          position: absolute;
          right: -42px;
          top: -56px;
          width: 160px;
          height: 160px;
          z-index: -2;
          border-radius: 999px;
          background: rgba(176, 138, 69, 0.14);
          filter: blur(6px);
          pointer-events: none;
        }

        .launchCountdownHeader {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 18px;
          margin-bottom: 16px;
        }

        .launchCountdownHeader span {
          display: block;
          color: #9c7336;
          font-size: 11px;
          letter-spacing: 0.28em;
          text-transform: uppercase;
        }

        .launchCountdownHeader p {
          margin: 8px 0 0;
          color: #6a5545;
          font-size: 13px;
          line-height: 1.6;
          letter-spacing: 0.06em;
        }

        .launchCountdownHeader strong {
          flex: 0 0 auto;
          padding: 9px 12px;
          border-radius: 999px;
          color: #3b2a20;
          background: rgba(255, 255, 255, 0.62);
          border: 1px solid rgba(176, 138, 69, 0.22);
          font-size: 12px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          box-shadow: 0 10px 26px rgba(54, 37, 25, 0.08);
        }

        .launchCountdownGrid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 10px;
        }

        .countdownUnit {
          position: relative;
          overflow: hidden;
          border-radius: 22px;
          padding: 16px 10px 15px;
          text-align: center;
          background: rgba(255, 255, 255, 0.68);
          border: 1px solid rgba(176, 138, 69, 0.2);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.66);
        }

        .countdownUnit::before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(176, 138, 69, 0.12), transparent 46%);
          opacity: 0.72;
          pointer-events: none;
        }

        .countdownUnit strong {
          position: relative;
          display: block;
          color: #2c1f18;
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(30px, 3.2vw, 50px);
          font-weight: 500;
          line-height: 1;
          font-variant-numeric: tabular-nums;
          letter-spacing: 0.02em;
        }

        .countdownUnit span {
          position: relative;
          display: block;
          margin-top: 9px;
          color: #7a604d;
          font-size: 10px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
        }

        .launchCountdownFooter {
          margin: 14px 4px 0;
          color: #6a5545;
          font-size: 12px;
          line-height: 1.7;
          letter-spacing: 0.05em;
        }

        .launchCountdown.finished .launchCountdownHeader strong {
          background: rgba(176, 138, 69, 0.16);
        }

        .page.arabic .launchCountdown,
        .page.arabic .launchCountdownGrid {
          direction: ltr;
        }

        .page.arabic .launchCountdownHeader,
        .page.arabic .launchCountdownFooter {
          direction: rtl;
        }

        .darkMode .launchCountdown {
          background:
            radial-gradient(circle at top left, rgba(255, 244, 223, 0.13), transparent 34%),
            linear-gradient(135deg, rgba(255, 249, 240, 0.09), rgba(176, 138, 69, 0.13));
          border-color: rgba(215, 180, 111, 0.36);
          box-shadow: 0 22px 54px rgba(0, 0, 0, 0.24);
        }

        .darkMode .launchCountdownHeader span,
        .darkMode .countdownUnit span {
          color: #d7b46f;
        }

        .darkMode .launchCountdownHeader p,
        .darkMode .launchCountdownFooter {
          color: #eadcc8;
        }

        .darkMode .launchCountdownHeader strong,
        .darkMode .countdownUnit strong {
          color: #fff4df;
        }

        .darkMode .launchCountdownHeader strong,
        .darkMode .countdownUnit {
          background: rgba(255, 249, 240, 0.08);
          border-color: rgba(215, 180, 111, 0.24);
        }

        @keyframes countdownShine {
          0%, 58% { transform: translateX(-120%); opacity: 0; }
          66% { opacity: 1; }
          100% { transform: translateX(120%); opacity: 0; }
        }

        @media (max-width: 640px) {
          .launchCountdown {
            padding: 16px;
            border-radius: 26px;
          }

          .launchCountdownGrid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .launchCountdownHeader {
            align-items: flex-start;
            flex-direction: column;
            gap: 10px;
          }

          .launchCountdownHeader strong {
            align-self: flex-start;
          }
        }

        .actions {
          margin-top: 36px;
          display: flex;
          flex-wrap: wrap;
          gap: 14px;
        }

        .primaryBtn,
        .secondaryBtn {
          border-radius: 999px;
          padding: 15px 24px;
          letter-spacing: 0.17em;
          font-size: 12px;
          text-transform: uppercase;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: transform 0.25s ease, box-shadow 0.25s ease, background 0.25s ease, color 0.25s ease;
          position: relative;
          overflow: hidden;
        }

        .primaryBtn {
          background: #2c1f18;
          color: #f7f1e8;
          border: 1px solid #2c1f18;
          box-shadow: 0 16px 30px rgba(36, 26, 20, 0.15);
        }

        .secondaryBtn {
          background: transparent;
          border: 1px solid #b08a45;
          color: #2c1f18;
        }

        .darkMode .secondaryBtn {
          color: #fff9f0;
          border-color: rgba(215, 180, 111, 0.65);
        }

        .primaryBtn:hover,
        .secondaryBtn:hover {
          transform: translateY(-3px);
          box-shadow: 0 14px 28px rgba(36, 26, 20, 0.16);
        }

        .heroVisual {
          min-height: calc(100vh - 190px);
          border-radius: 38px;
          overflow: hidden;
          position: relative;
          background: #e8d6bd;
          box-shadow: 0 24px 60px rgba(36, 26, 20, 0.16);
          animation: heroImageIn 1.15s cubic-bezier(.16, 1, .3, 1) 0.52s both;
        }

        .heroVisual img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: top center;
          display: block;
          animation: luxuryZoom 16s ease-in-out infinite alternate;
        }

        .heroVisual::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(36,26,20,0.62), transparent 58%);
        }

        .heroCard {
          position: absolute;
          left: 28px;
          right: 28px;
          bottom: 28px;
          z-index: 2;
          background: rgba(255, 249, 240, 0.16);
          border: 1px solid rgba(255, 255, 255, 0.28);
          backdrop-filter: blur(14px);
          color: white;
          border-radius: 26px;
          padding: 24px;
          animation: fadeUp 1s cubic-bezier(.16, 1, .3, 1) 1.85s both;
        }

        .heroCard small {
          display: block;
          margin-bottom: 8px;
          color: #eadcc8;
          letter-spacing: 0.22em;
          text-transform: uppercase;
        }

        .heroCard strong {
          display: block;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 28px;
          font-weight: 500;
          color: #fff9f0;
        }

        .trustBar {
          width: min(1680px, 100%);
          margin: 0 auto;
          padding: 0 clamp(28px, 4vw, 72px) 48px;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
        }

        .trustItem {
          background: rgba(255, 249, 240, 0.72);
          border: 1px solid rgba(176, 138, 69, 0.22);
          border-radius: 22px;
          padding: 18px;
          display: flex;
          align-items: center;
          gap: 14px;
          box-shadow: 0 10px 24px rgba(36, 26, 20, 0.05);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .trustItem:hover {
          transform: translateY(-4px);
          box-shadow: 0 18px 34px rgba(36, 26, 20, 0.10);
        }

        .trustIcon {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #2c1f18;
          color: #f7f1e8;
          display: grid;
          place-items: center;
          font-size: 14px;
        }

        .trustItem p {
          margin: 0;
          font-size: 12px;
          letter-spacing: 0.13em;
          text-transform: uppercase;
          color: #5f4c3e;
        }

        .darkMode .trustItem {
          background: #2c1f18;
          border-color: rgba(215, 180, 111, 0.32);
        }

        .darkMode .trustIcon {
          background: #d7b46f;
          color: #211713;
        }

        .sectionHead {
          display: flex;
          justify-content: space-between;
          align-items: end;
          gap: 22px;
          margin-bottom: 34px;
        }

        .sectionTitle {
          margin: 0;
          font-size: clamp(38px, 4vw, 70px);
        }

        .sectionIntro {
          max-width: 720px;
          color: #6a5545;
          line-height: 1.8;
          margin: 12px 0 0;
        }

        .productGrid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: clamp(22px, 2vw, 34px);
          width: 100%;
          align-items: stretch;
        }

        .productCard {
          background: #fff9f0;
          border: 1px solid rgba(176, 138, 69, 0.18);
          border-radius: 30px;
          overflow: hidden;
          box-shadow: 0 14px 34px rgba(51, 38, 30, 0.07);
          transition: transform 0.35s ease, box-shadow 0.35s ease, border-color 0.35s ease;
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .darkMode .productCard,
        .darkMode .cleanPanel,
        .darkMode .sizeBox,
        .darkMode .newsletterBox,
        .darkMode .cartDrawer,
        .darkMode .modal,
        .darkMode .giftCardBox {
          background: #2c1f18;
          border-color: rgba(215, 180, 111, 0.32);
          color: #fff9f0;
        }

        .productCard:hover {
          transform: translateY(-8px);
          box-shadow: 0 28px 58px rgba(51, 38, 30, 0.16);
          border-color: rgba(176, 138, 69, 0.38);
        }

        .productImage {
          height: clamp(500px, 34vw, 660px);
          background: #e8d6bd;
          overflow: hidden;
          position: relative;
          cursor: pointer;
        }

        .productImage img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: top center;
          display: block;
          transition: transform 0.28s ease, filter 0.28s ease;
        }

        .productCard:hover .productImage img {
          transform: scale(1.07);
          filter: saturate(1.04) contrast(1.02);
        }

        .productImage.linenPantsProductImage {
          background: #f8f1e8;
        }

        .productImage.linenPantsProductImage img {
          object-fit: contain;
          object-position: center center;
          padding: 18px;
          box-sizing: border-box;
          transform: none;
        }

        .productCard:hover .productImage.linenPantsProductImage img {
          transform: none;
          filter: saturate(1.03) contrast(1.02);
        }

        .stockTag {
          position: absolute;
          left: 16px;
          bottom: 16px;
          background: rgba(44, 31, 24, 0.88);
          color: #fff9f0;
          border-radius: 999px;
          padding: 9px 13px;
          font-size: 10px;
          letter-spacing: 0.13em;
          text-transform: uppercase;
          backdrop-filter: blur(6px);
        }

        .preOrderBadge {
          position: absolute;
          left: 16px;
          top: 16px;
          z-index: 5;
          background: rgba(255, 249, 240, 0.94);
          color: #6f5735;
          border: 1px solid rgba(176, 138, 69, 0.42);
          border-radius: 999px;
          padding: 9px 13px;
          font-size: 10px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          box-shadow: 0 12px 26px rgba(36, 26, 20, 0.12);
          backdrop-filter: blur(8px);
        }

        .preOrderLine {
          margin: 8px 0 0;
          color: #b08a45;
          font-size: 10px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          font-weight: 700;
        }

        .modalPreOrderBadge {
          display: inline-flex;
          width: fit-content;
          margin: 6px 0 10px;
          padding: 8px 12px;
          border-radius: 999px;
          background: rgba(176, 138, 69, 0.12);
          color: #8b6a34;
          border: 1px solid rgba(176, 138, 69, 0.32);
          font-size: 10px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          font-weight: 700;
        }

        .modalPreOrderNotice,
        .cartPreOrderNote {
          margin: 10px 0 16px;
          padding: 13px 15px;
          border-radius: 18px;
          background: rgba(176, 138, 69, 0.10);
          border: 1px solid rgba(176, 138, 69, 0.24);
          color: #6a5545;
          line-height: 1.7;
          font-size: 13px;
        }

        .cartPreOrderNote {
          margin-top: 14px;
          margin-bottom: 12px;
        }

        .darkMode .preOrderBadge {
          background: rgba(44, 31, 24, 0.92);
          color: #fff9f0;
          border-color: rgba(215, 180, 111, 0.55);
        }

        .darkMode .modalPreOrderBadge {
          background: rgba(215, 180, 111, 0.16);
          color: #d7b46f;
          border-color: rgba(215, 180, 111, 0.38);
        }

        .darkMode .modalPreOrderNotice,
        .darkMode .cartPreOrderNote {
          background: rgba(255, 249, 240, 0.08);
          border-color: rgba(215, 180, 111, 0.32);
          color: #eadcc8;
        }

        .heartBtn {
          position: absolute;
          right: 16px;
          top: 16px;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 1px solid rgba(176, 138, 69, 0.32);
          background: rgba(255, 249, 240, 0.92);
          color: #2c1f18;
          font-size: 18px;
          transition: transform 0.25s ease, background 0.25s ease, color 0.25s ease;
        }

        .heartBtn:hover { transform: scale(1.12); }

        .heartBtn.saved {
          background: #2c1f18;
          color: #f7f1e8;
          animation: heartPop 0.38s ease;
        }

        .productInfo {
          padding: 28px 24px 30px;
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          align-items: center;
          gap: 18px;
          flex: 1;
        }

        .category {
          margin: 0 0 10px;
          color: #b08a45;
          font-size: 11px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          line-height: 1.6;
        }

        .productInfo h4 {
          margin: 0;
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(24px, 1.55vw, 34px);
          line-height: 1.08;
          font-weight: 500;
          max-width: 95%;
        }

        .price {
          margin: 12px 0 0;
          color: #765f4d;
          line-height: 1.55;
          font-size: clamp(15px, 1vw, 18px);
        }

        .cardActions {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .viewBtn,
        .addBtn {
          border-radius: 999px;
          padding: 10px 16px;
          font-size: 10px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          white-space: nowrap;
          transition: transform 0.25s ease, background 0.25s ease;
        }

        .viewBtn {
          border: 1px solid rgba(176, 138, 69, 0.44);
          background: transparent;
          color: inherit;
        }

        .addBtn {
          border: 1px solid #e7d2ad;
          background: #e7d2ad;
          color: #241a14;
        }

        .viewBtn:hover,
        .addBtn:hover {
          transform: translateY(-2px);
        }

        .shopTools {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          gap: 18px;
          align-items: stretch;
          margin-bottom: 24px;
        }

        .searchBox {
          width: 100%;
          min-height: 64px;
          border: 1px solid rgba(176, 138, 69, 0.34);
          background: rgba(255, 249, 240, 0.78);
          color: inherit;
          border-radius: 999px;
          padding: 16px 24px;
          outline: none;
          box-sizing: border-box;
        }

        .luxurySort {
          position: relative;
          width: 100%;
          z-index: 8;
        }

        .luxurySortButton {
          width: 100%;
          min-height: 64px;
          border: 1px solid rgba(176, 138, 69, 0.48);
          background: linear-gradient(135deg, rgba(255,249,240,0.98), rgba(239,227,210,0.88));
          color: #241a14;
          border-radius: 999px;
          padding: 14px 54px 12px 24px;
          outline: none;
          box-shadow: 0 16px 34px rgba(36, 26, 20, 0.08);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          text-align: left;
          transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease, background 0.25s ease;
        }

        .luxurySortButton:hover,
        .luxurySort.open .luxurySortButton {
          transform: translateY(-2px);
          border-color: rgba(176, 138, 69, 0.72);
          box-shadow: 0 22px 44px rgba(36, 26, 20, 0.12);
        }

        .luxurySortCopy {
          display: grid;
          gap: 3px;
          min-width: 0;
        }

        .luxurySortCopy small {
          display: block;
          color: #b08a45;
          font-size: 9px;
          letter-spacing: 0.28em;
          line-height: 1;
          text-transform: uppercase;
        }

        .luxurySortCopy span {
          color: #241a14;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 22px;
          line-height: 1;
          letter-spacing: 0.03em;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .luxurySortArrow {
          width: 30px;
          height: 30px;
          border-radius: 999px;
          border: 1px solid rgba(176, 138, 69, 0.42);
          display: inline-grid;
          place-items: center;
          flex: 0 0 auto;
          color: #b08a45;
          background: rgba(255, 249, 240, 0.55);
          transition: transform 0.25s ease, background 0.25s ease;
        }

        .luxurySort.open .luxurySortArrow {
          transform: rotate(90deg);
          background: #e7d2ad;
          color: #2c1f18;
        }

        .luxurySortMenu {
          position: absolute;
          left: 0;
          right: 0;
          top: calc(100% + 10px);
          background: rgba(255, 249, 240, 0.98);
          border: 1px solid rgba(176, 138, 69, 0.42);
          border-radius: 24px;
          padding: 8px;
          box-shadow: 0 26px 58px rgba(36, 26, 20, 0.18);
          backdrop-filter: blur(14px);
          display: grid;
          gap: 6px;
          animation: sortMenuDrop 0.22s ease both;
          overflow: hidden;
        }

        .luxurySortOption {
          width: 100%;
          border: 1px solid transparent;
          background: transparent;
          color: #4f3c31;
          border-radius: 18px;
          padding: 13px 16px;
          font-size: 12px;
          letter-spacing: 0.13em;
          text-transform: uppercase;
          text-align: left;
          transition: background 0.22s ease, color 0.22s ease, border-color 0.22s ease, transform 0.22s ease;
        }

        .luxurySortOption:hover,
        .luxurySortOption.active {
          background: #2c1f18;
          color: #fff9f0;
          border-color: rgba(176, 138, 69, 0.36);
          transform: translateX(2px);
        }

        .darkMode .searchBox,
        .darkMode .emailForm input {
          background: #211713;
          color: #fff9f0;
          border-color: rgba(215, 180, 111, 0.48);
        }

        .darkMode .luxurySortButton,
        .darkMode .luxurySortMenu {
          background: linear-gradient(135deg, rgba(33, 23, 19, 0.98), rgba(44, 31, 24, 0.96));
          color: #fff9f0;
          border-color: rgba(215, 180, 111, 0.50);
        }

        .darkMode .luxurySortCopy span { color: #fff9f0; }
        .darkMode .luxurySortOption { color: #eadcc8; }
        .darkMode .luxurySortOption:hover,
        .darkMode .luxurySortOption.active {
          background: #d7b46f;
          color: #211713;
        }

        @keyframes sortMenuDrop {
          from { opacity: 0; transform: translateY(-8px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .filterRow {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 32px;
        }

        .activeCollectionPill {
          margin: 0 0 18px;
          width: fit-content;
          display: flex;
          align-items: center;
          gap: 12px;
          border: 1px solid rgba(176, 138, 69, 0.35);
          background: #fff9f0;
          border-radius: 999px;
          padding: 10px 14px;
          color: #5a4636;
          box-shadow: 0 10px 24px rgba(36, 26, 20, 0.06);
        }

        .activeCollectionPill span {
          font-size: 11px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }

        .activeCollectionPill button {
          border: 0;
          background: #2c1f18;
          color: #fff9f0;
          border-radius: 999px;
          padding: 8px 12px;
          font-size: 10px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .darkMode .activeCollectionPill {
          background: #2c1f18;
          color: #eadcc8;
          border-color: rgba(215, 180, 111, 0.45);
        }

        .darkMode .activeCollectionPill button {
          background: #d6b66f;
          color: #211713;
        }

        .filterBtn,
        .moodBtn,
        .sizeBtn,
        .colorBtn,
        .qtyBtn {
          border: 1px solid rgba(176, 138, 69, 0.38);
          background: transparent;
          color: inherit;
          border-radius: 999px;
          padding: 11px 15px;
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          transition: transform 0.25s ease, background 0.25s ease, color 0.25s ease;
        }

        .filterBtn.active,
        .moodBtn.active,
        .sizeBtn.selected,
        .colorBtn.selected {
          background: #2c1f18;
          color: #f7f1e8;
          border-color: #2c1f18;
          animation: softPop 0.28s ease;
        }

        .darkMode .filterBtn.active,
        .darkMode .moodBtn.active,
        .darkMode .sizeBtn.selected,
        .darkMode .colorBtn.selected,
        .darkMode .primaryBtn,
        .darkMode .addBtn {
          background: #d7b46f;
          color: #211713 !important;
          border-color: #d7b46f;
        }

        .emptyState {
          background: rgba(255, 249, 240, 0.78);
          border: 1px dashed rgba(176, 138, 69, 0.38);
          border-radius: 28px;
          padding: 40px;
          text-align: center;
          color: #6a5545;
          line-height: 1.7;
        }

        .cleanPanel {
          background: #fff9f0;
          border: 1px solid rgba(176, 138, 69, 0.22);
          border-radius: 34px;
          padding: 48px;
          box-shadow: 0 14px 34px rgba(51, 38, 30, 0.06);
        }

        .styleFinder {
          display: grid;
          grid-template-columns: 1fr 360px;
          gap: 40px;
          align-items: center;
        }

        .panelTitle {
          margin: 0;
          font-size: clamp(34px, 4vw, 52px);
        }

        .panelText {
          color: #6a5545;
          line-height: 1.8;
          font-size: 16px;
        }

        .moodOptions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin: 28px 0;
        }

        .moodCard {
          background: #f7f1e8;
          border-radius: 28px;
          overflow: hidden;
          border: 1px solid rgba(176, 138, 69, 0.16);
        }

        .darkMode .moodCard {
          background: #211713;
          border-color: rgba(215, 180, 111, 0.22);
        }

        .moodCard img {
          width: 100%;
          height: 420px;
          object-fit: cover;
          object-position: top center;
          display: block;
        }

        .moodCardContent { padding: 26px; }

        .moodCardContent h4 {
          margin: 0;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 26px;
          font-weight: 500;
        }

        .sizeBox {
          background: #fff9f0;
          border: 1px solid rgba(176, 138, 69, 0.22);
          border-radius: 34px;
          overflow: hidden;
        }

        .sizeTableWrap { overflow-x: auto; }

        .sizeTable {
          width: 100%;
          border-collapse: collapse;
          min-width: 780px;
        }

        .sizeTable th {
          background: #2c1f18;
          color: #f7f1e8;
          padding: 18px 16px;
          text-align: left;
          font-size: 11px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          font-weight: 500;
        }

        .sizeTable td {
          padding: 18px 16px;
          border-bottom: 1px solid rgba(176, 138, 69, 0.16);
          color: #5f4c3e;
        }

        .fitNotes {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1px;
          background: rgba(176, 138, 69, 0.22);
        }

        .fitNote {
          background: #f7f1e8;
          padding: 28px;
        }

        .darkMode .fitNote { background: #211713; }

        .fitNote h4 {
          margin: 0 0 10px;
          font-family: Georgia, "Times New Roman", serif;
          font-weight: 500;
          font-size: 24px;
        }

        .giftCardBox {
          background: #efe3d2;
          border: 1px solid rgba(176, 138, 69, 0.24);
          border-radius: 34px;
          padding: 56px;
          display: grid;
          grid-template-columns: 1fr 360px;
          gap: 46px;
          align-items: center;
          overflow: hidden;
          position: relative;
        }

        .luxGiftCard {
          aspect-ratio: 1.58 / 1;
          border-radius: 30px;
          padding: 30px;
          background: linear-gradient(135deg, rgba(44,31,24,1), rgba(90,70,54,1));
          border: 1px solid rgba(215, 180, 111, 0.55);
          color: #fff9f0;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          box-shadow: 0 24px 60px rgba(36, 26, 20, 0.26);
        }

        .luxGiftCard p {
          margin: 0;
          color: #eadcc8;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          font-size: 11px;
        }

        .luxGiftCard h3 {
          margin: 0;
          font-family: Georgia, "Times New Roman", serif;
          font-weight: 500;
          letter-spacing: 0.16em;
          font-size: 28px;
          color: #fff9f0;
        }

        .storyGrid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 34px;
          align-items: stretch;
        }

        .storyImage {
          min-height: 520px;
          border-radius: 34px;
          overflow: hidden;
          background: #e8d6bd;
          box-shadow: 0 18px 45px rgba(36, 26, 20, 0.12);
        }

        .storyImage img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: top center;
          display: block;
        }

        .storyPoints {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-top: 30px;
        }

        .storyPoint {
          background: #efe3d2;
          border-radius: 22px;
          padding: 22px;
        }

        .darkMode .storyPoint { background: #211713; }

        .storyPoint span {
          color: #b08a45;
          letter-spacing: 0.18em;
          font-size: 11px;
        }

        .storyPoint p {
          margin: 8px 0 0;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 22px;
        }

        .newsletterBox {
          background: #efe3d2;
          border: 1px solid rgba(176, 138, 69, 0.24);
          border-radius: 34px;
          padding: 54px;
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 36px;
          align-items: center;
        }

        .emailForm {
          display: flex;
          gap: 10px;
          min-width: 420px;
        }

        .emailForm input {
          flex: 1;
          border: 1px solid rgba(176, 138, 69, 0.42);
          border-radius: 999px;
          padding: 15px 18px;
          background: #fff9f0;
          outline: none;
        }

        .emailForm button {
          border: 0;
          border-radius: 999px;
          background: #2c1f18;
          color: #f7f1e8;
          padding: 15px 22px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
        }

        .newsletterStatus {
          margin: 14px 0 0;
          color: #b08a45;
          font-size: 14px;
        }

        .footer {
          border-top: 1px solid rgba(176, 138, 69, 0.22);
          padding: 38px clamp(28px, 4vw, 72px) 96px;
        }

        .footerInner {
          width: min(1680px, 100%);
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 28px;
        }

        .footerLogo {
          margin: 0;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 28px;
          letter-spacing: 0.16em;
        }

        .footerTag {
          margin: 6px 0 0;
          color: #b08a45;
          letter-spacing: 0.22em;
          font-size: 11px;
          text-transform: uppercase;
        }

        .footerLinks {
          display: flex;
          flex-wrap: wrap;
          gap: 22px;
          color: #5f4c3e;
          font-size: 13px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }

        .floatingWhatsApp,
        .backTop {
          position: fixed;
          right: 22px;
          z-index: 40;
          width: 58px;
          height: 58px;
          border-radius: 50%;
          background: #2c1f18;
          color: #f7f1e8;
          display: grid;
          place-items: center;
          border: 1px solid rgba(215, 180, 111, 0.34);
          box-shadow: 0 14px 35px rgba(36, 26, 20, 0.25);
        }

        .floatingWhatsApp {
          bottom: 92px;
          animation: whatsappPulse 2.8s ease-in-out infinite;
        }

        .backTop {
          bottom: 22px;
          font-size: 22px;
        }

        .menuOverlay,
        .modalBackdrop {
          position: fixed;
          inset: 0;
          z-index: 80;
          background: rgba(36, 26, 20, 0.58);
          animation: overlayFade 0.28s ease both;
          overflow-y: auto;
          overscroll-behavior: contain;
          -webkit-overflow-scrolling: touch;
        }

        .menuOverlay { display: flex; }

        .menuPanel {
          width: min(470px, 100vw);
          height: 100vh;
          background: #2c1f18;
          color: #f7f1e8;
          padding: 30px;
          overflow-y: auto;
          box-shadow: 18px 0 60px rgba(0,0,0,0.25);
          animation: menuSlide 0.42s cubic-bezier(.2,.8,.2,1) both;
        }

        .menuClose {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: 1px solid rgba(215, 180, 111, 0.45);
          background: transparent;
          color: #f7f1e8;
          font-size: 28px;
          margin-bottom: 28px;
        }

        .menuSearch {
          display: flex;
          align-items: center;
          gap: 12px;
          border: 1px solid rgba(215, 180, 111, 0.38);
          border-radius: 999px;
          padding: 14px 18px;
          margin-bottom: 34px;
          color: #d7b46f;
        }

        .menuSearch input {
          width: 100%;
          border: 0;
          outline: 0;
          background: transparent;
          color: #f7f1e8;
          font-family: Georgia, "Times New Roman", serif;
        }

        .menuSearch input::placeholder { color: rgba(247, 241, 232, 0.64); }

        .menuLinks {
          display: flex;
          flex-direction: column;
          gap: 22px;
        }

        .menuLinks a,
        .menuLinks button {
          border: 0;
          background: transparent;
          color: #f7f1e8;
          padding: 0;
          text-align: left;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 25px;
          letter-spacing: 0.06em;
        }

        .menuCollectionBlock {
          border-top: 1px solid rgba(198, 161, 91, 0.22);
          border-bottom: 1px solid rgba(198, 161, 91, 0.22);
          padding: 18px 0;
          display: grid;
          gap: 0;
        }

        .menuCollectionMain {
          width: 100%;
          color: #f7f1e8;
          background: transparent;
          border: 0;
          padding: 0;
          text-align: left;
          font-family: Georgia, "Times New Roman", serif;
          font-weight: 400;
          font-size: 25px;
          letter-spacing: 0.06em;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
        }

        .menuCollectionMain:hover { color: #d6b66f; }

        .menuArrow {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          border: 1px solid rgba(198, 161, 91, 0.36);
          color: #d6b66f;
          font-family: Inter, Arial, sans-serif;
          font-size: 17px;
          line-height: 1;
          transition: transform 0.28s ease, background 0.28s ease, color 0.28s ease;
          flex: 0 0 auto;
        }

        .menuArrow.open {
          transform: rotate(180deg);
          background: #d6b66f;
          color: #211713;
        }

        .menuCollectionDropdown {
          display: grid;
          grid-template-rows: 0fr;
          opacity: 0;
          overflow: hidden;
          transition: grid-template-rows 0.35s ease, opacity 0.28s ease, margin-top 0.28s ease;
        }

        .menuCollectionDropdown.open {
          grid-template-rows: 1fr;
          opacity: 1;
          margin-top: 16px;
        }

        .menuCollectionDropdownInner {
          min-height: 0;
          display: grid;
          gap: 10px;
        }

        .menuCollectionAll {
          border: 1px solid rgba(198, 161, 91, 0.42) !important;
          border-radius: 999px !important;
          background: rgba(214, 182, 111, 0.18) !important;
          color: #f7f1e8 !important;
          padding: 13px 16px !important;
          font-size: 11px !important;
          letter-spacing: 0.16em !important;
          text-transform: uppercase !important;
          font-family: Inter, Arial, sans-serif !important;
          text-align: center !important;
        }

        .menuCollectionGrid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }

        .menuCollectionGrid button {
          border: 1px solid rgba(198, 161, 91, 0.42);
          border-radius: 999px;
          background: rgba(255, 249, 240, 0.08);
          color: #f7f1e8;
          padding: 12px 10px;
          font-size: 11px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          font-family: Inter, Arial, sans-serif;
        }

        .menuCollectionGrid button:hover,
        .menuCollectionAll:hover {
          background: #d6b66f !important;
          color: #211713 !important;
          transform: translateY(-2px);
        }

        .page.arabic .menuCollectionMain {
          text-align: right;
        }

        .page.arabic .menuCollectionMain { flex-direction: row-reverse; }

        .menuWishlist {
          margin-top: 34px;
          padding-top: 24px;
          border-top: 1px solid rgba(215, 180, 111, 0.22);
        }

        .menuWishlist h3 {
          margin: 0 0 16px;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 24px;
          font-weight: 500;
          color: #fff9f0;
        }

        .menuWishlistGrid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }

        .menuWishlistCard {
          border: 0;
          background: transparent;
          color: #f7f1e8;
          padding: 0;
          text-align: left;
        }

        .menuWishlistCard img {
          width: 100%;
          aspect-ratio: 1 / 1.25;
          object-fit: cover;
          object-position: top center;
          border-radius: 16px;
        }

        .menuWishlistCard span {
          display: block;
          font-size: 11px;
          margin-top: 7px;
          line-height: 1.3;
          color: #eadcc8;
        }

        .searchOverlay {
          position: fixed;
          inset: 0;
          z-index: 170;
          background: rgba(247, 241, 232, 0.70);
          backdrop-filter: blur(20px);
          animation: searchOverlayIn 0.35s ease both;
          overflow-y: auto;
        }

        .darkMode .searchOverlay {
          background: rgba(31, 21, 16, 0.78);
        }

        .searchOverlayTop {
          min-height: 116px;
          background: rgba(255, 249, 240, 0.97);
          border-bottom: 1px solid rgba(176, 138, 69, 0.28);
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          gap: 22px;
          padding: 0 42px;
          color: #2c1f18;
          box-shadow: 0 16px 40px rgba(36, 26, 20, 0.08);
        }

        .darkMode .searchOverlayTop {
          background: rgba(44, 31, 24, 0.98);
          color: #fff9f0;
          border-bottom-color: rgba(215, 180, 111, 0.34);
        }

        .searchOverlayTop input {
          width: 100%;
          border: 0;
          outline: 0;
          background: transparent;
          color: inherit;
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(24px, 3vw, 42px);
          letter-spacing: 0.02em;
        }

        .searchCloseBtn {
          width: 50px;
          height: 50px;
          border: 1px solid rgba(176, 138, 69, 0.38);
          border-radius: 50%;
          background: transparent;
          color: inherit;
          font-size: 34px;
          line-height: 1;
        }

        .searchOverlayContent {
          width: min(1680px, 100%);
          margin: 0 auto;
          padding: 54px clamp(28px, 4vw, 72px) 90px;
        }

        .searchResultsGrid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 22px;
          margin-top: 24px;
        }

        .searchResultCard {
          border: 1px solid rgba(176, 138, 69, 0.24);
          background: rgba(255, 249, 240, 0.90);
          border-radius: 26px;
          overflow: hidden;
          padding: 0;
          text-align: left;
          color: inherit;
          box-shadow: 0 18px 44px rgba(36, 26, 20, 0.10);
        }

        .darkMode .searchResultCard {
          background: rgba(44, 31, 24, 0.94);
          border-color: rgba(215, 180, 111, 0.30);
        }

        .searchResultCard img {
          width: 100%;
          height: 300px;
          object-fit: cover;
          object-position: top center;
          display: block;
        }

        .searchResultCard div { padding: 20px; }

        .searchResultCard span {
          display: block;
          color: #b08a45;
          font-size: 10px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        .searchResultCard h4 {
          margin: 0;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 22px;
          font-weight: 500;
          line-height: 1.15;
        }

        .searchResultCard p {
          margin: 10px 0 0;
          color: #765f4d;
        }

        .searchQuickLinks {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 28px;
        }

        .searchQuickLinks button {
          border: 1px solid rgba(176, 138, 69, 0.36);
          background: rgba(255, 249, 240, 0.72);
          color: inherit;
          border-radius: 999px;
          padding: 11px 16px;
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .cartDrawer {
          position: fixed;
          right: 22px;
          top: 94px;
          bottom: 22px;
          z-index: 70;
          width: min(420px, calc(100vw - 44px));
          background: #fff9f0;
          border: 1px solid rgba(176, 138, 69, 0.30);
          border-radius: 30px;
          box-shadow: 0 24px 70px rgba(36, 26, 20, 0.25);
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .cartHeader {
          display: flex;
          justify-content: space-between;
          align-items: start;
          gap: 16px;
        }

        .cartHeader h3 {
          margin: 0;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 34px;
          font-weight: 500;
        }

        .cartHeader button,
        .cartRemove {
          border: 0;
          background: transparent;
          color: #b08a45;
        }

        .cartHeader button { font-size: 30px; }

        .cartItems {
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .cartItem {
          display: grid;
          grid-template-columns: 82px 1fr;
          gap: 14px;
          border-bottom: 1px solid rgba(176, 138, 69, 0.18);
          padding-bottom: 16px;
        }

        .cartItem img {
          width: 82px;
          height: 104px;
          border-radius: 16px;
          object-fit: cover;
          object-position: top center;
        }

        .cartItem h4 {
          margin: 0;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 19px;
          font-weight: 500;
        }

        .cartItem p {
          margin: 5px 0;
          color: #6a5545;
          font-size: 13px;
        }

        .cartQtyControls {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 9px 0 7px;
        }

        .cartQtyControls button {
          width: 30px;
          height: 30px;
          border-radius: 999px;
          border: 1px solid rgba(176, 138, 69, 0.45);
          background: #fff9f0;
          color: #2c1f18;
          font-size: 16px;
          line-height: 1;
          display: inline-grid;
          place-items: center;
          transition: 0.22s ease;
        }

        .cartQtyControls button:hover {
          background: #2c1f18;
          color: #fff9f0;
          transform: translateY(-1px);
        }

        .cartQtyControls span {
          min-width: 58px;
          text-align: center;
          color: #6a5545;
          font-size: 13px;
        }

        .darkMode .cartQtyControls button {
          background: rgba(255, 249, 240, 0.10);
          color: #fff9f0;
          border-color: rgba(215, 180, 111, 0.55);
        }

        .darkMode .cartQtyControls button:hover {
          background: #d7b46f;
          color: #211713;
        }

        .darkMode .cartQtyControls span {
          color: #e9dcc8;
        }

        .checkoutBtn {
          width: 100%;
          margin-top: 0;
          text-align: center;
          border-radius: 999px;
          padding: 15px 20px;
          background: #2c1f18;
          color: #f7f1e8;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          font-size: 12px;
          border: 1px solid #2c1f18;
          display: block;
        }

        .checkoutBtn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .payNowBtn {
          margin-top: auto;
          background: linear-gradient(135deg, #2c1f18, #5a4636);
          border-color: rgba(215, 180, 111, 0.50);
          box-shadow: 0 12px 28px rgba(36, 26, 20, 0.18);
        }

        .whatsappCheckout {
          margin-top: 10px;
          background: transparent !important;
          color: #2c1f18 !important;
          border: 1px solid rgba(176, 138, 69, 0.45);
        }

        .darkMode .whatsappCheckout {
          color: #fff9f0 !important;
        }

        .modalBackdrop {
          display: grid;
          place-items: center;
          padding: 24px;
        }

        .modal {
          width: min(88vw, 760px);
          max-height: 84vh;
          display: grid;
          grid-template-columns: 0.82fr 1.18fr;
          background: #fff9f0;
          border-radius: 32px;
          overflow: hidden;
          overscroll-behavior: contain;
          border: 1px solid rgba(176, 138, 69, 0.30);
          box-shadow: 0 30px 90px rgba(0,0,0,0.34);
        }

        .modalImage {
          min-height: 650px;
          max-height: 84vh;
          background: #e8d6bd;
          position: relative;
          overflow: hidden;
        }

        .modalImage img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: top center;
          display: block;
        }

        .modalInfo {
          padding: 30px;
          overflow-y: auto;
          overscroll-behavior: contain;
          -webkit-overflow-scrolling: touch;
          max-height: 84vh;
          text-align: center;
        }

        .modalInfo h3 {
          margin: 0;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 32px;
          font-weight: 500;
          line-height: 1.1;
        }

        .modalInfo p {
          color: #6a5545;
          line-height: 1.62;
          margin: 9px 0;
        }

        .buttonList {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 9px;
          margin: 10px 0 16px;
        }



        .modalSizeHeader {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: 10px;
        }

        .modalSizeHeader p {
          margin: 0 !important;
        }

        .inlineSizeToggle {
          border: 1px solid rgba(176, 138, 69, 0.36);
          background: rgba(255, 249, 240, 0.72);
          color: #2c1f18;
          border-radius: 999px;
          padding: 9px 12px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 10px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          transition: transform 0.25s ease, background 0.25s ease, color 0.25s ease;
        }

        .inlineSizeToggle:hover {
          transform: translateY(-2px);
          background: #e8d6bd;
        }

        .inlineSizeArrow {
          width: 7px;
          height: 7px;
          border-right: 1.5px solid currentColor;
          border-bottom: 1.5px solid currentColor;
          transform: rotate(45deg) translateY(-1px);
          transition: transform 0.25s ease;
        }

        .inlineSizeToggle.open .inlineSizeArrow {
          transform: rotate(225deg) translateY(-1px);
        }

        .compactSizeButtons {
          margin-bottom: 10px;
        }

        .modalSizeChart {
          border: 1px solid rgba(176, 138, 69, 0.26);
          background: linear-gradient(180deg, rgba(255,249,240,0.88), rgba(239,227,210,0.62));
          border-radius: 22px;
          padding: 14px;
          margin: 10px 0 18px;
          box-shadow: inset 0 0 0 1px rgba(255,255,255,0.32), 0 14px 30px rgba(36, 26, 20, 0.06);
          animation: softPop 0.22s ease;
        }

        .modalSizeTableWrap {
          overflow-x: auto;
          border-radius: 16px;
          border: 1px solid rgba(176, 138, 69, 0.16);
        }

        .modalSizeTable {
          width: 100%;
          border-collapse: collapse;
          min-width: 480px;
          background: #fff9f0;
        }

        .modalSizeTable th {
          background: #2c1f18;
          color: #fff9f0;
          padding: 11px 10px;
          text-align: center;
          font-size: 9px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          font-weight: 500;
        }

        .modalSizeTable td {
          padding: 11px 10px;
          border-bottom: 1px solid rgba(176, 138, 69, 0.14);
          color: #5f4c3e;
          text-align: center;
          font-size: 12px;
          white-space: nowrap;
        }

        .modalFitNotes {
          display: grid;
          gap: 8px;
          margin-top: 12px;
          text-align: left;
        }

        .modalFitNotes p {
          margin: 0 !important;
          font-size: 12px;
          line-height: 1.55 !important;
          color: #6a5545;
        }

        .modalSizeHelp {
          margin-top: 12px;
          border: 1px solid rgba(176, 138, 69, 0.42);
          border-radius: 999px;
          padding: 11px 14px;
          display: block;
          font-size: 10px;
          letter-spacing: 0.13em;
          text-transform: uppercase;
          color: #2c1f18;
          background: rgba(255, 249, 240, 0.66);
          transition: transform 0.25s ease, background 0.25s ease;
        }

        .modalSizeHelp:hover {
          transform: translateY(-2px);
          background: #e8d6bd;
        }

        .darkMode .inlineSizeToggle,
        .darkMode .modalSizeChart,
        .darkMode .modalSizeTable,
        .darkMode .modalSizeHelp {
          background: rgba(255, 249, 240, 0.08);
          color: #fff9f0;
          border-color: rgba(215, 180, 111, 0.36);
        }

        .darkMode .modalSizeTable td,
        .darkMode .modalFitNotes p {
          color: #eadcc8;
        }
        .qtyBox {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          margin: 10px 0 18px;
        }

        .completeLook {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 8px;
          margin: 10px 0 18px;
        }

        .completeLook span {
          background: #efe3d2;
          color: #5a4636;
          border-radius: 999px;
          padding: 9px 13px;
          font-size: 12px;
        }

        .notifyBtn {
          display: inline-flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          margin-top: 8px;
          border-radius: 999px;
          padding: 13px 18px;
          font-size: 10px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          border: 1px dashed rgba(176, 138, 69, 0.55);
          background: transparent;
          color: inherit;
        }

        .closeBtn {
          position: fixed;
          right: 24px;
          top: 24px;
          z-index: 90;
          width: 42px;
          height: 42px;
          border-radius: 50%;
          border: 1px solid rgba(176, 138, 69, 0.28);
          background: #fff9f0;
          color: #2c1f18;
          font-size: 24px;
          box-shadow: 0 12px 28px rgba(36, 26, 20, 0.18);
        }


        .signInBackdrop {
          position: fixed;
          inset: 0;
          z-index: 95;
          background: rgba(36, 26, 20, 0.58);
          backdrop-filter: blur(12px);
          display: grid;
          place-items: center;
          padding: 22px;
          animation: fadeIn 0.28s ease both;
        }

        .signInPanel {
          width: min(460px, 100%);
          border-radius: 34px;
          background: linear-gradient(145deg, #fff9f0, #efe3d2);
          border: 1px solid rgba(176, 138, 69, 0.42);
          box-shadow: 0 28px 90px rgba(36, 26, 20, 0.34);
          padding: 30px;
          position: relative;
          overflow: hidden;
          animation: modalRise 0.42s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .signInPanel::before {
          content: "LA GRAZIA";
          position: absolute;
          right: -18px;
          bottom: -18px;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 60px;
          letter-spacing: 0.12em;
          color: rgba(176, 138, 69, 0.08);
          pointer-events: none;
        }

        .darkMode .signInPanel {
          background: linear-gradient(145deg, #2c1f18, #211713);
          color: #fff9f0;
          border-color: rgba(215, 180, 111, 0.42);
        }

        .signInClose {
          position: absolute;
          right: 18px;
          top: 18px;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          border: 1px solid rgba(176, 138, 69, 0.34);
          background: rgba(255, 249, 240, 0.68);
          color: #2c1f18;
          font-size: 22px;
          z-index: 2;
        }

        .darkMode .signInClose {
          background: rgba(255, 249, 240, 0.08);
          color: #fff9f0;
          border-color: rgba(215, 180, 111, 0.42);
        }

        .signInPanel h3 {
          margin: 8px 0 12px;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 36px;
          font-weight: 500;
          line-height: 1;
          position: relative;
          z-index: 1;
        }

        .signInPanel p {
          margin: 0 0 20px;
          color: #6a5545;
          line-height: 1.75;
          position: relative;
          z-index: 1;
        }

        .darkMode .signInPanel p { color: #e9dcc8; }

        .signInTabs {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          padding: 6px;
          border-radius: 999px;
          background: rgba(176, 138, 69, 0.12);
          border: 1px solid rgba(176, 138, 69, 0.28);
          margin: 0 0 18px;
        }

        .signInTab {
          border: 0;
          border-radius: 999px;
          padding: 12px 14px;
          background: transparent;
          color: #6a5545;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          font-size: 10px;
          transition: 0.22s ease;
        }

        .signInTab.active {
          background: #2c1f18;
          color: #fff9f0;
          box-shadow: 0 10px 22px rgba(36, 26, 20, 0.16);
        }

        .darkMode .signInTabs {
          background: rgba(255, 249, 240, 0.08);
          border-color: rgba(215, 180, 111, 0.35);
        }

        .darkMode .signInTab { color: #e9dcc8; }

        .darkMode .signInTab.active {
          background: #d7b46f;
          color: #211713;
        }

        .authSwitchBtn {
          border: 0 !important;
          background: transparent !important;
          color: #b08a45 !important;
          padding: 6px 8px !important;
          font-size: 11px !important;
          letter-spacing: 0.08em !important;
          text-transform: none !important;
          text-decoration: underline;
          text-underline-offset: 4px;
        }

        .darkMode .authSwitchBtn { color: #d7b46f !important; }

        .signInForm {
          display: grid;
          gap: 12px;
          position: relative;
          z-index: 1;
        }

        .signInForm input {
          width: 100%;
          border-radius: 999px;
          border: 1px solid rgba(176, 138, 69, 0.38);
          background: rgba(255, 249, 240, 0.82);
          color: #2c1f18;
          padding: 15px 18px;
          outline: none;
          font-size: 14px;
        }

        .signInForm input:focus {
          border-color: #b08a45;
          box-shadow: 0 0 0 4px rgba(176, 138, 69, 0.12);
        }

        .darkMode .signInForm input {
          background: rgba(255, 249, 240, 0.08);
          color: #fff9f0;
          border-color: rgba(215, 180, 111, 0.42);
        }

        .authNotice {
          border: 1px solid rgba(176, 138, 69, 0.34);
          background: linear-gradient(135deg, rgba(255, 249, 240, 0.92), rgba(239, 226, 203, 0.58));
          border-radius: 24px;
          padding: 18px 18px;
          text-align: center;
          color: #2c1f18;
          box-shadow: 0 14px 36px rgba(44, 31, 24, 0.08);
        }

        .authNotice strong {
          display: block;
          font-family: Georgia, 'Times New Roman', serif;
          font-size: 20px;
          font-weight: 400;
          margin-bottom: 8px;
        }

        .authNotice span {
          display: block;
          font-size: 13px;
          line-height: 1.7;
          color: #6f5a4d;
        }

        .authNotice small {
          display: block;
          margin-top: 10px;
          color: #b08a45;
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .darkMode .authNotice {
          background: rgba(255, 249, 240, 0.07);
          color: #fff9f0;
          border-color: rgba(215, 180, 111, 0.38);
        }

        .darkMode .authNotice span { color: #d7c6b0; }


        .profileHeroBox {
          text-align: left;
          background:
            linear-gradient(135deg, rgba(255, 249, 240, 0.92), rgba(232, 214, 189, 0.78)),
            radial-gradient(circle at top right, rgba(176, 138, 69, 0.18), transparent 44%);
        }

        .profileTabs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin: 16px 0;
          padding: 6px;
          border: 1px solid rgba(176, 138, 69, 0.24);
          border-radius: 999px;
          background: rgba(239, 227, 210, 0.55);
        }

        .profileTab {
          border: 0;
          border-radius: 999px;
          background: transparent;
          color: #6a5545;
          padding: 12px;
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          transition: background 0.25s ease, color 0.25s ease, transform 0.25s ease;
        }

        .profileTab.active {
          background: #2c1f18;
          color: #fff9f0;
          transform: translateY(-1px);
        }

        .profileInfoGrid {
          display: grid;
          gap: 10px;
          margin: 14px 0;
        }

        .profileInfoCard,
        .noOrdersBox,
        .orderCard {
          border: 1px solid rgba(176, 138, 69, 0.22);
          background: rgba(255, 249, 240, 0.68);
          border-radius: 20px;
          padding: 16px;
        }

        .profileInfoCard small,
        .orderCard small {
          display: block;
          color: #b08a45;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          margin-bottom: 6px;
          font-size: 10px;
        }

        .profileInfoCard strong,
        .noOrdersBox strong {
          display: block;
          color: #2c1f18;
          font-size: 14px;
        }

        .ordersPanel {
          max-height: 360px;
          overflow-y: auto;
          padding-right: 4px;
          display: grid;
          gap: 12px;
          margin: 14px 0;
        }

        .noOrdersBox {
          text-align: center;
          padding: 30px 18px;
        }

        .noOrdersBox span {
          display: block;
          color: #7a6250;
          margin-top: 10px;
          line-height: 1.6;
        }

        .orderCardTop {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 14px;
        }

        .orderCardTop strong {
          font-family: Georgia, "Times New Roman", serif;
          font-size: 19px;
          font-weight: 500;
        }

        .orderStatusPill {
          border-radius: 999px;
          padding: 8px 10px;
          background: #2c1f18;
          color: #fff9f0 !important;
          font-size: 10px;
          letter-spacing: 0.08em;
          white-space: nowrap;
        }

        .orderMetaGrid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          margin: 14px 0;
          color: #6a5545;
          font-size: 12px;
        }

        .orderItemsList {
          display: grid;
          gap: 8px;
        }

        .orderMiniItem {
          display: grid;
          grid-template-columns: 44px 1fr;
          gap: 10px;
          align-items: center;
          border-top: 1px solid rgba(176, 138, 69, 0.16);
          padding-top: 8px;
        }

        .orderMiniItem img {
          width: 44px;
          height: 54px;
          object-fit: cover;
          border-radius: 12px;
        }

        .orderMiniItem strong {
          display: block;
          color: #2c1f18;
          font-size: 13px;
        }

        .orderMiniItem span {
          display: block;
          margin-top: 3px;
          color: #7a6250;
          font-size: 11px;
          line-height: 1.45;
        }

        .darkMode .profileTabs,
        .darkMode .profileInfoCard,
        .darkMode .noOrdersBox,
        .darkMode .orderCard {
          background: rgba(255, 249, 240, 0.08);
          border-color: rgba(215, 180, 111, 0.32);
        }

        .darkMode .profileInfoCard strong,
        .darkMode .orderMiniItem strong,
        .darkMode .orderCardTop strong,
        .darkMode .noOrdersBox strong {
          color: #fff9f0;
        }

        .darkMode .profileTab.active,
        .darkMode .orderStatusPill {
          background: #d7b46f;
          color: #211713 !important;
        }

        @media (max-width: 640px) {
          .orderMetaGrid { grid-template-columns: 1fr; }
          .ordersPanel { max-height: 310px; }
          .orderCardTop { flex-direction: column; }
        }
        .accountSavedBox {
          border-radius: 24px;
          border: 1px solid rgba(176, 138, 69, 0.32);
          background: rgba(255, 249, 240, 0.55);
          padding: 18px;
          margin: 18px 0;
          position: relative;
          z-index: 1;
        }

        .darkMode .accountSavedBox { background: rgba(255, 249, 240, 0.08); }

        .accountSavedBox strong {
          display: block;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 24px;
          font-weight: 500;
          margin-bottom: 6px;
        }

        .accountSavedBox span {
          display: block;
          color: #7a6250;
          font-size: 13px;
          line-height: 1.6;
        }

        .darkMode .accountSavedBox span { color: #e9dcc8; }

        .accountActions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          position: relative;
          z-index: 1;
        }

        .accountActions button,
        .signInForm button {
          border-radius: 999px;
          padding: 14px 18px;
          border: 1px solid rgba(176, 138, 69, 0.45);
          letter-spacing: 0.14em;
          text-transform: uppercase;
          font-size: 11px;
        }

        .signInForm button,
        .accountPrimary {
          background: #2c1f18;
          color: #fff9f0;
        }

        .accountSecondary {
          background: transparent;
          color: #2c1f18;
        }

        .darkMode .accountSecondary { color: #fff9f0; }
        .toast {
          position: fixed;
          left: 50%;
          bottom: 32px;
          z-index: 120;
          transform: translateX(-50%);
          background: #2c1f18;
          color: #f7f1e8;
          border: 1px solid rgba(215, 180, 111, 0.38);
          border-radius: 999px;
          padding: 14px 22px;
          letter-spacing: 0.08em;
          font-size: 13px;
          box-shadow: 0 18px 45px rgba(36, 26, 20, 0.22);
        }

        .mobileBottom { display: none; }

        .loader {
          position: fixed;
          inset: 0;
          z-index: 200;
          overflow: hidden;
          background: #120c08;
          color: #fff8ef;
          isolation: isolate;
          opacity: 1;
          transition: opacity 950ms cubic-bezier(.16, 1, .3, 1);
        }

        .logoDreamVideoLoader {
          display: block;
        }

        .logoDreamVideo {
          position: absolute;
          inset: 0;
          z-index: 1;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center center;
          background: #120c08;
          transform: translate3d(0, 0, 0) scale(1);
          backface-visibility: hidden;
          will-change: opacity, transform;
        }

        .dreamExitStarted .logoDreamVideo {
          animation: logoVideoSlowStop 4200ms cubic-bezier(.16, 1, .3, 1) forwards;
        }

        .logoDreamTone {
          position: absolute;
          inset: 0;
          z-index: 2;
          pointer-events: none;
          background:
            radial-gradient(circle at 54% 50%, rgba(255, 238, 205, 0.03) 0 20%, rgba(18, 12, 8, 0.02) 42%, rgba(18, 12, 8, 0.14) 100%),
            linear-gradient(90deg, rgba(18, 12, 8, 0.15), transparent 30%, transparent 70%, rgba(18, 12, 8, 0.15)),
            linear-gradient(180deg, rgba(18, 12, 8, 0.02), rgba(18, 12, 8, 0.08));
          opacity: 1;
          transition: opacity 700ms cubic-bezier(.16, 1, .3, 1);
        }

        .dreamExitStarted .logoDreamTone {
          opacity: 0.18;
        }

        .logoDreamSatin {
          position: absolute;
          inset: 0;
          z-index: 3;
          pointer-events: none;
          opacity: 0;
          background:
            linear-gradient(115deg, transparent 18%, rgba(255, 248, 236, 0.20) 42%, transparent 64%),
            linear-gradient(180deg, rgba(255, 248, 236, 0), rgba(255, 248, 236, 0.14));
          transform: translate3d(-12%, 0, 0);
        }

        .dreamExitStarted .logoDreamSatin {
          animation: logoSatinDreamSweep 850ms ease forwards;
        }

        .logoDreamWash {
          position: absolute;
          inset: 0;
          z-index: 4;
          pointer-events: none;
          opacity: 0;
          background:
            linear-gradient(180deg, rgba(255, 248, 236, 0.04), rgba(255, 248, 236, 0.28)),
            radial-gradient(ellipse at 50% 48%, rgba(255, 248, 236, 0.56), rgba(255, 248, 236, 0.18) 38%, transparent 74%);
          transform: translateY(6px);
          transition:
            opacity 1050ms cubic-bezier(.16, 1, .3, 1),
            transform 1050ms cubic-bezier(.16, 1, .3, 1);
        }

        .dreamExitStarted .logoDreamWash {
          opacity: 0.24;
          transform: translateY(0);
        }

        .logoDreamBrand {
          position: absolute;
          left: 50%;
          top: 50%;
          z-index: 5;
          width: min(780px, 90vw);
          transform: translate3d(-50%, -50%, 0);
          text-align: center;
          opacity: 0;
          pointer-events: none;
          color: #fff8ef;
          isolation: isolate;
          will-change: opacity;
          backface-visibility: hidden;
        }

        .logoDreamBrand::before {
          content: "";
          position: absolute;
          left: 50%;
          top: 50%;
          z-index: -1;
          width: min(680px, 86vw);
          height: clamp(132px, 17vw, 228px);
          transform: translate3d(-50%, -50%, 0);
          border-radius: 999px;
          background:
            radial-gradient(ellipse at center, rgba(44, 27, 17, 0.72), rgba(44, 27, 17, 0.38) 44%, rgba(44, 27, 17, 0.12) 68%, transparent 76%);
          opacity: 0.96;
        }

        .logoDreamBrand strong {
          display: block;
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(48px, 7.6vw, 108px);
          font-weight: 500;
          letter-spacing: 0.18em;
          line-height: 1;
          color: #b67c28;
          background: linear-gradient(180deg, #fff0bd 0%, #d5a348 35%, #9a641f 72%, #e7bc68 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          text-shadow:
            0 1px 0 rgba(255, 244, 210, 0.24),
            0 12px 30px rgba(27, 16, 10, 0.62),
            0 0 22px rgba(154, 100, 31, 0.42);
          backface-visibility: hidden;
        }

        .logoDreamKicker {
          display: block;
          margin-bottom: 18px;
          color: #d8ab5a;
          font-size: 11px;
          letter-spacing: 0.38em;
          text-transform: uppercase;
          text-shadow:
            0 8px 20px rgba(27, 16, 10, 0.56),
            0 0 12px rgba(154, 100, 31, 0.32);
        }

        .dreamExitStarted .logoDreamBrand {
          animation: logoDreamBrandIn 3900ms ease-in-out 220ms forwards;
        }

        .logoDreamProgress {
          position: absolute;
          left: 50%;
          bottom: clamp(28px, 5vh, 54px);
          z-index: 6;
          width: min(300px, 52vw);
          height: 1px;
          transform: translateX(-50%);
          background: rgba(255, 238, 207, 0.10);
          overflow: hidden;
          opacity: 0.82;
          transition: opacity 500ms ease, transform 500ms ease;
        }

        .dreamExitStarted .logoDreamProgress {
          opacity: 0;
          transform: translateX(-50%) translateY(8px);
        }

        .logoDreamProgress span {
          display: block;
          width: 0;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 238, 207, 0.82), rgba(214, 177, 107, 0.86));
          animation: logoDreamProgress 5.9s cubic-bezier(.16, 1, .3, 1) 0.25s forwards;
        }

        .pageBehindDream {
          opacity: 0.99;
        }

        .pageLogoDreamEnter {
          animation:
            pageFade 0.75s ease forwards,
            pageLogoDreamEnter 1.05s cubic-bezier(.16, 1, .3, 1) forwards;
        }

        @keyframes logoSatinDreamSweep {
          0% { opacity: 0; transform: translate3d(-12%, 0, 0); }
          42% { opacity: 0.34; }
          100% { opacity: 0; transform: translate3d(12%, 0, 0); }
        }

        @keyframes logoDreamBrandIn {
          0% {
            opacity: 0;
          }
          22% {
            opacity: 0.9;
          }
          34% {
            opacity: 1;
          }
          82% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }

        @keyframes logoVideoSlowStop {
          0% {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
            filter: brightness(1) saturate(0.94);
          }
          45% {
            opacity: 0.88;
            transform: translate3d(0, 0, 0) scale(1.012);
            filter: brightness(1.03) saturate(0.9);
          }
          100% {
            opacity: 0.58;
            transform: translate3d(0, 0, 0) scale(1.04);
            filter: brightness(1.08) saturate(0.82);
          }
        }

        @keyframes logoDreamProgress {
          from { width: 0; opacity: 0; }
          12% { opacity: 1; }
          88% { width: 100%; opacity: 1; }
          to { width: 100%; opacity: 0; }
        }

        @keyframes pageLogoDreamEnter {
          0% {
            opacity: 0;
            transform: translateY(12px) scale(1.005);
          }
          45% {
            opacity: 0.8;
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @media (max-width: 900px) {
          .logoDreamVideo {
            object-fit: cover;
            object-position: center center;
          }

          .logoDreamBrand strong {
            font-size: clamp(38px, 9vw, 78px);
          }

          .logoDreamProgress {
            width: min(300px, 64vw);
            bottom: 34px;
          }
        }

        @media (max-width: 560px) {
          .logoDreamVideo {
            object-fit: cover;
            object-position: center center;
          }

          .logoDreamBrand strong {
            font-size: clamp(36px, 11vw, 58px);
            letter-spacing: 0.13em;
          }

          .logoDreamKicker {
            font-size: 9px;
            letter-spacing: 0.22em;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .loader,
          .loader *,
          .loader::before,
          .loader::after {
            animation-duration: 0.001ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.001ms !important;
          }
        }


        @keyframes pageFade {
          from { opacity: 0.92; }
          to { opacity: 1; }
        }

        @keyframes topBarDrop {
          from { opacity: 0; transform: translateY(-14px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes topBarMarquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }

        @keyframes navDrop {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes heroCopyIn {
          from { opacity: 0; transform: translateX(-32px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes heroImageIn {
          from { opacity: 0; transform: translateX(32px) scale(0.98); }
          to { opacity: 1; transform: translateX(0) scale(1); }
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes luxuryZoom {
          from { transform: scale(1); }
          to { transform: scale(1.055); }
        }

        @keyframes bubblePop {
          0% { transform: scale(0.4); }
          70% { transform: scale(1.15); }
          100% { transform: scale(1); }
        }

        @keyframes heartPop {
          0% { transform: scale(0.85); }
          60% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }

        @keyframes softPop {
          from { transform: scale(0.96); opacity: 0.7; }
          to { transform: scale(1); opacity: 1; }
        }

        @keyframes whatsappPulse {
          0%, 100% {
            box-shadow: 0 14px 35px rgba(36, 26, 20, 0.25), 0 0 0 0 rgba(176, 138, 69, 0.32);
          }
          50% {
            box-shadow: 0 14px 35px rgba(36, 26, 20, 0.25), 0 0 0 10px rgba(176, 138, 69, 0);
          }
        }

        @keyframes overlayFade {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes menuSlide {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }

        @keyframes searchOverlayIn {
          from { opacity: 0; backdrop-filter: blur(0px); }
          to { opacity: 1; backdrop-filter: blur(20px); }
        }


        @media (max-width: 390px) {
          .topBarItem {
            font-size: 7.4px;
            letter-spacing: 0.11em;
            padding: 9px 0;
          }

          .topBarDivider {
            width: 4px;
            height: 4px;
            margin: 0 24px;
          }
        }

        @media (min-width: 1500px) {
          .productGrid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
          .searchResultsGrid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
          .brandMark h1 { font-size: 38px; }
        }


        @media (max-width: 1280px) and (min-width: 1101px) {
          .productGrid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
          .productImage { height: clamp(470px, 42vw, 620px); }
        }



        .adminTab {
          border-color: rgba(176, 138, 69, 0.55) !important;
        }

        .adminStatsGrid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
          margin: 22px 0;
        }

        .adminStatCard,
        .adminOrderCard {
          border: 1px solid rgba(176, 138, 69, 0.24);
          background: rgba(255, 249, 240, 0.76);
          border-radius: 24px;
          box-shadow: 0 18px 42px rgba(36, 26, 20, 0.07);
        }

        .darkMode .adminStatCard,
        .darkMode .adminOrderCard {
          background: rgba(255, 249, 240, 0.08);
          border-color: rgba(215, 180, 111, 0.28);
        }

        .adminStatCard {
          padding: 18px;
        }

        .adminStatCard small,
        .adminOrderTop small {
          display: block;
          color: #b08a45;
          font-size: 10px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        .adminStatCard strong {
          font-family: Georgia, "Times New Roman", serif;
          font-size: 36px;
          font-weight: 500;
        }

        .adminOrdersList {
          display: grid;
          gap: 18px;
          max-height: 70vh;
          overflow: auto;
          padding: 2px 8px 24px 2px;
          scrollbar-width: thin;
        }

        .adminOrderCard {
          padding: 20px;
        }

        .adminOrderTop {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
          padding-bottom: 14px;
          border-bottom: 1px solid rgba(176, 138, 69, 0.20);
        }

        .adminOrderTop strong {
          display: block;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 24px;
          font-weight: 500;
          word-break: break-word;
        }

        .adminOrderTop span:not(.orderStatusPill) {
          display: block;
          color: #7a6656;
          font-size: 12px;
          margin-top: 6px;
        }

        .adminCustomerGrid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px 16px;
          padding: 16px 0;
          color: #6a5545;
          font-size: 13px;
          line-height: 1.6;
        }

        .darkMode .adminCustomerGrid,
        .darkMode .adminOrderTop span:not(.orderStatusPill) {
          color: #eadcc8;
        }

        .adminOrderItems {
          display: grid;
          gap: 10px;
          padding: 12px 0 16px;
          border-top: 1px solid rgba(176, 138, 69, 0.16);
        }

        .adminStatusButtons {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          padding-top: 14px;
          border-top: 1px solid rgba(176, 138, 69, 0.18);
        }

        .statusUpdateBtn {
          border: 1px solid rgba(176, 138, 69, 0.34);
          background: rgba(255, 249, 240, 0.72);
          color: #2c1f18;
          border-radius: 999px;
          padding: 10px 13px;
          font-size: 10px;
          letter-spacing: 0.10em;
          text-transform: uppercase;
          transition: transform 0.25s ease, background 0.25s ease, color 0.25s ease;
        }

        .statusUpdateBtn:hover,
        .statusUpdateBtn.active {
          background: #2c1f18;
          color: #fff9f0;
          transform: translateY(-2px);
        }

        .darkMode .statusUpdateBtn {
          background: rgba(255, 249, 240, 0.08);
          color: #fff9f0;
          border-color: rgba(215, 180, 111, 0.32);
        }

        .darkMode .statusUpdateBtn:hover,
        .darkMode .statusUpdateBtn.active {
          background: #d7b46f;
          color: #211713;
        }

        @media (max-width: 1100px) {
          .productGrid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .styleFinder, .storyGrid, .newsletterBox, .giftCardBox { grid-template-columns: 1fr; }
          .fitNotes { grid-template-columns: 1fr; }
          .emailForm { min-width: 0; }
          .trustBar { grid-template-columns: repeat(2, 1fr); }
          .searchResultsGrid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 900px) {
          body { padding-bottom: 84px; }

          .topBar::before,
          .topBar::after {
            width: 38px;
          }

          .topBarTrack {
            animation-duration: 30s;
          }

          .topBarItem {
            padding: 9px 0;
            font-size: clamp(7px, 2.15vw, 9px);
            letter-spacing: 0.11em;
          }

          .topBarDivider {
            margin: 0 28px;
          }

          .navInner {
            grid-template-columns: auto 1fr auto;
            padding: 14px 16px;
            gap: 10px;
          }

          .navLeft { gap: 0; }
          .navLinks { display: none; }
          .brandMark { justify-self: center; }

          .brandMark h1 {
            font-size: 21px;
            letter-spacing: 0.12em;
          }

          .brandMark p {
            font-size: 8px;
            letter-spacing: 0.18em;
          }

          .pillBtn {
            min-height: 34px;
            padding: 0 10px;
            font-size: 9px;
          }

          .iconBtn {
            width: 36px;
            min-height: 36px;
          }

          .navActions { gap: 5px; flex-wrap: nowrap; }
          .signInBtn {
            width: 36px !important;
            min-width: 36px !important;
            max-width: 36px !important;
            height: 36px !important;
            min-height: 36px !important;
            padding: 0 !important;
            display: grid !important;
            place-items: center !important;
            border-radius: 999px !important;
          }

          .signInBtn::before { display: none !important; }

          .signInBtn .accountShortName {
            width: 100% !important;
            height: 100% !important;
            max-width: none !important;
            overflow: visible !important;
            display: grid !important;
            place-items: center !important;
            gap: 0 !important;
          }

          .signInBtn .accountAvatar {
            width: 29px !important;
            height: 29px !important;
            font-size: 10px !important;
            letter-spacing: 0.05em !important;
          }

          .signInBtn .accountAvatar svg {
            width: 17px !important;
            height: 17px !important;
          }

          .signInBtn .accountDesktopLabel {
            display: none !important;
          }

          .hero {
            min-height: auto;
            grid-template-columns: 1fr;
            padding: 22px 16px 18px;
            gap: 18px;
          }

          .heroCopy {
            min-height: auto;
            border-radius: 28px;
            padding: 36px 24px;
          }

          .heroCopy::after {
            font-size: 130px;
            right: -22px;
            bottom: -34px;
          }

          .heroCopy h2 { font-size: clamp(38px, 12vw, 54px); }

          .heroCopy p.description {
            font-size: 15px;
            line-height: 1.75;
            margin-top: 20px;
          }

          .actions {
            margin-top: 24px;
            gap: 10px;
          }

          .primaryBtn,
          .secondaryBtn {
            width: 100%;
            padding: 14px 16px;
            font-size: 10px;
          }

          .heroVisual {
            min-height: 520px;
            border-radius: 28px;
          }

          .heroCard {
            left: 18px;
            right: 18px;
            bottom: 18px;
            border-radius: 20px;
            padding: 18px;
          }

          .heroCard strong { font-size: 22px; }

          .trustBar {
            grid-template-columns: 1fr 1fr;
            padding: 0 16px 28px;
            gap: 10px;
          }

          .trustItem {
            border-radius: 18px;
            padding: 14px;
            gap: 10px;
          }

          .trustIcon {
            width: 30px;
            height: 30px;
            font-size: 11px;
          }

          .trustItem p {
            font-size: 9px;
            letter-spacing: 0.08em;
          }

          .section {
            padding: 52px 16px;
          }

          .sectionHead {
            flex-direction: column;
            align-items: start;
            margin-bottom: 24px;
          }

          .sectionTitle { font-size: clamp(32px, 10vw, 46px); }

          .sectionIntro {
            font-size: 14px;
            line-height: 1.7;
          }

          .productGrid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 10px;
          }

          .productCard {
            border-radius: 18px;
            box-shadow: 0 10px 22px rgba(51, 38, 30, 0.08);
          }

          .productCard:hover {
            transform: translateY(-3px);
          }

          .productImage {
            height: clamp(185px, 48vw, 260px);
          }

          .stockTag {
            left: 8px;
            bottom: 8px;
            padding: 6px 8px;
            font-size: 7px;
            letter-spacing: 0.08em;
          }

          .heartBtn {
            right: 8px;
            top: 8px;
            width: 28px;
            height: 28px;
            font-size: 13px;
          }

          .productInfo {
            padding: 12px 10px 14px;
            display: block;
          }

          .category {
            margin-bottom: 5px;
            font-size: 7px;
            letter-spacing: 0.13em;
            line-height: 1.35;
          }

          .productInfo h4 {
            font-size: clamp(14px, 3.7vw, 18px);
            line-height: 1.05;
            max-width: 100%;
          }

          .price {
            margin-top: 7px;
            font-size: 11px;
            line-height: 1.35;
          }

          .cardActions {
            display: grid;
            grid-template-columns: 1fr;
            gap: 6px;
            margin-top: 10px;
          }

          .viewBtn,
          .addBtn {
            padding: 8px 7px;
            font-size: 8px;
            letter-spacing: 0.10em;
          }

          .viewBtn,
          .addBtn {
            width: 100%;
            padding: 12px 14px;
          }

          .shopTools {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .searchBox {
            min-height: 58px;
            padding: 15px 18px;
          }

          .luxurySortButton {
            min-height: 58px;
            padding: 12px 48px 11px 18px;
          }

          .luxurySortCopy small {
            font-size: 8px;
            letter-spacing: 0.22em;
          }

          .luxurySortCopy span {
            font-size: 18px;
          }

          .luxurySortArrow {
            width: 28px;
            height: 28px;
          }

          .luxurySortOption {
            padding: 12px 14px;
            font-size: 10px;
            letter-spacing: 0.11em;
          }

          .filterRow {
            overflow-x: auto;
            flex-wrap: nowrap;
            padding-bottom: 8px;
          }

          .filterBtn { white-space: nowrap; }

          .cleanPanel,
          .giftCardBox,
          .newsletterBox {
            border-radius: 28px;
            padding: 28px 22px;
          }

          .styleFinder { grid-template-columns: 1fr; }

          .moodCard img { height: 500px; }

          .sizeTable { min-width: 720px; }

          .storyGrid { grid-template-columns: 1fr; }

          .storyImage {
            min-height: 500px;
          }

          .storyPoints { grid-template-columns: 1fr; }

          .newsletterBox { grid-template-columns: 1fr; }

          .emailForm {
            flex-direction: column;
            min-width: 0;
          }

          .footer {
            padding: 32px 16px 110px;
          }

          .footerInner {
            flex-direction: column;
            text-align: center;
          }

          .footerLinks {
            justify-content: center;
            gap: 14px;
            font-size: 11px;
          }

          .floatingWhatsApp,
          .backTop { display: none; }

          .searchOverlayTop {
            min-height: 88px;
            padding: 0 16px;
            gap: 12px;
          }

          .searchOverlayTop input { font-size: 21px; }

          .searchCloseBtn {
            width: 42px;
            height: 42px;
            font-size: 28px;
          }

          .searchOverlayContent {
            padding: 32px 16px 110px;
          }

          .searchResultsGrid { grid-template-columns: 1fr; }

          .searchResultCard img { height: 440px; }

          .menuPanel {
            width: 100%;
            padding: 24px;
          }

          .menuLinks a,
          .menuLinks button {
            font-size: 24px;
          }

          .cartDrawer {
            left: 12px;
            right: 12px;
            top: auto;
            bottom: 92px;
            width: auto;
            max-height: 72vh;
            border-radius: 28px;
          }

          .modal {
            width: calc(100vw - 24px);
            grid-template-columns: 1fr;
            max-height: 88vh;
            border-radius: 28px;
          }

          .modalImage {
            min-height: 520px;
            height: 58vh;
            max-height: 620px;
          }

          .modalInfo {
            max-height: 48vh;
            padding: 24px;
          }

          .modalInfo h3 { font-size: 28px; }

          .closeBtn {
            right: 18px;
            top: 18px;
          }

  
        .signInBackdrop {
          position: fixed;
          inset: 0;
          z-index: 95;
          background: rgba(36, 26, 20, 0.58);
          backdrop-filter: blur(12px);
          display: grid;
          place-items: center;
          padding: 22px;
          animation: fadeIn 0.28s ease both;
        }

        .signInPanel {
          width: min(460px, 100%);
          border-radius: 34px;
          background: linear-gradient(145deg, #fff9f0, #efe3d2);
          border: 1px solid rgba(176, 138, 69, 0.42);
          box-shadow: 0 28px 90px rgba(36, 26, 20, 0.34);
          padding: 30px;
          position: relative;
          overflow: hidden;
          animation: modalRise 0.42s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .signInPanel::before {
          content: "LA GRAZIA";
          position: absolute;
          right: -18px;
          bottom: -18px;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 60px;
          letter-spacing: 0.12em;
          color: rgba(176, 138, 69, 0.08);
          pointer-events: none;
        }

        .darkMode .signInPanel {
          background: linear-gradient(145deg, #2c1f18, #211713);
          color: #fff9f0;
          border-color: rgba(215, 180, 111, 0.42);
        }

        .signInClose {
          position: absolute;
          right: 18px;
          top: 18px;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          border: 1px solid rgba(176, 138, 69, 0.34);
          background: rgba(255, 249, 240, 0.68);
          color: #2c1f18;
          font-size: 22px;
          z-index: 2;
        }

        .darkMode .signInClose {
          background: rgba(255, 249, 240, 0.08);
          color: #fff9f0;
          border-color: rgba(215, 180, 111, 0.42);
        }

        .signInPanel h3 {
          margin: 8px 0 12px;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 36px;
          font-weight: 500;
          line-height: 1;
          position: relative;
          z-index: 1;
        }

        .signInPanel p {
          margin: 0 0 20px;
          color: #6a5545;
          line-height: 1.75;
          position: relative;
          z-index: 1;
        }

        .darkMode .signInPanel p { color: #e9dcc8; }

        .signInTabs {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          padding: 6px;
          border-radius: 999px;
          background: rgba(176, 138, 69, 0.12);
          border: 1px solid rgba(176, 138, 69, 0.28);
          margin: 0 0 18px;
        }

        .signInTab {
          border: 0;
          border-radius: 999px;
          padding: 12px 14px;
          background: transparent;
          color: #6a5545;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          font-size: 10px;
          transition: 0.22s ease;
        }

        .signInTab.active {
          background: #2c1f18;
          color: #fff9f0;
          box-shadow: 0 10px 22px rgba(36, 26, 20, 0.16);
        }

        .darkMode .signInTabs {
          background: rgba(255, 249, 240, 0.08);
          border-color: rgba(215, 180, 111, 0.35);
        }

        .darkMode .signInTab { color: #e9dcc8; }

        .darkMode .signInTab.active {
          background: #d7b46f;
          color: #211713;
        }

        .authSwitchBtn {
          border: 0 !important;
          background: transparent !important;
          color: #b08a45 !important;
          padding: 6px 8px !important;
          font-size: 11px !important;
          letter-spacing: 0.08em !important;
          text-transform: none !important;
          text-decoration: underline;
          text-underline-offset: 4px;
        }

        .darkMode .authSwitchBtn { color: #d7b46f !important; }

        .signInForm {
          display: grid;
          gap: 12px;
          position: relative;
          z-index: 1;
        }

        .signInForm input {
          width: 100%;
          border-radius: 999px;
          border: 1px solid rgba(176, 138, 69, 0.38);
          background: rgba(255, 249, 240, 0.82);
          color: #2c1f18;
          padding: 15px 18px;
          outline: none;
          font-size: 14px;
        }

        .signInForm input:focus {
          border-color: #b08a45;
          box-shadow: 0 0 0 4px rgba(176, 138, 69, 0.12);
        }

        .darkMode .signInForm input {
          background: rgba(255, 249, 240, 0.08);
          color: #fff9f0;
          border-color: rgba(215, 180, 111, 0.42);
        }

        .accountSavedBox {
          border-radius: 24px;
          border: 1px solid rgba(176, 138, 69, 0.32);
          background: rgba(255, 249, 240, 0.55);
          padding: 18px;
          margin: 18px 0;
          position: relative;
          z-index: 1;
        }

        .darkMode .accountSavedBox { background: rgba(255, 249, 240, 0.08); }

        .accountSavedBox strong {
          display: block;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 24px;
          font-weight: 500;
          margin-bottom: 6px;
        }

        .accountSavedBox span {
          display: block;
          color: #7a6250;
          font-size: 13px;
          line-height: 1.6;
        }

        .darkMode .accountSavedBox span { color: #e9dcc8; }

        .accountActions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          position: relative;
          z-index: 1;
        }

        .accountActions button,
        .signInForm button {
          border-radius: 999px;
          padding: 14px 18px;
          border: 1px solid rgba(176, 138, 69, 0.45);
          letter-spacing: 0.14em;
          text-transform: uppercase;
          font-size: 11px;
        }

        .signInForm button,
        .accountPrimary {
          background: #2c1f18;
          color: #fff9f0;
        }

        .accountSecondary {
          background: transparent;
          color: #2c1f18;
        }

        .darkMode .accountSecondary { color: #fff9f0; }
        .toast {
            bottom: 92px;
            width: calc(100vw - 36px);
            text-align: center;
          }

          .mobileBottom {
            position: fixed;
            left: 12px;
            right: 12px;
            bottom: 12px;
            z-index: 60;
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            background: rgba(44, 31, 24, 0.96);
            border: 1px solid rgba(215, 180, 111, 0.34);
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 18px 45px rgba(36, 26, 20, 0.28);
          }

          .mobileBottom a,
          .mobileBottom button {
            border: 0;
            background: transparent;
            color: #f7f1e8;
            padding: 13px 8px;
            font-size: 10px;
            letter-spacing: 0.08em;
            text-transform: uppercase;
          }
        }

        @media (max-width: 430px) {
          .productImage { height: 470px; }
          .heroVisual { min-height: 460px; }
          .moodCard img,
          .storyImage { height: 420px; min-height: 420px; }
          .searchResultCard img { height: 380px; }
          .modalImage { min-height: 430px; height: 52vh; }
          .brandMark h1 { font-size: 18px; }
          .navActions { gap: 4px; }
          .signInBtn { max-width: 72px; padding: 0 8px; }
          .accountDot { display: none; }
        }
      

        @media (max-width: 700px) {

          .adminStatsGrid,
          .adminCustomerGrid {
            grid-template-columns: 1fr;
          }

          .adminOrdersList {
            max-height: none;
            overflow: visible;
            padding-right: 0;
          }

          .adminOrderCard {
            padding: 16px;
            border-radius: 22px;
          }

          .adminOrderTop {
            flex-direction: column;
            align-items: flex-start;
          }

          .adminStatusButtons {
            gap: 7px;
          }

          .statusUpdateBtn {
            padding: 9px 11px;
            font-size: 9px;
          }

          .productGrid,
          .bestSellerGrid,
          .wishlistGrid {
            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
            gap: 10px !important;
          }

          .products,
          .wishlistSection {
            padding-left: 10px !important;
            padding-right: 10px !important;
          }

          .productCard {
            border-radius: 16px !important;
            min-width: 0 !important;
          }

          .productImage {
            height: 165px !important;
            border-radius: 16px 16px 0 0 !important;
          }

          .productTag {
            display: none !important;
          }

          .stockTag {
            left: 7px !important;
            bottom: 7px !important;
            padding: 6px 8px !important;
            font-size: 7px !important;
            letter-spacing: 0.08em !important;
          }

          .heartBtn {
            right: 7px !important;
            top: 7px !important;
            width: 28px !important;
            height: 28px !important;
            font-size: 14px !important;
          }

          .productInfo {
            padding: 12px 9px 14px !important;
            display: block !important;
          }

          .category {
            font-size: 7px !important;
            letter-spacing: 0.16em !important;
            margin-bottom: 6px !important;
            line-height: 1.4 !important;
          }

          .productInfo h4 {
            font-size: 15px !important;
            line-height: 1.05 !important;
            margin: 0 !important;
          }

          .price {
            font-size: 11px !important;
            line-height: 1.35 !important;
            margin-top: 7px !important;
          }

          .cardActions {
            margin-top: 10px !important;
            display: flex !important;
            flex-direction: row !important;
            gap: 5px !important;
          }

          .viewBtn,
          .addBtn {
            flex: 1 !important;
            padding: 7px 4px !important;
            font-size: 7px !important;
            letter-spacing: 0.08em !important;
          }
        }


        /* Mobile product modal fix: make the full product popup scrollable and polished */
        @media (max-width: 700px) {
          .modalBackdrop {
            display: flex !important;
            align-items: flex-start !important;
            justify-content: center !important;
            overflow-y: auto !important;
            -webkit-overflow-scrolling: touch !important;
            padding: 78px 10px 130px !important;
          }

          .modal {
            width: min(100%, calc(100vw - 20px)) !important;
            max-height: none !important;
            min-height: 0 !important;
            display: flex !important;
            flex-direction: column !important;
            overflow: visible !important;
            border-radius: 30px !important;
            box-shadow: 0 28px 70px rgba(36, 26, 20, 0.38) !important;
            margin: 0 auto !important;
          }

          .modalImage {
            width: 100% !important;
            min-height: 0 !important;
            height: 42vh !important;
            max-height: 360px !important;
            border-radius: 30px 30px 0 0 !important;
            flex: 0 0 auto !important;
          }

          .modalImage img {
            width: 100% !important;
            height: 100% !important;
            object-fit: cover !important;
            object-position: top center !important;
          }

          .modalInfo {
            max-height: none !important;
            overflow: visible !important;
            padding: 20px 18px 28px !important;
            background: #fff9f0 !important;
            border-radius: 0 0 30px 30px !important;
          }

          .modalInfo .eyebrow {
            font-size: 9px !important;
            letter-spacing: 0.22em !important;
            margin-bottom: 8px !important;
          }

          .modalInfo h3 {
            font-size: 26px !important;
            line-height: 1.06 !important;
            margin-bottom: 8px !important;
          }

          .modalInfo p {
            font-size: 13px !important;
            line-height: 1.45 !important;
            margin: 7px 0 !important;
          }

          .buttonList,
          .completeLook {
            gap: 8px !important;
            margin: 8px 0 14px !important;
          }

          .sizeBtn,
          .colorBtn,
          .qtyBtn {
            padding: 8px 12px !important;
            font-size: 10px !important;
          }

          .qtyBox {
            margin: 8px 0 16px !important;
          }

          .completeLook span {
            padding: 9px 13px !important;
            font-size: 12px !important;
          }

          .modalInfo .secondaryBtn,
          .modalInfo .primaryBtn,
          .modalInfo .notifyBtn {
            width: 100% !important;
            min-height: 52px !important;
            margin-top: 10px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            border-radius: 999px !important;
          }

          .modalInfo .notifyBtn {
            margin-bottom: 14px !important;
            border-style: dashed !important;
          }

          .closeBtn {
            position: fixed !important;
            top: max(16px, env(safe-area-inset-top)) !important;
            right: 16px !important;
            width: 54px !important;
            height: 54px !important;
            z-index: 120 !important;
            background: #fff9f0 !important;
            color: #2c1f18 !important;
            box-shadow: 0 12px 30px rgba(36, 26, 20, 0.28) !important;
          }
        }



        @media (min-width: 901px) {
          body,
          #root,
          .page {
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
          }

          .topBar,
          .nav,
          .section,
          .hero,
          .trustBar,
          .footerInner,
          .searchOverlayContent {
            width: 100% !important;
            max-width: none !important;
          }

          .navInner {
            width: 100% !important;
            max-width: none !important;
            padding-left: clamp(34px, 5vw, 92px) !important;
            padding-right: clamp(34px, 5vw, 92px) !important;
          }

          .hero {
            width: 100% !important;
            max-width: none !important;
            min-height: calc(100vh - 82px) !important;
            padding-left: clamp(34px, 5vw, 92px) !important;
            padding-right: clamp(34px, 5vw, 92px) !important;
            grid-template-columns: minmax(430px, 0.86fr) minmax(560px, 1.14fr) !important;
            gap: clamp(38px, 4.4vw, 78px) !important;
          }

          .heroCopy,
          .heroVisual {
            min-height: calc(100vh - 190px) !important;
          }

          .heroCopy {
            padding: clamp(54px, 5.2vw, 96px) !important;
          }

          .heroVisual img {
            object-fit: cover !important;
            object-position: top center !important;
          }

          .section,
          .trustBar {
            padding-left: clamp(34px, 5vw, 92px) !important;
            padding-right: clamp(34px, 5vw, 92px) !important;
          }

          .productGrid,
          .bestSellerGrid,
          .wishlistGrid {
            grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
            gap: clamp(26px, 2.4vw, 42px) !important;
          }

          .productImage {
            height: clamp(440px, 32vw, 620px) !important;
          }

          .productInfo {
            min-height: 240px !important;
            padding: 30px 26px 34px !important;
          }

          .collectionGrid,
          .reviewGrid,
          .journalGrid,
          .policyGrid,
          .faqGrid,
          .occasionGrid {
            width: 100% !important;
          }
        }

        @media (min-width: 1400px) {
          .hero {
            grid-template-columns: minmax(520px, 0.9fr) minmax(680px, 1.1fr) !important;
          }

          .brandMark h1 {
            font-size: 40px !important;
          }

          .heroCopy h2 {
            font-size: clamp(78px, 6.2vw, 112px) !important;
          }
        }


        /* Mobile profile/account page scroll fix */
        @media (max-width: 700px) {
          .signInBackdrop {
            display: block !important;
            place-items: unset !important;
            overflow-y: auto !important;
            overflow-x: hidden !important;
            -webkit-overflow-scrolling: touch !important;
            min-height: 100dvh !important;
            height: 100dvh !important;
            padding: calc(16px + env(safe-area-inset-top)) 14px calc(150px + env(safe-area-inset-bottom)) !important;
          }

          .signInPanel {
            width: 100% !important;
            max-width: 520px !important;
            margin: 16px auto 0 !important;
            max-height: none !important;
            height: auto !important;
            min-height: auto !important;
            overflow: visible !important;
            border-radius: 30px !important;
            padding: 26px 18px 28px !important;
          }

          .signInClose {
            right: 14px !important;
            top: 14px !important;
            width: 42px !important;
            height: 42px !important;
            font-size: 24px !important;
            z-index: 5 !important;
          }

          .signInPanel .eyebrow {
            text-align: center !important;
            margin-top: 8px !important;
            margin-bottom: 10px !important;
            font-size: 10px !important;
            letter-spacing: 0.28em !important;
          }

          .signInPanel h3 {
            font-size: clamp(34px, 10vw, 48px) !important;
            line-height: 0.98 !important;
            text-align: center !important;
            margin: 8px auto 14px !important;
            max-width: 330px !important;
          }

          .signInPanel > p {
            font-size: 16px !important;
            line-height: 1.65 !important;
            text-align: center !important;
            margin: 0 auto 20px !important;
            max-width: 330px !important;
          }

          .profileHeroBox {
            text-align: left !important;
            border-radius: 24px !important;
            padding: 18px !important;
            margin: 14px 0 16px !important;
          }

          .profileHeroBox span,
          .accountSavedBox span {
            font-size: 13px !important;
            line-height: 1.55 !important;
            word-break: break-word !important;
          }

          .profileHeroBox strong,
          .accountSavedBox strong {
            font-size: clamp(24px, 8vw, 34px) !important;
            line-height: 1.08 !important;
            word-break: break-word !important;
          }

          .profileTabs {
            margin: 14px 0 18px !important;
            padding: 6px !important;
            gap: 6px !important;
          }

          .profileTab {
            padding: 13px 8px !important;
            font-size: 10px !important;
            letter-spacing: 0.16em !important;
          }

          .profileInfoGrid {
            gap: 12px !important;
            margin: 14px 0 18px !important;
          }

          .profileInfoCard,
          .noOrdersBox,
          .orderCard {
            border-radius: 24px !important;
            padding: 18px 14px !important;
          }

          .profileInfoCard small,
          .orderCard small {
            text-align: center !important;
            margin-bottom: 10px !important;
            font-size: 10px !important;
            letter-spacing: 0.18em !important;
          }

          .profileInfoCard strong {
            text-align: center !important;
            font-size: 15px !important;
            line-height: 1.35 !important;
            overflow-wrap: anywhere !important;
          }

          .ordersPanel {
            max-height: none !important;
            overflow: visible !important;
            padding-right: 0 !important;
            margin: 14px 0 18px !important;
          }

          .orderCardTop {
            flex-direction: column !important;
            align-items: flex-start !important;
          }

          .orderMetaGrid {
            grid-template-columns: 1fr !important;
          }

          .accountActions {
            grid-template-columns: 1fr !important;
            gap: 10px !important;
            margin-top: 16px !important;
            padding-bottom: 8px !important;
          }

          .accountActions button,
          .signInForm button {
            width: 100% !important;
            padding: 15px 16px !important;
          }
        }



        /* Final account/nav/order layout polish */
        .signInBtn {
          width: 44px !important;
          max-width: 44px !important;
          min-width: 44px !important;
          height: 44px !important;
          min-height: 44px !important;
          padding: 0 !important;
          border-radius: 999px !important;
          display: inline-grid !important;
          place-items: center !important;
        }

        .signInBtn .accountShortName {
          width: 100% !important;
          height: 100% !important;
          display: grid !important;
          place-items: center !important;
          gap: 0 !important;
        }

        .signInBtn .accountDesktopLabel {
          display: none !important;
        }

        .signInBtn .accountAvatar {
          width: 31px !important;
          height: 31px !important;
          font-size: 10px !important;
          letter-spacing: 0.05em !important;
        }

        .signInBtn .accountAvatar svg {
          width: 17px !important;
          height: 17px !important;
        }

        .signedAccountBtn {
          box-shadow: 0 12px 26px rgba(176, 138, 69, 0.18) !important;
        }

        .signInBackdrop {
          align-items: center !important;
          justify-items: center !important;
          padding: 18px !important;
          overflow: hidden !important;
        }

        .signInPanel {
          width: min(420px, calc(100vw - 32px)) !important;
          max-height: min(88vh, 760px) !important;
          overflow-y: auto !important;
          overflow-x: hidden !important;
          border-radius: 28px !important;
          padding: 24px 24px 20px !important;
          scrollbar-width: thin !important;
          scrollbar-color: rgba(176, 138, 69, 0.55) transparent !important;
        }

        .signInPanel::-webkit-scrollbar {
          width: 5px;
        }

        .signInPanel::-webkit-scrollbar-thumb {
          background: rgba(176, 138, 69, 0.55);
          border-radius: 999px;
        }

        .signInPanel h3 {
          font-size: 31px !important;
          margin: 5px 0 8px !important;
          line-height: 1.04 !important;
        }

        .signInPanel > p {
          font-size: 15px !important;
          line-height: 1.55 !important;
          margin-bottom: 15px !important;
        }

        .signInClose {
          width: 34px !important;
          height: 34px !important;
          top: 16px !important;
          right: 16px !important;
          font-size: 20px !important;
        }

        .accountSavedBox {
          border-radius: 20px !important;
          padding: 14px 16px !important;
          margin: 13px 0 !important;
        }

        .accountSavedBox strong {
          font-size: 22px !important;
          margin-bottom: 4px !important;
        }

        .accountSavedBox span {
          font-size: 12px !important;
          line-height: 1.45 !important;
        }

        .profileTabs {
          margin: 12px 0 !important;
          padding: 5px !important;
          gap: 6px !important;
        }

        .profileTab {
          padding: 10px 8px !important;
          font-size: 10px !important;
        }

        .profileInfoGrid {
          gap: 9px !important;
          margin: 10px 0 !important;
        }

        .profileInfoCard,
        .noOrdersBox,
        .orderCard {
          border-radius: 18px !important;
          padding: 13px !important;
        }

        .profileInfoCard small,
        .orderCard small {
          font-size: 9px !important;
          margin-bottom: 5px !important;
        }

        .profileInfoCard strong,
        .noOrdersBox strong {
          font-size: 13px !important;
          overflow-wrap: anywhere !important;
        }

        .ordersPanel {
          display: flex !important;
          gap: 12px !important;
          overflow-x: auto !important;
          overflow-y: hidden !important;
          max-height: none !important;
          padding: 2px 4px 12px !important;
          margin: 10px -4px 12px !important;
          scroll-snap-type: x mandatory !important;
          -webkit-overflow-scrolling: touch !important;
        }

        .ordersPanel::-webkit-scrollbar {
          height: 5px;
        }

        .ordersPanel::-webkit-scrollbar-thumb {
          background: rgba(176, 138, 69, 0.45);
          border-radius: 999px;
        }

        .orderCard {
          flex: 0 0 min(330px, 88%) !important;
          scroll-snap-align: center !important;
          min-width: 0 !important;
        }

        .orderCardTop strong {
          font-size: 17px !important;
        }

        .orderStatusPill {
          padding: 7px 9px !important;
          font-size: 9px !important;
        }

        .orderMetaGrid {
          gap: 6px !important;
          margin: 10px 0 !important;
          font-size: 11px !important;
        }

        .orderMiniItem {
          grid-template-columns: 38px 1fr !important;
          gap: 8px !important;
          padding-top: 7px !important;
        }

        .orderMiniItem img {
          width: 38px !important;
          height: 48px !important;
          border-radius: 10px !important;
        }

        .orderMiniItem strong {
          font-size: 12px !important;
          line-height: 1.25 !important;
        }

        .orderMiniItem span {
          font-size: 10px !important;
        }

        .accountActions {
          gap: 8px !important;
          margin-top: 10px !important;
        }

        .accountActions button,
        .signInForm button {
          padding: 12px 14px !important;
          font-size: 10px !important;
        }

        @media (max-width: 700px) {
          .navActions {
            gap: 6px !important;
          }

          .signInBtn {
            width: 38px !important;
            max-width: 38px !important;
            min-width: 38px !important;
            height: 38px !important;
            min-height: 38px !important;
          }

          .signInBtn .accountAvatar {
            width: 29px !important;
            height: 29px !important;
          }

          .signInPanel {
            width: calc(100vw - 24px) !important;
            max-height: calc(100dvh - 78px) !important;
            border-radius: 26px !important;
            padding: 22px 18px 26px !important;
          }

          .signInPanel h3 {
            font-size: 28px !important;
          }

          .signInPanel > p {
            font-size: 14px !important;
            line-height: 1.5 !important;
          }

          .accountSavedBox {
            padding: 13px 14px !important;
          }

          .accountSavedBox strong {
            font-size: 21px !important;
          }

          .profileInfoGrid {
            gap: 8px !important;
          }

          .profileInfoCard {
            min-height: auto !important;
          }

          .ordersPanel {
            display: flex !important;
            flex-direction: row !important;
            overflow-x: auto !important;
            overflow-y: hidden !important;
            max-height: none !important;
            padding-bottom: 14px !important;
          }

          .orderCard {
            flex: 0 0 86% !important;
          }

          .orderCardTop {
            flex-direction: row !important;
            align-items: flex-start !important;
          }

          .orderMetaGrid {
            grid-template-columns: 1fr !important;
          }

          .accountActions {
            grid-template-columns: 1fr 1fr !important;
            padding-bottom: max(8px, env(safe-area-inset-bottom)) !important;
          }
        }



        /* Full account page layout */
        .accountPageMain {
          width: min(1680px, 100%);
          margin: 0 auto;
          padding: 48px clamp(24px, 4vw, 72px) 92px;
          min-height: calc(100vh - 140px);
        }

        .accountFullShell {
          display: grid;
          grid-template-columns: minmax(280px, 0.8fr) minmax(0, 1.2fr);
          gap: 28px;
          align-items: start;
        }

        .accountFullHero,
        .accountFullContent {
          background: rgba(255, 249, 240, 0.86);
          border: 1px solid rgba(176, 138, 69, 0.25);
          border-radius: 34px;
          box-shadow: 0 18px 44px rgba(36, 26, 20, 0.08);
        }

        .darkMode .accountFullHero,
        .darkMode .accountFullContent {
          background: #2c1f18;
          border-color: rgba(215, 180, 111, 0.34);
        }

        .accountFullHero {
          position: sticky;
          top: 116px;
          padding: 34px;
          overflow: hidden;
        }

        .accountFullHero::after {
          content: "LG";
          position: absolute;
          right: -20px;
          bottom: -48px;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 180px;
          color: rgba(176, 138, 69, 0.09);
          pointer-events: none;
        }

        .accountFullHero > * {
          position: relative;
          z-index: 1;
        }

        .accountFullAvatar {
          width: 72px;
          height: 72px;
          border-radius: 999px;
          display: grid;
          place-items: center;
          background: linear-gradient(135deg, #2c1f18, #5a4636);
          color: #fff9f0;
          border: 1px solid rgba(176, 138, 69, 0.55);
          font-size: 23px;
          font-weight: 700;
          letter-spacing: 0.08em;
          margin-bottom: 18px;
          box-shadow: 0 16px 34px rgba(36, 26, 20, 0.16);
        }

        .darkMode .accountFullAvatar {
          background: #d7b46f;
          color: #211713;
        }

        .accountFullHero h2 {
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(38px, 3vw, 56px);
          line-height: 1.02;
          font-weight: 500;
          margin: 0 0 12px;
        }

        .accountFullHero p {
          margin: 0;
          color: #6a5545;
          line-height: 1.75;
        }

        .accountFullDetails {
          margin-top: 24px;
          display: grid;
          gap: 12px;
        }

        .accountFullDetail {
          border: 1px solid rgba(176, 138, 69, 0.2);
          background: rgba(247, 241, 232, 0.58);
          border-radius: 20px;
          padding: 14px 16px;
        }

        .darkMode .accountFullDetail {
          background: rgba(255, 249, 240, 0.06);
          border-color: rgba(215, 180, 111, 0.24);
        }

        .accountFullDetail small {
          display: block;
          color: #b08a45;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          font-size: 10px;
          margin-bottom: 6px;
        }

        .accountFullDetail strong {
          display: block;
          font-size: 15px;
          overflow-wrap: anywhere;
        }

        .accountFullContent {
          padding: 30px;
        }

        .accountFullTabs {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
          background: #efe3d2;
          border: 1px solid rgba(176, 138, 69, 0.22);
          border-radius: 999px;
          padding: 7px;
          margin-bottom: 24px;
        }

        .darkMode .accountFullTabs {
          background: rgba(255, 249, 240, 0.06);
          border-color: rgba(215, 180, 111, 0.28);
        }

        .accountFullTab {
          border: 0;
          border-radius: 999px;
          padding: 14px;
          background: transparent;
          color: #6a5545;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          font-size: 11px;
          transition: background 0.25s ease, color 0.25s ease, transform 0.25s ease;
        }

        .accountFullTab.active {
          background: #2c1f18;
          color: #fff9f0;
          box-shadow: 0 10px 24px rgba(36, 26, 20, 0.12);
        }

        .darkMode .accountFullTab {
          color: #eadcc8;
        }

        .darkMode .accountFullTab.active {
          background: #d7b46f;
          color: #211713;
        }

        .accountPageTitleRow {
          display: flex;
          align-items: end;
          justify-content: space-between;
          gap: 18px;
          margin-bottom: 20px;
        }

        .accountPageTitleRow h3 {
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(30px, 2.5vw, 48px);
          font-weight: 500;
          line-height: 1.05;
          margin: 0;
        }

        .accountPageTitleRow p {
          margin: 8px 0 0;
          color: #6a5545;
          line-height: 1.65;
        }

        .accountProfileGrid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
        }

        .accountProfileCard {
          min-height: 136px;
          border-radius: 24px;
          border: 1px solid rgba(176, 138, 69, 0.22);
          background: linear-gradient(135deg, rgba(255,249,240,0.92), rgba(239,227,210,0.72));
          padding: 22px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          text-align: center;
        }

        .darkMode .accountProfileCard {
          background: rgba(255, 249, 240, 0.06);
          border-color: rgba(215, 180, 111, 0.26);
        }

        .accountProfileCard small {
          display: block;
          color: #b08a45;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          font-size: 10px;
          margin-bottom: 10px;
        }

        .accountProfileCard strong {
          font-size: 17px;
          overflow-wrap: anywhere;
        }

        .profileEditPanel,
        .addressBookPanel,
        .addressFormPanel {
          margin-top: 22px;
          border: 1px solid rgba(176, 138, 69, 0.22);
          background: rgba(255, 249, 240, 0.62);
          border-radius: 28px;
          padding: 22px;
          box-shadow: 0 18px 42px rgba(36, 26, 20, 0.06);
        }

        .darkMode .profileEditPanel,
        .darkMode .addressBookPanel,
        .darkMode .addressFormPanel {
          background: rgba(255, 249, 240, 0.055);
          border-color: rgba(215, 180, 111, 0.28);
        }

        .miniSectionHead {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 18px;
        }

        .miniSectionHead.compact { margin-bottom: 12px; }

        .miniSectionHead span {
          display: block;
          color: #b08a45;
          font-size: 10px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          margin-bottom: 7px;
        }

        .miniSectionHead strong {
          font-family: Georgia, "Times New Roman", serif;
          font-size: 26px;
          font-weight: 500;
          line-height: 1.1;
        }

        .luxurySmallBtn {
          border: 1px solid rgba(176, 138, 69, 0.42);
          border-radius: 999px;
          padding: 12px 18px;
          background: #2c1f18;
          color: #fff9f0;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          font-size: 10px;
          white-space: nowrap;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }

        .luxurySmallBtn.secondary {
          background: transparent;
          color: #2c1f18;
        }

        .darkMode .luxurySmallBtn.secondary { color: #fff9f0; }

        .luxurySmallBtn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 26px rgba(36, 26, 20, 0.14);
        }

        .profileFormGrid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
        }

        .profileFormGrid label,
        .defaultCheck {
          display: flex;
          flex-direction: column;
          gap: 7px;
          color: #6a5545;
          font-size: 12px;
        }

        .profileFormGrid label span {
          color: #b08a45;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          font-size: 9px;
        }

        .profileFormGrid input {
          width: 100%;
          min-height: 46px;
          border: 1px solid rgba(176, 138, 69, 0.26);
          border-radius: 18px;
          background: rgba(255, 249, 240, 0.76);
          color: #241a14;
          padding: 0 14px;
          outline: 0;
        }

        .profileFormGrid input:focus {
          border-color: rgba(176, 138, 69, 0.72);
          box-shadow: 0 0 0 4px rgba(176, 138, 69, 0.10);
        }

        .profileFormGrid input:disabled {
          opacity: 0.72;
          cursor: not-allowed;
        }

        .darkMode .profileFormGrid input {
          background: rgba(255, 249, 240, 0.08);
          color: #fff9f0;
          border-color: rgba(215, 180, 111, 0.30);
        }

        .profileWide { grid-column: 1 / -1; }

        .addressCardsGrid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
          margin-bottom: 18px;
        }

        .addressCard,
        .emptyAddressCard {
          border: 1px solid rgba(176, 138, 69, 0.22);
          border-radius: 24px;
          padding: 18px;
          background: linear-gradient(135deg, rgba(255,249,240,0.86), rgba(239,227,210,0.58));
        }

        .addressCard.default {
          border-color: rgba(176, 138, 69, 0.68);
          box-shadow: 0 14px 30px rgba(176, 138, 69, 0.10);
        }

        .darkMode .addressCard,
        .darkMode .emptyAddressCard {
          background: rgba(255, 249, 240, 0.06);
          border-color: rgba(215, 180, 111, 0.28);
        }

        .addressCard small {
          display: block;
          color: #b08a45;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          font-size: 9px;
          margin-bottom: 8px;
        }

        .addressCard strong {
          font-family: Georgia, "Times New Roman", serif;
          font-size: 23px;
          font-weight: 500;
        }

        .addressCard p,
        .emptyAddressCard {
          margin: 8px 0 0;
          color: #6a5545;
          line-height: 1.55;
          overflow-wrap: anywhere;
        }

        .addressActions,
        .addressFormActions {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 14px;
        }

        .addressActions button {
          border: 1px solid rgba(176, 138, 69, 0.26);
          border-radius: 999px;
          background: transparent;
          color: inherit;
          padding: 9px 12px;
          font-size: 10px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .defaultCheck {
          flex-direction: row;
          align-items: center;
          margin: 14px 0;
        }

        .defaultCheck input { accent-color: #2c1f18; }

        .accountOrdersCarousel {
          display: flex;
          gap: 16px;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          padding: 4px 4px 18px;
          scrollbar-width: thin;
          scrollbar-color: rgba(176, 138, 69, 0.55) transparent;
        }

        .accountOrdersCarousel::-webkit-scrollbar {
          height: 8px;
        }

        .accountOrdersCarousel::-webkit-scrollbar-thumb {
          background: rgba(176, 138, 69, 0.55);
          border-radius: 999px;
        }

        .accountOrderSlide {
          flex: 0 0 min(520px, 88%);
          scroll-snap-align: start;
        }

        .trackSteps {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 6px;
          margin: 16px 0 0;
        }

        .trackStep {
          position: relative;
          text-align: center;
          color: #9b8471;
          font-size: 9px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          line-height: 1.35;
        }

        .trackStep::before {
          content: "";
          width: 10px;
          height: 10px;
          border-radius: 50%;
          display: block;
          margin: 0 auto 7px;
          background: #e8d6bd;
          border: 1px solid rgba(176, 138, 69, 0.35);
        }

        .trackStep.active {
          color: #2c1f18;
          font-weight: 700;
        }

        .trackStep.active::before {
          background: #2c1f18;
          border-color: #2c1f18;
          box-shadow: 0 0 0 4px rgba(176, 138, 69, 0.12);
        }

        .darkMode .trackStep.active {
          color: #fff9f0;
        }

        .darkMode .trackStep.active::before {
          background: #d7b46f;
          border-color: #d7b46f;
        }

        .accountFullActions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 24px;
        }

        .accountFullActions button,
        .accountFullActions a {
          flex: 1;
          min-width: 170px;
        }

        @media (max-width: 980px) {
          .accountPageMain {
            padding: 28px 16px 105px;
          }

          .accountFullShell {
            grid-template-columns: 1fr;
            gap: 18px;
          }

          .accountFullHero {
            position: relative;
            top: auto;
            padding: 26px;
          }

          .accountFullHero h2 {
            font-size: 40px;
          }

          .accountFullContent {
            padding: 18px;
            border-radius: 28px;
          }

          .accountProfileGrid {
            grid-template-columns: 1fr;
            gap: 10px;
          }

          .accountProfileCard {
            min-height: auto;
            padding: 18px;
          }

          .accountPageTitleRow {
            align-items: start;
            flex-direction: column;
          }

          .accountOrdersCarousel {
            gap: 12px;
            padding-bottom: 16px;
          }

          .accountOrderSlide {
            flex-basis: 88%;
          }

          .trackSteps {
            grid-template-columns: repeat(5, minmax(54px, 1fr));
            overflow-x: auto;
            padding-bottom: 6px;
          }
        }

        @media (max-width: 640px) {
          .accountPageMain {
            padding: 18px 12px 112px;
          }

          .accountFullHero,
          .accountFullContent {
            border-radius: 24px;
          }

          .accountFullHero {
            padding: 22px;
          }

          .accountFullAvatar {
            width: 58px;
            height: 58px;
            font-size: 18px;
            margin-bottom: 14px;
          }

          .accountFullHero h2 {
            font-size: 34px;
          }

          .accountFullHero p {
            font-size: 14px;
            line-height: 1.6;
          }

          .accountFullTabs {
            margin-bottom: 18px;
          }

          .accountFullTab {
            padding: 12px 8px;
            font-size: 10px;
          }

          .accountPageTitleRow h3 {
            font-size: 30px;
          }

          .accountOrderSlide {
            flex-basis: 92%;
          }

          .accountFullActions {
            display: grid;
            grid-template-columns: 1fr 1fr;
          }

          .accountFullActions button,
          .accountFullActions a {
            min-width: 0;
            width: 100%;
          }
        }



        @media (max-width: 700px) {
          .menuOverlay {
            background: rgba(36, 26, 20, 0.68) !important;
          }

          .menuPanel {
            width: 100vw !important;
            height: 100dvh !important;
            padding: 20px 22px 118px !important;
            background:
              radial-gradient(circle at top left, rgba(215, 180, 111, 0.14), transparent 34%),
              linear-gradient(180deg, #2b1d17 0%, #21130f 100%) !important;
            box-shadow: none !important;
          }

          .menuClose {
            width: 48px !important;
            height: 48px !important;
            margin: 0 auto 22px !important;
            display: grid !important;
            place-items: center !important;
            font-size: 28px !important;
            background: rgba(255, 249, 240, 0.04) !important;
            border-color: rgba(215, 180, 111, 0.55) !important;
            box-shadow: 0 12px 28px rgba(0, 0, 0, 0.18) !important;
          }

          .menuSearch {
            min-height: 58px !important;
            padding: 12px 18px !important;
            margin-bottom: 28px !important;
            gap: 12px !important;
            border-color: rgba(215, 180, 111, 0.56) !important;
            background: rgba(255, 249, 240, 0.035) !important;
          }

          .menuSearch input {
            font-size: 14px !important;
            letter-spacing: 0.02em !important;
          }

          .menuLinks {
            gap: 15px !important;
          }

          .menuLinks a,
          .menuLinks button {
            font-size: 21px !important;
            line-height: 1.15 !important;
            letter-spacing: 0.045em !important;
          }

          .menuCollectionBlock {
            padding: 16px 0 15px !important;
            border-top-color: rgba(215, 180, 111, 0.22) !important;
            border-bottom-color: rgba(215, 180, 111, 0.22) !important;
          }

          .menuCollectionMain {
            justify-content: flex-start !important;
            gap: 12px !important;
            font-size: 23px !important;
          }

          .menuArrow {
            width: 30px !important;
            height: 30px !important;
            font-size: 0 !important;
            background: rgba(215, 180, 111, 0.12) !important;
            border: 1px solid rgba(215, 180, 111, 0.58) !important;
            box-shadow: inset 0 0 0 1px rgba(255, 249, 240, 0.04), 0 8px 18px rgba(0, 0, 0, 0.13) !important;
          }

          .menuArrow::before {
            content: "";
            width: 8px;
            height: 8px;
            border-right: 1.8px solid currentColor;
            border-bottom: 1.8px solid currentColor;
            transform: rotate(45deg) translate(-1px, -1px);
            transition: transform 0.28s ease;
          }

          .menuArrow.open {
            transform: none !important;
            background: linear-gradient(135deg, #d7b46f, #b08a45) !important;
            color: #211713 !important;
            border-color: rgba(255, 249, 240, 0.24) !important;
          }

          .menuArrow.open::before {
            transform: rotate(225deg) translate(-1px, -1px);
          }

          .menuCollectionDropdown.open {
            margin-top: 13px !important;
          }

          .menuCollectionDropdownInner {
            gap: 9px !important;
          }

          .menuCollectionAll {
            padding: 12px 14px !important;
            font-size: 10px !important;
            letter-spacing: 0.18em !important;
            border-radius: 18px !important;
            background: rgba(215, 180, 111, 0.19) !important;
          }

          .menuCollectionGrid {
            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
            gap: 8px !important;
          }

          .menuCollectionGrid button {
            padding: 11px 7px !important;
            font-size: 12px !important;
            letter-spacing: 0.18em !important;
            border-radius: 18px !important;
            min-width: 0 !important;
          }

          .menuWishlist {
            margin-top: 24px !important;
            padding-top: 18px !important;
          }
        }

        @media (max-width: 390px) {
          .menuPanel {
            padding-left: 18px !important;
            padding-right: 18px !important;
          }

          .menuLinks a,
          .menuLinks button {
            font-size: 20px !important;
          }

          .menuCollectionMain {
            font-size: 22px !important;
          }

          .menuCollectionGrid button {
            font-size: 11px !important;
            letter-spacing: 0.15em !important;
            padding: 10px 6px !important;
          }
        }



        @media (min-width: 701px) {
          .menuOverlay {
            background: rgba(36, 26, 20, 0.46) !important;
          }

          .menuPanel {
            width: min(420px, 32vw) !important;
            min-width: 360px !important;
            height: 100vh !important;
            padding: 26px 28px 34px !important;
            background:
              radial-gradient(circle at top left, rgba(215, 180, 111, 0.12), transparent 34%),
              linear-gradient(180deg, #2b1d17 0%, #21130f 100%) !important;
            box-shadow: 22px 0 70px rgba(0, 0, 0, 0.25) !important;
          }

          .menuClose {
            width: 42px !important;
            height: 42px !important;
            margin: 0 auto 26px !important;
            display: grid !important;
            place-items: center !important;
            font-size: 27px !important;
            background: rgba(255, 249, 240, 0.035) !important;
            border-color: rgba(215, 180, 111, 0.55) !important;
            box-shadow: 0 10px 24px rgba(0, 0, 0, 0.14) !important;
          }

          .menuSearch {
            min-height: 54px !important;
            padding: 12px 17px !important;
            margin-bottom: 28px !important;
            gap: 12px !important;
            border-color: rgba(215, 180, 111, 0.52) !important;
            background: rgba(255, 249, 240, 0.035) !important;
          }

          .menuSearch input {
            font-size: 14px !important;
            letter-spacing: 0.02em !important;
          }

          .menuLinks {
            gap: 16px !important;
          }

          .menuLinks a,
          .menuLinks button {
            font-size: 21px !important;
            line-height: 1.16 !important;
            letter-spacing: 0.045em !important;
          }

          .menuCollectionBlock {
            padding: 15px 0 14px !important;
            border-top-color: rgba(215, 180, 111, 0.22) !important;
            border-bottom-color: rgba(215, 180, 111, 0.22) !important;
          }

          .menuCollectionMain {
            justify-content: flex-start !important;
            gap: 12px !important;
            font-size: 22px !important;
          }

          .menuArrow {
            width: 28px !important;
            height: 28px !important;
            font-size: 0 !important;
            background: rgba(215, 180, 111, 0.12) !important;
            border: 1px solid rgba(215, 180, 111, 0.58) !important;
            color: #d7b46f !important;
            box-shadow: inset 0 0 0 1px rgba(255, 249, 240, 0.04), 0 8px 18px rgba(0, 0, 0, 0.13) !important;
          }

          .menuArrow::before {
            content: "";
            width: 8px;
            height: 8px;
            border-right: 1.8px solid currentColor;
            border-bottom: 1.8px solid currentColor;
            transform: rotate(45deg) translate(-1px, -1px);
            transition: transform 0.28s ease;
          }

          .menuArrow.open {
            transform: none !important;
            background: linear-gradient(135deg, #d7b46f, #b08a45) !important;
            color: #211713 !important;
            border-color: rgba(255, 249, 240, 0.24) !important;
          }

          .menuArrow.open::before {
            transform: rotate(225deg) translate(-1px, -1px);
          }

          .menuCollectionDropdown.open {
            margin-top: 13px !important;
          }

          .menuCollectionDropdownInner {
            gap: 9px !important;
          }

          .menuCollectionAll {
            padding: 12px 14px !important;
            font-size: 10px !important;
            letter-spacing: 0.18em !important;
            border-radius: 18px !important;
            background: rgba(215, 180, 111, 0.19) !important;
          }

          .menuCollectionGrid {
            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
            gap: 8px !important;
          }

          .menuCollectionGrid button {
            padding: 11px 7px !important;
            font-size: 12px !important;
            letter-spacing: 0.18em !important;
            border-radius: 18px !important;
            min-width: 0 !important;
          }

          .menuWishlist {
            margin-top: 24px !important;
            padding-top: 18px !important;
            border-top-color: rgba(215, 180, 111, 0.24) !important;
            text-align: center !important;
          }

          .menuWishlist h3 {
            font-size: 18px !important;
            margin-bottom: 12px !important;
          }

          .menuWishlist p {
            font-size: 13px !important;
            line-height: 1.65 !important;
          }
        }



        /* Final menu refinement: compact text + forward/down chevron */
        .menuPanel {
          max-width: 430px !important;
        }

        .menuLinks {
          gap: 14px !important;
        }

        .menuLinks a,
        .menuLinks button {
          font-size: 20px !important;
          line-height: 1.12 !important;
          letter-spacing: 0.035em !important;
        }

        .menuCollectionMain {
          justify-content: space-between !important;
          gap: 12px !important;
          font-size: 20px !important;
          width: 100% !important;
        }

        .menuArrow {
          width: 30px !important;
          height: 30px !important;
          min-width: 30px !important;
          border-radius: 999px !important;
          display: inline-grid !important;
          place-items: center !important;
          font-size: 0 !important;
          color: #d7b46f !important;
          background: rgba(215, 180, 111, 0.08) !important;
          border: 1px solid rgba(215, 180, 111, 0.48) !important;
          box-shadow: inset 0 0 0 1px rgba(255, 249, 240, 0.035), 0 8px 18px rgba(0, 0, 0, 0.12) !important;
          transform: none !important;
          transition: background 0.25s ease, color 0.25s ease, transform 0.25s ease, border-color 0.25s ease !important;
        }

        .menuArrow::before {
          content: "" !important;
          width: 8px !important;
          height: 8px !important;
          border-right: 1.8px solid currentColor !important;
          border-bottom: 1.8px solid currentColor !important;
          transform: rotate(-45deg) !important;
          transition: transform 0.25s ease !important;
          margin-left: -2px !important;
        }

        .menuArrow.open {
          background: linear-gradient(135deg, #d7b46f, #b08a45) !important;
          color: #211713 !important;
          border-color: rgba(255, 249, 240, 0.22) !important;
          transform: none !important;
        }

        .menuArrow.open::before {
          transform: rotate(45deg) !important;
          margin-left: 0 !important;
          margin-top: -3px !important;
        }

        .menuCollectionAll {
          padding: 11px 14px !important;
          font-size: 10px !important;
          letter-spacing: 0.18em !important;
        }

        .menuCollectionGrid button {
          padding: 10px 7px !important;
          font-size: 11px !important;
          letter-spacing: 0.15em !important;
        }

        @media (max-width: 700px) {
          .menuPanel {
            padding: 18px 22px 125px !important;
          }

          .menuClose {
            width: 42px !important;
            height: 42px !important;
            font-size: 25px !important;
            margin-bottom: 20px !important;
          }

          .menuSearch {
            min-height: 52px !important;
            padding: 10px 16px !important;
            margin-bottom: 24px !important;
          }

          .menuSearch input {
            font-size: 13px !important;
          }

          .menuLinks {
            gap: 12px !important;
          }

          .menuLinks a,
          .menuLinks button {
            font-size: 18px !important;
            line-height: 1.08 !important;
            letter-spacing: 0.03em !important;
          }

          .menuCollectionBlock {
            padding: 13px 0 !important;
          }

          .menuCollectionMain {
            font-size: 18px !important;
          }

          .menuArrow {
            width: 28px !important;
            height: 28px !important;
            min-width: 28px !important;
          }

          .menuArrow::before {
            width: 7px !important;
            height: 7px !important;
          }

          .menuCollectionDropdown.open {
            margin-top: 11px !important;
          }

          .menuCollectionAll {
            padding: 10px 12px !important;
            font-size: 9px !important;
            letter-spacing: 0.17em !important;
          }

          .menuCollectionGrid {
            gap: 7px !important;
          }

          .menuCollectionGrid button {
            padding: 9px 6px !important;
            font-size: 10px !important;
            letter-spacing: 0.13em !important;
          }

          .menuWishlist h3 {
            font-size: 18px !important;
          }

          .menuWishlist p,
          .menuWishlist .emptyState {
            font-size: 13px !important;
          }
        }

        @media (max-width: 390px) {
          .menuLinks a,
          .menuLinks button,
          .menuCollectionMain {
            font-size: 17px !important;
          }

          .menuCollectionGrid button {
            font-size: 9px !important;
            letter-spacing: 0.12em !important;
          }
        }


        /* Final footer + item size chart luxury refinement */
        .footerLinks .footerTextBtn {
          white-space: nowrap;
        }

        .modalSizeHeader {
          gap: 10px !important;
          margin-top: 14px !important;
          padding: 10px 12px !important;
          border: 1px solid rgba(176, 138, 69, 0.22) !important;
          border-radius: 22px !important;
          background: rgba(255, 249, 240, 0.48) !important;
        }

        .modalSizeHeader p {
          flex: 1 1 auto !important;
          text-align: left !important;
          letter-spacing: 0.06em !important;
          text-transform: uppercase !important;
          font-size: 11px !important;
          color: #6a5545 !important;
        }

        .page.arabic .modalSizeHeader p {
          text-align: right !important;
        }

        .inlineSizeToggle {
          min-height: 42px !important;
          padding: 0 14px 0 18px !important;
          border-radius: 999px !important;
          border: 1px solid rgba(176, 138, 69, 0.50) !important;
          background: linear-gradient(135deg, #2c1f18, #4b3328) !important;
          color: #fff9f0 !important;
          box-shadow: 0 12px 26px rgba(44, 31, 24, 0.13), inset 0 0 0 1px rgba(255, 249, 240, 0.08) !important;
          letter-spacing: 0.16em !important;
          gap: 11px !important;
          white-space: nowrap !important;
        }

        .inlineSizeToggle:hover {
          background: linear-gradient(135deg, #3b291f, #6a4b36) !important;
          transform: translateY(-2px) !important;
        }

        .inlineSizeArrow {
          width: 24px !important;
          height: 24px !important;
          min-width: 24px !important;
          border-radius: 999px !important;
          border: 1px solid rgba(215, 180, 111, 0.65) !important;
          display: inline-grid !important;
          place-items: center !important;
          background: rgba(215, 180, 111, 0.14) !important;
          position: relative !important;
          transform: none !important;
        }

        .inlineSizeArrow::before {
          content: "" !important;
          width: 7px !important;
          height: 7px !important;
          border-right: 1.7px solid currentColor !important;
          border-bottom: 1.7px solid currentColor !important;
          transform: rotate(-45deg) !important;
          margin-left: -2px !important;
          transition: transform 0.25s ease, margin 0.25s ease !important;
        }

        .inlineSizeToggle.open .inlineSizeArrow {
          transform: none !important;
          background: linear-gradient(135deg, #d7b46f, #b08a45) !important;
          color: #211713 !important;
          border-color: rgba(255, 249, 240, 0.22) !important;
        }

        .inlineSizeToggle.open .inlineSizeArrow::before {
          transform: rotate(45deg) !important;
          margin-left: 0 !important;
          margin-top: -3px !important;
        }

        .modalSizeChart {
          border-radius: 24px !important;
          border-color: rgba(176, 138, 69, 0.34) !important;
          background: linear-gradient(180deg, rgba(255,249,240,0.94), rgba(239,227,210,0.78)) !important;
        }

        .modalSizeHelp {
          background: linear-gradient(135deg, rgba(44,31,24,0.96), rgba(75,51,40,0.94)) !important;
          color: #fff9f0 !important;
          border-color: rgba(176, 138, 69, 0.54) !important;
          box-shadow: 0 12px 26px rgba(44, 31, 24, 0.13) !important;
        }

        .modalSizeHelp:hover {
          background: linear-gradient(135deg, #3b291f, #6a4b36) !important;
        }

        .darkMode .modalSizeHeader {
          background: rgba(255, 249, 240, 0.05) !important;
          border-color: rgba(215, 180, 111, 0.34) !important;
        }

        .darkMode .modalSizeHeader p {
          color: #eadcc8 !important;
        }

        .darkMode .inlineSizeToggle,
        .darkMode .modalSizeHelp {
          background: linear-gradient(135deg, #d7b46f, #b08a45) !important;
          color: #211713 !important;
          border-color: rgba(255, 249, 240, 0.22) !important;
        }

        @media (max-width: 700px) {
          .footerLinks {
            gap: 14px !important;
          }

          .modalSizeHeader {
            padding: 9px 10px !important;
            border-radius: 20px !important;
            align-items: center !important;
          }

          .modalSizeHeader p {
            font-size: 9px !important;
            letter-spacing: 0.08em !important;
          }

          .inlineSizeToggle {
            min-height: 38px !important;
            padding: 0 10px 0 13px !important;
            font-size: 8px !important;
            letter-spacing: 0.12em !important;
            gap: 8px !important;
          }

          .inlineSizeArrow {
            width: 21px !important;
            height: 21px !important;
            min-width: 21px !important;
          }
        }


        @media (max-width: 760px) {
          .miniSectionHead {
            align-items: flex-start;
            flex-direction: column;
          }

          .miniSectionHead strong {
            font-size: 22px;
          }

          .profileEditPanel,
          .addressBookPanel,
          .addressFormPanel {
            padding: 16px;
            border-radius: 22px;
          }

          .profileFormGrid,
          .addressCardsGrid {
            grid-template-columns: 1fr;
          }

          .addressFormActions .primaryBtn,
          .addressFormActions .secondaryBtn,
          .luxurySmallBtn {
            width: 100%;
          }
        }

.supportPanel,
.supportFormPanel,
.supportMessagesList,
.supportAdminPanel {
  margin-top: 24px;
}

.supportFormPanel,
.supportMessageCard,
.supportAdminCard {
  border: 1px solid rgba(176, 138, 69, 0.24);
  background: linear-gradient(135deg, rgba(255, 249, 240, 0.96), rgba(247, 241, 232, 0.88));
  border-radius: 24px;
  padding: 20px;
  box-shadow: 0 18px 40px rgba(44, 31, 24, 0.06);
}

.supportMessagesList {
  display: grid;
  gap: 14px;
}

.supportMessageCard p,
.supportAdminCard p {
  color: var(--muted);
  line-height: 1.7;
  margin: 12px 0 0;
}

.supportAdminNote {
  border-top: 1px solid rgba(176, 138, 69, 0.2);
  padding-top: 12px;
}

.adminNoteField {
  display: grid;
  gap: 8px;
  margin-top: 14px;
}

.adminNoteField span {
  color: var(--gold);
  font-size: 0.72rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.adminNoteField textarea,
.supportFormPanel textarea,
.supportFormPanel select {
  border: 1px solid rgba(176, 138, 69, 0.3);
  background: rgba(255, 249, 240, 0.85);
  border-radius: 18px;
  color: var(--ink);
  font: inherit;
  min-height: 46px;
  outline: none;
  padding: 13px 14px;
  resize: vertical;
}

.supportFormPanel textarea,
.adminNoteField textarea {
  min-height: 110px;
}

.statusUpdateBtn.danger {
  border-color: rgba(125, 45, 35, 0.38);
  color: #7d2d23;
}

@media (max-width: 720px) {
  .supportFormPanel,
  .supportMessageCard,
  .supportAdminCard {
    border-radius: 20px;
    padding: 16px;
  }
}

`}</style>

      <style>{`
        /* =========================================================
           FINAL OVERRIDE — LA GRAZIA CONTRAST + PERFORMANCE FIX
           Put this AFTER the original App.tsx style block
           ========================================================= */

        *,
        *::before,
        *::after {
          scroll-behavior: auto !important;
        }

        .heroVisual img,
        .productImage img,
        .reveal,
        .heroCard,
        .productCard,
        .luxuryCard,
        .accountCard,
        .trustItem,
        .section,
        .modal,
        .drawer,
        .cartDrawer,
        .searchOverlay,
        .menuPanel {
          animation: none !important;
          transition: none !important;
          will-change: auto !important;
        }

        .heroVisual img {
          transform: none !important;
        }

        .primaryBtn:hover,
        .secondaryBtn:hover,
        .productCard:hover,
        .heroCard:hover,
        .luxuryCard:hover,
        .trustItem:hover {
          transform: none !important;
        }

        .heroCard,
        .menuPanel,
        .modal,
        .drawer,
        .cartDrawer,
        .searchOverlay,
        .bottomNav,
        .mobileBottomNav {
          backdrop-filter: none !important;
          -webkit-backdrop-filter: none !important;
        }

        @media (max-width: 768px) {
          .page:not(.darkMode) {
            background: #f7f1e8 !important;
            color: #1f1712 !important;
          }

          .page:not(.darkMode) .heroCopy,
          .page:not(.darkMode) .heroCard,
          .page:not(.darkMode) .productCard,
          .page:not(.darkMode) .trustItem,
          .page:not(.darkMode) .luxuryCard,
          .page:not(.darkMode) .accountCard,
          .page:not(.darkMode) .signatureCard,
          .page:not(.darkMode) .signaturePanel,
          .page:not(.darkMode) .editorialCard {
            color: #1f1712 !important;
          }

          .page:not(.darkMode) .heroCopy h2,
          .page:not(.darkMode) .heroCard strong,
          .page:not(.darkMode) .sectionTitle,
          .page:not(.darkMode) .productInfo h4,
          .page:not(.darkMode) h1,
          .page:not(.darkMode) h2,
          .page:not(.darkMode) h3,
          .page:not(.darkMode) h4 {
            color: #1f1712 !important;
            opacity: 1 !important;
            text-shadow: none !important;
          }

          .page:not(.darkMode) .heroCopy .description,
          .page:not(.darkMode) .sectionIntro,
          .page:not(.darkMode) .heroCard,
          .page:not(.darkMode) .heroCard strong,
          .page:not(.darkMode) .trustItem p,
          .page:not(.darkMode) p {
            color: #5f4c3f !important;
            opacity: 1 !important;
            text-shadow: none !important;
          }

          .page:not(.darkMode) .eyebrow,
          .page:not(.darkMode) .heroCard small,
          .page:not(.darkMode) .category,
          .page:not(.darkMode) .brandMark p {
            color: #b08a45 !important;
            opacity: 1 !important;
          }

          .page:not(.darkMode) .heroCard,
          .page:not(.darkMode) .signatureCard,
          .page:not(.darkMode) .signaturePanel,
          .page:not(.darkMode) .editorialCard {
            background: rgba(248, 239, 225, 0.96) !important;
            border: 1px solid rgba(176, 138, 69, 0.32) !important;
            box-shadow: 0 14px 36px rgba(44, 31, 24, 0.10) !important;
          }

          .page:not(.darkMode) .brandMark h1 {
            color: #1f1712 !important;
            opacity: 1 !important;
          }
        }

        .page.darkMode {
          background: #160f0b !important;
          color: #fffaf2 !important;
        }

        .page.darkMode main,
        .page.darkMode section {
          background-color: transparent !important;
        }

        .page.darkMode .nav,
        .page.darkMode .topBar {
          background: #130c08 !important;
          color: #fffaf2 !important;
          border-color: rgba(224, 189, 105, 0.18) !important;
        }

        .page.darkMode .brandMark h1 {
          color: #fffaf2 !important;
          opacity: 1 !important;
        }

        .page.darkMode .brandMark p {
          color: #e0bd69 !important;
          opacity: 1 !important;
        }

        .page.darkMode .heroCopy,
        .page.darkMode .heroCard,
        .page.darkMode .productCard,
        .page.darkMode .trustItem,
        .page.darkMode .luxuryCard,
        .page.darkMode .accountCard,
        .page.darkMode .modal,
        .page.darkMode .drawer,
        .page.darkMode .cartDrawer,
        .page.darkMode .searchOverlay,
        .page.darkMode .menuPanel,
        .page.darkMode .signatureCard,
        .page.darkMode .signaturePanel,
        .page.darkMode .signatureEdit,
        .page.darkMode .editorialCard,
        .page.darkMode .supportCard,
        .page.darkMode .reviewCard {
          background: linear-gradient(145deg, #2b1d17 0%, #1f1510 100%) !important;
          color: #fffaf2 !important;
          border-color: rgba(224, 189, 105, 0.42) !important;
          box-shadow: 0 14px 38px rgba(0, 0, 0, 0.22) !important;
        }

        .page.darkMode h1,
        .page.darkMode h2,
        .page.darkMode h3,
        .page.darkMode h4,
        .page.darkMode h5,
        .page.darkMode h6,
        .page.darkMode .heroCopy h2,
        .page.darkMode .sectionTitle,
        .page.darkMode .heroCard strong,
        .page.darkMode .productInfo h4,
        .page.darkMode .signatureCard h2,
        .page.darkMode .signatureCard h3,
        .page.darkMode .signaturePanel h2,
        .page.darkMode .signaturePanel h3,
        .page.darkMode .editorialCard h2,
        .page.darkMode .editorialCard h3 {
          color: #fffaf2 !important;
          opacity: 1 !important;
          text-shadow: none !important;
        }

        .page.darkMode p,
        .page.darkMode span,
        .page.darkMode li,
        .page.darkMode label,
        .page.darkMode .description,
        .page.darkMode .sectionIntro,
        .page.darkMode .heroCard strong,
        .page.darkMode .trustItem p,
        .page.darkMode .productDescription,
        .page.darkMode .signatureText,
        .page.darkMode .signatureCard p,
        .page.darkMode .signaturePanel p,
        .page.darkMode .editorialCard p {
          color: #e8d9c4 !important;
          opacity: 1 !important;
          text-shadow: none !important;
        }

        .page.darkMode .eyebrow,
        .page.darkMode .heroCard small,
        .page.darkMode .category,
        .page.darkMode .price,
        .page.darkMode .signatureEyebrow,
        .page.darkMode .signatureCard .eyebrow,
        .page.darkMode .signaturePanel .eyebrow {
          color: #e0bd69 !important;
          opacity: 1 !important;
        }

        .page.darkMode .trustIcon,
        .page.darkMode .trustNumber,
        .page.darkMode .featureNumber,
        .page.darkMode .benefitNumber,
        .page.darkMode .numberBadge {
          background: #e0bd69 !important;
          color: #2c1f18 !important;
        }

        .page.darkMode .primaryBtn,
        .page.darkMode .addBtn,
        .page.darkMode .checkoutBtn,
        .page.darkMode .payBtn,
        .page.darkMode .saveBtn {
          background: #e0bd69 !important;
          color: #2c1f18 !important;
          border-color: #e0bd69 !important;
        }

        .page.darkMode .secondaryBtn,
        .page.darkMode .viewBtn,
        .page.darkMode .outlineBtn,
        .page.darkMode .findBtn {
          background: transparent !important;
          color: #fffaf2 !important;
          border-color: #e0bd69 !important;
        }

        .page.darkMode input,
        .page.darkMode textarea,
        .page.darkMode select {
          background: #211711 !important;
          color: #fffaf2 !important;
          border-color: rgba(224, 189, 105, 0.42) !important;
        }

        .page.darkMode input::placeholder,
        .page.darkMode textarea::placeholder {
          color: rgba(232, 217, 196, 0.7) !important;
        }

        @media (max-width: 768px) {
          .page.darkMode .heroCard,
          .page.darkMode .signatureCard,
          .page.darkMode .signaturePanel,
          .page.darkMode .editorialCard {
            background: rgba(43, 29, 23, 0.98) !important;
            border: 1px solid rgba(224, 189, 105, 0.45) !important;
          }

          .page.darkMode .heroCard small {
            color: #e0bd69 !important;
            opacity: 1 !important;
          }

          .page.darkMode .heroCard strong {
            color: #fffaf2 !important;
            opacity: 1 !important;
            line-height: 1.12 !important;
          }

          .page.darkMode .trustBar {
            background: transparent !important;
          }

          .page.darkMode .trustItem {
            background: #2b1d17 !important;
            border: 1px solid rgba(224, 189, 105, 0.42) !important;
          }

          .page.darkMode .trustItem p {
            color: #fffaf2 !important;
            opacity: 1 !important;
          }

          .page.darkMode .sectionIntro {
            color: #e8d9c4 !important;
            opacity: 1 !important;
          }

          .page.darkMode .bottomNav,
          .page.darkMode .mobileBottomNav {
            background: rgba(31, 21, 16, 0.98) !important;
            border: 1px solid rgba(224, 189, 105, 0.35) !important;
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
          }

          .page.darkMode .bottomNav a,
          .page.darkMode .bottomNav button,
          .page.darkMode .mobileBottomNav a,
          .page.darkMode .mobileBottomNav button {
            color: #fffaf2 !important;
            opacity: 1 !important;
          }

          .page.darkMode .heroVisual img,
          .page.darkMode .productImage img {
            animation: none !important;
            transform: none !important;
          }
        }

        @media (min-width: 769px) {
          .heroVisual img {
            animation: none !important;
          }

          .reveal {
            opacity: 1 !important;
            transform: none !important;
          }

          .productCard:hover,
          .heroCard:hover,
          .trustItem:hover,
          .primaryBtn:hover,
          .secondaryBtn:hover {
            transform: none !important;
          }
        }


        /* =========================================================
           RESTORED SCROLL-UP / SCROLL-DOWN ANIMATIONS
           This lives inside App.tsx so it overrides old CSS correctly.
           ========================================================= */

        .reveal {
          opacity: 0 !important;
          transform: translateY(38px) scale(0.992) !important;
          transition:
            opacity 0.85s cubic-bezier(.16, 1, .3, 1),
            transform 0.85s cubic-bezier(.16, 1, .3, 1),
            box-shadow 0.35s ease,
            border-color 0.35s ease,
            background 0.35s ease !important;
          will-change: opacity, transform;
        }

        .reveal.visible {
          opacity: 1 !important;
          transform: translateY(0) scale(1) !important;
        }

        .productCard.reveal {
          transform: translateY(42px) scale(0.982) !important;
        }

        .productCard.reveal.visible {
          transform: translateY(0) scale(1) !important;
        }

        .heroCard,
        .productCard,
        .trustItem,
        .styleCard,
        .giftCard,
        .storyCard,
        .clubCard,
        .accountCard,
        .policyCard,
        .supportCard,
        .reviewCard {
          transition:
            transform 0.42s ease,
            box-shadow 0.42s ease,
            border-color 0.42s ease,
            background 0.42s ease !important;
        }

        .productCard:hover,
        .trustItem:hover,
        .styleCard:hover,
        .giftCard:hover,
        .storyCard:hover,
        .clubCard:hover {
          transform: translateY(-7px) !important;
        }

        .productImage img,
        .heroVisual img {
          transition:
            transform 0.75s cubic-bezier(.16, 1, .3, 1),
            filter 0.45s ease !important;
        }

        .productCard:hover .productImage img {
          transform: scale(1.045) !important;
        }

        .heroVisual img {
          animation: laGraziaHeroFloat 7s ease-in-out infinite !important;
        }

        @keyframes laGraziaHeroFloat {
          0%, 100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-10px) scale(1.012);
          }
        }

        .primaryBtn,
        .secondaryBtn,
        .addBtn,
        .viewBtn,
        .iconBtn,
        .roundBtn,
        .heartBtn {
          transition:
            transform 0.24s ease,
            box-shadow 0.24s ease,
            background 0.24s ease,
            color 0.24s ease,
            border-color 0.24s ease !important;
        }

        .primaryBtn:hover,
        .secondaryBtn:hover,
        .addBtn:hover,
        .viewBtn:hover,
        .iconBtn:hover,
        .roundBtn:hover {
          transform: translateY(-2px) !important;
        }

        .primaryBtn:active,
        .secondaryBtn:active,
        .addBtn:active,
        .viewBtn:active,
        .iconBtn:active,
        .roundBtn:active {
          transform: scale(0.97) !important;
        }

        .cartDrawer,
        .searchOverlay,
        .menuPanel,
        .productModal,
        .authModal,
        .signInModal,
        .modal {
          animation: laGraziaPanelIn 0.42s cubic-bezier(.16, 1, .3, 1) both !important;
        }

        @keyframes laGraziaPanelIn {
          from {
            opacity: 0;
            transform: translateY(18px) scale(0.985);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .toast {
          animation: laGraziaToastIn 0.42s ease both !important;
        }

        @keyframes laGraziaToastIn {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 768px) {
          .reveal {
            transform: translateY(26px) scale(0.995) !important;
            transition:
              opacity 0.58s ease,
              transform 0.58s cubic-bezier(.16, 1, .3, 1) !important;
          }

          .productCard:hover,
          .trustItem:hover,
          .styleCard:hover,
          .giftCard:hover,
          .storyCard:hover,
          .clubCard:hover {
            transform: none !important;
          }

          .productCard:hover .productImage img {
            transform: none !important;
          }

          .heroVisual img {
            animation: laGraziaHeroFloatMobile 6s ease-in-out infinite !important;
          }

          @keyframes laGraziaHeroFloatMobile {
            0%, 100% {
              transform: translateY(0) scale(1);
            }
            50% {
              transform: translateY(-6px) scale(1.006);
            }
          }
        }


        /* =========================================================
           PRIVATE LIST FINAL FIX
           Makes the La Grazia Club section actually usable and responsive
           ========================================================= */

        .newsletterBox {
          overflow: hidden;
        }

        .privateListForm {
          width: min(520px, 100%);
          max-width: 100%;
          min-width: 0 !important;
          justify-self: end;
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          align-items: center;
          gap: 12px;
        }

        .privateListForm input {
          width: 100%;
          min-width: 0;
          height: 58px;
          padding: 0 22px;
          border-radius: 999px;
          font-size: 15px;
        }

        .privateListForm button {
          height: 58px;
          min-width: 128px;
          white-space: nowrap;
          box-shadow: 0 16px 34px rgba(44, 31, 24, 0.12);
        }

        .privateListForm button:disabled {
          cursor: wait;
          opacity: 0.72;
        }

        .newsletterStatus {
          display: inline-block;
          max-width: 100%;
          margin-top: 18px;
          padding: 10px 14px;
          border-radius: 999px;
          background: rgba(176, 138, 69, 0.10);
          border: 1px solid rgba(176, 138, 69, 0.22);
          line-height: 1.55;
        }

        .darkMode .newsletterStatus {
          background: rgba(215, 180, 111, 0.12);
          border-color: rgba(215, 180, 111, 0.26);
        }

        @media (max-width: 1100px) {
          .privateListForm {
            justify-self: stretch;
            width: 100%;
          }
        }

        @media (max-width: 680px) {
          .newsletterBox {
            padding: 34px 22px !important;
            text-align: center;
          }

          .privateListForm {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .privateListForm input,
          .privateListForm button {
            width: 100%;
          }

          .privateListForm button {
            min-width: 0;
          }

          .newsletterStatus {
            border-radius: 18px;
            font-size: 13px;
          }
        }


        /* =========================================================
           FINAL MODAL PHOTO FIT + IPAD CONTRAST FIX
           1) Product popup images now fit inside the luxury template.
           2) Tablet/iPad text contrast is strengthened so nothing disappears.
           ========================================================= */

        .modal {
          width: min(92vw, 980px) !important;
          max-height: min(86vh, 860px) !important;
          grid-template-columns: minmax(300px, 0.95fr) minmax(330px, 1.05fr) !important;
          background: #fff9f0 !important;
        }

        .modalImage {
          min-height: 0 !important;
          height: min(86vh, 860px) !important;
          max-height: min(86vh, 860px) !important;
          background: linear-gradient(135deg, #f6ecdd 0%, #ead7bb 100%) !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          overflow: hidden !important;
        }

        .modalImage img {
          width: 100% !important;
          height: 100% !important;
          max-width: 100% !important;
          max-height: 100% !important;
          object-fit: contain !important;
          object-position: center center !important;
          display: block !important;
        }

        .modalInfo {
          max-height: min(86vh, 860px) !important;
          background: #fff9f0 !important;
          color: #2f2119 !important;
        }

        .modalInfo h3,
        .modalInfo p,
        .modalInfo strong,
        .modalInfo label,
        .modalInfo .eyebrow,
        .modalInfo .modalSizeHeader,
        .modalInfo .modalSizeHeader p,
        .modalInfo .modalFitNotes p {
          color: #2f2119 !important;
        }

        .modalInfo p,
        .modalInfo .modalSizeHeader p,
        .modalInfo .modalFitNotes p {
          color: #6f5a4a !important;
        }

        .modalImageSwitcher {
          background: rgba(255, 255, 255, 0.94) !important;
          border: 1px solid rgba(176, 138, 69, 0.22) !important;
        }

        .imageSwitchBtn {
          color: #5f4736 !important;
          background: rgba(255, 255, 255, 0.92) !important;
        }

        .imageSwitchBtn.active {
          color: #ffffff !important;
          background: #b88a3b !important;
        }

        .darkMode .modal,
        .darkMode .modalInfo {
          background: #201711 !important;
          color: #f8ead6 !important;
        }

        .darkMode .modalImage {
          background: linear-gradient(135deg, #2b2119 0%, #46321e 100%) !important;
        }

        .darkMode .modalInfo h3,
        .darkMode .modalInfo strong,
        .darkMode .modalInfo label,
        .darkMode .modalInfo .eyebrow {
          color: #fff4df !important;
        }

        .darkMode .modalInfo p,
        .darkMode .modalInfo .modalSizeHeader p,
        .darkMode .modalInfo .modalFitNotes p {
          color: #e5d1b8 !important;
        }

        @media (min-width: 768px) and (max-width: 1180px) {
          .page:not(.darkMode),
          .page:not(.darkMode) main,
          .page:not(.darkMode) section {
            color: #2f2119 !important;
          }

          .page:not(.darkMode) .heroCopy,
          .page:not(.darkMode) .heroCopy h1,
          .page:not(.darkMode) .heroCopy h2,
          .page:not(.darkMode) .heroCopy p,
          .page:not(.darkMode) .sectionHeader,
          .page:not(.darkMode) .sectionHeader h2,
          .page:not(.darkMode) .sectionHeader p,
          .page:not(.darkMode) .styleFinder,
          .page:not(.darkMode) .styleFinder h2,
          .page:not(.darkMode) .styleFinder p,
          .page:not(.darkMode) .productInfo,
          .page:not(.darkMode) .productInfo h3,
          .page:not(.darkMode) .productInfo p,
          .page:not(.darkMode) .storyCard,
          .page:not(.darkMode) .storyCard h3,
          .page:not(.darkMode) .storyCard p,
          .page:not(.darkMode) .clubCard,
          .page:not(.darkMode) .clubCard h3,
          .page:not(.darkMode) .clubCard p,
          .page:not(.darkMode) .trustItem,
          .page:not(.darkMode) .trustItem h3,
          .page:not(.darkMode) .trustItem p {
            color: #2f2119 !important;
            text-shadow: none !important;
          }

          .page:not(.darkMode) .eyebrow,
          .page:not(.darkMode) .kicker,
          .page:not(.darkMode) .sectionKicker,
          .page:not(.darkMode) .productCategory,
          .page:not(.darkMode) .productPrice,
          .page:not(.darkMode) .muted,
          .page:not(.darkMode) .smallText,
          .page:not(.darkMode) .styleFinder span,
          .page:not(.darkMode) .productInfo span {
            color: #8a6330 !important;
            opacity: 1 !important;
          }

          .page:not(.darkMode) .heroCard,
          .page:not(.darkMode) .heroPanel,
          .page:not(.darkMode) .productCard,
          .page:not(.darkMode) .styleCard,
          .page:not(.darkMode) .storyCard,
          .page:not(.darkMode) .clubCard,
          .page:not(.darkMode) .trustItem,
          .page:not(.darkMode) .newsletterBox {
            background: rgba(255, 249, 240, 0.97) !important;
            border-color: rgba(176, 138, 69, 0.28) !important;
          }

          .page:not(.darkMode) .primaryBtn,
          .page:not(.darkMode) .secondaryBtn,
          .page:not(.darkMode) .viewBtn,
          .page:not(.darkMode) .addBtn,
          .page:not(.darkMode) .roundBtn,
          .page:not(.darkMode) .iconBtn {
            color: #2f2119 !important;
            border-color: rgba(88, 55, 31, 0.28) !important;
          }

          .page:not(.darkMode) .primaryBtn,
          .page:not(.darkMode) .addBtn,
          .page:not(.darkMode) .active,
          .page:not(.darkMode) .imageSwitchBtn.active {
            color: #ffffff !important;
          }

          .page.darkMode,
          .page.darkMode main,
          .page.darkMode section {
            color: #fff4df !important;
          }

          .page.darkMode .heroCopy,
          .page.darkMode .heroCopy h1,
          .page.darkMode .heroCopy h2,
          .page.darkMode .sectionHeader h2,
          .page.darkMode .productInfo h3,
          .page.darkMode .styleFinder h2,
          .page.darkMode .storyCard h3,
          .page.darkMode .clubCard h3,
          .page.darkMode .trustItem h3 {
            color: #fff4df !important;
          }

          .page.darkMode .heroCopy p,
          .page.darkMode .sectionHeader p,
          .page.darkMode .productInfo p,
          .page.darkMode .styleFinder p,
          .page.darkMode .storyCard p,
          .page.darkMode .clubCard p,
          .page.darkMode .trustItem p {
            color: #e8d6bd !important;
            opacity: 1 !important;
          }

          .page.darkMode .eyebrow,
          .page.darkMode .kicker,
          .page.darkMode .sectionKicker,
          .page.darkMode .productCategory,
          .page.darkMode .productPrice,
          .page.darkMode .muted,
          .page.darkMode .smallText {
            color: #e0b66d !important;
            opacity: 1 !important;
          }

          .page.darkMode .heroCard,
          .page.darkMode .heroPanel,
          .page.darkMode .productCard,
          .page.darkMode .styleCard,
          .page.darkMode .storyCard,
          .page.darkMode .clubCard,
          .page.darkMode .trustItem,
          .page.darkMode .newsletterBox {
            background: rgba(32, 23, 17, 0.96) !important;
            border-color: rgba(224, 182, 109, 0.28) !important;
          }
        }

        @media (min-width: 701px) and (max-width: 1024px) {
          .modalBackdrop {
            padding: 18px !important;
          }

          .modal {
            width: min(94vw, 860px) !important;
            max-height: 88vh !important;
            grid-template-columns: 0.92fr 1.08fr !important;
          }

          .modalImage {
            height: 88vh !important;
            max-height: 88vh !important;
          }

          .modalInfo {
            max-height: 88vh !important;
            padding: 28px 24px !important;
          }
        }

        @media (max-width: 700px) {
          .modal {
            width: min(94vw, 430px) !important;
            max-height: 92vh !important;
            grid-template-columns: 1fr !important;
            overflow-y: auto !important;
            overscroll-behavior: contain !important;
            -webkit-overflow-scrolling: touch !important;
          }

          .modalImage {
            height: min(56vh, 520px) !important;
            max-height: min(56vh, 520px) !important;
            border-radius: 30px 30px 0 0 !important;
          }

          .modalInfo {
            max-height: none !important;
          }
        }

        /* =========================================================
           MOBILE ONLY FIX — PRODUCT CARD FRONT / MODEL / BACK
           This block only changes the mobile product card layout.
           It does not change product data, photo paths, Supabase, or image loading.
           ========================================================= */
        @media (max-width: 640px) {
          .productGrid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 12px !important;
          }

          .productCard {
            min-width: 0 !important;
            border-radius: 22px !important;
            overflow: hidden !important;
          }

          .productImage {
            height: clamp(210px, 48vw, 270px) !important;
            min-height: 0 !important;
            aspect-ratio: 3 / 4 !important;
            border-radius: 20px !important;
            overflow: hidden !important;
          }

          .productImage img {
            width: 100% !important;
            height: 100% !important;
            object-fit: cover !important;
            object-position: center center !important;
          }

          .productImage.linenPantsProductImage {
            height: clamp(280px, 62vw, 360px) !important;
            aspect-ratio: 4 / 5 !important;
            background: #f8f1e8 !important;
          }

          .productImage.linenPantsProductImage img {
            object-fit: contain !important;
            object-position: center center !important;
            padding: 8px !important;
          }

          .productInfo {
            padding: 11px 10px 12px !important;
            gap: 10px !important;
          }

          .productInfo .category,
          .productInfo p.category {
            font-size: 9px !important;
            letter-spacing: 0.12em !important;
            line-height: 1.2 !important;
            margin-bottom: 4px !important;
          }

          .productInfo h4 {
            font-size: 12.5px !important;
            line-height: 1.22 !important;
            min-height: 31px !important;
            margin: 0 0 5px !important;
          }

          .productInfo .price,
          .productInfo p.price {
            font-size: 11px !important;
            line-height: 1.2 !important;
          }

          .cardActions {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 6px !important;
          }

          .cardActions button,
          .viewBtn,
          .addBtn {
            min-height: 32px !important;
            padding: 8px 6px !important;
            font-size: 10.5px !important;
            border-radius: 999px !important;
            white-space: nowrap !important;
          }

          .productImageSwitcher {
            left: 50% !important;
            right: auto !important;
            bottom: 8px !important;
            transform: translateX(-50%) !important;
            z-index: 6 !important;
            gap: 3px !important;
            padding: 3px !important;
            border-radius: 999px !important;
            max-width: calc(100% - 18px) !important;
            background: rgba(255, 255, 255, 0.9) !important;
            border: 1px solid rgba(176, 140, 78, 0.22) !important;
            box-shadow: 0 8px 20px rgba(42, 28, 18, 0.14) !important;
            backdrop-filter: blur(10px) !important;
            -webkit-backdrop-filter: blur(10px) !important;
          }

          .productImageSwitcher .imageSwitchBtn {
            width: 24px !important;
            min-width: 24px !important;
            height: 24px !important;
            min-height: 24px !important;
            padding: 0 !important;
            border-radius: 999px !important;
            font-size: 0 !important;
            line-height: 0 !important;
            letter-spacing: 0 !important;
            display: grid !important;
            place-items: center !important;
            overflow: hidden !important;
            color: transparent !important;
          }

          .productImageSwitcher .imageSwitchBtn::after {
            display: block !important;
            font-size: 10.5px !important;
            line-height: 1 !important;
            font-weight: 800 !important;
            letter-spacing: 0.02em !important;
            color: #6f5735 !important;
          }

          .productImageSwitcher .imageSwitchBtn:nth-child(1)::after {
            content: "F";
          }

          .productImageSwitcher .imageSwitchBtn:nth-child(2)::after {
            content: "M";
          }

          .productImageSwitcher .imageSwitchBtn:nth-child(3)::after {
            content: "B";
          }

          .productImageSwitcher .imageSwitchBtn.active::after {
            color: #ffffff !important;
          }

          .stockTag {
            display: none !important;
          }

          .heartBtn {
            top: 8px !important;
            right: 8px !important;
            width: 30px !important;
            height: 30px !important;
            min-width: 30px !important;
            min-height: 30px !important;
            font-size: 14px !important;
          }
        }

        @media (max-width: 380px) {
          .productGrid {
            gap: 10px !important;
          }

          .productImage {
            height: clamp(190px, 49vw, 240px) !important;
          }

          .productInfo h4 {
            font-size: 11.8px !important;
          }

          .cardActions button,
          .viewBtn,
          .addBtn {
            font-size: 10px !important;
            padding: 7px 4px !important;
          }
        }


        /* =========================================================
           IPAD / TABLET VISUAL FIXES
           Fixes light-mode contrast, hero overlay readability,
           section headings, newsletter, footer, and fixed bottom nav
           on iPad Safari / tablet widths.
           ========================================================= */
        @media (min-width: 701px) and (max-width: 1366px) {
          html,
          body,
          #root {
            background: #f7f1e8 !important;
            overflow-x: hidden !important;
          }

          .page:not(.darkMode) {
            background: #f7f1e8 !important;
            color: #241a14 !important;
          }

          .page:not(.darkMode) .nav,
          .page:not(.darkMode) .navInner {
            background: rgba(255, 249, 240, 0.96) !important;
            border-color: rgba(176, 138, 69, 0.22) !important;
          }

          .page:not(.darkMode) .brandMark h1,
          .page:not(.darkMode) .brandMark p,
          .page:not(.darkMode) .navAction,
          .page:not(.darkMode) .navIcon,
          .page:not(.darkMode) .languageBtn,
          .page:not(.darkMode) .themeBtn,
          .page:not(.darkMode) .menuBtn,
          .page:not(.darkMode) .signInBtn {
            opacity: 1 !important;
            text-shadow: none !important;
          }

          .page:not(.darkMode) .brandMark h1 {
            color: #1f1712 !important;
          }

          .page:not(.darkMode) .brandMark p,
          .page:not(.darkMode) .eyebrow,
          .page:not(.darkMode) .category,
          .page:not(.darkMode) .footerTag,
          .page:not(.darkMode) .newsletterStatus,
          .page:not(.darkMode) .storyPoint span {
            color: #b08a45 !important;
          }

          .page:not(.darkMode) h1,
          .page:not(.darkMode) h2,
          .page:not(.darkMode) h3,
          .page:not(.darkMode) h4,
          .page:not(.darkMode) h5,
          .page:not(.darkMode) h6,
          .page:not(.darkMode) .heroCopy h2,
          .page:not(.darkMode) .sectionTitle,
          .page:not(.darkMode) .panelTitle,
          .page:not(.darkMode) .footerLogo,
          .page:not(.darkMode) .productInfo h4,
          .page:not(.darkMode) .moodCardContent h4,
          .page:not(.darkMode) .storyPoint p,
          .page:not(.darkMode) .luxGiftCard h3 {
            color: #241a14 !important;
            opacity: 1 !important;
            text-shadow: none !important;
          }

          .page:not(.darkMode) p,
          .page:not(.darkMode) span,
          .page:not(.darkMode) li,
          .page:not(.darkMode) label,
          .page:not(.darkMode) .description,
          .page:not(.darkMode) .sectionIntro,
          .page:not(.darkMode) .panelText,
          .page:not(.darkMode) .price,
          .page:not(.darkMode) .footerLinks a,
          .page:not(.darkMode) .trustItem p,
          .page:not(.darkMode) .newsletterBox p,
          .page:not(.darkMode) .cleanPanel p {
            color: #5f4c3e !important;
            opacity: 1 !important;
            text-shadow: none !important;
          }

          .page:not(.darkMode) .heroCard {
            background: rgba(255, 249, 240, 0.94) !important;
            border: 1px solid rgba(176, 138, 69, 0.34) !important;
            color: #241a14 !important;
            box-shadow: 0 18px 40px rgba(36, 26, 20, 0.14) !important;
            -webkit-backdrop-filter: none !important;
            backdrop-filter: none !important;
          }

          .page:not(.darkMode) .heroCard small {
            color: #b08a45 !important;
            opacity: 1 !important;
          }

          .page:not(.darkMode) .heroCard strong {
            color: #241a14 !important;
            opacity: 1 !important;
            text-shadow: none !important;
          }

          .page:not(.darkMode) .cleanPanel,
          .page:not(.darkMode) .newsletterBox,
          .page:not(.darkMode) .giftCardBox,
          .page:not(.darkMode) .trustItem,
          .page:not(.darkMode) .productCard,
          .page:not(.darkMode) .moodCard,
          .page:not(.darkMode) .storyPoint,
          .page:not(.darkMode) .luxGiftCard {
            background: rgba(255, 249, 240, 0.96) !important;
            border-color: rgba(176, 138, 69, 0.24) !important;
            color: #241a14 !important;
          }

          .page:not(.darkMode) .newsletterBox input,
          .page:not(.darkMode) .emailForm input,
          .page:not(.darkMode) .searchBox {
            background: rgba(255, 249, 240, 0.98) !important;
            color: #241a14 !important;
            border-color: rgba(176, 138, 69, 0.32) !important;
          }

          .page:not(.darkMode) .newsletterBox input::placeholder,
          .page:not(.darkMode) .emailForm input::placeholder,
          .page:not(.darkMode) .searchBox::placeholder {
            color: rgba(95, 76, 62, 0.72) !important;
            opacity: 1 !important;
          }

          .page:not(.darkMode) .primaryBtn,
          .page:not(.darkMode) .emailForm button,
          .page:not(.darkMode) .mobileBottom,
          .page:not(.darkMode) .mobileBottom a,
          .page:not(.darkMode) .mobileBottom button {
            background: #2c1f18 !important;
            color: #fff9f0 !important;
            border-color: #2c1f18 !important;
          }

          .page:not(.darkMode) .secondaryBtn,
          .page:not(.darkMode) .viewBtn,
          .page:not(.darkMode) .filterBtn,
          .page:not(.darkMode) .luxurySortButton {
            color: #241a14 !important;
            border-color: rgba(176, 138, 69, 0.38) !important;
          }

          .hero {
            min-height: auto !important;
          }

          .heroCopy,
          .heroVisual {
            min-height: clamp(520px, 58vh, 760px) !important;
          }

          .heroVisual img {
            object-position: center center !important;
          }

          .section {
            padding-top: clamp(64px, 7vw, 92px) !important;
            padding-bottom: clamp(64px, 7vw, 92px) !important;
          }

          .sectionHead {
            align-items: center !important;
          }

          .sectionTitle,
          .panelTitle {
            line-height: 1.08 !important;
          }

          .storyGrid,
          .cleanPanel,
          .newsletterBox,
          .giftCardBox {
            max-width: 100% !important;
          }

          .footer {
            padding-bottom: 104px !important;
          }

          main {
            padding-bottom: 24px !important;
          }
        }

        @media (min-width: 701px) and (max-width: 1024px) {
          .navInner {
            padding-left: 18px !important;
            padding-right: 18px !important;
          }

          .hero {
            grid-template-columns: 1fr !important;
            padding-left: 20px !important;
            padding-right: 20px !important;
            gap: 22px !important;
          }

          .heroCopy {
            min-height: auto !important;
            padding: clamp(40px, 6vw, 64px) !important;
          }

          .heroCopy h2 {
            font-size: clamp(54px, 8vw, 82px) !important;
          }

          .heroVisual {
            min-height: clamp(560px, 70vh, 760px) !important;
          }

          .trustBar {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            padding-left: 20px !important;
            padding-right: 20px !important;
          }

          .section {
            padding-left: 20px !important;
            padding-right: 20px !important;
          }

          .productGrid {
            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
            gap: 18px !important;
          }

          .productImage {
            height: clamp(330px, 42vw, 480px) !important;
          }

          .storyGrid,
          .giftCardBox,
          .cleanPanel {
            grid-template-columns: 1fr !important;
          }

          .newsletterBox {
            padding: 44px 36px !important;
          }

          .emailForm,
          .privateListForm {
            grid-template-columns: 1fr auto !important;
            gap: 14px !important;
          }
        }

        @media (min-width: 1025px) and (max-width: 1366px) {
          .navInner {
            padding-left: 34px !important;
            padding-right: 34px !important;
          }

          .hero {
            padding-left: 34px !important;
            padding-right: 34px !important;
            grid-template-columns: minmax(390px, 0.9fr) minmax(480px, 1.1fr) !important;
            gap: 28px !important;
          }

          .heroCopy h2 {
            font-size: clamp(64px, 6.4vw, 92px) !important;
          }

          .section,
          .trustBar {
            padding-left: 34px !important;
            padding-right: 34px !important;
          }

          .productGrid {
            grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
            gap: 22px !important;
          }
        }

        @supports (-webkit-touch-callout: none) {
          @media (min-width: 701px) and (max-width: 1366px) {
            .page:not(.darkMode) .sectionTitle,
            .page:not(.darkMode) .panelTitle,
            .page:not(.darkMode) .brandMark h1,
            .page:not(.darkMode) .heroCard strong {
              -webkit-text-fill-color: #241a14 !important;
            }

            .page:not(.darkMode) .eyebrow,
            .page:not(.darkMode) .brandMark p {
              -webkit-text-fill-color: #b08a45 !important;
            }
          }
        }




        .offerBackdrop {
          position: fixed;
          inset: 0;
          z-index: 90;
          display: grid;
          place-items: center;
          padding: 22px;
          background: rgba(35, 27, 21, 0.48);
          backdrop-filter: blur(9px);
        }

        .offerPanel {
          position: relative;
          width: min(720px, calc(100vw - 32px));
          padding: clamp(34px, 5vw, 54px) clamp(22px, 5vw, 62px);
          border-radius: 18px;
          background: #fffaf1;
          border: 1px solid rgba(194, 160, 98, 0.28);
          box-shadow: 0 32px 95px rgba(36, 25, 17, 0.34);
          text-align: center;
          color: #281d18;
        }

        .darkMode .offerPanel {
          background: #1f1712;
          border-color: rgba(226, 195, 139, 0.26);
          color: #fff8ef;
        }

        .offerClose {
          position: absolute;
          top: 18px;
          right: 22px;
          border: 0;
          background: transparent;
          color: #b08c4e;
          font-size: 34px;
          line-height: 1;
          cursor: pointer;
          font-family: Georgia, serif;
        }

        .offerLogo {
          display: inline-flex;
          flex-direction: column;
          gap: 4px;
          margin-bottom: 24px;
          color: #caa46a;
          letter-spacing: 0.22em;
        }

        .offerLogo span {
          font-family: Georgia, 'Times New Roman', serif;
          font-size: clamp(26px, 4vw, 39px);
          letter-spacing: 0.18em;
        }

        .offerLogo small {
          font-size: 10px;
          letter-spacing: 0.42em;
        }

        .offerPanel h3 {
          margin: 0 0 8px;
          font-size: clamp(24px, 4vw, 34px);
          line-height: 1.1;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #d0ab6b;
        }

        .offerPanel p {
          margin: 0 auto 24px;
          max-width: 520px;
          color: #6f5b4d;
          font-size: 15px;
          line-height: 1.7;
        }

        .darkMode .offerPanel p {
          color: #e8d6bd;
        }

        .offerForm {
          display: grid;
          gap: 14px;
          width: 100%;
        }

        .offerForm input {
          width: 100%;
          min-height: 58px;
          border-radius: 16px;
          border: 1px solid rgba(194, 160, 98, 0.26);
          background: rgba(255, 255, 255, 0.72);
          color: #2f2118;
          padding: 0 24px;
          font-size: 15px;
          outline: none;
        }

        .darkMode .offerForm input {
          background: rgba(255, 250, 241, 0.08);
          color: #fff8ef;
        }

        .offerForm input:focus {
          border-color: #b08c4e;
          box-shadow: 0 0 0 4px rgba(176, 140, 78, 0.12);
        }

        .offerForm button {
          width: 100%;
          min-height: 58px;
          border: 0;
          border-radius: 16px;
          background: linear-gradient(135deg, #d7bc8b, #b08c4e);
          color: #fffaf1;
          font-weight: 800;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          cursor: pointer;
          box-shadow: 0 18px 45px rgba(176, 140, 78, 0.24);
        }

        .offerForm button:disabled {
          opacity: 0.65;
          cursor: wait;
        }

        .offerStatus {
          display: block;
          margin-top: 14px;
          color: #8b6f38;
          font-size: 13px;
          line-height: 1.5;
        }

        .offerNoThanks {
          margin-top: 18px;
          border: 0;
          background: transparent;
          color: #3b2b20;
          text-decoration: underline;
          cursor: pointer;
          font-size: 14px;
        }

        .darkMode .offerNoThanks {
          color: #fff8ef;
        }

        @media (max-width: 640px) {
          .offerPanel {
            padding: 34px 20px 30px;
            border-radius: 22px;
          }

          .offerPanel h3 {
            font-size: 21px;
            letter-spacing: 0.06em;
          }

          .offerForm input,
          .offerForm button {
            min-height: 54px;
          }
        }

        /* Final mobile + private-offer fixes */
        .offerCodeBox {
          margin: 14px auto 0;
          width: min(320px, 100%);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          padding: 12px 16px;
          border-radius: 16px;
          border: 1px solid rgba(176, 138, 69, 0.28);
          background: rgba(239, 219, 187, 0.34);
          color: #2f2118;
        }

        .offerCodeBox span {
          font-size: 11px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #8b6f38;
        }

        .offerCodeBox strong {
          font-size: 15px;
          letter-spacing: 0.18em;
        }

        .darkMode .offerCodeBox {
          background: rgba(255, 249, 240, 0.08);
          color: #fff8ef;
          border-color: rgba(215, 180, 111, 0.28);
        }

        .cartSummaryBox {
          display: grid;
          gap: 8px;
          padding: 14px 16px;
          border-radius: 20px;
          border: 1px solid rgba(176, 138, 69, 0.22);
          background: rgba(255, 249, 240, 0.64);
          color: #4b392c;
        }

        .cartSummaryBox div {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          font-size: 13px;
        }

        .cartSummaryBox span {
          color: #7a604d;
        }

        .cartSummaryBox strong {
          font-weight: 700;
          color: #2c1f18;
        }

        .cartSummaryBox .discountRow strong,
        .cartSummaryBox .discountRow span {
          color: #a67f35;
        }

        .cartSummaryBox .totalRow {
          padding-top: 8px;
          border-top: 1px solid rgba(176, 138, 69, 0.16);
          font-size: 14px;
        }

        .darkMode .cartSummaryBox {
          background: rgba(255, 249, 240, 0.07);
          border-color: rgba(215, 180, 111, 0.26);
          color: #fff8ef;
        }

        .darkMode .cartSummaryBox span { color: #e4d0b7; }
        .darkMode .cartSummaryBox strong { color: #fff8ef; }

        @keyframes laGraziaToastIn {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }

        .toast {
          left: 50% !important;
          transform: translateX(-50%) !important;
          width: max-content !important;
          max-width: calc(100vw - 34px) !important;
          text-align: center !important;
          white-space: normal !important;
        }

        @media (max-width: 700px) {
          .offerBackdrop {
            z-index: 180 !important;
            padding: 16px !important;
            align-items: center !important;
          }

          .offerPanel {
            width: 100% !important;
            max-height: calc(100vh - 48px) !important;
            overflow-y: auto !important;
            padding: 32px 18px 24px !important;
            border-radius: 28px !important;
          }

          .offerLogo {
            margin-bottom: 16px !important;
          }

          .offerLogo span {
            font-size: 28px !important;
          }

          .offerPanel h3 {
            font-size: 20px !important;
            line-height: 1.22 !important;
          }

          .offerPanel p {
            font-size: 13px !important;
            line-height: 1.58 !important;
            margin-bottom: 16px !important;
          }

          .offerForm input,
          .offerForm button {
            min-height: 52px !important;
            border-radius: 18px !important;
          }

          .actions {
            display: grid !important;
            grid-template-columns: 1fr !important;
            gap: 12px !important;
            width: 100% !important;
            max-width: 100% !important;
          }

          .actions a,
          .actions button {
            width: 100% !important;
            max-width: 100% !important;
            justify-content: center !important;
            text-align: center !important;
            white-space: normal !important;
          }

          .launchCountdown {
            width: 100% !important;
            max-width: 100% !important;
            padding: 14px !important;
            margin-top: 18px !important;
            overflow: hidden !important;
          }

          .launchCountdownHeader {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 6px !important;
          }

          .launchCountdownHeader span {
            font-size: 10px !important;
            letter-spacing: 0.2em !important;
          }

          .countdownUnit {
            padding: 12px 8px !important;
            border-radius: 18px !important;
          }

          .countdownUnit strong {
            font-size: 32px !important;
          }

          .countdownUnit span {
            font-size: 9px !important;
            letter-spacing: 0.16em !important;
          }

          .cartDrawer {
            left: 14px !important;
            right: 14px !important;
            top: 92px !important;
            bottom: calc(104px + env(safe-area-inset-bottom)) !important;
            width: auto !important;
            max-height: none !important;
            overflow-y: auto !important;
            padding: 18px !important;
            border-radius: 30px !important;
            gap: 14px !important;
            z-index: 95 !important;
          }

          .cartHeader {
            align-items: flex-start !important;
          }

          .cartHeader h3 {
            font-size: clamp(30px, 9vw, 42px) !important;
            line-height: 0.92 !important;
            letter-spacing: -0.035em !important;
          }

          .cartItems {
            gap: 12px !important;
            overflow: visible !important;
          }

          .cartItem {
            grid-template-columns: 72px 1fr !important;
            gap: 12px !important;
            align-items: center !important;
            padding-bottom: 12px !important;
          }

          .cartItem img {
            width: 72px !important;
            height: 92px !important;
            border-radius: 16px !important;
          }

          .cartItem h4 {
            font-size: 18px !important;
            line-height: 1.05 !important;
          }

          .cartItem p {
            font-size: 12px !important;
            margin: 4px 0 !important;
          }

          .cartQtyControls {
            margin: 7px 0 5px !important;
          }

          .cartPreOrderNote,
          .cartSummaryBox {
            border-radius: 18px !important;
            padding: 12px 13px !important;
            font-size: 12px !important;
          }

          .checkoutBtn {
            min-height: 58px !important;
            border-radius: 999px !important;
            font-size: 11px !important;
            letter-spacing: 0.16em !important;
            padding: 0 14px !important;
          }

          .toast {
            bottom: calc(98px + env(safe-area-inset-bottom)) !important;
            padding: 12px 16px !important;
            font-size: 11px !important;
            letter-spacing: 0.06em !important;
            line-height: 1.45 !important;
          }
        }

        @media (max-width: 390px) {
          .cartDrawer {
            left: 10px !important;
            right: 10px !important;
            padding: 16px !important;
          }

          .cartHeader h3 {
            font-size: 31px !important;
          }

          .checkoutBtn {
            font-size: 10px !important;
          }
        }


        /* =========================================================
           FINAL FIX — LUXURY PRIVATE ACCESS POPUP + MOBILE SEARCH
           ========================================================= */
        .offerBackdrop {
          z-index: 260 !important;
          padding: clamp(14px, 4vw, 26px) !important;
          background:
            radial-gradient(circle at 50% 8%, rgba(215, 180, 111, 0.18), transparent 42%),
            rgba(31, 23, 17, 0.62) !important;
          backdrop-filter: blur(18px) saturate(1.05) !important;
          -webkit-backdrop-filter: blur(18px) saturate(1.05) !important;
        }

        .offerPanel {
          width: min(560px, calc(100vw - 32px)) !important;
          overflow: hidden !important;
          border-radius: 34px !important;
          padding: clamp(38px, 5vw, 54px) clamp(24px, 5vw, 52px) clamp(28px, 4vw, 42px) !important;
          background:
            linear-gradient(180deg, rgba(255, 252, 246, 0.98) 0%, rgba(249, 241, 229, 0.98) 100%) !important;
          border: 1px solid rgba(178, 139, 74, 0.34) !important;
          box-shadow:
            0 38px 90px rgba(26, 18, 13, 0.42),
            inset 0 1px 0 rgba(255, 255, 255, 0.78) !important;
        }

        .offerPanel::before {
          content: "";
          position: absolute;
          inset: 12px;
          border-radius: 24px;
          border: 1px solid rgba(178, 139, 74, 0.18);
          pointer-events: none;
        }

        .offerClose {
          top: 18px !important;
          right: 22px !important;
          width: 38px !important;
          height: 38px !important;
          border-radius: 999px !important;
          display: grid !important;
          place-items: center !important;
          color: #9a7438 !important;
          background: rgba(255, 249, 240, 0.72) !important;
          border: 1px solid rgba(178, 139, 74, 0.20) !important;
          font-size: 26px !important;
          line-height: 1 !important;
          z-index: 2 !important;
        }

        .offerLogo {
          position: relative !important;
          margin-bottom: 18px !important;
          color: #b78f52 !important;
        }

        .offerLogo::after {
          content: "";
          display: block;
          width: 54px;
          height: 1px;
          margin: 13px auto 0;
          background: linear-gradient(90deg, transparent, rgba(178, 139, 74, 0.8), transparent);
        }

        .offerLogo span {
          font-size: clamp(27px, 5.5vw, 38px) !important;
          letter-spacing: 0.20em !important;
          font-weight: 500 !important;
        }

        .offerLogo small {
          letter-spacing: 0.46em !important;
          opacity: 0.86 !important;
        }

        .offerEyebrow {
          margin: 0 0 12px !important;
          color: #ad8546 !important;
          font-size: 10px !important;
          letter-spacing: 0.28em !important;
          line-height: 1.6 !important;
          text-transform: uppercase !important;
          font-weight: 700 !important;
        }

        .offerPanel h3 {
          max-width: 420px !important;
          margin: 0 auto 12px !important;
          font-family: Georgia, "Times New Roman", serif !important;
          font-size: clamp(28px, 5vw, 42px) !important;
          font-weight: 500 !important;
          line-height: 1.05 !important;
          letter-spacing: -0.02em !important;
          text-transform: none !important;
          color: #2b1e16 !important;
        }

        .offerPanel p:not(.offerEyebrow) {
          max-width: 460px !important;
          margin: 0 auto 22px !important;
          color: #725a46 !important;
          font-size: 14.5px !important;
          line-height: 1.72 !important;
        }

        .offerForm {
          gap: 12px !important;
        }

        .offerForm input {
          min-height: 58px !important;
          border-radius: 999px !important;
          background: rgba(255, 255, 255, 0.76) !important;
          border-color: rgba(178, 139, 74, 0.28) !important;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.78) !important;
          text-align: center !important;
          color: #2b1e16 !important;
        }

        .offerForm input::placeholder {
          color: rgba(74, 56, 43, 0.45) !important;
        }

        .offerForm input:focus::placeholder {
          color: transparent !important;
          opacity: 0 !important;
        }

        .offerForm button {
          min-height: 58px !important;
          border-radius: 999px !important;
          background: linear-gradient(135deg, #241711 0%, #5f442f 52%, #b28b4a 100%) !important;
          color: #fff8ec !important;
          border: 1px solid rgba(215, 180, 111, 0.58) !important;
          box-shadow: 0 16px 38px rgba(66, 43, 26, 0.24) !important;
          letter-spacing: 0.18em !important;
        }

        .offerCodeBox {
          width: min(360px, 100%) !important;
          margin-top: 16px !important;
          padding: 14px 18px !important;
          border-radius: 999px !important;
          background:
            linear-gradient(180deg, rgba(255, 250, 243, 0.92), rgba(244, 232, 211, 0.72)) !important;
          border: 1px solid rgba(178, 139, 74, 0.26) !important;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.70) !important;
        }

        .offerCodeBox span {
          color: #8e6b35 !important;
          font-size: 10px !important;
          letter-spacing: 0.22em !important;
        }

        .offerCodeBox strong {
          color: #2b1e16 !important;
          font-size: 16px !important;
          letter-spacing: 0.22em !important;
        }

        .offerNoThanks {
          margin-top: 18px !important;
          color: #5b4636 !important;
          font-size: 13px !important;
          text-decoration: none !important;
          border-bottom: 1px solid rgba(91, 70, 54, 0.45) !important;
          padding-bottom: 3px !important;
        }

        .darkMode .offerPanel {
          background: linear-gradient(180deg, #241913 0%, #17100c 100%) !important;
          color: #fff8ef !important;
        }

        .darkMode .offerPanel h3,
        .darkMode .offerCodeBox strong {
          color: #fff8ef !important;
        }

        .darkMode .offerPanel p:not(.offerEyebrow) {
          color: #e7d4bd !important;
        }

        .darkMode .offerForm input {
          background: rgba(255, 249, 240, 0.08) !important;
          color: #fff8ef !important;
        }

        .darkMode .offerCodeBox {
          background: rgba(255, 249, 240, 0.07) !important;
        }

        .darkMode .offerNoThanks {
          color: #fff8ef !important;
          border-bottom-color: rgba(255, 248, 239, 0.44) !important;
        }

        .searchOverlay {
          background: #f7f1e8 !important;
          backdrop-filter: none !important;
          -webkit-backdrop-filter: none !important;
          color: #2c1f18 !important;
          overscroll-behavior: contain !important;
        }

        .darkMode .searchOverlay {
          background: #211713 !important;
          color: #fff9f0 !important;
        }

        .searchOverlayTop {
          position: sticky !important;
          top: 0 !important;
          z-index: 8 !important;
          background: #fff9f0 !important;
          border-bottom: 1px solid rgba(176, 138, 69, 0.22) !important;
          box-shadow: 0 10px 28px rgba(36, 26, 20, 0.08) !important;
        }

        .darkMode .searchOverlayTop {
          background: #2c1f18 !important;
        }

        .searchOverlayContent {
          background: #f7f1e8 !important;
        }

        .darkMode .searchOverlayContent {
          background: #211713 !important;
        }

        @media (max-width: 700px) {
          .offerPanel {
            width: 100% !important;
            max-height: calc(100svh - 34px) !important;
            padding: 34px 18px 24px !important;
            border-radius: 30px !important;
          }

          .offerPanel::before {
            inset: 9px !important;
            border-radius: 23px !important;
          }

          .offerClose {
            top: 15px !important;
            right: 16px !important;
            width: 34px !important;
            height: 34px !important;
            font-size: 24px !important;
          }

          .offerLogo {
            margin-bottom: 14px !important;
          }

          .offerLogo span {
            font-size: 27px !important;
            letter-spacing: 0.16em !important;
          }

          .offerPanel h3 {
            max-width: 320px !important;
            font-size: 27px !important;
            line-height: 1.05 !important;
          }

          .offerPanel p:not(.offerEyebrow) {
            font-size: 13.2px !important;
            line-height: 1.58 !important;
            margin-bottom: 16px !important;
          }

          .offerForm input,
          .offerForm button {
            min-height: 52px !important;
          }

          .offerCodeBox {
            padding: 13px 16px !important;
          }

          .searchOverlay {
            z-index: 245 !important;
            background: #f7f1e8 !important;
            padding-bottom: env(safe-area-inset-bottom) !important;
          }

          .searchOverlayTop {
            min-height: 76px !important;
            grid-template-columns: 28px 1fr 42px !important;
            padding: 10px 14px !important;
            gap: 10px !important;
          }

          .searchOverlayTop input {
            font-family: Georgia, "Times New Roman", serif !important;
            font-size: 19px !important;
            line-height: 1.15 !important;
            letter-spacing: 0.01em !important;
          }

          .searchCloseBtn {
            width: 42px !important;
            height: 42px !important;
            font-size: 28px !important;
            background: #fffaf3 !important;
          }

          .searchOverlayContent {
            width: 100% !important;
            min-height: calc(100svh - 76px) !important;
            padding: 20px 16px calc(150px + env(safe-area-inset-bottom)) !important;
            background: #f7f1e8 !important;
          }

          .searchOverlayContent .sectionHead {
            display: block !important;
            margin: 0 0 16px !important;
            padding: 18px 14px !important;
            border-radius: 24px !important;
            background: #fff9f0 !important;
            border: 1px solid rgba(176, 138, 69, 0.18) !important;
            box-shadow: 0 10px 28px rgba(36, 26, 20, 0.06) !important;
            text-align: center !important;
          }

          .searchOverlayContent .eyebrow {
            margin: 0 0 8px !important;
            color: #aa833f !important;
            -webkit-text-fill-color: #aa833f !important;
            font-size: 10px !important;
            letter-spacing: 0.22em !important;
          }

          .searchOverlayContent .sectionTitle {
            color: #2c1f18 !important;
            -webkit-text-fill-color: #2c1f18 !important;
            font-size: clamp(25px, 7.2vw, 34px) !important;
            line-height: 1.04 !important;
            letter-spacing: -0.03em !important;
            opacity: 1 !important;
            word-break: break-word !important;
          }

          .searchQuickLinks {
            justify-content: center !important;
            gap: 10px !important;
            margin: 0 !important;
          }

          .searchQuickLinks button {
            min-height: 43px !important;
            padding: 11px 15px !important;
            background: #fff9f0 !important;
            color: #2c1f18 !important;
            border: 1px solid rgba(176, 138, 69, 0.24) !important;
            box-shadow: 0 6px 18px rgba(36, 26, 20, 0.04) !important;
            font-size: 10.5px !important;
            letter-spacing: 0.12em !important;
          }

          .searchResultsGrid {
            grid-template-columns: 1fr !important;
            gap: 14px !important;
            margin-top: 18px !important;
          }

          .searchResultCard {
            background: #fff9f0 !important;
            border-color: rgba(176, 138, 69, 0.18) !important;
            border-radius: 22px !important;
            box-shadow: 0 10px 28px rgba(36, 26, 20, 0.07) !important;
          }

          .searchResultCard img {
            height: 300px !important;
          }

          .darkMode .searchOverlay,
          .darkMode .searchOverlayContent {
            background: #211713 !important;
          }

          .darkMode .searchOverlayContent .sectionHead,
          .darkMode .searchQuickLinks button,
          .darkMode .searchResultCard,
          .darkMode .searchCloseBtn {
            background: #2c1f18 !important;
            color: #fff9f0 !important;
          }

          .darkMode .searchOverlayContent .sectionTitle {
            color: #fff9f0 !important;
            -webkit-text-fill-color: #fff9f0 !important;
          }
        }


        /* =========================================================
           LUXURY PRODUCT POPUP SCROLLBAR FIX
           Keeps product popup scrolling, but removes the heavy browser scrollbar.
           ========================================================= */

        .modal,
        .modalInfo {
          scrollbar-width: thin !important;
          scrollbar-color: rgba(184, 138, 59, 0.46) transparent !important;
          scrollbar-gutter: auto !important;
        }

        .modal::-webkit-scrollbar,
        .modalInfo::-webkit-scrollbar {
          width: 5px !important;
          height: 5px !important;
        }

        .modal::-webkit-scrollbar-track,
        .modalInfo::-webkit-scrollbar-track {
          background: transparent !important;
          margin: 22px 0 !important;
        }

        .modal::-webkit-scrollbar-thumb,
        .modalInfo::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, rgba(215, 180, 111, 0.58), rgba(92, 62, 38, 0.42)) !important;
          border-radius: 999px !important;
          border: 1px solid rgba(255, 249, 240, 0.76) !important;
          background-clip: padding-box !important;
        }

        .modal::-webkit-scrollbar-thumb:hover,
        .modalInfo::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, rgba(215, 180, 111, 0.82), rgba(92, 62, 38, 0.62)) !important;
        }

        .modal::-webkit-scrollbar-corner,
        .modalInfo::-webkit-scrollbar-corner {
          background: transparent !important;
        }

        .darkMode .modal,
        .darkMode .modalInfo {
          scrollbar-color: rgba(215, 180, 111, 0.55) transparent !important;
        }

        .darkMode .modal::-webkit-scrollbar-thumb,
        .darkMode .modalInfo::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, rgba(224, 182, 109, 0.70), rgba(255, 244, 223, 0.22)) !important;
          border-color: rgba(32, 23, 17, 0.78) !important;
        }

        @media (max-width: 700px) {
          .modal,
          .modalInfo {
            scrollbar-width: thin !important;
          }

          .modal::-webkit-scrollbar,
          .modalInfo::-webkit-scrollbar {
            width: 3px !important;
            height: 3px !important;
          }

          .modal::-webkit-scrollbar-track,
          .modalInfo::-webkit-scrollbar-track {
            margin: 18px 0 !important;
          }
        }


        /* FINAL FIX — ELEVATED LUXURY PRIVATE OFFER SUCCESS ANIMATION */
        .offerCelebrationLayer {
          position: fixed;
          inset: 0;
          z-index: 360;
          pointer-events: none;
          overflow: hidden;
          isolation: isolate;
        }

        .offerCelebrationLayer::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: 0;
          background:
            radial-gradient(circle at 50% 18%, rgba(255, 248, 232, 0.34), transparent 34%),
            radial-gradient(circle at 12% 82%, rgba(192, 145, 70, 0.14), transparent 28%),
            radial-gradient(circle at 88% 76%, rgba(192, 145, 70, 0.12), transparent 26%);
          opacity: 0;
          animation: graziaCelebrationVeil 5.6s ease-in-out both;
        }

        .offerCelebrationLayer span {
          position: absolute;
          top: -74px;
          left: var(--offer-x);
          z-index: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 54px;
          min-height: 30px;
          padding: 7px 12px 6px;
          border-radius: 999px;
          border: 1px solid rgba(204, 165, 94, 0.32);
          background:
            linear-gradient(145deg, rgba(255, 252, 245, 0.72), rgba(238, 219, 184, 0.38)),
            radial-gradient(circle at 30% 18%, rgba(255, 255, 255, 0.92), transparent 36%);
          box-shadow:
            0 16px 38px rgba(50, 34, 24, 0.10),
            inset 0 0 0 1px rgba(255, 249, 236, 0.68),
            inset 0 -8px 18px rgba(126, 83, 38, 0.08);
          backdrop-filter: blur(5px);
          -webkit-backdrop-filter: blur(5px);
          font-family: Georgia, "Times New Roman", serif;
          font-size: var(--offer-size);
          line-height: 1;
          letter-spacing: 0.18em;
          color: rgba(126, 83, 38, var(--offer-opacity));
          text-shadow: 0 1px 0 rgba(255, 250, 239, 0.7), 0 10px 26px rgba(75, 47, 28, 0.12);
          white-space: nowrap;
          opacity: 0;
          transform: translate3d(0, -48px, 0) rotate(0deg) scale(0.92);
          animation: graziaOfferFall var(--offer-duration) cubic-bezier(0.2, 0.82, 0.28, 1) var(--offer-delay) forwards;
        }

        .offerCelebrationLayer span::before,
        .offerCelebrationLayer span::after {
          content: "";
          position: absolute;
          width: 5px;
          height: 5px;
          border-radius: 1px;
          background: rgba(196, 156, 84, 0.5);
          transform: rotate(45deg);
          opacity: 0.55;
        }

        .offerCelebrationLayer span::before {
          left: -12px;
          top: 50%;
        }

        .offerCelebrationLayer span::after {
          right: -12px;
          top: 50%;
        }

        .offerCelebrationLayer span:nth-child(4n) {
          min-width: 38px;
          border-radius: 16px;
          background: rgba(255, 248, 234, 0.54);
          color: rgba(176, 140, 78, calc(var(--offer-opacity) + 0.12));
          letter-spacing: 0.12em;
          box-shadow: 0 12px 32px rgba(50, 34, 24, 0.08), inset 0 0 0 1px rgba(255, 255, 255, 0.52);
        }

        .offerCelebrationLayer span:nth-child(7n) {
          min-width: 98px;
          font-family: Inter, system-ui, sans-serif;
          font-size: calc(var(--offer-size) - 1px);
          font-weight: 700;
          letter-spacing: 0.2em;
          color: rgba(80, 48, 28, calc(var(--offer-opacity) + 0.08));
        }

        @keyframes graziaCelebrationVeil {
          0% { opacity: 0; }
          16% { opacity: 1; }
          76% { opacity: 0.82; }
          100% { opacity: 0; }
        }

        @keyframes graziaOfferFall {
          0% {
            opacity: 0;
            transform: translate3d(0, -52px, 0) rotate(0deg) scale(0.9);
            filter: blur(2px);
          }
          14% {
            opacity: 1;
            filter: blur(0);
          }
          54% {
            opacity: 0.86;
            transform: translate3d(calc(var(--offer-drift) * 0.36), 48vh, 0) rotate(calc(var(--offer-rotate) * 0.42)) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate3d(var(--offer-drift), 112vh, 0) rotate(var(--offer-rotate)) scale(0.98);
            filter: blur(1px);
          }
        }

        .offerPanel {
          animation: luxuryOfferEntrance 0.78s cubic-bezier(0.18, 0.86, 0.32, 1) both;
          transform-origin: center;
        }

        @keyframes luxuryOfferEntrance {
          0% {
            opacity: 0;
            transform: translateY(22px) scale(0.958);
            filter: blur(8px);
          }
          72% {
            opacity: 1;
            transform: translateY(-2px) scale(1.006);
            filter: blur(0);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
        }

        .offerPanel h3,
        .offerPanel p:not(.offerEyebrow),
        .offerForm,
        .offerCodeBox,
        .offerNoThanks {
          animation: luxuryOfferContentIn 0.78s cubic-bezier(0.18, 0.86, 0.32, 1) both;
        }

        .offerForm { animation-delay: 0.08s; }
        .offerCodeBox { animation-delay: 0.16s; }
        .offerNoThanks { animation-delay: 0.22s; }

        @keyframes luxuryOfferContentIn {
          0% {
            opacity: 0;
            transform: translateY(14px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .offerPanel.offerPanelUnlocked {
          overflow: hidden;
          animation: luxuryOfferUnlockPanel 0.92s cubic-bezier(0.16, 0.84, 0.36, 1) both;
        }

        .offerPanel.offerPanelUnlocked::before {
          content: "";
          position: absolute;
          inset: 16px;
          z-index: 0;
          pointer-events: none;
          border-radius: 30px;
          border: 1px solid rgba(196, 156, 84, 0.18);
          opacity: 0;
          animation: offerInnerFrameIn 1.1s ease both 0.1s;
        }

        .offerPanel.offerPanelUnlocked::after {
          content: "";
          position: absolute;
          inset: -34%;
          z-index: 0;
          pointer-events: none;
          background:
            radial-gradient(circle at 50% 36%, rgba(212, 174, 103, 0.23), transparent 32%),
            linear-gradient(112deg, transparent 34%, rgba(255, 248, 232, 0.62) 48%, transparent 62%);
          animation: offerLuxuryShimmer 3.4s ease-in-out infinite;
        }

        @keyframes luxuryOfferUnlockPanel {
          0% { opacity: 0; transform: translateY(18px) scale(0.972); filter: blur(7px); }
          55% { opacity: 1; transform: translateY(-2px) scale(1.01); filter: blur(0); }
          100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }

        @keyframes offerInnerFrameIn {
          0% { opacity: 0; transform: scale(0.96); }
          100% { opacity: 1; transform: scale(1); }
        }

        @keyframes offerLuxuryShimmer {
          0% { transform: translateX(-20%) rotate(0deg); opacity: 0.28; }
          42% { opacity: 0.72; }
          100% { transform: translateX(20%) rotate(0deg); opacity: 0.28; }
        }

        .offerSuccessMoment {
          position: relative;
          z-index: 2;
          display: grid;
          justify-items: center;
          text-align: center;
          padding: 12px 0 4px;
        }

        .offerSuccessMoment .offerEyebrow {
          animation: offerSuccessTextIn 0.68s ease both 0.22s;
        }

        .offerSuccessMoment h3 {
          animation: offerSuccessTitleIn 0.82s cubic-bezier(0.18, 0.86, 0.32, 1) both 0.38s;
        }

        .offerSuccessMoment p:not(.offerEyebrow) {
          animation: offerSuccessTextIn 0.76s ease both 0.58s;
        }

        .offerSuccessSeal {
          position: relative;
          width: 106px;
          height: 106px;
          border-radius: 999px;
          display: grid;
          place-items: center;
          margin: 0 auto 22px;
          color: #fff9ee;
          background:
            radial-gradient(circle at 32% 22%, #fff0c8 0%, #d6ad61 34%, #a06b2f 62%, #4b2b19 100%);
          box-shadow:
            0 24px 58px rgba(76, 49, 31, 0.24),
            0 0 0 12px rgba(213, 177, 111, 0.08),
            inset 0 0 0 1px rgba(255, 248, 232, 0.68),
            inset 0 0 0 9px rgba(255, 248, 232, 0.12);
          animation: offerSealRise 1.05s cubic-bezier(0.2, 0.92, 0.28, 1) both, offerSealGlow 2.7s ease-in-out infinite 1.05s;
        }

        .offerSuccessSeal::before,
        .offerSuccessSeal::after {
          content: "";
          position: absolute;
          border-radius: inherit;
          pointer-events: none;
        }

        .offerSuccessSeal::before {
          inset: -8px;
          border: 1px solid rgba(196, 156, 84, 0.26);
        }

        .offerSuccessSeal::after {
          inset: -20px;
          border: 1px solid rgba(255, 248, 232, 0.28);
          animation: offerSealRing 2.7s ease-out infinite 1.05s;
        }

        .offerSuccessSeal span {
          font-family: Georgia, "Times New Roman", serif;
          font-size: 34px;
          font-weight: 600;
          letter-spacing: 0.04em;
          text-shadow: 0 6px 16px rgba(44, 31, 24, 0.28);
        }

        .offerSuccessLine {
          width: min(260px, 78%);
          height: 1px;
          margin: 18px auto 2px;
          overflow: hidden;
          background: rgba(196, 156, 84, 0.16);
        }

        .offerSuccessLine::after {
          content: "";
          display: block;
          width: 100%;
          height: 100%;
          transform-origin: left center;
          background: linear-gradient(90deg, transparent, rgba(196, 156, 84, 0.82), transparent);
          animation: offerSuccessLineFill 4.6s ease both 0.72s;
        }

        @keyframes offerSealRise {
          0% { opacity: 0; transform: translateY(20px) scale(0.72) rotate(-4deg); filter: blur(5px); }
          62% { opacity: 1; transform: translateY(-3px) scale(1.055) rotate(0.8deg); filter: blur(0); }
          100% { opacity: 1; transform: translateY(0) scale(1) rotate(0deg); filter: blur(0); }
        }

        @keyframes offerSealGlow {
          0%, 100% {
            box-shadow: 0 24px 58px rgba(76, 49, 31, 0.24), 0 0 0 12px rgba(213, 177, 111, 0.08), inset 0 0 0 1px rgba(255, 248, 232, 0.68), inset 0 0 0 9px rgba(255, 248, 232, 0.12);
          }
          50% {
            box-shadow: 0 28px 68px rgba(176, 140, 78, 0.28), 0 0 0 15px rgba(213, 177, 111, 0.11), inset 0 0 0 1px rgba(255, 248, 232, 0.82), inset 0 0 0 9px rgba(255, 248, 232, 0.17);
          }
        }

        @keyframes offerSealRing {
          0% { opacity: 0.62; transform: scale(0.88); }
          100% { opacity: 0; transform: scale(1.15); }
        }

        @keyframes offerSuccessTitleIn {
          0% { opacity: 0; transform: translateY(14px) scale(0.98); filter: blur(5px); }
          100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }

        @keyframes offerSuccessTextIn {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        @keyframes offerSuccessLineFill {
          0% { transform: scaleX(0); opacity: 0; }
          12% { opacity: 1; }
          100% { transform: scaleX(1); opacity: 0.72; }
        }

        .offerPanel.offerPanelUnlocked .offerCodeBox {
          width: min(100%, 420px);
          margin-top: 12px;
          animation: offerCodeBoxGlow 1.2s ease-in-out both 0.78s;
        }

        @keyframes offerCodeBoxGlow {
          0% { opacity: 0; transform: translateY(14px); box-shadow: 0 0 0 rgba(176, 140, 78, 0); }
          100% { opacity: 1; transform: translateY(0); box-shadow: 0 16px 36px rgba(176, 140, 78, 0.16); }
        }

        @media (prefers-reduced-motion: reduce) {
          .offerCelebrationLayer,
          .offerCelebrationLayer span {
            animation: none !important;
            display: none !important;
          }

          .offerPanel,
          .offerPanel *,
          .offerPanel::before,
          .offerPanel::after {
            animation: none !important;
          }
        }


      `}</style>

      <div className="scrollProgress" style={{ width: `${scrollProgress}%` }} />

      {loading && (
        <div
          className={introExitStarted ? "loader logoDreamVideoLoader dreamExitStarted" : "loader logoDreamVideoLoader"}
          aria-label="Entering La Grazia boutique"
        >
          <video
            className="logoDreamVideo"
            autoPlay
            muted
            playsInline
            preload="auto"
            onTimeUpdate={(event) => {
              const video = event.currentTarget;
              if (video.duration && video.currentTime >= video.duration - 0.45) {
                setIntroExitStarted(true);
              }
            }}
            onEnded={() => setIntroExitStarted(true)}
          >
            <source src="/videos/la-grazia-entry.mp4" type="video/mp4" />
          </video>

          <div className="logoDreamTone" aria-hidden="true" />
          <div className="logoDreamSatin" aria-hidden="true" />
          <div className="logoDreamWash" aria-hidden="true" />

          <div className="logoDreamBrand" aria-hidden="true">
            <span className="logoDreamKicker">Milano Atelier</span>
            <strong>LA GRAZIA</strong>
          </div>

          <div className="logoDreamProgress" aria-hidden="true">
            <span />
          </div>
        </div>
      )}

      {offerCelebrationOpen && (
        <div className="offerCelebrationLayer" aria-hidden="true">
          {offerCelebrationPieces.map((piece) => (
            <span
              key={piece.id}
              style={{
                "--offer-x": piece.left,
                "--offer-delay": piece.delay,
                "--offer-duration": piece.duration,
                "--offer-drift": piece.drift,
                "--offer-rotate": piece.rotate,
                "--offer-size": piece.size,
                "--offer-opacity": piece.opacity,
              } as React.CSSProperties}
            >
              {piece.label}
            </span>
          ))}
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}

      {offerPopupOpen && (
        <div className="offerBackdrop" onClick={() => closeOfferPopup(true)}>
          <div className={offerJustUnlocked ? "offerPanel offerPanelUnlocked" : "offerPanel"} onClick={(event) => event.stopPropagation()}>
            <button className="offerClose" onClick={() => closeOfferPopup(true)} aria-label="Close private offer">
              ×
            </button>

            {offerJustUnlocked ? (
              <div className="offerSuccessMoment">
                <div className="offerSuccessSeal">
                  <span>10%</span>
                </div>

                <p className="offerEyebrow">{isArabic ? "تم تأمين الامتياز" : "Atelier privilege secured"}</p>
                <h3>{isArabic ? "تم فتح الوصول الخاص" : "Private access unlocked"}</h3>
                <p>{isArabic ? "تم حجز كود GRAZIA10 لأول حجز مسبق فقط. انتظري لحظة قصيرة وسنعيدك للتصفح." : "GRAZIA10 is now reserved for your first pre-order only. Stay for a brief moment while your private access is confirmed."}</p>

                <div className="offerCodeBox" aria-label="Private offer code">
                  <span>{isArabic ? "كود الامتياز" : "Atelier code"}</span>
                  <strong>{PRIVATE_OFFER_CODE}</strong>
                </div>

                <div className="offerSuccessLine" aria-hidden="true" />
              </div>
            ) : (
              <>
                <div className="offerLogo">
                  <span>LA GRAZIA</span>
                  <small>MILANO</small>
                </div>

                <p className="offerEyebrow">{isArabic ? "وصول خاص قبل الإطلاق" : "Private Atelier Access"}</p>
                <h3>{isArabic ? "امتياز خاص لأول حجز مسبق" : "A private first pre-order privilege"}</h3>
                <p>{isArabic ? "انضمي إلى قائمة لا غراتسيا الخاصة واحصلي على وصول مبكر قبل الإطلاق، مع امتياز 10% صالح مرة واحدة فقط لأول حجز مسبق باستخدام كود GRAZIA10." : "Join the La Grazia private list for early access before the official launch, with a discreet 10% privilege valid once for your first pre-order using code GRAZIA10."}</p>

                <form className="offerForm" onSubmit={handleOfferSubmit}>
                  <input
                    type="email"
                    value={offerEmail}
                    onChange={(event) => {
                      setOfferEmail(event.target.value);
                      setOfferStatus("");
                      setOfferJustUnlocked(false);
                    }}
                    placeholder={isArabic ? "اكتبي بريدك الإلكتروني" : "Enter your email address"}
                    autoComplete="email"
                  />

                  <button type="submit" disabled={offerSubmitting}>
                    {offerSubmitting ? (isArabic ? "جاري الحفظ..." : "Saving...") : (isArabic ? "فتح الوصول الخاص" : "Unlock private access")}
                  </button>
                </form>

                {offerStatus && <span className="offerStatus">{offerStatus}</span>}

                <div className="offerCodeBox" aria-label="Private offer code">
                  <span>{isArabic ? "كود الامتياز" : "Atelier code"}</span>
                  <strong>{PRIVATE_OFFER_CODE}</strong>
                </div>

                <button className="offerNoThanks" onClick={() => closeOfferPopup(true)}>
                  {isArabic ? "المتابعة الآن" : "Continue browsing"}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {signInOpen && (
        <div className="signInBackdrop" onClick={() => setSignInOpen(false)}>
          <div className="signInPanel" onClick={(event) => event.stopPropagation()}>
            <button className="signInClose" onClick={() => setSignInOpen(false)} aria-label="Close sign in">
              ×
            </button>
            <p className="eyebrow">{accountUser ? t.myAccount : authMode === "signUp" ? t.signUp : t.signIn}</p>
            <h3>{accountUser ? t.signInTitle : authMode === "signUp" ? t.signUpTitle : t.signInTitle}</h3>
            <p>{accountUser ? t.signInText : authMode === "signUp" ? t.signUpText : t.signInText}</p>

            {!accountUser && (
              <div className="signInTabs" role="tablist" aria-label="Account options">
                <button
                  type="button"
                  className={authMode === "signIn" ? "signInTab active" : "signInTab"}
                  onClick={() => { setAuthMode("signIn"); setVerificationNotice(""); }}
                >
                  {t.signIn}
                </button>
                <button
                  type="button"
                  className={authMode === "signUp" ? "signInTab active" : "signInTab"}
                  onClick={() => { setAuthMode("signUp"); setVerificationNotice(""); }}
                >
                  {t.signUp}
                </button>
              </div>
            )}

            {accountUser ? (
              <>
                <div className="accountSavedBox profileHeroBox">
                  <div>
                    <span>{isArabic ? "حساب لا غراتسيا" : "La Grazia Profile"}</span>
                    <strong>{accountUser.name}</strong>
                    <span>{accountUser.email}</span>
                    {accountUser.phone && <span>{accountUser.phone}</span>}
                  </div>
                </div>

                <div className="profileTabs">
                  <button
                    type="button"
                    className={accountView === "profile" ? "profileTab active" : "profileTab"}
                    onClick={() => setAccountView("profile")}
                  >
                    {isArabic ? "الملف الشخصي" : "Profile"}
                  </button>
                  <button
                    type="button"
                    className={accountView === "orders" ? "profileTab active" : "profileTab"}
                    onClick={() => { setAccountView("orders"); fetchUserOrders(); }}
                  >
                    {isArabic ? "حجوزاتي المسبقة" : "My Pre-Orders"}
                  </button>
                </div>

                {accountView === "profile" ? (
                  <div className="profileInfoGrid">
                    <div className="profileInfoCard">
                      <small>{isArabic ? "الاسم" : "Name"}</small>
                      <strong>{accountUser.name}</strong>
                    </div>
                    <div className="profileInfoCard">
                      <small>{isArabic ? "الإيميل" : "Email"}</small>
                      <strong>{accountUser.email}</strong>
                    </div>
                    <div className="profileInfoCard">
                      <small>{isArabic ? "رقم الهاتف" : "Phone"}</small>
                      <strong>{accountUser.phone || (isArabic ? "غير مضاف" : "Not added")}</strong>
                    </div>
                  </div>
                ) : (
                  <div className="ordersPanel">
                    {accountOrders.length === 0 ? (
                      <div className="noOrdersBox">
                        <strong>{isArabic ? "لا توجد حجوزات مسبقة حتى الآن" : "No pre-orders yet"}</strong>
                        <span>{isArabic ? "عند بدء الحجز المسبق، سيظهر طلبك هنا لتتبعي حالته." : "When you start a pre-order, it will appear here so you can track it."}</span>
                      </div>
                    ) : (
                      accountOrders.map((order) => (
                        <div className="orderCard" key={order.id}>
                          <div className="orderCardTop">
                            <div>
                              <small>{isArabic ? "رقم الحجز المسبق" : "Pre-Order"}</small>
                              <strong>{order.order_reference}</strong>
                            </div>
                            <span className="orderStatusPill">{order.order_status}</span>
                          </div>
                          <div className="orderMetaGrid">
                            <span>{isArabic ? "الدفع" : "Payment"}: {order.payment_status}</span>
                            <span>{isArabic ? "الإجمالي" : "Total"}: {order.currency} {Number(order.total_amount).toLocaleString()}</span>
                            <span>{new Date(order.created_at).toLocaleDateString()}</span>
                          </div>
                          <div className="orderItemsList">
                            {(order.order_items || []).map((orderItem) => (
                              <div className="orderMiniItem" key={orderItem.id}>
                                {orderItem.product_image && <img src={orderItem.product_image} alt={orderItem.product_name} />}
                                <div>
                                  <strong>{orderItem.product_name}</strong>
                                  <span>Size: {orderItem.size} · Color: {orderItem.color} · Qty: {orderItem.quantity}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                <div className="accountActions">
                  <button className="accountSecondary" onClick={handleSignOut}>{t.signOut}</button>
                  <button className="accountPrimary" onClick={() => setSignInOpen(false)}>{t.continueSignIn}</button>
                </div>
              </>
            ) : (
              <form className="signInForm" onSubmit={handleSignInSubmit}>
                {verificationNotice && (
                  <div className="authNotice">
                    <strong>{t.checkEmailTitle}</strong>
                    <span>{t.checkEmailText}</span>
                    <small>{t.checkEmailHint}</small>
                  </div>
                )}
                <input
                  value={accountForm.name}
                  onChange={(event) => setAccountForm((current) => ({ ...current, name: event.target.value }))}
                  placeholder={t.fullName}
                />
                <input
                  type="email"
                  value={accountForm.email}
                  onChange={(event) => setAccountForm((current) => ({ ...current, email: event.target.value }))}
                  placeholder={t.signInEmail}
                  required={authMode === "signUp"}
                />
                <input
                  value={accountForm.phone}
                  onChange={(event) => setAccountForm((current) => ({ ...current, phone: event.target.value }))}
                  placeholder={t.phoneNumber}
                />
                <input
                  type="password"
                  value={accountForm.password}
                  onChange={(event) => setAccountForm((current) => ({ ...current, password: event.target.value }))}
                  placeholder={isArabic ? "كلمة المرور" : "Password"}
                  required
                  minLength={6}
                />
                <button type="submit" disabled={accountLoading}>
                  {accountLoading ? (isArabic ? "جاري التحميل..." : "Loading...") : authMode === "signUp" ? t.createAccount : t.continueSignIn}
                </button>
                <button
                  type="button"
                  className="authSwitchBtn"
                  onClick={() => { setAuthMode(authMode === "signUp" ? "signIn" : "signUp"); setVerificationNotice(""); }}
                >
                  {authMode === "signUp" ? t.haveAccount : t.noAccount}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {searchOpen && (
        <div className="searchOverlay">
          <div className="searchOverlayTop">
            <SearchIcon />
            <input
              autoFocus
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder={t.searchPlaceholder}
              onKeyDown={(event) => {
                if (event.key === "Enter") goToCollectionFromSearch();
              }}
            />
            <button className="searchCloseBtn" onClick={() => setSearchOpen(false)} aria-label="Close search">
              ×
            </button>
          </div>

          <div className="searchOverlayContent">
            <div className="sectionHead">
              <div>
                <p className="eyebrow">{t.searchResults}</p>
                <h2 className="sectionTitle">{searchTerm ? searchTerm : t.wardrobeTitle}</h2>
              </div>
            </div>

            <div className="searchQuickLinks">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => {
                    setActiveFilter(filter);
                    if (filter === "All") setSearchTerm("");
                  }}
                >
                  {filterLabels[filter]}
                </button>
              ))}
            </div>

            {filteredProducts.length === 0 ? (
              <div className="emptyState" style={{ marginTop: 28 }}>
                {t.noResults}
              </div>
            ) : (
              <div className="searchResultsGrid">
                {filteredProducts.slice(0, 5).map((product) => (
                  <button
                    className="searchResultCard"
                    key={product.name}
                    onClick={() => {
                      openProduct(product);
                      setSearchOpen(false);
                    }}
                  >
                    <SmartImage sources={getProductImageSources(product, "front")} alt={product.name} loading="lazy" />
                    <div>
                      <span>{product.category}</span>
                      <h4>{product.name}</h4>
                      <p>{product.price}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {menuOpen && (
        <div className="menuOverlay" onClick={() => { setMenuOpen(false); setCollectionMenuOpen(false); }}>
          <aside className="menuPanel" onClick={(event) => event.stopPropagation()}>
            <button className="menuClose" onClick={() => { setMenuOpen(false); setCollectionMenuOpen(false); }} aria-label="Close menu">×</button>

            <div className="menuSearch">
              <SearchIcon />
              <input value={searchTerm} onFocus={openSearch} onChange={(event) => setSearchTerm(event.target.value)} placeholder={t.menuSearch} />
            </div>

            <nav className="menuLinks">
              <a href="#best" onClick={() => setMenuOpen(false)}>{t.bestTitle}</a>

              <div className="menuCollectionBlock">
                <button
                  type="button"
                  className="menuCollectionMain"
                  onClick={() => setCollectionMenuOpen((current) => !current)}
                  aria-expanded={collectionMenuOpen}
                >
                  <span>{t.navCollection}</span>
                  <span className={collectionMenuOpen ? "menuArrow open" : "menuArrow"} aria-hidden="true"></span>
                </button>

                <div className={collectionMenuOpen ? "menuCollectionDropdown open" : "menuCollectionDropdown"}>
                  <div className="menuCollectionDropdownInner">
                    <button className="menuCollectionAll" type="button" onClick={() => openCollectionGroup("All")}>
                      {t.fullCollection}
                    </button>
                    <div className="menuCollectionGrid">
                      {collectionMenuItems.map((item) => (
                        <button key={item.key} type="button" onClick={() => openCollectionGroup(item.key)}>
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <a href="#style" onClick={() => setMenuOpen(false)}>{t.styleFinder}</a>
              <button type="button" onClick={openSizeGuideFromMenu}>{t.sizeGuide}</button>
              <a href="#gift-card" onClick={() => setMenuOpen(false)}>{t.giftTitle}</a>
              <a href="#story" onClick={() => setMenuOpen(false)}>{t.navAbout}</a>
              <a href="#club" onClick={() => setMenuOpen(false)}>{t.privateList}</a>
              <a href={createWhatsAppLink("Hello La Grazia, I want styling help choosing a piece.")} target="_blank" rel="noreferrer">
                {t.whatsappStyling}
              </a>
            </nav>

            <div className="menuWishlist">
              <h3>{t.savedLooks} ({wishlist.length})</h3>
              {wishlistProducts.length === 0 ? (
                <p>{t.savedEmpty}</p>
              ) : (
                <div className="menuWishlistGrid">
                  {wishlistProducts.slice(0, 3).map((product) => (
                    <button
                      key={product.name}
                      className="menuWishlistCard"
                      onClick={() => {
                        openProduct(product);
                        setMenuOpen(false);
                      }}
                    >
                      <SmartImage sources={getProductImageSources(product, "front")} alt={product.name} loading="lazy" />
                      <span>{product.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>
      )}

      <div className={`${darkMode ? "page darkMode" : "page"} ${isArabic ? "arabic" : ""} ${loading ? "pageBehindDream" : "pageLogoDreamEnter"}`} id="top">
        <div className="topBar" aria-label={t.topBar}>
          <div className="topBarTrack">
            {[0, 1].map((group) => (
              <div className="topBarGroup" key={group} aria-hidden={group === 1}>
                {[0, 1, 2, 3].map((item) => (
                  <React.Fragment key={`${group}-${item}`}>
                    <span className="topBarItem">{t.topBar}</span>
                    <span className="topBarDivider" />
                  </React.Fragment>
                ))}
              </div>
            ))}
          </div>
        </div>

        <header className="nav">
          <div className="navInner">
            <div className="navLeft">
              <button className="iconBtn menuTrigger" onClick={() => setMenuOpen(true)} aria-label="Menu">
                <MenuIcon />
              </button>

              <nav className="navLinks">
                <a href="#story" onClick={() => setAccountPageOpen(false)}>{t.navAbout}</a>
              </nav>
            </div>

            <a href="#top" className="brandMark" onClick={() => setAccountPageOpen(false)}>
              <h1>LA GRAZIA</h1>
              <p>{t.womenOnly}</p>
            </a>

            <div className="navActions">
              <button className="iconBtn" onClick={openSearch} aria-label="Search">
                <SearchIcon />
              </button>

              <button className="iconBtn" onClick={() => setCartOpen(true)} aria-label="Bag">
                <BagIcon />
                {cart.length > 0 && (
                  <span className="cartBubble">
                    {cart.reduce((total, item) => total + item.quantity, 0)}
                  </span>
                )}
              </button>

              <button
                className={accountUser ? "pillBtn signInBtn signedAccountBtn" : "pillBtn signInBtn"}
                onClick={() => {
                  if (accountUser) {
                    setAccountPageOpen(true);
                    setAccountView("profile");
                    fetchUserOrders();
                    setMenuOpen(false);
                    setSearchOpen(false);
                    setCartOpen(false);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  } else {
                    setAuthMode("signIn");
                    setVerificationNotice("");
                    setSignInOpen(true);
                    setMenuOpen(false);
                    setSearchOpen(false);
                    setCartOpen(false);
                  }
                }}
                aria-label={accountUser ? t.myAccount : (isArabic ? "الحساب" : "Account")}
              >
                <span className="accountShortName">
                  <span className="accountAvatar" aria-hidden="true">
                    {accountUser ? accountInitials : <AccountIcon />}
                  </span>
                  <span className="accountDesktopLabel">
                    {accountUser ? t.myAccount : (isArabic ? "الحساب" : "Account")}
                  </span>
                </span>
              </button>

              <button className="pillBtn" onClick={() => setLanguage(isArabic ? "EN" : "AR")}>
                {isArabic ? "EN" : "AR"}
              </button>

              <button className="pillBtn" onClick={() => setDarkMode(!darkMode)}>
                {darkMode ? t.light : t.dark}
              </button>

            </div>
          </div>
        </header>

        {accountPageOpen && accountUser ? (
          <main className="accountPageMain">
            <section className="accountFullShell reveal visible">
              <aside className="accountFullHero">
                <div className="accountFullAvatar">{accountInitials}</div>
                <p className="eyebrow">{isArabic ? "حساب لا غراتسيا" : "La Grazia Account"}</p>
                <h2>{isArabic ? "مساحتك الخاصة" : "Your Private Profile"}</h2>
                <p>
                  {isArabic
                    ? "تابعي بياناتك وطلباتك وحالة التوصيل من صفحة واحدة مصممة بأسلوب لا غراتسيا."
                    : "Track your details, pre-orders, and delivery status from one elegant La Grazia space."}
                </p>

                <div className="accountFullDetails">
                  <div className="accountFullDetail">
                    <small>{isArabic ? "الاسم" : "Name"}</small>
                    <strong>{accountUser.name}</strong>
                  </div>
                  <div className="accountFullDetail">
                    <small>{isArabic ? "الإيميل" : "Email"}</small>
                    <strong>{accountUser.email}</strong>
                  </div>
                  <div className="accountFullDetail">
                    <small>{isArabic ? "الهاتف" : "Phone"}</small>
                    <strong>{accountUser.phone || (isArabic ? "غير مضاف" : "Not added")}</strong>
                  </div>
                </div>

                <div className="accountFullActions">
                  <button className="secondaryBtn" onClick={() => { setAccountPageOpen(false); window.setTimeout(() => document.getElementById("collection")?.scrollIntoView({ behavior: "smooth" }), 80); }}>
                    {isArabic ? "تسوقي الآن" : "Continue Shopping"}
                  </button>
                  <button className="primaryBtn" onClick={handleSignOut}>
                    {t.signOut}
                  </button>
                </div>
              </aside>

              <div className="accountFullContent">
                <div className="accountFullTabs">
                  <button
                    type="button"
                    className={accountView === "profile" ? "accountFullTab active" : "accountFullTab"}
                    onClick={() => setAccountView("profile")}
                  >
                    {isArabic ? "الملف الشخصي" : "Profile"}
                  </button>
                  <button
                    type="button"
                    className={accountView === "orders" ? "accountFullTab active" : "accountFullTab"}
                    onClick={() => { setAccountView("orders"); fetchUserOrders(); }}
                  >
                    {isArabic ? "حجوزاتي المسبقة" : "My Pre-Orders"}
                  </button>
                  {canAccessAdmin && (
                    <button
                      type="button"
                      className={accountView === "admin" ? "accountFullTab active adminTab" : "accountFullTab adminTab"}
                      onClick={() => { setAccountView("admin"); fetchAdminOrders(); }}
                    >
                      {isArabic ? "لوحة التحكم" : "Admin"}
                    </button>
                  )}
                </div>

                {accountView === "profile" ? (
                  <>
                    <div className="accountPageTitleRow">
                      <div>
                        <p className="eyebrow">{isArabic ? "بيانات الحساب" : "Account Details"}</p>
                        <h3>{isArabic ? "بياناتك المحفوظة" : "Saved Profile"}</h3>
                        <p>{isArabic ? "هذه البيانات تساعدنا على تسهيل الدفع والتوصيل." : "These details help speed up checkout and delivery."}</p>
                      </div>
                    </div>

                    <div className="accountProfileGrid">
                      <div className="accountProfileCard">
                        <small>{isArabic ? "الاسم" : "Name"}</small>
                        <strong>{accountUser.name}</strong>
                      </div>
                      <div className="accountProfileCard">
                        <small>{isArabic ? "الإيميل" : "Email"}</small>
                        <strong>{accountUser.email}</strong>
                      </div>
                      <div className="accountProfileCard">
                        <small>{isArabic ? "رقم الهاتف" : "Phone"}</small>
                        <strong>{accountUser.phone || (isArabic ? "غير مضاف" : "Not added")}</strong>
                      </div>
                    </div>

                    <form className="profileEditPanel" onSubmit={saveProfileDetails}>
                      <div className="miniSectionHead">
                        <div>
                          <span>{isArabic ? "تعديل البيانات" : "Edit Profile"}</span>
                          <strong>{isArabic ? "بيانات الحساب والتوصيل" : "Account and delivery details"}</strong>
                        </div>
                        <button type="submit" className="luxurySmallBtn" disabled={profileSaving}>
                          {profileSaving ? (isArabic ? "جاري الحفظ..." : "Saving...") : (isArabic ? "حفظ البيانات" : "Save Details")}
                        </button>
                      </div>
                      <div className="profileFormGrid">
                        <label><span>{isArabic ? "الاسم" : "Name"}</span><input value={profileForm.name} onChange={(event) => setProfileForm((current) => ({ ...current, name: event.target.value }))} /></label>
                        <label><span>{isArabic ? "الإيميل" : "Email"}</span><input value={profileForm.email} disabled /></label>
                        <label><span>{isArabic ? "الهاتف" : "Phone"}</span><input value={profileForm.phone} onChange={(event) => setProfileForm((current) => ({ ...current, phone: event.target.value }))} /></label>
                        <label><span>{isArabic ? "المدينة" : "City"}</span><input value={profileForm.city} onChange={(event) => setProfileForm((current) => ({ ...current, city: event.target.value }))} /></label>
                        <label><span>{isArabic ? "المنطقة" : "Area"}</span><input value={profileForm.area} onChange={(event) => setProfileForm((current) => ({ ...current, area: event.target.value }))} /></label>
                        <label><span>{isArabic ? "العنوان" : "Street / Address"}</span><input value={profileForm.addressLine} onChange={(event) => setProfileForm((current) => ({ ...current, addressLine: event.target.value }))} /></label>
                        <label><span>{isArabic ? "المبنى" : "Building"}</span><input value={profileForm.building} onChange={(event) => setProfileForm((current) => ({ ...current, building: event.target.value }))} /></label>
                        <label><span>{isArabic ? "الدور" : "Floor"}</span><input value={profileForm.floor} onChange={(event) => setProfileForm((current) => ({ ...current, floor: event.target.value }))} /></label>
                        <label><span>{isArabic ? "الشقة" : "Apartment"}</span><input value={profileForm.apartment} onChange={(event) => setProfileForm((current) => ({ ...current, apartment: event.target.value }))} /></label>
                        <label className="profileWide"><span>{isArabic ? "ملاحظات التوصيل" : "Delivery Notes"}</span><input value={profileForm.deliveryNotes} onChange={(event) => setProfileForm((current) => ({ ...current, deliveryNotes: event.target.value }))} /></label>
                      </div>
                    </form>

                    <div className="addressBookPanel">
                      <div className="miniSectionHead">
                        <div>
                          <span>{isArabic ? "دفتر العناوين" : "Address Book"}</span>
                          <strong>{isArabic ? "اختاري عنوان التوصيل الافتراضي" : "Choose your default delivery address"}</strong>
                        </div>
                        <button type="button" className="luxurySmallBtn secondary" onClick={resetAddressForm}>
                          {isArabic ? "عنوان جديد" : "New Address"}
                        </button>
                      </div>

                      <div className="addressCardsGrid">
                        {addresses.length === 0 ? (
                          <div className="emptyAddressCard">
                            {isArabic ? "لا توجد عناوين محفوظة بعد. أضيفي عنوانك لتسريع الدفع." : "No saved addresses yet. Add your delivery address to speed up checkout."}
                          </div>
                        ) : addresses.map((address) => (
                          <article className={address.is_default ? "addressCard default" : "addressCard"} key={address.id}>
                            <div>
                              <small>{address.is_default ? (isArabic ? "افتراضي" : "Default") : (address.label || "Address")}</small>
                              <strong>{address.label || "Home"}</strong>
                              <p>{address.full_name || accountUser.name} · {address.phone || accountUser.phone}</p>
                              <p>{[address.area, address.street, address.city].filter(Boolean).join(" · ")}</p>
                              <p>{[address.building && `Bldg ${address.building}`, address.floor && `Floor ${address.floor}`, address.apartment && `Apt ${address.apartment}`].filter(Boolean).join(" · ")}</p>
                            </div>
                            <div className="addressActions">
                              {!address.is_default && <button type="button" onClick={() => makeDefaultAddress(address)}>{isArabic ? "افتراضي" : "Default"}</button>}
                              <button type="button" onClick={() => startEditAddress(address)}>{isArabic ? "تعديل" : "Edit"}</button>
                              <button type="button" onClick={() => deleteAddress(address.id)}>{isArabic ? "حذف" : "Delete"}</button>
                            </div>
                          </article>
                        ))}
                      </div>

                      <form className="addressFormPanel" onSubmit={saveAddress}>
                        <div className="miniSectionHead compact">
                          <div>
                            <span>{editingAddressId ? (isArabic ? "تعديل عنوان" : "Edit Address") : (isArabic ? "إضافة عنوان" : "Add Address")}</span>
                            <strong>{isArabic ? "سيستخدم في Paymob وواتساب" : "Used for Paymob and WhatsApp checkout"}</strong>
                          </div>
                        </div>
                        <div className="profileFormGrid">
                          <label><span>{isArabic ? "اسم العنوان" : "Label"}</span><input value={addressForm.label} onChange={(event) => setAddressForm((current) => ({ ...current, label: event.target.value }))} /></label>
                          <label><span>{isArabic ? "اسم المستلم" : "Receiver Name"}</span><input value={addressForm.fullName} onChange={(event) => setAddressForm((current) => ({ ...current, fullName: event.target.value }))} /></label>
                          <label><span>{isArabic ? "الهاتف" : "Phone"}</span><input value={addressForm.phone} onChange={(event) => setAddressForm((current) => ({ ...current, phone: event.target.value }))} /></label>
                          <label><span>{isArabic ? "المدينة" : "City"}</span><input value={addressForm.city} onChange={(event) => setAddressForm((current) => ({ ...current, city: event.target.value }))} /></label>
                          <label><span>{isArabic ? "المنطقة" : "Area"}</span><input value={addressForm.area} onChange={(event) => setAddressForm((current) => ({ ...current, area: event.target.value }))} /></label>
                          <label><span>{isArabic ? "الشارع" : "Street"}</span><input value={addressForm.street} onChange={(event) => setAddressForm((current) => ({ ...current, street: event.target.value }))} /></label>
                          <label><span>{isArabic ? "المبنى" : "Building"}</span><input value={addressForm.building} onChange={(event) => setAddressForm((current) => ({ ...current, building: event.target.value }))} /></label>
                          <label><span>{isArabic ? "الدور" : "Floor"}</span><input value={addressForm.floor} onChange={(event) => setAddressForm((current) => ({ ...current, floor: event.target.value }))} /></label>
                          <label><span>{isArabic ? "الشقة" : "Apartment"}</span><input value={addressForm.apartment} onChange={(event) => setAddressForm((current) => ({ ...current, apartment: event.target.value }))} /></label>
                          <label className="profileWide"><span>{isArabic ? "ملاحظات" : "Notes"}</span><input value={addressForm.deliveryNotes} onChange={(event) => setAddressForm((current) => ({ ...current, deliveryNotes: event.target.value }))} /></label>
                        </div>
                        <label className="defaultCheck"><input type="checkbox" checked={addressForm.isDefault} onChange={(event) => setAddressForm((current) => ({ ...current, isDefault: event.target.checked }))} /> {isArabic ? "استخدامه كعنوان افتراضي" : "Use as default address"}</label>
                        <div className="addressFormActions">
                          <button type="submit" className="primaryBtn" disabled={addressSaving}>{addressSaving ? (isArabic ? "جاري الحفظ..." : "Saving...") : editingAddressId ? (isArabic ? "حفظ التعديل" : "Save Changes") : (isArabic ? "حفظ العنوان" : "Save Address")}</button>
                          <button type="button" className="secondaryBtn" onClick={resetAddressForm}>{isArabic ? "إلغاء" : "Cancel"}</button>
                        </div>
                      </form>
                    </div>

                    <div className="supportPanel">
                      <div className="miniSectionHead">
                        <div>
                          <span>{isArabic ? "الدعم" : "Support"}</span>
                          <strong>{isArabic ? "تواصلي مع لا غراتسيا" : "Contact La Grazia"}</strong>
                        </div>
                        <button type="button" className="luxurySmallBtn secondary" onClick={() => fetchUserSupportMessages()}>
                          {supportLoading ? (isArabic ? "جاري التحديث..." : "Refreshing...") : (isArabic ? "تحديث" : "Refresh")}
                        </button>
                      </div>

                      <form className="supportFormPanel" onSubmit={submitSupportMessage}>
                        <div className="profileFormGrid">
                          <label>
                            <span>{isArabic ? "الموضوع" : "Subject"}</span>
                            <select value={supportForm.subject} onChange={(event) => setSupportForm((current) => ({ ...current, subject: event.target.value }))}>
                              <option>Order Question</option>
                              <option>Product Question</option>
                              <option>Payment Question</option>
                              <option>Delivery Question</option>
                              <option>Return / Exchange</option>
                              <option>Other</option>
                            </select>
                          </label>
                          <label>
                            <span>{isArabic ? "رقم الحجز المسبق" : "Pre-Order Reference"}</span>
                            <input value={supportForm.relatedOrderReference} onChange={(event) => setSupportForm((current) => ({ ...current, relatedOrderReference: event.target.value }))} placeholder="LG-..." />
                          </label>
                          <label>
                            <span>{isArabic ? "اسم المنتج" : "Product Name"}</span>
                            <input value={supportForm.relatedProductName} onChange={(event) => setSupportForm((current) => ({ ...current, relatedProductName: event.target.value }))} placeholder={isArabic ? "اختياري" : "Optional"} />
                          </label>
                          <label className="profileWide">
                            <span>{isArabic ? "رسالتك" : "Message"}</span>
                            <textarea value={supportForm.message} onChange={(event) => setSupportForm((current) => ({ ...current, message: event.target.value }))} placeholder={isArabic ? "اكتبي تفاصيل الحجز المسبق أو سؤالك..." : "Write your pre-order question, product question, or support request..."} />
                          </label>
                        </div>
                        <div className="addressFormActions">
                          <button type="submit" className="primaryBtn" disabled={supportSubmitting}>
                            {supportSubmitting ? (isArabic ? "جاري الإرسال..." : "Sending...") : (isArabic ? "إرسال للدعم" : "Send to Support")}
                          </button>
                          <a className="secondaryBtn" href={createWhatsAppLink("Hello La Grazia, I need support with my account/pre-order.")} target="_blank" rel="noreferrer">
                            {isArabic ? "واتساب" : "WhatsApp"}
                          </a>
                        </div>
                      </form>

                      <div className="supportMessagesList">
                        {supportMessages.length === 0 ? (
                          <div className="emptyAddressCard">
                            {isArabic ? "لا توجد رسائل دعم بعد." : "No support messages yet."}
                          </div>
                        ) : supportMessages.map((message) => (
                          <article className="supportMessageCard" key={message.id}>
                            <div className="adminReviewTop">
                              <div>
                                <small>{new Date(message.created_at).toLocaleDateString()}</small>
                                <strong>{message.subject}</strong>
                                <span>{[message.related_order_reference, message.related_product_name].filter(Boolean).join(" · ") || (isArabic ? "طلب دعم عام" : "General support request")}</span>
                              </div>
                              <span className={message.status === "Closed" ? "reviewApprovalPill approved" : "reviewApprovalPill pending"}>{message.status}</span>
                            </div>
                            <p>{message.message}</p>
                            {message.admin_note && <p className="supportAdminNote"><b>{isArabic ? "رد الإدارة:" : "Admin note:"}</b> {message.admin_note}</p>}
                          </article>
                        ))}
                      </div>
                    </div>
                  </>
                ) : accountView === "orders" ? (
                  <>
                    <div className="accountPageTitleRow">
                      <div>
                        <p className="eyebrow">{isArabic ? "تتبع الحجوزات المسبقة" : "Pre-Order Tracking"}</p>
                        <h3>{isArabic ? "حجوزاتي المسبقة" : "My Pre-Orders"}</h3>
                        <p>
                          {isArabic
                            ? "اسحبي يميناً أو يساراً لمشاهدة كل الطلبات عند وجود أكثر من طلب."
                            : "Swipe or slide sideways to browse all pre-orders when you have more than one."}
                        </p>
                      </div>
                      <button className="secondaryBtn" onClick={() => fetchUserOrders()}>
                        {isArabic ? "تحديث" : "Refresh"}
                      </button>
                    </div>

                    {accountOrders.length === 0 ? (
                      <div className="noOrdersBox">
                        <strong>{isArabic ? "لا توجد حجوزات مسبقة حتى الآن" : "No pre-orders yet"}</strong>
                        <span>{isArabic ? "عند بدء الحجز المسبق، سيظهر طلبك هنا لتتبعي حالته." : "When you start a pre-order, it will appear here so you can track it."}</span>
                      </div>
                    ) : (
                      <div className="accountOrdersCarousel" aria-label="Pre-order history">
                        {accountOrders.map((order) => {
                          const statusSteps = ["Pending Payment", "Paid", "Preparing", "Out for Delivery", "Delivered"];
                          const activeIndex = Math.max(0, statusSteps.findIndex((step) => step === order.order_status));

                          return (
                            <div className="accountOrderSlide" key={order.id}>
                              <div className="orderCard">
                                <div className="orderCardTop">
                                  <div>
                                    <small>{isArabic ? "رقم الحجز المسبق" : "Pre-Order"}</small>
                                    <strong>{order.order_reference}</strong>
                                  </div>
                                  <span className="orderStatusPill">{order.order_status}</span>
                                </div>

                                <div className="orderMetaGrid">
                                  <span>{isArabic ? "الدفع" : "Payment"}: {order.payment_status}</span>
                                  <span>{isArabic ? "الإجمالي" : "Total"}: {order.currency} {Number(order.total_amount || 0).toLocaleString()}</span>
                                  <span>{new Date(order.created_at).toLocaleDateString()}</span>
                                </div>

                                <div className="trackSteps">
                                  {statusSteps.map((step, stepIndex) => (
                                    <span key={step} className={stepIndex <= activeIndex ? "trackStep active" : "trackStep"}>
                                      {step}
                                    </span>
                                  ))}
                                </div>

                                <div className="orderItemsList">
                                  {order.order_items?.map((item) => (
                                    <div className="orderMiniItem" key={item.id}>
                                      {item.product_image && <img src={item.product_image} alt={item.product_name} />}
                                      <div>
                                        <strong>{item.product_name}</strong>
                                        <span>Size: {item.size || "M"} · Color: {item.color || "Cream"} · Qty: {item.quantity}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                ) : accountView === "admin" && canAccessAdmin ? (
                  <>
                    <div className="accountPageTitleRow">
                      <div>
                        <p className="eyebrow">{isArabic ? "إدارة الطلبات" : "Admin Dashboard"}</p>
                        <h3>{isArabic ? "كل حجوزات لا غراتسيا المسبقة" : "All La Grazia Pre-Orders"}</h3>
                        <p>
                          {isArabic
                            ? "تابع كل الطلبات وغيّر حالة الطلب من لوحة واحدة."
                            : "View every pre-order and update its tracking status from one elegant dashboard."}
                        </p>
                      </div>
                      <button className="secondaryBtn" onClick={fetchAdminOrders}>
                        {adminLoading ? (isArabic ? "جاري التحديث..." : "Refreshing...") : (isArabic ? "تحديث" : "Refresh")}
                      </button>
                    </div>

                    <div className="adminStatsGrid">
                      <div className="adminStatCard"><small>{isArabic ? "كل الحجوزات المسبقة" : "Total Pre-Orders"}</small><strong>{adminOrders.length}</strong></div>
                      <div className="adminStatCard"><small>{isArabic ? "مدفوعة" : "Paid"}</small><strong>{adminOrders.filter((order) => order.payment_status === "paid").length}</strong></div>
                      <div className="adminStatCard"><small>{isArabic ? "قيد التجهيز" : "Preparing"}</small><strong>{adminOrders.filter((order) => order.order_status === "Preparing").length}</strong></div>
                    </div>

                    {adminOrders.length === 0 ? (
                      <div className="noOrdersBox">
                        <strong>{isArabic ? "لا توجد حجوزات مسبقة بعد" : "No pre-orders yet"}</strong>
                        <span>{isArabic ? "كل حجز مسبق جديد سيظهر هنا." : "Every new customer pre-order will appear here."}</span>
                      </div>
                    ) : (
                      <div className="adminOrdersList">
                        {adminOrders.map((order) => (
                          <article className="adminOrderCard" key={order.id}>
                            <div className="adminOrderTop">
                              <div>
                                <small>{isArabic ? "رقم الحجز المسبق" : "Pre-Order"}</small>
                                <strong>{order.order_reference}</strong>
                                <span>{new Date(order.created_at).toLocaleString()}</span>
                              </div>
                              <span className="orderStatusPill">{order.order_status}</span>
                            </div>

                            <div className="adminCustomerGrid">
                              <span><b>{isArabic ? "العميل" : "Customer"}:</b> {order.customer_name || "La Grazia Client"}</span>
                              <span><b>{isArabic ? "الإيميل" : "Email"}:</b> {order.customer_email || "-"}</span>
                              <span><b>{isArabic ? "الهاتف" : "Phone"}:</b> {order.customer_phone || "-"}</span>
                              <span><b>{isArabic ? "الإجمالي" : "Total"}:</b> {order.currency} {Number(order.total_amount || 0).toLocaleString()}</span>
                              <span><b>{isArabic ? "الدفع" : "Payment"}:</b> {order.payment_status}</span>
                            </div>

                            <div className="adminOrderItems">
                              {order.order_items?.map((item) => (
                                <div className="orderMiniItem" key={item.id}>
                                  {item.product_image && <img src={item.product_image} alt={item.product_name} />}
                                  <div>
                                    <strong>{item.product_name}</strong>
                                    <span>Size: {item.size || "M"} · Color: {item.color || "Cream"} · Qty: {item.quantity}</span>
                                  </div>
                                </div>
                              ))}
                            </div>

                            <div className="adminStatusButtons">
                              {["Pending Payment", "Paid", "Preparing", "Out for Delivery", "Delivered", "Cancelled"].map((status) => (
                                <button
                                  type="button"
                                  key={status}
                                  className={order.order_status === status ? "statusUpdateBtn active" : "statusUpdateBtn"}
                                  onClick={() => updateAdminOrderStatus(order.id, status)}
                                >
                                  {status}
                                </button>
                              ))}
                            </div>
                          </article>
                        ))}
                      </div>
                    )}

                    <div className="adminProductsPanel supportAdminPanel">
                      <div className="accountPageTitleRow productAdminHeader">
                        <div>
                          <p className="eyebrow">{isArabic ? "رسائل الدعم" : "Support Messages"}</p>
                          <h3>{isArabic ? "رسائل العملاء" : "Customer Support Inbox"}</h3>
                          <p>
                            {isArabic
                              ? "راجعي رسائل العملاء وغيّري حالتها من نفس لوحة الإدارة."
                              : "Review customer messages and update their support status from the admin dashboard."}
                          </p>
                        </div>
                        <button className="secondaryBtn" type="button" onClick={fetchAdminSupportMessages}>
                          {adminSupportLoading ? (isArabic ? "جاري التحديث..." : "Refreshing...") : (isArabic ? "تحديث الرسائل" : "Refresh Messages")}
                        </button>
                      </div>

                      <div className="adminStatsGrid">
                        <div className="adminStatCard"><small>{isArabic ? "كل الرسائل" : "Total Messages"}</small><strong>{adminSupportMessages.length}</strong></div>
                        <div className="adminStatCard"><small>{isArabic ? "مفتوحة" : "Open"}</small><strong>{adminSupportMessages.filter((message) => message.status === "Open").length}</strong></div>
                        <div className="adminStatCard"><small>{isArabic ? "مغلقة" : "Closed"}</small><strong>{adminSupportMessages.filter((message) => message.status === "Closed").length}</strong></div>
                      </div>

                      {adminSupportMessages.length === 0 ? (
                        <div className="noOrdersBox">
                          <strong>{isArabic ? "لا توجد رسائل دعم" : "No support messages yet"}</strong>
                          <span>{isArabic ? "أي رسالة من عميل ستظهر هنا." : "Every customer support message will appear here."}</span>
                        </div>
                      ) : (
                        <div className="adminReviewsList">
                          {adminSupportMessages.map((message) => (
                            <article className="adminReviewCard supportAdminCard" key={message.id}>
                              <div className="adminReviewTop">
                                <div>
                                  <small>{new Date(message.created_at).toLocaleString()}</small>
                                  <strong>{message.subject}</strong>
                                  <span>{message.customer_name || "La Grazia Client"} · {message.customer_email || "-"} · {message.customer_phone || "-"}</span>
                                </div>
                                <span className={message.status === "Closed" ? "reviewApprovalPill approved" : "reviewApprovalPill pending"}>{message.status}</span>
                              </div>
                              <div className="adminOrderInfoGrid">
                                <span><b>{isArabic ? "حجز مسبق" : "Pre-Order"}:</b> {message.related_order_reference || "-"}</span>
                                <span><b>{isArabic ? "منتج" : "Product"}:</b> {message.related_product_name || "-"}</span>
                              </div>
                              <p>{message.message}</p>
                              <label className="adminNoteField">
                                <span>{isArabic ? "ملاحظة الإدارة" : "Admin Note"}</span>
                                <textarea
                                  defaultValue={message.admin_note || ""}
                                  onBlur={(event) => updateSupportAdminNote(message.id, event.target.value)}
                                  placeholder={isArabic ? "اكتبي ملاحظة داخلية أو رد مختصر..." : "Write an internal note or short response..."}
                                />
                              </label>
                              <div className="adminStatusButtons">
                                {["Open", "Replied", "Closed"].map((status) => (
                                  <button
                                    type="button"
                                    key={status}
                                    className={message.status === status ? "statusUpdateBtn active" : "statusUpdateBtn"}
                                    onClick={() => updateSupportMessageStatus(message.id, status)}
                                  >
                                    {status}
                                  </button>
                                ))}
                                <button type="button" className="statusUpdateBtn danger" onClick={() => deleteSupportMessage(message.id)}>
                                  {isArabic ? "حذف" : "Delete"}
                                </button>
                              </div>
                            </article>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="adminProductsPanel reviewAdminPanel">
                      <div className="accountPageTitleRow productAdminHeader">
                        <div>
                          <p className="eyebrow">{isArabic ? "إدارة التقييمات" : "Review Management"}</p>
                          <h3>{isArabic ? "تقييمات العملاء" : "Customer Reviews"}</h3>
                          <p>
                            {isArabic
                              ? "راجعي التقييمات قبل ظهورها على صفحات المنتجات."
                              : "Approve, hide, or delete customer reviews before they appear publicly."}
                          </p>
                        </div>
                        <button className="secondaryBtn" type="button" onClick={fetchAdminReviews}>
                          {isArabic ? "تحديث التقييمات" : "Refresh Reviews"}
                        </button>
                      </div>

                      {allReviews.length === 0 ? (
                        <div className="noOrdersBox">
                          <strong>{isArabic ? "لا توجد تقييمات بعد" : "No reviews yet"}</strong>
                          <span>{isArabic ? "أي تقييم جديد سيظهر هنا للمراجعة." : "Every submitted product review will appear here for approval."}</span>
                        </div>
                      ) : (
                        <div className="adminReviewsList">
                          {allReviews.map((review) => (
                            <article className="adminReviewCard" key={review.id}>
                              <div className="adminReviewTop">
                                <div>
                                  <small>{review.product_name}</small>
                                  <strong>{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</strong>
                                  <span>{review.customer_name || "La Grazia Client"} · {review.customer_email || "-"}</span>
                                </div>
                                <span className={review.is_approved ? "reviewApprovalPill approved" : "reviewApprovalPill pending"}>
                                  {review.is_approved ? (isArabic ? "ظاهر" : "Approved") : (isArabic ? "قيد المراجعة" : "Pending")}
                                </span>
                              </div>
                              <p>{review.review_text}</p>
                              <div className="adminStatusButtons">
                                <button type="button" className="statusUpdateBtn active" onClick={() => updateReviewApproval(review.id, true)}>
                                  {isArabic ? "قبول" : "Approve"}
                                </button>
                                <button type="button" className="statusUpdateBtn" onClick={() => updateReviewApproval(review.id, false)}>
                                  {isArabic ? "إخفاء" : "Hide"}
                                </button>
                                <button type="button" className="statusUpdateBtn danger" onClick={() => deleteReview(review.id)}>
                                  {isArabic ? "حذف" : "Delete"}
                                </button>
                              </div>
                            </article>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="adminProductsPanel">
                      <div className="accountPageTitleRow productAdminHeader">
                        <div>
                          <p className="eyebrow">{isArabic ? "إدارة المنتجات" : "Product Management"}</p>
                          <h3>{isArabic ? "منتجات لا غراتسيا" : "La Grazia Products"}</h3>
                          <p>
                            {isArabic
                              ? "أضيفي أو عدّلي أو أخفي المنتجات بدون تغيير الكود."
                              : "Add, edit, hide, or remove products without touching the code."}
                          </p>
                        </div>
                        <button className="secondaryBtn" type="button" onClick={fetchAdminProducts}>
                          {adminProductsLoading ? (isArabic ? "جاري التحديث..." : "Refreshing...") : (isArabic ? "تحديث المنتجات" : "Refresh Products")}
                        </button>
                      </div>

                      <form className="adminProductForm" onSubmit={saveProduct}>
                        <div className="adminProductFormHead">
                          <strong>{editingProductId ? (isArabic ? "تعديل منتج" : "Edit Product") : (isArabic ? "إضافة منتج" : "Add Product")}</strong>
                          {editingProductId && (
                            <button type="button" className="ghostSmallBtn" onClick={resetProductForm}>
                              {isArabic ? "إلغاء التعديل" : "Cancel Edit"}
                            </button>
                          )}
                        </div>

                        <div className="adminProductGrid">
                          <label><span>{isArabic ? "اسم المنتج" : "Product Name"}</span><input value={productForm.name} onChange={(event) => setProductForm((current) => ({ ...current, name: event.target.value }))} /></label>
                          <label><span>{isArabic ? "السعر النصي" : "Display Price"}</span><input value={productForm.price} onChange={(event) => setProductForm((current) => ({ ...current, price: event.target.value }))} placeholder="EGP 1,900 - 2,400" /></label>
                          <label><span>{isArabic ? "السعر للدفع" : "Payment Price"}</span><input type="number" value={productForm.minPrice} onChange={(event) => setProductForm((current) => ({ ...current, minPrice: event.target.value }))} /></label>
                          <label><span>{isArabic ? "التصنيف" : "Category"}</span><input value={productForm.category} onChange={(event) => setProductForm((current) => ({ ...current, category: event.target.value }))} /></label>
                          <label><span>{isArabic ? "الصورة" : "Image Path"}</span><input value={productForm.image} onChange={(event) => setProductForm((current) => ({ ...current, image: event.target.value }))} placeholder="/photos/jacket-1-front.jpeg" /></label>
                          <label><span>{isArabic ? "العلامة" : "Tag"}</span><input value={productForm.tag} onChange={(event) => setProductForm((current) => ({ ...current, tag: event.target.value }))} /></label>
                          <label><span>{isArabic ? "المناسبة" : "Occasion"}</span><input value={productForm.occasion} onChange={(event) => setProductForm((current) => ({ ...current, occasion: event.target.value }))} /></label>
                          <label><span>{isArabic ? "الترتيب" : "Sort Order"}</span><input type="number" value={productForm.sortOrder} onChange={(event) => setProductForm((current) => ({ ...current, sortOrder: event.target.value }))} /></label>
                          <label className="wideField"><span>{isArabic ? "الألوان" : "Colors"}</span><input value={productForm.colors} onChange={(event) => setProductForm((current) => ({ ...current, colors: event.target.value }))} placeholder="Cream, White, Beige" /></label>
                          <label className="wideField"><span>{isArabic ? "تنسيق القطعة" : "Complete With"}</span><input value={productForm.complete} onChange={(event) => setProductForm((current) => ({ ...current, complete: event.target.value }))} placeholder="Gold earrings, Mini bag" /></label>
                          <label className="wideField"><span>{isArabic ? "الوصف" : "Description"}</span><textarea value={productForm.description} onChange={(event) => setProductForm((current) => ({ ...current, description: event.target.value }))} /></label>
                          <label className="productActiveSwitch">
                            <input type="checkbox" checked={productForm.isActive} onChange={(event) => setProductForm((current) => ({ ...current, isActive: event.target.checked }))} />
                            <span>{isArabic ? "ظاهر في الموقع" : "Visible on website"}</span>
                          </label>
                        </div>

                        <button className="primaryBtn adminProductSave" type="submit" disabled={productSaving}>
                          {productSaving ? (isArabic ? "جاري الحفظ..." : "Saving...") : editingProductId ? (isArabic ? "حفظ التعديل" : "Save Changes") : (isArabic ? "إضافة المنتج" : "Add Product")}
                        </button>
                      </form>

                      <div className="adminProductsList">
                        {adminProducts.length === 0 ? (
                          <div className="noOrdersBox">
                            <strong>{isArabic ? "لا توجد منتجات" : "No products found"}</strong>
                            <span>{isArabic ? "أضيفي أول منتج من النموذج بالأعلى." : "Add your first product from the form above."}</span>
                          </div>
                        ) : (
                          adminProducts.map((product) => (
                            <article className={product.is_active ? "adminProductCard" : "adminProductCard hiddenProduct"} key={product.id}>
                              <SmartImage sources={getProductImageSources(product, "front")} alt={product.name} loading="lazy" />
                              <div>
                                <small>{product.category} · {product.tag}</small>
                                <strong>{product.name}</strong>
                                <span>{product.price} · Sort {product.sort_order || 0}</span>
                                <p>{product.description}</p>
                                <div className="adminProductActions">
                                  <button type="button" onClick={() => startEditProduct(product)}>{isArabic ? "تعديل" : "Edit"}</button>
                                  <button type="button" onClick={() => toggleProductActive(product)}>{product.is_active ? (isArabic ? "إخفاء" : "Hide") : (isArabic ? "إظهار" : "Show")}</button>
                                  <button type="button" className="dangerBtn" onClick={() => deleteProduct(product.id)}>{isArabic ? "حذف" : "Delete"}</button>
                                </div>
                              </div>
                            </article>
                          ))
                        )}
                      </div>
                    </div>
                  </>
                ) : null}
              </div>
            </section>
          </main>
        ) : (
        <main>
          <section className="hero">
            <div className="heroCopy">
              <p className="eyebrow">{t.heroEyebrow}</p>
              <h2>{t.heroTitle}</h2>
              <p className="description">{t.heroDescription}</p>
              <p className="preOrderNotice">{t.preOrderNotice}</p>

              <div
                className={launchCountdown.isFinished ? "launchCountdown finished" : "launchCountdown"}
                aria-label={isArabic ? "العد التنازلي للإطلاق" : "Launch countdown"}
                aria-live="polite"
              >
                <div className="launchCountdownHeader">
                  <div>
                    <span>{isArabic ? "العد التنازلي للإطلاق" : "Official Launch Countdown"}</span>
                    <p>{isArabic ? "الإطلاق الرسمي · ٥ يوليو ٢٠٢٦ · ١١:٥٩ مساءً بتوقيت مصر" : "Official launch · 5 July 2026 · 11:59 PM Egypt time"}</p>
                  </div>
                  <strong>{launchCountdown.isFinished ? (isArabic ? "تم الإطلاق" : "Launched") : (isArabic ? "الحجز المسبق مفتوح" : "Pre-Order Open")}</strong>
                </div>
                <div className="launchCountdownGrid">
                  {[
                    { key: "days", label: isArabic ? "يوم" : "Days", value: launchCountdown.days },
                    { key: "hours", label: isArabic ? "ساعة" : "Hours", value: launchCountdown.hours },
                    { key: "minutes", label: isArabic ? "دقيقة" : "Minutes", value: launchCountdown.minutes },
                    { key: "seconds", label: isArabic ? "ثانية" : "Seconds", value: launchCountdown.seconds },
                  ].map((unit) => (
                    <div className={`countdownUnit countdownUnit-${unit.key}`} key={unit.key}>
                      <strong>{String(unit.value).padStart(2, "0")}</strong>
                      <span>{unit.label}</span>
                    </div>
                  ))}
                </div>
                <p className="launchCountdownFooter">
                  {launchCountdown.isFinished
                    ? (isArabic ? "المجموعة أصبحت متاحة الآن." : "The collection is now officially live.")
                    : (isArabic ? "كل الطلبات قبل الإطلاق تظل محفوظة حتى انتهاء العد التنازلي." : "Every pre-order stays reserved until the countdown reaches zero.")}
                </p>
              </div>

              <div className="actions">
                <a className="primaryBtn" href="#collection">{t.shopCollection}</a>
                <a className="secondaryBtn" href="#style">{t.findLook}</a>
              </div>
            </div>

            <div className="heroVisual">
              <SmartImage sources={["/photos/hero-piece.png", "/photos/hero-piece.jpeg"]} alt="La Grazia hero piece" loading="eager" />
              <div className="heroCard">
                <small>{t.signatureEdit}</small>
                <strong>{t.signatureText}</strong>
              </div>
            </div>
          </section>

          <div className="trustBar reveal">
            <div className="trustItem"><span className="trustIcon">01</span><p>{t.trustDelivery}</p></div>
            <div className="trustItem"><span className="trustIcon">02</span><p>{t.trustExchange}</p></div>
            <div className="trustItem"><span className="trustIcon">03</span><p>{t.trustStyling}</p></div>
            <div className="trustItem"><span className="trustIcon">04</span><p>{t.trustDrops}</p></div>
          </div>

          <section className="section reveal" id="best">
            <div className="sectionHead">
              <div>
                <p className="eyebrow">{t.mostLoved}</p>
                <h2 className="sectionTitle">{t.bestTitle}</h2>
                <p className="sectionIntro">{t.bestIntro}</p>
              </div>
              <a className="secondaryBtn" href="#collection">{t.viewAll}</a>
            </div>

            <div className="productGrid">
              {bestSellers.map((product) => (
                <ProductCard
                  key={product.name}
                  product={product}
                  onOpen={openProduct}
                  onAdd={addToCart}
                  onWishlist={toggleWishlist}
                  isWishlisted={wishlist.includes(product.name)}
                  language={language}
                />
              ))}
            </div>
          </section>

          <section className="section reveal" id="collection">
            <div className="sectionHead">
              <div>
                <p className="eyebrow">{t.wardrobeEyebrow}</p>
                <h2 className="sectionTitle">{t.wardrobeTitle}</h2>
                <p className="sectionIntro">{t.wardrobeIntro}</p>
              </div>
            </div>

            <div className="shopTools">
              <input className="searchBox" value={searchTerm} onFocus={openSearch} onChange={(event) => setSearchTerm(event.target.value)} placeholder={t.searchPlaceholder} />

              <div
                className={sortDropdownOpen ? "luxurySort open" : "luxurySort"}
                onBlur={() => window.setTimeout(() => setSortDropdownOpen(false), 120)}
              >
                <button
                  type="button"
                  className="luxurySortButton"
                  onClick={() => setSortDropdownOpen((open) => !open)}
                  aria-expanded={sortDropdownOpen}
                >
                  <span className="luxurySortCopy">
                    <small>{isArabic ? "منسق" : "Curated"}</small>
                    <span>{sortOptions.find((option) => option.value === sortOption)?.label || t.featured}</span>
                  </span>
                  <span className="luxurySortArrow" aria-hidden="true">›</span>
                </button>

                {sortDropdownOpen && (
                  <div className="luxurySortMenu">
                    {sortOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        className={sortOption === option.value ? "luxurySortOption active" : "luxurySortOption"}
                        onClick={() => {
                          setSortOption(option.value);
                          setSortDropdownOpen(false);
                        }}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {collectionFilter !== "All" && (
              <div className="activeCollectionPill">
                <span>{isArabic ? "المجموعة:" : "Collection:"} {collectionMenuItems.find((item) => item.key === collectionFilter)?.label}</span>
                <button onClick={() => setCollectionFilter("All")}>{isArabic ? "عرض الكل" : "Show All"}</button>
              </div>
            )}

            <div className="filterRow">
              {filters.map((filter) => (
                <button key={filter} className={activeFilter === filter ? "filterBtn active" : "filterBtn"} onClick={() => { setActiveFilter(filter); setCollectionFilter("All"); }}>
                  {filterLabels[filter]}
                </button>
              ))}
            </div>

            {filteredProducts.length === 0 ? (
              <div className="emptyState">{t.noResults}</div>
            ) : (
              <div className="productGrid">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.name}
                    product={product}
                    onOpen={openProduct}
                    onAdd={addToCart}
                    onWishlist={toggleWishlist}
                    isWishlisted={wishlist.includes(product.name)}
                    language={language}
                  />
                ))}
              </div>
            )}
          </section>

          <section className="section reveal" id="style">
            <div className="cleanPanel styleFinder">
              <div>
                <p className="eyebrow">{t.styleFinder}</p>
                <h2 className="panelTitle">{t.styleTitle}</h2>
                <p className="panelText">{isArabic ? moodResult.textAR : moodResult.textEN}</p>

                <div className="moodOptions">
                  {moodOptions.map((option) => (
                    <button key={option.mood} className={selectedMood === option.mood ? "moodBtn active" : "moodBtn"} onClick={() => setSelectedMood(option.mood)}>
                      {option.mood}
                    </button>
                  ))}
                </div>

                <button className="secondaryBtn" onClick={() => openProduct(moodProduct)}>
                  {t.viewSuggested}
                </button>
              </div>

              <div className="moodCard">
                <SmartImage
                  sources={getProductImageSources(moodProduct, "front")}
                  alt={moodProduct.name}
                  loading="lazy"
                />
                <div className="moodCardContent">
                  <p className="category">{t.yourMatch}</p>
                  <h4>{moodProduct.name}</h4>
                  <p className="price">{moodProduct.price}</p>
                </div>
              </div>
            </div>
          </section>

          <section className="section reveal" id="gift-card">
            <div className="giftCardBox">
              <div>
                <p className="eyebrow">{t.giftEyebrow}</p>
                <h2 className="panelTitle">{t.giftTitle}</h2>
                <p className="panelText">{t.giftText}</p>
                <div className="actions">
                  <a className="primaryBtn" href={createWhatsAppLink("Hello La Grazia, I want to reserve a La Grazia Gift Card.")} target="_blank" rel="noreferrer">
                    {t.reserveGift}
                  </a>
                </div>
              </div>

              <div className="luxGiftCard">
                <p>Gift Card</p>
                <h3>LA GRAZIA</h3>
                <p>For timeless women</p>
              </div>
            </div>
          </section>

          <section className="section reveal" id="story">
            <div className="storyGrid">
              <div className="storyImage">
                <SmartImage sources={["/photos/hero-piece.png", "/photos/hero-piece.jpeg"]} alt="La Grazia brand story" loading="lazy" />
              </div>

              <div className="cleanPanel">
                <p className="eyebrow">{t.brandStory}</p>
                <h2 className="panelTitle">{t.storyTitle}</h2>
                <p className="panelText">{t.storyText}</p>

                <div className="storyPoints">
                  <div className="storyPoint"><span>01</span><p>{t.tailoredFits}</p></div>
                  <div className="storyPoint"><span>02</span><p>{t.neutralPalette}</p></div>
                  <div className="storyPoint"><span>03</span><p>{t.scarfStyling}</p></div>
                  <div className="storyPoint"><span>04</span><p>{t.goldDetails}</p></div>
                </div>
              </div>
            </div>
          </section>

          <section className="section reveal" id="club">
            <div className="newsletterBox">
              <div>
                <p className="eyebrow">{t.club}</p>
                <h2 className="panelTitle">{t.clubTitle}</h2>
                <p className="panelText">{t.clubText}</p>
                {newsletterStatus && <p className="newsletterStatus">{newsletterStatus}</p>}
              </div>

              <form className="emailForm privateListForm" onSubmit={handleNewsletterSubmit}>
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(event) => setNewsletterEmail(event.target.value)}
                  placeholder={t.emailPlaceholder}
                  aria-label={t.emailPlaceholder}
                  autoComplete="email"
                />
                <button type="submit" disabled={privateListLoading}>
                  {privateListLoading ? (isArabic ? "جاري الحفظ..." : "Joining...") : t.join}
                </button>
              </form>
            </div>
          </section>
        </main>
        )}

        <footer className="footer reveal">
          <div className="footerInner">
            <div>
              <p className="footerLogo">LA GRAZIA</p>
              <p className="footerTag">Eleganza in ogni giorno</p>
            </div>

            <div className="footerLinks">
              <a href="#collection" onClick={() => setAccountPageOpen(false)}>{t.shop}</a>
              <a href="#gift-card" onClick={() => setAccountPageOpen(false)}>{t.giftTitle}</a>
              <a href="#story" onClick={() => setAccountPageOpen(false)}>{t.navAbout}</a>
              <a href={`mailto:${BRAND_EMAIL}`}>{t.email}</a>
              <a href={createWhatsAppLink("Hello La Grazia, I want to contact you about pre-orders.")} target="_blank" rel="noreferrer">
                {t.whatsapp}
              </a>
            </div>
          </div>
        </footer>

        <a className="floatingWhatsApp" href={createWhatsAppLink("Hello La Grazia, I want to ask about pre-ordering the new collection.")} target="_blank" rel="noreferrer" aria-label="WhatsApp">
          <WhatsAppIcon />
        </a>

        <a className="backTop" href="#top" aria-label="Back to top">↑</a>

        <div className="mobileBottom">
          <a href="#top">{t.home}</a>
          <a href="#collection" onClick={() => setAccountPageOpen(false)}>{t.shop}</a>
          <button onClick={() => setCartOpen(true)}>{t.bag}</button>
          <a href={createWhatsAppLink("Hello La Grazia, I want to pre-order.")} target="_blank" rel="noreferrer">
            {t.whatsapp}
          </a>
        </div>
      </div>

      {cartOpen && (
        <div className="cartDrawer">
          <div className="cartHeader">
            <div>
              <p className="eyebrow">{t.yourSelection}</p>
              <h3>{t.bagTitle}</h3>
            </div>
            <button onClick={() => setCartOpen(false)}>×</button>
          </div>

          {cart.length === 0 ? (
            <p className="panelText">{t.emptyBag}</p>
          ) : (
            <div className="cartItems">
              {cart.map((item, index) => (
                <div className="cartItem" key={`${item.product.name}-${index}`}>
                  <SmartImage sources={getProductImageSources(item.product, "front", item.color)} alt={item.product.name} loading="lazy" />
                  <div>
                    <h4>{item.product.name}</h4>
                    <p>{item.product.price}</p>
                    {!isLaGraziaSilkScarf(item.product.name) && <p>Size: {item.size}</p>}
                    <p>Color: {item.color}</p>
                    <div className="cartQtyControls">
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        onClick={() => updateCartQuantity(index, item.quantity - 1)}
                      >
                        −
                      </button>
                      <span>Qty: {item.quantity}</span>
                      <button
                        type="button"
                        aria-label="Increase quantity"
                        onClick={() => updateCartQuantity(index, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                    <button className="cartRemove" onClick={() => removeFromCart(index)}>
                      {t.remove}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {cart.length > 0 && (
            <div className="cartSummaryBox">
              <div><span>{isArabic ? "الإجمالي قبل الخصم" : "Subtotal"}</span><strong>EGP {cartSubtotal.toLocaleString()}</strong></div>
              {privateOfferActive && <div className="discountRow"><span>{isArabic ? "خصم GRAZIA10" : "GRAZIA10 private offer"}</span><strong>- EGP {cartDiscount.toLocaleString()}</strong></div>}
              <div className="totalRow"><span>{isArabic ? "الإجمالي" : "Pre-order total"}</span><strong>EGP {cartTotalAfterDiscount.toLocaleString()}</strong></div>
            </div>
          )}

          {cart.length > 0 && <p className="cartPreOrderNote">{t.preOrderCartNote}</p>}

          <button className="checkoutBtn payNowBtn" onClick={handlePayNow} disabled={paymentLoading || cart.length === 0}>
            {paymentLoading ? t.openingPaymob : t.payNow}
          </button>

          <a className="checkoutBtn whatsappCheckout" href={createWhatsAppLink(cartMessage)} target="_blank" rel="noreferrer">
            {t.sendOrder}
          </a>
        </div>
      )}

      {selectedProduct && (
        <div className="modalBackdrop" onClick={() => { setSelectedProduct(null); setItemSizeChartOpen(false); }}>
          <button className="closeBtn" onClick={() => { setSelectedProduct(null); setItemSizeChartOpen(false); }}>×</button>

          <div className="modal" onClick={(event) => event.stopPropagation()}>
            <div className="modalImage" style={{ position: "relative" }}>
              <SmartImage
                sources={getProductImageSources(selectedProduct, selectedImageView, selectedColor)}
                alt={selectedProduct.name}
                loading="eager"
              />
              <div
                className="modalImageSwitcher"
                style={{
                  position: "absolute",
                  left: 18,
                  bottom: 18,
                  zIndex: 4,
                  display: "flex",
                  gap: 8,
                  padding: 5,
                  borderRadius: 999,
                  background: "rgba(255, 255, 255, 0.84)",
                  backdropFilter: "blur(10px)",
                  boxShadow: "0 12px 28px rgba(0, 0, 0, 0.14)",
                }}
              >
                {[
                  { key: "front" as const, label: "Front", available: getProductImageSources(selectedProduct, "front", selectedColor).length > 0 },
                  { key: "model" as const, label: "Model", available: getProductImageSources(selectedProduct, "model", selectedColor).length > 0 },
                  { key: "back" as const, label: "Back", available: getProductImageSources(selectedProduct, "back", selectedColor).length > 0 },
                ]
                  .filter((view) => view.available)
                  .map((view) => (
                    <button
                      key={view.key}
                      type="button"
                      className={selectedImageView === view.key ? "imageSwitchBtn active" : "imageSwitchBtn"}
                      style={{
                        border: "1px solid rgba(176, 140, 78, 0.45)",
                        borderRadius: 999,
                        padding: "7px 12px",
                        fontSize: 12,
                        letterSpacing: "0.05em",
                        color: selectedImageView === view.key ? "#ffffff" : "#6f5735",
                        background: selectedImageView === view.key ? "#b08c4e" : "rgba(255, 255, 255, 0.72)",
                        cursor: "pointer",
                      }}
                      onClick={() => setSelectedImageView(view.key)}
                    >
                      {view.label}
                    </button>
                  ))}
              </div>
            </div>

            <div className="modalInfo">
              <p className="eyebrow">{selectedProduct.category}</p>
              <h3>{selectedProduct.name}</h3>
              <p className="price">{selectedProduct.price}</p>
              <span className="modalPreOrderBadge">{t.preOrderBadge}</span>
              <p className="modalPreOrderNotice">{t.preOrderNotice}</p>
              <p>{selectedProduct.description}</p>
              <p><strong>{t.occasion}</strong> {selectedProduct.occasion}</p>
              <p><strong>{t.stock}</strong> {t.only} {getStock(selectedProduct.name)} {t.piecesLeft}</p>
              <p><strong>{t.model}</strong> {getModelInfo(selectedProduct.name)}</p>

              {!isLaGraziaSilkScarf(selectedProduct.name) && (
                <>
                  <div className="modalSizeHeader">
                    <p><strong>{t.chooseSize}</strong></p>
                    <button
                      type="button"
                      className={itemSizeChartOpen ? "inlineSizeToggle open" : "inlineSizeToggle"}
                      onClick={() => setItemSizeChartOpen((current) => !current)}
                    >
                      <span>{t.fitGuide}</span>
                      <span className="inlineSizeArrow" aria-hidden="true"></span>
                    </button>
                  </div>
                  <div className="buttonList compactSizeButtons">
                    {["XS", "S", "M", "L", "XL"].map((size) => (
                      <button key={size} className={selectedSize === size ? "sizeBtn selected" : "sizeBtn"} onClick={() => setSelectedSize(size)}>
                        {size}
                      </button>
                    ))}
                  </div>

                  {itemSizeChartOpen && (
                    <div className="modalSizeChart">
                      <div className="modalSizeTableWrap">
                        <table className="modalSizeTable">
                          <thead>
                            <tr>
                              <th>{t.size}</th>
                              <th>{t.bust}</th>
                              <th>{t.waist}</th>
                              <th>{t.hips}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {sizeChart.map((row) => (
                              <tr key={row[0]}>
                                <td>{row[0]}</td>
                                <td>{row[1]}</td>
                                <td>{row[2]}</td>
                                <td>{row[3]}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="modalFitNotes">
                        <p><strong>{t.trousers}</strong> {t.trousersText}</p>
                        <p><strong>{t.knitTops}</strong> {t.knitText}</p>
                        <p><strong>{t.jackets}</strong> {t.jacketsText}</p>
                      </div>
                      <a
                        className="modalSizeHelp"
                        href={createWhatsAppLink("Hello La Grazia, I need help choosing my size. Can I send my measurements?")}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {t.askSize}
                      </a>
                    </div>
                  )}
                </>
              )}

              <p><strong>{t.chooseColor}</strong></p>
              <div className="buttonList">
                {selectedProduct.colors.map((color) => (
                  <button
                    key={color}
                    className={selectedColor === color ? "colorBtn selected" : "colorBtn"}
                    onClick={() => {
                      setSelectedColor(color);
                      if (isLaGraziaSilkScarf(selectedProduct.name)) setSelectedImageView("front");
                    }}
                  >
                    {color}
                  </button>
                ))}
              </div>

              <p><strong>{t.quantity}</strong></p>
              <div className="qtyBox">
                <button className="qtyBtn" onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
                <strong>{quantity}</strong>
                <button className="qtyBtn" onClick={() => setQuantity(quantity + 1)}>+</button>
              </div>

              <p><strong>{t.completeLook}</strong></p>
              <div className="completeLook">
                {selectedProduct.complete.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>

              <div className="productReviewsPanel">
                <div className="productReviewsHeader">
                  <div>
                    <p className="eyebrow">{isArabic ? "تقييمات العملاء" : "Customer Reviews"}</p>
                    <h4>{approvedProductReviews.length > 0 ? `${productReviewAverage} / 5` : (isArabic ? "لا توجد تقييمات بعد" : "No reviews yet")}</h4>
                  </div>
                  {approvedProductReviews.length > 0 && (
                    <span className="reviewStars">{"★".repeat(Math.round(productReviewAverage))}{"☆".repeat(5 - Math.round(productReviewAverage))}</span>
                  )}
                </div>

                {reviewsLoading ? (
                  <p className="reviewEmptyText">{isArabic ? "جاري تحميل التقييمات..." : "Loading reviews..."}</p>
                ) : approvedProductReviews.length === 0 ? (
                  <p className="reviewEmptyText">{isArabic ? "كوني أول من يقيّم هذه القطعة." : "Be the first to review this piece."}</p>
                ) : (
                  <div className="productReviewsList">
                    {approvedProductReviews.slice(0, 3).map((review) => (
                      <article className="productReviewCard" key={review.id}>
                        <div>
                          <strong>{review.customer_name || "La Grazia Client"}</strong>
                          <span>{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</span>
                        </div>
                        <p>{review.review_text}</p>
                      </article>
                    ))}
                  </div>
                )}

                <form className="reviewForm" onSubmit={submitProductReview}>
                  <div className="reviewFormTop">
                    <label>{isArabic ? "التقييم" : "Rating"}</label>
                    <div className="reviewRatingButtons">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          className={reviewForm.rating >= star ? "reviewStarBtn active" : "reviewStarBtn"}
                          onClick={() => setReviewForm((current) => ({ ...current, rating: star }))}
                          aria-label={`Rate ${star} stars`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea
                    value={reviewForm.reviewText}
                    onChange={(event) => setReviewForm((current) => ({ ...current, reviewText: event.target.value }))}
                    placeholder={isArabic ? "اكتبي رأيك في القطعة..." : "Write your review of this piece..."}
                  />
                  <button className="reviewSubmitBtn" type="submit" disabled={reviewSubmitting}>
                    {reviewSubmitting ? (isArabic ? "جاري الإرسال..." : "Submitting...") : (isArabic ? "إرسال التقييم" : "Submit Review")}
                  </button>
                  <small>{isArabic ? "التقييم يظهر بعد موافقة الإدارة." : "Reviews appear publicly after admin approval."}</small>
                </form>
              </div>

              <button
                className="secondaryBtn"
                onClick={() =>
                  addToCart(
                    selectedProduct,
                    isLaGraziaSilkScarf(selectedProduct.name) ? "One Size" : selectedSize,
                    selectedColor,
                    quantity
                  )
                }
              >
                {t.addBag}
              </button>

              <a
                className="primaryBtn"
                href={createWhatsAppLink(
                  createLuxuryPreOrderMessage([
                    {
                      product: selectedProduct,
                      size: isLaGraziaSilkScarf(selectedProduct.name) ? "One Size" : selectedSize,
                      color: selectedColor,
                      quantity,
                    },
                  ])
                )}
                target="_blank"
                rel="noreferrer"
              >
                {t.orderWhatsapp}
              </a>

              {getStock(selectedProduct.name) <= 3 && (
                <a className="notifyBtn" href={createWhatsAppLink(`Hello La Grazia, please notify me when ${selectedProduct.name} is back in stock.`)} target="_blank" rel="noreferrer">
                  {t.notifyMe}
                </a>
              )}
            </div>
          </div>
        </div>
      )}
      <Analytics />
    </>
  );
}