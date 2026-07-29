import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Mail, XCircle } from "lucide-react";
import { listNewsletterSubscribers } from "@/lib/admin-data";

export const Route = createFileRoute("/admin/_layout/subscribers")({
  component: AdminSubscribers,
});

function AdminSubscribers() {
  const subscribers = useQuery({
    queryKey: ["admin", "newsletter-subscribers"],
    queryFn: listNewsletterSubscribers,
  });

  return (
    <div>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-display text-3xl text-ink">Newsletter Subscribers</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Customers who signed up from the website newsletter.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-gold/50 px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-gold">
          <Mail className="h-3.5 w-3.5" />
          {subscribers.data?.length ?? 0} Subscribers
        </div>
      </div>

      <div className="mt-8 overflow-hidden rounded-sm border border-border bg-card">
        <div className="hidden grid-cols-[1fr_1.2fr_0.7fr_0.8fr_0.8fr] gap-4 border-b border-border px-5 py-3 text-[11px] uppercase tracking-[0.2em] text-muted-foreground md:grid">
          <span>Name</span>
          <span>Email</span>
          <span>Source</span>
          <span>Joined</span>
          <span>Welcome Email</span>
        </div>

        {subscribers.isLoading ? (
          <p className="px-5 py-10 text-center text-sm text-muted-foreground">Loading subscribers...</p>
        ) : subscribers.data?.length ? (
          <ul className="divide-y divide-border">
            {subscribers.data.map((subscriber) => (
              <li
                key={subscriber.id}
                className="grid grid-cols-1 gap-2 px-5 py-4 text-sm md:grid-cols-[1fr_1.2fr_0.7fr_0.8fr_0.8fr] md:gap-4"
              >
                <span className="font-medium text-ink">{subscriber.full_name ?? "No name"}</span>
                <span className="text-muted-foreground">{subscriber.email}</span>
                <span className="text-muted-foreground">{subscriber.source}</span>
                <span className="text-muted-foreground">
                  {new Date(subscriber.created_at).toLocaleDateString()}
                </span>
                <span className="inline-flex items-center gap-2 text-muted-foreground">
                  {subscriber.welcome_email_sent_at ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-gold" />
                      Sent
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-muted-foreground" />
                      Not sent
                    </>
                  )}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-5 py-10 text-center text-sm text-muted-foreground">
            No newsletter subscribers yet.
          </p>
        )}
      </div>
    </div>
  );
}
