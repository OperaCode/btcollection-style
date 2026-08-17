-- Singleton table of admin-editable business/shipping settings. Public
-- fields (social links, contact info) are readable by anyone since the
-- public site renders them; only admins can update the row.
create table if not exists public.site_settings (
  id smallint primary key default 1,
  social_instagram text,
  social_facebook text,
  social_tiktok text,
  social_pinterest text,
  whatsapp_url text,
  contact_email text,
  shippo_from_name text,
  shippo_from_company text,
  shippo_from_street1 text,
  shippo_from_street2 text,
  shippo_from_city text,
  shippo_from_state text,
  shippo_from_zip text,
  shippo_from_country text,
  shippo_from_phone text,
  shippo_from_email text,
  parcel_length text,
  parcel_width text,
  parcel_height text,
  parcel_weight text,
  updated_at timestamptz not null default now(),
  constraint site_settings_singleton check (id = 1)
);

insert into public.site_settings (id) values (1) on conflict (id) do nothing;

alter table public.site_settings enable row level security;

drop policy if exists "Public read site settings" on public.site_settings;
create policy "Public read site settings" on public.site_settings for select using (true);
drop policy if exists "Admins update site settings" on public.site_settings;
create policy "Admins update site settings" on public.site_settings for update using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
