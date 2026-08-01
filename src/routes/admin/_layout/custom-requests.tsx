import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, CheckCircle2, ImageIcon, Loader2, Mail, Send } from "lucide-react";
import {
  listCustomRequests,
  sendCustomRequestQuoteAndNotify,
  updateCustomRequestStatus,
  type CustomRequest,
} from "@/lib/admin-data";
import { getCustomizationPhotoUrl } from "@/lib/admin-storage";
import { COLOR_SWATCHES } from "@/lib/colors";

export const Route = createFileRoute("/admin/_layout/custom-requests")({
  component: AdminCustomRequests,
});

const STATUSES = [
  "reviewing",
  "awaiting_payment",
  "processing",
  "ready",
  "shipped",
  "delivered",
  "cancelled",
] as const;

// "processing" is only ever set automatically by a confirmed Stripe payment
// (see confirmCustomRequestPayment) — all payment goes through the site, so
// it can't be picked manually from this dropdown, even though it can still
// be the current value once payment has gone through.
const MANUAL_DISABLED_STATUSES = new Set(["processing"]);

function formatUSD(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

function AdminCustomRequests() {
  const queryClient = useQueryClient();
  const [quotingId, setQuotingId] = useState<string | null>(null);

  const requests = useQuery({
    queryKey: ["admin", "custom-requests"],
    queryFn: listCustomRequests,
  });

  const setStatus = useMutation({
    mutationFn: ({ request, status }: { request: CustomRequest; status: CustomRequest["status"] }) =>
      updateCustomRequestStatus(request, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "custom-requests"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });

  const sendQuote = useMutation({
    mutationFn: ({
      request,
      price,
      note,
    }: {
      request: CustomRequest;
      price: number;
      note: string;
    }) => sendCustomRequestQuoteAndNotify(request, price, note),
    onSuccess: () => {
      setQuotingId(null);
      queryClient.invalidateQueries({ queryKey: ["admin", "custom-requests"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });

  return (
    <div>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-display text-3xl text-ink">Custom Requests</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Review custom order leads, track quote status, and follow up with customers.
          </p>
        </div>
        <div className="rounded-full border border-gold/50 px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-gold">
          {requests.data?.filter((request) => request.status === "reviewing").length ?? 0} Reviewing
        </div>
      </div>

      <div className="mt-8 grid gap-4">
        {requests.isLoading ? (
          <p className="rounded-sm border border-border bg-card px-5 py-10 text-center text-sm text-muted-foreground">
            Loading custom requests...
          </p>
        ) : requests.data?.length ? (
          requests.data.map((request) => (
            <article key={request.id} className="rounded-sm border border-border bg-card p-5">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="font-display text-2xl text-ink">{request.full_name}</h2>
                    <span className="rounded-full border border-border px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                      {request.status.replaceAll("_", " ")}
                    </span>
                  </div>
                  <a
                    href={`mailto:${request.email}`}
                    className="mt-1 inline-flex items-center gap-2 text-sm text-gold hover:underline"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    {request.email}
                  </a>
                  {request.phone && (
                    <p className="mt-1 text-sm text-muted-foreground">{request.phone}</p>
                  )}
                  <p className="mt-2 text-xs text-muted-foreground">
                    Submitted {new Date(request.created_at).toLocaleString()} · {request.id.slice(0, 8)}
                  </p>
                </div>

                <select
                  value={request.status}
                  onChange={(event) => {
                    const status = event.target.value as CustomRequest["status"];
                    if (status === "awaiting_payment") {
                      setQuotingId(request.id);
                      return;
                    }
                    setStatus.mutate({ request, status });
                  }}
                  className="h-10 rounded-full border border-border bg-background px-4 text-[11px] uppercase tracking-[0.18em] text-foreground/80 outline-none focus:border-gold"
                >
                  {STATUSES.map((status) => (
                    <option key={status} value={status} disabled={MANUAL_DISABLED_STATUSES.has(status)}>
                      {status.replaceAll("_", " ")}
                      {status === "processing" ? " (auto after payment)" : ""}
                    </option>
                  ))}
                </select>
              </div>

              <dl className="mt-5 grid gap-3 border-t border-border pt-5 text-sm sm:grid-cols-2 lg:grid-cols-4">
                <Info label="Item Type" value={request.item_type} />
                <Info label="Occasion" value={request.occasion} />
                <ColorInfo value={request.color_preference} />
                <Info label="Quantity" value={request.quantity} />
                <Info label="Needed By" value={request.deadline} />
                <Info label="Delivery" value={request.delivery_preference} />
              </dl>

              {(request.idea || request.design_text || request.media_details || request.sample_image_path) && (
                <div className="mt-5 grid gap-3 rounded-sm border border-gold/30 bg-gold/5 p-4 text-sm text-foreground/80 md:grid-cols-3">
                  <Info label="Description" value={request.idea || request.design_text || request.media_details} />
                  {request.sample_image_path ? (
                    <div>
                      <dt className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                        Sample Image
                      </dt>
                      <dd className="mt-1">
                        <SampleImageLink path={request.sample_image_path} />
                      </dd>
                    </div>
                  ) : (
                    <Info label="Sample Image" value={null} />
                  )}
                </div>
              )}

              {request.quoted_price != null && (
                <div className="mt-5 rounded-sm bg-cream/60 p-4">
                  <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                    Quoted Price
                  </div>
                  <p className="mt-1 font-display text-xl text-ink">{formatUSD(request.quoted_price)}</p>
                  {request.quote_note && (
                    <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-foreground/80">
                      {request.quote_note}
                    </p>
                  )}
                </div>
              )}

              {quotingId === request.id && (
                <QuoteForm
                  submitting={sendQuote.isPending}
                  defaultPrice={request.quoted_price ?? undefined}
                  defaultNote={request.quote_note ?? ""}
                  onCancel={() => setQuotingId(null)}
                  onSend={(price, note) => sendQuote.mutate({ request, price, note })}
                />
              )}

              <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-muted-foreground">
                {request.notification_sent_at ? (
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-gold" /> Owner email sent
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    Owner email not sent
                    {request.notification_error ? `: ${request.notification_error}` : ""}
                  </span>
                )}
                {request.customer_notified_at ? (
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-gold" /> Customer notified
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    Customer not yet notified
                    {request.customer_notification_error ? `: ${request.customer_notification_error}` : ""}
                  </span>
                )}
              </div>
            </article>
          ))
        ) : (
          <p className="rounded-sm border border-border bg-card px-5 py-10 text-center text-sm text-muted-foreground">
            No custom requests yet.
          </p>
        )}
      </div>
    </div>
  );
}

function QuoteForm({
  defaultPrice,
  defaultNote,
  submitting,
  onCancel,
  onSend,
}: {
  defaultPrice?: number;
  defaultNote?: string;
  submitting: boolean;
  onCancel: () => void;
  onSend: (price: number, note: string) => void;
}) {
  const [price, setPrice] = useState(defaultPrice != null ? String(defaultPrice) : "");
  const [note, setNote] = useState(defaultNote ?? "");

  return (
    <div className="mt-5 rounded-sm border border-gold/40 bg-gold/5 p-4">
      <div className="text-[11px] uppercase tracking-[0.2em] text-gold">Send Quote to Customer</div>
      <div className="mt-3 grid gap-3 sm:grid-cols-[160px_1fr]">
        <label className="grid gap-1.5">
          <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Price (USD)
          </span>
          <input
            type="number"
            min={0}
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="h-10 rounded-sm border border-border bg-background px-3 text-sm outline-none focus:border-gold"
          />
        </label>
        <label className="grid gap-1.5">
          <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Note (optional)
          </span>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Includes rush fee, let us know about color changes..."
            className="h-10 rounded-sm border border-border bg-background px-3 text-sm outline-none focus:border-gold"
          />
        </label>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          disabled={submitting || !price || Number(price) <= 0}
          onClick={() => onSend(Number(price), note)}
          className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-[11px] uppercase tracking-[0.2em] text-background hover:bg-gold hover:text-ink disabled:opacity-60"
        >
          {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
          Send Quote
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground hover:text-destructive"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-ink">{value || "Not provided"}</dd>
    </div>
  );
}

function ColorInfo({ value }: { value?: string | null }) {
  const swatch = COLOR_SWATCHES.find((c) => c.name === value);
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Color</dt>
      <dd className="mt-1 flex items-center gap-2 text-ink">
        {swatch && (
          <span
            className="h-3 w-3 shrink-0 rounded-full border border-black/10"
            style={{ backgroundColor: swatch.hex }}
          />
        )}
        {value || "Not provided"}
      </dd>
    </div>
  );
}

function SampleImageLink({ path }: { path: string }) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (url) {
    return (
      <a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-gold hover:underline">
        <ImageIcon className="h-3.5 w-3.5" /> View sample
      </a>
    );
  }

  return (
    <button
      type="button"
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        setError("");
        try {
          const result = await getCustomizationPhotoUrl(path);
          setUrl(result.url);
        } catch {
          setError("Could not load sample.");
        } finally {
          setLoading(false);
        }
      }}
      className="inline-flex items-center gap-1 text-gold hover:underline disabled:opacity-60"
    >
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImageIcon className="h-3.5 w-3.5" />}
      {loading ? "Loading..." : "View sample"}
      {error && <span className="text-destructive">{error}</span>}
    </button>
  );
}
