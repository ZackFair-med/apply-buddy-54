CREATE TABLE public.match_history (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cv_id uuid REFERENCES public.cvs(id) ON DELETE SET NULL,
  job_id uuid REFERENCES public.jobs(id) ON DELETE SET NULL,
  job_title text,
  company text,
  match_score integer NOT NULL,
  strengths text[] NOT NULL DEFAULT '{}',
  weaknesses text[] NOT NULL DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.match_history TO authenticated;
GRANT ALL ON public.match_history TO service_role;
ALTER TABLE public.match_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own match history" ON public.match_history FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX match_history_user_created_idx ON public.match_history (user_id, created_at DESC);