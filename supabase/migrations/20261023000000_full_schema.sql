-- ============================================================
-- LOPANGO — Schéma complet consolidé
-- Projet Supabase : https://ijtjstlotvdygrrimogo.supabase.co
--
-- Remplace les anciennes migrations incrémentales (perdues avec
-- l'ancien projet). À exécuter une seule fois dans le SQL Editor
-- d'un projet Supabase NEUF.
-- ============================================================

create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- Tables
-- ------------------------------------------------------------

-- Annonces (source de vérité, lecture publique).
create table if not exists public.houses (
  id text primary key default gen_random_uuid()::text,
  owner_id uuid references auth.users (id) on delete set null,
  title text,
  description text,
  price integer,
  city text,
  neighborhood text,
  street text,
  avenue text,
  reference text,
  house_type text,
  bedrooms integer default 0,
  kitchens integer default 0,
  living_rooms integer default 0,
  shower_in_house boolean default true,
  showers integer default 0,
  houses_on_plot integer default 1,
  owner_name text,
  show_owner_name boolean default true,
  contact_phone text,
  status text default 'draft'
    check (status = any (array['draft', 'inactive', 'active', 'hidden'])),
  videos jsonb not null default '[]'::jsonb,
  contacts integer default 0,
  created_at timestamptz default now()
);

-- Photos rattachées à une annonce.
create table if not exists public.house_photos (
  house_id text not null references public.houses (id) on delete cascade,
  url text not null,
  position integer,
  primary key (house_id, url)
);

-- Profils utilisateurs (miroir de auth.users).
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  phone text,
  email text,
  role text default 'tenant',
  created_at timestamptz default now()
);

-- Démarcheurs (liste blanche) gérée par l'admin.
create table if not exists public.agents (
  id uuid primary key default gen_random_uuid(),
  phone text unique not null,
  label text,
  email text,
  active boolean default true,
  created_at timestamptz default now(),
  constraint agents_email_valid
    check (email is null or email = '' or email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$')
);

-- Annonces publiées par les démarcheurs (snapshot visible admin).
create table if not exists public.agent_houses (
  house_id text not null references public.houses (id) on delete cascade,
  agent_id uuid not null references public.agents (id) on delete cascade,
  title text,
  price integer,
  city text,
  neighborhood text,
  contact_phone text,
  published_at timestamptz default now(),
  primary key (house_id, agent_id)
);

-- Abonnements (tenant + owner).
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  role text not null check (role = any (array['tenant', 'owner'])),
  amount integer,
  status text default 'active'
    check (status = any (array['active', 'inactive', 'cancelled', 'expired'])),
  starts_at timestamptz,
  expires_at timestamptz,
  payment_method text,
  transaction_id text
);

-- Réclamations utilisateurs.
create table if not exists public.reclamations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  subject text,
  message text,
  status text default 'open'
    check (status = any (array['open', 'in_progress', 'resolved'])),
  admin_reply text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Messages de contact liés à une annonce (héritage).
create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  name text,
  phone text,
  message text,
  house_id text references public.houses (id) on delete set null,
  created_at timestamptz default now()
);

-- Compteurs de rate limiting (accès service_role uniquement).
create table if not exists public.rate_limit_buckets (
  key text primary key,
  hits integer default 0,
  resets_at timestamptz,
  updated_at timestamptz default now()
);

-- ------------------------------------------------------------
-- Row Level Security
-- ------------------------------------------------------------

alter table public.houses enable row level security;
alter table public.house_photos enable row level security;
alter table public.profiles enable row level security;
alter table public.agents enable row level security;
alter table public.agent_houses enable row level security;
alter table public.subscriptions enable row level security;
alter table public.reclamations enable row level security;
alter table public.contacts enable row level security;
alter table public.rate_limit_buckets enable row level security;

-- Lecture publique du catalogue (feed + fiches).
drop policy if exists houses_select_public on public.houses;
create policy houses_select_public on public.houses
  for select using (true);

drop policy if exists house_photos_select_public on public.house_photos;
create policy house_photos_select_public on public.house_photos
  for select using (true);

-- Profil : un utilisateur connecté lit le sien.
drop policy if exists profiles_select_self on public.profiles;
create policy profiles_select_self on public.profiles
  for select using (id = auth.uid());

-- Abonnement : un utilisateur connecté lit le sien.
drop policy if exists subscriptions_select_self on public.subscriptions;
create policy subscriptions_select_self on public.subscriptions
  for select using (user_id = auth.uid());

-- Réclamations : l'utilisateur crée et lit les siennes.
drop policy if exists reclamations_insert_self on public.reclamations;
create policy reclamations_insert_self on public.reclamations
  for insert with check (user_id = auth.uid());

drop policy if exists reclamations_select_self on public.reclamations;
create policy reclamations_select_self on public.reclamations
  for select using (user_id = auth.uid());

-- Écritures annonces/agents/profils : service_role uniquement
-- (bypass RLS). Aucune policy anon/authenticated n'est créée.

-- ------------------------------------------------------------
-- Fonction RPC : rate limiting atomique (service_role)
-- ------------------------------------------------------------

create or replace function public.consume_rate_limit(
  p_key text,
  p_limit integer,
  p_window_sec integer
) returns boolean
language sql
security definer
set search_path = public
as $$
  with upsert as (
    insert into public.rate_limit_buckets (key, hits, resets_at, updated_at)
    values (
      p_key,
      1,
      now() + (p_window_sec * interval '1 second'),
      now()
    )
    on conflict (key) do update
      set hits = case
            when public.rate_limit_buckets.resets_at <= now() then 1
            else public.rate_limit_buckets.hits + 1
          end,
          resets_at = case
            when public.rate_limit_buckets.resets_at <= now()
              then now() + (p_window_sec * interval '1 second')
            else public.rate_limit_buckets.resets_at
          end,
          updated_at = now()
    returning hits
  )
  select hits <= p_limit from upsert;
$$;

revoke execute on function public.consume_rate_limit(text, integer, integer) from anon;
revoke execute on function public.consume_rate_limit(text, integer, integer) from authenticated;