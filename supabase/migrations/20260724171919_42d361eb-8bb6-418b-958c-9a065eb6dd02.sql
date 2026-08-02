ALTER TABLE public.profiles
  ADD COLUMN plan text NOT NULL DEFAULT 'free'
  CHECK (plan IN ('free', 'paid'));