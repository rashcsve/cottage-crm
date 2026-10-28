-- Notes security baseline: only admins create or delete notes and note photos,
-- and the note-photos bucket and its storage policies live here instead of the
-- dashboard. Reads are unchanged. Apply on demo first.

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = (SELECT auth.uid()) AND role = 'admin'
  );
$$;


-- ── NOTES ────────────────────────────────────────────────────

DROP POLICY IF EXISTS "authenticated users can insert notes" ON public.notes;
DROP POLICY IF EXISTS "authenticated users can delete notes" ON public.notes;

DROP POLICY IF EXISTS "admins can insert own notes" ON public.notes;
CREATE POLICY "admins can insert own notes"
  ON public.notes FOR INSERT
  TO authenticated WITH CHECK ((SELECT public.is_admin()) AND (SELECT auth.uid()) = author_id);

DROP POLICY IF EXISTS "admins can delete notes" ON public.notes;
CREATE POLICY "admins can delete notes"
  ON public.notes FOR DELETE
  TO authenticated USING ((SELECT public.is_admin()));


-- ── NOTE PHOTOS ──────────────────────────────────────────────

DROP POLICY IF EXISTS "authenticated users can insert note photos" ON public.note_photos;
DROP POLICY IF EXISTS "authenticated users can delete note photos" ON public.note_photos;

DROP POLICY IF EXISTS "admins can insert note photos" ON public.note_photos;
CREATE POLICY "admins can insert note photos"
  ON public.note_photos FOR INSERT
  TO authenticated WITH CHECK ((SELECT public.is_admin()));

DROP POLICY IF EXISTS "admins can delete note photos" ON public.note_photos;
CREATE POLICY "admins can delete note photos"
  ON public.note_photos FOR DELETE
  TO authenticated USING ((SELECT public.is_admin()));


-- ── NOTE-PHOTOS BUCKET ───────────────────────────────────────

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'note-photos',
  'note-photos',
  false,
  1048576,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;


-- ── NOTE-PHOTOS STORAGE POLICIES ─────────────────────────────
-- The dashboard-created policies have generated names that differ per
-- project, so they are found by their bucket condition.

DO $$
DECLARE
  existing record;
BEGIN
  FOR existing IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND concat(qual, with_check) LIKE '%note-photos%'
  LOOP
    RAISE NOTICE 'Dropping storage.objects policy %', existing.policyname;
    EXECUTE format('DROP POLICY %I ON storage.objects', existing.policyname);
  END LOOP;
END $$;

DROP POLICY IF EXISTS "note photos: authenticated can read" ON storage.objects;
CREATE POLICY "note photos: authenticated can read"
  ON storage.objects FOR SELECT
  TO authenticated USING (bucket_id = 'note-photos');

DROP POLICY IF EXISTS "note photos: admins can upload" ON storage.objects;
CREATE POLICY "note photos: admins can upload"
  ON storage.objects FOR INSERT
  TO authenticated WITH CHECK (bucket_id = 'note-photos' AND (SELECT public.is_admin()));

DROP POLICY IF EXISTS "note photos: admins can delete" ON storage.objects;
CREATE POLICY "note photos: admins can delete"
  ON storage.objects FOR DELETE
  TO authenticated USING (bucket_id = 'note-photos' AND (SELECT public.is_admin()));

-- Restrictive guards: a leftover permissive policy the cleanup missed cannot
-- widen note-photos writes past admins.

DROP POLICY IF EXISTS "note photos: only admins can upload" ON storage.objects;
CREATE POLICY "note photos: only admins can upload"
  ON storage.objects AS RESTRICTIVE FOR INSERT
  TO public WITH CHECK (bucket_id <> 'note-photos' OR (SELECT public.is_admin()));

DROP POLICY IF EXISTS "note photos: only admins can delete" ON storage.objects;
CREATE POLICY "note photos: only admins can delete"
  ON storage.objects AS RESTRICTIVE FOR DELETE
  TO public USING (bucket_id <> 'note-photos' OR (SELECT public.is_admin()));
