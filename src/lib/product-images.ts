import hero from "@/assets/hero.jpg";
import catFaith from "@/assets/cat-faith.jpg";
import catMugs from "@/assets/cat-mugs.jpg";
import catAccessories from "@/assets/cat-accessories.jpg";
import catGifts from "@/assets/cat-gifts.jpg";
import p1 from "@/assets/p1.jpg";
import p2 from "@/assets/p2.jpg";
import p3 from "@/assets/p3.jpg";
import p4 from "@/assets/p4.jpg";

const MAP: Record<string, string> = {
  "hero.jpg": hero,
  "cat-faith.jpg": catFaith,
  "cat-mugs.jpg": catMugs,
  "cat-accessories.jpg": catAccessories,
  "cat-gifts.jpg": catGifts,
  "p1.jpg": p1,
  "p2.jpg": p2,
  "p3.jpg": p3,
  "p4.jpg": p4,
};

export function resolveImage(name?: string | null): string {
  if (!name) return p1;
  if (name.startsWith("http") || name.startsWith("/")) return name;
  return MAP[name] ?? p1;
}

export function resolveImages(names?: string[] | null): string[] {
  if (!names || names.length === 0) return [p1];
  return names.map(resolveImage);
}