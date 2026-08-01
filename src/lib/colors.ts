// Curated color palette for custom order requests. Each swatch carries a
// real hex value so the picker can render an actual color pill, not just a
// text label. "Other" falls back to free text for anything not listed here.
export const COLOR_SWATCHES = [
  { name: "Ivory", hex: "#F3ECDD" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Black", hex: "#1A1A1A" },
  { name: "Charcoal", hex: "#3A3A3A" },
  { name: "Navy", hex: "#1F2A44" },
  { name: "Gold", hex: "#C8A45C" },
  { name: "Sage", hex: "#9CAA8C" },
  { name: "Blush", hex: "#E8C4C4" },
  { name: "Burgundy", hex: "#6B2737" },
  { name: "Red", hex: "#B33A3A" },
  { name: "Royal Blue", hex: "#2A4B8D" },
  { name: "Purple", hex: "#5B3A7A" },
] as const;

export type ColorSwatchName = (typeof COLOR_SWATCHES)[number]["name"];
