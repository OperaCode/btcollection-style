// Single source of truth for gallery/inspiration occasions. Used by the
// inspiration page filters and the admin gallery form so the two stay in sync.
export const OCCASIONS = [
  ["Birthday", "Make their day personal."],
  ["Wedding", "Celebrate their beginning."],
  ["Anniversary", "Turn memories into keepsakes."],
  ["Graduation", "Mark the moment."],
  ["Mother's Day / Father's Day", "For someone who means everything."],
  ["Faith & Encouragement", "Gifts with meaning."],
  ["Corporate & Appreciation", "Say thank you beautifully."],
  ["Just Because", "Sometimes no occasion is needed."],
] as const;

export const OCCASION_NAMES = OCCASIONS.map(([title]) => title);
