import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { ChevronDown, ExternalLink, ImageIcon, Loader2, PackageCheck, Truck } from "lucide-react";
import { listOrders, listOrderItems, updateOrderStatus, type AdminOrder } from "@/lib/admin-data";
import { getCustomizationPhotoUrl } from "@/lib/admin-storage";
import { formatUSD } from "@/lib/cart";
import { buyShippoLabel, getShippoRates, type ShippoRate } from "@/lib/shippo";

type OrderItemCustomization = {
  size?: string;
  text?: string;
  photoPath?: string;
  note?: string;
  occasion?: string;
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
            {expanded === o.id && <OrderItemsPanel order={o} />}
          </div>
        ))}
        {orders.data?.length === 0 && (
          <p className="px-5 py-10 text-center text-sm text-muted-foreground">No orders yet.</p>
        )}
      </div>
    </div>
  );
}

function OrderItemsPanel({ order }: { order: AdminOrder }) {
  const queryClient = useQueryClient();
  const [rates, setRates] = useState<ShippoRate[]>([]);
  const [selectedRate, setSelectedRate] = useState("");
  const [shippoError, setShippoError] = useState<string | null>(null);

  const items = useQuery({
    queryKey: ["admin", "order-items", order.id],
    queryFn: () => listOrderItems(order.id),
  });

  const ratesMutation = useMutation({
    mutationFn: () => getShippoRates(order.id),
    onSuccess: (result) => {
      setShippoError(null);
      setRates(result.rates);
      setSelectedRate(result.rates[0]?.object_id ?? "");
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
    },
    onError: (error) => {
      setShippoError(error instanceof Error ? error.message : "Could not load shipping rates.");
    },
  });

  const labelMutation = useMutation({
    mutationFn: () => buyShippoLabel(order.id, selectedRate),
    onSuccess: () => {
      setShippoError(null);
      setRates([]);
      setSelectedRate("");
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
    },
    onError: (error) => {
      setShippoError(error instanceof Error ? error.message : "Could not buy shipping label.");
    },
  });

  return (
    <div className="border-t border-border bg-cream/40 px-5 py-4">
      <ul className="space-y-3 text-sm">
        {(items.data ?? []).map((it) => {
          const c = (it.customization ?? null) as OrderItemCustomization | null;
          const hasCustomization = c && (c.size || c.text || c.photoPath || c.note || c.occasion);
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
                  {c.occasion && <div>Occasion: {c.occasion}</div>}
                  {c.note && <div>Note: {c.note}</div>}
                  {c.photoPath && <CustomizationPhotoLink path={c.photoPath} />}
                </div>
              )}
            </li>
          );
        })}
      </ul>
      {items.data?.length === 0 && <p className="text-xs text-muted-foreground">No line items.</p>}
      {order.square_payment_id && (
        <p className="mt-3 text-xs text-muted-foreground">
          Square payment: <span className="text-foreground/80">{order.square_payment_id}</span>
        </p>
      )}
      <ShippingLabelPanel
        order={order}
        rates={rates}
        selectedRate={selectedRate}
        setSelectedRate={setSelectedRate}
        onLoadRates={() => ratesMutation.mutate()}
        onBuyLabel={() => labelMutation.mutate()}
        loadingRates={ratesMutation.isPending}
        buyingLabel={labelMutation.isPending}
        error={shippoError}
      />
    </div>
  );
}

function ShippingLabelPanel({
  order,
  rates,
  selectedRate,
  setSelectedRate,
  onLoadRates,
  onBuyLabel,
  loadingRates,
  buyingLabel,
  error,
}: {
  order: AdminOrder;
  rates: ShippoRate[];
  selectedRate: string;
  setSelectedRate: (rateId: string) => void;
  onLoadRates: () => void;
  onBuyLabel: () => void;
  loadingRates: boolean;
  buyingLabel: boolean;
  error: string | null;
}) {
  return (
    <div className="mt-5 rounded-sm border border-border bg-background p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-medium text-ink">
            <Truck className="h-4 w-4 text-gold" />
            Shipping label
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Load Shippo rates from the customer address, then purchase a 4x6 PDF label.
          </p>
        </div>
        <button
          type="button"
          onClick={onLoadRates}
          disabled={loadingRates || buyingLabel}
          className="inline-flex items-center gap-2 rounded-full border border-gold/50 bg-gold/10 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.16em] text-ink transition hover:border-gold hover:bg-gold/20 disabled:opacity-60"
        >
          {loadingRates ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Truck className="h-3.5 w-3.5" />}
          {loadingRates ? "Loading rates" : "Get rates"}
        </button>
      </div>

      {(order.shipping_label_url || order.tracking_number) && (
        <div className="mt-4 grid gap-2 rounded-sm border border-gold/30 bg-gold/5 p-3 text-xs text-foreground/80">
          {order.shipping_label_url && (
            <a
              href={order.shipping_label_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-gold hover:underline"
            >
              <PackageCheck className="h-3.5 w-3.5" />
              Open purchased label
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
          {order.tracking_number && (
            <div>
              Tracking:{" "}
              {order.tracking_url ? (
                <a href={order.tracking_url} target="_blank" rel="noreferrer" className="text-gold hover:underline">
                  {order.tracking_number}
                </a>
              ) : (
                order.tracking_number
              )}
            </div>
          )}
        </div>
      )}

      {rates.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <select
            value={selectedRate}
            onChange={(event) => setSelectedRate(event.target.value)}
            className="min-w-72 rounded-sm border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-gold"
          >
            {rates.map((rate) => (
              <option key={rate.object_id} value={rate.object_id}>
                {formatShippoRate(rate)}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={onBuyLabel}
            disabled={!selectedRate || buyingLabel || loadingRates}
            className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-[11px] font-medium uppercase tracking-[0.16em] text-background transition hover:bg-gold hover:text-ink disabled:opacity-60"
          >
            {buyingLabel ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <PackageCheck className="h-3.5 w-3.5" />}
            {buyingLabel ? "Buying label" : "Buy label"}
          </button>
        </div>
      )}

      {error && <p className="mt-3 text-xs text-destructive">{error}</p>}
    </div>
  );
}

function formatShippoRate(rate: ShippoRate) {
  const amount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: rate.currency || "USD",
  }).format(Number(rate.amount));
  const days = rate.estimated_days ? `, ${rate.estimated_days} day${rate.estimated_days === 1 ? "" : "s"}` : "";
  return `${rate.provider} ${rate.service} - ${amount}${days}`;
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
