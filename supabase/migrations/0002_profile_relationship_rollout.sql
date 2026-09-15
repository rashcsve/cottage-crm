-- Align older projects with the profile-based schema expected by the app.
-- Existing row UUIDs stay the same; only the foreign-key targets change.

BEGIN;

-- Backfill any missing profiles before rewiring foreign keys.
INSERT INTO public.profiles (id, display_name, role)
SELECT
  users.id,
  COALESCE(users.raw_user_meta_data->>'display_name', split_part(users.email, '@', 1)),
  'viewer'
FROM auth.users AS users
ON CONFLICT (id) DO NOTHING;

-- Replace auth.users foreign keys with public.profiles foreign keys.
ALTER TABLE public.visits
  DROP CONSTRAINT IF EXISTS visits_author_id_fkey;

ALTER TABLE public.shopping_items
  DROP CONSTRAINT IF EXISTS shopping_items_author_id_fkey;

ALTER TABLE public.shopping_items
  DROP CONSTRAINT IF EXISTS shopping_items_brought_by_id_fkey;

ALTER TABLE public.tasks
  DROP CONSTRAINT IF EXISTS tasks_author_id_fkey;

ALTER TABLE public.notes
  DROP CONSTRAINT IF EXISTS notes_author_id_fkey;

ALTER TABLE public.visits
  ADD CONSTRAINT visits_author_id_fkey
  FOREIGN KEY (author_id) REFERENCES public.profiles (id);

ALTER TABLE public.shopping_items
  ADD CONSTRAINT shopping_items_author_id_fkey
  FOREIGN KEY (author_id) REFERENCES public.profiles (id);

ALTER TABLE public.shopping_items
  ADD CONSTRAINT shopping_items_brought_by_id_fkey
  FOREIGN KEY (brought_by_id) REFERENCES public.profiles (id);

ALTER TABLE public.tasks
  ADD CONSTRAINT tasks_author_id_fkey
  FOREIGN KEY (author_id) REFERENCES public.profiles (id);

ALTER TABLE public.notes
  ADD CONSTRAINT notes_author_id_fkey
  FOREIGN KEY (author_id) REFERENCES public.profiles (id);

-- The app now reads display names through profiles, so the denormalized copies
-- can be removed once every table points at profiles.
ALTER TABLE public.visits
  DROP COLUMN IF EXISTS author;

ALTER TABLE public.shopping_items
  DROP COLUMN IF EXISTS author,
  DROP COLUMN IF EXISTS brought_by;

ALTER TABLE public.notes
  DROP COLUMN IF EXISTS author;

-- Bring older databases in line with the current integrity and performance
-- helpers that were added after the original schema shipped.
ALTER TABLE public.visits
  DROP CONSTRAINT IF EXISTS visits_date_range_check;

ALTER TABLE public.visits
  ADD CONSTRAINT visits_date_range_check
  CHECK (date_to >= date_from);

CREATE INDEX IF NOT EXISTS visits_date_from_idx
  ON public.visits (date_from);

CREATE INDEX IF NOT EXISTS shopping_items_created_at_idx
  ON public.shopping_items (created_at DESC);

CREATE INDEX IF NOT EXISTS tasks_author_id_idx
  ON public.tasks (author_id);

CREATE INDEX IF NOT EXISTS tasks_assignee_id_idx
  ON public.tasks (assignee_id);

CREATE INDEX IF NOT EXISTS tasks_created_at_idx
  ON public.tasks (created_at DESC);

CREATE INDEX IF NOT EXISTS notes_created_at_idx
  ON public.notes (created_at DESC);

CREATE INDEX IF NOT EXISTS note_photos_note_id_idx
  ON public.note_photos (note_id);

CREATE OR REPLACE FUNCTION public.prevent_profile_role_self_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role AND auth.role() = 'authenticated' THEN
    RAISE EXCEPTION 'role changes are not permitted through the authenticated client';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_profile_role_self_escalation ON public.profiles;
CREATE TRIGGER prevent_profile_role_self_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_profile_role_self_escalation();

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tasks_set_updated_at ON public.tasks;
CREATE TRIGGER tasks_set_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

COMMIT;
