-- Bucket pubblico per le foto dei piatti, caricate dal backoffice admin.

insert into storage.buckets (id, name, public)
values ('menu-photos', 'menu-photos', true)
on conflict (id) do nothing;

create policy "menu-photos public read"
  on storage.objects for select
  using (bucket_id = 'menu-photos');

create policy "menu-photos admin write"
  on storage.objects for insert
  with check (bucket_id = 'menu-photos' and current_staff_role() = 'admin');

create policy "menu-photos admin update"
  on storage.objects for update
  using (bucket_id = 'menu-photos' and current_staff_role() = 'admin');

create policy "menu-photos admin delete"
  on storage.objects for delete
  using (bucket_id = 'menu-photos' and current_staff_role() = 'admin');
