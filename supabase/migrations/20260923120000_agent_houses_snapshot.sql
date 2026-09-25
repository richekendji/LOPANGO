-- Snapshot des annonces publiées par les démarcheurs (visibles côté admin)
alter table public.agent_houses
  add column if not exists title text;
alter table public.agent_houses
  add column if not exists price integer;
alter table public.agent_houses
  add column if not exists city text;
alter table public.agent_houses
  add column if not exists neighborhood text;
alter table public.agent_houses
  add column if not exists contact_phone text;
alter table public.agent_houses
  add column if not exists published_at timestamptz default now();