import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Header, Footer } from "@/components/site/SiteChrome";
import { getPublicGalleryProject } from "@/lib/gallery";

export const Route = createFileRoute("/inspiration/$slug")({
  loader: async ({ params }) => {
    const project = await getPublicGalleryProject(params.slug).catch(() => null);
    if (!project) throw notFound();
    return { project };
  },
  component: InspirationDetailPage,
});

function InspirationDetailPage() {
  const { project } = Route.useLoaderData();
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-16">
        <Link
          to="/inspiration"
          search={{ category: "" }}
          className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground hover:text-gold"
        >
          ← Back to Inspiration
        </Link>
        <div className="mt-10 grid gap-12 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="columns-1 gap-4 sm:columns-2">
            {project.images.map((image) => (
              <img
                key={image.id}
                src={image.image_url}
                alt={image.alt_text || project.title}
                className="mb-4 w-full break-inside-avoid rounded-sm object-cover"
              />
            ))}
          </div>
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="text-[11px] uppercase tracking-[0.28em] text-gold">
              Work We&apos;ve Created
            </p>
            <h1 className="mt-3 font-display text-5xl leading-tight text-ink">{project.title}</h1>
            {project.description && (
              <p className="mt-6 text-sm leading-relaxed text-foreground/75">
                {project.description}
              </p>
            )}
            <div className="mt-8 grid gap-5 border-y border-border py-6 text-sm">
              <Detail label="Product" values={[project.product_type || "Custom piece"]} />
              <Detail label="Occasion" values={project.occasions} />
              <Detail label="Materials" values={project.materials} />
              <Detail label="Colors" values={project.colors} />
              <Detail label="Technique" values={project.techniques} />
            </div>
            <p className="mt-7 text-xs leading-relaxed text-muted-foreground">
              This piece is an example. We can create something inspired by it using your preferred
              colors, text, and occasion.
            </p>
            <Link
              to="/custom"
              search={{
                ref: project.title,
                type: project.product_type ?? "",
                occasion: project.occasions[0] ?? "",
              }}
              className="mt-6 inline-flex rounded-full bg-ink px-6 py-3.5 text-[11px] uppercase tracking-[0.22em] text-background hover:bg-gold hover:text-ink"
            >
              Request Similar Design
            </Link>
            {project.product_id && (
              <p className="mt-6">
                <Link
                  to="/shop"
                  className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground hover:text-gold"
                >
                  Browse base products →
                </Link>
              </p>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Detail({ label, values }: { label: string; values: string[] }) {
  if (!values.length) return null;
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</div>
      <div className="mt-1 text-foreground/80">{values.join(" · ")}</div>
    </div>
  );
}
