-- Dati di esempio per sviluppo locale.
-- Le foto (photo_url) sono placeholder: vanno sostituite con le foto reali dei piatti
-- caricate su Supabase Storage (bucket "menu-photos") prima del lancio.

insert into menu_categories (name, slug, sort_order) values
  ('Nigiri', 'nigiri', 1),
  ('Sashimi', 'sashimi', 2),
  ('Uramaki', 'uramaki', 3),
  ('Tempura', 'tempura', 4),
  ('Gluten Free', 'gluten-free', 5),
  ('Antipasti', 'antipasti', 0)
on conflict (slug) do nothing;

insert into restaurant_tables (label, seats) values
  ('Tavolo 1', 2), ('Tavolo 2', 2), ('Tavolo 3', 4), ('Tavolo 4', 4),
  ('Tavolo 5', 4), ('Tavolo 6', 6), ('Tavolo 7', 2), ('Tavolo 8', 4)
on conflict (label) do nothing;

-- Piatti di esempio (prezzi indicativi, alla carta + supplemento AYCE dove previsto)
with cat as (select id, slug from menu_categories)
insert into menu_items (category_id, name, description, price_cents, menu_type, ayce_surcharge_cents, allergens, tags, sort_order)
select c.id, v.name, v.description, v.price_cents, 'ayce'::menu_type, v.surcharge, v.allergens, v.tags, v.sort_order
from (values
  ('nigiri', 'Nigiri Salmone', 'Riso vinegrato e salmone fresco norvegese.', 250, 0, array['pesce'], array['best_seller'], 1),
  ('nigiri', 'Nigiri Tonno', 'Riso vinegrato e tonno pinne gialle.', 280, 0, array['pesce'], array[]::text[], 2),
  ('nigiri', 'Nigiri Gambero', 'Riso vinegrato e gambero scottato.', 260, 0, array['crostacei'], array[]::text[], 3),
  ('sashimi', 'Sashimi Salmone (5pz)', 'Tagli freschi di salmone norvegese.', 900, 0, array['pesce'], array[]::text[], 1),
  ('sashimi', 'Sashimi Tonno (5pz)', 'Tagli freschi di tonno pinne gialle.', 1000, 0, array['pesce'], array[]::text[], 2),
  ('uramaki', 'Uramaki Philadelphia', 'Salmone, philadelphia, avocado, riso, sesamo.', 700, 0, array['pesce', 'latticini'], array['best_seller'], 1),
  ('uramaki', 'Uramaki Ebi Tempura', 'Gambero in tempura, avocado, salsa spicy.', 800, 150, array['crostacei', 'glutine'], array['piccante'], 2),
  ('uramaki', 'Uramaki Vegetariano', 'Avocado, cetriolo, carota, sesamo.', 600, 0, array[]::text[], array['vegetariano'], 3),
  ('tempura', 'Tempura Mista', 'Gamberi e verdure in pastella croccante.', 900, 200, array['crostacei', 'glutine'], array[]::text[], 1),
  ('tempura', 'Tempura Verdure', 'Selezione di verdure di stagione in tempura.', 700, 0, array['glutine'], array['vegetariano'], 2),
  ('gluten-free', 'Nigiri Salmone GF', 'Versione senza glutine.', 250, 0, array['pesce'], array['gluten_free'], 1),
  ('gluten-free', 'Sashimi Misto GF (8pz)', 'Selezione mista di pesce crudo, senza glutine.', 1400, 0, array['pesce'], array['gluten_free'], 2),
  ('antipasti', 'Edamame', 'Fagioli di soia al vapore, sale marino.', 500, 0, array['soia'], array['vegetariano'], 1),
  ('antipasti', 'Gyoza (5pz)', 'Ravioli giapponesi ripieni di carne o verdure.', 700, 0, array['glutine', 'soia'], array[]::text[], 2)
) as v(cat_slug, name, description, price_cents, surcharge, allergens, tags, sort_order)
join cat c on c.slug = v.cat_slug;
