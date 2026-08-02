CREATE TYPE public.ai_task_type AS ENUM ('match_score', 'keywords', 'cover_letter');

CREATE TABLE public.usage_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_type public.ai_task_type NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX usage_logs_user_task_created_idx
  ON public.usage_logs (user_id, task_type, created_at DESC);

GRANT SELECT, INSERT ON public.usage_logs TO authenticated;
GRANT ALL ON public.usage_logs TO service_role;

ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own usage read" ON public.usage_logs
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "own usage insert" ON public.usage_logs
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);