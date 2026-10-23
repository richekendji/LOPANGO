-- Supabase Schema Migration
-- Generated for new Supabase project
-- Project: https://ijtjstlotvdygrrimogo.supabase.co

-- Enable required extensions
create extension if not exists "pgcrypto";

-- Create tables

-- Houses table
create table if not exists houses (
  id text primary key default gen_random_uuid()::text,
  owner_id uuid,
  title text not null,
  description text,
  price integer,
  city text,
  neighborhood text,
  street text,
  avenue text,
  reference text,
  house_type text,
  bedrooms integer,
  kitchens integer,
  living_rooms integer,
  shower_in_house boolean default true,
  showers integer,
  houses_on_plot integer default 1,
  owner_name text,
  show_owner_name boolean default true,
  contact_phone text,
  status text check (status in ('draft', 'inactive', 'active', 'hidden')) default 'draft',
  videos jsonb default '[]',
  contacts integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- House photos table
create table if not exists house_photos (
  house_id text references houses(id) on delete cascade,
  url text not null,
  position integer not null,
  primary key (house_id, url)
);

-- Profiles table
create table if not exists profiles (
  id uuid primary key references auth.users,
  full_name text,
  phone text,
  email text,
  role text check (role in ('tenant', 'owner', 'admin')) default 'tenant',
  created_at timestamptz default now()
);

-- Agents table
create table if not exists agents (
  id uuid primary key default gen_random_uuid(),
  phone text unique not null,
  label text,
  email text,
  active boolean default true,
  created_at timestamptz default now()
);

-- Agent houses table
create table if not exists agent_houses (
  house_id text references houses(id) on delete cascade,
  agent_id uuid references agents(id) on delete cascade,
  title text,
  price integer,
  city text,
  neighborhood text,
  contact_phone text,
  published_at timestamptz default now(),
  primary key (house_id, agent_id)
);

-- Subscriptions table
create table if not exists subscriptions (
  id uuid primary key,
  user_id uuid references auth.users,
  role text check (role in ('tenant', 'owner')) not null,
  amount integer,
  status text default 'active' check (status in ('active', 'inactive', 'cancelled', 'expired')),
  starts_at timestamptz,
  expires_at timestamptz,
  payment_method text,
  transaction_id text
);

-- Reclamations table
create table if not exists reclamations (
  id uuid primary key,
  user_id uuid references auth.users,
  subject text,
  message text,
  status text default 'open' check (status in ('open', 'in_progress', 'resolved')),
  admin_reply text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Rate limit buckets table
create table if not exists rate_limit_buckets (
  key text primary key,
  hits integer default 0,
  resets_at timestamptz,
  updated_at timestamptz default now()
);

-- Enable RLS on all tables
alter table houses enable row level security;
alter table house_photos enable row level security;
alter table profiles enable row level security;
alter table agents enable row level security;
alter table agent_houses enable row level security;
alter table subscriptions enable row level security;
alter table reclamations enable row level security;
alter table rate_limit_buckets enable row level security;

-- Policies

-- Houses policies
create policy "Select public" on houses for select using (true);
-- No insert/update/delete for anon (service_role bypasses)

-- House photos policies
create policy "Select public" on house_photos for select using (true);
-- No insert/update/delete for anon (service_role bypasses)

-- Profiles policies
create policy "Select self" on profiles for select using (id = auth.uid());

-- Subscriptions policies
create policy "Select own" on subscriptions for select using (user_id = auth.uid());

-- Reclamations policies
create policy "Insert own" on reclamations for insert with check (user_id = auth.uid());
create policy "Select own" on reclamations for select using (user_id = auth.uid());

-- Agent houses policies
create policy "Select public" on agent_houses for select using (true);
-- No insert/update/delete for anon (service_role bypasses)

-- Rate limit buckets policies
create policy "Service role only" on rate_limit_buckets for all using (false);
-- Service role only, bypasses all RLS

-- Functions

-- Rate limit function
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
    insert into rate_limit_buckets (key, hits, resets_at, updated_at)
    values (
      p_key,
      1,
      now() + (p_window_sec * interval '1 second'),
      now()
    )
    on conflict (key) do update
      set hits = case
        when rate_limit_buckets.resets_at <= now()
          then 1
          else rate_limit_buckets.hits + 1
        end,
        resets_at = case
          when rate_limit_buckets.resets_at <= now()
            then now() + (p_window_sec * interval '1 second')
            else rate_limit_buckets.resets_at
          end,
        updated_at = now()
    returning hits, resets_at
  )
  select hits <= p_limit from upsert;
$$;

-- Revoke execute on function from anon and authenticated
revoke execute on function public.consume_rate_limit from anon;
revoke execute on function public.consume_rate_limit from authenticated;