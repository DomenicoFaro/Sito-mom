-- MōMA · Japanese Cuisine Gourmet
-- Schema iniziale: tavoli, menù, ordini, staff

create extension if not exists "pgcrypto";

-- =========================================================
-- STAFF & RUOLI
-- =========================================================

create type staff_role as enum ('cucina', 'sala', 'cassa', 'admin');

create table staff_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  role staff_role not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

comment on table staff_profiles is 'Profilo esteso per ogni utente staff autenticato via Supabase Auth.';

-- =========================================================
-- TAVOLI
-- =========================================================

create type table_status as enum ('libero', 'occupato', 'in_attesa_conto');

create table restaurant_tables (
  id uuid primary key default gen_random_uuid(),
  label text not null unique, -- es. "Tavolo 12"
  seats smallint not null default 2,
  status table_status not null default 'libero',
  qr_token text not null unique default encode(gen_random_bytes(12), 'hex'),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on column restaurant_tables.qr_token is 'Token univoco usato nell''URL pubblico /ordina/[qr_token], rigenerabile.';

-- =========================================================
-- MENÙ
-- =========================================================

create table menu_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  sort_order smallint not null default 0,
  created_at timestamptz not null default now()
);

create type menu_type as enum ('carta', 'ayce');

create table menu_items (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references menu_categories (id) on delete restrict,
  name text not null,
  description text not null default '',
  price_cents integer not null default 0, -- 0 per piatti inclusi nell'AYCE senza supplemento
  menu_type menu_type not null default 'carta',
  ayce_surcharge_cents integer not null default 0, -- supplemento se ordinato in modalità AYCE
  photo_url text,
  allergens text[] not null default '{}',
  tags text[] not null default '{}', -- es. piccante, vegetariano, gluten_free, nuovo, best_seller
  available boolean not null default true,
  sort_order smallint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index menu_items_category_idx on menu_items (category_id);
create index menu_items_available_idx on menu_items (available);

-- =========================================================
-- ORDINI
-- =========================================================

create type order_status as enum ('aperto', 'in_attesa_conto', 'chiuso', 'annullato');

create table orders (
  id uuid primary key default gen_random_uuid(),
  table_id uuid not null references restaurant_tables (id) on delete restrict,
  status order_status not null default 'aperto',
  menu_mode menu_type not null default 'carta', -- modalità scelta per la sessione (carta o AYCE)
  guest_count smallint not null default 1,
  created_at timestamptz not null default now(),
  closed_at timestamptz
);

create index orders_table_idx on orders (table_id);
create index orders_status_idx on orders (status);

create type order_item_status as enum ('ricevuto', 'in_preparazione', 'pronto', 'servito', 'annullato');

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete cascade,
  menu_item_id uuid not null references menu_items (id) on delete restrict,
  round smallint not null default 1, -- numero di "giro" di invio all'interno della stessa sessione
  quantity smallint not null default 1 check (quantity > 0),
  unit_price_cents integer not null default 0, -- prezzo congelato al momento dell'ordine
  notes text not null default '',
  status order_item_status not null default 'ricevuto',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index order_items_order_idx on order_items (order_id);
create index order_items_status_idx on order_items (status);

-- =========================================================
-- RISTORANTE: INFO / ORARI (per sito vetrina + admin)
-- =========================================================

create table restaurant_info (
  id smallint primary key default 1 check (id = 1),
  name text not null default 'MōMA · Japanese Cuisine Gourmet',
  address text not null default 'Via del Bosco 134, 95125 Catania (CT)',
  phone text not null default '095 553679',
  hours jsonb not null default '{}'::jsonb,
  socials jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

insert into restaurant_info (id) values (1) on conflict (id) do nothing;

create table reservation_requests (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null,
  email text,
  party_size smallint not null,
  requested_date date not null,
  requested_time time not null,
  notes text not null default '',
  status text not null default 'nuova', -- nuova / confermata / rifiutata
  created_at timestamptz not null default now()
);

-- =========================================================
-- TRIGGERS: updated_at
-- =========================================================

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_tables_updated_at
before update on restaurant_tables
for each row execute function set_updated_at();

create trigger trg_menu_items_updated_at
before update on menu_items
for each row execute function set_updated_at();

create trigger trg_order_items_updated_at
before update on order_items
for each row execute function set_updated_at();

-- =========================================================
-- REALTIME
-- =========================================================

alter publication supabase_realtime add table orders;
alter publication supabase_realtime add table order_items;
alter publication supabase_realtime add table restaurant_tables;
