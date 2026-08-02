ALTER TABLE public.jobs ADD COLUMN cv_id uuid REFERENCES public.cvs(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS jobs_cv_id_idx ON public.jobs(cv_id);