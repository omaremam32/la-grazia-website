import React, { useEffect, useMemo, useState } from "react";
import { createClient, type Session } from "@supabase/supabase-js";

type Lang = "EN" | "AR";

type Product = {
  name: string;
  price: string;
  minPrice: number;
  category: string;
  image: string;
  tag: string;
  occasion: string;
  colors: string[];
  complete: string[];
  description: string;
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
  order_items?: AccountOrderItem[];
};

const WHATSAPP_NUMBER = "201101900086";
const BRAND_EMAIL = "omaromohamed2003@gmail.com";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

const supabase =
  SUPABASE_URL && SUPABASE_ANON_KEY
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

const products: Product[] = [
  {
    name: "Milano Cream Palazzo Trouser",
    price: "EGP 1,900 - 2,400",
    minPrice: 1900,
    category: "Wide-Leg Trouser",
    image: "/photos/la-grazia-01.jpeg",
    tag: "Best Seller",
    occasion: "Work / University",
    colors: ["Cream", "Ivory", "Warm Beige"],
    complete: ["Black fitted top", "Silk scarf", "Gold belt", "Mini leather bag"],
    description:
      "A high-waisted cream palazzo trouser with a clean wide-leg silhouette, designed to create an elegant Italian old-money look.",
  },
  {
    name: "Roma Plaid Palazzo Trouser",
    price: "EGP 2,100 - 2,700",
    minPrice: 2100,
    category: "Statement Trouser",
    image: "/photos/la-grazia-02.jpeg",
    tag: "New Arrival",
    occasion: "Brunch / City Walk",
    colors: ["Plaid", "Taupe", "Charcoal"],
    complete: ["Black tank top", "Classic belt", "Leather sunglasses", "Loafers"],
    description:
      "A luxury plaid palazzo trouser with a polished city feel, made for confident daytime styling and effortless Rome street elegance.",
  },
  {
    name: "Vaticano Printed Silk Scarf",
    price: "EGP 950 - 1,450",
    minPrice: 950,
    category: "Silk Scarf",
    image: "/photos/la-grazia-03.jpeg",
    tag: "Signature Look",
    occasion: "Travel / Day Out",
    colors: ["Caramel Print", "Cream", "Espresso"],
    complete: ["White fitted top", "Cream trousers", "Gold watch", "Mini shoulder bag"],
    description:
      "A statement printed silk scarf inspired by Italian travel styling, created to elevate simple outfits with a timeless feminine finish.",
  },
  {
    name: "Torino Blue Oxford Shirt",
    price: "EGP 1,850 - 2,500",
    minPrice: 1850,
    category: "Striped Shirt",
    image: "/photos/la-grazia-04.jpeg",
    tag: "Limited Drop",
    occasion: "Everyday Chic",
    colors: ["Blue Stripe", "Sky Blue", "White"],
    complete: ["Dark denim", "Navy knit", "Gold hoops", "Structured handbag"],
    description:
      "A crisp blue striped oxford shirt with relaxed tailoring, perfect for a premium everyday look with soft Italian coastal energy.",
  },
  {
    name: "Capri Navy Knit Vest",
    price: "EGP 1,700 - 2,300",
    minPrice: 1700,
    category: "Knit Vest",
    image: "/photos/la-grazia-05.jpeg",
    tag: "Summer Edit",
    occasion: "Cafe / Weekend",
    colors: ["Navy", "Cream", "Soft Blue"],
    complete: ["Striped shirt", "Wide-leg denim", "Brown handbag", "Gold earrings"],
    description:
      "A navy knit vest layered with classic shirting energy, designed for a clean, polished, and relaxed Italian casual look.",
  },
  {
    name: "Bianca Off-Shoulder Knit",
    price: "EGP 2,200 - 2,900",
    minPrice: 2200,
    category: "Off-Shoulder Knit",
    image: "/photos/la-grazia-06.jpeg",
    tag: "Soft Luxury",
    occasion: "Dinner / Evening",
    colors: ["White", "Cream", "Champagne"],
    complete: ["Wide-leg trousers", "Pearl earrings", "Cream clutch", "Nude heels"],
    description:
      "A soft off-shoulder knit with a feminine neckline, designed for quiet luxury dinners, elegant evenings, and polished soft dressing.",
  },
  {
    name: "Capri Grey Cropped Cardigan",
    price: "EGP 1,600 - 2,200",
    minPrice: 1600,
    category: "Cropped Cardigan",
    image: "/photos/la-grazia-07.jpeg",
    tag: "Casual Edit",
    occasion: "Everyday / Coffee Run",
    colors: ["Grey", "Ivory", "Soft Denim"],
    complete: ["White fitted top", "Straight jeans", "Mini bag", "Ballet flats"],
    description:
      "A cropped grey cardigan with a relaxed old-money mood, made for easy everyday styling while still feeling polished and feminine.",
  },
  {
    name: "Parisian Bouclé Jacket",
    price: "EGP 2,400 - 3,200",
    minPrice: 2400,
    category: "Bouclé Jacket",
    image: "/photos/la-grazia-08.jpeg",
    tag: "Premium Piece",
    occasion: "Dinner / Events",
    colors: ["Beige", "Cream", "Gold Detail"],
    complete: ["Cream top", "Tailored trousers", "Gold earrings", "Structured mini bag"],
    description:
      "A textured beige bouclé jacket with gold-detail elegance, created as the statement piece for a refined Parisian-inspired wardrobe.",
  },
  {
    name: "Caffè Crema Corset Top",
    price: "EGP 1,900 - 2,600",
    minPrice: 1900,
    category: "Structured Top",
    image: "/photos/la-grazia-09.jpeg",
    tag: "Cafe Edit",
    occasion: "Cafe / Weekend",
    colors: ["Cream", "Ivory", "Warm Beige"],
    complete: ["Blue denim", "Brown belt", "Gold necklace", "Coffee-tone bag"],
    description:
      "A cream structured corset-inspired top, designed to make denim looks feel instantly elevated, feminine, and polished.",
  },
  {
    name: "Firenze Cream Tailored Vest",
    price: "EGP 2,100 - 2,850",
    minPrice: 2100,
    category: "Tailored Vest",
    image: "/photos/la-grazia-10.jpeg",
    tag: "Resort Edit",
    occasion: "Vacation / Brunch",
    colors: ["Cream", "Sand", "White"],
    complete: ["Linen trousers", "Gold bangles", "Woven bag", "Soft sandals"],
    description:
      "A cream tailored vest with resort-luxury energy, perfect for brunch, summer travel, and clean Italian-inspired styling.",
  },
];

