-- Give OAuth (Google) sign-ups a display name from full_name / name metadata.
-- Only the function changes; the trigger and existing profiles are untouched.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, role)
  VALUES (
    NEW.id,
    left(
      COALESCE(
        NULLIF(btrim(NEW.raw_user_meta_data->>'display_name'), ''),
        NULLIF(btrim(NEW.raw_user_meta_data->>'full_name'), ''),
        NULLIF(btrim(NEW.raw_user_meta_data->>'name'), ''),
        NULLIF(split_part(NEW.email, '@', 1), ''),
        'user'
      ),
      100
    ),
    'viewer'
  );
  RETURN NEW;
END;
$$;
