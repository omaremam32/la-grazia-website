import React, { useEffect, useMemo, useState } from "react";

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

const WHATSAPP_NUMBER = "201101900086";
const BRAND_EMAIL = "omaromohamed2003@gmail.com";

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

  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const [wishlist, setWishlist] = useState<string[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
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

  const filteredProducts = useMemo(() => {
    const result = products.filter((product) => {
      const search =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.occasion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.tag.toLowerCase().includes(searchTerm.toLowerCase());

      const filter = activeFilter === "All" || product.tag === activeFilter;

      return search && filter;
    });

    if (sortOption === "Price Low to High") return [...result].sort((a, b) => a.minPrice - b.minPrice);
    if (sortOption === "Price High to Low") return [...result].sort((a, b) => b.minPrice - a.minPrice);

    return result;
  }, [searchTerm, activeFilter, sortOption]);

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
      }
    };

    window.addEventListener("keydown", closeOnEsc);
    return () => window.removeEventListener("keydown", closeOnEsc);
  }, []);

  function openProduct(product: Product) {
    setSelectedProduct(product);
    setSelectedSize("M");
    setSelectedColor(product.colors[0]);
    setQuantity(1);
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

    try {
      setPaymentLoading(true);

      const paymentItems = cart.map((item) => ({
        name: item.product.name,
        price: item.product.minPrice,
        quantity: item.quantity,
        description: `${item.product.name} - Size: ${item.size} - Color: ${item.color}`,
      }));

      const response = await fetch("/api/create-paymob-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: paymentItems,
          customer: {
            firstName: "La",
            lastName: "Grazia Customer",
            email: BRAND_EMAIL,
            phone: `+${WHATSAPP_NUMBER}`,
            city: "Cairo",
            street: "Cairo",
            building: "1",
            floor: "1",
            apartment: "1",
          },
        }),
      });

      let data: { checkoutUrl?: string; url?: string; error?: string } = {};

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

  function openSearch() {
    setSearchOpen(true);
    setMenuOpen(false);
    setCartOpen(false);
  }

  function goToCollectionFromSearch() {
    setSearchOpen(false);
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
          padding: 10px 16px;
          text-align: center;
          font-size: 11px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          animation: topBarDrop 0.75s ease both;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          line-height: 1.2;
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
          .topBar {
            font-size: 6.8px;
            letter-spacing: 0.055em;
            padding-left: 6px;
            padding-right: 6px;
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

          .topBar {
            padding: 8px 8px;
            font-size: clamp(7px, 2.15vw, 9px);
            letter-spacing: 0.08em;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
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

          .navActions { gap: 6px; }

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
        <div className="menuOverlay" onClick={() => setMenuOpen(false)}>
          <aside className="menuPanel" onClick={(event) => event.stopPropagation()}>
            <button className="menuClose" onClick={() => setMenuOpen(false)} aria-label="Close menu">×</button>

            <div className="menuSearch">
              <SearchIcon />
              <input value={searchTerm} onFocus={openSearch} onChange={(event) => setSearchTerm(event.target.value)} placeholder={t.menuSearch} />
            </div>

            <nav className="menuLinks">
              <a href="#best" onClick={() => setMenuOpen(false)}>{t.bestTitle}</a>
              <a href="#collection" onClick={() => setMenuOpen(false)}>{t.fullCollection}</a>
              <a href="#style" onClick={() => setMenuOpen(false)}>{t.styleFinder}</a>
              <a href="#size" onClick={() => setMenuOpen(false)}>{t.sizeGuide}</a>
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
        <div className="topBar">{t.topBar}</div>

        <header className="nav">
          <div className="navInner">
            <div className="navLeft">
              <button className="iconBtn menuTrigger" onClick={() => setMenuOpen(true)} aria-label="Menu">
                <MenuIcon />
              </button>

              <nav className="navLinks">
                <a href="#collection">{t.navCollection}</a>
                <a href="#story">{t.navAbout}</a>
              </nav>
            </div>

            <a href="#top" className="brandMark">
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

              <button className="pillBtn" onClick={() => setLanguage(isArabic ? "EN" : "AR")}>
                {isArabic ? "EN" : "AR"}
              </button>

              <button className="pillBtn" onClick={() => setDarkMode(!darkMode)}>
                {darkMode ? t.light : t.dark}
              </button>

            </div>
          </div>
        </header>

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

            <div className="filterRow">
              {filters.map((filter) => (
                <button key={filter} className={activeFilter === filter ? "filterBtn active" : "filterBtn"} onClick={() => setActiveFilter(filter)}>
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

          <section className="section reveal" id="size">
            <div className="sectionHead">
              <div>
                <p className="eyebrow">{t.fitGuide}</p>
                <h2 className="sectionTitle">{t.sizeTitle}</h2>
                <p className="sectionIntro">{t.sizeIntro}</p>
              </div>

              <a className="secondaryBtn" href={createWhatsAppLink("Hello La Grazia, I need help choosing my size. Can I send my measurements?")} target="_blank" rel="noreferrer">
                {t.askSize}
              </a>
            </div>

            <div className="sizeBox">
              <div className="sizeTableWrap">
                <table className="sizeTable">
                  <thead>
                    <tr>
                      <th>{t.size}</th>
                      <th>{t.bust}</th>
                      <th>{t.waist}</th>
                      <th>{t.hips}</th>
                      <th>{t.trouserFit}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sizeChart.map((row) => (
                      <tr key={row[0]}>
                        {row.map((cell) => (
                          <td key={cell}>{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="fitNotes">
                <div className="fitNote">
                  <h4>{t.trousers}</h4>
                  <p>{t.trousersText}</p>
                </div>
                <div className="fitNote">
                  <h4>{t.knitTops}</h4>
                  <p>{t.knitText}</p>
                </div>
                <div className="fitNote">
                  <h4>{t.jackets}</h4>
                  <p>{t.jacketsText}</p>
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

        <footer className="footer reveal">
          <div className="footerInner">
            <div>
              <p className="footerLogo">LA GRAZIA</p>
              <p className="footerTag">Eleganza in ogni giorno</p>
            </div>

            <div className="footerLinks">
              <a href="#collection">{t.shop}</a>
              <a href="#size">{t.sizeGuide}</a>
              <a href="#gift-card">{t.giftTitle}</a>
              <a href="#story">{t.navAbout}</a>
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
          <a href="#collection">{t.shop}</a>
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
        <div className="modalBackdrop" onClick={() => setSelectedProduct(null)}>
          <button className="closeBtn" onClick={() => setSelectedProduct(null)}>×</button>

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

              <p><strong>{t.chooseSize}</strong></p>
              <div className="buttonList">
                {["XS", "S", "M", "L", "XL"].map((size) => (
                  <button key={size} className={selectedSize === size ? "sizeBtn selected" : "sizeBtn"} onClick={() => setSelectedSize(size)}>
                    {size}
                  </button>
                ))}
              </div>

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