const sizeChart = [
  ["XS", "78 - 82 cm", "60 - 64 cm", "86 - 90 cm", "34 EU / 24-25"],
  ["S", "83 - 87 cm", "65 - 69 cm", "91 - 95 cm", "36 EU / 26-27"],
  ["M", "88 - 92 cm", "70 - 74 cm", "96 - 100 cm", "38 EU / 28-29"],
  ["L", "93 - 98 cm", "75 - 80 cm", "101 - 106 cm", "40 EU / 30-31"],
  ["XL", "99 - 105 cm", "81 - 88 cm", "107 - 114 cm", "42 EU / 32-33"],
];

const stockLevels = [4, 7, 3, 5, 6, 2, 8, 3, 5, 4];

const modelInfo = [
  "Height 170 cm · Wearing S · True to size",
  "Height 168 cm · Wearing S · Relaxed trouser fit",
  "Height 172 cm · Wearing M · True to size",
  "Height 169 cm · Wearing S · Slightly relaxed",
  "Height 171 cm · Wearing S · True to size",
  "Height 167 cm · Wearing S · Soft stretch fit",
  "Height 166 cm · Wearing S · Relaxed casual fit",
  "Height 173 cm · Wearing M · Structured fit",
  "Height 170 cm · Wearing S · True to size",
  "Height 169 cm · Wearing S · Relaxed resort fit",
];

const moodOptions = [
  {
    mood: "Old Money",
    result: "Vaticano Printed Silk Scarf",
    textEN: "Refined scarf styling, neutral trousers, and a timeless Italian travel mood.",
    textAR: "تنسيق سكارف راقٍ مع بنطلون هادئ ولمسة إيطالية كلاسيكية.",
  },
  {
    mood: "City Chic",
    result: "Roma Plaid Palazzo Trouser",
    textEN: "A clean city look with tailored trousers and a confident everyday silhouette.",
    textAR: "لوك مدينة بسيط وراقي مع بنطلون tailored وشكل يومي واثق.",
  },
  {
    mood: "Soft Luxury",
    result: "Bianca Off-Shoulder Knit",
    textEN: "A feminine cream look for dinner, events, and soft elegant moments.",
    textAR: "لوك كريمي ناعم وأنثوي مناسب للعشاء والمناسبات الهادئة.",
  },
  {
    mood: "Summer Muse",
    result: "Capri Navy Knit Vest",
    textEN: "A clean layered navy knit look for cafés, weekends, and soft casual elegance.",
    textAR: "لوك تريكو كحلي بسيط مناسب للكافيهات والويك إند والأناقة اليومية.",
  },
];

