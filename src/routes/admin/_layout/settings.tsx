import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Download, Lock, Mail, XCircle } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { supabase } from "@/integrations/supabase/client";
import {
  getSiteSettings,
  updateSiteSettings,
  SITE_SETTINGS_QUERY_KEY,
  type SiteSettings,
  type SiteSettingsUpdate,
} from "@/lib/site-settings";
import { listNewsletterSubscribers } from "@/lib/admin-data";
import { getEnvShippingDefaults } from "@/lib/shippo";
import { SOCIAL_LINKS, WHATSAPP_URL, CONTACT_EMAIL } from "@/lib/site-config";

export const Route = createFileRoute("/admin/_layout/settings")({
  component: AdminSettings,
});

const SITE_URL = "https://breakthroughcollection.com";

const TABS = ["Business", "Shipping", "Newsletter", "Account"] as const;
type Tab = (typeof TABS)[number];

type FieldKey = keyof Omit<SiteSettingsUpdate, "id" | "updated_at">;
type FieldConfig = { key: FieldKey; label: string; placeholder?: string };

const BUSINESS_FIELDS: FieldConfig[] = [
  { key: "social_instagram", label: "Instagram URL", placeholder: "https://instagram.com/yourhandle" },
  { key: "social_facebook", label: "Facebook URL", placeholder: "https://facebook.com/yourpage" },
  { key: "social_tiktok", label: "TikTok URL", placeholder: "https://tiktok.com/@yourhandle" },
  { key: "social_pinterest", label: "Pinterest URL", placeholder: "https://pinterest.com/yourprofile" },
  { key: "social_etsy", label: "Etsy Shop URL", placeholder: "https://www.etsy.com/shop/yourshop" },
  { key: "whatsapp_url", label: "WhatsApp Link", placeholder: "https://wa.me/1234567890" },
  { key: "contact_email", label: "Contact Email", placeholder: "hello@yourbusiness.com" },
];

const SHIPPING_FIELDS: FieldConfig[] = [
  { key: "shippo_from_name", label: "Ship-From Name" },
  { key: "shippo_from_company", label: "Company" },
  { key: "shippo_from_street1", label: "Street Address" },
  { key: "shippo_from_street2", label: "Street Address 2 (optional)" },
  { key: "shippo_from_city", label: "City" },
  { key: "shippo_from_state", label: "State" },
  { key: "shippo_from_zip", label: "ZIP Code" },
  { key: "shippo_from_country", label: "Country", placeholder: "US" },
  { key: "shippo_from_phone", label: "Phone" },
  { key: "shippo_from_email", label: "Email" },
  { key: "parcel_length", label: "Default Parcel Length (in)" },
  { key: "parcel_width", label: "Default Parcel Width (in)" },
  { key: "parcel_height", label: "Default Parcel Height (in)" },
  { key: "parcel_weight", label: "Default Parcel Weight (lb)" },
];

const BUSINESS_FALLBACK: Record<string, string> = {
  social_instagram: SOCIAL_LINKS.instagram,
  social_facebook: SOCIAL_LINKS.facebook,
  social_tiktok: SOCIAL_LINKS.tiktok,
  social_pinterest: SOCIAL_LINKS.pinterest,
  social_etsy: SOCIAL_LINKS.etsy,
  whatsapp_url: WHATSAPP_URL,
  contact_email: CONTACT_EMAIL,
};

function AdminSettings() {
  const [tab, setTab] = useState<Tab>("Business");
  const settings = useQuery({ queryKey: SITE_SETTINGS_QUERY_KEY, queryFn: getSiteSettings });
  const envShipping = useQuery({
    queryKey: ["admin", "shipping-env-defaults"],
    queryFn: getEnvShippingDefaults,
  });
  const queryClient = useQueryClient();

  const save = useMutation({
    mutationFn: updateSiteSettings,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SITE_SETTINGS_QUERY_KEY }),
  });

  return (
    <div>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="font-display text-3xl text-ink">Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Business info, shipping defaults, newsletter subscribers, and your account.
          </p>
        </div>
        <WebsiteQrCard />
      </div>

      <div className="mt-8 flex gap-2 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`border-b-2 px-4 py-2.5 text-[11px] uppercase tracking-[0.2em] transition ${
              tab === t ? "border-gold text-ink" : "border-transparent text-muted-foreground hover:text-ink"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {tab === "Business" &&
          (settings.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading settings...</p>
          ) : (
            <SettingsForm
              key="business"
              fields={BUSINESS_FIELDS}
              initial={settings.data}
              fallback={BUSINESS_FALLBACK}
              onSave={(values) => save.mutateAsync(values)}
            />
          ))}
        {tab === "Shipping" &&
          (settings.isLoading || envShipping.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading settings...</p>
          ) : (
            <SettingsForm
              key="shipping"
              fields={SHIPPING_FIELDS}
              initial={settings.data}
              fallback={envShipping.data}
              onSave={(values) => save.mutateAsync(values)}
            />
          ))}
        {tab === "Newsletter" && <NewsletterTab />}
        {tab === "Account" && <AccountTab />}
      </div>
    </div>
  );
}

