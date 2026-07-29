import { Link } from "@tanstack/react-router";
import {
  Search,
  Heart,
  ShoppingBag,
  Menu,
  X,
  Instagram,
  Facebook,
  MessageCircle,
} from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import { listPublicProducts, PRODUCTS_QUERY_KEY } from "@/lib/catalog";
import { formatUSD } from "@/lib/cart";
import { SOCIAL_LINKS, WHATSAPP_URL } from "@/lib/site-config";
// import logoMark from "@/assets/logo-mark.png";
import logoMark from "@/assets/bclogo.jpeg";

export const NAV = [
  { label: "Home", to: "/" as const },
  { label: "Shop", to: "/shop" as const },
  { label: "Custom Order", to: "/custom" as const },
  { label: "About", to: "/about" as const },
  // { label: "Contact", to: "/contact" as const },
];

export function Announcement() {
  return (
    <div className="bg-primary text-primary-foreground text-[10px] uppercase leading-relaxed tracking-[0.14em] sm:text-[12px] sm:tracking-[0.18em]">
      <div className="mx-auto max-w-7xl px-3 py-2 text-center sm:px-4 sm:py-2.5">
        Now Booking Custom Embroidery &amp; Engraving Gifts · Ships Nationwide
      </div>
    </div>
  );
}

function Monogram() {
  return (
    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-gold/60 bg-white sm:h-11 sm:w-11">
      <img src={logoMark} alt="Breakthrough Collection LLC" className="h-7 w-7 object-contain sm:h-8 sm:w-8" />
    </div>
  );
}

