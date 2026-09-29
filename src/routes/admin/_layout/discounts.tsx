import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Pencil, Plus, Power, PowerOff, Trash2 } from "lucide-react";
import {
  listDiscountCodes,
  createDiscountCode,
  updateDiscountCode,
  deleteDiscountCode,
  DISCOUNT_CODES_QUERY_KEY,
  type DiscountCode,
} from "@/lib/discounts";

export const Route = createFileRoute("/admin/_layout/discounts")({
  component: AdminDiscountsPage,
});

type FormState = {
  code: string;
  percentOff: string;
  minSubtotal: string;
  startsAt: string;
  expiresAt: string;
  active: boolean;
};

const EMPTY_FORM: FormState = {
  code: "",
  percentOff: "",
  minSubtotal: "",
  startsAt: "",
  expiresAt: "",
  active: true,
};

function toDateInputValue(iso: string | null) {
  return iso ? iso.slice(0, 10) : "";
}

function formatDate(iso: string | null) {
  return iso ? new Date(iso).toLocaleDateString() : null;
}

function AdminDiscountsPage() {
  const queryClient = useQueryClient();
  const codes = useQuery({ queryKey: DISCOUNT_CODES_QUERY_KEY, queryFn: listDiscountCodes });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState("");

  const invalidate = () => queryClient.invalidateQueries({ queryKey: DISCOUNT_CODES_QUERY_KEY });

  function resetForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  const save = useMutation({
    mutationFn: async () => {
      const percentOff = Number(form.percentOff);
      if (!form.code.trim()) throw new Error("Enter a code.");
      if (!Number.isFinite(percentOff) || percentOff <= 0 || percentOff > 100) {
        throw new Error("Percent off must be between 1 and 100.");
      }
      const payload = {
        code: form.code.trim(),
        percent_off: percentOff,
        min_subtotal: Number(form.minSubtotal) || 0,
        active: form.active,
        starts_at: form.startsAt ? new Date(form.startsAt).toISOString() : null,
        expires_at: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
      };
      if (editingId) {
        await updateDiscountCode(editingId, payload);
      } else {
        await createDiscountCode(payload);
      }
    },
    onSuccess: () => {
      resetForm();
      setError("");
      invalidate();
    },
    onError: (err) => setError(err instanceof Error ? err.message : "Could not save this code."),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteDiscountCode(id),
    onSuccess: () => {
      if (editingId) resetForm();
      invalidate();
    },
    onError: (err) => setError(err instanceof Error ? err.message : "Could not delete this code."),
  });

  const toggleActive = useMutation({
    mutationFn: (code: DiscountCode) => updateDiscountCode(code.id, { active: !code.active }),
    onSuccess: () => invalidate(),
    onError: (err) => setError(err instanceof Error ? err.message : "Could not update this code."),
  });

  function startEdit(code: DiscountCode) {
    setEditingId(code.id);
    setForm({
      code: code.code,
      percentOff: String(code.percent_off),
      minSubtotal: String(code.min_subtotal),
      startsAt: toDateInputValue(code.starts_at),
      expiresAt: toDateInputValue(code.expires_at),
      active: code.active,
    });
  }

  const list = codes.data ?? [];

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">Discount Codes</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Promo codes customers enter at checkout — e.g. a launch discount for new customers. Each
        code can only be used once per customer email, checked automatically at checkout.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate();
        }}
        className="mt-8 grid max-w-2xl gap-5 rounded-sm border border-border bg-card p-6 md:p-8"
      >
        <h2 className="font-display text-xl text-ink">{editingId ? "Edit Code" : "New Code"}</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Code">
            <input
              value={form.code}
              onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
              placeholder="WELCOME10"
              className={inputCls}
            />
          </Field>
          <Field label="Percent Off">
            <input
              type="number"
              min={1}
              max={100}
              value={form.percentOff}
              onChange={(e) => setForm((f) => ({ ...f, percentOff: e.target.value }))}
              placeholder="10"
              className={inputCls}
            />
          </Field>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Minimum Order (USD, optional)">
            <input
              type="number"
              min={0}
              step="0.01"
              value={form.minSubtotal}
              onChange={(e) => setForm((f) => ({ ...f, minSubtotal: e.target.value }))}
              placeholder="0"
              className={inputCls}
            />
          </Field>
          <Field label="Active">
            <label className="flex h-10 items-center gap-2 text-sm text-foreground/80">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
                className="h-4 w-4 accent-gold"
              />
              Customers can use this code right now
            </label>
          </Field>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Starts (optional)">
            <input
              type="date"
              value={form.startsAt}
              onChange={(e) => setForm((f) => ({ ...f, startsAt: e.target.value }))}
              className={inputCls}
            />
          </Field>
          <Field label="Expires (optional)">
            <input
              type="date"
              value={form.expiresAt}
              onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
              className={inputCls}
            />
          </Field>
        </div>

        {error && <p className="text-xs text-destructive">{error}</p>}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={save.isPending}
            className="inline-flex w-fit items-center justify-center gap-3 rounded-full bg-ink px-6 py-3 text-[12px] font-medium uppercase tracking-[0.22em] text-background transition hover:bg-gold hover:text-ink disabled:opacity-60"
          >
            <Plus className="h-4 w-4" /> {save.isPending ? "Saving..." : editingId ? "Save Changes" : "Create Code"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground hover:text-ink"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="mt-8 max-w-2xl overflow-hidden rounded-sm border border-border bg-card">
        {codes.isLoading ? (
          <p className="px-5 py-10 text-center text-sm text-muted-foreground">Loading codes...</p>
        ) : list.length ? (
          <ul className="divide-y divide-border">
            {list.map((code) => (
              <li key={code.id} className="flex items-center justify-between gap-4 px-5 py-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display text-lg text-ink">{code.code}</span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] uppercase tracking-[0.16em] ${
                        code.active
                          ? "bg-gold/15 text-gold"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {code.active ? "Active" : "Off"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {Number(code.percent_off)}% off
                    {Number(code.min_subtotal) > 0 ? ` · min $${Number(code.min_subtotal).toFixed(2)}` : ""}
                    {code.starts_at ? ` · from ${formatDate(code.starts_at)}` : ""}
                    {code.expires_at ? ` · until ${formatDate(code.expires_at)}` : ""}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <button
                    type="button"
                    aria-label={code.active ? "Deactivate" : "Activate"}
                    onClick={() => toggleActive.mutate(code)}
                    disabled={toggleActive.isPending}
                    className="text-foreground/70 hover:text-gold disabled:opacity-50"
                  >
                    {code.active ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                  </button>
                  <button
                    type="button"
                    aria-label={`Edit ${code.code}`}
                    onClick={() => startEdit(code)}
                    className="text-foreground/70 hover:text-gold"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Delete ${code.code}`}
                    onClick={() => {
                      if (confirm(`Delete "${code.code}"? This can't be undone.`)) remove.mutate(code.id);
                    }}
                    className="text-foreground/70 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-5 py-10 text-center text-sm text-muted-foreground">
            No discount codes yet — create your first one above.
          </p>
        )}
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-sm border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-gold";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2">
      <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
