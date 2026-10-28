BEGIN;

CREATE EXTENSION IF NOT EXISTS btree_gist WITH SCHEMA extensions;

CREATE TABLE public.couples (
  id    TEXT PRIMARY KEY
        CONSTRAINT couples_id_check
        CHECK (id IN ('couple-1', 'couple-2', 'couple-3', 'couple-4', 'admin')),
  label TEXT NOT NULL
        CONSTRAINT couples_label_check
        CHECK (char_length(btrim(label)) BETWEEN 1 AND 100)
);

ALTER TABLE public.couples ENABLE ROW LEVEL SECURITY;

-- Labels are edited in the Supabase dashboard only; no write policies.
CREATE POLICY "authenticated users can read couples"
  ON public.couples FOR SELECT
  TO authenticated
  USING (true);

INSERT INTO public.couples (id, label) VALUES
  ('couple-1', 'Couple 1'),
  ('couple-2', 'Couple 2'),
  ('couple-3', 'Couple 3'),
  ('couple-4', 'Couple 4'),
  ('admin', 'Admin');

ALTER TABLE public.profiles
  ADD COLUMN couple TEXT REFERENCES public.couples (id);

ALTER TABLE public.visits
  ADD COLUMN couple TEXT REFERENCES public.couples (id);

CREATE OR REPLACE FUNCTION public.require_visit_couple()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.couple IS NULL THEN
    RAISE EXCEPTION 'new visits must have a couple'
      USING ERRCODE = 'check_violation';
  END IF;

  IF TG_OP = 'UPDATE' AND OLD.couple IS NOT NULL AND NEW.couple IS NULL THEN
    RAISE EXCEPTION 'a visit couple cannot be removed'
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER visits_couple_required
  BEFORE INSERT OR UPDATE OF couple ON public.visits
  FOR EACH ROW EXECUTE FUNCTION public.require_visit_couple();

ALTER TABLE public.visits
  ADD CONSTRAINT visits_couple_no_overlap
  EXCLUDE USING gist (
    couple WITH =,
    daterange(date_from, date_to, '[]') WITH &&
  )
  WHERE (couple <> 'admin');

DROP POLICY IF EXISTS "authenticated users can insert visits" ON public.visits;

DROP POLICY IF EXISTS "admins can insert own visits" ON public.visits;
CREATE POLICY "admins can insert own visits"
  ON public.visits FOR INSERT
  TO authenticated WITH CHECK ((SELECT public.is_admin()) AND (SELECT auth.uid()) = author_id);

CREATE OR REPLACE FUNCTION public.prevent_profile_role_self_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role AND auth.role() = 'authenticated' THEN
    RAISE EXCEPTION 'role changes are not permitted through the authenticated client';
  END IF;

  IF NEW.couple IS DISTINCT FROM OLD.couple AND auth.role() = 'authenticated' THEN
    RAISE EXCEPTION 'couple changes are not permitted through the authenticated client';
  END IF;

  RETURN NEW;
END;
$$;

COMMIT;