function IconBtn({
  children,
  label,
  className = "",
  onClick,
}: {
  children: ReactNode;
  label: string;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-foreground/80 transition hover:bg-muted hover:text-foreground sm:h-10 sm:w-10 ${className}`}
    >
      {children}
    </button>
  );
}

export function Header() {
  const { count, openDrawer } = useCart();
  const wishlist = useWishlist();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!mobileOpen && !searchOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen, searchOpen]);

  const products = useQuery({ queryKey: PRODUCTS_QUERY_KEY, queryFn: listPublicProducts });

  const results = useMemo(() => {
    const list = products.data ?? [];
    const q = query.trim().toLowerCase();
    if (!q) return list.slice(0, 4);
    return list
      .filter((p) =>
        [p.name, p.category, p.description ?? "", ...(p.occasions ?? [])]
          .join(" ")
          .toLowerCase()
          .includes(q),
      )
      .slice(0, 6);
  }, [query, products.data]);

  const wishlistProducts = (products.data ?? []).filter((p) => wishlist.has(p.slug));

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-2 px-3 py-3 sm:gap-3 sm:px-4 sm:py-4 md:px-8 lg:grid-cols-[auto_1fr_auto]">
          <Link
            to="/"
            className="flex min-w-0 items-center gap-3"
            onClick={() => setMobileOpen(false)}
          >
            <Monogram />
            <div className="min-w-0">
              <div className="truncate font-display text-base leading-none tracking-wide text-ink sm:text-lg md:text-xl">
                Breakthrough Collection <span className="italic text-gold">LLC</span>
              </div>
              <div className="mt-1 hidden truncate text-[10px] uppercase tracking-[0.2em] text-muted-foreground sm:block md:tracking-[0.25em]">
                Every Stitch Tells a Story
              </div>
            </div>
          </Link>

          <nav className="hidden items-center justify-center gap-8 text-[13px] uppercase tracking-[0.2em] text-foreground/80 lg:flex">
            {NAV.map((n) => (
              <Link
                key={n.label}
                to={n.to}
                className="transition hover:text-gold"
                activeProps={{ className: "text-gold" }}
                activeOptions={{ exact: true }}
              >
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1 text-foreground">
            <IconBtn label="Search" onClick={() => setSearchOpen(true)}>
              <Search className="h-[18px] w-[18px]" />
            </IconBtn>
            <IconBtn label="Wishlist" onClick={() => setSearchOpen(true)}>
              <span className="relative">
                <Heart className="h-[18px] w-[18px]" />
                {wishlist.count > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 grid h-4 w-4 place-items-center rounded-full bg-gold text-[10px] font-semibold text-ink">
                    {wishlist.count}
                  </span>
                )}
              </span>
            </IconBtn>
            <IconBtn label="Cart" onClick={openDrawer}>
              <span className="relative">
                <ShoppingBag className="h-[18px] w-[18px]" />
                {count > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 grid h-4 w-4 place-items-center rounded-full bg-gold text-[10px] font-semibold text-ink">
                    {count}
                  </span>
                )}
              </span>
            </IconBtn>
            <IconBtn label="Menu" className="lg:hidden" onClick={() => setMobileOpen(true)}>
              <Menu className="h-[18px] w-[18px]" />
            </IconBtn>
          </div>
        </div>
      </header>

      <div
        onClick={() => setMobileOpen(false)}
        className={`fixed inset-0 z-50 bg-ink/50 backdrop-blur-sm transition-opacity lg:hidden ${
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col bg-background shadow-2xl transition-transform lg:hidden ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <div className="font-display text-2xl text-ink">Menu</div>
          <IconBtn label="Close menu" onClick={() => setMobileOpen(false)}>
            <X className="h-4 w-4" />
          </IconBtn>
        </div>
        <nav className="flex flex-col px-6 py-6 text-[12px] uppercase tracking-[0.24em] text-foreground/80">
          {NAV.map((n) => (
            <Link
              key={n.label}
              to={n.to}
              onClick={() => setMobileOpen(false)}
              className="border-b border-border py-4 transition hover:text-gold"
              activeProps={{ className: "text-gold" }}
              activeOptions={{ exact: true }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto border-t border-border p-6">
          <button
            onClick={() => {
              setMobileOpen(false);
              setSearchOpen(true);
            }}
            className="flex w-full items-center justify-center gap-3 rounded-full bg-ink px-6 py-3.5 text-[11px] uppercase tracking-[0.22em] text-background hover:bg-gold hover:text-ink"
          >
            <Search className="h-4 w-4" /> Search Products
          </button>
        </div>
      </aside>

      <div
        onClick={() => setSearchOpen(false)}
        className={`fixed inset-0 z-50 bg-ink/55 backdrop-blur-sm transition-opacity ${
          searchOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <section
        aria-label="Search products"
        className={`fixed left-1/2 top-6 z-50 w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 rounded-sm border border-border bg-background p-5 shadow-2xl transition ${
          searchOpen ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-4 opacity-0"
        }`}
      >
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <Search className="h-4 w-4 text-gold" />
          <input
            autoFocus={searchOpen}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search gifts, mugs, apparel..."
            className="h-10 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <IconBtn label="Close search" onClick={() => setSearchOpen(false)}>
            <X className="h-4 w-4" />
          </IconBtn>
        </div>
        <div className="mt-5 grid gap-3">
          {results.map((p) => (
            <Link
              key={p.slug}
              to="/product/$slug"
              params={{ slug: p.slug }}
              onClick={() => setSearchOpen(false)}
              className="flex items-center gap-4 rounded-sm p-2 transition hover:bg-cream"
            >
              <img src={p.images[0]} alt="" className="h-16 w-14 rounded-sm object-cover" />
              <div className="min-w-0 flex-1">
                <div className="truncate font-display text-lg text-ink">{p.name}</div>
                <div className="mt-0.5 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  {p.category}
                </div>
              </div>
              <span className="text-sm font-medium text-ink">{formatUSD(p.price)}</span>
            </Link>
          ))}
        </div>
        {wishlistProducts.length > 0 && (
          <div className="mt-5 border-t border-border pt-4">
            <div className="mb-3 text-[11px] uppercase tracking-[0.24em] text-gold">Wishlist</div>
            <div className="flex flex-wrap gap-2">
              {wishlistProducts.map((p) => (
                <Link
                  key={p.slug}
                  to="/product/$slug"
                  params={{ slug: p.slug }}
                  onClick={() => setSearchOpen(false)}
                  className="rounded-full border border-border px-3 py-1.5 text-[11px] text-foreground/75 hover:border-gold hover:text-gold"
                >
                  {p.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>
    </>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M16.5 2h-3.2v13.6c0 1.5-1.2 2.7-2.7 2.7a2.7 2.7 0 0 1-2.7-2.7 2.7 2.7 0 0 1 2.7-2.7c.3 0 .6.05.9.14v-3.3a5.9 5.9 0 0 0-.9-.07 5.9 5.9 0 0 0-5.9 5.9 5.9 5.9 0 0 0 5.9 5.9 5.9 5.9 0 0 0 5.9-5.9V8.3a8.3 8.3 0 0 0 4.7 1.5V6.6a5 5 0 0 1-4.7-4.6Z" />
    </svg>
  );
}

function Social({
  icon: Icon,
  href,
  label,
}: {
  icon: (props: { className?: string }) => ReactNode;
  href: string;
  label: string;
}) {
  const disabled = !href;
  return (
    <a
      href={href || "#"}
      target={disabled ? undefined : "_blank"}
      rel={disabled ? undefined : "noreferrer"}
      aria-label={label}
      aria-disabled={disabled}
      className={`grid h-10 w-10 place-items-center rounded-full border border-white/20 text-background/80 transition hover:border-gold hover:text-gold ${
        disabled ? "pointer-events-none opacity-40" : ""
      }`}
    >
      <Icon className="h-4 w-4" />
    </a>
  );
}

function FooterCol({ title, items }: { title: string; items: { label: string; to?: string }[] }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-[0.28em] text-gold">{title}</div>
      <ul className="mt-5 space-y-3 text-sm text-background/75">
        {items.map((l) => (
          <li key={l.label}>
            {l.to ? (
              <Link to={l.to} className="transition hover:text-gold">
                {l.label}
              </Link>
            ) : (
              <a href="#" className="transition hover:text-gold">
                {l.label}
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="bg-ink text-background">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-4 py-16 md:grid-cols-5 md:px-8">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-full border border-gold/60 bg-white">
              <img
                src={logoMark}
                alt="Breakthrough Collection LLC"
                className="h-8 w-8 object-contain"
              />
            </div>
            <div>
              <div className="font-display text-xl">
                Breakthrough Collection <span className="italic text-gold">LLC</span>
              </div>
              <div className="text-[10px] uppercase tracking-[0.25em] text-background/60">
                Every Stitch Tells a Story
              </div>
            </div>
          </div>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-background/70">
            Faith-inspired, personalized apparel, mugs, accessories, and curated gift sets — crafted
            with care in the United States.
          </p>
          <div className="mt-6 flex gap-2">
            <Social icon={Instagram} href={SOCIAL_LINKS.instagram} label="Instagram" />
            <Social icon={Facebook} href={SOCIAL_LINKS.facebook} label="Facebook" />
            <Social icon={TikTokIcon} href={SOCIAL_LINKS.tiktok} label="TikTok" />
            <Social icon={MessageCircle} href={WHATSAPP_URL} label="WhatsApp" />
          </div>
        </div>

        <FooterCol
          title="Shop"
          items={[
            { label: "All Products", to: "/shop" },
            { label: "Faith Apparel", to: "/shop" },
            { label: "Personalized Mugs", to: "/shop" },
            { label: "Gift Sets", to: "/shop" },
          ]}
        />
        <FooterCol
          title="Company"
          items={[
            { label: "About Us", to: "/about" },
            { label: "Custom Quote", to: "/custom" },
            { label: "Contact", to: "/contact" },
          ]}
        />
        <FooterCol
          title="Policies"
          items={[
            { label: "Privacy Policy", to: "/privacy" },
            { label: "Shipping Policy", to: "/shipping" },
            // { label: "Returns & Refunds", to: "/returns" },
            { label: "Terms of Service", to: "/terms" },
          ]}
        />
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-[11px] uppercase tracking-[0.22em] text-background/55 md:flex-row md:px-8">
          <span>
            © {new Date().getFullYear()} Breakthrough Collection LLC. All rights reserved.
          </span>
          <span>Crafted with love · Made for the journey</span>
        </div>
      </div>
    </footer>
  );
}

export function PageHero({
  kicker,
  title,
  italic,
  blurb,
  image,
}: {
  kicker: string;
  title: string;
  italic?: string;
  blurb?: string;
  image: string;
}) {
  return (
    <section className="relative isolate overflow-hidden">
      <img src={image} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink/85 via-ink/65 to-ink/40" />
      <div className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-28">
        <p className="text-[11px] uppercase tracking-[0.32em] text-gold">{kicker}</p>
        <h1 className="mt-4 max-w-3xl font-display text-5xl leading-[1] text-background md:text-7xl">
          {title}
          {italic && (
            <>
              {" "}
              <span className="italic text-gold-soft">{italic}</span>
            </>
          )}
        </h1>
        {blurb && <p className="mt-6 max-w-xl text-base/relaxed text-background/85">{blurb}</p>}
      </div>
    </section>
  );
}

export function PageBanner({
  kicker,
  title,
  italic,
  blurb,
  image,
  imagePosition = "center",
}: {
  kicker: string;
  title: string;
  italic?: string;
  blurb?: string;
  image?: string;
  imagePosition?: string;
}) {
  return (
    <section className="relative isolate overflow-hidden border-b border-border bg-cream/70">
      {image && (
        <>
          <img
            src={image}
            alt=""
            className="absolute inset-0 -z-10 h-full w-full object-cover"
            style={{ objectPosition: imagePosition }}
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink/82 via-ink/66 to-ink/35" />
        </>
      )}
      {!image && (
        <div className="absolute inset-x-0 bottom-0 -z-10 h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent" />
      )}
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
        <p
          className={`text-[11px] uppercase tracking-[0.32em] ${image ? "text-gold" : "text-gold"}`}
        >
          {kicker}
        </p>
        <h1
          className={`mt-3 max-w-3xl font-display text-4xl leading-[1.05] md:text-5xl ${
            image ? "text-background" : "text-ink"
          }`}
        >
          {title}
          {italic && (
            <>
              {" "}
              <span className={`italic ${image ? "text-gold-soft" : "text-gold"}`}>{italic}</span>
            </>
          )}
        </h1>
        {blurb && (
          <p
            className={`mt-4 max-w-2xl text-sm/relaxed md:text-base ${
              image ? "text-background/82" : "text-foreground/75"
            }`}
          >
            {blurb}
          </p>
        )}
      </div>
    </section>
  );
}

export function PageHeader({
  kicker,
  title,
  italic,
  blurb,
}: {
  kicker: string;
  title: string;
  italic?: string;
  blurb?: string;
}) {
  return (
    <section className="border-b border-border bg-cream/60">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16">
        <p className="text-[11px] uppercase tracking-[0.32em] text-gold">{kicker}</p>
        <h1 className="mt-3 max-w-3xl font-display text-4xl leading-[1.05] text-ink md:text-5xl">
          {title}
          {italic && (
            <>
              {" "}
              <span className="italic text-gold">{italic}</span>
            </>
          )}
        </h1>
        {blurb && (
          <p className="mt-4 max-w-2xl text-sm/relaxed text-foreground/75 md:text-base">{blurb}</p>
        )}
      </div>
    </section>
  );
}
