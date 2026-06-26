DROP POLICY IF EXISTS waitlist_insert_any ON public.waitlist;
CREATE POLICY waitlist_insert_any ON public.waitlist
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    email IS NOT NULL
    AND char_length(email) <= 320
    AND char_length(email) >= 3
    AND (note IS NULL OR char_length(note) <= 1000)
    AND (interest IS NULL OR char_length(interest) <= 64)
  );