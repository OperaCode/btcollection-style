import { Link } from "@tanstack/react-router";
import {
  Search,
  Heart,
  ShoppingBag,
  Menu,
  Instagram,
  Facebook,
  Mail,
} from "lucide-react";
import type { ReactNode } from "react";

export const NAV = [
  { label: "Home", to: "/" as const },
  { label: "Shop", to: "/shop" as const },
  { label: "Custom Orders", to: "/custom" as const },
  { label: "About", to: "/about" as const },
  { label: "Contact", to: "/contact" as const },
];

export function Announcement() {
  return (
    <div className="bg-primary text-primary-foreground text-[12px] tracking-[0.18em] uppercase">
      <div className="mx-auto max-w-7xl px-4 py-2.5 text-center">
        New Arrivals Just Landed · Use code{" "}
        <span className="text-gold font-medium">BTC15</span> for 15% off your first order
      </div>
    </div>
  );
}

function Monogram() {
  return (
    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-gold/60 bg-primary text-primary-foreground">
      <span className="font-display text-base italic">BT</span>
    </div>
  );
}

function IconBtn({
  children,
  label,
  className = "",
}: {
  children: ReactNode;
  label: string;
  className?: string;
}) {
  return (
    <button
      aria-label={label}
      className={`grid h-10 w-10 place-items-center rounded-full text-foreground/80 transition hover:bg-muted hover:text-foreground ${className}`}
    >
      {children}
    </button>
  );
}

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto grid max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-4 px-4 py-4 md:px-8">
        <Link to="/" className="flex min-w-0 items-center gap-3">
          <Monogram />
          <div className="min-w-0">
            <div className="font-display text-lg leading-none tracking-wide text-ink md:text-xl">
              BT Collection <span className="italic text-gold">LLC</span>
            </div>
            <div className="mt-1 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
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
          <IconBtn label="Search"><Search className="h-[18px] w-[18px]" /></IconBtn>
          <IconBtn label="Wishlist"><Heart className="h-[18px] w-[18px]" /></IconBtn>
          <IconBtn label="Cart">
            <span className="relative">
              <ShoppingBag className="h-[18px] w-[18px]" />
              <span className="absolute -right-1.5 -top-1.5 grid h-4 w-4 place-items-center rounded-full bg-gold text-[10px] font-semibold text-ink">
                2
              </span>
            </span>
          </IconBtn>
          <IconBtn label="Menu" className="lg:hidden"><Menu className="h-[18px] w-[18px]" /></IconBtn>
        </div>
      </div>
    </header>
  );
}

function Social({ icon: Icon }: { icon: typeof Instagram }) {
  return (
    <a
      href="#"
      className="grid h-10 w-10 place-items-center rounded-full border border-white/20 text-background/80 transition hover:border-gold hover:text-gold"
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
              <Link to={l.to} className="transition hover:text-gold">{l.label}</Link>
            ) : (
              <a href="#" className="transition hover:text-gold">{l.label}</a>
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
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-4 py-16 md:grid-cols-4 md:px-8">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-full border border-gold/60 bg-background/5 font-display italic text-gold">
              BT
            </div>
            <div>
              <div className="font-display text-xl">BT Collection <span className="italic text-gold">LLC</span></div>
              <div className="text-[10px] uppercase tracking-[0.25em] text-background/60">
                Every Stitch Tells a Story
              </div>
            </div>
          </div>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-background/70">
            Faith-inspired, personalized apparel, mugs, accessories, and curated gift sets —
            crafted with care in the United States.
          </p>
          <div className="mt-6 flex gap-2">
            <Social icon={Instagram} />
            <Social icon={Facebook} />
            <Social icon={Mail} />
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
            { label: "Custom Orders", to: "/custom" },
            { label: "Contact", to: "/contact" },
            { label: "Shipping & Returns" },
          ]}
        />
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-[11px] uppercase tracking-[0.22em] text-background/55 md:flex-row md:px-8">
          <span>© {new Date().getFullYear()} BT Collection LLC. All rights reserved.</span>
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
      <img
        src={image}
        alt=""
        className="absolute inset-0 -z-10 h-full w-full object-cover"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink/85 via-ink/65 to-ink/40" />
      <div className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-28">
        <p className="text-[11px] uppercase tracking-[0.32em] text-gold">{kicker}</p>
        <h1 className="mt-4 max-w-3xl font-display text-5xl leading-[1] text-background md:text-7xl">
          {title}
          {italic && <> <span className="italic text-gold-soft">{italic}</span></>}
        </h1>
        {blurb && (
          <p className="mt-6 max-w-xl text-base/relaxed text-background/85">{blurb}</p>
        )}
      </div>
    </section>
  );
}