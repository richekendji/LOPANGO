-- Ajoute l'email du démarcheur (notification de paiement) + contrainte de validité
alter table public.agents
  add column if not exists email text;

-- Email optionnel : soit vide/null, soit un email valide
alter table public.agents
  drop constraint if exists agents_email_valid;

alter table public.agents
  add constraint agents_email_valid
  check (email is null or email = '' or email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$');
