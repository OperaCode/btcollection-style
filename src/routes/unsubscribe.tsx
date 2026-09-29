import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, MailX } from "lucide-react";
import { Header, Footer } from "@/components/site/SiteChrome";
import { unsubscribeFromNewsletter } from "@/lib/newsletter-email";

export const Route = createFileRoute("/unsubscribe")({
  validateSearch: (search: Record<string, unknown>) => ({
    email: typeof search.email === "string" ? search.email : "",
  }),
  head: () => ({
    meta: [{ title: "Unsubscribe — Breakthrough Collection LLC" }, { name: "robots", content: "noindex" }],
  }),
  component: UnsubscribePage,
});

function UnsubscribePage() {
  const { email } = Route.useSearch();
  const [status, setStatus] = useState<"idle" | "working" | "done" | "error">("idle");
  const [error, setError] = useState("");

  async function handleUnsubscribe() {
    setStatus("working");
    setError("");
    try {
      await unsubscribeFromNewsletter({ data: { email } });
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <section className="mx-auto max-w-lg px-4 py-24 text-center md:py-32">
        {!email ? (
          <p className="text-sm text-muted-foreground">No email address was provided.</p>
        ) : status === "done" ? (
          <>
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-gold/15 text-gold">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h1 className="mt-5 font-display text-3xl text-ink">You're unsubscribed</h1>
            <p className="mt-3 text-sm text-foreground/75">
              {email} won't receive newsletter emails from us anymore.
            </p>
          </>
        ) : (
          <>
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-gold/15 text-gold">
              <MailX className="h-6 w-6" />
            </div>
            <h1 className="mt-5 font-display text-3xl text-ink">Unsubscribe</h1>
            <p className="mt-3 text-sm text-foreground/75">
              Stop newsletter emails to <strong className="text-ink">{email}</strong>?
            </p>
            {error && <p className="mt-3 text-xs text-destructive">{error}</p>}
            <button
              type="button"
              onClick={handleUnsubscribe}
              disabled={status === "working"}
              className="mt-6 inline-flex items-center justify-center gap-3 rounded-full bg-ink px-6 py-3.5 text-[12px] font-medium uppercase tracking-[0.22em] text-background transition hover:bg-gold hover:text-ink disabled:opacity-60"
            >
              {status === "working" ? "Unsubscribing..." : "Confirm Unsubscribe"}
            </button>
          </>
        )}
      </section>
      <Footer />
    </div>
  );
}
