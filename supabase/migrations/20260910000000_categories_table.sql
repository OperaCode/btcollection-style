-- Product categories become an admin-managed table instead of a hardcoded
-- list, so the client can create/rename/reorder/delete her own storefront
-- categories (capped at 8) without a code change each time.

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index categories_sort_order_idx on public.categories(sort_order);

alter table public.categories enable row level security;

create policy "Public read categories" on public.categories
  for select using (true);

create policy "Admins manage categories" on public.categories
  for all using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- A plain CHECK constraint can't see sibling rows, so the 8-category cap
-- needs a trigger.
create or replace function public.enforce_categories_limit()
returns trigger
language plpgsql
as $$
begin
  if (select count(*) from public.categories) >= 8 then
    raise exception 'Maximum of 8 categories allowed. Delete or rename an existing category first.';
  end if;
  return new;
end;
$$;

create trigger categories_max_eight
before insert on public.categories
for each row execute function public.enforce_categories_limit();

-- Renaming a category cascades to every product/gallery project currently
-- using the old name, so nothing silently falls out of every filter chip
-- (this is exactly the drift that 20260909000000_rename_mugs_tumblers_category.sql
-- had to fix by hand). Runs inside the same statement/transaction as the
-- triggering update, so it's atomic with no extra client-side coordination.
create or replace function public.cascade_category_rename()
returns trigger
language plpgsql
as $$
begin
  if new.name is distinct from old.name then
    update public.products set category = new.name where category = old.name;
    update public.gallery_projects set product_type = new.name where product_type = old.name;
  end if;
  return new;
end;
$$;

create trigger categories_cascade_rename
after update on public.categories
for each row execute function public.cascade_category_rename();

insert into public.categories (name, sort_order) values
  ('Faith Apparel', 0),
  ('Drinkware', 1),
  ('Gift Sets', 2),
  ('Accessories', 3),
  ('Kids/Baby', 4),
  ('Embroidered', 5),
  ('Engraved', 6)
on conflict (name) do nothing;
