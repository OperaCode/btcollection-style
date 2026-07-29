import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, CheckCircle2, ImageIcon, Loader2, Mail } from "lucide-react";
import {
  listCustomRequests,
  updateCustomRequestStatus,
  type CustomRequest,
} from "@/lib/admin-data";
import { getCustomizationPhotoUrl } from "@/lib/admin-storage";

export const Route = createFileRoute("/admin/_layout/custom-requests")({
  component: AdminCustomRequests,
});

const STATUSES = [
  "new",
  "reviewing",
  "quoted",
  "approved",
  "in_production",
  "ready",
  "completed",
  "cancelled",
] as const;

function AdminCustomRequests() {
  const queryClient = useQueryClient();
  const requests = useQuery({
    queryKey: ["admin", "custom-requests"],
    queryFn: listCustomRequests,
  });

  const setStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: CustomRequest["status"] }) =>
      updateCustomRequestStatus(id, status),
    onSuccess: () => {
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
          {requests.data?.filter((request) => request.status === "new").length ?? 0} New
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
                  <p className="mt-2 text-xs text-muted-foreground">
                    Submitted {new Date(request.created_at).toLocaleString()} · {request.id.slice(0, 8)}
                  </p>
                </div>

                <select
                  value={request.status}
                  onChange={(event) =>
                    setStatus.mutate({
                      id: request.id,
                      status: event.target.value as CustomRequest["status"],
                    })
                  }
                  className="h-10 rounded-full border border-border bg-background px-4 text-[11px] uppercase tracking-[0.18em] text-foreground/80 outline-none focus:border-gold"
                >
                  {STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status.replaceAll("_", " ")}
                    </option>
                  ))}
                </select>
              </div>

              <dl className="mt-5 grid gap-3 border-t border-border pt-5 text-sm sm:grid-cols-2 lg:grid-cols-4">
                <Info label="Item Type" value={request.item_type} />
                <Info label="Occasion" value={request.occasion} />
                <Info label="Quantity" value={request.quantity} />
                <Info label="Needed By" value={request.deadline} />
                <Info label="Delivery" value={request.delivery_preference} />
              </dl>

              {(request.design_text || request.media_details || request.sample_image_path) && (
                <div className="mt-5 grid gap-3 rounded-sm border border-gold/30 bg-gold/5 p-4 text-sm text-foreground/80 md:grid-cols-3">
                  <Info label="Text / Wording" value={request.design_text} />
                  <Info label="Media Details" value={request.media_details} />
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

              {request.idea && (
                <div className="mt-5 rounded-sm bg-cream/60 p-4">
                  <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                    Customer Idea
                  </div>
                  <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-foreground/80">
                    {request.idea}
                  </p>
                </div>
              )}

              <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                {request.notification_sent_at ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-gold" />
                    Owner email sent
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    Owner email not sent
                    {request.notification_error ? `: ${request.notification_error}` : ""}
                  </>
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

function Info({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-ink">{value || "Not provided"}</dd>
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
