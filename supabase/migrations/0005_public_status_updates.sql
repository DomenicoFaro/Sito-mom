-- Il cliente al tavolo (ruolo anon, nessun login) deve poter segnare il
-- tavolo occupato all'apertura dell'ordine e richiedere il conto, ma le
-- policy RLS su restaurant_tables/orders permettono l'update solo allo
-- staff. Due funzioni SECURITY DEFINER espongono solo le transizioni di
-- stato necessarie, senza aprire l'update libero delle tabelle a chiunque
-- abbia la anon key.

create or replace function mark_table_occupied(p_table_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update restaurant_tables
  set status = 'occupato'
  where id = p_table_id and status = 'libero';
end;
$$;

grant execute on function mark_table_occupied(uuid) to anon, authenticated;

create or replace function request_bill(p_order_id uuid, p_table_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update orders
  set status = 'in_attesa_conto'
  where id = p_order_id and status = 'aperto';

  update restaurant_tables
  set status = 'in_attesa_conto'
  where id = p_table_id;
end;
$$;

grant execute on function request_bill(uuid, uuid) to anon, authenticated;
