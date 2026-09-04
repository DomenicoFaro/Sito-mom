-- Row Level Security
-- Modello di accesso:
--  - anon (cliente al tavolo, no login): può leggere menù/tavoli/info, creare ordini+righe sul
--    proprio tavolo, leggere/aggiornare (solo aggiungere righe) l'ordine del proprio tavolo.
--  - authenticated staff: accesso in base al ruolo in staff_profiles.

create or replace function current_staff_role()
returns staff_role
language sql
security definer
set search_path = public
stable
as $$
  select role from staff_profiles where id = auth.uid() and active = true;
$$;

create or replace function is_staff()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (select 1 from staff_profiles where id = auth.uid() and active = true);
$$;

alter table staff_profiles enable row level security;
alter table restaurant_tables enable row level security;
alter table menu_categories enable row level security;
alter table menu_items enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table restaurant_info enable row level security;
alter table reservation_requests enable row level security;

-- staff_profiles: ognuno vede il proprio profilo, admin vede tutti
create policy staff_profiles_self_read on staff_profiles
  for select using (id = auth.uid() or current_staff_role() = 'admin');

create policy staff_profiles_admin_write on staff_profiles
  for all using (current_staff_role() = 'admin')
  with check (current_staff_role() = 'admin');

-- restaurant_tables: lettura pubblica (necessaria per risolvere il QR), scrittura solo staff sala/cassa/admin
create policy tables_public_read on restaurant_tables
  for select using (true);

create policy tables_staff_write on restaurant_tables
  for insert with check (current_staff_role() in ('admin'));

create policy tables_staff_update on restaurant_tables
  for update using (current_staff_role() in ('admin', 'sala', 'cassa'))
  with check (current_staff_role() in ('admin', 'sala', 'cassa'));

create policy tables_admin_delete on restaurant_tables
  for delete using (current_staff_role() = 'admin');

-- menu_categories / menu_items: lettura pubblica, scrittura solo admin
create policy categories_public_read on menu_categories for select using (true);
create policy categories_admin_write on menu_categories
  for all using (current_staff_role() = 'admin') with check (current_staff_role() = 'admin');

create policy items_public_read on menu_items for select using (true);
create policy items_admin_write on menu_items
  for all using (current_staff_role() = 'admin') with check (current_staff_role() = 'admin');

-- restaurant_info: lettura pubblica, scrittura admin
create policy info_public_read on restaurant_info for select using (true);
create policy info_admin_write on restaurant_info
  for update using (current_staff_role() = 'admin') with check (current_staff_role() = 'admin');

-- reservation_requests: chiunque (anche anonimo) può creare una richiesta; solo staff legge/gestisce
create policy reservations_public_insert on reservation_requests
  for insert with check (true);

create policy reservations_staff_read on reservation_requests
  for select using (is_staff());

create policy reservations_staff_update on reservation_requests
  for update using (current_staff_role() in ('admin', 'sala')) with check (current_staff_role() in ('admin', 'sala'));

-- orders: cliente anonimo può creare/leggere/aggiornare ordini (join implicito col proprio tavolo
-- avviene lato applicazione tramite il qr_token, non c'è "sessione" server-side per un cliente anonimo,
-- quindi il tavolo stesso è la chiave di isolamento pubblica). Lo staff (sala/cassa/cucina/admin) vede tutto.
create policy orders_public_read on orders for select using (true);

create policy orders_public_insert on orders for insert with check (true);

create policy orders_staff_update on orders
  for update using (current_staff_role() in ('admin', 'sala', 'cassa'))
  with check (current_staff_role() in ('admin', 'sala', 'cassa'));

-- order_items: lettura pubblica (il cliente deve vedere il proprio carrello/ordine inviato e lo stato),
-- inserimento pubblico (il cliente invia le righe del proprio ordine),
-- aggiornamento stato riservato a cucina/sala/admin (avanzamento preparazione).
create policy order_items_public_read on order_items for select using (true);

create policy order_items_public_insert on order_items for insert with check (true);

create policy order_items_staff_update on order_items
  for update using (current_staff_role() in ('admin', 'sala', 'cucina', 'cassa'))
  with check (current_staff_role() in ('admin', 'sala', 'cucina', 'cassa'));
