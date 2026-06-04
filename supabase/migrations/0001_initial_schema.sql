-- ─────────────────────────────────────────────────────────────
-- Chata CRM — initial schema
-- Run this in the Supabase SQL Editor of a brand-new project.
-- ─────────────────────────────────────────────────────────────


-- ── 1. PROFILES ──────────────────────────────────────────────
-- One row per auth user.  Created automatically by the trigger
-- at the bottom of this file when a user signs up.

CREATE TABLE IF NOT EXISTS public.profiles (
  id           UUID        PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  display_name TEXT        NOT NULL,
  role         TEXT        NOT NULL DEFAULT 'viewer'
                           CHECK (role IN ('admin', 'viewer')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Any authenticated user can read profiles (needed for task author/assignee joins).
CREATE POLICY "authenticated users can read profiles"
  ON public.profiles FOR SELECT
  TO authenticated USING (true);

-- Users can update only their own display_name.
-- Role changes must be done directly in the Supabase dashboard.
CREATE POLICY "users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id);


-- ── 2. VISITS ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.visits (
  id           BIGSERIAL   PRIMARY KEY,
  visitor_name TEXT        NOT NULL,
  date_from    DATE        NOT NULL,
  date_to      DATE        NOT NULL,
  note         TEXT,
  author       TEXT        NOT NULL,
  author_id    UUID        NOT NULL REFERENCES auth.users,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated users can read visits"
  ON public.visits FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "authenticated users can insert visits"
  ON public.visits FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = author_id);

CREATE POLICY "authenticated users can delete visits"
  ON public.visits FOR DELETE
  TO authenticated USING (auth.uid() = author_id);


-- ── 3. SHOPPING ITEMS ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.shopping_items (
  id           BIGSERIAL   PRIMARY KEY,
  title        TEXT        NOT NULL,
  is_checked   BOOLEAN     NOT NULL DEFAULT false,
  author       TEXT        NOT NULL,
  author_id    UUID        NOT NULL REFERENCES auth.users,
  brought_by   TEXT,
  brought_by_id UUID       REFERENCES auth.users,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.shopping_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated users can read shopping items"
  ON public.shopping_items FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "authenticated users can insert shopping items"
  ON public.shopping_items FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = author_id);

CREATE POLICY "authenticated users can update shopping items"
  ON public.shopping_items FOR UPDATE
  TO authenticated USING (true);

CREATE POLICY "authenticated users can delete shopping items"
  ON public.shopping_items FOR DELETE
  TO authenticated USING (true);


-- ── 4. TASKS ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.tasks (
  id           BIGSERIAL   PRIMARY KEY,
  title        TEXT        NOT NULL,
  description  TEXT,
  status       TEXT        NOT NULL DEFAULT 'pending'
                           CHECK (status IN ('pending', 'done')),
  priority     TEXT        NOT NULL DEFAULT 'medium'
                           CHECK (priority IN ('high', 'medium', 'low')),
  due_date     DATE,
  author_id    UUID        NOT NULL REFERENCES auth.users,
  assignee_id  UUID        REFERENCES public.profiles (id),
  completed_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated users can read tasks"
  ON public.tasks FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "authenticated users can insert tasks"
  ON public.tasks FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = author_id);

CREATE POLICY "authenticated users can update tasks"
  ON public.tasks FOR UPDATE
  TO authenticated USING (true);

CREATE POLICY "authenticated users can delete tasks"
  ON public.tasks FOR DELETE
  TO authenticated USING (true);


-- ── 5. NOTES ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.notes (
  id         BIGSERIAL   PRIMARY KEY,
  content    TEXT        NOT NULL,
  author     TEXT        NOT NULL,
  author_id  UUID        NOT NULL REFERENCES auth.users,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated users can read notes"
  ON public.notes FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "authenticated users can insert notes"
  ON public.notes FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = author_id);

CREATE POLICY "authenticated users can delete notes"
  ON public.notes FOR DELETE
  TO authenticated USING (true);


-- ── 6. NOTE PHOTOS ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.note_photos (
  id           BIGSERIAL   PRIMARY KEY,
  note_id      BIGINT      NOT NULL REFERENCES public.notes (id) ON DELETE CASCADE,
  file_name    TEXT        NOT NULL,
  file_size    BIGINT      NOT NULL,
  mime_type    TEXT        NOT NULL,
  sort_order   INT         NOT NULL DEFAULT 0,
  storage_path TEXT        NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.note_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated users can read note photos"
  ON public.note_photos FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "authenticated users can insert note photos"
  ON public.note_photos FOR INSERT
  TO authenticated WITH CHECK (true);

CREATE POLICY "authenticated users can delete note photos"
  ON public.note_photos FOR DELETE
  TO authenticated USING (true);


-- ── 7. AUTO-CREATE PROFILE ON SIGN-UP ─────────────────────────
-- When Supabase Auth creates a new user, this trigger inserts a
-- matching row into profiles with role = 'viewer'.
-- To promote someone to admin: update their row in the dashboard.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    'viewer'
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
