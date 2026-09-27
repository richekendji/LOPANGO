-- Les maisons deviennent la source de vérité (visibles par tous).
-- Tables vides : changement de type sans risque.
-- Écritures : uniquement via le serveur (service_role bypass RLS).

drop policy if exists houses_delete_owner on public.houses;
drop policy if exists houses_insert_owner on public.houses;
drop policy if exists houses_select on public.houses;
drop policy if exists houses_update_owner on public.houses;
drop policy if exists house_photos_delete_owner on public.house_photos;
drop policy if exists house_photos_insert_owner on public.house_photos;
drop policy if exists house_photos_select on public.house_photos;
drop policy if exists house_photos_update_owner on public.house_photos;

alter table public.house_photos
  drop constraint if exists house_photos_house_id_fkey;
alter table public.contacts
  drop constraint if exists contacts_house_id_fkey;

alter table public.houses
  alter column id type text using id::text;
alter table public.houses
  alter column id set default gen_random_uuid()::text;

alter table public.house_photos
  alter column house_id type text using house_id::text;
alter table public.contacts
  alter column house_id type text using house_id::text;

alter table public.house_photos
  add constraint house_photos_house_id_fkey
  foreign key (house_id) references public.houses(id)
  on delete cascade;
alter table public.contacts
  add constraint contacts_house_id_fkey
  foreign key (house_id) references public.houses(id)
  on delete set null;

-- Champs du formulaire absents du schéma d'origine
alter table public.houses add column if not exists street text;
alter table public.houses add column if not exists avenue text;
alter table public.houses add column if not exists reference text;
alter table public.houses add column if not exists house_type text;
alter table public.houses add column if not exists bedrooms integer default 0;
alter table public.houses add column if not exists kitchens integer default 0;
alter table public.houses add column if not exists living_rooms integer default 0;
alter table public.houses add column if not exists shower_in_house boolean default true;
alter table public.houses add column if not exists showers integer default 0;
alter table public.houses add column if not exists houses_on_plot integer default 1;
alter table public.houses add column if not exists owner_name text;
alter table public.houses add column if not exists show_owner_name boolean default true;
alter table public.houses add column if not exists videos jsonb not null default '[]'::jsonb;
alter table public.houses add column if not exists contacts integer default 0;

-- Lecture publique (feed + fiches) ; écritures réservées au serveur.
create policy houses_select_public on public.houses
  for select using (true);

create policy house_photos_select_public on public.house_photos
  for select using (true);