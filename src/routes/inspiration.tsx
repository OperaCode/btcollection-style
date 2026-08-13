import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { QRCodeSVG } from "qrcode.react";
import { Sparkles } from "lucide-react";
import { Header, Footer } from "@/components/site/SiteChrome";
import { GALLERY_QUERY_KEY, listPublicGallery, type GalleryProject } from "@/lib/gallery";
import { CATEGORIES } from "@/lib/categories";

const CATALOGUE_URL = "https://breakthroughcollection.com/inspiration";

export const Route = createFileRoute("/inspiration")({
  validateSearch: (search: Record<string, unknown>) => ({
    category: typeof search.category === "string" ? search.category : "",
  }),
  head: () => ({
    meta: [
      { title: "Inspiration Gallery — Breakthrough Collection LLC" },
      {
        name: "description",
        content: "Explore custom gifts and keepsakes created by Breakthrough Collection.",
      },
    ],
  }),
  component: InspirationPage,
});

function useInView<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -80px 0px", threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, visible] as const;
}

function InspirationPage() {
  const { category } = Route.useSearch();
  const projects = useQuery({ queryKey: GALLERY_QUERY_KEY, queryFn: listPublicGallery });
  const list = projects.data ?? [];
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  const sections = useMemo(() => {
    const groups = new Map<string, GalleryProject[]>();
    for (const project of list) {
      const key = project.product_type?.trim() || "More Inspiration";
      const items = groups.get(key) ?? [];
      items.push(project);
      groups.set(key, items);
    }
    const known = CATEGORIES.filter((c) => groups.has(c));
    const rest = [...groups.keys()]
      .filter((k) => !(CATEGORIES as readonly string[]).includes(k))
      .sort();
    return [...known, ...rest].map((key) => ({ key, items: groups.get(key) ?? [] }));
  }, [list]);

  useEffect(() => {
    if (!category) return;
    const el = sectionRefs.current[category];
    if (el) {
      requestAnimationFrame(() => el.scrollIntoView({ behavior: "smooth", block: "start" }));
    }
  }, [category, sections]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="mx-auto max-w-7xl px-4 pb-24 pt-10 md:px-8 md:pt-14">
        <div className="animate-fade-up mb-14 flex flex-col gap-8 border-b border-border pb-8 md:mb-16 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="inline-flex rounded-full border border-gold/45 bg-gold/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-ink">
              Inspiration Gallery
            </p>
            <h1 className="mt-3 font-display text-4xl text-ink md:text-5xl">
              Our Catalogue of Finished Work
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-foreground/70">
              Real pieces we&apos;ve made for customers — browse by category below, or use any
              piece as the starting point for your own colors, text, photos, and occasion.
            </p>
            <p className="mt-4 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              {list.length} {list.length === 1 ? "piece" : "pieces"} on display
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-4 self-start rounded-lg border border-border bg-card px-5 py-4 lg:self-auto">
            <div className="rounded-md bg-white p-2 shadow-sm">
              <QRCodeSVG value={CATALOGUE_URL} size={84} level="M" fgColor="#1a1a1a" bgColor="#ffffff" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.22em] text-gold">Scan to Explore</p>
              <p className="mt-1 max-w-[9rem] text-xs leading-snug text-foreground/70">
                Open this catalogue on your phone
              </p>
            </div>
          </div>
        </div>

        {projects.isLoading ? (
          <div className="grid grid-cols-2 gap-x-5 gap-y-12 sm:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/5] rounded-lg bg-muted" />
                <div className="mt-4 h-4 w-2/3 rounded-full bg-muted" />
              </div>
            ))}
          </div>
        ) : list.length === 0 ? (
          <p className="py-20 text-center text-sm text-muted-foreground">
            The gallery is being curated. Check back soon.
          </p>
        ) : (
          <div className="space-y-20">
            {sections.map((section) => (
              <section
                key={section.key}
                ref={(el) => {
                  sectionRefs.current[section.key] = el;
                }}
                className="scroll-mt-24"
              >
                <div className="mb-6 flex items-baseline gap-3">
                  <span className="h-px w-8 bg-gold" />
                  <h2 className="font-display text-2xl text-ink md:text-3xl">{section.key}</h2>
                  <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                    {section.items.length} {section.items.length === 1 ? "piece" : "pieces"}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-x-5 gap-y-12 sm:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
                  {section.items.map((project, i) => (
                    <GalleryCard key={project.id} project={project} index={i} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

function GalleryCard({ project, index }: { project: GalleryProject; index: number }) {
  const [ref, visible] = useInView<HTMLDivElement>();
  const image = project.images[0];
  if (!image) return null;
  const caption = project.occasions[0] || project.techniques[0] || project.product_type;

  return (
    <div
      ref={ref}
      style={{ transitionDelay: visible ? `${(index % 8) * 70}ms` : "0ms" }}
      className={`group transition-all duration-700 ease-out ${
        visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      }`}
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-muted shadow-sm transition duration-300 group-hover:shadow-xl">
        <Link
          to="/inspiration/$slug"
          params={{ slug: project.slug }}
          search={{ category: "" }}
          className="block h-full w-full"
        >
          <img
            src={image.image_url}
            alt={image.alt_text || project.title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.06]"
          />
        </Link>

        {caption && (
          <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-background/90 px-3 py-1 text-[9px] uppercase tracking-[0.18em] text-ink">
            {caption}
          </span>
        )}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-70 transition duration-300 group-hover:opacity-100" />

        <div className="absolute inset-x-3 bottom-3 opacity-100 transition duration-300 md:translate-y-2 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100">
          <Link
            to="/custom"
            search={{
              ref: project.title,
              type: project.product_type ?? "",
              occasion: project.occasions[0] ?? "",
            }}
            className="flex items-center justify-center gap-2 rounded-full bg-ink px-4 py-2.5 text-[10px] font-medium uppercase tracking-[0.2em] text-background transition hover:bg-gold hover:text-ink"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Use This Inspiration
          </Link>
        </div>
      </div>
      <div className="mt-4">
        <span className="font-display text-lg leading-tight text-ink transition group-hover:text-gold">
          {project.title}
        </span>
      </div>
    </div>
  );
}
