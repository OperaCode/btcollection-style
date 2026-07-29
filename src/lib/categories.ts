// Single source of truth for product categories. Used by the Supabase seed
// migration, the admin product form, and the shop filter chips — previously
// three separate, drifting lists existed across the codebase.
export const CATEGORIES = [
  "Embroidery Apparel",
  "Embroidery Home & Accessories",
  "Engraved Drinkware",
  "Engraved Accessories",
  "Gift Sets & Stationery",
] as const;

export type Category = (typeof CATEGORIES)[number];
