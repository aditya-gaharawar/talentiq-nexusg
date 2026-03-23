
-- Add extracted_resume_text to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS extracted_resume_text text;

-- Create resume_analysis table
CREATE TABLE IF NOT EXISTS public.resume_analysis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resume_url text,
  detected_skills text[] DEFAULT '{}',
  projects jsonb DEFAULT '[]',
  strengths text[] DEFAULT '{}',
  weaknesses text[] DEFAULT '{}',
  resume_score numeric DEFAULT 0,
  summary text,
  improvement_suggestions jsonb DEFAULT '[]',
  suggested_skills text[] DEFAULT '{}',
  suggested_projects text[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(student_id)
);

ALTER TABLE public.resume_analysis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own analysis" ON public.resume_analysis
  FOR SELECT TO authenticated USING (auth.uid() = student_id);

CREATE POLICY "Service role can manage analysis" ON public.resume_analysis
  FOR ALL TO authenticated USING (auth.uid() = student_id) WITH CHECK (auth.uid() = student_id);

-- Allow upsert from edge function (service role bypasses RLS)
