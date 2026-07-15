// Central place for contact + social links. Real values live in .env (see
// .env.example) — every place that links out reads from here, not from
// literals in code.

export const ADMIN_BOOTSTRAP_EMAIL = import.meta.env.VITE_ADMIN_BOOTSTRAP_EMAIL ?? "";

export const WHATSAPP_URL = import.meta.env.VITE_WHATSAPP_URL ?? "";

export const SOCIAL_LINKS = {
  instagram: import.meta.env.VITE_SOCIAL_INSTAGRAM ?? "",
  facebook: import.meta.env.VITE_SOCIAL_FACEBOOK ?? "",
  tiktok: import.meta.env.VITE_SOCIAL_TIKTOK ?? "",
  pinterest: import.meta.env.VITE_SOCIAL_PINTEREST ?? "",
};

export const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL ?? "";
