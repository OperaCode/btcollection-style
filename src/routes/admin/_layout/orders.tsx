import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { ChevronDown, ImageIcon, Loader2 } from "lucide-react";
import { listOrders, listOrderItems, updateOrderStatus, type AdminOrder } from "@/lib/admin-data";
import { getCustomizationPhotoUrl } from "@/lib/admin-storage";
import { formatUSD } from "@/lib/cart";

type OrderItemCustomization = {
  size?: string;
  text?: string;
  photoPath?: string;
  note?: string;
};

export const Route = createFileRoute("/admin/_layout/orders")({
  component: AdminOrdersPage,
});

const STATUSES: AdminOrder["status"][] = [
  "pending",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

function AdminOrdersPage() {
  const queryClient = useQueryClient();
  const orders = useQuery({ queryKey: ["admin", "orders"], queryFn: listOrders });
  const [expanded, setExpanded] = useState<string | null>(null);

  const setStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: AdminOrder["status"] }) =>
      updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">Orders</h1>
      <p className="mt-1 text-sm text-muted-foreground">View and update order status.</p>

      <div className="mt-8 divide-y divide-border rounded-sm border border-border bg-card">
        {(orders.data ?? []).map((o) => (
          <div key={o.id}>
            <button
              onClick={() => setExpanded(expanded === o.id ? null : o.id)}
              className="flex w-full flex-wrap items-center justify-between gap-3 px-5 py-4 text-left"
            >
              <div className="min-w-0">
                <div className="text-sm text-ink">{o.email}</div>
                <div className="text-xs text-muted-foreground">
                  {new Date(o.created_at).toLocaleString()} · {o.id.slice(0, 8)}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-ink">{formatUSD(Number(o.total))}</span>
                <select
                  value={o.status}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) =>
                    setStatus.mutate({ id: o.id, status: e.target.value as AdminOrder["status"] })
                  }
                  className="rounded-full border border-border bg-background px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] text-foreground/80 outline-none focus:border-gold"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className={`h-4 w-4 text-gold transition ${expanded === o.id ? "rotate-180" : ""}`}
                />
              </div>
            </button>
            {expanded === o.id && <OrderItemsPanel orderId={o.id} />}
          </div>
        ))}
        {orders.data?.length === 0 && (
          <p className="px-5 py-10 text-center text-sm text-muted-foreground">No orders yet.</p>
        )}
      </div>
    </div>
  );
}

function OrderItemsPanel({ orderId }: { orderId: string }) {
  const items = useQuery({
    queryKey: ["admin", "order-items", orderId],
    queryFn: () => listOrderItems(orderId),
  });

  return (
    <div className="border-t border-border bg-cream/40 px-5 py-4">
      <ul className="space-y-3 text-sm">
        {(items.data ?? []).map((it) => {
          const c = (it.customization ?? null) as OrderItemCustomization | null;
          const hasCustomization = c && (c.size || c.text || c.photoPath || c.note);
          return (
            <li key={it.id} className="text-foreground/80">
              <div className="flex justify-between">
                <span>
                  {it.quantity}× {it.name}
                </span>
                <span>{formatUSD(Number(it.price) * it.quantity)}</span>
              </div>
              {hasCustomization && (
                <div className="mt-1.5 ml-4 grid gap-1 rounded-sm border border-gold/30 bg-gold/5 p-2.5 text-xs">
                  {c.size && <div>Size: {c.size}</div>}
                  {c.text && <div>Text: {c.text}</div>}
                  {c.note && <div>Note: {c.note}</div>}
                  {c.photoPath && <CustomizationPhotoLink path={c.photoPath} />}
                </div>
              )}
            </li>
          );
        })}
      </ul>
      {items.data?.length === 0 && <p className="text-xs text-muted-foreground">No line items.</p>}
    </div>
  );
}

function CustomizationPhotoLink({ path }: { path: string }) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (url) {
    return (
      <a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-gold hover:underline">
        <ImageIcon className="h-3.5 w-3.5" /> View uploaded photo
      </a>
    );
  }

  return (
    <button
      type="button"
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        setError(null);
        try {
          const result = await getCustomizationPhotoUrl(path);
          setUrl(result.url);
        } catch {
          setError("Could not load photo.");
        } finally {
          setLoading(false);
        }
      }}
      className="inline-flex items-center gap-1 text-gold hover:underline disabled:opacity-60"
    >
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImageIcon className="h-3.5 w-3.5" />}
      {loading ? "Loading photo..." : "View uploaded photo"}
      {error && <span className="text-destructive">{error}</span>}
    </button>
  );
}
