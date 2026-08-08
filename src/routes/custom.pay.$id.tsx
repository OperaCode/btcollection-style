import { createFileRoute, redirect } from "@tanstack/react-router";
import { Header, Footer } from "@/components/site/SiteChrome";
import { createCustomRequestCheckoutUrl } from "@/lib/custom-request-payment";

export const Route = createFileRoute("/custom/pay/$id")({
  head: () => ({
    meta: [{ title: "Pay Your Quote — Breakthrough Collection LLC" }, { name: "robots", content: "noindex" }],
  }),
  loader: async ({ params }) => {
    const result = await createCustomRequestCheckoutUrl({ data: { id: params.id } });
    if (result.url) throw redirect({ href: result.url });
    return { error: result.error ?? "Something went wrong starting checkout." };
  },
  component: PayRedirectPage,
});

function PayRedirectPage() {
  const { error } = Route.useLoaderData();
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <div className="mx-auto max-w-xl px-4 py-32 text-center">
        <h1 className="font-display text-3xl text-ink">Unable to start checkout</h1>
        <p className="mt-4 text-sm text-foreground/70">{error}</p>
      </div>
      <Footer />
    </div>
  );
}
