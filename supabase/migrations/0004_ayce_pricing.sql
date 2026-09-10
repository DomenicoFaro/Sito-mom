-- Formula All You Can Eat: prezzo a persona + eventuale coperto, "congelati"
-- sull'ordine al momento della creazione (così il conto non cambia se la
-- sessione attraversa il cambio pranzo/cena o mezzanotte).

alter table orders add column ayce_price_cents integer not null default 0;
alter table orders add column ayce_cover_cents integer not null default 0;

comment on column orders.ayce_price_cents is 'Prezzo AYCE a persona applicato a questo ordine (pranzo feriale/weekend o cena), congelato alla creazione.';
comment on column orders.ayce_cover_cents is 'Coperto a persona applicato a questo ordine (0 per pranzo feriale), congelato alla creazione.';