const text = {
  EN: {
    topBar: "Free Cairo delivery for orders above EGP 3,000",
    womenOnly: "Women-Only Fashion",
    navBest: "Best Sellers",
    navCollection: "Collection",
    navAbout: "About",
    heroEyebrow: "Elegance in every day",
    heroTitle: "The Roma Drop is here.",
    heroDescription:
      "Discover a women-only local fashion brand inspired by Italian old-money elegance, soft neutrals, tailored single pieces, statement scarves, and effortless quiet luxury.",
    shopCollection: "Shop Collection",
    findLook: "Find Your Piece",
    signatureEdit: "The Signature Edit",
    signatureText: "Tailored pieces, scarves, knitwear, and gold details.",
    trustDelivery: "Cairo Delivery",
    trustExchange: "14-Day Exchange",
    trustStyling: "WhatsApp Styling",
    trustDrops: "Limited Drops",
    mostLoved: "Most Loved",
    bestTitle: "Best Sellers",
    bestIntro: "A curated selection of La Grazia’s most loved Italian-inspired luxury pieces.",
    viewAll: "View All",
    wardrobeEyebrow: "New Arrivals",
    wardrobeTitle: "The La Grazia Wardrobe",
    wardrobeIntro: "Browse single luxury pieces with search, filters, and clean product cards.",
    searchPlaceholder: "Search trousers, scarves, knitwear, jackets...",
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
      "La Grazia blends Italian old-money style with everyday wearability: clean tailoring, warm neutrals, elegant silhouettes, and pieces that make a woman look expensive without trying too hard.",
    tailoredFits: "Tailored Fits",
    neutralPalette: "Neutral Palette",
    scarfStyling: "Scarf Styling",
    goldDetails: "Gold Details",
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
    signInText: "Sign in to save your details, speed up checkout, and receive private drop access.",
    signUpText: "Create a La Grazia account to save your details, track your bag faster, and receive private drop access.",
    fullName: "Full name",
    phoneNumber: "Phone number",
    signInEmail: "Email address",
    continueSignIn: "Continue",
    createAccount: "Create Account",
    noAccount: "New here? Create an account",
    haveAccount: "Already have an account? Sign in",
    signedInWelcome: "Welcome to La Grazia",
    accountCreated: "Your La Grazia account has been created",
    signOut: "Sign Out",
    whatsappStyling: "WhatsApp Styling Help",
    savedLooks: "Saved Pieces",
    savedEmpty: "Tap the heart on any piece to save it here.",
    yourSelection: "Your Selection",
    bagTitle: "La Grazia Bag",
    emptyBag: "Your bag is empty. Add your favorite pieces first.",
    remove: "Remove",
    sendOrder: "Send Order on WhatsApp",
    payNow: "Pay Now",
    openingPaymob: "Opening Paymob...",
    paymentError: "Payment could not start. Please try again.",
    paymentServerError: "Payment server is not ready locally. Test Pay Now after pushing to Vercel, or run Vercel dev.",
    only: "Only",
    left: "left",
    view: "View",
    add: "Add",
    occasion: "Occasion:",
    stock: "Stock:",
    model: "Model:",
    chooseSize: "Choose size:",
    chooseColor: "Choose color:",
    quantity: "Quantity:",
    completeLook: "Style it with:",
    addBag: "Add to Bag",
    orderWhatsapp: "Order on WhatsApp",
    notifyMe: "Notify Me",
    piecesLeft: "pieces left",
    home: "Home",
    bag: "Bag",
    dark: "Dark",
    light: "Light",
    toastAdded: "Added to La Grazia Bag",
    toastSaved: "Saved to your pieces",
    toastRemoved: "Removed from saved pieces",
    loadingLine: "Preparing your Italian wardrobe",
  },
  AR: {
    topBar: "توصيل مجاني داخل القاهرة للطلبات فوق ٣٠٠٠ جنيه",
    womenOnly: "أزياء نسائية فقط",
    navBest: "الأكثر مبيعاً",
    navCollection: "المجموعة",
    navAbout: "عن البراند",
    heroEyebrow: "أناقة في كل يوم",
    heroTitle: "مجموعة روما وصلت.",
    heroDescription:
      "اكتشفي براند محلي نسائي مستوحى من الأناقة الإيطالية الهادئة، الألوان الناعمة، القطع الراقية، السكارف، والرفاهية البسيطة.",
    shopCollection: "تسوقي المجموعة",
    findLook: "اختاري القطعة",
    signatureEdit: "الاختيار الأساسي",
    signatureText: "قطع Tailored، سكارف، تريكو، وتفاصيل ذهبية.",
    trustDelivery: "توصيل داخل القاهرة",
    trustExchange: "استبدال خلال ١٤ يوم",
    trustStyling: "تنسيق عبر واتساب",
    trustDrops: "إصدارات محدودة",
    mostLoved: "الأكثر حباً",
    bestTitle: "الأكثر مبيعاً",
    bestIntro: "اختيار من أكثر قطع لا غراتسيا حباً بطابع إيطالي راقٍ.",
    viewAll: "شاهدي الكل",
    wardrobeEyebrow: "وصل حديثاً",
    wardrobeTitle: "خزانة لا غراتسيا",
    wardrobeIntro: "تصفحي قطع لا غراتسيا الفاخرة من خلال البحث والفلاتر بطريقة بسيطة ومنظمة.",
    searchPlaceholder: "ابحثي عن بنطلون، سكارف، تريكو، أو جاكيت...",
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
      "لا غراتسيا تمزج بين الستايل الإيطالي القديم والارتداء اليومي: قصّات نظيفة، ألوان دافئة، تفاصيل أنيقة، وقطع تجعل المرأة تبدو فاخرة بدون مبالغة.",
    tailoredFits: "قصّات Tailored",
    neutralPalette: "ألوان هادئة",
    scarfStyling: "تنسيق السكارف",
    goldDetails: "تفاصيل ذهبية",
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
    signOut: "تسجيل الخروج",
    whatsappStyling: "مساعدة تنسيق عبر واتساب",
    savedLooks: "القطع المحفوظة",
    savedEmpty: "اضغطي على القلب في أي قطعة لحفظها هنا.",
    yourSelection: "اختياراتك",
    bagTitle: "شنطة لا غراتسيا",
    emptyBag: "الشنطة فارغة. أضيفي القطعة المفضلة أولاً.",
    remove: "إزالة",
    sendOrder: "إرسال الطلب عبر واتساب",
    payNow: "ادفعي الآن",
    openingPaymob: "جاري فتح Paymob...",
    paymentError: "تعذر بدء الدفع. حاولي مرة أخرى.",
    paymentServerError: "الدفع لن يعمل محلياً إلا بعد النشر على Vercel أو تشغيل Vercel dev.",
    only: "متبقي",
    left: "فقط",
    view: "عرض",
    add: "إضافة",
    occasion: "المناسبة:",
    stock: "المتوفر:",
    model: "الموديل:",
    chooseSize: "اختاري المقاس:",
    chooseColor: "اختاري اللون:",
    quantity: "الكمية:",
    completeLook: "نسقيها مع:",
    addBag: "أضيفي للشنطة",
    orderWhatsapp: "اطلبي عبر واتساب",
    notifyMe: "بلغيني عند التوفر",
    piecesLeft: "قطع فقط",
    home: "الرئيسية",
    bag: "الشنطة",
    dark: "داكن",
    light: "فاتح",
    toastAdded: "تمت الإضافة إلى شنطة لا غراتسيا",
    toastSaved: "تم حفظ القطعة",
    toastRemoved: "تم حذف القطعة من المحفوظات",
    loadingLine: "نجهز لك خزانة إيطالية راقية",
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
      <path d="M6 8h12l-1 12H7L6 8Z" />
      <path d="M9 8a3 3 0 0 1 6 0" />
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

function UserIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21a8 8 0 0 0-16 0" />
      <circle cx="12" cy="8" r="4" />
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

  return (
    <article className="productCard reveal">
      <div className="productImage" onClick={() => onOpen(product)}>
        <img src={product.image} alt={product.name} loading="lazy" />
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
  const [selectedSize, setSelectedSize] = useState("M");
  const [selectedColor, setSelectedColor] = useState("Cream");
  const [quantity, setQuantity] = useState(1);
  const [itemSizeChartOpen, setItemSizeChartOpen] = useState(false);

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
  const [session, setSession] = useState<Session | null>(null);
  const [accountLoading, setAccountLoading] = useState(false);
  const [accountView, setAccountView] = useState<"profile" | "orders">("profile");
  const [accountOrders, setAccountOrders] = useState<AccountOrder[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [collectionFilter, setCollectionFilter] = useState("All");
  const [sortOption, setSortOption] = useState("Featured");

  const [selectedMood, setSelectedMood] = useState("Old Money");
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState<Lang>("EN");

  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState("");

  const [toast, setToast] = useState("");
  const [scrollProgress, setScrollProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  const isArabic = language === "AR";
  const t = text[language];

  const accountInitials = useMemo(() => {
    if (!accountUser) return "";

    const source = (accountUser.name || accountUser.email || "").trim();
    const parts = source.split(/\s+/).filter(Boolean);

    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }

    return source.slice(0, 2).toUpperCase();
  }, [accountUser]);

  const bestSellers = products.filter((product) =>
    ["Milano Cream Palazzo Trouser", "Vaticano Printed Silk Scarf", "Bianca Off-Shoulder Knit", "Firenze Cream Tailored Vest"].includes(product.name)
  );

  const filters = ["All", "Best Seller", "Signature Look", "Summer Edit", "Soft Luxury", "Premium Piece"];

  const filterLabels: Record<string, string> = {
    All: isArabic ? "الكل" : "All",
    "Best Seller": isArabic ? "الأكثر مبيعاً" : "Best Seller",
    "Signature Look": isArabic ? "قطعة أساسية" : "Signature Look",
    "Summer Edit": isArabic ? "اختيارات الصيف" : "Summer Edit",
    "Soft Luxury": isArabic ? "رفاهية ناعمة" : "Soft Luxury",
    "Premium Piece": isArabic ? "قطع فاخرة" : "Premium Piece",
  };

  const collectionMenuItems = [
    { key: "Tops", label: isArabic ? "توبس" : "Tops" },
    { key: "Pants", label: isArabic ? "بنطلونات" : "Pants" },
    { key: "Coats", label: isArabic ? "كوتس وجاكيتات" : "Coats" },
  ];

  function productMatchesCollection(product: Product, collection: string) {
    const textValue = `${product.name} ${product.category}`.toLowerCase();

    if (collection === "Tops") {
      return textValue.includes("top") || textValue.includes("knit") || textValue.includes("shirt") || textValue.includes("vest") || textValue.includes("cardigan");
    }

    if (collection === "Pants") {
      return textValue.includes("trouser") || textValue.includes("palazzo") || textValue.includes("pants");
    }

    if (collection === "Coats") {
      return textValue.includes("jacket") || textValue.includes("coat") || textValue.includes("bouclé") || textValue.includes("cardigan");
    }

    return true;
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
    const guideProduct = selectedProduct || products[0];
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
    const result = products.filter((product) => {
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
  }, [searchTerm, activeFilter, collectionFilter, sortOption]);

  const wishlistProducts = products.filter((product) => wishlist.includes(product.name));

  const moodResult = moodOptions.find((option) => option.mood === selectedMood) || moodOptions[0];
  const moodProduct = products.find((product) => product.name === moodResult.result) || products[0];

  const lineBreak = String.fromCharCode(10);

  const orderLines = cart
    .map(
      (item, index) =>
        `${index + 1}. ${item.product.name} - ${item.product.price} - Size: ${item.size} - Color: ${item.color} - Qty: ${item.quantity}`
    )
    .join(lineBreak);

  const cartMessage =
    cart.length > 0
      ? "Hello La Grazia, I want to order:" +
        lineBreak +
        lineBreak +
        orderLines +
        lineBreak +
        lineBreak +
        "Please send me delivery details."
      : "Hello La Grazia, I want to ask about the new collection.";

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 4300);
    return () => window.clearTimeout(timer);
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
    const elements = document.querySelectorAll(".reveal");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            window.setTimeout(() => {
              entry.target.classList.add("visible");
            }, index * 70);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 }
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [language, searchTerm, activeFilter, sortOption, wishlist.length]);

  useEffect(() => {
    if (!toast) return;

    const timer = window.setTimeout(() => setToast(""), 2400);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    const closeOnEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setSearchOpen(false);
        setCartOpen(false);
        setSelectedProduct(null);
        setItemSizeChartOpen(false);
      }
    };

    window.addEventListener("keydown", closeOnEsc);
    return () => window.removeEventListener("keydown", closeOnEsc);
  }, []);

  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data }) => {
      handleSupabaseSession(data.session);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      handleSupabaseSession(nextSession);
    });

    return () => data.subscription.unsubscribe();
  }, []);

  async function handleSupabaseSession(nextSession: Session | null) {
    setSession(nextSession);

    if (!nextSession?.user || !supabase) {
      setAccountUser(null);
      setAccountOrders([]);
      return;
    }

    const user = nextSession.user;
    const metadata = user.user_metadata || {};

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, full_name, email, phone")
      .eq("id", user.id)
      .maybeSingle();

    const nextUser: AccountUser = {
      id: user.id,
      name: String(profile?.full_name || metadata.full_name || "La Grazia Client"),
      email: String(profile?.email || user.email || ""),
      phone: String(profile?.phone || metadata.phone || ""),
    };

    setAccountUser(nextUser);
    setAccountForm({ name: nextUser.name, email: nextUser.email, phone: nextUser.phone, password: "" });
    fetchUserOrders(user.id);
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

  function openProduct(product: Product) {
    setSelectedProduct(product);
    setSelectedSize("M");
    setSelectedColor(product.colors[0]);
    setQuantity(1);
    setItemSizeChartOpen(false);
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

  function toggleWishlist(product: Product) {
    const exists = wishlist.includes(product.name);

    setWishlist((current) =>
      current.includes(product.name)
        ? current.filter((name) => name !== product.name)
        : [...current, product.name]
    );

    setToast(exists ? t.toastRemoved : t.toastSaved);
  }

  function handleNewsletterSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!newsletterEmail.includes("@") || !newsletterEmail.includes(".")) {
      setNewsletterStatus(t.invalidEmail);
      return;
    }

    const subject = encodeURIComponent("New La Grazia Club Signup");
    const body = encodeURIComponent(
      `Hello La Grazia,\n\nPlease add this email to the private list:\n${newsletterEmail}\n\nThank you.`
    );

    window.location.href = `mailto:${BRAND_EMAIL}?subject=${subject}&body=${body}`;
    setNewsletterStatus(t.emailDone);
  }

  async function handlePayNow() {
    if (cart.length === 0) {
      setToast(t.emptyBag);
      return;
    }

    if (!session?.user || !accountUser) {
      setAuthMode("signIn");
      setSignInOpen(true);
      setToast(isArabic ? "سجلي الدخول أولاً لحفظ الطلب ومتابعته." : "Please sign in first to save and track your order.");
      return;
    }

    try {
      setPaymentLoading(true);

      const paymentItems = cart.map((item) => ({
        name: item.product.name,
        price: item.product.minPrice,
        quantity: item.quantity,
        description: `${item.product.name} - Size: ${item.size} - Color: ${item.color}`,
      }));

      const totalAmount = cart.reduce((total, item) => total + item.product.minPrice * item.quantity, 0);
      const nameParts = accountUser.name.trim().split(" ").filter(Boolean);
      const firstName = nameParts[0] || "La";
      const lastName = nameParts.slice(1).join(" ") || "Grazia";

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
            email: accountUser.email || BRAND_EMAIL,
            phone: accountUser.phone || `+${WHATSAPP_NUMBER}`,
            city: "Cairo",
            street: "Cairo",
            building: "1",
            floor: "1",
            apartment: "1",
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

        if (window.location.hostname === "localhost") {
          setToast(t.paymentServerError || t.paymentError);
        } else {
          setToast(t.paymentError);
        }

        return;
      }

      if (supabase) {
        const orderReference = data.orderReference || `LG-${Date.now()}`;

        const { data: orderData, error: orderError } = await supabase
          .from("orders")
          .insert({
            user_id: session.user.id,
            order_reference: orderReference,
            total_amount: totalAmount,
            currency: "EGP",
            payment_status: "pending",
            order_status: "Pending Payment",
            paymob_checkout_url: checkoutUrl,
            customer_name: accountUser.name,
            customer_email: accountUser.email,
            customer_phone: accountUser.phone,
          })
          .select("id")
          .single();

        if (!orderError && orderData?.id) {
          const orderItems = cart.map((item) => ({
            order_id: orderData.id,
            user_id: session.user.id,
            product_name: item.product.name,
            product_image: item.product.image,
            size: item.size,
            color: item.color,
            quantity: item.quantity,
            unit_price: item.product.minPrice,
            total_price: item.product.minPrice * item.quantity,
          }));

          await supabase.from("order_items").insert(orderItems);
          fetchUserOrders(session.user.id);
        } else {
          console.error(orderError);
        }
      }

      window.location.href = checkoutUrl;
    } catch (error) {
      console.error(error);

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
        }

        setToast(data.session ? t.accountCreated : (isArabic ? "تم إنشاء الحساب. افحصي الإيميل للتأكيد." : "Account created. Check your email to confirm it."));
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
          setToast(error.message);
          return;
        }

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

    setAccountUser(null);
    setAccountForm({ name: "", email: "", phone: "", password: "" });
    setAccountOrders([]);
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
          animation: topBarMarquee 22s linear infinite;
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
        .heroCopy .actions {
          opacity: 0;
          animation: fadeUp 1s cubic-bezier(.16, 1, .3, 1) forwards;
        }

        .heroCopy .eyebrow { animation-delay: 0.95s; }
        .heroCopy h2 { animation-delay: 1.18s; }
        .heroCopy .description { animation-delay: 1.42s; }
        .heroCopy .actions { animation-delay: 1.7s; }

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
          transition: transform 0.75s ease, filter 0.75s ease;
        }

        .productCard:hover .productImage img {
          transform: scale(1.07);
          filter: saturate(1.04) contrast(1.02);
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
          grid-template-columns: 1fr 280px;
          gap: 16px;
          align-items: center;
          margin-bottom: 24px;
        }

        .searchBox {
          border: 1px solid rgba(176, 138, 69, 0.34);
          background: rgba(255, 249, 240, 0.78);
          color: inherit;
          border-radius: 999px;
          padding: 16px 20px;
          outline: none;
        }

        .selectWrap { position: relative; }

        .selectWrap::before {
          content: "CURATED";
          position: absolute;
          left: 18px;
          top: 8px;
          z-index: 1;
          font-size: 9px;
          letter-spacing: 0.2em;
          color: #b08a45;
          pointer-events: none;
        }

        .selectWrap::after {
          content: "⌄";
          position: absolute;
          right: 18px;
          top: 50%;
          transform: translateY(-50%);
          color: #b08a45;
          pointer-events: none;
          font-size: 18px;
        }

        .sortSelect {
          width: 100%;
          appearance: none;
          border: 1px solid rgba(176, 138, 69, 0.48);
          background: linear-gradient(135deg, rgba(255,249,240,0.96), rgba(239,227,210,0.86));
          color: #241a14;
          border-radius: 999px;
          padding: 22px 48px 11px 18px;
          outline: none;
          font-size: 13px;
          letter-spacing: 0.06em;
          box-shadow: 0 12px 28px rgba(36, 26, 20, 0.07);
        }

        .darkMode .searchBox,
        .darkMode .sortSelect,
        .darkMode .emailForm input {
          background: #211713;
          color: #fff9f0;
          border-color: rgba(215, 180, 111, 0.48);
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
          display: grid;
          place-items: center;
          background: radial-gradient(circle at center, rgba(176, 138, 69, 0.18), transparent 42%), #2c1f18;
          color: #f7f1e8;
          animation: loaderOut 0.95s ease 3.25s forwards;
          overflow: hidden;
        }

        .loaderInner {
          text-align: center;
          width: min(680px, 88vw);
          position: relative;
          z-index: 2;
        }

        .loader h1 {
          margin: 0;
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(42px, 7vw, 88px);
          letter-spacing: 0.18em;
          font-weight: 500;
          animation: loaderLogo 1.55s cubic-bezier(.16, 1, .3, 1) both;
        }

        .loader p {
          margin: 22px 0 0;
          color: #d7b46f;
          letter-spacing: 0.26em;
          text-align: center;
          text-transform: uppercase;
          font-size: 12px;
          animation: fadeUp 1s ease 0.75s both;
        }

        .loaderLine {
          width: 0;
          height: 1px;
          margin: 38px auto 0;
          background: linear-gradient(90deg, transparent, #d7b46f, transparent);
          animation: loaderLine 2.65s ease 0.8s forwards;
        }



        .footerTextBtn {
          border: 0;
          background: transparent;
          color: inherit;
          padding: 0;
          font: inherit;
          text-decoration: none;
        }

        .footerTextBtn:hover {
          color: #b08a45;
        }

        @keyframes loaderLogo {
          from { opacity: 0; letter-spacing: 0.05em; transform: translateY(18px) scale(0.98); }
          to { opacity: 1; letter-spacing: 0.18em; transform: translateY(0) scale(1); }
        }

        @keyframes loaderLine {
          from { width: 0; opacity: 0; }
          20% { opacity: 1; }
          to { width: min(420px, 76vw); opacity: 1; }
        }

        @keyframes loaderOut {
          to { opacity: 0; pointer-events: none; transform: scale(1.01); }
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
            animation-duration: 18s;
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

          .searchBox { padding: 15px 18px; }

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

`}</style>

      <div className="scrollProgress" style={{ width: `${scrollProgress}%` }} />

      {loading && (
        <div className="loader">
          <div className="loaderInner">
            <h1>LA GRAZIA</h1>
            <p>{t.loadingLine}</p>
            <div className="loaderLine" />
          </div>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}

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
                  onClick={() => setAuthMode("signIn")}
                >
                  {t.signIn}
                </button>
                <button
                  type="button"
                  className={authMode === "signUp" ? "signInTab active" : "signInTab"}
                  onClick={() => setAuthMode("signUp")}
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
                    {isArabic ? "طلباتي" : "My Orders"}
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
                        <strong>{isArabic ? "لا توجد طلبات حتى الآن" : "No orders yet"}</strong>
                        <span>{isArabic ? "عند الدفع، سيظهر طلبك هنا لتتبعي حالته." : "When you pay, your order will appear here so you can track it."}</span>
                      </div>
                    ) : (
                      accountOrders.map((order) => (
                        <div className="orderCard" key={order.id}>
                          <div className="orderCardTop">
                            <div>
                              <small>{isArabic ? "رقم الطلب" : "Order"}</small>
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
                  onClick={() => setAuthMode(authMode === "signUp" ? "signIn" : "signUp")}
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
                    <img src={product.image} alt={product.name} />
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
                      <img src={product.image} alt={product.name} />
                      <span>{product.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>
      )}

      <div className={`${darkMode ? "page darkMode" : "page"} ${isArabic ? "arabic" : ""}`} id="top">
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
                    setSignInOpen(true);
                  }
                }}
                aria-label={accountUser ? t.myAccount : t.signIn}
              >
                <span className="accountShortName">
                  <span className="accountAvatar" aria-hidden="true">
                    {accountUser ? accountInitials : <UserIcon />}
                  </span>
                  <span className="accountDesktopLabel">
                    {accountUser ? t.myAccount : t.signIn}
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
                    : "Track your details, orders, and delivery status from one elegant La Grazia space."}
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
                    {isArabic ? "طلباتي" : "My Orders"}
                  </button>
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
                  </>
                ) : (
                  <>
                    <div className="accountPageTitleRow">
                      <div>
                        <p className="eyebrow">{isArabic ? "تتبع الطلبات" : "Order Tracking"}</p>
                        <h3>{isArabic ? "طلباتي" : "My Orders"}</h3>
                        <p>
                          {isArabic
                            ? "اسحبي يميناً أو يساراً لمشاهدة كل الطلبات عند وجود أكثر من طلب."
                            : "Swipe or slide sideways to browse all orders when you have more than one."}
                        </p>
                      </div>
                      <button className="secondaryBtn" onClick={() => fetchUserOrders()}>
                        {isArabic ? "تحديث" : "Refresh"}
                      </button>
                    </div>

                    {accountOrders.length === 0 ? (
                      <div className="noOrdersBox">
                        <strong>{isArabic ? "لا توجد طلبات حتى الآن" : "No orders yet"}</strong>
                        <span>{isArabic ? "عند الدفع، سيظهر طلبك هنا لتتبعي حالته." : "When you pay, your order will appear here so you can track it."}</span>
                      </div>
                    ) : (
                      <div className="accountOrdersCarousel" aria-label="Order history">
                        {accountOrders.map((order) => {
                          const statusSteps = ["Pending Payment", "Paid", "Preparing", "Out for Delivery", "Delivered"];
                          const activeIndex = Math.max(0, statusSteps.findIndex((step) => step === order.order_status));

                          return (
                            <div className="accountOrderSlide" key={order.id}>
                              <div className="orderCard">
                                <div className="orderCardTop">
                                  <div>
                                    <small>{isArabic ? "رقم الطلب" : "Order"}</small>
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
                )}
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

              <div className="actions">
                <a className="primaryBtn" href="#collection">{t.shopCollection}</a>
                <a className="secondaryBtn" href="#style">{t.findLook}</a>
              </div>
            </div>

            <div className="heroVisual">
              <img src="/photos/la-grazia-03.jpeg" alt="La Grazia hero piece" />
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

              <div className="selectWrap">
                <select className="sortSelect" value={sortOption} onChange={(event) => setSortOption(event.target.value)}>
                  <option value="Featured">{t.featured}</option>
                  <option value="Price Low to High">{t.priceLow}</option>
                  <option value="Price High to Low">{t.priceHigh}</option>
                </select>
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
                <img src={moodProduct.image} alt={moodProduct.name} />
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
                <img src="/photos/la-grazia-10.jpeg" alt="La Grazia brand story" />
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

              <form className="emailForm" onSubmit={handleNewsletterSubmit}>
                <input type="email" value={newsletterEmail} onChange={(event) => setNewsletterEmail(event.target.value)} placeholder={t.emailPlaceholder} />
                <button type="submit">{t.join}</button>
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
              <a href={createWhatsAppLink("Hello La Grazia, I want to contact you.")} target="_blank" rel="noreferrer">
                {t.whatsapp}
              </a>
            </div>
          </div>
        </footer>

        <a className="floatingWhatsApp" href={createWhatsAppLink("Hello La Grazia, I want to ask about the new collection.")} target="_blank" rel="noreferrer" aria-label="WhatsApp">
          <WhatsAppIcon />
        </a>

        <a className="backTop" href="#top" aria-label="Back to top">↑</a>

        <div className="mobileBottom">
          <a href="#top">{t.home}</a>
          <a href="#collection" onClick={() => setAccountPageOpen(false)}>{t.shop}</a>
          <button onClick={() => setCartOpen(true)}>{t.bag}</button>
          <a href={createWhatsAppLink("Hello La Grazia, I want to order.")} target="_blank" rel="noreferrer">
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
                  <img src={item.product.image} alt={item.product.name} />
                  <div>
                    <h4>{item.product.name}</h4>
                    <p>{item.product.price}</p>
                    <p>Size: {item.size}</p>
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
            <div className="modalImage">
              <img src={selectedProduct.image} alt={selectedProduct.name} />
            </div>

            <div className="modalInfo">
              <p className="eyebrow">{selectedProduct.category}</p>
              <h3>{selectedProduct.name}</h3>
              <p className="price">{selectedProduct.price}</p>
              <p>{selectedProduct.description}</p>
              <p><strong>{t.occasion}</strong> {selectedProduct.occasion}</p>
              <p><strong>{t.stock}</strong> {t.only} {getStock(selectedProduct.name)} {t.piecesLeft}</p>
              <p><strong>{t.model}</strong> {getModelInfo(selectedProduct.name)}</p>

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

              <p><strong>{t.chooseColor}</strong></p>
              <div className="buttonList">
                {selectedProduct.colors.map((color) => (
                  <button key={color} className={selectedColor === color ? "colorBtn selected" : "colorBtn"} onClick={() => setSelectedColor(color)}>
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

              <button className="secondaryBtn" onClick={() => addToCart(selectedProduct, selectedSize, selectedColor, quantity)}>
                {t.addBag}
              </button>

              <a
                className="primaryBtn"
                href={createWhatsAppLink(
                  `Hello La Grazia, I want to order ${selectedProduct.name}. Size: ${selectedSize}. Color: ${selectedColor}. Quantity: ${quantity}. Price range: ${selectedProduct.price}. Please send me delivery details.`
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
    </>
  );
}