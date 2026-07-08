import catFaith from "@/assets/cat-faith.jpg";
import catMugs from "@/assets/cat-mugs.jpg";
import catAccessories from "@/assets/cat-accessories.jpg";
import catGifts from "@/assets/cat-gifts.jpg";
import p1 from "@/assets/p1.jpg";
import p2 from "@/assets/p2.jpg";
import p3 from "@/assets/p3.jpg";
import p4 from "@/assets/p4.jpg";

export type Product = {
  slug: string;
  name: string;
  price: number;
  category: "Faith Apparel" | "Mugs" | "Accessories" | "Gift Sets";
  img: string;
  gallery: string[];
  sizes?: string[];
  description: string;
  rating: number;
  badges?: string[];
  occasions?: string[];
  customizable?: boolean;
  bestSeller?: boolean;
  giftReady?: boolean;
};

export const PRODUCTS: Product[] = [
  {
    slug: "faith-over-fear-sweatshirt",
    name: "Faith Over Fear Sweatshirt",
    price: 48,
    category: "Faith Apparel",
    img: p1,
    gallery: [p1, catFaith],
    sizes: ["XS", "S", "M", "L", "XL"],
    description:
      "A cozy heavyweight sweatshirt embroidered with our signature ‘Faith Over Fear’ script. Made from a soft cotton-poly blend and finished by hand in our studio.",
    rating: 32,
    badges: ["Best Seller", "Gift Ready"],
    occasions: ["Encouragement", "Birthday", "Ministry"],
    customizable: true,
    bestSeller: true,
    giftReady: true,
  },
  {
    slug: "blessed-mom-mug",
    name: "Blessed Mom 15oz Mug",
    price: 22,
    category: "Mugs",
    img: p2,
    gallery: [p2, catMugs],
    description:
      "A premium 15oz ceramic mug personalized with a delicate gold-foil ‘Blessed Mom’ script. Dishwasher-safe and gift-ready.",
    rating: 47,
    badges: ["Personalizable", "Gift Ready"],
    occasions: ["Mother's Day", "Birthday", "Thank You"],
    customizable: true,
    giftReady: true,
  },
  {
    slug: "grateful-canvas-tote",
    name: "Grateful Canvas Tote",
    price: 28,
    category: "Accessories",
    img: p3,
    gallery: [p3, catAccessories],
    description:
      "A structured heavyweight canvas tote embroidered with ‘Grateful.’ Roomy enough for your everyday carry, refined enough for weekends away.",
    rating: 19,
    badges: ["Personalizable"],
    occasions: ["Thank You", "Everyday", "Teacher Gift"],
    customizable: true,
  },
  {
    slug: "signature-navy-gift-box",
    name: "Signature Navy Gift Box",
    price: 85,
    category: "Gift Sets",
    img: p4,
    gallery: [p4, catGifts],
    description:
      "Our best-selling curated set: an embroidered sweatshirt, signature mug, and a scripture card — presented in our signature navy box with gold ribbon.",
    rating: 12,
    badges: ["Best Seller", "Gift Ready"],
    occasions: ["Corporate", "Ministry", "Milestone"],
    bestSeller: true,
    giftReady: true,
  },
  {
    slug: "walk-by-faith-hoodie",
    name: "Walk by Faith Hoodie",
    price: 54,
    category: "Faith Apparel",
    img: catFaith,
    gallery: [catFaith, p1],
    sizes: ["S", "M", "L", "XL"],
    description:
      "An oversized hoodie in warm cream with embroidered ‘Walk by Faith’ detailing. Brushed fleece interior for everyday softness.",
    rating: 24,
    badges: ["New", "Gift Ready"],
    occasions: ["Encouragement", "Ministry", "Birthday"],
    customizable: true,
    giftReady: true,
  },
  {
    slug: "custom-name-mug",
    name: "Custom Name Coffee Mug",
    price: 24,
    category: "Mugs",
    img: catMugs,
    gallery: [catMugs, p2],
    description:
      "Personalize with any name in gold foil script. A thoughtful, everyday gift for the coffee lover in your life.",
    rating: 38,
    badges: ["Personalizable"],
    occasions: ["Birthday", "Thank You", "Teacher Gift"],
    customizable: true,
  },
  {
    slug: "embroidered-day-tote",
    name: "Embroidered Day Tote",
    price: 32,
    category: "Accessories",
    img: catAccessories,
    gallery: [catAccessories, p3],
    description:
      "A refined everyday tote with monogram embroidery of your choice. Sturdy handles, interior pocket.",
    rating: 16,
    badges: ["Personalizable", "New"],
    occasions: ["Everyday", "Teacher Gift", "Corporate"],
    customizable: true,
  },
  {
    slug: "mothers-day-box",
    name: "Mother's Day Curated Box",
    price: 95,
    category: "Gift Sets",
    img: catGifts,
    gallery: [catGifts, p4],
    description:
      "A limited edition set for Mom: personalized mug, silk-touch scarf, hand-poured candle, and a heartfelt scripture card.",
    rating: 21,
    badges: ["Limited", "Gift Ready"],
    occasions: ["Mother's Day", "Birthday", "Milestone"],
    customizable: true,
    giftReady: true,
  },
];

export function findProduct(slug: string) {
  return PRODUCTS.find((p) => p.slug === slug);
}
