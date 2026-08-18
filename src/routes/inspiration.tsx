import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Heart, Sparkles } from "lucide-react";
import { Header, Footer } from "@/components/site/SiteChrome";
import { GALLERY_QUERY_KEY, listPublicGallery, type GalleryProject } from "@/lib/gallery";
import { OCCASIONS } from "@/lib/occasions";

export const Route = createFileRoute("/inspiration")({
  validateSearch: (search: Record<string, unknown>) => ({
    category: typeof search.category === "string" ? search.category : "",
  }),
  head: () => ({
    meta: [
      { title: "Inspiration Studio — Breakthrough Collection LLC" },
      {
        name: "description",
        content: "Discover meaningful, custom gift ideas for every person and milestone.",
      },
    ],
  }),
  component: InspirationPage,
});

const PEOPLE = ["Mom", "Dad", "Her", "Him", "Couples", "Friends", "Coworkers", "Family"];

function InspirationPage() {
  const { category } = Route.useSearch();
  const projects = useQuery({ queryKey: GALLERY_QUERY_KEY, queryFn: listPublicGallery });
  const [activeOccasion, setActiveOccasion] = useState("");
  const [activePerson, setActivePerson] = useState("");
  const galleryRef = useRef<HTMLElement | null>(null);
  const list = projects.data ?? [];

  const displayed = useMemo(() => {
    const terms = [activeOccasion, activePerson].filter(Boolean).map((value) => value.toLowerCase());
    if (!terms.length) return list;
    return list.filter((project) => {
      const text = [
        project.title,
        project.description ?? "",
        project.product_type ?? "",
        ...(project.occasions ?? []),
        ...(project.techniques ?? []),
      ].join(" ").toLowerCase();
      return terms.every((term) => text.includes(term));
    });
  }, [activeOccasion, activePerson, list]);

  function explore(occasion = "", person = "") {
    setActiveOccasion(occasion);
    setActivePerson(person);
    requestAnimationFrame(() => galleryRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  useEffect(() => {
    if (category) explore(category);
    // The category link comes from the product page; only react when it changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <section className="relative isolate overflow-hidden border-b border-border bg-cream/50">
          <div className="absolute inset-x-0 top-0 -z-10 h-80 bg-[radial-gradient(circle_at_80%_15%,rgba(202,164,74,0.24),transparent_38%),radial-gradient(circle_at_15%_55%,rgba(255,255,255,0.95),transparent_36%)]" />
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-18 md:px-8 md:py-24 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div>
              <p className="inline-flex rounded-full border border-gold/45 bg-gold/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-ink">Inspiration Studio</p>
              <h1 className="mt-5 max-w-3xl font-display text-5xl leading-[0.96] text-ink md:text-7xl">Find something worth <span className="italic text-gold">remembering.</span></h1>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-foreground/75">Explore gifts we&apos;ve created for birthdays, celebrations, faith, milestones, and the people who matter most.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <button onClick={() => explore()} className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3.5 text-[11px] font-medium uppercase tracking-[0.2em] text-background transition hover:bg-gold hover:text-ink">Explore Gift Ideas <ArrowRight className="h-4 w-4" /></button>
                <Link to="/custom" search={{ ref: "", type: "", occasion: "" }} className="inline-flex items-center gap-2 rounded-full border border-ink/25 px-6 py-3.5 text-[11px] font-medium uppercase tracking-[0.2em] text-ink transition hover:border-gold hover:text-gold">Create Something Custom <Sparkles className="h-4 w-4" /></Link>
              </div>
              <p className="mt-5 text-sm italic text-foreground/65">Don&apos;t see exactly what you&apos;re looking for? We can create it with you.</p>
            </div>
            <aside className="border-l-2 border-gold/70 pl-5 pb-1 lg:ml-auto lg:max-w-xs">
              <p className="text-[10px] uppercase tracking-[0.27em] text-gold">Every gift tells a story</p>
              <p className="mt-3 font-display text-2xl leading-tight text-ink">Discover → Explore → Imagine → Customize → Order</p>
            </aside>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-18 md:px-8 md:py-24">
          <SectionIntro kicker="Start with the moment" title="What are you celebrating?" body="Choose an occasion and we&apos;ll bring you closer to ideas made for it." />
          <div className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {OCCASIONS.map(([title, body], index) => <button key={title} onClick={() => explore(title)} className={`group min-h-40 rounded-sm border p-5 text-left transition hover:-translate-y-1 hover:border-gold hover:shadow-lg ${activeOccasion === title ? "border-gold bg-gold/10" : "border-border bg-card"}`}><span className="text-[10px] uppercase tracking-[0.22em] text-gold">0{index + 1}</span><h2 className="mt-5 font-display text-2xl text-ink">{title}</h2><p className="mt-2 text-sm text-foreground/65">{body}</p><ArrowRight className="mt-5 h-4 w-4 text-gold transition group-hover:translate-x-1" /></button>)}
          </div>
        </section>

        <section className="border-y border-border bg-ink py-18 text-background md:py-22">
          <div className="mx-auto max-w-7xl px-4 md:px-8">
            <SectionIntro dark kicker="Make it personal" title="Who are you celebrating?" body="Start with the person, then let the details become theirs." />
            <div className="mt-8 flex gap-3 overflow-x-auto pb-2">
              {PEOPLE.map((person) => <button key={person} onClick={() => explore(activeOccasion, person)} className={`min-w-30 rounded-full border px-5 py-4 text-[11px] uppercase tracking-[0.18em] transition ${activePerson === person ? "border-gold bg-gold text-ink" : "border-white/25 text-background hover:border-gold hover:text-gold"}`}>{person}</button>)}
            </div>
          </div>
        </section>

        <section ref={galleryRef} className="scroll-mt-20 mx-auto max-w-7xl px-4 py-18 md:px-8 md:py-24">
          <div className="flex flex-col gap-5 border-b border-border pb-8 md:flex-row md:items-end md:justify-between"><SectionIntro kicker="Made with meaning" title="Explore our creations" body="Every image begins with a person, a moment, and an idea worth holding onto." /><div className="flex flex-wrap gap-2">{[activeOccasion, activePerson].filter(Boolean).map((filter) => <span key={filter} className="rounded-full bg-gold/15 px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] text-ink">{filter}</span>)}{(activeOccasion || activePerson) && <button onClick={() => { setActiveOccasion(""); setActivePerson(""); }} className="text-[10px] uppercase tracking-[0.18em] text-gold hover:text-ink">Clear filters</button>}</div></div>
          {projects.isLoading ? <GallerySkeleton /> : displayed.length === 0 ? <div className="py-18 text-center"><p className="font-display text-2xl text-ink">We&apos;re curating ideas for that one.</p><p className="mt-2 text-sm text-muted-foreground">Tell us what you&apos;re imagining and we&apos;ll help bring it to life.</p><Link to="/custom" search={{ ref: "", type: "", occasion: activeOccasion }} className="mt-6 inline-flex rounded-full bg-ink px-5 py-3 text-[10px] uppercase tracking-[0.2em] text-background hover:bg-gold hover:text-ink">Request something similar</Link></div> : <div className="mt-10 columns-1 gap-5 sm:columns-2 lg:columns-3">{displayed.map((project, index) => <GalleryCard key={project.id} project={project} index={index} />)}</div>}
        </section>

        <section className="border-y border-border bg-cream/65"><div className="mx-auto grid max-w-7xl gap-10 px-4 py-18 md:px-8 md:py-24 lg:grid-cols-[0.8fr_1.2fr]"><div><p className="text-[10px] uppercase tracking-[0.28em] text-gold">Build your gift</p><h2 className="mt-4 font-display text-4xl leading-[1] text-ink md:text-5xl">Have a few ideas? Put them together.</h2><p className="mt-5 max-w-md text-sm leading-relaxed text-foreground/70">Tell us the occasion, choose your pieces, and add the details that make it unmistakably theirs.</p><Link to="/custom" search={{ ref: "", type: "", occasion: activeOccasion }} className="mt-7 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3.5 text-[10px] uppercase tracking-[0.2em] text-background hover:bg-gold hover:text-ink">Build a gift <ArrowRight className="h-4 w-4" /></Link></div><ol className="grid gap-4 sm:grid-cols-2">{[["01", "Choose the occasion", "Birthday · Wedding · Anniversary · Appreciation"], ["02", "Pick your pieces", "Mug · Tumbler · Apparel · Tote · Gift Box"], ["03", "Personalize it", "Name · Photo · Message"], ["04", "We&apos;ll make it", "A thoughtful gift, made for their story."]].map(([num, title, body]) => <li key={num} className="rounded-sm border border-border bg-background p-5"><span className="text-[10px] tracking-[0.22em] text-gold">{num}</span><h3 className="mt-4 font-display text-xl text-ink">{title}</h3><p className="mt-2 text-sm text-foreground/65">{body}</p></li>)}</ol></div></section>
      </main>
      <Footer />
    </div>
  );
}

function SectionIntro({ kicker, title, body, dark = false }: { kicker: string; title: string; body: string; dark?: boolean }) {
  return <div><p className="text-[10px] uppercase tracking-[0.28em] text-gold">{kicker}</p><h2 className={`mt-3 font-display text-4xl leading-none md:text-5xl ${dark ? "text-background" : "text-ink"}`}>{title}</h2><p className={`mt-4 max-w-xl text-sm leading-relaxed ${dark ? "text-background/70" : "text-foreground/70"}`}>{body}</p></div>;
}

function GallerySkeleton() { return <div className="mt-10 columns-1 gap-5 sm:columns-2 lg:columns-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="mb-5 break-inside-avoid animate-pulse rounded-sm bg-muted" style={{ height: `${260 + (i % 3) * 70}px` }} />)}</div>; }

function GalleryCard({ project, index }: { project: GalleryProject; index: number }) {
  const image = project.images[0];
  if (!image) return null;
  const occasion = project.occasions?.[0] || "Custom creation";
  const story = project.description || `Created with care for a meaningful ${occasion.toLowerCase()}.`;
  return <article className="group mb-5 break-inside-avoid overflow-hidden rounded-sm bg-card shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"><Link to="/inspiration/$slug" params={{ slug: project.slug }} search={{ category: "" }} className="block overflow-hidden"><img src={image.image_url} alt={image.alt_text || project.title} loading={index > 2 ? "lazy" : "eager"} className="w-full object-cover transition duration-700 group-hover:scale-[1.04]" /></Link><div className="p-5"><p className="text-[9px] uppercase tracking-[0.2em] text-gold">{occasion} · {project.product_type || "Gift"}</p><h3 className="mt-2 font-display text-2xl leading-tight text-ink">{project.title}</h3><p className="mt-2 text-sm leading-relaxed text-foreground/65">{story}</p><div className="mt-5 flex items-center justify-between gap-3"><Link to="/custom" search={{ ref: project.title, type: project.product_type || "", occasion: project.occasions?.[0] || "" }} className="inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.18em] text-ink transition hover:text-gold">Get this look <ArrowRight className="h-3.5 w-3.5" /></Link><Heart className="h-4 w-4 text-gold/70" /></div></div></article>;
}
