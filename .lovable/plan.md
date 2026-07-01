
# Complete BT Collection Storefront + Admin

This is a large scope. I'll build it in one continuous pass, reusing the existing design system (ink/gold/cream, Cormorant Garamond + Inter, existing `SiteChrome`, `PageHero`). No visual redesign — new pages inherit the current language.

## Scope (this build)

### Storefront
1. **Cart + Wishlist state** — Zustand stores, persisted to `localStorage`, hydrated on client.
2. **Floating Cart Drawer** — slide-in, editable qty, subtotal, "Proceed to Checkout" CTA. Mounted globally via `SiteChrome`.
3. **Instant Search modal** — cmd-k / header search icon, live filter over product catalog.
4. **Shop page upgrade** — real filters (category, price, availability, product type), sort (newest / best / price / A–Z), pagination, skeleton loaders, Quick View + Quick Add + Wishlist on each card.
5. **Product Details `/product/$slug`** — gallery w/ zoom + thumbs, sticky Add to Cart, description, shipping/returns accordions, reviews, related products, "Frequently bought together".
6. **Customization panel** (on product page for customizable items) — image upload (preview only), name, custom text, font, font color, gift message, special instructions, live preview card.
7. **Quick View modal** — condensed product card triggered from Shop.
8. **Cart page `/cart`** — full page cart alternative to drawer.
9. **Checkout `/checkout`** — 4 steps (Shipping → Delivery → Payment → Confirmation) with a stepper. Stripe Checkout via Lovable's built-in seamless Stripe Payments (no user keys needed).
10. **Wishlist page `/wishlist`**.
11. **Order confirmation `/checkout/success`** with order summary + estimated delivery.
12. **Homepage additions** — "Best Sellers" section, "Smart Recommendations" strip, all matching current design.

### Product Catalog
- Static catalog module (`src/data/products.ts`) with ~16 products across the 10 categories the client listed (Tumblers, Mugs, Notebooks, Journals, Picture Products, Labels/Stickers, Gift Boxes, Party Favors, Business Branding, Custom Gifts). Reuses existing generated images + generates a handful of new category images to fill gaps.
- Products carry: slug, name, price, category, images, description, `customizable` flag, `bestSeller`, `inStock`.
- This gives real filtering / search / related products without requiring a database this turn.

### Admin `/admin`
- Auth-gated route (Lovable Cloud email/password + `admin` role via `has_role`).
- Dashboard: product list, add/edit/delete via a simple form. Products persisted to Lovable Cloud (Supabase) so admin edits are real.
- Order list (read-only) — orders written by the Stripe webhook.

### Backend (Lovable Cloud)
- Enable Lovable Cloud.
- Tables: `products`, `orders`, `order_items`, `profiles`, `user_roles` (+ `app_role` enum + `has_role` SECURITY DEFINER fn). Full GRANTs + RLS per project rules.
- On first load, if `products` is empty, seed from the static catalog (migration seed).
- Stripe payments enabled via `payments--enable_stripe_payments`. Checkout session server function + webhook writes order rows.

## Deferred (call out, don't build this turn)
- Real image upload for customization to Cloudinary/Storage — I'll wire the UI + local preview; hooking uploads to Lovable Storage can follow if you want it.
- Email notifications, gift wrapping upsell, AI Styling Assistant — noted as future.
- Shippo live rates — I'll show flat delivery options (Standard / Express / Local pickup); Shippo API integration is a follow-up.
- Paystack — Stripe only for now (Lovable's built-in seamless Stripe is the recommended path; adding Paystack requires BYOK setup).

## Order of operations
1. Enable Lovable Cloud + Stripe Payments (requires your approval clicks).
2. Migration: schema + seed.
3. Zustand stores + Drawer + Search mounted in `SiteChrome`.
4. Product catalog module + Shop upgrade + Quick View.
5. Product Details + Customization + Related.
6. Cart page + Wishlist page.
7. Checkout flow + Stripe session + webhook + success page.
8. Admin auth + dashboard.
9. Homepage Best Sellers / Recommendations sections.

## Confirm before I start
- **Payments**: OK to enable Lovable's built-in Stripe (seamless, no keys from you)? Paystack would need a separate BYOK setup later.
- **Backend**: OK to enable Lovable Cloud (managed Postgres + auth + storage) so admin edits + orders are real?
- **Admin account**: after Cloud is on, sign up once at `/auth`, then I'll grant your user the `admin` role via SQL.

Reply "go" and I'll execute end-to-end.
