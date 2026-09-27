-- L'application utilise les statuts « draft » (brouillon), « active »,
-- « inactive » et « hidden » (annonce masquée par le vendeur). La contrainte
-- initiale ne tolérait que « active »/« inactive » et provoquait une erreur
-- d'enregistrement (violation de contrainte) dès qu'un brouillon ou une
-- annonce masquée était sauvegardé(e).
ALTER TABLE public.houses
  DROP CONSTRAINT IF EXISTS houses_status_check,
  ADD CONSTRAINT houses_status_check
    CHECK (status = ANY (ARRAY['draft'::text, 'inactive'::text, 'active'::text, 'hidden'::text]));