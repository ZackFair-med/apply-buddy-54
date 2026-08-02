ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS target_title text,
  ADD COLUMN IF NOT EXISTS target_date date,
  ADD COLUMN IF NOT EXISTS target_salary_min integer,
  ADD COLUMN IF NOT EXISTS target_salary_max integer,
  ADD COLUMN IF NOT EXISTS target_salary_currency text DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS weekly_goal integer DEFAULT 5;