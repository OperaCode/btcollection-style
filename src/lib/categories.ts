// Single source of truth for product categories. Used by the Supabase seed
// migration, the admin product form, and the shop filter chips — previously
// three separate, drifting lists existed across the codebase.
export const CATEGORIES = [
  "Faith Apparel",
  "Drinkware",
  "Gift Sets",
  "Accessories",
  "Kids/Baby",
  "Embroidered",
  "Engraved",
] as const;

export type Category = (typeof CATEGORIES)[number];