function SettingsForm({
  fields,
  initial,
  fallback,
  onSave,
}: {
  fields: FieldConfig[];
  initial?: SiteSettings | null;
  fallback?: Record<string, string | null | undefined>;
  onSave: (values: SiteSettingsUpdate) => Promise<void>;
}) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map((f) => [f.key, initial?.[f.key] || fallback?.[f.key] || ""])),
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setError("");
        setSaved(false);
        setSaving(true);
        try {
          const payload = Object.fromEntries(
            fields.map((f) => [f.key, values[f.key]?.trim() || null]),
          ) as SiteSettingsUpdate;
          await onSave(payload);
          setSaved(true);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Something went wrong.");
        } finally {
          setSaving(false);
        }
      }}
      className="grid max-w-2xl gap-5 rounded-sm border border-border bg-card p-6 md:p-8"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        {fields.map((f) => (
          <Field key={f.key} label={f.label}>
            <input
              value={values[f.key] ?? ""}
              onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
              placeholder={f.placeholder}
              className={inputCls}
            />
          </Field>
        ))}
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}
      {saved && !error && <p className="text-xs text-gold">Saved.</p>}

      <button
        type="submit"
        disabled={saving}
        className="mt-2 inline-flex w-fit items-center justify-center gap-3 rounded-full bg-ink px-6 py-3 text-[12px] font-medium uppercase tracking-[0.22em] text-background transition hover:bg-gold hover:text-ink disabled:opacity-60"
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}

const inputCls =
  "w-full rounded-sm border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-gold";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-2">
      <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function NewsletterTab() {
  const subscribers = useQuery({
    queryKey: ["admin", "newsletter-subscribers"],
    queryFn: listNewsletterSubscribers,
  });

  return (
    <div>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <p className="text-sm text-muted-foreground">
          Customers who signed up from the website newsletter.
        </p>
        <div className="inline-flex items-center gap-2 rounded-full border border-gold/50 px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-gold">
          <Mail className="h-3.5 w-3.5" />
          {subscribers.data?.length ?? 0} Subscribers
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-sm border border-border bg-card">
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

function WebsiteQrCard() {
  const canvasRef = useRef<HTMLDivElement | null>(null);

  function download() {
    const canvas = canvasRef.current?.querySelector("canvas");
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "breakthrough-collection-qr.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  return (
    <div className="flex shrink-0 items-center gap-4 self-start rounded-lg border border-border bg-card px-5 py-4">
      <div ref={canvasRef} className="rounded-md bg-white p-2 shadow-sm">
        <QRCodeCanvas value={SITE_URL} size={84} level="M" fgColor="#1a1a1a" bgColor="#ffffff" />
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-[0.22em] text-gold">Website QR Code</p>
        <p className="mt-1 max-w-[10rem] text-xs leading-snug text-foreground/70">
          Share it on packaging, cards, or social
        </p>
        <button
          type="button"
          onClick={download}
          className="mt-2 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-ink hover:text-gold"
        >
          <Download className="h-3 w-3" /> Download PNG
        </button>
      </div>
    </div>
  );
}

function AccountTab() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setError("");
        setSaved(false);

        if (newPassword.length < 8) {
          setError("Password must be at least 8 characters.");
          return;
        }
        if (newPassword !== confirmPassword) {
          setError("Passwords do not match.");
          return;
        }

        setSaving(true);
        try {
          const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
          if (updateError) throw updateError;
          setSaved(true);
          setNewPassword("");
          setConfirmPassword("");
        } catch (err) {
          setError(err instanceof Error ? err.message : "Could not update password.");
        } finally {
          setSaving(false);
        }
      }}
      className="grid max-w-md gap-5 rounded-sm border border-border bg-card p-6 md:p-8"
    >
      <div className="flex items-center gap-2 text-sm font-medium text-ink">
        <Lock className="h-4 w-4 text-gold" />
        Change Admin Password
      </div>

      <Field label="New Password">
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="At least 8 characters"
          autoComplete="new-password"
          className={inputCls}
        />
      </Field>
      <Field label="Confirm New Password">
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
          className={inputCls}
        />
      </Field>

      {error && <p className="text-xs text-destructive">{error}</p>}
      {saved && !error && <p className="text-xs text-gold">Password updated.</p>}

      <button
        type="submit"
        disabled={saving || !newPassword || !confirmPassword}
        className="mt-2 inline-flex w-fit items-center justify-center gap-3 rounded-full bg-ink px-6 py-3 text-[12px] font-medium uppercase tracking-[0.22em] text-background transition hover:bg-gold hover:text-ink disabled:opacity-60"
      >
        {saving ? "Saving..." : "Update Password"}
      </button>
    </form>
  );
}
